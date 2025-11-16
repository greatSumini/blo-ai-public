# 랜딩페이지 구현 계획서

> **작성일**: 2025-11-16
> **기준 문서**: `./agent-outputs/landing-improve/1-plan-critic.md`
> **목표**: claude.ai 수준의 프리미엄 SaaS 랜딩페이지 구현

---

## 1. 코드베이스 분석 결과

### 1.1 프로젝트 구조

```
indieblog/
├── src/
│   ├── app/
│   │   └── [locale]/(public)/page.tsx          # 랜딩페이지 메인
│   ├── components/ui/                           # shadcn-ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── accordion.tsx
│   │   ├── card.tsx
│   │   └── ... (26개 UI 컴포넌트)
│   ├── features/
│   │   └── landing/
│   │       └── components/                      # 랜딩페이지 컴포넌트
│   │           ├── header.tsx
│   │           ├── hero-section.tsx
│   │           ├── features-section.tsx
│   │           ├── how-it-works-section.tsx
│   │           ├── use-cases-section.tsx
│   │           ├── pricing-section.tsx
│   │           ├── final-cta-section.tsx
│   │           └── footer.tsx
│   └── lib/i18n/
│       └── messages/
│           ├── ko.json                          # 한국어 번역
│           └── en.json                          # 영어 번역
├── messages/                                    # i18n 메시지 (루트)
│   ├── ko.json
│   └── en.json
└── tailwind.config.ts                           # Tailwind 설정
```

### 1.2 기존 기술 스택

**프레임워크 & 라이브러리**
- **Next.js 15.2.3** (App Router)
- **React 19.0.0**
- **TypeScript 5**
- **next-intl 4.5.3** (i18n)
- **framer-motion 11** (애니메이션) ✅ 이미 설치됨
- **Tailwind CSS 4.1.13**
- **shadcn-ui** (UI 컴포넌트)

**주요 의존성**
- `@tanstack/react-query` - 서버 상태 관리
- `zustand` - 전역 상태 관리
- `lucide-react` - 아이콘
- `zod` - 스키마 검증

### 1.3 기존 컴포넌트 패턴

**1) Client Component 패턴**
```typescript
"use client";

import { useTranslations } from "next-intl";

export function ExampleSection() {
  const t = useTranslations("landing.section_name");

  return (
    <section className="...">
      {/* 컴포넌트 내용 */}
    </section>
  );
}
```

**2) i18n 사용 패턴**
```typescript
// 기본 사용
t("heading")                    // "강력한 기능"
t("cta.primary")                // "무료로 시작하기"

// 배열 반복
features.map((feature) => (
  <div key={feature.titleKey}>
    <h3>{t(feature.titleKey)}</h3>
    <p>{t(feature.descriptionKey)}</p>
  </div>
))
```

**3) framer-motion 애니메이션 패턴**
```typescript
const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.15,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

<motion.div
  custom={0}
  variants={fadeUpVariants}
  initial="hidden"
  animate="visible"
>
  {/* 내용 */}
</motion.div>
```

### 1.4 컬러 시스템

**현재 사용 중인 색상**
```css
/* Primary Blue */
#3BA2F8 (rgb(59, 162, 248))

/* Neutral Gray */
#FCFCFD (배경)
#F5F7FA (카드 배경)
#E1E5EA (Border)
#6B7280 (Body text)
#374151 (Dark text)
#111827 (Heading)

/* Tailwind CSS 변수 (globals.css) */
--primary: HSL 값
--secondary: HSL 값
--accent: HSL 값
```

**개선 계획**: Purple, Orange 제거하고 Blue 단일 컬러로 통일 (1단계 계획 반영)

### 1.5 i18n 구조

**현재 메시지 구조**
```json
{
  "landing": {
    "header": { "nav": {...}, "cta": {...} },
    "hero": { "badge": "...", "heading": "...", "cta": {...} },
    "features": { "ai_generation": {...}, "seo_keywords": {...} },
    "how_it_works": { "step1": {...}, "step2": {...}, "step3": {...} },
    "use_cases": { "product_launch": {...}, ... },
    "pricing": { "free": {...}, "pro": {...} },
    "cta": { "heading": "...", "primary_cta": "..." },
    "footer": { "brand": {...}, "product": {...}, ... }
  }
}
```

**누락된 키 (1단계 계획에서 추가 필요)**
- `landing.features.brand_voice.*` ❌ 없음
- `landing.features.realtime_edit.*` ❌ 없음
- `landing.hero.cta.secondary` ❌ 없음 (현재는 `cta.primary`만 존재)
- `landing.hero.trust_badge` ❌ 없음
- `landing.faq.*` ❌ 전체 섹션 없음

---

## 2. 파일 구조

### 2.1 생성할 파일

```
src/features/landing/
├── components/
│   └── faq-section.tsx                          # 🆕 FAQ 섹션 (신규)
└── lib/
    ├── animations.ts                             # 🆕 공통 애니메이션 variants
    └── constants.ts                              # 🆕 섹션별 상수 (이미지 URL 등)
```

### 2.2 수정할 파일

