import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  GraduationCap,
  Wallet,
  BarChart3,
  Users,
} from "lucide-react";

import { Card } from "@/components/ui/card";

const areas = [
  {
    title: "Students",
    icon: GraduationCap,
    position: "left-0 top-8",
  },
  {
    title: "Courses",
    icon: BookOpen,
    position: "right-0 top-2",
  },
  {
    title: "Results",
    icon: BarChart3,
    position: "right-4 bottom-10",
  },
  {
    title: "Finance",
    icon: Wallet,
    position: "left-4 bottom-2",
  },
  {
    title: "Administration",
    icon: Building2,
    position: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  },
];

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-brand-light">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-brand-navy/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Content */}
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-brand-navy/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-navy shadow-sm">
              About ITMT
            </span>

            <h1 className="mt-6 font-sans text-4xl font-semibold leading-tight tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
              Transforming the way institutions manage education.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              ITMT Management System brings academic administration, student
              services, finance, and institutional operations together in one
              connected digital platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/login"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-brand-navy px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
              >
                Access Your Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/#features"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-brand-navy/15 bg-white px-6 text-sm font-medium text-brand-navy transition-all hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
              >
                Explore the Platform
              </Link>
            </div>
          </div>

          {/* Ecosystem Visual */}
          <div className="relative mx-auto h-[430px] w-full max-w-xl">
            {/* Connecting structure */}
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-navy/10" />

            <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-gold/20" />

            {/* Central card */}
            <Card className="absolute left-1/2 top-1/2 z-20 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-brand-navy bg-brand-navy shadow-xl">
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-navy">
                  <Building2 className="h-5 w-5" />
                </div>

                <p className="mt-3 text-xs font-bold tracking-wider text-white">
                  ITMT
                </p>

                <p className="mt-1 text-[10px] text-white/50">
                  Management System
                </p>
              </div>
            </Card>

            {/* Decorative connection lines */}
            <div className="absolute left-1/2 top-1/2 h-px w-72 -translate-x-1/2 bg-brand-navy/10" />
            <div className="absolute left-1/2 top-1/2 h-72 w-px -translate-y-1/2 bg-brand-navy/10" />

            {/* Area cards */}
            {areas.map((area) => {
              const Icon = area.icon;

              return (
                <Card
                  key={area.title}
                  className={`absolute z-30 flex items-center gap-3 border-slate-200 bg-white px-4 py-3 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-lg ${area.position}`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand-navy">
                    <Icon className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-semibold text-brand-navy">
                    {area.title}
                  </span>
                </Card>
              );
            })}

            {/* Users accent */}
            <div className="absolute bottom-24 right-16 flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold">
              <Users className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}