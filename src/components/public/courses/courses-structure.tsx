import { Building2, GraduationCap, BookOpen, CalendarDays, Layers3, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CoursesStructure() {
  const levels = [
    {
      icon: Building2,
      label: "Institution",
      description: "The academic organization that houses departments and programmes.",
    },
    {
      icon: Building2,
      label: "Departments",
      description: "Specialized units focused on specific academic disciplines.",
    },
    {
      icon: GraduationCap,
      label: "Programmes",
      description: "Degree pathways that define the curriculum for students.",
    },
    {
      icon: Layers3,
      label: "Academic Levels",
      description: "Progressive stages of study organized by year or credits.",
    },
    {
      icon: BookOpen,
      label: "Courses",
      description: "Individual learning modules within a programme.",
    },
    {
      icon: CalendarDays,
      label: "Semesters / Sessions",
      description: "Time periods when courses are offered and completed.",
    },
  ];

  return (
    <section className="border-t border-slate-100 bg-brand-light py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
            Course information structure
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Understanding how courses are organized helps students and staff
            navigate the academic system effectively.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="space-y-4">
            {levels.map((level, index) => (
              <div key={index} className="relative">
                <Card className="border-slate-200 bg-white">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-navy">
                      <level.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-brand-navy">
                        {level.label}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {level.description}
                      </p>
                    </div>
                    {index < levels.length - 1 && (
                      <div className="hidden md:block">
                        <ArrowDown className="h-5 w-5 text-brand-gold" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Mobile arrow */}
                {index < levels.length - 1 && (
                  <div className="flex justify-center py-2 md:hidden">
                    <ArrowDown className="h-5 w-5 text-brand-gold" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
