import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

/**
 * Toss Payments Webhook Event Types
 */
type TossWebhookEvent =
  | 'BILLING_DELETED' // 빌링키 삭제
  | 'PAYMENT_DONE' // 결제 완료
  | 'PAYMENT_CANCELED'; // 결제 취소

interface TossWebhookPayload {
  eventType: TossWebhookEvent;
  createdAt: string;
  data: {
    billingKey?: string;
    customerKey?: string;
    mId?: string;
    paymentKey?: string;
    orderId?: string;
    status?: string;
  };
}

/**
 * POST /api/webhooks/toss
 * 토스페이먼츠 웹훅 이벤트 처리
 *
 * @see https://docs.tosspayments.com/reference/webhook
 */
export async function POST(req: Request) {
  try {
    // Parse webhook payload
    const payload: TossWebhookPayload = await req.json();

    console.info('[Toss Webhook] Received event:', {
      eventType: payload.eventType,
      createdAt: payload.createdAt,
      customerKey: payload.data.customerKey,
    });

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Toss Webhook] Supabase configuration is missing');
      return NextResponse.json(
        {
          error: {
            code: 'SERVER_CONFIG_ERROR',
            message: 'Server configuration error',
          },
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (payload.eventType) {
      case 'BILLING_DELETED': {
        // 빌링키가 삭제된 경우 (고객이 카드를 삭제하거나 토스에서 삭제)
        const { billingKey, customerKey } = payload.data;

        if (!customerKey) {
          console.warn('[Toss Webhook] Missing customerKey in BILLING_DELETED event');
          return NextResponse.json(
            {
              error: {
                code: 'INVALID_PAYLOAD',
                message: 'Missing customerKey',
              },
            },
            { status: 400 }
          );
        }

        console.info(
          `[Toss Webhook] Processing BILLING_DELETED for customerKey: ${customerKey}`
        );

        // Update subscription to remove billing key and downgrade to free
        const { error: updateSubError } = await supabase
          .from('subscriptions')
          .update({
            plan: 'free',
            status: 'active',
            billing_key: null,
            next_billing_date: null,
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('customer_key', customerKey);

        if (updateSubError) {
          console.error('[Toss Webhook] Failed to update subscription:', updateSubError);
          return NextResponse.json(
            {
              error: {
                code: 'DATABASE_ERROR',
                message: 'Failed to update subscription',
              },
            },
            { status: 500 }
          );
        }

        // Delete payment methods
        const { error: deletePaymentMethodError } = await supabase
          .from('payment_methods')
          .delete()
          .eq('billing_key', billingKey || '');

        if (deletePaymentMethodError) {
          console.error(
            '[Toss Webhook] Failed to delete payment method:',
            deletePaymentMethodError
          );
          // Non-critical error, continue processing
        }

        // Update generation quota to free tier
        const { error: quotaError } = await supabase
          .from('generation_quota')
          .update({
            tier: 'free',
            monthly_limit: 3,
            remaining_count: 0,
          })
          .eq('organization_id', customerKey);

        if (quotaError) {
          console.error('[Toss Webhook] Failed to update quota:', quotaError);
          // Non-critical error, continue processing
        }

        console.info(
          `[Toss Webhook] Successfully processed BILLING_DELETED for customerKey: ${customerKey}`
        );

        return NextResponse.json({ success: true });
      }

      case 'PAYMENT_DONE': {
        // 결제 완료 이벤트 (필요시 추가 처리)
        console.info('[Toss Webhook] PAYMENT_DONE event received (no action needed)');
        return NextResponse.json({ success: true });
      }

      case 'PAYMENT_CANCELED': {
        // 결제 취소 이벤트 (필요시 추가 처리)
        console.info('[Toss Webhook] PAYMENT_CANCELED event received (no action needed)');
        return NextResponse.json({ success: true });
      }

      default: {
        console.warn(`[Toss Webhook] Unknown event type: ${payload.eventType}`);
        return NextResponse.json({ success: true });
      }
    }
  } catch (error) {
    console.error('[Toss Webhook] Unexpected error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Prevent GET requests
 */
export async function GET() {
  return NextResponse.json(
    {
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
      },
    },
    { status: 405 }
  );
}
