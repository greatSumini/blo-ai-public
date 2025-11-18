import { z } from 'zod';

// ===== Enums =====

export const SubscriptionPlanSchema = z.enum(['free', 'pro']);
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;

export const SubscriptionStatusSchema = z.enum([
  'active',
  'canceled',
  'expired',
  'pending',
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const PaymentStatusSchema = z.enum([
  'pending',
  'done',
  'failed',
  'canceled',
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// ===== Database Table Schemas =====

/**
 * subscriptions 테이블 스키마
 */
export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  plan: SubscriptionPlanSchema,
  status: SubscriptionStatusSchema,
  customerKey: z.string().nullable(),
  billingKey: z.string().nullable(),
  currentPeriodStart: z.string().nullable(),
  currentPeriodEnd: z.string().nullable(),
  nextBillingDate: z.string().nullable(),
  canceledAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

/**
 * generation_quota 테이블 스키마
 */
export const GenerationQuotaSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  tier: SubscriptionPlanSchema,
  monthlyLimit: z.number().int(),
  generationCount: z.number().int(),
  remainingCount: z.number().int(),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
});
export type GenerationQuota = z.infer<typeof GenerationQuotaSchema>;

/**
 * payment_methods 테이블 스키마
 */
export const PaymentMethodSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  billingKey: z.string(),
  cardCompany: z.string().nullable(),
  cardNumber: z.string().nullable(),
  cardType: z.string().nullable(),
  ownerType: z.string().nullable(),
  isPrimary: z.boolean(),
  createdAt: z.string(),
});
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

/**
 * payments 테이블 스키마
 */
export const PaymentSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  paymentKey: z.string().nullable(),
  orderId: z.string(),
  orderName: z.string(),
  amount: z.number().int(),
  status: PaymentStatusSchema,
  method: z.string().nullable(),
  cardCompany: z.string().nullable(),
  cardNumber: z.string().nullable(),
  approvedAt: z.string().nullable(),
  failedAt: z.string().nullable(),
  failureCode: z.string().nullable(),
  failureMessage: z.string().nullable(),
  createdAt: z.string(),
});
export type Payment = z.infer<typeof PaymentSchema>;

// ===== Request Schemas =====

/**
 * 구독 업그레이드 요청 스키마
 */
export const UpgradeSubscriptionRequestSchema = z.object({
  billingKey: z.string().min(1),
  cardCompany: z.string().optional(),
  cardNumber: z.string().optional(),
  cardType: z.string().optional(),
  ownerType: z.string().optional(),
});
export type UpgradeSubscriptionRequest = z.infer<
  typeof UpgradeSubscriptionRequestSchema
>;

// ===== Response Schemas =====

/**
 * 구독 + 할당량 조합 스키마
 */
export const SubscriptionWithQuotaSchema = z.object({
  subscription: SubscriptionSchema,
  quota: GenerationQuotaSchema,
});
export type SubscriptionWithQuota = z.infer<
  typeof SubscriptionWithQuotaSchema
>;

/**
 * 구독 업그레이드 결과 스키마
 */
export const SubscriptionUpgradeResultSchema = z.object({
  subscription: SubscriptionSchema,
  payment: PaymentSchema,
});
export type SubscriptionUpgradeResult = z.infer<
  typeof SubscriptionUpgradeResultSchema
>;

/**
 * 결제수단 목록 응답 스키마
 */
export const GetPaymentMethodsResponseSchema = z.object({
  paymentMethods: z.array(PaymentMethodSchema),
});
export type GetPaymentMethodsResponse = z.infer<
  typeof GetPaymentMethodsResponseSchema
>;

/**
 * 결제 내역 응답 스키마
 */
export const GetPaymentsResponseSchema = z.object({
  payments: z.array(PaymentSchema),
});
export type GetPaymentsResponse = z.infer<typeof GetPaymentsResponseSchema>;

/**
 * Cron 정기결제 결과 스키마
 */
export const BillingCronResultSchema = z.object({
  processed: z.number().int(),
  succeeded: z.number().int(),
  failed: z.number().int(),
  errors: z.array(
    z.object({
      subscriptionId: z.string().uuid(),
      organizationId: z.string().uuid(),
      error: z.string(),
    }),
  ),
});
export type BillingCronResult = z.infer<typeof BillingCronResultSchema>;
