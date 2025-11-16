"use client";

import { Rocket, BookOpen, Megaphone, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

export function UseCasesSection() {
  const t = useTranslations("landing.use_cases");

  const useCases = [
    {
      icon: <Rocket className="w-6 h-6" />,
      titleKey: "product_launch.title" as const,
      descriptionKey: "product_launch.description" as const,
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      titleKey: "tutorial.title" as const,
      descriptionKey: "tutorial.description" as const,
    },
    {
      icon: <Megaphone className="w-6 h-6" />,
      titleKey: "company_news.title" as const,
      descriptionKey: "company_news.description" as const,
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      titleKey: "seo_marketing.title" as const,
      descriptionKey: "seo_marketing.description" as const,
    },
  ];
  return (
    <section id="use-cases" className="w-full bg-[#FCFCFD] py-16 md:py-20 px-4">
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

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="group p-8 rounded-xl border border-[#E1E5EA] bg-white hover:bg-[#F5F7FA] transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#3BA2F8] group-hover:bg-[#3BA2F8] group-hover:text-white transition-all duration-300">
                  {useCase.icon}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold text-[#111827]">
                    {t(useCase.titleKey)}
                  </h3>
                  <p className="text-base text-[#6B7280] leading-relaxed">
                    {t(useCase.descriptionKey)}
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
