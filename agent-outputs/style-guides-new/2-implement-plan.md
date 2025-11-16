# 스타일 가이드 생성 페이지 구현 계획

## 1. 코드베이스 분석 결과

### 1.1 프로젝트 구조

```
src/
├── app/
│   └── [locale]/
│       └── (protected)/
│           └── style-guides/
│               └── new/
│                   └── page.tsx (수정 대상)
├── features/
│   └── onboarding/
│       ├── components/ (대부분 수정)
│       │   ├── onboarding-wizard.tsx
│       │   ├── step-indicator.tsx (V2로 교체)
│       │   ├── preview-panel.tsx (간소화)
│       │   ├── step-brand-voice.tsx
│       │   ├── step-audience.tsx
│       │   ├── step-language.tsx
│       │   ├── step-style.tsx
│       │   └── step-review.tsx
│       ├── lib/
│       │   ├── onboarding-schema.ts
│       │   └── constants.ts (수정 필요)
│       └── actions/
│           └── create-style-guide.ts
├── components/
│   └── ui/ (shadcn-ui 컴포넌트 활용)
├── i18n/
│   ├── navigation.ts
│   ├── request.ts
│   └── routing.ts
└── messages/
    ├── ko.json (i18n 키 추가 필요)
    └── en.json (i18n 키 추가 필요)
```

### 1.2 기존 패턴

**컴포넌트 패턴:**
- `"use client"` 지시어 사용
- `react-hook-form` + `zod`로 폼 관리
- `next-intl`로 i18n 처리
- shadcn-ui 기본 컴포넌트 활용

**스타일링 패턴:**
- Tailwind CSS 활용
- 인라인 스타일로 색상 지정 (개선 필요)
- CSS Variables는 일부만 사용 (확대 필요)

**상태 관리:**
- `useState`로 로컬 상태 관리
- `react-hook-form`의 `watch`로 폼 데이터 추적
- 스텝별 스키마 검증

### 1.3 기술 스택

**프론트엔드:**
- Next.js 15.2.3 (App Router)
- React 19.0.0
- TypeScript 5
- Tailwind CSS 4.1.13

**폼 & 검증:**
- react-hook-form 7
- zod 3
- @hookform/resolvers 4

**UI 라이브러리:**
- shadcn-ui (Radix UI 기반)
- framer-motion 11
- lucide-react 0.469.0

**i18n:**
- next-intl 4.5.3

**유틸리티:**
- es-toolkit 1
- date-fns 4
- ts-pattern 5
- clsx 2.1.1
- tailwind-merge 2.5.2

---

## 2. 파일 구조

### 2.1 생성할 파일

#### 컴포넌트
- `src/features/onboarding/components/step-indicator-v2.tsx` (신규)
- `src/features/onboarding/components/settings-preview-card.tsx` (신규)
- `src/features/onboarding/components/step-header.tsx` (신규)

#### 유틸리티
- `src/features/onboarding/lib/animations.ts` (신규)
- `src/features/onboarding/lib/tone-generator.ts` (신규)

### 2.2 수정할 파일

#### 페이지
- `src/app/[locale]/(protected)/style-guides/new/page.tsx`
  - `maxWidthClassName`을 `max-w-6xl`로 변경

#### 컴포넌트
- `src/features/onboarding/components/onboarding-wizard.tsx`
  - 인라인 스타일 제거
  - StepIndicatorV2 적용
  - SettingsPreviewCard 적용
  - 애니메이션 추가 (framer-motion)

- `src/features/onboarding/components/step-indicator.tsx`
  - 삭제 예정 (V2로 대체)

- `src/features/onboarding/components/preview-panel.tsx`
  - 삭제 예정 (SettingsPreviewCard로 대체)

- `src/features/onboarding/components/step-brand-voice.tsx`
  - StepHeader 적용
  - 체크박스 선택 카운터 추가
  - 글자 수 카운터 추가

- `src/features/onboarding/components/step-audience.tsx`
  - StepHeader 적용
  - 글자 수 카운터 추가

- `src/features/onboarding/components/step-language.tsx`
  - StepHeader 적용

- `src/features/onboarding/components/step-style.tsx`
  - StepHeader 적용

- `src/features/onboarding/components/step-review.tsx`
  - StepHeader 적용
  - 성공 상태 디자인 추가

#### 상수 & 스키마
- `src/features/onboarding/lib/constants.ts`
  - 하드코딩된 한글 제거
  - i18n 키로 변경

#### i18n
- `messages/ko.json`
  - `onboarding` 네임스페이스 추가
- `messages/en.json`
  - `onboarding` 네임스페이스 추가

#### 전역 스타일
- `src/app/globals.css` (필요 시)
  - CSS Variables 추가

---

## 3. 의존성

### 3.1 이미 설치된 패키지

모든 필요한 패키지가 이미 설치되어 있습니다:

```json
{
  "framer-motion": "^11",
  "react-hook-form": "^7",
  "zod": "^3",
  "next-intl": "^4.5.3",
  "lucide-react": "^0.469.0",
  "@radix-ui/react-*": "설치됨",
  "tailwindcss": "^4.1.13",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.5.2"
}
```

### 3.2 추가 설치 불필요

모든 기능 구현에 필요한 패키지가 이미 `package.json`에 있습니다.

---

## 4. 구현 순서

### Phase 1: 디자인 시스템 구축 (2-3일)

#### Step 1.1: CSS Variables 정의
- [ ] `src/app/globals.css`에 CSS Variables 추가
- [ ] 인라인 스타일을 CSS Variables로 매핑

