// "use client";

// import Link from "next/link";
// import { BookOpen } from "lucide-react";

// /* =========================================================
//    PREMIUM SVG — CHECK
// ========================================================= */

// function TrustCheck({ className = "h-5 w-5" }: { className?: string }) {
//   return (
//     <span
//       className={`relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold to-amber-600 shadow-[0_5px_14px_rgba(180,140,40,0.3)] ${className}`}
//     >
//       <svg
//         viewBox="0 0 24 24"
//         fill="none"
//         className="h-[58%] w-[58%]"
//         aria-hidden="true"
//       >
//         <path
//           d="M5 12.5l4.2 4.2L19 6.5"
//           stroke="#0B1B3A"
//           strokeWidth="2.6"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       </svg>
//     </span>
//   );
// }

// /* =========================================================
//    PREMIUM SVG — ARROW
// ========================================================= */

// function ArrowIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
//       aria-hidden="true"
//     >
//       <path
//         d="M5 12h13M13 6l6 6-6 6"
//         stroke="currentColor"
//         strokeWidth="2.3"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   );
// }

// /* =========================================================
//    PREMIUM ACADEMIC LOADING SVG
// ========================================================= */

// function AcademicLoader() {
//   return (
//     <div className="relative mx-auto mt-14 h-[230px] w-full max-w-[620px]">
//       {/* Outer glow */}
//       <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/10 blur-3xl" />

//       <svg
//         viewBox="0 0 620 230"
//         fill="none"
//         className="relative h-full w-full overflow-visible"
//         role="img"
//         aria-label="Academic journey illustration"
//       >
//         <defs>
//           {/* Main gradient */}
//           <linearGradient
//             id="academicLine"
//             x1="70"
//             y1="115"
//             x2="550"
//             y2="115"
//             gradientUnits="userSpaceOnUse"
//           >
//             <stop offset="0" stopColor="#3B82F6" />
//             <stop offset="0.5" stopColor="#8B5CF6" />
//             <stop offset="1" stopColor="#D4AF37" />
//           </linearGradient>

//           {/* Gold gradient */}
//           <linearGradient
//             id="goldNode"
//             x1="0"
//             y1="0"
//             x2="1"
//             y2="1"
//           >
//             <stop offset="0" stopColor="#F5D76E" />
//             <stop offset="1" stopColor="#B88A18" />
//           </linearGradient>

//           {/* Blue gradient */}
//           <linearGradient
//             id="blueNode"
//             x1="0"
//             y1="0"
//             x2="1"
//             y2="1"
//           >
//             <stop offset="0" stopColor="#60A5FA" />
//             <stop offset="1" stopColor="#2563EB" />
//           </linearGradient>

//           {/* Shadow */}
//           <filter
//             id="nodeShadow"
//             x="-100%"
//             y="-100%"
//             width="300%"
//             height="300%"
//           >
//             <feDropShadow
//               dx="0"
//               dy="7"
//               stdDeviation="8"
//               floodColor="#0B1B3A"
//               floodOpacity="0.12"
//             />
//           </filter>

//           {/* Glow */}
//           <filter
//             id="goldGlow"
//             x="-100%"
//             y="-100%"
//             width="300%"
//             height="300%"
//           >
//             <feGaussianBlur stdDeviation="7" />
//           </filter>
//         </defs>

//         {/* ─────────────────────────────────────
//             Decorative background rings
//         ───────────────────────────────────── */}

//         <circle
//           cx="310"
//           cy="115"
//           r="92"
//           stroke="#0B1B3A"
//           strokeOpacity="0.035"
//           strokeWidth="1"
//         />

//         <circle
//           cx="310"
//           cy="115"
//           r="68"
//           stroke="#0B1B3A"
//           strokeOpacity="0.04"
//           strokeWidth="1"
//         />

//         {/* ─────────────────────────────────────
//             Main pathway
//         ───────────────────────────────────── */}

//         <path
//           d="M80 115 C180 115 180 70 310 70 C440 70 440 115 540 115"
//           stroke="#E2E8F0"
//           strokeWidth="3"
//           strokeLinecap="round"
//         />

//         <path
//           d="M80 115 C180 115 180 70 310 70 C440 70 440 115 540 115"
//           stroke="url(#academicLine)"
//           strokeWidth="3"
//           strokeLinecap="round"
//           strokeDasharray="8 12"
//           className="animate-[dash_3s_linear_infinite]"
//         />

