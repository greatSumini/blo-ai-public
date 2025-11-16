"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingFormData } from "../lib/onboarding-schema";

interface StepAudienceProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function StepAudience({ form }: StepAudienceProps) {
  const t = useTranslations("onboarding.audience");

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-semibold"
          style={{ color: "#111827" }}
        >
          {t("title")}
        </h2>
        <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
          {t("subtitle")}
        </p>
      </div>

      {/* Target Audience */}
      <FormField
        control={form.control}
        name="targetAudience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("field_target_audience")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("placeholder_target_audience")}
                {...field}
                className="min-h-[150px] resize-y"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "6px",
                }}
              />
            </FormControl>
            <FormDescription>
              {t("description_target_audience")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Pain Points */}
      <FormField
        control={form.control}
        name="painPoints"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("field_pain_points")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("placeholder_pain_points")}
                {...field}
                className="min-h-[150px] resize-y"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "6px",
                }}
              />
            </FormControl>
            <FormDescription>
              {t("description_pain_points")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: "#F5F7FA",
          borderLeft: "4px solid #3BA2F8",
        }}
      >
        <p className="text-sm font-medium" style={{ color: "#111827" }}>
          {t("tip_icon")}
        </p>
        <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
          {t("tip_text")}
        </p>
      </div>
    </div>
  );
}
