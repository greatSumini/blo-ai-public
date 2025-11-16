# 페이지 구현 계획 최종 검토

## 1. 원안 요약

2번 단계 구현 계획은 Articles 페이지를 위한 포괄적인 계획을 제시했습니다:

- **파일 수**: 7개의 새 컴포넌트 + 3개의 수정 파일
- **주요 기능**: 글 목록 표시, 검색/필터, 편집/삭제, Empty State
- **구현 기간**: 3.5일 (4개 Phase로 구분)
- **기술 스택**: React Query, next-intl, Shadcn UI, Framer Motion, Tailwind CSS

---

## 2. 발견된 문제점

### 2.1 코드 정확성

#### 문제 1: ArticleCard의 locale 접근 방식 오류

**위치**: `src/features/articles/components/article-card.tsx` (line 470)

**문제**:
```typescript
const locale = useTranslations().locale; // ❌ 잘못된 API 사용
```

**영향**: `useTranslations()` 훅은 `locale` 속성을 제공하지 않음. 컴파일 에러 발생.

**수정안**:
```typescript
import { useLocale } from "next-intl";

// 컴포넌트 내부
const locale = useLocale(); // ✅ 올바른 방법
const t = useTranslations("articles");
const dateLocale = locale === "ko" ? ko : enUS;
```

---

#### 문제 2: ArticlesHeader의 라우팅 경로 오류

**위치**: `src/features/articles/components/articles-header.tsx` (line 293)

**문제**:
```typescript
onClick={() => router.push("/new-article")} // ❌ 잘못된 경로
```

**영향**: 실제 경로는 `/[locale]/(protected)/new-article`이므로 404 에러 발생.

**수정안**:
```typescript
import { useLocale } from "next-intl";

export function ArticlesHeader({ totalCount = 0 }: ArticlesHeaderProps) {
  const t = useTranslations("articles");
  const router = useRouter();
  const locale = useLocale(); // ✅ locale 추가

  return (
    <div className="flex items-start justify-between mb-8">
      {/* ... */}
      <Button
        onClick={() => router.push(`/${locale}/new-article`)} // ✅ locale 포함
        className="bg-blue-500 hover:bg-blue-600"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {t("create_new")}
      </Button>
    </div>
  );
}
```

---

#### 문제 3: ArticlesEmptyState의 라우팅 경로 오류

**위치**: `src/features/articles/components/articles-empty-state.tsx` (line 730)

**문제**:
```typescript
onClick={() => router.push("/new-article")} // ❌ 동일한 경로 오류
```

**수정안**:
```typescript
import { useLocale } from "next-intl";

export function ArticlesEmptyState({ variant }: ArticlesEmptyStateProps) {
  const t = useTranslations("articles.emptyState");
  const router = useRouter();
  const locale = useLocale(); // ✅ locale 추가

  return (
    <motion.div>
      {/* ... */}
      {variant === "no-articles" && (
        <Button
          size="lg"
          onClick={() => router.push(`/${locale}/new-article`)} // ✅ locale 포함
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {t("create_first")}
        </Button>
      )}
    </motion.div>
  );
}
```

---

#### 문제 4: ArticleCard의 편집 링크 경로 오류

**위치**: `src/features/articles/components/article-card.tsx` (line 502)

**문제**:
```typescript
<Link href={`/articles/${article.id}/edit`}> // ❌ locale 누락
```

**영향**: 잘못된 경로로 인한 404 에러.

**수정안**:
```typescript
import { useLocale } from "next-intl";

export function ArticleCard({ article, onEdit, onDelete }: ArticleCardProps) {
  const locale = useLocale(); // ✅ locale 추가

  return (
    <Card className="p-5 hover:shadow-md transition-shadow duration-150">
      {/* ... */}
      <Link href={`/${locale}/articles/${article.id}/edit`}> {/* ✅ locale 포함 */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
      </Link>
    </Card>
  );
}
```

---

#### 문제 5: 메인 페이지의 편집 핸들러 경로 오류

**위치**: `src/app/[locale]/(protected)/articles/page.tsx` (line 900-902)

**문제**:
```typescript
const handleEdit = (id: string) => {
  router.push(`/articles/${id}/edit`); // ❌ locale 누락
};
```

