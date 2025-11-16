# 스타일 가이드 페이지 개선안 검토 및 개선

## 1. 원안 요약

0번 단계에서 제안된 개선안은 현재 Style Guide 페이지를 다음과 같이 개선하려고 했습니다:

### 주요 제안 사항
1. **Grid View 추가**: 카드 형식으로 더 많은 정보 시각적 표시
2. **Stats Cards 추가**: 총 개수, 최근 생성, 활성 가이드 통계
3. **Search & Filter**: 검색, 언어 필터, 톤 필터 추가
4. **View Toggle**: Grid/Table 뷰 전환 기능
5. **Empty State 개선**: 일러스트, 혜택 설명, 강력한 CTA
6. **Modal 개선**: Card 레이아웃, 액션 버튼 추가
7. **애니메이션**: framer-motion을 활용한 진입/호버/전환 애니메이션
8. **i18n 적용**: 하드코딩된 텍스트 다국어화
9. **접근성 개선**: aria-label, focus trap, 키보드 네비게이션
10. **Batch Actions**: 일괄 삭제, 복사 기능

---

## 2. 비판적 검토

### 2.1 사용자 경험 (UX)

#### 문제점

**1. 과도한 기능 추가로 인한 복잡성 증가**
- Grid/Table 뷰 전환, Search, Filter, Sort, Batch Actions 등 너무 많은 기능을 한 번에 추가하려 함
- 스타일 가이드는 일반적으로 개수가 많지 않은 리소스인데, 과도한 관리 기능은 오히려 사용성을 해칠 수 있음
- Notion, Linear, Figma 등을 레퍼런스로 삼았지만, 이들은 "파일/이슈"처럼 대량의 항목을 관리하는 페이지임. 스타일 가이드는 보통 3-5개 정도만 존재하므로 맥락이 다름

**2. Stats Cards의 실질적 가치 부족**
- "총 스타일 가이드", "최근 7일 생성", "활성 가이드" 통계는 스타일 가이드 페이지에서 실질적 가치가 낮음
- 스타일 가이드 개수는 눈으로 세도 될 정도로 적음
- "활성 가이드"의 의미가 모호함 (현재 스키마에 `isDefault` 필드가 있는지도 확인 필요)
- 통계는 대시보드 성격의 페이지에 적합하지, CRUD 중심 페이지에는 부적합

**3. View Toggle의 필요성 의문**
- Grid와 Table을 동시에 제공하는 것은 좋지만, 개수가 적은 리소스에서는 오히려 혼란을 줄 수 있음
- Grid View가 더 많은 정보를 보여주고 시각적으로 우수하다면, 굳이 Table View를 유지할 필요가 있는가?
- 모바일 최적화를 위해서라면 반응형으로 Grid만 제공하는 것이 더 단순하고 효과적

**4. 검색/필터의 과도한 세분화**
- 언어, 톤 필터를 별도 드롭다운으로 제공하는 것은 스타일 가이드가 5개 미만일 때 과도함
- 간단한 검색 바만으로도 충분할 가능성이 높음
- 필터는 10개 이상일 때 필요하며, 초기에는 검색만 제공하는 것이 실용적

**5. Empty State의 혜택 설명이 너무 많음**
- 3가지 혜택 카드 ("5분 안에 설정", "브랜드 일관성", "AI 자동 생성")는 정보 과잉
- 사용자는 이미 스타일 가이드가 무엇인지 알고 이 페이지에 접근했을 가능성이 높음
- 더 단순하고 직관적인 CTA가 효과적

#### 개선안

**1. 기능 우선순위 재조정**
- **Phase 1 (필수)**: Grid View, Empty State, 기본 애니메이션, i18n
- **Phase 2 (선택)**: 검색 (10개 이상일 때만), Modal 개선
- **Phase 3 (보류)**: Stats Cards, View Toggle, Filter, Sort, Batch Actions

**2. Stats Cards 제거 또는 대체**
- 통계 카드 대신, 간단한 카운트 표시: "스타일 가이드 3개"
- 또는 "최근 생성됨" Badge를 개별 카드에 표시

