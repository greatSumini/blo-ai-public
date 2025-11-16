"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconButton } from "@/components/ui/icon-button";
import { useTranslations } from "next-intl";

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sourceFilter: "all" | "manual" | "dataforseo";
  onSourceFilterChange: (source: "all" | "manual" | "dataforseo") => void;
}

export function SearchSection({
  searchQuery,
  onSearchChange,
  sourceFilter,
  onSourceFilterChange,
}: SearchSectionProps) {
  const t = useTranslations("keywords.table");

  return (
    <div className="flex flex-col gap-4 sm:flex-row mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <IconButton
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            size="sm"
            variant="ghost"
            aria-label={t("clearSearch")}
          >
            <X className="h-4 w-4" />
          </IconButton>
        )}
      </div>

      {/* Source Filter */}
      <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterAll")}</SelectItem>
          <SelectItem value="manual">{t("filterManual")}</SelectItem>
          <SelectItem value="dataforseo">{t("filterAi")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
