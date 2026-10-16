
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  Layers3,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: GraduationCap,
    title: "Programmes",
    description: "Structured academic pathways",
  },
  {
    number: "02",
    icon: Building2,
    title: "Departments",
    description: "Specialized academic units",
  },
  {
    number: "03",
    icon: BookOpen,
    title: "Courses",
    description: "Individual learning modules",
  },
  {
    number: "04",
    icon: Layers3,
    title: "Academic Levels",
    description: "Progressive study stages",
  },
];

export default function CoursesIntroduction() {
  return (
    <section className="relative isolate overflow-hidden border-t border-slate-100 bg-white py-20 sm:py-24 lg:py-28">
      {/* Subtle background details */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 top-24 h-80 w-80 rounded-full bg-brand-gold/[0.07] blur-[100px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand-navy/[0.05] blur-[100px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-navy/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-9">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 xl:gap-20">
          {/* Left: Introduction */}
          <div className="min-w-0">
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-brand-gold/30 bg-[#FBFAF6] px-4 py-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy/[0.07]">
                <GraduationCap
                  className="h-3.5 w-3.5 text-brand-navy"
                  aria-hidden="true"
                />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-navy sm:text-[11px]">
                Academic information
              </span>
            </div>

            <h2 className="max-w-2xl text-3xl font-bold leading-[1.15] tracking-[-0.04em] text-brand-navy sm:text-4xl lg:text-[3.25rem]">
              Academic information,
              <span className="mt-1 block text-brand-gold">
                organized in one place.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-[17px]">
              ITMT provides a structured environment for organizing courses
              across programmes, departments, academic levels, sessions, and
              semesters.
            </p>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base sm:leading-8">
              Students can explore the courses associated with their academic
              journey, while authorized institutional users manage academic
              information according to their responsibilities.
            </p>

            {/* Supporting statement */}
            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-[#F8F9FB] p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                <ShieldCheck
                  className="h-5 w-5"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-brand-navy sm:text-base">
                  Built around a clear academic hierarchy
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  From departments and programmes to individual courses,
                  academic information stays connected and easier to navigate.
                </p>
              </div>
            </div>

            {/* Small supporting detail */}
            <div className="mt-6 flex items-center gap-2.5 text-xs font-semibold text-slate-500 sm:text-sm">
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-brand-gold"
                aria-hidden="true"
              />
              <span>One structured view of the academic journey</span>
            </div>
          </div>

          {/* Right: Academic structure panel */}
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            {/* Outer glow */}
            <div
              aria-hidden="true"
              className="absolute -inset-3 -z-10 rounded-[2rem] bg-brand-navy/[0.06] blur-2xl"
            />

            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-brand-navy p-5 shadow-[0_28px_80px_-32px_rgba(15,27,51,0.55)] sm:rounded-[2rem] sm:p-7 lg:p-8">
              {/* Panel background decoration */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
              >
                <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full border border-white/[0.07]" />
                <div className="absolute -right-8 -top-12 h-44 w-44 rounded-full border border-brand-gold/15" />
                <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-brand-gold/[0.10] blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />
              </div>

              {/* Panel header */}
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-gold/20 bg-white/[0.07] text-brand-gold">
                    <GraduationCap
                      className="h-6 w-6"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/45 sm:text-[11px]">
                      ITMT Academy
                    </p>
                    <h3 className="mt-1 text-base font-bold tracking-[-0.02em] text-white sm:text-lg">
                      Academic structure
                    </h3>
                  </div>
                </div>

                <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span className="text-[10px] font-semibold text-emerald-100 sm:text-xs">
                    Connected
                  </span>
                </div>
              </div>

              {/* Panel introduction */}
              <div className="relative mt-8 border-b border-white/10 pb-5">
                <p className="text-xs font-medium text-white/45">
                  A coordinated learning pathway
                </p>
                <p className="mt-2 max-w-sm text-xl font-bold leading-snug tracking-[-0.025em] text-white sm:text-2xl">
                  Every academic element has its place.
                </p>
              </div>

              {/* Academic structure list */}
              <div className="relative mt-5 space-y-3">
                {features.map(({ number, icon: Icon, title, description }, index) => (
                  <div key={title} className="relative">
                    {/* Connector between items */}
                    {index !== features.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute bottom-0 left-[21px] top-[48px] w-px translate-y-3 bg-gradient-to-b from-brand-gold/30 to-white/[0.05]"
                      />
                    )}

                    <div className="group relative flex items-center gap-3.5 rounded-xl border border-white/[0.08] bg-white/[0.045] p-3.5 transition-colors duration-200 hover:border-brand-gold/25 hover:bg-white/[0.08] sm:gap-4 sm:p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.06] text-brand-gold transition-colors duration-200 group-hover:border-brand-gold/30 group-hover:bg-brand-gold group-hover:text-brand-navy">
                        <Icon
                          className="h-5 w-5"
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white">
                          {title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/50 sm:text-sm">
                          {description}
                        </p>
                      </div>

                      <span className="hidden text-[10px] font-bold tracking-[0.12em] text-white/25 sm:block">
                        {number}
                      </span>

                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-brand-gold/80"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Panel footer */}
              <div className="relative mt-5 flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-black/10 px-4 py-3.5">
                <div>
                  <p className="text-xs font-semibold text-white/85">
                    Connected by design
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-white/40">
                    One coordinated academic environment
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/25 text-brand-gold">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Floating detail */}
            <div className="relative mx-auto mt-4 flex max-w-sm items-center justify-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.3)] sm:absolute sm:-bottom-5 sm:left-6 sm:mx-0 sm:mt-0 sm:justify-start">
              <div className="flex -space-x-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-navy text-white">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-gold text-brand-navy">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-brand-navy">
                  <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-brand-navy">
                  A connected structure
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  From programmes to courses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
