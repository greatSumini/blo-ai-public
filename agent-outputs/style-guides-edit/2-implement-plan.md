# 스타일 가이드 편집 페이지 구현 계획

## 1. 코드베이스 분석 결과

### 1.1 프로젝트 구조

```
src/
├── app/
│   └── [locale]/(protected)/style-guides/[id]/edit/page.tsx  # 편집 페이지 (수정 대상)
├── components/
│   ├── ui/                      # shadcn-ui 컴포넌트
│   │   ├── skeleton.tsx
│   │   ├── button.tsx
│   │   └── ...
│   └── layout/
│       └── page-layout.tsx      # 페이지 레이아웃 래퍼
├── features/
│   ├── onboarding/
│   │   ├── components/
│   │   │   ├── onboarding-wizard.tsx     # 위저드 메인 (수정 대상)
│   │   │   ├── step-brand-voice.tsx
│   │   │   ├── step-audience.tsx
│   │   │   ├── step-language.tsx
│   │   │   ├── step-style.tsx
│   │   │   ├── step-review.tsx
│   │   │   ├── step-indicator.tsx
│   │   │   └── preview-panel.tsx
│   │   └── lib/
│   │       ├── onboarding-schema.ts
│   │       └── constants.ts
│   └── articles/
│       └── hooks/
│           └── useStyleGuideQuery.ts     # React Query 훅
└── messages/
    ├── ko.json                  # 한국어 i18n
    └── en.json                  # 영어 i18n
```

### 1.2 기존 패턴

**1) 페이지 레이아웃 패턴**
- `PageLayout` 컴포넌트를 사용하여 일관된 헤더 제공
- `title`, `description`, `actions` props로 페이지 메타 정보 구성

**2) React Query 패턴**
- `useStyleGuide(id)`: 단일 스타일 가이드 조회
- `useUpdateStyleGuide()`: 스타일 가이드 수정
- 자동 캐시 무효화 (`invalidateQueries`)

**3) 폼 관리 패턴**
- `react-hook-form` + `zod` 스키마 검증
- `OnboardingFormData` 타입 사용
- 단계별 검증 (step-by-step validation)

**4) i18n 패턴**
- `next-intl`의 `useTranslations()` 훅 사용
- `messages/ko.json`, `messages/en.json`에서 번역 관리
- 중첩된 키 구조 (예: `styleGuide.edit.title`)

**5) 스타일링 패턴**
- Tailwind CSS 기반
- 일부 인라인 스타일 사용 (색상 하드코딩 - 개선 대상)
- shadcn-ui 컴포넌트 활용

### 1.3 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **폼**: react-hook-form + zod
- **상태 관리**: @tanstack/react-query (zustand는 사용하지 않음)
- **i18n**: next-intl
- **UI 컴포넌트**: shadcn-ui
- **아이콘**: lucide-react
- **애니메이션**: framer-motion (미사용 - CSS만 사용)

---

## 2. 파일 구조

### 2.1 수정할 파일

1. **`src/app/[locale]/(protected)/style-guides/[id]/edit/page.tsx`**
   - 편집 페이지 메인 로직
   - TODO 제거 및 OnboardingWizard 통합
   - 중복 Back 버튼 제거
   - 라우트 경로 오타 수정

2. **`src/features/onboarding/components/onboarding-wizard.tsx`**
   - `initialData` prop 추가
   - `mode` prop 추가 (선택사항)
   - `defaultValues`에 initialData 주입

3. **`messages/ko.json`**
   - 새로운 i18n 키 추가
   - 기존 키 개선

4. **`messages/en.json`**
   - 새로운 i18n 키 추가
   - 기존 키 개선

### 2.2 생성할 파일

1. **`src/features/style-guides/components/edit-skeleton.tsx`**
   - 간단한 로딩 스켈레톤 UI
   - OnboardingWizard 레이아웃 구조 반영

2. **`src/components/error-display.tsx`**
   - 재사용 가능한 에러 표시 컴포넌트
   - 재시도/뒤로가기 액션 지원

3. **`src/lib/routes.ts`**
   - 라우트 상수 정의
   - 타입 안전한 경로 관리

---

## 3. 의존성

### 3.1 설치 명령

이미 모든 필요한 패키지가 설치되어 있습니다. 추가 설치 불필요.

### 3.2 이미 설치된 패키지

- `react-hook-form`
- `zod`
- `@tanstack/react-query`
- `next-intl`
- `lucide-react`
- `tailwindcss`

---

## 4. 구현 순서

