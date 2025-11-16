# 랜딩페이지 분석 및 개선안

## 1. 현재 상태 분석

### 1.1 페이지 구조

현재 랜딩페이지는 다음과 같은 섹션으로 구성되어 있습니다:

1. **Header** - 고정 헤더 (로고, 네비게이션, CTA)
2. **Hero Section** - 메인 히어로 영역
3. **Features Section** - 4가지 주요 기능 소개
4. **How It Works Section** - 3단계 사용 방법
5. **Use Cases Section** - 4가지 활용 사례
6. **Pricing Section** - 2가지 가격 플랜 (Free, Pro)
7. **Final CTA Section** - 최종 행동 유도
8. **Footer** - 푸터 (링크, 소셜 미디어)

### 1.2 강점

**디자인 일관성**
- Tailwind CSS 기반의 일관된 컬러 시스템 (`#111827`, `#6B7280`, `#3BA2F8`, `#FCFCFD`)
- 명확한 타이포그래피 계층 구조
- 반응형 디자인 적용 (모바일, 태블릿, 데스크톱)

**애니메이션**
- framer-motion을 사용한 Hero 섹션의 부드러운 진입 애니메이션
- stagger 효과로 순차적 요소 표시

**컨텐츠 구조**
- 명확한 가치 제안 (Hero)
- 기능-사용법-활용사례-가격의 논리적 흐름
- i18n 지원으로 다국어 대응 (next-intl)

**사용성**
- 명확한 CTA 버튼 배치
- 앵커 링크를 통한 섹션 간 이동
- 모바일 메뉴 지원

### 1.3 약점 및 개선 필요 부분

#### 심각한 문제점

**1. 시각적 임팩트 부족**
- Hero 섹션에 비주얼 요소가 전혀 없음 (스크린샷, 일러스트레이션, 데모 등)
- 텍스트만으로는 제품의 가치를 전달하기 어려움
- claude.ai와 같은 프리미엄 SaaS는 반드시 제품 UI를 시각적으로 보여줌

**2. 애니메이션이 Hero에만 집중됨**
- Features, How It Works, Use Cases, Pricing 섹션은 정적임
- 스크롤 기반 인터랙션이 전무함
- 현대적인 SaaS 랜딩페이지는 스크롤에 반응하는 애니메이션 필수

**3. Social Proof 부재**
- Hero 섹션에 "이미 1,000+ 개의 블로그가 사용 중"이라는 텍스트만 있음
- 실제 고객 로고, 후기, 통계 등이 없음
- 신뢰 구축 요소가 매우 약함

**4. Features 섹션의 차별성 부족**
- 단순 아이콘 + 텍스트 나열
- 각 기능의 실제 작동 방식을 보여주는 인터랙티브 요소 없음
- 경쟁사와 차별화되는 지점을 시각적으로 강조하지 못함

**5. How It Works 섹션의 정적임**
- 단계별 설명이 텍스트로만 제공됨
- 실제 프로세스를 보여주는 애니메이션이나 비디오 없음
- "5분" 뱃지가 하단에만 있어 임팩트 약함

**6. Use Cases 섹션의 피상적 설명**
- 활용 사례가 너무 일반적이고 추상적임
- 구체적인 성과나 Before/After 비교 없음
- 사용자 스토리나 실제 사례가 없음

**7. Pricing 섹션의 불명확한 가치 제안**
- Free vs Pro의 차이가 feature 개수로만 표현됨
- 각 플랜의 핵심 가치 제안이 불명확함
- 가격 정당화를 위한 ROI 설명 부족

**8. CTA 섹션의 반복적 메시지**
- Hero와 Final CTA가 거의 동일한 메시지
- 사용자가 페이지를 내려온 맥락을 고려하지 않음
- 긴급성이나 특별한 이유를 제공하지 못함

**9. 컬러 팔레트의 단조로움**
- 주요 색상이 파란색 하나뿐 (`#3BA2F8`)
- 그레이 톤 위주로 활기가 부족함
- Accent 컬러나 그라디언트 활용 전무

**10. 미세한 UX 이슈**
- Header의 스크롤 시 변화가 미미함
- 섹션 간 전환이 급격함 (트랜지션 없음)
- 호버 효과가 제한적이고 예측 가능함

---

## 2. claude.ai 참고 분석

### 2.1 claude.ai의 핵심 디자인 패턴

claude.ai는 다음과 같은 요소들로 프리미엄 SaaS의 표준을 제시합니다:

**Hero 섹션**
- 강력한 헤드라인 + 제품 UI 스크린샷/데모
- 멀티 CTA 전략 (Sign Up + Watch Demo)
- 실시간 타이핑 효과나 인터랙티브 요소
- 배경에 그라디언트 메쉬나 서틀한 애니메이션

**Features 섹션**
- 각 기능별로 전체 화면을 사용하는 대형 섹션
- 텍스트 설명 + 실제 UI 스크린샷/동영상
- 스크롤 기반 패럴랙스 효과
- 번갈아가며 좌/우 레이아웃 배치 (지그재그 패턴)

**Social Proof**
- 주요 기업 로고 그리드
- 사용자 통계 (사용자 수, 생성된 콘텐츠 수 등)
- 실제 고객 후기 (사진, 이름, 회사)

**애니메이션 철학**
- 서틀하고 부드러운 애니메이션 (과하지 않음)
- 스크롤 진행도에 따른 요소 페이드인
- 마이크로 인터랙션 (버튼 호버, 카드 호버)
- 성능 최적화 (will-change, transform 활용)

**컬러 시스템**
- 브랜드 컬러 (주황/갈색 톤)
- 고대비 배경 (다크/라이트 섹션 교차)
- 그라디언트를 통한 시각적 깊이
- Accent 컬러로 중요 요소 강조

---

## 3. 개선된 페이지 구성

### 3.1 Hero Section

**목적**: 5초 안에 제품의 핵심 가치를 전달하고 즉각적인 행동 유도

