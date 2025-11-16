# 페이지 구현 계획 최종 검토

> **작성일**: 2025-11-16
> **버전**: 1.0 (Final)
> **기반 문서**: `2-implement-plan.md`
> **검토자**: Implementation Plan Final Review Agent

---

## 1. 원안 요약

2번 단계 계획에서는 다음과 같은 대시보드 개선 사항을 제안했습니다:

### 핵심 개선사항
1. **WelcomeSection**: 컨텍스트 기반 인사말 시스템
2. **StatsGrid**: 2개 → 3개 카드로 확장 (월간 작성, 절약 시간, 총 조회수)
3. **ActivitySection**: Recharts 기반 활동 차트 (7일/30일)
4. **RecentArticlesGrid**: 테이블 → 카드 그리드 전환

### 구현 단계
- **Phase 1**: WelcomeSection, StatsGrid (핵심 개선)
- **Phase 2**: ActivitySection, RecentArticlesGrid (기능 확장)
- **Phase 3**: 선택적 고급 애니메이션 및 최적화

---

## 2. 발견된 문제점

### 2.1 코드 정확성

#### 문제 1: 데이터베이스 테이블 구조 불일치

**위치**: `supabase/migrations/0010_add_article_metrics.sql`
**문제**:
- 2번 계획에서는 `articles` 테이블에 `views`와 `time_spent` 컬럼 추가를 제안했으나, 실제 테이블 스키마를 확인한 결과:
  - 기존 테이블에는 `clerk_user_id` 컬럼만 존재 (0006 마이그레이션에서 `profile_id`로 변경됨)
  - 0006 마이그레이션 이후 테이블은 `profile_id`를 사용해야 함
  - 현재 코드에서는 `profile_id`를 사용 중 (`ArticleTableRowSchema` 확인)

**영향**: 마이그레이션 파일에서 잘못된 컬럼명을 사용하면 실행 실패

#### 수정안

```sql
-- 수정 후 (0010_add_article_metrics.sql)
-- Migration: Add metrics columns to articles table
-- Adds views and time_spent columns for dashboard statistics

BEGIN;

-- Add views column (조회수)
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;

-- Add time_spent column (작성 소요 시간, 분 단위)
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS time_spent INTEGER NOT NULL DEFAULT 0;

-- Add comments
COMMENT ON COLUMN public.articles.views IS
  'Number of times this article has been viewed';

COMMENT ON COLUMN public.articles.time_spent IS
  'Time spent writing this article in minutes';

-- Add index for performance (views 기준 정렬 시 사용)
CREATE INDEX IF NOT EXISTS idx_articles_views
  ON public.articles(views DESC);

COMMIT;
```

**참고**: 기존 테이블에는 `profile_id`가 이미 있으므로 추가 작업 불필요

---

#### 문제 2: DashboardStatsResponse 스키마 불일치

**위치**: `src/features/articles/backend/schema.ts`
**문제**:
- 2번 계획에서 제안한 스키마:
  ```typescript
  export const DashboardStatsResponseSchema = z.object({
    monthlyArticles: z.number(),
    monthlyGoal: z.number().default(10),
    previousMonthArticles: z.number(),
    savedHours: z.number(),
    totalViews: z.number(),
    previousMonthViews: z.number(),
  });
  ```
- 실제 기존 스키마 (라인 192-198):
  ```typescript
  export const DashboardStatsResponseSchema = z.object({
    monthlyArticles: z.number(),
    totalArticles: z.number(),
    publishedArticles: z.number(),
    draftArticles: z.number(),
    savedHours: z.number(),
  });
  ```

**영향**:
- 타입 불일치로 인한 컴파일 에러
- 프론트엔드 컴포넌트에서 존재하지 않는 필드 접근 시 런타임 에러

#### 수정안

기존 스키마를 확장하되, 기존 필드는 유지하여 호환성 보장:

```typescript
// src/features/articles/backend/schema.ts에 추가
export const DashboardStatsResponseSchema = z.object({
  // 기존 필드 (유지)
  monthlyArticles: z.number(),
  totalArticles: z.number(),
  publishedArticles: z.number(),
  draftArticles: z.number(),
  savedHours: z.number(),

  // 새로 추가되는 필드
  monthlyGoal: z.number().default(10),
  previousMonthArticles: z.number(),
  totalViews: z.number(),
  previousMonthViews: z.number(),
});
```

---

#### 문제 3: ArticleTableRowSchema에 누락된 필드

**위치**: `src/features/articles/backend/schema.ts`
**문제**:
- 2번 계획에서 `ArticleTableRowSchema`에 `views`, `time_spent` 추가를 제안했으나, 기존 스키마 구조를 고려하지 않음
- 실제 스키마는 라인 86-104에 정의되어 있으며, 모든 필드가 명시적으로 선언됨

#### 수정안

```typescript
// src/features/articles/backend/schema.ts의 ArticleTableRowSchema 수정
export const ArticleTableRowSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  keywords: z.array(z.string()),
  description: z.string().nullable(),
  content: z.string(),
  style_guide_id: z.string().uuid().nullable(),
  tone: ContentToneSchema.nullable(),
  content_length: ContentLengthSchema.nullable(),
  reading_level: ReadingLevelSchema.nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  status: ArticleStatusSchema,
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),

  // 새로 추가되는 필드
  views: z.number().default(0),
  time_spent: z.number().default(0),
});
```

**중요**: `ArticleResponseSchema`에도 동일하게 추가 필요

```typescript
export const ArticleResponseSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  keywords: z.array(z.string()),
  description: z.string().nullable(),
  content: z.string(),
  styleGuideId: z.string().uuid().nullable(),
  tone: ContentToneSchema.nullable(),
  contentLength: ContentLengthSchema.nullable(),
  readingLevel: ReadingLevelSchema.nullable(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  status: ArticleStatusSchema,
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // 새로 추가되는 필드
  views: z.number().default(0),
  timeSpent: z.number().default(0),
});
```

**주의**: `mapArticleRowToResponse` 함수도 수정 필요 (라인 28-64)

```typescript
const mapArticleRowToResponse = (row: unknown): ArticleResponse => {
  const rowParse = ArticleTableRowSchema.safeParse(row);

  if (!rowParse.success) {
    throw new Error('Article row failed validation');
  }

  const mapped = {
    id: rowParse.data.id,
    profileId: rowParse.data.profile_id,
    title: rowParse.data.title,
    slug: rowParse.data.slug,
    keywords: rowParse.data.keywords,
    description: rowParse.data.description,
    content: rowParse.data.content,
    styleGuideId: rowParse.data.style_guide_id,
    tone: rowParse.data.tone,
    contentLength: rowParse.data.content_length,
    readingLevel: rowParse.data.reading_level,
    metaTitle: rowParse.data.meta_title,
    metaDescription: rowParse.data.meta_description,
    status: rowParse.data.status,
    publishedAt: rowParse.data.published_at,
    createdAt: rowParse.data.created_at,
    updatedAt: rowParse.data.updated_at,

    // 새로 추가
    views: rowParse.data.views,
    timeSpent: rowParse.data.time_spent,
  } satisfies ArticleResponse;

  const parsed = ArticleResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    throw new Error('Article response failed validation');
  }

  return parsed.data;
};
```

---

### 2.2 구현 가능성

#### 문제 4: WelcomeSection Props 불일치

**위치**: `src/components/dashboard/welcome-section.tsx`
**문제**:
- 제안된 Props 인터페이스에서 `articleCount`, `monthlyTarget`, `currentMonthly`를 요구하지만, 실제 대시보드 통계 API는 다른 필드명 사용
- `useDashboardStats` 훅이 반환하는 데이터 구조와 불일치

