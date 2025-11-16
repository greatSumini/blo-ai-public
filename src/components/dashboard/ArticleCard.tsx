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

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    published: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };

  return (
    <Card className="group transition-all hover:shadow-lg hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </CardTitle>
          <Badge className={statusColors[article.status]} variant="secondary">
            {t(`status.${article.status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {article.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {article.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {article.views}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(article.updatedAt), 'PP', { locale: dateLocale })}
          </span>
        </div>

        <Button
          onClick={() => onView(article.id)}
          variant="ghost"
          size="sm"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        >
          {t('viewArticle')}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
