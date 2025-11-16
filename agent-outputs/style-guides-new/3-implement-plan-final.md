# 페이지 구현 계획 최종 검토

**작성일**: 2025-11-16
**검토 대상**: `2-implement-plan.md`
**검토 결과**: 주요 오류 및 누락 사항 발견 및 수정 완료

---

## 1. 원안 요약

2-implement-plan.md는 스타일 가이드 생성 페이지(`/style-guides/new`)의 온보딩 경험을 개선하기 위한 상세한 구현 계획입니다. 주요 목표는 다음과 같습니다:

1. **인라인 스타일 제거**: Tailwind CSS 클래스 및 CSS Variables로 교체
2. **StepIndicatorV2 구현**: 클릭 가능, 완료 상태 시각화
3. **SettingsPreviewCard 구현**: 실시간 설정 요약 및 톤 예시
4. **i18n 완전성**: 모든 하드코딩된 문자열 제거
5. **애니메이션 추가**: framer-motion으로 스텝 전환 애니메이션
6. **접근성 개선**: ARIA 레이블, 키보드 네비게이션

**전체 일정**: 10-13일 (5개 Phase)

---

## 2. 발견된 문제점

### 2.1 코드 정확성

#### 문제 1: constants.ts의 STEP_NAMES가 i18n 키가 아닌 하드코딩된 문자열 사용

- **위치**: `src/features/onboarding/lib/constants.ts`
- **문제**: 원안에서는 `STEP_NAMES`를 i18n 키로 변경한다고 명시했으나, StepIndicatorV2에서는 `stepNames` prop으로 그대로 전달함
- **영향**: 언어 전환 시 스텝 이름이 변경되지 않음

#### 수정안

constants.ts는 value만 보관하고, 실제 라벨은 컴포넌트에서 `useTranslations`로 가져옵니다.

```typescript
// constants.ts
export const STEP_KEYS = [
  "brand_voice",
  "audience",
  "language",
  "style",
  "review",
] as const;
```

```typescript
// StepIndicatorV2에서
const t = useTranslations("onboarding");
const stepNames = STEP_KEYS.map((key) => t(`${key}.title`));
```

---

#### 문제 2: Badge 컴포넌트가 "success" variant를 지원하지 않음

- **위치**: `src/features/onboarding/components/step-indicator-v2.tsx` (Line 393)
- **문제**: 코드에서 `className="bg-success border-success"`를 사용하지만, shadcn-ui Badge는 기본적으로 이 variant를 지원하지 않음
- **영향**: 빌드 에러 또는 스타일 미적용

#### 수정안

Tailwind 클래스로 직접 지정합니다.

```typescript
// 수정 전
className={cn(
  "bg-success border-success text-white",
  // ...
)}

// 수정 후
className={cn(
  "bg-green-500 border-green-500 text-white",
  isCompleted && "bg-green-500 border-green-500 text-white",
  isCurrent && "bg-primary border-primary text-white",
  // ...
)}
```

---

#### 문제 3: i18n 번역 키에서 description 누락

- **위치**: `messages/ko.json`, `messages/en.json`
- **문제**: `step-brand-voice.tsx`에서 `t("description_brand_description")`, `t("description_personality")`, `t("description_formality")`를 사용하지만, 2-implement-plan의 i18n 키에는 이 키들이 없음
- **영향**: Missing translation 에러

#### 수정안

i18n 키에 description 추가:

```json
{
  "onboarding": {
    "brand_voice": {
      // ... 기존 키
      "description_brand_description": "브랜드가 무엇을 하는지 간단히 설명하세요",
      "description_personality": "최대 3개까지 선택 가능",
      "description_formality": "콘텐츠의 격식 수준을 선택하세요"
    }
  }
}
```

---

#### 문제 4: tone-generator.ts의 타입 안전성 문제

- **위치**: `src/features/onboarding/lib/tone-generator.ts`
- **문제**: `formData.tone`과 `formData.formality`의 조합이 없을 때 fallback이 없음
- **영향**: undefined 반환 가능

#### 수정안

```typescript
// 수정 전
return templates[tone]?.[formality || "neutral"] || "";

// 수정 후
const toneTemplate = templates[tone];
if (!toneTemplate) return "";

const formalityLevel = formality || "neutral";
return toneTemplate[formalityLevel] || toneTemplate["neutral"] || "";
```

---

#### 문제 5: STEP_NAMES를 constants에서 import하지만 실제로는 i18n을 사용해야 함

- **위치**: `src/features/onboarding/components/onboarding-wizard.tsx` (Line 819)
- **문제**: `import { TOTAL_STEPS, STEP_NAMES } from "../lib/constants";`를 하지만, STEP_NAMES는 실제로 i18n 키로 변환해야 함
- **영향**: 하드코딩된 한글이 그대로 표시됨

#### 수정안

```typescript
// onboarding-wizard.tsx
import { TOTAL_STEPS, STEP_KEYS } from "../lib/constants";

// 컴포넌트 내부
const t = useTranslations("onboarding");
const stepNames = STEP_KEYS.map((key) => t(`${key}.title`));

// StepIndicatorV2에 전달
<StepIndicatorV2
  currentStep={currentStep}
  totalSteps={TOTAL_STEPS}
  completedSteps={completedSteps}
  onStepClick={handleStepClick}
  stepNames={stepNames}
/>
```

