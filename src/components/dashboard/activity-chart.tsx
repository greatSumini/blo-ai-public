"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>월간 활동 그래프</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
          <p className="text-sm text-muted-foreground">
            차트 라이브러리(예: Recharts)가 여기에 표시됩니다
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
