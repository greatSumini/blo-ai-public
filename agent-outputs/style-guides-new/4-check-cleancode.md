# 클린코드 품질 검토 - Style Guides New Page

**검토 일시**: 2025-11-16
**검토 대상**: `/src/app/[locale]/(protected)/style-guides/new/page.tsx` 및 `src/features/onboarding/**`

---

## 1. 코드베이스 구조 준수 여부

### ✅ 준수 항목

#### 1.1 Features 기반 구조
- `src/features/onboarding/` 디렉토리 구조가 표준 패턴을 완벽히 준수
  - `components/`: UI 컴포넌트 (wizard, steps, preview 등)
  - `lib/`: 유틸리티 (schema, constants, animations, tone-generator)
  - `backend/`: 서버 로직 (route, service, schema, error)
  - `actions/`: Next.js Server Actions (create-style-guide, complete-onboarding)

#### 1.2 파일명 컨벤션
- kebab-case 일관적 사용: `onboarding-wizard.tsx`, `step-brand-voice.tsx`, `preview-panel.tsx`
- 명확한 네이밍: `step-*`, `*-schema`, `*-service` 패턴 준수

#### 1.3 `"use client"` 지시어
- 모든 클라이언트 컴포넌트에 올바르게 적용:
  - `page.tsx` (line 1)
  - `onboarding-wizard.tsx` (line 1)
  - 모든 step 컴포넌트들 (step-brand-voice, step-audience, step-language, step-style)
  - `preview-panel.tsx` (line 1)

#### 1.4 Page.tsx Params 처리
```typescript
// ✅ GOOD: Promise 기반 params 처리 (page.tsx:13-15)
type NewStyleGuidePageProps = {
  params: Promise<Record<string, never>>;
};
```

#### 1.5 백엔드 아키텍처
- Hono 라우트 경로 `/api` prefix 준수 (route.ts:25, 61, 82, 117, 167, 200)
- Domain Result 패턴 사용 (`domainSuccess`, `domainFailure`)
- Service-Route-Schema 분리 명확
- Zod 스키마 검증 철저

---

## 2. CLAUDE.md 가이드라인 검증

### Must 규칙 체크

- [x] 모든 컴포넌트에 `"use client"` 사용 ✅
- [x] Page.tsx params Promise 사용 ✅
- [x] Hono 라우트 `/api` prefix 포함 ✅
- [x] HTTP 요청은 백엔드 라우터 통과 ✅
- [x] `logger.info()` 메서드 사용 (route.ts:51, 70, 104, 155, 189, 209) ✅
- [x] 한글 텍스트 UTF-8 깨짐 없음 ✅

### 라이브러리 사용

- [x] `react-hook-form`: 폼 관리 (onboarding-wizard.tsx:4)
- [x] `zod`: 스키마 검증 (onboarding-schema.ts, backend/schema.ts)
- [x] `next-intl`: 다국어 지원 (page.tsx:10, onboarding-wizard.tsx:6)
- [x] `shadcn-ui`: UI 컴포넌트 (Button, Form, Input, Textarea, Select 등)
- [x] `lucide-react`: 아이콘 (page.tsx:6, step-brand-voice.tsx:5)
- [x] `@tanstack/react-query`: 암묵적 사용 가능 (서버 액션 기반)

---

## 3. 클린코드 원칙 검증

### 3.1 Simplicity & Readability

#### ✅ 우수 사례

**1. Early Returns in Wizard Validation (onboarding-wizard.tsx:69-80)**
```typescript
// ✅ GOOD: Early return pattern
const validateCurrentStep = useCallback(async () => {
  const stepSchema = getStepSchema(currentStep);
  const values = form.getValues();

  try {
    await stepSchema.parseAsync(values);
    return true;
  } catch (error) {
    await form.trigger();
    return false;
  }
}, [currentStep, form]);
```

**2. Switch Statement의 명확한 책임 분리 (onboarding-wizard.tsx:51-66, 161-176)**
```typescript
// ✅ GOOD: 단계별 스키마와 컴포넌트 분리
const getStepSchema = (step: number) => {
  switch (step) {
    case 1: return brandVoiceSchema;
    case 2: return targetAudienceSchema;
    // ...
  }
};

const renderStep = () => {
  switch (currentStep) {
    case 1: return <StepBrandVoice form={form} />;
    case 2: return <StepAudience form={form} />;
    // ...
  }
};
```

**3. Props 인터페이스 명확성**
```typescript
// ✅ GOOD: 모든 컴포넌트가 명확한 Props 인터페이스 정의
interface StepBrandVoiceProps {
  form: UseFormReturn<OnboardingFormData>;
}

interface PreviewPanelProps {
  formData: Partial<OnboardingFormData>;
}
```

