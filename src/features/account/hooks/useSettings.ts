"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import type { SettingsResponse } from "../lib/dto";

const fetchSettings = async (): Promise<SettingsResponse> => {
  try {
    const { data } = await apiClient.get("/api/account/settings");
    return data as SettingsResponse;
  } catch (error) {
    const message = extractApiErrorMessage(error, "Failed to fetch settings.");
    throw new Error(message);
  }
};

export const useSettings = () => {
  return useQuery({
    queryKey: ["account", "settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000, // 5분
  });
};
