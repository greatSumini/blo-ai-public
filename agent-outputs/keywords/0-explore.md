# Keywords 페이지 분석 및 개선안

## 1. 현재 상태 분석

### 1.1 페이지 구조

**현재 페이지 구성:**
```
KeywordsPage
├── PageLayout (헤더 + 액션)
│   ├── Title: "키워드 관리"
│   ├── Description: "키워드 설명"
│   └── Actions
│       ├── SuggestionsDialog (연관 검색어 추천)
│       └── KeywordCreateDialog (키워드 생성)
└── Card
    └── KeywordTable
        ├── 검색 입력
        ├── 테이블 (키워드, 소스, 생성일, 액션)
        └── 페이지네이션
```

**주요 기능:**
1. 키워드 목록 조회 (검색, 페이지네이션)
2. 키워드 수동 생성
3. AI 기반 연관 검색어 추천 및 일괄 생성
4. 키워드 편집/삭제 (현재 미구현 - TODO)

### 1.2 강점

1. **명확한 정보 구조**: 테이블 기반으로 키워드 정보를 직관적으로 표시
2. **효율적인 검색**: Debounce를 활용한 실시간 검색
3. **단계별 UX**: SuggestionsDialog의 2단계 스텝퍼로 사용자 흐름 안내
4. **다국어 지원**: next-intl 기반 완전한 i18n 구현
5. **적절한 상태 관리**: React Query를 활용한 서버 상태 관리

### 1.3 약점 및 개선 필요 부분

#### 🚨 **심각한 문제점**

1. **시각적 위계 부족**
   - 페이지 전체가 평면적이고 단조로움
   - 중요한 액션(키워드 추가)과 보조 액션(추천)의 시각적 구분 없음
   - 데이터 밀도가 높아 한눈에 파악하기 어려움

2. **애니메이션 완전 부재**
   - 페이지 진입, 리스트 로딩, 다이얼로그 등 어떠한 모션도 없음
   - Claude.ai는 미묘하고 자연스러운 애니메이션으로 전문성을 전달
   - 정적이고 딱딱한 느낌

3. **빈 상태(Empty State) 디자인 빈약**
   - "결과 없음" 메시지만 표시
   - 사용자에게 다음 행동을 유도하지 못함
   - Claude.ai는 빈 상태에서도 강력한 CTA 제공

4. **인라인 스타일 남발**
   - `style={{ borderColor: "#E1E5EA" }}` 등 하드코딩된 스타일
   - Tailwind CSS 시스템을 벗어남
   - 유지보수성 저하

5. **로딩 상태 UX 부족**
   - 단순 텍스트 "Loading..." 표시
   - 스켈레톤 UI 없음
   - 사용자가 대기 시간을 체감하기 어려움

6. **편집/삭제 기능 미구현**
   - `console.log`만 있는 TODO 상태
   - 핵심 CRUD 기능이 불완전

7. **데이터 시각화 부재**
   - 키워드 검색량, 경쟁도 등의 메트릭이 있음에도 활용 안 함
   - 숫자만으로는 가치 판단이 어려움

#### ⚠️ **개선이 필요한 부분**

8. **페이지네이션 UX**
   - 이전/다음 버튼만 있음
   - 특정 페이지로 직접 이동 불가
   - 전체 페이지 수가 많을 때 비효율적

9. **검색 UX 미흡**
   - 검색 필터 옵션 없음 (소스별, 날짜별 등)
   - 검색 결과 하이라이팅 없음
   - 검색어 저장/히스토리 기능 없음

10. **일관성 없는 디자인 토큰**
    - 컬러 하드코딩: `#E1E5EA`, `#1F2937`, `#6B7280`
    - Tailwind의 semantic color system 미활용

11. **접근성 부족**
    - 키보드 네비게이션 불완전
    - ARIA 레이블 부족
    - 스크린 리더 고려 미흡

12. **모바일 최적화 미흡**
    - 테이블이 좁은 화면에서 보기 어려움
    - 카드 뷰 대안 없음

---

## 2. 개선된 페이지 구성

### 2.1 Hero Section (페이지 헤더)

**목적**: 사용자에게 페이지의 가치와 현재 상태를 한눈에 전달

**구성 요소**:
```
HeroSection
├── 제목 + 설명 (현재와 동일)
├── 주요 메트릭 카드 (NEW)
│   ├── 총 키워드 수
│   ├── 이번 주 추가된 키워드
│   └── AI 추천 키워드 수
└── 액션 버튼
    ├── [Primary] 키워드 추가
    └── [Secondary] AI 추천 받기
```

**개선 사항**:
- 메트릭 카드를 통해 데이터 개요 제공
- 버튼 위계 명확화 (Primary vs Secondary)
- 그라데이션 배경으로 시각적 흥미 추가

### 2.2 Filter & Search Section

**목적**: 강력한 필터링과 검색으로 대량의 키워드를 효율적으로 관리

