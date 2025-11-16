"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCard } from "./section-card";
import { AutoSaveIndicator } from "./auto-save-indicator";
import { useSettings } from "../hooks/useSettings";
import { useUpdateSettings } from "../hooks/useUpdateSettings";
import { useAutoSave } from "../hooks/useAutoSave";

export function ContentPreferencesSection() {
  const t = useTranslations("account.contentPreferences");
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [brandName, setBrandName] = useState(settings?.brandName ?? "");
  const [brandDescription, setBrandDescription] = useState(settings?.brandDescription ?? "");
  const [targetAudience, setTargetAudience] = useState(settings?.targetAudience ?? "");
  const [tone, setTone] = useState<"friendly" | "professional" | "casual" | "formal">(settings?.tone ?? "professional");
  const [language, setLanguage] = useState<"ko" | "en">(settings?.language ?? "ko");

  // settings 데이터가 로드되면 state 업데이트
  useEffect(() => {
    if (settings) {
      setBrandName(settings.brandName ?? "");
      setBrandDescription(settings.brandDescription ?? "");
      setTargetAudience(settings.targetAudience ?? "");
      setTone(settings.tone ?? "professional");
      setLanguage(settings.language ?? "ko");
    }
  }, [settings]);

  const { save, saveStatus } = useAutoSave({
    onSave: (data) => updateMutation.mutateAsync(data),
  });

  const handleChange = (field: string, value: string) => {
    const updates: Record<string, string> = { [field]: value };

    switch (field) {
      case "brandName":
        setBrandName(value);
        break;
      case "brandDescription":
        setBrandDescription(value);
        break;
      case "targetAudience":
        setTargetAudience(value);
        break;
      case "tone":
        setTone(value as "friendly" | "professional" | "casual" | "formal");
        break;
      case "language":
        setLanguage(value as "ko" | "en");
        break;
    }

    save(updates);
  };

  if (isLoading) {
    return <SectionCard title={t("title")} />;
  }

  return (
    <SectionCard title={t("title")} description={t("description")}>
      <div className="space-y-6">
        {/* Brand Name */}
        <div className="space-y-2">
          <Label htmlFor="brandName">{t("fields.brandName")}</Label>
          <Input
            id="brandName"
            value={brandName}
            onChange={(e) => handleChange("brandName", e.target.value)}
            placeholder={t("fields.brandNamePlaceholder")}
            className="max-w-md"
          />
        </div>

        {/* Brand Description */}
        <div className="space-y-2">
          <Label htmlFor="brandDescription">{t("fields.brandDescription")}</Label>
          <Textarea
            id="brandDescription"
            value={brandDescription}
            onChange={(e) => handleChange("brandDescription", e.target.value)}
            placeholder={t("fields.brandDescriptionPlaceholder")}
            rows={3}
            className="max-w-2xl resize-none"
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label htmlFor="targetAudience">{t("fields.targetAudience")}</Label>
          <Textarea
            id="targetAudience"
            value={targetAudience}
            onChange={(e) => handleChange("targetAudience", e.target.value)}
            placeholder={t("fields.targetAudiencePlaceholder")}
            rows={2}
            className="max-w-2xl resize-none"
          />
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <Label htmlFor="tone">{t("fields.tone")}</Label>
          <Select value={tone} onValueChange={(val) => handleChange("tone", val)}>
            <SelectTrigger id="tone" className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">{t("fields.toneOptions.friendly")}</SelectItem>
              <SelectItem value="professional">{t("fields.toneOptions.professional")}</SelectItem>
              <SelectItem value="casual">{t("fields.toneOptions.casual")}</SelectItem>
              <SelectItem value="formal">{t("fields.toneOptions.formal")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language">{t("fields.language")}</Label>
          <Select value={language} onValueChange={(val) => handleChange("language", val)}>
            <SelectTrigger id="language" className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ko">{t("fields.languageOptions.ko")}</SelectItem>
              <SelectItem value="en">{t("fields.languageOptions.en")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auto Save Indicator */}
        <AutoSaveIndicator
          isSaving={saveStatus === "saving"}
          isError={saveStatus === "error"}
          lastSavedAt={settings?.updatedAt}
        />
      </div>
    </SectionCard>
  );
}
