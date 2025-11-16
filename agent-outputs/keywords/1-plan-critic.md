# Keywords 페이지 개선안 검토 및 개선

## 1. 원안 요약

0-explore.md에서 제안된 주요 내용:

- **Hero Section**: 메트릭 카드 3개 (총 키워드, 이번 주 추가, AI 추천) + 그라데이션 배경
- **Filter Section**: 검색, 소스 필터, 정렬 필터, 활성 필터 표시
- **Keywords Table**: 아이콘, 메트릭 진행 바, 편집/삭제/복사 액션
- **Empty State**: 애니메이션 포함 빈 상태 디자인
- **Pagination**: 페이지 번호 직접 선택 가능
- **애니메이션**: framer-motion 기반 페이지 진입, stagger, 호버 효과
- **구현 우선순위**: Phase 1~4로 나누어 총 23시간 예상

---

## 2. 비판적 검토

### 2.1 사용자 경험 (UX)

#### 문제점

1. **Hero Section의 메트릭 카드가 실질적 가치를 제공하지 못함**
   - "총 키워드 수", "이번 주 추가", "AI 추천" 메트릭은 **단순 숫자 나열**에 불과
   - 사용자가 이 정보로 어떤 의사결정을 할 수 있는가? **불명확**
   - Claude.ai는 랜딩 페이지에서 Hero를 사용하지만, **대시보드 페이지에는 Hero Section이 과도**
   - 공간 낭비: Hero Section이 화면의 30% 이상을 차지하여 **실제 콘텐츠(테이블)가 스크롤 밖으로 밀림**

2. **필터 섹션이 과도하게 복잡함**
   - 소스 필터 (전체/수동/AI)는 유용하지만, **정렬 필터가 3가지나 필요한가?**
   - "검색량순" 정렬: 현재 데이터에 `metrics.searchVolume`이 **optional**이므로 정렬 불가능
   - "활성 필터 표시 + 초기화" UI는 필터가 2~3개일 때는 **오히려 복잡도 증가**

3. **메트릭 진행 바가 잘못된 데이터 시각화**
   - 검색량(searchVolume)은 절대값이므로 진행 바로 표시하면 **기준이 없어 무의미**
   - 경쟁도(competition)는 3단계(low/medium/high)이므로 **배지가 더 적합**
   - 원안은 메트릭을 "진행 바"로 표시하자고 제안했으나, 구현 예시에서는 **배지를 사용**하여 자기모순

4. **편집 기능의 필요성 의문**
   - 키워드는 단순 문자열이므로 **편집보다는 삭제 후 재생성이 더 직관적**
   - Edit Dialog를 만들면 validation, 중복 체크 등 **복잡도만 증가**
   - 우선순위를 높게 잡았으나, 실제로는 **Low Priority에 가까움**

5. **모바일 카드 뷰가 누락됨**
   - 원안에서 "모바일 최적화 - 카드 뷰" 언급했으나 **구체적 명세가 없음**
   - Phase 3 (Low Priority)로 미뤄졌으나, 모바일 사용자가 많다면 **High Priority**

#### 개선안

1. **Hero Section 제거 또는 간소화**
   - **옵션 A (권장)**: Hero Section을 완전히 제거하고 PageHeader만 유지
     - 제목 + 설명 + 액션 버튼(키워드 추가, AI 추천)만 표시
     - 메트릭 카드는 제거 (테이블 상단에 "총 50개" 정도만 표시)
   - **옵션 B**: Hero Section을 유지하되 메트릭을 **실행 가능한 인사이트**로 변경
     - "검색량 상위 키워드 5개"
     - "최근 7일간 추가된 키워드"
     - 단, 이 경우 추가 API 호출 필요 → 성능 이슈

2. **필터 섹션 단순화**
   - 검색 + 소스 필터만 유지 (정렬은 테이블 헤더 클릭으로 처리)
   - "활성 필터 표시" UI 제거 (필터가 2개뿐이므로 불필요)
   - 검색 input에 debounce 유지 (현재 잘 구현됨)

3. **메트릭 표시 방법 변경**
   - 검색량: 숫자만 표시 (`1,234 검색`)
   - 경쟁도: 배지로 표시 (색상 코딩: 초록/노랑/빨강)
   - 진행 바는 **사용하지 않음**

