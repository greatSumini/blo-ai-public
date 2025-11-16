# Articles Edit Page - 분석 및 개선안

## 1. 현재 상태 분석

### 1.1 페이지 구조

현재 `/articles/[id]/edit` 페이지는 다음과 같은 구조로 구성되어 있습니다:

**메인 컴포넌트**: `src/app/[locale]/(protected)/articles/[id]/edit/page.tsx`

**사용 중인 컴포넌트**:
- `AutoSaveIndicator` - 자동 저장 상태 표시
- `MarkdownPreview` - 마크다운 미리보기
- `TableOfContents` - 목차 (토글 가능)
- `MDEditor` (@uiw/react-md-editor) - 마크다운 에디터

**레이아웃 구성**:
1. **헤더 영역**: 뒤로가기 버튼 + 제목 + 자동저장 상태 + TOC 토글
2. **데스크톱 (lg+)**: 3컬럼 레이아웃 (TOC | 편집기 | 미리보기)
3. **모바일**: 탭 기반 전환 (편집 | 미리보기)

**현재 필드**:
- Title (제목)
- Slug (URL 슬러그)
- Keywords (키워드, 쉼표 구분)
- Description (설명)
- Content (마크다운 콘텐츠)

**기능**:
- 2초 디바운스 자동 저장
- 마크다운 다운로드
- 클립보드 복사
- 실시간 미리보기

### 1.2 강점

✅ **자동 저장 기능**: useAutoSave 훅을 통한 안정적인 자동 저장
✅ **반응형 디자인**: 데스크톱/모바일 각각 최적화된 레이아웃
✅ **실시간 미리보기**: 편집과 동시에 결과 확인 가능
✅ **접근성**: Label과 Input이 올바르게 연결됨
✅ **다국어 지원**: next-intl을 통한 i18n 적용

### 1.3 약점 및 개선 필요 부분

#### 🔴 치명적 문제

1. **UX 일관성 부족**
   - 하드코딩된 배경색 (`style={{ backgroundColor: '#FCFCFD' }}`)
   - 다크모드 미지원
   - 디자인 토큰 미사용

2. **정보 아키텍처 문제**
   - 모든 필드가 한 화면에 나열되어 시각적 혼잡
   - SEO 메타데이터(slug, keywords, description)와 콘텐츠가 구분되지 않음
   - 중요도에 따른 시각적 계층 구조 부재

3. **에디터 UX 문제**
   - MDEditor 고정 높이 (500px/400px)로 스크롤 불편
   - 편집 영역과 미리보기 영역의 동기화된 스크롤 부재
   - 풀스크린 모드 없음
   - 키보드 단축키 부재

#### 🟡 중요 개선 필요

4. **인터랙션 피드백 부족**
   - 필드 변경 시 시각적 피드백 없음
   - 로딩 상태가 단순한 스피너에 불과
   - 에러 상태 UI 부재 (toast만 사용)
   - 저장 성공/실패에 대한 명확한 피드백 부족

5. **접근성 문제**
   - TOC의 padding 클래스가 동적으로 생성되어 Tailwind purge 시 누락 가능
   - 키보드 네비게이션 최적화 부족
   - Focus 상태 시각화 미흡

6. **성능 문제**
   - 모든 상태가 컴포넌트 레벨에서 관리 (과도한 리렌더링 가능성)
   - 마크다운 파싱이 매 렌더링마다 실행 (extractHeadings 메모이제이션 부재)

#### 🟢 부가 개선 사항

7. **기능 부족**
   - 실행 취소/다시 실행 (Undo/Redo) 부재
   - 버전 히스토리 부재
   - 협업 기능 부재
   - 마크다운 템플릿 부재
   - 이미지 업로드 기능 부재
   - 드래그 앤 드롭 지원 부재

8. **애니메이션 부재**
   - 페이지 전환 시 애니메이션 없음
   - 컴포넌트 진입 애니메이션 없음
   - 상태 변화 시 부드러운 전환 없음

---

## 2. 개선된 페이지 구성

### 2.1 전체 레이아웃 개편

