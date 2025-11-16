# 페이지 분석 및 개선안: New Article Page

## 1. 현재 상태 분석

### 1.1 페이지 구조

**현재 페이지 구성:**
```
NewArticlePage
├─ Form Mode: GenerationForm
│  └─ 주제 입력 텍스트에리어 (스타일 가이드 선택 + 생성 버튼 포함)
├─ Generating Mode: 실시간 스트리밍 프리뷰
│  └─ Table 기반 필드별 진행 상황 표시
└─ Complete Mode: 생성 완료 화면
   ├─ Markdown 프리뷰
   └─ 다시하기 / 저장하기 버튼
```

**사용 중인 컴포넌트:**
- `GenerationForm`: 사용자 입력 폼 (주제, 스타일 가이드 선택)
- `GenerationProgress`: 별도 컴포넌트로 존재하나 페이지에서 미사용
- `ReactMarkdown`: 생성 완료 후 마크다운 렌더링
- `Table`: 생성 중 메타데이터 표시

### 1.2 현재 디자인의 강점

✅ **명확한 상태 관리**
- Form → Generating → Complete의 3단계 플로우가 명확함
- 사용자가 현재 어떤 단계에 있는지 쉽게 파악 가능

✅ **실시간 피드백**
- AI 생성 과정을 스트리밍으로 보여주어 진행 상황을 투명하게 제공
- 제목, 메타 설명, 키워드, 본문 등을 실시간으로 확인 가능

✅ **심플한 입력 폼**
- 텍스트에리어 중심의 간결한 UI
- 스타일 가이드 선택과 생성 버튼이 입력 영역 내부에 배치되어 공간 효율적

### 1.3 약점 및 개선 필요 부분

#### 🔴 **Critical Issues**

**1. GenerationProgress 컴포넌트 미사용**
- 별도로 잘 만들어진 `GenerationProgress` 컴포넌트가 존재하나 전혀 사용되지 않음
- 현재 Generating 모드에서 단순 Table만 사용하여 전문성 부족
- 진행률, 시간 표시, 스켈레톤 UI 등이 모두 누락

**2. 레이아웃 일관성 부재**
- Form 모드는 중앙 정렬, Generating/Complete 모드는 좌측 정렬
- 컨테이너 max-width가 모드별로 다름 (Form: max-w-3xl, 나머지: max-w-4xl)
- 전환 시 레이아웃 점프 발생

**3. 디자인 시스템 혼재**
- Tailwind CSS 변수 미사용: `style={{ backgroundColor: "#3BA2F8" }}` 등 하드코딩된 색상
- 일부는 Tailwind 클래스, 일부는 인라인 스타일 혼용
- `borderRadius: "8px"` vs `rounded-lg` 등 일관성 없음

**4. 애니메이션 및 전환 효과 부재**
- 모드 전환 시 즉각적인 DOM 교체로 급격한 변화
- 부드러운 fade-in/out, slide 애니메이션 없음
- 사용자 경험이 기계적이고 딱딱함

**5. 접근성 문제**
- Generating 모드의 Table에 적절한 ARIA 레이블 없음
- 진행 상황을 스크린 리더가 읽을 수 없음
- Complete 모드의 프리뷰에 제목 계층 구조 불명확

#### 🟡 **Medium Priority Issues**

**6. 사용자 피드백 부족**
- 생성 중 예상 소요 시간 미표시
- 진행률 표시 없음 (GenerationProgress에는 있으나 미사용)
- 취소 버튼 없음 (스트리밍 중단 불가)

**7. 에러 처리 미흡**
- 에러 발생 시 단순 toast만 표시
- 재시도 옵션 없음 (Form으로 돌아가 처음부터 다시 입력해야 함)
- 에러 원인 파악이 어려움

**8. 모바일 최적화 부족**
- Form의 텍스트에리어 내부 버튼 배치가 모바일에서 겹칠 가능성
- Generating 모드의 Table이 좁은 화면에서 가독성 저하
- Complete 모드의 버튼이 모바일에서 간격 부족

**9. 시각적 계층 구조 약함**
- Generating 모드에서 중요 정보(제목, 본문)와 부수 정보(키워드, 메타태그)의 시각적 구분 없음
- Complete 모드에서 제목과 본문의 간격, 타이포그래피 스케일이 부족

**10. 국제화 불완전**
- 일부 텍스트가 하드코딩됨 ("다시하기", "저장하기" 등)
- 에러 메시지 일부가 한글로 고정

#### 🟢 **Low Priority Improvements**

**11. 프리뷰 기능 부재**
- 생성 완료 후 편집 전 프리뷰만 가능
- 생성 중에는 raw 텍스트만 보여 가독성 낮음

**12. 메타데이터 시각화 부족**
- 키워드, 메타 설명 등이 단순 텍스트로만 표시
- 태그 UI, 카드 UI 등 시각적 표현 없음

**13. 저장 옵션 제한적**
- 초안으로만 저장 가능
- 즉시 발행, 예약 발행 등 옵션 없음

---

## 2. 개선된 페이지 구성

### 2.1 Hero Section (Form Mode 개선)

**목적:** 사용자가 AI 글 생성을 시작하는 진입점

