import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  GraduationCap,
  Wallet,
  type LucideIcon,
} from "lucide-react";

interface FlowRow {
  role: string;
  roleNote: string;
  roleIcon: LucideIcon;
  process: string;
  processNote: string;
  processIcon: LucideIcon;
}

const flow: FlowRow[] = [
  {
    role: "Student",
    roleNote: "Begins the academic journey",
    roleIcon: GraduationCap,
    process: "Course Registration",
    processNote: "Academic activity",
    processIcon: ClipboardList,
  },
  {
    role: "Lecturer",
    roleNote: "Academic responsibility",
    roleIcon: BookOpen,
    process: "Results",
    processNote: "Academic records",
    processIcon: BarChart3,
  },
  {
    role: "Administration",
    roleNote: "Institutional oversight",
    roleIcon: Building2,
    process: "Academic Records",
    processNote: "Structured information",
    processIcon: BookOpen,
  },
  {
    role: "Finance",
    roleNote: "Financial responsibility",
    roleIcon: Wallet,
    process: "Fees & Payments",
    processNote: "Financial information",
    processIcon: Wallet,
  },
];

export default function AboutFlow() {
  return (
    <section className="bg-[#FAFAFA] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl">
            One system. Different responsibilities. Shared information.
          </h2>
        </div>

        <div className="mt-14 hidden grid-cols-[1fr_auto_1fr] gap-4 px-1 text-sm font-medium text-slate-500 md:grid">
          <span>Role</span>
          <span className="w-12" />
          <span>Shared information</span>
        </div>

        <ul className="mt-3 space-y-5 md:mt-4">
          {flow.map((row) => {
            const RoleIcon = row.roleIcon;
            const ProcessIcon = row.processIcon;

            return (
              <li
                key={row.role}
                className="grid items-center gap-2 md:grid-cols-[1fr_auto_1fr] md:gap-4"
              >
                <div className="flex items-center gap-4 rounded-2xl bg-brand-navy p-5 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.5)]">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-brand-gold">
                    <RoleIcon size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-base font-bold text-white">{row.role}</p>
                    <p className="mt-0.5 text-sm text-slate-300">{row.roleNote}</p>
                  </div>
                </div>

                <div aria-hidden="true" className="flex justify-center md:w-12">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-gold/40 bg-white text-brand-gold shadow-sm">
                    <ArrowDown size={16} className="md:hidden" />
                    <ArrowRight size={16} className="hidden md:block" />
                  </span>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 border-l-[3px] border-l-brand-gold bg-white p-5 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_14px_32px_-18px_rgba(15,23,42,0.14)]">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
                    <ProcessIcon size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-base font-bold text-brand-navy">{row.process}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{row.processNote}</p>
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