**메시지 구조**:
- **Eyebrow Badge**: "AI 기반 콘텐츠 생성" (현재 유지)
- **Main Headline**: "AI로 SEO에 최적화된 블로그 글을 5분 만에 생성하세요" (구체적 수치 추가)
- **Subheadline**: "스타일 가이드 한 번 설정으로, 브랜드 일관성을 유지하며 매달 수십 개의 고품질 콘텐츠를 자동 생성하세요."
- **Primary CTA**: "무료로 시작하기" (돋보이는 버튼)
- **Secondary CTA**: "2분 데모 보기" (비디오/인터랙티브 데모)
- **Trust Badge**: 기업 로고 그리드 또는 "1,000+ 블로그 신뢰"

**비주얼 요소**:
- 우측 절반에 제품 UI 스크린샷 (글 생성 과정)
- 애니메이션: 실시간 타이핑 효과로 AI 생성 과정 시뮬레이션
- 배경: 서틀한 그라디언트 메쉬 (파란색 → 보라색)

**레이아웃**:
```
┌──────────────────────────────────────┐
│  [Badge]                             │
│                                      │
│  [Headline]                   ┌──────┤
│  [Subheadline]                │      │
│                               │ UI   │
│  [CTA Primary] [CTA Sec]      │ Demo │
│                               │      │
│  [Trust Badge]                └──────┤
└──────────────────────────────────────┘
```

---

### 3.2 Social Proof Section (새로 추가)

**목적**: 신뢰 구축 및 불안 해소

**구성 요소**:
- **고객 로고 그리드**: 6-8개 주요 고객사 로고
- **사용 통계**:
  - "10,000+ 생성된 블로그 글"
  - "평균 80% 작성 시간 단축"
  - "SEO 점수 평균 85/100"
- **짧은 고객 후기**: 3개 카드 (이름, 회사, 사진, 한 문장 후기)

**레이아웃**: 3열 통계 카드 + 고객 후기 슬라이더

---

### 3.3 Features Section (대폭 개편)

**목적**: 핵심 기능을 시각적으로 깊이 있게 전달

**변경 사항**:
- 4개 기능을 각각 전체 화면 섹션으로 확대
- 각 기능마다 실제 UI 스크린샷/동영상 추가
- 좌/우 교차 레이아웃 (지그재그 패턴)
- 스크롤 기반 애니메이션

**4개 기능 상세 명세**:

#### Feature 1: AI 글 생성 (좌측 텍스트, 우측 UI)
- **제목**: "주제만 입력하면, AI가 완성도 높은 블로그 글을 5분 만에"
- **설명**: "SEO 최적화, 구조화된 헤딩, 자연스러운 키워드 배치까지 자동으로"
- **UI**: 글 생성 프로세스 애니메이션 (입력 → 생성 중 → 완성)
- **통계**: "평균 생성 시간 3분 42초"

#### Feature 2: 키워드 관리 (우측 텍스트, 좌측 UI)
- **제목**: "검색량과 경쟁도 분석으로 전략적 키워드 선택"
- **설명**: "AI 추천 롱테일 키워드로 검색 노출을 극대화하세요"
- **UI**: 키워드 테이블 + 분석 차트
- **통계**: "평균 키워드 순위 상승률 42%"

#### Feature 3: 브랜드 보이스 (좌측 텍스트, 우측 UI)
- **제목**: "브랜드 고유의 톤과 스타일을 일관되게 유지"
- **설명**: "한 번 설정으로 모든 콘텐츠에 브랜드 정체성 자동 적용"
- **UI**: 스타일 가이드 설정 화면 + Before/After 비교
- **통계**: "브랜드 일관성 90% 유지"

#### Feature 4: 실시간 편집 (우측 텍스트, 좌측 UI)
- **제목**: "마크다운 편집기로 즉시 수정 및 다운로드"
- **설명**: "생성된 글을 바로 편집하고 SEO 점수를 실시간 확인"
- **UI**: 에디터 화면 (편집 탭 + 미리보기 탭)
- **통계**: "평균 수정 시간 10분 이하"

---

### 3.4 How It Works Section

**목적**: 사용자가 제품을 사용하는 과정을 직관적으로 이해

**변경 사항**:
- 3단계 → 4단계로 확장 (온보딩 강조)
- 각 단계별 UI 스크린샷 추가
- 단계 간 연결선 애니메이션
- 전체 프로세스 타임라인 강조 ("총 소요 시간 10분")

**4단계 상세**:

1. **가입 및 온보딩 (2분)**
   - 아이콘: User
   - 설명: "간단한 질문에 답하며 스타일 가이드 자동 생성"
   - UI: 온보딩 마법사 스크린샷

2. **스타일 가이드 설정 (3분)**
   - 아이콘: Palette
   - 설명: "브랜드 보이스, 타겟 독자, 톤 정의"
   - UI: 스타일 가이드 편집 화면

3. **주제 입력 및 AI 생성 (3분)**
   - 아이콘: Sparkles
   - 설명: "주제와 키워드 입력 후 AI가 자동 생성"
   - UI: 생성 중 프로그레스 화면

4. **편집 및 다운로드 (2분)**
   - 아이콘: FileEdit
   - 설명: "필요한 부분 수정 후 마크다운으로 다운로드"
   - UI: 에디터 화면

---

### 3.5 Use Cases Section (대폭 개편)

**목적**: 구체적인 성공 사례로 사용자에게 영감 제공

**변경 사항**:
- 4개 활용 사례 → 3개 심화 사례
- 각 사례마다 구체적 성과 수치 추가
- Before/After 비교 또는 실제 고객 후기

**3개 사례 상세**:

#### Use Case 1: 스타트업 블로그 운영
- **시나리오**: "월 2개 → 월 20개 블로그 글로 유입 3배 증가"
- **고객**: "테크 스타트업 A사"
- **성과**:
  - 블로그 유입 300% 증가
  - 작성 시간 80% 단축
  - SEO 순위 평균 15위 상승
- **UI**: 트래픽 그래프 (Before/After)

#### Use Case 2: 개인 블로거 수익화
- **시나리오**: "부업으로 월 50개 블로그 글 작성해 애드센스 수익 창출"
- **고객**: "파이낸스 블로거 B씨"
- **성과**:
  - 월 수익 0원 → 150만원
  - 일 평균 작성 시간 3시간 → 30분
  - 네이버 검색 상위 노출 키워드 50개
- **UI**: 수익 그래프 + 검색 순위 스크린샷

