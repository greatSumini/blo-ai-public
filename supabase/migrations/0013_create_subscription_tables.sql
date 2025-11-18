-- Migration: Create subscription, payment_methods, and payments tables
-- Supports TossPayments billing integration for subscription service
-- Must be idempotent and safe to run multiple times

BEGIN;

-- 1) Create subscription status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired', 'pending');
  END IF;
END$$;

-- 2) Create subscription plan enum (extends existing tier_type)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
    CREATE TYPE subscription_plan AS ENUM ('free', 'pro');
  END IF;
END$$;

-- 3) Create payment status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'done', 'failed', 'canceled');
  END IF;
END$$;

-- 4) Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',

  -- TossPayments billing info
  customer_key TEXT, -- TossPayments customer key for this organization
  billing_key TEXT, -- TossPayments billing key (encrypted payment info)

  -- Subscription dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_billing_date DATE,
  canceled_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One subscription per organization
  UNIQUE(organization_id)
);

-- Comments
COMMENT ON TABLE public.subscriptions IS 'Manages subscription plans and billing information per organization';
COMMENT ON COLUMN public.subscriptions.customer_key IS 'TossPayments customer key (unique per organization)';
COMMENT ON COLUMN public.subscriptions.billing_key IS 'TossPayments billing key for recurring payments';
COMMENT ON COLUMN public.subscriptions.status IS 'active: currently subscribed, canceled: will expire at period end, expired: no longer active, pending: awaiting first payment';
COMMENT ON COLUMN public.subscriptions.next_billing_date IS 'Next scheduled billing date (null for free plan or canceled)';
COMMENT ON COLUMN public.subscriptions.canceled_at IS 'When subscription was canceled (null if never canceled)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON public.subscriptions(next_billing_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_key ON public.subscriptions(customer_key);

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON public.subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- Disable RLS
ALTER TABLE IF EXISTS public.subscriptions DISABLE ROW LEVEL SECURITY;

-- 5) Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,

  -- Card information (from TossPayments response)
  billing_key TEXT NOT NULL,
  card_company TEXT,
  card_number TEXT, -- Masked (e.g., "1234****5678")
  card_type TEXT, -- '신용' or '체크'
  owner_type TEXT, -- '개인' or '법인'

  is_primary BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.payment_methods IS 'Stores payment method details for each subscription';
COMMENT ON COLUMN public.payment_methods.billing_key IS 'TossPayments billing key (matches subscriptions.billing_key)';
COMMENT ON COLUMN public.payment_methods.card_number IS 'Masked card number for display purposes';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_organization_id ON public.payment_methods(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_subscription_id ON public.payment_methods(subscription_id);

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_payment_methods_updated_at'
  ) THEN
    CREATE TRIGGER update_payment_methods_updated_at
      BEFORE UPDATE ON public.payment_methods
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- Disable RLS
ALTER TABLE IF EXISTS public.payment_methods DISABLE ROW LEVEL SECURITY;

-- 6) Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,

  -- TossPayments payment info
  payment_key TEXT, -- TossPayments payment key
  order_id TEXT NOT NULL, -- Unique order ID per payment
  order_name TEXT NOT NULL, -- e.g., "IndieBlog Pro 월간 구독"

  -- Payment details
  amount INTEGER NOT NULL, -- 결제 금액 (원)
  status payment_status NOT NULL DEFAULT 'pending',
  method TEXT, -- '카드'

  -- Card info (from payment response)
  card_company TEXT,
  card_number TEXT,

  -- Timestamps
  requested_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Error info
  failure_code TEXT,
  failure_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.payments IS 'Records all payment transactions for subscriptions';
COMMENT ON COLUMN public.payments.payment_key IS 'TossPayments payment key (unique per payment)';
COMMENT ON COLUMN public.payments.order_id IS 'Merchant order ID (must be unique)';
COMMENT ON COLUMN public.payments.status IS 'pending: awaiting payment, done: successful, failed: payment failed, canceled: payment canceled';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_organization_id ON public.payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_key ON public.payments(payment_key);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_approved_at ON public.payments(approved_at DESC);

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at'
  ) THEN
    CREATE TRIGGER update_payments_updated_at
      BEFORE UPDATE ON public.payments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- Disable RLS
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;

-- 7) Update generation_quota table
-- Add monthly_limit column to track quota limits per plan
ALTER TABLE IF EXISTS public.generation_quota
  ADD COLUMN IF NOT EXISTS monthly_limit INTEGER NOT NULL DEFAULT 3;

-- Add remaining_count column for easier querying
ALTER TABLE IF EXISTS public.generation_quota
  ADD COLUMN IF NOT EXISTS remaining_count INTEGER NOT NULL DEFAULT 3;

-- Add current_period_start and current_period_end columns for tracking billing periods
ALTER TABLE IF EXISTS public.generation_quota
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.generation_quota
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Update existing rows
UPDATE public.generation_quota
SET monthly_limit = CASE
    WHEN tier = 'free' THEN 3
    WHEN tier = 'pro' THEN 20
    ELSE 3
  END,
  remaining_count = CASE
    WHEN tier = 'free' THEN 3 - generation_count
    WHEN tier = 'pro' THEN 20 - generation_count
    ELSE 3 - generation_count
  END,
  current_period_start = COALESCE(current_period_start, NOW()),
  current_period_end = COALESCE(current_period_end, NOW() + INTERVAL '1 month')
WHERE monthly_limit IS NULL OR remaining_count IS NULL OR current_period_start IS NULL OR current_period_end IS NULL;

COMMENT ON COLUMN public.generation_quota.monthly_limit IS 'Monthly generation limit based on subscription plan (free: 3, pro: 20)';
COMMENT ON COLUMN public.generation_quota.remaining_count IS 'Remaining generations in current period (monthly_limit - generation_count)';
COMMENT ON COLUMN public.generation_quota.current_period_start IS 'Start of current billing period';
COMMENT ON COLUMN public.generation_quota.current_period_end IS 'End of current billing period';

-- 8) Create initial free subscriptions for all existing organizations
-- Only create if organization doesn't have a subscription yet
DO $$
DECLARE
  org_record RECORD;
  new_customer_key TEXT;
BEGIN
  FOR org_record IN
    SELECT id
    FROM public.organizations
    WHERE NOT EXISTS (
      SELECT 1 FROM public.subscriptions s WHERE s.organization_id = organizations.id
    )
  LOOP
    -- Generate unique customer key for TossPayments
    new_customer_key := 'cust_' || REPLACE(org_record.id::text, '-', '');

    -- Create free subscription
    INSERT INTO public.subscriptions (
      organization_id,
      plan,
      status,
      customer_key,
      current_period_start,
      current_period_end
    )
    VALUES (
      org_record.id,
      'free',
      'active',
      new_customer_key,
      NOW(),
      NOW() + INTERVAL '100 years' -- Free plan never expires
    );
  END LOOP;
END$$;

-- 9) Sync generation_quota tier with subscription plan
-- Ensure tier matches subscription plan
UPDATE public.generation_quota gq
SET tier = s.plan::text::tier_type
FROM public.subscriptions s
WHERE gq.organization_id = s.organization_id
  AND gq.tier::text != s.plan::text;

COMMIT;
