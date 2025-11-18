-- Migration: Setup billing cron job for recurring payments
-- This cron job runs daily at 02:00 KST (17:00 UTC previous day)
-- to process subscription billing for organizations

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1) Create function to trigger billing cron via HTTP request
CREATE OR REPLACE FUNCTION trigger_billing_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cron_secret TEXT;
  api_url TEXT;
  response_status INT;
BEGIN
  -- Get cron secret from vault (or environment)
  -- Note: You need to set this up in Supabase vault
  -- For now, we'll use pg_net to make HTTP request

  -- Construct API URL (adjust based on your deployment)
  api_url := current_setting('app.settings.api_base_url', true) || '/api/cron/billing';

  -- Make HTTP POST request to cron endpoint
  -- This will be handled by pg_net extension
  PERFORM
    net.http_post(
      url := api_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', current_setting('app.settings.cron_secret', true)
      ),
      body := '{}'::jsonb
    );

  RAISE NOTICE 'Billing cron triggered successfully';

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to trigger billing cron: %', SQLERRM;
END;
$$;

-- 2) Schedule cron job using pg_cron extension
-- Runs daily at 17:00 UTC (02:00 KST next day)
-- Note: pg_cron uses UTC timezone
SELECT cron.schedule(
  'daily-subscription-billing',  -- job name
  '0 17 * * *',                   -- cron expression: daily at 17:00 UTC (02:00 KST)
  $$SELECT trigger_billing_cron()$$
);

-- Add comment about the function
COMMENT ON FUNCTION trigger_billing_cron() IS 'Triggers the billing cron job via HTTP request to Next.js API. Scheduled to run daily at 17:00 UTC (02:00 KST next day) via pg_cron to process subscription renewals.';

COMMIT;

-- ============================================================================
-- MANUAL SETUP INSTRUCTIONS
-- ============================================================================
--
-- After running this migration, you need to:
--
-- 1. Enable pg_net extension in Supabase dashboard:
--    - Go to Database > Extensions
--    - Enable "pg_net" extension
--
-- 2. Set up Supabase vault secrets:
--    - Go to Settings > Vault
--    - Add secret "app.settings.api_base_url" with your API base URL
--      Example: "https://your-domain.com"
--    - Add secret "app.settings.cron_secret" with your CRON_SECRET_TOKEN
--      (should match the value in .env.local)
--
-- 3. Verify cron job is scheduled:
--    SELECT * FROM cron.job WHERE jobname = 'daily-subscription-billing';
--
-- 4. To manually trigger the cron (for testing):
--    SELECT trigger_billing_cron();
--
-- 5. To unschedule the cron job (if needed):
--    SELECT cron.unschedule('daily-subscription-billing');
--
-- ============================================================================
