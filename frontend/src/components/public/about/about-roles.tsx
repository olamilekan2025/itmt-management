import { BookOpen, Check, GraduationCap, ShieldCheck } from "lucide-react";

const roles = [
  {
    title: "Students",
    description: "Everything students need to manage their academic journey.",
    icon: GraduationCap,
    items: [
      "Course registration",
      "Results",
      "Academic information",
      "Notifications",
      "Finance information",
    ],
  },
  {
    title: "Lecturers",
    description: "Tools to support teaching and academic responsibilities.",
    icon: BookOpen,
    items: [
      "Assigned courses",
      "Student information",
      "Result management",
      "Academic activities",
    ],
  },
  {
    title: "Administrators",
    description: "Centralized control for institutional operations.",
    icon: ShieldCheck,
    items: [
      "User management",
      "Programmes",
      "Departments",
      "Courses",
      "Sessions",
      "Results",
      "Finance",
      "Reports",
    ],
  },
];

export default function AboutRoles() {
  return (
    <section className="bg-[#FFFFFF] py-20 sm:py-24 lg:py-15">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-9">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-navy shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            Built around your role
          </span>

          <h2 className="text-3xl font-bold tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl">
            Designed for every side of the institution.
          </h2>

          <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Each role gets a focused set of tools built around its responsibilities.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const dark = index === 2;

            return (
              <article
                key={role.title}
                className={`group relative isolate flex flex-col overflow-hidden rounded-3xl border border-t-[3px] border-t-brand-gold p-8 transition-all duration-300 hover:-translate-y-1 ${dark
                    ? "border-brand-navy bg-brand-navy text-white shadow-[0_28px_60px_-24px_rgba(15,23,42,0.55)]"
                    : "border-slate-200/70 bg-white shadow-[0_2px_4px_rgba(15,23,42,0.03),0_16px_36px_-18px_rgba(15,23,42,0.15)] hover:shadow-[0_28px_52px_-22px_rgba(15,23,42,0.22)]"
                  }`}
              >
                {dark && (
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/[0.07]" />
                    <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-brand-gold/[0.12] blur-3xl" />
                  </div>
                )}

                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${dark
                      ? "border border-white/10 bg-white/[0.08] text-brand-gold"
                      : "bg-brand-navy/[0.06] text-brand-navy"
                    }`}
                >
                  <Icon size={24} aria-hidden="true" />
                </span>

                <h3 className={`mt-6 text-xl font-bold tracking-[-0.02em] ${dark ? "text-white" : "text-brand-navy"}`}>
                  {role.title}
                </h3>

                <p className={`mt-3 text-[15px] leading-7 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  {role.description}
                </p>

                <ul className={`mt-7 space-y-3 border-t pt-6 ${dark ? "border-white/10" : "border-slate-200/80"}`}>
                  {role.items.map((item) => (
                    <li
                      key={item}
                      className={`flex items-center gap-3 text-sm ${dark ? "text-white/80" : "text-slate-700"}`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${dark ? "bg-brand-gold text-brand-navy" : "bg-brand-gold/20 text-[#8A6D1F]"
                          }`}
                      >
                        <Check size={12} strokeWidth={3} aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}