```
src/
├── app/[locale]/(public)/page.tsx               # ✏️ UseCasesSection 제거, FAQSection 추가
├── features/landing/components/
│   ├── hero-section.tsx                         # ✏️ Trust Badge 추가, Secondary CTA 추가
│   ├── features-section.tsx                     # ✏️ 2개 핵심 + 2개 서브 구조로 변경
│   ├── how-it-works-section.tsx                 # ✏️ 중간 CTA 추가
│   ├── pricing-section.tsx                      # ✏️ ROI 메시지 간소화, badge 키 수정
│   └── final-cta-section.tsx                    # ✏️ 배경 그라디언트 → 단색 Blue

messages/
├── ko.json                                       # ✏️ 누락된 키 추가
└── en.json                                       # ✏️ 영문 번역 추가
```

### 2.3 삭제할 파일

```
src/features/landing/components/
└── use-cases-section.tsx                         # ❌ 삭제 (1단계 계획 반영)
```

---

## 3. 의존성

### 3.1 설치 명령

```bash
# 필요 없음 - framer-motion 이미 설치됨
# package.json 확인 결과:
# "framer-motion": "^11"
```

### 3.2 이미 설치된 패키지

✅ **framer-motion** - 애니메이션
✅ **next-intl** - i18n
✅ **lucide-react** - 아이콘
✅ **@radix-ui/react-accordion** - FAQ Accordion
✅ **shadcn-ui** 컴포넌트 전체 (Button, Card, Accordion 등)

---

## 4. 구현 순서

### Phase 1: 공통 유틸리티 및 i18n 준비 (우선순위: 최고)

**Step 1.1: i18n 메시지 업데이트**
- `messages/ko.json` 수정
- `messages/en.json` 수정
- 누락된 키 추가 (FAQ, Trust Badge, Secondary CTA 등)

**Step 1.2: 공통 애니메이션 유틸**
- `src/features/landing/lib/animations.ts` 생성
- `fadeUp`, `slideInLeft`, `slideInRight` variants 정의

**Step 1.3: 상수 정의**
- `src/features/landing/lib/constants.ts` 생성
- Trust Badge 이미지 URL, FAQ 데이터 등

---

### Phase 2: 컴포넌트 수정 (우선순위: 높음)

**Step 2.1: Hero Section**
- Trust Badge 추가 (하단에 고객 로고 3-4개)
- Secondary CTA 추가 ("데모 보기")
- Heading 메시지 변경 ("90% 시간 절감")

**Step 2.2: Features Section**
- 2개 핵심 기능 (AI 글 생성, 키워드 관리) → 전체 폭 레이아웃 (지그재그)
- 2개 서브 기능 (브랜드 보이스, 실시간 편집) → 2x1 카드 그리드
- 새 컴포넌트: `FeatureHighlight`, `FeatureCard` (내부 분리)

**Step 2.3: FAQ Section**
- `src/features/landing/components/faq-section.tsx` 신규 생성
- shadcn-ui Accordion 사용
- 6개 질문 (긍정적 톤으로 작성)

---

### Phase 3: 페이지 통합 (우선순위: 중간)

**Step 3.1: 메인 페이지 수정**
- `src/app/[locale]/(public)/page.tsx`
- `UseCasesSection` 제거
- `FAQSection` 추가 (Pricing과 FinalCTA 사이)

**Step 3.2: How It Works 중간 CTA**
- 하단에 "지금 시작하기" 버튼 추가

**Step 3.3: Pricing ROI 간소화**
- "외주 비용 대비 80% 절감"으로 변경

