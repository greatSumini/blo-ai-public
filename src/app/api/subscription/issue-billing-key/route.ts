import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  issueBillingKey,
  saveBillingKeyAndUpgrade,
} from '@/features/subscription/backend/billing.service';

export const runtime = 'nodejs';

/**
 * POST /api/subscription/issue-billing-key
 * 빌링 인증 성공 후 빌링키 발급 및 구독 업그레이드
 */
export async function POST(request: NextRequest) {
  try {
    // Supabase 클라이언트 생성 (service role 사용)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json();
    const { authKey, customerKey, organizationId } = body;

    if (!authKey || !customerKey || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 조직 존재 여부 확인
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // 빌링키 발급
    const billingData = await issueBillingKey({
      authKey,
      customerKey,
      logger: console,
    });

    // DB에 저장 및 구독 업그레이드
    await saveBillingKeyAndUpgrade({
      supabase,
      logger: console,
      organizationId,
      billingKey: billingData.billingKey,
      cardCompany: billingData.cardCompany,
      cardNumber: billingData.cardNumber,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription upgraded successfully',
    });
  } catch (error) {
    console.error('Error issuing billing key:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upgrade subscription',
      },
      { status: 500 }
    );
  }
}
