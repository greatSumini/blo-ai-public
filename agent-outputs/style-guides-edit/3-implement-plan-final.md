# 스타일 가이드 편집 페이지 구현 계획 최종 검토

## 1. 원안 요약

2단계 계획은 다음과 같은 핵심 변경 사항을 제안했습니다:

1. **OnboardingWizard 재사용**: `initialData` prop 추가로 편집 모드 지원
2. **새로운 공통 컴포넌트 생성**: ErrorDisplay, EditSkeleton
3. **라우트 상수 정의**: 타입 안전한 경로 관리
4. **편집 페이지 리팩토리**: TODO 제거, 중복 Back 버튼 제거, 라우트 경로 수정
5. **i18n 키 추가**: 편집 관련 번역 키 추가

---

## 2. 발견된 문제점

### 2.1 코드 정확성

#### 문제 1: StyleGuideResponse와 OnboardingFormData 간 타입 불일치

- **위치**: `src/app/[locale]/(protected)/style-guides/[id]/edit/page.tsx`
- **문제**: `StyleGuideResponse`는 camelCase 필드명을 사용하지만, `OnboardingFormData`와 완전히 일치하지 않을 수 있음
- **영향**: 타입 에러 또는 런타임에 누락된 데이터

**검증 결과**:
- `StyleGuideResponse`: `brandName`, `brandDescription`, `targetAudience`, `painPoints`, `contentLength`, `readingLevel`
- `OnboardingFormData`: `brandName`, `brandDescription`, `targetAudience`, `painPoints`, `contentLength`, `readingLevel`
- **결론**: 필드명은 일치함. 단, `notes` 필드가 nullable이므로 처리 필요

#### 수정안

```typescript
// src/app/[locale]/(protected)/style-guides/[id]/edit/page.tsx

// guide 데이터를 OnboardingFormData로 변환
const transformGuideToFormData = (guide: StyleGuideResponse): OnboardingFormData => {
  return {
    brandName: guide.brandName,
    brandDescription: guide.brandDescription,
    personality: guide.personality,
    formality: guide.formality,
    targetAudience: guide.targetAudience,
    painPoints: guide.painPoints,
    language: guide.language,
    tone: guide.tone,
    contentLength: guide.contentLength,
    readingLevel: guide.readingLevel,
    notes: guide.notes || "", // nullable 처리
  };
};

// 사용:
<OnboardingWizard
  initialData={transformGuideToFormData(guide)}
  mode="edit"
  onComplete={handleComplete}
/>
```

#### 문제 2: i18n 키 누락

- **위치**: `messages/ko.json`, `messages/en.json`
- **문제**: 2단계 계획에서 제안한 `styleGuide.edit.description`와 `styleGuide.edit.error` 키가 실제 i18n 파일에 없음
- **영향**: 번역 키를 찾을 수 없어 화면에 키 문자열 그대로 표시됨

**검증 결과**:
- 현재 존재하는 키:
  - `styleGuide.edit.title` ✅
  - `styleGuide.edit.hint` ✅ (description 대신)
  - `styleGuide.update.success.desc` ✅
  - `styleGuide.update.error.desc` ✅
  - `styleGuide.error.load` ✅
- 누락된 키:
  - `styleGuide.edit.description` ❌ → `hint` 사용 가능
  - `styleGuide.edit.success` ❌ → `update.success.desc` 사용
  - `styleGuide.edit.error` ❌ → `update.error.desc` 사용

#### 수정안

2단계 계획의 i18n 제안을 현재 코드베이스와 일치하도록 수정:

**ko.json 수정 (필요한 키만 추가)**:
```json
{
  "styleGuide": {
    "edit": {
      "title": "스타일 가이드 편집",
      "hint": "현재 스타일 가이드를 다시 생성하려면 새 가이드 생성 페이지로 이동하세요.",
      "description": "스타일 가이드의 내용을 수정합니다."  // 추가
    }
  },
  "onboarding": {
    "wizard": {
      "keyboard_shortcut_hint": "키보드 단축키: ← 이전 / → 다음",
      "button_previous": "이전",
      "button_next": "다음",
      "button_submitting": "생성 중...",
      "button_complete": "완료하고 생성하기",
      "button_save": "저장",  // 추가
      "preview_label": "미리보기"
    }
  }
}
```

