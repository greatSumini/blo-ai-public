-- Migration: remove search_volume and cpc from keywords table
-- This migration is idempotent and safe to run multiple times.

do $$
begin
  begin
    alter table if exists public.keywords
      drop column if exists search_volume,
      drop column if exists cpc;
  exception
    when others then
      -- Log and continue instead of failing the whole migration
      raise notice '0008_remove_keyword_metrics.sql failed: %', sqlerrm;
  end;
end;
$$;