**3. Grid View 중심 설계**
- Grid View를 기본 및 유일한 뷰로 설정
- 반응형으로 모바일에서는 1열, 태블릿 2열, 데스크톱 3열
- Table View는 나중에 사용자 요청이 있을 때만 추가

**4. 검색만 우선 제공**
- 초기에는 간단한 검색 바만 제공 (브랜드명 검색)
- 필터는 스타일 가이드가 10개 이상일 때 추가

**5. Empty State 단순화**
- 혜택 카드 3개 대신, 간단한 설명과 CTA만 제공
- claude.ai 스타일의 미니멀한 Empty State

---

### 2.2 메시징 전략

#### 문제점

**1. 메시지 톤이 너무 홍보적**
- "5분 안에 설정", "AI 자동 생성" 등은 마케팅 메시지처럼 느껴짐
- 이미 로그인한 사용자에게는 제품 가치를 설득할 필요가 없음
- 더 실용적이고 직접적인 안내가 필요

**2. 모달의 정보 계층이 과도하게 세분화**
- Card 4개로 나눈 구조는 정보가 적은 스타일 가이드에는 과도함
- 더 단순하고 스캔 가능한 레이아웃이 필요

#### 개선안

**1. Empty State 메시지 개선**
```
AS-IS: "첫 번째 스타일 가이드를 만들어보세요"
TO-BE: "스타일 가이드를 만들어 일관된 콘텐츠를 생성하세요"

AS-IS: "5분 안에 설정" + "브랜드 일관성" + "AI 자동 생성"
TO-BE: 혜택 카드 제거, 간단한 설명만 유지
```

**2. 모달 구조 단순화**
- Card 4개 대신, 섹션 구분만 사용
- 중요한 정보 (브랜드명, 설명, 톤)를 상단에 배치
- 덜 중요한 정보 (생성일, 수정일)는 하단에 배치

---

### 2.3 시각적 디자인

#### 문제점

**1. 애니메이션 과도 사용**
- Stats Cards 호버 애니메이션 (y: -4)
- Grid Cards 호버 애니메이션 (y: -4)
- Table Row 애니메이션 (x: -20)
- Button 애니메이션 (scale: 1.05)
- Empty State 일러스트 Pulse 애니메이션 (무한 반복)

너무 많은 애니메이션은 오히려 산만하고 성능에 부담을 줄 수 있음

**2. 컬러 시스템 설명이 불명확**
- 현재 프로젝트의 Tailwind CSS 컬러 시스템을 나열만 했지, 실제 색상 값이나 사용 예시가 없음
- claude.ai의 컬러 시스템과 비교 분석이 없음

**3. 타이포그래피 일관성 부족**
- 페이지 타이틀이 `text-3xl`인데, 카드 타이틀도 `text-lg`로 크기 차이가 크지 않음
- 명확한 시각적 위계 필요

#### 개선안

**1. 애니메이션 최소화**
- **유지**: Grid Card 진입 애니메이션 (opacity + y), Modal 애니메이션
- **제거**: Stats Cards 호버, Button scale, Empty State Pulse
- **수정**: Grid Card 호버는 shadow만 변경 (y 이동 제거)

**2. 컬러 시스템 명확화**
- claude.ai 참고: 주로 neutral 색상 + primary accent
- 배경: white/neutral-50
- 카드: white + border (neutral-200)
- 텍스트: neutral-900 (제목), neutral-600 (설명)
- Primary: blue/purple (CTA, 선택 상태)

**3. 타이포그래피 위계 강화**
```typescript
const typography = {
  pageTitle: "text-4xl font-bold tracking-tight", // 3xl → 4xl
  cardTitle: "text-base font-semibold", // lg → base
  cardDescription: "text-sm text-muted-foreground",
  statNumber: "text-2xl font-bold", // 3xl → 2xl (Stats Cards 제거 시 불필요)
}
```

---

### 2.4 기술적 실현 가능성

#### 문제점

**1. 데이터베이스 스키마 확인 필요**
- `isDefault` 필드가 현재 스키마에 있는지 확인 안 됨
- "활성 가이드" 개념이 실제로 존재하는지 불명확
- Duplicate 기능을 위한 백엔드 API가 있는지 확인 필요