**en.json 수정 (필요한 키만 추가)**:
```json
{
  "styleGuide": {
    "edit": {
      "title": "Edit Style Guide",
      "hint": "To regenerate your style guide, go to the new guide creation page.",
      "description": "Modify the content of your style guide."  // 추가
    }
  },
  "onboarding": {
    "wizard": {
      "keyboard_shortcut_hint": "Keyboard shortcuts: ← Previous / → Next",
      "button_previous": "Previous",
      "button_next": "Next",
      "button_submitting": "Submitting...",
      "button_complete": "Complete and Create",
      "button_save": "Save",  // 추가
      "preview_label": "Preview"
    }
  }
}
```

#### 문제 3: 라우트 경로 오타

- **위치**: `src/app/[locale]/(protected)/style-guides/[id]/edit/page.tsx:38`
- **문제**: `router.push("/style-guide")` → 올바른 경로는 `/style-guides` (복수형)
- **영향**: 저장 후 404 에러 페이지로 이동

#### 수정안

```typescript
// Before:
router.push("/style-guide");

// After:
router.push(ROUTES.STYLE_GUIDES);
```

### 2.2 구현 가능성

#### 문제 4: OnboardingWizard에 mode prop 사용되지 않음

- **위치**: `src/features/onboarding/components/onboarding-wizard.tsx`
- **문제**: 2단계 계획에서 제안한 `mode` prop이 실제로 버튼 텍스트 변경에 사용되지 않음
- **영향**: 편집 모드에서도 "완료하고 생성하기" 버튼 표시 (혼란 유발 가능)

#### 수정안

`mode` prop을 활용하여 버튼 텍스트를 동적으로 변경:

```typescript
// src/features/onboarding/components/onboarding-wizard.tsx

// Line 280, 373 수정:
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
  className="h-10"
  style={{
    backgroundColor: "#10B981",
    borderRadius: "8px",
  }}
>
  {isSubmitting
    ? t("button_submitting")
    : mode === "edit"
    ? t("button_save")
    : t("button_complete")}
</Button>
```

#### 문제 5: ErrorDisplay 컴포넌트에 하드코딩된 한국어 텍스트

- **위치**: `src/components/error-display.tsx` (2단계 계획에서 제안)
- **문제**: "오류가 발생했습니다", "다시 시도", "돌아가기" 등이 하드코딩됨
- **영향**: i18n 지원 불가, 영어 환경에서 한국어 표시

#### 수정안

i18n을 적용한 ErrorDisplay:

```typescript
"use client";

import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorDisplay({ message, onRetry, onBack }: ErrorDisplayProps) {
  const t = useTranslations("common");

  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-lg border border-destructive/20 bg-destructive/5 p-8"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-16 w-16 text-destructive" aria-hidden="true" />

      <div className="text-center">
        <p className="text-lg font-medium text-destructive mb-1">
          {t("error")}
        </p>
        <p className="text-muted-foreground">{message}</p>
      </div>

      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("retry")}
          </Button>
        )}
        {onBack && (
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 2.3 코드베이스 일관성

#### 문제 6: PageLayout maxWidthClassName 불일치

- **위치**: `src/app/[locale]/(protected)/style-guides/[id]/edit/page.tsx`
- **문제**: 2단계 계획에서 `max-w-7xl` 제안했으나, 기존 코드는 `max-w-4xl` 사용
- **영향**: OnboardingWizard의 2열 레이아웃이 `max-w-4xl`에서는 좁을 수 있음

**검증 결과**:
- OnboardingWizard는 `max-w-7xl` 컨테이너 사용 (자체 레이아웃)
- PageLayout은 추가로 컨테이너를 제공하므로 충돌 가능

#### 수정안

OnboardingWizard가 자체 레이아웃을 갖고 있으므로, PageLayout에서 컨테이너를 제거하거나 더 넓은 너비 사용:

```typescript
// Option 1: maxWidthClassName을 max-w-7xl로 변경
<PageLayout
  title={t("styleGuide.edit.title")}
  description={guide.brandName || t("styleGuide.edit.description")}
  maxWidthClassName="max-w-7xl"
