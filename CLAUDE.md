

<!-- Source: .ruler/AGENTS.md -->

# Senior Developer Guidelines

## Must

- always use client component for all components. (use `use client` directive)
- always use promise for page.tsx params props.
- use valid picsum.photos stock image for placeholder image
- route feature hooks' HTTP requests through `@/lib/remote/api-client`.
- Hono 라우트 경로는 반드시 `/api` prefix를 포함해야 함 (Next.js API 라우트가 `/api/[[...hono]]`에 위치하므로). 예: `app.post('/api/auth/signup', ...)`
- `AppLogger`는 `info`, `error`, `warn`, `debug` 메서드만 제공함. `logger.log()` 대신 `logger.info()` 사용할 것.
- API 응답 스키마에서 `redirectTo` 등 경로 필드는 `z.string().url()` 대신 `z.string()` 사용 (상대 경로 허용).
- **Before starting development**: Run `pnpm env:check` to verify `.env.local` is properly configured.

## Library

use following libraries for specific functionalities:

1. `date-fns`: For efficient date and time handling.
2. `ts-pattern`: For clean and type-safe branching logic.
3. `@tanstack/react-query`: For server state management.
4. `zustand`: For lightweight global state management.
5. `react-use`: For commonly needed React hooks.
6. `es-toolkit`: For robust utility functions.
7. `lucide-react`: For customizable icons.
8. `zod`: For schema validation and data integrity.
9. `shadcn-ui`: For pre-built accessible UI components.
10. `tailwindcss`: For utility-first CSS styling.
11. `supabase`: For a backend-as-a-service solution.
12. `react-hook-form`: For form validation and state management.

## Directory Structure

- src
- src/app: Next.js App Routers
- src/app/api/[[...hono]]: Hono entrypoint delegated to Next.js Route Handler (`handle(createHonoApp())`)
- src/backend/hono: Hono 앱 본체 (`app.ts`, `context.ts`)
- src/backend/middleware: 공통 미들웨어 (에러, 컨텍스트, Supabase 등)
- src/backend/http: 응답 포맷, 핸들러 결과 유틸 등 공통 HTTP 레이어
- src/backend/supabase: Supabase 클라이언트 및 설정 래퍼
- src/backend/config: 환경 변수 파싱 및 캐싱
- src/components/ui: shadcn-ui components
- src/constants: Common constants
- src/hooks: Common hooks
- src/lib: utility functions
- src/remote: http client
- src/features/[featureName]/components/\*: Components for specific feature
- src/features/[featureName]/constants/\*
- src/features/[featureName]/hooks/\*
- src/features/[featureName]/backend/route.ts: Hono 라우터 정의
- src/features/[featureName]/backend/service.ts: Supabase/비즈니스 로직
- src/features/[featureName]/backend/error.ts: 상황별 error code 정의
- src/features/[featureName]/backend/schema.ts: 요청/응답 zod 스키마 정의
- src/features/[featureName]/lib/\*: 클라이언트 측 DTO 재노출 등
- supabase/migrations: Supabase SQL migration 파일 (예시 테이블 포함)

## Backend Layer (Hono + Next.js)

- Next.js `app` 라우터에서 `src/app/api/[[...hono]]/route.ts` 를 통해 Hono 앱을 위임한다. 모든 HTTP 메서드는 `handle(createHonoApp())` 로 노출하며 `runtime = 'nodejs'` 로 Supabase service-role 키를 사용한다.
- `src/backend/hono/app.ts` 의 `createHonoApp` 은 싱글턴으로 관리하되, **development 환경에서는 매번 재생성**하여 HMR 시 라우터 변경사항이 반영되도록 한다. (Singleton pattern with HMR compatibility: only cache in production to ensure route changes are reflected during hot reload)
- `src/backend/hono/app.ts` 의 `createHonoApp` 은 싱글턴으로 관리하며 다음 빌딩블록을 순서대로 연결한다.
  1. `errorBoundary()` – 공통 에러 로깅 및 5xx 응답 정규화.
  2. `withAppContext()` – `zod` 기반 환경 변수 파싱, 콘솔 기반 logger, 설정을 `c.set` 으로 주입.
  3. `withSupabase()` – service-role 키로 생성한 Supabase 서버 클라이언트를 per-request로 주입.
  4. `registerExampleRoutes(app)` 등 기능별 라우터 등록 (모든 라우터는 `src/features/[feature]/backend/route.ts` 에서 정의).
