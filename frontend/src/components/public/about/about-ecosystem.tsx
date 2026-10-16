import { BookOpen, Building2, GraduationCap, Wallet } from "lucide-react";

const roles = [
  {
    title: "Student",
    description:
      "Access academic information, register courses, view results, and manage your student profile.",
    icon: GraduationCap,
  },
  {
    title: "Lecturer",
    description: "Manage assigned courses and academic responsibilities.",
    icon: BookOpen,
  },
  {
    title: "Administration",
    description:
      "Manage institutional operations, users, courses, programmes, and academic records.",
    icon: Building2,
  },
  {
    title: "Finance",
    description:
      "Manage fees, payments, balances, receipts, and financial information.",
    icon: Wallet,
  },
];

function EcosystemCard({ role }: { role: (typeof roles)[number] }) {
  const Icon = role.icon;

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-slate-200/70 border-t-[3px] border-t-brand-gold bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_14px_32px_-16px_rgba(15,23,42,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-t-brand-navy hover:shadow-[0_26px_48px_-20px_rgba(15,23,42,0.22)]">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy transition-colors duration-300 group-hover:bg-brand-navy group-hover:text-brand-gold">
          <Icon size={22} aria-hidden="true" />
        </span>

        <div>
          <h3 className="text-lg font-bold tracking-[-0.01em] text-brand-navy">
            {role.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {role.description}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function AboutEcosystem() {
  return (
    <section className="relative overflow-hidden bg-[#FFFFFF] py-20 sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-brand-gold/[0.07] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl">
            Everything works together.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            ITMT connects the major areas of institutional management so
            information can move between the people and processes that depend
            on it.
          </p>
        </div>

        {/* Desktop */}
        <div className="relative mx-auto mt-16 hidden max-w-6xl lg:block">
          <div aria-hidden="true" className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-12">
            <div className="relative z-10 space-y-6">
              <EcosystemCard role={roles[0]} />
              <EcosystemCard role={roles[3]} />
            </div>

            <div className="relative z-10 flex h-48 w-48 flex-col items-center justify-center rounded-[2rem] bg-brand-navy text-center shadow-[0_30px_70px_-24px_rgba(15,23,42,0.6)] ring-8 ring-white">
              <div aria-hidden="true" className="absolute -inset-6 rounded-[2.5rem] border border-brand-gold/25" />
              <p className="text-xl font-bold tracking-[0.14em] text-brand-gold">ITMT</p>
              <p className="mt-2 text-xs leading-4 text-white/60">
                Management
                <br />
                System
              </p>
            </div>

            <div className="relative z-10 space-y-6">
              <EcosystemCard role={roles[1]} />
              <EcosystemCard role={roles[2]} />
            </div>
          </div>
        </div>

        {/* Mobile / tablet */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:hidden">
          {roles.map((role) => (
            <EcosystemCard key={role.title} role={role} />
          ))}
        </div>
      </div>
    </section>
  );
}