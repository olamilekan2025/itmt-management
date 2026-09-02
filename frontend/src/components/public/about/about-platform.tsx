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

import { Card, CardContent } from "@/components/ui/card";

const capabilities = [
  {
    title: "Academic Management",
    description:
      "Manage programmes, departments, sessions, semesters, and courses.",
    icon: GraduationCap,
  },
  {
    title: "Student Management",
    description:
      "Organize student profiles, enrollment, and academic information.",
    icon: Users,
  },
  {
    title: "Course Registration",
    description:
      "Support structured course registration and academic planning.",
    icon: ClipboardList,
  },
  {
    title: "Results Management",
    description:
      "Manage and access academic results across the institution.",
    icon: BarChart3,
  },
  {
    title: "Finance Management",
    description:
      "Manage fees, payments, balances, receipts, and financial records.",
    icon: Wallet,
  },
  {
    title: "User & Role Management",
    description:
      "Organize institutional access according to user responsibilities.",
    icon: Settings2,
  },
  {
    title: "Reports",
    description:
      "Bring institutional information together for better oversight.",
    icon: BookOpen,
  },
  {
    title: "Notifications",
    description:
      "Keep users informed about relevant institutional activities.",
    icon: Bell,
  },
];

export default function AboutPlatform() {
  return (
    <section className="bg-brand-light py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Platform Capabilities
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
              More than a portal.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-500">
            ITMT is an interconnected management platform designed to bring
            different institutional responsibilities into one structured
            environment.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((capability) => {
            const Icon = capability.icon;

            return (
              <Card
                key={capability.title}
                className="group border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/30 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-brand-gold">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-brand-navy">
                    {capability.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {capability.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}