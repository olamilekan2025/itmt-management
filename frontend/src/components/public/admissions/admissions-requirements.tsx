"use client";

import {
  CheckCircle2,
  FileCheck2,
  Info,
} from "lucide-react";

export default function AdmissionsRequirements() {
  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-white py-24">
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-brand-gold/5 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-navy">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            Eligibility information
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            Admission requirements
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Requirements may vary depending on the programme, academic level,
            and current institutional policies.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
          <div className="grid lg:grid-cols-[0.35fr_0.65fr]">
            {/* Side panel */}
            <div className="bg-brand-navy p-8 sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-brand-gold">
                <FileCheck2 className="h-7 w-7" />
              </div>

              <h3 className="mt-7 text-2xl font-bold text-white">
                General information
              </h3>

              <p className="mt-3 text-sm leading-7 text-white/60">
                Admission requirements are configured according to the
                institution&apos;s academic policies and programme structure.
              </p>
            </div>

            {/* Information */}
            <div className="bg-white p-8 sm:p-10">
              <p className="text-sm leading-7 text-slate-600">
                Specific admission requirements will be published here
                according to the institution&apos;s configured admission
                policies. Please contact the admissions office or consult
                your programme department for detailed requirements applicable
                to your intended course of study.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "Programme-specific requirements",
                  "Academic eligibility",
                  "Current institutional policies",
                  "Official application guidelines",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-gold" />
                    <span className="text-xs font-semibold text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex gap-3 rounded-2xl border border-brand-gold/20 bg-brand-light p-5">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" />

                <p className="text-xs leading-6 text-slate-600">
                  Requirements may change based on institutional policies.
                  Always rely on official ITMT admissions information for the
                  requirements applicable to your application.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
