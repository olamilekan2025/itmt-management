// export default function AdmissionsIntroduction() {
//   return (
//     <section className="relative overflow-hidden border-t border-slate-200 bg-slate-50 py-24">
//       <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-blue/5 blur-3xl" />

//       <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         <div className="mx-auto max-w-4xl text-center">
//           <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-navy shadow-sm">
//             <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
//             Your journey starts here
//           </div>

//           <h2 className="text-3xl font-bold leading-tight tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
//             A clear path toward your academic goals.
//           </h2>

//           <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
//             ITMT provides a structured admissions experience designed to help
//             prospective students understand available academic opportunities
//             and the steps involved in beginning their studies.
//           </p>

//           <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600">
//             Explore information relevant to your intended programme, review
//             available requirements, and follow the appropriate application
//             process based on the institution&apos;s current configuration.
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// }



export default function AdmissionsIntroduction() {
  return (
    <section className="relative overflow-hidden bg-[#FFFFFF] py-20 sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-80 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/[0.10] blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8 lg:px-10">
        <h2 className="text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl">
          A clear path toward your academic goals.
        </h2>

        <div aria-hidden="true" className="mx-auto mt-6 h-1 w-16 rounded-full bg-brand-gold" />

        <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
          ITMT provides a structured admissions experience designed to help
          prospective students understand available academic opportunities and
          the steps involved in beginning their studies.
        </p>

        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600">
          Explore information relevant to your intended programme, review
          available requirements, and follow the appropriate application
          process based on the institution&apos;s current configuration.
        </p>
      </div>
    </section>
  );
}