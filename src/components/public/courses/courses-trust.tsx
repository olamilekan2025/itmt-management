import { CheckCircle2 } from "lucide-react";

export default function CoursesTrust() {
  const principles = [
    "Structured Information",
    "Role-Aware Access",
    "Consistent Records",
    "Connected Academic Processes",
  ];

  return (
    <section className="border-t border-slate-100 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
            Academic information, organized with purpose.
          </h2>
          <p className="text-lg text-slate-600">
            ITMT provides a structured environment for institutional academic
            information, helping students and authorized staff work with clearer
            and more consistent records.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {principles.map((principle, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-3 rounded-xl bg-brand-light px-6 py-4"
              >
                <CheckCircle2 className="h-5 w-5 text-brand-gold" />
                <span className="font-medium text-brand-navy">{principle}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
