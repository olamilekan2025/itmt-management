// import {
//   Accessibility,
//   Gauge,
//   LockKeyhole,
//   RefreshCw,
//   ShieldCheck,
//   Sparkles,
// } from "lucide-react";

// const values = [
//   {
//     title: "Simplicity",
//     description: "Technology should make institutional processes easier, not more complicated.",
//     icon: Sparkles,
//   },
//   {
//     title: "Reliability",
//     description: "Academic and financial information must remain organized, accessible, and dependable.",
//     icon: ShieldCheck,
//   },
//   {
//     title: "Security",
//     description:
//       "Access to institutional information should be controlled according to the responsibilities of each user.",
//     icon: LockKeyhole,
//   },
//   {
//     title: "Transparency",
//     description: "Clear information helps students, staff, and administrators make better decisions.",
//     icon: Accessibility,
//   },
//   {
//     title: "Efficiency",
//     description: "Reduce unnecessary manual processes and give people more time to focus on what matters.",
//     icon: Gauge,
//   },
//   {
//     title: "Continuous Improvement",
//     description: "Build a platform that can evolve alongside the institution.",
//     icon: RefreshCw,
//   },
// ];

// export default function AboutValues() {
//   return (
//     <section className="relative overflow-hidden bg-[#FAFAFA] py-20 sm:py-24 lg:py-28">
//       <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-brand-gold/[0.08] blur-3xl" />

//       <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
//         <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
//           <div className="lg:sticky lg:top-28 lg:self-start">
//             <h2 className="text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl">
//               Built around principles that matter.
//             </h2>
//             <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
//               The values that guide how ITMT is designed, built and improved.
//             </p>
//             <div aria-hidden="true" className="mt-8 h-1 w-16 rounded-full bg-brand-gold" />
//           </div>

//           <ul className="grid gap-x-10 sm:grid-cols-2">
//             {values.map((value) => {
//               const Icon = value.icon;

//               return (
//                 <li
//                   key={value.title}
//                   className="group border-t border-slate-200 py-8"
//                 >
//                   <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-navy shadow-sm ring-1 ring-slate-200 transition-all duration-300 group-hover:bg-brand-navy group-hover:text-brand-gold group-hover:ring-brand-navy">
//                     <Icon size={22} aria-hidden="true" />
//                   </span>
//                   <h3 className="mt-5 text-lg font-bold tracking-[-0.015em] text-brand-navy">
//                     {value.title}
//                   </h3>
//                   <p className="mt-2 text-[15px] leading-7 text-slate-600">
//                     {value.description}
//                   </p>
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       </div>
//     </section>
//   );
// }



import {
  Accessibility,
  Gauge,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const values = [
  {
    title: "Simplicity",
    description:
      "Technology should make institutional processes easier, not more complicated.",
    icon: Sparkles,
  },
  {
    title: "Reliability",
    description:
      "Academic and financial information must remain organized, accessible, and dependable.",
    icon: ShieldCheck,
  },
  {
    title: "Security",
    description:
      "Access to institutional information should be controlled according to the responsibilities of each user.",
    icon: LockKeyhole,
  },
  {
    title: "Transparency",
    description:
      "Clear information helps students, staff, and administrators make better decisions.",
    icon: Accessibility,
  },
  {
    title: "Efficiency",
    description:
      "Reduce unnecessary manual processes and give people more time to focus on what matters.",
    icon: Gauge,
  },
  {
    title: "Continuous Improvement",
    description:
      "Build a platform that can evolve alongside the institution.",
    icon: RefreshCw,
  },
];

export default function AboutValues() {
  return (
    <section className="relative isolate overflow-hidden bg-[#FAFAFA] py-16 sm:py-20 lg:py-24">
      {/* Subtle brand accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-0 -z-10 h-96 w-96 rounded-full bg-brand-gold/[0.07] blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
       
<div className="mx-auto mb-10 max-w-5xl text-center sm:mb-12">
  <span className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/[0.08] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-navy">
    <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
    Our Core Values
  </span>

  <h2 className="mt-5 text-3xl font-bold leading-[1.12] tracking-[-0.035em] text-brand-navy sm:text-4xl lg:text-5xl">
    Built around principles{" "}
    <span className="text-brand-gradient">
      that matter.
    </span>
  </h2>

  <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
    The values that guide how ITMT is designed, built, and
    improved to deliver a more dependable institutional
    management experience.
  </p>

  <div
    aria-hidden="true"
    className="mx-auto mt-6 h-1 w-16 rounded-full bg-brand-gold"
  />
</div>


        {/* Values grid */}
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;

            return (
              <li
                key={value.title}
                className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.035)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-gold/60 hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)] sm:p-6"
              >
                {/* Gold top accent */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-100 bg-brand-gold transition-transform duration-200 group-hover:scale-x-100"
                />

                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-brand-navy ring-1 ring-slate-200/60 transition-colors duration-200 group-hover:bg-brand-navy group-hover:text-brand-gold group-hover:ring-brand-navy">
                    <Icon
                      size={21}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </span>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold leading-6 tracking-[-0.02em] text-brand-navy sm:text-lg">
                        {value.title}
                      </h3>

                      <span className="text-[10px] font-bold tabular-nums tracking-[0.12em] text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-[15px] sm:leading-7">
                      {value.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
