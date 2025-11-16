# 대시보드 페이지 분석 및 개선안

## 1. 현재 상태 분석

### 1.1 페이지 구조

현재 대시보드는 다음 섹션들로 구성되어 있습니다:

```
Dashboard Page
├── WelcomeBanner (조건부 렌더링)
├── WelcomeHeader
│   ├── 환영 메시지 (사용자 이름 포함)
│   ├── 서브타이틀
│   └── "새 글 작성" CTA 버튼
├── StatsCards
│   ├── 월간 작성 글 수 / 목표 달성률
│   └── 절약된 시간
├── ActivityChart (플레이스홀더)
└── RecentArticlesList
    └── 최근 작성한 글 목록 (테이블 형식)
```

**레이아웃 특성:**
- 단일 컬럼 레이아웃 (`flex flex-col gap-8`)
- 섹션 간 고정 간격 (32px)
- 반응형: StatsCards만 `md:grid-cols-2` 적용
- 전체 페이지 패딩: `p-8` (layout.tsx에서 적용)

### 1.2 강점

#### 기술적 강점
- **명확한 데이터 흐름**: React Query를 통한 서버 상태 관리가 잘 구현됨
- **접근성 고려**: WelcomeBanner에 `role="status"`, `aria-live="polite"` 등 적용
- **로딩 상태 처리**: 모든 데이터 페칭 컴포넌트에 로딩/에러 상태 구현
- **국제화 지원**: next-intl을 통한 완전한 다국어 지원
- **타입 안전성**: TypeScript로 작성된 견고한 타입 시스템

#### UX 강점
- **온보딩 배너**: 신규 사용자를 위한 웰컴 배너 (10초 후 자동 해제, ESC 키 지원)
- **명확한 CTA**: 주요 행동 유도 버튼이 눈에 잘 띔
- **실시간 통계**: 사용자 활동 지표를 즉시 확인 가능

### 1.3 약점 및 개선 필요 부분

#### 🔴 심각한 문제점

1. **시각적 위계 부족**
   - 모든 섹션이 동일한 시각적 무게를 가짐
   - 중요도에 따른 강조가 없어 사용자의 시선 흐름이 불명확
   - Claude.ai는 Hero 섹션 → Stats → Content 순으로 명확한 위계를 구성

2. **단조로운 레이아웃**
   - 모든 섹션이 수직으로만 나열됨 (예측 가능하지만 지루함)
   - 카드 그리드가 2열로만 고정되어 있어 공간 활용이 비효율적
   - Claude.ai는 비대칭 그리드와 다양한 섹션 레이아웃을 혼합 사용

3. **애니메이션 부재**
   - WelcomeBanner를 제외하고 어떠한 진입/스크롤 애니메이션도 없음
   - 정적인 페이지로 인해 프리미엄 느낌이 전혀 없음
   - Claude.ai는 모든 섹션에 fade-in, slide-up 등의 부드러운 애니메이션 적용

4. **ActivityChart 미구현**
   - 플레이스홀더만 표시되어 전문성이 크게 떨어짐
   - 데이터 시각화가 없어 사용자 인사이트 제공 불가

5. **색상 시스템의 일관성 부족**
   - WelcomeBanner는 하드코딩된 색상 사용 (`#F0F9FF`, `#3BA2F8`)
   - 나머지 컴포넌트는 shadcn-ui 토큰 사용
   - 브랜드 정체성이 약함

#### 🟡 중요한 개선 사항

6. **인터랙티브 요소 부족**
   - StatsCards가 정적임 (호버 효과, 클릭 상호작용 없음)
   - 사용자 참여를 유도하는 인터랙티브 요소 부재

7. **빈 상태 처리 미흡**
   - RecentArticlesList의 빈 상태가 텍스트만 표시
   - 신규 사용자에게 다음 행동을 명확하게 안내하지 못함

8. **반응형 디자인 개선 필요**
   - 모바일에서 StatsCards가 수직으로만 쌓임
   - 태블릿 사이즈 최적화 부족 (md 브레이크포인트만 사용)

9. **타이포그래피 위계 불명확**
   - 헤딩 크기가 일관성 없음 (h1: text-3xl, CardTitle: text-sm)
   - 시각적 리듬 부족

10. **공간 활용 비효율**
    - 좌우 여백이 과도함 (p-8 고정)
    - 넓은 화면에서 콘텐츠가 지나치게 좁게 표시될 가능성

## 2. 개선된 페이지 구성

### 2.1 Hero Section (WelcomeHeader 개선)

**목적**: 사용자에게 강력한 첫인상을 주고 주요 행동을 유도

**메시지 전략**:
- 기존: "환영합니다, {userName}님"
- 개선: "오늘도 멋진 콘텐츠를 만들어볼까요, {userName}님?"
- 추가: 동기 부여 메시지 (일일 변경)

**개선된 구조**:
```tsx
HeroSection
├── Greeting (동적 시간 기반 인사)
├── MotivationalQuote (일일 변경)
├── QuickActions (CTA 버튼 그룹)
│   ├── Primary: "새 글 작성" (강조)
│   ├── Secondary: "AI 초안 생성" (새 기능)
│   └── Tertiary: "템플릿 둘러보기"
└── ProgressIndicator (주간 목표 진행률)
```

**디자인 특징**:
- 전체 배경 그라데이션 (`bg-gradient-to-br from-primary/5 to-accent/5`)
- 카드 형식에서 벗어나 넓은 섹션으로 변경
- 높이: `min-h-[280px]`

### 2.2 Stats Grid Section

**목적**: 핵심 지표를 한눈에 보여주고 성취감 제공

