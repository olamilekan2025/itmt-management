import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
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
    href: "tel:+2340000000000",
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "Send us your questions anytime",
    lines: ["info@itmt.edu.ng"],
    href: "mailto:info@itmt.edu.ng",
  },
  {
    icon: Clock3,
    title: "Office Hours",
    description: "We are available during these hours",
    lines: ["Monday – Friday", "8:00 AM – 4:00 PM"],
  },
];

export default function ContactInfo() {
  return (
    <section
      id="contact-information"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-0 h-72 w-72 rounded-full bg-brand-gold/[0.045] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-brand-gold" />

            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-gold sm:text-xs">
              Contact information
            </p>

            <span className="h-px w-8 bg-brand-gold" />
          </div>

          <h2 className="font-sans text-3xl font-semibold tracking-[-0.025em] text-brand-navy sm:text-4xl">
            We&apos;re easy to reach
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
            Choose the most convenient way to connect with the ITMT team. We
            look forward to hearing from you.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {infoItems.map((item) => {
            const Icon = item.icon;

            const cardContent = (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                    <Icon className="h-[18px] w-[18px] text-brand-gold" />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-navy" />
                </div>

                <h3 className="mt-5 text-[15px] font-semibold text-brand-navy">
                  {item.title}
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-400">
                  {item.description}
                </p>

                <div className="mt-4 space-y-1">
                  {item.lines.map((line) => (
                    <p
                      key={line}
                      className="break-words text-sm font-medium text-slate-600"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </>
            );

            if (item.href) {
              return (
                <a
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/30 hover:shadow-[0_20px_45px_-20px_rgba(15,23,42,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/30 hover:shadow-[0_20px_45px_-20px_rgba(15,23,42,0.22)]"
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}