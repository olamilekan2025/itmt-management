import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="relative isolate h-150 overflow-hidden bg-slate-100">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/aboutHero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Subtle overlay — preserves the image's natural appearance */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[#101B32]/30"
      />

      {/* Centered content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center justify-center px-5 py-12 text-center sm:px-8 lg:px-10">
        <div className="flex w-full max-w-4xl flex-col items-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C8A951]" />

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1B2847] sm:text-sm">
              About ITMT Academy
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-7xl">
            Transforming the way institutions{" "}
            <span className="text-[#D8BD6A]">
              manage education.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-base leading-7 text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.45)] sm:text-lg sm:leading-8">
            ITMT Management System brings academic administration, student
            services, finance, and institutional operations together in one
            connected digital platform.
          </p>

          {/* Actions */}
          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/auth/login"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C8A951] px-7 py-3 text-sm font-bold text-[#1B2847] shadow-lg shadow-black/10 transition-colors duration-200 hover:bg-[#D8BD6A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            >
              Access Your Portal

              <ArrowRight
                size={17}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/#features"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/80 bg-white/90 px-7 py-3 text-sm font-semibold text-[#1B2847] backdrop-blur-sm transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A951] focus-visible:ring-offset-2"
            >
              Explore the Platform
            </Link>
          </div>

          {/* Brand tagline */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="h-1 w-10 rounded-full bg-[#D8BD6A]" />

            <span className="text-xs font-semibold tracking-wide text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.45)] sm:text-sm">
              Education · Technology · Excellence
            </span>

            <span className="h-1 w-10 rounded-full bg-[#D8BD6A]" />
          </div>
        </div>
      </div>
    </section>
  );
}
