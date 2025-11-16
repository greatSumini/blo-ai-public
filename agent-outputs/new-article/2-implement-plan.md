# New Article 페이지 구현 계획

## 1. 코드베이스 분석 결과

### 1.1 프로젝트 구조

**디렉토리 구조:**
```
src/
├── app/
│   └── [locale]/
│       └── (protected)/
│           └── new-article/
│               └── page.tsx          # 현재 New Article 페이지
├── features/
│   └── articles/
│       ├── components/
│       │   ├── generation-form.tsx   # 글 생성 폼 (존재, 개선 필요)
│       │   ├── generation-progress.tsx # 진행 상태 컴포넌트 (존재, 미사용)
│       │   ├── article-preview.tsx   # 글 미리보기 (다른 용도로 사용)
│       │   ├── markdown-preview.tsx  # 마크다운 미리보기
│       │   └── ...
│       ├── hooks/
│       │   ├── useGenerateArticle.ts
│       │   └── ...
│       └── lib/
│           ├── ai-parse.ts           # AI 응답 파싱 유틸
│           └── ...
├── components/ui/                     # shadcn-ui 컴포넌트
├── lib/i18n/messages/                 # 번역 파일 (ko.json, en.json)
└── app/globals.css                    # 전역 스타일 (Tailwind 변수 정의)
```

**현재 페이지 구성 (page.tsx):**
- **3가지 모드 상태 관리**: `form`, `generating`, `complete`
- **useCompletion 훅 사용**: AI SDK의 스트리밍 API 호출
- **인라인 UI 구현**: 각 모드별 UI가 page.tsx에 직접 구현됨
- **하드코딩된 스타일**: `style` prop으로 색상 직접 지정
- **Table 기반 메타데이터**: generating 모드에서 Table 컴포넌트 사용

### 1.2 기존 패턴

**재사용 가능한 패턴:**

1. **컴포넌트 구조:**
   - `"use client"` 디렉티브 필수
   - Props 인터페이스는 TypeScript로 명시적 정의
   - shadcn-ui 컴포넌트 적극 활용

2. **스타일링:**
   - Tailwind CSS 유틸리티 클래스 사용
   - globals.css에 정의된 CSS 변수 활용:
     - `--primary`, `--accent`, `--muted`, `--border` 등
   - 현재 하드코딩된 색상:
     - `#3BA2F8` (파란색, accent로 변경 필요)
     - `#6B7280` (회색, muted-foreground로 변경 필요)
     - `#E1E5EA` (연한 회색, border로 변경 필요)

3. **i18n:**
   - `next-intl`의 `useTranslations` 훅 사용
   - 메시지 키: `newArticle.*`, `articles.*` 네임스페이스
   - 현재 일부 텍스트만 i18n 적용, 많은 부분 하드코딩

4. **애니메이션:**
   - 기존 코드에 framer-motion 미사용
   - 신규 추가 필요

5. **상태 관리:**
   - 로컬 상태: `useState`
   - 서버 상태: `useCompletion` (AI SDK)
   - 폼 상태: `react-hook-form` + `zod`

### 1.3 기술 스택

**이미 설치된 라이브러리:**
- **UI**: shadcn-ui (Card, Button, Table, Dialog, Progress, Skeleton, Alert 등)
- **스타일**: Tailwind CSS v4 (새 문법)
- **폼**: react-hook-form, zod
- **i18n**: next-intl
- **마크다운**: react-markdown, remark-gfm
- **아이콘**: lucide-react
- **AI**: @ai-sdk/react (useCompletion)

**신규 설치 필요:**
- **애니메이션**: framer-motion (현재 미설치)
- **기타**: 없음

---

## 2. 파일 구조

### 2.1 생성할 파일

```
src/features/articles/components/
├── generation-progress-section.tsx   # 신규: Generating 모드 섹션
├── article-preview-section.tsx       # 신규: Complete 모드 섹션
└── metadata-card.tsx                  # 신규: 재사용 가능한 메타데이터 카드
```

**총 3개 신규 파일**

### 2.2 수정할 파일

```
src/
├── app/[locale]/(protected)/new-article/page.tsx  # 메인 페이지 (모드 전환, 애니메이션 추가)
├── features/articles/components/generation-form.tsx # Form 단순화
├── app/globals.css                                 # (선택) accent 색상 조정
└── messages/
    ├── ko.json                                     # i18n 키 추가
    └── en.json                                     # i18n 키 추가
```

**총 4-5개 수정 파일**

### 2.3 삭제/미사용 처리할 파일

- **generation-progress.tsx**: 기존 컴포넌트는 현재 page.tsx에서 미사용, 새 컴포넌트로 대체
  - 완전 삭제하지 않고 유지 (향후 재활용 가능성)

