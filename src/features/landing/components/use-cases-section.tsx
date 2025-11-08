"use client";

import { Rocket, BookOpen, Megaphone, TrendingUp } from "lucide-react";

interface UseCase {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const useCases: UseCase[] = [
  {
    icon: <Rocket className="w-6 h-6" />,
    title: "제품 런칭 블로그",
    description: "새로운 제품이나 서비스를 알리는 런칭 블로그를 빠르게 작성하고 SEO 최적화로 더 많은 사람들에게 알립니다.",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "튜토리얼 & 가이드",
    description: "사용자를 위한 상세한 튜토리얼과 가이드 문서를 체계적으로 작성하여 고객 만족도를 높입니다.",
  },
  {
    icon: <Megaphone className="w-6 h-6" />,
    title: "회사 소식 & 업데이트",
    description: "회사의 최신 소식과 제품 업데이트를 일관된 톤으로 전달하여 브랜드 이미지를 강화합니다.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "SEO 콘텐츠 마케팅",
    description: "검색 엔진 상위 노출을 위한 키워드 최적화 콘텐츠를 대량으로 생성하여 트래픽을 증가시킵니다.",
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="w-full bg-[#FCFCFD] py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-3 md:mb-4 px-4">
            다양한 상황에서 활용하세요
          </h2>
          <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto px-4">
            제품 런칭부터 SEO 마케팅까지, 모든 블로그 작성 시나리오를 지원합니다
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="group p-8 rounded-xl border border-[#E1E5EA] bg-white hover:bg-[#F5F7FA] transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#3BA2F8] group-hover:bg-[#3BA2F8] group-hover:text-white transition-all duration-300">
                  {useCase.icon}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold text-[#111827]">
                    {useCase.title}
                  </h3>
                  <p className="text-base text-[#6B7280] leading-relaxed">
                    {useCase.description}
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
