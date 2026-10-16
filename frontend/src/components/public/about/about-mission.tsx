// import { Compass, Eye } from "lucide-react";

// export default function AboutMission() {
//   return (
//     <section className="bg-[#FAFAFA] py-20 sm:py-24 lg:py-28">
//       <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-8">
//         <div className="grid gap-6 lg:grid-cols-2">
//           {/* Mission */}
//           <article className="group relative overflow-hidden rounded-3xl border border-slate-200/70 border-t-[3px] border-t-brand-gold bg-white p-8 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_16px_36px_-18px_rgba(15,23,42,0.15)] sm:p-10">
//             <div className="flex items-center gap-3">
//               <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
//                 <Compass size={22} aria-hidden="true" />
//               </span>
//               <span className="text-sm font-semibold text-[#8A6D1F]">
//                 Our mission
//               </span>
//             </div>

//             <h2 className="mt-8 text-2xl font-bold tracking-[-0.025em] text-brand-navy sm:text-3xl">
//               Simplify institutional management.
//             </h2>

//             <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
//               To simplify academic and institutional management through
//               reliable, accessible, and thoughtfully designed technology.
//             </p>
//           </article>

//           {/* Vision */}
//           <article className="relative isolate overflow-hidden rounded-3xl border border-brand-navy border-t-[3px] border-t-brand-gold bg-brand-navy p-8 shadow-[0_28px_60px_-24px_rgba(15,23,42,0.55)] sm:p-10">
//             <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
//               <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/[0.07]" />
//               <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-brand-gold/20" />
//               <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-brand-gold/[0.12] blur-3xl" />
//             </div>

//             <div className="flex items-center gap-3">
//               <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-brand-gold">
//                 <Eye size={22} aria-hidden="true" />
//               </span>
//               <span className="text-sm font-semibold text-brand-gold">
//                 Our vision
//               </span>
//             </div>

//             <h2 className="mt-8 text-2xl font-bold tracking-[-0.025em] text-white sm:text-3xl">
//               A connected digital institution.
//             </h2>

//             <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
//               To create a connected digital environment where students,
//               lecturers, administrators, and institutions can work more
//               efficiently.
//             </p>
//           </article>
//         </div>
//       </div>
//     </section>
//   );
// }

import {
  ArrowUpRight,
  Compass,
  Eye,
  Gauge,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const coreValues = [
  { label: "Simplicity", icon: Sparkles },
  { label: "Reliability", icon: ShieldCheck },
  { label: "Security", icon: LockKeyhole },
  { label: "Transparency", icon: Eye },
  { label: "Efficiency", icon: Gauge },
  { label: "Continuous improvement", icon: RefreshCw },
];

export default function AboutMission() {
  return (
    <section className="relative overflow-hidden bg-[#F7F8FA] py-16 sm:py-20 lg:py-24">
      {/* Subtle background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-brand-gold/[0.06] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand-navy/[0.04] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-navy shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            What defines us
          </span>

          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.04em] text-brand-navy sm:text-4xl lg:text-5xl">
            The principles behind{" "}
            <span className="text-brand-gradient">ITMT.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            Discover the mission, vision, and values that shape our
            approach to smarter institutional management.
          </p>

          <div
            aria-hidden="true"
            className="mx-auto mt-6 h-1 w-12 rounded-full bg-brand-gold"
          />
        </div>

        {/* Three premium cards */}
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
          {/* Mission card */}
          <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-[0_20px_45px_rgba(15,23,42,0.09)] sm:p-8">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px] bg-brand-gold"
            />

            <div className="flex items-center justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold shadow-md shadow-brand-navy/10 transition-transform duration-300 group-hover:scale-105">
                <Compass size={25} strokeWidth={1.7} />
              </span>

              <span className="text-xs font-bold tracking-[0.18em] text-slate-300">
                01
              </span>
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#94751F]">
              Our mission
            </p>

            <h3 className="mt-3 text-2xl font-bold leading-snug tracking-[-0.035em] text-brand-navy sm:text-[27px]">
              Simplifying the way institutions work.
            </h3>

            <p className="mt-4 flex-1 text-sm leading-7 text-slate-600 sm:text-[15px]">
              To simplify academic and institutional management through
              reliable, accessible, and thoughtfully designed technology
              that brings essential processes together.
            </p>

            <div className="mt-7 flex items-center gap-2 border-t border-slate-100 pt-5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
              <span className="text-xs font-semibold text-slate-500">
                Technology with purpose
              </span>
            </div>
          </article>

          {/* Vision card */}
          <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-brand-navy bg-brand-navy p-6 shadow-[0_16px_40px_rgba(27,40,71,0.16)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(27,40,71,0.23)] sm:p-8">
            {/* Restrained decorative circles */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full border border-white/[0.07]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-5 -top-5 h-32 w-32 rounded-full border border-brand-gold/20"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-brand-gold/[0.10] blur-3xl"
            />

            <div className="relative flex items-center justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-brand-gold shadow-lg">
                <Eye size={25} strokeWidth={1.7} />
              </span>

              <span className="text-xs font-bold tracking-[0.18em] text-white/35">
                02
              </span>
            </div>

            <p className="relative mt-7 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
              Our vision
            </p>

            <h3 className="relative mt-3 text-2xl font-bold leading-snug tracking-[-0.035em] text-white sm:text-[27px]">
              A connected digital institution.
            </h3>

            <p className="relative mt-4 flex-1 text-sm leading-7 text-slate-300 sm:text-[15px]">
              To create a connected digital environment where students,
              lecturers, administrators, and institutions can collaborate
              effectively and manage their responsibilities with confidence.
            </p>

            <div className="relative mt-7 flex items-center gap-2 border-t border-white/10 pt-5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
              <span className="text-xs font-semibold text-slate-300">
                Building a smarter academic future
              </span>
            </div>
          </article>

          {/* Values card */}
          <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-[0_20px_45px_rgba(15,23,42,0.09)] sm:p-8 md:col-span-2 xl:col-span-1">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px] bg-brand-gold"
            />

            <div className="flex items-center justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4F0E4] text-brand-navy ring-1 ring-brand-gold/20 transition-transform duration-300 group-hover:scale-105">
                <Sparkles size={25} strokeWidth={1.7} />
              </span>

              <span className="text-xs font-bold tracking-[0.18em] text-slate-300">
                03
              </span>
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#94751F]">
              Our values
            </p>

            <h3 className="mt-3 text-2xl font-bold leading-snug tracking-[-0.035em] text-brand-navy sm:text-[27px]">
              Principles in everything we do.
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[15px]">
              We are committed to building a platform that puts people,
              trust, clarity, and continuous progress at the center of
              institutional management.
            </p>

            {/* Compact values list */}
            <ul className="mt-5 flex flex-wrap gap-2">
              {coreValues.map((value) => {
                const Icon = value.icon;

                return (
                  <li
                    key={value.label}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] font-semibold text-brand-navy sm:text-xs"
                  >
                    <Icon
                      size={13}
                      strokeWidth={1.8}
                      className="shrink-0 text-[#94751F]"
                      aria-hidden="true"
                    />
                    {value.label}
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-5 mt-7">
              <span className="text-xs font-semibold text-slate-500">
                Our standards, every day
              </span>
              <ArrowUpRight
                size={15}
                className="text-[#94751F]"
                aria-hidden="true"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