### Phase 1: 기반 작업 (1-2시간)

1. **라우트 상수 정의**
   - `src/lib/routes.ts` 생성
   - 모든 스타일 가이드 관련 경로 상수화

2. **공통 컴포넌트 생성**
   - `src/components/error-display.tsx` 생성
   - `src/features/style-guides/components/edit-skeleton.tsx` 생성

3. **i18n 키 추가**
   - `messages/ko.json` 업데이트
   - `messages/en.json` 업데이트

### Phase 2: OnboardingWizard 확장 (2-3시간)

4. **OnboardingWizard Props 확장**
   - `initialData` prop 추가
   - `mode` prop 추가 (옵션)
   - `useForm` defaultValues 수정

5. **OnboardingWizard 인라인 스타일 제거 (옵션)**
   - Tailwind 클래스로 전환

### Phase 3: 편집 페이지 통합 (2-3시간)

6. **편집 페이지 리팩토링**
   - TODO 제거
   - OnboardingWizard 통합
   - 중복 Back 버튼 제거
   - 라우트 경로 수정
   - 스켈레톤 UI 적용
   - ErrorDisplay 적용

7. **페이지 이탈 경고 구현**
   - `beforeunload` 이벤트 핸들러
   - `isDirty` 상태 추적

### Phase 4: 테스트 및 검증 (1-2시간)

8. **수동 테스트**
   - 편집 페이지 로딩 확인
   - 폼 수정 및 저장 확인
   - 에러 처리 확인
   - 페이지 이탈 경고 확인

9. **i18n 검증**
   - 한국어/영어 전환 확인
   - 모든 텍스트 번역 확인

---

## 5. 컴포넌트 상세 명세

### 5.1 라우트 상수

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

### 5.2 공통 에러 표시 컴포넌트

#### 파일: `src/components/error-display.tsx`

```typescript
"use client";

import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
 *   message="스타일 가이드를 불러오는 데 실패했습니다."
 *   onRetry={() => refetch()}
 *   onBack={() => router.back()}
 * />
 * ```
 */
export function ErrorDisplay({ message, onRetry, onBack }: ErrorDisplayProps) {
  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-lg border border-destructive/20 bg-destructive/5 p-8"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-16 w-16 text-destructive" aria-hidden="true" />

      <div className="text-center">
        <p className="text-lg font-medium text-destructive mb-1">
          오류가 발생했습니다
        </p>
        <p className="text-muted-foreground">
          {message}
        </p>
      </div>

      <div className="flex gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
        )}
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 5.3 편집 스켈레톤

#### 파일: `src/features/style-guides/components/edit-skeleton.tsx`

```typescript
"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 스타일 가이드 편집 페이지 로딩 스켈레톤
 *
 * OnboardingWizard의 구조를 반영한 간단한 스켈레톤 UI
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

      {/* Form Area */}
      <div className="rounded-xl border bg-card p-8 space-y-6">
        {/* Title */}
        <Skeleton className="h-8 w-64" />

        {/* Description */}
        <Skeleton className="h-4 w-full max-w-2xl" />

        {/* Form Fields */}
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
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
```

### 5.4 OnboardingWizard 확장

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
   *
   * 모드에 따라 버튼 텍스트 등이 달라질 수 있음 (선택사항)
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

  // ===== 기존 코드에서 수정된 부분 =====
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    // initialData가 있으면 사용, 없으면 기본값
    defaultValues: initialData || defaultOnboardingValues,
    mode: "onChange",
  });

  // ... 나머지 코드는 동일 ...

  // ===== 완료 버튼 텍스트 개선 (선택사항) =====
  // Line 280, 373 부근의 완료 버튼 텍스트 변경 가능:
  // {isSubmitting
  //   ? t("button_submitting")
  //   : mode === "edit" ? t("button_save") : t("button_complete")
  // }
}
```

**참고**:
- `mode` prop은 선택사항입니다. 필요하지 않다면 생략 가능.
- 현재 버튼 텍스트가 "완료"로 충분하다면 `mode` 관련 로직 불필요.

### 5.5 편집 페이지 리팩토링

#### 파일: `src/app/[locale]/(protected)/style-guides/[id]/edit/page.tsx`

**전체 코드**:

```typescript
"use client";