**개선된 레이아웃**:
- 기존: 2열 그리드
- 개선: 3열 반응형 그리드 (모바일 1열 → 태블릿 2열 → 데스크탑 3열)

**추가 카드**:
1. **월간 작성 글 수** (기존)
   - 추가: 전월 대비 증감률 표시 (↑ 23%)
   - 추가: 미니 라인 차트 (최근 7일 추세)

2. **절약된 시간** (기존)
   - 추가: 금액 환산 표시 ("약 240,000원 상당")
   - 추가: 진행 바 (목표 시간 대비)

3. **평균 작성 시간** (신규)
   - 글 1개당 평균 소요 시간
   - 전월 대비 효율성 개선도

4. **총 조회수** (신규)
   - 작성한 모든 글의 누적 조회수
   - 인기 상승 중인 글 표시

**인터랙티브 요소**:
- 호버 시: 카드 elevation 증가 + 부드러운 scale 애니메이션
- 클릭 시: 상세 모달 또는 해당 필터링된 글 목록으로 이동

### 2.3 Activity Insights Section

**목적**: 사용자 활동 패턴 시각화 및 인사이트 제공

**개선된 구조**:
```tsx
ActivityInsights
├── SectionHeader
│   ├── Title: "활동 인사이트"
│   └── PeriodSelector (7일/30일/90일)
├── MainChart
│   ├── AreaChart (작성한 글 수 추이)
│   └── BarChart (카테고리별 분포)
└── MiniInsights
    ├── BestPerformingDay
    ├── MostActiveCategory
    └── WritingStreak (연속 작성 일수)
```

**차트 라이브러리**: Recharts 사용 (가볍고 커스터마이징 용이)

**색상 팔레트** (차트용):
```typescript
const chartColors = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(199, 89%, 48%)", // #0EA5E9
  accent: "hsl(142, 71%, 45%)",   // #10B981
  warning: "hsl(38, 92%, 50%)",   // #F59E0B
  muted: "hsl(var(--muted))",
}
```

### 2.4 Recent Articles Section (개선)

**목적**: 최근 작성한 글을 빠르게 접근하고 관리

**개선 사항**:

1. **테이블 → 카드 그리드 전환** (모바일 친화적)
   - 기존: Table 컴포넌트
   - 개선: Grid 레이아웃 카드

2. **추가 정보 표시**:
   - 썸네일 이미지
   - 글 요약 (첫 2줄)
   - 조회수, 좋아요 수
   - 작성 진행 상태 (드래프트: 60% 완성)

3. **필터링 및 정렬**:
   - 탭: 전체 / 발행됨 / 초안
   - 정렬: 최신순 / 조회수순 / 제목순

4. **빠른 액션**:
   - 호버 시 나타나는 액션 버튼들
   - 빠른 편집 모드 (인라인 제목 수정)

### 2.5 Quick Tips Section (신규)

**목적**: 사용자에게 유용한 팁과 새로운 기능 소개

**구조**:
```tsx
QuickTips
├── TipCard (랜덤 또는 순차 표시)
│   ├── Icon
│   ├── Title
│   ├── Description
│   └── CTALink
└── DismissButton
```

**팁 예시**:
- "키워드 최적화로 SEO 점수 높이기"
- "AI 스타일 가이드 활용하기"
- "글 작성 템플릿으로 시간 절약하기"

**디자인**:
- 배경: subtle gradient border
- 애니메이션: 슬라이드 쇼 전환 효과

### 2.6 페이지 레이아웃 개선

**새로운 섹션 순서**:
```
1. WelcomeBanner (조건부)
2. HeroSection (개선된 WelcomeHeader)
3. StatsGrid (3-4열)
4. ActivityInsights (차트)
5. RecentArticles (카드 그리드)
6. QuickTips (랜덤 팁)
```

**그리드 시스템**:
```tsx
// 컨테이너 레이아웃
<div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
  {/* Hero - Full width */}
  {/* Stats - 3 column grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" />
  {/* Activity + Quick Tips - 2 column */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">{/* Activity */}</div>
    <div className="lg:col-span-1">{/* Quick Tips */}</div>
  </div>
  {/* Recent Articles - Full width */}
</div>
```

## 3. 참고 레퍼런스 (Claude.ai)

### 3.1 Hero 패턴

**Claude.ai 특징**:
- 넉넉한 수직 패딩 (py-16 ~ py-24)
- 중앙 정렬된 메시지 + CTA
- 부드러운 배경 그라데이션
- 타이틀 폰트 크기 매우 큼 (text-5xl ~ text-7xl)

**적용 방법**:
```tsx
<section className="relative py-12 md:py-16 lg:py-20 px-6 md:px-8 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border/50">
  <div className="max-w-4xl mx-auto">
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
      {/* Dynamic greeting */}
    </h1>
    <p className="mt-4 text-lg md:text-xl text-muted-foreground">
      {/* Motivational message */}
    </p>
    <div className="mt-8 flex flex-wrap gap-4">
      {/* CTA buttons */}
    </div>
  </div>
</section>
```

**차별화 포인트**:
- Claude.ai는 랜딩페이지 스타일
- 대시보드는 더 컴팩트하되 임팩트는 유지
- 사용자 맞춤화 (이름, 통계 기반 메시지)

### 3.2 Stats Cards 패턴

**Claude.ai 특징**:
- 카드 호버 시 미세한 elevation 변화
- 아이콘과 숫자의 명확한 시각적 분리
- 추세 인디케이터 (↑↓ 화살표 + 퍼센트)
- 컬러 액센트 사용 (긍정: green, 부정: red)

