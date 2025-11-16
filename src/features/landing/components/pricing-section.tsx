"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function PricingSection() {
  const t = useTranslations("landing.pricing");
  return (
    <section id="pricing" className="w-full bg-white py-16 md:py-20 px-4">
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="relative p-6 md:p-8 rounded-xl border border-[#E1E5EA] bg-white transition-all duration-300">
            <div className="space-y-6">
              {/* Plan Name */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#111827]">
                  {t("free.name")}
                </h3>
                <p className="text-sm text-[#6B7280] mt-2">
                  {t("free.description")}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-bold text-[#111827]">
                  {t("free.price")}
                </span>
                <span className="text-base md:text-lg text-[#6B7280]">
                  / {t("free.period")}
                </span>
              </div>

              {/* CTA Button */}
              <Button
                className="w-full py-6 text-base font-medium rounded-lg bg-[#F5F7FA] hover:bg-[#E1E5EA] text-[#111827] border border-[#E1E5EA]"
                asChild
              >
                <Link href="/signup">{t("free.cta")}</Link>
              </Button>

              {/* Features List */}
              <div className="space-y-4 pt-6 border-t border-[#E1E5EA]">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3BA2F8]/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#3BA2F8]" />
                    </div>
                    <span className="text-base text-[#374151]">
                      {t(`free.features.${i}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative p-6 md:p-8 rounded-xl border border-[#3BA2F8] shadow-xl md:scale-105 bg-white transition-all duration-300">
            {/* Highlighted Badge */}
            <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-[#3BA2F8] text-white text-xs md:text-sm font-medium">
                {t("pro.badge")}
              </div>
            </div>

            <div className="space-y-6">
              {/* Plan Name */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#111827]">
                  {t("pro.name")}
                </h3>
                <p className="text-sm text-[#6B7280] mt-2">
                  {t("pro.description")}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-bold text-[#111827]">
                  {t("pro.price")}
                </span>
                <span className="text-base md:text-lg text-[#6B7280]">
                  / {t("pro.period")}
                </span>
              </div>

              {/* CTA Button */}
              <Button
                className="w-full py-6 text-base font-medium rounded-lg bg-[#3BA2F8] hover:bg-[#3BA2F8]/90 text-white"
                asChild
              >
                <Link href="/signup">{t("pro.cta")}</Link>
              </Button>

              {/* Features List */}
              <div className="space-y-4 pt-6 border-t border-[#E1E5EA]">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3BA2F8]/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#3BA2F8]" />
                    </div>
                    <span className="text-base text-[#374151]">
                      {t(`pro.features.${i}`)}
                    </span>
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
