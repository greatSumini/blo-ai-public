"use client";

import { useI18n } from "@/lib/i18n/client";

type AccountPageProps = {
  params: Promise<Record<string, never>>;
};

export default function AccountPage({ params }: AccountPageProps) {
  void params;
  const t = useI18n();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">{t("common.account_management")}</h1>
      <p className="text-muted-foreground">{t("common.coming_soon")}</p>
    </div>
  );
}