**적용 방법**:
```tsx
<Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      {title}
    </CardTitle>
    <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
      <Icon className="h-4 w-4" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">{value}</div>
    <div className="flex items-center gap-2 mt-2 text-sm">
      <span className={cn(
        "flex items-center gap-1 font-medium",
        trend > 0 ? "text-green-600" : "text-red-600"
      )}>
        {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(trend)}%
      </span>
      <span className="text-muted-foreground">vs last month</span>
    </div>
  </CardContent>
</Card>
```

**차별화 포인트**:
- 미니 차트 추가 (Sparkline)
- 클릭 시 상세 모달 오픈

### 3.3 Data Visualization 패턴

**Claude.ai 특징**:
- 부드러운 곡선 (curve="monotone")
- 미니멀한 그리드 라인
- 툴팁 인터랙션이 정교함
- 애니메이션 진입 효과 (차트 그려지는 애니메이션)

**적용 방법**:
```tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
    <Tooltip
      contentStyle={{
        backgroundColor: 'hsl(var(--popover))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px'
      }}
    />
    <Area
      type="monotone"
      dataKey="articles"
      stroke="hsl(var(--primary))"
      fillOpacity={1}
      fill="url(#colorValue)"
      animationDuration={1000}
    />
  </AreaChart>
</ResponsiveContainer>
```

### 3.4 Typography & Spacing 패턴

**Claude.ai 특징**:
- 넉넉한 line-height (1.6 ~ 1.8)
- 명확한 크기 계층 (4xl → 3xl → 2xl → xl → base)
- 섹션 간 여백이 일관적 (gap-12, gap-16, gap-20)
- 미디어 쿼리별 유동적 크기 조정

**적용 방법**:
```typescript
// Typography scale
const typography = {
  h1: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
  h2: "text-3xl md:text-4xl font-bold tracking-tight",
  h3: "text-2xl md:text-3xl font-semibold",
  h4: "text-xl md:text-2xl font-semibold",
  body: "text-base md:text-lg leading-relaxed",
  small: "text-sm md:text-base text-muted-foreground",
}

// Spacing scale
const spacing = {
  section: "gap-12 md:gap-16 lg:gap-20",
  container: "px-4 md:px-6 lg:px-8",
  card: "p-6 md:p-8",
  cardContent: "gap-4 md:gap-6",
}
```

### 3.5 Color & Visual Hierarchy 패턴

**Claude.ai 특징**:
- Primary 색상을 전략적으로 사용 (CTA, 강조점)
- 대부분 neutral 색상 (gray scale)
- Accent 색상으로 포인트 (success, warning 등)
- 미묘한 그라데이션 배경

**적용 방법**:
```tsx
// Color palette enhancement
const dashboardColors = {
  // Primary actions
  ctaPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
  ctaSecondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",

  // Status colors
  success: "text-green-600 bg-green-50 border-green-200",
  warning: "text-amber-600 bg-amber-50 border-amber-200",
  error: "text-red-600 bg-red-50 border-red-200",
  info: "text-blue-600 bg-blue-50 border-blue-200",

  // Backgrounds
  gradientSubtle: "bg-gradient-to-br from-primary/5 to-accent/5",
  cardHover: "hover:bg-accent/5 transition-colors",

  // Borders
  borderSubtle: "border border-border/50",
  borderAccent: "border-l-4 border-primary",
}
```

### 3.6 Animation Patterns

**Claude.ai 특징**:
- 모든 상호작용에 즉각적인 피드백
- 60fps 부드러운 애니메이션
- 미묘하지만 인지 가능한 움직임
- 로딩 상태의 스켈레톤 UI

**적용 방법**:
```tsx
// Framer Motion variants (later section에서 상세 명세)
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};
```

## 4. UI 디자인 컨셉

### 4.1 컬러 시스템

현재 시스템을 확장하여 대시보드 전용 색상 추가:

```typescript
// globals.css에 추가
const dashboardColorTokens = {
  // Status colors (in :root)
  "--status-success": "142 71% 45%",      // #10B981
  "--status-success-light": "142 71% 95%", // #D1FAE5
  "--status-warning": "38 92% 50%",       // #F59E0B
  "--status-warning-light": "38 92% 95%",  // #FEF3C7
  "--status-error": "0 84% 60%",          // Existing destructive
  "--status-error-light": "0 84% 95%",    // #FEE2E2
  "--status-info": "199 89% 48%",         // #0EA5E9
  "--status-info-light": "199 89% 95%",   // #E0F2FE

  // Chart colors
  "--chart-primary": "var(--primary)",
  "--chart-secondary": "199 89% 48%",
  "--chart-tertiary": "142 71% 45%",
  "--chart-quaternary": "38 92% 50%",
  "--chart-quinary": "280 65% 60%",

  // Gradient stops
  "--gradient-start": "var(--primary)",
  "--gradient-end": "var(--accent)",
}
```

**사용 예시**:
```tsx
// Success state
<Badge className="bg-[hsl(var(--status-success-light))] text-[hsl(var(--status-success))] border-[hsl(var(--status-success))]">
  Published
</Badge>

// Chart gradient
<linearGradient id="statsGradient" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.8}/>
  <stop offset="100%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.1}/>
</linearGradient>
```

### 4.2 타이포그래피

**폰트 패밀리**:
- 기본: Pretendard Variable (이미 적용됨)
- 숫자 강조: `font-feature-settings: 'tnum'` (tabular numbers)

