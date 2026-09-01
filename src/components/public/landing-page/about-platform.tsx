"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Landmark,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PlatformRole {
  title: string;
  description: string;
  icon: LucideIcon;
  position: string;
}

const platformRoles: PlatformRole[] = [
  {
    title: "Students",
    description: "Academic and student services",
    icon: Users,
    position: "top",
  },
  {
    title: "Lecturers",
    description: "Teaching and academic activities",
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
    description: "Fees and payment management",
    icon: Landmark,
    position: "right",
  },
];

export default function AboutPlatform() {
  return (
    <section className="bg-brand-light py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Content */}
          <div className="max-w-xl">
            <Badge
              variant="outline"
              className="border-brand-gold/40 bg-brand-gold/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-navy"
            >
              About ITMT
            </Badge>

            <h2 className="mt-5 font-serif text-3xl font-medium leading-tight tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
              Built for the way modern institutions work.
            </h2>

            <p className="mt-6 text-base leading-7 text-slate-600 md:text-lg">
              From student enrollment to academic results and financial
              management, ITMT connects the people, processes, and information
              that keep an institution running.
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Different roles may have different responsibilities, but they
              operate within the same connected academic environment.
            </p>

            <Link
              href="/about"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-navy transition-colors hover:text-brand-gold"
            >
              Learn more about ITMT
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Platform ecosystem */}
          <div className="relative mx-auto w-full max-w-xl">
            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5 sm:p-8">
                {/* Desktop ecosystem */}
                <div className="relative hidden min-h-[430px] md:block">
                  {/* Connection lines */}
                  <div className="pointer-events-none absolute inset-0">
                    {/* Vertical top */}
                    <div className="absolute left-1/2 top-[92px] h-[92px] w-px -translate-x-1/2 bg-slate-200" />

                    {/* Vertical bottom */}
                    <div className="absolute bottom-[92px] left-1/2 h-[92px] w-px -translate-x-1/2 bg-slate-200" />

                    {/* Horizontal left */}
                    <div className="absolute left-[92px] top-1/2 h-px w-[calc(50%-92px)] bg-slate-200" />

                    {/* Horizontal right */}
                    <div className="absolute right-[92px] top-1/2 h-px w-[calc(50%-92px)] bg-slate-200" />
                  </div>

                  {/* Center platform */}
                  <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-brand-navy shadow-xl shadow-brand-navy/20">
                      <div className="absolute inset-2 rounded-2xl border border-white/10" />

                      <div className="relative text-center">
                        <p className="text-lg font-bold tracking-wide text-white">
                          ITMT
                        </p>

                        <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-brand-gold">
                          Platform
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role cards */}
                  {platformRoles.map((role) => {
                    const Icon = role.icon;

                    const positionClasses = {
                      top: "left-1/2 top-0 -translate-x-1/2",
                      left: "left-0 top-1/2 -translate-y-1/2",
                      bottom: "bottom-0 left-1/2 -translate-x-1/2",
                      right: "right-0 top-1/2 -translate-y-1/2",
                    };

                    return (
                      <div
                        key={role.title}
                        className={`absolute ${positionClasses[role.position as keyof typeof positionClasses]}`}
                      >
                        <div className="flex w-36 flex-col items-center text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-brand-navy shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-navy/20 hover:shadow-lg">
                            <Icon className="h-6 w-6" strokeWidth={1.7} />
                          </div>

                          <p className="mt-3 text-sm font-semibold text-brand-navy">
                            {role.title}
                          </p>

                          <p className="mt-1 text-[11px] leading-4 text-slate-400">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile ecosystem */}
                <div className="md:hidden">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-navy shadow-xl shadow-brand-navy/20">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">ITMT</p>
                        <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-brand-gold">
                          Platform
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {platformRoles.map((role) => {
                      const Icon = role.icon;

                      return (
                        <Card
                          key={role.title}
                          className="border-slate-200 shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
                              <Icon className="h-5 w-5" strokeWidth={1.7} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-brand-navy">
                                {role.title}
                              </p>

                              <p className="mt-0.5 text-[11px] leading-4 text-slate-400">
                                {role.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decorative accent */}
            <div className="pointer-events-none absolute -bottom-3 -right-3 -z-10 h-24 w-24 rounded-full bg-brand-gold/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}