import { GraduationCap, BookOpen, Building2, Layers3 } from "lucide-react";

export default function CoursesIntroduction() {
  const features = [
    {
      icon: GraduationCap,
      title: "Programmes",
      description: "Structured academic pathways",
    },
    {
      icon: Building2,
      title: "Departments",
      description: "Specialized academic units",
    },
    {
      icon: BookOpen,
      title: "Courses",
      description: "Individual learning modules",
    },
    {
      icon: Layers3,
      title: "Academic Levels",
      description: "Progressive study stages",
    },
  ];

  return (
    <section className="border-t border-slate-100 bg-[#F1F5FA] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Visual */}
          <div className="order-2 lg:order-1">
            <div className="relative aspect-square max-w-lg overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy to-brand-blue lg:mx-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-6 p-12">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-6 backdrop-blur-sm"
                    >
                      <feature.icon className="h-8 w-8 text-brand-gold" />
                      <div className="h-2 w-16 rounded-full bg-white/20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 space-y-6 lg:order-2">
            <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
              Academic information, organized in one place.
            </h2>
            <div className="space-y-4 text-slate-600">
              <p className="text-lg">
                ITMT provides a structured environment for organizing courses
                across programmes, departments, academic levels, sessions, and
                semesters.
              </p>
              <p>
                Students can use the platform to understand the courses associated
                with their academic journey, while authorized institutional users
                can manage academic information according to their
                responsibilities.
              </p>
            </div>

            <div className="grid gap-6 pt-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light">
                    <feature.icon className="h-5 w-5 text-brand-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">
                      {feature.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
