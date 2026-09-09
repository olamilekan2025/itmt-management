"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  GraduationCap,
  Landmark,
  Layers3,
  Users,
  type LucideIcon,
} from "lucide-react";

interface PlatformRole {
  title: string;
  description: string;
  icon: LucideIcon;
  position: "top" | "left" | "bottom" | "right";
}

const platformRoles: PlatformRole[] = [
  {
    title: "Students",
    description: "Academic & student services",
    icon: Users,
    position: "top",
  },
  {
    title: "Lecturers",
    description: "Teaching & academic activities",
    icon: GraduationCap,
    position: "left",
  },
  {
    title: "Administration",
    description: "Institutional management",
    icon: Building2,
    position: "bottom",
  },
  {
    title: "Finance",
    description: "Fees & payment management",
    icon: Landmark,
    position: "right",
  },
];

export default function AboutPlatform() {
  return (
    <section className="relative overflow-hidden bg-brand-light py-20 md:py-24">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-brand-blue/[0.035] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-brand-gold/[0.05] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 xl:gap-24">
          {/* ─────────────────────────────────────────
              LEFT — CONTENT
          ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-xl"
          >
            {/* Eyebrow */}
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-brand-gold" />

              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-navy">
                About ITMT
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-navy sm:text-4xl lg:text-[46px]">
              One platform.
              <span className="block text-brand-blue">
                Every part of the institution.
              </span>
            </h2>

            {/* Main description */}
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 md:text-[17px]">
              From student enrollment to academic results and financial
              management, ITMT connects the people, processes, and information
              that keep an institution moving.
            </p>

            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-500">
              Every role has its own responsibilities and tools, while
              remaining part of one connected academic environment.
            </p>

            {/* Institutional points */}
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-slate-200 py-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-navy text-[9px] font-bold text-brand-gold">
                  ✓
                </span>
                <span className="text-xs font-semibold text-brand-navy">
                  Connected workflows
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-navy text-[9px] font-bold text-brand-gold">
                  ✓
                </span>
                <span className="text-xs font-semibold text-brand-navy">
                  Role-based access
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-navy text-[9px] font-bold text-brand-gold">
                  ✓
                </span>
                <span className="text-xs font-semibold text-brand-navy">
                  Centralized records
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-navy text-[9px] font-bold text-brand-gold">
                  ✓
                </span>
                <span className="text-xs font-semibold text-brand-navy">
                  Real-time information
                </span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/about"
              className="
                group mt-8 inline-flex items-center gap-3
                text-sm font-bold
                text-brand-navy
                transition-colors
                hover:text-brand-gold
              "
            >
              <span>Discover the ITMT platform</span>

              <span
                className="
                  flex h-8 w-8 items-center justify-center
                  rounded-full
                  border border-brand-navy/15
                  transition-all duration-300
                  group-hover:border-brand-gold
                  group-hover:bg-brand-gold
                "
              >
                <ArrowRight
                  className="
                    h-3.5 w-3.5
                    transition-transform duration-300
                    group-hover:translate-x-0.5
                  "
                />
              </span>
            </Link>
          </motion.div>

          {/* ─────────────────────────────────────────
              RIGHT — PLATFORM ECOSYSTEM
          ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative mx-auto w-full max-w-2xl"
          >
            {/* Main ecosystem container */}
            <div
              className="
                relative overflow-hidden
                rounded-[28px]
                border border-slate-200/80
                bg-white
                p-5
                shadow-[0_20px_60px_rgba(15,23,42,0.08)]
                sm:p-7
              "
            >
              {/* Top bar */}
              <div className="relative z-20 mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-brand-gold">
                    <Layers3 className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-navy">
                      ITMT Ecosystem
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      One connected academic environment
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Connected
                  </span>
                </div>
              </div>

              {/* Desktop ecosystem */}
              <div className="relative hidden min-h-[430px] md:block">
                {/* Soft center glow */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/[0.05] blur-3xl" />

                {/* Connection system */}
                <div className="pointer-events-none absolute inset-0">
                  {/* Vertical */}
                  <div className="absolute left-1/2 top-[78px] h-[102px] w-px -translate-x-1/2 bg-slate-200" />

                  <div className="absolute bottom-[78px] left-1/2 h-[102px] w-px -translate-x-1/2 bg-slate-200" />

                  {/* Horizontal */}
                  <div className="absolute left-[76px] top-1/2 h-px w-[calc(50%-76px)] bg-slate-200" />

                  <div className="absolute right-[76px] top-1/2 h-px w-[calc(50%-76px)] bg-slate-200" />

                  {/* Gold connection points */}
                  <span className="absolute left-1/2 top-[174px] h-2 w-2 -translate-x-1/2 rounded-full bg-brand-gold ring-4 ring-white" />

                  <span className="absolute left-[174px] top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold ring-4 ring-white" />

                  <span className="absolute bottom-[174px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-brand-gold ring-4 ring-white" />

                  <span className="absolute right-[174px] top-1/2 h-2 w-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold ring-4 ring-white" />
                </div>

                {/* Center platform */}
                <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-[30px] bg-brand-navy shadow-[0_18px_45px_rgba(15,23,42,0.22)]">
                    <div className="absolute inset-2 rounded-[24px] border border-white/10" />

                    <div className="absolute -inset-3 rounded-[34px] border border-brand-gold/10" />

                    <div className="relative text-center">
                      <p className="text-2xl font-bold tracking-tight text-white">
                        ITMT
                      </p>

                      <div className="mx-auto mt-1 h-px w-7 bg-brand-gold" />

                      <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.22em] text-brand-gold">
                        Platform
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role cards */}
                {platformRoles.map((role, index) => {
                  const Icon = role.icon;

                  const positionClasses = {
                    top: "left-1/2 top-0 -translate-x-1/2",
                    left: "left-0 top-1/2 -translate-y-1/2",
                    bottom: "bottom-0 left-1/2 -translate-x-1/2",
                    right: "right-0 top-1/2 -translate-y-1/2",
                  };

                  return (
                    <motion.div
                      key={role.title}
                      initial={{ opacity: 0, scale: 0.94 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.4,
                        delay: 0.15 + index * 0.08,
                      }}
                      className={`absolute ${positionClasses[role.position]}`}
                    >
                      <div className="group/role flex w-36 flex-col items-center text-center">
                        <div
                          className="
                            relative flex h-[68px] w-[68px]
                            items-center justify-center
                            rounded-2xl
                            border border-slate-200
                            bg-white
                            text-brand-navy
                            shadow-[0_5px_18px_rgba(15,23,42,0.07)]
                            transition-all duration-300
                            group-hover/role:-translate-y-1
                            group-hover/role:border-brand-gold/40
                            group-hover/role:shadow-lg
                          "
                        >
                          <div className="absolute inset-1 rounded-xl border border-slate-100" />

                          <Icon
                            className="relative h-6 w-6"
                            strokeWidth={1.7}
                          />

                          {/* Gold status point */}
                          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-gold" />
                        </div>

                        <p className="mt-3 text-[13px] font-bold text-brand-navy">
                          {role.title}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-slate-400">
                          {role.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile ecosystem */}
              <div className="md:hidden">
                {/* Center */}
                <div className="flex justify-center py-5">
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-[26px] bg-brand-navy shadow-xl shadow-brand-navy/15">
                    <div className="absolute inset-2 rounded-[20px] border border-white/10" />

                    <div className="text-center">
                      <p className="text-xl font-bold text-white">ITMT</p>

                      <div className="mx-auto mt-1 h-px w-6 bg-brand-gold" />

                      <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                        Platform
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile roles */}
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {platformRoles.map((role, index) => {
                    const Icon = role.icon;

                    return (
                      <motion.div
                        key={role.title}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.06,
                        }}
                        className="
                          group
                          flex items-center gap-3
                          rounded-xl
                          border border-slate-200
                          bg-slate-50/70
                          p-3.5
                          transition-all duration-300
                          hover:border-brand-gold/30
                          hover:bg-white
                          hover:shadow-md
                        "
                      >
                        <div
                          className="
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-xl
                            bg-brand-navy
                            text-brand-gold
                            transition-transform duration-300
                            group-hover:scale-105
                          "
                        >
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-brand-navy">
                            {role.title}
                          </p>

                          <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
                            {role.description}
                          </p>
                        </div>

                        <ArrowUpRight
                          className="
                            ml-auto h-3.5 w-3.5 shrink-0
                            text-slate-300
                            transition-all duration-300
                            group-hover:-translate-y-0.5
                            group-hover:translate-x-0.5
                            group-hover:text-brand-gold
                          "
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Decorative offset accent */}
            <div className="pointer-events-none absolute -bottom-4 -right-4 -z-10 h-28 w-28 rounded-full bg-brand-gold/10 blur-2xl" />
            <div className="pointer-events-none absolute -left-5 top-1/3 -z-10 h-20 w-20 rounded-full bg-brand-blue/[0.06] blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

