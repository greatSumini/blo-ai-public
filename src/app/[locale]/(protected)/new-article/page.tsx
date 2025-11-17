"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { GenerationForm } from "@/features/articles/components/generation-form";
import { GenerationProgressSection } from "@/features/articles/components/generation-progress-section";
import { ArticlePreviewSection } from "@/features/articles/components/article-preview-section";
import { useBranding } from "@/features/articles/hooks/useBranding";
import type { GenerationFormData } from "@/features/articles/components/generation-form";
import { useTranslations } from "next-intl";
import { useCompletion } from "@ai-sdk/react";
import {
  parseGeneratedText,
  parseStreamingTextToJson,
  type ParsedAIArticle,
} from "@/features/articles/lib/ai-parse";
import { generateUniqueSlug } from "@/lib/slug";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { AnimatePresence } from "framer-motion";

type NewArticlePageProps = {
  params: Promise<Record<string, never>>;
};

export default function NewArticlePage({ params }: NewArticlePageProps) {
  void params;
  const t = useTranslations("newArticle");
  const router = useRouter();
  const { toast } = useToast();

  const [mode, setMode] = useState<"form" | "generating" | "complete">("form");
  const [parsed, setParsed] = useState<ParsedAIArticle | null>(null);
  const [lastRequest, setLastRequest] = useState<{
    topic: string;
    brandingId?: string;
    keywords: string[];
  } | null>(null);

  const { data: brandingData, isLoading: isLoadingBranding } =
    useBranding();
  const { user } = useCurrentUser();
  const { completion, complete, stop, isLoading } = useCompletion({
    api: "/api/articles/generate",
  });

  const brandings = brandingData
    ? [{ id: brandingData.id, name: t("newArticle.default_branding") }]
    : [];

  const handleGenerateSubmit = async (data: GenerationFormData) => {
    setMode("generating");
    setParsed(null);
    setLastRequest({
      topic: data.topic,
      brandingId: data.brandingId,
      keywords: data.keywords || [],
    });

    try {
      await complete(data.topic, {
        body: {
          topic: data.topic,
          brandingId: data.brandingId,
          keywords: data.keywords || [],
          additionalInstructions: data.additionalInstructions || undefined,
        },
      });
    } catch (error) {
      console.error("Failed to generate article:", error);
      const message =
        error instanceof Error ? error.message : t("toast.error.desc");
      toast({
        title: t("toast.error.title"),
        description: message,
        variant: "destructive",
      });
      setMode("form");
    }
  };

  // 스트리밍이 끝나면 진행 UI 숨김
  useEffect(() => {
    if (!isLoading && mode === "generating") {
      if (completion) {
        try {
          const p = parseGeneratedText(completion);
          setParsed(p);
          setMode("complete");
          toast({
            title: t("toast.success.title"),
            description: t("toast.success.desc", {
              title: p.title || "AI 생성 글",
            }),
          });
        } catch {
          setMode("complete");
        }
      } else {
        setMode("form");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, mode]);

  const handleSave = async () => {
    if (!parsed) return;
    if (!user?.id) {
      toast({
        title: t("save.loginRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        title: parsed.title,
        slug: generateUniqueSlug(parsed.title),
        keywords: parsed.keywords ?? [],
        description: parsed.metaDescription ?? undefined,
        content: parsed.content,
        brandingId: lastRequest?.brandingId,
        metaTitle: parsed.title,
        metaDescription: parsed.metaDescription ?? undefined,
      };

      const res = await fetch("/api/articles/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": user.id,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.error?.message || t("save.error.network"));
      }

      const article = await res.json();
      toast({
        title: t("save.success.title"),
        description: t("save.success.desc", { title: article.title }),
      });
      router.push(`/articles/${article.id}/edit`);
    } catch (e) {
      const message = e instanceof Error ? e.message : t("save.error.desc");
      toast({
        title: t("save.error.title"),
        description: message,
        variant: "destructive",
      });
    }
  };

  const generatingPreview = useMemo(() => completion, [completion]);
  const generatingParsed = useMemo(
    () => parseStreamingTextToJson(generatingPreview || ""),
    [generatingPreview]
  );

  // 현재 작업 추정 (간단한 휴리스틱)
  const getCurrentTask = (): string => {
    if (!generatingParsed.title) return t("generating.tasks.title");
    if (!generatingParsed.keywords || generatingParsed.keywords.length === 0)
      return t("generating.tasks.keywords");
    if (!generatingParsed.content || generatingParsed.content.length < 100)
      return t("generating.tasks.content");
    return t("generating.tasks.finalizing");
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait" initial={false}>
        {mode === "form" && (
          <GenerationForm
            key="form"
            brandings={brandings}
            onSubmit={handleGenerateSubmit}
            isLoading={isLoadingBranding}
          />
        )}

        {mode === "generating" && (
          <GenerationProgressSection
            key="generating"
            currentTask={getCurrentTask()}
            streamingText={generatingPreview || ""}
            metadata={{
              title: generatingParsed.title,
              keywords: generatingParsed.keywords,
              metaDescription: generatingParsed.metaDescription,
            }}
            onCancel={() => {
              stop();
              setMode("form");
            }}
          />
        )}

        {mode === "complete" && parsed && (
          <ArticlePreviewSection
            key="complete"
            article={{
              title: parsed.title,
              content: parsed.content,
              metaDescription: parsed.metaDescription,
              keywords: parsed.keywords,
            }}
            onEdit={handleSave}
            onRegenerate={() => {
              setMode("form");
              setParsed(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
