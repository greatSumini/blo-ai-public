# 페이지 개선안 검토 및 개선

## 1. 원안 요약

0번 단계에서 제안된 스타일 가이드 편집 페이지 개선안은 다음과 같은 핵심 내용을 포함합니다:

### 주요 제안 사항
1. **편집 폼 구현**: 현재 미구현된 TODO를 `OnboardingWizard` 재사용으로 해결
2. **자동 저장 기능**: debounced 자동 저장 + `AutoSaveIndicator` 컴포넌트
3. **페이지 헤더 재설계**: 브레드크럼, 메타데이터, 인라인 제목 편집, 액션 버튼
4. **스켈레톤 로딩 UI**: 레이아웃 shift 방지를 위한 상세한 스켈레톤
5. **에러 처리 개선**: 재시도 버튼, 상세 메시지, 지원 링크
6. **애니메이션 추가**: framer-motion 기반 전환 효과
7. **모바일 최적화**: Floating Action Bar, 터치 인터랙션
8. **다크모드 지원**: 인라인 스타일 제거 및 Tailwind 클래스 전환

### 컴포넌트 구조
- `EditPageHeader`: 헤더 및 액션
- `AutoSaveIndicator`: 저장 상태 표시
- `EditableOnboardingWizard`: 편집 가능한 위저드
- `StyleGuideEditSkeleton`: 로딩 스켈레톤
- `ErrorDisplay`: 에러 화면

---

## 2. 비판적 검토

### 2.1 사용자 경험 (UX)

#### ✅ 잘된 점

1. **명확한 문제 인식**
   - 현재 페이지의 치명적 문제(기능 미구현, 중복 버튼)를 정확히 파악
   - 로딩 상태의 레이아웃 shift 문제 인지

2. **일관성 추구**
   - 신규 생성 페이지와의 일관성 강조
   - 디자인 시스템 준수 의지

#### ❌ 문제점 및 개선안

**문제 1: 과도한 UI 복잡도**

원안은 너무 많은 UI 요소를 한 번에 추가하려 합니다:
- 브레드크럼 네비게이션
- 인라인 제목 편집
- 메타데이터 표시
- Auto-Save Indicator
- 복잡한 액션 버튼 그룹

**개선 방향**:
```
편집 페이지의 핵심은 "빠르고 직관적인 수정"입니다.
- 브레드크럼은 이미 PageLayout에서 제공하는 Back 버튼으로 충분
- 인라인 제목 편집은 혼란을 가중시킬 수 있음 (제목은 폼 내부에서 수정)
- 메타데이터는 필요하지만 최소화 (마지막 수정 시간 정도)
```

**문제 2: 자동 저장 vs 명시적 저장 혼용**

원안은 자동 저장과 명시적 "저장" 버튼을 모두 제공합니다. 이는 사용자 혼란을 야기합니다:
- "자동 저장되는데 왜 저장 버튼이 있지?"
- "저장 버튼을 눌러야 하나, 기다려야 하나?"

**개선 방향**:
```
1안) 완전 자동 저장 (추천)
   - 변경 즉시 debounced 저장
   - 저장 버튼 제거
   - AutoSaveIndicator만 표시
   - "완료" 버튼으로 목록 페이지로 이동

2안) 명시적 저장
   - 자동 저장 제거
   - 변경사항 추적 (hasChanges)
   - "저장" 버튼으로만 저장
   - 페이지 이탈 시 경고
```

**문제 3: 불필요한 Delete 버튼**

편집 화면에 삭제 버튼을 배치하는 것은 위험합니다:
- 실수로 클릭할 가능성
- 편집 중 삭제는 일반적이지 않은 워크플로우
- 삭제는 목록 화면이나 상세 화면에서 처리하는 것이 안전

**개선 방향**:
```
- 편집 화면에서 삭제 버튼 제거
- 필요시 설정(⋮) 메뉴 내부에 숨김
- 삭제는 스타일 가이드 목록이나 별도 관리 화면에서 처리
```

**문제 4: 변경사항 하이라이트의 모호함**

