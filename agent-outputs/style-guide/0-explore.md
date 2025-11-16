# Style Guide 페이지 분석 및 개선안

## 1. 현재 상태 분석

### 1.1 페이지 구조

현재 Style Guide 페이지는 다음과 같은 구조로 구성되어 있습니다:

1. **PageLayout** - 공통 레이아웃 컴포넌트
   - 제목: "스타일 가이드 관리"
   - 설명: 서브타이틀
   - 액션: "새로 만들기" 버튼
2. **Loading State** - 로딩 중 상태 (Loader2 아이콘)
3. **Error State** - 에러 상태 (재시도 버튼)
4. **Empty State** - 데이터 없음 상태 (Dashed border box)
5. **Data Table** - 스타일 가이드 목록
   - 테이블 헤더: 브랜드명, 타겟 오디언스, 톤앤매너, 언어, 생성일, 작업
   - 테이블 행: 각 스타일 가이드 정보
   - 작업 버튼: 미리보기(Eye), 수정(Pencil), 삭제(Trash2)
6. **StyleGuidePreviewModal** - 미리보기 모달

### 1.2 강점

**데이터 관리 구조**
- React Query를 활용한 효율적인 서버 상태 관리
- 낙관적 업데이트 및 자동 리프레시 (window focus 이벤트)
- 명확한 로딩/에러/Empty 상태 처리

**사용성**
- 직관적인 CRUD 액션 (생성, 읽기, 수정, 삭제)
- 삭제 전 확인 다이얼로그
- Toast 알림을 통한 피드백

**국제화**
- next-intl을 통한 다국어 지원

**컴포넌트 구조**
- PageLayout을 통한 일관된 레이아웃
- shadcn-ui Table 컴포넌트 사용
- 모달을 통한 상세 정보 표시

### 1.3 약점 및 개선 필요 부분

#### 심각한 문제점

**1. 시각적 계층 구조 부족**
- 테이블이 페이지의 전부로, 시각적 관심을 끌 만한 요소가 없음
- 단조로운 배경색 (`#FCFCFD`)과 테두리만으로 구성
- claude.ai와 같은 프리미엄 SaaS는 데이터 관리 페이지도 시각적으로 풍부함

**2. 테이블 UI의 정보 밀도 부족**
- 한 행당 표시되는 정보가 너무 적음 (브랜드명, 타겟 오디언스, 톤앤매너 일부, 언어, 날짜)
- 중요한 정보(브랜드 설명, 전체 톤앤매너)는 모달을 열어야만 확인 가능
- 카드 형식을 혼용하면 더 많은 정보를 한눈에 볼 수 있음

**3. 액션 버튼의 접근성 문제**
- 아이콘만 표시되어 있어 처음 사용하는 사용자는 버튼 기능을 이해하기 어려움
- 호버 시 툴팁이나 레이블이 없음
- 삭제 버튼이 다른 버튼과 같은 크기/스타일로 실수 클릭 위험

**4. Empty State의 설득력 부족**
- "아직 스타일 가이드가 없습니다" 메시지만 있음
- 스타일 가이드를 만들어야 하는 이유나 혜택을 설명하지 않음
- 시각적 일러스트레이션이나 예시가 없음

**5. 필터링 및 정렬 기능 부재**
- 스타일 가이드가 많아지면 관리가 어려움
- 검색, 필터(언어, 톤), 정렬(날짜, 이름) 기능 없음
- 페이지네이션 없음 (현재는 전체 목록만 표시)

**6. 배치(Bulk) 액션 부재**
- 여러 스타일 가이드를 한 번에 삭제/복사할 수 없음
- 체크박스 선택 및 일괄 작업 기능 없음

**7. 모달의 정보 구조 개선 필요**
- 모달에 너무 많은 정보가 나열되어 있음
- 섹션 구분은 있지만 시각적 계층이 약함
- 중요한 정보와 덜 중요한 정보의 구분이 모호함

**8. 상태 표시 부족**
- 스타일 가이드가 "활성화" 또는 "비활성화" 상태를 가질 수 있는지 불명확
- 최근 사용한 스타일 가이드를 강조하거나 기본 가이드를 설정하는 기능 없음

**9. 애니메이션 전무**
- 페이지 전환, 테이블 로딩, 모달 열기 등 모든 인터랙션이 정적
- 로딩 스피너만 회전할 뿐, 데이터 진입 애니메이션 없음

**10. 반응형 디자인 미흡**
- 테이블이 모바일에서 가로 스크롤될 가능성이 높음
- 모바일에서는 카드 레이아웃으로 전환되어야 하지만 현재는 동일한 테이블 구조

**11. 하드코딩된 텍스트**
- 테이블 헤더가 하드코딩되어 있음 ("브랜드명", "타겟 오디언스" 등)
- i18n 키로 변환되어야 함

**12. 인라인 스타일 사용**
- `style={{ borderColor: "#E1E5EA" }}` 등 인라인 스타일 사용
- Tailwind CSS 유틸리티 클래스나 CSS 변수로 대체되어야 함

---

## 2. 개선된 페이지 구성

### 2.1 페이지 레이아웃 개선

**목적**: 데이터 관리 페이지를 시각적으로 풍부하고 사용하기 쉽게 만들기

