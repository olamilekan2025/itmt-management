import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  GraduationCap,
  LogIn,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

const roles = [
  { label: "Students", icon: GraduationCap },
  { label: "Lecturers", icon: BookOpen },
  { label: "Finance", icon: WalletCards },
  { label: "Administration", icon: Building2 },
];

export default function CtaSection() {
  return (
    <section
      id="get-started"
      aria-labelledby="cta-heading"
      className="relative overflow-hidden bg-[#FFFFFF] py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="relative isolate overflow-hidden rounded-[28px] bg-brand-navy px-6 py-14 text-center shadow-[0_40px_90px_-40px_rgba(15,23,42,0.6)] sm:px-12 sm:py-16 lg:px-20 lg:py-20">
          {/* Atmosphere */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-80 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/[0.22] blur-3xl" />
            <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-brand-blue/[0.35] blur-3xl" />
            <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/[0.07]" />
            <div className="absolute -left-10 -top-10 h-44 w-44 rounded-full border border-brand-gold/20" />
            <div className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full border border-white/[0.07]" />
          </div>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-gold/30 bg-brand-gold/10 text-brand-gold">
            <ShieldCheck size={26} strokeWidth={1.6} aria-hidden="true" />
          </div>

          <h2
            id="cta-heading"
            className="mx-auto mt-7 max-w-3xl text-3xl font-bold leading-[1.1] tracking-[-0.035em] text-white sm:text-4xl lg:text-[3.25rem]"
          >
            A smarter way to manage your institution.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Bring academic management, student services, finance, results, and
            administration together in one secure institutional platform.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/auth/login"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-gold px-7 text-sm font-semibold text-brand-navy shadow-[0_12px_30px_-12px_rgba(200,169,81,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D6B965] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
            >
              Access Your Portal
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-7 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
            >
              <LogIn size={16} aria-hidden="true" />
              Sign In
            </Link>
          </div>

          {/* Roles */}
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
            {roles.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[13px] font-medium text-white/80"
              >
                <Icon size={14} aria-hidden="true" className="text-brand-gold" />
                {label}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs leading-5 text-white/50">
            Access is provided according to your institutional role and
            permissions.
          </p>
        </div>
      </div>
    </section>
  );
}