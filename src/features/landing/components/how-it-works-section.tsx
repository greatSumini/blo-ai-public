"use client";

import { FileText, Sparkles, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function HowItWorksSection() {
  const t = useTranslations("landing.how_it_works");

  const steps = [
    {
      icon: <FileText className="w-6 h-6" />,
      titleKey: "step1.title" as const,
      descriptionKey: "step1.description" as const,
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      titleKey: "step2.title" as const,
      descriptionKey: "step2.description" as const,
    },
    {
      icon: <Edit className="w-6 h-6" />,
      titleKey: "step3.title" as const,
      descriptionKey: "step3.description" as const,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="w-full bg-white py-20 md:py-28 lg:py-32 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#111827] mb-4 md:mb-6 tracking-tight px-4">
            {t("section_title")}
          </h2>
          <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto px-4">
            {t("section_subtitle")}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#3BA2F8] text-white text-xl font-bold mb-4">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 mx-auto rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#3BA2F8]">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-[#111827]">
                {t(step.titleKey)}
              </h3>

              {/* Description */}
              <p className="text-base text-[#6B7280] leading-relaxed">
                {t(step.descriptionKey)}
              </p>
            </div>
          ))}
        </div>

        {/* 중간 CTA */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="rounded-lg px-8 py-6 text-base font-medium bg-[#3BA2F8] hover:bg-[#2E91E6] hover:shadow-md transition-all duration-200 text-white shadow-sm"
            asChild
          >
            <Link href="/signup">{t("cta")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
