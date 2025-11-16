"use client";

import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  const t = useTranslations("styleGuide");

  return (
    <div className="rounded-lg border border-dashed border-[#E1E5EA] p-12 text-center space-y-6 bg-white animate-in fade-in duration-500">
      {/* Illustration */}
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-full bg-[#3BA2F8]/10 flex items-center justify-center">
          <FileText className="w-16 h-16 text-[#3BA2F8] opacity-30" />
        </div>
      </div>

      {/* Heading & Description */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-[#1F2937]">
          {t("empty")}
        </h3>
        <p className="text-[#6B7280] max-w-md mx-auto">
          {t("emptyDescription")}
        </p>
      </div>

      {/* CTA */}
      <div>
        <Button
          size="lg"
          onClick={onCreateNew}
          className="bg-[#3BA2F8] hover:bg-[#2E91E6]"
        >
          <Plus className="mr-2 h-5 w-5" />
          {t("create")}
        </Button>
      </div>
    </div>
  );
}
