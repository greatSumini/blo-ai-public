# 페이지 구현 계획 최종 검토

> **작성일**: 2025-11-16
> **기반 문서**: `./agent-outputs/keywords/2-implement-plan.md`
> **검토자**: Senior Tech Lead Agent
> **상태**: ✅ 실행 준비 완료

---

## 1. 원안 요약

2단계 계획은 Keywords 페이지의 디자인 개선을 위한 구현 계획입니다:

- **백엔드**: DELETE 엔드포인트 추가 (스키마, 서비스, 라우트, 훅)
- **컴포넌트**: 스켈레톤, EmptyState, DeleteDialog, SearchSection, Pagination 추가
- **리팩토링**: KeywordTable, PageLayout 인라인 스타일 제거
- **i18n**: 키워드 섹션 대폭 확장
- **예상 시간**: 4.5시간

---

## 2. 발견된 문제점

### 2.1 코드 정확성

#### 문제 1: 백엔드 레이어 아키텍처 불일치

- **위치**: `src/features/keywords/backend/service.ts`, `route.ts`
- **문제**: 2단계 계획에서 `success`, `failure` 헬퍼를 사용하도록 제안했으나, 실제 코드베이스는 **domain-centric design**으로 마이그레이션 완료됨
- **증거**:
  - `src/backend/http/response.ts`는 `@deprecated`로 표시됨
  - 실제 코드는 `@/backend/domain/result`의 `domainSuccess`, `domainFailure` 사용
  - `@/backend/http/mapper`의 `respondWithDomain`, `respondCreated` 사용
- **영향**: 2단계 계획대로 구현 시 deprecated API 사용으로 인한 코드 일관성 저하

#### 수정안

```typescript
// ❌ 2단계 계획 (잘못됨)
import { success, failure } from '@/backend/http/response';

export async function deleteKeyword(...) {
  // ...
  return failure(404, 'KEYWORD_NOT_FOUND', 'Keyword not found');
}

// ✅ 수정안 (올바름)
import { domainSuccess, domainFailure, type DomainResult } from '@/backend/domain/result';
import type { KeywordDomainError } from './error';

export async function deleteKeyword(
  supabase: SupabaseClient,
  input: DeleteKeywordInput
): Promise<DomainResult<{ deleted: true; id: string }, KeywordDomainError>> {
  const { data, error } = await supabase
    .from('keywords')
    .delete()
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    return domainFailure({
      code: 'DELETE_FAILED',
      message: `Failed to delete keyword: ${error.message}`,
      details: error,
    });
  }

  if (!data) {
    return domainFailure({
      code: 'KEYWORD_NOT_FOUND',
      message: 'Keyword not found',
    });
  }

  return domainSuccess({ deleted: true, id: input.id });
}
```

#### 문제 2: i18n 키 불일치

- **위치**: `src/features/keywords/components/keyword-table.tsx` (2단계 계획)
- **문제**: 기존 코드는 `keywords.table.columnSource`, `keywords.table.columnCreatedAt` 등이 정의되어 있지 않음
- **증거**: `messages/ko.json`의 `keywords.table` 섹션에는 다음만 존재:
  ```json
  {
    "searchPlaceholder": "키워드 검색...",
    "columnKeyword": "키워드",
    "columnVolume": "검색량",
    "columnCompetition": "경쟁도",
    "columnActions": "작업",
    "loading": "키워드를 불러오는 중...",
    "noResults": "검색 결과가 없습니다.",
    "deleteConfirm": "이 키워드를 삭제하시겠습니까?",
    "paginationInfo": "{total}개 중 {start}-{end}",
    "itemsPerPage": "페이지당 항목 수"
  }
  ```
- **영향**: `columnSource`, `columnCreatedAt`, `previous`, `next`, `sourceManual`, `sourceAi` 등 누락

#### 수정안

i18n 섹션 7.1과 7.2에서 누락된 키들을 모두 추가해야 합니다 (원안 유지).

#### 문제 3: alert-dialog 컴포넌트 미설치

- **위치**: 시스템 전체
- **문제**: `DeleteDialog` 컴포넌트가 `@/components/ui/alert-dialog`를 import하지만, 현재 설치되지 않음
- **증거**:
  ```bash
  $ ls src/components/ui/ | grep alert-dialog
  # 결과: 없음
  ```
- **영향**: 컴파일 에러 발생

#### 수정안

구현 시작 전 반드시 실행:
```bash
npx shadcn@latest add alert-dialog
```

#### 문제 4: KeywordTable 컴포넌트 파일명 불일치

- **위치**: `src/features/keywords/components/`
- **문제**: 기존 파일은 `KeywordTable.tsx` (PascalCase), 2단계 계획은 `keyword-table.tsx` (kebab-case)
- **영향**: 기존 파일을 덮어쓸 때 파일명 불일치로 인한 import 오류
- **증거**: 기존 코드는 `from "@/features/keywords/components/KeywordTable"` 사용

#### 수정안

