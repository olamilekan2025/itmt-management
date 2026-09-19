"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  Layers3,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Course {
  _id: string;
  code: string;
  title: string;
  creditUnits?: number;
  level?: number | string;
}

interface Semester {
  _id: string;
  name: string;
  order?: number;
}

interface LecturerAssignment {
  _id: string;
  course: Course | string;
  semester: Semester | string;
  isActive?: boolean;
  createdAt?: string;
}

interface AssignmentsResponse {
  success: boolean;
  assignments?: LecturerAssignment[];
  message?: string;
}

interface Student {
  _id: string;
  name?: string;
  email?: string;
  matricNumber?: string;
}

interface RosterItem {
  registrationId: string;
  student: Student | string;
}

interface RosterResponse {
  success: boolean;
  roster?: RosterItem[];
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getId(
  value:
    | string
    | { _id?: string }
    | null
    | undefined,
): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id ?? "";
}

function getCourse(
  value: Course | string | null | undefined,
): Course | null {
  if (!value || typeof value === "string") {
    return null;
  }

  return value;
}

function getSemester(
  value: Semester | string | null | undefined,
): Semester | null {
  if (!value || typeof value === "string") {
    return null;
  }

  return value;
}

/* =========================================================
   PREMIUM SKELETON
========================================================= */

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`}
    />
  );
}

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="relative h-[116px] overflow-hidden bg-slate-200">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />

        <div className="relative flex items-start gap-3 p-5">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl bg-white/60" />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-20 rounded-md bg-white/60" />
            <Skeleton className="h-5 w-4/5 rounded-md bg-white/60" />
            <Skeleton className="h-4 w-3/5 rounded-md bg-white/60" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-6 w-8" />
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <Skeleton className="mb-2 h-3 w-14" />
            <Skeleton className="h-6 w-10" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>

          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />

            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>

          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>

        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

function LecturerCoursesSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-navy">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-7 w-40 rounded-full bg-white/10" />

              <Skeleton className="h-10 w-64 bg-white/10 sm:w-80" />

              <Skeleton className="h-4 w-full max-w-xl bg-white/10" />

              <Skeleton className="h-4 w-4/5 max-w-lg bg-white/10" />
            </div>

            <Skeleton className="h-11 w-40 rounded-xl bg-white/10" />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />

                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 bg-white/10" />
                    <Skeleton className="h-6 w-10 bg-white/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-64" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-11 w-full rounded-xl sm:w-64" />
              <Skeleton className="h-11 w-full rounded-xl sm:w-40" />
            </div>
          </div>
        </div>

        {/* Course cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyCourses() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
        <BookOpen className="h-8 w-8 text-brand-navy" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        No courses assigned
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        You currently do not have any active courses assigned
        to you. Contact the registrar or administrator if you
        believe this is incorrect.
      </p>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function LecturerCoursesPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  /*
   * IMPORTANT:
   * apiGet() requires the access token as its second
   * argument for authenticated requests.
   */
  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : "";

  const [assignments, setAssignments] = useState<
    LecturerAssignment[]
  >([]);

  const [studentCounts, setStudentCounts] = useState<
    Record<string, number>
  >({});

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [semesterFilter, setSemesterFilter] =
    useState("all");

  /* =========================================================
     LOAD COURSES
  ========================================================= */

  const loadCourses = useCallback(
    async (isRefresh = false) => {
      /*
       * Never make an authenticated API request without
       * the access token.
       */
      if (!accessToken) {
        setError(
          "Authentication token is unavailable. Please sign in again.",
        );

        if (!isRefresh) {
          setLoading(false);
        }

        setRefreshing(false);

        return;
      }

      try {
        if (isRefresh) {
          /*
           * Refresh should NOT replace the page with the
           * skeleton. Keep the existing data visible.
           */
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        /* -----------------------------------------------------
           GET CURRENT LECTURER ASSIGNMENTS
        ----------------------------------------------------- */

        const response =
          await apiGet<AssignmentsResponse>(
            "/lecturer-assignments/me",
            accessToken,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to load your assigned courses.",
          );
        }

        const assignedCourses =
          Array.isArray(response.assignments)
            ? response.assignments.filter(
                (assignment) =>
                  assignment.isActive !== false,
              )
            : [];

        setAssignments(assignedCourses);

        /* -----------------------------------------------------
           BUILD UNIQUE COURSE + SEMESTER PAIRS
        ----------------------------------------------------- */

        const uniquePairsMap = new Map<
          string,
          {
            key: string;
            courseId: string;
            semesterId: string;
          }
        >();

        for (const assignment of assignedCourses) {
          const courseId = getId(
            assignment.course,
          );

          const semesterId = getId(
            assignment.semester,
          );

          if (!courseId || !semesterId) {
            continue;
          }

          const key = `${courseId}:${semesterId}`;

          if (!uniquePairsMap.has(key)) {
            uniquePairsMap.set(key, {
              key,
              courseId,
              semesterId,
            });
          }
        }

        const uniquePairs = Array.from(
          uniquePairsMap.values(),
        );

        /* -----------------------------------------------------
           GET ROSTER COUNTS
        ----------------------------------------------------- */

        const counts: Record<string, number> = {};

        await Promise.all(
          uniquePairs.map(async (pair) => {
            try {
              const rosterResponse =
                await apiGet<RosterResponse>(
                  `/registrations/roster?course=${encodeURIComponent(
                    pair.courseId,
                  )}&semester=${encodeURIComponent(
                    pair.semesterId,
                  )}`,
                  accessToken,
                );

              counts[pair.key] =
                Array.isArray(
                  rosterResponse?.roster,
                )
                  ? rosterResponse.roster.length
                  : 0;
            } catch (rosterError) {
              /*
               * Do not fail the entire courses page if one
               * roster request fails.
               */
              console.error(
                `Failed to load roster for ${pair.key}:`,
                rosterError,
              );

              counts[pair.key] = 0;
            }
          }),
        );

        setStudentCounts(counts);
      } catch (err) {
        console.error(
          "Failed to load lecturer courses:",
          err,
        );

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load your courses.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    /*
     * Wait for NextAuth to finish loading.
     */
    if (sessionStatus === "loading") {
      return;
    }

    /*
     * Don't request the API if the user is not logged in.
     */
    if (sessionStatus !== "authenticated") {
      setLoading(false);
      return;
    }

    /*
     * Wait until the JWT/access token is available.
     */
    if (!accessToken) {
      return;
    }

    void loadCourses(false);
  }, [
    sessionStatus,
    accessToken,
    loadCourses,
  ]);

  /* =========================================================
     SEMESTERS
  ========================================================= */

  const semesters = useMemo(() => {
    const map = new Map<string, Semester>();

    for (const assignment of assignments) {
      const semester = getSemester(
        assignment.semester,
      );

      if (!semester?._id) {
        continue;
      }

      if (!map.has(semester._id)) {
        map.set(semester._id, semester);
      }
    }

    return Array.from(map.values()).sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0),
    );
  }, [assignments]);

  /* =========================================================
     FILTER COURSES
  ========================================================= */

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const course = getCourse(
        assignment.course,
      );

      const semester = getSemester(
        assignment.semester,
      );

      if (!course || !semester) {
        return false;
      }

      const matchesSearch =
        !query ||
        course.code
          ?.toLowerCase()
          .includes(query) ||
        course.title
          ?.toLowerCase()
          .includes(query) ||
        semester.name
          ?.toLowerCase()
          .includes(query);

      const matchesSemester =
        semesterFilter === "all" ||
        semester._id === semesterFilter;

      return (
        matchesSearch &&
        matchesSemester
      );
    });
  }, [
    assignments,
    search,
    semesterFilter,
  ]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const activeCourseCount =
    assignments.length;

  const totalStudents = useMemo(() => {
    return Object.values(studentCounts).reduce(
      (total, count) => total + count,
      0,
    );
  }, [studentCounts]);

  const semesterCount = semesters.length;

  /* =========================================================
     SESSION LOADING
  ========================================================= */

  if (sessionStatus === "loading") {
    return <LecturerCoursesSkeleton />;
  }

  /* =========================================================
     UNAUTHENTICATED
  ========================================================= */

  if (sessionStatus !== "authenticated") {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/5">
              <GraduationCap className="h-7 w-7 text-brand-navy" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Lecturer session required
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Please sign in to access your assigned courses.
            </p>

            <Link
              href="/auth/login"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-navy px-6 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     INITIAL LOADING
  ========================================================= */

  if (loading) {
    return <LecturerCoursesSkeleton />;
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */

  if (error && assignments.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <X className="h-7 w-7 text-red-600" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Unable to load courses
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadCourses(true)
              }
              disabled={refreshing}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={
                  refreshing
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />

              Try again
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-2xl bg-brand-navy">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1.5 text-xs font-semibold text-brand-gold">
                <BookOpen className="h-3.5 w-3.5" />
                Teaching Workspace
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                My Courses
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Manage your assigned courses, view registered
                students, and access course results from one
                workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadCourses(true)
              }
              disabled={refreshing}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={
                  refreshing
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh Courses"}
            </button>
          </div>

          {/* Summary */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {/* Assigned Courses */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10">
                  <BookOpen className="h-5 w-5 text-brand-gold" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Assigned Courses
                  </p>

                  <p className="mt-0.5 text-2xl font-bold text-white">
                    {activeCourseCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Students */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10">
                  <Users className="h-5 w-5 text-blue-300" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Registered Seats
                  </p>

                  <p className="mt-0.5 text-2xl font-bold text-white">
                    {totalStudents}
                  </p>
                </div>
              </div>
            </div>

            {/* Semesters */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Layers3 className="h-5 w-5 text-slate-200" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Semesters
                  </p>

                  <p className="mt-0.5 text-2xl font-bold text-white">
                    {semesterCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-0 py-7 sm:px-0 lg:px-0">
        {/* Refresh error */}
        {error && assignments.length > 0 && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div>
              <p className="font-semibold">
                Refresh failed
              </p>

              <p className="mt-1 text-red-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-500 transition hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/5">
                  <ClipboardList className="h-4 w-4 text-brand-navy" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Course Assignments
                  </h2>

                  <p className="text-xs text-slate-500">
                    {filteredAssignments.length}{" "}
                    {filteredAssignments.length === 1
                      ? "course"
                      : "courses"}{" "}
                    displayed
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search courses..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 sm:w-64"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Semester */}
              <div className="relative">
                <select
                  value={semesterFilter}
                  onChange={(event) =>
                    setSemesterFilter(
                      event.target.value,
                    )
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 sm:w-40"
                >
                  <option value="all">
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

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {assignments.length === 0 ? (
          <EmptyCourses />
        ) : filteredAssignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Search className="h-6 w-6 text-slate-400" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No matching courses
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or semester filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSemesterFilter("all");
              }}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Course grid */
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAssignments.map(
              (assignment) => {
                const course = getCourse(
                  assignment.course,
                );

                const semester = getSemester(
                  assignment.semester,
                );

                if (!course || !semester) {
                  return null;
                }

                const courseId = getId(
                  assignment.course,
                );

                const semesterId = getId(
                  assignment.semester,
                );

                const pairKey =
                  `${courseId}:${semesterId}`;

                const registeredStudents =
                  studentCounts[pairKey] ?? 0;

                return (
                  <article
                    key={assignment._id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                  >
                    {/* Card Header */}
                    <div className="relative overflow-hidden bg-brand-navy px-5 py-5">
                      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-brand-gold/10 blur-2xl" />

                      <div className="pointer-events-none absolute -bottom-16 left-20 h-32 w-32 rounded-full bg-brand-blue/10 blur-2xl" />

                      <div className="relative flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                          <BookOpen className="h-5 w-5 text-brand-gold" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex rounded-md border border-brand-gold/20 bg-brand-gold/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-gold">
                              {course.code}
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" />
                              Assigned
                            </span>
                          </div>

                          <h3 className="mt-3 line-clamp-2 text-base font-bold leading-6 text-white">
                            {course.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="space-y-3 p-5">
                      {/* Credits + Level */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Credit Units
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {course.creditUnits ??
                              "—"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Level
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {course.level ?? "—"}
                          </p>
                        </div>
                      </div>

                      {/* Semester */}
                      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Academic Semester
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {semester.name}
                          </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy/5">
                          <Layers3 className="h-4 w-4 text-brand-navy" />
                        </div>
                      </div>

                      {/* Students */}
                      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy/5">
                            <Users className="h-4 w-4 text-brand-navy" />
                          </div>

                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Registered Students
                            </p>

                            <p className="mt-0.5 text-sm font-bold text-slate-900">
                              {registeredStudents}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-brand-navy/5 px-2.5 py-1 text-[10px] font-semibold text-brand-navy">
                          Active Roster
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Link
                          href={`/dashboards/lecturer/courses/${courseId}?semester=${semesterId}`}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-3 text-xs font-semibold text-white transition hover:bg-brand-navy/90"
                        >
                          <Users className="h-3.5 w-3.5" />
                          Students
                        </Link>

                        <Link
                          href={`/dashboards/lecturer/results?course=${courseId}&semester=${semesterId}`}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-brand-navy/20 hover:bg-slate-50"
                        >
                          <ClipboardList className="h-3.5 w-3.5" />
                          Results
                        </Link>
                      </div>

                      {/* Course Registrations */}
                      <Link
                        href={`/dashboards/lecturer/courses/${courseId}?semester=${semesterId}`}
                        className="group/link flex items-center justify-between rounded-lg px-1 py-1 text-xs font-semibold text-brand-navy"
                      >
                        <span>
                          View course registrations
                        </span>

                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </main>
  );
}