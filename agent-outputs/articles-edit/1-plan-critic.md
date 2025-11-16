# 페이지 개선안 검토 및 개선

## 1. 원안 요약

0번 단계에서 제안된 Articles Edit 페이지 개선안은 다음과 같은 방향성을 제시했습니다:

### 주요 개선 방향
1. **디자인 토큰 시스템 도입**: 하드코딩된 `#FCFCFD` 배경색 제거, 다크모드 지원
2. **정보 아키텍처 개선**: SEO 설정을 Collapsible Panel로 분리, Notion 스타일 인라인 타이틀
3. **에디터 UX 강화**: 동적 높이, 풀스크린 모드, 키보드 단축키
4. **미리보기 개선**: 동기화된 스크롤, 반응형 미리보기 모드
5. **애니메이션 추가**: framer-motion 기반 페이지/컴포넌트 애니메이션
6. **고급 기능**: 이미지 업로드, AI 기능, 협업 기능

### 레퍼런스
Notion, Linear, VS Code, GitHub의 패턴을 차용

---

## 2. 비판적 검토

### 2.1 사용자 경험 (UX)

#### ❌ 문제점

**1. 과도한 복잡성**
- 원안은 Editor Header, SEO Panel, Editor Pane, Preview Pane, TOC 등 **5개 이상의 주요 섹션**을 제안
- 현재 페이지는 이미 **단순하고 직관적**한 구조인데, 오히려 복잡도를 높이는 방향
- **실제 사용 시나리오**를 고려하면, 블로그 글 작성자는 "빠르게 글을 쓰고 저장"하는 것이 핵심
- Notion 스타일 인라인 타이틀, SEO Collapsible Panel 등은 **학습 곡선을 높임**

**2. 정보 아키텍처의 모순**
- SEO 설정을 "선택적"으로 숨기는 것은 좋지만, **TOC는 기본적으로 보이게 하는 것이 더 실용적**
- 현재 구조: TOC는 토글, SEO는 항상 노출
- 제안 구조: SEO는 토글, TOC는 항상 노출
- 이는 **우선순위가 역전**된 것 (SEO 설정보다 TOC가 더 자주 사용됨)

**3. 모바일 경험 간과**
- 원안은 데스크톱 중심 설계 (3-column layout, Preview Pane 분리 등)
- 현재 코드는 이미 **모바일에서 Tabs로 전환**하는 반응형 구조
- 제안된 "반응형 미리보기 (Desktop/Tablet/Mobile)" 는 **실제로 에디터 페이지에서 필요한 기능이 아님**
  - 블로그 글은 이미 반응형으로 작성되며, 최종 결과는 실제 블로그에서 확인
  - 에디터에서 디바이스별 미리보기는 과도한 기능

**4. CTA 부재**
- 개선안에는 "게시" 버튼이 헤더에 추가되었으나, **저장과 게시의 관계가 명확하지 않음**
- 자동 저장이 있다면, 게시 버튼은 **별도의 상태 관리**가 필요
- 현재 코드에는 게시 개념이 없음 (articles 테이블 확인 필요)

#### ✅ 개선안

**1. 정보 위계 재조정**
```
우선순위: 제목/콘텐츠 > TOC > SEO 설정 > 부가 기능
```

- **TOC는 항상 보이게 (데스크톱)**: 글 구조 파악에 필수
- **SEO 설정은 Collapsible로 숨김**: 초벌 작성 시 불필요, 퍼블리시 전 최종 점검용
- **미리보기는 토글 가능**: 현재처럼 좌우 분할이 아닌 오른쪽 슬라이드 패널

**2. 단순화된 레이아웃**
```
Desktop:
[TOC (fixed, 20%)] | [Editor (flex)] | [Preview (slide-in, 40%)]

Mobile:
[Tabs: Edit | Preview]
```

