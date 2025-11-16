"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { autoSaveVariants } from '../lib/editor-animations';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  isError: boolean;
  lastSavedAt?: string;
}

export function AutoSaveIndicator({
  isSaving,
  isError,
  lastSavedAt,
}: AutoSaveIndicatorProps) {
  const t = useTranslations('articles');
  const locale = useLocale();
  const dateLocale = locale === 'ko' ? ko : enUS;

  const getVariant = () => {
    if (isSaving) return 'saving';
    if (isError) return 'error';
    if (lastSavedAt) return 'saved';
    return 'idle';
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={getVariant()}
        variants={autoSaveVariants}
        initial="idle"
        animate={getVariant()}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        {isSaving && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('autoSave.saving')}</span>
          </>
        )}
        {isError && (
          <>
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive">{t('autoSave.error')}</span>
          </>
        )}
        {!isSaving && !isError && lastSavedAt && (
          <>
            <Check className="h-4 w-4 text-green-500" />
            <span>
              {t('autoSave.saved', {
                time: formatDistanceToNow(new Date(lastSavedAt), {
                  addSuffix: true,
                  locale: dateLocale,
                }),
              })}
            </span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
