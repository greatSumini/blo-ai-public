"use client";

import { Sparkles, Search, Palette, Edit3 } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "AI 자동 생성",
    description: "1,500~2,500단어의 고품질 블로그 글을 AI가 자동으로 작성합니다. 키워드만 입력하면 전문적인 글이 완성됩니다.",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "SEO 키워드 & 메타데이터",
    description: "검색 엔진 최적화를 위한 키워드, 메타 디스크립션, H 태그 구조가 자동으로 삽입되어 검색 노출을 극대화합니다.",
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: "브랜드 보이스 커스터마이징",
    description: "당신만의 브랜드 톤과 스타일을 설정하여 일관된 브랜드 보이스로 콘텐츠를 생성할 수 있습니다.",
  },
  {
    icon: <Edit3 className="w-6 h-6" />,
    title: "실시간 편집 & 재생성",
    description: "문단별로 실시간 수정 및 재생성이 가능합니다. 원하는 부분만 골라서 다시 생성할 수 있습니다.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="w-full bg-[#FCFCFD] py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-3 md:mb-4 px-4">
            강력한 기능으로 콘텐츠 생성을 간편하게
          </h2>
          <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto px-4">
            AI 기반 자동 생성부터 SEO 최적화까지, 블로그 글 작성에 필요한 모든 기능을 제공합니다
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
                    {feature.title}
                  </h3>
                  <p className="text-base text-[#6B7280] leading-relaxed">
                    {feature.description}
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
