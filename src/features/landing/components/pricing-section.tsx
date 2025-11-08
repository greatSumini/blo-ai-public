"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaUrl: string;
  highlighted?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "무료 플랜",
    price: "₩0",
    period: "영구 무료",
    description: "서비스를 체험하고 시작하기에 완벽합니다",
    features: [
      "3편까지 블로그 글 생성",
      "모든 기능 사용 가능",
      "AI 자동 생성",
      "SEO 최적화",
      "브랜드 보이스 1개",
      "마크다운 내보내기",
    ],
    cta: "무료로 시작하기",
    ctaUrl: "/signup",
    highlighted: false,
  },
  {
    name: "프로 플랜",
    price: "$19",
    period: "월",
    description: "진지하게 콘텐츠를 만드는 분들을 위한 플랜",
    features: [
      "무제한 블로그 글 생성",
      "모든 기능 사용 가능",
      "브랜드 보이스 3개",
      "우선 지원",
      "향후 신규 기능 우선 접근",
      "고급 SEO 분석",
    ],
    cta: "프로 시작하기",
    ctaUrl: "/signup",
    highlighted: true,
  },
];

export function PricingSection() {
  return (
    <section className="w-full bg-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">
            간단하고 투명한 가격
          </h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            무료로 시작해서 필요할 때 업그레이드하세요. 숨겨진 비용은 없습니다
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-xl border ${
                plan.highlighted
                  ? "border-[#3BA2F8] shadow-xl scale-105"
                  : "border-[#E1E5EA]"
              } bg-white transition-all duration-300`}
            >
              {/* Highlighted Badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1.5 rounded-full bg-[#3BA2F8] text-white text-sm font-medium">
                    추천
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Plan Name */}
                <div>
                  <h3 className="text-2xl font-bold text-[#111827]">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[#6B7280] mt-2">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[#111827]">
                    {plan.price}
                  </span>
                  <span className="text-lg text-[#6B7280]">
                    / {plan.period}
                  </span>
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full py-6 text-base font-medium rounded-lg ${
                    plan.highlighted
                      ? "bg-[#3BA2F8] hover:bg-[#3BA2F8]/90 text-white"
                      : "bg-[#F5F7FA] hover:bg-[#E1E5EA] text-[#111827] border border-[#E1E5EA]"
                  }`}
                  asChild
                >
                  <Link href={plan.ctaUrl}>{plan.cta}</Link>
                </Button>

                {/* Features List */}
                <div className="space-y-4 pt-6 border-t border-[#E1E5EA]">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3BA2F8]/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#3BA2F8]" />
                      </div>
                      <span className="text-base text-[#374151]">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
