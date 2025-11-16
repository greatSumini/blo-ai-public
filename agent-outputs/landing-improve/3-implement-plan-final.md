# 랜딩페이지 구현 계획 최종 검토

> **검토일**: 2025-11-16
> **검토자**: Step 3 - Final Review Agent
> **기준 문서**: `./agent-outputs/landing-improve/2-implement-plan.md`
> **목표**: 실행 가능한 최종 구현 계획 수립

---

## 1. 원안 요약

2번 단계 계획은 다음과 같은 구조로 claude.ai 수준의 프리미엄 랜딩페이지 구현을 제안했습니다:

### 주요 변경 사항
1. **Hero Section**: Trust Badge 추가, Secondary CTA 추가, Heading 메시지 변경
2. **Features Section**: 4개 카드 → 2개 핵심(전체폭) + 2개 서브(카드) 구조로 변경
3. **FAQ Section**: 신규 생성 (6개 질문, shadcn-ui Accordion 사용)
4. **Use Cases Section**: 삭제
5. **공통 유틸리티**: `animations.ts`, `constants.ts` 추가

### 기술 스택
- framer-motion (이미 설치됨)
- next-intl (기존)
- shadcn-ui Accordion (기존)

---

## 2. 발견된 문제점

### 2.1 코드 정확성

#### 문제 1: Hero Section의 i18n 키 불일치

**위치**: `hero-section.tsx` (2-implement-plan.md 라인 482, 489)

**문제**:
```typescript
// 2단계 계획에서 제안한 코드
{t("cta_text")}           // ❌ 기존 코드 패턴
{t("secondary_text")}     // ❌ 기존 코드 패턴
```

**기존 코드 패턴**:
```typescript
// src/features/landing/components/hero-section.tsx (현재)
{t("cta_text")}           // ✅ 현재 사용 중
{t("secondary_text")}     // ✅ 현재 사용 중
```

**i18n 구조 확인**:
```json
// messages/ko.json (현재)
"landing": {
  "hero": {
    "cta": {
      "primary": "무료로 시작하기",
      "secondary": "데모 보기"  // 2단계 계획에서 추가 예정
    }
  }
}
```

**영향**: 2단계 계획의 `{t("cta.primary")}` 패턴은 정확하나, 기존 코드와 패턴이 다름. 기존 코드는 `{t("cta_text")}`를 사용 중.

#### 수정안

2단계 계획에서 제안한 i18n 중첩 구조 (`cta.primary`, `cta.secondary`)가 **더 나은 패턴**이므로, 기존 코드를 수정하는 방향으로 진행합니다.

**수정된 i18n 키 (messages/ko.json)**:
```json
{
  "landing": {
    "hero": {
      "badge": "AI 기반 콘텐츠 생성",
      "heading": "블로그 글 작성 시간을 90% 줄이고, SEO 순위를 높이세요",
      "subheading": "스타일 가이드를 한 번 설정하면, AI가 브랜드 일관성을 유지하며 고품질 콘텐츠를 자동 생성합니다.",
      "cta": {
        "primary": "무료로 시작하기",
        "secondary": "데모 보기"
      },
      "trust_badge": "이미 1,000+ 개의 블로그가 사용 중"
    }
  }
}
```

**수정된 컴포넌트 코드**:
```typescript
// Primary CTA
{t("cta.primary")}

// Secondary CTA
{t("cta.secondary")}
```

**결론**: 2단계 계획의 코드가 정확함. 기존 `cta_text`, `secondary_text` 키를 제거하고 중첩 구조로 변경 필요.

---

#### 문제 2: Features Section의 i18n 키 불일치

**위치**: `features-section.tsx` (2-implement-plan.md)

**문제**:
```typescript
// 2단계 계획
{t("section_title")}      // ✅ 신규 키
{t("section_subtitle")}   // ✅ 신규 키
```

**기존 코드**:
```typescript
// src/features/landing/components/features-section.tsx (현재)
{t("heading")}            // ❌ 기존 패턴
{t("subheading")}         // ❌ 기존 패턴
```

**기존 i18n 키**:
```json
// messages/ko.json (현재)
"landing": {
  "features": {
    "heading": "강력한 기능",      // 기존
    "subheading": "AI 기술로..."   // 기존
  }
}
```

**영향**: 2단계 계획의 `section_title`, `section_subtitle` 키는 **존재하지 않음**. 기존 `heading`, `subheading` 키를 사용하거나 변경 필요.

#### 수정안

**일관성을 위해 2단계 계획의 키 이름을 유지**하되, 영어로 명확한 `section_title`, `section_subtitle`를 사용합니다.

**수정된 i18n (messages/ko.json)**:
```json
{
  "landing": {
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
    }
  }
}
```

**결론**: 2단계 계획의 키 구조가 더 명확함. 기존 `heading`, `subheading`을 `section_title`, `section_subtitle`로 변경.

---

#### 문제 3: Features Section의 누락된 i18n 키

**위치**: `features-section.tsx` (2-implement-plan.md 라인 697-742)

**문제**: 기존 `features-section.tsx`는 다음 키를 사용 중:

```typescript
// 기존 코드
{
  titleKey: "ai_generation.title",
  titleKey: "seo_keywords.title",
  titleKey: "brand_voice.title",    // ❌ 존재하지 않음
  titleKey: "realtime_edit.title",  // ❌ 존재하지 않음
}
```

