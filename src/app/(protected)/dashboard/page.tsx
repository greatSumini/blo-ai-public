"use client";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { RecentArticlesList } from "@/components/dashboard/recent-articles-list";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;
  const { user } = useCurrentUser();

  const getUserName = (email?: string) => {
    if (!email) return "Sam";
    return email.split("@")[0];
  };

  return (
    <div className="flex flex-col gap-8">
      <WelcomeHeader userName={getUserName(user?.email)} />
      <StatsCards monthlyArticles={4} monthlyGoal={10} savedHours={8} />
      <ActivityChart />
      <RecentArticlesList />
    </div>
  );
}