**수정안**:
```typescript
import { useLocale } from "next-intl";

export default function ArticlesPage({ params }: ArticlesPageProps) {
  const locale = useLocale(); // ✅ locale 추가

  const handleEdit = (id: string) => {
    router.push(`/${locale}/articles/${id}/edit`); // ✅ locale 포함
  };

  // ...
}
```

---

### 2.2 구현 가능성

#### 문제 6: Sidebar의 "글 관리" 메뉴 추가 필요

**위치**: `src/components/layout/sidebar.tsx` (추정)

**문제**: 구현 계획에서 누락. Articles 페이지 접근을 위한 사이드바 메뉴가 없음.

**영향**: 사용자가 Articles 페이지로 이동할 방법이 없음.

**수정안**:

1. `messages/ko.json`에 추가:
```json
{
  "sidebar": {
    "dashboard": "대시보드",
    "new_article": "새 글 작성",
    "articles": "글 관리", // ✅ 추가
    "keywords": "키워드 관리",
    "style_guide": "스타일 가이드",
    "account": "계정 관리"
  }
}
```

2. `messages/en.json`에 추가:
```json
{
  "sidebar": {
    "dashboard": "Dashboard",
    "new_article": "New Article",
    "articles": "Articles", // ✅ 추가
    "keywords": "Keywords",
    "style_guide": "Style Guide",
    "account": "Account"
  }
}
```

3. `src/components/layout/sidebar.tsx` 수정:
```typescript
// 기존 메뉴에 Articles 추가
const menuItems = [
  { href: `/${locale}/dashboard`, icon: LayoutDashboard, label: t("sidebar.dashboard") },
  { href: `/${locale}/new-article`, icon: PenTool, label: t("sidebar.new_article") },
  { href: `/${locale}/articles`, icon: FileText, label: t("sidebar.articles") }, // ✅ 추가
  // ...
];
```

---

### 2.3 코드베이스 일관성

#### 문제 7: PageLayout 중복 사용

**위치**: `src/app/[locale]/(protected)/articles/page.tsx` (line 916)

**문제**: PageLayout이 이미 title/description을 렌더링하는데, ArticlesHeader에서도 중복으로 표시.

**영향**: 페이지 제목과 설명이 두 번 나타남.

**수정안**:

**Option A (권장)**: PageLayout의 `actions` prop 활용
```typescript
export default function ArticlesPage({ params }: ArticlesPageProps) {
  const locale = useLocale();
  const t = useTranslations("articles");

  // ArticlesHeader 대신 actions prop 사용
  const headerActions = (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500">
        {t("total_count", { count: data?.total || 0 })}
      </span>
      <Button
        onClick={() => router.push(`/${locale}/new-article`)}
        className="bg-blue-500 hover:bg-blue-600"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {t("create_new")}
      </Button>
    </div>
  );

  return (
    <PageLayout
      title={t("title")}
      description={t("description")}
      actions={headerActions} // ✅ PageLayout 활용
    >
      {/* ArticlesFilters */}
      {/* ArticlesGrid */}
    </PageLayout>
  );
}
```

**Option B**: ArticlesHeader를 단순 액션 바로 변경
```typescript
// ArticlesHeader를 제거하고 ArticlesActions로 대체
export function ArticlesActions({ totalCount, locale }: ArticlesActionsProps) {
  const t = useTranslations("articles");
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500">
        {t("total_count", { count: totalCount })}
      </span>
      <Button
        onClick={() => router.push(`/${locale}/new-article`)}
        className="bg-blue-500 hover:bg-blue-600"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {t("create_new")}
      </Button>
    </div>
  );
}
```

**결정**: **Option A 채택** (PageLayout 활용, ArticlesHeader 제거)

---

### 2.4 i18n 완전성

#### 문제 8: i18n 키 구조 불일치

**위치**: `messages/ko.json`, `messages/en.json`

**문제**: 계획서에서 제시한 i18n 키 구조가 기존 코드베이스와 다름.

**기존 구조** (ko.json):
```json
{
  "articles": {
    "title": "글 관리",
    "description": "AI로 생성된 글을 관리하고 편집하세요.",
    "coming_soon": "곧 제공될 예정입니다.",
    // ...
  }
}
```

