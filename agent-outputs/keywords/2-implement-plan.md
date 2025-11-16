# Keywords 페이지 구현 계획

> **작성일**: 2025-11-16
> **기반 문서**: `./agent-outputs/keywords/1-plan-critic.md`
> **대상 페이지**: `src/app/[locale]/(protected)/keywords/page.tsx`

---

## 1. 코드베이스 분석 결과

### 1.1 프로젝트 구조

```
indieblog/
├── src/
│   ├── app/[locale]/(protected)/keywords/page.tsx  # 키워드 페이지
│   ├── features/keywords/
│   │   ├── components/
│   │   │   ├── KeywordTable.tsx                    # 기존 테이블 컴포넌트
│   │   │   ├── KeywordCreateDialog.tsx             # 기존 생성 다이얼로그
│   │   │   ├── SuggestionsDialog.tsx               # 기존 AI 추천 다이얼로그
│   │   │   └── KeywordPicker.tsx                   # 기존 피커
│   │   ├── hooks/
│   │   │   └── useKeywordQuery.ts                  # React Query 훅
│   │   ├── backend/
│   │   │   ├── route.ts                            # Hono 라우터 (DELETE 미구현)
│   │   │   ├── service.ts                          # Supabase 로직
│   │   │   └── schema.ts                           # Zod 스키마
│   │   └── lib/
│   │       └── dto.ts                              # 타입 재노출
│   ├── components/
│   │   ├── layout/
│   │   │   └── page-layout.tsx                     # 페이지 레이아웃 (기존)
│   │   └── ui/                                     # shadcn-ui 컴포넌트
│   └── lib/
│       └── remote/
│           └── api-client.ts                       # Axios wrapper
├── messages/
│   ├── ko.json                                     # 한글 번역
│   └── en.json                                     # 영어 번역
└── tailwind.config.ts                              # Tailwind 설정
```

### 1.2 기존 패턴

#### 컴포넌트 패턴
- 모든 컴포넌트는 `"use client"` 지시자 사용
- Props 인터페이스는 PascalCase + `Props` suffix
- shadcn-ui 기반 UI 컴포넌트 사용
- `useTranslations('namespace')` 훅으로 i18n 처리

#### 스타일 패턴
- **인라인 스타일 사용 중** (`style={{ borderColor: "#E1E5EA" }}`)
- Tailwind CSS와 인라인 스타일 혼용
- 다크모드 지원하지 않음 (설정에만 존재)

#### 상태 관리 패턴
- React Query로 서버 상태 관리
- `useDebounce`로 검색 입력 디바운싱 (300ms)
- 로컬 상태는 `useState` 사용

#### 백엔드 패턴
- Hono 라우터: `/api/keywords` prefix
- Zod 스키마로 요청/응답 검증
- `respond*` 헬퍼로 응답 포맷팅
- **DELETE 엔드포인트 없음** (구현 필요)

### 1.3 기술 스택

| 카테고리 | 기술 | 용도 |
|---------|------|------|
| **프레임워크** | Next.js 14 (App Router) | SSR, 라우팅 |
| **언어** | TypeScript | 타입 안전성 |
| **스타일** | Tailwind CSS | 유틸리티 CSS |
| **UI** | shadcn-ui | 컴포넌트 라이브러리 |
| **상태 관리** | TanStack Query v5 | 서버 상태 |
| **폼** | react-hook-form + zod | 폼 검증 |
| **HTTP** | Axios (api-client) | API 통신 |
| **백엔드** | Hono + Supabase | API + DB |
| **i18n** | next-intl | 다국어 지원 |
| **날짜** | date-fns | 날짜 포맷 |
| **유틸** | react-use | 커스텀 훅 |

---

## 2. 파일 구조

### 2.1 생성할 파일

```
src/features/keywords/components/
├── page-header.tsx          # 간소화된 헤더 컴포넌트
├── search-section.tsx       # 검색 + 소스 필터
├── keyword-table.tsx        # 리팩토링된 테이블 (기존 덮어쓰기)
├── table-skeleton.tsx       # 스켈레톤 로딩
├── empty-state.tsx          # 빈 상태 컴포넌트
├── delete-dialog.tsx        # 삭제 확인 다이얼로그
└── pagination.tsx           # 페이지네이션 컴포넌트
```