**크기 계층 (개선)**:
```typescript
const typography = {
  // Display (Hero section)
  display: {
    xl: "text-6xl md:text-7xl lg:text-8xl", // 72-96px
    lg: "text-5xl md:text-6xl lg:text-7xl", // 60-84px
    md: "text-4xl md:text-5xl lg:text-6xl", // 48-72px
  },

  // Heading
  h1: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
  h2: "text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight",
  h3: "text-xl md:text-2xl lg:text-3xl font-semibold",
  h4: "text-lg md:text-xl lg:text-2xl font-medium",

  // Body
  body: {
    lg: "text-lg md:text-xl leading-relaxed",    // 18-20px
    base: "text-base md:text-lg leading-relaxed", // 16-18px
    sm: "text-sm md:text-base leading-normal",    // 14-16px
  },

  // Stats (특수)
  stat: {
    value: "text-4xl md:text-5xl font-bold tabular-nums",
    label: "text-sm font-medium text-muted-foreground uppercase tracking-wide",
    trend: "text-sm font-semibold tabular-nums",
  },
}
```

**행간 (Line Height)**:
```css
--line-height-tight: 1.2;    /* Headings */
--line-height-normal: 1.5;   /* Body text */
--line-height-relaxed: 1.75; /* Long-form content */
```

**자간 (Letter Spacing)**:
```css
--tracking-tighter: -0.05em; /* Large headings */
--tracking-tight: -0.025em;  /* Medium headings */
--tracking-normal: 0;        /* Body text */
--tracking-wide: 0.05em;     /* Small caps, labels */
```

### 4.3 간격 시스템

**일관된 간격 적용**:
```typescript
const spacing = {
  // Section spacing (vertical)
  section: {
    xs: "gap-4",          // 16px - Compact sections
    sm: "gap-6",          // 24px - Related items
    md: "gap-8",          // 32px - Default sections
    lg: "gap-12",         // 48px - Major sections
    xl: "gap-16",         // 64px - Hero sections
  },

  // Container padding
  container: {
    mobile: "px-4",       // 16px
    tablet: "px-6",       // 24px
    desktop: "px-8",      // 32px
    wide: "px-12",        // 48px
  },

  // Card internal spacing
  card: {
    compact: "p-4",       // 16px
    default: "p-6",       // 24px
    comfortable: "p-8",   // 32px
  },

  // Element spacing
  element: {
    xs: "gap-1",          // 4px - Icon + text
    sm: "gap-2",          // 8px - Button content
    md: "gap-4",          // 16px - Form fields
    lg: "gap-6",          // 24px - Card sections
  },
}
```

**적용 원칙**:
- 8px 기반 그리드 시스템 (Tailwind default)
- 모바일 → 데스크탑으로 갈수록 간격 증가
- 관련도가 높을수록 간격 감소

### 4.4 카드 스타일

**Card 변형 정의**:

```tsx
// 1. Default Card (현재 사용 중)
<Card className="border border-border bg-card shadow-sm">
  {/* Content */}
</Card>

// 2. Elevated Card (Stats, 호버 가능한 카드)
<Card className="border border-border bg-card shadow-md hover:shadow-lg transition-shadow duration-300">
  {/* Content */}
</Card>

// 3. Outline Card (덜 중요한 정보)
<Card className="border-2 border-dashed border-border/50 bg-transparent">
  {/* Content */}
</Card>

// 4. Gradient Border Card (강조)
<Card className="relative border-0 bg-gradient-to-br from-primary/10 to-accent/10 before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-br before:from-primary before:to-accent before:-z-10">
  {/* Content */}
</Card>

// 5. Interactive Card (클릭 가능)
<Card className="group cursor-pointer border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
  {/* Content */}
</Card>
```

**그림자 계층**:
```css
/* Tailwind CSS 기본 활용 */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

**라운드 코너**:
```typescript
// 현재 시스템 유지 (--radius: 0.5rem = 8px)
const borderRadius = {
  sm: "calc(var(--radius) - 4px)",  // 4px
  md: "calc(var(--radius) - 2px)",  // 6px
  lg: "var(--radius)",              // 8px
  xl: "calc(var(--radius) + 4px)",  // 12px
  "2xl": "calc(var(--radius) + 8px)", // 16px
}
```

### 4.5 다크모드 고려사항

**현재 시스템 검토**:
- `darkMode: "class"` 설정됨
- CSS variables로 색상 정의되어 있음 (Good!)

**개선 사항**:

1. **차트 색상 다크모드 대응**:
```css
.dark {
  /* Chart colors - slightly brighter for dark mode */
  --chart-primary: 240 5% 84%;      /* Lighter primary */
  --chart-secondary: 199 89% 58%;   /* Brighter blue */
  --chart-tertiary: 142 71% 55%;    /* Brighter green */
}
```

2. **그림자 다크모드**:
```css
.dark {
  /* Softer shadows for dark mode */
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
}
```

3. **카드 배경 레이어링**:
```tsx
// Light mode: white cards on gray background
// Dark mode: elevated dark cards on darker background
<Card className="bg-card dark:bg-card/50 backdrop-blur-sm">
  {/* Better depth perception in dark mode */}
</Card>
```

## 5. 섹션별 컴포넌트 명세

### 5.1 Hero Section

#### **HeroSection Component**
- **파일**: `src/components/dashboard/hero-section.tsx`
- **Props**:
```typescript
interface HeroSectionProps {
  userName: string;
  weeklyProgress: {
    current: number;
    target: number;
  };
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}
```

- **하위 컴포넌트**:

##### **DynamicGreeting**
```typescript
// src/components/dashboard/hero-section/dynamic-greeting.tsx
interface DynamicGreetingProps {
  userName: string;
}

