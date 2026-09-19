"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Layers3,
  Mail,
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

interface Programme {
  _id?: string;
  name?: string;
}

interface Department {
  _id?: string;
  name?: string;
}

interface Course {
  _id: string;
  code: string;
  title: string;
  creditUnits?: number;
  level?: number | string;
  programme?: Programme | string;
  department?: Department | string;
}

interface Semester {
  _id: string;
  name: string;
  order?: number;
}

interface LecturerAssignment {
  _id: string;

  course:
    | Course
    | string;

  semester:
    | Semester
    | string;

  status?: string;

  lecturer?: string;

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
  programme?: Programme | string;
  level?: number | string;
}

interface RosterItem {
  registrationId: string;
  student: Student | string;
  status?: string;
  registeredAt?: string;
}

interface RosterResponse {
  success: boolean;
  roster?: RosterItem[];
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */

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

function getStudent(
  value: Student | string | null | undefined,
): Student | null {
  if (!value || typeof value === "string") {
    return null;
  }

  return value;
}

function getProgrammeName(
  value:
    | Programme
    | string
    | null
    | undefined,
): string {
  if (!value) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.name || "—";
}

function getInitials(name?: string) {
  if (!name?.trim()) {
    return "ST";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    `${parts[0][0]}${parts[parts.length - 1][0]}`
  ).toUpperCase();
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
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

function CoursePageSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden rounded-2xl bg-brand-navy">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-5 w-36 bg-white/10" />

          <Skeleton className="mt-5 h-9 w-72 bg-white/10" />

          <Skeleton className="mt-3 h-4 w-full max-w-xl bg-white/10" />

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                >
                  <Skeleton className="h-3 w-24 bg-white/10" />

                  <Skeleton className="mt-2 h-7 w-12 bg-white/10" />
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Skeleton className="h-5 w-36" />

              <Skeleton className="mt-2 h-3 w-64" />
            </div>

            <Skeleton className="h-11 w-full rounded-xl sm:w-72" />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <Skeleton className="h-4 w-32" />
          </div>

          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 border-b border-slate-100 p-4 last:border-b-0"
              >
                <Skeleton className="h-10 w-10 rounded-full" />

                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />

                  <Skeleton className="h-3 w-56" />
                </div>

                <Skeleton className="hidden h-8 w-24 sm:block" />
              </div>
            ),
          )}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   ERROR STATE
========================================================= */

