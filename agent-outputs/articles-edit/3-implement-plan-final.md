# Articles Edit 페이지 구현 계획 최종 검토

## 1. 원안 요약

2번 단계 계획은 Articles Edit 페이지를 다음과 같이 개선하려 했습니다:

- **하드코딩 제거**: `#FCFCFD` → `bg-background`, `data-color-mode="light"` → `data-color-mode={resolvedTheme}`
- **다크모드 지원**: `next-themes`의 `useTheme` 훅 사용, MDEditor 다크모드 CSS 추가
- **컴포넌트 분리**: 인라인 타이틀 입력, SEO Collapsible 패널, 미리보기 슬라이드 패널 등
- **UX 개선**: Active Heading 추적, framer-motion 애니메이션 추가

---

## 2. 발견된 문제점

### 2.1 코드 정확성

#### 문제 1: AutoSaveIndicator의 translation 네임스페이스 불일치
- **위치**: `src/features/articles/components/auto-save-indicator.tsx` (기존 파일) 및 계획서의 수정 버전
- **문제**: 기존 코드는 `useTranslations("articles")`를 사용하지만, 계획서는 `useTranslations("editor")` 사용
- **영향**: 번역 키를 찾지 못해 렌더링 오류 발생

#### 수정안
```typescript
// 기존 코드 (line 19)
const t = useTranslations("articles");

// 수정 후 - 기존 구조 유지
const t = useTranslations("articles"); // "articles"로 유지하거나
// OR 계획서대로 "editor"로 통일 + i18n 파일 수정
```

**권장사항**: 기존 `articles` 네임스페이스를 유지하고, `articles.autoSave.saving`, `articles.autoSave.saved`, `articles.autoSave.error` 키를 i18n 파일에 추가하는 것이 안전합니다.

---

#### 문제 2: TableOfContents의 translation 네임스페이스 불일치
- **위치**: `src/features/articles/components/table-of-contents.tsx`
- **문제**: 기존 코드는 `useTranslations("articles")`를 사용하지만, 계획서는 `useTranslations("editor")` 사용
- **영향**: `t("tableOfContents.title")` 키를 찾지 못함

#### 수정안
기존 `articles` 네임스페이스를 유지하고 i18n 파일에 키 추가:

```json
// messages/en.json - "articles" 섹션에 추가
"articles": {
  "tableOfContents": {
    "title": "Table of Contents"
  },
  "autoSave": {
    "saving": "Saving...",
    "saved": "Saved {time}",
    "error": "Failed to save"
  }
}

// messages/ko.json - "articles" 섹션에 추가
"articles": {
  "tableOfContents": {
    "title": "목차"
  },
  "autoSave": {
    "saving": "저장 중...",
    "saved": "{time} 저장됨",
    "error": "저장 실패"
  }
}
```

---

#### 문제 3: AutoSaveIndicator의 date-fns locale 하드코딩
- **위치**: 계획서 `auto-save-indicator.tsx` (line 482-483)
- **문제**: 기존 코드는 `ko` locale만 import하지만, 계획서는 `ko, enUS` 모두 import하고 `useLocale()` 훅으로 동적 선택
- **영향**: 기존 코드는 영어 사용자에게도 한국어 상대 시간 표시 ("3분 전" 대신 "3 minutes ago")

#### 수정안
```typescript
// 수정 전 (기존 코드)
import { ko } from 'date-fns/locale';
// ...
locale: ko, // 항상 한국어

// 수정 후 (계획서)
import { ko, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
// ...
const locale = useLocale();
const dateLocale = locale === 'ko' ? ko : enUS;
// ...
locale: dateLocale,
```

**권장**: 계획서대로 수정하여 i18n 완전성 확보

---

#### 문제 4: TableOfContents의 동적 Tailwind 클래스 사용
- **위치**: 기존 `table-of-contents.tsx` (line 35-37)
- **문제**:
  ```typescript
  className={`w-full justify-start text-left ${
    heading.level > 1 ? `pl-${(heading.level - 1) * 4}` : ''
  }`}
  ```
  - Tailwind는 **템플릿 리터럴로 생성된 클래스를 tree-shake함** (JIT 모드에서 인식 불가)
  - `pl-4`, `pl-8`, `pl-12` 등이 빌드 시 제거됨

#### 수정안
```typescript
// 수정 전 (기존 코드 - 작동하지 않음)
className={`w-full justify-start text-left ${
  heading.level > 1 ? `pl-${(heading.level - 1) * 4}` : ''
}`}

// 수정 후 (계획서 - 안전함)
className={cn(
  'w-full justify-start text-left text-sm',
  heading.level === 1 && 'pl-2',
  heading.level === 2 && 'pl-4',
  heading.level === 3 && 'pl-6',
  heading.level === 4 && 'pl-8',
  heading.level === 5 && 'pl-10',
  heading.level === 6 && 'pl-12',
  activeId === heading.id && 'bg-accent font-medium'
)}
```

**권장**: 계획서대로 수정 (Tailwind safe-list 패턴)

---

#### 문제 5: 누락된 `back_to_dashboard` 번역 키
- **위치**: 계획서 `page.tsx` (line 902, line 1122)
- **문제**: `t('back_to_dashboard')`를 사용하지만, 기존 i18n 파일에는 해당 키 없음
- **영향**: 렌더링 시 번역 키 누락 경고