- `src/backend/hono/context.ts` 의 `AppEnv` 는 `c.get`/`c.var` 로 접근 가능한 `supabase`, `logger`, `config` 키를 제공한다. 절대 `c.env` 를 직접 수정하지 않는다.
- 공통 HTTP 응답 헬퍼는 `src/backend/http/response.ts`에서 제공하며, 모든 라우터/서비스는 `success`/`failure`/`respond` 패턴을 사용한다.
- 기능별 백엔드 로직은 `src/features/[feature]/backend/service.ts`(Supabase 접근), `schema.ts`(요청/응답 zod 정의), `route.ts`(Hono 라우터)로 분리한다.
- 프런트엔드가 동일 스키마를 사용할 경우 `src/features/[feature]/lib/dto.ts`에서 backend/schema를 재노출해 React Query 훅 등에서 재사용한다.
- 새 테이블이나 시드 데이터는 반드시 `supabase/migrations` 에 SQL 파일로 추가하고, Supabase에 적용 여부를 사용자에게 위임한다.
- 프론트엔드 레이어는 전부 Client Component (`"use client"`) 로 유지하고, 서버 상태는 `@tanstack/react-query` 로만 관리한다.

## Solution Process:

1. Rephrase Input: Transform to clear, professional prompt.
2. Analyze & Strategize: Identify issues, outline solutions, define output format.
3. Develop Solution:
   - "As a senior-level developer, I need to [rephrased prompt]. To accomplish this, I need to:"
   - List steps numerically.
   - "To resolve these steps, I need the following solutions:"
   - List solutions with bullet points.
4. Validate Solution: Review, refine, test against edge cases.
5. Evaluate Progress:
   - If incomplete: Pause, inform user, await input.
   - If satisfactory: Proceed to final output.
6. Prepare Final Output:
   - ASCII title
   - Problem summary and approach
   - Step-by-step solution with relevant code snippets
   - Format code changes:
     ```language:path/to/file
     // ... existing code ...
     function exampleFunction() {
         // Modified or new code here
     }
     // ... existing code ...
     ```
   - Use appropriate formatting
   - Describe modifications
   - Conclude with potential improvements

## Key Mindsets:

1. Simplicity
2. Readability
3. Maintainability
4. Testability
5. Reusability
6. Functional Paradigm
7. Pragmatism

## Code Guidelines:

1. Early Returns
2. Conditional Classes over ternary
3. Descriptive Names
4. Constants > Functions
5. DRY
6. Functional & Immutable
7. Minimal Changes
8. Pure Functions
9. Composition over inheritance

## Functional Programming:

- Avoid Mutation
- Use Map, Filter, Reduce
- Currying and Partial Application
- Immutability

## Code-Style Guidelines

- Use TypeScript for type safety.
- Follow the coding standards defined in the ESLint configuration.
- Ensure all components are responsive and accessible.
- Use Tailwind CSS for styling, adhering to the defined color palette.
- When generating code, prioritize TypeScript and React best practices.
- Ensure that any new components are reusable and follow the existing design patterns.
- Minimize the use of AI generated comments, instead use clearly named variables and functions.
- Always validate user inputs and handle errors gracefully.
- Use the existing components and pages as a reference for the new components and pages.

## Performance:

- Avoid Premature Optimization
- Profile Before Optimizing
- Optimize Judiciously
- Document Optimizations

## Comments & Documentation:

- Comment function purpose
- Use JSDoc for JS
- Document "why" not "what"

## Function Ordering:

- Higher-order functionality first
- Group related functions

## Handling Bugs:

- Use TODO: and FIXME: comments

## Error Handling:

- Use appropriate techniques
- Prefer returning errors over exceptions

