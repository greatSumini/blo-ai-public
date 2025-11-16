# 페이지 개선안 검토 및 개선

## 1. 원안 요약

0번 단계에서 제안된 New Article 페이지 개선안은 다음과 같습니다:

### 주요 제안 사항
- **GenerationProgress 컴포넌트 활용**: 현재 미사용 중인 컴포넌트를 Generating 모드에 통합
- **디자인 시스템 통일**: 하드코딩된 색상을 Tailwind CSS 변수로 전환
- **레이아웃 일관성**: 모든 모드에서 동일한 컨테이너 max-width 사용
- **framer-motion 애니메이션**: 모드 전환, 진입, 성공 등 모든 단계에 애니메이션 적용
- **Metadata Cards 구현**: Table 기반 UI를 Card 기반으로 전환
- **Complete Mode 개선**: 2단 레이아웃 (본문 + 메타데이터 사이드바)
- **Hero Section 강화**: 제목, 부제목, Quick Tips 추가
- **접근성 및 다크모드**: ARIA 레이블, prefers-reduced-motion, 다크모드 지원

### 구현 우선순위 (3단계)
- Phase 1 (Critical): GenerationProgress, 디자인 시스템, 레이아웃
- Phase 2 (UX): 애니메이션, Metadata Cards, Complete Mode 개선
- Phase 3 (Advanced): Hero 강화, 모바일 최적화, 접근성, 다크모드

---

## 2. 비판적 검토

### 2.1 사용자 경험 (UX)

#### 문제점

**1. 과도한 Hero Section 제안**
- 원안에서 제안한 Hero Section ("AI가 당신의 글을 작성합니다")은 랜딩 페이지 스타일에 가까움
- New Article 페이지는 사용자가 **이미 글 작성 의도를 가지고 진입**한 상태
- 큰 헤더와 설명 문구는 오히려 실제 작업(글 생성)을 방해할 수 있음
- claude.ai도 대화 페이지에서는 큰 Hero를 사용하지 않음 (단순하고 집중된 입력창만 제공)

**2. 2단 레이아웃의 모바일 문제**
- Complete Mode에서 제안된 2단 레이아웃(본문 + 사이드바)은 데스크톱에서는 좋으나, 모바일에서는 사이드바가 하단으로 밀려남
- 사용자가 글을 확인하려면 긴 스크롤이 필요하여 메타데이터와 본문을 함께 보기 어려움
- 모바일 우선 시대에 데스크톱 중심 레이아웃은 재고 필요

**3. Quick Tips의 모호한 가치**
- 원안에서 제안한 "Quick Tips" 섹션은 구체적인 내용이 없음
- 사용자가 이미 스타일 가이드를 선택할 수 있는데, 추가 팁이 필요한지 의문
- 화면 공간을 차지하며 핵심 작업(주제 입력)을 방해할 가능성

**4. 진행률 표시의 정확성 문제**
- AI 생성은 본질적으로 **예측 불가능한 스트리밍** 작업
- "50% 완료", "예상 남은 시간: 30초" 같은 진행률은 잘못된 기대를 심어줄 수 있음
- claude.ai도 진행률 바 대신 "생성 중..." 상태만 표시

#### 개선안

**1. 집중된 입력 영역 유지**
- Hero Section 대신 **간결한 폼 중심** 유지
- 제목은 "새 글 작성" 정도로 단순화
- 부제목 제거, 플레이스홀더에 예시 포함
- claude.ai의 단순함을 차용: 입력창이 주인공

**2. 모바일 우선 레이아웃**
- Complete Mode는 **단일 컬럼** 기본, 데스크톱에서만 선택적으로 사이드바
- 메타데이터를 상단에 컴팩트하게 배치 (Collapsible Card)
- 본문 프리뷰를 메인으로 강조

**3. Quick Tips 제거 또는 최소화**
- 첫 방문 사용자에게만 표시되는 Tooltip 방식으로 대체
- 또는 완전히 제거하고 플레이스홀더 개선에 집중

**4. 상태 중심 피드백**
- 진행률 바 대신 **현재 생성 중인 부분** 표시 ("제목 생성 중...", "본문 작성 중...")
- 예상 시간 제거, 스트리밍 중임을 명확히 표시
- GenerationProgress 컴포넌트의 진행률 기능은 선택적으로 사용

---

### 2.2 메시징 전략

#### 문제점

**1. 과도한 마케팅 톤**
- "AI가 당신의 글을 작성합니다"는 랜딩 페이지에 적합한 마케팅 문구
- 이미 서비스를 사용 중인 사용자에게는 불필요한 설득
- 작업 도구(Tool)보다 마케팅 페이지(Landing)처럼 느껴짐

**2. 성공 메시지의 과장**
- "글 생성 완료!" + Confetti 애니메이션은 지나치게 축하하는 느낌
- 사용자는 글 생성이 **시작**일 뿐, 편집과 발행이 남았음을 인식
- 과도한 축하는 오히려 부담감을 줄 수 있음

**3. 버튼 레이블의 불명확성**
- "초안으로 저장" vs "편집하기" vs "다시 생성"의 우선순위가 불명확
- 사용자가 다음 액션을 선택하는 데 인지 부하 발생

