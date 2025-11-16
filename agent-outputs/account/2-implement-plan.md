# Account 페이지 구현 계획

## 1. 코드베이스 분석 결과

### 1.1 프로젝트 구조

이 프로젝트는 Next.js 15 App Router 기반의 풀스택 블로그 생성 SaaS로, 다음과 같은 구조를 따릅니다:

```
src/
├── app/
│   └── [locale]/
│       └── (protected)/
│           └── account/
│               └── page.tsx                    # 현재 빈 페이지
├── features/
│   ├── example/                                # 참고용 feature 구조
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── backend/
│   │   │   ├── route.ts                        # Hono 라우터
│   │   │   ├── service.ts                      # Supabase 비즈니스 로직
│   │   │   ├── schema.ts                       # Zod 스키마
│   │   │   └── error.ts                        # 에러 코드
│   │   └── lib/
│   │       └── dto.ts                          # 클라이언트용 DTO
│   ├── profiles/                               # 프로필 관련 (참고)
│   │   └── backend/
│   │       ├── service.ts                      # profiles 테이블 CRUD
│   │       └── route.ts                        # Clerk webhook 처리
│   └── landing/                                # 랜딩 페이지 (UI 참고)
│       └── components/
│           └── hero-section.tsx                # framer-motion 애니메이션 예시
├── components/ui/                              # shadcn-ui 컴포넌트
├── backend/                                    # 공통 백엔드 레이어
│   ├── hono/
│   │   ├── app.ts                              # Hono 앱 생성
│   │   └── context.ts                          # AppEnv 타입
│   ├── http/
│   │   ├── response.ts                         # success/failure 헬퍼
│   │   └── mapper.ts                           # respondWithDomain
│   └── domain/
│       └── result.ts                           # DomainResult 타입
└── messages/
    ├── ko.json                                 # 한국어 번역
    └── en.json                                 # 영어 번역
```

### 1.2 기존 패턴

#### 컴포넌트 패턴
- **모든 컴포넌트는 `"use client"` 지시어 사용** (필수)
- `useTranslations('namespace.key')` 로 i18n 지원
- shadcn-ui 컴포넌트 활용 (Card, Button, Input, Label 등)
- framer-motion 사용 시 `fadeUpStagger` 같은 공통 애니메이션 유틸 재사용

#### 상태 관리
- **서버 상태**: React Query (`@tanstack/react-query`)
- **로컬 상태**: `useState` + `react-hook-form`
- **자동 저장**: `useDebounce` (react-use) + mutation

#### 백엔드 패턴
- **Hono 라우터**: `registerXxxRoutes(app)` 형태로 등록
- **서비스 레이어**: `DomainResult<T, E>` 반환 (HTTP 상태 코드 없음)
- **라우터 레이어**: `respondWithDomain(c, result)` 로 HTTP 응답 변환
- **스키마 검증**: Zod 기반, 요청/응답/테이블 row 각각 정의

#### API 통신
- 클라이언트: `@/lib/remote/api-client` 를 통해 통신
- 모든 라우트는 `/api` prefix 필요 (Next.js `[[...hono]]` 구조)

### 1.3 기술 스택

**프론트엔드:**
- React 19, Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn-ui (Card, Button, Input, Label, Avatar, Separator 등)
- next-intl (i18n)
- React Hook Form + Zod
- React Query (TanStack Query)
- framer-motion (최소한으로 사용)
- react-use (useDebounce 등)

**백엔드:**
- Hono (API 라우터)
- Supabase (PostgreSQL + Auth)
- Clerk (인증 - 이미 설정됨)
- Zod (스키마 검증)

**개발 도구:**
- pnpm
- ESLint + Prettier
- Vitest (단위 테스트)
- Playwright (E2E)

---

## 2. 파일 구조

### 2.1 생성할 파일

#### 프론트엔드 컴포넌트
```
src/features/account/
├── components/
│   ├── account-page.tsx                  # 메인 컨테이너 (Phase 1-3 통합)
│   ├── profile-section.tsx               # 프로필 섹션 (Phase 1)
│   ├── content-preferences-section.tsx   # 콘텐츠 설정 (Phase 2)
│   ├── notifications-section.tsx         # 알림 설정 (Phase 2)
│   ├── section-card.tsx                  # 공통 섹션 카드 래퍼
│   └── auto-save-indicator.tsx           # 저장 상태 표시 (재사용 가능)
```

#### 훅
```
src/features/account/hooks/
├── useProfile.ts                         # GET /api/account/profile
├── useUpdateProfile.ts                   # PUT /api/account/profile
├── useSettings.ts                        # GET /api/account/settings
├── useUpdateSettings.ts                  # PUT /api/account/settings
└── useAutoSave.ts                        # debounced 자동 저장 로직
```

#### 백엔드
```
src/features/account/backend/
├── route.ts                              # Hono 라우터 정의
├── service.ts                            # Supabase 비즈니스 로직
├── schema.ts                             # Zod 스키마 (요청/응답)
└── error.ts                              # 에러 코드 정의
```

#### 클라이언트 DTO
```
src/features/account/lib/
└── dto.ts                                # 백엔드 스키마 재노출
```

### 2.2 수정할 파일

```
src/app/[locale]/(protected)/account/page.tsx         # AccountPage 컴포넌트 렌더링
src/backend/hono/app.ts                                # registerAccountRoutes 추가
messages/ko.json                                        # 한국어 번역 추가
messages/en.json                                        # 영어 번역 추가
supabase/migrations/YYYYMMDDHHMMSS_add_account_settings.sql  # settings 컬럼 추가
```

---

## 3. 의존성

### 3.1 설치 명령

**필요 없음** - 모든 필요한 패키지가 이미 설치되어 있습니다:
- ✅ framer-motion
- ✅ @tanstack/react-query
- ✅ react-hook-form
- ✅ zod
- ✅ next-intl
- ✅ react-use
- ✅ date-fns
- ✅ shadcn-ui 컴포넌트들

### 3.2 이미 설치된 패키지

- `framer-motion`: 애니메이션 (최소 사용)
- `@tanstack/react-query`: 서버 상태 관리
- `react-hook-form`: 폼 관리
- `@hookform/resolvers`: Zod 통합
- `zod`: 스키마 검증
- `next-intl`: i18n
- `react-use`: `useDebounce` 등
- `date-fns`: 날짜 포맷팅
- `lucide-react`: 아이콘

---

## 4. 구현 순서

### Phase 1: Profile Section (MVP, 1-2일)
**목표**: "Coming Soon" 제거, 기본 프로필 표시 및 수정

#### Step 1.1: 데이터베이스 마이그레이션 (0.5일)
- [ ] `profiles` 테이블에 필요한 컬럼 확인/추가
- [ ] `account_settings` 테이블 생성 (Phase 2 준비)

