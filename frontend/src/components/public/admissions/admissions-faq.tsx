import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who can apply for admission?",
    answer: "Admission eligibility criteria are determined by the institution based on programme requirements and academic policies. Specific eligibility information will be published according to the institution's current admissions configuration.",
  },
  {
    question: "Where can I view available courses?",
    answer: "You can explore available courses and programmes on the Courses page, which provides information about the academic offerings across departments and disciplines.",
  },
  {
    question: "How do I begin an application?",
    answer: "To begin your application, create an account through the authentication portal. Once registered, you can access the application system and follow the configured application process for your intended programme.",
  },
  {
    question: "Can I check my application status?",
    answer: "If the institution's admissions system includes status tracking, you can access your application status through your student portal. The availability of this feature depends on the current admissions configuration.",
  },
  {
    question: "Where can I get more information?",
    answer: "For additional information, you can contact the institution through the Contact page or reach out to the admissions office directly using the contact details provided.",
  },
];

export default function AdmissionsFaq() {
  return (
    <section className="py-16 bg-brand-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-sans text-3xl font-semibold leading-tight text-brand-navy sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Find answers to common questions about the admissions process.
          </p>
        </div>

        <div className="mt-12 mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-slate-200">
                <AccordionTrigger className="text-left text-base font-medium text-brand-navy hover:text-brand-navy/80">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-6 text-slate-600">
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
