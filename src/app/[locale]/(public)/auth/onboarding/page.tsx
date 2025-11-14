"use client";

import { toast } from "sonner";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { completeOnboarding } from "@/features/onboarding/actions/complete-onboarding";
import { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";

export default function OnboardingPage() {
  const handleComplete = async (data: OnboardingFormData) => {
    try {
      const result = await completeOnboarding(data);
      if (result.success) {
        const redirectUrl = "/dashboard?onboarding_completed=true&welcome=true";
        window.location.href = redirectUrl;
      }
    } catch (error) {
      toast.error("오류가 발생했습니다", {
        description: error instanceof Error ? error.message : "온보딩 완료 중 문제가 발생했습니다",
      });
      throw error;
    }
  };

  return <OnboardingWizard onComplete={handleComplete} />;
}

