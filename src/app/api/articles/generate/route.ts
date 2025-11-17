import { auth } from '@clerk/nextjs/server';
import {
  convertToModelMessages,
  streamText,
  tool,
  type InferUITools,
  type ToolSet,
  type UIDataTypes,
  type UIMessage,
} from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import type { GenerateArticleRequest } from '@/features/articles/backend/schema';
import {
  checkQuota,
} from '@/features/articles/backend/quota-service';
import { articleErrorCodes } from '@/features/articles/backend/error';
import { d4seo } from '@/features/keywords/lib/dataforseo';
import { naverSearch } from '@/lib/naver_search';
import { braveSearch } from '@/lib/brave_search';
import { z } from 'zod';

type BrandingResponse = {
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

const BRANDINGS_TABLE = 'style_guides';

// ==== Tools definition (server + client) ====

const tools = {
  // client-side tool: 메인 키워드 설정 (키워드 상태만 변경)
  set_main_keyword: tool({
    description:
      'Set the main SEO keyword for the article based on the topic and context.',
    inputSchema: z.object({
      keyword: z.string().min(1),
    }),
  }),

  // server-side tool: DataForSEO 기반 연관/롱테일 키워드 조회
  suggest_keywords: tool({
    description:
      'Fetch long-tail related keywords with search volume, competition, and CPC using the DataForSEO API.',
    inputSchema: z.object({
      keyword: z.string().min(1),
    }),
    async execute({ keyword }) {
      try {
        const suggestions = await d4seo.requestSuggestions(keyword);
        return suggestions;
      } catch (error) {
        console.error('suggest_keywords tool failed', error);
        // 실패하더라도 모델이 계속 진행할 수 있도록 빈 배열 반환
        return [];
      }
    },
  }),

  // server-side tool: 네이버 블로그 상위 검색 결과 조회
  naver_search_blog: tool({
    description:
      'Search top Naver blog posts for a given keyword and return summarized results.',
    inputSchema: z.object({
      keyword: z.string().min(1),
    }),
    async execute({ keyword }) {
      try {
        const results = await naverSearch.searchBlog({
          query: keyword,
          display: 5,
          start: 1,
          sort: 'sim',
        });

        return results.map((item) => ({
          title: item.title,
          description: item.description,
        }));
      } catch (error) {
        console.error('naver_search_blog tool failed', error);
        return [];
      }
    },
  }),

  // server-side tool: Brave Search 기반 웹 리서치
  brave_search: tool({
    description:
      'Search the web using Brave Search to gather expert knowledge and up-to-date information.',
    inputSchema: z.object({
      query: z.string().min(1),
    }),
    async execute({ query }) {
      try {
        const result = await braveSearch.searchWeb({
          query,
          count: 5,
          offset: 0,
        });

        return result.results.map((item) => ({
          title: item.title,
          description: item.description,
          published: item.published ?? '',
          rank: item.rank ?? 0,
        }));
      } catch (error) {
        console.error('brave_search tool failed', error);
        return [];
      }
    },
  }),

  // client-side tool: SEO 메타데이터 상태 설정
  set_metadata: tool({
    description:
      'Set SEO metadata for the article (title, slug, description, keywords, headings) in client state.',
    inputSchema: z.object({
      title: z.string(),
      slug: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
      headings: z.array(z.string()),
    }),
  }),

  // client-side tool: 최종 본문 상태 설정
  set_content: tool({
    description:
      'Set the final Markdown content for the article in client state.',
    inputSchema: z.object({
      content: z.string(),
    }),
  }),
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;

export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

type AgentChatRequest = GenerateArticleRequest & {
  messages: ChatMessage[];
};

/**
 * Gets style guide by ID or default style guide for user
 */
const getBranding = async (
  client: SupabaseClient,
  clerkUserId: string,
  brandingId?: string,
): Promise<BrandingResponse | null> => {
  const { ensureProfile } = await import('@/features/profiles/backend/service');
  const profile = await ensureProfile(client, clerkUserId);
  const profileId = profile?.id;
  if (!profileId) return null;
  let query = client.from(BRANDINGS_TABLE).select('*').eq('profile_id', profileId);

  if (brandingId) {
    query = query.eq('id', brandingId);
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
  branding: BrandingResponse | null,
  keywords: string[],
  additionalInstructions?: string,
): string => {
  const language = branding?.language || 'ko';
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
${branding ? `- 브랜드명: ${branding.brandName}
- 브랜드 설명: ${branding.brandDescription}
- 브랜드 성격: ${branding.personality.join(', ')}
- 격식 수준: ${branding.formality}
- 타겟 독자: ${branding.targetAudience}
- 독자의 고민: ${branding.painPoints}` : '일반적인 블로그 스타일로 작성'}

**작성 스타일**:
- 어조: ${branding ? toneGuide[branding.tone as keyof typeof toneGuide] : '친근하고 전문적인'}
- 글 길이: ${branding ? contentLengthGuide[branding.contentLength as keyof typeof contentLengthGuide] : '2000-3000자'}
- 난이도: ${branding ? readingLevelGuide[branding.readingLevel as keyof typeof readingLevelGuide] : '중급 수준의'}

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
${branding ? `- Brand Name: ${branding.brandName}
- Brand Description: ${branding.brandDescription}
- Brand Personality: ${branding.personality.join(', ')}
- Formality Level: ${branding.formality}
- Target Audience: ${branding.targetAudience}
- Audience Pain Points: ${branding.painPoints}` : 'Write in a general blog style'}

**Writing Style**:
- Tone: ${branding ? toneGuide[branding.tone as keyof typeof toneGuide] : 'friendly and professional'}
- Content Length: ${branding ? contentLengthGuide[branding.contentLength as keyof typeof contentLengthGuide] : '1000-1500 words'}
- Reading Level: ${branding ? readingLevelGuide[branding.readingLevel as keyof typeof readingLevelGuide] : 'intermediate-level'}

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

const buildAgentSystemPrompt = (
  topic: string,
  branding: BrandingResponse | null,
  keywords: string[],
  additionalInstructions?: string,
): string => {
  const basePrompt = buildPrompt(topic, branding, keywords, additionalInstructions);

  return `
${basePrompt}

---

당신은 위 조건에 맞춰 블로그 글을 작성하는 **대화형 에이전트**입니다. 아래 워크플로우를 **반드시 순서대로** 따르세요.

1. 사용자가 "글 작성을 시작해주세요."라고 말하면 작업을 시작합니다.
2. 먼저 사용자가 입력한 **주제, 브랜딩/스타일 정보, 초기 키워드**를 3~4줄로 간단히 요약해서 브리핑하고, 내용이 맞는지 질문합니다.
3. 사용자가 글 작성을 요청하면, 다음 툴들을 순서대로 사용합니다. 이전 단계가 성공적으로 끝나기 전에는 다음 툴을 호출하지 마세요.
   - (필요 시) \`set_main_keyword\`: 현재 키워드 목록이 비어있다면 주제와 문맥을 바탕으로 가장 유력한 검색어 하나를 선택해 메인 키워드를 설정합니다.
   - \`suggest_keywords\`: 메인 키워드를 기반으로 DataForSEO에서 롱테일 키워드를 가져와 키워드 목록에 추가합니다.
   - \`naver_search_blog\`: 상위 3개의 주요 키워드 각각에 대해 네이버 블로그 검색을 수행하고, 상위 검색 결과를 분석합니다.
   - \`brave_search\`: 글 작성을 위해 필요한 추가 전문 지식/정보를 스스로 목록화한 뒤, 그에 맞는 검색 쿼리로 Brave Search를 사용합니다.
   - \`set_metadata\`: 최종 글의 SEO를 위한 메타데이터(title, slug, description, keywords, headings)를 한 번에 설정합니다.
   - \`set_content\`: 최종 Markdown 본문 전체를 한 번에 설정합니다.
4. 각 툴 호출 전에는 **무엇을 위해 이 툴을 사용하는지** 1~2줄로 설명하고, 호출이 완료된 후에는 결과를 요약해서 설명합니다.
5. \`set_content\` 툴이 성공적으로 완료된 후에는 마지막으로 한 번만 다음 문장을 포함한 짧은 메시지를 출력하고 대화를 종료합니다.
   - "글 작성이 완료되었습니다."

대화 내내:
- 사용자가 이해하기 쉽도록 마크다운 형식을 활용합니다.
- 불필요하게 장황하지 않게, 핵심 위주로 설명합니다.
- 모든 응답은 한국어로 작성합니다.
`;
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

    // Parse request body - chat messages + generation context
    const body = (await req.json()) as AgentChatRequest;
    const {
      messages,
      topic,
      brandingId,
      keywords = [],
      additionalInstructions,
    } = body;

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

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: {
            code: articleErrorCodes.validationError,
            message: 'Messages are required',
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
    const branding = await getBranding(supabase, userId, brandingId);

    if (brandingId && !branding) {
      return new Response(
        JSON.stringify({
          error: {
            code: articleErrorCodes.brandingNotFound,
            message: 'Style guide not found',
          },
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt for agent workflow
    const systemPrompt = buildAgentSystemPrompt(
      topic,
      branding,
      keywords || [],
      additionalInstructions,
    );

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

    // Stream chat with tools (agentic workflow)
    const result = streamText({
      model: google('gemini-2.5-pro'),
      system: systemPrompt,
      messages: convertToModelMessages<ChatMessage>(messages),
      tools,
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