---

## 3. 의존성

### 3.1 설치 명령

```bash
pnpm add framer-motion
```

### 3.2 이미 설치된 패키지

- react-markdown
- remark-gfm
- lucide-react
- @ai-sdk/react
- react-hook-form
- zod
- next-intl
- tailwindcss
- shadcn-ui 컴포넌트들

---

## 4. 구현 순서

### Step 1: 의존성 설치 및 디자인 시스템 통일

**작업 내용:**
1. framer-motion 설치
2. globals.css에서 하드코딩 색상 제거 (선택적)
3. 기존 page.tsx, generation-form.tsx의 `style` prop을 Tailwind 클래스로 전환

**파일:**
- `package.json`
- `src/app/globals.css` (선택)
- `src/app/[locale]/(protected)/new-article/page.tsx`
- `src/features/articles/components/generation-form.tsx`

**예상 소요 시간:** 1-2시간

---

### Step 2: i18n 번역 키 추가

**작업 내용:**
1. `messages/ko.json`에 `newArticle` 네임스페이스 확장
2. `messages/en.json`에 동일 구조 추가

**파일:**
- `messages/ko.json`
- `messages/en.json`

**예상 소요 시간:** 30분

---

### Step 3: GenerationForm 개선 (Form Mode 단순화)

**작업 내용:**
1. Hero Section 제거
2. 간단한 제목 + 설명 추가
3. 스타일 가이드 선택 위치 조정 (textarea 내부 → 하단으로 이동)
4. 플레이스홀더 개선
5. i18n 적용

**파일:**
- `src/features/articles/components/generation-form.tsx`

**예상 소요 시간:** 2-3시간

---

### Step 4: MetadataCard 컴포넌트 생성

**작업 내용:**
1. 재사용 가능한 메타데이터 카드 컴포넌트 생성
2. Props: icon, label, value, isLoading
3. 로딩 스켈레톤 UI 내장

**파일:**
- `src/features/articles/components/metadata-card.tsx` (신규)

**예상 소요 시간:** 1시간

---

### Step 5: GenerationProgressSection 구현

**작업 내용:**
1. Generating 모드 전용 섹션 컴포넌트 생성
2. 현재 작업 표시 (예: "제목 생성 중...")
3. Plain text 스트리밍 프리뷰 (마크다운 렌더링 없음)
4. MetadataCard를 사용하여 실시간 메타데이터 표시
5. 취소 버튼 추가
6. framer-motion fadeIn 애니메이션 적용

**파일:**
- `src/features/articles/components/generation-progress-section.tsx` (신규)

**예상 소요 시간:** 3-4시간

---

### Step 6: ArticlePreviewSection 구현

**작업 내용:**
1. Complete 모드 전용 섹션 컴포넌트 생성
2. 간단한 성공 메시지 (체크 아이콘 + 텍스트)
3. Collapsible 메타데이터 카드
4. 마크다운 본문 프리뷰 (prose 스타일)
5. Primary CTA: "초안 편집하기", Secondary: "다시 생성"
6. framer-motion slideIn 애니메이션 적용

**파일:**
- `src/features/articles/components/article-preview-section.tsx` (신규)

**예상 소요 시간:** 3-4시간

---

### Step 7: page.tsx 통합 및 모드 전환 애니메이션

**작업 내용:**
1. 신규 컴포넌트 import
2. AnimatePresence로 모드 전환 애니메이션 추가
3. 하드코딩 스타일 제거
4. i18n 적용
5. 레이아웃 일관성 확보 (max-w 통일)

**파일:**
- `src/app/[locale]/(protected)/new-article/page.tsx`

**예상 소요 시간:** 2-3시간

---

### Step 8: 테스트 및 QA

**작업 내용:**
1. 각 모드 전환 테스트
2. 스트리밍 중 취소 기능 테스트
3. 애니메이션 성능 확인 (60fps)
4. 반응형 레이아웃 테스트 (모바일, 태블릿, 데스크톱)
5. i18n 전환 테스트 (한국어 ↔ 영어)
6. 접근성 검증 (스크린 리더, 키보드 네비게이션)

**예상 소요 시간:** 2-3시간

---

### 총 예상 소요 시간

- Step 1: 1-2시간
- Step 2: 30분
- Step 3: 2-3시간
- Step 4: 1시간
- Step 5: 3-4시간
- Step 6: 3-4시간
- Step 7: 2-3시간
- Step 8: 2-3시간

**총합: 15-21.5시간** (약 3-4일)

---

## 5. 컴포넌트 상세 명세

### 5.1 MetadataCard (신규)

