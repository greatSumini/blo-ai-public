"use client";

import { useState } from "react";
import { useDebounce } from "react-use";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2 } from "lucide-react";
import { useKeywordList, useDeleteKeyword } from "@/features/keywords/hooks/useKeywordQuery";
import { format, formatDistanceToNow } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { TableSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { DeleteDialog } from "./DeleteDialog";
import { SearchSection } from "./SearchSection";
import { Pagination } from "./Pagination";

export function KeywordTable() {
  const t = useTranslations("keywords");
  const locale = useLocale();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "manual" | "dataforseo">("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; phrase: string } | null>(null);

  const limit = 20;

  useDebounce(
    () => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    },
    300,
    [searchQuery]
  );

  const { data, isLoading, error } = useKeywordList(debouncedQuery, page, limit);
  const deleteMutation = useDeleteKeyword();

  const dateLocale = locale === "ko" ? ko : enUS;

  const handleCopy = async (phrase: string) => {
    await navigator.clipboard.writeText(phrase);
    toast({
      title: t("table.copySuccess"),
      description: t("table.copySuccessDesc", { phrase }),
    });
  };

  const handleDeleteClick = (id: string, phrase: string) => {
    setDeleteTarget({ id, phrase });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({
        title: t("delete.successTitle"),
        description: t("delete.successDesc", { phrase: deleteTarget.phrase }),
      });
      setDeleteTarget(null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        t("delete.errorFallback");
      toast({
        title: t("delete.errorTitle"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const filteredItems =
    sourceFilter === "all"
      ? data?.items || []
      : data?.items.filter((item) => item.source === sourceFilter) || [];

  const totalFiltered = filteredItems.length;
  const hasData = !isLoading && !error && data && filteredItems.length > 0;
  const isEmpty = !isLoading && !error && (!data || data.items.length === 0);
  const isNoResults = !isLoading && !error && data && data.items.length > 0 && filteredItems.length === 0;

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <SearchSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
      />

      {/* Total Count */}
      {hasData && (
        <p className="text-sm text-gray-600">
          {t("table.totalCount", { count: totalFiltered })}
        </p>
      )}

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-base font-medium text-red-900 mb-1">
            {t("table.loadError")}
          </p>
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : t("table.loadErrorFallback")}
          </p>
        </div>
      ) : isEmpty ? (
        <EmptyState type="no-keywords" />
      ) : isNoResults ? (
        <EmptyState type="no-results" />
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[50%]">{t("table.columnKeyword")}</TableHead>
                <TableHead className="w-[20%]">{t("table.columnSource")}</TableHead>
                <TableHead className="w-[20%]">{t("table.columnCreatedAt")}</TableHead>
                <TableHead className="w-[10%] text-right">{t("table.columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((keyword) => (
                <TableRow
                  key={keyword.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {keyword.phrase}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={keyword.source === "manual" ? "default" : "secondary"}
                    >
                      {keyword.source === "manual"
                        ? t("table.sourceManual")
                        : t("table.sourceAi")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        {format(new Date(keyword.createdAt), "yyyy-MM-dd")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(keyword.createdAt), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(keyword.phrase)}
                        className="transition-colors"
                        aria-label={t("table.copyAria", { phrase: keyword.phrase })}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(keyword.id, keyword.phrase)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        aria-label={t("table.deleteAria", { phrase: keyword.phrase })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {hasData && data && (
        <Pagination
          page={page}
          totalPages={Math.ceil(data.total / limit)}
          totalItems={data.total}
          itemsPerPage={limit}
          onPageChange={setPage}
          hasMore={data.hasMore}
        />
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        keywordPhrase={deleteTarget?.phrase || ""}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
