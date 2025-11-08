import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';

export type ProfileRow = {
  id: string;
  clerk_user_id: string;
  email: string | null;
  full_name: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

const PROFILES_TABLE = 'profiles';

export const getProfileByClerkId = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<ProfileRow | null> => {
  const { data } = await client
    .from(PROFILES_TABLE)
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();
  return (data as ProfileRow) ?? null;
};

export const getProfileIdByClerkId = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<string | null> => {
  const { data } = await client
    .from(PROFILES_TABLE)
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();
  return (data?.id as string | undefined) ?? null;
};

export const ensureProfile = async (
  client: SupabaseClient,
  clerkUserId: string,
  opts?: { email?: string | null; fullName?: string | null; imageUrl?: string | null },
): Promise<ProfileRow | null> => {
  const existing = await getProfileByClerkId(client, clerkUserId);
  if (existing) return existing;

  const { data } = await client
    .from(PROFILES_TABLE)
    .insert({
      clerk_user_id: clerkUserId,
      email: opts?.email ?? null,
      full_name: opts?.fullName ?? null,
      image_url: opts?.imageUrl ?? null,
    })
    .select('*')
    .single();

  return (data as ProfileRow) ?? null;
};

export type UpsertProfilePayload = {
  clerkUserId: string;
  email?: string | null;
  fullName?: string | null;
  imageUrl?: string | null;
};

export const upsertProfile = async (
  client: SupabaseClient,
  payload: UpsertProfilePayload,
): Promise<HandlerResult<ProfileRow, string, unknown>> => {
  const { clerkUserId, email = null, fullName = null, imageUrl = null } = payload;

  const { data, error } = await client
    .from(PROFILES_TABLE)
    .upsert(
      {
        clerk_user_id: clerkUserId,
        email,
        full_name: fullName,
        image_url: imageUrl,
      },
      { onConflict: 'clerk_user_id', ignoreDuplicates: false },
    )
    .select('*')
    .single();

  if (error || !data) {
    return failure(500, 'profile_upsert_failed', error?.message ?? 'Unknown error');
  }

  return success(data as ProfileRow, 200);
};

export const deleteProfileByClerkId = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<HandlerResult<{ success: boolean }, string, unknown>> => {
  const { error } = await client
    .from(PROFILES_TABLE)
    .delete()
    .eq('clerk_user_id', clerkUserId);

  if (error) return failure(500, 'profile_delete_failed', error.message);
  return success({ success: true }, 200);
};