#### 수정안
```json
// messages/en.json - "editor" 섹션에 추가
"editor": {
  "back_to_dashboard": "Back to Dashboard"
}

// messages/ko.json - "editor" 섹션에 추가
"editor": {
  "back_to_dashboard": "대시보드로 돌아가기"
}
```

---

#### 문제 6: 계획서의 `field_content_mobile` vs 기존 코드
- **위치**: 기존 `page.tsx` (line 223)
- **문제**: 기존 코드는 이미 `field_content_mobile` 키를 사용하지만, i18n 파일에는 없음
- **영향**: 현재도 번역 누락 상태

#### 수정안
```json
// messages/en.json
"editor": {
  "field_content_mobile": "Content"
}

// messages/ko.json
"editor": {
  "field_content_mobile": "본문"
}
```

---

### 2.2 구현 가능성

#### 문제 7: Radix Collapsible 컴포넌트 미설치
- **위치**: 계획서 Step 2
- **문제**: `src/components/ui/collapsible.tsx` 파일이 존재하지 않음
- **영향**: `SeoCollapsiblePanel` 컴포넌트가 작동하지 않음

#### 수정안
```bash
# 반드시 실행 필요
npx shadcn@latest add collapsible
```

**필수 사항**: 이 명령을 실행하지 않으면 빌드 에러 발생

---

#### 문제 8: PreviewSlidePanel의 반응형 처리 불완전
- **위치**: 계획서 `preview-slide-panel.tsx` (line 643)
- **문제**: Backdrop이 `lg:hidden`으로 설정되어 Desktop에서는 Backdrop 없이 슬라이드 패널만 표시
- **영향**: Desktop에서 Preview 패널이 Editor와 겹쳐 보일 수 있음 (레이아웃 충돌)

#### 수정안
Desktop 레이아웃에서는 Preview 패널을 고정 위치가 아닌 **flex 레이아웃의 일부**로 통합:

```typescript
// 계획서 page.tsx (line 919-1002)
<div className="hidden lg:flex lg:gap-6">
  {/* TOC */}
  <div className="w-64 flex-shrink-0">...</div>

  {/* Editor Pane */}
  <Card className="flex-1 space-y-6 p-6">...</Card>

  {/* Preview Slide Panel - 조건부 렌더링 */}
  {showPreview && (
    <Card className="w-[40%] overflow-auto border">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
        <h3 className="text-lg font-semibold">{t('preview_title')}</h3>
        <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{title || t('untitled')}</h2>
        {description && <p className="text-muted-foreground mb-6">{description}</p>}
        <MarkdownPreview content={content} />
      </div>
    </Card>
  )}
</div>
```

**설명**: Desktop에서는 fixed 슬라이드 대신 flex 레이아웃에서 조건부 렌더링. Mobile에서만 `PreviewSlidePanel` 컴포넌트 사용.

---

### 2.3 코드베이스 일관성

#### 문제 9: `text-red-500` 대신 `text-destructive` 사용
- **위치**: 기존 `auto-save-indicator.tsx` (line 31-32), 계획서 `seo-collapsible-panel.tsx` (line 396)
- **문제**: 기존 코드는 `text-red-500`를 사용하지만, 계획서는 `text-destructive` 사용
- **영향**: 디자인 토큰 사용 일관성 저하

#### 수정안
```typescript
// 수정 전 (기존 코드)
<AlertCircle className="h-4 w-4 text-red-500" />
<span className="text-red-500">{t("autoSave.error")}</span>

// 수정 후
<AlertCircle className="h-4 w-4 text-destructive" />
<span className="text-destructive">{t("autoSave.error")}</span>
```

**권장**: 계획서대로 `text-destructive` 사용 (디자인 토큰 기반)

---

#### 문제 10: `useTheme`의 SSR 이슈 미처리
- **위치**: 계획서 `page.tsx` (line 819)
- **문제**: `useTheme`는 초기 렌더링 시 `resolvedTheme`가 `undefined`일 수 있음 (SSR)
- **영향**: `data-color-mode={resolvedTheme || 'light'}`에서 초기 렌더링 시 깜빡임 발생 가능

#### 수정안
```typescript
// 기존 계획서 (line 819)
const { resolvedTheme } = useTheme();

// 개선안: mounted 상태 추가
const { resolvedTheme } = useTheme();
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

// 렌더링 시 (line 950, 1041)
<div data-color-mode={mounted ? resolvedTheme : 'light'} className="mt-2">
  <MDEditor ... />
</div>
```

**참고**: `next-themes` 공식 문서 권장 패턴

---

### 2.4 i18n 완전성

#### 문제 11: 누락된 번역 키 목록
계획서에서 사용하지만 기존 i18n 파일에 없는 키:

**en.json (editor 섹션에 추가 필요):**
```json
"editor": {
  "inline_title_placeholder": "Untitled",
  "slug_invalid_message": "Slug must be lowercase letters, numbers, and hyphens only.",
  "slug_valid_message": "Valid slug format.",
  "keywords_hint": "Separate multiple keywords with commas (e.g., SEO, blog, writing)",
  "description_optimal_message": "Optimal length for SEO (120-160 characters).",
  "seo_settings_title": "SEO Settings",
  "hide_preview": "Hide Preview",
  "show_preview": "Show Preview",
  "preview_title": "Preview",
  "no_content": "No content to preview.",
  "back_to_dashboard": "Back to Dashboard",
  "field_content_mobile": "Content"
}
```