## Testing:

### Test-Driven Development (TDD)

- Follow the **RED → GREEN → REFACTOR** process:
  1. **RED**: Write a failing test first
  2. **GREEN**: Write minimal code to make it pass
  3. **REFACTOR**: Improve code quality while keeping tests green

### E2E Testing

- Write E2E tests for **all specifications** using Playwright
- E2E tests should validate complete user workflows
- Place E2E tests in `e2e/` directory with `.spec.ts` extension
- Refer to `.ruler/test.md` for E2E testing guidelines

### Unit Testing

- Extract business logic into **pure functions** whenever possible
- Write unit tests for all pure functions and complex logic
- Place unit tests next to source files with `.test.ts` or `.test.tsx` extension
- Use Vitest and Testing Library for unit testing
- Focus on behavior, not implementation details

### Testing Guidelines

- See `.ruler/test.md` for comprehensive testing guidelines
- Avoid testing implementation details (overfitting)
- Use accessible queries (getByRole, getByLabelText) over test IDs
- Ensure tests are independent and isolated

### Test Commands

- `pnpm test` - Run unit tests only
- `pnpm test:e2e` - Run E2E tests only
- `pnpm test:all` - **Run unit and E2E tests concurrently (recommended for CI/CD)**
- Use `pnpm test:all` for fast parallel test execution

## Environment Variables

### Validation

- Run `pnpm env:check` to validate `.env.local` configuration
- This command checks all required environment variables using zod schemas
- Always run this before development or deployment

### Required Variables

Must be set in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_URL` - Supabase project URL (server-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side)

### Usage

```bash
# Validate environment variables
pnpm env:check

# If validation fails, check error output for missing/invalid variables
# Update .env.local accordingly and re-run validation
```

## Next.js

- you must use promise for page.tsx params props.

## Shadcn-ui

- if you need to add new component, please show me the installation instructions. I'll paste it into terminal.
- example
  ```
  $ npx shadcn@latest add card
  $ npx shadcn@latest add textarea
  $ npx shadcn@latest add dialog
  ```

## Supabase

- if you need to add new table, please create migration. I'll paste it into supabase.
- do not run supabase locally
- store migration query for `.sql` file. in /supabase/migrations/

## Package Manager

- use pnpm as package manager.

## Korean Text

- 코드를 생성한 후에 utf-8 기준으로 깨지는 한글이 있는지 확인해주세요. 만약 있다면 수정해주세요.
- 항상 한국어로 응답하세요.

You are a senior full-stack developer, one of those rare 10x devs. Your focus: clean, maintainable, high-quality code.
Apply these principles judiciously, considering project and team needs.

`example` page, table is just example.



<!-- Source: .ruler/design.md -->

# UI/UX Design Guide

## 개요

본 디자인 시스템은 **Claude.ai**의 디자인 철학을 기반으로 하며, **명료함(Clarity)**, **일관성(Consistency)**, **친근함(Approachability)**을 핵심 가치로 삼습니다.

### 핵심 원칙

1. **모듈성**: 재사용 가능한 컴포넌트 기반 설계
2. **일관성**: 체계적인 디자인 토큰 시스템
3. **확장성**: 다크/라이트 모드 완벽 지원
4. **접근성**: WCAG 2.1 AA 레벨 준수
5. **성능**: 최적화된 애니메이션과 전환 효과

---

## 1. 색상 시스템 (Color System)

### 색상 철학

- **중립성**: 회색 스케일을 기반으로 한 차분하고 전문적인 느낌
- **의미론적 색상**: 용도에 따른 명확한 색상 분류
- **테마 지원**: 라이트/다크 모드 자동 전환

### 색상 구조

```typescript
// 색상 시스템은 2계층으로 구성됩니다:
// 1. Swatch (기본 팔레트) - 실제 색상 값
// 2. Theme (의미론적 토큰) - 용도별 색상 참조
```

#### Primary Colors (중립 팔레트)

Tailwind CSS의 `slate` 계열을 기본으로 사용하되, 필요시 CSS 변수로 확장:

- **배경색**:
  - `bg-background` (라이트: slate-50, 다크: slate-950)
  - `bg-secondary` (라이트: slate-100, 다크: slate-900)
  - `bg-tertiary` (라이트: slate-150, 다크: slate-850)

- **텍스트색**:
  - `text-foreground` (라이트: slate-950, 다크: slate-50)
  - `text-muted-foreground` (라이트: slate-600, 다크: slate-400)

- **테두리색**:
  - `border` (라이트: slate-300, 다크: slate-600)

#### Accent & Semantic Colors

```typescript
// Accent (브랜드 강조색)
const accentColors = {
  primary: '#C46849',      // 히어로 섹션, 주요 CTA
  toggle: '#d97757',       // 토글, 활성 상태
}

