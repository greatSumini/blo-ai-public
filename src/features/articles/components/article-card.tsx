"use client";

import { Card } from "@/components/ui/card-v2";
import { Badge } from "@/components/ui/badge-v2";
import { CheckCircle, Clock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import Link from "next/link";
import { ArticleCardMenu } from "./article-card-menu";
import type { ArticleResponse } from "@/features/articles/lib/dto";

interface ArticleCardProps {
  article: ArticleResponse;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ArticleCard({ article, onEdit, onDelete }: ArticleCardProps) {
  const t = useTranslations("articles");
  const locale = useLocale();
  const dateLocale = locale === "ko" ? ko : enUS;

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      case "archived":
        return "default";
      default:
        return "warning";
    }
  };

  return (
    <Card hover className="group">
      {/* 상태 Badge + 메뉴 */}
      <div className="flex items-start justify-between mb-4">
        <Badge variant={getBadgeVariant(article.status)} className="text-xs">
          {article.status === "published" ? (
            <>
              <CheckCircle className="mr-1 h-3 w-3" />
              {t("status.published")}
            </>
          ) : (
            <>
              <Clock className="mr-1 h-3 w-3" />
              {t("status.draft")}
            </>
          )}
        </Badge>

        <ArticleCardMenu
          articleId={article.id}
          onEdit={() => onEdit(article.id)}
          onDelete={() => onDelete(article.id)}
        />
      </div>

      {/* 제목 */}
      <Link href={`/${locale}/articles/${article.id}/edit`}>
        <h3 className="text-lg font-medium mb-3 line-clamp-2 text-text-primary group-hover:text-accent-brand transition-colors duration-normal">
          {article.title}
        </h3>
      </Link>

      {/* 수정일 */}
      <p className="text-xs text-text-tertiary">
        {formatDistanceToNow(new Date(article.updatedAt), {
          locale: dateLocale,
          addSuffix: true,
        })}
      </p>
    </Card>
  );
}