**2. framer-motion 번들 사이즈 고려 안 됨**
- framer-motion은 상대적으로 큰 라이브러리 (~60KB gzipped)
- 너무 많은 애니메이션 컴포넌트를 사용하면 초기 로딩 시간 증가
- Tree-shaking 최적화 방안 필요

**3. i18n 메시지가 너무 세분화**
- 60개 이상의 번역 키를 제안했지만, 실제로 필요한 키는 절반 정도
- 번역 관리 복잡도 증가

**4. 접근성 구현이 추상적**
- `useFocusTrap` 훅이 실제로 존재하는지 확인 안 됨
- `react-focus-trap` 같은 외부 라이브러리가 필요한지 불명확
- 키보드 네비게이션 구체적 구현 방법 누락

**5. 반응형 디자인 테스트 계획 없음**
- 모바일에서 Grid 3열 → 1열로 변경 시 레이아웃이 깨질 가능성
- 테이블 액션 버튼이 모바일에서 정말 아이콘만 표시되는지 테스트 필요

#### 개선안

**1. 데이터베이스 스키마 먼저 확인**
- `supabase/migrations` 폴더에서 style_guides 테이블 스키마 확인
- `isDefault`, `isActive` 같은 필드가 없으면 추가 필요
- Duplicate API 구현 필요

**2. framer-motion 사용 최소화**
- 핵심 애니메이션만 사용: Grid Card 진입, Modal
- CSS transitions으로 대체 가능한 부분은 CSS 사용
```tsx
// framer-motion 대신 CSS
<div className="transition-all duration-300 hover:shadow-lg">
```

**3. i18n 키 간소화**
- 필수 키만 우선 추가 (~20-30개)
- 나머지는 필요 시 점진적으로 추가

**4. 접근성 구현 구체화**
- shadcn-ui Dialog 컴포넌트의 기본 focus trap 활용
- 키보드 네비게이션은 브라우저 기본 동작 활용
- `aria-label`, `role` 속성만 추가

**5. 반응형 breakpoints 명확화**
```typescript
const responsive = {
  mobile: "grid-cols-1", // < 768px
  tablet: "md:grid-cols-2", // 768px - 1024px
  desktop: "lg:grid-cols-3", // > 1024px
}
```

---

### 2.5 claude.ai 벤치마킹

#### 문제점

**1. claude.ai 참조가 피상적**
- "claude.ai 수준의 시각적 완성도"라고만 언급하고, 구체적으로 무엇을 차용할지 불명확
- claude.ai의 어떤 페이지를 참고했는지, 어떤 패턴을 차용했는지 설명 부족

**2. claude.ai와 맥락이 다른 레퍼런스 사용**
- Notion, Linear, Figma의 파일 관리 페이지를 레퍼런스로 삼았지만, 이들은 대량의 항목 관리에 최적화됨
- claude.ai는 주로 대화 중심이므로, 관리 페이지 패턴보다는 심플한 설정 페이지 패턴이 더 적합

**3. 차별화 포인트 부재**
- 단순히 claude.ai를 모방하는 것이 아니라, 우리만의 차별점이 필요
- 예: 스타일 가이드 미리보기를 더 시각적으로 표현, 톤앤매너를 시각적으로 보여주는 등

#### 개선안

**1. claude.ai의 핵심 패턴 차용**
- **미니멀한 디자인**: 불필요한 요소 제거, 충분한 여백
- **명확한 타이포그래피**: 큰 제목, 읽기 쉬운 본문
- **부드러운 애니메이션**: 과도하지 않은 자연스러운 전환
- **일관된 컬러**: neutral 기반 + primary accent

**2. 적절한 레퍼런스 선택**
- **Stripe Dashboard**: 간단한 관리 페이지, 명확한 CTA
- **Vercel Dashboard**: 프로젝트 카드 레이아웃, 검색
- **GitHub Settings**: 설정 페이지 레이아웃, 간결한 폼