// Semantic (의미 전달 색상)
const semanticColors = {
  error: '#df6666',        // 오류, 경고
  success: '#10b981',      // 성공, 완료
  warning: '#f59e0b',      // 주의, 대기
  info: '#3b82f6',         // 정보, 안내
}
```

### 사용 가이드

#### DO ✅

```tsx
// 1. 의미론적 색상 토큰 사용
<div className="bg-background text-foreground border border-border">
  <p className="text-muted-foreground">보조 텍스트</p>
</div>

// 2. 다크 모드 자동 대응 (dark: prefix 사용)
<button className="bg-slate-100 dark:bg-slate-800">
  Button
</button>

// 3. Accent 색상은 중요한 액션에만 사용
<button className="bg-[#C46849] text-white hover:bg-[#b05a3e]">
  Get Started
</button>
```

#### DON'T ❌

```tsx
// 1. 하드코딩된 색상 직접 사용 금지
<div style={{ backgroundColor: '#f0f0f0' }}>

// 2. 의미 없는 색상 조합
<button className="bg-red-500 text-yellow-300">
  // 의미 전달이 불명확

// 3. 과도한 accent 색상 사용
<div className="bg-[#C46849]">
  <h1 className="text-[#d97757]">  // accent on accent
```

---

## 2. 타이포그래피 (Typography)

### 폰트 패밀리

프로젝트의 본문 가독성과 브랜드 톤을 고려하여 3가지 폰트 카테고리를 정의합니다:

```typescript
const fontFamily = {
  sans: ['Pretendard Variable', 'system-ui', 'sans-serif'],   // 본문, UI
  serif: ['Georgia', 'serif'],                                // 제목, 감성 강조
  mono: ['JetBrains Mono', 'monospace'],                      // 코드, 터미널
}
```

### 타이포그래피 스케일

```typescript
// 제목 (Headings)
h1: 'text-4xl md:text-5xl font-medium leading-tight'           // 48px → 60px
h2: 'text-3xl md:text-4xl font-medium leading-tight'           // 36px → 48px
h3: 'text-2xl md:text-3xl font-medium leading-snug'            // 24px → 36px
h4: 'text-xl md:text-2xl font-medium leading-snug'             // 20px → 24px
h5: 'text-lg md:text-xl font-medium leading-normal'            // 18px → 20px

// 본문 (Body)
body1: 'text-base leading-relaxed'                             // 16px, 주요 본문
body2: 'text-sm leading-relaxed'                               // 14px, 버튼/라벨
body3: 'text-xs leading-normal'                                // 12px, 캡션/메타

// 특수 (Special)
caption: 'text-xs text-muted-foreground'                       // 보조 정보
code: 'font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded'
```

### 사용 가이드

#### DO ✅

```tsx
// 1. 제목은 의미론적 HTML 태그 + Tailwind 클래스 조합
<h1 className="text-4xl md:text-5xl font-medium leading-tight">
  Meet your thinking partner
</h1>

// 2. 본문은 가독성을 위한 line-height 적용
<p className="text-base leading-relaxed text-muted-foreground">
  Tackle any big, bold, bewildering challenge with Claude.
</p>

// 3. 코드는 mono 폰트 + 배경색으로 구분
<code className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
  npm install
</code>
```

#### DON'T ❌

```tsx
// 1. 불규칙한 폰트 크기 사용
<p className="text-[17px]">  // 정의되지 않은 크기