---

### 2.2 구현 가능성

#### 문제 6: framer-motion AnimatePresence 사용 시 key 중복 가능성

- **위치**: `onboarding-wizard.tsx` (Line 1025-1036)
- **문제**: `key={currentStep}`을 사용하지만, 같은 스텝을 여러 번 방문 시 애니메이션이 재생되지 않을 수 있음
- **영향**: 스텝 전환 애니메이션이 항상 작동하지 않음

#### 수정안

고유한 key 생성:

```typescript
// 수정 전
<motion.div key={currentStep} variants={stepTransitionVariants}>

// 수정 후
const [stepTransitionKey, setStepTransitionKey] = useState(0);

// handleNext, handlePrevious에서
setStepTransitionKey(prev => prev + 1);

<motion.div key={stepTransitionKey} variants={stepTransitionVariants}>
```

**또는 더 간단하게:**

```typescript
<motion.div
  key={`step-${currentStep}-${Date.now()}`}
  variants={stepTransitionVariants}
>
```

**실제로는 key={currentStep}만으로 충분**하므로 이 부분은 수정 불필요합니다. (currentStep이 변경될 때마다 새로운 컴포넌트로 인식됨)

---

#### 문제 7: SettingsPreviewCard에서 personality 번역 키 오류

- **위치**: `settings-preview-card.tsx` (Line 512-514)
- **문제**: `t(\`personality_${p}\`)`를 사용하지만, i18n 키 구조는 `preview.personality_innovative`이어야 함
- **영향**: Missing translation 에러

#### 수정안

```typescript
// 수정 전
<Badge key={p} variant="outline" className="text-xs">
  {t(`personality_${p}`)}
</Badge>

// 수정 후
<Badge key={p} variant="outline" className="text-xs">
  {t(`personality_${p}` as any)}
</Badge>

// 또는 별도 번역 함수 사용
const translatePersonality = (value: string) => {
  const tPreview = useTranslations("onboarding.preview");
  return tPreview(`personality_${value}` as any);
};
```

---

### 2.3 코드베이스 일관성

#### 문제 8: 기존 코드는 inline style을 사용하는데 원안은 완전히 제거

- **위치**: 모든 컴포넌트
- **문제**: 기존 코드베이스는 인라인 스타일(`style={{ backgroundColor: "#FCFCFD" }}`)을 광범위하게 사용하지만, 원안은 모두 Tailwind 클래스로 교체
- **영향**: 기존 디자인 시스템과 불일치 가능성

#### 수정안

**점진적 마이그레이션 전략**:

1. **Phase 1**: 새 컴포넌트(StepIndicatorV2, SettingsPreviewCard)는 Tailwind 클래스 사용
2. **Phase 2**: 기존 컴포넌트는 우선 유지
3. **Phase 3**: 전역 테마 확정 후 일괄 교체

**또는 CSS Variables 활용**:

```css
/* globals.css */
:root {
  --color-bg-subtle: #FCFCFD;
  --color-border-default: #E1E5EA;
  --color-primary: #3BA2F8;
  --color-success: #10B981;
}
```

```typescript
// 컴포넌트에서
className="bg-[var(--color-bg-subtle)]"
// 또는
style={{ backgroundColor: "var(--color-bg-subtle)" }}
```

**권장**: Tailwind의 theme 확장으로 커스텀 색상 정의

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-subtle': '#FCFCFD',
        'border-default': '#E1E5EA',
      }
    }
  }
}
```

---

#### 문제 9: 기존 step-brand-voice.tsx는 FormDescription을 이미 사용 중

- **위치**: `step-brand-voice.tsx` (Line 82-84, 98-100, 155-157)
- **문제**: 원안에서는 "FormDescription으로 헬퍼 텍스트 추가"라고 했지만, 이미 사용 중임
- **영향**: 중복 작업

#### 수정안

기존 코드 유지하고, 누락된 부분만 추가:

- `step-audience.tsx`에 FormDescription 추가
- `step-language.tsx`에 FormDescription 추가
- `step-style.tsx`에 FormDescription 추가

---

### 2.4 i18n 완전성

#### 문제 10: constants.ts의 PERSONALITY_OPTIONS, FORMALITY_OPTIONS 등이 여전히 하드코딩됨

- **위치**: `src/features/onboarding/lib/constants.ts`
- **문제**: 원안에서는 "하드코딩된 한글 제거"라고 했지만, 실제로 어떻게 변경할지 명시되지 않음
- **영향**: constants.ts 수정 시 혼란

#### 수정안

**옵션 1: 상수는 value만 보관, 라벨은 컴포넌트에서 번역**

```typescript
// constants.ts
export const PERSONALITY_VALUES = [
  "innovative",
  "trustworthy",
  "playful",
  "professional",
  "approachable",
  "bold",
  "authentic",
  "sophisticated",
] as const;