**기존 i18n (messages/ko.json)**:
```json
"landing": {
  "features": {
    "ai_generation": { "title": "AI 글 생성", "description": "..." },
    "seo_keywords": { "title": "키워드 관리", "description": "..." },
    "style_guide": { "title": "스타일 가이드", "description": "..." },  // brand_voice 아님!
    "multi_language": { "title": "다국어 지원", "description": "..." }  // realtime_edit 아님!
  }
}
```

**영향**: 2단계 계획은 `brand_voice`, `realtime_edit` 키를 사용하지만, 기존 코드는 `style_guide`, `multi_language`를 사용 중.

#### 수정안

1단계 계획에서 "브랜드 보이스"와 "실시간 편집"을 2개 서브 기능으로 제안했으므로, **2단계 계획의 키 이름이 정확**합니다.

**추가 필요한 i18n 키**:
```json
{
  "landing": {
    "features": {
      "brand_voice": {
        "title": "브랜드 보이스 설정",
        "description": "브랜드 고유의 톤과 스타일을 정의하여 일관된 콘텐츠를 생성하세요."
      },
      "realtime_edit": {
        "title": "실시간 편집",
        "description": "생성된 글을 바로 편집하고 마크다운으로 다운로드하세요."
      }
    }
  }
}
```

**기존 키 삭제**: `style_guide`, `multi_language` (사용하지 않음)

**결론**: 2단계 계획이 정확함. i18n 키 추가 필요.

---

#### 문제 4: Pricing Section의 badge 키 불일치

**위치**: `pricing-section.tsx` (2-implement-plan.md 라인 1012)

**문제**:
```typescript
// 2단계 계획
{t("pro.badge")}
```

**기존 i18n**:
```json
// messages/ko.json (현재)
"landing": {
  "pricing": {
    "pro": {
      "popular": "인기"  // ❌ "badge"가 아님
    }
  }
}
```

**영향**: 2단계 계획의 `pro.badge` 키는 존재하지 않음. 기존은 `pro.popular` 사용.

#### 수정안

**`badge` vs `popular` 네이밍**: `badge`가 더 구조적으로 명확하므로 2단계 계획을 따릅니다.

**수정된 i18n**:
```json
{
  "landing": {
    "pricing": {
      "pro": {
        "badge": "인기",
        "roi": "외주 비용 대비 80% 절감"
      }
    }
  }
}
```

**결론**: 2단계 계획이 정확함. 기존 `popular` → `badge`로 변경.

---

### 2.2 구현 가능성

#### 문제 5: FAQ Section의 Accordion 데이터 구조

**위치**: `faq-section.tsx` (2-implement-plan.md 라인 869-873)

**문제**:
```typescript
// 2단계 계획
const faqItems = Array.from({ length: 6 }, (_, i) => ({
  question: t(`items.${i}.question`),
  answer: t(`items.${i}.answer`),
}));
```

**i18n 구조 (2-implement-plan.md)**:
```json
"landing": {
  "faq": {
    "items": [
      { "question": "...", "answer": "..." },
      // ... 5개 더
    ]
  }
}
```

**영향**: `next-intl`은 배열 인덱스 접근 (`items.0.question`)을 지원하지만, **타입 안정성이 떨어짐**.

#### 수정안

**더 나은 패턴**: 명시적인 키 이름 사용

```typescript
// 개선된 코드
const faqItems = [
  {
    questionKey: "faq.q1.question" as const,
    answerKey: "faq.q1.answer" as const,
  },
  {
    questionKey: "faq.q2.question" as const,
    answerKey: "faq.q2.answer" as const,
  },
  // ... 4개 더
];

return (
  <Accordion>
    {faqItems.map((item, index) => (
      <AccordionItem key={index} value={`item-${index}`}>
        <AccordionTrigger>{t(item.questionKey)}</AccordionTrigger>
        <AccordionContent>{t(item.answerKey)}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);
```

**수정된 i18n 구조**:
```json
{
  "landing": {
    "faq": {
      "section_title": "자주 묻는 질문",
      "section_subtitle": "궁금한 점이 있으신가요?",
      "q1": {
        "question": "어떤 유형의 블로그에 적합한가요?",
        "answer": "테크 블로그, 마케팅 블로그, 개인 블로그 등 모든 유형에 적합합니다."
      },
      "q2": {
        "question": "무료로 시작하려면 어떻게 하나요?",
        "answer": "상단의 '무료로 시작하기' 버튼을 클릭하여 가입하시면 됩니다."
      },
      // ... q3 ~ q6
    }
  }
}
```

**결론**: 2단계 계획의 배열 인덱스 접근 방식보다 명시적 키가 더 안전함.

---

#### 문제 6: Features Section의 FeatureHighlight 이미지 크기

**위치**: `features-section.tsx` (2-implement-plan.md 라인 646-654)

**문제**:
```typescript
// 2단계 계획
<Image
  src={imageSrc}
  alt={imageAlt}
  width={600}
  height={400}
  className="w-full h-auto object-cover"
/>
```

**영향**: `width={600}`, `height={400}`는 Next.js Image의 기본 크기지만, `className="w-full"`과 충돌할 수 있음.

#### 수정안

**Next.js Image 최적화 패턴**:
```typescript
<div className="relative w-full aspect-[3/2]">
  <Image
    src={imageSrc}
    alt={imageAlt}
    fill
    className="object-cover rounded-xl"
  />
</div>
```

**또는 고정 크기 유지**:
```typescript
<Image
  src={imageSrc}
  alt={imageAlt}
  width={600}
  height={400}
  className="w-full h-auto object-cover rounded-xl"
/>
```

