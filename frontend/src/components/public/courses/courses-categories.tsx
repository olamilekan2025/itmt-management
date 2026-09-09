"use client";

import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  GraduationCap,
  Layers3,
} from "lucide-react";

const categories = [
  {
    icon: Building2,
    title: "Departments",
    description:
      "Organizational units that house related academic programmes and disciplines.",
  },
  {
    icon: GraduationCap,
    title: "Programmes",
    description:
      "Structured academic pathways that define curriculum and course requirements.",
  },
  {
    icon: Layers3,
    title: "Academic Levels",
    description:
      "Progressive stages of study organized around academic progression.",
  },
  {
    icon: CalendarDays,
    title: "Semesters",
    description:
      "Academic periods within a session when courses are offered and completed.",
  },
];

export default function CoursesCategories() {
  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-14 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            Academic categories
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            Explore the academic structure
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Courses are organized within a structured academic framework,
            providing clear pathways for learning, administration, and
            progression.
          </p>
        </div>

        {/* Categories */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <article
                key={category.title}
                className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-slate-50 p-7 transition-all duration-300 hover:-translate-y-2 hover:border-brand-navy/20 hover:bg-white hover:shadow-[0_22px_60px_rgba(15,23,42,0.09)]"
              >
                {/* Decorative corner */}
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-gold/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-navy shadow-sm ring-1 ring-slate-200 transition-all duration-300 group-hover:bg-brand-navy group-hover:text-white group-hover:ring-brand-navy">
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </div>

                    <span className="text-xs font-bold text-slate-300">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mt-7 text-xl font-bold text-brand-navy">
                    {category.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {category.description}
                  </p>

                  {/* Bottom */}
                  <div className="mt-7 flex items-center justify-between border-t border-slate-200 pt-5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 transition-colors group-hover:text-brand-navy">
                      Academic category
                    </span>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all duration-300 group-hover:border-brand-gold/30 group-hover:text-brand-gold">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}