**파일 경로:** `src/features/articles/components/metadata-card.tsx`

**Props 인터페이스:**
```typescript
import type { LucideIcon } from "lucide-react";

interface MetadataCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  isLoading?: boolean;
}
```

**전체 코드:**
```typescript
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface MetadataCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  isLoading?: boolean;
}

export function MetadataCard({
  icon: Icon,
  label,
  value,
  isLoading
}: MetadataCardProps) {
  return (
    <Card className="rounded-lg border bg-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
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

**특징:**
- 단순하고 재사용 가능
- 로딩 상태 스켈레톤 UI 내장
- value는 ReactNode 타입으로 유연성 확보 (string, Badge 배열 등)

---

### 5.2 GenerationProgressSection (신규)

**파일 경로:** `src/features/articles/components/generation-progress-section.tsx`

**Props 인터페이스:**
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

**전체 코드:**
```typescript
"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Hash } from "lucide-react";
import { MetadataCard } from "./metadata-card";

interface GenerationProgressSectionProps {
  currentTask: string;
  streamingText: string;
  metadata: {
    title?: string;
    keywords?: string[];
    metaDescription?: string;
  };
  onCancel: () => void;
}

export function GenerationProgressSection({
  currentTask,
  streamingText,
  metadata,
  onCancel,
}: GenerationProgressSectionProps) {
  const t = useTranslations("newArticle.generating");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto max-w-4xl px-4 py-12 space-y-6"
    >
      {/* Current Task */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">{currentTask}</p>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>

      {/* Streaming Preview (Plain Text) */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="whitespace-pre-wrap font-mono text-sm text-muted-foreground max-h-96 overflow-y-auto">
            {streamingText || t("initializing")}
            <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* Metadata Cards (Compact, 2-column grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MetadataCard
          icon={FileText}
          label={t("metadata.title")}
          value={metadata.title || t("metadata.generating")}
          isLoading={!metadata.title}
        />
        <MetadataCard
          icon={Hash}
          label={t("metadata.keywords")}
          value={
            metadata.keywords && metadata.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {metadata.keywords.map((k) => (
                  <Badge key={k} variant="secondary" className="text-xs">
                    {k}
                  </Badge>
                ))}
              </div>
            ) : (
              t("metadata.generating")
            )
          }
          isLoading={!metadata.keywords || metadata.keywords.length === 0}
        />
      </div>
    </motion.div>
  );
}
```

**개선 사항:**
- 진행률 바 제거 → 현재 작업 텍스트만 표시
- 스트리밍 텍스트는 plain text로만 표시 (ReactMarkdown 없음)
- 메타데이터 카드를 컴팩트하게 2열 그리드로 배치
- 취소 버튼 상단에 명확하게 배치
- framer-motion fadeIn 애니메이션 적용

---

### 5.3 ArticlePreviewSection (신규)

**파일 경로:** `src/features/articles/components/article-preview-section.tsx`

**Props 인터페이스:**
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

**전체 코드:**
```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { CheckCircle2, ChevronDown, Edit, RefreshCw, Hash, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MetadataCard } from "./metadata-card";
import { cn } from "@/lib/utils";

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

export function ArticlePreviewSection({
  article,
  onEdit,
  onRegenerate,
  isSaving,
}: ArticlePreviewSectionProps) {
  const t = useTranslations("newArticle.complete");
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="container mx-auto max-w-4xl px-4 py-12 space-y-8"
    >
      {/* Success Message (Simple) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex items-center justify-center gap-3"
      >
        <CheckCircle2 className="w-6 h-6 text-green-600" />
        <p className="text-lg font-medium text-foreground">{t("ready")}</p>
      </motion.div>

      {/* Metadata (Collapsible) */}
      <Collapsible open={isMetadataOpen} onOpenChange={setIsMetadataOpen}>
        <CollapsibleTrigger className="w-full">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors border-border bg-card">
            <CardContent className="p-4 flex justify-between items-center">
              <span className="text-sm font-medium">{t("metadata.toggle")}</span>
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
              label={t("metadata.keywords")}
              value={
                article.keywords && article.keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((k) => (
                      <Badge key={k} variant="secondary">
                        {k}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  t("metadata.empty")
                )
              }
            />
            <MetadataCard
              icon={FileText}
              label={t("metadata.description")}
              value={article.metaDescription || t("metadata.empty")}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Article Preview */}
      <Card className="border-border bg-card">
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
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onEdit} className="flex-1" disabled={isSaving}>
          <Edit className="w-4 h-4 mr-2" />
          {t("actions.edit")}
        </Button>
        <Button onClick={onRegenerate} variant="outline" disabled={isSaving}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("actions.regenerate")}
        </Button>
      </div>
    </motion.div>
  );
}
```

**개선 사항:**
- 2단 레이아웃 제거 → 단일 컬럼 (모바일 우선)
- 메타데이터를 Collapsible로 숨겨 본문에 집중
- 성공 메시지 단순화 (Confetti, 소요 시간 제거)
- Primary CTA: "초안 편집하기", Secondary: "다시 생성"
- framer-motion slideIn + success 애니메이션 적용

---

### 5.4 GenerationForm 개선 (기존 수정)

**파일 경로:** `src/features/articles/components/generation-form.tsx`

**변경 사항:**
1. Hero Section 제거 (큰 제목, 부제목)
2. 간단한 제목 + 설명만 남김
3. 스타일 가이드 선택을 textarea 내부 → 폼 하단으로 이동
4. 모든 하드코딩 색상을 Tailwind 클래스로 변경
5. i18n 적용
6. 플레이스홀더 개선

**수정된 코드:**
```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";

