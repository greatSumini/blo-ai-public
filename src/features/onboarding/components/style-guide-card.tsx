"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Eye } from "lucide-react";
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";

interface StyleGuideCardProps {
  guide: StyleGuideResponse;
  onEdit: (guide: StyleGuideResponse) => void;
  onDelete: (id: string) => void;
  onPreview: (guide: StyleGuideResponse) => void;
}

export function StyleGuideCard({
  guide,
  onEdit,
  onDelete,
  onPreview,
}: StyleGuideCardProps) {
  const getBadgeColor = (tone: string) => {
    const colors: Record<string, string> = {
      professional: "#3BA2F8",
      friendly: "#10B981",
      inspirational: "#F59E0B",
      educational: "#8B5CF6",
    };
    return colors[tone] || "#6B7280";
  };

  const getContentLengthLabel = (length: string) => {
    const labels: Record<string, string> = {
      short: "짧음",
      medium: "중간",
      long: "긴",
    };
    return labels[length] || length;
  };

  const getReadingLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: "초보자",
      intermediate: "중급",
      advanced: "고급",
    };
    return labels[level] || level;
  };

  return (
    <Card
      className="p-6"
      style={{
        borderColor: "#E1E5EA",
        borderRadius: "12px",
      }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold" style={{ color: "#1F2937" }}>
              {guide.brandName}
            </h3>
            <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
              {guide.brandDescription}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {/* Tone Badge */}
          <div
            className="px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: getBadgeColor(guide.tone) }}
          >
            {guide.tone}
          </div>

          {/* Language Badge */}
          <div
            className="px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#6366F1" }}
          >
            {guide.language === "ko" ? "한국어" : "English"}
          </div>

          {/* Content Length Badge */}
          <div
            className="px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#EC4899" }}
          >
            {getContentLengthLabel(guide.contentLength)}
          </div>

          {/* Reading Level Badge */}
          <div
            className="px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#14B8A6" }}
          >
            {getReadingLevelLabel(guide.readingLevel)}
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
          <p>
            <span className="font-semibold">대상 독자:</span> {guide.targetAudience}
          </p>
          {guide.personality && guide.personality.length > 0 && (
            <p>
              <span className="font-semibold">성격:</span> {guide.personality.join(", ")}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(guide)}
            className="flex-1"
          >
            <Eye className="mr-2 h-4 w-4" />
            미리보기
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(guide)}
            className="flex-1"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            편집
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(guide.id)}
            className="flex-1 text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>
    </Card>
  );
}
