"use client";

import { motion } from "framer-motion";

import {
  ArrowUpRight,
  BookOpen,
  FileText,
  GraduationCap,
  Settings,
  Users,
  WalletCards,
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
      "Maintain complete student profiles, enrolment information, academic records, and institutional data.",
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
      "Allow lecturers to submit results, administrators to review and publish them, and students to access results securely.",
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
      className="relative overflow-hidden bg-white py-20 md:py-24 lg:py-28"
    >
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -right-40 top-20
          h-96 w-96
          rounded-full
          bg-brand-blue/[0.035]
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -left-40 bottom-10
          h-96 w-96
          rounded-full
          bg-brand-gold/[0.035]
          blur-3xl
        "
      />

      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          opacity-[0.018]
          [background-image:linear-gradient(rgba(15,23,42,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,1)_1px,transparent_1px)]
          [background-size:48px_48px]
        "
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Eyebrow */}
          <div className="mb-5 inline-flex items-center gap-3">
            <span className="h-px w-8 bg-brand-gold" />

            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-navy">
              Platform Features
            </span>

            <span className="h-px w-8 bg-brand-gold" />
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-navy sm:text-4xl lg:text-[44px]">
            Everything your institution needs,
            <span className="block text-brand-blue">
              connected in one platform.
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 md:text-[15px]">
            ITMT brings academic, student, administrative, financial, and
            institutional operations together so everyone can work with
            accurate information from one trusted system.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-12">
          {/* Featured academic management */}
          <div className="lg:col-span-6">
            <FeatureCard
              icon={features[0].icon}
              title={features[0].title}
              description={features[0].description}
              variant="featured"
              number="01"
            />
          </div>

          {/* Student management */}
          <div className="lg:col-span-3">
            <FeatureCard
              icon={features[1].icon}
              title={features[1].title}
              description={features[1].description}
              variant="compact"
              number="02"
            />
          </div>

          {/* Course registration */}
          <div className="lg:col-span-3">
            <FeatureCard
              icon={features[2].icon}
              title={features[2].title}
              description={features[2].description}
              variant="compact"
              number="03"
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <FeatureCard
              icon={features[3].icon}
              title={features[3].title}
              description={features[3].description}
              variant="light"
              number="04"
            />
          </div>

          {/* Finance */}
          <div className="lg:col-span-3">
            <FeatureCard
              icon={features[4].icon}
              title={features[4].title}
              description={features[4].description}
              variant="light"
              number="05"
            />
          </div>

          {/* Administration — wide */}
          <div className="sm:col-span-2 lg:col-span-6">
            <FeatureCard
              icon={features[5].icon}
              title={features[5].title}
              description={features[5].description}
              variant="institutional"
              number="06"
            />
          </div>
        </div>

        {/* Bottom statement */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
          className="
            mt-10
            flex items-center justify-center gap-3
            text-center
          "
        >
          <span className="h-px w-10 bg-slate-200" />

          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Academic • Administrative • Institutional
          </span>

          <span className="h-px w-10 bg-slate-200" />
        </motion.div>
      </div>
    </section>
  );
}

