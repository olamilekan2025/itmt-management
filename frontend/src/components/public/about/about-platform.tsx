import {
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
    description: "Manage programmes, departments, sessions, semesters, and courses.",
    icon: GraduationCap,
  },
  {
    title: "Student Management",
    description: "Organize student profiles, enrollment, and academic information.",
    icon: Users,
  },
  {
    title: "Course Registration",
    description: "Support structured course registration and academic planning.",
    icon: ClipboardList,
  },
  {
    title: "Results Management",
    description: "Manage and access academic results across the institution.",
    icon: BarChart3,
  },
  {
    title: "Finance Management",
    description: "Manage fees, payments, balances, receipts, and financial records.",
    icon: Wallet,
  },
  {
    title: "User & Role Management",
    description: "Organize institutional access according to user responsibilities.",
    icon: Settings2,
  },
  {
    title: "Reports",
    description: "Bring institutional information together for better oversight.",
    icon: BookOpen,
  },
  {
    title: "Notifications",
    description: "Keep users informed about relevant institutional activities.",
    icon: Bell,
  },
];

export default function AboutPlatform() {
  return (
    <section className="bg-[#FAFAFA] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-20">
          <h2 className="max-w-2xl text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl">
            More than a portal.
          </h2>

          <p className="max-w-md text-base leading-7 text-slate-600 lg:justify-self-end">
            ITMT is an interconnected management platform designed to bring
            different institutional responsibilities into one structured
            environment.
          </p>
        </div>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.25)] sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => {
            const Icon = item.icon;

            return (
              <li
                key={item.title}
                className="group relative bg-white p-7 transition-colors duration-300 hover:bg-brand-navy"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy transition-colors duration-300 group-hover:bg-white/10 group-hover:text-brand-gold">
                  <Icon size={22} aria-hidden="true" />
                </span>

                <h3 className="mt-6 text-base font-bold tracking-[-0.01em] text-brand-navy transition-colors duration-300 group-hover:text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 transition-colors duration-300 group-hover:text-slate-300">
                  {item.description}
                </p>

                <span
                  aria-hidden="true"
                  className="absolute inset-x-7 bottom-0 h-[3px] origin-left scale-x-0 rounded-t bg-brand-gold transition-transform duration-300 group-hover:scale-x-100"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}