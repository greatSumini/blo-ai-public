'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Calendar, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import type { ArticleResponse } from '@/features/articles/lib/dto';

interface ArticleCardProps {
  article: ArticleResponse;
  onView: (id: string) => void;
}

export function ArticleCard({ article, onView }: ArticleCardProps) {
  const t = useTranslations('dashboard.recentArticles');
  const locale = useLocale();
  const dateLocale = locale === 'ko' ? ko : enUS;

  const statusConfig = {
    draft: {
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800'
    },
    published: {
      className: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400 border-green-300 dark:border-green-800'
    },
    archived: {
      className: 'bg-bg-secondary text-text-secondary border-border-default'
    },
  };

  return (
    <Card className="group transition-all duration-300 ease-out hover:shadow-lg hover:border-accent-brand/50 motion-reduce:transition-none border-border-default">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2 text-text-primary group-hover:text-accent-brand transition-colors duration-100">
            {article.title}
          </CardTitle>
          <Badge
            variant="secondary"
            className={statusConfig[article.status].className}
          >
            {t(`status.${article.status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {article.description && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-4">
            {article.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-text-tertiary mb-4">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" aria-hidden="true" />
            {article.views}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" aria-hidden="true" />
            {format(new Date(article.updatedAt), 'PP', { locale: dateLocale })}
          </span>
        </div>

        <Button
          onClick={() => onView(article.id)}
          variant="ghost"
          size="sm"
          className="w-full group-hover:bg-accent-brand group-hover:text-white transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2"
        >
          {t('viewArticle')}
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  );
}
