# 인증 페이지 UI/UX 개선안

**분석 대상**: 인증 관련 5개 페이지
**분석 일자**: 2025-11-17
**기준**: `/Users/choesumin/Desktop/dev/indieblog/CLAUDE.md` - UI/UX Design Guide

---

## 목차

1. [전체 평가 요약](#1-전체-평가-요약)
2. [Sign-In 페이지 분석](#2-sign-in-페이지-분석)
3. [Sign-Up 페이지 분석](#3-sign-up-페이지-분석)
4. [Onboarding 페이지 분석](#4-onboarding-페이지-분석)
5. [After Auth 페이지 분석](#5-after-auth-페이지-분석)
6. [Clerk Theme 개선안](#6-clerk-theme-개선안)
7. [구현 우선순위](#7-구현-우선순위)
8. [체크리스트](#8-체크리스트)

---

## 1. 전체 평가 요약

### ✅ 잘 구현된 부분

1. **Clerk 통합**: Clerk을 활용한 인증 플로우는 적절하게 구현됨
2. **Onboarding UX**: 단계별 진행 표시, 키보드 네비게이션, 접근성 고려 등 우수한 UX 설계
3. **반응형 디자인**: Onboarding 페이지는 모바일/데스크탑 분기 처리가 잘 되어 있음

### ❌ 주요 문제점

#### 색상 시스템 위반 (중대)

- **하드코딩된 색상 값 다수 사용**
  - `#FCFCFD`, `#3BA2F8`, `#10B981` 등 직접 입력
  - UI/UX Guide에서 요구하는 의미론적 색상 토큰 미사용
  - 다크 모드 지원 불가능

```tsx
// ❌ 현재
<div style={{ backgroundColor: "#FCFCFD" }}>

// ✅ 개선안
<div className="bg-background">
```

#### 타이포그래피 불일치 (중대)

- **정의되지 않은 폰트 크기 사용**: `text-2xl` (제목 계층 불명확)
- **불규칙한 font-weight**: Clerk 테마에서 임의의 weight 값 사용
- **의미론적 HTML 태그 부재**: `<h1>`이 일반 `<div>`로 처리되는 경우

```tsx
// ❌ 현재
<div className="mb-8 text-center">
  <h1 className="text-2xl font-bold text-gray-900 mb-2">Searchify</h1>
  <p className="text-sm text-gray-600">AI 기반 콘텐츠 생성 플랫폼</p>
</div>

// ✅ 개선안
<div className="mb-8 text-center">
  <h1 className="text-4xl md:text-5xl font-medium leading-tight text-foreground">
    Searchify
  </h1>
  <p className="text-base text-muted-foreground leading-relaxed mt-4">
    AI 기반 콘텐츠 생성 플랫폼
  </p>
</div>
```

#### 간격 시스템 위반 (중간)

- **인라인 스타일로 spacing 적용**: `mb-8`, `mt-6` 등 일관되지 않은 간격
- **컨테이너 패딩 누락**: 일부 페이지에서 좌우 여백 부족

#### 애니메이션 부재 (중간)

- **상태 전환 애니메이션 없음**: Clerk 컴포넌트 및 Onboarding 단계 전환 시 애니메이션 미적용
- **호버 효과 불일치**: 버튼, 카드 등에서 일관되지 않은 호버 효과

#### 접근성 개선 필요 (중간)

- **Skip to content 링크 부재**: 키보드 사용자를 위한 바로가기 없음
- **Focus visible 스타일 불일치**: Clerk 테마에서 정의했으나 프로젝트 전체 규칙과 불일치
- **ARIA 레이블 보완 필요**: Onboarding 단계 표시기에 `aria-current` 누락

---

## 2. Sign-In 페이지 분석

### 2.1 현재 상태

**파일**: `/src/app/[locale]/(public)/sign-in/[[...sign-in]]/page.tsx`

```tsx
export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#FCFCFD" }}>
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Searchify</h1>
          <p className="text-sm text-gray-600">AI 기반 콘텐츠 생성 플랫폼</p>
        </div>
        <SignIn appearance={clerkAppearance} />
      </div>
    </div>
  );
}
```

### 2.2 UI/UX Guide 위반 사항

| 항목 | 위반 내용 | 심각도 |
|------|-----------|--------|
| **색상** | `#FCFCFD` 하드코딩, `text-gray-900`, `text-gray-600` 직접 사용 | 🔴 높음 |
| **타이포그래피** | `text-2xl` (h1에 부적합), `text-sm` (본문에 너무 작음) | 🔴 높음 |
| **간격** | `mb-8`, `mb-2` 불규칙, `px-4` 컨테이너 패딩 부족 | 🟡 중간 |
| **레이아웃** | `max-w-md` (448px)는 너무 좁음, Guide는 `max-w-7xl` 권장 | 🟡 중간 |
| **애니메이션** | 페이지 진입/전환 애니메이션 없음 | 🟡 중간 |
| **접근성** | Skip link 없음, 제목 계층 불명확 | 🟡 중간 |

### 2.3 구체적인 개선안

#### 색상 시스템 적용

```tsx
// ❌ Before
<div className="flex min-h-screen items-center justify-center"
     style={{ backgroundColor: "#FCFCFD" }}>

// ✅ After
<div className="flex min-h-screen items-center justify-center bg-background">
```

```tsx
// ❌ Before
<h1 className="text-2xl font-bold text-gray-900 mb-2">Searchify</h1>
<p className="text-sm text-gray-600">AI 기반 콘텐츠 생성 플랫폼</p>

// ✅ After
<h1 className="text-4xl md:text-5xl font-medium leading-tight text-foreground">
  Searchify
</h1>
<p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-4">
  AI 기반 콘텐츠 생성 플랫폼
</p>
```

#### 타이포그래피 & 간격 개선

```tsx
// ✅ 개선된 전체 코드
export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* Skip to content link */}
      <a
        href="#sign-in-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:rounded focus-visible:ring-2 focus-visible:ring-[#C46849]"
      >
        로그인 폼으로 바로가기
      </a>

      <div className="w-full max-w-md px-6 md:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-medium leading-tight text-foreground mb-4">
            Searchify
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            AI 기반 콘텐츠 생성 플랫폼
          </p>
        </div>

        {/* Clerk Sign-In Form */}
        <div id="sign-in-form">
          <SignIn appearance={clerkAppearance} />
        </div>
      </div>
    </div>
  );
}
```

#### 애니메이션 추가

```tsx
// framer-motion 적용 예시
"use client";

import { motion } from "framer-motion";
import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        className="w-full max-w-md px-6 md:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-12 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-medium leading-tight text-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Searchify
          </motion.h1>
          <motion.p
            className="text-base md:text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            AI 기반 콘텐츠 생성 플랫폼
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <SignIn appearance={clerkAppearance} />
        </motion.div>
      </motion.div>
    </div>
  );
}
```

---

## 3. Sign-Up 페이지 분석

### 3.1 현재 상태

**파일**: `/src/app/[locale]/(public)/sign-up/[[...sign-up]]/page.tsx`

Sign-In 페이지와 거의 동일한 구조로, **동일한 문제점을 공유**합니다.

### 3.2 UI/UX Guide 위반 사항

Sign-In 페이지와 동일 (섹션 2.2 참조)

### 3.3 구체적인 개선안

Sign-In 페이지의 개선안을 동일하게 적용하되, 다음 사항 추가:

```tsx
// ✅ Sign-Up 전용 메시징 추가
<div className="mb-12 text-center">
  <h1 className="text-4xl md:text-5xl font-medium leading-tight text-foreground mb-4">
    Searchify에 오신 것을 환영합니다
  </h1>
  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
    AI와 함께 콘텐츠를 만들어보세요
  </p>
</div>
```

#### 차별화 포인트

- **CTA 메시지**: Sign-Up은 환영 메시지 + 가치 제안 강조
- **Social Proof**: 필요시 "이미 10,000명이 사용 중" 등 통계 추가

---

## 4. Onboarding 페이지 분석

### 4.1 현재 상태

**파일**: `/src/features/onboarding/components/onboarding-wizard.tsx`

**강점**:
- ✅ 단계별 진행 표시 (`StepIndicator`)
- ✅ 키보드 네비게이션 (Alt + 화살표)
- ✅ 스크린 리더 지원 (`announceToScreenReader`)
- ✅ 반응형 레이아웃 (데스크탑 2열, 모바일 1열)
- ✅ 유효성 검사 및 단계별 validation

### 4.2 UI/UX Guide 위반 사항

| 항목 | 위반 내용 | 심각도 |
|------|-----------|--------|
| **색상** | `#FCFCFD`, `#3BA2F8`, `#10B981` 등 하드코딩 | 🔴 높음 |
| **타이포그래피** | Guide에 없는 불규칙한 간격 (`mb-8`, `mt-2`) | 🟡 중간 |
| **애니메이션** | 단계 전환 시 애니메이션 없음 | 🟡 중간 |
| **컴포넌트 스타일** | 인라인 스타일 과다 사용 (`style={{...}}`) | 🟡 중간 |
| **다크 모드** | 하드코딩된 색상으로 인해 다크 모드 불가능 | 🔴 높음 |

### 4.3 구체적인 개선안

#### 색상 시스템 적용

```tsx
// ❌ Before
<div
  className="min-h-screen py-8"
  style={{ backgroundColor: "#FCFCFD" }}
>

// ✅ After
<div className="min-h-screen py-16 md:py-24 bg-background">
```

```tsx
// ❌ Before
<Button
  style={{
    backgroundColor: "#3BA2F8",
    borderRadius: "8px",
  }}
>

// ✅ After (Button 컴포넌트에 variant 추가)
<Button variant="primary" className="rounded-lg">
  Next
</Button>
```

#### Tailwind Config에 Accent 색상 추가

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        accent: {
          primary: '#C46849',    // Hero CTA
          blue: '#3BA2F8',       // Onboarding buttons
          success: '#10B981',    // Success states
        },
      },
    },
  },
};
```

```tsx
// ✅ 개선된 버튼 스타일
<Button
  type="button"
  onClick={handleNext}
  className="bg-accent-blue hover:bg-accent-blue/90 transition-colors duration-100 rounded-lg"
>
  {t("button_next")}
  <ChevronRight className="ml-2 h-4 w-4" />
</Button>

<Button
  type="button"
  onClick={handleSubmit}
  className="bg-accent-success hover:bg-accent-success/90 transition-colors duration-100 rounded-lg"
>
  {t("button_complete")}
</Button>
```

#### 애니메이션 추가 (framer-motion)

```tsx
// ✅ 단계 전환 애니메이션
import { motion, AnimatePresence } from "framer-motion";

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -20 : 20,
    opacity: 0,
  }),
};

// 컴포넌트 내부
const [direction, setDirection] = useState(0);

const handleNext = useCallback(async () => {
  const isValid = await validateCurrentStep();
  if (isValid && currentStep < TOTAL_STEPS) {
    setDirection(1);
    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}, [currentStep, validateCurrentStep]);

const handlePrevious = useCallback(() => {
  if (currentStep > 1) {
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}, [currentStep]);

// 렌더링
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={stepVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    }}
  >
    {renderStep()}
  </motion.div>
</AnimatePresence>
```

#### 간격 시스템 정규화

```tsx
// ❌ Before
<div className="mb-8">
  <StepIndicator currentStep={currentStep} />
  <div className="mt-2 text-center">

// ✅ After
<div className="mb-12">
  <StepIndicator currentStep={currentStep} />
  <div className="mt-4 text-center">
```

```tsx
// ❌ Before
<div className="mt-8 flex items-center justify-between border-t pt-6">

// ✅ After
<div className="mt-12 flex items-center justify-between border-t border-border pt-8">
```

#### 카드 스타일 개선

```tsx
// ❌ Before
<div
  className="rounded-lg border p-6"
  style={{
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E5EA",
    borderRadius: "12px",
  }}
>

// ✅ After
<div className="rounded-xl border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
```

### 4.4 접근성 개선

#### StepIndicator에 aria-current 추가

```tsx
// StepIndicator 컴포넌트 개선
{steps.map((step, index) => (
  <div
    key={step}
    className={cn(
      "flex items-center",
      index < currentStep - 1 && "text-accent-success",
      index === currentStep - 1 && "text-accent-blue",
      index > currentStep - 1 && "text-muted-foreground"
    )}
    aria-current={index === currentStep - 1 ? "step" : undefined}
  >
    {/* step content */}
  </div>
))}
```

#### 키보드 힌트 스타일 개선

```tsx
// ❌ Before
<kbd
  className="rounded px-1.5 py-0.5"
  style={{
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
    border: "1px solid #E5E7EB"
  }}
>

// ✅ After
<kbd className="rounded px-1.5 py-0.5 bg-secondary text-muted-foreground border border-border font-mono text-xs">
  Alt
</kbd>
```

---

## 5. After Auth 페이지 분석

### 5.1 현재 상태

**파일**: `/src/app/[locale]/(public)/auth/after/page.tsx`

이 페이지는 **Server Component**로, 사용자를 온보딩 또는 대시보드로 리다이렉트하는 로직만 담당합니다.

### 5.2 UI/UX 개선안

현재는 리다이렉트만 수행하므로 **로딩 상태를 보여주는 UI**가 필요합니다.

#### 로딩 UI 추가

```tsx
// ✅ 개선안 (loading.tsx 추가)
// src/app/[locale]/(public)/auth/after/loading.tsx

export default function AfterAuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-6 inline-block h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent-blue" />
        <p className="text-base text-muted-foreground">
          로그인 정보를 확인하는 중...
        </p>
      </div>
    </div>
  );
}
```

#### 에러 핸들링 UI 추가

```tsx
// src/app/[locale]/(public)/auth/after/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AfterAuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("After auth error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md text-center px-6">
        <h1 className="text-3xl md:text-4xl font-medium leading-tight text-foreground mb-4">
          로그인 중 오류가 발생했습니다
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-8">
          잠시 후 다시 시도해주세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => reset()}
            variant="outline"
            className="rounded-lg"
          >
            다시 시도
          </Button>
          <Button
            onClick={() => window.location.href = "/sign-in"}
            className="bg-accent-blue hover:bg-accent-blue/90 rounded-lg"
          >
            로그인 페이지로
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Clerk Theme 개선안

