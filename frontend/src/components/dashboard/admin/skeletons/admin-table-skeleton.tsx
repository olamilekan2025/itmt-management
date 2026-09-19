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

export function AdminTableSkeleton({
  rows = 8,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <main
      className="mx-auto w-full max-w-[1600px] space-y-6 pb-10"
      aria-busy="true"
      aria-label="Loading admin table"
    >
      {/* Page header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="flex gap-3">
          <Skeleton className="h-11 w-28 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-full lg:w-40 rounded-xl" />
          <Skeleton className="h-11 w-full lg:w-40 rounded-xl" />
          <Skeleton className="h-11 w-24 rounded-xl" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
        {/* Header */}
        <div className="hidden border-b border-slate-200 px-6 py-4 md:grid md:grid-cols-5 md:gap-6 dark:border-white/10">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-24" />
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4 px-6 py-5 md:grid-cols-5 md:items-center md:gap-6"
            >
              {Array.from({ length: columns }).map((_, columnIndex) => (
                <div key={columnIndex}>
                  {columnIndex === 0 ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ) : (
                    <Skeleton className="h-4 w-24 max-w-full" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-white/10">
          <Skeleton className="h-4 w-32" />

          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}