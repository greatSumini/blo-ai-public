import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/backend/supabase/client";
import { getOnboardingCompletedFromDb } from "@/features/onboarding/backend/onboarding-status";

export default async function AfterAuthPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let onboardingCompleted = false;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error(
      "[AfterAuth] Missing Supabase credentials for onboarding check",
    );
  } else {
    try {
      const supabase = createServiceClient({
        url: supabaseUrl,
        serviceRoleKey: supabaseServiceRoleKey,
      });
      onboardingCompleted = await getOnboardingCompletedFromDb(
        supabase,
        userId,
      );
    } catch (error) {
      console.error("[AfterAuth] Error checking onboarding status:", error);
      onboardingCompleted = false;
    }
  }

  if (onboardingCompleted) {
    redirect("/dashboard");
  } else {
    redirect("/auth/onboarding");
  }
}