### 6.1 현재 상태 분석

**파일**: `/src/lib/clerk-theme.ts`

**주요 문제점**:

1. **색상 하드코딩**: `#3BA2F8`, `#FCFCFD` 등 직접 입력
2. **UI/UX Guide와 불일치**: Accent Primary는 `#C46849`이어야 하나 `#3BA2F8` 사용
3. **다크 모드 미지원**: 하드코딩된 색상 값으로 테마 전환 불가능
4. **타이포그래피 불일치**: `fontWeight` 값이 Guide와 다름

### 6.2 개선된 Clerk Theme

```typescript
// ✅ src/lib/clerk-theme.ts (개선안)
import type { Appearance } from "@clerk/types";

/**
 * Clerk 테마 설정
 *
 * UI/UX Design Guide에 따라:
 * - 의미론적 색상 토큰 사용 (CSS 변수 기반)
 * - 다크 모드 지원
 * - 일관된 타이포그래피
 * - 접근성 준수 (WCAG 2.1 AA)
 */
export const clerkAppearance: Appearance = {
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "iconButton",
  },

  variables: {
    // Colors - CSS 변수 기반 (다크 모드 자동 지원)
    colorPrimary: "hsl(var(--accent-blue))",           // #3BA2F8
    colorBackground: "hsl(var(--background))",         // slate-50 / slate-950
    colorText: "hsl(var(--foreground))",               // slate-950 / slate-50
    colorTextSecondary: "hsl(var(--muted-foreground))", // slate-600 / slate-400
    colorInputBackground: "hsl(var(--background))",
    colorInputText: "hsl(var(--foreground))",
    colorDanger: "hsl(var(--error))",                  // #df6666

    // Border
    borderRadius: "0.5rem",  // 8px - Guide 기준

    // Typography
    fontFamily: "'Pretendard Variable', system-ui, -apple-system, sans-serif",
    fontWeight: {
      normal: 400,
      medium: 500,   // Guide: 500
      semibold: 500, // Guide에서는 medium이 표준
      bold: 600,     // Guide: 600 (medium for headings)
    },
  },

  elements: {
    // Root container
    rootBox: {
      width: "100%",
      maxWidth: "28rem", // 448px (max-w-md와 동일, Guide 허용 범위)
    },

    // Card - Guide의 Card 패턴 적용
    card: {
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.75rem", // 12px - 큰 카드용
      boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // shadow-sm
      padding: "2rem 1.5rem", // 32px 24px
      transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    },

    // Header
    headerTitle: {
      fontSize: "1.5rem",     // 24px (text-2xl)
      fontWeight: 500,        // medium
      color: "hsl(var(--foreground))",
      letterSpacing: "-0.025em",
      lineHeight: 1.25,       // leading-tight
    },
    headerSubtitle: {
      fontSize: "0.875rem",   // 14px (text-sm)
      fontWeight: 400,
      color: "hsl(var(--muted-foreground))",
      marginTop: "0.5rem",
      lineHeight: 1.625,      // leading-relaxed
    },

    // Social buttons
    socialButtonsBlockButton: {
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.5rem", // 8px
      transition: "all 100ms cubic-bezier(0.4, 0, 0.2, 1)", // Guide: 100ms for buttons
      "&:hover": {
        backgroundColor: "hsl(var(--secondary))",
      },
      "&:focus-visible": {
        outline: "none",
        ring: "2px solid hsl(var(--accent-primary))",
        ringOffset: "2px",
      },
    },

    // Form elements
    formFieldLabel: {
      fontSize: "0.875rem",   // 14px (text-sm)
      fontWeight: 500,        // medium
      color: "hsl(var(--foreground))",
      marginBottom: "0.5rem",
    },
    formFieldInput: {
      height: "2.5rem",       // 40px
      padding: "0.75rem 1rem", // 12px 16px
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.375rem", // 6px
      fontSize: "1rem",       // 16px (text-base)
      backgroundColor: "hsl(var(--background))",
      color: "hsl(var(--foreground))",
      transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)", // Guide: 200ms for inputs
      "&:focus": {
        borderColor: "hsl(var(--accent-blue))",
        boxShadow: "0 0 0 3px hsl(var(--accent-blue) / 0.1)",
        outline: "none",
      },
      "&::placeholder": {
        color: "hsl(var(--muted-foreground))",
      },
    },
    formFieldInputShowPasswordButton: {
      color: "hsl(var(--muted-foreground))",
      transition: "color 100ms cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        color: "hsl(var(--foreground))",
      },
    },

    // Buttons - Guide 기준
    formButtonPrimary: {
      height: "3rem",         // 48px (lg size)
      backgroundColor: "hsl(var(--accent-blue))",
      borderRadius: "0.5rem", // 8px
      fontSize: "1rem",       // 16px
      fontWeight: 500,        // medium
      padding: "0 1.5rem",    // 0 24px
      transition: "all 100ms cubic-bezier(0.4, 0, 0.2, 1)", // Guide: 100ms for buttons
      "&:hover": {
        opacity: 0.9,
      },
      "&:active": {
        transform: "scale(0.95)",
      },
      "&:focus-visible": {
        outline: "none",
        ring: "2px solid hsl(var(--accent-blue))",
        ringOffset: "2px",
      },
    },

    // Footer
    footer: {
      marginTop: "1.5rem", // 24px
    },
    footerActionLink: {
      color: "hsl(var(--accent-blue))",
      fontWeight: 500,
      transition: "color 100ms cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        opacity: 0.9,
      },
      "&:focus-visible": {
        outline: "none",
        ring: "2px solid hsl(var(--accent-blue))",
        ringOffset: "2px",
        borderRadius: "0.25rem",
      },
    },

    // Divider
    dividerLine: {
      backgroundColor: "hsl(var(--border))",
    },
    dividerText: {
      color: "hsl(var(--muted-foreground))",
      fontSize: "0.875rem", // 14px
    },

    // Alert
    alertText: {
      fontSize: "0.875rem", // 14px
      lineHeight: 1.625,    // leading-relaxed
    },

    // Identifier
    identityPreviewText: {
      fontSize: "0.875rem", // 14px
      fontWeight: 500,
    },

    // Links
    formFieldAction: {
      color: "hsl(var(--accent-blue))",
      fontSize: "0.875rem", // 14px
      fontWeight: 500,
      transition: "color 100ms cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        opacity: 0.9,
      },
      "&:focus-visible": {
        outline: "none",
        ring: "2px solid hsl(var(--accent-blue))",
        borderRadius: "0.25rem",
      },
    },
  },
};
```

