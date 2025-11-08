export const styleGuideErrorCodes = {
  unauthorized: 'STYLE_GUIDE_UNAUTHORIZED',
  createError: 'STYLE_GUIDE_CREATE_ERROR',
  validationError: 'STYLE_GUIDE_VALIDATION_ERROR',
  upsertError: 'STYLE_GUIDE_UPSERT_ERROR',
} as const;

type StyleGuideErrorValue = (typeof styleGuideErrorCodes)[keyof typeof styleGuideErrorCodes];

export type StyleGuideServiceError = StyleGuideErrorValue;