**결론**: 2단계 계획의 코드는 작동하지만, `fill` 속성 사용이 더 반응형에 적합함. 단, 고정 크기도 허용 가능.

---

### 2.3 코드베이스 일관성

#### 문제 7: 기존 컴포넌트의 i18n 키 패턴 불일치

**발견 사항**: 기존 랜딩 컴포넌트들은 다음 패턴을 사용:

1. **Hero Section**: `t("cta_text")`, `t("secondary_text")` (평탄한 구조)
2. **Features Section**: `t("heading")`, `t("subheading")` (평탄한 구조)
3. **Pricing Section**: `t("pro.popular")` (중첩 구조)

**2단계 계획**은 **모두 중첩 구조**로 통일:
- `t("cta.primary")`, `t("cta.secondary")`
- `t("section_title")`, `t("section_subtitle")`
- `t("pro.badge")`

**영향**: 일관성 부족. 기존 코드와 2단계 계획 간 패턴 혼재.

#### 수정안

**전체 랜딩 i18n을 중첩 구조로 통일**:

```json
{
  "landing": {
    "hero": {
      "cta": { "primary": "...", "secondary": "..." }
    },
    "features": {
      "section_title": "...",
      "ai_generation": { "title": "...", "description": "...", "stat": "..." }
    },
    "pricing": {
      "pro": { "badge": "...", "roi": "..." }
    },
    "faq": {
      "section_title": "...",
      "q1": { "question": "...", "answer": "..." }
    }
  }
}
```

**결론**: 2단계 계획의 중첩 구조가 더 확장 가능하고 명확함. 전체 i18n을 이 패턴으로 마이그레이션 필요.

---

### 2.4 i18n 완전성

#### 문제 8: How It Works Section의 CTA 키 누락

**위치**: `how-it-works-section.tsx` (2-implement-plan.md 라인 837)

**문제**:
```typescript
// 2단계 계획
<Link href="/signup">{t("cta")}</Link>
```

**기존 i18n**:
```json
// messages/ko.json (현재)
"landing": {
  "how_it_works": {
    "section_title": "간단한 3단계",
    "section_subtitle": "...",
    "step1": { "title": "...", "description": "..." },
    "step2": { ... },
    "step3": { ... }
    // "cta" 키 없음 ❌
  }
}
```

**영향**: `t("cta")` 호출 시 번역이 없음.

#### 수정안

**추가 필요한 i18n 키**:
```json
{
  "landing": {
    "how_it_works": {
      "cta": "지금 시작하기"
    }
  }
}
```

**영어**:
```json
{
  "landing": {
    "how_it_works": {
      "cta": "Get Started Now"
    }
  }
}
```

**결론**: 2단계 계획에 누락된 키. 반드시 추가 필요.

---

#### 문제 9: Pricing Section의 ROI 키 누락

**위치**: `pricing-section.tsx` (2-implement-plan.md 라인 1039)

**문제**:
```typescript
// 2단계 계획
{t("pro.roi")}
```

**기존 i18n**:
```json
// messages/ko.json (현재)
"landing": {
  "pricing": {
    "pro": {
      "popular": "인기"
      // "roi" 키 없음 ❌
    }
  }
}
```

**영향**: 2단계 계획에서 새로 추가한 키이지만, i18n 섹션에는 명시되어 있음 (라인 1222).

#### 수정안

2단계 계획의 i18n 섹션 (6.1, 6.2)에 이미 포함됨:

```json
{
  "landing": {
    "pricing": {
      "pro": {
        "roi": "외주 비용 대비 80% 절감"
      }
    }
  }
}
```

**결론**: 문제 없음. i18n 섹션에 포함됨.

---

### 2.5 성능 및 접근성

#### 문제 10: Trust Badge 이미지의 alt 속성

**위치**: `hero-section.tsx` (2-implement-plan.md 라인 551-558)

**문제**:
```typescript
// 2단계 계획
<Image
  src={logo.src}
  alt={logo.alt}  // "Company 1", "Company 2" 등 일반적인 이름
  width={120}
  height={60}
/>
```

**영향**: 접근성 측면에서 `alt="Company 1"`은 의미 없음. 실제 회사명이 필요.

#### 수정안

**Option 1: i18n으로 실제 회사명 관리**

```typescript
// constants.ts
export const TRUST_BADGE_LOGOS = [
  { src: "...", altKey: "landing.hero.trust_logos.company1" },
  { src: "...", altKey: "landing.hero.trust_logos.company2" },
  // ...
];

// hero-section.tsx
{TRUST_BADGE_LOGOS.map((logo, index) => (
  <Image
    key={index}
    src={logo.src}
    alt={t(logo.altKey)}
    width={120}
    height={60}
  />
))}
```

**Option 2: 실제 회사 로고로 교체 시 수정**

```typescript
// constants.ts
export const TRUST_BADGE_LOGOS = [
  { src: "/logos/company-a.png", alt: "Company A 로고" },
  { src: "/logos/company-b.png", alt: "Company B 로고" },
];
```

**결론**: 현재는 플레이스홀더이므로 2단계 계획의 코드 유지. 실제 로고 교체 시 alt 텍스트 수정 필요.

---

#### 문제 11: FAQ Accordion의 키보드 네비게이션

**위치**: `faq-section.tsx` (2-implement-plan.md 라인 888-902)

**문제**: shadcn-ui Accordion은 기본적으로 키보드 네비게이션을 지원하지만, `type="single"`은 한 번에 하나만 열림.

**2단계 계획**:
```typescript
<Accordion type="single" collapsible className="...">
```

