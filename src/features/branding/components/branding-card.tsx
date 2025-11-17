"use client";

import { motion } from "framer-motion";
import { IconButton } from "@/components/ui/icon-button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Globe, User } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale/ko";
import { enUS } from "date-fns/locale/en-US";
import { useTranslations, useLocale } from "next-intl";
import type { BrandingResponse } from "../types";
import { cardEnterVariants } from "../lib/animations";

interface BrandingCardProps {
  branding: BrandingResponse;
  index: number;
  onPreview: (branding: BrandingResponse) => void;
  onEdit: (branding: BrandingResponse) => void;
  onDelete: (id: string) => void;
}

export function BrandingCard({
  branding,
  index,
  onPreview,
  onEdit,
  onDelete,
}: BrandingCardProps) {
  const t = useTranslations("branding");
  const tLabels = useTranslations("branding.labels");
  const locale = useLocale();
  const dateLocale = locale === "ko" ? ko : enUS;

  return (
    <motion.div
      custom={index}
      variants={cardEnterVariants}
      initial="hidden"
      animate="visible"
      className="group border-b border-border py-3 px-3 hover:bg-secondary transition-colors h-[137px] flex flex-col"
    >
      {/* Main Content Area */}
      <div className="flex items-start justify-between flex-1 min-h-0 mb-2">
        {/* Left: Title & Description */}
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground font-medium text-base hover:text-[#C46849] transition-colors mb-2">
            {branding.brandName}
          </h3>
          <div className="mb-2 max-w-[720px]">
            <p className="line-clamp-2 text-base text-muted-foreground">
              {branding.brandDescription}
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex gap-1 ml-4 flex-shrink-0">
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => onPreview(branding)}
            aria-label={t("actions.previewAria", { brand: branding.brandName })}
          >
            <Eye className="h-4 w-4" />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => onEdit(branding)}
            aria-label={t("actions.editAria", { brand: branding.brandName })}
          >
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => onDelete(branding.id)}
            aria-label={t("actions.deleteAria", { brand: branding.brandName })}
            className="hover:bg-red-50 dark:hover:bg-red-950/20 focus-visible:ring-red-500"
          >
            <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
          </IconButton>
        </div>
      </div>

      {/* Bottom Metadata */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {/* Personality Badge */}
        <span>
          <Badge
            variant="outline"
            className="inline-flex items-center align-middle leading-none flex-shrink-0 bg-gradient-to-bl from-secondary/30 to-secondary/70 text-muted-foreground h-6 px-2 rounded-lg text-xs font-mono border-0"
          >
            {branding.personality.slice(0, 2).join(", ")}
            {branding.personality.length > 2 && ` +${branding.personality.length - 2}`}
          </Badge>
        </span>

        <span>•</span>

        {/* Language */}
        <span className="flex items-center gap-1">
          <Globe className="h-3 w-3" aria-hidden="true" />
          {branding.language === "ko"
            ? tLabels("language.korean")
            : tLabels("language.english")}
        </span>

        <span>•</span>

        {/* Target Audience */}
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" aria-hidden="true" />
          {branding.targetAudience}
        </span>

        <span>•</span>

        {/* Created Date */}
        <time dateTime={branding.createdAt}>
          {format(new Date(branding.createdAt), "PPP", { locale: dateLocale })}
        </time>
      </div>
    </motion.div>
  );
}
