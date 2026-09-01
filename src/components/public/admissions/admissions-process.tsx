import { Search, FileCheck, Send, ClipboardCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const processSteps = [
  {
    number: "01",
    icon: Search,
    title: "Explore your options",
    description: "Review available programmes and academic opportunities to find the right fit for your goals.",
  },
  {
    number: "02",
    icon: FileCheck,
    title: "Review requirements",
    description: "Understand the admission requirements for your intended programme and prepare accordingly.",
  },
  {
    number: "03",
    icon: Send,
    title: "Submit your application",
    description: "Complete and submit your application through the institution's admissions portal.",
  },
  {
    number: "04",
    icon: ClipboardCheck,
    title: "Follow your admission status",
    description: "Track your application progress and respond to any additional requests from the admissions office.",
  },
];

export default function AdmissionsProcess() {
  return (
    <section className="py-16 bg-brand-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-sans text-3xl font-semibold leading-tight text-brand-navy sm:text-4xl">
            How the admissions process works
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Follow these steps to navigate the admissions journey.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step) => {
            const Icon = step.icon;

            return (
              <div key={step.number} className="relative">
                <Card className="h-full border-slate-200 bg-white transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <span className="text-xs font-bold tracking-widest text-brand-gold">
                      {step.number}
                    </span>

                    <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-light text-brand-navy">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-brand-navy">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Connector line for desktop */}
                <div className="absolute top-6 -right-4 hidden h-px w-8 bg-brand-navy/20 lg:block" />
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-center text-sm leading-6 text-slate-600">
            Depending on the institution&apos;s current admissions configuration,
            specific steps and requirements may vary. Please refer to official
            communications from the admissions office for the most accurate
            information.
          </p>
        </div>
      </div>
    </section>
  );
}
