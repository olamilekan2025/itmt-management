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

export default function StudentDashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-brand-light">
      {/* Sidebar Skeleton */}
      <div className="hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header Skeleton */}
        <div className="border-b border-slate-200 bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Profile Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="mt-4 h-4 w-64" />
            </div>

            {/* Courses Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <Skeleton className="h-6 w-48" />
              <div className="mt-4 space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex gap-4">
                    <Skeleton className="h-10 w-24 rounded" />
                    <Skeleton className="h-10 flex-1 rounded" />
                    <Skeleton className="h-10 w-16 rounded" />
                    <Skeleton className="h-10 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Results Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <Skeleton className="h-6 w-40" />
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-4">
                    <Skeleton className="h-10 w-24 rounded" />
                    <Skeleton className="h-10 flex-1 rounded" />
                    <Skeleton className="h-10 w-16 rounded" />
                    <Skeleton className="h-10 w-16 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Fees Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <Skeleton className="h-6 w-32" />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-8 w-24" />
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-8 w-32" />
                </div>
              </div>
            </div>

            {/* Registration Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <Skeleton className="h-6 w-40" />
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
