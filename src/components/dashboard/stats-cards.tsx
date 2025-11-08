"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

type StatsCardsProps = {
  monthlyArticles?: number;
  monthlyGoal?: number;
  savedHours?: number;
};

export function StatsCards({
  monthlyArticles = 4,
  monthlyGoal = 10,
  savedHours = 8,
}: StatsCardsProps) {
  const achievementRate = Math.round((monthlyArticles / monthlyGoal) * 100);
  const t = useI18n();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("dashboard.stats.monthly_articles_title")}</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {monthlyArticles} / {monthlyGoal}{t("dashboard.stats.monthly_articles_suffix")}
          </div>
          <CardDescription className="mt-1">
            {t("dashboard.stats.goal_achievement", { rate: achievementRate })}
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("dashboard.stats.saved_time_title")}</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{savedHours} {t("dashboard.stats.saved_time_suffix")}</div>
          <CardDescription className="mt-1">
            {t("dashboard.stats.saved_time_desc")}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
