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
        <p className="text-sm text-muted-foreground">
          {t("table.totalCount", { count: totalFiltered })}
        </p>
      )}

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
          <p className="text-base font-medium text-destructive mb-1">
            {t("table.loadError")}
          </p>
          <p className="text-sm text-destructive/80">
            {error instanceof Error ? error.message : t("table.loadErrorFallback")}
          </p>
        </div>
      ) : isEmpty ? (
        <EmptyState type="no-keywords" />
      ) : isNoResults ? (
        <EmptyState type="no-results" />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead scope="col" className="w-[50%]">{t("table.columnKeyword")}</TableHead>
                <TableHead scope="col" className="w-[20%]">{t("table.columnSource")}</TableHead>
                <TableHead scope="col" className="w-[20%]">{t("table.columnCreatedAt")}</TableHead>
                <TableHead scope="col" className="w-[10%] text-right">{t("table.columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((keyword) => (
                <TableRow
                  key={keyword.id}
                  className="group transition-colors duration-100 hover:bg-secondary motion-reduce:transition-none"
                >
                  <TableCell>
                    <span className="font-medium text-foreground">
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
                      <div className="text-sm text-foreground">
                        {format(new Date(keyword.createdAt), "yyyy-MM-dd")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(keyword.createdAt), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 motion-reduce:transition-none">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(keyword.phrase)}
                        className="transition-colors duration-100 motion-reduce:transition-none"
                        aria-label={t("table.copyAria", { phrase: keyword.phrase })}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(keyword.id, keyword.phrase)}
                        className="text-destructive hover:text-destructive/90 transition-colors duration-100 motion-reduce:transition-none"
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