#### Step 1.2: 백엔드 구현 (0.5일)
- [ ] `src/features/account/backend/schema.ts` 작성
- [ ] `src/features/account/backend/error.ts` 작성
- [ ] `src/features/account/backend/service.ts` 작성
- [ ] `src/features/account/backend/route.ts` 작성
- [ ] `src/backend/hono/app.ts` 에 라우터 등록

#### Step 1.3: 프론트엔드 훅 구현 (0.5일)
- [ ] `src/features/account/lib/dto.ts` 작성
- [ ] `src/features/account/hooks/useProfile.ts` 작성
- [ ] `src/features/account/hooks/useUpdateProfile.ts` 작성
- [ ] `src/features/account/hooks/useAutoSave.ts` 작성 (공통 훅)

#### Step 1.4: UI 컴포넌트 구현 (0.5일)
- [ ] `src/features/account/components/section-card.tsx` 작성
- [ ] `src/features/account/components/auto-save-indicator.tsx` 작성
- [ ] `src/features/account/components/profile-section.tsx` 작성

#### Step 1.5: 페이지 통합 및 i18n (0.5일)
- [ ] `src/features/account/components/account-page.tsx` 작성
- [ ] `src/app/[locale]/(protected)/account/page.tsx` 수정
- [ ] `messages/ko.json` 에 번역 추가
- [ ] `messages/en.json` 에 번역 추가

### Phase 2: Content Preferences + Notifications (2-3일)
**목표**: 스타일 가이드 설정 수정, 알림 토글

#### Step 2.1: 백엔드 확장 (1일)
- [ ] `account_settings` 테이블 스키마 확정
- [ ] `service.ts` 에 settings CRUD 추가
- [ ] `route.ts` 에 `/api/account/settings` 엔드포인트 추가
- [ ] 스키마 및 에러 코드 추가

#### Step 2.2: 프론트엔드 훅 추가 (0.5일)
- [ ] `useSettings.ts` 작성
- [ ] `useUpdateSettings.ts` 작성
- [ ] `useAutoSave.ts` 확장 (settings 지원)

#### Step 2.3: UI 컴포넌트 구현 (1일)
- [ ] `content-preferences-section.tsx` 작성
- [ ] `notifications-section.tsx` 작성
- [ ] `account-page.tsx` 에 섹션 추가

#### Step 2.4: i18n 추가 (0.5일)
- [ ] 번역 키 추가 (content preferences, notifications)

### Phase 3: Advanced Settings (선택, 별도 페이지)
**나중에 구현** - 본 계획에서는 제외

---

## 5. 컴포넌트 상세 명세

### 5.1 Section Card (공통)

#### 파일: `src/features/account/components/section-card.tsx`

```typescript
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, description, children, className }: SectionCardProps) {
  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}
```

**특징:**
- shadcn-ui Card 컴포넌트 활용
- hover 시 shadow 효과 (CSS transition)
- 제목, 설명, children 지원
- className prop으로 추가 스타일 가능

---

### 5.2 Auto Save Indicator

#### 파일: `src/features/account/components/auto-save-indicator.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { useParams } from "next/navigation";

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
  const t = useTranslations("account.autoSave");
  const params = useParams();
  const locale = params?.locale as string;
  const dateLocale = locale === "ko" ? ko : enUS;

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t("saving")}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>{t("error")}</span>
      </div>
    );
  }

  if (lastSavedAt) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span>
          {t("saved", {
            time: formatDistanceToNow(new Date(lastSavedAt), {
              addSuffix: true,
              locale: dateLocale,
            }),
          })}
        </span>
      </div>
    );
  }

  return null;
}
```

**특징:**
- 3가지 상태: saving, error, saved
- date-fns로 "3분 전" 형식 표시
- locale 기반 날짜 포맷
- 아이콘 + 텍스트 조합

---

### 5.3 Profile Section

#### 파일: `src/features/account/components/profile-section.tsx`

```typescript
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { SectionCard } from "./section-card";
import { AutoSaveIndicator } from "./auto-save-indicator";
import { useProfile } from "../hooks/useProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useAutoSave } from "../hooks/useAutoSave";
import { formatDate } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { useParams } from "next/navigation";

export function ProfileSection() {
  const t = useTranslations("account.profile");
  const params = useParams();
  const locale = params?.locale as string;
  const dateLocale = locale === "ko" ? ko : enUS;

  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 자동 저장 (fullName만)
  const { save, saveStatus } = useAutoSave({
    onSave: (data) => updateMutation.mutateAsync(data),
  });

  const handleNameChange = (value: string) => {
    setFullName(value);
    save({ fullName: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // TODO: Supabase Storage 업로드 구현
      // const imageUrl = await uploadToSupabase(file);
      // await updateMutation.mutateAsync({ imageUrl });
      console.log("Image upload not implemented yet");
    } catch (error) {
      console.error("Image upload failed", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <SectionCard title={t("title")} description={t("description")}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={t("title")} description={t("description")}>
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.imageUrl ?? undefined} alt={fullName} />
            <AvatarFallback className="text-2xl">
              {fullName?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <label htmlFor="avatar-upload">
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full shadow-sm cursor-pointer"
              disabled={isUploadingImage}
              asChild
            >
              <span>
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </span>
            </Button>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* Info */}
        <div className="flex-1 w-full space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">{t("fields.fullName")}</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t("fields.fullNamePlaceholder")}
              className="max-w-md"
            />
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("fields.email")}</Label>
            <Input
              id="email"
              value={profile?.email ?? ""}
              disabled
              className="max-w-md bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              {t("fields.emailHint")}
            </p>
          </div>

          {/* Joined Date */}
          <div className="space-y-2">
            <Label>{t("fields.joinedAt")}</Label>
            <p className="text-sm text-muted-foreground">
              {profile?.createdAt
                ? formatDate(new Date(profile.createdAt), "PPP", { locale: dateLocale })
                : "-"}
            </p>
          </div>

          {/* Auto Save Indicator */}
          <AutoSaveIndicator
            isSaving={saveStatus === "saving"}
            isError={saveStatus === "error"}
            lastSavedAt={profile?.updatedAt}
          />
        </div>
      </div>
    </SectionCard>
  );
}
```

**특징:**
- Avatar 컴포넌트 (shadcn-ui)
- 이미지 업로드 버튼 (TODO: Supabase Storage 연동)
- fullName 인라인 편집 + 자동 저장
- email 읽기 전용 (Clerk 관리)
- 가입일 표시 (date-fns)
- 로딩 상태 처리

---

### 5.4 Content Preferences Section (Phase 2)

#### 파일: `src/features/account/components/content-preferences-section.tsx`

```typescript
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCard } from "./section-card";
import { AutoSaveIndicator } from "./auto-save-indicator";
import { useSettings } from "../hooks/useSettings";
import { useUpdateSettings } from "../hooks/useUpdateSettings";
import { useAutoSave } from "../hooks/useAutoSave";

