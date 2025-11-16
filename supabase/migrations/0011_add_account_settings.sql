-- Account Settings Table
-- Purpose: Store user preferences for content generation and notifications
-- Author: Implementation Agent
-- Date: 2025-01-16

-- Create account_settings table
CREATE TABLE IF NOT EXISTS account_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_name TEXT,
  brand_description TEXT,
  target_audience TEXT,
  tone TEXT CHECK (tone IN ('friendly', 'professional', 'casual', 'formal')),
  language TEXT CHECK (language IN ('ko', 'en')),
  email_updates BOOLEAN NOT NULL DEFAULT true,
  weekly_report BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT account_settings_profile_id_unique UNIQUE (profile_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_account_settings_profile_id ON account_settings(profile_id);

-- Enable RLS (Row Level Security) - DISABLED per project requirements
ALTER TABLE account_settings DISABLE ROW LEVEL SECURITY;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_account_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_account_settings_updated_at
  BEFORE UPDATE ON account_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_account_settings_updated_at();

-- Add comment for documentation
COMMENT ON TABLE account_settings IS 'User preferences for AI content generation and notification settings';
COMMENT ON COLUMN account_settings.brand_name IS 'User brand or blog name';
COMMENT ON COLUMN account_settings.brand_description IS 'Description of brand personality and values';
COMMENT ON COLUMN account_settings.target_audience IS 'Target reader demographic';
COMMENT ON COLUMN account_settings.tone IS 'Preferred writing tone for AI-generated content';
COMMENT ON COLUMN account_settings.language IS 'Preferred language for content generation';
COMMENT ON COLUMN account_settings.email_updates IS 'Receive email notifications about new features';
COMMENT ON COLUMN account_settings.weekly_report IS 'Receive weekly activity summary';
