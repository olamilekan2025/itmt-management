"use client";

import {
  ArrowDown,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Layers3,
} from "lucide-react";

const levels = [
  {
    icon: Building2,
    label: "Institution",
    description:
      "The academic organization that houses departments and programmes.",
  },
  {
    icon: Building2,
    label: "Departments",
    description:
      "Specialized units focused on specific academic disciplines.",
  },
  {
    icon: GraduationCap,
    label: "Programmes",
    description:
      "Academic pathways that define the curriculum and course requirements.",
  },
  {
    icon: Layers3,
    label: "Academic Levels",
    description:
      "Progressive stages of study organized by academic progression.",
  },
  {
    icon: BookOpen,
    label: "Courses",
    description:
      "Individual learning modules within a programme and semester.",
  },
  {
    icon: CalendarDays,
    label: "Semesters / Sessions",
    description:
      "Academic periods in which courses are offered and completed.",
  },
];

export default function CoursesStructure() {
  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-brand-light py-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-3xl" />

        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(rgba(15,23,42,0.12) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            Academic framework
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            Course information structure
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Understanding how academic information is organized makes it
            easier to navigate programmes, courses, levels, and semesters.
          </p>
        </div>

        {/* Structure */}
        <div className="relative">
          {/* Vertical spine */}
          <div className="absolute left-7 top-8 bottom-8 hidden w-px bg-gradient-to-b from-brand-gold/60 via-brand-navy/20 to-brand-gold/60 sm:block" />

          <div className="space-y-4">
            {levels.map((level, index) => {
              const Icon = level.icon;

              return (
                <div key={level.label} className="group relative">
                  <div className="relative flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/30 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:p-6">
                    {/* Icon node */}
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-navy text-white shadow-lg shadow-brand-navy/10 transition-all duration-300 group-hover:bg-brand-gold group-hover:text-brand-navy">
                      <Icon className="h-6 w-6" strokeWidth={1.7} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-brand-navy sm:text-xl">
                          {level.label}
                        </h3>

                        <span className="rounded-full bg-brand-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-navy">
                          Step {index + 1}
                        </span>
                      </div>

                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
                        {level.description}
                      </p>
                    </div>

                    {/* Progress marker */}
                    <div className="hidden shrink-0 sm:block">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-bold text-slate-400 transition-all group-hover:border-brand-gold/30 group-hover:bg-brand-light group-hover:text-brand-navy">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                  </div>

                  {/* Connector */}
                  {index < levels.length - 1 && (
                    <div className="flex justify-center py-2 sm:hidden">
                      <ArrowDown className="h-4 w-4 text-brand-gold" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}