#### Use Case 3: 콘텐츠 마케팅 에이전시
- **시나리오**: "고객사 10곳에 매달 100개 이상 콘텐츠 제공"
- **고객**: "마케팅 에이전시 C사"
- **성과**:
  - 고객사 10곳 동시 관리
  - 콘텐츠 제작 비용 70% 절감
  - 클라이언트 만족도 95%
- **UI**: 멀티 클라이언트 대시보드

---

### 3.6 Pricing Section

**목적**: 명확한 가치 제안과 가격 정당화

**변경 사항**:
- Free vs Pro 차이를 "가치"로 표현
- 각 플랜의 핵심 베네핏 강조
- ROI 계산기 추가 (선택 사항)
- "가장 인기" 뱃지 → "Best Value" 뱃지

**Free Plan 개선**:
- 이름: "Starter"
- 헤드라인: "개인 블로거를 위한 시작"
- 가격: ₩0 / 월
- 핵심 베네핏: "부담 없이 AI 글쓰기 경험"
- Features:
  - ✅ 월 5개 글 생성
  - ✅ 기본 키워드 관리
  - ✅ 1개 스타일 가이드
  - ✅ 마크다운 다운로드
  - ✅ 커뮤니티 지원
  - ❌ 고급 SEO 분석
- CTA: "무료로 시작하기"

**Pro Plan 개선**:
- 이름: "Professional"
- Badge: "Best Value"
- 헤드라인: "전문 블로거 및 팀을 위한 선택"
- 가격: ~~₩49,000~~ ₩29,000 / 월 (할인 강조)
- 핵심 베네핏: "월 300만원 상당 작성 시간 절약"
- Features:
  - ✅ 월 50개 글 생성
  - ✅ 고급 키워드 분석 (검색량, 경쟁도)
  - ✅ 무제한 스타일 가이드
  - ✅ AI 키워드 추천
  - ✅ SEO 점수 분석
  - ✅ 우선 지원 (24시간 이내 응답)
- ROI 설명: "글 1개 작성 시간 3시간 → 10분 (시급 15,000원 기준, 월 360만원 절약)"
- CTA: "14일 무료 체험 시작"

**Enterprise Plan 추가 (선택 사항)**:
- 이름: "Enterprise"
- 헤드라인: "대규모 팀 및 에이전시"
- 가격: "문의하기"
- Features:
  - ✅ 무제한 글 생성
  - ✅ 전담 계정 매니저
  - ✅ API 접근
  - ✅ 커스텀 통합
  - ✅ SLA 보장
- CTA: "영업팀 문의"

---

### 3.7 FAQ Section (새로 추가)

**목적**: 구매 장벽 제거 및 불안 해소

**질문 목록** (Accordion 형식):
1. "AI가 생성한 글의 품질은 어떤가요?"
2. "무료 플랜으로 얼마나 사용할 수 있나요?"
3. "생성된 글의 저작권은 누구에게 있나요?"
4. "SEO 최적화는 어떻게 이루어지나요?"
5. "환불 정책은 어떻게 되나요?"
6. "스타일 가이드 설정이 어렵지 않나요?"

---

### 3.8 Final CTA Section

**목적**: 페이지를 끝까지 본 사용자에게 마지막 전환 기회 제공

**변경 사항**:
- Hero와 차별화된 메시지 (긴급성 추가)
- 더 강한 비주얼 (배경 그라디언트, 일러스트)
- 다중 CTA 옵션

**메시지**:
- **Headline**: "오늘부터 AI로 블로그 글쓰기를 시작하세요"
- **Subheadline**: "지금 가입하면 첫 30일 Pro 기능 무료 체험"
- **Primary CTA**: "무료로 시작하기" (강조)
- **Secondary CTA**: "영업팀과 상담하기"
- **Trust Badge**: "신용카드 불필요 · 언제든 해지 가능"

---

## 4. UI 디자인 컨셉

### 4.1 컬러 시스템

현재 컬러 시스템을 확장하고 깊이를 추가합니다.

```typescript
const colors = {
  // Primary (Blue) - 현재 유지하되 확장
  primary: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3BA2F8", // 메인 브랜드 컬러
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },

  // Secondary (Purple) - 새로 추가 (그라디언트용)
  secondary: {
    50: "#FAF5FF",
    100: "#F3E8FF",
    200: "#E9D5FF",
    300: "#D8B4FE",
    400: "#C084FC",
    500: "#A855F7",
    600: "#9333EA",
    700: "#7C3AED",
    800: "#6B21A8",
    900: "#581C87",
  },

  // Accent (Orange/Amber) - 새로 추가 (강조용)
  accent: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  // Neutral (Gray) - 현재 유지
  neutral: {
    50: "#FCFCFD",  // 배경
    100: "#F5F7FA",
    200: "#E1E5EA",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",  // 헤딩
  },

  // Success, Error, Warning (상태 표시용)
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",

  // Gradients (Hero, CTA 배경용)
  gradients: {
    primary: "linear-gradient(135deg, #3BA2F8 0%, #A855F7 100%)",
    secondary: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
    subtle: "radial-gradient(circle at 50% 50%, rgba(59,162,248,0.1) 0%, transparent 50%)",
  },
};
```

**사용 전략**:
- **Primary Blue**: CTA 버튼, 링크, 주요 아이콘
- **Secondary Purple**: 그라디언트 배경, Accent
- **Accent Orange**: 특별 뱃지 ("Best Value", "New"), 호버 효과
- **Neutral Gray**: 텍스트, 배경, 테두리
- **Gradients**: Hero 배경, CTA 섹션 배경

---

### 4.2 타이포그래피

Tailwind CSS 기본 스케일을 활용하되, 계층을 명확히 합니다.

