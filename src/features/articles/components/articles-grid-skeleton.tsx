"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ArticlesGridSkeletonProps {
  count?: number;
}

export function ArticlesGridSkeleton({ count = 6 }: ArticlesGridSkeletonProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-5">
          {/* Badge + Menu */}
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>

          {/* 제목 */}
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3 mb-2" />

          {/* 수정일 */}
          <Skeleton className="h-4 w-32" />
        </Card>
      ))}
    </div>
  );
}
