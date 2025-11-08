-- Migration: create style_guides table for storing user onboarding data
-- This table stores the brand voice, style preferences, and content guidelines
-- for each user to personalize their AI-generated content

-- Ensures pgcrypto available for gen_random_uuid
create extension if not exists "pgcrypto";

-- Create enum types for style guide fields
create type formality_level as enum ('casual', 'neutral', 'formal');
create type language_code as enum ('ko', 'en');
create type content_tone as enum ('professional', 'friendly', 'inspirational', 'educational');
create type content_length_preference as enum ('short', 'medium', 'long');
create type reading_level as enum ('beginner', 'intermediate', 'advanced');

-- Create style_guides table
create table if not exists public.style_guides (
  -- Primary key
  id uuid primary key default gen_random_uuid(),

  -- User reference (one style guide per user for MVP)
  clerk_user_id text not null unique,

  -- Brand Voice fields (Step 1)
  brand_name text not null,
  brand_description text not null,
  personality text[] not null check (array_length(personality, 1) between 1 and 3),
  formality formality_level not null default 'neutral',

  -- Target Audience fields (Step 2)
  target_audience text not null,
  pain_points text not null,

  -- Language field (Step 3)
  language language_code not null default 'ko',

  -- Style fields (Step 4)
  tone content_tone not null default 'professional',
  content_length content_length_preference not null default 'medium',
  reading_level reading_level not null default 'intermediate',

  -- Review/Notes field (Step 5)
  notes text,

  -- Metadata
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add index for faster lookups by user
create index if not exists idx_style_guides_clerk_user_id
  on public.style_guides(clerk_user_id);

-- Add helpful comments
comment on table public.style_guides is
  'Stores user onboarding data including brand voice, target audience, language preferences, and content style settings. Each user has one style guide for MVP.';

comment on column public.style_guides.clerk_user_id is
  'Reference to Clerk user ID. Unique constraint ensures one style guide per user in MVP.';

comment on column public.style_guides.personality is
  'Array of personality traits (1-3 items). Examples: innovative, trustworthy, playful, etc.';

comment on column public.style_guides.is_default is
  'Flag to mark this as the default style guide for the user. Always true for MVP (single guide per user).';

-- Create trigger function to auto-update updated_at timestamp
create or replace function update_style_guides_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger
create trigger set_style_guides_updated_at
  before update on public.style_guides
  for each row
  execute function update_style_guides_updated_at();

-- Disable Row Level Security (RLS)
-- Backend API uses service role key which bypasses RLS
alter table public.style_guides disable row level security;