**3. 차별화 포인트 추가**
- **톤앤매너 시각화**: Badge 대신 작은 아이콘이나 색상으로 표현
- **브랜드 썸네일**: 브랜드 로고나 대표 색상을 카드에 표시
- **빠른 액션**: 카드 호버 시 주요 액션 버튼 표시

---

## 3. 개선된 최종 계획

### 3.1 페이지 구성 (수정안)

```
┌─────────────────────────────────────────────┐
│  Header                                     │
│  - 제목: "스타일 가이드"                     │
│  - 설명: 간단한 서브타이틀                   │
│  - 액션: "새로 만들기" 버튼                  │
├─────────────────────────────────────────────┤
│  Search Bar (10개 이상일 때만 표시)          │
│  - 브랜드명 검색                            │
├─────────────────────────────────────────────┤
│  Content Area (Grid View만)                │
│  - Empty State: 간소화된 버전               │
│  - Grid Cards: 3열 → 2열 → 1열 (반응형)     │
├─────────────────────────────────────────────┤
│  Modal (개선된 레이아웃)                     │
└─────────────────────────────────────────────┘
```

**변경 사항**:
- Stats Cards 제거
- View Toggle 제거
- Filter 제거 (검색만 유지)
- Grid View만 유지

---

### 3.2 UI 디자인 컨셉 (수정안)

#### 컬러 시스템
```typescript
const colors = {
  // 배경
  background: "hsl(var(--background))", // #FFFFFF or neutral-50

  // 카드
  card: "hsl(var(--card))", // #FFFFFF
  cardBorder: "hsl(var(--border))", // neutral-200

  // 텍스트
  foreground: "hsl(var(--foreground))", // neutral-900
  muted: "hsl(var(--muted-foreground))", // neutral-600

  // Primary (CTA)
  primary: "hsl(var(--primary))", // blue/purple

  // Destructive (삭제)
  destructive: "hsl(var(--destructive))", // red
};
```

#### 타이포그래피
```typescript
const typography = {
  pageTitle: "text-4xl font-bold tracking-tight", // 메인 제목
  pageDescription: "text-base text-muted-foreground", // 서브타이틀
  cardTitle: "text-base font-semibold", // 카드 제목
  cardDescription: "text-sm text-muted-foreground line-clamp-2", // 카드 설명
  badge: "text-xs font-medium", // 배지
};
```

#### 간격 시스템
```typescript
const spacing = {
  pageContainer: "px-6 py-8", // 페이지 여백
  sectionGap: "space-y-8", // 섹션 간 간격 (6 → 8)
  cardPadding: "p-6", // 카드 내부 여백
  cardGap: "gap-6", // 카드 간 간격
};
```

#### 애니메이션 전략
```typescript
// 1. Grid Card 진입 (opacity + y)
const cardEnterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 }
  })
};

// 2. Grid Card 호버 (shadow만)
// CSS로 구현: hover:shadow-lg transition-shadow

// 3. Modal 애니메이션
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};
```

---

### 3.3 컴포넌트 명세 (수정안)

#### 3.3.1 StyleGuidePage Component

**State (간소화)**:
```typescript
// Search
const [searchQuery, setSearchQuery] = useState("");

// Preview Modal
const [previewGuide, setPreviewGuide] = useState<StyleGuideResponse | null>(null);
const [isPreviewOpen, setIsPreviewOpen] = useState(false);
```

**하위 컴포넌트**:
- `PageHeader`: 제목, 설명, 새로 만들기 버튼
- `SearchBar`: 검색 (10개 이상일 때만 표시)
- `StyleGuideGrid`: 카드 그리드 뷰
- `StyleGuideCard`: 개별 카드 컴포넌트
- `StyleGuidePreviewModal`: 개선된 미리보기 모달
- `EmptyState`: 간소화된 Empty 상태

---

#### 3.3.2 PageHeader Component

```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-4xl font-bold tracking-tight">
      {t("styleGuide.title")}
    </h1>
    <p className="text-base text-muted-foreground mt-2">
      {t("styleGuide.subtitle")}
    </p>
  </div>
  <Button size="lg" onClick={onCreateNew}>
    <Plus className="mr-2 h-5 w-5" />
    {t("styleGuide.createNew")}
  </Button>
</div>
```

