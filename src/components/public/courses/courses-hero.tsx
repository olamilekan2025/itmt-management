"use client";

import Link from "next/link";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";

export default function CoursesHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-light to-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-wider uppercase text-brand-gold">
                Courses & Programmes
              </p>
              <h1 className="text-4xl font-bold leading-tight text-brand-navy sm:text-5xl lg:text-6xl">
                Explore the academic courses that shape your learning journey.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                Discover the courses available across the institution's programmes,
                departments, academic levels, and semesters.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="#course-catalog"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="#course-process"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-brand-navy transition-colors hover:bg-slate-50"
              >
                How course registration works
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto aspect-square max-w-md">
              {/* Background decorative elements */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-navy/5 to-brand-gold/5" />
              
              {/* Course cards visual */}
              <div className="absolute inset-4 space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light">
                    <BookOpen className="h-5 w-5 text-brand-navy" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-24 rounded bg-brand-navy" />
                    <div className="h-2 w-32 rounded bg-slate-200" />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light">
                    <GraduationCap className="h-5 w-5 text-brand-navy" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-20 rounded bg-brand-navy" />
                    <div className="h-2 w-28 rounded bg-slate-200" />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light">
                    <BookOpen className="h-5 w-5 text-brand-navy" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-28 rounded bg-brand-navy" />
                    <div className="h-2 w-24 rounded bg-slate-200" />
                  </div>
                </div>
              </div>

              {/* Decorative accent */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand-gold/10" />
              <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-brand-navy/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
