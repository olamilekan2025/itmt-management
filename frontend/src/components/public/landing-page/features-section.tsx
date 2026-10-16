"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Settings2,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const features: Feature[] = [
  {
    title: "Academic Management",
    description:
      "Manage departments, programmes, academic sessions, semesters, and courses through a unified academic structure.",
    icon: GraduationCap,
  },
  {
    title: "Student Management",
    description:
      "Maintain student profiles, enrolment details, and academic records within a structured institutional system.",
    icon: Users,
  },
  {
    title: "Course Registration",
    description:
      "Simplify course registration while giving authorized staff clear oversight of student enrolments.",
    icon: BookOpen,
  },
  {
    title: "Results Management",
    description:
      "Coordinate result submission, administrative review, publication, and access to academic performance records.",
    icon: FileText,
  },
  {
    title: "Finance Management",
    description:
      "Organize fee structures, payment transactions, outstanding balances, and receipts in one place.",
    icon: WalletCards,
  },
  {
    title: "Institutional Administration",
    description:
      "Oversee users, institutional structures, academic operations, and essential administrative processes.",
    icon: Settings2,
  },
];

export default function FeaturesSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative overflow-hidden bg-[#FAFAFA] py-20 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-gold/[0.08] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduce ? 0 : 0.45, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl"
          >
            Everything Your Institution Needs
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Comprehensive management tools designed for the whole institution.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:mt-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: reduce ? 0 : 0.45,
                  delay: reduce ? 0 : (index % 3) * 0.06,
                  ease: "easeOut",
                }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 border-t-[3px] border-t-brand-gold bg-white p-7 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_14px_32px_-16px_rgba(15,23,42,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-t-brand-navy hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_26px_48px_-20px_rgba(15,23,42,0.22)] sm:p-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy transition-colors duration-300 group-hover:bg-brand-navy group-hover:text-brand-gold">
                  <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <h3 className="mt-6 text-xl font-bold tracking-[-0.02em] text-brand-navy">
                  {feature.title}
                </h3>

                <p className="mt-3 text-[15px] leading-7 text-slate-600">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>

        {/* Closing */}
        <div className="mt-12 flex flex-col items-center gap-5 text-center">
          <p className="max-w-lg text-sm leading-7 text-slate-600">
            One coordinated platform for the people, processes, and records that
            keep your institution moving.
          </p>

          <Link
            href="/about"
            className="group/cta inline-flex items-center gap-3 rounded-lg bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
          >
            Learn more about ITMT
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover/cta:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}