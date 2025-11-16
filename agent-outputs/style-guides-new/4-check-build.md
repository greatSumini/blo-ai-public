# 빌드 품질 검증 보고서 - style-guides/new 페이지

## 요약
TypeScript 타입 체크 및 빌드 프로세스에서 **13개의 임포트 오류** 발견되었습니다. 모든 오류는 `src/features/onboarding/lib/constants.ts`에서 내보내지 않는 상수들을 import하려고 할 때 발생합니다.

---

## 1. TypeScript 타입 체크

### 실행 결과
```bash
$ pnpm typecheck
```

### 발견된 오류

**오류 유형**: Module에서 내보내지 않는 멤버 임포트

#### 오류 1-5: preview-panel.tsx
- **파일**: `src/features/onboarding/components/preview-panel.tsx`
- **라인**: 7-11
- **오류**:
  ```
  Module '"../lib/constants"' has no exported member 'PERSONALITY_OPTIONS'.
  Module '"../lib/constants"' has no exported member 'PREVIEW_TEMPLATES'.
  Module '"../lib/constants"' has no exported member 'TONE_OPTIONS'.
  Module '"../lib/constants"' has no exported member 'CONTENT_LENGTH_OPTIONS'.
  Module '"../lib/constants"' has no exported member 'READING_LEVEL_OPTIONS'.
  ```
- **원인**: `constants.ts`에는 `PERSONALITY_VALUES`, `TONE_VALUES` 등의 상수만 정의되어 있고, 컴포넌트가 요청하는 `*_OPTIONS` 형태의 상수와 `PREVIEW_TEMPLATES`이 없음

#### 오류 6: step-indicator.tsx
- **파일**: `src/features/onboarding/components/step-indicator.tsx`
- **라인**: 5
- **오류**: `Module '"../lib/constants"' has no exported member 'STEP_NAMES'.`
- **원인**: 단계별 이름을 담은 `STEP_NAMES` 배열이 정의되지 않음

#### 오류 7: step-language.tsx
- **파일**: `src/features/onboarding/components/step-language.tsx`
- **라인**: 15
- **오류**: `Module '"../lib/constants"' has no exported member 'LANGUAGE_OPTIONS'.`
- **원인**: 언어 선택 옵션 객체가 정의되지 않음

#### 오류 8-12: step-review.tsx
- **파일**: `src/features/onboarding/components/step-review.tsx`
- **라인**: 16-20
- **오류**:
  ```
  Module '"../lib/constants"' has no exported member 'PERSONALITY_OPTIONS'.
  Module '"../lib/constants"' has no exported member 'FORMALITY_OPTIONS'.
  Module '"../lib/constants"' has no exported member 'TONE_OPTIONS'.
  Module '"../lib/constants"' has no exported member 'CONTENT_LENGTH_OPTIONS'.
  Module '"../lib/constants"' has no exported member 'READING_LEVEL_OPTIONS'.
  ```

#### 오류 13-15: step-style.tsx
- **파일**: `src/features/onboarding/components/step-style.tsx`
- **라인**: 22-24
- **오류**:
  ```
  Module '"../lib/constants"' has no exported member 'TONE_OPTIONS'.
  Module '"../lib/constants"' has no exported member 'CONTENT_LENGTH_OPTIONS'.
  Module '"../lib/constants"' has no exported member 'READING_LEVEL_OPTIONS'.
  ```

---

## 2. 빌드 테스트

### 실행 결과
```bash
$ pnpm build
```

**Status**: Failed with exit code 1

### 발견된 문제

Next.js 빌드 프로세스가 TypeScript 타입 에러로 인해 실패했습니다. 같은 13개의 임포트 오류가 빌드 단계에서도 발생합니다.

---

## 3. 필요한 상수 정의

현재 `src/features/onboarding/lib/constants.ts`에는 다음 상수들이 **누락**되었습니다:

### 필요한 상수 목록

1. **STEP_NAMES** - 각 단계의 이름
   ```typescript
   // 사용처: step-indicator.tsx에서 현재 단계 이름 표시
   ```

2. **LANGUAGE_OPTIONS** - 언어 선택 옵션 배열
   ```typescript
   // 구조: { value: string, label: string, description: string }[]
   // 사용처: step-language.tsx에서 언어 선택 UI 렌더링
   ```

3. **PERSONALITY_OPTIONS** - 성격/분위기 옵션 배열
   ```typescript
   // 구조: { value: string, label: string }[]
   // 사용처: preview-panel.tsx, step-review.tsx에서 성격 옵션 표시
   ```

4. **FORMALITY_OPTIONS** - 격식성 옵션 배열
   ```typescript
   // 구조: { value: string, label: string }[]
   // 사용처: step-review.tsx에서 격식성 옵션 표시
   ```

