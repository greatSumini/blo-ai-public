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

    // Step 1: Save style guide to Supabase via Hono API
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

    // Step 2: Get or create organization
    console.log("[SERVER ACTION] Checking for existing organizations");
    let orgId: string;

    const orgsApiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/organizations`;
    const orgsResponse = await fetch(orgsApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-clerk-user-id": userId,
      },
    });

    if (!orgsResponse.ok) {
      console.warn("[SERVER ACTION] Failed to fetch organizations, will attempt to create one");
    }

    const orgsData = await orgsResponse.json().catch(() => ({ organizations: [] }));
    const organizations = orgsData.organizations || [];

    console.log("[SERVER ACTION] Found", organizations.length, "existing organizations");

    if (organizations.length === 0) {
      // Create new organization
      console.log("[SERVER ACTION] Creating new organization");
      const organizationName = data.brandName || "My Organization";

      const createOrgResponse = await fetch(orgsApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": userId,
        },
        body: JSON.stringify({
          name: organizationName,
          description: "Personal organization",
        }),
      });

      if (!createOrgResponse.ok) {
        const errorData = await createOrgResponse.json().catch(() => ({}));
        console.error("[SERVER ACTION] Failed to create organization:", errorData);
        throw new Error(
          errorData.error?.message || "조직 생성에 실패했습니다"
        );
      }

      const newOrgData = await createOrgResponse.json();
      orgId = newOrgData.id;
      console.log("[SERVER ACTION] Organization created successfully with ID:", orgId);
    } else {
      // Use first organization
      orgId = organizations[0].id;
      console.log("[SERVER ACTION] Using existing organization with ID:", orgId);
    }

    // Step 3: Update Clerk metadata
    console.log("[SERVER ACTION] Updating Clerk metadata for user:", userId);
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingCompleted: true,
      },
    });

    console.log("[SERVER ACTION] Clerk metadata updated successfully");

    // Step 4: Update database onboarding status
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

    // Step 5: Revalidate cache paths
    console.log("[SERVER ACTION] Revalidating cache paths");
    revalidatePath("/dashboard", "page");
    revalidatePath(`/org/${orgId}/dashboard`, "page");
    revalidatePath("/", "layout");

    // Step 6: Redirect to organization dashboard
    const redirectUrl = `/org/${orgId}/dashboard?onboarding_completed=true&welcome=true`;
    const result = { success: true, redirectUrl };
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
