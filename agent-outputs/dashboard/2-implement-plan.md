# 대시보드 페이지 구현 계획

> **작성일**: 2025-11-16
> **버전**: 1.0
> **기반 문서**: `1-plan-critic.md`

---

## 목차

1. [코드베이스 분석 결과](#1-코드베이스-분석-결과)
2. [파일 구조](#2-파일-구조)
3. [의존성](#3-의존성)
4. [구현 순서](#4-구현-순서)
5. [컴포넌트 상세 명세](#5-컴포넌트-상세-명세)
6. [백엔드 API 구현](#6-백엔드-api-구현)
7. [i18n 번역 키](#7-i18n-번역-키)
8. [스타일링 가이드](#8-스타일링-가이드)
9. [성능 고려사항](#9-성능-고려사항)
10. [접근성 체크리스트](#10-접근성-체크리스트)

---

## 1. 코드베이스 분석 결과

### 1.1 프로젝트 구조

```
indieblog/
├── src/
│   ├── app/
│   │   └── [locale]/(protected)/dashboard/
│   │       └── page.tsx                      # 대시보드 페이지 (현재 구현됨)
│   ├── components/
│   │   ├── ui/                               # shadcn-ui 컴포넌트
│   │   └── dashboard/                        # 대시보드 전용 컴포넌트
│   │       ├── welcome-header.tsx            # 환영 헤더 (기존)
│   │       ├── welcome-banner.tsx            # 온보딩 배너 (기존)
│   │       ├── stats-cards.tsx               # 통계 카드 (기존 - 2개)
│   │       ├── activity-chart.tsx            # 활동 차트 (플레이스홀더)
│   │       └── recent-articles-list.tsx      # 최근 글 테이블 (기존)
│   ├── features/
│   │   └── articles/
│   │       ├── hooks/
│   │       │   ├── useDashboardStats.ts      # 대시보드 통계 훅 (기존)
│   │       │   └── useListArticles.ts        # 글 목록 훅 (기존)
│   │       ├── backend/
│   │       │   ├── route.ts                  # Hono 라우터 (기존)
│   │       │   ├── service.ts                # Supabase 서비스 (기존)
│   │       │   └── schema.ts                 # Zod 스키마 (기존)
│   │       └── lib/
│   │           └── dto.ts                    # 타입 재노출 (기존)
│   └── lib/
│       └── i18n/
│           └── messages/
│               ├── en.json                   # 영어 번역 (기존)
│               └── ko.json                   # 한국어 번역 (기존)
├── messages/                                 # i18n 메시지 파일
│   ├── en.json
│   └── ko.json
└── supabase/
    └── migrations/
        └── 0003_create_articles_table.sql    # 기존 테이블 스키마
```

### 1.2 기존 패턴

#### 컴포넌트 패턴
- **모든 컴포넌트는 `"use client"` 지시어 사용**
- shadcn-ui 컴포넌트 활용 (`Card`, `Button`, `Table` 등)
- next-intl을 통한 i18n 지원 (`useTranslations` 훅)
- Tailwind CSS를 활용한 반응형 디자인
- 로딩/에러 상태 처리 필수

#### 데이터 페칭 패턴
- `@tanstack/react-query` 사용
- Custom hooks로 API 호출 추상화 (`useDashboardStats`, `useListArticles`)
- Clerk 인증 (`useAuth`, `useCurrentUser`)
- `/api/articles/*` 엔드포인트를 통한 Hono 라우터 활용

#### 스타일 패턴
- Tailwind 유틸리티 클래스 우선
- `className` prop을 통한 스타일 확장
- 반응형: `md:`, `lg:` 브레이크포인트 활용
- 다크모드: `text-foreground`, `text-muted-foreground`, `bg-card` 등의 CSS 변수 사용

### 1.3 기술 스택

**이미 설치된 패키지**:
- ✅ `next` (15.2.3) - App Router
- ✅ `react` (19.0.0)
- ✅ `next-intl` (4.5.3) - i18n
- ✅ `@tanstack/react-query` (5.x) - 서버 상태 관리
- ✅ `framer-motion` (11.x) - 애니메이션 (이미 설치됨!)
- ✅ `tailwindcss` (4.1.13)
- ✅ `lucide-react` (0.469.0) - 아이콘
- ✅ `date-fns` (4.x) - 날짜 포맷
- ✅ `zod` (3.x) - 스키마 검증
- ✅ `hono` (4.9.9) - 백엔드 라우터
- ✅ `@supabase/supabase-js` (2.58.0)

**추가 설치 필요**:
- ❌ `recharts` - 차트 라이브러리 (ActivityChart 구현용)

---

## 2. 파일 구조

### 2.1 생성할 파일

#### 컴포넌트
```
src/components/dashboard/
├── welcome-section.tsx           # WelcomeHeader를 개선한 새 컴포넌트
├── stats-grid.tsx                # StatsCards를 3개 카드로 확장
├── stat-card.tsx                 # 개별 통계 카드 컴포넌트
├── activity-section.tsx          # ActivityChart를 실제 차트로 구현
├── period-selector.tsx           # 기간 선택기 (7일/30일)
├── insight-badge.tsx             # 인사이트 배지 (가장 활발한 요일 등)
├── recent-articles-grid.tsx      # 테이블을 카드 그리드로 전환
└── article-card.tsx              # 개별 글 카드 컴포넌트
```

#### 유틸리티
```
src/features/dashboard/
├── lib/
│   ├── greetings.ts              # 컨텍스트 기반 인사말 로직
│   └── date-utils.ts             # 날짜 관련 유틸리티
└── hooks/
    └── useActivityData.ts        # 활동 데이터 훅
```

#### 백엔드
```
supabase/migrations/
└── 0010_add_article_metrics.sql  # views, time_spent 컬럼 추가

src/features/articles/backend/
└── (기존 파일 수정)
    ├── route.ts                  # GET /api/articles/activity 추가
    ├── service.ts                # getActivityData, getDashboardStats 수정
    └── schema.ts                 # ActivityDataResponse 스키마 추가
```

#### 스타일
```
src/styles/
└── dashboard-animations.css      # CSS 기반 애니메이션
```

### 2.2 수정할 파일

```
src/app/[locale]/(protected)/dashboard/page.tsx       # 새 컴포넌트 교체
src/components/dashboard/welcome-header.tsx            # (삭제 예정)
src/components/dashboard/stats-cards.tsx               # (삭제 예정)
src/components/dashboard/activity-chart.tsx            # (삭제 예정)
src/components/dashboard/recent-articles-list.tsx      # (삭제 예정)

messages/en.json                                       # i18n 키 추가
messages/ko.json                                       # i18n 키 추가

src/features/articles/backend/service.ts               # getDashboardStats, getActivityData 수정
src/features/articles/backend/schema.ts                # 스키마 추가
```

### 2.3 삭제할 파일

Phase 1 완료 후 삭제:
- `src/components/dashboard/welcome-header.tsx` (→ `welcome-section.tsx`로 대체)
- `src/components/dashboard/stats-cards.tsx` (→ `stats-grid.tsx`로 대체)
- `src/components/dashboard/activity-chart.tsx` (→ `activity-section.tsx`로 대체)
- `src/components/dashboard/recent-articles-list.tsx` (→ `recent-articles-grid.tsx`로 대체)

---

## 3. 의존성

### 3.1 설치 명령

```bash
# Recharts 설치 (차트 라이브러리)
pnpm add recharts

# TypeScript 타입 정의 (개발 의존성)
pnpm add -D @types/recharts
```

### 3.2 이미 설치된 패키지

- ✅ `framer-motion` (Phase 3에서 선택적 사용)
- ✅ `date-fns` (날짜 포맷팅)
- ✅ `lucide-react` (아이콘)
- ✅ `@tanstack/react-query` (데이터 페칭)
- ✅ `next-intl` (i18n)

---

## 4. 구현 순서

### Phase 1: 핵심 개선 (1주) ⭐⭐⭐

#### Step 1: 백엔드 준비 (1일)

1. **Supabase 마이그레이션 작성**
   ```sql
   -- supabase/migrations/0010_add_article_metrics.sql
   ALTER TABLE articles ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
   ALTER TABLE articles ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0; -- minutes
   CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
   ```

2. **API 스키마 정의**
   - `src/features/articles/backend/schema.ts`에 다음 추가:
     - `ActivityDataResponseSchema`
     - `DashboardStatsResponseSchema` 수정 (totalViews 추가)

3. **서비스 함수 구현**
   - `src/features/articles/backend/service.ts`:
     - `getDashboardStats()` 수정 (totalViews 계산 추가)
     - `getActivityData()` 신규 구현

4. **API 엔드포인트 추가**
   - `src/features/articles/backend/route.ts`:
     - `GET /api/articles/activity` 추가

#### Step 2: WelcomeSection 구현 (0.5일)

1. `src/features/dashboard/lib/greetings.ts` 생성 (컨텍스트 기반 인사말 로직)
2. `src/components/dashboard/welcome-section.tsx` 생성
3. CSS 애니메이션 추가 (`src/styles/dashboard-animations.css`)

#### Step 3: StatsGrid 구현 (1일)

1. `src/components/dashboard/stat-card.tsx` 생성 (재사용 가능한 카드)
2. `src/components/dashboard/stats-grid.tsx` 생성 (3개 카드 레이아웃)
3. 로딩/에러 상태 처리

#### Step 4: 페이지 통합 및 테스트 (0.5일)

1. `src/app/[locale]/(protected)/dashboard/page.tsx` 수정 (새 컴포넌트 사용)
2. 반응형 레이아웃 확인 (모바일/태블릿/데스크톱)
3. 다크모드 확인
4. Reduced motion 확인

---

### Phase 2: 기능 확장 (1주) ⭐⭐

#### Step 5: ActivitySection 구현 (2일)

1. **Dependencies 설치**
   ```bash
   pnpm add recharts
   ```

2. **컴포넌트 생성**
   - `src/components/dashboard/period-selector.tsx`
   - `src/components/dashboard/insight-badge.tsx`
   - `src/components/dashboard/activity-section.tsx`

3. **데이터 훅 생성**
   - `src/features/dashboard/hooks/useActivityData.ts`

4. **Recharts 통합**
   - Area Chart 구현
   - 다크모드 대응
   - 반응형 크기 조정

#### Step 6: RecentArticlesGrid 구현 (2일)

1. **컴포넌트 생성**
   - `src/components/dashboard/article-card.tsx`
   - `src/components/dashboard/recent-articles-grid.tsx`

2. **레이아웃 구현**
   - 카드 그리드 (1/2/3열 반응형)
   - 썸네일 placeholder 처리
   - "전체 보기" 링크

3. **Empty State 처리**
   - 글이 없을 때 안내 메시지

#### Step 7: 통합 테스트 (1일)

1. **E2E 테스트 작성** (선택적)
   - Playwright로 주요 시나리오 테스트

2. **실제 데이터 검증**
   - 통계 집계 정확성 확인
   - 차트 데이터 일관성 확인

---

### Phase 3: 세부 완성 (선택적, 3-5일) ⭐

#### Step 8: 고급 애니메이션 (선택)

- Framer Motion을 동적 import로 도입
- Stats 카드 호버 효과 개선
- 차트 진입 애니메이션

#### Step 9: 성능 최적화

- Lighthouse 스코어 측정
- 번들 크기 최적화
- 이미지 최적화 (썸네일)
- React Query 캐싱 전략 최적화

---

## 5. 컴포넌트 상세 명세

### 5.1 WelcomeSection

**파일**: `src/components/dashboard/welcome-section.tsx`

#### Props

```typescript
interface WelcomeSectionProps {
  userName: string;
  articleCount: number;    // 사용자 총 글 수
  monthlyTarget: number;   // 월간 목표 (기본값: 10)
  currentMonthly: number;  // 이번 달 작성 수
  onCreateArticle: () => void;
}
```

#### 전체 코드

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from 'next-intl';
import { getContextualGreeting, getContextualSubtext } from "@/features/dashboard/lib/greetings";

interface WelcomeSectionProps {
  userName: string;
  articleCount: number;
  monthlyTarget: number;
  currentMonthly: number;
  onCreateArticle: () => void;
}

export function WelcomeSection({
  userName,
  articleCount,
  monthlyTarget,
  currentMonthly,
  onCreateArticle,
}: WelcomeSectionProps) {
  const t = useTranslations('dashboard.welcome');

  const greeting = getContextualGreeting({
    userName,
    articleCount,
    currentMonthly,
    monthlyTarget,
    t,
  });

  const subtext = getContextualSubtext({
    articleCount,
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

#### 유틸리티 함수

**파일**: `src/features/dashboard/lib/greetings.ts`

```typescript
interface GreetingContext {
  userName: string;
  articleCount: number;
  currentMonthly: number;
  monthlyTarget: number;
  t: (key: string, values?: Record<string, unknown>) => string;
}

interface SubtextContext {
  articleCount: number;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export function getContextualGreeting({
  userName,
  articleCount,
  currentMonthly,
  monthlyTarget,
  t,
}: GreetingContext): string {
  // 신규 사용자 (글 0개)
  if (articleCount === 0) {
    return t('greeting_new', { userName });
  }

  // 목표 달성
  if (currentMonthly >= monthlyTarget) {
    return t('greeting_achieved', { userName });
  }

  // 목표까지 1개 남음
  if (currentMonthly === monthlyTarget - 1) {
    return t('greeting_almost', { userName });
  }

  // 기본 인사
  return t('greeting_default', { userName });
}

export function getContextualSubtext({
  articleCount,
  t,
}: SubtextContext): string {
  if (articleCount === 0) {
    return t('subtext_new');
  }
  return t('subtext_default', { count: articleCount });
}
```

---

### 5.2 StatsGrid

**파일**: `src/components/dashboard/stats-grid.tsx`

#### Props

```typescript
interface StatsGridProps {
  stats: {
    monthlyArticles: {
      current: number;
      target: number;
      previousMonth: number;
    };
    savedTime: {
      hours: number;
    };
    totalViews: {
      count: number;
      previousMonth: number;
    };
  };
  isLoading?: boolean;
  error?: Error | null;
}
```

#### 전체 코드

```tsx
"use client";

import { FileText, Clock, Eye, Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';
import { StatCard } from "./stat-card";
import { Card, CardContent } from "@/components/ui/card";

interface StatsGridProps {
  stats: {
    monthlyArticles: {
      current: number;
      target: number;
      previousMonth: number;
    };
    savedTime: {
      hours: number;
    };
    totalViews: {
      count: number;
      previousMonth: number;
    };
  };
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
    stats.monthlyArticles.current,
    stats.monthlyArticles.previousMonth
  );

  const viewsTrend = calculateTrend(
    stats.totalViews.count,
    stats.totalViews.previousMonth
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <StatCard
        title={t('monthly_title')}
        value={stats.monthlyArticles.current}
        target={stats.monthlyArticles.target}
        trend={monthlyTrend}
        icon={FileText}
        suffix={t('monthly_suffix')}
      />
      <StatCard
        title={t('saved_time_title')}
        value={stats.savedTime.hours}
        icon={Clock}
        suffix={t('saved_time_suffix')}
      />
      <StatCard
        title={t('total_views_title')}
        value={stats.totalViews.count.toLocaleString()}
        trend={viewsTrend}
        icon={Eye}
      />
    </div>
  );
}
```

---

### 5.3 StatCard

**파일**: `src/components/dashboard/stat-card.tsx`

#### Props

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  target?: number;        // 목표치 (optional)
  trend?: number;         // 증감률 (optional, %)
  icon: LucideIcon;
  suffix?: string;        // 단위 (optional, 예: "편", "시간")
}
```

#### 전체 코드

```tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, ArrowDown, Minus, type LucideIcon } from "lucide-react";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  target?: number;
  trend?: number;
  icon: LucideIcon;
  suffix?: string;
}

export function StatCard({
  title,
  value,
  target,
  trend,
  icon: Icon,
  suffix = "",
}: StatCardProps) {
  const t = useTranslations('dashboard.stats');

  const numericValue = typeof value === 'number' ? value : 0;
  const progress = target ? Math.min((numericValue / target) * 100, 100) : undefined;

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return Minus;
    return trend > 0 ? ArrowUp : ArrowDown;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return "text-muted-foreground";
    return trend > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500";
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl md:text-4xl font-bold tabular-nums">
          {value}
          {suffix && <span className="text-lg ml-1">{suffix}</span>}
          {target && (
            <span className="text-lg font-normal text-muted-foreground ml-2">
              / {target}{suffix}
            </span>
          )}
        </div>

        {/* Progress Bar (목표가 있을 때만) */}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <CardDescription className="mt-2">
              {t('goal_progress', { percent: Math.round(progress) })}
            </CardDescription>
          </div>
        )}

        {/* Trend Indicator (목표가 없을 때만) */}
        {trend !== undefined && progress === undefined && (
          <div className={cn("flex items-center gap-1 mt-2 text-sm", getTrendColor())}>
            <TrendIcon className="h-4 w-4" />
            <span className="font-medium">
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-muted-foreground ml-1">
              {t('vs_last_month')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### 5.4 ActivitySection

**파일**: `src/components/dashboard/activity-section.tsx`

#### Props

```typescript
interface ActivitySectionProps {
  period: '7d' | '30d';
  onPeriodChange: (period: '7d' | '30d') => void;
}
```

#### 전체 코드

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
import { useTheme } from "next-themes";

export function ActivitySection() {
  const t = useTranslations('dashboard.activity');
  const { theme } = useTheme();
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
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
              />
              <XAxis
                dataKey="date"
                stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <YAxis
                stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                }}
                labelStyle={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
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

### 5.5 PeriodSelector

**파일**: `src/components/dashboard/period-selector.tsx`

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";

interface PeriodSelectorProps {
  selected: '7d' | '30d';
  onChange: (period: '7d' | '30d') => void;
}

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  const t = useTranslations('dashboard.activity');

  return (
    <div className="inline-flex items-center rounded-lg border bg-muted p-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "px-3 py-1.5 text-sm transition-all",
          selected === '7d' && "bg-background shadow-sm"
        )}
        onClick={() => onChange('7d')}
      >
        {t('period_7d')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "px-3 py-1.5 text-sm transition-all",
          selected === '30d' && "bg-background shadow-sm"
        )}
        onClick={() => onChange('30d')}
      >
        {t('period_30d')}
      </Button>
    </div>
  );
}
```

---

### 5.6 InsightBadge

**파일**: `src/components/dashboard/insight-badge.tsx`

```tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface InsightBadgeProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export function InsightBadge({ label, value, icon: Icon }: InsightBadgeProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 5.7 RecentArticlesGrid

**파일**: `src/components/dashboard/recent-articles-grid.tsx`

#### Props

```typescript
interface RecentArticlesGridProps {
  articles: Article[];
  isLoading?: boolean;
  error?: Error | null;
  onViewAll: () => void;
}

interface Article {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  views?: number;
}
```

#### 전체 코드

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { useTranslations } from 'next-intl';
import { ArticleCard } from "./article-card";

interface Article {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  views?: number;
}

interface RecentArticlesGridProps {
  articles: Article[];
  isLoading?: boolean;
  error?: Error | null;
  onViewAll: () => void;
}

export function RecentArticlesGrid({
  articles,
  isLoading,
  error,
  onViewAll,
}: RecentArticlesGridProps) {
  const t = useTranslations('dashboard.recent');

  if (isLoading) {
    return (
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            {t('error')}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (articles.length === 0) {
    return (
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{t('empty')}</p>
            <Button onClick={onViewAll} variant="outline">
              {t('create_first')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
        <Button variant="ghost" onClick={onViewAll} className="gap-2">
          {t('view_all')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.slice(0, 6).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
```

---

### 5.8 ArticleCard

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

  const excerpt = article.description
    ? article.description.slice(0, 100) + (article.description.length > 100 ? '...' : '')
    : t('no_description');

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
      onClick={handleClick}
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

## 6. 백엔드 API 구현

### 6.1 데이터베이스 마이그레이션

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

-- Add comment
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

### 6.2 백엔드 스키마 업데이트

**파일**: `src/features/articles/backend/schema.ts`

기존 파일에 다음 추가:

```typescript
// Activity Data Response Schema
export const ActivityDataPointSchema = z.object({
  date: z.string(), // "2025-11-01" 형식
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

// Dashboard Stats Response Schema (수정)
export const DashboardStatsResponseSchema = z.object({
  monthlyArticles: z.number(),
  monthlyGoal: z.number().default(10),
  previousMonthArticles: z.number(),
  savedHours: z.number(),
  totalViews: z.number(), // 추가
  previousMonthViews: z.number(), // 추가
});

export type DashboardStatsResponse = z.infer<typeof DashboardStatsResponseSchema>;

// Article Table Row Schema에 views, time_spent 추가
export const ArticleTableRowSchema = z.object({
  // ... 기존 필드 ...
  views: z.number().default(0), // 추가
  time_spent: z.number().default(0), // 추가
});
```

---

### 6.3 서비스 함수 구현

**파일**: `src/features/articles/backend/service.ts`

기존 파일에 다음 함수 추가/수정:

```typescript
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 대시보드 통계 조회 (수정)
 */
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

  // 이번 달 글 수
  const { count: monthlyArticles, error: monthlyError } = await client
    .from(ARTICLES_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .gte('created_at', currentMonthStart.toISOString())
    .lte('created_at', currentMonthEnd.toISOString());

  if (monthlyError) {
    return domainFailure({
      code: articleErrorCodes.fetchError,
      message: `Failed to fetch monthly articles: ${monthlyError.message}`,
    });
  }

  // 지난 달 글 수
  const { count: previousMonthArticles, error: prevError } = await client
    .from(ARTICLES_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .gte('created_at', previousMonthStart.toISOString())
    .lte('created_at', previousMonthEnd.toISOString());

  if (prevError) {
    return domainFailure({
      code: articleErrorCodes.fetchError,
      message: `Failed to fetch previous month articles: ${prevError.message}`,
    });
  }

  // 절약된 시간 (이번 달 작성 시간 합계)
  const { data: timeData, error: timeError } = await client
    .from(ARTICLES_TABLE)
    .select('time_spent')
    .eq('profile_id', profileId)
    .gte('created_at', currentMonthStart.toISOString())
    .lte('created_at', currentMonthEnd.toISOString());

  if (timeError) {
    return domainFailure({
      code: articleErrorCodes.fetchError,
      message: `Failed to fetch time data: ${timeError.message}`,
    });
  }

  const totalMinutes = (timeData || []).reduce((sum, row) => sum + (row.time_spent || 0), 0);
  const savedHours = Math.round(totalMinutes / 60);

  // 총 조회수 (전체 기간)
  const { data: viewsData, error: viewsError } = await client
    .from(ARTICLES_TABLE)
    .select('views')
    .eq('profile_id', profileId);

  if (viewsError) {
    return domainFailure({
      code: articleErrorCodes.fetchError,
      message: `Failed to fetch views: ${viewsError.message}`,
    });
  }

  const totalViews = (viewsData || []).reduce((sum, row) => sum + (row.views || 0), 0);

  // 지난 달 조회수
  const { data: prevViewsData, error: prevViewsError } = await client
    .from(ARTICLES_TABLE)
    .select('views')
    .eq('profile_id', profileId)
    .gte('created_at', previousMonthStart.toISOString())
    .lte('created_at', previousMonthEnd.toISOString());

  if (prevViewsError) {
    return domainFailure({
      code: articleErrorCodes.fetchError,
      message: `Failed to fetch previous month views: ${prevViewsError.message}`,
    });
  }

  const previousMonthViews = (prevViewsData || []).reduce((sum, row) => sum + (row.views || 0), 0);

  const stats: DashboardStatsResponse = {
    monthlyArticles: monthlyArticles ?? 0,
    monthlyGoal: 10, // 추후 사용자 설정으로 변경 가능
    previousMonthArticles: previousMonthArticles ?? 0,
    savedHours,
    totalViews,
    previousMonthViews,
  };

  return domainSuccess(stats);
};

/**
 * 활동 데이터 조회 (신규)
 */
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
  const dayOfWeekMap = new Map<string, number>(); // 요일별 집계
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
    date: format(new Date(date), 'MM/dd'), // "11/16" 형식
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

### 6.4 API 라우트 추가

**파일**: `src/features/articles/backend/route.ts`

기존 파일에 다음 라우트 추가:

```typescript
import { getActivityData } from './service';
import { ActivityDataResponseSchema } from './schema';

// 기존 registerArticleRoutes 함수 내에 추가
app.get('/api/articles/activity', async (c) => {
  const clerkUserId = c.get('userId');
  if (!clerkUserId) {
    return respond(c, failure('UNAUTHORIZED', 'Authentication required'));
  }

  // Query parameter에서 period 추출 (기본값: 7d)
  const period = c.req.query('period') === '30d' ? '30d' : '7d';

  const client = c.get('supabase');
  const result = await getActivityData(client, clerkUserId, period);

  if (!result.success) {
    return respond(c, failure(result.error.code, result.error.message));
  }

  // Validate response
  const validated = ActivityDataResponseSchema.safeParse(result.data);
  if (!validated.success) {
    return respond(c, failure('VALIDATION_ERROR', 'Invalid activity data format'));
  }

  return respond(c, success(validated.data));
});
```

---

### 6.5 프론트엔드 훅 생성

**파일**: `src/features/dashboard/hooks/useActivityData.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import type { ActivityDataResponse } from "@/features/articles/backend/schema";

export function useActivityData(period: '7d' | '30d') {
  const { userId } = useAuth();

  return useQuery<ActivityDataResponse>({
    queryKey: ["activityData", period],
    queryFn: async () => {
      try {
        const client = createAuthenticatedClient(userId);
        const response = await client.get(`/api/articles/activity?period=${period}`);
        return response.data as ActivityDataResponse;
      } catch (error) {
        const message = extractApiErrorMessage(error, "활동 데이터를 불러오는데 실패했습니다");
        throw new Error(message);
      }
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}
```

---

## 7. i18n 번역 키

### 7.1 한국어 (messages/ko.json)

기존 `dashboard` 섹션을 다음으로 교체:

```json
{
  "dashboard": {
    "title": "대시보드",
    "welcome": {
      "greeting_new": "환영합니다, {userName}님",
      "greeting_default": "안녕하세요, {userName}님",
      "greeting_achieved": "목표 달성! 멋져요, {userName}님 🎉",
      "greeting_almost": "목표까지 1개만 더, {userName}님!",
      "subtext_new": "첫 글을 작성해보세요",
      "subtext_default": "지금까지 {count}개의 글을 작성했어요",
      "cta": "새 글 작성"
    },
    "stats": {
      "monthly_title": "이번 달 작성",
      "monthly_suffix": "편",
      "saved_time_title": "절약된 시간",
      "saved_time_suffix": "시간",
      "total_views_title": "총 조회수",
      "goal_progress": "목표의 {percent}% 달성",
      "vs_last_month": "전월 대비",
      "error": "통계를 불러오는 중 오류가 발생했습니다"
    },
    "activity": {
      "title": "활동 추이",
      "period_7d": "7일",
      "period_30d": "30일",
      "most_active_day": "가장 활발한 요일",
      "avg_time": "평균 작성 시간",
      "minutes": "분",
      "error": "활동 데이터를 불러오는 중 오류가 발생했습니다"
    },
    "recent": {
      "title": "최근 작성한 글",
      "view_all": "전체 보기",
      "empty": "아직 작성한 글이 없습니다",
      "create_first": "첫 글 작성하기",
      "status_published": "발행됨",
      "status_draft": "초안",
      "no_description": "설명이 없습니다",
      "error": "글 목록을 불러오는 중 오류가 발생했습니다"
    },
    "banner": {
      "title": "환영합니다! 🎉",
      "desc": "모든 설정이 완료되었습니다. 이제 AI로 첫 콘텐츠를 생성해보세요!",
      "cta": "첫 글 작성",
      "cta_aria": "첫 글 작성하러 가기",
      "close_aria": "환영 메시지 닫기"
    }
  }
}
```

### 7.2 영어 (messages/en.json)

```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": {
      "greeting_new": "Welcome, {userName}",
      "greeting_default": "Hello, {userName}",
      "greeting_achieved": "Goal achieved! Great job, {userName} 🎉",
      "greeting_almost": "Just 1 more to reach your goal, {userName}!",
      "subtext_new": "Write your first article",
      "subtext_default": "You've written {count} articles so far",
      "cta": "New Article"
    },
    "stats": {
      "monthly_title": "This Month",
      "monthly_suffix": "",
      "saved_time_title": "Time Saved",
      "saved_time_suffix": "hours",
      "total_views_title": "Total Views",
      "goal_progress": "{percent}% of goal achieved",
      "vs_last_month": "vs last month",
      "error": "Failed to load statistics"
    },
    "activity": {
      "title": "Activity Trend",
      "period_7d": "7 days",
      "period_30d": "30 days",
      "most_active_day": "Most Active Day",
      "avg_time": "Avg. Writing Time",
      "minutes": "min",
      "error": "Failed to load activity data"
    },
    "recent": {
      "title": "Recent Articles",
      "view_all": "View All",
      "empty": "No articles yet",
      "create_first": "Create First Article",
      "status_published": "Published",
      "status_draft": "Draft",
      "no_description": "No description",
      "error": "Failed to load articles"
    },
    "banner": {
      "title": "Welcome! 🎉",
      "desc": "All set. Start creating your first AI-powered content!",
      "cta": "Create First Article",
      "cta_aria": "Go to create first article",
      "close_aria": "Close welcome message"
    }
  }
}
```

---

## 8. 스타일링 가이드

### 8.1 CSS 애니메이션

**파일**: `src/styles/dashboard-animations.css`

```css
/* Dashboard Animations - CSS only for Phase 1 */

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

/* Stagger delay for children */
.stagger-children > *:nth-child(1) { animation-delay: 0s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.2s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.3s; }

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
```

**global.css에 import 추가**:

```css
/* src/app/globals.css */
@import '../styles/dashboard-animations.css';
```

---

### 8.2 Tailwind 클래스 패턴

```typescript
// 일관된 스타일 패턴
const STYLES = {
  pageTitle: "text-3xl md:text-4xl font-bold tracking-tight",
  sectionTitle: "text-2xl font-semibold",
  cardTitle: "text-sm font-medium text-muted-foreground uppercase tracking-wide",
  statValue: "text-3xl md:text-4xl font-bold tabular-nums",
  body: "text-base leading-relaxed",

  card: "p-6 transition-all duration-300",
  cardHover: "hover:shadow-lg hover:-translate-y-1",

  grid1: "grid grid-cols-1 gap-4",
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
  grid3: "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6",
};
```

---

### 8.3 반응형 브레이크포인트

```typescript
// Tailwind 기본 브레이크포인트 사용
sm: '640px'   // 모바일 landscape
md: '768px'   // 태블릿
lg: '1024px'  // 소형 데스크톱
xl: '1280px'  // 대형 데스크톱

// 사용 예시
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
</div>
```

---

### 8.4 다크모드 클래스

```tsx
// shadcn-ui CSS 변수 활용 (자동 다크모드 대응)
<div className="bg-card text-card-foreground">       {/* 카드 배경 */}
<p className="text-muted-foreground">                {/* 보조 텍스트 */}
<div className="border border-border">               {/* 테두리 */}
<Button variant="default">                           {/* Primary 버튼 */}

// Recharts 다크모드
const { theme } = useTheme();
<AreaChart>
  <CartesianGrid stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
</AreaChart>
```

---

## 9. 성능 고려사항

### 9.1 애니메이션 최적화

```css
/* GPU 가속 속성만 사용 */
.animate-fade-in-up {
  /* ✅ Good: transform, opacity는 GPU 가속 */
  transform: translateY(20px);
  opacity: 0;
}

/* ❌ Bad: top, left는 reflow 유발 */
.bad-animation {
  top: 20px; /* 사용 금지 */
}
```

---

### 9.2 이미지 최적화

```tsx
// Next.js Image 컴포넌트 사용 (Phase 2에서 썸네일 추가 시)
import Image from 'next/image';

<Image
  src={article.thumbnail || '/placeholder.jpg'}
  alt=""
  width={400}
  height={225}
  className="object-cover"
  placeholder="blur"
  blurDataURL="data:image/..." // 10x10 placeholder
/>
```

---

### 9.3 React Query 캐싱

```typescript
// 대시보드 데이터는 자주 변경되지 않으므로 적절한 staleTime 설정
useQuery({
  queryKey: ["dashboardStats"],
  queryFn: fetchStats,
  staleTime: 1000 * 60 * 5, // 5분 (데이터가 신선한 것으로 간주되는 시간)
  cacheTime: 1000 * 60 * 30, // 30분 (캐시 유지 시간)
});
```

---

### 9.4 번들 크기 최적화

```typescript
// Recharts Tree-shaking (필요한 차트만 import)
import { AreaChart, Area, XAxis, YAxis } from 'recharts';
// ❌ import * from 'recharts'; (전체 import 금지)

// Dynamic import (Phase 3)
const MotionCard = dynamic(() =>
  import('framer-motion').then(m => ({ default: m.motion.div }))
);
```

---

## 10. 접근성 체크리스트

### 10.1 시맨틱 HTML

```tsx
✅ <section> 태그로 의미 있는 구역 구분
✅ <h1>, <h2> 태그로 제목 계층 구조
✅ <button> vs <div onClick> (항상 button 사용)
✅ <nav>, <main>, <article> 적절히 사용
```

---

### 10.2 ARIA 레이블

```tsx
// 아이콘 버튼에는 aria-label 또는 title 필수
<Button
  variant="ghost"
  size="icon"
  onClick={handleEdit}
  title={t('edit')}           // ✅ 툴팁 + 스크린 리더
  aria-label={t('edit')}      // ✅ 스크린 리더 전용
>
  <Pencil className="h-4 w-4" aria-hidden="true" /> {/* 아이콘은 숨김 */}
</Button>
```

---

### 10.3 키보드 네비게이션

```tsx
// 클릭 가능한 카드는 tabIndex와 onKeyDown 추가
<Card
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  role="button"
  aria-label={`${article.title} 편집하기`}
>
```

---

### 10.4 색상 대비

```typescript
// WCAG 2.1 AA 기준 준수 (4.5:1 이상)
// shadcn-ui 기본 색상은 이미 준수함

// 확인 도구:
// - Chrome DevTools > Lighthouse > Accessibility
// - WebAIM Contrast Checker
```

---

### 10.5 Reduced Motion

```css
/* CSS에서 자동 처리 */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up {
    animation: none;
  }
}
```

---

## 11. 최종 체크리스트

### Phase 1 완료 기준

- [ ] **백엔드**
  - [ ] Supabase 마이그레이션 실행 완료 (`0010_add_article_metrics.sql`)
  - [ ] `GET /api/articles/stats` 응답에 `totalViews` 포함
  - [ ] `GET /api/articles/activity` 엔드포인트 동작 확인
  - [ ] 실제 데이터로 API 테스트 완료

- [ ] **프론트엔드**
  - [ ] `WelcomeSection` 컴포넌트 생성 및 동작 확인
  - [ ] `StatsGrid` (3개 카드) 생성 및 데이터 연동
  - [ ] CSS 애니메이션 적용 및 Reduced Motion 확인
  - [ ] 모바일/태블릿/데스크톱 반응형 확인
  - [ ] 다크모드 전환 시 스타일 이상 없음

- [ ] **i18n**
  - [ ] `messages/ko.json` 업데이트
  - [ ] `messages/en.json` 업데이트
  - [ ] 모든 텍스트가 번역 키로 대체됨 (하드코딩 없음)

- [ ] **테스트**
  - [ ] 로딩 상태 정상 표시
  - [ ] 에러 상태 정상 표시
  - [ ] 빈 상태 (글 0개) 정상 표시
  - [ ] 브라우저 콘솔 에러 없음

---

### Phase 2 완료 기준

- [ ] **ActivitySection**
  - [ ] Recharts Area Chart 렌더링 확인
  - [ ] 7일/30일 기간 전환 동작
  - [ ] 다크모드 차트 색상 정상
  - [ ] 인사이트 배지 데이터 정확성

- [ ] **RecentArticlesGrid**
  - [ ] 카드 그리드 레이아웃 (1/2/3열)
  - [ ] 썸네일 placeholder 처리
  - [ ] "전체 보기" 링크 동작
  - [ ] Empty State 확인

- [ ] **통합 테스트**
  - [ ] 모든 컴포넌트 통합 후 레이아웃 이상 없음
  - [ ] 실제 사용자 플로우 테스트 (대시보드 진입 → 통계 확인 → 글 작성)

---

## 12. 다음 단계

### Phase 1 완료 후

1. **사용자 피드백 수집**
   - 내부 테스트 사용자 초대
   - 대시보드 사용성 평가
   - 필요시 Phase 2 범위 조정

2. **성능 측정**
   - Lighthouse 스코어 (목표: Performance 90+)
   - Core Web Vitals 확인
   - 번들 크기 분석 (목표: < 200KB)

3. **Phase 2 시작 여부 결정**
   - Phase 1 만으로 충분한지 평가
   - ActivityChart, ArticlesGrid 우선순위 재검토

---

### Phase 2 완료 후

1. **A/B 테스트 준비** (선택적)
   - Stats 카드 3개 vs 4개 비교
   - 차트 유무에 따른 사용자 참여도 비교

2. **데이터 추적 설정**
   - GA4 이벤트 추가 (CTA 클릭, 카드 호버 등)
   - Vercel Analytics 연동

3. **Phase 3 계획** (선택적)
   - Framer Motion 도입 검토
   - 고급 필터링/정렬 기능
   - 데이터 내보내기 (PDF 리포트)

---

## 13. 주의사항

### 13.1 코드 작성 시

1. **모든 컴포넌트는 `"use client"` 지시어 사용**
2. **next-intl `useTranslations` 훅으로 i18n 처리**
3. **Clerk `useAuth` 훅으로 인증 확인**
4. **React Query `useQuery` 훅으로 데이터 페칭**
5. **로딩/에러 상태 필수 처리**

### 13.2 스타일 작성 시

1. **Tailwind CSS 유틸리티 클래스 우선 사용**
2. **다크모드 고려 (CSS 변수 활용)**
3. **반응형 브레이크포인트 (md:, lg:)**
4. **애니메이션은 GPU 가속 속성만 (transform, opacity)**

### 13.3 API 작성 시

1. **Hono 라우터는 `/api` prefix 필수**
2. **Zod 스키마로 요청/응답 검증**
3. **도메인 결과 패턴 사용 (`DomainResult`)**
4. **에러 코드 명확히 정의 (`articleErrorCodes`)**

---

## 14. 참고 자료

- [1-plan-critic.md](./1-plan-critic.md) - 원안 검토 및 개선 방향
- [Recharts Documentation](https://recharts.org/) - 차트 라이브러리
- [shadcn-ui Documentation](https://ui.shadcn.com/) - UI 컴포넌트
- [next-intl Documentation](https://next-intl-docs.vercel.app/) - i18n
- [Tailwind CSS Documentation](https://tailwindcss.com/) - 스타일링

---

**작성 일자**: 2025-11-16
**작성자**: Implementation Plan Agent
**버전**: 1.0
**다음 단계**: Phase 1 백엔드 마이그레이션 작성
