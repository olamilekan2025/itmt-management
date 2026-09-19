"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

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
  code?: string;
  title?: string;
  creditUnits?: number;
  level?: string | number;
  programme?: Programme | string | null;
  department?: Department | string | null;
}

interface Semester {
  _id: string;
  name?: string;
  order?: number;
}

interface LecturerAssignment {
  _id: string;
  isActive?: boolean;

  course: Course | string;

  semester: Semester | string;
}

interface Student {
  _id: string;
  name?: string;
  email?: string;
  matricNumber?: string;
}

interface Result {
  _id: string;

  student: Student | string;

  course: Course | string;

  semester: Semester | string;

  score: number;

  grade?: string;

  status?: "draft" | "published";

  createdAt?: string;

  updatedAt?: string;
}

interface AssignmentsResponse {
  success: boolean;
  assignments: LecturerAssignment[];
  message?: string;
}

interface ResultsResponse {
  success: boolean;
  results: Result[];
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getCourse(
  course: Course | string,
): Course | null {
  if (
    typeof course === "object" &&
    course !== null
  ) {
    return course;
  }

  return null;
}

function getSemester(
  semester: Semester | string,
): Semester | null {
  if (
    typeof semester === "object" &&
    semester !== null
  ) {
    return semester;
  }

  return null;
}

function getStudent(
  student: Student | string,
): Student | null {
  if (
    typeof student === "object" &&
    student !== null
  ) {
    return student;
  }

  return null;
}

function getId(
  value: unknown,
): string {
  if (typeof value === "string") {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "_id" in value
  ) {
    const objectWithId =
      value as {
        _id?: unknown;
      };

    return objectWithId._id
      ? String(objectWithId._id)
      : "";
  }

  return "";
}

function getGrade(
  score: number,
): string {
  if (score >= 70) {
    return "A";
  }

  if (score >= 60) {
    return "B";
  }

  if (score >= 50) {
    return "C";
  }

  if (score >= 45) {
    return "D";
  }

  if (score >= 40) {
    return "E";
  }

  return "F";
}

function getGradeClass(
  grade: string,
): string {
  switch (grade) {
    case "A":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "B":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "C":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "D":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "E":
      return "bg-orange-50 text-orange-700 border-orange-200";

    default:
      return "bg-red-50 text-red-700 border-red-200";
  }
}

function getStatusClass(
  status?: string,
): string {
  if (status === "published") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
}

function getProgrammeName(
  course: Course | null,
): string {
  if (!course?.programme) {
    return "Programme not assigned";
  }

  if (
    typeof course.programme === "string"
  ) {
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

  if (
    typeof course.department === "string"
  ) {
    return course.department;
  }

  return (
    course.department.name ??
    "Department not assigned"
  );
}

/* =========================================================
   BRAND NAVY HERO
   ---------------------------------------------------------
   Shared premium header used in both the course-selection
   view and the results view, matching the hero pattern used
   elsewhere in the dashboard (gradient blur accents + subtle
   grid texture on a brand-navy background).
========================================================= */

function BrandHero({
  eyebrow,
  title,
  description,
  icon,
  backHref,
  backLabel,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl bg-brand-navy px-5 py-5 shadow-lg shadow-brand-navy/10 sm:px-6 sm:py-6"
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand-blue/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-1/3 h-48 w-48 rounded-full bg-brand-gold/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="relative">
        {backHref && (
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel ?? "Back"}
          </Link>
        )}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-brand-gold shadow-inner backdrop-blur-sm sm:h-14 sm:w-14">
              {icon}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold sm:text-[11px]">
                  {eyebrow}
                </p>
              </div>

              <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
              </h1>

              <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
                {description}
              </p>
            </div>
          </div>

          {actions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              {actions}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function SubmittedResultsSkeleton() {
  return (
    <div className="min-h-full bg-[#F6F8FB] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80"
              />
            ),
          )}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80" />
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function SubmittedResultsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const searchParams =
    useSearchParams();

  const selectedCourseId =
    searchParams.get("course") ?? "";

  const selectedSemesterId =
    searchParams.get("semester") ?? "";

  const [
    assignments,
    setAssignments,
  ] = useState<
    LecturerAssignment[]
  >([]);

  const [
    results,
    setResults,
  ] = useState<Result[]>([]);

  const [
    loadingAssignments,
    setLoadingAssignments,
  ] = useState(true);

  const [
    loadingResults,
    setLoadingResults,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedAssignment,
    setSelectedAssignment,
  ] = useState<LecturerAssignment | null>(
    null,
  );

  /* =======================================================
     LOAD ASSIGNMENTS
  ======================================================= */

  const loadAssignments =
    useCallback(async () => {
      if (
        sessionStatus !==
          "authenticated" ||
        !session?.accessToken
      ) {
        return;
      }

      try {
        setLoadingAssignments(true);
        setError("");

        const response =
          (await apiGet(
            "/lecturer-assignments/me",
            session.accessToken,
          )) as AssignmentsResponse;

        if (!response?.success) {
          throw new Error(
            response?.message ??
              "Unable to load your assigned courses.",
          );
        }

        const activeAssignments =
          (
            response.assignments ??
            []
          ).filter(
            (
              assignment,
            ) =>
              assignment.isActive !==
              false,
          );

        setAssignments(
          activeAssignments,
        );
      } catch (err) {
        console.error(
          "Failed to load lecturer assignments:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your assigned courses.",
        );

        setAssignments([]);
      } finally {
        setLoadingAssignments(false);
      }
    }, [
      session?.accessToken,
      sessionStatus,
    ]);

  /* =======================================================
     INITIAL ASSIGNMENTS LOAD
  ======================================================= */

  useEffect(() => {
    if (
      sessionStatus ===
      "authenticated"
    ) {
      void loadAssignments();
    }
  }, [
    sessionStatus,
    loadAssignments,
  ]);

  /* =======================================================
     FIND SELECTED ASSIGNMENT
  ======================================================= */

  useEffect(() => {
    if (
      !selectedCourseId ||
      !selectedSemesterId
    ) {
      setSelectedAssignment(null);
      return;
    }

    const assignment =
      assignments.find(
        (item) =>
          getId(item.course) ===
            selectedCourseId &&
          getId(item.semester) ===
            selectedSemesterId,
      );

    setSelectedAssignment(
      assignment ?? null,
    );
  }, [
    assignments,
    selectedCourseId,
    selectedSemesterId,
  ]);

  /* =======================================================
     LOAD SUBMITTED RESULTS
  ======================================================= */

  const loadResults =
    useCallback(async () => {
      if (
        sessionStatus !==
          "authenticated" ||
        !session?.accessToken ||
        !selectedCourseId ||
        !selectedSemesterId
      ) {
        return;
      }

      try {
        setLoadingResults(true);
        setError("");

        const response =
          (await apiGet(
            `/results/course?course=${encodeURIComponent(
              selectedCourseId,
            )}&semester=${encodeURIComponent(
              selectedSemesterId,
            )}`,
            session.accessToken,
          )) as ResultsResponse;

        if (!response?.success) {
          throw new Error(
            response?.message ??
              "Unable to load submitted results.",
          );
        }

        setResults(
          Array.isArray(
            response.results,
          )
            ? response.results
            : [],
        );
      } catch (err) {
        console.error(
          "Failed to load submitted results:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load submitted results.",
        );

        setResults([]);
      } finally {
        setLoadingResults(false);
      }
    }, [
      selectedCourseId,
      selectedSemesterId,
      session?.accessToken,
      sessionStatus,
    ]);

  /* =======================================================
     RESULTS EFFECT
  ======================================================= */

  useEffect(() => {
    if (
      selectedCourseId &&
      selectedSemesterId &&
      selectedAssignment
    ) {
      void loadResults();
    } else if (
      !selectedCourseId ||
      !selectedSemesterId
    ) {
      setResults([]);
    }
  }, [
    selectedCourseId,
    selectedSemesterId,
    selectedAssignment,
    loadResults,
  ]);

  /* =======================================================
     FILTER RESULTS
  ======================================================= */

  const filteredResults =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return results;
      }

      return results.filter(
        (result) => {
          const student =
            getStudent(
              result.student,
            );

          const grade =
            result.grade ??
            getGrade(
              Number(result.score),
            );

          return (
            student?.name
              ?.toLowerCase()
              .includes(query) ||
            student?.email
              ?.toLowerCase()
              .includes(query) ||
            student?.matricNumber
              ?.toLowerCase()
              .includes(query) ||
            String(
              result.score,
            ).includes(query) ||
            grade
              .toLowerCase()
              .includes(query)
          );
        },
      );
    }, [results, search]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics =
    useMemo(() => {
      const total =
        results.length;

      const published =
        results.filter(
          (result) =>
            result.status ===
            "published",
        ).length;

      const draft =
        results.filter(
          (result) =>
            result.status !==
            "published",
        ).length;

      const average =
        total > 0
          ? results.reduce(
              (
                sum,
                result,
              ) =>
                sum +
                Number(
                  result.score || 0,
                ),
              0,
            ) / total
          : 0;

      const passed =
        results.filter(
          (result) =>
            Number(
              result.score,
            ) >= 40,
        ).length;

      return {
        total,
        published,
        draft,
        average,
        passed,
      };
    }, [results]);

