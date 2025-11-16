"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { useTranslations } from 'next-intl';

type ArticlesPageProps = {
  params: Promise<Record<string, never>>;
};

export default function ArticlesPage({ params }: ArticlesPageProps) {
  void params;
  const t = useTranslations('articles');

  return (
    <PageLayout
      title={t('title')}
      description={t('description')}
    >
      <div
        className="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
        style={{ borderColor: "#E1E5EA" }}
      >
        {t('coming_soon')}
      </div>
    </PageLayout>
  );
}
