"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentArticlesGrid } from "@/components/dashboard/RecentArticlesGrid";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { useDashboardStats } from "@/features/articles/hooks/useDashboardStats";
import { useRecentArticles } from "@/features/articles/hooks/useRecentArticles";
import { useTranslations } from "next-intl";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

const WELCOME_SHOWN_KEY = "onboarding_welcome_shown";

function DashboardContent() {
  const { user } = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('common');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  const { data: stats, isLoading: isStatsLoading, error: statsError } = useDashboardStats();
  const { data: articles, isLoading: isArticlesLoading, error: articlesError } = useRecentArticles({ limit: 6 });

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

  const handleCreateArticle = () => {
    router.push('/new-article');
  };

  const handleViewArticle = (id: string) => {
    router.push(`/articles/${id}/edit`);
  };

  const handleViewAllArticles = () => {
    router.push('/articles');
  };

  if (isStatsLoading || isArticlesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (statsError || articlesError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{t('error')}</p>
      </div>
    );
  }

  if (!stats || !articles) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {showWelcomeBanner && (
        <WelcomeBanner onDismiss={handleDismissBanner} />
      )}
      <WelcomeSection
        userName={getUserName(user?.email)}
        stats={{
          monthlyArticles: stats.monthlyArticles,
          totalArticles: stats.totalArticles,
          monthlyGoal: stats.monthlyGoal,
          previousMonthArticles: stats.previousMonthArticles,
        }}
        onCreateArticle={handleCreateArticle}
      />
      <StatsGrid stats={stats} />
      <RecentArticlesGrid
        articles={articles}
        onViewArticle={handleViewArticle}
        onViewAll={handleViewAllArticles}
      />
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
