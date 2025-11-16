import { Hono } from "hono";
import { getAuth } from "@hono/clerk-auth";
import type { AppEnv } from "@/backend/hono/context";
import { respondWithDomain } from "@/backend/http/mapper";
import { failure } from "@/backend/http/response";
import {
  UpdateProfileRequestSchema,
  UpdateSettingsRequestSchema,
} from "./schema";
import {
  getProfileByClerkId,
  updateProfileByClerkId,
  getSettingsByProfileId,
  updateSettingsByProfileId,
  ensureSettings,
} from "./service";

const app = new Hono<AppEnv>();

// ========================================
// Profile Routes
// ========================================

/**
 * GET /api/account/profile
 * Get current user's profile
 */
app.get("/api/account/profile", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json(
      failure(401, "UNAUTHORIZED", "Authentication required. Please sign in."),
      401
    );
  }

  const supabase = c.get("supabase");

  const result = await getProfileByClerkId(supabase, auth.userId);
  return respondWithDomain(c, result);
});

/**
 * PUT /api/account/profile
 * Update current user's profile
 */
app.put("/api/account/profile", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json(
      failure(401, "UNAUTHORIZED", "Authentication required. Please sign in."),
      401
    );
  }

  const supabase = c.get("supabase");

  const body = await c.req.json();
  const parsed = UpdateProfileRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(failure(400, "VALIDATION_ERROR", "Invalid request body"), 400);
  }

  const result = await updateProfileByClerkId(supabase, auth.userId, parsed.data);
  return respondWithDomain(c, result);
});

// ========================================
// Settings Routes
// ========================================

/**
 * GET /api/account/settings
 * Get current user's account settings (auto-creates if not exists)
 */
app.get("/api/account/settings", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json(
      failure(401, "UNAUTHORIZED", "Authentication required. Please sign in."),
      401
    );
  }

  const supabase = c.get("supabase");

  // First get profile to get profileId
  const profileResult = await getProfileByClerkId(supabase, auth.userId);
  if (!profileResult.ok) {
    return respondWithDomain(c, profileResult);
  }

  const profileId = profileResult.data.id;

  // Get or create settings
  const result = await ensureSettings(supabase, profileId);
  return respondWithDomain(c, result);
});

/**
 * PUT /api/account/settings
 * Update current user's account settings
 */
app.put("/api/account/settings", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json(
      failure(401, "UNAUTHORIZED", "Authentication required. Please sign in."),
      401
    );
  }

  const supabase = c.get("supabase");

  const body = await c.req.json();
  const parsed = UpdateSettingsRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(failure(400, "VALIDATION_ERROR", "Invalid request body"), 400);
  }

  // First get profile to get profileId
  const profileResult = await getProfileByClerkId(supabase, auth.userId);
  if (!profileResult.ok) {
    return respondWithDomain(c, profileResult);
  }

  const profileId = profileResult.data.id;

  // Ensure settings exist before updating
  const ensureResult = await ensureSettings(supabase, profileId);
  if (!ensureResult.ok) {
    return respondWithDomain(c, ensureResult);
  }

  // Update settings
  const result = await updateSettingsByProfileId(supabase, profileId, parsed.data);
  return respondWithDomain(c, result);
});

export default app;
