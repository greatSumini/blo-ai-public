# Account & Keywords 페이지 UI/UX 개선안

**분석 대상 페이지**:
- `/account` - 계정 설정 페이지
- `/keywords` - 키워드 관리 페이지

**분석 일자**: 2025-11-17
**기준 문서**: `/Users/choesumin/Desktop/dev/indieblog/CLAUDE.md` - UI/UX Design Guide

---

## 1. 현재 상태 분석

### 1.1 Account Page 구조

**페이지 구성**:
```
AccountPage (account-page.tsx)
├── Page Header (title + description)
├── ProfileSection (프로필 정보)
├── ContentPreferencesSection (콘텐츠 설정)
└── NotificationsSection (알림 설정)
```

**현재 디자인 특징**:
- 수직 스택 레이아웃 (섹션별 Card 컴포넌트)
- 자동 저장 기능 (Auto Save Indicator)
- 아바타 업로드 UI
- 폼 필드와 토글 스위치 조합

**강점**:
- ✅ 명확한 정보 위계 (제목 → 설명 → 콘텐츠)
- ✅ 자동 저장으로 UX 개선
- ✅ 로딩 상태 표시 (Skeleton UI)
- ✅ 접근성: htmlFor 연결, aria-label 사용

### 1.2 Keywords Page 구조

**페이지 구성**:
```
KeywordsPage
├── PageLayout
│   ├── Header (title + description + actions)
│   └── Card
│       └── KeywordTable
│           ├── SearchSection (검색 + 필터)
│           ├── Total Count
│           ├── Table (keyword 목록)
│           └── Pagination
└── Dialogs (KeywordCreateDialog, SuggestionsDialog)
```

**현재 디자인 특징**:
- 데이터 테이블 중심 레이아웃
- 검색/필터링 기능
- CRUD 작업 (생성, 삭제)
- 페이지네이션

**강점**:
- ✅ 검색 디바운싱으로 성능 최적화
- ✅ Empty State 처리
- ✅ 에러 핸들링
- ✅ Toast 알림으로 피드백

---

## 2. UI/UX Design Guide 위반 사항 및 개선점

### 2.1 색상 시스템 위반 (Critical)

#### 문제점 1: 하드코딩된 gray-* 색상 사용

**위반 코드**:

**PageLayout** (`page-layout.tsx:21`):
```tsx
<div className="min-h-screen bg-gray-50">  // ❌ bg-background 사용 권장
  <h1 className="text-2xl font-bold text-gray-900">  // ❌ text-foreground 사용 권장
```

**KeywordTable** (`KeywordTable.tsx:111, 120, 136`):
```tsx
<p className="text-sm text-gray-600">  // ❌ text-muted-foreground 사용 권장
<div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">  // ⚠️ 의미론적 색상 사용
<TableRow className="bg-gray-50">  // ❌ bg-secondary 사용 권장
```

**SearchSection** (`SearchSection.tsx:33, 44`):
```tsx
<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />  // ❌
className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"  // ❌
```

**개선안**:
```tsx
// PageLayout
<div className="min-h-screen bg-background">
  <h1 className="text-2xl font-bold text-foreground">

// KeywordTable
<p className="text-sm text-muted-foreground">
<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
<TableRow className="bg-secondary">

// SearchSection
<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
```

**영향도**: ⚠️ **HIGH** - 다크 모드 대응 불가, 일관성 저하

---

#### 문제점 2: 의미론적 색상 토큰 미사용

**위반 코드** (`KeywordTable.tsx:41`):
```tsx
<Card className="p-6 border-gray-200 rounded-xl">  // ❌ border-border 사용 권장
```

**개선안**:
```tsx
<Card className="p-6 border-border rounded-xl">
```

---

### 2.2 타이포그래피 위반

#### 문제점 1: 불규칙한 폰트 크기 사용

**위반 코드**:

