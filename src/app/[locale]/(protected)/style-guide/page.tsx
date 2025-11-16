"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/page-layout";
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
      className="bg-[#3BA2F8] hover:bg-[#2E91E6]"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-[#E1E5EA] bg-white p-6 space-y-4 animate-pulse"
            >
              <div className="space-y-2">
                <div className="h-5 bg-[#E5E7EB] rounded w-3/4"></div>
                <div className="h-4 bg-[#E5E7EB] rounded w-full"></div>
                <div className="h-4 bg-[#E5E7EB] rounded w-5/6"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-[#E5E7EB] rounded w-16"></div>
                <div className="h-6 bg-[#E5E7EB] rounded w-16"></div>
                <div className="h-6 bg-[#E5E7EB] rounded w-16"></div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-[#E1E5EA]">
                <div className="h-8 bg-[#E5E7EB] rounded flex-1"></div>
                <div className="h-8 bg-[#E5E7EB] rounded flex-1"></div>
                <div className="h-8 bg-[#E5E7EB] rounded w-10"></div>
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
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-red-500">{t("error.load")}</p>
          <Button onClick={() => router.refresh()}>{t("retry")}</Button>
        </div>
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
            <p className="text-[#6B7280]">{t("noResults")}</p>
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