  /* =======================================================
     AUTH / INITIAL LOADING
  ======================================================= */

  if (
    sessionStatus === "loading" ||
    loadingAssignments
  ) {
    return (
      <SubmittedResultsSkeleton />
    );
  }

  /* =======================================================
     AUTHENTICATION ERROR
  ======================================================= */

  if (
    sessionStatus ===
    "unauthenticated"
  ) {
    return (
      <div className="min-h-full bg-[#F6F8FB] p-4 sm:p-6">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <FileText className="h-7 w-7 text-red-600" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-red-900">
            Authentication Required
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-700">
            Please sign in again to
            view your submitted
            results.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     COURSE SELECTION
  ======================================================= */

  if (
    !selectedCourseId ||
    !selectedSemesterId
  ) {
    return (
      <div className="min-h-full bg-[#F6F8FB]">
        <div className="mx-auto w-full max-w-[1600px] space-y-6 py-4 sm:py-6 lg:py-8">

          {/* PAGE HERO */}
          <BrandHero
            eyebrow="Lecturer Portal"
            title="Submitted Results"
            description="Select a course and semester to review the results you've submitted for grading."
            icon={<ClipboardCheck className="h-6 w-6 sm:h-7 sm:w-7" />}
            actions={
              <button
                type="button"
                onClick={() => void loadAssignments()}
                disabled={loadingAssignments}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-bold text-brand-navy shadow-md shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <RefreshCw
                  className={`h-4 w-4 transition-transform duration-300 ${
                    loadingAssignments ? "animate-spin" : "group-hover:rotate-45"
                  }`}
                />
                Refresh
              </button>
            }
          />

          {/* ERROR */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                    <FileText className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadAssignments()}
                  className="text-sm font-bold text-red-800 underline underline-offset-4"
                >
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* EMPTY */}
          {assignments.length === 0 ? (
            <div className="rounded-2xl border-0 bg-white p-10 text-center shadow-sm ring-1 ring-slate-200/80">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                <BookOpen className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-800">
                No assigned courses
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You currently do not have
                any active course
                assignments.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {assignments.map(
                (assignment, index) => {
                  const course =
                    getCourse(
                      assignment.course,
                    );

                  const semester =
                    getSemester(
                      assignment.semester,
                    );

                  const courseId =
                    getId(
                      assignment.course,
                    );

                  const semesterId =
                    getId(
                      assignment.semester,
                    );

                  return (
                    <motion.div
                      key={assignment._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                    >
                      <Link
                        href={`/dashboards/lecturer/results/submitted?course=${encodeURIComponent(
                          courseId,
                        )}&semester=${encodeURIComponent(
                          semesterId,
                        )}`}
                        className="group block h-full"
                      >
                        <div className="relative h-full overflow-hidden rounded-2xl border-0 bg-white p-5 shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
                          <div className="absolute inset-x-0 top-0 h-1 bg-brand-navy transition-all duration-300 group-hover:h-1.5" />

                          <div className="flex items-start justify-between gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold shadow-md shadow-brand-navy/15 transition-transform duration-300 group-hover:scale-105">
                              <BookOpen className="h-6 w-6" />
                            </div>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                              {semester?.name ?? "Semester"}
                            </span>
                          </div>

                          <div className="mt-5">
                            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-gold">
                              {course?.code ?? "COURSE"}
                            </p>

                            <h2 className="mt-1.5 line-clamp-2 text-lg font-bold text-slate-900">
                              {course?.title ?? "Course"}
                            </h2>

                            <div className="mt-4 space-y-2">
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <GraduationCap className="h-4 w-4 text-slate-400" />
                                <span>{course?.creditUnits ?? 0} Credit Units</span>
                              </div>

                              {course?.level && (
                                <p className="text-sm text-slate-500">
                                  Level {course.level}
                                </p>
                              )}

                              <p className="text-xs text-slate-400">
                                {getProgrammeName(course)}
                              </p>

                              <p className="text-xs text-slate-400">
                                {getDepartmentName(course)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                            <span className="text-sm font-semibold text-slate-600">
                              View submitted results
                            </span>

                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-400 transition-all group-hover:border-brand-navy/10 group-hover:bg-brand-navy group-hover:text-white">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =======================================================
     SELECTED COURSE
  ======================================================= */

  const course =
    selectedAssignment
      ? getCourse(
          selectedAssignment.course,
        )
      : null;

  const semester =
    selectedAssignment
      ? getSemester(
          selectedAssignment.semester,
        )
      : null;

  /* =======================================================
     SELECTED COURSE NOT FOUND
  ======================================================= */

  if (!selectedAssignment) {
    return (
      <div className="min-h-full bg-[#F6F8FB] p-4 sm:p-6">
        <div className="mx-auto max-w-xl rounded-3xl border border-amber-100 bg-amber-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <FileText className="h-7 w-7 text-amber-500" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-amber-900">
            Course Assignment Not Found
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            This course and semester are
            not among your active lecturer
            assignments.
          </p>

          <Link
            href="/dashboards/lecturer/results/submitted"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN RESULTS PAGE
  ======================================================= */

  return (
    <div className="min-h-full bg-[#F6F8FB]">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 py-4 sm:py-6 lg:py-8">

        {/* =================================================
            HERO
        ================================================= */}

        <BrandHero
          eyebrow={course?.code ?? "Course"}
          title={course?.title ?? "Submitted Results"}
          description={`${semester?.name ?? "Semester"} · Submitted results for this course.`}
          icon={<FileText className="h-6 w-6 sm:h-7 sm:w-7" />}
          backHref="/dashboards/lecturer/results/submitted"
          backLabel="Back to courses"
          actions={
            <>
              <Link
                href={`/dashboards/lecturer/results/enter?course=${encodeURIComponent(
                  selectedCourseId,
                )}&semester=${encodeURIComponent(
                  selectedSemesterId,
                )}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-brand-gold px-4 py-2.5 text-sm font-bold text-brand-navy shadow-md shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold/90 hover:shadow-lg"
              >
                <ClipboardCheck className="h-4 w-4" />
                Enter / Edit Results
              </Link>

              <button
                type="button"
                onClick={() => void loadResults()}
                disabled={loadingResults}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-bold text-brand-navy shadow-md shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <RefreshCw
                  className={`h-4 w-4 transition-transform duration-300 ${
                    loadingResults ? "animate-spin" : "group-hover:rotate-45"
                  }`}
                />
                {loadingResults ? "Refreshing..." : "Refresh"}
              </button>
            </>
          }
        />

        {/* =================================================
            ERROR
        ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                  <FileText className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>

              <button
                type="button"
                onClick={() => void loadResults()}
                className="text-sm font-bold text-red-800 underline underline-offset-4"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                key: "total",
                label: "Total Submitted",
                description: "Results recorded for this course",
                value: statistics.total,
                icon: Users,
              },
              {
                key: "published",
                label: "Published",
                description: "Visible to students",
                value: statistics.published,
                icon: CheckCircle2,
              },
              {
                key: "draft",
                label: "Draft",
                description: "Awaiting publication",
                value: statistics.draft,
                icon: FileText,
              },
              {
                key: "average",
                label: "Class Average",
                description: "Mean score across all results",
                value: statistics.average.toFixed(1),
                icon: GraduationCap,
              },
            ].map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                >
                  <div className="relative overflow-hidden rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
                    <div className="absolute inset-x-0 top-0 h-1 bg-brand-navy transition-all duration-300 hover:h-1.5" />
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold shadow-md shadow-brand-navy/15 transition-transform duration-300 hover:scale-105">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:border-brand-navy/10 hover:bg-brand-navy hover:text-white">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-6">
                        <p className="text-[34px] font-extrabold leading-none tracking-tight text-slate-950">
                          {card.value}
                        </p>
                        <p className="mt-3 text-sm font-bold text-slate-900">{card.label}</p>
                        <p className="mt-1.5 text-xs leading-5 text-slate-500">{card.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* =================================================
            RESULTS TABLE
        ================================================= */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <div className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200/80">

            {/* HEADER */}
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Student Results
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review all results submitted
                  for this course and semester.
                </p>
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search student or matric number..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-brand-navy/30 focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
                />
              </div>
            </div>

            {/* LOADING */}
            {loadingResults ? (
              <div className="flex min-h-80 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-xl shadow-brand-navy/20">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
                  </div>
                  <p className="mt-5 text-sm font-semibold text-slate-800">
                    Loading submitted results
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Just a moment...
                  </p>
                </div>
              </div>
            ) : filteredResults.length ===
              0 ? (
              /* EMPTY */
              <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                  <FileText className="h-8 w-8" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-800">
                  No submitted results
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {search
                    ? "No results match your search."
                    : "No student results have been submitted for this course and semester yet."}
                </p>

                {!search && (
                  <Link
                    href={`/dashboards/lecturer/results/enter?course=${encodeURIComponent(
                      selectedCourseId,
                    )}&semester=${encodeURIComponent(
                      selectedSemesterId,
                    )}`}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    Enter Results
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* ==========================================
                    DESKTOP TABLE
                ========================================== */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Matric Number</th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4">Grade</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredResults.map(
                        (result, index) => {
                          const student =
                            getStudent(
                              result.student,
                            );

                          const grade =
                            result.grade ??
                            getGrade(
                              Number(
                                result.score,
                              ),
                            );

                          return (
                            <motion.tr
                              key={result._id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.4) }}
                              className="group transition-colors hover:bg-slate-50/70"
                            >
                              {/* STUDENT */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold ring-2 ring-slate-100">
                                    {student?.name
                                      ?.charAt(0)
                                      .toUpperCase() ?? "S"}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-slate-900">
                                      {student?.name ?? "Unknown Student"}
                                    </p>

                                    <p className="truncate text-xs text-slate-500">
                                      {student?.email ?? "—"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* MATRIC */}
                              <td className="px-6 py-4">
                                {student?.matricNumber ? (
                                  <span className="font-mono text-xs font-semibold text-brand-navy">
                                    {student.matricNumber}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </td>

                              {/* SCORE */}
                              <td className="px-6 py-4">
                                <span className="font-bold text-brand-navy">
                                  {Number(result.score).toFixed(0)}
                                </span>
                                <span className="text-sm text-slate-400">/100</span>
                              </td>

                              {/* GRADE */}
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex rounded-lg border px-3 py-1 text-xs font-bold ${getGradeClass(
                                    grade,
                                  )}`}
                                >
                                  {grade}
                                </span>
                              </td>

                              {/* STATUS */}
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                                    result.status,
                                  )}`}
                                >
                                  {result.status ?? "draft"}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ==========================================
                    MOBILE
                ========================================== */}

                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredResults.map(
                    (result) => {
                      const student =
                        getStudent(
                          result.student,
                        );

                      const grade =
                        result.grade ??
                        getGrade(
                          Number(
                            result.score,
                          ),
                        );

                      return (
                        <div
                          key={
                            result._id
                          }
                          className="p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold ring-2 ring-slate-100">
                                {student?.name
                                  ?.charAt(0)
                                  .toUpperCase() ?? "S"}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                  {student?.name ?? "Unknown Student"}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {student?.matricNumber ?? "No matric number"}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-lg border px-3 py-1 text-xs font-bold ${getGradeClass(
                                grade,
                              )}`}
                            >
                              {grade}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-xs text-slate-500">
                                Score
                              </p>

                              <p className="mt-1 font-bold text-brand-navy">
                                {Number(
                                  result.score,
                                ).toFixed(
                                  0,
                                )}
                                /100
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-xs text-slate-500">
                                Status
                              </p>

                              <span
                                className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
                                  result.status,
                                )}`}
                              >
                                {result.status ??
                                  "draft"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </>
            )}

            {/* =================================================
                FOOTER
            ================================================= */}

            {!loadingResults &&
              filteredResults.length >
                0 && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                  <div className="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      Showing{" "}
                      <strong className="text-slate-700">
                        {
                          filteredResults.length
                        }
                      </strong>{" "}
                      of{" "}
                      <strong className="text-slate-700">
                        {results.length}
                      </strong>{" "}
                      results
                    </span>

                    <span>
                      Pass rate:{" "}
                      <strong className="text-slate-700">
                        {statistics.total >
                        0
                          ? (
                              (statistics.passed /
                                statistics.total) *
                              100
                            ).toFixed(
                              1,
                            )
                          : "0.0"}
                        %
                      </strong>
                    </span>
                  </div>
                </div>
              )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}