### 6.3 CSS 변수 추가 필요

`globals.css`에 다음 변수를 추가해야 합니다:

```css
/* src/app/globals.css */
@layer base {
  :root {
    /* 기존 색상 */
    --background: 210 40% 98%;        /* slate-50 */
    --foreground: 222.2 84% 4.9%;     /* slate-950 */
    --border: 214.3 31.8% 91.4%;      /* slate-300 */
    --muted-foreground: 215.4 16.3% 46.9%; /* slate-600 */
    --secondary: 210 40% 96.1%;       /* slate-100 */

    /* Accent 색상 추가 */
    --accent-primary: 15 56% 53%;     /* #C46849 */
    --accent-blue: 205 98% 61%;       /* #3BA2F8 */
    --accent-success: 142 71% 45%;    /* #10B981 */
    --error: 0 65% 64%;               /* #df6666 */
  }

  .dark {
    --background: 222.2 84% 4.9%;     /* slate-950 */
    --foreground: 210 40% 98%;        /* slate-50 */
    --border: 215 27.9% 16.9%;        /* slate-600 */
    --muted-foreground: 217.9 10.6% 64.9%; /* slate-400 */
    --secondary: 217.2 32.6% 17.5%;   /* slate-900 */

    /* Accent 색상 (다크 모드에서 약간 밝게) */
    --accent-primary: 15 56% 60%;     /* 밝은 톤 */
    --accent-blue: 205 98% 65%;
    --accent-success: 142 71% 50%;
    --error: 0 65% 70%;
  }
}
```

