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
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} gap-12 md:gap-16 lg:gap-20 items-center`}
    >
      {/* 텍스트 */}
      <div className="flex-1 space-y-6 md:space-y-8">
        {/* 아이콘 - accent-brand color */}
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-accent-brand/10 flex items-center justify-center text-accent-brand">
          {icon}
        </div>

        {/* 제목 - Claude.ai typography */}
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-text-primary tracking-tight leading-tight">
          {title}
        </h3>

        {/* 설명 - Claude.ai muted text */}
        <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-xl">
          {description}
        </p>

        {/* 통계 - accent-brand subtle badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-brand/5 border border-accent-brand/20">
          <span className="text-xs md:text-sm font-medium text-accent-brand">{stat}</span>
        </div>
      </div>

      {/* 이미지 - Claude.ai subtle shadow */}
      <div className="flex-1 w-full">
        <div className="relative rounded-xl overflow-hidden border border-border-default/60 shadow-sm hover:shadow-md transition-all duration-slow group">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={600}
            height={400}
            className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-slower"
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
    <div className="group p-6 md:p-8 rounded-xl border border-border-default/60 bg-bg-secondary/50 hover:border-accent-brand/20 hover:bg-bg-secondary hover:shadow-sm transition-all duration-slow">
      <div className="flex flex-col space-y-4 md:space-y-5">
        {/* 아이콘 - accent-brand color */}
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-accent-brand/10 flex items-center justify-center text-accent-brand group-hover:bg-accent-brand/15 transition-all duration-normal">
          {icon}
        </div>

        {/* 제목 - Claude.ai typography */}
        <h3 className="text-lg md:text-xl font-medium text-text-primary">{title}</h3>

        {/* 설명 - Claude.ai muted text */}
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  return (
    <section id="features" className="w-full bg-bg-primary py-20 md:py-28 lg:py-32 px-4 border-t border-border-default/40">
      <div className="max-w-7xl mx-auto">
        {/* Section Header - Claude.ai style */}
        <div className="text-center mb-16 md:mb-20 lg:mb-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-text-primary mb-4 md:mb-6 tracking-tight px-4 leading-tight">
            {t("section_title")}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto px-4 leading-relaxed">
            {t("section_subtitle")}
          </p>
        </div>

        {/* 핵심 기능 2개 - 전체 폭 */}
        <div className="space-y-24 md:space-y-32 mb-24 md:mb-32">
          {/* AI 글 생성 */}
          <FeatureHighlight
            icon={<Sparkles className="w-6 h-6 md:w-7 md:h-7" />}
            title={t("ai_generation.title")}
            description={t("ai_generation.description")}
            stat={t("ai_generation.stat")}
            imageSrc={FEATURE_IMAGES.aiGeneration}
            imageAlt="AI 글 생성 화면"
            position="left"
          />

          {/* 키워드 관리 */}
          <FeatureHighlight
            icon={<Search className="w-6 h-6 md:w-7 md:h-7" />}
            title={t("seo_keywords.title")}
            description={t("seo_keywords.description")}
            stat={t("seo_keywords.stat")}
            imageSrc={FEATURE_IMAGES.seoKeywords}
            imageAlt="키워드 관리 화면"
            position="right"
          />
        </div>

        {/* 서브 기능 2개 - 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* 브랜드 보이스 */}
          <FeatureCard
            icon={<Palette className="w-5 h-5 md:w-6 md:h-6" />}
            title={t("brand_voice.title")}
            description={t("brand_voice.description")}
          />

          {/* 실시간 편집 */}
          <FeatureCard
            icon={<Edit3 className="w-5 h-5 md:w-6 md:h-6" />}
            title={t("realtime_edit.title")}
            description={t("realtime_edit.description")}
          />
        </div>
      </div>
    </section>
  );
}