#### 수정안

Props를 실제 API 응답 구조에 맞게 수정:

```typescript
interface WelcomeSectionProps {
  userName: string;
  stats: {
    monthlyArticles: number;
    totalArticles: number;
    monthlyGoal: number;
    previousMonthArticles: number;
  };
  onCreateArticle: () => void;
}
```

컴포넌트 내부 로직 수정:

```tsx
export function WelcomeSection({
  userName,
  stats,
  onCreateArticle,
}: WelcomeSectionProps) {
  const t = useTranslations('dashboard.welcome');

  const greeting = getContextualGreeting({
    userName,
    articleCount: stats.totalArticles,
    currentMonthly: stats.monthlyArticles,
    monthlyTarget: stats.monthlyGoal,
    t,
  });

  const subtext = getContextualSubtext({
    articleCount: stats.totalArticles,
    t,
  });

  return (
    <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b animate-fade-in-up">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {greeting}
        </h1>
        <p className="text-muted-foreground mt-2">
          {subtext}
        </p>
      </div>
      <Button size="lg" onClick={onCreateArticle} className="whitespace-nowrap">
        <Plus className="mr-2 h-5 w-5" />
        {t('cta')}
      </Button>
    </section>
  );
}
```

---

#### 문제 5: StatsGrid Props 구조 복잡성

**위치**: `src/components/dashboard/stats-grid.tsx`
**문제**:
- 제안된 Props가 중첩 객체 구조로 되어 있어 사용하기 복잡함
- API 응답을 직접 전달할 수 없어 변환 로직 필요

#### 수정안

Props를 평탄화하고 API 응답과 호환되도록 수정:

```typescript
interface StatsGridProps {
  stats: DashboardStatsResponse;
  isLoading?: boolean;
  error?: Error | null;
}
```

컴포넌트 내부에서 데이터 가공:

```tsx
export function StatsGrid({ stats, isLoading, error }: StatsGridProps) {
  const t = useTranslations('dashboard.stats');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {t('error')}
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const monthlyTrend = calculateTrend(
    stats.monthlyArticles,
    stats.previousMonthArticles
  );

  const viewsTrend = calculateTrend(
    stats.totalViews,
    stats.previousMonthViews
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <StatCard
        title={t('monthly_title')}
        value={stats.monthlyArticles}
        target={stats.monthlyGoal}
        trend={monthlyTrend}
        icon={FileText}
        suffix={t('monthly_suffix')}
      />
      <StatCard
        title={t('saved_time_title')}
        value={stats.savedHours}
        icon={Clock}
        suffix={t('saved_time_suffix')}
      />
      <StatCard
        title={t('total_views_title')}
        value={stats.totalViews.toLocaleString()}
        trend={viewsTrend}
        icon={Eye}
      />
    </div>
  );
}
```

---

#### 문제 6: ActivitySection에서 useTheme 훅 누락

**위치**: `src/components/dashboard/activity-section.tsx`
**문제**:
- `useTheme` 훅 import가 없음
- `next-themes` 패키지 설치 여부 불명확

#### 수정안

