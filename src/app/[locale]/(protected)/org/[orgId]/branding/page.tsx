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
import type { BrandingResponse } from "@/features/branding/types";
import {
  useListBrandings,
  useDeleteBranding,
} from "@/features/articles/hooks/useBrandingQuery";
import { SearchBar } from "@/features/branding/components/search-bar";
import { BrandingGrid } from "@/features/branding/components/branding-grid";
import { EmptyState } from "@/features/branding/components/empty-state";
import { BrandingPreviewModalImproved } from "@/features/branding/components/branding-preview-modal-improved";
import { filterBrandingsBySearch } from "@/features/branding/lib/utils";
import { useRequiredOrganization } from "@/contexts/organization-context";
import { ROUTES } from "@/lib/routes";

type BrandingPageProps = {
  params: Promise<{ orgId: string }>;
};

export default function BrandingPage({ params }: BrandingPageProps) {
  void params;
  const orgId = useRequiredOrganization();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useTranslations("branding");

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [previewBranding, setPreviewBranding] = useState<BrandingResponse | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // React Query
  const {
    data: brandings = [],
    isLoading,
    isError,
  } = useListBrandings();

  const deleteBranding = useDeleteBranding();

  // Window focus 시 데이터 갱신
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ["brandings"] });
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [queryClient]);

  // Handlers
  const handleCreateNew = () => {
    router.push(ROUTES.BRANDINGS_NEW(orgId));
  };

  const handlePreview = (branding: BrandingResponse) => {
    setPreviewBranding(branding);
    setIsPreviewOpen(true);
  };

  const handleEdit = (branding: BrandingResponse) => {
    router.push(ROUTES.BRANDINGS_EDIT(orgId, branding.id));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("delete.confirm"))) return;

    try {
      await deleteBranding.mutateAsync(id);
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

  // Filtered brandings
  const filteredBrandings = filterBrandingsBySearch(brandings, searchQuery);

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
      {brandings.length >= 10 && (
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      )}

      {/* Content */}
      {brandings.length > 0 ? (
        filteredBrandings.length > 0 ? (
          <BrandingGrid
            brandings={filteredBrandings}
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
      <BrandingPreviewModalImproved
        branding={previewBranding}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onEdit={handleEdit}
      />
    </PageLayout>
  );
}
