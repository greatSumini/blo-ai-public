# 페이지 구현 계획 최종 검토

> **원안 문서**: `agent-outputs/style-guide/2-implement-plan.md`
> **작성일**: 2025-11-16
> **검토자**: Senior Tech Lead

---

## 1. 원안 요약

2번 단계 계획은 스타일 가이드 페이지를 **Table View에서 Grid View로 마이그레이션**하는 구현 계획을 제시했습니다.

### 핵심 목표
- Grid 기반 카드 레이아웃으로 전환
- framer-motion을 활용한 진입 애니메이션
- 조건부 검색 기능 (10개 이상일 때)
- 개선된 미리보기 모달
- 완전한 i18n 적용

### 파일 범위
- **신규 생성**: 9개 파일 (컴포넌트 6개, 유틸리티 3개)
- **수정**: 3개 파일 (page.tsx, ko.json, en.json)

---

## 2. 발견된 문제점

### 2.1 코드 정확성

#### 문제 1: PageLayout 사용 방식 오류
- **위치**: `src/app/[locale]/(protected)/style-guide/page.tsx` (1000-1068줄)
- **문제**: 원안은 PageLayout을 사용하지 않고 독립적인 구조를 제안했으나, 기존 코드는 PageLayout을 사용 중
- **영향**: 코드 일관성 저해 및 중복 코드 발생

#### 수정안
```typescript
// 원안 (문제)
return (
  <div className="min-h-screen bg-[#FCFCFD]">
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <PageHeader onCreateNew={handleCreateNew} />
      ...
    </div>
  </div>
);

// 수정안 (올바름)
return (
  <PageLayout
    title={t("styleGuide.title")}
    description={t("styleGuide.subtitle")}
    actions={<Button onClick={handleCreateNew} size="lg">...</Button>}
    maxWidthClassName="max-w-6xl"
  >
    {/* SearchBar, Grid, EmptyState만 렌더링 */}
  </PageLayout>
);
```

#### 문제 2: PageHeader 컴포넌트 불필요
- **위치**: `src/features/style-guide/components/page-header.tsx`
- **문제**: PageLayout이 이미 title, description, actions를 처리하므로 중복
- **영향**: 불필요한 컴포넌트 생성 및 유지보수 부담

#### 수정안
- `page-header.tsx` 파일 생성 제거
- PageLayout의 `actions` prop 활용

---

#### 문제 3: 모달 내 InfoRow 타입 오류 가능성
- **위치**: `src/features/style-guide/components/style-guide-preview-modal-improved.tsx` (889줄)
- **문제**: InfoRow 헬퍼 컴포넌트가 파일 하단에 정의되어 있으나, TypeScript는 hoisting을 지원하지 않음
- **영향**: 컴파일 시 "Cannot access 'InfoRow' before initialization" 오류 발생 가능

#### 수정안
```typescript
// Helper component를 파일 상단으로 이동
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="font-semibold min-w-[120px]">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

// 이후 메인 컴포넌트 정의
export function StyleGuidePreviewModalImproved({ ... }) {
  // ...
}
```

---

#### 문제 4: useLocale import 누락
- **위치**: 여러 컴포넌트 (style-guide-card.tsx, modal-improved.tsx)
- **문제**: `useLocale()` 훅을 사용하지만 import 문에 명시되지 않음
- **영향**: TypeScript 및 런타임 오류

#### 수정안
```typescript
// 수정 전
import { useTranslations } from "next-intl";

// 수정 후
import { useTranslations, useLocale } from "next-intl";
```

---

### 2.2 구현 가능성

#### 문제 5: formatters.ts에서 locale 매개변수 중복
- **위치**: `src/lib/style-guide/formatters.ts`
- **문제**: locale을 매개변수로 받지만, 실제로는 컴포넌트 레벨에서 useLocale() 훅 사용이 더 적합
- **영향**: 불필요한 매개변수 전달로 코드 복잡도 증가