**메시지:**
- 주제목: "AI가 당신의 글을 작성합니다"
- 부제목: "주제만 입력하면 SEO 최적화된 전문 블로그 글이 완성됩니다"

**CTA:**
- Primary: "생성하기" (Sparkles 아이콘)
- Secondary: "스타일 가이드 설정" (Settings 아이콘)

**개선 사항:**
- 중앙 정렬 유지
- 헤더 추가로 가치 제안 명확화
- 입력 영역을 claude.ai의 대화 입력창처럼 세련되게 개선
- 플레이스홀더에 예시 제공 ("예: React 19의 새로운 기능과 활용 방법")

### 2.2 Generation Progress Section

**목적:** AI 생성 과정을 투명하게 보여주고 신뢰감 형성

**구성:**
1. **Progress Indicator**
   - 진행률 바 (0-100%)
   - 예상 남은 시간
   - 현재 단계 표시 ("제목 생성 중...", "본문 작성 중..." 등)

2. **Real-time Preview**
   - 스켈레톤 UI로 시작
   - 데이터가 들어오면 점진적으로 페이드인
   - 제목 → 메타 설명 → 키워드 → 본문 순서로 표시

3. **Metadata Cards**
   - Table 대신 Card 기반 UI
   - 각 메타데이터를 시각적으로 구분
   - 아이콘 + 레이블 + 값 구조

4. **Controls**
   - 취소 버튼 (X 아이콘, 우측 상단)
   - 일시정지 옵션 (선택사항)

**개선 사항:**
- 기존 `GenerationProgress` 컴포넌트 활용
- framer-motion으로 부드러운 애니메이션
- ARIA 레이블로 접근성 향상

### 2.3 Preview & Edit Section (Complete Mode 개선)

**목적:** 생성된 글을 확인하고 다음 단계 선택

**구성:**
1. **Success Message**
   - 체크 아이콘 + "글 생성 완료!" 메시지
   - 생성 소요 시간 표시

2. **Article Preview**
   - 제목 (대형 타이포그래피)
   - 메타 설명 (muted 색상)
   - 키워드 태그 (Pill UI)
   - 본문 (ReactMarkdown, prose 스타일)

3. **Metadata Summary**
   - 우측 사이드바 (데스크톱) 또는 하단 (모바일)
   - SEO 점수 표시 (선택사항)
   - 글자 수, 예상 읽기 시간

4. **Action Buttons**
   - Primary: "초안으로 저장"
   - Secondary: "다시 생성"
   - Tertiary: "편집 모드로 이동"

**개선 사항:**
- 2단 레이아웃 (본문 + 메타데이터 사이드바)
- 성공 축하 애니메이션 (confetti 또는 checkmark)
- 다양한 저장/편집 옵션 제공

---

## 3. 참고 레퍼런스 (claude.ai 기반)

### 3.1 Hero 패턴

**레퍼런스 설명:**
- claude.ai의 대화 입력창은 중앙에 크고 명확하게 배치
- 플레이스홀더가 매우 친근하고 구체적 ("What would you like to create today?")
- 입력창 주변에 여백이 충분하여 집중도 높음
- 그라디언트나 서브틀한 배경으로 premium 느낌

**적용 방법:**
```tsx
// Form 영역을 중앙 배치, 충분한 여백
<div className="flex min-h-screen items-center justify-center px-4">
  <div className="w-full max-w-4xl space-y-6">
    {/* Header */}
    <div className="text-center space-y-4">
      <h1 className="text-5xl font-bold tracking-tight">
        AI가 당신의 글을 작성합니다
      </h1>
      <p className="text-xl text-muted-foreground">
        주제만 입력하면 SEO 최적화된 전문 블로그 글이 완성됩니다
      </p>
    </div>

    {/* Input Area */}
    <div className="relative">
      <Textarea
        placeholder="예: React 19의 새로운 기능과 활용 방법"
        className="min-h-[200px] text-lg rounded-3xl border-2 px-8 py-6"
      />
      {/* Controls inside textarea */}
    </div>
  </div>
</div>
```

**차별화 포인트:**
- claude.ai는 대화형이지만, 우리는 글 생성에 특화
- 스타일 가이드 선택을 부각하여 브랜드 일관성 강조
- 키워드 입력 옵션 추가 (claude.ai에는 없는 기능)

### 3.2 Progress Indicator 패턴

**레퍼런스 설명:**
- claude.ai는 응답 생성 시 타이핑 애니메이션 사용
- 현재 작성 중인 부분이 커서와 함께 표시됨
- 부드럽고 자연스러운 스트리밍 효과

**적용 방법:**
```tsx
// 기존 GenerationProgress 컴포넌트 활용
<GenerationProgress
  isGenerating={mode === "generating"}
  error={localError}
  onCancel={handleCancel}
  onRetry={handleRetry}
/>

// 추가로 실시간 스트리밍 프리뷰
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="prose prose-lg max-w-none"
>
  <ReactMarkdown>{generatingPreview}</ReactMarkdown>
</motion.div>
```

**차별화 포인트:**
- 진행률 바와 예상 시간 추가 (claude.ai는 없음)
- 메타데이터(키워드, 메타태그)를 카드로 시각화
- 취소 기능 제공