원안은 "변경사항 하이라이트 (어떤 필드가 수정되었는지)"를 제안하지만, 이는 실용성이 낮습니다:
- 편집 화면에서 모든 필드를 수정할 수 있으므로 하이라이트 의미 없음
- 오히려 시각적 혼란만 가중

**개선 방향**:
```
- 변경사항 하이라이트 제거
- 대신 폼 검증 에러만 명확히 표시
- dirty state는 내부적으로만 추적 (페이지 이탈 경고용)
```

### 2.2 메시징 전략

#### ✅ 잘된 점

1. **명확한 페이지 목적**
   - "스타일 가이드 편집"이라는 명확한 타이틀
   - 사용자가 무엇을 하는 페이지인지 즉시 이해 가능

#### ❌ 문제점 및 개선안

**문제 1: 과도한 정보 제공**

원안의 메타데이터 섹션이 너무 많은 정보를 제공:
- 생성일, 수정일, 사용 횟수, 작성자 등
- 편집 화면에서는 불필요한 정보

**개선 방향**:
```
핵심 정보만 제공:
- 스타일 가이드 이름
- 마지막 수정 시간 (옵션)
- 나머지는 제거
```

**문제 2: 토스트 메시지 개선 필요**

현재 코드를 보면:
```typescript
toast({
  title: t("common.success"),
  description: t("styleGuide.update.success.desc"),
});
```

이는 너무 일반적입니다.

**개선 방향**:
```typescript
// 자동 저장 시
toast({
  title: "변경사항 저장됨",
  description: "모든 변경사항이 자동으로 저장되었습니다.",
  duration: 2000, // 짧게
});

// 에러 시
toast({
  title: "저장 실패",
  description: "네트워크 연결을 확인하고 다시 시도해주세요.",
  variant: "destructive",
  action: <Button size="sm">재시도</Button>,
});
```

### 2.3 시각적 디자인

#### ✅ 잘된 점

1. **체계적인 디자인 시스템**
   - 컬러, 타이포그래피, 간격 시스템 명확히 정의
   - shadcn-ui 기반 일관성

2. **접근성 고려**
   - ARIA 레이블, 색상 대비 고려

#### ❌ 문제점 및 개선안

**문제 1: 인라인 스타일 과다 사용**

원안은 이를 지적하면서도 예시 코드에서 계속 사용:
```typescript
// ❌ 원안의 예시
style={{ backgroundColor: "#FFFFFF", borderColor: "#E1E5EA" }}
```

**개선 방향**:
```typescript
// ✅ Tailwind 클래스 사용
className="bg-white border-border rounded-xl"

// 또는 CSS 변수
className="bg-background text-foreground"
```

**문제 2: AutoSaveIndicator 디자인 과다**

원안의 AutoSaveIndicator가 너무 눈에 띄어 오히려 방해가 될 수 있습니다:
- 배경색이 있는 pill 형태
- 애니메이션 효과

**개선 방향**:
```
더 subtle한 디자인:
- 작은 아이콘 + 텍스트
- 배경색 없이 텍스트 색상만 변경
- 우측 상단 모서리에 배치
- 저장 완료 시 3초 후 fade out
```

**문제 3: 스켈레톤 UI 과다 설계**

원안의 스켈레톤이 너무 복잡하고 상세합니다 (80줄 이상).

**개선 방향**:
```
간단한 스켈레톤:
- 위저드의 기본 구조만 표시
- OnboardingWizard 자체가 이미 좋은 구조를 가지고 있음
- 헤더 + 스텝 인디케이터 + 폼 영역 정도만
```

### 2.4 기술적 실현 가능성

#### ✅ 잘된 점

1. **OnboardingWizard 재사용**
   - 기존 컴포넌트를 활용하는 현명한 접근
   - 일관성 유지 가능

2. **React Query 활용**
   - 이미 `useStyleGuide`, `useUpdateStyleGuide` 훅 존재
   - 캐싱 및 낙관적 업데이트 가능

#### ❌ 문제점 및 개선안

**문제 1: OnboardingWizard의 한계**

