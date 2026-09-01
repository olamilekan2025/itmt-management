"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  Layers3,
  ShieldCheck,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface TrustStat {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const stats: TrustStat[] = [
  {
    number: "01",
    title: "One Platform",
    description:
      "A connected environment for managing essential academic and institutional processes.",
    icon: Layers3,
  },
  {
    number: "02",
    title: "Multiple Portals",
    description:
      "Purpose-built access for students, lecturers, administrators, and other institutional roles.",
    icon: UsersRound,
  },
  {
    number: "03",
    title: "Secure Records",
    description:
      "Role-aware access helps keep academic and institutional information protected.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    title: "Real-Time Access",
    description:
      "Important information stays accessible and up to date across the institution.",
    icon: Zap,
  },
];

export default function TrustStats() {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge
            variant="outline"
            className="border-brand-gold/40 bg-brand-gold/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-navy"
          >
            Why ITMT
          </Badge>

          <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-brand-navy md:text-4xl">
            A smarter way to manage education
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-500 md:text-base">
            ITMT brings essential institutional processes together in a
            structured, accessible, and connected digital environment.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.number}
                className="group relative overflow-hidden border-slate-200 bg-white shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-brand-navy/20 hover:shadow-xl"
              >
                <CardContent className="relative p-6">
                  {/* Decorative number */}
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 -top-5 select-none text-7xl font-bold tracking-tighter text-brand-navy/[0.04] transition-colors duration-300 group-hover:text-brand-navy/[0.07]"
                  >
                    {stat.number}
                  </span>

                  {/* Icon */}
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy transition-all duration-300 group-hover:bg-brand-navy group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>

                  {/* Number */}
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
                    {stat.number}
                  </p>

                  {/* Content */}
                  <h3 className="mt-2 text-lg font-semibold text-brand-navy">
                    {stat.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {stat.description}
                  </p>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-gold transition-all duration-300 group-hover:w-full" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}