"use client";

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-white/10 ${className}`}
    />
  );
}

export function AdminDetailSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-[1400px] space-y-6 pb-10"
      aria-busy="true"
      aria-label="Loading admin details"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <Skeleton className="h-6 w-40" />

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-40 max-w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <Skeleton className="h-6 w-44" />

            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-100 p-4 dark:border-white/5"
                >
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="mt-3 h-3 w-full max-w-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <Skeleton className="mx-auto h-20 w-20 rounded-full" />

            <Skeleton className="mx-auto mt-5 h-5 w-32" />
            <Skeleton className="mx-auto mt-2 h-4 w-44 max-w-full" />

            <div className="mt-6 space-y-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <Skeleton className="h-5 w-32" />

            <div className="mt-5 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}