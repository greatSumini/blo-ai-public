# 대시보드 페이지 분석 및 개선안

## 1. 현재 상태 분석

### 1.1 페이지 구조

대시보드 페이지는 다음과 같은 섹션으로 구성되어 있습니다:

1. **WelcomeBanner** - 신규 사용자 환영 배너 (조건부 표시)
2. **WelcomeSection** - 사용자 인사말 및 CTA 버튼
3. **StatsGrid** - 통계 카드 3개 (월간 게시물, 절약 시간, 총 조회수)
4. **RecentArticlesGrid** - 최근 게시물 카드 그리드 (최대 6개)

### 1.2 강점

- **명확한 정보 계층**: 환영 → 통계 → 최근 게시물로 자연스러운 흐름
- **반응형 그리드 시스템**: 모바일(1열) → 태블릿(2열) → 데스크탑(3열) 적절히 대응
- **애니메이션 적용**: `animate-fade-in-up` 클래스로 진입 애니메이션 구현
- **접근성 고려**: WelcomeBanner에 ESC 키 핸들링, ARIA 속성 적용
- **다국어 지원**: `next-intl`을 통한 완전한 i18n 지원

### 1.3 약점 및 개선 필요 부분

#### 색상 & 테마 위반

1. **WelcomeBanner의 하드코딩된 색상** (심각)
   - ❌ `bg-[#F0F9FF]`, `border-[#3BA2F8]`, `text-[#3BA2F8]` 등 직접 hex 색상 사용
   - ❌ 다크 모드 미지원 (라이트 모드 전용 색상)
   - ❌ Design Guide의 "의미론적 색상 토큰 사용" 원칙 위반

2. **StatCard의 하드코딩된 색상** (중간)
   - ❌ `text-green-600`, `text-red-600` 직접 사용
   - ⚠️ 다크 모드에서 대비 부족 가능성

3. **ArticleCard의 Badge 색상** (중간)
   - ❌ `bg-yellow-100`, `bg-green-100` 등 하드코딩된 색상
   - ⚠️ Design Guide의 색상 시스템 미준수

#### 타이포그래피 위반

1. **WelcomeSection 제목** (경미)
   - ⚠️ `text-3xl md:text-4xl` 사용 (Design Guide는 `text-4xl md:text-5xl` 권장)
   - ⚠️ `font-bold` 사용 (Design Guide는 `font-medium` 권장)

2. **직접 지정된 폰트 크기** (경미)
   - ❌ WelcomeBanner: `text-[16px]`, `text-[14px]` 등 정의되지 않은 크기

#### 간격 시스템 위반

1. **불규칙한 패딩** (경미)
   - ⚠️ WelcomeSection: `pb-6` (Design Guide는 섹션 간격 `gap-8` 권장)
   - ⚠️ StatCard: `p-6` (일관성 있으나 섹션 레벨에서는 `py-16 md:py-24` 필요)

#### 레이아웃 문제

1. **컨테이너 래핑 부재** (중간)
   - ❌ 페이지 최상위에 `container mx-auto px-4 md:px-6 max-w-7xl` 없음
   - ❌ 좌우 여백 없이 전체 너비 사용 가능성

2. **섹션 간격 일관성** (경미)
   - ⚠️ `gap-8` 사용 (적절하나 Design Guide는 `gap-12` 또는 `gap-16` 권장)

#### 애니메이션 문제

1. **인라인 스타일 사용** (중간)
   - ❌ `style={{ animationDelay: '0.1s' }}` - 인라인 스타일보다 CSS 클래스 권장
   - ⚠️ `motion-reduce:transition-none` 미적용 (접근성 위반)

2. **WelcomeBanner 애니메이션 duration** (경미)
   - ⚠️ `duration-250` 사용 (Design Guide는 `duration-300` 권장)

#### 접근성 문제

1. **키보드 네비게이션** (중간)
   - ⚠️ `focus-visible:ring-2` 누락된 버튼 존재
   - ⚠️ `focus-visible:ring-offset-2` 미적용

