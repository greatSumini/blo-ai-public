'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { SubscriptionWithQuota } from '../lib/dto';

// ===========================
// Query Keys
// ===========================

export const subscriptionKeys = {
  all: ['subscription'] as const,
  detail: (organizationId: string) =>
    [...subscriptionKeys.all, 'detail', organizationId] as const,
};

// ===========================
// API Functions
// ===========================

const subscriptionApi = {
  /**
   * Get subscription details with quota for organization
   */
  getByOrganizationId: async (
    organizationId: string
  ): Promise<SubscriptionWithQuota> => {
    const response = await apiClient.get(
      `/api/subscriptions/${organizationId}`
    );
    return response.data;
  },
};

// ===========================
// Hooks
// ===========================

/**
 * Hook to get subscription details with quota for organization
 *
 * @param organizationId - The organization ID
 * @returns Query result with subscription and quota data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSubscription(organizationId);
 * if (data) {
 *   console.log(data.subscription.plan); // 'free' | 'pro'
 *   console.log(data.quota.remainingCount); // remaining generations
 * }
 * ```
 */
export function useSubscription(organizationId: string) {
  return useQuery({
    queryKey: subscriptionKeys.detail(organizationId),
    queryFn: () => subscriptionApi.getByOrganizationId(organizationId),
    enabled: !!organizationId,
  });
}
