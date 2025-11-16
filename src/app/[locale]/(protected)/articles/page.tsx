"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { PageLayout } from "@/components/layout/page-layout";
import { ArticlesFilters } from "@/features/articles/components/articles-filters";
import { ArticlesGrid } from "@/features/articles/components/articles-grid";
import { useListArticles } from "@/features/articles/hooks/useListArticles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAuthenticatedClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { useAuth } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

type ArticlesPageProps = {
  params: Promise<Record<string, never>>;
};

export default function ArticlesPage({ params }: ArticlesPageProps) {
  void params;
  const t = useTranslations("articles");
  const router = useRouter();
  const locale = useLocale();
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all");
  const [sortBy, setSortBy] = useState<"created_at" | "updated_at" | "title">("updated_at");

  // 삭제 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);

  // API 호출
  const { data, isLoading } = useListArticles({
    query: {
      status: statusFilter === "all" ? undefined : statusFilter,
      sortBy,
      sortOrder: "desc",
      limit: 100,
    },
  });

  // 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const client = createAuthenticatedClient(userId);
      await client.delete(`/api/articles/${articleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success(t("delete.success.title"), {
        description: t("delete.success.desc"),
      });
      setDeleteDialogOpen(false);
      setDeletingArticleId(null);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, t("delete.error.desc"));
      toast.error(t("delete.error.title"), {
        description: message,
      });
    },
  });

  // 클라이언트 사이드 필터링 (검색어)
  const filteredArticles = data?.articles.filter((article) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.keywords.some((kw) => kw.toLowerCase().includes(query))
    );
  }) || [];

  const hasFilters = statusFilter !== "all" || searchQuery.trim() !== "";

  // 핸들러
  const handleEdit = (id: string) => {
    router.push(`/${locale}/articles/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    setDeletingArticleId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingArticleId) {
      deleteMutation.mutate(deletingArticleId);
    }
  };

  // PageLayout actions 활용
  const headerActions = (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500">
        {t("total_count", { count: data?.total || 0 })}
      </span>
      <Button
        onClick={() => router.push(`/${locale}/new-article`)}
        className="bg-blue-500 hover:bg-blue-600"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {t("create_new")}
      </Button>
    </div>
  );

  return (
    <PageLayout
      title={t("title")}
      description={t("description")}
      actions={headerActions}
    >
      {/* Filters */}
      <ArticlesFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Grid */}
      <ArticlesGrid
        articles={filteredArticles}
        isLoading={isLoading}
        hasFilters={hasFilters}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 삭제 확인 Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("delete.confirm.title")}</DialogTitle>
            <DialogDescription>
              {t("delete.confirm.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              {t("delete.confirm.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("delete.confirm.deleting") : t("delete.confirm.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
