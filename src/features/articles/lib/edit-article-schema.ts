import { z } from "zod";
import {
  ArticleStatusSchema,
  ContentToneSchema,
  ContentLengthSchema,
  ReadingLevelSchema,
} from "../backend/schema";

/**
 * 에디터 페이지용 Form 스키마
 * Backend UpdateArticleRequestSchema와 일치하며,
 * react-hook-form으로 클라이언트 측 유효성 검사에 사용
 */
export const EditArticleFormSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(200, "제목은 200자 이내로 입력해주세요"),
  slug: z
    .string()
    .min(1, "URL 슬러그를 입력해주세요")
    .max(200, "슬러그는 200자 이내로 입력해주세요")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "슬러그는 소문자, 숫자, 하이픈(-)만 사용 가능합니다"
    ),
  content: z.string().min(1, "내용을 입력해주세요"),
  description: z
    .string()
    .max(500, "설명은 500자 이내로 입력해주세요")
    .optional()
    .or(z.literal("")),
  keywords: z.array(z.string()).default([]),
  metaTitle: z
    .string()
    .max(60, "Meta 제목은 60자 이내로 입력해주세요")
    .optional()
    .or(z.literal("")),
  metaDescription: z
    .string()
    .max(160, "Meta 설명은 160자 이내로 입력해주세요")
    .optional()
    .or(z.literal("")),
  styleGuideId: z.string().uuid("유효하지 않은 스타일 가이드 ID입니다").optional(),
  tone: ContentToneSchema.optional(),
  contentLength: ContentLengthSchema.optional(),
  readingLevel: ReadingLevelSchema.optional(),
  status: ArticleStatusSchema.default("draft"),
});

export type EditArticleFormValues = z.infer<typeof EditArticleFormSchema>;
