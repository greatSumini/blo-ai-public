"use client";

import { useTranslations } from "next-intl";
import { OnboardingFormData } from "../lib/onboarding-schema";
import {
  PERSONALITY_OPTIONS,
  PREVIEW_TEMPLATES,
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
  } = formData;

  // Generate preview text
  const generatePreviewText = () => {
    if (!brandName || !personality || !formality || !targetAudience) {
      return t("empty_state");
    }

    const template =
      PREVIEW_TEMPLATES[language || "ko"][tone || "professional"];

    // Guard against undefined template
    if (!template) {
      return t("empty_state");
    }

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

  return (
    <div className="sticky top-6 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium text-foreground">
            {t("title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="rounded-md border-l-4 border-l-[#C46849] bg-secondary p-4">
          <p className="text-sm leading-relaxed text-foreground">
            {generatePreviewText()}
          </p>
        </div>
      </div>
    </div>
  );
}
