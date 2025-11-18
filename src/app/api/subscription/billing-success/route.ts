import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { createTossClient } from '@/features/subscription/backend/toss-client';

/**
 * GET /api/subscription/billing-success
 * 토스페이먼츠 빌링키 발급 성공 콜백 처리
 *
 * Query Parameters:
 * - authKey: 토스페이먼츠에서 발급한 인증 키
 * - customerKey: 고객 키 (organizationId)
 */
export async function GET(req: Request) {
  try {
    // Authenticate user
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.redirect(
        new URL(
          '/sign-in?error=unauthorized&message=로그인이 필요합니다.',
          req.url
        )
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const authKey = searchParams.get('authKey');
    const customerKey = searchParams.get('customerKey');

    if (!authKey || !customerKey) {
      // Redirect to subscription page with error
      const redirectUrl = new URL(
        `/org/${orgId || customerKey}/subscription`,
        req.url
      );
      redirectUrl.searchParams.set('error', 'missing_params');
      redirectUrl.searchParams.set(
        'message',
        '필수 파라미터가 누락되었습니다.'
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Initialize services
    const tossSecretKey = process.env.TOSS_SECRET_KEY;
    if (!tossSecretKey) {
      throw new Error('TOSS_SECRET_KEY is not configured');
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const tossClient = createTossClient(tossSecretKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Issue billing key from Toss Payments
    let billingKeyData;
    try {
      billingKeyData = await tossClient.issueBillingKey({
        authKey,
        customerKey,
      });
    } catch (error: any) {
      console.error('Failed to issue billing key:', error);

      // Redirect with error
      const redirectUrl = new URL(
        `/org/${orgId || customerKey}/subscription`,
        req.url
      );
      redirectUrl.searchParams.set('error', 'billing_key_issue_failed');
      redirectUrl.searchParams.set(
        'message',
        error.message || '빌링키 발급에 실패했습니다.'
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Update subscription with billing key
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        billing_key: billingKeyData.billingKey,
        customer_key: billingKeyData.customerKey,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', customerKey);

    if (updateError) {
      console.error('Failed to update subscription:', updateError);

      // Redirect with error
      const redirectUrl = new URL(
        `/org/${orgId || customerKey}/subscription`,
        req.url
      );
      redirectUrl.searchParams.set('error', 'subscription_update_failed');
      redirectUrl.searchParams.set(
        'message',
        '구독 정보 업데이트에 실패했습니다.'
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Save payment method
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('organization_id', customerKey)
      .single();

    if (subData) {
      await supabase.from('payment_methods').insert({
        organization_id: customerKey,
        subscription_id: subData.id,
        billing_key: billingKeyData.billingKey,
        card_company: billingKeyData.card.company,
        card_number: billingKeyData.card.number,
        card_type: billingKeyData.card.cardType,
        owner_type: billingKeyData.card.ownerType,
        is_primary: true,
      });
    }

    // Redirect to subscription page with success
    const redirectUrl = new URL(
      `/org/${orgId || customerKey}/subscription`,
      req.url
    );
    redirectUrl.searchParams.set('billingKey', billingKeyData.billingKey);
    redirectUrl.searchParams.set('cardCompany', billingKeyData.card.company);
    redirectUrl.searchParams.set('cardNumber', billingKeyData.card.number);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Billing success callback error:', error);

    // Redirect with generic error
    const { searchParams } = new URL(req.url);
    const customerKey = searchParams.get('customerKey');
    const { orgId } = await auth();

    const redirectUrl = new URL(
      `/org/${orgId || customerKey || 'unknown'}/subscription`,
      req.url
    );
    redirectUrl.searchParams.set('error', 'server_error');
    redirectUrl.searchParams.set(
      'message',
      '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    );
    return NextResponse.redirect(redirectUrl);
  }
}
