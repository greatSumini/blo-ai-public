import { z } from 'zod';
import { onboardingSchema } from '@/features/onboarding/lib/onboarding-schema';

// Request schema - reuses the onboarding form schema
export const CreateStyleGuideRequestSchema = onboardingSchema;

export type CreateStyleGuideRequest = z.infer<typeof CreateStyleGuideRequestSchema>;

// Database row schema (snake_case to match database columns)
export const StyleGuideTableRowSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  brand_name: z.string(),
  brand_description: z.string(),
  personality: z.array(z.string()),
  formality: z.enum(['casual', 'neutral', 'formal']),
  target_audience: z.string(),
  pain_points: z.string(),
  language: z.enum(['ko', 'en']),
  tone: z.enum(['professional', 'friendly', 'inspirational', 'educational']),
  content_length: z.enum(['short', 'medium', 'long']),
  reading_level: z.enum(['beginner', 'intermediate', 'advanced']),
  notes: z.string().nullable(),
  is_default: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type StyleGuideRow = z.infer<typeof StyleGuideTableRowSchema>;

// Response schema (camelCase for API responses)
export const StyleGuideResponseSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  brandName: z.string(),
  brandDescription: z.string(),
  personality: z.array(z.string()),
  formality: z.enum(['casual', 'neutral', 'formal']),
  targetAudience: z.string(),
  painPoints: z.string(),
  language: z.enum(['ko', 'en']),
  tone: z.enum(['professional', 'friendly', 'inspirational', 'educational']),
  contentLength: z.enum(['short', 'medium', 'long']),
  readingLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  notes: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type StyleGuideResponse = z.infer<typeof StyleGuideResponseSchema>;
