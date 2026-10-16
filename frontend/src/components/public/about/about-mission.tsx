import { Compass, Eye } from "lucide-react";

export default function AboutMission() {
  return (
    <section className="bg-[#FAFAFA] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mission */}
          <article className="group relative overflow-hidden rounded-3xl border border-slate-200/70 border-t-[3px] border-t-brand-gold bg-white p-8 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_16px_36px_-18px_rgba(15,23,42,0.15)] sm:p-10">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
                <Compass size={22} aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-[#8A6D1F]">
                Our mission
              </span>
            </div>

            <h2 className="mt-8 text-2xl font-bold tracking-[-0.025em] text-brand-navy sm:text-3xl">
              Simplify institutional management.
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              To simplify academic and institutional management through
              reliable, accessible, and thoughtfully designed technology.
            </p>
          </article>

          {/* Vision */}
          <article className="relative isolate overflow-hidden rounded-3xl border border-brand-navy border-t-[3px] border-t-brand-gold bg-brand-navy p-8 shadow-[0_28px_60px_-24px_rgba(15,23,42,0.55)] sm:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/[0.07]" />
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-brand-gold/20" />
              <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-brand-gold/[0.12] blur-3xl" />
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-brand-gold">
                <Eye size={22} aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-brand-gold">
                Our vision
              </span>
            </div>

            <h2 className="mt-8 text-2xl font-bold tracking-[-0.025em] text-white sm:text-3xl">
              A connected digital institution.
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              To create a connected digital environment where students,
              lecturers, administrators, and institutions can work more
              efficiently.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}