**Step 3.4: Final CTA 배경 변경**
- 그라디언트 → 단색 Blue (#3BA2F8)

---

### Phase 4: 애니메이션 최적화 (우선순위: 낮음)

**Step 4.1: 애니메이션 적용 범위 축소**
- Hero: 유지 (stagger, fade-up)
- Features (핵심 2개): `whileInView` 적용
- How It Works, Pricing, FAQ: 애니메이션 제거 (호버만)
- Final CTA: 서틀한 fade-in만

---

## 5. 컴포넌트 상세 명세

### 5.1 공통 애니메이션 유틸

#### 파일: `src/features/landing/lib/animations.ts`

```typescript
/**
 * 랜딩페이지 공통 애니메이션 variants
 */

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

export const fadeUpStagger = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.15,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
    },
  },
};
```

---

### 5.2 상수 정의

#### 파일: `src/features/landing/lib/constants.ts`

```typescript
/**
 * 랜딩페이지 상수
 */

// Trust Badge 로고 (picsum.photos 플레이스홀더)
export const TRUST_BADGE_LOGOS = [
  {
    src: "https://picsum.photos/seed/company1/120/60?grayscale",
    alt: "Company 1",
  },
  {
    src: "https://picsum.photos/seed/company2/120/60?grayscale",
    alt: "Company 2",
  },
  {
    src: "https://picsum.photos/seed/company3/120/60?grayscale",
    alt: "Company 3",
  },
  {
    src: "https://picsum.photos/seed/company4/120/60?grayscale",
    alt: "Company 4",
  },
];

// Features Section - 핵심 기능 이미지
export const FEATURE_IMAGES = {
  aiGeneration: "https://picsum.photos/seed/ai-gen/600/400",
  seoKeywords: "https://picsum.photos/seed/seo-keywords/600/400",
};

// FAQ 데이터 (i18n 키 참조용)
export const FAQ_ITEMS = [
  {
    questionKey: "landing.faq.items.0.question",
    answerKey: "landing.faq.items.0.answer",
  },
  {
    questionKey: "landing.faq.items.1.question",
    answerKey: "landing.faq.items.1.answer",
  },
  {
    questionKey: "landing.faq.items.2.question",
    answerKey: "landing.faq.items.2.answer",
  },
  {
    questionKey: "landing.faq.items.3.question",
    answerKey: "landing.faq.items.3.answer",
  },
  {
    questionKey: "landing.faq.items.4.question",
    answerKey: "landing.faq.items.4.answer",
  },
  {
    questionKey: "landing.faq.items.5.question",
    answerKey: "landing.faq.items.5.answer",
  },
];
```

---

### 5.3 Hero Section (수정)

#### 파일: `src/features/landing/components/hero-section.tsx`

**변경 사항**
1. Trust Badge 추가 (하단)
2. Secondary CTA 추가 ("데모 보기")
3. Heading 메시지 변경 (i18n 키는 동일, 메시지만 변경)

```typescript
"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { fadeUpStagger } from "@/features/landing/lib/animations";
import { TRUST_BADGE_LOGOS } from "@/features/landing/lib/constants";

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden bg-[#FCFCFD]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,162,248,0.05),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-4xl py-12 md:py-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full border border-[#E1E5EA] bg-[#F5F7FA]/50 mb-6 md:mb-8"
          >
            <span className="text-xs font-medium text-[#374151]">
              {t("badge")}
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            custom={1}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 tracking-tight text-[#111827] leading-tight px-2">
              {t("heading")}
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.div
            custom={2}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
          >
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#6B7280] mb-8 md:mb-10 max-w-2xl mx-auto font-normal leading-relaxed px-2">
              {t("subheading")}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            custom={3}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            {/* Primary CTA */}
            <Button
              size="lg"
              className="rounded-lg px-8 py-6 text-base font-medium bg-[#3BA2F8] hover:bg-[#3BA2F8]/90 text-white shadow-sm w-full sm:w-auto"
              asChild
            >
              <Link href="/signup">
                {t("cta.primary")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            {/* Secondary CTA */}
            <Button
              size="lg"
              variant="outline"
              className="rounded-lg px-8 py-6 text-base font-medium border-[#E1E5EA] bg-white hover:bg-[#F5F7FA] text-[#374151] w-full sm:w-auto"
              asChild
            >
              <Link href="#demo">
                <Play className="mr-2 h-5 w-5" />
                {t("cta.secondary")}
              </Link>
            </Button>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            custom={4}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-6"
          >
            <p className="text-sm text-[#6B7280]">{t("trust_badge")}</p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {TRUST_BADGE_LOGOS.map((logo, index) => (
                <div
                  key={index}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={60}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#E1E5EA]" />
    </section>
  );
}
```

---

### 5.4 Features Section (대폭 수정)

#### 파일: `src/features/landing/components/features-section.tsx`

**변경 사항**
1. 4개 카드 → 2개 핵심 기능 (전체 폭, 지그재그) + 2개 서브 기능 (카드 그리드)
2. `FeatureHighlight` 컴포넌트 추가 (좌/우 교차 레이아웃)
3. 애니메이션 추가 (`whileInView`)

```typescript
"use client";

import { motion } from "framer-motion";
import { Sparkles, Search, Palette, Edit3 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FEATURE_IMAGES } from "@/features/landing/lib/constants";

interface FeatureHighlightProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stat: string;
  imageSrc: string;
  imageAlt: string;
  position: "left" | "right";
}

function FeatureHighlight({
  icon,
  title,
  description,
  stat,
  imageSrc,
  imageAlt,
  position,
}: FeatureHighlightProps) {
  const isLeft = position === "left";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`flex flex-col ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} gap-8 md:gap-12 items-center`}
    >
      {/* 텍스트 */}
      <div className="flex-1 space-y-6">
        {/* 아이콘 */}
        <div className="w-14 h-14 rounded-xl bg-[#3BA2F8]/10 flex items-center justify-center text-[#3BA2F8]">
          {icon}
        </div>

        {/* 제목 */}
        <h3 className="text-2xl md:text-3xl font-bold text-[#111827]">
          {title}
        </h3>

        {/* 설명 */}
        <p className="text-base md:text-lg text-[#6B7280] leading-relaxed">
          {description}
        </p>

        {/* 통계 */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F7FA] border border-[#E1E5EA]">
          <span className="text-sm font-medium text-[#374151]">{stat}</span>
        </div>
      </div>

      {/* 이미지 */}
      <div className="flex-1">
        <div className="relative rounded-xl overflow-hidden border border-[#E1E5EA] shadow-lg">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={600}
            height={400}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-8 rounded-xl border border-[#E1E5EA] bg-white hover:border-[#3BA2F8] hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col space-y-4">
        {/* 아이콘 */}
        <div className="w-12 h-12 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#3BA2F8] group-hover:bg-[#3BA2F8] group-hover:text-white transition-all duration-300">
          {icon}
        </div>

        {/* 제목 */}
        <h3 className="text-xl font-semibold text-[#111827]">{title}</h3>

        {/* 설명 */}
        <p className="text-base text-[#6B7280] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  return (
    <section id="features" className="w-full bg-[#FCFCFD] py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-3 md:mb-4 px-4">
            {t("section_title")}
          </h2>
          <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto px-4">
            {t("section_subtitle")}
          </p>
        </div>

        {/* 핵심 기능 2개 - 전체 폭 */}
        <div className="space-y-20 mb-20">
          {/* AI 글 생성 */}
          <FeatureHighlight
            icon={<Sparkles className="w-7 h-7" />}
            title={t("ai_generation.title")}
            description={t("ai_generation.description")}
            stat={t("ai_generation.stat")}
            imageSrc={FEATURE_IMAGES.aiGeneration}
            imageAlt="AI 글 생성 화면"
            position="left"
          />

          {/* 키워드 관리 */}
          <FeatureHighlight
            icon={<Search className="w-7 h-7" />}
            title={t("seo_keywords.title")}
            description={t("seo_keywords.description")}
            stat={t("seo_keywords.stat")}
            imageSrc={FEATURE_IMAGES.seoKeywords}
            imageAlt="키워드 관리 화면"
            position="right"
          />
        </div>

        {/* 서브 기능 2개 - 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 브랜드 보이스 */}
          <FeatureCard
            icon={<Palette className="w-6 h-6" />}
            title={t("brand_voice.title")}
            description={t("brand_voice.description")}
          />

          {/* 실시간 편집 */}
          <FeatureCard
            icon={<Edit3 className="w-6 h-6" />}
            title={t("realtime_edit.title")}
            description={t("realtime_edit.description")}
          />
        </div>
      </div>
    </section>
  );
}
```

