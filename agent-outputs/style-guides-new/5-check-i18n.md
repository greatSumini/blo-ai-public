# i18n 품질 검증 보고서: Style Guide New Page

## 1. 하드코딩된 텍스트 발견

### 발견 항목 1: Constants의 옵션 레이블
**심각도**: 높음

#### 파일: `src/features/onboarding/lib/constants.ts`

**문제**:
- PERSONALITY_OPTIONS, TONE_OPTIONS, CONTENT_LENGTH_OPTIONS, READING_LEVEL_OPTIONS의 label이 하드코딩 영어 값으로만 정의됨
- STEP_NAMES가 하드코딩 한국어 값으로만 정의됨
- 다국어 지원 불가능

**현재 코드** (라인 54-94):
```typescript
// Legacy exports (하드코딩된 값)
export const STEP_NAMES = [
  "브랜드 보이스",
  "타겟 독자",
  "언어 설정",
  "스타일 설정",
  "최종 검토",
];

export const PERSONALITY_OPTIONS = PERSONALITY_VALUES.map((v) => ({
  value: v,
  label: v,  // ← "innovative", "trustworthy" 등 하드코딩
}));

export const TONE_OPTIONS = TONE_VALUES.map((v) => ({
  value: v,
  label: v,  // ← "professional", "friendly" 등 하드코딩
  description: "",
}));
```

**영향을 받는 컴포넌트**:
- `step-style.tsx`: line 68-80 (TONE_OPTIONS 사용)
- `step-style.tsx`: line 111-123 (CONTENT_LENGTH_OPTIONS 사용)
- `step-style.tsx`: line 154-166 (READING_LEVEL_OPTIONS 사용)
- `step-review.tsx`: line 31-68 (모든 옵션 사용)
- `preview-panel.tsx`: line 41-60 (모든 옵션 사용)

### 발견 항목 2: STEP_NAMES 하드코딩
**심각도**: 중간

#### 파일: `src/features/onboarding/components/step-indicator.tsx`

**문제**:
- line 21: `STEP_NAMES[currentStep - 1]` - 하드코딩된 한국어만 표시
- line 56: `STEP_NAMES[index]` - aria-label에 하드코딩된 값 사용

**현재 코드**:
```typescript
<span className="font-medium" style={{ color: "#374151" }}>
  {STEP_NAMES[currentStep - 1]}  // ← 한국어만 표시 가능
</span>
```

### 발견 항목 3: Constants 옵션의 description이 빈 문자열
**심각도**: 중간

#### 파일: `src/features/onboarding/lib/constants.ts`

**문제**:
- 라인 72-94: description이 빈 문자열로 설정됨
- 컴포넌트에서 표시하려 하는데 내용이 없음

## 2. 번역 키 누락

### en.json에 누락된 키들

필요하지만 현재 없는 번역 키:

```json
{
  "onboarding": {
    "wizard": {
      // ✓ 기존 키들은 완전함
    },
    // 누락: Step names 번역
    "step_names": {
      "brand_voice": "Brand Voice",
      "audience": "Target Audience",
      "language": "Language Settings",
      "style": "Style Settings",
      "review": "Final Review"
    },
    // 누락: 선택지 옵션 설명 (description)
    "tone_descriptions": {
      "professional": "Emphasizes business and professionalism",
      "friendly": "Warm and approachable",
      "inspirational": "Motivational and positive messages",
      "educational": "Focused on learning and knowledge transfer"
    },
    "content_length_descriptions": {
      "short": "300-500 words (quick read)",
      "medium": "500-1000 words (balanced)",
      "long": "1000+ words (in-depth)"
    },
    "reading_level_descriptions": {
      "beginner": "Simple words and sentences",
      "intermediate": "Standard vocabulary",
      "advanced": "Technical terms and complex concepts"
    }
  }
}
```

**참고**: 일부 key는 이미 존재하지만 구조가 다름:
- `onboarding.style.tone_professional` vs `onboarding.tone_descriptions.professional`

### ko.json에 누락된 키들

필요하지만 현재 없는 번역 키:

```json
{
  "onboarding": {
    "step_names": {
      "brand_voice": "브랜드 보이스",
      "audience": "타겟 독자",
      "language": "언어 설정",
      "style": "스타일 설정",
      "review": "최종 검토"
    },
    "tone_descriptions": {
      "professional": "비즈니스와 전문성 강조",
      "friendly": "따뜻하고 접근하기 쉬운",
      "inspirational": "동기부여와 긍정적 메시지",
      "educational": "학습과 지식 전달 중심"
    },
    "content_length_descriptions": {
      "short": "300-500자 (빠른 읽기)",
      "medium": "500-1000자 (균형잡힌 길이)",
      "long": "1000자 이상 (심층 분석)"
    },
    "reading_level_descriptions": {
      "beginner": "쉬운 단어와 간단한 문장",
      "intermediate": "일반적인 수준의 어휘",
      "advanced": "전문 용어와 복잡한 개념"
    }
  }
}
```

## 3. 번역 구조 불일치

### 문제: 이중 구조 존재

현재 번역 파일에는 동일한 내용에 대해 다양한 구조로 정의됨:

