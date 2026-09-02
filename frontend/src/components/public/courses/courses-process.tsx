import { GraduationCap, BookOpen, ClipboardCheck, CheckCircle2 } from "lucide-react";

export default function CoursesProcess() {
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
        "Browse the course catalogue to see what courses are offered in your department and semester.",
    },
    {
      number: "03",
      icon: ClipboardCheck,
      title: "Register your courses",
      description:
        "Depending on your institution's configuration, complete the course registration process through the portal.",
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: "Confirm your registration",
      description:
        "Review and confirm your selected courses to complete your registration for the semester.",
    },
  ];

  return (
    <section id="course-process" className="border-t border-slate-100 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
            How course registration works
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            A structured process helps students understand and manage their
            academic course selections.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step number */}
              <div className="mb-4 text-4xl font-bold text-brand-gold/30">
                {step.number}
              </div>

              {/* Icon */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-light text-brand-navy">
                <step.icon className="h-7 w-7" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-brand-navy">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>

              {/* Connector line (desktop) */}
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-7 hidden h-0.5 w-1/2 -translate-y-1/2 bg-slate-200 lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
