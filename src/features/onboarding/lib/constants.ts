// Step configuration
export const TOTAL_STEPS = 5;

export const STEP_NAMES = [
  "브랜드 보이스",
  "타겟 독자",
  "언어 설정",
  "스타일 설정",
  "최종 검토",
] as const;

export const STEP_DESCRIPTIONS = [
  "브랜드의 개성과 목소리를 정의해주세요",
  "어떤 독자를 위한 콘텐츠인지 알려주세요",
  "주로 사용할 언어를 선택해주세요",
  "콘텐츠의 톤과 길이를 설정해주세요",
  "설정을 검토하고 완료해주세요",
] as const;

// Step 1: Brand Voice Options
export const PERSONALITY_OPTIONS = [
  { value: "innovative", label: "혁신적인" },
  { value: "trustworthy", label: "신뢰할 수 있는" },
  { value: "playful", label: "재미있는" },
  { value: "professional", label: "전문적인" },
  { value: "approachable", label: "친근한" },
  { value: "bold", label: "대담한" },
  { value: "authentic", label: "진정성 있는" },
  { value: "sophisticated", label: "세련된" },
] as const;

export const FORMALITY_OPTIONS = [
  { value: "casual", label: "캐주얼", description: "편안하고 일상적인 대화체" },
  {
    value: "neutral",
    label: "중립",
    description: "격식과 편안함의 균형",
  },
  {
    value: "formal",
    label: "격식 있는",
    description: "전문적이고 공식적인 어조",
  },
] as const;

// Step 3: Language Options
export const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어", description: "Korean" },
  { value: "en", label: "영어", description: "English" },
] as const;

// Step 4: Style Options
export const TONE_OPTIONS = [
  {
    value: "professional",
    label: "전문적",
    description: "비즈니스와 전문성 강조",
  },
  {
    value: "friendly",
    label: "친근한",
    description: "따뜻하고 접근하기 쉬운",
  },
  {
    value: "inspirational",
    label: "영감을 주는",
    description: "동기부여와 긍정적 메시지",
  },
  {
    value: "educational",
    label: "교육적",
    description: "학습과 지식 전달 중심",
  },
] as const;

export const CONTENT_LENGTH_OPTIONS = [
  {
    value: "short",
    label: "짧게",
    description: "300-500자 (빠른 읽기)",
  },
  {
    value: "medium",
    label: "보통",
    description: "500-1000자 (균형잡힌 길이)",
  },
  {
    value: "long",
    label: "길게",
    description: "1000자 이상 (심층 분석)",
  },
] as const;

export const READING_LEVEL_OPTIONS = [
  {
    value: "beginner",
    label: "초급",
    description: "쉬운 단어와 간단한 문장",
  },
  {
    value: "intermediate",
    label: "중급",
    description: "일반적인 수준의 어휘",
  },
  {
    value: "advanced",
    label: "고급",
    description: "전문 용어와 복잡한 개념",
  },
] as const;

// Preview templates
export const PREVIEW_TEMPLATES = {
  ko: {
    casual:
      "{brandName}는 {personality}한 브랜드예요. 우리는 {targetAudience}를 위해 콘텐츠를 만들어요.",
    neutral:
      "{brandName}는 {personality} 브랜드입니다. {targetAudience}를 위한 콘텐츠를 제공합니다.",
    formal:
      "{brandName}는 {personality} 브랜드로서, {targetAudience}를 대상으로 전문 콘텐츠를 제공하고 있습니다.",
  },
  en: {
    casual:
      "{brandName} is a {personality} brand. We create content for {targetAudience}.",
    neutral:
      "{brandName} is a {personality} brand. We provide content for {targetAudience}.",
    formal:
      "{brandName} is a {personality} brand that provides professional content for {targetAudience}.",
  },
} as const;