//         {/* ─────────────────────────────────────
//             Node glow
//         ───────────────────────────────────── */}

//         <circle
//           cx="80"
//           cy="115"
//           r="28"
//           fill="#3B82F6"
//           opacity="0.12"
//           filter="url(#goldGlow)"
//         />

//         <circle
//           cx="310"
//           cy="70"
//           r="34"
//           fill="#D4AF37"
//           opacity="0.14"
//           filter="url(#goldGlow)"
//         />

//         <circle
//           cx="540"
//           cy="115"
//           r="28"
//           fill="#3B82F6"
//           opacity="0.12"
//           filter="url(#goldGlow)"
//         />

//         {/* ─────────────────────────────────────
//             First node — Programme
//         ───────────────────────────────────── */}

//         <g filter="url(#nodeShadow)">
//           <circle
//             cx="80"
//             cy="115"
//             r="25"
//             fill="white"
//             stroke="#E2E8F0"
//             strokeWidth="2"
//           />

//           <circle
//             cx="80"
//             cy="115"
//             r="18"
//             fill="url(#blueNode)"
//           />
//         </g>

//         {/* Graduation cap */}
//         <g transform="translate(68 103)">
//           <path
//             d="M0 7.5L12 2l12 5.5-12 5.5L0 7.5Z"
//             fill="white"
//             fillOpacity="0.95"
//           />
//           <path
//             d="M5 10v4.2c0 2 3.1 3.6 7 3.6s7-1.6 7-3.6V10"
//             stroke="white"
//             strokeWidth="1.4"
//             strokeLinecap="round"
//           />
//           <path
//             d="M24 7.5v5"
//             stroke="#F5D76E"
//             strokeWidth="1.5"
//             strokeLinecap="round"
//           />
//         </g>

//         {/* ─────────────────────────────────────
//             Middle node — Courses
//         ───────────────────────────────────── */}

//         <g filter="url(#nodeShadow)">
//           <circle
//             cx="310"
//             cy="70"
//             r="31"
//             fill="white"
//             stroke="#F1E2A7"
//             strokeWidth="2"
//           />

//           <circle
//             cx="310"
//             cy="70"
//             r="23"
//             fill="url(#goldNode)"
//           />
//         </g>

//         {/* Book icon */}
//         <g transform="translate(296 56)">
//           <path
//             d="M1 3.5C4.5 2.2 8.5 2.5 14 5v18c-5.5-2.5-9.5-2.8-13-1.5v-18Z"
//             fill="white"
//             fillOpacity="0.95"
//           />

//           <path
//             d="M27 3.5C23.5 2.2 19.5 2.5 14 5v18c5.5-2.5 9.5-2.8 13-1.5v-18Z"
//             fill="white"
//             fillOpacity="0.95"
//           />

//           <path
//             d="M14 5v18"
//             stroke="#B88A18"
//             strokeWidth="1.5"
//           />
//         </g>

//         {/* ─────────────────────────────────────
//             Final node — Progression
//         ───────────────────────────────────── */}

//         <g filter="url(#nodeShadow)">
//           <circle
//             cx="540"
//             cy="115"
//             r="25"
//             fill="white"
//             stroke="#E2E8F0"
//             strokeWidth="2"
//           />

//           <circle
//             cx="540"
//             cy="115"
//             r="18"
//             fill="url(#blueNode)"
//           />
//         </g>

//         {/* Layers icon */}
//         <g transform="translate(528 103)">
//           <path
//             d="M12 1L23 6.5 12 12 1 6.5 12 1Z"
//             stroke="white"
//             strokeWidth="1.5"
//             strokeLinejoin="round"
//           />

//           <path
//             d="M4 10l8 4 8-4"
//             stroke="white"
//             strokeWidth="1.5"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />

//           <path
//             d="M4 14.5l8 4 8-4"
//             stroke="white"
//             strokeWidth="1.5"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </g>

//         {/* ─────────────────────────────────────
//             Labels
//         ───────────────────────────────────── */}

//         <g>
//           <rect
//             x="27"
//             y="154"
//             width="106"
//             height="34"
//             rx="17"
//             fill="white"
//             stroke="#E2E8F0"
//           />