#### 개선안

**1. 작업 중심 메시징**
- 제목: "새 글 작성" (명확하고 직접적)
- 부제목 제거, 필요 시 폼 상단에 단순 설명 ("주제를 입력하면 AI가 초안을 작성합니다")

**2. 절제된 성공 표현**
- "생성 완료" 대신 "초안이 준비되었습니다"
- Confetti 제거, 단순한 체크 아이콘만 사용
- 소요 시간도 선택적으로만 표시 (사용자가 신경 쓸 필요 없음)

**3. 명확한 Primary CTA**
- Primary: "초안 편집하기" (다음 단계로 자연스럽게 유도)
- Secondary: "다시 생성" (덜 강조)
- Tertiary: "나중에 저장" (최소 강조)
- 저장은 자동으로 처리하고, 사용자는 "편집" 또는 "다시 생성" 중 선택

---

### 2.3 시각적 디자인

#### 문제점

**1. 컬러 시스템의 불일치**
- 원안에서 제안한 `accent-blue (#3BA2F8)`는 현재 코드베이스에 없는 새 색상
- 기존 primary/accent와 충돌 가능성
- `globals.css`에 새 변수를 추가하는 것은 좋으나, 기존 시스템과의 통합 계획 부족

**2. 타이포그래피 스케일의 과도함**
- Hero 제목: `clamp(2.5rem, 5vw, 4rem)` (40px-64px)는 지나치게 큼
- New Article 페이지는 작업 페이지이므로 랜딩 페이지 수준의 큰 타이포그래피 불필요
- claude.ai도 대화 페이지에서는 큰 타이틀을 사용하지 않음

**3. 카드 스타일의 복잡성**
- 4가지 카드 스타일 (default, elevated, interactive, metadata)은 과도하게 세분화됨
- New Article 페이지에서 모두 사용할 필요 없음
- 디자인 시스템 복잡도 증가

**4. 다크모드 고려사항의 실현 가능성**
- 다크모드는 Phase 3 (2-3주 내)로 제안되었으나, 실제로는 **전체 앱의 다크모드 전략**이 필요
- New Article 페이지만 다크모드 지원은 일관성 해침
- 우선순위가 낮아야 함

#### 개선안

**1. 기존 Tailwind 변수 최대 활용**
- 새 색상 추가 대신 기존 `primary`, `accent`, `muted` 재활용
- 필요 시 `accent` 색상만 조정하여 파란색 계열로 변경
- `globals.css` 수정 최소화

**2. 절제된 타이포그래피**
- 페이지 제목: `text-2xl md:text-3xl` (24px-30px) 정도로 충분
- 생성된 글 제목: `text-3xl md:text-4xl` (30px-36px)
- 본문: 기본 prose 스타일 유지

**3. 단순한 카드 스타일**
- 2가지만 사용: `default` (정적 정보), `interactive` (클릭 가능)
- shadcn-ui의 기본 Card 컴포넌트 스타일 그대로 활용
- 커스터마이징 최소화

**4. 다크모드 우선순위 하향**
- Phase 3에서도 제외, 별도 이슈로 관리
- 먼저 라이트 모드를 완벽하게 구현
- 다크모드는 전체 앱 차원에서 접근

---

### 2.4 기술적 실현 가능성

#### 문제점

**1. framer-motion의 과도한 사용**
- 원안에서 제안한 애니메이션 variants가 너무 많음 (15개 이상)
- 각 섹션, 컴포넌트마다 복잡한 애니메이션 정의
- 코드 복잡도 증가, 유지보수 어려움
- 성능 문제 가능성 (특히 모바일)

**2. 컴포넌트 분리의 과도한 세분화**
- 원안에서 제안한 컴포넌트 구조:
  - `NewArticleHero` → `HeroHeader`, `GenerationInput`, `StyleGuideSelector`, `GenerateButton`
  - `GenerationProgressWrapper` → `GenerationProgress`, `StreamingPreview`, `MetadataCards`
  - `ArticlePreview` → `SuccessHeader`, `PreviewContent`, `MetadataSidebar`, `ActionButtons`
- 총 **12개의 새 컴포넌트**는 작은 페이지에 비해 과도함
- 재사용성이 낮은 컴포넌트도 포함 (예: `HeroHeader`는 이 페이지에서만 사용)

**3. GenerationProgress 컴포넌트의 제약**
- 원안은 기존 `GenerationProgress` 컴포넌트를 재사용하자고 제안
- 하지만 해당 컴포넌트의 실제 구현을 확인하지 않음
- Props 인터페이스가 원안의 요구사항과 맞지 않을 가능성

**4. Streaming Preview의 구현 복잡도**
- AI 스트리밍 데이터를 ReactMarkdown으로 실시간 렌더링하는 것은 생각보다 복잡
- 마크다운 파싱 중 깨진 구문으로 인한 렌더링 오류 가능성
- 커서 애니메이션(blink)과 마크다운 렌더링의 동기화 어려움