#### Step 1.2: 상수 파일 i18n 적용
- [ ] `src/features/onboarding/lib/constants.ts` 수정
- [ ] 하드코딩된 한글 문자열 제거

#### Step 1.3: i18n 메시지 작성
- [ ] `messages/ko.json`에 `onboarding` 키 추가
- [ ] `messages/en.json`에 `onboarding` 키 추가

**산출물:**
- 모든 인라인 스타일이 Tailwind/CSS Variables로 변경
- i18n 키 완성

---

### Phase 2: 핵심 컴포넌트 개선 (3-4일)

#### Step 2.1: StepIndicatorV2 구현
- [ ] `src/features/onboarding/components/step-indicator-v2.tsx` 생성
- [ ] 완료 체크마크 아이콘 추가
- [ ] 클릭 가능 상태 구현
- [ ] ARIA 레이블 추가

#### Step 2.2: SettingsPreviewCard 구현
- [ ] `src/features/onboarding/components/settings-preview-card.tsx` 생성
- [ ] 설정 요약 로직 구현
- [ ] 톤 예시 생성 함수 구현 (`tone-generator.ts`)
- [ ] Empty State 디자인 추가

#### Step 2.3: StepHeader 구현
- [ ] `src/features/onboarding/components/step-header.tsx` 생성
- [ ] 아이콘, 제목, 설명 표시
- [ ] 가치 제안 카드 (선택적)

#### Step 2.4: 스텝 컴포넌트 개선
- [ ] 각 step-*.tsx 파일에 StepHeader 적용
- [ ] 글자 수 카운터 추가 (Input, Textarea)
- [ ] 체크박스 선택 카운터 추가 (step-brand-voice.tsx)
- [ ] FormDescription으로 헬퍼 텍스트 추가

**산출물:**
- 명확한 피드백 제공 (카운터, 에러 메시지)
- 설정 요약 카드로 실시간 확인 가능

---

### Phase 3: 필수 애니메이션 (1-2일)

#### Step 3.1: 애니메이션 유틸 작성
- [ ] `src/features/onboarding/lib/animations.ts` 생성
- [ ] 스텝 전환 variants 정의
- [ ] 체크마크 애니메이션 variants 정의

#### Step 3.2: OnboardingWizard 애니메이션 적용
- [ ] `<AnimatePresence>` 적용
- [ ] 스텝 전환 애니메이션 추가
- [ ] 완료 버튼 로딩 애니메이션

#### Step 3.3: CSS Transition 최적화
- [ ] 버튼 hover 애니메이션 (CSS)
- [ ] 필드 focus 애니메이션 (CSS)

**산출물:**
- 부드러운 스텝 전환
- 시각적 피드백 (로딩, 체크마크)

---

### Phase 4: 모바일 & 접근성 (2일)

#### Step 4.1: 모바일 레이아웃 조정
- [ ] 모바일 프리뷰 Accordion 개선
- [ ] 버튼 크기 조정 (모바일에서 `h-12`)

#### Step 4.2: 키보드 네비게이션 개선
- [ ] StepIndicatorV2에 키보드 포커스 스타일 추가
- [ ] 이미 구현된 `Alt + Arrow` 단축키 유지

#### Step 4.3: ARIA 레이블 추가
- [ ] 모든 인터랙티브 요소에 `aria-label` 추가
- [ ] 스크린 리더 공지 개선

#### Step 4.4: Color Contrast 검증
- [ ] Lighthouse Accessibility 검사
- [ ] 명암비 4.5:1 이상 확인

**산출물:**
- 모바일 UX 개선
- Lighthouse Accessibility 95점 이상

---

### Phase 5: 폴리싱 & 테스트 (2일)

#### Step 5.1: 성공 상태 디자인
- [ ] step-review.tsx에 완료 축하 메시지 추가
- [ ] 다음 액션 버튼 (스타일 가이드 보기, 첫 포스트 작성)

#### Step 5.2: 에러 핸들링 개선
- [ ] 네트워크 에러 처리
- [ ] Toast 메시지 개선

#### Step 5.3: 성능 최적화
- [ ] `useDebounce`로 프리뷰 업데이트 최적화
- [ ] `useMemo`로 불필요한 재계산 방지

#### Step 5.4: E2E 테스트 작성 (선택)
- [ ] Playwright 테스트 작성
- [ ] 전체 온보딩 플로우 검증

**산출물:**
- 프로덕션 레디 상태
- 성능 최적화 완료

**총 예상 소요: 10-13일**

---

## 5. 컴포넌트 상세 명세

### 5.1 StepIndicatorV2

#### 파일: `src/features/onboarding/components/step-indicator-v2.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorV2Props {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  onStepClick?: (step: number) => void;
  stepNames: readonly string[];
}