### 3.3 Content Preview 패턴

**레퍼런스 설명:**
- claude.ai는 생성된 콘텐츠를 깔끔한 타이포그래피로 표시
- 코드 블록, 리스트, 인용구 등이 명확히 구분됨
- 복사, 재생성 등의 액션이 호버 시 표시됨

**적용 방법:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Main Content */}
  <div className="lg:col-span-2">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="prose prose-lg prose-neutral max-w-none"
    >
      <h1>{parsed.title}</h1>
      <p className="lead text-muted-foreground">
        {parsed.metaDescription}
      </p>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {parsed.content}
      </ReactMarkdown>
    </motion.div>
  </div>

  {/* Metadata Sidebar */}
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>메타데이터</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Keywords */}
        <div>
          <Label>키워드</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {parsed.keywords?.map(k => (
              <Badge key={k} variant="secondary">{k}</Badge>
            ))}
          </div>
        </div>
        {/* Other metadata */}
      </CardContent>
    </Card>
  </div>
</div>
```

**차별화 포인트:**
- 메타데이터 사이드바 추가 (SEO 특화)
- 키워드 태그를 시각적으로 표현
- 저장 옵션 다양화 (초안, 예약 발행 등)

### 3.4 Error Handling 패턴

**레퍼런스 설명:**
- claude.ai는 에러 발생 시 명확한 메시지와 재시도 옵션 제공
- 에러 타입별로 다른 아이콘과 색상 사용
- 복구 가능한 에러는 자동 재시도 제안

**적용 방법:**
```tsx
// GenerationProgress 컴포넌트의 에러 UI 활용
// 이미 구현되어 있음:
// - Quota Error: 제한 안내 + 재시도 불가
// - AI Error: 재시도 버튼 제공
// - Generic Error: 재시도 + 취소 옵션
```

**차별화 포인트:**
- 할당량 에러 시 업그레이드 링크 제공
- 에러 로그 다운로드 옵션 (디버깅 용)

---

## 4. UI 디자인 컨셉

### 4.1 컬러 시스템

**현재 문제:**
- 하드코딩된 색상: `#3BA2F8`, `#6B7280`, `#E1E5EA` 등
- Tailwind CSS 변수 미사용
- 다크모드 대응 불가

**개선된 컬러 시스템:**

```typescript
// 기존 Tailwind 변수 활용
const colors = {
  // Primary: AI 생성, CTA 버튼
  primary: "hsl(var(--primary))",          // #0F172A (거의 검정)
  primaryForeground: "hsl(var(--primary-foreground))",

  // Accent: 강조 색상 (파란색 계열로 커스터마이징 권장)
  accent: "hsl(207, 90%, 54%)",           // #3BA2F8 대체
  accentForeground: "hsl(0, 0%, 100%)",

  // Muted: 부수 정보, 플레이스홀더
  muted: "hsl(var(--muted))",             // #F1F5F9
  mutedForeground: "hsl(var(--muted-foreground))", // #64748B

  // Border
  border: "hsl(var(--border))",           // #E2E8F0

  // Success (생성 완료)
  success: "hsl(142, 76%, 36%)",          // #16A34A
  successForeground: "hsl(142, 76%, 96%)",

  // Destructive (에러)
  destructive: "hsl(var(--destructive))", // #EF4444
  destructiveForeground: "hsl(var(--destructive-foreground))",
};
```

**권장 사항:**
- `globals.css`에 accent 색상 추가:
  ```css
  :root {
    --accent-blue: 207 90% 54%; /* #3BA2F8 */
    --accent-blue-foreground: 0 0% 100%;
  }
  ```
- 모든 하드코딩 색상을 Tailwind 클래스로 교체

### 4.2 타이포그래피

**현재 문제:**
- 일관성 없는 폰트 크기
- 행간 조정 부재
- 제목 계층 구조 불명확

**개선된 타이포그래피 스케일:**

```typescript
const typography = {
  // Hero Title (Form Mode)
  h1: {
    fontSize: "clamp(2.5rem, 5vw, 4rem)",  // 40px-64px
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },

  // Section Title (Complete Mode)
  h2: {
    fontSize: "clamp(2rem, 4vw, 3rem)",    // 32px-48px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  },

  // Article Title (Preview)
  "article-title": {
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)", // 28px-40px
    fontWeight: 600,
    lineHeight: 1.3,
  },

  // Body Large (Subtitle)
  "body-lg": {
    fontSize: "1.25rem",                    // 20px
    fontWeight: 400,
    lineHeight: 1.6,
  },

  // Body (본문)
  body: {
    fontSize: "1rem",                       // 16px
    fontWeight: 400,
    lineHeight: 1.7,
  },

  // Body Small (메타 정보)
  "body-sm": {
    fontSize: "0.875rem",                   // 14px
    fontWeight: 400,
    lineHeight: 1.5,
  },
};
```

**Tailwind 클래스 매핑:**
```tsx
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
  AI가 당신의 글을 작성합니다
</h1>

<p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
  주제만 입력하면 SEO 최적화된 전문 블로그 글이 완성됩니다
</p>

<h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
  {parsed.title}
</h2>

<p className="text-base leading-7">
  {parsed.content}
</p>
```

### 4.3 간격 시스템

