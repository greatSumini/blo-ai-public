"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, AlertCircle, RefreshCw, Sparkles, Clock } from "lucide-react";

interface GenerationProgressProps {
  isGenerating: boolean;
  error: Error | null;
  onCancel: () => void;
  onRetry: () => void;
}

export function GenerationProgress({
  isGenerating,
  error,
  onCancel,
  onRetry,
}: GenerationProgressProps) {
  const t = useTranslations("articles");
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const maxTime = 300; // 5분 (300초)

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setTimeElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setTimeElapsed((prev) => {
        const next = prev + 1;

        // Calculate progress: 0% → 95% over 5 minutes, then 100% when done
        if (next >= maxTime) {
          setProgress(95);
          return maxTime;
        }

        // Logarithmic curve for smooth progress
        const progressPercent = Math.min(95, (next / maxTime) * 100);
        setProgress(progressPercent);

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating, maxTime]);

  // Complete progress when done
  useEffect(() => {
    if (!isGenerating && progress > 0) {
      setProgress(100);
    }
  }, [isGenerating, progress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeRemaining = Math.max(0, maxTime - timeElapsed);

  const handleCancel = () => {
    const confirmed = window.confirm(
      t("generationProgress.cancelConfirm")
    );
    if (confirmed) {
      onCancel();
    }
  };

  // Error state
  if (error) {
    const isQuotaError = error.message.includes("생성 횟수 제한");
    const isAIError = error.message.includes("AI 글 생성에 실패");

    return (
      <Card
        className="p-6"
        style={{
          borderColor: "#E1E5EA",
          borderRadius: "12px",
        }}
      >
        <Alert
          variant="destructive"
          className="mb-4"
          style={{ borderColor: "#EF4444" }}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isQuotaError ? (
              <div>
                <p className="font-semibold mb-2">{t("generationProgress.errorQuotaTitle")}</p>
                <p className="text-sm">{error.message}</p>
                <p className="text-sm mt-2">
                  {t("generationProgress.errorQuotaMessage")}
                </p>
              </div>
            ) : isAIError ? (
              <div>
                <p className="font-semibold mb-2">{t("generationProgress.errorAITitle")}</p>
                <p className="text-sm">{error.message}</p>
                <p className="text-sm mt-2">
                  {t("generationProgress.errorAIMessage")}
                </p>
              </div>
            ) : (
              <div>
                <p className="font-semibold mb-2">{t("generationProgress.errorGenericTitle")}</p>
                <p className="text-sm">{error.message}</p>
              </div>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          {!isQuotaError && (
            <Button
              onClick={onRetry}
              className="flex-1"
              style={{
                backgroundColor: "#3BA2F8",
                borderRadius: "8px",
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("generationProgress.retry")}
            </Button>
          )}
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            style={{ borderRadius: "8px" }}
          >
            {t("generationProgress.cancel")}
          </Button>
        </div>
      </Card>
    );
  }

  // Loading state
  if (!isGenerating) {
    return null;
  }

  return (
    <Card
      className="p-6"
      style={{
        borderColor: "#E1E5EA",
        borderRadius: "12px",
      }}
      role="status"
      aria-live="polite"
      aria-label={t("generationProgress.ariaLabel")}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "#EFF6FF" }}
            >
              <Sparkles className="h-5 w-5" style={{ color: "#3BA2F8" }} />
            </div>
            <div>
              <h3
                className="font-semibold text-lg"
                style={{ color: "#1F2937" }}
              >
                {t("generationProgress.generating")}
              </h3>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                {t("generationProgress.pleaseWait")}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            aria-label={t("generationProgress.cancel")}
            style={{ color: "#6B7280" }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "#6B7280" }}>{t("generationProgress.progress")}</span>
            <span
              className="font-semibold"
              style={{ color: "#3BA2F8" }}
              aria-label={t("generationProgress.progressPercent", { percent: Math.round(progress) })}
            >
              {Math.round(progress)}%
            </span>
          </div>
          <Progress
            value={progress}
            className="h-2"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Timer */}
        <div
          className="mt-4 flex items-center gap-2 text-sm"
          style={{ color: "#6B7280" }}
        >
          <Clock className="h-4 w-4" />
          <span>
            {t("generationProgress.timeRemaining")} <span className="font-mono">{formatTime(timeRemaining)}</span>
          </span>
        </div>
      </div>

      {/* Skeleton Preview */}
      <div className="space-y-4 mb-6">
        <div>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>

      {/* Motivational Message */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: "#F0FDF4" }}
      >
        <p className="text-sm font-medium" style={{ color: "#16A34A" }}>
          {t("generationProgress.motivationalMessage")}
        </p>
      </div>

      {/* Cancel Button */}
      <div className="mt-4">
        <Button
          onClick={handleCancel}
          variant="outline"
          className="w-full"
          style={{ borderRadius: "8px" }}
        >
          {t("generationProgress.cancel")}
        </Button>
      </div>
    </Card>
  );
}
