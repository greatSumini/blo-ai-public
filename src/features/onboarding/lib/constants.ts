// Step configuration
export const TOTAL_STEPS = 5;

export const STEP_KEYS = [
  "brand_voice",
  "audience",
  "language",
  "style",
  "review",
] as const;

// Step 1: Brand Voice Options (values only)
export const PERSONALITY_VALUES = [
  "innovative",
  "trustworthy",
  "playful",
  "professional",
  "approachable",
  "bold",
  "authentic",
  "sophisticated",
] as const;

export const FORMALITY_VALUES = ["casual", "neutral", "formal"] as const;

// Step 3: Language Options (values only)
export const LANGUAGE_VALUES = ["ko", "en"] as const;

// Step 4: Style Options (values only)
export const TONE_VALUES = [
  "professional",
  "friendly",
  "inspirational",
  "educational",
] as const;

export const CONTENT_LENGTH_VALUES = ["short", "medium", "long"] as const;

export const READING_LEVEL_VALUES = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

// Type exports
export type PersonalityValue = (typeof PERSONALITY_VALUES)[number];
export type FormalityValue = (typeof FORMALITY_VALUES)[number];
export type LanguageValue = (typeof LANGUAGE_VALUES)[number];
export type ToneValue = (typeof TONE_VALUES)[number];
export type ContentLengthValue = (typeof CONTENT_LENGTH_VALUES)[number];
export type ReadingLevelValue = (typeof READING_LEVEL_VALUES)[number];

// Legacy exports for backward compatibility (deprecated - use i18n instead)
export const STEP_NAMES = [
  "브랜드 보이스",
  "타겟 독자",
  "언어 설정",
  "스타일 설정",
  "최종 검토",
];

export const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어", description: "Korean" },
  { value: "en", label: "English", description: "English" },
];

export const PERSONALITY_OPTIONS = PERSONALITY_VALUES.map((v) => ({
  value: v,
  label: v,
}));

export const FORMALITY_OPTIONS = FORMALITY_VALUES.map((v) => ({
  value: v,
  label: v,
  description: "",
}));

export const TONE_OPTIONS = TONE_VALUES.map((v) => ({
  value: v,
  label: v,
  description: "",
}));

export const CONTENT_LENGTH_OPTIONS = CONTENT_LENGTH_VALUES.map((v) => ({
  value: v,
  label: v,
  description: "",
}));

export const READING_LEVEL_OPTIONS = READING_LEVEL_VALUES.map((v) => ({
  value: v,
  label: v,
  description: "",
}));

export const PREVIEW_TEMPLATES = {
  ko: {
    professional: "안녕하세요, {brandName}입니다...",
    friendly: "반가워요! {brandName}와 함께해요...",
    inspirational: "함께 성장하는 {brandName}...",
    educational: "{brandName}에서 배우는...",
  },
  en: {
    professional: "Welcome to {brandName}...",
    friendly: "Hi there! Let's explore {brandName}...",
    inspirational: "Grow with {brandName}...",
    educational: "Learn from {brandName}...",
  },
};
