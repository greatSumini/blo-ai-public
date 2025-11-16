"use client";

import type { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  maxWidthClassName?: string;
  removePadding?: boolean;
}

export function PageLayout({
  title,
  description,
  actions,
  children,
  maxWidthClassName = "max-w-6xl",
  removePadding = false,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <div className={`container mx-auto ${maxWidthClassName} ${removePadding ? "" : "px-4 md:px-6 py-16 md:py-24"}`}>
        <div className="mb-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-medium text-foreground dark:text-foreground leading-tight">
                {title}
              </h1>
              {description && (
                <p className="mt-4 text-base text-muted-foreground dark:text-muted-foreground leading-relaxed max-w-2xl">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 md:flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
