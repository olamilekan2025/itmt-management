"use client";

import { Zap, Shield, Layers3, BookOpen } from "lucide-react";

export default function ResultsInformation() {
  const principles = [
    {
      icon: Zap,
      title: "Accurate Records",
      description: "Results reflect grades and scores recorded by course lecturers and validated by academic administration.",
    },
    {
      icon: Shield,
      title: "Role-Aware Access",
      description: "Only authenticated students can view their own results. Results are organized by institution configuration.",
    },
    {
      icon: Layers3,
      title: "Structured Results",
      description: "Results are organized by semester and session, with course details including credit units and grades.",
    },
    {
      icon: BookOpen,
      title: "Clear Academic History",
      description: "Access your complete academic record across semesters and sessions on the ITMT platform.",
    },
  ];

  return (
    <section className="border-t border-slate-100 bg-[#F1F5FA] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Visual */}
          <div className="order-2 lg:order-1">
            <div className="relative aspect-square max-w-lg overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy to-brand-blue lg:mx-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-6 p-12">
                  {principles.map((principle, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-6 backdrop-blur-sm"
                    >
                      <principle.icon className="h-8 w-8 text-brand-gold" />
                      <div className="h-2 w-16 rounded-full bg-white/20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 space-y-6 lg:order-2">
            <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
              Academic results, organized clearly.
            </h2>
            <div className="space-y-4 text-slate-600">
              <p className="text-lg">
                ITMT provides a structured environment for students and authorized institutional users to work with academic result information.
              </p>
              <p>
                The platform ensures that students can securely access their academic performance data while maintaining the privacy and security of sensitive academic information.
              </p>
            </div>

            <div className="grid gap-6 pt-4 sm:grid-cols-2">
              {principles.map((principle, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light">
                    <principle.icon className="h-5 w-5 text-brand-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">
                      {principle.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      {principle.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
