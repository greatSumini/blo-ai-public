"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { updateStyleGuideAction } from "@/features/articles/actions/article-actions";
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";
import type { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";
import { getUserStyleGuide } from "@/features/articles/actions/article-actions";

type EditStyleGuidePageProps = {
  params: Promise<{ id: string }>;
};

export default function EditStyleGuidePage({
  params,
}: EditStyleGuidePageProps) {
  const resolvedParams = use(params);
  const guideId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();

  // Fetch current style guide
  const { data: guide, isLoading, isError } = useQuery<StyleGuideResponse | null>({
    queryKey: ["userStyleGuide", guideId],
    queryFn: getUserStyleGuide,
    retry: false,
  });

  const handleComplete = async (data: OnboardingFormData) => {
    try {
      await updateStyleGuideAction(guideId, data);

      toast({
        title: "성공",
        description: "스타일 가이드가 업데이트되었습니다.",
      });

      // Redirect to style guides page
      router.push("/style-guides");
    } catch (error) {
      console.error("Failed to update style guide:", error);
      toast({
        title: "오류",
        description:
          error instanceof Error
            ? error.message
            : "스타일 가이드 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !guide) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <p className="text-red-500">스타일 가이드를 불러오는 데 실패했습니다.</p>
            <Button onClick={() => router.back()}>뒤로</Button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare initial values from fetched guide
  const initialValues: OnboardingFormData = {
    brandName: guide.brandName,
    brandDescription: guide.brandDescription,
    personality: guide.personality || [],
    formality: guide.formality,
    targetAudience: guide.targetAudience,
    painPoints: guide.painPoints,
    language: guide.language,
    tone: guide.tone,
    contentLength: guide.contentLength,
    readingLevel: guide.readingLevel,
    notes: guide.notes || "",
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

      {/* 마법사 - 수정 모드 */}
      {/* 마법사 컴포넌트는 수정 모드에서 initialValues를 지원하지 않으므로
          여기서는 간단한 메시지를 표시합니다 */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border p-6" style={{ borderColor: "#E1E5EA" }}>
          <h1 className="text-2xl font-bold mb-4" style={{ color: "#1F2937" }}>
            스타일 가이드 편집
          </h1>
          <p className="text-muted-foreground mb-6">
            현재 스타일 가이드를 다시 생성하려면 새 가이드 생성 페이지로 이동하세요.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/style-guides/new")}>
              새 가이드 생성
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              취소
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
