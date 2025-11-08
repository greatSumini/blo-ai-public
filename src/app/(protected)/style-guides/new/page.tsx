"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { createStyleGuide } from "@/features/onboarding/actions/create-style-guide";
import type { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";

type NewStyleGuidePageProps = {
  params: Promise<Record<string, never>>;
};

export default function NewStyleGuidePage({
  params,
}: NewStyleGuidePageProps) {
  void params;
  const router = useRouter();
  const { toast } = useToast();

  const handleComplete = async (data: OnboardingFormData) => {
    try {
      const result = await createStyleGuide(data);

      toast({
        title: "성공",
        description: "스타일 가이드가 생성되었습니다.",
      });

      // Redirect to style guides page
      router.push("/style-guides");
    } catch (error) {
      console.error("Failed to create style guide:", error);
      toast({
        title: "오류",
        description:
          error instanceof Error
            ? error.message
            : "스타일 가이드 생성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
      {/* 뒤로 버튼 */}
      <div className="container mx-auto max-w-4xl px-4 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로
        </Button>
      </div>

      {/* 마법사 */}
      <OnboardingWizard onComplete={handleComplete} />
    </div>
  );
}
