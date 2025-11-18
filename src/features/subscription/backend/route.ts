import type { Hono } from 'hono';
import { respondWithDomain } from '@/backend/http/mapper';
import {
  getLogger,
  getSupabase,
  getConfig,
  type AppEnv,
} from '@/backend/hono/context';
import {
  UpgradeSubscriptionRequestSchema,
  type SubscriptionWithQuota,
  type SubscriptionUpgradeResult,
  type Subscription,
  type GetPaymentMethodsResponse,
  type GetPaymentsResponse,
} from './schema';
import {
  getCurrentSubscription,
  upgradeSubscription,
  cancelSubscription,
  reactivateSubscription,
  deleteBillingKey,
  getPaymentMethods,
  getPaymentHistory,
} from './service';

export const registerSubscriptionRoutes = (app: Hono<AppEnv>) => {
  /**
   * POST /api/subscriptions/upgrade
   * Pro 요금제로 업그레이드
   */
  app.post('/api/subscriptions/upgrade', async (c) => {
    const body = await c.req.json();
    const parsedBody = UpgradeSubscriptionRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: parsedBody.error.format(),
          },
        },
        400,
      );
    }

    const { organizationId, ...upgradeData } = body;

    if (!organizationId) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'organizationId is required',
          },
        },
        400,
      );
    }

    const supabase = getSupabase(c);
    const config = getConfig(c);
    const result = await upgradeSubscription(
      supabase,
      organizationId,
      parsedBody.data,
      config.toss?.secretKey,
    );
    return respondWithDomain<SubscriptionUpgradeResult, any>(c, result);
  });

  /**
   * POST /api/subscriptions/cancel
   * 구독 취소 (다음 결제일까지 유지)
   */
  app.post('/api/subscriptions/cancel', async (c) => {
    const body = await c.req.json();
    const { organizationId } = body;

    if (!organizationId) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'organizationId is required',
          },
        },
        400,
      );
    }

    const supabase = getSupabase(c);
    const result = await cancelSubscription(supabase, organizationId);
    return respondWithDomain<Subscription, any>(c, result);
  });

  /**
   * POST /api/subscriptions/reactivate
   * 구독 취소 철회
   */
  app.post('/api/subscriptions/reactivate', async (c) => {
    const body = await c.req.json();
    const { organizationId } = body;

    if (!organizationId) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'organizationId is required',
          },
        },
        400,
      );
    }

    const supabase = getSupabase(c);
    const result = await reactivateSubscription(supabase, organizationId);
    return respondWithDomain<Subscription, any>(c, result);
  });

  /**
   * DELETE /api/subscriptions/billing-key
   * 빌링키 삭제 (즉시 해지, Free로 전환)
   */
  app.delete('/api/subscriptions/billing-key', async (c) => {
    const organizationId = c.req.query('orgId');

    if (!organizationId) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'organizationId is required',
          },
        },
        400,
      );
    }

    const supabase = getSupabase(c);
    const config = getConfig(c);
    const result = await deleteBillingKey(
      supabase,
      organizationId,
      config.toss?.secretKey,
    );
    return respondWithDomain<Subscription, any>(c, result);
  });

  /**
   * GET /api/subscriptions/:organizationId/payment-methods
   * 등록된 결제수단 목록 조회
   */
  app.get('/api/subscriptions/:organizationId/payment-methods', async (c) => {
    const organizationId = c.req.param('organizationId');

    if (!organizationId) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'organizationId is required',
          },
        },
        400,
      );
    }

    const supabase = getSupabase(c);
    const result = await getPaymentMethods(supabase, organizationId);

    if (result.ok) {
      return respondWithDomain<GetPaymentMethodsResponse, any>(c, {
        ok: true,
        data: { paymentMethods: result.data },
      });
    }

    return respondWithDomain(c, result);
  });

  /**
   * GET /api/subscriptions/:organizationId/payments
   * 결제 내역 조회
   */
  app.get('/api/subscriptions/:organizationId/payments', async (c) => {
    const organizationId = c.req.param('organizationId');
    const limitStr = c.req.query('limit');
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;

    if (!organizationId) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'organizationId is required',
          },
        },
        400,
      );
    }

    const supabase = getSupabase(c);
    const result = await getPaymentHistory(supabase, organizationId, limit);

    if (result.ok) {
      return respondWithDomain<GetPaymentsResponse, any>(c, {
        ok: true,
        data: { payments: result.data },
      });
    }

    return respondWithDomain(c, result);
  });

  /**
   * GET /api/subscriptions/:organizationId
   * 현재 조직의 구독 정보 조회 (구독 + 할당량)
   */
  app.get('/api/subscriptions/:organizationId', async (c) => {
    const organizationId = c.req.param('organizationId');

    if (!organizationId) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'organizationId is required',
          },
        },
        400,
      );
    }

    const supabase = getSupabase(c);
    const result = await getCurrentSubscription(supabase, organizationId);
    return respondWithDomain<SubscriptionWithQuota, any>(c, result);
  });
};
