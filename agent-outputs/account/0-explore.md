# Account 페이지 분석 및 개선안

## 1. 현재 상태 분석

### 1.1 페이지 구조

**현재 구현 상태:**
- 파일: `/src/app/[locale]/(protected)/account/page.tsx`
- 레이아웃: `PageLayout` 컴포넌트 사용
- 컨텐츠: **완전히 비어있음** (`<></>`)
- 상태: "Coming Soon" 메시지만 표시

**현재 코드:**
```typescript
export default function AccountPage({ params }: AccountPageProps) {
  void params;
  const t = useTranslations();

  return (
    <PageLayout
      title={t("common.account_management")}
      description={t("common.coming_soon")}
      maxWidthClassName="max-w-3xl"
    >
      <></>
    </PageLayout>
  );
}
```

**사용 가능한 데이터:**
- `profiles` 테이블: 사용자 프로필 정보
  - `id`, `clerk_user_id`, `email`, `full_name`, `image_url`
- `style_guides` 테이블: 사용자 온보딩 설정
  - 브랜드 정보, 타겟 오디언스, 언어, 톤, 콘텐츠 길이 등

### 1.2 강점

1. **기본 레이아웃 구조**: `PageLayout` 컴포넌트로 일관된 페이지 구조 제공
2. **다국어 지원**: next-intl을 통한 i18n 준비 완료
3. **인증 시스템**: Clerk 기반 사용자 인증 구현
4. **디자인 시스템**: shadcn-ui 기반 일관된 UI 컴포넌트 사용 가능
5. **데이터베이스 스키마**: 프로필 및 스타일 가이드 정보 저장 준비 완료

### 1.3 약점 및 개선 필요 부분 (엄격한 피드백)

#### 🚨 심각한 문제점

1. **페이지가 완전히 비어있음**
   - 사용자 계정 관리의 핵심 기능이 전혀 구현되지 않음
   - "Coming Soon"으로 미완성 상태를 노출하는 것은 프로덕션 레벨에서 용납 불가
   - 최소한의 프로필 정보 표시라도 제공해야 함

2. **정보 아키텍처 부재**
   - 어떤 설정을 어떻게 구조화할지 계획이 없음
   - 사용자가 무엇을 할 수 있는지 명확하지 않음

3. **UX 리서치 부족**
   - 사용자가 실제로 관리하고 싶어하는 설정이 무엇인지 고려하지 않음
   - 업계 표준 계정 설정 페이지 패턴을 참조하지 않음

4. **접근성 문제**
   - 스크린 리더 사용자를 위한 구조가 없음
   - 키보드 내비게이션 지원 불가

5. **모바일 최적화 부재**
   - 복잡한 설정을 모바일에서 어떻게 표시할지 고려하지 않음

#### 🔶 기능적 결함

1. **프로필 관리 없음**
   - 사용자 이름, 이메일, 프로필 이미지 수정 불가
   - DB에 `profiles` 테이블이 있지만 활용하지 않음

2. **스타일 가이드 수정 불가**
   - 온보딩에서 설정한 브랜드 정보 수정 불가
   - 사용자가 설정을 변경하고 싶어도 방법이 없음

3. **보안 설정 부재**
   - 비밀번호 변경, 2FA 설정 등 보안 기능 없음
   - 세션 관리, 로그인 기록 확인 불가

4. **알림 설정 없음**
   - 이메일 알림 관리 불가
   - 사용자 경험 개인화 불가

5. **데이터 관리 없음**
   - 계정 삭제, 데이터 내보내기 등 GDPR 준수 기능 부재

#### 🔷 UI/UX 디자인 결함

1. **시각적 계층 구조 없음**
   - 설정 카테고리 구분 없음
   - 중요도에 따른 정보 배치 없음

2. **피드백 시스템 없음**
   - 저장 성공/실패 알림 없음
   - 로딩 상태 표시 없음
   - 유효성 검사 피드백 없음

3. **인터랙션 디자인 부재**
   - 애니메이션 없음
   - 상태 전환 효과 없음
   - 사용자 행동 유도 없음

4. **다크모드 고려 없음**
   - 현재 디자인 시스템에 다크모드 지원이 있지만 활용 계획 없음

---

## 2. 개선된 페이지 구성

### 2.1 정보 아키텍처

```
Account Settings
├── Profile Section (항상 보임)
│   ├── Avatar
│   ├── Display Name
│   └── Email
│
├── Content Preferences (스타일 가이드 기반)
│   ├── Brand Voice
│   ├── Target Audience
│   ├── Language Settings
│   └── Writing Style
│
├── Security
│   ├── Password (Clerk 통합)
│   ├── Two-Factor Authentication
│   └── Active Sessions
│
├── Notifications
│   ├── Email Preferences
│   └── In-App Notifications
│
└── Danger Zone
    ├── Export Data
    └── Delete Account
```

### 2.2 Profile Section

**목적**: 사용자 기본 정보 표시 및 수정

**구성 요소**:
- 프로필 이미지 업로드/변경
- 이름 편집 (인라인 편집)
- 이메일 표시 (읽기 전용, Clerk 관리)
- 계정 생성일 표시

