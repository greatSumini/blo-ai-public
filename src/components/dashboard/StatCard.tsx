'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  description?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  description,
}: StatCardProps) {
  const t = useTranslations('dashboard.stats');

  return (
    <Card className="transition-shadow duration-300 ease-out hover:shadow-md motion-reduce:transition-none border-border-default">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-text-secondary">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight text-text-primary">{value}</h3>
              {change !== undefined && (
                <span
                  className={`inline-flex items-center text-sm font-medium ${
                    change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {change.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" aria-hidden="true" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" aria-hidden="true" />
                  )}
                  {Math.abs(change.value)}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-xs text-text-tertiary">
                {description}
              </p>
            )}
          </div>
          <div className="p-2 bg-accent-brand/10 rounded-lg">
            <Icon className="w-5 h-5 text-accent-brand" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
