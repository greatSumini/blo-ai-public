"use client";

import { FileText, Sparkles, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function HowItWorksSection() {
  const t = useTranslations("landing.how_it_works");

  const steps = [
    {
      icon: <FileText className="w-5 h-5 md:w-6 md:h-6" />,
      titleKey: "step1.title" as const,
      descriptionKey: "step1.description" as const,
    },
    {
      icon: <Sparkles className="w-5 h-5 md:w-6 md:h-6" />,
      titleKey: "step2.title" as const,
      descriptionKey: "step2.description" as const,
    },
    {
      icon: <Edit className="w-5 h-5 md:w-6 md:h-6" />,
      titleKey: "step3.title" as const,
      descriptionKey: "step3.description" as const,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="w-full bg-bg-secondary/20 py-20 md:py-28 lg:py-32 px-4 border-t border-border-default/40"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header - Claude.ai style */}
        <div className="text-center mb-16 md:mb-20 lg:mb-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-text-primary mb-4 md:mb-6 tracking-tight px-4 leading-tight">
            {t("section_title")}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto px-4 leading-relaxed">
            {t("section_subtitle")}
          </p>
        </div>

        {/* Steps Grid - accent-brand color */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-12 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center space-y-5 md:space-y-6">
              {/* Step Number - accent-brand badge */}
              <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent-brand/5 text-accent-brand text-lg md:text-xl font-medium mb-4 border border-accent-brand/20">
                {index + 1}
              </div>

              {/* Icon - accent-brand style */}
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-lg bg-accent-brand/10 flex items-center justify-center text-accent-brand">
                {step.icon}
              </div>

              {/* Title - Claude.ai typography */}
              <h3 className="text-lg md:text-xl font-medium text-text-primary px-4">
                {t(step.titleKey)}
              </h3>

              {/* Description - Claude.ai muted text */}
              <p className="text-sm md:text-base text-text-secondary leading-relaxed px-4">
                {t(step.descriptionKey)}
              </p>

              {/* Connector Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-px bg-accent-brand/20" />
              )}
            </div>
          ))}
        </div>

        {/* CTA - accent-brand color */}
        <div className="text-center mt-16">
          <Button
            size="lg"
            className="rounded-lg px-8 py-6 h-auto text-base font-medium bg-accent-brand text-white hover:opacity-90 transition-opacity duration-fast"
            asChild
          >
            <Link href="/signup">{t("cta")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