2. **ARIA 속성 부족** (경미)
   - ⚠️ StatCard의 아이콘에 `aria-hidden="true"` 누락
   - ⚠️ ArticleCard의 상태 Badge에 `role="status"` 고려 필요

3. **색상 대비** (중간)
   - ⚠️ `text-muted-foreground` 일부 요소에서 4.5:1 미만 가능성
   - ❌ WelcomeBanner 다크 모드 미지원으로 대비 확인 불가

---

## 2. 개선된 페이지 구성

### 2.1 전체 레이아웃 개선

```tsx
// dashboard/page.tsx
export default function DashboardPage({ params }: DashboardPageProps) {
  void params;

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

// DashboardContent
return (
  <div className="flex flex-col gap-12 py-8 md:py-12">
    {showWelcomeBanner && (
      <WelcomeBanner onDismiss={handleDismissBanner} />
    )}
    <WelcomeSection {...} />
    <StatsGrid stats={stats} />
    <RecentArticlesGrid {...} />
  </div>
);
```

**변경 사항:**
- ✅ `container mx-auto px-4 md:px-6 max-w-7xl` 래핑
- ✅ `gap-8` → `gap-12` (섹션 간격 증가)
- ✅ `py-8 md:py-12` 상하 패딩 추가

---

## 3. 색상 시스템 개선

### 3.1 WelcomeBanner 색상 수정

**현재 문제:**
```tsx
// ❌ 하드코딩된 hex 색상
bg-[#F0F9FF]
border-[#3BA2F8]
text-[#3BA2F8]
text-[#1E2A38]
text-[#374151]
text-[#6B7280]
```

**개선 방안:**
```tsx
// ✅ 의미론적 색상 토큰 사용
className="
  bg-blue-50 dark:bg-blue-950/20
  border-l-4 border-blue-500 dark:border-blue-400
  rounded-lg
  p-4 md:p-6
  shadow-sm
"

// 아이콘
<Sparkles className="w-5 h-5 text-blue-500 dark:text-blue-400" />

// 제목
<h3 className="text-base font-semibold text-foreground">

// 본문
<p className="text-sm text-muted-foreground leading-relaxed">

// 버튼 (주요 CTA)
<button className="
  bg-accent hover:bg-accent/90
  text-accent-foreground
  px-6 py-2.5
  rounded-lg
  text-sm font-medium
  transition-all duration-100
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-accent
  focus-visible:ring-offset-2
  motion-reduce:transition-none
">

// 닫기 버튼
<button className="
  p-2
  text-muted-foreground
  hover:text-foreground
  hover:bg-secondary
  rounded-lg
  transition-colors duration-100
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-accent
  focus-visible:ring-offset-2
  motion-reduce:transition-none
">
```

