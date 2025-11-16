'use client';

import { useTranslations } from 'next-intl';
import { ArticleCard } from './ArticleCard';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';
import type { ArticleResponse } from '@/features/articles/lib/dto';

interface RecentArticlesGridProps {
  articles: ArticleResponse[];
  onViewArticle: (id: string) => void;
  onViewAll: () => void;
}

export function RecentArticlesGrid({
  articles,
  onViewArticle,
  onViewAll,
}: RecentArticlesGridProps) {
  const t = useTranslations('dashboard.recentArticles');

  if (articles.length === 0) {
    return (
      <section className="animate-fade-in-up-delay-200 motion-reduce:animate-none">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-medium leading-tight text-text-primary">{t('title')}</h2>
        </div>

        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border-default rounded-lg">
          <FileText className="w-12 h-12 text-text-secondary mb-4" aria-hidden="true" />
          <p className="text-lg font-medium text-text-secondary mb-2">
            {t('empty.title')}
          </p>
          <p className="text-sm text-text-tertiary text-center max-w-md">
            {t('empty.description')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-in-up-delay-200 motion-reduce:animate-none">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-medium leading-tight text-text-primary">{t('title')}</h2>
        <Button
          onClick={onViewAll}
          variant="ghost"
          size="sm"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2"
        >
          {t('viewAll')}
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onView={onViewArticle}
          />
        ))}
      </div>
    </section>
  );
}
