# 스타일 가이드 편집 페이지 분석 및 개선안

## 1. 현재 상태 분석

### 1.1 페이지 구조

**경로**: `/src/app/[locale]/(protected)/style-guides/[id]/edit/page.tsx`

현재 페이지는 다음과 같은 구조로 구성되어 있습니다:

```
EditStyleGuidePage
├── PageLayout (컨테이너)
│   ├── Header (title, description, actions)
│   ├── Loading State (Loader2 + 메시지)
│   ├── Error State (에러 메시지 + Back 버튼)
│   └── Content Area
│       ├── Back Button (ArrowLeft + 텍스트)
│       └── TODO 주석 (실제 편집 폼 없음)
```

**주요 사용 컴포넌트**:
- `PageLayout`: 페이지 래퍼 (제목, 설명, 액션 버튼)
- `useStyleGuide`: 스타일 가이드 데이터 fetch
- `useUpdateStyleGuide`: 스타일 가이드 업데이트 mutation
- `OnboardingWizard`: (import되었으나 미사용)

### 1.2 강점

1. **명확한 상태 관리**: 로딩, 에러, 성공 상태를 명확하게 분리
2. **타입 안전성**: TypeScript와 Zod를 활용한 타입 검증
3. **국제화 지원**: next-intl을 통한 다국어 지원
4. **접근성 고려**: ARIA 레이블과 스크린 리더 지원
5. **일관된 디자인 시스템**: shadcn-ui 기반 컴포넌트 사용

### 1.3 약점 및 개선 필요 부분 (엄격한 피드백)

#### 🔴 치명적인 문제

1. **기능 미구현**
   - Line 105: `{/* TODO: 스타일 가이드 편집 폼/위저드 추가 예정 */}`
   - 핵심 편집 기능이 완전히 누락됨
   - 페이지가 사실상 빈 껍데기 상태

2. **불필요한 코드 중복**
   - Line 88-96: PageLayout의 `actions` prop에 버튼 2개
   - Line 100-103: 동일한 Back 버튼이 본문에 또 존재
   - 중복된 네비게이션은 사용자 혼란을 야기

3. **비효율적인 데이터 로딩**
   - 편집 폼이 없음에도 전체 스타일 가이드 데이터를 fetch
   - 로딩 상태에서 최소 400px 높이를 차지하여 레이아웃 shift 발생

#### 🟡 개선이 필요한 부분

4. **빈약한 사용자 피드백**
   - 로딩 상태: 단순 스피너와 텍스트만 표시
   - 스켈레톤 UI 부재로 예상 레이아웃을 알 수 없음

5. **컨텍스트 부족**
   - 어떤 스타일 가이드를 편집 중인지 명확하지 않음
   - 마지막 수정 시간, 작성자 등의 메타데이터 부재

6. **UX 일관성 문제**
   - `/style-guides/new` 페이지는 `OnboardingWizard`를 사용
   - 편집 페이지는 다른 UI를 사용할 예정 (일관성 결여)

7. **에러 처리 부족**
   - 단순 텍스트 에러 메시지만 표시
   - 에러 원인 파악 및 해결 방법 제시 부재
   - 재시도 기능 없음

8. **접근성 문제**
   - 로딩 중에는 `aria-live` 또는 `role="status"` 부재
   - 에러 상태에서 `role="alert"` 부재

9. **모바일 최적화 부족**
   - 고정된 레이아웃으로 작은 화면에서 불편
   - 터치 인터랙션 고려 부족

## 2. 개선된 페이지 구성

### 2.1 페이지 구조 재설계

```
EditStyleGuidePage
├── PageHeader
│   ├── Breadcrumb (Home > Style Guides > Edit)
│   ├── Title (스타일 가이드 이름)
│   ├── Metadata (마지막 수정: X시간 전)
│   └── Actions (저장, 취소, 삭제)
├── AutoSave Indicator
├── Main Content
│   ├── OnboardingWizard (편집 모드)
│   │   ├── Step Indicator (진행률)
│   │   ├── Form Sections (5단계)
│   │   └── Preview Panel (실시간 미리보기)
│   └── Quick Actions
│       ├── Save Draft
│       ├── Discard Changes
│       └── Delete Guide
└── Floating Action Bar (모바일)
    ├── Save Button
    └── Cancel Button
```

