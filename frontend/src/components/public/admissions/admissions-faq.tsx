"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who can apply for admission?",
    answer:
      "Admission eligibility criteria are determined by the institution based on programme requirements and academic policies. Specific eligibility information will be published according to the institution's current admissions configuration.",
  },
  {
    question: "Where can I view available courses?",
    answer:
      "You can explore available courses and programmes on the Courses page, which provides information about the academic offerings across departments and disciplines.",
  },
  {
    question: "How do I begin an application?",
    answer:
      "To begin your application, create an account through the authentication portal. Once registered, you can access the application system and follow the configured application process for your intended programme.",
  },
  {
    question: "Can I check my application status?",
    answer:
      "If the institution's admissions system includes status tracking, you can access your application status through your student portal. The availability of this feature depends on the current admissions configuration.",
  },
  {
    question: "Where can I get more information?",
    answer:
      "For additional information, you can contact the institution through the Contact page or reach out to the admissions office directly using the contact details provided.",
  },
];

export default function AdmissionsFaq() {
  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-slate-50 py-24">
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-brand-blue/5 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-navy shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            Help centre
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            Frequently asked questions
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Find answers to common questions about the ITMT admissions
            process.
          </p>
        </div>

        <div className="mt-14 rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-5">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`item-${index}`}
                className="border-b border-slate-100 px-4 last:border-b-0 sm:px-6"
              >
                <AccordionTrigger className="py-6 text-left text-base font-bold text-brand-navy hover:no-underline hover:text-brand-blue [&>svg]:text-brand-gold">
                  <span className="flex items-center gap-4">
                    <span className="hidden text-xs font-bold tracking-wider text-brand-gold sm:inline">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {faq.question}
                  </span>
                </AccordionTrigger>

                <AccordionContent className="max-w-3xl pb-6 pr-4 text-sm leading-7 text-slate-600 sm:pl-10">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