import { use, useEffect } from "react";
import { useRouter } from '@/i18n/navigation';
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';
import { PageLayout } from "@/components/layout/page-layout";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { EditSkeleton } from "@/features/style-guides/components/edit-skeleton";
import { ErrorDisplay } from "@/components/error-display";
import {
  useStyleGuide,
  useUpdateStyleGuide,
} from "@/features/articles/hooks/useStyleGuideQuery";
import type { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";
import { ROUTES } from "@/lib/routes";

type EditStyleGuidePageProps = {
  params: Promise<{ id: string }>;
};

export default function EditStyleGuidePage({ params }: EditStyleGuidePageProps) {
  const resolvedParams = use(params);
  const guideId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  const { data: guide, isLoading, isError, refetch } = useStyleGuide(guideId);
  const updateStyleGuide = useUpdateStyleGuide();

  const handleComplete = async (data: OnboardingFormData) => {
    try {
      await updateStyleGuide.mutateAsync({ guideId, data });

      toast({
        title: t("common.success"),
        description: t("styleGuide.edit.success"),
      });

      router.push(ROUTES.STYLE_GUIDES);
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("styleGuide.edit.error"),
        variant: "destructive",
      });
    }
  };

  // ===== 페이지 이탈 경고 =====
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 폼이 수정되었는지 확인하는 로직은 OnboardingWizard 내부에서 관리되므로
      // 여기서는 간단한 경고만 표시
      // 추후 개선: formState.isDirty 추적 필요
      const message = "변경사항이 저장되지 않을 수 있습니다.";
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

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
      description={guide.brand_name || t("styleGuide.edit.description")}
      maxWidthClassName="max-w-7xl"
    >
      <OnboardingWizard
        initialData={guide}
        mode="edit"
        onComplete={handleComplete}
      />
    </PageLayout>
  );
}
```

**주요 변경 사항**:

1. ✅ TODO 제거 및 `OnboardingWizard` 통합
2. ✅ 중복 Back 버튼 제거 (PageLayout actions의 Back 버튼, 폼 위의 Back 버튼 모두 제거)
3. ✅ 라우트 경로 수정 (`/style-guide` → `ROUTES.STYLE_GUIDES`)
4. ✅ `EditSkeleton` 적용
5. ✅ `ErrorDisplay` 적용
6. ✅ 페이지 이탈 경고 추가
7. ✅ 라우트 상수 사용
8. ✅ description에 가이드 이름 표시

---

## 6. i18n 번역 키

### 6.1 한국어 (messages/ko.json)

**추가/수정할 키**:

```json
{
  "styleGuide": {
    "title": "스타일 가이드",
    "subtitle": "AI 글 생성에 사용할 블로그의 스타일 가이드를 관리합니다.",
    "create_new": "새 가이드 생성",
    "empty": "아직 생성된 스타일 가이드가 없습니다.",
    "create": "스타일 가이드 생성하기",
    "loading": "로딩 중...",
    "retry": "다시 시도",
    "cancel": "취소",
    "error": {
      "load": "스타일 가이드를 불러오는 데 실패했습니다."
    },
    "delete": {
      "confirm": "이 스타일 가이드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      "success": {
        "title": "삭제 완료",
        "desc": "스타일 가이드가 삭제되었습니다."
      },
      "error": {
        "title": "오류",
        "desc": "스타일 가이드 삭제에 실패했습니다."
      }
    },
    "update": {
      "success": {
        "desc": "스타일 가이드가 업데이트되었습니다."
      },
      "error": {
        "desc": "스타일 가이드 업데이트에 실패했습니다."
      }
    },
    "edit": {
      "title": "스타일 가이드 편집",
      "description": "스타일 가이드의 내용을 수정합니다.",
      "success": "스타일 가이드가 성공적으로 저장되었습니다.",
      "error": "스타일 가이드 저장에 실패했습니다."
    }
  },
  "onboarding": {
    "wizard": {
      "button_previous": "이전",
      "button_next": "다음",
      "button_complete": "완료",
      "button_save": "저장",
      "button_submitting": "저장 중...",
      "preview_label": "미리보기",
      "keyboard_shortcut_hint": "단계 이동"
    }
  }
}
```

### 6.2 영어 (messages/en.json)

**추가/수정할 키**:

```json
{
  "styleGuide": {
    "title": "Style Guide",
    "subtitle": "Manage your blog's style guide for AI writing.",
    "create_new": "Create New Guide",
    "empty": "No style guides created yet.",
    "create": "Create Style Guide",
    "loading": "Loading...",
    "retry": "Retry",
    "cancel": "Cancel",
    "error": {
      "load": "Failed to load the style guide."
    },
    "delete": {
      "confirm": "Delete this style guide? This action cannot be undone.",
      "success": {
        "title": "Deleted",
        "desc": "The style guide has been deleted."
      },
      "error": {
        "title": "Error",
        "desc": "Failed to delete the style guide."
      }
    },
    "update": {
      "success": {
        "desc": "The style guide has been updated."
      },
      "error": {
        "desc": "Failed to update the style guide."
      }
    },
    "edit": {
      "title": "Edit Style Guide",
      "description": "Modify the content of your style guide.",
      "success": "Style guide saved successfully.",
      "error": "Failed to save the style guide."
    }
  },
  "onboarding": {
    "wizard": {
      "button_previous": "Previous",
      "button_next": "Next",
      "button_complete": "Complete",
      "button_save": "Save",
      "button_submitting": "Saving...",
      "preview_label": "Preview",
      "keyboard_shortcut_hint": "Navigate steps"
    }
  }
}
```

---

## 7. 스타일링 가이드

### 7.1 Tailwind 클래스 패턴

**일관된 스타일 패턴**:

```typescript
// ✅ 권장: Tailwind 클래스 사용
className="bg-background text-foreground border-border rounded-xl"