**AccountPage** (`account-page.tsx:15`):
```tsx
<h1 className="text-4xl md:text-5xl font-bold tracking-tight">  // ✅ 좋음
<p className="text-base md:text-lg text-muted-foreground max-w-2xl">  // ✅ 좋음
```

**PageLayout** (`page-layout.tsx:26`):
```tsx
<h1 className="text-2xl font-bold text-gray-900">  // ⚠️ 너무 작음 (h1 스케일에 맞지 않음)
<p className="mt-2 text-sm text-gray-600">  // ⚠️ 너무 작음
```

**개선안**:
```tsx
// PageLayout - h1은 최소 text-3xl 이상 사용
<h1 className="text-3xl md:text-4xl font-medium text-foreground leading-tight">
<p className="mt-2 text-base text-muted-foreground leading-relaxed">
```

**가이드라인 참조**:
```typescript
h1: 'text-4xl md:text-5xl font-medium leading-tight'  // 48px → 60px
h2: 'text-3xl md:text-4xl font-medium leading-tight'  // 36px → 48px
body1: 'text-base leading-relaxed'                     // 16px
```

---

#### 문제점 2: font-weight 불일치

**위반 코드**:
```tsx
// AccountPage - font-bold 사용
<h1 className="text-4xl md:text-5xl font-bold tracking-tight">

// Card (card.tsx:39) - font-semibold 사용
className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
```

**개선안**:
```tsx
// 가이드에 따라 제목은 font-medium으로 통일
<h1 className="text-4xl md:text-5xl font-medium leading-tight">
<CardTitle className="text-2xl font-medium leading-tight">
```

**이유**: Claude.ai는 `font-medium`을 주로 사용하여 차분하고 전문적인 느낌 전달

---

### 2.3 간격 시스템 위반

#### 문제점 1: 불규칙한 간격 값

**위반 코드**:

**AccountPage** (`account-page.tsx:12`):
```tsx
<div className="container max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 space-y-8 sm:space-y-10">
// ⚠️ py-10, space-y-10은 정의되지 않은 간격 스케일
```

**가이드라인 스케일**:
```typescript
gap-4  // 16px
gap-6  // 24px
gap-8  // 32px
gap-12 // 48px  (py-10은 40px로 스케일에 없음)
```

**개선안**:
```tsx
<div className="container max-w-5xl px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
```

---

#### 문제점 2: 컨테이너 패딩 불일치

**PageLayout** vs **AccountPage**:
```tsx
// PageLayout
<div className={`container mx-auto ${maxWidthClassName} px-4 py-8`}>

// AccountPage
<div className="container max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 space-y-8 sm:space-y-10">
```

**개선안** (통일된 패턴):
```tsx
// 공통 컨테이너 스타일
<div className="container mx-auto max-w-5xl px-4 md:px-6 py-8 md:py-12">
```

---

### 2.4 레이아웃 개선 필요 사항

#### 문제점 1: PageLayout의 고정된 배경색

**위반 코드** (`page-layout.tsx:21`):
```tsx
<div className="min-h-screen bg-gray-50">  // ❌ 항상 회색 배경
```

**개선안**:
```tsx
// 배경색을 props로 받거나 기본값을 의미론적 토큰으로
<div className="min-h-screen bg-background">
// 또는 페이지별로 다르게 설정 가능하도록
<div className="min-h-screen bg-secondary/30">  // 미묘한 배경색
```

---

#### 문제점 2: 반응형 액션 버튼 배치

**위반 코드** (`page-layout.tsx:24`):
```tsx
<div className="flex items-center justify-between">
  <div>{/* title */}</div>
  {actions && <div className="flex gap-2">{actions}</div>}  // ⚠️ 모바일에서 좁음
</div>
```

**개선안**:
```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>{/* title */}</div>
  {actions && (
    <div className="flex flex-col gap-2 sm:flex-row">
      {actions}
    </div>
  )}
</div>
```

**이유**: 모바일에서 버튼이 세로로 쌓이도록 (터치 영역 확보)

