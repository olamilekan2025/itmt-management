"use client";

import { HelpCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How can I access my academic results?",
    answer:
      "Sign in to your verified student account on the ITMT platform. Navigate to your student dashboard and access the Results section to view your academic results organized by semester and session.",
  },
  {
    question: "Can anyone view my academic results?",
    answer:
      "No. Only you can view your own academic results when you are logged in with your authenticated student account. Your results are protected by ITMT's access control system.",
  },
  {
    question: "When will my results be available?",
    answer:
      "Results are made available after they have been submitted by lecturers and published by academic administrators. Your institution controls when results become visible. If you don't see results for a course or semester, they may not yet be published.",
  },
  {
    question: "What does each grade mean?",
    answer:
      "ITMT uses the following grading scale: A (70-100), B (60-69), C (50-59), D (45-49), E (40-44), F (Below 40). Grades are automatically calculated based on your scores by the system.",
  },
  {
    question: "Can I access results from previous semesters?",
    answer:
      "Yes. The ITMT Results section shows all published results across all semesters and sessions. You can filter by semester to view specific periods.",
  },
  {
    question: "What is a credit unit?",
    answer:
      "Credit units represent the academic weight of a course. Most courses are 3 credit units. The total credit units you complete contribute to your overall academic progress and cumulative academic record.",
  },
  {
    question: "How is GPA calculated?",
    answer:
      "Your Semester GPA is calculated by taking the weighted average of your grades based on course credit units. Higher grades and more credit units have more weight in your GPA calculation.",
  },
  {
    question: "What should I do if I notice an error in my results?",
    answer:
      "Contact your course lecturer or academic administrator if you believe there is an error in your results. They can review and make corrections through the ITMT administrative system.",
  },
];

export default function ResultsFaq() {
  return (
    <section
      aria-labelledby="results-faq-heading"
      className="relative overflow-hidden bg-[#FFFFFF] py-20 sm:py-24 lg:py-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-brand-gold/[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="results-faq-heading"
            className="text-3xl font-bold tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl"
          >
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Find answers to common questions about accessing and understanding
            your academic results.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200/80 border-t-[3px] border-t-brand-gold bg-white px-2 py-2 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_24px_60px_-30px_rgba(15,23,42,0.25)] sm:px-4">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`item-${index}`}
                className="border-b border-slate-100 px-4 last:border-b-0 sm:px-6"
              >
                <AccordionTrigger className="py-5 text-left text-base font-bold text-brand-navy hover:text-brand-blue hover:no-underline sm:py-6 sm:text-lg [&>svg]:text-brand-gold">
                  {faq.question}
                </AccordionTrigger>

                <AccordionContent className="max-w-3xl pb-6 pr-4 text-[15px] leading-7 text-slate-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-8 flex items-start gap-4 rounded-2xl border border-slate-200/80 border-l-[3px] border-l-brand-gold bg-[#FAFAFA] p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-[#8A6D1F]">
            <HelpCircle size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-bold text-brand-navy">Have more questions?</h3>
            <p className="mt-1 text-[15px] leading-7 text-slate-600">
              Contact the ITMT Support Team or your academic advisor for
              assistance with any questions about your results or the ITMT
              system.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}