**구성 요소**:
```
FilterSection
├── 검색 입력 (개선)
│   ├── 아이콘 + 플레이스홀더
│   ├── 검색어 하이라이팅
│   └── 클리어 버튼
├── 필터 칩 (NEW)
│   ├── 소스별 (전체/수동/AI)
│   ├── 날짜 범위
│   └── 정렬 (최신순/이름순/검색량순)
└── 활성 필터 표시 + 초기화
```

### 2.3 Keywords List Section

**목적**: 키워드 데이터를 효과적으로 표시하고 관리

**데스크톱 - 테이블 뷰**:
```
KeywordTable
├── 헤더
│   ├── 키워드 (정렬 가능)
│   ├── 소스 (필터 가능)
│   ├── 메트릭 (검색량, 경쟁도) (NEW)
│   ├── 생성일 (정렬 가능)
│   └── 액션
└── 행 (각 키워드)
    ├── 키워드 이름 (굵게)
    ├── 소스 배지
    ├── 메트릭 진행 바 (NEW)
    ├── 날짜 (상대적 시간)
    └── 액션 (편집/삭제/복사)
```

**모바일 - 카드 뷰** (NEW):
```
KeywordCard
├── 키워드 이름
├── 메트릭 요약
├── 소스 배지 + 날짜
└── 액션 메뉴 (...)
```

### 2.4 Empty State Section

**목적**: 빈 상태에서도 사용자를 안내하고 다음 행동 유도

**구성 요소**:
```
EmptyState
├── 일러스트레이션 (아이콘 또는 이미지)
├── 제목: "아직 키워드가 없습니다"
├── 설명: "첫 키워드를 추가하거나 AI 추천을 받아보세요"
└── CTA 버튼
    ├── [Primary] 키워드 추가
    └── [Secondary] AI 추천 받기
```

### 2.5 Pagination & Bulk Actions

**목적**: 대량 데이터 탐색과 일괄 작업 지원

**구성 요소**:
```
Footer
├── 일괄 선택 (NEW)
│   ├── 체크박스 (전체 선택)
│   └── 일괄 삭제 버튼
├── 결과 정보
│   └── "50개 중 1-20 표시"
└── 페이지네이션 (개선)
    ├── 첫 페이지
    ├── 이전
    ├── 페이지 번호 (1, 2, 3 ... 10)
    ├── 다음
    └── 마지막 페이지
```

---

## 3. 참고 레퍼런스 (Claude.ai 디자인 패턴)

### 3.1 Hero 패턴

**Claude.ai의 특징**:
- 그라데이션 배경으로 시각적 흥미 제공
- 대담한 타이포그래피 (큰 제목, 명확한 위계)
- Subtle 애니메이션 (fade-in, slide-up)

**적용 방법**:
```tsx
// 그라데이션 배경
<div className="bg-gradient-to-br from-violet-50 via-white to-blue-50">
  <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent"
  >
    키워드 관리
  </motion.h1>
</div>
```

**차별화 포인트**:
- Claude.ai는 랜딩 페이지에 적합한 화려한 그라데이션 사용
- 우리는 대시보드이므로 더 미묘하고 절제된 그라데이션 적용
- 보라색(violet) 계열로 브랜드 정체성 강화

### 3.2 카드 컴포넌트 패턴

**Claude.ai의 특징**:
- 부드러운 그림자 (shadow-sm)
- 호버 시 elevation 증가
- 둥근 모서리 (rounded-xl)
- 내부 여백 충분 (p-6)

**적용 방법**:
```tsx
<motion.div
  whileHover={{ y: -2, shadow: "lg" }}
  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 transition-all"
>
  {/* 카드 내용 */}
</motion.div>
```

**차별화 포인트**:
- 테이블 대신 카드 그리드로 메트릭 표시
- 각 카드에 아이콘 + 숫자 + 트렌드 표시

### 3.3 버튼 위계 패턴

**Claude.ai의 특징**:
- Primary: 진한 배경, 흰 텍스트, 호버 시 어두워짐
- Secondary: 투명 배경, 테두리, 호버 시 배경 생김
- Ghost: 최소한의 스타일, 호버 시 배경 subtle

**적용 방법**:
```tsx
// Primary
<Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm">
  키워드 추가
</Button>

// Secondary
<Button variant="outline" className="border-gray-300 hover:bg-gray-50">
  AI 추천 받기
</Button>
```

**차별화 포인트**:
- 보라색 Primary 버튼으로 브랜드 강조
- 아이콘 + 텍스트 조합으로 의미 명확화

### 3.4 테이블 패턴

**Claude.ai의 특징**:
- 줄무늬 없음 (깔끔한 흰 배경)
- 호버 시 행 배경 변경 (hover:bg-gray-50)
- 충분한 행간 (py-4)
- 정렬 가능한 헤더에 화살표 아이콘

**적용 방법**:
```tsx
<TableRow className="hover:bg-gray-50/50 transition-colors cursor-pointer">
  <TableCell className="py-4">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
        <Hash className="h-4 w-4 text-violet-600" />
      </div>
      <span className="font-medium">{keyword.phrase}</span>
    </div>
  </TableCell>
</TableRow>
```

