# Articles 페이지 구현 계획

## 1. 코드베이스 분석 결과

### 1.1 프로젝트 구조

```
src/
  app/
    [locale]/
      (protected)/
        articles/
          page.tsx                    # 현재 "Coming Soon" 상태
          [id]/
            edit/
              page.tsx                # 글 편집 페이지 (이미 구현됨)
  features/
    articles/
      components/                     # 기존 컴포넌트들
        article-form.tsx
        generation-form.tsx
        seo-panel.tsx
        auto-save-indicator.tsx
        table-of-contents.tsx
        generation-progress.tsx
      hooks/                          # 기존 훅들
        useListArticles.ts            # ✅ 이미 존재
        useCreateArticle.ts
        useUpdateArticle.ts
        useArticle.ts
      lib/
        dto.ts                        # API 스키마 재노출
      backend/
        schema.ts                     # 요청/응답 스키마 정의
        service.ts
        route.ts
  components/
    ui/                               # Shadcn UI 컴포넌트
      button.tsx
      card.tsx
      input.tsx
      select.tsx
      badge.tsx
      dropdown-menu.tsx
      dialog.tsx
      skeleton.tsx
    layout/
      page-layout.tsx                 # ✅ 이미 사용 중
  lib/
    remote/
      api-client.ts                   # HTTP 클라이언트
  messages/
    ko.json                           # ✅ i18n 한국어
    en.json                           # ✅ i18n 영어
```

### 1.2 기존 패턴

#### 컴포넌트 패턴
- **Client Component**: 모든 컴포넌트는 `"use client"` 지시자 사용
- **PageLayout**: 공통 레이아웃 컴포넌트 사용 (`title`, `description` props)
- **Shadcn UI**: Button, Card, Input, Select, Badge 등 UI 라이브러리 활용
- **Framer Motion**: 애니메이션 (예: `hero-section.tsx`에서 `fadeUpStagger` 사용)

#### 상태 관리 패턴
- **React Query**: 서버 상태 관리 (`@tanstack/react-query`)
- **useListArticles**: 이미 구현된 훅, `query` 파라미터로 필터링 지원
  - `status`: 'draft' | 'published' | 'archived' | 'all'
  - `sortBy`: 'created_at' | 'updated_at' | 'title'
  - `sortOrder`: 'asc' | 'desc'
  - `limit`, `offset`: 페이지네이션

#### i18n 패턴
- **next-intl**: `useTranslations` 훅 사용
- **messages/ko.json, en.json**: 중첩 객체 구조
- **네이밍**: `articles.title`, `articles.description` 등

#### 스타일링 패턴
- **Tailwind CSS**: 유틸리티 클래스 기반
- **컬러**:
  - Primary: `#3BA2F8` (blue-500)
  - Gray: `#F9FAFB`, `#E5E7EB`, `#6B7280`, `#111827`
  - Background: `#FCFCFD`
- **간격**: `space-y-6` (24px), `space-y-3` (12px)

### 1.3 기술 스택

| 라이브러리 | 버전 | 용도 |
|----------|------|------|
| Next.js | 15.2.3 | App Router |
| React | 19.0.0 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 4.1.13 | 스타일링 |
| Framer Motion | 11.x | 애니메이션 |
| React Query | 5.x | 서버 상태 관리 |
| next-intl | 4.5.3 | i18n |
| date-fns | 4.x | 날짜 포맷팅 |
| zod | 3.x | 스키마 검증 |
| lucide-react | 0.469.0 | 아이콘 |
| Shadcn UI | - | UI 컴포넌트 |
| Clerk | 6.34.5 | 인증 |

---

## 2. 파일 구조

### 2.1 생성할 파일 (7개)

```
src/features/articles/components/
  articles-header.tsx               # 헤더 (제목, 설명, 버튼, 총 글 수)
  articles-filters.tsx              # 검색, 필터, Active Pills
  articles-grid.tsx                 # 그리드 레이아웃 및 로딩/Empty 처리
  article-card.tsx                  # 카드 컴포넌트 (제목, 상태, 수정일)
  article-card-menu.tsx             # 카드 메뉴 (편집, 삭제)
  articles-empty-state.tsx          # Empty State (no-articles, no-results)
  articles-grid-skeleton.tsx        # 스켈레톤 로딩 UI
```

### 2.2 수정할 파일 (3개)

```
src/app/[locale]/(protected)/articles/page.tsx          # 메인 페이지 (전체 구조)
messages/ko.json                                        # 한국어 번역 추가
messages/en.json                                        # 영어 번역 추가
```

### 2.3 필요 시 수정할 파일 (선택적)

```
src/features/articles/hooks/useDeleteArticle.ts         # 삭제 훅 (없으면 생성)
```

---

## 3. 의존성

