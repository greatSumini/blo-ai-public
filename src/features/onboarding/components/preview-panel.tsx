"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { OnboardingFormData } from "../lib/onboarding-schema";
import {
  PERSONALITY_OPTIONS,
  PREVIEW_TEMPLATES,
  TONE_OPTIONS,
  CONTENT_LENGTH_OPTIONS,
  READING_LEVEL_OPTIONS,
} from "../lib/constants";

interface PreviewPanelProps {
  formData: Partial<OnboardingFormData>;
}

export function PreviewPanel({ formData }: PreviewPanelProps) {
  const t = useTranslations("onboarding.preview");
  const {
    brandName,
    personality,
    formality,
    targetAudience,
    language,
    tone,
    contentLength,
    readingLevel,
  } = formData;

  // Generate preview text
  const generatePreviewText = () => {
    if (!brandName || !personality || !formality || !targetAudience) {
      return t("empty_state");
    }

    const template =
      PREVIEW_TEMPLATES[language || "ko"][formality || "neutral"];

    // Get personality label
    const personalityLabel = personality
      .map(
        (p) =>
          PERSONALITY_OPTIONS.find((opt) => opt.value === p)?.label || p
      )
      .join(", ");

    return template
      .replace("{brandName}", brandName)
      .replace("{personality}", personalityLabel)
      .replace("{targetAudience}", targetAudience);
  };

  const toneLabel = TONE_OPTIONS.find((t) => t.value === tone)?.label;
  const lengthLabel = CONTENT_LENGTH_OPTIONS.find(
    (l) => l.value === contentLength
  )?.label;
  const levelLabel = READING_LEVEL_OPTIONS.find(
    (r) => r.value === readingLevel
  )?.label;

  return (
    <Card
      className="sticky top-6 h-fit p-6"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#E1E5EA",
        borderRadius: "12px",
      }}
    >
      <div className="space-y-4">
        <div>
          <h3
            className="text-lg font-semibold"
            style={{ color: "#111827" }}
          >
            {t("title")}
          </h3>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            {t("subtitle")}
          </p>
        </div>

        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: "#F5F7FA",
            borderLeft: "4px solid #3BA2F8",
          }}
        >
          <p
            className="leading-relaxed"
            style={{
              color: "#374151",
              fontSize: "15px",
              lineHeight: "1.7",
            }}
          >
            {generatePreviewText()}
          </p>
        </div>

        {/* Settings summary */}
        <div className="space-y-3 pt-4">
          <h4
            className="text-sm font-medium"
            style={{ color: "#374151" }}
          >
            {t("summary_title")}
          </h4>

          <div className="space-y-2">
            {brandName && (
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#6B7280" }}>{t("label_brand")}</span>
                <span
                  className="font-medium"
                  style={{ color: "#111827" }}
                >
                  {brandName}
                </span>
              </div>
            )}

            {language && (
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#6B7280" }}>{t("label_language")}</span>
                <span
                  className="font-medium"
                  style={{ color: "#111827" }}
                >
                  {language === "ko" ? t("language_ko") : t("language_en")}
                </span>
              </div>
            )}

            {tone && (
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#6B7280" }}>{t("label_tone")}</span>
                <span
                  className="font-medium"
                  style={{ color: "#111827" }}
                >
                  {toneLabel}
                </span>
              </div>
            )}

            {contentLength && (
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#6B7280" }}>{t("label_length")}</span>
                <span
                  className="font-medium"
                  style={{ color: "#111827" }}
                >
                  {lengthLabel}
                </span>
              </div>
            )}

            {readingLevel && (
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#6B7280" }}>{t("label_level")}</span>
                <span
                  className="font-medium"
                  style={{ color: "#111827" }}
                >
                  {levelLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
