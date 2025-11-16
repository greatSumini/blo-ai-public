"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { SectionCard } from "./section-card";
import { AutoSaveIndicator } from "./auto-save-indicator";
import { useProfile } from "../hooks/useProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useAutoSave } from "../hooks/useAutoSave";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";

export function ProfileSection() {
  const t = useTranslations("account.profile");
  const locale = useLocale();
  const dateLocale = locale === "ko" ? ko : enUS;
  const { toast } = useToast();

  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // profile 데이터가 로드되면 state 업데이트
  useEffect(() => {
    if (profile?.fullName !== undefined) {
      setFullName(profile.fullName ?? "");
    }
  }, [profile?.fullName]);

  // 자동 저장 (fullName만)
  const { save, saveStatus } = useAutoSave({
    onSave: (data) => updateMutation.mutateAsync(data),
  });

  const handleNameChange = (value: string) => {
    setFullName(value);
    save({ fullName: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // TODO: Supabase Storage 업로드 구현
      // const imageUrl = await uploadToSupabase(file);
      // await updateMutation.mutateAsync({ imageUrl });
      toast({
        title: t("imageUploadNotImplemented"),
        description: t("imageUploadComingSoon"),
        variant: "default",
      });
    } catch (error) {
      console.error("Image upload failed", error);
      toast({
        title: t("imageUploadFailed"),
        description: t("imageUploadErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <SectionCard title={t("title")} description={t("description")}>
        <div
          className="flex items-center justify-center py-8"
          role="status"
          aria-live="polite"
          aria-label={t("loading")}
        >
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="sr-only">{t("loading")}</span>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={t("title")} description={t("description")}>
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0 group">
          <Avatar className="h-24 w-24 transition-all duration-200 group-hover:ring-4 group-hover:ring-primary/10">
            <AvatarImage src={profile?.imageUrl ?? undefined} alt={fullName} />
            <AvatarFallback className="text-2xl">
              {fullName?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <label htmlFor="avatar-upload">
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full shadow-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md"
              disabled={isUploadingImage}
              asChild
            >
              <span>
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </span>
            </Button>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            aria-label={t("fields.uploadAvatar")}
          />
        </div>

        {/* Info */}
        <div className="flex-1 w-full space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">{t("fields.fullName")}</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t("fields.fullNamePlaceholder")}
              className="max-w-lg"
            />
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("fields.email")}</Label>
            <Input
              id="email"
              value={profile?.email ?? ""}
              disabled
              className="max-w-lg bg-muted/50 border-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              {t("fields.emailHint")}
            </p>
          </div>

          {/* Joined Date */}
          <div className="space-y-2">
            <Label>{t("fields.joinedAt")}</Label>
            <p className="text-sm text-muted-foreground">
              {profile?.createdAt
                ? format(new Date(profile.createdAt), "PPP", { locale: dateLocale })
                : "-"}
            </p>
          </div>

          {/* Auto Save Indicator */}
          <AutoSaveIndicator
            isSaving={saveStatus === "saving"}
            isError={saveStatus === "error"}
            lastSavedAt={profile?.updatedAt}
          />
        </div>
      </div>
    </SectionCard>
  );
}
