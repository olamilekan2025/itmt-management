import {
  GraduationCap,
  Users,
  BookOpen,
  FileText,
  WalletCards,
  Settings,
} from "lucide-react";

import FeatureCard from "./feature-card";

const features = [
  {
    icon: GraduationCap,
    title: "Academic Management",
    description:
      "Organize departments, programmes, academic sessions, semesters, and courses from one central platform.",
  },
  {
    icon: Users,
    title: "Student Management",
    description:
      "Maintain complete student profiles, enrollment information, academic records, and institutional data.",
  },
  {
    icon: BookOpen,
    title: "Course Registration",
    description:
      "Make course registration simple for students while giving administrators clear oversight of registrations.",
  },
  {
    icon: FileText,
    title: "Results Management",
    description:
      "Allow lecturers to submit results, administrators to review and publish them, and students to access their results securely.",
  },
  {
    icon: WalletCards,
    title: "Finance Management",
    description:
      "Manage fee structures, payments, balances, receipts, scholarships, and financial records in one place.",
  },
  {
    icon: Settings,
    title: "Administration",
    description:
      "Give administrators the tools they need to manage users, academic structures, institutional operations, and system settings.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-white py-20 md:py-24 lg:py-32"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-gold/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-brand-light px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-navy">
              Platform Features
            </span>
          </div>

          <h2 className="mt-6 font-sans text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            Everything your institution needs,
            <span className="block text-brand-navy/70">
              connected in one platform.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            ITMT brings academic, student, administrative, financial, and
            institutional operations together so everyone can work with
            accurate information from one trusted system.
          </p>
        </div>

        {/* Features */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}