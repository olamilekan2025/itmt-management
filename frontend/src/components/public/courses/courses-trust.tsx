
import {
  ArrowUpRight,
  CheckCircle2,
  Database,
  LockKeyhole,
  Network,
  ShieldCheck,
} from "lucide-react";

const principles = [
  {
    number: "01",
    title: "Structured Information",
    description:
      "Academic information is arranged into clear, consistent structures that make institutional data easier to understand and manage.",
    icon: Database,
  },
  {
    number: "02",
    title: "Role-Aware Access",
    description:
      "Relevant information and actions are tailored to the responsibilities of students and authorized institutional staff.",
    icon: LockKeyhole,
  },
  {
    number: "03",
    title: "Consistent Records",
    description:
      "A centralized approach supports dependable academic records across connected institutional processes.",
    icon: CheckCircle2,
  },
  {
    number: "04",
    title: "Connected Processes",
    description:
      "Courses connect with programmes, registration, semesters, and results within a coordinated academic workflow.",
    icon: Network,
  },
];

export default function CoursesTrust() {
  return (
    <section className="relative isolate overflow-hidden bg-[#F7F8FA] py-20 sm:py-24 lg:py-15">
      {/* Background details */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-brand-gold/[0.09] blur-[100px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand-navy/[0.06] blur-[100px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-navy/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-9">
        {/* Section heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-brand-gold/30 bg-white/90 px-4 py-2 shadow-sm shadow-slate-900/[0.03]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy/[0.06]">
              <ShieldCheck
                className="h-3.5 w-3.5 text-brand-navy"
                aria-hidden="true"
              />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-brand-navy sm:text-[11px]">
              Built around academic structure
            </span>
          </div>

          <h2 className="text-3xl font-bold leading-[1.15] tracking-[-0.04em] text-brand-navy sm:text-4xl lg:text-[3.25rem]">
            Academic information,
            <span className="mt-1 block text-brand-gold">
              organized with purpose.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:mt-6 sm:text-base sm:leading-8 lg:text-[17px]">
            ITMT brings academic information into a structured environment,
            helping students and authorized staff work with clearer records,
            connected processes, and a more consistent academic experience.
          </p>

          <div
            aria-hidden="true"
            className="mx-auto mt-8 flex items-center justify-center gap-2"
          >
            <span className="h-1 w-8 rounded-full bg-brand-gold" />
            <span className="h-1 w-2 rounded-full bg-brand-navy/20" />
            <span className="h-1 w-2 rounded-full bg-brand-navy/10" />
          </div>
        </div>

        {/* Principles */}
        <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 xl:gap-6">
          {principles.map(({ number, title, description, icon: Icon }) => (
            <article
              key={title}
              className="group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.12)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-[0_20px_45px_-22px_rgba(15,23,42,0.2)] sm:p-7 lg:p-8"
            >
              {/* Soft hover accent */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-brand-gold transition-transform duration-300 group-hover:scale-x-100"
              />

              {/* Card heading */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-navy/[0.07] bg-brand-light text-brand-navy transition-colors duration-300 group-hover:border-brand-navy group-hover:bg-brand-navy group-hover:text-brand-gold sm:h-14 sm:w-14">
                  <Icon
                    className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>

                <span className="pt-1 text-xs font-bold tracking-[0.14em] text-slate-300 transition-colors duration-300 group-hover:text-brand-gold">
                  {number}
                </span>
              </div>

              {/* Card content */}
              <div className="mt-7 flex-1">
                <h3 className="text-lg font-bold tracking-[-0.025em] text-brand-navy sm:text-xl">
                  {title}
                </h3>

                <p className="mt-3 max-w-md text-sm leading-7 text-slate-600 sm:text-[15px]">
                  {description}
                </p>
              </div>

              {/* Bottom detail */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  ITMT Academic System
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-navy"
                  aria-hidden="true"
                />
              </div>
            </article>
          ))}
        </div>

        {/* Closing statement */}
        <div className="mx-auto mt-8 max-w-5xl sm:mt-10">
          <div className="relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-7 shadow-[0_18px_45px_-24px_rgba(27,40,71,0.5)] sm:px-8 sm:py-8 lg:px-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-24 h-56 w-56 rounded-full border border-white/[0.07]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 -top-14 h-36 w-36 rounded-full border border-brand-gold/15"
            />

            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-gold/25 bg-white/[0.06] text-brand-gold">
                <CheckCircle2
                  className="h-6 w-6"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold tracking-[-0.02em] text-white sm:text-lg">
                  One connected academic environment.
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
                  Course information works within the wider ITMT academic
                  management workflow, connecting essential processes instead
                  of treating the course catalogue as an isolated resource.
                </p>
              </div>

              <div className="hidden shrink-0 sm:block">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-brand-gold">
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