export function ContentPreferencesSection() {
  const t = useTranslations("account.contentPreferences");
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [brandName, setBrandName] = useState(settings?.brandName ?? "");
  const [brandDescription, setBrandDescription] = useState(settings?.brandDescription ?? "");
  const [targetAudience, setTargetAudience] = useState(settings?.targetAudience ?? "");
  const [tone, setTone] = useState(settings?.tone ?? "professional");
  const [language, setLanguage] = useState(settings?.language ?? "ko");

  const { save, saveStatus } = useAutoSave({
    onSave: (data) => updateMutation.mutateAsync(data),
  });

  const handleChange = (field: string, value: string) => {
    const updates: Record<string, string> = { [field]: value };

    switch (field) {
      case "brandName":
        setBrandName(value);
        break;
      case "brandDescription":
        setBrandDescription(value);
        break;
      case "targetAudience":
        setTargetAudience(value);
        break;
      case "tone":
        setTone(value);
        break;
      case "language":
        setLanguage(value);
        break;
    }

    save(updates);
  };

  if (isLoading) {
    return <SectionCard title={t("title")} />;
  }

  return (
    <SectionCard title={t("title")} description={t("description")}>
      <div className="space-y-6">
        {/* Brand Name */}
        <div className="space-y-2">
          <Label htmlFor="brandName">{t("fields.brandName")}</Label>
          <Input
            id="brandName"
            value={brandName}
            onChange={(e) => handleChange("brandName", e.target.value)}
            placeholder={t("fields.brandNamePlaceholder")}
            className="max-w-md"
          />
        </div>

        {/* Brand Description */}
        <div className="space-y-2">
          <Label htmlFor="brandDescription">{t("fields.brandDescription")}</Label>
          <Textarea
            id="brandDescription"
            value={brandDescription}
            onChange={(e) => handleChange("brandDescription", e.target.value)}
            placeholder={t("fields.brandDescriptionPlaceholder")}
            rows={3}
            className="max-w-2xl resize-none"
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label htmlFor="targetAudience">{t("fields.targetAudience")}</Label>
          <Textarea
            id="targetAudience"
            value={targetAudience}
            onChange={(e) => handleChange("targetAudience", e.target.value)}
            placeholder={t("fields.targetAudiencePlaceholder")}
            rows={2}
            className="max-w-2xl resize-none"
          />
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <Label htmlFor="tone">{t("fields.tone")}</Label>
          <Select value={tone} onValueChange={(val) => handleChange("tone", val)}>
            <SelectTrigger id="tone" className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">{t("fields.toneOptions.friendly")}</SelectItem>
              <SelectItem value="professional">{t("fields.toneOptions.professional")}</SelectItem>
              <SelectItem value="casual">{t("fields.toneOptions.casual")}</SelectItem>
              <SelectItem value="formal">{t("fields.toneOptions.formal")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language">{t("fields.language")}</Label>
          <Select value={language} onValueChange={(val) => handleChange("language", val)}>
            <SelectTrigger id="language" className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ko">{t("fields.languageOptions.ko")}</SelectItem>
              <SelectItem value="en">{t("fields.languageOptions.en")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auto Save Indicator */}
        <AutoSaveIndicator
          isSaving={saveStatus === "saving"}
          isError={saveStatus === "error"}
          lastSavedAt={settings?.updatedAt}
        />
      </div>
    </SectionCard>
  );
}
```

**특징:**
- Input, Textarea, Select 컴포넌트 활용
- 각 필드별 자동 저장
- tone, language 드롭다운
- 예시 텍스트는 i18n으로 제공

---

### 5.5 Notifications Section (Phase 2)

#### 파일: `src/features/account/components/notifications-section.tsx`

```typescript
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SectionCard } from "./section-card";
import { useSettings } from "../hooks/useSettings";
import { useUpdateSettings } from "../hooks/useUpdateSettings";