---

#### 3.3.3 SearchBar Component

**조건부 렌더링**: 스타일 가이드가 10개 이상일 때만 표시

```tsx
{guides.length >= 10 && (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder={t("styleGuide.search.placeholder")}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10"
    />
  </div>
)}
```

---

#### 3.3.4 StyleGuideGrid Component

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredGuides.map((guide, index) => (
    <StyleGuideCard
      key={guide.id}
      guide={guide}
      index={index}
      onPreview={handlePreview}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ))}
</div>
```

---

#### 3.3.5 StyleGuideCard Component

```tsx
<motion.div
  custom={index}
  variants={cardEnterVariants}
  initial="hidden"
  animate="visible"
  className="rounded-lg border bg-card p-6 space-y-4 hover:shadow-lg transition-shadow"
>
  {/* Header */}
  <div>
    <h3 className="text-base font-semibold">{guide.brandName}</h3>
    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
      {guide.brandDescription}
    </p>
  </div>

  {/* Personality Tags */}
  <div className="flex flex-wrap gap-2">
    {guide.personality.slice(0, 3).map((trait) => (
      <Badge key={trait} variant="outline" className="text-xs">
        {trait}
      </Badge>
    ))}
    {guide.personality.length > 3 && (
      <Badge variant="outline" className="text-xs">
        +{guide.personality.length - 3}
      </Badge>
    )}
  </div>

  {/* Metadata */}
  <div className="flex items-center gap-4 text-sm text-muted-foreground">
    <span className="flex items-center gap-1">
      <Globe className="h-3.5 w-3.5" />
      {guide.language === "ko" ? "한국어" : "English"}
    </span>
    <span className="flex items-center gap-1">
      <User className="h-3.5 w-3.5" />
      {guide.targetAudience}
    </span>
  </div>

  {/* Created Date */}
  <div className="text-xs text-muted-foreground">
    {format(new Date(guide.createdAt), "PPP", { locale: ko })}
  </div>

  {/* Actions */}
  <div className="flex gap-2 pt-4 border-t">
    <Button
      variant="ghost"
      size="sm"
      className="flex-1"
      onClick={() => onPreview(guide)}
    >
      <Eye className="mr-2 h-4 w-4" />
      {t("styleGuide.actions.preview")}
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="flex-1"
      onClick={() => onEdit(guide)}
    >
      <Pencil className="mr-2 h-4 w-4" />
      {t("styleGuide.actions.edit")}
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onDelete(guide.id)}
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
</motion.div>
```

---

#### 3.3.6 EmptyState Component (간소화)

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  className="rounded-lg border border-dashed p-12 text-center space-y-6"
>
  {/* Illustration */}
  <div className="flex justify-center">
    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
      <FileText className="w-16 h-16 text-primary opacity-30" />
    </div>
  </div>

  {/* Heading & Description */}
  <div className="space-y-2">
    <h3 className="text-xl font-semibold">
      {t("styleGuide.empty.title")}
    </h3>
    <p className="text-muted-foreground max-w-md mx-auto">
      {t("styleGuide.empty.description")}
    </p>
  </div>

  {/* CTA */}
  <div>
    <Button size="lg" onClick={onCreateNew}>
      <Plus className="mr-2 h-5 w-5" />
      {t("styleGuide.empty.cta")}
    </Button>
  </div>
</motion.div>
```

**변경 사항**:
- 혜택 카드 3개 제거
- 일러스트 크기 축소 (48 → 32)
- Pulse 애니메이션 제거

---

#### 3.3.7 StyleGuidePreviewModal Component (개선)

