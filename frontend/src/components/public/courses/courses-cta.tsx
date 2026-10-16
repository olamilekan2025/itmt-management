// import Link from "next/link";
// import { ArrowRight } from "lucide-react";

// export default function CoursesCta() {
//   return (
//     <section className="border-t border-slate-100 bg-gradient-to-b from-white to-brand-light py-20">
// <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
// <div className="rounded-3xl bg-gradient-to-r from-brand-navy to-brand-blue px-8 py-16 text-center sm:px-16">
//           <h2 className="text-3xl font-bold text-white sm:text-4xl">
//             Ready to explore your academic journey?
//           </h2>
//           <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
//             Access the ITMT platform to manage your academic activities and stay
//             connected with your institution.
//           </p>

// <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
//             <Link
//               href="/auth/login"
//               className="inline-flex items-center gap-2 rounded-lg bg-brand-gold px-6 py-3 text-sm font-medium text-brand-navy shadow-sm transition-all hover:bg-white hover:shadow-md"
//             >
//               Access Your Portal
//               <ArrowRight className="h-4 w-4" />
//             </Link>

//             <Link
//               href="/about"
//               className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
//             >
//               Learn About ITMT
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }


import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CoursesCta() {
  return (
    <section className="bg-[#FFFFFF] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="relative isolate overflow-hidden rounded-[28px] bg-brand-navy px-6 py-14 text-center shadow-[0_40px_90px_-40px_rgba(15,23,42,0.6)] sm:px-12 sm:py-16 lg:px-20 lg:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-80 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/[0.22] blur-3xl" />
            <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-brand-blue/[0.35] blur-3xl" />
            <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/[0.07]" />
            <div className="absolute -left-10 -top-10 h-44 w-44 rounded-full border border-brand-gold/20" />
            <div className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full border border-white/[0.07]" />
          </div>

          <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-[1.1] tracking-[-0.035em] text-white sm:text-4xl lg:text-[3.25rem]">
            Ready to explore your academic journey?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Access the ITMT platform to manage your academic activities and
            stay connected with your institution.
          </p>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/auth/login"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-gold px-7 text-sm font-semibold text-brand-navy shadow-[0_12px_30px_-12px_rgba(200,169,81,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D6B965] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
            >
              Access Your Portal
              <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/about"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/20 bg-white/[0.06] px-7 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
            >
              Learn About ITMT
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}