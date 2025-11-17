"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRequiredOrganization } from "@/contexts/organization-context";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button-v2";
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
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAuthenticatedClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { useAuth } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { ROUTES } from "@/lib/routes";

type ArticlesPageProps = {
  params: Promise<{ orgId: string }>;
};

export default function ArticlesPage({ params }: ArticlesPageProps) {
  void params;
  const orgId = useRequiredOrganization();
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
    router.push(ROUTES.ARTICLES_EDIT(orgId, id));
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

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-medium leading-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-2 text-base text-text-secondary leading-relaxed">
            {t("description")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-tertiary">
            {t("total_count", { count: data?.total || 0 })}
          </span>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(ROUTES.NEW_ARTICLE(orgId))}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {t("create_new")}
          </Button>
        </div>
      </div>

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
              variant="secondary"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              {t("delete.confirm.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("delete.confirm.deleting") : t("delete.confirm.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