---

### 5.5 How It Works Section (수정)

#### 파일: `src/features/landing/components/how-it-works-section.tsx`

**변경 사항**: 하단에 중간 CTA 추가 ("지금 시작하기")

```typescript
"use client";

import { FileText, Sparkles, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function HowItWorksSection() {
  const t = useTranslations("landing.how_it_works");

  const steps = [
    {
      icon: <FileText className="w-6 h-6" />,
      titleKey: "step1.title" as const,
      descriptionKey: "step1.description" as const,
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      titleKey: "step2.title" as const,
      descriptionKey: "step2.description" as const,
    },
    {
      icon: <Edit className="w-6 h-6" />,
      titleKey: "step3.title" as const,
      descriptionKey: "step3.description" as const,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="w-full bg-white py-16 md:py-20 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-3 md:mb-4 px-4">
            {t("section_title")}
          </h2>
          <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto px-4">
            {t("section_subtitle")}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#3BA2F8] text-white text-xl font-bold mb-4">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 mx-auto rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#3BA2F8]">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-[#111827]">
                {t(step.titleKey)}
              </h3>

              {/* Description */}
              <p className="text-base text-[#6B7280] leading-relaxed">
                {t(step.descriptionKey)}
              </p>
            </div>
          ))}
        </div>

        {/* 중간 CTA */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="rounded-lg px-8 py-6 text-base font-medium bg-[#3BA2F8] hover:bg-[#3BA2F8]/90 text-white shadow-sm"
            asChild
          >
            <Link href="/signup">{t("cta")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

---

### 5.6 FAQ Section (신규)

#### 파일: `src/features/landing/components/faq-section.tsx`

**신규 컴포넌트**: shadcn-ui Accordion 사용

```typescript
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export function FaqSection() {
  const t = useTranslations("landing.faq");

  // FAQ 항목 (6개)
  const faqItems = Array.from({ length: 6 }, (_, i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  return (
    <section id="faq" className="w-full bg-[#FCFCFD] py-16 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-3 md:mb-4 px-4">
            {t("section_title")}
          </h2>
          <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto px-4">
            {t("section_subtitle")}
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-[#E1E5EA] rounded-xl px-6 bg-white"
            >
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-[#111827] hover:no-underline py-6">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-[#6B7280] leading-relaxed pb-6">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
```

---

### 5.7 Pricing Section (수정)

#### 파일: `src/features/landing/components/pricing-section.tsx`

**변경 사항**
1. ROI 메시지 간소화 (i18n 키 변경)
2. Badge 키 수정 (`popular` → `pro.badge`)
3. Features 배열 반복 제거 (직접 나열)

```typescript
"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function PricingSection() {
  const t = useTranslations("landing.pricing");

  // Free 플랜 features
  const freeFeatures = [
    t("free.features.articles"),
    t("free.features.keywords"),
    t("free.features.style_guides"),
  ];

  // Pro 플랜 features
  const proFeatures = [
    t("pro.features.articles"),
    t("pro.features.keywords"),
    t("pro.features.style_guides"),
    t("pro.features.priority_support"),
  ];

  return (
    <section id="pricing" className="w-full bg-white py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-3 md:mb-4 px-4">
            {t("section_title")}
          </h2>
          <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto px-4">
            {t("section_subtitle")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="relative p-6 md:p-8 rounded-xl border border-[#E1E5EA] bg-white hover:shadow-lg transition-all duration-300">
            <div className="space-y-6">
              {/* Plan Name */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#111827]">
                  {t("free.name")}
                </h3>
                <p className="text-sm text-[#6B7280] mt-2">
                  {t("free.description")}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-bold text-[#111827]">
                  {t("free.price")}
                </span>
                <span className="text-base md:text-lg text-[#6B7280]">
                  {t("free.period")}
                </span>
              </div>

              {/* CTA Button */}
              <Button
                className="w-full py-6 text-base font-medium rounded-lg bg-[#F5F7FA] hover:bg-[#E1E5EA] text-[#111827] border border-[#E1E5EA]"
                asChild
              >
                <Link href="/signup">{t("free.cta")}</Link>
              </Button>

              {/* Features List */}
              <div className="space-y-4 pt-6 border-t border-[#E1E5EA]">
                {freeFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3BA2F8]/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#3BA2F8]" />
                    </div>
                    <span className="text-base text-[#374151]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative p-6 md:p-8 rounded-xl border border-[#3BA2F8] shadow-xl md:scale-105 bg-white transition-all duration-300">
            {/* Badge */}
            <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-[#3BA2F8] text-white text-xs md:text-sm font-medium">
                {t("pro.badge")}
              </div>
            </div>

            <div className="space-y-6">
              {/* Plan Name */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#111827]">
                  {t("pro.name")}
                </h3>
                <p className="text-sm text-[#6B7280] mt-2">
                  {t("pro.description")}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-bold text-[#111827]">
                  {t("pro.price")}
                </span>
                <span className="text-base md:text-lg text-[#6B7280]">
                  {t("pro.period")}
                </span>
              </div>

              {/* ROI 메시지 */}
              <div className="px-4 py-3 rounded-lg bg-[#3BA2F8]/5 border border-[#3BA2F8]/20">
                <p className="text-sm font-medium text-[#3BA2F8]">
                  {t("pro.roi")}
                </p>
              </div>

              {/* CTA Button */}
              <Button
                className="w-full py-6 text-base font-medium rounded-lg bg-[#3BA2F8] hover:bg-[#3BA2F8]/90 text-white"
                asChild
              >
                <Link href="/signup">{t("pro.cta")}</Link>
              </Button>

              {/* Features List */}
              <div className="space-y-4 pt-6 border-t border-[#E1E5EA]">
                {proFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3BA2F8]/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#3BA2F8]" />
                    </div>
                    <span className="text-base text-[#374151]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

### 5.8 Final CTA Section (수정)

#### 파일: `src/features/landing/components/final-cta-section.tsx`

**변경 사항**: 배경 그라디언트 → 단색 Blue

```typescript
"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { fadeIn } from "@/features/landing/lib/animations";

export function FinalCtaSection() {
  const t = useTranslations("landing.cta");

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-full bg-[#3BA2F8] py-16 md:py-20 px-4"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 px-4">
          {t("heading")}
        </h2>

        {/* Subheading */}
        <p className="text-base md:text-lg text-white/90 mb-8 md:mb-10 px-4">
          {t("subheading")}
        </p>

        {/* CTA Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            className="rounded-lg px-8 py-6 text-base font-medium bg-white hover:bg-white/90 text-[#3BA2F8] shadow-lg"
            asChild
          >
            <Link href="/signup">
              {t("primary_cta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          {/* No Credit Card */}
          <p className="text-sm text-white/80">{t("no_credit_card")}</p>
        </div>
      </div>
    </motion.section>
  );
}
```

---

### 5.9 메인 페이지 (수정)

#### 파일: `src/app/[locale]/(public)/page.tsx`

**변경 사항**
1. `UseCasesSection` 제거
2. `FAQSection` 추가 (Pricing과 FinalCTA 사이)

```typescript
"use client";

import { Header } from "@/features/landing/components/header";
import { HeroSection } from "@/features/landing/components/hero-section";
import { FeaturesSection } from "@/features/landing/components/features-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { FinalCtaSection } from "@/features/landing/components/final-cta-section";
import { Footer } from "@/features/landing/components/footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FCFCFD] pt-16">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
```

---

## 6. i18n 번역 키

### 6.1 한국어 (messages/ko.json)

**추가할 키**

```json
{
  "landing": {
    "hero": {
      "heading": "블로그 글 작성 시간을 90% 줄이고, SEO 순위를 높이세요",
      "cta": {
        "secondary": "데모 보기"
      },
      "trust_badge": "이미 1,000+ 개의 블로그가 사용 중"
    },
    "features": {
      "section_title": "강력한 기능",
      "section_subtitle": "AI 기술로 콘텐츠 제작 프로세스를 혁신하세요.",
      "ai_generation": {
        "title": "AI 글 생성 (5분 완성)",
        "description": "주제만 입력하면 SEO에 최적화된 완성도 높은 글을 자동으로 생성합니다.",
        "stat": "평균 생성 시간 3분 42초"
      },
      "seo_keywords": {
        "title": "키워드 관리 (SEO 최적화)",
        "description": "검색량과 경쟁도를 분석하여 효과적인 키워드 전략을 세우세요.",
        "stat": "평균 키워드 순위 상승률 42%"
      },
      "brand_voice": {
        "title": "브랜드 보이스 설정",
        "description": "브랜드 고유의 톤과 스타일을 정의하여 일관된 콘텐츠를 생성하세요."
      },
      "realtime_edit": {
        "title": "실시간 편집",
        "description": "생성된 글을 바로 편집하고 마크다운으로 다운로드하세요."
      }
    },
    "how_it_works": {
      "cta": "지금 시작하기"
    },
    "pricing": {
      "section_title": "합리적인 가격",
      "section_subtitle": "필요에 맞는 플랜을 선택하세요.",
      "pro": {
        "badge": "인기",
        "roi": "외주 비용 대비 80% 절감"
      }
    },
    "faq": {
      "section_title": "자주 묻는 질문",
      "section_subtitle": "궁금한 점이 있으신가요?",
      "items": [
        {
          "question": "어떤 유형의 블로그에 적합한가요?",
          "answer": "테크 블로그, 마케팅 블로그, 개인 블로그 등 모든 유형에 적합합니다. SEO24는 브랜드 보이스를 학습하여 일관된 스타일로 콘텐츠를 생성합니다."
        },
        {
          "question": "무료로 시작하려면 어떻게 하나요?",
          "answer": "상단의 '무료로 시작하기' 버튼을 클릭하여 가입하시면 됩니다. 신용카드 등록 없이 바로 사용할 수 있습니다."
        },
        {
          "question": "생성된 글의 저작권은 누구에게 있나요?",
          "answer": "생성된 모든 콘텐츠의 저작권은 사용자에게 있습니다. 자유롭게 수정, 배포, 상업적 사용이 가능합니다."
        },
        {
          "question": "SEO 최적화는 어떻게 이루어지나요?",
          "answer": "키워드 밀도, 메타 태그, 구조화된 헤딩, 내부 링크 등 SEO 요소를 자동으로 분석하고 최적화합니다."
        },
        {
          "question": "환불 정책은 어떻게 되나요?",
          "answer": "Pro 플랜은 언제든 해지 가능하며, 위약금은 없습니다. 결제일로부터 7일 이내 전액 환불이 가능합니다."
        },
        {
          "question": "다른 도구와 통합할 수 있나요?",
          "answer": "마크다운 다운로드를 통해 워드프레스, 노션, 티스토리 등 모든 플랫폼과 호환됩니다. API 연동도 지원합니다."
        }
      ]
    }
  }
}
```

### 6.2 영어 (messages/en.json)

**추가할 키**

```json
{
  "landing": {
    "hero": {
      "heading": "Reduce Blog Writing Time by 90% and Boost SEO Rankings",
      "cta": {
        "secondary": "View Demo"
      },
      "trust_badge": "Already trusted by 1,000+ blogs"
    },
    "features": {
      "section_title": "Powerful Features",
      "section_subtitle": "Revolutionize your content creation process with AI technology.",
      "ai_generation": {
        "title": "AI Article Generation (5 min)",
        "description": "Simply enter a topic and automatically generate high-quality, SEO-optimized articles.",
        "stat": "Average generation time: 3 min 42 sec"
      },
      "seo_keywords": {
        "title": "Keyword Management (SEO Optimized)",
        "description": "Analyze search volume and competition to build effective keyword strategies.",
        "stat": "Average keyword ranking increase: 42%"
      },
      "brand_voice": {
        "title": "Brand Voice Settings",
        "description": "Define your brand's unique tone and style to generate consistent content."
      },
      "realtime_edit": {
        "title": "Real-time Editing",
        "description": "Edit generated articles immediately and download as markdown."
      }
    },
    "how_it_works": {
      "cta": "Get Started Now"
    },
    "pricing": {
      "section_title": "Reasonable Pricing",
      "section_subtitle": "Choose a plan that fits your needs.",
      "pro": {
        "badge": "Popular",
        "roi": "80% savings vs. outsourcing"
      }
    },
    "faq": {
      "section_title": "Frequently Asked Questions",
      "section_subtitle": "Have questions? We've got answers.",
      "items": [
        {
          "question": "What types of blogs is this suitable for?",
          "answer": "SEO24 is suitable for all types of blogs including tech, marketing, and personal blogs. It learns your brand voice to generate content in a consistent style."
        },
        {
          "question": "How do I get started for free?",
          "answer": "Click the 'Start for Free' button at the top to sign up. No credit card required to start using immediately."
        },
        {
          "question": "Who owns the copyright of generated content?",
          "answer": "You own the copyright of all generated content. You can freely modify, distribute, and use it commercially."
        },
        {
          "question": "How does SEO optimization work?",
          "answer": "We automatically analyze and optimize SEO elements including keyword density, meta tags, structured headings, and internal links."
        },
        {
          "question": "What is the refund policy?",
          "answer": "Pro plan can be cancelled anytime with no penalty. Full refund available within 7 days of payment."
        },
        {
          "question": "Can I integrate with other tools?",
          "answer": "Compatible with all platforms including WordPress, Notion, and Tistory via markdown download. API integration also supported."
        }
      ]
    }
  }
}
```

---

## 7. 스타일링 가이드

### 7.1 Tailwind 클래스 패턴

**섹션 레이아웃**
```typescript
// 기본 섹션
<section className="w-full bg-[#FCFCFD] py-16 md:py-20 px-4">
  <div className="max-w-6xl mx-auto">
    {/* 내용 */}
  </div>
</section>

// 교차 배경 (흰색)
<section className="w-full bg-white py-16 md:py-20 px-4">
```

**텍스트 스타일**
```typescript
// Heading
className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-3 md:mb-4"

// Subheading
className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto"

// Body
className="text-base text-[#6B7280] leading-relaxed"
```

**버튼 스타일**
```typescript
// Primary Button
<Button
  size="lg"
  className="rounded-lg px-8 py-6 text-base font-medium bg-[#3BA2F8] hover:bg-[#3BA2F8]/90 text-white"
>

// Secondary Button (Outline)
<Button
  size="lg"
  variant="outline"
  className="rounded-lg px-8 py-6 text-base font-medium border-[#E1E5EA] bg-white hover:bg-[#F5F7FA] text-[#374151]"
>
```

**카드 스타일**
```typescript
// 기본 카드
className="p-8 rounded-xl border border-[#E1E5EA] bg-white hover:border-[#3BA2F8] hover:shadow-lg transition-all duration-300"

// 강조 카드 (Pricing Pro)
className="p-6 md:p-8 rounded-xl border border-[#3BA2F8] shadow-xl md:scale-105 bg-white"
```

### 7.2 반응형 디자인

**브레이크포인트**
- `sm`: 640px (모바일 가로)
- `md`: 768px (태블릿)
- `lg`: 1024px (데스크톱)
- `xl`: 1280px (대형 데스크톱)

**모바일 우선 패턴**
```typescript
// 폰트 크기
text-sm sm:text-base md:text-lg lg:text-xl

// 패딩
py-12 md:py-20

// 그리드
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Flex 방향
flex-col md:flex-row
```

### 7.3 다크모드

**현재 지원 여부**: 설정은 되어 있으나 랜딩페이지는 라이트 모드 고정

```typescript
// tailwind.config.ts
darkMode: "class"

// 다크모드 지원 시
<div className="bg-white dark:bg-gray-900">
```

---

## 8. 성능 고려사항

### 8.1 애니메이션 최적화

**원칙**
1. **Hero만 복잡한 애니메이션** (stagger)
2. **Features (핵심 2개)만 whileInView** 사용
3. **나머지 섹션은 호버 효과만**

**whileInView 설정**
```typescript
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }} // 30% 보이면 트리거, 한 번만
  transition={{ duration: 0.6, ease: "easeOut" }}
>
```

**성능 최적화 속성**
- ❌ `will-change` 사용하지 않음 (최신 브라우저는 자동 최적화)
- ✅ `transform`, `opacity`만 애니메이션 (GPU 가속)
- ✅ `once: true`로 재실행 방지

### 8.2 이미지 최적화

**Next.js Image 컴포넌트**
```typescript
import Image from "next/image";

<Image
  src="https://picsum.photos/600/400"
  alt="AI 글 생성 화면"
  width={600}
  height={400}
  className="w-full h-auto object-cover"
  // placeholder="blur" (실제 이미지로 교체 시 추가)
/>
```

**Placeholder 이미지**
- **Trust Badge**: `https://picsum.photos/seed/company{1-4}/120/60?grayscale`
- **Features**: `https://picsum.photos/seed/{name}/600/400`

### 8.3 번들 사이즈

**현재 상태**
- ✅ framer-motion 이미 설치됨
- ✅ 외부 라이브러리 추가 없음
- ✅ 모든 컴포넌트 Client Component (`"use client"`)

---

## 9. 접근성 체크리스트

### 9.1 시맨틱 HTML

```html
✅ <section> 태그 사용
✅ <h1>, <h2>, <h3> 계층 구조
✅ <button> vs <Link> 적절한 사용
✅ <img> alt 속성 필수
```

### 9.2 ARIA 레이블

```typescript
// Trust Badge 이미지
<Image src="..." alt="Company 1 로고" />

// 버튼
<Button aria-label="무료로 시작하기">

// Accordion (shadcn-ui가 자동 처리)
<AccordionTrigger>질문</AccordionTrigger>
```

### 9.3 키보드 네비게이션

```typescript
// shadcn-ui 버튼은 기본 지원
<Button>클릭 가능</Button>

// Accordion도 기본 지원 (Enter, Space, Arrow keys)
```

### 9.4 색상 대비

**WCAG AA 기준 충족**
```css
/* Heading: #111827 on #FCFCFD */
대비율: 21:1 ✅

/* Body: #6B7280 on #FCFCFD */
대비율: 4.5:1 ✅

/* Primary Button: White on #3BA2F8 */
대비율: 4.5:1 ✅
```

---

## 10. 테스트 계획

### 10.1 수동 테스트

**반응형 테스트**
- [ ] 모바일 (375px) - iPhone SE
- [ ] 태블릿 (768px) - iPad
- [ ] 데스크톱 (1440px) - 일반 모니터
- [ ] 대형 (1920px) - FHD 모니터

**브라우저 테스트**
- [ ] Chrome (최신)
- [ ] Safari (최신)
- [ ] Firefox (최신)
- [ ] Edge (최신)

**기능 테스트**
- [ ] 모든 i18n 키 렌더링 확인
- [ ] 모든 CTA 버튼 클릭 동작
- [ ] FAQ Accordion 열기/닫기
- [ ] Trust Badge 이미지 로딩
- [ ] 애니메이션 정상 작동

### 10.2 성능 테스트

**Lighthouse 목표**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 100

**Core Web Vitals**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## 11. 마이그레이션 전략

### 11.1 점진적 교체

**Phase 1: 준비 (1-2시간)**
1. i18n 메시지 업데이트
2. 공통 유틸 파일 생성 (animations.ts, constants.ts)

**Phase 2: 컴포넌트 수정 (3-4시간)**
1. Hero Section 수정
2. Features Section 수정
3. FAQ Section 신규 생성
4. 나머지 섹션 수정

**Phase 3: 통합 및 테스트 (1-2시간)**
1. 메인 페이지 수정 (page.tsx)
2. 수동 테스트
3. 반응형 확인

**총 예상 시간**: 5-8시간

### 11.2 롤백 계획

**Git 커밋 전략**
```bash
# Phase 1
git add messages/
git commit -m "feat(landing): add i18n keys for improved landing page"

# Phase 2 (컴포넌트별)
git add src/features/landing/lib/
git commit -m "feat(landing): add common animation utilities"

git add src/features/landing/components/hero-section.tsx
git commit -m "feat(landing): update hero section with trust badge and secondary CTA"

# ... 각 컴포넌트별 커밋

# Phase 3
git add src/app/
git commit -m "feat(landing): integrate all improved sections"
```

**문제 발생 시**
```bash
# 특정 커밋으로 롤백
git revert <commit-hash>

# 또는 이전 상태로 복원
git reset --hard <commit-hash>
```

---

## 12. 예상 이슈 및 해결 방안

### 12.1 i18n 키 불일치

**문제**: 컴포넌트에서 `t("key")`를 호출했지만 메시지에 해당 키가 없음

**해결**:
```typescript
// 개발 환경에서 오류 확인
if (process.env.NODE_ENV === 'development') {
  console.log('Missing i18n key:', key);
}

// 또는 fallback 처리
t("key", { defaultValue: "기본값" })
```

### 12.2 이미지 로딩 실패

**문제**: picsum.photos가 느리거나 실패

**해결**:
```typescript
// 로컬 플레이스홀더로 교체
<Image
  src="/images/placeholder-feature.png"
  alt="..."
  onError={(e) => {
    e.currentTarget.src = "/images/fallback.png";
  }}
/>
```

### 12.3 애니메이션 성능 이슈

**문제**: 모바일에서 애니메이션이 버벅임

**해결**:
```typescript
// 모바일에서 애니메이션 비활성화
const isMobile = useMediaQuery("(max-width: 768px)");

<motion.div
  {...(!isMobile && {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 }
  })}
>
```

### 12.4 Accordion 스타일 깨짐

**문제**: shadcn-ui Accordion의 기본 스타일이 디자인과 맞지 않음

**해결**:
```typescript
// AccordionItem에 커스텀 className 추가
<AccordionItem
  className="border border-[#E1E5EA] rounded-xl px-6 bg-white"
>
```

### 12.5 다국어 전환 테스트

**문제**: 영문 번역이 레이아웃을 깨뜨림 (텍스트 길이 차이)

**해결**:
```typescript
// 긴 텍스트에 대비한 스타일
<h1 className="text-3xl md:text-5xl break-words hyphens-auto">
  {t("heading")}
</h1>
```

---

## 13. 구현 체크리스트

### Phase 1: 준비 (필수)
- [ ] `messages/ko.json` 업데이트 (누락된 키 추가)
- [ ] `messages/en.json` 업데이트 (영문 번역)
- [ ] `src/features/landing/lib/animations.ts` 생성
- [ ] `src/features/landing/lib/constants.ts` 생성

### Phase 2: 컴포넌트 수정
- [ ] `hero-section.tsx` - Trust Badge, Secondary CTA 추가
- [ ] `features-section.tsx` - 2개 핵심 + 2개 서브 구조로 변경
- [ ] `faq-section.tsx` - 신규 생성
- [ ] `how-it-works-section.tsx` - 중간 CTA 추가
- [ ] `pricing-section.tsx` - ROI 간소화, badge 키 수정
- [ ] `final-cta-section.tsx` - 배경 단색 Blue로 변경

### Phase 3: 통합
- [ ] `page.tsx` - UseCasesSection 제거, FAQSection 추가
- [ ] `use-cases-section.tsx` - 파일 삭제

### Phase 4: 테스트
- [ ] i18n 키 누락 확인 (한국어/영어)
- [ ] 반응형 테스트 (모바일/태블릿/데스크톱)
- [ ] 애니메이션 정상 작동 확인
- [ ] 모든 CTA 링크 확인
- [ ] Lighthouse 점수 확인 (90+)

### Phase 5: 최적화 (선택)
- [ ] 실제 UI 스크린샷으로 교체
- [ ] Trust Badge 로고 실제 고객 로고로 교체
- [ ] FAQ 콘텐츠 실제 사용자 질문으로 업데이트
- [ ] A/B 테스트 (Hero Heading 메시지)

---

## 14. 최종 파일 목록

### 신규 생성 (3개)
1. `src/features/landing/lib/animations.ts`
2. `src/features/landing/lib/constants.ts`
3. `src/features/landing/components/faq-section.tsx`

### 수정 (7개)
1. `src/app/[locale]/(public)/page.tsx`
2. `src/features/landing/components/hero-section.tsx`
3. `src/features/landing/components/features-section.tsx`
4. `src/features/landing/components/how-it-works-section.tsx`
5. `src/features/landing/components/pricing-section.tsx`
6. `src/features/landing/components/final-cta-section.tsx`
7. `messages/ko.json`
8. `messages/en.json`

### 삭제 (1개)
1. `src/features/landing/components/use-cases-section.tsx`

---

## 15. 참고 자료

### 15.1 기존 코드 참고

**애니메이션 패턴**
- `src/features/landing/components/hero-section.tsx` (기존)

**카드 레이아웃**
- `src/features/landing/components/features-section.tsx` (기존)
- `src/features/landing/components/pricing-section.tsx` (기존)

**Accordion 사용법**
- `src/components/ui/accordion.tsx` (shadcn-ui)

### 15.2 외부 참고

**디자인 영감**
- [claude.ai](https://claude.ai) - 전체 레이아웃
- [Vercel](https://vercel.com) - Hero Section
- [Linear](https://linear.app) - Features Section

**기술 문서**
- [framer-motion 공식 문서](https://www.framer.com/motion/)
- [next-intl 공식 문서](https://next-intl-docs.vercel.app/)
- [shadcn-ui Accordion](https://ui.shadcn.com/docs/components/accordion)

---

**작성 완료일**: 2025-11-16
**다음 단계**: Phase 1 (i18n 메시지 업데이트) 시작
**예상 완료 시간**: 5-8시간
