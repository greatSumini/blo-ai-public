import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processBillingCron } from '@/features/subscription/backend/service';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5분

/**
 * POST /api/cron/billing
 * Cron job for processing monthly subscription billing
 *
 * Security: Requires x-cron-secret header matching CRON_SECRET_TOKEN
 *
 * @example
 * ```bash
 * curl -X POST https://your-domain.com/api/cron/billing \
 *   -H "x-cron-secret: your-secret-token"
 * ```
 */
export async function POST(req: Request) {
  try {
    // Verify cron secret
    const cronSecret = req.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET_TOKEN;

    if (!expectedSecret) {
      console.error('CRON_SECRET_TOKEN is not configured');
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

    if (cronSecret !== expectedSecret) {
      console.warn('Invalid cron secret provided');
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid cron secret',
          },
        },
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration is missing');
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

    // Get Toss secret key
    const tossSecretKey = process.env.TOSS_SECRET_KEY;

    // Process billing cron
    console.info('[Billing Cron] Starting billing process...');
    const startTime = Date.now();

    const result = await processBillingCron(supabase, tossSecretKey);

    const duration = Date.now() - startTime;

    if (!result.ok) {
      const errorData = result as { ok: false; error: any };
      console.error('[Billing Cron] Failed to process billing:', errorData.error);
      return NextResponse.json(
        {
          error: errorData.error,
        },
        { status: 500 }
      );
    }

    const { processed, succeeded, failed, errors } = result.data;

    console.info(
      `[Billing Cron] Completed in ${duration}ms - Processed: ${processed}, Succeeded: ${succeeded}, Failed: ${failed}`
    );

    if (errors.length > 0) {
      console.error('[Billing Cron] Errors occurred:', errors);
    }

    return NextResponse.json({
      success: true,
      data: {
        processed,
        succeeded,
        failed,
        errors,
        duration,
      },
    });
  } catch (error) {
    console.error('[Billing Cron] Unexpected error:', error);

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
