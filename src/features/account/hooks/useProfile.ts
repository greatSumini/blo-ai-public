"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import type { ProfileResponse } from "../lib/dto";

const fetchProfile = async (): Promise<ProfileResponse> => {
  try {
    const { data } = await apiClient.get("/api/account/profile");
    return data as ProfileResponse;
  } catch (error) {
    const message = extractApiErrorMessage(error, "Failed to fetch profile.");
    throw new Error(message);
  }
};

export const useProfile = () => {
  return useQuery({
    queryKey: ["account", "profile"],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5분
  });
};