**5. layoutId 사용의 위험성**
- 원안에서 제안한 `layoutId="main-content"` 기반 Shared Layout Animation
- Form 모드의 Textarea와 Generating 모드의 전체 영역은 구조가 완전히 다름
- 부자연스러운 애니메이션이 될 가능성 높음

#### 개선안

**1. 애니메이션 최소화 및 단순화**
- 3가지 기본 애니메이션만 사용:
  - `fadeIn`: 섹션 진입 시
  - `slideIn`: 사이드바, 카드 등
  - `success`: Complete 모드 체크 아이콘
- 복잡한 variants 대신 간단한 `initial`, `animate` props 사용
- 성능 우선, 화려함보다 부드러움 중시

**2. 컴포넌트 구조 단순화**
- 페이지 레벨: `page.tsx` (기존 유지)
- 섹션 컴포넌트 (3개):
  - `GenerationForm` (기존 개선)
  - `GenerationProgressSection` (새로 생성, GenerationProgress + Preview 통합)
  - `ArticlePreviewSection` (새로 생성)
- 공통 컴포넌트 (2개):
  - `MetadataCard` (재사용 가능)
  - `ActionButtons` (재사용 가능)
- 총 **5개 컴포넌트**로 축소

**3. GenerationProgress 컴포넌트 확인 후 활용**
- 먼저 기존 컴포넌트의 실제 구현 확인 필요
- Props 인터페이스가 맞지 않으면 래퍼 컴포넌트 생성
- 또는 필요한 부분만 차용하여 새로 구현

**4. Streaming Preview 단순화**
- ReactMarkdown을 실시간으로 렌더링하지 않음
- 생성 중에는 **plain text**로만 표시 (스크롤 가능한 텍스트에리어)
- 완료 후에만 마크다운 렌더링
- 커서 애니메이션은 텍스트 끝에 단순한 깜빡임만 추가

**5. layoutId 제거**
- Shared Layout Animation 사용하지 않음
- 단순한 fade-out/fade-in으로 모드 전환
- 부드럽고 예측 가능한 애니메이션 우선

---

### 2.5 claude.ai 벤치마킹

#### 문제점

**1. claude.ai 패턴의 오해**
- 원안은 claude.ai의 **대화 입력창**을 참고했으나, New Article 페이지와는 컨텍스트가 다름
- claude.ai는 대화형 AI (Chat UI), New Article은 글 생성 도구 (Form-based Tool)
- 단순히 "크고 중앙에 배치"만 차용하는 것은 피상적인 모방

**2. 진행률 표시의 차이 무시**
- 원안은 claude.ai에는 없는 "진행률 바"를 추가하자고 제안
- 하지만 왜 claude.ai가 진행률 바를 사용하지 않는지 분석 부족
- AI 생성의 본질적 불확실성을 고려하지 않음

**3. 차별화 포인트의 모호함**
- 원안에서 제안한 차별화:
  - "스타일 가이드 선택 부각"
  - "키워드 입력 옵션 추가"
- 이들이 실제로 사용자에게 중요한 기능인지, 단순히 "다르기 위한 다름"인지 불명확

**4. claude.ai의 단순함 간과**
- claude.ai의 진짜 강점: **극도로 단순하고 집중된 UX**
- 불필요한 장식 없음, 입력창과 결과만 존재
- 원안은 오히려 복잡한 UI를 제안 (Hero, Quick Tips, 사이드바 등)

#### 개선안

**1. 컨텍스트에 맞는 벤치마킹**
- claude.ai 참고 대상:
  - **단순함**: 불필요한 요소 제거, 핵심 작업에 집중
  - **실시간 피드백**: 스트리밍 중 현재 생성 중인 내용 표시
  - **명확한 상태**: 생성 중/완료 상태 명확히 구분
- 차용하지 않을 것:
  - 대화형 인터페이스 (New Article은 단일 생성 도구)
  - 큰 Hero Section (작업 도구에는 불필요)

**2. 진행 상태 표시 재고**
- 진행률 바 대신 **현재 작업 표시** ("제목 생성 중", "본문 작성 중")
- 스트리밍 중인 텍스트를 실시간으로 보여주는 것으로 충분
- claude.ai처럼 "생성 중임"을 명확히, 하지만 % 단위 진행률은 피함

**3. 실질적인 차별화**
- 차별화 포인트:
  - **스타일 가이드**: 사용자의 브랜드 톤에 맞춘 글 생성
  - **SEO 최적화**: 키워드, 메타 설명 자동 생성 (claude.ai에는 없음)
  - **즉시 편집**: 생성 후 바로 편집 모드로 전환 가능
- 이들 기능을 **자연스럽게** 통합, 복잡하지 않게

**4. 단순함을 우선**
- claude.ai의 핵심 교훈: **Less is More**
- 제안하는 모든 기능에 대해 질문: "이것이 정말 필요한가?"
- 불필요한 요소는 과감히 제거

---

## 3. 개선된 최종 계획

### 3.1 페이지 구성 (수정안)

