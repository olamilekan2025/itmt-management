"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  RefreshCw,
  Search,
} from "lucide-react";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Course {
  _id: string;
  code?: string;
  title?: string;
  creditUnits?: number;
  level?: string | number;

  programme?:
    | {
        _id?: string;
        name?: string;
      }
    | string
    | null;

  department?:
    | {
        _id?: string;
        name?: string;
      }
    | string
    | null;
}

interface Semester {
  _id: string;
  name?: string;
  order?: number;
}

interface LecturerAssignment {
  _id: string;

  course: Course | string;

  semester: Semester | string;

  lecturer?:
    | string
    | {
        _id?: string;
        name?: string;
      };

  isActive?: boolean;
}

interface AssignmentsResponse {
  success: boolean;
  assignments?: LecturerAssignment[];
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getCourse(
  assignment: LecturerAssignment,
): Course | null {
  if (
    typeof assignment.course === "object" &&
    assignment.course !== null
  ) {
    return assignment.course;
  }

  return null;
}

function getSemester(
  assignment: LecturerAssignment,
): Semester | null {
  if (
    typeof assignment.semester === "object" &&
    assignment.semester !== null
  ) {
    return assignment.semester;
  }

  return null;
}

function getCourseId(
  assignment: LecturerAssignment,
): string {
  if (typeof assignment.course === "string") {
    return assignment.course;
  }

  return assignment.course?._id ?? "";
}

function getSemesterId(
  assignment: LecturerAssignment,
): string {
  if (typeof assignment.semester === "string") {
    return assignment.semester;
  }

  return assignment.semester?._id ?? "";
}

function getProgrammeName(
  course: Course | null,
): string {
  if (!course?.programme) {
    return "Programme not assigned";
  }

  if (typeof course.programme === "string") {
    return course.programme;
  }

  return (
    course.programme.name ??
    "Programme not assigned"
  );
}

function getDepartmentName(
  course: Course | null,
): string {
  if (!course?.department) {
    return "Department not assigned";
  }

  if (typeof course.department === "string") {
    return course.department;
  }

  return (
    course.department.name ??
    "Department not assigned"
  );
}

function getInitials(
  code?: string,
): string {
  if (!code) {
    return "CR";
  }

  return code
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();
}

/* =========================================================
   SKELETON
========================================================= */

function ResultsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="h-44 animate-pulse rounded-3xl bg-slate-200" />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      {/* Search */}
      <div className="h-14 animate-pulse rounded-2xl bg-slate-200" />

      {/* Cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-64 animate-pulse rounded-3xl bg-slate-200"
          />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function LecturerResultsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const [assignments, setAssignments] =
    useState<LecturerAssignment[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD ASSIGNMENTS
  ======================================================= */

  const loadAssignments = useCallback(
    async (
      showRefreshing = false,
    ) => {
      if (!session?.accessToken) {
        return;
      }

      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          (await apiGet(
            "/lecturer-assignments/me",
            session.accessToken,
          )) as AssignmentsResponse;

        if (!response?.success) {
          throw new Error(
            response?.message ??
              "Unable to load lecturer assignments.",
          );
        }

        const activeAssignments =
          (response.assignments ?? []).filter(
            (assignment) =>
              assignment.isActive !== false,
          );

        setAssignments(
          activeAssignments,
        );
      } catch (err) {
        console.error(
          "Load lecturer assignments error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your assigned courses.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session?.accessToken],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (
      sessionStatus === "authenticated"
    ) {
      void loadAssignments();
    }
  }, [
    sessionStatus,
    loadAssignments,
  ]);

  /* =======================================================
     FILTER ASSIGNMENTS
  ======================================================= */

  const filteredAssignments =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return assignments;
      }

      return assignments.filter(
        (assignment) => {
          const course =
            getCourse(assignment);

          const semester =
            getSemester(assignment);

          const searchable = [
            course?.code,
            course?.title,
            getProgrammeName(course),
            getDepartmentName(course),
            semester?.name,
            course?.level
              ? `level ${course.level}`
              : "",
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(query);
        },
      );
    }, [assignments, search]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalCourses =
    assignments.length;

  /* =======================================================
     AUTH LOADING
  ======================================================= */

  if (
    sessionStatus === "loading" ||
    loading
  ) {
    return (
      <ResultsPageSkeleton />
    );
  }

  /* =======================================================
     UNAUTHENTICATED
  ======================================================= */

  if (
    sessionStatus === "unauthenticated"
  ) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />

        <h2 className="text-lg font-bold text-red-900">
          Authentication Required
        </h2>

        <p className="mt-2 text-sm text-red-700">
          Please sign in again to view
          your lecturer results.
        </p>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="space-y-6 pb-10">

      {/* ===================================================
          HERO
      ================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 text-white shadow-xl md:p-8">

        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-gold/10 blur-2xl" />

        <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200">
              <ClipboardCheck className="h-4 w-4 text-brand-gold" />

              Lecturer Results
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Results Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Manage scores for the courses
              assigned to you. Enter student
              results, review submitted results,
              and monitor the result workflow.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadAssignments(true)
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-5 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </section>

      {/* ===================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">

          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">
              Unable to load results
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadAssignments(true)
            }
            className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold transition hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* ===================================================
          STATS
      ================================================== */}

