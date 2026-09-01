import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import PortalCard from "./portal-card";

const portals = [
  {
    icon: GraduationCap,
    title: "Student Portal",
    description:
      "Register courses, view academic results, manage your profile, and stay informed about your academic journey.",
    buttonText: "Student Login",
    href: "/auth/login",
  },
  {
    icon: BookOpen,
    title: "Lecturer Portal",
    description:
      "Access assigned courses, manage academic activities, submit results, and stay connected with your students.",
    buttonText: "Lecturer Login",
    href: "/auth/login",
  },
  {
    icon: WalletCards,
    title: "Finance Portal",
    description:
      "Manage fee structures, record payments, monitor balances, issue receipts, and oversee financial activities.",
    buttonText: "Finance Login",
    href: "/auth/login",
  },
  {
    icon: ShieldCheck,
    title: "Administration Portal",
    description:
      "Manage users, programmes, courses, registrations, results, finance, and institutional operations from one place.",
    buttonText: "Administration Login",
    href: "/auth/login",
    prominent: true,
  },
];

export default function PortalsSection() {
  return (
    <section
      id="portals"
      className="relative overflow-hidden bg-brand-light py-20 md:py-24 lg:py-32"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-gold/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-white px-4 py-2 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-navy">
              Access Portals
            </span>
          </div>

          <h2 className="mt-6 font-sans text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            One institution.
            <span className="block text-brand-navy/70">
              Every role connected.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Every member of the institution gets a dedicated experience built
            around their responsibilities, permissions, and everyday tasks.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {portals.map((portal) => (
            <PortalCard
              key={portal.title}
              icon={portal.icon}
              title={portal.title}
              description={portal.description}
              buttonText={portal.buttonText}
              href={portal.href}
              prominent={portal.prominent}
            />
          ))}
        </div>
      </div>
    </section>
  );
}