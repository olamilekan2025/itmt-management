import {
  Mail,
  MapPin,
  Phone,
  Clock,
  ArrowUpRight,
} from "lucide-react";

const infoItems = [
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Our campus and administrative office",
    lines: ["ITMT Academy", "Lagos, Nigeria"],
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Speak directly with our team",
    lines: ["+234 000 000 0000"],
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "Send us your questions anytime",
    lines: ["info@itmt.edu.ng"],
  },
  {
    icon: Clock,
    title: "Office Hours",
    description: "We are available during these hours",
    lines: ["Monday – Friday", "8:00 AM – 4:00 PM"],
  },
];

export default function ContactInfo() {
  return (
    <section className="bg-brand-light py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Contact information
          </p>

          <h2 className="mt-3 font-sans text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl">
            Let&apos;s connect
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Whether you need assistance with admissions, academics, or your
            account, our team is ready to help.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {infoItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-navy/10 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy">
                    <Icon className="h-5 w-5 text-brand-gold" />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-navy" />
                </div>

                <h3 className="mt-5 text-base font-semibold text-brand-navy">
                  {item.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {item.description}
                </p>

                <div className="mt-4 space-y-1">
                  {item.lines.map((line) => (
                    <p
                      key={line}
                      className="text-sm font-medium text-slate-600"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}