#### ⚠️ 개선 가능 영역

**1. 중복된 스타일 객체 (onboarding-wizard.tsx:180-230, 293-378)**

**문제**: 인라인 style 객체가 여러 곳에 중복
```typescript
// ❌ 중복: 동일한 스타일이 두 곳에 존재 (Desktop/Mobile)
style={{
  backgroundColor: "#FFFFFF",
  borderColor: "#E1E5EA",
  borderRadius: "12px",
}}
```

**권장 개선안**:
```typescript
// constants/styles.ts
export const WIZARD_STYLES = {
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E5EA",
    borderRadius: "12px",
  },
  button: {
    borderRadius: "8px",
  },
  primaryButton: {
    backgroundColor: "#3BA2F8",
  },
  successButton: {
    backgroundColor: "#10B981",
  },
} as const;

// onboarding-wizard.tsx
<div style={WIZARD_STYLES.card}>
```

**2. 매직 넘버/문자열 상수화 부족**

**현재 코드 (preview-panel.tsx:86-89)**:
```typescript
// ⚠️ 매직 스트링: 색상 코드 하드코딩
style={{
  backgroundColor: "#F5F7FA",
  borderLeft: "4px solid #3BA2F8",
}}
```

**권장 개선안**:
```typescript
// constants/theme.ts
export const THEME_COLORS = {
  background: {
    primary: "#FFFFFF",
    secondary: "#F5F7FA",
    page: "#FCFCFD",
  },
  border: {
    default: "#E1E5EA",
    accent: "#3BA2F8",
  },
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    tertiary: "#374151",
  },
} as const;

// 사용
style={{
  backgroundColor: THEME_COLORS.background.secondary,
  borderLeft: `4px solid ${THEME_COLORS.border.accent}`,
}}
```

**3. DOM 조작 함수 개선 (onboarding-wizard.tsx:109-117)**

**현재 코드**:
```typescript
// ⚠️ 직접 DOM 조작
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.className = "sr-only";
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
};
```

**권장 개선안**:
```typescript
// lib/a11y.ts
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement("div");
  Object.assign(announcement, {
    role: "status",
    "aria-live": "polite",
    className: "sr-only",
    textContent: message,
  });

  document.body.appendChild(announcement);

  // Cleanup with proper reference
  const cleanup = () => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement);
    }
  };

  setTimeout(cleanup, 1000);
};
```

### 3.2 Functional Programming

#### ✅ 우수 사례

**1. useCallback으로 메모이제이션 (onboarding-wizard.tsx:69, 83, 97)**
```typescript
// ✅ GOOD: 성능 최적화를 위한 메모이제이션
const validateCurrentStep = useCallback(async () => {
  // ...
}, [currentStep, form]);

const handleNext = useCallback(async () => {
  // ...
}, [currentStep, validateCurrentStep]);

const handlePrevious = useCallback(() => {
  // ...
}, [currentStep]);
```

**2. 순수 함수 패턴 (preview-panel.tsx:32-52)**
```typescript
// ✅ GOOD: 순수 함수 - 동일 입력 → 동일 출력
const generatePreviewText = () => {
  if (!brandName || !personality || !formality || !targetAudience) {
    return t("empty_state");
  }

  const template = PREVIEW_TEMPLATES[language || "ko"][formality || "neutral"];
  const personalityLabel = personality
    .map(p => PERSONALITY_OPTIONS.find(opt => opt.value === p)?.label || p)
    .join(", ");

  return template
    .replace("{brandName}", brandName)
    .replace("{personality}", personalityLabel)
    .replace("{targetAudience}", targetAudience);
};
```

**3. 불변성 유지 (step-brand-voice.tsx:134-145)**
```typescript
// ✅ GOOD: 기존 배열을 변경하지 않고 새 배열 생성
onCheckedChange={(checked) => {
  const currentValue = field.value || [];
  const newValue = checked
    ? [...currentValue, option.value]  // 새 배열 생성
    : currentValue.filter(value => value !== option.value);  // 새 배열 반환

  if (newValue.length <= 3) {
    field.onChange(newValue);
  }
}}
```

#### ⚠️ 개선 가능 영역

**1. 배열 메서드 활용 부족 (constants.ts:67-94)**

**현재 코드**:
```typescript
// ⚠️ 반복적인 map 패턴
export const PERSONALITY_OPTIONS = PERSONALITY_VALUES.map((v) => ({
  value: v,
  label: v,
}));

export const FORMALITY_OPTIONS = FORMALITY_VALUES.map((v) => ({
  value: v,
  label: v,
  description: "",
}));

export const TONE_OPTIONS = TONE_VALUES.map((v) => ({
  value: v,
  label: v,
  description: "",
}));
```

