"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-slate-200/80",
        className,
      )}
    />
  );
}

export default function RegistrarDashboardSkeleton() {
  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1600px] space-y-7">
        {/* Page Intro */}
        <section className="relative overflow-hidden rounded-2xl bg-brand-navy px-5 py-6 shadow-lg shadow-brand-navy/10 sm:px-7 sm:py-7">
          {/* Background effects */}
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-1/3 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:32px_32px]" />

          {/* Content */}
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl bg-white/10 sm:h-14 sm:w-14" />
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-32 bg-white/10" />
                <Skeleton className="h-8 w-64 bg-white/10" />
                <Skeleton className="h-4 w-96 bg-white/10" />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />
              <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section>
          <div className="mb-4 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-48" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                  <Skeleton className="mt-6 h-8 w-20" />
                  <Skeleton className="mt-3 h-4 w-24" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          {/* Recent Activity */}
          <div className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>

            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex gap-4 px-6 py-5">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
            <div className="border-b border-slate-100 px-6 py-5 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>

            <div className="space-y-1.5 p-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl p-3.5">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Administration Banner */}
        <div className="overflow-hidden border-0 bg-brand-navy shadow-xl shadow-brand-navy/15">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-blue/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="relative p-6 sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 shrink-0 rounded-2xl bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48 bg-white/10" />
                  <Skeleton className="h-4 w-96 bg-white/10" />
                </div>
              </div>

              <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