```
┌─────────────────────────────────────────────────────────────┐
│ Editor Header (고정)                                         │
│ [← Back] [Title] [Auto-save] [Share] [Publish] [···]        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────┬────────────────────┬──────────────────────┐ │
│ │             │                    │                      │ │
│ │   TOC       │   Editor Pane      │   Preview Pane       │ │
│ │  (토글)     │                    │   (토글/분리 가능)   │ │
│ │             │  ┌──────────────┐  │                      │ │
│ │  - Heading  │  │ Title        │  │  # Rendered          │ │
│ │  - Heading  │  │ (inline)     │  │  ## Content          │ │
│ │             │  └──────────────┘  │                      │ │
│ │             │                    │                      │ │
│ │             │  [SEO Panel 토글]  │                      │ │
│ │             │                    │                      │ │
│ │             │  ┌──────────────┐  │                      │ │
│ │             │  │              │  │                      │ │
│ │             │  │   Markdown   │  │                      │ │
│ │             │  │   Editor     │  │   (동기화된         │ │
│ │             │  │   (fullheight)│  │    스크롤)          │ │
│ │             │  │              │  │                      │ │
│ │             │  └──────────────┘  │                      │ │
│ │             │                    │                      │ │
│ │             │  [Actions Bar]     │                      │ │
│ └─────────────┴────────────────────┴──────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Editor Header Section

**목적**: 글로벌 액션과 상태를 한눈에 파악

**구성 요소**:
```typescript
interface EditorHeaderProps {
  articleId: string;
  title: string;
  autoSaveStatus: AutoSaveStatus;
  onBack: () => void;
  onShare?: () => void;
  onPublish?: () => void;
  onPreviewToggle: () => void;
  onFullscreen?: () => void;
}
```

**주요 기능**:
- 뒤로가기 (cmd+←)
- 문서 제목 (인라인 편집)
- 자동 저장 상태 (개선된 UI)
- 공유 버튼 (향후 협업)
- 게시 버튼 (상태 관리)
- 더보기 메뉴 (설정, 삭제 등)
- 미리보기 토글 (cmd+shift+p)
- 풀스크린 토글 (cmd+shift+f)

### 2.3 SEO Panel (접을 수 있는 영역)

**목적**: SEO 메타데이터를 콘텐츠 편집과 분리하여 집중력 향상

**구성**:
```typescript
interface SEOPanelProps {
  slug: string;
  description: string;
  keywords: string[];
  onSlugChange: (slug: string) => void;
  onDescriptionChange: (desc: string) => void;
  onKeywordsChange: (keywords: string[]) => void;
}
```

**디자인**:
- 기본적으로 접힌 상태 (Collapsed)
- "SEO 설정" 레이블과 화살표 아이콘
- 확장 시 부드러운 애니메이션
- 각 필드에 도움말 텍스트 추가
  - Slug: "URL에 사용될 경로입니다 (예: my-awesome-article)"
  - Description: "검색 엔진 결과에 표시될 설명입니다 (최대 160자)"
  - Keywords: "쉼표로 구분된 키워드를 입력하세요"

### 2.4 Enhanced Editor Pane

**목적**: 최고의 글쓰기 경험 제공

**개선 사항**:
1. **동적 높이**: 고정 높이 제거, viewport 기준 계산
2. **풀스크린 모드**: 에디터만 전체 화면으로
3. **키보드 단축키**:
   - cmd+s: 수동 저장
   - cmd+z/cmd+shift+z: Undo/Redo
   - cmd+b: 굵게
   - cmd+i: 기울임
   - cmd+k: 링크 삽입
   - cmd+shift+c: 코드 블록
4. **드래그 앤 드롭**: 이미지 업로드
5. **템플릿 삽입**: 자주 쓰는 마크다운 스니펫

### 2.5 Synchronized Preview Pane

**목적**: 실시간 결과 확인 및 독자 시점 경험

**개선 사항**:
1. **동기화된 스크롤**: 편집기와 미리보기 스크롤 위치 동기화
2. **토글/분리 모드**:
   - 토글: 미리보기 숨기기/보이기
   - 분리: 새 창에서 열기 (듀얼 모니터 활용)
3. **스타일 프리셋**: 실제 블로그 스타일 적용
4. **반응형 미리보기**: 모바일/태블릿/데스크톱 뷰 전환

### 2.6 Actions Bar

**목적**: 자주 쓰는 액션에 빠르게 접근

**구성**:
```
[워드 카운트: 1,234자] | [읽기 시간: 5분] | [다운로드] [복사] [AI 개선]
```

---

## 3. 참고 레퍼런스 (Modern Editor Best Practices)

claude.ai에 직접 접근할 수 없어, 대신 Notion, Linear, GitHub, VS Code 등 업계 표준 에디터 패턴을 참고합니다.

### 3.1 Notion의 인라인 타이틀 패턴

**레퍼런스 설명**:
- 제목이 별도 입력 필드가 아닌 에디터 상단에 큰 텍스트로 인라인 편집
- 플레이스홀더: "Untitled" 또는 "제목 없음"
- 클릭 시 포커스, 엔터 시 본문으로 이동

**적용 방법**:
```tsx
<div className="mb-6">
  <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder={t('untitled')}
    className="w-full border-0 bg-transparent text-4xl font-bold focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        // 마크다운 에디터로 포커스 이동
      }
    }}
  />
</div>
```

**차별화 포인트**:
- Notion은 블록 기반, 우리는 마크다운 중심
- 제목과 본문의 시각적 분리를 더 명확히

### 3.2 Linear의 Auto-save Indicator

**레퍼런스 설명**:
- 저장 상태가 헤더 우측 상단에 subtle하게 표시
- "Saving...", "Saved", "Failed" 3가지 상태
- 성공 시 체크 아이콘 + fade out 애니메이션

**적용 방법**:
```tsx
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  className="flex items-center gap-2 text-sm"
>
  {isSaving && (
    <>
      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      <span className="text-muted-foreground">{t('saving')}</span>
    </>
  )}
  {!isSaving && !isError && lastSavedAt && (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1.5 text-muted-foreground"
    >
      <Check className="h-3 w-3 text-green-600" />
      <span className="text-xs">
        {formatDistanceToNow(new Date(lastSavedAt), { addSuffix: true })}
      </span>
    </motion.div>
  )}
  {isError && (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1.5 text-destructive"
    >
      <AlertCircle className="h-3 w-3" />
      <span className="text-xs">{t('save_failed')}</span>
    </motion.div>
  )}
</motion.div>
```

**차별화 포인트**:
- 더 상세한 시간 표시 ("2분 전 저장됨")
- 실패 시 재시도 버튼 추가

### 3.3 VS Code의 Split Pane

**레퍼런스 설명**:
- 에디터와 미리보기를 좌우로 분할
- 드래그로 비율 조정 가능
- 탭으로 여러 파일 전환

**적용 방법**:
```tsx
import { Resizable } from 're-resizable';

<Resizable
  defaultSize={{ width: '50%', height: '100%' }}
  minWidth="30%"
  maxWidth="70%"
  enable={{ right: true }}
>
  <EditorPane />
</Resizable>
<PreviewPane />
```

**차별화 포인트**:
- 미리보기를 완전히 숨길 수 있는 옵션
- 레이아웃 프리셋 (50/50, 60/40, 70/30, 100/0)

### 3.4 GitHub의 Markdown Toolbar

**레퍼런스 설명**:
- 에디터 상단에 마크다운 서식 버튼
- Bold, Italic, Link, Code, Quote 등
- 선택 영역에 마크다운 문법 자동 적용

**적용 방법**:
```tsx
<div className="flex items-center gap-1 p-2 border-b">
  <Button size="sm" variant="ghost" onClick={() => applyFormat('bold')}>
    <Bold className="h-4 w-4" />
  </Button>
  <Button size="sm" variant="ghost" onClick={() => applyFormat('italic')}>
    <Italic className="h-4 w-4" />
  </Button>
  <Separator orientation="vertical" className="h-6" />
  <Button size="sm" variant="ghost" onClick={() => applyFormat('link')}>
    <Link className="h-4 w-4" />
  </Button>
  {/* ... */}
