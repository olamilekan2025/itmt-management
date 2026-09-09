"use client";

import { motion } from "framer-motion";

import {
  ArrowUpRight,
  Layers3,
  ShieldCheck,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface TrustStat {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const stats: TrustStat[] = [
  {
    number: "01",
    title: "One Platform",
    description:
      "A unified digital environment connecting essential academic and institutional processes.",
    icon: Layers3,
  },
  {
    number: "02",
    title: "Multiple Portals",
    description:
      "Purpose-built access for students, lecturers, administrators, and institutional teams.",
    icon: UsersRound,
  },
  {
    number: "03",
    title: "Secure Records",
    description:
      "Role-aware access keeps academic and institutional information structured and protected.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    title: "Real-Time Access",
    description:
      "Critical information remains accessible, current, and connected across the institution.",
    icon: Zap,
  },
];

export default function TrustStats() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 md:py-24">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-blue/[0.035] blur-3xl" />

      <div
        className="
          pointer-events-none absolute inset-0 opacity-[0.025]
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
          className="mx-auto mb-12 max-w-3xl text-center md:mb-14"
        >
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="h-px w-7 bg-brand-gold" />

            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-navy">
              Why ITMT
            </span>

            <span className="h-px w-7 bg-brand-gold" />
          </div>

          <h2 className="font-serif text-3xl font-medium tracking-tight text-brand-navy sm:text-4xl md:text-[42px] md:leading-[1.12]">
            Built around the way
            <span className="block text-brand-blue">
              modern institutions operate
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 md:text-[15px]">
            ITMT brings people, academic processes and institutional records
            together through one connected digital environment.
          </p>
        </motion.div>

        {/* Mixed card layout */}
        <div className="grid gap-4 lg:grid-cols-12">
          {/* ─────────────────────────────────────────
              CARD 01 — LARGE NAVY FEATURE
          ───────────────────────────────────────── */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="group lg:col-span-6"
          >
            <div
              className="
                relative h-full min-h-[290px]
                overflow-hidden rounded-2xl
                bg-brand-navy
                p-7
                shadow-lg shadow-brand-navy/10
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-2xl hover:shadow-brand-navy/15
                sm:p-8
              "
            >
              {/* Decorative glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-blue/20 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-brand-gold/10 blur-3xl" />

              {/* Grid */}
              <div
                className="
                  pointer-events-none absolute inset-0 opacity-[0.04]
                  [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
                  [background-size:36px_36px]
                "
              />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <div
                    className="
                      flex h-12 w-12 items-center justify-center
                      rounded-xl
                      border border-white/10
                      bg-white/10
                      text-brand-gold
                      backdrop-blur-sm
                    "
                  >
                    <Layers3 className="h-5 w-5" strokeWidth={1.8} />
                  </div>

                  <span className="text-[10px] font-bold tracking-[0.18em] text-white/30">
                    {stats[0].number}
                  </span>
                </div>

                <div className="mt-auto pt-10">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                    Connected infrastructure
                  </p>

                  <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-[27px]">
                    {stats[0].title}
                  </h3>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
                    {stats[0].description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 transition-colors group-hover:text-brand-gold">
                    Explore the platform
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-1 w-0 bg-brand-gold transition-all duration-500 group-hover:w-full" />
            </div>
          </motion.article>

          {/* ─────────────────────────────────────────
              CARD 02 — GOLD / WHITE EDITORIAL CARD
          ───────────────────────────────────────── */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="group lg:col-span-3"
          >
            <div
              className="
                relative h-full min-h-[290px]
                overflow-hidden rounded-2xl
                border border-slate-200
                bg-white
                p-6
                shadow-[0_3px_16px_rgba(15,23,42,0.04)]
                transition-all duration-300
                hover:-translate-y-1
                hover:border-brand-gold/40
                hover:shadow-xl
                sm:p-7
              "
            >
              <div className="flex items-center justify-between">
                <div
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-xl
                    bg-brand-gold/10
                    text-brand-navy
                    transition-all duration-300
                    group-hover:bg-brand-gold
                  "
                >
                  <UsersRound className="h-[19px] w-[19px]" strokeWidth={1.8} />
                </div>

                <span className="text-3xl font-bold tracking-tight text-brand-navy/[0.08]">
                  {stats[1].number}
                </span>
              </div>

              <div className="mt-10">
                <h3 className="text-lg font-semibold tracking-tight text-brand-navy">
                  {stats[1].title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {stats[1].description}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-gold/10">
                <div className="h-full w-0 bg-brand-gold transition-all duration-500 group-hover:w-full" />
              </div>
            </div>
          </motion.article>

          {/* ─────────────────────────────────────────
              CARD 03 — DARK OUTLINE CARD
          ───────────────────────────────────────── */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="group lg:col-span-3"
          >
            <div
              className="
                relative h-full min-h-[290px]
                overflow-hidden rounded-2xl
                border border-brand-navy/10
                bg-slate-100
                p-6
                transition-all duration-300
                hover:-translate-y-1
                hover:border-brand-navy/20
                hover:bg-brand-navy
                hover:shadow-xl
                sm:p-7
              "
            >
              <div className="flex items-center justify-between">
                <div
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-xl
                    bg-brand-navy
                    text-brand-gold
                    transition-all duration-300
                    group-hover:bg-white
                    group-hover:text-brand-navy
                  "
                >
                  <ShieldCheck className="h-[19px] w-[19px]" strokeWidth={1.8} />
                </div>

                <span className="text-3xl font-bold tracking-tight text-brand-navy/10 transition-colors group-hover:text-white/10">
                  {stats[2].number}
                </span>
              </div>

              <div className="mt-10">
                <h3 className="text-lg font-semibold tracking-tight text-brand-navy transition-colors group-hover:text-white">
                  {stats[2].title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500 transition-colors group-hover:text-slate-300">
                  {stats[2].description}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-brand-gold transition-all duration-500 group-hover:w-full" />
            </div>
          </motion.article>

          {/* ─────────────────────────────────────────
              CARD 04 — HORIZONTAL TECHNOLOGY CARD
          ───────────────────────────────────────── */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.21 }}
            className="group lg:col-span-12"
          >
            <div
              className="
                relative overflow-hidden rounded-2xl
                border border-slate-200
                bg-white
                px-6 py-6
                shadow-[0_3px_16px_rgba(15,23,42,0.035)]
                transition-all duration-300
                hover:border-brand-blue/20
                hover:shadow-xl
                sm:px-7
              "
            >
              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-12 w-12 shrink-0 items-center justify-center
                      rounded-xl
                      bg-brand-blue/[0.08]
                      text-brand-blue
                      transition-all duration-300
                      group-hover:bg-brand-navy
                      group-hover:text-brand-gold
                    "
                  >
                    <Zap className="h-5 w-5" strokeWidth={1.8} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                        04
                      </span>

                      <span className="h-1 w-1 rounded-full bg-slate-300" />

                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Always connected
                      </span>
                    </div>

                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-brand-navy">
                      {stats[3].title}
                    </h3>
                  </div>
                </div>

                <p className="max-w-2xl text-sm leading-6 text-slate-500 md:text-right">
                  {stats[3].description}
                </p>

                <div
                  className="
                    hidden h-10 w-10 shrink-0 items-center justify-center
                    rounded-full border border-slate-200
                    text-brand-navy
                    transition-all duration-300
                    group-hover:border-brand-navy
                    group-hover:bg-brand-navy
                    group-hover:text-brand-gold
                    md:flex
                  "
                >
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Bottom progress accent */}
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-slate-100">
                <div className="h-full w-0 bg-brand-blue transition-all duration-500 group-hover:w-full" />
              </div>
            </div>
          </motion.article>
        </div>

        {/* Institutional closing line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <span className="h-px w-12 bg-slate-200" />

          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Connected • Structured • Secure
          </span>

          <span className="h-px w-12 bg-slate-200" />
        </motion.div>
      </div>
    </section>
  );
}

