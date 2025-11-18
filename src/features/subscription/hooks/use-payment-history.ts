'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { GetPaymentsResponse } from '../lib/dto';

// ===========================
// Query Keys
// ===========================

export const paymentHistoryKeys = {
  all: ['paymentHistory'] as const,
  list: (organizationId: string) =>
    [...paymentHistoryKeys.all, 'list', organizationId] as const,
};

// ===========================
// API Functions
// ===========================

const paymentHistoryApi = {
  /**
   * Get payment history for organization
   */
  list: async (organizationId: string): Promise<GetPaymentsResponse> => {
    const response = await apiClient.get(
      `/api/subscriptions/${organizationId}/payments`
    );
    return response.data;
  },
};

// ===========================
// Hooks
// ===========================

/**
 * Hook to get payment history for organization
 *
 * @param organizationId - The organization ID
 * @returns Query result with payment history
 *
 * @example
 * ```tsx
 * const { data, isLoading } = usePaymentHistory(organizationId);
 * if (data) {
 *   data.payments.forEach(payment => {
 *     console.log(payment.orderName, payment.amount, payment.status);
 *   });
 * }
 * ```
 */
export function usePaymentHistory(organizationId: string) {
  return useQuery({
    queryKey: paymentHistoryKeys.list(organizationId),
    queryFn: () => paymentHistoryApi.list(organizationId),
    enabled: !!organizationId,
  });
}