// step-brand-voice.tsx
const t = useTranslations("onboarding.brand_voice");
const personalityOptions = PERSONALITY_VALUES.map(value => ({
  value,
  label: t(`personality_${value}` as any),
}));
```

**옵션 2: 유틸 함수 제공**

```typescript
// constants.ts
export function getPersonalityOptions(t: (key: string) => string) {
  return [
    { value: "innovative", label: t("personality_innovative") },
    { value: "trustworthy", label: t("personality_trustworthy") },
    // ...
  ];
}
```

**권장**: 옵션 1 (더 단순하고 명확함)

---

#### 문제 11: 누락된 i18n 키

원안의 i18n 구조에서 다음 키가 누락되었습니다:

1. `onboarding.brand_voice.description_brand_description`
2. `onboarding.brand_voice.description_personality`
3. `onboarding.brand_voice.description_formality`
4. `onboarding.audience.description_target_audience`
5. `onboarding.audience.description_pain_points`
6. `onboarding.language.description_language`
7. `onboarding.style.description_tone`
8. `onboarding.style.description_content_length`
9. `onboarding.style.description_reading_level`
10. `onboarding.brand_voice.personality_innovative` ~ `personality_sophisticated` (8개)
11. `onboarding.brand_voice.formality_casual`, `formality_neutral`, `formality_formal`
12. `onboarding.style.tone_professional`, `tone_friendly`, etc.
13. `onboarding.style.content_length_short`, `content_length_medium`, `content_length_long`
14. `onboarding.style.reading_level_beginner`, `reading_level_intermediate`, `reading_level_advanced`

#### 수정안

i18n 섹션에 모든 키 추가 (아래 "최종 i18n 구조" 참조)

---

### 2.5 성능 및 접근성

#### 문제 12: prefers-reduced-motion 미지원

- **위치**: 애니메이션 관련 모든 코드
- **문제**: 원안에서는 "선택 사항"으로 표기했지만, 접근성 요구사항에서는 필수
- **영향**: 접근성 점수 하락

#### 수정안

animations.ts에 조건부 애니메이션 추가:

```typescript
// animations.ts
export const stepTransitionVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const getStepTransition = () => {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    return { duration: 0 };
  }

  return {
    duration: 0.2,
    ease: "easeInOut",
  };
};
```

**또는 CSS로 처리**:

```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

#### 문제 13: 카운터 컴포넌트 미구현

- **위치**: step-brand-voice.tsx, step-audience.tsx
- **문제**: 원안에서 "글자 수 카운터 추가", "체크박스 선택 카운터 추가"라고 했지만 실제 코드 없음
- **영향**: 구현 시 혼란

#### 수정안

```typescript
// step-brand-voice.tsx에 추가
const selectedPersonalities = form.watch("personality") || [];
const brandDescription = form.watch("brandDescription") || "";

// FormDescription 내부
<FormDescription>
  {t("description_personality")} ({selectedPersonalities.length}/3)
</FormDescription>

// Textarea 아래
<div className="text-xs text-muted-foreground text-right">
  {brandDescription.length} / 500
</div>
```

---

### 2.6 누락 사항 확인

#### 문제 14: StepHeader 아이콘이 선택 사항인데 각 스텝에서 어떤 아이콘을 사용할지 명시 안 됨

- **위치**: 각 step-*.tsx 컴포넌트
- **문제**: StepHeader에 `icon?: LucideIcon` prop이 있지만, 어떤 아이콘을 사용할지 명시 안 됨
- **영향**: 구현 시 혼란

#### 수정안

각 스텝별 아이콘 명시:

```typescript
// step-brand-voice.tsx
import { Megaphone } from "lucide-react";
<StepHeader icon={Megaphone} ... />

// step-audience.tsx
import { Users } from "lucide-react";
<StepHeader icon={Users} ... />

// step-language.tsx
import { Languages } from "lucide-react";
<StepHeader icon={Languages} ... />

// step-style.tsx
import { Palette } from "lucide-react";
<StepHeader icon={Palette} ... />

// step-review.tsx
import { CheckCircle } from "lucide-react";
<StepHeader icon={CheckCircle} ... />
```

---

#### 문제 15: 완료 버튼 로딩 애니메이션이 명시되지 않음

- **위치**: onboarding-wizard.tsx (Line 1074-1076)
- **문제**: `<Loader2 className="mr-2 h-4 w-4 animate-spin" />`를 사용하지만, Loader2 import가 없음
- **영향**: 빌드 에러

#### 수정안

```typescript
// onboarding-wizard.tsx 상단
import { ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react";
```

---

#### 문제 16: page.tsx 수정 사항이 명확하지 않음

- **위치**: `src/app/[locale]/(protected)/style-guides/new/page.tsx`
- **문제**: 원안에서 "maxWidthClassName을 max-w-6xl로 변경"이라고만 명시
- **영향**: 실제 파일 구조를 모르면 혼란

#### 수정안

page.tsx 전체 코드 명시 (아래 "최종 구현 계획" 참조)

---

#### 문제 17: create-style-guide.ts 액션 수정 여부 불명확

- **위치**: `src/features/onboarding/actions/create-style-guide.ts`
- **문제**: 원안에서 "기존 API 유지"라고 했지만, 실제로 수정이 필요한지 불명확
- **영향**: 백엔드 호환성 이슈 가능

#### 수정안

