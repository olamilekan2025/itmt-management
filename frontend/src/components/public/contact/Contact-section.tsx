import {
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import ContactForm from "./contact-form";

const benefits = [
  {
    icon: MessageCircle,
    title: "Helpful support",
    description:
      "Get clear answers to questions about admissions, programmes, courses, and the ITMT platform.",
  },
  {
    icon: Clock3,
    title: "Timely response",
    description:
      "Our team aims to respond to enquiries within one business day during office hours.",
  },
  {
    icon: ShieldCheck,
    title: "Direct connection",
    description:
      "Your enquiry goes directly to the ITMT team responsible for supporting our academic community.",
  },
];

export default function ContactSection() {
  return (
    <section
      id="contact-form"
      className="relative overflow-hidden bg-brand-light py-16 sm:py-20 lg:py-28"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-20 h-[28rem] w-[28rem] rounded-full bg-brand-gold/[0.07] blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 bottom-0 h-[32rem] w-[32rem] rounded-full bg-brand-navy/[0.045] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 xl:gap-20">
          {/* Left content */}
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-brand-gold" />

              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-gold sm:text-xs">
                Send us a message
              </p>
            </div>

            <h2 className="mt-5 max-w-xl font-sans text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-[3.25rem]">
              We&apos;re here to help you take the next step.
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Whether you are considering joining ITMT, already part of our
              academic community, or simply looking for more information, our
              team is ready to assist you.
            </p>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
              Tell us what you need and provide a few details about your
              enquiry. We&apos;ll make sure your message reaches the appropriate
              team.
            </p>

            {/* Benefits */}
            <div className="mt-9 space-y-5 sm:mt-10 sm:space-y-6">
              {benefits.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group flex gap-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-brand-gold/30 group-hover:shadow-md">
                      <Icon className="h-[18px] w-[18px] text-brand-navy" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-brand-navy">
                        {item.title}
                      </h3>

                      <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust note */}
            <div className="mt-9 border-t border-slate-200 pt-6 sm:mt-10">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                  <CheckCircle2 className="h-4 w-4 text-brand-gold" />
                </div>

                <p className="text-xs leading-6 text-slate-500 sm:text-sm">
                  Your enquiry is important to us. Please provide accurate
                  contact details so our team can reach you without delay.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="min-w-0">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}