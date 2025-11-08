import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { CreateStyleGuideRequestSchema } from '@/features/onboarding/backend/schema';
import { upsertStyleGuide } from './service';
import {
  styleGuideErrorCodes,
  type StyleGuideServiceError,
} from './error';

export const registerOnboardingRoutes = (app: Hono<AppEnv>) => {
  /**
   * POST /api/style-guides
   * Creates or updates a style guide for a user
   *
   * Request body: OnboardingFormData
   * Headers: x-clerk-user-id (required)
   */
  app.post('/api/style-guides', async (c) => {
    // Get userId from header (passed from server action)
    const userId = c.req.header('x-clerk-user-id');

    if (!userId) {
      return respond(
        c,
        failure(
          401,
          styleGuideErrorCodes.unauthorized,
          'User ID is required. Please provide x-clerk-user-id header.',
        ),
      );
    }

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = CreateStyleGuideRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          styleGuideErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Save to database
    const result = await upsertStyleGuide(supabase, userId, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<StyleGuideServiceError, unknown>;
      logger.error('Failed to save style guide', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Style guide saved successfully', { userId });
    return respond(c, result);
  });
};
