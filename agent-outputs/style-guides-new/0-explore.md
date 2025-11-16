# 페이지 분석 및 개선안: Style Guides New

## 1. 현재 상태 분석

### 1.1 페이지 구조

현재 `/style-guides/new` 페이지는 스타일 가이드 생성을 위한 온보딩 위저드 페이지입니다.

**페이지 계층 구조:**
```
NewStyleGuidePage
└── PageLayout (max-width: 4xl)
    ├── Header
    │   └── Back Button
    └── OnboardingWizard (5-step wizard)
        ├── StepIndicator (progress bar + step dots)
        ├── Desktop Layout (2-column)
        │   ├── Form Panel (left)
        │   │   ├── Current Step Component
        │   │   └── Navigation Buttons
        │   └── Preview Panel (right, sticky)
        └── Mobile Layout (single column)
            ├── Form Panel
            ├── Accordion Preview
            └── Navigation Buttons
```

**5개의 스텝:**
1. **Brand Voice** - 브랜드 이름, 설명, 성격, 격식 수준
2. **Target Audience** - 타겟 독자, 해결하려는 문제
3. **Language** - 언어 선택 (한국어/영어)
4. **Style** - 톤, 콘텐츠 길이, 읽기 수준
5. **Review** - 모든 입력 내용 검토 및 최종 제출

### 1.2 현재 디자인의 강점

**1. 잘 구성된 정보 아키텍처**
- 5단계로 명확하게 분리된 온보딩 프로세스
- 각 스텝이 단일 책임을 가지며 인지 부하가 낮음
- 단계별 유효성 검사로 오류 방지

**2. 반응형 디자인**
- Desktop: 2-column 레이아웃 (폼 + 프리뷰)
- Mobile: Single column + Accordion 프리뷰
- 모바일에서 더 큰 버튼 높이 (h-12)

**3. 접근성 고려**
- 키보드 네비게이션 지원 (Alt + 화살표)
- ARIA 라벨 및 스크린 리더 알림
- 적절한 시맨틱 HTML 사용

**4. 실시간 프리뷰**
- 사용자 입력에 따라 실시간으로 스타일 가이드 프리뷰 업데이트
- 즉각적인 피드백으로 사용자 확신 향상

**5. 일관된 컬러 시스템**
- Primary: #3BA2F8 (블루)
- Success: #10B981 (그린)
- Border: #E1E5EA
- Background: #FCFCFD, #FFFFFF

### 1.3 약점 및 개선 필요 부분

#### **1. 시각적 계층 및 디자인 시스템 부족**

