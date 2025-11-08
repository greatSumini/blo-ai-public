"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { OnboardingFormData } from "../lib/onboarding-schema";

/**
 * Create a new style guide
 * Used in /style-guides/new page
 */
export async function createStyleGuide(data: OnboardingFormData) {
  try {
    console.log("[SERVER ACTION] Starting createStyleGuide");

    // Get authenticated user
    const { userId } = await auth();

    console.log("[SERVER ACTION] userId:", userId);

    if (!userId) {
      console.log("[SERVER ACTION] No userId, throwing Unauthorized error");
      throw new Error("Unauthorized");
    }

    // Save style guide data to Supabase via Hono API
    const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/style-guides`;
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

    // Revalidate style guide page
    console.log("[SERVER ACTION] Revalidating style guide paths");
    revalidatePath("/style-guides", "page");
    revalidatePath("/style-guide", "page");

    const result = { success: true, data: savedData.data };
    console.log("[SERVER ACTION] Returning result:", result);
    return result;
  } catch (error) {
    console.error("[SERVER ACTION] Error creating style guide:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "스타일 가이드 생성 중 오류가 발생했습니다"
    );
  }
}