// 시간대별 인사말 로직
function getGreeting(hour: number): string {
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "좋은 오후에요";
  return "좋은 저녁이에요";
}
```

##### **MotivationalQuote**
```typescript
// src/components/dashboard/hero-section/motivational-quote.tsx
interface MotivationalQuoteProps {
  variant?: 'default' | 'achievement' | 'encouragement';
}

const quotes = [
  { text: "오늘 하루도 멋진 콘텐츠를 만들어봐요!", type: 'default' },
  { text: "지난주보다 23% 더 생산적이에요! 🎉", type: 'achievement' },
  { text: "꾸준함이 만드는 기적을 믿어요", type: 'encouragement' },
];
```

##### **QuickActionButtons**
```typescript
// src/components/dashboard/hero-section/quick-action-buttons.tsx
interface QuickActionButtonsProps {
  onNewArticle: () => void;
  onAIDraft?: () => void;
  onTemplates?: () => void;
}

// Buttons:
// 1. Primary CTA: "새 글 작성" (bg-primary, prominent)
// 2. Secondary: "AI 초안 생성" (outline, with sparkles icon)
// 3. Tertiary: "템플릿 보기" (ghost)
```

##### **WeeklyProgressBar**
```typescript
// src/components/dashboard/hero-section/weekly-progress-bar.tsx
interface WeeklyProgressBarProps {
  current: number;
  target: number;
  label?: string;
}

// Visual: Horizontal progress bar with gradient fill
// Shows: "이번 주 5/10 글 작성 (50%)"
```

### 5.2 Stats Grid Section

#### **StatsGrid Component**
- **파일**: `src/components/dashboard/stats-grid.tsx`
- **Props**:
```typescript
interface StatsGridProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

interface DashboardStats {
  monthlyArticles: {
    current: number;
    target: number;
    trend: number; // percentage
    history: Array<{ date: string; count: number }>; // last 7 days
  };
  savedTime: {
    hours: number;
    monetaryValue: number;
    trend: number;
  };
  averageWritingTime: {
    minutes: number;
    trend: number;
  };
  totalViews: {
    count: number;
    trend: number;
    topArticle?: {
      title: string;
      views: number;
    };
  };
}
```

- **하위 컴포넌트**:

##### **StatCard**
```typescript
// src/components/dashboard/stats-grid/stat-card.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
  description?: string;
  miniChart?: Array<{ label: string; value: number }>;
  onClick?: () => void;
}

// Features:
// - Hover animation (scale + shadow)
// - Click handler for detailed modal
// - Optional mini sparkline chart
// - Trend indicator with color coding
```

##### **TrendIndicator**
```typescript
// src/components/dashboard/stats-grid/trend-indicator.tsx
interface TrendIndicatorProps {
  value: number; // percentage
  period?: string; // "vs last month"
  showIcon?: boolean;
}

// Visual:
// Positive: green color + TrendingUp icon
// Negative: red color + TrendingDown icon
// Neutral: gray color + Minus icon
```

##### **MiniSparkline**
```typescript
// src/components/dashboard/stats-grid/mini-sparkline.tsx
import { Sparklines, SparklinesLine } from 'react-sparklines';

interface MiniSparklineProps {
  data: number[];
  color?: string;
}

// Ultra-minimal line chart (no axes, no labels)
// Height: 40px
// Smooth curve
```

### 5.3 Activity Insights Section

#### **ActivityInsights Component**
- **파일**: `src/components/dashboard/activity-insights.tsx`
- **Props**:
```typescript
interface ActivityInsightsProps {
  data: ActivityData[];
  period: '7d' | '30d' | '90d';
  onPeriodChange: (period: '7d' | '30d' | '90d') => void;
}

interface ActivityData {
  date: string;
  articlesCreated: number;
  timeSpent: number; // minutes
  categories: Record<string, number>;
}
```

- **하위 컴포넌트**:

##### **PeriodSelector**
```typescript
// src/components/dashboard/activity-insights/period-selector.tsx
interface PeriodSelectorProps {
  selected: '7d' | '30d' | '90d';
  onChange: (period: '7d' | '30d' | '90d') => void;
}

// UI: Segmented control (button group)
// Style: bg-muted, active button has bg-background + shadow
```

##### **ArticlesTrendChart**
```typescript
// src/components/dashboard/activity-insights/articles-trend-chart.tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ArticlesTrendChartProps {
  data: Array<{ date: string; count: number }>;
}

// Configuration:
// - Type: Area chart with gradient fill
// - Color: primary
// - Height: 300px (mobile), 350px (desktop)
// - Animation: 1000ms ease-out
// - Tooltip: Custom styled
```

##### **CategoryDistributionChart**
```typescript
// src/components/dashboard/activity-insights/category-distribution-chart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryDistributionChartProps {
  data: Array<{ category: string; count: number }>;
}

// Configuration:
// - Type: Horizontal bar chart
// - Colors: Different color per category
// - Shows top 5 categories
```

##### **InsightCard**
```typescript
// src/components/dashboard/activity-insights/insight-card.tsx
interface InsightCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  description?: string;
}

// Examples:
// - "가장 활발한 요일: 수요일"
// - "주로 작성하는 카테고리: 기술"
// - "연속 작성 일수: 7일 🔥"
```

### 5.4 Recent Articles Section

#### **RecentArticles Component**
- **파일**: `src/components/dashboard/recent-articles.tsx`
- **Props**:
```typescript
interface RecentArticlesProps {
  articles: Article[];
  isLoading?: boolean;
  onFilter: (filter: ArticleFilter) => void;
  onSort: (sort: ArticleSort) => void;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  thumbnail?: string;
  status: 'published' | 'draft';
  progress?: number; // 0-100 for drafts
  createdAt: string;
  views: number;
  likes: number;
}

