"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Database,
  LockKeyhole,
  Minus,
  ShieldCheck,
  UserCog,
} from "lucide-react";

const principles = [
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description:
      "Protected authentication helps ensure that only authorized users can access the platform.",
  },
  {
    icon: LockKeyhole,
    title: "Role-Based Access",
    description:
      "Students, lecturers, finance staff, and administrators receive access based on their assigned roles.",
  },
  {
    icon: Database,
    title: "Protected Records",
    description:
      "Academic and institutional information is managed with controlled access and secure data handling.",
  },
  {
    icon: UserCog,
    title: "Controlled Permissions",
    description:
      "Administrators can manage roles, permissions, and access across the institution.",
  },
];

const highlights = [
  "Role-based access control",
  "Protected institutional records",
  "Controlled administrative permissions",
];

const areas = ["Courses", "Results", "Payments", "Users"];

const matrix: { role: string; access: boolean[] }[] = [
  { role: "Students", access: [true, true, true, false] },
  { role: "Lecturers", access: [true, true, false, false] },
  { role: "Finance", access: [false, false, true, false] },
  { role: "Administration", access: [true, true, true, true] },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function SecuritySection() {
  const reduce = useReducedMotion();

  const reveal = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduce ? 0 : 0.5, delay: reduce ? 0 : delay, ease },
  });

  return (
    <section
      id="security"
      aria-labelledby="security-heading"
      className="relative isolate overflow-hidden bg-brand-navy py-20 sm:py-24 lg:py-32"
    >
      {/* Atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-brand-gold/[0.12] blur-3xl" />
        <div className="absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-brand-blue/[0.25] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <motion.div
          {...reveal()}
          className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-20"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-sm">
              <ShieldCheck size={15} aria-hidden="true" className="text-brand-gold" />
              <span className="text-sm font-medium text-white/85">
                Security
              </span>
            </div>

            <h2
              id="security-heading"
              className="mt-6 max-w-2xl text-3xl font-bold leading-[1.1] tracking-[-0.035em] text-white sm:text-4xl lg:text-[3.25rem]"
            >
              Your institution&apos;s data deserves serious protection.
            </h2>
          </div>

          <p className="max-w-md text-base leading-7 text-slate-300 lg:justify-self-end lg:pb-2">
            ITMT is designed around controlled access, secure authentication,
            and clearly defined responsibilities across every institutional
            role.
          </p>
        </motion.div>

        {/* Main grid */}
        <div className="mt-14 grid gap-5 sm:mt-16 lg:grid-cols-12 lg:gap-6">
          {/* Access matrix */}
          <motion.div
            {...reveal(0.05)}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:p-8 lg:col-span-7"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/[0.07]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-brand-gold/20"
            />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold tracking-[-0.02em] text-white sm:text-2xl">
                  Access follows the role
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">
                  Everyone sees what they need, and nothing more.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-gold/30 bg-brand-gold/10 text-brand-gold">
                <LockKeyhole size={22} strokeWidth={1.7} aria-hidden="true" />
              </div>
            </div>

            <div className="relative -mx-2 mt-8 overflow-x-auto px-2">
              <table className="w-full min-w-[440px] border-separate border-spacing-0 text-left">
                <caption className="sr-only">
                  Example of which areas each role can access
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="pb-4 text-xs font-medium text-white/50">
                      Role
                    </th>
                    {areas.map((area) => (
                      <th
                        key={area}
                        scope="col"
                        className="pb-4 text-center text-xs font-medium text-white/50"
                      >
                        {area}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row) => {
                    const admin = row.role === "Administration";

                    return (
                      <tr key={row.role}>
                        <th
                          scope="row"
                          className={`border-t border-white/10 py-4 pr-4 text-sm font-semibold ${
                            admin ? "text-brand-gold" : "text-white"
                          }`}
                        >
                          {row.role}
                        </th>
                        {row.access.map((allowed, i) => (
                          <td
                            key={areas[i]}
                            className="border-t border-white/10 py-4 text-center"
                          >
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                                allowed
                                  ? "bg-brand-gold text-brand-navy"
                                  : "bg-white/[0.05] text-white/25"
                              }`}
                            >
                              {allowed ? (
                                <Check size={14} strokeWidth={3} aria-label="Has access" />
                              ) : (
                                <Minus size={14} strokeWidth={2} aria-label="No access" />
                              )}
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="relative mt-5 text-xs leading-5 text-white/45">
              Illustration of role-based access. Administrators configure the
              exact permissions for your institution.
            </p>
          </motion.div>

          {/* Principles */}
          <motion.ul
            {...reveal(0.12)}
            className="divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] lg:col-span-5"
          >
            {principles.map((item) => {
              const Icon = item.icon;

              return (
                <li
                  key={item.title}
                  className="group flex gap-4 p-5 transition-colors duration-200 hover:bg-white/[0.05] sm:p-6"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-brand-gold transition-colors duration-200 group-hover:border-brand-gold group-hover:bg-brand-gold group-hover:text-brand-navy">
                    <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-bold tracking-[-0.01em] text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </motion.ul>
        </div>

        {/* Highlights */}
        <motion.ul
          {...reveal(0.1)}
          className="mt-8 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-8"
        >
          {highlights.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 text-sm font-medium text-white/85"
            >
              <CheckCircle2
                size={17}
                aria-hidden="true"
                className="shrink-0 text-brand-gold"
              />
              {item}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}