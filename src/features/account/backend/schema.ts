import { z } from "zod";

// ========================================
// Profile Schemas
// ========================================

export const ProfileResponseSchema = z.object({
  id: z.string().uuid(),
  clerkUserId: z.string(),
  email: z.string().email().nullable(),
  fullName: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

export const UpdateProfileRequestSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  imageUrl: z.string().optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

// ========================================
// Settings Schemas
// ========================================

export const SettingsResponseSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  brandName: z.string().nullable(),
  brandDescription: z.string().nullable(),
  targetAudience: z.string().nullable(),
  tone: z.enum(["friendly", "professional", "casual", "formal"]).nullable(),
  language: z.enum(["ko", "en"]).nullable(),
  emailUpdates: z.boolean(),
  weeklyReport: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SettingsResponse = z.infer<typeof SettingsResponseSchema>;

export const UpdateSettingsRequestSchema = z.object({
  brandName: z.string().max(100).optional(),
  brandDescription: z.string().max(500).optional(),
  targetAudience: z.string().max(300).optional(),
  tone: z.enum(["friendly", "professional", "casual", "formal"]).optional(),
  language: z.enum(["ko", "en"]).optional(),
  emailUpdates: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
});

export type UpdateSettingsRequest = z.infer<typeof UpdateSettingsRequestSchema>;

// ========================================
// Database Table Schemas
// ========================================

export const SettingsRowSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  brand_name: z.string().nullable(),
  brand_description: z.string().nullable(),
  target_audience: z.string().nullable(),
  tone: z.string().nullable(),
  language: z.string().nullable(),
  email_updates: z.boolean(),
  weekly_report: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SettingsRow = z.infer<typeof SettingsRowSchema>;
