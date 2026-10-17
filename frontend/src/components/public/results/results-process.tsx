import {
  FileText,
  LayoutDashboard,
  LogIn,
  TrendingUp,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: LogIn,
    title: "Sign in to your account",
    description:
      "Access the ITMT platform using your verified student credentials.",
  },
  {
    number: "02",
    icon: LayoutDashboard,
    title: "Navigate to results",
    description:
      "Go to your student dashboard and open your academic results section.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Browse your results",
    description:
      "View your results organized by semester with scores, grades, and course details.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Track your progress",
    description:
      "Review your academic performance across semesters and sessions.",
  },
];

export default function ResultsProcess() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="results-process-heading"
      className="relative isolate overflow-hidden bg-[#FAFAFA] py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -right-32 -top-32 h-[26rem] w-[26rem] rounded-full bg-brand-gold/[0.07] blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-slate-200/60 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-gold/[0.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-navy sm:text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            Simple and secure
          </p>

          <h2
            id="results-process-heading"
            className="text-3xl font-bold tracking-[-0.04em] text-brand-navy sm:text-4xl lg:text-5xl"
          >
            How result access works
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base sm:leading-8">
            Access your academic results securely through the ITMT student
            portal in four straightforward steps.
          </p>
        </div>

        {/* Steps */}
        <ol className="relative mx-auto mt-14 grid max-w-6xl gap-8 sm:mt-16 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:mt-20 lg:grid-cols-4 lg:gap-8">
          {/* Mobile timeline */}
          <span
            aria-hidden="true"
            className="absolute bottom-8 left-7 top-8 w-px bg-gradient-to-b from-brand-gold/60 via-slate-200 to-transparent sm:hidden"
          />

          {/* Desktop timeline */}
          <span
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-gradient-to-r from-brand-gold/60 via-slate-300 to-brand-gold/40 lg:block"
          />

          {steps.map(({ number, icon: Icon, title, description }) => (
            <li
              key={number}
              className="group relative flex gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 transition-colors duration-200 hover:border-brand-gold/50 sm:p-6 lg:flex-col lg:gap-7 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0"
            >
              {/* Step icon */}
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-brand-gold/40 bg-white text-brand-navy shadow-[0_3px_14px_rgba(27,40,71,0.06)] transition-colors duration-200 group-hover:border-brand-navy group-hover:bg-brand-navy group-hover:text-brand-gold">
                <Icon
                  size={22}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>

              {/* Step content */}
              <div className="relative min-w-0 pb-1 lg:pr-2">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-3 right-0 hidden select-none text-7xl font-bold leading-none tracking-tighter text-brand-navy/[0.045] lg:block"
                >
                  {number}
                </span>

                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-gold">
                  Step {number}
                </p>

                <h3 className="mt-2 text-lg font-bold tracking-[-0.025em] text-brand-navy sm:text-xl">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-[15px]">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
