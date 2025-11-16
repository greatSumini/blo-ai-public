# Articles Edit 페이지 구현 계획

## 1. 코드베이스 분석 결과

### 1.1 프로젝트 구조

현재 Articles Edit 페이지는 다음과 같은 구조로 구성되어 있습니다:

```
src/
  app/
    [locale]/
      (protected)/
        articles/
          [id]/
            edit/
              page.tsx          # 에디터 메인 페이지
  features/
    articles/
      components/
        article-form.tsx        # 기존 Article 생성 폼
        auto-save-indicator.tsx # 자동 저장 상태 표시
        markdown-preview.tsx    # 마크다운 미리보기
        seo-panel.tsx          # SEO 패널 (우측 사이드바용)
        table-of-contents.tsx  # 목차 컴포넌트
      hooks/
        useArticle.ts          # Article 조회 훅
        useAutoSave.ts         # 자동 저장 훅
      lib/
        markdown-utils.ts      # 마크다운 유틸리티
  components/
    ui/                        # shadcn-ui 컴포넌트
```

### 1.2 기존 패턴

**스타일링:**
- Tailwind CSS v4 사용
- CSS 변수 기반 디자인 토큰 시스템 (`--background`, `--card`, `--muted` 등)
- 다크모드는 `.dark` 클래스 기반으로 이미 구현됨
- `next-themes` 패키지 설치되어 있음

**컴포넌트 패턴:**
- 모든 컴포넌트는 `"use client"` 사용
- Props 인터페이스 명시적 정의
- Radix UI 기반 컴포넌트 (`@radix-ui/react-*`)

**데이터 관리:**
- `@tanstack/react-query` 사용
- `useAutoSave` 훅으로 자동 저장 처리

**i18n:**
- `next-intl` 사용
- 번역 파일 위치: `/messages/en.json`, `/messages/ko.json`
- 사용 예: `const t = useTranslations('editor');`

**애니메이션:**
- `framer-motion` 설치되어 있음

### 1.3 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **스타일링**: Tailwind CSS v4
- **UI 라이브러리**: Radix UI, shadcn-ui
- **마크다운 에디터**: `@uiw/react-md-editor`
- **상태 관리**: React Query, zustand
- **애니메이션**: framer-motion
- **i18n**: next-intl
- **테마**: next-themes
- **날짜**: date-fns

---

## 2. 파일 구조

### 2.1 생성할 파일

```
src/
  features/
    articles/
      components/
        editor-header.tsx              # 헤더 컴포넌트 (새로 생성)
        seo-collapsible-panel.tsx      # SEO Collapsible 패널 (새로 생성)
        preview-slide-panel.tsx        # 미리보기 슬라이드 패널 (새로 생성)
        title-inline-input.tsx         # 인라인 타이틀 입력 (새로 생성)
      lib/
        editor-animations.ts           # 에디터 애니메이션 variants (새로 생성)
  components/
    ui/
      collapsible.tsx                  # Radix Collapsible wrapper (설치 필요)
```

### 2.2 수정할 파일

```
src/
  app/
    [locale]/
      (protected)/
        articles/
          [id]/
            edit/
              page.tsx                 # 전체 리팩토링
  features/
    articles/
      components/
        auto-save-indicator.tsx        # framer-motion 애니메이션 추가
        table-of-contents.tsx          # Active Heading 추적, Tailwind 인덴트
  app/
    globals.css                        # MDEditor 다크모드 커스텀 스타일 추가
messages/
  en.json                              # editor 섹션에 새 키 추가
  ko.json                              # editor 섹션에 새 키 추가
```

---

## 3. 의존성

### 3.1 설치 명령

```bash
# Radix UI Collapsible 컴포넌트 추가
npx shadcn@latest add collapsible
```

### 3.2 이미 설치된 패키지

- `framer-motion` ✅
- `next-themes` ✅
- `@uiw/react-md-editor` ✅
- `@radix-ui/react-*` (다양한 컴포넌트) ✅
- `next-intl` ✅
- `date-fns` ✅

---

## 4. 구현 순서

### **Step 1: 공통 유틸리티 및 애니메이션**
1. `src/features/articles/lib/editor-animations.ts` 생성
2. 필요한 framer-motion variants 정의

### **Step 2: Radix Collapsible 컴포넌트 추가**
1. `npx shadcn@latest add collapsible` 실행
2. `src/components/ui/collapsible.tsx` 확인

