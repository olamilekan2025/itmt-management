import { Database, LockKeyhole, ShieldCheck, UserCog } from "lucide-react";

const securityItems = [
  {
    title: "Secure Authentication",
    description: "Authentication helps ensure that access begins with an identified user.",
    icon: LockKeyhole,
  },
  {
    title: "Role-Based Access",
    description: "Users interact with areas of the platform relevant to their responsibilities.",
    icon: ShieldCheck,
  },
  {
    title: "Controlled Administration",
    description: "Administrative responsibilities are separated from other institutional roles.",
    icon: UserCog,
  },
  {
    title: "Protected Records",
    description: "Institutional records are managed through controlled access within the platform.",
    icon: Database,
  },
];

export default function AboutSecurity() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-navy py-20 sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-brand-gold/[0.12] blur-3xl" />
        <div className="absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-brand-blue/[0.25] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-sm">
              <ShieldCheck size={15} aria-hidden="true" className="text-brand-gold" />
              <span className="text-sm font-medium text-white/85">Security & trust</span>
            </div>

            <h2 className="mt-6 max-w-xl text-3xl font-bold leading-[1.1] tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
              Built with trust in mind.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              ITMT uses role-aware access and authentication to ensure users
              interact with the areas of the platform relevant to their
              responsibilities.
            </p>
          </div>

          <ul className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] sm:grid-cols-2">
            {securityItems.map((item, i) => {
              const Icon = item.icon;

              return (
                <li
                  key={item.title}
                  className={`group p-7 transition-colors duration-200 hover:bg-white/[0.05] ${
                    i % 2 === 0 ? "sm:border-r sm:border-white/10" : ""
                  } ${i < 2 ? "border-b border-white/10" : i === 2 ? "border-b border-white/10 sm:border-b-0" : ""}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-brand-gold transition-colors duration-200 group-hover:border-brand-gold group-hover:bg-brand-gold group-hover:text-brand-navy">
                    <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold tracking-[-0.01em] text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.description}
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