### 3.1 이미 설치된 패키지 (확인됨)

- ✅ `framer-motion` (11.x)
- ✅ `lucide-react` (0.469.0)
- ✅ `date-fns` (4.x)
- ✅ `@tanstack/react-query` (5.x)
- ✅ `next-intl` (4.5.3)
- ✅ `zod` (3.x)
- ✅ Shadcn UI 컴포넌트들 (Button, Card, Input, Select, Badge, DropdownMenu, Dialog, Skeleton)

### 3.2 설치 필요한 패키지

**없음** - 모든 필요한 패키지가 이미 설치되어 있습니다.

---

## 4. 구현 순서

### Phase 1: 핵심 UI (우선순위 1)

#### Step 1.1: ArticlesHeader 컴포넌트
- 파일: `src/features/articles/components/articles-header.tsx`
- 기능: 페이지 제목, 설명, "AI로 글 생성" 버튼, 총 글 수 표시
- 의존성: 없음

#### Step 1.2: ArticleCard 컴포넌트
- 파일: `src/features/articles/components/article-card.tsx`
- 기능: 글 제목, 상태 Badge, 수정일 표시
- 의존성: ArticleCardMenu (나중에 통합)

#### Step 1.3: ArticlesGrid 컴포넌트
- 파일: `src/features/articles/components/articles-grid.tsx`
- 기능: 그리드 레이아웃, 로딩/Empty 상태 처리
- 의존성: ArticleCard, ArticlesEmptyState, ArticlesGridSkeleton

#### Step 1.4: ArticlesEmptyState 컴포넌트
- 파일: `src/features/articles/components/articles-empty-state.tsx`
- 기능: "글 없음" 및 "검색 결과 없음" 상태
- 의존성: 없음

#### Step 1.5: ArticlesGridSkeleton 컴포넌트
- 파일: `src/features/articles/components/articles-grid-skeleton.tsx`
- 기능: 로딩 스켈레톤 UI
- 의존성: 없음

#### Step 1.6: 메인 페이지 통합
- 파일: `src/app/[locale]/(protected)/articles/page.tsx`
- 기능: ArticlesHeader, ArticlesGrid 통합
- API: `useListArticles` 훅 사용

**Phase 1 목표**: 글 목록 표시, 로딩 상태, Empty State 표시

---

### Phase 2: 검색 & 필터 (우선순위 2)

#### Step 2.1: ArticlesFilters 컴포넌트
- 파일: `src/features/articles/components/articles-filters.tsx`
- 기능: 검색 입력, 상태 필터, 정렬 선택
- 상태: `searchQuery`, `statusFilter`, `sortBy` (페이지 컴포넌트에서 관리)

#### Step 2.2: Active Filter Pills
- 파일: `articles-filters.tsx` 내부
- 기능: 적용된 필터 표시 및 제거

#### Step 2.3: 서버 사이드 필터링
- 파일: `page.tsx`
- 기능: `useListArticles`에 필터 파라미터 전달

#### Step 2.4: i18n 번역 추가
- 파일: `messages/ko.json`, `messages/en.json`
- 기능: 모든 문자열 번역 추가

**Phase 2 목표**: 검색, 필터링, 정렬 기능 완성

---

### Phase 3: 액션 & 상호작용 (우선순위 3)

#### Step 3.1: ArticleCardMenu 컴포넌트
- 파일: `src/features/articles/components/article-card-menu.tsx`
- 기능: DropdownMenu (편집, 삭제)
- 의존성: Shadcn DropdownMenu

#### Step 3.2: 삭제 기능
- 파일: `src/features/articles/hooks/useDeleteArticle.ts` (필요 시 생성)
- 기능: `useMutation`으로 삭제 API 호출

#### Step 3.3: 삭제 확인 Dialog
- 파일: `article-card-menu.tsx` 또는 별도 컴포넌트
- 기능: 삭제 전 확인 다이얼로그

#### Step 3.4: 토스트 메시지
- 라이브러리: `sonner` (이미 설치됨)
- 기능: 성공/실패 피드백

**Phase 3 목표**: 글 편집, 삭제 기능 완성

---

### Phase 4: 폴리싱 (우선순위 4)

#### Step 4.1: 애니메이션 추가
- Page Enter 애니메이션
- Empty State 애니메이션

#### Step 4.2: 접근성 개선
- ARIA 레이블
- 키보드 네비게이션

#### Step 4.3: 반응형 디자인 테스트
- 모바일, 태블릿, 데스크톱

**Phase 4 목표**: Claude.ai 수준 품질

---

## 5. 컴포넌트 상세 명세

### 5.1 ArticlesHeader

