"use client";

import { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

interface StepHeaderProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function StepHeader({
  stepNumber,
  totalSteps,
  title,
  description,
  icon: Icon,
}: StepHeaderProps) {
  const t = useTranslations("onboarding.wizard");

  return (
    <div className="space-y-3">
      {/* Step Badge */}
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
        )}
        <Badge variant="secondary" className="text-xs">
          {t("step_badge", { current: stepNumber, total: totalSteps })}
        </Badge>
      </div>

      {/* Title & Description */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
