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
import {
  PERSONALITY_OPTIONS,
  FORMALITY_OPTIONS,
  TONE_OPTIONS,
  CONTENT_LENGTH_OPTIONS,
  READING_LEVEL_OPTIONS,
} from "../lib/constants";

interface StepReviewProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function StepReview({ form }: StepReviewProps) {
  const formValues = form.getValues();

  const getPersonalityLabels = () => {
    return formValues.personality
      .map(
        (p) =>
          PERSONALITY_OPTIONS.find((opt) => opt.value === p)?.label || p
      )
      .join(", ");
  };

  const getFormalityLabel = () => {
    return (
      FORMALITY_OPTIONS.find((opt) => opt.value === formValues.formality)
        ?.label || formValues.formality
    );
  };

  const getToneLabel = () => {
    return (
      TONE_OPTIONS.find((opt) => opt.value === formValues.tone)?.label ||
      formValues.tone
    );
  };

  const getLengthLabel = () => {
    return (
      CONTENT_LENGTH_OPTIONS.find(
        (opt) => opt.value === formValues.contentLength
      )?.label || formValues.contentLength
    );
  };

  const getLevelLabel = () => {
    return (
      READING_LEVEL_OPTIONS.find(
        (opt) => opt.value === formValues.readingLevel
      )?.label || formValues.readingLevel
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-semibold"
          style={{ color: "#111827" }}
        >
          최종 검토
        </h2>
        <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
          설정을 검토하고 완료해주세요
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Brand Voice Summary */}
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E1E5EA",
          }}
        >
          <h3
            className="mb-3 font-semibold"
            style={{ color: "#111827" }}
          >
            브랜드 보이스
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>브랜드 이름</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {formValues.brandName}
              </dd>
            </div>
            <div className="text-sm">
              <dt className="mb-1" style={{ color: "#6B7280" }}>
                설명
              </dt>
              <dd style={{ color: "#111827" }}>
                {formValues.brandDescription}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>성격</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {getPersonalityLabels()}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>격식</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {getFormalityLabel()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Audience Summary */}
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E1E5EA",
          }}
        >
          <h3
            className="mb-3 font-semibold"
            style={{ color: "#111827" }}
          >
            타겟 독자
          </h3>
          <dl className="space-y-2">
            <div className="text-sm">
              <dt className="mb-1" style={{ color: "#6B7280" }}>
                타겟 독자
              </dt>
              <dd style={{ color: "#111827" }}>
                {formValues.targetAudience}
              </dd>
            </div>
            <div className="text-sm">
              <dt className="mb-1" style={{ color: "#6B7280" }}>
                해결하려는 문제
              </dt>
              <dd style={{ color: "#111827" }}>{formValues.painPoints}</dd>
            </div>
          </dl>
        </div>

        {/* Settings Summary */}
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E1E5EA",
          }}
        >
          <h3
            className="mb-3 font-semibold"
            style={{ color: "#111827" }}
          >
            콘텐츠 설정
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>언어</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {formValues.language === "ko" ? "한국어" : "English"}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>톤</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {getToneLabel()}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>길이</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {getLengthLabel()}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt style={{ color: "#6B7280" }}>읽기 수준</dt>
              <dd
                className="font-medium"
                style={{ color: "#111827" }}
              >
                {getLevelLabel()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Optional Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>추가 메모 (선택사항)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="추가로 기억하고 싶은 내용이나 특별한 요구사항을 입력하세요"
                {...field}
                className="min-h-[100px] resize-y"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "6px",
                }}
              />
            </FormControl>
            <FormDescription>
              이 메모는 향후 참고용으로 저장됩니다
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: "#F0F9FF",
          borderLeft: "4px solid #3BA2F8",
        }}
      >
        <p className="text-sm font-medium" style={{ color: "#111827" }}>
          준비 완료!
        </p>
        <p className="mt-2 text-sm" style={{ color: "#374151" }}>
          모든 설정이 완료되었습니다. "완료" 버튼을 클릭하면 대시보드로
          이동하여 콘텐츠 생성을 시작할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