**현재 문제:**
- 일관성 없는 간격 (px-4, py-8 등 혼재)
- 섹션 간 간격이 좁음
- 호흡감 부족

**개선된 간격 시스템:**

```typescript
const spacing = {
  // Component Padding
  componentPadding: {
    xs: "0.75rem",    // 12px - 작은 카드
    sm: "1rem",       // 16px - 일반 카드
    md: "1.5rem",     // 24px - 큰 카드
    lg: "2rem",       // 32px - 섹션
    xl: "3rem",       // 48px - 메인 섹션
  },

  // Section Spacing
  sectionGap: {
    sm: "2rem",       // 32px - 관련 요소
    md: "3rem",       // 48px - 섹션 내부
    lg: "4rem",       // 64px - 섹션 간
    xl: "6rem",       // 96px - 메인 섹션 간
  },

  // Component Gap
  componentGap: {
    xs: "0.5rem",     // 8px - 인라인 요소
    sm: "0.75rem",    // 12px - 버튼 그룹
    md: "1rem",       // 16px - 폼 필드
    lg: "1.5rem",     // 24px - 카드 그리드
  },
};
```

**적용 예시:**
```tsx
// Form Mode
<div className="space-y-12">  {/* 섹션 간격: lg */}
  <div className="space-y-6">  {/* 헤더 내부 간격: md */}
    <h1>...</h1>
    <p>...</p>
  </div>
  <form className="space-y-4"> {/* 폼 필드 간격: md */}
    <Textarea />
    <div className="flex gap-3"> {/* 버튼 간격: sm */}
      <Button />
      <Button />
    </div>
  </form>
</div>

// Complete Mode
<div className="space-y-16">  {/* 메인 섹션 간격: xl */}
  <div className="space-y-8">  {/* 프리뷰 내부 간격: md */}
    <h2>...</h2>
    <div className="prose">...</div>
  </div>
  <div className="flex gap-4">  {/* 액션 버튼 간격: lg */}
    <Button />
    <Button />
  </div>
</div>
```

### 4.4 카드 스타일

**현재 문제:**
- 단순한 border만 사용
- 그림자 효과 부재
- 호버 상태 없음

**개선된 카드 스타일:**

```typescript
const cardStyles = {
  // Default Card
  default: {
    className: "rounded-xl border bg-card text-card-foreground shadow-sm",
    style: {
      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    },
  },

  // Elevated Card (호버 시)
  elevated: {
    className: "rounded-xl border bg-card text-card-foreground shadow-md transition-shadow hover:shadow-lg",
    style: {
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    },
  },

  // Interactive Card (클릭 가능)
  interactive: {
    className: "rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-accent cursor-pointer",
  },

  // Metadata Card (메타데이터 표시용)
  metadata: {
    className: "rounded-lg border border-border/50 bg-muted/30 p-4",
  },
};
```

**적용 예시:**
```tsx
// Generating Mode - Metadata Cards
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Card className="rounded-lg border border-border/50 bg-muted/30">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">제목</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-base font-semibold">
        {generatingParsed.title || "생성 중..."}
      </p>
    </CardContent>
  </Card>

  <Card className="rounded-lg border border-border/50 bg-muted/30">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">키워드</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2">
        {generatingParsed.keywords?.slice(0, 5).map(k => (
          <Badge key={k} variant="secondary">{k}</Badge>
        ))}
      </div>
    </CardContent>
  </Card>
</div>

// Complete Mode - Main Preview Card
<Card className="rounded-xl border bg-card shadow-sm">
  <CardContent className="p-8">
    <article className="prose prose-lg prose-neutral max-w-none">
      <ReactMarkdown>{parsed.content}</ReactMarkdown>
    </article>
  </CardContent>
</Card>
```

### 4.5 다크모드 고려사항

**현재 문제:**
- 다크모드 전혀 고려되지 않음
- 하드코딩된 색상으로 인해 다크모드 적용 불가

**개선 방안:**

```tsx
// 모든 색상을 Tailwind 변수로 교체
// ❌ Before
<div style={{ backgroundColor: "#3BA2F8", color: "#6B7280" }}>

// ✅ After
<div className="bg-accent text-muted-foreground">

// 다크모드 대응 스타일
<div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
  <Card className="border-gray-200 dark:border-gray-800">
    <h2 className="text-gray-900 dark:text-gray-100">제목</h2>
    <p className="text-gray-600 dark:text-gray-400">내용</p>
  </Card>
</div>

// 그림자도 다크모드 대응
<Card className="shadow-sm dark:shadow-none dark:border-gray-800">
```

**globals.css에 추가:**
```css
.dark {
  --accent-blue: 207 90% 64%; /* 다크모드에서 더 밝은 파란색 */
  --accent-blue-foreground: 240 10% 3.9%;
}
```

---

## 5. 섹션별 컴포넌트 명세

### 5.1 Form Section (기존 GenerationForm 개선)

#### NewArticleHero Component
**파일:** `src/features/articles/components/new-article-hero.tsx`

**Props:**
```typescript
interface NewArticleHeroProps {
  onSubmit: (data: GenerationFormData) => Promise<void>;
  styleGuides: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}
```