4. **편집 기능을 Phase 3로 이동**
   - Phase 1에서는 **삭제 기능만 구현**
   - 편집은 사용자 피드백 후 필요성 재검토

5. **모바일 카드 뷰를 Phase 2로 상향**
   - 테이블은 모바일에서 UX가 나쁘므로 **우선순위 상향 필요**

---

### 2.2 메시징 전략

#### 문제점

1. **Hero Section의 메시지가 불명확**
   - "키워드 관리" 제목은 너무 일반적
   - "키워드 설명"이라는 placeholder 텍스트는 **실제 가치 제안이 없음**

2. **Empty State의 메시지가 너무 김**
   - "첫 키워드를 직접 추가하거나, AI의 도움을 받아 연관 검색어를 추천받아보세요. 효과적인 키워드 전략으로 콘텐츠를 최적화하세요."
   - 3문장은 과도함. Claude.ai는 **1~2문장으로 간결하게 처리**

3. **CTA 버튼의 라벨이 애매함**
   - "AI 추천 받기" vs "키워드 추가": 어느 것이 Primary인지 불명확
   - 원안에서는 "키워드 추가"를 Primary로 했으나, AI 추천이 더 강력한 기능이므로 **위계 재고 필요**

#### 개선안

1. **PageHeader 메시지 명확화**
   ```tsx
   title: "키워드 관리"
   description: "블로그 콘텐츠 최적화를 위한 키워드를 관리하고 AI 추천을 받으세요."
   ```

2. **Empty State 메시지 간소화**
   ```tsx
   title: "아직 키워드가 없습니다"
   description: "첫 키워드를 추가하거나 AI 추천을 받아보세요."
   ```

3. **CTA 버튼 위계 재검토**
   - **옵션 A**: "키워드 추가" Primary, "AI 추천" Secondary (현재 원안)
   - **옵션 B (권장)**: "AI 추천" Primary, "키워드 추가" Secondary
     - AI 추천이 더 강력한 기능이고, 사용자에게 **더 높은 가치 제공**
     - 단, 사용자가 수동 추가를 선호한다면 A 선택

---

### 2.3 시각적 디자인

#### 문제점

1. **그라데이션 배경이 과도함**
   - `bg-gradient-to-br from-violet-50/50 via-white to-blue-50/50`
   - Claude.ai는 랜딩 페이지에서만 그라데이션 사용, **대시보드는 깔끔한 흰 배경**
   - 보라색 + 파란색 조합이 **브랜드 아이덴티티와 맞는지 불명확**

2. **메트릭 카드의 아이콘 배경이 너무 화려함**
   - `bg-violet-100`, `bg-green-100`, `bg-blue-100`
   - 3가지 색상이 섞여 **일관성 부족**
   - Claude.ai는 단일 브랜드 컬러 사용

3. **테이블 아이콘이 불필요**
   - 각 키워드 행에 `<Hash>` 아이콘 추가
   - 키워드가 50개면 아이콘도 50개 → **시각적 노이즈**
   - 아이콘은 **기능적 의미**가 있을 때만 사용해야 함

4. **타이포그래피 크기가 과도함**
   - 페이지 제목: `text-4xl` (36px) → 대시보드에는 너무 큼
   - Claude.ai는 `text-2xl` (24px) 정도 사용

5. **다크모드 고려사항이 불완전함**
   - "먼저 라이트 모드 완성 후 다크모드 추가"라고 했지만
   - **다크모드를 고려하지 않은 컬러 시스템은 나중에 리팩토링 필수**
   - 처음부터 CSS 변수 또는 Tailwind의 `dark:` prefix 사용 권장

#### 개선안

1. **그라데이션 배경 제거**
   - PageHeader는 깔끔한 흰 배경 (`bg-white`)
   - 테두리 없이 간결하게 처리

2. **메트릭 카드 디자인 단순화** (Hero Section을 유지한다면)
   - 아이콘 배경을 단일 색상으로 통일 (`bg-violet-100`)
   - 또는 아이콘을 제거하고 숫자만 크게 표시

3. **테이블 아이콘 제거**
   - 키워드 이름은 텍스트만 표시
   - 아이콘은 액션(편집/삭제) 버튼에만 사용