```typescript
const typography = {
  // Display (Hero Headline)
  display: {
    desktop: "text-7xl font-bold leading-tight tracking-tight", // 72px
    tablet: "text-6xl font-bold leading-tight tracking-tight",  // 60px
    mobile: "text-5xl font-bold leading-tight tracking-tight",  // 48px
  },

  // Heading 1 (Section Titles)
  h1: {
    desktop: "text-5xl font-bold leading-tight tracking-tight", // 48px
    tablet: "text-4xl font-bold leading-tight tracking-tight",  // 36px
    mobile: "text-3xl font-bold leading-tight tracking-tight",  // 30px
  },

  // Heading 2 (Subsection Titles)
  h2: {
    desktop: "text-4xl font-bold leading-snug",  // 36px
    tablet: "text-3xl font-bold leading-snug",   // 30px
    mobile: "text-2xl font-bold leading-snug",   // 24px
  },

  // Heading 3 (Card Titles)
  h3: {
    desktop: "text-2xl font-semibold leading-normal", // 24px
    tablet: "text-xl font-semibold leading-normal",   // 20px
    mobile: "text-lg font-semibold leading-normal",   // 18px
  },

  // Body Large (Hero Subheadline)
  bodyLarge: {
    desktop: "text-xl font-normal leading-relaxed",  // 20px
    tablet: "text-lg font-normal leading-relaxed",   // 18px
    mobile: "text-base font-normal leading-relaxed", // 16px
  },

  // Body (Default Text)
  body: {
    desktop: "text-base font-normal leading-relaxed", // 16px
    tablet: "text-base font-normal leading-relaxed",
    mobile: "text-sm font-normal leading-relaxed",    // 14px
  },

  // Body Small (Caption, Helper Text)
  bodySmall: {
    all: "text-sm font-normal leading-normal", // 14px
  },

  // Label (Buttons, Badges)
  label: {
    large: "text-base font-medium",  // 16px
    medium: "text-sm font-medium",   // 14px
    small: "text-xs font-medium",    // 12px
  },
};
```

**폰트 설정** (next.config.js / layout.tsx):
```typescript
// Inter 폰트 사용 (Tailwind CSS 기본 권장)
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
```

---

### 4.3 간격 시스템

일관된 리듬감을 위한 간격 규칙:

```typescript
const spacing = {
  // Section Padding (세로 간격)
  section: {
    desktop: "py-20 md:py-24 lg:py-32",  // 80px ~ 128px
    tablet: "py-16 md:py-20",            // 64px ~ 80px
    mobile: "py-12 md:py-16",            // 48px ~ 64px
  },

  // Container Padding (가로 여백)
  container: {
    all: "px-4 md:px-6 lg:px-8",  // 16px ~ 32px
  },

  // Element Spacing (요소 간 간격)
  stack: {
    xs: "space-y-2",   // 8px
    sm: "space-y-4",   // 16px
    md: "space-y-6",   // 24px
    lg: "space-y-8",   // 32px
    xl: "space-y-12",  // 48px
  },

  // Grid Gap
  grid: {
    sm: "gap-4",   // 16px
    md: "gap-6",   // 24px
    lg: "gap-8",   // 32px
    xl: "gap-12",  // 48px
  },
};
```

---

### 4.4 카드 스타일

Features, Use Cases, Pricing 카드에 적용할 스타일:

```typescript
const cardStyles = {
  // Base Card
  base: "rounded-xl border border-neutral-200 bg-white p-6 md:p-8",

  // Hover Card (Features, Use Cases)
  hover: "rounded-xl border border-neutral-200 bg-white p-6 md:p-8 transition-all duration-300 hover:border-primary-500 hover:shadow-xl hover:-translate-y-1",

  // Highlighted Card (Pricing Pro)
  highlighted: "rounded-xl border-2 border-primary-500 bg-white p-6 md:p-8 shadow-2xl scale-105",

  // Glass Card (Hero, CTA)
  glass: "rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-6 md:p-8",

  // Shadow
  shadow: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
  },
};
```

---

### 4.5 다크모드 고려사항

현재는 라이트 모드만 있지만, 향후 다크모드 지원을 위한 준비:

```typescript
// Tailwind Config에 dark mode 활성화
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark mode용 배경 및 텍스트
        dark: {
          bg: {
            primary: "#0F1419",
            secondary: "#1A1F26",
            tertiary: "#24292F",
          },
          text: {
            primary: "#E6EDF3",
            secondary: "#9198A1",
            tertiary: "#6E7681",
          },
        },
      },
    },
  },
};
```

**다크모드 적용 예시**:
```tsx
<div className="bg-white dark:bg-dark-bg-primary text-neutral-900 dark:text-dark-text-primary">
  {/* 컨텐츠 */}
</div>
```

---

## 5. 섹션별 컴포넌트 명세

### 5.1 Hero Section

#### HeroSection Component
- **파일**: `src/features/landing/components/hero-section.tsx`
- **Props**:
```typescript
interface HeroSectionProps {
  badge?: string;
  heading: string;
  subheading: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
    onClick?: () => void; // For demo modal
  };
  trustBadge?: string;
  demoVideo?: string; // URL to demo video
}
```

- **하위 컴포넌트**:
  - `HeroBadge`: 상단 eyebrow 뱃지
  - `HeroHeading`: 메인 헤드라인
  - `HeroSubheading`: 서브 헤드라인
  - `HeroCTA`: CTA 버튼 그룹
  - `HeroVisual`: 우측 UI 데모 (스크린샷 또는 비디오)
  - `HeroBackground`: 배경 그라디언트 애니메이션

- **데이터 구조**:
```typescript
const heroData = {
  badge: "AI 기반 콘텐츠 생성",
  heading: "AI로 SEO에 최적화된 블로그 글을 5분 만에 생성하세요",
  subheading: "스타일 가이드 한 번 설정으로, 브랜드 일관성을 유지하며 매달 수십 개의 고품질 콘텐츠를 자동 생성하세요.",
  primaryCta: {
    text: "무료로 시작하기",
    href: "/signup",
  },
  secondaryCta: {
    text: "2분 데모 보기",
    href: "#",
    onClick: () => openDemoModal(),
  },
  trustBadge: "1,000+ 블로그가 신뢰",
  demoVideo: "/videos/hero-demo.mp4",
};
```

---

### 5.2 Social Proof Section

#### SocialProofSection Component
- **파일**: `src/features/landing/components/social-proof-section.tsx`
- **Props**:
```typescript
interface SocialProofSectionProps {
  logos: {
    name: string;
    imageUrl: string;
  }[];
  stats: {
    label: string;
    value: string;
    suffix?: string;
  }[];
  testimonials: {
    name: string;
    role: string;
    company: string;
    avatarUrl: string;
    quote: string;
  }[];
}
```

