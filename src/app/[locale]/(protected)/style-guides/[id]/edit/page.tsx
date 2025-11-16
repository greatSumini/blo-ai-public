"use client";

import { use } from "react";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/layout/page-layout";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { EditSkeleton } from "@/features/style-guides/components/edit-skeleton";
import { ErrorDisplay } from "@/components/error-display";
import {
  useStyleGuide,
  useUpdateStyleGuide,
} from "@/features/articles/hooks/useStyleGuideQuery";
import type { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";
import { ROUTES } from "@/lib/routes";

type EditStyleGuidePageProps = {
  params: Promise<{ id: string }>;
};

/**
 * StyleGuideResponse를 OnboardingFormData로 변환
 */
function transformGuideToFormData(
  guide: StyleGuideResponse
): OnboardingFormData {
  return {
    brandName: guide.brandName,
    brandDescription: guide.brandDescription,
    personality: guide.personality,
    formality: guide.formality,
    targetAudience: guide.targetAudience,
    painPoints: guide.painPoints,
    language: guide.language,
    tone: guide.tone,
    contentLength: guide.contentLength,
    readingLevel: guide.readingLevel,
    notes: guide.notes || "", // nullable 처리
  };
}

export default function EditStyleGuidePage({
  params,
}: EditStyleGuidePageProps) {
  const resolvedParams = use(params);
  const guideId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  const {
    data: guide,
    isLoading,
    isError,
    refetch,
  } = useStyleGuide(guideId);
  const updateStyleGuide = useUpdateStyleGuide();

  const handleComplete = async (data: OnboardingFormData) => {
    try {
      await updateStyleGuide.mutateAsync({ guideId, data });

      toast({
        title: t("common.success"),
        description: t("styleGuide.update.success.desc"),
      });

      router.push(ROUTES.STYLE_GUIDES);
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("styleGuide.update.error.desc"),
        variant: "destructive",
      });
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <PageLayout
        title={t("styleGuide.edit.title")}
        description={t("styleGuide.edit.description")}
        maxWidthClassName="max-w-7xl"
      >
        <EditSkeleton />
      </PageLayout>
    );
  }

  // 에러 상태
  if (isError || !guide) {
    return (
      <PageLayout
        title={t("styleGuide.edit.title")}
        description={t("styleGuide.edit.description")}
        maxWidthClassName="max-w-7xl"
      >
        <ErrorDisplay
          message={t("styleGuide.error.load")}
          onRetry={() => refetch()}
          onBack={() => router.push(ROUTES.STYLE_GUIDES)}
        />
      </PageLayout>
    );
  }

  // 메인 콘텐츠
  return (
    <PageLayout
      title={t("styleGuide.edit.title")}
      description={guide.brandName || t("styleGuide.edit.description")}
      maxWidthClassName="max-w-7xl"
    >
      <OnboardingWizard
        initialData={transformGuideToFormData(guide)}
        mode="edit"
        onComplete={handleComplete}
      />
    </PageLayout>
  );
}