**인터랙션**:
- 프로필 이미지 호버 시 "Change Photo" 오버레이
- 이름 클릭 시 인라인 편집 모드 전환
- 자동 저장 with debounce

### 2.3 Content Preferences Section

**목적**: 블로그 콘텐츠 생성 스타일 관리

**구성 요소**:
- Brand Voice: 브랜드명, 설명, 성격, 격식 수준
- Target Audience: 타겟 독자, 해결 문제
- Language: 콘텐츠 언어 (한국어/영어)
- Writing Style: 톤, 길이, 난이도

**인터랙션**:
- 섹션별 편집 모드 토글
- 미리보기 패널 (실시간 변경사항 반영)
- "Reset to defaults" 옵션

### 2.4 Security Section

**목적**: 계정 보안 관리

**구성 요소**:
- 비밀번호 변경 (Clerk 통합)
- 2FA 설정 토글
- 활성 세션 목록 (기기, 위치, 마지막 접속)

**인터랙션**:
- 민감한 작업 시 재인증 요구
- 세션별 로그아웃 버튼
- 모든 세션 로그아웃 옵션

### 2.5 Notifications Section

**목적**: 알림 설정 관리

**구성 요소**:
- 이메일 알림 (새 기능, 업데이트)
- 콘텐츠 생성 완료 알림
- 주간 리포트 구독

**인터랙션**:
- 토글 스위치로 간편 on/off
- 즉시 저장 (별도 Save 버튼 불필요)

### 2.6 Danger Zone Section

**목적**: 위험한 작업 관리

**구성 요소**:
- 데이터 내보내기 (JSON)
- 계정 삭제

**인터랙션**:
- 명확한 경고 메시지
- 2단계 확인 프로세스
- 되돌릴 수 없음 강조

---

## 3. 참고 레퍼런스

### 3.1 업계 표준 패턴 (2025)

**설정 페이지 조직화 패턴:**
- **카테고리별 그룹화**: 관련 설정을 섹션으로 묶기
- **검색 가능성**: 많은 설정이 있을 때 검색 기능 제공
- **단순한 언어**: 기술 용어 대신 사용자 친화적 설명
- **즉시 피드백**: 변경사항 자동 저장 및 알림

**시각적 패턴:**
- 왼쪽 사이드바 내비게이션 (데스크톱)
- 상단 탭 또는 아코디언 (모바일)
- 카드 기반 레이아웃
- 섹션 구분선 및 여백

### 3.2 Modern SaaS Account Settings 참고

#### Slack Settings 패턴
- 섹션별 명확한 구분
- 토글 스위치 활용
- 인라인 편집
- 즉시 저장

#### GitHub Settings 패턴
- 왼쪽 내비게이션 메뉴
- 섹션별 페이지 분리
- Danger Zone 시각적 강조 (빨간색 테두리)
- 명확한 설명문

#### Notion Settings 패턴
- 미니멀한 디자인
- 섹션 아이콘 활용
- 부드러운 애니메이션
- 설정 검색 기능

### 3.3 적용 방법 및 이유

**1. 단일 페이지 vs 다중 페이지**
- **선택**: 단일 페이지 스크롤 (현재 설정 개수가 적음)
- **이유**:
  - 설정 카테고리가 6개로 관리 가능
  - 페이지 전환 없이 모든 설정 접근 가능
  - 모바일에서도 자연스러운 스크롤

**2. 자동 저장 vs 명시적 저장**
- **선택**: 혼합 접근
  - 토글/선택: 즉시 저장
  - 텍스트 입력: Debounced 자동 저장
  - 위험한 작업: 명시적 확인 버튼
- **이유**:
  - 사용자 편의성 극대화
  - 의도치 않은 변경 방지
  - 명확한 피드백 제공

**3. 레이아웃 구조**
- **선택**: 카드 기반 섹션 레이아웃
- **이유**:
  - 시각적 그룹화 명확
  - 반응형 디자인 용이
  - 섹션별 독립적 관리

**4. 인터랙션 패턴**
- **선택**: 점진적 공개 (Progressive Disclosure)
- **이유**:
  - 초기 화면 복잡도 감소
  - 필요한 정보만 노출
  - 고급 설정은 확장 가능

---

## 4. UI 디자인 컨셉

### 4.1 컬러 시스템

```typescript
const accountPageColors = {
  // 기본 (globals.css 기반)
  background: "hsl(0 0% 100%)", // 배경
  foreground: "hsl(240 10% 3.9%)", // 본문 텍스트

  // 카드
  card: "hsl(0 0% 100%)", // 섹션 카드 배경
  cardBorder: "hsl(240 5.9% 90%)", // 카드 테두리

  // 입력 필드
  input: "hsl(240 5.9% 90%)", // 입력 배경
  inputFocus: "hsl(240 10% 3.9%)", // 포커스 링

  // 상태
  muted: "hsl(240 4.8% 95.9%)", // 비활성
  mutedForeground: "hsl(240 3.8% 46.1%)", // 보조 텍스트

  // 액션
  primary: "hsl(240 5.9% 10%)", // 주요 버튼
  primaryForeground: "hsl(60 9.1% 97.8%)", // 버튼 텍스트

  // 경고 (Danger Zone)
  destructive: "hsl(0 84.2% 60.2%)", // 삭제 버튼
  destructiveForeground: "hsl(60 9.1% 97.8%)", // 경고 텍스트

  // 성공 피드백
  success: "hsl(142 76% 36%)", // 저장 성공
  successForeground: "hsl(60 9.1% 97.8%)",

  // 다크모드
  dark: {
    background: "hsl(0 0% 3.9%)",
    foreground: "hsl(0 0% 98%)",
    card: "hsl(0 0% 3.9%)",
    border: "hsl(0 0% 14.9%)",
  }
};
```

