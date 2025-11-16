'use client';

import { useTranslations } from 'next-intl';
import { StatCard } from './StatCard';
import { FileText, Eye, Clock } from 'lucide-react';
import type { DashboardStatsResponse } from '@/features/articles/lib/dto';

interface StatsGridProps {
  stats: DashboardStatsResponse;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const t = useTranslations('dashboard.stats');

  const monthlyChange = stats.monthlyArticles - stats.previousMonthArticles;

  const cards = [
    {
      title: t('monthlyArticles'),
      value: stats.monthlyArticles,
      change: {
        value: Math.abs(monthlyChange),
        isPositive: monthlyChange >= 0,
      },
      icon: FileText,
      description: t('monthlyGoal', { goal: stats.monthlyGoal }),
    },
    {
      title: t('savedHours'),
      value: stats.savedHours,
      icon: Clock,
      description: t('timeEstimate'),
    },
    {
      title: t('totalViews'),
      value: stats.totalViews,
      icon: Eye,
      description: t('allTimeViews'),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
}
