"use client";

import { motion } from "framer-motion";
import { FileText, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

interface ArticlesEmptyStateProps {
  variant: "no-articles" | "no-results";
}

export function ArticlesEmptyState({ variant }: ArticlesEmptyStateProps) {
  const t = useTranslations("articles.emptyState");
  const router = useRouter();
  const locale = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[400px] items-center justify-center"
    >
      <div className="text-center max-w-md space-y-5">
        {/* 아이콘 */}
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-50 p-5">
            {variant === "no-articles" ? (
              <FileText className="h-12 w-12 text-blue-500" />
            ) : (
              <Search className="h-12 w-12 text-gray-400" />
            )}
          </div>
        </div>

        {/* 메시지 */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            {t(`${variant}.title`)}
          </h3>
          <p className="text-sm text-gray-600">
            {t(`${variant}.description`)}
          </p>
        </div>

        {/* CTA */}
        {variant === "no-articles" && (
          <Button
            size="lg"
            onClick={() => router.push(`/${locale}/new-article`)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {t("create_first")}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
