import type { DomainError, DomainResult } from '@/backend/domain/result';
import type { AppContext } from '@/backend/hono/context';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * 도메인 에러 코드 → HTTP 상태 코드 매핑 규칙
 */
const ERROR_STATUS_MAP: Record<string, ContentfulStatusCode> = {
  // 4xx Client Errors - Validation
  'VALIDATION_ERROR': 400,
  'INVALID_INPUT': 400,
  'INVALID_KEYWORD_PHRASE': 400,
  'ARTICLE_VALIDATION_ERROR': 400,
  'BRANDING_VALIDATION_ERROR': 400,
  'EXAMPLE_VALIDATION_ERROR': 400,

  // 4xx Client Errors - Not Found
  'NOT_FOUND': 404,
  'KEYWORD_NOT_FOUND': 404,
  'ARTICLE_NOT_FOUND': 404,
  'BRANDING_NOT_FOUND': 404,
  'EXAMPLE_NOT_FOUND': 404,
  'PROFILE_NOT_FOUND': 404,
  'SETTINGS_NOT_FOUND': 404,

  // 4xx Client Errors - Duplicate
  'DUPLICATE': 409,
  'DUPLICATE_KEYWORD_PHRASE': 409,
  'DUPLICATE_KEYWORD_NORMALIZED': 409,

  // 4xx Client Errors - Authorization
  'UNAUTHORIZED': 401,
  'ARTICLE_UNAUTHORIZED': 401,
  'BRANDING_UNAUTHORIZED': 401,

  // 4xx Client Errors - Quota
  'QUOTA_EXCEEDED': 429,

  // 4xx Client Errors - Subscription
  'SUBSCRIPTION_NOT_FOUND': 404,
  'ALREADY_PRO_SUBSCRIBER': 409,
  'ALREADY_CANCELED': 409,
  'CANNOT_REACTIVATE': 400,
  'NO_BILLING_KEY': 400,
  'QUOTA_NOT_FOUND': 404,

  // 5xx Server Errors - Database Operations
  'DATABASE_ERROR': 500,
  'KEYWORD_FETCH_ERROR': 500,
  'KEYWORD_CREATE_ERROR': 500,
  'KEYWORD_UPDATE_ERROR': 500,
  'KEYWORD_DELETE_ERROR': 500,
  'KEYWORD_BULK_INSERT_ERROR': 500,
  'KEYWORD_BULK_INSERT_PARTIAL_SUCCESS': 500,
  'ARTICLE_FETCH_ERROR': 500,
  'ARTICLE_CREATE_ERROR': 500,
  'ARTICLE_UPDATE_ERROR': 500,
  'ARTICLE_DELETE_ERROR': 500,
  'BRANDING_FETCH_ERROR': 500,
  'BRANDING_CREATE_ERROR': 500,
  'BRANDING_UPSERT_ERROR': 500,
  'EXAMPLE_FETCH_ERROR': 500,

  // 5xx Server Errors - External Services
  'DATAFORSEO_API_ERROR': 500,
  'DATAFORSEO_RATE_LIMIT': 500,
  'DATAFORSEO_TIMEOUT': 500,
  'DATAFORSEO_INVALID_CREDENTIALS': 500,

  // 5xx Server Errors - AI & Quota
  'AI_GENERATION_FAILED': 500,
  'QUOTA_CHECK_FAILED': 500,
  'QUOTA_INCREMENT_FAILED': 500,
  'QUOTA_UPDATE_FAILED': 500,

  // 5xx Server Errors - Payment
  'PAYMENT_FAILED': 500,
  'BILLING_KEY_ISSUE_FAILED': 500,
  'BILLING_KEY_DELETE_FAILED': 500,

  // 5xx Server Errors - Cache
  'CACHE_READ_ERROR': 500,
  'CACHE_WRITE_ERROR': 500,

  // 5xx Server Errors - Profile
  'profile_upsert_failed': 500,
  'profile_delete_failed': 500,

  // 5xx Server Errors - Account
  'PROFILE_UPDATE_FAILED': 500,
  'SETTINGS_UPDATE_FAILED': 500,
};

/**
 * 도메인 에러 코드로부터 적절한 HTTP 상태 코드 추론
 * @param errorCode - 도메인 에러 코드
 * @returns HTTP 상태 코드
 */
function inferStatusCode(errorCode: string): ContentfulStatusCode {
  // 명시적 매핑 확인
  if (errorCode in ERROR_STATUS_MAP) {
    return ERROR_STATUS_MAP[errorCode];
  }

  // 패턴 기반 추론
  if (errorCode.includes('NOT_FOUND')) return 404;
  if (errorCode.includes('DUPLICATE')) return 409;
  if (errorCode.includes('UNAUTHORIZED')) return 401;
  if (errorCode.includes('FORBIDDEN')) return 403;
  if (errorCode.includes('QUOTA')) return 429;
  if (errorCode.includes('VALIDATION')) return 400;

  // 기본값: 500 Internal Server Error
  return 500;
}

/**
 * 도메인 결과를 HTTP 응답으로 변환
 * @param c - Hono context
 * @param result - 도메인 결과
 * @param successStatus - 성공 시 사용할 HTTP 상태 코드 (기본값: 200)
 * @returns HTTP JSON 응답
 */
export function respondWithDomain<TData, TError extends DomainError>(
  c: AppContext,
  result: DomainResult<TData, TError>,
  successStatus: ContentfulStatusCode = 200
) {
  if (result.ok) {
    return c.json(result.data, successStatus);
  }

  // Type assertion: result.ok is false, so result must be DomainFailure
  const errorResult = result as { ok: false; error: TError };
  const status = inferStatusCode(errorResult.error.code);

  return c.json(
    {
      error: {
        code: errorResult.error.code,
        message: errorResult.error.message,
        ...(errorResult.error.details !== undefined
          ? { details: errorResult.error.details }
          : {}),
      },
    },
    status
  );
}

/**
 * 생성(Create) 작업용 헬퍼 (201 Created)
 * @param c - Hono context
 * @param result - 도메인 결과
 * @returns HTTP JSON 응답 (성공 시 201)
 */
export function respondCreated<TData, TError extends DomainError>(
  c: AppContext,
  result: DomainResult<TData, TError>
) {
  return respondWithDomain(c, result, 201);
}
