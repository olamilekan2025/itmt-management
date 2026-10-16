
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  GraduationCap,
  Layers3,
  ShieldCheck,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

interface PlatformRole {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const platformRoles: PlatformRole[] = [
  {
    number: "01",
    title: "Students",
    description: "Learning, registration and academic progress.",
    icon: GraduationCap,
  },
  {
    number: "02",
    title: "Lecturers",
    description: "Teaching, attendance and student assessment.",
    icon: BookOpen,
  },
  {
    number: "03",
    title: "Administration",
    description: "Academic operations and institutional records.",
    icon: Building2,
  },
  {
    number: "04",
    title: "Finance",
    description: "Payments, fee management and financial records.",
    icon: WalletCards,
  },
];

const benefits = [
  "Connected academic workflows",
  "Secure, role-based access",
  "Centralized institutional records",
];

export default function AboutPlatform() {
  const shouldReduceMotion = useReducedMotion();

  const reveal = {
    initial: shouldReduceMotion
      ? false
      : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: {
      duration: shouldReduceMotion ? 0 : 0.5,
      ease: "easeOut" as const,
    },
  };

  return (
    <section
      aria-labelledby="about-platform-heading"
     className="relative isolate overflow-hidden bg-[#FFFFFF] py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle background detail */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-24 -z-10 h-80 w-80 rounded-full bg-[#C8A951]/[0.07] blur-3xl"
      />

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14 xl:px-20">
        <div className="grid items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 xl:gap-24">
          {/* LEFT: Editorial introduction */}
          <motion.div {...reveal} className="relative z-10">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B59643]" />

              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9B7A2C]">
                The ITMT Ecosystem
              </span>
            </div>

            <h2
              id="about-platform-heading"
              className="max-w-[570px] text-[clamp(2.65rem,5vw,4.4rem)] font-semibold leading-[1.06] tracking-[-0.065em] text-[#172541]"
            >
              One institution.
              <span className="mt-1 block text-[#9C7D37]">
                One connected
              </span>
              <span className="block">experience.</span>
            </h2>

            <p className="mt-7 max-w-[470px] text-[15px] leading-8 text-slate-600 sm:text-base">
              Education works better when every part of the institution
              works together. ITMT brings students, lecturers,
              administrators and finance teams into one coordinated
              management environment.
            </p>

            <p className="mt-4 max-w-[450px] text-sm leading-7 text-slate-500">
              From everyday academic activities to institutional
              operations, the right tools and information are organized
              around the people who need them.
            </p>

            {/* Benefits: simple, understated list */}
            <div className="mt-8 space-y-4 border-t border-[#E6E2D9] pt-6">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#EAE5D8] text-[#7F672D]">
                    <Check size={12} strokeWidth={2.5} />
                  </span>

                  <span className="text-sm font-medium text-[#26344D]">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Link
                href="/about"
                className="group inline-flex min-h-[54px] items-center justify-center gap-4 rounded-md bg-[#172541] px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#263B60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B59643] focus-visible:ring-offset-2"
              >
                Discover our platform

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={15} />
                </span>
              </Link>

              <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-slate-500">
                <ShieldCheck size={15} className="text-[#9B7A2C]" />
                Structured. Connected. Accountable.
              </span>
            </div>
          </motion.div>

          {/* RIGHT: Institutional ecosystem visual */}
          <motion.div
            {...reveal}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.55,
              delay: shouldReduceMotion ? 0 : 0.08,
              ease: "easeOut",
            }}
            className="relative min-w-0"
          >
            <div className="relative overflow-hidden rounded-[20px] bg-[#172541] px-5 py-6 shadow-[0_28px_80px_-35px_rgba(23,37,65,0.4)] sm:px-8 sm:py-8 lg:px-9 lg:py-9">
              {/* Decorative background elements */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/[0.07]"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-[#C8A951]/15"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-0 h-48 w-full bg-gradient-to-t from-black/[0.12] to-transparent"
              />

              <div className="relative">
                {/* Panel heading */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D5BB73]">
                      Built around your institution
                    </p>

                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                      Everything works
                      <br className="hidden sm:block" />{" "}
                      better together.
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[#D5BB73]">
                    <Layers3 size={23} strokeWidth={1.5} />
                  </div>
                </div>

                {/* Central platform */}
                <div className="relative mx-auto mt-9 max-w-[440px]">
                  {/* Connecting lines behind the role items */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-[112px] hidden h-[54px] w-[calc(100%-100px)] -translate-x-1/2 border-x border-t border-[#C8A951]/40 sm:block"
                  />

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-[112px] h-[55px] w-px -translate-x-1/2 bg-[#C8A951]/40"
                  />

                  <div className="relative z-10 mx-auto flex min-h-[116px] max-w-[300px] items-center gap-4 rounded-xl border border-[#D6BE7A]/40 bg-[#233451] px-5 py-5 shadow-[0_12px_35px_-20px_rgba(0,0,0,0.7)] sm:px-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#D0B56B] text-[#172541]">
                      <Building2 size={23} strokeWidth={1.7} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#D5BB73]">
                        Central platform
                      </p>

                      <p className="mt-1 text-base font-semibold text-white">
                        ITMT Academy
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-300">
                        One coordinated system
                      </p>
                    </div>
                  </div>

                  {/* Gold connector point */}
                  <div
                    aria-hidden="true"
                    className="relative z-10 mx-auto my-4 h-2 w-2 rounded-full bg-[#D5BB73] ring-4 ring-[#D5BB73]/10"
                  />

                  {/* Four institutional roles */}
                  <div className="relative z-10 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                    {platformRoles.map((role) => {
                      const Icon = role.icon;

                      return (
                        <article
                          key={role.number}
                          className="group flex min-w-0 items-start gap-3 rounded-lg border border-white/[0.09] bg-white/[0.045] p-4 transition-colors duration-200 hover:border-[#D5BB73]/40 hover:bg-white/[0.075] sm:min-h-[116px] sm:p-4"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D5BB73]/10 text-[#D5BB73] transition-colors duration-200 group-hover:bg-[#D5BB73] group-hover:text-[#172541]">
                            <Icon size={19} strokeWidth={1.7} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <span className="text-[9px] font-semibold tracking-[0.16em] text-[#D5BB73]/80">
                                {role.number}
                              </span>

                              <ArrowDownRight
                                size={13}
                                className="text-white/25 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:text-[#D5BB73]"
                              />
                            </div>

                            <h4 className="text-sm font-semibold text-white">
                              {role.title}
                            </h4>

                            <p className="mt-1.5 text-[11px] leading-[1.7] text-slate-300/75">
                              {role.description}
                            </p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                {/* Panel footer */}
                <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[#D5BB73]">
                      <ShieldCheck size={15} />
                    </span>

                    <p className="max-w-[230px] text-[11px] leading-5 text-slate-300">
                      Every role. The right access. A shared direction.
                    </p>
                  </div>

                  <span className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-[#D5BB73]/80 sm:block">
                    ITMT
                  </span>
                </div>
              </div>
            </div>

            {/* Restrained gold accent */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-3 -right-3 -z-10 h-24 w-24 rounded-full bg-[#C8A951]/20 blur-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