**문제점:**
- 인라인 스타일 과다 사용으로 일관성 유지 어려움
- Tailwind CSS 디자인 토큰을 활용하지 않음
- 하드코딩된 컬러 값 (#3BA2F8, #E1E5EA 등)
- 디자인 변경 시 모든 컴포넌트 수정 필요

**영향:**
- 유지보수 비용 증가
- 디자인 일관성 저하 위험
- 다크모드 구현 불가능

**개선 필요:**
```typescript
// 현재 (문제)
<div style={{ backgroundColor: "#FCFCFD" }}>
  <h1 style={{ color: "#1F2937" }}>Title</h1>
  <p style={{ color: "#6B7280" }}>Description</p>
</div>

// 개선안
<div className="bg-background">
  <h1 className="text-foreground">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

#### **2. 애니메이션 및 인터랙션 부재**

**문제점:**
- 스텝 전환 시 애니메이션 없음 (갑작스러운 전환)
- 프리뷰 업데이트 시 시각적 피드백 부족
- 버튼 호버/포커스 시 미묘한 피드백 부족
- 폼 필드 상태 변화 애니메이션 없음

**영향:**
- 사용자 경험이 딱딱하고 기계적
- 전문성이 떨어져 보임
- 사용자의 입력 피드백이 불명확

**Claude.ai 벤치마크:**
Claude.ai는 부드러운 fade-in, slide-up, scale 애니메이션을 통해 프리미엄 느낌을 제공합니다.

**개선 필요:**
- 스텝 전환: fade + slide 애니메이션
- 프리뷰 업데이트: subtle pulse/glow
- 폼 필드: focus ring animation
- 버튼: hover scale + shadow

#### **3. 시각적 위계 부족**

**문제점:**
- 모든 텍스트가 비슷한 크기와 굵기
- 제목과 본문의 대비가 약함
- 중요도에 따른 시각적 강조 부족
- CTA 버튼의 시각적 우선순위 불명확

**영향:**
- 사용자가 중요한 정보를 놓칠 수 있음
- 스캔 가능성(scannability) 저하
- 인지 부하 증가

**Claude.ai 벤치마크:**
Claude.ai는 명확한 타이포그래피 스케일과 굵기 대비로 정보 계층을 명확히 합니다.

**개선 필요:**
```typescript
// 현재
<h2 className="text-2xl font-semibold">Step Title</h2>
<p className="mt-2 text-sm">Description</p>

// 개선안
<h2 className="text-3xl font-bold tracking-tight">Step Title</h2>
<p className="mt-3 text-lg text-muted-foreground leading-relaxed">
  Description
</p>
```

#### **4. 공간 활용 및 레이아웃**

**문제점:**
- 좌우 패널 크기 비율이 고정 (1fr vs 400px)
- 프리뷰 패널이 너무 좁음
- 폼 필드 간 간격이 불규칙
- 데스크톱에서 여백 활용 부족

**영향:**
- 프리뷰가 답답해 보임
- 폼이 좁고 길어 보임
- 전체적으로 여유롭지 않은 느낌

**Claude.ai 벤치마크:**
Claude.ai는 넉넉한 여백과 공기감을 통해 프리미엄 느낌을 제공합니다.

**개선 필요:**
- 좌우 비율 조정: `lg:grid-cols-[1.2fr,480px]`
- 섹션 간 간격 확대: `space-y-8` → `space-y-12`
- 카드 패딩 증가: `p-6` → `p-8`
- 컨테이너 max-width 조정: `max-w-4xl` → `max-w-6xl`

#### **5. StepIndicator 디자인**

**문제점:**
- Step dots가 너무 작고 간격이 좁음
- Progress bar가 독립적으로 존재해 연결성 부족
- 현재 스텝 강조가 약함
- 완료된 스텝의 시각적 피드백 부족 (체크마크 없음)

**영향:**
- 진행 상황이 명확하지 않음
- 완료 만족감 부족
- 시각적으로 지루함

**Claude.ai 벤치마크:**
Claude.ai는 명확한 진행 상태 표시와 완료 체크마크를 사용합니다.

**개선 필요:**
- 완료된 스텝에 체크마크 아이콘 추가
- Step dots 크기 증가: `h-8 w-8` → `h-10 w-10`
- 현재 스텝에 pulse/glow 효과
- Step dots와 Progress bar 통합

#### **6. 폼 필드 UX**

**문제점:**
- Checkbox 선택 제한 (3개)이 시각적으로 표시되지 않음
- Radio button이 기본 HTML 스타일 사용
- Textarea resize handle이 UX 방해
- 입력 필드 포커스 시 시각적 피드백 약함

**영향:**
- 사용자가 제약 조건을 모를 수 있음
- 비전문적으로 보임
- 입력 중 불편함

**개선 필요:**
- Checkbox에 남은 선택 개수 표시
- Custom Radio 컴포넌트 사용
- Textarea resize 제한 또는 auto-resize
- Focus ring 강화 및 애니메이션

#### **7. 프리뷰 패널**

**문제점:**
- 프리뷰 텍스트가 정적이고 단조로움
- 실제 블로그 포스트처럼 보이지 않음
- 프리뷰 업데이트 시 변화가 갑작스러움
- 다국어 프리뷰가 부족 (템플릿만 변경)

**영향:**
- 프리뷰의 유용성 저하
- 실제 결과물 예상 어려움
- 프리뷰 패널의 존재 가치 감소

**개선 필요:**
- Rich preview with markdown
- 애니메이션 효과로 변화 강조
- 여러 콘텐츠 타입 프리뷰 (제목, 본문, CTA)
- 실제 블로그 포스트 레이아웃

#### **8. 모바일 경험**

**문제점:**
- Accordion 프리뷰가 닫혀 있어 사용자가 놓칠 수 있음
- 키보드 단축키 힌트가 모바일에서 의미 없음
- Step dots의 라벨이 숨겨짐
- 버튼 크기가 Desktop과 차이남

**영향:**
- 모바일 사용자가 프리뷰를 보지 않을 수 있음
- 일관성 부족
- 터치 타겟이 불안정

**개선 필요:**
- 모바일에서 프리뷰 기본 열림
- 키보드 힌트 숨김 (lg:block)
- Step indicator 모바일 최적화
- 터치 타겟 크기 표준화

#### **9. 에러 처리 및 피드백**

**문제점:**
- 유효성 검사 에러가 폼 하단에만 표시
- 다음 단계로 못 넘어가는 이유가 불명확
- 에러 메시지가 작고 눈에 띄지 않음
- 전역 에러 상태 표시 부족

**영향:**
- 사용자가 무엇을 고쳐야 하는지 모름
- 좌절감 증가
- 이탈률 증가

**개선 필요:**
- 에러 필드로 자동 스크롤
- 에러 필드 강조 (빨간 테두리)
- Toast 알림으로 전역 에러 표시
- 에러 카운트 배지

#### **10. 접근성 개선 필요**

**문제점:**
- 키보드 단축키가 표준이 아님 (Alt + 화살표)
- Skip link 없음
- Focus 순서가 최적화되지 않음
- Color contrast 일부 미달

**영향:**
- 접근성 도구 사용자에게 불편
- WCAG 2.1 AA 미준수 가능성
- 키보드 전용 사용자 경험 저하

**개선 필요:**
- Tab/Shift+Tab으로 단계 이동
- Skip to navigation 링크
- Focus trap in modal
- Color contrast 검증 및 수정

---

## 2. 개선된 페이지 구성

### 2.1 전체 구조 개선

```typescript
// 개선된 페이지 구조
NewStyleGuidePage
└── PageLayoutV2
    ├── Hero Section (간소화)
    │   ├── Breadcrumb (Home > Style Guides > New)
    │   ├── Title + Description
    │   └── Progress Summary (Step X of 5)
    └── OnboardingWizardV2
        ├── StepIndicatorV2 (통합 프로그레스)
        ├── Desktop Layout (최적화된 2-column)
        │   ├── Form Panel (wider, 1.2fr)
        │   │   ├── Step Header (animated)
        │   │   ├── Form Fields (enhanced)
        │   │   ├── Field Helper (tooltips)
        │   │   └── Navigation (sticky bottom)
        │   └── Preview Panel (larger, 480px, sticky)
        │       ├── Live Preview (rich content)
        │       ├── Preview Tabs (다양한 예시)
        │       └── Settings Summary (enhanced)
        └── Mobile Layout (개선)
            ├── Step Header
            ├── Form Panel
            ├── Floating Preview Button
            ├── Preview Sheet (bottom drawer)
            └── Sticky Navigation
```

### 2.2 Hero Section (페이지 상단)

**목적:** 사용자에게 현재 위치와 작업 내용을 명확히 알림

**구성:**
- **Breadcrumb Navigation:** `Home > Style Guides > New Style Guide`
- **Title:** "새로운 스타일 가이드 만들기" (text-4xl font-bold)
- **Description:** "5단계로 완성하는 브랜드 맞춤 콘텐츠 스타일" (text-xl text-muted-foreground)
- **Progress Badge:** "Step 1 of 5" with percentage (subtle badge)

**디자인 특징:**
- 넉넉한 상단 여백 (py-12)
- 그라디언트 배경 (subtle)
- Fade-in 애니메이션

### 2.3 StepIndicator V2

**개선사항:**

1. **통합 디자인**
   - Progress bar를 step dots 위에 오버레이
   - Dots를 연결하는 라인 시각화
   - 현재 스텝에 pulse 애니메이션

2. **완료 상태 시각화**
   - 완료된 스텝에 체크마크 아이콘
   - 완료 애니메이션 (scale + fade)
   - 성공 컬러 (#10B981)

3. **반응형 개선**
   - 모바일: 숫자만 표시, 더 작은 dots
   - 태블릿: 축약된 라벨
   - 데스크톱: 전체 라벨

4. **인터랙티브**
   - 완료된 스텝 클릭 시 해당 스텝으로 이동
   - Hover 시 툴팁으로 스텝 이름 표시
   - Disabled 스타일 for future steps

### 2.4 Form Panel 개선

**1. 스텝 헤더**
```typescript
<div className="mb-8 space-y-4">
  <div className="flex items-center gap-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
      <IconComponent className="h-6 w-6 text-primary" />
    </div>
    <div>
      <div className="text-sm font-medium text-muted-foreground">
        Step {currentStep} of {TOTAL_STEPS}
      </div>
      <h2 className="text-3xl font-bold tracking-tight">
        {stepTitle}
      </h2>
    </div>
  </div>
  <p className="text-lg text-muted-foreground leading-relaxed">
    {stepDescription}
  </p>
</div>
```

**2. 폼 필드 개선**
- 라벨 굵기 증가 (font-semibold)
- 필드 높이 증가 (h-12)
- Focus ring 강화 (ring-2 ring-primary)
- 에러 상태 강조 (border-destructive ring-destructive)
- Helper text 강화 (아이콘 + 텍스트)

**3. 특수 인터랙션**
- Checkbox 선택 카운터: "2 / 3 selected"
- Radio button을 카드 스타일로
- Textarea auto-resize
- Character count indicator

### 2.5 Preview Panel V2

**1. Rich Preview**
```typescript
<Card className="sticky top-6 overflow-hidden">
  <Tabs defaultValue="preview">
    <TabsList>
      <TabsTrigger value="preview">미리보기</TabsTrigger>
      <TabsTrigger value="examples">예시</TabsTrigger>
    </TabsList>

    <TabsContent value="preview">
      {/* 실제 블로그 포스트 레이아웃 */}
      <article className="prose">
        <h1>{generatedTitle}</h1>
        <p className="lead">{generatedIntro}</p>
        <div className="content">
          {generatedBody}
        </div>
      </article>
    </TabsContent>

    <TabsContent value="examples">
      {/* 다양한 톤의 예시 */}
      <ExamplePosts />
    </TabsContent>
  </Tabs>

  <Separator />

  {/* Settings Summary */}
  <div className="p-6">
    <SettingsSummary />
  </div>
</Card>
```

**2. 애니메이션**
- 프리뷰 업데이트 시 subtle fade
- 설정 변경 시 하이라이트 효과
- Skeleton loading for heavy computation

**3. 모바일: Bottom Sheet**
- Floating action button (bottom-right)
- Sheet로 프리뷰 열기
- Swipe down to close

### 2.6 Navigation Buttons V2

**1. Desktop: Sticky Bottom**
```typescript
<div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-6">
  <div className="flex items-center justify-between">
    <Button variant="ghost" size="lg">
      <ChevronLeft />
      Previous
    </Button>
    <div className="text-sm text-muted-foreground">
      Step {currentStep} of {TOTAL_STEPS}
    </div>
    <Button size="lg">
      Next
      <ChevronRight />
    </Button>
  </div>
</div>
```

**2. 버튼 상태**
- Disabled: opacity-50 + cursor-not-allowed
- Loading: spinner + "Processing..."
- Success: checkmark + "Complete"

**3. 단축키 힌트**
- 버튼 내부 또는 하단에 표시
- `<kbd>` 태그로 시각화
- Desktop only (lg:flex)

### 2.7 모바일 최적화

**1. 레이아웃**
- Single column
- Sticky header with progress
- Floating preview button
- Sticky navigation bottom

**2. 터치 최적화**
- 최소 터치 타겟: 44x44px
- 충분한 간격 (space-y-6)
- Swipe 제스처 지원

**3. 성능**
- Lazy load 프리뷰
- Debounced preview update
- Optimized re-renders

---

## 3. 참고 레퍼런스 (Claude.ai 스타일)

### 3.1 타이포그래피 시스템

Claude.ai는 명확한 타이포그래피 계층을 사용합니다:

```typescript
// 타이포그래피 스케일
const typography = {
  // Display
  'display-xl': 'text-6xl font-bold tracking-tight',  // 60px
  'display-lg': 'text-5xl font-bold tracking-tight',  // 48px

  // Heading
  'heading-xl': 'text-4xl font-bold tracking-tight',  // 36px
  'heading-lg': 'text-3xl font-bold tracking-tight',  // 30px
  'heading-md': 'text-2xl font-semibold',            // 24px
  'heading-sm': 'text-xl font-semibold',             // 20px

  // Body
  'body-lg': 'text-lg leading-relaxed',              // 18px
  'body-md': 'text-base leading-normal',             // 16px
  'body-sm': 'text-sm leading-normal',               // 14px

  // Label
  'label-lg': 'text-sm font-medium',
  'label-sm': 'text-xs font-medium uppercase tracking-wide',
};
```

**적용:**
- 스텝 제목: `heading-lg` (text-3xl font-bold)
- 스텝 설명: `body-lg` (text-lg leading-relaxed)
- 폼 라벨: `label-lg` (text-sm font-medium)
- Helper text: `body-sm` (text-sm text-muted-foreground)

### 3.2 컬러 시스템

Claude.ai는 일관된 의미 기반 컬러를 사용합니다:

```typescript
// 현재 하드코딩된 컬러를 Tailwind 토큰으로 변경
const colorMapping = {
  // 배경
  '#FCFCFD': 'bg-background',
  '#FFFFFF': 'bg-card',
  '#F5F7FA': 'bg-muted',
  '#F3F4F6': 'bg-accent',

  // 텍스트
  '#111827': 'text-foreground',
  '#1F2937': 'text-foreground',
  '#374151': 'text-card-foreground',
  '#6B7280': 'text-muted-foreground',
  '#9CA3AF': 'text-muted-foreground/60',

  // 테두리
  '#E1E5EA': 'border-border',
  '#E5E7EB': 'border-input',

  // Primary
  '#3BA2F8': 'bg-primary text-primary-foreground',

  // Success
  '#10B981': 'bg-success text-success-foreground',
};
```

**다크모드 지원:**
```typescript
// tailwind.config.ts에 다크모드 컬러 추가
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  // ...
}