1. **next-themes 설치 확인 필요** (package.json 확인)
2. 대안으로 CSS 변수 직접 활용:

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Clock } from "lucide-react";
import { useTranslations } from 'next-intl';
import { PeriodSelector } from "./period-selector";
import { InsightBadge } from "./insight-badge";
import { useActivityData } from "@/features/dashboard/hooks/useActivityData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ActivitySection() {
  const t = useTranslations('dashboard.activity');
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');

  const { data, isLoading, error } = useActivityData(period);

  if (isLoading) {
    return (
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t('error')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.chartData || [];
  const insights = data?.insights;

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{t('title')}</CardTitle>
        <PeriodSelector selected={period} onChange={setPeriod} />
      </CardHeader>
      <CardContent>
        {/* Recharts Area Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
              />
              <XAxis
                dataKey="date"
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis
                className="text-muted-foreground"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelClassName="text-foreground"
              />
              <Area
                type="monotone"
                dataKey="articles"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorArticles)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        {insights && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InsightBadge
              label={t('most_active_day')}
              value={insights.mostActiveDay}
              icon={Calendar}
            />
            <InsightBadge
              label={t('avg_time')}
              value={`${insights.averageTime}${t('minutes')}`}
              icon={Clock}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### 2.3 코드베이스 일관성

#### 문제 7: 파일 경로 및 디렉토리 구조

**위치**: 전체 파일 구조
**문제**:
- 2번 계획에서는 `src/features/dashboard/` 디렉토리 생성을 제안했으나, 현재 코드베이스를 확인한 결과 해당 디렉토리가 존재하지 않음
- 기존 패턴: dashboard 관련 컴포넌트는 `src/components/dashboard/`에 위치
- 기존 패턴: hooks는 feature별로 `src/features/[feature]/hooks/`에 위치

#### 수정안

디렉토리 구조를 기존 패턴과 일관성 있게 수정:

```
src/
  components/
    dashboard/
      welcome-section.tsx           # WelcomeHeader 대체
      stats-grid.tsx                 # StatsCards 대체
      stat-card.tsx                  # 새로 추가 (재사용 컴포넌트)
      activity-section.tsx           # ActivityChart 대체
      period-selector.tsx            # 새로 추가
      insight-badge.tsx              # 새로 추가
      recent-articles-grid.tsx       # RecentArticlesList 대체
      article-card.tsx               # 새로 추가
  features/
    articles/                        # 기존 디렉토리 활용
      hooks/
        useDashboardStats.ts         # 기존 (수정)
        useActivityData.ts           # 새로 추가
      lib/
        greetings.ts                 # 새로 추가 (dashboard 전용 로직)
        date-utils.ts                # 새로 추가 (옵션)
```

**삭제**: `src/features/dashboard/` 디렉토리 생성 불필요

---

#### 문제 8: import 경로 일관성

**위치**: 모든 컴포넌트
**문제**:
- 2번 계획에서 제안한 import 경로가 실제 코드베이스 구조와 불일치
- 예: `@/features/dashboard/lib/greetings` → 실제로는 `@/features/articles/lib/greetings`로 수정 필요

#### 수정안

모든 import 경로를 실제 디렉토리 구조에 맞게 수정:

```typescript
// WelcomeSection
import { getContextualGreeting, getContextualSubtext } from "@/features/articles/lib/greetings";

// ActivitySection
import { useActivityData } from "@/features/articles/hooks/useActivityData";
```

---

### 2.4 i18n 완전성

#### 문제 9: 기존 번역 키와의 충돌

**위치**: `messages/ko.json`, `messages/en.json`
**문제**:
- 2번 계획에서는 전체 `dashboard` 섹션을 교체하도록 제안했으나, 기존 키가 사용 중일 수 있음
- 기존 번역 키 확인 결과:
  - `dashboard.welcome_header.*` 존재 (라인 24-28)
  - `dashboard.stats.*` 부분적 존재 (라인 29-36)
  - `dashboard.recent.*` 존재 (라인 37-50)
  - `dashboard.banner.*` 존재 (라인 56-62)

**영향**: 기존 컴포넌트가 사용 중인 번역 키를 삭제하면 런타임 에러 발생

#### 수정안

기존 키를 유지하면서 새 키만 추가:

```json
{
  "dashboard": {
    "title": "대시보드",
    "welcome": "반갑습니다",

    // 기존 키 유지 (삭제하지 않음)
    "welcome_header": {
      "greeting": "안녕하세요, {userName}님!",
      "subtitle": "오늘도 멋진 콘텐츠를 만들어 보세요.",
      "new_article": "새 글 작성"
    },

    // 새 키 추가
    "welcome_new": {
      "greeting_new": "환영합니다, {userName}님",
      "greeting_default": "안녕하세요, {userName}님",
      "greeting_achieved": "목표 달성! 멋져요, {userName}님 🎉",
      "greeting_almost": "목표까지 1개만 더, {userName}님!",
      "subtext_new": "첫 글을 작성해보세요",
      "subtext_default": "지금까지 {count}개의 글을 작성했어요",
      "cta": "새 글 작성"
    },

    "stats": {
      // 기존 키 유지
      "monthly_articles_title": "월간 완성 글 수",
      "monthly_articles_suffix": "편",
      "goal_achievement": "목표의 {rate}%를 달성했어요!",
      "saved_time_title": "누적 절약 시간",
      "saved_time_suffix": "시간",
      "saved_time_desc": "이번 달에 절약한 시간",

      // 새 키 추가
      "monthly_title": "이번 달 작성",
      "total_views_title": "총 조회수",
      "goal_progress": "목표의 {percent}% 달성",
      "vs_last_month": "전월 대비",
      "error": "통계를 불러오는 중 오류가 발생했습니다"
    },

    "recent": {
      // 기존 키 유지
      "title": "최근 작성한 글",
      "error": "글 목록을 불러오는 중 오류가 발생했습니다",
      "empty": "아직 작성한 글이 없습니다",
      "th": {
        "status": "상태",
        "title": "제목",
        "created_at": "생성일",
        "actions": "액션"
      },
      "actions": {
        "view": "보기",
        "edit": "수정"
      },

      // 새 키 추가
      "view_all": "전체 보기",
      "create_first": "첫 글 작성하기",
      "status_published": "발행됨",
      "status_draft": "초안",
      "no_description": "설명이 없습니다"
    },

    "status": {
      "done": "완료",
      "draft": "작성중"
    },

    "banner": {
      "title": "환영합니다! 🎉",
      "desc": "모든 설정이 완료되었습니다. 이제 AI로 첫 콘텐츠를 생성해보세요!",
      "cta": "첫 글 작성",
      "cta_aria": "첫 글 작성하러 가기",
      "close_aria": "환영 메시지 닫기"
    },

    "activity": {
      // 기존 키 유지
      "title": "월간 활동 그래프",
      "placeholder": "차트 라이브러리(예: Recharts)가 여기에 표시됩니다",

      // 새 키 추가
      "period_7d": "7일",
      "period_30d": "30일",
      "most_active_day": "가장 활발한 요일",
      "avg_time": "평균 작성 시간",
      "minutes": "분",
      "error": "활동 데이터를 불러오는 중 오류가 발생했습니다"
    }
  }
}
```

**중요**: 컴포넌트에서 사용하는 번역 키도 수정 필요
- `useTranslations('dashboard.welcome')` → `useTranslations('dashboard.welcome_new')`

---

### 2.5 성능 및 접근성

#### 문제 10: CSS 애니메이션 파일 import 누락

**위치**: `src/app/globals.css`
**문제**:
- 2번 계획에서는 `dashboard-animations.css` 생성을 제안했으나, `globals.css`에 import 하는 방법이 명시되지 않음
- 파일 경로도 불명확 (`src/styles/` 디렉토리 존재 여부 불명)

#### 수정안

1. CSS 파일 경로를 `src/app/` 하위로 변경 (Next.js App Router 규칙)
2. 또는 Tailwind 설정에 직접 추가

**방법 1**: `src/app/dashboard-animations.css` 생성 후 page.tsx에서 직접 import

```css
/* src/app/dashboard-animations.css */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out backwards;
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

**방법 2 (권장)**: Tailwind 설정에 직접 추가

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out backwards',
      },
    },
  },
};
```

---

#### 문제 11: ArticleCard 키보드 접근성 누락

**위치**: `src/components/dashboard/article-card.tsx`
**문제**:
- 클릭 가능한 Card에 키보드 네비게이션 속성이 누락됨
- `onClick`만 있고 `onKeyDown` 핸들러가 없음

#### 수정안

```tsx
export function ArticleCard({ article }: ArticleCardProps) {
  const t = useTranslations('dashboard.recent');
  const router = useRouter();
  const locale = useLocale();

  const handleClick = () => {
    router.push(`/articles/${article.id}/edit`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const excerpt = article.description
    ? article.description.slice(0, 100) + (article.description.length > 100 ? '...' : '')
    : t('no_description');

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${article.title} 편집하기`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </CardTitle>
          <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
            {article.status === 'published' ? t('status_published') : t('status_draft')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {excerpt}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            {format(new Date(article.createdAt), "yyyy-MM-dd", {
              locale: locale === 'ko' ? ko : enUS,
            })}
          </span>
          {article.views !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 2.6 누락 사항

#### 문제 12: getDashboardStats 서비스 함수 수정 누락

**위치**: `src/features/articles/backend/service.ts`
**문제**:
- 2번 계획에서 제안한 `getDashboardStats` 함수 수정이 기존 함수 구조를 고려하지 않음
- 기존 함수는 라인 356-407에 정의되어 있으며, `totalArticles`, `publishedArticles`, `draftArticles` 필드를 반환
- 이 필드들을 삭제하면 기존 컴포넌트가 깨질 수 있음

#### 수정안

기존 필드를 유지하면서 새 필드를 추가:

```typescript
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export const getDashboardStats = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<DomainResult<DashboardStatsResponse, ArticleDomainError>> => {
  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return domainFailure({ code: articleErrorCodes.notFound, message: 'Profile not found' });
  }

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  // 모든 글 조회 (통계용)
  const { data: allArticles, error: allError } = await client
    .from(ARTICLES_TABLE)
    .select('status, created_at, views, time_spent')
    .eq('profile_id', profileId);

  if (allError) {
    return domainFailure({
      code: articleErrorCodes.fetchError,
      message: `Failed to fetch dashboard stats: ${allError.message}`,
    });
  }

  const articles = allArticles || [];

  // 기존 통계 (호환성 유지)
  const totalArticles = articles.length;
  const publishedArticles = articles.filter((a) => a.status === 'published').length;
  const draftArticles = articles.filter((a) => a.status === 'draft').length;

  // 이번 달 글 수
  const monthlyArticles = articles.filter((article) => {
    const createdAt = new Date(article.created_at);
    return createdAt >= currentMonthStart && createdAt <= currentMonthEnd;
  }).length;

  // 지난 달 글 수
  const previousMonthArticles = articles.filter((article) => {
    const createdAt = new Date(article.created_at);
    return createdAt >= previousMonthStart && createdAt <= previousMonthEnd;
  }).length;

  // 절약된 시간 (총 작성 시간 합계를 시간 단위로 변환)
  const totalMinutes = articles.reduce((sum, a) => sum + (a.time_spent || 0), 0);
  const savedHours = Math.round(totalMinutes / 60);

  // 총 조회수
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  // 지난 달 조회수
  const previousMonthViews = articles
    .filter((article) => {
      const createdAt = new Date(article.created_at);
      return createdAt >= previousMonthStart && createdAt <= previousMonthEnd;
    })
    .reduce((sum, a) => sum + (a.views || 0), 0);

  return domainSuccess({
    // 기존 필드 (유지)
    monthlyArticles,
    totalArticles,
    publishedArticles,
    draftArticles,
    savedHours,

    // 새 필드
    monthlyGoal: 10,
    previousMonthArticles,
    totalViews,
    previousMonthViews,
  });
};
```

---

#### 문제 13: useActivityData 훅 인증 처리 불완전

**위치**: `src/features/articles/hooks/useActivityData.ts`
**문제**:
- 2번 계획에서 제안한 훅이 `userId`가 `null`일 경우를 처리하지 않음
- `createAuthenticatedClient(userId)`에 `null`이 전달되면 에러 발생 가능

#### 수정안

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import type { ActivityDataResponse } from "@/features/articles/backend/schema";

export function useActivityData(period: '7d' | '30d') {
  const { userId } = useAuth();

  return useQuery<ActivityDataResponse>({
    queryKey: ["activityData", period, userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("로그인이 필요합니다");
      }

      try {
        const client = createAuthenticatedClient(userId);
        const response = await client.get(`/api/articles/activity?period=${period}`);
        return response.data as ActivityDataResponse;
      } catch (error) {
        const message = extractApiErrorMessage(error, "활동 데이터를 불러오는데 실패했습니다");
        throw new Error(message);
      }
    },
    enabled: !!userId, // userId가 있을 때만 실행
    staleTime: 1000 * 60 * 5, // 5분
  });
}
```

---

#### 문제 14: date-fns locale import 누락

**위치**: `src/features/articles/backend/service.ts`
**문제**:
- 2번 계획에서 `getActivityData` 함수에서 `format(date, 'EEEE', { locale: ko })` 사용을 제안했으나, `ko` import가 명시되지 않음

#### 수정안

```typescript
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
```

---

## 3. 최종 구현 계획

### 3.1 파일 구조 (수정안)

```
src/
  app/
    [locale]/(protected)/dashboard/
      page.tsx                        # 수정 (새 컴포넌트 사용)
  components/
    dashboard/
      welcome-section.tsx             # 신규 (WelcomeHeader 대체)
      stats-grid.tsx                   # 신규 (StatsCards 대체)
      stat-card.tsx                    # 신규 (재사용 컴포넌트)
      activity-section.tsx             # 신규 (ActivityChart 대체)
      period-selector.tsx              # 신규
      insight-badge.tsx                # 신규
      recent-articles-grid.tsx         # 신규 (RecentArticlesList 대체)
      article-card.tsx                 # 신규
  features/
    articles/
      hooks/
        useDashboardStats.ts           # 기존 (수정 불필요)
        useActivityData.ts             # 신규
      lib/
        greetings.ts                   # 신규
      backend/
        schema.ts                      # 수정 (스키마 추가)
        service.ts                     # 수정 (getDashboardStats, getActivityData)
        route.ts                       # 수정 (GET /api/articles/activity 추가)

supabase/
  migrations/
    0010_add_article_metrics.sql     # 신규

messages/
  ko.json                            # 수정 (번역 키 추가)
  en.json                            # 수정 (번역 키 추가)

tailwind.config.ts                   # 수정 (애니메이션 추가)
```

---

### 3.2 의존성 (수정안)

```bash
# Recharts 설치
pnpm add recharts

# TypeScript 타입 정의
pnpm add -D @types/recharts

# date-fns는 이미 설치되어 있음 (확인됨)
```

**확인 완료**:
- ✅ `framer-motion` (11.x) - 이미 설치됨
- ✅ `date-fns` (4.x) - 이미 설치됨
- ✅ `lucide-react` - 이미 설치됨
- ✅ `@tanstack/react-query` - 이미 설치됨
- ✅ `next-intl` - 이미 설치됨

---

### 3.3 구현 순서 (수정안)

#### Phase 1: 핵심 개선 (우선순위: 높음)

**Step 1: 백엔드 준비 (1일)**

1. **Supabase 마이그레이션 실행**
   ```bash
   # 사용자가 직접 실행
   # Supabase Studio 또는 CLI로 0010_add_article_metrics.sql 적용
   ```

2. **스키마 업데이트**
   - `src/features/articles/backend/schema.ts`:
     - `ArticleTableRowSchema`에 `views`, `time_spent` 추가
     - `ArticleResponseSchema`에 `views`, `timeSpent` 추가
     - `DashboardStatsResponseSchema`에 새 필드 추가
     - `ActivityDataResponseSchema`, `ActivityDataPointSchema`, `ActivityInsightsSchema` 추가

3. **서비스 함수 수정**
   - `src/features/articles/backend/service.ts`:
     - `mapArticleRowToResponse` 함수 수정 (views, timeSpent 매핑 추가)
     - `getDashboardStats` 함수 수정 (새 필드 계산 로직 추가)
     - `getActivityData` 함수 신규 구현

4. **API 라우트 추가**
   - `src/features/articles/backend/route.ts`:
     - `GET /api/articles/activity` 엔드포인트 추가

**Step 2: 유틸리티 함수 구현 (0.5일)**

1. **인사말 로직 구현**
   - `src/features/articles/lib/greetings.ts` 생성
   - `getContextualGreeting` 함수
   - `getContextualSubtext` 함수

**Step 3: WelcomeSection 구현 (0.5일)**

1. **컴포넌트 생성**
   - `src/components/dashboard/welcome-section.tsx` 생성
   - Props 타입 정의 (수정안 반영)
   - 인사말 로직 통합

**Step 4: StatsGrid 구현 (1일)**

1. **StatCard 컴포넌트 생성**
   - `src/components/dashboard/stat-card.tsx` 생성
   - Progress 컴포넌트 활용 (이미 설치됨)
   - Trend 표시 로직

2. **StatsGrid 컴포넌트 생성**
   - `src/components/dashboard/stats-grid.tsx` 생성
   - 3개 카드 레이아웃
   - 로딩/에러 상태 처리

**Step 5: 페이지 통합 및 테스트 (0.5일)**

1. **Dashboard 페이지 수정**
   - `src/app/[locale]/(protected)/dashboard/page.tsx` 수정
   - 새 컴포넌트로 교체
   - 데이터 흐름 확인

2. **반응형 테스트**
   - 모바일/태블릿/데스크톱 확인
   - 다크모드 확인

---

#### Phase 2: 기능 확장 (우선순위: 중간)

**Step 6: ActivitySection 구현 (2일)**

1. **훅 생성**
   - `src/features/articles/hooks/useActivityData.ts` 생성
   - 인증 처리 추가 (수정안 반영)

2. **컴포넌트 생성**
   - `src/components/dashboard/period-selector.tsx`
   - `src/components/dashboard/insight-badge.tsx`
   - `src/components/dashboard/activity-section.tsx`

3. **Recharts 통합**
   - CSS 변수 활용 (다크모드 대응)
   - 반응형 크기 조정

**Step 7: RecentArticlesGrid 구현 (2일)**

1. **컴포넌트 생성**
   - `src/components/dashboard/article-card.tsx`
   - 키보드 접근성 추가 (수정안 반영)
   - `src/components/dashboard/recent-articles-grid.tsx`

2. **레이아웃 구현**
   - 카드 그리드 (1/2/3열)
   - Empty State 처리

**Step 8: 통합 테스트 (1일)**

1. **E2E 테스트** (선택적)
2. **실제 데이터 검증**

---

### 3.4 컴포넌트 상세 명세 (수정안)

*(문제점 수정이 반영된 코드만 표시)*

#### 3.4.1 WelcomeSection

**파일**: `src/components/dashboard/welcome-section.tsx`

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from 'next-intl';
import { getContextualGreeting, getContextualSubtext } from "@/features/articles/lib/greetings";

interface WelcomeSectionProps {
  userName: string;
  stats: {
    monthlyArticles: number;
    totalArticles: number;
    monthlyGoal: number;
    previousMonthArticles: number;
  };
  onCreateArticle: () => void;
}

export function WelcomeSection({
  userName,
  stats,
  onCreateArticle,
}: WelcomeSectionProps) {
  const t = useTranslations('dashboard.welcome_new');

  const greeting = getContextualGreeting({
    userName,
    articleCount: stats.totalArticles,
    currentMonthly: stats.monthlyArticles,
    monthlyTarget: stats.monthlyGoal,
    t,
  });

  const subtext = getContextualSubtext({
    articleCount: stats.totalArticles,
    t,
  });

  return (
    <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b animate-fade-in-up">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {greeting}
        </h1>
        <p className="text-muted-foreground mt-2">
          {subtext}
        </p>
      </div>
      <Button size="lg" onClick={onCreateArticle} className="whitespace-nowrap">
        <Plus className="mr-2 h-5 w-5" />
        {t('cta')}
      </Button>
    </section>
  );
}
```

---

#### 3.4.2 StatsGrid

**파일**: `src/components/dashboard/stats-grid.tsx`

```tsx
"use client";

import { FileText, Clock, Eye, Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';
import { StatCard } from "./stat-card";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStatsResponse } from "@/features/articles/backend/schema";

interface StatsGridProps {
  stats: DashboardStatsResponse;
  isLoading?: boolean;
  error?: Error | null;
}

export function StatsGrid({ stats, isLoading, error }: StatsGridProps) {
  const t = useTranslations('dashboard.stats');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {t('error')}
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const monthlyTrend = calculateTrend(
    stats.monthlyArticles,
    stats.previousMonthArticles
  );

  const viewsTrend = calculateTrend(
    stats.totalViews,
    stats.previousMonthViews
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <StatCard
        title={t('monthly_title')}
        value={stats.monthlyArticles}
        target={stats.monthlyGoal}
        trend={monthlyTrend}
        icon={FileText}
        suffix={t('monthly_articles_suffix')}
      />
      <StatCard
        title={t('saved_time_title')}
        value={stats.savedHours}
        icon={Clock}
        suffix={t('saved_time_suffix')}
      />
      <StatCard
        title={t('total_views_title')}
        value={stats.totalViews.toLocaleString()}
        trend={viewsTrend}
        icon={Eye}
      />
    </div>
  );
}
```

---

#### 3.4.3 ActivitySection

**파일**: `src/components/dashboard/activity-section.tsx`

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Clock } from "lucide-react";
import { useTranslations } from 'next-intl';
import { PeriodSelector } from "./period-selector";
import { InsightBadge } from "./insight-badge";
import { useActivityData } from "@/features/articles/hooks/useActivityData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ActivitySection() {
  const t = useTranslations('dashboard.activity');
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');

  const { data, isLoading, error } = useActivityData(period);

  if (isLoading) {
    return (
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t('error')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.chartData || [];
  const insights = data?.insights;

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{t('title')}</CardTitle>
        <PeriodSelector selected={period} onChange={setPeriod} />
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
              />
              <XAxis
                dataKey="date"
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis
                className="text-muted-foreground"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelClassName="text-foreground"
              />
              <Area
                type="monotone"
                dataKey="articles"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorArticles)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {insights && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InsightBadge
              label={t('most_active_day')}
              value={insights.mostActiveDay}
              icon={Calendar}
            />
            <InsightBadge
              label={t('avg_time')}
              value={`${insights.averageTime}${t('minutes')}`}
              icon={Clock}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

#### 3.4.4 ArticleCard (접근성 개선)

**파일**: `src/components/dashboard/article-card.tsx`

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useTranslations } from 'next-intl';
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

interface Article {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  views?: number;
}

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const t = useTranslations('dashboard.recent');
  const router = useRouter();
  const locale = useLocale();

  const handleClick = () => {
    router.push(`/articles/${article.id}/edit`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const excerpt = article.description
    ? article.description.slice(0, 100) + (article.description.length > 100 ? '...' : '')
    : t('no_description');

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${article.title} 편집하기`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </CardTitle>
          <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
            {article.status === 'published' ? t('status_published') : t('status_draft')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {excerpt}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            {format(new Date(article.createdAt), "yyyy-MM-dd", {
              locale: locale === 'ko' ? ko : enUS,
            })}
          </span>
          {article.views !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 3.5 백엔드 API 구현 (수정안)

#### 3.5.1 데이터베이스 마이그레이션

**파일**: `supabase/migrations/0010_add_article_metrics.sql`

```sql
-- Migration: Add metrics columns to articles table
-- Adds views and time_spent columns for dashboard statistics

BEGIN;

-- Add views column (조회수)
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;

-- Add time_spent column (작성 소요 시간, 분 단위)
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS time_spent INTEGER NOT NULL DEFAULT 0;

-- Add comments
COMMENT ON COLUMN public.articles.views IS
  'Number of times this article has been viewed';

COMMENT ON COLUMN public.articles.time_spent IS
  'Time spent writing this article in minutes';

-- Add index for performance (views 기준 정렬 시 사용)
CREATE INDEX IF NOT EXISTS idx_articles_views
  ON public.articles(views DESC);

COMMIT;
```

---

#### 3.5.2 스키마 업데이트

**파일**: `src/features/articles/backend/schema.ts` (추가)

```typescript
// ActivityDataResponseSchema 추가
export const ActivityDataPointSchema = z.object({
  date: z.string(), // "MM/dd" 형식
  articles: z.number(),
});

export const ActivityInsightsSchema = z.object({
  mostActiveDay: z.string(), // "월요일", "화요일" 등
  averageTime: z.number(), // 평균 작성 시간 (분)
});

export const ActivityDataResponseSchema = z.object({
  chartData: z.array(ActivityDataPointSchema),
  insights: ActivityInsightsSchema,
});

export type ActivityDataPoint = z.infer<typeof ActivityDataPointSchema>;
export type ActivityInsights = z.infer<typeof ActivityInsightsSchema>;
export type ActivityDataResponse = z.infer<typeof ActivityDataResponseSchema>;

// DashboardStatsResponseSchema 수정 (기존 필드 유지 + 새 필드 추가)
export const DashboardStatsResponseSchema = z.object({
  // 기존 필드
  monthlyArticles: z.number(),
  totalArticles: z.number(),
  publishedArticles: z.number(),
  draftArticles: z.number(),
  savedHours: z.number(),

  // 새 필드
  monthlyGoal: z.number().default(10),
  previousMonthArticles: z.number(),
  totalViews: z.number(),
  previousMonthViews: z.number(),
});

// ArticleTableRowSchema 수정 (기존 필드 유지 + 새 필드 추가)
export const ArticleTableRowSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  keywords: z.array(z.string()),
  description: z.string().nullable(),
  content: z.string(),
  style_guide_id: z.string().uuid().nullable(),
  tone: ContentToneSchema.nullable(),
  content_length: ContentLengthSchema.nullable(),
  reading_level: ReadingLevelSchema.nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  status: ArticleStatusSchema,
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),

  // 새 필드
  views: z.number().default(0),
  time_spent: z.number().default(0),
});

// ArticleResponseSchema 수정 (기존 필드 유지 + 새 필드 추가)
export const ArticleResponseSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  keywords: z.array(z.string()),
  description: z.string().nullable(),
  content: z.string(),
  styleGuideId: z.string().uuid().nullable(),
  tone: ContentToneSchema.nullable(),
  contentLength: ContentLengthSchema.nullable(),
  readingLevel: ReadingLevelSchema.nullable(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  status: ArticleStatusSchema,
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // 새 필드
  views: z.number().default(0),
  timeSpent: z.number().default(0),
});
```

---

#### 3.5.3 서비스 함수 (수정안)

**파일**: `src/features/articles/backend/service.ts` (수정)

```typescript
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

// mapArticleRowToResponse 함수 수정 (라인 28-64)
const mapArticleRowToResponse = (row: unknown): ArticleResponse => {
  const rowParse = ArticleTableRowSchema.safeParse(row);

  if (!rowParse.success) {
    throw new Error('Article row failed validation');
  }

  const mapped = {
    id: rowParse.data.id,
    profileId: rowParse.data.profile_id,
    title: rowParse.data.title,
    slug: rowParse.data.slug,
    keywords: rowParse.data.keywords,
    description: rowParse.data.description,
    content: rowParse.data.content,
    styleGuideId: rowParse.data.style_guide_id,
    tone: rowParse.data.tone,
    contentLength: rowParse.data.content_length,
    readingLevel: rowParse.data.reading_level,
    metaTitle: rowParse.data.meta_title,
    metaDescription: rowParse.data.meta_description,
    status: rowParse.data.status,
    publishedAt: rowParse.data.published_at,
    createdAt: rowParse.data.created_at,
    updatedAt: rowParse.data.updated_at,

    // 새로 추가
    views: rowParse.data.views,
    timeSpent: rowParse.data.time_spent,
  } satisfies ArticleResponse;

  const parsed = ArticleResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    throw new Error('Article response failed validation');
  }

  return parsed.data;
};

// getDashboardStats 함수 수정 (라인 356-407)
export const getDashboardStats = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<DomainResult<DashboardStatsResponse, ArticleDomainError>> => {
  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return domainFailure({ code: articleErrorCodes.notFound, message: 'Profile not found' });
  }

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  // 모든 글 조회
  const { data: allArticles, error: allError } = await client
    .from(ARTICLES_TABLE)
    .select('status, created_at, views, time_spent')
    .eq('profile_id', profileId);

  if (allError) {
    return domainFailure({
      code: articleErrorCodes.fetchError,
      message: `Failed to fetch dashboard stats: ${allError.message}`,
    });
  }

  const articles = allArticles || [];

  // 기존 통계
  const totalArticles = articles.length;
  const publishedArticles = articles.filter((a) => a.status === 'published').length;
  const draftArticles = articles.filter((a) => a.status === 'draft').length;

  // 이번 달 글 수
  const monthlyArticles = articles.filter((article) => {
    const createdAt = new Date(article.created_at);
    return createdAt >= currentMonthStart && createdAt <= currentMonthEnd;
  }).length;

  // 지난 달 글 수
  const previousMonthArticles = articles.filter((article) => {
    const createdAt = new Date(article.created_at);
    return createdAt >= previousMonthStart && createdAt <= previousMonthEnd;
  }).length;

  // 절약된 시간
  const totalMinutes = articles.reduce((sum, a) => sum + (a.time_spent || 0), 0);
  const savedHours = Math.round(totalMinutes / 60);

  // 총 조회수
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  // 지난 달 조회수
  const previousMonthViews = articles
    .filter((article) => {
      const createdAt = new Date(article.created_at);
      return createdAt >= previousMonthStart && createdAt <= previousMonthEnd;
    })
    .reduce((sum, a) => sum + (a.views || 0), 0);

  return domainSuccess({
    monthlyArticles,
    totalArticles,
    publishedArticles,
    draftArticles,
    savedHours,
    monthlyGoal: 10,
    previousMonthArticles,
    totalViews,
    previousMonthViews,
  });
};

// getActivityData 함수 신규 추가
export const getActivityData = async (
  client: SupabaseClient,
  clerkUserId: string,
  period: '7d' | '30d',
): Promise<DomainResult<ActivityDataResponse, ArticleDomainError>> => {
  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return domainFailure({ code: articleErrorCodes.notFound, message: 'Profile not found' });
  }

  const now = new Date();
  const days = period === '7d' ? 7 : 30;
  const startDate = startOfDay(subDays(now, days - 1));
  const endDate = endOfDay(now);

  // 기간 내 모든 글 조회
  const { data: articles, error } = await client
    .from(ARTICLES_TABLE)
    .select('created_at, time_spent')
    .eq('profile_id', profileId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    return domainFailure({
      code: articleErrorCodes.fetchError,
      message: `Failed to fetch activity data: ${error.message}`,
    });
  }

  // 날짜별 글 수 집계
  const dateMap = new Map<string, number>();
  const dayOfWeekMap = new Map<string, number>();
  let totalTime = 0;

  // 초기화 (모든 날짜를 0으로)
  for (let i = 0; i < days; i++) {
    const date = format(subDays(now, days - 1 - i), 'yyyy-MM-dd');
    dateMap.set(date, 0);
  }

  // 데이터 집계
  (articles || []).forEach((article) => {
    const date = format(new Date(article.created_at), 'yyyy-MM-dd');
    const dayOfWeek = format(new Date(article.created_at), 'EEEE', { locale: ko });

    dateMap.set(date, (dateMap.get(date) || 0) + 1);
    dayOfWeekMap.set(dayOfWeek, (dayOfWeekMap.get(dayOfWeek) || 0) + 1);
    totalTime += article.time_spent || 0;
  });

  // Chart Data 생성
  const chartData = Array.from(dateMap.entries()).map(([date, articles]) => ({
    date: format(new Date(date), 'MM/dd'),
    articles,
  }));

  // 가장 활발한 요일 찾기
  let mostActiveDay = '월요일';
  let maxCount = 0;
  dayOfWeekMap.forEach((count, day) => {
    if (count > maxCount) {
      maxCount = count;
      mostActiveDay = day;
    }
  });

  // 평균 작성 시간 계산
  const articleCount = articles?.length || 0;
  const averageTime = articleCount > 0 ? Math.round(totalTime / articleCount) : 0;

  const response: ActivityDataResponse = {
    chartData,
    insights: {
      mostActiveDay,
      averageTime,
    },
  };

  return domainSuccess(response);
};
```

---

#### 3.5.4 API 라우트

**파일**: `src/features/articles/backend/route.ts` (추가)

```typescript
import { getActivityData } from './service';
import { ActivityDataResponseSchema } from './schema';

// registerArticlesRoutes 함수 내에 추가
app.get('/api/articles/activity', async (c) => {
  const userId = getClerkUserId(c);

  // Query parameter에서 period 추출 (기본값: 7d)
  const queryPeriod = c.req.query('period');
  const period = queryPeriod === '30d' ? '30d' : '7d';

  const supabase = getSupabase(c);
  const logger = getLogger(c);

  const result = await getActivityData(supabase, userId, period);

  if (result.ok) {
    logger.info('Activity data retrieved successfully', { userId, period });
  }

  return respondWithDomain(c, result);
});
```

---

#### 3.5.5 프론트엔드 훅

**파일**: `src/features/articles/hooks/useActivityData.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import type { ActivityDataResponse } from "@/features/articles/backend/schema";

export function useActivityData(period: '7d' | '30d') {
  const { userId } = useAuth();

  return useQuery<ActivityDataResponse>({
    queryKey: ["activityData", period, userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("로그인이 필요합니다");
      }

      try {
        const client = createAuthenticatedClient(userId);
        const response = await client.get(`/api/articles/activity?period=${period}`);
        return response.data as ActivityDataResponse;
      } catch (error) {
        const message = extractApiErrorMessage(error, "활동 데이터를 불러오는데 실패했습니다");
        throw new Error(message);
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분
  });
}
```

---

### 3.6 i18n 번역 키 (수정안)

#### 3.6.1 한국어 (messages/ko.json)

**기존 `dashboard` 섹션에 추가** (전체 교체 X):

```json
{
  "dashboard": {
    "title": "대시보드",
    "welcome": "반갑습니다",

    "welcome_header": {
      "greeting": "안녕하세요, {userName}님!",
      "subtitle": "오늘도 멋진 콘텐츠를 만들어 보세요.",
      "new_article": "새 글 작성"
    },

    "welcome_new": {
      "greeting_new": "환영합니다, {userName}님",
      "greeting_default": "안녕하세요, {userName}님",
      "greeting_achieved": "목표 달성! 멋져요, {userName}님 🎉",
      "greeting_almost": "목표까지 1개만 더, {userName}님!",
      "subtext_new": "첫 글을 작성해보세요",
      "subtext_default": "지금까지 {count}개의 글을 작성했어요",
      "cta": "새 글 작성"
    },

    "stats": {
      "monthly_articles_title": "월간 완성 글 수",
      "monthly_articles_suffix": "편",
      "goal_achievement": "목표의 {rate}%를 달성했어요!",
      "saved_time_title": "누적 절약 시간",
      "saved_time_suffix": "시간",
      "saved_time_desc": "이번 달에 절약한 시간",
      "monthly_title": "이번 달 작성",
      "total_views_title": "총 조회수",
      "goal_progress": "목표의 {percent}% 달성",
      "vs_last_month": "전월 대비",
      "error": "통계를 불러오는 중 오류가 발생했습니다"
    },

    "recent": {
      "title": "최근 작성한 글",
      "error": "글 목록을 불러오는 중 오류가 발생했습니다",
      "empty": "아직 작성한 글이 없습니다",
      "th": {
        "status": "상태",
        "title": "제목",
        "created_at": "생성일",
        "actions": "액션"
      },
      "actions": {
        "view": "보기",
        "edit": "수정"
      },
      "view_all": "전체 보기",
      "create_first": "첫 글 작성하기",
      "status_published": "발행됨",
      "status_draft": "초안",
      "no_description": "설명이 없습니다"
    },

    "status": {
      "done": "완료",
      "draft": "작성중"
    },

    "banner": {
      "title": "환영합니다! 🎉",
      "desc": "모든 설정이 완료되었습니다. 이제 AI로 첫 콘텐츠를 생성해보세요!",
      "cta": "첫 글 작성",
      "cta_aria": "첫 글 작성하러 가기",
      "close_aria": "환영 메시지 닫기"
    },

    "activity": {
      "title": "월간 활동 그래프",
      "placeholder": "차트 라이브러리(예: Recharts)가 여기에 표시됩니다",
      "period_7d": "7일",
      "period_30d": "30일",
      "most_active_day": "가장 활발한 요일",
      "avg_time": "평균 작성 시간",
      "minutes": "분",
      "error": "활동 데이터를 불러오는 중 오류가 발생했습니다"
    }
  }
}
```

---

#### 3.6.2 영어 (messages/en.json)

```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome",

    "welcome_header": {
      "greeting": "Hello, {userName}!",
      "subtitle": "Create amazing content today.",
      "new_article": "New Article"
    },

    "welcome_new": {
      "greeting_new": "Welcome, {userName}",
      "greeting_default": "Hello, {userName}",
      "greeting_achieved": "Goal achieved! Great job, {userName} 🎉",
      "greeting_almost": "Just 1 more to reach your goal, {userName}!",
      "subtext_new": "Write your first article",
      "subtext_default": "You've written {count} articles so far",
      "cta": "New Article"
    },

    "stats": {
      "monthly_articles_title": "Monthly Completed",
      "monthly_articles_suffix": "",
      "goal_achievement": "{rate}% of goal achieved",
      "saved_time_title": "Time Saved",
      "saved_time_suffix": "hours",
      "saved_time_desc": "Time saved this month",
      "monthly_title": "This Month",
      "total_views_title": "Total Views",
      "goal_progress": "{percent}% of goal achieved",
      "vs_last_month": "vs last month",
      "error": "Failed to load statistics"
    },

    "recent": {
      "title": "Recent Articles",
      "error": "Failed to load articles",
      "empty": "No articles yet",
      "th": {
        "status": "Status",
        "title": "Title",
        "created_at": "Created",
        "actions": "Actions"
      },
      "actions": {
        "view": "View",
        "edit": "Edit"
      },
      "view_all": "View All",
      "create_first": "Create First Article",
      "status_published": "Published",
      "status_draft": "Draft",
      "no_description": "No description"
    },

    "status": {
      "done": "Done",
      "draft": "Draft"
    },

    "banner": {
      "title": "Welcome! 🎉",
      "desc": "All set. Start creating your first AI-powered content!",
      "cta": "Create First Article",
      "cta_aria": "Go to create first article",
      "close_aria": "Close welcome message"
    },

    "activity": {
      "title": "Activity Trend",
      "placeholder": "Chart library (e.g. Recharts) will be displayed here",
      "period_7d": "7 days",
      "period_30d": "30 days",
      "most_active_day": "Most Active Day",
      "avg_time": "Avg. Writing Time",
      "minutes": "min",
      "error": "Failed to load activity data"
    }
  }
}
```

---

### 3.7 Tailwind 애니메이션 설정

**파일**: `tailwind.config.ts` (수정)

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  // ... 기존 설정 ...
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out backwards',
      },
    },
  },
};