#### 구성 개요
```
NewArticlePage
├─ GenerationForm (간결한 폼, Hero 제거)
│  ├─ 주제 입력 (Textarea)
│  ├─ 스타일 가이드 선택 (Inline Select)
│  └─ 생성 버튼
├─ GenerationProgressSection (생성 중)
│  ├─ 현재 작업 표시 ("제목 생성 중...")
│  ├─ 실시간 텍스트 프리뷰 (plain text)
│  └─ 취소 버튼
└─ ArticlePreviewSection (완료)
   ├─ 간단한 완료 메시지
   ├─ 생성된 글 프리뷰 (Markdown)
   ├─ 메타데이터 (상단 Collapsible)
   └─ 액션 버튼 (편집, 다시 생성)
```

#### 모드별 상세 구성

**1. Form Mode (기본)**
```tsx
<div className="container mx-auto max-w-3xl px-4 py-12">
  <div className="space-y-6">
    {/* Simple Header */}
    <div>
      <h1 className="text-2xl md:text-3xl font-bold">새 글 작성</h1>
      <p className="text-sm text-muted-foreground mt-2">
        주제를 입력하면 AI가 초안을 작성합니다
      </p>
    </div>

    {/* Generation Form */}
    <GenerationForm />
  </div>
</div>
```

**특징:**
- Hero Section 제거, 단순한 제목만 유지
- Quick Tips 제거, 필요 시 플레이스홀더에 예시 포함
- 중앙 정렬, max-w-3xl로 읽기 편한 폭 유지

**2. Generating Mode**
```tsx
<div className="container mx-auto max-w-4xl px-4 py-12">
  <div className="space-y-6">
    {/* Current Task */}
    <div className="text-center">
      <p className="text-lg font-medium">제목 생성 중...</p>
      <Button variant="ghost" size="sm" onClick={onCancel}>
        취소
      </Button>
    </div>

    {/* Streaming Preview (Plain Text) */}
    <Card>
      <CardContent className="p-6">
        <div className="whitespace-pre-wrap font-mono text-sm">
          {streamingText}
          <span className="animate-pulse">|</span>
        </div>
      </CardContent>
    </Card>

    {/* Metadata Cards (Compact) */}
    <div className="grid grid-cols-2 gap-3">
      <MetadataCard icon={FileText} label="제목" value={title} />
      <MetadataCard icon={Hash} label="키워드" value={keywords} />
    </div>
  </div>
</div>
```

**특징:**
- 진행률 바 제거, 현재 작업만 표시
- 스트리밍 텍스트는 plain text로만 표시 (마크다운 렌더링 없음)
- 메타데이터 카드를 컴팩트하게 하단에 배치
- 취소 버튼 명확하게 제공

**3. Complete Mode**
```tsx
<div className="container mx-auto max-w-4xl px-4 py-12">
  <div className="space-y-8">
    {/* Success Message (Simple) */}
    <div className="flex items-center justify-center gap-3">
      <CheckCircle2 className="w-6 h-6 text-green-600" />
      <p className="text-lg font-medium">초안이 준비되었습니다</p>
    </div>

    {/* Metadata (Collapsible) */}
    <Collapsible>
      <CollapsibleTrigger className="w-full">
        <Card className="cursor-pointer hover:border-primary/50">
          <CardContent className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium">메타데이터 보기</span>
            <ChevronDown className="w-4 h-4" />
          </CardContent>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <MetadataCard icon={Hash} label="키워드" value={keywords} />
          <MetadataCard icon={FileText} label="메타 설명" value={metaDescription} />
        </div>
      </CollapsibleContent>
    </Collapsible>

    {/* Article Preview */}
    <Card>
      <CardContent className="p-8">
        <article className="prose prose-lg max-w-none">
          <h1>{title}</h1>
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      </CardContent>
    </Card>

    {/* Action Buttons */}
    <div className="flex gap-3">
      <Button onClick={onEdit} className="flex-1">
        <Edit className="w-4 h-4 mr-2" />
        초안 편집하기
      </Button>
      <Button onClick={onRegenerate} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" />
        다시 생성
      </Button>
    </div>
  </div>
</div>
```

**특징:**
- 2단 레이아웃 제거, 단일 컬럼으로 모바일 우선
- 메타데이터를 Collapsible로 숨겨 본문에 집중
- 성공 메시지 단순화 (Confetti, 소요 시간 제거)
- Primary CTA: "초안 편집하기" (다음 단계로 자연스럽게 유도)

---

### 3.2 UI 디자인 컨셉 (수정안)

#### 컬러 시스템

**기존 Tailwind 변수 최대 활용**
```typescript
// globals.css 최소 수정
:root {
  /* 기존 변수 그대로 사용 */
  --primary: 222.2 47.4% 11.2%;
  --accent: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;

  /* 필요 시 accent만 조정 */
  --accent: 207 90% 54%; /* #3BA2F8 파란색 */
  --accent-foreground: 0 0% 100%;
}
```

**사용 예시:**
```tsx
// ✅ Primary 버튼
<Button className="bg-primary text-primary-foreground">생성하기</Button>

// ✅ Accent 강조
<div className="border-l-4 border-accent bg-accent/10 p-4">
  현재 생성 중...
</div>

// ✅ Muted 부수 정보
<p className="text-muted-foreground">주제를 입력하세요</p>
```

