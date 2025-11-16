"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeywordTable } from "@/features/keywords/components/KeywordTable";
import { KeywordCreateDialog } from "@/features/keywords/components/KeywordCreateDialog";
import { SuggestionsDialog } from "@/features/keywords/components/SuggestionsDialog";
import { Plus, Lightbulb } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { useTranslations } from 'next-intl';

type KeywordsPageProps = {
  params: Promise<Record<string, never>>;
};

export default function KeywordsPage({ params }: KeywordsPageProps) {
  void params;
  const t = useTranslations('keywords');

  return (
    <PageLayout
      title={t('title')}
      description={t('description')}
      actions={
        <>
          <SuggestionsDialog>
            <Button variant="outline">
              <Lightbulb className="mr-2 h-4 w-4" />
              {t('suggestions.title')}
            </Button>
          </SuggestionsDialog>
          <KeywordCreateDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('create.trigger')}
            </Button>
          </KeywordCreateDialog>
        </>
      }
    >
      <Card className="p-6 border-gray-200 rounded-xl">
        <KeywordTable />
      </Card>
    </PageLayout>
  );
}
