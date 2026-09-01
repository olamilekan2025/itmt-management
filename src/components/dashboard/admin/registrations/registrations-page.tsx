"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  getRegistrations,
  type Registration,
} from "@/lib/admin-registrations";

import type { Course, Semester } from "@/lib/admin-courses";

interface RegistrationsPageProps {
  initialRegistrations: Registration[];
  courses: Course[];
  semesters: Semester[];
  accessToken: string;
}

export default function RegistrationsPage({
  initialRegistrations,
  courses,
  semesters,
  accessToken,
}: RegistrationsPageProps) {
  const [registrations, setRegistrations] =
    useState<Registration[]>(
      initialRegistrations,
    );

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] =
    useState("");
  const [courseFilter, setCourseFilter] =
    useState("");

  async function loadRegistrations() {
    setLoading(true);

    try {
      const response = await getRegistrations(
        accessToken,
        {
          semester: semesterFilter || undefined,
          course: courseFilter || undefined,
        },
      );

      setRegistrations(
        response.registrations ?? [],
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load registrations.",
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredRegistrations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return registrations;

    return registrations.filter(
      (registration) => {
        const studentName =
          registration.student?.name ?? "";

        const email =
          registration.student?.email ?? "";

        const matric =
          registration.student?.matricNumber ?? "";

        const courseCode =
          registration.course?.code ?? "";

        const courseTitle =
          registration.course?.title ?? "";

        const semester =
          registration.semester?.name ?? "";

        const programme =
          registration.programme?.name ?? "";

        return (
          studentName
            .toLowerCase()
            .includes(value) ||
          email
            .toLowerCase()
            .includes(value) ||
          matric
            .toLowerCase()
            .includes(value) ||
          courseCode
            .toLowerCase()
            .includes(value) ||
          courseTitle
            .toLowerCase()
            .includes(value) ||
          semester
            .toLowerCase()
            .includes(value) ||
          programme
            .toLowerCase()
            .includes(value)
        );
      },
    );
  }, [registrations, search]);

  const uniqueStudents = new Set(
    registrations.map(
      (registration) =>
        registration.student?._id,
    ),
  ).size;

  const uniqueCourses = new Set(
    registrations.map(
      (registration) =>
        registration.course?._id,
    ),
  ).size;

  const uniqueSemesters = new Set(
    registrations.map(
      (registration) =>
        registration.semester?._id,
    ),
  ).size;

  function formatDate(date?: string) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );
  }

  return (
    <div className="min-h-full space-y-8 pb-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-brand-navy shadow-lg">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 p-6 lg:p-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <ClipboardList className="h-5 w-5 text-brand-gold" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Academic Management
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Course Registrations
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Monitor student course registrations
            across academic sessions and semesters.
          </p>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Registrations"
          value={String(registrations.length)}
          description="Registered courses"
          icon={ClipboardList}
        />

        <StatCard
          title="Students"
          value={String(uniqueStudents)}
          description="Students registered"
          icon={Users}
        />

        <StatCard
          title="Courses"
          value={String(uniqueCourses)}
          description="Courses registered"
          icon={BookOpen}
        />

        <StatCard
          title="Semesters"
          value={String(uniqueSemesters)}
          description="Semesters represented"
          icon={CheckCircle2}
        />
      </section>

      {/* Directory */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-brand-dark">
                Registration Directory
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                {filteredRegistrations.length}{" "}
                {filteredRegistrations.length === 1
                  ? "registration"
                  : "registrations"}{" "}
                displayed
              </p>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search registrations..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 lg:w-64"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <select
                value={semesterFilter}
                onChange={(event) => {
                  setSemesterFilter(
                    event.target.value,
                  );
                }}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
              >
                <option value="">
                  All Semesters
                </option>

                {semesters.map((semester) => (
                  <option
                    key={semester._id}
                    value={semester._id}
                  >
                    {semester.name}
                  </option>
                ))}
              </select>

              <select
                value={courseFilter}
                onChange={(event) =>
                  setCourseFilter(
                    event.target.value,
                  )
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
              >
                <option value="">
                  All Courses
                </option>

                {courses.map((course) => (
                  <option
                    key={course._id}
                    value={course._id}
                  >
                    {course.code}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                onClick={loadRegistrations}
                disabled={loading}
                className="h-10 rounded-xl bg-white"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-100 p-4"
                >
                  <div className="h-11 w-11 rounded-xl bg-slate-100" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-slate-100" />
                    <div className="h-3 w-64 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
                <ClipboardList className="h-7 w-7 text-brand-navy/50" />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-800">
                No registrations found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">
                        Student
                      </th>

                      <th className="px-6 py-4">
                        Course
                      </th>

                      <th className="px-6 py-4">
                        Programme
                      </th>

                      <th className="px-6 py-4">
                        Semester
                      </th>

                      <th className="px-6 py-4">
                        Credits
                      </th>

                      <th className="px-6 py-4">
                        Registered
                      </th>

                      <th className="px-6 py-4 text-right">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRegistrations.map(
                      (registration) => (
                        <tr
                          key={registration._id}
                          className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 last:border-0"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/5">
                                <User className="h-4 w-4 text-brand-navy" />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {registration
                                    .student?.name ??
                                    "Unknown Student"}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {registration
                                    .student
                                    ?.matricNumber ??
                                    registration
                                      .student
                                      ?.email ??
                                    "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <p className="font-semibold text-slate-800">
                              {registration.course
                                ?.code ??
                                "—"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {registration.course
                                ?.title ??
                                "—"}
                            </p>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {registration
                              .programme?.name ??
                              "—"}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {registration
                              .semester?.name ??
                              "—"}
                          </td>

                          <td className="px-6 py-5 text-sm font-medium text-slate-700">
                            {registration.course
                              ?.creditUnits ??
                              "—"}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {formatDate(
                              registration.createdAt,
                            )}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Registered
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredRegistrations.map(
                  (registration) => (
                    <div
                      key={registration._id}
                      className="rounded-2xl border border-slate-200 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5">
                          <User className="h-4 w-4 text-brand-navy" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800">
                            {registration.student
                              ?.name ??
                              "Unknown Student"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {registration.student
                              ?.matricNumber ??
                              registration.student
                                ?.email}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                          Registered
                        </span>
                      </div>

                      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Course
                          </p>

                          <p className="mt-1 font-semibold text-slate-800">
                            {registration.course
                              ?.code}
                          </p>

                          <p className="text-sm text-slate-500">
                            {registration.course
                              ?.title}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Semester
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {registration.semester
                                ?.name ??
                                "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Credits
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {registration.course
                                ?.creditUnits ??
                                "—"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Programme
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            {registration
                              .programme?.name ??
                              "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">
              {value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/10">
            <Icon className="h-5 w-5 text-brand-navy" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(date?: string) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}