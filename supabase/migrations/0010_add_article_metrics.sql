-- Migration: Add metrics columns to articles table
-- Adds views and time_spent columns for dashboard statistics

BEGIN;

-- Add views column (조회수)
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;

-- Add time_spent column (작성 소요 시간, 분 단위)
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS time_spent INTEGER NOT NULL DEFAULT 0;

-- Add comments
COMMENT ON COLUMN public.articles.views IS
  'Number of times this article has been viewed';

COMMENT ON COLUMN public.articles.time_spent IS
  'Time spent writing this article in minutes';

-- Add index for performance (views 기준 정렬 시 사용)
CREATE INDEX IF NOT EXISTS idx_articles_views
  ON public.articles(views DESC);

COMMIT;