export function NotificationsSection() {
  const t = useTranslations("account.notifications");
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [emailUpdates, setEmailUpdates] = useState(settings?.emailUpdates ?? true);
  const [weeklyReport, setWeeklyReport] = useState(settings?.weeklyReport ?? false);

  const handleToggle = async (field: "emailUpdates" | "weeklyReport", value: boolean) => {
    if (field === "emailUpdates") {
      setEmailUpdates(value);
    } else {
      setWeeklyReport(value);
    }

    // 즉시 저장 (토글은 debounce 불필요)
    await updateMutation.mutateAsync({ [field]: value });
  };

  if (isLoading) {
    return <SectionCard title={t("title")} />;
  }

  return (
    <SectionCard title={t("title")} description={t("description")}>
      <div className="space-y-6">
        {/* Email Updates */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailUpdates" className="text-base">
              {t("fields.emailUpdates")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("fields.emailUpdatesDesc")}
            </p>
          </div>
          <Switch
            id="emailUpdates"
            checked={emailUpdates}
            onCheckedChange={(val) => handleToggle("emailUpdates", val)}
          />
        </div>

        {/* Weekly Report */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="weeklyReport" className="text-base">
              {t("fields.weeklyReport")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("fields.weeklyReportDesc")}
            </p>
          </div>
          <Switch
            id="weeklyReport"
            checked={weeklyReport}
            onCheckedChange={(val) => handleToggle("weeklyReport", val)}
          />
        </div>
      </div>
    </SectionCard>
  );
}
```

**특징:**
- Switch 컴포넌트 (shadcn-ui)
- 즉시 저장 (debounce 없음)
- 설명 텍스트 포함
- 간단한 on/off 설정

---

### 5.6 Account Page (메인 컨테이너)

#### 파일: `src/features/account/components/account-page.tsx`

```typescript
"use client";

import { ProfileSection } from "./profile-section";
import { ContentPreferencesSection } from "./content-preferences-section";
import { NotificationsSection } from "./notifications-section";

export function AccountPage() {
  return (
    <div className="space-y-8">
      {/* Phase 1: Profile */}
      <ProfileSection />

      {/* Phase 2: Content Preferences */}
      <ContentPreferencesSection />

      {/* Phase 2: Notifications */}
      <NotificationsSection />

      {/* Phase 3: Advanced Settings 링크는 나중에 추가 */}
    </div>
  );
}
```

**특징:**
- 단순한 레이아웃 컨테이너
- 각 섹션을 수직으로 배치 (`space-y-8`)
- Phase별 점진적 추가 가능

---

## 6. i18n 번역 키

### 6.1 영어 (messages/en.json)

```json
{
  "account": {
    "autoSave": {
      "saving": "Saving...",
      "saved": "Saved {time}",
      "error": "Failed to save"
    },
    "profile": {
      "title": "Profile Information",
      "description": "Manage your personal information and avatar.",
      "fields": {
        "fullName": "Full Name",
        "fullNamePlaceholder": "Enter your name",
        "email": "Email",
        "emailHint": "Email is managed by your authentication provider (Clerk).",
        "joinedAt": "Member Since"
      }
    },
    "contentPreferences": {
      "title": "Content Preferences",
      "description": "Set your brand voice and writing style for AI-generated content.",
      "fields": {
        "brandName": "Brand Name",
        "brandNamePlaceholder": "e.g., TechBlog, MyCompany",
        "brandDescription": "Brand Description",
        "brandDescriptionPlaceholder": "Describe your brand's personality and values...",
        "targetAudience": "Target Audience",
        "targetAudiencePlaceholder": "Who are you writing for? (e.g., developers, marketers, students)",
        "tone": "Writing Tone",
        "toneOptions": {
          "friendly": "Friendly - Warm and approachable",
          "professional": "Professional - Formal and authoritative",
          "casual": "Casual - Relaxed and conversational",
          "formal": "Formal - Academic and precise"
        },
        "language": "Preferred Language",
        "languageOptions": {
          "ko": "Korean",
          "en": "English"
        }
      }
    },
    "notifications": {
      "title": "Notification Settings",
      "description": "Choose what updates you want to receive.",
      "fields": {
        "emailUpdates": "Email Updates",
        "emailUpdatesDesc": "Receive notifications about new features and updates.",
        "weeklyReport": "Weekly Report",
        "weeklyReportDesc": "Get a summary of your activity every week."
      }
    }
  }
}
```

### 6.2 한국어 (messages/ko.json)

```json
{
  "account": {
    "autoSave": {
      "saving": "저장 중...",
      "saved": "{time} 저장됨",
      "error": "저장 실패"
    },
    "profile": {
      "title": "프로필 정보",
      "description": "개인 정보와 아바타를 관리하세요.",
      "fields": {
        "fullName": "이름",
        "fullNamePlaceholder": "이름을 입력하세요",
        "email": "이메일",
        "emailHint": "이메일은 인증 제공자(Clerk)에서 관리됩니다.",
        "joinedAt": "가입일"
      }
    },
    "contentPreferences": {
      "title": "콘텐츠 설정",
      "description": "AI가 생성하는 콘텐츠의 브랜드 톤과 작성 스타일을 설정하세요.",
      "fields": {
        "brandName": "브랜드 이름",
        "brandNamePlaceholder": "예: 테크블로그, 우리회사",
        "brandDescription": "브랜드 설명",
        "brandDescriptionPlaceholder": "브랜드의 성격과 가치를 설명해주세요...",
        "targetAudience": "타겟 독자",
        "targetAudiencePlaceholder": "누구를 위해 글을 쓰나요? (예: 개발자, 마케터, 학생)",
        "tone": "작성 톤",
        "toneOptions": {
          "friendly": "친근한 - 따뜻하고 다가가기 쉬운",
          "professional": "전문적 - 격식 있고 권위 있는",
          "casual": "캐주얼 - 편안하고 대화하는 듯한",
          "formal": "정중한 - 학술적이고 정확한"
        },
        "language": "선호 언어",
        "languageOptions": {
          "ko": "한국어",
          "en": "영어"
        }
      }
    },
    "notifications": {
      "title": "알림 설정",
      "description": "받고 싶은 알림을 선택하세요.",
      "fields": {
        "emailUpdates": "이메일 업데이트",
        "emailUpdatesDesc": "새로운 기능과 업데이트에 대한 알림을 받습니다.",
        "weeklyReport": "주간 리포트",
        "weeklyReportDesc": "매주 활동 요약을 받아봅니다."
      }
    }
  }
}
```

---

## 7. 백엔드 상세 명세

### 7.1 스키마 정의

#### 파일: `src/features/account/backend/schema.ts`

```typescript
import { z } from "zod";

// ========================================
// Profile Schemas
// ========================================

export const ProfileResponseSchema = z.object({
  id: z.string().uuid(),
  clerkUserId: z.string(),
  email: z.string().email().nullable(),
  fullName: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

export const UpdateProfileRequestSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  imageUrl: z.string().url().optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

// ========================================
// Settings Schemas
// ========================================

export const SettingsResponseSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  brandName: z.string().nullable(),
  brandDescription: z.string().nullable(),
  targetAudience: z.string().nullable(),
  tone: z.enum(["friendly", "professional", "casual", "formal"]).nullable(),
  language: z.enum(["ko", "en"]).nullable(),
  emailUpdates: z.boolean(),
  weeklyReport: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SettingsResponse = z.infer<typeof SettingsResponseSchema>;

export const UpdateSettingsRequestSchema = z.object({
  brandName: z.string().max(100).optional(),
  brandDescription: z.string().max(500).optional(),
  targetAudience: z.string().max(300).optional(),
  tone: z.enum(["friendly", "professional", "casual", "formal"]).optional(),
  language: z.enum(["ko", "en"]).optional(),
  emailUpdates: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
});

export type UpdateSettingsRequest = z.infer<typeof UpdateSettingsRequestSchema>;

// ========================================
// Database Table Schemas
// ========================================

export const ProfileRowSchema = z.object({
  id: z.string().uuid(),
  clerk_user_id: z.string(),
  email: z.string().email().nullable(),
  full_name: z.string().nullable(),
  image_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProfileRow = z.infer<typeof ProfileRowSchema>;

export const SettingsRowSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  brand_name: z.string().nullable(),
  brand_description: z.string().nullable(),
  target_audience: z.string().nullable(),
  tone: z.string().nullable(),
  language: z.string().nullable(),
  email_updates: z.boolean(),
  weekly_report: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SettingsRow = z.infer<typeof SettingsRowSchema>;
```

---

### 7.2 에러 코드 정의

#### 파일: `src/features/account/backend/error.ts`

```typescript
export const accountErrorCodes = {
  profileNotFound: "PROFILE_NOT_FOUND",
  profileUpdateFailed: "PROFILE_UPDATE_FAILED",
  settingsNotFound: "SETTINGS_NOT_FOUND",
  settingsUpdateFailed: "SETTINGS_UPDATE_FAILED",
  unauthorized: "UNAUTHORIZED",
  validationError: "VALIDATION_ERROR",
} as const;

export type AccountErrorCode = typeof accountErrorCodes[keyof typeof accountErrorCodes];

export type AccountDomainError = {
  code: AccountErrorCode;
  message: string;
  details?: unknown;
};
```

---

### 7.3 서비스 레이어

#### 파일: `src/features/account/backend/service.ts`

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  domainSuccess,
  domainFailure,
  type DomainResult,
} from "@/backend/domain/result";
import {
  ProfileResponseSchema,
  SettingsResponseSchema,
  type ProfileResponse,
  type ProfileRow,
  type SettingsResponse,
  type SettingsRow,
  type UpdateProfileRequest,
  type UpdateSettingsRequest,
} from "./schema";
import { accountErrorCodes, type AccountDomainError } from "./error";

const PROFILES_TABLE = "profiles";
const SETTINGS_TABLE = "account_settings";

// ========================================
// Profile Service
// ========================================

export const getProfileByClerkId = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<DomainResult<ProfileResponse, AccountDomainError>> => {
  const { data, error } = await client
    .from(PROFILES_TABLE)
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single<ProfileRow>();

  if (error || !data) {
    return domainFailure({
      code: accountErrorCodes.profileNotFound,
      message: "Profile not found",
    });
  }

  const mapped: ProfileResponse = {
    id: data.id,
    clerkUserId: data.clerk_user_id,
    email: data.email,
    fullName: data.full_name,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  const parsed = ProfileResponseSchema.safeParse(mapped);
  if (!parsed.success) {
    return domainFailure({
      code: accountErrorCodes.validationError,
      message: "Profile validation failed",
      details: parsed.error.format(),
    });
  }

  return domainSuccess(parsed.data);
};

export const updateProfileByClerkId = async (
  client: SupabaseClient,
  clerkUserId: string,
  updates: UpdateProfileRequest,
): Promise<DomainResult<ProfileResponse, AccountDomainError>> => {
  const dbUpdates: Partial<ProfileRow> = {};

  if (updates.fullName !== undefined) {
    dbUpdates.full_name = updates.fullName;
  }
  if (updates.imageUrl !== undefined) {
    dbUpdates.image_url = updates.imageUrl;
  }

  const { data, error } = await client
    .from(PROFILES_TABLE)
    .update(dbUpdates)
    .eq("clerk_user_id", clerkUserId)
    .select("*")
    .single<ProfileRow>();

  if (error || !data) {
    return domainFailure({
      code: accountErrorCodes.profileUpdateFailed,
      message: error?.message ?? "Failed to update profile",
    });
  }

  const mapped: ProfileResponse = {
    id: data.id,
    clerkUserId: data.clerk_user_id,
    email: data.email,
    fullName: data.full_name,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return domainSuccess(mapped);
};

// ========================================
// Settings Service
// ========================================

export const getSettingsByProfileId = async (
  client: SupabaseClient,
  profileId: string,
): Promise<DomainResult<SettingsResponse, AccountDomainError>> => {
  const { data, error } = await client
    .from(SETTINGS_TABLE)
    .select("*")
    .eq("profile_id", profileId)
    .single<SettingsRow>();

  if (error || !data) {
    return domainFailure({
      code: accountErrorCodes.settingsNotFound,
      message: "Settings not found",
    });
  }

  const mapped: SettingsResponse = {
    id: data.id,
    profileId: data.profile_id,
    brandName: data.brand_name,
    brandDescription: data.brand_description,
    targetAudience: data.target_audience,
    tone: data.tone as SettingsResponse["tone"],
    language: data.language as SettingsResponse["language"],
    emailUpdates: data.email_updates,
    weeklyReport: data.weekly_report,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  const parsed = SettingsResponseSchema.safeParse(mapped);
  if (!parsed.success) {
    return domainFailure({
      code: accountErrorCodes.validationError,
      message: "Settings validation failed",
      details: parsed.error.format(),
    });
  }

  return domainSuccess(parsed.data);
};

export const updateSettingsByProfileId = async (
  client: SupabaseClient,
  profileId: string,
  updates: UpdateSettingsRequest,
): Promise<DomainResult<SettingsResponse, AccountDomainError>> => {
  const dbUpdates: Partial<SettingsRow> = {};

  if (updates.brandName !== undefined) dbUpdates.brand_name = updates.brandName;
  if (updates.brandDescription !== undefined) dbUpdates.brand_description = updates.brandDescription;
  if (updates.targetAudience !== undefined) dbUpdates.target_audience = updates.targetAudience;
  if (updates.tone !== undefined) dbUpdates.tone = updates.tone;
  if (updates.language !== undefined) dbUpdates.language = updates.language;
  if (updates.emailUpdates !== undefined) dbUpdates.email_updates = updates.emailUpdates;
  if (updates.weeklyReport !== undefined) dbUpdates.weekly_report = updates.weeklyReport;

  const { data, error } = await client
    .from(SETTINGS_TABLE)
    .update(dbUpdates)
    .eq("profile_id", profileId)
    .select("*")
    .single<SettingsRow>();

  if (error || !data) {
    return domainFailure({
      code: accountErrorCodes.settingsUpdateFailed,
      message: error?.message ?? "Failed to update settings",
    });
  }

  const mapped: SettingsResponse = {
    id: data.id,
    profileId: data.profile_id,
    brandName: data.brand_name,
    brandDescription: data.brand_description,
    targetAudience: data.target_audience,
    tone: data.tone as SettingsResponse["tone"],
    language: data.language as SettingsResponse["language"],
    emailUpdates: data.email_updates,
    weeklyReport: data.weekly_report,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return domainSuccess(mapped);
};

export const ensureSettings = async (
  client: SupabaseClient,
  profileId: string,
): Promise<DomainResult<SettingsResponse, AccountDomainError>> => {
  // 먼저 조회 시도
  const existing = await getSettingsByProfileId(client, profileId);
  if (existing.ok) {
    return existing;
  }

  // 없으면 기본값으로 생성
  const { data, error } = await client
    .from(SETTINGS_TABLE)
    .insert({
      profile_id: profileId,
      brand_name: null,
      brand_description: null,
      target_audience: null,
      tone: "professional",
      language: "ko",
      email_updates: true,
      weekly_report: false,
    })
    .select("*")
    .single<SettingsRow>();

  if (error || !data) {
    return domainFailure({
      code: accountErrorCodes.settingsUpdateFailed,
      message: "Failed to create default settings",
    });
  }

  const mapped: SettingsResponse = {
    id: data.id,
    profileId: data.profile_id,
    brandName: data.brand_name,
    brandDescription: data.brand_description,
    targetAudience: data.target_audience,
    tone: data.tone as SettingsResponse["tone"],
    language: data.language as SettingsResponse["language"],
    emailUpdates: data.email_updates,
    weeklyReport: data.weekly_report,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return domainSuccess(mapped);
};
```

---

### 7.4 라우터 정의

#### 파일: `src/features/account/backend/route.ts`

```typescript
import type { Hono } from "hono";
import { respondWithDomain } from "@/backend/http/mapper";
import { failure } from "@/backend/http/response";
import { getLogger, getSupabase, type AppEnv } from "@/backend/hono/context";
import { getAuth } from "@hono/clerk-auth";
import {
  getProfileByClerkId,
  updateProfileByClerkId,
  getSettingsByProfileId,
  updateSettingsByProfileId,
  ensureSettings,
} from "./service";
import { getProfileIdByClerkId } from "@/features/profiles/backend/service";
import { UpdateProfileRequestSchema, UpdateSettingsRequestSchema } from "./schema";
import { accountErrorCodes } from "./error";

export const registerAccountRoutes = (app: Hono<AppEnv>) => {
  // GET /api/account/profile
  app.get("/api/account/profile", async (c) => {
    const auth = getAuth(c);
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return c.json(
        failure(401, accountErrorCodes.unauthorized, "User not authenticated"),
        401
      );
    }

    const supabase = getSupabase(c);
    const result = await getProfileByClerkId(supabase, clerkUserId);

    return respondWithDomain(c, result);
  });

  // PUT /api/account/profile
  app.put("/api/account/profile", async (c) => {
    const auth = getAuth(c);
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return c.json(
        failure(401, accountErrorCodes.unauthorized, "User not authenticated"),
        401
      );
    }

    const body = await c.req.json();
    const parsed = UpdateProfileRequestSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        failure(400, accountErrorCodes.validationError, "Invalid request body", parsed.error.format()),
        400
      );
    }

    const supabase = getSupabase(c);
    const result = await updateProfileByClerkId(supabase, clerkUserId, parsed.data);

    return respondWithDomain(c, result);
  });

  // GET /api/account/settings
  app.get("/api/account/settings", async (c) => {
    const auth = getAuth(c);
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return c.json(
        failure(401, accountErrorCodes.unauthorized, "User not authenticated"),
        401
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // 1. profileId 얻기
    const profileId = await getProfileIdByClerkId(supabase, clerkUserId);
    if (!profileId) {
      logger.error("Profile not found for clerkUserId", clerkUserId);
      return c.json(
        failure(404, accountErrorCodes.profileNotFound, "Profile not found"),
        404
      );
    }

    // 2. settings 조회 (없으면 생성)
    const result = await ensureSettings(supabase, profileId);

    return respondWithDomain(c, result);
  });

  // PUT /api/account/settings
  app.put("/api/account/settings", async (c) => {
    const auth = getAuth(c);
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return c.json(
        failure(401, accountErrorCodes.unauthorized, "User not authenticated"),
        401
      );
    }

    const body = await c.req.json();
    const parsed = UpdateSettingsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        failure(400, accountErrorCodes.validationError, "Invalid request body", parsed.error.format()),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // 1. profileId 얻기
    const profileId = await getProfileIdByClerkId(supabase, clerkUserId);
    if (!profileId) {
      logger.error("Profile not found for clerkUserId", clerkUserId);
      return c.json(
        failure(404, accountErrorCodes.profileNotFound, "Profile not found"),
        404
      );
    }

    // 2. settings 업데이트
    const result = await updateSettingsByProfileId(supabase, profileId, parsed.data);

    return respondWithDomain(c, result);
  });
};
```

---

### 7.5 라우터 등록

#### 파일: `src/backend/hono/app.ts` (수정)

기존 파일에서 다음 부분을 추가:

```typescript
// ... 기존 imports

import { registerAccountRoutes } from '@/features/account/backend/route';

// ... 기존 코드

export const createHonoApp = (): Hono<AppEnv> => {
  // ... 기존 코드

  // Register feature routes
  registerExampleRoutes(app);
  registerProfilesRoutes(app);
  registerOnboardingRoutes(app);
  registerArticlesRoutes(app);
  registerKeywordsRoutes(app);
  registerAccountRoutes(app); // ✅ 추가

  return app;
};
```

---

## 8. 프론트엔드 훅 명세

### 8.1 useProfile

#### 파일: `src/features/account/hooks/useProfile.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type { ProfileResponse } from "../lib/dto";

export const useProfile = () => {
  return useQuery({
    queryKey: ["account", "profile"],
    queryFn: async () => {
      const response = await apiClient.get<ProfileResponse>("/api/account/profile");
      return response;
    },
  });
};
```

---

### 8.2 useUpdateProfile

#### 파일: `src/features/account/hooks/useUpdateProfile.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type { UpdateProfileRequest, ProfileResponse } from "../lib/dto";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await apiClient.put<ProfileResponse>("/api/account/profile", data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["account", "profile"], data);
    },
  });
};
```

---

### 8.3 useSettings

#### 파일: `src/features/account/hooks/useSettings.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type { SettingsResponse } from "../lib/dto";

export const useSettings = () => {
  return useQuery({
    queryKey: ["account", "settings"],
    queryFn: async () => {
      const response = await apiClient.get<SettingsResponse>("/api/account/settings");
      return response;
    },
  });
};
```

---

### 8.4 useUpdateSettings

#### 파일: `src/features/account/hooks/useUpdateSettings.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type { UpdateSettingsRequest, SettingsResponse } from "../lib/dto";

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSettingsRequest) => {
      const response = await apiClient.put<SettingsResponse>("/api/account/settings", data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["account", "settings"], data);
    },
  });
};
```

---

### 8.5 useAutoSave

#### 파일: `src/features/account/hooks/useAutoSave.ts`

```typescript
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "react-use";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  onSave: (data: T) => Promise<unknown>;
  debounceMs?: number;
}

