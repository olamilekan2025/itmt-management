import { Building2, GraduationCap, Layers3, CalendarDays, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CoursesCategories() {
  const categories = [
    {
      icon: Building2,
      title: "Departments",
      description: "Organizational units that house related academic programmes and disciplines.",
    },
    {
      icon: GraduationCap,
      title: "Programmes",
      description: "Structured degree pathways that define the curriculum for students.",
    },
    {
      icon: Layers3,
      title: "Academic Levels",
      description: "Progressive stages of study, typically organized by year or credit accumulation.",
    },
    {
      icon: CalendarDays,
      title: "Semesters",
      description: "Time periods within an academic session when courses are offered.",
    },
  ];

  return (
    <section className="border-t border-slate-100 bg-brand-light py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4">
          <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
            Explore the academic structure
          </h2>
          <p className="text-lg text-slate-600">
            Courses are organized according to the institution's academic
            structure, providing clear pathways for learning and progression.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Card
              key={index}
              className="group border-slate-200 bg-white transition-all hover:border-brand-navy hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-white">
                  <category.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-brand-navy">
                  {category.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