**사용 예시:**
```tsx
// 섹션 카드
<Card className="border-border bg-card">

// 위험 영역
<Card className="border-destructive/20 bg-destructive/5">

// 성공 토스트
<Toast className="bg-success text-success-foreground">
```

### 4.2 타이포그래피

```typescript
const typography = {
  // 페이지 제목
  pageTitle: {
    fontSize: "30px", // 3xl
    fontWeight: "700", // bold
    lineHeight: "1.2",
    color: "var(--foreground)",
  },

  // 섹션 제목
  sectionTitle: {
    fontSize: "20px", // xl
    fontWeight: "600", // semibold
    lineHeight: "1.4",
    color: "var(--foreground)",
  },

  // 서브 제목
  subTitle: {
    fontSize: "16px", // base
    fontWeight: "500", // medium
    lineHeight: "1.5",
    color: "var(--muted-foreground)",
  },

  // 본문
  body: {
    fontSize: "14px", // sm
    fontWeight: "400", // normal
    lineHeight: "1.6",
    color: "var(--foreground)",
  },

  // 캡션
  caption: {
    fontSize: "12px", // xs (커스텀 필요)
    fontWeight: "400",
    lineHeight: "1.5",
    color: "var(--muted-foreground)",
  },

  // 레이블
  label: {
    fontSize: "14px", // sm
    fontWeight: "500", // medium
    lineHeight: "1.5",
    color: "var(--foreground)",
  },
};
```

**계층 구조:**
1. 페이지 제목 (30px/bold)
2. 섹션 제목 (20px/semibold)
3. 입력 레이블 (14px/medium)
4. 본문 및 설명 (14px/normal)
5. 보조 정보 (12px/normal)

### 4.3 간격 시스템

```typescript
const spacing = {
  // 섹션 간격
  sectionGap: "space-y-8", // 32px (2rem)

  // 카드 내부 패딩
  cardPadding: "p-6", // 24px (1.5rem)

  // 입력 그룹 간격
  inputGroupGap: "space-y-4", // 16px (1rem)

  // 레이블-입력 간격
  labelInputGap: "space-y-2", // 8px (0.5rem)

  // 버튼 그룹 간격
  buttonGroupGap: "space-x-3", // 12px (0.75rem)

  // 아바타-텍스트 간격
  avatarTextGap: "space-x-4", // 16px (1rem)

  // 페이지 컨테이너
  containerPadding: "px-4 py-8", // x:16px, y:32px
};
```

**사용 예시:**
```tsx
// 섹션 구조
<div className="space-y-8">
  <Card className="p-6">
    <div className="space-y-4">
      <Label />
      <Input />
    </div>
  </Card>
</div>
```

### 4.4 카드/컴포넌트 스타일

```typescript
const cardStyles = {
  // 기본 섹션 카드
  default: "rounded-lg border border-border bg-card p-6 shadow-sm",

  // 호버 효과
  hoverable: "rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",

  // Danger Zone 카드
  danger: "rounded-lg border border-destructive/20 bg-destructive/5 p-6",

  // 하이라이트 카드 (프로필)
  highlight: "rounded-lg border-2 border-primary/10 bg-card p-6 shadow-sm",
};

const inputStyles = {
  // 기본 입력
  default: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",

  // 포커스 상태
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

  // 비활성 상태
  disabled: "disabled:cursor-not-allowed disabled:opacity-50",
};

const buttonStyles = {
  // 주요 액션
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",

  // 보조 액션
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",

  // 삭제 버튼
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",

  // 고스트 버튼
  ghost: "hover:bg-accent hover:text-accent-foreground",
};
```

### 4.5 다크모드 고려사항

```typescript
const darkModeStrategy = {
  // 자동 전환
  detection: "system preference + manual toggle",

  // 색상 조정
  colors: {
    background: "dark:bg-background", // hsl(0 0% 3.9%)
    text: "dark:text-foreground", // hsl(0 0% 98%)
    card: "dark:bg-card", // hsl(0 0% 3.9%)
    border: "dark:border-border", // hsl(0 0% 14.9%)
  },

  // 이미지 처리
  images: {
    avatar: "dark:ring-2 dark:ring-border",
    icons: "dark:opacity-90",
  },

  // 그림자 조정
  shadows: {
    light: "shadow-sm",
    dark: "dark:shadow-none dark:ring-1 dark:ring-border",
  },
};
```

