import {
  Building2,
  GraduationCap,
  Wallet,
  Users,
} from "lucide-react";

import { Card } from "@/components/ui/card";

const areas = [
  {
    title: "Students",
    icon: GraduationCap,
  },
  {
    title: "Lecturers",
    icon: Users,
  },
  {
    title: "Administrators",
    icon: Building2,
  },
  {
    title: "Finance",
    icon: Wallet,
  },
];

export default function AboutIntroduction() {
  return (
    <section className="bg-white py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              The Platform
            </p>

            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
              One platform. A complete academic ecosystem.
            </h2>

            <div className="mt-8 border-l-2 border-brand-gold pl-6">
              <p className="text-xl font-medium leading-8 text-brand-navy sm:text-2xl">
                Connect the people, processes, and information that keep an
                institution moving.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-base leading-8 text-slate-600">
              Educational institutions manage thousands of records, processes,
              interactions, and decisions every day. ITMT was designed to
              bring these activities together into a structured, secure, and
              accessible digital environment.
            </p>

            <p className="text-base leading-8 text-slate-600">
              From the moment a student creates an account to course
              registration, academic results, payments, and administrative
              processes, ITMT provides the tools needed to keep information
              connected and operations organized.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 border-y border-slate-200 sm:grid-cols-4">
          {areas.map((area) => {
            const Icon = area.icon;

            return (
              <Card
                key={area.title}
                className="rounded-none border-0 border-r border-slate-200 bg-transparent p-5 shadow-none last:border-r-0"
              >
                <Icon className="h-5 w-5 text-brand-gold" />

                <p className="mt-3 text-sm font-semibold text-brand-navy">
                  {area.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Connected role
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}