// ❌ 지양: 인라인 스타일
style={{ backgroundColor: "#FFFFFF", borderColor: "#E1E5EA" }}
```

**컴포넌트별 클래스**:

```typescript
// 카드/패널
"rounded-xl border bg-card p-6 space-y-6"

// 버튼
"h-10 rounded-lg"  // Primary
"h-10 rounded-lg border-border"  // Outline

// 에러 상태
"rounded-lg border border-destructive/20 bg-destructive/5"

// 스켈레톤
"animate-pulse rounded-md bg-muted"
```

### 7.2 반응형 디자인

**브레이크포인트**:

```typescript
// 모바일 우선 (Mobile First)
"space-y-4 lg:space-y-6"
"flex-col lg:flex-row"
"w-full lg:w-auto"

// OnboardingWizard 레이아웃
"lg:grid lg:grid-cols-[1fr,400px] lg:gap-8"
```

### 7.3 다크모드

**다크모드 클래스** (현재 OnboardingWizard에 인라인 스타일 사용 중 - 개선 권장):

```typescript
// ✅ 권장: CSS 변수 사용
"bg-background text-foreground"
"border-border"
"bg-card text-card-foreground"
"bg-muted text-muted-foreground"
"bg-primary text-primary-foreground"

// ❌ 현재: 하드코딩된 색상
style={{ backgroundColor: "#FFFFFF" }}  // 개선 필요
```

---

## 8. 성능 고려사항

### 8.1 애니메이션 최적화

**현재 상태**:
- framer-motion 미사용
- CSS 애니메이션만 사용 (`animate-pulse`, `transition-colors`)
- 성능 문제 없음

**권장 사항**:
- 현재 상태 유지
- 과도한 애니메이션 추가 지양

### 8.2 React Query 캐싱

**현재 설정**:

```typescript
// useStyleGuide
staleTime: 60 * 1000,        // 1분
gcTime: 10 * 60 * 1000,      // 10분
refetchOnWindowFocus: false, // 포커스 시 재조회 안함
```

**장점**:
- 불필요한 네트워크 요청 감소
- 빠른 페이지 전환

### 8.3 스켈레톤 UI

**현재 구현**:
- 간단한 구조 (~30줄)
- 불필요한 디테일 제거
- 빠른 초기 렌더링

---

## 9. 접근성 체크리스트

- [x] 시맨틱 HTML 사용
  - `<form>`, `<button>`, `<input>` 등 적절한 요소 사용
  - `role="alert"`, `role="status"` 속성 추가

- [x] ARIA 레이블 추가
  - `ErrorDisplay`에 `role="alert"`, `aria-live="assertive"` 추가
  - 버튼에 명확한 텍스트 제공

- [x] 키보드 네비게이션 지원
  - OnboardingWizard의 Alt + ← / → 단축키 지원
  - 모든 인터랙티브 요소에 포커스 가능

- [x] 색상 대비 확인
  - shadcn-ui 기본 테마 사용 (WCAG AA 준수)

- [x] 스크린 리더 지원
  - OnboardingWizard의 `announceToScreenReader` 함수
  - 상태 변경 시 자동 안내

---

## 10. 데이터 흐름

### 10.1 페이지 로딩 흐름

```
1. 페이지 마운트
   ↓
2. useStyleGuide(guideId) 호출
   ↓
3. API 요청: GET /api/style-guides/:id
   ↓
