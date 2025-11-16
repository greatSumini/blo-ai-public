'use client';

import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: '7xl' | 'prose' | 'full';
}

export function PageContainer({
  children,
  className,
  maxWidth = '7xl',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 md:px-6 py-8 md:py-12',
        maxWidth === '7xl' && 'max-w-7xl',
        maxWidth === 'prose' && 'max-w-prose',
        maxWidth === 'full' && 'max-w-full',
        className
      )}
    >
      {children}
    </div>
  );
}
