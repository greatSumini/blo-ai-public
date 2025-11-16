"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Hash } from "lucide-react";
import { MetadataCard } from "./metadata-card";

interface GenerationProgressSectionProps {
  currentTask: string;
  streamingText: string;
  metadata: {
    title?: string;
    keywords?: string[];
    metaDescription?: string;
  };
  onCancel: () => void;
}

export function GenerationProgressSection({
  currentTask,
  streamingText,
  metadata,
  onCancel,
}: GenerationProgressSectionProps) {
  const t = useTranslations("newArticle.generating");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto max-w-4xl px-4 md:px-6 py-16 md:py-24 space-y-8 motion-reduce:transition-none"
      role="region"
      aria-label="Article generation progress"
    >
      {/* Current Task */}
      <div className="text-center space-y-4" role="status" aria-live="polite" aria-atomic="true">
        <p className="text-xl md:text-2xl font-medium text-foreground dark:text-foreground">
          {currentTask}
        </p>
        <Button
          variant="ghost"
          size="default"
          onClick={onCancel}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 min-h-[44px]"
          aria-label="Cancel article generation"
        >
          {t("cancel")}
        </Button>
      </div>

      {/* Streaming Preview (Plain Text) */}
      <Card className="border-border bg-card dark:bg-card dark:border-border shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div
            className="whitespace-pre-wrap font-mono text-sm text-muted-foreground dark:text-muted-foreground max-h-96 overflow-y-auto"
            aria-live="off"
          >
            {streamingText || t("initializing")}
            <span
              className="inline-block w-0.5 h-4 bg-[#C46849] dark:bg-[#d97757] ml-1 animate-pulse"
              aria-hidden="true"
            />
          </div>
        </CardContent>
      </Card>

      {/* Metadata Cards (Compact, 2-column grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MetadataCard
          icon={FileText}
          label={t("metadata.title")}
          value={metadata.title || t("metadata.generating")}
          isLoading={!metadata.title}
        />
        <MetadataCard
          icon={Hash}
          label={t("metadata.keywords")}
          value={
            metadata.keywords && metadata.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {metadata.keywords.map((k) => (
                  <Badge key={k} variant="secondary" className="text-xs">
                    {k}
                  </Badge>
                ))}
              </div>
            ) : (
              t("metadata.generating")
            )
          }
          isLoading={!metadata.keywords || metadata.keywords.length === 0}
        />
      </div>
    </motion.div>
  );
}
