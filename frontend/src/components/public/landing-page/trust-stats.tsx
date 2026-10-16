"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import Link from "next/link";

interface AdvantageCard {
  title: string;
  description: string;
  icon: LucideIcon;
  benefits: string[];
  featured?: boolean;
}

const advantages: AdvantageCard[] = [
  {
    title: "Academic Management",
    description:
      "Manage essential academic activities through one organized, easy-to-use platform.",
    icon: GraduationCap,
    benefits: [
      "Student records and profiles",
      "Course and registration management",
      "Results and academic records",
    ],
  },
  {
    title: "Dedicated Portals",
    description:
      "Give every member of your institution the right tools for their responsibilities.",
    icon: UsersRound,
    featured: true,
    benefits: [
      "Dedicated student portal",
      "Lecturer and finance workspaces",
      "Centralized administration",
    ],
  },
  {
    title: "Organized & Secure",
    description:
      "Keep institutional information structured and accessible to the right people.",
    icon: ShieldCheck,
    benefits: [
      "Role-based access",
      "Organized digital records",
      "Connected information",
    ],
  },
];

function AdvantageItem({
  title,
  description,
  icon: Icon,
  benefits,
  featured = false,
}: AdvantageCard) {
  return (
    <article
      className={`group relative flex h-full min-h-[350px] flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-200 sm:p-7 lg:p-8 ${
        featured
          ? "border-brand-gold bg-white shadow-[0_12px_35px_rgba(15,23,42,0.09)]"
          : "border-slate-200 bg-white hover:border-brand-gold/60 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
      }`}
    >
      {featured && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-brand-gold"
        />
      )}

      <div className="flex items-center justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-200 ${
            featured
              ? "bg-brand-gold text-brand-navy"
              : "bg-brand-navy text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-navy"
          }`}
        >
          <Icon size={25} strokeWidth={1.8} />
        </div>

        <span className="text-xs font-semibold tracking-[0.14em] text-slate-300">
          {featured ? "02" : title === "Academic Management" ? "01" : "03"}
        </span>
      </div>

      <div className="mt-7">
        <h3 className="text-xl font-bold tracking-tight text-brand-navy sm:text-[22px]">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          {description}
        </p>
      </div>

      <ul className="mt-6 space-y-3.5">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5">
            <CheckCircle2
              size={16}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-brand-gold"
            />
            <span className="text-sm leading-5 text-slate-600">
              {benefit}
            </span>
          </li>
        ))}
      </ul>

      <div
        aria-hidden="true"
        className={`mt-auto pt-7 ${
          featured ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-px w-full bg-slate-100" />
      </div>
    </article>
  );
}

export default function TrustStats() {
  return (
    <section
      aria-labelledby="trust-stats-heading"
      className="relative overflow-hidden bg-[#FAFAFA] py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto mb-11 max-w-3xl text-center sm:mb-14">
          <div className="mb-5 inline-flex items-center gap-2.5">
            <span className="h-px w-7 bg-brand-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
              The ITMT Advantage
            </span>
            <span className="h-px w-7 bg-brand-gold" />
          </div>

          <h2
            id="trust-stats-heading"
            className="text-3xl font-bold leading-tight tracking-[-0.035em] text-brand-navy sm:text-4xl lg:text-5xl"
          >
            Everything your institution needs.
            <span className="mt-1 block text-brand-blue">
              All in one place.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            A connected management platform that simplifies academic
            processes, supports your people, and keeps institutional
            information organized.
          </p>
        </div>

        <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {advantages.map((advantage) => (
            <AdvantageItem key={advantage.title} {...advantage} />
          ))}
        </div>

        <div className="mt-9 flex flex-col items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white px-5 py-5 sm:flex-row sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-navy">
              <BookOpen size={19} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-sm font-bold text-brand-navy">
                A smarter way to manage your institution
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Connected workflows. Clearer records. Dedicated access.
              </p>
            </div>
          </div>

          <Link
            href="/about"
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 sm:w-auto"
          >
            Discover ITMT
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