---

### 2.5 애니메이션 개선 필요

#### 문제점 1: 애니메이션 duration 불일치

**현재 코드**:
```tsx
// NotificationsSection (66, 85)
className="... transition-colors duration-200"

// KeywordTable (147, 182, 191)
className="transition-colors hover:bg-gray-50"  // ⚠️ duration 누락
className="transition-colors"  // ⚠️ duration 누락

// ProfileSection (95)
className="... transition-all duration-200 group-hover:ring-4"
```

**개선안**:
```tsx
// 버튼 상태 전환 - 100ms (fast)
className="transition-colors duration-100 ease-in-out hover:bg-secondary"

// 카드 호버 - 300ms (normal)
className="transition-shadow duration-300 hover:shadow-md"

// 링 애니메이션 - 200ms (normal)
className="transition-all duration-200 ease-out group-hover:ring-4"
```

**가이드라인 참조**:
```typescript
fast: '100ms'     // 버튼 호버
normal: '200ms'   // 드롭다운 메뉴
slow: '300ms'     // 툴팁, 카드
```

---

#### 문제점 2: prefers-reduced-motion 미대응

**위반 코드**:
모든 애니메이션에 `motion-reduce:` 변형 누락

**개선안**:
```tsx
// 모든 transition에 추가
className="transition-colors duration-100 motion-reduce:transition-none"
className="transition-shadow duration-300 motion-reduce:transition-none"
```

---

### 2.6 접근성 개선 사항

#### 우수한 점 ✅

1. **폼 레이블 연결**:
```tsx
<Label htmlFor="fullName">{t("fields.fullName")}</Label>
<Input id="fullName" />
```

2. **ARIA 레이블**:
```tsx
<Button aria-label={t("table.copyAria", { phrase: keyword.phrase })}>
```

3. **로딩 상태 표시**:
```tsx
<div role="status" aria-live="polite" aria-label={t("loading")}>
  <span className="sr-only">{t("loading")}</span>
</div>
```

#### 개선 필요 사항 ⚠️

**문제점 1**: SearchSection의 clear 버튼

**현재 코드** (`SearchSection.tsx:42-48`):
```tsx
<button
  onClick={() => onSearchChange("")}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
  aria-label={t("clearSearch")}
>
  <X className="h-4 w-4" />
</button>
```

**개선안**:
```tsx
<button
  onClick={() => onSearchChange("")}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  aria-label={t("clearSearch")}
>
  <X className="h-4 w-4" />
</button>
```

**추가**: `focus-visible` 스타일 누락

---

**문제점 2**: 테이블 헤더 정렬

**현재 코드** (`KeywordTable.tsx:137-140`):
```tsx
<TableHead className="w-[50%]">{t("table.columnKeyword")}</TableHead>
<TableHead className="w-[20%]">{t("table.columnSource")}</TableHead>
<TableHead className="w-[20%]">{t("table.columnCreatedAt")}</TableHead>
<TableHead className="w-[10%] text-right">{t("table.columnActions")}</TableHead>
```

**개선안**:
```tsx
// scope 속성 추가
<TableHead scope="col" className="w-[50%]">{t("table.columnKeyword")}</TableHead>
<TableHead scope="col" className="w-[20%]">{t("table.columnSource")}</TableHead>
<TableHead scope="col" className="w-[20%]">{t("table.columnCreatedAt")}</TableHead>
<TableHead scope="col" className="w-[10%] text-right">{t("table.columnActions")}</TableHead>
```

---

### 2.7 Card 컴포넌트 개선

#### 문제점: shadow-xs 사용

**현재 코드** (`card.tsx:12`):
```tsx
className={cn(
  "rounded-lg border bg-card text-card-foreground shadow-xs",  // ⚠️ shadow-xs는 Tailwind 기본 스케일에 없음
  className
)}
```

