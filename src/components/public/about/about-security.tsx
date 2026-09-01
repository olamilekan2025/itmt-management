import {
  Database,
  LockKeyhole,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const securityItems = [
  {
    title: "Secure Authentication",
    description:
      "Authentication helps ensure that access begins with an identified user.",
    icon: LockKeyhole,
  },
  {
    title: "Role-Based Access",
    description:
      "Users interact with areas of the platform relevant to their responsibilities.",
    icon: ShieldCheck,
  },
  {
    title: "Controlled Administration",
    description:
      "Administrative responsibilities are separated from other institutional roles.",
    icon: UserCog,
  },
  {
    title: "Protected Records",
    description:
      "Institutional records are managed through controlled access within the platform.",
    icon: Database,
  },
];

export default function AboutSecurity() {
  return (
    <section className="relative overflow-hidden bg-brand-navy py-20 md:py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-gold/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <ShieldCheck className="h-4 w-4 text-brand-gold" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Security & Trust
              </span>
            </div>

            <h2 className="mt-6 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Built with trust in mind.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/60 md:text-lg">
              ITMT uses role-aware access and authentication to ensure users
              interact with the areas of the platform relevant to their
              responsibilities.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {securityItems.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="group border-white/10 bg-white/[0.04] text-white shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/30 hover:bg-white/[0.07]"
                >
                  <CardContent className="p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 text-base font-semibold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/50">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}