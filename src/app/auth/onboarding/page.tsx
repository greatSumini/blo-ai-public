"use client";

import { toast } from "sonner";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { completeOnboarding } from "@/features/onboarding/actions/complete-onboarding";
import { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";

export default function OnboardingPage() {

  const handleComplete = async (data: OnboardingFormData) => {
    try {
      // Call server action
      const result = await completeOnboarding(data);

      if (result.success) {
        // Navigate to dashboard with special query param to bypass middleware onboarding check
        // The middleware will allow access and then clean up the param on redirect
        // This works around Clerk's session caching delay
        window.location.href = "/dashboard?onboarding_completed=true&welcome=true";
      }
    } catch (error) {
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