</div>
```

**차별화 포인트**:
- 한국어 블로그에 맞는 추가 버튼 (예: 인용 스타일)
- AI 기반 서식 제안

### 3.5 Notion의 Collapsible Sections

**레퍼런스 설명**:
- 섹션을 접고 펼 수 있는 토글 블록
- 화살표 아이콘으로 상태 표시
- 부드러운 높이 애니메이션

**적용 방법**:
```tsx
import * as Collapsible from '@radix-ui/react-collapsible';

<Collapsible.Root defaultOpen={false}>
  <Collapsible.Trigger className="flex items-center gap-2 w-full p-3 hover:bg-accent rounded-md">
    <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
    <span className="font-medium">SEO 설정</span>
  </Collapsible.Trigger>
  <Collapsible.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
    <div className="p-4 space-y-4">
      {/* SEO 필드들 */}
    </div>
  </Collapsible.Content>
</Collapsible.Root>
```

**차별화 포인트**:
- SEO 점수 표시 (slug 유효성, description 길이 등)
- AI 기반 SEO 제안

---

## 4. UI 디자인 컨셉

### 4.1 컬러 시스템

**기존 문제**: 하드코딩된 `#FCFCFD` 배경색 사용

**개선된 컬러 팔레트**:
```typescript
// globals.css에 추가
:root {
  /* Editor-specific colors */
  --editor-bg: 250 250 251; /* zinc-50 */
  --editor-surface: 255 255 255; /* white */
  --editor-border: 228 228 231; /* zinc-200 */

  --editor-text: 9 9 11; /* zinc-950 */
  --editor-text-muted: 113 113 122; /* zinc-500 */
  --editor-text-placeholder: 161 161 170; /* zinc-400 */

  /* Status colors */
  --status-saving: 234 179 8; /* yellow-500 */
  --status-saved: 34 197 94; /* green-500 */
  --status-error: 239 68 68; /* red-500 */

  /* Focus states */
  --focus-ring: 99 102 241; /* indigo-500 */
  --focus-ring-offset: 2px;
}

.dark {
  --editor-bg: 9 9 11; /* zinc-950 */
  --editor-surface: 24 24 27; /* zinc-900 */
  --editor-border: 39 39 42; /* zinc-800 */

  --editor-text: 250 250 250; /* zinc-50 */
  --editor-text-muted: 161 161 170; /* zinc-400 */
  --editor-text-placeholder: 113 113 122; /* zinc-500 */
}
```

**적용 예시**:
```tsx
<div className="min-h-screen bg-[hsl(var(--editor-bg))]">
  <Card className="bg-[hsl(var(--editor-surface))] border-[hsl(var(--editor-border))]">
    <Input className="text-[hsl(var(--editor-text))] placeholder:text-[hsl(var(--editor-text-placeholder))]" />
  </Card>
</div>
```

### 4.2 타이포그래피

**기존 설정**:
```typescript
fontFamily: { sans: ["Pretendard Variable", "sans-serif"] }
fontSize: { sm: "14px", base: "16px", lg: "18px", ... }
```

**에디터 전용 타이포그래피 스케일**:
```css
.editor-title {
  @apply text-4xl font-bold leading-tight tracking-tight;
  /* 36px, -0.02em */
}

.editor-subtitle {
  @apply text-xl font-medium leading-relaxed text-muted-foreground;
  /* 20px, 1.5 */
}

.editor-body {
  @apply text-base leading-relaxed;
  /* 16px, 1.75 */
}

.editor-label {
  @apply text-sm font-medium leading-none;
  /* 14px, 1 */
}

.editor-helper {
  @apply text-xs leading-normal text-muted-foreground;
  /* 12px, 1.5 */
}

.editor-code {
  @apply font-mono text-sm;
  /* Fira Code, 14px */
}
```

**Markdown Preview 스타일**:
```css
.markdown-preview {
  @apply prose prose-zinc prose-lg max-w-none dark:prose-invert;

  /* Custom overrides */
  --tw-prose-headings: hsl(var(--editor-text));
  --tw-prose-body: hsl(var(--editor-text));
  --tw-prose-links: hsl(var(--primary));
  --tw-prose-code: hsl(var(--editor-text));
  --tw-prose-pre-bg: hsl(var(--muted));

  /* 한글 최적화 */
  line-height: 1.8;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### 4.3 간격 시스템

**레이아웃 간격**:
```typescript
const spacing = {
  // Container
  containerPadding: 'px-4 lg:px-6',
  containerMaxWidth: 'max-w-screen-2xl', // 1536px

  // Sections
  sectionGap: 'gap-6 lg:gap-8',
  componentGap: 'gap-4',
  fieldGap: 'gap-3',

  // Editor-specific
  editorPadding: 'p-6 lg:p-8',
  paneGap: 'gap-4 lg:gap-6',

  // Vertical rhythm
  formSpacing: 'space-y-6',
  fieldSpacing: 'space-y-2',
  inlineSpacing: 'space-x-2',
}
```

**적용 예시**:
```tsx
<div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
    <div className="lg:col-span-3">{/* TOC */}</div>
    <div className="lg:col-span-5">{/* Editor */}</div>
    <div className="lg:col-span-4">{/* Preview */}</div>
  </div>
</div>
```

### 4.4 카드/컴포넌트 스타일

**에디터 카드 스타일**:
```typescript
// src/components/ui/editor-card.tsx
const editorCardVariants = cva(
  "rounded-lg border bg-card transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border shadow-sm",
        elevated: "border-border shadow-md hover:shadow-lg",
        ghost: "border-transparent bg-transparent",
        outline: "border-2 border-primary/20 bg-transparent",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);