// globals.css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

### 3.3 간격 시스템

Claude.ai는 일관된 간격 시스템을 사용합니다 (8px base):

```typescript
const spacing = {
  // 섹션 간격
  'section-gap': 'space-y-12',      // 48px
  'section-gap-lg': 'space-y-16',   // 64px

  // 컴포넌트 간격
  'component-gap': 'space-y-8',     // 32px
  'component-gap-sm': 'space-y-6',  // 24px

  // 필드 간격
  'field-gap': 'space-y-4',         // 16px

  // 패딩
  'card-padding': 'p-8',            // 32px
  'card-padding-sm': 'p-6',         // 24px
  'section-padding': 'py-12 px-8',  // 48px / 32px
};
```

**적용:**
- 스텝 간 전환: 64px 간격
- 폼 필드 그룹: 32px 간격
- 개별 필드: 24px 간격
- 카드 내부: 32px 패딩

### 3.4 애니메이션 패턴

Claude.ai는 framer-motion을 사용한 부드러운 애니메이션:

```typescript
// 1. 페이지 진입 애니메이션
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1], // easeInOut
    },
  },
};

// 2. 스텝 전환 애니메이션
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -20 : 20,
    opacity: 0,
    transition: { duration: 0.3 },
  }),
};

// 3. 프리뷰 업데이트 애니메이션
const previewVariants = {
  initial: { opacity: 0.7, scale: 0.98 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
};

// 4. 버튼 호버 애니메이션
const buttonVariants = {
  hover: {
    scale: 1.02,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.98 },
};

// 5. Step indicator 완료 애니메이션
const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: "easeInOut" },
      opacity: { duration: 0.2 },
    },
  },
};
```

### 3.5 카드 스타일

Claude.ai 스타일의 카드 디자인:

```typescript
// 기본 카드
<Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
  {content}
</Card>

// Elevated 카드 (프리뷰 패널)
<Card className="border-border bg-card shadow-lg">
  {content}
</Card>

// Interactive 카드 (Radio 선택)
<Card
  className={cn(
    "cursor-pointer transition-all duration-200",
    "border-2",
    selected
      ? "border-primary bg-primary/5 shadow-md"
      : "border-border hover:border-primary/50 hover:shadow-sm"
  )}
>
  {content}
</Card>

// Highlight 카드 (팁/정보)
<Card className="border-l-4 border-l-primary bg-primary/5 shadow-none">
  {content}
</Card>
```

### 3.6 인터랙티브 요소

Claude.ai 스타일의 인터랙티브 패턴:

**1. Focus State**
```typescript
// 모든 인터랙티브 요소
className={cn(
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-primary",
  "focus-visible:ring-offset-2"
)}
```

**2. Hover State**
```typescript
// 버튼
className={cn(
  "transition-all duration-200",
  "hover:scale-[1.02]",
  "hover:shadow-md"
)}

// 링크
className="underline-offset-4 hover:underline"

// 카드
className="hover:shadow-lg transition-shadow duration-200"
```

**3. Loading State**
```typescript
<Button disabled={isLoading}>
  {isLoading && (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  )}
  {isLoading ? "Processing..." : "Submit"}
</Button>
```

