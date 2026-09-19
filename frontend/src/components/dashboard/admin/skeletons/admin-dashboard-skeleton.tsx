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

export default function AdminDashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-lg">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute right-20 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-brand-gold/10" />

        <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="max-w-3xl">
            <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
            <Skeleton className="mt-4 h-10 w-64 bg-white/10 sm:h-12" />
            <Skeleton className="mt-3 h-5 w-full max-w-2xl bg-white/10" />
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md">
            <Skeleton className="h-12 w-12 rounded-2xl bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 bg-white/10" />
              <Skeleton className="h-4 w-32 bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Institution Overview */}
      <section>
        <div className="mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="mt-6 h-3 w-20" />
              <Skeleton className="mt-2 h-9 w-16" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      </section>

      {/* Administration Summary */}
      <section>
        <div className="mb-4">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <div className="mt-1 flex items-baseline gap-2">
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Management Areas */}
      <section>
        <div className="mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
                    <div>
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="mt-2 h-4 w-64" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((subItem) => (
                    <div
                      key={subItem}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="mt-2 h-6 w-10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Attention Area */}
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* System Activity */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-56" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>

          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>

          <div className="space-y-3 p-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5"
              >
                <Skeleton className="h-2 w-2 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-32 flex-1" />
                <Skeleton className="h-6 w-10 rounded-lg" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