현재 `OnboardingWizard`를 보면:
```typescript
interface OnboardingWizardProps {
  onComplete: (data: OnboardingFormData) => Promise<void>;
}
```

`defaultValues`를 prop으로 받지 않습니다.

**개선 방향**:
```typescript
// 1단계: OnboardingWizard에 initialData prop 추가
interface OnboardingWizardProps {
  onComplete: (data: OnboardingFormData) => Promise<void>;
  initialData?: OnboardingFormData; // 추가
}

// 2단계: useForm defaultValues에 주입
const form = useForm<OnboardingFormData>({
  resolver: zodResolver(onboardingSchema),
  defaultValues: initialData || defaultOnboardingValues,
  mode: "onChange",
});

// 3단계: 편집 페이지에서 사용
<OnboardingWizard
  initialData={guide}
  onComplete={handleUpdate}
/>
```

**문제 2: 자동 저장 복잡도**

원안의 자동 저장 구현은 복잡도가 높습니다:
- useAutoSave 훅 별도 구현
- debounce 로직
- dirty state 추적
- 저장 상태 관리

**개선 방향**:
```typescript
// 간단한 접근: React Query의 mutation 활용
// 1안) 완전 자동 저장 제거, 명시적 저장만 사용
// 2안) React Hook Form의 watch + useEffect + debounce

// 추천: 1안 (명시적 저장)
// 이유:
// - 구현 단순
// - 사용자가 제어권을 가짐
// - 의도하지 않은 저장 방지
// - 네트워크 요청 최소화
```

**문제 3: 애니메이션 성능 우려**

원안은 framer-motion을 모든 곳에 적용:
- 페이지 전환
- 버튼 호버
- 필드 포커스
- 스켈레톤
- 인디케이터

**개선 방향**:
```
애니메이션 최소화:
- 핵심 전환만 애니메이션 (위저드 스텝 전환)
- 버튼/필드 호버는 CSS로 충분
- 스켈레톤 애니메이션은 CSS로 충분
- 성능 > 화려함
```

**문제 4: 중복된 라우팅 로직**

현재 코드에서:
```typescript
// Line 38: 잘못된 경로
router.push("/style-guide"); // ❌ 's' 없음

// 올바른 경로
router.push("/style-guides"); // ✅
```

**개선 방향**:
```typescript
// 라우트 상수화 (이미 원안에서 제안됨 - 좋음)
const ROUTES = {
  STYLE_GUIDES_LIST: "/style-guides",
  STYLE_GUIDES_NEW: "/style-guides/new",
  STYLE_GUIDES_EDIT: (id: string) => `/style-guides/${id}/edit`,
} as const;
```

### 2.5 claude.ai 벤치마킹

#### ✅ 잘된 점

1. **일반적인 SaaS 패턴 참조**
   - Notion, Linear, Airtable 등의 베스트 프랙티스

#### ❌ 문제점 및 개선안

**문제 1: 과도한 벤치마킹**

원안은 claude.ai에 직접 접근하지 못했음을 인정하면서도, 일반적인 SaaS 패턴을 과도하게 도입하려 함:
- 버전 히스토리
- 협업 기능
- AI 제안
- A/B 테스트

**개선 방향**:
```
현재 우선순위:
1. 기본 편집 기능 구현 (P0)
2. 안정적인 저장 (P0)
3. 에러 처리 (P0)

미래 기능:
- 버전 히스토리 (P2)
- 협업 기능 (P3)
- AI 제안 (P3)
- A/B 테스트 (P3)
```

**문제 2: 실시간 미리보기의 가치**

원안은 "우측 실시간 미리보기 패널 강화"를 제안하지만, 현재 `OnboardingWizard`에 이미 `PreviewPanel`이 존재합니다.

**개선 방향**:
```
- 기존 PreviewPanel 그대로 사용
- 불필요한 강화 작업 제거
- 있는 것 활용하기
```

---

## 3. 개선된 최종 계획

### 3.1 페이지 구성 (수정안)