```

**Input 스타일 개선**:
```typescript
const editorInputVariants = cva(
  "w-full rounded-md border bg-background px-3 py-2 text-sm transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      state: {
        default: "border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 focus-visible:ring-green-500",
      },
      size: {
        sm: "h-9 text-xs",
        md: "h-10 text-sm",
        lg: "h-11 text-base",
      },
    },
    defaultVariants: {
      state: "default",
      size: "md",
    },
  }
);
```

### 4.5 다크모드 고려사항

**현재 문제**:
- 하드코딩된 light 모드 배경색
- MDEditor가 `data-color-mode="light"`로 고정

**개선 방안**:
```tsx
import { useTheme } from 'next-themes';

function ArticleEditor() {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div className="min-h-screen bg-editor-bg">
      {/* ... */}
      <div data-color-mode={currentTheme}>
        <MDEditor
          value={content}
          onChange={setContent}
          previewOptions={{
            className: currentTheme === 'dark' ? 'dark-theme-preview' : undefined
          }}
        />
      </div>
    </div>
  );
}
```

**다크모드 전용 스타일**:
```css
/* globals.css */
.dark .w-md-editor {
  --md-editor-bg: hsl(var(--editor-surface));
  --md-editor-text: hsl(var(--editor-text));
  --md-editor-border: hsl(var(--editor-border));
}

.dark .w-md-editor-toolbar {
  background: hsl(var(--editor-bg));
  border-bottom: 1px solid hsl(var(--editor-border));
}

.dark .w-md-editor-preview {
  background: hsl(var(--editor-surface));
  color: hsl(var(--editor-text));
}
```

---

## 5. 섹션별 컴포넌트 명세

### 5.1 Editor Header

#### EditorHeader Component

**파일**: `src/features/articles/components/editor/editor-header.tsx`

**Props**:
```typescript
interface EditorHeaderProps {
  // Navigation
  onBack: () => void;

  // State
  autoSaveStatus: AutoSaveStatus;
  isPublished: boolean;

  // Actions
  onPublishToggle: () => void;
  onShare?: () => void;
  onPreviewToggle: () => void;
  onFullscreenToggle: () => void;
  onSettingsClick?: () => void;

  // Optional
  className?: string;
}

interface AutoSaveStatus {
  isSaving: boolean;
  isError: boolean;
  lastSavedAt?: string;
}
```

**하위 컴포넌트**:
```
EditorHeader
├── BackButton
├── AutoSaveIndicator (개선 버전)
├── ActionButtons
│   ├── ShareButton
│   ├── PublishButton
│   └── MoreMenu
│       ├── PreviewToggle
│       ├── FullscreenToggle
│       ├── KeyboardShortcuts
│       └── DeleteArticle
└── Separator (구분선)
```

**레이아웃**:
```tsx
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container flex h-16 items-center justify-between px-4">
    <div className="flex items-center gap-4">
      <BackButton onClick={onBack} />
      <Separator orientation="vertical" className="h-6" />
      <AutoSaveIndicator {...autoSaveStatus} />
    </div>

    <ActionButtons
      isPublished={isPublished}
      onPublishToggle={onPublishToggle}
      onShare={onShare}
      onPreviewToggle={onPreviewToggle}
      onFullscreenToggle={onFullscreenToggle}
      onSettingsClick={onSettingsClick}
    />
  </div>
</header>
```

#### BackButton SubComponent

**파일**: 동일 파일 내 export

```typescript
interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

