"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
} from "lucide-react";

function AdmissionsIllustration() {
  return (
    <div className="relative mx-auto h-[430px] w-full max-w-[620px]">
      {/* Ambient glow */}
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/10 blur-3xl" />
      <div className="absolute right-10 top-8 h-32 w-32 rounded-full bg-brand-gold/10 blur-3xl" />

      <svg
        viewBox="0 0 620 430"
        fill="none"
        className="relative h-full w-full overflow-visible"
        role="img"
        aria-label="Admissions application journey illustration"
      >
        <defs>
          <linearGradient
            id="admissionPath"
            x1="80"
            y1="210"
            x2="540"
            y2="210"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1E3A5F" />
            <stop offset="0.5" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#D4AF37" />
          </linearGradient>

          <linearGradient
            id="admissionCard"
            x1="260"
            y1="120"
            x2="360"
            y2="300"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1E3A5F" />
            <stop offset="1" stopColor="#102A43" />
          </linearGradient>

          <radialGradient id="goldGlow">
            <stop stopColor="#D4AF37" stopOpacity="0.45" />
            <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>

          <filter
            id="softShadow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="18"
              stdDeviation="20"
              floodColor="#0F172A"
              floodOpacity="0.12"
            />
          </filter>

          <filter
            id="smallShadow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="8"
              stdDeviation="10"
              floodColor="#0F172A"
              floodOpacity="0.12"
            />
          </filter>

          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Decorative rings */}
        <circle
          cx="310"
          cy="215"
          r="175"
          stroke="#1E3A5F"
          strokeOpacity="0.07"
        />

        <circle
          cx="310"
          cy="215"
          r="130"
          stroke="#D4AF37"
          strokeOpacity="0.12"
        />

        <circle
          cx="310"
          cy="215"
          r="210"
          stroke="#1E3A5F"
          strokeOpacity="0.04"
          strokeDasharray="5 12"
        />

        {/* Main journey path */}
        <path
          d="M82 215 C155 215 160 125 245 125 C330 125 330 305 405 305 C470 305 475 215 538 215"
          stroke="#CBD5E1"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M82 215 C155 215 160 125 245 125 C330 125 330 305 405 305 C470 305 475 215 538 215"
          stroke="url(#admissionPath)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="7 10"
        />

        {/* Animated journey dot */}
        <circle r="5" fill="#D4AF37" filter="url(#glow)">
          <animateMotion
            dur="5s"
            repeatCount="indefinite"
            path="M82 215 C155 215 160 125 245 125 C330 125 330 305 405 305 C470 305 475 215 538 215"
          />
        </circle>

        {/* Glow nodes */}
        <circle cx="82" cy="215" r="35" fill="url(#goldGlow)" />
        <circle cx="245" cy="125" r="35" fill="url(#goldGlow)" />
        <circle cx="405" cy="305" r="35" fill="url(#goldGlow)" />
        <circle cx="538" cy="215" r="35" fill="url(#goldGlow)" />

        {/* START NODE */}
        <g filter="url(#smallShadow)">
          <circle
            cx="82"
            cy="215"
            r="27"
            fill="white"
            stroke="#D4AF37"
            strokeWidth="2"
          />
        </g>

        <path
          d="M70 212h24M73 208h18M75 204h14M75 216v8M89 216v8"
          stroke="#1E3A5F"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* APPLICATION NODE */}
        <g filter="url(#smallShadow)">
          <circle
            cx="245"
            cy="125"
            r="27"
            fill="white"
            stroke="#3B82F6"
            strokeWidth="2"
          />
        </g>

        <path
          d="M234 116h15l7 7v11h-22z"
          stroke="#1E3A5F"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M249 116v8h7M238 129h12M238 133h8"
          stroke="#1E3A5F"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        {/* REVIEW NODE */}
        <g filter="url(#smallShadow)">
          <circle
            cx="405"
            cy="305"
            r="27"
            fill="white"
            stroke="#3B82F6"
            strokeWidth="2"
          />
        </g>

        <path
          d="M393 296h16l6 6v13h-22z"
          stroke="#1E3A5F"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M397 302h9M397 307h7M397 312h5"
          stroke="#1E3A5F"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        {/* ADMISSION NODE */}
        <g filter="url(#smallShadow)">
          <circle
            cx="538"
            cy="215"
            r="27"
            fill="#1E3A5F"
            stroke="#D4AF37"
            strokeWidth="2"
          />
        </g>

        <path
          d="M526 214l8 8 15-17"
          stroke="#D4AF37"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central admission card */}
        <g filter="url(#softShadow)">
          <rect
            x="205"
            y="168"
            width="210"
            height="100"
            rx="22"
            fill="url(#admissionCard)"
          />

          <rect
            x="218"
            y="181"
            width="184"
            height="74"
            rx="16"
            stroke="white"
            strokeOpacity="0.10"
          />
        </g>

        {/* Central icon */}
        <rect
          x="235"
          y="196"
          width="42"
          height="42"
          rx="12"
          fill="white"
        />

        <path
          d="M242 211l14-7 14 7-14 7-14-7Z"
          fill="#1E3A5F"
        />

        <path
          d="M247 216v8c5 4 13 4 18 0v-8"
          stroke="#1E3A5F"
          strokeWidth="1.7"
        />

        {/* Central text */}
        <text
          x="292"
          y="212"
          fill="white"
          fontSize="15"
          fontWeight="700"
          fontFamily="Arial, sans-serif"
        >
          ITMT Admissions
        </text>

        <text
          x="292"
          y="232"
          fill="white"
          fillOpacity="0.58"
          fontSize="10"
          fontFamily="Arial, sans-serif"
        >
          Your academic journey begins here
        </text>

        {/* Floating labels */}
        <g filter="url(#smallShadow)">
          <rect
            x="18"
            y="153"
            width="128"
            height="42"
            rx="13"
            fill="white"
          />

          <circle cx="40" cy="174" r="12" fill="#EEF4FA" />

          <path
            d="M34 171h12M36 167h8M36 175h8"
            stroke="#1E3A5F"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          <text
            x="60"
            y="178"
            fill="#1E3A5F"
            fontSize="11"
            fontWeight="700"
            fontFamily="Arial, sans-serif"
          >
            Explore
          </text>
        </g>

        <g filter="url(#smallShadow)">
          <rect
            x="448"
            y="92"
            width="150"
            height="42"
            rx="13"
            fill="white"
          />

          <circle cx="470" cy="113" r="12" fill="#EEF4FA" />

          <path
            d="M464 113l4 4 8-9"
            stroke="#1E3A5F"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <text
            x="490"
            y="117"
            fill="#1E3A5F"
            fontSize="11"
            fontWeight="700"
            fontFamily="Arial, sans-serif"
          >
            Requirements
          </text>
        </g>

        <text
          x="62"
          y="258"
          fill="#64748B"
          fontSize="10"
          fontWeight="600"
          fontFamily="Arial, sans-serif"
          textAnchor="middle"
        >
          BEGIN
        </text>

        <text
          x="245"
          y="84"
          fill="#64748B"
          fontSize="10"
          fontWeight="600"
          fontFamily="Arial, sans-serif"
          textAnchor="middle"
        >
          APPLY
        </text>

        <text
          x="405"
          y="345"
          fill="#64748B"
          fontSize="10"
          fontWeight="600"
          fontFamily="Arial, sans-serif"
          textAnchor="middle"
        >
          REVIEW
        </text>

        <text
          x="538"
          y="258"
          fill="#64748B"
          fontSize="10"
          fontWeight="600"
          fontFamily="Arial, sans-serif"
          textAnchor="middle"
        >
          ADMISSION
        </text>
      </svg>
    </div>
  );
}

export default function AdmissionsHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-brand-light/70 blur-3xl" />
        <div className="absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-brand-gold/5 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.035) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-10">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-navy shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
              Admissions
            </div>

            <h1 className="mt-7 text-4xl font-bold leading-[1.08] tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
              Take the next step in your{" "}
              <span className="text-brand-blue">academic journey.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Explore admission information, academic opportunities, and the
              steps required to begin your journey with ITMT.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/login"
                className="group inline-flex h-12 items-center justify-center rounded-xl bg-brand-navy px-6 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
              >
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/courses"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-brand-navy shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-navy/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
              >
                View Courses
              </Link>
            </div>

            {/* Trust points */}
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                "Explore programmes",
                "Review requirements",
                "Begin your application",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-gold" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <AdmissionsIllustration />
        </div>
      </div>
    </section>
  );
}