//           <text
//             x="80"
//             y="176"
//             textAnchor="middle"
//             fill="#0B1B3A"
//             fontSize="11"
//             fontWeight="700"
//             fontFamily="Inter, sans-serif"
//           >
//             Programme
//           </text>
//         </g>

//         <g>
//           <rect
//             x="263"
//             y="13"
//             width="94"
//             height="34"
//             rx="17"
//             fill="#0B1B3A"
//           />

//           <text
//             x="310"
//             y="35"
//             textAnchor="middle"
//             fill="white"
//             fontSize="11"
//             fontWeight="700"
//             fontFamily="Inter, sans-serif"
//           >
//             Courses
//           </text>
//         </g>

//         <g>
//           <rect
//             x="484"
//             y="154"
//             width="112"
//             height="34"
//             rx="17"
//             fill="white"
//             stroke="#E2E8F0"
//           />

//           <text
//             x="540"
//             y="176"
//             textAnchor="middle"
//             fill="#0B1B3A"
//             fontSize="11"
//             fontWeight="700"
//             fontFamily="Inter, sans-serif"
//           >
//             Progression
//           </text>
//         </g>

//         {/* ─────────────────────────────────────
//             Animated travelling dot
//         ───────────────────────────────────── */}

//         <circle
//           r="4"
//           fill="#D4AF37"
//           filter="url(#goldGlow)"
//         >
//           <animateMotion
//             dur="3.5s"
//             repeatCount="indefinite"
//             path="M80 115 C180 115 180 70 310 70 C440 70 440 115 540 115"
//           />
//         </circle>
//       </svg>
//     </div>
//   );
// }

// /* =========================================================
//    COURSES HERO
// ========================================================= */

// export default function CoursesHero() {
//   return (
//     <section className="relative isolate overflow-hidden bg-white">
//       {/* Background */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-gradient-to-b from-brand-light/60 via-white to-white" />

//         <div
//           className="absolute inset-0 opacity-[0.28]"
//           style={{
//             backgroundImage:
//               "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)",
//             backgroundSize: "48px 48px",
//             maskImage:
//               "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
//             WebkitMaskImage:
//               "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
//           }}
//         />

//         <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-blue/10 blur-3xl" />

//         <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
//       </div>

//       {/* Hero content */}
//       <div className="mx-auto flex min-h-[720px] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
//         {/* Eyebrow */}
//         <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-brand-navy/10 bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
//           <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-light">
//             <BookOpen className="h-3.5 w-3.5 text-brand-navy" />
//           </span>

//           <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-navy">
//             Courses &amp; Programmes
//           </span>
//         </div>

//         {/* Heading */}
//         <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] text-brand-navy sm:text-5xl lg:text-6xl xl:text-[4.5rem]">
//           Build your academic journey with the{" "}
//           <span className="relative inline-block text-brand-blue">
//             right courses.
//             <span className="absolute -bottom-2 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-brand-gold sm:w-20" />
//           </span>
//         </h1>

//         {/* Description */}
//         <p className="mt-8 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
//           Explore the courses and programmes available across ITMT. Discover
//           your academic structure, understand your course requirements, and
//           stay informed throughout your learning journey.
//         </p>

//         {/* CTAs */}
//         <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
//           <Link
//             href="#course-catalog"
//             className="
//               group inline-flex h-12 w-full items-center justify-center gap-2.5
//               rounded-xl bg-brand-navy px-7
//               text-sm font-bold text-white
//               shadow-[0_14px_35px_rgba(15,23,42,0.16)]
//               transition-all duration-300
//               hover:-translate-y-0.5
//               hover:bg-brand-dark
//               hover:shadow-[0_18px_40px_rgba(15,23,42,0.2)]
//               focus:outline-none
//               focus:ring-4 focus:ring-brand-navy/15
//               sm:w-auto
//             "
//           >
//             Explore Courses
//             <ArrowIcon />
//           </Link>

//           <Link
//             href="#course-process"
//             className="
//               group inline-flex h-12 w-full items-center justify-center gap-2.5
//               rounded-xl border border-slate-200
//               bg-white/90 px-7
//               text-sm font-bold text-brand-navy
//               shadow-sm backdrop-blur
//               transition-all duration-300
//               hover:-translate-y-0.5
//               hover:border-brand-navy/15
//               hover:bg-slate-50
//               hover:shadow-md
//               focus:outline-none
//               focus:ring-4 focus:ring-brand-navy/10
//               sm:w-auto
//             "
//           >
//             How registration works
//             <ArrowIcon />
//           </Link>
//         </div>

