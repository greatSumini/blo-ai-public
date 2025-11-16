'use client';

import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(
        // Base
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-all duration-fast ease-claude',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'motion-reduce:transition-none',

        // Interactive
        'active:scale-[0.985]',

        // Variants
        variant === 'primary' && [
          'bg-accent-brand text-white',
          'hover:bg-accent-brand/90',
        ],
        variant === 'secondary' && [
          'border border-border-default bg-bg-primary text-text-primary',
          'hover:bg-bg-hover',
        ],
        variant === 'ghost' && [
          'text-text-secondary',
          'hover:bg-bg-hover hover:text-text-primary',
        ],
        variant === 'danger' && [
          'bg-danger text-white',
          'hover:bg-danger/90',
        ],

        // Sizes
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',

        className
      )}
      {...props}
    />
  );
}