4. **타이포그래피 크기 조정**
   ```tsx
   // 페이지 제목
   <h1 className="text-2xl font-bold text-gray-900">

   // 섹션 제목
   <h2 className="text-xl font-semibold text-gray-800">

   // 본문
   <p className="text-sm text-gray-600">
   ```

5. **다크모드를 처음부터 고려**
   - 모든 컬러에 `dark:` prefix 추가
   ```tsx
   <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
   ```

---

### 2.4 기술적 실현 가능성

#### 문제점

1. **framer-motion 의존성이 과도함**
   - 페이지 진입, 리스트 아이템, 카드 호버, EmptyState 등 **모든 곳에 애니메이션**
   - framer-motion은 번들 크기가 크고 (70KB+), 과도한 사용 시 **성능 저하**
   - Claude.ai는 CSS transition으로도 충분히 우아한 애니메이션 구현

2. **stagger 애니메이션의 성능 이슈**
   - 리스트 아이템 20개에 각각 `delay: index * 0.05` 적용
   - 첫 아이템: 0ms, 마지막 아이템: 950ms → **사용자가 1초 기다려야 함**
   - 테이블 데이터는 **즉시 보여야 하는 정보**이므로 애니메이션 불필요

3. **메트릭 데이터가 optional인데 UI에서 필수로 가정**
   - `metrics?: { searchVolume?: number; competition?: 'low' | 'medium' | 'high' }`
   - 현재 백엔드에서 메트릭 데이터를 제공하지 않는다면 **UI가 비어 보임**
   - 백엔드 구현이 선행되어야 하는데 원안에서는 언급 없음

4. **i18n이 date-fns locale에서만 적용됨**
   - `formatDistanceToNow(new Date(), { locale: ko })`
   - 하드코딩된 `ko` → **다국어 지원 불완전**
   - `useLocale()` 훅 사용 권장했으나 실제 구현 예시는 없음

5. **편집/삭제 API 명세가 없음**
   - "편집/삭제 기능 구현 (2시간)"이라고 했지만
   - **백엔드 라우트가 구현되어 있는지 확인 필요**
   - `src/features/keywords/backend/route.ts`에 PATCH, DELETE 엔드포인트 필요

6. **일괄 삭제 기능의 트랜잭션 처리 미흡**
   - Phase 3에서 "일괄 삭제" 제안했으나
   - **부분 실패 시 처리 방안 없음** (10개 중 5개 실패 시?)
   - Supabase의 트랜잭션 한계 고려 필요

#### 개선안

1. **애니메이션 최소화**
   - framer-motion은 **EmptyState와 모달**에만 사용
   - 나머지는 CSS transition으로 처리
   ```tsx
   // ❌ framer-motion (과도)
   <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

   // ✅ CSS transition (충분)
   <tr className="transition-colors hover:bg-gray-50">
   ```

2. **stagger 애니메이션 제거**
   - 테이블 행은 **즉시 렌더링**
   - 페이지 진입 애니메이션만 최소한으로 적용 (fade-in 200ms)

3. **메트릭 데이터 백엔드 확인**
   - **먼저** `src/features/keywords/backend/service.ts` 확인
   - 메트릭이 없다면 **Phase 4로 미루거나 제거**
   - UI는 메트릭이 없어도 동작하도록 설계

4. **i18n 완전히 적용**
   ```tsx
   import { useLocale } from 'next-intl';
   import { ko, en } from 'date-fns/locale';

   const locale = useLocale();
   const dateLocale = locale === 'ko' ? ko : en;

   formatDistanceToNow(new Date(), { locale: dateLocale });
   ```

5. **편집/삭제 API 먼저 구현**
   - Phase 1에서 UI 작업 전에 **백엔드 확인 필수**
   - 없다면 먼저 `route.ts`, `service.ts`, `schema.ts` 작성

6. **일괄 삭제는 Phase 4로 이동**
   - 트랜잭션 처리가 복잡하므로 **우선순위 하향**
   - 먼저 개별 삭제 안정화 후 고려

---

### 2.5 claude.ai 벤치마킹

#### 문제점

1. **claude.ai 패턴을 맹목적으로 따름**
   - Hero Section, 그라데이션, 카드 등은 **랜딩 페이지 패턴**
   - Keywords 페이지는 **대시보드 페이지**이므로 다른 접근 필요
   - Claude.ai의 대시보드(Projects 페이지)를 참고했어야 함