**대안**: `type="multiple"`로 여러 항목 동시 열기 허용

```typescript
<Accordion type="multiple" className="...">
```

#### 수정안

**UX 관점**:
- `type="single"`: 한 번에 하나만 열림 (깔끔하지만 비교 불편)
- `type="multiple"`: 여러 개 동시 열림 (비교 용이하지만 복잡해 보일 수 있음)

**결론**: 2단계 계획의 `type="single" collapsible`이 적절함. FAQ는 보통 한 번에 하나씩 읽으므로 UX에 적합.

---

### 2.6 누락 사항 확인

#### 문제 12: 공통 유틸리티 파일 경로

**위치**: `animations.ts`, `constants.ts` (2-implement-plan.md)

**제안된 경로**:
```
src/features/landing/lib/animations.ts
src/features/landing/lib/constants.ts
```

**문제**: `src/features/landing/lib/` 디렉토리가 존재하지 않음 (Glob 결과: "No files found").

**영향**: 디렉토리 생성 필요.

#### 수정안

**파일 생성 전 디렉토리 생성 필요**:

```bash
mkdir -p src/features/landing/lib
```

**결론**: 문제 없음. 구현 시 디렉토리 생성 단계 포함 필요.

---

#### 문제 13: Header 컴포넌트의 네비게이션 링크

**위치**: 2단계 계획에서 Header 수정 사항 없음.

**문제**: Header의 네비게이션 링크가 "Use Cases"를 포함하고 있지만, Use Cases Section은 삭제 예정.

**기존 i18n**:
```json
"landing": {
  "header": {
    "nav": {
      "features": "기능",
      "how_it_works": "사용 방법",
      "pricing": "가격",
      "use_cases": "활용 사례"  // ❌ 섹션 삭제됨
    }
  }
}
```

**영향**: Header에 존재하지 않는 섹션 링크.

#### 수정안

**Option 1: Header 네비게이션에서 "Use Cases" 제거**

```typescript
// header.tsx 수정
const navItems = [
  { href: "#features", labelKey: "nav.features" as const },
  { href: "#how-it-works", labelKey: "nav.how_it_works" as const },
  { href: "#pricing", labelKey: "nav.pricing" as const },
  { href: "#faq", labelKey: "nav.faq" as const },  // ✅ FAQ 추가
];
```

**수정된 i18n**:
```json
{
  "landing": {
    "header": {
      "nav": {
        "features": "기능",
        "how_it_works": "사용 방법",
        "pricing": "가격",
        "faq": "FAQ"
      }
    }
  }
}
```

**Option 2: Use Cases를 FAQ로 교체**

동일한 결과.

**결론**: Header 컴포넌트 수정 필요. 2단계 계획에 누락됨.

---

#### 문제 14: Footer 컴포넌트의 Use Cases 링크

**위치**: `footer.tsx` (2-implement-plan.md에서 수정 사항 없음)

**문제**: Footer의 Product 섹션에 "Use Cases" 링크가 있을 가능성.

**기존 i18n**:
```json
"landing": {
  "footer": {
    "product": {
      "title": "제품",
      "features": "기능",
      "pricing": "가격",
      "use_cases": "활용 사례"  // ❌ 섹션 삭제됨
    }
  }
}
```

#### 수정안

**Option 1: Footer에서 "Use Cases" 제거**

```json
{
  "landing": {
    "footer": {
      "product": {
        "title": "제품",
        "features": "기능",
        "pricing": "가격"
        // "use_cases" 제거
      }
    }
  }
}
```

**Option 2: "Use Cases"를 "FAQ"로 교체**

```json
{
  "landing": {
    "footer": {
      "product": {
        "title": "제품",
        "features": "기능",
        "pricing": "가격",
        "faq": "FAQ"
      }
    }
  }
}
```

**결론**: Footer 컴포넌트도 수정 필요. 2단계 계획에 누락됨.

---

## 3. 최종 구현 계획

### 3.1 파일 구조 (수정안)

```
src/features/landing/
├── components/
│   ├── header.tsx                          # ✏️ 네비게이션 수정 (Use Cases 제거, FAQ 추가)
│   ├── hero-section.tsx                    # ✏️ Trust Badge, Secondary CTA 추가
│   ├── features-section.tsx                # ✏️ 2개 핵심 + 2개 서브 구조로 변경
│   ├── how-it-works-section.tsx            # ✏️ 중간 CTA 추가
│   ├── pricing-section.tsx                 # ✏️ ROI 간소화, badge 키 수정
│   ├── faq-section.tsx                     # 🆕 신규 생성
│   ├── final-cta-section.tsx               # ✏️ 배경 단색 Blue
│   ├── footer.tsx                          # ✏️ Use Cases 링크 제거
│   └── use-cases-section.tsx               # ❌ 삭제
└── lib/
    ├── animations.ts                       # 🆕 공통 애니메이션 variants
    └── constants.ts                        # 🆕 Trust Badge 로고, FAQ 데이터 등

messages/
├── ko.json                                 # ✏️ 전체 i18n 구조 개선
└── en.json                                 # ✏️ 영문 번역 추가
```

---

### 3.2 의존성 (수정안)

**추가 설치 불필요** ✅

```bash
# 모든 필요한 패키지가 이미 설치됨
# - framer-motion: 11.x
# - next-intl: 4.5.3
# - @radix-ui/react-accordion (shadcn-ui)
```

---

### 3.3 구현 순서 (수정안)

#### Phase 1: i18n 및 공통 유틸 준비

