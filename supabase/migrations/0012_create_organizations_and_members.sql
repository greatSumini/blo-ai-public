-- Migration: Create organizations and organization_members tables
-- Automatically create personal organizations for existing users
-- Must be idempotent and safe to run multiple times

BEGIN;

-- 1) Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.organizations IS 'Organizations that users can create and manage. Each org has one owner.';
COMMENT ON COLUMN public.organizations.owner_id IS 'Profile ID of the organization owner (creator).';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_organizations_updated_at'
  ) THEN
    CREATE TRIGGER update_organizations_updated_at
      BEFORE UPDATE ON public.organizations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- Disable RLS
ALTER TABLE IF EXISTS public.organizations DISABLE ROW LEVEL SECURITY;

-- 2) Create organization_members table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One user cannot be in the same organization twice
  UNIQUE(organization_id, profile_id)
);

-- Comments
COMMENT ON TABLE public.organization_members IS 'Junction table for organization membership. Supports owner and member roles.';
COMMENT ON COLUMN public.organization_members.role IS 'User role in the organization: owner or member.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_profile_id ON public.organization_members(profile_id);

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_organization_members_updated_at'
  ) THEN
    CREATE TRIGGER update_organization_members_updated_at
      BEFORE UPDATE ON public.organization_members
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- Disable RLS
ALTER TABLE IF EXISTS public.organization_members DISABLE ROW LEVEL SECURITY;

-- 3) Add organization_id to existing tables
-- articles
ALTER TABLE IF EXISTS public.articles
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_articles_organization_id ON public.articles(organization_id);

-- style_guides
ALTER TABLE IF EXISTS public.style_guides
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_style_guides_organization_id ON public.style_guides(organization_id);

-- generation_quota
ALTER TABLE IF EXISTS public.generation_quota
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_generation_quota_organization_id ON public.generation_quota(organization_id);

-- account_settings
ALTER TABLE IF EXISTS public.account_settings
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_account_settings_organization_id ON public.account_settings(organization_id);

-- 4) Data migration: Create personal organizations for existing users
-- Only create if the profile doesn't already have an organization membership
DO $$
DECLARE
  profile_record RECORD;
  new_org_id UUID;
BEGIN
  FOR profile_record IN
    SELECT id, full_name, email
    FROM public.profiles
    WHERE NOT EXISTS (
      SELECT 1 FROM public.organization_members om WHERE om.profile_id = profiles.id
    )
  LOOP
    -- Create a personal organization for this profile
    INSERT INTO public.organizations (name, description, owner_id)
    VALUES (
      COALESCE(profile_record.full_name, profile_record.email, 'My Organization'),
      'Personal organization',
      profile_record.id
    )
    RETURNING id INTO new_org_id;

    -- Add the owner as a member with 'owner' role
    INSERT INTO public.organization_members (organization_id, profile_id, role)
    VALUES (new_org_id, profile_record.id, 'owner');
  END LOOP;
END$$;

-- 5) Backfill organization_id for existing records
-- articles: assign to the user's personal organization (where they are owner)
UPDATE public.articles a
SET organization_id = (
  SELECT om.organization_id
  FROM public.organization_members om
  WHERE om.profile_id = a.profile_id AND om.role = 'owner'
  LIMIT 1
)
WHERE organization_id IS NULL;

-- style_guides
UPDATE public.style_guides sg
SET organization_id = (
  SELECT om.organization_id
  FROM public.organization_members om
  WHERE om.profile_id = sg.profile_id AND om.role = 'owner'
  LIMIT 1
)
WHERE organization_id IS NULL;

-- generation_quota
UPDATE public.generation_quota gq
SET organization_id = (
  SELECT om.organization_id
  FROM public.organization_members om
  WHERE om.profile_id = gq.profile_id AND om.role = 'owner'
  LIMIT 1
)
WHERE organization_id IS NULL;

-- account_settings
UPDATE public.account_settings acs
SET organization_id = (
  SELECT om.organization_id
  FROM public.organization_members om
  WHERE om.profile_id = acs.profile_id AND om.role = 'owner'
  LIMIT 1
)
WHERE organization_id IS NULL;

-- 6) Set NOT NULL constraint on organization_id after backfill
-- Only if all records have been assigned
DO $$
BEGIN
  -- articles
  IF NOT EXISTS (SELECT 1 FROM public.articles WHERE organization_id IS NULL) THEN
    ALTER TABLE public.articles ALTER COLUMN organization_id SET NOT NULL;
  END IF;

  -- style_guides
  IF NOT EXISTS (SELECT 1 FROM public.style_guides WHERE organization_id IS NULL) THEN
    ALTER TABLE public.style_guides ALTER COLUMN organization_id SET NOT NULL;
  END IF;

  -- generation_quota
  IF NOT EXISTS (SELECT 1 FROM public.generation_quota WHERE organization_id IS NULL) THEN
    ALTER TABLE public.generation_quota ALTER COLUMN organization_id SET NOT NULL;
  END IF;

  -- account_settings
  IF NOT EXISTS (SELECT 1 FROM public.account_settings WHERE organization_id IS NULL) THEN
    ALTER TABLE public.account_settings ALTER COLUMN organization_id SET NOT NULL;
  END IF;
END$$;

COMMIT;
