'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { useUpdateArticle } from './useUpdateArticle';
import type { UpdateArticleRequest } from '../lib/dto';

export function useAutoSave(articleId: string, formData: UpdateArticleRequest) {
  const [debouncedData, setDebouncedData] = useState(formData);
  const updateMutation = useUpdateArticle();
  const [hasChanges, setHasChanges] = useState(false);

  // 2초 디바운스
  useDebounce(
    () => {
      setDebouncedData(formData);
      setHasChanges(true);
    },
    2000,
    [formData]
  );

  // 디바운스된 데이터 변경 시 자동 저장
  useEffect(() => {
    if (hasChanges && debouncedData) {
      updateMutation.mutate({
        articleId,
        data: debouncedData,
      });
      setHasChanges(false);
    }
  }, [debouncedData, hasChanges, articleId, updateMutation]);

  return {
    isSaving: updateMutation.isPending,
    isError: updateMutation.isError,
    error: updateMutation.error,
    lastSavedAt: updateMutation.data?.updatedAt,
  };
}
