/**
 * 도메인 레이어의 순수한 결과 타입 (HTTP 무관)
 */
export type DomainResult<TData, TError extends DomainError> =
  | DomainSuccess<TData>
  | DomainFailure<TError>;

/**
 * 도메인 성공 결과
 */
export type DomainSuccess<TData> = {
  ok: true;
  data: TData;
};

/**
 * 도메인 실패 결과
 */
export type DomainFailure<TError extends DomainError> = {
  ok: false;
  error: TError;
};

/**
 * 도메인 에러 (HTTP 상태 코드 없음)
 */
export type DomainError = {
  code: string; // 도메인 에러 코드 (예: 'KEYWORD_DUPLICATE')
  message: string; // 사용자 친화적 메시지
  details?: unknown; // 추가 컨텍스트
};

/**
 * 도메인 성공 결과 생성 헬퍼
 * @param data - 성공 시 반환할 데이터
 * @returns DomainSuccess 객체
 */
export const domainSuccess = <TData>(data: TData): DomainSuccess<TData> => ({
  ok: true,
  data,
});

/**
 * 도메인 실패 결과 생성 헬퍼
 * @param error - 도메인 에러 객체
 * @returns DomainFailure 객체
 */
export const domainFailure = <TError extends DomainError>(
  error: TError
): DomainFailure<TError> => ({
  ok: false,
  error,
});