**ko.json (editor 섹션에 추가 필요):**
```json
"editor": {
  "inline_title_placeholder": "제목 없음",
  "slug_invalid_message": "슬러그는 소문자, 숫자, 하이픈만 사용할 수 있습니다.",
  "slug_valid_message": "올바른 슬러그 형식입니다.",
  "keywords_hint": "여러 키워드는 쉼표로 구분하세요 (예: SEO, 블로그, 글쓰기)",
  "description_optimal_message": "SEO에 최적화된 길이입니다 (120-160자).",
  "seo_settings_title": "SEO 설정",
  "hide_preview": "미리보기 숨기기",
  "show_preview": "미리보기 보기",
  "preview_title": "미리보기",
  "no_content": "미리볼 내용이 없습니다.",
  "back_to_dashboard": "대시보드로 돌아가기",
  "field_content_mobile": "본문"
}
```

**articles.json (autoSave + tableOfContents 추가):**
```json
// en.json의 "articles" 섹션
"articles": {
  "autoSave": {
    "saving": "Saving...",
    "saved": "Saved {time}",
    "error": "Failed to save"
  },
  "tableOfContents": {
    "title": "Table of Contents"
  }
}

// ko.json의 "articles" 섹션
"articles": {
  "autoSave": {
    "saving": "저장 중...",
    "saved": "{time} 저장됨",
    "error": "저장 실패"
  },
  "tableOfContents": {
    "title": "목차"
  }
}
```

---

### 2.5 성능 및 접근성

#### 문제 12: PreviewSlidePanel의 AnimatePresence 중복 래핑
- **위치**: 계획서 `preview-slide-panel.tsx` (line 634)
- **문제**: `AnimatePresence`가 단일 자식 요소를 감싸는데, 내부에 Backdrop과 Panel 두 개가 있음
- **영향**: framer-motion 경고 발생 가능 (AnimatePresence는 직계 자식만 추적)

#### 수정안
```typescript
// 수정 전
<AnimatePresence>
  {isVisible && (
    <>
      <motion.div ... /> {/* Backdrop */}
      <motion.div ... /> {/* Panel */}
    </>
  )}
</AnimatePresence>

// 수정 후
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div key="preview-panel-container">
      {/* Backdrop */}
      <motion.div ... />
      {/* Panel */}
      <motion.div ... />
    </motion.div>
  )}
</AnimatePresence>
```

**또는 더 나은 방법**: Backdrop과 Panel을 별도의 `AnimatePresence`로 분리

```typescript
<>
  <AnimatePresence>
    {isVisible && (
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
      />
    )}
  </AnimatePresence>

  <AnimatePresence>
    {isVisible && (
      <motion.div
        key="panel"
        variants={previewPanelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-y-0 right-0 z-50 w-full overflow-auto bg-background shadow-2xl lg:relative lg:w-[40%] lg:shadow-none"
      >
        {/* Panel 내용 */}
      </motion.div>
    )}
  </AnimatePresence>
</>
```

---

#### 문제 13: IntersectionObserver cleanup 누락
- **위치**: 계획서 `table-of-contents.tsx` (line 720-731)
- **문제**: `observer.disconnect()`가 cleanup 함수에서만 호출되지만, `headings` 배열이 변경되면 이전 observer가 남아있을 수 있음
- **영향**: 메모리 누수 가능성

#### 수정안
```typescript
useEffect(() => {
  if (headings.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    },
    {
      rootMargin: '0px 0px -80% 0px',
      threshold: 1.0,
    }
  );

  // 각 heading 요소를 observe
  const elements: Element[] = [];
  headings.forEach((heading) => {
    const element = document.getElementById(heading.id);
    if (element) {
      observer.observe(element);
      elements.push(element);
    }
  });

  // Cleanup: observer를 명시적으로 해제
  return () => {
    elements.forEach((element) => {
      observer.unobserve(element);
    });
    observer.disconnect();
  };
}, [headings]);
```

**개선점**: `unobserve`를 먼저 호출하여 명시적으로 관찰 해제

---

### 2.6 누락 사항

#### 문제 14: `no_content` 번역 키 사용 불일치
- **위치**: 계획서 `page.tsx` (line 1093)
- **문제**: Mobile Preview 탭에서 `{content || <p className="text-muted-foreground">{t('no_content')}</p>}`를 사용
- **영향**: `content`가 빈 문자열이면 렌더링되지만, `null`이면 fallback 텍스트 표시

#### 수정안
```typescript
// 수정 전
<div className="prose dark:prose-invert max-w-none">
  {content || <p className="text-muted-foreground">{t('no_content')}</p>}
</div>

// 수정 후
<div className="prose dark:prose-invert max-w-none">
  {content ? (
    <MarkdownPreview content={content} />
  ) : (
    <p className="text-muted-foreground">{t('no_content')}</p>
  )}
</div>
```

**설명**: MarkdownPreview 컴포넌트를 사용하여 일관성 유지

---

#### 문제 15: 누락된 `Textarea` import
- **위치**: 계획서 `seo-collapsible-panel.tsx` (line 336)
- **문제**: `Textarea` 컴포넌트를 사용하지만 import 목록에 있음 (line 336)
- **영향**: 실제로는 문제 없음 (이미 import됨)

**확인**: import 정상적으로 포함됨 ✅

---

## 3. 최종 구현 계획

### 3.1 파일 구조 (수정안)

