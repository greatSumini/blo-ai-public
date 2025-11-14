import type { SupabaseClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { AppLogger, AppConfig } from "@/backend/hono/context";
import {
  normalizeKeyword,
  validateKeywordPhrase,
} from "@/features/keywords/lib/normalize";
import { success, failure, type HandlerResult } from "@/backend/http/response";
import { keywordErrorCodes, type KeywordServiceError } from "./error";
import type {
  Keyword,
  KeywordListResponse,
  ListKeywordsInput,
  CreateKeywordInput,
  BulkCreateKeywordsInput,
  KeywordSuggestionsInput,
  KeywordSuggestionsResponse,
  SuggestionItem,
} from "./schema";
import { d4seo } from "../lib/dataforseo";

// ===== 목록 조회 (Full-Text Search 지원) =====
export async function listKeywords(
  supabase: SupabaseClient,
  input: ListKeywordsInput
): Promise<HandlerResult<KeywordListResponse, KeywordServiceError>> {
  try {
    const { query, page, limit } = input;
    const offset = (page - 1) * limit;

    let countQuery = supabase
      .from("keywords")
      .select("*", { count: "exact", head: true });
    let dataQuery = supabase
      .from("keywords")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (query && query.trim().length > 0) {
      const searchTerm = query.trim();
      const filter = `phrase.ilike.%${searchTerm}%`;
      countQuery = countQuery.or(filter);
      dataQuery = dataQuery.or(filter);
    }

    const [{ count }, { data, error }] = await Promise.all([
      countQuery,
      dataQuery,
    ]);

    if (error) {
      return failure(
        500,
        keywordErrorCodes.fetchError,
        "Failed to fetch keywords",
        error
      );
    }

    const items: Keyword[] = (data || []).map((row) => ({
      id: row.id,
      phrase: row.phrase,
      normalized: row.normalized,
      source: row.source,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return success({
      items,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + items.length,
    });
  } catch (err) {
    return failure(
      500,
      keywordErrorCodes.fetchError,
      "Unexpected error fetching keywords",
      err
    );
  }
}

// ===== 단건 생성 =====
export async function createKeyword(
  supabase: SupabaseClient,
  input: CreateKeywordInput
): Promise<HandlerResult<Keyword, KeywordServiceError>> {
  const validation = validateKeywordPhrase(input.phrase);
  if (!validation.valid) {
    return failure(400, keywordErrorCodes.invalidPhrase, validation.error!);
  }

  const normalized = normalizeKeyword(input.phrase);

  try {
    const { data, error } = await supabase
      .from("keywords")
      .insert({
        phrase: input.phrase.trim(),
        normalized,
        source: "manual",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return failure(
          409,
          keywordErrorCodes.duplicateNormalized,
          "Keyword already exists"
        );
      }
      return failure(
        500,
        keywordErrorCodes.createError,
        "Failed to create keyword",
        error
      );
    }

    return success(
      {
        id: data.id,
        phrase: data.phrase,
        normalized: data.normalized,
        source: data.source,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      201
    );
  } catch (err) {
    return failure(
      500,
      keywordErrorCodes.createError,
      "Unexpected error creating keyword",
      err
    );
  }
}

// ===== 다건 생성 (중복 무시) =====
export async function bulkCreateKeywords(
  supabase: SupabaseClient,
  logger: AppLogger,
  input: BulkCreateKeywordsInput
): Promise<
  HandlerResult<
    { created: number; skipped: number; keywords: Keyword[] },
    KeywordServiceError
  >
> {
  const rows = input.phrases
    .map((phrase) => {
      const validation = validateKeywordPhrase(phrase);
      if (!validation.valid) {
        return null;
      }
      return {
        phrase: phrase.trim(),
        normalized: normalizeKeyword(phrase),
        source: "dataforseo",
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) {
    return failure(
      400,
      keywordErrorCodes.bulkInsertError,
      "No valid keywords to insert"
    );
  }

  try {
    const { data, error } = await supabase
      .from("keywords")
      .upsert(rows, { onConflict: "normalized", ignoreDuplicates: true })
      .select();

    if (error) {
      logger.error("Bulk insert error:", error);
      return failure(
        500,
        keywordErrorCodes.bulkInsertError,
        "Failed to bulk insert keywords",
        error
      );
    }

    const created = data?.length || 0;
    const skipped = rows.length - created;

    logger.info(
      `Bulk insert: ${created} created, ${skipped} skipped (duplicates)`
    );

    return success(
      {
        created,
        skipped,
        keywords: (data || []).map((row) => ({
          id: row.id,
          phrase: row.phrase,
          normalized: row.normalized,
          source: row.source,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
      },
      201
    );
  } catch (err) {
    logger.error("Unexpected bulk insert error:", err);
    return failure(
      500,
      keywordErrorCodes.bulkInsertError,
      "Unexpected error during bulk insert",
      err
    );
  }
}

// ===== Gemini 기반 연관 검색어 조회 =====
export async function fetchKeywordSuggestions(
  supabase: SupabaseClient,
  logger: AppLogger,
  config: AppConfig,
  input: KeywordSuggestionsInput
): Promise<HandlerResult<KeywordSuggestionsResponse, KeywordServiceError>> {
  try {
    const { keyword, context } = input;

    const google = createGoogleGenerativeAI({
      apiKey: config.google.generativeAiApiKey,
    });

    const prompt = buildSuggestionsPrompt(keyword, context);

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      logger.error("Failed to parse AI suggestions JSON:", err, text);
      return failure(
        500,
        keywordErrorCodes.dataForSEOError,
        "연관 검색어 결과를 해석하는 중 오류가 발생했습니다."
      );
    }

    if (!Array.isArray(parsed)) {
      logger.error("AI suggestions is not an array:", parsed);
      return failure(
        500,
        keywordErrorCodes.dataForSEOError,
        "연관 검색어 결과 형식이 올바르지 않습니다."
      );
    }

    const normalizedKeyword = keyword.trim().toLowerCase();

    const keywords = parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .filter((item, index, self) => self.indexOf(item) === index)
      .filter((item) => item.toLowerCase().includes(normalizedKeyword))
      .slice(0, 10);

    const suggestions: SuggestionItem[] = keywords.map((k) => ({
      keyword: k,
      competition: null,
    }));

    return success({
      suggestions,
      cached: false,
      cacheExpiresAt: null,
    });
  } catch (err: any) {
    logger.error("Unexpected AI keyword suggestion error:", err);
    return failure(
      500,
      keywordErrorCodes.dataForSEOError,
      "연관 검색어 생성 중 예기치 않은 오류가 발생했습니다.",
      err
    );
  }
}

export async function fetchLongTailSuggestions(input: KeywordSuggestionsInput) {
  const { keyword } = input;

  const relatedKeywords = await d4seo.requestSuggestions(keyword);

  // 현재는 일반 연관 검색어와 동일한 처리
  return success({
    suggestions: relatedKeywords,
    cached: false,
    cacheExpiresAt: null,
  });
}

function buildSuggestionsPrompt(keyword: string, context?: string): string {
  const baseInstruction = `
당신은 검색 마케팅 전문가입니다.

사용자가 아래 기준 키워드에 대해 실제로 검색할 법한 "연관 검색어"를 제안하세요.

규칙:
- 반드시 JSON 배열 형식의 문자열만 출력하세요. 예: ["키워드 A", "키워드 B"]
- 각 항목은 문자열이어야 합니다.
- 최대 10개까지만 제안하세요.
- 모든 연관 검색어에는 기준 키워드가 반드시 포함되어야 합니다.
- 연관 검색어는 2단어 이상이 될 수 있으며, 자연스러운 한국어 검색어여야 합니다.
- 기준 키워드에 관심을 가질 만한 타겟과, 관심이 생길 만한 상황을 상상하고 사람들이 실제로 검색창에 입력할 표현을 만들어주세요.

기준 키워드: "${keyword}"
`;

  const contextInstruction = context?.trim()
    ? `\n추가 맥락(참고용): "${context.trim()}"\n`
    : "\n추가 맥락은 없습니다.\n";

  const outputInstruction = `
위 규칙을 지켜, JSON 배열 문자열만 출력하세요.
설명, 불릿, 코드블록(\`\`\`) 없이 순수 JSON만 반환하세요.
`;

  return `${baseInstruction}${contextInstruction}${outputInstruction}`;
}
