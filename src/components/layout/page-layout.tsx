"use client";

import type { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  maxWidthClassName?: string;
}

export function PageLayout({
  title,
  description,
  actions,
  children,
  maxWidthClassName = "max-w-6xl",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`container mx-auto ${maxWidthClassName} px-4 py-8`}>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-sm text-gray-600">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