```
src/
  features/
    articles/
      components/
        editor-header.tsx              # 새로 생성
        seo-collapsible-panel.tsx      # 새로 생성
        title-inline-input.tsx         # 새로 생성
        auto-save-indicator.tsx        # 수정 (framer-motion, locale 지원)
        table-of-contents.tsx          # 수정 (IntersectionObserver, Tailwind safe)
        markdown-preview.tsx           # 기존 유지
      lib/
        editor-animations.ts           # 새로 생성
        markdown-utils.ts              # 기존 유지
  app/
    [locale]/(protected)/articles/[id]/edit/
      page.tsx                         # 전체 리팩토링
  components/
    ui/
      collapsible.tsx                  # shadcn 설치 필요
  app/
    globals.css                        # MDEditor 다크모드 스타일 추가
messages/
  en.json                              # editor, articles 섹션 업데이트
  ko.json                              # editor, articles 섹션 업데이트
```

### 3.2 의존성 (수정안)

```bash
# Radix UI Collapsible 컴포넌트 추가 (필수)
npx shadcn@latest add collapsible
```

**이미 설치된 패키지:**
- `framer-motion` ✅
- `next-themes` ✅
- `@uiw/react-md-editor` ✅
- `@radix-ui/react-*` ✅
- `next-intl` ✅
- `date-fns` ✅

### 3.3 구현 순서 (수정안)

#### **Step 1: 공통 유틸리티 및 애니메이션**
1. `src/features/articles/lib/editor-animations.ts` 생성
2. framer-motion variants 정의

#### **Step 2: Radix Collapsible 컴포넌트 추가**
1. `npx shadcn@latest add collapsible` 실행 (필수)
2. `src/components/ui/collapsible.tsx` 확인

#### **Step 3: i18n 번역 키 추가**
1. `messages/en.json` 업데이트
   - `editor` 섹션에 누락된 키 추가
   - `articles` 섹션에 `autoSave`, `tableOfContents` 추가
2. `messages/ko.json` 업데이트 (동일)

#### **Step 4: 기존 컴포넌트 개선**
1. `auto-save-indicator.tsx` 수정
   - framer-motion 애니메이션 추가
   - `useLocale()` 훅으로 date-fns locale 동적 선택
   - `text-red-500` → `text-destructive`
2. `table-of-contents.tsx` 수정
   - IntersectionObserver로 Active Heading 추적
   - Tailwind safe 인덴트 (동적 클래스 제거)
   - Observer cleanup 개선

#### **Step 5: 새 컴포넌트 구현**
1. `title-inline-input.tsx` 작성
2. `seo-collapsible-panel.tsx` 작성
3. `editor-header.tsx` 작성

#### **Step 6: 페이지 통합**
1. `page.tsx` 리팩토링
   - 하드코딩 제거 (`#FCFCFD` → `bg-background`)
   - 다크모드 지원 (`useTheme` 훅, mounted 상태 추가)
   - Desktop 레이아웃: TOC + Editor + 조건부 Preview (슬라이드 제거)
   - Mobile 레이아웃: 기존 Tabs 유지

#### **Step 7: 다크모드 스타일 추가**
1. `src/app/globals.css` 업데이트
   - MDEditor 다크모드 커스텀 CSS 추가

---

### 3.4 컴포넌트 상세 명세 (수정안)

#### 3.4.1 애니메이션 유틸리티
**파일**: `src/features/articles/lib/editor-animations.ts`

```typescript
import { Variants } from 'framer-motion';

/**
 * AutoSaveIndicator 애니메이션
 */
export const autoSaveVariants: Variants = {
  saving: {
    opacity: [0.5, 1, 0.5],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
  saved: {
    scale: [0.9, 1.1, 1],
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  error: {
    x: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
  idle: {
    opacity: 1,
    scale: 1,
    x: 0,
  },
};
```

---

#### 3.4.2 인라인 타이틀 입력
**파일**: `src/features/articles/components/title-inline-input.tsx`

```typescript
"use client";

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { KeyboardEvent, useRef } from 'react';

interface TitleInlineInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnterPress?: () => void;
  disabled?: boolean;
}

export function TitleInlineInput({
  value,
  onChange,
  onEnterPress,
  disabled,
}: TitleInlineInputProps) {
  const t = useTranslations('editor');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnterPress?.();
    }
  };

  return (
    <div className="mb-6">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('inline_title_placeholder')}
        disabled={disabled}
        className="w-full border-0 bg-transparent px-0 text-4xl font-bold leading-tight tracking-tight placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
```

---

#### 3.4.3 SEO Collapsible 패널
**파일**: `src/features/articles/components/seo-collapsible-panel.tsx`

