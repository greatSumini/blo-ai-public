"use client";

import { Header } from "@/features/landing/components/header";
import { HeroSection } from "@/features/landing/components/hero-section";
import { FeaturesSection } from "@/features/landing/components/features-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { FinalCtaSection } from "@/features/landing/components/final-cta-section";
import { Footer } from "@/features/landing/components/footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-16">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FaqSection />
        <PricingSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