type ArticleFilter = 'all' | 'published' | 'draft';
type ArticleSort = 'latest' | 'views' | 'title';
```

- **하위 컴포넌트**:

##### **ArticleCard**
```typescript
// src/components/dashboard/recent-articles/article-card.tsx
interface ArticleCardProps {
  article: Article;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Layout:
// - Thumbnail (left or top on mobile)
// - Title + excerpt
// - Status badge
// - Views & likes
// - Action buttons (hover reveal)
```

##### **FilterTabs**
```typescript
// src/components/dashboard/recent-articles/filter-tabs.tsx
interface FilterTabsProps {
  active: ArticleFilter;
  counts: { all: number; published: number; draft: number };
  onChange: (filter: ArticleFilter) => void;
}

// Style: Horizontal tabs with count badges
```

##### **SortDropdown**
```typescript
// src/components/dashboard/recent-articles/sort-dropdown.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SortDropdownProps {
  value: ArticleSort;
  onChange: (sort: ArticleSort) => void;
}
```

##### **EmptyState**
```typescript
// src/components/dashboard/recent-articles/empty-state.tsx
interface EmptyStateProps {
  filter: ArticleFilter;
  onCreateNew: () => void;
}

// Visual:
// - Illustration (SVG or icon)
// - Heading: "아직 작성한 글이 없어요"
// - Description: "첫 글을 작성해보세요!"
// - CTA button: "새 글 작성하기"
```

### 5.5 Quick Tips Section

#### **QuickTips Component**
- **파일**: `src/components/dashboard/quick-tips.tsx`
- **Props**:
```typescript
interface QuickTipsProps {
  tips: Tip[];
  currentIndex?: number;
  autoRotate?: boolean;
  rotationInterval?: number; // milliseconds
}

interface Tip {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
}
```

- **하위 컴포넌트**:

##### **TipCard**
```typescript
// src/components/dashboard/quick-tips/tip-card.tsx
interface TipCardProps {
  tip: Tip;
  onDismiss?: () => void;
}

// Layout:
// - Icon (top-left, colored circle background)
// - Title (bold, medium size)
// - Description (2-3 lines)
// - Optional CTA link (underline on hover)
// - Dismiss button (top-right)

// Style:
// - Gradient border (subtle)
// - Soft shadow
```

##### **CarouselDots**
```typescript
// src/components/dashboard/quick-tips/carousel-dots.tsx
interface CarouselDotsProps {
  total: number;
  active: number;
  onDotClick: (index: number) => void;
}

// Visual: Horizontal dots indicator
// Active dot: larger + primary color
```

### 5.6 Data 타입 정의

**중앙 타입 파일**: `src/features/dashboard/types.ts`

```typescript
// Complete type definitions for dashboard
export interface DashboardData {
  user: UserInfo;
  stats: DashboardStats;
  activity: ActivityData[];
  recentArticles: Article[];
  tips: Tip[];
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

export interface DashboardStats {
  monthlyArticles: MonthlyArticlesStats;
  savedTime: SavedTimeStats;
  averageWritingTime: AverageTimeStats;
  totalViews: ViewsStats;
}

export interface MonthlyArticlesStats {
  current: number;
  target: number;
  trend: number;
  history: DataPoint[];
}

export interface SavedTimeStats {
  hours: number;
  monetaryValue: number;
  trend: number;
}

export interface AverageTimeStats {
  minutes: number;
  trend: number;
}

export interface ViewsStats {
  count: number;
  trend: number;
  topArticle?: {
    title: string;
    views: number;
  };
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface ActivityData {
  date: string;
  articlesCreated: number;
  timeSpent: number;
  categories: Record<string, number>;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  thumbnail?: string;
  status: 'published' | 'draft';
  progress?: number;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  category?: string;
}

export interface Tip {
  id: string;
  icon: string; // Lucide icon name
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
  category: 'feature' | 'tip' | 'tutorial';
}
```

## 6. 애니메이션 명세 (Framer Motion)

### 6.1 설치 및 설정

```bash
pnpm add framer-motion
```

**Provider 설정** (이미 Client Component이므로 불필요):
```tsx
// All dashboard components are client components
// No need for additional provider
```

### 6.2 공통 Animation Variants

**파일**: `src/components/dashboard/animations.ts`

```typescript
import { Variants } from 'framer-motion';

// Fade in from bottom (most common)
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0], // Custom easing
    }
  }
};

// Fade in (simple)
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

// Scale in (for cards)
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// Stagger container (for lists/grids)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -30
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

// Slide in from right
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 30
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};
```

### 6.3 HeroSection Animations

**파일**: `src/components/dashboard/hero-section.tsx`

```tsx
"use client";

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from './animations';

export function HeroSection({ userName, weeklyProgress, onPrimaryAction }: HeroSectionProps) {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative py-12 md:py-16 lg:py-20 px-6 md:px-8 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border/50"
    >
      <div className="max-w-4xl mx-auto">
        {/* Greeting */}
        <motion.div variants={fadeInUp}>
          <DynamicGreeting userName={userName} />
        </motion.div>

        {/* Motivational Quote */}
        <motion.div variants={fadeInUp}>
          <MotivationalQuote />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div variants={fadeInUp}>
          <QuickActionButtons onNewArticle={onPrimaryAction} />
        </motion.div>

        {/* Progress Bar */}
        <motion.div variants={fadeInUp}>
          <WeeklyProgressBar {...weeklyProgress} />
        </motion.div>
      </div>
    </motion.section>
  );
}
```

**Button Hover Animation**:
```tsx
// QuickActionButtons component
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
  <Button size="lg" className="...">
    새 글 작성
  </Button>