- **하위 컴포넌트**:
  - `LogoGrid`: 고객사 로고 그리드
  - `StatCard`: 통계 카드
  - `TestimonialSlider`: 고객 후기 슬라이더

- **데이터 구조**:
```typescript
const socialProofData = {
  logos: [
    { name: "Company A", imageUrl: "/logos/company-a.png" },
    { name: "Company B", imageUrl: "/logos/company-b.png" },
    // ...
  ],
  stats: [
    { label: "생성된 블로그 글", value: "10,000", suffix: "+" },
    { label: "평균 시간 단축", value: "80", suffix: "%" },
    { label: "평균 SEO 점수", value: "85", suffix: "/100" },
  ],
  testimonials: [
    {
      name: "김철수",
      role: "마케팅 팀장",
      company: "테크 스타트업 A",
      avatarUrl: "/avatars/user-1.jpg",
      quote: "SEO24 덕분에 콘텐츠 생산성이 3배 늘었습니다.",
    },
    // ...
  ],
};
```

---

### 5.3 Features Section

#### FeaturesSection Component
- **파일**: `src/features/landing/components/features-section.tsx`
- **Props**:
```typescript
interface FeaturesSectionProps {
  heading: string;
  subheading: string;
  features: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
    stats?: string;
    position: "left" | "right"; // 좌/우 교차 레이아웃
  }[];
}
```

- **하위 컴포넌트**:
  - `FeatureCard`: 개별 기능 카드 (전체 화면 섹션)
  - `FeatureMedia`: 이미지 또는 비디오
  - `FeatureText`: 텍스트 영역

- **데이터 구조**:
```typescript
const featuresData = {
  heading: "강력한 기능으로 콘텐츠 제작 프로세스를 혁신하세요",
  subheading: "AI 기술로 더 빠르고, 더 쉽게, 더 나은 콘텐츠를 만드세요.",
  features: [
    {
      id: "ai-generation",
      title: "주제만 입력하면, AI가 완성도 높은 블로그 글을 5분 만에",
      description: "SEO 최적화, 구조화된 헤딩, 자연스러운 키워드 배치까지 자동으로",
      videoUrl: "/videos/ai-generation.mp4",
      stats: "평균 생성 시간 3분 42초",
      position: "left",
    },
    {
      id: "keyword-management",
      title: "검색량과 경쟁도 분석으로 전략적 키워드 선택",
      description: "AI 추천 롱테일 키워드로 검색 노출을 극대화하세요",
      imageUrl: "/images/keyword-management.png",
      stats: "평균 키워드 순위 상승률 42%",
      position: "right",
    },
    // ...
  ],
};
```

---

### 5.4 How It Works Section

#### HowItWorksSection Component
- **파일**: `src/features/landing/components/how-it-works-section.tsx`
- **Props**:
```typescript
interface HowItWorksSectionProps {
  heading: string;
  subheading: string;
  totalTime?: string;
  steps: {
    number: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    duration: string;
    imageUrl?: string;
  }[];
}
```

- **하위 컴포넌트**:
  - `StepCard`: 단계 카드
  - `StepConnector`: 단계 간 연결선 (애니메이션)
  - `TimelineBadge`: 전체 소요 시간 뱃지

- **데이터 구조**:
```typescript
const howItWorksData = {
  heading: "간단한 4단계로 AI 콘텐츠 생성 시작",
  subheading: "누구나 10분 안에 첫 블로그 글을 생성할 수 있습니다.",
  totalTime: "총 소요 시간 10분",
  steps: [
    {
      number: "01",
      icon: <User />,
      title: "가입 및 온보딩",
      description: "간단한 질문에 답하며 스타일 가이드 자동 생성",
      duration: "2분",
      imageUrl: "/images/step-1.png",
    },
    // ...
  ],
};
```

---

### 5.5 Use Cases Section

#### UseCasesSection Component
- **파일**: `src/features/landing/components/use-cases-section.tsx`
- **Props**:
```typescript
interface UseCasesSectionProps {
  heading: string;
  subheading: string;
  useCases: {
    id: string;
    scenario: string;
    customer: string;
    outcomes: {
      label: string;
      value: string;
    }[];
    imageUrl?: string;
    testimonial?: {
      quote: string;
      author: string;
    };
  }[];
}
```

- **하위 컴포넌트**:
  - `UseCaseCard`: 활용 사례 카드
  - `OutcomeList`: 성과 목록
  - `BeforeAfterChart`: Before/After 차트 (선택)

- **데이터 구조**:
```typescript
const useCasesData = {
  heading: "실제 사용자들의 성공 스토리",
  subheading: "다양한 분야에서 SEO24로 콘텐츠 생산성을 극대화하고 있습니다.",
  useCases: [
    {
      id: "startup-blog",
      scenario: "월 2개 → 월 20개 블로그 글로 유입 3배 증가",
      customer: "테크 스타트업 A사",
      outcomes: [
        { label: "블로그 유입", value: "300% 증가" },
        { label: "작성 시간", value: "80% 단축" },
        { label: "SEO 순위", value: "평균 15위 상승" },
      ],
      imageUrl: "/images/use-case-1.png",
      testimonial: {
        quote: "SEO24 없이는 이 성장 속도를 낼 수 없었을 거예요.",
        author: "김철수, 마케팅 팀장",
      },
    },
    // ...
  ],
};
```

---

### 5.6 Pricing Section

#### PricingSection Component
- **파일**: `src/features/landing/components/pricing-section.tsx`
- **Props**:
```typescript
interface PricingSectionProps {
  heading: string;
  subheading: string;
  plans: {
    id: string;
    name: string;
    badge?: string; // "Best Value"
    headline: string;
    price: {
      amount: number;
      currency: string;
      period: string;
      originalPrice?: number; // For strikethrough
    };
    roi?: string;
    features: {
      text: string;
      included: boolean;
    }[];
    cta: {
      text: string;
      href: string;
    };
    highlighted?: boolean;
  }[];
}
```