### 2.2 핵심 섹션별 상세 설계

#### Header Section
- **목적**: 현재 편집 중인 가이드 식별 및 주요 액션 제공
- **요소**:
  - 브레드크럼 네비게이션
  - 스타일 가이드 이름 (인라인 편집 가능)
  - 메타데이터 (생성일, 수정일, 사용 횟수)
  - 주요 액션 버튼 (저장, 취소, 삭제)

#### Auto-Save Indicator
- **목적**: 사용자에게 변경사항 저장 상태를 실시간으로 알림
- **요소**:
  - 저장 상태 아이콘
  - "저장됨" / "저장 중..." / "오류" 텍스트
  - 마지막 저장 시간

#### Wizard Section (핵심)
- **목적**: 기존 데이터를 편집할 수 있는 단계별 폼 제공
- **요소**:
  - `OnboardingWizard` 컴포넌트 재사용
  - 초기값으로 기존 스타일 가이드 데이터 주입
  - 실시간 검증 및 에러 표시
  - 우측 미리보기 패널

#### Loading & Error States
- **로딩**: 스켈레톤 UI로 예상 레이아웃 표시
- **에러**: 상세한 에러 메시지 + 재시도 버튼 + 지원 링크

## 3. 참고 레퍼런스

### 3.1 Claude.ai의 디자인 패턴 적용

claude.ai는 접근이 제한되어 직접 분석할 수 없었으나, 일반적인 SaaS 편집 페이지 베스트 프랙티스를 적용합니다:

#### Notion, Linear, Airtable 등의 패턴

1. **실시간 자동 저장**
   - 변경 즉시 debounce된 자동 저장
   - "Saving..." → "Saved" 인디케이터

2. **인라인 편집**
   - 필드 클릭 시 즉시 편집 가능
   - Enter로 저장, Esc로 취소

3. **변경사항 추적**
   - Dirty state 감지
   - 페이지 이탈 시 확인 다이얼로그

4. **컨텍스트 보존**
   - 상단에 편집 중인 항목 명시
   - 브레드크럼으로 위치 표시

5. **Progressive Disclosure**
   - 고급 옵션은 접었다 펼칠 수 있게
   - 기본 옵션은 항상 노출

### 3.2 적용 방법 및 차별화

**우리 서비스에 맞춘 차별화**:
- 단계별 위저드 유지 (신규 생성과 일관성)
- 우측 실시간 미리보기 패널 강화
- 변경사항 하이라이트 (어떤 필드가 수정되었는지)
- 버전 히스토리 (향후 추가)

## 4. UI 디자인 컨셉

### 4.1 컬러 시스템

```typescript
const colors = {
  // Primary
  primary: "#3BA2F8",
  primaryHover: "#2A92E8",
  primaryLight: "#E3F2FD",

  // Neutral
  background: "#FCFCFD",
  surface: "#FFFFFF",
  border: "#E1E5EA",

  // Text
  textPrimary: "#111827",
  textSecondary: "#374151",
  textTertiary: "#6B7280",
  textMuted: "#9CA3AF",

  // Status
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  info: "#3BA2F8",
  infoLight: "#E3F2FD",

  // Semantic
  autoSave: "#10B981", // 저장 완료
  saving: "#F59E0B",   // 저장 중
  unsaved: "#9CA3AF",  // 미저장
};
```

### 4.2 타이포그래피