- 3-column이 아닌 **2-column + 슬라이드 패널**
- 미리보기를 항상 노출하지 않고 **필요시 열기** (초안 작성 시 방해 최소화)

**3. 모바일 최적화 유지**
- 현재 Tabs 구조 유지 (검증된 UX)
- 제안된 "반응형 미리보기 모드"는 **제거** (불필요)

**4. 게시 워크플로우 명확화**
- 자동 저장: 초안 저장 (draft)
- 게시 버튼: `published` 상태로 전환 + 유효성 검사
- 게시 시 필수 항목 체크 (title, slug, description)

---

### 2.2 메시징 전략

#### ❌ 문제점

**1. AI 기능의 과도한 강조**
- SEO 자동 생성, 콘텐츠 개선 제안 등 AI 기능이 **Phase 3**에 포함
- 현재 프로젝트에 AI SDK가 있지만, **실제 구현 여부 불확실**
- AI 기능은 **별도의 백엔드 로직과 비용**이 필요하므로 우선순위에서 제외해야 함

**2. 협업 기능의 비현실성**
- 버전 히스토리, 실시간 협업, 코멘트 시스템은 **개인 블로그 에디터에 과도한 기능**
- 실시간 협업은 **WebSocket 등 추가 인프라** 필요
- 우선순위에서 완전히 제외해야 함

#### ✅ 개선안

**1. 핵심 메시지 집중**
- "빠르고 안정적인 마크다운 에디터"
- "자동 저장으로 걱정 없는 글쓰기"
- "깔끔한 미리보기로 퍼블리시 전 최종 확인"

**2. 현실적 기능 범위**
- AI 기능: 삭제 (또는 매우 먼 미래로 연기)
- 협업 기능: 삭제
- 이미지 업로드: Phase 2로 조정 (Supabase Storage 확인 필요)

---

### 2.3 시각적 디자인

#### ❌ 문제점

**1. 과도한 디자인 토큰**
- 원안은 `--editor-bg`, `--editor-surface`, `--editor-border` 등 **에디터 전용 CSS 변수**를 추가 제안
- 현재 globals.css에 이미 **완성도 높은 디자인 토큰**이 존재 (`--background`, `--card`, `--muted` 등)
- **불필요한 중복**: 기존 토큰으로 충분히 표현 가능

**2. 타이포그래피 클래스 남용**
- `.editor-title`, `.editor-subtitle`, `.editor-body` 등 **커스텀 유틸리티 클래스** 제안
- Tailwind CSS 철학(유틸리티 우선)과 **충돌**
- 이미 `text-4xl font-bold`, `text-xl font-medium` 등으로 표현 가능

**3. 다크모드 구현의 복잡성**
- 원안은 `useTheme` 훅으로 현재 테마를 감지하고 MDEditor에 전달
- **이미 globals.css에 `.dark` 클래스 기반 다크모드가 구현되어 있음**
- MDEditor의 `data-color-mode`는 단순히 `"light"` 또는 `"dark"`로 설정하면 됨
- `next-themes`를 사용하므로 전역 상태로 관리 가능

#### ✅ 개선안

**1. 기존 디자인 토큰 재사용**
```tsx
// ❌ 원안
<div className="bg-[hsl(var(--editor-bg))]">

// ✅ 개선안
<div className="bg-background">
```

- 하드코딩된 `#FCFCFD`를 `bg-background`로 대체
- 별도의 에디터 전용 토큰 **불필요**

**2. Tailwind 유틸리티 클래스 사용**
```tsx
// ❌ 원안
<input className="editor-title" />

// ✅ 개선안
<input className="text-4xl font-bold leading-tight tracking-tight" />
```

**3. 단순화된 다크모드**
```tsx
// 현재 next-themes가 이미 설치되어 있음
import { useTheme } from 'next-themes';

function Editor() {
  const { resolvedTheme } = useTheme(); // "light" | "dark"

  return (
    <div data-color-mode={resolvedTheme}>
      <MDEditor ... />
    </div>
  );
}
```

