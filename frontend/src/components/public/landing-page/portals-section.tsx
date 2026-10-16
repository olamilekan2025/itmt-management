"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

interface Portal {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  icon: LucideIcon;
  prominent?: boolean;
}

const portals: Portal[] = [
  {
    title: "Student Portal",
    description:
      "Register courses, view published results, manage your profile, and stay informed about your academic journey.",
    buttonText: "Student login",
    href: "/auth/student/login",
    icon: GraduationCap,
  },
  {
    title: "Lecturer Portal",
    description:
      "Access assigned courses, manage attendance, and handle your academic responsibilities.",
    buttonText: "Lecturer login",
    href: "/auth/login",
    icon: BookOpen,
  },
  {
    title: "Finance Portal",
    description:
      "Manage fee structures, record payments, review balances, and maintain financial records.",
    buttonText: "Finance login",
    href: "/auth/login",
    icon: WalletCards,
  },
  {
    title: "Administration Portal",
    description:
      "Coordinate users, academic structures, registrations, results, and institutional operations.",
    buttonText: "Administration login",
    href: "/auth/login",
    icon: ShieldCheck,
    prominent: true,
  },
];

export default function PortalsSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="portals"
      aria-labelledby="portals-heading"
      className="relative overflow-hidden bg-[#FFFFFF] py-20 sm:py-24 lg:py-28"
    >
      {/* <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-brand-blue/[0.05] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand-gold/[0.08] blur-3xl"
      /> */}

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-8">
        {/* Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduce ? 0 : 0.45, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2
            id="portals-heading"
            className="text-3xl font-bold tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl"
          >
            The Right Tools for Every Role
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Choose your portal to access the functions and information relevant
            to you at ITMT Academy.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-5 xl:gap-6">
          {portals.map((portal, index) => {
            const Icon = portal.icon;
            const dark = Boolean(portal.prominent);

            return (
              <motion.article
                key={portal.title}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: reduce ? 0 : 0.45,
                  delay: reduce ? 0 : index * 0.06,
                  ease: "easeOut",
                }}
                className={`group relative flex min-h-[340px] flex-col overflow-hidden rounded-2xl border border-t-[3px] p-7 transition-all duration-300 hover:-translate-y-1 ${
                  dark
                    ? "border-brand-navy border-t-brand-gold bg-brand-navy text-white shadow-[0_24px_50px_-20px_rgba(15,23,42,0.55)]"
                    : "border-slate-200/70 border-t-brand-gold bg-white text-brand-navy shadow-[0_2px_4px_rgba(15,23,42,0.03),0_14px_32px_-16px_rgba(15,23,42,0.14)] hover:border-t-brand-navy hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_26px_48px_-20px_rgba(15,23,42,0.22)]"
                }`}
              >
                {dark && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/[0.08]"
                  />
                )}

                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300 ${
                    dark
                      ? "border border-white/10 bg-white/[0.08] text-brand-gold"
                      : "bg-brand-navy/[0.06] text-brand-navy group-hover:bg-brand-navy group-hover:text-brand-gold"
                  }`}
                >
                  <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <div className="relative mt-6">
                  <h3 className="text-xl font-bold tracking-[-0.02em]">
                    {portal.title}
                  </h3>

                  <p
                    className={`mt-3 text-[15px] leading-7 ${
                      dark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {portal.description}
                  </p>
                </div>

                <div className="relative mt-auto pt-8">
                  <Link
                    href={portal.href}
                    className={`group/link inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 ${
                      dark
                        ? "bg-brand-gold text-brand-navy hover:bg-[#D6B965] focus-visible:ring-offset-brand-navy"
                        : "bg-brand-navy text-white hover:bg-brand-blue"
                    }`}
                  >
                    {portal.buttonText}
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                      className="shrink-0 transition-transform duration-200 group-hover/link:translate-x-1"
                    />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <ShieldCheck size={16} aria-hidden="true" className="text-brand-blue" />
            Access based on your assigned role
          </div>

          <span aria-hidden="true" className="hidden h-4 w-px bg-slate-200 sm:block" />

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-navy transition-colors hover:text-brand-blue"
          >
            Already have an account?
            <span className="underline decoration-brand-gold decoration-2 underline-offset-4">
              Sign in
            </span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}