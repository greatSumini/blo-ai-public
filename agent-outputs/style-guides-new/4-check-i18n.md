# i18n 품질 검증 보고서

## 검증 대상
- 페이지: `src/app/[locale]/(protected)/style-guides/new/page.tsx`
- 관련 컴포넌트: `src/features/onboarding/**/*.tsx`
- 번역 파일: `messages/en.json`, `messages/ko.json`

## 1. 검증 결과

### 전반적 평가
**상태: PASS WITH ISSUES**

현재 코드는 주로 next-intl을 통한 번역 처리가 잘 구현되어 있으나, 다음과 같은 문제점들이 발견되었습니다:

1. 일부 컴포넌트에서 누락된 번역 키
2. constants.ts의 레거시 하드코딩된 텍스트
3. step-style.tsx에 정의되지 않은 placeholder 키

## 2. 하드코딩된 텍스트 발견

### 2.1 constants.ts의 하드코딩된 텍스트

#### 발견 항목 1: STEP_NAMES (한국어 하드코딩)
- **파일**: `src/features/onboarding/lib/constants.ts:54-60`
- **코드**:
  ```typescript
  export const STEP_NAMES = [
    "브랜드 보이스",
    "타겟 독자",
    "언어 설정",
    "스타일 설정",
    "최종 검토",
  ];
  ```
- **문제**: 한국어 텍스트가 하드코딩되어 있음. 영어 변역 불가능
- **영향범위**: StepIndicator 컴포넌트에서 사용

#### 발견 항목 2: LANGUAGE_OPTIONS (일부 하드코딩)
- **파일**: `src/features/onboarding/lib/constants.ts:62-65`
- **코드**:
  ```typescript
  export const LANGUAGE_OPTIONS = [
    { value: "ko", label: "한국어", description: "Korean" },
    { value: "en", label: "English", description: "English" },
  ];
  ```
- **문제**: label과 description이 하드코딩됨. i18n으로 관리되지 않음
- **영향범위**: StepLanguage 컴포넌트에서 사용

#### 발견 항목 3: PREVIEW_TEMPLATES (템플릿 텍스트)
- **파일**: `src/features/onboarding/lib/constants.ts:96-109`
- **코드**:
  ```typescript
  export const PREVIEW_TEMPLATES = {
    ko: {
      professional: "안녕하세요, {brandName}입니다...",
      friendly: "반가워요! {brandName}와 함께해요...",
      inspirational: "함께 성장하는 {brandName}...",
      educational: "{brandName}에서 배우는...",
    },
    // ...
  };
  ```
- **문제**: 템플릿 텍스트가 하드코딩됨
- **영향범위**: PreviewPanel 컴포넌트에서 사용

#### 발견 항목 4: StepHeader의 하드코딩
- **파일**: `src/features/onboarding/components/step-header.tsx:31`
- **코드**:
  ```typescript
  <Badge variant="secondary" className="text-xs">
    Step {stepNumber} of {totalSteps}
  </Badge>
  ```
- **문제**: 영어 텍스트 "Step"이 하드코딩됨
- **해결방안**:
  ```typescript
  const t = useTranslations("onboarding.wizard");
  <Badge variant="secondary" className="text-xs">
    {t("step_badge", { current: stepNumber, total: totalSteps })}
  </Badge>
  ```

## 3. 누락된 번역 키 확인

### 3.1 step-style.tsx에서 정의되지 않은 키

#### 누락 키 1: placeholder_tone
- **파일**: `step-style.tsx:64`
- **코드**: `<SelectValue placeholder={t("placeholder_tone")} />`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 2: placeholder_content_length
- **파일**: `step-style.tsx:107`
- **코드**: `<SelectValue placeholder={t("placeholder_content_length")} />`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 3: placeholder_reading_level
- **파일**: `step-style.tsx:150`
- **코드**: `<SelectValue placeholder={t("placeholder_reading_level")} />`
- **상태**: 번역 파일에 정의되지 않음

### 3.2 step-audience.tsx에서 정의되지 않은 키