4-a. 성공: guide 데이터 반환
   ↓
5-a. OnboardingWizard에 initialData로 전달
   ↓
6-a. 폼이 guide 데이터로 초기화됨

4-b. 실패: isError = true
   ↓
5-b. ErrorDisplay 표시
```

### 10.2 저장 흐름

```
1. 사용자가 폼 수정
   ↓
2. 위저드 "완료" 버튼 클릭
   ↓
3. handleComplete(data) 호출
   ↓
4. updateStyleGuide.mutateAsync({ guideId, data })
   ↓
5. API 요청: PATCH /api/style-guides/:id
   ↓
6-a. 성공:
      - toast 성공 메시지
      - queryClient.invalidateQueries (캐시 무효화)
      - router.push(ROUTES.STYLE_GUIDES)

6-b. 실패:
      - toast 에러 메시지
      - 페이지 유지 (재시도 가능)
```

### 10.3 상태 관리

**React Query 캐시 구조**:

```typescript
queryClient = {
  queries: {
    ["styleGuides"]: StyleGuideResponse[],           // 목록
    ["styleGuides", guideId]: StyleGuideResponse,    // 단일 항목
  }
}
```

**캐시 무효화 시점**:
- 스타일 가이드 생성 시
- 스타일 가이드 수정 시
- 스타일 가이드 삭제 시

---

## 11. 구현 체크리스트

### Phase 1: 기반 작업

- [ ] `src/lib/routes.ts` 생성
- [ ] `src/components/error-display.tsx` 생성
- [ ] `src/features/style-guides/components/edit-skeleton.tsx` 생성
- [ ] `messages/ko.json` 업데이트
- [ ] `messages/en.json` 업데이트

### Phase 2: OnboardingWizard 확장

- [ ] `OnboardingWizard`에 `initialData` prop 추가
- [ ] `OnboardingWizard`에 `mode` prop 추가 (옵션)
- [ ] `useForm` defaultValues에 initialData 주입
- [ ] 완료 버튼 텍스트 개선 (옵션)

### Phase 3: 편집 페이지 통합

- [ ] TODO 제거 및 `OnboardingWizard` 통합
- [ ] 중복 Back 버튼 제거
- [ ] 라우트 경로 수정 (`/style-guide` → `ROUTES.STYLE_GUIDES`)
- [ ] `EditSkeleton` 적용
- [ ] `ErrorDisplay` 적용
- [ ] 페이지 이탈 경고 구현
- [ ] description에 가이드 이름 표시

### Phase 4: 테스트 및 검증

- [ ] 편집 페이지 로딩 확인
- [ ] 폼 수정 및 저장 확인
- [ ] 에러 처리 확인 (네트워크 에러, 404 등)
- [ ] 페이지 이탈 경고 확인
- [ ] 한국어/영어 i18n 전환 확인
- [ ] 모바일 반응형 확인
- [ ] 접근성 확인 (키보드 네비게이션, 스크린 리더)

### Phase 5: 선택적 개선 (추후)

- [ ] OnboardingWizard 인라인 스타일 제거
- [ ] Tailwind 클래스로 전환
- [ ] 다크모드 테마 완전 지원
- [ ] 페이지 이탈 경고 개선 (isDirty 정확한 추적)

---

## 12. 위험 요소 및 완화 방안

### 위험 1: guide 데이터 구조 불일치

**문제**: `guide` 객체의 필드명이 `OnboardingFormData`와 다를 수 있음

**완화 방안**:
```typescript
// useStyleGuide 응답을 OnboardingFormData로 변환하는 함수
function transformGuideToFormData(guide: StyleGuideResponse): OnboardingFormData {
  return {
    brandName: guide.brand_name,
    brandDescription: guide.brand_description,
    personality: guide.personality || [],
    formality: guide.formality,
    targetAudience: guide.target_audience,
    painPoints: guide.pain_points,
    language: guide.language,
    tone: guide.tone,
    contentLength: guide.content_length,
    readingLevel: guide.reading_level,
    notes: guide.notes || "",
  };
}

// 사용:
<OnboardingWizard
  initialData={transformGuideToFormData(guide)}
  mode="edit"
  onComplete={handleComplete}
/>
```

**참고**:
- 실제 API 응답 구조를 확인하여 필드명 매핑 필요
- `StyleGuideResponse` 타입 정의 확인 필요

### 위험 2: 페이지 이탈 경고 부정확

**문제**: 현재 `beforeunload` 이벤트가 폼이 수정되지 않았을 때도 발생

**완화 방안**:
```typescript
// OnboardingWizard에서 isDirty 상태를 부모로 전달
// 또는 useForm의 formState.isDirty를 추적