#### 타이포그래피 (절제된 스케일)

```typescript
const typography = {
  pageTitle: "text-2xl md:text-3xl font-bold",           // 24px-30px
  articleTitle: "text-3xl md:text-4xl font-bold",         // 30px-36px
  sectionTitle: "text-lg font-semibold",                  // 18px
  body: "text-base",                                      // 16px
  small: "text-sm text-muted-foreground",                 // 14px
};
```

**적용 예시:**
```tsx
<h1 className="text-2xl md:text-3xl font-bold">새 글 작성</h1>
<p className="text-sm text-muted-foreground">주제를 입력하세요</p>

<h2 className="text-3xl md:text-4xl font-bold">{generatedTitle}</h2>
<div className="prose prose-lg">{content}</div>
```

#### 간격 시스템 (일관성)

```typescript
const spacing = {
  sectionGap: "space-y-8",      // 32px - 섹션 간
  componentGap: "space-y-6",    // 24px - 컴포넌트 간
  elementGap: "space-y-4",      // 16px - 요소 간
  inlineGap: "gap-3",           // 12px - 인라인 요소
};
```

#### 카드 스타일 (단순화)

```tsx
// ✅ 2가지만 사용
const cardStyles = {
  // 정적 카드
  default: "rounded-lg border bg-card shadow-sm",

  // 인터랙티브 카드
  interactive: "rounded-lg border bg-card shadow-sm hover:border-primary/50 cursor-pointer transition-colors",
};
```

---

### 3.3 컴포넌트 명세 (수정안)

#### 컴포넌트 구조 (단순화)

```
src/features/articles/components/
├─ generation-form.tsx (기존 개선)
├─ generation-progress-section.tsx (신규)
├─ article-preview-section.tsx (신규)
├─ metadata-card.tsx (신규, 재사용)
└─ action-buttons.tsx (신규, 재사용)
```

총 **5개 컴포넌트**로 단순화

#### 1. GenerationForm (기존 개선)

**Props:**
```typescript
interface GenerationFormProps {
  onSubmit: (data: { topic: string; styleGuideId: string }) => void;
  styleGuides: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}
```