**다크모드 구현 예시:**
```tsx
<Card className="bg-card dark:bg-card border-border dark:border-border shadow-sm dark:shadow-none dark:ring-1 dark:ring-border">
  <Avatar className="ring-2 ring-border dark:ring-border" />
</Card>
```

---

## 5. 섹션별 컴포넌트 명세

### 5.1 Profile Section

#### ProfileSection Component
- **파일**: `src/features/account/components/profile-section.tsx`
- **Props**:
```typescript
interface ProfileSectionProps {
  profile: {
    id: string;
    email: string | null;
    fullName: string | null;
    imageUrl: string | null;
    createdAt: string;
  };
  onUpdate: (data: ProfileUpdateData) => Promise<void>;
  isUpdating: boolean;
}

interface ProfileUpdateData {
  fullName?: string;
  imageUrl?: string;
}
```

- **하위 컴포넌트**:
  - `ProfileAvatar`: 프로필 이미지 표시 및 업로드
  - `ProfileNameEditor`: 인라인 이름 편집
  - `ProfileEmail`: 이메일 표시 (읽기 전용)
  - `ProfileMeta`: 계정 생성일 등 메타 정보

- **상태 관리**:
```typescript
const [isEditingName, setIsEditingName] = useState(false);
const [name, setName] = useState(profile.fullName || "");
const debouncedUpdate = useDebouncedCallback(
  (value: string) => onUpdate({ fullName: value }),
  1000
);
```

#### ProfileAvatar Component
- **파일**: `src/features/account/components/profile-avatar.tsx`
- **Props**:
```typescript
interface ProfileAvatarProps {
  imageUrl: string | null;
  name: string | null;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}
```

- **기능**:
  - 이미지 표시 (없으면 이니셜)
  - 호버 시 "Change Photo" 오버레이
  - 클릭 시 파일 업로드 대화상자
  - 드래그 앤 드롭 지원

#### ProfileNameEditor Component
- **파일**: `src/features/account/components/profile-name-editor.tsx`
- **Props**:
```typescript
interface ProfileNameEditorProps {
  name: string | null;
  isEditing: boolean;
  onEdit: () => void;
  onChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}
```

- **기능**:
  - 클릭 시 편집 모드 전환
  - ESC 키로 취소
  - Enter 키로 저장
  - 외부 클릭 시 자동 저장

### 5.2 Content Preferences Section

#### ContentPreferencesSection Component
- **파일**: `src/features/account/components/content-preferences-section.tsx`
- **Props**:
```typescript
interface ContentPreferencesSectionProps {
  styleGuide: {
    brandName: string;
    brandDescription: string;
    personality: string[];
    formality: "casual" | "neutral" | "formal";
    targetAudience: string;
    painPoints: string;
    language: "ko" | "en";
    tone: "professional" | "friendly" | "inspirational" | "educational";
    contentLength: "short" | "medium" | "long";
    readingLevel: "beginner" | "intermediate" | "advanced";
  } | null;
  onUpdate: (data: Partial<StyleGuide>) => Promise<void>;
  isUpdating: boolean;
}
```

- **하위 컴포넌트**:
  - `BrandVoiceCard`: 브랜드 정보 편집
  - `TargetAudienceCard`: 타겟 독자 편집
  - `LanguageCard`: 언어 설정
  - `WritingStyleCard`: 작성 스타일 편집
  - `PreviewPanel`: 변경사항 미리보기

#### BrandVoiceCard Component
- **파일**: `src/features/account/components/brand-voice-card.tsx`
- **Props**:
```typescript
interface BrandVoiceCardProps {
  brandName: string;
  brandDescription: string;
  personality: string[];
  formality: "casual" | "neutral" | "formal";
  onUpdate: (data: BrandVoiceData) => void;
  isExpanded: boolean;
  onToggle: () => void;
}
```

- **기능**:
  - 접기/펼치기 토글
  - 실시간 유효성 검사
  - 변경사항 자동 저장 (debounced)
  - "Reset to defaults" 버튼

### 5.3 Security Section

#### SecuritySection Component
- **파일**: `src/features/account/components/security-section.tsx`
- **Props**:
```typescript
interface SecuritySectionProps {
  user: {
    email: string;
    hasPassword: boolean;
    twoFactorEnabled: boolean;
  };
  sessions: {
    id: string;
    device: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }[];
  onPasswordChange: () => void;
  onToggle2FA: (enabled: boolean) => Promise<void>;
  onLogoutSession: (sessionId: string) => Promise<void>;
  onLogoutAll: () => Promise<void>;
}
```

- **하위 컴포넌트**:
  - `PasswordChangeButton`: Clerk UI 호출
  - `TwoFactorToggle`: 2FA 활성화/비활성화
  - `SessionsList`: 활성 세션 목록
  - `SessionItem`: 개별 세션 정보

#### TwoFactorToggle Component
- **파일**: `src/features/account/components/two-factor-toggle.tsx`
- **Props**:
```typescript
interface TwoFactorToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<void>;
  isToggling: boolean;
}
```

- **기능**:
  - 토글 스위치
  - 활성화 시 QR 코드 표시 대화상자
  - 비활성화 시 확인 대화상자
  - 로딩 상태 표시

