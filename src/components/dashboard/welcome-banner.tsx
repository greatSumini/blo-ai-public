"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Sparkles } from "lucide-react";
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCurrentOrganization } from "@/contexts/organization-context";
import { ROUTES } from "@/lib/routes";

interface WelcomeBannerProps {
  onDismiss?: () => void;
}

export function WelcomeBanner({ onDismiss }: WelcomeBannerProps) {
  const t = useTranslations('dashboard.banner');
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const { orgId } = useCurrentOrganization();

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 250); // Wait for animation to complete
  }, [onDismiss]);

  // Mount animation
  useEffect(() => {
    setIsVisible(true);

    // Auto-dismiss after 10 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 10000);

    return () => clearTimeout(timer);
  }, [handleDismiss]);

  // Handle ESC key for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDismiss]);

  const handleCTAClick = () => {
    if (!orgId) return;
    router.push(ROUTES.NEW_ARTICLE(orgId));
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        transition-all duration-300 ease-out motion-reduce:transition-none
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      <div
        className="
          bg-blue-50 dark:bg-blue-950/20
          border-l-4 border-blue-500 dark:border-blue-400
          rounded-lg
          p-4 md:p-6
          shadow-sm
        "
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Content */}
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-text-primary mb-2">{t("title")}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t("desc")}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 md:flex-shrink-0">
            <button
              onClick={handleCTAClick}
              className="
                bg-accent-brand hover:bg-accent-brand/90
                text-white
                px-6
                py-2.5
                rounded-lg
                text-sm
                font-medium
                transition-all duration-100
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-accent-brand
                focus-visible:ring-offset-2
                motion-reduce:transition-none
              "
              aria-label={t("cta_aria")}
            >
              {t("cta")}
            </button>
            <button
              onClick={handleDismiss}
              className="
                p-2
                text-text-secondary
                hover:text-text-primary
                hover:bg-bg-secondary
                rounded-lg
                transition-colors duration-100
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-accent-brand
                focus-visible:ring-offset-2
                motion-reduce:transition-none
              "
              aria-label={t("close_aria")}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
