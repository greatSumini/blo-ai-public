import type { SupabaseClient } from '@supabase/supabase-js';
import { getProfileIdByClerkId } from '@/features/profiles/backend/service';

const BRANDINGS_TABLE = 'style_guides';

/**
 * 주어진 Clerk 사용자 ID에 대해 DB에서 온보딩 완료 여부를 조회합니다.
 * - profiles 테이블을 통해 profile_id를 찾고
 * - style_guides.onboarding_completed 값을 확인합니다.
 * - 프로필이나 스타일 가이드가 없거나 오류가 발생하면 false 를 반환합니다.
 */
export const getOnboardingCompletedFromDb = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<boolean> => {
  const profileId = await getProfileIdByClerkId(client, clerkUserId);

  if (!profileId) {
    return false;
  }

  try {
    const { data, error } = await client
      .from(BRANDINGS_TABLE)
      .select('onboarding_completed')
      .eq('profile_id', profileId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.onboarding_completed === true;
  } catch {
    return false;
  }
};

