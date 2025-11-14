import type { DomainError } from '@/backend/domain/result';

export const profileErrorCodes = {
  upsertFailed: 'PROFILE_UPSERT_FAILED',
  deleteFailed: 'PROFILE_DELETE_FAILED',
} as const;

export type ProfileDomainError = DomainError & {
  code: (typeof profileErrorCodes)[keyof typeof profileErrorCodes];
};
