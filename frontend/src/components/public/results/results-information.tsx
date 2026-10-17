import { BookOpen, Layers3, Shield, Zap } from "lucide-react";

const principles = [
  {
    icon: Zap,
    title: "Accurate Records",
    description:
      "Results reflect grades and scores recorded by course lecturers and validated by academic administration.",
  },
  {
    icon: Shield,
    title: "Role-Aware Access",
    description:
      "Only authenticated students can view their own results. Results are organized by institution configuration.",
  },
  {
    icon: Layers3,
    title: "Structured Results",
    description:
      "Results are organized by semester and session, with course details including credit units and grades.",
  },
  {
    icon: BookOpen,
    title: "Clear Academic History",
    description:
      "Access your complete academic record across semesters and sessions on the ITMT platform.",
  },
];

export default function ResultsInformation() {
  return (
    <section className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      {/* Subtle decorative background */}
      {/* <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-brand-gold/[0.06] blur-3xl" />
        <div className="absolute -right-40 top-0 h-80 w-80 rounded-full bg-slate-100/80 blur-3xl" />
      </div> */}

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
          {/* Introduction */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-gold/[0.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-navy sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
              Academic excellence
            </p>

            <h2 className="mt-6 text-3xl font-bold leading-[1.12] tracking-[-0.04em] text-brand-navy sm:text-4xl lg:text-5xl">
              Academic results,
              <span className="mt-1 block text-brand-gold">
                organized clearly.
              </span>
            </h2>

            <div
              aria-hidden="true"
              className="mt-6 h-1 w-14 rounded-full bg-brand-gold"
            />

            <div className="mt-6 max-w-lg space-y-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              <p>
                ITMT provides a structured environment for students and
                authorized institutional users to work with academic result
                information.
              </p>

              <p>
                Access your academic performance data through a platform
                designed to support clarity, accessibility, and the privacy
                of sensitive academic information.
              </p>
            </div>
          </div>

          {/* Original card design preserved */}
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            {principles.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="group relative flex flex-col rounded-2xl border border-slate-200/80 border-t-[3px] border-t-brand-gold bg-white p-7 shadow-[0_2px_4px_rgba(15,23,42,0.025),0_12px_28px_-16px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-t-brand-navy hover:shadow-[0_22px_42px_-20px_rgba(15,23,42,0.18)] sm:p-8"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-navy/[0.055] text-brand-navy ring-1 ring-inset ring-brand-navy/[0.04] transition-colors duration-300 group-hover:bg-brand-navy group-hover:text-brand-gold">
                  <Icon
                    size={24}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>

                <h3 className="mt-6 text-lg font-bold tracking-[-0.025em] text-brand-navy sm:text-xl">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-[15px]">
                  {description}
                </p>

                <div
                  aria-hidden="true"
                  className="mt-6 h-px w-full bg-slate-100 transition-colors duration-300 group-hover:bg-brand-gold/30"
                />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
