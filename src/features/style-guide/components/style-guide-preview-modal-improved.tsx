"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale/ko";
import { enUS } from "date-fns/locale/en-US";
import { useTranslations, useLocale } from "next-intl";
import type { StyleGuideResponse } from "../types";

interface StyleGuidePreviewModalImprovedProps {
  guide: StyleGuideResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (guide: StyleGuideResponse) => void;
}

// Helper component (상단으로 이동)
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="font-medium text-[#6B7280] min-w-[120px] shrink-0">{label}</span>
      <span className="text-[#1F2937] font-normal">{value}</span>
    </div>
  );
}

export function StyleGuidePreviewModalImproved({
  guide,
  isOpen,
  onClose,
  onEdit,
}: StyleGuidePreviewModalImprovedProps) {
  const t = useTranslations("styleGuide.modal");
  const tLabels = useTranslations("styleGuide.labels");
  const locale = useLocale();
  const dateLocale = locale === "ko" ? ko : enUS;

  if (!guide) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[#E1E5EA]">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#1F2937]">
            {guide.brandName}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 mt-2 text-sm text-[#6B7280]">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(guide.createdAt), "PPP", { locale: dateLocale })}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Content - 섹션 기반 */}
        <div className="space-y-6 py-4">
          {/* Brand Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">
              {t("brandInfo")}
            </h4>
            <div className="space-y-2 text-sm text-[#374151]">
              <InfoRow
                label={t("brandName")}
                value={guide.brandName}
              />
              <InfoRow
                label={t("description")}
                value={guide.brandDescription}
              />
              <InfoRow
                label={t("personality")}
                value={guide.personality.join(", ")}
              />
              <InfoRow
                label={t("formality")}
                value={tLabels(`formality.${guide.formality}`)}
              />
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-3 border-t border-[#E1E5EA] pt-4">
            <h4 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">
              {t("targetAudience")}
            </h4>
            <div className="space-y-2 text-sm text-[#374151]">
              <InfoRow label={t("audience")} value={guide.targetAudience} />
              <InfoRow label={t("painPoints")} value={guide.painPoints} />
            </div>
          </div>

          {/* Content Style */}
          <div className="space-y-3 border-t border-[#E1E5EA] pt-4">
            <h4 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">
              {t("contentStyle")}
            </h4>
            <div className="space-y-2 text-sm text-[#374151]">
              <InfoRow
                label={t("language")}
                value={guide.language === "ko" ? tLabels("language.korean") : tLabels("language.english")}
              />
              <InfoRow
                label={t("tone")}
                value={tLabels(`tone.${guide.tone}`)}
              />
              <InfoRow
                label={t("length")}
                value={tLabels(`contentLength.${guide.contentLength}`)}
              />
              <InfoRow
                label={t("readingLevel")}
                value={tLabels(`readingLevel.${guide.readingLevel}`)}
              />
            </div>
          </div>

          {/* Notes */}
          {guide.notes && (
            <div className="space-y-3 border-t border-[#E1E5EA] pt-4">
              <h4 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">
                {t("notes")}
              </h4>
              <p className="text-sm text-[#6B7280] whitespace-pre-wrap bg-[#F9FAFB] p-3 rounded">
                {guide.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onEdit(guide)}
            className="flex-1 border-[#E1E5EA]"
          >
            <Pencil className="mr-2 h-4 w-4" />
            {t("edit")}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-[#E1E5EA]"
          >
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