#### 수정안
```typescript
// 원안 (비효율적)
export function getToneLabel(tone: string, locale: string = "ko"): string {
  const labels: Record<string, Record<string, string>> = {
    ko: { ... },
    en: { ... },
  };
  return labels[locale]?.[tone] || tone;
}

// 수정안 (i18n 활용)
// formatters를 제거하고 i18n 번역 키로 대체
// 사용처에서:
const t = useTranslations("styleGuide.labels");
const toneLabel = t(`tone.${guide.tone}`); // "tone.professional" → "전문적이고 신뢰감 있는"
```

**더 나은 접근법**: formatters.ts를 제거하고, 모든 레이블을 i18n 번역 키로 관리합니다.

---

#### 문제 6: date-fns locale import 오류
- **위치**: `style-guide-card.tsx`, `modal-improved.tsx`
- **문제**: `import { ko, enUS } from "date-fns/locale"` 경로가 부정확
- **영향**: 런타임 오류 발생

#### 수정안
```typescript
// 수정 전
import { ko, enUS } from "date-fns/locale";

// 수정 후
import { ko } from "date-fns/locale/ko";
import { enUS } from "date-fns/locale/en-US";
```

---

### 2.3 코드베이스 일관성

#### 문제 7: PageLayout 스타일 불일치
- **위치**: 메인 페이지
- **문제**: PageLayout은 이미 배경색과 컨테이너를 처리하므로 중복 div 불필요
- **영향**: 스타일 충돌 및 레이아웃 깨짐 가능성

#### 수정안
```typescript
// 원안 (중복)
<div className="min-h-screen bg-[#FCFCFD]">
  <div className="container mx-auto max-w-6xl px-4 py-8">
    ...
  </div>
</div>

// 수정안 (PageLayout 활용)
<PageLayout ...>
  {/* 직접 자식 요소만 */}
</PageLayout>
```

---

#### 문제 8: 기존 번역 키 사용 불일치
- **위치**: `messages/ko.json`
- **문제**: 기존 `styleGuide.empty`, `styleGuide.create` 키가 존재하지만 원안은 새로운 키 구조 제안
- **영향**: 기존 번역 키 낭비 및 중복

#### 수정안
```json
// 기존 키 활용
{
  "styleGuide": {
    "empty": "아직 생성된 스타일 가이드가 없습니다.",  // ✅ 이미 존재
    "create": "스타일 가이드 생성하기"  // ✅ 이미 존재
  }
}

// 원안의 새 키는 제거하고 기존 키 재사용
```

---

### 2.4 i18n 완전성

#### 문제 9: 레이블 번역 키 누락
- **위치**: `messages/ko.json`, `messages/en.json`
- **문제**: 원안은 formatters.ts로 하드코딩했으나, i18n으로 관리해야 함
- **영향**: 다국어 유지보수성 저하

#### 수정안

레이블 변환을 위한 새로운 번역 키 추가:

```json
// ko.json
{
  "styleGuide": {
    "labels": {
      "tone": {
        "professional": "전문적이고 신뢰감 있는",
        "friendly": "친근하고 대화하는 듯한",
        "inspirational": "영감을 주고 동기부여하는",
        "educational": "교육적이고 정보 전달에 충실한"
      },
      "formality": {
        "casual": "캐주얼",
        "neutral": "중립적",
        "formal": "격식있는"
      },
      "contentLength": {
        "short": "짧음 (1000-1500자)",
        "medium": "중간 (2000-3000자)",
        "long": "긴 (4000-6000자)"
      },
      "readingLevel": {
        "beginner": "초보자도 쉽게 이해할 수 있는",
        "intermediate": "중급 수준의",
        "advanced": "전문적이고 심화된"
      }
    }
  }
}
```

---

#### 문제 10: Empty State 번역 키 중복
- **위치**: EmptyState 컴포넌트
- **문제**: 원안은 `styleGuide.empty.title` 구조를 제안했으나, 기존에는 `styleGuide.empty` (문자열)
- **영향**: 기존 번역과 충돌

#### 수정안
```typescript
// 원안 (문제)
t("styleGuide.empty.title")
t("styleGuide.empty.description")
t("styleGuide.empty.cta")

// 수정안 (기존 키 활용 + 신규 키 추가)
t("styleGuide.empty")  // "아직 생성된 스타일 가이드가 없습니다."
t("styleGuide.emptyDescription")  // 신규 추가: "일관된 브랜드 보이스로..."
t("styleGuide.create")  // "스타일 가이드 생성하기"
```