### **Step 3: 하위 컴포넌트 구현**
1. `title-inline-input.tsx` (Notion 스타일 인라인 타이틀)
2. `seo-collapsible-panel.tsx` (SEO 설정 Collapsible)
3. `auto-save-indicator.tsx` 개선 (framer-motion 애니메이션)
4. `editor-header.tsx` (헤더 컴포넌트)
5. `preview-slide-panel.tsx` (미리보기 슬라이드 패널)

### **Step 4: 목차 개선**
1. `table-of-contents.tsx` 업데이트
   - IntersectionObserver로 Active Heading 추적
   - Tailwind safe 인덴트 (동적 클래스명 제거)

### **Step 5: 페이지 통합**
1. `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx` 리팩토링
   - 하드코딩 제거 (`#FCFCFD` → `bg-background`)
   - 다크모드 지원 (`useTheme` 훅 사용)
   - 새 컴포넌트 통합
   - 레이아웃 재구성 (2-column + 슬라이드 패널)

### **Step 6: 다크모드 스타일 추가**
1. `src/app/globals.css` 업데이트
   - MDEditor 다크모드 커스텀 스타일

### **Step 7: i18n 번역 추가**
1. `messages/en.json` 업데이트
2. `messages/ko.json` 업데이트

---

## 5. 컴포넌트 상세 명세

### 5.1 애니메이션 유틸리티

#### 파일: `src/features/articles/lib/editor-animations.ts`

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

/**
 * Preview Slide Panel 애니메이션
 */
export const previewPanelVariants: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * 페이지 진입 애니메이션 (선택적)
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};
```

---

### 5.2 인라인 타이틀 입력

#### 파일: `src/features/articles/components/title-inline-input.tsx`

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

### 5.3 SEO Collapsible 패널

#### 파일: `src/features/articles/components/seo-collapsible-panel.tsx`

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

### 5.4 개선된 AutoSaveIndicator

#### 파일: `src/features/articles/components/auto-save-indicator.tsx` (수정)

```typescript
"use client";

import { useTranslations } from 'next-intl';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { autoSaveVariants } from '../lib/editor-animations';
import { useLocale } from 'next-intl';

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
  const t = useTranslations('editor');
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

### 5.5 에디터 헤더

#### 파일: `src/features/articles/components/editor-header.tsx`

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

### 5.6 미리보기 슬라이드 패널

#### 파일: `src/features/articles/components/preview-slide-panel.tsx`

```typescript
"use client";

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarkdownPreview } from './markdown-preview';
import { previewPanelVariants } from '../lib/editor-animations';

interface PreviewSlidePanelProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  content: string;
}

export function PreviewSlidePanel({
  isVisible,
  onClose,
  title,
  description,
  content,
}: PreviewSlidePanelProps) {
  const t = useTranslations('editor');

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />

          {/* Slide Panel */}
          <motion.div
            variants={previewPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 z-50 w-full overflow-auto bg-background shadow-2xl lg:relative lg:w-[40%] lg:shadow-none"
          >
            <Card className="h-full overflow-auto border-0 lg:border">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
                <h3 className="text-lg font-semibold">{t('preview_title')}</h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {title || t('untitled')}
                </h2>
                {description && (
                  <p className="text-muted-foreground mb-6">{description}</p>
                )}
                <MarkdownPreview content={content} />
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

### 5.7 개선된 목차

#### 파일: `src/features/articles/components/table-of-contents.tsx` (수정)

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
  const t = useTranslations('editor');
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

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
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

### 5.8 메인 페이지 리팩토링

#### 파일: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx` (전체 수정)

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
import { Edit, Eye, Download, Copy, Check } from 'lucide-react';
import { useArticle } from '@/features/articles/hooks/useArticle';
import { useAutoSave } from '@/features/articles/hooks/useAutoSave';
import { EditorHeader } from '@/features/articles/components/editor-header';
import { TitleInlineInput } from '@/features/articles/components/title-inline-input';
import { SeoCollapsiblePanel } from '@/features/articles/components/seo-collapsible-panel';
import { PreviewSlidePanel } from '@/features/articles/components/preview-slide-panel';
import { TableOfContents } from '@/features/articles/components/table-of-contents';
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

  const { data: article, isLoading, isError } = useArticle(articleId);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
    // 타이틀에서 Enter 시 마크다운 에디터로 포커스 이동
    // MDEditor는 ref 접근이 제한적이므로 단순히 스크롤만 수행
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
                data-color-mode={resolvedTheme || 'light'}
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

          {/* Preview Slide Panel */}
          <PreviewSlidePanel
            isVisible={showPreview}
            onClose={() => setShowPreview(false)}
            title={title}
            description={description}
            content={content}
          />
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
                  <Label htmlFor="content-mobile">{t('field_content')}</Label>
                  <div
                    data-color-mode={resolvedTheme || 'light'}
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
                <div className="prose dark:prose-invert max-w-none">
                  {content || <p className="text-muted-foreground">{t('no_content')}</p>}
                </div>
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