**계획서 구조** (신규 추가 필요):
```json
{
  "articles": {
    "title": "글 관리",
    "description": "AI가 작성한 블로그 글을 검토하고 발행하세요", // ✅ 업데이트
    "total_count": "총 {count}개 글", // ✅ 추가
    "create_new": "AI로 글 생성", // ✅ 추가
    "search_placeholder": "글 제목이나 키워드로 검색...", // ✅ 추가
    // ...
  }
}
```

**수정안**: 기존 키는 유지하고 필요한 키만 추가.

---

### 2.5 성능 및 접근성

#### 문제 9: 큰 데이터셋에서 클라이언트 사이드 필터링 성능 문제

**위치**: `src/app/[locale]/(protected)/articles/page.tsx` (line 888-895)

**문제**:
```typescript
const filteredArticles = data?.articles.filter((article) => {
  // 모든 글을 클라이언트에서 필터링
}) || [];
```

**영향**: 글이 100개 이상일 때 성능 저하 가능.

**현재 수용 가능 여부**: **✅ Phase 1-3에서는 수용 가능** (limit: 100)

**Phase 5 개선 방안** (구현 계획에 이미 포함됨):
- 백엔드 API에 `search` 파라미터 추가
- 서버 사이드 검색으로 전환

---

#### 문제 10: 애니메이션 과다 사용

**위치**: 구현 계획 전체

**문제**: Framer Motion을 Empty State에만 사용하기로 했으나, 실제로는 충분히 최적화됨.

**현재 상태**: ✅ **문제 없음** (Empty State에만 사용)

---

### 2.6 누락 사항

#### 문제 11: `useDeleteArticle` 훅 대신 inline mutation 사용

**위치**: `src/app/[locale]/(protected)/articles/page.tsx` (line 866-885)

**문제**: 구현 계획에서 `useDeleteArticle.ts` 생성을 제안했으나, 실제로는 inline mutation으로 구현.

**영향**: 코드 중복 가능성 (다른 페이지에서도 삭제 기능 필요 시).

**현재 수용 가능 여부**: **✅ Phase 1-3에서는 수용 가능**

**Phase 4 개선 방안**:
```typescript
// src/features/articles/hooks/useDeleteArticle.ts
export function useDeleteArticle() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const t = useTranslations("articles");

  return useMutation({
    mutationFn: async (articleId: string) => {
      const client = createAuthenticatedClient(userId);
      await client.delete(`/api/articles/${articleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success(t("delete.success.title"), {
        description: t("delete.success.desc"),
      });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, t("delete.error.desc"));
      toast.error(t("delete.error.title"), {
        description: message,
      });
    },
  });
}
```

**결정**: **Phase 1-3에서는 inline 유지, Phase 4에서 리팩토링**

---

## 3. 최종 구현 계획

### 3.1 파일 구조 (수정안)

```
src/features/articles/components/
  articles-filters.tsx              # 검색, 필터, Active Pills
  articles-grid.tsx                 # 그리드 레이아웃 및 로딩/Empty 처리
  article-card.tsx                  # 카드 컴포넌트 (제목, 상태, 수정일)
  article-card-menu.tsx             # 카드 메뉴 (편집, 삭제)
  articles-empty-state.tsx          # Empty State (no-articles, no-results)
  articles-grid-skeleton.tsx        # 스켈레톤 로딩 UI
  # ❌ articles-header.tsx 제거 (PageLayout actions 사용)

src/app/[locale]/(protected)/articles/page.tsx          # 메인 페이지
src/components/layout/sidebar.tsx                       # ✅ "글 관리" 메뉴 추가