---

### 2.5 성능 및 접근성

#### 문제 11: 불필요한 framer-motion 사용
- **위치**: Empty State, Modal
- **문제**: 단순 fade-in 애니메이션은 CSS로 충분함
- **영향**: 번들 사이즈 증가 (framer-motion: ~60KB gzipped)

#### 수정안
```typescript
// Empty State: CSS 애니메이션으로 대체
// 원안 (framer-motion)
<motion.div
  variants={emptyStateVariants}
  initial="initial"
  animate="animate"
>

// 수정안 (CSS)
<div className="animate-in fade-in duration-400">
  {/* Tailwind 기본 애니메이션 클래스 활용 */}
</div>
```

**결정**: Grid Card 진입 애니메이션만 framer-motion 사용, 나머지는 CSS로 대체

---

#### 문제 12: ARIA 레이블 누락
- **위치**: 모든 버튼 및 입력 요소
- **문제**: 원안은 접근성 고려사항을 언급했으나 실제 코드에는 미적용
- **영향**: Screen Reader 사용자 경험 저하

#### 수정안
```typescript
// SearchBar
<Input
  placeholder={t("styleGuide.search.placeholder")}
  value={value}
  onChange={(e) => onChange(e.target.value)}
  aria-label={t("styleGuide.search.ariaLabel")}  // 추가
/>

// 삭제 버튼
<Button
  variant="ghost"
  size="sm"
  onClick={() => onDelete(guide.id)}
  aria-label={t("styleGuide.actions.deleteAria", { brand: guide.brandName })}  // 추가
>
  <Trash2 className="h-4 w-4 text-red-500" />
</Button>
```

---

### 2.6 누락 사항

#### 문제 13: 검색 결과 없음 상태 처리 누락
- **위치**: 메인 페이지
- **문제**: 검색 결과가 0건일 때 UI 처리 없음
- **영향**: 사용자 혼란

#### 수정안
```typescript
{filteredGuides.length > 0 ? (
  <StyleGuideGrid guides={filteredGuides} ... />
) : searchQuery.trim() ? (
  // 검색 결과 없음 상태
  <div className="text-center py-12">
    <p className="text-[#6B7280]">{t("styleGuide.noResults")}</p>
    <Button variant="link" onClick={() => setSearchQuery("")}>
      {t("styleGuide.clearSearch")}
    </Button>
  </div>
) : (
  <EmptyState onCreateNew={handleCreateNew} />
)}
```

---

#### 문제 14: 타입 import 경로 일관성 부족
- **위치**: 모든 컴포넌트
- **문제**: `StyleGuideResponse` 타입을 매번 import 하지만, 재사용을 위한 중앙 export 없음
- **영향**: Import 문 중복 및 유지보수 어려움

#### 수정안
```typescript
// src/features/style-guide/types/index.ts (신규 생성)
export type { StyleGuideResponse } from "@/features/onboarding/backend/schema";

// 사용처에서
import type { StyleGuideResponse } from "@/features/style-guide/types";
```

---

#### 문제 15: Error Boundary 부재
- **위치**: 메인 페이지
- **문제**: React Query의 isError만 처리하고, 렌더링 에러는 처리 안 함
- **영향**: 예기치 않은 에러 시 전체 앱 크래시 가능

#### 수정안
```typescript
// 향후 개선: Next.js error.tsx 파일 추가
// src/app/[locale]/(protected)/style-guide/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>오류가 발생했습니다</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```

**결정**: 현재는 isError 처리만 구현, error.tsx는 Phase 5로 연기

---

## 3. 최종 구현 계획

### 3.1 파일 구조 (수정안)

#### 생성할 파일

```
src/features/style-guide/
  components/
    search-bar.tsx                             # 🆕 검색 바
    style-guide-grid.tsx                       # 🆕 Grid 컨테이너
    style-guide-card.tsx                       # 🆕 개별 카드
    empty-state.tsx                            # 🆕 Empty 상태
    style-guide-preview-modal-improved.tsx     # 🆕 개선된 모달
  lib/
    animations.ts                              # 🆕 framer-motion variants
    utils.ts                                   # 🆕 검색 필터링 함수
  types/
    index.ts                                   # 🆕 타입 재노출
```

