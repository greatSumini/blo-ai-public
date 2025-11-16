'use client';

import { cn } from '@/lib/utils';
import { Button } from './button-v2';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-default bg-bg-secondary p-12 text-center',
        'animate-fade-in',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-brand/10 text-accent-brand">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-medium text-text-primary">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-text-secondary leading-relaxed">
        {description}
      </p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
