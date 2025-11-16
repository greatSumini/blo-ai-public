"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface MetadataCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  isLoading?: boolean;
}

export function MetadataCard({
  icon: Icon,
  label,
  value,
  isLoading
}: MetadataCardProps) {
  return (
    <Card className="rounded-lg border bg-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <span className="sr-only">Loading {label}</span>
          </div>
        ) : (
          <div className="text-sm">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
