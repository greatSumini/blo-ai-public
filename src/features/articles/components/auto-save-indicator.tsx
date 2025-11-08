'use client';

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
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isSaving && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>저장 중...</span>
        </>
      )}
      {isError && (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500">저장 실패</span>
        </>
      )}
      {!isSaving && !isError && lastSavedAt && (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span>
            {formatDistanceToNow(new Date(lastSavedAt), {
              addSuffix: true,
              locale: ko,
            })}
            에 저장됨
          </span>
        </>
      )}
    </div>
  );
}
