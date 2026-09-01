import {
  Accessibility,
  Gauge,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    number: "01",
    title: "Simplicity",
    description:
      "Technology should make institutional processes easier, not more complicated.",
    icon: Sparkles,
  },
  {
    number: "02",
    title: "Reliability",
    description:
      "Academic and financial information must remain organized, accessible, and dependable.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Security",
    description:
      "Access to institutional information should be controlled according to the responsibilities of each user.",
    icon: LockKeyhole,
  },
  {
    number: "04",
    title: "Transparency",
    description:
      "Clear information helps students, staff, and administrators make better decisions.",
    icon: Accessibility,
  },
  {
    number: "05",
    title: "Efficiency",
    description:
      "Reduce unnecessary manual processes and give people more time to focus on what matters.",
    icon: Gauge,
  },
  {
    number: "06",
    title: "Continuous Improvement",
    description:
      "Build a platform that can evolve alongside the institution.",
    icon: RefreshCw,
  },
];

export default function AboutValues() {
  return (
    <section className="bg-brand-light py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Our Values
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
            Built around principles that matter.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <Card
                key={value.number}
                className="group border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-navy/20 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-semibold text-brand-navy/10">
                      {value.number}
                    </span>

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-brand-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-brand-navy">
                    {value.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {value.description}
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