**파일**: `src/features/articles/components/articles-header.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ArticlesHeaderProps {
  totalCount?: number;
}

export function ArticlesHeader({ totalCount = 0 }: ArticlesHeaderProps) {
  const t = useTranslations("articles");
  const router = useRouter();

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold mb-1 text-gray-900">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-600">
          {t("description")}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {t("total_count", { count: totalCount })}
        </span>
        <Button
          onClick={() => router.push("/new-article")}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {t("create_new")}
        </Button>
      </div>
    </div>
  );
}
```

**Props 인터페이스**:
```typescript
interface ArticlesHeaderProps {
  totalCount?: number;  // 총 글 수
}
```

**i18n 키**:
- `articles.title`: "글 관리"
- `articles.description`: "AI가 작성한 블로그 글을 검토하고 발행하세요"
- `articles.total_count`: "총 {count}개 글"
- `articles.create_new`: "AI로 글 생성"

---

### 5.2 ArticlesFilters

**파일**: `src/features/articles/components/articles-filters.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface ArticlesFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: "all" | "draft" | "published" | "archived";
  setStatusFilter: (value: "all" | "draft" | "published" | "archived") => void;
  sortBy: "created_at" | "updated_at" | "title";
  setSortBy: (value: "created_at" | "updated_at" | "title") => void;
}

export function ArticlesFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}: ArticlesFiltersProps) {
  const t = useTranslations("articles");

  const hasActiveFilters = statusFilter !== "all" || searchQuery.trim() !== "";

  return (
    <div className="mb-6 space-y-3">
      {/* 검색 입력창 (크게) */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          className="h-12 pl-12 text-base"
          placeholder={t("search_placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 필터 & 정렬 (작게) */}
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filter.all")}</SelectItem>
            <SelectItem value="published">{t("filter.published")}</SelectItem>
            <SelectItem value="draft">{t("filter.draft")}</SelectItem>
            <SelectItem value="archived">{t("filter.archived")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">{t("sort.newest")}</SelectItem>
            <SelectItem value="created_at">{t("sort.created")}</SelectItem>
            <SelectItem value="title">{t("sort.title")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex gap-2">
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1.5">
              {t(`filter.${statusFilter}`)}
              <X
                className="h-3 w-3 cursor-pointer hover:text-gray-900"
                onClick={() => setStatusFilter("all")}
              />
            </Badge>
          )}
          {searchQuery.trim() && (
            <Badge variant="secondary" className="gap-1.5">
              {searchQuery}
              <X
                className="h-3 w-3 cursor-pointer hover:text-gray-900"
                onClick={() => setSearchQuery("")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
```

**Props 인터페이스**:
```typescript
interface ArticlesFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: "all" | "draft" | "published" | "archived";
  setStatusFilter: (value: "all" | "draft" | "published" | "archived") => void;
  sortBy: "created_at" | "updated_at" | "title";
  setSortBy: (value: "created_at" | "updated_at" | "title") => void;
}
```

**i18n 키**:
- `articles.search_placeholder`: "글 제목이나 키워드로 검색..."
- `articles.filter.all`: "전체"
- `articles.filter.published`: "발행됨"
- `articles.filter.draft`: "초안"
- `articles.filter.archived`: "보관됨"
- `articles.sort.newest`: "최근 수정순"
- `articles.sort.created`: "생성일순"
- `articles.sort.title`: "제목순"

---

### 5.3 ArticleCard

**파일**: `src/features/articles/components/article-card.tsx`

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import Link from "next/link";
import { ArticleCardMenu } from "./article-card-menu";
import type { ArticleResponse } from "@/features/articles/lib/dto";

interface ArticleCardProps {
  article: ArticleResponse;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ArticleCard({ article, onEdit, onDelete }: ArticleCardProps) {
  const t = useTranslations("articles");
  const locale = useTranslations().locale;
  const dateLocale = locale === "ko" ? ko : enUS;

  return (
    <Card className="p-5 hover:shadow-md transition-shadow duration-150">
      {/* 상태 Badge + 메뉴 */}
      <div className="flex items-start justify-between mb-3">
        <Badge
          variant={article.status === "published" ? "default" : "secondary"}
          className="text-xs"
        >
          {article.status === "published" ? (
            <>
              <CheckCircle className="mr-1 h-3 w-3" />
              {t("status.published")}
            </>
          ) : (
            <>
              <Clock className="mr-1 h-3 w-3" />
              {t("status.draft")}
            </>
          )}
        </Badge>

        <ArticleCardMenu
          articleId={article.id}
          onEdit={() => onEdit(article.id)}
          onDelete={() => onDelete(article.id)}
        />
      </div>

      {/* 제목 */}
      <Link href={`/articles/${article.id}/edit`}>
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
      </Link>

      {/* 수정일 */}
      <p className="text-xs text-gray-500">
        {formatDistanceToNow(new Date(article.updatedAt), {
          locale: dateLocale,
          addSuffix: true,
        })}
      </p>
    </Card>
  );
}
```

**Props 인터페이스**:
```typescript
interface ArticleCardProps {
  article: ArticleResponse;         // API 응답 스키마
  onEdit: (id: string) => void;      // 편집 핸들러
  onDelete: (id: string) => void;    // 삭제 핸들러
}
```

**i18n 키**:
- `articles.status.published`: "발행됨"
- `articles.status.draft`: "초안"

---

### 5.4 ArticleCardMenu

**파일**: `src/features/articles/components/article-card-menu.tsx`

```typescript
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash } from "lucide-react";
import { useTranslations } from "next-intl";

