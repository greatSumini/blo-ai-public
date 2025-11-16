'use client';

import { useTranslations } from 'next-intl';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

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
  const t = useTranslations("articles");

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isSaving && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t("autoSave.saving")}</span>
        </>
      )}
      {isError && (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500">{t("autoSave.error")}</span>
        </>
      )}
      {!isSaving && !isError && lastSavedAt && (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span>
            {t("autoSave.saved", {
              time: formatDistanceToNow(new Date(lastSavedAt), {
                addSuffix: true,
                locale: ko,
              })
            })}
          </span>
        </>
      )}
    </div>
  );
}
