"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateArticleAction } from "../actions/article-actions";
import type {
  GenerateArticleRequest,
  GenerateArticleResponse,
} from "../lib/dto";

export const useGenerateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation<GenerateArticleResponse, Error, GenerateArticleRequest>({
    mutationFn: generateArticleAction,
    onSuccess: (data) => {
      // Invalidate articles list
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      // Cache the new article
      queryClient.setQueryData(["article", data.article.id], data.article);
    },
  });
};
