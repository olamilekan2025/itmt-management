// "use client";

// import {
//   ArrowUpRight,
//   BookOpen,
//   GraduationCap,
//   ShieldCheck,
// } from "lucide-react";

// const roles = [
//   {
//     icon: GraduationCap,
//     number: "01",
//     title: "Students",
//     description:
//       "Understand and manage the courses associated with your academic programme, level, and semester.",
//     label: "Academic journey",
//   },
//   {
//     icon: BookOpen,
//     number: "02",
//     title: "Lecturers",
//     description:
//       "Access assigned academic responsibilities and maintain clear visibility of relevant course information.",
//     label: "Teaching & learning",
//   },
//   {
//     icon: ShieldCheck,
//     number: "03",
//     title: "Administrators",
//     description:
//       "Maintain the academic structure supporting departments, programmes, courses, sessions, and semesters.",
//     label: "Academic administration",
//   },
// ];

// export default function CoursesRoles() {
//   return (
//     <section className="relative overflow-hidden border-t border-slate-200 bg-white py-24">
//       {/* Background accents */}
//       <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-brand-blue/5 blur-3xl" />
//       <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-brand-gold/5 blur-3xl" />

//       <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         {/* Heading */}
//         <div className="mx-auto mb-14 max-w-3xl text-center">
//           <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy">
//             <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
//             Academic community
//           </div>

//           <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
//             Course information connects everyone.
//           </h2>

//           <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
//             Different members of the academic community rely on accurate,
//             structured, and accessible course information.
//           </p>
//         </div>

//         {/* Cards */}
//         <div className="grid gap-6 lg:grid-cols-3">
//           {roles.map((role) => {
//             const Icon = role.icon;

//             return (
//               <article
//                 key={role.number}
//                 className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_12px_45px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-2 hover:border-brand-navy/20 hover:shadow-[0_24px_65px_rgba(15,23,42,0.10)]"
//               >
//                 {/* Decorative number */}
//                 <div className="absolute right-7 top-5 text-7xl font-black tracking-tighter text-slate-100 transition-colors duration-300 group-hover:text-brand-navy/[0.04]">
//                   {role.number}
//                 </div>

//                 {/* Hover glow */}
//                 <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

//                 <div className="relative">
//                   <div className="flex items-start justify-between">
//                     <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-xl shadow-brand-navy/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-brand-gold group-hover:text-brand-navy">
//                       <Icon className="h-7 w-7" strokeWidth={1.7} />
//                     </div>

//                     <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all duration-300 group-hover:border-brand-gold/30 group-hover:text-brand-gold">
//                       <ArrowUpRight className="h-4 w-4" />
//                     </div>
//                   </div>

//                   <div className="mt-8">
//                     <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gold">
//                       {role.label}
//                     </span>

//                     <h3 className="mt-2 text-2xl font-bold text-brand-navy">
//                       {role.title}
//                     </h3>

//                     <p className="mt-4 text-sm leading-7 text-slate-600">
//                       {role.description}
//                     </p>
//                   </div>

//                   <div className="mt-8 h-px w-full bg-slate-100" />

//                   <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-brand-navy">
//                     <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
//                     Connected to the academic system
//                   </div>
//                 </div>
//               </article>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }


import { BookOpen, GraduationCap, ShieldCheck } from "lucide-react";

const roles = [
  {
    icon: GraduationCap,
    title: "Students",
    label: "Academic journey",
    description:
      "Understand and manage the courses associated with your academic programme, level, and semester.",
  },
  {
    icon: BookOpen,
    title: "Lecturers",
    label: "Teaching & learning",
    description:
      "Access assigned academic responsibilities and maintain clear visibility of relevant course information.",
  },
  {
    icon: ShieldCheck,
    title: "Administrators",
    label: "Academic administration",
    description:
      "Maintain the academic structure supporting departments, programmes, courses, sessions, and semesters.",
  },
];

export default function CoursesRoles() {
  return (
    <section className="relative overflow-hidden bg-[#FFFFFF] py-20 sm:py-24 lg:py-15">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-brand-gold/[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl">
            Course information connects everyone.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Different members of the academic community rely on accurate,
            structured, and accessible course information.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-7xl gap-6 lg:grid-cols-3 lg:gap-7">
          {roles.map(({ icon: Icon, title, label, description }) => (
            <article
              key={title}
              className="group relative flex flex-col rounded-2xl border border-slate-200/70 border-t-[3px] border-t-brand-gold bg-white p-8 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_14px_32px_-16px_rgba(15,23,42,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-t-brand-navy hover:shadow-[0_26px_48px_-20px_rgba(15,23,42,0.22)]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy transition-colors duration-300 group-hover:bg-brand-navy group-hover:text-brand-gold">
                <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span className="mt-6 inline-flex w-fit rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold text-[#8A6D1F]">
                {label}
              </span>
              <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-brand-navy">{title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-slate-600">{description}</p>

              <p className="mt-7 flex items-center gap-2 border-t border-slate-100 pt-5 text-sm font-medium text-brand-navy">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                Connected to the academic system
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}