function BackButton({ onClick, label }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">{label || '뒤로'}</span>
    </Button>
  );
}
```

#### Enhanced AutoSaveIndicator

**개선 사항**:
- framer-motion 애니메이션 추가
- 더 명확한 상태 표시
- 재시도 버튼 (에러 시)

```typescript
function AutoSaveIndicator({ isSaving, isError, lastSavedAt }: AutoSaveStatus) {
  const { toast } = useToast();

  const handleRetry = () => {
    // 수동 저장 트리거
    toast({ title: '수동 저장 중...' });
  };

  return (
    <AnimatePresence mode="wait">
      {isSaving && (
        <motion.div
          key="saving"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex items-center gap-2"
        >
          <Loader2 className="h-3 w-3 animate-spin text-yellow-600" />
          <span className="text-xs text-muted-foreground">저장 중...</span>
        </motion.div>
      )}

      {!isSaving && !isError && lastSavedAt && (
        <motion.div
          key="saved"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-1.5"
        >
          <Check className="h-3 w-3 text-green-600" />
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(lastSavedAt), {
              addSuffix: true,
              locale: ko
            })}
          </span>
        </motion.div>
      )}

      {isError && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span className="text-xs text-destructive">저장 실패</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="h-6 px-2 text-xs"
          >
            재시도
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 5.2 SEO Panel Section

#### SEOPanel Component

**파일**: `src/features/articles/components/editor/seo-panel.tsx`

**Props**:
```typescript
interface SEOPanelProps {
  slug: string;
  description: string;
  keywords: string[];

  onSlugChange: (slug: string) => void;
  onDescriptionChange: (description: string) => void;
  onKeywordsChange: (keywords: string[]) => void;

  // AI 제안 (향후)
  onGenerateSlug?: () => Promise<string>;
  onGenerateDescription?: () => Promise<string>;
  onGenerateKeywords?: () => Promise<string[]>;
}
```

**하위 컴포넌트**:
```
SEOPanel (Collapsible)
├── PanelHeader
│   ├── ChevronIcon (rotate on open)
│   ├── Title ("SEO 설정")
│   └── Score Badge (SEO 점수)
└── PanelContent
    ├── SlugField
    │   ├── Label + HelpText
    │   ├── Input (검증 피드백)
    │   └── GenerateButton (AI)
    ├── DescriptionField
    │   ├── Label + CharacterCount
    │   ├── Textarea (max 160)
    │   └── GenerateButton (AI)
    └── KeywordsField
        ├── Label + HelpText
        ├── TagInput (쉼표/엔터로 추가)
        └── GenerateButton (AI)
```

**레이아웃**:
```tsx
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronRight, Sparkles } from 'lucide-react';

function SEOPanel(props: SEOPanelProps) {
  const [open, setOpen] = useState(false);
  const score = calculateSEOScore(props); // 0-100

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="mb-6">
      <Collapsible.Trigger className="flex items-center justify-between w-full p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
        <div className="flex items-center gap-2">
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform",
            open && "rotate-90"
          )} />
          <span className="font-medium">SEO 설정</span>
        </div>
        <SEOScoreBadge score={score} />
      </Collapsible.Trigger>

      <Collapsible.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="p-4 space-y-4 border border-t-0 rounded-b-lg">
          <SlugField
            value={props.slug}
            onChange={props.onSlugChange}
            onGenerate={props.onGenerateSlug}
          />
          <DescriptionField
            value={props.description}
            onChange={props.onDescriptionChange}
            onGenerate={props.onGenerateDescription}
          />
          <KeywordsField
            value={props.keywords}
            onChange={props.onKeywordsChange}
            onGenerate={props.onGenerateKeywords}
          />
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
```

#### SlugField SubComponent

```typescript
interface SlugFieldProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate?: () => Promise<string>;
}

function SlugField({ value, onChange, onGenerate }: SlugFieldProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const isValid = /^[a-z0-9-]+$/.test(value);

  const handleGenerate = async () => {
    if (!onGenerate) return;
    setIsGenerating(true);
    try {
      const generated = await onGenerate();
      onChange(generated);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="slug">URL Slug</Label>
        {onGenerate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-7 gap-1 text-xs"
          >
            <Sparkles className="h-3 w-3" />
            {isGenerating ? '생성 중...' : 'AI 생성'}
          </Button>
        )}
      </div>

      <Input
        id="slug"
        value={value}
        onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
        placeholder="my-awesome-article"
        className={cn(!isValid && value && 'border-destructive')}
      />

      <p className="text-xs text-muted-foreground">
        URL에 사용될 경로입니다. 소문자, 숫자, 하이픈(-)만 허용됩니다.
      </p>

      {!isValid && value && (
        <p className="text-xs text-destructive">
          유효하지 않은 slug입니다. 영문 소문자, 숫자, 하이픈만 사용하세요.
        </p>
      )}
    </div>
  );
}
```

### 5.3 Editor Pane Section

#### EditorPane Component

**파일**: `src/features/articles/components/editor/editor-pane.tsx`

**Props**:
```typescript
interface EditorPaneProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;

  // Toolbar actions
  onDownload: () => void;
  onCopy: () => void;

  // Layout
  isFullscreen?: boolean;
  height?: string | number;

  // Optional features
  enableImageUpload?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}
```

**하위 컴포넌트**:
```
EditorPane
├── TitleInput (인라인, Notion 스타일)
├── SEOPanel (접을 수 있음)
├── MarkdownEditor
│   ├── Toolbar (선택적)
│   │   ├── FormatButtons (B, I, Link, Code, ...)
│   │   └── InsertButtons (Image, Table, ...)
│   └── MDEditor (@uiw/react-md-editor)
│       └── DropZone (이미지 업로드)
└── ActionsBar
    ├── WordCount
    ├── ReadingTime
    ├── DownloadButton
    ├── CopyButton
    └── AIImproveButton (향후)
```

**레이아웃**:
```tsx
function EditorPane(props: EditorPaneProps) {
  const editorHeight = props.isFullscreen
    ? 'calc(100vh - 200px)'
    : 'calc(100vh - 400px)';

  return (
    <div className="flex flex-col gap-4">
      {/* Inline Title */}
      <TitleInput
        value={props.title}
        onChange={props.onTitleChange}
      />

      {/* SEO Panel (Collapsible) */}
      <SEOPanel {...seoProps} />

      {/* Markdown Editor */}
      <div className="relative">
        <MarkdownToolbar
          onFormat={handleFormat}
          onInsert={handleInsert}
        />
        <div data-color-mode={theme}>
          <MDEditor
            value={props.content}
            onChange={props.onContentChange}
            height={editorHeight}
            preview="edit"
            previewOptions={{
              rehypePlugins: [[rehypeHighlight]],
            }}
          />
        </div>

        {props.enableImageUpload && (
          <ImageDropZone onUpload={props.onImageUpload} />
        )}
      </div>

      {/* Actions Bar */}
      <ActionsBar
        content={props.content}
        onDownload={props.onDownload}
        onCopy={props.onCopy}
      />
    </div>
  );
}
```

#### TitleInput SubComponent

```typescript
function TitleInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="제목 없음"
      className="w-full border-0 bg-transparent text-4xl font-bold leading-tight tracking-tight text-editor-text placeholder:text-editor-text-placeholder focus:outline-none focus:ring-0"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          // Focus MDEditor
          const editor = document.querySelector('.w-md-editor-text-input');
          if (editor instanceof HTMLTextAreaElement) {
            editor.focus();
          }
        }
      }}
    />
  );
}
```

#### ActionsBar SubComponent

```typescript
interface ActionsBarProps {
  content: string;
  onDownload: () => void;
  onCopy: () => void;
}

function ActionsBar({ content, onDownload, onCopy }: ActionsBarProps) {
  const wordCount = content.length;
  const readingTime = Math.ceil(wordCount / 500); // 한국어 기준 500자/분
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{wordCount.toLocaleString()}자</span>
        <Separator orientation="vertical" className="h-4" />
        <span>읽기 시간 약 {readingTime}분</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDownload}
          className="h-8 gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">다운로드</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 gap-1.5"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-600" />
              <span className="hidden sm:inline text-green-600">복사됨</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">복사</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
```

### 5.4 Preview Pane Section

#### PreviewPane Component

**파일**: `src/features/articles/components/editor/preview-pane.tsx`

**Props**:
```typescript
interface PreviewPaneProps {
  title: string;
  description?: string;
  content: string;

  // Layout options
  isVisible: boolean;
  onToggle: () => void;
  onPopout?: () => void; // 새 창에서 열기

  // Responsive preview
  viewMode?: 'desktop' | 'tablet' | 'mobile';
  onViewModeChange?: (mode: 'desktop' | 'tablet' | 'mobile') => void;

  // Scroll sync
  scrollRatio?: number; // 0-1
}
```

**하위 컴포넌트**:
```
PreviewPane
├── PreviewHeader
│   ├── Title ("미리보기")
│   ├── ViewModeToggle (Desktop/Tablet/Mobile)
│   ├── PopoutButton
│   └── CloseButton
└── PreviewContent
    ├── ArticleHeader
    │   ├── Title
    │   └── Description
    └── MarkdownPreview (개선 버전)
        └── Rendered Content
```

**레이아웃**:
```tsx
function PreviewPane(props: PreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll sync
  useEffect(() => {
    if (!containerRef.current || !props.scrollRatio) return;
    const maxScroll = containerRef.current.scrollHeight - containerRef.current.clientHeight;
    containerRef.current.scrollTop = maxScroll * props.scrollRatio;
  }, [props.scrollRatio]);

  if (!props.isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full"
    >
      <PreviewHeader
        viewMode={props.viewMode}
        onViewModeChange={props.onViewModeChange}
        onPopout={props.onPopout}
        onClose={props.onToggle}
      />

      <div
        ref={containerRef}
        className={cn(
          "flex-1 overflow-auto rounded-lg border bg-card p-6",
          props.viewMode === 'mobile' && 'max-w-md mx-auto',
          props.viewMode === 'tablet' && 'max-w-2xl mx-auto'
        )}
      >
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">
              {props.title || '제목 없음'}
            </h1>
            {props.description && (
              <p className="mt-4 text-lg text-muted-foreground">
                {props.description}
              </p>
            )}
          </header>

          <MarkdownPreview content={props.content} />
        </article>
      </div>
    </motion.div>
  );
}
```

#### PreviewHeader SubComponent

```typescript
interface PreviewHeaderProps {
  viewMode?: 'desktop' | 'tablet' | 'mobile';
  onViewModeChange?: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onPopout?: () => void;
  onClose: () => void;
}

function PreviewHeader({ viewMode, onViewModeChange, onPopout, onClose }: PreviewHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-muted-foreground">미리보기</h3>

      <div className="flex items-center gap-2">
        {onViewModeChange && (
          <div className="flex items-center gap-0.5 p-0.5 rounded-md border bg-muted">
            <Button
              variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('desktop')}
              className="h-7 px-2"
            >
              <Monitor className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'tablet' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('tablet')}
              className="h-7 px-2"
            >
              <Tablet className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('mobile')}
              className="h-7 px-2"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {onPopout && (
          <Button variant="ghost" size="sm" onClick={onPopout} className="h-7 px-2">
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 px-2">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
```

#### Enhanced MarkdownPreview

**개선 사항**:
- 코드 하이라이팅 개선
- 한글 최적화 (word-break, line-height)
- 커스텀 컴포넌트 (Callout, Tabs 등)
- 다크모드 지원

```tsx
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <div className={cn(
      "prose prose-zinc prose-lg max-w-none dark:prose-invert",
      "prose-headings:scroll-mt-16",
      "prose-pre:bg-muted prose-pre:border",
      "prose-code:text-sm prose-code:font-mono",
      "prose-img:rounded-lg prose-img:shadow-md",
      "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
      "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          // Custom heading with anchor
          h1: ({ children, ...props }) => (
            <h1 id={slugify(String(children))} {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 id={slugify(String(children))} {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 id={slugify(String(children))} {...props}>
              {children}
            </h3>
          ),

          // Custom code block with copy button
          pre: ({ children, ...props }) => (
            <div className="relative group">
              <pre {...props}>{children}</pre>
              <CopyCodeButton code={extractCode(children)} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

### 5.5 Table of Contents Section

#### Enhanced TableOfContents

**파일**: `src/features/articles/components/editor/table-of-contents.tsx`

**개선 사항**:
- 현재 스크롤 위치 추적
- 부드러운 스크롤
- 중첩 레벨에 따른 들여쓰기 (Tailwind safe)
- Active 상태 표시

**Props**:
```typescript
interface TableOfContentsProps {
  headings: Heading[];
  activeHeadingId?: string;
  onHeadingClick?: (id: string) => void;
}

interface Heading {
  level: number; // 1-6
  text: string;
  id: string;
}
```

**레이아웃**:
```tsx
import { useActiveHeading } from '@/hooks/use-active-heading';

function TableOfContents({ headings }: TableOfContentsProps) {
  const activeId = useActiveHeading(headings.map(h => h.id));

  if (headings.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">
          목차가 없습니다
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <List className="h-4 w-4" />
        <h3 className="font-semibold text-sm">목차</h3>
      </div>

      <nav className="space-y-1">
        {headings.map((heading) => (
          <motion.button
            key={heading.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => scrollToHeading(heading.id)}
            className={cn(
              "w-full text-left text-sm transition-all duration-200 rounded-md px-2 py-1.5 hover:bg-accent",
              activeId === heading.id && "bg-accent font-medium text-foreground",
              activeId !== heading.id && "text-muted-foreground"
            )}
            style={{
              paddingLeft: `${(heading.level - 1) * 12 + 8}px`,
            }}
          >
            {heading.text}
          </motion.button>
        ))}
      </nav>
    </Card>
  );
}

function scrollToHeading(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  const offset = 80; // 헤더 높이
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}
```

**Active Heading Hook**:
```typescript
// src/hooks/use-active-heading.ts
import { useEffect, useState } from 'react';

export function useActiveHeading(headingIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    headingIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headingIds]);

  return activeId;
}
```

---

## 6. 애니메이션 명세 (framer-motion)

### 6.1 Page-level Animations

#### Page Enter Animation

```typescript
// src/app/[locale]/(protected)/articles/[id]/edit/page.tsx
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1], // easeOutCubic
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  },
};

