/**
 * @deprecated This file contains legacy HTTP response utilities that mix HTTP concerns with domain logic.
 *
 * **Migration Status**: All service.ts files have been migrated to domain-centric design.
 *
 * **New Approach**:
 * - Use `@/backend/domain/result` for domain layer (service.ts)
 * - Use `@/backend/http/mapper` for HTTP layer (route.ts)
 *
 * **See**:
 * - `/fix-layering.md` - Full migration report
 * - `/MIGRATION-SUMMARY.md` - Developer guide
 * - `@/backend/domain/result` - Domain types
 * - `@/backend/http/mapper` - HTTP mapping helpers
 *
 * **DO NOT USE** in new code. This file is kept for reference only.
 * Will be removed in a future version.
 */

import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { AppContext } from '@/backend/hono/context';

/**
 * @deprecated Use `DomainSuccess<TData>` from `@/backend/domain/result` instead
 */
export type SuccessResult<TData> = {
  ok: true;
  status: ContentfulStatusCode;
  data: TData;
};

/**
 * @deprecated Use `DomainFailure<TError>` from `@/backend/domain/result` instead
 */
export type ErrorResult<TCode extends string, TDetails = unknown> = {
  ok: false;
  status: ContentfulStatusCode;
  error: {
    code: TCode;
    message: string;
    details?: TDetails;
  };
};

/**
 * @deprecated Use `DomainResult<TData, TError>` from `@/backend/domain/result` instead
 */
export type HandlerResult<TData, TCode extends string, TDetails = unknown> =
  | SuccessResult<TData>
  | ErrorResult<TCode, TDetails>;

/**
 * @deprecated Use `domainSuccess(data)` from `@/backend/domain/result` instead
 *
 * **Migration Example**:
 * ```ts
 * // Before
 * return success(keyword, 201);
 *
 * // After
 * return domainSuccess(keyword);
 * // HTTP 201 status is decided in route.ts using respondCreated()
 * ```
 */
export const success = <TData>(
  data: TData,
  status: ContentfulStatusCode = 200,
): SuccessResult<TData> => ({
  ok: true,
  status,
  data,
});

/**
 * @deprecated Use `domainFailure({ code, message, details })` from `@/backend/domain/result` instead
 *
 * **Migration Example**:
 * ```ts
 * // Before
 * return failure(404, 'NOT_FOUND', 'Resource not found', details);
 *
 * // After
 * return domainFailure({
 *   code: 'NOT_FOUND',
 *   message: 'Resource not found',
 *   details
 * });
 * // HTTP 404 status is automatically mapped in route.ts
 * ```
 */
export const failure = <TCode extends string, TDetails = unknown>(
  status: ContentfulStatusCode,
  code: TCode,
  message: string,
  details?: TDetails,
): ErrorResult<TCode, TDetails> => ({
  ok: false,
  status,
  error: {
    code,
    message,
    ...(details === undefined ? {} : { details }),
  },
});

/**
 * @deprecated Use `respondWithDomain(c, result)` or `respondCreated(c, result)` from `@/backend/http/mapper` instead
 *
 * **Migration Example**:
 * ```ts
 * // Before
 * const result = await createKeyword(...);
 * return respond(c, result);
 *
 * // After (for create endpoints)
 * const result = await createKeyword(...);
 * return respondCreated(c, result);  // 201 on success
 *
 * // After (for other endpoints)
 * const result = await listKeywords(...);
 * return respondWithDomain(c, result);  // 200 on success
 * ```
 */
export const respond = <TData, TCode extends string, TDetails = unknown>(
  c: AppContext,
  result: HandlerResult<TData, TCode, TDetails>,
) => {
  if (result.ok) {
    return c.json(result.data, result.status);
  }

  const errorResult = result as ErrorResult<TCode, TDetails>;

  return c.json(
    {
      error: errorResult.error,
    },
    errorResult.status,
  );
};