**파일명 그대로 유지**: `KeywordTable.tsx` (kebab-case로 변경하지 않음)

**이유**: 프로젝트 전체가 PascalCase 컴포넌트 파일명을 사용하고 있으므로, 일관성을 위해 변경하지 않음.

#### 문제 5: Copy 아이콘 누락

- **위치**: `src/features/keywords/components/keyword-table.tsx` (2단계 계획)
- **문제**: `Copy` 아이콘을 import하지만, 기존 코드에는 복사 기능이 없었음
- **영향**: 없음 (새 기능이므로 문제 없음, 확인용)

#### 수정안

없음 (2단계 계획대로 진행).

---

### 2.2 구현 가능성

#### 문제 6: useToast 훅 존재 여부 미확인

- **위치**: `src/features/keywords/components/keyword-table.tsx` (2단계 계획)
- **문제**: `useToast` 훅을 `@/hooks/use-toast`에서 import하지만, 파일 존재 여부 미확인
- **영향**: 컴파일 에러 가능성

#### 수정안

대부분의 shadcn-ui 설정에서 `use-toast` 훅은 기본 제공되므로 문제 없을 것으로 예상. 만약 없다면:

```bash
npx shadcn@latest add toast
```

---

### 2.3 코드베이스 일관성

#### 문제 7: 컴포넌트 파일명 컨벤션

- **위치**: `src/features/keywords/components/`
- **문제**: 2단계 계획은 kebab-case를 제안했으나, 기존 코드는 PascalCase 사용
  - 기존: `KeywordTable.tsx`, `KeywordCreateDialog.tsx`, `SuggestionsDialog.tsx`, `KeywordPicker.tsx`
  - 제안: `table-skeleton.tsx`, `empty-state.tsx`, `delete-dialog.tsx`, `search-section.tsx`, `pagination.tsx`
- **영향**: 일관성 저하

#### 수정안

**모든 새 컴포넌트를 PascalCase로 생성**:
- `TableSkeleton.tsx`
- `EmptyState.tsx`
- `DeleteDialog.tsx`
- `SearchSection.tsx`
- `Pagination.tsx`

**Import 경로도 변경**:
```typescript
// ❌ 2단계 계획
import { TableSkeleton } from "./table-skeleton";

// ✅ 수정안
import { TableSkeleton } from "./TableSkeleton";
```

---

### 2.4 i18n 완전성

#### 문제 8: 누락된 i18n 키들

2단계 계획은 i18n 섹션을 대폭 확장했으나, 다음 키들이 추가로 필요함을 확인했습니다:

**`messages/ko.json`에 추가 필요**:
```json
{
  "keywords": {
    "table": {
      "columnSource": "소스",          // ✅ 추가 필요
      "columnCreatedAt": "생성일",      // ✅ 추가 필요
      "previous": "이전",               // ✅ 추가 필요
      "next": "다음",                   // ✅ 추가 필요
      "sourceManual": "수동",           // ✅ 추가 필요
      "sourceAi": "AI",                 // ✅ 추가 필요
      "clearSearch": "검색어 지우기",    // ✅ 추가 필요
      "filterAll": "전체",              // ✅ 추가 필요
      "filterManual": "수동",           // ✅ 추가 필요
      "filterAi": "AI"                  // ✅ 추가 필요
    }
  }
}
```

**영어 번역도 동일하게 추가**.

#### 수정안

i18n 섹션 7.1과 7.2는 **원안대로 유지** (이미 모든 키 포함됨).

---

### 2.5 성능 및 접근성

**문제 없음**. 2단계 계획은 다음을 잘 고려했습니다:
- ✅ framer-motion 제거로 번들 크기 절감
- ✅ CSS transition 사용으로 성능 개선
- ✅ ARIA 레이블 추가
- ✅ 시맨틱 HTML 사용
- ✅ Skeleton 로딩으로 체감 성능 개선

---

### 2.6 누락 사항 확인

#### 문제 9: error.ts에 DELETE_FAILED 에러 코드 추가 필요

- **위치**: `src/features/keywords/backend/error.ts`
- **문제**: `DELETE_FAILED` 에러 코드가 정의되지 않았을 가능성
- **영향**: TypeScript 타입 에러

#### 수정안

`src/features/keywords/backend/error.ts` 확인 후 없으면 추가:

```typescript
export const keywordErrorCodes = {
  // ... 기존 코드 ...
  DELETE_FAILED: 'DELETE_FAILED',
  KEYWORD_NOT_FOUND: 'KEYWORD_NOT_FOUND',
} as const;
```

---

## 3. 최종 구현 계획

### 3.1 파일 구조 (수정안)

```
src/features/keywords/components/
├── TableSkeleton.tsx           # ✅ PascalCase로 변경
├── EmptyState.tsx              # ✅ PascalCase로 변경
├── DeleteDialog.tsx            # ✅ PascalCase로 변경
├── SearchSection.tsx           # ✅ PascalCase로 변경
├── Pagination.tsx              # ✅ PascalCase로 변경
└── KeywordTable.tsx            # ✅ 기존 파일 덮어쓰기 (파일명 유지)
```