</motion.div>
```

### 6.4 StatsGrid Animations

**파일**: `src/components/dashboard/stats-grid.tsx`

```tsx
"use client";

import { motion } from 'framer-motion';
import { staggerContainer, scaleIn } from './animations';

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading) return <StatsGridSkeleton />;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
    >
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.id}
          variants={scaleIn}
          custom={index}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

**StatCard Hover & Click**:
```tsx
// StatCard component
<motion.div
  whileHover={{
    y: -4,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
  }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
>
  <Card className="cursor-pointer">
    {/* Content */}
  </Card>
</motion.div>
```

**Trend Indicator Animation**:
```tsx
// TrendIndicator component
<motion.div
  initial={{ opacity: 0, scale: 0.5 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 0.5, type: 'spring' }}
  className="flex items-center gap-1"
>
  <TrendingUp className="h-3 w-3 text-green-600" />
  <span>+23%</span>
</motion.div>
```

### 6.5 ActivityChart Animations

**파일**: `src/components/dashboard/activity-insights/articles-trend-chart.tsx`

```tsx
"use client";

import { motion } from 'framer-motion';
import { AreaChart, Area } from 'recharts';

export function ArticlesTrendChart({ data }: ArticlesTrendChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            fill="url(#gradient)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
```

**Chart Path Drawing Animation**:
Recharts가 자동으로 제공하는 `animationDuration` 사용

### 6.6 RecentArticles Animations

**파일**: `src/components/dashboard/recent-articles.tsx`

```tsx
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../animations';

export function RecentArticles({ articles, filter }: RecentArticlesProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {articles.map((article) => (
            <motion.div
              key={article.id}
              variants={fadeInUp}
              layout
            >
              <ArticleCard article={article} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
```

**ArticleCard Hover**:
```tsx
// ArticleCard component
<motion.div
  whileHover={{ scale: 1.02, y: -2 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  <Card>
    {/* Content */}
  </Card>
</motion.div>
```

**Action Buttons Reveal on Hover**:
```tsx
// Inside ArticleCard
<motion.div
  initial={{ opacity: 0, x: 10 }}
  whileHover={{ opacity: 1, x: 0 }}
  className="absolute top-4 right-4 flex gap-2"
>
  <Button size="icon" variant="ghost">
    <Eye className="h-4 w-4" />
  </Button>
  <Button size="icon" variant="ghost">
    <Pencil className="h-4 w-4" />
  </Button>
</motion.div>
```

### 6.7 QuickTips Carousel Animation

**파일**: `src/components/dashboard/quick-tips.tsx`

```tsx
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function QuickTips({ tips, autoRotate = true }: QuickTipsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tips.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [tips.length, autoRotate]);

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
        >
          <TipCard tip={tips[currentIndex]} />
        </motion.div>
      </AnimatePresence>

      <CarouselDots
        total={tips.length}
        active={currentIndex}
        onDotClick={setCurrentIndex}
      />
    </div>
  );
}
```

### 6.8 Loading States (Skeleton)

**파일**: `src/components/dashboard/skeletons.tsx`

```tsx
"use client";

import { motion } from 'framer-motion';

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <motion.div
          className="h-4 w-32 bg-muted rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="h-10 w-10 bg-muted rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </CardHeader>
      <CardContent>
        <motion.div
          className="h-8 w-24 bg-muted rounded mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="h-4 w-full bg-muted rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </CardContent>
    </Card>
  );
}
```

### 6.9 Scroll-based Animations

**파일**: `src/components/dashboard/page.tsx`

```tsx
"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function DashboardContent() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div ref={ref} className="flex flex-col gap-8">
      {/* Hero with parallax fade */}
      <motion.div style={{ opacity }}>
        <HeroSection {...heroProps} />
      </motion.div>

      {/* Rest of content */}
      <StatsGrid {...statsProps} />
      <ActivityInsights {...activityProps} />
      <RecentArticles {...articlesProps} />
    </div>
  );
}
```

### 6.10 성능 최적화

**will-change 사용**:
```tsx
// For frequently animated elements
<motion.div
  style={{ willChange: 'transform' }}
  whileHover={{ scale: 1.05 }}
>
  {/* Content */}
</motion.div>
```

**layoutId for Shared Element Transitions**:
```tsx
// When transitioning between layouts
<motion.div layoutId="article-123">
  <ArticleCard />
</motion.div>

// Later in detail view
<motion.div layoutId="article-123">
  <ArticleDetail />
</motion.div>
```

**Reduce Motion Preference**:
```tsx
import { useReducedMotion } from 'framer-motion';

export function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : fadeInUp;

  return (
    <motion.div variants={variants}>
      {/* Content */}
    </motion.div>
  );
}
```

## 7. 구현 우선순위

### Phase 1: 핵심 개선 (1주차)
1. **HeroSection 재구현** ⭐⭐⭐
   - 동적 인사말, CTA 버튼 그룹, 주간 진행률 바
   - 이유: 첫인상이 가장 중요

2. **StatsGrid 개선** ⭐⭐⭐
   - 3-4열 그리드, 추세 인디케이터, 호버 애니메이션
   - 이유: 사용자 참여도 직접적으로 증가

3. **기본 애니메이션 적용** ⭐⭐
   - Framer Motion 설치 및 fadeInUp, staggerContainer 적용
   - 이유: 프리미엄 느낌 즉시 개선