```typescript
const typography = {
  // Headings
  h1: "text-3xl font-bold leading-tight", // 32px
  h2: "text-2xl font-semibold leading-tight", // 24px
  h3: "text-xl font-semibold leading-snug", // 20px
  h4: "text-lg font-medium leading-snug", // 18px

  // Body
  bodyLarge: "text-base leading-relaxed", // 16px
  body: "text-sm leading-relaxed", // 14px
  bodySmall: "text-xs leading-normal", // 12px

  // Special
  code: "font-mono text-sm",
  label: "text-sm font-medium",
  caption: "text-xs text-muted-foreground",
};
```

### 4.3 간격 시스템

```typescript
const spacing = {
  // Section spacing
  sectionGap: "space-y-8", // 32px between major sections
  componentGap: "space-y-6", // 24px between components
  fieldGap: "space-y-4", // 16px between form fields

  // Padding
  containerPadding: "p-8",
  cardPadding: "p-6",
  inputPadding: "px-3 py-2",

  // Margins
  headerMargin: "mb-8",
  sectionMargin: "mb-6",
};
```

### 4.4 카드/컨테이너 스타일

```typescript
const containerStyles = {
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E1E5EA",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },

  panel: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E1E5EA",
    borderRadius: "8px",
    padding: "16px",
  },

  highlight: {
    backgroundColor: "#F5F7FA",
    borderLeft: "4px solid #3BA2F8",
    padding: "16px",
    borderRadius: "4px",
  },
};
```

### 4.5 다크모드 고려사항

현재 구현에서는 인라인 스타일로 색상을 하드코딩하고 있어 다크모드 지원이 불가능합니다.

**개선 방안**:
```typescript
// Tailwind CSS 클래스 사용
className="bg-background text-foreground border-border"

// CSS 변수 활용
style={{
  backgroundColor: "var(--background)",
  color: "var(--foreground)",
}}
```

## 5. 섹션별 컴포넌트 명세

### 5.1 Page Header Section

#### EditPageHeader Component
- **파일**: `src/features/style-guides/components/edit-page-header.tsx`
- **Props**:
```typescript
interface EditPageHeaderProps {
  guideId: string;
  guideName: string;
  updatedAt: string;
  onNameChange: (newName: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onDelete: () => Promise<void>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}
```
- **하위 컴포넌트**:
  - `Breadcrumb`: 네비게이션 경로
  - `EditableTitle`: 인라인 편집 가능한 제목
  - `MetadataDisplay`: 메타 정보 표시
  - `ActionButtons`: 저장/취소/삭제 버튼

#### 구현 예시:
```typescript
"use client";

import { useState } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, X, Trash2, Edit2 } from "lucide-react";

export function EditPageHeader({
  guideId,
  guideName,
  updatedAt,
  onNameChange,
  onSave,
  onCancel,
  onDelete,
  isSaving,
  hasUnsavedChanges,
}: EditPageHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(guideName);

  return (
    <div className="border-b bg-white px-6 py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">홈</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/style-guides">스타일 가이드</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <span className="text-muted-foreground">편집</span>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex items-start justify-between">
        {/* Title */}
        <div className="flex-1">
          {isEditingName ? (
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={() => {
                onNameChange(tempName);
                setIsEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onNameChange(tempName);
                  setIsEditingName(false);
                } else if (e.key === "Escape") {
                  setTempName(guideName);
                  setIsEditingName(false);
                }
              }}
              className="text-2xl font-bold"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="group flex items-center gap-2 text-2xl font-bold hover:text-primary"
            >
              {guideName}
              <Edit2 className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}

          <p className="mt-1 text-sm text-muted-foreground">
            마지막 수정: {updatedAt}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="mr-2 h-4 w-4" />
            취소
          </Button>

          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 5.2 Auto-Save Indicator Section

#### AutoSaveIndicator Component
- **파일**: `src/features/style-guides/components/auto-save-indicator.tsx`
- **Props**:
```typescript
interface AutoSaveIndicatorProps {
  status: "saved" | "saving" | "unsaved" | "error";
  lastSavedAt?: Date;
  errorMessage?: string;
}
```

#### 구현 예시:
```typescript
"use client";

