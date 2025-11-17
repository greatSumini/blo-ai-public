import type { SupabaseClient } from '@supabase/supabase-js';
import {
  domainFailure,
  domainSuccess,
  type DomainResult,
} from '@/backend/domain/result';
import {
  ArticleTableRowSchema,
  ArticleResponseSchema,
  type ArticleResponse,
  type CreateArticleRequest,
  type UpdateArticleRequest,
  type ListArticlesQuery,
  type ListArticlesResponse,
  type DashboardStatsResponse,
} from '@/features/articles/backend/schema';
import {
  articleErrorCodes,
  type ArticleDomainError,
} from '@/features/articles/backend/error';
import { ensureProfile } from '@/features/profiles/backend/service';

const ARTICLES_TABLE = 'articles';

/**
 * Maps database row (snake_case) to API response (camelCase)
 */
const mapArticleRowToResponse = (row: unknown): ArticleResponse => {
  // Validate the database row
  const rowParse = ArticleTableRowSchema.safeParse(row);

  if (!rowParse.success) {
    throw new Error('Article row failed validation');
  }

  // Map snake_case to camelCase
  const mapped = {
    id: rowParse.data.id,
    profileId: rowParse.data.profile_id,
    title: rowParse.data.title,
    slug: rowParse.data.slug,
    keywords: rowParse.data.keywords,
    description: rowParse.data.description,
    content: rowParse.data.content,
    brandingId: rowParse.data.style_guide_id,
    tone: rowParse.data.tone,
    contentLength: rowParse.data.content_length,
    readingLevel: rowParse.data.reading_level,
    metaTitle: rowParse.data.meta_title,
    metaDescription: rowParse.data.meta_description,
    status: rowParse.data.status,
    publishedAt: rowParse.data.published_at,
    createdAt: rowParse.data.created_at,
    updatedAt: rowParse.data.updated_at,
    views: rowParse.data.views,
    timeSpent: rowParse.data.time_spent,
  } satisfies ArticleResponse;

  // Validate the response
  const parsed = ArticleResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    throw new Error('Article response failed validation');
  }

  return parsed.data;
};

/**
 * Creates a new article draft
 */
export const createArticle = async (
  client: SupabaseClient,
  clerkUserId: string,
  data: CreateArticleRequest,
): Promise<DomainResult<ArticleResponse, ArticleDomainError>> => {
  // Ensure profile exists and get id
  const profile = await ensureProfile(client, clerkUserId);
  const profileId = profile?.id;
  if (!profileId) {
    return domainFailure({ code: articleErrorCodes.createError, message: 'Failed to resolve or create user profile' });
  }
  // Map camelCase TypeScript to snake_case database columns
  const dbRecord = {
    profile_id: profileId,
    title: data.title,
    slug: data.slug,
    keywords: data.keywords,
    description: data.description || null,
    content: data.content,
    style_guide_id: data.brandingId || null,
    tone: data.tone || null,
    content_length: data.contentLength || null,
    reading_level: data.readingLevel || null,
    meta_title: data.metaTitle || null,
    meta_description: data.metaDescription || null,
    status: 'draft' as const,
  };

  const { data: savedData, error } = await client
    .from(ARTICLES_TABLE)
    .insert(dbRecord)
    .select('*')
    .single();

  if (error) {
    return domainFailure({
      code: articleErrorCodes.createError,
      message: `Failed to create article: ${error.message}`,
    });
  }

  if (!savedData) {
    return domainFailure({
      code: articleErrorCodes.createError,
      message: 'Article was created but no data was returned',
    });
  }

  try {
    const mapped = mapArticleRowToResponse(savedData);
    return domainSuccess(mapped);
  } catch (err) {
    return domainFailure({
      code: articleErrorCodes.validationError,
      message: 'Article row failed validation.',
      details: err,
    });
  }
};

/**
 * Gets an article by ID
 * Only returns articles belonging to the specified user
 */
