"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import type { ArticleFormData } from "../lib/article-form-schema";
import { generateSlug } from "../lib/article-form-schema";

interface ArticleFormProps {
  form: UseFormReturn<ArticleFormData>;
  styleGuides?: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export function ArticleForm({ form, styleGuides, isLoading }: ArticleFormProps) {
  const t = useTranslations("articles");
  const [keywordInput, setKeywordInput] = useState("");

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;

    const currentKeywords = form.getValues("keywords") || [];
    if (!currentKeywords.includes(trimmed)) {
      form.setValue("keywords", [...currentKeywords, trimmed]);
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (keyword: string) => {
    const currentKeywords = form.getValues("keywords") || [];
    form.setValue(
      "keywords",
      currentKeywords.filter((k) => k !== keyword)
    );
  };

  const handleTitleChange = (value: string) => {
    form.setValue("title", value);

    // Auto-generate slug if it's empty or was auto-generated
    const currentSlug = form.getValues("slug");
    if (!currentSlug || currentSlug === generateSlug(form.getValues("title"))) {
      const newSlug = generateSlug(value);
      form.setValue("slug", newSlug);
    }
  };

  const keywords = form.watch("keywords") || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1F2937" }}>
          {t("articleForm.title")}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
          {t("articleForm.subtitle")}
        </p>
      </div>

      {/* Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              {t("articleForm.titleLabel")} <span style={{ color: "#DC2626" }}>*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={t("articleForm.titlePlaceholder")}
                disabled={isLoading}
                className="h-12 text-base"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "8px",
                }}
              />
            </FormControl>
            <FormDescription>
              {t("articleForm.titleDescription")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Slug */}
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              {t("articleForm.slugLabel")} <span style={{ color: "#DC2626" }}>*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("articleForm.slugPlaceholder")}
                disabled={isLoading}
                className="h-12 font-mono text-sm"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "8px",
                }}
              />
            </FormControl>
            <FormDescription>
              {t("articleForm.slugDescription")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Keywords */}
      <FormField
        control={form.control}
        name="keywords"
        render={() => (
          <FormItem>
            <FormLabel className="text-base font-semibold">{t("articleForm.keywordsLabel")}</FormLabel>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder={t("articleForm.keywordsPlaceholder")}
                  disabled={isLoading}
                  className="h-10"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "8px",
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddKeyword}
                  disabled={isLoading}
                  className="h-10 w-10"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "8px",
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                      style={{
                        backgroundColor: "#F3F4F6",
                        color: "#374151",
                      }}
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-2 hover:opacity-70"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <FormDescription>
              {t("articleForm.keywordsDescription")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              {t("articleForm.descriptionLabel")}
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t("articleForm.descriptionPlaceholder")}
                disabled={isLoading}
                rows={3}
                className="resize-none"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "8px",
                }}
              />
            </FormControl>
            <FormDescription>
              {t("articleForm.descriptionDescription")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Content */}
      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              {t("articleForm.contentLabel")} <span style={{ color: "#DC2626" }}>*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t("articleForm.contentPlaceholder")}
                disabled={isLoading}
                rows={12}
                className="resize-none font-mono text-sm"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "8px",
                }}
              />
            </FormControl>
            <FormDescription>
              {t("articleForm.contentDescription")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Style Guide */}
      {styleGuides && styleGuides.length > 0 && (
        <FormField
          control={form.control}
          name="styleGuideId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                {t("articleForm.styleGuideLabel")}
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger
                    className="h-12"
                    style={{
                      borderColor: "#E1E5EA",
                      borderRadius: "8px",
                    }}
                  >
                    <SelectValue placeholder={t("articleForm.styleGuidePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {styleGuides.map((guide) => (
                    <SelectItem key={guide.id} value={guide.id}>
                      {guide.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {t("articleForm.styleGuideDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Tone */}
      <FormField
        control={form.control}
        name="tone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">{t("articleForm.toneLabel")}</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger
                  className="h-12"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "8px",
                  }}
                >
                  <SelectValue placeholder={t("articleForm.tonePlaceholder")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="professional">{t("articleForm.toneProfessional")}</SelectItem>
                <SelectItem value="friendly">{t("articleForm.toneFriendly")}</SelectItem>
                <SelectItem value="inspirational">{t("articleForm.toneInspirational")}</SelectItem>
                <SelectItem value="educational">{t("articleForm.toneEducational")}</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              {t("articleForm.toneDescription")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Content Length */}
        <FormField
          control={form.control}
          name="contentLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                {t("articleForm.contentLengthLabel")}
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger
                    className="h-12"
                    style={{
                      borderColor: "#E1E5EA",
                      borderRadius: "8px",
                    }}
                  >
                    <SelectValue placeholder={t("articleForm.contentLengthPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="short">{t("articleForm.contentLengthShort")}</SelectItem>
                  <SelectItem value="medium">{t("articleForm.contentLengthMedium")}</SelectItem>
                  <SelectItem value="long">{t("articleForm.contentLengthLong")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reading Level */}
        <FormField
          control={form.control}
          name="readingLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                {t("articleForm.readingLevelLabel")}
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger
                    className="h-12"
                    style={{
                      borderColor: "#E1E5EA",
                      borderRadius: "8px",
                    }}
                  >
                    <SelectValue placeholder={t("articleForm.readingLevelPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="beginner">{t("articleForm.readingLevelBeginner")}</SelectItem>
                  <SelectItem value="intermediate">{t("articleForm.readingLevelIntermediate")}</SelectItem>
                  <SelectItem value="advanced">{t("articleForm.readingLevelAdvanced")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
