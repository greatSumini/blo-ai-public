import type { DomainError } from '@/backend/domain/result';

/**
 * 구독 도메인 에러 코드
 */
export const subscriptionErrorCodes = {
  // 일반 에러
  validationError: 'VALIDATION_ERROR',
  unauthorized: 'UNAUTHORIZED',
  forbidden: 'FORBIDDEN',

  // 구독 에러
  subscriptionNotFound: 'SUBSCRIPTION_NOT_FOUND',
  alreadyProSubscriber: 'ALREADY_PRO_SUBSCRIBER',
  alreadyCanceled: 'ALREADY_CANCELED',
  cannotReactivate: 'CANNOT_REACTIVATE',
  noBillingKey: 'NO_BILLING_KEY',

  // 할당량 에러
  quotaExceeded: 'QUOTA_EXCEEDED',
  quotaNotFound: 'QUOTA_NOT_FOUND',
  quotaUpdateFailed: 'QUOTA_UPDATE_FAILED',

  // 결제 에러
  paymentFailed: 'PAYMENT_FAILED',
  billingKeyIssueFailed: 'BILLING_KEY_ISSUE_FAILED',
  billingKeyDeleteFailed: 'BILLING_KEY_DELETE_FAILED',

  // 데이터베이스 에러
  databaseError: 'DATABASE_ERROR',
} as const;

/**
 * 구독 도메인 에러 타입
 */
export type SubscriptionDomainError = DomainError & {
  code: (typeof subscriptionErrorCodes)[keyof typeof subscriptionErrorCodes];
};
