"use client";

import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  Layers3,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Programmes",
    description: "Structured academic pathways",
    accent: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: Building2,
    title: "Departments",
    description: "Specialized academic units",
    accent: "text-brand-navy",
    bg: "bg-brand-navy/10",
  },
  {
    icon: BookOpen,
    title: "Courses",
    description: "Individual learning modules",
    accent: "text-brand-gold",
    bg: "bg-brand-gold/10",
  },
  {
    icon: Layers3,
    title: "Academic Levels",
    description: "Progressive study stages",
    accent: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
];

export default function CoursesIntroduction() {
  return (
    <section className="relative overflow-hidden border-t border-slate-200/70 bg-white py-20 sm:py-24 lg:py-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-brand-blue/5 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand-gold/5 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          {/* =========================
              VISUAL
          ========================== */}
          <div className="order-2 lg:order-1">
            <div className="relative mx-auto max-w-xl">
              {/* Glow */}
              <div className="absolute -inset-6 rounded-[2.5rem] bg-brand-navy/5 blur-3xl" />

              {/* Main visual */}
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-brand-navy p-5 shadow-2xl shadow-brand-navy/15 sm:p-7">
                {/* Decorative glow */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-blue/20 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-gold/15 blur-3xl" />

                {/* Top bar */}
                <div className="relative mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                      <GraduationCap className="h-5 w-5 text-brand-gold" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        ITMT Academic Structure
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        Learning pathway
                      </p>
                    </div>
                  </div>

                  <div className="flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                    <span className="text-[10px] font-semibold text-white/60">
                      Organized
                    </span>
                  </div>
                </div>

                {/* Academic flow */}
                <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6">
                  <div className="mb-5">
                    <p className="text-xs font-medium text-white/40">
                      Academic information
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-white sm:text-xl">
                      One connected academic structure
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;

                      return (
                        <div key={feature.title} className="relative">
                          {/* Connector */}
                          {index !== features.length - 1 && (
                            <div className="absolute left-[19px] top-11 h-4 w-px bg-white/10" />
                          )}

                          <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.04] p-3.5 transition-colors hover:bg-white/[0.07]">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                              <Icon className="h-4.5 w-4.5 text-brand-gold" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-white">
                                {feature.title}
                              </p>

                              <p className="mt-0.5 text-xs text-white/40">
                                {feature.description}
                              </p>
                            </div>

                            <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-blue/70" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom stats */}
                <div className="relative mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-lg font-bold text-white">01</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">
                      Structure
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-lg font-bold text-white">04</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">
                      Core areas
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-lg font-bold text-white">∞</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">
                      Connected
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              CONTENT
          ========================== */}
          <div className="order-1 lg:order-2">
            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.17em] text-brand-navy">
              <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
              Academic information
            </div>

            {/* Heading */}
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl lg:leading-[1.12]">
              Academic information,
              <span className="block text-brand-blue">
                organized in one place.
              </span>
            </h2>

            {/* Description */}
            <div className="mt-6 max-w-2xl space-y-4 text-slate-600">
              <p className="text-base leading-7 sm:text-lg sm:leading-8">
                ITMT provides a structured environment for organizing courses
                across programmes, departments, academic levels, sessions and
                semesters.
              </p>

              <p className="text-sm leading-7 sm:text-base">
                Students can use the platform to understand the courses
                associated with their academic journey, while authorized
                institutional users can manage academic information according
                to their responsibilities.
              </p>
            </div>

            {/* Feature grid */}
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="
                      group rounded-2xl
                      border border-slate-200/80
                      bg-white
                      p-4
                      shadow-sm
                      transition-all duration-300
                      hover:-translate-y-0.5
                      hover:border-brand-navy/15
                      hover:shadow-lg hover:shadow-slate-900/5
                    "
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${feature.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${feature.accent}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-brand-navy">
                          {feature.title}
                        </p>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {feature.description}
                        </p>
                      </div>

                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-blue" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Supporting statement */}
            <div className="mt-8 flex items-start gap-3 border-l-2 border-brand-gold pl-4">
              <div>
                <p className="text-sm font-semibold text-brand-navy">
                  Built around a clear academic hierarchy
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  From departments and programmes to individual courses,
                  academic information remains connected and easy to navigate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

