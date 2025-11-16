"use client";

import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-lg border border-destructive/20 bg-destructive/5 p-8"
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      >
        <AlertCircle className="h-16 w-16 text-destructive" aria-hidden="true" />
      </motion.div>

      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-destructive">
          {t("error")}
        </p>
        <p className="text-base leading-relaxed text-muted-foreground max-w-prose">
          {message}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="default"
            className="focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("retry")}
          </Button>
        )}
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            size="sm"
            className="focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
