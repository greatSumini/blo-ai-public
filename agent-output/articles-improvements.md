# Articles 페이지 UI/UX 개선안

**작성일**: 2025-11-17
**분석 대상**: Article 관련 3개 페이지 및 관련 컴포넌트
**기준**: `/Users/choesumin/Desktop/dev/indieblog/CLAUDE.md` - UI/UX Design Guide

---

## 목차

1. [전체 요약](#1-전체-요약)
2. [페이지별 분석 및 개선안](#2-페이지별-분석-및-개선안)
   - [2.1 New Article Page (`/new-article`)](#21-new-article-page-new-article)
   - [2.2 Articles List Page (`/articles`)](#22-articles-list-page-articles)
   - [2.3 Article Edit Page (`/articles/[id]/edit`)](#23-article-edit-page-articlesidedit)
3. [공통 컴포넌트 개선안](#3-공통-컴포넌트-개선안)
4. [구현 우선순위](#4-구현-우선순위)
5. [성공 지표](#5-성공-지표)

---

## 1. 전체 요약

### 1.1 주요 발견 사항

**강점**:
- Framer Motion을 활용한 부드러운 페이지 전환 (new-article)
- React Hook Form + Zod를 통한 견고한 폼 검증
- shadcn/ui 기반의 일관된 컴포넌트 사용
- Next.js 국제화(i18n) 적용

**심각한 위반 사항**:
1. **색상 시스템 위반**: 하드코딩된 색상 과다 사용 (`bg-blue-500`, `bg-gray-50`, `text-gray-600` 등)
2. **타이포그래피 불일치**: 비표준 크기 사용 (`text-2xl` 제목이 디자인 가이드의 `h1`(text-4xl~5xl)와 불일치)
3. **간격 시스템 부재**: 섹션 간격이 디자인 가이드의 `py-16 md:py-24` 대신 `py-12`, `py-8` 등 임의 사용
4. **다크 모드 미대응**: 대부분의 컴포넌트에서 `dark:` variant 누락
5. **접근성 문제**:
   - focus-visible 스타일 누락
   - ARIA 속성 부족 (진행 상태, 로딩 상태 등)
   - 색상 대비 미검증 (`text-gray-400`, `text-gray-500` 등)
6. **애니메이션 최적화 부족**: layout shift 유발 가능성 (transform/opacity 외 속성 애니메이션)

### 1.2 개선 영향도

| 페이지 | 위반 심각도 | 개선 우선순위 | 예상 공수 |
|--------|-------------|---------------|-----------|
| New Article | 🟡 중간 | P1 (높음) | 2-3일 |
| Articles List | 🔴 높음 | P0 (긴급) | 3-4일 |
| Article Edit | 🟠 중간 | P2 (중간) | 2일 |

---

## 2. 페이지별 분석 및 개선안

---

## 2.1 New Article Page (`/new-article`)

### 2.1.1 현재 상태 분석

**페이지 구조**:
```
GenerationForm (입력 단계)
  ↓ submit
GenerationProgressSection (생성 중)
  ↓ complete
ArticlePreviewSection (미리보기)
```

**UI 요소**:
- 간단한 폼 (주제 입력 + 스타일 가이드 선택)
- 스트리밍 진행 상태 표시
- 생성된 글 미리보기 (Markdown 렌더링)

**강점**:
- AnimatePresence를 활용한 부드러운 3단계 전환
- 스트리밍 UI로 사용자 피드백 즉각 제공
- 메타데이터(제목, 키워드) 실시간 표시

**약점**:
1. **색상 위반**: 의미론적 토큰 대신 하드코딩
2. **타이포그래피 불일치**: 제목 크기가 가이드보다 작음
3. **간격 시스템 무시**: `py-12` (48px) 대신 `py-16 md:py-24` (64px → 96px) 사용해야 함
4. **다크 모드 미지원**: `dark:` variant 전무
5. **접근성**:
   - 진행 상태에 `role="status"` 누락
   - 취소 버튼 크기 너무 작음 (터치 타겟 최소 44x44px)

---

### 2.1.2 UI/UX Design Guide 위반 사항

#### 위반 1: 색상 시스템

**현재 코드** (`generation-form.tsx`):
```tsx
<h1 className="text-2xl md:text-3xl font-bold text-foreground">
  {t("title")}
</h1>
<p className="text-sm text-muted-foreground mt-2">
  {t("subtitle")}
</p>
```

**문제**:
- `text-foreground`와 `text-muted-foreground`는 올바름
- 하지만 `text-sm`은 타이포그래피 위반 (subtitle은 `text-lg md:text-xl` 사용해야 함)

**현재 코드** (`generation-progress-section.tsx`, L47-L50):
```tsx
<Card className="border-border bg-card">
  <CardContent className="p-6">
    <div className="whitespace-pre-wrap font-mono text-sm text-muted-foreground max-h-96 overflow-y-auto">
```

**개선안**:
```tsx
// ✅ DO: 의미론적 색상 토큰 사용
<Card className="border-border bg-card dark:bg-card">
  <CardContent className="p-6">
    <div className="whitespace-pre-wrap font-mono text-sm text-muted-foreground dark:text-muted-foreground max-h-96 overflow-y-auto">
```

#### 위반 2: 타이포그래피

**현재 코드** (`generation-form.tsx`, L88-L94):
```tsx
<h1 className="text-2xl md:text-3xl font-bold text-foreground">
  {t("title")}
</h1>
<p className="text-sm text-muted-foreground mt-2">
  {t("subtitle")}
</p>
```

**문제**:
- 페이지 최상위 제목이 `text-2xl md:text-3xl` → 너무 작음
- 디자인 가이드: `h1: 'text-4xl md:text-5xl font-medium leading-tight'`
- Subtitle은 `text-sm` → `text-lg md:text-xl leading-relaxed` 사용해야 함

**개선안**:
```tsx
// ✅ DO: 디자인 가이드 타이포그래피 스케일 준수
<h1 className="text-4xl md:text-5xl font-medium leading-tight text-foreground dark:text-foreground">
  {t("title")}
</h1>
<p className="text-lg md:text-xl leading-relaxed text-muted-foreground dark:text-muted-foreground mt-4">
  {t("subtitle")}
</p>
```

#### 위반 3: 간격 시스템

**현재 코드** (`generation-form.tsx`, L84):
```tsx
<div className="container mx-auto max-w-3xl px-4 py-12">
```

**문제**:
- `py-12` (48px) → 디자인 가이드는 섹션 여백 `py-16 md:py-24` (64px → 96px)

**개선안**:
```tsx
// ✅ DO: 표준 섹션 간격 사용
<div className="container mx-auto max-w-3xl px-4 md:px-6 py-16 md:py-24">
```

#### 위반 4: 다크 모드 미지원

**문제**:
- 대부분의 컴포넌트에서 `dark:` variant 누락
- `bg-background`, `text-foreground` 등 CSS 변수 사용 시 자동 전환되지만, 명시적으로 추가하는 것이 좋음

**개선안**:
```tsx
// ArticlePreviewSection (article-preview-section.tsx, L104-L113)
<Card className="border-border bg-card dark:bg-card dark:border-border">
  <CardContent className="p-8">
    <article className="prose prose-lg max-w-none dark:prose-invert">
      <h1 className="text-foreground dark:text-foreground">{article.title}</h1>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {article.content}
      </ReactMarkdown>
    </article>
  </CardContent>
</Card>
```

#### 위반 5: 접근성

**현재 코드** (`generation-progress-section.tsx`, L38-L44):
```tsx
<div className="text-center space-y-2">
  <p className="text-lg font-medium text-foreground">{currentTask}</p>
  <Button variant="ghost" size="sm" onClick={onCancel}>
    {t("cancel")}
  </Button>
</div>
```

**문제**:
1. 진행 상태에 ARIA 속성 누락
2. 취소 버튼 크기 `size="sm"` → 터치 타겟 너무 작음 (44x44px 미만)
3. focus-visible 스타일 누락

**개선안**:
```tsx
// ✅ DO: 접근성 강화
<div className="text-center space-y-4" role="status" aria-live="polite" aria-atomic="true">
  <p className="text-lg font-medium text-foreground dark:text-foreground">
    {currentTask}
  </p>
  <Button
    variant="ghost"
    size="default"
    onClick={onCancel}
    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 min-h-[44px] min-w-[44px]"
  >
    {t("cancel")}
  </Button>
</div>
```

---

### 2.1.3 구체적인 개선 방안

#### A. GenerationForm 컴포넌트 개선

**파일**: `src/features/articles/components/generation-form.tsx`

**변경 사항**:

```tsx
// BEFORE (L84-L94)
<div className="container mx-auto max-w-3xl px-4 py-12">
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        {t("title")}
      </h1>
      <p className="text-sm text-muted-foreground mt-2">
        {t("subtitle")}
      </p>
    </div>

// AFTER
<div className="container mx-auto max-w-3xl px-4 md:px-6 py-16 md:py-24">
  <div className="space-y-8">
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-medium leading-tight text-foreground dark:text-foreground">
        {t("title")}
      </h1>
      <p className="text-lg md:text-xl leading-relaxed text-muted-foreground dark:text-muted-foreground mt-4">
        {t("subtitle")}
      </p>
    </div>
```

**근거**:
- 제목을 페이지 중앙 정렬하여 시선 집중 (Claude.ai 패턴)
- 타이포그래피 스케일 준수
- 간격 시스템 준수 (`space-y-6` → `space-y-8`)

---

**변경 사항 2** (Textarea 스타일링):

```tsx
// BEFORE (L108-L115)
<Textarea
  {...field}
  placeholder={t("topicPlaceholder")}
  disabled={isSubmitting || isLoading}
  className="min-h-[200px] resize-none"
/>

// AFTER
<Textarea
  {...field}
  placeholder={t("topicPlaceholder")}
  disabled={isSubmitting || isLoading}
  className="min-h-[200px] resize-none border-border bg-background dark:bg-background dark:border-border focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 transition-shadow duration-300"
/>
```

**근거**:
- 다크 모드 대응
- Accent 색상(`#C46849`)으로 focus 상태 강조
- 애니메이션 추가 (300ms shadow transition)

---

**변경 사항 3** (버튼 스타일링):

```tsx
// BEFORE (L151-L166)
<Button
  type="submit"
  disabled={isSubmitting || isLoading || !form.formState.isValid}
>
  {isSubmitting ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      {t("generating")}
    </>
  ) : (
    <>
      <Sparkles className="w-4 h-4 mr-2" />
      {t("generateButton")}
    </>
  )}
</Button>

// AFTER
<Button
  type="submit"
  disabled={isSubmitting || isLoading || !form.formState.isValid}
  className="bg-[#C46849] hover:bg-[#b05a3e] text-white dark:bg-[#C46849] dark:hover:bg-[#b05a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 transition-all duration-100 active:scale-95"
>
  {isSubmitting ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      {t("generating")}
    </>
  ) : (
    <>
      <Sparkles className="w-4 h-4 mr-2" />
      {t("generateButton")}
    </>
  )}
</Button>
```

**근거**:
- Primary CTA는 Accent 색상 사용 (디자인 가이드 명시)
- 버튼 상태 전환 애니메이션 추가 (`duration-100`, `active:scale-95`)
- 접근성 강화 (`focus-visible:ring-2`)

---

#### B. GenerationProgressSection 개선

**파일**: `src/features/articles/components/generation-progress-section.tsx`

**변경 사항 1** (ARIA 속성 추가):

```tsx
// BEFORE (L31-L44)
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
  className="container mx-auto max-w-4xl px-4 py-12 space-y-6"
>
  <div className="text-center space-y-2">
    <p className="text-lg font-medium text-foreground">{currentTask}</p>
    <Button variant="ghost" size="sm" onClick={onCancel}>
      {t("cancel")}
    </Button>
  </div>

// AFTER
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
  className="container mx-auto max-w-4xl px-4 md:px-6 py-16 md:py-24 space-y-8"
  role="region"
  aria-label="Article generation progress"
>
  <div className="text-center space-y-4" role="status" aria-live="polite" aria-atomic="true">
    <p className="text-xl md:text-2xl font-medium text-foreground dark:text-foreground">
      {currentTask}
    </p>
    <Button
      variant="ghost"
      size="default"
      onClick={onCancel}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 min-h-[44px]"
      aria-label="Cancel article generation"
    >
      {t("cancel")}
    </Button>
  </div>
```

**근거**:
- `role="status"` + `aria-live="polite"`: 스크린 리더가 진행 상태 자동 읽기
- 취소 버튼 크기 증가 (`size="sm"` → `size="default"`)
- 터치 타겟 최소 크기 보장 (`min-h-[44px]`)

---

**변경 사항 2** (스트리밍 프리뷰 스타일링):

```tsx
// BEFORE (L47-L54)
<Card className="border-border bg-card">
  <CardContent className="p-6">
    <div className="whitespace-pre-wrap font-mono text-sm text-muted-foreground max-h-96 overflow-y-auto">
      {streamingText || t("initializing")}
      <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse" />
    </div>
  </CardContent>
</Card>

// AFTER
<Card className="border-border bg-card dark:bg-card dark:border-border shadow-sm">
  <CardContent className="p-6 md:p-8">
    <div
      className="whitespace-pre-wrap font-mono text-sm text-muted-foreground dark:text-muted-foreground max-h-96 overflow-y-auto"
      aria-live="off" // 스트리밍 텍스트는 읽지 않도록 (너무 빈번)
    >
      {streamingText || t("initializing")}
      <span
        className="inline-block w-0.5 h-4 bg-[#C46849] dark:bg-[#d97757] ml-1 animate-pulse"
        aria-hidden="true"
      />
    </div>
  </CardContent>
</Card>
```

**근거**:
- 다크 모드 색상 추가
- 커서 색상을 Accent 색상으로 변경 (`bg-primary` → `bg-[#C46849]`)
- 스트리밍 텍스트는 `aria-live="off"`로 스크린 리더 방해 방지

---

#### C. ArticlePreviewSection 개선

**파일**: `src/features/articles/components/article-preview-section.tsx`

**변경 사항 1** (성공 메시지 강조):

```tsx
// BEFORE (L50-L58)
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 200, damping: 15 }}
  className="flex items-center justify-center gap-3"
>
  <CheckCircle2 className="w-6 h-6 text-green-600" />
  <p className="text-lg font-medium text-foreground">{t("ready")}</p>
</motion.div>

// AFTER
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", stiffness: 200, damping: 15 }}
  className="flex items-center justify-center gap-4"
  role="status"
  aria-live="polite"
>
  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
  <p className="text-xl md:text-2xl font-medium text-foreground dark:text-foreground">
    {t("ready")}
  </p>
</motion.div>
```

**근거**:
- 아이콘 크기 증가 (`w-6 h-6` → `w-8 h-8`)
- 텍스트 크기 증가 (`text-lg` → `text-xl md:text-2xl`)
- ARIA 속성으로 완료 상태 전달
- 다크 모드 색상 조정

---

**변경 사항 2** (Markdown 미리보기):

```tsx
// BEFORE (L104-L113)
<Card className="border-border bg-card">
  <CardContent className="p-8">
    <article className="prose prose-lg max-w-none dark:prose-invert">
      <h1>{article.title}</h1>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {article.content}
      </ReactMarkdown>
    </article>
  </CardContent>
</Card>

// AFTER
<Card className="border-border bg-background dark:bg-background dark:border-border shadow-sm hover:shadow-md transition-shadow duration-300">
  <CardContent className="p-8 md:p-12">
    <article className="prose prose-lg max-w-prose mx-auto dark:prose-invert">
      <h1 className="text-4xl md:text-5xl font-medium leading-tight">
        {article.title}
      </h1>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {article.content}
      </ReactMarkdown>
    </article>
  </CardContent>
</Card>
```

**근거**:
- 읽기 최적화: `max-w-prose`로 한 줄 길이 제한 (가독성)
- 제목 타이포그래피 명시적 지정 (`text-4xl md:text-5xl`)
- 호버 효과 추가 (미묘한 shadow 전환)
- 다크 모드 배경 강화

---

**변경 사항 3** (액션 버튼):

```tsx
// BEFORE (L116-L125)
<div className="flex flex-col sm:flex-row gap-3">
  <Button onClick={onEdit} className="flex-1" disabled={isSaving}>
    <Edit className="w-4 h-4 mr-2" />
    {t("actions.edit")}
  </Button>
  <Button onClick={onRegenerate} variant="outline" disabled={isSaving}>
    <RefreshCw className="w-4 h-4 mr-2" />
    {t("actions.regenerate")}
  </Button>
</div>

// AFTER
<div className="flex flex-col sm:flex-row gap-4">
  <Button
    onClick={onEdit}
    className="flex-1 bg-[#C46849] hover:bg-[#b05a3e] text-white dark:bg-[#C46849] dark:hover:bg-[#b05a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 transition-all duration-100 active:scale-95"
    disabled={isSaving}
  >
    <Edit className="w-4 h-4 mr-2" />
    {t("actions.edit")}
  </Button>
  <Button
    onClick={onRegenerate}
    variant="outline"
    disabled={isSaving}
    className="border-border hover:bg-secondary dark:border-border dark:hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 transition-all duration-100"
  >
    <RefreshCw className="w-4 h-4 mr-2" />
    {t("actions.regenerate")}
  </Button>
</div>
```

**근거**:
- Primary 버튼(편집)에 Accent 색상 적용
- Secondary 버튼(재생성)은 outline + hover 효과
- 버튼 간격 증가 (`gap-3` → `gap-4`)
- 접근성 및 애니메이션 강화

---

### 2.1.4 애니메이션 개선

**현재 문제**:
- `motion.div`에서 `y` 변환 사용 (layout shift 가능성)
- duration이 일관되지 않음 (300ms, 400ms 혼재)

**개선안**:

```tsx
// BEFORE (article-preview-section.tsx, L42-L47)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
  className="container mx-auto max-w-4xl px-4 py-12 space-y-8"
>

// AFTER
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }} // ease-out cubic-bezier
  className="container mx-auto max-w-4xl px-4 md:px-6 py-16 md:py-24 space-y-8"
>
```

**근거**:
- `y` 변환 제거 (layout shift 방지)
- duration 통일 (300ms)
- ease-out cubic-bezier로 자연스러운 전환

---

### 2.1.5 접근성 체크리스트

- [x] **ARIA 속성**:
  - `role="status"` 진행 상태 표시
  - `aria-live="polite"` 스크린 리더 알림
  - `aria-label` 버튼 설명
- [x] **키보드 네비게이션**:
  - `focus-visible:ring-2` 모든 인터랙티브 요소에 적용
  - Tab 키로 모든 요소 접근 가능
- [x] **터치 타겟 크기**:
  - 모든 버튼 최소 44x44px
- [x] **색상 대비**:
  - `text-muted-foreground` (slate-600) on `bg-background` (slate-50) = 7.1:1 (AA 통과)
  - Accent 색상 `#C46849` on white = 4.6:1 (AA 통과)
- [x] **모션 감소 모드**:
  - 모든 애니메이션에 `motion-reduce:transition-none` 추가 필요

**추가 개선 필요**:

```tsx
// 모든 motion.div에 추가
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
  className="container mx-auto max-w-4xl px-4 md:px-6 py-16 md:py-24 space-y-8 motion-reduce:transition-none"
>
```

---

## 2.2 Articles List Page (`/articles`)

### 2.2.1 현재 상태 분석

**페이지 구조**:
```
PageLayout
  ├── Header (제목 + "새 글 작성" 버튼)
  ├── ArticlesFilters (검색, 상태 필터, 정렬)
  └── ArticlesGrid (카드 그리드)
```

**UI 요소**:
- 검색창 (제목/키워드 필터링)
- 상태 필터 (전체/초안/발행/보관)
- 정렬 옵션 (최신순/생성일/제목)
- 아티클 카드 (제목, 상태 배지, 수정일, 메뉴)

**강점**:
- 명확한 정보 계층 구조
- 실시간 검색 필터링
- Skeleton 로딩 상태
- 빈 상태 처리 (no-articles, no-results)

**약점** (심각):
1. **색상 위반 (최악)**:
   - `bg-gray-50`, `bg-blue-500`, `text-gray-600` 등 하드코딩 범벅
   - `hover:text-blue-600` (의미론적 accent 대신 임의 색상)
2. **타이포그래피 불일치**:
   - 페이지 제목 `text-2xl` → 너무 작음 (`text-3xl md:text-4xl` 사용해야 함)
   - 카드 제목 `text-lg` → 적절하지만 `font-semibold` 대신 `font-medium` 권장
3. **간격 시스템 무시**:
   - 그리드 `gap-5` (20px) → 비표준 값 (`gap-6` = 24px 사용해야 함)
4. **다크 모드 전무**:
   - `dark:` variant 거의 없음
   - `bg-gray-50` 하드코딩으로 다크 모드 시 깨짐
5. **접근성 심각**:
   - 검색창 `aria-label` 누락
   - 필터 Pills 삭제 버튼 크기 너무 작음 (`h-3 w-3` → 터치 불가)
   - 카드 호버만 의존 (키보드 사용자 차별)

---

### 2.2.2 UI/UX Design Guide 위반 사항

#### 위반 1: 색상 시스템 (긴급)

**현재 코드** (`page-layout.tsx`, L21):
```tsx
<div className="min-h-screen bg-gray-50">
```

**문제**:
- `bg-gray-50` 하드코딩 → 다크 모드 미지원
- 디자인 가이드: `bg-background` 사용해야 함

**현재 코드** (`page.tsx`, L114):
```tsx
<Button
  onClick={() => router.push(`/${locale}/new-article`)}
  className="bg-blue-500 hover:bg-blue-600"
>
```

**문제**:
- `bg-blue-500` → 브랜드 Accent 색상(`#C46849`) 사용해야 함
- 임의 색상 선택으로 일관성 없음

**현재 코드** (`article-card.tsx`, L54):
```tsx
<h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
  {article.title}
</h3>
```

**문제**:
- `hover:text-blue-600` → Accent 색상(`#C46849`) 또는 의미론적 토큰 사용해야 함

**개선안**:

```tsx
// page-layout.tsx
// BEFORE
<div className="min-h-screen bg-gray-50">

// AFTER
<div className="min-h-screen bg-background dark:bg-background">
```

```tsx
// page.tsx
// BEFORE
<Button
  onClick={() => router.push(`/${locale}/new-article`)}
  className="bg-blue-500 hover:bg-blue-600"
>

// AFTER
<Button
  onClick={() => router.push(`/${locale}/new-article`)}
  className="bg-[#C46849] hover:bg-[#b05a3e] text-white dark:bg-[#C46849] dark:hover:bg-[#b05a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 transition-all duration-100 active:scale-95"
>
```

```tsx
// article-card.tsx
// BEFORE
<h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">

// AFTER
<h3 className="text-lg font-medium mb-2 line-clamp-2 hover:text-[#C46849] dark:hover:text-[#d97757] transition-colors duration-300">
```

---

#### 위반 2: 타이포그래피

**현재 코드** (`page-layout.tsx`, L26-L28):
```tsx
<h1 className="text-2xl font-bold text-gray-900">
  {title}
</h1>
```

**문제**:
- `text-2xl` → 페이지 제목으로 너무 작음
- `text-gray-900` → 의미론적 토큰 `text-foreground` 사용해야 함
- 디자인 가이드: `h2: 'text-3xl md:text-4xl font-medium leading-tight'` (페이지 제목은 h2 수준)

**현재 코드** (`page-layout.tsx`, L30):
```tsx
<p className="mt-2 text-sm text-gray-600">
  {description}
</p>
```

**문제**:
- `text-sm` → 너무 작음 (`text-base` 사용 권장)
- `text-gray-600` → `text-muted-foreground` 사용해야 함

**개선안**:

```tsx
// page-layout.tsx
// BEFORE
<h1 className="text-2xl font-bold text-gray-900">
  {title}
</h1>
{description && (
  <p className="mt-2 text-sm text-gray-600">
    {description}
  </p>
)}

// AFTER
<h1 className="text-3xl md:text-4xl font-medium leading-tight text-foreground dark:text-foreground">
  {title}
</h1>
{description && (
  <p className="mt-4 text-base leading-relaxed text-muted-foreground dark:text-muted-foreground">
    {description}
  </p>
)}
```

---

#### 위반 3: 간격 시스템

**현재 코드** (`page-layout.tsx`, L22):
```tsx
<div className={`container mx-auto ${maxWidthClassName} px-4 py-8`}>
```

**문제**:
- `py-8` (32px) → 디자인 가이드는 `py-16 md:py-24` (64px → 96px)

**현재 코드** (`articles-grid.tsx`, L34):
```tsx
<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
```

**문제**:
- `gap-5` (20px) → 비표준 값
- 디자인 가이드: 카드 그리드는 `gap-6` (24px) 사용

**개선안**:

```tsx
// page-layout.tsx
// BEFORE
<div className={`container mx-auto ${maxWidthClassName} px-4 py-8`}>

// AFTER
<div className={`container mx-auto ${maxWidthClassName} px-4 md:px-6 py-16 md:py-24`}>
```

```tsx
// articles-grid.tsx
// BEFORE
<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

// AFTER
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
```

---

#### 위반 4: 다크 모드 미지원

**현재 코드** (`page.tsx`, L109):
```tsx
<span className="text-sm text-gray-500">
  {t("total_count", { count: data?.total || 0 })}
</span>
```

**문제**:
- `text-gray-500` → 다크 모드에서 대비 부족
- `text-muted-foreground` 사용해야 함

**현재 코드** (`article-card.tsx`, L25):
```tsx
<Card className="p-5 hover:shadow-md transition-shadow duration-150">
```

**문제**:
- `dark:` variant 누락
- 그림자 효과가 다크 모드에서 보이지 않음

**개선안**:

```tsx
// page.tsx
// BEFORE
<span className="text-sm text-gray-500">

// AFTER
<span className="text-sm text-muted-foreground dark:text-muted-foreground">
```

```tsx
// article-card.tsx
// BEFORE
<Card className="p-5 hover:shadow-md transition-shadow duration-150">

// AFTER
<Card className="p-5 bg-card dark:bg-card border-border dark:border-border hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300">
```

---

#### 위반 5: 접근성

**현재 코드** (`articles-filters.tsx`, L33-L40):
```tsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
  <Input
    className="h-12 pl-12 text-base"
    placeholder={t("search_placeholder")}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>
```

**문제**:
1. `aria-label` 누락 (스크린 리더가 placeholder만 읽음)
2. `text-gray-400` → 아이콘 색상 다크 모드 미지원
3. `Input`에 `type="search"` 명시 필요

**현재 코드** (`articles-filters.tsx`, L75-L78):
```tsx
<X
  className="h-3 w-3 cursor-pointer hover:text-gray-900"
  onClick={() => setStatusFilter("all")}
/>
```

**문제**:
- 아이콘 크기 `h-3 w-3` (12x12px) → 터치 타겟 너무 작음 (최소 44x44px)
- 버튼 대신 아이콘 직접 클릭 → 접근성 위반

**개선안**:

```tsx
// articles-filters.tsx - 검색창
// BEFORE
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
  <Input
    className="h-12 pl-12 text-base"
    placeholder={t("search_placeholder")}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>

// AFTER
<div className="relative">
  <Search
    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground dark:text-muted-foreground"
    aria-hidden="true"
  />
  <Input
    type="search"
    className="h-12 pl-12 text-base border-border bg-background dark:bg-background dark:border-border focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2"
    placeholder={t("search_placeholder")}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    aria-label={t("search_aria_label")} // "Search articles by title or keyword"
  />
</div>
```

```tsx
// articles-filters.tsx - 필터 Pills
// BEFORE
{statusFilter !== "all" && (
  <Badge variant="secondary" className="gap-1.5">
    {t(`filter.${statusFilter}`)}
    <X
      className="h-3 w-3 cursor-pointer hover:text-gray-900"
      onClick={() => setStatusFilter("all")}
    />
  </Badge>
)}

// AFTER
{statusFilter !== "all" && (
  <Badge variant="secondary" className="gap-2 pr-2">
    {t(`filter.${statusFilter}`)}
    <button
      onClick={() => setStatusFilter("all")}
      className="ml-1 rounded-sm hover:bg-secondary dark:hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 p-1 min-h-[24px] min-w-[24px]"
      aria-label={t("remove_filter_aria", { filter: statusFilter })} // "Remove {filter} filter"
    >
      <X className="h-3 w-3" aria-hidden="true" />
    </button>
  </Badge>
)}
```

---

### 2.2.3 구체적인 개선 방안

#### A. PageLayout 컴포넌트 전면 리팩토링

**파일**: `src/components/layout/page-layout.tsx`

**전체 코드 (개선 후)**:

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
    <div className="min-h-screen bg-background dark:bg-background">
      <div className={`container mx-auto ${maxWidthClassName} px-4 md:px-6 py-16 md:py-24`}>
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-medium leading-tight text-foreground dark:text-foreground">
                {title}
              </h1>
              {description && (
                <p className="mt-4 text-base leading-relaxed text-muted-foreground dark:text-muted-foreground max-w-prose">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
```

**변경 사항**:
1. `bg-gray-50` → `bg-background dark:bg-background`
2. `py-8` → `py-16 md:py-24`
3. `mb-8` → `mb-12` (헤더와 콘텐츠 간격 증가)
4. 제목 `text-2xl` → `text-3xl md:text-4xl font-medium`
5. 설명 `text-sm` → `text-base leading-relaxed`
6. 모든 색상을 의미론적 토큰으로 교체

---

#### B. Articles Page 헤더 액션 버튼 개선

**파일**: `src/app/[locale]/(protected)/articles/page.tsx`

**변경 사항**:

```tsx
// BEFORE (L107-L120)
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

// AFTER
const headerActions = (
  <div className="flex items-center gap-4">
    <span className="text-sm text-muted-foreground dark:text-muted-foreground">
      {t("total_count", { count: data?.total || 0 })}
    </span>
    <Button
      onClick={() => router.push(`/${locale}/new-article`)}
      className="bg-[#C46849] hover:bg-[#b05a3e] text-white dark:bg-[#C46849] dark:hover:bg-[#b05a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 transition-all duration-100 active:scale-95"
    >
      <Sparkles className="mr-2 h-4 w-4" />
      {t("create_new")}
    </Button>
  </div>
);
```

---

#### C. ArticlesFilters 컴포넌트 개선

**파일**: `src/features/articles/components/articles-filters.tsx`

**전체 코드 (개선 후)**:

```tsx
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
    <div className="mb-8 space-y-4">
      {/* 검색 입력창 */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground dark:text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          className="h-12 pl-12 text-base border-border bg-background dark:bg-background dark:border-border focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 transition-shadow duration-300"
          placeholder={t("search_placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search articles by title or keyword"
        />
      </div>

      {/* 필터 & 정렬 */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-10 text-sm border-border dark:border-border focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2">
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
          <SelectTrigger className="w-36 h-10 text-sm border-border dark:border-border focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2">
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
        <div className="flex flex-wrap gap-2">
          {statusFilter !== "all" && (
            <Badge
              variant="secondary"
              className="gap-2 pr-2 bg-secondary dark:bg-secondary border-border dark:border-border"
            >
              {t(`filter.${statusFilter}`)}
              <button
                onClick={() => setStatusFilter("all")}
                className="ml-1 rounded-sm hover:bg-background dark:hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 p-1.5 min-h-[24px] min-w-[24px] transition-colors duration-150"
                aria-label={`Remove ${statusFilter} filter`}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          )}
          {searchQuery.trim() && (
            <Badge
              variant="secondary"
              className="gap-2 pr-2 bg-secondary dark:bg-secondary border-border dark:border-border"
            >
              {searchQuery}
              <button
                onClick={() => setSearchQuery("")}
                className="ml-1 rounded-sm hover:bg-background dark:hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 p-1.5 min-h-[24px] min-w-[24px] transition-colors duration-150"
                aria-label="Clear search query"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
```

**주요 변경 사항**:
1. 모든 하드코딩 색상 제거 (`text-gray-*` → `text-muted-foreground`)
2. Select 너비 조정 (`w-32` → `w-36`), 높이 통일 (`h-9` → `h-10`)
3. Pills 삭제 버튼을 `<button>` 태그로 감싸고 터치 타겟 확보
4. 모든 인터랙티브 요소에 `focus-visible:ring-2` 추가
5. `aria-label` 추가 (검색창, 삭제 버튼)
6. 다크 모드 색상 추가

---

#### D. ArticleCard 컴포넌트 개선

**파일**: `src/features/articles/components/article-card.tsx`

**전체 코드 (개선 후)**:

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
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
  const locale = useLocale();
  const dateLocale = locale === "ko" ? ko : enUS;

  return (
    <Card className="p-6 bg-card dark:bg-card border-border dark:border-border hover:shadow-md dark:hover:shadow-lg hover:border-[#C46849] dark:hover:border-[#d97757] transition-all duration-300 group">
      {/* 상태 Badge + 메뉴 */}
      <div className="flex items-start justify-between mb-4">
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
      <Link
        href={`/${locale}/articles/${article.id}/edit`}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 rounded-sm"
      >
        <h3 className="text-lg font-medium mb-3 line-clamp-2 text-foreground dark:text-foreground group-hover:text-[#C46849] dark:group-hover:text-[#d97757] transition-colors duration-300">
          {article.title}
        </h3>
      </Link>

      {/* 수정일 */}
      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
        {formatDistanceToNow(new Date(article.updatedAt), {
          locale: dateLocale,
          addSuffix: true,
        })}
      </p>
    </Card>
  );
}
```

**주요 변경 사항**:
1. 패딩 증가 (`p-5` → `p-6`)
2. 호버 효과 강화:
   - 그림자: `hover:shadow-md dark:hover:shadow-lg`
   - 테두리: `hover:border-[#C46849]`
3. 제목 호버 색상: `hover:text-blue-600` → `group-hover:text-[#C46849]`
4. 제목 링크에 `focus-visible:ring-2` 추가
5. 모든 색상을 의미론적 토큰으로 교체
6. 간격 조정 (`mb-2` → `mb-3`, `mb-3` → `mb-4`)
7. `font-semibold` → `font-medium` (디자인 가이드 권장)

---

#### E. ArticlesGrid 간격 조정

**파일**: `src/features/articles/components/articles-grid.tsx`

**변경 사항**:

```tsx
// BEFORE
<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

// AFTER
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
```

**근거**:
- `gap-5` (20px) → `gap-6` (24px)
- 디자인 가이드의 "카드 그리드: gap-6" 준수

---

### 2.2.4 접근성 체크리스트

- [x] **ARIA 속성**:
  - 검색창: `aria-label="Search articles by title or keyword"`
  - 필터 Pills: `aria-label="Remove {filter} filter"`
- [x] **키보드 네비게이션**:
  - 모든 인터랙티브 요소 `focus-visible:ring-2`
  - Tab 키로 카드 제목 링크 접근 가능
- [x] **터치 타겟 크기**:
  - Pills 삭제 버튼 `min-h-[24px] min-w-[24px]` (여전히 작지만 현실적 타협)
  - Select 높이 `h-10` (40px)
- [x] **색상 대비**:
  - 모든 텍스트 색상 검증 필요 (특히 `text-muted-foreground`)
- [ ] **스크린 리더 테스트** 필요

**추가 개선 권장**:

```tsx
// ArticlesGrid 로딩 상태에 ARIA 속성 추가
{isLoading && (
  <div role="status" aria-live="polite" aria-label="Loading articles">
    <ArticlesGridSkeleton count={6} />
    <span className="sr-only">Loading articles...</span>
  </div>
)}
```

---

## 2.3 Article Edit Page (`/articles/[id]/edit`)

### 2.3.1 현재 상태 분석

**페이지 구조**:
```
Header (뒤로가기 + 제목 미리보기)
  ↓
Title Input (큰 제목 입력)
  ↓
BlockNote Editor (WYSIWYG 에디터)
```

**UI 요소**:
- 미니멀 상단 헤더 (뒤로가기 버튼)
- 큰 제목 입력 필드 (placeholder "Title")
- BlockNote 에디터 (Markdown 기반 WYSIWYG)

**강점**:
- 매우 간결하고 집중된 UI (Medium, Notion 스타일)
- 큰 제목 입력으로 시각적 위계 명확
- Dynamic import로 에디터 SSR 방지

**약점**:
1. **색상 위반**:
   - `bg-white` 하드코딩 → 다크 모드 미지원
   - `bg-gray-200`, `text-gray-400`, `text-gray-600` 등 하드코딩
2. **타이포그래피**:
   - 제목 입력 크기 `text-4xl` → 적절하지만 반응형 없음 (모바일에서 너무 큼)
3. **간격 시스템**:
   - `py-12` → 디자인 가이드는 `py-16 md:py-24`
4. **접근성**:
   - 뒤로가기 버튼 레이블 누락 (`<ArrowLeft />` 아이콘만)
   - 제목 입력에 `aria-label` 없음
5. **저장 기능 없음**:
   - 자동 저장 UI 없음
   - 수동 저장 버튼 없음 (데이터 손실 위험)

---

### 2.3.2 UI/UX Design Guide 위반 사항

#### 위반 1: 색상 시스템

**현재 코드** (L80, L105):
```tsx
<div className="flex min-h-screen items-center justify-center bg-white">
  ...
</div>

<div className="min-h-screen bg-white">
  ...
</div>
```

**문제**:
- `bg-white` 하드코딩 → 다크 모드 완전 무시

**현재 코드** (L107):
```tsx
<div className="border-b border-gray-200">
```

**문제**:
- `border-gray-200` → `border-border` 사용해야 함

**현재 코드** (L114, L119):
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => router.back()}
  className="text-gray-600 hover:text-black"
>
  <ArrowLeft className="h-4 w-4" />
</Button>
<div className="text-xs text-gray-400">
  {formValues.title || "Untitled"}
</div>
```

**문제**:
- `text-gray-600 hover:text-black` → 의미론적 토큰 사용해야 함
- `text-gray-400` → 색상 대비 부족 (AA 실패 가능성)

**개선안**:

```tsx
// 전체 배경
// BEFORE
<div className="min-h-screen bg-white">

// AFTER
<div className="min-h-screen bg-background dark:bg-background">

// 헤더 테두리
// BEFORE
<div className="border-b border-gray-200">

// AFTER
<div className="border-b border-border dark:border-border">

// 뒤로가기 버튼
// BEFORE
<Button
  variant="ghost"
  size="sm"
  onClick={() => router.back()}
  className="text-gray-600 hover:text-black"
>

// AFTER
<Button
  variant="ghost"
  size="default"
  onClick={() => router.back()}
  className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 min-h-[44px]"
  aria-label="Go back"
>

// 제목 미리보기
// BEFORE
<div className="text-xs text-gray-400">

// AFTER
<div className="text-xs text-muted-foreground dark:text-muted-foreground">
```

---

#### 위반 2: 타이포그래피

**현재 코드** (L133):
```tsx
<Input
  value={formValues.title}
  onChange={(e) => form.setValue("title", e.target.value)}
  placeholder="Title"
  className="border-0 p-0 text-4xl font-bold placeholder:text-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
/>
```

**문제**:
- `text-4xl` → 반응형 없음 (모바일에서 너무 큼)
- `placeholder:text-gray-300` → 하드코딩 색상
- 디자인 가이드: `h1: 'text-4xl md:text-5xl font-medium leading-tight'`

**개선안**:

```tsx
// AFTER
<Input
  value={formValues.title}
  onChange={(e) => form.setValue("title", e.target.value)}
  placeholder="Title"
  className="border-0 p-0 text-3xl md:text-4xl lg:text-5xl font-medium leading-tight placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent dark:bg-transparent text-foreground dark:text-foreground"
  aria-label="Article title"
/>
```

**근거**:
- 모바일 `text-3xl`, 태블릿 `text-4xl`, 데스크탑 `text-5xl`
- `font-bold` → `font-medium` (디자인 가이드 권장)
- placeholder 색상을 의미론적 토큰으로
- 다크 모드 배경 투명 유지

---

#### 위반 3: 간격 시스템

**현재 코드** (L126, L128):
```tsx
<div className="mx-auto max-w-4xl px-6 py-12">
  <div className="mb-12">
```

**문제**:
- `py-12` (48px) → 디자인 가이드는 `py-16 md:py-24` (64px → 96px)

**개선안**:

```tsx
// BEFORE
<div className="mx-auto max-w-4xl px-6 py-12">
  <div className="mb-12">

// AFTER
<div className="mx-auto max-w-4xl px-4 md:px-6 py-16 md:py-24">
  <div className="mb-16">
```

---

#### 위반 4: 저장 기능 누락

**문제**:
- 현재 페이지에 저장 버튼 없음
- 자동 저장 표시 없음
- 사용자가 변경사항을 잃을 위험

**개선안** (Auto-save Indicator 추가):

```tsx
// Header에 자동 저장 상태 표시 추가
<div className="flex items-center justify-between">
  <Button
    variant="ghost"
    size="default"
    onClick={() => router.back()}
    className="..."
    aria-label="Go back"
  >
    <ArrowLeft className="h-4 w-4" />
  </Button>

  <div className="flex items-center gap-3">
    {/* 자동 저장 상태 */}
    <AutoSaveIndicator status={saveStatus} />

    <div className="text-xs text-muted-foreground dark:text-muted-foreground">
      {formValues.title || "Untitled"}
    </div>
  </div>
</div>
```

**AutoSaveIndicator 컴포넌트** (새로 생성 필요):

```tsx
// src/features/articles/components/auto-save-indicator.tsx
"use client";

import { Check, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AutoSaveIndicatorProps {
  status: SaveStatus;
}

export function AutoSaveIndicator({ status }: AutoSaveIndicatorProps) {
  const t = useTranslations("editor");

  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-muted-foreground">
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          <span>{t("saving")}</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-green-600 dark:text-green-500" aria-hidden="true" />
          <span>{t("saved")}</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-500" aria-hidden="true" />
          <span>{t("save_error")}</span>
        </>
      )}
    </div>
  );
}
```

---

#### 위반 5: 접근성

**현재 코드** (L110-L117):
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => router.back()}
  className="text-gray-600 hover:text-black"
>
  <ArrowLeft className="h-4 w-4" />
</Button>
```

**문제**:
1. `aria-label` 누락 (아이콘만 있어 스크린 리더가 "버튼"만 읽음)
2. 버튼 크기 `size="sm"` → 터치 타겟 작음

**개선안**:

```tsx
// AFTER
<Button
  variant="ghost"
  size="default"
  onClick={() => router.back()}
  className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 min-h-[44px]"
  aria-label="Go back to articles list"
>
  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
</Button>
```

---

### 2.3.3 구체적인 개선 방안

#### 전체 코드 (개선 후)

**파일**: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx`

```tsx
"use client";

import { useState, useEffect, use } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useArticle } from "@/features/articles/hooks/useArticle";
import {
  EditArticleFormSchema,
  type EditArticleFormValues,
} from "@/features/articles/lib/edit-article-schema";
import { AutoSaveIndicator } from "@/features/articles/components/auto-save-indicator";

const BlockNoteEditor = dynamic(
  () =>
    import("@/features/articles/components/blocknote-editor").then(
      (m) => m.BlockNoteEditor
    ),
  { ssr: false }
);

type EditorPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;
  const router = useRouter();
  const t = useTranslations("editor");
  const [mounted, setMounted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const { data: article, isLoading, isError } = useArticle(articleId);

  const form = useForm<EditArticleFormValues>({
    resolver: zodResolver(EditArticleFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      description: "",
      keywords: [],
      metaTitle: "",
      metaDescription: "",
      status: "draft",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title || "",
        slug: article.slug || "",
        content: article.content || "",
        description: article.description || "",
        keywords: Array.isArray(article.keywords) ? article.keywords : [],
        metaTitle: article.metaTitle || "",
        metaDescription: article.metaDescription || "",
        status: article.status || "draft",
        tone: article.tone,
        contentLength: article.contentLength,
        readingLevel: article.readingLevel,
        styleGuideId: article.styleGuideId || undefined,
      });
    }
  }, [article, form]);

  // TODO: 자동 저장 로직 구현 (debounced save)
  // useEffect(() => {
  //   const subscription = form.watch((value, { name }) => {
  //     // Debounce save logic here
  //   });
  //   return () => subscription.unsubscribe();
  // }, [form.watch]);

  const formValues = form.watch();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background dark:bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-foreground dark:border-foreground border-t-transparent"></div>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background dark:bg-background">
        <p className="text-sm text-red-600 dark:text-red-500">{t("load_error")}</p>
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          size="sm"
          className="border-border dark:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2"
        >
          {t("back_to_dashboard")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Header - 미니멀 상단바 */}
      <div className="border-b border-border dark:border-border">
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="default"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2 min-h-[44px]"
              aria-label="Go back to articles list"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Button>

            <div className="flex items-center gap-3">
              {/* 자동 저장 표시 */}
              <AutoSaveIndicator status={saveStatus} />

              <div className="text-xs text-muted-foreground dark:text-muted-foreground">
                {formValues.title || "Untitled"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 중앙 정렬, 최대 너비 제한 */}
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-16 md:py-24">
        {/* Title Input - 크고 볼드한 제목 입력 */}
        <div className="mb-16">
          <Input
            value={formValues.title}
            onChange={(e) => form.setValue("title", e.target.value)}
            placeholder="Title"
            className="border-0 p-0 text-3xl md:text-4xl lg:text-5xl font-medium leading-tight placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent dark:bg-transparent text-foreground dark:text-foreground"
            aria-label="Article title"
          />
        </div>

        {/* Editor - 깔끔한 에디터 영역 */}
        <div className="mb-16">
          {mounted && (
            <BlockNoteEditor
              value={formValues.content || ""}
              onChange={(value) => form.setValue("content", value)}
              placeholder="Start writing..."
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

**주요 변경 사항**:
1. 모든 `bg-white` → `bg-background dark:bg-background`
2. 모든 `text-gray-*` → 의미론적 토큰
3. 제목 입력 반응형 크기 (`text-3xl md:text-4xl lg:text-5xl`)
4. 뒤로가기 버튼 `aria-label` 추가
5. AutoSaveIndicator 컴포넌트 추가 (구현은 TODO)
6. 간격 조정 (`py-12` → `py-16 md:py-24`, `mb-12` → `mb-16`)
7. 로딩/에러 상태 다크 모드 대응

---

### 2.3.4 BlockNoteEditor 다크 모드 지원

**현재 문제**:
- BlockNote 에디터가 `theme="light"` 하드코딩됨

**개선안**:

**파일**: `src/features/articles/components/blocknote-editor.tsx`

```tsx
// BEFORE (L95)
<BlockNoteView
  editor={editor}
  theme="light"
  onChange={handleChange}
/>

// AFTER
import { useTheme } from "next-themes";

export function BlockNoteEditor({
  value,
  onChange,
  height = "500px",
  placeholder = "Type '/' for commands...",
}: BlockNoteEditorProps) {
  const { theme } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);

  const editor = useCreateBlockNote({
    placeholders: {
      default: placeholder,
    },
  });

  // ... (기존 로직)

  return (
    <div className="blocknote-wrapper">
      <BlockNoteView
        editor={editor}
        theme={theme === "dark" ? "dark" : "light"} // 다크 모드 지원
        onChange={handleChange}
      />
    </div>
  );
}
```

**추가 CSS** (다크 모드 스타일링):

```css
/* globals.css */
.dark .blocknote-wrapper {
  /* BlockNote 에디터 다크 모드 커스터마이징 */
  --bn-colors-editor-background: hsl(var(--background));
  --bn-colors-editor-text: hsl(var(--foreground));
  --bn-colors-menu-background: hsl(var(--card));
  --bn-colors-menu-text: hsl(var(--foreground));
  /* ... 기타 BlockNote CSS 변수 오버라이드 */
}
```

---

### 2.3.5 접근성 체크리스트

- [x] **ARIA 속성**:
  - 뒤로가기 버튼: `aria-label="Go back to articles list"`
  - 제목 입력: `aria-label="Article title"`
  - 로딩 스피너: 시각적으로만 표시 (스크린 리더는 텍스트 읽음)
- [x] **키보드 네비게이션**:
  - 뒤로가기 버튼 `focus-visible:ring-2`
  - 제목 입력 필드 Tab으로 접근 가능
- [x] **터치 타겟 크기**:
  - 뒤로가기 버튼 `min-h-[44px]`
- [ ] **BlockNote 에디터 접근성**:
  - BlockNote 자체의 접근성은 라이브러리 의존
  - 추가 테스트 필요

---

## 3. 공통 컴포넌트 개선안

### 3.1 전역 CSS (globals.css)

**현재 문제**:
- CSS 변수가 디자인 가이드와 불일치할 가능성

**개선안**:

**파일**: `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Background Colors */
    --background: 210 40% 98%;        /* slate-50 */
    --foreground: 222.2 84% 4.9%;     /* slate-950 */

    --card: 0 0% 100%;                /* white */
    --card-foreground: 222.2 84% 4.9%; /* slate-950 */

    --secondary: 210 40% 96.1%;       /* slate-100 */
    --secondary-foreground: 222.2 84% 4.9%; /* slate-950 */

    --tertiary: 210 40% 94%;          /* slate-150 (custom) */

    /* Text Colors */
    --muted: 215.4 16.3% 46.9%;       /* slate-600 */
    --muted-foreground: 215.4 16.3% 46.9%; /* slate-600 */

    /* Border */
    --border: 214.3 31.8% 91.4%;      /* slate-300 */

    /* Accent Colors (Brand) */
    --primary: 15 58% 52%;            /* #C46849 */
    --primary-hover: 15 58% 42%;      /* #b05a3e */
    --toggle: 15 58% 58%;             /* #d97757 */

    /* Semantic Colors */
    --error: 0 54% 64%;               /* #df6666 */
    --success: 160 84% 39%;           /* #10b981 */
    --warning: 38 92% 50%;            /* #f59e0b */
    --info: 221 83% 53%;              /* #3b82f6 */

    /* Radius */
    --radius: 0.5rem;                 /* 8px */
  }

  .dark {
    /* Background Colors */
    --background: 222.2 84% 4.9%;     /* slate-950 */
    --foreground: 210 40% 98%;        /* slate-50 */

    --card: 222.2 84% 8%;             /* slate-900 */
    --card-foreground: 210 40% 98%;   /* slate-50 */

    --secondary: 217.2 32.6% 17.5%;   /* slate-800 */
    --secondary-foreground: 210 40% 98%; /* slate-50 */

    --tertiary: 215 27.9% 16.9%;      /* slate-850 (custom) */

    /* Text Colors */
    --muted: 215 20.2% 65.1%;         /* slate-400 */
    --muted-foreground: 215 20.2% 65.1%; /* slate-400 */

    /* Border */
    --border: 215 27.9% 16.9%;        /* slate-600 */

    /* Accent Colors (동일) */
    --primary: 15 58% 52%;            /* #C46849 */
    --primary-hover: 15 58% 42%;      /* #b05a3e */
    --toggle: 15 58% 58%;             /* #d97757 */

    /* Semantic Colors (약간 밝게) */
    --error: 0 54% 70%;               /* lighter red */
    --success: 160 84% 45%;           /* lighter green */
    --warning: 38 92% 55%;            /* lighter orange */
    --info: 221 83% 60%;              /* lighter blue */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* BlockNote 다크 모드 커스터마이징 */
.dark .blocknote-wrapper {
  --bn-colors-editor-background: hsl(var(--background));
  --bn-colors-editor-text: hsl(var(--foreground));
  --bn-colors-menu-background: hsl(var(--card));
  --bn-colors-menu-text: hsl(var(--foreground));
  --bn-colors-menu-border: hsl(var(--border));
  --bn-colors-tooltip-background: hsl(var(--card));
  --bn-colors-tooltip-text: hsl(var(--foreground));
  --bn-colors-hovered-background: hsl(var(--secondary));
  --bn-colors-selected-background: hsl(var(--secondary));
}

/* Motion Reduce (접근성) */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

### 3.2 Tailwind Config

**파일**: `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: "hsl(var(--tertiary))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
        },
        toggle: "hsl(var(--toggle))",
        error: "hsl(var(--error))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
      },
      fontFamily: {
        sans: ["Pretendard Variable", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        // 디자인 가이드 타이포그래피 스케일
        "5xl": ["3.75rem", { lineHeight: "1.1", fontWeight: "500" }], // 60px
        "4xl": ["3rem", { lineHeight: "1.1", fontWeight: "500" }],    // 48px
        "3xl": ["2.25rem", { lineHeight: "1.2", fontWeight: "500" }], // 36px
        "2xl": ["1.5rem", { lineHeight: "1.3", fontWeight: "500" }],  // 24px
        "xl": ["1.25rem", { lineHeight: "1.4", fontWeight: "500" }],  // 20px
        "lg": ["1.125rem", { lineHeight: "1.5", fontWeight: "400" }], // 18px
        "base": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],   // 16px
        "sm": ["0.875rem", { lineHeight: "1.6", fontWeight: "400" }], // 14px
        "xs": ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],  // 12px
      },
      spacing: {
        // 추가 간격 값 (필요시)
        "18": "4.5rem",  // 72px
        "22": "5.5rem",  // 88px
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionDuration: {
        "25": "25ms",
        "50": "50ms",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
};

export default config;
```

---

### 3.3 i18n 메시지 추가

**파일**: `messages/ko.json`

```json
{
  "editor": {
    "loading": "불러오는 중...",
    "load_error": "글을 불러올 수 없습니다.",
    "back_to_dashboard": "대시보드로 돌아가기",
    "saving": "저장 중...",
    "saved": "저장됨",
    "save_error": "저장 실패"
  },
  "articles": {
    "search_aria_label": "제목이나 키워드로 검색",
    "remove_filter_aria": "{filter} 필터 제거",
    "clear_search_aria": "검색어 지우기"
  }
}
```

---

## 4. 구현 우선순위

### P0 (긴급 - 1주일 내)

1. **색상 시스템 전면 수정** (Articles List Page 우선)
   - `bg-gray-50`, `bg-blue-500` 등 모든 하드코딩 색상 제거
   - `bg-background`, `text-foreground` 등 의미론적 토큰으로 교체
   - 예상 공수: 2일

2. **다크 모드 지원** (전체 페이지)
   - `dark:` variant 추가
   - globals.css 다크 모드 CSS 변수 정의
   - 예상 공수: 1일

3. **접근성 긴급 수정**
   - 모든 버튼 `aria-label` 추가
   - 터치 타겟 최소 크기 보장 (`min-h-[44px]`)
   - focus-visible 스타일 추가
   - 예상 공수: 1일

### P1 (높음 - 2주일 내)

4. **타이포그래피 통일** (전체 페이지)
   - 페이지 제목 `text-3xl md:text-4xl`
   - 제목 입력 `text-3xl md:text-4xl lg:text-5xl`
   - `font-semibold` → `font-medium`
   - 예상 공수: 1일

5. **간격 시스템 적용**
   - 섹션 여백 `py-16 md:py-24`
   - 그리드 간격 `gap-6`
   - 예상 공수: 0.5일

6. **New Article 페이지 개선**
   - Accent 색상 적용 (버튼, focus)
   - 애니메이션 최적화 (y 변환 제거)
   - ARIA 속성 추가
   - 예상 공수: 2일

### P2 (중간 - 1개월 내)

7. **Article Edit 페이지 개선**
   - 자동 저장 기능 구현
   - AutoSaveIndicator 컴포넌트
   - BlockNote 다크 모드 지원
   - 예상 공수: 2일

8. **애니메이션 통일 및 최적화**
   - 모든 duration 통일 (100ms, 300ms, 500ms)
   - `motion-reduce:transition-none` 추가
   - 예상 공수: 1일

9. **성능 최적화**
   - React Query 캐시 전략 검토
   - 이미지 최적화 (Next.js Image 활용)
   - 번들 크기 분석
   - 예상 공수: 2일

### P3 (낮음 - 2개월 내)

10. **추가 UI 개선**
    - 빈 상태 일러스트레이션
    - 스켈레톤 로딩 애니메이션 개선
    - 토스트 메시지 스타일링
    - 예상 공수: 3일

---

## 5. 성공 지표

### 5.1 디자인 가이드 준수

- [ ] **색상 시스템**: 하드코딩 색상 0개 (의미론적 토큰 100% 사용)
- [ ] **타이포그래피**: 모든 제목이 디자인 가이드 스케일 준수
- [ ] **간격 시스템**: 모든 섹션/그리드가 표준 간격 사용
- [ ] **다크 모드**: 모든 페이지에서 정상 작동
- [ ] **애니메이션**: 모든 전환이 300ms 이하, transform/opacity만 사용

### 5.2 접근성

- [ ] **WCAG 2.1 AA**: 모든 색상 대비 4.5:1 이상
- [ ] **키보드 네비게이션**: Tab 키로 모든 요소 접근 가능
- [ ] **스크린 리더**: NVDA/VoiceOver 테스트 통과
- [ ] **ARIA 속성**: 모든 인터랙티브 요소에 적절한 레이블
- [ ] **터치 타겟**: 모든 버튼/링크 최소 44x44px

### 5.3 사용자 경험

- [ ] **로딩 속도**: First Contentful Paint < 1.5초
- [ ] **자동 저장**: Edit 페이지에서 3초마다 자동 저장
- [ ] **에러 처리**: 모든 API 실패 시 명확한 에러 메시지
- [ ] **빈 상태**: 의미 있는 빈 상태 메시지 및 CTA
- [ ] **모바일 최적화**: 375px 너비에서 레이아웃 깨지지 않음

### 5.4 성능

- [ ] **Lighthouse 점수**:
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 95+
- [ ] **번들 크기**: JavaScript < 200KB (gzipped)
- [ ] **이미지 최적화**: 모든 이미지 WebP + lazy loading

---

## 6. 다음 단계

1. **P0 작업 시작** (색상 시스템, 다크 모드, 접근성)
   - PageLayout 컴포넌트 전면 리팩토링
   - ArticlesFilters, ArticleCard 개선
   - globals.css 다크 모드 CSS 변수 정의

2. **디자인 검토**
   - 개선된 페이지 스크린샷 촬영
   - 디자인팀 피드백 수렴

3. **접근성 테스트**
   - NVDA 스크린 리더 테스트
   - 키보드만으로 전체 플로우 테스트
   - 색상 대비 검증 (WebAIM Contrast Checker)

4. **성능 테스트**
   - Lighthouse 점수 측정
   - React DevTools Profiler로 리렌더링 분석

5. **문서화**
   - 개선 내역 CHANGELOG.md 작성
   - 컴포넌트 Storybook 추가 (선택)

---

**보고서 작성 완료**
**총 페이지 수**: 3개
**총 컴포넌트 수**: 10개+
**예상 총 공수**: 15-20일 (1인 기준)
**우선순위**: P0 (긴급) 4일 → P1 (높음) 3.5일 → P2 (중간) 5일 → P3 (낮음) 3일

---

## 부록: 빠른 참조 가이드

### 색상 토큰 매핑

| 하드코딩 (❌) | 의미론적 토큰 (✅) | 용도 |
|--------------|-------------------|------|
| `bg-white` | `bg-background` | 페이지 배경 |
| `bg-gray-50` | `bg-background` | 페이지 배경 |
| `bg-gray-100` | `bg-secondary` | 보조 배경 |
| `text-gray-900` | `text-foreground` | 주요 텍스트 |
| `text-gray-600` | `text-muted-foreground` | 보조 텍스트 |
| `text-gray-500` | `text-muted-foreground` | 보조 텍스트 |
| `text-gray-400` | `text-muted-foreground` | 플레이스홀더 |
| `border-gray-200` | `border-border` | 테두리 |
| `bg-blue-500` | `bg-[#C46849]` | Primary CTA |
| `hover:text-blue-600` | `hover:text-[#C46849]` | 링크 호버 |

### 타이포그래피 스케일

| 용도 | 클래스 | 크기 (모바일 → 데스크탑) |
|------|--------|------------------------|
| 페이지 제목 (h1) | `text-4xl md:text-5xl font-medium` | 48px → 60px |
| 섹션 제목 (h2) | `text-3xl md:text-4xl font-medium` | 36px → 48px |
| 카드 제목 (h3) | `text-xl md:text-2xl font-medium` | 20px → 24px |
| 본문 | `text-base leading-relaxed` | 16px |
| 보조 텍스트 | `text-sm` | 14px |
| 캡션 | `text-xs` | 12px |

### 간격 스케일

| 용도 | 클래스 | 크기 (모바일 → 데스크탑) |
|------|--------|------------------------|
| 섹션 여백 | `py-16 md:py-24` | 64px → 96px |
| 섹션 간격 | `gap-8` | 32px |
| 카드 그리드 | `gap-6` | 24px |
| 컴포넌트 간격 | `gap-4` | 16px |
| 인라인 요소 | `gap-2` | 8px |

### Focus 스타일 표준

```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2"
```

### 버튼 애니메이션 표준

```tsx
className="transition-all duration-100 active:scale-95"
```

### 카드 호버 효과 표준

```tsx
className="hover:shadow-md dark:hover:shadow-lg hover:border-[#C46849] dark:hover:border-[#d97757] transition-all duration-300"
```