// 2. 의미 없는 태그 사용
<div className="text-4xl font-bold">  // h1 태그를 사용해야 함

// 3. 과도하게 긴 줄 길이
<p className="w-full">  // max-w-prose 등으로 제한 필요
```

---

## 3. 간격 시스템 (Spacing)

### Spacing Scale

Tailwind의 기본 스케일(4px 기준)을 따르되, 주요 간격을 명시합니다:

```typescript
// 컴포넌트 내부 여백 (Padding)
p-1    // 4px   - 아이콘 버튼
p-2    // 8px   - 작은 버튼
p-3    // 12px  - 작은 카드
p-4    // 16px  - 기본 버튼, 카드
p-6    // 24px  - 큰 카드
p-8    // 32px  - 섹션 내부

// 컴포넌트 간 간격 (Margin/Gap)
gap-2  // 8px   - 인라인 요소 (아이콘-텍스트)
gap-4  // 16px  - 버튼 그룹, 폼 필드
gap-6  // 24px  - 카드 그리드
gap-8  // 32px  - 섹션 간 간격
gap-12 // 48px  - 대섹션 간 간격
gap-16 // 64px  - 페이지 주요 구획

// 섹션 여백 (Section Padding)
section: 'py-16 md:py-24'  // 상하 64px → 96px
hero: 'pt-24 pb-16 md:pt-32 md:pb-24'  // 히어로 섹션 특별 처리
```

### 사용 가이드

#### DO ✅

```tsx
// 1. 일관된 간격 스케일 사용
<div className="flex gap-4">
  <button className="p-4">Button 1</button>
  <button className="p-4">Button 2</button>
</div>

// 2. 섹션 간격은 반응형으로
<section className="py-16 md:py-24">
  {/* content */}
</section>

// 3. 컨테이너는 좌우 패딩 추가
<div className="container mx-auto px-4 md:px-6">
```

#### DON'T ❌

```tsx
// 1. 불규칙한 간격 값
<div className="p-[13px]">  // 스케일에 없는 값

// 2. 중첩된 간격 누적
<div className="p-8">
  <div className="p-8">  // 의도하지 않은 과도한 여백

// 3. 반응형 고려 없는 고정 간격
<section className="py-32">  // 모바일에서 너무 큼
```

---

## 4. 레이아웃 (Layout)

### 컨테이너 시스템

```tsx
// 기본 컨테이너 (최대 너비 제한)
<div className="container mx-auto px-4 md:px-6 max-w-7xl">

// 읽기용 콘텐츠 (좁은 컨테이너)
<div className="container mx-auto px-4 max-w-prose">

// 전체 너비 (히어로, 미디어 섹션)
<div className="w-full">
```

### 그리드 시스템

```tsx
// 반응형 그리드 (모바일 1열 → 태블릿 2열 → 데스크탑 3열)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>

// 비대칭 그리드 (콘텐츠 + 사이드바)
<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
  <main>{/* content */}</main>
  <aside>{/* sidebar */}</aside>
</div>
```

### Breakpoints

Tailwind 기본 브레이크포인트 사용:

```typescript
sm: '640px'    // 모바일 가로, 작은 태블릿
md: '768px'    // 태블릿
lg: '1024px'   // 데스크탑
xl: '1280px'   // 큰 데스크탑
2xl: '1536px'  // 초대형 화면
```

---

## 5. 컴포넌트 (Components)

### Button

```tsx
// Variants
const buttonVariants = {
  // Primary (주요 액션)
  primary: 'bg-foreground text-background hover:opacity-90',

  // Secondary (보조 액션)
  secondary: 'bg-secondary text-foreground hover:bg-tertiary',

  // Outline (경계 강조)
  outline: 'border-2 border-border bg-transparent hover:bg-secondary',

  // Ghost (최소 스타일)
  ghost: 'hover:bg-secondary',
}

// Sizes
const buttonSizes = {
  sm: 'px-3 py-1.5 text-xs',      // 작은 버튼
  md: 'px-4 py-2 text-sm',        // 기본 버튼
  lg: 'px-6 py-3 text-base',      // 큰 버튼
}

