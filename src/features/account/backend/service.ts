import type { SupabaseClient } from "@supabase/supabase-js";
import {
  domainSuccess,
  domainFailure,
  type DomainResult,
} from "@/backend/domain/result";
import {
  ProfileResponseSchema,
  SettingsResponseSchema,
  type ProfileResponse,
  type SettingsResponse,
  type SettingsRow,
  type UpdateProfileRequest,
  type UpdateSettingsRequest,
} from "./schema";
import { accountErrorCodes, type AccountDomainError } from "./error";
import type { ProfileRow } from "@/features/profiles/backend/service";

const PROFILES_TABLE = "profiles";
const SETTINGS_TABLE = "account_settings";

// ========================================
// Profile Service
// ========================================

export const getProfileByClerkId = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<DomainResult<ProfileResponse, AccountDomainError>> => {
  const { data, error } = await client
    .from(PROFILES_TABLE)
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single<ProfileRow>();

  if (error || !data) {
    return domainFailure({
      code: accountErrorCodes.profileNotFound,
      message: "Profile not found",
    });
  }

  const mapped: ProfileResponse = {
    id: data.id,
    clerkUserId: data.clerk_user_id,
    email: data.email,
    fullName: data.full_name,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  const parsed = ProfileResponseSchema.safeParse(mapped);
  if (!parsed.success) {
    return domainFailure({
      code: accountErrorCodes.validationError,
      message: "Profile validation failed",
      details: parsed.error.format(),
    });
  }

  return domainSuccess(parsed.data);
};

export const updateProfileByClerkId = async (
  client: SupabaseClient,
  clerkUserId: string,
  updates: UpdateProfileRequest,
): Promise<DomainResult<ProfileResponse, AccountDomainError>> => {
  const dbUpdates: Partial<ProfileRow> = {};

  if (updates.fullName !== undefined) {
    dbUpdates.full_name = updates.fullName;
  }
  if (updates.imageUrl !== undefined) {
    dbUpdates.image_url = updates.imageUrl;
  }

  const { data, error } = await client
    .from(PROFILES_TABLE)
    .update(dbUpdates)
    .eq("clerk_user_id", clerkUserId)
    .select("*")
    .single<ProfileRow>();

  if (error || !data) {
    return domainFailure({
      code: accountErrorCodes.profileUpdateFailed,
      message: error?.message ?? "Failed to update profile",
    });
  }

  const mapped: ProfileResponse = {
    id: data.id,
    clerkUserId: data.clerk_user_id,
    email: data.email,
    fullName: data.full_name,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return domainSuccess(mapped);
};

// ========================================
// Settings Service
// ========================================

export const getSettingsByProfileId = async (
  client: SupabaseClient,
  profileId: string,
): Promise<DomainResult<SettingsResponse, AccountDomainError>> => {
  const { data, error } = await client
    .from(SETTINGS_TABLE)
    .select("*")
    .eq("profile_id", profileId)
    .single<SettingsRow>();

  if (error || !data) {
    return domainFailure({
      code: accountErrorCodes.settingsNotFound,
      message: "Settings not found",
    });
  }

  const mapped: SettingsResponse = {
    id: data.id,
    profileId: data.profile_id,
    brandName: data.brand_name,
    brandDescription: data.brand_description,
    targetAudience: data.target_audience,
    tone: data.tone as SettingsResponse["tone"],
    language: data.language as SettingsResponse["language"],
    emailUpdates: data.email_updates,
    weeklyReport: data.weekly_report,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  const parsed = SettingsResponseSchema.safeParse(mapped);
  if (!parsed.success) {
    return domainFailure({
      code: accountErrorCodes.validationError,
      message: "Settings validation failed",
      details: parsed.error.format(),
    });
  }

  return domainSuccess(parsed.data);
};

export const updateSettingsByProfileId = async (
  client: SupabaseClient,
  profileId: string,
  updates: UpdateSettingsRequest,
): Promise<DomainResult<SettingsResponse, AccountDomainError>> => {
  const dbUpdates: Partial<SettingsRow> = {};

  if (updates.brandName !== undefined) dbUpdates.brand_name = updates.brandName;
  if (updates.brandDescription !== undefined) dbUpdates.brand_description = updates.brandDescription;
  if (updates.targetAudience !== undefined) dbUpdates.target_audience = updates.targetAudience;
  if (updates.tone !== undefined) dbUpdates.tone = updates.tone;
  if (updates.language !== undefined) dbUpdates.language = updates.language;
  if (updates.emailUpdates !== undefined) dbUpdates.email_updates = updates.emailUpdates;
  if (updates.weeklyReport !== undefined) dbUpdates.weekly_report = updates.weeklyReport;

  const { data, error } = await client
    .from(SETTINGS_TABLE)
    .update(dbUpdates)
    .eq("profile_id", profileId)
    .select("*")
    .single<SettingsRow>();

  if (error || !data) {
    return domainFailure({
      code: accountErrorCodes.settingsUpdateFailed,
      message: error?.message ?? "Failed to update settings",
    });
  }

  const mapped: SettingsResponse = {
    id: data.id,
    profileId: data.profile_id,
    brandName: data.brand_name,
    brandDescription: data.brand_description,
    targetAudience: data.target_audience,
    tone: data.tone as SettingsResponse["tone"],
    language: data.language as SettingsResponse["language"],
    emailUpdates: data.email_updates,
    weeklyReport: data.weekly_report,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return domainSuccess(mapped);
};

export const ensureSettings = async (
  client: SupabaseClient,
  profileId: string,
): Promise<DomainResult<SettingsResponse, AccountDomainError>> => {
  // 먼저 조회 시도
  const existing = await getSettingsByProfileId(client, profileId);
  if (existing.ok) {
    return existing;
  }

  // 없으면 기본값으로 생성
  const { data, error } = await client
    .from(SETTINGS_TABLE)
    .insert({
      profile_id: profileId,
      brand_name: null,
      brand_description: null,
      target_audience: null,
      tone: "professional",
      language: "ko",
      email_updates: true,
      weekly_report: false,
    })
    .select("*")
    .single<SettingsRow>();

  if (error || !data) {
    return domainFailure({
      code: accountErrorCodes.settingsUpdateFailed,
      message: "Failed to create default settings",
    });
  }

  const mapped: SettingsResponse = {
    id: data.id,
    profileId: data.profile_id,
    brandName: data.brand_name,
    brandDescription: data.brand_description,
    targetAudience: data.target_audience,
    tone: data.tone as SettingsResponse["tone"],
    language: data.language as SettingsResponse["language"],
    emailUpdates: data.email_updates,
    weeklyReport: data.weekly_report,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return domainSuccess(mapped);
};
