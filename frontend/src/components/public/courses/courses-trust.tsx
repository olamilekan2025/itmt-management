
"use client";

import {
  CheckCircle2,
  Database,
  GitBranch,
  LockKeyhole,
  Network,
} from "lucide-react";

const principles = [
  {
    title: "Structured Information",
    description:
      "Academic information is organized into clear, consistent structures that are easier to understand and manage.",
    icon: Database,
  },
  {
    title: "Role-Aware Access",
    description:
      "Information and actions are presented according to the responsibilities of students and authorized staff.",
    icon: LockKeyhole,
  },
  {
    title: "Consistent Records",
    description:
      "A centralized approach helps maintain reliable academic records across connected institutional processes.",
    icon: CheckCircle2,
  },
  {
    title: "Connected Processes",
    description:
      "Courses work as part of a wider academic workflow connecting programmes, registration, semesters, and results.",
    icon: Network,
  },
];

export default function CoursesTrust() {
  return (
    <section className="relative overflow-hidden border-t border-slate-100 bg-white py-20 sm:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-brand-light/60 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-navy/10 to-transparent"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-brand-light/70 px-3.5 py-2">
            <GitBranch className="h-3.5 w-3.5 text-brand-navy" />

            <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-navy">
              Built around academic structure
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl lg:text-[2.65rem]">
            Academic information,{" "}
            <span className="text-brand-gold">organized with purpose.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            ITMT provides a structured environment for institutional academic
            information, helping students and authorized staff work with
            clearer, more consistent records throughout the academic journey.
          </p>
        </div>

        {/* Principles */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle, index) => {
            const Icon = principle.icon;

            return (
              <div
                key={principle.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-navy/10 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
              >
                {/* Card number */}
                <div className="absolute right-5 top-5 text-[10px] font-bold tracking-[0.15em] text-slate-300">
                  0{index + 1}
                </div>

                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light transition-all duration-300 group-hover:bg-brand-navy">
                  <Icon className="h-5 w-5 text-brand-navy transition-colors duration-300 group-hover:text-white" />
                </div>

                {/* Content */}
                <div className="mt-6">
                  <h3 className="text-base font-bold text-brand-navy">
                    {principle.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-6 text-slate-500">
                    {principle.description}
                  </p>
                </div>

                {/* Bottom accent */}
                <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand-gold transition-transform duration-300 group-hover:scale-x-100" />
              </div>
            );
          })}
        </div>

        {/* Bottom statement */}
        <div className="mx-auto mt-12 flex max-w-4xl flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-6 py-5 text-center sm:flex-row sm:text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>

          <p className="text-sm leading-6 text-slate-600">
            <span className="font-bold text-brand-navy">
              One connected academic environment.
            </span>{" "}
            Course information fits into the broader ITMT academic management
            workflow rather than existing as an isolated catalogue.
          </p>
        </div>
      </div>
    </section>
  );
}

