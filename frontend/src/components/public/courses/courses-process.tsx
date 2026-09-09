"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: GraduationCap,
    title: "Review your programme",
    description:
      "Understand the courses required for your specific programme and academic level.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Explore available courses",
    description:
      "Browse the course catalogue to see the courses offered within your department and semester.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Register your courses",
    description:
      "Complete the course registration process through the academic portal according to your institution's configuration.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Confirm your registration",
    description:
      "Review your selected courses carefully and confirm your registration for the semester.",
  },
];

export default function CoursesProcess() {
  return (
    <section
      id="course-process"
      className="relative overflow-hidden border-t border-slate-200 bg-slate-50 py-24"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-blue/5 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.035) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            Registration process
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            How course registration works
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            A clear academic process helps students understand their
            requirements, select the right courses, and complete registration
            with confidence.
          </p>
        </div>

        {/* Process */}
        <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {/* Desktop progression line */}
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-[62px] hidden h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.number} className="group relative">
                <div className="relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-gold/40 hover:shadow-[0_20px_55px_rgba(15,23,42,0.10)]">
                  {/* Top accent */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-navy via-brand-blue to-brand-gold opacity-70" />

                  {/* Decorative number */}
                  <span className="pointer-events-none absolute right-5 top-3 text-6xl font-black tracking-tighter text-slate-100 transition-colors duration-300 group-hover:text-brand-gold/10">
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div className="relative mb-7 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-navy text-white shadow-lg shadow-brand-navy/10 transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </div>

                    <span className="relative z-10 flex h-8 min-w-8 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-light px-2 text-[11px] font-bold tracking-wider text-brand-navy">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <h3 className="text-lg font-bold text-brand-navy sm:text-xl">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom indicator */}
                  <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Academic step
                    </span>

                    {index < steps.length - 1 ? (
                      <ArrowRight className="h-4 w-4 text-brand-gold transition-transform duration-300 group-hover:translate-x-1" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-brand-gold" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}