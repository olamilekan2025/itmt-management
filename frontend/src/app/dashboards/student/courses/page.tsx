"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiGet, apiPatch } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Programme {
  _id?: string;
  name?: string;
  code?: string;
}

interface Semester {
  _id?: string;
  name?: string;
  order?: number;
}

interface StudentUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  matricNumber?: string | null;
  level?: string | number | null;
  programme?: Programme | string | null;
}

interface StudentSession {
  user?: StudentUser;
}

interface Course {
  _id: string;
  code: string;
  title: string;
  programme?: Programme | string | null;
  semester?: Semester | string | null;
  level: string;
  creditUnits: number;
  category?: string;
  description?: string;
  isActive?: boolean;
}

interface Registration {
  _id: string;
  student?: string;
  course:
    | Course
    | string
    | null;
  semester:
    | Semester
    | string
    | null;
  status?: "registered" | "dropped";
  createdAt?: string;
}

interface CoursesResponse {
  success: boolean;
  courses?: Course[];
  message?: string;
}

interface RegistrationsResponse {
  success: boolean;
  registrations?: Registration[];
  message?: string;
}

interface DropResponse {
  success: boolean;
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getProgrammeId(
  programme: StudentUser["programme"],
): string {
  if (!programme) return "";

  if (typeof programme === "string") {
    return programme;
  }

  return programme._id ?? "";
}

function getProgrammeName(
  programme: StudentUser["programme"],
): string {
  if (!programme) return "Programme";

  if (typeof programme === "string") {
    return programme;
  }

  return programme.name ?? "Programme";
}

function getProgrammeCode(
  programme: StudentUser["programme"],
): string {
  if (!programme || typeof programme === "string") {
    return "";
  }

  return programme.code ?? "";
}

function getSemesterName(
  semester:
    | Semester
    | string
    | null
    | undefined,
): string {
  if (!semester) return "Semester";

  if (typeof semester === "string") {
    return semester;
  }

  return semester.name ?? "Semester";
}

function getSemesterId(
  semester:
    | Semester
    | string
    | null
    | undefined,
): string {
  if (!semester) return "";

  if (typeof semester === "string") {
    return semester;
  }

  return semester._id ?? "";
}

function getSemesterOrder(
  semester:
    | Semester
    | string
    | null
    | undefined,
): number {
  if (!semester || typeof semester === "string") {
    return Number.MAX_SAFE_INTEGER;
  }

  return semester.order ?? Number.MAX_SAFE_INTEGER;
}

function formatLevel(
  level: string,
): string {
  if (!level) return "Level";

  return level.toLowerCase().includes("level")
    ? level
    : `${level} Level`;
}

/* =========================================================
   SKELETON
========================================================= */

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className}`}
    />
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function StudentCoursesPage() {
  const { data: session, status: sessionStatus } =
    useSession();

  const student = (
    session as StudentSession | null
  )?.user;

  const [availableCourses, setAvailableCourses] =
    useState<Course[]>([]);

  const [registrations, setRegistrations] =
    useState<Registration[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [droppingId, setDroppingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [semesterFilter, setSemesterFilter] =
    useState("all");

  const programmeId =
    getProgrammeId(student?.programme);

  const programmeName =
    getProgrammeName(student?.programme);

  const programmeCode =
    getProgrammeCode(student?.programme);

  const studentLevel =
    student?.level !== null &&
    student?.level !== undefined
      ? String(student.level).trim()
      : "";

  /* =======================================================
     LOAD COURSES + REGISTRATIONS
  ======================================================= */

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!programmeId || !studentLevel) {
        setAvailableCourses([]);
        setRegistrations([]);
        setLoading(false);
        return;
      }

      try {
        setError("");
        setSuccess("");

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const courseParams =
          new URLSearchParams();

        courseParams.set(
          "programme",
          programmeId,
        );

        courseParams.set(
          "level",
          studentLevel,
        );

        courseParams.set(
          "status",
          "active",
        );

        const [
          coursesResponse,
          registrationsResponse,
        ] = await Promise.all([
          apiGet<CoursesResponse>(
            `/courses?${courseParams.toString()}`,
          ),
          apiGet<RegistrationsResponse>(
            "/registrations/me",
          ),
        ]);

        if (
          !coursesResponse?.success
        ) {
          throw new Error(
            coursesResponse?.message ||
              "Unable to load available courses",
          );
        }

        if (
          !registrationsResponse?.success
        ) {
          throw new Error(
            registrationsResponse?.message ||
              "Unable to load your registrations",
          );
        }

        setAvailableCourses(
          Array.isArray(
            coursesResponse.courses,
          )
            ? coursesResponse.courses
            : [],
        );

        setRegistrations(
          Array.isArray(
            registrationsResponse.registrations,
          )
            ? registrationsResponse.registrations
            : [],
        );
      } catch (err) {
        console.error(
          "Student courses page error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your courses",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [programmeId, studentLevel],
  );

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (
      sessionStatus !== "authenticated"
    ) {
      setLoading(false);
      return;
    }

    loadData();
  }, [
    sessionStatus,
    loadData,
  ]);

  /* =======================================================
     REGISTERED COURSE IDS
  ======================================================= */

  const registeredCourseIds =
    useMemo(() => {
      return new Set(
        registrations
          .map((registration) => {
            if (
              !registration.course
            ) {
              return "";
            }

            if (
              typeof registration.course ===
              "string"
            ) {
              return registration.course;
            }

            return registration.course._id;
          })
          .filter(Boolean),
      );
    }, [registrations]);

  /* =======================================================
     SEMESTERS
  ======================================================= */

  const semesters = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        name: string;
        order: number;
      }
    >();

    availableCourses.forEach(
      (course) => {
        const key =
          getSemesterId(
            course.semester,
          ) ||
          getSemesterName(
            course.semester,
          );

        if (!key) return;

        if (!map.has(key)) {
          map.set(key, {
            key,
            name: getSemesterName(
              course.semester,
            ),
            order: getSemesterOrder(
              course.semester,
            ),
          });
        }
      },
    );

    registrations.forEach(
      (registration) => {
        const key =
          getSemesterId(
            registration.semester,
          ) ||
          getSemesterName(
            registration.semester,
          );

        if (!key) return;

        if (!map.has(key)) {
          map.set(key, {
            key,
            name: getSemesterName(
              registration.semester,
            ),
            order: getSemesterOrder(
              registration.semester,
            ),
          });
        }
      },
    );

    return Array.from(
      map.values(),
    ).sort(
      (a, b) =>
        a.order - b.order,
    );
  }, [
    availableCourses,
    registrations,
  ]);

  /* =======================================================
     FILTER AVAILABLE COURSES
  ======================================================= */

  const filteredAvailableCourses =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return availableCourses.filter(
        (course) => {
          const matchesSearch =
            !query ||
            course.code
              .toLowerCase()
              .includes(query) ||
            course.title
              .toLowerCase()
              .includes(query) ||
            course.category
              ?.toLowerCase()
              .includes(query);

          const courseSemester =
            getSemesterId(
              course.semester,
            );

          const matchesSemester =
            semesterFilter === "all" ||
            courseSemester ===
              semesterFilter;

          return (
            matchesSearch &&
            matchesSemester
          );
        },
      );
    }, [
      availableCourses,
      search,
      semesterFilter,
    ]);

  /* =======================================================
     FILTER REGISTERED COURSES
  ======================================================= */

  const filteredRegistrations =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return registrations.filter(
        (registration) => {
          const course =
            registration.course;

          if (
            !course ||
            typeof course === "string"
          ) {
            return false;
          }

          const matchesSearch =
            !query ||
            course.code
              .toLowerCase()
              .includes(query) ||
            course.title
              .toLowerCase()
              .includes(query);

          const registrationSemester =
            getSemesterId(
              registration.semester,
            );

          const matchesSemester =
            semesterFilter === "all" ||
            registrationSemester ===
              semesterFilter;

          return (
            matchesSearch &&
            matchesSemester
          );
        },
      );
    }, [
      registrations,
      search,
      semesterFilter,
    ]);

  /* =======================================================
     CREDIT TOTALS
  ======================================================= */

  const registeredCredits =
    useMemo(() => {
      return filteredRegistrations.reduce(
        (total, registration) => {
          if (
            !registration.course ||
            typeof registration.course ===
              "string"
          ) {
            return total;
          }

          return (
            total +
            Number(
              registration.course
                .creditUnits || 0,
            )
          );
        },
        0,
      );
    }, [filteredRegistrations]);

  const availableCredits =
    useMemo(() => {
      return filteredAvailableCourses.reduce(
        (total, course) =>
          total +
          Number(
            course.creditUnits || 0,
          ),
        0,
      );
    }, [filteredAvailableCourses]);

  /* =======================================================
     DROP COURSE
  ======================================================= */

  const handleDrop = async (
    registrationId: string,
    courseTitle: string,
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to drop "${courseTitle}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDroppingId(
        registrationId,
      );
      setError("");
      setSuccess("");

      const response =
        await apiPatch<DropResponse>(
          `/registrations/${registrationId}/drop`,
          {},
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to drop course",
        );
      }

      setSuccess(
        "Course dropped successfully.",
      );

      await loadData(true);
    } catch (err) {
      console.error(
        "Drop course error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to drop course",
      );
    } finally {
      setDroppingId(null);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    sessionStatus === "loading" ||
    loading
  ) {
    return (
      <div className="min-h-full bg-slate-50">
        <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="overflow-hidden rounded-3xl bg-brand-navy p-6 sm:p-8">
            <Skeleton className="h-6 w-32 bg-white/10" />
            <Skeleton className="mt-4 h-10 w-72 bg-white/10" />
            <Skeleton className="mt-4 h-5 w-full max-w-2xl bg-white/10" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="mt-4 h-8 w-20" />
                <Skeleton className="mt-2 h-4 w-28" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-full lg:w-64" />
              <Skeleton className="h-12 w-full lg:w-28" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <Skeleton className="h-6 w-48" />
            </div>

            <div className="divide-y divide-slate-100">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="p-5"
                >
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />

                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-64 max-w-full" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-brand-navy shadow-lg">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-brand-gold">
                  <BookOpen className="h-4 w-4" />
                  Academic Records
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  My Courses
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                  View your available courses, registered
                  courses and academic credit load.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {programmeCode && (
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                      {programmeCode}
                    </span>
                  )}

                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                    {formatLevel(studentLevel)}
                  </span>

                  <span className="rounded-full bg-brand-gold/15 px-3 py-1.5 text-xs font-semibold text-brand-gold">
                    {programmeName}
                  </span>
                </div>
              </div>

              <Link
                href="/dashboards/student/registration"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-sm font-bold text-brand-navy transition hover:brightness-105"
              >
                <GraduationCap className="h-4 w-4" />
                Course Registration
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-red-800">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  loadData(true)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            {success}
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Registered Courses
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {filteredRegistrations.length}
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Currently registered
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Registered Credits
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {registeredCredits}
            </p>

            <div className="mt-3 text-xs text-slate-500">
              Credit units registered
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Available Courses
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {filteredAvailableCourses.length}
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
              <BookOpen className="h-4 w-4" />
              Courses available
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Available Credits
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {availableCredits}
            </p>

            <div className="mt-3 text-xs text-slate-500">
              Across displayed courses
            </div>
          </div>
        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search course code, title or category..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <select
              value={semesterFilter}
              onChange={(event) =>
                setSemesterFilter(
                  event.target.value,
                )
              }
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10 lg:w-64"
            >
              <option value="all">
                All Semesters
              </option>

              {semesters.map(
                (semester) => (
                  <option
                    key={semester.key}
                    value={semester.key}
                  >
                    {semester.name}
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              onClick={() =>
                loadData(true)
              }
              disabled={refreshing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-brand-gold hover:bg-brand-gold/5 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </section>

        {/* =================================================
            REGISTERED COURSES
        ================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  My Registered Courses
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Courses you have successfully registered for.
              </p>
            </div>

            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              {filteredRegistrations.length} registered
            </span>
          </div>

          {filteredRegistrations.length ===
          0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BookOpen className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                No registered courses
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                You have not registered for any courses matching the current filters.
              </p>

              <Link
                href="/dashboards/student/registration"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white"
              >
                Register Courses
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRegistrations.map(
                (registration) => {
                  if (
                    !registration.course ||
                    typeof registration.course ===
                      "string"
                  ) {
                    return null;
                  }

                  const course =
                    registration.course;

                  return (
                    <div
                      key={
                        registration._id
                      }
                      className="p-5 transition hover:bg-slate-50 sm:p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
                            <BookOpen className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-brand-navy">
                                {course.code}
                              </span>

                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                Registered
                              </span>
                            </div>

                            <h3 className="mt-1 font-semibold text-slate-900">
                              {course.title}
                            </h3>

                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {getSemesterName(
                                  registration.semester,
                                )}
                              </span>

                              <span>
                                •
                              </span>

                              <span>
                                {course.creditUnits}{" "}
                                credit{" "}
                                {course.creditUnits ===
                                1
                                  ? "unit"
                                  : "units"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleDrop(
                              registration._id,
                              course.title,
                            )
                          }
                          disabled={
                            droppingId ===
                            registration._id
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {droppingId ===
                          registration._id ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Dropping...
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4" />
                              Drop Course
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        {/* =================================================
            AVAILABLE COURSES
        ================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  Available Courses
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Active courses available for your programme and level.
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              {filteredAvailableCourses.length} available
            </span>
          </div>

          {filteredAvailableCourses.length ===
          0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <GraduationCap className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                No available courses
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                There are no active courses matching your current programme, level or filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAvailableCourses.map(
                (course) => {
                  const isRegistered =
                    registeredCourseIds.has(
                      course._id,
                    );

                  return (
                    <div
                      key={course._id}
                      className="p-5 transition hover:bg-slate-50 sm:p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                              isRegistered
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-brand-navy"
                            }`}
                          >
                            {isRegistered ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <BookOpen className="h-5 w-5" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-brand-navy">
                                {course.code}
                              </span>

                              {course.category && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                  {course.category}
                                </span>
                              )}

                              {isRegistered && (
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                  Registered
                                </span>
                              )}
                            </div>

                            <h3 className="mt-1 font-semibold text-slate-900">
                              {course.title}
                            </h3>

                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {getSemesterName(
                                  course.semester,
                                )}
                              </span>

                              <span>
                                {formatLevel(
                                  course.level,
                                )}
                              </span>

                              <span>
                                {course.creditUnits}{" "}
                                credit{" "}
                                {course.creditUnits ===
                                1
                                  ? "unit"
                                  : "units"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isRegistered ? (
                            <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 lg:w-auto">
                              <CheckCircle2 className="h-4 w-4" />
                              Already Registered
                            </span>
                          ) : (
                            <Link
                              href="/dashboards/student/registration"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy/90 lg:w-auto"
                            >
                              Register
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="rounded-xl bg-brand-gold/10 p-3 text-brand-gold">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Academic Course Summary
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  You currently have{" "}
                  <strong className="text-slate-900">
                    {registeredCredits}
                  </strong>{" "}
                  registered credit units across{" "}
                  <strong className="text-slate-900">
                    {filteredRegistrations.length}
                  </strong>{" "}
                  registered course
                  {filteredRegistrations.length ===
                  1
                    ? ""
                    : "s"}
                  .
                </p>
              </div>
            </div>

            <Link
              href="/dashboards/student/registration"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-navy hover:text-white"
            >
              Manage Registration
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />
          Course information is retrieved from the ITMT academic system.
        </div>
      </div>
    </div>
  );
}