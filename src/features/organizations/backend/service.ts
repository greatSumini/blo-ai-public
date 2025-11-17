import type { SupabaseClient } from '@supabase/supabase-js';
import {
  domainSuccess,
  domainFailure,
  type DomainResult,
  type DomainError,
  type DomainFailure,
} from '@/backend/domain/result';
import { organizationErrorCodes } from './error';
import type {
  Organization,
  OrganizationWithRole,
  OrganizationMember,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  AddMemberRequest,
  ListOrganizationsResponse,
  ListMembersResponse,
  MemberRole,
} from './schema';

/**
 * Helper: Get profile ID from Clerk user ID
 */
async function getProfileIdFromClerkUserId(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<DomainResult<string, DomainError>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error || !data) {
    return domainFailure({
      code: organizationErrorCodes.userNotFound,
      message: 'User profile not found.',
    });
  }

  return domainSuccess(data.id);
}

/**
 * Helper: Get profile ID from email
 */
async function getProfileIdFromEmail(
  supabase: SupabaseClient,
  email: string
): Promise<DomainResult<string, DomainError>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (error || !data) {
    return domainFailure({
      code: organizationErrorCodes.userNotFound,
      message: `No user found with email: ${email}`,
    });
  }

  return domainSuccess(data.id);
}

/**
 * Helper: Check if user is a member of an organization
 */
async function checkMembership(
  supabase: SupabaseClient,
  organizationId: string,
  profileId: string
): Promise<DomainResult<{ role: MemberRole }, DomainError>> {
  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('profile_id', profileId)
    .single();

  if (error || !data) {
    return domainFailure({ code: organizationErrorCodes.notOrganizationMember, message: 'You are not a member of this organization.'
     });
  }

  return domainSuccess({ role: data.role as MemberRole });
}

/**
 * Helper: Check if user is the owner of an organization
 */
