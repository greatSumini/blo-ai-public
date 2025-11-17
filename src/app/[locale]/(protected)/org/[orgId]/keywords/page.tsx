"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRequiredOrganization } from "@/contexts/organization-context";
import { KeywordTable } from "@/features/keywords/components/KeywordTable";
import { KeywordCreateDialog } from "@/features/keywords/components/KeywordCreateDialog";
import { SuggestionsDialog } from "@/features/keywords/components/SuggestionsDialog";
import { Plus, Lightbulb } from "lucide-react";
import { useTranslations } from 'next-intl';

type KeywordsPageProps = {
  params: Promise<{ orgId: string }>;
};

export default function KeywordsPage({ params }: KeywordsPageProps) {
  void params;
  const orgId = useRequiredOrganization();
  const t = useTranslations('keywords');

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-medium leading-tight text-text-primary">
            {t('title')}
          </h1>
          <p className="mt-2 text-base text-text-secondary leading-relaxed">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-4">
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
        </div>
      </div>

      <Card className="p-6 rounded-xl border-border-default">
        <KeywordTable />
      </Card>
    </div>
  );
}
