"use client";

import { FileSearch, Send, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ResultsProcess() {
  const steps = [
    {
      number: "01",
      icon: FileSearch,
      title: "Sign in to your account",
      description: "Access the ITMT platform using your verified student credentials.",
    },
    {
      number: "02",
      icon: Send,
      title: "Navigate to results",
      description: "Go to your student dashboard and view your academic results section.",
    },
    {
      number: "03",
      icon: ShieldCheck,
      title: "Browse your results",
      description: "View your results organized by semester with scores, grades, and course details.",
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: "Track your progress",
      description: "Review your academic performance across semesters and sessions.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
            How result access works
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Access your academic results securely through the ITMT student portal in four straightforward steps.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute left-[50%] top-20 w-full h-0.5 bg-gradient-to-r from-brand-gold/50 to-transparent" />
              )}

              {/* Card */}
              <div className="relative z-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-light text-brand-navy">
                      <span className="text-sm font-bold">{step.number}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <step.icon className="h-5 w-5 text-brand-gold mb-2" />
                    <h3 className="text-lg font-semibold text-brand-navy">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