// Usage
<Button variant="primary" size="lg">
  Get Started
</Button>
```

### Card

```tsx
// 기본 카드 스타일
<div className="rounded-lg border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
  <h3 className="text-xl font-medium mb-2">Card Title</h3>
  <p className="text-muted-foreground">Card description</p>
</div>

// 링크 카드 (전체 클릭 가능)
<a
  href="/link"
  className="block rounded-lg border border-border bg-background p-6 hover:bg-secondary hover:shadow-md transition-all duration-300"
>
  {/* content */}
</a>
```

### Input

```tsx
// 텍스트 입력
<input
  type="text"
  className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#C46849] focus:border-transparent"
  placeholder="Enter your text..."
/>

// 텍스트 영역
<textarea
  className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#C46849] focus:border-transparent resize-none"
  rows={4}
  placeholder="Write something..."
/>
```

---

## 6. 애니메이션 & 전환 (Motion)

### 전환 속도 (Duration)

```typescript
// 즉각 반응 (버튼 클릭, 토글)
fastest: '25ms'   // 텍스트 색상
faster: '50ms'    // 배경색, 그림자
fast: '100ms'     // 버튼 호버

// 일반 전환 (메뉴, 모달)
normal: '200ms'   // 드롭다운 메뉴
slow: '300ms'     // 툴팁, 링크

// 레이아웃 변경 (탭, 패널)
slower: '500ms'   // 탭 전환, 네비게이션
```

### Easing Functions

```typescript
ease-in-out: 'cubic-bezier(0.4, 0, 0.2, 1)'        // 버튼 상태
ease-out: 'cubic-bezier(0, 0, 0.2, 1)'             // 링크 전환
expo-out: 'cubic-bezier(0.16, 1, 0.3, 1)'          // 드롭다운, 모달
```

### 사용 예시

```tsx
// 1. 버튼 상태 전환
<button className="bg-foreground text-background transition-all duration-100 ease-in-out hover:opacity-90 active:scale-95">
  Click me
</button>

// 2. 카드 호버 효과
<div className="rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
  {/* content */}
</div>

// 3. 메뉴 열림/닫힘
<div className="transform transition-transform duration-300 ease-expo-out data-[state=open]:translate-y-0 data-[state=closed]:-translate-y-2">
  {/* menu */}
</div>
```

### 애니메이션 원칙

1. **자연스러움**: 모든 상태 변화는 애니메이션되어야 함
2. **성능**: `transform`과 `opacity`만 애니메이션 (레이아웃 리플로우 방지)
3. **일관성**: 유사한 인터랙션은 동일한 duration과 easing 사용
4. **접근성**: `prefers-reduced-motion` 미디어 쿼리 존중

```tsx
// prefers-reduced-motion 대응
<div className="transition-transform duration-300 motion-reduce:transition-none">
  {/* content */}
</div>
```

---

## 7. 다크 모드 (Dark Mode)

### 구현 방식

`next-themes` 라이브러리를 사용하여 시스템 설정 기반 자동 전환:

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 색상 정의

```tsx
// Tailwind config에서 CSS 변수 기반 색상 정의
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... 기타 색상
      }
    }
  }
}

// globals.css
@layer base {
  :root {
    --background: 210 40% 98%;        /* slate-50 */
    --foreground: 222.2 84% 4.9%;     /* slate-950 */
    /* ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;     /* slate-950 */
    --foreground: 210 40% 98%;        /* slate-50 */
    /* ... */
  }
}
```

### 사용 가이드

```tsx
// ✅ DO: CSS 변수 기반 색상 사용 (자동 전환)
<div className="bg-background text-foreground">

// ✅ DO: 직접 dark: variant 사용 (필요 시)
<div className="bg-slate-100 dark:bg-slate-800">

