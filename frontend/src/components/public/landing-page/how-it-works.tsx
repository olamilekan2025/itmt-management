"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  LayoutGrid,
  LogIn,
  UserRoundPlus,
} from "lucide-react";

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

const ease = [0.22, 1, 0.36, 1] as const;

export default function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative overflow-hidden bg-[#FAFAFA] py-20 sm:py-20 lg:py-25"
    >
      {/* Atmosphere */}
      {/* <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-[26rem] w-[26rem] rounded-full bg-brand-gold/[0.10] blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-brand-blue/[0.06] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div> */}

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-8">
        {/* Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduce ? 0 : 0.5, ease }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl"
          >
            How ITMT Works
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Four simple steps take every student, lecturer, finance officer and
            administrator from first sign-in to daily use.
          </p>
        </motion.div>

        {/* Timeline */}
        <ol className="relative mx-auto mt-16 grid max-w-7xl gap-10 sm:mt-20 lg:grid-cols-4 lg:gap-8">
          {/* Mobile vertical line */}
          <span
            aria-hidden="true"
            className="absolute bottom-7 left-7 top-7 w-px -translate-x-1/2 bg-gradient-to-b from-brand-gold/60 via-slate-300 to-slate-200 lg:hidden"
          />

          {/* Desktop horizontal line (draws in once) */}
          <motion.span
            aria-hidden="true"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: reduce ? 0 : 1.2, ease }}
            className="absolute left-7 right-0 top-7 hidden h-px origin-left bg-gradient-to-r from-brand-gold/70 via-slate-300 to-transparent lg:block"
          />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <li
                key={step.number}
                className="group relative flex gap-5 lg:flex-col lg:gap-7"
              >
                {/* Node */}
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-brand-gold/60 bg-white text-brand-navy shadow-[0_0_0_6px_#FAFAFA,0_8px_20px_-8px_rgba(15,23,42,0.2)] transition-all duration-300 group-hover:border-brand-navy group-hover:bg-brand-navy group-hover:text-brand-gold">
                  <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="relative pb-2 lg:pr-2">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-3 right-0 hidden select-none text-7xl font-bold leading-none tracking-tighter text-brand-navy/[0.05] lg:block"
                  >
                    {step.number}
                  </span>

                  <p className="text-sm font-semibold text-[#8A6D1F]">
                    Step {step.number}
                  </p>

                  <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-brand-navy">
                    {step.title}
                  </h3>

                  <p className="mt-3 max-w-xs text-[15px] leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Closing */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.15, ease }}
          className="mt-16 flex justify-center"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-navy shadow-sm">
            <CheckCircle2
              size={16}
              aria-hidden="true"
              className="text-brand-gold"
            />
            Connected from start to finish
          </div>
        </motion.div>
      </div>
    </section>
  );
}