export function useAutoSave<T>({ onSave, debounceMs = 2000 }: UseAutoSaveOptions<T>) {
  const [pendingData, setPendingData] = useState<T | null>(null);
  const [debouncedData, setDebouncedData] = useState<T | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Debounce pending data
  useDebounce(
    () => {
      if (pendingData !== null) {
        setDebouncedData(pendingData);
      }
    },
    debounceMs,
    [pendingData]
  );

  // Save when debounced data changes
  useEffect(() => {
    if (debouncedData === null) return;

    const save = async () => {
      setSaveStatus("saving");
      try {
        await onSave(debouncedData);
        setSaveStatus("saved");
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Auto save failed", error);
        setSaveStatus("error");
      }
    };

    void save();
  }, [debouncedData, onSave]);

  const save = useCallback((data: T) => {
    setPendingData(data);
  }, []);

  return {
    save,
    saveStatus,
  };
}
```

---

### 8.6 DTO 재노출

#### 파일: `src/features/account/lib/dto.ts`

```typescript
export type {
  ProfileResponse,
  UpdateProfileRequest,
  SettingsResponse,
  UpdateSettingsRequest,
} from "../backend/schema";
```

---

## 9. 데이터베이스 마이그레이션

### 9.1 account_settings 테이블 생성

#### 파일: `supabase/migrations/20250116000000_add_account_settings.sql`

```sql
-- =========================================
-- Account Settings Table
-- =========================================

