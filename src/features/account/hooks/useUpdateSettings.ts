"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import type { UpdateSettingsRequest, SettingsResponse } from "../lib/dto";

const updateSettings = async (data: UpdateSettingsRequest): Promise<SettingsResponse> => {
  try {
    const response = await apiClient.put("/api/account/settings", data);
    return response.data as SettingsResponse;
  } catch (error) {
    const message = extractApiErrorMessage(error, "Failed to update settings.");
    throw new Error(message);
  }
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["account", "settings"], data);
    },
  });
};
