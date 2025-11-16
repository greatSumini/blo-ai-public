"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { fadeUpStagger } from "@/features/landing/lib/animations";
import { TRUST_BADGE_LOGOS } from "@/features/landing/lib/constants";

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden bg-[#FCFCFD]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,162,248,0.05),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-4xl py-12 md:py-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full border border-[#E1E5EA] bg-[#F5F7FA]/50 mb-6 md:mb-8"
          >
            <span className="text-xs font-medium text-[#374151]">
              {t("badge")}
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            custom={1}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 md:mb-6 tracking-tighter text-[#111827] leading-[1.1] px-2">
              {t("heading")}
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.div
            custom={2}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
          >
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#6B7280] mb-8 md:mb-10 max-w-2xl mx-auto font-normal leading-relaxed px-2">
              {t("subheading")}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            custom={3}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            {/* Primary CTA */}
            <Button
              size="lg"
              className="rounded-lg px-8 py-6 text-base font-medium bg-[#3BA2F8] hover:bg-[#2E91E6] hover:shadow-md transition-all duration-200 text-white shadow-sm w-full sm:w-auto"
              asChild
            >
              <Link href="/signup">
                {t("cta.primary")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            {/* Secondary CTA */}
            <Button
              size="lg"
              variant="outline"
              className="rounded-lg px-8 py-6 text-base font-medium border-[#E1E5EA] bg-white hover:bg-[#F5F7FA] text-[#374151] w-full sm:w-auto"
              asChild
            >
              <Link href="#demo">
                <Play className="mr-2 h-5 w-5" />
                {t("cta.secondary")}
              </Link>
            </Button>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            custom={4}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-6"
          >
            <p className="text-sm text-[#6B7280]">{t("trust_badge")}</p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {TRUST_BADGE_LOGOS.map((logo, index) => (
                <div
                  key={index}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={60}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#E1E5EA]" />
    </section>
  );
}
