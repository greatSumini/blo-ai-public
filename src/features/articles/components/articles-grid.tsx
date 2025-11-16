"use client";

import { ArticleCard } from "./article-card";
import { ArticlesEmptyState } from "./articles-empty-state";
import { ArticlesGridSkeleton } from "./articles-grid-skeleton";
import type { ArticleResponse } from "@/features/articles/lib/dto";

interface ArticlesGridProps {
  articles: ArticleResponse[];
  isLoading: boolean;
  hasFilters: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ArticlesGrid({
  articles,
  isLoading,
  hasFilters,
  onEdit,
  onDelete,
}: ArticlesGridProps) {
  if (isLoading) {
    return <ArticlesGridSkeleton count={6} />;
  }

  if (articles.length === 0) {
    return (
      <ArticlesEmptyState variant={hasFilters ? "no-results" : "no-articles"} />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
