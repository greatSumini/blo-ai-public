"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function FinalCtaSection() {
  const t = useTranslations("landing.cta");
  return (
    <section className="w-full bg-[#1E2A38] py-16 md:py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-6 md:space-y-8">
          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight px-4">
            {t("heading")}
          </h2>

          {/* Subheading */}
          <p className="text-base md:text-lg lg:text-xl text-[#D1D5DB] max-w-2xl mx-auto px-4">
            {t("subheading")}
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="px-8 py-6 text-base font-medium bg-[#3BA2F8] hover:bg-[#3BA2F8]/90 text-white rounded-lg shadow-lg"
              asChild
            >
              <Link href="/signup">
                {t("primary_cta")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-base font-medium bg-transparent hover:bg-white/10 text-white border-2 border-white/20 rounded-lg"
              asChild
            >
              <Link href="/login">{t("secondary_cta")}</Link>
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="pt-8">
            <p className="text-sm text-[#9CA3AF]">
              {t("trust_badge")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
