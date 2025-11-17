/**
 * Error codes for organization-related operations
 */
export const organizationErrorCodes = {
  // General errors
  validationError: 'VALIDATION_ERROR',
  unauthorized: 'UNAUTHORIZED',
  forbidden: 'FORBIDDEN',

  // Organization errors
  organizationNotFound: 'ORGANIZATION_NOT_FOUND',
  organizationAlreadyExists: 'ORGANIZATION_ALREADY_EXISTS',
  organizationNameTaken: 'ORGANIZATION_NAME_TAKEN',

  // Member errors
  memberNotFound: 'MEMBER_NOT_FOUND',
  memberAlreadyExists: 'MEMBER_ALREADY_EXISTS',
  userNotFound: 'USER_NOT_FOUND',
  cannotRemoveOwner: 'CANNOT_REMOVE_OWNER',
  notOrganizationMember: 'NOT_ORGANIZATION_MEMBER',
  notOrganizationOwner: 'NOT_ORGANIZATION_OWNER',

  // Database errors
  databaseError: 'DATABASE_ERROR',
} as const;

export type OrganizationErrorCode = typeof organizationErrorCodes[keyof typeof organizationErrorCodes];