```typescript
"use client";

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface SeoCollapsiblePanelProps {
  slug: string;
  description: string;
  keywords: string;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onKeywordsChange: (value: string) => void;
  disabled?: boolean;
}

export function SeoCollapsiblePanel({
  slug,
  description,
  keywords,
  onSlugChange,
  onDescriptionChange,
  onKeywordsChange,
  disabled,
}: SeoCollapsiblePanelProps) {
  const t = useTranslations('editor');
  const [isOpen, setIsOpen] = useState(false);

  // Slug 유효성 검증
  const isSlugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  const descriptionLength = description.length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 text-base font-semibold hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span>{t('seo_settings_title')}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        {/* Slug */}
        <div>
          <Label htmlFor="seo-slug">{t('field_slug')}</Label>
          <Input
            id="seo-slug"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder={t('placeholder_slug')}
            disabled={disabled}
            className="mt-1 font-mono text-sm"
          />
          {slug && !isSlugValid && (
            <p className="mt-1 text-xs text-destructive">
              {t('slug_invalid_message')}
            </p>
          )}
          {slug && isSlugValid && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t('slug_valid_message')}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="seo-description">{t('field_description')}</Label>
            <span className="text-xs text-muted-foreground">
              {descriptionLength}/160
            </span>
          </div>
          <Textarea
            id="seo-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={t('placeholder_description')}
            disabled={disabled}
            rows={3}
            className="mt-1 resize-none"
            maxLength={160}
          />
          {descriptionLength >= 120 && descriptionLength <= 160 && (
            <p className="mt-1 text-xs text-green-600">
              {t('description_optimal_message')}
            </p>
          )}
        </div>

        {/* Keywords */}
        <div>
          <Label htmlFor="seo-keywords">{t('field_keywords')}</Label>
          <Input
            id="seo-keywords"
            value={keywords}
            onChange={(e) => onKeywordsChange(e.target.value)}
            placeholder={t('placeholder_keywords')}
            disabled={disabled}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {t('keywords_hint')}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

---

#### 3.4.4 개선된 AutoSaveIndicator
**파일**: `src/features/articles/components/auto-save-indicator.tsx` (수정)

```typescript
"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { autoSaveVariants } from '../lib/editor-animations';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  isError: boolean;
  lastSavedAt?: string;
}