export const getArticleById = async (
  client: SupabaseClient,
  clerkUserId: string,
  articleId: string,
): Promise<DomainResult<ArticleResponse, ArticleDomainError>> => {
  // Ensure profile exists and get id
  const profile = await ensureProfile(client, clerkUserId);
  const profileId = profile?.id;
  if (!profileId) {
    return domainFailure({ code: articleErrorCodes.createError, message: 'Failed to resolve or create user profile' });
  }
  const { data, error } = await client
    .from(ARTICLES_TABLE)
    .select('*')
    .eq('id', articleId)
    .eq('profile_id', profileId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return domainFailure({ code: articleErrorCodes.notFound, message: 'Article not found' });
    }
    return domainFailure({
      code: articleErrorCodes.fetchError,
      message: `Failed to fetch article: ${error.message}`,
    });
  }

  if (!data) {
    return domainFailure({ code: articleErrorCodes.notFound, message: 'Article not found' });
  }

  try {
    const mapped = mapArticleRowToResponse(data);
    return domainSuccess(mapped);
  } catch (err) {
    return domainFailure({
      code: articleErrorCodes.validationError,
      message: 'Article row failed validation.',
      details: err,
    });
  }
};

/**
 * Updates an existing article
 * Only updates articles belonging to the specified user
 */
export const updateArticle = async (
  client: SupabaseClient,
  clerkUserId: string,
  articleId: string,
  data: UpdateArticleRequest,
): Promise<DomainResult<ArticleResponse, ArticleDomainError>> => {
  // Map camelCase TypeScript to snake_case database columns
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.keywords !== undefined) updateData.keywords = data.keywords;
  if (data.description !== undefined)
    updateData.description = data.description || null;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.brandingId !== undefined)
    updateData.style_guide_id = data.brandingId || null;
  if (data.tone !== undefined) updateData.tone = data.tone || null;
  if (data.contentLength !== undefined)
    updateData.content_length = data.contentLength || null;
  if (data.readingLevel !== undefined)
    updateData.reading_level = data.readingLevel || null;
  if (data.metaTitle !== undefined)
    updateData.meta_title = data.metaTitle || null;
  if (data.metaDescription !== undefined)
    updateData.meta_description = data.metaDescription || null;
  if (data.status !== undefined) {
    updateData.status = data.status;
    // If publishing for the first time, set published_at
    if (data.status === 'published') {
      updateData.published_at = new Date().toISOString();
    }
  }

  // Ensure profile exists and get id
  const profile = await ensureProfile(client, clerkUserId);
  const profileId = profile?.id;
  if (!profileId) {
    return domainFailure({ code: articleErrorCodes.createError, message: 'Failed to resolve or create user profile' });
  }
  const { data: updatedData, error } = await client
    .from(ARTICLES_TABLE)
    .update(updateData)
    .eq('id', articleId)
    .eq('profile_id', profileId)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return domainFailure({ code: articleErrorCodes.notFound, message: 'Article not found' });
    }
    return domainFailure({
      code: articleErrorCodes.updateError,
      message: `Failed to update article: ${error.message}`,
    });
  }

  if (!updatedData) {
    return domainFailure({
      code: articleErrorCodes.updateError,
      message: 'Article was updated but no data was returned',
    });
  }

  try {
    const mapped = mapArticleRowToResponse(updatedData);
    return domainSuccess(mapped);
  } catch (err) {
    return domainFailure({
      code: articleErrorCodes.validationError,
      message: 'Article row failed validation.',
      details: err,
    });
  }
};

/**
 * Deletes an article by ID
 * Only deletes articles belonging to the specified user
 */
export const deleteArticle = async (
  client: SupabaseClient,
  clerkUserId: string,
  articleId: string,
): Promise<DomainResult<{ id: string }, ArticleDomainError>> => {
  // Ensure profile exists and get id
  const profile = await ensureProfile(client, clerkUserId);
  const profileId = profile?.id;
  if (!profileId) {
    return domainFailure({ code: articleErrorCodes.createError, message: 'Failed to resolve or create user profile' });
  }
  const { error } = await client
    .from(ARTICLES_TABLE)
    .delete()
    .eq('id', articleId)
    .eq('profile_id', profileId);

  if (error) {
    return domainFailure({
      code: articleErrorCodes.deleteError,
      message: `Failed to delete article: ${error.message}`,
    });
  }

  return domainSuccess({ id: articleId });
};

