import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";

const rows = [
  { code: "CSC 201", title: "Data Structures", units: 3, grade: "A" },
  { code: "MTH 203", title: "Linear Algebra", units: 3, grade: "B" },
  { code: "GST 211", title: "Entrepreneurship", units: 2, grade: "A" },
];

const trust = ["Organized by semester", "Secure student access", "Published results only"];

export default function ResultsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#FAFAFA]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-gold/[0.12] blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-brand-blue/[0.07] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24 lg:px-10 lg:py-15">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.95fr] lg:gap-14">
          {/* Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-navy/10 bg-white px-4 py-2 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
              <span className="text-sm font-medium text-brand-navy">Academic results</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-brand-navy sm:text-5xl lg:text-[3.75rem]">
              Access and verify academic results with confidence.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Use the ITMT platform to access your academic results securely,
              organized by semester and session.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/login"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-navy px-7 text-sm font-semibold text-white shadow-lg shadow-brand-navy/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                Access My Results
                <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-brand-navy/15 bg-white px-7 text-sm font-semibold text-brand-navy shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                Learn How Results Work
              </Link>
            </div>

            <ul className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-7">
              {trust.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-brand-navy">
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Result sheet preview */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div aria-hidden="true" className="absolute -bottom-4 -right-4 h-full w-full rounded-3xl bg-brand-navy" />
            <div aria-hidden="true" className="absolute -bottom-4 -right-4 h-full w-full overflow-hidden rounded-3xl">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/[0.08]" />
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full border border-brand-gold/25" />
            </div>

            <div className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.4)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">First semester</p>
                  <h2 className="mt-0.5 text-xl font-bold tracking-[-0.02em] text-brand-navy">
                    2025/2026 session
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Published
                </span>
              </div>

              <ul className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200/80">
                {rows.map((row) => (
                  <li key={row.code} className="flex items-center gap-4 px-4 py-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-brand-navy">{row.code}</span>
                      <span className="block truncate text-sm text-slate-500">{row.title}</span>
                    </span>
                    <span className="text-sm font-medium text-slate-500">{row.units} units</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold text-sm font-bold text-brand-navy">
                      {row.grade}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3.5 ring-1 ring-slate-100">
                <span className="text-sm font-medium text-slate-600">Total credit units</span>
                <span className="text-base font-bold text-brand-navy">8</span>
              </div>

              <p className="mt-4 text-xs text-slate-400">Illustrative preview</p>
            </div>

            <div className="absolute -left-3 top-8 hidden items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-[0_14px_30px_-12px_rgba(15,23,42,0.3)] sm:flex">
              <ShieldCheck size={18} aria-hidden="true" className="text-brand-gold" />
              <span className="text-sm font-semibold text-brand-navy">Verified access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}