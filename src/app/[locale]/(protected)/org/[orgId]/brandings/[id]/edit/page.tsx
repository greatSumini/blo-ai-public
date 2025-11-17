"use client";

import { use } from "react";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/layout/page-layout";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { EditSkeleton } from "@/features/brandings/components/edit-skeleton";
import { ErrorDisplay } from "@/components/error-display";
import {
  useBranding,
  useUpdateBranding,
} from "@/features/articles/hooks/useBrandingQuery";
import type { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";
import type { BrandingResponse } from "@/features/onboarding/backend/schema";
import { ROUTES } from "@/lib/routes";
import { useRequiredOrganization } from "@/contexts/organization-context";

type EditBrandingPageProps = {
  params: Promise<{ orgId: string; id: string }>;
};

/**
 * BrandingResponse를 OnboardingFormData로 변환
 */
function transformGuideToFormData(
  guide: BrandingResponse
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

export default function EditBrandingPage({
  params,
}: EditBrandingPageProps) {
  const resolvedParams = use(params);
  const orgId = useRequiredOrganization();
  const guideId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  const {
    data: guide,
    isLoading,
    isError,
    refetch,
  } = useBranding(guideId);
  const updateStyleGuide = useUpdateBranding();

  const handleComplete = async (data: OnboardingFormData) => {
    try {
      await updateStyleGuide.mutateAsync({ guideId, data });

      toast({
        title: t("common.success"),
        description: t("branding.update.success.desc"),
      });

      router.push(ROUTES.BRANDINGS(orgId));
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("branding.update.error.desc"),
        variant: "destructive",
      });
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <PageLayout
        title={t("branding.edit.title")}
        description={t("branding.edit.description")}
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
        title={t("branding.edit.title")}
        description={t("branding.edit.description")}
        maxWidthClassName="max-w-7xl"
      >
        <ErrorDisplay
          message={t("branding.error.load")}
          onRetry={() => refetch()}
          onBack={() => router.push(ROUTES.BRANDINGS(orgId))}
        />
      </PageLayout>
    );
  }

  // 메인 콘텐츠
  return (
    <PageLayout
      title={t("branding.edit.title")}
      description={guide.brandName || t("branding.edit.description")}
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
