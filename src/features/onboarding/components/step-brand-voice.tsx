"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Megaphone } from "lucide-react";
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
import { PERSONALITY_VALUES, FORMALITY_VALUES } from "../lib/constants";
import { StepHeader } from "./step-header";

interface StepBrandVoiceProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function StepBrandVoice({ form }: StepBrandVoiceProps) {
  const t = useTranslations("onboarding.brand_voice");

  // Watch for character counts
  const brandDescription = form.watch("brandDescription") || "";
  const selectedPersonalities = form.watch("personality") || [];

  // Generate personality options with i18n
  const personalityOptions = PERSONALITY_VALUES.map((value) => ({
    value,
    label: t(`personality_${value}` as any),
  }));

  // Generate formality options with i18n
  const formalityOptions = FORMALITY_VALUES.map((value) => ({
    value,
    label: t(`formality_${value}` as any),
    description: t(`formality_${value}_desc` as any),
  }));

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <StepHeader
        stepNumber={1}
        totalSteps={5}
        title={t("title")}
        description={t("subtitle")}
        icon={Megaphone}
      />

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
              />
            </FormControl>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <FormDescription>
                {t("description_brand_description")}
              </FormDescription>
              <span>
                {t("char_count", {
                  current: brandDescription.length,
                  max: 500,
                })}
              </span>
            </div>
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
                {t("description_personality")} ({selectedPersonalities.length}
                /3)
              </FormDescription>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {personalityOptions.map((option) => (
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
                        <Label className="cursor-pointer font-normal">
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
            <FormDescription>{t("description_formality")}</FormDescription>
            <div className="space-y-3">
              {formalityOptions.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <FormControl>
                    <input
                      type="radio"
                      value={option.value}
                      checked={field.value === option.value}
                      onChange={() => field.onChange(option.value)}
                      className="mt-1 h-4 w-4 cursor-pointer accent-primary"
                    />
                  </FormControl>
                  <div className="flex-1">
                    <Label className="cursor-pointer font-medium">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
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
