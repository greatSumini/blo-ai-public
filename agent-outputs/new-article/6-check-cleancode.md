# 클린코드 품질 검토 - New Article Page

## 📋 검토 요약

전반적으로 new-article 페이지는 **높은 수준의 코드 품질**을 유지하고 있습니다. CLAUDE.md 가이드라인을 준수하며, 클린코드 원칙이 잘 적용되어 있습니다.

**종합 평가: 85/100**

---

## 1. 코드베이스 구조 준수 여부

### ✅ 준수 항목

- **"use client" 지시어**: 모든 컴포넌트에 올바르게 사용됨
- **Promise params 패턴**: page.tsx에서 올바르게 사용 (`Promise<Record<string, never>>`)
- **파일명 컨벤션**: kebab-case 일관적 사용
- **디렉토리 구조**: features 기반 구조 준수
- **Import 순서**: React → 서드파티 → 내부 모듈 순서 준수

### ⚠️ 개선 가능 항목

#### 1. HTTP 요청이 `@/lib/remote/api-client`를 거치지 않음

**파일**: `src/app/[locale]/(protected)/new-article/page.tsx` (129-136번 줄)

**문제**:
- CLAUDE.md 가이드라인에서는 "route feature hooks' HTTP requests through `@/lib/remote/api-client`" 명시
- 현재 코드는 `fetch`를 직접 사용하여 API 호출

**현재**:
```typescript
const res = await fetch("/api/articles/draft", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-clerk-user-id": user.id,
  },
  body: JSON.stringify(payload),
});
```

**권장 수정**:
```typescript
// 1. hooks 디렉토리에 useCreateDraft.ts 생성
import { useMutation } from "@tanstack/react-query";
import { createAuthenticatedClient } from "@/lib/remote/api-client";
import { useAuth } from "@clerk/nextjs";

export const useCreateDraft = () => {
  const { userId } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateDraftPayload) => {
      const client = createAuthenticatedClient(userId);
      const response = await client.post("/api/articles/draft", payload);
      return response.data;
    },
  });
};

// 2. page.tsx에서 사용
const { mutateAsync: createDraft } = useCreateDraft();

const handleSave = async () => {
  if (!parsed) return;
  if (!user?.id) {
    toast({
      title: t("save.loginRequired"),
      variant: "destructive"
    });
    return;
  }

  try {
    const payload = {
      title: parsed.title,
      slug: generateUniqueSlug(parsed.title),
      keywords: parsed.keywords ?? [],
      description: parsed.metaDescription ?? undefined,
      content: parsed.content,
      styleGuideId: lastRequest?.styleGuideId,
      metaTitle: parsed.title,
      metaDescription: parsed.metaDescription ?? undefined,
    };

    const article = await createDraft(payload);
    toast({
      title: t("save.success.title"),
      description: t("save.success.desc", { title: article.title }),
    });
    router.push(`/articles/${article.id}/edit`);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : t("save.error.desc");
    toast({
      title: t("save.error.title"),
      description: message,
      variant: "destructive",
    });
  }
};
```

---

## 2. CLAUDE.md 가이드라인 검증

### Must 규칙 체크

- [x] 모든 컴포넌트에 `"use client"` 사용
- [x] promise를 params로 사용 (page.tsx)
- [ ] HTTP 요청은 `@/lib/remote/api-client` 통과 (**위반**)
- [x] 한글 텍스트 UTF-8 깨짐 없음

### Library 사용

- [x] `react-hook-form` + `zod`: GenerationForm에서 올바르게 사용
- [x] `framer-motion`: 애니메이션에 적절히 사용
- [x] `@tanstack/react-query`: useStyleGuide 훅에서 사용
- [x] `lucide-react`: 아이콘 사용
- [x] `next-intl`: i18n 일관적 적용
- [x] `shadcn-ui`: UI 컴포넌트 패턴 준수

---

## 3. 클린코드 원칙 검증

### 3.1 Simplicity & Readability ✅

**잘된 점**:
- 함수가 단일 책임 원칙 준수
- 변수명이 명확하고 의미 전달이 잘됨 (`parsed`, `lastRequest`, `generatingPreview`)
- 복잡도가 낮고 이해하기 쉬움

**예시 (잘된 코드)**:
```typescript
const getUserName = (email?: string) => {
  if (!email) return "Sam";
  return email.split("@")[0];
};
```

### 3.2 Early Returns ✅

