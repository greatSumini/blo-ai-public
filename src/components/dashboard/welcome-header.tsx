"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import Link from "next/link";

type WelcomeHeaderProps = {
  userName?: string;
};

export function WelcomeHeader({ userName = "Sam" }: WelcomeHeaderProps) {
  const t = useI18n();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("dashboard.welcome_header.greeting", { userName })}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("dashboard.welcome_header.subtitle")}
        </p>
      </div>
      <Button size="lg" className="sm:ml-auto" asChild>
        <Link href="/new-article">
          <>
            {t("dashboard.welcome_header.new_article")}
            <Plus className="ml-2 h-4 w-4" />
          </>
        </Link>
      </Button>
    </div>
  );
}
