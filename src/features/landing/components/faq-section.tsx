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
    <section id="faq" className="w-full bg-[#FCFCFD] py-20 md:py-28 lg:py-32 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#111827] mb-4 md:mb-6 tracking-tight px-4">
            {t("section_title")}
          </h2>
          <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto px-4">
            {t("section_subtitle")}
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-[#E1E5EA] rounded-xl px-6 bg-white"
            >
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-[#111827] hover:no-underline py-6">
                {t(item.questionKey)}
              </AccordionTrigger>
              <AccordionContent className="text-base text-[#6B7280] leading-relaxed pb-6">
                {t(item.answerKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
