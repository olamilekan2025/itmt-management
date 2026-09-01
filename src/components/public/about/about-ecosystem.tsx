import {
  Building2,
  GraduationCap,
  Wallet,
  BookOpen,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const roles = [
  {
    title: "Student",
    description:
      "Access academic information, register courses, view results, and manage your student profile.",
    icon: GraduationCap,
  },
  {
    title: "Lecturer",
    description:
      "Manage assigned courses and academic responsibilities.",
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

export default function AboutEcosystem() {
  return (
    <section className="bg-white py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            The ITMT Ecosystem
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
            Everything works together.
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            ITMT connects the major areas of institutional management so
            information can move between the people and processes that depend
            on it.
          </p>
        </div>

        {/* Desktop ecosystem */}
        <div className="relative mx-auto mt-16 hidden max-w-5xl lg:block">
          <div className="absolute left-1/2 top-1/2 h-px w-[70%] -translate-x-1/2 bg-slate-200" />

          <div className="absolute left-1/2 top-1/2 h-[70%] w-px -translate-y-1/2 bg-slate-200" />

          <div className="grid grid-cols-3 items-center gap-10">
            <div className="space-y-10">
              <EcosystemCard role={roles[0]} />
              <EcosystemCard role={roles[3]} />
            </div>

            <div className="flex justify-center">
              <div className="relative z-10 flex h-40 w-40 items-center justify-center rounded-2xl border border-brand-navy bg-brand-navy text-center shadow-xl">
                <div>
                  <p className="text-sm font-bold tracking-[0.2em] text-brand-gold">
                    ITMT
                  </p>

                  <p className="mt-2 text-xs text-white/60">
                    MANAGEMENT
                    <br />
                    SYSTEM
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-10">
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

function EcosystemCard({
  role,
}: {
  role: (typeof roles)[number];
}) {
  const Icon = role.icon;

  return (
    <Card className="group border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/30 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-brand-gold">
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold text-brand-navy">
              {role.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {role.description}
            </p>
          </div>
        </div>

        <ArrowRight className="mt-5 h-4 w-4 text-brand-gold opacity-0 transition-opacity group-hover:opacity-100" />
      </CardContent>
    </Card>
  );
}