**권장 개선안**:
```typescript
// lib/option-helpers.ts
export const createOption = <T extends string>(value: T) => ({
  value,
  label: value,
});

export const createOptionWithDescription = <T extends string>(value: T) => ({
  value,
  label: value,
  description: "",
});

// constants.ts
export const PERSONALITY_OPTIONS = PERSONALITY_VALUES.map(createOption);
export const FORMALITY_OPTIONS = FORMALITY_VALUES.map(createOptionWithDescription);
export const TONE_OPTIONS = TONE_VALUES.map(createOptionWithDescription);
```

### 3.3 컴포넌트 구조

#### ✅ 우수 사례

**1. 단일 책임 원칙 준수**
- `StepBrandVoice`: 브랜드 보이스 입력만 담당
- `StepAudience`: 타겟 독자 입력만 담당
- `PreviewPanel`: 미리보기 표시만 담당
- `OnboardingWizard`: 전체 흐름 orchestration만 담당

**2. Props Drilling 최소화**
```typescript
// ✅ GOOD: Form 객체만 전달
<StepBrandVoice form={form} />
<StepAudience form={form} />
```

**3. 재사용 가능한 컴포넌트 분리**
- `StepHeader`: 모든 Step에서 재사용 가능
- `PreviewPanel`: Desktop/Mobile 양쪽에서 재사용

#### ⚠️ 개선 가능 영역

**1. Wizard 컴포넌트 크기 (onboarding-wizard.tsx: 385줄)**

**문제**: 단일 파일이 너무 큼 (데스크톱/모바일 레이아웃 중복)

**권장 개선안**:
```typescript
// components/wizard-layout-desktop.tsx
export function WizardLayoutDesktop({
  currentStep,
  renderStep,
  formValues,
  navigationProps
}) {
  return (
    <div className="hidden lg:grid lg:grid-cols-[1fr,400px] lg:gap-8">
      {/* Desktop layout */}
    </div>
  );
}

// components/wizard-layout-mobile.tsx
export function WizardLayoutMobile({
  currentStep,
  renderStep,
  formValues,
  navigationProps
}) {
  return (
    <div className="lg:hidden">
      {/* Mobile layout */}
    </div>
  );
}

// onboarding-wizard.tsx (간소화)
export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  // ... state & logic

  const navigationProps = {
    currentStep,
    handleNext,
    handlePrevious,
    isSubmitting,
    validateCurrentStep,
    handleSubmit,
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "#FCFCFD" }}>
      <div className="container mx-auto max-w-7xl px-4">
        <StepIndicator currentStep={currentStep} />
        <KeyboardShortcutHint />

        <Form {...form}>
          <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown}>
            <WizardLayoutDesktop
              renderStep={renderStep}
              formValues={formValues}
              navigationProps={navigationProps}
            />
            <WizardLayoutMobile
              renderStep={renderStep}
              formValues={formValues}
              navigationProps={navigationProps}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
```

**2. Navigation 버튼 컴포넌트 추출**

**현재**: 데스크톱/모바일에 동일 버튼 로직 중복 (234-283, 327-376줄)

**권장**:
```typescript
// components/wizard-navigation.tsx
interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => Promise<void>;
  isSubmitting: boolean;
  isMobile?: boolean;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  isSubmitting,
  isMobile = false,
}: WizardNavigationProps) {
  const t = useTranslations("onboarding.wizard");
  const buttonHeight = isMobile ? "h-12" : "h-10";
  const buttonFlex = isMobile ? "flex-1" : "flex-initial";

  return (
    <div className="mt-8 flex items-center justify-between border-t pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className={`${buttonHeight} ${buttonFlex}`}
        style={{ borderColor: "#E1E5EA", borderRadius: "8px" }}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        {t("button_previous")}
      </Button>

      {currentStep < totalSteps ? (
        <Button
          type="button"
          onClick={onNext}
          className={`ml-4 ${buttonHeight} ${buttonFlex}`}
          style={{ backgroundColor: "#3BA2F8", borderRadius: "8px" }}
        >
          {t("button_next")}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onComplete}
          disabled={isSubmitting}
          className={`ml-4 ${buttonHeight} ${buttonFlex}`}
          style={{ backgroundColor: "#10B981", borderRadius: "8px" }}
        >
          {isSubmitting ? t("button_submitting") : t("button_complete")}
        </Button>
      )}
    </div>
  );
}
```