**패턴 1**: onboarding.[section].[key_name]
```json
{
  "onboarding": {
    "style": {
      "tone_professional": "Professional",
      "tone_friendly": "Friendly"
    }
  }
}
```

**패턴 2**: onboarding.preview.[key_name]
```json
{
  "onboarding": {
    "preview": {
      "tone_professional": "Professional",
      "tone_friendly": "Friendly"
    }
  }
}
```

**권장**: 단일 구조로 통합
```json
{
  "onboarding": {
    "options": {
      "tone_professional": "Professional",
      "tone_friendly": "Friendly",
      "tone_inspirational": "Inspirational",
      "tone_educational": "Educational"
    }
  }
}
```

## 4. 접근성 검증

### aria-label 확인
- ✓ step-indicator.tsx line 33: `aria-label` 사용 (번역됨)
- ✓ step-indicator.tsx line 56: `aria-label` 정적 텍스트 (번역 필요)
- ✓ step-header.tsx line 30: `aria-hidden` 정확히 사용

### 누락된 aria-label
- step-indicator.tsx line 56에서 STEP_NAMES가 aria-label에 포함되는데, 번역되지 않음

```typescript
// 현재 (문제)
aria-label={`Step ${stepNumber}: ${STEP_NAMES[index]}`}

// 개선 필요
aria-label={`${t("common.step")} ${stepNumber}: ${stepName}`}
```

## 5. 동적 텍스트 처리

### step-brand-voice.tsx의 올바른 패턴
✓ 라인 34-37: 올바르게 번역 키를 동적으로 생성

```typescript
const personalityOptions = PERSONALITY_VALUES.map((value) => ({
  value,
  label: t(`personality_${value}` as any),  // ✓ 올바른 방식
}));
```

### 개선 필요 항목
- step-style.tsx: constants의 옵션을 직접 사용하므로 번역 불가
- step-review.tsx: constants의 옵션을 직접 사용하므로 번역 불가
- preview-panel.tsx: constants의 옵션을 직접 사용하므로 번역 불가

## 6. 번역 품질 개선

### 현재 존재하는 번역의 일관성 검토

#### en.json의 부자연스러운 표현
- `onboarding.language.language_ko_desc: "Korean"` (라인 455)
  - 현재: "Korean"
  - 제안: "Korean language"

- `onboarding.language.language_en_desc: "English"` (라인 457)
  - 현재: "English"
  - 제안: "English language"

#### ko.json의 일관성
- ✓ 전체적으로 자연스러운 한국어 표현

## 7. 수정 체크리스트

### 긴급 (하드코딩 제거)
- [ ] `src/features/onboarding/lib/constants.ts` 수정:
  - [ ] STEP_NAMES 제거 (번역 키로 동적 생성)
  - [ ] PERSONALITY_OPTIONS의 label을 번역 키로 변경
  - [ ] TONE_OPTIONS의 label과 description을 번역 키로 변경
  - [ ] CONTENT_LENGTH_OPTIONS의 label과 description을 번역 키로 변경
  - [ ] READING_LEVEL_OPTIONS의 label과 description을 번역 키로 변경
  - [ ] LANGUAGE_OPTIONS의 description 확인 및 번역 키로 변경

- [ ] `src/features/onboarding/components/step-indicator.tsx` 수정:
  - [ ] STEP_NAMES 대신 번역 함수 사용
  - [ ] aria-label에 번역된 텍스트 적용

### 높음 (번역 키 추가)
- [ ] messages/en.json에 누락된 키 추가:
  - [ ] `onboarding.step_names.*`
  - [ ] 각 옵션의 description 키

- [ ] messages/ko.json에 누락된 키 추가:
  - [ ] `onboarding.step_names.*`
  - [ ] 각 옵션의 description 키

### 중간 (코드 리팩토링)
- [ ] step-style.tsx에서 옵션 레이블 동적 생성
- [ ] step-review.tsx에서 옵션 레이블 동적 생성
- [ ] preview-panel.tsx에서 옵션 레이블 동적 생성

### 낮음 (번역 품질 개선)
- [ ] en.json의 부자연스러운 표현 수정
  - [ ] `onboarding.language.language_ko_desc`
  - [ ] `onboarding.language.language_en_desc`

## 8. 최종 권장사항

### 우선순위
1. **CRITICAL**: Constants의 하드코딩된 label/description 제거
2. **HIGH**: 번역 파일에 누락된 키 추가
3. **MEDIUM**: 컴포넌트에서 옵션 레이블 동적 생성으로 변경
4. **LOW**: 번역 품질 미세 조정

### 구현 전략
1. `onboarding.step_names`와 옵션 키들을 translation 파일에 추가
2. Constants를 값 배열만 유지하도록 간소화
3. 각 컴포넌트에서 필요에 따라 번역 키를 동적으로 생성
4. step-brand-voice의 패턴을 다른 컴포넌트에도 적용

## 결론

**상태**: ❌ i18n 검증 실패

**문제 요약**:
- Constants의 옵션 레이블이 하드코딩됨 (다국어 미지원)
- STEP_NAMES가 한국어만 지원
- 번역 파일에 누락된 키들 존재
- 일부 컴포넌트에서 동적 번역 미지원

**필요 작업**: 상당한 리팩토링이 필요합니다. 특히 Constants를 번역 가능한 구조로 변경해야 합니다.
