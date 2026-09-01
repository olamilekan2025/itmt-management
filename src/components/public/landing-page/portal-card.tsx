import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card
      className={`
        group relative overflow-hidden
        transition-all duration-300
        hover:-translate-y-1
        ${
          prominent
            ? `
              border-brand-navy
              bg-brand-navy
              text-white
              shadow-xl shadow-brand-navy/10
            `
            : `
              border-slate-200/80
              bg-white
              shadow-none
              hover:border-brand-navy/20
              hover:shadow-xl hover:shadow-brand-navy/5
            `
        }
      `}
    >
      {/* Top accent */}
      <div
        className={`
          absolute inset-x-0 top-0 h-0.5
          origin-left scale-x-0
          transition-transform duration-300
          group-hover:scale-x-100
          ${
            prominent
              ? "bg-brand-gold"
              : "bg-brand-navy"
          }
        `}
      />

      <CardHeader className="pb-3">
        {/* Icon */}
        <div
          className={`
            flex h-12 w-12 items-center justify-center
            rounded-xl
            transition-all duration-300
            ${
              prominent
                ? `
                  bg-brand-gold/15
                  text-brand-gold
                  group-hover:bg-brand-gold/20
                `
                : `
                  border border-brand-navy/10
                  bg-brand-light
                  text-brand-navy
                  group-hover:border-brand-navy
                  group-hover:bg-brand-navy
                  group-hover:text-brand-gold
                `
            }
          `}
        >
          <Icon className="h-5 w-5" />
        </div>

        <CardTitle
          className={`
            pt-3 text-lg font-semibold
            ${
              prominent
                ? "text-white"
                : "text-brand-navy"
            }
          `}
        >
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p
          className={`
            text-sm leading-6
            ${
              prominent
                ? "text-white/65"
                : "text-slate-600"
            }
          `}
        >
          {description}
        </p>

        {/* Portal Link */}
        <Link
          href={href}
          className={`
            mt-6 inline-flex items-center gap-2
            text-sm font-semibold
            transition-all duration-200
            ${
              prominent
                ? `
                  text-brand-gold
                  hover:gap-3
                  hover:text-white
                `
                : `
                  text-brand-navy
                  hover:gap-3
                  hover:text-brand-gold
                `
            }
          `}
        >
          {buttonText}

          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </CardContent>
    </Card>
  );
}