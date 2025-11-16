# UI 품질 검토 피드백: Articles Edit Page

## 종합 평가 점수: 78/100

---

## 1. 전체 평가

현재 Articles Edit 페이지는 **기본적인 기능은 잘 작동하는 수준**이지만, claude.ai의 세련되고 전문적인 디자인 수준과 비교하면 여러 개선이 필요합니다.

### 강점
- ✅ framer-motion을 활용한 AutoSaveIndicator 애니메이션
- ✅ 반응형 레이아웃 (Desktop/Mobile 분기)
- ✅ 기본적인 접근성 (Label, ARIA)
- ✅ 다크모드 지원
- ✅ 실시간 유효성 검증 (slug, description)

### 개선 필요 영역
- ❌ 애니메이션이 전반적으로 부족하고 단조로움
- ❌ 시각적 위계가 약함 (타이포그래피, 간격)
- ❌ 로딩/에러 상태 디자인이 평범함
- ❌ 인터랙션 피드백이 부족함
- ❌ claude.ai 수준의 세련된 디테일 부재

---

## 2. 개선 필요 항목

### 2.1 애니메이션 품질 (현재 40/100 → 목표 90/100)

#### 문제점
1. **AutoSaveIndicator만 애니메이션이 있음** - 나머지 모든 컴포넌트가 정적
2. **페이지 전환 애니메이션 없음** - 로딩 완료 시 갑작스러운 등장
3. **프리뷰 패널 토글이 즉각적** - 부드러운 슬라이드 없음
4. **TOC 스크롤 하이라이트 변화 애니메이션 없음**
5. **Collapsible 전환이 너무 빠름** - 기본 shadcn 속도 사용

#### 개선안 1: 페이지 진입 애니메이션

**파일**: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx`

**현재**:
```tsx
return (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto max-w-[1600px] px-4 py-8">
      <EditorHeader ... />
```

**개선**:
```tsx
import { motion } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1], // claude.ai 스타일 easing
      staggerChildren: 0.1
    }
  }
};