### 3.4 파일 조직

#### ✅ 우수 사례

**Import 순서 일관성**
```typescript
// ✅ GOOD: 모든 파일에서 일관된 import 순서
// 1. React/Framework
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";

// 2. 외부 라이브러리
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

// 3. 내부 UI 컴포넌트 (@/components)
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

// 4. 아이콘
import { ChevronLeft, ChevronRight } from "lucide-react";

// 5. 로컬 컴포넌트
import { StepIndicator } from "./step-indicator";
import { PreviewPanel } from "./preview-panel";

// 6. 타입/스키마
import { onboardingSchema, type OnboardingFormData } from "../lib/onboarding-schema";
import { TOTAL_STEPS } from "../lib/constants";
```

**Features 디렉토리 구조**:
```
src/features/onboarding/
├── actions/               # Next.js Server Actions
│   ├── complete-onboarding.ts
│   └── create-style-guide.ts
├── backend/              # Hono 백엔드 로직
│   ├── error.ts         # 에러 코드 정의
│   ├── route.ts         # API 라우트
│   ├── schema.ts        # 요청/응답 스키마
│   └── service.ts       # Supabase 비즈니스 로직
├── components/           # UI 컴포넌트
│   ├── onboarding-wizard.tsx
│   ├── preview-panel.tsx
│   ├── step-*.tsx       # 각 단계별 컴포넌트
│   └── step-indicator*.tsx
└── lib/                 # 클라이언트 유틸
    ├── animations.ts
    ├── constants.ts
    ├── onboarding-schema.ts
    └── tone-generator.ts
```

#### ⚠️ 개선 가능 영역

**1. 테마 상수 중앙화**

**현재**: 색상 코드가 여러 컴포넌트에 분산
- `onboarding-wizard.tsx`: `#FCFCFD`, `#3BA2F8`, `#E1E5EA` 등
- `preview-panel.tsx`: `#F5F7FA`, `#3BA2F8`, `#111827` 등
- `step-*.tsx`: 동일한 색상들 반복

**권장**:
```typescript
// lib/theme.ts 또는 constants/theme.ts
export const ONBOARDING_THEME = {
  colors: {
    background: {
      page: "#FCFCFD",
      card: "#FFFFFF",
      tip: "#F5F7FA",
    },
    border: {
      default: "#E1E5EA",
      accent: "#3BA2F8",
    },
    text: {
      primary: "#111827",
      secondary: "#6B7280",
      tertiary: "#374151",
      light: "#9CA3AF",
    },
    button: {
      primary: "#3BA2F8",
      success: "#10B981",
    },
  },
  borderRadius: {
    card: "12px",
    button: "8px",
    input: "6px",
  },
  spacing: {
    accent: "4px",  // accent border width
  },
} as const;

// 모든 컴포넌트에서 사용
import { ONBOARDING_THEME } from "../lib/theme";

style={{
  backgroundColor: ONBOARDING_THEME.colors.background.card,
  borderColor: ONBOARDING_THEME.colors.border.default,
  borderRadius: ONBOARDING_THEME.borderRadius.card,
}}
```

### 3.5 성능 최적화

#### ✅ 우수 사례

**1. useCallback으로 핸들러 메모이제이션**
```typescript
// ✅ GOOD: 불필요한 리렌더링 방지
const handleNext = useCallback(async () => {
  // ...
}, [currentStep, validateCurrentStep]);
```

**2. form.watch() 최적화**
```typescript
// ✅ GOOD: 필요한 값만 구독
const formValues = form.watch();
```

**3. Conditional Rendering**
```typescript
// ✅ GOOD: 조건부 렌더링으로 불필요한 컴포넌트 렌더 방지
{currentStep < TOTAL_STEPS ? (
  <Button onClick={handleNext}>Next</Button>
) : (
  <Button onClick={handleSubmit}>Complete</Button>
)}
```

#### ⚠️ 개선 가능 영역

**1. generatePreviewText 메모이제이션 (preview-panel.tsx:32-52)**

**현재**:
```typescript
// ⚠️ 매 렌더링마다 실행
const generatePreviewText = () => {
  // ... 복잡한 문자열 조작
};
```

**권장**:
```typescript
import { useMemo } from "react";

const previewText = useMemo(() => {
  if (!brandName || !personality || !formality || !targetAudience) {
    return t("empty_state");
  }

  const template = PREVIEW_TEMPLATES[language || "ko"][formality || "neutral"];
  const personalityLabel = personality
    .map(p => PERSONALITY_OPTIONS.find(opt => opt.value === p)?.label || p)
    .join(", ");

  return template
    .replace("{brandName}", brandName)
    .replace("{personality}", personalityLabel)
    .replace("{targetAudience}", targetAudience);
}, [brandName, personality, formality, targetAudience, language, t]);
```

