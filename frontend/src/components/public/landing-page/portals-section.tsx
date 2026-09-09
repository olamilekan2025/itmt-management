"use client";

import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  WalletCards,
  ArrowRight,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";

import PortalCard from "./portal-card";

const portals = [
  {
    icon: GraduationCap,
    title: "Student Portal",
    description:
      "Register courses, view academic results, manage your profile, and stay informed about your academic journey.",
    buttonText: "Student Login",
    href: "/auth/student/login",
  },
  {
    icon: BookOpen,
    title: "Lecturer Portal",
    description:
      "Access assigned courses, manage academic activities, submit results, and stay connected with your students.",
    buttonText: "Lecturer Login",
    href: "/auth/login",
  },
  {
    icon: WalletCards,
    title: "Finance Portal",
    description:
      "Manage fee structures, record payments, monitor balances, issue receipts, and oversee financial activities.",
    buttonText: "Finance Login",
    href: "/auth/login",
  },
  {
    icon: ShieldCheck,
    title: "Administration Portal",
    description:
      "Manage users, programmes, courses, registrations, results, finance, and institutional operations from one central administrative workspace.",
    buttonText: "Administration Login",
    href: "/auth/login",
    prominent: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PortalsSection() {
  return (
    <section
      id="portals"
      className="relative overflow-hidden bg-brand-light py-20 md:py-24 lg:py-32"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Background atmosphere                                               */}
      {/* ------------------------------------------------------------------ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        {/* Blue glow */}
        <div className="absolute left-0 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-blue/5 blur-3xl" />

        {/* Gold glow */}
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-gold/5 blur-3xl" />

        {/* Institutional grid */}
        <div
          className="
            absolute inset-0 opacity-[0.025]
            [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)]
            [background-size:48px_48px]
          "
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Container                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-white px-4 py-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-gold opacity-50" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-gold" />
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-navy">
              Access Portals
            </span>
          </div>

          {/* Heading */}
          <h2 className="mt-6 font-sans text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            One institution.
            <span className="block text-brand-navy/60">
              Every role connected.
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Every member of the institution gets a dedicated experience built
            around their responsibilities, permissions, and everyday tasks.
          </p>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Portal Grid                                                       */}
        {/* ---------------------------------------------------------------- */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-12"
        >
          {/* Student Portal */}
          <motion.div
            variants={itemVariants}
            className="sm:col-span-1 lg:col-span-3"
          >
            <PortalCard {...portals[0]} />
          </motion.div>

          {/* Lecturer Portal */}
          <motion.div
            variants={itemVariants}
            className="sm:col-span-1 lg:col-span-3"
          >
            <PortalCard {...portals[1]} />
          </motion.div>

          {/* Finance Portal */}
          <motion.div
            variants={itemVariants}
            className="sm:col-span-1 lg:col-span-3"
          >
            <PortalCard {...portals[2]} />
          </motion.div>

          {/* Administration Portal */}
          <motion.div
            variants={itemVariants}
            className="sm:col-span-2 lg:col-span-3"
          >
            <PortalCard {...portals[3]} />
          </motion.div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Bottom Institutional Message                                     */}
        {/* ---------------------------------------------------------------- */}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="
            mx-auto mt-12 flex max-w-2xl flex-col items-center
            justify-center gap-4 text-center
            sm:flex-row
          "
        >
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-brand-gold" />

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              One secure environment
            </span>

            <span className="h-px w-8 bg-brand-gold" />
          </div>

          <Link
            href="/auth/login"
            className="
              group inline-flex items-center gap-2
              text-sm font-semibold text-brand-navy
              transition-colors hover:text-brand-gold
            "
          >
            Access the platform

            <ArrowRight
              className="
                h-4 w-4
                transition-transform duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

