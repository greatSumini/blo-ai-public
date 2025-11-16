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
import { AlertCircle } from "lucide-react";

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
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-accent-brand/30 border-t-accent-brand rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (statsError || articlesError) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <p className="text-destructive font-medium">{t('error')}</p>
          <p className="text-sm text-text-secondary">{t('error_description')}</p>
        </div>
      </div>
    );
  }

  if (!stats || !articles) {
    return null;
  }

  return (
    <div className="flex flex-col gap-12 md:gap-16">
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
    <div className="container mx-auto px-4 md:px-6 max-w-7xl">
      <div className="py-8 md:py-12">
        <Suspense
          fallback={
            <div
              className="flex items-center justify-center min-h-[400px]"
              role="status"
              aria-live="polite"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-accent-brand/30 border-t-accent-brand rounded-full animate-spin" />
                <p className="text-text-secondary text-sm">Loading...</p>
              </div>
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