---

### 2.4 기술적 실현 가능성

#### ❌ 문제점

**1. 동기화된 스크롤의 복잡성**
- 에디터와 미리보기의 스크롤 동기화는 **마크다운 구조 파싱 + 위치 매핑**이 필요
- MDEditor는 이미 내장 미리보기가 있으며, **동기화 구현이 복잡함**
- ROI(투자 대비 효과)가 낮음: 대부분 사용자는 탭 전환 또는 단순 미리보기만 사용

**2. 풀스크린 모드의 구현 난이도**
- 브라우저 Fullscreen API는 **사용자 제스처(클릭) 필요**
- 단순히 `height: 100vh`로 구현하는 것과 혼동 가능성
- 원안에서는 명확한 명세 부재

**3. 키보드 단축키의 충돌 가능성**
- MDEditor 자체가 이미 **단축키를 제공** (cmd+b, cmd+i 등)
- 커스텀 단축키 추가 시 **기존 단축키와 충돌** 가능
- 단축키 설정 UI 필요 (복잡도 증가)

**4. 이미지 업로드의 불확실성**
- Supabase Storage 사용 여부 **미확인**
- 업로드 후 URL 생성 로직 필요
- 드래그 앤 드롭, 클립보드 붙여넣기는 **추가 구현 필요**
- Phase 2에 배치되었으나 **실현 가능성 검증 필요**

**5. re-resizable 의존성 추가**
- 원안은 `re-resizable` 라이브러리 사용 제안
- **새로운 의존성 추가**는 번들 크기 증가
- 현재 프로젝트에 없는 라이브러리이며, **필수성 낮음**

#### ✅ 개선안

**1. 동기화된 스크롤 제거**
- 구현 복잡도가 높고 실용성 낮음
- 미리보기는 **독립적인 스크롤**로 충분

**2. 의사(Pseudo) 풀스크린**
- Fullscreen API 대신 **CSS 기반 전체 화면 모드**
  ```tsx
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={cn(
      isFullscreen && "fixed inset-0 z-50 bg-background"
    )}>
      {/* Editor */}
    </div>
  );
  ```
- 더 간단하고 안정적

**3. 기본 단축키만 활용**
- MDEditor의 내장 단축키 사용
- 커스텀 단축키는 **cmd+s (수동 저장)** 정도만 추가
- 단축키 충돌 방지

**4. 이미지 업로드 검증 후 결정**
- Supabase Storage 버킷 생성 및 정책 설정 확인 필요
- Phase 2가 아닌 **Phase 3 또는 별도 이슈**로 분리

**5. 불필요한 의존성 제거**
- `re-resizable` 대신 **CSS Grid** 또는 **Flexbox** 활용
- 미리보기 너비 조정 기능은 **우선순위 낮음**

---

### 2.5 claude.ai 벤치마킹

#### ❌ 문제점

**1. 레퍼런스 불일치**
- 원안은 "claude.ai에 직접 접근할 수 없어" Notion, Linear 등을 레퍼런스로 사용
- 그러나 **블로그 에디터와 프로젝트 관리 도구는 본질적으로 다름**
- Linear의 Auto-save Indicator는 참고할 만하지만, Notion의 블록 에디터는 **마크다운 에디터와 철학이 다름**

**2. 차별화 포인트 부재**
- 원안에서 제시한 "차별화 포인트"가 **추가 기능 나열**에 불과
  - "더 상세한 시간 표시"
  - "AI 기반 서식 제안"
  - "SEO 점수 표시"
- 진정한 차별화는 **심플함과 안정성**

**3. 과도한 기능 차용**
- VS Code의 Split Pane, GitHub의 Markdown Toolbar 등을 **모두 구현하려는 시도**
- 각 레퍼런스의 **핵심 강점**만 차용해야 하는데, 모든 기능을 혼합