**잘된 점**:
- page.tsx의 `handleSave` 함수에서 early return 잘 적용

```typescript
const handleSave = async () => {
  if (!parsed) return;
  if (!user?.id) {
    toast({
      title: t("save.loginRequired"),
      variant: "destructive"
    });
    return;
  }
  // ... main logic
};
```

### 3.3 Functional Programming ✅

**잘된 점**:
- `useMemo`로 불필요한 재계산 방지
- 순수 함수 사용 (`getCurrentTask`)
- 불변성 유지

```typescript
const generatingPreview = useMemo(() => completion, [completion]);
const generatingParsed = useMemo(
  () => parseStreamingTextToJson(generatingPreview || ""),
  [generatingPreview]
);
```

### 3.4 에러 처리 ⚠️

**개선 가능**:
- `handleSave`의 에러 핸들링에서 response 에러 파싱이 다소 복잡함

**현재**:
```typescript
if (!res.ok) {
  const err = await res.json().catch(() => ({} as any));
  throw new Error(err?.error?.message || t("save.error.network"));
}
```

**개선**:
```typescript
// api-client를 사용하면 extractApiErrorMessage로 일관되게 처리 가능
catch (error) {
  const message = extractApiErrorMessage(error, t("save.error.desc"));
  toast({
    title: t("save.error.title"),
    description: message,
    variant: "destructive",
  });
}
```

---

## 4. 컴포넌트 구조 분석

### NewArticlePage (page.tsx)

**평가**: ⭐⭐⭐⭐☆ (4/5)

**장점**:
- Props 인터페이스 명확 (`NewArticlePageProps`)
- 상태 관리가 간결하고 명확 (`mode`, `parsed`, `lastRequest`)
- AnimatePresence를 활용한 부드러운 화면 전환

**개선점**:
- `handleSave` 로직을 커스텀 훅으로 분리 가능 (`useArticleDraft`)
- 비즈니스 로직이 컴포넌트에 다소 집중되어 있음

**권장 구조**:
```typescript
// src/features/articles/hooks/useArticleDraft.ts
export const useArticleDraft = () => {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const t = useTranslations('newArticle');
  const router = useRouter();
  const { mutateAsync: createDraft } = useCreateDraft();

  const saveDraft = async (parsed: ParsedAIArticle, lastRequest: any) => {
    if (!user?.id) {
      toast({
        title: t("save.loginRequired"),
        variant: "destructive"
      });
      return;
    }

    try {
      const payload = {
        title: parsed.title,
        slug: generateUniqueSlug(parsed.title),
        keywords: parsed.keywords ?? [],
        description: parsed.metaDescription ?? undefined,
        content: parsed.content,
        styleGuideId: lastRequest?.styleGuideId,
        metaTitle: parsed.title,
        metaDescription: parsed.metaDescription ?? undefined,
      };

      const article = await createDraft(payload);
      toast({
        title: t("save.success.title"),
        description: t("save.success.desc", { title: article.title }),
      });
      router.push(`/articles/${article.id}/edit`);
    } catch (e) {
      const message = extractApiErrorMessage(e, t("save.error.desc"));
      toast({
        title: t("save.error.title"),
        description: message,
        variant: "destructive",
      });
    }
  };

  return { saveDraft };
};

// page.tsx
const { saveDraft } = useArticleDraft();

const handleSave = async () => {
  if (!parsed || !lastRequest) return;
  await saveDraft(parsed, lastRequest);
};
```

### GenerationForm

**평가**: ⭐⭐⭐⭐⭐ (5/5)

**장점**:
- Props 인터페이스 완벽
- i18n-aware schema factory 패턴 우수
- react-hook-form + zod 올바르게 사용
- 로딩 상태 처리 명확
- UI/로직 분리 잘됨

### GenerationProgressSection

**평가**: ⭐⭐⭐⭐⭐ (5/5)

**장점**:
- Props 타입 정의 명확
- 컴포넌트 책임 명확 (진행 상태 표시만)
- framer-motion 애니메이션 적절
- Metadata 표시를 MetadataCard로 재사용

### ArticlePreviewSection

**평가**: ⭐⭐⭐⭐⭐ (5/5)

**장점**:
- Collapsible 패턴으로 UX 향상
- ReactMarkdown으로 마크다운 렌더링
- Props 타입 정의 명확
- 사용자 인터랙션 잘 처리

### MetadataCard

**평가**: ⭐⭐⭐⭐⭐ (5/5)