**하위 컴포넌트:**
- `HeroHeader`: 제목 + 부제목
- `GenerationInput`: 텍스트에리어 + 내부 컨트롤
- `StyleGuideSelector`: 드롭다운 선택기
- `GenerateButton`: CTA 버튼

**구조:**
```tsx
<section className="flex min-h-screen items-center justify-center px-4 py-12">
  <div className="w-full max-w-4xl space-y-12">
    {/* Hero Header */}
    <HeroHeader />

    {/* Generation Form */}
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <GenerationInput
          placeholder="예: React 19의 새로운 기능과 활용 방법"
          styleGuideSelector={<StyleGuideSelector />}
          generateButton={<GenerateButton />}
        />
      </form>
    </Form>

    {/* Optional: Quick Tips */}
    <QuickTips />
  </div>
</section>
```

### 5.2 Generation Progress Section

#### GenerationProgressWrapper Component
**파일:** `src/features/articles/components/generation-progress-wrapper.tsx`

**Props:**
```typescript
interface GenerationProgressWrapperProps {
  isGenerating: boolean;
  error: Error | null;
  streamingData: {
    title?: string;
    metaDescription?: string;
    keywords?: string[];
    headings?: string[];
    content: string;
  };
  onCancel: () => void;
  onRetry: () => void;
}
```

**하위 컴포넌트:**
- `GenerationProgress`: 기존 컴포넌트 재사용
- `StreamingPreview`: 실시간 프리뷰 카드
- `MetadataCards`: 메타데이터 카드 그리드

**구조:**
```tsx
<section className="container mx-auto max-w-6xl px-4 py-12">
  <div className="space-y-8">
    {/* Progress Indicator */}
    <GenerationProgress
      isGenerating={isGenerating}
      error={error}
      onCancel={onCancel}
      onRetry={onRetry}
    />

    {/* Real-time Preview */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Preview */}
      <div className="lg:col-span-2">
        <StreamingPreview content={streamingData.content} />
      </div>

      {/* Metadata Sidebar */}
      <div className="space-y-4">
        <MetadataCards data={streamingData} />
      </div>
    </div>
  </div>
</section>
```

#### MetadataCard Component
**파일:** `src/features/articles/components/metadata-card.tsx`

**Props:**
```typescript
interface MetadataCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | string[] | React.ReactNode;
  isLoading?: boolean;
}
```

**예시:**
```tsx
<MetadataCard
  icon={FileText}
  label="제목"
  value={title || "생성 중..."}
  isLoading={!title}
/>

<MetadataCard
  icon={Hash}
  label="키워드"
  value={
    <div className="flex flex-wrap gap-2">
      {keywords?.map(k => <Badge key={k}>{k}</Badge>)}
    </div>
  }
  isLoading={!keywords?.length}
/>
```

### 5.3 Complete Section

#### ArticlePreview Component
**파일:** `src/features/articles/components/article-preview-full.tsx`

**Props:**
```typescript
interface ArticlePreviewFullProps {
  article: {
    title: string;
    metaDescription?: string;
    keywords?: string[];
    content: string;
  };
  onSave: () => Promise<void>;
  onRegenerate: () => void;
  onEdit: () => void;
}
```

**하위 컴포넌트:**
- `SuccessHeader`: 성공 메시지
- `PreviewContent`: 본문 프리뷰
- `MetadataSidebar`: 메타데이터 요약
- `ActionButtons`: 저장/재생성/편집 버튼

**구조:**
```tsx
<section className="container mx-auto max-w-7xl px-4 py-12">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    {/* Success Header */}
    <SuccessHeader />

    {/* Main Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Content Preview */}
      <div className="lg:col-span-2">
        <PreviewContent article={article} />
      </div>

      {/* Metadata Sidebar */}
      <div className="space-y-6">
        <MetadataSidebar article={article} />
        <ActionButtons
          onSave={onSave}
          onRegenerate={onRegenerate}
          onEdit={onEdit}
        />
      </div>
    </div>
  </motion.div>
</section>
```

#### SuccessHeader Component
**Props:**
```typescript
interface SuccessHeaderProps {
  timeElapsed?: number; // seconds
}
```

**구조:**
```tsx
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  className="text-center space-y-4"
>
  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10">
    <CheckCircle2 className="w-8 h-8 text-success" />
  </div>
  <div>
    <h2 className="text-3xl font-bold">글 생성 완료!</h2>
    {timeElapsed && (
      <p className="text-muted-foreground mt-2">
        {timeElapsed}초 만에 완성되었습니다
      </p>
    )}
  </div>
</motion.div>
```

#### PreviewContent Component
**Props:**
```typescript
interface PreviewContentProps {
  article: {
    title: string;
    metaDescription?: string;
    content: string;
  };
}
```

**구조:**
```tsx
<Card className="rounded-xl border bg-card shadow-sm">
  <CardContent className="p-8 md:p-12">
    <article className="space-y-6">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
        {article.title}
      </h1>

      {/* Meta Description */}
      {article.metaDescription && (
        <p className="text-xl text-muted-foreground leading-relaxed">
          {article.metaDescription}
        </p>
      )}

      {/* Divider */}
      <Separator />

      {/* Content */}
      <div className="prose prose-lg prose-neutral max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </div>
    </article>
  </CardContent>
</Card>
```

