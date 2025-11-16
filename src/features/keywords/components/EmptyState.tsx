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
      <div className="flex flex-col items-center gap-3 py-12">
        <Hash className="h-12 w-12 text-gray-300" />
        <div className="text-center">
          <p className="text-base font-medium text-gray-900 mb-1">
            {t("noResultsTitle")}
          </p>
          <p className="text-sm text-gray-500">
            {t("noResultsDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <Hash className="h-16 w-16 text-gray-300" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {t("emptyTitle")}
        </h3>
        <p className="text-sm text-gray-500">
          {t("emptyDesc")}
        </p>
      </div>
    </div>
  );
}