- **하위 컴포넌트**:
  - `PricingCard`: 가격 플랜 카드
  - `PriceBadge`: "Best Value" 뱃지
  - `FeatureList`: 기능 목록 (체크/크로스 아이콘)
  - `ROICalculator`: ROI 계산기 (선택 사항)

- **데이터 구조**:
```typescript
const pricingData = {
  heading: "합리적인 가격으로 시작하세요",
  subheading: "필요에 맞는 플랜을 선택하고 언제든 업그레이드하세요.",
  plans: [
    {
      id: "starter",
      name: "Starter",
      headline: "개인 블로거를 위한 시작",
      price: {
        amount: 0,
        currency: "₩",
        period: "월",
      },
      features: [
        { text: "월 5개 글 생성", included: true },
        { text: "기본 키워드 관리", included: true },
        { text: "1개 스타일 가이드", included: true },
        { text: "마크다운 다운로드", included: true },
        { text: "커뮤니티 지원", included: true },
        { text: "고급 SEO 분석", included: false },
      ],
      cta: {
        text: "무료로 시작하기",
        href: "/signup",
      },
    },
    {
      id: "professional",
      name: "Professional",
      badge: "Best Value",
      headline: "전문 블로거 및 팀을 위한 선택",
      price: {
        amount: 29000,
        currency: "₩",
        period: "월",
        originalPrice: 49000,
      },
      roi: "월 300만원 상당 작성 시간 절약",
      features: [
        { text: "월 50개 글 생성", included: true },
        { text: "고급 키워드 분석 (검색량, 경쟁도)", included: true },
        { text: "무제한 스타일 가이드", included: true },
        { text: "AI 키워드 추천", included: true },
        { text: "SEO 점수 분석", included: true },
        { text: "우선 지원 (24시간 이내 응답)", included: true },
      ],
      cta: {
        text: "14일 무료 체험 시작",
        href: "/signup?plan=pro",
      },
      highlighted: true,
    },
  ],
};
```

---

### 5.7 FAQ Section

#### FAQSection Component
- **파일**: `src/features/landing/components/faq-section.tsx`
- **Props**:
```typescript
interface FAQSectionProps {
  heading: string;
  subheading?: string;
  faqs: {
    question: string;
    answer: string;
  }[];
}
```

- **하위 컴포넌트**:
  - `FAQAccordion`: Accordion UI (shadcn-ui)
  - `FAQItem`: 개별 FAQ 항목

- **데이터 구조**:
```typescript
const faqData = {
  heading: "자주 묻는 질문",
  subheading: "궁금한 점이 있으신가요? 여기서 답을 찾아보세요.",
  faqs: [
    {
      question: "AI가 생성한 글의 품질은 어떤가요?",
      answer: "GPT-4 기반 AI로 생성되며, 평균 SEO 점수 85/100을 기록합니다. 실제 사용자의 95%가 품질에 만족한다고 평가했습니다.",
    },
    {
      question: "무료 플랜으로 얼마나 사용할 수 있나요?",
      answer: "무료 플랜은 매월 5개의 블로그 글을 생성할 수 있으며, 기본 키워드 관리와 1개의 스타일 가이드를 사용할 수 있습니다.",
    },
    // ...
  ],
};
```

---

### 5.8 Final CTA Section

#### FinalCtaSection Component
- **파일**: `src/features/landing/components/final-cta-section.tsx`
- **Props**:
```typescript
interface FinalCtaSectionProps {
  heading: string;
  subheading: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  trustBadge?: string;
  backgroundGradient?: string;
}
```

- **하위 컴포넌트**:
  - `CtaHeading`: 헤드라인
  - `CtaButtons`: CTA 버튼 그룹
  - `CtaBackground`: 배경 그라디언트/일러스트

- **데이터 구조**:
```typescript
const finalCtaData = {
  heading: "오늘부터 AI로 블로그 글쓰기를 시작하세요",
  subheading: "지금 가입하면 첫 30일 Pro 기능 무료 체험",
  primaryCta: {
    text: "무료로 시작하기",
    href: "/signup",
  },
  secondaryCta: {
    text: "영업팀과 상담하기",
    href: "/contact",
  },
  trustBadge: "신용카드 불필요 · 언제든 해지 가능",
  backgroundGradient: "linear-gradient(135deg, #3BA2F8 0%, #A855F7 100%)",
};
```

---

## 6. 애니메이션 및 인터랙션 명세

### 6.1 Hero Section Animations

#### HeroSection Container
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};
```

#### HeroBadge
```typescript
const badgeVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};
```

#### HeroHeading
```typescript
const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1], // Cubic bezier
    },
  },
};
```

#### HeroSubheading
```typescript
const subheadingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.2,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};
```

#### HeroCTA
```typescript
const ctaVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.3,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

