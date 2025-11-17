'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-v2';
import { Badge } from '@/components/ui/badge-v2';
import { FileText, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { Link } from '@/i18n/navigation';
import type { ArticleResponse } from '@/features/articles/lib/dto';
import { useCurrentOrganization } from '@/contexts/organization-context';
import { ROUTES } from '@/lib/routes';

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
  const locale = useLocale();
  const dateLocale = locale === 'ko' ? ko : enUS;
  const { orgId } = useCurrentOrganization();

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'archived':
        return 'default';
      default:
        return 'warning';
    }
  };

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
          <Card key={article.id} hover className="group cursor-pointer" onClick={() => onViewArticle(article.id)}>
            <div className="flex items-start justify-between mb-4">
              <Badge variant={getBadgeVariant(article.status)} className="text-xs">
                {article.status === 'published' ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Published
                  </>
                ) : (
                  <>
                    <Clock className="mr-1 h-3 w-3" />
                    Draft
                  </>
                )}
              </Badge>
            </div>

            {orgId && (
              <Link href={ROUTES.ARTICLES_EDIT(orgId, article.id)}>
                <h3 className="text-lg font-medium mb-3 line-clamp-2 text-text-primary group-hover:text-accent-brand transition-colors duration-normal">
                  {article.title}
                </h3>
              </Link>
            )}

            <p className="text-xs text-text-tertiary">
              {formatDistanceToNow(new Date(article.updatedAt), {
                locale: dateLocale,
                addSuffix: true,
              })}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
