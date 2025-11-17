"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { nanumMyeongjo } from "@/constants/fonts";

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  period: string;
  cta: string;
  features: string[];
  featured?: boolean;
  badge?: string;
  roi?: string;
}

function PricingCard({
  name,
  description,
  price,
  period,
  cta,
  features,
  featured = false,
  badge,
  roi,
}: PricingCardProps) {
  return (
    <div
      className={`relative p-6 md:p-8 lg:p-10 rounded-xl border transition-all duration-slow ${
        featured
          ? "border-accent-brand/20 bg-bg-secondary md:scale-[1.02] hover:shadow-md"
          : "border-border-default/60 bg-bg-secondary/50 hover:border-border-default hover:bg-bg-secondary hover:shadow-sm"
      }`}
    >
      {/* Badge - featured 플랜에만 표시 */}
      {featured && badge && (
        <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
          <div className="px-3 md:px-4 py-1.5 rounded-full bg-accent-brand text-white text-xs md:text-sm font-medium">
            {badge}
          </div>
        </div>
      )}

      <div className="space-y-6 md:space-y-8">
        {/* Plan Name */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-text-primary">
            {name}
          </h3>
          <p className="text-sm md:text-base text-text-secondary mt-2">
            {description}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-medium text-text-primary">
            {price}
          </span>
          <span className="text-base text-text-secondary">{period}</span>
        </div>

        {/* ROI 메시지 - featured 플랜에만 표시 */}
        {featured && roi && (
          <div className="px-4 py-3 rounded-lg bg-accent-brand/5 border border-accent-brand/10">
            <p className="text-xs md:text-sm font-medium text-accent-brand">
              {roi}
            </p>
          </div>
        )}

        {/* CTA Button */}
        <Button
          className={`w-full py-6 h-auto text-base font-medium rounded-lg transition-all ${
            featured
              ? "bg-accent-brand text-white hover:opacity-90 duration-fast"
              : "bg-bg-secondary hover:bg-bg-secondary/80 text-text-primary border border-border-default/60 hover:border-border-default duration-normal"
          }`}
          asChild
        >
          <Link href="/signup">{cta}</Link>
        </Button>

        {/* Features List */}
        <div className="space-y-4 pt-6 border-t border-border-default/60">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-brand/10 flex items-center justify-center">
                <Check className="w-3 h-3 text-accent-brand" />
              </div>
              <span className="text-sm md:text-base text-text-secondary">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PricingSection() {
  const t = useTranslations("landing.pricing");

  // Free 플랜 features
  const freeFeatures = [
    t("free.features.articles"),
    t("free.features.keywords"),
    t("free.features.brandings"),
  ];

  // Pro 플랜 features
  const proFeatures = [
    t("pro.features.articles"),
    t("pro.features.keywords"),
    t("pro.features.brandings"),
    t("pro.features.priority_support"),
  ];

  return (
    <section
      id="pricing"
      className="w-full bg-bg-primary py-20 md:py-28 lg:py-32 px-4 border-t border-border-default/40"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header - Claude.ai style */}
        <div className="text-center mb-16 md:mb-20 lg:mb-24">
          <h2
            className={cn(
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-text-primary mb-4 md:mb-6 tracking-tight px-4 leading-tight",
              nanumMyeongjo.className
            )}
          >
            {t("section_title")}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto px-4 leading-relaxed">
            {t("section_subtitle")}
          </p>
        </div>

        {/* Pricing Cards - Claude.ai style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <PricingCard
            name={t("free.name")}
            description={t("free.description")}
            price={t("free.price")}
            period={t("free.period")}
            cta={t("free.cta")}
            features={freeFeatures}
          />

          {/* Pro Plan */}
          <PricingCard
            name={t("pro.name")}
            description={t("pro.description")}
            price={t("pro.price")}
            period={t("pro.period")}
            cta={t("pro.cta")}
            features={proFeatures}
            featured
            badge={t("pro.badge")}
            roi={t("pro.roi")}
          />
        </div>
      </div>
    </section>
  );
}
