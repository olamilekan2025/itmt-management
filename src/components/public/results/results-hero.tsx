"use client";

import Link from "next/link";
import { ArrowRight, FileText, CheckCircle2, Award } from "lucide-react";

export default function ResultsHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-light to-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-wider uppercase text-brand-gold">
                Academic Results
              </p>
              <h1 className="text-4xl font-bold leading-tight text-brand-navy sm:text-5xl lg:text-6xl">
                Access and verify academic results with confidence.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                Use the ITMT platform to access your academic results securely, organized by semester and session.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md"
              >
                Access My Results
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-brand-navy transition-colors hover:bg-slate-50"
              >
                Learn How Results Work
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto aspect-square max-w-md">
              {/* Background decorative elements */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-navy/5 to-brand-gold/5" />
              
              {/* Visual representation of result cards */}
              <div className="absolute inset-4 space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-24 rounded bg-brand-navy" />
                    <div className="h-2 w-32 rounded bg-slate-200" />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-20 rounded bg-brand-navy" />
                    <div className="h-2 w-28 rounded bg-slate-200" />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-28 rounded bg-brand-navy" />
                    <div className="h-2 w-24 rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
