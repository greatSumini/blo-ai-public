"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StyleGuideCard } from "@/features/onboarding/components/style-guide-card";
import { StyleGuidePreviewModal } from "@/features/onboarding/components/style-guide-preview-modal";
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";
import { getUserStyleGuide, deleteStyleGuideAction } from "@/features/articles/actions/article-actions";

type StyleGuidePageProps = {
  params: Promise<Record<string, never>>;
};

export default function StyleGuidePage({ params }: StyleGuidePageProps) {
  void params;
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [previewGuide, setPreviewGuide] = useState<StyleGuideResponse | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Refetch on page focus to ensure fresh data
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ["userStyleGuide"] });
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [queryClient]);

  // Fetch user's style guide
  const { data: guide, isLoading, isError, refetch } = useQuery<StyleGuideResponse | null>({
    queryKey: ["userStyleGuide"],
    queryFn: getUserStyleGuide,
    retry: false,
    gcTime: 0, // Disable cache
  });

  const handlePreview = (guide: StyleGuideResponse) => {
    setPreviewGuide(guide);
    setIsPreviewOpen(true);
  };

  const handleEdit = (guide: StyleGuideResponse) => {
    router.push(`/style-guides/${guide.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    // Show confirmation dialog
    if (!window.confirm("이 스타일 가이드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      await deleteStyleGuideAction(id);
      toast({
        title: "삭제 완료",
        description: "스타일 가이드가 삭제되었습니다.",
      });
      // Clear cache and refetch
      await queryClient.invalidateQueries({ queryKey: ["userStyleGuide"] });
      await refetch();
    } catch (error) {
      toast({
        title: "오류",
        description:
          error instanceof Error
            ? error.message
            : "스타일 가이드 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCreateNew = () => {
    router.push("/style-guides/new");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <p className="text-red-500">스타일 가이드를 불러오는 데 실패했습니다.</p>
            <Button onClick={() => router.refresh()}>다시 시도</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#1F2937" }}>
              스타일 가이드
            </h1>
            <p className="mt-2 text-muted-foreground">
              AI 글 생성에 사용할 블로그의 스타일 가이드를 관리합니다.
            </p>
          </div>
          <Button onClick={handleCreateNew} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            새 가이드 생성
          </Button>
        </div>

        {/* 가이드 목록 */}
        {guide ? (
          <div className="space-y-4">
            <StyleGuideCard
              guide={guide}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={handlePreview}
            />
          </div>
        ) : (
          <div
            className="rounded-lg border border-dashed p-12 text-center"
            style={{ borderColor: "#E1E5EA" }}
          >
            <p className="mb-4 text-muted-foreground">
              아직 생성된 스타일 가이드가 없습니다.
            </p>
            <Button onClick={handleCreateNew}>스타일 가이드 생성하기</Button>
          </div>
        )}
      </div>

      {/* 미리보기 모달 */}
      <StyleGuidePreviewModal
        guide={previewGuide}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