export function StepIndicatorV2({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
  stepNames,
}: StepIndicatorV2Props) {
  const t = useTranslations("onboarding.indicator");

  const canGoToStep = (step: number) => {
    // 완료된 스텝이나 현재 스텝만 클릭 가능
    return step < currentStep || completedSteps.has(step);
  };

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {stepNames[currentStep - 1]}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentStep} / {totalSteps}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            aria-label={t("progress_aria_label", {
              percentage: Math.round((currentStep / totalSteps) * 100),
            })}
          />
        </div>
      </div>

      {/* Step dots with clickable navigation */}
      <ol
        role="list"
        aria-label={t("steps_aria_label")}
        className="flex items-center justify-between"
      >
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.has(stepNumber);
          const isCurrent = stepNumber === currentStep;
          const isClickable = canGoToStep(stepNumber) && onStepClick;

          return (
            <li key={stepNumber} className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(stepNumber)}
                disabled={!isClickable}
                aria-label={`${stepNames[index]} (${
                  isCompleted ? t("status_completed") :
                  isCurrent ? t("status_current") :
                  t("status_pending")
                })`}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  "border-2 transition-all duration-200",
                  "text-sm font-medium",
                  isCompleted && "bg-success border-success text-white",
                  isCurrent && "bg-primary border-primary text-white",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground",
                  isClickable && "hover:scale-105 cursor-pointer",
                  !isClickable && "cursor-not-allowed opacity-50"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </button>

              {/* Step name - hidden on mobile */}
              <span
                className={cn(
                  "hidden sm:block text-xs",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {stepNames[index]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
```

**주요 기능:**
- 완료된 스텝: 체크마크 + 초록색 배경
- 현재 스텝: 숫자 + 파란색 배경
- 미완료 스텝: 숫자 + 회색 테두리
- 클릭 가능: 완료된 스텝과 현재 스텝만
- 호버 효과: `scale-105`
- 접근성: ARIA 레이블, `aria-current`

---

### 5.2 SettingsPreviewCard

#### 파일: `src/features/onboarding/components/settings-preview-card.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { OnboardingFormData } from "../lib/onboarding-schema";
import { generateToneSample } from "../lib/tone-generator";

interface SettingsPreviewCardProps {
  formData: Partial<OnboardingFormData>;
  completedSteps: Set<number>;
  totalSteps: number;
}

export function SettingsPreviewCard({
  formData,
  completedSteps,
  totalSteps,
}: SettingsPreviewCardProps) {
  const t = useTranslations("onboarding.preview");

  const hasAnyData = Object.values(formData).some(
    (value) => value !== "" && value !== undefined &&
    !(Array.isArray(value) && value.length === 0)
  );

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base">{t("title")}</CardTitle>
          <Badge variant="secondary">
            {completedSteps.size}/{totalSteps} {t("completed")}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {t("subtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasAnyData ? (
          // Empty State
          <div className="text-center py-8">
            <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {t("empty_state")}
            </p>
          </div>
        ) : (
          <>
            {/* Settings Summary */}
            <div className="space-y-3">
              {formData.brandName && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {t("label_brand")}
                  </div>
                  <div className="font-medium">{formData.brandName}</div>
                </div>
              )}

              {formData.personality && formData.personality.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {t("label_personality")}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.personality.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs">
                        {t(`personality_${p}`)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {formData.formality && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {t("label_formality")}
                  </div>
                  <div className="font-medium">
                    {t(`formality_${formData.formality}`)}
                  </div>
                </div>
              )}

              {formData.language && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {t("label_language")}
                  </div>
                  <div className="font-medium">
                    {formData.language === "ko" ? t("language_ko") : t("language_en")}
                  </div>
                </div>
              )}

              {formData.tone && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {t("label_tone")}
                  </div>
                  <div className="font-medium">
                    {t(`tone_${formData.tone}`)}
                  </div>
                </div>
              )}
            </div>

            {/* Tone Sample */}
            {formData.brandName && formData.tone && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-2">
                  {t("tone_sample_label")}
                </div>
                <p className="text-sm italic leading-relaxed">
                  {generateToneSample(formData)}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

**주요 기능:**
- 입력된 설정만 표시 (조건부 렌더링)
- 완료 단계 카운터
- Empty State (아무 입력 없을 때)
- 톤 예시 생성 (가장 중요한 프리뷰)
- Badge로 시각적 구분

---

### 5.3 StepHeader

#### 파일: `src/features/onboarding/components/step-header.tsx`

```typescript
"use client";

import { LucideIcon } from "lucide-react";

interface StepHeaderProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function StepHeader({
  stepNumber,
  totalSteps,
  title,
  description,
  icon: Icon,
}: StepHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <div className="text-sm text-muted-foreground mb-1">
            {stepNumber}/{totalSteps}
          </div>
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-base text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
```

**주요 기능:**
- 아이콘 (선택적)
- 스텝 번호 표시
- 제목 & 설명
- 간단하고 재사용 가능

---

### 5.4 Tone Generator 유틸

#### 파일: `src/features/onboarding/lib/tone-generator.ts`

```typescript
import { OnboardingFormData } from "./onboarding-schema";

/**
 * 폼 데이터를 기반으로 톤 예시 문장을 생성합니다.
 */
export function generateToneSample(
  formData: Partial<OnboardingFormData>
): string {
  const { brandName, tone, formality, language = "ko" } = formData;

  if (!brandName || !tone) {
    return "";
  }

  // 한국어 템플릿
  if (language === "ko") {
    const templates = {
      professional: {
        casual: `${brandName}는 전문성을 바탕으로 실용적인 솔루션을 제공해요.`,
        neutral: `${brandName}는 전문성을 바탕으로 실용적인 솔루션을 제공합니다.`,
        formal: `${brandName}는 전문성을 바탕으로 고객에게 실용적인 솔루션을 제공하고 있습니다.`,
      },
      friendly: {
        casual: `${brandName}와 함께라면 언제나 즐거워요! 😊`,
        neutral: `${brandName}와 함께라면 언제나 즐겁습니다.`,
        formal: `${brandName}는 고객과의 친밀한 관계를 소중히 여깁니다.`,
      },
      inspirational: {
        casual: `${brandName}와 함께 꿈을 현실로 만들어봐요!`,
        neutral: `${brandName}와 함께 꿈을 현실로 만들어보세요.`,
        formal: `${brandName}는 여러분의 비전 달성을 위해 최선을 다하겠습니다.`,
      },
      educational: {
        casual: `${brandName}에서 배우는 건 항상 재밌어요!`,
        neutral: `${brandName}에서 새로운 지식을 배워보세요.`,
        formal: `${brandName}는 체계적인 학습 경험을 제공합니다.`,
      },
    };

    return templates[tone]?.[formality || "neutral"] || "";
  }

  // 영어 템플릿
  const templatesEn = {
    professional: {
      casual: `${brandName} provides practical solutions based on expertise.`,
      neutral: `${brandName} provides practical solutions based on expertise.`,
      formal: `${brandName} is committed to providing practical solutions based on professional expertise.`,
    },
    friendly: {
      casual: `With ${brandName}, it's always a pleasure! 😊`,
      neutral: `With ${brandName}, it's always a pleasure.`,
      formal: `${brandName} values friendly relationships with customers.`,
    },
    inspirational: {
      casual: `Let's make dreams come true with ${brandName}!`,
      neutral: `Make your dreams come true with ${brandName}.`,
      formal: `${brandName} is committed to helping you achieve your vision.`,
    },
    educational: {
      casual: `Learning with ${brandName} is always fun!`,
      neutral: `Learn new knowledge with ${brandName}.`,
      formal: `${brandName} provides a systematic learning experience.`,
    },
  };

  return templatesEn[tone]?.[formality || "neutral"] || "";
}
```

**주요 기능:**
- 톤 + 격식 + 언어 조합으로 예시 생성
- 브랜드 이름 동적 삽입
- 한글/영어 템플릿 분리

---

### 5.5 애니메이션 유틸

#### 파일: `src/features/onboarding/lib/animations.ts`

```typescript
import { Variants } from "framer-motion";

/**
 * 스텝 전환 애니메이션
 */
export const stepTransitionVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const stepTransition = {
  duration: 0.2,
  ease: "easeInOut",
};

/**
 * 체크마크 애니메이션 (완료 시)
 */
export const checkmarkVariants: Variants = {
  initial: { scale: 0 },
  animate: { scale: 1 },
};

export const checkmarkTransition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

/**
 * 에러 메시지 애니메이션
 */
export const errorMessageVariants: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
};

/**
 * 성공 축하 애니메이션
 */
export const successCelebrationVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
};

