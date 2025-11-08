"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  badge?: string;
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryText?: string;
}

export function HeroSection({
  badge = "AI 블로그 작성 도구",
  heading = "5분 안에 SEO 최적화된 블로그 글 완성",
  subheading = "인디해커와 솔로 창업자를 위한 AI 블로그 작성 도구. 키워드만 입력하면 영어·한국어 블로그 글과 SEO 메타데이터가 자동으로 완성됩니다.",
  ctaText = "무료로 시작하기",
  ctaUrl = "/signup",
  secondaryText = "3편까지 무료",
}: HeroSectionProps) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.15,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-[#FCFCFD]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,42,56,0.03),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-4xl py-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E1E5EA] bg-[#F5F7FA]/50 mb-8"
          >
            <span className="text-xs font-medium text-[#374151]">
              {badge}
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-[#111827] leading-tight">
              {heading}
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-base sm:text-lg md:text-xl text-[#6B7280] mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
              {subheading}
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-3"
          >
            <Button
              size="lg"
              className="rounded-lg px-8 py-6 text-base font-medium bg-[#3BA2F8] hover:bg-[#3BA2F8]/90 text-white shadow-sm"
              asChild
            >
              <Link href={ctaUrl}>
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            {/* Secondary text */}
            {secondaryText && (
              <p className="text-sm text-[#6B7280]">
                {secondaryText}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#E1E5EA]" />
    </section>
  );
}
