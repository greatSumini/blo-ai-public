"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Globe, User } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale/ko";
import { enUS } from "date-fns/locale/en-US";
import { useTranslations, useLocale } from "next-intl";
import type { StyleGuideResponse } from "../types";
import { cardEnterVariants } from "../lib/animations";

interface StyleGuideCardProps {
  guide: StyleGuideResponse;
  index: number;
  onPreview: (guide: StyleGuideResponse) => void;
  onEdit: (guide: StyleGuideResponse) => void;
  onDelete: (id: string) => void;
}

export function StyleGuideCard({
  guide,
  index,
  onPreview,
  onEdit,
  onDelete,
}: StyleGuideCardProps) {
  const t = useTranslations("styleGuide");
  const tLabels = useTranslations("styleGuide.labels");
  const locale = useLocale();
  const dateLocale = locale === "ko" ? ko : enUS;

  return (
    <motion.div
      custom={index}
      variants={cardEnterVariants}
      initial="hidden"
      animate="visible"
      className="rounded-lg border border-[#E1E5EA] bg-white p-6 space-y-4 hover:shadow-xl hover:border-[#D1D5DB] hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-[#1F2937] leading-tight">
          {guide.brandName}
        </h3>
        <p className="text-sm text-[#6B7280] line-clamp-3 mt-2 leading-relaxed">
          {guide.brandDescription}
        </p>
      </div>

      {/* Personality Tags */}
      <div className="flex flex-wrap gap-2">
        {guide.personality.slice(0, 3).map((trait) => (
          <Badge
            key={trait}
            variant="outline"
            className="text-xs border-[#E1E5EA] text-[#374151]"
          >
            {trait}
          </Badge>
        ))}
        {guide.personality.length > 3 && (
          <Badge
            variant="outline"
            className="text-xs border-[#E1E5EA] text-[#374151]"
          >
            +{guide.personality.length - 3}
          </Badge>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-[#6B7280]">
        <span className="flex items-center gap-1">
          <Globe className="h-3.5 w-3.5" />
          {guide.language === "ko" ? tLabels("language.korean") : tLabels("language.english")}
        </span>
        <span className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {guide.targetAudience}
        </span>
      </div>

      {/* Created Date */}
      <div className="text-xs text-[#6B7280]">
        {format(new Date(guide.createdAt), "PPP", { locale: dateLocale })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-[#E1E5EA]">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-[#374151] hover:bg-[#F5F7FA] focus-visible:ring-2 focus-visible:ring-[#3BA2F8] focus-visible:ring-offset-2 transition-colors duration-200"
          onClick={() => onPreview(guide)}
          aria-label={t("actions.previewAria", { brand: guide.brandName })}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t("actions.preview")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-[#374151] hover:bg-[#F5F7FA] focus-visible:ring-2 focus-visible:ring-[#3BA2F8] focus-visible:ring-offset-2 transition-colors duration-200"
          onClick={() => onEdit(guide)}
          aria-label={t("actions.editAria", { brand: guide.brandName })}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t("actions.edit")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors duration-200"
          onClick={() => onDelete(guide.id)}
          aria-label={t("actions.deleteAria", { brand: guide.brandName })}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </motion.div>
  );
}