      <div className="grid gap-4 md:grid-cols-3">

        {/* Assigned Courses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Assigned Courses
              </p>

              <p className="mt-2 text-3xl font-bold text-brand-navy">
                {totalCourses}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>

          </div>
        </div>

        {/* Enter Results */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Result Entry
              </p>

              <p className="mt-2 text-sm font-semibold text-brand-navy">
                Manage Student Scores
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3">
              <ClipboardCheck className="h-6 w-6 text-amber-600" />
            </div>

          </div>
        </div>

        {/* Submitted */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Submitted Results
              </p>

              <p className="mt-2 text-sm font-semibold text-brand-navy">
                Review Submitted Scores
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>

          </div>
        </div>

      </div>

      {/* ===================================================
          SEARCH
      ================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

        <div className="relative">

          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by course code, title, programme, department or semester..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/10"
          />

        </div>
      </div>

      {/* ===================================================
          EMPTY
      ================================================== */}

      {filteredAssignments.length === 0 &&
        !error && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <GraduationCap className="h-8 w-8 text-slate-400" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              {assignments.length === 0
                ? "No courses assigned"
                : "No matching courses"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {assignments.length === 0
                ? "You currently do not have any active lecturer course assignments."
                : "Try another search term."}
            </p>

          </div>
        )}

      {/* ===================================================
          COURSE CARDS
      ================================================== */}

      {filteredAssignments.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {filteredAssignments.map(
            (assignment) => {
              const course =
                getCourse(assignment);

              const semester =
                getSemester(assignment);

              const courseId =
                getCourseId(assignment);

              const semesterId =
                getSemesterId(assignment);

              const hasValidIds =
                Boolean(
                  courseId &&
                    semesterId,
                );

              return (
                <div
                  key={assignment._id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >

                  {/* =====================================
                      CARD HEADER
                  ====================================== */}

                  <div className="relative overflow-hidden bg-brand-navy p-5 text-white">

                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-gold/10" />

                    <div className="relative flex items-start justify-between gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sm font-bold ring-1 ring-white/10">
                        {getInitials(
                          course?.code,
                        )}
                      </div>

                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                        {semester?.name ??
                          "Semester"}
                      </span>

                    </div>

                    <div className="relative mt-5">

                      <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
                        {course?.code ??
                          "Course"}
                      </p>

                      <h2 className="mt-1 line-clamp-2 text-lg font-bold">
                        {course?.title ??
                          "Untitled Course"}
                      </h2>

                    </div>
                  </div>

                  {/* =====================================
                      CARD BODY
                  ====================================== */}

                  <div className="flex flex-1 flex-col p-5">

                    <div className="space-y-3">

                      {/* Programme */}
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Programme
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-700">
                          {getProgrammeName(
                            course,
                          )}
                        </p>
                      </div>

                      {/* Department */}
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Department
                        </p>

                        <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-700">
                          {getDepartmentName(
                            course,
                          )}
                        </p>
                      </div>

                      {/* Level / Credit */}
                      <div className="grid grid-cols-2 gap-3 pt-2">

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[11px] text-slate-400">
                            Credit Units
                          </p>

                          <p className="mt-1 font-bold text-brand-navy">
                            {course?.creditUnits ??
                              "—"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[11px] text-slate-400">
                            Level
                          </p>

                          <p className="mt-1 font-bold text-brand-navy">
                            {course?.level ??
                              "—"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* =================================
                        ACTIONS
                    ================================== */}

                    <div className="mt-6 grid grid-cols-2 gap-2">

                      <Link
                        href={
                          hasValidIds
                            ? `/dashboards/lecturer/results/submitted?course=${encodeURIComponent(
                                courseId,
                              )}&semester=${encodeURIComponent(
                                semesterId,
                              )}`
                            : "#"
                        }
                        aria-disabled={
                          !hasValidIds
                        }
                        onClick={(event) => {
                          if (!hasValidIds) {
                            event.preventDefault();
                          }
                        }}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
                          hasValidIds
                            ? "border-slate-200 bg-white text-brand-navy hover:border-brand-navy hover:bg-slate-50"
                            : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                        }`}
                      >
                        View Submitted

                        <ChevronRight className="h-4 w-4" />
                      </Link>

                      <Link
                        href={
                          hasValidIds
                            ? `/dashboards/lecturer/results/enter?course=${encodeURIComponent(
                                courseId,
                              )}&semester=${encodeURIComponent(
                                semesterId,
                              )}`
                            : "#"
                        }
                        aria-disabled={
                          !hasValidIds
                        }
                        onClick={(event) => {
                          if (!hasValidIds) {
                            event.preventDefault();
                          }
                        }}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
                          hasValidIds
                            ? "bg-brand-navy text-white hover:bg-brand-navy/90"
                            : "cursor-not-allowed bg-slate-200 text-slate-400"
                        }`}
                      >
                        Enter Results

                        <ChevronRight className="h-4 w-4" />
                      </Link>

                    </div>

                  </div>
                </div>
              );
            },
          )}

        </div>
      )}

    </div>
  );
}