```tsx
<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
  {/* Header */}
  <DialogHeader>
    <DialogTitle className="text-2xl">{guide.brandName}</DialogTitle>
    <DialogDescription className="flex items-center gap-4 mt-2 text-sm">
      <span className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        {format(new Date(guide.createdAt), "PPP", { locale: ko })}
      </span>
    </DialogDescription>
  </DialogHeader>

  {/* Content - 단일 섹션으로 통합 */}
  <div className="space-y-6 py-4">
    {/* Brand Info */}
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {t("styleGuide.modal.brandInfo")}
      </h4>
      <div className="space-y-2">
        <InfoRow label={t("styleGuide.modal.brandName")} value={guide.brandName} />
        <InfoRow label={t("styleGuide.modal.description")} value={guide.brandDescription} />
        <InfoRow label={t("styleGuide.modal.personality")} value={guide.personality.join(", ")} />
        <InfoRow label={t("styleGuide.modal.formality")} value={getFormalityLabel(guide.formality)} />
      </div>
    </div>

    {/* Target Audience */}
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {t("styleGuide.modal.targetAudience")}
      </h4>
      <div className="space-y-2">
        <InfoRow label={t("styleGuide.modal.audience")} value={guide.targetAudience} />
        <InfoRow label={t("styleGuide.modal.painPoints")} value={guide.painPoints} />
      </div>
    </div>

    {/* Content Style */}
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {t("styleGuide.modal.contentStyle")}
      </h4>
      <div className="space-y-2">
        <InfoRow label={t("styleGuide.modal.language")} value={guide.language === "ko" ? "한국어" : "English"} />
        <InfoRow label={t("styleGuide.modal.tone")} value={getToneLabel(guide.tone)} />
        <InfoRow label={t("styleGuide.modal.length")} value={getContentLengthLabel(guide.contentLength)} />
        <InfoRow label={t("styleGuide.modal.readingLevel")} value={getReadingLevelLabel(guide.readingLevel)} />
      </div>
    </div>

    {/* Notes */}
    {guide.notes && (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("styleGuide.modal.notes")}
        </h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {guide.notes}
        </p>
      </div>
    )}
  </div>

  {/* Footer */}
  <DialogFooter className="flex flex-col sm:flex-row gap-2">
    <Button variant="outline" onClick={() => onEdit(guide)} className="flex-1">
      <Pencil className="mr-2 h-4 w-4" />
      {t("styleGuide.actions.edit")}
    </Button>
    <Button variant="outline" onClick={onClose} className="flex-1">
      {t("styleGuide.actions.close")}
    </Button>
  </DialogFooter>
</DialogContent>
```

**변경 사항**:
- Card 4개 대신 단일 섹션으로 통합
- InfoRow는 간단한 레이블-값 쌍
- 복사 버튼 제거 (백엔드 API 확인 필요)

---

### 3.4 애니메이션 명세 (수정안)

#### 사용할 애니메이션

**1. Grid Card 진입 애니메이션**
```typescript
const cardEnterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" }
  })
};
```

**2. Grid Card 호버 (CSS)**
```tsx
className="hover:shadow-lg transition-shadow duration-300"
```

**3. Modal 애니메이션**
```typescript
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};
```

**4. Empty State 애니메이션**
```typescript
const emptyStateVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};
```

#### 제거한 애니메이션
- Stats Cards 호버 애니메이션
- Table Row 애니메이션 (Table View 제거)
- Button scale 애니메이션
- Empty State 일러스트 Pulse 애니메이션
- View Toggle 전환 애니메이션

---

## 4. 주요 변경 사항 요약

### 추가된 요소
- Grid View 카드 레이아웃 (3열 → 2열 → 1열 반응형)
- 조건부 검색 바 (10개 이상일 때만)
- 개선된 Empty State (간소화)
- 기본 애니메이션 (진입, 호버, 모달)

### 제거된 요소
- Stats Cards (총 개수, 최근 생성, 활성 가이드)
- View Toggle (Grid/Table 전환)
- Filter 드롭다운 (언어, 톤)
- Table View
- Sort 기능
- Batch Actions
- Duplicate 기능 (백엔드 API 확인 후 추가)
- 과도한 애니메이션 (호버 y 이동, Pulse 등)

### 수정된 요소
- **Header**: 타이틀 크기 증가 (text-3xl → text-4xl)
- **Card**: 정보 밀도 최적화, 액션 버튼 레이블 추가
- **Modal**: Card 레이아웃 대신 섹션 구분만 사용
- **Empty State**: 혜택 카드 제거, 간단한 설명과 CTA만
- **애니메이션**: 필수 애니메이션만 유지, CSS로 대체 가능한 부분은 CSS 사용

