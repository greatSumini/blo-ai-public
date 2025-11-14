"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { RecentArticlesList } from "@/components/dashboard/recent-articles-list";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

const WELCOME_SHOWN_KEY = "onboarding_welcome_shown";

function DashboardContent() {
  const { user } = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  useEffect(() => {
    const welcomeParam = searchParams.get("welcome");
    if (welcomeParam === "true") {
      const hasShownWelcome = sessionStorage.getItem(WELCOME_SHOWN_KEY);
      if (!hasShownWelcome) {
        setShowWelcomeBanner(true);
        sessionStorage.setItem(WELCOME_SHOWN_KEY, "true");
      }
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  const getUserName = (email?: string) => {
    if (!email) return "Sam";
    return email.split("@")[0];
  };

  const handleDismissBanner = () => {
    setShowWelcomeBanner(false);
  };

  return (
    <div className="flex flex-col gap-8">
      {showWelcomeBanner && (
        <WelcomeBanner onDismiss={handleDismissBanner} />
      )}
      <WelcomeHeader userName={getUserName(user?.email)} />
      <StatsCards />
      <ActivityChart />
      <RecentArticlesList />
    </div>
  );
}

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;

  return (
    <Suspense fallback={<div className="flex flex-col gap-8">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