**장점**:
- 재사용 가능한 단일 책임 컴포넌트
- LucideIcon 타입 활용
- 로딩 상태 스켈레톤 UI 제공
- 접근성 고려 (sr-only)

---

## 5. 파일 조직 검토

### 디렉토리 구조 ✅

```
src/app/[locale]/(protected)/new-article/
  └── page.tsx                      ✅ 올바른 위치

src/features/articles/
  ├── components/
  │   ├── generation-form.tsx       ✅ 올바른 위치
  │   ├── generation-progress-section.tsx ✅
  │   ├── article-preview-section.tsx     ✅
  │   └── metadata-card.tsx         ✅ 재사용 가능 컴포넌트
  ├── hooks/
  │   └── useStyleGuide.ts          ✅ 올바른 위치
  └── lib/
      └── ai-parse.ts               ✅ 유틸리티 함수 분리
```

**평가**: features 패턴 준수, 구조 우수

### Import 순서 검증

**page.tsx (1-20번 줄)**:
```typescript
// ✅ React/Next.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from '@/i18n/navigation';

// ✅ 외부 라이브러리
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';
import { useCompletion } from "@ai-sdk/react";
import { AnimatePresence } from "framer-motion";

// ✅ 내부 모듈 (@/)
import { GenerationForm } from "@/features/articles/components/generation-form";
import { GenerationProgressSection } from "@/features/articles/components/generation-progress-section";
import { ArticlePreviewSection } from "@/features/articles/components/article-preview-section";
import { useStyleGuide } from "@/features/articles/hooks/useStyleGuide";
import type { GenerationFormData } from "@/features/articles/components/generation-form";
import { parseGeneratedText, ... } from "@/features/articles/lib/ai-parse";
import { generateUniqueSlug } from "@/lib/slug";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
```

**평가**: Import 순서 완벽히 준수

---

## 6. 성능 최적화 검토

### useMemo 사용 ✅

```typescript
const generatingPreview = useMemo(() => completion, [completion]);
const generatingParsed = useMemo(
  () => parseStreamingTextToJson(generatingPreview || ""),
  [generatingPreview]
);
```

**평가**: `parseStreamingTextToJson`이 매 렌더마다 실행되지 않도록 메모이제이션 적절

### AnimatePresence ✅

```typescript
<AnimatePresence mode="wait" initial={false}>
  {mode === "form" && <GenerationForm key="form" ... />}
  {mode === "generating" && <GenerationProgressSection key="generating" ... />}
  {mode === "complete" && <ArticlePreviewSection key="complete" ... />}
</AnimatePresence>
```

**평가**: `mode="wait"`로 순차 애니메이션, `initial={false}` 로 초기 마운트 애니메이션 스킵

### 불필요한 리렌더링 방지 ⚠️

**개선 가능**:
- `getCurrentTask` 함수를 `useCallback`으로 메모이제이션 가능
- `handleGenerateSubmit`도 `useCallback` 적용 고려

**권장**:
```typescript
const getCurrentTask = useCallback((): string => {
  if (!generatingParsed.title) return t("generating.tasks.title");
  if (!generatingParsed.keywords || generatingParsed.keywords.length === 0)
    return t("generating.tasks.keywords");
  if (!generatingParsed.content || generatingParsed.content.length < 100)
    return t("generating.tasks.content");
  return t("generating.tasks.finalizing");
}, [generatingParsed, t]);

const handleGenerateSubmit = useCallback(async (data: GenerationFormData) => {
  setMode("generating");
  setParsed(null);
  setLastRequest({
    topic: data.topic,
    styleGuideId: data.styleGuideId,
    keywords: data.keywords || [],
  });

  try {
    await complete(data.topic, {
      body: {
        topic: data.topic,
        styleGuideId: data.styleGuideId,
        keywords: data.keywords || [],
        additionalInstructions: data.additionalInstructions || undefined,
      },
    });
  } catch (error) {
    console.error("Failed to generate article:", error);
    const message =
      error instanceof Error
        ? error.message
        : t("toast.error.desc");
    toast({
      title: t("toast.error.title"),
      description: message,
      variant: "destructive",
    });
    setMode("form");
  }
}, [complete, t, toast]);
```

---

## 7. 개선 우선순위

### 🔴 긴급 (구조적 문제)