**4. Success State**
```typescript
<Button variant="success">
  <CheckCircle2 className="mr-2 h-4 w-4" />
  Complete
</Button>
```

---

## 4. UI 디자인 컨셉

### 4.1 컬러 팔레트 (Tailwind CSS 기준)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
    },
  },
};
```

```css
/* globals.css */
@layer base {
  :root {
    /* Background */
    --background: 0 0% 99%;           /* #FCFCFD */
    --foreground: 222.2 47.4% 11.2%;  /* #111827 */

    /* Card */
    --card: 0 0% 100%;                /* #FFFFFF */
    --card-foreground: 222.2 47.4% 11.2%;

    /* Primary (Blue) */
    --primary: 205 98% 61%;           /* #3BA2F8 */
    --primary-foreground: 0 0% 100%;

    /* Success (Green) */
    --success: 160 84% 39%;           /* #10B981 */
    --success-foreground: 0 0% 100%;

    /* Muted */
    --muted: 220 14% 96%;             /* #F5F7FA */
    --muted-foreground: 220 9% 46%;   /* #6B7280 */

    /* Accent */
    --accent: 220 13% 95%;            /* #F3F4F6 */
    --accent-foreground: 222.2 47.4% 11.2%;

    /* Border */
    --border: 214 12% 91%;            /* #E1E5EA */
    --input: 220 13% 91%;             /* #E5E7EB */

    /* Destructive */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    /* Ring */
    --ring: 205 98% 61%;              /* Same as primary */

    /* Radius */
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 205 98% 61%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --success: 160 84% 39%;
    --success-foreground: 0 0% 100%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --ring: 205 98% 61%;
  }
}
```

### 4.2 타이포그래피 스케일

```typescript
// 폰트 패밀리
fontFamily: {
  sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-geist-mono)', 'monospace'],
}

// 타이포그래피 클래스
const typography = {
  // 페이지 타이틀
  'page-title': 'text-4xl font-bold tracking-tight',

  // 섹션 타이틀
  'section-title': 'text-3xl font-bold tracking-tight',

  // 스텝 타이틀
  'step-title': 'text-2xl font-semibold',

  // 카드 타이틀
  'card-title': 'text-xl font-semibold',

  // 폼 라벨
  'form-label': 'text-sm font-medium leading-none',

  // Body large
  'body-large': 'text-lg leading-relaxed',

  // Body default
  'body-default': 'text-base leading-normal',

  // Body small
  'body-small': 'text-sm leading-normal',

  // Caption
  'caption': 'text-xs leading-tight',

  // Helper text
  'helper-text': 'text-sm text-muted-foreground',
};

// 행간 (line-height)
lineHeight: {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
  loose: '2',
}

// Letter spacing
letterSpacing: {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
}
```

### 4.3 간격 시스템

```typescript
// 섹션 간격
const sectionSpacing = {
  'section-y-sm': 'py-8',     // 32px (모바일)
  'section-y-md': 'py-12',    // 48px (태블릿)
  'section-y-lg': 'py-16',    // 64px (데스크톱)
  'section-y-xl': 'py-24',    // 96px (대형 화면)
};

// 컴포넌트 간격
const componentSpacing = {
  'gap-xs': 'space-y-2',      // 8px
  'gap-sm': 'space-y-4',      // 16px
  'gap-md': 'space-y-6',      // 24px
  'gap-lg': 'space-y-8',      // 32px
  'gap-xl': 'space-y-12',     // 48px
};

// 패딩
const padding = {
  'card-sm': 'p-4',           // 16px
  'card-md': 'p-6',           // 24px
  'card-lg': 'p-8',           // 32px
  'container': 'px-4 sm:px-6 lg:px-8',
};

// 마진
const margin = {
  'mb-xs': 'mb-2',            // 8px
  'mb-sm': 'mb-4',            // 16px
  'mb-md': 'mb-6',            // 24px
  'mb-lg': 'mb-8',            // 32px
  'mb-xl': 'mb-12',           // 48px
};
```

### 4.4 카드/컴포넌트 스타일

```typescript
// 기본 카드
const cardStyles = {
  base: cn(
    "rounded-xl",                    // 12px radius
    "border border-border",
    "bg-card",
    "shadow-sm",
    "transition-shadow duration-200"
  ),

  // Hover 상태
  hoverable: cn(
    "hover:shadow-md",
    "cursor-pointer"
  ),

  // Interactive (선택 가능)
  interactive: (selected: boolean) => cn(
    "border-2 transition-all duration-200",
    selected
      ? "border-primary bg-primary/5 shadow-md"
      : "border-border hover:border-primary/50"
  ),

  // Elevated (프리뷰, 모달)
  elevated: cn(
    "shadow-lg",
    "border border-border/50"
  ),

  // Highlight (팁, 경고)
  highlight: (variant: 'info' | 'warning' | 'success') => cn(
    "border-l-4 shadow-none",
    variant === 'info' && "border-l-primary bg-primary/5",
    variant === 'warning' && "border-l-yellow-500 bg-yellow-50",
    variant === 'success' && "border-l-success bg-success/5"
  ),
};

// 버튼 스타일
const buttonStyles = {
  // 크기
  sizes: {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-8 text-lg",
  },

  // Variant
  variants: {
    primary: cn(
      "bg-primary text-primary-foreground",
      "hover:bg-primary/90",
      "active:bg-primary/80"
    ),
    secondary: cn(
      "bg-secondary text-secondary-foreground",
      "hover:bg-secondary/80"
    ),
    outline: cn(
      "border-2 border-input bg-background",
      "hover:bg-accent hover:text-accent-foreground"
    ),
    ghost: cn(
      "hover:bg-accent hover:text-accent-foreground"
    ),
    success: cn(
      "bg-success text-success-foreground",
      "hover:bg-success/90"
    ),
  },

  // 공통
  common: cn(
    "inline-flex items-center justify-center",
    "rounded-lg font-medium",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50"
  ),
};

// Input 스타일
const inputStyles = {
  base: cn(
    "flex h-12 w-full rounded-md",
    "border border-input bg-background",
    "px-4 py-2 text-base",
    "ring-offset-background",
    "file:border-0 file:bg-transparent",
    "file:text-sm file:font-medium",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring",
    "focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "transition-all duration-200"
  ),

  error: cn(
    "border-destructive",
    "focus-visible:ring-destructive"
  ),
};
```

### 4.5 다크모드 고려사항

```typescript
// 다크모드 전환 전략
1. CSS Variables 기반 컬러 시스템 사용
2. 모든 컬러를 hsl() 형식으로 정의
3. 다크모드 토글 컴포넌트 추가

// 다크모드 최적화
- 그림자(shadow) 강도 조정
- 텍스트 대비 강화
- 밝은 컬러 채도 낮춤
- 배경 계층 간격 명확화

// 예시
<div className="bg-background text-foreground">
  <Card className="bg-card border-border">
    <h2 className="text-card-foreground">Title</h2>
    <p className="text-muted-foreground">Description</p>
  </Card>
