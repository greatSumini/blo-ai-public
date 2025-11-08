"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { GenerationForm } from "@/features/articles/components/generation-form";
import { GenerationProgress } from "@/features/articles/components/generation-progress";
import { useGenerateArticle } from "@/features/articles/hooks/useGenerateArticle";
import { useStyleGuide } from "@/features/articles/hooks/useStyleGuide";
import { useState, useEffect } from "react";
import type { GenerationFormData } from "@/features/articles/components/generation-form";

type NewArticlePageProps = {
  params: Promise<Record<string, never>>;
};

export default function NewArticlePage({ params }: NewArticlePageProps) {
  void params;

  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    generateArticle,
    isLoading,
    error,
    completion,
  } = useGenerateArticle();

  const { data: styleGuideData, isLoading: isLoadingStyleGuide } =
    useStyleGuide();

  const styleGuides = styleGuideData
    ? [
        {
          id: styleGuideData.id,
          name: "내 스타일 가이드",
        },
      ]
    : [];

  const handleBack = () => {
    router.back();
  };

  const handleGenerateSubmit = async (data: GenerationFormData) => {
    setIsGenerating(true);

    try {
      const keywords = data.keywords
        ? data.keywords.split(",").map((k) => k.trim())
        : [];

      await generateArticle({
        topic: data.topic,
        styleGuideId: data.styleGuideId,
        keywords,
        additionalInstructions: undefined,
      });
    } catch (error) {
      console.error("Failed to generate article:", error);
      toast({
        title: "생성 실패",
        description:
          error instanceof Error
            ? error.message
            : "AI 글 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  // Monitor completion for article generation
  useEffect(() => {
    if (!isLoading && completion) {
      try {
        // Try to parse as JSON (structured content)
        const parsed = JSON.parse(completion);

        // If it looks like generated article content with title and content
        if (parsed.title && parsed.content) {
          // Extract title from the first line if it exists
          const titleMatch = parsed.content.match(/^#\s+(.+)\n/);
          const title = titleMatch ? titleMatch[1] : parsed.title;

          toast({
            title: "AI 글 생성 완료",
            description: `"${title}" 글이 생성되었습니다.`,
          });

          // For now, redirect to editor with the content in state
          // In a real app, you'd save to DB first
          router.push(`/articles/new/content`);
        }
      } catch {
        // Not JSON, might be plain text response
      }

      setIsGenerating(false);
    }
  }, [completion, isLoading, router, toast]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 -ml-2"
            style={{ color: "#6B7280" }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로 가기
          </Button>
        </div>

        {/* Main Card */}
        <Card
          className="p-8"
          style={{
            borderColor: "#E1E5EA",
            borderRadius: "12px",
          }}
        >
          {isGenerating || isLoading ? (
            <GenerationProgress
              isGenerating={true}
              error={error}
              onCancel={() => {
                setIsGenerating(false);
              }}
              onRetry={() => {
                setIsGenerating(false);
              }}
            />
          ) : (
            <GenerationForm
              styleGuides={styleGuides}
              onSubmit={handleGenerateSubmit}
              isLoading={isLoadingStyleGuide}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
