'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { GetPaymentMethodsResponse } from '../lib/dto';

// ===========================
// Query Keys
// ===========================

export const paymentMethodsKeys = {
  all: ['paymentMethods'] as const,
  list: (organizationId: string) =>
    [...paymentMethodsKeys.all, 'list', organizationId] as const,
};

// ===========================
// API Functions
// ===========================

const paymentMethodsApi = {
  /**
   * Get payment methods for organization
   */
  list: async (
    organizationId: string
  ): Promise<GetPaymentMethodsResponse> => {
    const response = await apiClient.get(
      `/api/subscriptions/${organizationId}/payment-methods`
    );
    return response.data;
  },
};

// ===========================
// Hooks
// ===========================

/**
 * Hook to get payment methods for organization
 *
 * @param organizationId - The organization ID
 * @returns Query result with payment methods
 *
 * @example
 * ```tsx
 * const { data, isLoading } = usePaymentMethods(organizationId);
 * if (data) {
 *   data.paymentMethods.forEach(method => {
 *     console.log(method.cardCompany, method.cardNumber);
 *   });
 * }
 * ```
 */
export function usePaymentMethods(organizationId: string) {
  return useQuery({
    queryKey: paymentMethodsKeys.list(organizationId),
    queryFn: () => paymentMethodsApi.list(organizationId),
    enabled: !!organizationId,
  });
}
