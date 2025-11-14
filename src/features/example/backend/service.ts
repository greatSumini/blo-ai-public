import type { SupabaseClient } from '@supabase/supabase-js';
import {
  domainSuccess,
  domainFailure,
  type DomainResult,
} from '@/backend/domain/result';
import {
  ExampleResponseSchema,
  ExampleTableRowSchema,
  type ExampleResponse,
  type ExampleRow,
} from '@/features/example/backend/schema';
import {
  exampleErrorCodes,
  type ExampleDomainError,
} from '@/features/example/backend/error';

const EXAMPLE_TABLE = 'example';

const fallbackAvatar = (id: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(id)}/200/200`;

/**
 * ID로 Example 조회 (순수 비즈니스 로직)
 * ✅ HTTP 상태 코드 없음
 * ✅ 도메인 에러만 반환
 */
export const getExampleById = async (
  client: SupabaseClient,
  id: string,
): Promise<DomainResult<ExampleResponse, ExampleDomainError>> => {
  const { data, error } = await client
    .from(EXAMPLE_TABLE)
    .select('id, full_name, avatar_url, bio, updated_at')
    .eq('id', id)
    .maybeSingle<ExampleRow>();

  if (error) {
    return domainFailure({
      code: exampleErrorCodes.fetchError,
      message: error.message,
    });
  }

  if (!data) {
    return domainFailure({
      code: exampleErrorCodes.notFound,
      message: 'Example not found',
    });
  }

  const rowParse = ExampleTableRowSchema.safeParse(data);

  if (!rowParse.success) {
    return domainFailure({
      code: exampleErrorCodes.validationError,
      message: 'Example row failed validation.',
      details: rowParse.error.format(),
    });
  }

  const mapped = {
    id: rowParse.data.id,
    fullName: rowParse.data.full_name ?? 'Anonymous User',
    avatarUrl:
      rowParse.data.avatar_url ?? fallbackAvatar(rowParse.data.id),
    bio: rowParse.data.bio,
    updatedAt: rowParse.data.updated_at,
  } satisfies ExampleResponse;

  const parsed = ExampleResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return domainFailure({
      code: exampleErrorCodes.validationError,
      message: 'Example payload failed validation.',
      details: parsed.error.format(),
    });
  }

  return domainSuccess(parsed.data);
};