async function checkOwnership(
  supabase: SupabaseClient,
  organizationId: string,
  profileId: string
): Promise<DomainResult<void, DomainError>> {
  const membershipResult = await checkMembership(supabase, organizationId, profileId);

  if (!membershipResult.ok) {
    return { ok: false, error: (membershipResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }

  if (membershipResult.data.role !== 'owner') {
    return domainFailure({ code: organizationErrorCodes.notOrganizationOwner, message: 'Only the organization owner can perform this action.'
     });
  }

  return domainSuccess(undefined);
}

// ===========================
// Organization CRUD
// ===========================

/**
 * List all organizations where the user is a member
 */
export async function listOrganizations(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<DomainResult<ListOrganizationsResponse, DomainError>> {
  // Get profile ID
  const profileResult = await getProfileIdFromClerkUserId(supabase, clerkUserId);
  if (!profileResult.ok) {
    return { ok: false, error: (profileResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }
  const profileId = profileResult.data;

  // Get all organizations where user is a member
  const { data: memberships, error: memberError } = await supabase
    .from('organization_members')
    .select(`
      role,
      organizations:organization_id (
        id,
        name,
        description,
        owner_id,
        created_at,
        updated_at
      )
    `)
    .eq('profile_id', profileId);

  if (memberError) {
    return domainFailure({ code: organizationErrorCodes.databaseError, message: 'Failed to fetch organizations.', details: { error: memberError.message } });
  }

  if (!memberships) {
    return domainSuccess({ organizations: [] });
  }

  // Get member count for each organization
  const organizationIds = memberships
    .map((m: any) => m.organizations?.id)
    .filter(Boolean);

  const { data: memberCounts, error: countError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .in('organization_id', organizationIds);

  if (countError) {
    return domainFailure({ code: organizationErrorCodes.databaseError, message: 'Failed to fetch member counts.', details: { error: countError.message } });
  }

  // Count members per organization
  const countMap: Record<string, number> = {};
  memberCounts?.forEach((mc: any) => {
    countMap[mc.organization_id] = (countMap[mc.organization_id] || 0) + 1;
  });

  // Map to response format
  const organizations: OrganizationWithRole[] = memberships
    .filter((m: any) => m.organizations)
    .map((m: any) => ({
      id: m.organizations.id,
      name: m.organizations.name,
      description: m.organizations.description,
      ownerId: m.organizations.owner_id,
      createdAt: m.organizations.created_at,
      updatedAt: m.organizations.updated_at,
      role: m.role as MemberRole,
      memberCount: countMap[m.organizations.id] || 0,
    }));

  return domainSuccess({ organizations });
}

/**
 * Get a single organization by ID (user must be a member)
 */
export async function getOrganizationById(
  supabase: SupabaseClient,
  clerkUserId: string,
  organizationId: string
): Promise<DomainResult<OrganizationWithRole, DomainError>> {
  // Get profile ID
  const profileResult = await getProfileIdFromClerkUserId(supabase, clerkUserId);
  if (!profileResult.ok) {
    return { ok: false, error: (profileResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }
  const profileId = profileResult.data;

  // Check membership
  const membershipResult = await checkMembership(supabase, organizationId, profileId);
  if (!membershipResult.ok) {
    return { ok: false, error: (membershipResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }

  // Get organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (orgError || !org) {
    return domainFailure({ code: organizationErrorCodes.organizationNotFound, message: 'Organization not found.'
     });
  }

  // Get member count
  const { data: memberCounts, error: countError } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organizationId);

  const memberCount = memberCounts?.length || 0;

  return domainSuccess({
    id: org.id,
    name: org.name,
    description: org.description,
    ownerId: org.owner_id,
    createdAt: org.created_at,
    updatedAt: org.updated_at,
    role: membershipResult.data.role,
    memberCount,
  });
}

/**
 * Create a new organization
 */
export async function createOrganization(
  supabase: SupabaseClient,
  clerkUserId: string,
  data: CreateOrganizationRequest
): Promise<DomainResult<Organization, DomainError>> {
  // Get profile ID
  const profileResult = await getProfileIdFromClerkUserId(supabase, clerkUserId);
  if (!profileResult.ok) {
    return { ok: false, error: (profileResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }
  const profileId = profileResult.data;

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: data.name,
      description: data.description || null,
      owner_id: profileId,
    })
    .select()
    .single();

  if (orgError || !org) {
    return domainFailure({ code: organizationErrorCodes.databaseError, message: 'Failed to create organization.', details: { error: orgError?.message } });
  }

  // Add owner as a member
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      profile_id: profileId,
      role: 'owner',
    });

  if (memberError) {
    // Rollback: delete organization
    await supabase.from('organizations').delete().eq('id', org.id);

    return domainFailure({ code: organizationErrorCodes.databaseError, message: 'Failed to add owner as member.', details: { error: memberError.message } });
  }

  return domainSuccess({
    id: org.id,
    name: org.name,
    description: org.description,
    ownerId: org.owner_id,
    createdAt: org.created_at,
    updatedAt: org.updated_at,
  });
}

/**
 * Update an organization (owner only)
 */
export async function updateOrganization(
  supabase: SupabaseClient,
  clerkUserId: string,
  organizationId: string,
  data: UpdateOrganizationRequest
): Promise<DomainResult<Organization, DomainError>> {
  // Get profile ID
  const profileResult = await getProfileIdFromClerkUserId(supabase, clerkUserId);
  if (!profileResult.ok) {
    return { ok: false, error: (profileResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }
  const profileId = profileResult.data;

  // Check ownership
  const ownershipResult = await checkOwnership(supabase, organizationId, profileId);
  if (!ownershipResult.ok) {
    return { ok: false, error: (ownershipResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }

  // Update organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .update({
      name: data.name,
      description: data.description,
    })
    .eq('id', organizationId)
    .select()
    .single();

  if (orgError || !org) {
    return domainFailure({ code: organizationErrorCodes.databaseError, message: 'Failed to update organization.', details: { error: orgError?.message } });
  }

  return domainSuccess({
    id: org.id,
    name: org.name,
    description: org.description,
    ownerId: org.owner_id,
    createdAt: org.created_at,
    updatedAt: org.updated_at,
  });
}

/**
 * Delete an organization (owner only)
 * This will cascade delete all members and related resources
 */
export async function deleteOrganization(
  supabase: SupabaseClient,
  clerkUserId: string,
  organizationId: string
): Promise<DomainResult<void, DomainError>> {
  // Get profile ID
  const profileResult = await getProfileIdFromClerkUserId(supabase, clerkUserId);
  if (!profileResult.ok) {
    return { ok: false, error: (profileResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }
  const profileId = profileResult.data;

  // Check ownership
  const ownershipResult = await checkOwnership(supabase, organizationId, profileId);
  if (!ownershipResult.ok) {
    return { ok: false, error: (ownershipResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }

  // Delete organization (cascade will delete members)
  const { error: deleteError } = await supabase
    .from('organizations')
    .delete()
    .eq('id', organizationId);

  if (deleteError) {
    return domainFailure({ code: organizationErrorCodes.databaseError, message: 'Failed to delete organization.', details: { error: deleteError.message } });
  }

  return domainSuccess(undefined);
}

// ===========================
// Member Management
// ===========================

/**
 * List all members of an organization (members can view)
 */
export async function listMembers(
  supabase: SupabaseClient,
  clerkUserId: string,
  organizationId: string
): Promise<DomainResult<ListMembersResponse, DomainError>> {
  // Get profile ID
  const profileResult = await getProfileIdFromClerkUserId(supabase, clerkUserId);
  if (!profileResult.ok) {
    return { ok: false, error: (profileResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }
  const profileId = profileResult.data;

  // Check membership
  const membershipResult = await checkMembership(supabase, organizationId, profileId);
  if (!membershipResult.ok) {
    return { ok: false, error: (membershipResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }

  // Get all members
  const { data: members, error: membersError } = await supabase
    .from('organization_members')
    .select(`
      id,
      organization_id,
      profile_id,
      role,
      created_at,
      updated_at,
      profiles:profile_id (
        id,
        email,
        full_name,
        image_url
      )
    `)
    .eq('organization_id', organizationId);

  if (membersError) {
    return domainFailure({ code: organizationErrorCodes.databaseError, message: 'Failed to fetch members.', details: { error: membersError.message } });
  }

  if (!members) {
    return domainSuccess({ members: [] });
  }

  // Map to response format
  const mappedMembers: OrganizationMember[] = members.map((m: any) => ({
    id: m.id,
    organizationId: m.organization_id,
    profileId: m.profile_id,
    role: m.role as MemberRole,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
    profile: {
      id: m.profiles.id,
      email: m.profiles.email,
      fullName: m.profiles.full_name,
      imageUrl: m.profiles.image_url,
    },
  }));

  return domainSuccess({ members: mappedMembers });
}

/**
 * Add a member to an organization by email (owner only)
 */
export async function addMember(
  supabase: SupabaseClient,
  clerkUserId: string,
  organizationId: string,
  data: AddMemberRequest
): Promise<DomainResult<OrganizationMember, DomainError>> {
  // Get profile ID
  const profileResult = await getProfileIdFromClerkUserId(supabase, clerkUserId);
  if (!profileResult.ok) {
    return { ok: false, error: (profileResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }
  const profileId = profileResult.data;

  // Check ownership
  const ownershipResult = await checkOwnership(supabase, organizationId, profileId);
  if (!ownershipResult.ok) {
    return { ok: false, error: (ownershipResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }

  // Get profile ID of the user to add
  const targetProfileResult = await getProfileIdFromEmail(supabase, data.email);
  if (!targetProfileResult.ok) {
    return { ok: false, error: (targetProfileResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }
  const targetProfileId = targetProfileResult.data;

  // Check if already a member
  const { data: existingMember } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('profile_id', targetProfileId)
    .single();

  if (existingMember) {
    return domainFailure({ code: organizationErrorCodes.memberAlreadyExists, message: 'This user is already a member of the organization.'
     });
  }

  // Add member
  const { data: member, error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: organizationId,
      profile_id: targetProfileId,
      role: 'member',
    })
    .select(`
      id,
      organization_id,
      profile_id,
      role,
      created_at,
      updated_at,
      profiles:profile_id (
        id,
        email,
        full_name,
        image_url
      )
    `)
    .single();

  if (memberError || !member) {
    return domainFailure({ code: organizationErrorCodes.databaseError, message: 'Failed to add member.', details: { error: memberError?.message } });
  }

  return domainSuccess({
    id: member.id,
    organizationId: member.organization_id,
    profileId: member.profile_id,
    role: member.role as MemberRole,
    createdAt: member.created_at,
    updatedAt: member.updated_at,
    profile: {
      id: (member as any).profiles.id,
      email: (member as any).profiles.email,
      fullName: (member as any).profiles.full_name,
      imageUrl: (member as any).profiles.image_url,
    },
  });
}

/**
 * Remove a member from an organization (owner only)
 * Cannot remove the owner
 */
export async function removeMember(
  supabase: SupabaseClient,
  clerkUserId: string,
  organizationId: string,
  memberId: string
): Promise<DomainResult<void, DomainError>> {
  // Get profile ID
  const profileResult = await getProfileIdFromClerkUserId(supabase, clerkUserId);
  if (!profileResult.ok) {
    return { ok: false, error: (profileResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }
  const profileId = profileResult.data;

  // Check ownership
  const ownershipResult = await checkOwnership(supabase, organizationId, profileId);
  if (!ownershipResult.ok) {
    return { ok: false, error: (ownershipResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }

  // Get member to check role
  const { data: member, error: getMemberError } = await supabase
    .from('organization_members')
    .select('role')
    .eq('id', memberId)
    .eq('organization_id', organizationId)
    .single();

  if (getMemberError || !member) {
    return domainFailure({ code: organizationErrorCodes.memberNotFound, message: 'Member not found.'
     });
  }

  // Cannot remove owner
  if (member.role === 'owner') {
    return domainFailure({ code: organizationErrorCodes.cannotRemoveOwner, message: 'Cannot remove the organization owner. Delete the organization instead.'
     });
  }

  // Remove member
  const { error: deleteError } = await supabase
    .from('organization_members')
    .delete()
    .eq('id', memberId)
    .eq('organization_id', organizationId);

  if (deleteError) {
    return domainFailure({ code: organizationErrorCodes.databaseError, message: 'Failed to remove member.', details: { error: deleteError.message } });
  }

  return domainSuccess(undefined);
}

/**
 * Leave an organization (member only, not owner)
 */
export async function leaveOrganization(
  supabase: SupabaseClient,
  clerkUserId: string,
  organizationId: string
): Promise<DomainResult<void, DomainError>> {
  // Get profile ID
  const profileResult = await getProfileIdFromClerkUserId(supabase, clerkUserId);
  if (!profileResult.ok) {
    return { ok: false, error: (profileResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }
  const profileId = profileResult.data;

  // Check membership
  const membershipResult = await checkMembership(supabase, organizationId, profileId);
  if (!membershipResult.ok) {
    return { ok: false, error: (membershipResult as DomainFailure<DomainError>).error } as DomainFailure<DomainError>;
  }

  // Cannot leave if owner
  if (membershipResult.data.role === 'owner') {
    return domainFailure({ code: organizationErrorCodes.cannotRemoveOwner, message: 'Organization owner cannot leave. Delete the organization instead.'
     });
  }

  // Remove membership
  const { error: deleteError } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('profile_id', profileId);

  if (deleteError) {
    return domainFailure({ code: organizationErrorCodes.databaseError, message: 'Failed to leave organization.', details: { error: deleteError.message } });
  }

  return domainSuccess(undefined);
}
