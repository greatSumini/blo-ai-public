"use client";

import { motion } from "framer-motion";
import { Sparkles, Search, Palette, Edit3 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FEATURE_IMAGES } from "@/features/landing/lib/constants";

interface FeatureHighlightProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stat: string;
  imageSrc: string;
  imageAlt: string;
  position: "left" | "right";
}

function FeatureHighlight({
  icon,
  title,
  description,
  stat,
  imageSrc,
  imageAlt,
  position,
}: FeatureHighlightProps) {
  const isLeft = position === "left";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`flex flex-col ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} gap-8 md:gap-12 items-center`}
    >
      {/* 텍스트 */}
      <div className="flex-1 space-y-6">
        {/* 아이콘 */}
        <div className="w-14 h-14 rounded-xl bg-[#3BA2F8]/10 flex items-center justify-center text-[#3BA2F8]">
          {icon}
        </div>

        {/* 제목 */}
        <h3 className="text-2xl md:text-3xl font-bold text-[#111827]">
          {title}
        </h3>

        {/* 설명 */}
        <p className="text-base md:text-lg text-[#6B7280] leading-relaxed">
          {description}
        </p>

        {/* 통계 */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F7FA] border border-[#E1E5EA]">
          <span className="text-sm font-medium text-[#374151]">{stat}</span>
        </div>
      </div>

      {/* 이미지 */}
      <div className="flex-1">
        <div className="relative rounded-xl overflow-hidden border border-[#E1E5EA] shadow-lg">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={600}
            height={400}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-8 rounded-xl border border-[#E1E5EA] bg-white hover:border-[#3BA2F8] hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col space-y-4">
        {/* 아이콘 */}
        <div className="w-12 h-12 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#3BA2F8] group-hover:bg-[#3BA2F8] group-hover:text-white transition-all duration-300">
          {icon}
        </div>

        {/* 제목 */}
        <h3 className="text-xl font-semibold text-[#111827]">{title}</h3>

        {/* 설명 */}
        <p className="text-base text-[#6B7280] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  return (
    <section id="features" className="w-full bg-[#FCFCFD] py-20 md:py-28 lg:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#111827] mb-4 md:mb-6 tracking-tight px-4">
            {t("section_title")}
          </h2>
          <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto px-4">
            {t("section_subtitle")}
          </p>
        </div>

        {/* 핵심 기능 2개 - 전체 폭 */}
        <div className="space-y-20 mb-20">
          {/* AI 글 생성 */}
          <FeatureHighlight
            icon={<Sparkles className="w-7 h-7" />}
            title={t("ai_generation.title")}
            description={t("ai_generation.description")}
            stat={t("ai_generation.stat")}
            imageSrc={FEATURE_IMAGES.aiGeneration}
            imageAlt="AI 글 생성 화면"
            position="left"
          />

          {/* 키워드 관리 */}
          <FeatureHighlight
            icon={<Search className="w-7 h-7" />}
            title={t("seo_keywords.title")}
            description={t("seo_keywords.description")}
            stat={t("seo_keywords.stat")}
            imageSrc={FEATURE_IMAGES.seoKeywords}
            imageAlt="키워드 관리 화면"
            position="right"
          />
        </div>

        {/* 서브 기능 2개 - 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 브랜드 보이스 */}
          <FeatureCard
            icon={<Palette className="w-6 h-6" />}
            title={t("brand_voice.title")}
            description={t("brand_voice.description")}
          />

          {/* 실시간 편집 */}
          <FeatureCard
            icon={<Edit3 className="w-6 h-6" />}
            title={t("realtime_edit.title")}
            description={t("realtime_edit.description")}
          />
        </div>
      </div>
    </section>
  );
}