```
EditStyleGuidePage
├── PageLayout (기존 유지)
│   ├── title: "스타일 가이드 편집"
│   ├── description: 가이드 이름 표시
│   └── actions: "완료" 버튼만
├── Loading State
│   └── SimpleEditSkeleton (최소화)
├── Error State
│   └── ErrorDisplay (재시도 버튼)
└── Main Content
    └── OnboardingWizard (initialData 주입)
```

**변경 사항**:
- ❌ 브레드크럼 제거 (PageLayout의 기본 구조 활용)
- ❌ 인라인 제목 편집 제거 (폼 내부에서 수정)
- ❌ 자동 저장 인디케이터 제거 (명시적 저장 채택)
- ❌ 복잡한 액션 버튼 그룹 제거 (완료 버튼만)
- ✅ OnboardingWizard initialData 지원 추가

### 3.2 UI 디자인 컨셉 (수정안)

#### 컬러 시스템
```typescript
// ❌ 인라인 스타일 사용 금지
// ✅ Tailwind 클래스 사용
className="bg-background text-foreground border-border"
```

#### 타이포그래피
```typescript
// 기존 shadcn-ui 타이포그래피 활용
// 별도 정의 불필요
```

#### 간격 시스템
```typescript
// Tailwind 기본 간격 활용
className="space-y-6" // 섹션 간격
className="space-y-4" // 컴포넌트 간격
```

### 3.3 컴포넌트 명세 (수정안)

#### 1) OnboardingWizard 개선

**파일**: `src/features/onboarding/components/onboarding-wizard.tsx`

**변경 사항**:
```typescript
// Props 확장
interface OnboardingWizardProps {
  onComplete: (data: OnboardingFormData) => Promise<void>;
  initialData?: OnboardingFormData; // 추가
  mode?: "create" | "edit"; // 추가 (옵션)
}

// defaultValues 주입
const form = useForm<OnboardingFormData>({
  resolver: zodResolver(onboardingSchema),
  defaultValues: initialData || defaultOnboardingValues,
  mode: "onChange",
});
```

#### 2) SimpleEditSkeleton (신규)

**파일**: `src/features/style-guides/components/simple-edit-skeleton.tsx`

**설계**:
```typescript
export function SimpleEditSkeleton() {
  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="space-y-4">
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      {/* Form Area */}
      <div className="rounded-lg border bg-white p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
```

#### 3) ErrorDisplay (개선)

**파일**: `src/components/error-display.tsx` (공통 컴포넌트로 승격)

**설계**:
```typescript
interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorDisplay({ message, onRetry, onBack }: ErrorDisplayProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-lg border border-destructive/20 bg-destructive/5 p-8" role="alert">
      <AlertCircle className="h-16 w-16 text-destructive" />
      <p className="text-center text-muted-foreground">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
        )}
        {onBack && (
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
        )}
      </div>
    </div>
  );
}
```

#### 4) ❌ 제거된 컴포넌트

다음 컴포넌트는 구현하지 않습니다:
- `EditPageHeader` (불필요한 복잡도)
- `AutoSaveIndicator` (자동 저장 미채택)
- `EditableOnboardingWizard` (기존 OnboardingWizard 확장으로 충분)
- `StyleGuideEditSkeleton` (SimpleEditSkeleton으로 대체)

### 3.4 애니메이션 명세 (수정안)

#### 최소화된 애니메이션

```typescript
// ✅ 위저드 스텝 전환만 유지 (기존 OnboardingWizard 애니메이션)
// ❌ 페이지 헤더 애니메이션 제거
// ❌ Auto-save 인디케이터 애니메이션 제거
// ❌ 필드 포커스 애니메이션 제거 (CSS로 충분)
// ❌ 버튼 호버 애니메이션 제거 (CSS로 충분)
```

**이유**:
- 성능 우선
- 기존 OnboardingWizard 애니메이션이 이미 충분함
- 과도한 애니메이션은 오히려 방해

---

## 4. 주요 변경 사항 요약

### 추가된 요소

