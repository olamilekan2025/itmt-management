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

export default function FinanceDashboardSkeleton() {
  return (
    <div className="mx-auto w-full space-y-6">
      {/* Page Header */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-7 shadow-xl sm:px-8 lg:px-10">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-20 top-10 h-32 w-32 rounded-full border border-white/5" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-40 bg-white/10" />
            <Skeleton className="h-10 w-64 bg-white/10" />
            <Skeleton className="h-4 w-96 bg-white/10" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />
            <Skeleton className="h-10 w-40 rounded-xl bg-white/10" />
          </div>
        </div>

        {/* Header bottom status */}
        <div className="relative mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5">
          <Skeleton className="h-4 w-48 bg-white/10" />
          <Skeleton className="h-4 w-40 bg-white/10" />
        </div>
      </section>

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="overflow-hidden border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-3 h-8 w-24" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
              <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Financial Summary */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Outstanding Fees */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-9 w-16 rounded-xl" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-8 w-20" />
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-8 w-28" />
            </div>
          </div>
        </div>

        {/* Payment Operations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-9 w-16 rounded-xl" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-50 p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-8 w-28" />
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-8 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* Revenue Overview */}
        <div className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>

          <div className="p-6">
            <div className="flex h-[320px] items-end gap-3 px-4 pb-5">
              <div className="h-24 flex-1 animate-pulse rounded-t-lg bg-slate-100" />
              <div className="h-40 flex-1 animate-pulse rounded-t-lg bg-slate-100" />
              <div className="h-32 flex-1 animate-pulse rounded-t-lg bg-slate-100" />
              <div className="h-52 flex-1 animate-pulse rounded-t-lg bg-slate-100" />
              <div className="h-44 flex-1 animate-pulse rounded-t-lg bg-slate-100" />
              <div className="h-64 flex-1 animate-pulse rounded-t-lg bg-slate-100" />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="p-6">
            <div className="flex h-[250px] items-center justify-center">
              <div className="h-40 w-40 animate-pulse rounded-full bg-slate-100" />
            </div>

            <div className="mt-4 space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Outstanding Fees */}
      <div className="overflow-hidden border-amber-200 bg-gradient-to-r from-amber-50 via-white to-white shadow-sm">
        <div className="px-6 py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-9 w-24" />
              <Skeleton className="mt-2 h-3 w-40" />
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-9 w-32" />
              <Skeleton className="mt-2 h-3 w-40" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center gap-4 px-6 py-5">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-24 hidden sm:block" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
