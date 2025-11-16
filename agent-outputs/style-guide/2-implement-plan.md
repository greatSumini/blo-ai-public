# 스타일 가이드 페이지 구현 계획

> **기반 문서**: `agent-outputs/style-guide/1-plan-critic.md`
> **작성일**: 2025-11-16
> **페이지 경로**: `src/app/[locale]/(protected)/style-guide/page.tsx`

---

## 1. 코드베이스 분석 결과

### 1.1 프로젝트 구조

```
src/
  app/
    [locale]/
      (protected)/
        style-guide/
          page.tsx                     # 현재 스타일 가이드 페이지
        style-guides/
          new/page.tsx                 # 새 가이드 생성
          [id]/edit/page.tsx           # 가이드 수정
  components/
    ui/                                # shadcn-ui 컴포넌트
      button.tsx
      card.tsx
      badge.tsx
      dialog.tsx
      input.tsx
      ...
    layout/
      page-layout.tsx                  # 공통 페이지 레이아웃
  features/
    onboarding/
      components/
        style-guide-preview-modal.tsx  # 기존 미리보기 모달
      backend/
        schema.ts                      # StyleGuideResponse 타입
        service.ts                     # Supabase CRUD
    articles/
      hooks/
        useStyleGuideQuery.ts          # React Query 훅
  messages/
    ko.json                            # 한국어 번역
    en.json                            # 영어 번역
  supabase/
    migrations/
      0002_create_style_guides_table.sql  # 테이블 스키마
```

### 1.2 기존 패턴

#### Client Component 패턴
- 모든 페이지 컴포넌트는 `"use client"` 사용
- `PageLayout` 컴포넌트로 공통 레이아웃 래핑

#### State 관리
- React Query (`@tanstack/react-query`)로 서버 상태 관리
- Local state는 `useState` 사용

#### 스타일링
- Tailwind CSS 유틸리티 클래스 기반
- 하드코딩된 색상 값 (예: `#FCFCFD`, `#E1E5EA`, `#1F2937`)
- shadcn-ui CSS 변수 (`hsl(var(--primary))`)와 혼용

#### 애니메이션
- `framer-motion` 사용 (랜딩 페이지에서 사용 중)
- 진입 애니메이션: `fadeUp`, `fadeUpStagger`
- custom delay로 stagger 효과

#### i18n
- `next-intl` 사용
- `messages/ko.json`, `messages/en.json`
- `useTranslations()` 훅으로 번역 사용

### 1.3 기술 스택

**의존성 (설치 완료)**:
- `framer-motion@11`: 애니메이션
- `next-intl@4.5.3`: 국제화
- `@tanstack/react-query@5`: 서버 상태 관리
- `lucide-react@0.469.0`: 아이콘
- `date-fns@4`: 날짜 포맷
- `zod@3`: 스키마 검증
- `react-hook-form@7`: 폼 관리

**UI 컴포넌트 (shadcn-ui)**:
- Button, Card, Badge, Dialog, Input, Table 등 모두 설치됨

---

## 2. 데이터베이스 스키마 확인

### 2.1 현재 스키마 (`style_guides` 테이블)

