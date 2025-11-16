"use client";

import { useTranslations } from "next-intl";
import { ProfileSection } from "./profile-section";
import { ContentPreferencesSection } from "./content-preferences-section";
import { NotificationsSection } from "./notifications-section";

export function AccountPage() {
  const t = useTranslations("common");

  return (
    <div className="container max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 space-y-8 sm:space-y-10">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {t("account_management")}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
          {t("account_management_description")}
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <ProfileSection />
        <ContentPreferencesSection />
        <NotificationsSection />
      </div>
    </div>
  );
}