**차별화 포인트**:
- 키워드 이름에 아이콘 추가로 시각적 앵커 제공
- 메트릭을 진행 바로 표시해 직관성 향상

### 3.5 모달/다이얼로그 패턴

**Claude.ai의 특징**:
- 배경 오버레이 (backdrop-blur)
- 중앙 정렬, 충분한 패딩
- 닫기 버튼 명확
- 내부 스크롤 가능

**적용 방법**:
```tsx
<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
  <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
    {/* 고정 헤더 */}
  </DialogHeader>
  <div className="p-6">
    {/* 스크롤 가능한 내용 */}
  </div>
</DialogContent>
```

**차별화 포인트**:
- 2단계 스텝퍼에 시각적 진행 상태 표시
- 각 단계 전환 시 애니메이션 추가

### 3.6 로딩 상태 패턴

**Claude.ai의 특징**:
- 스켈레톤 UI 활용 (내용 구조 미리 보여줌)
- 펄스 애니메이션 (animate-pulse)
- 스피너 대신 구조적 로딩 표시

**적용 방법**:
```tsx
// 테이블 스켈레톤
{isLoading && (
  <>
    {[...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton className="h-4 w-40" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-16 rounded-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
      </TableRow>
    ))}
  </>
)}
```

**차별화 포인트**:
- 실제 데이터 구조를 반영한 스켈레톤
- 로딩 시간이 길어도 사용자가 페이지 구조 파악 가능

### 3.7 애니메이션 패턴

**Claude.ai의 특징**:
- 미묘하고 자연스러운 모션
- 사용자 행동에 반응하는 피드백
- 과하지 않은 duration (200-300ms)
- Easing 함수 활용 (ease-out, spring)

**적용 방법**:
```tsx
// 리스트 아이템 stagger 애니메이션
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

**차별화 포인트**:
- 페이지 진입 시 콘텐츠가 순차적으로 나타남
- 리스트 업데이트 시 부드러운 추가/삭제 애니메이션

---

## 4. UI 디자인 컨셉

### 4.1 컬러 시스템

**문제점**: 현재 하드코딩된 HEX 값 사용 (`#E1E5EA`, `#1F2937` 등)

**해결책**: Tailwind semantic colors + 브랜드 컬러

```typescript
const colors = {
  // 브랜드 컬러 (보라색 계열)
  brand: {
    50: 'rgb(250, 245, 255)',   // 매우 연한 보라
    100: 'rgb(243, 232, 255)',  // 연한 보라
    200: 'rgb(233, 213, 255)',
    300: 'rgb(216, 180, 254)',
    400: 'rgb(192, 132, 252)',
    500: 'rgb(168, 85, 247)',   // 메인 보라 (violet-500)
    600: 'rgb(147, 51, 234)',   // 진한 보라
    700: 'rgb(126, 34, 206)',
    800: 'rgb(107, 33, 168)',
    900: 'rgb(88, 28, 135)',
  },

  // Semantic colors (Tailwind 기본값 활용)
  gray: {
    50: '#FCFCFD',   // 배경
    100: '#F9FAFB',  // 카드 배경
    200: '#F3F4F6',  // 비활성 배경
    300: '#E5E7EB',  // 테두리
    400: '#9CA3AF',  // 플레이스홀더
    500: '#6B7280',  // 보조 텍스트
    600: '#4B5563',  // 본문 텍스트
    700: '#374151',
    800: '#1F2937',  // 제목 텍스트
    900: '#111827',  // 강조 텍스트
  },

  // Success, Warning, Error (Tailwind 기본값)
  success: 'rgb(34, 197, 94)',   // green-500
  warning: 'rgb(251, 146, 60)',  // orange-500
  error: 'rgb(239, 68, 68)',     // red-500

  // 배경 그라데이션 (Hero Section)
  gradientFrom: 'rgb(245, 243, 255)', // violet-50
  gradientVia: 'rgb(255, 255, 255)',  // white
  gradientTo: 'rgb(239, 246, 255)',   // blue-50
};
```

**적용 예시**:
```tsx
// Before (❌)
<Card style={{ borderColor: "#E1E5EA" }}>

// After (✅)
<Card className="border-gray-300">
```

### 4.2 타이포그래피

**현재 문제점**: 폰트 크기와 굵기가 일관성 없음

**개선안**:
```typescript
const typography = {
  // 제목 계층
  h1: {
    size: '3xl',      // 30px
    weight: 'bold',   // 700
    lineHeight: '1.2',
    usage: '페이지 제목',
  },
  h2: {
    size: '2xl',      // 24px
    weight: 'semibold', // 600
    lineHeight: '1.3',
    usage: '섹션 제목',
  },
  h3: {
    size: 'xl',       // 20px
    weight: 'semibold',
    lineHeight: '1.4',
    usage: '카드 제목',
  },

  // 본문 계층
  body: {
    size: 'base',     // 16px
    weight: 'normal', // 400
    lineHeight: '1.5',
    usage: '일반 텍스트',
  },
  bodyMedium: {
    size: 'base',
    weight: 'medium', // 500
    lineHeight: '1.5',
    usage: '강조 텍스트',
  },
  bodySmall: {
    size: 'sm',       // 14px
    weight: 'normal',
    lineHeight: '1.5',
    usage: '보조 텍스트',
  },

  // 특수 텍스트
  caption: {
    size: 'xs',       // 12px
    weight: 'normal',
    lineHeight: '1.4',
    usage: '메타 정보',
  },
  button: {
    size: 'sm',
    weight: 'medium',
    lineHeight: '1',
    usage: '버튼 레이블',
  },
};
```