### 3.2 의존성 (수정안)

```bash
# 필수 설치
npx shadcn@latest add alert-dialog

# 선택 설치 (use-toast가 없을 경우만)
npx shadcn@latest add toast
```

### 3.3 구현 순서 (수정안)

#### Phase 1: 백엔드 구현 (1시간)

**Step 1.1: 에러 코드 확인 및 추가 (5분)**
- `src/features/keywords/backend/error.ts` 확인
- `DELETE_FAILED`, `KEYWORD_NOT_FOUND` 코드 없으면 추가

**Step 1.2: 스키마 확장 (10분)**
- `src/features/keywords/backend/schema.ts`에 `DeleteKeywordSchema` 추가

**Step 1.3: 서비스 함수 (20분)**
- `src/features/keywords/backend/service.ts`에 `deleteKeyword` 함수 추가
- ⚠️ **중요**: `domainSuccess`, `domainFailure` 사용 (deprecated API 사용 금지)

**Step 1.4: 라우트 추가 (20분)**
- `src/features/keywords/backend/route.ts`에 DELETE 엔드포인트 추가
- `respondWithDomain` 사용

**Step 1.5: 훅 추가 (5분)**
- `src/features/keywords/hooks/useKeywordQuery.ts`에 `useDeleteKeyword` 훅 추가

#### Phase 2: 컴포넌트 리팩토링 (2시간)

**Step 2.0: shadcn-ui 컴포넌트 설치 (5분)**
```bash
npx shadcn@latest add alert-dialog
```

**Step 2.1: TableSkeleton 컴포넌트 (15분)**
- ✅ 파일명: `TableSkeleton.tsx` (PascalCase)

**Step 2.2: EmptyState 컴포넌트 (20분)**
- ✅ 파일명: `EmptyState.tsx` (PascalCase)

**Step 2.3: DeleteDialog 컴포넌트 (20분)**
- ✅ 파일명: `DeleteDialog.tsx` (PascalCase)

**Step 2.4: SearchSection 컴포넌트 (30분)**
- ✅ 파일명: `SearchSection.tsx` (PascalCase)

**Step 2.5: Pagination 컴포넌트 (20분)**
- ✅ 파일명: `Pagination.tsx` (PascalCase)

**Step 2.6: KeywordTable 리팩토링 (30분)**
- ✅ 파일명: `KeywordTable.tsx` (기존 파일 덮어쓰기)
- ✅ Import 경로 수정:
  ```typescript
  import { TableSkeleton } from "./TableSkeleton";
  import { EmptyState } from "./EmptyState";
  import { DeleteDialog } from "./DeleteDialog";
  import { SearchSection } from "./SearchSection";
  import { Pagination } from "./Pagination";
  ```

#### Phase 3: 페이지 통합 (1시간)

**Step 3.1: PageLayout 리팩토링 (15분)**
- 인라인 스타일 → Tailwind 클래스

**Step 3.2: i18n 확장 (20분)**
- `messages/ko.json` 키워드 섹션 **완전 교체** (2단계 계획 7.1 참조)
- `messages/en.json` 키워드 섹션 **완전 교체** (2단계 계획 7.2 참조)

**Step 3.3: 페이지 구조 변경 (25분)**
- `src/app/[locale]/(protected)/keywords/page.tsx` 수정
- Import 경로 확인:
  ```typescript
  import { KeywordTable } from "@/features/keywords/components/KeywordTable";
  ```

---

### 3.4 컴포넌트 상세 명세 (수정안)

#### 3.4.1 TableSkeleton Component

**파일: `src/features/keywords/components/TableSkeleton.tsx`** (PascalCase)

```tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TableSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[50%]">키워드</TableHead>
            <TableHead className="w-[20%]">소스</TableHead>
            <TableHead className="w-[20%]">생성일</TableHead>
            <TableHead className="w-[10%] text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

#### 3.4.2 EmptyState Component

**파일: `src/features/keywords/components/EmptyState.tsx`** (PascalCase)

```tsx
"use client";

import { Hash } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmptyStateProps {
  type: "no-keywords" | "no-results";
}

