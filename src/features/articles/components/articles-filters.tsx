"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge-v2";
import { Search, X } from "lucide-react";

interface ArticlesFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: "all" | "draft" | "published" | "archived";
  setStatusFilter: (value: "all" | "draft" | "published" | "archived") => void;
  sortBy: "created_at" | "updated_at" | "title";
  setSortBy: (value: "created_at" | "updated_at" | "title") => void;
}

export function ArticlesFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}: ArticlesFiltersProps) {
  const t = useTranslations("articles");

  const hasActiveFilters = statusFilter !== "all" || searchQuery.trim() !== "";

  return (
    <div className="mb-8 space-y-4">
      {/* 검색 입력창 (크게) */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
        <Input
          className="h-12 pl-12 text-base border-border-default bg-bg-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2 transition-shadow duration-normal"
          placeholder={t("search_placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label={t("search_placeholder")}
        />
      </div>

      {/* 필터 & 정렬 (작게) */}
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9 text-sm border-border-default bg-bg-primary text-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filter.all")}</SelectItem>
            <SelectItem value="published">{t("filter.published")}</SelectItem>
            <SelectItem value="draft">{t("filter.draft")}</SelectItem>
            <SelectItem value="archived">{t("filter.archived")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32 h-9 text-sm border-border-default bg-bg-primary text-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">{t("sort.newest")}</SelectItem>
            <SelectItem value="created_at">{t("sort.created")}</SelectItem>
            <SelectItem value="title">{t("sort.title")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {statusFilter !== "all" && (
            <Badge variant="default" className="gap-2">
              {t(`filter.${statusFilter}`)}
              <button
                onClick={() => setStatusFilter("all")}
                className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand rounded-sm min-h-[24px] min-w-[24px] flex items-center justify-center"
                aria-label={`Remove ${statusFilter} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchQuery.trim() && (
            <Badge variant="default" className="gap-2">
              {searchQuery}
              <button
                onClick={() => setSearchQuery("")}
                className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand rounded-sm min-h-[24px] min-w-[24px] flex items-center justify-center"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
