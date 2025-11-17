"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 스타일 가이드 편집 페이지 로딩 스켈레톤
 *
 * OnboardingWizard의 구조를 반영한 스켈레톤 UI
 */
export function EditSkeleton() {
  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="space-y-4">
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Keyboard hint skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Form Area - Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-[1fr,400px] lg:gap-8">
        {/* Left: Form */}
        <div className="rounded-xl border bg-card p-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-2xl" />

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden rounded-xl border bg-card p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1 ml-4" />
        </div>
      </div>
    </div>
  );
}