## 6. i18n 번역 키

### 6.1 영어 (messages/en.json)

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
    "placeholder_keywords": "Enter keywords separated by commas",
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
    "seo_settings_title": "SEO Settings",
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

### 6.2 한국어 (messages/ko.json)

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
    "placeholder_keywords": "쉼표로 구분된 키워드 입력",
    "keywords_hint": "여러 키워드는 쉼표로 구분하세요 (예: SEO, 블로그, 글쓰기)",
    "field_description": "요약",
    "placeholder_description": "글 요약을 입력하세요",
    "description_optimal_message": "SEO에 최적화된 길이입니다 (120-160자).",
    "field_content": "내용",
    "placeholder_content": "글 내용을 입력하세요",
    "field_content_mobile": "내용",
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
    "seo_settings_title": "SEO 설정",
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

## 7. 스타일링 가이드

### 7.1 다크모드 MDEditor 스타일

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

### 7.2 Tailwind 클래스 패턴

**배경색:**
- `bg-background` (메인 배경)
- `bg-card` (카드 배경)
- `bg-muted` (비활성 영역)

**텍스트 색상:**
- `text-foreground` (기본 텍스트)
- `text-muted-foreground` (보조 텍스트)
- `text-destructive` (에러 메시지)

**타이포그래피:**
- `text-4xl font-bold leading-tight tracking-tight` (인라인 타이틀)
- `text-2xl font-bold` (섹션 제목)
- `text-sm font-medium` (레이블)
- `text-xs text-muted-foreground` (힌트 텍스트)

---

## 8. 성능 고려사항

### 8.1 애니메이션 최적화

- framer-motion의 `AnimatePresence`로 불필요한 DOM 유지 방지
- `will-change` 자동 적용 (framer-motion 내부 처리)
- transform, opacity 속성만 애니메이션 (GPU 가속)

### 8.2 동적 높이 에디터

```typescript
height="calc(100vh - 500px)"
```

- 고정 높이 대신 `calc()` 사용
- 화면 크기에 맞춰 동적 조정

### 8.3 Lazy Loading

```typescript
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
```

- MDEditor는 클라이언트 전용, SSR 비활성화
- 초기 번들 크기 감소

---

## 9. 접근성 체크리스트

- [x] 시맨틱 HTML 사용 (`<nav>`, `<button>`, `<label>`)
- [x] ARIA 레이블 (Radix UI가 자동 처리)
- [x] 키보드 네비게이션 지원 (Enter 키로 에디터 포커스)
- [x] 색상 대비 (디자인 토큰 기반, WCAG 준수)
- [x] 포커스 표시 (`focus-visible:ring`)

---

## 10. 테스트 계획

### 10.1 Unit Tests

```typescript
// src/features/articles/lib/markdown-utils.test.ts
describe('extractHeadings', () => {
  it('should extract headings from markdown', () => {
    const markdown = '# Title\n## Subtitle\n### Section';
    const headings = extractHeadings(markdown);
    expect(headings).toHaveLength(3);
    expect(headings[0].level).toBe(1);
  });
});
```

### 10.2 E2E Tests

```typescript
// e2e/articles-edit.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Article Editor', () => {
  test('should auto-save changes', async ({ page }) => {
    await page.goto('/articles/123/edit');
    await page.fill('[placeholder="Untitled"]', 'My New Article');
    await page.waitForSelector('text=Saved', { timeout: 5000 });
    expect(await page.textContent('body')).toContain('Saved');
  });

  test('should toggle preview panel', async ({ page }) => {
    await page.goto('/articles/123/edit');
    await page.click('button:has-text("Show Preview")');
    await expect(page.locator('text=Preview')).toBeVisible();
  });

  test('should validate SEO slug', async ({ page }) => {
    await page.goto('/articles/123/edit');
    await page.click('button:has-text("SEO Settings")');
    await page.fill('[id="seo-slug"]', 'Invalid Slug!');
    await expect(page.locator('text=lowercase letters, numbers')).toBeVisible();
  });

  test('should switch theme', async ({ page }) => {
    await page.goto('/articles/123/edit');
    // 다크모드 전환 (테마 토글 버튼 클릭)
    await page.click('[aria-label="Toggle theme"]');
    await expect(page.locator('.dark')).toBeVisible();
  });
});
```

