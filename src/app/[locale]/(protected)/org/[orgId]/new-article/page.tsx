"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { GenerationForm } from "@/features/articles/components/generation-form";
import { ArticlePreviewSection } from "@/features/articles/components/article-preview-section";
import { useBranding } from "@/features/articles/hooks/useBranding";
import type { GenerationFormData } from "@/features/articles/components/generation-form";
import { useTranslations } from "next-intl";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import type { ChatMessage } from "@/app/api/articles/generate/route";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { generateUniqueSlug } from "@/lib/slug";
import {
  createAuthenticatedClient,
  extractApiErrorMessage,
} from "@/lib/remote/api-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Bot,
  FileText,
  Globe2,
  Hash,
  ListChecks,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  User,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button-v2";
import { Badge } from "@/components/ui/badge-v2";
import { Card, CardContent } from "@/components/ui/card";
import { useRequiredOrganization } from "@/contexts/organization-context";
import { ROUTES } from "@/lib/routes";

type NewArticlePageProps = {
  params: Promise<{ orgId: string }>;
};

type MetadataState = {
  title: string;
  slug: string;
  description: string;
  keywords: string[];
  headings: string[];
};

type ToolProgressState = {
  mainKeyword: boolean;
  suggestKeywords: boolean;
  naverSearch: boolean;
  braveSearch: boolean;
  metadata: boolean;
  content: boolean;
};

