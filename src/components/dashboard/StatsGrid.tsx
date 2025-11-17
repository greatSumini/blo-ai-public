'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card-v2';
import { FileText, Eye, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import type { DashboardStatsResponse } from '@/features/articles/lib/dto';
import type { LucideIcon } from 'lucide-react';

interface StatsGridProps {
  stats: DashboardStatsResponse;
}

interface StatCardData {
  title: string;
  value: number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  description: string;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const t = useTranslations('dashboard.stats');

  const monthlyChange = stats.monthlyArticles - stats.previousMonthArticles;

  const cards: StatCardData[] = [
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
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3 animate-fade-in-up-delay-100 motion-reduce:animate-none">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.change?.isPositive ? TrendingUp : TrendingDown;

        return (
          <Card key={index}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-accent-brand/10 rounded-lg">
                <Icon className="w-5 h-5 text-accent-brand" aria-hidden="true" />
              </div>
              {card.change && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  card.change.isPositive ? 'text-success' : 'text-destructive'
                }`}>
                  <TrendIcon className="w-3 h-3" aria-hidden="true" />
                  <span>{card.change.value}</span>
                </div>
              )}
            </div>

            <h3 className="text-sm font-medium text-text-secondary mb-2">
              {card.title}
            </h3>

            <p className="text-3xl font-semibold text-text-primary mb-1">
              {card.value}
            </p>

            <p className="text-xs text-text-tertiary">
              {card.description}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
