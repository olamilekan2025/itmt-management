import {
  GraduationCap,
  ClipboardCheck,
  FileText,
  CalendarDays,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const overviewCards = [
  {
    icon: GraduationCap,
    title: "Programmes",
    description: "Explore the academic programmes available across departments and disciplines.",
  },
  {
    icon: ClipboardCheck,
    title: "Requirements",
    description: "Review the admission requirements for your intended programme of study.",
  },
  {
    icon: FileText,
    title: "Application Process",
    description: "Understand the steps involved in submitting your application.",
  },
  {
    icon: CalendarDays,
    title: "Academic Sessions",
    description: "Learn about the academic calendar and session schedules.",
  },
];

export default function AdmissionsOverview() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-sans text-3xl font-semibold leading-tight text-brand-navy sm:text-4xl">
            Understanding admissions
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Get familiar with the key aspects of the admissions process.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.title} className="border-slate-200 transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-light text-brand-navy">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4 text-lg">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-slate-600">
                    {card.description}
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