import { CheckCircle2, Loader2, AlertCircle, Cloud } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export function AutoSaveIndicator({
  status,
  lastSavedAt,
  errorMessage,
}: AutoSaveIndicatorProps) {
  const statusConfig = {
    saved: {
      icon: CheckCircle2,
      text: "저장됨",
      color: "text-success",
      bgColor: "bg-success-light",
    },
    saving: {
      icon: Loader2,
      text: "저장 중...",
      color: "text-warning",
      bgColor: "bg-warning-light",
    },
    unsaved: {
      icon: Cloud,
      text: "저장되지 않음",
      color: "text-muted-foreground",
      bgColor: "bg-gray-100",
    },
    error: {
      icon: AlertCircle,
      text: "저장 실패",
      color: "text-error",
      bgColor: "bg-error-light",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 ${config.bgColor}`}
      role="status"
      aria-live="polite"
    >
      <Icon
        className={`h-4 w-4 ${config.color} ${status === "saving" ? "animate-spin" : ""}`}
      />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>

      {lastSavedAt && status === "saved" && (
        <span className="text-xs text-muted-foreground">
          ({formatDistanceToNow(lastSavedAt, { addSuffix: true, locale: ko })})
        </span>
      )}

      {errorMessage && status === "error" && (
        <span className="text-xs text-error">
          - {errorMessage}
        </span>
      )}
    </div>
  );
}
```

### 5.3 Main Wizard Section (핵심)

#### EditableOnboardingWizard Component
- **파일**: `src/features/style-guides/components/editable-onboarding-wizard.tsx`
- **Props**:
```typescript
interface EditableOnboardingWizardProps {
  guideId: string;
  initialData: OnboardingFormData;
  onUpdate: (data: OnboardingFormData) => Promise<void>;
  onAutoSave?: (data: Partial<OnboardingFormData>) => void;
}
```

**개선 방향**:
- 기존 `OnboardingWizard`를 재사용
- `initialData`를 `defaultValues`로 주입
- 변경 감지 후 자동 저장 (debounced)
- 저장 성공/실패 토스트 표시

### 5.4 Loading State Section

#### StyleGuideEditSkeleton Component
- **파일**: `src/features/style-guides/components/style-guide-edit-skeleton.tsx`
- **Props**: 없음

#### 구현 예시:
```typescript
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function StyleGuideEditSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8 border-b pb-4">
          <div className="mb-4 flex gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="mt-2 h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>

        {/* Auto-save indicator */}
        <Skeleton className="mb-6 h-10 w-48" />

        {/* Step Indicator */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />

          <div className="flex justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,400px]">
          {/* Left: Form */}
          <div className="space-y-6 rounded-lg border bg-white p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />

            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Right: Preview */}
          <div className="h-fit rounded-lg border bg-white p-6">
            <Skeleton className="mb-4 h-6 w-32" />
            <Skeleton className="mb-6 h-24 w-full" />

            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5.5 Error State Section

#### ErrorDisplay Component
- **파일**: `src/features/style-guides/components/error-display.tsx`
- **Props**:
```typescript
interface ErrorDisplayProps {
  title?: string;
  message: string;
  errorCode?: string;
  onRetry?: () => void;
  onBack?: () => void;
}
```

#### 구현 예시:
```typescript
"use client";

import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorDisplay({
  title = "오류가 발생했습니다",
  message,
  errorCode,
  onRetry,
  onBack,
}: ErrorDisplayProps) {
  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-lg border border-error bg-error-light p-8"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-16 w-16 text-error" />

      <div className="text-center">
        <h2 className="text-2xl font-bold text-error">{title}</h2>
        <p className="mt-2 text-muted-foreground">{message}</p>

        {errorCode && (
          <p className="mt-2 text-sm text-muted-foreground">
            오류 코드: <code className="rounded bg-gray-200 px-2 py-1">{errorCode}</code>
          </p>
        )}
      </div>

      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </Button>
        )}

        {onBack && (
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-white p-4">
        <p className="text-sm text-muted-foreground">
          문제가 지속되면{" "}
          <a href="/support" className="font-medium text-primary underline">
            고객 지원팀
          </a>
          에 문의하세요.
        </p>
      </div>
    </div>
  );
}
```

## 6. 애니메이션 명세 (framer-motion)

### 6.1 Page Transition Animations

#### EditPageHeader
```typescript
import { motion } from "framer-motion";

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export function EditPageHeader({ ... }: EditPageHeaderProps) {
  return (
    <motion.div
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="border-b bg-white px-6 py-4"
    >
      {/* ... */}
    </motion.div>
  );
}
```

### 6.2 Auto-Save Indicator Animation

```typescript
const indicatorVariants = {
  saved: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.3 },
  },
  saving: {
    opacity: [1, 0.7, 1],
    transition: { repeat: Infinity, duration: 1.5 },
  },
  error: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.4 },
  },
};