/**
 * Lists articles with pagination, filtering, and sorting
 */
export const listArticles = async (
  client: SupabaseClient,
  clerkUserId: string,
  query: ListArticlesQuery,
): Promise<DomainResult<ListArticlesResponse, ArticleDomainError>> => {
  // Ensure profile exists and get id
  const profile = await ensureProfile(client, clerkUserId);
  const profileId = profile?.id;
  if (!profileId) {
    return domainFailure({ code: articleErrorCodes.createError, message: 'Failed to resolve or create user profile' });
  }

  // Build the base query
  let dbQuery = client
    .from(ARTICLES_TABLE)
    .select('*', { count: 'exact' })
    .eq('profile_id', profileId);

  // Apply status filter
  if (query.status !== 'all') {
    dbQuery = dbQuery.eq('status', query.status);
  }

  // Apply sorting
  const sortColumn = query.sortBy;
  const sortAscending = query.sortOrder === 'asc';
  dbQuery = dbQuery.order(sortColumn, { ascending: sortAscending });

  // Apply pagination
  const from = query.offset;
  const to = query.offset + query.limit - 1;
  dbQuery = dbQuery.range(from, to);

  const { data, error, count } = await dbQuery;

  if (error) {
    return domainFailure({
      code: articleErrorCodes.fetchError,
      message: `Failed to fetch articles: ${error.message}`,
    });
  }

  if (!data) {
    return domainSuccess({
      articles: [],
      total: 0,
      limit: query.limit,
      offset: query.offset,
    });
  }

  try {
    const articles = data.map((row) => mapArticleRowToResponse(row));
    return domainSuccess({
      articles,
      total: count ?? 0,
      limit: query.limit,
      offset: query.offset,
    });
  } catch (err) {
    return domainFailure({
      code: articleErrorCodes.validationError,
      message: 'One or more article rows failed validation.',
      details: err,
    });
  }
};

/**
 * Gets dashboard statistics for the user
 */
export const getDashboardStats = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<DomainResult<DashboardStatsResponse, ArticleDomainError>> => {
  // Ensure profile exists and get id
  const profile = await ensureProfile(client, clerkUserId);
  const profileId = profile?.id;
  if (!profileId) {
    return domainFailure({ code: articleErrorCodes.createError, message: 'Failed to resolve or create user profile' });
  }

  // Get all articles for the user with views and time_spent
  const { data, error } = await client
    .from(ARTICLES_TABLE)
    .select('status, created_at, views, time_spent')
    .eq('profile_id', profileId);

  if (error) {
    return domainFailure({
      code: articleErrorCodes.fetchError,
      message: `Failed to fetch dashboard stats: ${error.message}`,
    });
  }

  const articles = data || [];

  // Calculate stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get previous month
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const monthlyArticles = articles.filter((article) => {
    const createdAt = new Date(article.created_at);
    return (
      createdAt.getMonth() === currentMonth &&
      createdAt.getFullYear() === currentYear
    );
  }).length;

  const previousMonthArticles = articles.filter((article) => {
    const createdAt = new Date(article.created_at);
    return (
      createdAt.getMonth() === previousMonth &&
      createdAt.getFullYear() === previousMonthYear
    );
  }).length;

  const totalArticles = articles.length;
  const publishedArticles = articles.filter((a) => a.status === 'published').length;
  const draftArticles = articles.filter((a) => a.status === 'draft').length;

  // Calculate total views
  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);

  // Calculate previous month views
  const previousMonthViewsCount = articles
    .filter((article) => {
      const createdAt = new Date(article.created_at);
      return (
        createdAt.getMonth() === previousMonth &&
        createdAt.getFullYear() === previousMonthYear
      );
    })
    .reduce((sum, article) => sum + (article.views || 0), 0);

  // Estimate saved hours (assuming each article saves 2 hours on average)
  const savedHours = totalArticles * 2;

  return domainSuccess({
    monthlyArticles,
    totalArticles,
    publishedArticles,
    draftArticles,
    savedHours,
    monthlyGoal: 10,
    previousMonthArticles,
    totalViews,
    previousMonthViews: previousMonthViewsCount,
  });
};