**Tailwind 기본 shadow 스케일**:
```
shadow-sm    // 작은 그림자
shadow       // 기본 그림자
shadow-md    // 중간 그림자
shadow-lg    // 큰 그림자
```

**개선안**:
```tsx
className={cn(
  "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
  className
)}
```

---

## 3. 구체적인 개선 방안

### 3.1 색상 시스템 마이그레이션 플랜

#### Step 1: 공통 색상 토큰 적용

**대상 파일**:
- `src/components/layout/page-layout.tsx`
- `src/features/keywords/components/KeywordTable.tsx`
- `src/features/keywords/components/SearchSection.tsx`

**변경 매핑**:
```tsx
// 배경색
bg-gray-50    → bg-background
bg-gray-100   → bg-secondary
bg-muted/50   → bg-secondary/50

// 텍스트색
text-gray-900 → text-foreground
text-gray-600 → text-muted-foreground
text-gray-400 → text-muted-foreground/70

// 테두리색
border-gray-200 → border-border
```

#### Step 2: 의미론적 색상 사용

**에러 상태** (`KeywordTable.tsx:120-126`):
```tsx
// Before
<div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
  <p className="text-base font-medium text-red-900 mb-1">
  <p className="text-sm text-red-600">

// After
<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
  <p className="text-base font-medium text-destructive mb-1">
  <p className="text-sm text-destructive/80">
```

**삭제 버튼** (`KeywordTable.tsx:188-195`):
```tsx
// Before
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleDeleteClick(keyword.id, keyword.phrase)}
  className="text-red-600 hover:text-red-700 transition-colors"  // ❌
>
  <Trash2 className="h-4 w-4" />
</Button>

// After
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleDeleteClick(keyword.id, keyword.phrase)}
  className="text-destructive hover:text-destructive/90 transition-colors duration-100"
>
  <Trash2 className="h-4 w-4" />
</Button>
```

---

### 3.2 타이포그래피 개선 플랜

#### PageLayout 제목 크기 조정

**파일**: `src/components/layout/page-layout.tsx`

```tsx
// Before
<h1 className="text-2xl font-bold text-gray-900">
  {title}
</h1>
{description && (
  <p className="mt-2 text-sm text-gray-600">
    {description}
  </p>
)}

// After
<h1 className="text-3xl md:text-4xl font-medium text-foreground leading-tight">
  {title}
</h1>
{description && (
  <p className="mt-2 text-base text-muted-foreground leading-relaxed max-w-2xl">
    {description}
  </p>
)}
```

#### AccountPage 제목 font-weight 조정

**파일**: `src/features/account/components/account-page.tsx`

```tsx
// Before
<h1 className="text-4xl md:text-5xl font-bold tracking-tight">

// After
<h1 className="text-4xl md:text-5xl font-medium leading-tight">
```

#### CardTitle 조정

**파일**: `src/components/ui/card.tsx`

```tsx
// Before
className={cn(
  "text-2xl font-semibold leading-none tracking-tight",
  className
)}

// After
className={cn(
  "text-2xl font-medium leading-tight",  // leading-none → leading-tight
  className
)}
```

---

### 3.3 간격 시스템 개선 플랜

#### AccountPage 간격 조정

**파일**: `src/features/account/components/account-page.tsx`

```tsx
// Before
<div className="container max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 space-y-8 sm:space-y-10">

// After
<div className="container max-w-5xl px-4 md:px-6 py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
```

#### SearchSection 간격 조정

**파일**: `src/features/keywords/components/SearchSection.tsx`

```tsx
// Before
<div className="flex gap-3 mb-6">

// After
<div className="flex flex-col gap-4 sm:flex-row mb-6">
  {/* 모바일에서 세로 배치 */}
```

---

### 3.4 레이아웃 개선 플랜

#### PageLayout 반응형 개선

**파일**: `src/components/layout/page-layout.tsx`

