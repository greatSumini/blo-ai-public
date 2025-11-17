import type { DomainError } from '@/backend/domain/result';

export const brandingErrorCodes = {
  unauthorized: 'BRANDING_UNAUTHORIZED',
  notFound: 'BRANDING_NOT_FOUND',
  createError: 'BRANDING_CREATE_ERROR',
  validationError: 'BRANDING_VALIDATION_ERROR',
  upsertError: 'BRANDING_UPSERT_ERROR',
  fetchError: 'BRANDING_FETCH_ERROR',
} as const;

export type StyleGuideDomainError = DomainError & {
  code: (typeof brandingErrorCodes)[keyof typeof brandingErrorCodes];
};
