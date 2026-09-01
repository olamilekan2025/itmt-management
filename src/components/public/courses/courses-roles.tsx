import { GraduationCap, BookOpen, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CoursesRoles() {
  const roles = [
    {
      icon: GraduationCap,
      title: "Students",
      description:
        "Understand and manage the courses associated with your academic programme.",
    },
    {
      icon: BookOpen,
      title: "Lecturers",
      description:
        "Access assigned academic responsibilities and course information.",
    },
    {
      icon: ShieldCheck,
      title: "Administrators",
      description:
        "Maintain the academic structure that supports programmes, departments, courses, and sessions.",
    },
  ];

  return (
    <section className="border-t border-slate-100 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
            Course information connects everyone.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Different roles in the academic community rely on accurate and
            accessible course information.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role, index) => (
            <Card key={index} className="border-slate-200">
              <CardContent className="p-8 text-center">
                <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light text-brand-navy">
                  <role.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-brand-navy">
                  {role.title}
                </h3>
                <p className="text-slate-600">{role.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
