"use client";

import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ErrorDisplayProps {
  /**
   * 표시할 에러 메시지
   */
  message: string;

  /**
   * 재시도 버튼 클릭 핸들러 (선택사항)
   */
  onRetry?: () => void;

  /**
   * 뒤로가기 버튼 클릭 핸들러 (선택사항)
   */
  onBack?: () => void;
}

/**
 * 에러 상태를 표시하는 공통 컴포넌트
 *
 * @example
 * ```tsx
 * <ErrorDisplay
 *   message={t("styleGuide.error.load")}
 *   onRetry={() => refetch()}
 *   onBack={() => router.back()}
 * />
 * ```
 */
export function ErrorDisplay({ message, onRetry, onBack }: ErrorDisplayProps) {
  const t = useTranslations("common");

  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-lg border border-destructive/20 bg-destructive/5 p-8"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-16 w-16 text-destructive" aria-hidden="true" />

      <div className="text-center">
        <p className="text-lg font-medium text-destructive mb-1">
          {t("error")}
        </p>
        <p className="text-muted-foreground">{message}</p>
      </div>

      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("retry")}
          </Button>
        )}
        {onBack && (
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        )}
      </div>
    </div>
  );
}