// 개선된 버전 (추후 구현):
const form = useForm<OnboardingFormData>({ ... });

useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (form.formState.isDirty) {  // 수정된 경우만
      e.preventDefault();
      e.returnValue = "";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [form.formState.isDirty]);
```

**우선순위**: P2 (추후 개선)

### 위험 3: 스타일 가이드 목록 페이지 경로 불일치

**문제**: `/style-guide` vs `/style-guides` 혼용

**완화 방안**:
- `ROUTES` 상수 사용으로 해결
- 모든 페이지에서 `ROUTES.STYLE_GUIDES` 사용 강제

---

## 13. 구현 시간 추정

### Phase 1: 기반 작업 (1-2시간)
- 라우트 상수: 15분
- ErrorDisplay: 30분
- EditSkeleton: 30분
- i18n 키 추가: 30분

### Phase 2: OnboardingWizard 확장 (1-2시간)
- Props 확장: 30분
- defaultValues 수정: 15분
- 테스트: 30분
- 문서화: 15분

### Phase 3: 편집 페이지 통합 (2-3시간)
- 코드 리팩토링: 1시간
- 페이지 이탈 경고: 30분
- 에러 처리 개선: 30분
- 테스트: 1시간

### Phase 4: 테스트 및 검증 (1-2시간)
- 수동 테스트: 1시간
- i18n 검증: 30분
- 접근성 확인: 30분

**총 예상 시간**: 5-9시간

---

## 14. 추가 고려사항

### 14.1 라우트 경로 정리

**현재 문제**:
- Line 38: `router.push("/style-guide")` ❌
- 올바른 경로: `/style-guides` ✅

**해결책**:
- 모든 파일에서 `ROUTES` 상수 사용
- 하드코딩된 경로 제거

### 14.2 중복 Back 버튼

**현재 문제**:
- PageLayout의 actions에 "취소" 버튼 (Line 88-96)
- 폼 위에 Back 버튼 (Line 99-104)
- 총 2개의 Back 버튼 존재

**해결책**:
- 두 버튼 모두 제거
- OnboardingWizard 자체가 이전/다음 네비게이션 제공
- 사용자가 위저드 내에서 흐름을 제어

### 14.3 OnboardingWizard 인라인 스타일 제거 (선택사항)

**현재 문제**:
- Line 181: `style={{ backgroundColor: "#FCFCFD" }}`
- Line 191-192: 키보드 힌트의 인라인 스타일
- Line 225-229: 폼 카드의 인라인 스타일
- Line 240-244: 버튼의 인라인 스타일
- 등등...

**해결책** (P2 - 추후 개선):
```typescript
// Before:
style={{ backgroundColor: "#FCFCFD" }}

// After:
className="bg-muted/30"

// Before:
style={{ backgroundColor: "#FFFFFF", borderColor: "#E1E5EA" }}

// After:
className="bg-card border-border"
```

**참고**:
- 이 작업은 다크모드 지원을 위해 필요
- 현재는 필수가 아니므로 P2 우선순위

---

## 15. 결론

### 핵심 변경 사항

1. **OnboardingWizard 재사용**
   - `initialData` prop 추가로 편집 모드 지원
   - 신규 생성과 편집의 일관된 UX

2. **간단하고 효과적인 UI**
   - EditSkeleton: 로딩 상태 표시
   - ErrorDisplay: 에러 처리
   - 불필요한 복잡도 제거

3. **타입 안전한 라우팅**
   - `ROUTES` 상수로 오타 방지
   - 중앙 집중식 경로 관리

4. **i18n 완전 지원**
   - 모든 텍스트 번역 키 추가
   - 한국어/영어 완전 지원

### 기대 효과

- ✅ **빠른 구현**: 5-9시간이면 완성 가능
- ✅ **일관성**: 신규 생성 페이지와 동일한 UX
- ✅ **유지보수 용이**: 간단한 구조, 낮은 복잡도
- ✅ **확장 가능**: 필요시 점진적 개선 가능

### 다음 단계

1. Phase 1 구현 (기반 작업)
2. Phase 2 구현 (OnboardingWizard 확장)
3. Phase 3 구현 (편집 페이지 통합)
4. Phase 4 테스트 및 검증
5. (선택) Phase 5 스타일 개선

**구현 시작**: Phase 1부터 순차적으로 진행