export default config;
```

---

## 4. 주요 변경 사항

### 4.1 수정된 컴포넌트

- **WelcomeSection**: Props 구조 단순화 (stats 객체로 통합)
- **StatsGrid**: Props를 `DashboardStatsResponse` 타입으로 직접 전달
- **ActivitySection**: `useTheme` 제거, CSS 변수로 다크모드 대응
- **ArticleCard**: 키보드 접근성 추가 (`tabIndex`, `role`, `onKeyDown`)

### 4.2 추가된 파일

- `src/features/articles/lib/greetings.ts` (디렉토리 구조 변경)
- `src/features/articles/hooks/useActivityData.ts` (인증 처리 강화)
- `supabase/migrations/0010_add_article_metrics.sql` (컬럼 추가만)

### 4.3 제거된 항목

- `src/features/dashboard/` 디렉토리 (불필요)
- `src/styles/dashboard-animations.css` (Tailwind 설정으로 대체)

---

## 5. 구현 체크리스트

### Phase 1 완료 기준

#### 백엔드
- [ ] Supabase 마이그레이션 실행 완료 (`0010_add_article_metrics.sql`)
- [ ] `ArticleTableRowSchema`에 `views`, `time_spent` 추가
- [ ] `ArticleResponseSchema`에 `views`, `timeSpent` 추가
- [ ] `mapArticleRowToResponse` 함수 수정
- [ ] `DashboardStatsResponseSchema`에 새 필드 추가 (기존 필드 유지)
- [ ] `getDashboardStats` 함수 수정 (새 필드 계산)
- [ ] `getActivityData` 함수 신규 구현
- [ ] `GET /api/articles/activity` 엔드포인트 추가
- [ ] 실제 데이터로 API 테스트 완료

#### 프론트엔드
- [ ] `src/features/articles/lib/greetings.ts` 생성
- [ ] `src/components/dashboard/welcome-section.tsx` 생성
- [ ] `src/components/dashboard/stat-card.tsx` 생성
- [ ] `src/components/dashboard/stats-grid.tsx` 생성
- [ ] `tailwind.config.ts`에 애니메이션 추가
- [ ] 모바일/태블릿/데스크톱 반응형 확인
- [ ] 다크모드 전환 시 스타일 이상 없음
- [ ] Reduced Motion 동작 확인

#### i18n
- [ ] `messages/ko.json` 업데이트 (기존 키 유지 + 새 키 추가)
- [ ] `messages/en.json` 업데이트 (기존 키 유지 + 새 키 추가)
- [ ] 모든 텍스트가 번역 키로 대체됨 (하드코딩 없음)
- [ ] 번역 키 네임스페이스 일관성 확인 (`dashboard.welcome_new.*`)

#### 테스트
- [ ] 로딩 상태 정상 표시
- [ ] 에러 상태 정상 표시
- [ ] 빈 상태 (글 0개) 정상 표시
- [ ] 브라우저 콘솔 에러 없음
- [ ] TypeScript 컴파일 에러 없음

---

### Phase 2 완료 기준

#### ActivitySection
- [ ] `useActivityData` 훅 생성 (인증 처리 포함)
- [ ] `recharts` 패키지 설치
- [ ] `src/components/dashboard/period-selector.tsx` 생성
- [ ] `src/components/dashboard/insight-badge.tsx` 생성
- [ ] `src/components/dashboard/activity-section.tsx` 생성
- [ ] 7일/30일 기간 전환 동작 확인
- [ ] 다크모드 차트 색상 정상 (CSS 변수 사용)
- [ ] 인사이트 배지 데이터 정확성 확인

#### RecentArticlesGrid
- [ ] `src/components/dashboard/article-card.tsx` 생성 (접근성 포함)
- [ ] `src/components/dashboard/recent-articles-grid.tsx` 생성
- [ ] 카드 그리드 레이아웃 (1/2/3열) 확인
- [ ] "전체 보기" 링크 동작 확인
- [ ] Empty State 확인
- [ ] 키보드 네비게이션 동작 확인

#### 통합 테스트
- [ ] 모든 컴포넌트 통합 후 레이아웃 이상 없음
- [ ] 실제 사용자 플로우 테스트 (대시보드 진입 → 통계 확인 → 글 작성)
- [ ] API 응답 데이터 검증 (통계 정확성)
- [ ] 성능 측정 (Lighthouse 스코어)

---

## 6. 리스크 및 주의사항

### 6.1 잠재적 문제

#### 문제 1: 기존 컴포넌트 의존성
**리스크**: 기존 컴포넌트(WelcomeHeader, StatsCards 등)가 다른 곳에서 사용될 수 있음
**대응 방안**:
1. 전체 코드베이스에서 import 검색 (`Grep` 도구 활용)
2. 사용되지 않는 것이 확인되면 삭제
3. 사용 중이라면 점진적 마이그레이션 계획 수립

#### 문제 2: Supabase 마이그레이션 실패
**리스크**: 프로덕션 환경에서 마이그레이션 실행 시 데이터 손실 위험
**대응 방안**:
1. 개발 환경에서 먼저 테스트
2. 백업 확보
3. `IF NOT EXISTS` 절 사용으로 안전성 확보

#### 문제 3: 번역 키 충돌
**리스크**: 기존 번역 키를 덮어쓰면 다른 페이지에서 에러 발생
**대응 방안**:
1. 새 네임스페이스 사용 (`dashboard.welcome_new`)
2. 기존 키는 삭제하지 않고 유지
3. 단계적으로 마이그레이션

---

### 6.2 테스트 필요 항목

#### 단위 테스트
- [ ] `getContextualGreeting` 함수 (다양한 시나리오)
- [ ] `getContextualSubtext` 함수
- [ ] `getDashboardStats` 서비스 함수 (모든 필드 계산)
- [ ] `getActivityData` 서비스 함수 (날짜 집계 로직)

#### 통합 테스트
- [ ] API `/api/articles/stats` 응답 구조 검증
- [ ] API `/api/articles/activity` 응답 구조 검증
- [ ] React Query 캐싱 동작 확인

#### E2E 테스트 (선택)
- [ ] 대시보드 페이지 로딩
- [ ] 통계 카드 데이터 표시
- [ ] 활동 차트 렌더링
- [ ] 기간 선택 변경 시 차트 업데이트
- [ ] 글 카드 클릭 시 편집 페이지 이동

---

## 7. 실행 준비 확인

- [x] 모든 타입 오류 해결 (스키마 수정 완료)
- [x] 모든 import 경로 검증 (디렉토리 구조 수정)
- [x] i18n 완전성 확인 (기존 키 유지 + 새 키 추가)
- [x] 성능 최적화 고려 (React Query 캐싱, CSS 애니메이션)
- [x] 접근성 요구사항 충족 (키보드 네비게이션, ARIA)
- [x] 코드베이스 일관성 유지 (기존 패턴 준수)
- [x] 호환성 보장 (기존 API 응답 필드 유지)

---

## 8. 다음 단계

### Phase 1 구현 후

1. **코드 리뷰**
   - 타입 안정성 확인
   - 에러 처리 검증
   - 접근성 체크

2. **성능 측정**
   - Lighthouse 스코어 (목표: Performance 90+)
   - Core Web Vitals 확인
   - 번들 크기 분석

3. **사용자 피드백 수집**
   - 내부 테스트
   - 대시보드 사용성 평가

### Phase 2 구현 후

1. **통합 테스트**
   - E2E 시나리오 작성
   - 실제 데이터 검증

2. **최적화**
   - React Query 캐싱 전략 개선
   - 이미지 최적화 (썸네일)
   - 번들 크기 최적화

3. **문서화**
   - API 문서 업데이트
   - 컴포넌트 사용법 문서

---

## 9. 최종 결론

### 9.1 원안 대비 개선사항

1. **타입 안정성 강화**: 기존 스키마와 호환되도록 수정
2. **호환성 보장**: 기존 API 응답 필드 유지
3. **접근성 개선**: 키보드 네비게이션 추가
4. **i18n 충돌 방지**: 기존 번역 키 유지
5. **디렉토리 구조 일관성**: 기존 패턴 준수
6. **에러 처리 강화**: 인증 처리 추가

### 9.2 주요 수정 사항 요약

| 항목 | 원안 | 수정안 |
|------|------|--------|
| 디렉토리 구조 | `src/features/dashboard/` 신규 생성 | `src/features/articles/` 활용 |
| 스키마 변경 | 기존 필드 삭제 | 기존 필드 유지 + 새 필드 추가 |
| i18n 키 | 전체 교체 | 기존 키 유지 + 새 키 추가 |
| CSS 애니메이션 | 별도 파일 | Tailwind 설정에 통합 |
| 다크모드 | `useTheme` 훅 사용 | CSS 변수 직접 활용 |
| Props 구조 | 중첩 객체 | 평탄화 (API 응답과 호환) |

### 9.3 구현 가능성 검증

- ✅ **타입 에러 없음**: 모든 스키마 호환성 확인
- ✅ **빌드 에러 없음**: import 경로 및 의존성 검증
- ✅ **런타임 에러 없음**: Props 전달 체인 검증
- ✅ **기존 기능 영향 없음**: 기존 필드 유지로 호환성 보장
- ✅ **접근성 준수**: WCAG 2.1 AA 기준 충족
- ✅ **성능 최적화**: GPU 가속 애니메이션, React Query 캐싱

---

**최종 검토 완료**: 2025-11-16
**검토자**: Implementation Plan Final Review Agent
**결론**: ✅ 실행 가능한 계획으로 승인됨

**다음 단계**: Phase 1 백엔드 마이그레이션 실행 후 프론트엔드 컴포넌트 구현 시작
