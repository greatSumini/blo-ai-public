import type { DomainError } from '@/backend/domain/result';

/**
 * Example 도메인 에러 코드 (HTTP 무관)
 */
export const exampleErrorCodes = {
  notFound: 'EXAMPLE_NOT_FOUND',
  fetchError: 'EXAMPLE_FETCH_ERROR',
  validationError: 'EXAMPLE_VALIDATION_ERROR',
} as const;

type ExampleErrorValue = (typeof exampleErrorCodes)[keyof typeof exampleErrorCodes];

/**
 * Example 도메인 에러 타입
 */
export type ExampleDomainError = DomainError & {
  code: ExampleErrorValue;
};