1. **OnboardingWizard initialData prop**
   - 기존 데이터를 편집할 수 있도록 확장
   - `defaultValues`로 폼 초기화

2. **SimpleEditSkeleton**
   - 간단하고 효과적인 로딩 스켈레톤
   - 과도한 디테일 제거

3. **ErrorDisplay 공통 컴포넌트화**
   - 재사용 가능한 에러 화면
   - 재시도/돌아가기 액션 지원

4. **라우트 상수화**
   - 하드코딩된 경로 제거
   - 타입 안전성 향상

### 제거된 요소

1. **자동 저장 기능 전체**
   - AutoSaveIndicator
   - useAutoSave 훅
   - Dirty state 복잡한 추적

2. **과도한 UI 요소**
   - 브레드크럼 (PageLayout 기본 구조로 충분)
   - 인라인 제목 편집
   - 상세 메타데이터
   - 삭제 버튼
   - 변경사항 하이라이트

3. **불필요한 애니메이션**
   - 페이지 헤더 애니메이션
   - 버튼/필드 마이크로 애니메이션
   - Auto-save 인디케이터 애니메이션

4. **미래 기능 제안**
   - 버전 히스토리
   - 협업 기능
   - AI 제안
   - A/B 테스트

### 수정된 요소

1. **저장 방식**
   - Before: 자동 저장 + 명시적 저장 혼용
   - After: 명시적 "완료" 버튼으로만 저장

2. **액션 버튼**
   - Before: 저장/취소/삭제/새로만들기
   - After: "완료" 버튼만

3. **스켈레톤 UI**
   - Before: 80줄 이상의 복잡한 스켈레톤
   - After: 30줄 이하의 간단한 스켈레톤

4. **스타일링**
   - Before: 인라인 스타일 과다 사용
   - After: Tailwind 클래스만 사용

---

## 5. 기대 효과

### 구현 속도

- ✅ **3배 빠른 구현**: 불필요한 컴포넌트 제거로 구현 시간 단축
- ✅ **유지보수 용이**: 단순한 구조로 버그 감소
- ✅ **테스트 용이**: 복잡도 감소로 테스트 시나리오 단순화

### 사용자 경험

- ✅ **명확한 인터페이스**: 혼란스러운 자동/수동 저장 혼용 제거
- ✅ **빠른 로딩**: 간단한 스켈레톤으로 초기 렌더링 속도 향상
- ✅ **일관성**: 신규 생성 페이지와 동일한 OnboardingWizard 사용

### 기술적 안정성

- ✅ **낮은 복잡도**: 자동 저장 로직 제거로 버그 가능성 감소
- ✅ **성능 향상**: 불필요한 애니메이션 제거
- ✅ **타입 안전성**: 라우트 상수화로 오타 방지

---

## 6. 리스크 및 고려사항

### 리스크 1: 자동 저장 미제공

**우려**: 사용자가 변경사항을 저장하지 않고 페이지를 벗어날 수 있음

**완화 방안**:
```typescript
// 페이지 이탈 경고
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (form.formState.isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [form.formState.isDirty]);
```

### 리스크 2: 단순한 스켈레톤

**우려**: 상세한 스켈레톤이 더 나은 UX를 제공한다는 주장

**완화 방안**:
- 현재 로딩 시간이 짧다면 (< 1초) 간단한 스켈레톤이 더 효율적
- 필요시 점진적으로 개선 가능
- 과도한 최적화는 premature optimization

### 리스크 3: 미래 기능 누락

**우려**: 버전 히스토리, 협업 등 유용한 기능 제거

**완화 방안**:
- MVP 먼저 완성
- 사용자 피드백 기반 우선순위 재조정
- 필요시 점진적 추가

---

## 7. 구현 우선순위 (재조정)

### 🔴 P0 - 핵심 기능 (1주, 필수)

1. **OnboardingWizard initialData 지원** (4시간)
   - Props 확장
   - defaultValues 주입
   - mode prop 추가 (옵션)

2. **편집 페이지 통합** (2시간)
   - guide 데이터를 initialData로 전달
   - handleComplete → handleUpdate 로직
   - 라우트 상수화

