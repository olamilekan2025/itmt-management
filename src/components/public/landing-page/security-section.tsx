import {
  ShieldCheck,
  LockKeyhole,
  UserCog,
  Database,
  CheckCircle2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const securityPrinciples = [
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description:
      "Protected authentication helps ensure that only authorized users can access the platform.",
  },
  {
    icon: LockKeyhole,
    title: "Role-Based Access",
    description:
      "Students, lecturers, finance staff, and administrators receive access based on their assigned roles.",
  },
  {
    icon: Database,
    title: "Protected Records",
    description:
      "Academic and institutional information is managed with controlled access and secure data handling.",
  },
  {
    icon: UserCog,
    title: "Controlled Permissions",
    description:
      "Administrators can manage roles, permissions, and access across the institution.",
  },
];

const securityHighlights = [
  "Role-based access control",
  "Protected institutional records",
  "Controlled administrative permissions",
];

export default function SecuritySection() {
  return (
    <section
      id="security"
      className="relative overflow-hidden bg-[#F1F5FA] py-20 md:py-24 lg:py-32"
    >
      {/* Background Decorations */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute right-0 top-0
          h-96 w-96
          translate-x-1/3 -translate-y-1/3
          rounded-full
          bg-brand-gold/10
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute bottom-0 left-0
          h-80 w-80
          -translate-x-1/3 translate-y-1/3
          rounded-full
          bg-brand-navy/5
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
          
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div
              className="
                inline-flex items-center gap-2
                rounded-full
                border border-brand-navy/10
                bg-white
                px-4 py-2
                shadow-sm
              "
            >
              <ShieldCheck className="h-4 w-4 text-brand-gold" />

              <span
                className="
                  text-xs font-semibold
                  uppercase tracking-[0.2em]
                  text-brand-navy
                "
              >
                Security
              </span>
            </div>

            {/* Heading */}
            <h2
              className="
                mt-6
                font-sans
                text-3xl font-semibold
                tracking-tight
                text-brand-navy
                sm:text-4xl
                lg:text-5xl
              "
            >
              Your institution&apos;s data deserves serious protection.
            </h2>

            {/* Description */}
            <p
              className="
                mt-5
                max-w-lg
                text-base leading-7
                text-slate-600
                md:text-lg
              "
            >
              ITMT is designed around controlled access, secure
              authentication, and clearly defined responsibilities across
              every institutional role.
            </p>

            {/* Highlights */}
            <div className="mt-8 space-y-4">
              {securityHighlights.map((item) => (
                <div
                  key={item}
                  className="
                    flex items-center gap-3
                    text-sm font-medium
                    text-brand-navy
                  "
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gold/15">
                    <CheckCircle2 className="h-4 w-4 text-brand-gold" />
                  </div>

                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Security Cards */}
          <div className="grid gap-5 sm:grid-cols-2">
            {securityPrinciples.map((principle) => {
              const Icon = principle.icon;

              return (
                <Card
                  key={principle.title}
                  className="
                    group
                    relative
                    overflow-hidden
                    border-slate-200/80
                    bg-white
                    shadow-sm
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-brand-gold/40
                    hover:shadow-xl
                  "
                >
                  {/* Top accent */}
                  <div
                    className="
                      absolute left-0 top-0
                      h-1 w-0
                      bg-brand-gold
                      transition-all duration-300
                      group-hover:w-full
                    "
                  />

                  <CardContent className="p-6 sm:p-7">
                    {/* Icon */}
                    <div
                      className="
                        flex h-12 w-12
                        items-center justify-center
                        rounded-xl
                        bg-brand-navy/5
                        text-brand-navy
                        transition-all duration-300
                        group-hover:bg-brand-navy
                        group-hover:text-brand-gold
                        group-hover:shadow-lg
                      "
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Title */}
                    <h3 className="mt-5 text-lg font-semibold text-brand-navy">
                      {principle.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {principle.description}
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