"use client";

import { useEffect, useState } from "react";
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
      "AI 글 생성을 취소하시겠습니까? 진행 중인 작업이 중단됩니다."
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
                <p className="font-semibold mb-2">생성 횟수 제한에 도달했습니다</p>
                <p className="text-sm">{error.message}</p>
                <p className="text-sm mt-2">
                  더 많은 글을 생성하려면 플랜을 업그레이드해주세요.
                </p>
              </div>
            ) : isAIError ? (
              <div>
                <p className="font-semibold mb-2">AI 글 생성에 실패했습니다</p>
                <p className="text-sm">{error.message}</p>
                <p className="text-sm mt-2">
                  잠시 후 다시 시도해주세요. 문제가 계속되면 고객 지원팀에 문의해주세요.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-semibold mb-2">오류가 발생했습니다</p>
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
              다시 시도
            </Button>
          )}
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            style={{ borderRadius: "8px" }}
          >
            취소
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
      aria-label="AI 글 생성 진행 중"
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
                AI가 글을 작성하고 있습니다
              </h3>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                잠시만 기다려주세요
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            aria-label="취소"
            style={{ color: "#6B7280" }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "#6B7280" }}>진행률</span>
            <span
              className="font-semibold"
              style={{ color: "#3BA2F8" }}
              aria-label={`진행률 ${Math.round(progress)}%`}
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
            남은 시간: <span className="font-mono">{formatTime(timeRemaining)}</span>
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
          💡 이 글을 직접 작성하면 약 50분이 걸립니다. AI가 당신의 시간을 절약해드립니다!
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
          취소
        </Button>
      </div>
    </Card>
  );
}