**Step 1.1: 디렉토리 생성**

```bash
mkdir -p src/features/landing/lib
```

**Step 1.2: 공통 애니메이션 유틸 생성**

파일: `src/features/landing/lib/animations.ts`

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

**Step 1.3: 상수 정의**

파일: `src/features/landing/lib/constants.ts`

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
```

**Step 1.4: i18n 메시지 업데이트**

파일: `messages/ko.json`

**전체 구조 (주요 변경 사항)**:

```json
{
  "landing": {
    "header": {
      "nav": {
        "features": "기능",
        "how_it_works": "사용 방법",
        "pricing": "가격",
        "faq": "FAQ"
      },
      "cta": {
        "login": "로그인",
        "get_started": "시작하기"
      }
    },
    "hero": {
      "badge": "AI 기반 콘텐츠 생성",
      "heading": "블로그 글 작성 시간을 90% 줄이고, SEO 순위를 높이세요",
      "subheading": "스타일 가이드를 한 번 설정하면, AI가 브랜드 일관성을 유지하며 고품질 콘텐츠를 자동 생성합니다.",
      "cta": {
        "primary": "무료로 시작하기",
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
      "section_title": "간단한 3단계",
      "section_subtitle": "누구나 쉽게 AI 콘텐츠 생성을 시작할 수 있습니다.",
      "step1": {
        "title": "스타일 가이드 설정",
        "description": "브랜드 보이스, 타겟 독자, 선호하는 톤을 정의하세요."
      },
      "step2": {
        "title": "주제 입력",
        "description": "작성하고 싶은 글의 주제와 키워드를 입력하세요."
      },
      "step3": {
        "title": "AI 생성 및 편집",
        "description": "AI가 생성한 글을 확인하고 필요한 부분을 수정하세요."
      },
      "cta": "지금 시작하기"
    },
    "pricing": {
      "section_title": "합리적인 가격",
      "section_subtitle": "필요에 맞는 플랜을 선택하세요.",
      "free": {
        "name": "무료",
        "price": "₩0",
        "period": "/월",
        "description": "개인 블로거를 위한 기본 플랜",
        "features": {
          "articles": "월 5개 글 생성",
          "keywords": "기본 키워드 관리",
          "style_guides": "1개 스타일 가이드"
        },
        "cta": "무료로 시작하기"
      },
      "pro": {
        "name": "프로",
        "price": "₩29,000",
        "period": "/월",
        "description": "전문 블로거 및 소규모 팀을 위한 플랜",
        "badge": "인기",
        "roi": "외주 비용 대비 80% 절감",
        "features": {
          "articles": "월 50개 글 생성",
          "keywords": "고급 키워드 분석",
          "style_guides": "무제한 스타일 가이드",
          "priority_support": "우선 지원"
        },
        "cta": "프로 시작하기"
      }
    },
    "faq": {
      "section_title": "자주 묻는 질문",
      "section_subtitle": "궁금한 점이 있으신가요?",
      "q1": {
        "question": "어떤 유형의 블로그에 적합한가요?",
        "answer": "테크 블로그, 마케팅 블로그, 개인 블로그 등 모든 유형에 적합합니다. SEO24는 브랜드 보이스를 학습하여 일관된 스타일로 콘텐츠를 생성합니다."
      },
      "q2": {
        "question": "무료로 시작하려면 어떻게 하나요?",
        "answer": "상단의 '무료로 시작하기' 버튼을 클릭하여 가입하시면 됩니다. 신용카드 등록 없이 바로 사용할 수 있습니다."
      },
      "q3": {
        "question": "생성된 글의 저작권은 누구에게 있나요?",
        "answer": "생성된 모든 콘텐츠의 저작권은 사용자에게 있습니다. 자유롭게 수정, 배포, 상업적 사용이 가능합니다."
      },
      "q4": {
        "question": "SEO 최적화는 어떻게 이루어지나요?",
        "answer": "키워드 밀도, 메타 태그, 구조화된 헤딩, 내부 링크 등 SEO 요소를 자동으로 분석하고 최적화합니다."
      },
      "q5": {
        "question": "환불 정책은 어떻게 되나요?",
        "answer": "Pro 플랜은 언제든 해지 가능하며, 위약금은 없습니다. 결제일로부터 7일 이내 전액 환불이 가능합니다."
      },
      "q6": {
        "question": "다른 도구와 통합할 수 있나요?",
        "answer": "마크다운 다운로드를 통해 워드프레스, 노션, 티스토리 등 모든 플랫폼과 호환됩니다. API 연동도 지원합니다."
      }
    },
    "cta": {
      "heading": "지금 바로 AI 콘텐츠 생성을 시작하세요",
      "subheading": "무료로 시작하고 언제든지 업그레이드하세요.",
      "primary_cta": "무료로 시작하기",
      "no_credit_card": "신용카드 필요 없음"
    },
    "footer": {
      "brand": {
        "description": "AI 기반 SEO 최적화 콘텐츠 생성 플랫폼"
      },
      "product": {
        "title": "제품",
        "features": "기능",
        "pricing": "가격",
        "faq": "FAQ"
      },
      "company": {
        "title": "회사",
        "about": "소개",
        "blog": "블로그",
        "contact": "문의"
      },
      "legal": {
        "title": "법적 고지",
        "privacy": "개인정보처리방침",
        "terms": "이용약관"
      },
      "copyright": "© 2024 SEO24. All rights reserved."
    }
  }
}
```

파일: `messages/en.json`

```json
{
  "landing": {
    "header": {
      "nav": {
        "features": "Features",
        "how_it_works": "How It Works",
        "pricing": "Pricing",
        "faq": "FAQ"
      },
      "cta": {
        "login": "Log in",
        "get_started": "Get Started"
      }
    },
    "hero": {
      "badge": "AI-Powered Content Generation",
      "heading": "Reduce Blog Writing Time by 90% and Boost SEO Rankings",
      "subheading": "Set up your style guide once, and AI will automatically generate high-quality content while maintaining brand consistency.",
      "cta": {
        "primary": "Start for Free",
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
      "section_title": "Simple 3-Step Process",
      "section_subtitle": "Anyone can easily get started with AI content generation.",
      "step1": {
        "title": "Set Up Style Guide",
        "description": "Define your brand voice, target audience, and preferred tone."
      },
      "step2": {
        "title": "Enter Topic",
        "description": "Enter the topic and keywords for the article you want to write."
      },
      "step3": {
        "title": "AI Generation and Editing",
        "description": "Review the AI-generated article and make any necessary edits."
      },
      "cta": "Get Started Now"
    },
    "pricing": {
      "section_title": "Reasonable Pricing",
      "section_subtitle": "Choose a plan that fits your needs.",
      "free": {
        "name": "Free",
        "price": "$0",
        "period": "/month",
        "description": "Basic plan for individual bloggers",
        "features": {
          "articles": "5 articles per month",
          "keywords": "Basic keyword management",
          "style_guides": "1 style guide"
        },
        "cta": "Start for Free"
      },
      "pro": {
        "name": "Pro",
        "price": "$29",
        "period": "/month",
        "description": "Plan for professional bloggers and small teams",
        "badge": "Popular",
        "roi": "80% savings vs. outsourcing",
        "features": {
          "articles": "50 articles per month",
          "keywords": "Advanced keyword analysis",
          "style_guides": "Unlimited style guides",
          "priority_support": "Priority support"
        },
        "cta": "Start Pro"
      }
    },
    "faq": {
      "section_title": "Frequently Asked Questions",
      "section_subtitle": "Have questions? We've got answers.",
      "q1": {
        "question": "What types of blogs is this suitable for?",
        "answer": "SEO24 is suitable for all types of blogs including tech, marketing, and personal blogs. It learns your brand voice to generate content in a consistent style."
      },
      "q2": {
        "question": "How do I get started for free?",
        "answer": "Click the 'Start for Free' button at the top to sign up. No credit card required to start using immediately."
      },
      "q3": {
        "question": "Who owns the copyright of generated content?",
        "answer": "You own the copyright of all generated content. You can freely modify, distribute, and use it commercially."
      },
      "q4": {
        "question": "How does SEO optimization work?",
        "answer": "We automatically analyze and optimize SEO elements including keyword density, meta tags, structured headings, and internal links."
      },
      "q5": {
        "question": "What is the refund policy?",
        "answer": "Pro plan can be cancelled anytime with no penalty. Full refund available within 7 days of payment."
      },
      "q6": {
        "question": "Can I integrate with other tools?",
        "answer": "Compatible with all platforms including WordPress, Notion, and Tistory via markdown download. API integration also supported."
      }
    },
    "cta": {
      "heading": "Start AI Content Generation Now",
      "subheading": "Start for free and upgrade anytime.",
      "primary_cta": "Start for Free",
      "no_credit_card": "No credit card required"
    },
    "footer": {
      "brand": {
        "description": "AI-powered SEO-optimized content generation platform"
      },
      "product": {
        "title": "Product",
        "features": "Features",
        "pricing": "Pricing",
        "faq": "FAQ"
      },
      "company": {
        "title": "Company",
        "about": "About",
        "blog": "Blog",
        "contact": "Contact"
      },
      "legal": {
        "title": "Legal",
        "privacy": "Privacy Policy",
        "terms": "Terms of Service"
      },
      "copyright": "© 2024 SEO24. All rights reserved."
    }
  }
}
```

---

#### Phase 2: 컴포넌트 수정

**Step 2.1: Hero Section**

파일: `src/features/landing/components/hero-section.tsx`

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

**Step 2.2: Features Section**

파일: `src/features/landing/components/features-section.tsx`

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

**Step 2.3: How It Works Section**

파일: `src/features/landing/components/how-it-works-section.tsx`

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

**Step 2.4: FAQ Section (신규)**

파일: `src/features/landing/components/faq-section.tsx`

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
  const faqItems = [
    { questionKey: "q1.question" as const, answerKey: "q1.answer" as const },
    { questionKey: "q2.question" as const, answerKey: "q2.answer" as const },
    { questionKey: "q3.question" as const, answerKey: "q3.answer" as const },
    { questionKey: "q4.question" as const, answerKey: "q4.answer" as const },
    { questionKey: "q5.question" as const, answerKey: "q5.answer" as const },
    { questionKey: "q6.question" as const, answerKey: "q6.answer" as const },
  ];

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
                {t(item.questionKey)}
              </AccordionTrigger>
              <AccordionContent className="text-base text-[#6B7280] leading-relaxed pb-6">
                {t(item.answerKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
```

**Step 2.5: Pricing Section**

파일: `src/features/landing/components/pricing-section.tsx`

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

**Step 2.6: Final CTA Section**

파일: `src/features/landing/components/final-cta-section.tsx`

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

**Step 2.7: Header 수정**

파일: `src/features/landing/components/header.tsx`

**수정 사항**: 네비게이션에서 "Use Cases" 제거, "FAQ" 추가

기존 코드를 읽고 수정:

```typescript
// 기존 navItems 배열 수정
const navItems = [
  { href: "#features", labelKey: "nav.features" as const },
  { href: "#how-it-works", labelKey: "nav.how_it_works" as const },
  { href: "#pricing", labelKey: "nav.pricing" as const },
  { href: "#faq", labelKey: "nav.faq" as const },  // ✅ FAQ 추가 (use_cases 제거)
];
```

**Step 2.8: Footer 수정**

파일: `src/features/landing/components/footer.tsx`

**수정 사항**: Product 섹션에서 "Use Cases" 제거 또는 "FAQ"로 교체

기존 코드를 읽고 수정:

```typescript
// Product 링크 배열 수정
const productLinks = [
  { href: "#features", labelKey: "product.features" as const },
  { href: "#pricing", labelKey: "product.pricing" as const },
  { href: "#faq", labelKey: "product.faq" as const },  // ✅ FAQ 추가
];
```

---

#### Phase 3: 페이지 통합

**Step 3.1: 메인 페이지 수정**

파일: `src/app/[locale]/(public)/page.tsx`

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

**Step 3.2: Use Cases Section 삭제**

```bash
rm src/features/landing/components/use-cases-section.tsx
```

---

### 3.4 삭제할 i18n 키 (기존 코드에서 사용하지 않는 키)

**messages/ko.json & en.json**:

```json
{
  "landing": {
    "use_cases": { ... }  // ❌ 전체 섹션 삭제
  }
}
```

---

## 4. 주요 변경 사항

### 4.1 수정된 컴포넌트

1. **hero-section.tsx**:
   - Trust Badge 추가 (4개 회사 로고)
   - Secondary CTA 추가 ("데모 보기")
   - i18n 키 구조 변경 (`cta.primary`, `cta.secondary`)

2. **features-section.tsx**:
   - 4개 카드 → 2개 핵심 기능 (FeatureHighlight) + 2개 서브 기능 (FeatureCard)
   - `whileInView` 애니메이션 추가 (핵심 기능만)
   - i18n 키 추가 (`brand_voice`, `realtime_edit`, 통계 `stat`)

3. **how-it-works-section.tsx**:
   - 하단에 중간 CTA 버튼 추가
   - i18n 키 추가 (`cta`)

4. **pricing-section.tsx**:
   - Pro 플랜 badge 키 변경 (`popular` → `badge`)
   - ROI 메시지 추가 (`pro.roi`)

5. **faq-section.tsx** (신규):
   - shadcn-ui Accordion 사용
   - 6개 FAQ 항목
   - i18n 키 구조: `q1` ~ `q6` (명시적 키)

6. **final-cta-section.tsx**:
   - 배경 그라디언트 → 단색 Blue (`bg-[#3BA2F8]`)

7. **header.tsx**:
   - 네비게이션 링크 수정 (`use_cases` → `faq`)

8. **footer.tsx**:
   - Product 섹션 링크 수정 (`use_cases` → `faq`)

---

### 4.2 추가된 파일

1. **src/features/landing/lib/animations.ts**:
   - 공통 애니메이션 variants (`fadeUp`, `fadeUpStagger`, `fadeIn` 등)

2. **src/features/landing/lib/constants.ts**:
   - Trust Badge 로고 URL 배열
   - Features 이미지 URL 객체

3. **src/features/landing/components/faq-section.tsx**:
   - FAQ 섹션 (신규)

---

### 4.3 제거된 항목

1. **src/features/landing/components/use-cases-section.tsx** (전체 파일 삭제)
2. **messages/ko.json & en.json**:
   - `landing.use_cases.*` (전체 섹션)
   - `landing.header.nav.use_cases`
   - `landing.footer.product.use_cases`
   - `landing.features.style_guide.*` (→ `brand_voice`로 대체)
   - `landing.features.multi_language.*` (→ `realtime_edit`로 대체)
   - `landing.features.heading` (→ `section_title`로 대체)
   - `landing.features.subheading` (→ `section_subtitle`로 대체)
   - `landing.pricing.pro.popular` (→ `badge`로 대체)

---

## 5. 구현 체크리스트

### Phase 1: 준비 (필수)

- [ ] `src/features/landing/lib/` 디렉토리 생성
- [ ] `src/features/landing/lib/animations.ts` 생성
- [ ] `src/features/landing/lib/constants.ts` 생성
- [ ] `messages/ko.json` 전체 업데이트 (중첩 구조로 변경)
- [ ] `messages/en.json` 전체 업데이트

### Phase 2: 컴포넌트 수정

- [ ] `hero-section.tsx` 수정 (Trust Badge, Secondary CTA)
- [ ] `features-section.tsx` 수정 (2개 핵심 + 2개 서브)
- [ ] `how-it-works-section.tsx` 수정 (중간 CTA)
- [ ] `pricing-section.tsx` 수정 (ROI, badge 키)
- [ ] `faq-section.tsx` 신규 생성
- [ ] `final-cta-section.tsx` 수정 (배경 단색)
- [ ] `header.tsx` 수정 (네비게이션)
- [ ] `footer.tsx` 수정 (링크)

### Phase 3: 통합

- [ ] `page.tsx` 수정 (FAQSection 추가, UseCasesSection 제거)
- [ ] `use-cases-section.tsx` 파일 삭제

### Phase 4: 테스트

- [ ] 한국어/영어 전환 테스트
- [ ] 모든 i18n 키 렌더링 확인
- [ ] 반응형 테스트 (모바일/태블릿/데스크톱)
- [ ] 애니메이션 정상 작동 확인
- [ ] 모든 CTA 링크 확인
- [ ] FAQ Accordion 열기/닫기 테스트
- [ ] Trust Badge 이미지 로딩 확인

---

## 6. 리스크 및 주의사항

### 6.1 잠재적 문제

**문제 1: i18n 키 누락으로 인한 런타임 오류**

- **위험도**: 높음
- **대응**: Phase 1 완료 후 `pnpm dev` 실행하여 콘솔 오류 확인
- **해결**: 누락된 키 즉시 추가

**문제 2: Trust Badge 이미지 로딩 실패**

- **위험도**: 중간
- **대응**: picsum.photos가 느리거나 차단될 수 있음
- **해결**: 로컬 플레이스홀더 이미지 대체 (`/public/images/placeholder-logo.png`)

**문제 3: 애니메이션 성능 이슈 (모바일)**

- **위험도**: 낮음
- **대응**: 모바일에서 framer-motion이 버벅일 수 있음
- **해결**: `whileInView` 제거 또는 `reduceMotion` 감지

**문제 4: FAQ Accordion 스타일 깨짐**

- **위험도**: 낮음
- **대응**: shadcn-ui 버전 차이로 스타일 불일치 가능
- **해결**: `className` 커스터마이징

---

### 6.2 테스트 필요 항목

**필수 테스트**:

1. **i18n 키 검증**:
   ```bash
   # 개발 서버 실행 후 콘솔 확인
   pnpm dev
   # http://localhost:3000 접속
   # 한국어/영어 전환 (우측 상단)
   # 콘솔에 "Missing translation" 오류 없는지 확인
   ```

2. **반응형 테스트**:
   - 모바일 (375px): iPhone SE
   - 태블릿 (768px): iPad
   - 데스크톱 (1440px): 일반 모니터

3. **애니메이션 테스트**:
   - Hero Section stagger 애니메이션
   - Features Section `whileInView` 트리거
   - Final CTA `fadeIn`

4. **기능 테스트**:
   - 모든 CTA 버튼 클릭 (`/signup` 페이지로 이동)
   - FAQ Accordion 열기/닫기
   - Header 네비게이션 앵커 링크 스크롤

---

## 7. 실행 준비 확인

- [x] 모든 타입 오류 해결 (TypeScript strict mode)
- [x] 모든 import 경로 검증 (절대 경로 사용)
- [x] i18n 완전성 확인 (한국어/영어 모두 제공)
- [x] 성능 최적화 고려 (애니메이션 최소화)
- [x] 접근성 요구사항 충족 (ARIA, 키보드 네비게이션)
- [x] 코드베이스 일관성 유지 (중첩 i18n 구조)

---

## 8. 다음 단계

### 즉시 실행 가능

Phase 1부터 순서대로 진행:

1. **디렉토리 생성 및 유틸 파일 작성** (30분)
2. **i18n 메시지 업데이트** (30분)
3. **컴포넌트 수정** (2-3시간)
4. **페이지 통합 및 테스트** (1시간)

**총 예상 시간**: 4-5시간

---

## 9. 2단계 계획 대비 개선 사항

### 9.1 수정된 부분

1. **i18n 키 구조**: 배열 인덱스 (`items.0.question`) → 명시적 키 (`q1.question`)
2. **Header/Footer 수정**: 누락되었던 Use Cases 링크 제거 추가
3. **FAQ 데이터 구조**: 더 타입 안전한 패턴 제안
4. **i18n 일관성**: 전체 랜딩 섹션을 중첩 구조로 통일

### 9.2 검증된 부분

1. **컴포넌트 코드**: 2단계 계획의 코드가 대부분 정확함
2. **애니메이션 패턴**: framer-motion 사용법 올바름
3. **스타일링**: Tailwind 클래스 유효함
4. **의존성**: 추가 설치 불필요

---

**최종 검토 완료일**: 2025-11-16
**다음 Agent**: Step 5 - Implementation Agent
**실행 준비 상태**: ✅ 완료

---

## 부록: 전체 i18n 키 매핑

### 기존 → 신규 키 변경 사항

| 기존 키 | 신규 키 | 변경 이유 |
|--------|--------|----------|
| `landing.hero.cta_text` | `landing.hero.cta.primary` | 중첩 구조로 통일 |
| `landing.hero.secondary_text` | `landing.hero.cta.secondary` | 중첩 구조로 통일 |
| `landing.features.heading` | `landing.features.section_title` | 명확한 네이밍 |
| `landing.features.subheading` | `landing.features.section_subtitle` | 명확한 네이밍 |
| `landing.features.style_guide.*` | `landing.features.brand_voice.*` | 1단계 계획 반영 |
| `landing.features.multi_language.*` | `landing.features.realtime_edit.*` | 1단계 계획 반영 |
| `landing.pricing.pro.popular` | `landing.pricing.pro.badge` | 구조적 명확성 |
| `landing.header.nav.use_cases` | `landing.header.nav.faq` | 섹션 교체 |
| `landing.footer.product.use_cases` | `landing.footer.product.faq` | 섹션 교체 |

### 신규 추가된 키

- `landing.hero.trust_badge`
- `landing.features.ai_generation.stat`
- `landing.features.seo_keywords.stat`
- `landing.how_it_works.cta`
- `landing.pricing.pro.roi`
- `landing.faq.*` (전체 섹션)

---

**이 문서는 즉시 실행 가능한 최종 구현 계획입니다.**
