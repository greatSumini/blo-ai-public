"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type { BrandingResponse } from "@/features/onboarding/backend/schema";
import type { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";

// ===== 스타일 가이드 목록 조회 =====
export function useListBrandings() {
  return useQuery({
    queryKey: ["brandings"],
    queryFn: async () => {
      const response = await apiClient.get("/api/brandings");
      return (response.data || []) as BrandingResponse[];
    },
    staleTime: 60 * 1000, // 1분
    gcTime: 10 * 60 * 1000, // 10분
    refetchOnWindowFocus: false,
  });
}

// ===== 단일 스타일 가이드 조회 =====
export function useBranding(guideId: string | null) {
  return useQuery({
    queryKey: ["brandings", guideId],
    queryFn: async () => {
      if (!guideId) throw new Error("Style guide ID is required");
      const response = await apiClient.get(`/api/brandings/${guideId}`);
      return response.data as BrandingResponse;
    },
    enabled: !!guideId,
    staleTime: 60 * 1000, // 1분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// ===== 스타일 가이드 생성 =====
export function useCreateStyleGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const response = await apiClient.post("/api/brandings", data);
      return response.data as BrandingResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandings"] });
    },
  });
}

// ===== 스타일 가이드 수정 =====
export function useUpdateBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      guideId,
      data,
    }: {
      guideId: string;
      data: OnboardingFormData;
    }) => {
      const response = await apiClient.patch(
        `/api/brandings/${guideId}`,
        data
      );
      return response.data as BrandingResponse;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["brandings"] });
      queryClient.invalidateQueries({
        queryKey: ["brandings", variables.guideId],
      });
    },
  });
}

// ===== 스타일 가이드 삭제 =====
export function useDeleteBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guideId: string) => {
      const response = await apiClient.delete(`/api/brandings/${guideId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandings"] });
    },
  });
}
