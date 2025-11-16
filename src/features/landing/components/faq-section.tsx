"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export function FaqSection() {
  const t = useTranslations("landing.faq");

  // FAQ 항목 (6개)
  const faqItems = [
    { questionKey: "q1.question" as const, answerKey: "q1.answer" as const },
    { questionKey: "q2.question" as const, answerKey: "q2.answer" as const },
    { questionKey: "q3.question" as const, answerKey: "q3.answer" as const },
    { questionKey: "q4.question" as const, answerKey: "q4.answer" as const },
    { questionKey: "q5.question" as const, answerKey: "q5.answer" as const },
    { questionKey: "q6.question" as const, answerKey: "q6.answer" as const },
  ];

  return (
    <section id="faq" className="w-full bg-bg-secondary/20 py-20 md:py-28 lg:py-32 px-4 border-t border-border-default/40">
      <div className="max-w-4xl mx-auto">
        {/* Section Header - Claude.ai style */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-text-primary mb-4 md:mb-6 tracking-tight px-4 leading-tight">
            {t("section_title")}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-text-secondary max-w-2xl mx-auto px-4 leading-relaxed">
            {t("section_subtitle")}
          </p>
        </div>

        {/* Accordion - Claude.ai subtle style */}
        <Accordion type="single" collapsible className="w-full space-y-3 md:space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border-default/60 rounded-xl px-5 md:px-6 bg-bg-secondary/50 hover:border-border-default hover:bg-bg-secondary transition-all duration-slow"
            >
              <AccordionTrigger className="text-left text-sm md:text-base lg:text-lg font-medium text-text-primary hover:no-underline py-5 md:py-6">
                {t(item.questionKey)}
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base text-text-secondary leading-relaxed pb-5 md:pb-6">
                {t(item.answerKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