**구조 변경**:

```
┌─────────────────────────────────────────────┐
│  Header (제목, 설명, 검색, 필터, 새로 만들기)  │
├─────────────────────────────────────────────┤
│  Stats Cards (총 개수, 최근 생성, 활성 개수)   │
├─────────────────────────────────────────────┤
│  View Toggle (Grid / Table)                 │
├─────────────────────────────────────────────┤
│  Content Area                               │
│  - Grid View: 카드 그리드                   │
│  - Table View: 개선된 테이블                │
├─────────────────────────────────────────────┤
│  Pagination (10개 이상일 때)                │
└─────────────────────────────────────────────┘
```

---

### 2.2 Header Section 개선

**현재**:
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1>스타일 가이드</h1>
    <p>서브타이틀</p>
  </div>
  <Button>새로 만들기</Button>
</div>
```

**개선안**:
```tsx
<div className="space-y-4">
  {/* Title & Description */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold">스타일 가이드 관리</h1>
      <p className="text-muted-foreground">
        브랜드 보이스와 톤을 정의하고 일관된 콘텐츠를 생성하세요
      </p>
    </div>
    <Button size="lg">
      <Plus className="mr-2 h-4 w-4" />
      새로 만들기
    </Button>
  </div>

  {/* Search & Filter Bar */}
  <div className="flex gap-4">
    <div className="flex-1">
      <Input
        placeholder="브랜드명으로 검색..."
        leftIcon={<Search />}
      />
    </div>
    <Select placeholder="언어">
      <option value="all">모든 언어</option>
      <option value="ko">한국어</option>
      <option value="en">English</option>
    </Select>
    <Select placeholder="톤">
      <option value="all">모든 톤</option>
      <option value="professional">전문적</option>
      <option value="friendly">친근한</option>
      <option value="inspirational">영감을 주는</option>
    </Select>
  </div>
</div>
```

---

### 2.3 Stats Cards Section (새로 추가)

**목적**: 한눈에 스타일 가이드 현황 파악

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Total Count */}
  <motion.div
    className="rounded-lg border bg-card p-6"
    whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">총 스타일 가이드</p>
        <p className="text-3xl font-bold">{guides.length}</p>
      </div>
      <FileText className="h-10 w-10 text-primary opacity-20" />
    </div>
  </motion.div>

  {/* Recently Created */}
  <motion.div
    className="rounded-lg border bg-card p-6"
    whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">최근 7일 생성</p>
        <p className="text-3xl font-bold">{recentCount}</p>
      </div>
      <Calendar className="h-10 w-10 text-primary opacity-20" />
    </div>
  </motion.div>

  {/* Active Guides */}
  <motion.div
    className="rounded-lg border bg-card p-6"
    whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">활성 가이드</p>
        <p className="text-3xl font-bold">{activeCount}</p>
      </div>
      <CheckCircle className="h-10 w-10 text-primary opacity-20" />
    </div>
  </motion.div>
</div>
```

---

### 2.4 View Toggle Section (새로 추가)

**목적**: 사용자가 Grid / Table 뷰를 선택할 수 있도록

```tsx
<div className="flex items-center justify-between">
  <p className="text-sm text-muted-foreground">
    {filteredGuides.length}개의 스타일 가이드
  </p>

  <div className="flex items-center gap-2">
    <Button
      variant={viewMode === "grid" ? "default" : "ghost"}
      size="sm"
      onClick={() => setViewMode("grid")}
    >
      <Grid3x3 className="h-4 w-4" />
    </Button>
    <Button
      variant={viewMode === "table" ? "default" : "ghost"}
      size="sm"
      onClick={() => setViewMode("table")}
    >
      <List className="h-4 w-4" />
    </Button>
  </div>
</div>
```

---

### 2.5 Grid View (새로 추가)

**목적**: 카드 형식으로 더 많은 정보를 시각적으로 표시

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {guides.map((guide, index) => (
    <motion.div
      key={guide.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
      className="rounded-lg border bg-card p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{guide.brandName}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {guide.brandDescription}
          </p>
        </div>
        {guide.isDefault && (
          <Badge variant="secondary">기본</Badge>
        )}
      </div>

      {/* Personality Tags */}
      <div className="flex flex-wrap gap-2">
        {guide.personality.slice(0, 3).map((trait) => (
          <Badge key={trait} variant="outline">
            {trait}
          </Badge>
        ))}
        {guide.personality.length > 3 && (
          <Badge variant="outline">+{guide.personality.length - 3}</Badge>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          {guide.language === "ko" ? "한국어" : "English"}
        </div>
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          {guide.targetAudience}
        </div>
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
          onClick={() => handlePreview(guide)}
        >
          <Eye className="mr-2 h-4 w-4" />
          미리보기
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={() => handleEdit(guide)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          수정
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(guide.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </motion.div>
  ))}
</div>
```

---

### 2.6 Table View 개선

**변경 사항**:
- 테이블 헤더 i18n 적용
- 호버 시 행 전체 강조
- 액션 버튼에 레이블 추가 (모바일에서는 아이콘만)
- 정렬 기능 추가

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>
        <button
          className="flex items-center gap-2 hover:text-foreground"
          onClick={() => handleSort("brandName")}
        >
          {t("styleGuide.table.brandName")}
          {sortBy === "brandName" && <ChevronDown className="h-4 w-4" />}
        </button>
      </TableHead>
      <TableHead>{t("styleGuide.table.targetAudience")}</TableHead>
      <TableHead>{t("styleGuide.table.personality")}</TableHead>
      <TableHead>
        <button
          className="flex items-center gap-2 hover:text-foreground"
          onClick={() => handleSort("language")}
        >
          {t("styleGuide.table.language")}
          {sortBy === "language" && <ChevronDown className="h-4 w-4" />}
        </button>
      </TableHead>
      <TableHead>
        <button
          className="flex items-center gap-2 hover:text-foreground"
          onClick={() => handleSort("createdAt")}
        >
          {t("styleGuide.table.createdAt")}
          {sortBy === "createdAt" && <ChevronDown className="h-4 w-4" />}
        </button>
      </TableHead>
      <TableHead className="text-right">
        {t("styleGuide.table.actions")}
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {guides.map((guide, index) => (
      <motion.tr
        key={guide.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="hover:bg-muted/50 transition-colors"
      >
        <TableCell className="font-medium">
          {guide.brandName}
          {guide.isDefault && (
            <Badge variant="secondary" className="ml-2">
              기본
            </Badge>
          )}
        </TableCell>
        <TableCell>{guide.targetAudience}</TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {guide.personality.slice(0, 2).map((trait) => (
              <Badge key={trait} variant="outline" className="text-xs">
                {trait}
              </Badge>
            ))}
            {guide.personality.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{guide.personality.length - 2}
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          {guide.language === "ko" ? "한국어" : "English"}
        </TableCell>
        <TableCell>
          {format(new Date(guide.createdAt), "PPP", { locale: ko })}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePreview(guide)}
            >
              <Eye className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">미리보기</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(guide)}
            >
              <Pencil className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">수정</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(guide.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </TableCell>
      </motion.tr>
    ))}
  </TableBody>
</Table>
```

---

### 2.7 Empty State 개선

**현재**:
```tsx
<div className="rounded-lg border border-dashed p-12 text-center">
  <p className="mb-4 text-muted-foreground">
    아직 스타일 가이드가 없습니다
  </p>
  <Button>스타일 가이드 만들기</Button>
</div>
```

**개선안**:
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  className="rounded-lg border border-dashed p-12 text-center space-y-6"
>
  {/* Illustration */}
  <div className="flex justify-center">
    <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center">
      <FileText className="w-24 h-24 text-primary opacity-20" />
    </div>
  </div>

  {/* Heading */}
  <div className="space-y-2">
    <h3 className="text-xl font-semibold">
      첫 번째 스타일 가이드를 만들어보세요
    </h3>
    <p className="text-muted-foreground max-w-md mx-auto">
      스타일 가이드를 설정하면 AI가 브랜드 보이스에 맞는 일관된 콘텐츠를
      생성합니다
    </p>
  </div>

  {/* Benefits */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
    <div className="flex flex-col items-center gap-2">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Zap className="w-6 h-6 text-primary" />
      </div>
      <p className="text-sm font-medium">5분 안에 설정</p>
    </div>
    <div className="flex flex-col items-center gap-2">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Target className="w-6 h-6 text-primary" />
      </div>
      <p className="text-sm font-medium">브랜드 일관성</p>
    </div>
    <div className="flex flex-col items-center gap-2">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <p className="text-sm font-medium">AI 자동 생성</p>
    </div>
  </div>

  {/* CTA */}
  <div>
    <Button size="lg" onClick={handleCreateNew}>
      <Plus className="mr-2 h-5 w-5" />
      스타일 가이드 만들기
    </Button>
  </div>
</motion.div>
```

---

### 2.8 Modal 개선

**변경 사항**:
- 더 명확한 정보 계층
- 시각적 구분 강화
- 액션 버튼 추가 (수정, 복사, 삭제)

```tsx
<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
  <DialogHeader>
    <div className="flex items-start justify-between">
      <div>
        <DialogTitle className="text-2xl">
          {guide.brandName}
        </DialogTitle>
        <DialogDescription className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            생성: {getFormattedDate(guide.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            수정: {getFormattedDate(guide.updatedAt)}
          </span>
        </DialogDescription>
      </div>
      {guide.isDefault && <Badge variant="secondary">기본</Badge>}
    </div>
  </DialogHeader>

  <div className="space-y-6 py-4">
    {/* Brand Info */}
    <Card>
      <CardHeader>
        <CardTitle>브랜드 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow
          icon={<Building className="h-4 w-4" />}
          label="브랜드 이름"
          value={guide.brandName}
        />
        <InfoRow
          icon={<FileText className="h-4 w-4" />}
          label="설명"
          value={guide.brandDescription}
        />
        <InfoRow
          icon={<Hash className="h-4 w-4" />}
          label="성격 특성"
          value={guide.personality.join(", ")}
        />
        <InfoRow
          icon={<Shield className="h-4 w-4" />}
          label="격식 수준"
          value={getFormalityLabel(guide.formality)}
        />
      </CardContent>
    </Card>

    {/* Target Audience */}
    <Card>
      <CardHeader>
        <CardTitle>타겟 독자</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow
          icon={<Users className="h-4 w-4" />}
          label="대상 독자"
          value={guide.targetAudience}
        />
        <InfoRow
          icon={<AlertCircle className="h-4 w-4" />}
          label="해결하려는 문제"
          value={guide.painPoints}
        />
      </CardContent>
    </Card>

    {/* Content Style */}
    <Card>
      <CardHeader>
        <CardTitle>콘텐츠 스타일</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow
          icon={<Globe className="h-4 w-4" />}
          label="언어"
          value={guide.language === "ko" ? "한국어" : "English"}
        />
        <InfoRow
          icon={<MessageSquare className="h-4 w-4" />}
          label="톤"
          value={getToneLabel(guide.tone)}
        />
        <InfoRow
          icon={<Type className="h-4 w-4" />}
          label="글 길이"
          value={getContentLengthLabel(guide.contentLength)}
        />
        <InfoRow
          icon={<BookOpen className="h-4 w-4" />}
          label="읽기 수준"
          value={getReadingLevelLabel(guide.readingLevel)}
        />
      </CardContent>
    </Card>

    {/* Notes */}
    {guide.notes && (
      <Card>
        <CardHeader>
          <CardTitle>추가 메모</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {guide.notes}
          </p>
        </CardContent>
      </Card>
    )}
  </div>

  <DialogFooter className="flex flex-col sm:flex-row gap-2">
    <Button
      variant="outline"
      onClick={() => handleEdit(guide)}
      className="flex-1"
    >
      <Pencil className="mr-2 h-4 w-4" />
      수정하기
    </Button>
    <Button
      variant="outline"
      onClick={() => handleDuplicate(guide)}
      className="flex-1"
    >
      <Copy className="mr-2 h-4 w-4" />
      복사하기
    </Button>
    <Button variant="outline" onClick={onClose} className="flex-1">
      <X className="mr-2 h-4 w-4" />
      닫기
    </Button>
  </DialogFooter>
</DialogContent>
```

---

## 3. UI 디자인 컨셉

### 3.1 컬러 시스템

현재 프로젝트의 Tailwind CSS 컬러 시스템을 활용합니다:

```typescript
const colors = {
  // Primary (from tailwind.config.ts)
  primary: "hsl(var(--primary))",
  primaryForeground: "hsl(var(--primary-foreground))",

  // Secondary
  secondary: "hsl(var(--secondary))",
  secondaryForeground: "hsl(var(--secondary-foreground))",

  // Accent
  accent: "hsl(var(--accent))",
  accentForeground: "hsl(var(--accent-foreground))",

  // Background
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",

  // Card
  card: "hsl(var(--card))",
  cardForeground: "hsl(var(--card-foreground))",

  // Muted
  muted: "hsl(var(--muted))",
  mutedForeground: "hsl(var(--muted-foreground))",

  // Border
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",

  // Ring (focus)
  ring: "hsl(var(--ring))",

  // Destructive
  destructive: "hsl(var(--destructive))",
  destructiveForeground: "hsl(var(--destructive-foreground))",
};
```

**사용 전략**:
- **Primary**: CTA 버튼, 선택된 뷰 토글, 아이콘 강조
- **Secondary**: Badge 배경, 보조 버튼
- **Accent**: 호버 효과, 특별 강조
- **Muted**: 서브텍스트, 아이콘, 보조 정보
- **Border**: 카드 테두리, 구분선
- **Destructive**: 삭제 버튼 텍스트

---

### 3.2 타이포그래피

```typescript
const typography = {
  // Page Title
  pageTitle: "text-3xl font-bold tracking-tight",

  // Page Description
  pageDescription: "text-base text-muted-foreground",

  // Card Title
  cardTitle: "text-lg font-semibold",

  // Card Description
  cardDescription: "text-sm text-muted-foreground",

  // Stat Number
  statNumber: "text-3xl font-bold",

  // Stat Label
  statLabel: "text-sm text-muted-foreground",

  // Table Header
  tableHeader: "text-sm font-medium",

  // Table Cell
  tableCell: "text-sm",

  // Badge
  badge: "text-xs font-medium",

  // Button Label
  buttonLabel: "text-sm font-medium",
};
```

**폰트**: Pretendard Variable (현재 프로젝트 설정 유지)

---

### 3.3 간격 시스템

```typescript
const spacing = {
  // Page Container
  pageContainer: "px-4 py-8",

  // Section Gap
  sectionGap: "space-y-6",

  // Card Padding
  cardPadding: "p-6",

  // Card Gap (Grid)
  cardGap: "gap-6",

  // Stack Gap (Vertical)
  stackSm: "space-y-2",
  stackMd: "space-y-4",
  stackLg: "space-y-6",

  // Inline Gap (Horizontal)
  inlineSm: "gap-2",
  inlineMd: "gap-4",
  inlineLg: "gap-6",
};
```

---

### 3.4 카드 스타일

```typescript
const cardStyles = {
  // Base Card (Stats, Grid Item)
  base: "rounded-lg border bg-card p-6 transition-all duration-300",

  // Hover Card
  hover: "rounded-lg border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",

  // Outlined Card (Empty State)
  outlined: "rounded-lg border border-dashed bg-transparent p-12",
};
```

---

### 3.5 반응형 디자인

```typescript
const responsive = {
  // Stats Cards
  statsGrid: "grid grid-cols-1 md:grid-cols-3 gap-6",

  // Guide Cards (Grid View)
  guideGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",

  // Search & Filter
  filterBar: "flex flex-col md:flex-row gap-4",

  // Table Actions (모바일에서는 아이콘만)
  tableActions: "flex justify-end gap-2",
  actionButton: "h-4 w-4 md:mr-2",
  actionLabel: "hidden md:inline",
};
```

---

## 4. 섹션별 컴포넌트 명세

### 4.1 StyleGuidePage Component

**파일**: `src/app/[locale]/(protected)/style-guide/page.tsx`

**Props**:
```typescript
type StyleGuidePageProps = {
  params: Promise<Record<string, never>>;
};
```

**State**:
```typescript
// View Mode
const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

// Search & Filter
const [searchQuery, setSearchQuery] = useState("");
const [languageFilter, setLanguageFilter] = useState<"all" | "ko" | "en">("all");
const [toneFilter, setToneFilter] = useState<"all" | string>("all");

// Sort
const [sortBy, setSortBy] = useState<"createdAt" | "brandName" | "language">("createdAt");
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

// Preview Modal
const [previewGuide, setPreviewGuide] = useState<StyleGuideResponse | null>(null);
const [isPreviewOpen, setIsPreviewOpen] = useState(false);
```

**하위 컴포넌트**:
- `PageHeader`: 제목, 설명, 새로 만들기 버튼
- `SearchFilterBar`: 검색, 언어 필터, 톤 필터
- `StatsCards`: 통계 카드 그리드
- `ViewToggle`: Grid/Table 뷰 토글
- `StyleGuideGrid`: 카드 그리드 뷰
- `StyleGuideTable`: 테이블 뷰
- `StyleGuidePreviewModal`: 미리보기 모달
- `EmptyState`: Empty 상태
- `LoadingState`: 로딩 상태
- `ErrorState`: 에러 상태

---

### 4.2 PageHeader Component

**파일**: `src/features/style-guide/components/page-header.tsx`

**Props**:
```typescript
interface PageHeaderProps {
  title: string;
  description: string;
  onCreateNew: () => void;
}
```

**렌더링**:
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
    <p className="text-base text-muted-foreground mt-2">{description}</p>
  </div>
  <Button size="lg" onClick={onCreateNew}>
    <Plus className="mr-2 h-4 w-4" />
    새로 만들기
  </Button>
</div>
```

---

### 4.3 SearchFilterBar Component

**파일**: `src/features/style-guide/components/search-filter-bar.tsx`

**Props**:
```typescript
interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  languageFilter: "all" | "ko" | "en";
  onLanguageChange: (language: "all" | "ko" | "en") => void;
  toneFilter: "all" | string;
  onToneChange: (tone: string) => void;
}
```

**렌더링**:
```tsx
<div className="flex flex-col md:flex-row gap-4">
  {/* Search */}
  <div className="flex-1">
    <Input
      placeholder="브랜드명으로 검색..."
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      leftIcon={<Search className="h-4 w-4" />}
    />
  </div>

  {/* Language Filter */}
  <Select value={languageFilter} onValueChange={onLanguageChange}>
    <SelectTrigger className="w-full md:w-40">
      <SelectValue placeholder="언어" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">모든 언어</SelectItem>
      <SelectItem value="ko">한국어</SelectItem>
      <SelectItem value="en">English</SelectItem>
    </SelectContent>
  </Select>

  {/* Tone Filter */}
  <Select value={toneFilter} onValueChange={onToneChange}>
    <SelectTrigger className="w-full md:w-40">
      <SelectValue placeholder="톤" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">모든 톤</SelectItem>
      <SelectItem value="professional">전문적</SelectItem>
      <SelectItem value="friendly">친근한</SelectItem>
      <SelectItem value="inspirational">영감을 주는</SelectItem>
      <SelectItem value="educational">교육적</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

### 4.4 StatsCards Component

**파일**: `src/features/style-guide/components/stats-cards.tsx`

**Props**:
```typescript
interface StatsCardsProps {
  totalCount: number;
  recentCount: number;
  activeCount: number;
}
```

**렌더링**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <StatCard
    icon={<FileText />}
    label="총 스타일 가이드"
    value={totalCount}
  />
  <StatCard
    icon={<Calendar />}
    label="최근 7일 생성"
    value={recentCount}
  />
  <StatCard
    icon={<CheckCircle />}
    label="활성 가이드"
    value={activeCount}
  />
</div>
```

---

### 4.5 ViewToggle Component

**파일**: `src/features/style-guide/components/view-toggle.tsx`

**Props**:
```typescript
interface ViewToggleProps {
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  totalCount: number;
}
```

**렌더링**:
```tsx
<div className="flex items-center justify-between">
  <p className="text-sm text-muted-foreground">
    {totalCount}개의 스타일 가이드
  </p>

  <div className="flex items-center gap-2">
    <Button
      variant={viewMode === "grid" ? "default" : "ghost"}
      size="sm"
      onClick={() => onViewModeChange("grid")}
    >
      <Grid3x3 className="h-4 w-4" />
    </Button>
    <Button
      variant={viewMode === "table" ? "default" : "ghost"}
      size="sm"
      onClick={() => onViewModeChange("table")}
    >
      <List className="h-4 w-4" />
    </Button>
  </div>
</div>
```

---

### 4.6 StyleGuideGrid Component

**파일**: `src/features/style-guide/components/style-guide-grid.tsx`

**Props**:
```typescript
interface StyleGuideGridProps {
  guides: StyleGuideResponse[];
  onPreview: (guide: StyleGuideResponse) => void;
  onEdit: (guide: StyleGuideResponse) => void;
  onDelete: (id: string) => void;
}
```

**렌더링**: (위의 2.5 Grid View 참조)

---

### 4.7 StyleGuideTable Component

**파일**: `src/features/style-guide/components/style-guide-table.tsx`

**Props**:
```typescript
interface StyleGuideTableProps {
  guides: StyleGuideResponse[];
  sortBy: "createdAt" | "brandName" | "language";
  sortOrder: "asc" | "desc";
  onSort: (field: "createdAt" | "brandName" | "language") => void;
  onPreview: (guide: StyleGuideResponse) => void;
  onEdit: (guide: StyleGuideResponse) => void;
  onDelete: (id: string) => void;
}
```

**렌더링**: (위의 2.6 Table View 개선 참조)

---

### 4.8 EmptyState Component

**파일**: `src/features/style-guide/components/empty-state.tsx`

**Props**:
```typescript
interface EmptyStateProps {
  onCreateNew: () => void;
}
```

**렌더링**: (위의 2.7 Empty State 개선 참조)

---

## 5. 애니메이션 명세

### 5.1 페이지 진입 애니메이션

```typescript
// Page Container
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Section (순차적 진입)
const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Usage
<motion.div variants={pageVariants} initial="initial" animate="animate">
  <motion.div variants={sectionVariants}>
    <PageHeader />
  </motion.div>
  <motion.div variants={sectionVariants}>
    <SearchFilterBar />
  </motion.div>
  <motion.div variants={sectionVariants}>
    <StatsCards />
  </motion.div>
  {/* ... */}
</motion.div>
```

---

### 5.2 Stats Cards 애니메이션

```typescript
// Stats Card Hover
const statCardVariants = {
  rest: { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  hover: {
    y: -4,
    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Counter Animation (react-countup)
import CountUp from "react-countup";

<CountUp start={0} end={totalCount} duration={1.5} />
```

---

### 5.3 Grid Card 애니메이션

```typescript
// Grid Item (Stagger)
const gridItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

// Hover Effect
const cardHoverVariants = {
  rest: { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  hover: {
    y: -4,
    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.3,
    },
  },
};

// Usage
{guides.map((guide, index) => (
  <motion.div
    key={guide.id}
    custom={index}
    variants={gridItemVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
  >
    {/* Card content */}
  </motion.div>
))}
```

---

### 5.4 Table Row 애니메이션

```typescript
// Table Row (Stagger)
const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

// Usage
{guides.map((guide, index) => (
  <motion.tr
    key={guide.id}
    custom={index}
    variants={tableRowVariants}
    initial="hidden"
    animate="visible"
    className="hover:bg-muted/50 transition-colors"
  >
    {/* Table cells */}
  </motion.tr>
))}
```

---

### 5.5 Modal 애니메이션

```typescript
// Modal Overlay
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

// Modal Content
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

// Usage with AnimatePresence
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/50"
      />
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 flex items-center justify-center"
      >
        <DialogContent>{/* Modal content */}</DialogContent>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

---

### 5.6 Empty State 애니메이션

```typescript
// Empty State Container
const emptyStateVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Illustration (Pulse)
const illustrationVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Usage
<motion.div
  variants={emptyStateVariants}
  initial="initial"
  animate="animate"
>
  <motion.div variants={illustrationVariants} animate="animate">
    {/* Illustration */}
  </motion.div>
</motion.div>
```

---

### 5.7 Loading State 애니메이션

```typescript
// Loading Skeleton (현재 Loader2 스피너 대체)
const skeletonVariants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

// Grid Skeleton
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {[1, 2, 3, 4, 5, 6].map((i) => (
    <motion.div
      key={i}
      variants={skeletonVariants}
      initial="initial"
      animate="animate"
      className="rounded-lg border bg-card p-6 space-y-4"
    >
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </motion.div>
  ))}
</div>
```

---

### 5.8 Button 애니메이션

```typescript
// Primary Button (CTA)
const buttonVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: { scale: 0.95 },
};

// Usage
<motion.button
  variants={buttonVariants}
  initial="rest"
  whileHover="hover"
  whileTap="tap"
>
  <Button>새로 만들기</Button>
</motion.button>
```

---

### 5.9 View Toggle 애니메이션

```typescript
// View Mode Transition
const viewTransitionVariants = {
  grid: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  table: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};

// Usage with AnimatePresence
<AnimatePresence mode="wait">
  {viewMode === "grid" ? (
    <motion.div
      key="grid"
      variants={viewTransitionVariants}
      initial="exit"
      animate="grid"
      exit="exit"
    >
      <StyleGuideGrid />
    </motion.div>
  ) : (
    <motion.div
      key="table"
      variants={viewTransitionVariants}
      initial="exit"
      animate="table"
      exit="exit"
    >
      <StyleGuideTable />
    </motion.div>
  )}
</AnimatePresence>
```

---

### 5.10 성능 최적화

**Reduce Motion 대응**:
```typescript
import { useReducedMotion } from "framer-motion";

const shouldReduceMotion = useReducedMotion();

const variants = shouldReduceMotion
  ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    }
  : {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
      },
    };
```

**Will-Change 최적화**:
```tsx
<motion.div
  style={{ willChange: "transform, opacity" }}
  onAnimationComplete={() => {
    // Remove will-change after animation
  }}
>
```

---

## 6. 데이터 흐름 및 상태 관리

### 6.1 React Query 훅 활용

**현재 훅**:
- `useListStyleGuides()`: 스타일 가이드 목록 조회
- `useDeleteStyleGuide()`: 스타일 가이드 삭제

**추가 필요 훅**:
- `useDuplicateStyleGuide()`: 스타일 가이드 복사
- `useSetDefaultStyleGuide()`: 기본 가이드 설정

---

### 6.2 로컬 상태 관리

```typescript
// View Mode (localStorage 저장)
const [viewMode, setViewMode] = useLocalStorage<"grid" | "table">(
  "styleGuideViewMode",
  "grid"
);

// Search & Filter
const [searchQuery, setSearchQuery] = useState("");
const [languageFilter, setLanguageFilter] = useState<"all" | "ko" | "en">("all");
const [toneFilter, setToneFilter] = useState<"all" | string>("all");

// Sort
const [sortBy, setSortBy] = useState<"createdAt" | "brandName" | "language">(
  "createdAt"
);
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
```

---

### 6.3 필터링 로직

```typescript
const filteredGuides = useMemo(() => {
  let result = guides;

  // Search
  if (searchQuery) {
    result = result.filter((guide) =>
      guide.brandName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Language Filter
  if (languageFilter !== "all") {
    result = result.filter((guide) => guide.language === languageFilter);
  }

  // Tone Filter
  if (toneFilter !== "all") {
    result = result.filter((guide) => guide.tone === toneFilter);
  }

  // Sort
  result = result.sort((a, b) => {
    if (sortBy === "createdAt") {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortBy === "brandName") {
      return sortOrder === "asc"
        ? a.brandName.localeCompare(b.brandName)
        : b.brandName.localeCompare(a.brandName);
    } else {
      return sortOrder === "asc"
        ? a.language.localeCompare(b.language)
        : b.language.localeCompare(a.language);
    }
  });

  return result;
}, [guides, searchQuery, languageFilter, toneFilter, sortBy, sortOrder]);
```

---

### 6.4 통계 계산

```typescript
const stats = useMemo(() => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    totalCount: guides.length,
    recentCount: guides.filter(
      (guide) => new Date(guide.createdAt) > sevenDaysAgo
    ).length,
    activeCount: guides.filter((guide) => guide.isDefault).length,
  };
}, [guides]);
```

---

## 7. 접근성 (Accessibility) 개선

### 7.1 키보드 네비게이션

- **Tab 순서**: 새로 만들기 → 검색 → 필터 → 뷰 토글 → 카드/테이블 → 액션 버튼
- **Enter/Space**: 버튼 활성화
- **Arrow Keys**: 테이블 행 간 이동

### 7.2 Screen Reader 지원

```tsx
// Button with aria-label
<Button
  aria-label="스타일 가이드 미리보기"
  onClick={() => handlePreview(guide)}
>
  <Eye className="h-4 w-4" />
</Button>

// Table with caption
<Table>
  <caption className="sr-only">스타일 가이드 목록</caption>
  {/* ... */}
</Table>

// Live Region for search results
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {filteredGuides.length}개의 결과가 검색되었습니다
</div>
```

### 7.3 Focus 관리

```tsx
// Modal 열릴 때 focus trap
import { useFocusTrap } from "@/hooks/use-focus-trap";

const modalRef = useFocusTrap(isOpen);

<DialogContent ref={modalRef}>
  {/* Modal content */}
</DialogContent>
```

---

## 8. 다국어 지원 (i18n)

### 8.1 필요한 번역 키

**messages/ko.json**:
```json
{
  "styleGuide": {
    "title": "스타일 가이드 관리",
    "subtitle": "브랜드 보이스와 톤을 정의하고 일관된 콘텐츠를 생성하세요",
    "createNew": "새로 만들기",
    "search": {
      "placeholder": "브랜드명으로 검색..."
    },
    "filter": {
      "language": {
        "label": "언어",
        "all": "모든 언어",
        "ko": "한국어",
        "en": "English"
      },
      "tone": {
        "label": "톤",
        "all": "모든 톤",
        "professional": "전문적",
        "friendly": "친근한",
        "inspirational": "영감을 주는",
        "educational": "교육적"
      }
    },
    "stats": {
      "total": "총 스타일 가이드",
      "recent": "최근 7일 생성",
      "active": "활성 가이드"
    },
    "viewToggle": {
      "grid": "그리드 뷰",
      "table": "테이블 뷰",
      "count": "{count}개의 스타일 가이드"
    },
    "table": {
      "brandName": "브랜드명",
      "targetAudience": "타겟 오디언스",
      "personality": "톤앤매너",
      "language": "언어",
      "createdAt": "생성일",
      "actions": "작업"
    },
    "actions": {
      "preview": "미리보기",
      "edit": "수정",
      "delete": "삭제",
      "duplicate": "복사"
    },
    "empty": {
      "title": "첫 번째 스타일 가이드를 만들어보세요",
      "description": "스타일 가이드를 설정하면 AI가 브랜드 보이스에 맞는 일관된 콘텐츠를 생성합니다",
      "benefit1": "5분 안에 설정",
      "benefit2": "브랜드 일관성",
      "benefit3": "AI 자동 생성",
      "cta": "스타일 가이드 만들기"
    },
    "loading": "로딩 중...",
    "error": {
      "load": "스타일 가이드를 불러올 수 없습니다",
      "retry": "다시 시도"
    },
    "delete": {
      "confirm": "정말 삭제하시겠습니까?",
      "success": {
        "title": "삭제 완료",
        "desc": "스타일 가이드가 삭제되었습니다"
      },
      "error": {
        "title": "삭제 실패",
        "desc": "스타일 가이드를 삭제할 수 없습니다"
      }
    }
  }
}
```

---

## 9. 구현 우선순위

### Phase 1: 필수 개선 (High Impact, High Urgency)

1. **Grid View 추가** (카드 형식으로 더 많은 정보 표시)
2. **Stats Cards 추가** (총 개수, 최근 생성, 활성 가이드)
3. **Empty State 개선** (일러스트, 혜택 설명, 강력한 CTA)
4. **애니메이션 적용** (진입, 호버, 전환)
5. **i18n 적용** (하드코딩된 텍스트 제거)

### Phase 2: 중요 개선 (High Impact, Medium Urgency)

6. **Search & Filter 추가** (검색, 언어, 톤 필터)
7. **View Toggle 추가** (Grid/Table 전환)
8. **Table 개선** (정렬, 호버, 레이블 추가)
9. **Modal 개선** (Card 레이아웃, 액션 버튼)
10. **접근성 개선** (aria-label, focus trap, 키보드 네비게이션)

### Phase 3: 부가 개선 (Medium Impact, Low Urgency)

11. **Pagination 추가** (10개 이상일 때)
12. **Batch Actions** (일괄 삭제, 복사)
13. **Default Guide 설정** (기본 가이드 지정)
14. **Duplicate Guide** (가이드 복사 기능)
15. **로딩 Skeleton** (Loader2 대신 Skeleton UI)

---

## 10. 성공 지표

### 디자인 품질
- [ ] claude.ai 수준의 시각적 완성도
- [ ] 일관된 컬러/타이포그래피 시스템
- [ ] 부드럽고 성능 최적화된 애니메이션
- [ ] Grid/Table 두 가지 뷰 옵션

### 사용자 경험
- [ ] 명확한 정보 계층 구조
- [ ] 검색 및 필터링으로 쉬운 데이터 관리
- [ ] Empty State에서 명확한 가치 제안
- [ ] 모바일 최적화 (카드 레이아웃)

### 기술 구현
- [ ] 접근성 준수 (WCAG 2.1 AA)
- [ ] 다국어 지원 (next-intl)
- [ ] 성능 최적화 (React Query 캐싱, 애니메이션 최적화)
- [ ] 반응형 디자인 (모바일, 태블릿, 데스크톱)

### 기능 완성도
- [ ] CRUD 모든 기능 동작
- [ ] 검색, 필터, 정렬 기능
- [ ] Grid/Table 뷰 전환
- [ ] 통계 대시보드

---

## 11. 참고 레퍼런스

### 11.1 유사 SaaS 제품 데이터 관리 페이지

**Notion - Workspace 페이지**:
- Grid/List 뷰 전환
- 검색 및 필터
- 카드 기반 레이아웃
- 부드러운 애니메이션

**Linear - Issues 페이지**:
- 강력한 필터링 시스템
- 테이블 정렬
- 키보드 단축키
- 빠른 액션 버튼

**Figma - Files 페이지**:
- 썸네일 기반 그리드
- 검색 및 태그 필터
- 최근 파일 표시
- Drag & Drop

---

## 12. 다음 단계

이 분석 보고서를 바탕으로 다음 단계를 진행하세요:

1. **우선순위 확정**: Phase 1 항목부터 순차적으로 구현
2. **컴포넌트 분리**: 섹션별로 컴포넌트 생성
3. **애니메이션 적용**: framer-motion으로 점진적으로 추가
4. **i18n 메시지 추가**: messages/ko.json, messages/en.json 업데이트
5. **접근성 테스트**: 키보드 네비게이션, Screen Reader 테스트
6. **반응형 테스트**: 모바일, 태블릿, 데스크톱 레이아웃 확인
7. **성능 최적화**: React Query 캐싱, 애니메이션 성능 측정

---

**작성일**: 2025-11-16
**작성자**: Claude (Senior UX/UI Designer & Frontend Architect)
**버전**: 1.0
