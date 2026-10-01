import {
  ArrowDown,
  Mail,
  MessageCircle,
} from "lucide-react";

export default function ContactHero() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-navy">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-gold/[0.10] blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-[30rem] w-[30rem] rounded-full bg-white/[0.045] blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/[0.025] blur-3xl"
      />

      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 md:pb-24 md:pt-24 lg:px-8 lg:pb-28 lg:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-brand-gold/20 bg-white/[0.045] px-4 py-2.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-gold opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-gold" />
            </span>

            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-gold sm:text-xs">
              Get in touch
            </span>
          </div>

          {/* Heading */}
          <h1 className="mx-auto max-w-4xl font-sans text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Let&apos;s start a
            <span className="block text-brand-gold">conversation.</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:mt-7 sm:text-base sm:leading-8 md:text-lg">
            Have a question about admissions, programmes, courses, or your
            account? Our team is ready to listen, guide you, and help you find
            the right information.
          </p>

          {/* Quick actions */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:info@itmt.edu.ng"
              className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-brand-gold px-6 text-sm font-semibold text-brand-navy shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d4b961] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy sm:w-auto"
            >
              <Mail className="h-4 w-4" />
              Email our team
            </a>

            <a
              href="#contact-form"
              className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.05] px-6 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy sm:w-auto"
            >
              <MessageCircle className="h-4 w-4 text-brand-gold" />
              Send a message
            </a>
          </div>
        </div>
      </div>

      {/* Bottom scroll cue */}
      <div className="relative flex justify-center pb-7 sm:pb-8">
        <a
          href="#contact-information"
          aria-label="Scroll to contact information"
          className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50 transition-all hover:border-brand-gold/30 hover:text-brand-gold"
        >
          <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
        </a>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
    </section>
  );
}