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
import { Textarea } from "@/components/ui/textarea";
import { OnboardingFormData } from "../lib/onboarding-schema";

interface StepAudienceProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function StepAudience({ form }: StepAudienceProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-semibold"
          style={{ color: "#111827" }}
        >
          타겟 독자 정의
        </h2>
        <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
          어떤 독자를 위한 콘텐츠인지 알려주세요
        </p>
      </div>

      {/* Target Audience */}
      <FormField
        control={form.control}
        name="targetAudience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>타겟 독자</FormLabel>
            <FormControl>
              <Textarea
                placeholder="예: 스타트업 창업자, 프리랜서 개발자, 마케팅 담당자 등&#10;&#10;독자의 특성, 관심사, 직업 등을 자세히 설명해주세요"
                {...field}
                className="min-h-[150px] resize-y"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "6px",
                }}
              />
            </FormControl>
            <FormDescription>
              타겟 독자의 특성을 구체적으로 설명할수록 더 맞춤화된 콘텐츠를 생성할 수 있습니다
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
            <FormLabel>해결하려는 문제</FormLabel>
            <FormControl>
              <Textarea
                placeholder="예: 시간 부족, 콘텐츠 작성의 어려움, 일관성 유지 등&#10;&#10;독자들이 겪고 있는 문제나 니즈를 설명해주세요"
                {...field}
                className="min-h-[150px] resize-y"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "6px",
                }}
              />
            </FormControl>
            <FormDescription>
              독자가 해결하고 싶어하는 문제나 달성하고 싶은 목표를 설명해주세요
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
          타겟 독자를 구체적으로 정의할수록 더 효과적인 콘텐츠를 만들 수 있습니다.
          인구통계학적 정보(나이, 직업)와 심리학적 정보(관심사, 가치관)를 모두
          고려해보세요.
        </p>
      </div>
    </div>
  );
}