### 5.4 Notifications Section

#### NotificationsSection Component
- **파일**: `src/features/account/components/notifications-section.tsx`
- **Props**:
```typescript
interface NotificationsSectionProps {
  preferences: {
    emailUpdates: boolean;
    contentComplete: boolean;
    weeklyReport: boolean;
    marketingEmails: boolean;
  };
  onUpdate: (key: keyof NotificationPreferences, value: boolean) => Promise<void>;
  isUpdating: string | null; // 현재 업데이트 중인 키
}
```

- **하위 컴포넌트**:
  - `NotificationToggle`: 개별 알림 토글
  - `NotificationDescription`: 알림 설명

#### NotificationToggle Component
- **파일**: `src/features/account/components/notification-toggle.tsx`
- **Props**:
```typescript
interface NotificationToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<void>;
  isToggling: boolean;
}
```

- **기능**:
  - 즉시 저장
  - 낙관적 UI 업데이트
  - 실패 시 롤백
  - 토스트 피드백

### 5.5 Danger Zone Section

#### DangerZoneSection Component
- **파일**: `src/features/account/components/danger-zone-section.tsx`
- **Props**:
```typescript
interface DangerZoneSectionProps {
  onExportData: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  isExporting: boolean;
  isDeleting: boolean;
}
```

- **하위 컴포넌트**:
  - `ExportDataButton`: 데이터 내보내기
  - `DeleteAccountButton`: 계정 삭제
  - `ConfirmationDialog`: 확인 대화상자

#### DeleteAccountButton Component
- **파일**: `src/features/account/components/delete-account-button.tsx`
- **Props**:
```typescript
interface DeleteAccountButtonProps {
  onDelete: () => Promise<void>;
  isDeleting: boolean;
}
```

- **기능**:
  - 2단계 확인 프로세스
  - "DELETE" 텍스트 입력 확인
  - 경고 메시지 강조
  - 되돌릴 수 없음 명시

### 5.6 공통 컴포넌트

#### SectionCard Component
- **파일**: `src/features/account/components/section-card.tsx`
- **Props**:
```typescript
interface SectionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger" | "highlight";
  children: React.ReactNode;
  actions?: React.ReactNode;
}
```

#### AutoSaveIndicator Component
- **파일**: `src/features/account/components/auto-save-indicator.tsx`
- **Props**:
```typescript
interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  lastSavedAt?: Date;
}
```

- **표시 상태**:
  - `idle`: 표시 안 함
  - `saving`: "Saving..." (회전 아이콘)
  - `saved`: "Saved" (체크 아이콘, 2초 후 사라짐)
  - `error`: "Failed to save" (에러 아이콘)

---

## 6. 애니메이션 명세 (framer-motion)

### 6.1 페이지 진입 애니메이션

#### AccountPage Container
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1], // easeInOutCubic
    },
  },
};
```

**사용 예시:**
```tsx
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
  className="space-y-8"
>
  <motion.div variants={sectionVariants}>
    <ProfileSection />
  </motion.div>
  <motion.div variants={sectionVariants}>
    <ContentPreferencesSection />
  </motion.div>
  {/* ... */}
</motion.div>
```

### 6.2 Profile Section Animations

#### ProfileAvatar
```typescript
const avatarVariants = {
  idle: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};
```

**사용 예시:**
```tsx
<motion.div
  variants={avatarVariants}
  initial="idle"
  whileHover="hover"
  className="relative"
>
  <Avatar />
  <motion.div
    variants={overlayVariants}
    initial="hidden"
    whileHover="visible"
    className="absolute inset-0 flex items-center justify-center bg-black/50"
  >
    <span>Change Photo</span>
  </motion.div>
</motion.div>
```

#### ProfileNameEditor
```typescript
const nameVariants = {
  view: {
    backgroundColor: "transparent",
    transition: { duration: 0.2 },
  },
  edit: {
    backgroundColor: "hsl(240 5.9% 90%)",
    transition: { duration: 0.2 },
  },
};

const iconVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 },
  },
};
```

### 6.3 Content Preferences Animations

#### 섹션 확장/축소
```typescript
const expandVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: "easeInOut" },
      opacity: { duration: 0.2, ease: "easeOut" },
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: "easeInOut" },
      opacity: { duration: 0.2, delay: 0.1, ease: "easeIn" },
    },
  },
};

const chevronVariants = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 },
};
```

**사용 예시:**
```tsx
<Card>
  <button onClick={toggle}>
    <h3>{title}</h3>
    <motion.div
      variants={chevronVariants}
      animate={isExpanded ? "expanded" : "collapsed"}
    >
      <ChevronDown />
    </motion.div>
  </button>

  <motion.div
    variants={expandVariants}
    initial="collapsed"
    animate={isExpanded ? "expanded" : "collapsed"}
    style={{ overflow: "hidden" }}
  >
    {children}
  </motion.div>
</Card>
```

#### PreviewPanel
```typescript
const previewVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      delay: 0.1,
    },
  },
};
```

### 6.4 Toggle/Switch Animations

#### Toggle Switch
```typescript
const switchVariants = {
  off: {
    backgroundColor: "hsl(240 5.9% 90%)",
    transition: { duration: 0.2 },
  },
  on: {
    backgroundColor: "hsl(240 5.9% 10%)",
    transition: { duration: 0.2 },
  },
};