---

## 7. 구현 우선순위

### Phase 1: 긴급 (즉시 수정 필요) 🔴

1. **색상 시스템 통합**
   - `globals.css`에 CSS 변수 추가 (`--accent-blue`, `--accent-success`, `--error`)
   - 모든 하드코딩 색상을 Tailwind 클래스로 변경
   - Clerk 테마를 CSS 변수 기반으로 재작성

2. **다크 모드 지원**
   - 모든 인라인 `style={{}}` 제거
   - `bg-background`, `text-foreground` 등 의미론적 토큰 사용

### Phase 2: 중요 (1주일 내) 🟡

3. **타이포그래피 정규화**
   - Sign-In/Sign-Up 페이지 제목을 `text-4xl md:text-5xl`로 변경
   - 본문 텍스트를 `text-base` 이상으로 변경

4. **간격 시스템 정규화**
   - 모든 `mb-8`, `mt-2` 등을 Guide 기준 스케일로 변경
   - 컨테이너 패딩을 `px-6 md:px-8`로 통일

5. **접근성 개선**
   - Skip to content 링크 추가
   - `focus-visible:ring-2` 스타일 일관되게 적용
   - StepIndicator에 `aria-current` 추가

### Phase 3: 권장 (2주일 내) 🟢

6. **애니메이션 추가**
   - Sign-In/Sign-Up 페이지 진입 애니메이션 (framer-motion)
   - Onboarding 단계 전환 애니메이션