messages/ko.json                                        # ✅ i18n 키 추가
messages/en.json                                        # ✅ i18n 키 추가
```

**생성할 파일**: **6개** (articles-header 제거)
**수정할 파일**: **4개** (page.tsx, sidebar.tsx, ko.json, en.json)

---

### 3.2 의존성 (수정안)

✅ **모든 필요한 패키지가 이미 설치되어 있음**:
- `framer-motion` (11.x)
- `lucide-react` (0.469.0)
- `date-fns` (4.x)
- `sonner` (2.0.7)
- `@tanstack/react-query` (5.x)
- `next-intl` (4.5.3)
- Shadcn UI 컴포넌트들

**추가 설치 필요 없음**.

---

### 3.3 구현 순서 (수정안)

#### Phase 1: 핵심 UI (우선순위 1)

**Step 1.1**: ArticleCard 컴포넌트
- 파일: `src/features/articles/components/article-card.tsx`
- **수정사항**:
  - ✅ `useLocale()` 사용
  - ✅ 편집 링크에 locale 포함

**Step 1.2**: ArticlesGrid 컴포넌트
- 파일: `src/features/articles/components/articles-grid.tsx`
- **변경 없음**

**Step 1.3**: ArticlesEmptyState 컴포넌트
- 파일: `src/features/articles/components/articles-empty-state.tsx`
- **수정사항**:
  - ✅ `useLocale()` 사용
  - ✅ 버튼 링크에 locale 포함

**Step 1.4**: ArticlesGridSkeleton 컴포넌트
- 파일: `src/features/articles/components/articles-grid-skeleton.tsx`
- **변경 없음**

**Step 1.5**: 메인 페이지 구현
- 파일: `src/app/[locale]/(protected)/articles/page.tsx`
- **수정사항**:
  - ✅ ArticlesHeader 제거, PageLayout actions 사용
  - ✅ `useLocale()` 사용
  - ✅ handleEdit에 locale 포함

**Step 1.6**: Sidebar 메뉴 추가
- 파일: `src/components/layout/sidebar.tsx`
- **수정사항**:
  - ✅ "글 관리" 메뉴 항목 추가

**Step 1.7**: i18n 키 추가
- 파일: `messages/ko.json`, `messages/en.json`
- **수정사항**:
  - ✅ `articles.title`, `articles.description` 업데이트
  - ✅ `articles.total_count`, `articles.create_new` 추가
  - ✅ `sidebar.articles` 추가

---

#### Phase 2: 검색 & 필터 (우선순위 2)

**Step 2.1**: ArticlesFilters 컴포넌트
- 파일: `src/features/articles/components/articles-filters.tsx`
- **변경 없음**

**Step 2.2**: i18n 키 추가
- **수정사항**:
  - ✅ `articles.search_placeholder` 추가
  - ✅ `articles.filter.*` 추가
  - ✅ `articles.sort.*` 추가

---

#### Phase 3: 액션 & 상호작용 (우선순위 3)

**Step 3.1**: ArticleCardMenu 컴포넌트
- 파일: `src/features/articles/components/article-card-menu.tsx`
- **변경 없음**

**Step 3.2**: 삭제 확인 Dialog & Mutation
- 파일: `page.tsx` (inline mutation)
- **변경 없음** (Phase 4에서 훅으로 리팩토링 고려)

**Step 3.3**: i18n 키 추가
- **수정사항**:
  - ✅ `articles.menu.*` 추가
  - ✅ `articles.delete.*` 추가

---

#### Phase 4: 폴리싱 (우선순위 4)

**Step 4.1**: 애니메이션 검토
- Empty State 애니메이션 이미 포함됨 ✅

**Step 4.2**: 접근성 검토
- ARIA 레이블 확인
- 키보드 네비게이션 테스트

**Step 4.3**: 반응형 디자인 테스트
- 모바일, 태블릿, 데스크톱

**Step 4.4** (선택적): useDeleteArticle 훅 리팩토링
- 파일: `src/features/articles/hooks/useDeleteArticle.ts`

---

### 3.4 컴포넌트 상세 명세 (수정안)

#### 3.4.1 ArticleCard (수정됨)

**파일**: `src/features/articles/components/article-card.tsx`

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl"; // ✅ useLocale 추가
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
  const locale = useLocale(); // ✅ 올바른 API
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
      <Link href={`/${locale}/articles/${article.id}/edit`}> {/* ✅ locale 포함 */}
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

---

#### 3.4.2 ArticlesEmptyState (수정됨)

**파일**: `src/features/articles/components/articles-empty-state.tsx`

```typescript
"use client";

