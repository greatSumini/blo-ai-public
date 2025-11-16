"use client";

import { useTranslations } from "next-intl";
import { STEP_NAMES, TOTAL_STEPS } from "../lib/constants";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const t = useTranslations("onboarding.indicator");
  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="w-full space-y-6">
      {/* Current step and progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">
            {STEP_NAMES[currentStep - 1]}
          </h2>
          <span className="text-sm text-muted-foreground">
            {currentStep} / {TOTAL_STEPS}
          </span>
        </div>

        {/* Minimal progress bar */}
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-[#C46849] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("progress_aria_label", { percentage: Math.round(progressPercentage) })}
          />
        </div>
      </div>
    </div>
  );
}
