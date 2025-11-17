"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { OnboardingFormData } from "../lib/onboarding-schema";

/**
 * Complete the onboarding process
 * Saves data to Supabase and updates Clerk metadata
 */
export async function completeOnboarding(data: OnboardingFormData) {
  try {
    console.log("[SERVER ACTION] Starting completeOnboarding");

    // Get authenticated user
    const { userId } = await auth();

    console.log("[SERVER ACTION] userId:", userId);

    if (!userId) {
      console.log("[SERVER ACTION] No userId, throwing Unauthorized error");
      throw new Error("Unauthorized");
    }

    // Save onboarding data to Supabase via Hono API
    const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/brandings`;
    console.log("[SERVER ACTION] Saving style guide to API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-clerk-user-id": userId,
      },
      body: JSON.stringify(data),
    });

    console.log("[SERVER ACTION] API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[SERVER ACTION] Failed to save style guide:", errorData);
      throw new Error(
        errorData.error?.message || "스타일 가이드 저장에 실패했습니다"
      );
    }

    const savedData = await response.json();
    console.log("[SERVER ACTION] Style guide saved successfully:", savedData);

    // Update Clerk metadata only after successful Supabase save
    console.log("[SERVER ACTION] Updating Clerk metadata for user:", userId);
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingCompleted: true,
      },
    });

    console.log("[SERVER ACTION] Clerk metadata updated successfully");

    // Also update the database to mark onboarding as completed
    // This ensures the middleware can check completion status from DB instead of relying on Clerk's session cache
    console.log("[SERVER ACTION] Updating database onboarding_completed status");
    const updateApiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/complete`;
    const updateResponse = await fetch(updateApiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-clerk-user-id": userId,
      },
      body: JSON.stringify({ onboarding_completed: true }),
    });

    if (!updateResponse.ok) {
      console.warn("[SERVER ACTION] Failed to update onboarding status in DB (non-critical)", updateResponse.status);
    } else {
      console.log("[SERVER ACTION] Database onboarding_completed status updated successfully");
    }

    console.log("[SERVER ACTION] Onboarding completed successfully for user:", userId);

    // Revalidate the dashboard path to ensure fresh middleware checks
    // This is safe because we're not on /auth/onboarding anymore when this runs
    console.log("[SERVER ACTION] Revalidating cache paths");
    revalidatePath("/dashboard", "page");
    revalidatePath("/", "layout");

    const result = { success: true, redirectUrl: "/dashboard?welcome=true" };
    console.log("[SERVER ACTION] Returning result:", result);
    return result;
  } catch (error) {
    console.error("[SERVER ACTION] Error completing onboarding:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "온보딩 완료 중 오류가 발생했습니다"
    );
  }
}