export default function NewArticlePage({ params }: NewArticlePageProps) {
  void params;
  const orgId = useRequiredOrganization();
  const t = useTranslations("newArticle");
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useCurrentUser();

  const [mode, setMode] = useState<"form" | "chat">("form");
  const [generationContext, setGenerationContext] = useState<{
    topic: string;
    brandingId?: string;
    keywords: string[];
    additionalInstructions?: string;
  } | null>(null);

  const [keywords, setKeywords] = useState<string[]>([]);
  const [mainKeyword, setMainKeyword] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetadataState | null>(null);
  const [content, setContent] = useState("");
  const [articleId, setArticleId] = useState<string | null>(null);
  const [isSavingArticle, setIsSavingArticle] = useState(false);
  const [isChatDisabled, setIsChatDisabled] = useState(false);
  const [toolProgress, setToolProgress] = useState<ToolProgressState>({
    mainKeyword: false,
    suggestKeywords: false,
    naverSearch: false,
    braveSearch: false,
    metadata: false,
    content: false,
  });

  const contextRef = useRef<{
    topic: string;
    brandingId?: string;
    keywords: string[];
    additionalInstructions?: string;
  } | null>(null);

  const processedSuggestCallIdsRef = useRef<Set<string>>(new Set());

  const { data: brandingData, isLoading: isLoadingBranding } = useBranding();

  const {
    messages,
    sendMessage,
    addToolOutput,
    error: chatError,
    status,
  } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/articles/generate",
      prepareSendMessagesRequest: ({ messages }) => {
        const ctx = contextRef.current;

        return {
          body: {
            topic: ctx?.topic ?? "",
            brandingId: ctx?.brandingId,
            keywords: ctx?.keywords ?? [],
            additionalInstructions: ctx?.additionalInstructions,
            messages,
          },
        };
      },
    }),

    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

    // 클라이언트 사이드 툴 실행
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "set_main_keyword") {
        const { keyword } = toolCall.input as { keyword: string };

        setMainKeyword(keyword);
        setKeywords((prev) => {
          if (prev.includes(keyword)) return prev;
          return [keyword, ...prev];
        });
        setToolProgress((prev) => ({ ...prev, mainKeyword: true }));

        // deadlock 방지를 위해 await 사용하지 않음
        addToolOutput({
          tool: "set_main_keyword",
          toolCallId: toolCall.toolCallId,
          output: "main keyword set",
        });
      }

      if (toolCall.toolName === "set_metadata") {
        const nextMetadata = toolCall.input as MetadataState;

        setMetadata(nextMetadata);
        setKeywords((prev) => {
          const merged = new Set([...prev, ...nextMetadata.keywords]);
          return Array.from(merged);
        });
        setToolProgress((prev) => ({ ...prev, metadata: true }));

        addToolOutput({
          tool: "set_metadata",
          toolCallId: toolCall.toolCallId,
          output: "metadata set",
        });
      }

      if (toolCall.toolName === "set_content") {
        const { content: nextContent } = toolCall.input as {
          content: string;
        };

        setContent(nextContent);
        setToolProgress((prev) => ({ ...prev, content: true }));

        addToolOutput({
          tool: "set_content",
          toolCallId: toolCall.toolCallId,
          output: "content set",
        });
      }
    },
  });

  const isChatLoading =
    status === "submitted" || status === "streaming";

  // 서버 사이드 툴 출력 처리 (연관 키워드, 리서치)
  useEffect(() => {
    const processedSuggestIds = processedSuggestCallIdsRef.current;
    let hasNewSuggestions = false;
    const newKeywords: string[] = [];

    for (const message of messages ?? []) {
      for (const part of message.parts ?? []) {
        if (
          part.type === "tool-suggest_keywords" &&
          part.state === "output-available" &&
          !processedSuggestIds.has(part.toolCallId)
        ) {
          processedSuggestIds.add(part.toolCallId);
          hasNewSuggestions = true;

          const output = part.output as Array<{
            keyword: string;
            competition: number;
            volume: number;
            cpc: number;
          }>;

          output.forEach((item) => {
            newKeywords.push(item.keyword);
          });
        }

        if (
          part.type === "tool-naver_search_blog" &&
          part.state === "output-available"
        ) {
          setToolProgress((prev) => ({ ...prev, naverSearch: true }));
        }

        if (
          part.type === "tool-brave_search" &&
          part.state === "output-available"
        ) {
          setToolProgress((prev) => ({ ...prev, braveSearch: true }));
        }
      }
    }

    if (hasNewSuggestions && newKeywords.length > 0) {
      setKeywords((prev) => {
        const merged = new Set([...prev, ...newKeywords]);
        return Array.from(merged);
      });
      setToolProgress((prev) => ({ ...prev, suggestKeywords: true }));
    }
  }, [messages]);

  const brandings = useMemo(
    () =>
      brandingData
        ? [{ id: brandingData.id, name: t("newArticle.default_branding") }]
        : [],
    [brandingData, t]
  );

  const handleGenerateSubmit = async (data: GenerationFormData) => {
    const context = {
      topic: data.topic,
      brandingId: data.brandingId,
      keywords: data.keywords || [],
      additionalInstructions: data.additionalInstructions || undefined,
    };

    contextRef.current = context;
    setGenerationContext(context);
    setKeywords(context.keywords);
    setMainKeyword(context.keywords[0] ?? null);
    setMetadata(null);
    setContent("");
    setArticleId(null);
    setIsChatDisabled(false);
    setToolProgress({
      mainKeyword: false,
      suggestKeywords: false,
      naverSearch: false,
      braveSearch: false,
      metadata: false,
      content: false,
    });
    processedSuggestCallIdsRef.current = new Set();

    setMode("chat");

    // 0단계: 폼 제출 직후 사용자 메시지 전송
    sendMessage({ text: "글 작성을 시작해주세요." });
  };

  const handleSaveArticle = async (
    finalContent: string,
    finalMetadata: MetadataState
  ) => {
    if (!user?.id) {
      toast({
        title: t("save.loginRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSavingArticle(true);
      const client = createAuthenticatedClient(user.id);

      const slug = generateUniqueSlug(
        finalMetadata.slug || finalMetadata.title
      );

      const payload = {
        title: finalMetadata.title,
        slug,
        keywords: finalMetadata.keywords,
        description: finalMetadata.description,
        content: finalContent,
        brandingId: generationContext?.brandingId,
        metaTitle: finalMetadata.title,
        metaDescription: finalMetadata.description,
      };

      const response = await client.post("/api/articles/draft", payload);
      const article = response.data;

      setArticleId(article.id);
      setIsChatDisabled(true);

      toast({
        title: t("save.success.title"),
        description: t("save.success.desc", { title: article.title }),
      });

      // 저장 완료 후 상세 페이지로 이동
      router.push(ROUTES.ARTICLES_EDIT(orgId, article.id));
    } catch (error) {
      const message = extractApiErrorMessage(error, t("save.error.desc"));
      toast({
        title: t("save.error.title"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSavingArticle(false);
    }
  };

  const steps = useMemo(
    () => [
      {
        id: 0,
        label: "주제 설정",
        done: !!generationContext,
      },
      {
        id: 1,
        label: "메인 키워드",
        done: toolProgress.mainKeyword,
      },
      {
        id: 2,
        label: "연관 키워드",
        done: toolProgress.suggestKeywords,
      },
      {
        id: 3,
        label: "블로그 리서치",
        done: toolProgress.naverSearch,
      },
      {
        id: 4,
        label: "웹 리서치",
        done: toolProgress.braveSearch,
      },
      {
        id: 5,
        label: "메타데이터",
        done: toolProgress.metadata,
      },
      {
        id: 6,
        label: "본문 작성",
        done: toolProgress.content,
      },
    ],
    [generationContext, toolProgress]
  );

  const currentStepIndex = steps.findIndex((step) => !step.done);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const SCROLL_BOTTOM_THRESHOLD_PX = 80;

  const handleChatScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    const distanceToBottom =
      container.scrollHeight - (container.scrollTop + container.clientHeight);

    setIsNearBottom(distanceToBottom <= SCROLL_BOTTOM_THRESHOLD_PX);
  };

  useEffect(() => {
    if (!isNearBottom) return;

    const container = chatContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages, isNearBottom]);

  const [input, setInput] = useState("");

  const handleChatSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isChatDisabled) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  if (mode === "form") {
    return (
      <div className="min-h-screen">
        <GenerationForm
          brandings={brandings}
          onSubmit={handleGenerateSubmit}
          isLoading={isLoadingBranding}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="container mx-auto max-w-5xl px-4 md:px-6 py-8 md:py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode("form")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>다시 설정하기</span>
          </Button>
        </div>

        {/* Stepper */}
        <Card className="border-border bg-bg-primary">
          <CardContent className="p-4 md:p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Sparkles className="h-4 w-4 text-accent-brand" />
              <span>글 작성 진행 단계</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {steps.map((step, index) => {
                const isActive =
                  index === currentStepIndex ||
                  (currentStepIndex === -1 &&
                    index === steps.length - 1);
                const isDone = step.done;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1 text-xs md:text-sm border transition-colors",
                      isDone
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : isActive
                        ? "bg-bg-secondary border-accent-brand text-accent-brand"
                        : "bg-bg-secondary border-border text-text-tertiary"
                    )}
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border bg-white">
                      {isDone ? <Check className="h-3 w-3" /> : index + 1}
                    </span>
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Chat + Result */}
        <div className="grid grid-cols-1 gap-6 items-start">
          {/* Chat */}
          <Card className="border-border bg-bg-primary">
            <CardContent className="p-4 md:p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MessageCircle className="h-4 w-4 text-accent-brand" />
                <span>AI와 함께 글 작성하기</span>
              </div>

              <div
                ref={chatContainerRef}
                className="flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-1"
                onScroll={handleChatScroll}
              >
                {messages?.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-full",
                        isUser ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm space-y-2",
                          isUser
                            ? "bg-[#C46849] text-white"
                            : "bg-bg-secondary text-text-primary border border-border"
                        )}
                      >
                        <div className="flex items-center gap-2 text-xs font-medium mb-1">
                          {isUser ? (
                            <>
                              <User className="h-3 w-3" />
                              <span>사용자</span>
                            </>
                          ) : (
                            <>
                              <Bot className="h-3 w-3" />
                              <span>AI 어시스턴트</span>
                            </>
                          )}
                        </div>

                        {message.parts?.map((part, index) => {
                          if (part.type === "text") {
                            return (
                              <div
                                key={`${message.id}-text-${index}`}
                                className={cn(
                                  "prose prose-sm max-w-none",
                                  isUser && "prose-invert"
                                )}
                              >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {part.text}
                                </ReactMarkdown>
                              </div>
                            );
                          }

                          if (part.type === "tool-set_main_keyword") {
                            if (part.state === "output-available") {
                              return (
                                <div
                                  key={part.toolCallId}
                                  className="text-xs rounded-md bg-emerald-50 text-emerald-800 px-3 py-2 flex items-center gap-2"
                                >
                                  <Hash className="h-3 w-3" />
                                  <span>
                                    메인 키워드가 설정되었습니다:{" "}
                                    <strong>{mainKeyword}</strong>
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={part.toolCallId}
                                className="text-xs rounded-md bg-bg-secondary text-text-secondary px-3 py-2 flex items-center gap-2"
                              >
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>메인 키워드를 선택하는 중...</span>
                              </div>
                            );
                          }

                          if (part.type === "tool-suggest_keywords") {
                            if (part.state === "output-available") {
                              const output = part.output as Array<{
                                keyword: string;
                                competition: number;
                                volume: number;
                                cpc: number;
                              }>;

                              return (
                                <div
                                  key={part.toolCallId}
                                  className="text-xs rounded-md bg-bg-secondary text-text-secondary px-3 py-2 space-y-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <Search className="h-3 w-3" />
                                    <span>연관 키워드 제안 결과</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {output.map((item) => (
                                      <Badge
                                        key={item.keyword}
                                        variant="info"
                                        className="text-[10px]"
                                      >
                                        {item.keyword}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={part.toolCallId}
                                className="text-xs rounded-md bg-bg-secondary text-text-secondary px-3 py-2 flex items-center gap-2"
                              >
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>연관 키워드를 불러오는 중...</span>
                              </div>
                            );
                          }

                          if (part.type === "tool-naver_search_blog") {
                            if (part.state === "output-available") {
                              const output = part.output as Array<{
                                title: string;
                                description: string;
                              }>;

                              return (
                                <div
                                  key={part.toolCallId}
                                  className="text-xs rounded-md bg-bg-secondary text-text-secondary px-3 py-2 space-y-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <ListChecks className="h-3 w-3" />
                                    <span>네이버 블로그 상위 결과</span>
                                  </div>
                                  <ul className="space-y-1">
                                    {output.map((item, idx) => (
                                      <li key={`${item.title}-${idx}`}>
                                        <span className="font-medium">
                                          {item.title}
                                        </span>
                                        {item.description && (
                                          <span className="ml-1 text-text-tertiary">
                                            - {item.description}
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={part.toolCallId}
                                className="text-xs rounded-md bg-bg-secondary text-text-secondary px-3 py-2 flex items-center gap-2"
                              >
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>네이버 블로그를 조사하는 중...</span>
                              </div>
                            );
                          }

                          if (part.type === "tool-brave_search") {
                            if (part.state === "output-available") {
                              const output = part.output as Array<{
                                title: string;
                                description: string;
                                published: string;
                                rank: number;
                              }>;

                              return (
                                <div
                                  key={part.toolCallId}
                                  className="text-xs rounded-md bg-bg-secondary text-text-secondary px-3 py-2 space-y-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <Globe2 className="h-3 w-3" />
                                    <span>웹 리서치 결과 (Brave Search)</span>
                                  </div>
                                  <ul className="space-y-1">
                                    {output.map((item) => (
                                      <li
                                        key={`${item.rank}-${item.title}`}
                                      >
                                        <span className="font-medium">
                                          {item.title}
                                        </span>
                                        {item.description && (
                                          <span className="ml-1 text-text-tertiary">
                                            - {item.description}
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={part.toolCallId}
                                className="text-xs rounded-md bg-bg-secondary text-text-secondary px-3 py-2 flex items-center gap-2"
                              >
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>웹에서 전문 정보를 탐색하는 중...</span>
                              </div>
                            );
                          }

                          if (part.type === "tool-set_metadata") {
                            if (part.state === "output-available") {
                              return (
                                <div
                                  key={part.toolCallId}
                                  className="text-xs rounded-md bg-emerald-50 text-emerald-800 px-3 py-2 flex items-center gap-2"
                                >
                                  <FileText className="h-3 w-3" />
                                  <span>SEO 메타데이터가 설정되었습니다.</span>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={part.toolCallId}
                                className="text-xs rounded-md bg-bg-secondary text-text-secondary px-3 py-2 flex items-center gap-2"
                              >
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>메타데이터를 설계하는 중...</span>
                              </div>
                            );
                          }

                          if (part.type === "tool-set_content") {
                            if (part.state === "output-available") {
                              return (
                                <div
                                  key={part.toolCallId}
                                  className="text-xs rounded-md bg-emerald-50 text-emerald-800 px-3 py-2 flex items-center gap-2"
                                >
                                  <FileText className="h-3 w-3" />
                                  <span>본문이 최종 확정되었습니다.</span>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={part.toolCallId}
                                className="text-xs rounded-md bg-bg-secondary text-text-secondary px-3 py-2 flex items-center gap-2"
                              >
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>본문을 작성하는 중...</span>
                              </div>
                            );
                          }

                          return null;
                        })}
                      </div>
                    </div>
                  );
                })}

                {isChatLoading && (
                  <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>AI가 생각중입니다...</span>
                  </div>
                )}

                {chatError && (
                  <div className="text-xs text-danger">
                    {chatError.message}
                  </div>
                )}
              </div>

              <form
                onSubmit={handleChatSubmit}
                className="mt-2 flex items-end gap-2"
              >
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="AI에게 추가 지시사항이나 수정 요청을 입력하세요."
                  disabled={isChatDisabled}
                  className="flex-1 resize-none rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2 min-h-[44px]"
                  rows={2}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isChatDisabled || !input.trim()}
                  className="flex items-center gap-2"
                >
                  {isChatLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>전송 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>보내기</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result Preview */}
          {metadata && content && (
            <ArticlePreviewSection
              article={{
                title: metadata.title,
                content,
                metaDescription: metadata.description,
                keywords,
              }}
              onSave={async () => {
                if (!metadata) return;
                await handleSaveArticle(content, metadata);
              }}
              onEdit={() => {
                if (articleId) {
                  router.push(ROUTES.ARTICLES_EDIT(orgId, articleId));
                }
              }}
              onRegenerate={() => {
                setMode("form");
                setGenerationContext(null);
                setKeywords([]);
                setMainKeyword(null);
                setMetadata(null);
                setContent("");
                setArticleId(null);
                setIsChatDisabled(false);
                setToolProgress({
                  mainKeyword: false,
                  suggestKeywords: false,
                  naverSearch: false,
                  braveSearch: false,
                  metadata: false,
                  content: false,
                });
              }}
              isSaving={isSavingArticle}
            />
          )}
        </div>
      </div>
    </div>
  );
}
