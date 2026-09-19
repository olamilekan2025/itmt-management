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

/* =========================================================
   COURSE CARD SKELETON
========================================================= */

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="relative h-[112px] overflow-hidden bg-slate-200">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100/30 to-slate-200" />

        <div className="relative flex items-start gap-3 p-5">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl bg-white/40" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-20 rounded-md bg-white/40" />
            <Skeleton className="h-5 w-4/5 rounded-md bg-white/40" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 p-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-6 w-8" />
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <Skeleton className="mb-2 h-3 w-14" />
            <Skeleton className="h-6 w-10" />
          </div>
        </div>

        {/* Semester */}
        <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>

          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>

        {/* Students */}
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />

            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>

          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>

        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

/* =========================================================
   PAGE SKELETON
========================================================= */

export default function LecturerCoursesSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* ===================================================
          HERO SKELETON
      =================================================== */}

      <section className="relative overflow-hidden bg-brand-navy">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

          <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-7 w-40 rounded-full bg-white/10" />

              <Skeleton className="h-10 w-64 bg-white/10 sm:w-80" />

              <Skeleton className="h-5 w-full max-w-xl bg-white/10" />
              <Skeleton className="h-5 w-4/5 max-w-lg bg-white/10" />
            </div>

            <Skeleton className="h-11 w-40 rounded-xl bg-white/10" />
          </div>

          {/* Summary cards */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />

                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24 bg-white/10" />
                      <Skeleton className="h-6 w-10 bg-white/10" />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* Filter skeleton */}
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-64" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-11 w-full rounded-xl sm:w-64" />
              <Skeleton className="h-11 w-full rounded-xl sm:w-40" />
            </div>
          </div>
        </div>

        {/* Course cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <CourseCardSkeleton key={index} />
            ),
          )}
        </div>
      </section>
    </main>
  );
}