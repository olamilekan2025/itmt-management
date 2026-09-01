import { BookOpen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CoursesHeaderProps {
  onCreate: () => void;
}

export default function CoursesHeader({
  onCreate,
}: CoursesHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-brand-navy shadow-lg">
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-brand-gold/10 blur-3xl" />

      <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="absolute right-1/3 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">
        {/* Header content */}
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
              <BookOpen className="h-5 w-5 text-brand-gold" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Academic Management
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Courses
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Manage courses, credit units, academic levels,
            programmes, and semester assignments across your
            institution.
          </p>
        </div>

        {/* Create button */}
        <Button
          onClick={onCreate}
          className="h-11 shrink-0 rounded-xl bg-brand-gold px-5 font-semibold text-brand-dark shadow-md transition hover:bg-brand-gold/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>
    </section>
  );
}
