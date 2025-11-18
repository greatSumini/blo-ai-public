import type { SupabaseClient } from '@supabase/supabase-js';
import {
  domainFailure,
  domainSuccess,
  type DomainResult,
} from '@/backend/domain/result';
import {
  subscriptionErrorCodes,
  type SubscriptionDomainError,
} from './error';
import {
  type Subscription,
  type GenerationQuota,
  type SubscriptionWithQuota,
  type UpgradeSubscriptionRequest,
  type SubscriptionUpgradeResult,
  type PaymentMethod,
  type Payment,
  type BillingCronResult,
} from './schema';
import { createTossClient } from './toss-client';

const SUBSCRIPTIONS_TABLE = 'subscriptions';
const GENERATION_QUOTA_TABLE = 'generation_quota';
const PAYMENT_METHODS_TABLE = 'payment_methods';
const PAYMENTS_TABLE = 'payments';

const PRO_PRICE = 29900; // 29,900원 (VAT 포함)
const PRO_MONTHLY_LIMIT = 20;
const FREE_MONTHLY_LIMIT = 3;

/**
 * snake_case DB row를 camelCase로 변환
 */
function mapSubscriptionRow(row: any): Subscription {
  return {
    id: row.id,
    organizationId: row.organization_id,
    plan: row.plan,
    status: row.status,
    customerKey: row.customer_key,
    billingKey: row.billing_key,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    nextBillingDate: row.next_billing_date,
    canceledAt: row.canceled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGenerationQuotaRow(row: any): GenerationQuota {
  return {
    id: row.id,
    organizationId: row.organization_id,
    tier: row.tier,
    monthlyLimit: row.monthly_limit,
    generationCount: row.generation_count,
    remainingCount: row.remaining_count,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
  };
}

function mapPaymentMethodRow(row: any): PaymentMethod {
  return {
    id: row.id,
    organizationId: row.organization_id,
    subscriptionId: row.subscription_id,
    billingKey: row.billing_key,
    cardCompany: row.card_company,
    cardNumber: row.card_number,
    cardType: row.card_type,
    ownerType: row.owner_type,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  };
}

function mapPaymentRow(row: any): Payment {
  return {
    id: row.id,
    organizationId: row.organization_id,
    subscriptionId: row.subscription_id,
    paymentKey: row.payment_key,
    orderId: row.order_id,
    orderName: row.order_name,
    amount: row.amount,
    status: row.status,
    method: row.method,
    cardCompany: row.card_company,
    cardNumber: row.card_number,
    approvedAt: row.approved_at,
    failedAt: row.failed_at,
    failureCode: row.failure_code,
    failureMessage: row.failure_message,
    createdAt: row.created_at,
  };
}

/**
 * 현재 조직의 구독 정보 조회 (구독 + 할당량)
 */
export async function getCurrentSubscription(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DomainResult<SubscriptionWithQuota, SubscriptionDomainError>> {
  // 구독 정보 조회
  const { data: subData, error: subError } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (subError || !subData) {
    return domainFailure({
      code: subscriptionErrorCodes.subscriptionNotFound,
      message: '구독 정보를 찾을 수 없습니다.',
      details: subError,
    });
  }

  // 할당량 정보 조회
  const { data: quotaData, error: quotaError } = await supabase
    .from(GENERATION_QUOTA_TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (quotaError || !quotaData) {
    return domainFailure({
      code: subscriptionErrorCodes.quotaNotFound,
      message: '할당량 정보를 찾을 수 없습니다.',
      details: quotaError,
    });
  }

  return domainSuccess({
    subscription: mapSubscriptionRow(subData),
    quota: mapGenerationQuotaRow(quotaData),
  });
}

/**
 * Pro 요금제로 업그레이드
 */
export async function upgradeSubscription(
  supabase: SupabaseClient,
  organizationId: string,
  data: UpgradeSubscriptionRequest,
  tossSecretKey?: string,
): Promise<DomainResult<SubscriptionUpgradeResult, SubscriptionDomainError>> {
  // 1. 현재 구독 조회
  const { data: subData, error: subError } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (subError || !subData) {
    return domainFailure({
      code: subscriptionErrorCodes.subscriptionNotFound,
      message: '구독 정보를 찾을 수 없습니다.',
      details: subError,
    });
  }

  const subscription = mapSubscriptionRow(subData);

  // 이미 Pro 구독자인 경우
  if (subscription.plan === 'pro' && subscription.status === 'active') {
    return domainFailure({
      code: subscriptionErrorCodes.alreadyProSubscriber,
      message: '이미 Pro 요금제를 사용 중입니다.',
    });
  }

  // 2. 빌링 주기 설정
  const now = new Date();
  const nextBillingDate = new Date(now);
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  // 3. 토스페이먼츠 자동결제 승인
  const tossClient = createTossClient(tossSecretKey);
  const orderId = `order_${organizationId}_${Date.now()}`;
  const orderName = 'IndieBlog Pro 월간 구독';

  let paymentResult;
  try {
    paymentResult = await tossClient.approveBillingPayment({
      billingKey: data.billingKey,
      customerKey: subscription.customerKey || organizationId,
      amount: PRO_PRICE,
      orderId,
      orderName,
    });
  } catch (error: any) {
    return domainFailure({
      code: subscriptionErrorCodes.paymentFailed,
      message: '결제 승인에 실패했습니다.',
      details: { error: error.message },
    });
  }

  // 4. subscriptions 테이블 업데이트
  const { data: updatedSub, error: updateSubError } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .update({
      plan: 'pro',
      status: 'active',
      billing_key: data.billingKey,
      customer_key: subscription.customerKey || organizationId,
      current_period_start: now.toISOString(),
      current_period_end: nextBillingDate.toISOString(),
      next_billing_date: nextBillingDate.toISOString().split('T')[0],
      canceled_at: null,
      updated_at: now.toISOString(),
    })
    .eq('id', subscription.id)
    .select()
    .single();

  if (updateSubError || !updatedSub) {
    return domainFailure({
      code: subscriptionErrorCodes.databaseError,
      message: '구독 정보 업데이트에 실패했습니다.',
      details: updateSubError,
    });
  }

  // 5. payment_methods 테이블에 카드 정보 저장
  const { error: pmError } = await supabase
    .from(PAYMENT_METHODS_TABLE)
    .insert({
      organization_id: organizationId,
      subscription_id: subscription.id,
      billing_key: data.billingKey,
      card_company: data.cardCompany || null,
      card_number: data.cardNumber || null,
      card_type: data.cardType || null,
      owner_type: data.ownerType || null,
      is_primary: true,
    });

  if (pmError) {
    // 비치명적 에러 (결제는 성공했으므로 계속 진행)
    console.error('Failed to save payment method:', pmError);
  }

  // 6. payments 테이블에 결제 기록 저장
  const { data: paymentData, error: paymentError } = await supabase
    .from(PAYMENTS_TABLE)
    .insert({
      organization_id: organizationId,
      subscription_id: subscription.id,
      payment_key: paymentResult.paymentKey,
      order_id: orderId,
      order_name: orderName,
      amount: PRO_PRICE,
      status: 'done',
      method: paymentResult.method,
      card_company: paymentResult.card?.company || null,
      card_number: paymentResult.card?.number || null,
      approved_at: paymentResult.approvedAt,
    })
    .select()
    .single();

  if (paymentError || !paymentData) {
    return domainFailure({
      code: subscriptionErrorCodes.databaseError,
      message: '결제 기록 저장에 실패했습니다.',
      details: paymentError,
    });
  }

  // 7. generation_quota 업데이트 (Pro 플랜으로 전환)
  const { error: quotaError } = await supabase
    .from(GENERATION_QUOTA_TABLE)
    .update({
      tier: 'pro',
      monthly_limit: PRO_MONTHLY_LIMIT,
      remaining_count: PRO_MONTHLY_LIMIT,
      generation_count: 0,
      current_period_start: now.toISOString(),
      current_period_end: nextBillingDate.toISOString(),
    })
    .eq('organization_id', organizationId);

  if (quotaError) {
    return domainFailure({
      code: subscriptionErrorCodes.quotaUpdateFailed,
      message: '할당량 업데이트에 실패했습니다.',
      details: quotaError,
    });
  }

  return domainSuccess({
    subscription: mapSubscriptionRow(updatedSub),
    payment: mapPaymentRow(paymentData),
  });
}

/**
 * 구독 취소 (다음 결제일까지 유지)
 */
export async function cancelSubscription(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DomainResult<Subscription, SubscriptionDomainError>> {
  // 1. 현재 구독 조회
  const { data: subData, error: subError } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (subError || !subData) {
    return domainFailure({
      code: subscriptionErrorCodes.subscriptionNotFound,
      message: '구독 정보를 찾을 수 없습니다.',
      details: subError,
    });
  }

  const subscription = mapSubscriptionRow(subData);

  // 이미 취소된 구독인 경우
  if (subscription.status === 'canceled') {
    return domainFailure({
      code: subscriptionErrorCodes.alreadyCanceled,
      message: '이미 취소된 구독입니다.',
    });
  }

  // 2. subscriptions 업데이트 (status=canceled, canceledAt=now)
  const now = new Date().toISOString();
  const { data: updatedSub, error: updateError } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .update({
      status: 'canceled',
      canceled_at: now,
      updated_at: now,
    })
    .eq('id', subscription.id)
    .select()
    .single();

  if (updateError || !updatedSub) {
    return domainFailure({
      code: subscriptionErrorCodes.databaseError,
      message: '구독 취소에 실패했습니다.',
      details: updateError,
    });
  }

  return domainSuccess(mapSubscriptionRow(updatedSub));
}

/**
 * 구독 취소 철회 (다음 결제일 이전에만 가능)
 */
export async function reactivateSubscription(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DomainResult<Subscription, SubscriptionDomainError>> {
  // 1. 현재 구독 조회
  const { data: subData, error: subError } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (subError || !subData) {
    return domainFailure({
      code: subscriptionErrorCodes.subscriptionNotFound,
      message: '구독 정보를 찾을 수 없습니다.',
      details: subError,
    });
  }

  const subscription = mapSubscriptionRow(subData);

  // 취소 상태가 아닌 경우
  if (subscription.status !== 'canceled') {
    return domainFailure({
      code: subscriptionErrorCodes.cannotReactivate,
      message: '취소된 구독만 재활성화할 수 있습니다.',
    });
  }

  // 다음 결제일이 지났는지 확인
  if (subscription.nextBillingDate) {
    const nextBilling = new Date(subscription.nextBillingDate);
    const now = new Date();
    if (now >= nextBilling) {
      return domainFailure({
        code: subscriptionErrorCodes.cannotReactivate,
        message: '다음 결제일이 지나 재활성화할 수 없습니다.',
      });
    }
  }

  // 2. subscriptions 업데이트 (status=active, canceledAt=null)
  const { data: updatedSub, error: updateError } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .update({
      status: 'active',
      canceled_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id)
    .select()
    .single();

  if (updateError || !updatedSub) {
    return domainFailure({
      code: subscriptionErrorCodes.databaseError,
      message: '구독 재활성화에 실패했습니다.',
      details: updateError,
    });
  }

  return domainSuccess(mapSubscriptionRow(updatedSub));
}

/**
 * 빌링키 삭제 (즉시 구독 해지, Free로 전환)
 */
export async function deleteBillingKey(
  supabase: SupabaseClient,
  organizationId: string,
  tossSecretKey?: string,
): Promise<DomainResult<Subscription, SubscriptionDomainError>> {
  // 1. 현재 구독 조회
  const { data: subData, error: subError } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (subError || !subData) {
    return domainFailure({
      code: subscriptionErrorCodes.subscriptionNotFound,
      message: '구독 정보를 찾을 수 없습니다.',
      details: subError,
    });
  }

  const subscription = mapSubscriptionRow(subData);

  if (!subscription.billingKey) {
    return domainFailure({
      code: subscriptionErrorCodes.noBillingKey,
      message: '등록된 빌링키가 없습니다.',
    });
  }

  // 2. 토스페이먼츠 빌링키 삭제
  const tossClient = createTossClient(tossSecretKey);
  try {
    await tossClient.deleteBillingKey({
      billingKey: subscription.billingKey,
      customerKey: subscription.customerKey || organizationId,
    });
  } catch (error: any) {
    return domainFailure({
      code: subscriptionErrorCodes.billingKeyDeleteFailed,
      message: '빌링키 삭제에 실패했습니다.',
      details: { error: error.message },
    });
  }

  // 3. subscriptions 업데이트 (plan=free, billingKey=null, nextBillingDate=null)
  const now = new Date().toISOString();
  const { data: updatedSub, error: updateError } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .update({
      plan: 'free',
      status: 'active',
      billing_key: null,
      next_billing_date: null,
      canceled_at: now,
      updated_at: now,
    })
    .eq('id', subscription.id)
    .select()
    .single();

  if (updateError || !updatedSub) {
    return domainFailure({
      code: subscriptionErrorCodes.databaseError,
      message: '구독 정보 업데이트에 실패했습니다.',
      details: updateError,
    });
  }

  // 4. payment_methods 삭제
  await supabase
    .from(PAYMENT_METHODS_TABLE)
    .delete()
    .eq('subscription_id', subscription.id);

  // 5. generation_quota 업데이트 (tier=free)
  const { error: quotaError } = await supabase
    .from(GENERATION_QUOTA_TABLE)
    .update({
      tier: 'free',
      monthly_limit: FREE_MONTHLY_LIMIT,
      remaining_count: 0, // 기존 사용량 유지, 리셋하지 않음
    })
    .eq('organization_id', organizationId);

  if (quotaError) {
    return domainFailure({
      code: subscriptionErrorCodes.quotaUpdateFailed,
      message: '할당량 업데이트에 실패했습니다.',
      details: quotaError,
    });
  }

  return domainSuccess(mapSubscriptionRow(updatedSub));
}

/**
 * 등록된 결제수단 목록 조회
 */
export async function getPaymentMethods(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DomainResult<PaymentMethod[], SubscriptionDomainError>> {
  const { data, error } = await supabase
    .from(PAYMENT_METHODS_TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    return domainFailure({
      code: subscriptionErrorCodes.databaseError,
      message: '결제수단 조회에 실패했습니다.',
      details: error,
    });
  }

  return domainSuccess((data || []).map(mapPaymentMethodRow));
}

/**
 * 결제 내역 조회
 */
export async function getPaymentHistory(
  supabase: SupabaseClient,
  organizationId: string,
  limit?: number,
): Promise<DomainResult<Payment[], SubscriptionDomainError>> {
  let query = supabase
    .from(PAYMENTS_TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    return domainFailure({
      code: subscriptionErrorCodes.databaseError,
      message: '결제 내역 조회에 실패했습니다.',
      details: error,
    });
  }

  return domainSuccess((data || []).map(mapPaymentRow));
}

/**
 * 잔여 횟수 차감
 */
export async function decrementGenerationQuota(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DomainResult<GenerationQuota, SubscriptionDomainError>> {
  // 1. 현재 할당량 조회
  const { data: quotaData, error: quotaError } = await supabase
    .from(GENERATION_QUOTA_TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (quotaError || !quotaData) {
    return domainFailure({
      code: subscriptionErrorCodes.quotaNotFound,
      message: '할당량 정보를 찾을 수 없습니다.',
      details: quotaError,
    });
  }

  // 2. 잔여 횟수 확인
  if (quotaData.remaining_count <= 0) {
    return domainFailure({
      code: subscriptionErrorCodes.quotaExceeded,
      message: '생성 가능 횟수를 초과했습니다.',
    });
  }

  // 3. 할당량 차감
  const { data: updatedQuota, error: updateError } = await supabase
    .from(GENERATION_QUOTA_TABLE)
    .update({
      generation_count: quotaData.generation_count + 1,
      remaining_count: quotaData.remaining_count - 1,
    })
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (updateError || !updatedQuota) {
    return domainFailure({
      code: subscriptionErrorCodes.quotaUpdateFailed,
      message: '할당량 차감에 실패했습니다.',
      details: updateError,
    });
  }

  return domainSuccess(mapGenerationQuotaRow(updatedQuota));
}

/**
 * Cron 정기결제 처리
 */
export async function processBillingCron(
  supabase: SupabaseClient,
  tossSecretKey?: string,
): Promise<DomainResult<BillingCronResult, SubscriptionDomainError>> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // 1. 오늘이 결제일인 active 구독 조회
  const { data: subscriptions, error: fetchError } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .select('*')
    .eq('status', 'active')
    .eq('plan', 'pro')
    .eq('next_billing_date', today)
    .not('billing_key', 'is', null);

  if (fetchError) {
    return domainFailure({
      code: subscriptionErrorCodes.databaseError,
      message: '구독 조회에 실패했습니다.',
      details: fetchError,
    });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return domainSuccess({
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [],
    });
  }

  const tossClient = createTossClient(tossSecretKey);
  let succeeded = 0;
  let failed = 0;
  const errors: BillingCronResult['errors'] = [];

  // 2. 각 구독별로 결제 시도
  for (const sub of subscriptions) {
    try {
      const orderId = `order_${sub.organization_id}_${Date.now()}`;
      const orderName = 'IndieBlog Pro 월간 구독';

      // 토스 자동결제 승인
      const paymentResult = await tossClient.approveBillingPayment({
        billingKey: sub.billing_key,
        customerKey: sub.customer_key,
        amount: PRO_PRICE,
        orderId,
        orderName,
      });

      // 결제 성공 시
      // a. payments 테이블에 저장
      await supabase.from(PAYMENTS_TABLE).insert({
        organization_id: sub.organization_id,
        subscription_id: sub.id,
        payment_key: paymentResult.paymentKey,
        order_id: orderId,
        order_name: orderName,
        amount: PRO_PRICE,
        status: 'done',
        method: paymentResult.method,
        card_company: paymentResult.card?.company || null,
        card_number: paymentResult.card?.number || null,
        approved_at: paymentResult.approvedAt,
      });

      // b. generation_quota 리셋
      const now = new Date();
      const nextPeriodEnd = new Date(now);
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

      await supabase
        .from(GENERATION_QUOTA_TABLE)
        .update({
          generation_count: 0,
          remaining_count: PRO_MONTHLY_LIMIT,
          current_period_start: now.toISOString(),
          current_period_end: nextPeriodEnd.toISOString(),
        })
        .eq('organization_id', sub.organization_id);

      // c. subscriptions.next_billing_date += 1달
      const nextBillingDate = new Date(sub.next_billing_date);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await supabase
        .from(SUBSCRIPTIONS_TABLE)
        .update({
          current_period_start: now.toISOString(),
          current_period_end: nextPeriodEnd.toISOString(),
          next_billing_date: nextBillingDate.toISOString().split('T')[0],
          updated_at: now.toISOString(),
        })
        .eq('id', sub.id);

      succeeded++;
    } catch (error: any) {
      // 결제 실패 시
      // a. payments 테이블에 실패 기록
      const orderId = `order_${sub.organization_id}_${Date.now()}`;
      await supabase.from(PAYMENTS_TABLE).insert({
        organization_id: sub.organization_id,
        subscription_id: sub.id,
        order_id: orderId,
        order_name: 'IndieBlog Pro 월간 구독',
        amount: PRO_PRICE,
        status: 'failed',
        failed_at: new Date().toISOString(),
        failure_code: error.code || 'UNKNOWN',
        failure_message: error.message || 'Payment failed',
      });

      // b. subscriptions.status=expired, billingKey=null
      await supabase
        .from(SUBSCRIPTIONS_TABLE)
        .update({
          status: 'expired',
          billing_key: null,
          next_billing_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sub.id);

      // c. generation_quota를 free로 전환
      await supabase
        .from(GENERATION_QUOTA_TABLE)
        .update({
          tier: 'free',
          monthly_limit: FREE_MONTHLY_LIMIT,
          remaining_count: 0,
        })
        .eq('organization_id', sub.organization_id);

      failed++;
      errors.push({
        subscriptionId: sub.id,
        organizationId: sub.organization_id,
        error: error.message,
      });
    }
  }

  return domainSuccess({
    processed: subscriptions.length,
    succeeded,
    failed,
    errors,
  });
}
