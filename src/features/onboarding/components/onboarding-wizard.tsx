"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepIndicator } from "./step-indicator";
import { PreviewPanel } from "./preview-panel";
import { StepBrandVoice } from "./step-brand-voice";
import { StepAudience } from "./step-audience";
import { StepLanguage } from "./step-language";
import { StepStyle } from "./step-style";
import { StepReview } from "./step-review";
import {
  onboardingSchema,
  brandVoiceSchema,
  targetAudienceSchema,
  languageSchema,
  styleSchema,
  reviewSchema,
  defaultOnboardingValues,
  type OnboardingFormData,
} from "../lib/onboarding-schema";
import { TOTAL_STEPS } from "../lib/constants";

interface OnboardingWizardProps {
  onComplete: (data: OnboardingFormData) => Promise<void>;

  /**
   * 편집 모드에서 사용할 초기 데이터
   * 제공되지 않으면 기본값(defaultOnboardingValues) 사용
   */
  initialData?: OnboardingFormData;

  /**
   * 위저드 모드
   * - "create": 신규 생성 (기본값)
   * - "edit": 편집
   */
  mode?: "create" | "edit";
}

export function OnboardingWizard({
  onComplete,
  initialData,
  mode = "create",
}: OnboardingWizardProps) {
  const t = useTranslations("onboarding.wizard");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: initialData || defaultOnboardingValues,
    mode: "onChange",
  });

  // Get step-specific schema for validation
  const getStepSchema = (step: number) => {
    switch (step) {
      case 1:
        return brandVoiceSchema;
      case 2:
        return targetAudienceSchema;
      case 3:
        return languageSchema;
      case 4:
        return styleSchema;
      case 5:
        return reviewSchema;
      default:
        return onboardingSchema;
    }
  };

  // Validate current step before proceeding
  const validateCurrentStep = useCallback(async () => {
    const stepSchema = getStepSchema(currentStep);
    const values = form.getValues();

    try {
      await stepSchema.parseAsync(values);
      return true;
    } catch (error) {
      // Trigger validation to show errors
      await form.trigger();
      return false;
    }
  }, [currentStep, form]);

  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep();

    if (isValid && currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      // Focus on the top of the form
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Announce step change for screen readers
      const announcement = `Step ${currentStep + 1} of ${TOTAL_STEPS}`;
      announceToScreenReader(announcement);
    }
  }, [currentStep, validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Announce step change for screen readers
      const announcement = `Step ${currentStep - 1} of ${TOTAL_STEPS}`;
      announceToScreenReader(announcement);
    }
  }, [currentStep]);

  // Helper function to announce to screen readers
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const handleSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
    } catch (error) {
      console.error("Onboarding submission error:", error);
      setIsSubmitting(false);
    }
  };

  // Watch form values for preview
  const formValues = form.watch();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Alt + Arrow Right: Next step
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }

      // Alt + Arrow Left: Previous step
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, handleNext, handlePrevious]);

  // Render current step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBrandVoice form={form} />;
      case 2:
        return <StepAudience form={form} />;
      case 3:
        return <StepLanguage form={form} />;
      case 4:
        return <StepStyle form={form} />;
      case 5:
        return <StepReview form={form} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen py-8"
      style={{ backgroundColor: "#FCFCFD" }}
    >
      <div className="container mx-auto max-w-7xl px-4">
        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} />

          {/* Keyboard shortcut hint */}
          <div className="mt-2 text-center">
            <p className="text-xs" style={{ color: "#9CA3AF" }}>
              <kbd className="rounded px-1.5 py-0.5" style={{ backgroundColor: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB" }}>
                Alt
              </kbd>
              {" + "}
              <kbd className="rounded px-1.5 py-0.5" style={{ backgroundColor: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB" }}>
                ← / →
              </kbd>
              {" "}
              {t("keyboard_shortcut_hint")}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              // Prevent default form submission - we handle it manually
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              // Prevent Enter key from submitting the form
              if (e.key === "Enter" && e.target instanceof HTMLElement) {
                // Allow Enter in textarea for new lines
                if (e.target.tagName !== "TEXTAREA") {
                  e.preventDefault();
                }
              }
            }}
          >
            {/* Desktop: 2-column layout */}
            <div className="hidden lg:grid lg:grid-cols-[1fr,400px] lg:gap-8">
              {/* Left: Form */}
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E1E5EA",
                  borderRadius: "12px",
                }}
              >
                {renderStep()}

                {/* Navigation Buttons */}
                <div className="mt-8 flex items-center justify-between border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="h-10"
                    style={{
                      borderColor: "#E1E5EA",
                      borderRadius: "8px",
                    }}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t("button_previous")}
                  </Button>

                  {currentStep < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="h-10"
                      style={{
                        backgroundColor: "#3BA2F8",
                        borderRadius: "8px",
                      }}
                    >
                      {t("button_next")}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={async () => {
                        const isValid = await validateCurrentStep();
                        if (isValid) {
                          const formData = form.getValues();
                          await handleSubmit(formData);
                        }
                      }}
                      disabled={isSubmitting}
                      className="h-10"
                      style={{
                        backgroundColor: "#10B981",
                        borderRadius: "8px",
                      }}
                    >
                      {isSubmitting
                        ? t("button_submitting")
                        : mode === "edit"
                        ? t("button_save")
                        : t("button_complete")}
                    </Button>
                  )}
                </div>
              </div>

              {/* Right: Preview Panel (sticky) */}
              <div>
                <PreviewPanel formData={formValues} />
              </div>
            </div>

            {/* Mobile/Tablet: Single column with accordion preview */}
            <div className="lg:hidden">
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E1E5EA",
                  borderRadius: "12px",
                }}
              >
                {renderStep()}

                {/* Mobile Preview - Accordion */}
                <div className="mt-6">
                  <Accordion type="single" collapsible>
                    <AccordionItem
                      value="preview"
                      style={{ borderColor: "#E1E5EA" }}
                    >
                      <AccordionTrigger
                        className="text-sm font-medium"
                        style={{ color: "#374151" }}
                      >
                        {t("preview_label")}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2">
                          <PreviewPanel formData={formValues} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 flex items-center justify-between border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="h-12 flex-1 sm:h-10 sm:flex-initial"
                    style={{
                      borderColor: "#E1E5EA",
                      borderRadius: "8px",
                    }}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t("button_previous")}
                  </Button>

                  {currentStep < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="ml-4 h-12 flex-1 sm:h-10 sm:flex-initial"
                      style={{
                        backgroundColor: "#3BA2F8",
                        borderRadius: "8px",
                      }}
                    >
                      {t("button_next")}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={async () => {
                        const isValid = await validateCurrentStep();
                        if (isValid) {
                          const formData = form.getValues();
                          await handleSubmit(formData);
                        }
                      }}
                      disabled={isSubmitting}
                      className="ml-4 h-12 flex-1 sm:h-10 sm:flex-initial"
                      style={{
                        backgroundColor: "#10B981",
                        borderRadius: "8px",
                      }}
                    >
                      {isSubmitting
                        ? t("button_submitting")
                        : mode === "edit"
                        ? t("button_save")
                        : t("button_complete")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