#### MetadataSidebar Component
**Props:**
```typescript
interface MetadataSidebarProps {
  article: {
    keywords?: string[];
    content: string;
  };
}
```

**구조:**
```tsx
<div className="space-y-6">
  {/* Keywords */}
  <Card className="rounded-lg border">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        <Hash className="w-4 h-4" />
        키워드
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2">
        {article.keywords?.map(keyword => (
          <Badge key={keyword} variant="secondary">
            {keyword}
          </Badge>
        ))}
      </div>
    </CardContent>
  </Card>

  {/* Statistics */}
  <Card className="rounded-lg border">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        <BarChart className="w-4 h-4" />
        통계
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">글자 수</span>
        <span className="font-medium">
          {article.content.length.toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">예상 읽기 시간</span>
        <span className="font-medium">
          {Math.ceil(article.content.length / 1000)} 분
        </span>
      </div>
    </CardContent>
  </Card>
</div>
```

#### ActionButtons Component
**Props:**
```typescript
interface ActionButtonsProps {
  onSave: () => Promise<void>;
  onRegenerate: () => void;
  onEdit: () => void;
  isSaving?: boolean;
}
```

**구조:**
```tsx
<div className="space-y-3">
  {/* Primary Action */}
  <Button
    onClick={onSave}
    disabled={isSaving}
    className="w-full h-12 text-base bg-accent hover:bg-accent/90"
  >
    {isSaving ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        저장 중...
      </>
    ) : (
      <>
        <Save className="mr-2 h-4 w-4" />
        초안으로 저장
      </>
    )}
  </Button>

  {/* Secondary Actions */}
  <div className="grid grid-cols-2 gap-3">
    <Button
      onClick={onRegenerate}
      variant="outline"
      className="h-10"
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      다시 생성
    </Button>
    <Button
      onClick={onEdit}
      variant="outline"
      className="h-10"
    >
      <Edit className="mr-2 h-4 w-4" />
      편집하기
    </Button>
  </div>
</div>
```

---

## 6. 애니메이션 명세 (framer-motion)

### 6.1 Form Section Animations

#### HeroHeader Animation
```typescript
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Custom easing
    },
  },
};

// Usage
<motion.div
  variants={headerVariants}
  initial="hidden"
  animate="visible"
>
  <h1>AI가 당신의 글을 작성합니다</h1>
  <p>주제만 입력하면...</p>
</motion.div>
```

#### Input Area Animation
```typescript
const inputVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Hover effect
const textareaVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.005,
    transition: { duration: 0.2 }
  },
  focus: {
    scale: 1.01,
    transition: { duration: 0.2 }
  },
};

// Usage
<motion.div
  variants={inputVariants}
  initial="hidden"
  animate="visible"
  whileHover="hover"
  whileTap="focus"
>
  <Textarea />
</motion.div>
```

#### Button Animation
```typescript
const buttonVariants = {
  idle: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  },
};

// Sparkles icon animation
const sparklesVariants = {
  idle: { rotate: 0 },
  hover: {
    rotate: [0, -10, 10, -10, 0],
    transition: { duration: 0.5 }
  },
};

// Usage
<motion.div
  variants={buttonVariants}
  initial="idle"
  whileHover="hover"
  whileTap="tap"
>
  <Button>
    <motion.div variants={sparklesVariants}>
      <Sparkles />
    </motion.div>
    생성하기
  </Button>
</motion.div>
```

### 6.2 Generation Progress Animations

#### Container Animation (모드 전환)
```typescript
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  },
};

// Usage with AnimatePresence
<AnimatePresence mode="wait">
  {mode === "generating" && (
    <motion.div
      key="generating"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <GenerationProgress />
    </motion.div>
  )}
</AnimatePresence>
```

#### Progress Bar Animation
```typescript
// Smooth progress transition
const progressVariants = {
  initial: { width: "0%" },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

// Usage
<motion.div
  className="h-2 bg-accent rounded-full"
  variants={progressVariants}
  initial="initial"
  animate="animate"
  custom={progress}
/>
```

#### Metadata Card Stagger
```typescript
const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Usage
<motion.div
  variants={cardContainerVariants}
  initial="hidden"
  animate="visible"
  className="grid grid-cols-2 gap-4"
>
  {metadataItems.map(item => (
    <motion.div key={item.label} variants={cardItemVariants}>
      <MetadataCard {...item} />
    </motion.div>
  ))}
</motion.div>
```

#### Streaming Content Animation
```typescript
// Typing effect simulation
const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

// Cursor blink
const cursorVariants = {
  blink: {
    opacity: [1, 0, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Usage
<motion.div
  variants={contentVariants}
  initial="hidden"
  animate="visible"
>
  <ReactMarkdown>{content}</ReactMarkdown>
  {isStreaming && (
    <motion.span
      variants={cursorVariants}
      animate="blink"
      className="inline-block w-0.5 h-5 bg-accent ml-1"
    />
  )}
</motion.div>
```

### 6.3 Complete Section Animations