const thumbVariants = {
  off: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
  on: {
    x: 20,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
};
```

**사용 예시:**
```tsx
<motion.button
  variants={switchVariants}
  animate={enabled ? "on" : "off"}
  className="relative h-6 w-11 rounded-full"
>
  <motion.div
    variants={thumbVariants}
    animate={enabled ? "on" : "off"}
    className="h-5 w-5 rounded-full bg-white"
  />
</motion.button>
```

### 6.5 Toast/Feedback Animations

#### AutoSaveIndicator
```typescript
const indicatorVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, delay: 2 },
  },
};

const iconVariants = {
  saving: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: "linear",
    },
  },
  saved: {
    scale: [0, 1.2, 1],
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  error: {
    x: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
    },
  },
};
```

**사용 예시:**
```tsx
<AnimatePresence>
  {status !== "idle" && (
    <motion.div
      variants={indicatorVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center gap-2"
    >
      <motion.div variants={iconVariants} animate={status}>
        {status === "saving" && <Loader className="h-4 w-4" />}
        {status === "saved" && <Check className="h-4 w-4" />}
        {status === "error" && <AlertCircle className="h-4 w-4" />}
      </motion.div>
      <span>{statusText}</span>
    </motion.div>
  )}
</AnimatePresence>
```

### 6.6 Danger Zone Animations

#### DeleteConfirmationDialog
```typescript
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

const dialogVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const warningVariants = {
  idle: {},
  shake: {
    x: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
    },
  },
};
```

**사용 예시:**
```tsx
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/50"
      />

      <motion.div
        variants={dialogVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 flex items-center justify-center"
      >
        <Card className="max-w-md">
          <motion.div
            variants={warningVariants}
            animate={hasError ? "shake" : "idle"}
          >
            <AlertTriangle className="text-destructive" />
            <h2>Delete Account?</h2>
            <p>This action cannot be undone.</p>
          </motion.div>
        </Card>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### 6.7 성능 고려사항

#### will-change 최적화
```typescript
// 애니메이션되는 요소에 will-change 적용
const optimizedVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    willChange: "opacity, transform",
  },
  visible: {
    opacity: 1,
    y: 0,
    willChange: "auto",
    transition: {
      duration: 0.4,
    },
  },
};
```

#### layoutId 사용 (공유 레이아웃 애니메이션)
```tsx
// 편집 모드 전환 시 부드러운 전환
<motion.div layoutId="profile-name">
  {isEditing ? (
    <Input value={name} onChange={handleChange} />
  ) : (
    <h2>{name}</h2>
  )}
</motion.div>
```

#### 조건부 애니메이션 (성능 향상)
```typescript
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const variants = prefersReducedMotion
  ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    }
  : {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    };
```

---

## 7. 구현 우선순위

### Phase 1: 필수 기능 (MVP)
**목표**: 사용자가 최소한의 프로필 관리를 할 수 있게 함

1. **Profile Section** (우선순위: 최고)
   - 프로필 이미지 표시 (아바타)
   - 이름 표시 및 인라인 편집
   - 이메일 표시 (읽기 전용)
   - 계정 생성일 표시
   - **예상 작업 시간**: 4-6시간
   - **근거**: 사용자가 가장 먼저 기대하는 기본 기능

2. **Content Preferences Section** (우선순위: 높음)
   - 기존 온보딩 데이터 표시
   - 브랜드 정보 수정
   - 타겟 오디언스 수정
   - **예상 작업 시간**: 6-8시간
   - **근거**: 온보딩 후 설정 변경 필요성 높음

3. **기본 레이아웃 및 네비게이션** (우선순위: 높음)
   - SectionCard 컴포넌트
   - AutoSaveIndicator 컴포넌트
   - 반응형 레이아웃
   - **예상 작업 시간**: 3-4시간
   - **근거**: 일관된 UX 제공

### Phase 2: 핵심 보안 기능
**목표**: 계정 보안 강화

4. **Security Section - Basic** (우선순위: 중간)
   - 비밀번호 변경 (Clerk 통합)
   - 활성 세션 목록 표시
   - **예상 작업 시간**: 4-5시간
   - **근거**: 보안은 중요하지만 Clerk이 대부분 처리

5. **Security Section - Advanced** (우선순위: 중간)
   - 2FA 설정 토글
   - 세션 로그아웃 기능
   - **예상 작업 시간**: 4-6시간
   - **근거**: 고급 사용자 보안 요구사항

### Phase 3: 사용자 경험 향상
**목표**: 세부적인 UX 개선

6. **Notifications Section** (우선순위: 중간)
   - 알림 설정 토글
   - 즉시 저장 기능
   - **예상 작업 시간**: 2-3시간
   - **근거**: 간단하지만 사용자 만족도 향상

7. **애니메이션 구현** (우선순위: 낮음-중간)
   - 페이지 진입 애니메이션
   - 섹션 확장/축소 애니메이션
   - 인터랙션 피드백 애니메이션
   - **예상 작업 시간**: 6-8시간
   - **근거**: 전문성 향상, 사용자 경험 개선

### Phase 4: 고급 기능
**목표**: 완전한 계정 관리

8. **Danger Zone Section** (우선순위: 낮음)
   - 데이터 내보내기
   - 계정 삭제
   - **예상 작업 시간**: 4-5시간
   - **근거**: GDPR 준수, 완성도

9. **미세 조정 및 최적화** (우선순위: 낮음)
   - 다크모드 완성
   - 접근성 개선
   - 성능 최적화
   - **예상 작업 시간**: 4-6시간
   - **근거**: 폴리싱, 프로덕션 준비

### 총 예상 작업 시간
- **Phase 1**: 13-18시간
- **Phase 2**: 8-11시간
- **Phase 3**: 8-11시간
- **Phase 4**: 8-11시간
- **총합**: 37-51시간 (약 5-7 근무일)

---

## 8. 성공 지표

### 8.1 기능 완성도
- [ ] 사용자가 프로필 정보를 조회하고 수정할 수 있음
- [ ] 온보딩 설정을 재편집할 수 있음
- [ ] 비밀번호를 변경할 수 있음 (Clerk 통합)
- [ ] 활성 세션을 관리할 수 있음
- [ ] 알림 설정을 제어할 수 있음
- [ ] 계정을 삭제할 수 있음 (확인 프로세스 포함)

### 8.2 UX 품질
- [ ] **즉시 피드백**: 모든 액션에 시각적 피드백 제공
- [ ] **자동 저장**: 사용자가 저장 버튼을 찾지 않아도 됨
- [ ] **에러 핸들링**: 명확한 에러 메시지 및 복구 방법 제시
- [ ] **로딩 상태**: 모든 비동기 작업에 로딩 인디케이터
- [ ] **반응형 디자인**: 모바일/태블릿/데스크톱 완벽 지원

### 8.3 전문성 (claude.ai 수준)
- [ ] **시각적 디자인**: 정돈되고 세련된 UI
- [ ] **타이포그래피**: 명확한 계층 구조
- [ ] **색상 사용**: 일관되고 의미 있는 색상 팔레트
- [ ] **간격**: 적절한 여백과 밀도
- [ ] **애니메이션**: 부드럽고 자연스러운 전환

### 8.4 접근성
- [ ] **키보드 내비게이션**: 모든 기능 키보드로 접근 가능
- [ ] **스크린 리더**: ARIA 레이블 및 역할 적용
- [ ] **색상 대비**: WCAG AA 이상 준수
- [ ] **포커스 표시**: 명확한 포커스 링
- [ ] **에러 식별**: 에러를 색상 외 방법으로도 표시

### 8.5 성능
- [ ] **초기 로드**: 2초 이내 FCP (First Contentful Paint)
- [ ] **인터랙션**: 100ms 이내 피드백
- [ ] **애니메이션**: 60fps 유지
- [ ] **번들 크기**: 페이지별 200KB 이하 (gzip)
- [ ] **이미지 최적화**: lazy loading, WebP 지원

### 8.6 다국어 지원
- [ ] 모든 텍스트가 i18n 키를 사용함
- [ ] 한국어/영어 완벽 지원
- [ ] RTL 레이아웃 대비 (향후 확장)

---

## 9. 기술 스택 및 의존성

### 9.1 필요한 라이브러리

```json
{
  "dependencies": {
    "framer-motion": "^11.x", // 애니메이션
    "react-hook-form": "^7.x", // 폼 관리
    "zod": "^3.x", // 스키마 검증
    "@tanstack/react-query": "^5.x", // 서버 상태 관리
    "react-dropzone": "^14.x", // 파일 업로드
    "date-fns": "^3.x" // 날짜 포맷팅
  }
}
```

### 9.2 필요한 shadcn-ui 컴포넌트

```bash
# 이미 설치된 것들
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add button
npx shadcn@latest add label
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add dialog
npx shadcn@latest add toast

# 추가로 필요한 것들
npx shadcn@latest add switch
npx shadcn@latest add alert-dialog
npx shadcn@latest add collapsible
```

### 9.3 API 엔드포인트 (구현 필요)

```typescript
// src/features/account/backend/route.ts
const routes = {
  // 프로필
  "GET /api/account/profile": getProfile,
  "PUT /api/account/profile": updateProfile,
  "POST /api/account/profile/avatar": uploadAvatar,

  // 스타일 가이드
  "GET /api/account/style-guide": getStyleGuide,
  "PUT /api/account/style-guide": updateStyleGuide,

  // 알림 설정
  "GET /api/account/notifications": getNotificationPreferences,
  "PUT /api/account/notifications": updateNotificationPreferences,

  // 세션 (Clerk 통합)
  "GET /api/account/sessions": getSessions,
  "DELETE /api/account/sessions/:id": revokeSession,

  // 데이터 관리
  "GET /api/account/export": exportUserData,
  "DELETE /api/account": deleteAccount,
};
```

---

## 10. 추가 고려사항

### 10.1 에러 처리 전략

```typescript
type AccountError =
  | { type: "NETWORK_ERROR"; message: string }
  | { type: "VALIDATION_ERROR"; field: string; message: string }
  | { type: "PERMISSION_ERROR"; message: string }
  | { type: "RATE_LIMIT_ERROR"; retryAfter: number }
  | { type: "UNKNOWN_ERROR"; message: string };

const errorMessages: Record<AccountError["type"], string> = {
  NETWORK_ERROR: "네트워크 연결을 확인해주세요.",
  VALIDATION_ERROR: "입력 정보를 확인해주세요.",
  PERMISSION_ERROR: "권한이 없습니다.",
  RATE_LIMIT_ERROR: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요.",
  UNKNOWN_ERROR: "오류가 발생했습니다. 다시 시도해주세요.",
};
```

### 10.2 테스트 전략

**Unit Tests**:
- 컴포넌트 렌더링 테스트
- 폼 유효성 검사 테스트
- API 호출 모킹 테스트

**E2E Tests**:
```typescript
// e2e/account.spec.ts
test.describe("Account Page", () => {
  test("should update profile name", async ({ page }) => {
    await page.goto("/account");
    await page.click('[data-testid="edit-name"]');
    await page.fill('input[name="name"]', "New Name");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Saved")).toBeVisible();
  });

  test("should toggle notification preferences", async ({ page }) => {
    await page.goto("/account");
    const toggle = page.locator('[data-testid="email-updates-toggle"]');
    await toggle.click();
    await expect(page.getByText("Saved")).toBeVisible();
  });
});
```

### 10.3 접근성 체크리스트

- [ ] 모든 이미지에 alt 텍스트
- [ ] 폼 필드에 레이블 연결
- [ ] 색상에만 의존하지 않는 정보 전달
- [ ] 충분한 색상 대비 (4.5:1 이상)
- [ ] 키보드 포커스 순서 논리적
- [ ] ARIA 역할 및 속성 적절히 사용
- [ ] 스크린 리더 테스트 (NVDA, VoiceOver)

---

## 11. 마이그레이션 계획 (DB)

### 11.1 필요한 마이그레이션

```sql
-- supabase/migrations/0010_add_notification_preferences.sql
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_updates BOOLEAN NOT NULL DEFAULT true,
  content_complete BOOLEAN NOT NULL DEFAULT true,
  weekly_report BOOLEAN NOT NULL DEFAULT true,
  marketing_emails BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_profile_id
  ON public.notification_preferences(profile_id);

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.notification_preferences DISABLE ROW LEVEL SECURITY;
```

---

## 12. 최종 권장사항

### 12.1 즉시 시작해야 할 작업

1. **Profile Section 구현** (Phase 1)
   - 가장 기본적이고 필수적인 기능
   - 사용자 경험 즉시 개선
   - 다른 섹션의 기반이 됨

2. **SectionCard 및 AutoSaveIndicator 컴포넌트** (Phase 1)
   - 재사용 가능한 기본 빌딩 블록
   - 일관된 UX 제공
   - 빠른 프로토타입 가능

3. **Content Preferences Section** (Phase 1)
   - 온보딩 데이터 활용
   - 사용자 만족도 직접적 향상
   - 비즈니스 가치 높음

### 12.2 피해야 할 함정

1. **과도한 기능 추가**
   - MVP에 집중할 것
   - 사용자 피드백 후 추가할 것

2. **애니메이션 과다**
   - 필요한 곳에만 적용
   - 성능 우선 고려

3. **복잡한 상태 관리**
   - React Query로 서버 상태 관리
   - 로컬 상태 최소화

4. **접근성 무시**
   - 처음부터 고려할 것
   - 나중에 추가하기 어려움

### 12.3 성공을 위한 팁

1. **점진적 구현**
   - 작은 단위로 배포
   - 빠른 피드백 루프

2. **사용자 테스트**
   - 실제 사용자와 테스트
   - 데이터 기반 개선

3. **디자인 시스템 활용**
   - shadcn-ui 컴포넌트 최대 활용
   - 일관성 유지

4. **문서화**
   - 컴포넌트 사용법 문서화
   - Storybook 고려

---

## 결론

현재 Account 페이지는 **완전히 비어있는 상태**로, 사용자에게 어떠한 가치도 제공하지 못하고 있습니다. 이는 프로덕션 레벨의 애플리케이션에서 용납될 수 없는 상태입니다.

이 보고서에서 제시한 개선안은:

1. **현실적**: 37-51시간으로 1-2주 내 구현 가능
2. **체계적**: Phase별 우선순위에 따른 점진적 구현
3. **전문적**: claude.ai 수준의 UX/UI 품질
4. **실용적**: 사용자가 실제로 필요로 하는 기능 중심

**다음 단계**:
1. Phase 1 구현 시작 (Profile Section + 기본 레이아웃)
2. 사용자 테스트 및 피드백 수집
3. Phase 2-4 순차적 구현
4. 지속적인 개선 및 최적화

이 계획을 따라 구현하면, "Coming Soon" 페이지를 사용자가 실제로 활용하는 전문적인 계정 관리 페이지로 탈바꿈시킬 수 있습니다.
