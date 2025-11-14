import type { DomainError } from '@/backend/domain/result';

export const styleGuideErrorCodes = {
  unauthorized: 'STYLE_GUIDE_UNAUTHORIZED',
  notFound: 'STYLE_GUIDE_NOT_FOUND',
  createError: 'STYLE_GUIDE_CREATE_ERROR',
  validationError: 'STYLE_GUIDE_VALIDATION_ERROR',
  upsertError: 'STYLE_GUIDE_UPSERT_ERROR',
  fetchError: 'STYLE_GUIDE_FETCH_ERROR',
} as const;

export type StyleGuideDomainError = DomainError & {
  code: (typeof styleGuideErrorCodes)[keyof typeof styleGuideErrorCodes];
};
