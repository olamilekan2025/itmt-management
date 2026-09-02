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
    title: "A trusted institution",
    description:
      "Connect directly with ITMT and receive information from the people responsible for supporting our community.",
  },
];

export default function ContactSection() {
  return (
    <section className="relative overflow-hidden bg-brand-light py-20 sm:py-24 lg:py-28">
      {/* Decorative background elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-brand-gold/[0.08] blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand-navy/[0.05] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-20">
          {/* LEFT CONTENT */}
          <div className="lg:sticky lg:top-24">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-gold" />

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">
                Get in touch
              </p>
            </div>

            {/* Heading */}
            <h2 className="mt-6 max-w-xl font-sans text-4xl font-semibold leading-[1.08] tracking-tight text-brand-navy sm:text-5xl lg:text-[3.4rem]">
              We&apos;re here to help you take the next step.
            </h2>

            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Whether you are considering joining ITMT, already part of our
              academic community, or simply looking for more information,
              our team is ready to assist you.
            </p>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
              Send us your enquiry and provide a few details about what you
              need. We&apos;ll make sure your message reaches the right team
              and respond as soon as possible.
            </p>

            {/* Benefits */}
            <div className="mt-10 space-y-6">
              {benefits.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group flex gap-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-navy/10 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-brand-gold/30 group-hover:shadow-md">
                      <Icon className="h-5 w-5 text-brand-navy" />
                    </div>

                    <div>
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

            {/* Trust message */}
            <div className="mt-10 border-t border-slate-200 pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" />

                <p className="text-sm leading-6 text-slate-500">
                  Your enquiry is important to us. Please provide accurate
                  contact details so our team can reach you without delay.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}