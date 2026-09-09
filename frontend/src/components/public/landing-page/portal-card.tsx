import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

interface PortalCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  prominent?: boolean;
}

export default function PortalCard({
  icon: Icon,
  title,
  description,
  buttonText,
  href,
  prominent = false,
}: PortalCardProps) {
  return (
    <article
      className={`
        group relative flex h-full flex-col overflow-hidden rounded-2xl
        border transition-all duration-500
        hover:-translate-y-1.5
        ${
          prominent
            ? `
              border-brand-navy
              bg-brand-navy
              text-white
              shadow-xl shadow-brand-navy/15
            `
            : `
              border-slate-200
              bg-white
              shadow-sm
              hover:border-brand-navy/20
              hover:shadow-xl hover:shadow-brand-navy/10
            `
        }
      `}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className={`
          pointer-events-none absolute -right-16 -top-16
          h-32 w-32 rounded-full blur-3xl
          transition-opacity duration-500
          ${
            prominent
              ? "bg-brand-gold/15 opacity-80"
              : "bg-brand-blue/10 opacity-0 group-hover:opacity-100"
          }
        `}
      />

      {/* Top accent */}
      <div
        aria-hidden="true"
        className={`
          absolute inset-x-0 top-0 h-1
          origin-left scale-x-0
          transition-transform duration-500
          group-hover:scale-x-100
          ${
            prominent
              ? "bg-brand-gold"
              : "bg-brand-navy"
          }
        `}
      />

      {/* Content */}
      <div className="relative flex h-full flex-col p-6 sm:p-7">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <div
            className={`
              flex h-12 w-12 shrink-0 items-center justify-center
              rounded-xl border
              transition-all duration-300
              ${
                prominent
                  ? `
                    border-brand-gold/20
                    bg-brand-gold/10
                    text-brand-gold
                    group-hover:bg-brand-gold/15
                  `
                  : `
                    border-brand-navy/10
                    bg-brand-light
                    text-brand-navy
                    group-hover:border-brand-navy
                    group-hover:bg-brand-navy
                    group-hover:text-brand-gold
                  `
              }
            `}
          >
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </div>

          {/* Role marker */}
          <span
            className={`
              text-[10px] font-semibold uppercase tracking-[0.18em]
              ${
                prominent
                  ? "text-brand-gold/70"
                  : "text-slate-400"
              }
            `}
          >
            Portal
          </span>
        </div>

        {/* Title */}
        <div className="mt-7">
          <h3
            className={`
              text-xl font-semibold tracking-tight
              ${
                prominent
                  ? "text-white"
                  : "text-brand-navy"
              }
            `}
          >
            {title}
          </h3>

          <div
            className={`
              mt-3 h-px w-10
              transition-all duration-300
              group-hover:w-16
              ${
                prominent
                  ? "bg-brand-gold"
                  : "bg-brand-gold/70"
              }
            `}
          />
        </div>

        {/* Description */}
        <p
          className={`
            mt-5 text-sm leading-6
            ${
              prominent
                ? "text-slate-300"
                : "text-slate-600"
            }
          `}
        >
          {description}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-8">
          <Link
            href={href}
            className={`
              inline-flex items-center gap-2
              text-sm font-semibold
              transition-all duration-300
              ${
                prominent
                  ? "text-brand-gold hover:text-white"
                  : "text-brand-navy hover:text-brand-gold"
              }
            `}
          >
            <span>{buttonText}</span>

            <span
              className={`
                flex h-7 w-7 items-center justify-center
                rounded-full border
                transition-all duration-300
                group-hover:translate-x-1
                ${
                  prominent
                    ? `
                      border-brand-gold/30
                      bg-brand-gold/10
                    `
                    : `
                      border-brand-navy/10
                      bg-brand-light
                      group-hover:border-brand-gold/40
                      group-hover:bg-brand-gold/10
                    `
                }
              `}
            >
              <ArrowUpRight
                className="h-3.5 w-3.5"
                strokeWidth={2}
              />
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom accent */}
      <div
        aria-hidden="true"
        className={`
          absolute inset-x-0 bottom-0 h-px
          transition-opacity duration-300
          ${
            prominent
              ? "bg-brand-gold/50 opacity-100"
              : "bg-brand-gold/40 opacity-0 group-hover:opacity-100"
          }
        `}
      />
    </article>
  );
}

