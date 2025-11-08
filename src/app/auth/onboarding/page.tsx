"use client";

import { toast } from "sonner";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { completeOnboarding } from "@/features/onboarding/actions/complete-onboarding";
import { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";

export default function OnboardingPage() {

  const handleComplete = async (data: OnboardingFormData) => {
    try {
      console.log("[ONBOARDING] Starting completion with data:", data);

      // Call server action
      const result = await completeOnboarding(data);

      console.log("[ONBOARDING] Server action result:", result);

      if (result.success) {
        console.log("[ONBOARDING] Success! Redirecting to dashboard with query params");
        // Navigate to dashboard with special query param to bypass middleware onboarding check
        // The middleware will allow access and then clean up the param on redirect
        // This works around Clerk's session caching delay
        const redirectUrl = "/dashboard?onboarding_completed=true&welcome=true";
        console.log("[ONBOARDING] Redirect URL:", redirectUrl);
        window.location.href = redirectUrl;
      } else {
        console.log("[ONBOARDING] Server action failed");
      }
    } catch (error) {
      console.error("[ONBOARDING] Error during completion:", error);
      // Show error message
      toast.error("오류가 발생했습니다", {
        description:
          error instanceof Error
            ? error.message
            : "온보딩 완료 중 문제가 발생했습니다",
      });
      throw error;
    }
  };

  return <OnboardingWizard onComplete={handleComplete} />;
}
