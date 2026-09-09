
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  Clock3,
  GraduationCap,
  RefreshCw,
} from "lucide-react";

import { publicApiGet } from "@/lib/api";

interface Programme {
  _id: string;
  name: string;
  code: string;
  award?: string;
  durationYears?: number;
  description?: string;
  department: {
    name: string;
    code: string;
  };
}

export default function AdmissionsProgrammes() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchProgrammes() {
    try {
      setLoading(true);
      setError(false);

      const data = await publicApiGet<{
        success: boolean;
        programmes: Programme[];
      }>("/api/programmes/public");

      if (data.success) {
        setProgrammes(data.programmes);
      } else {
        setProgrammes([]);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProgrammes();
  }, []);

  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-slate-50 py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-navy shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            Academic opportunities
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            Explore academic programmes
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Discover the programmes available through the institution&apos;s
            current academic structure.
          </p>
        </div>

        <div className="mt-14">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-[28px] border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <RefreshCw className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-brand-navy">
                Programme information is unavailable
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                We could not load programme information at this time.
                Please try again.
              </p>

              <button
                type="button"
                onClick={fetchProgrammes}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Try again
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          ) : programmes.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand-navy">
                <BookOpen className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-brand-navy">
                Programme information is not available yet
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                Programme information will appear here as the institution&apos;s
                academic offerings are configured.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {programmes.slice(0, 6).map((programme) => (
                <article
                  key={programme._id}
                  className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_10px_35px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-2 hover:border-brand-gold/30 hover:shadow-[0_22px_60px_rgba(15,23,42,0.09)]"
                >
                  {/* Top accent */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-navy via-brand-blue to-brand-gold opacity-70" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand-navy">
                      <GraduationCap className="h-6 w-6" />
                    </div>

                    {programme.award && (
                      <span className="rounded-full border border-brand-gold/20 bg-brand-light px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-navy">
                        {programme.award}
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                      {programme.code}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-snug text-brand-navy">
                      {programme.name}
                    </h3>

                    <div className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      {programme.department.name}
                    </div>

                    {programme.durationYears && (
                      <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Clock3 className="h-4 w-4 text-slate-400" />
                        {programme.durationYears} year
                        {programme.durationYears > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>

                  {programme.description && (
                    <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-600">
                      {programme.description}
                    </p>
                  )}

                  <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Academic programme
                    </span>

                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-gold" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/courses"
            className="group inline-flex items-center gap-2 rounded-xl bg-brand-navy px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-navy/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl"
          >
            Explore Courses
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