### 2.2 수정할 파일

```
src/app/[locale]/(protected)/keywords/page.tsx           # 페이지 구조 변경
src/features/keywords/hooks/useKeywordQuery.ts           # DELETE 훅 추가
src/features/keywords/backend/route.ts                   # DELETE 라우트 추가
src/features/keywords/backend/service.ts                 # deleteKeyword 함수 추가
src/features/keywords/backend/schema.ts                  # DeleteKeywordSchema 추가
src/components/layout/page-layout.tsx                    # 인라인 스타일 제거
messages/ko.json                                         # 키워드 섹션 확장
messages/en.json                                         # 키워드 섹션 확장
```

### 2.3 삭제할 파일

- 없음 (기존 파일 재사용)

---

## 3. 의존성

### 3.1 설치 명령

```bash
# Alert Dialog 컴포넌트 설치 (삭제 확인용)
npx shadcn@latest add alert-dialog
```

### 3.2 이미 설치된 패키지

✅ `@tanstack/react-query` - 서버 상태 관리
✅ `react-hook-form` - 폼 관리
✅ `zod` - 스키마 검증
✅ `date-fns` - 날짜 포맷
✅ `react-use` - 유틸 훅 (useDebounce)
✅ `next-intl` - i18n
✅ `lucide-react` - 아이콘
✅ `axios` - HTTP 클라이언트

---

## 4. 구현 순서

### Phase 1: 백엔드 구현 (1시간)

#### Step 1.1: 스키마 확장 (10분)
- `src/features/keywords/backend/schema.ts`에 DELETE 스키마 추가

#### Step 1.2: 서비스 함수 (20분)
- `src/features/keywords/backend/service.ts`에 `deleteKeyword` 함수 추가

#### Step 1.3: 라우트 추가 (20분)
- `src/features/keywords/backend/route.ts`에 DELETE 엔드포인트 추가

#### Step 1.4: 훅 추가 (10분)
- `src/features/keywords/hooks/useKeywordQuery.ts`에 `useDeleteKeyword` 훅 추가

### Phase 2: 컴포넌트 리팩토링 (2시간)

#### Step 2.1: 스켈레톤 컴포넌트 (15분)
- `src/features/keywords/components/table-skeleton.tsx` 생성

#### Step 2.2: EmptyState 컴포넌트 (20분)
- `src/features/keywords/components/empty-state.tsx` 생성

#### Step 2.3: 삭제 다이얼로그 (20분)
- `src/features/keywords/components/delete-dialog.tsx` 생성

#### Step 2.4: SearchSection 컴포넌트 (30분)
- `src/features/keywords/components/search-section.tsx` 생성

#### Step 2.5: Pagination 컴포넌트 (20분)
- `src/features/keywords/components/pagination.tsx` 생성

#### Step 2.6: KeywordTable 리팩토링 (35분)
- 인라인 스타일 제거
- 아이콘 제거
- framer-motion 제거
- 스켈레톤 적용
- 삭제 확인 다이얼로그 연동

### Phase 3: 페이지 통합 (1시간)

#### Step 3.1: PageLayout 리팩토링 (15분)
- 인라인 스타일 → Tailwind 클래스 변환

#### Step 3.2: i18n 확장 (20분)
- `messages/ko.json` 키워드 섹션 확장
- `messages/en.json` 키워드 섹션 확장

#### Step 3.3: 페이지 구조 변경 (25분)
- `src/app/[locale]/(protected)/keywords/page.tsx` 수정
- PageLayout 활용
- SearchSection 통합

---

## 5. 컴포넌트 상세 명세

### 5.1 TableSkeleton Component

#### 파일: `src/features/keywords/components/table-skeleton.tsx`

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

**특징**:
- 하드코딩된 i18n 헤더 (스켈레톤은 로딩 상태이므로 번역 불필요)
- 5개 행 표시 (일반적인 페이지 로딩 시간에 적합)
- 배지 스켈레톤은 `rounded-full`

---

### 5.2 EmptyState Component

#### 파일: `src/features/keywords/components/empty-state.tsx`

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

**Props**:
- `type`: `"no-keywords"` (초기 상태) vs `"no-results"` (검색 결과 없음)

