"use client";

import { HeroSection } from "@/features/landing/components/hero-section";
import { FeaturesSection } from "@/features/landing/components/features-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { UseCasesSection } from "@/features/landing/components/use-cases-section";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { FinalCtaSection } from "@/features/landing/components/final-cta-section";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FCFCFD]">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <UseCasesSection />
      <PricingSection />
      <FinalCtaSection />
    </main>
  );
}
