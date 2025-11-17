"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { fadeUpStagger } from "@/features/landing/lib/animations";
import { TRUST_BADGE_LOGOS } from "@/features/landing/lib/constants";
import { cn } from "@/lib/utils";
import { nanumMyeongjo } from "@/constants/fonts";

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden bg-bg-primary">
      {/* Subtle background gradient - Claude.ai style */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.05),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-5xl py-16 md:py-24 lg:py-32">
        <div className="text-center">
          {/* Badge - Claude.ai inspired subtle design */}
          <motion.div
            custom={0}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-default bg-bg-secondary/40 mb-8 md:mb-10 backdrop-blur-sm hover:border-border-default transition-colors duration-slow"
          >
            <span className="text-xs md:text-sm font-bold text-text-secondary">
              {t("badge")}
            </span>
          </motion.div>

          {/* Main Heading - Claude.ai style typography */}
          <motion.div
            custom={1}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
          >
            <h1
              className={cn(
                "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 text-text-primary leading-[1.15] px-2 whitespace-pre-line",
                nanumMyeongjo.className
              )}
            >
              {t("heading")}
            </h1>
          </motion.div>

          {/* Subheading - Claude.ai style muted text */}
          <motion.div
            custom={2}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
          >
            <p className="text-base sm:text-lg md:text-xl text-text-secondary mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              {t("subheading")}
            </p>
          </motion.div>

          {/* CTA Buttons - Claude.ai style with accent-brand */}
          <motion.div
            custom={3}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 md:mb-20"
          >
            {/* Primary CTA - accent-brand color (#C46849) */}
            <Button
              size="lg"
              className="rounded-lg px-8 py-6 h-auto text-base font-medium bg-accent-brand text-white hover:opacity-90 transition-opacity duration-fast w-full sm:w-auto"
              asChild
            >
              <Link href="/signup">
                {t("cta.primary")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            {/* Secondary CTA - Claude.ai ghost style */}
            <Button
              size="lg"
              variant="outline"
              className="rounded-lg px-8 py-6 h-auto text-base font-medium border-border-default/60 bg-transparent hover:bg-bg-secondary hover:border-border-default text-text-primary transition-all duration-normal w-full sm:w-auto"
              asChild
            >
              <Link href="#demo">
                <Play className="mr-2 h-5 w-5" />
                {t("cta.secondary")}
              </Link>
            </Button>
          </motion.div>

          {/* Trust Badge - Claude.ai subtle style */}
          <motion.div
            custom={4}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-8"
          >
            <p className="text-xs md:text-sm text-text-tertiary">
              {t("trust_badge")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {TRUST_BADGE_LOGOS.map((logo, index) => (
                <div
                  key={index}
                  className="opacity-40 hover:opacity-70 transition-opacity duration-slow grayscale hover:grayscale-0"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={60}
                    className="object-contain h-8 md:h-10 w-auto"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom border - subtle */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border-default/40" />
    </section>
  );
}
