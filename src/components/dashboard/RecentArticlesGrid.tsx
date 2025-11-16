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
      <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        </div>

        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {t('empty.title')}
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {t('empty.description')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <Button onClick={onViewAll} variant="ghost" size="sm">
          {t('viewAll')}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