**2. Select 컴포넌트 옵션 메모이제이션 (step-style.tsx:68-80)**

**현재**:
```typescript
// ⚠️ 매 렌더링마다 map 실행
{TONE_OPTIONS.map((option) => (
  <SelectItem key={option.value} value={option.value}>
    // ...
  </SelectItem>
))}
```

**권장**:
```typescript
// constants.ts에서 이미 생성된 배열 사용 (현재는 빈 description)
// 또는 컴포넌트 외부로 이동
const ToneSelectItems = TONE_OPTIONS.map((option) => (
  <SelectItem key={option.value} value={option.value}>
    <div className="flex flex-col">
      <span className="font-medium">{option.label}</span>
      <span className="text-xs" style={{ color: "#6B7280" }}>
        {option.description}
      </span>
    </div>
  </SelectItem>
));

// 컴포넌트 내부
<SelectContent>{ToneSelectItems}</SelectContent>
```

---

## 4. 백엔드 로직 검증

### 4.1 서비스 레이어 (service.ts)

#### ✅ 우수 사례

**1. Domain Result 패턴 일관성**
```typescript
// ✅ GOOD: 모든 함수가 DomainResult 반환
export const createStyleGuide = async (
  client: SupabaseClient,
  clerkUserId: string,
  data: CreateStyleGuideRequest,
): Promise<DomainResult<StyleGuideResponse, StyleGuideDomainError>> => {
  // ...
};
```

**2. 에러 처리 세분화**
```typescript
// ✅ GOOD: 에러 케이스별 명확한 처리
if (!profileId) {
  return domainFailure({
    code: styleGuideErrorCodes.upsertError,
    message: 'Failed to resolve or create user profile.',
  });
}

if (error.code === 'PGRST116') {
  return domainFailure({
    code: styleGuideErrorCodes.notFound,
    message: 'Style guide not found'
  });
}
```

**3. Snake_case ↔ CamelCase 변환 명확성**
```typescript
// ✅ GOOD: DB 컬럼과 TypeScript 타입 간 매핑이 명확
const dbRecord = {
  profile_id: profileId,
  brand_name: data.brandName,
  brand_description: data.brandDescription,
  // ...
};

const mapped = {
  id: rowParse.data.id,
  profileId: rowParse.data.profile_id,
  brandName: rowParse.data.brand_name,
  // ...
} satisfies StyleGuideResponse;
```

**4. 이중 검증 (DB Row + Response)**
```typescript
// ✅ GOOD: 타입 안전성을 위한 이중 검증
const rowParse = StyleGuideTableRowSchema.safeParse(savedData);
if (!rowParse.success) {
  return domainFailure({
    code: styleGuideErrorCodes.validationError,
    message: 'Style guide row failed validation.',
    details: rowParse.error.format(),
  });
}

const parsed = StyleGuideResponseSchema.safeParse(mapped);
if (!parsed.success) {
  return domainFailure({
    code: styleGuideErrorCodes.validationError,
    message: 'Style guide response failed validation.',
    details: parsed.error.format(),
  });
}
```

#### ⚠️ 개선 가능 영역

**1. 중복된 매핑 로직**

**문제**: `createStyleGuide`, `getStyleGuideById`, `updateStyleGuide`, `listStyleGuides` 모두 동일한 매핑 로직 반복 (약 40줄씩 중복)