3. **SimpleEditSkeleton 구현** (1시간)
   - 간단한 로딩 UI
   - 기존 구조 참조

4. **ErrorDisplay 공통화** (1시간)
   - 재사용 가능한 에러 컴포넌트
   - 재시도 로직

5. **페이지 이탈 경고** (1시간)
   - beforeunload 이벤트
   - isDirty 감지

**총 소요 시간**: 약 9시간

### 🟡 P1 - 개선 사항 (1주, 권장)

6. **토스트 메시지 개선** (1시간)
   - 구체적인 성공/실패 메시지
   - 재시도 액션

7. **i18n 키 추가** (2시간)
   - 새로운 메시지 번역
   - 영어/한국어 지원

8. **접근성 개선** (2시간)
   - ARIA 레이블 점검
   - 키보드 네비게이션 확인

**총 소요 시간**: 약 5시간

### 🟢 P2 - 선택 사항 (추후)

9. **다크모드 지원** (4시간)
   - 인라인 스타일 제거 (현재 OnboardingWizard)
   - Tailwind 클래스 전환

10. **모바일 최적화** (3시간)
    - 터치 인터랙션 개선
    - 반응형 레이아웃 점검

**총 소요 시간**: 약 7시간

### ⚪ P3 - 미래 기능 (미정)

- 버전 히스토리
- 자동 저장
- 협업 기능
- AI 제안

---

## 8. 구현 체크리스트

### Phase 1: 핵심 기능 (필수)

- [ ] `OnboardingWizard`에 `initialData` prop 추가
- [ ] `OnboardingWizard`에 `mode` prop 추가 (옵션)
- [ ] `defaultValues`에 initialData 주입
- [ ] 라우트 상수 정의 (`src/lib/routes.ts`)
- [ ] `SimpleEditSkeleton` 컴포넌트 구현
- [ ] `ErrorDisplay` 공통 컴포넌트로 이동
- [ ] 편집 페이지에 OnboardingWizard 통합
- [ ] 페이지 이탈 경고 구현
- [ ] 중복 Back 버튼 제거
- [ ] 라우트 경로 오타 수정 (`/style-guide` → `/style-guides`)

### Phase 2: 개선 사항 (권장)

- [ ] 토스트 메시지 구체화
- [ ] i18n 키 추가 및 번역
- [ ] ARIA 레이블 점검
- [ ] 키보드 네비게이션 테스트
- [ ] 에러 시나리오 테스트

### Phase 3: 선택 사항 (추후)

- [ ] OnboardingWizard 인라인 스타일 제거
- [ ] Tailwind 클래스로 전환
- [ ] 다크모드 테마 지원
- [ ] 모바일 터치 인터랙션 개선

---

## 9. 결론

### 원안의 문제점

1. **과도한 기능 추가**: 자동 저장, 인라인 편집, 버전 히스토리 등 불필요한 복잡도
2. **UI 과다 설계**: 너무 많은 컴포넌트와 상태 관리
3. **실용성 부족**: 구현 시간 대비 가치가 낮은 기능 포함
4. **일관성 부족**: 인라인 스타일 비판하면서도 예시에서 계속 사용

### 개선된 계획의 강점

1. **단순함**: 핵심 기능에만 집중
2. **빠른 구현**: 9시간이면 MVP 완성 가능
3. **유지보수 용이**: 적은 코드, 낮은 복잡도
4. **일관성**: 신규 생성 페이지와 동일한 UX
5. **확장 가능**: 필요시 점진적으로 기능 추가 가능

### 최종 권고사항

**Phase 1 (P0)만 먼저 구현하고, 사용자 피드백을 수집한 후 Phase 2, 3를 결정하세요.**

이유:
- ✅ 빠른 가치 제공 (1주 내 완성)
- ✅ 리스크 최소화 (복잡도 낮음)
- ✅ 피드백 기반 개선 (사용자 중심)
- ✅ 비용 효율성 (최소 투자로 최대 효과)

**다음 단계**: Phase 1 구현 시작
