"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
} from "lucide-react";
import type { ArticleFormData } from "../lib/article-form-schema";

interface SeoCheckItem {
  label: string;
  status: "pass" | "warning" | "fail" | "info";
  message: string;
}

interface SeoPanelProps {
  formData: ArticleFormData;
}

export function SeoPanel({ formData }: SeoPanelProps) {
  const t = useTranslations("articles");

  const checks: SeoCheckItem[] = [
    // Title checks
    {
      label: t("seoPanel.titleLengthLabel"),
      status: formData.title
        ? formData.title.length >= 30 && formData.title.length <= 60
          ? "pass"
          : formData.title.length > 60
            ? "warning"
            : "info"
        : "info",
      message: formData.title
        ? t("seoPanel.titleLengthMessage", { count: formData.title.length })
        : t("seoPanel.titleLengthEmpty"),
    },
    // Meta title
    {
      label: t("seoPanel.metaTitleLabel"),
      status: formData.metaTitle
        ? formData.metaTitle.length <= 60
          ? "pass"
          : "warning"
        : "info",
      message: formData.metaTitle
        ? t("seoPanel.metaTitleMessage", { count: formData.metaTitle.length })
        : t("seoPanel.metaTitleEmpty"),
    },
    // Meta description
    {
      label: t("seoPanel.metaDescriptionLabel"),
      status: formData.metaDescription
        ? formData.metaDescription.length >= 120 &&
          formData.metaDescription.length <= 160
          ? "pass"
          : formData.metaDescription.length > 160
            ? "warning"
            : "info"
        : "info",
      message: formData.metaDescription
        ? t("seoPanel.metaDescriptionMessage", { count: formData.metaDescription.length })
        : t("seoPanel.metaDescriptionEmpty"),
    },
    // Slug
    {
      label: t("seoPanel.slugLabel"),
      status: formData.slug
        ? /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)
          ? "pass"
          : "fail"
        : "info",
      message: formData.slug
        ? /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)
          ? t("seoPanel.slugValid")
          : t("seoPanel.slugInvalid")
        : t("seoPanel.slugEmpty"),
    },
    // Keywords
    {
      label: t("seoPanel.keywordsLabel"),
      status:
        formData.keywords && formData.keywords.length > 0
          ? formData.keywords.length >= 3 && formData.keywords.length <= 10
            ? "pass"
            : "warning"
          : "info",
      message:
        formData.keywords && formData.keywords.length > 0
          ? t("seoPanel.keywordsMessage", { count: formData.keywords.length })
          : t("seoPanel.keywordsEmpty"),
    },
    // Content length
    {
      label: t("seoPanel.contentLengthLabel"),
      status: formData.content
        ? formData.content.length >= 300
          ? "pass"
          : "info"
        : "info",
      message: formData.content
        ? t("seoPanel.contentLengthMessage", { count: formData.content.length })
        : t("seoPanel.contentLengthEmpty"),
    },
  ];

  const passCount = checks.filter((c) => c.status === "pass").length;
  const totalCount = checks.length;
  const score = Math.round((passCount / totalCount) * 100);

  const getStatusIcon = (status: SeoCheckItem["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4" style={{ color: "#10B981" }} />;
      case "warning":
        return <AlertCircle className="h-4 w-4" style={{ color: "#F59E0B" }} />;
      case "fail":
        return <XCircle className="h-4 w-4" style={{ color: "#DC2626" }} />;
      case "info":
        return <Info className="h-4 w-4" style={{ color: "#6B7280" }} />;
    }
  };

  const getStatusColor = (status: SeoCheckItem["status"]) => {
    switch (status) {
      case "pass":
        return "#10B981";
      case "warning":
        return "#F59E0B";
      case "fail":
        return "#DC2626";
      case "info":
        return "#6B7280";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981";
    if (score >= 50) return "#F59E0B";
    return "#DC2626";
  };

  return (
    <Card
      className="sticky top-4 h-fit overflow-hidden"
      style={{
        borderColor: "#E1E5EA",
        borderRadius: "12px",
      }}
    >
      <div
        className="border-b px-6 py-4"
        style={{ borderColor: "#E1E5EA", backgroundColor: "#F9FAFB" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Search className="h-5 w-5" style={{ color: "#3BA2F8" }} />
            {t("seoPanel.title")}
          </h3>
          <Badge
            variant="secondary"
            className="text-base font-bold"
            style={{
              backgroundColor: getScoreColor(score) + "20",
              color: getScoreColor(score),
            }}
          >
            {t("seoPanel.scoreLabel", { score })}
          </Badge>
        </div>
        <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>
          {t("seoPanel.itemsPassed", { passed: passCount, total: totalCount })}
        </p>
      </div>

      <div className="divide-y" style={{ borderColor: "#E1E5EA" }}>
        {checks.map((check, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getStatusIcon(check.status)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4
                    className="text-sm font-medium"
                    style={{ color: "#374151" }}
                  >
                    {check.label}
                  </h4>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: getStatusColor(check.status) }}
                >
                  {check.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="border-t px-6 py-4"
        style={{ borderColor: "#E1E5EA", backgroundColor: "#F9FAFB" }}
      >
        <div className="space-y-2">
          <h4
            className="text-xs font-semibold uppercase"
            style={{ color: "#6B7280" }}
          >
            {t("seoPanel.tipsTitle")}
          </h4>
          <ul
            className="space-y-1.5 text-xs leading-relaxed"
            style={{ color: "#6B7280" }}
          >
            <li>• {t("seoPanel.tip1")}</li>
            <li>• {t("seoPanel.tip2")}</li>
            <li>• {t("seoPanel.tip3")}</li>
            <li>• {t("seoPanel.tip4")}</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