export const successCelebrationTransition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};
```

**주요 기능:**
- framer-motion Variants 정의
- 재사용 가능한 애니메이션 상수
- 성능 최적화된 값 (transform, opacity만 사용)

---

### 5.6 OnboardingWizard 수정 (핵심 변경)

#### 파일: `src/features/onboarding/components/onboarding-wizard.tsx`

**주요 변경 사항:**

```typescript
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react";
import { StepIndicatorV2 } from "./step-indicator-v2";
import { SettingsPreviewCard } from "./settings-preview-card";
import { StepBrandVoice } from "./step-brand-voice";
import { StepAudience } from "./step-audience";
import { StepLanguage } from "./step-language";
import { StepStyle } from "./step-style";
import { StepReview } from "./step-review";
import {
  onboardingSchema,
  brandVoiceSchema,
  targetAudienceSchema,
  languageSchema,
  styleSchema,
  reviewSchema,
  defaultOnboardingValues,
  type OnboardingFormData,
} from "../lib/onboarding-schema";
import { TOTAL_STEPS, STEP_NAMES } from "../lib/constants";
import { stepTransitionVariants, stepTransition } from "../lib/animations";

interface OnboardingWizardProps {
  onComplete: (data: OnboardingFormData) => Promise<void>;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const t = useTranslations("onboarding.wizard");
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: defaultOnboardingValues,
    mode: "onChange",
  });

  // Get step-specific schema for validation
  const getStepSchema = (step: number) => {
    switch (step) {
      case 1:
        return brandVoiceSchema;
      case 2:
        return targetAudienceSchema;
      case 3:
        return languageSchema;
      case 4:
        return styleSchema;
      case 5:
        return reviewSchema;
      default:
        return onboardingSchema;
    }
  };

  // Validate current step before proceeding
  const validateCurrentStep = useCallback(async () => {
    const stepSchema = getStepSchema(currentStep);
    const values = form.getValues();

    try {
      await stepSchema.parseAsync(values);
      return true;
    } catch (error) {
      // Trigger validation to show errors
      await form.trigger();
      return false;
    }
  }, [currentStep, form]);

  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep();

    if (isValid) {
      // Mark current step as completed
      setCompletedSteps((prev) => new Set(prev).add(currentStep));

      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Announce step change for screen readers
        const announcement = t("step_change_announcement", {
          current: currentStep + 1,
          total: TOTAL_STEPS,
        });
        announceToScreenReader(announcement);
      }
    }
  }, [currentStep, validateCurrentStep, t]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });

      const announcement = t("step_change_announcement", {
        current: currentStep - 1,
        total: TOTAL_STEPS,
      });
      announceToScreenReader(announcement);
    }
  }, [currentStep, t]);

  const handleStepClick = useCallback((step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Helper function to announce to screen readers
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const handleSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
    } catch (error) {
      console.error("Onboarding submission error:", error);
      setIsSubmitting(false);
    }
  };

  // Watch form values for preview (with debounce)
  const formValues = form.watch();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Alt + Arrow Right: Next step
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }

      // Alt + Arrow Left: Previous step
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, handleNext, handlePrevious]);

  // Render current step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBrandVoice form={form} />;
      case 2:
        return <StepAudience form={form} />;
      case 3:
        return <StepLanguage form={form} />;
      case 4:
        return <StepStyle form={form} />;
      case 5:
        return <StepReview form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Step Indicator V2 */}
        <div className="mb-8">
          <StepIndicatorV2
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
            stepNames={STEP_NAMES}
          />

          {/* Keyboard shortcut hint */}
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">
              <kbd className="rounded px-1.5 py-0.5 bg-muted text-muted-foreground border border-border">
                Alt
              </kbd>
              {" + "}
              <kbd className="rounded px-1.5 py-0.5 bg-muted text-muted-foreground border border-border">
                ← / →
              </kbd>
              {" "}
              {t("keyboard_shortcut_hint")}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target instanceof HTMLElement) {
                if (e.target.tagName !== "TEXTAREA") {
                  e.preventDefault();
                }
              }
            }}
          >
            {/* Desktop: 2-column layout */}
            <div className="hidden lg:grid lg:grid-cols-[60%,40%] lg:gap-8">
              {/* Left: Form */}
              <div className="rounded-lg border bg-card p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    variants={stepTransitionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={stepTransition}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="mt-8 flex items-center justify-between border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="h-10"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t("button_previous")}
                  </Button>

                  {currentStep < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="h-10"
                    >
                      {t("button_next")}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={async () => {
                        const isValid = await validateCurrentStep();
                        if (isValid) {
                          const formData = form.getValues();
                          await handleSubmit(formData);
                        }
                      }}
                      disabled={isSubmitting}
                      className="h-10 bg-success hover:bg-success/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("button_submitting")}
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {t("button_complete")}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Right: Settings Preview Card (sticky) */}
              <div>
                <SettingsPreviewCard
                  formData={formValues}
                  completedSteps={completedSteps}
                  totalSteps={TOTAL_STEPS}
                />
              </div>
            </div>

            {/* Mobile/Tablet: Single column with accordion preview */}
            <div className="lg:hidden">
              <div className="rounded-lg border bg-card p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    variants={stepTransitionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={stepTransition}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>

                {/* Mobile Preview - Accordion */}
                <div className="mt-6">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="preview" className="border-border">
                      <AccordionTrigger className="text-sm font-medium text-foreground">
                        {t("preview_label")}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2">
                          <SettingsPreviewCard
                            formData={formValues}
                            completedSteps={completedSteps}
                            totalSteps={TOTAL_STEPS}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 flex items-center justify-between border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="h-12 flex-1 sm:h-10 sm:flex-initial"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t("button_previous")}
                  </Button>

                  {currentStep < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="ml-4 h-12 flex-1 sm:h-10 sm:flex-initial"
                    >
                      {t("button_next")}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={async () => {
                        const isValid = await validateCurrentStep();
                        if (isValid) {
                          const formData = form.getValues();
                          await handleSubmit(formData);
                        }
                      }}
                      disabled={isSubmitting}
                      className="ml-4 h-12 flex-1 sm:h-10 sm:flex-initial bg-success hover:bg-success/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("button_submitting")}
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {t("button_complete")}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
```

**주요 변경 사항:**
1. ✅ 인라인 스타일 제거 (Tailwind 클래스 사용)
2. ✅ `StepIndicatorV2` 적용
3. ✅ `SettingsPreviewCard` 적용
4. ✅ `completedSteps` 상태 추가
5. ✅ 스텝 클릭 네비게이션 (`handleStepClick`)
6. ✅ framer-motion 애니메이션 추가
7. ✅ 완료 버튼 색상 변경 (초록색)

---

## 6. i18n 번역 키 구조

### 6.1 한국어 (messages/ko.json)

```json
{
  "onboarding": {
    "wizard": {
      "keyboard_shortcut_hint": "스텝 이동",
      "preview_label": "현재 설정 미리보기",
      "button_previous": "이전",
      "button_next": "다음",
      "button_complete": "완료",
      "button_submitting": "생성 중...",
      "step_change_announcement": "{current}/{total} 단계"
    },
    "indicator": {
      "progress_aria_label": "진행률 {percentage}%",
      "steps_aria_label": "온보딩 진행 단계",
      "status_completed": "완료",
      "status_current": "진행 중",
      "status_pending": "대기 중"
    },
    "preview": {
      "title": "현재 설정",
      "subtitle": "입력하신 내용이 여기에 반영됩니다",
      "completed": "완료",
      "empty_state": "폼을 채우면 설정이 여기에 나타납니다",
      "label_brand": "브랜드 이름",
      "label_personality": "브랜드 성격",
      "label_formality": "격식 수준",
      "label_language": "언어",
      "label_tone": "톤",
      "tone_sample_label": "톤 예시:",
      "personality_innovative": "혁신적인",
      "personality_trustworthy": "신뢰할 수 있는",
      "personality_playful": "재미있는",
      "personality_professional": "전문적인",
      "personality_approachable": "친근한",
      "personality_bold": "대담한",
      "personality_authentic": "진정성 있는",
      "personality_sophisticated": "세련된",
      "formality_casual": "캐주얼",
      "formality_neutral": "중립",
      "formality_formal": "격식 있는",
      "language_ko": "한국어",
      "language_en": "영어",
      "tone_professional": "전문적",
      "tone_friendly": "친근한",
      "tone_inspirational": "영감을 주는",
      "tone_educational": "교육적"
    },
    "brand_voice": {
      "title": "브랜드 보이스",
      "subtitle": "브랜드의 개성과 목소리를 정의해주세요",
      "field_brand_name": "브랜드 이름",
      "placeholder_brand_name": "예: 테크 블로그",
      "field_brand_description": "브랜드 설명",
      "placeholder_brand_description": "브랜드가 무엇을 하는지 간단히 설명하세요",
      "field_personality": "브랜드 성격 (최대 3개)",
      "field_formality": "격식 수준",
      "char_count": "{current} / {max}"
    },
    "audience": {
      "title": "타겟 독자",
      "subtitle": "어떤 독자를 위한 콘텐츠인지 알려주세요",
      "field_target_audience": "타겟 독자",
      "placeholder_target_audience": "예: 스타트업 창업가, 개발자, 마케터",
      "field_pain_points": "해결하려는 문제",
      "placeholder_pain_points": "독자들이 겪는 어려움이나 해결하고 싶은 문제"
    },
    "language": {
      "title": "언어 설정",
      "subtitle": "주로 사용할 언어를 선택해주세요",
      "field_language": "언어"
    },
    "style": {
      "title": "스타일 설정",
      "subtitle": "콘텐츠의 톤과 길이를 설정해주세요",
      "field_tone": "톤",
      "field_content_length": "콘텐츠 길이",
      "field_reading_level": "읽기 수준"
    },
    "review": {
      "title": "최종 검토",
      "subtitle": "설정을 검토하고 완료해주세요",
      "field_notes": "메모 (선택)",
      "placeholder_notes": "추가로 남기고 싶은 메모가 있다면 입력하세요"
    }
  }
}
```

### 6.2 영어 (messages/en.json)

```json
{
  "onboarding": {
    "wizard": {
      "keyboard_shortcut_hint": "Navigate steps",
      "preview_label": "Preview current settings",
      "button_previous": "Previous",
      "button_next": "Next",
      "button_complete": "Complete",
      "button_submitting": "Creating...",
      "step_change_announcement": "Step {current} of {total}"
    },
    "indicator": {
      "progress_aria_label": "Progress {percentage}%",
      "steps_aria_label": "Onboarding progress steps",
      "status_completed": "Completed",
      "status_current": "In progress",
      "status_pending": "Pending"
    },
    "preview": {
      "title": "Current Settings",
      "subtitle": "Your input will be reflected here",
      "completed": "Completed",
      "empty_state": "Settings will appear here as you fill the form",
      "label_brand": "Brand Name",
      "label_personality": "Brand Personality",
      "label_formality": "Formality Level",
      "label_language": "Language",
      "label_tone": "Tone",
      "tone_sample_label": "Tone Sample:",
      "personality_innovative": "Innovative",
      "personality_trustworthy": "Trustworthy",
      "personality_playful": "Playful",
      "personality_professional": "Professional",
      "personality_approachable": "Approachable",
      "personality_bold": "Bold",
      "personality_authentic": "Authentic",
      "personality_sophisticated": "Sophisticated",
      "formality_casual": "Casual",
      "formality_neutral": "Neutral",
      "formality_formal": "Formal",
      "language_ko": "Korean",
      "language_en": "English",
      "tone_professional": "Professional",
      "tone_friendly": "Friendly",
      "tone_inspirational": "Inspirational",
      "tone_educational": "Educational"
    },
    "brand_voice": {
      "title": "Brand Voice",
      "subtitle": "Define your brand's personality and voice",
      "field_brand_name": "Brand Name",
      "placeholder_brand_name": "e.g., Tech Blog",
      "field_brand_description": "Brand Description",
      "placeholder_brand_description": "Briefly describe what your brand does",
      "field_personality": "Brand Personality (max 3)",
      "field_formality": "Formality Level",
      "char_count": "{current} / {max}"
    },
    "audience": {
      "title": "Target Audience",
      "subtitle": "Tell us who your content is for",
      "field_target_audience": "Target Audience",
      "placeholder_target_audience": "e.g., Startup founders, developers, marketers",
      "field_pain_points": "Problems to Solve",
      "placeholder_pain_points": "Difficulties readers face or problems they want to solve"
    },
    "language": {
      "title": "Language Settings",
      "subtitle": "Select the primary language",
      "field_language": "Language"
    },
    "style": {
      "title": "Style Settings",
      "subtitle": "Set the tone and length of content",
      "field_tone": "Tone",
      "field_content_length": "Content Length",
      "field_reading_level": "Reading Level"
    },
    "review": {
      "title": "Final Review",
      "subtitle": "Review your settings and complete",
      "field_notes": "Notes (Optional)",
      "placeholder_notes": "Add any additional notes"
    }
  }
}
```

---

## 7. 스타일링 가이드

### 7.1 Tailwind 클래스 패턴

**색상:**
- Primary: `bg-primary`, `text-primary`, `border-primary`
- Success: `bg-success`, `text-success` (완료 버튼)
- Muted: `bg-muted`, `text-muted-foreground`
- Border: `border-border`

**간격:**
- Section: `space-y-6` (24px)
- Component: `space-y-4` (16px)
- Field: `space-y-2` (8px)
- Card padding: `p-6` (24px)

**타이포그래피:**
- Page Title: `text-2xl font-bold`
- Step Title: `text-xl font-bold`
- Field Label: `text-sm font-medium`
- Body: `text-base`
- Caption: `text-sm text-muted-foreground`

### 7.2 반응형 디자인

**브레이크포인트:**
- Mobile: 기본 (< 1024px)
- Desktop: `lg:` (≥ 1024px)

**레이아웃:**
- Mobile: 단일 컬럼
- Desktop: `lg:grid-cols-[60%,40%]`

**버튼:**
- Mobile: `h-12 flex-1`
- Desktop: `h-10`

### 7.3 다크모드 (미지원)

현재는 라이트 모드만 지원합니다. 다크모드는 Phase 5 이후 검토 예정입니다.

---

## 8. 성능 고려사항

### 8.1 애니메이션 최적화

**GPU 가속 활용:**
- `transform`, `opacity`만 애니메이션
- `width`, `height`, `margin` 등은 애니메이션하지 않음

**Duration 최적화:**
- 스텝 전환: 0.2s (빠르게)
- 체크마크: spring animation (자연스럽게)

**prefers-reduced-motion 지원 (선택):**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 8.2 폼 성능 최적화

**Debounce 적용 (선택):**
프리뷰 업데이트를 debounce 처리 (300ms)하여 불필요한 재렌더링 방지:

```typescript
import { useDebounce } from "react-use";

const [formValues, setFormValues] = useState(form.watch());
const debouncedFormValues = useDebounce(formValues, 300);
```

**useMemo 활용:**
톤 생성 등 계산 비용이 높은 작업에 `useMemo` 적용:

```typescript
const toneSample = useMemo(
  () => generateToneSample(formData),
  [formData.brandName, formData.tone, formData.formality]
);
```

---

## 9. 접근성 체크리스트

- [x] **시맨틱 HTML**: `<ol>`, `<li>`, `<button>` 사용
- [x] **ARIA 레이블**: `aria-label`, `aria-current`, `aria-live`
- [x] **키보드 네비게이션**: Alt + Arrow 단축키, Tab 네비게이션
- [ ] **색상 대비**: Lighthouse 검사 필요 (Phase 4)
- [ ] **스크린 리더 테스트**: 실제 테스트 필요 (Phase 4)
- [x] **Focus 스타일**: 기본 focus ring 유지
- [x] **로딩 상태**: `aria-busy`, spinner 표시

---

## 10. 마이그레이션 전략

### 10.1 점진적 교체

**Phase 1:**
1. 새 컴포넌트 생성 (`-v2`, `settings-preview-card` 등)
2. 기존 컴포넌트는 유지
3. 병렬 개발

**Phase 2:**
1. `onboarding-wizard.tsx`에서 새 컴포넌트 import
2. 기존 컴포넌트 주석 처리
3. 테스트 후 기존 파일 삭제

### 10.2 Breaking Changes 최소화

- 기존 API (`onComplete` prop)는 그대로 유지
- `OnboardingFormData` 타입 변경 없음
- `create-style-guide` 액션 변경 없음

### 10.3 롤백 계획

문제 발생 시:
1. Git revert로 이전 커밋으로 복구
2. 기존 컴포넌트 재활성화
3. 새 컴포넌트는 별도 브랜치에서 수정 후 재배포

---

## 11. 테스트 계획

### 11.1 수동 테스트 체크리스트

**기능 테스트:**
- [ ] 각 스텝 유효성 검사
- [ ] 스텝 간 네비게이션 (이전/다음)
- [ ] StepIndicator 클릭 네비게이션
- [ ] 완료 버튼 제출
- [ ] 프리뷰 패널 업데이트
- [ ] 키보드 단축키 (Alt + Arrow)

**UI 테스트:**
- [ ] 모든 필드 입력 가능
- [ ] 글자 수 카운터 동작
- [ ] 체크박스 선택 카운터 (최대 3개)
- [ ] 에러 메시지 표시
- [ ] 반응형 레이아웃 (모바일/데스크톱)

**접근성 테스트:**
- [ ] Tab으로 모든 요소 접근 가능
- [ ] Enter로 버튼 활성화
- [ ] ARIA 레이블 정상 동작
- [ ] Lighthouse Accessibility 95+ 점

### 11.2 E2E 테스트 (선택)

#### 파일: `e2e/style-guide-onboarding.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Style Guide Onboarding", () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 시
    await page.goto("/ko/style-guides/new");
  });

  test("should complete full onboarding flow", async ({ page }) => {
    // Step 1: Brand Voice
    await page.getByLabel(/브랜드 이름/).fill("테크 블로그");
    await page.getByLabel(/브랜드 설명/).fill("개발자를 위한 기술 블로그입니다.");
    await page.getByText("혁신적인").click();
    await page.getByText("전문적인").click();
    await page.getByLabel("중립").click();
    await page.getByRole("button", { name: /다음/ }).click();

    // Step 2: Audience
    await page.getByLabel(/타겟 독자/).fill("프론트엔드 개발자");
    await page.getByLabel(/해결하려는 문제/).fill("React 성능 최적화 문제");
    await page.getByRole("button", { name: /다음/ }).click();

    // Step 3: Language
    await page.getByLabel("한국어").click();
    await page.getByRole("button", { name: /다음/ }).click();

    // Step 4: Style
    await page.getByLabel("전문적").click();
    await page.getByLabel("보통").click();
    await page.getByLabel("중급").click();
    await page.getByRole("button", { name: /다음/ }).click();

    // Step 5: Review
    await page.getByRole("button", { name: /완료/ }).click();

    // 완료 후 리다이렉트 확인
    await expect(page).toHaveURL(/\/style-guides/);
  });

  test("should show validation errors", async ({ page }) => {
    // 필드를 비운 채로 다음 버튼 클릭
    await page.getByRole("button", { name: /다음/ }).click();

    // 에러 메시지 표시 확인
    await expect(page.getByText(/브랜드 이름을 입력해주세요/)).toBeVisible();
  });

  test("should navigate between steps", async ({ page }) => {
    // Step 1 입력
    await page.getByLabel(/브랜드 이름/).fill("테크 블로그");
    await page.getByLabel(/브랜드 설명/).fill("개발자를 위한 기술 블로그입니다.");
    await page.getByText("혁신적인").click();
    await page.getByLabel("중립").click();

    // 다음 클릭
    await page.getByRole("button", { name: /다음/ }).click();

    // Step 2 확인
    await expect(page.getByText("타겟 독자")).toBeVisible();

    // 이전 클릭
    await page.getByRole("button", { name: /이전/ }).click();

    // Step 1로 돌아왔는지 확인
    await expect(page.getByText("브랜드 보이스")).toBeVisible();
    await expect(page.getByLabel(/브랜드 이름/)).toHaveValue("테크 블로그");
  });

  test("should display preview panel", async ({ page }) => {
    await page.getByLabel(/브랜드 이름/).fill("테크 블로그");

    // 프리뷰 패널에 브랜드 이름 표시 확인
    await expect(page.getByText("브랜드 이름")).toBeVisible();
    await expect(page.getByText("테크 블로그")).toBeVisible();
  });
});
```

---

## 12. 성공 지표

### 12.1 정량적 지표

- [ ] **완료율**: 80% 이상 사용자가 5단계 완료
- [ ] **완료 시간**: 평균 5-10분 이내
- [ ] **에러 발생률**: 10% 이하
- [ ] **Lighthouse Performance**: 90점 이상
- [ ] **Lighthouse Accessibility**: 95점 이상

### 12.2 정성적 지표

- [ ] **명확성**: 사용자가 각 스텝의 목적을 이해
- [ ] **신뢰성**: 입력한 내용이 제대로 반영된다는 확신
- [ ] **효율성**: 불필요한 클릭이나 스크롤 없이 완료
- [ ] **만족도**: 스타일 가이드 생성 결과에 만족

### 12.3 기술 지표

- [ ] **코드 품질**: ESLint 0 error, TypeScript strict mode
- [ ] **번들 크기**: 기존 대비 +50KB 이하 (framer-motion 포함)
- [ ] **First Contentful Paint**: 1.5초 이하
- [ ] **i18n 커버리지**: 모든 하드코딩된 문자열 i18n 적용

---

## 13. 리스크 및 완화 방안

### 13.1 잠재적 리스크

**1. 프리뷰 패널 단순화로 인한 기능 누락**
- **리스크**: 사용자가 결과물 예상 어려울 수 있음
- **완화 방안**:
  - 톤 예시를 더 풍부하게 제공 (3-4가지 타입)
  - Step 5 (Review)에서 종합 프리뷰 제공
  - 스타일 가이드 생성 후 즉시 결과물 페이지로 이동

**2. i18n 대응 지연**
- **리스크**: 한글 중심 개발 후 영어 번역 시 레이아웃 깨질 수 있음
- **완화 방안**:
  - Phase 1부터 next-intl 적용
  - 긴 문자열에 대비한 레이아웃 설계 (`truncate`, `wrap`)
  - 영어 번역 동시 진행

**3. 애니메이션 성능**
- **리스크**: 저사양 기기에서 버벅일 수 있음
- **완화 방안**:
  - `prefers-reduced-motion` 미디어 쿼리 지원
  - GPU 가속 활용 (transform, opacity만 사용)
  - 성능 프로파일링 후 최적화

**4. 기존 사용자 데이터 호환성**
- **리스크**: 스키마 변경 시 기존 스타일 가이드 깨질 수 있음
- **완화 방안**:
  - `OnboardingFormData` 타입 변경 없음
  - 기존 DB 스키마 유지
  - 마이그레이션 스크립트 불필요

---

## 14. 최종 권장 사항

### 14.1 즉시 시작 (Phase 1)

**우선순위 1:**
1. i18n 메시지 파일 작성 (`messages/ko.json`, `messages/en.json`)
2. `constants.ts` 수정 (하드코딩된 문자열 제거)
3. CSS Variables 정의 (필요 시)

**산출물:**
- 모든 컴포넌트가 i18n 지원
- 인라인 스타일 제거

---

### 14.2 우선순위 높음 (Phase 2)

**우선순위 2:**
1. `StepIndicatorV2` 구현
2. `SettingsPreviewCard` 구현
3. `StepHeader` 구현
4. 각 스텝 컴포넌트에 적용

**산출물:**
- 명확한 피드백 (카운터, 에러)
- 실시간 설정 확인 가능

---

### 14.3 조건부 진행 (Phase 3-4)

Phase 2 완료 후 사용자 피드백 수집:
- 애니메이션 필요성 재평가
- 모바일 사용량 데이터 확인 후 최적화 범위 결정

---

### 14.4 장기 계획 (Phase 5 이후)

- 다크모드 지원
- AI 제안 기능 (브랜드 성격 자동 추천)
- 템플릿 라이브러리
- Export/Import 기능

---

## 15. 결론

### 15.1 핵심 원칙

1. **단순화 우선**: 핵심 가치에 집중, 불필요한 요소 제거
2. **현실적 일정**: 10-13일로 여유 있는 계획
3. **사용자 중심**: 각 스텝의 가치 제안 명확화
4. **기술 최적화**: shadcn-ui 활용, CSS transition 우선, framer-motion 최소화
5. **단계별 검증**: Phase별 피드백 반영

### 15.2 최종 목표

> **Claude.ai 수준의 세련미를 유지**하되, **불필요한 복잡성을 제거**하고 **스타일 가이드 생성이라는 도메인에 특화**된 경험을 제공한다.

**기대 효과:**
- 사용자 완료율 80% 이상
- 평균 완료 시간 5-10분
- Lighthouse Accessibility 95점 이상
- 브랜드에 맞는 명확한 설정 제공

이 구현 계획은 1단계 개선안의 장점을 유지하면서도 **실현 가능성과 사용자 경험을 크게 향상**시킬 것입니다.

---

**작성일**: 2025-11-16
**작성자**: Claude Code Agent
**버전**: 2.0 (구현 계획)
