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
import { Label } from "@/components/ui/label";
import { OnboardingFormData } from "../lib/onboarding-schema";
import { LANGUAGE_OPTIONS } from "../lib/constants";

interface StepLanguageProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function StepLanguage({ form }: StepLanguageProps) {
  const t = useTranslations("onboarding.language");

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

      {/* Language Selection */}
      <FormField
        control={form.control}
        name="language"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("field_language")}</FormLabel>
            <FormDescription>
              {t("description_language")}
            </FormDescription>
            <div className="grid gap-4 sm:grid-cols-2">
              {LANGUAGE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  onClick={() => field.onChange(option.value)}
                  className="group relative cursor-pointer rounded-lg border-2 p-6 transition-all hover:shadow-md"
                  style={{
                    borderColor:
                      field.value === option.value ? "#3BA2F8" : "#E1E5EA",
                    backgroundColor:
                      field.value === option.value ? "#F0F9FF" : "#FFFFFF",
                  }}
                  role="radio"
                  aria-checked={field.value === option.value}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      field.onChange(option.value);
                    }
                  }}
                >
                  <FormControl>
                    <input
                      type="radio"
                      value={option.value}
                      checked={field.value === option.value}
                      onChange={() => field.onChange(option.value)}
                      className="absolute left-4 top-4 h-4 w-4 cursor-pointer"
                      style={{
                        accentColor: "#3BA2F8",
                      }}
                    />
                  </FormControl>
                  <div className="ml-6">
                    <Label
                      className="cursor-pointer text-lg font-semibold"
                      style={{
                        color:
                          field.value === option.value ? "#1E2A38" : "#111827",
                      }}
                    >
                      {option.label}
                    </Label>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: "#6B7280" }}
                    >
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