**구조:**
```tsx
export function GenerationForm({ onSubmit, styleGuides, isLoading }: GenerationFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Textarea */}
        <FormField
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="예: React 19의 새로운 기능과 활용 방법"
                  className="min-h-[200px] resize-none"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Controls */}
        <div className="flex items-center gap-3">
          <FormField
            name="styleGuideId"
            render={({ field }) => (
              <FormItem className="flex-1">
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="스타일 가이드 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {styleGuides.map(sg => (
                      <SelectItem key={sg.id} value={sg.id}>
                        {sg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                생성하기
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

**개선 사항:**
- 내부 컴포넌트 분리 없음, 단일 컴포넌트로 유지
- 스타일 가이드 선택을 폼 하단에 배치 (텍스트에리어 내부 제거)
- 플레이스홀더에 구체적인 예시 포함

#### 2. GenerationProgressSection (신규)

**Props:**
```typescript
interface GenerationProgressSectionProps {
  currentTask: string; // "제목 생성 중", "본문 작성 중" 등
  streamingText: string;
  metadata: {
    title?: string;
    keywords?: string[];
    metaDescription?: string;
  };
  onCancel: () => void;
}
```

**구조:**
```tsx
export function GenerationProgressSection({
  currentTask,
  streamingText,
  metadata,
  onCancel,
}: GenerationProgressSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto max-w-4xl px-4 py-12 space-y-6"
    >
      {/* Current Task */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">{currentTask}</p>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          취소
        </Button>
      </div>

      {/* Streaming Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="whitespace-pre-wrap font-mono text-sm text-muted-foreground">
            {streamingText}
            <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* Metadata Cards */}
      <div className="grid grid-cols-2 gap-3">
        <MetadataCard
          icon={FileText}
          label="제목"
          value={metadata.title || "생성 중..."}
          isLoading={!metadata.title}
        />
        <MetadataCard
          icon={Hash}
          label="키워드"
          value={
            metadata.keywords?.length ? (
              <div className="flex flex-wrap gap-1">
                {metadata.keywords.map(k => (
                  <Badge key={k} variant="secondary" className="text-xs">
                    {k}
                  </Badge>
                ))}
              </div>
            ) : (
              "생성 중..."
            )
          }
          isLoading={!metadata.keywords?.length}
        />
      </div>
    </motion.div>
  );
}
```

**개선 사항:**
- 진행률 바 제거, 현재 작업 텍스트만 표시
- 스트리밍 텍스트를 plain text로 표시 (ReactMarkdown 없음)
- 메타데이터 카드를 컴팩트하게 2열 그리드로 배치
- 취소 버튼 상단에 명확하게 배치

#### 3. ArticlePreviewSection (신규)

**Props:**
```typescript
interface ArticlePreviewSectionProps {
  article: {
    title: string;
    content: string;
    metaDescription?: string;
    keywords?: string[];
  };
  onEdit: () => void;
  onRegenerate: () => void;
  isSaving?: boolean;
}
```

**구조:**
```tsx
export function ArticlePreviewSection({
  article,
  onEdit,
  onRegenerate,
  isSaving,
}: ArticlePreviewSectionProps) {
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto max-w-4xl px-4 py-12 space-y-8"
    >
      {/* Success Message */}
      <div className="flex items-center justify-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-green-600" />
        <p className="text-lg font-medium">초안이 준비되었습니다</p>
      </div>

      {/* Metadata Collapsible */}
      <Collapsible open={isMetadataOpen} onOpenChange={setIsMetadataOpen}>
        <CollapsibleTrigger className="w-full">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex justify-between items-center">
              <span className="text-sm font-medium">메타데이터 보기</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isMetadataOpen && "rotate-180"
                )}
              />
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <MetadataCard
              icon={Hash}
              label="키워드"
              value={
                <div className="flex flex-wrap gap-2">
                  {article.keywords?.map(k => (
                    <Badge key={k} variant="secondary">
                      {k}
                    </Badge>
                  ))}
                </div>
              }
            />
            <MetadataCard
              icon={FileText}
              label="메타 설명"
              value={article.metaDescription}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Article Preview */}
      <Card>
        <CardContent className="p-8">
          <article className="prose prose-lg max-w-none dark:prose-invert">
            <h1>{article.title}</h1>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </article>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onEdit} className="flex-1" disabled={isSaving}>
          <Edit className="w-4 h-4 mr-2" />
          초안 편집하기
        </Button>
        <Button onClick={onRegenerate} variant="outline" disabled={isSaving}>
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 생성
        </Button>
      </div>
    </motion.div>
  );
}
```

**개선 사항:**
- 2단 레이아웃 제거, 단일 컬럼으로 모바일 우선
- 메타데이터를 Collapsible로 숨겨 본문에 집중
- 성공 메시지 단순화 (Confetti, 시간 표시 제거)
- Primary CTA: "초안 편집하기"

#### 4. MetadataCard (신규, 재사용 가능)

**Props:**
```typescript
interface MetadataCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  isLoading?: boolean;
}
```

**구조:**
```tsx
export function MetadataCard({ icon: Icon, label, value, isLoading }: MetadataCardProps) {
  return (
    <Card className="rounded-lg border bg-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        ) : (
          <div className="text-sm">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
```

**개선 사항:**
- 단순하고 재사용 가능한 구조
- 로딩 상태 스켈레톤 UI 내장
- 다양한 value 타입 지원 (string, ReactNode)

#### 5. ActionButtons (선택 사항, 인라인 가능)

현재는 `ArticlePreviewSection` 내부에 인라인으로 구현하는 것이 더 단순함. 별도 컴포넌트로 분리하지 않음.

---

### 3.4 애니메이션 명세 (수정안)

#### 애니메이션 원칙
1. **최소화**: 3가지 기본 패턴만 사용
2. **부드러움**: 60fps 유지, 성능 우선
3. **접근성**: `prefers-reduced-motion` 존중

#### 기본 애니메이션 (3가지)

**1. fadeIn (섹션 진입)**
```tsx
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
};

// Usage
<motion.div {...fadeIn}>
  <GenerationProgressSection />
</motion.div>
```

**2. slideIn (카드, 사이드바)**
```tsx
const slideIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

// Usage
<motion.div {...slideIn}>
  <Card>...</Card>
</motion.div>
```

**3. success (체크 아이콘)**
```tsx
const success = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: { type: "spring", stiffness: 200, damping: 15 },
};

// Usage
<motion.div {...success}>
  <CheckCircle2 />
</motion.div>
```

#### 접근성 고려

```tsx
// Respect prefers-reduced-motion
const shouldReduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const fadeIn = {
  initial: { opacity: shouldReduceMotion ? 1 : 0 },
  animate: { opacity: 1 },
  transition: { duration: shouldReduceMotion ? 0 : 0.3 },
};
```

#### 모드 전환 애니메이션

```tsx
// Page.tsx
<AnimatePresence mode="wait">
  {mode === "form" && (
    <motion.div key="form" {...fadeIn}>
      <GenerationForm />
    </motion.div>
  )}
  {mode === "generating" && (
    <motion.div key="generating" {...fadeIn}>
      <GenerationProgressSection />
    </motion.div>
  )}
  {mode === "complete" && (
    <motion.div key="complete" {...slideIn}>
      <ArticlePreviewSection />
    </motion.div>
  )}
