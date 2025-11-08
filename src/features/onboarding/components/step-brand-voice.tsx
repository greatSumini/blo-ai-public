"use client";

import { UseFormReturn } from "react-hook-form";
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
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-semibold"
          style={{ color: "#111827" }}
        >
          브랜드 보이스 설정
        </h2>
        <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
          브랜드의 개성과 목소리를 정의해주세요
        </p>
      </div>

      {/* Brand Name */}
      <FormField
        control={form.control}
        name="brandName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>브랜드 이름</FormLabel>
            <FormControl>
              <Input
                placeholder="예: ContentCraft AI"
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
            <FormLabel>브랜드 설명</FormLabel>
            <FormControl>
              <Textarea
                placeholder="브랜드가 무엇을 하는지, 어떤 가치를 제공하는지 설명해주세요"
                {...field}
                className="min-h-[120px] resize-y"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "6px",
                }}
              />
            </FormControl>
            <FormDescription>
              최소 10자 이상 입력해주세요
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
              <FormLabel>브랜드 성격 (최대 3개)</FormLabel>
              <FormDescription>
                브랜드의 개성을 가장 잘 나타내는 단어를 선택하세요
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
            <FormLabel>격식 수준</FormLabel>
            <FormDescription>
              브랜드 커뮤니케이션의 격식 수준을 선택하세요
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