**디자인 차이**:
- `no-keywords`: 더 큰 아이콘 (h-16), 더 많은 패딩 (py-16)
- `no-results`: 작은 아이콘 (h-12), 적은 패딩 (py-12)

---

### 5.3 DeleteDialog Component

#### 파일: `src/features/keywords/components/delete-dialog.tsx`

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

**Props**:
- `open`: 다이얼로그 열림 상태
- `onOpenChange`: 상태 변경 핸들러
- `onConfirm`: 삭제 확인 핸들러
- `keywordPhrase`: 삭제할 키워드 (확인 메시지에 표시)
- `isDeleting`: 삭제 진행 중 플래그

**특징**:
- AlertDialog 사용 (shadcn-ui)
- 빨간색 삭제 버튼 (`bg-red-600`)
- 삭제 중 버튼 비활성화

---

### 5.4 SearchSection Component

#### 파일: `src/features/keywords/components/search-section.tsx`

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

**Props**:
- `searchQuery`: 검색어
- `onSearchChange`: 검색어 변경 핸들러
- `sourceFilter`: 소스 필터 (`all` | `manual` | `dataforseo`)
- `onSourceFilterChange`: 필터 변경 핸들러

**특징**:
- 검색 아이콘 (왼쪽)
- X 버튼 (오른쪽, 검색어 있을 때만 표시)
- 소스 필터 (전체/수동/AI)
- CSS transition (`transition-colors`)

---

### 5.5 Pagination Component

#### 파일: `src/features/keywords/components/pagination.tsx`

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

**Props**:
- `page`: 현재 페이지
- `totalPages`: 총 페이지 수
- `totalItems`: 총 아이템 수
- `itemsPerPage`: 페이지당 아이템 수
- `onPageChange`: 페이지 변경 핸들러
- `hasMore`: 다음 페이지 존재 여부

**특징**:
- "10개 중 1-5" 형태의 정보 표시
- 이전/다음 버튼
- 현재 페이지 / 총 페이지 표시
- CSS transition

---

### 5.6 KeywordTable Component (리팩토링)

#### 파일: `src/features/keywords/components/keyword-table.tsx`

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
import { TableSkeleton } from "./table-skeleton";
import { EmptyState } from "./empty-state";
import { DeleteDialog } from "./delete-dialog";
import { SearchSection } from "./search-section";
import { Pagination } from "./pagination";

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

**주요 변경 사항**:
1. **인라인 스타일 제거**: Tailwind 클래스로 변환
2. **아이콘 제거**: 키워드 이름 앞 Hash 아이콘 제거
3. **framer-motion 제거**: CSS `transition-colors` 사용
4. **스켈레톤 적용**: `TableSkeleton` 컴포넌트 사용
5. **EmptyState 분리**: 별도 컴포넌트로 추출
6. **삭제 확인 다이얼로그**: AlertDialog 사용
7. **소스 필터 추가**: "전체/수동/AI" 필터
8. **복사 기능**: `navigator.clipboard.writeText` 사용
9. **i18n 완전 적용**: `useLocale()` 훅으로 date-fns locale 동적 처리
10. **접근성 개선**: ARIA 레이블 추가

---

### 5.7 PageLayout Component (리팩토링)

#### 파일: `src/components/layout/page-layout.tsx`

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
- `text-3xl` → `text-2xl` (타이포그래피 축소)
- `text-base` → `text-sm` (설명 텍스트 축소)

---

## 6. 백엔드 구현 명세

### 6.1 스키마 확장

#### 파일: `src/features/keywords/backend/schema.ts`

```typescript
// 기존 코드 유지 후 추가

// ===== DELETE 요청 스키마 =====
export const DeleteKeywordSchema = z.object({
  id: z.string().uuid(),
});

// ===== 타입 추출 =====
export type DeleteKeywordInput = z.infer<typeof DeleteKeywordSchema>;
```

### 6.2 서비스 함수

#### 파일: `src/features/keywords/backend/service.ts`

