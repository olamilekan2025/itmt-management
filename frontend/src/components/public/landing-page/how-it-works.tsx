import {
  UserRoundPlus,
  LogIn,
  LayoutGrid,
  Bell,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

const steps = [
  {
    number: "01",
    icon: UserRoundPlus,
    title: "Get your account",
    description:
      "Your institution provides access based on your role and responsibilities.",
  },
  {
    number: "02",
    icon: LogIn,
    title: "Access your portal",
    description:
      "Sign in securely and access the dashboard designed for your role.",
  },
  {
    number: "03",
    icon: LayoutGrid,
    title: "Manage your activities",
    description:
      "Register courses, manage results, handle payments, or complete your assigned tasks.",
  },
  {
    number: "04",
    icon: Bell,
    title: "Stay informed",
    description:
      "Receive important academic, administrative, financial, and institutional updates.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-white py-20 md:py-24 lg:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-brand-light px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-navy">
              How ITMT Works
            </span>
          </div>

          <h2 className="mt-6 font-sans text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            Simple workflows.
            <span className="block text-brand-navy/70">
              Powerful results.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            ITMT simplifies everyday institutional processes so students,
            lecturers, finance teams, and administrators can focus on what
            matters most.
          </p>
        </div>

        {/* Desktop */}
        <div className="relative mt-14 hidden md:block lg:mt-16">
          {/* Connecting line */}
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-7 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
          />

          <div className="grid grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative text-center"
                >
                  {/* Number / Icon */}
                  <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-brand-navy shadow-sm transition-all duration-300 hover:border-brand-navy hover:bg-brand-navy hover:text-brand-gold hover:shadow-lg">
                    <Icon className="h-6 w-6" />
                  </div>

                  <p className="mt-5 text-xs font-bold tracking-[0.15em] text-brand-gold">
                    STEP {step.number}
                  </p>

                  <h3 className="mt-2 text-lg font-semibold text-brand-navy">
                    {step.title}
                  </h3>

                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile */}
        <div className="mt-12 space-y-4 md:hidden">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <Card
                key={step.number}
                className="relative overflow-hidden border-slate-200 shadow-none"
              >
                <CardContent className="flex gap-4 p-5">
                  <div className="flex shrink-0 flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand-navy">
                      <Icon className="h-5 w-5" />
                    </div>

                    {index < steps.length - 1 && (
                      <div className="mt-3 h-full min-h-8 w-px bg-slate-200" />
                    )}
                  </div>

                  <div className="pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
                      Step {step.number}
                    </p>

                    <h3 className="mt-1 text-base font-semibold text-brand-navy">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
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