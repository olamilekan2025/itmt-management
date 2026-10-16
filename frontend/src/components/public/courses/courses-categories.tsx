
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  GraduationCap,
  Layers3,
  type LucideIcon,
} from "lucide-react";

const categories: {
  icon: LucideIcon;
  title: string;
  description: string;
  number: string;
  label: string;
}[] = [
  {
    icon: Building2,
    title: "Departments",
    description:
      "Discover the academic departments that bring related disciplines together and support focused learning.",
    number: "01",
    label: "Academic units",
  },
  {
    icon: GraduationCap,
    title: "Programmes",
    description:
      "Explore structured programmes designed to guide your academic journey and learning objectives.",
    number: "02",
    label: "Study pathways",
  },
  {
    icon: Layers3,
    title: "Academic Levels",
    description:
      "Understand the stages of academic progression, from foundational study to advanced learning.",
    number: "03",
    label: "Study progression",
  },
  {
    icon: CalendarDays,
    title: "Semesters",
    description:
      "Explore the academic periods that organize course delivery, assessments, and student progression.",
    number: "04",
    label: "Academic calendar",
  },
];

export default function CoursesCategories() {
  return (
    <section className="relative isolate overflow-hidden border-t border-slate-100 bg-white py-20 sm:py-24 lg:py-28">
      {/* Subtle brand accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-12 h-80 w-80 rounded-full bg-brand-gold/[0.07] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-brand-navy/[0.04] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-brand-gold/25 bg-brand-gold/[0.07] px-4 py-2">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-brand-gold"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-navy sm:text-[11px]">
              Your academic journey
            </span>
          </div>

          <h2 className="text-3xl font-bold leading-tight tracking-[-0.04em] text-brand-navy sm:text-4xl lg:text-5xl">
            Explore our{" "}
            <span className="relative inline-block">
              academic structure
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-[3px] w-1/3 rounded-full bg-brand-gold sm:-bottom-2"
              />
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            A well-organized academic framework that connects departments,
            programmes, study levels, and semesters to create a clearer path
            towards your educational goals.
          </p>
        </div>

        {/* Category cards */}
        <div className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {categories.map(
            ({ icon: Icon, title, description, number, label }) => (
              <article
                key={title}
                className="group relative flex min-h-[290px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.035)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-[0_18px_45px_rgba(27,40,71,0.09)] sm:p-7"
              >
                {/* Top accent */}
                <div className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-brand-gold transition-transform duration-300 group-hover:scale-x-100" />

                {/* Decorative number */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-5 top-4 text-5xl font-bold tracking-tighter text-slate-100 transition-colors duration-300 group-hover:text-brand-gold/10"
                >
                  {number}
                </span>

                {/* Icon */}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 text-brand-navy transition-colors duration-300 group-hover:border-brand-navy group-hover:bg-brand-navy group-hover:text-brand-gold">
                  <Icon
                    className="h-6 w-6"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <div className="relative mt-7">
                  <h3 className="text-lg font-bold tracking-[-0.025em] text-brand-navy sm:text-xl">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {description}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-5 mt-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    {label}
                  </span>

                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all duration-300 group-hover:border-brand-gold/40 group-hover:bg-brand-navy group-hover:text-brand-gold"
                  >
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      strokeWidth={1.8}
                    />
                  </span>
                </div>
              </article>
            ),
          )}
        </div>

        {/* Bottom note */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 border-t border-slate-100 pt-7 text-center sm:flex-row sm:gap-4">
          <GraduationCap
            className="h-5 w-5 text-brand-gold"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <p className="text-xs leading-6 text-slate-500 sm:text-sm">
            Every element works together to support a structured and rewarding
            academic experience.
          </p>
        </div>
      </div>
    </section>
  );
}