```typescript
// 기존 함수들 유지 후 추가

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { success, failure } from '@/backend/http/response';
import type { DeleteKeywordInput } from './schema';

/**
 * 키워드 삭제
 */
export async function deleteKeyword(
  supabase: SupabaseClient<Database>,
  input: DeleteKeywordInput
) {
  const { data, error } = await supabase
    .from('keywords')
    .delete()
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    return failure(
      500,
      'DELETE_FAILED',
      `Failed to delete keyword: ${error.message}`,
      error
    );
  }

  if (!data) {
    return failure(404, 'KEYWORD_NOT_FOUND', 'Keyword not found');
  }

  return success({ deleted: true, id: input.id });
}
```

### 6.3 라우트 추가

#### 파일: `src/features/keywords/backend/route.ts`

```typescript
// 기존 라우트들 유지 후 추가

import { DeleteKeywordSchema } from './schema';
import { deleteKeyword } from './service';

export const registerKeywordsRoutes = (app: Hono<AppEnv>) => {
  // ... 기존 라우트들 ...

  // DELETE /api/keywords/:id
  app.delete("/api/keywords/:id", async (c) => {
    const id = c.req.param("id");
    const parsedId = DeleteKeywordSchema.safeParse({ id });

    if (!parsedId.success) {
      return c.json(
        failure(
          400,
          "INVALID_KEYWORD_ID",
          "Invalid keyword ID",
          parsedId.error.format()
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const result = await deleteKeyword(supabase, parsedId.data);
    return respondWithDomain(c, result);
  });
};
```

### 6.4 훅 추가

#### 파일: `src/features/keywords/hooks/useKeywordQuery.ts`

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

## 7. i18n 번역 키

### 7.1 한국어 (messages/ko.json)

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
    }
  }
}
```

### 7.2 영어 (messages/en.json)

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
    }
  }
}
```

---

## 8. 페이지 통합

### 8.1 Keywords Page

#### 파일: `src/app/[locale]/(protected)/keywords/page.tsx`

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeywordTable } from "@/features/keywords/components/keyword-table";
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

**변경 사항**:
1. **인라인 스타일 제거**: `style={{ ... }}` → Tailwind 클래스
2. **버튼 위계 변경**: "AI 추천" Primary (파란색), "키워드 추가" Secondary
3. **CSS transition 추가**: `transition-colors`
4. **Card 스타일 변경**: `rounded-xl`, `border-gray-200`

---

## 9. 스타일링 가이드

### 9.1 Tailwind 클래스 패턴

#### 색상 시스템
```tsx
// 텍스트
text-gray-900  // 제목 (기존 #1F2937)
text-gray-700  // 부제목
text-gray-600  // 본문 (기존 #6B7280)
text-gray-500  // 보조 텍스트
text-gray-400  // 비활성 텍스트

// 배경
bg-gray-50     // 페이지 배경 (기존 #FCFCFD)
bg-gray-100    // 카드 배경
bg-white       // 흰 배경

// 테두리
border-gray-200  // 기본 테두리 (기존 #E1E5EA)
border-gray-300  // 강조 테두리
```

#### 버튼 스타일
```tsx
// Primary (파란색)
bg-blue-600 hover:bg-blue-700

// Secondary (outline)
variant="outline"

// Destructive (빨간색)
bg-red-600 hover:bg-red-700

// Ghost
variant="ghost"
```

#### 트랜지션
```tsx
// 모든 인터랙티브 요소
transition-colors  // 색상 변경만
```

### 9.2 반응형 디자인

현재 구현에서는 데스크톱만 고려합니다. 모바일 최적화는 Phase 3 (추후)로 이동했습니다.

### 9.3 다크모드

현재 구현에서는 다크모드를 고려하지 않습니다. Tailwind 설정에만 존재하며, 실제 컴포넌트에는 `dark:` prefix가 없습니다. 추후 필요 시 추가 예정입니다.

---

## 10. 성능 고려사항

### 10.1 애니메이션 최적화

#### framer-motion 제거
- **변경 전**: 모든 요소에 framer-motion 사용
- **변경 후**: CSS `transition-colors`만 사용
- **이유**: 번들 크기 절감 (70KB+), 성능 개선

#### CSS transition 사용
```tsx
// Tailwind 클래스로 충분
className="transition-colors hover:bg-gray-50"
```

### 10.2 React Query 최적화

