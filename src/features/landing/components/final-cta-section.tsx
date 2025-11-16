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
    <section className="w-full bg-accent-brand py-20 md:py-28 lg:py-32 px-4 border-t border-border-default/10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Heading - Claude.ai style */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-6 md:mb-8 px-4 tracking-tight leading-tight">
            {t("heading")}
          </h2>

          {/* Subheading - Claude.ai style */}
          <p className="text-base md:text-lg lg:text-xl text-white/80 mb-10 md:mb-12 max-w-2xl mx-auto px-4 leading-relaxed">
            {t("subheading")}
          </p>

          {/* Primary CTA - Claude.ai inverted style */}
          <div className="mb-8">
            <Button
              size="lg"
              className="rounded-lg px-8 py-6 h-auto text-base font-medium bg-white text-accent-brand hover:opacity-90 transition-opacity duration-fast w-full sm:w-auto"
              asChild
            >
              <Link href="/signup">
                {t("primary_cta")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* No credit card required - Claude.ai subtle text */}
          <p className="text-xs md:text-sm text-white/70">{t("no_credit_card")}</p>
        </motion.div>
      </div>
    </section>
  );
}
