'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium',
        variant === 'default' && 'bg-bg-tertiary text-text-secondary',
        variant === 'success' && 'bg-success-bg text-success border border-success/20',
        variant === 'warning' && 'bg-warning-bg text-warning border border-warning/20',
        variant === 'danger' && 'bg-danger-bg text-danger border border-danger/20',
        variant === 'info' && 'bg-info-bg text-info border border-info/20',
        className
      )}
    >
      {children}
    </span>
  );
}