//         {/* Premium SVG loading / pathway */}
//         <AcademicLoader />

//         {/* Trust points */}
//         <div className="mt-2 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
//           <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
//             <TrustCheck />
//             Programme-based courses
//           </div>

//           <div className="hidden h-5 w-px bg-slate-200 sm:block" />

//           <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
//             <TrustCheck />
//             Semester structure
//           </div>

//           <div className="hidden h-5 w-px bg-slate-200 sm:block" />

//           <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
//             <TrustCheck />
//             Academic progression
//           </div>
//         </div>
//       </div>

//       {/* Bottom fade */}
//       <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
//     </section>
//   );
// }



import Link from "next/link";
import { ArrowRight, BookOpen, Check, GraduationCap, Layers3 } from "lucide-react";

const trust = [
  "Programme-based courses",
  "Semester structure",
  "Academic progression",
];

const pathway = [
  { label: "Programme", icon: GraduationCap, left: 8, top: 70, gold: false },
  { label: "Courses", icon: BookOpen, left: 50, top: 30, gold: true },
  { label: "Progression", icon: Layers3, left: 92, top: 70, gold: false },
];

export default function CoursesHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#FAFAFA]">
      {/* <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-gold/[0.12] blur-3xl" />
        <div className="absolute -left-32 top-40 h-96 w-96 rounded-full bg-brand-blue/[0.07] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div> */}

      <div className="mx-auto flex max-w-5xl flex-col items-center px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-24 lg:pb-20 lg:pt-15">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-navy/10 bg-white px-4 py-2 shadow-sm">
          <BookOpen size={15} aria-hidden="true" className="text-brand-gold" />
          <span className="text-sm font-medium text-brand-navy">
            Courses &amp; programmes
          </span>
        </div>

        <h1 className="mt-7 max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-brand-navy sm:text-5xl lg:text-[4.25rem]">
          Build your academic journey with the{" "}
          <span className="relative inline-block text-brand-navy">
            right courses.
            <span
              aria-hidden="true"
              className="absolute -bottom-1.5 left-0 h-[6px] w-full rounded-full bg-brand-gold/70"
            />
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
          Explore the courses and programmes available across ITMT. Discover
          your academic structure, understand your course requirements, and
          stay informed throughout your learning journey.
        </p>

        <div className="mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="#course-catalog"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-navy px-7 text-sm font-semibold text-white shadow-lg shadow-brand-navy/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
          >
            Explore Courses
            <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <Link
            href="#course-process"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-brand-navy/15 bg-white px-7 text-sm font-semibold text-brand-navy shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
          >
            How registration works
          </Link>
        </div>

        {/* Academic pathway */}
        <div className="relative mt-16 h-[210px] w-full max-w-[620px]" role="img" aria-label="Programme to courses to progression">
          <div aria-hidden="true" className="absolute left-1/2 top-[30%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/20 blur-3xl" />

          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d="M8 28 C 25 28 30 12 50 12 C 70 12 75 28 92 28"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M8 28 C 25 28 30 12 50 12 C 70 12 75 28 92 28"
              fill="none"
              stroke="#B59643"
              strokeWidth="2"
              strokeDasharray="6 8"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            >
              <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.6s" repeatCount="indefinite" />
            </path>
          </svg>

          {pathway.map(({ label, icon: Icon, left, top, gold }) => (
            <div
              key={label}
              style={{ left: `${left}%`, top: `${top}%` }}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3"
            >
              <span
                className={`flex items-center justify-center rounded-full ring-4 ring-white ${
                  gold
                    ? "h-16 w-16 bg-brand-gold text-brand-navy shadow-[0_16px_36px_-12px_rgba(181,150,67,0.8)]"
                    : "h-14 w-14 bg-brand-navy text-brand-gold shadow-[0_14px_30px_-12px_rgba(15,23,42,0.6)]"
                }`}
              >
                <Icon size={gold ? 26 : 22} aria-hidden="true" />
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-navy shadow-sm sm:text-sm">
                {label}
              </span>
            </div>
          ))}
        </div>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {trust.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-brand-navy">
                <Check size={12} strokeWidth={3} aria-hidden="true" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}