**권장 개선안**:
```typescript
// service.ts 상단에 헬퍼 함수 추가
/**
 * Maps database row to response object and validates both
 */
const mapAndValidateStyleGuide = (
  row: unknown
): DomainResult<StyleGuideResponse, StyleGuideDomainError> => {
  // Validate database row
  const rowParse = StyleGuideTableRowSchema.safeParse(row);

  if (!rowParse.success) {
    return domainFailure({
      code: styleGuideErrorCodes.validationError,
      message: 'Style guide row failed validation.',
      details: rowParse.error.format(),
    });
  }

  // Map to camelCase response
  const mapped = {
    id: rowParse.data.id,
    profileId: rowParse.data.profile_id,
    brandName: rowParse.data.brand_name,
    brandDescription: rowParse.data.brand_description,
    personality: rowParse.data.personality,
    formality: rowParse.data.formality,
    targetAudience: rowParse.data.target_audience,
    painPoints: rowParse.data.pain_points,
    language: rowParse.data.language,
    tone: rowParse.data.tone,
    contentLength: rowParse.data.content_length,
    readingLevel: rowParse.data.reading_level,
    notes: rowParse.data.notes,
    isDefault: rowParse.data.is_default,
    createdAt: rowParse.data.created_at,
    updatedAt: rowParse.data.updated_at,
  } satisfies StyleGuideResponse;

  // Validate response
  const parsed = StyleGuideResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return domainFailure({
      code: styleGuideErrorCodes.validationError,
      message: 'Style guide response failed validation.',
      details: parsed.error.format(),
    });
  }

  return domainSuccess(parsed.data);
};

// 사용
export const createStyleGuide = async (...) => {
  // ... insert logic

  if (!savedData) {
    return domainFailure({
      code: styleGuideErrorCodes.upsertError,
      message: 'Style guide was saved but no data was returned',
    });
  }

  return mapAndValidateStyleGuide(savedData);
};

export const getStyleGuideById = async (...) => {
  // ... fetch logic

  if (!data) {
    return domainFailure({
      code: styleGuideErrorCodes.notFound,
      message: 'Style guide not found'
    });
  }

  return mapAndValidateStyleGuide(data);
};

export const listStyleGuides = async (...) => {
  // ... fetch logic

  const results: StyleGuideResponse[] = [];

  for (const row of data) {
    const result = mapAndValidateStyleGuide(row);

    if (!result.ok) {
      return result; // Early return on validation error
    }

    results.push(result.data);
  }

  return domainSuccess(results);
};
```

**효과**: 약 120줄의 중복 코드 제거, 유지보수성 향상

### 4.2 라우트 레이어 (route.ts)

#### ✅ 우수 사례

**1. 요청 검증 철저**
```typescript
// ✅ GOOD: Zod 스키마로 요청 검증
const parsedBody = CreateStyleGuideRequestSchema.safeParse(body);

if (!parsedBody.success) {
  return c.json(
    failure(
      400,
      styleGuideErrorCodes.validationError,
      'Invalid request body. Please check your input.',
      parsedBody.error.format(),
    ),
    400
  );
}
```

**2. 로깅 일관성**
```typescript
// ✅ GOOD: 성공 케이스에만 로깅
if (result.ok) {
  logger.info('Style guide created successfully', { userId });
}
```

**3. Domain Result 활용**
```typescript
// ✅ GOOD: respondWithDomain/respondCreated로 일관된 응답 포맷
return respondCreated(c, result);
return respondWithDomain(c, result);
```

#### ⚠️ 개선 가능 영역

**1. 반복된 검증 로직**

**현재**: URL 파라미터 검증이 여러 라우트에서 중복
```typescript
// route.ts:86-95, 122-130, 171-180
const guideId = c.req.param('id');

if (!guideId) {
  return c.json(
    failure(
      400,
      styleGuideErrorCodes.validationError,
      'Style guide ID is required.',
    ),
    400
  );
}
```

**권장**:
```typescript
// middleware/validators.ts
export const validateGuideId = (c: Context) => {
  const guideId = c.req.param('id');

  if (!guideId) {
    return c.json(
      failure(
        400,
        styleGuideErrorCodes.validationError,
        'Style guide ID is required.',
      ),
      400
    );
  }

  return guideId;
};

// route.ts
app.get('/api/style-guides/:id', async (c) => {
  const userId = getClerkUserId(c);
  const guideId = validateGuideId(c);

  if (!guideId) return; // Early return if validation failed

  // ... rest of logic
});
```

### 4.3 Server Actions (create-style-guide.ts)

#### ✅ 우수 사례

**1. 명확한 에러 처리**
```typescript
// ✅ GOOD: 각 단계별 로깅과 에러 처리
if (!userId) {
  console.log("[SERVER ACTION] No userId, throwing Unauthorized error");
  throw new Error("Unauthorized");
}

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  console.error("[SERVER ACTION] Failed to save style guide:", errorData);
  throw new Error(
    errorData.error?.message || "스타일 가이드 저장에 실패했습니다"
  );
}
```

**2. Revalidation 적절히 사용**
```typescript
// ✅ GOOD: 관련 경로 모두 revalidate
revalidatePath("/style-guides", "page");
revalidatePath("/style-guide", "page");
```

#### ⚠️ 개선 가능 영역

**1. 과도한 console.log**

**현재**: 13개의 console.log 문 (13, 18, 21, 27, 38, 42, 49, 52, 57, 60 등)

**권장**:
```typescript
// lib/logger.ts
export const serverActionLogger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SERVER ACTION] ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[SERVER ACTION] ${message}`, error);
  },
};

