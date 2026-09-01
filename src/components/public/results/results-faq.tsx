"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ResultsFaq() {
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

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Find answers to common questions about accessing and understanding your academic results.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-xl border border-slate-200 bg-white px-6 data-[state=open]:border-brand-gold"
            >
              <AccordionTrigger className="py-4 hover:text-brand-navy text-left font-semibold text-brand-navy">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-8">
          <h3 className="text-lg font-semibold text-brand-navy mb-2">
            Have more questions?
          </h3>
          <p className="text-slate-600">
            Contact the ITMT Support Team or your academic advisor for assistance with any questions about your results or the ITMT system.
          </p>
        </div>
      </div>
    </section>
  );
}
