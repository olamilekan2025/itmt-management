"use client";

import {
  ArrowUpRight,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
} from "lucide-react";

const overviewCards = [
  {
    icon: GraduationCap,
    number: "01",
    title: "Programmes",
    description:
      "Explore the academic programmes available across departments and disciplines.",
  },
  {
    icon: ClipboardCheck,
    number: "02",
    title: "Requirements",
    description:
      "Review the admission requirements applicable to your intended programme of study.",
  },
  {
    icon: FileText,
    number: "03",
    title: "Application Process",
    description:
      "Understand the steps involved in preparing and submitting your application.",
  },
  {
    icon: CalendarDays,
    number: "04",
    title: "Academic Sessions",
    description:
      "Learn about academic sessions and the schedules relevant to your application.",
  },
];

export default function AdmissionsOverview() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-navy">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            Admissions overview
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            Understanding admissions
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Get familiar with the key areas that shape the admissions journey
            at ITMT.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.number}
                className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-7 shadow-[0_10px_35px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-2 hover:border-brand-gold/30 hover:shadow-[0_22px_55px_rgba(15,23,42,0.09)]"
              >
                <span className="absolute right-6 top-5 text-6xl font-black tracking-tighter text-slate-100">
                  {card.number}
                </span>

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-lg shadow-brand-navy/10 transition-all duration-300 group-hover:bg-brand-gold group-hover:text-brand-navy">
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </div>

                    <ArrowUpRight className="h-5 w-5 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-gold" />
                  </div>

                  <h3 className="mt-7 text-xl font-bold text-brand-navy">
                    {card.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {card.description}
                  </p>

                  <div className="mt-7 flex items-center gap-2 border-t border-slate-100 pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                    Admissions information
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
