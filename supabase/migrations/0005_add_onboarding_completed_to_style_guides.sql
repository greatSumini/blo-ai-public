-- Migration: add onboarding_completed column to style_guides table
-- Replaces Clerk metadata with database source of truth for middleware onboarding checks
-- This solves Clerk's session cache delay issue

-- Add onboarding_completed column to style_guides table
ALTER TABLE IF EXISTS public.style_guides
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT true;

-- Add comment explaining the column
COMMENT ON COLUMN public.style_guides.onboarding_completed IS
  'Indicates whether the user has completed the onboarding process. Set to true when style guide is first created during onboarding.';

-- The column defaults to true because it is only created when a user completes onboarding,
-- so all existing and new records represent completed onboarding
