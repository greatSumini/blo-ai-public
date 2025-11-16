"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { SectionCard } from "./section-card";
import { useSettings } from "../hooks/useSettings";
import { useUpdateSettings } from "../hooks/useUpdateSettings";

export function NotificationsSection() {
  const t = useTranslations("account.notifications");
  const { toast } = useToast();
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [emailUpdates, setEmailUpdates] = useState(settings?.emailUpdates ?? true);
  const [weeklyReport, setWeeklyReport] = useState(settings?.weeklyReport ?? false);

  // settings 데이터가 로드되면 state 업데이트
  useEffect(() => {
    if (settings) {
      setEmailUpdates(settings.emailUpdates ?? true);
      setWeeklyReport(settings.weeklyReport ?? false);
    }
  }, [settings]);

  const handleToggle = async (field: "emailUpdates" | "weeklyReport", value: boolean) => {
    const previousValue = field === "emailUpdates" ? emailUpdates : weeklyReport;

    // Optimistic update
    if (field === "emailUpdates") {
      setEmailUpdates(value);
    } else {
      setWeeklyReport(value);
    }

    try {
      // 즉시 저장 (토글은 debounce 불필요)
      await updateMutation.mutateAsync({ [field]: value });
    } catch (error) {
      // Rollback on error
      if (field === "emailUpdates") {
        setEmailUpdates(previousValue);
      } else {
        setWeeklyReport(previousValue);
      }

      toast({
        title: t("updateFailed"),
        description: t("updateErrorDesc"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <SectionCard title={t("title")} />;
  }

  return (
    <SectionCard title={t("title")} description={t("description")}>
      <div className="space-y-4">
        {/* Email Updates */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-colors duration-200">
          <div className="space-y-0.5">
            <Label htmlFor="emailUpdates" className="text-base font-medium cursor-pointer">
              {t("fields.emailUpdates")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("fields.emailUpdatesDesc")}
            </p>
          </div>
          <Switch
            id="emailUpdates"
            checked={emailUpdates}
            onCheckedChange={(val) => handleToggle("emailUpdates", val)}
          />
        </div>

        <div className="h-px bg-border/50" />

        {/* Weekly Report */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-colors duration-200">
          <div className="space-y-0.5">
            <Label htmlFor="weeklyReport" className="text-base font-medium cursor-pointer">
              {t("fields.weeklyReport")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("fields.weeklyReportDesc")}
            </p>
          </div>
          <Switch
            id="weeklyReport"
            checked={weeklyReport}
            onCheckedChange={(val) => handleToggle("weeklyReport", val)}
          />
        </div>
      </div>
    </SectionCard>
  );
}