**정당화:**
- ✅ `bg-blue-50 dark:bg-blue-950/20`: 정보 배너의 표준 색상 (blue = info)
- ✅ `border-blue-500 dark:border-blue-400`: 다크 모드에서 대비 확보
- ✅ `text-foreground`, `text-muted-foreground`: CSS 변수 기반 자동 테마 전환
- ✅ `bg-accent`: 주요 CTA는 브랜드 액센트 색상 사용 (#C46849)

### 3.2 StatCard 색상 수정

**현재 문제:**
```tsx
// ❌ 하드코딩된 색상
<span className={`... ${
  change.isPositive ? 'text-green-600' : 'text-red-600'
}`}>

// ❌ 다크 모드 미고려
<div className="p-2 bg-primary/10 rounded-lg">
  <Icon className="w-5 h-5 text-primary" />
</div>
```

**개선 방안:**
```tsx
// ✅ 의미론적 색상 + 다크 모드 지원
<span className={`inline-flex items-center text-sm font-medium ${
  change.isPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400'
}`}>

// ✅ 배경색 대비 개선
<div className="p-2 bg-accent/10 dark:bg-accent/20 rounded-lg">
  <Icon className="w-5 h-5 text-accent" />
</div>
```

**정당화:**
- ✅ `dark:text-green-400`, `dark:text-red-400`: 다크 모드 대비 확보
- ✅ `bg-accent/10`: 아이콘 배경은 브랜드 액센트 색상 사용

### 3.3 ArticleCard Badge 색상 수정

**현재 문제:**
```tsx
// ❌ 하드코딩된 배경색
const statusColors = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};
```

**개선 방안:**
```tsx
// ✅ shadcn Badge variant 활용 + 커스텀 색상
const statusConfig = {
  draft: {
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800'
  },
  published: {
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400 border-green-300 dark:border-green-800'
  },
  archived: {
    variant: 'secondary' as const,
    className: 'bg-muted text-muted-foreground border-border'
  },
};

// 사용
<Badge
  variant={statusConfig[article.status].variant}
  className={statusConfig[article.status].className}
>
  {t(`status.${article.status}`)}
</Badge>
```

**정당화:**
- ✅ 다크 모드에서 배경 대비 개선 (`dark:bg-yellow-950/50`)
- ✅ 테두리 추가로 상태 구분 명확화
- ✅ archived는 의미론적 색상 사용

---

## 4. 타이포그래피 개선

### 4.1 WelcomeSection 제목 수정

**현재:**
```tsx
<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
```

**개선:**
```tsx
<h1 className="text-4xl md:text-5xl font-medium leading-tight text-foreground">
  {greeting}
</h1>
```

**변경 사항:**
- ✅ `text-3xl md:text-4xl` → `text-4xl md:text-5xl` (Design Guide 준수)
- ✅ `font-bold` → `font-medium` (Claude.ai 스타일)
- ✅ `tracking-tight` 유지, `leading-tight` 추가

### 4.2 본문 텍스트 개선

**현재:**
```tsx
<p className="text-muted-foreground mt-2">
  {subtext}
</p>
```

**개선:**
```tsx
<p className="text-lg leading-relaxed text-muted-foreground mt-3">
  {subtext}
</p>
```

**변경 사항:**
- ✅ `text-lg` 추가 (Design Guide body1)
- ✅ `leading-relaxed` 추가 (가독성 향상)
- ✅ `mt-2` → `mt-3` (간격 조정)

### 4.3 WelcomeBanner 타이포그래피 수정

**현재:**
```tsx
<h3 className="text-[16px] font-semibold text-[#1E2A38] mb-1">
<p className="text-[14px] text-[#374151] leading-[1.5]">
```

**개선:**
```tsx
<h3 className="text-base font-semibold text-foreground mb-2">
  {t("title")}
</h3>
<p className="text-sm text-muted-foreground leading-relaxed">
  {t("desc")}
</p>
```

**변경 사항:**
- ✅ `text-[16px]` → `text-base` (정의된 스케일 사용)
- ✅ `text-[14px]` → `text-sm`
- ✅ `leading-[1.5]` → `leading-relaxed` (일관된 클래스)
- ✅ 의미론적 색상 토큰 사용

---

## 5. 간격 시스템 개선

### 5.1 섹션 간격 통일

**현재:**
```tsx
<div className="flex flex-col gap-8">
```

**개선:**
```tsx
<div className="flex flex-col gap-12 md:gap-16">
```

**정당화:**
- ✅ Design Guide 섹션 간격 권장 (`gap-12` 또는 `gap-16`)
- ✅ 반응형 간격으로 데스크탑에서 더 여유로운 느낌

### 5.2 WelcomeSection 하단 여백 조정

**현재:**
```tsx
<section className="... pb-6 border-b ...">
```

**개선:**
```tsx
<section className="... pb-8 md:pb-12 border-b border-border ...">
```

**정당화:**
- ✅ `pb-6` → `pb-8 md:pb-12` (반응형 패딩)
- ✅ `border-border` 명시 (의미론적 색상)

### 5.3 카드 패딩 일관성

**StatCard 현재:**
```tsx
<CardContent className="p-6">
```

**유지 (적절):**
```tsx
<CardContent className="p-6">
  {/* 카드 내부 패딩 16px은 Design Guide 권장 */}
</CardContent>
```

---

## 6. 레이아웃 개선

### 6.1 컨테이너 래핑 추가

**현재 문제:**
```tsx
// page.tsx - 컨테이너 없음
<Suspense fallback={...}>
  <DashboardContent />
</Suspense>
```

**개선:**
```tsx
// page.tsx
export default function DashboardPage({ params }: DashboardPageProps) {
  void params;

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl">
      <div className="py-8 md:py-12">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
```

**정당화:**
- ✅ `container mx-auto`: 중앙 정렬
- ✅ `px-4 md:px-6`: 반응형 좌우 패딩
- ✅ `max-w-7xl`: 최대 너비 제한 (1280px)
- ✅ `py-8 md:py-12`: 페이지 상하 여백

### 6.2 RecentArticlesGrid 반응형 개선

**현재:**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
```

**개선:**
```tsx
<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

**변경 사항:**
- ✅ `gap-4` → `gap-6` (카드 간격 증가, Design Guide 권장)
- ✅ `grid-cols-1` 명시 (모바일 우선 원칙)

---

## 7. 애니메이션 개선

### 7.1 인라인 스타일 제거 + CSS 클래스화

**현재 문제:**
```tsx
// StatsGrid
<div className="... animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

// RecentArticlesGrid
<section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
```

**개선 방안:**

**Step 1: globals.css에 애니메이션 딜레이 클래스 추가**
```css
@theme {
  --animate-fade-in-up: fade-in-up 0.5s ease-out;
  --animate-fade-in-up-delay-100: fade-in-up 0.5s ease-out 0.1s;
  --animate-fade-in-up-delay-200: fade-in-up 0.5s ease-out 0.2s;
}
```

**Step 2: 컴포넌트에서 사용**
```tsx
// StatsGrid
<div className="grid gap-6 md:grid-cols-3 animate-fade-in-up-delay-100 motion-reduce:animate-none">

// RecentArticlesGrid
<section className="animate-fade-in-up-delay-200 motion-reduce:animate-none">
```

**정당화:**
- ✅ 인라인 스타일 제거 (CSS 클래스로 관리)
- ✅ `motion-reduce:animate-none` 추가 (접근성 준수)

### 7.2 WelcomeBanner 애니메이션 개선

**현재:**
```tsx
className={`
  transition-all duration-250 ease-out
  ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
`}
```

**개선:**
```tsx
className={`
  transition-all duration-300 ease-out motion-reduce:transition-none
  ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
`}
```

**변경 사항:**
- ✅ `duration-250` → `duration-300` (Design Guide 권장)
- ✅ `motion-reduce:transition-none` 추가

### 7.3 카드 호버 애니메이션 개선

**StatCard 현재:**
```tsx
<Card className="transition-all hover:shadow-md">
```

**개선:**
```tsx
<Card className="transition-shadow duration-300 ease-out hover:shadow-md motion-reduce:transition-none">
```

**ArticleCard 현재:**
```tsx
<Card className="group transition-all hover:shadow-lg hover:border-primary/50">
```

**개선:**
```tsx
<Card className="group transition-all duration-300 ease-out hover:shadow-lg hover:border-accent/50 motion-reduce:transition-none">
```

**정당화:**
- ✅ `duration-300` 명시 (일관성)
- ✅ `ease-out` 명시 (Design Guide 권장)
- ✅ `border-primary/50` → `border-accent/50` (브랜드 색상)
- ✅ `motion-reduce:transition-none` 추가

---

## 8. 접근성 개선

### 8.1 키보드 포커스 스타일 추가

**WelcomeSection 버튼:**
```tsx
<Button
  onClick={onCreateArticle}
  size="lg"
  className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
>
  <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
  {t('createButton')}
</Button>
```

**ArticleCard 버튼:**
```tsx
<Button
  onClick={() => onView(article.id)}
  variant="ghost"
  size="sm"
  className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
>
  {t('viewArticle')}
  <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
</Button>
```

**변경 사항:**
- ✅ `focus-visible:ring-2 focus-visible:ring-accent` 추가
- ✅ `focus-visible:ring-offset-2` 추가 (링 간격)
- ✅ 아이콘에 `aria-hidden="true"` 추가

### 8.2 ARIA 속성 추가

**StatCard 아이콘:**
```tsx
<div className="p-2 bg-accent/10 dark:bg-accent/20 rounded-lg">
  <Icon className="w-5 h-5 text-accent" aria-hidden="true" />
</div>
```

**ArticleCard Badge:**
```tsx
<Badge
  variant={statusConfig[article.status].variant}
  className={statusConfig[article.status].className}
  role="status"
  aria-label={t(`status.${article.status}_aria`)}
>
  {t(`status.${article.status}`)}
</Badge>
```

**추가 번역 키:**
```json
// messages/ko.json
{
  "dashboard": {
    "recentArticles": {
      "status": {
        "draft_aria": "초안 상태",
        "published_aria": "발행됨",
        "archived_aria": "보관됨"
      }
    }
  }
}
```

### 8.3 로딩 및 에러 상태 개선

**현재:**
```tsx
if (isStatsLoading || isArticlesLoading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-muted-foreground">{t('loading')}</p>
    </div>
  );
}
```

**개선:**
```tsx
if (isStatsLoading || isArticlesLoading) {
  return (
    <div
      className="flex items-center justify-center min-h-[400px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">{t('loading')}</p>
      </div>
    </div>
  );
}

if (statsError || articlesError) {
  return (
    <div
      className="flex items-center justify-center min-h-[400px]"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center gap-3 max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-destructive font-medium">{t('error')}</p>
        <p className="text-sm text-muted-foreground">{t('error_description')}</p>
      </div>
    </div>
  );
}
```

**변경 사항:**
- ✅ `role="status"`, `aria-live="polite"` 추가 (로딩 상태)
- ✅ `role="alert"`, `aria-live="assertive"` 추가 (에러 상태)
- ✅ 스피너 애니메이션 추가 (시각적 피드백)
- ✅ 에러 아이콘 및 설명 텍스트 추가

---

## 9. 컴포넌트별 개선 요약

### 9.1 WelcomeBanner 개선 체크리스트

- [ ] 하드코딩된 hex 색상 → 의미론적 색상 토큰 (`bg-blue-50`, `border-blue-500`)
- [ ] 다크 모드 지원 추가 (`dark:bg-blue-950/20`, `dark:border-blue-400`)
- [ ] 타이포그래피 스케일 준수 (`text-[16px]` → `text-base`)
- [ ] 애니메이션 duration 수정 (`duration-250` → `duration-300`)
- [ ] `motion-reduce:transition-none` 추가
- [ ] 버튼 포커스 스타일 개선 (`focus-visible:ring-2`)

### 9.2 WelcomeSection 개선 체크리스트

- [ ] 제목 크기 확대 (`text-3xl md:text-4xl` → `text-4xl md:text-5xl`)
- [ ] 폰트 굵기 조정 (`font-bold` → `font-medium`)
- [ ] 본문 크기 및 행간 추가 (`text-lg leading-relaxed`)
- [ ] 하단 패딩 반응형 적용 (`pb-6` → `pb-8 md:pb-12`)
- [ ] 버튼 포커스 스타일 추가
- [ ] 아이콘 `aria-hidden="true"` 추가

### 9.3 StatsGrid & StatCard 개선 체크리스트

- [ ] 그리드 간격 증가 (`gap-4` → `gap-6`)
- [ ] 변화 지표 색상 다크 모드 지원 (`text-green-600` → `text-green-600 dark:text-green-400`)
- [ ] 아이콘 배경 색상 변경 (`bg-primary/10` → `bg-accent/10 dark:bg-accent/20`)
- [ ] 아이콘 색상 변경 (`text-primary` → `text-accent`)
- [ ] 아이콘 `aria-hidden="true"` 추가
- [ ] 호버 애니메이션 개선 (`transition-all` → `transition-shadow duration-300 ease-out`)
- [ ] `motion-reduce:transition-none` 추가
- [ ] 인라인 스타일 제거 (`style={{ animationDelay }}` → CSS 클래스)

### 9.4 RecentArticlesGrid & ArticleCard 개선 체크리스트

- [ ] 그리드 간격 증가 (`gap-4` → `gap-6`)
- [ ] `grid-cols-1` 명시 (모바일 우선)
- [ ] Badge 색상 다크 모드 개선 (`dark:bg-yellow-950/50`, 테두리 추가)
- [ ] Badge에 `role="status"`, `aria-label` 추가
- [ ] 카드 호버 시 테두리 색상 변경 (`border-primary/50` → `border-accent/50`)
- [ ] 버튼 호버 색상 변경 (`group-hover:bg-primary` → `group-hover:bg-accent`)
- [ ] 버튼 포커스 스타일 추가
- [ ] 아이콘 `aria-hidden="true"` 추가
- [ ] 애니메이션 duration 명시 및 `motion-reduce` 추가
- [ ] 인라인 스타일 제거

### 9.5 DashboardPage 개선 체크리스트

- [ ] 컨테이너 래핑 추가 (`container mx-auto px-4 md:px-6 max-w-7xl`)
- [ ] 페이지 상하 패딩 추가 (`py-8 md:py-12`)
- [ ] 섹션 간격 증가 (`gap-8` → `gap-12 md:gap-16`)
- [ ] 로딩 상태 ARIA 속성 추가 (`role="status"`, `aria-live="polite"`)
- [ ] 로딩 스피너 애니메이션 추가
- [ ] 에러 상태 ARIA 속성 추가 (`role="alert"`, `aria-live="assertive"`)
- [ ] 에러 상태 아이콘 및 설명 추가

---

## 10. CSS 추가 사항

### 10.1 globals.css 애니메이션 클래스 추가

```css
@theme {
  /* 기존 애니메이션 */
  --animate-fade-in-up: fade-in-up 0.5s ease-out;

  /* 새로운 딜레이 애니메이션 */
  --animate-fade-in-up-delay-100: fade-in-up 0.5s ease-out 0.1s;
  --animate-fade-in-up-delay-200: fade-in-up 0.5s ease-out 0.2s;

  /* 스피너 애니메이션 */
  --animate-spin: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
```

---

## 11. 번역 키 추가 사항

### 11.1 messages/ko.json

```json
{
  "common": {
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다",
    "error_description": "잠시 후 다시 시도해 주세요. 문제가 지속되면 고객 지원팀에 문의하세요."
  },
  "dashboard": {
    "recentArticles": {
      "status": {
        "draft_aria": "초안 상태",
        "published_aria": "발행됨",
        "archived_aria": "보관됨"
      }
    }
  }
}
```

---

## 12. 우선순위별 구현 계획

### Phase 1: 심각한 문제 (즉시 수정)

1. **WelcomeBanner 색상 시스템 전면 개편** (다크 모드 미지원)
   - 하드코딩된 hex 색상 제거
   - 의미론적 색상 토큰 적용
   - 다크 모드 지원 추가

2. **컨테이너 래핑 추가** (레이아웃 일관성)
   - 페이지 최대 너비 제한
   - 좌우 패딩 적용

3. **접근성 필수 항목** (WCAG 준수)
   - 모든 버튼에 `focus-visible` 스타일 추가
   - 로딩/에러 상태 ARIA 속성 추가
   - 아이콘 `aria-hidden="true"` 추가

### Phase 2: 중요한 개선 (1주 이내)

1. **타이포그래피 시스템 정비**
   - WelcomeSection 제목 크기 확대
   - 불규칙한 폰트 크기 제거 (WelcomeBanner)
   - 일관된 leading 적용

2. **색상 토큰 정비**
   - StatCard 아이콘 색상 → `text-accent`
   - ArticleCard 호버 색상 → `border-accent/50`
   - Badge 다크 모드 개선

3. **애니메이션 개선**
   - 인라인 스타일 제거 (CSS 클래스화)
   - `motion-reduce` 지원 추가
   - duration 표준화 (300ms)

### Phase 3: 사용자 경험 향상 (2주 이내)

1. **간격 시스템 조정**
   - 섹션 간격 증가 (`gap-12 md:gap-16`)
   - 카드 그리드 간격 증가 (`gap-6`)
   - 페이지 상하 패딩 추가

2. **로딩/에러 상태 개선**
   - 스피너 애니메이션 추가
   - 에러 아이콘 및 설명 추가
   - 재시도 버튼 고려

3. **세부 인터랙션 개선**
   - 카드 호버 효과 미세 조정
   - 버튼 active 상태 추가
   - 토스트 알림 통합 고려

---

## 13. 성공 지표

### 접근성
- [ ] WCAG 2.1 AA 레벨 100% 달성
- [ ] 키보드 네비게이션 모든 요소 접근 가능
- [ ] 스크린 리더 호환성 검증 완료
- [ ] `motion-reduce` 미디어 쿼리 100% 적용

### 디자인 일관성
- [ ] 하드코딩된 색상 0건
- [ ] 의미론적 색상 토큰 100% 사용
- [ ] 타이포그래피 스케일 100% 준수
- [ ] 다크 모드 완벽 지원

### 성능
- [ ] 애니메이션 `transform`/`opacity`만 사용
- [ ] 레이아웃 리플로우 0건
- [ ] Lighthouse 접근성 점수 95점 이상

### 사용자 경험
- [ ] 모바일/태블릿/데스크탑 완벽 대응
- [ ] 로딩 상태 시각적 피드백 제공
- [ ] 에러 상태 명확한 안내 메시지

---

## 14. 참고 자료

### Design Guide 위반 항목 요약

| 컴포넌트 | 위반 항목 | 심각도 | 개선 방안 |
|---------|----------|--------|----------|
| WelcomeBanner | 하드코딩된 hex 색상 | 심각 | 의미론적 색상 토큰 사용 |
| WelcomeBanner | 다크 모드 미지원 | 심각 | `dark:` variant 추가 |
| WelcomeBanner | 불규칙한 폰트 크기 | 경미 | Tailwind 스케일 사용 |
| WelcomeSection | 제목 크기 부족 | 경미 | `text-4xl md:text-5xl` |
| StatCard | 하드코딩된 색상 | 중간 | 다크 모드 지원 추가 |
| ArticleCard | Badge 색상 | 중간 | 다크 모드 대비 개선 |
| 전체 | 컨테이너 부재 | 중간 | `container` 래핑 |
| 전체 | `motion-reduce` 누락 | 중간 | 전체 애니메이션에 추가 |
| 전체 | `focus-visible` 부족 | 중간 | 모든 버튼에 추가 |
| 전체 | ARIA 속성 부족 | 경미 | 장식 아이콘, 상태 표시 |

### 색상 시스템 정리

| 용도 | 현재 (잘못된 예) | 개선 (올바른 예) |
|------|------------------|------------------|
| 정보 배너 배경 | `bg-[#F0F9FF]` | `bg-blue-50 dark:bg-blue-950/20` |
| 정보 배너 테두리 | `border-[#3BA2F8]` | `border-blue-500 dark:border-blue-400` |
| 주요 CTA | `bg-[#3BA2F8]` | `bg-accent` |
| 아이콘 배경 | `bg-primary/10` | `bg-accent/10 dark:bg-accent/20` |
| 아이콘 색상 | `text-primary` | `text-accent` |
| 성공 지표 | `text-green-600` | `text-green-600 dark:text-green-400` |
| 실패 지표 | `text-red-600` | `text-red-600 dark:text-red-400` |

---

**마지막 업데이트**: 2025-11-17
**분석 대상**: `/src/app/[locale]/(protected)/dashboard/page.tsx`
**관련 컴포넌트**: WelcomeBanner, WelcomeSection, StatsGrid, StatCard, RecentArticlesGrid, ArticleCard
**분석자**: Claude Code
