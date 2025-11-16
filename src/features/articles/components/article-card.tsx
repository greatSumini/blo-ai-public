"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Card className="p-5 hover:shadow-md transition-shadow duration-150">
      {/* 상태 Badge + 메뉴 */}
      <div className="flex items-start justify-between mb-3">
        <Badge
          variant={article.status === "published" ? "default" : "secondary"}
          className="text-xs"
        >
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
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
      </Link>

      {/* 수정일 */}
      <p className="text-xs text-gray-500">
        {formatDistanceToNow(new Date(article.updatedAt), {
          locale: dateLocale,
          addSuffix: true,
        })}
      </p>
    </Card>
  );
}