// Button Hover
const buttonHoverVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.95,
  },
};
```

#### HeroVisual
```typescript
const visualVariants = {
  hidden: { opacity: 0, scale: 0.9, x: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.8,
      delay: 0.4,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

// Parallax on scroll
const [scrollY, setScrollY] = useState(0);

useEffect(() => {
  const handleScroll = () => setScrollY(window.scrollY);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

const parallaxY = scrollY * 0.3; // 30% of scroll
```

#### HeroBackground (Gradient Mesh)
```typescript
const backgroundVariants = {
  initial: {
    backgroundPosition: "0% 50%",
  },
  animate: {
    backgroundPosition: "100% 50%",
    transition: {
      duration: 20,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "linear",
    },
  },
};

// CSS
background: linear-gradient(135deg, #3BA2F8 0%, #A855F7 100%);
background-size: 200% 200%;
```

---

### 6.2 Social Proof Section Animations

#### LogoGrid
```typescript
const logoGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const logoItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

// Usage with Intersection Observer
const { ref, inView } = useInView({
  triggerOnce: true,
  threshold: 0.1,
});

<motion.div
  ref={ref}
  variants={logoGridVariants}
  initial="hidden"
  animate={inView ? "visible" : "hidden"}
>
  {logos.map((logo) => (
    <motion.div key={logo.name} variants={logoItemVariants}>
      <img src={logo.imageUrl} alt={logo.name} />
    </motion.div>
  ))}
</motion.div>
```

#### StatCard
```typescript
const statCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Counter Animation (react-countup)
import CountUp from "react-countup";

<CountUp
  start={0}
  end={10000}
  duration={2}
  separator=","
  suffix="+"
/>
```

#### TestimonialSlider
```typescript
// Framer Motion Carousel
const [currentIndex, setCurrentIndex] = useState(0);

const sliderVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentIndex}
    custom={direction}
    variants={sliderVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    }}
  >
    {testimonials[currentIndex]}
  </motion.div>
</AnimatePresence>
```

---

### 6.3 Features Section Animations

#### FeatureCard (Scroll-triggered)
```typescript
const featureCardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

// Usage with Intersection Observer
const { ref, inView } = useInView({
  triggerOnce: true,
  threshold: 0.2, // Trigger when 20% visible
});

<motion.div
  ref={ref}
  variants={featureCardVariants}
  initial="hidden"
  animate={inView ? "visible" : "hidden"}
>
  {/* Feature content */}
</motion.div>
```

#### FeatureMedia (Image/Video)
```typescript
// Image Parallax
const imageParallaxVariants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

// Video Autoplay on scroll
const videoRef = useRef<HTMLVideoElement>(null);

useEffect(() => {
  if (inView && videoRef.current) {
    videoRef.current.play();
  } else if (videoRef.current) {
    videoRef.current.pause();
  }
}, [inView]);
```

#### FeatureText (Staggered)
```typescript
const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const textItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
  },
};
```

---

### 6.4 How It Works Section Animations

#### StepCard
```typescript
const stepCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

// Usage
{steps.map((step, index) => (
  <motion.div
    key={step.number}
    custom={index}
    variants={stepCardVariants}
    initial="hidden"
    animate={inView ? "visible" : "hidden"}
  >
    {/* Step content */}
  </motion.div>
))}
```

#### StepConnector (Arrow Animation)
```typescript
const arrowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  pulse: {
    x: [0, 10, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

<motion.div
  variants={arrowVariants}
  initial="hidden"
  animate={inView ? ["visible", "pulse"] : "hidden"}
>
  <ArrowRight />
</motion.div>
```

---

### 6.5 Use Cases Section Animations

#### UseCaseCard
```typescript
const useCaseCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.3,
    },
  },
};

<motion.div
  variants={useCaseCardVariants}
  initial="hidden"
  animate={inView ? "visible" : "hidden"}
  whileHover="hover"
>
  {/* Use case content */}
</motion.div>
```

#### OutcomeList (Counter Animation)
```typescript
// Outcome 숫자에 CountUp 적용
import CountUp from "react-countup";

{outcomes.map((outcome) => (
  <div key={outcome.label}>
    <CountUp
      start={0}
      end={parseInt(outcome.value)}
      duration={2}
      delay={0.5}
      separator=","
      suffix={outcome.suffix}
    />
  </div>
))}
```

---

### 6.6 Pricing Section Animations

#### PricingCard
```typescript
const pricingCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
  hover: {
    y: -8,
    boxShadow: "0 20px 40px rgba(59,162,248,0.2)",
    transition: {
      duration: 0.3,
    },
  },
};

// Highlighted card always slightly elevated
const highlightedVariants = {
  ...pricingCardVariants,
  visible: (i: number) => ({
    ...pricingCardVariants.visible(i),
    scale: 1.05,
  }),
};
```

#### FeatureList (Checkmark Animation)
```typescript
const checkmarkVariants = {
  hidden: { opacity: 0, pathLength: 0 },
  visible: (i: number) => ({
    opacity: 1,
    pathLength: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeInOut",
    },
  }),
};

<motion.svg variants={checkmarkVariants} custom={index}>
  <motion.path
    d="M5 10 L8 13 L15 6"
    stroke="#3BA2F8"
    strokeWidth={2}
    fill="none"
  />
</motion.svg>
```

---

### 6.7 FAQ Section Animations

#### FAQAccordion
```typescript
const accordionItemVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

// shadcn-ui Accordion with framer-motion
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

