"use client";

import { useTranslations } from "next-intl";
import { ProfileSection } from "./profile-section";
import { ContentPreferencesSection } from "./content-preferences-section";
import { NotificationsSection } from "./notifications-section";

export function AccountPage() {
  const t = useTranslations("common");

  return (
    <div className="container max-w-5xl px-4 md:px-6 py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-medium leading-tight text-text-primary">
          {t("account_management")}
        </h1>
        <p className="text-base md:text-lg text-text-secondary max-w-2xl leading-relaxed">
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
