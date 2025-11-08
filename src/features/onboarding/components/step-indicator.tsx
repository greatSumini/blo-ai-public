"use client";

import { Progress } from "@/components/ui/progress";
import { STEP_NAMES, TOTAL_STEPS } from "../lib/constants";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium" style={{ color: "#374151" }}>
            {STEP_NAMES[currentStep - 1]}
          </span>
          <span className="text-sm" style={{ color: "#6B7280" }}>
            {currentStep} / {TOTAL_STEPS}
          </span>
        </div>
        <Progress
          value={progressPercentage}
          className="h-2"
          style={{
            backgroundColor: "#E1E5EA",
          }}
          aria-label={`진행률: ${Math.round(progressPercentage)}%`}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-between">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: isCompleted || isCurrent ? "#3BA2F8" : "#E1E5EA",
                  color: isCompleted || isCurrent ? "#FFFFFF" : "#6B7280",
                }}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${stepNumber}: ${STEP_NAMES[index]}`}
              >
                {stepNumber}
              </div>
              <span
                className="hidden text-xs sm:block"
                style={{
                  color: isCurrent ? "#111827" : "#6B7280",
                  fontWeight: isCurrent ? 500 : 400,
                }}
              >
                {STEP_NAMES[index]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
