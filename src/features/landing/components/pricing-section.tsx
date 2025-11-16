"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function PricingSection() {
  const t = useTranslations("landing.pricing");

  // Free 플랜 features
  const freeFeatures = [
    t("free.features.articles"),
    t("free.features.keywords"),
    t("free.features.style_guides"),
  ];

  // Pro 플랜 features
  const proFeatures = [
    t("pro.features.articles"),
    t("pro.features.keywords"),
    t("pro.features.style_guides"),
    t("pro.features.priority_support"),
  ];

  return (
    <section id="pricing" className="w-full bg-bg-primary py-20 md:py-28 lg:py-32 px-4 border-t border-border-default/40">
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

        {/* Pricing Cards - Claude.ai style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Free Plan - Claude.ai subtle card */}
          <div className="relative p-6 md:p-8 lg:p-10 rounded-xl border border-border-default/60 bg-bg-secondary/50 hover:border-border-default hover:bg-bg-secondary hover:shadow-sm transition-all duration-slow">
            <div className="space-y-6 md:space-y-8">
              {/* Plan Name - Claude.ai typography */}
              <div>
                <h3 className="text-xl md:text-2xl font-medium text-text-primary">
                  {t("free.name")}
                </h3>
                <p className="text-sm md:text-base text-text-secondary mt-2">
                  {t("free.description")}
                </p>
              </div>

              {/* Price - Claude.ai style */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-medium text-text-primary">
                  {t("free.price")}
                </span>
                <span className="text-base text-text-secondary">
                  {t("free.period")}
                </span>
              </div>

              {/* CTA Button - Claude.ai ghost style */}
              <Button
                className="w-full py-6 h-auto text-base font-medium rounded-lg bg-bg-secondary hover:bg-bg-secondary/80 text-text-primary border border-border-default/60 hover:border-border-default transition-all duration-normal"
                asChild
              >
                <Link href="/signup">{t("free.cta")}</Link>
              </Button>

              {/* Features List - Claude.ai style */}
              <div className="space-y-4 pt-6 border-t border-border-default/60">
                {freeFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-brand/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent-brand" />
                    </div>
                    <span className="text-sm md:text-base text-text-secondary">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pro Plan - Claude.ai featured card */}
          <div className="relative p-6 md:p-8 lg:p-10 rounded-xl border border-accent-brand/20 bg-bg-secondary md:scale-[1.02] transition-all duration-slow hover:shadow-md">
            {/* Badge - Claude.ai subtle badge */}
            <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-3 md:px-4 py-1.5 rounded-full bg-accent-brand text-white text-xs md:text-sm font-medium">
                {t("pro.badge")}
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              {/* Plan Name - Claude.ai typography */}
              <div>
                <h3 className="text-xl md:text-2xl font-medium text-text-primary">
                  {t("pro.name")}
                </h3>
                <p className="text-sm md:text-base text-text-secondary mt-2">
                  {t("pro.description")}
                </p>
              </div>

              {/* Price - Claude.ai style */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-medium text-text-primary">
                  {t("pro.price")}
                </span>
                <span className="text-base text-text-secondary">
                  {t("pro.period")}
                </span>
              </div>

              {/* ROI 메시지 - Claude.ai subtle highlight */}
              <div className="px-4 py-3 rounded-lg bg-accent-brand/5 border border-accent-brand/10">
                <p className="text-xs md:text-sm font-medium text-accent-brand">
                  {t("pro.roi")}
                </p>
              </div>

              {/* CTA Button - Claude.ai primary style */}
              <Button
                className="w-full py-6 h-auto text-base font-medium rounded-lg bg-accent-brand text-white hover:opacity-90 transition-opacity duration-fast"
                asChild
              >
                <Link href="/signup">{t("pro.cta")}</Link>
              </Button>

              {/* Features List - Claude.ai style */}
              <div className="space-y-4 pt-6 border-t border-border-default/60">
                {proFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-brand/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent-brand" />
                    </div>
                    <span className="text-sm md:text-base text-text-secondary">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
