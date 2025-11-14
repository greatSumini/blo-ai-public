"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useKeywordSuggestions, useBulkCreateKeywords } from "@/features/keywords/hooks/useKeywordQuery";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Loader2 } from "lucide-react";
import type { SuggestionItem } from "@/features/keywords/lib/dto";
import { isAxiosError } from "@/lib/remote/api-client";

interface SuggestionsDialogProps {
  children?: React.ReactNode;
  onKeywordsAdded?: (keywords: string[]) => void;
}

const formSchema = z.object({
  keyword: z
    .string()
    .trim()
    .min(1, "기준 키워드를 입력해주세요")
    .max(100, "기준 키워드는 100자 이내여야 합니다"),
  context: z
    .string()
    .max(1000, "추가 맥락은 1000자 이내여야 합니다")
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

type SuggestionsErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
};

const SUGGESTIONS_ERROR_MESSAGES: Record<string, string> = {
  DATAFORSEO_INVALID_CREDENTIALS:
    "연관 검색어 서비스를 사용할 수 없는 상태입니다. 관리자에게 문의해주세요.",
  DATAFORSEO_RATE_LIMIT:
    "오늘 연관 검색어 조회 한도를 초과했을 수 있어요. 잠시 후 다시 시도해주세요.",
  DATAFORSEO_TIMEOUT:
    "응답이 너무 오래 걸리고 있습니다. 키워드를 조금 더 구체적으로 줄이거나, 잠시 후 다시 시도해주세요.",
  DATAFORSEO_API_ERROR:
    "연관 검색어 조회 중 외부 서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
};

function mapSuggestionsError(error: unknown): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as SuggestionsErrorPayload | undefined;
    const code = payload?.error?.code;

    if (code && SUGGESTIONS_ERROR_MESSAGES[code]) {
      return SUGGESTIONS_ERROR_MESSAGES[code];
    }

    if (typeof payload?.error?.message === "string") {
      return payload.error.message;
    }

    if (typeof payload?.message === "string") {
      return payload.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "연관 검색어 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

export function SuggestionsDialog({ children, onKeywordsAdded }: SuggestionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [hasFetched, setHasFetched] = useState(false);
  const [activeStep, setActiveStep] = useState<"form" | "results">("form");

  const { toast } = useToast();
  const suggestionsMutation = useKeywordSuggestions();
  const bulkCreateMutation = useBulkCreateKeywords();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: "",
      context: "",
    },
  });

  const handleFetchSuggestions = async (values: FormValues) => {
    const trimmedKeyword = values.keyword.trim();
    const trimmedContext = values.context?.trim();

     setActiveStep("results");
     setHasFetched(false);

    try {
      const result = await suggestionsMutation.mutateAsync({
        keyword: trimmedKeyword,
        context: trimmedContext && trimmedContext.length > 0 ? trimmedContext : undefined,
      });

      setSuggestions(result.suggestions);
      setSelectedKeywords(
        new Set(result.suggestions.map((item) => item.keyword))
      );
      setHasFetched(true);

      toast({
        title: "연관 검색어 조회 완료",
        description: `${result.suggestions.length}개의 연관 검색어를 찾았습니다.`,
      });
    } catch (error: any) {
      const errorMessage = mapSuggestionsError(error);
      toast({
        title: "조회 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleToggleKeyword = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  const handleAddSelected = async () => {
    if (selectedKeywords.size === 0) {
      toast({
        title: "키워드 미선택",
        description: "추가할 키워드를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const addedKeywords = Array.from(selectedKeywords);
      const result = await bulkCreateMutation.mutateAsync(addedKeywords);
      toast({
        title: "키워드 추가 완료",
        description: `${result.created}개 추가, ${result.skipped}개 중복 건너뜀`,
      });

      // Reset state
      setSuggestions([]);
      setSelectedKeywords(new Set());
      form.reset();
      setOpen(false);
      setHasFetched(false);

      if (onKeywordsAdded && addedKeywords.length > 0) {
        onKeywordsAdded(addedKeywords);
      }
    } catch (error: any) {
      const errorMessage = mapSuggestionsError(error);
      toast({
        title: "추가 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSuggestions([]);
    setSelectedKeywords(new Set());
    form.reset();
    setHasFetched(false);
    setActiveStep("form");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Lightbulb className="mr-2 h-4 w-4" />
            연관 검색어 조회
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>연관 검색어 조회</DialogTitle>
          <DialogDescription>
            기준이 될 키워드와 추가 맥락을 입력하면, 실제로 사람들이 검색창에 입력할 법한 연관 검색어를 AI가 추천해 드려요. (최대 10개)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-4">
            {/* Stepper */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`flex-1 rounded-full border px-3 py-1 text-xs font-medium ${
                  activeStep === "form"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-transparent"
                }`}
                onClick={() => setActiveStep("form")}
              >
                <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px]">
                  1
                </span>
                조건 입력
              </button>
              <div className="h-px flex-1 bg-muted" />
              <button
                type="button"
                className={`flex-1 rounded-full border px-3 py-1 text-xs font-medium ${
                  activeStep === "results"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-transparent"
                }`}
                onClick={() => setActiveStep("results")}
              >
                <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px]">
                  2
                </span>
                결과 확인
              </button>
            </div>

            {activeStep === "form" && (
              <form
                onSubmit={form.handleSubmit(handleFetchSuggestions)}
                className="space-y-4"
              >
                {/* Keyword & Context Input */}
                <FormField
                  control={form.control}
                  name="keyword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>기준 키워드</FormLabel>
                      <p className="text-xs text-gray-500">
                        예: &quot;블로그 마케팅&quot;, &quot;인스타그램 릴스&quot;처럼 글의 핵심 주제어를 1개만 입력해 주세요.
                      </p>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="기준 키워드 입력 (예: 블로그 마케팅)"
                          disabled={suggestionsMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>추가 맥락 (선택)</FormLabel>
                      <p className="text-xs text-gray-500">
                        타겟 독자, 글의 목적, 상황 등을 자유롭게 적어주세요. 연관 검색어의 방향을 더 정확하게 잡는 데 도움이 됩니다.
                      </p>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="예: 1인 마케터가 블로그를 활용해 리드(잠재고객)를 안정적으로 확보할 수 있는 방법을 찾고 있습니다."
                          disabled={suggestionsMutation.isPending}
                          className="h-24"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={
                    suggestionsMutation.isPending ||
                    !form.watch("keyword")?.trim().length
                  }
                  className="w-full"
                >
                  {suggestionsMutation.isPending ? "조회 중..." : "연관 검색어 조회"}
                </Button>
                <p className="mt-1 text-xs text-gray-400">
                  AI가 연관 검색어를 생성하는 데 최대 10초 정도 걸릴 수 있어요.
                </p>
              </form>
            )}

            {activeStep === "results" && (
              <div className="space-y-4">
                {/* Loading State */}
                {suggestionsMutation.isPending && (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-sm text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <p className="font-medium">연관 검색어를 불러오는 중입니다...</p>
                    <p className="text-xs text-gray-400 text-center">
                      사람들이 실제로 검색창에 입력할 법한 검색어를 생성하고 있어요.
                    </p>
                  </div>
                )}

                {/* Suggestions List */}
                {!suggestionsMutation.isPending && suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        연관 검색어 목록 ({suggestions.length}개)
                      </label>
                      <span className="text-xs text-gray-500">
                        {selectedKeywords.size}개 선택됨
                      </span>
                    </div>
                    <div className="border rounded-md max-h-96 overflow-y-auto">
                      <div className="divide-y">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleToggleKeyword(suggestion.keyword)}
                          >
                            <Checkbox
                              checked={selectedKeywords.has(suggestion.keyword)}
                              onCheckedChange={() => handleToggleKeyword(suggestion.keyword)}
                            />
                        <div className="flex-1">
                          <p className="font-medium">{suggestion.keyword}</p>
                          {suggestion.competition && (
                            <div className="flex gap-3 text-xs text-gray-500">
                              <span>경쟁도: {suggestion.competition}</span>
                            </div>
                          )}
                        </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty Result State */}
                {!suggestionsMutation.isPending &&
                  hasFetched &&
                  suggestions.length === 0 && (
                    <div className="rounded-md border border-dashed p-4 text-sm text-gray-500">
                      입력한 기준 키워드와 직접적으로 연관된 검색어를 찾지 못했어요. 조금 더 일반적인 키워드로 다시 시도해 보세요.
                    </div>
                  )}

                {!suggestionsMutation.isPending && !hasFetched && suggestions.length === 0 && (
                  <div className="rounded-md border border-dashed p-4 text-sm text-gray-500">
                    아직 조회한 연관 검색어가 없습니다. 먼저 조건을 입력해 조회해 보세요.
                  </div>
                )}
              </div>
            )}
          </div>
        </Form>

        {activeStep === "results" && suggestions.length > 0 && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={bulkCreateMutation.isPending}
            >
              취소
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={selectedKeywords.size === 0 || bulkCreateMutation.isPending}
            >
              {bulkCreateMutation.isPending
                ? "추가 중..."
                : `선택 항목 추가 (${selectedKeywords.size})`}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
