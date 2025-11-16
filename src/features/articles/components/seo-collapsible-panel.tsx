"use client";

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface SeoCollapsiblePanelProps {
  slug: string;
  description: string;
  keywords: string;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onKeywordsChange: (value: string) => void;
  disabled?: boolean;
}

export function SeoCollapsiblePanel({
  slug,
  description,
  keywords,
  onSlugChange,
  onDescriptionChange,
  onKeywordsChange,
  disabled,
}: SeoCollapsiblePanelProps) {
  const t = useTranslations('editor');
  const [isOpen, setIsOpen] = useState(false);

  // Slug 유효성 검증
  const isSlugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  const descriptionLength = description.length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 text-base font-semibold hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span>{t('seo_settings_title')}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        {/* Slug */}
        <div>
          <Label htmlFor="seo-slug">{t('field_slug')}</Label>
          <Input
            id="seo-slug"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder={t('placeholder_slug')}
            disabled={disabled}
            className="mt-1 font-mono text-sm"
          />
          {slug && !isSlugValid && (
            <p className="mt-1 text-xs text-destructive">
              {t('slug_invalid_message')}
            </p>
          )}
          {slug && isSlugValid && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t('slug_valid_message')}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="seo-description">{t('field_description')}</Label>
            <span className="text-xs text-muted-foreground">
              {descriptionLength}/160
            </span>
          </div>
          <Textarea
            id="seo-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={t('placeholder_description')}
            disabled={disabled}
            rows={3}
            className="mt-1 resize-none"
            maxLength={160}
          />
          {descriptionLength >= 120 && descriptionLength <= 160 && (
            <p className="mt-1 text-xs text-green-600">
              {t('description_optimal_message')}
            </p>
          )}
        </div>

        {/* Keywords */}
        <div>
          <Label htmlFor="seo-keywords">{t('field_keywords')}</Label>
          <Input
            id="seo-keywords"
            value={keywords}
            onChange={(e) => onKeywordsChange(e.target.value)}
            placeholder={t('placeholder_keywords')}
            disabled={disabled}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {t('keywords_hint')}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
