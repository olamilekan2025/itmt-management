import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  BookOpen,
  FileText,
  CheckCircle2,
} from "lucide-react";

import { Card } from "@/components/ui/card";

export default function AdmissionsHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-light to-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-brand-navy/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Content */}
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-brand-navy/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-navy shadow-sm">
              Admissions
            </span>

            <h1 className="mt-6 font-sans text-4xl font-semibold leading-tight tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
              Take the next step in your academic journey.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Explore admission information, academic opportunities, and the steps
              required to begin your journey with ITMT.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/login"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-brand-navy px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
              >
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/courses"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-brand-navy/15 bg-white px-6 text-sm font-medium text-brand-navy transition-all hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
              >
                View Courses
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="relative mx-auto h-[450px] w-full max-w-xl">
            {/* Background decorative elements */}
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-navy/10" />
            <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-gold/20" />

            {/* Central card */}
            <Card className="absolute left-1/2 top-1/2 z-20 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-brand-navy bg-brand-navy shadow-xl">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-brand-navy">
                  <GraduationCap className="h-6 w-6" />
                </div>

                <p className="mt-3 text-xs font-bold tracking-wider text-white">
                  ITMT
                </p>

                <p className="mt-1 text-[10px] text-white/50">
                  Admissions
                </p>
              </div>
            </Card>

            {/* Decorative connection lines */}
            <div className="absolute left-1/2 top-1/2 h-px w-80 -translate-x-1/2 bg-brand-navy/10" />
            <div className="absolute left-1/2 top-1/2 h-80 w-px -translate-y-1/2 bg-brand-navy/10" />

            {/* Information cards */}
            <Card className="absolute left-0 top-8 z-30 flex items-center gap-3 border-slate-200 bg-white px-4 py-3 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand-navy">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-brand-navy">
                Programmes
              </span>
            </Card>

            <Card className="absolute right-0 top-2 z-30 flex items-center gap-3 border-slate-200 bg-white px-4 py-3 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand-navy">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-brand-navy">
                Requirements
              </span>
            </Card>

            <Card className="absolute right-4 bottom-10 z-30 flex items-center gap-3 border-slate-200 bg-white px-4 py-3 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand-navy">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-brand-navy">
                Process
              </span>
            </Card>

            <Card className="absolute left-4 bottom-2 z-30 flex items-center gap-3 border-slate-200 bg-white px-4 py-3 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand-navy">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-brand-navy">
                Academic Sessions
              </span>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