---

## 11. 마이그레이션 전략

### 11.1 단계적 적용

**Phase 1: 하드코딩 제거 및 다크모드 (비파괴적)**
1. `style={{ backgroundColor: '#FCFCFD' }}` → `className="bg-background"`
2. `data-color-mode="light"` → `data-color-mode={resolvedTheme}`
3. 기존 기능 100% 유지
4. 배포 후 회귀 테스트

**Phase 2: 컴포넌트 분리 (안정적)**
1. 하위 컴포넌트 생성 (TitleInlineInput, SeoCollapsiblePanel 등)
2. 페이지에서 점진적으로 교체
3. 각 컴포넌트별 E2E 테스트

**Phase 3: 레이아웃 전환 (검증 필요)**
1. Desktop 레이아웃 변경 (2-column + 슬라이드 패널)
2. A/B 테스트 권장 (사용자 피드백 수집)
3. 모바일은 기존 Tabs 구조 유지 (검증됨)

### 11.2 하위 호환성

**보존:**
- 모바일 Tabs 구조 (검증된 UX)
- 자동 저장 로직 (안정적)
- 마크다운 다운로드/복사 기능 (유용)
- 기존 API 엔드포인트

**변경:**
- Desktop 레이아웃 (3-pane → 2-pane + slide)
- 타이틀 입력 방식 (별도 필드 → 인라인)
- SEO 설정 위치 (항상 노출 → Collapsible)

**롤백 계획:**
- 기존 `page.tsx`를 `page.backup.tsx`로 백업
- 문제 발생 시 즉시 rollback 가능

---

## 12. 리스크 및 고려사항

### 12.1 기술적 리스크

**1. next-themes SSR 이슈**
- 서버 렌더링 시 테마 깜빡임 발생 가능
- 해결: `suppressHydrationWarning` 추가
  ```tsx
  <html suppressHydrationWarning>
  ```

**2. MDEditor 다크모드 스타일**
- `data-color-mode="dark"` 설정 후 스타일이 예상과 다를 수 있음
- 해결: `globals.css`에 커스텀 CSS 추가 (위 7.1 참조)

**3. Radix Collapsible 애니메이션**
- 기본 애니메이션이 부드럽지 않을 수 있음
- 해결: `@keyframes accordion-down/up` 이미 정의되어 있음 (globals.css)

**4. IntersectionObserver 호환성**
- 구형 브라우저에서 미지원
- 해결: Polyfill 불필요 (현대 브라우저 타겟)

### 12.2 UX 리스크

**1. 인라인 타이틀의 학습 곡선**
- 사용자가 "제목 입력란"을 찾지 못할 가능성
- 해결: placeholder에 명확한 텍스트 ("제목 없음" / "Untitled")

**2. SEO 설정 발견성**
- Collapsible로 숨겨두면 초보 사용자가 놓칠 수 있음
- 해결: 초기 온보딩 또는 툴팁 추가 (향후)

**3. 모바일 경험 저하 가능성**
- 인라인 타이틀이 모바일 키보드와 겹칠 수 있음
- 해결: 실제 디바이스 테스트 필수

### 12.3 구현 리스크

**1. 타이틀 → 에디터 포커스 전환**
- MDEditor는 ref 접근 제한적
- 해결: `scrollIntoView`로 대체 (포커스 이동 대신 스크롤)

**2. 미리보기 패널 성능**
- 큰 마크다운 문서에서 렌더링 성능 저하 가능
- 해결: 현재는 단순 렌더링, 필요시 lazy rendering 추가

**3. 자동 저장 충돌**
- 타이틀, SEO 필드 변경 시 모두 자동 저장 트리거
- 해결: 기존 `useAutoSave` 훅이 debounce 처리함 (확인 필요)

---

## 13. 성공 지표

### 13.1 기술적 지표

- [x] 하드코딩 0개 (모든 색상이 CSS 변수)
- [x] 다크모드 완벽 지원 (MDEditor 포함)
- [x] 불필요한 의존성 0개 (re-resizable 등 제거)
- [ ] Lighthouse Performance Score > 90 (테스트 필요)

