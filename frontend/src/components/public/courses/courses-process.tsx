
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: GraduationCap,
    title: "Review your programme",
    description:
      "Understand the courses required for your specific programme and academic level.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Explore available courses",
    description:
      "Browse the course catalogue to discover courses offered within your department and semester.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Register your courses",
    description:
      "Complete your course registration through the academic portal according to your institution's requirements.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Confirm your registration",
    description:
      "Review your selected courses and verify that your registration is complete for the semester.",
  },
];

export default function CoursesProcess() {
  return (
    <section
      id="course-process"
      aria-labelledby="course-process-heading"
      className="relative overflow-hidden border-y border-slate-200/70 bg-[#FAFAFA] py-20 sm:py-24 lg:py-15"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-white px-3.5 py-2 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-navy sm:text-[11px]">
              Course registration guide
            </span>
          </div>

          <h2
            id="course-process-heading"
            className="text-3xl font-bold leading-tight tracking-[-0.04em] text-brand-navy sm:text-4xl lg:text-5xl"
          >
            Your path to successful{" "}
            <span className="text-brand-gold">registration</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            Follow these four essential steps to navigate the course
            registration process with clarity and confidence.
          </p>
        </div>

        {/* Steps */}
        <ol className="relative mt-14 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-6">
          {steps.map(({ number, icon: Icon, title, description }, index) => (
            <li
              key={number}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_3px_14px_rgba(27,40,71,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-[0_16px_35px_rgba(27,40,71,0.08)] sm:p-7"
            >
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy text-brand-gold transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-brand-navy">
                  <Icon
                    size={22}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>

                <span className="text-3xl font-bold tracking-tight text-slate-100 transition-colors duration-300 group-hover:text-brand-gold/25">
                  {number}
                </span>
              </div>

              {/* Gold accent */}
              <div className="mt-6 h-[2px] w-9 rounded-full bg-brand-gold transition-all duration-300 group-hover:w-14" />

              {/* Content */}
              <h3 className="mt-5 text-lg font-bold leading-snug tracking-[-0.025em] text-brand-navy sm:text-xl">
                {title}
              </h3>

              <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                {description}
              </p>

              {/* Footer */}
              <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Step {index + 1} of 4
                </span>
                <span className="ml-auto h-1 w-8 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-brand-gold"
                    style={{ width: `${((index + 1) / 4) * 100}%` }}
                  />
                </span>
              </div>
            </li>
          ))}
        </ol>

        {/* Closing message */}
        <div className="mx-auto mt-10 flex max-w-3xl items-center justify-center gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-5 py-4">
          <CheckCircle2
            className="h-5 w-5 shrink-0 text-brand-gold"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <p className="text-xs leading-6 text-slate-600 sm:text-sm">
            <span className="font-semibold text-brand-navy">
              Before you finish:
            </span>{" "}
            Make sure your selected courses match your programme and current
            academic level.
          </p>
        </div>
      </div>
    </section>
  );
}