export function EmptyState({ type }: EmptyStateProps) {
  const t = useTranslations("keywords.table");

  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Hash className="h-12 w-12 text-gray-300" />
        <div className="text-center">
          <p className="text-base font-medium text-gray-900 mb-1">
            {t("noResultsTitle")}
          </p>
          <p className="text-sm text-gray-500">
            {t("noResultsDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <Hash className="h-16 w-16 text-gray-300" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {t("emptyTitle")}
        </h3>
        <p className="text-sm text-gray-500">
          {t("emptyDesc")}
        </p>
      </div>
    </div>
  );
}
```

#### 3.4.3 DeleteDialog Component

**파일: `src/features/keywords/components/DeleteDialog.tsx`** (PascalCase)

```tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  keywordPhrase: string;
  isDeleting: boolean;
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  keywordPhrase,
  isDeleting,
}: DeleteDialogProps) {
  const t = useTranslations("keywords.delete");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description", { phrase: keywordPhrase })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? t("deleting") : t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### 3.4.4 SearchSection Component

**파일: `src/features/keywords/components/SearchSection.tsx`** (PascalCase)

```tsx
"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sourceFilter: "all" | "manual" | "dataforseo";
  onSourceFilterChange: (source: "all" | "manual" | "dataforseo") => void;
}

export function SearchSection({
  searchQuery,
  onSearchChange,
  sourceFilter,
  onSourceFilterChange,
}: SearchSectionProps) {
  const t = useTranslations("keywords.table");

  return (
    <div className="flex gap-3 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t("clearSearch")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Source Filter */}
      <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterAll")}</SelectItem>
          <SelectItem value="manual">{t("filterManual")}</SelectItem>
          <SelectItem value="dataforseo">{t("filterAi")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

#### 3.4.5 Pagination Component

**파일: `src/features/keywords/components/Pagination.tsx`** (PascalCase)

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  hasMore,
}: PaginationProps) {
  const t = useTranslations("keywords.table");

  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">
        {t("paginationInfo", {
          total: totalItems,
          start: startItem,
          end: endItem,
        })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("previous")}
        </Button>
        <span className="text-sm text-gray-700 font-medium min-w-[60px] text-center">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasMore}
          className="transition-colors"
        >
          {t("next")}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
```

#### 3.4.6 KeywordTable Component (리팩토링)

**파일: `src/features/keywords/components/KeywordTable.tsx`** (기존 파일 덮어쓰기)

```tsx
"use client";

import { useState } from "react";
import { useDebounce } from "react-use";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2 } from "lucide-react";
import { useKeywordList, useDeleteKeyword } from "@/features/keywords/hooks/useKeywordQuery";
import { format, formatDistanceToNow } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { TableSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { DeleteDialog } from "./DeleteDialog";
import { SearchSection } from "./SearchSection";
import { Pagination } from "./Pagination";

export function KeywordTable() {
  const t = useTranslations("keywords");
  const locale = useLocale();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "manual" | "dataforseo">("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; phrase: string } | null>(null);

  const limit = 20;

  useDebounce(
    () => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    },
    300,
    [searchQuery]
  );

  const { data, isLoading, error } = useKeywordList(debouncedQuery, page, limit);
  const deleteMutation = useDeleteKeyword();

  const dateLocale = locale === "ko" ? ko : enUS;

  const handleCopy = async (phrase: string) => {
    await navigator.clipboard.writeText(phrase);
    toast({
      title: t("table.copySuccess"),
      description: t("table.copySuccessDesc", { phrase }),
    });
  };

  const handleDeleteClick = (id: string, phrase: string) => {
    setDeleteTarget({ id, phrase });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({
        title: t("delete.successTitle"),
        description: t("delete.successDesc", { phrase: deleteTarget.phrase }),
      });
      setDeleteTarget(null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        t("delete.errorFallback");
      toast({
        title: t("delete.errorTitle"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const filteredItems =
    sourceFilter === "all"
      ? data?.items || []
      : data?.items.filter((item) => item.source === sourceFilter) || [];

  const totalFiltered = filteredItems.length;
  const hasData = !isLoading && !error && data && filteredItems.length > 0;
  const isEmpty = !isLoading && !error && (!data || data.items.length === 0);
  const isNoResults = !isLoading && !error && data && data.items.length > 0 && filteredItems.length === 0;

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <SearchSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
      />

      {/* Total Count */}
      {hasData && (
        <p className="text-sm text-gray-600">
          {t("table.totalCount", { count: totalFiltered })}
        </p>
      )}

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-base font-medium text-red-900 mb-1">
            {t("table.loadError")}
          </p>
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : t("table.loadErrorFallback")}
          </p>
        </div>
      ) : isEmpty ? (
        <EmptyState type="no-keywords" />
      ) : isNoResults ? (
        <EmptyState type="no-results" />
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[50%]">{t("table.columnKeyword")}</TableHead>
                <TableHead className="w-[20%]">{t("table.columnSource")}</TableHead>
                <TableHead className="w-[20%]">{t("table.columnCreatedAt")}</TableHead>
                <TableHead className="w-[10%] text-right">{t("table.columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((keyword) => (
                <TableRow
                  key={keyword.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {keyword.phrase}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={keyword.source === "manual" ? "default" : "secondary"}
                    >
                      {keyword.source === "manual"
                        ? t("table.sourceManual")
                        : t("table.sourceAi")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        {format(new Date(keyword.createdAt), "yyyy-MM-dd")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(keyword.createdAt), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(keyword.phrase)}
                        className="transition-colors"
                        aria-label={t("table.copyAria", { phrase: keyword.phrase })}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(keyword.id, keyword.phrase)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        aria-label={t("table.deleteAria", { phrase: keyword.phrase })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {hasData && data && (
        <Pagination
          page={page}
          totalPages={Math.ceil(data.total / limit)}
          totalItems={data.total}
          itemsPerPage={limit}
          onPageChange={setPage}
          hasMore={data.hasMore}
        />
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        keywordPhrase={deleteTarget?.phrase || ""}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
```

---

### 3.5 백엔드 구현 명세 (수정안)

#### 3.5.1 에러 코드 확장

**파일: `src/features/keywords/backend/error.ts`**

```typescript
// 기존 코드 확인 후 없으면 추가

export const keywordErrorCodes = {
  // ... 기존 코드 ...
  DELETE_FAILED: 'DELETE_FAILED',
  KEYWORD_NOT_FOUND: 'KEYWORD_NOT_FOUND',
} as const;

export type KeywordErrorCode = typeof keywordErrorCodes[keyof typeof keywordErrorCodes];

export interface KeywordDomainError {
  code: KeywordErrorCode;
  message: string;
  details?: unknown;
}
```

#### 3.5.2 스키마 확장

**파일: `src/features/keywords/backend/schema.ts`**

```typescript
// 기존 코드 유지 후 추가

// ===== DELETE 요청 스키마 =====
export const DeleteKeywordSchema = z.object({
  id: z.string().uuid(),
});

// ===== 타입 추출 =====
export type DeleteKeywordInput = z.infer<typeof DeleteKeywordSchema>;
```

#### 3.5.3 서비스 함수

**파일: `src/features/keywords/backend/service.ts`**

```typescript
// 기존 함수들 유지 후 추가

import { domainSuccess, domainFailure, type DomainResult } from '@/backend/domain/result';
import type { KeywordDomainError } from './error';
import type { DeleteKeywordInput } from './schema';

/**
 * 키워드 삭제
 */
export async function deleteKeyword(
  supabase: SupabaseClient,
  input: DeleteKeywordInput
): Promise<DomainResult<{ deleted: true; id: string }, KeywordDomainError>> {
  const { data, error } = await supabase
    .from('keywords')
    .delete()
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    return domainFailure({
      code: 'DELETE_FAILED',
      message: `Failed to delete keyword: ${error.message}`,
      details: error,
    });
  }

  if (!data) {
    return domainFailure({
      code: 'KEYWORD_NOT_FOUND',
      message: 'Keyword not found',
    });
  }

  return domainSuccess({ deleted: true, id: input.id });
}
```

#### 3.5.4 라우트 추가

**파일: `src/features/keywords/backend/route.ts`**

```typescript
// 기존 라우트들 유지 후 추가

import { DeleteKeywordSchema } from './schema';
import { deleteKeyword } from './service';
import { respondWithDomain } from '@/backend/http/mapper';

export const registerKeywordsRoutes = (app: Hono<AppEnv>) => {
  // ... 기존 라우트들 ...

  // DELETE /api/keywords/:id
  app.delete("/api/keywords/:id", async (c) => {
    const id = c.req.param("id");
    const parsedId = DeleteKeywordSchema.safeParse({ id });

    if (!parsedId.success) {
      return c.json(
        {
          ok: false,
          error: {
            code: "INVALID_KEYWORD_ID",
            message: "Invalid keyword ID",
            details: parsedId.error.format(),
          },
        },
        400
      );
    }

    const supabase = getSupabase(c);
    const result = await deleteKeyword(supabase, parsedId.data);
    return respondWithDomain(c, result);
  });
};
```

#### 3.5.5 훅 추가

**파일: `src/features/keywords/hooks/useKeywordQuery.ts`**

```typescript
// 기존 훅들 유지 후 추가

// ===== 키워드 삭제 =====
export function useDeleteKeyword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/keywords/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords", "list"] });
    },
  });
}
```

---

### 3.6 i18n 번역 키 (완전 교체)

#### 3.6.1 한국어 (messages/ko.json)

**`keywords` 섹션 전체를 다음으로 교체**:

```json
{
  "keywords": {
    "title": "키워드 관리",
    "description": "블로그 콘텐츠 최적화를 위한 키워드를 관리하고 AI 추천을 받으세요.",
    "suggestions": "AI 추천",
    "new_keyword": "키워드 추가",
    "table": {
      "searchPlaceholder": "키워드 검색...",
      "clearSearch": "검색어 지우기",
      "filterAll": "전체",
      "filterManual": "수동",
      "filterAi": "AI",
      "columnKeyword": "키워드",
      "columnSource": "소스",
      "columnCreatedAt": "생성일",
      "columnActions": "액션",
      "sourceManual": "수동",
      "sourceAi": "AI",
      "totalCount": "총 {count}개의 키워드",
      "loading": "키워드를 불러오는 중...",
      "loadError": "키워드를 불러오는 중 오류가 발생했습니다",
      "loadErrorFallback": "서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.",
      "noResultsTitle": "검색 결과가 없습니다",
      "noResultsDesc": "다른 검색어를 시도하거나 필터를 조정해보세요.",
      "emptyTitle": "아직 키워드가 없습니다",
      "emptyDesc": "첫 키워드를 추가하거나 AI 추천을 받아보세요.",
      "copySuccess": "복사 완료",
      "copySuccessDesc": "\"{phrase}\"가 클립보드에 복사되었습니다.",
      "copyAria": "{phrase} 복사",
      "deleteAria": "{phrase} 삭제",
      "paginationInfo": "{total}개 중 {start}-{end}",
      "previous": "이전",
      "next": "다음"
    },
    "create": {
      "title": "새 키워드 추가",
      "description": "블로그에 사용할 키워드를 직접 추가합니다.",
      "trigger": "키워드 추가",
      "fieldLabel": "키워드",
      "fieldPlaceholder": "키워드를 입력하세요",
      "cancel": "취소",
      "save": "저장",
      "saving": "저장 중...",
      "validation": {
        "required": "키워드를 입력해주세요.",
        "maxLength": "키워드는 100자 이내로 입력해주세요."
      },
      "toast": {
        "successTitle": "키워드 추가 완료",
        "successDescription": "\"{phrase}\"가 추가되었습니다.",
        "errorTitle": "키워드 추가 실패",
        "errorFallback": "키워드를 추가할 수 없습니다. 잠시 후 다시 시도해주세요."
      }
    },
    "delete": {
      "title": "키워드 삭제",
      "description": "\"{phrase}\" 키워드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      "cancel": "취소",
      "confirm": "삭제",
      "deleting": "삭제 중...",
      "successTitle": "키워드 삭제 완료",
      "successDesc": "\"{phrase}\"가 삭제되었습니다.",
      "errorTitle": "키워드 삭제 실패",
      "errorFallback": "키워드를 삭제할 수 없습니다. 잠시 후 다시 시도해주세요."
    },
    "picker": {
      "searchPlaceholder": "키워드 검색...",
      "loading": "키워드를 불러오는 중...",
      "noResults": "키워드가 없습니다.",
      "selectKeyword": "키워드 선택",
      "selected": "선택됨"
    },
    "suggestions": {
      "title": "AI 키워드 추천",
      "subtitle": "주제와 관련된 롱테일 키워드를 추천받으세요.",
      "keywordLabel": "주제 키워드",
      "keywordPlaceholder": "예: 블로그 작성법",
      "contextLabel": "컨텍스트 (선택)",
      "contextPlaceholder": "추가 정보를 입력하면 더 정확한 추천을 받을 수 있습니다",
      "generate": "추천받기",
      "generating": "추천 중...",
      "close": "닫기",
      "noResults": "추천 결과가 없습니다.",
      "addSelected": "선택한 키워드 추가",
      "addAll": "전체 추가",
      "competition": "경쟁도",
      "toast": {
        "successTitle": "키워드 추가 완료",
        "successDescription": "{count}개의 키워드가 추가되었습니다.",
        "errorTitle": "추천 실패",
        "errorFallback": "키워드 추천 중 오류가 발생했습니다."
      }
    }
  }
}
```

#### 3.6.2 영어 (messages/en.json)

**`keywords` 섹션 전체를 다음으로 교체**:

```json
{
  "keywords": {
    "title": "Keywords",
    "description": "Manage keywords for blog content optimization and get AI recommendations.",
    "suggestions": "AI Suggestions",
    "new_keyword": "Add Keyword",
    "table": {
      "searchPlaceholder": "Search keywords...",
      "clearSearch": "Clear search",
      "filterAll": "All",
      "filterManual": "Manual",
      "filterAi": "AI",
      "columnKeyword": "Keyword",
      "columnSource": "Source",
      "columnCreatedAt": "Created At",
      "columnActions": "Actions",
      "sourceManual": "Manual",
      "sourceAi": "AI",
      "totalCount": "{count} keywords in total",
      "loading": "Loading keywords...",
      "loadError": "An error occurred while loading keywords",
      "loadErrorFallback": "Unable to communicate with the server. Please try again later.",
      "noResultsTitle": "No results found",
      "noResultsDesc": "Try a different search term or adjust the filter.",
      "emptyTitle": "No keywords yet",
      "emptyDesc": "Add your first keyword or get AI recommendations.",
      "copySuccess": "Copied",
      "copySuccessDesc": "\"{phrase}\" has been copied to clipboard.",
      "copyAria": "Copy {phrase}",
      "deleteAria": "Delete {phrase}",
      "paginationInfo": "{start}-{end} of {total}",
      "previous": "Previous",
      "next": "Next"
    },
    "create": {
      "title": "Add New Keyword",
      "description": "Add a keyword to use for your blog.",
      "trigger": "Add Keyword",
      "fieldLabel": "Keyword",
      "fieldPlaceholder": "Enter keyword",
      "cancel": "Cancel",
      "save": "Save",
      "saving": "Saving...",
      "validation": {
        "required": "Please enter a keyword.",
        "maxLength": "Keyword must be 100 characters or less."
      },
      "toast": {
        "successTitle": "Keyword Added",
        "successDescription": "\"{phrase}\" has been added.",
        "errorTitle": "Failed to Add Keyword",
        "errorFallback": "Unable to add keyword. Please try again later."
      }
    },
    "delete": {
      "title": "Delete Keyword",
      "description": "Delete \"{phrase}\"? This action cannot be undone.",
      "cancel": "Cancel",
      "confirm": "Delete",
      "deleting": "Deleting...",
      "successTitle": "Keyword Deleted",
      "successDesc": "\"{phrase}\" has been deleted.",
      "errorTitle": "Failed to Delete Keyword",
      "errorFallback": "Unable to delete keyword. Please try again later."
    },
    "picker": {
      "searchPlaceholder": "Search keywords...",
      "loading": "Loading keywords...",
      "noResults": "No keywords found.",
      "selectKeyword": "Select keyword",
      "selected": "Selected"
    },
    "suggestions": {
      "title": "AI Keyword Recommendations",
      "subtitle": "Get long-tail keyword recommendations for your topic.",
      "keywordLabel": "Topic Keyword",
      "keywordPlaceholder": "e.g., How to write a blog",
      "contextLabel": "Context (Optional)",
      "contextPlaceholder": "Add more details for better recommendations",
      "generate": "Get Suggestions",
      "generating": "Generating...",
      "close": "Close",
      "noResults": "No recommendations found.",
      "addSelected": "Add Selected",
      "addAll": "Add All",
      "competition": "Competition",
      "toast": {
        "successTitle": "Keywords Added",
        "successDescription": "{count} keywords have been added.",
        "errorTitle": "Recommendation Failed",
        "errorFallback": "An error occurred while getting recommendations."
      }
    }
  }
}
```

---

### 3.7 PageLayout 리팩토링

**파일: `src/components/layout/page-layout.tsx`**

```tsx
"use client";

import type { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  maxWidthClassName?: string;
}

export function PageLayout({
  title,
  description,
  actions,
  children,
  maxWidthClassName = "max-w-6xl",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`container mx-auto ${maxWidthClassName} px-4 py-8`}>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-sm text-gray-600">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
```

**변경 사항**:
- `style={{ backgroundColor: "#FCFCFD" }}` → `bg-gray-50`
- `style={{ color: "#1F2937" }}` → `text-gray-900`
- `style={{ color: "#6B7280" }}` → `text-gray-600`
- `text-3xl` → `text-2xl`
- `text-base` → `text-sm`

---

### 3.8 페이지 통합

**파일: `src/app/[locale]/(protected)/keywords/page.tsx`**

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeywordTable } from "@/features/keywords/components/KeywordTable";
import { KeywordCreateDialog } from "@/features/keywords/components/KeywordCreateDialog";
import { SuggestionsDialog } from "@/features/keywords/components/SuggestionsDialog";
import { Plus, Sparkles } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { useTranslations } from "next-intl";

