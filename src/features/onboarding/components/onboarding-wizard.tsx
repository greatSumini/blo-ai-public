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
    <div className="min-h-screen">
      <div className="">
        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} />
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
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                {renderStep()}

                {/* Navigation Buttons */}
                <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t("button_previous")}
                  </Button>

                  {currentStep < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
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
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
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

            {/* Mobile/Tablet: Single column with accordion preview */}
            <div className="lg:hidden">
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                {renderStep()}

                {/* Navigation Buttons */}
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex-1 sm:flex-initial"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t("button_previous")}
                  </Button>

                  {currentStep < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 sm:flex-initial bg-accent hover:bg-accent/90 text-accent-foreground"
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
                      className="flex-1 sm:flex-initial bg-accent hover:bg-accent/90 text-accent-foreground"
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
