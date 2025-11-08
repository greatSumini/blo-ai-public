"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/client";

export function ActivityChart() {
  const t = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.activity.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
          <p className="text-sm text-muted-foreground">{t("dashboard.activity.placeholder")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