</div>
```

---

## 5. 섹션별 컴포넌트 명세

### 5.1 PageLayoutV2

**파일:** `src/components/layout/page-layout-v2.tsx`

**Props:**
```typescript
interface PageLayoutV2Props {
  children: ReactNode;
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  currentStep?: number;
  totalSteps?: number;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  showBack?: boolean;
  onBack?: () => void;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}
```

**하위 컴포넌트:**
- `PageHeader`
  - `Breadcrumb`
  - `PageTitle`
  - `PageDescription`
  - `ProgressBadge` (optional)
  - `BackButton` (optional)

**스타일:**
```typescript
<div className="min-h-screen bg-background">
  <div className={cn(
    "container mx-auto px-4",
    "py-8 sm:py-12 lg:py-16",
    maxWidthClass
  )}>
    <PageHeader />
    {children}
  </div>
</div>
```

### 5.2 OnboardingWizardV2

**파일:** `src/features/onboarding/components/onboarding-wizard-v2.tsx`

**Props:**
```typescript
interface OnboardingWizardV2Props {
  onComplete: (data: OnboardingFormData) => Promise<void>;
  initialData?: Partial<OnboardingFormData>;
  autoSave?: boolean;
  showPreview?: boolean;
}
```

**상태 관리:**
```typescript
const [currentStep, setCurrentStep] = useState(1);
const [direction, setDirection] = useState(0); // For animation
const [isSubmitting, setIsSubmitting] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});
```

**하위 컴포넌트:**
- `StepIndicatorV2`
- `FormPanel`
  - `StepHeader`
  - `StepContent` (dynamic)
  - `NavigationBar` (sticky)
- `PreviewPanelV2` (sticky on desktop)
- `MobilePreviewSheet` (mobile only)

**애니메이션:**
```typescript
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={stepVariants}
    initial="enter"
    animate="center"
    exit="exit"
  >
    {renderStep()}
  </motion.div>
</AnimatePresence>
```

### 5.3 StepIndicatorV2

**파일:** `src/features/onboarding/components/step-indicator-v2.tsx`

**Props:**
```typescript
interface StepIndicatorV2Props {
  currentStep: number;
  totalSteps: number;
  steps: StepConfig[];
  onStepClick?: (step: number) => void;
}

interface StepConfig {
  id: number;
  label: string;
  icon?: LucideIcon;
  description?: string;
}
```

**하위 컴포넌트:**
- `ProgressLine` (SVG path connecting dots)
- `StepDot`
  - `StepNumber` (default)
  - `CheckmarkIcon` (completed)
  - `StepLabel` (desktop)
- `ProgressBar` (overlay or separate)

**애니메이션:**
```typescript
// Dot completion animation
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  className="step-dot"
>
  {isCompleted && (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <CheckCircle2 className="h-5 w-5" />
    </motion.div>
  )}
</motion.div>

// Current step pulse
{isCurrent && (
  <motion.div
    className="absolute inset-0 rounded-full bg-primary"
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.5, 0, 0.5],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
)}
```

### 5.4 StepHeader

**파일:** `src/features/onboarding/components/step-header.tsx`

**Props:**
```typescript
interface StepHeaderProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  icon?: LucideIcon;
}
```

**구조:**
```typescript
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="mb-8 space-y-4"
>
  <div className="flex items-start gap-4">
    {icon && (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    )}
    <div className="flex-1">
      <div className="mb-1 text-sm font-medium text-muted-foreground">
        Step {stepNumber} of {totalSteps}
      </div>
      <h2 className="text-3xl font-bold tracking-tight">
        {title}
      </h2>
      <p className="mt-2 text-lg text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  </div>
</motion.div>
```

### 5.5 FormField 개선 컴포넌트들

#### 5.5.1 EnhancedInput

**파일:** `src/features/onboarding/components/enhanced-input.tsx`

**Props:**
```typescript
interface EnhancedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  helperText?: string;
  helperIcon?: LucideIcon;
  maxLength?: number;
  showCharCount?: boolean;
}
```

**기능:**
- Character counter
- Error state with icon
- Helper text with icon
- Focus animation

#### 5.5.2 EnhancedTextarea

**Props:**
```typescript
interface EnhancedTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCharCount?: boolean;
  autoResize?: boolean;
}
```

**기능:**
- Auto-resize
- Character counter
- Error state
- Rich helper text

#### 5.5.3 CheckboxGroup

**파일:** `src/features/onboarding/components/checkbox-group.tsx`

**Props:**
```typescript
interface CheckboxGroupProps {
  label: string;
  description?: string;
  options: CheckboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
  error?: string;
}

interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}
```

**기능:**
- Selection counter: "2 / 3 selected"
- Disabled state when max reached
- Visual feedback for selections

**UI:**
```typescript
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <FormLabel>{label}</FormLabel>
    {maxSelections && (
      <Badge variant="secondary">
        {value.length} / {maxSelections} selected
      </Badge>
    )}
  </div>

  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {options.map((option) => (
      <CheckboxCard
        key={option.value}
        option={option}
        checked={value.includes(option.value)}
        disabled={!value.includes(option.value) && value.length >= maxSelections}
        onChange={handleChange}
      />
    ))}
  </div>
</div>
```

#### 5.5.4 RadioCardGroup

**파일:** `src/features/onboarding/components/radio-card-group.tsx`

**Props:**
```typescript
interface RadioCardGroupProps {
  label: string;
  description?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  layout?: 'vertical' | 'grid';
}

