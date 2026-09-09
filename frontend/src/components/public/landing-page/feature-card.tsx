"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  number?: string;
  variant?: "featured" | "compact" | "light" | "institutional";
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  number,
  variant = "compact",
}: FeatureCardProps) {
  /* ─────────────────────────────────────────
     FEATURED — Large navy card
  ───────────────────────────────────────── */
  if (variant === "featured") {
    return (
      <motion.article
        whileHover={{ y: -4 }}
        transition={{
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="group relative h-full"
      >
        <div
          className="
            relative h-full min-h-[300px]
            overflow-hidden rounded-2xl
            bg-brand-navy
            p-7
            shadow-lg shadow-brand-navy/10
            sm:p-8
          "
        >
          {/* Glow */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute
              -right-20 -top-20
              h-64 w-64
              rounded-full
              bg-brand-blue/20
              blur-3xl
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute
              -bottom-24 right-1/4
              h-48 w-48
              rounded-full
              bg-brand-gold/10
              blur-3xl
            "
          />

          {/* Grid texture */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0
              opacity-[0.035]
              [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
              [background-size:36px_36px]
            "
          />

          <div className="relative flex h-full flex-col">
            {/* Top */}
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
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>

              <span className="text-[10px] font-bold tracking-[0.18em] text-white/30">
                {number}
              </span>
            </div>

            {/* Content */}
            <div className="mt-auto pt-12">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">
                Core academic system
              </p>

              <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-[26px]">
                {title}
              </h3>

              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
                {description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 transition-colors group-hover:text-brand-gold">
                Explore feature
                <ArrowUpRight
                  className="
                    h-3.5 w-3.5
                    transition-transform duration-300
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                  "
                />
              </div>
            </div>
          </div>

          {/* Gold accent */}
          <div
            className="
              absolute bottom-0 left-0
              h-1 w-0
              bg-brand-gold
              transition-all duration-500
              group-hover:w-full
            "
          />
        </div>
      </motion.article>
    );
  }

  /* ─────────────────────────────────────────
     INSTITUTIONAL — Wide navy outline
  ───────────────────────────────────────── */
  if (variant === "institutional") {
    return (
      <motion.article
        whileHover={{ y: -3 }}
        transition={{
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="group relative h-full"
      >
        <div
          className="
            relative h-full min-h-[190px]
            overflow-hidden rounded-2xl
            border border-brand-navy/10
            bg-slate-50
            p-6
            transition-all duration-300
            hover:border-brand-navy/20
            hover:bg-brand-navy
            hover:shadow-xl
            hover:shadow-brand-navy/10
            sm:p-7
          "
        >
          <div className="relative flex h-full flex-col sm:flex-row sm:items-center sm:gap-6">
            {/* Icon */}
            <div
              className="
                flex h-12 w-12 shrink-0 items-center justify-center
                rounded-xl
                bg-brand-navy
                text-brand-gold
                transition-all duration-300
                group-hover:bg-white
                group-hover:text-brand-navy
              "
            >
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </div>

            <div className="mt-5 flex-1 sm:mt-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-blue group-hover:text-brand-gold">
                  {number}
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-300 group-hover:bg-white/30" />

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 group-hover:text-slate-300">
                  Institutional operations
                </span>
              </div>

              <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-brand-navy group-hover:text-white">
                {title}
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 group-hover:text-slate-300">
                {description}
              </p>
            </div>

            <div
              className="
                mt-5 flex h-9 w-9 shrink-0 items-center justify-center
                rounded-full
                border border-slate-200
                text-brand-navy
                transition-all duration-300
                group-hover:border-white/20
                group-hover:bg-white/10
                group-hover:text-brand-gold
                sm:mt-0
              "
            >
              <ArrowUpRight
                className="
                  h-4 w-4
                  transition-transform duration-300
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />
            </div>
          </div>

          <div
            className="
              absolute bottom-0 left-0
              h-[2px] w-0
              bg-brand-gold
              transition-all duration-500
              group-hover:w-full
            "
          />
        </div>
      </motion.article>
    );
  }

  /* ─────────────────────────────────────────
     LIGHT — Editorial white card
  ───────────────────────────────────────── */
  if (variant === "light") {
    return (
      <motion.article
        whileHover={{ y: -4 }}
        transition={{
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="group relative h-full"
      >
        <div
          className="
            relative h-full min-h-[270px]
            overflow-hidden rounded-2xl
            border border-slate-200
            bg-white
            p-6
            shadow-[0_3px_16px_rgba(15,23,42,0.035)]
            transition-all duration-300
            hover:border-brand-gold/30
            hover:shadow-xl
            sm:p-7
          "
        >
          <div className="flex items-start justify-between">
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
              <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} />
            </div>

            <span
              className="
                text-3xl font-bold
                tracking-tight
                text-brand-navy/[0.07]
                transition-colors duration-300
                group-hover:text-brand-gold/20
              "
            >
              {number}
            </span>
          </div>

          <div className="mt-9">
            <h3 className="text-lg font-semibold tracking-tight text-brand-navy">
              {title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>

          <div
            className="
              absolute bottom-0 left-0
              h-[3px] w-full
              bg-brand-gold/10
            "
          >
            <div
              className="
                h-full w-0
                bg-brand-gold
                transition-all duration-500
                group-hover:w-full
              "
            />
          </div>
        </div>
      </motion.article>
    );
  }

  /* ─────────────────────────────────────────
     COMPACT — Standard premium card
  ───────────────────────────────────────── */
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative h-full"
    >
      <div
        className="
          relative h-full min-h-[270px]
          overflow-hidden rounded-2xl
          border border-slate-200/80
          bg-white
          p-6
          shadow-[0_3px_16px_rgba(15,23,42,0.035)]
          transition-all duration-300
          hover:border-brand-navy/15
          hover:shadow-xl
          hover:shadow-brand-navy/5
          sm:p-7
        "
      >
        {/* Top accent */}
        <div
          className="
            absolute inset-x-0 top-0
            h-[2px]
            origin-left scale-x-0
            bg-brand-gold
            transition-transform duration-500
            group-hover:scale-x-100
          "
        />

        <div className="flex items-start justify-between">
          <div
            className="
              flex h-11 w-11 items-center justify-center
              rounded-xl
              bg-brand-navy
              text-brand-gold
              shadow-sm
              transition-all duration-300
              group-hover:scale-105
              group-hover:shadow-md
            "
          >
            <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} />
          </div>

          <span className="text-[10px] font-bold tracking-[0.18em] text-slate-300 transition-colors group-hover:text-brand-gold">
            {number}
          </span>
        </div>

        <h3 className="mt-8 text-lg font-semibold tracking-tight text-brand-navy">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 transition-colors group-hover:text-brand-navy">
          Learn more

          <ArrowUpRight
            className="
              h-3.5 w-3.5
              transition-all duration-300
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
            "
          />
        </div>

        {/* Bottom accent */}
        <div
          className="
            absolute bottom-0 left-0
            h-[2px] w-0
            bg-brand-gold
            transition-all duration-500
            group-hover:w-full
          "
        />
      </div>
    </motion.article>
  );
}

