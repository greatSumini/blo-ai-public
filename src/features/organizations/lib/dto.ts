/**
 * Client-side DTO re-exports from backend schemas
 * This allows frontend to use the same types without importing from backend
 */

export type {
  Organization,
  OrganizationWithRole,
  OrganizationMember,
  MemberRole,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  AddMemberRequest,
  ListOrganizationsResponse,
  ListMembersResponse,
} from '../backend/schema';

export {
  CreateOrganizationRequestSchema,
  UpdateOrganizationRequestSchema,
  AddMemberRequestSchema,
  OrganizationSchema,
  OrganizationWithRoleSchema,
  OrganizationMemberSchema,
  MemberRoleSchema,
  ListOrganizationsResponseSchema,
  ListMembersResponseSchema,
} from '../backend/schema';