7. **로딩/에러 UI 추가**
   - After Auth 페이지에 `loading.tsx`, `error.tsx` 추가

8. **컴포넌트 리팩토링**
   - AuthPageLayout 공통 컴포넌트 추출
   - Button variant에 `accent-blue`, `accent-success` 추가

---

## 8. 체크리스트

### 색상 & 테마
- [ ] `globals.css`에 `--accent-blue`, `--accent-success`, `--error` CSS 변수 추가
- [ ] Sign-In/Sign-Up 페이지의 모든 하드코딩 색상 제거 (`#FCFCFD`, `#111827`, etc.)
- [ ] Onboarding 페이지의 모든 `style={{backgroundColor: '...'}}` 제거
- [ ] Clerk 테마를 `hsl(var(--...))` 기반으로 재작성
- [ ] 다크 모드에서 모든 페이지 정상 작동 확인

### 타이포그래피
- [ ] Sign-In/Sign-Up 제목을 `text-4xl md:text-5xl font-medium` 으로 변경
- [ ] 부제목을 `text-base md:text-lg leading-relaxed`로 변경
- [ ] 모든 본문 텍스트 `text-sm` → `text-base` 변경
- [ ] Clerk 테마의 `headerTitle`을 `1.5rem`, `fontWeight: 500`으로 설정