interface ArticleCardMenuProps {
  articleId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ArticleCardMenu({
  articleId,
  onEdit,
  onDelete,
}: ArticleCardMenuProps) {
  const t = useTranslations("articles");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label={t("menu.aria_label")}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          {t("menu.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          {t("menu.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Props 인터페이스**:
```typescript
interface ArticleCardMenuProps {
  articleId: string;
  onEdit: () => void;
  onDelete: () => void;
}
```

**i18n 키**:
- `articles.menu.aria_label`: "글 메뉴 열기"
- `articles.menu.edit`: "수정"
- `articles.menu.delete`: "삭제"

---

### 5.5 ArticlesGrid

**파일**: `src/features/articles/components/articles-grid.tsx`

```typescript
"use client";

import { ArticleCard } from "./article-card";
import { ArticlesEmptyState } from "./articles-empty-state";
import { ArticlesGridSkeleton } from "./articles-grid-skeleton";
import type { ArticleResponse } from "@/features/articles/lib/dto";

interface ArticlesGridProps {
  articles: ArticleResponse[];
  isLoading: boolean;
  hasFilters: boolean; // 검색어나 필터가 적용되었는지
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ArticlesGrid({
  articles,
  isLoading,
  hasFilters,
  onEdit,
  onDelete,
}: ArticlesGridProps) {
  if (isLoading) {
    return <ArticlesGridSkeleton count={6} />;
  }

  if (articles.length === 0) {
    return (
      <ArticlesEmptyState variant={hasFilters ? "no-results" : "no-articles"} />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
```

**Props 인터페이스**:
```typescript
interface ArticlesGridProps {
  articles: ArticleResponse[];
  isLoading: boolean;
  hasFilters: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
```

---

### 5.6 ArticlesEmptyState

**파일**: `src/features/articles/components/articles-empty-state.tsx`

```typescript
"use client";

import { motion } from "framer-motion";
import { FileText, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface ArticlesEmptyStateProps {
  variant: "no-articles" | "no-results";
}

export function ArticlesEmptyState({ variant }: ArticlesEmptyStateProps) {
  const t = useTranslations("articles.emptyState");
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[400px] items-center justify-center"
    >
      <div className="text-center max-w-md space-y-5">
        {/* 아이콘 */}
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-50 p-5">
            {variant === "no-articles" ? (
              <FileText className="h-12 w-12 text-blue-500" />
            ) : (
              <Search className="h-12 w-12 text-gray-400" />
            )}
          </div>
        </div>

        {/* 메시지 */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            {t(`${variant}.title`)}
          </h3>
          <p className="text-sm text-gray-600">
            {t(`${variant}.description`)}
          </p>
        </div>

        {/* CTA */}
        {variant === "no-articles" && (
          <Button
            size="lg"
            onClick={() => router.push("/new-article")}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {t("create_first")}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
```

**Props 인터페이스**:
```typescript
interface ArticlesEmptyStateProps {
  variant: "no-articles" | "no-results";
}
```

**i18n 키**:
- `articles.emptyState.no-articles.title`: "아직 작성한 글이 없습니다"
- `articles.emptyState.no-articles.description`: "AI 블로그 글 생성기로 첫 글을 작성해보세요"
- `articles.emptyState.no-results.title`: "검색 결과가 없습니다"
- `articles.emptyState.no-results.description`: "다른 검색어나 필터를 시도해보세요"
- `articles.emptyState.create_first`: "AI로 첫 글 생성"

---

### 5.7 ArticlesGridSkeleton

**파일**: `src/features/articles/components/articles-grid-skeleton.tsx`

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ArticlesGridSkeletonProps {
  count?: number;
}

export function ArticlesGridSkeleton({ count = 6 }: ArticlesGridSkeletonProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-5">
          {/* Badge + Menu */}
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>

          {/* 제목 */}
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3 mb-2" />

          {/* 수정일 */}
          <Skeleton className="h-4 w-32" />
        </Card>
      ))}
    </div>
  );
}
```

**Props 인터페이스**:
```typescript
interface ArticlesGridSkeletonProps {
  count?: number;  // 스켈레톤 카드 개수 (기본 6개)
}
```

---

### 5.8 메인 페이지 (ArticlesPage)

**파일**: `src/app/[locale]/(protected)/articles/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/layout/page-layout";
import { ArticlesHeader } from "@/features/articles/components/articles-header";
import { ArticlesFilters } from "@/features/articles/components/articles-filters";
import { ArticlesGrid } from "@/features/articles/components/articles-grid";
import { useListArticles } from "@/features/articles/hooks/useListArticles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAuthenticatedClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { useAuth } from "@clerk/nextjs";