### Phase 2: 기능 확장 (2주차)
4. **ActivityChart 실제 구현** ⭐⭐⭐
   - Recharts로 Area Chart 구현
   - 이유: 현재 플레이스홀더로 인한 전문성 부족 해결

5. **RecentArticles 카드 그리드 전환** ⭐⭐
   - 테이블 → 카드 레이아웃
   - 필터링 및 정렬 기능
   - 이유: 모바일 UX 대폭 개선

6. **QuickTips 섹션 추가** ⭐
   - 유용한 팁 표시 및 캐러셀
   - 이유: 사용자 교육 및 기능 발견 향상

### Phase 3: 세부 완성 (3주차)
7. **고급 애니메이션 적용** ⭐⭐
   - 스크롤 기반 애니메이션
   - Shared element transitions
   - 이유: Claude.ai 수준의 인터랙션 달성

8. **반응형 최적화** ⭐⭐
   - 태블릿 브레이크포인트 추가
   - 모바일 간격 조정
   - 이유: 모든 디바이스에서 완벽한 경험

9. **빈 상태 개선** ⭐
   - 일러스트레이션 추가
   - 명확한 CTA
   - 이유: 신규 사용자 온보딩 개선

### Phase 4: 폴리시 (4주차)
10. **다크모드 최적화** ⭐
    - 차트 색상 조정
    - 그림자 및 레이어링 개선
    - 이유: 전문가 사용자 만족도

11. **성능 최적화** ⭐
    - 애니메이션 will-change 적용
    - Reduced motion 지원
    - 이유: 접근성 및 성능

12. **마이크로 인터랙션** ⭐
    - 버튼 호버 효과 세밀화
    - 로딩 스피너 커스터마이징
    - 이유: 디테일이 만드는 차이

## 8. 성공 지표

### 기술적 지표
- [ ] **Lighthouse Performance Score**: 90+ (현재: 측정 필요)
- [ ] **Lighthouse Accessibility Score**: 100 (현재: 추정 95+)
- [ ] **First Contentful Paint (FCP)**: < 1.5s
- [ ] **Largest Contentful Paint (LCP)**: < 2.5s
- [ ] **Cumulative Layout Shift (CLS)**: < 0.1
- [ ] **모든 애니메이션 60fps 유지**

### UX 지표
- [ ] **Claude.ai 수준의 시각적 완성도**: 동료 개발자 5명 중 4명 이상 동의
- [ ] **명확한 가치 제안**: 신규 사용자가 3초 내에 주요 기능 파악 가능
- [ ] **부드러운 애니메이션**: 모든 상호작용에 즉각적 시각적 피드백
- [ ] **모바일 최적화**: 스마트폰에서 모든 기능 접근 가능
- [ ] **접근성 준수**: WCAG 2.1 AA 기준 충족
- [ ] **다국어 지원**: 한국어/영어 완벽 지원 (이미 달성)

### 비즈니스 지표
- [ ] **대시보드 체류 시간**: 평균 2분 이상 (현재 측정 필요)
- [ ] **주요 CTA 클릭률**: "새 글 작성" 버튼 30% 이상
- [ ] **활성 사용자 증가**: 주간 활성 사용자 20% 증가
- [ ] **이탈률 감소**: 대시보드에서 이탈률 10% 감소

### 코드 품질 지표
- [ ] **타입 안전성**: TypeScript 에러 0개
- [ ] **테스트 커버리지**: 주요 컴포넌트 80% 이상
- [ ] **번들 크기**: 대시보드 페이지 < 200KB (gzip)
- [ ] **재사용 가능한 컴포넌트**: 80% 이상이 다른 페이지에서 재사용 가능

## 9. 추가 권장 사항

### 9.1 백엔드 API 개선
현재 `useDashboardStats`와 `useListArticles`만 존재하는데, 다음 엔드포인트 추가 필요:

```typescript
// src/features/articles/backend/route.ts에 추가

// 1. Activity data endpoint
app.get('/api/articles/activity', async (c) => {
  const { period = '7d' } = c.req.query();
  // Return activity data for the specified period
});

// 2. Category distribution endpoint
app.get('/api/articles/categories/distribution', async (c) => {
  // Return category counts
});

// 3. Writing insights endpoint
app.get('/api/articles/insights', async (c) => {
  // Return best performing day, streak, etc.
});
```

### 9.2 추가 기능 제안

1. **데이터 내보내기**: 사용자 통계를 CSV/PDF로 다운로드
2. **목표 설정**: 사용자가 월간 목표를 직접 설정 가능
3. **알림 시스템**: 목표 달성 시 축하 메시지
4. **소셜 공유**: 통계를 SNS에 공유 (예: "이번 달 10개 글 작성 달성!")

### 9.3 A/B 테스트 아이디어

- HeroSection 메시지 변형 (동기부여 vs 정보 전달)
- StatsCard 레이아웃 (2열 vs 3열 vs 4열)
- 차트 타입 (Area vs Line vs Bar)
- CTA 버튼 색상 (Primary vs Accent vs Custom)

### 9.4 접근성 체크리스트

- [ ] 모든 인터랙티브 요소에 키보드 접근 가능
- [ ] Focus 상태 명확하게 표시
- [ ] 색상 대비비 4.5:1 이상 (WCAG AA)
- [ ] 스크린 리더 테스트 (VoiceOver, NVDA)
- [ ] ARIA 라벨 모든 차트 및 그래프에 추가
- [ ] Reduced motion preference 존중

---

**작성 일자**: 2025-11-16
**작성자**: Claude Code Agent
**버전**: 1.0
**다음 단계**: `1-plan.md` 작성 (세부 구현 계획)