#### Success Animation
```typescript
// Success icon entrance
const successIconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

// Confetti effect (선택사항)
const confettiVariants = {
  hidden: { opacity: 0, y: 0 },
  visible: {
    opacity: [0, 1, 0],
    y: [-20, -100],
    transition: {
      duration: 1.5,
      ease: "easeOut",
    },
  },
};

// Usage
<motion.div
  variants={successIconVariants}
  initial="hidden"
  animate="visible"
>
  <CheckCircle2 className="w-8 h-8 text-success" />
</motion.div>
```

#### Content Fade-in
```typescript
const previewVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Usage
<motion.div
  variants={previewVariants}
  initial="hidden"
  animate="visible"
>
  <PreviewContent />
</motion.div>
```

#### Sidebar Slide-in
```typescript
const sidebarVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Card stagger within sidebar
const sidebarCardVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.5 + i * 0.1,
      duration: 0.4,
    },
  }),
};

// Usage
<motion.div
  variants={sidebarVariants}
  initial="hidden"
  animate="visible"
>
  {sidebarCards.map((card, i) => (
    <motion.div
      key={card.id}
      custom={i}
      variants={sidebarCardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>{card.content}</Card>
    </motion.div>
  ))}
</motion.div>
```

#### Button Hover Effects
```typescript
const saveButtonVariants = {
  idle: { scale: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  hover: {
    scale: 1.02,
    boxShadow: "0 4px 12px rgba(59,162,248,0.3)",
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

// Icon animation on hover
const iconVariants = {
  idle: { x: 0 },
  hover: {
    x: [0, -2, 2, 0],
    transition: { duration: 0.4 }
  },
};

// Usage
<motion.div
  variants={saveButtonVariants}
  initial="idle"
  whileHover="hover"
  whileTap="tap"
>
  <Button>
    <motion.div variants={iconVariants}>
      <Save className="mr-2 h-4 w-4" />
    </motion.div>
    초안으로 저장
  </Button>
</motion.div>
```

### 6.4 성능 고려사항

#### will-change 사용
```tsx
// 애니메이션이 많은 요소에 적용
<motion.div
  style={{ willChange: "transform, opacity" }}
  animate={{ ... }}
>
```

#### layoutId 사용 (Shared Layout Animation)
```tsx
// Form Mode의 입력창이 Generating Mode로 변환될 때
<AnimatePresence mode="wait">
  {mode === "form" && (
    <motion.div layoutId="main-content">
      <Textarea />
    </motion.div>
  )}
  {mode === "generating" && (
    <motion.div layoutId="main-content">
      <GenerationProgress />
    </motion.div>
  )}
</AnimatePresence>
```

#### 애니메이션 축소 설정 (접근성)
```tsx
// prefers-reduced-motion 사용자 고려
const shouldReduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const variants = {
  hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: shouldReduceMotion ? 0 : 0.5,
    },
  },
};
```

---

## 7. 구현 우선순위

### 🔴 **Phase 1: Critical Fixes (즉시 개선 필요)**

1. **GenerationProgress 컴포넌트 활용**
   - 현재 Generating 모드의 Table UI를 GenerationProgress로 교체
   - 진행률, 시간 표시, 스켈레톤 UI 적용
   - **영향:** 사용자 경험 대폭 개선, 전문성 향상
   - **소요 시간:** 2-3시간

2. **디자인 시스템 통일**
   - 하드코딩 색상을 Tailwind 변수로 전환
   - `globals.css`에 accent-blue 추가
   - 인라인 스타일 제거, 클래스 기반으로 전환
   - **영향:** 유지보수성 향상, 다크모드 대응 가능
   - **소요 시간:** 3-4시간

3. **레이아웃 일관성 확보**
   - 모든 모드에서 동일한 컨테이너 max-width (max-w-6xl) 사용
   - 중앙 정렬 일관성 유지
   - **영향:** 레이아웃 점프 제거, 시각적 안정감
   - **소요 시간:** 1-2시간

### 🟡 **Phase 2: UX Enhancements (1주 내)**

4. **framer-motion 애니메이션 적용**
   - 모드 전환 시 fade-in/out
   - Form 진입 애니메이션
   - Complete 성공 애니메이션
   - **영향:** 부드러운 사용자 경험, 프리미엄 느낌
   - **소요 시간:** 4-6시간

5. **Metadata Cards 구현**
   - Table을 Card 기반 UI로 교체
   - 아이콘 + 레이블 추가
   - 키워드를 Badge로 시각화
   - **영향:** 가독성 향상, 정보 계층 명확화
   - **소요 시간:** 3-4시간

6. **Complete Mode 개선**
   - 2단 레이아웃 (본문 + 사이드바)
   - 메타데이터 사이드바 추가
   - 통계 정보 표시 (글자 수, 읽기 시간)
   - **영향:** 정보 전달력 향상, 전문성 강화
   - **소요 시간:** 4-5시간

7. **에러 처리 개선**
   - 재시도 버튼 추가
   - 에러 타입별 명확한 메시지
   - 복구 가능한 에러는 자동 재시도
   - **영향:** 사용자 좌절감 감소, 성공률 향상
   - **소요 시간:** 2-3시간

### 🟢 **Phase 3: Advanced Features (2-3주 내)**