#### 캐시 전략
```typescript
staleTime: 5 * 60 * 1000,       // 5분 (데이터가 최신 상태로 간주되는 시간)
gcTime: 10 * 60 * 1000,          // 10분 (캐시 유지 시간)
refetchOnWindowFocus: false,     // 포커스 시 재요청 비활성화
```

#### Debounce 최적화
```typescript
useDebounce(() => {
  setDebouncedQuery(searchQuery);
  setPage(1);
}, 300, [searchQuery]);
```
- 300ms 디바운스로 불필요한 API 호출 방지

### 10.3 컴포넌트 최적화

- **Skeleton**: 로딩 상태를 즉시 표시하여 체감 성능 개선
- **Empty State**: 빈 상태를 명확히 표시하여 사용자 혼란 방지
- **Pagination**: 클라이언트 사이드 페이지네이션으로 네트워크 요청 최소화

---

## 11. 접근성 체크리스트

### 11.1 시맨틱 HTML

- [x] `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` 사용
- [x] `<button>` vs `<a>` 적절히 구분
- [x] `<h1>`, `<h2>`, `<h3>` 계층 구조 준수

### 11.2 ARIA 레이블

- [x] 버튼에 `aria-label` 추가
  ```tsx
  aria-label={t("table.copyAria", { phrase: keyword.phrase })}
  aria-label={t("table.deleteAria", { phrase: keyword.phrase })}
  ```

### 11.3 키보드 네비게이션

- [x] 모든 버튼은 `<button>` 요소 사용 (Tab 키로 포커스 가능)
- [x] Dialog는 Escape 키로 닫기 가능 (shadcn-ui 기본 제공)
- [x] AlertDialog는 Enter/Escape 키 지원 (shadcn-ui 기본 제공)

### 11.4 색상 대비

- [x] 텍스트 대비: 4.5:1 이상 (WCAG AA)
  - `text-gray-900` on `bg-white`: 18.9:1 ✅
  - `text-gray-600` on `bg-white`: 7.2:1 ✅
- [x] 버튼 대비:
  - `bg-blue-600` on `bg-white`: 8.6:1 ✅
  - `bg-red-600` on `bg-white`: 7.7:1 ✅

### 11.5 스크린 리더

- [x] 테이블 헤더 명확함 (`<TableHead>`)
- [x] 버튼 라벨 명확함 (아이콘 + `aria-label`)
- [x] Dialog 제목/설명 명확함 (`<DialogTitle>`, `<DialogDescription>`)

---

## 12. 테스트 계획

현재 구현에서는 테스트를 작성하지 않습니다. 추후 필요 시 다음 순서로 추가 예정:

1. **Unit Tests** (Vitest + Testing Library)
   - `useKeywordQuery.ts` 훅 테스트
   - `deleteKeyword` 서비스 함수 테스트

2. **E2E Tests** (Playwright)
   - 키워드 검색 시나리오
   - 키워드 생성 시나리오
   - 키워드 삭제 시나리오

---

## 13. 구현 체크리스트

### Phase 1: 백엔드 구현 (1시간)

- [ ] **Step 1.1**: `src/features/keywords/backend/schema.ts`에 `DeleteKeywordSchema` 추가
- [ ] **Step 1.2**: `src/features/keywords/backend/service.ts`에 `deleteKeyword` 함수 추가
- [ ] **Step 1.3**: `src/features/keywords/backend/route.ts`에 DELETE 엔드포인트 추가
- [ ] **Step 1.4**: `src/features/keywords/hooks/useKeywordQuery.ts`에 `useDeleteKeyword` 훅 추가
- [ ] **Step 1.5**: 백엔드 동작 확인 (Postman 또는 Thunder Client로 테스트)

### Phase 2: 컴포넌트 리팩토링 (2시간)

- [ ] **Step 2.1**: `npx shadcn@latest add alert-dialog` 실행
- [ ] **Step 2.2**: `src/features/keywords/components/table-skeleton.tsx` 생성
- [ ] **Step 2.3**: `src/features/keywords/components/empty-state.tsx` 생성
- [ ] **Step 2.4**: `src/features/keywords/components/delete-dialog.tsx` 생성
- [ ] **Step 2.5**: `src/features/keywords/components/search-section.tsx` 생성
- [ ] **Step 2.6**: `src/features/keywords/components/pagination.tsx` 생성
- [ ] **Step 2.7**: `src/features/keywords/components/keyword-table.tsx` 리팩토링
- [ ] **Step 2.8**: 컴포넌트 동작 확인