export default function EditorPage({ params }: EditorPageProps) {
  // ...

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-editor-bg"
    >
      {/* content */}
    </motion.div>
  );
}
```

### 6.2 Component-level Animations

#### AutoSaveIndicator Animations

```typescript
const indicatorVariants = {
  saving: {
    scale: [1, 1.05, 1],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut",
    },
  },
  saved: {
    scale: [0.9, 1.05, 1],
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  error: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

// 사용
<motion.div
  variants={indicatorVariants}
  animate={isSaving ? 'saving' : isError ? 'error' : 'saved'}
>
  {/* indicator content */}
</motion.div>
```

#### SEO Panel Expand/Collapse

```typescript
// @radix-ui/react-collapsible과 framer-motion 결합
const panelContentVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.2, delay: 0.1 },
    },
  },
};

<motion.div
  variants={panelContentVariants}
  initial="collapsed"
  animate={isOpen ? 'expanded' : 'collapsed'}
>
  <div className="p-4 space-y-4">
    {/* SEO fields */}
  </div>
</motion.div>
```

#### Preview Pane Toggle

```typescript
const previewPaneVariants = {
  hidden: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

<AnimatePresence mode="wait">
  {showPreview && (
    <motion.div
      key="preview-pane"
      variants={previewPaneVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="lg:col-span-4"
    >
      <PreviewPane {...props} />
    </motion.div>
  )}
</AnimatePresence>
```

### 6.3 Micro-interactions

#### Button Hover/Tap

```typescript
const buttonVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

<motion.button
  variants={buttonVariants}
  initial="rest"
  whileHover="hover"
  whileTap="tap"
>
  {children}
</motion.button>
```

#### Input Focus

```typescript
const inputVariants = {
  blur: {
    borderColor: 'hsl(var(--input))',
    boxShadow: 'none',
  },
  focus: {
    borderColor: 'hsl(var(--ring))',
    boxShadow: '0 0 0 2px hsl(var(--ring) / 0.2)',
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// React Hook Form과 결합
<motion.input
  variants={inputVariants}
  animate={isFocused ? 'focus' : 'blur'}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
/>
```

#### Copy Success Feedback

```typescript
const copyButtonVariants = {
  idle: {
    backgroundColor: 'transparent',
  },
  success: {
    backgroundColor: 'hsl(var(--success) / 0.1)',
    transition: {
      duration: 0.2,
    },
  },
};

const copyIconVariants = {
  idle: {
    rotate: 0,
    scale: 1,
  },
  success: {
    rotate: [0, -10, 10, 0],
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.4,
    },
  },
};

<motion.button
  variants={copyButtonVariants}
  animate={copied ? 'success' : 'idle'}
>
  <motion.div
    variants={copyIconVariants}
    animate={copied ? 'success' : 'idle'}
  >
    {copied ? <Check /> : <Copy />}
  </motion.div>
</motion.button>
```

### 6.4 Loading States

#### Skeleton Loading

```typescript
const skeletonVariants = {
  start: {
    backgroundPosition: '200% 0',
  },
  end: {
    backgroundPosition: '-200% 0',
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

function EditorSkeleton() {
  return (
    <div className="space-y-4">
      <motion.div
        variants={skeletonVariants}
        animate="end"
        className="h-12 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted rounded-md"
        style={{ backgroundSize: '200% 100%' }}
      />
      <motion.div
        variants={skeletonVariants}
        animate="end"
        className="h-64 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted rounded-md"
        style={{ backgroundSize: '200% 100%' }}
      />
    </div>
  );
}
```

#### Staggered List Animation

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// TOC 리스트에 적용
<motion.nav
  variants={containerVariants}
  initial="hidden"
  animate="visible"
  className="space-y-1"
>
  {headings.map((heading) => (
    <motion.button
      key={heading.id}
      variants={itemVariants}
    >
      {heading.text}
    </motion.button>
  ))}
</motion.nav>
```

### 6.5 Performance Considerations

#### Layout Shift 방지

```typescript
// ❌ BAD: 레이아웃에 영향을 주는 애니메이션
animate={{ height: 'auto', marginTop: 20 }}

// ✅ GOOD: transform 사용
animate={{ transform: 'translateY(20px)' }}
```

#### Will-Change 최적화

```typescript
<motion.div
  style={{ willChange: 'transform' }}
  animate={{ x: 100 }}
/>
```

#### Layout ID for Shared Transitions

```typescript
// 미리보기 팝업으로 전환 시 부드러운 애니메이션
<motion.div layoutId="preview-content">
  <MarkdownPreview content={content} />
</motion.div>
```

#### Reduced Motion 지원

```typescript
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      };

  return <motion.div variants={variants} />;
}
```

---

## 7. 구현 우선순위

### Phase 1: 핵심 UX 개선 (1-2주)

1. **디자인 토큰 적용**
   - 하드코딩된 색상 제거 (`#FCFCFD` → CSS 변수)
   - 다크모드 지원
   - 타이포그래피 시스템 정리

2. **레이아웃 개선**
   - Inline Title Input (Notion 스타일)
   - SEO Panel을 Collapsible로 분리
   - 에디터 동적 높이 (고정 500px 제거)

3. **Auto-save 피드백 강화**
   - framer-motion 애니메이션 추가
   - 에러 시 재시도 버튼
   - 더 명확한 상태 표시

4. **접근성 개선**
   - TOC의 동적 padding 문제 해결
   - 키보드 네비게이션 강화
   - Focus 상태 시각화

### Phase 2: 기능 확장 (2-3주)

5. **Preview Pane 개선**
   - 토글/분리 모드
   - 반응형 미리보기 (Desktop/Tablet/Mobile)
   - 동기화된 스크롤

6. **Editor Toolbar**
   - 마크다운 서식 버튼
   - 키보드 단축키 지원
   - 템플릿 삽입

7. **Actions Bar**
   - 워드 카운트
   - 읽기 시간 표시
   - 개선된 다운로드/복사

### Phase 3: 고급 기능 (3-4주)

8. **이미지 업로드**
   - 드래그 앤 드롭
   - Supabase Storage 연동
   - 클립보드 붙여넣기

9. **AI 기능**
   - SEO 자동 생성 (slug, description, keywords)
   - 콘텐츠 개선 제안
   - 문법/맞춤법 검사

10. **협업 기능** (Optional)
    - 버전 히스토리
    - 실시간 협업 (향후)
    - 코멘트 시스템

---

## 8. 성공 지표

### 8.1 기술적 지표

- [ ] **다크모드 완벽 지원**: 모든 컴포넌트가 라이트/다크 모드에서 정상 작동
- [ ] **접근성 AAA 등급**: WCAG 2.1 AAA 기준 충족
- [ ] **성능 최적화**:
  - First Contentful Paint < 1.5초
  - Time to Interactive < 3초
  - Lighthouse Performance Score > 90
- [ ] **반응형 디자인**: 모든 디바이스에서 최적화된 경험
- [ ] **애니메이션 60fps**: 모든 애니메이션이 부드럽게 재생

### 8.2 UX 지표

- [ ] **직관적인 레이아웃**: 첫 사용자도 5분 내 글 작성 가능
- [ ] **명확한 피드백**: 모든 액션에 즉각적인 시각적 피드백
- [ ] **효율적인 워크플로우**:
  - 타이틀 입력 → 엔터 → 본문 자동 포커스
  - SEO 설정은 기본적으로 숨김 (선택적 설정)
  - 자동 저장으로 수동 저장 걱정 없음
- [ ] **전문적인 디자인**: Notion, Linear 수준의 완성도

### 8.3 기능 완성도

- [ ] **자동 저장**: 100% 신뢰성, 네트워크 오류 시 재시도
- [ ] **마크다운 지원**: GFM (GitHub Flavored Markdown) 전체 지원
- [ ] **이미지 처리**: 드래그 앤 드롭, 클립보드, URL 모두 지원
- [ ] **SEO 최적화**: Slug 검증, Description 길이 체크, Keywords 제안
- [ ] **다국어 지원**: 한국어/영어 완벽 지원

### 8.4 개발자 경험

- [ ] **컴포넌트 재사용성**: 모든 UI 컴포넌트가 독립적으로 재사용 가능
- [ ] **타입 안정성**: 100% TypeScript, any 타입 0개
- [ ] **테스트 커버리지**: 핵심 로직 > 80%
- [ ] **문서화**: 모든 공개 API에 JSDoc 주석

---

## 9. 추가 고려사항

### 9.1 마이그레이션 전략

**기존 사용자 데이터 보존**:
- 현재 articles 테이블 스키마 유지
- 새 필드 추가 시 nullable 또는 default 값 설정
- 마이그레이션 SQL 작성

**점진적 개선**:
- Feature Flag를 통한 단계적 배포
- A/B 테스트로 사용자 반응 측정
- 기존 에디터와 새 에디터 병행 운영 (일정 기간)

### 9.2 브라우저 호환성

**지원 대상**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Fallback**:
- framer-motion 애니메이션: `prefers-reduced-motion` 지원
- CSS Grid: Flexbox fallback
- Clipboard API: execCommand fallback (이미 구현됨)

### 9.3 모바일 최적화

**터치 인터랙션**:
- 버튼 최소 크기 44x44px (iOS 권장)
- 스와이프 제스처 (미리보기 전환)
- 가상 키보드 대응 (viewport 조정)

**성능 최적화**:
- 코드 스플리팅 (MDEditor dynamic import 이미 적용)
- 이미지 lazy loading
- 마크다운 파싱 debounce

### 9.4 보안

**XSS 방지**:
- `rehype-sanitize` 사용 (이미 적용)
- 사용자 입력 이스케이프
- CSP (Content Security Policy) 설정

**CSRF 방지**:
- Supabase JWT 토큰 검증
- API 요청에 CSRF 토큰 포함

---

## 10. 참고 자료

### 10.1 디자인 시스템

- [Radix UI Primitives](https://www.radix-ui.com/) - Accessible 컴포넌트
- [shadcn/ui](https://ui.shadcn.com/) - 현재 프로젝트에서 사용 중
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 클래스

### 10.2 에디터 레퍼런스

- [Notion](https://notion.so) - Inline title, Block-based editor
- [Linear](https://linear.app) - Auto-save indicator, Keyboard shortcuts
- [GitHub](https://github.com) - Markdown toolbar, Preview pane
- [VS Code](https://code.visualstudio.com/) - Split view, Syntax highlighting

### 10.3 애니메이션

- [Framer Motion](https://www.framer.com/motion/) - React 애니메이션 라이브러리
- [Motion Design Principles](https://m3.material.io/styles/motion/overview) - Material Design 가이드
- [Animation Handbook](https://www.designbetter.co/animation-handbook) - 애니메이션 베스트 프랙티스

### 10.4 접근성

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - 웹 접근성 가이드라인
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - ARIA 패턴
- [a11y Project](https://www.a11yproject.com/) - 접근성 체크리스트

---

## 결론

현재 articles edit 페이지는 기본적인 편집 기능은 잘 갖추고 있으나, **UX 일관성, 정보 아키텍처, 인터랙션 피드백** 측면에서 개선이 필요합니다.

**핵심 개선 방향**:
1. **디자인 토큰 시스템 도입** - 하드코딩된 스타일 제거, 다크모드 지원
2. **정보 계층 구조 개선** - SEO 설정 분리, 인라인 타이틀
3. **인터랙션 강화** - framer-motion 애니메이션, 명확한 피드백
4. **기능 확장** - 이미지 업로드, AI 지원, 협업 기능

이 개선안을 단계적으로 구현하면, **Notion, Linear 수준의 전문적인 에디터 경험**을 제공할 수 있습니다.

---

**다음 단계**:
1. 이 보고서 검토 및 우선순위 합의
2. Phase 1 작업 착수 (1-explore.md에서 상세 컴포넌트 설계)
3. 프로토타입 구현 및 사용자 테스트
