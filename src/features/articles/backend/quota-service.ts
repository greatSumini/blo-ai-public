import type { SupabaseClient } from '@supabase/supabase-js';
import {
  domainFailure,
  domainSuccess,
  type DomainResult,
} from '@/backend/domain/result';
import {
  articleErrorCodes,
  type ArticleDomainError,
} from '@/features/articles/backend/error';

const GENERATION_QUOTA_TABLE = 'generation_quota';

// Quota limits per tier
const QUOTA_LIMITS = {
  free: 10,
  pro: 100,
} as const;

type TierType = 'free' | 'pro';

interface QuotaRow {
  id: string;
  profile_id: string;
  tier: TierType;
  generation_count: number;
  last_reset_at: string;
  created_at: string;
  updated_at: string;
}

interface QuotaCheckResult {
  allowed: boolean;
  tier: TierType;
  currentCount: number;
  limit: number;
  remaining: number;
}

/**
 * Gets or creates quota record for user
 */
const getOrCreateQuotaRecord = async (
  client: SupabaseClient,
  profileId: string,
): Promise<QuotaRow | null> => {
  // Try to get existing record
  const { data: existing } = await client
    .from(GENERATION_QUOTA_TABLE)
    .select('*')
    .eq('profile_id', profileId)
    .single();

  if (existing) {
    return existing as QuotaRow;
  }

  // Create new record if doesn't exist
  const { data: newRecord, error } = await client
    .from(GENERATION_QUOTA_TABLE)
    .insert({
      profile_id: profileId,
      tier: 'free',
      generation_count: 0,
    })
    .select('*')
    .single();

  if (error || !newRecord) {
    return null;
  }

  return newRecord as QuotaRow;
};

/**
 * Checks if user has available quota
 * Returns quota information including remaining count
 */
export const checkQuota = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<DomainResult<QuotaCheckResult, ArticleDomainError>> => {
  try {
    // Resolve profile id
    const { getProfileIdByClerkId } = await import('@/features/profiles/backend/service');
    const profileId = await getProfileIdByClerkId(client, clerkUserId);
    if (!profileId) {
      return domainFailure({ code: articleErrorCodes.quotaCheckFailed, message: 'Profile not found' });
    }
    const quota = await getOrCreateQuotaRecord(client, profileId);

    if (!quota) {
      return domainFailure({
        code: articleErrorCodes.quotaCheckFailed,
        message: 'Failed to retrieve or create quota record',
      });
    }

    const tier = quota.tier as TierType;
    const limit = QUOTA_LIMITS[tier];
    const currentCount = quota.generation_count;
    const remaining = Math.max(0, limit - currentCount);
    const allowed = currentCount < limit;

    return domainSuccess({
      allowed,
      tier,
      currentCount,
      limit,
      remaining,
    });
  } catch (error) {
    return domainFailure({
      code: articleErrorCodes.quotaCheckFailed,
      message: `Quota check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error,
    });
  }
};

/**
 * Increments generation count for user
 * Uses atomic update to prevent race conditions
 */
export const incrementQuota = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<DomainResult<{ newCount: number; remaining: number }, ArticleDomainError>> => {
  try {
    // Get current quota to determine tier
    const { getProfileIdByClerkId } = await import('@/features/profiles/backend/service');
    const profileId = await getProfileIdByClerkId(client, clerkUserId);
    if (!profileId) {
      return domainFailure({ code: articleErrorCodes.quotaIncrementFailed, message: 'Profile not found' });
    }
    const quota = await getOrCreateQuotaRecord(client, profileId);

    if (!quota) {
      return domainFailure({
        code: articleErrorCodes.quotaIncrementFailed,
        message: 'Failed to retrieve quota record',
      });
    }

    const tier = quota.tier as TierType;
    const limit = QUOTA_LIMITS[tier];

    // Atomic increment using PostgreSQL
    const { data, error } = await client
      .from(GENERATION_QUOTA_TABLE)
      .update({
        generation_count: quota.generation_count + 1,
      })
      .eq('profile_id', profileId)
      .eq('generation_count', quota.generation_count) // Ensure no race condition
      .select('generation_count')
      .single();

    if (error || !data) {
      return domainFailure({
        code: articleErrorCodes.quotaIncrementFailed,
        message: `Failed to increment quota: ${error?.message || 'Unknown error'}`,
      });
    }

    const newCount = data.generation_count;
    const remaining = Math.max(0, limit - newCount);

    return domainSuccess({ newCount, remaining });
  } catch (error) {
    return domainFailure({
      code: articleErrorCodes.quotaIncrementFailed,
      message: `Quota increment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error,
    });
  }
};

/**
 * Gets quota status for user (without creating record)
 */
export const getQuotaStatus = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<DomainResult<QuotaCheckResult, ArticleDomainError>> => {
  try {
    const { getProfileIdByClerkId } = await import('@/features/profiles/backend/service');
    const profileId = await getProfileIdByClerkId(client, clerkUserId);
    const { data: quota } = await client
      .from(GENERATION_QUOTA_TABLE)
      .select('*')
      .eq('profile_id', profileId ?? '')
      .single();

    if (!quota) {
      // Return default free tier status
      return domainSuccess({
        allowed: true,
        tier: 'free',
        currentCount: 0,
        limit: QUOTA_LIMITS.free,
        remaining: QUOTA_LIMITS.free,
      });
    }

    const tier = quota.tier as TierType;
    const limit = QUOTA_LIMITS[tier];
    const currentCount = quota.generation_count;
    const remaining = Math.max(0, limit - currentCount);
    const allowed = currentCount < limit;

    return domainSuccess({
      allowed,
      tier,
      currentCount,
      limit,
      remaining,
    });
  } catch (error) {
    return domainFailure({
      code: articleErrorCodes.quotaCheckFailed,
      message: `Failed to get quota status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error,
    });
  }
};
