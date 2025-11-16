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
      className="container mx-auto max-w-4xl px-4 py-12 space-y-6"
    >
      {/* Current Task */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">{currentTask}</p>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>

      {/* Streaming Preview (Plain Text) */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="whitespace-pre-wrap font-mono text-sm text-muted-foreground max-h-96 overflow-y-auto">
            {streamingText || t("initializing")}
            <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse" />
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