#### ✅ 개선안

**1. 명확한 레퍼런스 선정**
- **GitHub Issues/PR 에디터**: 마크다운 중심, 미리보기 탭, 간결함
- **Notion**: 인라인 타이틀 (이것만 차용)
- **Linear**: Auto-save 피드백 (이것만 차용)
- **VS Code**: 제외 (코드 에디터와 블로그 에디터는 다름)

**2. 진정한 차별화**
- **즉시 저장**: 2초 디바운스 + 네트워크 재시도
- **심플한 UI**: 불필요한 기능 제거, 글쓰기에 집중
- **완벽한 다크모드**: MDEditor 포함 모든 요소

**3. 핵심 패턴만 차용**
```
GitHub: 마크다운 에디터 + 미리보기 탭
Notion: 인라인 타이틀 입력
Linear: 상태 피드백 애니메이션
```

---

## 3. 개선된 최종 계획

### 3.1 페이지 구성 (수정안)

#### Desktop Layout (lg+)
```
┌─────────────────────────────────────────────────────────┐
│ Fixed Header                                            │
│ [← Back] [Auto-save Status]               [Preview ⚙] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────┬─────────────────────────────────────────────┐│
│ │        │                                             ││
│ │  TOC   │  Editor Area                                ││
│ │ (20%)  │  ┌───────────────────────────────────────┐  ││
│ │        │  │ Title (inline, 4xl, bold)             │  ││
│ │        │  └───────────────────────────────────────┘  ││
│ │        │                                             ││
│ │        │  ┌─ SEO Settings (Collapsible) ─────────┐  ││
│ │        │  │ Slug, Description, Keywords          │  ││
│ │        │  └──────────────────────────────────────┘  ││
│ │        │                                             ││
│ │        │  ┌───────────────────────────────────────┐  ││
│ │        │  │                                       │  ││
│ │        │  │   Markdown Editor                     │  ││
│ │        │  │   (dynamic height)                    │  ││
│ │        │  │                                       │  ││
│ │        │  └───────────────────────────────────────┘  ││
│ │        │                                             ││
│ │        │  [Word Count] [Download] [Copy]             ││
│ └────────┴─────────────────────────────────────────────┘│
│                                                          │
│  [Preview Panel - Slide from Right] (optional)          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ # Preview Title                                  │   │
│  │ Rendered markdown content...                     │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

#### Mobile Layout
```
┌─────────────────────────────┐
│ [← Back] [Auto-save]        │
├─────────────────────────────┤
│ Tabs: [Edit] | [Preview]   │
├─────────────────────────────┤
│                             │
│ Title                       │
│ SEO (Collapsible)           │
│ Markdown Editor             │
│                             │
│ [Download] [Copy]           │
│                             │
└─────────────────────────────┘
```

### 3.2 UI 디자인 컨셉 (수정안)

#### 컬러 시스템
**기존 토큰 재사용** (새로운 CSS 변수 추가하지 않음)

```tsx
// 배경
className="bg-background"  // 기존: style={{ backgroundColor: '#FCFCFD' }}

// 카드
className="bg-card border-border"

// 음영
className="text-muted-foreground"
```

#### 다크모드
```tsx
import { useTheme } from 'next-themes';

const { resolvedTheme } = useTheme();

<div data-color-mode={resolvedTheme || 'light'}>
  <MDEditor ... />
</div>
```

#### 타이포그래피
Tailwind 유틸리티 클래스 사용 (커스텀 클래스 제거)

```tsx
// 타이틀
<input className="w-full text-4xl font-bold leading-tight tracking-tight border-0 bg-transparent focus:outline-none" />

// 레이블
<Label className="text-sm font-medium" />