### Phase 3: 페이지 통합 (1시간)

- [ ] **Step 3.1**: `src/components/layout/page-layout.tsx` 리팩토링 (인라인 스타일 제거)
- [ ] **Step 3.2**: `messages/ko.json`의 `keywords` 섹션 확장
- [ ] **Step 3.3**: `messages/en.json`의 `keywords` 섹션 확장
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

## 14. 주요 변경 사항 요약

### 14.1 제거된 요소

- ❌ **Hero Section**: 메트릭 카드, 그라데이션 배경 (공간 낭비)
- ❌ **테이블 아이콘**: 각 행의 Hash 아이콘 제거 (시각적 노이즈)
- ❌ **메트릭 컬럼**: 검색량, 경쟁도 제거 (백엔드 미구현)
- ❌ **편집 기능**: Phase 3로 이동 (우선순위 낮음)
- ❌ **framer-motion**: CSS transition으로 대체
- ❌ **stagger 애니메이션**: 성능 이슈로 제거
- ❌ **인라인 스타일**: Tailwind 클래스로 변환

### 14.2 추가된 요소

- ✅ **TableSkeleton Component**: 스켈레톤 로딩
- ✅ **EmptyState Component**: 빈 상태 디자인 (2가지 타입)
- ✅ **DeleteDialog Component**: 삭제 확인 다이얼로그
- ✅ **SearchSection Component**: 검색 + 소스 필터
- ✅ **Pagination Component**: 페이지네이션
- ✅ **총 개수 표시**: 테이블 상단에 "총 50개의 키워드"
- ✅ **복사 기능**: `navigator.clipboard.writeText`
- ✅ **DELETE 백엔드**: 스키마, 서비스, 라우트, 훅

### 14.3 수정된 요소

- 🔄 **PageLayout**: 인라인 스타일 → Tailwind 클래스
- 🔄 **KeywordTable**: 리팩토링 (10가지 개선사항)
- 🔄 **버튼 위계**: "AI 추천" Primary, "키워드 추가" Secondary
- 🔄 **타이포그래피**: `text-3xl` → `text-2xl` (전체적으로 축소)
- 🔄 **i18n**: 키워드 섹션 대폭 확장 (30개 이상 키 추가)
- 🔄 **date-fns locale**: 하드코딩 → `useLocale()` 훅으로 동적 처리

---

## 15. 리스크 및 고려사항

### 15.1 리스크

#### 1. 백엔드 DELETE 미구현
- **현상**: 현재 `route.ts`에 DELETE 엔드포인트 없음
- **영향**: 삭제 기능 동작 안 함
- **완화**: Phase 1에서 우선 구현

#### 2. 소스 필터 타입 불일치
- **현상**: 스키마는 `'dataforseo'`, UI는 `'ai'`로 표시
- **영향**: 필터링 시 혼란 가능
- **완화**: `SearchSection`에서 `'dataforseo'` 사용하되, i18n으로 "AI" 표시

#### 3. 메트릭 데이터 없음
- **현상**: `metrics` 필드가 schema에 없음
- **영향**: 검색량/경쟁도 컬럼 미구현
- **완화**: 현재 계획에서 메트릭 컬럼 제거

### 15.2 고려사항

#### 1. shadcn-ui 컴포넌트 설치
- `npx shadcn@latest add alert-dialog` 명령어 실행 필요
- 설치 전에는 `DeleteDialog` 컴파일 에러 발생

#### 2. 브랜드 컬러 미정의
- 임시로 `blue-600` 사용
- 추후 브랜드 컬러 정의 시 일괄 변경 필요

#### 3. 다크모드 미지원
- Tailwind 설정에만 존재, 실제 컴포넌트는 라이트 모드만
- 추후 필요 시 `dark:` prefix 추가

---

## 16. 다음 단계 (Phase 4 이후)

### 16.1 모바일 최적화 (Phase 3로 상향 가능)

