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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingFormData } from "../lib/onboarding-schema";
import {
  TONE_OPTIONS,
  CONTENT_LENGTH_OPTIONS,
  READING_LEVEL_OPTIONS,
} from "../lib/constants";

interface StepStyleProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function StepStyle({ form }: StepStyleProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-semibold"
          style={{ color: "#111827" }}
        >
          스타일 설정
        </h2>
        <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
          콘텐츠의 톤과 길이를 설정해주세요
        </p>
      </div>

      {/* Tone */}
      <FormField
        control={form.control}
        name="tone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>콘텐츠 톤</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger
                  className="h-10"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "6px",
                  }}
                >
                  <SelectValue placeholder="톤을 선택하세요" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span
                        className="text-xs"
                        style={{ color: "#6B7280" }}
                      >
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              콘텐츠의 전반적인 분위기와 어조를 결정합니다
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Content Length */}
      <FormField
        control={form.control}
        name="contentLength"
        render={({ field }) => (
          <FormItem>
            <FormLabel>콘텐츠 길이</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger
                  className="h-10"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "6px",
                  }}
                >
                  <SelectValue placeholder="길이를 선택하세요" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CONTENT_LENGTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span
                        className="text-xs"
                        style={{ color: "#6B7280" }}
                      >
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              생성될 콘텐츠의 평균 길이를 설정합니다
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Reading Level */}
      <FormField
        control={form.control}
        name="readingLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>읽기 수준</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger
                  className="h-10"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "6px",
                  }}
                >
                  <SelectValue placeholder="수준을 선택하세요" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {READING_LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span
                        className="text-xs"
                        style={{ color: "#6B7280" }}
                      >
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              독자의 전문성 수준에 맞는 용어와 표현을 사용합니다
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
          💡 팁
        </p>
        <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
          이 설정은 기본값으로 사용되며, 각 콘텐츠 생성 시 개별적으로 조정할 수
          있습니다.
        </p>
      </div>
    </div>
  );
}