```tsx
// Before
<div className="min-h-screen bg-gray-50">
  <div className={`container mx-auto ${maxWidthClassName} px-4 py-8`}>
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
    {children}
  </div>
</div>

// After
<div className="min-h-screen bg-background">
  <div className={`container mx-auto ${maxWidthClassName} px-4 md:px-6 py-8 md:py-12`}>
    <div className="mb-8 md:mb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-medium text-foreground leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-base text-muted-foreground leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 md:flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
    {children}
  </div>
</div>
```

**개선 사항**:
1. 배경색: `bg-gray-50` → `bg-background` (다크 모드 대응)
2. 타이포그래피: 제목 크기 확대, font-weight 조정
3. 반응형: 모바일에서 title과 actions가 세로로 배치
4. 간격: Tailwind 스케일에 맞춘 간격 사용
5. 색상: 모든 하드코딩 색상 제거

---

### 3.5 애니메이션 개선 플랜

#### 일관된 transition 적용

**적용 대상**: 모든 인터랙티브 요소

**패턴**:
```tsx
// 1. 버튼 (빠른 반응)
className="transition-colors duration-100 ease-in-out motion-reduce:transition-none"

// 2. 카드 호버 (부드러운 전환)
className="transition-shadow duration-300 motion-reduce:transition-none"

// 3. 링/아웃라인 애니메이션
className="transition-all duration-200 ease-out motion-reduce:transition-none"
```

#### KeywordTable row 호버 개선

**파일**: `src/features/keywords/components/KeywordTable.tsx`

```tsx
// Before (145-198)
<TableRow
  key={keyword.id}
  className="transition-colors hover:bg-gray-50"
>

// After
<TableRow
  key={keyword.id}
  className="group transition-colors duration-100 hover:bg-secondary motion-reduce:transition-none"
>
  <TableCell>
    <span className="font-medium text-foreground">
      {keyword.phrase}
    </span>
  </TableCell>
  {/* ... */}
  <TableCell className="text-right">
    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleCopy(keyword.phrase)}
        className="transition-colors duration-100"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDeleteClick(keyword.id, keyword.phrase)}
        className="text-destructive hover:text-destructive/90 transition-colors duration-100"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </TableCell>
</TableRow>
```

**개선 사항**:
1. `group` 클래스로 row 호버 시 액션 버튼 표시
2. 액션 버튼은 평소 숨김 (`opacity-0`) → 호버 시 표시 (`group-hover:opacity-100`)
3. 일관된 duration 사용 (row: 100ms, 버튼: 200ms)
4. `motion-reduce` 대응

---

### 3.6 NotificationsSection 개선

**파일**: `src/features/account/components/notifications-section.tsx`

```tsx
// Before (66, 85)
<div className="flex items-center justify-between p-4 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-colors duration-200">

// After
<div className="flex items-center justify-between p-4 rounded-lg border border-transparent hover:border-border hover:bg-secondary/50 transition-all duration-200 motion-reduce:transition-none">
```

**변경 사항**:
- `hover:bg-muted/30` → `hover:bg-secondary/50` (의미론적 색상)
- `transition-colors` → `transition-all` (border도 애니메이션)
- `motion-reduce:transition-none` 추가

---

### 3.7 ProfileSection 아바타 개선

**파일**: `src/features/account/components/profile-section.tsx`

```tsx
// Before (95)
<Avatar className="h-24 w-24 transition-all duration-200 group-hover:ring-4 group-hover:ring-primary/10">

// After
<Avatar className="h-24 w-24 transition-all duration-200 ease-out group-hover:ring-4 group-hover:ring-ring/20 motion-reduce:transition-none">
```

**변경 사항**:
- `ring-primary/10` → `ring-ring/20` (의미론적 색상)
- `ease-out` 추가 (부드러운 easing)
- `motion-reduce` 대응

---

## 4. 컴포넌트별 개선 체크리스트

### 4.1 PageLayout (page-layout.tsx)

