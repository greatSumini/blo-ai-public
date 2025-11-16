"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  const t = useTranslations("styleGuide");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-lg border-2 border-dashed border-border bg-card p-12 text-center space-y-6"
    >
      {/* Illustration */}
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-full bg-[#C46849]/10 dark:bg-[#C46849]/20 flex items-center justify-center">
          <FileText className="w-16 h-16 text-[#C46849] opacity-40" />
        </div>
      </div>

      {/* Heading & Description */}
      <div className="space-y-3">
        <h3 className="text-2xl md:text-3xl font-medium leading-snug text-foreground">
          {t("empty")}
        </h3>
        <p className="text-base leading-relaxed text-muted-foreground max-w-md mx-auto">
          {t("emptyDescription")}
        </p>
      </div>

      {/* CTA */}
      <div className="pt-2">
        <Button
          size="lg"
          onClick={onCreateNew}
          className="bg-[#C46849] hover:bg-[#b05a3e] text-white focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 transition-colors duration-200"
        >
          <Plus className="mr-2 h-5 w-5" />
          {t("create")}
        </Button>
      </div>
    </motion.div>
  );
}
