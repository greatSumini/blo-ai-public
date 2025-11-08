"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingFormData } from "../lib/onboarding-schema";

/**
 * Complete the onboarding process
 * Saves data to Supabase and updates Clerk metadata
 */
export async function completeOnboarding(data: OnboardingFormData) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Save onboarding data to Supabase via Hono API
    const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/style-guides`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-clerk-user-id": userId,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to save style guide:", errorData);
      throw new Error(
        errorData.error?.message || "스타일 가이드 저장에 실패했습니다"
      );
    }

    const savedData = await response.json();
    console.log("Style guide saved successfully:", savedData);

    // Update Clerk metadata only after successful Supabase save
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingCompleted: true,
      },
    });

    console.log("Onboarding completed successfully for user:", userId);

    return { success: true };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "온보딩 완료 중 오류가 발생했습니다"
    );
  }
}
