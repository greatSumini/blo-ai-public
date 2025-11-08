"use client";

import { Keyboard, Sparkles, FileEdit, ArrowRight } from "lucide-react";

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: <Keyboard className="w-8 h-8" />,
    title: "키워드 입력",
    description: "주제 키워드와 간단한 설명을 입력하고 원하는 브랜드 보이스를 선택합니다.",
  },
  {
    number: "02",
    icon: <Sparkles className="w-8 h-8" />,
    title: "AI 생성",
    description: "AI가 5분 내에 SEO 최적화된 초안, 제목, 메타데이터를 자동으로 생성합니다.",
  },
  {
    number: "03",
    icon: <FileEdit className="w-8 h-8" />,
    title: "편집 & 완성",
    description: "원스크린 편집기에서 문단별 수정 및 재생성을 통해 완벽한 글을 완성합니다.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full bg-white py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-3 md:mb-4 px-4">
            3단계로 완성하는 블로그 글
          </h2>
          <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto px-4">
            복잡한 과정 없이 간단한 3단계만으로 전문적인 블로그 글을 완성할 수 있습니다
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className="flex flex-col items-center text-center space-y-6 p-8 rounded-xl border border-[#E1E5EA] bg-[#FCFCFD] hover:border-[#3BA2F8] transition-all duration-300">
                {/* Step Number */}
                <div className="text-5xl font-bold text-[#E1E5EA]">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-[#3BA2F8] flex items-center justify-center text-white">
                  {step.icon}
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-[#111827]">
                    {step.title}
                  </h3>
                  <p className="text-base text-[#6B7280] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Arrow between steps (hidden on mobile, last arrow hidden on all screens) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-[#3BA2F8]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Time Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5F7FA] border border-[#E1E5EA]">
            <span className="text-2xl font-bold text-[#3BA2F8]">5분</span>
            <span className="text-base text-[#6B7280]">이내 완성</span>
          </div>
        </div>
      </div>
    </section>
  );
}