### 간격 & 레이아웃
- [ ] 컨테이너 패딩을 `px-6 md:px-8`로 통일
- [ ] 제목-본문 간격을 `mb-4` (16px)로 통일
- [ ] 섹션 간 간격을 `mb-12` (48px)로 통일
- [ ] Onboarding 버튼 영역 상단 간격을 `mt-12 pt-8`로 변경

### 애니메이션
- [ ] Sign-In/Sign-Up 페이지 진입 애니메이션 추가 (fade in + slide up)
- [ ] Onboarding 단계 전환 애니메이션 추가 (AnimatePresence)
- [ ] 모든 버튼에 `transition-all duration-100 ease-in-out` 추가
- [ ] 카드 호버 효과: `hover:shadow-md transition-shadow duration-300`

### 접근성
- [ ] Sign-In/Sign-Up 페이지에 Skip to content 링크 추가
- [ ] 모든 버튼에 `focus-visible:ring-2 focus-visible:ring-[#C46849]` 추가
- [ ] StepIndicator에 `aria-current="step"` 추가
- [ ] 키보드 힌트 `<kbd>` 태그에 `font-mono` 추가
- [ ] 색상 대비 4.5:1 이상 확보 (현재 클리어)

### 반응형
- [ ] 모든 페이지에서 375px, 768px, 1024px 브레이크포인트 테스트
- [ ] 모바일에서 버튼 높이 `h-12` (터치 최적화)
- [ ] Onboarding 데스크탑 2열 / 모바일 1열 레이아웃 정상 작동 확인

