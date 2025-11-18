-- Migration: Add UNIQUE constraint to payment_methods.organization_id
-- This ensures one organization can have only one payment method at a time
-- Must be idempotent and safe to run multiple times

BEGIN;

-- Add UNIQUE constraint to organization_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payment_methods_organization_id_key'
      AND conrelid = 'public.payment_methods'::regclass
  ) THEN
    ALTER TABLE public.payment_methods
      ADD CONSTRAINT payment_methods_organization_id_key UNIQUE (organization_id);
  END IF;
END$$;

COMMENT ON CONSTRAINT payment_methods_organization_id_key ON public.payment_methods IS 'Ensures one organization has only one payment method (one-to-one relationship)';

COMMIT;
