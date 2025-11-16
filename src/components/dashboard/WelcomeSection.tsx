'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface WelcomeSectionProps {
  userName: string;
  stats: {
    monthlyArticles: number;
    totalArticles: number;
    monthlyGoal: number;
    previousMonthArticles: number;
  };
  onCreateArticle: () => void;
}

function getContextualGreeting({
  userName,
  articleCount,
  currentMonthly,
  monthlyTarget,
  t,
}: {
  userName: string;
  articleCount: number;
  currentMonthly: number;
  monthlyTarget: number;
  t: (key: string, params?: Record<string, string | number>) => string;
}): string {
  // New user
  if (articleCount === 0) {
    return t('greeting.newUser', { userName });
  }

  // Goal achieved this month
  if (currentMonthly >= monthlyTarget) {
    return t('greeting.goalAchieved', { userName });
  }

  // Close to goal (within 1 article)
  if (currentMonthly === monthlyTarget - 1) {
    return t('greeting.closeToGoal', { userName });
  }

  // Regular greeting
  return t('greeting.default', { userName });
}

function getContextualSubtext({
  articleCount,
  t,
}: {
  articleCount: number;
  t: (key: string, params?: Record<string, string | number>) => string;
}): string {
  if (articleCount === 0) {
    return t('subtext.newUser');
  }

  return t('subtext.default');
}

export function WelcomeSection({
  userName,
  stats,
  onCreateArticle,
}: WelcomeSectionProps) {
  const t = useTranslations('dashboard.welcome');

  const greeting = getContextualGreeting({
    userName,
    articleCount: stats.totalArticles,
    currentMonthly: stats.monthlyArticles,
    monthlyTarget: stats.monthlyGoal,
    t,
  });

  const subtext = getContextualSubtext({
    articleCount: stats.totalArticles,
    t,
  });

  return (
    <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b animate-fade-in-up">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {greeting}
        </h1>
        <p className="text-muted-foreground mt-2">
          {subtext}
        </p>
      </div>

      <Button
        onClick={onCreateArticle}
        size="lg"
        className="shrink-0"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {t('createButton')}
      </Button>
    </section>
  );
}
