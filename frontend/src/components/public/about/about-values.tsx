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
    description: "Technology should make institutional processes easier, not more complicated.",
    icon: Sparkles,
  },
  {
    title: "Reliability",
    description: "Academic and financial information must remain organized, accessible, and dependable.",
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
    description: "Clear information helps students, staff, and administrators make better decisions.",
    icon: Accessibility,
  },
  {
    title: "Efficiency",
    description: "Reduce unnecessary manual processes and give people more time to focus on what matters.",
    icon: Gauge,
  },
  {
    title: "Continuous Improvement",
    description: "Build a platform that can evolve alongside the institution.",
    icon: RefreshCw,
  },
];

export default function AboutValues() {
  return (
    <section className="relative overflow-hidden bg-[#FAFAFA] py-20 sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-brand-gold/[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl">
              Built around principles that matter.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
              The values that guide how ITMT is designed, built and improved.
            </p>
            <div aria-hidden="true" className="mt-8 h-1 w-16 rounded-full bg-brand-gold" />
          </div>

          <ul className="grid gap-x-10 sm:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <li
                  key={value.title}
                  className="group border-t border-slate-200 py-8"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-navy shadow-sm ring-1 ring-slate-200 transition-all duration-300 group-hover:bg-brand-navy group-hover:text-brand-gold group-hover:ring-brand-navy">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold tracking-[-0.015em] text-brand-navy">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">
                    {value.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}