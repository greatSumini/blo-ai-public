"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient, extractApiErrorMessage } from "@/lib/remote/api-client";

export interface StyleGuideData {
  id: string;
  profileId: string;
  brandName: string;
  brandDescription: string;
  personality: string[];
  formality: "casual" | "neutral" | "formal";
  targetAudience: string;
  painPoints: string;
  language: "ko" | "en";
  tone: "professional" | "friendly" | "inspirational" | "educational";
  contentLength: "short" | "medium" | "long";
  readingLevel: "beginner" | "intermediate" | "advanced";
  notes: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useBranding = () => {
  const { userId } = useAuth();

  return useQuery<StyleGuideData | null, Error>({
    queryKey: ["branding", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      try {
        const client = createAuthenticatedClient(userId);
        // Fix: Use list API to get all style guides for the user
        const response = await client.get(`/api/brandings`);
        const guides = response.data as StyleGuideData[];

        // Return the first (default) style guide, or null if none exist
        return guides.length > 0 ? guides[0] : null;
      } catch (error: any) {
        // Handle 404 - return null if not found
        if (error.response?.status === 404) {
          return null;
        }

        const message = extractApiErrorMessage(error, "스타일 가이드를 불러오는데 실패했습니다");
        throw new Error(message);
      }
    },
    enabled: !!userId,
  });
};