<Accordion type="single" collapsible>
  {faqs.map((faq, index) => (
    <AccordionItem key={index} value={`item-${index}`}>
      <AccordionTrigger>{faq.question}</AccordionTrigger>
      <AccordionContent>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={accordionItemVariants}
        >
          {faq.answer}
        </motion.div>
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

---

### 6.8 Final CTA Section Animations

#### CtaHeading
```typescript
const ctaHeadingVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};
```

#### CtaButtons
```typescript
const ctaButtonsVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Primary button pulse animation
const primaryButtonVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 30px rgba(59,162,248,0.4)",
  },
  tap: { scale: 0.95 },
  pulse: {
    boxShadow: [
      "0 0 0 0 rgba(59,162,248,0.7)",
      "0 0 0 10px rgba(59,162,248,0)",
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
    },
  },
};
```

#### CtaBackground
```typescript
// Animated gradient background
const backgroundVariants = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

<motion.div
  variants={backgroundVariants}
  animate="animate"
  style={{
    background: "linear-gradient(135deg, #3BA2F8 0%, #A855F7 100%)",
    backgroundSize: "200% 200%",
  }}
>
  {/* CTA content */}
</motion.div>
```

---

### 6.9 Global Scroll Animations

#### Scroll Progress Indicator
```typescript
import { useScroll, useSpring, motion } from "framer-motion";

const { scrollYProgress } = useScroll();
const scaleX = useSpring(scrollYProgress, {
  stiffness: 100,
  damping: 30,
  restDelta: 0.001,
});

<motion.div
  className="fixed top-0 left-0 right-0 h-1 bg-primary-500 z-50 origin-left"
  style={{ scaleX }}
/>
```

#### Parallax Sections
```typescript
import { useScroll, useTransform, motion } from "framer-motion";

const { scrollY } = useScroll();
const y = useTransform(scrollY, [0, 1000], [0, -100]); // Parallax effect

<motion.div style={{ y }}>
  {/* Content */}
</motion.div>
```

---

### 6.10 성능 최적화

#### Reduce Motion for Accessibility
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
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };
```

#### Will-Change Optimization
```tsx
// Only apply will-change during animation
<motion.div
  style={{ willChange: "transform, opacity" }}
  onAnimationComplete={() => {
    // Remove will-change after animation
  }}
>
```

#### layoutId for Shared Element Transitions
```tsx
// For smooth transitions between states
<motion.div layoutId="unique-id">
  {/* Content */}
</motion.div>
```

---

## 7. 레퍼런스

### 7.1 컬러 레퍼런스

**Primary Blue** (`#3BA2F8`):
- CTA 버튼 배경
- 링크 텍스트
- 아이콘 (호버 시)
- 프로그레스 바

**Secondary Purple** (`#A855F7`):
- 그라디언트 (Hero, CTA 배경)
- Accent 요소
- Badge 배경

**Accent Orange** (`#F59E0B`):
- "Best Value" 뱃지
- 특별 강조 요소
- 호버 시 보더

**Neutral Gray**:
- `#111827`: Heading
- `#6B7280`: Body text
- `#E1E5EA`: Border
- `#F5F7FA`: Background (light sections)
- `#FCFCFD`: Background (white sections)

---

### 7.2 타이포그래피 레퍼런스

**Font Family**: Inter (Google Fonts)

**Scale**:
- Display: 72px / 60px / 48px (Desktop / Tablet / Mobile)
- H1: 48px / 36px / 30px
- H2: 36px / 30px / 24px
- H3: 24px / 20px / 18px
- Body Large: 20px / 18px / 16px
- Body: 16px / 16px / 14px
- Body Small: 14px

**Weight**:
- Bold: 700 (Headings)
- Semibold: 600 (Subheadings)
- Medium: 500 (Buttons, Labels)
- Normal: 400 (Body text)

**Line Height**:
- Tight: 1.2 (Display, Headings)
- Snug: 1.375 (Subheadings)
- Normal: 1.5 (Default)
- Relaxed: 1.625 (Body text)

---

### 7.3 간격 레퍼런스

**Section Padding**:
- Desktop: 128px (py-32)
- Tablet: 80px (py-20)
- Mobile: 64px (py-16)

**Container Max Width**:
- Hero, CTA: 1280px (max-w-7xl)
- Features, Pricing: 1152px (max-w-6xl)
- How It Works: 1024px (max-w-5xl)

**Grid Gap**:
- Large: 48px (gap-12)
- Medium: 32px (gap-8)
- Small: 24px (gap-6)

---

### 7.4 애니메이션 레퍼런스

**Duration**:
- Fast: 200ms (hover, click)
- Medium: 400-600ms (진입 애니메이션)
- Slow: 800-1000ms (복잡한 애니메이션)

**Easing**:
- easeOut: `[0.25, 0.4, 0.25, 1]` (기본)
- easeInOut: `[0.42, 0, 0.58, 1]` (호버)
- Spring: `{ stiffness: 300, damping: 30 }` (인터랙티브)

**Stagger Delay**: 100-200ms

---

### 7.5 반응형 Breakpoints

```typescript
// Tailwind CSS 기본 breakpoints
const breakpoints = {
  sm: "640px",   // Mobile landscape
  md: "768px",   // Tablet
  lg: "1024px",  // Desktop
  xl: "1280px",  // Large desktop
  "2xl": "1536px", // Extra large
};
```

---

## 8. 구현 우선순위

### Phase 1: 필수 개선 (High Impact, High Urgency)
1. **Hero Section 비주얼 추가** (제품 UI 스크린샷/데모)
2. **Features Section 대형화** (전체 화면, 좌/우 교차 레이아웃)
3. **Social Proof Section 추가** (로고, 통계, 후기)
4. **스크롤 기반 애니메이션** (Intersection Observer + framer-motion)
5. **컬러 시스템 확장** (Purple, Orange 추가)

### Phase 2: 중요 개선 (High Impact, Medium Urgency)
6. **Use Cases 구체화** (성과 수치, Before/After)
7. **Pricing ROI 설명** (시간 절약 계산)
8. **FAQ Section 추가**
9. **Final CTA 차별화** (긴급성, 특별 제안)
10. **How It Works UI 스크린샷**

### Phase 3: 부가 개선 (Medium Impact, Low Urgency)
11. **데모 비디오/인터랙티브 데모**
12. **ROI 계산기** (Pricing Section)
13. **Enterprise Plan 추가**
14. **다크모드 지원**
15. **마이크로 인터랙션 강화** (버튼 hover, 카드 hover)

---

## 9. 성공 지표

### 디자인 품질
- [ ] claude.ai 수준의 시각적 완성도
- [ ] 모든 섹션에 비주얼 요소 포함
- [ ] 일관된 컬러/타이포그래피 시스템
- [ ] 부드럽고 성능 최적화된 애니메이션

### 사용자 경험
- [ ] 5초 안에 제품 가치 이해 가능
- [ ] 명확한 CTA 및 행동 유도
- [ ] 신뢰 구축 요소 (로고, 후기, 통계)
- [ ] 모바일 최적화 (터치 인터랙션)

### 기술 구현
- [ ] 접근성 준수 (WCAG 2.1 AA)
- [ ] 다국어 지원 (next-intl)
- [ ] SEO 최적화 (메타 태그, 구조화 데이터)
- [ ] 성능 최적화 (Lighthouse 90+ 점수)

### 전환율 최적화
- [ ] 다중 CTA 배치 (Hero, Section, Footer)
- [ ] 가격 정당화 (ROI 설명)
- [ ] 불안 해소 (FAQ, 환불 정책)
- [ ] 긴급성 및 희소성 (제한 제안)

---

## 10. 다음 단계

이 분석 보고서를 바탕으로 다음 단계를 진행하세요:

1. **우선순위 확정**: Phase 1 항목부터 순차적으로 구현
2. **디자인 목업**: Figma로 상세 디자인 (선택 사항)
3. **컴포넌트 구현**: 섹션별로 하나씩 구현 및 테스트
4. **애니메이션 적용**: framer-motion으로 점진적으로 추가
5. **데이터 통합**: i18n 메시지 키 업데이트
6. **QA 및 최적화**: 접근성, 성능, 반응형 테스트
7. **A/B 테스팅**: 전환율 측정 및 반복 개선

---

**작성일**: 2025-11-16
**작성자**: Claude (Senior UX/UI Designer & Frontend Architect)
**버전**: 1.0
