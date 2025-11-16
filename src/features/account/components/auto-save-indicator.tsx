"use client";

import { useTranslations, useLocale } from "next-intl";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  isError: boolean;
  lastSavedAt?: string;
}

export function AutoSaveIndicator({
  isSaving,
  isError,
  lastSavedAt,
}: AutoSaveIndicatorProps) {
  const t = useTranslations("account.autoSave");
  const locale = useLocale();
  const dateLocale = locale === "ko" ? ko : enUS;

  return (
    <AnimatePresence mode="wait">
      {isSaving && (
        <motion.div
          key="saving"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-2.5 text-sm text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t("saving")}</span>
        </motion.div>
      )}

      {isError && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex items-center gap-2.5 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">{t("error")}</span>
        </motion.div>
      )}

      {!isSaving && !isError && lastSavedAt && (
        <motion.div
          key="saved"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-2.5 text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30">
            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          </div>
          <span className="font-medium">
            {t("saved", {
              time: formatDistanceToNow(new Date(lastSavedAt), {
                addSuffix: true,
                locale: dateLocale,
              }),
            })}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
