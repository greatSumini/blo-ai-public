"use client";

import { Hash } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmptyStateProps {
  type: "no-keywords" | "no-results";
}

export function EmptyState({ type }: EmptyStateProps) {
  const t = useTranslations("keywords.table");

  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center gap-3 py-12 animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Hash className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-foreground mb-1">
            {t("noResultsTitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("noResultsDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-16 animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <Hash className="h-8 w-8 text-accent" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground mb-1">
          {t("emptyTitle")}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {t("emptyDesc")}
        </p>
      </div>
    </div>
  );
}