#### 누락 키 1: tip_icon
- **파일**: `step-audience.tsx:97`
- **코드**: `{t("tip_icon")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 2: tip_text
- **파일**: `step-audience.tsx:100`
- **코드**: `{t("tip_text")}`
- **상태**: 번역 파일에 정의되지 않음

### 3.3 step-language.tsx에서 정의되지 않은 키

#### 누락 키 1: tip_icon
- **파일**: `step-language.tsx:115`
- **코드**: `{t("tip_icon")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 2: tip_text
- **파일**: `step-language.tsx:118`
- **코드**: `{t("tip_text")}`
- **상태**: 번역 파일에 정의되지 않음

### 3.4 step-style.tsx에서 정의되지 않은 키

#### 누락 키 1: tip_icon
- **파일**: `step-style.tsx:185`
- **코드**: `{t("tip_icon")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 2: tip_text
- **파일**: `step-style.tsx:188`
- **코드**: `{t("tip_text")}`
- **상태**: 번역 파일에 정의되지 않음

### 3.5 preview-panel.tsx에서 정의되지 않은 키

#### 누락 키: summary_title
- **파일**: `preview-panel.tsx:109`
- **코드**: `{t("summary_title")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키: label_level
- **파일**: `preview-panel.tsx:163`
- **코드**: `{t("label_level")}`
- **상태**: 번역 파일에 정의되지 않음

### 3.6 step-review.tsx에서 정의되지 않은 키

#### 누락 키 1: section_brand_voice
- **파일**: `step-review.tsx:98`
- **코드**: `{t("section_brand_voice")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 2: label_brand_name
- **파일**: `step-review.tsx:102`
- **코드**: `{t("label_brand_name")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 3: label_description
- **파일**: `step-review.tsx:112`
- **코드**: `{t("label_description")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 4: section_audience
- **파일**: `step-review.tsx:151`
- **코드**: `{t("section_audience")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 5: section_content_settings
- **파일**: `step-review.tsx:183`
- **코드**: `{t("section_content_settings")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 6: label_target_audience
- **파일**: `step-review.tsx:156`
- **코드**: `{t("label_target_audience")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 7: label_pain_points
- **파일**: `step-review.tsx:164`
- **코드**: `{t("label_pain_points")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 8: description_notes
- **파일**: `step-review.tsx:245`
- **코드**: `{t("description_notes")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 9: ready_title
- **파일**: `step-review.tsx:260`
- **코드**: `{t("ready_title")}`
- **상태**: 번역 파일에 정의되지 않음

#### 누락 키 10: ready_text
- **파일**: `step-review.tsx:263`
- **코드**: `{t("ready_text")}`
- **상태**: 번역 파일에 정의되지 않음

## 4. 접근성 텍스트 검증

### 4.1 aria-label 검증

#### 확인: step-header.tsx
- **상태**: PASS
- 아이콘에 `aria-hidden="true"` 사용됨 (line 27)

#### 문제: preview-panel.tsx
- **문제**: aria-label 누락
- **위치**: Card 컴포넌트
- **개선안**:
  ```typescript
  <Card
    aria-label={t("aria_preview_label")}
    // ...
  >
  ```

### 4.2 aria-current 검증

#### 확인: step-indicator.tsx
- **상태**: PASS
- `aria-current="step"` 올바르게 사용 (line 55)

## 5. 번역 품질 분석

### 5.1 English (en.json) 번역

#### 검증 항목: onboarding.wizard
- **상태**: PASS
- 모든 키가 자연스러운 영어로 작성됨

#### 검증 항목: onboarding.brand_voice
- **상태**: PASS
- 모든 설명이 명확하고 자연스러움

### 5.2 Korean (ko.json) 번역

#### 검증 항목: onboarding.wizard
- **상태**: PASS
- 모든 키가 자연스러운 한국어로 작성됨

#### 검증 항목: onboarding.brand_voice
- **상태**: PASS
- 설명과 필드명이 명확함

## 6. 필요한 번역 키 추가

### en.json에 추가할 키

```json
{
  "onboarding": {
    "wizard": {
      "keyboard_shortcut_hint": "Navigate steps",
      "preview_label": "Preview current settings",
      "button_previous": "Previous",
      "button_next": "Next",
      "button_complete": "Complete",
      "button_submitting": "Creating...",
      "step_change_announcement": "Step {current} of {total}",
      "step_badge": "Step {current} of {total}"
    },
    "indicator": {
      "progress_aria_label": "Progress {percentage}%",
      "steps_aria_label": "Onboarding progress steps",
      "status_completed": "Completed",
      "status_current": "In progress",
      "status_pending": "Pending"
    },
    "preview": {
      "title": "Current Settings",
      "subtitle": "Your input will be reflected here",
      "completed": "Completed",
      "empty_state": "Settings will appear here as you fill the form",
      "label_brand": "Brand Name",
      "label_personality": "Brand Personality",
      "label_formality": "Formality Level",
      "label_language": "Language",
      "label_tone": "Tone",
      "label_length": "Content Length",
      "label_level": "Reading Level",
      "summary_title": "Settings Summary",
      "tone_sample_label": "Tone Sample:",
      "personality_innovative": "Innovative",
      "personality_trustworthy": "Trustworthy",
      "personality_playful": "Playful",
      "personality_professional": "Professional",
      "personality_approachable": "Approachable",
      "personality_bold": "Bold",
      "personality_authentic": "Authentic",
      "personality_sophisticated": "Sophisticated",
      "formality_casual": "Casual",
      "formality_neutral": "Neutral",
      "formality_formal": "Formal",
      "language_ko": "Korean",
      "language_en": "English",
      "tone_professional": "Professional",
      "tone_friendly": "Friendly",
      "tone_inspirational": "Inspirational",
      "tone_educational": "Educational"
    },
    "style": {
      "title": "Style Settings",
      "subtitle": "Set the tone and length of content",
      "field_tone": "Tone",
      "description_tone": "Choose the overall mood of your content",
      "placeholder_tone": "Select a tone",
      "field_content_length": "Content Length",
      "description_content_length": "Select the default content length",
      "placeholder_content_length": "Select content length",
      "field_reading_level": "Reading Level",
      "description_reading_level": "Select the expertise level of your audience",
      "placeholder_reading_level": "Select reading level",
      "tone_professional": "Professional",
      "tone_professional_desc": "Emphasizes business and professionalism",
      "tone_friendly": "Friendly",
      "tone_friendly_desc": "Warm and approachable",
      "tone_inspirational": "Inspirational",
      "tone_inspirational_desc": "Motivational and positive messages",
      "tone_educational": "Educational",
      "tone_educational_desc": "Focused on learning and knowledge transfer",
      "content_length_short": "Short",
      "content_length_short_desc": "300-500 words (quick read)",
      "content_length_medium": "Medium",
      "content_length_medium_desc": "500-1000 words (balanced)",
      "content_length_long": "Long",
      "content_length_long_desc": "1000+ words (in-depth)",
      "reading_level_beginner": "Beginner",
      "reading_level_beginner_desc": "Simple words and sentences",
      "reading_level_intermediate": "Intermediate",
      "reading_level_intermediate_desc": "Standard vocabulary",
      "reading_level_advanced": "Advanced",
      "reading_level_advanced_desc": "Technical terms and complex concepts",
      "tip_icon": "Tip",
      "tip_text": "These settings will influence how AI generates content."
    },
    "audience": {
      "title": "Target Audience",
      "subtitle": "Tell us who your content is for",
      "field_target_audience": "Target Audience",
      "placeholder_target_audience": "e.g., Startup founders, developers, marketers",
      "description_target_audience": "Define your primary audience specifically",
      "field_pain_points": "Problems to Solve",
      "placeholder_pain_points": "Difficulties readers face or problems they want to solve",
      "description_pain_points": "Describe the main challenges your audience faces",
      "char_count": "{current} / {max}",
      "tip_icon": "Tip",
      "tip_text": "The more specific you are, the better AI can tailor content to your audience."
    },
    "language": {
      "title": "Language Settings",
      "subtitle": "Select the primary language",
      "field_language": "Language",
      "description_language": "AI will generate content in this language",
      "language_ko": "Korean",
      "language_ko_desc": "Korean",
      "language_en": "English",
      "language_en_desc": "English",
      "tip_icon": "Tip",
      "tip_text": "You can change the language later in settings."
    },
    "review": {
      "title": "Final Review",
      "subtitle": "Review your settings and complete",
      "field_notes": "Notes (Optional)",
      "placeholder_notes": "Add any additional notes",
      "description_notes": "Add any additional information for AI reference",
      "section_brand_voice": "Brand Voice",
      "section_audience": "Target Audience",
      "section_content_settings": "Content Settings",
      "label_brand_name": "Brand Name",
      "label_description": "Description",
      "label_personality": "Personality",
      "label_formality": "Formality",
      "label_target_audience": "Target Audience",
      "label_pain_points": "Pain Points",
      "label_language": "Language",
      "label_tone": "Tone",
      "label_length": "Content Length",
      "label_reading_level": "Reading Level",
      "language_ko": "Korean",
      "language_en": "English",
      "ready_title": "Ready to Create!",
      "ready_text": "Your style guide is all set. You can now start creating content with AI."
    }
  }
}
```

### ko.json에 추가할 키

```json
{
  "onboarding": {
    "wizard": {
      "keyboard_shortcut_hint": "스텝 이동",
      "preview_label": "현재 설정 미리보기",
      "button_previous": "이전",
      "button_next": "다음",
      "button_complete": "완료",
      "button_submitting": "생성 중...",
      "step_change_announcement": "{current}/{total} 단계",
      "step_badge": "{current}/{total} 단계"
    },
    "indicator": {
      "progress_aria_label": "진행률 {percentage}%",
      "steps_aria_label": "온보딩 진행 단계",
      "status_completed": "완료",
      "status_current": "진행 중",
      "status_pending": "대기 중"
    },
    "preview": {
      "title": "현재 설정",
      "subtitle": "입력하신 내용이 여기에 반영됩니다",
      "completed": "완료",
      "empty_state": "폼을 채우면 설정이 여기에 나타납니다",
      "label_brand": "브랜드 이름",
      "label_personality": "브랜드 성격",
      "label_formality": "격식 수준",
      "label_language": "언어",
      "label_tone": "톤",
      "label_length": "콘텐츠 길이",
      "label_level": "읽기 수준",
      "summary_title": "설정 요약",
      "tone_sample_label": "톤 예시:",
      "personality_innovative": "혁신적인",
      "personality_trustworthy": "신뢰할 수 있는",
      "personality_playful": "재미있는",
      "personality_professional": "전문적인",
      "personality_approachable": "친근한",
      "personality_bold": "대담한",
      "personality_authentic": "진정성 있는",
      "personality_sophisticated": "세련된",
      "formality_casual": "캐주얼",
      "formality_neutral": "중립",
      "formality_formal": "격식 있는",
      "language_ko": "한국어",
      "language_en": "영어",
      "tone_professional": "전문적",
      "tone_friendly": "친근한",
      "tone_inspirational": "영감을 주는",
      "tone_educational": "교육적"
    },
    "style": {
      "title": "스타일 설정",
      "subtitle": "콘텐츠의 톤과 길이를 설정해주세요",
      "field_tone": "톤",
      "description_tone": "콘텐츠의 전반적인 분위기를 선택하세요",
      "placeholder_tone": "톤을 선택하세요",
      "field_content_length": "콘텐츠 길이",
      "description_content_length": "기본 콘텐츠 길이를 선택하세요",
      "placeholder_content_length": "콘텐츠 길이를 선택하세요",
      "field_reading_level": "읽기 수준",
      "description_reading_level": "타겟 독자의 전문성 수준을 선택하세요",
      "placeholder_reading_level": "읽기 수준을 선택하세요",
      "tone_professional": "전문적",
      "tone_professional_desc": "비즈니스와 전문성 강조",
      "tone_friendly": "친근한",
      "tone_friendly_desc": "따뜻하고 접근하기 쉬운",
      "tone_inspirational": "영감을 주는",
      "tone_inspirational_desc": "동기부여와 긍정적 메시지",
      "tone_educational": "교육적",
      "tone_educational_desc": "학습과 지식 전달 중심",
      "content_length_short": "짧게",
      "content_length_short_desc": "300-500자 (빠른 읽기)",
      "content_length_medium": "보통",
      "content_length_medium_desc": "500-1000자 (균형잡힌 길이)",
      "content_length_long": "길게",
      "content_length_long_desc": "1000자 이상 (심층 분석)",
      "reading_level_beginner": "초급",
      "reading_level_beginner_desc": "쉬운 단어와 간단한 문장",
      "reading_level_intermediate": "중급",
      "reading_level_intermediate_desc": "일반적인 수준의 어휘",
      "reading_level_advanced": "고급",
      "reading_level_advanced_desc": "전문 용어와 복잡한 개념",
      "tip_icon": "팁",
      "tip_text": "이러한 설정은 AI가 콘텐츠를 생성하는 방식에 영향을 미칩니다."
    },
    "audience": {
      "title": "타겟 독자",
      "subtitle": "어떤 독자를 위한 콘텐츠인지 알려주세요",
      "field_target_audience": "타겟 독자",
      "placeholder_target_audience": "예: 스타트업 창업가, 개발자, 마케터",
      "description_target_audience": "주요 독자층을 구체적으로 정의하세요",
      "field_pain_points": "해결하려는 문제",
      "placeholder_pain_points": "독자들이 겪는 어려움이나 해결하고 싶은 문제",
      "description_pain_points": "독자가 겪는 주요 문제점을 설명하세요",
      "char_count": "{current} / {max}",
      "tip_icon": "팁",
      "tip_text": "구체적일수록 AI가 독자에게 맞는 콘텐츠를 생성할 수 있습니다."
    },
    "language": {
      "title": "언어 설정",
      "subtitle": "주로 사용할 언어를 선택해주세요",
      "field_language": "언어",
      "description_language": "AI가 이 언어로 콘텐츠를 생성합니다",
      "language_ko": "한국어",
      "language_ko_desc": "Korean",
      "language_en": "영어",
      "language_en_desc": "English",
      "tip_icon": "팁",
      "tip_text": "설정에서 나중에 언어를 변경할 수 있습니다."
    },
    "review": {
      "title": "최종 검토",
      "subtitle": "설정을 검토하고 완료해주세요",
      "field_notes": "메모 (선택)",
      "placeholder_notes": "추가로 남기고 싶은 메모가 있다면 입력하세요",
      "description_notes": "AI 참고용 추가 정보를 입력하세요",
      "section_brand_voice": "브랜드 보이스",
      "section_audience": "타겟 독자",
      "section_content_settings": "콘텐츠 설정",
      "label_brand_name": "브랜드 이름",
      "label_description": "설명",
      "label_personality": "성격",
      "label_formality": "격식 수준",
      "label_target_audience": "타겟 독자",
      "label_pain_points": "해결하려는 문제",
      "label_language": "언어",
      "label_tone": "톤",
      "label_length": "콘텐츠 길이",
      "label_reading_level": "읽기 수준",
      "language_ko": "한국어",
      "language_en": "영어",
      "ready_title": "생성 준비 완료!",
      "ready_text": "스타일 가이드 설정이 완료되었습니다. 이제 AI로 콘텐츠를 생성할 수 있습니다."
    }
  }
}
```

## 7. 수정 체크리스트

### 긴급 (하드코딩 제거)
- [ ] `constants.ts` - STEP_NAMES를 i18n으로 변경
- [ ] `constants.ts` - LANGUAGE_OPTIONS을 i18n으로 변경
- [ ] `constants.ts` - PREVIEW_TEMPLATES를 i18n으로 변경
- [ ] `step-header.tsx` - "Step" 텍스트를 i18n으로 변경

### 높음 (번역 키 추가)
- [ ] `messages/en.json`에 모든 누락 키 추가
- [ ] `messages/ko.json`에 모든 누락 키 추가
- [ ] `step-style.tsx` - placeholder 키 구현
- [ ] `step-audience.tsx` - tip 키 구현
- [ ] `step-language.tsx` - tip 키 구현
- [ ] `preview-panel.tsx` - summary_title, label_level 키 구현
- [ ] `step-review.tsx` - 모든 누락 키 구현

### 중간 (코드 업데이트)
- [ ] `constants.ts` - LANGUAGE_OPTIONS에서 i18n 훅 사용 가능하도록 리팩토링
- [ ] `preview-panel.tsx`에 aria-label 추가

### 낮음 (최적화)
- [ ] constants.ts의 레거시 옵션들 정리
- [ ] 번역 일관성 재검증

## 8. 현황 요약

| 항목 | 상태 | 세부사항 |
|------|------|--------|
| 하드코딩 텍스트 | 위험 | 4개 발견 (constants.ts에서 주로 발생) |
| 누락 번역 키 | 위험 | 18개 누락 |
| 접근성 텍스트 | 양호 | aria-label 1곳 추가 필요 |
| 번역 품질 | 양호 | 기존 번역 자연스러움 |
| 전체 평가 | 개선 필요 | 번역 키 추가 및 하드코딩 제거 필요 |

## 9. 결론

현재 i18n 대응 상황:
- **긍정적**: 대부분의 컴포넌트에서 useTranslations() 훅을 올바르게 사용
- **개선필요**: constants.ts의 하드코딩된 텍스트, 18개의 누락된 번역 키

위 체크리스트를 따라 수정하면 완전한 i18n 대응이 가능합니다.
