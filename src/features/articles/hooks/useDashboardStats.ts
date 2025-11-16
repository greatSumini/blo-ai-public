'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { DashboardStatsResponseSchema, type DashboardStatsResponse } from '@/features/articles/lib/dto';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async (): Promise<DashboardStatsResponse> => {
      const response = await apiClient.get('/api/articles/dashboard/stats');
      return DashboardStatsResponseSchema.parse(response.data);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
