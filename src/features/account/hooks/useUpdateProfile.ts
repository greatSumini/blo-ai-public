"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import type { UpdateProfileRequest, ProfileResponse } from "../lib/dto";

const updateProfile = async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
  try {
    const response = await apiClient.put("/api/account/profile", data);
    return response.data as ProfileResponse;
  } catch (error) {
    const message = extractApiErrorMessage(error, "Failed to update profile.");
    throw new Error(message);
  }
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["account", "profile"], data);
    },
  });
};
