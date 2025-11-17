import { z } from 'zod';

// ===========================
// Request Schemas
// ===========================

/**
 * Schema for creating a new organization
 */
export const CreateOrganizationRequestSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100),
  description: z.string().max(500).optional(),
});

export type CreateOrganizationRequest = z.infer<typeof CreateOrganizationRequestSchema>;

/**
 * Schema for updating an organization
 */
export const UpdateOrganizationRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

export type UpdateOrganizationRequest = z.infer<typeof UpdateOrganizationRequestSchema>;

/**
 * Schema for adding a member to an organization
 */
export const AddMemberRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export type AddMemberRequest = z.infer<typeof AddMemberRequestSchema>;

// ===========================
// Response Schemas
// ===========================

/**
 * Organization member role enum
 */
export const MemberRoleSchema = z.enum(['owner', 'member']);

export type MemberRole = z.infer<typeof MemberRoleSchema>;

/**
 * Organization response
 */
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  ownerId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Organization = z.infer<typeof OrganizationSchema>;

/**
 * Organization member response
 */
export const OrganizationMemberSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  profileId: z.string().uuid(),
  role: MemberRoleSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  // Joined profile data
  profile: z.object({
    id: z.string().uuid(),
    email: z.string().nullable(),
    fullName: z.string().nullable(),
    imageUrl: z.string().nullable(),
  }),
});

export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;

/**
 * Organization with member info
 */
export const OrganizationWithRoleSchema = OrganizationSchema.extend({
  role: MemberRoleSchema,
  memberCount: z.number().int().nonnegative(),
});

export type OrganizationWithRole = z.infer<typeof OrganizationWithRoleSchema>;

/**
 * List organizations response
 */
export const ListOrganizationsResponseSchema = z.object({
  organizations: z.array(OrganizationWithRoleSchema),
});

export type ListOrganizationsResponse = z.infer<typeof ListOrganizationsResponseSchema>;

/**
 * List members response
 */
export const ListMembersResponseSchema = z.object({
  members: z.array(OrganizationMemberSchema),
});

export type ListMembersResponse = z.infer<typeof ListMembersResponseSchema>;