**적용 예시**:
```tsx
// 페이지 제목
<h1 className="text-3xl font-bold text-gray-900">
  키워드 관리
</h1>

// 섹션 제목
<h2 className="text-2xl font-semibold text-gray-800">
  검색 결과
</h2>

// 본문
<p className="text-base text-gray-600">
  총 50개의 키워드가 있습니다.
</p>

// 메타 정보
<span className="text-xs text-gray-500">
  2일 전
</span>
```

### 4.3 간격 시스템

**문제점**: 일관성 없는 여백과 간격

**해결책**: 8px 기반 간격 시스템
```typescript
const spacing = {
  // 컴포넌트 내부 간격
  tight: '2',    // 8px  - 아이콘과 텍스트
  normal: '4',   // 16px - 폼 필드
  relaxed: '6',  // 24px - 카드 패딩
  loose: '8',    // 32px - 섹션 간격

  // 섹션 간격
  sectionSm: '8',  // 32px
  sectionMd: '12', // 48px
  sectionLg: '16', // 64px
  sectionXl: '24', // 96px

  // 레이아웃 여백
  containerPadding: {
    mobile: '4',   // 16px
    tablet: '6',   // 24px
    desktop: '8',  // 32px
  },
};
```

**적용 예시**:
```tsx
// 카드 패딩
<Card className="p-6">  {/* 24px */}

// 폼 필드 간격
<div className="space-y-4">  {/* 16px */}

// 섹션 간격
<div className="mb-12">  {/* 48px */}
```

### 4.4 카드 스타일

**Claude.ai 스타일 카드**:
```typescript
const cardStyles = {
  default: {
    background: 'bg-white',
    border: 'border border-gray-200',
    borderRadius: 'rounded-xl',
    shadow: 'shadow-sm',
    padding: 'p-6',
    hover: 'hover:shadow-md transition-shadow duration-200',
  },

  elevated: {
    background: 'bg-white',
    border: 'border-0',
    borderRadius: 'rounded-xl',
    shadow: 'shadow-md',
    padding: 'p-6',
    hover: 'hover:shadow-lg transition-shadow duration-200',
  },

  outlined: {
    background: 'bg-transparent',
    border: 'border-2 border-gray-200',
    borderRadius: 'rounded-xl',
    shadow: 'shadow-none',
    padding: 'p-6',
    hover: 'hover:border-violet-300 transition-colors duration-200',
  },
};
```

**적용 예시**:
```tsx
// 메트릭 카드 (elevated)
<Card className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
  <div className="flex items-center gap-4">
    <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
      <Hash className="h-6 w-6 text-violet-600" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">1,234</p>
      <p className="text-sm text-gray-500">총 키워드</p>
    </div>
  </div>
</Card>

// 테이블 래퍼 카드 (default)
<Card className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
  <KeywordTable />
</Card>
```

### 4.5 다크모드 고려사항

**현재 상태**: `darkMode: "class"` 설정되어 있으나 미사용

**권장 사항**:
1. **단계적 도입**: 먼저 라이트 모드 완성 후 다크모드 추가
2. **컬러 변수 활용**: CSS 변수로 다크모드 대응
3. **중요 포인트**:
   - 배경: `gray-50` → `gray-900`
   - 카드: `white` → `gray-800`
   - 텍스트: `gray-900` → `white`
   - 테두리: `gray-200` → `gray-700`
   - 브랜드 컬러: 그대로 유지 (violet-500)

**다크모드 구현 예시**:
```tsx
<Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
  <h3 className="text-gray-900 dark:text-white">
    키워드 목록
  </h3>
  <p className="text-gray-600 dark:text-gray-400">
    설명 텍스트
  </p>
</Card>
```

---

## 5. 섹션별 컴포넌트 명세

### 5.1 Hero Section

#### **HeroSection Component**

**파일**: `src/features/keywords/components/hero-section.tsx`

**Props**:
```typescript
interface HeroSectionProps {
  title: string;
  description: string;
  metrics: {
    total: number;
    thisWeek: number;
    aiGenerated: number;
  };
  onCreateClick: () => void;
  onSuggestClick: () => void;
}
```

**하위 컴포넌트**:
1. **HeroTitle**: 페이지 제목 + 그라데이션 텍스트
2. **HeroDescription**: 설명 텍스트
3. **MetricsGrid**: 3개의 메트릭 카드
4. **ActionButtons**: Primary + Secondary 버튼

