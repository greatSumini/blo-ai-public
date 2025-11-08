-- Migration: Introduce profiles table and migrate clerk_user_id references
-- Must be idempotent and safe to run multiple times.

BEGIN;

-- Ensure required extension exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Create a reusable updated_at trigger function if not present
-- Create or replace updated_at trigger helper (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 2) Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful comments
COMMENT ON TABLE public.profiles IS 'Stores one row per Clerk user. Other tables reference profiles.id instead of clerk_user_id.';
COMMENT ON COLUMN public.profiles.clerk_user_id IS 'Clerk user ID (unique). This is the only direct dependency on Clerk across the DB.';

-- Index for quick lookup by Clerk ID
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- Disable RLS
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- 3) Backfill profiles from existing tables
-- Insert distinct Clerk IDs from style_guides, generation_quota, articles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='style_guides' AND column_name='clerk_user_id'
  ) THEN
    INSERT INTO public.profiles (clerk_user_id)
    SELECT DISTINCT sg.clerk_user_id FROM public.style_guides sg
    ON CONFLICT (clerk_user_id) DO NOTHING;
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='generation_quota' AND column_name='clerk_user_id'
  ) THEN
    INSERT INTO public.profiles (clerk_user_id)
    SELECT DISTINCT gq.clerk_user_id FROM public.generation_quota gq
    ON CONFLICT (clerk_user_id) DO NOTHING;
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='articles' AND column_name='clerk_user_id'
  ) THEN
    INSERT INTO public.profiles (clerk_user_id)
    SELECT DISTINCT a.clerk_user_id FROM public.articles a
    ON CONFLICT (clerk_user_id) DO NOTHING;
  END IF;
END$$;

-- 4) Migrate style_guides.clerk_user_id -> style_guides.profile_id
-- Add profile_id
ALTER TABLE IF EXISTS public.style_guides
  ADD COLUMN IF NOT EXISTS profile_id UUID;

-- Backfill profile_id from profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='style_guides' AND column_name='clerk_user_id'
  ) THEN
    UPDATE public.style_guides sg
    SET profile_id = p.id
    FROM public.profiles p
    WHERE sg.profile_id IS NULL AND p.clerk_user_id = sg.clerk_user_id;
  ELSE
    -- If old column no longer exists, no-op
    NULL;
  END IF;
END$$;

-- Add NOT NULL and UNIQUE constraints safely
DO $$
BEGIN
  -- Set NOT NULL when all rows are populated
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'style_guides' AND column_name = 'profile_id'
  ) THEN
    -- Ensure no NULLs remain
    IF NOT EXISTS (
      SELECT 1 FROM public.style_guides WHERE profile_id IS NULL
    ) THEN
      ALTER TABLE public.style_guides ALTER COLUMN profile_id SET NOT NULL;
    END IF;
  END IF;

  -- Add UNIQUE on profile_id if not exists (one guide per user for MVP)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'style_guides_profile_id_key'
  ) THEN
    ALTER TABLE public.style_guides ADD CONSTRAINT style_guides_profile_id_key UNIQUE (profile_id);
  END IF;

  -- Add FK if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'style_guides_profile_id_fkey'
  ) THEN
    ALTER TABLE public.style_guides
      ADD CONSTRAINT style_guides_profile_id_fkey
      FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Index for profile_id
CREATE INDEX IF NOT EXISTS idx_style_guides_profile_id ON public.style_guides(profile_id);

-- Drop old index and column if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_style_guides_clerk_user_id'
  ) THEN
    DROP INDEX public.idx_style_guides_clerk_user_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='style_guides' AND column_name='clerk_user_id'
  ) THEN
    ALTER TABLE public.style_guides DROP COLUMN clerk_user_id;
  END IF;
END$$;

-- 5) Migrate articles.clerk_user_id -> articles.profile_id
ALTER TABLE IF EXISTS public.articles
  ADD COLUMN IF NOT EXISTS profile_id UUID;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='articles' AND column_name='clerk_user_id'
  ) THEN
    UPDATE public.articles a
    SET profile_id = p.id
    FROM public.profiles p
    WHERE a.profile_id IS NULL AND p.clerk_user_id = a.clerk_user_id;
  ELSE
    NULL;
  END IF;
END$$;

DO $$
BEGIN
  -- Ensure NOT NULL when possible
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'articles' AND column_name = 'profile_id'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.articles WHERE profile_id IS NULL
    ) THEN
      ALTER TABLE public.articles ALTER COLUMN profile_id SET NOT NULL;
    END IF;
  END IF;

  -- Add FK if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'articles_profile_id_fkey'
  ) THEN
    ALTER TABLE public.articles
      ADD CONSTRAINT articles_profile_id_fkey
      FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Replace indexes
CREATE INDEX IF NOT EXISTS idx_articles_profile_id ON public.articles(profile_id);
-- Composite index for published articles by profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_articles_profile_published'
  ) THEN
    CREATE INDEX idx_articles_profile_published
      ON public.articles(profile_id, status, published_at DESC)
      WHERE status = 'published';
  END IF;
END$$;

-- Drop old indexes and column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_articles_clerk_user_id'
  ) THEN
    DROP INDEX public.idx_articles_clerk_user_id;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_articles_user_published'
  ) THEN
    DROP INDEX public.idx_articles_user_published;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='articles' AND column_name='clerk_user_id'
  ) THEN
    ALTER TABLE public.articles DROP COLUMN clerk_user_id;
  END IF;
END$$;

-- 6) Migrate generation_quota.clerk_user_id -> generation_quota.profile_id
ALTER TABLE IF EXISTS public.generation_quota
  ADD COLUMN IF NOT EXISTS profile_id UUID;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='generation_quota' AND column_name='clerk_user_id'
  ) THEN
    UPDATE public.generation_quota gq
    SET profile_id = p.id
    FROM public.profiles p
    WHERE gq.profile_id IS NULL AND p.clerk_user_id = gq.clerk_user_id;
  ELSE
    NULL;
  END IF;
END$$;

DO $$
BEGIN
  -- Ensure NOT NULL and UNIQUE
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'generation_quota' AND column_name = 'profile_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM public.generation_quota WHERE profile_id IS NULL) THEN
      ALTER TABLE public.generation_quota ALTER COLUMN profile_id SET NOT NULL;
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'generation_quota_profile_id_key'
  ) THEN
    ALTER TABLE public.generation_quota ADD CONSTRAINT generation_quota_profile_id_key UNIQUE (profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'generation_quota_profile_id_fkey'
  ) THEN
    ALTER TABLE public.generation_quota
      ADD CONSTRAINT generation_quota_profile_id_fkey
      FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_generation_quota_profile_id ON public.generation_quota(profile_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_generation_quota_clerk_user_id'
  ) THEN
    DROP INDEX public.idx_generation_quota_clerk_user_id;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='generation_quota' AND column_name='clerk_user_id'
  ) THEN
    ALTER TABLE public.generation_quota DROP COLUMN clerk_user_id;
  END IF;
END$$;

COMMIT;