// ❌ DON'T: 하드코딩된 색상
<div style={{ backgroundColor: '#ffffff' }}>
```

---

## 8. 접근성 (Accessibility)

### 키보드 네비게이션

모든 인터랙티브 요소는 키보드로 접근 가능해야 합니다:

```tsx
// ✅ DO: focus-visible 스타일 정의
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46849] focus-visible:ring-offset-2">
  Accessible Button
</button>

// ✅ DO: Skip to content 링크 제공
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:rounded"
>
  Skip to main content
</a>
```

### ARIA 속성

```tsx
// ✅ DO: 의미론적 HTML + ARIA 속성
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
>
  <XIcon />
</button>

// ✅ DO: 폼 레이블 연결
<label htmlFor="email" className="text-sm font-medium">
  Email
</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
/>
<p id="email-error" className="text-xs text-error">
  {error}
</p>
```

### 색상 대비

WCAG 2.1 AA 기준 (4.5:1 이상) 준수:

```tsx
// ✅ DO: 충분한 대비 확보
<p className="text-foreground">  // slate-950 on slate-50 = 16.1:1

// ❌ DON'T: 낮은 대비
<p className="text-slate-400 bg-slate-300">  // 대비 부족
```

---

## 9. 반응형 디자인 (Responsive Design)

### 모바일 우선 (Mobile First)

```tsx
// ✅ DO: 기본 스타일은 모바일, 점진적으로 확장
<div className="px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
  <h1 className="text-3xl md:text-4xl lg:text-5xl">
    Responsive Heading
  </h1>
</div>

// ❌ DON'T: 데스크탑 우선 접근
<div className="px-8 sm:px-4">  // 작은 화면에 과도한 여백
```

### 컨테이너 쿼리 활용

개별 컴포넌트의 반응형 제어:

```tsx
// ✅ DO: 컴포넌트 자체 크기에 따른 스타일 변경
<div className="@container">
  <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-4">
    <Card />
    <Card />
    <Card />
  </div>
</div>
```

### 이미지 최적화

```tsx
// ✅ DO: Next.js Image 컴포넌트 사용
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  className="w-full h-auto"
  priority  // LCP 최적화
/>

// ✅ DO: 반응형 이미지 (srcset 자동 생성)
<Image
  src="/card.jpg"
  alt="Card image"
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

---

## 10. 패턴 라이브러리 (Pattern Library)

### Hero Section

```tsx
<section className="relative py-24 md:py-32 bg-background">
  <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6">
      Meet your thinking partner
    </h1>
    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
      Tackle any big, bold, bewildering challenge with Claude.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button variant="primary" size="lg">Get Started</Button>
      <Button variant="outline" size="lg">Learn More</Button>
    </div>
  </div>
</section>
```

### Feature Grid

```tsx
<section className="py-16 md:py-24 bg-secondary">
  <div className="container mx-auto px-4 md:px-6">
    <h2 className="text-3xl md:text-4xl font-medium text-center mb-12">
      The AI for problem solvers
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <div
          key={feature.id}
          className="rounded-lg border border-border bg-background p-6 hover:shadow-md transition-shadow duration-300"
        >
          <feature.Icon className="w-10 h-10 mb-4 text-[#C46849]" />
          <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
          <p className="text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Tab Component

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

<Tabs defaultValue="learn" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="learn">Learn</TabsTrigger>
    <TabsTrigger value="code">Code</TabsTrigger>
    <TabsTrigger value="create">Create</TabsTrigger>
  </TabsList>

  <TabsContent value="learn" className="mt-6">
    {/* content */}
  </TabsContent>

  <TabsContent value="code" className="mt-6">
    {/* content */}
  </TabsContent>

  <TabsContent value="create" className="mt-6">
    {/* content */}
  </TabsContent>
</Tabs>
```

---

## 11. AI 개발자를 위한 체크리스트

새로운 페이지/컴포넌트 개발 시 다음 사항을 확인하세요:

### 색상 & 테마
- [ ] `bg-background`, `text-foreground` 등 의미론적 색상 토큰 사용
- [ ] 다크 모드에서 정상 작동 확인 (`dark:` variant 또는 CSS 변수)
- [ ] Accent 색상(`#C46849`)은 주요 CTA에만 사용

