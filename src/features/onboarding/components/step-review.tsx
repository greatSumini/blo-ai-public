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
import { Textarea } from "@/components/ui/textarea";
import { OnboardingFormData } from "../lib/onboarding-schema";
import {
  PERSONALITY_OPTIONS,
  FORMALITY_OPTIONS,
  TONE_OPTIONS,
  CONTENT_LENGTH_OPTIONS,
  READING_LEVEL_OPTIONS,
} from "../lib/constants";

interface StepReviewProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function StepReview({ form }: StepReviewProps) {
  const t = useTranslations("onboarding.review");
  const formValues = form.getValues();

  const getPersonalityLabels = () => {
    return formValues.personality
      .map(
        (p) =>
          PERSONALITY_OPTIONS.find((opt) => opt.value === p)?.label || p
      )
      .join(", ");
  };

  const getFormalityLabel = () => {
    return (
      FORMALITY_OPTIONS.find((opt) => opt.value === formValues.formality)
        ?.label || formValues.formality
    );
  };

  const getToneLabel = () => {
    return (
      TONE_OPTIONS.find((opt) => opt.value === formValues.tone)?.label ||
      formValues.tone
    );
  };

  const getLengthLabel = () => {
    return (
      CONTENT_LENGTH_OPTIONS.find(
        (opt) => opt.value === formValues.contentLength
      )?.label || formValues.contentLength
    );
  };

  const getLevelLabel = () => {
    return (
      READING_LEVEL_OPTIONS.find(
        (opt) => opt.value === formValues.readingLevel
      )?.label || formValues.readingLevel
    );
  };

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

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Brand Voice Summary */}
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E1E5EA",
          }}
        >
          <h3
            className="mb-3 font-semibold"
            style={{ color: "#111827" }}
          >
            {t("section_brand_voice")}
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>{t("label_brand_name")}</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {formValues.brandName}
              </dd>
            </div>
            <div className="text-sm">
              <dt className="mb-1" style={{ color: "#6B7280" }}>
                {t("label_description")}
              </dt>
              <dd style={{ color: "#111827" }}>
                {formValues.brandDescription}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>{t("label_personality")}</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {getPersonalityLabels()}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>{t("label_formality")}</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {getFormalityLabel()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Audience Summary */}
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E1E5EA",
          }}
        >
          <h3
            className="mb-3 font-semibold"
            style={{ color: "#111827" }}
          >
            {t("section_audience")}
          </h3>
          <dl className="space-y-2">
            <div className="text-sm">
              <dt className="mb-1" style={{ color: "#6B7280" }}>
                {t("label_target_audience")}
              </dt>
              <dd style={{ color: "#111827" }}>
                {formValues.targetAudience}
              </dd>
            </div>
            <div className="text-sm">
              <dt className="mb-1" style={{ color: "#6B7280" }}>
                {t("label_pain_points")}
              </dt>
              <dd style={{ color: "#111827" }}>{formValues.painPoints}</dd>
            </div>
          </dl>
        </div>

        {/* Settings Summary */}
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E1E5EA",
          }}
        >
          <h3
            className="mb-3 font-semibold"
            style={{ color: "#111827" }}
          >
            {t("section_content_settings")}
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>{t("label_language")}</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {formValues.language === "ko" ? t("language_ko") : t("language_en")}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>{t("label_tone")}</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {getToneLabel()}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>{t("label_length")}</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {getLengthLabel()}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>{t("label_reading_level")}</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {getLevelLabel()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Optional Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("field_notes")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("placeholder_notes")}
                {...field}
                className="min-h-[100px] resize-y"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "6px",
                }}
              />
            </FormControl>
            <FormDescription>
              {t("description_notes")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: "#F0F9FF",
          borderLeft: "4px solid #3BA2F8",
        }}
      >
        <p className="text-sm font-medium" style={{ color: "#111827" }}>
          {t("ready_title")}
        </p>
        <p className="mt-2 text-sm" style={{ color: "#374151" }}>
          {t("ready_text")}
        </p>
      </div>
    </div>
  );
}