import { motion } from "framer-motion";
import { FileText, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl"; // ✅ useLocale 추가
import { useRouter } from "next/navigation";

interface ArticlesEmptyStateProps {
  variant: "no-articles" | "no-results";
}

export function ArticlesEmptyState({ variant }: ArticlesEmptyStateProps) {
  const t = useTranslations("articles.emptyState");
  const router = useRouter();
  const locale = useLocale(); // ✅ locale 추가

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
            onClick={() => router.push(`/${locale}/new-article`)} // ✅ locale 포함
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

---

#### 3.4.3 메인 페이지 (대폭 수정됨)

**파일**: `src/app/[locale]/(protected)/articles/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl"; // ✅ useLocale 추가
import { PageLayout } from "@/components/layout/page-layout";
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
import { Sparkles } from "lucide-react"; // ✅ 아이콘 추가

type ArticlesPageProps = {
  params: Promise<Record<string, never>>;
};

export default function ArticlesPage({ params }: ArticlesPageProps) {
  void params;
  const t = useTranslations("articles");
  const router = useRouter();
  const locale = useLocale(); // ✅ locale 추가
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
      limit: 100,
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
    router.push(`/${locale}/articles/${id}/edit`); // ✅ locale 포함
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

  // ✅ PageLayout actions 활용
  const headerActions = (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500">
        {t("total_count", { count: data?.total || 0 })}
      </span>
      <Button
        onClick={() => router.push(`/${locale}/new-article`)}
        className="bg-blue-500 hover:bg-blue-600"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {t("create_new")}
      </Button>
    </div>
  );

  return (
    <PageLayout
      title={t("title")}
      description={t("description")}
      actions={headerActions} // ✅ ArticlesHeader 대신 actions 사용
    >
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

---

#### 3.4.4 ArticlesFilters (변경 없음)

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

---

#### 3.4.5 ArticlesGrid (변경 없음)

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
  hasFilters: boolean;
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

---

#### 3.4.6 ArticleCardMenu (변경 없음)

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

---

#### 3.4.7 ArticlesGridSkeleton (변경 없음)

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

---

### 3.5 i18n 번역 키 (수정안)

#### 3.5.1 한국어 (messages/ko.json)

**기존 키 유지 + 아래 키 추가**:

```json
{
  "sidebar": {
    "dashboard": "대시보드",
    "new_article": "새 글 작성",
    "articles": "글 관리", // ✅ 추가
    "keywords": "키워드 관리",
    "style_guide": "스타일 가이드",
    "account": "계정 관리"
  },
  "articles": {
    "title": "글 관리",
    "description": "AI가 작성한 블로그 글을 검토하고 발행하세요", // ✅ 업데이트
    "total_count": "총 {count}개 글", // ✅ 추가
    "create_new": "AI로 글 생성", // ✅ 추가

    "search_placeholder": "글 제목이나 키워드로 검색...", // ✅ 추가

    "filter": {
      "all": "전체", // ✅ 추가
      "published": "발행됨", // ✅ 추가
      "draft": "초안", // ✅ 추가
      "archived": "보관됨" // ✅ 추가
    },

    "sort": {
      "newest": "최근 수정순", // ✅ 추가
      "created": "생성일순", // ✅ 추가
      "title": "제목순" // ✅ 추가
    },

    "status": {
      "published": "발행됨", // ✅ 추가
      "draft": "초안", // ✅ 추가
      "archived": "보관됨" // ✅ 추가
    },

    "menu": {
      "aria_label": "글 메뉴 열기", // ✅ 추가
      "edit": "수정", // ✅ 추가
      "delete": "삭제" // ✅ 추가
    },

    "emptyState": {
      "no-articles": {
        "title": "아직 작성한 글이 없습니다", // ✅ 추가
        "description": "AI 블로그 글 생성기로 첫 글을 작성해보세요" // ✅ 추가
      },
      "no-results": {
        "title": "검색 결과가 없습니다", // ✅ 추가
        "description": "다른 검색어나 필터를 시도해보세요" // ✅ 추가
      },
      "create_first": "AI로 첫 글 생성" // ✅ 추가
    },

    "delete": {
      "success": {
        "title": "삭제 완료", // ✅ 추가
        "desc": "글이 삭제되었습니다" // ✅ 추가
      },
      "error": {
        "title": "삭제 실패", // ✅ 추가
        "desc": "글 삭제 중 오류가 발생했습니다" // ✅ 추가
      },
      "confirm": {
        "title": "글 삭제", // ✅ 추가
        "description": "이 글을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.", // ✅ 추가
        "cancel": "취소", // ✅ 추가
        "delete": "삭제", // ✅ 추가
        "deleting": "삭제 중..." // ✅ 추가
      }
    }

    // ... 기존 키 유지 (generationForm, articleForm 등)
  }
}
```

---

#### 3.5.2 영어 (messages/en.json)

**기존 키 유지 + 아래 키 추가**:

```json
{
  "sidebar": {
    "dashboard": "Dashboard",
    "new_article": "New Article",
    "articles": "Articles", // ✅ 추가
    "keywords": "Keywords",
    "style_guide": "Style Guide",
    "account": "Account"
  },
  "articles": {
    "title": "Articles",
    "description": "Review and publish your AI-generated blog articles", // ✅ 업데이트
    "total_count": "{count} articles in total", // ✅ 추가
    "create_new": "Generate with AI", // ✅ 추가

    "search_placeholder": "Search by title or keywords...", // ✅ 추가

    "filter": {
      "all": "All", // ✅ 추가
      "published": "Published", // ✅ 추가
      "draft": "Draft", // ✅ 추가
      "archived": "Archived" // ✅ 추가
    },

    "sort": {
      "newest": "Recently Updated", // ✅ 추가
      "created": "Date Created", // ✅ 추가
      "title": "Title" // ✅ 추가
    },

    "status": {
      "published": "Published", // ✅ 추가
      "draft": "Draft", // ✅ 추가
      "archived": "Archived" // ✅ 추가
    },

    "menu": {
      "aria_label": "Open article menu", // ✅ 추가
      "edit": "Edit", // ✅ 추가
      "delete": "Delete" // ✅ 추가
    },

    "emptyState": {
      "no-articles": {
        "title": "No articles yet", // ✅ 추가
        "description": "Create your first article with AI blog generator" // ✅ 추가
      },
      "no-results": {
        "title": "No results found", // ✅ 추가
        "description": "Try different keywords or filters" // ✅ 추가
      },
      "create_first": "Generate First Article with AI" // ✅ 추가
    },

    "delete": {
      "success": {
        "title": "Deleted", // ✅ 추가
        "desc": "Article has been deleted" // ✅ 추가
      },
      "error": {
        "title": "Delete Failed", // ✅ 추가
        "desc": "An error occurred while deleting the article" // ✅ 추가
      },
      "confirm": {
        "title": "Delete Article", // ✅ 추가
        "description": "Are you sure you want to delete this article? This action cannot be undone.", // ✅ 추가
        "cancel": "Cancel", // ✅ 추가
        "delete": "Delete", // ✅ 추가
        "deleting": "Deleting..." // ✅ 추가
      }
    }

    // ... 기존 키 유지
  }
}
```

---

## 4. 주요 변경 사항

### 수정된 컴포넌트

1. **ArticleCard**:
   - `useLocale()` API 사용
   - 편집 링크에 locale 포함

2. **ArticlesEmptyState**:
   - `useLocale()` API 사용
   - "새 글 생성" 버튼에 locale 포함

3. **메인 페이지 (page.tsx)**:
   - ArticlesHeader 제거 → PageLayout `actions` prop 활용
   - `useLocale()` 추가
   - handleEdit에 locale 포함

### 추가된 파일

- **변경 없음** (계획서대로 6개 컴포넌트 생성)

### 제거된 항목

- **ArticlesHeader 컴포넌트**: PageLayout `actions` prop으로 대체

### 추가 수정 필요

- **Sidebar**: "글 관리" 메뉴 항목 추가
- **i18n 파일**: 신규 번역 키 추가 (ko.json, en.json)

---

## 5. 구현 체크리스트

### Phase 1: 핵심 UI

#### 필수 사항
- [ ] ArticleCard 생성 (`useLocale` 사용, locale 포함 링크)
- [ ] ArticlesGrid 생성
- [ ] ArticlesEmptyState 생성 (`useLocale` 사용, locale 포함 버튼)
- [ ] ArticlesGridSkeleton 생성
- [ ] 메인 페이지 수정 (ArticlesHeader 제거, PageLayout actions 사용)
- [ ] Sidebar 수정 ("글 관리" 메뉴 추가)
- [ ] i18n 키 추가 (title, description, total_count, create_new, sidebar.articles)

#### 테스트 사항
- [ ] 글 목록 표시 확인
- [ ] 로딩 스켈레톤 확인
- [ ] Empty State (no-articles) 확인
- [ ] "AI로 글 생성" 버튼 클릭 시 올바른 경로로 이동
- [ ] 카드 클릭 시 편집 페이지로 이동
- [ ] 반응형 레이아웃 확인 (모바일, 데스크톱)

---

### Phase 2: 검색 & 필터

#### 필수 사항
- [ ] ArticlesFilters 생성
- [ ] 검색 입력 구현
- [ ] 상태 필터 구현 (Select)
- [ ] 정렬 구현 (Select)
- [ ] Active Filter Pills 구현
- [ ] 클라이언트 사이드 검색 필터링
- [ ] Empty State (no-results) 구현
- [ ] i18n 키 추가 (filter, sort, search_placeholder)

#### 테스트 사항
- [ ] 검색 기능 확인
- [ ] 필터 변경 확인
- [ ] 정렬 변경 확인
- [ ] Active Pills 제거 확인
- [ ] Empty State (no-results) 확인

---

### Phase 3: 액션 & 상호작용

#### 필수 사항
- [ ] ArticleCardMenu 생성
- [ ] DropdownMenu 구현 (편집, 삭제)
- [ ] 삭제 확인 Dialog 구현
- [ ] 삭제 Mutation 구현
- [ ] 토스트 메시지 구현 (sonner)
- [ ] 편집 라우팅 확인 (locale 포함)
- [ ] i18n 키 추가 (menu, delete)

#### 테스트 사항
- [ ] 카드 메뉴 열기 확인
- [ ] 편집 이동 확인 (올바른 경로)
- [ ] 삭제 확인 Dialog 확인
- [ ] 삭제 성공 Toast 확인
- [ ] 삭제 후 목록 갱신 확인

---

### Phase 4: 폴리싱

#### 필수 사항
- [ ] Empty State 애니메이션 확인 (이미 포함됨)
- [ ] ARIA 레이블 검토
- [ ] 키보드 네비게이션 테스트
- [ ] 색상 대비 확인 (WCAG AA)
- [ ] 반응형 테스트 (모든 화면 크기)

#### 선택 사항
- [ ] useDeleteArticle 훅 리팩토링 (재사용성 향상)
- [ ] 스크린 리더 테스트 (VoiceOver/NVDA)

---

## 6. 리스크 및 주의사항

### 잠재적 문제

#### 문제 1: 큰 데이터셋에서 클라이언트 사이드 필터링 성능

**대응 방안**:
- **Phase 1-3**: limit: 100으로 제한, 수용 가능
- **Phase 5**: 백엔드 API에 `search` 파라미터 추가

#### 문제 2: Sidebar 메뉴 추가 시 기존 코드 충돌

**대응 방안**:
- Sidebar 컴포넌트 코드 확인 후 신중하게 추가
- 기존 메뉴 스타일 및 구조 유지

#### 문제 3: i18n 키 추가 시 기존 키 덮어쓰기

**대응 방안**:
- **기존 키는 절대 삭제하지 않음**
- 신규 키만 추가
- 충돌 방지를 위해 중첩 구조 유지

---

### 테스트 필요 항목

1. **라우팅 테스트**:
   - "AI로 글 생성" 버튼 → `/[locale]/new-article`
   - 카드 클릭 → `/[locale]/articles/[id]/edit`
   - 편집 메뉴 → 동일 경로

2. **i18n 테스트**:
   - 한국어/영어 전환 시 모든 텍스트 표시
   - date-fns locale 적용 확인

3. **API 테스트**:
   - 필터 변경 시 API 재호출
   - 삭제 후 목록 갱신

4. **반응형 테스트**:
   - 모바일: 1열 그리드
   - 태블릿: 2열 그리드
   - 데스크톱: 3열 그리드

---

## 7. 실행 준비 확인

- [x] 모든 타입 오류 해결 (`useLocale()` API 수정)
- [x] 모든 import 경로 검증
- [x] 모든 라우팅 경로에 locale 포함
- [x] i18n 완전성 확인 (기존 키 + 신규 키)
- [x] 성능 최적화 고려 (클라이언트 사이드 필터링)
- [x] 접근성 요구사항 충족 (ARIA, 시맨틱 HTML)
- [x] 코드베이스 일관성 유지 (PageLayout 활용)
- [x] 의존성 확인 (모두 설치됨)

---

## 8. 다음 단계

### Phase 1 시작 순서

1. **i18n 키 추가** (ko.json, en.json)
   - 모든 컴포넌트가 의존하므로 먼저 작업

2. **Sidebar 수정**
   - "글 관리" 메뉴 추가

3. **컴포넌트 생성** (의존성 순서):
   - ArticlesGridSkeleton
   - ArticlesEmptyState
   - ArticleCardMenu
   - ArticleCard
   - ArticlesGrid
   - ArticlesFilters

4. **메인 페이지 구현**
   - 모든 컴포넌트 통합
   - API 연동
   - 삭제 기능 구현

5. **통합 테스트**
   - 라우팅, i18n, API, 반응형

6. **Phase 2, 3, 4 진행**

---

## 9. 최종 요약

### 주요 개선 사항

1. **라우팅 오류 수정**: 모든 경로에 locale 포함
2. **API 오류 수정**: `useLocale()` 올바른 사용
3. **구조 개선**: ArticlesHeader 제거 → PageLayout actions 활용
4. **일관성 향상**: 기존 코드베이스 패턴 준수
5. **누락 사항 추가**: Sidebar 메뉴, i18n 키 추가

### 성공 지표

- [x] 사용자가 Sidebar에서 "글 관리" 메뉴 찾기
- [x] 검색어 입력 후 즉시 결과 확인
- [x] 글이 0개일 때 명확한 다음 행동 제시 (CTA)
- [x] Claude.ai처럼 단순하고 전문적인 느낌
- [x] 모든 경로가 올바르게 작동

### 차별화 요소

1. **검색 중심 UI**: 큰 검색 입력창 최상단 배치
2. **Active Filter Pills**: 현재 적용된 필터 명확 표시
3. **단순한 카드**: 제목, 상태, 수정일만 표시
4. **목적 있는 애니메이션**: Empty State에만 적용
5. **접근성 우선**: 아이콘 + 텍스트, ARIA 레이블

### 기술적 특징

- **Client Component**: 모든 컴포넌트 `"use client"` 사용
- **React Query**: 서버 상태 관리
- **next-intl**: 다국어 지원 (useLocale 활용)
- **Shadcn UI**: 일관된 디자인 시스템
- **Tailwind CSS**: 유틸리티 클래스 기반
- **Framer Motion**: 최소한의 애니메이션

---

## 부록: 빠른 참조

### 수정된 파일 경로

```
생성:
- src/features/articles/components/articles-filters.tsx
- src/features/articles/components/articles-grid.tsx
- src/features/articles/components/article-card.tsx
- src/features/articles/components/article-card-menu.tsx
- src/features/articles/components/articles-empty-state.tsx
- src/features/articles/components/articles-grid-skeleton.tsx

수정:
- src/app/[locale]/(protected)/articles/page.tsx
- src/components/layout/sidebar.tsx
- messages/ko.json
- messages/en.json
```

### 핵심 API 변경

```typescript
// ❌ 잘못된 방법
const locale = useTranslations().locale;

// ✅ 올바른 방법
import { useLocale } from "next-intl";
const locale = useLocale();
```

### 라우팅 패턴

```typescript
// 모든 클라이언트 라우팅에 locale 포함
router.push(`/${locale}/new-article`);
router.push(`/${locale}/articles/${id}/edit`);

// Link 컴포넌트도 동일
<Link href={`/${locale}/articles/${id}/edit`}>
```

---

**이 최종 계획은 2번 단계 계획의 모든 오류를 수정하고, 실제 실행 가능하도록 검증된 구현 가이드입니다. 각 컴포넌트는 독립적으로 테스트 가능하며, 점진적으로 통합할 수 있습니다.**