**구현 예시**:
```tsx
'use client';

import { motion } from 'framer-motion';
import { Hash, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface HeroSectionProps {
  title: string;
  description: string;
  metrics: {
    total: number;
    thisWeek: number;
    aiGenerated: number;
  };
  onCreateClick: () => void;
  onSuggestClick: () => void;
}

export function HeroSection({
  title,
  description,
  metrics,
  onCreateClick,
  onSuggestClick,
}: HeroSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <div className="bg-gradient-to-br from-violet-50/50 via-white to-blue-50/50 rounded-2xl p-8 mb-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Title & Description */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          <p className="text-base text-gray-600">{description}</p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Total Keywords */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Hash className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.total.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">총 키워드</p>
              </div>
            </div>
          </Card>

          {/* This Week */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  +{metrics.thisWeek.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">이번 주 추가</p>
              </div>
            </div>
          </Card>

          {/* AI Generated */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.aiGenerated.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">AI 추천</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex gap-3">
          <Button
            onClick={onCreateClick}
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
          >
            <Hash className="mr-2 h-4 w-4" />
            키워드 추가
          </Button>
          <Button
            variant="outline"
            onClick={onSuggestClick}
            className="border-gray-300 hover:bg-gray-50"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI 추천 받기
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
```

---

### 5.2 Filter Section

#### **FilterSection Component**

**파일**: `src/features/keywords/components/filter-section.tsx`

**Props**:
```typescript
interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    source: 'all' | 'manual' | 'ai';
    sortBy: 'latest' | 'name' | 'volume';
  };
  onFilterChange: (filters: Partial<FilterSectionProps['filters']>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}
```

**하위 컴포넌트**:
1. **SearchInput**: 검색 입력 + 아이콘 + 클리어 버튼
2. **FilterChips**: 소스, 정렬 필터 칩
3. **ActiveFilters**: 활성 필터 표시 + 초기화 버튼

**구현 예시**:
```tsx
'use client';

import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    source: 'all' | 'manual' | 'ai';
    sortBy: 'latest' | 'name' | 'volume';
  };
  onFilterChange: (filters: Partial<FilterSectionProps['filters']>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function FilterSection({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: FilterSectionProps) {
  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex gap-3">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {filters.source === 'all'
                ? '전체'
                : filters.source === 'manual'
                ? '수동'
                : 'AI'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onFilterChange({ source: 'all' })}>
              전체
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange({ source: 'manual' })}>
              수동 추가
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange({ source: 'ai' })}>
              AI 추천
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {filters.sortBy === 'latest'
                ? '최신순'
                : filters.sortBy === 'name'
                ? '이름순'
                : '검색량순'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onFilterChange({ sortBy: 'latest' })}>
              최신순
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange({ sortBy: 'name' })}>
              이름순
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange({ sortBy: 'volume' })}>
              검색량순
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">활성 필터:</span>
          {filters.source !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.source === 'manual' ? '수동' : 'AI'}
              <button
                onClick={() => onFilterChange({ source: 'all' })}
                className="hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs"
          >
            모두 초기화
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

### 5.3 Keywords Table Section

#### **KeywordTable Component** (개선)

**파일**: `src/features/keywords/components/keyword-table.tsx`

**Props**:
```typescript
interface KeywordTableProps {
  keywords: Keyword[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (phrase: string) => void;
}

interface Keyword {
  id: string;
  phrase: string;
  source: 'manual' | 'ai';
  metrics?: {
    searchVolume?: number;
    competition?: 'low' | 'medium' | 'high';
  };
  createdAt: string;
}
```

**하위 컴포넌트**:
1. **TableSkeleton**: 로딩 상태 스켈레톤
2. **KeywordRow**: 각 키워드 행
3. **MetricBadge**: 메트릭 표시 (검색량, 경쟁도)
4. **ActionMenu**: 편집/삭제/복사 메뉴

**구현 예시**:
```tsx
'use client';

import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Hash, Pencil, Trash2, Copy, MoreVertical } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Keyword {
  id: string;
  phrase: string;
  source: 'manual' | 'ai';
  metrics?: {
    searchVolume?: number;
    competition?: 'low' | 'medium' | 'high';
  };
  createdAt: string;
}

