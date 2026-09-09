"use client";

import {
  UserRoundPlus,
  LogIn,
  LayoutGrid,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";

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

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-white py-20 md:py-24 lg:py-32"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Background atmosphere                                               */}
      {/* ------------------------------------------------------------------ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        {/* Blue glow */}
        <div className="absolute left-0 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-blue/5 blur-3xl" />

        {/* Gold glow */}
        <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-gold/5 blur-3xl" />

        {/* Subtle grid */}
        <div
          className="
            absolute inset-0 opacity-[0.025]
            [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)]
            [background-size:48px_48px]
          "
        />
      </div>

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
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-brand-light px-4 py-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-gold opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-gold" />
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-navy">
              How ITMT Works
            </span>
          </div>

          {/* Heading */}
          <h2 className="mt-6 font-sans text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            Simple workflows.
            <span className="block text-brand-navy/60">
              Powerful results.
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            ITMT simplifies everyday institutional processes so students,
            lecturers, finance teams, and administrators can focus on what
            matters most.
          </p>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Desktop Steps                                                      */}
        {/* ---------------------------------------------------------------- */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="relative mt-16 hidden md:block"
        >
          {/* Connecting line */}
          <div
            aria-hidden="true"
            className="
              absolute left-[12.5%] right-[12.5%] top-7
              h-px bg-gradient-to-r
              from-transparent via-slate-200 to-transparent
            "
          />

          <div className="grid grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  className="group relative text-center"
                >
                  {/* Step node */}
                  <div className="relative z-10 mx-auto">
                    {/* Outer ring */}
                    <div
                      className="
                        mx-auto flex h-14 w-14 items-center justify-center
                        rounded-2xl border border-slate-200
                        bg-white text-brand-navy
                        shadow-sm
                        transition-all duration-500
                        group-hover:border-brand-navy
                        group-hover:bg-brand-navy
                        group-hover:text-brand-gold
                        group-hover:shadow-xl
                        group-hover:shadow-brand-navy/10
                      "
                    >
                      <Icon
                        className="h-6 w-6 transition-transform duration-500 group-hover:scale-110"
                        strokeWidth={1.8}
                      />
                    </div>

                    {/* Connection dot */}
                    {index < steps.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="
                          absolute -right-1.5 top-1/2 hidden
                          h-3 w-3 -translate-y-1/2 translate-x-1/2
                          rounded-full border-2 border-white
                          bg-brand-gold
                          lg:block
                        "
                      />
                    )}
                  </div>

                  {/* Step number */}
                  <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                    Step {step.number}
                  </p>

                  {/* Title */}
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-brand-navy">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>

                  {/* Bottom indicator */}
                  <div
                    className="
                      mx-auto mt-5 h-0.5 w-8
                      bg-brand-gold/40
                      transition-all duration-500
                      group-hover:w-14
                      group-hover:bg-brand-gold
                    "
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Mobile Steps                                                       */}
        {/* ---------------------------------------------------------------- */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
          className="mt-12 space-y-4 md:hidden"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="
                  group relative overflow-hidden
                  rounded-2xl border border-slate-200
                  bg-white p-5
                  shadow-sm
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:border-brand-navy/20
                  hover:shadow-lg
                "
              >
                {/* Top accent */}
                <div
                  className="
                    absolute inset-x-0 top-0 h-0.5
                    origin-left scale-x-0
                    bg-brand-gold
                    transition-transform duration-300
                    group-hover:scale-x-100
                  "
                />

                <div className="flex gap-4">
                  {/* Icon column */}
                  <div className="flex shrink-0 flex-col items-center">
                    <div
                      className="
                        flex h-12 w-12 items-center justify-center
                        rounded-xl border border-brand-navy/10
                        bg-brand-light text-brand-navy
                        transition-all duration-300
                        group-hover:border-brand-navy
                        group-hover:bg-brand-navy
                        group-hover:text-brand-gold
                      "
                    >
                      <Icon
                        className="h-5 w-5"
                        strokeWidth={1.8}
                      />
                    </div>

                    {/* Vertical connector */}
                    {index < steps.length - 1 && (
                      <div className="mt-3 h-full min-h-8 w-px bg-gradient-to-b from-brand-gold/50 to-slate-200" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">
                        Step {step.number}
                      </span>
                    </div>

                    <h3 className="mt-1 text-base font-semibold tracking-tight text-brand-navy">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Bottom statement                                                   */}
        {/* ---------------------------------------------------------------- */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-14 max-w-2xl text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-brand-gold/60" />

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Connected from start to finish
            </span>

            <span className="h-px w-10 bg-brand-gold/60" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