type ArticlesPageProps = {
  params: Promise<Record<string, never>>;
};

export default function ArticlesPage({ params }: ArticlesPageProps) {
  void params;
  const t = useTranslations("articles");
  const router = useRouter();
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all");
  const [sortBy, setSortBy] = useState<"created_at" | "updated_at" | "title">("updated_at");

  // 삭제 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);

  // API 호출
  const { data, isLoading } = useListArticles({
    query: {
      status: statusFilter === "all" ? undefined : statusFilter,
      sortBy,
      sortOrder: "desc",
      limit: 100, // Phase 1에서는 페이지네이션 없이 전부 로드
    },
  });

  // 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const client = createAuthenticatedClient(userId);
      await client.delete(`/api/articles/${articleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success(t("delete.success.title"), {
        description: t("delete.success.desc"),
      });
      setDeleteDialogOpen(false);
      setDeletingArticleId(null);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, t("delete.error.desc"));
      toast.error(t("delete.error.title"), {
        description: message,
      });
    },
  });

  // 클라이언트 사이드 필터링 (검색어)
  const filteredArticles = data?.articles.filter((article) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.keywords.some((kw) => kw.toLowerCase().includes(query))
    );
  }) || [];

  const hasFilters = statusFilter !== "all" || searchQuery.trim() !== "";

  // 핸들러
  const handleEdit = (id: string) => {
    router.push(`/articles/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    setDeletingArticleId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingArticleId) {
      deleteMutation.mutate(deletingArticleId);
    }
  };

  return (
    <PageLayout title={t("title")} description={t("description")}>
      {/* Header */}
      <ArticlesHeader totalCount={data?.total || 0} />

      {/* Filters */}
      <ArticlesFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Grid */}
      <ArticlesGrid
        articles={filteredArticles}
        isLoading={isLoading}
        hasFilters={hasFilters}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 삭제 확인 Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("delete.confirm.title")}</DialogTitle>
            <DialogDescription>
              {t("delete.confirm.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              {t("delete.confirm.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("delete.confirm.deleting") : t("delete.confirm.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
```

**상태 관리**:
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all");
const [sortBy, setSortBy] = useState<"created_at" | "updated_at" | "title">("updated_at");
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);
```

**API 호출**:
```typescript
const { data, isLoading } = useListArticles({
  query: {
    status: statusFilter === "all" ? undefined : statusFilter,
    sortBy,
    sortOrder: "desc",
    limit: 100,
  },
});
```

**i18n 키** (추가 필요):
- `articles.delete.success.title`: "삭제 완료"
- `articles.delete.success.desc`: "글이 삭제되었습니다"
- `articles.delete.error.title`: "삭제 실패"
- `articles.delete.error.desc`: "글 삭제 중 오류가 발생했습니다"
- `articles.delete.confirm.title`: "글 삭제"
- `articles.delete.confirm.description`: "이 글을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
- `articles.delete.confirm.cancel`: "취소"
- `articles.delete.confirm.delete`: "삭제"
- `articles.delete.confirm.deleting`: "삭제 중..."

---

## 6. i18n 번역 키 구조

### 6.1 한국어 (messages/ko.json)

```json
{
  "articles": {
    "title": "글 관리",
    "description": "AI가 작성한 블로그 글을 검토하고 발행하세요",
    "total_count": "총 {count}개 글",
    "create_new": "AI로 글 생성",

    "search_placeholder": "글 제목이나 키워드로 검색...",

    "filter": {
      "all": "전체",
      "published": "발행됨",
      "draft": "초안",
      "archived": "보관됨"
    },

    "sort": {
      "newest": "최근 수정순",
      "created": "생성일순",
      "title": "제목순"
    },

    "status": {
      "published": "발행됨",
      "draft": "초안",
      "archived": "보관됨"
    },

    "menu": {
      "aria_label": "글 메뉴 열기",
      "edit": "수정",
      "delete": "삭제"
    },

    "emptyState": {
      "no-articles": {
        "title": "아직 작성한 글이 없습니다",
        "description": "AI 블로그 글 생성기로 첫 글을 작성해보세요"
      },
      "no-results": {
        "title": "검색 결과가 없습니다",
        "description": "다른 검색어나 필터를 시도해보세요"
      },
      "create_first": "AI로 첫 글 생성"
    },

    "delete": {
      "success": {
        "title": "삭제 완료",
        "desc": "글이 삭제되었습니다"
      },
      "error": {
        "title": "삭제 실패",
        "desc": "글 삭제 중 오류가 발생했습니다"
      },
      "confirm": {
        "title": "글 삭제",
        "description": "이 글을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
        "cancel": "취소",
        "delete": "삭제",
        "deleting": "삭제 중..."
      }
    }
  }
}
```

### 6.2 영어 (messages/en.json)

```json
{
  "articles": {
    "title": "Articles",
    "description": "Review and publish your AI-generated blog articles",
    "total_count": "{count} articles in total",
    "create_new": "Generate with AI",

    "search_placeholder": "Search by title or keywords...",

    "filter": {
      "all": "All",
      "published": "Published",
      "draft": "Draft",
      "archived": "Archived"
    },

    "sort": {
      "newest": "Recently Updated",
      "created": "Date Created",
      "title": "Title"
    },

    "status": {
      "published": "Published",
      "draft": "Draft",
      "archived": "Archived"
    },

    "menu": {
      "aria_label": "Open article menu",
      "edit": "Edit",
      "delete": "Delete"
    },

    "emptyState": {
      "no-articles": {
        "title": "No articles yet",
        "description": "Create your first article with AI blog generator"
      },
      "no-results": {
        "title": "No results found",
        "description": "Try different keywords or filters"
      },
      "create_first": "Generate First Article with AI"
    },

    "delete": {
      "success": {
        "title": "Deleted",
        "desc": "Article has been deleted"
      },
      "error": {
        "title": "Delete Failed",
        "desc": "An error occurred while deleting the article"
      },
      "confirm": {
        "title": "Delete Article",
        "description": "Are you sure you want to delete this article? This action cannot be undone.",
        "cancel": "Cancel",
        "delete": "Delete",
        "deleting": "Deleting..."
      }
    }
  }
}
```

---

## 7. 스타일링 가이드

### 7.1 Tailwind 클래스 패턴

#### 타이포그래피
```typescript
const typography = {
  h1: "text-2xl font-bold text-gray-900",        // 페이지 제목
  h2: "text-lg font-semibold text-gray-900",     // 카드 제목
  body: "text-sm text-gray-600",                 // 본문
  caption: "text-xs text-gray-500",              // 메타 정보
};
```

#### 간격
```typescript
const spacing = {
  section: "mb-8",         // 섹션 간 (32px)
  element: "mb-6",         // 요소 간 (24px)
  inner: "space-y-3",      // 내부 간격 (12px)
};
```

#### 컬러
```typescript
const colors = {
  primary: "bg-blue-500 hover:bg-blue-600",      // 주요 버튼
  text: {
    primary: "text-gray-900",                     // 주요 텍스트
    secondary: "text-gray-600",                   // 보조 텍스트
    muted: "text-gray-500",                       // 비활성 텍스트
  },
  status: {
    published: "bg-green-100 text-green-800",    // 발행됨 Badge
    draft: "bg-yellow-100 text-yellow-800",      // 초안 Badge
  },
};
```

### 7.2 반응형 디자인

```typescript
// Grid 레이아웃
<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
</div>

// Header
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
  {/* 모바일: 세로 정렬, 데스크톱: 가로 정렬 */}
</div>

// 검색 입력
<Input className="h-12 text-base w-full" />
{/* 모든 화면에서 전폭 */}
```

### 7.3 다크모드

**Phase 1-3에서는 다크모드 지원하지 않음** (라이트 모드만)
- Phase 4 이후 필요 시 `next-themes` 활용

---

## 8. 성능 고려사항

### 8.1 애니메이션 최적화

**사용하는 애니메이션**:
1. **Page Enter**: ❌ (제거, 불필요한 지연)
2. **Empty State**: ✅ (임팩트 큼, fade + scale)
3. **Card Hover**: ✅ (CSS transition으로 충분)

**Framer Motion 사용 최소화**:
- Empty State 컴포넌트에만 사용
- 카드 호버는 CSS `transition-shadow duration-150`

```css
/* CSS transition으로 충분 */
.card {
  @apply transition-shadow duration-150 hover:shadow-md;
}
```

### 8.2 클라이언트 사이드 필터링 (Phase 1-3)

```typescript
// Phase 1-3: 클라이언트에서 검색어 필터링 (간단)
const filteredArticles = data?.articles.filter((article) => {
  if (!searchQuery.trim()) return true;
  const query = searchQuery.toLowerCase();
  return (
    article.title.toLowerCase().includes(query) ||
    article.keywords.some((kw) => kw.toLowerCase().includes(query))
  );
}) || [];
```

**Phase 4에서 서버 사이드로 전환**:
- 백엔드 API에 `search` 파라미터 추가
- 클라이언트는 결과만 표시

### 8.3 이미지 최적화

현재는 이미지 없음. 필요 시:
- Next.js `Image` 컴포넌트 사용
- `placeholder="blur"`
- 적절한 `sizes` 속성

---

## 9. 접근성 체크리스트

### 9.1 시맨틱 HTML

- [x] `<h1>`, `<h2>`, `<h3>` 계층 구조
- [x] `<button>` vs `<a>` 올바른 사용
- [x] `<input>` 레이블 연결

### 9.2 ARIA 레이블

```typescript
// 버튼
<Button aria-label={t("menu.aria_label")}>

// 검색 입력
<Input
  placeholder={t("search_placeholder")}
  aria-label="검색"
/>

// Badge
<Badge aria-label={`상태: ${t("status.published")}`}>
```

### 9.3 키보드 네비게이션

- [x] 모든 버튼 `Tab`으로 접근 가능
- [x] `DropdownMenu` 키보드 지원 (Radix UI 기본 제공)
- [x] `Dialog` 키보드 지원 (Escape 닫기)

### 9.4 색상 대비

- [x] WCAG AA 준수 (4.5:1)
- [x] Badge: 아이콘 + 텍스트 (색상만 의존 X)

### 9.5 스크린 리더 테스트

- Phase 4에서 VoiceOver/NVDA 테스트

---

## 10. 구현 체크리스트

### Phase 1: 핵심 UI

- [ ] `articles-header.tsx` 생성
- [ ] `article-card.tsx` 생성
- [ ] `articles-grid.tsx` 생성
- [ ] `articles-empty-state.tsx` 생성
- [ ] `articles-grid-skeleton.tsx` 생성
- [ ] `page.tsx` 수정 (기본 구조)
- [ ] i18n 키 추가 (title, description, status, emptyState)
- [ ] API 연동 확인 (`useListArticles`)

**테스트**:
- [ ] 글 목록 표시 확인
- [ ] 로딩 스켈레톤 확인
- [ ] Empty State (no-articles) 확인
- [ ] 반응형 레이아웃 확인 (모바일, 데스크톱)

---

### Phase 2: 검색 & 필터

- [ ] `articles-filters.tsx` 생성
- [ ] 검색 입력 구현
- [ ] 상태 필터 구현 (Select)
- [ ] 정렬 구현 (Select)
- [ ] Active Filter Pills 구현
- [ ] 클라이언트 사이드 검색 필터링
- [ ] Empty State (no-results) 구현
- [ ] i18n 키 추가 (filter, sort, search)

**테스트**:
- [ ] 검색 기능 확인
- [ ] 필터 변경 확인
- [ ] 정렬 변경 확인
- [ ] Active Pills 제거 확인
- [ ] Empty State (no-results) 확인

---

### Phase 3: 액션 & 상호작용

- [ ] `article-card-menu.tsx` 생성
- [ ] DropdownMenu 구현 (편집, 삭제)
- [ ] 삭제 확인 Dialog 구현
- [ ] 삭제 Mutation 구현
- [ ] 토스트 메시지 구현 (sonner)
- [ ] 편집 라우팅 확인
- [ ] i18n 키 추가 (menu, delete)

**테스트**:
- [ ] 카드 메뉴 열기 확인
- [ ] 편집 이동 확인
- [ ] 삭제 확인 Dialog 확인
- [ ] 삭제 성공 Toast 확인
- [ ] 삭제 후 목록 갱신 확인

---

### Phase 4: 폴리싱

- [ ] Empty State 애니메이션 추가
- [ ] ARIA 레이블 검토
- [ ] 키보드 네비게이션 테스트
- [ ] 색상 대비 확인 (WCAG AA)
- [ ] 반응형 테스트 (모든 화면 크기)
- [ ] 스크린 리더 테스트 (VoiceOver/NVDA)

**테스트**:
- [ ] 모든 접근성 체크리스트 통과
- [ ] Claude.ai 수준 품질 확인

---

## 11. 향후 개선 사항 (Phase 5+)

### Phase 5: 서버 사이드 필터링

1. **백엔드 API 수정**:
   - `GET /api/articles`에 `search` 파라미터 추가
   - 예: `?search=키워드&status=published&sortBy=updated_at`

2. **프론트엔드 수정**:
   ```typescript
   const { data, isLoading } = useListArticles({
     query: {
       search: searchQuery.trim() || undefined,
       status: statusFilter === "all" ? undefined : statusFilter,
       sortBy,
       sortOrder: "desc",
       limit: 100,
     },
   });
   ```

3. **클라이언트 사이드 필터링 제거**:
   - `filteredArticles` 로직 제거
   - API 응답을 바로 사용

### Phase 6: 무한 스크롤

1. **useInfiniteQuery 도입**:
   ```typescript
   const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
     queryKey: ["articles", query],
     queryFn: async ({ pageParam = 0 }) => {
       // ...
     },
     getNextPageParam: (lastPage) => {
       if (lastPage.offset + lastPage.limit < lastPage.total) {
         return lastPage.offset + lastPage.limit;
       }
       return undefined;
     },
   });
   ```

2. **Intersection Observer**:
   - 하단 도달 시 `fetchNextPage()` 호출

### Phase 7: List View (테이블)

1. **ViewToggle 컴포넌트**:
   - Grid/List 뷰 전환 버튼

2. **ArticlesTable 컴포넌트**:
   - Shadcn `Table` 컴포넌트 사용
   - 제목, 상태, 수정일, 액션 컬럼

### Phase 8: 복제 기능

1. **API 엔드포인트**:
   - `POST /api/articles/:id/duplicate`

2. **useDuplicateArticle 훅**:
   ```typescript
   const duplicateMutation = useMutation({
     mutationFn: async (articleId: string) => {
       const client = createAuthenticatedClient(userId);
       await client.post(`/api/articles/${articleId}/duplicate`);
     },
   });
   ```

3. **메뉴에 추가**:
   ```typescript
   <DropdownMenuItem onClick={onDuplicate}>
     <Copy className="mr-2 h-4 w-4" />
     {t("menu.duplicate")}
   </DropdownMenuItem>
   ```

---

## 12. 최종 요약

### 구현 범위

| Phase | 기간 | 파일 수 | 주요 기능 |
|-------|------|---------|-----------|
| Phase 1 | 1일 | 6개 | 글 목록, 로딩, Empty State |
| Phase 2 | 1일 | 1개 | 검색, 필터, 정렬 |
| Phase 3 | 1일 | 2개 | 편집, 삭제, 토스트 |
| Phase 4 | 0.5일 | - | 애니메이션, 접근성 |
| **합계** | **3.5일** | **9개** | **완전한 글 관리 페이지** |

### 성공 지표

- [x] 사용자가 3초 안에 검색 입력창 찾기
- [x] 검색어 입력 후 즉시 결과 확인
- [x] 글이 0개일 때 명확한 다음 행동 제시
- [x] Claude.ai처럼 단순하고 전문적인 느낌

### 차별화 요소

1. **검색 중심 UI**: 큰 검색 입력창을 최상단에 배치
2. **Active Filter Pills**: 현재 적용된 필터를 명확히 표시
3. **단순한 카드**: 제목, 상태, 수정일만 표시 (불필요한 정보 제거)
4. **목적 있는 애니메이션**: Empty State에만 적용
5. **접근성 우선**: 아이콘 + 텍스트, ARIA 레이블

### 기술적 특징

- **Client Component**: 모든 컴포넌트 `"use client"` 사용
- **React Query**: 서버 상태 관리 (`useListArticles`, `useMutation`)
- **next-intl**: 다국어 지원 (한국어, 영어)
- **Shadcn UI**: 일관된 디자인 시스템
- **Tailwind CSS**: 유틸리티 클래스 기반 스타일링
- **Framer Motion**: 최소한의 애니메이션 (Empty State만)

---

## 부록: 빠른 참조

### 자주 사용하는 명령어

```bash
# 개발 서버 실행
pnpm dev

# 타입 체크
pnpm typecheck

# 린트
pnpm lint

# 테스트
pnpm test

# 환경 변수 체크
pnpm env:check
```

### 파일 경로 치트시트

```
Components:  src/features/articles/components/
Hooks:       src/features/articles/hooks/
API Schema:  src/features/articles/lib/dto.ts
i18n:        messages/ko.json, messages/en.json
Page:        src/app/[locale]/(protected)/articles/page.tsx
```

### i18n 키 네이밍 규칙

```
articles.{section}.{key}

예시:
- articles.title
- articles.filter.all
- articles.emptyState.no-articles.title
- articles.delete.confirm.description
```

### Tailwind 클래스 조합 예시

```typescript
// 버튼
"bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"

// 카드
"p-5 hover:shadow-md transition-shadow duration-150"

// 입력
"h-12 pl-12 text-base border border-gray-200 rounded"

// Badge
"text-xs px-2 py-1 rounded-full bg-green-100 text-green-800"
```

---

**이 계획서는 Articles 페이지를 3.5일 안에 완전히 구현하기 위한 로드맵입니다. 각 Phase는 독립적으로 실행 가능하며, 점진적으로 기능을 추가할 수 있습니다.**
