"use client";

import { useRouter } from '@/i18n/navigation';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { createBranding } from "@/features/onboarding/actions/create-branding";
import type { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";
import { useTranslations } from 'next-intl';
import { PageLayout } from "@/components/layout/page-layout";
import { useRequiredOrganization } from "@/contexts/organization-context";
import { ROUTES } from "@/lib/routes";

type NewBrandingPageProps = {
  params: Promise<{ orgId: string }>;
};

export default function NewBrandingPage({
  params,
}: NewBrandingPageProps) {
  void params;
  const orgId = useRequiredOrganization();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  const handleComplete = async (data: OnboardingFormData) => {
    try {
      const result = await createBranding(data);

      toast({
        title: t("common.success"),
        description: t("branding.update.success.desc").replace("업데이트", "생성"),
      });

      router.push(ROUTES.BRANDINGS(orgId));
    } catch (error) {
      console.error("Failed to create style guide:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("branding.update.error.desc").replace("업데이트", "생성"),
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout
      title={t("branding.title")}
      description={t("branding.subtitle")}
      maxWidthClassName="max-w-4xl"
    >
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>
      <OnboardingWizard onComplete={handleComplete} />
    </PageLayout>
  );
}