2. **차별화 포인트가 불명확**
   - "보라색으로 브랜드 강조"라고 했지만, **왜 보라색인지 근거 없음**
   - Claude.ai는 주황색 계열 사용
   - 현재 프로젝트의 브랜드 컬러가 정의되지 않았다면 **임의로 선택한 것**

3. **애니메이션 철학 오해**
   - "Claude.ai는 미묘하고 자연스러운 애니메이션"이라고 했으나
   - 원안의 stagger, 펄스, 호버 애니메이션은 **과도함**
   - Claude.ai는 대부분 CSS transition만 사용

#### 개선안

1. **Claude.ai의 대시보드 페이지 벤치마킹**
   - Projects 페이지, Conversations 페이지 참고
   - 랜딩 페이지가 아닌 **대시보드 패턴** 적용

2. **브랜드 컬러 먼저 정의**
   - 기존 프로젝트에 브랜드 컬러가 있는지 확인
   - 없다면 **사용자에게 물어보거나** 기본 gray 계열 사용

3. **애니메이션은 "목적"이 있을 때만**
   - 로딩 상태 → 스켈레톤 (필수)
   - 모달 오픈 → fade-in (선택)
   - 호버 → 색상 변경 (CSS transition으로 충분)
   - **불필요한 애니메이션 제거**

---

## 3. 개선된 최종 계획

### 3.1 페이지 구성 (수정안)

```
KeywordsPage
├── PageHeader
│   ├── Title: "키워드 관리"
│   ├── Description: "블로그 콘텐츠 최적화를 위한 키워드를 관리하고 AI 추천을 받으세요."
│   └── Actions
│       ├── [Primary] AI 추천 받기 (SuggestionsDialog)
│       └── [Secondary] 키워드 추가 (KeywordCreateDialog)
├── SearchSection
│   ├── Search Input (debounced)
│   └── Source Filter (전체/수동/AI)
└── Card
    ├── TableHeader
    │   └── 총 개수 표시 ("50개의 키워드")
    ├── KeywordTable
    │   ├── 정렬 가능한 헤더 (키워드, 소스, 생성일)
    │   └── 각 행 (키워드, 소스 배지, 날짜, 액션)
    ├── EmptyState (빈 상태)
    └── Pagination
```

**주요 변경 사항**:
- Hero Section 제거 → 공간 절약
- Filter Section 간소화 → 검색 + 소스 필터만
- 메트릭 제거 → 백엔드 확인 후 Phase 4에서 재검토

---

### 3.2 UI 디자인 컨셉 (수정안)

#### 컬러 시스템

```typescript
const colors = {
  // 기본 gray (Tailwind 기본값 사용)
  gray: {
    50: '#F9FAFB',   // 배경
    100: '#F3F4F6',  // 카드 배경
    200: '#E5E7EB',  // 테두리
    500: '#6B7280',  // 보조 텍스트
    900: '#111827',  // 제목 텍스트
  },

  // 브랜드 컬러 (브랜드 정의 필요)
  // 임시로 Tailwind의 blue 사용
  brand: {
    500: 'rgb(59, 130, 246)',   // blue-500
    600: 'rgb(37, 99, 235)',    // blue-600
    700: 'rgb(29, 78, 216)',    // blue-700
  },

  // Semantic colors
  success: 'rgb(34, 197, 94)',   // green-500
  warning: 'rgb(251, 146, 60)',  // orange-500
  error: 'rgb(239, 68, 68)',     // red-500
};
```

**변경 사항**:
- 보라색 제거 (브랜드 미정의)
- 파란색 임시 사용 (사용자 확인 필요)
- 그라데이션 제거

#### 타이포그래피

```typescript
const typography = {
  pageTitle: 'text-2xl font-bold text-gray-900',          // 24px
  sectionTitle: 'text-lg font-semibold text-gray-800',   // 18px
  body: 'text-sm text-gray-600',                          // 14px
  caption: 'text-xs text-gray-500',                       // 12px
};
```

**변경 사항**:
- 전체적으로 한 단계 축소 (대시보드에 적합)

#### 간격 시스템

```typescript
const spacing = {
  sectionGap: 'space-y-6',    // 24px (섹션 간격)
  cardPadding: 'p-6',         // 24px
  formGap: 'space-y-4',       // 16px
};
```

---

### 3.3 컴포넌트 명세 (수정안)

