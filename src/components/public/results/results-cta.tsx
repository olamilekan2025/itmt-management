"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ResultsCta() {
  return (
    <section className="border-t border-slate-100 bg-gradient-to-b from-white to-brand-light py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-navy to-brand-blue px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Stay connected to your academic progress.
          </h2>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Access the ITMT platform to review your academic information and stay connected with your institution.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-navy shadow-lg hover:shadow-xl transition-all hover:bg-slate-50"
            >
              Access Your Portal
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white bg-transparent px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
