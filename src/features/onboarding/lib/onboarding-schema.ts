import { z } from "zod";

// Step 1: Brand Voice Schema
export const brandVoiceSchema = z.object({
  brandName: z
    .string()
    .min(1, "브랜드 이름을 입력해주세요")
    .max(50, "브랜드 이름은 50자 이내로 입력해주세요"),
  brandDescription: z
    .string()
    .min(10, "브랜드 설명은 최소 10자 이상 입력해주세요")
    .max(500, "브랜드 설명은 500자 이내로 입력해주세요"),
  personality: z
    .array(z.string())
    .min(1, "최소 1개의 성격을 선택해주세요")
    .max(3, "최대 3개까지 선택 가능합니다"),
  formality: z.enum(["casual", "neutral", "formal"], {
    errorMap: () => ({ message: "격식 수준을 선택해주세요" }),
  }),
});

// Step 2: Target Audience Schema
export const targetAudienceSchema = z.object({
  targetAudience: z
    .string()
    .min(10, "타겟 독자에 대한 설명을 최소 10자 이상 입력해주세요")
    .max(300, "타겟 독자 설명은 300자 이내로 입력해주세요"),
  painPoints: z
    .string()
    .min(10, "해결하려는 문제를 최소 10자 이상 입력해주세요")
    .max(300, "문제 설명은 300자 이내로 입력해주세요"),
});

// Step 3: Language Schema
export const languageSchema = z.object({
  language: z.enum(["ko", "en"], {
    errorMap: () => ({ message: "언어를 선택해주세요" }),
  }),
});

// Step 4: Style Schema
export const styleSchema = z.object({
  tone: z.enum(["professional", "friendly", "inspirational", "educational"], {
    errorMap: () => ({ message: "톤을 선택해주세요" }),
  }),
  contentLength: z.enum(["short", "medium", "long"], {
    errorMap: () => ({ message: "콘텐츠 길이를 선택해주세요" }),
  }),
  readingLevel: z.enum(["beginner", "intermediate", "advanced"], {
    errorMap: () => ({ message: "읽기 수준을 선택해주세요" }),
  }),
});

// Step 5: Review Schema
export const reviewSchema = z.object({
  notes: z.string().max(500, "메모는 500자 이내로 입력해주세요").optional(),
});

// Full Onboarding Schema (all steps combined)
export const onboardingSchema = z.object({
  ...brandVoiceSchema.shape,
  ...targetAudienceSchema.shape,
  ...languageSchema.shape,
  ...styleSchema.shape,
  ...reviewSchema.shape,
});

// Export Types
export type BrandVoiceFormData = z.infer<typeof brandVoiceSchema>;
export type TargetAudienceFormData = z.infer<typeof targetAudienceSchema>;
export type LanguageFormData = z.infer<typeof languageSchema>;
export type StyleFormData = z.infer<typeof styleSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Default values for the form
export const defaultOnboardingValues: OnboardingFormData = {
  brandName: "",
  brandDescription: "",
  personality: [],
  formality: "neutral",
  targetAudience: "",
  painPoints: "",
  language: "ko",
  tone: "professional",
  contentLength: "medium",
  readingLevel: "intermediate",
  notes: "",
};
