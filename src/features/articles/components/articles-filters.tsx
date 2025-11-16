"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
    <div className="mb-6 space-y-3">
      {/* 검색 입력창 (크게) */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          className="h-12 pl-12 text-base"
          placeholder={t("search_placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 필터 & 정렬 (작게) */}
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9 text-sm">
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
          <SelectTrigger className="w-32 h-9 text-sm">
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
        <div className="flex gap-2">
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1.5">
              {t(`filter.${statusFilter}`)}
              <X
                className="h-3 w-3 cursor-pointer hover:text-gray-900"
                onClick={() => setStatusFilter("all")}
              />
            </Badge>
          )}
          {searchQuery.trim() && (
            <Badge variant="secondary" className="gap-1.5">
              {searchQuery}
              <X
                className="h-3 w-3 cursor-pointer hover:text-gray-900"
                onClick={() => setSearchQuery("")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
