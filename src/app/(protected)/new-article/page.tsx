"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, Search, ArrowLeft, Sparkles } from "lucide-react";
import { ArticleForm } from "@/features/articles/components/article-form";
import { ArticlePreview } from "@/features/articles/components/article-preview";
import { SeoPanel } from "@/features/articles/components/seo-panel";
import { GenerationProgress } from "@/features/articles/components/generation-progress";
import { useCreateArticle } from "@/features/articles/hooks/useCreateArticle";
import { useGenerateArticle } from "@/features/articles/hooks/useGenerateArticle";
import { useStyleGuide } from "@/features/articles/hooks/useStyleGuide";
import {
  ArticleFormSchema,
  defaultArticleFormValues,
  type ArticleFormData,
} from "@/features/articles/lib/article-form-schema";

type NewArticlePageProps = {
  params: Promise<Record<string, never>>;
};

export default function NewArticlePage({ params }: NewArticlePageProps) {
  void params;

  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(ArticleFormSchema),
    defaultValues: defaultArticleFormValues,
    mode: "onChange",
  });

  const createArticleMutation = useCreateArticle();
  const generateArticleMutation = useGenerateArticle();
  const { data: styleGuideData, isLoading: isLoadingStyleGuide } =
    useStyleGuide();

  const formValues = form.watch();

  const handleSaveDraft = async (data: ArticleFormData) => {
    setIsSaving(true);
    try {
      const result = await createArticleMutation.mutateAsync(data);

      toast({
        title: "저장 완료",
        description: "글이 성공적으로 저장되었습니다.",
      });

      // 에디터로 리다이렉트
      router.push(`/articles/${result.id}/edit`);
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast({
        title: "저장 실패",
        description:
          error instanceof Error
            ? error.message
            : "글 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (form.formState.isDirty) {
      const confirmed = window.confirm(
        "작성 중인 내용이 있습니다. 정말 나가시겠습니까?"
      );
      if (!confirmed) return;
    }
    router.back();
  };

  const handleGenerateAI = async () => {
    // AI 생성을 위한 최소 요구사항: 스타일 가이드 ID만 필요
    const styleGuideId = form.getValues("styleGuideId");

    if (!styleGuideId) {
      toast({
        title: "스타일 가이드 필요",
        description: "AI 글 생성을 위해서는 스타일 가이드를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 주제 입력 받기
    const topic = window.prompt(
      "어떤 주제로 글을 작성할까요?\n\n예시: Next.js에서 Server Actions 사용하기, React Query로 서버 상태 관리하기"
    );

    if (!topic || !topic.trim()) {
      return;
    }

    setIsGeneratingAI(true);

    try {
      const result = await generateArticleMutation.mutateAsync({
        topic: topic.trim(),
        styleGuideId,
        keywords: form.getValues("keywords") || [],
        additionalInstructions: undefined,
      });

      // 생성된 콘텐츠로 폼 필드 자동 채우기
      const generatedContent = result.generatedContent;

      form.setValue("title", generatedContent.title);
      form.setValue("content", generatedContent.content);
      form.setValue("description", generatedContent.metaDescription);
      form.setValue("keywords", generatedContent.keywords);
      form.setValue("metaTitle", generatedContent.title);
      form.setValue("metaDescription", generatedContent.metaDescription);

      toast({
        title: "AI 글 생성 완료",
        description: `글이 성공적으로 생성되었습니다. 남은 생성 횟수: ${result.quotaRemaining}회`,
      });

      setIsGeneratingAI(false);

      // 에디터로 리다이렉트
      router.push(`/articles/${result.article.id}/edit`);
    } catch (error) {
      console.error("Failed to generate article:", error);
      // Error는 GenerationProgress 컴포넌트에서 처리
      setIsGeneratingAI(false);
    }
  };

  const handleCancelGeneration = () => {
    setIsGeneratingAI(false);
    generateArticleMutation.reset();
  };

  const handleRetryGeneration = () => {
    generateArticleMutation.reset();
    handleGenerateAI();
  };

  // Style guide data for dropdown
  const styleGuides = styleGuideData
    ? [
        {
          id: styleGuideData.id,
          name: `My Style Guide`,
        },
      ]
    : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 -ml-2"
            style={{ color: "#6B7280" }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로 가기
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#1F2937" }}>
                새 글 작성
              </h1>
              <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
                블로그에 게시할 새로운 글을 작성하세요
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveDraft)}>
            {/* Desktop: 3-column layout */}
            <div className="hidden lg:grid lg:grid-cols-[1fr,350px,350px] lg:gap-6">
              {/* Left: Form */}
              <Card
                className="p-6"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "12px",
                }}
              >
                <ArticleForm
                  form={form}
                  styleGuides={styleGuides}
                  isLoading={isSaving || isLoadingStyleGuide}
                />

                {/* Save Button */}
                <div className="mt-8 flex justify-end border-t pt-6">
                  <Button
                    type="submit"
                    disabled={isSaving || !form.formState.isValid}
                    className="h-12 px-8"
                    style={{
                      backgroundColor: "#3BA2F8",
                      borderRadius: "8px",
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "저장 중..." : "초안 저장"}
                  </Button>
                </div>
              </Card>

              {/* Middle: Preview */}
              <div>
                <ArticlePreview formData={formValues} />
              </div>

              {/* Right: SEO Panel */}
              <div>
                <SeoPanel formData={formValues} />
              </div>
            </div>

            {/* Tablet: 2-column layout (Form + Tabs) */}
            <div className="hidden md:grid md:grid-cols-[1fr,400px] md:gap-6 lg:hidden">
              {/* Left: Form */}
              <Card
                className="p-6"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "12px",
                }}
              >
                <ArticleForm
                  form={form}
                  styleGuides={styleGuides}
                  isLoading={isSaving || isLoadingStyleGuide}
                />

                {/* Save Button */}
                <div className="mt-8 flex justify-end border-t pt-6">
                  <Button
                    type="submit"
                    disabled={isSaving || !form.formState.isValid}
                    className="h-12 px-8"
                    style={{
                      backgroundColor: "#3BA2F8",
                      borderRadius: "8px",
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "저장 중..." : "초안 저장"}
                  </Button>
                </div>
              </Card>

              {/* Right: Tabs (Preview + SEO) */}
              <div>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList
                    className="grid w-full grid-cols-2"
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: "8px",
                    }}
                  >
                    <TabsTrigger value="preview" className="gap-2">
                      <Eye className="h-4 w-4" />
                      미리보기
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="gap-2">
                      <Search className="h-4 w-4" />
                      SEO
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview" className="mt-4">
                    <ArticlePreview formData={formValues} />
                  </TabsContent>
                  <TabsContent value="seo" className="mt-4">
                    <SeoPanel formData={formValues} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Mobile: Single column with Tabs */}
            <div className="md:hidden">
              <Tabs defaultValue="form" className="w-full">
                <TabsList
                  className="grid w-full grid-cols-3"
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: "8px",
                  }}
                >
                  <TabsTrigger value="form" className="text-xs">
                    작성
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">
                    <Eye className="mr-1 h-3 w-3" />
                    미리보기
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="text-xs">
                    <Search className="mr-1 h-3 w-3" />
                    SEO
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="form" className="mt-4">
                  <Card
                    className="p-4"
                    style={{
                      borderColor: "#E1E5EA",
                      borderRadius: "12px",
                    }}
                  >
                    <ArticleForm
                      form={form}
                      styleGuides={styleGuides}
                      isLoading={isSaving || isLoadingStyleGuide}
                    />

                    {/* Save Button */}
                    <div className="mt-6 border-t pt-6">
                      <Button
                        type="submit"
                        disabled={isSaving || !form.formState.isValid}
                        className="h-12 w-full"
                        style={{
                          backgroundColor: "#3BA2F8",
                          borderRadius: "8px",
                        }}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "저장 중..." : "초안 저장"}
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <ArticlePreview formData={formValues} />
                </TabsContent>

                <TabsContent value="seo" className="mt-4">
                  <SeoPanel formData={formValues} />
                </TabsContent>
              </Tabs>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
