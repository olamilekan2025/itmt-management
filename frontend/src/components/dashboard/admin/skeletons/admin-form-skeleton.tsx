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

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}

export function AdminFormSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-[1400px] space-y-6 pb-10"
      aria-busy="true"
      aria-label="Loading admin form"
    >
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-slate-900">
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <FieldSkeleton key={index} />
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-white/5">
          <Skeleton className="h-11 w-24 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </div>
    </main>
  );
}