const GenerationFormSchema = z.object({
  topic: z
    .string()
    .min(2, "주제는 2자 이상이어야 합니다")
    .max(200, "주제는 200자 이내여야 합니다"),
  styleGuideId: z.string().uuid("유효한 스타일 가이드를 선택해주세요"),
  keywords: z.array(z.string()).optional(),
  additionalInstructions: z
    .string()
    .max(1000, "추가 요구사항은 1000자 이내여야 합니다")
    .optional(),
});

export type GenerationFormData = z.infer<typeof GenerationFormSchema>;

interface GenerationFormProps {
  styleGuides: Array<{ id: string; name: string }>;
  onSubmit: (data: GenerationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function GenerationForm({
  styleGuides,
  onSubmit,
  isLoading,
}: GenerationFormProps) {
  const t = useTranslations("newArticle.form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GenerationFormData>({
    resolver: zodResolver(GenerationFormSchema),
    defaultValues: {
      topic: "",
      styleGuideId: styleGuides[0]?.id || "",
      keywords: [],
      additionalInstructions: "",
    },
  });

  const handleSubmit = async (data: GenerationFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="space-y-6">
        {/* Simple Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {t("subtitle")}
          </p>
        </div>

        {/* Main Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Textarea */}
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t("topicPlaceholder")}
                      disabled={isSubmitting || isLoading}
                      className="min-h-[200px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Controls (Style Guide + Generate Button) */}
            <div className="flex items-center gap-3">
              <FormField
                control={form.control}
                name="styleGuideId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting || isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("styleGuidePlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {styleGuides.map((guide) => (
                          <SelectItem key={guide.id} value={guide.id}>
                            {guide.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting || isLoading || !form.formState.isValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t("generate")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
```

**개선 사항:**
- Hero Section 완전 제거
- 간단한 제목 + 설명만 유지
- 스타일 가이드 선택을 폼 하단으로 이동 (textarea 내부에서 제거)
- 하드코딩 색상 제거 (`#3BA2F8` → Tailwind 클래스)
- 모든 텍스트 i18n 적용
- 플레이스홀더에 구체적 예시 포함 (i18n 메시지로)

---

### 5.5 page.tsx 통합 (기존 수정)

**파일 경로:** `src/app/[locale]/(protected)/new-article/page.tsx`

**변경 사항:**
1. 신규 컴포넌트 import
2. AnimatePresence로 모드 전환 애니메이션
3. Generating 모드 UI를 GenerationProgressSection으로 교체
4. Complete 모드 UI를 ArticlePreviewSection으로 교체
5. 하드코딩 스타일 제거
6. i18n 적용

**주요 수정 부분 (전체 코드는 너무 길어 핵심만 발췌):**

```typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from '@/i18n/navigation';
import { useToast } from "@/hooks/use-toast";
import { GenerationForm } from "@/features/articles/components/generation-form";
import { GenerationProgressSection } from "@/features/articles/components/generation-progress-section";
import { ArticlePreviewSection } from "@/features/articles/components/article-preview-section";
import { useStyleGuide } from "@/features/articles/hooks/useStyleGuide";
import type { GenerationFormData } from "@/features/articles/components/generation-form";
import { useTranslations } from 'next-intl';
import { useCompletion } from "@ai-sdk/react";
import {
  parseGeneratedText,
  parseStreamingTextToJson,
  type ParsedAIArticle,
} from "@/features/articles/lib/ai-parse";
import { generateUniqueSlug } from "@/lib/slug";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { AnimatePresence } from "framer-motion";

type NewArticlePageProps = {
  params: Promise<Record<string, never>>;
};

export default function NewArticlePage({ params }: NewArticlePageProps) {
  void params;
  const t = useTranslations('newArticle');
  const router = useRouter();
  const { toast } = useToast();

  const [mode, setMode] = useState<"form" | "generating" | "complete">("form");
  const [parsed, setParsed] = useState<ParsedAIArticle | null>(null);
  const [lastRequest, setLastRequest] = useState<{
    topic: string;
    styleGuideId?: string;
    keywords: string[];
  } | null>(null);

  const { data: styleGuideData, isLoading: isLoadingStyleGuide } = useStyleGuide();
  const { user } = useCurrentUser();
  const { completion, complete, stop, isLoading } = useCompletion({
    api: "/api/articles/generate",
  });

  const styleGuides = styleGuideData
    ? [{ id: styleGuideData.id, name: t("default_style_guide") }]
    : [];

  // ... (기존 로직 유지: handleGenerateSubmit, handleSave 등)

  const generatingPreview = useMemo(() => completion, [completion]);
  const generatingParsed = useMemo(
    () => parseStreamingTextToJson(generatingPreview || ""),
    [generatingPreview]
  );

  // 현재 작업 추정 (간단한 휴리스틱)
  const getCurrentTask = (): string => {
    if (!generatingParsed.title) return t("generating.tasks.title");
    if (!generatingParsed.keywords || generatingParsed.keywords.length === 0)
      return t("generating.tasks.keywords");
    if (!generatingParsed.content || generatingParsed.content.length < 100)
      return t("generating.tasks.content");
    return t("generating.tasks.finalizing");
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {mode === "form" && (
          <GenerationForm
            key="form"
            styleGuides={styleGuides}
            onSubmit={handleGenerateSubmit}
            isLoading={isLoadingStyleGuide}
          />
        )}

        {mode === "generating" && (
          <GenerationProgressSection
            key="generating"
            currentTask={getCurrentTask()}
            streamingText={generatingPreview || ""}
            metadata={{
              title: generatingParsed.title,
              keywords: generatingParsed.keywords,
              metaDescription: generatingParsed.metaDescription,
            }}
            onCancel={() => {
              stop();
              setMode("form");
            }}
          />
        )}

        {mode === "complete" && parsed && (
          <ArticlePreviewSection
            key="complete"
            article={{
              title: parsed.title,
              content: parsed.content,
              metaDescription: parsed.metaDescription,
              keywords: parsed.keywords,
            }}
            onEdit={handleSave}
            onRegenerate={() => {
              setMode("form");
              setParsed(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

**개선 사항:**
- AnimatePresence로 모드 전환 시 부드러운 애니메이션
- Generating/Complete UI를 신규 컴포넌트로 교체
- 하드코딩 색상 제거 (`bg-white` → `bg-background`)
- getCurrentTask 함수로 현재 작업 추정
- i18n 적용

---

## 6. i18n 번역 키

### 6.1 한국어 (messages/ko.json)

**newArticle 네임스페이스 확장:**

```json
{
  "newArticle": {
    "back": "뒤로 가기",
    "default_style_guide": "내 스타일 가이드",
    "toast": {
      "error": {
        "title": "생성 실패",
        "desc": "AI 글 생성 중 오류가 발생했습니다."
      },
      "success": {
        "title": "AI 글 생성 완료",
        "desc": "\"{title}\" 글이 생성되었습니다."
      }
    },
    "form": {
      "title": "새 글 작성",
      "subtitle": "주제를 입력하면 AI가 초안을 작성합니다",
      "topicPlaceholder": "예: React 19의 새로운 기능과 활용 방법",
      "styleGuidePlaceholder": "스타일 가이드 선택",
      "generate": "생성하기",
      "generating": "생성 중..."
    },
    "generating": {
      "cancel": "취소",
      "initializing": "초기화 중...",
      "tasks": {
        "title": "제목 생성 중...",
        "keywords": "키워드 추출 중...",
        "content": "본문 작성 중...",
        "finalizing": "마무리 중..."
      },
      "metadata": {
        "title": "제목",
        "keywords": "키워드",
        "generating": "생성 중..."
      }
    },
    "complete": {
      "ready": "초안이 준비되었습니다",
      "metadata": {
        "toggle": "메타데이터 보기",
        "keywords": "키워드",
        "description": "메타 설명",
        "empty": "없음"
      },
      "actions": {
        "edit": "초안 편집하기",
        "regenerate": "다시 생성"
      }
    }
  }
}
```

### 6.2 영어 (messages/en.json)

```json
{
  "newArticle": {
    "back": "Go Back",
    "default_style_guide": "My Style Guide",
    "toast": {
      "error": {
        "title": "Generation Failed",
        "desc": "An error occurred while generating the article."
      },
      "success": {
        "title": "Article Generated",
        "desc": "Article \"{title}\" has been generated."
      }
    },
    "form": {
      "title": "New Article",
      "subtitle": "Enter a topic and AI will draft an article for you",
      "topicPlaceholder": "e.g., New features and use cases of React 19",
      "styleGuidePlaceholder": "Select style guide",
      "generate": "Generate",
      "generating": "Generating..."
    },
    "generating": {
      "cancel": "Cancel",
      "initializing": "Initializing...",
      "tasks": {
        "title": "Generating title...",
        "keywords": "Extracting keywords...",
        "content": "Writing content...",
        "finalizing": "Finalizing..."
      },
      "metadata": {
        "title": "Title",
        "keywords": "Keywords",
        "generating": "Generating..."
      }
    },
    "complete": {
      "ready": "Your draft is ready",
      "metadata": {
        "toggle": "View Metadata",
        "keywords": "Keywords",
        "description": "Meta Description",
        "empty": "None"
      },
      "actions": {
        "edit": "Edit Draft",
        "regenerate": "Regenerate"
      }
    }
  }
}
```

---

## 7. 스타일링 가이드

### 7.1 Tailwind 클래스 패턴

**컬러 시스템 (하드코딩 제거):**

| 기존 하드코딩 | Tailwind 클래스 | 용도 |
|-------------|----------------|-----|
| `#3BA2F8` | `bg-primary` 또는 `bg-accent` | 강조 색상 |
| `#6B7280` | `text-muted-foreground` | 부수 텍스트 |
| `#E1E5EA` | `border-border` | 테두리 |
| `#1F2937` | `text-foreground` | 기본 텍스트 |
| `#F9FAFB` | `bg-muted` | 배경 (밝은 회색) |

**타이포그래피:**
```typescript
const typography = {
  pageTitle: "text-2xl md:text-3xl font-bold",           // 24px-30px
  articleTitle: "text-3xl md:text-4xl font-bold",        // 30px-36px
  sectionTitle: "text-lg font-semibold",                 // 18px
  body: "text-base",                                     // 16px
  small: "text-sm text-muted-foreground",                // 14px
};
```

**간격 시스템:**
```typescript
const spacing = {
  sectionGap: "space-y-8",      // 32px - 섹션 간
  componentGap: "space-y-6",    // 24px - 컴포넌트 간
  elementGap: "space-y-4",      // 16px - 요소 간
  inlineGap: "gap-3",           // 12px - 인라인 요소
};
```

### 7.2 반응형 디자인

**브레이크포인트:**
- **sm**: 640px (모바일 가로)
- **md**: 768px (태블릿)
- **lg**: 1024px (데스크톱)

**레이아웃 예시:**
```typescript
// 모바일: 단일 컬럼, 데스크톱: 2열 그리드
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {/* ... */}
</div>

// 모바일: 세로 나열, 데스크톱: 가로 나열
<div className="flex flex-col sm:flex-row gap-3">
  {/* ... */}
</div>
```

### 7.3 다크모드 (현재 제외)

- 현재는 라이트 모드만 구현
- 다크모드는 별도 이슈로 관리 (전체 앱 차원)
- 단, `dark:prose-invert` 등 prose 스타일은 준비

---

## 8. 성능 고려사항

### 8.1 애니메이션 최적화

**원칙:**
1. **하드웨어 가속 속성만 애니메이션**: `opacity`, `transform`
2. **짧은 duration**: 0.3s-0.4s
3. **prefers-reduced-motion 지원** (선택):
   ```typescript
   const shouldReduceMotion = window.matchMedia(
     "(prefers-reduced-motion: reduce)"
   ).matches;

   <motion.div
     initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
     animate={{ opacity: 1 }}
     transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
   >
   ```

**사용된 애니메이션:**
- **fadeIn**: `opacity: 0 → 1` (0.3s)
- **slideIn**: `opacity: 0, y: 20 → opacity: 1, y: 0` (0.4s)
- **success**: `scale: 0 → 1` (spring)

### 8.2 이미지 최적화

- 현재 New Article 페이지에는 이미지 없음
- 향후 추가 시 Next.js Image 컴포넌트 사용

### 8.3 코드 분할

- 신규 컴포넌트는 모두 동적 import 가능
- 필요 시 `next/dynamic` 사용

---

## 9. 접근성 체크리스트

- [x] **시맨틱 HTML**: `<article>`, `<section>` 등 사용
- [x] **ARIA 레이블**: 버튼, 카드에 `aria-label` 추가
- [x] **키보드 네비게이션**: 모든 인터랙티브 요소 키보드 접근 가능
- [x] **색상 대비**: Tailwind 기본 색상 사용 (WCAG AA 준수)
- [ ] **스크린 리더 테스트**: 구현 후 수동 테스트 필요
- [x] **포커스 관리**: shadcn-ui 컴포넌트가 기본 제공

---

## 10. 테스트 계획

### 10.1 단위 테스트 (선택적)

**대상:**
- `parseGeneratedText` 함수 (이미 테스트 존재)
- `parseStreamingTextToJson` 함수 (이미 테스트 존재)

### 10.2 통합 테스트 (E2E)

**Playwright 시나리오:**

1. **Form → Generating → Complete 플로우**
   ```typescript
   test("should complete article generation flow", async ({ page }) => {
     await page.goto("/new-article");

     // Form 입력
     await page.getByPlaceholder(/예: React 19/).fill("Test topic");
     await page.getByRole("button", { name: /생성하기/ }).click();

     // Generating 상태 확인
     await expect(page.getByText(/생성 중/)).toBeVisible();

     // Complete 상태 확인 (타임아웃: 30초)
     await expect(page.getByText(/초안이 준비되었습니다/)).toBeVisible({ timeout: 30000 });

     // 메타데이터 토글
     await page.getByText(/메타데이터 보기/).click();
     await expect(page.getByText(/키워드/)).toBeVisible();

     // 편집 버튼 클릭
     await page.getByRole("button", { name: /초안 편집하기/ }).click();
     await expect(page).toHaveURL(/\/articles\/.*\/edit/);
   });
   ```

2. **취소 플로우**
   ```typescript
   test("should cancel generation", async ({ page }) => {
     await page.goto("/new-article");
     await page.getByPlaceholder(/예: React 19/).fill("Test topic");
     await page.getByRole("button", { name: /생성하기/ }).click();

     // Generating 상태에서 취소
     await page.getByRole("button", { name: /취소/ }).click();

     // Form으로 돌아왔는지 확인
     await expect(page.getByPlaceholder(/예: React 19/)).toBeVisible();
   });
   ```

3. **다시 생성 플로우**
   ```typescript
   test("should regenerate article", async ({ page }) => {
     // ... (Complete 모드까지 진행)

     await page.getByRole("button", { name: /다시 생성/ }).click();
     await expect(page.getByPlaceholder(/예: React 19/)).toBeVisible();
   });
   ```

---

## 11. 마이그레이션 전략

### 11.1 점진적 교체

**Phase 1: 준비 (Step 1-4)**
- 의존성 설치, i18n 추가, 공통 컴포넌트 생성
- 기존 페이지 동작에 영향 없음

**Phase 2: 통합 (Step 5-7)**
- 신규 컴포넌트 통합 및 기존 인라인 UI 교체
- 기능 동작은 동일, UI만 개선

**Phase 3: 정리 (Step 8)**
- 테스트 및 QA
- 불필요한 코드 제거

### 11.2 롤백 계획

**문제 발생 시:**
1. git revert로 이전 커밋으로 복구
2. 신규 컴포넌트만 제거하고 page.tsx 복원

---

## 12. 위험 요소 및 완화 방안

### 12.1 위험 요소

1. **framer-motion 번들 크기 증가**
   - **완화**: 필요한 컴포넌트만 import (`motion.div`만 사용)

2. **AnimatePresence의 모드 전환 지연**
   - **완화**: `mode="wait"` 사용하여 명확한 전환 보장

3. **스트리밍 중 파싱 오류**
   - **완화**: `parseStreamingTextToJson`이 절대 throw하지 않도록 안전 처리됨 (기존 구현 확인)

4. **i18n 키 누락**
   - **완화**: 개발 중 브라우저 콘솔에서 누락 키 확인, 빌드 전 전체 검증

5. **모바일 레이아웃 깨짐**
   - **완화**: 모든 컴포넌트에 반응형 클래스 적용 (`grid-cols-1 md:grid-cols-2`)

### 12.2 테스트 전략

- 각 Step 완료 후 즉시 브라우저에서 동작 확인
- Step 7 완료 후 전체 플로우 E2E 테스트
- 모바일, 태블릿, 데스크톱 모두 테스트

---

## 13. 구현 체크리스트

### Step 1: 의존성 및 디자인 시스템
- [ ] `pnpm add framer-motion` 실행
- [ ] `page.tsx`의 하드코딩 색상 제거
- [ ] `generation-form.tsx`의 하드코딩 색상 제거
- [ ] (선택) `globals.css`에 accent 색상 조정

### Step 2: i18n
- [ ] `messages/ko.json`에 `newArticle` 네임스페이스 확장
- [ ] `messages/en.json`에 동일 구조 추가

### Step 3: GenerationForm 개선
- [ ] Hero Section 제거
- [ ] 간단한 제목 + 설명 추가
- [ ] 스타일 가이드 선택 위치 조정
- [ ] 플레이스홀더 개선
- [ ] i18n 적용

### Step 4: MetadataCard 생성
- [ ] `metadata-card.tsx` 파일 생성
- [ ] Props 인터페이스 정의
- [ ] 컴포넌트 구현
- [ ] 로딩 스켈레톤 추가

### Step 5: GenerationProgressSection 생성
- [ ] `generation-progress-section.tsx` 파일 생성
- [ ] Props 인터페이스 정의
- [ ] 현재 작업 표시 UI
- [ ] Plain text 스트리밍 프리뷰
- [ ] MetadataCard 통합
- [ ] 취소 버튼
- [ ] framer-motion 애니메이션

### Step 6: ArticlePreviewSection 생성
- [ ] `article-preview-section.tsx` 파일 생성
- [ ] Props 인터페이스 정의
- [ ] 성공 메시지 UI
- [ ] Collapsible 메타데이터
- [ ] 마크다운 프리뷰
- [ ] 액션 버튼 (편집, 다시 생성)
- [ ] framer-motion 애니메이션

### Step 7: page.tsx 통합
- [ ] 신규 컴포넌트 import
- [ ] AnimatePresence 추가
- [ ] Generating UI를 GenerationProgressSection으로 교체
- [ ] Complete UI를 ArticlePreviewSection으로 교체
- [ ] getCurrentTask 함수 구현
- [ ] 하드코딩 스타일 제거
- [ ] i18n 적용

### Step 8: 테스트 및 QA
- [ ] Form → Generating → Complete 플로우 테스트
- [ ] 취소 기능 테스트
- [ ] 다시 생성 기능 테스트
- [ ] 애니메이션 부드러움 확인 (60fps)
- [ ] 반응형 레이아웃 (모바일, 태블릿, 데스크톱)
- [ ] i18n 전환 (한국어 ↔ 영어)
- [ ] 키보드 네비게이션
- [ ] 스크린 리더 (선택)

---

## 14. 예상 산출물

### 14.1 생성될 파일 (3개)
1. `src/features/articles/components/metadata-card.tsx`
2. `src/features/articles/components/generation-progress-section.tsx`
3. `src/features/articles/components/article-preview-section.tsx`

### 14.2 수정될 파일 (4-5개)
1. `src/app/[locale]/(protected)/new-article/page.tsx`
2. `src/features/articles/components/generation-form.tsx`
3. `messages/ko.json`
4. `messages/en.json`
5. `src/app/globals.css` (선택)

### 14.3 변경 라인 수 (예상)
- 신규 코드: ~500줄
- 수정 코드: ~200줄
- 삭제 코드: ~150줄 (인라인 UI 제거)

---

## 15. 다음 단계 (구현 후)

### 15.1 즉시 실행
1. Phase 1 구현 (Step 1-4)
2. 브라우저에서 동작 확인
3. 커밋 및 PR 생성

### 15.2 검증
1. 팀 리뷰 요청
2. 사용자 테스트 (내부)
3. 피드백 수집

### 15.3 개선
1. 피드백 반영
2. Phase 2, 3 진행 여부 결정
3. 성능 모니터링

---

## 16. 참고 자료

### 16.1 관련 문서
- [1-plan-critic.md](./1-plan-critic.md): 원안 검토 및 개선 방향
- [Tailwind CSS v4 문서](https://tailwindcss.com/)
- [framer-motion 문서](https://www.framer.com/motion/)
- [next-intl 문서](https://next-intl-docs.vercel.app/)

### 16.2 코드베이스 참고
- `src/features/landing/components/*.tsx`: framer-motion 사용 예시
- `src/features/articles/lib/ai-parse.ts`: AI 응답 파싱 로직
- `messages/ko.json`: 기존 i18n 구조

---

## 17. 결론

이 구현 계획은 **1-plan-critic.md**의 검토 결과를 반영하여:

1. **단순함 우선**: 5개 컴포넌트로 구조 단순화
2. **작업 중심**: Hero Section 제거, 글 생성에 집중
3. **모바일 우선**: 단일 컬럼 레이아웃, Collapsible 메타데이터
4. **실용성**: 진행률 바 대신 현재 작업 표시, plain text 스트리밍

총 **15-21.5시간 (3-4일)** 내에 완료 가능하며, 점진적 구현으로 리스크를 최소화합니다.

모든 코드는 **실제 구현 가능한 수준**으로 작성되었으며, 기존 코드베이스의 패턴을 준수합니다.