CREATE TABLE IF NOT EXISTS account_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Content Preferences
  brand_name TEXT,
  brand_description TEXT,
  target_audience TEXT,
  tone TEXT CHECK (tone IN ('friendly', 'professional', 'casual', 'formal')),
  language TEXT CHECK (language IN ('ko', 'en')) DEFAULT 'ko',

  -- Notification Preferences
  email_updates BOOLEAN DEFAULT true,
  weekly_report BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- 각 profile당 하나의 settings만 존재
  UNIQUE(profile_id)
);

-- RLS 비활성화 (요구사항)
ALTER TABLE account_settings DISABLE ROW LEVEL SECURITY;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_account_settings_profile_id ON account_settings(profile_id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_account_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_account_settings_updated_at
BEFORE UPDATE ON account_settings
FOR EACH ROW
EXECUTE FUNCTION update_account_settings_updated_at();

-- 코멘트
COMMENT ON TABLE account_settings IS '사용자 계정 설정 (콘텐츠 선호도 및 알림)';
COMMENT ON COLUMN account_settings.brand_name IS '브랜드 이름';
COMMENT ON COLUMN account_settings.brand_description IS '브랜드 설명';
COMMENT ON COLUMN account_settings.target_audience IS '타겟 독자';
COMMENT ON COLUMN account_settings.tone IS '작성 톤 (friendly, professional, casual, formal)';
COMMENT ON COLUMN account_settings.language IS '선호 언어 (ko, en)';
COMMENT ON COLUMN account_settings.email_updates IS '이메일 업데이트 수신 여부';
COMMENT ON COLUMN account_settings.weekly_report IS '주간 리포트 수신 여부';
```

**주의사항:**
- 이 SQL 파일을 생성 후, **사용자가 직접 Supabase에 적용**해야 합니다.
- 로컬에서 `supabase db push` 또는 Supabase Dashboard에서 실행

---

## 10. 페이지 통합

### 10.1 Account Page 수정

#### 파일: `src/app/[locale]/(protected)/account/page.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/layout/page-layout";
import { AccountPage as AccountPageComponent } from "@/features/account/components/account-page";

type AccountPageProps = {
  params: Promise<Record<string, never>>;
};

export default function AccountPage({ params }: AccountPageProps) {
  void params;
  const t = useTranslations("common");

  return (
    <PageLayout
      title={t("account_management")}
      description={t("account_management_description")}
      maxWidthClassName="max-w-4xl"
    >
      <AccountPageComponent />
    </PageLayout>
  );
}
```

**변경 사항:**
- `"Coming Soon"` 제거
- `AccountPageComponent` 렌더링
- `maxWidthClassName`을 `max-w-4xl`로 설정 (넉넉한 폭)

---

## 11. 스타일링 가이드

### 11.1 Tailwind 클래스 패턴

**일관된 스타일:**
- **섹션 간격**: `space-y-8` (32px)
- **카드 패딩**: `p-6` (24px)
- **입력 그룹 간격**: `space-y-4` (16px)
- **필드 레이블-입력 간격**: `space-y-2` (8px)
- **최대 너비**: `max-w-md` (448px) 또는 `max-w-2xl` (672px)

**반응형:**
- 모바일: 기본 스타일
- 태블릿 이상: `sm:flex-row`, `md:px-6` 등 사용
- Avatar: `h-24 w-24` (모바일), 동일 크기 유지

**색상:**
- 기본 텍스트: `text-foreground`
- 보조 텍스트: `text-muted-foreground`
- 에러: `text-destructive`
- 성공: `text-green-600 dark:text-green-400`
- 카드: `bg-card`, `border-border`

### 11.2 다크모드

- Tailwind의 `dark:` prefix 사용
- 별도 색상 정의 불필요 (globals.css의 CSS 변수 활용)
- 예: `dark:text-green-400`, `dark:bg-muted`

---

## 12. 성능 고려사항

### 12.1 애니메이션 최적화

**CSS Transitions 우선:**
```tsx
// ✅ 대부분의 경우 충분
<Card className="transition-shadow hover:shadow-md">

// ❌ 불필요한 framer-motion
<motion.div whileHover={{ scale: 1.02 }}>
```

**framer-motion은 최소한:**
- 모달 진입/퇴장만 사용
- 페이지 전환 애니메이션 (선택)
- 복잡한 순서 애니메이션 (선택)

### 12.2 이미지 최적화

- **TODO (Phase 1.5)**: Supabase Storage 연동
- 클라이언트 리사이징: `browser-image-resizer` 사용
- WebP 포맷 권장
- `width`, `height` 명시 (Next.js Image)

### 12.3 데이터 페칭

- React Query 캐싱 활용
- `staleTime` 설정 (예: 5분)
- 불필요한 refetch 방지

---

## 13. 접근성 체크리스트

- [x] 모든 입력에 `<Label>` 연결 (`htmlFor` 속성)
- [x] 버튼에 명확한 텍스트 또는 `aria-label`
- [x] 키보드 네비게이션 지원 (기본 HTML 요소 사용)
- [x] 색상 대비 충분 (Tailwind 기본값 준수)
- [x] 로딩 상태 명시 (`Loader2` 아이콘 + 텍스트)
- [x] 에러 메시지 명확 (`AlertCircle` + 텍스트)
- [ ] 스크린 리더 테스트 (배포 전 권장)

---

## 14. 테스트 계획

### 14.1 단위 테스트 (Vitest)

**우선순위:**
- [ ] `useAutoSave` 훅 테스트
- [ ] `service.ts` 함수 테스트
- [ ] 스키마 검증 테스트

**예시:**
```typescript
// src/features/account/hooks/useAutoSave.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useAutoSave } from "./useAutoSave";

describe("useAutoSave", () => {
  it("should debounce and save data", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({ onSave, debounceMs: 100 })
    );

    result.current.save({ fullName: "Test" });

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ fullName: "Test" }));
  });
});
```

### 14.2 E2E 테스트 (Playwright)

**중요 시나리오:**
- [ ] 프로필 이름 수정 후 자동 저장
- [ ] 알림 토글 변경 후 즉시 저장
- [ ] 콘텐츠 설정 수정 후 자동 저장
- [ ] 로딩/에러 상태 표시

**예시:**
```typescript
// e2e/account.spec.ts
import { test, expect } from "@playwright/test";