---

## 5. 기대 효과

### 사용성 향상
- **간결한 인터페이스**: 불필요한 기능 제거로 사용자 집중도 향상
- **빠른 스캔**: Grid View로 한눈에 모든 스타일 가이드 파악 가능
- **명확한 CTA**: Empty State에서 바로 행동 유도

### 성능 개선
- **번들 사이즈 감소**: 과도한 애니메이션 제거, CSS로 대체
- **렌더링 최적화**: Stats Cards, View Toggle 제거로 컴포넌트 수 감소
- **초기 로딩 속도**: 불필요한 계산 (통계, 필터) 제거

### 유지보수성
- **단순한 상태 관리**: viewMode, sortBy, filter 등 제거로 상태 간소화
- **적은 i18n 키**: 필수 키만 유지 (~30개)
- **명확한 컴포넌트 구조**: 핵심 컴포넌트만 유지

---

## 6. 리스크 및 고려사항

### 리스크

**1. Grid View만 제공 시 사용자 피드백**
- 일부 사용자는 Table View를 선호할 수 있음
- 대응: 사용자 피드백 수집 후 필요 시 추가

**2. 검색 기능이 10개 이상일 때만 표시**
- 5-9개 사이에서도 검색이 필요할 수 있음
- 대응: 5개부터 표시하도록 조정 가능

**3. 데이터베이스 스키마 불일치**
- `isDefault` 필드가 없을 경우 마이그레이션 필요
- 대응: 스키마 확인 후 필요 시 마이그레이션 추가

### 고려사항

**1. 점진적 개선 전략**
- Phase 1: Grid View, Empty State, 기본 애니메이션, i18n
- Phase 2: 검색, Modal 개선
- Phase 3: 사용자 요청 시 추가 기능 (Filter, Table View 등)

**2. 성능 모니터링**
- framer-motion 사용 시 Lighthouse 성능 점수 확인
- 필요 시 CSS 애니메이션으로 추가 대체

**3. 접근성 테스트**
- 키보드 네비게이션 테스트
- Screen Reader 테스트 (VoiceOver, NVDA)
- WCAG 2.1 AA 준수 확인

---

## 7. 다음 단계

### 우선순위 1 (즉시 시작)
1. **데이터베이스 스키마 확인**
   - `supabase/migrations` 폴더에서 style_guides 테이블 확인
   - `isDefault` 필드 확인, 없으면 마이그레이션 추가

2. **컴포넌트 구조 구현**
   - StyleGuidePage 리팩토링
   - PageHeader, SearchBar, StyleGuideGrid, StyleGuideCard 분리

3. **Grid View 구현**
   - 반응형 그리드 레이아웃 (1열 → 2열 → 3열)
   - 카드 디자인 (브랜드명, 설명, 톤앤매너, 메타데이터, 액션)

### 우선순위 2 (1-2일 내)
4. **Empty State 개선**
   - 간소화된 버전 구현
   - 일러스트, 설명, CTA

5. **애니메이션 적용**
   - Grid Card 진입 애니메이션 (framer-motion)
   - Grid Card 호버 (CSS transition)
   - Modal 애니메이션 (framer-motion)

6. **i18n 적용**
   - 필수 번역 키 추가 (~30개)
   - ko.json, en.json 업데이트

### 우선순위 3 (1주 내)
7. **Modal 개선**
   - 섹션 기반 레이아웃
   - 액션 버튼 (수정, 닫기)

8. **검색 기능 추가**
   - 조건부 렌더링 (10개 이상)
   - 브랜드명 검색 필터링

9. **접근성 개선**
   - aria-label 추가
   - 키보드 네비게이션 테스트
   - Screen Reader 테스트

### 우선순위 4 (필요 시)
10. **추가 기능** (사용자 피드백 기반)
    - Table View
    - Filter (언어, 톤)
    - Sort
    - Batch Actions

---

**작성일**: 2025-11-16
**작성자**: Claude Code (Page Plan Critic Agent)
**버전**: 2.0 (개선)
**기반 문서**: agent-outputs/style-guide/0-explore.md