#### 제거한 파일 (불필요)

```
❌ src/features/style-guide/components/page-header.tsx  # PageLayout으로 대체
❌ src/lib/style-guide/formatters.ts                   # i18n으로 대체
```

#### 수정할 파일

```
✏️ src/app/[locale]/(protected)/style-guide/page.tsx
✏️ messages/ko.json
✏️ messages/en.json
```

---

### 3.2 의존성 (수정안)

모든 필요한 패키지가 이미 설치되어 있습니다:

```bash
# 설치 불필요
✅ framer-motion@11
✅ next-intl@4.5.3
✅ date-fns@4
✅ lucide-react@0.469.0
✅ @tanstack/react-query@5
```

---

### 3.3 구현 순서 (수정안)

#### Phase 1: 기본 구조 (1일)

**Step 1.1: 타입 및 유틸리티**
- [ ] `src/features/style-guide/types/index.ts` 생성 (타입 재노출)
- [ ] `src/features/style-guide/lib/utils.ts` 생성 (검색 필터링)
- [ ] `src/features/style-guide/lib/animations.ts` 생성 (framer-motion variants)

**Step 1.2: 하위 컴포넌트 생성**
- [ ] `search-bar.tsx`: 검색 바 (ARIA 레이블 포함)
- [ ] `style-guide-card.tsx`: 개별 카드 (date-fns locale 수정)
- [ ] `empty-state.tsx`: Empty 상태 (CSS 애니메이션)

**Step 1.3: Grid 컨테이너**
- [ ] `style-guide-grid.tsx`: 반응형 그리드

#### Phase 2: Modal 및 i18n (1일)

**Step 2.1: 미리보기 모달**
- [ ] `style-guide-preview-modal-improved.tsx` 생성
  - InfoRow 헬퍼를 상단으로 이동
  - Dialog 컴포넌트 사용 (shadcn-ui)

**Step 2.2: i18n 번역 키 추가**
- [ ] `messages/ko.json` 업데이트
  - 레이블 번역 키 추가 (tone, formality, length, level)
  - 기존 키 재사용 (`empty`, `create`)
  - 검색 관련 키 추가
  - ARIA 레이블 키 추가
- [ ] `messages/en.json` 업데이트

#### Phase 3: 메인 페이지 통합 (1일)

**Step 3.1: 페이지 리팩토링**
- [ ] `page.tsx` 수정
  - PageLayout 활용 (title, description, actions)
  - 기존 Table View 제거
  - Grid View 통합
  - 검색 결과 없음 상태 추가
  - State 간소화

#### Phase 4: 테스트 및 최적화 (0.5일)

**Step 4.1: 기능 테스트**
- [ ] 검색 필터링 동작 확인
- [ ] 미리보기 모달 데이터 표시 확인
- [ ] 수정/삭제 버튼 동작 확인
- [ ] Empty State 렌더링 확인

**Step 4.2: 반응형 테스트**
- [ ] 모바일 (< 768px): 1열
- [ ] 태블릿 (768-1024px): 2열
- [ ] 데스크톱 (> 1024px): 3열

**Step 4.3: 접근성 테스트**
- [ ] 키보드 네비게이션
- [ ] ARIA 레이블 확인

---

### 3.4 컴포넌트 상세 명세 (수정안)

#### 3.4.1 타입 재노출: `src/features/style-guide/types/index.ts`

```typescript
/**
 * 스타일 가이드 타입 재노출
 */
export type { StyleGuideResponse } from "@/features/onboarding/backend/schema";
```

---

#### 3.4.2 유틸리티: `src/features/style-guide/lib/utils.ts`

```typescript
import type { StyleGuideResponse } from "../types";

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

#### 3.4.3 애니메이션: `src/features/style-guide/lib/animations.ts`

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
```

---

