"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorDisplay } from "@/components/error-display";
import type { StyleGuideResponse } from "@/features/style-guide/types";
import {
  useListStyleGuides,
  useDeleteStyleGuide,
} from "@/features/articles/hooks/useStyleGuideQuery";
import { SearchBar } from "@/features/style-guide/components/search-bar";
import { StyleGuideGrid } from "@/features/style-guide/components/style-guide-grid";
import { EmptyState } from "@/features/style-guide/components/empty-state";
import { StyleGuidePreviewModalImproved } from "@/features/style-guide/components/style-guide-preview-modal-improved";
import { filterStyleGuidesBySearch } from "@/features/style-guide/lib/utils";

type StyleGuidePageProps = {
  params: Promise<Record<string, never>>;
};

export default function StyleGuidePage({ params }: StyleGuidePageProps) {
  void params;
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useTranslations("styleGuide");

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [previewGuide, setPreviewGuide] = useState<StyleGuideResponse | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // React Query
  const {
    data: guides = [],
    isLoading,
    isError,
  } = useListStyleGuides();

  const deleteStyleGuide = useDeleteStyleGuide();

  // Window focus 시 데이터 갱신
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ["styleGuides"] });
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [queryClient]);

  // Handlers
  const handleCreateNew = () => {
    router.push("/style-guides/new");
  };

  const handlePreview = (guide: StyleGuideResponse) => {
    setPreviewGuide(guide);
    setIsPreviewOpen(true);
  };

  const handleEdit = (guide: StyleGuideResponse) => {
    router.push(`/style-guides/${guide.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("delete.confirm"))) return;

    try {
      await deleteStyleGuide.mutateAsync(id);
      toast({
        title: t("delete.success.title"),
        description: t("delete.success.desc"),
      });
    } catch (error) {
      toast({
        title: t("delete.error.title"),
        description:
          error instanceof Error ? error.message : t("delete.error.desc"),
        variant: "destructive",
      });
    }
  };

  // Filtered guides
  const filteredGuides = filterStyleGuidesBySearch(guides, searchQuery);

  // Actions 버튼
  const actions = (
    <Button
      onClick={handleCreateNew}
      size="lg"
      className="bg-accent-brand hover:bg-accent-brand/90 text-white focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2"
    >
      <Plus className="mr-2 h-5 w-5" />
      {t("create_new")}
    </Button>
  );

  // Loading state
  if (isLoading) {
    return (
      <PageLayout
        title={t("title")}
        description={t("subtitle")}
        actions={actions}
        maxWidthClassName="max-w-6xl"
      >
        <div className="flex flex-col border-t border-border-default rounded-lg bg-bg-primary">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border-b border-border-default last:border-b-0 py-3 px-3 h-[137px] flex flex-col animate-pulse"
            >
              <div className="flex items-start justify-between flex-1 min-h-0 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-bg-secondary rounded w-1/4 mb-2"></div>
                  <div className="space-y-2 max-w-[720px]">
                    <div className="h-4 bg-bg-secondary rounded w-full"></div>
                    <div className="h-4 bg-bg-secondary rounded w-3/4"></div>
                  </div>
                </div>
                <div className="flex gap-1 ml-4 flex-shrink-0">
                  <div className="h-8 w-8 bg-bg-secondary rounded"></div>
                  <div className="h-8 w-8 bg-bg-secondary rounded"></div>
                  <div className="h-8 w-8 bg-bg-secondary rounded"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 bg-bg-secondary rounded w-32"></div>
                <div className="h-3 w-3 bg-bg-secondary rounded-full"></div>
                <div className="h-4 bg-bg-secondary rounded w-16"></div>
                <div className="h-3 w-3 bg-bg-secondary rounded-full"></div>
                <div className="h-4 bg-bg-secondary rounded w-24"></div>
                <div className="h-3 w-3 bg-bg-secondary rounded-full"></div>
                <div className="h-4 bg-bg-secondary rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <PageLayout
        title={t("title")}
        description={t("subtitle")}
        actions={actions}
        maxWidthClassName="max-w-6xl"
      >
        <ErrorDisplay
          message={t("error.load")}
          onRetry={() => router.refresh()}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t("title")}
      description={t("subtitle")}
      actions={actions}
      maxWidthClassName="max-w-6xl"
    >
      {/* Search Bar (조건부: 10개 이상) */}
      {guides.length >= 10 && (
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      )}

      {/* Content */}
      {guides.length > 0 ? (
        filteredGuides.length > 0 ? (
          <StyleGuideGrid
            guides={filteredGuides}
            onPreview={handlePreview}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          // 검색 결과 없음
          <div className="text-center py-12 space-y-4">
            <p className="text-base text-text-secondary">{t("noResults")}</p>
            <Button variant="link" onClick={() => setSearchQuery("")}>
              {t("clearSearch")}
            </Button>
          </div>
        )
      ) : (
        <EmptyState onCreateNew={handleCreateNew} />
      )}

      {/* Preview Modal */}
      <StyleGuidePreviewModalImproved
        guide={previewGuide}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onEdit={handleEdit}
      />
    </PageLayout>
  );
}