- [ ] 배경색: `bg-gray-50` → `bg-background`
- [ ] 제목 크기: `text-2xl` → `text-3xl md:text-4xl`
- [ ] 제목 weight: `font-bold` → `font-medium`
- [ ] 제목 색상: `text-gray-900` → `text-foreground`
- [ ] 설명 크기: `text-sm` → `text-base`
- [ ] 설명 색상: `text-gray-600` → `text-muted-foreground`
- [ ] 설명 line-height: 추가 `leading-relaxed`
- [ ] 설명 최대 너비: 추가 `max-w-2xl`
- [ ] 반응형 레이아웃: `flex-col` → `md:flex-row`
- [ ] 액션 버튼 배치: `flex-col sm:flex-row`
- [ ] 패딩: `px-4 py-8` → `px-4 md:px-6 py-8 md:py-12`
- [ ] 하단 마진: `mb-8` → `mb-8 md:mb-12`

### 4.2 AccountPage (account-page.tsx)

- [ ] 제목 weight: `font-bold` → `font-medium`
- [ ] 제목 line-height: 추가 `leading-tight`
- [ ] 컨테이너 패딩: 스케일 조정 `py-8 sm:py-10 lg:py-12` → `py-8 md:py-12 lg:py-16`
- [ ] 간격: `space-y-8 sm:space-y-10` → `space-y-8 md:space-y-12`

### 4.3 ProfileSection (profile-section.tsx)

- [ ] 아바타 ring 색상: `ring-primary/10` → `ring-ring/20`
- [ ] transition에 `ease-out` 추가
- [ ] transition에 `motion-reduce:transition-none` 추가
- [ ] 업로드 버튼 transition: `hover:scale-110` → duration 및 easing 명시

### 4.4 ContentPreferencesSection (content-preferences-section.tsx)

- [ ] 전체적으로 색상 시스템은 양호 (muted, bg-muted 사용)
- [ ] 추가 개선 사항 없음 (현재 상태 유지)

### 4.5 NotificationsSection (notifications-section.tsx)

- [ ] 호버 배경색: `hover:bg-muted/30` → `hover:bg-secondary/50`
- [ ] transition: `transition-colors` → `transition-all`
- [ ] transition에 `motion-reduce:transition-none` 추가

### 4.6 KeywordTable (KeywordTable.tsx)

- [ ] 총 개수 텍스트: `text-gray-600` → `text-muted-foreground`
- [ ] 에러 상태 배경: `border-red-200 bg-red-50` → `border-destructive/20 bg-destructive/5`
- [ ] 에러 텍스트: `text-red-900`, `text-red-600` → `text-destructive`, `text-destructive/80`
- [ ] 테이블 헤더 배경: `bg-gray-50` → `bg-secondary`
- [ ] 테이블 헤더: `<TableHead scope="col">` 추가
- [ ] 테이블 row: `hover:bg-gray-50` → `hover:bg-secondary`
- [ ] row에 `group` 클래스 추가
- [ ] 액션 버튼 컨테이너: `opacity-0 group-hover:opacity-100` 추가
- [ ] 삭제 버튼: `text-red-600 hover:text-red-700` → `text-destructive hover:text-destructive/90`
- [ ] 모든 transition에 duration 명시
- [ ] 모든 transition에 `motion-reduce:transition-none` 추가
- [ ] 텍스트 색상: `text-gray-900` → `text-foreground`

### 4.7 SearchSection (SearchSection.tsx)

- [ ] 검색 아이콘: `text-gray-400` → `text-muted-foreground`
- [ ] Clear 버튼: `text-gray-400 hover:text-gray-600` → `text-muted-foreground hover:text-foreground`
- [ ] Clear 버튼에 `focus-visible:ring-2` 스타일 추가
- [ ] transition에 duration 명시
- [ ] transition에 `motion-reduce:transition-none` 추가
- [ ] 반응형: `flex` → `flex-col gap-4 sm:flex-row`

### 4.8 KeywordCreateDialog (KeywordCreateDialog.tsx)