interface RadioOption {
  value: string;
  label: string;
  description: string;
  icon?: LucideIcon;
  recommended?: boolean;
}
```

**UI:**
```typescript
{options.map((option) => (
  <Card
    key={option.value}
    className={cn(
      "cursor-pointer transition-all duration-200",
      "border-2 p-4",
      value === option.value
        ? "border-primary bg-primary/5 shadow-md"
        : "border-border hover:border-primary/50 hover:shadow-sm"
    )}
    onClick={() => onChange(option.value)}
  >
    <div className="flex items-start gap-3">
      <div className={cn(
        "mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center",
        value === option.value
          ? "border-primary bg-primary"
          : "border-muted-foreground"
      )}>
        {value === option.value && (
          <div className="h-2 w-2 rounded-full bg-white" />
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">{option.label}</h4>
          {option.recommended && (
            <Badge variant="secondary" className="text-xs">
              추천
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {option.description}
        </p>
      </div>

      {option.icon && (
        <option.icon className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  </Card>
))}
```

### 5.6 PreviewPanelV2

**파일:** `src/features/onboarding/components/preview-panel-v2.tsx`

**Props:**
```typescript
interface PreviewPanelV2Props {
  formData: Partial<OnboardingFormData>;
  variant?: 'desktop' | 'mobile';
}
```

**구조:**
```typescript
<Card className="sticky top-6 overflow-hidden">
  {/* Tabs: Preview vs Examples */}
  <Tabs defaultValue="preview">
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="preview">미리보기</TabsTrigger>
      <TabsTrigger value="examples">예시</TabsTrigger>
    </TabsList>

    {/* Live Preview */}
    <TabsContent value="preview" className="p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={previewKey}
          variants={previewVariants}
          initial="initial"
          animate="animate"
        >
          <BlogPostPreview data={formData} />
        </motion.div>
      </AnimatePresence>
    </TabsContent>

    {/* Examples */}
    <TabsContent value="examples" className="p-6">
      <ExamplePosts formData={formData} />
    </TabsContent>
  </Tabs>

  <Separator />

  {/* Settings Summary */}
  <div className="p-6">
    <SettingsSummary formData={formData} />
  </div>
</Card>
```

**하위 컴포넌트:**
- `BlogPostPreview` - 실제 블로그 포스트 레이아웃
- `ExamplePosts` - 다양한 톤의 예시
- `SettingsSummary` - 현재 설정 요약

**애니메이션:**
```typescript
// Preview update animation
const previewVariants = {
  initial: { opacity: 0.7, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

// Highlight changed setting
const [changedField, setChangedField] = useState<string | null>(null);

useEffect(() => {
  // Detect which field changed
  const changed = detectChangedField(prevData, formData);
  if (changed) {
    setChangedField(changed);
    setTimeout(() => setChangedField(null), 2000);
  }
}, [formData]);

// Highlight effect
<motion.div
  animate={changedField === 'tone' ? {
    backgroundColor: ['hsl(var(--primary) / 0.1)', 'transparent']
  } : {}}
  transition={{ duration: 1 }}
>
  <span>Tone: {tone}</span>
</motion.div>
```

### 5.7 NavigationBar

**파일:** `src/features/onboarding/components/navigation-bar.tsx`

**Props:**
```typescript
interface NavigationBarProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  canGoNext: boolean;
  variant?: 'desktop' | 'mobile';
}
```

**구조:**
```typescript
<motion.div
  className={cn(
    "sticky bottom-0 bg-background/95 backdrop-blur",
    "supports-[backdrop-filter]:bg-background/60",
    "border-t border-border",
    "p-4 sm:p-6"
  )}
  initial={{ y: 100 }}
  animate={{ y: 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
  <div className="flex items-center justify-between">
    {/* Previous Button */}
    <Button
      variant="ghost"
      size="lg"
      onClick={onPrevious}
      disabled={currentStep === 1}
    >
      <ChevronLeft className="mr-2 h-4 w-4" />
      Previous
    </Button>

    {/* Progress Indicator */}
    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
      <span>Step {currentStep} of {totalSteps}</span>
      <Separator orientation="vertical" className="h-4" />
      <kbd className="kbd">Alt</kbd>
      <span>+</span>
      <kbd className="kbd">→</kbd>
    </div>

    {/* Next / Submit Button */}
    {currentStep < totalSteps ? (
      <Button
        size="lg"
        onClick={onNext}
        disabled={!canGoNext}
      >
        Next
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    ) : (
      <Button
        size="lg"
        variant="success"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete
          </>
        )}
      </Button>
    )}
  </div>
</motion.div>
```

### 5.8 MobilePreviewSheet

**파일:** `src/features/onboarding/components/mobile-preview-sheet.tsx`

**Props:**
```typescript
interface MobilePreviewSheetProps {
  formData: Partial<OnboardingFormData>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**구조:**
```typescript
{/* Floating Action Button */}
<motion.button
  className={cn(
    "fixed bottom-20 right-4 z-50",
    "h-14 w-14 rounded-full",
    "bg-primary text-primary-foreground",
    "shadow-lg",
    "flex items-center justify-center",
    "lg:hidden" // Desktop에서 숨김
  )}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={() => setOpen(true)}
>
  <Eye className="h-6 w-6" />
  {hasChanges && (
    <motion.div
      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    />
  )}
</motion.button>

{/* Bottom Sheet */}
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent side="bottom" className="h-[80vh]">
    <SheetHeader>
      <SheetTitle>미리보기</SheetTitle>
      <SheetDescription>
        현재 설정으로 생성될 콘텐츠를 확인하세요
      </SheetDescription>
    </SheetHeader>

    <div className="mt-6 overflow-y-auto pb-6">
      <PreviewPanelV2 formData={formData} variant="mobile" />
    </div>
  </SheetContent>
</Sheet>
```

---

## 6. 애니메이션 명세 (framer-motion)

### 6.1 페이지 레벨 애니메이션

```typescript
// PageLayoutV2
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const pageItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

<motion.div
  variants={pageVariants}
  initial="hidden"
  animate="visible"
>
  <motion.div variants={pageItemVariants}>
    <PageHeader />
  </motion.div>
  <motion.div variants={pageItemVariants}>
    {children}
  </motion.div>
</motion.div>
```

### 6.2 스텝 전환 애니메이션

```typescript
// OnboardingWizardV2
const [[currentStep, direction], setStep] = useState([1, 0]);

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -30 : 30,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  }),
};

const handleNext = () => {
  setStep([currentStep + 1, 1]);
};

const handlePrevious = () => {
  setStep([currentStep - 1, -1]);
};

<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={stepVariants}
    initial="enter"
    animate="center"
    exit="exit"
  >
    {renderStep()}
  </motion.div>
</AnimatePresence>
```

### 6.3 StepIndicator 애니메이션

```typescript
// StepIndicatorV2

// 1. Step dot transition
<motion.div
  className="step-dot"
  initial={false}
  animate={{
    scale: isCurrent ? 1.1 : 1,
    backgroundColor: isCompleted || isCurrent
      ? 'hsl(var(--primary))'
      : 'hsl(var(--muted))',
  }}
  transition={{ duration: 0.3 }}
>
  <AnimatePresence mode="wait">
    {isCompleted ? (
      <motion.div
        key="check"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <CheckCircle2 className="h-5 w-5 text-white" />
      </motion.div>
    ) : (
      <motion.span
        key="number"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
      >
        {stepNumber}
      </motion.span>
    )}
  </AnimatePresence>
</motion.div>

// 2. Current step pulse
{isCurrent && (
  <motion.div
    className="absolute inset-0 rounded-full bg-primary"
    animate={{
      scale: [1, 1.3, 1],
      opacity: [0.5, 0, 0.5],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
)}

// 3. Progress bar animation
<motion.div
  className="h-2 bg-primary rounded-full"
  initial={{ width: 0 }}
  animate={{ width: `${progressPercentage}%` }}
  transition={{
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1],
  }}
/>

// 4. Connection line draw
<motion.line
  x1={x1}
  y1={y1}
  x2={x2}
  y2={y2}
  stroke="hsl(var(--border))"
  strokeWidth={2}
  initial={{ pathLength: 0 }}
  animate={{ pathLength: isCompleted ? 1 : 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
/>
```

### 6.4 Form Field 애니메이션

```typescript
// EnhancedInput, EnhancedTextarea

// 1. Focus ring animation
<motion.div
  className="relative"
  whileFocus="focused"
  variants={{
    focused: {
      scale: 1.01,
      transition: { duration: 0.2 },
    },
  }}
>
  <input className="..." />
</motion.div>

// 2. Error state animation
<AnimatePresence>
  {error && (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.2 }}
      className="text-sm text-destructive flex items-center gap-1 mt-1"
    >
      <AlertCircle className="h-4 w-4" />
      {error}
    </motion.div>
  )}
</AnimatePresence>

// 3. Character count color transition
<motion.span
  animate={{
    color: remaining < 0
      ? 'hsl(var(--destructive))'
      : remaining < 20
      ? 'hsl(var(--warning))'
      : 'hsl(var(--muted-foreground))',
  }}
  transition={{ duration: 0.2 }}
>
  {remaining} characters remaining
</motion.span>

// 4. Label float animation (Material Design style)
<motion.label
  className="absolute left-3 pointer-events-none"
  animate={{
    top: isFocused || hasValue ? '-0.5rem' : '0.75rem',
    fontSize: isFocused || hasValue ? '0.75rem' : '1rem',
    color: isFocused
      ? 'hsl(var(--primary))'
      : 'hsl(var(--muted-foreground))',
  }}
  transition={{ duration: 0.2 }}
>
  {label}
</motion.label>
```

### 6.5 Checkbox/Radio 애니메이션

```typescript
// CheckboxCard
<motion.div
  className="checkbox-card"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  animate={{
    borderColor: checked
      ? 'hsl(var(--primary))'
      : 'hsl(var(--border))',
    backgroundColor: checked
      ? 'hsl(var(--primary) / 0.05)'
      : 'transparent',
  }}
  transition={{ duration: 0.2 }}
>
  {/* Checkmark animation */}
  <svg className="check-icon" viewBox="0 0 24 24">
    <motion.path
      d="M5 13l4 4L19 7"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: checked ? 1 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
  </svg>
</motion.div>

// RadioCard
<motion.div
  className="radio-card"
  whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
  whileTap={{ scale: 0.98 }}
  animate={{
    borderColor: selected
      ? 'hsl(var(--primary))'
      : 'hsl(var(--border))',
    borderWidth: selected ? '2px' : '1px',
  }}
>
  {/* Radio dot animation */}
  <motion.div
    className="radio-dot"
    animate={{
      scale: selected ? 1 : 0,
      opacity: selected ? 1 : 0,
    }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
  />
</motion.div>
```

### 6.6 Preview Panel 애니메이션

```typescript
// PreviewPanelV2

// 1. Tab content transition
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    transition={{ duration: 0.2 }}
  >
    <TabContent />
  </motion.div>
</AnimatePresence>

// 2. Preview update animation
const previewKey = JSON.stringify(formData);

<AnimatePresence mode="wait">
  <motion.article
    key={previewKey}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    <BlogPostPreview data={formData} />
  </motion.article>
</AnimatePresence>

// 3. Settings summary highlight
const [highlightedSetting, setHighlightedSetting] = useState<string | null>(null);

useEffect(() => {
  const changedKeys = getChangedKeys(prevData, formData);
  if (changedKeys.length > 0) {
    setHighlightedSetting(changedKeys[0]);
    setTimeout(() => setHighlightedSetting(null), 1500);
  }
}, [formData]);

<motion.div
  className="setting-row"
  animate={highlightedSetting === 'tone' ? {
    backgroundColor: [
      'hsl(var(--primary) / 0.1)',
      'transparent',
    ],
  } : {}}
  transition={{ duration: 1 }}
>
  <span>Tone</span>
  <span>{tone}</span>
</motion.div>

// 4. Sticky scroll animation
const { scrollY } = useScroll();
const opacity = useTransform(scrollY, [0, 100], [1, 0.95]);
const scale = useTransform(scrollY, [0, 100], [1, 0.98]);

<motion.div
  className="sticky top-6"
  style={{ opacity, scale }}
>
  <PreviewCard />
</motion.div>
```

### 6.7 Button 애니메이션

```typescript
// NavigationBar buttons

<motion.button
  className="btn"
  whileHover={{
    scale: 1.02,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
  {children}
</motion.button>

// Loading button
<Button disabled={isLoading}>
  <AnimatePresence mode="wait">
    {isLoading ? (
      <motion.div
        key="loading"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 360 }}
        exit={{ opacity: 0 }}
        transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
      >
        <Loader2 className="h-4 w-4" />
      </motion.div>
    ) : (
      <motion.div
        key="idle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        Submit
      </motion.div>
    )}
  </AnimatePresence>
</Button>

// Success button
<motion.button
  initial={{ scale: 1 }}
  animate={isSuccess ? {
    scale: [1, 1.1, 1],
    backgroundColor: [
      'hsl(var(--primary))',
      'hsl(var(--success))',
      'hsl(var(--success))',
    ],
  } : {}}
  transition={{ duration: 0.5 }}
>
  {isSuccess ? (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <CheckCircle2 className="mr-2 h-4 w-4" />
    </motion.div>
  ) : null}
  {isSuccess ? 'Complete' : 'Submit'}
</motion.button>
```

### 6.8 Mobile Preview Sheet 애니메이션

```typescript
// MobilePreviewSheet

// 1. FAB (Floating Action Button)
<motion.button
  className="floating-preview-btn"
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0, opacity: 0 }}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
  <Eye className="h-6 w-6" />

  {/* Notification dot */}
  {hasChanges && (
    <motion.div
      className="notification-dot"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )}
</motion.button>

// 2. Sheet enter/exit
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent
    side="bottom"
    className="h-[80vh]"
    asChild
  >
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      {content}
    </motion.div>
  </SheetContent>
</Sheet>

// 3. Sheet content stagger
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### 6.9 Toast/Notification 애니메이션

```typescript
// Error toast
const showError = (message: string) => {
  toast.error(message, {
    // Custom animation
    className: cn(
      "animate-in slide-in-from-top-full",
      "duration-300"
    ),
  });
};

// Success toast with icon animation
const showSuccess = () => {
  toast.success(
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <CheckCircle2 className="h-5 w-5 text-success" />
      </motion.div>
      <span>Style guide created successfully!</span>
    </div>
  );
};
```

### 6.10 성능 최적화

```typescript
// 1. Layout animations (GPU accelerated)
<motion.div
  style={{
    willChange: 'transform',
  }}
  animate={{ x: 100 }}
  transition={{ type: "spring" }}
/>

// 2. Prevent layout thrashing
<motion.div
  layout // Use layoutId for shared element transitions
  layoutId="preview-card"
>
  {content}
</motion.div>

// 3. Reduce re-renders
const MotionDiv = memo(motion.div);

// 4. Use AnimatePresence efficiently
<AnimatePresence mode="wait" initial={false}>
  {/* mode="wait": wait for exit before enter */}
  {/* initial={false}: disable initial animation on mount */}
</AnimatePresence>

// 5. Debounce preview updates
const debouncedFormData = useDebounce(formData, 300);

<PreviewPanel formData={debouncedFormData} />
```

---

## 7. 구현 우선순위

### Phase 1: 기본 개선 (1-2일)
**목표:** 인라인 스타일 제거, 디자인 시스템 구축

1. **디자인 토큰 마이그레이션**
   - [ ] `globals.css`에 CSS Variables 추가
   - [ ] `tailwind.config.ts` 확장
   - [ ] 모든 인라인 `style` 제거
   - [ ] Tailwind 클래스로 변환

2. **타이포그래피 시스템 적용**
   - [ ] 폰트 크기 표준화
   - [ ] 행간 및 자간 조정
   - [ ] 제목 계층 명확화

3. **간격 시스템 통일**
   - [ ] 섹션 간격 일관성
   - [ ] 카드 패딩 표준화
   - [ ] 컴포넌트 간격 규칙 적용

### Phase 2: 컴포넌트 개선 (2-3일)
**목표:** 사용자 경험 향상, 인터랙션 개선

1. **StepIndicator V2 구현**
   - [ ] 체크마크 완료 상태
   - [ ] 연결 라인 추가
   - [ ] 클릭 가능한 dots (완료된 스텝)
   - [ ] Pulse 애니메이션

2. **Enhanced Form Fields**
   - [ ] `EnhancedInput` 컴포넌트
   - [ ] `EnhancedTextarea` with auto-resize
   - [ ] `CheckboxGroup` with counter
   - [ ] `RadioCardGroup` 카드 스타일

3. **Preview Panel V2**
   - [ ] Tabs (미리보기 / 예시)
   - [ ] Rich blog post preview
   - [ ] Settings summary 개선
   - [ ] 모바일 Bottom Sheet

### Phase 3: 애니메이션 (2-3일)
**목표:** 프리미엄 느낌, 부드러운 전환

1. **페이지 레벨 애니메이션**
   - [ ] 페이지 진입 fade-in
   - [ ] 스텝 전환 slide
   - [ ] 스크롤 기반 애니메이션

2. **마이크로 인터랙션**
   - [ ] 버튼 호버/탭
   - [ ] 폼 필드 포커스
   - [ ] 에러 상태 전환
   - [ ] 로딩 스피너

3. **프리뷰 업데이트 애니메이션**
   - [ ] 프리뷰 내용 변경 시 fade
   - [ ] 설정 변경 하이라이트
   - [ ] Skeleton loading

### Phase 4: 모바일 최적화 (1-2일)
**목표:** 모바일 경험 향상

1. **레이아웃 최적화**
   - [ ] Sticky header
   - [ ] Floating preview button
   - [ ] Bottom sheet preview
   - [ ] Sticky navigation

2. **터치 최적화**
   - [ ] 터치 타겟 크기 (44px+)
   - [ ] Swipe 제스처
   - [ ] Pull to refresh (optional)

3. **성능 최적화**
   - [ ] Lazy loading
   - [ ] Debounced updates
   - [ ] Optimized re-renders

### Phase 5: 접근성 & 폴리싱 (1일)
**목표:** 접근성 준수, 최종 다듬기

1. **접근성**
   - [ ] Keyboard navigation 개선
   - [ ] ARIA 라벨 강화
   - [ ] Color contrast 검증
   - [ ] Focus trap

2. **에러 핸들링**
   - [ ] 에러 필드 자동 스크롤
   - [ ] Toast 알림
   - [ ] 인라인 에러 강조

3. **UX 개선**
   - [ ] Auto-save (optional)
   - [ ] Progress persistence
   - [ ] Exit confirmation
   - [ ] Success celebration

---

## 8. 성공 지표

### 디자인 품질
- [x] Claude.ai 수준의 전문성
  - [ ] 일관된 디자인 시스템
  - [ ] 명확한 시각적 계층
  - [ ] 프리미엄 느낌의 애니메이션

### 사용자 경험
- [x] 명확한 가치 제안
  - [ ] 각 스텝의 목적 명확
  - [ ] 실시간 피드백
  - [ ] 진행 상황 시각화

- [x] 부드러운 애니메이션
  - [ ] 60fps 유지
  - [ ] 자연스러운 전환
  - [ ] 마이크로 인터랙션

### 반응형 & 접근성
- [x] 모바일 최적화
  - [ ] 터치 친화적
  - [ ] 빠른 로딩
  - [ ] 적절한 폰트 크기

- [x] 접근성 준수
  - [ ] WCAG 2.1 AA 이상
  - [ ] 키보드 네비게이션
  - [ ] 스크린 리더 지원

### 기술 품질
- [x] 유지보수성
  - [ ] 디자인 토큰 기반
  - [ ] 컴포넌트 재사용성
  - [ ] 타입 안전성

- [x] 성능
  - [ ] Lighthouse 점수 90+
  - [ ] 애니메이션 최적화
  - [ ] 번들 크기 관리

### 다국어 지원
- [x] i18n 완전 지원
  - [ ] 모든 텍스트 번역
  - [ ] RTL 언어 대응 (필요 시)
  - [ ] 로케일별 포맷

---

## 9. 추가 제안

### 9.1 Auto-Save 기능
사용자가 입력한 내용을 `localStorage`에 자동 저장하여 새로고침 시에도 유지

```typescript
const STORAGE_KEY = 'onboarding-draft';

useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    form.reset(data);
    toast.info("Saved draft loaded");
  }
}, []);

useEffect(() => {
  const subscription = form.watch((value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  });
  return () => subscription.unsubscribe();
}, [form]);
```

### 9.2 Exit Confirmation
사용자가 페이지를 떠날 때 확인 대화상자

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (form.formState.isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [form.formState.isDirty]);
```

### 9.3 AI-Powered Suggestions
각 필드에 AI 제안 기능 추가 (선택사항)

```typescript
<EnhancedInput
  label="Brand Name"
  value={brandName}
  onChange={setBrandName}
  aiSuggestions={[
    "TechFlow",
    "InnovateLab",
    "CloudSphere"
  ]}
  onAcceptSuggestion={(value) => setBrandName(value)}
/>
```

### 9.4 Template Library
사전 정의된 스타일 가이드 템플릿

```typescript
const templates = [
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    data: { ... },
  },
  {
    id: 'lifestyle-blog',
    name: 'Lifestyle Blog',
    data: { ... },
  },
];

<TemplateSelector
  templates={templates}
  onSelect={(template) => form.reset(template.data)}
/>
```

### 9.5 Export/Import 기능
스타일 가이드 JSON 내보내기/가져오기

```typescript
const exportStyleGuide = () => {
  const data = form.getValues();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  saveAs(blob, 'style-guide.json');
};

const importStyleGuide = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target?.result as string);
    form.reset(data);
  };
  reader.readAsText(file);
};
```

---

## 10. 결론

현재 `/style-guides/new` 페이지는 **잘 구성된 기능적 온보딩 위저드**이지만, **시각적 세련미와 사용자 경험 측면에서 개선의 여지**가 많습니다.

### 핵심 개선 방향:

1. **디자인 시스템 구축** - 인라인 스타일을 Tailwind 토큰으로 전환하여 일관성과 유지보수성 향상
2. **애니메이션 추가** - framer-motion을 활용한 부드러운 전환과 마이크로 인터랙션으로 프리미엄 느낌 제공
3. **시각적 계층 강화** - 타이포그래피와 간격 시스템을 통해 정보 스캔 가능성 향상
4. **모바일 경험 최적화** - 터치 친화적 인터페이스와 Bottom Sheet 프리뷰로 모바일 사용성 개선
5. **접근성 강화** - WCAG 2.1 AA 준수 및 키보드 네비게이션 개선

이러한 개선을 통해 **Claude.ai 수준의 전문적이고 세련된 온보딩 경험**을 제공할 수 있습니다.

구현은 **Phase 1부터 순차적으로 진행**하되, **Phase 2 (컴포넌트 개선)와 Phase 3 (애니메이션)이 가장 큰 임팩트**를 제공할 것으로 예상됩니다.
