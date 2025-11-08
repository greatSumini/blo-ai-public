"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";

interface StyleGuidePreviewModalProps {
  guide: StyleGuideResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StyleGuidePreviewModal({
  guide,
  isOpen,
  onClose,
}: StyleGuidePreviewModalProps) {
  if (!guide) return null;

  const getFormattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getToneLabel = (tone: string) => {
    const labels: Record<string, string> = {
      professional: "전문적이고 신뢰감 있는",
      friendly: "친근하고 대화하는 듯한",
      inspirational: "영감을 주고 동기부여하는",
      educational: "교육적이고 정보 전달에 충실한",
    };
    return labels[tone] || tone;
  };

  const getContentLengthLabel = (length: string) => {
    const labels: Record<string, string> = {
      short: "짧음 (1000-1500자)",
      medium: "중간 (2000-3000자)",
      long: "긴 (4000-6000자)",
    };
    return labels[length] || length;
  };

  const getReadingLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: "초보자도 쉽게 이해할 수 있는",
      intermediate: "중급 수준의",
      advanced: "전문적이고 심화된",
    };
    return labels[level] || level;
  };

  const getFormalityLabel = (formality: string) => {
    const labels: Record<string, string> = {
      casual: "캐주얼",
      neutral: "중립적",
      formal: "격식있는",
    };
    return labels[formality] || formality;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E1E5EA",
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "#1F2937" }}>
            {guide.brandName} - 상세보기
          </DialogTitle>
          <DialogDescription>
            생성일: {getFormattedDate(guide.createdAt)} | 수정일:{" "}
            {getFormattedDate(guide.updatedAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 브랜드 정보 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg" style={{ color: "#1F2937" }}>
              브랜드 정보
            </h3>
            <div className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
              <p>
                <span className="font-semibold">브랜드 이름:</span>{" "}
                {guide.brandName}
              </p>
              <p>
                <span className="font-semibold">설명:</span>{" "}
                {guide.brandDescription}
              </p>
              {guide.personality && guide.personality.length > 0 && (
                <p>
                  <span className="font-semibold">성격 특성:</span>{" "}
                  {guide.personality.join(", ")}
                </p>
              )}
              <p>
                <span className="font-semibold">격식 수준:</span>{" "}
                {getFormalityLabel(guide.formality)}
              </p>
            </div>
          </div>

          {/* 타겟 독자 정보 */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-lg" style={{ color: "#1F2937" }}>
              타겟 독자
            </h3>
            <div className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
              <p>
                <span className="font-semibold">대상 독자:</span>{" "}
                {guide.targetAudience}
              </p>
              <p>
                <span className="font-semibold">해결하려는 문제:</span>{" "}
                {guide.painPoints}
              </p>
            </div>
          </div>

          {/* 콘텐츠 스타일 정보 */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-lg" style={{ color: "#1F2937" }}>
              콘텐츠 스타일
            </h3>
            <div className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
              <p>
                <span className="font-semibold">언어:</span>{" "}
                {guide.language === "ko" ? "한국어" : "English"}
              </p>
              <p>
                <span className="font-semibold">톤:</span>{" "}
                {getToneLabel(guide.tone)}
              </p>
              <p>
                <span className="font-semibold">글 길이:</span>{" "}
                {getContentLengthLabel(guide.contentLength)}
              </p>
              <p>
                <span className="font-semibold">읽기 수준:</span>{" "}
                {getReadingLevelLabel(guide.readingLevel)}
              </p>
            </div>
          </div>

          {/* 추가 메모 */}
          {guide.notes && (
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-lg" style={{ color: "#1F2937" }}>
                추가 메모
              </h3>
              <p
                className="text-sm p-3 rounded"
                style={{
                  backgroundColor: "#F9FAFB",
                  color: "#6B7280",
                }}
              >
                {guide.notes}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