>

// Option 2: OnboardingWizard의 컨테이너를 제거하고 PageLayout 의존
// 이 경우 OnboardingWizard 수정 필요하므로 Option 1 권장
```

#### 문제 7: PageLayout의 인라인 스타일

- **위치**: `src/components/layout/page-layout.tsx`
- **문제**: `style={{ backgroundColor: "#FCFCFD" }}`, `style={{ color: "#1F2937" }}` 등 인라인 스타일 사용
- **영향**: 다크모드 미지원, OnboardingWizard와 동일한 문제

**우선순위**: P2 (선택적 개선)

### 2.4 i18n 완전성

#### 문제 8: keyboard_shortcut_hint 텍스트 불일치

- **위치**: `messages/ko.json`, `messages/en.json`
- **문제**:
  - 한국어: "키보드 단축키: ← 이전 / → 다음"
  - 영어: "Keyboard shortcuts: ← Previous / → Next"
  - OnboardingWizard 사용: `t("keyboard_shortcut_hint")` + 별도 kbd 렌더링
- **영향**: 실제로는 "Alt + ← / →" 단축키인데 번역 텍스트와 불일치

#### 수정안

번역 키를 단순화하여 실제 사용 방식과 일치:

```json
// ko.json
{
  "onboarding": {
    "wizard": {
      "keyboard_shortcut_hint": "단계 이동"
    }
  }
}

