# (Protected) 페이지 전체 UI/UX 개선 계획

## 목차
1. [개요](#개요)
2. [현재 상태 분석](#현재-상태-분석)
3. [디자인 시스템 정의](#디자인-시스템-정의)
4. [컴포넌트 시스템 재설계](#컴포넌트-시스템-재설계)
5. [레이아웃 시스템 개선](#레이아웃-시스템-개선)
6. [구현 로드맵](#구현-로드맵)
7. [성공 지표](#성공-지표)

---

## 개요

### 목표
Claude Console의 세련되고 일관된 디자인 시스템을 벤치마크하여 IndieBlog의 모든 (protected) 페이지를 전문적이고 통일된 UI/UX로 개선합니다.

### 핵심 철학
1. **다크 모드 우선 (Dark Mode First)**: 다크 모드를 기본으로 설계, 라이트 모드 완벽 지원
2. **토큰 기반 시스템**: 모든 디자인 요소를 CSS 변수(토큰)로 관리
3. **절제된 모션**: 미묘하고 일관된 애니메이션으로 사용자 경험 향상
4. **접근성 우선**: WCAG 2.1 AA 준수, 키보드 네비게이션 완벽 지원

### 대상 페이지 (9개)
1. `/dashboard` - 대시보드
2. `/articles` - 글 목록
3. `/articles/[id]/edit` - 글 편집
4. `/new-article` - 새 글 작성
5. `/style-guide` - 스타일 가이드 목록
6. `/style-guides/new` - 스타일 가이드 생성
7. `/style-guides/[id]/edit` - 스타일 가이드 편집
8. `/account` - 계정 설정
9. `/keywords` - 키워드 관리

---

## 현재 상태 분석

### 강점 ✅
- ✅ 기본적인 반응형 그리드 시스템 구현
- ✅ i18n 다국어 지원 완벽 적용
- ✅ React Query 기반 효율적 데이터 관리
- ✅ 일부 페이지에서 애니메이션 적용

### 약점 ❌ (우선순위별)

#### P0 - 심각 (즉시 수정 필요)
1. **일관성 없는 색상 시스템**
   - 하드코딩된 hex 색상 광범위 사용 (`#3BA2F8`, `#F0F9FF` 등)
   - 페이지마다 다른 색상 팔레트 사용
   - 다크 모드 부분 지원 또는 미지원

2. **레이아웃 구조 부재**
   - 페이지마다 다른 컨테이너 너비, 여백
   - 공통 레이아웃 컴포넌트 미비
   - 사이드바/헤더 네비게이션 부재

3. **타이포그래피 불일치**
   - 페이지마다 다른 제목 크기, font-weight
   - 임의의 폰트 크기 사용 (`text-[16px]`)

#### P1 - 높음 (1주 내)
1. **간격 시스템 불규칙**
   - 페이지마다 다른 섹션 간격
   - 컴포넌트 내부 여백 불일치

2. **접근성 미흡**
   - focus-visible 스타일 일부 누락
   - ARIA 속성 미적용
   - 키보드 네비게이션 일관성 부족

3. **애니메이션 표준 부재**
   - 인라인 스타일로 애니메이션 정의
   - motion-reduce 미대응
   - duration, easing 불일치

#### P2 - 중간 (2주 내)
1. **컴포넌트 재사용성 낮음**
   - 유사한 UI를 페이지마다 중복 구현
   - 공통 컴포넌트 라이브러리 부족

2. **상태 피드백 부족**
   - 로딩, 에러, 빈 상태 UI 불일치
   - 사용자 액션에 대한 시각적 피드백 부족

---

## 디자인 시스템 정의

### 1. 색상 시스템 (Color Tokens)

Claude Console의 정교한 HSL 색상 시스템을 참고하여 확장합니다.

#### globals.css 확장

```css
@layer base {
  :root {
    /* === Existing Tokens === */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;

    /* === New Tokens (Claude Console Style) === */

    /* Background Layers */
    --bg-primary: 53 28.6% 94.5%;        /* Main content bg */
    --bg-secondary: 48 33.3% 97.1%;      /* Page background */
    --bg-tertiary: 60 2.1% 18.4%;        /* Elevated surfaces */
    --bg-hover: 60 2.7% 14.5%;           /* Hover states */

    /* Text Hierarchy */
    --text-primary: 60 2.6% 7.6%;        /* Main text */
    --text-secondary: 60 2.5% 23.3%;     /* Secondary info */
    --text-tertiary: 48 4.8% 59.2%;      /* Subtle text */
    --text-disabled: 45 0.6% 48%;        /* Disabled */

    /* Border & Divider */
    --border-default: 51 16.5% 84.5%;
    --border-subtle: 50 9% 73.7%;

    /* Semantic Colors */
    --success: 97 59.1% 46.1%;
    --success-bg: 97 59.1% 96%;
    --warning: 38 92% 50%;
    --warning-bg: 38 92% 95%;
    --danger: 0 98.4% 75.1%;
    --danger-bg: 0 98.4% 97%;
    --info: 210 65.5% 67.1%;
    --info-bg: 210 65.5% 95%;

    /* Brand Accent (Keep existing #C46849) */
    --accent-brand: 15 63.1% 59.6%;      /* #C46849 */
    --accent-pro: 251 84.6% 74.5%;       /* Pro features */
  }

  .dark {
    /* === Existing Dark Tokens === */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;

    /* === New Dark Tokens (Claude Console Style) === */

    /* Background Layers */
    --bg-primary: 30 3.3% 11.8%;         /* Main content bg */
    --bg-secondary: 60 2.7% 14.5%;       /* Page background */
    --bg-tertiary: 60 2.1% 18.4%;        /* Elevated surfaces */
    --bg-hover: 60 2.1% 21%;             /* Hover states */

    /* Text Hierarchy */
    --text-primary: 48 33.3% 97.1%;      /* Main text */
    --text-secondary: 50 9% 73.7%;       /* Secondary info */
    --text-tertiary: 48 4.8% 59.2%;      /* Subtle text */
    --text-disabled: 45 0.6% 48%;        /* Disabled */

    /* Border & Divider */
    --border-default: 60 2.1% 25%;
    --border-subtle: 60 2.1% 30%;

    /* Semantic Colors (Dark adjusted) */
    --success: 97 59.1% 46.1%;
    --success-bg: 97 59.1% 15%;
    --warning: 38 92% 50%;
    --warning-bg: 38 92% 15%;
    --danger: 0 98.4% 75.1%;
    --danger-bg: 0 98.4% 15%;
    --info: 210 65.5% 67.1%;
    --info-bg: 210 65.5% 15%;

    /* Brand Accent (same in dark) */
    --accent-brand: 15 63.1% 59.6%;
    --accent-pro: 251 84.6% 74.5%;
  }
}
```

#### Tailwind Config 확장

```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        // Existing colors...

        // New semantic layers
        'bg-primary': 'hsl(var(--bg-primary))',
        'bg-secondary': 'hsl(var(--bg-secondary))',
        'bg-tertiary': 'hsl(var(--bg-tertiary))',
        'bg-hover': 'hsl(var(--bg-hover))',

        'text-primary': 'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        'text-tertiary': 'hsl(var(--text-tertiary))',
        'text-disabled': 'hsl(var(--text-disabled))',

        'border-default': 'hsl(var(--border-default))',
        'border-subtle': 'hsl(var(--border-subtle))',

        // Semantic
        'success': 'hsl(var(--success))',
        'success-bg': 'hsl(var(--success-bg))',
        'warning': 'hsl(var(--warning))',
        'warning-bg': 'hsl(var(--warning-bg))',
        'danger': 'hsl(var(--danger))',
        'danger-bg': 'hsl(var(--danger-bg))',
        'info': 'hsl(var(--info))',
        'info-bg': 'hsl(var(--info-bg))',

        // Brand
        'accent-brand': 'hsl(var(--accent-brand))',
        'accent-pro': 'hsl(var(--accent-pro))',
      },
    },
  },
}
```

### 2. 타이포그래피 시스템

#### 페이지별 제목 계층 표준

```tsx
// Typography Scale
const typography = {
  // Page Title (h1)
  pageTitle: 'text-3xl md:text-4xl font-medium leading-tight text-text-primary',

  // Section Title (h2)
  sectionTitle: 'text-2xl md:text-3xl font-medium leading-tight text-text-primary',

  // Card Title (h3)
  cardTitle: 'text-xl font-medium leading-snug text-text-primary',

  // Subsection (h4)
  subsection: 'text-lg font-medium leading-normal text-text-primary',

  // Body Large
  bodyLarge: 'text-base leading-relaxed text-text-secondary',

  // Body (Default)
  body: 'text-sm leading-relaxed text-text-secondary',

  // Body Small
  bodySmall: 'text-xs leading-normal text-text-tertiary',

  // Label
  label: 'text-sm font-medium leading-none text-text-primary',

  // Caption
  caption: 'text-xs leading-tight text-text-tertiary',

  // Code
  code: 'font-mono text-sm bg-bg-tertiary px-1.5 py-0.5 rounded',
}
```

### 3. 간격 시스템 (Spacing)

```tsx
// Spacing Tokens
const spacing = {
  // Component Internal Padding
  componentXs: 'p-2',        // 8px
  componentSm: 'p-3',        // 12px
  componentMd: 'p-4',        // 16px
  componentLg: 'p-6',        // 24px
  componentXl: 'p-8',        // 32px

  // Section Spacing (vertical)
  sectionXs: 'py-4',         // 16px
  sectionSm: 'py-6',         // 24px
  sectionMd: 'py-8 md:py-12',    // 32px → 48px
  sectionLg: 'py-12 md:py-16',   // 48px → 64px
  sectionXl: 'py-16 md:py-24',   // 64px → 96px

  // Gap between elements
  gapXs: 'gap-2',            // 8px
  gapSm: 'gap-4',            // 16px
  gapMd: 'gap-6',            // 24px
  gapLg: 'gap-8',            // 32px
  gapXl: 'gap-12',           // 48px
  gap2xl: 'gap-16',          // 64px

  // Container Padding (horizontal)
  containerPadding: 'px-4 md:px-6',
}
```

### 4. 애니메이션 시스템

#### globals.css에 추가

```css
@layer utilities {
  /* === Motion Tokens === */

  /* Duration */
  .duration-fast {
    transition-duration: 100ms;
  }

  .duration-normal {
    transition-duration: 150ms;
  }

  .duration-slow {
    transition-duration: 200ms;
  }

  .duration-xslow {
    transition-duration: 300ms;
  }

  /* Easing (Claude Console style) */
  .ease-claude {
    transition-timing-function: cubic-bezier(0.165, 0.85, 0.45, 1);
  }

  /* Preset Animations */
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-in-left {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 300ms ease-out;
  }

  .animate-fade-in {
    animation: fade-in 200ms ease-out;
  }

  .animate-slide-in-left {
    animation: slide-in-left 300ms ease-out;
  }

  /* Staggered delays */
  .animate-delay-100 {
    animation-delay: 100ms;
  }

  .animate-delay-200 {
    animation-delay: 200ms;
  }

  .animate-delay-300 {
    animation-delay: 300ms;
  }

  /* Interactive States */
  .interactive-scale {
    @apply transition-transform duration-fast ease-claude;
    @apply hover:scale-[1.015];
    @apply active:scale-[0.985];
    @apply motion-reduce:transition-none;
    @apply motion-reduce:hover:scale-100;
    @apply motion-reduce:active:scale-100;
  }

  .interactive-opacity {
    @apply transition-opacity duration-normal;
    @apply hover:opacity-90;
    @apply active:opacity-80;
    @apply motion-reduce:transition-none;
  }
}
```

---

## 컴포넌트 시스템 재설계

### 1. 레이아웃 컴포넌트

#### AppLayout (메인 레이아웃)

```tsx
// src/components/layout/app-layout.tsx
'use client';

import { cn } from '@/lib/utils';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-bg-secondary">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <AppHeader />

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
```

#### AppSidebar (Claude Console 스타일)

```tsx
// src/components/layout/app-sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Settings,
  Search,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  const navItems: NavItem[] = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/articles', label: t('articles'), icon: FileText },
    { href: '/style-guide', label: t('styleGuide'), icon: BookOpen },
    { href: '/keywords', label: t('keywords'), icon: Search },
    { href: '/account', label: t('account'), icon: Settings },
  ];

  return (
    <nav className="flex h-screen w-64 flex-col border-r border-border-default bg-bg-primary">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link
          href="/dashboard"
          className="text-xl font-semibold text-text-primary transition-colors hover:text-accent-brand"
        >
          IndieBlog
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-normal',
                isActive
                  ? 'bg-bg-tertiary text-text-primary'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2',
                'motion-reduce:transition-none'
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Section */}
      <div className="border-t border-border-default p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-bg-hover">
          <User className="h-5 w-5 text-text-secondary" aria-hidden="true" />
          <span className="text-text-primary">Profile</span>
        </button>
      </div>
    </nav>
  );
}
```

#### PageContainer (콘텐츠 래퍼)

```tsx
// src/components/layout/page-container.tsx
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: '7xl' | 'prose' | 'full';
}

export function PageContainer({
  children,
  className,
  maxWidth = '7xl',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 md:px-6 py-8 md:py-12',
        maxWidth === '7xl' && 'max-w-7xl',
        maxWidth === 'prose' && 'max-w-prose',
        maxWidth === 'full' && 'max-w-full',
        className
      )}
    >
      {children}
    </div>
  );
}
```

### 2. UI 컴포넌트

#### Card (Claude Console 스타일)

```tsx
// src/components/ui/card-v2.tsx
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border-default bg-bg-primary p-6',
        hover && 'transition-all duration-normal hover:bg-bg-hover hover:shadow-md',
        onClick && 'cursor-pointer',
        'motion-reduce:transition-none',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-xl font-medium leading-snug text-text-primary', className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-text-secondary leading-relaxed', className)}>{children}</p>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
```

#### Button (Claude Console 스타일)

```tsx
// src/components/ui/button-v2.tsx
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(
        // Base
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-all duration-fast ease-claude',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'motion-reduce:transition-none',

        // Interactive
        'active:scale-[0.985]',

        // Variants
        variant === 'primary' && [
          'bg-accent-brand text-white',
          'hover:bg-accent-brand/90',
        ],
        variant === 'secondary' && [
          'border border-border-default bg-bg-primary text-text-primary',
          'hover:bg-bg-hover',
        ],
        variant === 'ghost' && [
          'text-text-secondary',
          'hover:bg-bg-hover hover:text-text-primary',
        ],
        variant === 'danger' && [
          'bg-danger text-white',
          'hover:bg-danger/90',
        ],

        // Sizes
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',

        className
      )}
      {...props}
    />
  );
}
```

#### Badge (태그/상태 표시)

```tsx
// src/components/ui/badge-v2.tsx
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium',
        variant === 'default' && 'bg-bg-tertiary text-text-secondary',
        variant === 'success' && 'bg-success-bg text-success border border-success/20',
        variant === 'warning' && 'bg-warning-bg text-warning border border-warning/20',
        variant === 'danger' && 'bg-danger-bg text-danger border border-danger/20',
        variant === 'info' && 'bg-info-bg text-info border border-info/20',
        className
      )}
    >
      {children}
    </span>
  );
}
```

#### EmptyState

```tsx
// src/components/ui/empty-state-v2.tsx
import { cn } from '@/lib/utils';
import { Button } from './button-v2';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-default bg-bg-secondary p-12 text-center',
        'animate-fade-in',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-brand/10 text-accent-brand">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-medium text-text-primary">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-text-secondary leading-relaxed">
        {description}
      </p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

---

## 레이아웃 시스템 개선

### 1. 전체 앱 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────┐
│ AppLayout                                                   │
│ ┌─────────┬─────────────────────────────────────────────┐  │
│ │         │ AppHeader                                    │  │
│ │         │ ┌─────────────────────────────────────────┐ │  │
│ │         │ │ Workspace Selector | User Menu          │ │  │
│ │         │ └─────────────────────────────────────────┘ │  │
│ │ App     ├─────────────────────────────────────────────┤  │
│ │ Sidebar │ PageContainer (max-w-7xl, px-4 md:px-6)   │  │
│ │         │ ┌─────────────────────────────────────────┐ │  │
│ │ • Dash  │ │                                         │ │  │
│ │ • Arti  │ │  Page Content                           │ │  │
│ │ • Style │ │                                         │ │  │
│ │ • Keys  │ │  - PageHeader (title + actions)         │ │  │
│ │ • Acct  │ │  - PageDescription                      │ │  │
│ │         │ │  - Content Sections (gap-12)            │ │  │
│ │ ─────── │ │                                         │ │  │
│ │ Profile │ │                                         │ │  │
│ └─────────┴─┴─────────────────────────────────────────┴─┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2. 페이지 구조 템플릿

모든 (protected) 페이지가 따를 일관된 구조:

```tsx
// Example: Dashboard Page
export default function DashboardPage() {
  return (
    <PageContainer>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-medium leading-tight text-text-primary">
            Dashboard
          </h1>
          <p className="mt-2 text-base text-text-secondary leading-relaxed">
            Your content overview and quick actions
          </p>
        </div>
        <Button variant="primary" size="lg">
          New Article
        </Button>
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        {/* Section 1 */}
        <section>
          <h2 className="mb-6 text-2xl md:text-3xl font-medium text-text-primary">
            Statistics
          </h2>
          <StatsGrid />
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="mb-6 text-2xl md:text-3xl font-medium text-text-primary">
            Recent Articles
          </h2>
          <ArticlesGrid />
        </section>
      </div>
    </PageContainer>
  );
}
```

---

## 구현 로드맵

### Phase 1: 기반 구축 (Week 1)

#### 목표
디자인 시스템 토큰 정의 및 공통 컴포넌트 구축

#### 작업 항목
1. **디자인 토큰 설정**
   - [ ] `globals.css`에 색상 변수 추가
   - [ ] `tailwind.config.ts` 확장
   - [ ] 애니메이션 유틸리티 추가

2. **레이아웃 컴포넌트**
   - [ ] `AppLayout` 구현
   - [ ] `AppSidebar` 구현 (Claude Console 스타일)
   - [ ] `AppHeader` 구현
   - [ ] `PageContainer` 구현

3. **기본 UI 컴포넌트**
   - [ ] `Button` v2 구현
   - [ ] `Card` v2 구현
   - [ ] `Badge` v2 구현
   - [ ] `EmptyState` v2 구현

#### 예상 시간: 3-4일

---

### Phase 2: 페이지별 적용 (Week 2-3)

#### 2.1 Dashboard (2일)
- [ ] AppLayout 적용
- [ ] WelcomeBanner 색상 시스템 마이그레이션
- [ ] StatsGrid 통일된 Card 사용
- [ ] ArticleCard v2로 교체

#### 2.2 Articles Pages (3일)
- [ ] Articles List: 필터, 그리드 개선
- [ ] New Article: 레이아웃 개선, 색상 통일
- [ ] Article Edit: 일관된 UI 적용

#### 2.3 Style Guide Pages (3일)
- [ ] Style Guide List: 검색, 카드 개선
- [ ] Style Guide New: 폼 레이아웃 개선
- [ ] Style Guide Edit: 일관성 적용

#### 2.4 Account & Keywords (2일)
- [ ] Account: 섹션 카드화, 색상 통일
- [ ] Keywords: 테이블 스타일 개선

#### 예상 시간: 10일

---

### Phase 3: 세부 개선 (Week 4)

#### 목표
애니메이션, 접근성, 반응형 최적화

#### 작업 항목
1. **애니메이션 추가**
   - [ ] 페이지 전환 애니메이션
   - [ ] 카드 호버 효과
   - [ ] 로딩 스켈레톤
   - [ ] 스태거(Stagger) 애니메이션

2. **접근성 강화**
   - [ ] 모든 버튼에 focus-visible
   - [ ] ARIA 속성 전수 조사
   - [ ] 키보드 네비게이션 테스트
   - [ ] 스크린 리더 테스트

3. **반응형 최적화**
   - [ ] 모바일 사이드바 토글
   - [ ] 태블릿 레이아웃 조정
   - [ ] 터치 인터랙션 개선

#### 예상 시간: 5일

---

### Phase 4: 품질 보증 (Week 5)

#### 작업 항목
1. **크로스 브라우저 테스트**
   - [ ] Chrome, Firefox, Safari, Edge
   - [ ] 다크/라이트 모드 전환 테스트

2. **성능 최적화**
   - [ ] Lighthouse 점수 측정
   - [ ] Bundle 크기 최적화
   - [ ] 이미지 최적화

3. **문서화**
   - [ ] Storybook 컴포넌트 문서
   - [ ] 디자인 시스템 가이드 작성
   - [ ] 개발자 온보딩 문서

#### 예상 시간: 3-4일

---

## 성공 지표

### 1. 정량적 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| **일관성 점수** | 6/10 | 9.5/10 | 색상/간격/타이포그래피 토큰 사용률 |
| **접근성 점수** | 70 | 95+ | Lighthouse Accessibility |
| **다크 모드 지원** | 60% | 100% | 모든 페이지 다크 모드 동작 확인 |
| **컴포넌트 재사용률** | 40% | 80% | 공통 컴포넌트 사용 비율 |
| **페이지 로드 시간** | 2.5s | <2s | Lighthouse Performance |

### 2. 정성적 지표

- [ ] **시각적 일관성**: 모든 페이지가 하나의 앱처럼 보임
- [ ] **브랜드 정체성**: Claude Console과 유사한 세련된 느낌
- [ ] **사용자 경험**: 직관적인 네비게이션, 명확한 정보 계층
- [ ] **개발자 경험**: 새로운 페이지 추가 시 30분 내 완료 가능

---

## 부록: 마이그레이션 체크리스트

각 페이지를 개선할 때 다음 항목을 확인하세요:

### 색상
- [ ] 모든 하드코딩된 hex 색상 제거
- [ ] 의미론적 색상 토큰 사용 (`bg-primary`, `text-primary` 등)
- [ ] 다크 모드에서 색상 대비 4.5:1 이상 확보
- [ ] Accent 색상은 `accent-brand` 사용

### 타이포그래피
- [ ] 페이지 제목: `text-3xl md:text-4xl font-medium`
- [ ] 섹션 제목: `text-2xl md:text-3xl font-medium`
- [ ] 본문: `text-sm` 또는 `text-base`, `leading-relaxed`
- [ ] 캡션: `text-xs text-text-tertiary`

### 간격
- [ ] 페이지 컨테이너: `px-4 md:px-6 py-8 md:py-12`
- [ ] 섹션 간격: `space-y-12` 또는 `gap-12`
- [ ] 카드 내부: `p-6`
- [ ] 요소 간 간격: `gap-4` 또는 `gap-6`

### 레이아웃
- [ ] `AppLayout`으로 래핑
- [ ] `PageContainer`로 콘텐츠 제한
- [ ] 최대 너비: `max-w-7xl` 또는 `max-w-prose`

### 애니메이션
- [ ] 진입 애니메이션: `animate-fade-in-up`
- [ ] 호버 효과: `transition-all duration-normal`
- [ ] 버튼 클릭: `active:scale-[0.985]`
- [ ] `motion-reduce:transition-none` 추가

### 접근성
- [ ] 모든 버튼에 `focus-visible:ring-2`
- [ ] 아이콘에 `aria-hidden="true"`
- [ ] 폼 레이블 `htmlFor` 연결
- [ ] 키보드 네비게이션 가능

### 반응형
- [ ] 모바일(375px)에서 테스트
- [ ] 태블릿(768px)에서 레이아웃 변경
- [ ] 데스크탑(1280px)에서 최종 확인

---

## 결론

이 계획을 따라 구현하면 IndieBlog의 모든 (protected) 페이지가 Claude Console 수준의 세련되고 일관된 UI/UX를 갖추게 됩니다.

**핵심 성공 요소:**
1. **토큰 기반 디자인 시스템**: 모든 스타일을 CSS 변수로 중앙 관리
2. **재사용 가능한 컴포넌트**: Card, Button, Badge 등 표준 컴포넌트 라이브러리
3. **일관된 레이아웃**: AppLayout + PageContainer로 모든 페이지 통일
4. **절제된 모션**: Claude Console 스타일의 미묘하고 부드러운 애니메이션
5. **완벽한 접근성**: WCAG 2.1 AA 준수, 키보드/스크린 리더 완벽 지원

**예상 총 소요 시간**: 4-5주 (1인 개발자 기준)

**다음 단계**: Phase 1 "기반 구축"부터 시작하여 순차적으로 진행하시면 됩니다.
