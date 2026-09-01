import {
  BookOpen,
  Check,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const roles = [
  {
    title: "Students",
    description:
      "Everything students need to manage their academic journey.",
    icon: GraduationCap,
    items: [
      "Course registration",
      "Results",
      "Academic information",
      "Notifications",
      "Finance information",
    ],
  },
  {
    title: "Lecturers",
    description:
      "Tools to support teaching and academic responsibilities.",
    icon: BookOpen,
    items: [
      "Assigned courses",
      "Student information",
      "Result management",
      "Academic activities",
    ],
  },
  {
    title: "Administrators",
    description:
      "Centralized control for institutional operations.",
    icon: ShieldCheck,
    items: [
      "User management",
      "Programmes",
      "Departments",
      "Courses",
      "Sessions",
      "Results",
      "Finance",
      "Reports",
    ],
  },
];

export default function AboutRoles() {
  return (
    <section className="bg-white py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Who ITMT Is For
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
            Designed for every side of the institution.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const featured = index === 2;

            return (
              <Card
                key={role.title}
                className={
                  featured
                    ? "border-brand-navy bg-brand-navy text-white shadow-lg"
                    : "border-slate-200 bg-white shadow-sm"
                }
              >
                <CardContent className="p-7">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      featured
                        ? "bg-white/10 text-brand-gold"
                        : "bg-brand-light text-brand-navy"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3
                    className={`mt-6 text-xl font-semibold ${
                      featured ? "text-white" : "text-brand-navy"
                    }`}
                  >
                    {role.title}
                  </h3>

                  <p
                    className={`mt-3 text-sm leading-6 ${
                      featured ? "text-white/60" : "text-slate-500"
                    }`}
                  >
                    {role.description}
                  </p>

                  <div className="mt-7 space-y-3">
                    {role.items.map((item) => (
                      <div
                        key={item}
                        className={`flex items-center gap-3 text-sm ${
                          featured ? "text-white/75" : "text-slate-600"
                        }`}
                      >
                        <Check
                          className={`h-4 w-4 shrink-0 ${
                            featured
                              ? "text-brand-gold"
                              : "text-brand-navy"
                          }`}
                        />

                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}