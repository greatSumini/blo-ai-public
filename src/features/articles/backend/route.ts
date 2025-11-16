import type { Hono } from 'hono';
import { getAuth } from '@hono/clerk-auth';
import {
  failure,
  success,
} from '@/backend/http/response';
import { respondWithDomain, respondCreated } from '@/backend/http/mapper';
import {
  getLogger,
  getSupabase,
  getConfig,
  type AppEnv,
} from '@/backend/hono/context';
import {
  CreateArticleRequestSchema,
  UpdateArticleRequestSchema,
  GenerateArticleRequestSchema,
  ListArticlesQuerySchema,
} from '@/features/articles/backend/schema';
import {
  createArticle,
  getArticleById,
  updateArticle,
  deleteArticle,
  listArticles,
  getDashboardStats,
} from './service';
import {
  articleErrorCodes,
} from './error';
import { generateArticleContent } from './ai-service';
import { checkQuota, incrementQuota } from './quota-service';
import { generateUniqueSlug } from '@/lib/slug';

export const registerArticlesRoutes = (app: Hono<AppEnv>) => {
  /**
   * GET /api/articles
   * Lists articles with pagination, filtering, and sorting
   *
   * Query params: limit, offset, status, sortBy, sortOrder
   */
  app.get('/api/articles', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, 'UNAUTHORIZED', 'Authentication required. Please sign in.'),
        401
      );
    }

    // Parse and validate query parameters
    const queryParams = c.req.query();
    const parsedQuery = ListArticlesQuerySchema.safeParse(queryParams);

    if (!parsedQuery.success) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Invalid query parameters. Please check your input.',
          parsedQuery.error.format(),
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // List articles
    const result = await listArticles(supabase, auth.userId, parsedQuery.data);

    if (result.ok) {
      logger.info('Articles listed successfully', {
        userId: auth.userId,
        count: result.data.articles.length,
        total: result.data.total,
      });
    }

    return respondWithDomain(c, result);
  });

  /**
   * GET /api/articles/dashboard/stats
   * Gets dashboard statistics for the current user
   */
  app.get('/api/articles/dashboard/stats', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, articleErrorCodes.unauthorized || 'UNAUTHORIZED', 'Authentication required. Please sign in.'),
        401
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Get dashboard stats
    const result = await getDashboardStats(supabase, auth.userId);

    if (result.ok) {
      logger.info('Dashboard stats retrieved successfully', { userId: auth.userId });
    }

    return respondWithDomain(c, result);
  });

  /**
   * GET /api/articles/recent
   * Gets recent articles for the current user
   * Query params: limit (default: 10)
   */
  app.get('/api/articles/recent', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, articleErrorCodes.unauthorized || 'UNAUTHORIZED', 'Authentication required. Please sign in.'),
        401
      );
    }
    const limitParam = c.req.query('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // List recent articles with default limit
    // Use schema parse to ensure default values are applied
    const queryData = ListArticlesQuerySchema.parse({
      limit,
      offset: 0,
      sortBy: 'updated_at',
      sortOrder: 'desc',
    });

    const result = await listArticles(supabase, auth.userId, queryData);

    if (result.ok) {
      logger.info('Recent articles retrieved successfully', {
        userId: auth.userId,
        count: result.data.articles.length,
      });
    }

    return respondWithDomain(c, result);
  });

  /**
   * POST /api/articles/draft
   * Creates a new article draft
   *
   * Request body: CreateArticleRequest
   */
  app.post('/api/articles/draft', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, articleErrorCodes.unauthorized || 'UNAUTHORIZED', 'Authentication required. Please sign in.'),
        401
      );
    }

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = CreateArticleRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format(),
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Create article draft
    const result = await createArticle(supabase, auth.userId, parsedBody.data);

    if (result.ok) {
      logger.info('Article draft created successfully', { userId: auth.userId, articleId: result.data.id });
    }

    return respondCreated(c, result);
  });

  /**
   * GET /api/articles/:id
   * Gets an article by ID
   *
   * URL params: id (article UUID)
   */
  app.get('/api/articles/:id', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, articleErrorCodes.unauthorized || 'UNAUTHORIZED', 'Authentication required. Please sign in.'),
        401
      );
    }
    const articleId = c.req.param('id');

    if (!articleId) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Article ID is required.',
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Get article
    const result = await getArticleById(supabase, auth.userId, articleId);

    if (result.ok) {
      logger.info('Article retrieved successfully', { userId: auth.userId, articleId });
    }

    return respondWithDomain(c, result);
  });

  /**
   * PATCH /api/articles/:id
   * Updates an article
   *
   * URL params: id (article UUID)
   * Request body: UpdateArticleRequest
   */
  app.patch('/api/articles/:id', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, articleErrorCodes.unauthorized || 'UNAUTHORIZED', 'Authentication required. Please sign in.'),
        401
      );
    }
    const articleId = c.req.param('id');

    if (!articleId) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Article ID is required.',
        ),
        400
      );
    }

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = UpdateArticleRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format(),
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Update article
    const result = await updateArticle(
      supabase,
      auth.userId,
      articleId,
      parsedBody.data,
    );

    if (result.ok) {
      logger.info('Article updated successfully', { userId: auth.userId, articleId });
    }

    return respondWithDomain(c, result);
  });

  /**
   * DELETE /api/articles/:id
   * Deletes an article
   *
   * URL params: id (article UUID)
   */
  app.delete('/api/articles/:id', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, articleErrorCodes.unauthorized || 'UNAUTHORIZED', 'Authentication required. Please sign in.'),
        401
      );
    }
    const articleId = c.req.param('id');

    if (!articleId) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Article ID is required.',
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Delete article
    const result = await deleteArticle(supabase, auth.userId, articleId);

    if (result.ok) {
      logger.info('Article deleted successfully', { userId: auth.userId, articleId });
    }

    return respondWithDomain(c, result);
  });

  /**
   * POST /api/articles/generate
   * Generates a new article using AI (Google Gemini)
   *
   * Request body: GenerateArticleRequest
   */
  app.post('/api/articles/generate', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, articleErrorCodes.unauthorized || 'UNAUTHORIZED', 'Authentication required. Please sign in.'),
        401
      );
    }

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = GenerateArticleRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format(),
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const config = getConfig(c);

    // Step 1: Check quota
    const quotaCheckResult = await checkQuota(supabase, auth.userId);

    if (!quotaCheckResult.ok) {
      return respondWithDomain(c, quotaCheckResult);
    }

    if (!quotaCheckResult.data.allowed) {
      return c.json(
        failure(
          429,
          articleErrorCodes.quotaExceeded,
          `Generation quota exceeded. You have used ${quotaCheckResult.data.currentCount}/${quotaCheckResult.data.limit} generations.`,
          {
            tier: quotaCheckResult.data.tier,
            currentCount: quotaCheckResult.data.currentCount,
            limit: quotaCheckResult.data.limit,
          },
        ),
        429
      );
    }

    // Step 2: Generate article content using AI
    const generationResult = await generateArticleContent(
      supabase,
      auth.userId,
      config.google.generativeAiApiKey,
      parsedBody.data,
    );

    if (!generationResult.ok) {
      return respondWithDomain(c, generationResult);
    }

    const generatedContent = generationResult.data;

    // Step 3: Create article in database
    const slug = generateUniqueSlug(generatedContent.title);

    const createArticleData = {
      title: generatedContent.title,
      slug,
      keywords: generatedContent.keywords,
      description: generatedContent.metaDescription,
      content: generatedContent.content,
      styleGuideId: parsedBody.data.styleGuideId,
      metaTitle: generatedContent.title,
      metaDescription: generatedContent.metaDescription,
    };

    const articleResult = await createArticle(supabase, auth.userId, createArticleData);

    if (!articleResult.ok) {
      return respondWithDomain(c, articleResult);
    }

    // Step 4: Increment quota
    const incrementResult = await incrementQuota(supabase, auth.userId);

    if (!incrementResult.ok) {
      logger.warn('Failed to increment quota after article creation');
      // Continue anyway since article was created successfully
    }

    const quotaRemaining = incrementResult.ok
      ? incrementResult.data.remaining
      : quotaCheckResult.data.remaining - 1;

    logger.info('Article generated successfully', {
      userId: auth.userId,
      articleId: articleResult.data.id,
      quotaRemaining,
    });

    // Return response
    return c.json(
      success(
        {
          article: articleResult.data,
          generatedContent,
          quotaRemaining,
        },
        201,
      ),
      201
    );
  });
};
