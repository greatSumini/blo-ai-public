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
import { useTranslations } from "next-intl";

interface SuggestionsDialogProps {
  children?: React.ReactNode;
  onKeywordsAdded?: (keywords: string[]) => void;
}

type SuggestionsErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
};

export function SuggestionsDialog({ children, onKeywordsAdded }: SuggestionsDialogProps) {
  const t = useTranslations("keywords");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [hasFetched, setHasFetched] = useState(false);
  const [activeStep, setActiveStep] = useState<"form" | "results">("form");

  const { toast } = useToast();
  const suggestionsMutation = useKeywordSuggestions();
  const bulkCreateMutation = useBulkCreateKeywords();

  const SUGGESTIONS_ERROR_MESSAGES: Record<string, string> = {
    DATAFORSEO_INVALID_CREDENTIALS: t("suggestions.errors.invalidCredentials"),
    DATAFORSEO_RATE_LIMIT: t("suggestions.errors.rateLimit"),
    DATAFORSEO_TIMEOUT: t("suggestions.errors.timeout"),
    DATAFORSEO_API_ERROR: t("suggestions.errors.apiError"),
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

    return t("suggestions.errors.fallback");
  }

  const formSchema = z.object({
    keyword: z
      .string()
      .trim()
      .min(1, t("suggestions.validation.keywordRequired"))
      .max(100, t("suggestions.validation.keywordMaxLength")),
    context: z
      .string()
      .max(1000, t("suggestions.validation.contextMaxLength"))
      .optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

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
        title: t("suggestions.toast.fetchSuccessTitle"),
        description: t("suggestions.toast.fetchSuccessDescription", { count: result.suggestions.length }),
      });
    } catch (error: any) {
      const errorMessage = mapSuggestionsError(error);
      toast({
        title: t("suggestions.toast.fetchErrorTitle"),
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
        title: t("suggestions.toast.noSelectionTitle"),
        description: t("suggestions.toast.noSelectionDescription"),
        variant: "destructive",
      });
      return;
    }

    try {
      const addedKeywords = Array.from(selectedKeywords);
      const result = await bulkCreateMutation.mutateAsync(addedKeywords);
      toast({
        title: t("suggestions.toast.addSuccessTitle"),
        description: t("suggestions.toast.addSuccessDescription", {
          created: result.created,
          skipped: result.skipped
        }),
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
        title: t("suggestions.toast.addErrorTitle"),
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
            {t("suggestions.trigger")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("suggestions.title")}</DialogTitle>
          <DialogDescription>
            {t("suggestions.description")}
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
                {t("suggestions.stepInput")}
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
                {t("suggestions.stepResults")}
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
                      <FormLabel>{t("suggestions.keywordLabel")}</FormLabel>
                      <p className="text-xs text-gray-500">
                        {t("suggestions.keywordHelp")}
                      </p>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("suggestions.keywordPlaceholder")}
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
                      <FormLabel>{t("suggestions.contextLabel")}</FormLabel>
                      <p className="text-xs text-gray-500">
                        {t("suggestions.contextHelp")}
                      </p>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("suggestions.contextPlaceholder")}
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
                  {suggestionsMutation.isPending ? t("suggestions.fetching") : t("suggestions.fetchButton")}
                </Button>
                <p className="mt-1 text-xs text-gray-400">
                  {t("suggestions.fetchHint")}
                </p>
              </form>
            )}

            {activeStep === "results" && (
              <div className="space-y-4">
                {/* Loading State */}
                {suggestionsMutation.isPending && (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-sm text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <p className="font-medium">{t("suggestions.loadingTitle")}</p>
                    <p className="text-xs text-gray-400 text-center">
                      {t("suggestions.loadingDescription")}
                    </p>
                  </div>
                )}

                {/* Suggestions List */}
                {!suggestionsMutation.isPending && suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        {t("suggestions.listTitle", { count: suggestions.length })}
                      </label>
                      <span className="text-xs text-gray-500">
                        {t("suggestions.selectedCount", { count: selectedKeywords.size })}
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
                              <span>{t("suggestions.competition")}: {suggestion.competition}</span>
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
                      {t("suggestions.emptyResults")}
                    </div>
                  )}

                {!suggestionsMutation.isPending && !hasFetched && suggestions.length === 0 && (
                  <div className="rounded-md border border-dashed p-4 text-sm text-gray-500">
                    {t("suggestions.notFetchedYet")}
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
              {t("suggestions.cancel")}
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={selectedKeywords.size === 0 || bulkCreateMutation.isPending}
            >
              {bulkCreateMutation.isPending
                ? t("suggestions.adding")
                : t("suggestions.addSelected", { count: selectedKeywords.size })}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
