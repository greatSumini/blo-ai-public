import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppLogger } from '@/backend/hono/context';

/**
 * 토스페이먼츠 빌링키 발급 요청
 */
export async function issueBillingKey(params: {
  authKey: string;
  customerKey: string;
  logger: AppLogger;
}): Promise<{
  billingKey: string;
  cardCompany: string;
  cardNumber: string;
}> {
  const { authKey, customerKey, logger } = params;

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new Error('TOSS_SECRET_KEY is not configured');
  }

  // Base64 인코딩: secretKey + ":"
  const encodedKey = Buffer.from(`${secretKey}:`).toString('base64');

  try {
    const response = await fetch(
      'https://api.tosspayments.com/v1/billing/authorizations/issue',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${encodedKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authKey,
          customerKey,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      logger.error('Failed to issue billing key', {
        status: response.status,
        error: errorData,
      });
      throw new Error(
        errorData.message || 'Failed to issue billing key from Toss Payments'
      );
    }

    const data = await response.json();

    return {
      billingKey: data.billingKey,
      cardCompany: data.cardCompany,
      cardNumber: data.cardNumber,
    };
  } catch (error) {
    logger.error('Error issuing billing key', { error });
    throw error;
  }
}

/**
 * 빌링키를 DB에 저장하고 구독을 Pro로 업그레이드
 */
export async function saveBillingKeyAndUpgrade(params: {
  supabase: SupabaseClient;
  logger: AppLogger;
  organizationId: string;
  billingKey: string;
  cardCompany: string;
  cardNumber: string;
}): Promise<void> {
  const {
    supabase,
    logger,
    organizationId,
    billingKey,
    cardCompany,
    cardNumber,
  } = params;

  try {
    // 1. 기존 구독 정보 조회
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = not found
      throw fetchError;
    }

    const now = new Date().toISOString();
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    if (existingSubscription) {
      // 기존 구독 업데이트 (subscriptions 테이블)
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan: 'pro',
          status: 'active',
          billing_key: billingKey,
          customer_key: organizationId,
          next_billing_date: nextBillingDate.toISOString(),
          updated_at: now,
        })
        .eq('organization_id', organizationId);

      if (updateError) throw updateError;
    } else {
      // 새 구독 생성 (subscriptions 테이블)
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          organization_id: organizationId,
          plan: 'pro',
          status: 'active',
          billing_key: billingKey,
          customer_key: organizationId,
          next_billing_date: nextBillingDate.toISOString(),
          created_at: now,
          updated_at: now,
        });

      if (insertError) throw insertError;
    }

    // 업데이트된 구독 ID 조회
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('organization_id', organizationId)
      .single();

    if (subError || !subscription) {
      throw new Error('Failed to retrieve subscription ID');
    }

    // payment_methods 테이블에 카드 정보 저장
    // 기존 결제수단 삭제 후 새로 추가 (한 조직당 하나의 결제수단만 유지)
    await supabase
      .from('payment_methods')
      .delete()
      .eq('organization_id', organizationId);

    const { error: paymentMethodError } = await supabase
      .from('payment_methods')
      .insert({
        organization_id: organizationId,
        subscription_id: subscription.id,
        billing_key: billingKey,
        card_company: cardCompany,
        card_number: cardNumber,
        is_primary: true,
        created_at: now,
        updated_at: now,
      });

    if (paymentMethodError) throw paymentMethodError;

    // 2. 쿼터 초기화 (Pro 플랜: 20회)
    const { error: quotaError } = await supabase
      .from('generation_quota')
      .update({
        tier: 'pro',
        monthly_limit: 20,
        generation_count: 0,
        remaining_count: 20,
        current_period_start: now,
        current_period_end: nextBillingDate.toISOString(),
      })
      .eq('organization_id', organizationId);

    if (quotaError) throw quotaError;

    logger.info('Billing key saved and subscription upgraded', {
      organizationId,
    });
  } catch (error) {
    logger.error('Failed to save billing key and upgrade subscription', {
      error,
      organizationId,
    });
    throw error;
  }
}