- [ ] 전체적으로 색상 시스템은 양호 (shadcn Dialog 사용)
- [ ] 추가 개선 사항 없음

### 4.9 Card (card.tsx)

- [ ] `shadow-xs` → `shadow-sm`
- [ ] `border` → `border border-border` (명시적으로)
- [ ] CardTitle: `font-semibold` → `font-medium`
- [ ] CardTitle: `leading-none` → `leading-tight`

### 4.10 SectionCard (section-card.tsx)

- [ ] 현재 상태 양호 (Card 컴포넌트 사용)
- [ ] Card 컴포넌트 개선 시 자동 반영됨

---

## 5. 구현 우선순위

### Priority 1: Critical (다크 모드 대응)

**즉시 적용 필요** - 다크 모드 미지원 문제 해결

1. ✅ **색상 시스템 마이그레이션** (3.1절)
   - PageLayout 색상 토큰 적용
   - KeywordTable 색상 토큰 적용
   - SearchSection 색상 토큰 적용
   - 모든 `gray-*` → 의미론적 토큰

2. ✅ **Card 컴포넌트 수정** (3.7절)
   - `shadow-xs` → `shadow-sm`
   - `border-border` 명시

**예상 소요 시간**: 1-2시간
**영향 범위**: 전체 페이지 (다크 모드 완전 지원)

---

### Priority 2: High (일관성 및 UX 개선)

**1주일 내 적용 권장**

3. ✅ **타이포그래피 개선** (3.2절)
   - PageLayout 제목 크기 조정
   - 모든 제목 font-weight → `font-medium`
   - line-height 일관성 확보

4. ✅ **레이아웃 반응형 개선** (3.4절)
   - PageLayout 액션 버튼 배치
   - SearchSection 반응형

5. ✅ **애니메이션 일관성** (3.5절)
   - 모든 transition duration 명시
   - `motion-reduce` 대응

**예상 소요 시간**: 2-3시간
**영향 범위**: 전체 페이지 (일관성 및 접근성 향상)

---

### Priority 3: Medium (디테일 개선)

**2주일 내 적용 권장**

6. ✅ **간격 시스템 정리** (3.3절)
   - AccountPage 간격 조정
   - 모든 컴포넌트 간격 스케일 통일

7. ✅ **접근성 개선** (2.6절)
   - 테이블 헤더 `scope` 속성
   - 버튼 focus-visible 스타일

8. ✅ **KeywordTable 호버 UX 개선** (3.5절)
   - `group` 클래스로 액션 버튼 표시/숨김

**예상 소요 시간**: 1-2시간
**영향 범위**: 세부 UX 개선

---

## 6. 개선 효과 예측

### 6.1 다크 모드 지원

**Before**:
- ❌ 하드코딩된 `gray-*` 색상으로 다크 모드 미지원
- ❌ 배경이 항상 `bg-gray-50`으로 고정

**After**:
- ✅ 의미론적 색상 토큰으로 자동 전환
- ✅ `bg-background`, `text-foreground` 등으로 일관성

**예상 효과**:
- 다크 모드 사용자 경험 대폭 개선
- 브랜드 일관성 확보

---

### 6.2 타이포그래피 일관성

**Before**:
- ⚠️ PageLayout h1이 `text-2xl`로 너무 작음
- ⚠️ `font-bold`, `font-semibold`, `font-medium` 혼용

**After**:
- ✅ h1은 최소 `text-3xl md:text-4xl`
- ✅ 모든 제목은 `font-medium`으로 통일

**예상 효과**:
- 페이지 간 타이포그래피 일관성 확보
- Claude.ai와 유사한 차분하고 전문적인 느낌

---

### 6.3 애니메이션 일관성

**Before**:
- ⚠️ duration 누락 또는 불규칙
- ❌ `prefers-reduced-motion` 미대응

**After**:
- ✅ 모든 transition에 duration 명시
- ✅ `motion-reduce:transition-none` 추가