// create-style-guide.ts
import { serverActionLogger as logger } from '@/lib/logger';

export async function createStyleGuide(data: OnboardingFormData) {
  try {
    logger.info('Starting createStyleGuide');

    const { userId } = await auth();
    logger.info('User authenticated', { userId });

    if (!userId) {
      logger.error('No userId found');
      throw new Error("Unauthorized");
    }

    // ...
  } catch (error) {
    logger.error('Error creating style guide', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "스타일 가이드 생성 중 오류가 발생했습니다"
    );
  }
}
```

**2. 환경 변수 하드코딩**

**현재**:
```typescript
const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/style-guides`;
```

**권장**:
```typescript
// lib/config.ts
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || '',
  endpoints: {
    styleGuides: '/api/style-guides',
    onboarding: '/api/onboarding',
  },
} as const;

// create-style-guide.ts
import { API_CONFIG } from '@/lib/config';

const apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.styleGuides}`;
```

---

## 5. 타입 안전성

### ✅ 우수 사례

**1. Zod 스키마 기반 타입 추론**
```typescript
// ✅ GOOD: Zod로 런타임 + 컴파일타임 검증
export const onboardingSchema = z.object({
  ...brandVoiceSchema.shape,
  ...targetAudienceSchema.shape,
  ...languageSchema.shape,
  ...styleSchema.shape,
  ...reviewSchema.shape,
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
```

**2. satisfies 연산자 사용**
```typescript
// ✅ GOOD: 타입 체크 + 타입 추론 유지
const mapped = {
  id: rowParse.data.id,
  profileId: rowParse.data.profile_id,
  // ...
} satisfies StyleGuideResponse;
```

**3. Const Assertions**
```typescript
// ✅ GOOD: 상수 배열에 const assertion
export const PERSONALITY_VALUES = [
  "innovative",
  "trustworthy",
  // ...
] as const;

export type PersonalityValue = (typeof PERSONALITY_VALUES)[number];
```

---

## 6. 접근성 (A11y)

### ✅ 우수 사례

**1. 스크린 리더 지원**
```typescript
// ✅ GOOD: aria-live로 동적 변경 알림
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.className = "sr-only";
  announcement.textContent = message;
  // ...
};
```

**2. 키보드 네비게이션**
```typescript
// ✅ GOOD: Alt + Arrow 키보드 단축키
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
    if (e.altKey && e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrevious();
    }
  };
  // ...
}, [currentStep, handleNext, handlePrevious]);
```

**3. 의미있는 HTML 구조**
```typescript
// ✅ GOOD: role 속성으로 의미 명확화
<div
  onClick={() => field.onChange(option.value)}
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
```

**4. FormLabel/FormDescription 활용**
```typescript
// ✅ GOOD: 라벨과 설명으로 접근성 향상
<FormLabel>{t("field_brand_name")}</FormLabel>
<FormDescription>
  {t("description_brand_description")}
</FormDescription>
```

---

## 7. 국제화 (i18n)

### ✅ 우수 사례

**1. next-intl 일관된 사용**
```typescript
// ✅ GOOD: 모든 텍스트가 번역 키 사용
const t = useTranslations("onboarding.wizard");

