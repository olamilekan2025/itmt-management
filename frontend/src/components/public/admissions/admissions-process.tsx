
import {
  ClipboardCheck,
  FileCheck,
  Info,
  Search,
  Send,
} from "lucide-react";

const processSteps = [
  {
    number: "01",
    icon: Search,
    title: "Explore your options",
    description:
      "Review available programmes and academic opportunities to find the right fit for your goals.",
  },
  {
    number: "02",
    icon: FileCheck,
    title: "Review requirements",
    description:
      "Understand the admission requirements for your intended programme and prepare accordingly.",
  },
  {
    number: "03",
    icon: Send,
    title: "Submit your application",
    description:
      "Complete and submit your application through the institution's admissions portal.",
  },
  {
    number: "04",
    icon: ClipboardCheck,
    title: "Follow your admission status",
    description:
      "Track your application progress and respond to any additional requests from the admissions office.",
  },
];

export default function AdmissionsProcess() {
  return (
    <section
      aria-labelledby="admissions-process-heading"
      className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle background details */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-gold/[0.06] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-100/80 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-gold/[0.07] px-3.5 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-navy sm:text-[11px]">
              Your admission journey
            </span>
          </div>

          <h2
            id="admissions-process-heading"
            className="text-3xl font-bold tracking-[-0.04em] text-brand-navy sm:text-4xl lg:text-5xl"
          >
            How the admissions{" "}
            <span className="text-brand-gold">process works</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base sm:leading-8">
            Four straightforward steps to help you move from exploring your
            options to tracking your admission status.
          </p>
        </div>

        {/* Admission steps */}
        <ol className="relative mx-auto mt-14 grid max-w-6xl gap-5 sm:mt-16 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-7">
          {/* Mobile timeline */}
          <span
            aria-hidden="true"
            className="absolute bottom-8 left-7 top-8 w-px bg-gradient-to-b from-brand-gold/50 via-slate-200 to-transparent sm:hidden"
          />

          {/* Desktop timeline */}
          <span
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-gradient-to-r from-brand-gold/50 via-slate-200 to-brand-gold/30 lg:block"
          />

          {processSteps.map(
            ({ number, icon: Icon, title, description }, index) => (
              <li key={number} className="group relative min-w-0">
                <div className="relative flex h-full gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 transition-colors duration-200 hover:border-brand-gold/50 sm:p-6 lg:flex-col lg:gap-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
                  {/* Icon */}
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand-gold/30 bg-white text-brand-navy shadow-[0_4px_18px_rgba(27,40,71,0.06)] transition-colors duration-200 group-hover:border-brand-navy group-hover:bg-brand-navy group-hover:text-brand-gold lg:mb-8">
                    <Icon
                      size={22}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                    <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-brand-navy px-1 text-[9px] font-bold text-white">
                      {number}
                    </span>
                  </div>

                  {/* Step content */}
                  <div className="min-w-0 flex-1 lg:flex-none lg:pr-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                      Step {String(index + 1).padStart(2, "0")}
                    </p>

                    <h3 className="mt-2 text-lg font-bold tracking-[-0.025em] text-brand-navy sm:text-xl">
                      {title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {description}
                    </p>
                  </div>
                </div>
              </li>
            ),
          )}
        </ol>

        {/* Information note */}
        <div className="mx-auto mt-12 flex max-w-4xl items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 sm:mt-16 sm:items-center sm:px-6 sm:py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-gold/20 bg-white text-brand-gold shadow-sm">
            <Info size={19} strokeWidth={1.8} aria-hidden="true" />
          </div>

          <div>
            <p className="text-sm font-semibold text-brand-navy">
              Important admission information
            </p>

            <p className="mt-1 text-xs leading-6 text-slate-500 sm:text-sm">
              Admission steps and requirements may vary depending on the
              programme and current admissions guidelines. Always refer to
              official communications from the admissions office for the
              latest information.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