### 성능
- [ ] 불필요한 리렌더링 방지 (`useCallback`, `useMemo` 적용 확인)
- [ ] 애니메이션은 `transform`/`opacity`만 사용 (레이아웃 리플로우 방지)
- [ ] `prefers-reduced-motion` 미디어 쿼리 대응 추가

### 기타
- [ ] After Auth 페이지에 `loading.tsx` 추가
- [ ] After Auth 페이지에 `error.tsx` 추가
- [ ] AuthPageLayout 공통 컴포넌트 추출 (선택 사항)
- [ ] Button 컴포넌트에 `variant="accent-blue"`, `variant="accent-success"` 추가

---

## 부록: 공통 컴포넌트 제안

### AuthPageLayout

Sign-In/Sign-Up 페이지의 중복 코드를 줄이기 위한 레이아웃 컴포넌트:

```tsx
// src/features/auth/components/auth-page-layout.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AuthPageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthPageLayout({ title, subtitle, children }: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* Skip to content link */}
      <a
        href="#auth-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2"
      >
        인증 폼으로 바로가기
      </a>

      <motion.div
        className="w-full max-w-md px-6 md:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-medium leading-tight text-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="text-base md:text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Auth Form */}
        <motion.div
          id="auth-form"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
```

#### 사용 예시

```tsx
// src/app/[locale]/(public)/sign-in/[[...sign-in]]/page.tsx
"use client";

import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";

export default function SignInPage() {
  return (
    <AuthPageLayout
      title="Searchify"
      subtitle="AI 기반 콘텐츠 생성 플랫폼"
    >
      <SignIn appearance={clerkAppearance} />
    </AuthPageLayout>
  );
}
```

---

**마지막 업데이트**: 2025-11-17
**작성자**: AI Development Team
**리뷰 필요 항목**:
- Accent 색상 전략 (`#C46849` vs `#3BA2F8` 용도 구분)
- Button 컴포넌트 variant 확장 방식
- Clerk 테마의 CSS 변수 적용 가능 여부 (Clerk API 제약 확인 필요)
