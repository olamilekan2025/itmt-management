import {
  ArrowDown,
  BarChart3,
  Building2,
  GraduationCap,
  Wallet,
  ClipboardList,
  BookOpen,
} from "lucide-react";

const flow = [
  {
    type: "role",
    title: "Student",
    description: "Begins the academic journey",
    icon: GraduationCap,
  },
  {
    type: "process",
    title: "Course Registration",
    description: "Academic activity",
    icon: ClipboardList,
  },
  {
    type: "role",
    title: "Lecturer",
    description: "Academic responsibility",
    icon: BookOpen,
  },
  {
    type: "process",
    title: "Results",
    description: "Academic records",
    icon: BarChart3,
  },
  {
    type: "role",
    title: "Administration",
    description: "Institutional oversight",
    icon: Building2,
  },
  {
    type: "process",
    title: "Academic Records",
    description: "Structured information",
    icon: BookOpen,
  },
  {
    type: "role",
    title: "Finance",
    description: "Financial responsibility",
    icon: Wallet,
  },
  {
    type: "process",
    title: "Fees & Payments",
    description: "Financial information",
    icon: Wallet,
  },
];

export default function AboutFlow() {
  return (
    <section className="bg-white py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Connected Responsibilities
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
            One system. Different responsibilities. Shared information.
          </h2>
        </div>

        <div className="relative mt-14">
          <div className="absolute bottom-8 left-1/2 top-8 hidden w-px -translate-x-1/2 bg-slate-200 sm:block" />

          <div className="space-y-4">
            {flow.map((item, index) => {
              const Icon = item.icon;

              return (
                <div key={`${item.title}-${index}`}>
                  <div
                    className={`relative z-10 mx-auto flex max-w-xl items-center gap-4 border p-4 transition-all duration-300 hover:-translate-y-0.5 ${
                      item.type === "role"
                        ? "border-brand-navy/10 bg-brand-light"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                        item.type === "role"
                          ? "bg-brand-navy text-brand-gold"
                          : "bg-slate-100 text-brand-navy"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-brand-navy">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {index < flow.length - 1 && (
                    <div className="relative z-10 flex justify-center py-2 sm:hidden">
                      <ArrowDown className="h-4 w-4 text-brand-gold" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}