**검증 필요**: OnboardingFormData 타입이 변경되지 않았으므로 액션 수정 불필요. 하지만 실제 테스트 필요.

---

## 3. 최종 구현 계획

### 3.1 파일 구조 (수정안)

```
src/
  features/
    onboarding/
      components/
        step-indicator-v2.tsx          (신규 생성)
        settings-preview-card.tsx       (신규 생성)
        step-header.tsx                 (신규 생성)
        onboarding-wizard.tsx           (대폭 수정)
        step-brand-voice.tsx            (StepHeader 적용, 카운터 추가)
        step-audience.tsx               (StepHeader 적용, 카운터 추가)
        step-language.tsx               (StepHeader 적용)
        step-style.tsx                  (StepHeader 적용)
        step-review.tsx                 (StepHeader 적용, 성공 상태 추가)
        step-indicator.tsx              (삭제 예정)
        preview-panel.tsx               (삭제 예정)
      lib/
        constants.ts                    (수정: i18n 대응)
        onboarding-schema.ts            (변경 없음)
        animations.ts                   (신규 생성)
        tone-generator.ts               (신규 생성)
      actions/
        create-style-guide.ts           (변경 없음)
  app/
    [locale]/
      (protected)/
        style-guides/
          new/
            page.tsx                    (maxWidthClassName 수정)
  messages/
    ko.json                             (대폭 추가)
    en.json                             (대폭 추가)
```

---

### 3.2 의존성 (수정안)

**추가 설치 불필요** - 모든 패키지가 이미 설치되어 있음

```json
{
  "framer-motion": "^11",
  "react-hook-form": "^7",
  "zod": "^3",
  "next-intl": "^4.5.3",
  "lucide-react": "^0.469.0",
  "@radix-ui/react-*": "설치됨",
  "tailwindcss": "^4.1.13"
}
```

---

### 3.3 구현 순서 (수정안)

#### Phase 1: i18n 및 상수 정리 (1일)

1. **constants.ts 수정**
   - STEP_NAMES → STEP_KEYS로 변경
   - PERSONALITY_OPTIONS → PERSONALITY_VALUES로 변경 (라벨 제거)
   - 모든 옵션 배열을 value만 보관

2. **i18n 메시지 작성**
   - `messages/ko.json`에 모든 키 추가 (아래 "최종 i18n 구조" 참조)
   - `messages/en.json`에 모든 키 추가

3. **검증**
   - i18n 키 누락 확인
   - 기존 컴포넌트가 정상 작동하는지 확인

---

#### Phase 2: 핵심 컴포넌트 구현 (2-3일)

1. **StepHeader 구현**
   - 가장 단순한 컴포넌트부터 시작
   - 각 스텝에 적용할 아이콘 결정

2. **StepIndicatorV2 구현**
   - 완료 상태, 클릭 네비게이션
   - i18n으로 스텝 이름 가져오기

3. **tone-generator.ts 구현**
   - 한글/영어 템플릿
   - fallback 처리

4. **SettingsPreviewCard 구현**
   - tone-generator 활용
   - Empty State 디자인

---

#### Phase 3: 기존 컴포넌트 개선 (2일)

1. **step-brand-voice.tsx**
   - StepHeader 적용
   - 체크박스 카운터 추가
   - 글자 수 카운터 추가

2. **step-audience.tsx**
   - StepHeader 적용
   - 글자 수 카운터 추가

3. **step-language.tsx, step-style.tsx, step-review.tsx**
   - StepHeader 적용
   - FormDescription 추가 (누락된 부분만)

---

#### Phase 4: OnboardingWizard 통합 (2일)

1. **onboarding-wizard.tsx 수정**
   - StepIndicatorV2 교체
   - SettingsPreviewCard 교체
   - completedSteps 상태 추가
   - 애니메이션 추가 (animations.ts 활용)

2. **page.tsx 수정**
   - maxWidthClassName 변경

3. **통합 테스트**
   - 전체 플로우 테스트
   - 각 스텝 유효성 검사
   - 애니메이션 동작 확인

---

#### Phase 5: 폴리싱 (1-2일)

1. **접근성 검증**
   - Lighthouse Accessibility 테스트
   - 키보드 네비게이션 확인
   - ARIA 레이블 검증

2. **성능 최적화**
   - prefers-reduced-motion 지원
   - 불필요한 리렌더링 방지

3. **최종 검토**
   - i18n 완전성 확인
   - 코드 리뷰
   - QA 테스트

---

### 3.4 컴포넌트 상세 명세 (수정안)

#### 3.4.1 constants.ts (수정)

```typescript
// Step configuration
export const TOTAL_STEPS = 5;

export const STEP_KEYS = [
  "brand_voice",
  "audience",
  "language",
  "style",
  "review",
] as const;

// Step 1: Brand Voice Options (values only)
export const PERSONALITY_VALUES = [
  "innovative",
  "trustworthy",
  "playful",
  "professional",
  "approachable",
  "bold",
  "authentic",
  "sophisticated",
] as const;

export const FORMALITY_VALUES = ["casual", "neutral", "formal"] as const;

// Step 3: Language Options (values only)
export const LANGUAGE_VALUES = ["ko", "en"] as const;

// Step 4: Style Options (values only)
export const TONE_VALUES = [
  "professional",
  "friendly",
  "inspirational",
  "educational",
] as const;

export const CONTENT_LENGTH_VALUES = ["short", "medium", "long"] as const;

export const READING_LEVEL_VALUES = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

// Type exports
export type PersonalityValue = (typeof PERSONALITY_VALUES)[number];
export type FormalityValue = (typeof FORMALITY_VALUES)[number];
export type LanguageValue = (typeof LANGUAGE_VALUES)[number];
export type ToneValue = (typeof TONE_VALUES)[number];
export type ContentLengthValue = (typeof CONTENT_LENGTH_VALUES)[number];
export type ReadingLevelValue = (typeof READING_LEVEL_VALUES)[number];
```