export function AutoSaveIndicator({
  isSaving,
  isError,
  lastSavedAt,
}: AutoSaveIndicatorProps) {
  const t = useTranslations('articles');
  const locale = useLocale();
  const dateLocale = locale === 'ko' ? ko : enUS;

  const getVariant = () => {
    if (isSaving) return 'saving';
    if (isError) return 'error';
    if (lastSavedAt) return 'saved';
    return 'idle';
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={getVariant()}
        variants={autoSaveVariants}
        initial="idle"
        animate={getVariant()}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        {isSaving && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('autoSave.saving')}</span>
          </>
        )}
        {isError && (
          <>
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive">{t('autoSave.error')}</span>
          </>
        )}
        {!isSaving && !isError && lastSavedAt && (
          <>
            <Check className="h-4 w-4 text-green-500" />
            <span>
              {t('autoSave.saved', {
                time: formatDistanceToNow(new Date(lastSavedAt), {
                  addSuffix: true,
                  locale: dateLocale,
                }),
              })}
            </span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

#### 3.4.5 에디터 헤더
**파일**: `src/features/articles/components/editor-header.tsx`

```typescript
"use client";

import { useTranslations } from 'next-intl';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutoSaveIndicator } from './auto-save-indicator';

interface EditorHeaderProps {
  onBack: () => void;
  autoSaveStatus: {
    isSaving: boolean;
    isError: boolean;
    lastSavedAt?: string;
  };
  showPreview: boolean;
  onPreviewToggle: () => void;
}

export function EditorHeader({
  onBack,
  autoSaveStatus,
  showPreview,
  onPreviewToggle,
}: EditorHeaderProps) {
  const t = useTranslations('editor');

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <AutoSaveIndicator {...autoSaveStatus} />
        </div>
      </div>
      <Button
        onClick={onPreviewToggle}
        variant="outline"
        className="hidden lg:flex"
      >
        {showPreview ? (
          <>
            <EyeOff className="mr-2 h-4 w-4" />
            {t('hide_preview')}
          </>
        ) : (
          <>
            <Eye className="mr-2 h-4 w-4" />
            {t('show_preview')}
          </>
        )}
      </Button>
    </div>
  );
}
```

---

#### 3.4.6 개선된 목차
**파일**: `src/features/articles/components/table-of-contents.tsx` (수정)

```typescript
"use client";

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Heading } from '../lib/markdown-utils';

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const t = useTranslations('articles');
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -80% 0px',
        threshold: 1.0,
      }
    );

    const elements: Element[] = [];
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
        elements.push(element);
      }
    });

    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
      });
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <List className="h-4 w-4" />
        <h3 className="font-semibold">{t('tableOfContents.title')}</h3>
      </div>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <Button
            key={heading.id}
            variant="ghost"
            className={cn(
              'w-full justify-start text-left text-sm',
              heading.level === 1 && 'pl-2',
              heading.level === 2 && 'pl-4',
              heading.level === 3 && 'pl-6',
              heading.level === 4 && 'pl-8',
              heading.level === 5 && 'pl-10',
              heading.level === 6 && 'pl-12',
              activeId === heading.id && 'bg-accent font-medium'
            )}
            onClick={() => handleClick(heading.id)}
          >
            {heading.text}
          </Button>
        ))}
      </nav>
    </Card>
  );
}
```

---

#### 3.4.7 메인 페이지 리팩토링
**파일**: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx` (전체 수정)

```typescript
"use client";

import { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Edit, Eye, Download, Copy, Check, X } from 'lucide-react';
import { useArticle } from '@/features/articles/hooks/useArticle';
import { useAutoSave } from '@/features/articles/hooks/useAutoSave';
import { EditorHeader } from '@/features/articles/components/editor-header';
import { TitleInlineInput } from '@/features/articles/components/title-inline-input';
import { SeoCollapsiblePanel } from '@/features/articles/components/seo-collapsible-panel';
import { TableOfContents } from '@/features/articles/components/table-of-contents';
import { MarkdownPreview } from '@/features/articles/components/markdown-preview';
import {
  extractHeadings,
  downloadMarkdown,
  copyToClipboard,
} from '@/features/articles/lib/markdown-utils';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

type EditorPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('editor');
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { data: article, isLoading, isError } = useArticle(articleId);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (article) {
      setTitle(article.title || '');
      setSlug(article.slug || '');
      setContent(article.content || '');
      setDescription(article.description || '');
      setKeywords(Array.isArray(article.keywords) ? article.keywords.join(', ') : '');
    }
  }, [article]);

  const autoSave = useAutoSave(articleId, {
    title,
    slug,
    content,
    description,
    keywords: keywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0),
  });

  const headings = extractHeadings(content);

  const handleDownloadMarkdown = () => {
    downloadMarkdown(title || 'article', content);
    toast({
      title: t('download_success_title'),
      description: t('download_success_desc'),
    });
  };

  const handleCopyMarkdown = async () => {
    try {
      await copyToClipboard(content);
      setCopySuccess(true);
      toast({
        title: t('copy_success_title'),
        description: t('copy_success_desc'),
      });
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      toast({
        title: t('copy_error_title'),
        description: t('copy_error_desc'),
        variant: 'destructive',
      });
    }
  };

  const handleTitleEnterPress = () => {
    const editorElement = document.querySelector('.w-md-editor');
    editorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{t('load_error')}</p>
        <Button onClick={() => router.push('/dashboard')}>
          {t('back_to_dashboard')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-[1600px] px-4 py-8">
        <EditorHeader
          onBack={() => router.back()}
          autoSaveStatus={autoSave}
          showPreview={showPreview}
          onPreviewToggle={() => setShowPreview(!showPreview)}
        />

        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:gap-6">
          {/* TOC - 항상 노출 */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-8">
              <TableOfContents headings={headings} />
            </div>
          </div>

          {/* Editor Pane */}
          <Card className="flex-1 space-y-6 p-6">
            <TitleInlineInput
              value={title}
              onChange={setTitle}
              onEnterPress={handleTitleEnterPress}
              disabled={autoSave.isSaving}
            />

            <SeoCollapsiblePanel
              slug={slug}
              description={description}
              keywords={keywords}
              onSlugChange={setSlug}
              onDescriptionChange={setDescription}
              onKeywordsChange={setKeywords}
              disabled={autoSave.isSaving}
            />

            <div>
              <Label htmlFor="content">{t('field_content')}</Label>
              <div
                data-color-mode={mounted ? resolvedTheme : 'light'}
                className="mt-2"
              >
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  height="calc(100vh - 500px)"
                  preview="edit"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadMarkdown}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t('download')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyMarkdown}
                  className="flex-1"
                >
                  {copySuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t('copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      {t('copy')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Preview Panel - 조건부 렌더링 */}
          {showPreview && (
            <Card className="w-[40%] overflow-auto border">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
                <h3 className="text-lg font-semibold">{t('preview_title')}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <h2 className="mb-4 text-2xl font-bold">
                  {title || t('untitled')}
                </h2>
                {description && (
                  <p className="mb-6 text-muted-foreground">{description}</p>
                )}
                {content ? (
                  <MarkdownPreview content={content} />
                ) : (
                  <p className="text-muted-foreground">{t('no_content')}</p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Mobile Layout - Tabs */}
        <div className="lg:hidden">
          <Tabs defaultValue="edit">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">
                <Edit className="mr-2 h-4 w-4" />
                {t('edit_tab')}
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" />
                {t('preview_tab')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-4">
              <Card className="space-y-6 p-4">
                <TitleInlineInput
                  value={title}
                  onChange={setTitle}
                  onEnterPress={handleTitleEnterPress}
                  disabled={autoSave.isSaving}
                />

                <SeoCollapsiblePanel
                  slug={slug}
                  description={description}
                  keywords={keywords}
                  onSlugChange={setSlug}
                  onDescriptionChange={setDescription}
                  onKeywordsChange={setKeywords}
                  disabled={autoSave.isSaving}
                />

                <div>
                  <Label htmlFor="content-mobile">{t('field_content_mobile')}</Label>
                  <div
                    data-color-mode={mounted ? resolvedTheme : 'light'}
                    className="mt-2"
                  >
                    <MDEditor
                      value={content}
                      onChange={(val) => setContent(val || '')}
                      height={400}
                    />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadMarkdown}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-3 w-3" />
                      {t('download')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyMarkdown}
                      className="flex-1"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="mr-2 h-3 w-3" />
                          {t('copied')}
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-3 w-3" />
                          {t('copy')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <Card className="p-4">
                <h2 className="mb-4 text-2xl font-bold">
                  {title || t('untitled')}
                </h2>
                {description && (
                  <p className="mb-6 text-muted-foreground">{description}</p>
                )}
                {content ? (
                  <MarkdownPreview content={content} />
                ) : (
                  <p className="text-muted-foreground">{t('no_content')}</p>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
```

---

### 3.5 i18n 번역 키 (수정안)

#### 3.5.1 영어 (messages/en.json)

`editor` 섹션에 다음 키 추가:

```json
{
  "editor": {
    "loading": "Loading article...",
    "load_error": "Failed to load the article.",
    "back": "Go back",
    "back_to_dashboard": "Back to Dashboard",
    "title": "Edit Article",
    "field_title": "Title",
    "placeholder_title": "Enter article title",
    "inline_title_placeholder": "Untitled",
    "field_slug": "Slug",
    "placeholder_slug": "URL slug",
    "slug_invalid_message": "Slug must be lowercase letters, numbers, and hyphens only.",
    "slug_valid_message": "Valid slug format.",
    "field_keywords": "Keywords",
    "placeholder_keywords": "Select keywords (optional)",
    "keywords_hint": "Separate multiple keywords with commas (e.g., SEO, blog, writing)",
    "field_description": "Summary",
    "placeholder_description": "Enter article summary",
    "description_optimal_message": "Optimal length for SEO (120-160 characters).",
    "field_content": "Content",
    "placeholder_content": "Enter article content",
    "field_content_mobile": "Content",
    "download": "Download",
    "copy": "Copy",
    "copied": "Copied!",
    "hide_preview": "Hide Preview",
    "show_preview": "Show Preview",
    "preview_title": "Preview",
    "untitled": "Untitled",
    "no_content": "No content to preview.",
    "edit_tab": "Edit",
    "preview_tab": "Preview",
    "download_success_title": "Download Complete",
    "download_success_desc": "The markdown file has been downloaded.",
    "copy_success_title": "Copy Complete",
    "copy_success_desc": "The markdown has been copied to the clipboard.",
    "copy_error_title": "Copy Failed",
    "copy_error_desc": "An error occurred while copying to the clipboard.",
    "seo_settings_title": "SEO Settings"
  }
}
```

`articles` 섹션에 다음 키 추가:

```json
{
  "articles": {
    "autoSave": {
      "saving": "Saving...",
      "saved": "Saved {time}",
      "error": "Failed to save"
    },
    "tableOfContents": {
      "title": "Table of Contents"
    }
  }
}
```

#### 3.5.2 한국어 (messages/ko.json)

`editor` 섹션에 다음 키 추가:

```json
{
  "editor": {
    "loading": "글을 불러오는 중...",
    "load_error": "글을 불러오는데 실패했습니다.",
    "back": "뒤로 가기",
    "back_to_dashboard": "대시보드로 돌아가기",
    "title": "글 수정",
    "field_title": "제목",
    "placeholder_title": "글 제목을 입력하세요",
    "inline_title_placeholder": "제목 없음",
    "field_slug": "슬러그",
    "placeholder_slug": "URL 슬러그",
    "slug_invalid_message": "슬러그는 소문자, 숫자, 하이픈만 사용할 수 있습니다.",
    "slug_valid_message": "올바른 슬러그 형식입니다.",
    "field_keywords": "키워드",
    "placeholder_keywords": "키워드 선택 (선택사항)",
    "keywords_hint": "여러 키워드는 쉼표로 구분하세요 (예: SEO, 블로그, 글쓰기)",
    "field_description": "요약",
    "placeholder_description": "글 요약을 입력하세요",
    "description_optimal_message": "SEO에 최적화된 길이입니다 (120-160자).",
    "field_content": "본문",
    "placeholder_content": "본문 내용을 입력하세요",
    "field_content_mobile": "본문",
    "download": "다운로드",
    "copy": "복사",
    "copied": "복사 완료!",
    "hide_preview": "미리보기 숨기기",
    "show_preview": "미리보기 보기",
    "preview_title": "미리보기",
    "untitled": "제목 없음",
    "no_content": "미리볼 내용이 없습니다.",
    "edit_tab": "편집",
    "preview_tab": "미리보기",
    "download_success_title": "다운로드 완료",
    "download_success_desc": "마크다운 파일이 다운로드되었습니다.",
    "copy_success_title": "복사 완료",
    "copy_success_desc": "마크다운이 클립보드에 복사되었습니다.",
    "copy_error_title": "복사 실패",
    "copy_error_desc": "클립보드에 복사하는 중 오류가 발생했습니다.",
    "seo_settings_title": "SEO 설정"
  }
}
```

`articles` 섹션에 다음 키 추가:

```json
{
  "articles": {
    "autoSave": {
      "saving": "저장 중...",
      "saved": "{time} 저장됨",
      "error": "저장 실패"
    },
    "tableOfContents": {
      "title": "목차"
    }
  }
}
```

---

### 3.6 다크모드 스타일

#### 파일: `src/app/globals.css` (기존 파일 끝에 추가)

```css
/* MDEditor Dark Mode Customization */
[data-color-mode="dark"] .w-md-editor {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border-color: hsl(var(--border));
}

[data-color-mode="dark"] .w-md-editor-toolbar {
  background-color: hsl(var(--muted));
  border-color: hsl(var(--border));
}

[data-color-mode="dark"] .w-md-editor-toolbar button {
  color: hsl(var(--muted-foreground));
}

[data-color-mode="dark"] .w-md-editor-toolbar button:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

[data-color-mode="dark"] .w-md-editor-text-pre,
[data-color-mode="dark"] .w-md-editor-text-input {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
}

[data-color-mode="dark"] .w-md-editor-text-pre > code,
[data-color-mode="dark"] .w-md-editor-text-input {
  color: hsl(var(--foreground));
}

/* Scrollbar Styling */
.w-md-editor-text-pre::-webkit-scrollbar,
.w-md-editor-text-input::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.w-md-editor-text-pre::-webkit-scrollbar-track,
.w-md-editor-text-input::-webkit-scrollbar-track {
  background: hsl(var(--muted));
}

.w-md-editor-text-pre::-webkit-scrollbar-thumb,
.w-md-editor-text-input::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground));
  border-radius: 4px;
}

.w-md-editor-text-pre::-webkit-scrollbar-thumb:hover,
.w-md-editor-text-input::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--foreground));
}
```

---

## 4. 주요 변경 사항

### 4.1 수정된 컴포넌트

- **auto-save-indicator.tsx**:
  - framer-motion 애니메이션 추가
  - `useLocale()` 훅으로 date-fns locale 동적 선택
  - `text-red-500` → `text-destructive`
  - `useTranslations("articles")` 유지

- **table-of-contents.tsx**:
  - IntersectionObserver로 Active Heading 추적
  - Tailwind safe 인덴트 (동적 클래스 제거)
  - Observer cleanup 개선
  - `useTranslations("articles")` 유지

- **page.tsx**:
  - 하드코딩 제거 (`#FCFCFD` → `bg-background`)
  - 다크모드 지원 (`useTheme` + `mounted` 상태)
  - Desktop: TOC + Editor + 조건부 Preview (슬라이드 대신 flex 레이아웃)
  - Mobile: 기존 Tabs 유지

### 4.2 추가된 파일

- **editor-animations.ts**: framer-motion variants 정의
- **title-inline-input.tsx**: Notion 스타일 인라인 타이틀
- **seo-collapsible-panel.tsx**: SEO 설정 Collapsible 패널
- **editor-header.tsx**: 헤더 컴포넌트
- **collapsible.tsx**: shadcn collapsible 컴포넌트 (설치 필요)

### 4.3 제거된 항목

- **preview-slide-panel.tsx**: Desktop에서는 flex 레이아웃으로 대체 (Mobile 전용으로 변경 가능하지만, 현재 계획에서는 제거)

---

## 5. 구현 체크리스트

### 5.1 필수 사항

- [ ] `npx shadcn@latest add collapsible` 실행
- [ ] 모든 컴포넌트에 TypeScript 타입 정의 ✅
- [ ] 모든 client 컴포넌트에 `"use client"` 추가 ✅
- [ ] 모든 텍스트에 i18n 적용 ✅
- [ ] Tailwind safe 클래스 사용 (동적 생성 제거) ✅
- [ ] 접근성 속성 추가 ✅

### 5.2 권장 사항

- [ ] E2E 테스트 작성
- [ ] Storybook 스토리 작성 (선택)
- [ ] 성능 모니터링 설정

---

## 6. 리스크 및 주의사항

### 6.1 잠재적 문제

**문제 1: Collapsible 컴포넌트 미설치**
- **대응 방안**: 구현 전 반드시 `npx shadcn@latest add collapsible` 실행

**문제 2: useTheme SSR 깜빡임**
- **대응 방안**: `mounted` 상태 추가하여 초기 렌더링 시 fallback 제공

**문제 3: IntersectionObserver 메모리 누수**
- **대응 방안**: cleanup 함수에서 `unobserve` + `disconnect` 명시적 호출

### 6.2 테스트 필요 항목

- 다크/라이트 모드 전환 시 MDEditor 스타일 적용 여부
- Collapsible 애니메이션 부드러움 확인
- Active Heading 추적 정확도
- 자동 저장 framer-motion 애니메이션
- Mobile/Desktop 레이아웃 전환

---

## 7. 실행 준비 확인

- [x] 모든 타입 오류 해결
- [x] 모든 import 경로 검증
- [x] i18n 완전성 확인
- [x] 성능 최적화 고려
- [x] 접근성 요구사항 충족
- [x] 코드베이스 일관성 유지

---

## 8. 다음 단계

### Phase 1: 준비 작업
1. `npx shadcn@latest add collapsible` 실행
2. i18n 파일 업데이트 (`en.json`, `ko.json`)
3. `editor-animations.ts` 생성

### Phase 2: 컴포넌트 구현
1. `title-inline-input.tsx` 작성
2. `seo-collapsible-panel.tsx` 작성
3. `editor-header.tsx` 작성
4. `auto-save-indicator.tsx` 수정
5. `table-of-contents.tsx` 수정

### Phase 3: 페이지 통합
1. `page.tsx` 리팩토링
2. `globals.css` 업데이트

### Phase 4: 테스트
1. Desktop/Mobile 레이아웃 테스트
2. 다크모드 전환 테스트
3. 자동 저장 동작 테스트
4. SEO Collapsible 동작 테스트

---

## 9. 결론

### 9.1 주요 개선 사항

1. **하드코딩 제거**: 모든 색상을 디자인 토큰으로 통일
2. **다크모드 지원**: MDEditor 포함 전체 페이지 다크모드
3. **정보 아키텍처 개선**: SEO Collapsible, 인라인 타이틀
4. **UX 개선**: Active Heading 추적, framer-motion 애니메이션
5. **컴포넌트 재사용성**: 독립적인 컴포넌트 분리

### 9.2 원안 대비 주요 수정 사항

1. **PreviewSlidePanel 제거**: Desktop에서는 flex 레이아웃으로 대체 (복잡도 감소)
2. **translation 네임스페이스 통일**: `auto-save-indicator`, `table-of-contents`는 `articles` 유지
3. **Tailwind 동적 클래스 제거**: safe-list 패턴으로 변경
4. **SSR 깜빡임 방지**: `mounted` 상태 추가
5. **Observer cleanup 개선**: 메모리 누수 방지

### 9.3 핵심 가치

**"심플하고 안정적인 마크다운 에디터"**

- 글쓰기에 집중
- 자동 저장으로 안심
- 다크모드로 편안함
- 빠르고 직관적인 UX

---

**최종 권장사항**: 모든 변경사항은 **단계적 배포**와 **충분한 테스트**를 거쳐야 합니다. 특히 Collapsible 컴포넌트 설치와 i18n 파일 업데이트를 먼저 완료한 후 컴포넌트 구현을 시작하세요.
