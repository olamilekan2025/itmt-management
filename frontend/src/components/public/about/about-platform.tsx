import {
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Settings2,
  Users,
  Wallet,
} from "lucide-react";

const capabilities = [
  {
    title: "Academic Management",
    description:
      "Manage programmes, departments, academic sessions, semesters, and courses in one organized workspace.",
    icon: GraduationCap,
    number: "01",
  },
  {
    title: "Student Management",
    description:
      "Maintain student profiles, enrollment records, and essential academic information.",
    icon: Users,
    number: "02",
  },
  {
    title: "Course Registration",
    description:
      "Support structured course registration and help students plan their academic journey.",
    icon: ClipboardList,
    number: "03",
  },
  {
    title: "Results Management",
    description:
      "Organize academic results and make published performance records accessible.",
    icon: BarChart3,
    number: "04",
  },
  {
    title: "Finance Management",
    description:
      "Manage school fees, payments, outstanding balances, receipts, and financial records.",
    icon: Wallet,
    number: "05",
  },
  {
    title: "User & Role Management",
    description:
      "Control institutional access according to each user's responsibilities and permissions.",
    icon: Settings2,
    number: "06",
  },
  {
    title: "Reports & Insights",
    description:
      "Bring important institutional information together to support informed decisions.",
    icon: BookOpen,
    number: "07",
  },
  {
    title: "Notifications",
    description:
      "Keep students, lecturers, and administrators informed about relevant updates.",
    icon: Bell,
    number: "08",
  },
];

export default function AboutPlatform() {
  return (
    <section className="relative isolate overflow-hidden bg-[#F7F8FA] py-16 sm:py-20 lg:py-24">
      {/* Subtle background details */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 -z-10 h-80 w-80 rounded-full bg-brand-gold/[0.06] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-brand-navy/[0.035] blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-9">
        {/* Section introduction */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-navy shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            The ITMT platform
          </span>

          <h2 className="mt-5 text-3xl font-bold leading-[1.12] tracking-[-0.04em] text-brand-navy sm:text-4xl lg:text-5xl">
            More than a portal.{" "}
            <span className="text-brand-gradient">
              A complete platform.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            ITMT connects essential institutional operations in one
            structured digital environment, helping students, lecturers,
            and administrators manage their responsibilities more
            efficiently.
          </p>

          <div
            aria-hidden="true"
            className="mx-auto mt-6 h-1 w-12 rounded-full bg-brand-gold"
          />
        </div>

        {/* Capability cards */}
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {capabilities.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.title} className="h-full">
                <article className="group relative flex h-full min-h-[245px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-[0_18px_38px_rgba(15,23,42,0.085)] sm:min-h-[260px] sm:p-6">
                  {/* Gold top accent */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-brand-gold transition-transform duration-300 group-hover:scale-x-100"
                  />

                  {/* Card header */}
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/[0.055] text-brand-navy ring-1 ring-brand-navy/[0.04] transition-colors duration-300 group-hover:bg-brand-navy group-hover:text-brand-gold">
                      <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                    </span>

                    <span className="text-[11px] font-bold tracking-[0.16em] text-slate-300 transition-colors duration-300 group-hover:text-[#94751F]">
                      {item.number}
                    </span>
                  </div>

                  {/* Card content */}
                  <h3 className="mt-6 text-base font-bold leading-6 tracking-[-0.025em] text-brand-navy sm:text-[17px]">
                    {item.title}
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  {/* Decorative footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[11px] font-semibold tracking-wide text-slate-400 transition-colors duration-300 group-hover:text-brand-navy">
                      ITMT capability
                    </span>

                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all duration-300 group-hover:border-brand-navy group-hover:bg-brand-navy group-hover:text-brand-gold">
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </span>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        {/* Closing statement */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center sm:mt-10 sm:flex-row sm:gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
          <p className="text-xs font-medium leading-6 text-slate-500 sm:text-sm">
            One connected platform. Essential tools. Better institutional
            management.
          </p>
        </div>
      </div>
    </section>
  );
}
