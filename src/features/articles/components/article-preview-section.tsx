"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { CheckCircle2, ChevronDown, Edit, RefreshCw, Hash, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MetadataCard } from "./metadata-card";
import { cn } from "@/lib/utils";

interface ArticlePreviewSectionProps {
  article: {
    title: string;
    content: string;
    metaDescription?: string;
    keywords?: string[];
  };
  onEdit: () => void;
  onRegenerate: () => void;
  isSaving?: boolean;
}

export function ArticlePreviewSection({
  article,
  onEdit,
  onRegenerate,
  isSaving,
}: ArticlePreviewSectionProps) {
  const t = useTranslations("newArticle.complete");
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className="container mx-auto max-w-4xl px-4 md:px-6 py-16 md:py-24 space-y-8 motion-reduce:transition-none"
    >
      {/* Success Message (Simple) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex items-center justify-center gap-4"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
        <p className="text-xl md:text-2xl font-medium text-foreground dark:text-foreground">
          {t("ready")}
        </p>
      </motion.div>

      {/* Metadata (Collapsible) */}
      <Collapsible open={isMetadataOpen} onOpenChange={setIsMetadataOpen}>
        <CollapsibleTrigger className="w-full">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors border-border bg-card">
            <CardContent className="p-4 flex justify-between items-center">
              <span className="text-sm font-medium">{t("metadata.toggle")}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isMetadataOpen && "rotate-180"
                )}
              />
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <MetadataCard
              icon={Hash}
              label={t("metadata.keywords")}
              value={
                article.keywords && article.keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((k) => (
                      <Badge key={k} variant="secondary">
                        {k}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  t("metadata.empty")
                )
              }
            />
            <MetadataCard
              icon={FileText}
              label={t("metadata.description")}
              value={article.metaDescription || t("metadata.empty")}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Article Preview */}
      <Card className="border-border bg-background dark:bg-background dark:border-border shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-8 md:p-12">
          <article className="prose prose-lg max-w-prose mx-auto dark:prose-invert">
            <h1 className="text-4xl md:text-5xl font-medium leading-tight">
              {article.title}
            </h1>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </article>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onEdit}
          className="flex-1 bg-[#C46849] hover:bg-[#b05a3e] text-white dark:bg-[#C46849] dark:hover:bg-[#b05a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 transition-all duration-100 active:scale-95"
          disabled={isSaving}
        >
          <Edit className="w-4 h-4 mr-2" />
          {t("actions.edit")}
        </Button>
        <Button
          onClick={onRegenerate}
          variant="outline"
          disabled={isSaving}
          className="border-border hover:bg-secondary dark:border-border dark:hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 transition-all duration-100"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("actions.regenerate")}
        </Button>
      </div>
    </motion.div>
  );
}
