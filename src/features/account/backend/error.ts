import type { DomainError } from "@/backend/domain/result";

/**
 * Account Feature Error Codes
 */
export const accountErrorCodes = {
  // Profile errors
  profileNotFound: "PROFILE_NOT_FOUND",
  profileUpdateFailed: "PROFILE_UPDATE_FAILED",

  // Settings errors
  settingsNotFound: "SETTINGS_NOT_FOUND",
  settingsUpdateFailed: "SETTINGS_UPDATE_FAILED",

  // Common errors
  validationError: "VALIDATION_ERROR",
  unauthorized: "UNAUTHORIZED",
} as const;

export type AccountDomainError = DomainError;
