import { CheckCircle, Check, Database, Lock, Users } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Protected Student Records",
    description:
      "Academic results are secured with authentication and role-based access control.",
  },
  {
    icon: Users,
    title: "Role-Aware Access",
    description:
      "Only authorized students can access their own results through verified authentication.",
  },
  {
    icon: CheckCircle,
    title: "Controlled Access",
    description:
      "Results visibility is managed by academic administrators according to institutional policies.",
  },
  {
    icon: Database,
    title: "Structured Data",
    description:
      "Results are organized and maintained according to institutional academic requirements.",
  },
];

const protections = [
  "Student authentication is required to access academic results.",
  "Each student can only view their own academic results.",
  "Results visibility is controlled by institution configuration.",
  "All access is managed through secure API endpoints with proper authorization.",
];

export default function ResultsSecurity() {
  return (
    <section className="relative overflow-hidden bg-[#FAFAFA] py-20 sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-brand-gold/[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl">
            Academic information deserves responsible access.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            ITMT separates authenticated student access from administrative
            result management so that result information is accessed according
            to configured permissions.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group relative flex flex-col rounded-2xl border border-slate-200/70 border-t-[3px] border-t-brand-gold bg-white p-7 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_14px_32px_-16px_rgba(15,23,42,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-t-brand-navy hover:shadow-[0_26px_48px_-20px_rgba(15,23,42,0.22)]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy transition-colors duration-300 group-hover:bg-brand-navy group-hover:text-brand-gold">
                <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-lg font-bold tracking-[-0.02em] text-brand-navy">{title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-slate-200/80 border-l-[3px] border-l-brand-gold bg-white p-7 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_14px_32px_-18px_rgba(15,23,42,0.14)] sm:p-9">
          <h3 className="text-lg font-bold text-brand-navy sm:text-xl">
            How ITMT protects your academic information
          </h3>

          <ul className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {protections.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] leading-7 text-slate-600">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy">
                  <Check size={12} strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}