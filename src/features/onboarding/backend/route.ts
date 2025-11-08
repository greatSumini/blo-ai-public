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
import { upsertStyleGuide, getStyleGuide, updateStyleGuide, deleteStyleGuide, markOnboardingCompleted } from './service';
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

  /**
   * GET /api/style-guides/:userId
   * Gets the style guide for a user
   *
   * URL params: userId (Clerk user ID)
   * Headers: x-clerk-user-id (required for authorization)
   */
  app.get('/api/style-guides/:userId', async (c) => {
    // Get requesting user ID from header
    const requestingUserId = c.req.header('x-clerk-user-id');

    if (!requestingUserId) {
      return respond(
        c,
        failure(
          401,
          styleGuideErrorCodes.unauthorized,
          'User ID is required. Please provide x-clerk-user-id header.',
        ),
      );
    }

    // Get target user ID from URL param
    const targetUserId = c.req.param('userId');

    if (!targetUserId) {
      return respond(
        c,
        failure(
          400,
          styleGuideErrorCodes.validationError,
          'User ID parameter is required.',
        ),
      );
    }

    // Verify that requesting user can only access their own style guide
    if (requestingUserId !== targetUserId) {
      return respond(
        c,
        failure(
          403,
          styleGuideErrorCodes.unauthorized,
          'You can only access your own style guide.',
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Get style guide
    const result = await getStyleGuide(supabase, targetUserId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<StyleGuideServiceError, unknown>;
      logger.error('Failed to get style guide', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Style guide retrieved successfully', { userId: targetUserId, result });
    return respond(c, result);
  });

  /**
   * PATCH /api/style-guides/:id
   * Updates a style guide for a user
   *
   * URL params: id (style guide ID)
   * Request body: OnboardingFormData
   * Headers: x-clerk-user-id (required)
   */
  app.patch('/api/style-guides/:id', async (c) => {
    const userId = c.req.header('x-clerk-user-id');
    const guideId = c.req.param('id');

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

    if (!guideId) {
      return respond(
        c,
        failure(
          400,
          styleGuideErrorCodes.validationError,
          'Style guide ID is required.',
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

    // Update style guide
    const result = await updateStyleGuide(supabase, guideId, userId, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<StyleGuideServiceError, unknown>;
      logger.error('Failed to update style guide', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Style guide updated successfully', { userId, guideId });
    return respond(c, result);
  });

  /**
   * DELETE /api/style-guides/:id
   * Deletes a style guide for a user
   *
   * URL params: id (style guide ID)
   * Headers: x-clerk-user-id (required)
   */
  app.delete('/api/style-guides/:id', async (c) => {
    const userId = c.req.header('x-clerk-user-id');
    const guideId = c.req.param('id');

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

    if (!guideId) {
      return respond(
        c,
        failure(
          400,
          styleGuideErrorCodes.validationError,
          'Style guide ID is required.',
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Delete style guide
    const result = await deleteStyleGuide(supabase, guideId, userId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<StyleGuideServiceError, unknown>;
      logger.error('Failed to delete style guide', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Style guide deleted successfully', { userId, guideId });
    return respond(c, result);
  });

  /**
   * PATCH /api/onboarding/complete
   * Marks onboarding as completed for a user
   * This ensures the middleware can check completion status from DB
   *
   * Headers: x-clerk-user-id (required)
   */
  app.patch('/api/onboarding/complete', async (c) => {
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

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Update the onboarding_completed flag
    const result = await markOnboardingCompleted(supabase, userId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<StyleGuideServiceError, unknown>;
      logger.error('Failed to mark onboarding completed', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Onboarding marked as completed', { userId });
    return respond(c, result);
  });
};
