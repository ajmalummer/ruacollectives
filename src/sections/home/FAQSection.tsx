'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faqItems } from '@/data/faq';

export default function FAQSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-playfair text-3xl text-center text-gray-900 mb-10">
          FAQ
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-gray-300"
            >
              <AccordionTrigger className="font-inter text-base text-gray-900 hover:no-underline py-5">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="font-inter text-sm text-gray-600 leading-relaxed pb-5">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
