"use client";

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { KeyboardEvent, useRef } from 'react';

interface TitleInlineInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnterPress?: () => void;
  disabled?: boolean;
}

export function TitleInlineInput({
  value,
  onChange,
  onEnterPress,
  disabled,
}: TitleInlineInputProps) {
  const t = useTranslations('editor');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnterPress?.();
    }
  };

  return (
    <div className="mb-6">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('inline_title_placeholder')}
        disabled={disabled}
        className="w-full border-0 bg-transparent px-0 text-4xl font-bold leading-tight tracking-tight placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
