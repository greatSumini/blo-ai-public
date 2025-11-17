'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type {
  Organization,
  OrganizationWithRole,
  OrganizationMember,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  AddMemberRequest,
  ListOrganizationsResponse,
  ListMembersResponse,
} from '../lib/dto';

// ===========================
// Query Keys
// ===========================

export const organizationsKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationsKeys.all, 'list'] as const,
  list: () => [...organizationsKeys.lists()] as const,
  details: () => [...organizationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationsKeys.details(), id] as const,
  members: (id: string) => [...organizationsKeys.all, 'members', id] as const,
};

// ===========================
// API Functions
// ===========================

const organizationsApi = {
  list: async (): Promise<ListOrganizationsResponse> => {
    const response = await apiClient.get('/api/organizations');
    return response.data;
  },

  getById: async (id: string): Promise<OrganizationWithRole> => {
    const response = await apiClient.get(`/api/organizations/${id}`);
    return response.data;
  },

  create: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await apiClient.post('/api/organizations', data);
    return response.data;
  },

  update: async (id: string, data: UpdateOrganizationRequest): Promise<Organization> => {
    const response = await apiClient.patch(`/api/organizations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/organizations/${id}`);
  },

  leave: async (id: string): Promise<void> => {
    await apiClient.post(`/api/organizations/${id}/leave`);
  },

  listMembers: async (id: string): Promise<ListMembersResponse> => {
    const response = await apiClient.get(`/api/organizations/${id}/members`);
    return response.data;
  },

  addMember: async (id: string, data: AddMemberRequest): Promise<OrganizationMember> => {
    const response = await apiClient.post(`/api/organizations/${id}/members`, data);
    return response.data;
  },

  removeMember: async (organizationId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/api/organizations/${organizationId}/members/${memberId}`);
  },
};

// ===========================
// Hooks
// ===========================

/**
 * Hook to list all organizations where the user is a member
 */
export function useOrganizations() {
  return useQuery({
    queryKey: organizationsKeys.list(),
    queryFn: organizationsApi.list,
  });
}

/**
 * Hook to get a single organization by ID
 */
export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationsKeys.detail(id),
    queryFn: () => organizationsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new organization
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.list() });
    },
  });
}

/**
 * Hook to update an organization
 */
export function useUpdateOrganization(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationRequest) => organizationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.list() });
    },
  });
}

/**
 * Hook to delete an organization
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.list() });
    },
  });
}

/**
 * Hook to leave an organization
 */
export function useLeaveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationsApi.leave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.list() });
    },
  });
}

/**
 * Hook to list members of an organization
 */
export function useOrganizationMembers(organizationId: string) {
  return useQuery({
    queryKey: organizationsKeys.members(organizationId),
    queryFn: () => organizationsApi.listMembers(organizationId),
    enabled: !!organizationId,
  });
}

/**
 * Hook to add a member to an organization
 */
export function useAddMember(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddMemberRequest) => organizationsApi.addMember(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.members(organizationId) });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.detail(organizationId) });
    },
  });
}

/**
 * Hook to remove a member from an organization
 */
export function useRemoveMember(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => organizationsApi.removeMember(organizationId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.members(organizationId) });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.detail(organizationId) });
    },
  });
}
