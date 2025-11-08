"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Clock } from "lucide-react";

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

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">월간 완성 글 수</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {monthlyArticles} / {monthlyGoal}편
          </div>
          <CardDescription className="mt-1">
            목표의 {achievementRate}%를 달성했어요!
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">누적 절약 시간</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{savedHours} 시간</div>
          <CardDescription className="mt-1">
            이번 달에 절약한 시간
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
