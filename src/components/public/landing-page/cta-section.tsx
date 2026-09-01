import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  LogIn,
} from "lucide-react";

export default function CtaSection() {
  return (
    <section
      id="get-started"
      className="relative overflow-hidden bg-white py-20 md:py-24 lg:py-32"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute left-1/2 top-1/2
          h-[500px] w-[500px]
          -translate-x-1/2 -translate-y-1/2
          rounded-full
          bg-brand-gold/10
          blur-3xl
        "
      />

      {/* Decorative circle */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -right-32 -top-32
          h-72 w-72
          rounded-full
          border border-brand-navy/5
        "
      />

      {/* Decorative circle */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -bottom-40 -left-40
          h-80 w-80
          rounded-full
          border border-brand-navy/5
        "
      />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <div
          className="
            inline-flex items-center gap-2
            rounded-full
            border border-brand-navy/10
            bg-brand-light
            px-4 py-2
            shadow-sm
          "
        >
          <ShieldCheck className="h-4 w-4 text-brand-gold" />

          <span
            className="
              text-xs font-semibold
              uppercase tracking-[0.2em]
              text-brand-navy
            "
          >
            ITMT Management System
          </span>
        </div>

        {/* Heading */}
        <h2
          className="
            mx-auto mt-7 max-w-3xl
            font-sans
            text-3xl font-semibold
            leading-tight tracking-tight
            text-brand-navy
            sm:text-4xl
            lg:text-5xl
          "
        >
          A smarter way to manage your institution.
        </h2>

        {/* Description */}
        <p
          className="
            mx-auto mt-5 max-w-2xl
            text-base leading-7
            text-slate-600
            md:text-lg
          "
        >
          Bring academic management, student services, finance, results,
          and administration together in one secure institutional platform.
        </p>

        {/* Actions */}
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          {/* Primary CTA */}
          <Link
            href="/auth/login"
            className="
              inline-flex h-12 items-center justify-center
              rounded-lg
              bg-brand-navy
              px-7
              font-semibold
              text-white
              shadow-lg
              shadow-brand-navy/10
              transition-all duration-200
              hover:-translate-y-0.5
              hover:bg-brand-navy/90
              hover:shadow-xl
            "
          >
            Access Your Portal

            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/auth/login"
            className="
              inline-flex h-12 items-center justify-center
              rounded-lg
              border border-brand-navy/15
              bg-white
              px-7
              font-medium
              text-brand-navy
              shadow-sm
              transition-all duration-200
              hover:-translate-y-0.5
              hover:border-brand-navy/25
              hover:bg-brand-light
              hover:shadow-md
            "
          >
            <LogIn className="mr-2 h-4 w-4" />

            Sign In
          </Link>
        </div>

        {/* Supporting text */}
        <div className="mt-7 flex items-center justify-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />

          <p className="text-xs text-slate-500">
            Access is provided according to your institutional role and
            permissions.
          </p>
        </div>
      </div>
    </section>
  );
}