```sql
create table if not exists public.style_guides (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,  -- 프로필 ID로 변경됨 (0006 마이그레이션)
  brand_name text not null,
  brand_description text not null,
  personality text[] not null,
  formality formality_level not null default 'neutral',
  target_audience text not null,
  pain_points text not null,
  language language_code not null default 'ko',
  tone content_tone not null,
  content_length content_length_preference not null,
  reading_level reading_level not null,
  notes text,
  is_default boolean not null default true,  -- 이미 존재함
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 2.2 확인 사항

✅ `is_default` 필드 존재 (Stats Cards에서 "활성 가이드" 표시 가능)
✅ `created_at`, `updated_at` 존재 ("최근 생성" 통계 가능)
❌ Duplicate API 없음 (백엔드 구현 필요 → Phase 3)

### 2.3 Response 타입

```typescript
// src/features/onboarding/backend/schema.ts
export interface StyleGuideResponse {
  id: string;
  profileId: string;
  brandName: string;
  brandDescription: string;
  personality: string[];
  formality: "casual" | "neutral" | "formal";
  targetAudience: string;
  painPoints: string;
  language: "ko" | "en";
  tone: "professional" | "friendly" | "inspirational" | "educational";
  contentLength: "short" | "medium" | "long";
  readingLevel: "beginner" | "intermediate" | "advanced";
  notes: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. 파일 구조

### 3.1 생성할 파일

#### 컴포넌트 (features 기반)
```
src/features/style-guide/
  components/
    page-header.tsx                    # 페이지 헤더 (제목 + 새로만들기 버튼)
    search-bar.tsx                     # 검색 바 (조건부)
    style-guide-grid.tsx               # Grid 컨테이너
    style-guide-card.tsx               # 개별 카드 컴포넌트
    empty-state.tsx                    # Empty 상태 컴포넌트
    style-guide-preview-modal-improved.tsx  # 개선된 미리보기 모달
  lib/
    animations.ts                      # 애니메이션 variants
    utils.ts                           # 유틸리티 함수 (검색 필터링 등)
```

#### 공통 유틸리티
```
src/lib/
  style-guide/
    formatters.ts                      # 레이블 변환 함수들
```

### 3.2 수정할 파일

```
src/app/[locale]/(protected)/style-guide/
  page.tsx                             # 메인 페이지 리팩토링

messages/
  ko.json                              # 번역 키 추가
  en.json                              # 번역 키 추가
```

---

## 4. 의존성 설치

### 4.1 확인 결과

모든 필요한 패키지가 이미 설치되어 있습니다:

```bash
# 설치 불필요
# - framer-motion@11 ✅
# - next-intl@4.5.3 ✅
# - date-fns@4 ✅
# - lucide-react ✅
# - @tanstack/react-query ✅
```

---

## 5. 구현 순서

### Phase 1: 기본 구조 및 Grid View (우선순위: 높음)

#### Step 1.1: 공통 유틸리티 작성
- [x] `src/lib/style-guide/formatters.ts` 생성
- [x] 레이블 변환 함수 (`getToneLabel`, `getFormalityLabel`, etc.)

#### Step 1.2: 애니메이션 정의
- [x] `src/features/style-guide/lib/animations.ts` 생성
- [x] Grid Card 진입 애니메이션
- [x] Modal 애니메이션
- [x] Empty State 애니메이션

#### Step 1.3: 하위 컴포넌트 생성
- [x] `page-header.tsx`: 제목, 설명, 버튼
- [x] `search-bar.tsx`: 조건부 검색 바
- [x] `style-guide-card.tsx`: 개별 카드
- [x] `empty-state.tsx`: Empty 상태

#### Step 1.4: Grid 컨테이너
- [x] `style-guide-grid.tsx`: 반응형 그리드 (1열 → 2열 → 3열)

### Phase 2: Modal 및 검색 개선 (우선순위: 중간)

#### Step 2.1: 미리보기 모달 개선
- [x] `style-guide-preview-modal-improved.tsx` 생성
- [x] 섹션 기반 레이아웃 (Card 대신 border-t 구분)
- [x] 액션 버튼 (수정, 닫기)

#### Step 2.2: 검색 기능
- [x] `utils.ts`: 검색 필터링 함수
- [x] 조건부 렌더링 (10개 이상일 때만 표시)

### Phase 3: i18n 적용 (우선순위: 중간)

#### Step 3.1: 번역 키 추가
- [x] `messages/ko.json` 업데이트
- [x] `messages/en.json` 업데이트

#### Step 3.2: 하드코딩된 텍스트 교체
- [x] 모든 컴포넌트에서 `t()` 함수 사용

### Phase 4: 메인 페이지 통합 (우선순위: 높음)

#### Step 4.1: 페이지 리팩토링
- [x] `src/app/[locale]/(protected)/style-guide/page.tsx` 수정
- [x] 기존 Table View 제거
- [x] Grid View 통합
- [x] State 간소화 (viewMode, sortBy 등 제거)

### Phase 5: 테스트 및 최적화 (우선순위: 낮음)

#### Step 5.1: 반응형 테스트
- [ ] 모바일 (< 768px): 1열
- [ ] 태블릿 (768-1024px): 2열
- [ ] 데스크톱 (> 1024px): 3열

#### Step 5.2: 접근성 테스트
- [ ] 키보드 네비게이션
- [ ] Screen Reader 테스트
- [ ] ARIA 레이블 확인

#### Step 5.3: 성능 최적화
- [ ] framer-motion 번들 사이즈 확인
- [ ] Lighthouse 성능 점수 측정
- [ ] 필요 시 CSS 애니메이션으로 대체

---

## 6. 컴포넌트 상세 명세

### 6.1 공통 유틸리티: `src/lib/style-guide/formatters.ts`

```typescript
/**
 * 스타일 가이드 레이블 변환 함수들
 */

export function getToneLabel(tone: string, locale: string = "ko"): string {
  const labels: Record<string, Record<string, string>> = {
    ko: {
      professional: "전문적이고 신뢰감 있는",
      friendly: "친근하고 대화하는 듯한",
      inspirational: "영감을 주고 동기부여하는",
      educational: "교육적이고 정보 전달에 충실한",
    },
    en: {
      professional: "Professional and Trustworthy",
      friendly: "Friendly and Conversational",
      inspirational: "Inspirational and Motivating",
      educational: "Educational and Informative",
    },
  };
  return labels[locale]?.[tone] || tone;
}

export function getFormalityLabel(
  formality: string,
  locale: string = "ko"
): string {
  const labels: Record<string, Record<string, string>> = {
    ko: {
      casual: "캐주얼",
      neutral: "중립적",
      formal: "격식있는",
    },
    en: {
      casual: "Casual",
      neutral: "Neutral",
      formal: "Formal",
    },
  };
  return labels[locale]?.[formality] || formality;
}

export function getContentLengthLabel(
  length: string,
  locale: string = "ko"
): string {
  const labels: Record<string, Record<string, string>> = {
    ko: {
      short: "짧음 (1000-1500자)",
      medium: "중간 (2000-3000자)",
      long: "긴 (4000-6000자)",
    },
    en: {
      short: "Short (1000-1500 chars)",
      medium: "Medium (2000-3000 chars)",
      long: "Long (4000-6000 chars)",
    },
  };
  return labels[locale]?.[length] || length;
}

export function getReadingLevelLabel(
  level: string,
  locale: string = "ko"
): string {
  const labels: Record<string, Record<string, string>> = {
    ko: {
      beginner: "초보자도 쉽게 이해할 수 있는",
      intermediate: "중급 수준의",
      advanced: "전문적이고 심화된",
    },
    en: {
      beginner: "Beginner-friendly",
      intermediate: "Intermediate level",
      advanced: "Advanced and in-depth",
    },
  };
  return labels[locale]?.[level] || level;
}
```

---

### 6.2 애니메이션: `src/features/style-guide/lib/animations.ts`

```typescript
/**
 * 스타일 가이드 페이지 애니메이션 variants
 */

// Grid Card 진입 애니메이션 (stagger)
export const cardEnterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

// Modal 애니메이션
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// Empty State 애니메이션
export const emptyStateVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};
```

---

### 6.3 유틸리티: `src/features/style-guide/lib/utils.ts`

```typescript
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";

/**
 * 브랜드명으로 스타일 가이드 필터링
 */
export function filterStyleGuidesBySearch(
  guides: StyleGuideResponse[],
  searchQuery: string
): StyleGuideResponse[] {
  if (!searchQuery.trim()) return guides;

  const query = searchQuery.toLowerCase();
  return guides.filter((guide) =>
    guide.brandName.toLowerCase().includes(query)
  );
}
```

---

### 6.4 컴포넌트: `src/features/style-guide/components/page-header.tsx`

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface PageHeaderProps {
  onCreateNew: () => void;
}

export function PageHeader({ onCreateNew }: PageHeaderProps) {
  const t = useTranslations("styleGuide");

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-[#1F2937]">
          {t("title")}
        </h1>
        <p className="text-base text-[#6B7280] mt-2">{t("subtitle")}</p>
      </div>
      <Button
        size="lg"
        onClick={onCreateNew}
        className="bg-[#3BA2F8] hover:bg-[#2E91E6]"
      >
        <Plus className="mr-2 h-5 w-5" />
        {t("create_new")}
      </Button>
    </div>
  );
}
```

---

### 6.5 컴포넌트: `src/features/style-guide/components/search-bar.tsx`

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const t = useTranslations("styleGuide.search");

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
      <Input
        placeholder={t("placeholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 border-[#E1E5EA]"
      />
    </div>
  );
}
```

---

### 6.6 컴포넌트: `src/features/style-guide/components/style-guide-card.tsx`

```typescript
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Globe, User } from "lucide-react";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";
import { cardEnterVariants } from "../lib/animations";

interface StyleGuideCardProps {
  guide: StyleGuideResponse;
  index: number;
  onPreview: (guide: StyleGuideResponse) => void;
  onEdit: (guide: StyleGuideResponse) => void;
  onDelete: (id: string) => void;
}

export function StyleGuideCard({
  guide,
  index,
  onPreview,
  onEdit,
  onDelete,
}: StyleGuideCardProps) {
  const t = useTranslations("styleGuide");
  const locale = useLocale();
  const dateLocale = locale === "ko" ? ko : enUS;

  return (
    <motion.div
      custom={index}
      variants={cardEnterVariants}
      initial="hidden"
      animate="visible"
      className="rounded-lg border border-[#E1E5EA] bg-white p-6 space-y-4 hover:shadow-lg transition-shadow duration-300"
    >
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-[#1F2937]">
          {guide.brandName}
        </h3>
        <p className="text-sm text-[#6B7280] line-clamp-2 mt-1">
          {guide.brandDescription}
        </p>
      </div>

      {/* Personality Tags */}
      <div className="flex flex-wrap gap-2">
        {guide.personality.slice(0, 3).map((trait) => (
          <Badge
            key={trait}
            variant="outline"
            className="text-xs border-[#E1E5EA] text-[#374151]"
          >
            {trait}
          </Badge>
        ))}
        {guide.personality.length > 3 && (
          <Badge
            variant="outline"
            className="text-xs border-[#E1E5EA] text-[#374151]"
          >
            +{guide.personality.length - 3}
          </Badge>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-[#6B7280]">
        <span className="flex items-center gap-1">
          <Globe className="h-3.5 w-3.5" />
          {guide.language === "ko" ? "한국어" : "English"}
        </span>
        <span className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {guide.targetAudience}
        </span>
      </div>

      {/* Created Date */}
      <div className="text-xs text-[#6B7280]">
        {format(new Date(guide.createdAt), "PPP", { locale: dateLocale })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-[#E1E5EA]">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-[#374151] hover:bg-[#F5F7FA]"
          onClick={() => onPreview(guide)}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t("actions.preview")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-[#374151] hover:bg-[#F5F7FA]"
          onClick={() => onEdit(guide)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t("actions.edit")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-red-50"
          onClick={() => onDelete(guide.id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </motion.div>
  );
}
```

---

### 6.7 컴포넌트: `src/features/style-guide/components/style-guide-grid.tsx`

```typescript
"use client";

import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";
import { StyleGuideCard } from "./style-guide-card";

interface StyleGuideGridProps {
  guides: StyleGuideResponse[];
  onPreview: (guide: StyleGuideResponse) => void;
  onEdit: (guide: StyleGuideResponse) => void;
  onDelete: (id: string) => void;
}

export function StyleGuideGrid({
  guides,
  onPreview,
  onEdit,
  onDelete,
}: StyleGuideGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {guides.map((guide, index) => (
        <StyleGuideCard
          key={guide.id}
          guide={guide}
          index={index}
          onPreview={onPreview}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
```

---

### 6.8 컴포넌트: `src/features/style-guide/components/empty-state.tsx`

```typescript
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { emptyStateVariants } from "../lib/animations";

interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  const t = useTranslations("styleGuide.empty");

  return (
    <motion.div
      variants={emptyStateVariants}
      initial="initial"
      animate="animate"
      className="rounded-lg border border-dashed border-[#E1E5EA] p-12 text-center space-y-6 bg-white"
    >
      {/* Illustration */}
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-full bg-[#3BA2F8]/10 flex items-center justify-center">
          <FileText className="w-16 h-16 text-[#3BA2F8] opacity-30" />
        </div>
      </div>

      {/* Heading & Description */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-[#1F2937]">{t("title")}</h3>
        <p className="text-[#6B7280] max-w-md mx-auto">{t("description")}</p>
      </div>

      {/* CTA */}
      <div>
        <Button
          size="lg"
          onClick={onCreateNew}
          className="bg-[#3BA2F8] hover:bg-[#2E91E6]"
        >
          <Plus className="mr-2 h-5 w-5" />
          {t("cta")}
        </Button>
      </div>
    </motion.div>
  );
}
```

---

### 6.9 컴포넌트: `src/features/style-guide/components/style-guide-preview-modal-improved.tsx`

```typescript
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";
import {
  getToneLabel,
  getFormalityLabel,
  getContentLengthLabel,
  getReadingLevelLabel,
} from "@/lib/style-guide/formatters";

interface StyleGuidePreviewModalImprovedProps {
  guide: StyleGuideResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (guide: StyleGuideResponse) => void;
}

export function StyleGuidePreviewModalImproved({
  guide,
  isOpen,
  onClose,
  onEdit,
}: StyleGuidePreviewModalImprovedProps) {
  const t = useTranslations("styleGuide.modal");
  const locale = useLocale();
  const dateLocale = locale === "ko" ? ko : enUS;

  if (!guide) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[#E1E5EA]">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#1F2937]">
            {guide.brandName}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 mt-2 text-sm text-[#6B7280]">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(guide.createdAt), "PPP", { locale: dateLocale })}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Content - 섹션 기반 */}
        <div className="space-y-6 py-4">
          {/* Brand Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">
              {t("brandInfo")}
            </h4>
            <div className="space-y-2 text-sm text-[#374151]">
              <InfoRow
                label={t("brandName")}
                value={guide.brandName}
              />
              <InfoRow
                label={t("description")}
                value={guide.brandDescription}
              />
              <InfoRow
                label={t("personality")}
                value={guide.personality.join(", ")}
              />
              <InfoRow
                label={t("formality")}
                value={getFormalityLabel(guide.formality, locale)}
              />
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-3 border-t border-[#E1E5EA] pt-4">
            <h4 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">
              {t("targetAudience")}
            </h4>
            <div className="space-y-2 text-sm text-[#374151]">
              <InfoRow label={t("audience")} value={guide.targetAudience} />
              <InfoRow label={t("painPoints")} value={guide.painPoints} />
            </div>
          </div>

          {/* Content Style */}
          <div className="space-y-3 border-t border-[#E1E5EA] pt-4">
            <h4 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">
              {t("contentStyle")}
            </h4>
            <div className="space-y-2 text-sm text-[#374151]">
              <InfoRow
                label={t("language")}
                value={guide.language === "ko" ? "한국어" : "English"}
              />
              <InfoRow
                label={t("tone")}
                value={getToneLabel(guide.tone, locale)}
              />
              <InfoRow
                label={t("length")}
                value={getContentLengthLabel(guide.contentLength, locale)}
              />
              <InfoRow
                label={t("readingLevel")}
                value={getReadingLevelLabel(guide.readingLevel, locale)}
              />
            </div>
          </div>

          {/* Notes */}
          {guide.notes && (
            <div className="space-y-3 border-t border-[#E1E5EA] pt-4">
              <h4 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">
                {t("notes")}
              </h4>
              <p className="text-sm text-[#6B7280] whitespace-pre-wrap bg-[#F9FAFB] p-3 rounded">
                {guide.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onEdit(guide)}
            className="flex-1 border-[#E1E5EA]"
          >
            <Pencil className="mr-2 h-4 w-4" />
            {t("edit")}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-[#E1E5EA]"
          >
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper component
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="font-semibold min-w-[120px]">{label}:</span>
      <span>{value}</span>
    </div>
  );
}
```

---

### 6.10 메인 페이지: `src/app/[locale]/(protected)/style-guide/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/page-layout";
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";
import {
  useListStyleGuides,
  useDeleteStyleGuide,
} from "@/features/articles/hooks/useStyleGuideQuery";
import { PageHeader } from "@/features/style-guide/components/page-header";
import { SearchBar } from "@/features/style-guide/components/search-bar";
import { StyleGuideGrid } from "@/features/style-guide/components/style-guide-grid";
import { EmptyState } from "@/features/style-guide/components/empty-state";
import { StyleGuidePreviewModalImproved } from "@/features/style-guide/components/style-guide-preview-modal-improved";
import { filterStyleGuidesBySearch } from "@/features/style-guide/lib/utils";

type StyleGuidePageProps = {
  params: Promise<Record<string, never>>;
};

export default function StyleGuidePage({ params }: StyleGuidePageProps) {
  void params;
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useTranslations("styleGuide");

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [previewGuide, setPreviewGuide] = useState<StyleGuideResponse | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // React Query
  const {
    data: guides = [],
    isLoading,
    isError,
  } = useListStyleGuides();

  const deleteStyleGuide = useDeleteStyleGuide();

  // Window focus 시 데이터 갱신
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ["styleGuides"] });
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [queryClient]);

  // Handlers
  const handleCreateNew = () => {
    router.push("/style-guides/new");
  };

  const handlePreview = (guide: StyleGuideResponse) => {
    setPreviewGuide(guide);
    setIsPreviewOpen(true);
  };

  const handleEdit = (guide: StyleGuideResponse) => {
    router.push(`/style-guides/${guide.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("delete.confirm"))) return;

    try {
      await deleteStyleGuide.mutateAsync(id);
      toast({
        title: t("delete.success.title"),
        description: t("delete.success.desc"),
      });
    } catch (error) {
      toast({
        title: t("delete.error.title"),
        description:
          error instanceof Error ? error.message : t("delete.error.desc"),
        variant: "destructive",
      });
    }
  };

  // Filtered guides
  const filteredGuides = filterStyleGuidesBySearch(guides, searchQuery);

  // Loading state
  if (isLoading) {
    return (
      <PageLayout
        title={t("title")}
        description={t("subtitle")}
        maxWidthClassName="max-w-6xl"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#3BA2F8]" />
            <p className="text-[#6B7280]">{t("loading")}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <PageLayout
        title={t("title")}
        description={t("subtitle")}
        maxWidthClassName="max-w-6xl"
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-red-500">{t("error.load")}</p>
          <Button onClick={() => router.refresh()}>{t("retry")}</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <PageHeader onCreateNew={handleCreateNew} />
        </div>

        {/* Search Bar (조건부) */}
        {guides.length >= 10 && (
          <div className="mb-6">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        )}

        {/* Content */}
        {guides.length > 0 ? (
          <StyleGuideGrid
            guides={filteredGuides}
            onPreview={handlePreview}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyState onCreateNew={handleCreateNew} />
        )}

        {/* Preview Modal */}
        <StyleGuidePreviewModalImproved
          guide={previewGuide}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}
```

---

## 7. i18n 번역 키

### 7.1 한국어 (`messages/ko.json`)

```json
{
  "styleGuide": {
    "title": "스타일 가이드",
    "subtitle": "AI 글 생성에 사용할 블로그의 스타일 가이드를 관리합니다.",
    "create_new": "새 가이드 생성",
    "loading": "로딩 중...",
    "retry": "다시 시도",
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
        "title": "삭제 실패",
        "desc": "스타일 가이드 삭제 중 오류가 발생했습니다."
      }
    },
    "search": {
      "placeholder": "브랜드명으로 검색..."
    },
    "actions": {
      "preview": "미리보기",
      "edit": "수정",
      "delete": "삭제"
    },
    "empty": {
      "title": "스타일 가이드를 만들어보세요",
      "description": "일관된 브랜드 보이스로 AI가 콘텐츠를 생성할 수 있도록 스타일 가이드를 설정하세요.",
      "cta": "첫 가이드 만들기"
    },
    "modal": {
      "brandInfo": "브랜드 정보",
      "brandName": "브랜드명",
      "description": "설명",
      "personality": "성격 특성",
      "formality": "격식 수준",
      "targetAudience": "타겟 독자",
      "audience": "대상 독자",
      "painPoints": "해결하려는 문제",
      "contentStyle": "콘텐츠 스타일",
      "language": "언어",
      "tone": "톤",
      "length": "글 길이",
      "readingLevel": "읽기 수준",
      "notes": "추가 메모",
      "edit": "수정하기",
      "close": "닫기"
    }
  }
}
```

### 7.2 영어 (`messages/en.json`)

```json
{
  "styleGuide": {
    "title": "Style Guide",
    "subtitle": "Manage your blog's style guide for AI writing.",
    "create_new": "Create New Guide",
    "loading": "Loading...",
    "retry": "Retry",
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
        "title": "Delete Failed",
        "desc": "An error occurred while deleting the style guide."
      }
    },
    "search": {
      "placeholder": "Search by brand name..."
    },
    "actions": {
      "preview": "Preview",
      "edit": "Edit",
      "delete": "Delete"
    },
    "empty": {
      "title": "Create your first style guide",
      "description": "Set up a style guide so AI can generate content with a consistent brand voice.",
      "cta": "Create First Guide"
    },
    "modal": {
      "brandInfo": "Brand Info",
      "brandName": "Brand Name",
      "description": "Description",
      "personality": "Personality Traits",
      "formality": "Formality Level",
      "targetAudience": "Target Audience",
      "audience": "Audience",
      "painPoints": "Pain Points",
      "contentStyle": "Content Style",
      "language": "Language",
      "tone": "Tone",
      "length": "Content Length",
      "readingLevel": "Reading Level",
      "notes": "Additional Notes",
      "edit": "Edit",
      "close": "Close"
    }
  }
}
```

---

## 8. 스타일링 가이드

### 8.1 Tailwind 색상 패턴

```typescript
const colorSystem = {
  // 배경
  pageBg: "#FCFCFD",        // 페이지 배경
  cardBg: "#FFFFFF",        // 카드 배경
  emptyBg: "#FFFFFF",       // Empty 상태 배경

  // Border
  border: "#E1E5EA",        // 카드, 입력, 구분선

  // 텍스트
  heading: "#1F2937",       // 제목 (text-[#1F2937])
  body: "#374151",          // 본문 (text-[#374151])
  muted: "#6B7280",         // 보조 텍스트 (text-[#6B7280])

  // Primary (CTA)
  primary: "#3BA2F8",       // 버튼 배경
  primaryHover: "#2E91E6",  // 버튼 호버

  // Accent
  accentBg: "#F5F7FA",      // 호버 배경
  accentLight: "rgba(59, 162, 248, 0.1)", // 일러스트 배경
};
```

### 8.2 타이포그래피 스케일

```typescript
const typography = {
  // 페이지 레벨
  pageTitle: "text-4xl font-bold tracking-tight",    // 메인 제목 (36px)
  pageSubtitle: "text-base text-[#6B7280]",          // 서브타이틀 (16px)

  // 카드 레벨
  cardTitle: "text-base font-semibold text-[#1F2937]",  // 카드 제목 (16px)
  cardBody: "text-sm text-[#6B7280]",                   // 카드 본문 (14px)
  cardMeta: "text-xs text-[#6B7280]",                   // 메타데이터 (12px)

  // Modal 레벨
  modalTitle: "text-2xl text-[#1F2937]",                // 모달 제목 (24px)
  modalSectionTitle: "text-sm font-semibold text-[#6B7280] uppercase tracking-wide",
  modalBody: "text-sm text-[#374151]",                  // 모달 본문 (14px)

  // Empty State
  emptyTitle: "text-xl font-semibold text-[#1F2937]",   // Empty 제목 (20px)
  emptyDesc: "text-[#6B7280]",                          // Empty 설명 (16px)
};
```

### 8.3 간격 시스템

```typescript
const spacing = {
  // 페이지
  pageContainer: "px-4 py-8",          // 페이지 컨테이너
  sectionGap: "space-y-8",             // 섹션 간 간격

  // 카드
  cardPadding: "p-6",                  // 카드 내부 여백
  cardGap: "gap-6",                    // 카드 간 간격
  cardInnerGap: "space-y-4",           // 카드 내부 요소 간격

  // Grid
  gridGap: "gap-6",                    // Grid 간격
};
```

### 8.4 반응형 breakpoints

```typescript
const responsive = {
  mobile: "grid-cols-1",               // < 768px
  tablet: "md:grid-cols-2",            // 768px - 1024px
  desktop: "lg:grid-cols-3",           // > 1024px
};
```

---

## 9. 애니메이션 전략

### 9.1 사용할 애니메이션 (최소화)

#### Grid Card 진입 (framer-motion)
```typescript
// stagger delay로 순차적 등장
cardEnterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 }
  })
}
```

#### Grid Card 호버 (CSS)
```typescript
className="hover:shadow-lg transition-shadow duration-300"
// y 이동 없이 shadow만 변경
```

#### Modal (framer-motion)
```typescript
modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
}
```

#### Empty State (framer-motion)
```typescript
emptyStateVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 }
}
```

### 9.2 제거한 애니메이션

- ❌ Stats Cards (컴포넌트 자체 제거)
- ❌ Table Row 애니메이션 (Table View 제거)
- ❌ Button scale 애니메이션 (과도함)
- ❌ Empty State 일러스트 Pulse (산만함)

---

## 10. 데이터 흐름

### 10.1 상태 관리

```typescript
// Global State (React Query)
const { data: guides } = useListStyleGuides();
// - 서버에서 스타일 가이드 목록 가져오기
// - 자동 캐싱, 재시도, 갱신

// Local State
const [searchQuery, setSearchQuery] = useState("");
// - 검색 필터링용 로컬 상태

const [previewGuide, setPreviewGuide] = useState<StyleGuideResponse | null>(null);
const [isPreviewOpen, setIsPreviewOpen] = useState(false);
// - 미리보기 모달 상태
```

### 10.2 데이터 변환

```typescript
// 1. 서버 → 클라이언트
useListStyleGuides()
  → StyleGuideResponse[] (camelCase)

// 2. 검색 필터링
guides
  → filterStyleGuidesBySearch(guides, searchQuery)
  → filteredGuides

// 3. 렌더링
filteredGuides.map((guide, index) => (
  <StyleGuideCard guide={guide} index={index} />
))
```

---

## 11. 접근성 고려사항

### 11.1 ARIA 레이블

```typescript
// 버튼
<Button aria-label={t("styleGuide.create_new")}>
  <Plus className="mr-2 h-5 w-5" />
  {t("styleGuide.create_new")}
</Button>

// 검색 입력
<Input
  placeholder={t("styleGuide.search.placeholder")}
  aria-label="Search style guides"
/>

// 삭제 버튼
<Button
  aria-label={`Delete ${guide.brandName} style guide`}
  onClick={() => onDelete(guide.id)}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

### 11.2 키보드 네비게이션

- **Tab**: 카드 → 액션 버튼 순회
- **Enter**: 버튼 활성화
- **Esc**: 모달 닫기 (shadcn Dialog 기본 제공)

### 11.3 Focus 관리

- shadcn-ui Dialog 컴포넌트의 기본 focus trap 활용
- 모달 열릴 때: 첫 번째 포커스 가능한 요소에 focus
- 모달 닫힐 때: 이전 포커스 위치로 복귀

---

## 12. 성능 최적화

### 12.1 framer-motion 최적화

```typescript
// Tree-shaking: 필요한 컴포넌트만 import
import { motion } from "framer-motion";

// ❌ 전체 import 금지
// import * as Motion from "framer-motion";
```

### 12.2 애니메이션 성능

```typescript
// GPU 가속 속성만 사용
// ✅ opacity, transform (x, y, scale)
// ❌ width, height, top, left

// will-change 자동 적용 (framer-motion 내장)
```

### 12.3 이미지 최적화

```typescript
// Next.js Image 컴포넌트 사용 (향후 브랜드 로고 추가 시)
<Image
  src={guide.logo}
  alt={guide.brandName}
  width={40}
  height={40}
  className="rounded"
/>
```

---

## 13. 테스트 계획

### 13.1 반응형 테스트

#### 모바일 (< 768px)
- [ ] Grid 1열 레이아웃 확인
- [ ] 검색 바 전체 너비 확인
- [ ] 버튼 터치 영역 충분한지 확인
- [ ] 모달 스크롤 정상 작동 확인

#### 태블릿 (768-1024px)
- [ ] Grid 2열 레이아웃 확인
- [ ] 카드 간 간격 적절한지 확인

#### 데스크톱 (> 1024px)
- [ ] Grid 3열 레이아웃 확인
- [ ] 최대 너비 (max-w-6xl) 제대로 적용되는지 확인

### 13.2 접근성 테스트

- [ ] 키보드만으로 모든 기능 사용 가능한지 확인
- [ ] Screen Reader (VoiceOver/NVDA)로 테스트
- [ ] Color contrast 비율 WCAG AA 준수 확인
- [ ] Focus indicator 명확하게 보이는지 확인

### 13.3 기능 테스트

- [ ] 검색 필터링 정상 작동
- [ ] 미리보기 모달 데이터 정확히 표시
- [ ] 수정 버튼 클릭 시 올바른 페이지로 이동
- [ ] 삭제 확인 다이얼로그 표시
- [ ] 삭제 후 목록 자동 갱신
- [ ] Empty State에서 "새로 만들기" 버튼 작동

---

## 14. 마이그레이션 전략

### 14.1 점진적 교체

**Phase 1**: 컴포넌트 분리 (기존 코드 유지)
```typescript
// 기존 Table View 유지하면서 새 컴포넌트 추가
// - PageHeader, SearchBar, Grid, Card, EmptyState 생성
```

**Phase 2**: 페이지 교체
```typescript
// 기존 page.tsx를 새 구조로 교체
// - Table 제거
// - Grid View 통합
```

**Phase 3**: 기존 모달 교체
```typescript
// StyleGuidePreviewModal → StyleGuidePreviewModalImproved
```

### 14.2 롤백 계획

만약 문제 발생 시:
1. Git에서 이전 커밋으로 revert
2. 기존 Table View로 복귀
3. 사용자 피드백 수집 후 재시도

---

## 15. 리스크 및 대응 방안

### 15.1 리스크

**1. framer-motion 번들 사이즈 증가**
- 대응: Lighthouse 성능 점수 측정, 필요 시 CSS 애니메이션으로 대체

**2. 검색 기능이 너무 늦게 표시됨 (10개 이상)**
- 대응: 사용자 피드백 수집 후 5개부터 표시로 조정

**3. Grid View만 제공 시 일부 사용자 불만**
- 대응: 사용자 요청 시 Table View 다시 추가 (Toggle 구현)

**4. i18n 번역 누락**
- 대응: 하드코딩된 텍스트 검색 (`grep -r "\".*\"" src/features/style-guide`)

### 15.2 모니터링 계획

- **성능**: Lighthouse 점수 (목표: 90+)
- **번들 사이즈**: `next build` 후 크기 확인
- **사용자 피드백**: GitHub Issues 또는 설문조사

---

## 16. 체크리스트

### Phase 1: 기본 구조 (1-2일)

- [ ] `src/lib/style-guide/formatters.ts` 생성
- [ ] `src/features/style-guide/lib/animations.ts` 생성
- [ ] `src/features/style-guide/lib/utils.ts` 생성
- [ ] `src/features/style-guide/components/page-header.tsx` 생성
- [ ] `src/features/style-guide/components/search-bar.tsx` 생성
- [ ] `src/features/style-guide/components/style-guide-card.tsx` 생성
- [ ] `src/features/style-guide/components/style-guide-grid.tsx` 생성
- [ ] `src/features/style-guide/components/empty-state.tsx` 생성

### Phase 2: Modal 및 i18n (1일)

- [ ] `src/features/style-guide/components/style-guide-preview-modal-improved.tsx` 생성
- [ ] `messages/ko.json` 번역 키 추가
- [ ] `messages/en.json` 번역 키 추가

### Phase 3: 메인 페이지 통합 (1일)

- [ ] `src/app/[locale]/(protected)/style-guide/page.tsx` 수정
- [ ] 기존 Table View 제거
- [ ] Grid View 통합
- [ ] State 간소화

### Phase 4: 테스트 및 최적화 (1-2일)

- [ ] 반응형 테스트 (모바일, 태블릿, 데스크톱)
- [ ] 접근성 테스트 (키보드, Screen Reader)
- [ ] 성능 측정 (Lighthouse)
- [ ] 번들 사이즈 확인

---

## 17. 다음 단계 (Phase 5+)

### 우선순위 낮음 (사용자 요청 시)

**1. Table View 추가**
- View Toggle 버튼 추가
- Table 컴포넌트 재구현
- localStorage에 선호 뷰 저장

**2. Filter 기능**
- 언어 필터 (ko/en)
- 톤 필터 (professional/friendly/etc.)
- 멀티 셀렉트 드롭다운

**3. Sort 기능**
- 생성일 (최신/오래된)
- 브랜드명 (가나다/ABC)

**4. Batch Actions**
- 체크박스로 다중 선택
- 일괄 삭제 버튼

**5. Duplicate 기능**
- 백엔드 API 구현 필요
- 복사 버튼 추가

---

## 부록 A: 디렉토리 구조 (최종)

```
src/
  app/
    [locale]/
      (protected)/
        style-guide/
          page.tsx                                 # ✏️ 수정됨

  components/
    layout/
      page-layout.tsx                              # ✅ 재사용

  features/
    style-guide/                                   # 🆕 새 feature
      components/
        page-header.tsx                            # 🆕
        search-bar.tsx                             # 🆕
        style-guide-card.tsx                       # 🆕
        style-guide-grid.tsx                       # 🆕
        empty-state.tsx                            # 🆕
        style-guide-preview-modal-improved.tsx     # 🆕
      lib/
        animations.ts                              # 🆕
        utils.ts                                   # 🆕

  lib/
    style-guide/                                   # 🆕
      formatters.ts                                # 🆕

  messages/
    ko.json                                        # ✏️ 번역 키 추가
    en.json                                        # ✏️ 번역 키 추가
```

---

## 부록 B: Git Commit 전략

```bash
# Commit 1: 공통 유틸리티
git add src/lib/style-guide/formatters.ts
git add src/features/style-guide/lib/animations.ts
git add src/features/style-guide/lib/utils.ts
git commit -m "feat(style-guide): add common utilities and animations"

# Commit 2: 하위 컴포넌트
git add src/features/style-guide/components/page-header.tsx
git add src/features/style-guide/components/search-bar.tsx
git add src/features/style-guide/components/style-guide-card.tsx
git add src/features/style-guide/components/style-guide-grid.tsx
git add src/features/style-guide/components/empty-state.tsx
git commit -m "feat(style-guide): add grid view components"

# Commit 3: 모달 개선
git add src/features/style-guide/components/style-guide-preview-modal-improved.tsx
git commit -m "feat(style-guide): improve preview modal layout"

# Commit 4: i18n
git add messages/ko.json
git add messages/en.json
git commit -m "feat(style-guide): add i18n translations"

# Commit 5: 메인 페이지 통합
git add src/app/[locale]/(protected)/style-guide/page.tsx
git commit -m "feat(style-guide): migrate to grid view layout"
```

---

**작성 완료일**: 2025-11-16
**예상 작업 시간**: 4-6일
**우선순위**: Phase 1-3 (높음), Phase 4-5 (낮음)
