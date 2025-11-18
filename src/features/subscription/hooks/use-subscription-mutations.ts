'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type {
  UpgradeSubscriptionRequest,
  SubscriptionUpgradeResult,
  Subscription,
} from '../lib/dto';
import { subscriptionKeys } from './use-subscription';
import { paymentMethodsKeys } from './use-payment-methods';
import { paymentHistoryKeys } from './use-payment-history';

// ===========================
// API Functions
// ===========================

const subscriptionMutationsApi = {
  /**
   * Upgrade subscription to Pro plan
   */
  upgrade: async (
    organizationId: string,
    data: UpgradeSubscriptionRequest
  ): Promise<SubscriptionUpgradeResult> => {
    const response = await apiClient.post(
      `/api/subscriptions/${organizationId}/upgrade`,
      data
    );
    return response.data;
  },

  /**
   * Cancel subscription
   */
  cancel: async (organizationId: string): Promise<Subscription> => {
    const response = await apiClient.post(
      `/api/subscriptions/${organizationId}/cancel`
    );
    return response.data;
  },
};

// ===========================
// Hooks
// ===========================

/**
 * Hook to upgrade subscription to Pro plan
 *
 * @param organizationId - The organization ID
 * @returns Mutation result
 *
 * @example
 * ```tsx
 * const upgradeMutation = useUpgradeSubscription(organizationId);
 *
 * const handleUpgrade = async (billingKey: string) => {
 *   try {
 *     const result = await upgradeMutation.mutateAsync({
 *       billingKey,
 *       cardCompany: 'VISA',
 *       cardNumber: '**** **** **** 1234',
 *     });
 *     console.log('Upgrade successful:', result);
 *   } catch (error) {
 *     console.error('Upgrade failed:', error);
 *   }
 * };
 * ```
 */
export function useUpgradeSubscription(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpgradeSubscriptionRequest) =>
      subscriptionMutationsApi.upgrade(organizationId, data),
    onSuccess: () => {
      // Invalidate subscription, payment methods, and payment history
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.detail(organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentMethodsKeys.list(organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentHistoryKeys.list(organizationId),
      });
    },
  });
}

/**
 * Hook to cancel subscription
 *
 * @param organizationId - The organization ID
 * @returns Mutation result
 *
 * @example
 * ```tsx
 * const cancelMutation = useCancelSubscription(organizationId);
 *
 * const handleCancel = async () => {
 *   try {
 *     await cancelMutation.mutateAsync();
 *     console.log('Subscription canceled');
 *   } catch (error) {
 *     console.error('Cancel failed:', error);
 *   }
 * };
 * ```
 */
export function useCancelSubscription(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionMutationsApi.cancel(organizationId),
    onSuccess: () => {
      // Invalidate subscription data
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.detail(organizationId),
      });
    },
  });
}
