"use client";

import { Sparkles, Search, Palette, Edit3 } from "lucide-react";
import { useTranslations } from "next-intl";

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      titleKey: "ai_generation.title" as const,
      descriptionKey: "ai_generation.description" as const,
    },
    {
      icon: <Search className="w-6 h-6" />,
      titleKey: "seo_keywords.title" as const,
      descriptionKey: "seo_keywords.description" as const,
    },
    {
      icon: <Palette className="w-6 h-6" />,
      titleKey: "brand_voice.title" as const,
      descriptionKey: "brand_voice.description" as const,
    },
    {
      icon: <Edit3 className="w-6 h-6" />,
      titleKey: "realtime_edit.title" as const,
      descriptionKey: "realtime_edit.description" as const,
    },
  ];
  return (
    <section id="features" className="w-full bg-[#FCFCFD] py-16 md:py-20 px-4">
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

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-xl border border-[#E1E5EA] bg-white hover:border-[#3BA2F8] transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex flex-col space-y-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#3BA2F8] group-hover:bg-[#3BA2F8] group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-[#111827]">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-base text-[#6B7280] leading-relaxed">
                    {t(feature.descriptionKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