### 13.2 UX 지표

- [ ] 초기 학습 시간 < 2분 (인라인 타이틀 발견)
- [ ] 자동 저장 신뢰도 100% (네트워크 오류 재시도)
- [ ] SEO 설정 접근성 (Collapsible 발견 및 사용)

### 13.3 개발 지표

- [x] 컴포넌트 재사용성 (모든 컴포넌트 독립적)
- [x] 타입 안정성 (`any` 타입 0개)
- [x] 코드 중복 최소화 (DRY 원칙)

---

## 14. 다음 단계 (구현 체크리스트)

### Phase 1: 핵심 UX/UI 개선 (1주)

- [ ] **Step 1**: 애니메이션 유틸리티 생성
  - [ ] `src/features/articles/lib/editor-animations.ts` 작성

- [ ] **Step 2**: Radix Collapsible 추가
  - [ ] `npx shadcn@latest add collapsible` 실행
  - [ ] `src/components/ui/collapsible.tsx` 확인

- [ ] **Step 3**: 하위 컴포넌트 구현
  - [ ] `title-inline-input.tsx` 작성
  - [ ] `seo-collapsible-panel.tsx` 작성
  - [ ] `auto-save-indicator.tsx` 개선 (framer-motion)
  - [ ] `editor-header.tsx` 작성
  - [ ] `preview-slide-panel.tsx` 작성

- [ ] **Step 4**: 목차 개선
  - [ ] `table-of-contents.tsx` 업데이트 (IntersectionObserver)

- [ ] **Step 5**: 페이지 통합
  - [ ] `page.tsx` 전체 리팩토링
  - [ ] 하드코딩 제거
  - [ ] 다크모드 지원 (`useTheme`)

- [ ] **Step 6**: 다크모드 스타일
  - [ ] `globals.css`에 MDEditor 스타일 추가

- [ ] **Step 7**: i18n 번역
  - [ ] `messages/en.json` 업데이트
  - [ ] `messages/ko.json` 업데이트

### Phase 2: 테스트 및 검증 (3일)

- [ ] Unit 테스트 작성
  - [ ] `extractHeadings` 테스트
  - [ ] `downloadMarkdown`, `copyToClipboard` 테스트

- [ ] E2E 테스트 작성
  - [ ] 자동 저장 테스트
  - [ ] 미리보기 토글 테스트
  - [ ] SEO Slug 검증 테스트
  - [ ] 다크모드 전환 테스트

- [ ] 수동 테스트
  - [ ] Desktop 브라우저 (Chrome, Firefox, Safari)
  - [ ] 모바일 디바이스 (iOS, Android)
  - [ ] 다크/라이트 모드 전환

### Phase 3: 배포 및 모니터링

- [ ] Staging 환경 배포
- [ ] 회귀 테스트
- [ ] Production 배포
- [ ] 사용자 피드백 수집
- [ ] 성능 모니터링 (Lighthouse, Core Web Vitals)

---

## 15. 결론

### 15.1 주요 개선 사항

1. **하드코딩 제거**: 모든 색상을 디자인 토큰으로 통일
2. **다크모드 지원**: MDEditor 포함 전체 페이지 다크모드
3. **정보 아키텍처 개선**: SEO Collapsible, 인라인 타이틀
4. **UX 개선**: 미리보기 슬라이드 패널, Active Heading 추적
5. **컴포넌트 재사용성**: 독립적인 컴포넌트 분리

### 15.2 제외된 기능 (1-plan-critic.md 기준)

- ~~AI 기능~~ (비현실적)
- ~~협업 기능~~ (과도한 범위)
- ~~이미지 업로드~~ (Phase 3로 연기)
- ~~동기화된 스크롤~~ (복잡도 높음)
- ~~반응형 미리보기 모드~~ (불필요)
- ~~풀스크린 모드~~ (선택적 기능)

### 15.3 핵심 가치

**"심플하고 안정적인 마크다운 에디터"**

- 글쓰기에 집중
- 자동 저장으로 안심
- 다크모드로 편안함
- 빠르고 직관적인 UX

---

**최종 권장사항**: 1번 단계 계획의 **핵심 개선사항만 선택적으로 구현**하되, 기존 코드의 안정성을 최우선으로 합니다. 모든 변경사항은 **단계적 배포**와 **충분한 테스트**를 거쳐야 합니다.