test("should update profile name", async ({ page }) => {
  await page.goto("/account");

  const nameInput = page.getByLabel("이름");
  await nameInput.fill("홍길동");

  // 2초 대기 (debounce)
  await page.waitForTimeout(2500);

  // 저장 완료 확인
  await expect(page.getByText(/저장됨/)).toBeVisible();
});
```

---

## 15. 구현 체크리스트

### Phase 1: Profile Section (MVP)

#### Step 1: 데이터베이스
- [ ] `account_settings` 테이블 마이그레이션 작성
- [ ] Supabase에 마이그레이션 적용
- [ ] 테이블 생성 확인

#### Step 2: 백엔드
- [ ] `src/features/account/backend/schema.ts` 작성
- [ ] `src/features/account/backend/error.ts` 작성
- [ ] `src/features/account/backend/service.ts` 작성
- [ ] `src/features/account/backend/route.ts` 작성
- [ ] `src/backend/hono/app.ts` 에 `registerAccountRoutes` 추가
- [ ] Hono 앱 재시작 후 엔드포인트 테스트

#### Step 3: 프론트엔드 훅
- [ ] `src/features/account/lib/dto.ts` 작성
- [ ] `src/features/account/hooks/useProfile.ts` 작성
- [ ] `src/features/account/hooks/useUpdateProfile.ts` 작성
- [ ] `src/features/account/hooks/useAutoSave.ts` 작성
- [ ] 각 훅 단위 테스트 작성 (선택)

#### Step 4: UI 컴포넌트
- [ ] `src/features/account/components/section-card.tsx` 작성
- [ ] `src/features/account/components/auto-save-indicator.tsx` 작성
- [ ] `src/features/account/components/profile-section.tsx` 작성
- [ ] 컴포넌트 동작 확인 (Storybook 또는 직접 렌더링)

#### Step 5: 페이지 통합 및 i18n
- [ ] `src/features/account/components/account-page.tsx` 작성
- [ ] `src/app/[locale]/(protected)/account/page.tsx` 수정
- [ ] `messages/ko.json` 에 `account.*` 키 추가
- [ ] `messages/en.json` 에 `account.*` 키 추가
- [ ] 브라우저에서 `/account` 접속 확인
- [ ] "Coming Soon" 제거 확인

#### Step 6: 테스트 및 배포
- [ ] 프로필 이름 수정 테스트
- [ ] 자동 저장 피드백 확인
- [ ] 모바일 반응형 확인
- [ ] 다크모드 확인
- [ ] E2E 테스트 작성 및 실행
- [ ] Phase 1 배포

---

### Phase 2: Content Preferences + Notifications

#### Step 1: 백엔드 확장
- [ ] `service.ts` 에 `getSettingsByProfileId`, `updateSettingsByProfileId`, `ensureSettings` 추가
- [ ] `route.ts` 에 `/api/account/settings` GET/PUT 추가
- [ ] 스키마 및 에러 코드 확인
- [ ] 엔드포인트 테스트

#### Step 2: 프론트엔드 훅
- [ ] `src/features/account/hooks/useSettings.ts` 작성
- [ ] `src/features/account/hooks/useUpdateSettings.ts` 작성
- [ ] `useAutoSave` 확장 (settings 지원)

#### Step 3: UI 컴포넌트
- [ ] `src/features/account/components/content-preferences-section.tsx` 작성
- [ ] `src/features/account/components/notifications-section.tsx` 작성
- [ ] `account-page.tsx` 에 섹션 추가

#### Step 4: i18n
- [ ] `messages/ko.json` 에 contentPreferences, notifications 키 추가
- [ ] `messages/en.json` 에 contentPreferences, notifications 키 추가

#### Step 5: 테스트 및 배포
- [ ] 콘텐츠 설정 수정 테스트
- [ ] 알림 토글 테스트
- [ ] 자동 저장 안정성 확인
- [ ] E2E 테스트 추가
- [ ] Phase 2 배포

---

## 16. 리스크 및 완화 전략

### 16.1 기술적 리스크

| 리스크 | 영향 | 확률 | 완화 전략 |
|--------|------|------|-----------|
| Supabase Storage 설정 누락 | 이미지 업로드 불가 | 중간 | Phase 1.5로 분리, Clerk 아바타 fallback |
| 자동 저장 충돌 | 데이터 손실 | 낮음 | debounce + 필드별 독립 저장 |
| i18n 키 누락 | 런타임 에러 | 낮음 | ESLint 규칙, 배포 전 체크 |
| 백엔드 라우터 미등록 | 404 에러 | 낮음 | 개발 중 즉시 테스트 |

### 16.2 UX 리스크

| 리스크 | 영향 | 확률 | 완화 전략 |
|--------|------|------|-----------|
| MVP 기능 부족 인식 | 사용자 실망 | 중간 | Phase 2 빠른 배포, 로드맵 공유 |
| 자동 저장 신뢰 부족 | 사용자 불안 | 중간 | 명확한 AutoSaveIndicator, "Save" 버튼 추가 옵션 |
| 복잡한 설정 화면 | 사용자 이탈 | 낮음 | Phase별 점진적 추가, 간소화된 UI |

---

## 17. 최종 권장사항

### 17.1 즉시 시작 (This Week)

1. **Step 1: 데이터베이스 마이그레이션** (0.5일)
   - `account_settings` 테이블 생성
   - Supabase에 적용 및 확인

2. **Step 2-3: 백엔드 + 훅 구현** (1일)
   - schema, error, service, route 작성
   - 프론트엔드 훅 작성
   - 엔드포인트 테스트

3. **Step 4-5: UI 구현 및 통합** (1일)
   - 컴포넌트 작성
   - 페이지 통합
   - i18n 추가
   - 브라우저 테스트

### 17.2 다음 주 (Next Week)

4. **Phase 2 구현** (2-3일)
   - Content Preferences 섹션
   - Notifications 섹션
   - 테스트 및 배포

### 17.3 피해야 할 함정

1. ❌ **과도한 애니메이션**: CSS transitions로 충분
2. ❌ **컴포넌트 과다 분할**: 7개로 충분
3. ❌ **완벽주의**: MVP 배포 후 개선
4. ❌ **i18n 무시**: 처음부터 적용

### 17.4 성공 지표

**Phase 1 (MVP):**
- [x] "Coming Soon" 제거
- [x] 프로필 정보 표시 및 수정 가능
- [x] 자동 저장 피드백 명확
- [x] 모바일 반응형
- [x] i18n 한국어/영어 지원
- [x] 1-2일 내 배포

**Phase 2:**
- [x] Style Guide 수정 가능
- [x] 알림 설정 토글 작동
- [x] 자동 저장 안정적
- [x] 사용자 피드백 긍정적 (70% 이상)

---

## 결론

이 구현 계획은 **1-plan-critic.md의 개선안**을 반영하여:

1. **단순성**: 3개 섹션 (Phase 1-2), 7개 컴포넌트, 5개 API
2. **실용성**: 코드베이스 패턴 준수, 구현 가능
3. **사용자 중심**: 명확한 i18n, 자동 저장, 반응형
4. **점진적**: Phase 1 (MVP) → Phase 2 (핵심 설정)

**지금 바로 Step 1 (데이터베이스 마이그레이션)부터 시작하세요!** 🚀

---

**작성일**: 2025-01-16
**대상 페이지**: `/account`
**예상 소요 시간**: Phase 1 (2-3일) + Phase 2 (2-3일) = **4-6일**
