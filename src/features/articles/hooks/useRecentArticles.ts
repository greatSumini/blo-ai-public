'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { z } from 'zod';
import { ArticleResponseSchema, type ArticleResponse } from '@/features/articles/lib/dto';

interface UseRecentArticlesOptions {
  limit?: number;
}

const ListArticlesResponseSchema = z.object({
  articles: z.array(ArticleResponseSchema),
  total: z.number(),
});

export function useRecentArticles(options: UseRecentArticlesOptions = {}) {
  const limit = options.limit ?? 10;

  return useQuery({
    queryKey: ['articles', 'recent', limit],
    queryFn: async (): Promise<ArticleResponse[]> => {
      const response = await apiClient.get('/api/articles/recent', {
        params: { limit },
      });
      const parsed = ListArticlesResponseSchema.parse(response.data);
      return parsed.articles;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
