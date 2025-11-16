"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingFormData } from "../lib/onboarding-schema";
import {
  TONE_OPTIONS,
  CONTENT_LENGTH_OPTIONS,
  READING_LEVEL_OPTIONS,
} from "../lib/constants";

interface StepStyleProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function StepStyle({ form }: StepStyleProps) {
  const t = useTranslations("onboarding.style");

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-semibold"
          style={{ color: "#111827" }}
        >
          {t("title")}
        </h2>
        <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
          {t("subtitle")}
        </p>
      </div>

      {/* Tone */}
      <FormField
        control={form.control}
        name="tone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("field_tone")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger
                  className="h-10"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "6px",
                  }}
                >
                  <SelectValue placeholder={t("placeholder_tone")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span
                        className="text-xs"
                        style={{ color: "#6B7280" }}
                      >
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              {t("description_tone")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Content Length */}
      <FormField
        control={form.control}
        name="contentLength"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("field_content_length")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger
                  className="h-10"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "6px",
                  }}
                >
                  <SelectValue placeholder={t("placeholder_content_length")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CONTENT_LENGTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span
                        className="text-xs"
                        style={{ color: "#6B7280" }}
                      >
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              {t("description_content_length")}
            </FormDescription>
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
            <FormLabel>{t("field_reading_level")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger
                  className="h-10"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "6px",
                  }}
                >
                  <SelectValue placeholder={t("placeholder_reading_level")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {READING_LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span
                        className="text-xs"
                        style={{ color: "#6B7280" }}
                      >
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              {t("description_reading_level")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: "#F5F7FA",
          borderLeft: "4px solid #3BA2F8",
        }}
      >
        <p className="text-sm font-medium" style={{ color: "#111827" }}>
          {t("tip_icon")}
        </p>
        <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
          {t("tip_text")}
        </p>
      </div>
    </div>
  );
}
