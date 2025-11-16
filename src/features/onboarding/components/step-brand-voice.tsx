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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { OnboardingFormData } from "../lib/onboarding-schema";
import { PERSONALITY_OPTIONS, FORMALITY_OPTIONS } from "../lib/constants";

interface StepBrandVoiceProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function StepBrandVoice({ form }: StepBrandVoiceProps) {
  const t = useTranslations("onboarding.brand_voice");

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

      {/* Brand Name */}
      <FormField
        control={form.control}
        name="brandName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("field_brand_name")}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("placeholder_brand_name")}
                {...field}
                className="h-10"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "6px",
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Brand Description */}
      <FormField
        control={form.control}
        name="brandDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("field_brand_description")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("placeholder_brand_description")}
                {...field}
                className="min-h-[120px] resize-y"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "6px",
                }}
              />
            </FormControl>
            <FormDescription>
              {t("description_brand_description")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Personality */}
      <FormField
        control={form.control}
        name="personality"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>{t("field_personality")}</FormLabel>
              <FormDescription>
                {t("description_personality")}
              </FormDescription>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PERSONALITY_OPTIONS.map((option) => (
                <FormField
                  key={option.value}
                  control={form.control}
                  name="personality"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={option.value}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              const newValue = checked
                                ? [...currentValue, option.value]
                                : currentValue.filter(
                                    (value) => value !== option.value
                                  );
                              // Limit to 3 selections
                              if (newValue.length <= 3) {
                                field.onChange(newValue);
                              }
                            }}
                          />
                        </FormControl>
                        <Label
                          className="cursor-pointer font-normal"
                          style={{ color: "#374151" }}
                        >
                          {option.label}
                        </Label>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Formality */}
      <FormField
        control={form.control}
        name="formality"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("field_formality")}</FormLabel>
            <FormDescription>
              {t("description_formality")}
            </FormDescription>
            <div className="space-y-3">
              {FORMALITY_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-3"
                >
                  <FormControl>
                    <input
                      type="radio"
                      value={option.value}
                      checked={field.value === option.value}
                      onChange={() => field.onChange(option.value)}
                      className="mt-1 h-4 w-4 cursor-pointer"
                      style={{
                        accentColor: "#3BA2F8",
                      }}
                    />
                  </FormControl>
                  <div className="flex-1">
                    <Label
                      className="cursor-pointer font-medium"
                      style={{ color: "#111827" }}
                    >
                      {option.label}
                    </Label>
                    <p className="text-sm" style={{ color: "#6B7280" }}>
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
    </div>
  );
}
