import { auth } from '@clerk/nextjs/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import type { GenerateArticleRequest } from '@/features/articles/backend/schema';
import {
  checkQuota,
} from '@/features/articles/backend/quota-service';
import { articleErrorCodes } from '@/features/articles/backend/error';

type StyleGuideResponse = {
  id: string;
  profileId: string;
  brandName: string;
  brandDescription: string;
  personality: string[];
  formality: string;
  targetAudience: string;
  painPoints: string;
  language: string;
  tone: string;
  contentLength: string;
  readingLevel: string;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

const STYLE_GUIDES_TABLE = 'style_guides';

/**
 * Gets style guide by ID or default style guide for user
 */
const getStyleGuide = async (
  client: SupabaseClient,
  clerkUserId: string,
  styleGuideId?: string,
): Promise<StyleGuideResponse | null> => {
  const { ensureProfile } = await import('@/features/profiles/backend/service');
  const profile = await ensureProfile(client, clerkUserId);
  const profileId = profile?.id;
  if (!profileId) return null;
  let query = client.from(STYLE_GUIDES_TABLE).select('*').eq('profile_id', profileId);

  if (styleGuideId) {
    query = query.eq('id', styleGuideId);
  } else {
    query = query.eq('is_default', true);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return null;
  }

  // Map snake_case to camelCase
  return {
    id: data.id,
    profileId: data.profile_id,
    brandName: data.brand_name,
    brandDescription: data.brand_description,
    personality: data.personality,
    formality: data.formality,
    targetAudience: data.target_audience,
    painPoints: data.pain_points,
    language: data.language,
    tone: data.tone,
    contentLength: data.content_length,
    readingLevel: data.reading_level,
    notes: data.notes,
    isDefault: data.is_default,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

/**
 * Builds AI prompt based on topic, style guide, and keywords
 */
const buildPrompt = (
  topic: string,
  styleGuide: StyleGuideResponse | null,
  keywords: string[],
  additionalInstructions?: string,
): string => {
  const language = styleGuide?.language || 'ko';
  const isKorean = language === 'ko';

  const contentLengthGuide = {
    short: isKorean ? '1000-1500자' : '500-800 words',
    medium: isKorean ? '2000-3000자' : '1000-1500 words',
    long: isKorean ? '4000-6000자' : '2000-3000 words',
  };

  const readingLevelGuide = {
    beginner: isKorean ? '초보자도 쉽게 이해할 수 있는' : 'beginner-friendly',
    intermediate: isKorean ? '중급 수준의' : 'intermediate-level',
    advanced: isKorean ? '전문적이고 심화된' : 'advanced and in-depth',
  };

  const toneGuide = {
    professional: isKorean ? '전문적이고 신뢰감 있는' : 'professional and trustworthy',
    friendly: isKorean ? '친근하고 대화하는 듯한' : 'friendly and conversational',
    inspirational: isKorean ? '영감을 주고 동기부여하는' : 'inspirational and motivating',
    educational: isKorean ? '교육적이고 정보 전달에 충실한' : 'educational and informative',
  };

  const promptTemplate = isKorean
    ? `
당신은 전문 블로그 콘텐츠 작가입니다. 다음 조건에 맞춰 고품질 블로그 글을 작성해주세요.

중요: 아래의 "추가 지시사항"이 제공된 경우, 본 문서의 모든 규칙보다 가장 높은 우선순위로 무조건 준수하세요. 충돌 시 추가 지시사항을 우선합니다.

**주제**: ${topic}

**브랜드 정보**:
${styleGuide ? `- 브랜드명: ${styleGuide.brandName}
- 브랜드 설명: ${styleGuide.brandDescription}
- 브랜드 성격: ${styleGuide.personality.join(', ')}
- 격식 수준: ${styleGuide.formality}
- 타겟 독자: ${styleGuide.targetAudience}
- 독자의 고민: ${styleGuide.painPoints}` : '일반적인 블로그 스타일로 작성'}

**작성 스타일**:
- 어조: ${styleGuide ? toneGuide[styleGuide.tone as keyof typeof toneGuide] : '친근하고 전문적인'}
- 글 길이: ${styleGuide ? contentLengthGuide[styleGuide.contentLength as keyof typeof contentLengthGuide] : '2000-3000자'}
- 난이도: ${styleGuide ? readingLevelGuide[styleGuide.readingLevel as keyof typeof readingLevelGuide] : '중급 수준의'}

**키워드**: ${keywords.length > 0 ? keywords.join(', ') : '주제와 관련된 키워드를 자연스럽게 포함'}

${additionalInstructions ? `**추가 지시사항(최우선 적용)**: ${additionalInstructions}` : ''}

**작성 요구사항**:
1. 제목은 SEO에 최적화되고 클릭을 유도할 수 있도록 작성
2. 본문은 Markdown 형식으로 작성 (제목, 소제목, 목록, 강조 등 활용)
3. 서론, 본론, 결론 구조를 갖추되 자연스럽게 전개
4. 실용적이고 실행 가능한 정보 제공
5. 독자의 고민을 해결하는 데 집중
6. Meta Description은 160자 이내로 요약
7. 주요 키워드를 자연스럽게 본문에 포함
8. 소제목(headings)은 명확하고 구조적으로 구성

**출력 형식**:
- title: 블로그 글 제목
- content: Markdown 형식의 본문 (제목 제외)
- metaDescription: SEO를 위한 메타 설명 (160자 이내)
- keywords: 관련 키워드 배열 (5-10개)
- headings: 본문의 주요 소제목 배열
`
    : `
You are a professional blog content writer. Create a high-quality blog post according to the following requirements.

Important: If "Additional Instructions" are provided, you MUST prioritize them above all other rules in this prompt. In case of any conflict, follow the additional instructions first.

**Topic**: ${topic}

**Brand Information**:
${styleGuide ? `- Brand Name: ${styleGuide.brandName}
- Brand Description: ${styleGuide.brandDescription}
- Brand Personality: ${styleGuide.personality.join(', ')}
- Formality Level: ${styleGuide.formality}
- Target Audience: ${styleGuide.targetAudience}
- Audience Pain Points: ${styleGuide.painPoints}` : 'Write in a general blog style'}

**Writing Style**:
- Tone: ${styleGuide ? toneGuide[styleGuide.tone as keyof typeof toneGuide] : 'friendly and professional'}
- Content Length: ${styleGuide ? contentLengthGuide[styleGuide.contentLength as keyof typeof contentLengthGuide] : '1000-1500 words'}
- Reading Level: ${styleGuide ? readingLevelGuide[styleGuide.readingLevel as keyof typeof readingLevelGuide] : 'intermediate-level'}

**Keywords**: ${keywords.length > 0 ? keywords.join(', ') : 'Naturally include relevant keywords'}

${additionalInstructions ? `**Additional Instructions (Highest Priority)**: ${additionalInstructions}` : ''}

**Writing Requirements**:
1. Create an SEO-optimized title that encourages clicks
2. Write the body in Markdown format (use headings, subheadings, lists, emphasis, etc.)
3. Structure with introduction, body, and conclusion in a natural flow
4. Provide practical and actionable information
5. Focus on solving the reader's pain points
6. Summarize in Meta Description (max 160 characters)
7. Naturally incorporate main keywords throughout the content
8. Organize headings clearly and structurally

**Output Format**:
- title: Blog post title
- content: Markdown-formatted body (excluding title)
- metaDescription: SEO meta description (max 160 chars)
- keywords: Array of relevant keywords (5-10)
- headings: Array of main subheadings from the content
`;

  return promptTemplate;
};

export async function POST(req: Request) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: {
            code: articleErrorCodes.unauthorized,
            message: 'Unauthorized',
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body - expects direct GenerateArticleRequest
    const body = await req.json();
    const { topic, styleGuideId, keywords = [], additionalInstructions } = body as GenerateArticleRequest;

    if (!topic) {
      return new Response(
        JSON.stringify({
          error: {
            code: articleErrorCodes.validationError,
            message: 'Topic is required',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          error: {
            code: articleErrorCodes.aiGenerationFailed,
            message: 'Server configuration error',
          },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check quota
    const quotaCheckResult = await checkQuota(supabase, userId);

    if (!quotaCheckResult.ok) {
      return new Response(
        JSON.stringify({
          error: {
            code: (quotaCheckResult as any).error?.code || articleErrorCodes.quotaCheckFailed,
            message: (quotaCheckResult as any).error?.message || 'Quota check failed',
            details: (quotaCheckResult as any).error?.details,
          },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!quotaCheckResult.data.allowed) {
      return new Response(
        JSON.stringify({
          error: {
            code: articleErrorCodes.quotaExceeded,
            message: `Generation quota exceeded. You have used ${quotaCheckResult.data.currentCount}/${quotaCheckResult.data.limit} generations.`,
            details: {
              tier: quotaCheckResult.data.tier,
              currentCount: quotaCheckResult.data.currentCount,
              limit: quotaCheckResult.data.limit,
            },
          },
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get style guide
    const styleGuide = await getStyleGuide(supabase, userId, styleGuideId);

    if (styleGuideId && !styleGuide) {
      return new Response(
        JSON.stringify({
          error: {
            code: articleErrorCodes.styleGuideNotFound,
            message: 'Style guide not found',
          },
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build prompt
    const systemPrompt = buildPrompt(topic, styleGuide, keywords || [], additionalInstructions);

    // Get API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: {
            code: articleErrorCodes.aiGenerationFailed,
            message: 'Server configuration error',
          },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const google = createGoogleGenerativeAI({ apiKey });

    // Stream text generation with simple prompt
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: '위의 조건에 따라 블로그 글을 작성해주세요.',
        },
      ],
    });

    // Return stream response
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error generating article:', error);

    return new Response(
      JSON.stringify({
        error: {
          code: articleErrorCodes.aiGenerationFailed,
          message: error instanceof Error ? error.message : 'AI generation failed',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