5. **TONE_OPTIONS** - 톤 옵션 배열
   ```typescript
   // 구조: { value: string, label: string }[]
   // 사용처: preview-panel.tsx, step-review.tsx, step-style.tsx에서 톤 옵션 표시
   ```

6. **CONTENT_LENGTH_OPTIONS** - 콘텐츠 길이 옵션 배열
   ```typescript
   // 구조: { value: string, label: string }[]
   // 사용처: preview-panel.tsx, step-review.tsx, step-style.tsx에서 길이 옵션 표시
   ```

7. **READING_LEVEL_OPTIONS** - 읽기 수준 옵션 배열
   ```typescript
   // 구조: { value: string, label: string }[]
   // 사용처: preview-panel.tsx, step-review.tsx, step-style.tsx에서 수준 옵션 표시
   ```

8. **PREVIEW_TEMPLATES** - 미리보기 템플릿 객체
   ```typescript
   // 구조: { [language: string]: { [formality: string]: string } }
   // 사용처: preview-panel.tsx에서 미리보기 텍스트 생성 시 템플릿 선택
   ```

---

## 4. 수정 방안

### 해결 방법 1: constants.ts 확장 (권장)

현재 `constants.ts`에 다음과 같이 옵션 배열을 추가합니다:

```typescript
// src/features/onboarding/lib/constants.ts

// ... 기존 코드 ...

// Step names for indicator
export const STEP_NAMES = [
  "Brand Voice",
  "Target Audience",
  "Language",
  "Style Preferences",
  "Review & Confirm"
] as const;

// Language options for step 3
export const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어", description: "Korean" },
  { value: "en", label: "English", description: "영어" }
] as const;

// Personality options for step 1 & 5
export const PERSONALITY_OPTIONS = [
  { value: "innovative", label: "Innovative / 혁신적" },
  { value: "trustworthy", label: "Trustworthy / 신뢰할 수 있는" },
  { value: "playful", label: "Playful / 장난스러운" },
  { value: "professional", label: "Professional / 전문적" },
  { value: "approachable", label: "Approachable / 친근한" },
  { value: "bold", label: "Bold / 대담한" },
  { value: "authentic", label: "Authentic / 진정한" },
  { value: "sophisticated", label: "Sophisticated / 세련된" }
] as const;

// Formality options for step 5
export const FORMALITY_OPTIONS = [
  { value: "casual", label: "Casual / 편한" },
  { value: "neutral", label: "Neutral / 중립적" },
  { value: "formal", label: "Formal / 격식적" }
] as const;

// Tone options for step 4 & 5
export const TONE_OPTIONS = [
  { value: "professional", label: "Professional / 전문적" },
  { value: "friendly", label: "Friendly / 친근한" },
  { value: "inspirational", label: "Inspirational / 영감적" },
  { value: "educational", label: "Educational / 교육적" }
] as const;

// Content length options for step 4 & 5
export const CONTENT_LENGTH_OPTIONS = [
  { value: "short", label: "Short / 짧음" },
  { value: "medium", label: "Medium / 중간" },
  { value: "long", label: "Long / 길음" }
] as const;

// Reading level options for step 4 & 5
export const READING_LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner / 초급" },
  { value: "intermediate", label: "Intermediate / 중급" },
  { value: "advanced", label: "Advanced / 고급" }
] as const;

// Preview templates for different languages and formality levels
export const PREVIEW_TEMPLATES = {
  ko: {
    casual: "{brandName}는 {personality}하고 {targetAudience}를 위한 블로그입니다.",
    neutral: "{brandName}는 {personality}한 성격으로 {targetAudience}를 대상으로 하고 있습니다.",
    formal: "{brandName}는 {personality}한 특징을 가지고 {targetAudience}를 위해 운영되고 있습니다."
  },
  en: {
    casual: "{brandName} is a {personality} blog for {targetAudience}.",
    neutral: "{brandName} is a {personality} blog aimed at {targetAudience}.",
    formal: "{brandName} is a {personality} publication dedicated to {targetAudience}."
  }
} as const;
```

---

## 5. 수정 우선순위

### 긴급 (빌드 실패)
- [ ] constants.ts에 누락된 8개의 상수 추가
- [ ] TypeScript 타입 체크 재실행
- [ ] 빌드 재실행

---

## 6. 검증 체크리스트

- [ ] TypeScript 타입 체크 통과 (0 errors)
- [ ] 빌드 성공
- [ ] style-guides/new 페이지 정상 렌더링
- [ ] 모든 옵션이 UI에 올바르게 표시되는지 확인
- [ ] 미리보기 패널이 정상 작동하는지 확인

---

## 다음 단계

1. `src/features/onboarding/lib/constants.ts` 파일 수정
2. 누락된 상수 추가 (위의 해결 방법 1 참고)
3. `pnpm typecheck` 재실행
4. `pnpm build` 재실행
5. 페이지 기능 검증