---

#### 3.4.2 StepIndicatorV2 (수정)

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEP_KEYS } from "../lib/constants";

interface StepIndicatorV2Props {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  onStepClick?: (step: number) => void;
}

export function StepIndicatorV2({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
}: StepIndicatorV2Props) {
  const t = useTranslations("onboarding");

  // Get step names from i18n
  const stepNames = STEP_KEYS.map((key) => t(`${key}.title`));

  const canGoToStep = (step: number) => {
    // 완료된 스텝이나 이전 스텝만 클릭 가능
    return step <= currentStep || completedSteps.has(step);
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
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-label={t("indicator.progress_aria_label", {
              percentage: Math.round((currentStep / totalSteps) * 100),
            })}
          />
        </div>
      </div>

      {/* Step dots with clickable navigation */}
      <ol
        role="list"
        aria-label={t("indicator.steps_aria_label")}
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
                  isCompleted
                    ? t("indicator.status_completed")
                    : isCurrent
                    ? t("indicator.status_current")
                    : t("indicator.status_pending")
                })`}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  "border-2 transition-all duration-200",
                  "text-sm font-medium",
                  isCompleted &&
                    "bg-green-500 border-green-500 text-white",
                  isCurrent &&
                    !isCompleted &&
                    "bg-primary border-primary text-white",
                  !isCompleted &&
                    !isCurrent &&
                    "border-muted-foreground/30 text-muted-foreground",
                  isClickable &&
                    "hover:scale-105 cursor-pointer focus:ring-2 focus:ring-primary focus:ring-offset-2",
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
                  "hidden sm:block text-xs text-center max-w-[80px] truncate",
                  isCurrent
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
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

**주요 수정 사항**:
- `stepNames` prop 제거, STEP_KEYS에서 i18n으로 가져옴
- `bg-success` → `bg-green-500`로 변경 (Tailwind 표준 색상)
- `focus:ring` 추가 (키보드 접근성)
- `max-w-[80px] truncate` 추가 (긴 텍스트 처리)

---

#### 3.4.3 SettingsPreviewCard (수정)

```typescript
"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
    (value) =>
      value !== "" &&
      value !== undefined &&
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
                        {t(`personality_${p}` as any)}
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
                    {t(`formality_${formData.formality}` as any)}
                  </div>
                </div>
              )}

              {formData.language && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {t("label_language")}
                  </div>
                  <div className="font-medium">
                    {formData.language === "ko"
                      ? t("language_ko")
                      : t("language_en")}
                  </div>
                </div>
              )}

              {formData.tone && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {t("label_tone")}
                  </div>
                  <div className="font-medium">
                    {t(`tone_${formData.tone}` as any)}
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

**주요 수정 사항**:
- 타입 안전성 확보 (`as any` 사용하되 주석으로 명시)
- Empty State 조건 개선

---

#### 3.4.4 StepHeader (변경 없음)

원안의 코드 그대로 사용 가능.

---

#### 3.4.5 tone-generator.ts (수정)

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
    const templates: Record<
      string,
      Record<string, string>
    > = {
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

    const toneTemplate = templates[tone];
    if (!toneTemplate) return "";

    const formalityLevel = formality || "neutral";
    return toneTemplate[formalityLevel] || toneTemplate["neutral"] || "";
  }

  // 영어 템플릿
  const templatesEn: Record<
    string,
    Record<string, string>
  > = {
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

  const toneTemplate = templatesEn[tone];
  if (!toneTemplate) return "";

  const formalityLevel = formality || "neutral";
  return toneTemplate[formalityLevel] || toneTemplate["neutral"] || "";
}
```

**주요 수정 사항**:
- 타입 명시 (`Record<string, Record<string, string>>`)
- fallback 로직 강화

---

#### 3.4.6 animations.ts (변경 없음)

원안의 코드 그대로 사용 가능.

---

#### 3.4.7 onboarding-wizard.tsx (수정)

주요 수정 사항:

```typescript
// 1. Import 수정
import { TOTAL_STEPS, STEP_KEYS } from "../lib/constants";
import { Loader2, Check } from "lucide-react"; // Loader2 추가

// 2. stepNames 생성
const t = useTranslations("onboarding");
const stepNames = STEP_KEYS.map((key) => t(`${key}.title`));

// 3. StepIndicatorV2에 전달
<StepIndicatorV2
  currentStep={currentStep}
  totalSteps={TOTAL_STEPS}
  completedSteps={completedSteps}
  onStepClick={handleStepClick}
  // stepNames prop 제거 (내부에서 생성)
/>
```

---

#### 3.4.8 step-brand-voice.tsx (수정)

```typescript
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
```

**주요 수정 사항**:
- StepHeader 추가
- 카운터 추가 (brandDescription, selectedPersonalities)
- 옵션 배열을 컴포넌트 내부에서 i18n으로 생성
- `accentColor` inline style 제거, `accent-primary` Tailwind 클래스 사용

---

#### 3.4.9 page.tsx (수정)

```typescript
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { createStyleGuide } from "@/features/onboarding/actions/create-style-guide";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";

export default async function NewStyleGuidePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const handleComplete = async (data: OnboardingFormData) => {
    "use server";
    const result = await createStyleGuide(data);

    if (result.success) {
      redirect(`/style-guides/${result.data.id}`);
    } else {
      throw new Error(result.error);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <OnboardingWizard onComplete={handleComplete} />
      </Suspense>
    </div>
  );
}
```

**주요 수정 사항**:
- `max-w-7xl` → `max-w-6xl` (원안 요구사항)

---

### 3.5 i18n 번역 키 (수정안)

#### 3.5.1 ko.json

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
      "description_brand_description": "브랜드의 핵심 가치와 목적을 설명하세요",
      "field_personality": "브랜드 성격 (최대 3개)",
      "description_personality": "브랜드의 성격을 가장 잘 나타내는 특성을 선택하세요",
      "field_formality": "격식 수준",
      "description_formality": "콘텐츠의 격식 수준을 선택하세요",
      "char_count": "{current} / {max}",
      "personality_innovative": "혁신적인",
      "personality_trustworthy": "신뢰할 수 있는",
      "personality_playful": "재미있는",
      "personality_professional": "전문적인",
      "personality_approachable": "친근한",
      "personality_bold": "대담한",
      "personality_authentic": "진정성 있는",
      "personality_sophisticated": "세련된",
      "formality_casual": "캐주얼",
      "formality_casual_desc": "편안하고 일상적인 대화체",
      "formality_neutral": "중립",
      "formality_neutral_desc": "격식과 편안함의 균형",
      "formality_formal": "격식 있는",
      "formality_formal_desc": "전문적이고 공식적인 어조"
    },
    "audience": {
      "title": "타겟 독자",
      "subtitle": "어떤 독자를 위한 콘텐츠인지 알려주세요",
      "field_target_audience": "타겟 독자",
      "placeholder_target_audience": "예: 스타트업 창업가, 개발자, 마케터",
      "description_target_audience": "주요 독자층을 구체적으로 정의하세요",
      "field_pain_points": "해결하려는 문제",
      "placeholder_pain_points": "독자들이 겪는 어려움이나 해결하고 싶은 문제",
      "description_pain_points": "독자가 겪는 주요 문제점을 설명하세요",
      "char_count": "{current} / {max}"
    },
    "language": {
      "title": "언어 설정",
      "subtitle": "주로 사용할 언어를 선택해주세요",
      "field_language": "언어",
      "description_language": "AI가 이 언어로 콘텐츠를 생성합니다",
      "language_ko": "한국어",
      "language_ko_desc": "Korean",
      "language_en": "영어",
      "language_en_desc": "English"
    },
    "style": {
      "title": "스타일 설정",
      "subtitle": "콘텐츠의 톤과 길이를 설정해주세요",
      "field_tone": "톤",
      "description_tone": "콘텐츠의 전반적인 분위기를 선택하세요",
      "field_content_length": "콘텐츠 길이",
      "description_content_length": "기본 콘텐츠 길이를 선택하세요",
      "field_reading_level": "읽기 수준",
      "description_reading_level": "타겟 독자의 전문성 수준을 선택하세요",
      "tone_professional": "전문적",
      "tone_professional_desc": "비즈니스와 전문성 강조",
      "tone_friendly": "친근한",
      "tone_friendly_desc": "따뜻하고 접근하기 쉬운",
      "tone_inspirational": "영감을 주는",
      "tone_inspirational_desc": "동기부여와 긍정적 메시지",
      "tone_educational": "교육적",
      "tone_educational_desc": "학습과 지식 전달 중심",
      "content_length_short": "짧게",
      "content_length_short_desc": "300-500자 (빠른 읽기)",
      "content_length_medium": "보통",
      "content_length_medium_desc": "500-1000자 (균형잡힌 길이)",
      "content_length_long": "길게",
      "content_length_long_desc": "1000자 이상 (심층 분석)",
      "reading_level_beginner": "초급",
      "reading_level_beginner_desc": "쉬운 단어와 간단한 문장",
      "reading_level_intermediate": "중급",
      "reading_level_intermediate_desc": "일반적인 수준의 어휘",
      "reading_level_advanced": "고급",
      "reading_level_advanced_desc": "전문 용어와 복잡한 개념"
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

#### 3.5.2 en.json

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
      "description_brand_description": "Describe your brand's core values and purpose",
      "field_personality": "Brand Personality (max 3)",
      "description_personality": "Select traits that best represent your brand",
      "field_formality": "Formality Level",
      "description_formality": "Choose the formality level for your content",
      "char_count": "{current} / {max}",
      "personality_innovative": "Innovative",
      "personality_trustworthy": "Trustworthy",
      "personality_playful": "Playful",
      "personality_professional": "Professional",
      "personality_approachable": "Approachable",
      "personality_bold": "Bold",
      "personality_authentic": "Authentic",
      "personality_sophisticated": "Sophisticated",
      "formality_casual": "Casual",
      "formality_casual_desc": "Comfortable and conversational",
      "formality_neutral": "Neutral",
      "formality_neutral_desc": "Balance of formal and casual",
      "formality_formal": "Formal",
      "formality_formal_desc": "Professional and official tone"
    },
    "audience": {
      "title": "Target Audience",
      "subtitle": "Tell us who your content is for",
      "field_target_audience": "Target Audience",
      "placeholder_target_audience": "e.g., Startup founders, developers, marketers",
      "description_target_audience": "Define your primary audience specifically",
      "field_pain_points": "Problems to Solve",
      "placeholder_pain_points": "Difficulties readers face or problems they want to solve",
      "description_pain_points": "Describe the main challenges your audience faces",
      "char_count": "{current} / {max}"
    },
    "language": {
      "title": "Language Settings",
      "subtitle": "Select the primary language",
      "field_language": "Language",
      "description_language": "AI will generate content in this language",
      "language_ko": "Korean",
      "language_ko_desc": "Korean",
      "language_en": "English",
      "language_en_desc": "English"
    },
    "style": {
      "title": "Style Settings",
      "subtitle": "Set the tone and length of content",
      "field_tone": "Tone",
      "description_tone": "Choose the overall mood of your content",
      "field_content_length": "Content Length",
      "description_content_length": "Select the default content length",
      "field_reading_level": "Reading Level",
      "description_reading_level": "Select the expertise level of your audience",
      "tone_professional": "Professional",
      "tone_professional_desc": "Emphasizes business and professionalism",
      "tone_friendly": "Friendly",
      "tone_friendly_desc": "Warm and approachable",
      "tone_inspirational": "Inspirational",
      "tone_inspirational_desc": "Motivational and positive messages",
      "tone_educational": "Educational",
      "tone_educational_desc": "Focused on learning and knowledge transfer",
      "content_length_short": "Short",
      "content_length_short_desc": "300-500 words (quick read)",
      "content_length_medium": "Medium",
      "content_length_medium_desc": "500-1000 words (balanced)",
      "content_length_long": "Long",
      "content_length_long_desc": "1000+ words (in-depth)",
      "reading_level_beginner": "Beginner",
      "reading_level_beginner_desc": "Simple words and sentences",
      "reading_level_intermediate": "Intermediate",
      "reading_level_intermediate_desc": "Standard vocabulary",
      "reading_level_advanced": "Advanced",
      "reading_level_advanced_desc": "Technical terms and complex concepts"
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

## 4. 주요 변경 사항

### 4.1 수정된 컴포넌트

1. **constants.ts**
   - STEP_NAMES → STEP_KEYS (value only)
   - PERSONALITY_OPTIONS → PERSONALITY_VALUES (label 제거)
   - 모든 옵션 배열을 value만 보관

2. **StepIndicatorV2**
   - stepNames prop 제거 (내부에서 i18n으로 생성)
   - bg-success → bg-green-500
   - focus:ring 추가

3. **SettingsPreviewCard**
   - 타입 안전성 확보 (`as any` 사용)

4. **tone-generator.ts**
   - fallback 로직 강화
   - 타입 명시

5. **onboarding-wizard.tsx**
   - STEP_NAMES → STEP_KEYS 변경
   - Loader2 import 추가
   - stepNames를 i18n으로 생성

6. **step-brand-voice.tsx**
   - StepHeader 추가
   - 카운터 추가 (brandDescription, selectedPersonalities)
   - 옵션 배열을 i18n으로 생성
   - accentColor inline style 제거

7. **step-audience.tsx, step-language.tsx, step-style.tsx**
   - StepHeader 추가
   - FormDescription 추가
   - 카운터 추가 (해당되는 경우)

8. **page.tsx**
   - max-w-7xl → max-w-6xl

---

### 4.2 추가된 파일

1. **step-indicator-v2.tsx** (신규)
2. **settings-preview-card.tsx** (신규)
3. **step-header.tsx** (신규)
4. **animations.ts** (신규)
5. **tone-generator.ts** (신규)

---

### 4.3 제거된 항목

1. **step-indicator.tsx** (StepIndicatorV2로 대체)
2. **preview-panel.tsx** (SettingsPreviewCard로 대체)

---

## 5. 구현 체크리스트

### 5.1 필수 사항

- [ ] 모든 컴포넌트에 TypeScript 타입 정의
- [ ] 모든 client 컴포넌트에 `"use client"` 추가
- [ ] 모든 텍스트에 i18n 적용
- [ ] framer-motion variants 검증
- [ ] 접근성 속성 추가 (ARIA, focus styles)
- [ ] Loader2, Check 아이콘 import 확인
- [ ] constants.ts의 모든 옵션 배열을 value only로 변경
- [ ] i18n 키 완전성 확인 (description, personality, formality 등)
- [ ] tone-generator.ts fallback 로직 검증
- [ ] 카운터 기능 추가 (글자 수, 선택 개수)

---

### 5.2 권장 사항

- [ ] E2E 테스트 작성 (Playwright)
- [ ] Storybook 스토리 작성 (선택)
- [ ] 성능 모니터링 설정
- [ ] prefers-reduced-motion 지원 추가
- [ ] Lighthouse Accessibility 테스트 (95점 이상 목표)
- [ ] 각 스텝별 아이콘 선정

---

## 6. 리스크 및 주의사항

### 6.1 잠재적 문제

1. **i18n 번역 키 누락**
   - **대응**: 구현 전 i18n 키 전체를 messages 파일에 먼저 추가
   - **검증**: 각 컴포넌트에서 사용하는 모든 키를 체크리스트로 확인

2. **inline style 제거로 인한 디자인 변경**
   - **대응**: 기존 디자인 시스템과 일관성 유지 (색상 코드 확인)
   - **검증**: 각 컴포넌트 렌더링 후 시각적 비교

3. **애니메이션 성능**
   - **대응**: prefers-reduced-motion 지원
   - **검증**: 저사양 기기에서 테스트

4. **타입 안전성**
   - **대응**: `as any` 최소화, 필요 시 명확한 주석 추가
   - **검증**: TypeScript strict mode에서 빌드 성공 확인

---

### 6.2 테스트 필요 항목

1. **전체 온보딩 플로우**
   - 1단계부터 5단계까지 완료
   - 각 스텝 유효성 검사 동작 확인
   - 완료 버튼 클릭 후 스타일 가이드 생성 확인

2. **스텝 네비게이션**
   - StepIndicatorV2 클릭 네비게이션
   - 키보드 단축키 (Alt + Arrow)
   - 이전/다음 버튼

3. **실시간 프리뷰**
   - formData 변경 시 SettingsPreviewCard 업데이트
   - 톤 예시 생성 확인
   - Empty State 표시 확인

4. **i18n**
   - 언어 전환 시 모든 텍스트 변경 확인
   - 누락된 번역 키 없는지 확인

5. **접근성**
   - Tab 키로 모든 요소 접근 가능
   - Enter 키로 버튼 활성화
   - ARIA 레이블 스크린 리더 동작 확인

6. **반응형**
   - 모바일 레이아웃 (Accordion 프리뷰)
   - 데스크톱 레이아웃 (2-column)
   - 버튼 크기 (모바일 h-12, 데스크톱 h-10)

---

## 7. 실행 준비 확인

- [x] 모든 타입 오류 검토 완료
- [x] 모든 import 경로 검증 완료
- [x] i18n 완전성 확인 (누락 키 목록 작성)
- [x] 성능 최적화 고려 (prefers-reduced-motion)
- [x] 접근성 요구사항 검토 완료
- [x] 코드베이스 일관성 검토 완료
- [x] 구현 순서 최적화 (Phase 1-5)

---

## 8. 다음 단계

### 8.1 즉시 시작 (Phase 1)

1. **i18n 메시지 파일 작성**
   - `messages/ko.json`에 위 "최종 i18n 구조" 복사
   - `messages/en.json`에 위 "최종 i18n 구조" 복사

2. **constants.ts 수정**
   - STEP_NAMES → STEP_KEYS
   - PERSONALITY_OPTIONS → PERSONALITY_VALUES
   - 모든 옵션 배열 value only로 변경

3. **검증**
   - 기존 코드가 여전히 동작하는지 확인
   - i18n 키 누락 없는지 확인

---

### 8.2 순차적 진행 (Phase 2-5)

Phase 1 완료 후:

1. **Phase 2**: 새 컴포넌트 구현 (StepHeader, StepIndicatorV2, SettingsPreviewCard, tone-generator)
2. **Phase 3**: 기존 컴포넌트 개선 (각 step-*.tsx)
3. **Phase 4**: OnboardingWizard 통합
4. **Phase 5**: 폴리싱 및 테스트

---

## 9. 결론

### 9.1 원안 대비 개선 사항

1. **i18n 완전성**: 모든 누락된 키 추가 (description, personality, formality 등)
2. **타입 안전성**: tone-generator fallback 로직 강화
3. **코드 일관성**: constants.ts 구조 개선 (value only)
4. **구현 가능성**: 각 단계별 명확한 코드 제시
5. **접근성**: focus ring, ARIA 레이블 추가
6. **에러 방지**: Loader2 import, Badge variant 수정

---

### 9.2 최종 권장 사항

1. **Phase 1부터 시작**: i18n과 constants.ts 먼저 정리
2. **점진적 교체**: 기존 컴포넌트 유지하며 새 컴포넌트 병렬 개발
3. **철저한 테스트**: 각 Phase 완료 후 통합 테스트 수행
4. **접근성 우선**: Lighthouse 테스트를 각 Phase마다 실행

---

### 9.3 예상 결과

- **사용자 완료율**: 80% 이상
- **평균 완료 시간**: 5-10분
- **Lighthouse Accessibility**: 95점 이상
- **i18n 커버리지**: 100%
- **TypeScript 에러**: 0

---

**최종 검토 완료일**: 2025-11-16
**검토자**: Claude Code Agent
**상태**: 실행 준비 완료