### 타이포그래피
- [ ] 정의된 텍스트 스케일 사용 (`text-4xl`, `text-base` 등)
- [ ] 의미론적 HTML 태그 사용 (`h1`, `h2`, `p` 등)
- [ ] 가독성을 위한 `leading-relaxed`, `max-w-prose` 적용

### 간격 & 레이아웃
- [ ] Tailwind 스케일에 맞는 간격 사용 (`gap-4`, `p-6` 등)
- [ ] 반응형 간격 적용 (`py-16 md:py-24`)
- [ ] 컨테이너로 최대 너비 제한 (`max-w-7xl`, `max-w-prose`)

### 반응형
- [ ] 모바일 우선 접근 (기본 → `md:` → `lg:`)
- [ ] 주요 브레이크포인트에서 테스트 (375px, 768px, 1024px)
- [ ] 이미지는 Next.js `Image` 컴포넌트 사용

### 애니메이션
- [ ] 상태 전환에 `transition-*` 클래스 적용
- [ ] 적절한 duration 선택 (버튼: 100ms, 카드: 300ms)
- [ ] `motion-reduce:transition-none` 추가 (접근성)

### 접근성
- [ ] 키보드 네비게이션 가능 (`focus-visible:ring-2`)
- [ ] ARIA 속성 적절히 사용 (`aria-label`, `aria-expanded`)
- [ ] 색상 대비 4.5:1 이상 확보
- [ ] 폼 레이블 `htmlFor`로 연결

### 성능
- [ ] 이미지 최적화 (`priority`, `sizes` 속성)
- [ ] 불필요한 리렌더링 방지 (`useMemo`, `useCallback`)
- [ ] 애니메이션은 `transform`/`opacity`만 사용

---

## 12. 참고 자료

### 디자인 시스템 기반
- **Claude.ai** (https://claude.ai/product/overview)
- **shadcn/ui** (https://ui.shadcn.com)
- **Tailwind CSS** (https://tailwindcss.com)

### 접근성
- **WCAG 2.1 Guidelines** (https://www.w3.org/WAI/WCAG21/quickref/)
- **ARIA Authoring Practices** (https://www.w3.org/WAI/ARIA/apg/)

### 애니메이션
- **Material Design Motion** (https://m3.material.io/styles/motion/overview)
- **Framer Motion** (https://www.framer.com/motion/)

---

**마지막 업데이트**: 2025-11-17
**버전**: 1.0.0
**유지 관리자**: AI Development Team



<!-- Source: .ruler/supabase.md -->

---
description: Supabase Migration SQL Guideline
globs: supabase/migrations/*.sql
---

# Supabase Migration SQL Guideline

## Must

- Each migration file must have a unique name with number prefix (e.g., `0001_create_users_table.sql`)
- Each migration must be idempotent (can be run multiple times without error)
- Use `CREATE TABLE IF NOT EXISTS` instead of just `CREATE TABLE`
- Include proper error handling with `BEGIN` and `EXCEPTION` blocks
- Add comments for complex operations
- Always specify column types explicitly
- Include proper constraints (NOT NULL, UNIQUE, etc.) where appropriate
- Add updated_at column to all tables, and use trigger to update it
- always check other migrations to avoid conflicts

## Should

- Keep migrations small
- Use consistent naming conventions for tables and columns
- Use snake_case for all identifiers
- Document breaking changes
- MUST NOT use RLS. disable it for all tables

## Recommended Patterns

- Set up proper indexes for frequently queried columns
- Use foreign key constraints to maintain referential integrity
- Leverage Postgres extensions when appropriate
- Use enums for fields with a fixed set of values
- Consider using views for complex queries

## Schema Organization

- Group related tables together
- Use schemas to organize tables by domain
- Consider using Postgres schemas for multi-tenant applications
- Keep authentication tables in the auth schema

## Performance Considerations

- Avoid adding/removing columns from large tables in production
- Use appropriate data types to minimize storage
- Add indexes strategically (not excessively)

## Security Best Practices

- Never store plaintext passwords
- Sanitize/validate all user inputs