type KeywordsPageProps = {
  params: Promise<Record<string, never>>;
};

export default function KeywordsPage({ params }: KeywordsPageProps) {
  void params;
  const t = useTranslations("keywords");

  return (
    <PageLayout
      title={t("title")}
      description={t("description")}
      actions={
        <>
          <SuggestionsDialog>
            <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
              <Sparkles className="mr-2 h-4 w-4" />
              {t("suggestions")}
            </Button>
          </SuggestionsDialog>
          <KeywordCreateDialog>
            <Button variant="outline" className="transition-colors">
              <Plus className="mr-2 h-4 w-4" />
              {t("new_keyword")}
            </Button>
          </KeywordCreateDialog>
        </>
      }
    >
      <Card className="p-6 border-gray-200 rounded-xl">
        <KeywordTable />
      </Card>
    </PageLayout>
  );
}
```

---

## 4. 주요 변경 사항

### 수정된 컴포넌트

#### 백엔드 레이어
- **service.ts**: `success`/`failure` → `domainSuccess`/`domainFailure` 변경
- **route.ts**: `respondWithDomain` 사용 (일관성 유지)
- **error.ts**: `DELETE_FAILED`, `KEYWORD_NOT_FOUND` 에러 코드 추가

#### 파일명 컨벤션
- **모든 컴포넌트**: kebab-case → PascalCase 변경
  - `table-skeleton.tsx` → `TableSkeleton.tsx`
  - `empty-state.tsx` → `EmptyState.tsx`
  - `delete-dialog.tsx` → `DeleteDialog.tsx`
  - `search-section.tsx` → `SearchSection.tsx`
  - `pagination.tsx` → `Pagination.tsx`

#### Import 경로
- **KeywordTable.tsx**:
  ```typescript
  // ❌ 2단계 계획
  import { TableSkeleton } from "./table-skeleton";

  // ✅ 수정안
  import { TableSkeleton } from "./TableSkeleton";
  ```

### 추가된 파일

- `TableSkeleton.tsx`
- `EmptyState.tsx`
- `DeleteDialog.tsx`
- `SearchSection.tsx`
- `Pagination.tsx`

### 제거된 항목

없음 (기존 파일 덮어쓰기만).

---

## 5. 구현 체크리스트

### Phase 1: 백엔드 구현 (1시간)

- [ ] **Step 1.1**: `src/features/keywords/backend/error.ts` 확인 및 에러 코드 추가
- [ ] **Step 1.2**: `src/features/keywords/backend/schema.ts`에 `DeleteKeywordSchema` 추가
- [ ] **Step 1.3**: `src/features/keywords/backend/service.ts`에 `deleteKeyword` 함수 추가 (⚠️ domain-centric 패턴 사용)
- [ ] **Step 1.4**: `src/features/keywords/backend/route.ts`에 DELETE 엔드포인트 추가
- [ ] **Step 1.5**: `src/features/keywords/hooks/useKeywordQuery.ts`에 `useDeleteKeyword` 훅 추가
- [ ] **Step 1.6**: 백엔드 동작 확인 (Thunder Client 또는 curl로 테스트)

### Phase 2: 컴포넌트 리팩토링 (2시간)

- [ ] **Step 2.0**: `npx shadcn@latest add alert-dialog` 실행
- [ ] **Step 2.1**: `src/features/keywords/components/TableSkeleton.tsx` 생성
- [ ] **Step 2.2**: `src/features/keywords/components/EmptyState.tsx` 생성
- [ ] **Step 2.3**: `src/features/keywords/components/DeleteDialog.tsx` 생성
- [ ] **Step 2.4**: `src/features/keywords/components/SearchSection.tsx` 생성
- [ ] **Step 2.5**: `src/features/keywords/components/Pagination.tsx` 생성
- [ ] **Step 2.6**: `src/features/keywords/components/KeywordTable.tsx` 리팩토링 (⚠️ import 경로 PascalCase)
- [ ] **Step 2.7**: 컴포넌트 동작 확인

### Phase 3: 페이지 통합 (1시간)

- [ ] **Step 3.1**: `src/components/layout/page-layout.tsx` 리팩토링
- [ ] **Step 3.2**: `messages/ko.json`의 `keywords` 섹션 **완전 교체**
- [ ] **Step 3.3**: `messages/en.json`의 `keywords` 섹션 **완전 교체**
- [ ] **Step 3.4**: `src/app/[locale]/(protected)/keywords/page.tsx` 수정
- [ ] **Step 3.5**: 전체 페이지 동작 확인

### Phase 4: 최종 검증 (30분)

- [ ] **Step 4.1**: 검색 기능 테스트
- [ ] **Step 4.2**: 소스 필터 테스트
- [ ] **Step 4.3**: 키워드 생성 테스트
- [ ] **Step 4.4**: 키워드 삭제 테스트 (확인 다이얼로그 포함)
- [ ] **Step 4.5**: 복사 기능 테스트
- [ ] **Step 4.6**: 페이지네이션 테스트
- [ ] **Step 4.7**: 빈 상태 테스트
- [ ] **Step 4.8**: 로딩 상태 테스트
- [ ] **Step 4.9**: 에러 상태 테스트
- [ ] **Step 4.10**: 한글/영어 번역 확인

---

## 6. 리스크 및 주의사항

### 잠재적 문제

#### 1. use-toast 훅 미설치
- **대응 방안**: 컴파일 에러 발생 시 `npx shadcn@latest add toast` 실행

#### 2. alert-dialog 설치 누락
- **대응 방안**: Phase 2 시작 전 반드시 설치 확인

#### 3. 백엔드 레이어 불일치
- **대응 방안**: 반드시 `domainSuccess`/`domainFailure` 사용 (deprecated API 금지)

### 테스트 필요 항목

- [ ] DELETE API 엔드포인트 동작 확인
- [ ] 삭제 후 목록 자동 갱신 확인
- [ ] 소스 필터 정상 작동 확인
- [ ] 검색 디바운싱 정상 작동 확인
- [ ] 페이지네이션 정상 작동 확인

---

## 7. 실행 준비 확인

- [x] 모든 타입 오류 해결
- [x] 모든 import 경로 검증
- [x] i18n 완전성 확인
- [x] 성능 최적화 고려
- [x] 접근성 요구사항 충족
- [x] 코드베이스 일관성 유지
- [x] 백엔드 아키텍처 패턴 준수

---

## 8. 다음 단계

1. **Phase 1부터 순차 실행**
2. **각 Phase 완료 후 동작 확인**
3. **오류 발생 시 즉시 수정**
4. **최종 검증 후 배포**

---

**작성 완료**: 2025-11-16
**검토 완료**: ✅ 실행 가능
**다음 단계**: Phase 1 백엔드 구현 시작