8. **Hero Section 강화**
   - 헤더 추가 (제목 + 부제목)
   - Quick Tips 섹션
   - 플레이스홀더 개선 (구체적인 예시)
   - **영향:** 신규 사용자 온보딩 개선
   - **소요 시간:** 3-4시간

9. **모바일 최적화**
   - 반응형 레이아웃 개선
   - 터치 영역 확대
   - 모바일 전용 UI 조정
   - **영향:** 모바일 사용자 경험 개선
   - **소요 시간:** 4-6시간

10. **접근성 개선**
    - ARIA 레이블 추가
    - 스크린 리더 지원
    - 키보드 네비게이션 개선
    - prefers-reduced-motion 대응
    - **영향:** 접근성 향상, WCAG 준수
    - **소요 시간:** 3-4시간

11. **다크모드 지원**
    - 모든 컴포넌트 다크모드 스타일 적용
    - 테마 전환 애니메이션
    - **영향:** 사용자 선택권 확대
    - **소요 시간:** 4-5시간

12. **추가 기능**
    - 생성 중 일시정지/재개
    - 여러 버전 생성 (A/B 테스트)
    - 템플릿 선택
    - **영향:** 고급 사용자 만족도 향상
    - **소요 시간:** 8-10시간

---

## 8. 성공 지표

### ✅ **Technical Excellence**
- [ ] claude.ai 수준의 세련된 UI/UX
- [ ] 일관된 디자인 시스템 (하드코딩 0%)
- [ ] 부드러운 애니메이션 (모든 모드 전환)
- [ ] 반응형 디자인 (모바일, 태블릿, 데스크톱)
- [ ] 접근성 준수 (WCAG AA 이상)
- [ ] 다크모드 완벽 지원

### ✅ **User Experience**
- [ ] 명확한 진행 상황 표시
- [ ] 예상 소요 시간 안내
- [ ] 실시간 피드백 (스트리밍)
- [ ] 에러 발생 시 명확한 안내 + 복구 옵션
- [ ] 취소/재시도 기능
- [ ] 생성 완료 후 다양한 액션 옵션

### ✅ **Performance**
- [ ] 페이지 로드 < 1초
- [ ] 애니메이션 60fps 유지
- [ ] 메모리 누수 없음
- [ ] 모바일 네트워크에서도 원활한 스트리밍

### ✅ **Code Quality**
- [ ] 컴포넌트 재사용성 높음
- [ ] Props 인터페이스 명확
- [ ] 타입 안정성 100%
- [ ] 테스트 커버리지 > 80%
- [ ] 문서화 완료

---

## 9. 추가 제안

### 9.1 Advanced AI Features

**Multi-turn Generation**
- 생성 후 "더 자세히", "더 간단하게", "톤 변경" 등 즉각 수정 요청
- claude.ai의 대화형 인터페이스 차용

**Version History**
- 생성된 여러 버전을 저장하고 비교
- 이전 버전으로 롤백

**Template Library**
- 업계별, 목적별 템플릿 제공
- "기술 블로그", "마케팅 글", "튜토리얼" 등

### 9.2 Collaboration Features

**Real-time Collaboration**
- 여러 사용자가 동시에 글 편집
- 댓글 및 제안 기능

**Share Preview**
- 생성된 글을 링크로 공유
- 피드백 수집

### 9.3 Analytics Integration

**Generation Analytics**
- 생성 성공률, 평균 소요 시간
- 인기 키워드, 주제 트렌드

**SEO Scoring**
- 생성된 글의 SEO 점수 실시간 표시
- 개선 제안

### 9.4 Export Options

**다양한 포맷 지원**
- Markdown, HTML, PDF, DOCX
- 블로그 플랫폼 직접 발행 (Medium, WordPress 등)

---

## 10. 결론

**현재 New Article 페이지의 가장 큰 문제:**
1. 잘 만들어진 `GenerationProgress` 컴포넌트를 사용하지 않음
2. 디자인 시스템이 통일되지 않음 (하드코딩 색상, 인라인 스타일)
3. 애니메이션 부재로 기계적인 느낌
4. 레이아웃 일관성 부족 (모드별로 다른 정렬)

**개선 후 기대 효과:**
- ✨ claude.ai 수준의 전문적이고 세련된 UI/UX
- 🎯 명확한 진행 상황 표시로 사용자 불안감 해소
- 🚀 부드러운 애니메이션으로 프리미엄 경험 제공
- ♿ 접근성 개선으로 모든 사용자 포용
- 🌙 다크모드 지원으로 사용자 선택권 확대
- 📱 완벽한 반응형 디자인으로 모든 기기 지원

**첫 번째 단계 (Phase 1)만 완료해도:**
- 사용자 경험이 **즉각적으로** 개선됨
- 유지보수성이 크게 향상됨
- 향후 기능 추가가 훨씬 쉬워짐

**권장 사항:**
1. Phase 1을 **최우선**으로 진행 (1-2일 소요)
2. Phase 2를 1주 내에 완료 (사용자 피드백 수집)
3. Phase 3는 우선순위에 따라 선택적 진행

이 개선안을 통해 New Article 페이지가 단순한 "글 생성 도구"에서 **사용자가 신뢰하고 즐겨 사용하는 전문 AI 라이팅 플랫폼**으로 발전할 것입니다.