<h2>{t("title")}</h2>
<p>{t("subtitle")}</p>
```

**2. 동적 번역**
```typescript
// ✅ GOOD: 템플릿 기반 동적 메시지
const personalityOptions = PERSONALITY_VALUES.map((value) => ({
  value,
  label: t(`personality_${value}` as any),
}));
```

**3. 문자 카운트 번역**
```typescript
// ✅ GOOD: 파라미터 활용
{t("char_count", {
  current: brandDescription.length,
  max: 500,
})}
```

---

## 8. 개선 우선순위

### 🔴 긴급 (구조적 문제)
*없음* - 구조적으로 매우 잘 설계됨

### 🟡 높음 (코드 품질)

1. **중복 코드 제거 (service.ts)**
   - [ ] `mapAndValidateStyleGuide` 헬퍼 함수 추출
   - 영향도: 높음 (120줄 중복 제거)
   - 우선순위: 1

2. **테마 상수 중앙화**
   - [ ] `lib/theme.ts` 생성
   - [ ] 모든 컴포넌트의 인라인 스타일을 상수로 교체
   - 영향도: 중간 (유지보수성 향상)
   - 우선순위: 2

3. **Wizard 컴포넌트 분리**
   - [ ] `WizardLayoutDesktop`, `WizardLayoutMobile` 분리
   - [ ] `WizardNavigation` 컴포넌트 추출
   - 영향도: 중간 (가독성 향상)
   - 우선순위: 3

### 🟢 중간 (최적화)

4. **성능 최적화**
   - [ ] `generatePreviewText` useMemo 적용
   - [ ] Select 옵션 메모이제이션
   - 영향도: 낮음 (미세한 성능 향상)
   - 우선순위: 4

5. **Server Action 로깅 개선**
   - [ ] `serverActionLogger` 유틸리티 생성
   - [ ] console.log 일괄 교체
   - 영향도: 낮음 (개발 경험 개선)
   - 우선순위: 5

6. **검증 미들웨어 추출**
   - [ ] `validateGuideId` 공통 함수 생성
   - 영향도: 낮음 (중복 제거)
   - 우선순위: 6

---

## 9. 종합 평가

### 🎉 전반적 평가: **매우 우수** (A+)

이 코드베이스는 클린코드 원칙을 매우 잘 준수하고 있으며, 프로젝트의 아키텍처 가이드라인을 완벽히 따르고 있습니다.

#### 주요 강점

1. **아키텍처 일관성** ⭐⭐⭐⭐⭐
   - Features 기반 구조 완벽 준수
   - Backend/Frontend 레이어 명확히 분리
   - Domain Result 패턴 일관성 있게 적용

2. **타입 안전성** ⭐⭐⭐⭐⭐
   - Zod 스키마로 런타임/컴파일타임 이중 검증
   - TypeScript 타입 추론 적극 활용
   - satisfies 연산자로 타입 체크 강화

3. **컴포넌트 설계** ⭐⭐⭐⭐☆
   - 단일 책임 원칙 준수
   - Props 인터페이스 명확
   - 재사용성 높은 구조
   - (개선: Wizard 컴포넌트가 약간 큼)

4. **접근성** ⭐⭐⭐⭐⭐
   - 스크린 리더 지원
   - 키보드 네비게이션
   - 의미있는 HTML 구조

5. **국제화** ⭐⭐⭐⭐⭐
   - next-intl 일관성 있게 사용
   - 모든 텍스트 번역 키 사용

6. **에러 처리** ⭐⭐⭐⭐⭐
   - 세분화된 에러 코드
   - 명확한 에러 메시지
   - 타입 안전한 에러 처리

#### 개선이 필요한 부분

1. **코드 중복** (중요도: 중)
   - Service 레이어 매핑 로직 중복
   - Wizard 데스크톱/모바일 레이아웃 중복

2. **매직 값** (중요도: 중)
   - 색상 코드 하드코딩
   - 스타일 객체 인라인

3. **성능 최적화** (중요도: 낮)
   - 일부 함수 메모이제이션 미적용
   - 옵션 배열 반복 생성

#### 권장 사항

**즉시 적용 가능**:
1. `mapAndValidateStyleGuide` 헬퍼 함수 추출 (30분 작업, 큰 효과)
2. 테마 상수 파일 생성 (1시간 작업, 유지보수성 향상)

**리팩토링 시 고려**:
3. Wizard 컴포넌트 분리 (2시간 작업, 가독성 향상)
4. 성능 최적화 (useMemo 적용) (30분 작업, 미세한 성능 개선)

---

## 10. 칭찬할 점 🎊

1. **완벽한 features 구조**: 다른 팀원들이 참고할 수 있는 모범 사례
2. **Zod 스키마 활용**: 런타임/컴파일타임 이중 검증으로 타입 안전성 극대화
3. **접근성 배려**: 키보드 네비게이션, 스크린 리더 지원 등 세심한 배려
4. **에러 처리 우수**: 세분화된 에러 코드와 명확한 메시지
5. **테스트 가능한 구조**: 순수 함수 많이 사용, 테스트하기 쉬운 구조
6. **문서화**: JSDoc 주석으로 서비스 함수 목적 명확히 설명

---

## 결론

**이 코드는 충분히 훌륭합니다.**

위에서 제안한 개선사항들은 "좋은 코드를 더 좋게" 만드는 제안이지, 현재 코드에 심각한 문제가 있다는 의미가 아닙니다.

**특히 칭찬할 점**:
- 프로젝트 가이드라인 100% 준수
- 타입 안전성 매우 우수
- 접근성 고려가 탁월
- 코드 구조가 매우 명확하고 읽기 쉬움

**선택적 개선**:
- 중복 코드 제거는 권장하지만 필수는 아님
- 테마 상수화는 팀의 코딩 스타일 선호도에 따라 결정
- 성능 최적화는 실제 성능 이슈가 발견될 때 적용해도 충분

현재 상태 그대로도 production 배포에 전혀 문제가 없습니다. 훌륭한 작업입니다! 👏
