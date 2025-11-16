"use client";

import { useTranslations } from 'next-intl';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutoSaveIndicator } from './auto-save-indicator';

interface EditorHeaderProps {
  onBack: () => void;
  autoSaveStatus: {
    isSaving: boolean;
    isError: boolean;
    lastSavedAt?: string;
  };
  showPreview: boolean;
  onPreviewToggle: () => void;
}

export function EditorHeader({
  onBack,
  autoSaveStatus,
  showPreview,
  onPreviewToggle,
}: EditorHeaderProps) {
  const t = useTranslations('editor');

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <AutoSaveIndicator {...autoSaveStatus} />
        </div>
      </div>
      <Button
        onClick={onPreviewToggle}
        variant="outline"
        className="hidden lg:flex"
      >
        {showPreview ? (
          <>
            <EyeOff className="mr-2 h-4 w-4" />
            {t('hide_preview')}
          </>
        ) : (
          <>
            <Eye className="mr-2 h-4 w-4" />
            {t('show_preview')}
          </>
        )}
      </Button>
    </div>
  );
}