**예상 효과**:
- 일관된 인터랙션 경험
- 접근성 개선 (저시력자, 전정 장애)

---

### 6.4 반응형 UX

**Before**:
- ⚠️ 모바일에서 액션 버튼이 가로로 배치 (좁음)
- ⚠️ SearchSection도 가로 배치

**After**:
- ✅ 모바일에서 세로 배치 (`flex-col`)
- ✅ 터치 영역 확보

**예상 효과**:
- 모바일 사용성 대폭 개선
- 터치 오류 감소

---

## 7. 참고: 색상 마이그레이션 테이블

| 현재 (하드코딩) | 개선 (의미론적 토큰) | 다크 모드 값 |
|----------------|-------------------|-------------|
| `bg-gray-50` | `bg-background` | `slate-950` |
| `bg-gray-100` | `bg-secondary` | `slate-900` |
| `bg-gray-900` | `bg-foreground` | `slate-50` |
| `text-gray-900` | `text-foreground` | `slate-50` |
| `text-gray-600` | `text-muted-foreground` | `slate-400` |
| `text-gray-400` | `text-muted-foreground/70` | `slate-500` |
| `border-gray-200` | `border-border` | `slate-600` |
| `border-red-200` | `border-destructive/20` | auto |
| `bg-red-50` | `bg-destructive/5` | auto |
| `text-red-600` | `text-destructive` | auto |

**참고**: 의미론적 토큰은 `globals.css`의 CSS 변수로 정의되어 자동 전환됩니다.

---

## 8. 적용 후 테스트 체크리스트

### 8.1 시각적 테스트

- [ ] **라이트 모드**: 모든 페이지 정상 렌더링
- [ ] **다크 모드**: 모든 페이지 정상 렌더링
- [ ] **반응형**: 375px, 768px, 1024px, 1440px에서 테스트
- [ ] **브라우저**: Chrome, Safari, Firefox에서 테스트

### 8.2 기능 테스트

- [ ] **Account 페이지**: 폼 입력, 자동 저장 동작
- [ ] **Keywords 페이지**: 검색, 필터, CRUD 동작
- [ ] **애니메이션**: 호버, 포커스, 전환 상태 확인
- [ ] **접근성**: 키보드 네비게이션, 스크린 리더 테스트

### 8.3 성능 테스트

- [ ] **Lighthouse**: 접근성 점수 90+ 유지
- [ ] **CLS**: 레이아웃 시프트 발생하지 않는지 확인
- [ ] **애니메이션**: 60fps 유지 (transform/opacity만 사용)

---

## 9. 결론

### 주요 발견 사항

1. **Critical**: 하드코딩된 `gray-*` 색상으로 인한 다크 모드 미지원
2. **High**: 타이포그래피 불일치 (font-weight, font-size)
3. **Medium**: 애니메이션 duration 누락 및 `motion-reduce` 미대응
4. **Low**: 간격 스케일 일부 불일치

### 개선 효과

- ✅ 다크 모드 완전 지원
- ✅ 타이포그래피 일관성 확보
- ✅ 접근성 개선 (A11y)
- ✅ 반응형 UX 개선
- ✅ 애니메이션 일관성

### 예상 작업 시간

- **Priority 1 (Critical)**: 1-2시간
- **Priority 2 (High)**: 2-3시간
- **Priority 3 (Medium)**: 1-2시간
- **총 예상 시간**: 4-7시간

### 권장 사항

1. **즉시 적용**: Priority 1 (색상 시스템 마이그레이션)
2. **1주일 내**: Priority 2 (타이포그래피, 레이아웃, 애니메이션)
3. **2주일 내**: Priority 3 (간격, 접근성, 디테일)

---

**마지막 업데이트**: 2025-11-17
**분석자**: Claude Code (Sonnet 4.5)
**참고 문서**: `CLAUDE.md` - UI/UX Design Guide
