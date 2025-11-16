"use client";

import { Keyboard, Sparkles, FileEdit, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function HowItWorksSection() {
  const t = useTranslations("landing.how_it_works");

  const steps = [
    {
      number: "01",
      icon: <Keyboard className="w-8 h-8" />,
      titleKey: "step1.title" as const,
      descriptionKey: "step1.description" as const,
    },
    {
      number: "02",
      icon: <Sparkles className="w-8 h-8" />,
      titleKey: "step2.title" as const,
      descriptionKey: "step2.description" as const,
    },
    {
      number: "03",
      icon: <FileEdit className="w-8 h-8" />,
      titleKey: "step3.title" as const,
      descriptionKey: "step3.description" as const,
    },
  ];
  return (
    <section id="how-it-works" className="w-full bg-white py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-3 md:mb-4 px-4">
            {t("heading")}
          </h2>
          <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto px-4">
            {t("subheading")}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className="flex flex-col items-center text-center space-y-6 p-8 rounded-xl border border-[#E1E5EA] bg-[#FCFCFD] hover:border-[#3BA2F8] transition-all duration-300">
                {/* Step Number */}
                <div className="text-5xl font-bold text-[#E1E5EA]">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-[#3BA2F8] flex items-center justify-center text-white">
                  {step.icon}
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-[#111827]">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-base text-[#6B7280] leading-relaxed">
                    {t(step.descriptionKey)}
                  </p>
                </div>
              </div>

              {/* Arrow between steps (hidden on mobile, last arrow hidden on all screens) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-[#3BA2F8]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Time Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5F7FA] border border-[#E1E5EA]">
            <span className="text-2xl font-bold text-[#3BA2F8]">{t("time_badge.value")}</span>
            <span className="text-base text-[#6B7280]">{t("time_badge.label")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
