"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { fadeIn } from "@/features/landing/lib/animations";

export function FinalCtaSection() {
  const t = useTranslations("landing.cta");

  return (
    <section className="w-full bg-[#3BA2F8] py-20 md:py-28 lg:py-32 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 px-4">
            {t("heading")}
          </h2>

          {/* Subheading */}
          <p className="text-base md:text-lg text-white/90 mb-8 md:mb-10 max-w-2xl mx-auto px-4">
            {t("subheading")}
          </p>

          {/* Primary CTA */}
          <div className="mb-6">
            <Button
              size="lg"
              className="rounded-lg px-8 py-6 text-base font-medium bg-white hover:bg-[#F5F7FA] hover:shadow-xl transition-all duration-200 text-[#111827] shadow-lg w-full sm:w-auto"
              asChild
            >
              <Link href="/signup">
                {t("primary_cta")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* No credit card required */}
          <p className="text-sm text-white/80">{t("no_credit_card")}</p>
        </motion.div>
      </div>
    </section>
  );
}
