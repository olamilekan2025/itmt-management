
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Search,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Explore programmes",
    description:
      "Discover programmes that align with your interests and academic goals.",
  },
  {
    number: "02",
    icon: FileText,
    title: "Apply to ITMT",
    description:
      "Prepare your information and begin your admission application.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Application review",
    description:
      "Your submitted application goes through the admission review process.",
  },
  {
    number: "04",
    icon: GraduationCap,
    title: "Begin your journey",
    description:
      "Take the next step towards your educational and career ambitions.",
  },
];

const highlights = [
  "Explore programmes",
  "Review requirements",
  "Start your application",
];

export default function AdmissionsHero() {
  return (
    <section
      aria-labelledby="admissions-hero-title"
      className="relative isolate overflow-hidden border-b border-slate-200/70 bg-[#FAFAFA]"
    >
      {/* Minimal background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-48 left-1/2 h-[34rem] w-[48rem] -translate-x-1/2 rounded-full bg-brand-gold/[0.07] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#1B2847_1px,transparent_1px),linear-gradient(to_bottom,#1B2847_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-15">
        {/* Centered hero content */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-gold/30 bg-white px-4 py-2 shadow-[0_2px_8px_rgba(27,40,71,0.04)]">
            <GraduationCap
              size={16}
              className="text-brand-gold"
              strokeWidth={1.9}
              aria-hidden="true"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.19em] text-brand-navy sm:text-[11px]">
              Admissions at ITMT
            </span>
          </div>

          <h1
            id="admissions-hero-title"
            className="mx-auto mt-7 max-w-4xl text-4xl font-bold leading-[1.1] tracking-[-0.045em] text-brand-navy sm:text-5xl md:text-6xl lg:text-[4.5rem]"
          >
            Your future starts with the{" "}
            <span className="relative inline-block text-brand-gold">
              right opportunity.
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-[3px] w-1/3 rounded-full bg-brand-gold/50 sm:-bottom-2"
              />
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8 lg:text-lg">
            Take the next step towards your academic goals. Explore our
            programmes, understand the admission process, and discover your
            opportunities at ITMT.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-brand-navy px-7 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(27,40,71,0.14)] transition-colors duration-200 hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              Start your application
              <ArrowRight
                size={17}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/courses"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-brand-navy transition-colors duration-200 hover:border-brand-gold/60 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              <BookOpen size={17} strokeWidth={1.8} aria-hidden="true" />
              Explore courses
            </Link>
          </div>

          {/* Supporting highlights */}
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-8">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:text-sm"
              >
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brand-gold/15 text-brand-navy">
                  <Check size={11} strokeWidth={2.8} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        Admissions journey
        
{/* Admission Process */}
<section className="mx-auto mt-24 max-w-6xl sm:mt-28 lg:mt-32">
  {/* Section heading */}
  <div className="mx-auto max-w-2xl text-center">
    <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-gold/[0.07] px-3.5 py-2">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-navy sm:text-[11px]">
        The admission process
      </span>
    </div>

    <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-brand-navy sm:text-4xl lg:text-[42px]">
      Your next chapter starts{" "}
      <span className="text-brand-gold">here.</span>
    </h2>

    <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
      From choosing your programme to completing your application,
      here is everything you need to get started.
    </p>
  </div>

  {/* Steps */}
  <ol className="relative mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
    {steps.map(({ number, icon: Icon, title, description }, index) => (
      <li key={number} className="relative flex min-w-0">
        {/* Connector */}
        {index < steps.length - 1 && (
          <div
            aria-hidden="true"
            className="absolute left-[27px] top-[58px] bottom-[-16px] w-px bg-gradient-to-b from-brand-gold/50 to-slate-200 sm:hidden"
          />
        )}

        {index < steps.length - 1 && (
          <div
            aria-hidden="true"
            className="absolute left-[calc(50%+30px)] right-0 top-[29px] hidden h-px bg-gradient-to-r from-brand-gold/50 to-slate-200 lg:block"
          />
        )}

        <div className="group relative flex w-full gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 transition-colors duration-200 hover:border-brand-gold/50 sm:p-6 lg:flex-col lg:gap-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-5 lg:py-0 lg:first:pl-0 lg:last:pr-0">
          {/* Step icon and number */}
          <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand-gold/30 bg-white text-brand-navy shadow-[0_4px_16px_rgba(27,40,71,0.05)] transition-colors duration-200 group-hover:border-brand-navy group-hover:bg-brand-navy group-hover:text-brand-gold lg:mb-7">
            <Icon
              size={23}
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-brand-navy px-1 text-[9px] font-bold text-white">
              {number}
            </span>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 pb-1 lg:flex-none">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
              Step {String(index + 1).padStart(2, "0")}
            </p>

            <h3 className="mt-2 text-base font-semibold tracking-tight text-brand-navy sm:text-lg">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500 lg:mt-3 lg:pr-2">
              {description}
            </p>
          </div>
        </div>
      </li>
    ))}
  </ol>

  {/* Supporting note */}
  <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 px-4 py-4 sm:mt-10 sm:items-center sm:px-5">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
      <Check size={17} strokeWidth={2} aria-hidden="true" />
    </div>

    <div>
      <p className="text-sm font-semibold text-brand-navy">
        Before you apply
      </p>
      <p className="mt-1 text-xs leading-6 text-slate-500 sm:text-sm">
        Review the admission requirements and programme details to ensure
        you have everything you need before submitting your application.
      </p>
    </div>
  </div>
</section>

      </div>
    </section>
  );
}