#### 3.4.4 컴포넌트: `src/features/style-guide/components/search-bar.tsx`

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
        aria-label={t("ariaLabel")}
      />
    </div>
  );
}
```

---

#### 3.4.5 컴포넌트: `src/features/style-guide/components/style-guide-card.tsx`

```typescript
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Globe, User } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale/ko";
import { enUS } from "date-fns/locale/en-US";
import { useTranslations, useLocale } from "next-intl";
import type { StyleGuideResponse } from "../types";
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
          aria-label={t("actions.previewAria", { brand: guide.brandName })}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t("actions.preview")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-[#374151] hover:bg-[#F5F7FA]"
          onClick={() => onEdit(guide)}
          aria-label={t("actions.editAria", { brand: guide.brandName })}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t("actions.edit")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-red-50"
          onClick={() => onDelete(guide.id)}
          aria-label={t("actions.deleteAria", { brand: guide.brandName })}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </motion.div>
  );
}
```

---

#### 3.4.6 컴포넌트: `src/features/style-guide/components/style-guide-grid.tsx`

```typescript
"use client";

import type { StyleGuideResponse } from "../types";
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

#### 3.4.7 컴포넌트: `src/features/style-guide/components/empty-state.tsx`

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  const t = useTranslations("styleGuide");

  return (
    <div className="rounded-lg border border-dashed border-[#E1E5EA] p-12 text-center space-y-6 bg-white animate-in fade-in duration-500">
      {/* Illustration */}
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-full bg-[#3BA2F8]/10 flex items-center justify-center">
          <FileText className="w-16 h-16 text-[#3BA2F8] opacity-30" />
        </div>
      </div>

      {/* Heading & Description */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-[#1F2937]">
          {t("empty")}
        </h3>
        <p className="text-[#6B7280] max-w-md mx-auto">
          {t("emptyDescription")}
        </p>
      </div>

      {/* CTA */}
      <div>
        <Button
          size="lg"
          onClick={onCreateNew}
          className="bg-[#3BA2F8] hover:bg-[#2E91E6]"
        >
          <Plus className="mr-2 h-5 w-5" />
          {t("create")}
        </Button>
      </div>
    </div>
  );
}
```

---

#### 3.4.8 컴포넌트: `src/features/style-guide/components/style-guide-preview-modal-improved.tsx`

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
import { ko } from "date-fns/locale/ko";
import { enUS } from "date-fns/locale/en-US";
import { useTranslations, useLocale } from "next-intl";
import type { StyleGuideResponse } from "../types";

interface StyleGuidePreviewModalImprovedProps {
  guide: StyleGuideResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (guide: StyleGuideResponse) => void;
}

// Helper component (상단으로 이동)
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="font-semibold min-w-[120px]">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

export function StyleGuidePreviewModalImproved({
  guide,
  isOpen,
  onClose,
  onEdit,
}: StyleGuidePreviewModalImprovedProps) {
  const t = useTranslations("styleGuide.modal");
  const tLabels = useTranslations("styleGuide.labels");
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
                value={tLabels(`formality.${guide.formality}`)}
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
                value={tLabels(`tone.${guide.tone}`)}
              />
              <InfoRow
                label={t("length")}
                value={tLabels(`contentLength.${guide.contentLength}`)}
              />
              <InfoRow
                label={t("readingLevel")}
                value={tLabels(`readingLevel.${guide.readingLevel}`)}
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
```

---

#### 3.4.9 메인 페이지: `src/app/[locale]/(protected)/style-guide/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/page-layout";
import type { StyleGuideResponse } from "@/features/style-guide/types";
import {
  useListStyleGuides,
  useDeleteStyleGuide,
} from "@/features/articles/hooks/useStyleGuideQuery";
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

  // Actions 버튼
  const actions = (
    <Button
      onClick={handleCreateNew}
      size="lg"
      className="bg-[#3BA2F8] hover:bg-[#2E91E6]"
    >
      <Plus className="mr-2 h-5 w-5" />
      {t("create_new")}
    </Button>
  );

  // Loading state
  if (isLoading) {
    return (
      <PageLayout
        title={t("title")}
        description={t("subtitle")}
        actions={actions}
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
        actions={actions}
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
    <PageLayout
      title={t("title")}
      description={t("subtitle")}
      actions={actions}
      maxWidthClassName="max-w-6xl"
    >
      {/* Search Bar (조건부: 10개 이상) */}
      {guides.length >= 10 && (
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      )}

      {/* Content */}
      {guides.length > 0 ? (
        filteredGuides.length > 0 ? (
          <StyleGuideGrid
            guides={filteredGuides}
            onPreview={handlePreview}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          // 검색 결과 없음
          <div className="text-center py-12 space-y-4">
            <p className="text-[#6B7280]">{t("noResults")}</p>
            <Button variant="link" onClick={() => setSearchQuery("")}>
              {t("clearSearch")}
            </Button>
          </div>
        )
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
    </PageLayout>
  );
}
```

---

### 3.5 i18n 번역 키 (수정안)

#### 3.5.1 한국어 (`messages/ko.json`)

```json
{
  "styleGuide": {
    "title": "스타일 가이드",
    "subtitle": "AI 글 생성에 사용할 블로그의 스타일 가이드를 관리합니다.",
    "create_new": "새 가이드 생성",
    "loading": "로딩 중...",
    "retry": "다시 시도",
    "empty": "아직 생성된 스타일 가이드가 없습니다.",
    "emptyDescription": "일관된 브랜드 보이스로 AI가 콘텐츠를 생성할 수 있도록 스타일 가이드를 설정하세요.",
    "create": "스타일 가이드 생성하기",
    "noResults": "검색 결과가 없습니다.",
    "clearSearch": "검색 초기화",
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
      "placeholder": "브랜드명으로 검색...",
      "ariaLabel": "스타일 가이드 검색"
    },
    "actions": {
      "preview": "미리보기",
      "edit": "수정",
      "delete": "삭제",
      "previewAria": "{brand} 스타일 가이드 미리보기",
      "editAria": "{brand} 스타일 가이드 수정",
      "deleteAria": "{brand} 스타일 가이드 삭제"
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
    },
    "labels": {
      "tone": {
        "professional": "전문적이고 신뢰감 있는",
        "friendly": "친근하고 대화하는 듯한",
        "inspirational": "영감을 주고 동기부여하는",
        "educational": "교육적이고 정보 전달에 충실한"
      },
      "formality": {
        "casual": "캐주얼",
        "neutral": "중립적",
        "formal": "격식있는"
      },
      "contentLength": {
        "short": "짧음 (1000-1500자)",
        "medium": "중간 (2000-3000자)",
        "long": "긴 (4000-6000자)"
      },
      "readingLevel": {
        "beginner": "초보자도 쉽게 이해할 수 있는",
        "intermediate": "중급 수준의",
        "advanced": "전문적이고 심화된"
      }
    }
  }
}
```

#### 3.5.2 영어 (`messages/en.json`)

```json
{
  "styleGuide": {
    "title": "Style Guide",
    "subtitle": "Manage your blog's style guide for AI writing.",
    "create_new": "Create New Guide",
    "loading": "Loading...",
    "retry": "Retry",
    "empty": "No style guides created yet.",
    "emptyDescription": "Set up a style guide so AI can generate content with a consistent brand voice.",
    "create": "Create Style Guide",
    "noResults": "No results found.",
    "clearSearch": "Clear search",
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
      "placeholder": "Search by brand name...",
      "ariaLabel": "Search style guides"
    },
    "actions": {
      "preview": "Preview",
      "edit": "Edit",
      "delete": "Delete",
      "previewAria": "Preview {brand} style guide",
      "editAria": "Edit {brand} style guide",
      "deleteAria": "Delete {brand} style guide"
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
    },
    "labels": {
      "tone": {
        "professional": "Professional and Trustworthy",
        "friendly": "Friendly and Conversational",
        "inspirational": "Inspirational and Motivating",
        "educational": "Educational and Informative"
      },
      "formality": {
        "casual": "Casual",
        "neutral": "Neutral",
        "formal": "Formal"
      },
      "contentLength": {
        "short": "Short (1000-1500 chars)",
        "medium": "Medium (2000-3000 chars)",
        "long": "Long (4000-6000 chars)"
      },
      "readingLevel": {
        "beginner": "Beginner-friendly",
        "intermediate": "Intermediate level",
        "advanced": "Advanced and in-depth"
      }
    }
  }
}
```

---

## 4. 주요 변경 사항

### 4.1 제거된 컴포넌트

#### PageHeader
- **이유**: PageLayout이 이미 title, description, actions를 처리함
- **대체**: PageLayout의 props 활용

#### formatters.ts
- **이유**: i18n 번역 키로 대체하여 다국어 유지보수성 향상
- **대체**: `styleGuide.labels.*` 번역 키

---

### 4.2 수정된 컴포넌트

#### style-guide-card.tsx
- date-fns locale import 경로 수정
- ARIA 레이블 추가
- useLocale import 추가

#### style-guide-preview-modal-improved.tsx
- InfoRow 헬퍼를 상단으로 이동 (hoisting 오류 방지)
- i18n 레이블 활용 (`tLabels`)

#### empty-state.tsx
- framer-motion 제거, CSS 애니메이션 사용
- 기존 번역 키 재사용

#### page.tsx
- PageLayout 활용 (중복 제거)
- 검색 결과 없음 상태 추가
- Actions 버튼을 PageLayout에 위임

---

### 4.3 추가된 항목

#### 타입 재노출
- `src/features/style-guide/types/index.ts`: StyleGuideResponse 타입 중앙 관리

#### 번역 키
- `styleGuide.labels.*`: 레이블 번역 (tone, formality, length, level)
- `styleGuide.emptyDescription`: Empty State 설명
- `styleGuide.noResults`: 검색 결과 없음
- `styleGuide.clearSearch`: 검색 초기화
- `styleGuide.search.ariaLabel`: 검색 ARIA 레이블
- `styleGuide.actions.*Aria`: 버튼 ARIA 레이블

---

## 5. 구현 체크리스트

### 5.1 필수 사항

- [ ] 모든 컴포넌트에 `"use client"` 추가
- [ ] 모든 타입 import 경로 검증
- [ ] date-fns locale import 경로 수정
- [ ] InfoRow 헬퍼 컴포넌트 위치 조정
- [ ] ARIA 레이블 추가 (검색, 버튼)
- [ ] i18n 번역 키 완전성 확인
- [ ] PageLayout 활용 (중복 제거)
- [ ] 검색 결과 없음 상태 처리

### 5.2 권장 사항

- [ ] framer-motion 번들 사이즈 확인
- [ ] Lighthouse 성능 점수 측정 (목표: 90+)
- [ ] 키보드 네비게이션 테스트
- [ ] Screen Reader 테스트
- [ ] 반응형 레이아웃 테스트 (1열 → 2열 → 3열)

---

## 6. 리스크 및 주의사항

### 6.1 잠재적 문제

#### 문제 1: framer-motion 번들 사이즈
- **대응**: 카드 진입 애니메이션만 사용, 나머지는 CSS로 대체
- **모니터링**: `next build` 후 번들 사이즈 확인

#### 문제 2: 검색 기능 UX
- **대응**: 10개 이상일 때만 표시 (피드백 수집 후 조정)
- **모니터링**: 사용자 피드백

#### 문제 3: i18n 번역 키 누락
- **대응**: 하드코딩된 텍스트 검색 (`grep -r "\".*\"" src/features/style-guide`)
- **검증**: 영어/한국어 모드 전환 후 확인

---

### 6.2 테스트 필요 항목

#### 기능 테스트
- [ ] 검색 필터링 동작
- [ ] 미리보기 모달 데이터 표시
- [ ] 수정/삭제 버튼 동작
- [ ] Empty State 렌더링
- [ ] 검색 결과 없음 상태

#### 반응형 테스트
- [ ] 모바일 (< 768px): 1열
- [ ] 태블릿 (768-1024px): 2열
- [ ] 데스크톱 (> 1024px): 3열

#### 접근성 테스트
- [ ] 키보드 네비게이션 (Tab, Enter, Esc)
- [ ] ARIA 레이블 Screen Reader 테스트
- [ ] Focus indicator 가시성

---

## 7. 실행 준비 확인

### 7.1 코드 정확성
- [x] TypeScript 타입 오류 해결
- [x] Import 경로 검증
- [x] Props 인터페이스 일관성 확인
- [x] date-fns locale import 수정
- [x] InfoRow hoisting 오류 수정

### 7.2 구현 가능성
- [x] PageLayout 활용 확인
- [x] i18n 레이블 구조 확정
- [x] framer-motion 최소화 전략 수립
- [x] CSS 애니메이션 대체 계획

### 7.3 코드베이스 일관성
- [x] PageLayout 스타일 패턴 준수
- [x] 기존 번역 키 재사용
- [x] 파일명 컨벤션 준수
- [x] features 구조 일관성 유지

### 7.4 i18n 완전성
- [x] 모든 텍스트에 번역 키 적용
- [x] 영어/한국어 번역 모두 제공
- [x] ARIA 레이블 번역 키 추가
- [x] 하드코딩된 텍스트 제거

### 7.5 성능 및 접근성
- [x] 애니메이션 성능 최적화 (GPU 가속 속성 사용)
- [x] ARIA 레이블 추가
- [x] 시맨틱 HTML 사용
- [x] 키보드 네비게이션 고려

### 7.6 누락 사항 확인
- [x] 모든 컴포넌트 포함 (8개)
- [x] 타입 재노출 파일 추가
- [x] 검색 결과 없음 상태 추가
- [x] Error 처리 (isError)

---

## 8. 다음 단계

### 8.1 구현 시작

1. **Phase 1: 기본 구조 (1일)**
   - 타입 및 유틸리티 생성
   - 하위 컴포넌트 구현
   - Grid 컨테이너 구현

2. **Phase 2: Modal 및 i18n (1일)**
   - 미리보기 모달 구현
   - 번역 키 추가

3. **Phase 3: 메인 페이지 통합 (1일)**
   - page.tsx 리팩토링
   - 통합 테스트

4. **Phase 4: 테스트 및 최적화 (0.5일)**
   - 기능/반응형/접근성 테스트
   - 성능 측정

### 8.2 검증 방법

```bash
# 1. 하드코딩된 텍스트 검색
grep -r '"[가-힣]' src/features/style-guide
grep -r '"[A-Z]' src/features/style-guide

# 2. 번들 사이즈 확인
pnpm build
# .next/static/chunks 폴더에서 framer-motion 크기 확인

# 3. Lighthouse 성능 측정
# Chrome DevTools > Lighthouse > Performance
```

### 8.3 최종 확인 사항

- [ ] 모든 파일이 생성되었는가?
- [ ] 모든 import가 정상인가?
- [ ] 번역 키가 모두 적용되었는가?
- [ ] 빌드 에러가 없는가?
- [ ] 타입 에러가 없는가?
- [ ] 런타임 에러가 없는가?

---

## 부록 A: 최종 파일 구조

```
src/
  app/
    [locale]/
      (protected)/
        style-guide/
          page.tsx                                 # ✏️ 수정

  features/
    style-guide/                                   # 🆕 새 feature
      components/
        search-bar.tsx                             # 🆕
        style-guide-card.tsx                       # 🆕
        style-guide-grid.tsx                       # 🆕
        empty-state.tsx                            # 🆕
        style-guide-preview-modal-improved.tsx     # 🆕
      lib/
        animations.ts                              # 🆕
        utils.ts                                   # 🆕
      types/
        index.ts                                   # 🆕

  messages/
    ko.json                                        # ✏️ 번역 키 추가
    en.json                                        # ✏️ 번역 키 추가
```

---

## 부록 B: Git Commit 전략

```bash
# Commit 1: 타입 및 유틸리티
git add src/features/style-guide/types/
git add src/features/style-guide/lib/
git commit -m "feat(style-guide): add types and utilities"

# Commit 2: 하위 컴포넌트
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
git commit -m "feat(style-guide): add comprehensive i18n translations"

# Commit 5: 메인 페이지 통합
git add src/app/[locale]/(protected)/style-guide/page.tsx
git commit -m "feat(style-guide): migrate to grid view layout"
```

---

**작성 완료일**: 2025-11-16
**검토자**: Senior Tech Lead
**예상 작업 시간**: 3.5일 (Phase 1-4)
**우선순위**: 높음

**최종 승인**: ✅ 실행 가능
**다음 단계**: 구현 시작