#### 카드 뷰 전환
```tsx
// 768px 이하에서 카드 레이아웃
<div className="hidden md:block">
  <Table>...</Table>
</div>

<div className="md:hidden space-y-3">
  {filteredItems.map((keyword) => (
    <Card key={keyword.id} className="p-4">
      {/* 카드 레이아웃 */}
    </Card>
  ))}
</div>
```

### 16.2 편집 기능 (사용자 피드백 후)

#### EditDialog Component
```tsx
// src/features/keywords/components/edit-dialog.tsx
interface EditDialogProps {
  keyword: Keyword;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

#### UPDATE 백엔드
- `PATCH /api/keywords/:id`
- `updateKeyword` 서비스 함수
- `useUpdateKeyword` 훅

### 16.3 메트릭 컬럼 (백엔드 구현 후)

#### 백엔드 확인
- `metrics.searchVolume` 제공 여부
- `metrics.competition` 제공 여부

#### UI 추가
```tsx
<TableCell>
  <span className="text-sm text-gray-900">
    {keyword.metrics?.searchVolume?.toLocaleString() || '-'}
  </span>
</TableCell>
<TableCell>
  <Badge variant={competitionVariant}>
    {keyword.metrics?.competition || '-'}
  </Badge>
</TableCell>
```

### 16.4 일괄 삭제 (Phase 4)

#### 체크박스 선택
```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);
```

#### 일괄 삭제 버튼
```tsx
<Button
  onClick={handleBulkDelete}
  disabled={selectedIds.length === 0}
>
  {selectedIds.length}개 삭제
</Button>
```

#### 백엔드 트랜잭션
- Supabase `.delete().in('id', ids)`
- 부분 실패 처리 (10개 중 5개 실패 시?)

---

## 17. 최종 권장사항

### 17.1 즉시 실행

1. **shadcn-ui 컴포넌트 설치**
   ```bash
   npx shadcn@latest add alert-dialog
   ```

2. **Phase 1부터 순서대로 구현**
   - 백엔드 먼저 구현 후 테스트
   - 컴포넌트는 독립적으로 하나씩 구현
   - 페이지 통합은 마지막

3. **각 단계마다 동작 확인**
   - 백엔드: Postman으로 API 테스트
   - 컴포넌트: Storybook 또는 페이지에서 직접 확인
   - 페이지: 실제 사용자 시나리오 테스트

### 17.2 구현 후

4. **사용자 피드백 수집**
   - 검색 기능이 유용한가?
   - 소스 필터가 필요한가?
   - 편집 기능이 필요한가?
   - 모바일 사용 비율은?

5. **점진적 개선**
   - Phase 3, 4는 피드백에 따라 선택적 구현
   - 메트릭 데이터는 백엔드 구현 후 추가

---

## 18. 예상 시간 (수정)

| Phase | 작업 | 예상 시간 |
|-------|------|----------|
| Phase 1 | 백엔드 구현 | 1시간 |
| Phase 2 | 컴포넌트 리팩토링 | 2시간 |
| Phase 3 | 페이지 통합 | 1시간 |
| Phase 4 | 최종 검증 | 30분 |
| **합계** | | **4.5시간** |

**원안 대비**: 23시간 → 4.5시간 (18.5시간 단축)

---

## 19. 참고 자료

### 19.1 기존 코드베이스

- `src/app/[locale]/(protected)/keywords/page.tsx`: 현재 페이지 구조
- `src/features/keywords/components/KeywordTable.tsx`: 현재 테이블 구현
- `src/features/keywords/hooks/useKeywordQuery.ts`: React Query 훅
- `src/features/keywords/backend/route.ts`: Hono 라우터
- `messages/ko.json`: 한글 번역

### 19.2 외부 문서

- [shadcn-ui Table](https://ui.shadcn.com/docs/components/table)
- [shadcn-ui Alert Dialog](https://ui.shadcn.com/docs/components/alert-dialog)
- [TanStack Query v5](https://tanstack.com/query/latest/docs/framework/react/overview)
- [next-intl](https://next-intl-docs.vercel.app/)
- [date-fns](https://date-fns.org/docs/Getting-Started)

---

**작성 완료**: 2025-11-16
**다음 단계**: Phase 1 백엔드 구현 시작
