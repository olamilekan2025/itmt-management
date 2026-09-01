"use client";

import { Lock, Users, CheckCircle, Database } from "lucide-react";

export default function ResultsSecurity() {
  const features = [
    {
      icon: Lock,
      title: "Protected Student Records",
      description: "Academic results are secured with authentication and role-based access control.",
    },
    {
      icon: Users,
      title: "Role-Aware Access",
      description: "Only authorized students can access their own results through verified authentication.",
    },
    {
      icon: CheckCircle,
      title: "Controlled Access",
      description: "Results visibility is managed by academic administrators according to institutional policies.",
    },
    {
      icon: Database,
      title: "Structured Data",
      description: "Results are organized and maintained according to institutional academic requirements.",
    },
  ];

  return (
    <section className="border-t border-slate-100 bg-[#F1F5FA] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
            Academic information deserves responsible access.
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            ITMT separates authenticated student access from administrative result management so that result information is accessed according to configured permissions.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand-navy mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-brand-navy">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="max-w-3xl">
            <h3 className="text-lg font-semibold text-brand-navy mb-4">
              How ITMT protects your academic information
            </h3>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 text-brand-gold mt-1">✓</span>
                <span>Student authentication is required to access academic results.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 text-brand-gold mt-1">✓</span>
                <span>Each student can only view their own academic results.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 text-brand-gold mt-1">✓</span>
                <span>Results visibility is controlled by institution configuration.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 text-brand-gold mt-1">✓</span>
                <span>All access is managed through secure API endpoints with proper authorization.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