function ErrorState({
  message,
  onRetry,
  refreshing,
}: {
  message: string;
  onRetry: () => void;
  refreshing: boolean;
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <X className="h-7 w-7 text-red-600" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Unable to load course
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {message}
          </p>

          <button
            type="button"
            onClick={onRetry}
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

            {refreshing
              ? "Retrying..."
              : "Try again"}
          </button>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   EMPTY ROSTER
========================================================= */

function EmptyRoster() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/5">
        <Users className="h-7 w-7 text-brand-navy" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        No registered students
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        There are currently no students registered
        for this course in the selected semester.
      </p>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function LecturerCoursePage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const params = useParams();
  const searchParams = useSearchParams();

  const courseId =
    typeof params.courseId === "string"
      ? params.courseId
      : "";

  const semesterId =
    searchParams.get("semester") || "";

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : "";

  const [course, setCourse] =
    useState<Course | null>(null);

  const [semester, setSemester] =
    useState<Semester | null>(null);

  const [roster, setRoster] = useState<
    RosterItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  /* =========================================================
     LOAD COURSE + ROSTER
  ========================================================= */

  const loadCourse = useCallback(
    async (isRefresh = false) => {
      if (!courseId) {
        setError("Course ID is missing.");
        setLoading(false);
        return;
      }

      if (!semesterId) {
        setError(
          "Semester information is missing from this course.",
        );
        setLoading(false);
        return;
      }

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
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        /* -----------------------------------------------------
           LOAD LECTURER ASSIGNMENTS

           IMPORTANT:
           Lecturer should NOT call:
             /courses/:courseId
             /semesters/:semesterId

           The lecturer assignment endpoint already returns
           populated course + semester information.
        ----------------------------------------------------- */

        const assignmentsResponse =
          await apiGet<AssignmentsResponse>(
            "/lecturer-assignments/me",
            accessToken,
          );

        if (!assignmentsResponse?.success) {
          throw new Error(
            assignmentsResponse?.message ||
              "Unable to load your lecturer assignments.",
          );
        }

        const assignments =
          Array.isArray(
            assignmentsResponse.assignments,
          )
            ? assignmentsResponse.assignments
            : [];

        /* -----------------------------------------------------
           FIND CURRENT ASSIGNMENT
        ----------------------------------------------------- */

        const assignment =
          assignments.find((item) => {
            const assignedCourse =
              getCourse(item.course);

            const assignedSemester =
              getSemester(item.semester);

            if (
              !assignedCourse ||
              !assignedSemester
            ) {
              return false;
            }

            return (
              assignedCourse._id === courseId &&
              assignedSemester._id === semesterId
            );
          });

        if (!assignment) {
          throw new Error(
            "This course is not assigned to your lecturer account for the selected semester.",
          );
        }

        const assignedCourse =
          getCourse(assignment.course);

        const assignedSemester =
          getSemester(assignment.semester);

        if (!assignedCourse) {
          throw new Error(
            "Course information was not populated for this lecturer assignment.",
          );
        }

        if (!assignedSemester) {
          throw new Error(
            "Semester information was not populated for this lecturer assignment.",
          );
        }

        setCourse(assignedCourse);
        setSemester(assignedSemester);

        /* -----------------------------------------------------
           LOAD REGISTERED STUDENTS

           This endpoint is lecturer-authorized and verifies
           that the lecturer has an active assignment.
        ----------------------------------------------------- */

        const rosterResponse =
          await apiGet<RosterResponse>(
            `/registrations/roster?course=${encodeURIComponent(
              courseId,
            )}&semester=${encodeURIComponent(
              semesterId,
            )}`,
            accessToken,
          );

        if (!rosterResponse?.success) {
          throw new Error(
            rosterResponse?.message ||
              "Unable to load registered students.",
          );
        }

        setRoster(
          Array.isArray(rosterResponse.roster)
            ? rosterResponse.roster
            : [],
        );
      } catch (err) {
        console.error(
          "Failed to load lecturer course:",
          err,
        );

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load this course.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      accessToken,
      courseId,
      semesterId,
    ],
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (sessionStatus !== "authenticated") {
      setLoading(false);
      return;
    }

    if (!accessToken) {
      return;
    }

    void loadCourse(false);
  }, [
    sessionStatus,
    accessToken,
    loadCourse,
  ]);

  /* =========================================================
     FILTER ROSTER
  ========================================================= */

  const filteredRoster = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return roster;
    }

    return roster.filter((item) => {
      const student = getStudent(
        item.student,
      );

      if (!student) {
        return false;
      }

      return (
        student.name
          ?.toLowerCase()
          .includes(query) ||
        student.email
          ?.toLowerCase()
          .includes(query) ||
        student.matricNumber
          ?.toLowerCase()
          .includes(query) ||
        getProgrammeName(
          student.programme,
        )
          .toLowerCase()
          .includes(query)
      );
    });
  }, [roster, search]);

  /* =========================================================
     SESSION LOADING
  ========================================================= */

  if (sessionStatus === "loading") {
    return <CoursePageSkeleton />;
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
              Please sign in to access this course.
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
    return <CoursePageSkeleton />;
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error && !course) {
    return (
      <ErrorState
        message={error}
        onRetry={() =>
          void loadCourse(true)
        }
        refreshing={refreshing}
      />
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

        <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <Link
            href="/dashboards/lecturer/courses"
            className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Courses
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1.5 text-xs font-bold text-brand-gold">
                  <BookOpen className="h-3.5 w-3.5" />
                  {course?.code}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Assigned
                </span>
              </div>

              <h1 className="mt-4 max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {course?.title ||
                  "Course Details"}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-brand-gold" />

                  {semester?.name ||
                    "Selected Semester"}
                </span>

                <span>
                  {course?.creditUnits ?? "—"}{" "}
                  Credit Units
                </span>

                <span>
                  Level {course?.level ?? "—"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadCourse(true)
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
                : "Refresh Roster"}
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10">
                  <BookOpen className="h-5 w-5 text-brand-gold" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Course
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-white">
                    {course?.code || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10">
                  <Users className="h-5 w-5 text-blue-300" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Registered Students
                  </p>

                  <p className="mt-0.5 text-2xl font-bold text-white">
                    {roster.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Layers3 className="h-5 w-5 text-slate-200" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Semester
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-white">
                    {semester?.name || "—"}
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

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {error && course && (
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

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/5">
                  <Users className="h-5 w-5 text-brand-navy" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Registered Students
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {filteredRoster.length} of{" "}
                    {roster.length} students displayed
                  </p>
                </div>
              </div>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search students..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
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
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {roster.length === 0 ? (
            <EmptyRoster />
          ) : filteredRoster.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Search className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No students found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try searching with another name,
                matric number, email, or programme.
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Student
                      </th>

                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Matric Number
                      </th>

                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Programme
                      </th>

                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Level
                      </th>

                      <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRoster.map(
                      (item, index) => {
                        const student =
                          getStudent(
                            item.student,
                          );

                        if (!student) {
                          return null;
                        }

                        return (
                          <tr
                            key={
                              item.registrationId ||
                              student._id ||
                              index
                            }
                            className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-b-0"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                                  {getInitials(
                                    student.name,
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {student.name ||
                                      "Unnamed Student"}
                                  </p>

                                  {student.email && (
                                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                                      <Mail className="h-3 w-3" />

                                      {student.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                {student.matricNumber ||
                                  "—"}
                              </span>
                            </td>

                            <td className="max-w-[260px] px-5 py-4">
                              <p className="truncate text-sm text-slate-700">
                                {getProgrammeName(
                                  student.programme,
                                )}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                              {student.level
                                ? `Level ${student.level}`
                                : "—"}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" />

                                {item.status ||
                                  "Registered"}
                              </span>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredRoster.map(
                  (item, index) => {
                    const student =
                      getStudent(
                        item.student,
                      );

                    if (!student) {
                      return null;
                    }

                    return (
                      <article
                        key={
                          item.registrationId ||
                          student._id ||
                          index
                        }
                        className="p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                            {getInitials(
                              student.name,
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-bold text-slate-900">
                                  {student.name ||
                                    "Unnamed Student"}
                                </h3>

                                <p className="mt-1 text-xs font-semibold text-brand-navy">
                                  {student.matricNumber ||
                                    "No matric number"}
                                </p>
                              </div>

                              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                {item.status ||
                                  "Registered"}
                              </span>
                            </div>

                            <div className="mt-3 space-y-2">
                              {student.email && (
                                <p className="flex items-center gap-2 text-xs text-slate-500">
                                  <Mail className="h-3.5 w-3.5 shrink-0" />

                                  <span className="truncate">
                                    {student.email}
                                  </span>
                                </p>
                              )}

                              <p className="flex items-start gap-2 text-xs text-slate-500">
                                <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                                <span>
                                  {getProgrammeName(
                                    student.programme,
                                  )}
                                </span>
                              </p>

                              <p className="text-xs font-medium text-slate-500">
                                {student.level
                                  ? `Level ${student.level}`
                                  : "Level not specified"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}