interface KeywordTableProps {
  keywords: Keyword[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function KeywordTable({
  keywords,
  isLoading,
  onEdit,
  onDelete,
}: KeywordTableProps) {
  const { toast } = useToast();

  const handleCopy = async (phrase: string) => {
    await navigator.clipboard.writeText(phrase);
    toast({
      title: '복사 완료',
      description: `"${phrase}"가 클립보드에 복사되었습니다.`,
    });
  };

  const getCompetitionColor = (competition?: 'low' | 'medium' | 'high') => {
    if (!competition) return 'bg-gray-200';
    return {
      low: 'bg-green-200 text-green-800',
      medium: 'bg-yellow-200 text-yellow-800',
      high: 'bg-red-200 text-red-800',
    }[competition];
  };

  const getCompetitionLabel = (competition?: 'low' | 'medium' | 'high') => {
    if (!competition) return '-';
    return {
      low: '낮음',
      medium: '보통',
      high: '높음',
    }[competition];
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="w-[40%]">키워드</TableHead>
            <TableHead className="w-[15%]">소스</TableHead>
            <TableHead className="w-[15%]">메트릭</TableHead>
            <TableHead className="w-[20%]">생성일</TableHead>
            <TableHead className="w-[10%] text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <EmptyState />
              </TableCell>
            </TableRow>
          ) : (
            keywords.map((keyword, index) => (
              <motion.tr
                key={keyword.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Hash className="h-4 w-4 text-violet-600" />
                    </div>
                    <span className="font-medium text-gray-900">
                      {keyword.phrase}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={keyword.source === 'manual' ? 'default' : 'secondary'}
                    className="font-medium"
                  >
                    {keyword.source === 'manual' ? '수동' : 'AI'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {keyword.metrics?.searchVolume && (
                      <div className="text-sm text-gray-600">
                        {keyword.metrics.searchVolume.toLocaleString()} 검색
                      </div>
                    )}
                    {keyword.metrics?.competition && (
                      <Badge
                        variant="outline"
                        className={getCompetitionColor(keyword.metrics.competition)}
                      >
                        {getCompetitionLabel(keyword.metrics.competition)}
                      </Badge>
                    )}
                    {!keyword.metrics && (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </div>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleCopy(keyword.phrase)}>
                        <Copy className="mr-2 h-4 w-4" />
                        복사
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(keyword.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        편집
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(keyword.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead>키워드</TableHead>
            <TableHead>소스</TableHead>
            <TableHead>메트릭</TableHead>
            <TableHead>생성일</TableHead>
            <TableHead className="text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 text-gray-500">
      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
        <Hash className="h-8 w-8 text-gray-400" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900 mb-1">
          검색 결과가 없습니다
        </p>
        <p className="text-sm text-gray-500">
          다른 검색어를 시도하거나 필터를 조정해보세요
        </p>
      </div>
    </div>
  );
}
```

---

### 5.4 Empty State Component

#### **EmptyState Component**

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

import { motion } from 'framer-motion';
import { Hash, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'no-keywords' | 'no-results';
  onCreateClick?: () => void;
  onSuggestClick?: () => void;
}

export function EmptyState({
  type,
  onCreateClick,
  onSuggestClick,
}: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-gray-500">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
          <Hash className="h-8 w-8 text-gray-400" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 mb-1">
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-6 py-16 px-4"
    >
      {/* Illustration */}
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
          <Hash className="h-12 w-12 text-violet-600" />
        </div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center"
        >
          <Sparkles className="h-4 w-4 text-blue-600" />
        </motion.div>
      </div>

      {/* Message */}
      <div className="text-center max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          아직 키워드가 없습니다
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          첫 키워드를 직접 추가하거나, AI의 도움을 받아 연관 검색어를 추천받아보세요.
          효과적인 키워드 전략으로 콘텐츠를 최적화하세요.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={onCreateClick}
          className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
        >
          <Hash className="mr-2 h-4 w-4" />
          키워드 추가
        </Button>
        <Button
          variant="outline"
          onClick={onSuggestClick}
          className="border-gray-300 hover:bg-gray-50"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI 추천 받기
        </Button>
      </div>
    </motion.div>
  );
}
```

---

### 5.5 Pagination Component

#### **Pagination Component** (개선)

**파일**: `src/components/ui/pagination.tsx` (또는 `src/features/keywords/components/pagination.tsx`)

**Props**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}
```

**구현 예시**:
```tsx
'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      {/* Results Info */}
      <p className="text-sm text-gray-500">
        {totalItems > 0 ? (
          <>
            <span className="font-medium text-gray-900">
              {startItem}-{endItem}
            </span>{' '}
            / {totalItems.toLocaleString()}개
          </>
        ) : (
          '결과 없음'
        )}
      </p>

      {/* Page Navigation */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="h-9 w-9 flex items-center justify-center text-gray-400"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`h-9 w-9 p-0 ${
                page === currentPage
                  ? 'bg-violet-600 hover:bg-violet-700 text-white'
                  : ''
              }`}
            >
              {page}
            </Button>
          )
        )}

        {/* Next Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

---

## 6. 애니메이션 명세 (framer-motion)

### 6.1 페이지 진입 애니메이션

**목적**: 페이지 로드 시 자연스러운 진입 효과

```typescript
// 컨테이너 애니메이션 (stagger)
const pageContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// 개별 섹션 애니메이션
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// 사용 예시
<motion.div
  variants={pageContainerVariants}
  initial="hidden"
  animate="visible"
>
  <motion.div variants={sectionVariants}>
    <HeroSection />
  </motion.div>
  <motion.div variants={sectionVariants}>
    <FilterSection />
  </motion.div>
  <motion.div variants={sectionVariants}>
    <KeywordTable />
  </motion.div>
</motion.div>
```

### 6.2 리스트 아이템 애니메이션

**목적**: 테이블 행이 순차적으로 나타나는 효과

```typescript
// 각 행에 적용
<motion.tr
  key={keyword.id}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    delay: index * 0.05,
    duration: 0.3,
    ease: 'easeOut',
  }}
  className="hover:bg-gray-50/50 transition-colors"
>
  {/* TableCell들 */}
</motion.tr>
```

**성능 고려사항**:
- `will-change: transform` 자동 적용
- 최대 20개 아이템만 애니메이션 (페이지네이션으로 제한)
- `layoutId` 사용하지 않음 (불필요)

### 6.3 카드 호버 애니메이션

**목적**: 인터랙션 피드백 제공

```typescript
// 메트릭 카드 호버
<motion.div
  whileHover={{
    y: -4,
    shadow: 'lg',
    transition: { duration: 0.2 }
  }}
  className="bg-white rounded-xl shadow-sm p-6"
>
  {/* 카드 내용 */}
</motion.div>

// 테이블 행 호버 (CSS로 충분)
<tr className="hover:bg-gray-50/50 transition-colors duration-150">
```

### 6.4 다이얼로그 애니메이션

**목적**: 모달 오픈/클로즈 시 자연스러운 전환

```typescript
// shadcn Dialog는 기본 애니메이션 제공
// 추가 커스터마이징 필요 시:
<DialogContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
  {/* 내용 */}
</DialogContent>
```

### 6.5 스켈레톤 로딩 애니메이션

**목적**: 로딩 중 펄스 효과

```typescript
// Skeleton 컴포넌트 (shadcn 기본 제공)
<Skeleton className="h-4 w-40 animate-pulse" />

// 커스텀 펄스
<div className="bg-gray-200 animate-pulse rounded-md h-4 w-40" />
```

### 6.6 EmptyState 애니메이션

**목적**: 빈 상태 컴포넌트의 시각적 흥미

```typescript
// 아이콘 펄스 애니메이션
<motion.div
  animate={{
    scale: [1, 1.1, 1],
    opacity: [0.5, 1, 0.5],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  className="h-8 w-8 rounded-full bg-blue-200"
>
  <Sparkles className="h-4 w-4 text-blue-600" />
</motion.div>
```

### 6.7 버튼 인터랙션 애니메이션

**목적**: 클릭 피드백

```typescript
// Primary 버튼
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="bg-violet-600 hover:bg-violet-700"
>
  클릭
</motion.button>

// Ghost 버튼 (미묘한 효과)
<button className="hover:bg-gray-50 active:bg-gray-100 transition-colors">
  클릭
</button>
```

### 6.8 성능 최적화 가이드

**중요 원칙**:
1. **Transform & Opacity만 애니메이션**: `x`, `y`, `scale`, `opacity`만 사용
2. **Layout 변경 지양**: `width`, `height` 애니메이션 피하기
3. **GPU 가속 활용**: `will-change: transform` 자동 적용
4. **Debounce 활용**: 스크롤 이벤트 등은 debounce
5. **조건부 애니메이션**: 필요한 경우만 적용

```typescript
// ✅ 좋은 예 (transform)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
/>

// ❌ 나쁜 예 (layout)
<motion.div
  initial={{ height: 0 }}
  animate={{ height: 'auto' }}
/>
```

---

## 7. 구현 우선순위

### Phase 1: 핵심 UI/UX 개선 (High Priority)

1. **스켈레톤 로딩 추가** (1시간)
   - `TableSkeleton` 컴포넌트 구현
   - 로딩 상태 개선

2. **EmptyState 개선** (1시간)
   - 빈 상태 컴포넌트 디자인 개선
   - CTA 버튼 추가

3. **편집/삭제 기능 구현** (2시간)
   - Edit Dialog 구현
   - Delete Confirmation Dialog 구현
   - API 연동

4. **인라인 스타일 제거** (30분)
   - 모든 하드코딩 스타일을 Tailwind로 변환
   - 일관된 디자인 토큰 사용

### Phase 2: 시각적 향상 (Medium Priority)

5. **Hero Section 추가** (2시간)
   - 메트릭 카드 구현
   - 그라데이션 배경 적용
   - 버튼 위계 개선

6. **테이블 UI 개선** (2시간)
   - 아이콘 추가
   - 메트릭 표시 개선
   - 호버 효과 추가

7. **페이지 진입 애니메이션** (1시간)
   - framer-motion 적용
   - stagger 애니메이션

8. **필터 섹션 개선** (2시간)
   - 소스, 정렬 필터 추가
   - 활성 필터 표시
   - 클리어 버튼

### Phase 3: 고급 기능 (Low Priority)

9. **페이지네이션 개선** (1.5시간)
   - 페이지 번호 직접 선택
   - 첫/마지막 페이지 버튼

10. **모바일 최적화** (3시간)
    - 카드 뷰 구현
    - 반응형 레이아웃

11. **일괄 작업 기능** (2시간)
    - 체크박스 추가
    - 일괄 삭제

12. **접근성 개선** (2시간)
    - ARIA 레이블 추가
    - 키보드 네비게이션

### Phase 4: 데이터 시각화 (Nice to Have)

13. **검색량 차트** (3시간)
    - 시간별 트렌드 그래프
    - 키워드 비교

14. **경쟁도 분석** (2시간)
    - 진행 바 시각화
    - 색상 코딩

**총 예상 시간**: 약 23시간

---

## 8. 성공 지표

### 8.1 디자인 품질

- [x] Claude.ai 수준의 시각적 완성도
  - [ ] 그라데이션 배경 적용
  - [ ] 일관된 컬러 시스템
  - [ ] 적절한 타이포그래피 위계
  - [ ] 부드러운 애니메이션

- [x] 명확한 정보 구조
  - [ ] 메트릭 요약 (Hero Section)
  - [ ] 시각적 위계 (제목 > 카드 > 테이블)
  - [ ] 직관적인 내비게이션

### 8.2 사용자 경험

- [x] 빠른 피드백
  - [ ] 로딩 상태 (스켈레톤)
  - [ ] 에러 상태 (명확한 메시지)
  - [ ] 성공 상태 (토스트)

- [x] 효율적인 작업 흐름
  - [ ] 검색 + 필터 (빠른 탐색)
  - [ ] 편집/삭제 (원클릭)
  - [ ] 일괄 작업 (대량 처리)

### 8.3 기술적 완성도

- [x] 성능 최적화
  - [ ] 애니메이션 60fps 유지
  - [ ] 리스트 가상화 (100+ 아이템)
  - [ ] 이미지 최적화

- [x] 접근성
  - [ ] 키보드 네비게이션
  - [ ] 스크린 리더 지원
  - [ ] WCAG 2.1 AA 준수

- [x] 반응형 디자인
  - [ ] 모바일 (320px+)
  - [ ] 태블릿 (768px+)
  - [ ] 데스크톱 (1024px+)

### 8.4 유지보수성

- [x] 코드 품질
  - [ ] TypeScript 타입 안전성
  - [ ] 컴포넌트 재사용성
  - [ ] 명확한 파일 구조

- [x] 디자인 시스템
  - [ ] Tailwind 설정 일관성
  - [ ] 컬러 변수 활용
  - [ ] 컴포넌트 문서화

---

## 9. 추가 권장사항

### 9.1 다국어 지원 강화

현재 `next-intl`이 잘 적용되어 있지만, 추가 개선 사항:

```typescript
// 날짜 포맷 다국어화
import { format } from 'date-fns';
import { ko, en } from 'date-fns/locale';

const locale = useLocale(); // 'ko' | 'en'

format(new Date(), 'PPP', {
  locale: locale === 'ko' ? ko : en
});
```

### 9.2 에러 경계 (Error Boundary)

```tsx
// src/features/keywords/components/keyword-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class KeywordErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">
            문제가 발생했습니다
          </h3>
          <Button onClick={() => window.location.reload()}>
            새로고침
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 9.3 분석 및 모니터링

```typescript
// 키워드 추가 시 이벤트 트래킹
const handleCreateKeyword = async (phrase: string) => {
  await createMutation.mutateAsync(phrase);

  // 분석 이벤트 (예: Google Analytics)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'keyword_created', {
      method: 'manual',
      phrase_length: phrase.length,
    });
  }
};
```

### 9.4 테스트 전략

```typescript
// E2E 테스트 예시 (Playwright)
test('키워드 생성 플로우', async ({ page }) => {
  await page.goto('/keywords');

  // 빈 상태 확인
  await expect(page.getByText('아직 키워드가 없습니다')).toBeVisible();

  // 키워드 추가
  await page.getByRole('button', { name: '키워드 추가' }).click();
  await page.getByPlaceholder('키워드 입력').fill('테스트 키워드');
  await page.getByRole('button', { name: '저장' }).click();

  // 결과 확인
  await expect(page.getByText('테스트 키워드')).toBeVisible();
});
```

---

## 10. 결론

### 현재 상태 요약

Keywords 페이지는 기본적인 CRUD 기능과 AI 추천 기능을 갖추고 있으나, **시각적 완성도와 UX 세련도가 크게 부족**합니다. Claude.ai와 비교했을 때:

**부족한 점**:
- 평면적이고 단조로운 디자인
- 애니메이션 부재
- 빈약한 빈 상태 처리
- 인라인 스타일 남발
- 미구현된 핵심 기능 (편집/삭제)

**강점**:
- 명확한 정보 구조
- 효율적인 검색
- 다국어 지원
- 적절한 상태 관리

### 개선 방향

1. **Phase 1 (핵심 개선)**: 스켈레톤, EmptyState, 편집/삭제 기능 → **즉각적인 품질 향상**
2. **Phase 2 (시각적 향상)**: Hero Section, 테이블 UI, 애니메이션 → **Claude.ai 수준 도달**
3. **Phase 3 (고급 기능)**: 페이지네이션, 모바일, 일괄 작업 → **사용성 극대화**
4. **Phase 4 (데이터 시각화)**: 차트, 분석 → **전문성 강화**

이 보고서의 제안을 순차적으로 구현하면, Claude.ai 수준의 전문적이고 세련된 키워드 관리 페이지를 완성할 수 있습니다.

---

**작성일**: 2025-11-16
**작성자**: Claude (AI Agent)
**버전**: 1.0
