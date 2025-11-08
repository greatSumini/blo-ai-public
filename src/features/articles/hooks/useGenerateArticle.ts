'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { GenerateArticleRequest } from '../lib/dto';
import { extractApiErrorMessage } from '@/lib/remote/api-client';

export const useGenerateArticle = () => {
  const queryClient = useQueryClient();
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateArticle = useCallback(
    async (request: GenerateArticleRequest) => {
      setIsLoading(true);
      setError(null);
      setCompletion('');

      try {
        // Call the API with direct request body
        const response = await fetch('/api/articles/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || 'Failed to generate article'
          );
        }

        // Read the streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Process complete lines
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line.startsWith('0:"')) {
              // Parse streaming text chunks from Vercel AI SDK format
              const content = line.slice(2, -1); // Remove 0:" and trailing "
              fullText += content;
              setCompletion(fullText);
            }
          }

          // Keep incomplete line in buffer
          buffer = lines[lines.length - 1];
        }

        // Add final buffer if exists
        if (buffer.trim().startsWith('0:"')) {
          const content = buffer.trim().slice(2, -1);
          fullText += content;
          setCompletion(fullText);
        }

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['articles'] });
      } catch (err) {
        const message = extractApiErrorMessage(err, 'Failed to generate article');
        const error = err instanceof Error ? new Error(message) : new Error(message);
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  return {
    generateArticle,
    completion,
    isLoading,
    error,
  };
};
