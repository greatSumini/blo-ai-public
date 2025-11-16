'use client';

import { cn } from '@/lib/utils';

export function AppHeader() {
  return (
    <header className="flex h-16 items-center border-b border-border-default bg-bg-primary px-6">
      <div className="flex flex-1 items-center justify-between">
        {/* Left: Workspace Selector (placeholder) */}
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-medium text-text-primary">Workspace</h2>
        </div>

        {/* Right: User Menu (placeholder) */}
        <div className="flex items-center gap-4">
          <button
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary',
              'transition-colors hover:bg-bg-hover hover:text-text-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2'
            )}
          >
            User Menu
          </button>
        </div>
      </div>
    </header>
  );
}