- [ ] **HTTP 요청을 `@/lib/remote/api-client`를 통과하도록 수정**
  - `handleSave`의 `fetch` 호출을 `createAuthenticatedClient` + React Query로 변경
  - `src/features/articles/hooks/useCreateDraft.ts` 훅 생성

### 🟡 높음 (코드 품질)

- [ ] **비즈니스 로직을 커스텀 훅으로 분리**
  - `handleSave` 로직을 `useArticleDraft` 훅으로 추출
  - 재사용성 향상 및 테스트 용이성 개선

- [ ] **에러 핸들링 일관성 개선**
  - `extractApiErrorMessage` 유틸리티 활용
  - 모든 에러 메시지 형식 통일

### 🟢 중간 (최적화)

- [ ] **함수 메모이제이션 추가**
  - `getCurrentTask` → `useCallback`
  - `handleGenerateSubmit` → `useCallback`

- [ ] **타입 정의 분리**
  - `GenerationFormData` 타입을 별도 파일로 분리 (`src/features/articles/lib/types.ts`)
  - `ParsedAIArticle` 같은 공용 타입과 함께 관리

---

## 8. 종합 평가

### ✅ 잘된 점

1. **코드베이스 구조 준수**: features 패턴, 파일명 컨벤션, 디렉토리 구조 모두 우수
2. **컴포넌트 분리**: 단일 책임 원칙을 잘 지킴 (GenerationForm, GenerationProgressSection, ArticlePreviewSection, MetadataCard)
3. **타입 안정성**: TypeScript 타입 정의가 명확하고 일관적
4. **i18n 적용**: next-intl을 일관되게 사용
5. **UX**: framer-motion 애니메이션으로 부드러운 사용자 경험 제공
6. **재사용성**: MetadataCard 같은 재사용 가능한 컴포넌트 설계 우수

### ⚠️ 개선이 필요한 점

1. **HTTP 요청 패턴**: `fetch` 직접 사용 대신 `@/lib/remote/api-client` 사용 필요
2. **비즈니스 로직 분리**: page.tsx의 `handleSave` 로직을 커스텀 훅으로 추출
3. **함수 메모이제이션**: `useCallback`으로 일부 함수 최적화 가능
4. **에러 처리 일관성**: `extractApiErrorMessage` 유틸리티 활용

### 📊 점수 세부 내역

- **구조 및 패턴 준수**: 18/20
  - `-2`: HTTP 요청이 api-client를 거치지 않음

- **클린코드 원칙**: 20/20
  - Early returns, Functional programming, Readability 모두 우수

- **컴포넌트 품질**: 19/20
  - `-1`: page.tsx에 비즈니스 로직이 다소 집중

- **타입 안정성**: 20/20
  - TypeScript 타입 정의 완벽

- **성능 최적화**: 16/20
  - `-4`: 일부 함수에 메모이제이션 미적용

**총점: 93/100** → 매우 우수한 코드 품질

---

## 9. 다음 단계 권장 사항

### 즉시 적용 가능한 개선

1. **useCreateDraft 훅 생성**
```bash
# 파일 생성
touch src/features/articles/hooks/useCreateDraft.ts
```

2. **타입 정의 분리**
```bash
# 공용 타입 파일 생성
touch src/features/articles/lib/types.ts
```

3. **useArticleDraft 훅 생성**
```bash
# 비즈니스 로직 훅 생성
touch src/features/articles/hooks/useArticleDraft.ts
```

### 테스트 추가

현재 `ai-parse.test.ts`만 존재하므로, 추가 테스트 파일 생성 권장:

```bash
# 컴포넌트 테스트
touch src/features/articles/components/generation-form.test.tsx
touch src/features/articles/components/article-preview-section.test.tsx

# 훅 테스트
touch src/features/articles/hooks/useStyleGuide.test.ts
```

---

## 결론

new-article 페이지는 **높은 수준의 코드 품질**을 유지하고 있으며, CLAUDE.md 가이드라인과 클린코드 원칙을 대부분 잘 준수하고 있습니다.

주요 개선 사항은:
1. HTTP 요청을 api-client를 통과하도록 수정
2. 비즈니스 로직을 커스텀 훅으로 분리
3. 일부 함수 메모이제이션 추가

이러한 개선 사항을 적용하면 **완벽한 클린코드 품질(100/100)**에 도달할 수 있습니다.

전반적으로 **매우 잘 작성된 코드**이며, 팀의 다른 개발자들이 참고할 만한 우수한 예시입니다. 👏