#### 1. PageHeader Component

**파일**: `src/features/keywords/components/page-header.tsx`

**Props**:
```typescript
interface PageHeaderProps {
  title: string;
  description: string;
  onCreateClick: () => void;
  onSuggestClick: () => void;
}
```

**구현 예시**:
```tsx
'use client';

import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageHeader({
  title,
  description,
  onCreateClick,
  onSuggestClick,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={onSuggestClick} className="bg-blue-600 hover:bg-blue-700">
          <Sparkles className="mr-2 h-4 w-4" />
          AI 추천
        </Button>
        <Button variant="outline" onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          키워드 추가
        </Button>
      </div>
    </div>
  );
}
```

#### 2. SearchSection Component

**파일**: `src/features/keywords/components/search-section.tsx`

**Props**:
```typescript
interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sourceFilter: 'all' | 'manual' | 'ai';
  onSourceFilterChange: (source: 'all' | 'manual' | 'ai') => void;
}
```

**구현 예시**:
```tsx
'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SearchSection({
  searchQuery,
  onSearchChange,
  sourceFilter,
  onSourceFilterChange,
}: SearchSectionProps) {
  return (
    <div className="flex gap-3 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="키워드 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Source Filter */}
      <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          <SelectItem value="manual">수동</SelectItem>
          <SelectItem value="ai">AI</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

#### 3. KeywordTable Component (간소화)

**파일**: `src/features/keywords/components/keyword-table.tsx`

**주요 변경 사항**:
- 아이콘 제거 (키워드 이름만 표시)
- 메트릭 컬럼 제거 (백엔드 확인 후 재추가)
- 편집 액션 제거 (삭제만 유지)
- framer-motion 제거 (CSS transition 사용)

**Props**:
```typescript
interface KeywordTableProps {
  keywords: Keyword[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  totalCount: number;
}

interface Keyword {
  id: string;
  phrase: string;
  source: 'manual' | 'ai';
  createdAt: string;
}
```

**구현 예시**:
```tsx
'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Trash2, Copy } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TableSkeleton } from './table-skeleton';
import { EmptyState } from './empty-state';

export function KeywordTable({
  keywords,
  isLoading,
  onDelete,
  totalCount,
}: KeywordTableProps) {
  const { toast } = useToast();

  const handleCopy = async (phrase: string) => {
    await navigator.clipboard.writeText(phrase);
    toast({
      title: '복사 완료',
      description: `"${phrase}"가 클립보드에 복사되었습니다.`,
    });
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Total Count */}
      {totalCount > 0 && (
        <p className="text-sm text-gray-600">
          총 <span className="font-medium text-gray-900">{totalCount}</span>개의
          키워드
        </p>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[50%]">키워드</TableHead>
              <TableHead className="w-[20%]">소스</TableHead>
              <TableHead className="w-[20%]">생성일</TableHead>
              <TableHead className="w-[10%] text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <EmptyState type="no-results" />
                </TableCell>
              </TableRow>
            ) : (
              keywords.map((keyword) => (
                <TableRow
                  key={keyword.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {keyword.phrase}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={keyword.source === 'manual' ? 'default' : 'secondary'}
                    >
                      {keyword.source === 'manual' ? '수동' : 'AI'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        {format(new Date(keyword.createdAt), 'yyyy-MM-dd')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(keyword.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(keyword.phrase)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(keyword.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

#### 4. EmptyState Component (간소화)

**파일**: `src/features/keywords/components/empty-state.tsx`

**Props**:
```typescript
interface EmptyStateProps {
  type: 'no-keywords' | 'no-results';
  onCreateClick?: () => void;
  onSuggestClick?: () => void;
}
```

**구현 예시**:
```tsx
'use client';

import { Hash, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({
  type,
  onCreateClick,
  onSuggestClick,
}: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-gray-500">
        <Hash className="h-12 w-12 text-gray-300" />
        <div className="text-center">
          <p className="text-base font-medium text-gray-900 mb-1">
            검색 결과가 없습니다
          </p>
          <p className="text-sm text-gray-500">
            다른 검색어를 시도하거나 필터를 조정해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <Hash className="h-16 w-16 text-gray-300" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          아직 키워드가 없습니다
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          첫 키워드를 추가하거나 AI 추천을 받아보세요.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={onSuggestClick} className="bg-blue-600 hover:bg-blue-700">
          <Sparkles className="mr-2 h-4 w-4" />
          AI 추천
        </Button>
        <Button variant="outline" onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          키워드 추가
        </Button>
      </div>
    </div>
  );
}
```

#### 5. TableSkeleton Component

**파일**: `src/features/keywords/components/table-skeleton.tsx`

```tsx
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function TableSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>키워드</TableHead>
            <TableHead>소스</TableHead>
            <TableHead>생성일</TableHead>
            <TableHead className="text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

#### 6. Pagination Component (기존 유지)

원안의 Pagination 컴포넌트는 **잘 설계됨** → 그대로 사용

---

### 3.4 애니메이션 명세 (수정안)

#### 기본 원칙

1. **CSS transition 우선 사용**
2. **framer-motion은 최소한으로** (EmptyState, Dialog만)
3. **stagger 애니메이션 제거**

#### 적용 범위

```typescript
// ✅ CSS transition으로 충분
<tr className="transition-colors hover:bg-gray-50">
<Button className="transition-all hover:bg-blue-700">

// ✅ framer-motion 사용 (EmptyState)
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.2 }}
>

// ❌ 불필요한 애니메이션
// 페이지 진입 stagger 제거
// 리스트 아이템 애니메이션 제거
```

---

## 4. 주요 변경 사항 요약

### 추가된 요소

- **PageHeader Component**: 간결한 헤더 (제목 + 설명 + 버튼)
- **SearchSection Component**: 검색 + 소스 필터
- **TableSkeleton Component**: 스켈레톤 로딩
- **총 개수 표시**: 테이블 상단에 "총 50개의 키워드"

### 제거된 요소

- **Hero Section**: 메트릭 카드, 그라데이션 배경 (공간 낭비)
- **FilterSection의 복잡한 필터**: 정렬 필터, 활성 필터 표시 제거
- **테이블 아이콘**: 각 행의 Hash 아이콘 제거
- **메트릭 컬럼**: 검색량, 경쟁도 제거 (백엔드 확인 후 재추가)
- **편집 기능**: Phase 3로 이동
- **framer-motion 과다 사용**: CSS transition으로 대체
- **stagger 애니메이션**: 성능 이슈로 제거

### 수정된 요소

- **CTA 버튼 위계**: "AI 추천" Primary, "키워드 추가" Secondary
- **타이포그래피**: 전체적으로 한 단계 축소 (text-2xl → text-xl)
- **컬러 시스템**: 보라색 → 파란색 (브랜드 미정의)
- **애니메이션 전략**: framer-motion 최소화, CSS transition 우선
- **i18n**: date-fns locale을 useLocale()로 동적 처리

---

## 5. 기대 효과

1. **공간 효율성 향상**
   - Hero Section 제거로 테이블이 스크롤 없이 보임
   - 사용자가 **즉시 데이터에 집중** 가능

2. **성능 개선**
   - framer-motion 사용 최소화로 번들 크기 감소
   - CSS transition으로 **60fps 보장**

3. **유지보수성 향상**
   - 컴포넌트 단순화로 복잡도 감소
   - 백엔드 의존성 최소화 (메트릭 제거)

4. **구현 시간 단축**
   - 불필요한 기능 제거로 **Phase 1 시간 절약** (2시간 → 1시간)
   - 핵심 기능에 집중

---

## 6. 리스크 및 고려사항

### 리스크

1. **Hero Section 제거에 대한 사용자 반대 가능성**
   - 메트릭 카드를 선호하는 사용자가 있을 수 있음
   - **완화 방안**: 먼저 간소화된 버전 구현 후 사용자 피드백 수집

2. **브랜드 컬러 미정의**
   - 임시로 파란색 사용했으나, 브랜드 아이덴티티와 맞지 않을 수 있음
   - **완화 방안**: 사용자에게 브랜드 컬러 확인 후 적용

3. **메트릭 데이터 백엔드 미구현**
   - 백엔드에서 메트릭 제공하지 않으면 UI가 비어 보일 수 있음
   - **완화 방안**: 백엔드 먼저 확인 후 UI 작업

### 고려사항

1. **삭제 확인 다이얼로그 필요**
   - 실수로 삭제하는 것을 방지하기 위해 **확인 모달 추가** 필요
   - AlertDialog 컴포넌트 사용 권장

2. **편집 기능의 실제 필요성 재검토**
   - Phase 1 완료 후 사용자 피드백 수집
   - 요청이 많으면 Phase 3에서 구현

3. **모바일 최적화 우선순위**
   - 모바일 사용자 비율 확인 후 우선순위 조정
   - 높다면 Phase 2로 상향

---

## 7. 개선된 구현 우선순위

### Phase 1: 핵심 기능 (High Priority) - 총 3시간

1. **백엔드 확인 및 구현** (1시간)
   - `src/features/keywords/backend/route.ts`에 DELETE 엔드포인트 확인
   - 없으면 구현 (service, schema 포함)

2. **컴포넌트 리팩토링** (1시간)
   - 인라인 스타일 제거 → Tailwind 클래스로 변환
   - 기존 컴포넌트 간소화 (아이콘 제거, 메트릭 제거)

3. **스켈레톤 로딩 추가** (30분)
   - TableSkeleton 컴포넌트 구현

4. **EmptyState 개선** (30분)
   - 간결한 메시지 + CTA 버튼

### Phase 2: UI 개선 (Medium Priority) - 총 4시간

5. **PageHeader Component** (30분)
   - 간결한 헤더 구현

6. **SearchSection Component** (1시간)
   - 검색 + 소스 필터

7. **삭제 확인 다이얼로그** (30분)
   - AlertDialog 구현

8. **Pagination 통합** (30분)
   - 원안의 Pagination 컴포넌트 적용

9. **CSS transition 적용** (1시간)
   - 호버, 포커스 등 인터랙션 피드백

10. **다크모드 기본 지원** (30분)
    - 모든 컴포넌트에 `dark:` prefix 추가

### Phase 3: 고급 기능 (Low Priority) - 총 4시간

11. **편집 기능** (2시간)
    - Edit Dialog 구현 (사용자 피드백 후)

12. **모바일 카드 뷰** (2시간)
    - 768px 이하에서 카드 레이아웃

### Phase 4: 데이터 시각화 (Nice to Have) - 총 5시간

13. **메트릭 컬럼 추가** (2시간)
    - 백엔드에서 메트릭 제공 시
    - 검색량, 경쟁도 표시

14. **일괄 삭제** (2시간)
    - 체크박스 + 일괄 삭제 버튼
    - 트랜잭션 처리

15. **접근성 개선** (1시간)
    - ARIA 레이블, 키보드 네비게이션

**총 예상 시간**: 약 16시간 (원안 23시간 → 7시간 단축)

---

## 8. 구현 체크리스트

### Phase 1

- [ ] DELETE 엔드포인트 확인/구현
- [ ] 인라인 스타일 제거
- [ ] TableSkeleton 구현
- [ ] EmptyState 간소화

### Phase 2

- [ ] PageHeader 구현
- [ ] SearchSection 구현
- [ ] 삭제 확인 다이얼로그
- [ ] Pagination 통합
- [ ] CSS transition 적용
- [ ] 다크모드 지원

### Phase 3 (선택)

- [ ] 편집 기능 (사용자 피드백 후)
- [ ] 모바일 카드 뷰

### Phase 4 (선택)

- [ ] 메트릭 컬럼 (백엔드 확인 후)
- [ ] 일괄 삭제
- [ ] 접근성 개선

---

## 9. 최종 권장사항

### 즉시 실행

1. **사용자에게 브랜드 컬러 확인**
   - 보라색? 파란색? 다른 색?
   - 정의되지 않았다면 gray 기본으로 시작

2. **백엔드 확인**
   - `src/features/keywords/backend/route.ts` 확인
   - DELETE 엔드포인트 있는지 확인
   - 메트릭 데이터 제공 여부 확인

3. **Phase 1부터 시작**
   - 화려한 기능보다 **핵심 기능 완성도** 우선
   - 스켈레톤, EmptyState, 삭제 기능

### 구현 후

4. **사용자 피드백 수집**
   - Hero Section이 필요한가?
   - 편집 기능이 필요한가?
   - 모바일 사용 비율은?

5. **점진적 개선**
   - Phase 2, 3, 4는 피드백에 따라 선택적 구현

---

**작성일**: 2025-11-16
**작성자**: Claude (Plan Critic Agent)
**버전**: 1.0 (Critical Review)