// 도움말
<p className="text-xs text-muted-foreground" />
```

### 3.3 컴포넌트 명세 (수정안)

#### 1. EditorHeader (간소화)
```typescript
interface EditorHeaderProps {
  onBack: () => void;
  autoSaveStatus: AutoSaveStatus;
  onPreviewToggle: () => void;
  showPreview: boolean;
}
```

**하위 컴포넌트**:
- BackButton
- AutoSaveIndicator (개선 버전 - framer-motion 애니메이션)
- PreviewToggle (Desktop만)

**제거된 요소**:
- ~~ShareButton~~ (협업 기능 제거)
- ~~PublishButton~~ (별도 검토 필요)
- ~~FullscreenToggle~~ (단순화)
- ~~SettingsMenu~~ (불필요)

#### 2. SEOPanel (Collapsible)
```typescript
interface SEOPanelProps {
  slug: string;
  description: string;
  keywords: string[];
  onSlugChange: (slug: string) => void;
  onDescriptionChange: (description: string) => void;
  onKeywordsChange: (keywords: string[]) => void;
}
```

**기능**:
- 기본적으로 접힌 상태 (초안 작성 시 방해 최소화)
- Radix UI Collapsible 사용 (애니메이션 내장)
- Slug 유효성 검증 (실시간 피드백)
- Description 글자 수 카운트 (0/160)

**제거된 요소**:
- ~~AI 생성 버튼~~ (AI 기능 제거)
- ~~SEO 점수 Badge~~ (과도한 기능)

#### 3. EditorPane (단순화)
```typescript
interface EditorPaneProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}
```

**구성**:
- TitleInput (인라인, Notion 스타일)
- SEOPanel (Collapsible)
- MDEditor (동적 높이)
- ActionsBar (워드 카운트, 다운로드, 복사)

**제거된 요소**:
- ~~Markdown Toolbar~~ (MDEditor 내장 도구 사용)
- ~~이미지 업로드~~ (Phase 3로 연기)
- ~~템플릿 삽입~~ (불필요)

#### 4. PreviewPane (슬라이드 패널)
```typescript
interface PreviewPaneProps {
  title: string;
  description?: string;
  content: string;
  isVisible: boolean;
  onClose: () => void;
}
```

**특징**:
- 오른쪽에서 슬라이드 인 (framer-motion)
- 독립적인 스크롤 (동기화 제거)
- Desktop만 사용 (Mobile은 Tabs 유지)

**제거된 요소**:
- ~~반응형 미리보기 모드~~ (Desktop/Tablet/Mobile 전환 제거)
- ~~Popout 버튼~~ (불필요)
- ~~동기화된 스크롤~~ (복잡도 높음)

#### 5. TableOfContents (개선)
```typescript
interface TableOfContentsProps {
  headings: Heading[];
}
```

**개선 사항**:
- Active Heading 추적 (IntersectionObserver)
- 부드러운 스크롤
- **인라인 스타일 제거** (Tailwind purge 안전성)
  ```tsx
  // ❌ 원안
  style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}

  // ✅ 개선안
  className={cn(
    "pl-2",  // level 1
    heading.level === 2 && "pl-4",
    heading.level === 3 && "pl-6",
    heading.level === 4 && "pl-8",
  )}
  ```

### 3.4 애니메이션 명세 (수정안)

#### 필수 애니메이션만 유지

**1. AutoSaveIndicator**
```tsx
const variants = {
  saving: { opacity: [0.5, 1, 0.5], transition: { repeat: Infinity, duration: 1.5 } },
  saved: { scale: [0.9, 1.1, 1], transition: { duration: 0.3 } },
  error: { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } },
};
```

**2. SEO Panel (Collapsible)**
- Radix UI Collapsible의 내장 애니메이션 사용 (`data-state`)
- 커스텀 애니메이션 불필요

**3. Preview Panel (Slide)**
```tsx
const variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 20 } },
};
```

**제거된 애니메이션**:
- ~~페이지 진입 애니메이션~~ (불필요한 지연)
- ~~TOC 리스트 Stagger~~ (과도함)
- ~~Button Hover/Tap~~ (기본 CSS로 충분)
- ~~Skeleton Loading~~ (로딩은 단순 스피너로 충분)

---

## 4. 주요 변경 사항 요약

### 추가된 요소

1. **SEO Collapsible Panel**
   - 초안 작성 시 방해 최소화
   - Radix UI Collapsible 사용

2. **인라인 타이틀 입력**
   - Notion 스타일
   - Enter 시 마크다운 에디터로 포커스 이동

3. **개선된 AutoSaveIndicator**
   - framer-motion 애니메이션
   - 더 명확한 상태 표시

4. **다크모드 지원**
   - MDEditor 포함 모든 요소
   - next-themes 활용

5. **미리보기 슬라이드 패널**
   - 오른쪽에서 슬라이드 인
   - Desktop만 제공

### 제거된 요소

1. ~~AI 기능 (SEO 생성, 콘텐츠 개선)~~
2. ~~협업 기능 (버전 히스토리, 실시간 협업, 코멘트)~~
3. ~~이미지 업로드~~ (Phase 3로 연기)
4. ~~동기화된 스크롤~~
5. ~~반응형 미리보기 모드 (Desktop/Tablet/Mobile)~~
6. ~~풀스크린 모드~~ (CSS 기반 전체 화면으로 대체 가능)
7. ~~커스텀 단축키~~ (MDEditor 내장 활용)
8. ~~Markdown Toolbar~~ (MDEditor 내장 활용)
9. ~~에디터 전용 CSS 변수~~ (기존 토큰 재사용)
10. ~~커스텀 타이포그래피 클래스~~ (Tailwind 유틸리티 사용)

### 수정된 요소

1. **레이아웃**: 3-column → 2-column + 슬라이드 패널
2. **TOC**: 토글 → 항상 노출 (Desktop)
3. **Preview**: 항상 노출 → 슬라이드 패널
4. **컬러 시스템**: 커스텀 변수 → 기존 토큰 재사용
5. **타이포그래피**: 커스텀 클래스 → Tailwind 유틸리티
6. **다크모드**: 복잡한 구현 → next-themes 간단 활용

---

## 5. 기대 효과

### UX 개선
1. **집중력 향상**: 불필요한 요소 제거, 글쓰기에 집중
2. **정보 위계 명확화**: TOC 항상 노출, SEO는 선택적
3. **다크모드 지원**: 눈의 피로 감소, 야간 사용성 향상

### 개발 효율성
1. **기존 시스템 재사용**: 새로운 CSS 변수, 클래스 불필요
2. **의존성 최소화**: re-resizable, AI SDK 등 제거
3. **유지보수성 향상**: 단순한 구조, 명확한 컴포넌트 분리

### 성능 개선
1. **불필요한 애니메이션 제거**: 60fps 보장
2. **동기화 로직 제거**: 렌더링 부담 감소
3. **번들 크기 최소화**: 불필요한 라이브러리 제거

---

## 6. 리스크 및 고려사항

### 기술적 리스크

**1. Supabase Storage 미확인**
- 이미지 업로드 기능을 Phase 3로 연기했으나, Storage 설정 여부 확인 필요
- 버킷 생성, RLS 정책, 공개 URL 생성 로직 필요

**2. Articles 테이블 스키마 확인 필요**
- `published` 필드 존재 여부 확인
- 게시 워크플로우 구현 시 마이그레이션 필요 가능성

**3. next-themes SSR 이슈**
- 서버 렌더링 시 테마 깜빡임 가능
- `suppressHydrationWarning` 필요할 수 있음

### UX 리스크

**1. 인라인 타이틀의 학습 곡선**
- 기존 사용자가 "제목 입력란"을 찾지 못할 가능성
- 플레이스홀더로 명확히 표시 ("제목을 입력하세요...")

**2. SEO 설정 발견성**
- Collapsible로 숨겨두면 초보 사용자가 찾지 못할 수 있음
- 초기 온보딩 또는 툴팁 필요 가능성

**3. 모바일 경험 저하 가능성**
- 인라인 타이틀이 모바일에서 키보드와 겹칠 수 있음
- 테스트 필수

### 구현 리스크

**1. MDEditor 다크모드 스타일**
- `data-color-mode="dark"` 설정 후 스타일 검증 필요
- 커스텀 CSS 오버라이드 필요할 수 있음

**2. Radix UI Collapsible 애니메이션**
- `data-state` 기반 애니메이션이 부드럽지 않을 수 있음
- 필요시 framer-motion과 결합

**3. Preview Panel 성능**
- 큰 마크다운 문서에서 렌더링 성능 저하 가능
- 가상 스크롤 또는 lazy rendering 고려

---

## 7. 구현 우선순위 (재조정)

### Phase 1: 핵심 UX/UI 개선 (1주)

**목표**: 시각적 일관성 확보, 다크모드 지원, 정보 아키텍처 개선

1. **하드코딩 제거 및 디자인 토큰 적용**
   - `style={{ backgroundColor: '#FCFCFD' }}` → `className="bg-background"`
   - `data-color-mode="light"` → `data-color-mode={resolvedTheme}`

2. **다크모드 구현**
   - `useTheme` 훅 사용
   - MDEditor 다크모드 CSS 검증 및 오버라이드

3. **인라인 타이틀 입력**
   - Notion 스타일 대형 입력란
   - Enter 키로 마크다운 에디터 포커스

4. **SEO Collapsible Panel**
   - Radix UI Collapsible 사용
   - Slug 유효성 검증
   - Description 글자 수 카운트

5. **AutoSaveIndicator 개선**
   - framer-motion 애니메이션
   - 상태별 아이콘 및 메시지

**성공 기준**:
- [ ] 모든 하드코딩 제거
- [ ] 라이트/다크 모드 완벽 전환
- [ ] SEO 설정이 기본적으로 숨겨짐
- [ ] 타이틀 → 마크다운 에디터 포커스 전환 작동

### Phase 2: 레이아웃 및 미리보기 개선 (1주)

**목표**: 2-column 레이아웃, 슬라이드 미리보기 패널

1. **Desktop 레이아웃 재구성**
   - TOC 항상 노출 (20% 너비)
   - 에디터 영역 (flex)
   - 미리보기 슬라이드 패널 (40% 너비)

2. **미리보기 슬라이드 패널**
   - framer-motion 슬라이드 애니메이션
   - 토글 버튼 (헤더)
   - 독립적인 스크롤

3. **TOC 개선**
   - Active Heading 추적 (IntersectionObserver)
   - 부드러운 스크롤
   - Tailwind safe 인덴트 (인라인 스타일 제거)

4. **동적 높이 에디터**
   - `calc(100vh - header - footer)` 계산
   - 고정 500px/400px 제거

**성공 기준**:
- [ ] Desktop에서 TOC 항상 보임
- [ ] 미리보기 슬라이드 부드럽게 작동
- [ ] Active Heading 추적 정확함
- [ ] 에디터 높이가 화면에 맞춤

### Phase 3: 선택적 기능 (향후 검토)

**검토 필요**:
1. **이미지 업로드** (Supabase Storage 확인 후)
2. **게시 워크플로우** (articles 테이블 스키마 확인 후)
3. **의사 풀스크린 모드** (사용자 요청 시)

**제외**:
- ~~AI 기능~~
- ~~협업 기능~~
- ~~동기화된 스크롤~~
- ~~반응형 미리보기 모드~~

---

## 8. 마이그레이션 전략

### 단계적 적용

**Step 1: 스타일 개선 (비파괴적)**
- 하드코딩 제거 → 기존 토큰
- 다크모드 추가
- 기존 기능 유지

**Step 2: 레이아웃 전환 (파괴적 가능성)**
- Desktop 레이아웃 변경
- 미리보기 패널 추가
- A/B 테스트 권장 (Feature Flag)

**Step 3: 새 기능 추가**
- SEO Collapsible
- 인라인 타이틀
- 점진적 배포

### 하위 호환성

**보존**:
- 모바일 Tabs 구조 (검증됨)
- 자동 저장 로직 (안정적)
- 마크다운 다운로드/복사 (유용)

**변경**:
- Desktop 레이아웃 (3-pane → 2-pane + slide)
- 타이틀 입력 (별도 필드 → 인라인)

---

## 9. 테스트 계획

### Unit Tests
- `extractHeadings` 함수 (정확성)
- `downloadMarkdown`, `copyToClipboard` 함수
- SEO Panel Slug 검증 로직

### E2E Tests
```typescript
test.describe('Article Editor', () => {
  test('should auto-save changes', async ({ page }) => {
    // 제목 입력 → 2초 대기 → 저장 확인
  });

  test('should toggle preview panel', async ({ page }) => {
    // Preview 버튼 클릭 → 패널 표시 확인
  });

  test('should validate SEO slug', async ({ page }) => {
    // 유효하지 않은 slug 입력 → 에러 메시지 확인
  });

  test('should switch theme', async ({ page }) => {
    // 다크모드 전환 → MDEditor 테마 변경 확인
  });
});
```

### Visual Regression Tests
- 라이트/다크 모드 스크린샷 비교
- 미리보기 패널 열림/닫힘 상태

---

## 10. 성공 지표 (재조정)

### 기술적 지표
- [x] 하드코딩 0개 (모든 색상이 CSS 변수)
- [x] 다크모드 완벽 지원 (MDEditor 포함)
- [x] 불필요한 의존성 0개 (re-resizable 등 제거)
- [x] Lighthouse Performance Score > 90

### UX 지표
- [x] 초기 학습 시간 < 2분 (인라인 타이틀 발견)
- [x] 자동 저장 신뢰도 100% (네트워크 오류 재시도)
- [x] SEO 설정 접근성 (Collapsible 발견 및 사용)

### 개발 지표
- [x] 컴포넌트 재사용성 (모든 컴포넌트 독립적)
- [x] 타입 안정성 (`any` 타입 0개)
- [x] 코드 중복 최소화 (DRY 원칙)

---

## 결론

### 원안의 주요 문제점
1. **과도한 복잡성**: 5개 이상의 주요 섹션, AI/협업 기능 등
2. **비현실적 기능**: 동기화된 스크롤, 반응형 미리보기 모드
3. **불필요한 추상화**: 에디터 전용 CSS 변수, 커스텀 타이포그래피 클래스
4. **레퍼런스 오용**: VS Code, Notion 등 다른 맥락의 패턴 혼합

### 개선된 계획의 핵심
1. **단순함 우선**: 글쓰기에 집중, 불필요한 기능 제거
2. **기존 시스템 재사용**: CSS 변수, Tailwind 유틸리티, Radix UI
3. **현실적 범위**: AI/협업 제거, 이미지 업로드 연기
4. **명확한 우선순위**: Phase 1 (1주), Phase 2 (1주), Phase 3 (검토)

### 다음 단계
1. ✅ Phase 1 작업 착수 (하드코딩 제거, 다크모드, SEO Collapsible)
2. ⏳ articles 테이블 스키마 확인 (published 필드 여부)
3. ⏳ Supabase Storage 설정 확인 (이미지 업로드 준비)
4. ⏳ 프로토타입 구현 및 사용자 테스트

---

**최종 권장사항**: 원안의 **30% 정도만 실제 구현**하고, 나머지는 **과도한 기능**으로 판단하여 제외합니다. "심플하고 안정적인 마크다운 에디터"라는 핵심 가치에 집중합니다.