export function AutoSaveIndicator({ status, ... }: AutoSaveIndicatorProps) {
  return (
    <motion.div
      variants={indicatorVariants}
      animate={status}
      role="status"
    >
      {/* ... */}
    </motion.div>
  );
}
```

### 6.3 Form Field Focus Animation

```typescript
const fieldVariants = {
  idle: {
    scale: 1,
    boxShadow: "0 0 0 0 rgba(59, 162, 248, 0)",
  },
  focused: {
    scale: 1.01,
    boxShadow: "0 0 0 3px rgba(59, 162, 248, 0.1)",
    transition: { duration: 0.2 },
  },
};

// 각 Input/Textarea에 적용
<motion.div
  variants={fieldVariants}
  initial="idle"
  whileFocus="focused"
>
  <Input {...field} />
</motion.div>
```

### 6.4 Wizard Step Transition

```typescript
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -20 : 20,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  }),
};

// OnboardingWizard에서 사용
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={stepVariants}
    initial="enter"
    animate="center"
    exit="exit"
  >
    {renderStep()}
  </motion.div>
</AnimatePresence>
```

### 6.5 Loading Skeleton Animation

```typescript
const skeletonVariants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export function StyleGuideEditSkeleton() {
  return (
    <motion.div variants={skeletonVariants} initial="initial" animate="animate">
      {/* Skeleton elements */}
    </motion.div>
  );
}
```

### 6.6 Button Interaction Animations

```typescript
const buttonVariants = {
  idle: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// Button 컴포넌트에 적용
<motion.button
  variants={buttonVariants}
  initial="idle"
  whileHover="hover"
  whileTap="tap"
>
  {children}
</motion.button>
```

### 6.7 성능 고려사항

```typescript
// GPU 가속을 위한 will-change 최적화
const optimizedVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    willChange: "opacity, transform",
  },
  visible: {
    opacity: 1,
    y: 0,
    willChange: "auto",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Layout 애니메이션 사용 (리플로우 방지)
<motion.div layout layoutId="wizard-content">
  {/* content */}
</motion.div>

// Reduced motion 지원
const shouldReduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const safeVariants = shouldReduceMotion
  ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
  : fullAnimationVariants;
```

## 7. 구현 우선순위

### 🔴 필수 (P0) - 기능 구현

1. **편집 폼 구현** (Line 105 TODO 해결)
   - `OnboardingWizard`를 편집 모드로 사용
   - 기존 스타일 가이드 데이터를 `defaultValues`로 주입
   - 예상 작업 시간: 2-3시간

2. **자동 저장 기능**
   - `useAutoSave` 훅 구현 (debounced)
   - 변경사항 추적 및 저장 상태 표시
   - 예상 작업 시간: 3-4시간

3. **에러 처리 개선**
   - 재시도 기능 추가
   - 상세한 에러 메시지 표시
   - 예상 작업 시간: 1-2시간

### 🟡 중요 (P1) - UX 개선

4. **스켈레톤 로딩 UI**
   - `StyleGuideEditSkeleton` 컴포넌트 구현
   - 레이아웃 shift 방지
   - 예상 작업 시간: 2시간

5. **페이지 헤더 재설계**
   - 브레드크럼, 메타데이터 추가
   - 액션 버튼 개선
   - 예상 작업 시간: 2-3시간

6. **변경사항 추적 및 경고**
   - Dirty state 감지
   - 페이지 이탈 시 확인 다이얼로그
   - 예상 작업 시간: 2시간

### 🟢 선택 (P2) - 고급 기능

7. **인라인 제목 편집**
   - 클릭하여 제목 즉시 수정
   - Enter/Esc 키보드 단축키
   - 예상 작업 시간: 1-2시간

8. **애니메이션 추가**
   - framer-motion 기반 부드러운 전환
   - 상태 변화 시각화
   - 예상 작업 시간: 3-4시간

9. **모바일 최적화**
   - Floating Action Bar
   - 터치 인터랙션 개선
   - 예상 작업 시간: 2-3시간

10. **다크모드 지원**
    - 인라인 스타일 제거
    - Tailwind 클래스/CSS 변수 사용
    - 예상 작업 시간: 2-3시간

## 8. 성공 지표

### ✅ 기능적 완성도
- [x] 편집 폼이 완전히 구현됨
- [x] 자동 저장 기능이 정상 작동
- [x] 변경사항이 즉시 반영됨
- [x] 에러가 적절하게 처리됨

### ✅ 사용자 경험
- [x] 로딩 상태가 명확하게 표시됨 (스켈레톤 UI)
- [x] 저장 상태를 실시간으로 확인 가능
- [x] 변경사항 손실 방지 (이탈 경고)
- [x] 직관적이고 일관된 인터페이스

### ✅ 접근성
- [x] ARIA 레이블 및 역할이 올바르게 적용됨
- [x] 키보드만으로 모든 기능 사용 가능
- [x] 스크린 리더 지원
- [x] 적절한 색상 대비 (WCAG AA 이상)

### ✅ 성능
- [x] 초기 로딩 시간 < 2초
- [x] 자동 저장 debounce로 API 호출 최소화
- [x] 애니메이션 60fps 유지
- [x] Layout shift 제거

### ✅ 반응형 디자인
- [x] 모바일 (< 640px) 최적화
- [x] 태블릿 (640px - 1024px) 최적화
- [x] 데스크톱 (> 1024px) 최적화
- [x] 터치 및 마우스 인터랙션 모두 지원

### ✅ 일관성
- [x] 신규 생성 페이지와 UI/UX 일관성 유지
- [x] 디자인 시스템 준수
- [x] 다국어 지원 (i18n)
- [x] 에러 메시지 표준화

## 9. 추가 개선 제안

### 9.1 버전 관리 (향후)

스타일 가이드 변경 히스토리를 추적하고 이전 버전으로 복원할 수 있는 기능:

```typescript
interface StyleGuideVersion {
  id: string;
  guideId: string;
  version: number;
  data: OnboardingFormData;
  createdBy: string;
  createdAt: Date;
  changeDescription?: string;
}

// 사이드바에 버전 히스토리 표시
<VersionHistory
  guideId={guideId}
  onRestore={(version) => restoreVersion(version)}
/>
```

### 9.2 협업 기능 (향후)

여러 사용자가 동시에 편집할 때 충돌 방지:

```typescript
// 실시간 편집자 표시
<ActiveEditors editors={activeEditors} />

// 필드별 잠금
<FieldLock
  isLocked={field.isLockedByOther}
  lockedBy={field.lockedBy}
/>
```

### 9.3 AI 제안 (향후)

AI가 스타일 가이드 개선을 제안:

```typescript
<AISuggestions
  currentData={formData}
  onApplySuggestion={(suggestion) => applyAISuggestion(suggestion)}
/>
```

### 9.4 A/B 테스트 (향후)

여러 스타일 가이드 버전을 테스트:

```typescript
<ABTestPanel
  variants={[variantA, variantB]}
  onSelectWinner={(variant) => setActiveVariant(variant)}
/>
```

## 10. 기술 부채 및 리팩토링 필요 사항

### 10.1 인라인 스타일 제거

**현재 문제**:
```typescript
// ❌ 하드코딩된 색상 - 다크모드 지원 불가
style={{ color: "#111827" }}
style={{ backgroundColor: "#FCFCFD" }}
```

**개선 방안**:
```typescript
// ✅ Tailwind 클래스 사용
className="text-foreground bg-background"

// ✅ CSS 변수 활용
className="text-[var(--foreground)] bg-[var(--background)]"
```

### 10.2 중복 코드 제거

**현재 문제**:
- Back 버튼이 2곳에 중복 (Line 88-96, Line 100-103)
- `OnboardingWizard`와 편집 모드 로직 분리 필요

**개선 방안**:
```typescript
// 공통 훅으로 분리
function useStyleGuideForm(mode: "create" | "edit", initialData?: OnboardingFormData) {
  // 공통 로직
}

// 컴포넌트에서 사용
const { form, handleSubmit, ... } = useStyleGuideForm("edit", guide);
```

### 10.3 타입 안전성 강화

**현재 문제**:
```typescript
// Line 38: router.push에 하드코딩된 경로
router.push("/style-guide");
```

**개선 방안**:
```typescript
// 라우트 상수 정의
const ROUTES = {
  STYLE_GUIDES: "/style-guides",
  STYLE_GUIDE_EDIT: (id: string) => `/style-guides/${id}/edit`,
  STYLE_GUIDE_NEW: "/style-guides/new",
} as const;

// 사용
router.push(ROUTES.STYLE_GUIDES);
```

## 11. 구현 체크리스트

### Phase 1: 핵심 기능 (1주)
- [ ] `OnboardingWizard`를 편집 모드로 통합
- [ ] 초기 데이터 주입 및 폼 바인딩
- [ ] 자동 저장 기능 구현 (`useAutoSave` 훅)
- [ ] `AutoSaveIndicator` 컴포넌트 구현
- [ ] 에러 처리 개선 (재시도, 상세 메시지)

### Phase 2: UX 개선 (1주)
- [ ] `EditPageHeader` 컴포넌트 구현
- [ ] 브레드크럼 네비게이션 추가
- [ ] `StyleGuideEditSkeleton` 구현
- [ ] `ErrorDisplay` 컴포넌트 개선
- [ ] 변경사항 추적 및 이탈 경고

### Phase 3: 고급 기능 (1주)
- [ ] 인라인 제목 편집 기능
- [ ] framer-motion 애니메이션 추가
- [ ] 모바일 최적화 (Floating Action Bar)
- [ ] 키보드 단축키 개선
- [ ] 접근성 테스트 및 개선

### Phase 4: 리팩토링 (1주)
- [ ] 인라인 스타일 제거 (Tailwind 클래스화)
- [ ] 중복 코드 제거 및 공통 훅 분리
- [ ] 라우트 상수화
- [ ] 다크모드 지원 준비
- [ ] E2E 테스트 작성

## 12. 결론

현재 스타일 가이드 편집 페이지는 **기능이 거의 구현되지 않은 상태**입니다. 가장 시급한 개선사항은:

1. **편집 폼 구현** (Line 105 TODO 해결)
2. **자동 저장 기능 추가**
3. **사용자 피드백 개선** (로딩/에러 상태)

이 보고서에서 제시한 개선안을 단계적으로 구현하면:
- ✅ 사용자가 직관적으로 스타일 가이드를 편집 가능
- ✅ 변경사항이 안전하게 자동 저장됨
- ✅ 명확한 상태 피드백으로 신뢰성 향상
- ✅ 신규 생성 페이지와 일관된 UX 제공
- ✅ 전문적이고 세련된 SaaS 제품 수준 달성

**다음 단계**: Phase 1 (핵심 기능)부터 시작하여 점진적으로 개선하는 것을 권장합니다.