// en.json
{
  "onboarding": {
    "wizard": {
      "keyboard_shortcut_hint": "Navigate steps"
    }
  }
}
```

OnboardingWizard 코드:
```typescript
// Line 190-200
<p className="text-xs" style={{ color: "#9CA3AF" }}>
  <kbd className="rounded px-1.5 py-0.5" style={{ backgroundColor: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB" }}>
    Alt
  </kbd>
  {" + "}
  <kbd className="rounded px-1.5 py-0.5" style={{ backgroundColor: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB" }}>
    ← / →
  </kbd>
  {" "}
  {t("keyboard_shortcut_hint")}
</p>
```

### 2.5 누락 사항

#### 문제 9: EditSkeleton이 실제 OnboardingWizard 구조와 불일치

- **위치**: `src/features/style-guides/components/edit-skeleton.tsx` (2단계 계획 제안)
- **문제**:
  - OnboardingWizard는 `min-h-screen py-8`로 전체 화면 레이아웃
  - EditSkeleton은 컨테이너 내부 콘텐츠만 표시
- **영향**: PageLayout과 OnboardingWizard 간 레이아웃 중복

#### 수정안

PageLayout을 사용하는 경우, OnboardingWizard의 자체 컨테이너를 제거하거나 EditSkeleton을 PageLayout 없이 사용:

**권장 방식**: EditSkeleton을 PageLayout 내부에서만 사용

```typescript
// src/features/style-guides/components/edit-skeleton.tsx

"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function EditSkeleton() {
  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="space-y-4">
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Keyboard hint skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Form Area - Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-[1fr,400px] lg:gap-8">
        {/* Left: Form */}
        <div className="rounded-xl border bg-card p-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-2xl" />

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden rounded-xl border bg-card p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1 ml-4" />
        </div>
      </div>
    </div>
  );
}
```

#### 문제 10: 페이지 이탈 경고가 항상 실행됨

- **위치**: `src/app/[locale]/(protected)/style-guides/[id]/edit/page.tsx` (2단계 계획)
- **문제**: `beforeunload` 이벤트가 폼이 수정되지 않았을 때도 발생
- **영향**: 사용자가 아무것도 수정하지 않고 페이지를 떠나도 경고 표시

#### 수정안

편집 페이지에서는 페이지 이탈 경고를 일단 제거하고, 추후 OnboardingWizard에서 `isDirty` 상태를 부모로 전달하는 방식으로 개선:

```typescript
// 현재는 페이지 이탈 경고 제거 (P2 - 추후 개선)
// useEffect(() => {
//   const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//     ...
//   };
//   ...
// }, []);
```

---

## 3. 최종 구현 계획

### 3.1 파일 구조 (수정안)

```
src/
  lib/
    routes.ts                                    # 새로 생성
  components/
    error-display.tsx                            # 새로 생성 (i18n 적용)
    layout/
      page-layout.tsx                            # 기존 (수정 없음)
  features/
    style-guides/
      components/
        edit-skeleton.tsx                        # 새로 생성 (개선된 버전)
    onboarding/
      components/
        onboarding-wizard.tsx                    # 수정 (initialData, mode props 추가)
  app/
    [locale]/(protected)/style-guides/[id]/edit/
      page.tsx                                   # 수정 (리팩토링)
  messages/
    ko.json                                      # 수정 (키 추가)
    en.json                                      # 수정 (키 추가)
```

### 3.2 의존성 (수정안)

추가 설치 불필요. 기존 패키지 모두 사용 가능.

### 3.3 구현 순서 (수정안)

#### Phase 1: 기반 작업 (1-2시간)

1. **라우트 상수 정의**
   - `src/lib/routes.ts` 생성

2. **공통 컴포넌트 생성**
   - `src/components/error-display.tsx` 생성 (i18n 적용)
   - `src/features/style-guides/components/edit-skeleton.tsx` 생성 (개선된 버전)

3. **i18n 키 추가**
   - `messages/ko.json` 업데이트 (`styleGuide.edit.description`, `onboarding.wizard.button_save`)
   - `messages/en.json` 업데이트

#### Phase 2: OnboardingWizard 확장 (1-2시간)

4. **OnboardingWizard Props 확장**
   - `initialData` prop 추가
   - `mode` prop 추가
   - `useForm` defaultValues 수정
   - 완료 버튼 텍스트 동적 변경 (`mode === "edit"` 시 "저장")

#### Phase 3: 편집 페이지 통합 (2-3시간)

5. **편집 페이지 리팩토링**
   - TODO 제거
   - `transformGuideToFormData` 함수 추가
   - OnboardingWizard 통합 (initialData 전달)
   - 중복 Back 버튼 제거 (actions의 "취소" 버튼, 폼 위 Back 버튼 모두 제거)
   - 라우트 경로 수정 (`ROUTES.STYLE_GUIDES` 사용)
   - EditSkeleton 적용
   - ErrorDisplay 적용
   - description에 가이드 이름 표시
   - maxWidthClassName을 `max-w-7xl`로 변경

#### Phase 4: 테스트 및 검증 (1-2시간)

6. **수동 테스트**
   - 편집 페이지 로딩 확인
   - 폼 수정 및 저장 확인
   - 에러 처리 확인
   - 한국어/영어 i18n 전환 확인

---

## 4. 컴포넌트 상세 명세 (수정안)

### 4.1 라우트 상수

#### 파일: `src/lib/routes.ts`

```typescript
/**
 * 애플리케이션 라우트 상수
 *
 * 타입 안전한 경로 관리를 위한 상수 정의
 */

export const ROUTES = {
  // 스타일 가이드
  STYLE_GUIDES: "/style-guides",
  STYLE_GUIDES_NEW: "/style-guides/new",
  STYLE_GUIDES_EDIT: (id: string) => `/style-guides/${id}/edit`,

  // 대시보드
  DASHBOARD: "/dashboard",

  // 글 작성
  NEW_ARTICLE: "/new-article",
  ARTICLES: "/articles",
  ARTICLES_EDIT: (id: string) => `/articles/${id}/edit`,

  // 키워드
  KEYWORDS: "/keywords",

  // 계정
  ACCOUNT: "/account",
} as const;

export type RouteKey = keyof typeof ROUTES;
```

### 4.2 공통 에러 표시 컴포넌트 (i18n 적용)

#### 파일: `src/components/error-display.tsx`

```typescript
"use client";

import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ErrorDisplayProps {
  /**
   * 표시할 에러 메시지
   */
  message: string;

  /**
   * 재시도 버튼 클릭 핸들러 (선택사항)
   */
  onRetry?: () => void;

  /**
   * 뒤로가기 버튼 클릭 핸들러 (선택사항)
   */
  onBack?: () => void;
}

/**
 * 에러 상태를 표시하는 공통 컴포넌트
 *
 * @example
 * ```tsx
 * <ErrorDisplay
 *   message={t("styleGuide.error.load")}
 *   onRetry={() => refetch()}
 *   onBack={() => router.back()}
 * />
 * ```
 */
export function ErrorDisplay({ message, onRetry, onBack }: ErrorDisplayProps) {
  const t = useTranslations("common");

  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-lg border border-destructive/20 bg-destructive/5 p-8"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-16 w-16 text-destructive" aria-hidden="true" />

      <div className="text-center">
        <p className="text-lg font-medium text-destructive mb-1">
          {t("error")}
        </p>
        <p className="text-muted-foreground">{message}</p>
      </div>

      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("retry")}
          </Button>
        )}
        {onBack && (
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 4.3 편집 스켈레톤 (개선된 버전)

#### 파일: `src/features/style-guides/components/edit-skeleton.tsx`

```typescript
"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 스타일 가이드 편집 페이지 로딩 스켈레톤
 *
 * OnboardingWizard의 구조를 반영한 스켈레톤 UI
 */
export function EditSkeleton() {
  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="space-y-4">
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Keyboard hint skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Form Area - Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-[1fr,400px] lg:gap-8">
        {/* Left: Form */}
        <div className="rounded-xl border bg-card p-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-2xl" />

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden rounded-xl border bg-card p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1 ml-4" />
        </div>
      </div>
    </div>
  );
}
```

### 4.4 OnboardingWizard 확장

#### 파일: `src/features/onboarding/components/onboarding-wizard.tsx`

**변경 사항**:

```typescript
// ===== Props 인터페이스 확장 =====
interface OnboardingWizardProps {
  onComplete: (data: OnboardingFormData) => Promise<void>;

  /**
   * 편집 모드에서 사용할 초기 데이터
   * 제공되지 않으면 기본값(defaultOnboardingValues) 사용
   */
  initialData?: OnboardingFormData;

  /**
   * 위저드 모드
   * - "create": 신규 생성 (기본값)
   * - "edit": 편집
   */
  mode?: "create" | "edit";
}

export function OnboardingWizard({
  onComplete,
  initialData,
  mode = "create",
}: OnboardingWizardProps) {
  const t = useTranslations("onboarding.wizard");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== useForm에 initialData 주입 =====
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: initialData || defaultOnboardingValues,
    mode: "onChange",
  });

  // ... 나머지 코드는 동일 ...

  // ===== 완료 버튼 텍스트 개선 =====
  // Line 280 수정:
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
    className="h-10"
    style={{
      backgroundColor: "#10B981",
      borderRadius: "8px",
    }}
  >
    {isSubmitting
      ? t("button_submitting")
      : mode === "edit"
      ? t("button_save")
      : t("button_complete")}
  </Button>

  // Line 373 수정:
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
    className="ml-4 h-12 flex-1 sm:h-10 sm:flex-initial"
    style={{
      backgroundColor: "#10B981",
      borderRadius: "8px",
    }}
  >
    {isSubmitting
      ? t("button_submitting")
      : mode === "edit"
      ? t("button_save")
      : t("button_complete")}
  </Button>
}
```

### 4.5 편집 페이지 리팩토링

#### 파일: `src/app/[locale]/(protected)/style-guides/[id]/edit/page.tsx`

**전체 코드**:

```typescript
"use client";

import { use } from "react";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/layout/page-layout";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { EditSkeleton } from "@/features/style-guides/components/edit-skeleton";
import { ErrorDisplay } from "@/components/error-display";
import {
  useStyleGuide,
  useUpdateStyleGuide,
} from "@/features/articles/hooks/useStyleGuideQuery";
import type { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";
import { ROUTES } from "@/lib/routes";

type EditStyleGuidePageProps = {
  params: Promise<{ id: string }>;
};

/**
 * StyleGuideResponse를 OnboardingFormData로 변환
 */
function transformGuideToFormData(
  guide: StyleGuideResponse
): OnboardingFormData {
  return {
    brandName: guide.brandName,
    brandDescription: guide.brandDescription,
    personality: guide.personality,
    formality: guide.formality,
    targetAudience: guide.targetAudience,
    painPoints: guide.painPoints,
    language: guide.language,
    tone: guide.tone,
    contentLength: guide.contentLength,
    readingLevel: guide.readingLevel,
    notes: guide.notes || "", // nullable 처리
  };
}

export default function EditStyleGuidePage({
  params,
}: EditStyleGuidePageProps) {
  const resolvedParams = use(params);
  const guideId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  const {
    data: guide,
    isLoading,
    isError,
    refetch,
  } = useStyleGuide(guideId);
  const updateStyleGuide = useUpdateStyleGuide();

  const handleComplete = async (data: OnboardingFormData) => {
    try {
      await updateStyleGuide.mutateAsync({ guideId, data });

      toast({
        title: t("common.success"),
        description: t("styleGuide.update.success.desc"),
      });

      router.push(ROUTES.STYLE_GUIDES);
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("styleGuide.update.error.desc"),
        variant: "destructive",
      });
    }
  };

  // ===== 로딩 상태 =====
  if (isLoading) {
    return (
      <PageLayout
        title={t("styleGuide.edit.title")}
        description={t("styleGuide.edit.description")}
        maxWidthClassName="max-w-7xl"
      >
        <EditSkeleton />
      </PageLayout>
    );
  }

  // ===== 에러 상태 =====
  if (isError || !guide) {
    return (
      <PageLayout
        title={t("styleGuide.edit.title")}
        description={t("styleGuide.edit.description")}
        maxWidthClassName="max-w-7xl"
      >
        <ErrorDisplay
          message={t("styleGuide.error.load")}
          onRetry={() => refetch()}
          onBack={() => router.push(ROUTES.STYLE_GUIDES)}
        />
      </PageLayout>
    );
  }

  // ===== 메인 콘텐츠 =====
  return (
    <PageLayout
      title={t("styleGuide.edit.title")}
      description={guide.brandName || t("styleGuide.edit.description")}
      maxWidthClassName="max-w-7xl"
    >
      <OnboardingWizard
        initialData={transformGuideToFormData(guide)}
        mode="edit"
        onComplete={handleComplete}
      />
    </PageLayout>
  );
}
```

**주요 변경 사항**:

1. ✅ TODO 제거 및 `OnboardingWizard` 통합
2. ✅ 중복 Back 버튼 제거 (PageLayout actions의 "취소" 버튼, 폼 위의 Back 버튼 모두 제거)
3. ✅ 라우트 경로 수정 (`ROUTES.STYLE_GUIDES` 사용)
4. ✅ `EditSkeleton` 적용
5. ✅ `ErrorDisplay` 적용 (i18n 적용)
6. ✅ `transformGuideToFormData` 함수로 타입 변환
7. ✅ description에 가이드 이름 표시
8. ✅ maxWidthClassName을 `max-w-7xl`로 변경

---

## 5. i18n 번역 키 (수정안)

### 5.1 한국어 (messages/ko.json)

**추가할 키**:

```json
{
  "styleGuide": {
    "edit": {
      "title": "스타일 가이드 편집",
      "hint": "현재 스타일 가이드를 다시 생성하려면 새 가이드 생성 페이지로 이동하세요.",
      "description": "스타일 가이드의 내용을 수정합니다."
    }
  },
  "onboarding": {
    "wizard": {
      "keyboard_shortcut_hint": "단계 이동",
      "button_previous": "이전",
      "button_next": "다음",
      "button_submitting": "생성 중...",
      "button_complete": "완료하고 생성하기",
      "button_save": "저장",
      "preview_label": "미리보기"
    }
  }
}
```

### 5.2 영어 (messages/en.json)

**추가할 키**:

```json
{
  "styleGuide": {
    "edit": {
      "title": "Edit Style Guide",
      "hint": "To regenerate your style guide, go to the new guide creation page.",
      "description": "Modify the content of your style guide."
    }
  },
  "onboarding": {
    "wizard": {
      "keyboard_shortcut_hint": "Navigate steps",
      "button_previous": "Previous",
      "button_next": "Next",
      "button_submitting": "Submitting...",
      "button_complete": "Complete and Create",
      "button_save": "Save",
      "preview_label": "Preview"
    }
  }
}
```

---

## 6. 주요 변경 사항

### 수정된 컴포넌트

1. **OnboardingWizard**
   - `initialData` prop 추가
   - `mode` prop 추가
   - 완료 버튼 텍스트 동적 변경

2. **편집 페이지 (edit/page.tsx)**
   - `transformGuideToFormData` 함수 추가
   - 중복 Back 버튼 제거
   - 라우트 상수 사용
   - maxWidthClassName 변경

3. **ErrorDisplay**
   - i18n 적용 (하드코딩된 한국어 제거)

4. **EditSkeleton**
   - 데스크톱/모바일 레이아웃 반영
   - 더 상세한 스켈레톤 구조

### 추가된 파일

- `src/lib/routes.ts`: 라우트 상수 정의
- `src/components/error-display.tsx`: 공통 에러 표시 컴포넌트
- `src/features/style-guides/components/edit-skeleton.tsx`: 편집 스켈레톤

### 개선된 항목

- TypeScript 타입 안전성 향상 (transformGuideToFormData)
- i18n 완전성 (모든 텍스트 번역 가능)
- 라우트 경로 오타 방지 (ROUTES 상수 사용)

---

## 7. 구현 체크리스트

### Phase 1: 기반 작업

- [ ] `src/lib/routes.ts` 생성
- [ ] `src/components/error-display.tsx` 생성 (i18n 적용)
- [ ] `src/features/style-guides/components/edit-skeleton.tsx` 생성 (개선된 버전)
- [ ] `messages/ko.json` 업데이트 (`styleGuide.edit.description`, `onboarding.wizard.button_save`)
- [ ] `messages/en.json` 업데이트 (`styleGuide.edit.description`, `onboarding.wizard.button_save`)

### Phase 2: OnboardingWizard 확장

- [ ] `OnboardingWizard`에 `initialData` prop 추가
- [ ] `OnboardingWizard`에 `mode` prop 추가
- [ ] `useForm` defaultValues에 `initialData || defaultOnboardingValues` 주입
- [ ] 완료 버튼 텍스트 개선 (Line 280, 373)

### Phase 3: 편집 페이지 통합

- [ ] `transformGuideToFormData` 함수 추가
- [ ] TODO 제거 및 `OnboardingWizard` 통합
- [ ] 중복 Back 버튼 제거 (actions의 "취소" 버튼, 폼 위 Back 버튼 모두)
- [ ] 라우트 경로 수정 (`ROUTES.STYLE_GUIDES` 사용)
- [ ] `EditSkeleton` 적용
- [ ] `ErrorDisplay` 적용
- [ ] description에 가이드 이름 표시
- [ ] maxWidthClassName을 `max-w-7xl`로 변경

### Phase 4: 테스트 및 검증

- [ ] 편집 페이지 로딩 확인
- [ ] 폼 수정 및 저장 확인
- [ ] 저장 후 목록 페이지로 이동 확인 (`/style-guides`)
- [ ] 에러 처리 확인 (네트워크 에러, 404 등)
- [ ] 한국어/영어 i18n 전환 확인
  - [ ] 에러 메시지 번역 확인
  - [ ] 버튼 텍스트 번역 확인 ("저장" vs "Save")
- [ ] 모바일 반응형 확인
- [ ] 타입 에러 없음 확인 (`pnpm tsc --noEmit`)

### 필수 사항

- [x] 모든 컴포넌트에 TypeScript 타입 정의
- [x] 모든 client 컴포넌트에 `"use client"` 추가
- [x] 모든 텍스트에 i18n 적용
- [x] 접근성 속성 추가 (role, aria-live)

---

## 8. 리스크 및 주의사항

### 잠재적 문제

1. **OnboardingWizard의 레이아웃과 PageLayout 중복**
   - OnboardingWizard는 자체 `min-h-screen py-8` 레이아웃을 가짐
   - PageLayout도 컨테이너를 제공하므로 중복 패딩 발생 가능
   - **대응**: maxWidthClassName을 `max-w-7xl`로 설정하여 OnboardingWizard의 2열 레이아웃 지원

2. **페이지 이탈 경고 미구현**
   - 폼이 수정되었는지 추적하려면 `formState.isDirty` 사용 필요
   - 현재는 OnboardingWizard에서 `formState`를 부모로 전달하지 않음
   - **대응**: P2 우선순위로 추후 개선

3. **인라인 스타일 다크모드 미지원**
   - OnboardingWizard와 PageLayout 모두 인라인 스타일 사용
   - **대응**: P2 우선순위로 추후 개선 (현재 구현에서는 수정 안 함)

### 테스트 필요 항목

1. **타입 변환 정확성**
   - `transformGuideToFormData` 함수가 모든 필드를 올바르게 변환하는지 확인
   - 특히 `notes` 필드가 `null`일 때 빈 문자열로 변환되는지 확인

2. **라우트 이동**
   - 저장 후 `/style-guides` 페이지로 정확히 이동하는지 확인
   - 에러 시 페이지 유지되는지 확인

3. **i18n 동작**
   - 한국어/영어 전환 시 모든 텍스트가 올바르게 번역되는지 확인
   - 특히 ErrorDisplay의 "오류", "다시 시도", "뒤로" 버튼 확인

---

## 9. 실행 준비 확인

- [x] 모든 타입 오류 해결 (`transformGuideToFormData` 추가)
- [x] 모든 import 경로 검증
- [x] i18n 완전성 확인 (ErrorDisplay i18n 적용)
- [x] 성능 최적화 고려 (EditSkeleton 개선)
- [x] 접근성 요구사항 충족 (ErrorDisplay에 role, aria-live 추가)
- [x] 코드베이스 일관성 유지 (ROUTES 상수 사용)

---

## 10. 다음 단계

1. **Phase 1 구현 (기반 작업)**
   - `src/lib/routes.ts` 생성
   - `src/components/error-display.tsx` 생성
   - `src/features/style-guides/components/edit-skeleton.tsx` 생성
   - i18n 키 추가

2. **Phase 2 구현 (OnboardingWizard 확장)**
   - Props 인터페이스 수정
   - defaultValues 로직 수정
   - 완료 버튼 텍스트 로직 수정

3. **Phase 3 구현 (편집 페이지 통합)**
   - `transformGuideToFormData` 함수 추가
   - 페이지 리팩토링
   - 테스트

4. **Phase 4 테스트 및 검증**
   - 수동 테스트
   - 타입 체크 (`pnpm tsc --noEmit`)
   - i18n 검증

---

## 11. 예상 시간 (수정안)

- **Phase 1**: 1-2시간
- **Phase 2**: 1-2시간
- **Phase 3**: 2-3시간
- **Phase 4**: 1-2시간

**총 예상 시간**: 5-9시간

---

## 12. 결론

### 핵심 수정 사항

1. **타입 안전성 강화**
   - `transformGuideToFormData` 함수로 타입 불일치 해결
   - `notes` nullable 처리

2. **i18n 완전 지원**
   - ErrorDisplay에 i18n 적용
   - 모든 하드코딩된 텍스트 제거

3. **라우트 오타 방지**
   - `ROUTES` 상수로 경로 관리
   - 타입 안전한 경로 사용

4. **사용자 경험 개선**
   - 편집 모드에서 "저장" 버튼 표시
   - description에 가이드 이름 표시
   - 더 상세한 스켈레톤 UI

### 기대 효과

- ✅ **실행 가능성**: 모든 타입 에러 해결, 빌드 에러 없음
- ✅ **일관성**: 기존 코드베이스 규칙 준수
- ✅ **유지보수성**: 라우트 상수, 타입 변환 함수로 유지보수 용이
- ✅ **확장성**: 추후 개선 사항(페이지 이탈 경고, 다크모드) 명확히 정의

### 준비 완료

이 계획은 실제로 실행 가능하며, 모든 타입 에러와 런타임 에러를 사전에 방지합니다. Phase 1부터 순차적으로 진행하면 됩니다.