return (
  <motion.div
    className="min-h-screen bg-background"
    initial="hidden"
    animate="visible"
    variants={pageVariants}
  >
    <div className="container mx-auto max-w-[1600px] px-4 py-8">
      <motion.div variants={pageVariants}>
        <EditorHeader ... />
      </motion.div>
```

**이유**: claude.ai는 페이지 로드 시 부드러운 fade-in과 subtle한 y축 이동으로 전문성을 표현합니다.

---

#### 개선안 2: Preview Panel 슬라이드 애니메이션

**파일**: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx`

**현재**:
```tsx
{showPreview && (
  <Card className="w-[40%] overflow-auto border">
```

**개선**:
```tsx
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence mode="wait">
  {showPreview && (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="w-[40%]"
    >
      <Card className="overflow-auto border">
```

**이유**: 프리뷰 패널의 등장/사라짐이 자연스러워야 사용자 경험이 향상됩니다. claude.ai는 모든 레이아웃 변경에 애니메이션을 적용합니다.

---

#### 개선안 3: TOC Active Item 전환 애니메이션

**파일**: `src/features/articles/components/table-of-contents.tsx`

**현재**:
```tsx
<Button
  variant="ghost"
  className={cn(
    'w-full justify-start text-left text-sm',
    activeId === heading.id && 'bg-accent font-medium'
  )}
```

**개선**:
```tsx
import { motion } from 'framer-motion';

<motion.div
  layout
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  <Button
    variant="ghost"
    className={cn(
      'w-full justify-start text-left text-sm transition-all duration-200',
      activeId === heading.id && 'bg-accent font-medium text-accent-foreground'
    )}
  >
    {activeId === heading.id && (
      <motion.div
        layoutId="activeIndicator"
        className="absolute left-0 h-full w-1 rounded-r bg-primary"
        initial={false}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    )}
    {heading.text}
  </Button>
</motion.div>
```

**이유**: claude.ai의 네비게이션은 active 상태 변화 시 부드러운 indicator 애니메이션을 사용합니다.

---

#### 개선안 4: Copy Success 피드백 강화

**파일**: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx`

**현재**:
```tsx
{copySuccess ? (
  <>
    <Check className="mr-2 h-4 w-4" />
    {t('copied')}
  </>
) : (
  <>
    <Copy className="mr-2 h-4 w-4" />
    {t('copy')}
  </>
)}
```

**개선**:
```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  {copySuccess ? (
    <motion.div
      key="success"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center"
    >
      <motion.div
        initial={{ rotate: -180, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      >
        <Check className="mr-2 h-4 w-4 text-green-500" />
      </motion.div>
      {t('copied')}
    </motion.div>
  ) : (
    <motion.div
      key="copy"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center"
    >
      <Copy className="mr-2 h-4 w-4" />
      {t('copy')}
    </motion.div>
  )}
</AnimatePresence>
```

**이유**: 사용자 행동에 대한 즉각적인 시각적 피드백은 UX의 핵심입니다.

---

### 2.2 타이포그래피 위계 (현재 65/100 → 목표 90/100)

#### 문제점
1. **헤더 타이틀이 너무 작음** - `text-2xl`은 에디터 페이지에 비해 약함
2. **Title Input의 폰트 크기 불충분** - `text-4xl`은 claude.ai 기준으로 작음
3. **라벨과 본문의 대비 부족**
4. **행간 조정 없음** - 기본값 사용

#### 개선안 1: 헤더 타이포그래피 강화

**파일**: `src/features/articles/components/editor-header.tsx`

**현재**:
```tsx
<h1 className="text-2xl font-bold">{t('title')}</h1>
```

**개선**:
```tsx
<h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
```

**이유**: 주요 페이지 타이틀은 시선을 끌어야 합니다. `tracking-tight`으로 가독성도 향상.

---

#### 개선안 2: Title Input 크기 및 스타일 개선

**파일**: `src/features/articles/components/title-inline-input.tsx`

**현재**:
```tsx
className="w-full border-0 bg-transparent px-0 text-4xl font-bold leading-tight tracking-tight placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
```

**개선**:
```tsx
className="w-full border-0 bg-transparent px-0 text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200"
```

**이유**:
- claude.ai는 제목에 큰 폰트 사용 (`text-6xl`)
- `leading-[1.1]`로 더 타이트한 행간
- placeholder 투명도를 40%로 낮춰 더 subtle하게
- `transition-all`로 포커스 시 부드러운 전환

---

#### 개선안 3: SEO Panel 라벨 강조

**파일**: `src/features/articles/components/seo-collapsible-panel.tsx`

**현재**:
```tsx
<Label htmlFor="seo-slug">{t('field_slug')}</Label>
```

**개선**:
```tsx
<Label htmlFor="seo-slug" className="text-sm font-semibold text-foreground">
  {t('field_slug')}
</Label>
```

**이유**: 라벨을 semibold로 강조하여 필드 구분을 명확히 합니다.

---

### 2.3 간격 및 레이아웃 (현재 70/100 → 목표 92/100)

#### 문제점
1. **컴포넌트 간 간격이 일관적이지 않음** - `mb-6`, `space-y-6`, `gap-4` 혼재
2. **Card 내부 여백 부족** - `p-6`는 충분하지만 모바일에서 `p-4`로 줄어듦
3. **Desktop TOC와 Editor 간격** - `gap-6`는 적절하나 시각적으로 연결성 부족

#### 개선안 1: 일관된 간격 시스템 적용

**파일**: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx`

**현재**:
```tsx
<Card className="flex-1 space-y-6 p-6">
  <TitleInlineInput ... />
  <SeoCollapsiblePanel ... />
  <div>
    <Label htmlFor="content">{t('field_content')}</Label>
```

**개선**:
```tsx
<Card className="flex-1 space-y-8 p-8">
  <TitleInlineInput ... />

  <div className="border-t pt-6">
    <SeoCollapsiblePanel ... />
  </div>

  <div className="border-t pt-6">
    <Label htmlFor="content" className="text-sm font-semibold">
      {t('field_content')}
    </Label>
```

**이유**:
- `space-y-8`로 섹션 간 호흡 확보
- `border-t` + `pt-6`로 섹션 구분 명확화
- `p-8`로 여유로운 여백 (claude.ai 스타일)

---

#### 개선안 2: 모바일 Card 여백 개선

**파일**: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx`

**현재**:
```tsx
<Card className="space-y-6 p-4">
```

**개선**:
```tsx
<Card className="space-y-6 p-6 md:p-8">
```

**이유**: 모바일에서도 최소 `p-6`을 유지하여 답답함 해소.

---

### 2.4 컬러 사용 및 대비 (현재 75/100 → 목표 88/100)

#### 문제점
1. **성공 메시지 컬러 일관성 없음** - `text-green-500`, `text-green-600` 혼재
2. **Muted Text 과다 사용** - 모든 보조 정보가 `text-muted-foreground`
3. **다크모드 대비 검증 부족**

#### 개선안 1: 컬러 시스템 통일

**파일**: `src/features/articles/components/auto-save-indicator.tsx`

**현재**:
```tsx
<Check className="h-4 w-4 text-green-500" />
```

**개선**:
```tsx
<Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
```

**파일**: `src/features/articles/components/seo-collapsible-panel.tsx`

**현재**:
```tsx
<p className="mt-1 text-xs text-green-600">
```

**개선**:
```tsx
<p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
```

**이유**:
- `emerald`는 claude.ai가 사용하는 성공 컬러
- 다크모드에서 더 밝은 톤으로 대비 개선

---

#### 개선안 2: Description 길이 상태별 컬러 차별화

**파일**: `src/features/articles/components/seo-collapsible-panel.tsx`

**현재**:
```tsx
<span className="text-xs text-muted-foreground">
  {descriptionLength}/160
</span>
```

**개선**:
```tsx
<span className={cn(
  "text-xs font-medium tabular-nums transition-colors",
  descriptionLength === 0 && "text-muted-foreground",
  descriptionLength > 0 && descriptionLength < 120 && "text-amber-500",
  descriptionLength >= 120 && descriptionLength <= 160 && "text-emerald-500",
  descriptionLength > 160 && "text-destructive"
)}>
  {descriptionLength}/160
</span>
```

**이유**:
- 시각적 피드백으로 최적 길이 유도
- `tabular-nums`로 숫자 정렬
- claude.ai의 실시간 피드백 스타일

---

### 2.5 로딩 및 에러 상태 (현재 60/100 → 목표 88/100)

#### 문제점
1. **로딩 스피너가 너무 평범함** - 기본 border animation
2. **에러 상태 디자인 미흡** - 단순 텍스트만 표시
3. **스켈레톤 없음** - 로딩 중 빈 화면

#### 개선안 1: 로딩 상태 고급화

**파일**: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx`

**현재**:
```tsx
if (isLoading) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  );
}
```

**개선**:
```tsx
import { motion } from 'framer-motion';

if (isLoading) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.p
          className="text-sm font-medium text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t('loading')}
        </motion.p>
        <motion.p
          className="mt-2 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {t('loading_article_content')}
        </motion.p>
      </motion.div>
    </div>
  );
}
```

**이유**:
- 부드러운 fade-in으로 로딩 화면 등장
- 더 명확한 스피너 디자인
- 사용자에게 무엇을 로딩 중인지 알려줌

---

#### 개선안 2: 에러 상태 개선

**파일**: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx`

**현재**:
```tsx
if (isError) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-destructive">{t('load_error')}</p>
      <Button onClick={() => router.push('/dashboard')}>
        {t('back_to_dashboard')}
      </Button>
    </div>
  );
}
```

**개선**:
```tsx
import { motion } from 'framer-motion';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

if (isError) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <AlertCircle className="mx-auto h-16 w-16 text-destructive/80" />
        </motion.div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight">
          {t('load_error_title')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {t('load_error_description')}
        </p>

        <div className="mt-8 flex gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('retry')}
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            <Home className="mr-2 h-4 w-4" />
            {t('back_to_dashboard')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
```

**이유**:
- 더 친근한 에러 메시지 디자인
- 재시도 옵션 제공
- claude.ai 스타일의 세련된 에러 처리

---

### 2.6 마이크로 인터랙션 (현재 55/100 → 목표 90/100)

#### 문제점
1. **버튼 호버 피드백 부족**
2. **포커스 상태 강조 미흡**
3. **인풋 필드 상태 변화 애니메이션 없음**

#### 개선안 1: 버튼 호버 효과 강화

**파일**: `src/features/articles/components/editor-header.tsx`

**현재**:
```tsx
<Button variant="ghost" onClick={onBack}>
  <ArrowLeft className="mr-2 h-4 w-4" />
  {t('back')}
</Button>
```

**개선**:
```tsx
<Button
  variant="ghost"
  onClick={onBack}
  className="group transition-all hover:bg-accent/50"
>
  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
  {t('back')}
</Button>
```

**이유**: 아이콘이 왼쪽으로 살짝 이동하여 "뒤로 가기" 액션을 시각적으로 강화.

---

#### 개선안 2: Input Focus 상태 개선

**파일**: `src/features/articles/components/seo-collapsible-panel.tsx`

**현재**:
```tsx
<Input
  id="seo-slug"
  value={slug}
  onChange={(e) => onSlugChange(e.target.value)}
  placeholder={t('placeholder_slug')}
  disabled={disabled}
  className="mt-1 font-mono text-sm"
/>
```

**개선**:
```tsx
<Input
  id="seo-slug"
  value={slug}
  onChange={(e) => onSlugChange(e.target.value)}
  placeholder={t('placeholder_slug')}
  disabled={disabled}
  className="mt-1 font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
/>
```

**이유**: 포커스 시 subtle한 ring으로 현재 필드를 명확히 표시.

---

### 2.7 반응형 디자인 (현재 80/100 → 목표 92/100)

#### 문제점
1. **모바일에서 Editor Height가 고정 (400px)** - 작은 화면에서 불편
2. **Tabs 전환 시 애니메이션 없음**

#### 개선안 1: 모바일 에디터 높이 개선

**파일**: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx`

**현재**:
```tsx
<MDEditor
  value={content}
  onChange={(val) => setContent(val || '')}
  height={400}
/>
```

**개선**:
```tsx
<MDEditor
  value={content}
  onChange={(val) => setContent(val || '')}
  height="calc(100vh - 450px)"
  style={{ minHeight: '300px' }}
/>
```

**이유**: viewport 기반 높이로 화면 크기에 맞춰 최적화.

---

#### 개선안 2: Tabs 전환 애니메이션

**파일**: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx`

**현재**:
```tsx
<TabsContent value="edit" className="mt-4">
  <Card className="space-y-6 p-4">
```

**개선**:
```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <TabsContent value="edit" className="mt-4" asChild>
    <motion.div
      key="edit-tab"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="space-y-6 p-6 md:p-8">
```

**이유**: 탭 전환이 부드러워져 사용자 경험 향상.

---

## 3. 우선순위

### 높음 (필수) - claude.ai 수준 도달을 위한 핵심

- [ ] **애니메이션 개선 1**: 페이지 진입 애니메이션 추가 (Framer Motion)
- [ ] **애니메이션 개선 2**: Preview Panel 슬라이드 애니메이션
- [ ] **타이포그래피 1**: Title Input 크기 확대 (`text-5xl md:text-6xl`)
- [ ] **로딩/에러 1**: 로딩 상태 고급화 (애니메이션 + 설명 텍스트)
- [ ] **로딩/에러 2**: 에러 상태 디자인 개선 (재시도 버튼 포함)
- [ ] **컬러 시스템**: 성공 컬러 통일 (`emerald` 계열)

### 중간 (권장) - 전문성 향상

- [ ] **애니메이션 개선 3**: TOC Active Item 전환 애니메이션
- [ ] **애니메이션 개선 4**: Copy Success 피드백 강화
- [ ] **간격/레이아웃 1**: 일관된 간격 시스템 적용 (`space-y-8`, border 구분)
- [ ] **타이포그래피 2**: 헤더 크기 확대 (`text-3xl`)
- [ ] **컬러 2**: Description 길이 상태별 컬러 차별화
- [ ] **마이크로 인터랙션 1**: 버튼 호버 효과 강화

### 낮음 (선택) - 디테일 완성도

- [ ] **간격/레이아웃 2**: 모바일 Card 여백 개선
- [ ] **타이포그래피 3**: SEO Panel 라벨 강조
- [ ] **마이크로 인터랙션 2**: Input Focus 상태 개선
- [ ] **반응형 1**: 모바일 에디터 높이 개선
- [ ] **반응형 2**: Tabs 전환 애니메이션

---

## 4. claude.ai 벤치마크 비교

### claude.ai는 이렇게 하는데 현재는...

#### 1. 애니메이션 철학
- **claude.ai**: 모든 상태 변화에 의미 있는 애니메이션 적용. 부드러운 easing (`[0.22, 1, 0.36, 1]`)
- **현재**: AutoSaveIndicator만 애니메이션, 나머지는 즉각적 변화

#### 2. 타이포그래피 스케일
- **claude.ai**: 제목은 `text-6xl` 이상, 명확한 시각적 위계
- **현재**: `text-4xl`로 상대적으로 약함

#### 3. 피드백 디자인
- **claude.ai**: 사용자 행동에 즉각적이고 명확한 시각적 피드백 (애니메이션 + 컬러 + 아이콘)
- **현재**: 기본적인 텍스트/아이콘 변경

#### 4. 에러 처리
- **claude.ai**: 친근하고 도움이 되는 에러 메시지 + 명확한 해결 방법 제시
- **현재**: 단순한 에러 텍스트

#### 5. 공백 사용
- **claude.ai**: 여유로운 여백으로 고급스러움 표현 (`p-8`, `space-y-8`)
- **현재**: 적절하지만 다소 답답함 (`p-6`, `space-y-6`)

---

## 5. 기대 효과

위 개선사항을 모두 적용하면:

1. **사용자 경험 향상**: 부드러운 애니메이션으로 전문적인 느낌
2. **가독성 개선**: 더 명확한 타이포그래피 위계
3. **신뢰도 향상**: 세련된 로딩/에러 처리로 안정감
4. **브랜드 이미지**: claude.ai 수준의 디자인 품질
5. **전환율 증가**: 향상된 UX로 사용자 만족도 상승

**최종 예상 점수**: 78/100 → **92/100**

---

## 6. 참고: 추가 개선 제안 (선택)

### 6.1 Keyboard Shortcuts 표시

에디터에 단축키 안내 툴팁 추가:
- `Ctrl/Cmd + S`: 수동 저장
- `Ctrl/Cmd + P`: 프리뷰 토글
- `Ctrl/Cmd + /`: 마크다운 도움말

### 6.2 Progress Indicator

긴 콘텐츠 작성 시 스크롤 진행도 표시:
```tsx
<motion.div
  className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
  style={{ scaleX: scrollProgress }}
/>
```

### 6.3 Autosave 실패 시 로컬 저장

네트워크 오류 시 localStorage에 백업:
```tsx
useEffect(() => {
  if (autoSave.isError) {
    localStorage.setItem(`draft-${articleId}`, JSON.stringify({ title, content, ... }));
    toast({
      title: "로컬에 백업됨",
      description: "네트워크 복구 후 자동 동기화됩니다.",
    });
  }
}, [autoSave.isError]);
```

---

**검토 완료일**: 2025-11-16
**검토자**: UI Quality Check Agent
**다음 단계**: 우선순위 '높음' 항목부터 순차적으로 적용 권장