</AnimatePresence>
```

**개선 사항:**
- 복잡한 variants 제거, 3가지 기본 패턴만 사용
- layoutId 제거 (Shared Layout Animation 사용 안 함)
- 모든 애니메이션에 `prefers-reduced-motion` 적용
- 성능 최우선, 화려함보다 부드러움

---

## 4. 주요 변경 사항 요약

### 추가된 요소
- **간단한 페이지 제목**: "새 글 작성" (Hero 대신)
- **현재 작업 표시**: "제목 생성 중..." (진행률 바 대신)
- **Plain Text 스트리밍**: 생성 중 마크다운 렌더링 없음
- **Collapsible 메타데이터**: Complete 모드에서 메타데이터 숨김 가능
- **명확한 Primary CTA**: "초안 편집하기"

### 제거된 요소
- **Hero Section**: 큰 제목, 부제목 제거
- **Quick Tips**: 불필요한 팁 섹션 제거
- **진행률 바**: AI 생성의 불확실성 때문에 제거
- **2단 레이아웃**: 모바일 우선을 위해 단일 컬럼으로 변경
- **Confetti, 소요 시간**: 과도한 성공 축하 제거
- **복잡한 애니메이션**: 15개 이상의 variants 대신 3가지 기본 패턴만 사용
- **다크모드**: Phase 3에서도 제외, 별도 이슈로 관리

### 수정된 요소
- **레이아웃 일관성**: 모든 모드에서 max-w-4xl 또는 max-w-3xl 일관성 유지
- **디자인 시스템**: 하드코딩 색상 → Tailwind 변수
- **컴포넌트 구조**: 12개 → 5개로 단순화
- **타이포그래피**: 큰 Hero 스타일 → 절제된 작업 도구 스타일
- **메타데이터 표시**: 항상 보이는 사이드바 → Collapsible 카드
- **성공 메시지**: "글 생성 완료!" → "초안이 준비되었습니다"
- **버튼 우선순위**: "초안으로 저장" → "초안 편집하기" (Primary)

---

## 5. 기대 효과

### 사용자 경험 개선
- **집중된 작업 환경**: 불필요한 요소를 제거하여 글 생성에 집중
- **명확한 상태 피드백**: 현재 무엇이 생성되고 있는지 명확하게 표시
- **자연스러운 다음 단계**: "초안 편집하기" CTA로 워크플로우 연결
- **모바일 최적화**: 단일 컬럼 레이아웃으로 모든 기기에서 쉬운 사용

### 기술적 개선
- **유지보수성 향상**: 5개 컴포넌트로 단순화, 코드 복잡도 감소
- **성능 최적화**: 최소한의 애니메이션, 불필요한 렌더링 제거
- **디자인 시스템 일관성**: Tailwind 변수 활용으로 테마 통일
- **접근성**: `prefers-reduced-motion` 지원으로 모든 사용자 포용

### 개발 효율성
- **빠른 구현**: 복잡한 컴포넌트 분리 없이 단순한 구조
- **테스트 용이성**: 명확한 Props 인터페이스, 재사용 가능한 컴포넌트
- **확장성**: 기본 구조가 단순하여 향후 기능 추가 쉬움

---

## 6. 리스크 및 고려사항

### 리스크

**1. GenerationProgress 컴포넌트 호환성**
- 기존 컴포넌트의 Props가 요구사항과 맞지 않을 가능성
- **완화 방안**: 먼저 컴포넌트 확인 후 래퍼 또는 새 구현 결정

**2. Plain Text 스트리밍의 가독성**
- 마크다운을 렌더링하지 않아 가독성이 떨어질 수 있음
- **완화 방안**: 폰트 크기, 행간 조정으로 가독성 보완. 완료 후 마크다운 렌더링으로 충분

**3. Collapsible 메타데이터의 발견성**
- 사용자가 메타데이터를 보지 못하고 지나칠 가능성
- **완화 방안**: 기본적으로 열린 상태로 시작, 명확한 레이블 ("메타데이터 보기")

**4. 단일 컬럼 레이아웃의 정보 밀도**
- 데스크톱에서 공간 활용이 비효율적일 수 있음
- **완화 방안**: max-w-4xl로 적절한 폭 유지, 필요 시 데스크톱에서만 사이드바 표시 (lg: 이상)

### 고려사항

**1. 스트리밍 중 취소 기능 구현**
- 백엔드에서 스트리밍 중단 API 필요
- AbortController 사용 또는 별도 취소 엔드포인트 구현

**2. 생성 중 데이터 손실 방지**
- 취소 시 부분 생성 데이터 저장 여부
- 새로고침 시 진행 상태 복구 불가 (현재는 메모리 기반)

**3. 에러 처리 전략**
- 스트리밍 중 에러 발생 시 부분 데이터 표시 또는 전체 폐기?
- 재시도 시 동일한 프롬프트 재사용 또는 수정 가능하게?

**4. 자동 저장**
- 생성 완료 시 자동으로 초안 저장할지, 명시적 저장 버튼 필요할지
- 현재는 "초안 편집하기" 클릭 시 자동 저장 가정

**5. 다국어 지원**
- "새 글 작성", "생성 중..." 등 하드코딩된 텍스트를 i18n으로 전환 필요
- 현재는 한국어만 가정

---

## 7. 구현 우선순위 (재조정)

### Phase 1: Core Improvements (즉시, 1-2일)
**목표**: 가장 중요한 문제 해결, 즉각적인 개선 효과

1. **디자인 시스템 통일** (3-4시간)
   - 하드코딩 색상 → Tailwind 변수
   - `globals.css`에 accent 색상 추가 (선택)
   - 인라인 스타일 제거

2. **레이아웃 일관성** (1-2시간)
   - 모든 모드에서 동일한 컨테이너 max-width
   - 중앙 정렬 일관성

3. **Form Mode 단순화** (2-3시간)
   - Hero Section 제거
   - 간단한 제목 + 설명만 유지
   - 스타일 가이드 선택 위치 조정

**예상 소요 시간**: **6-9시간** (1-2일)

### Phase 2: UX Enhancements (1주 내)
**목표**: 사용자 경험 대폭 개선

4. **GenerationProgressSection 구현** (4-6시간)
   - 현재 작업 표시
   - Plain text 스트리밍 프리뷰
   - MetadataCard 컴팩트 배치
   - 취소 버튼

5. **ArticlePreviewSection 구현** (4-6시간)
   - Collapsible 메타데이터
   - 단일 컬럼 레이아웃
   - 명확한 Primary CTA

6. **기본 애니메이션 적용** (3-4시간)
   - fadeIn, slideIn, success 3가지 패턴
   - 모드 전환 애니메이션
   - `prefers-reduced-motion` 지원

**예상 소요 시간**: **11-16시간** (3-4일)

### Phase 3: Polish & Optimization (2주 내)
**목표**: 완성도 높이기, 엣지 케이스 처리

7. **에러 처리 개선** (3-4시간)
   - 재시도 버튼
   - 에러 타입별 메시지
   - 부분 데이터 표시

8. **접근성 개선** (3-4시간)
   - ARIA 레이블
   - 키보드 네비게이션
   - 스크린 리더 지원

9. **모바일 최적화** (2-3시간)
   - 터치 영역 확대
   - 반응형 레이아웃 점검
   - 모바일 전용 조정

10. **국제화 (i18n)** (2-3시간)
    - 하드코딩 텍스트 → next-intl
    - 다국어 지원

**예상 소요 시간**: **10-14시간** (3-4일)

### 총 예상 소요 시간
- Phase 1: 6-9시간 (1-2일)
- Phase 2: 11-16시간 (3-4일)
- Phase 3: 10-14시간 (3-4일)
- **총합**: **27-39시간** (약 7-10일)

---

## 8. 다음 단계

### 즉시 실행 (Phase 1)

1. **코드베이스 확인**
   - 현재 `page.tsx` 구조 확인
   - `GenerationProgress` 컴포넌트 Props 인터페이스 확인
   - 기존 디자인 시스템 변수 확인

2. **디자인 시스템 통일**
   - `globals.css` 수정 (accent 색상)
   - 하드코딩 색상 찾기 (Grep: `style={{`, `#[0-9A-Fa-f]{6}`)
   - Tailwind 클래스로 전환

3. **Form Mode 단순화**
   - Hero Section 제거
   - 간단한 제목 추가
   - 레이아웃 max-width 통일

### 검증 단계 (Phase 1 완료 후)

1. **사용자 테스트**
   - 실제 사용자에게 단순화된 폼 테스트
   - 피드백 수집 (Hero가 없어도 괜찮은지)

2. **성능 측정**
   - 페이지 로드 시간
   - 애니메이션 프레임 레이트 (60fps 유지 확인)

3. **접근성 검증**
   - 스크린 리더 테스트
   - 키보드 네비게이션 테스트

### 반복 개선 (Phase 2, 3)

1. **피드백 반영**
   - 사용자 테스트 결과 반영
   - 우선순위 재조정

2. **점진적 개선**
   - Phase 2, 3는 유연하게 조정
   - 필요 시 일부 기능 제외 또는 연기

---

## 9. 결론

### 원안의 주요 문제

1. **과도한 복잡성**: 12개 컴포넌트, 15개 이상 애니메이션 variants
2. **컨텍스트 오해**: Hero Section은 랜딩 페이지에 적합, 작업 도구에는 과도
3. **모바일 무시**: 2단 레이아웃은 데스크톱 중심
4. **실현 가능성 부족**: GenerationProgress 호환성, 스트리밍 마크다운 복잡도 고려 안 함

### 개선된 계획의 핵심

1. **단순함 우선**: 5개 컴포넌트, 3가지 애니메이션 패턴
2. **작업 중심**: 불필요한 마케팅 요소 제거, 글 생성에 집중
3. **모바일 우선**: 단일 컬럼 레이아웃, Collapsible 메타데이터
4. **실용성**: 진행률 바 대신 현재 작업 표시, plain text 스트리밍

### 기대 효과

- **즉각적인 개선**: Phase 1만 완료해도 사용자 경험 대폭 향상
- **유지보수성**: 단순한 구조로 향후 기능 추가 쉬움
- **성능**: 최소한의 애니메이션, 불필요한 렌더링 제거
- **접근성**: 모든 사용자가 쉽게 사용 가능

### 권장 사항

1. **Phase 1 우선**: 디자인 시스템, 레이아웃, Form 단순화 (1-2일)
2. **검증 후 진행**: 사용자 피드백 수집 후 Phase 2 진행
3. **유연한 우선순위**: Phase 3는 필요에 따라 조정

이 개선된 계획을 통해 New Article 페이지가 **단순하고, 집중되고, 효율적인 AI 글 생성 도구**로 발전할 것입니다. claude.ai의 단순함과 효율성을 차용하되, SEO 최적화와 스타일 가이드라는 차별화 포인트를 자연스럽게 통합합니다.
