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
  BarChart3,
  Bell,
  BookOpen,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  RefreshCw,
  Users,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type Course = {
  _id: string;
  code?: string;
  title?: string;
  creditUnits?: number;
  level?: string | number;
  isActive?: boolean;
};

type Semester = {
  _id: string;
  name?: string;
  order?: number;
};

type Lecturer = {
  _id: string;
  name?: string;
  email?: string;
};

type Student = {
  _id: string;
  name?: string;
  email?: string;
  matricNumber?: string;
  isActive?: boolean;
};

type LecturerAssignment = {
  _id: string;
  lecturer?: Lecturer | string;
  course?: Course | string;
  semester?: Semester | string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AssignmentsResponse = {
  success: boolean;
  assignments?: LecturerAssignment[];
  message?: string;
};

type RosterItem = {
  registrationId: string;
  student: Student | string;
};

type RosterResponse = {
  success: boolean;
  roster?: RosterItem[];
  message?: string;
};

type Result = {
  _id: string;
  student: Student | string;
  course: Course | string;
  semester: Semester | string;
  lecturer: Lecturer | string;
  score?: number;
  grade?: "A" | "B" | "C" | "D" | "E" | "F";
  status?: "draft" | "published";
  createdAt?: string;
  updatedAt?: string;
};

type ResultsResponse = {
  success: boolean;
  results?: Result[];
  message?: string;
};

/* =========================================================
   INTERNAL COURSE DATA
========================================================= */

type LecturerCourseData = {
  assignment: LecturerAssignment;
  roster: RosterItem[];
  results: Result[];
};

/* =========================================================
   HELPERS
========================================================= */

function getId(
  value:
    | Course
    | Semester
    | Lecturer
    | Student
    | string
    | undefined
    | null,
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
  value: Course | string | undefined,
): Course | null {
  if (!value || typeof value === "string") {
    return null;
  }

  return value;
}

function getSemester(
  value: Semester | string | undefined,
): Semester | null {
  if (!value || typeof value === "string") {
    return null;
  }

  return value;
}

function getStudent(
  value: Student | string | undefined,
): Student | null {
  if (!value || typeof value === "string") {
    return null;
  }

  return value;
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
      className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
    />
  );
}

/* =========================================================
   FULL DASHBOARD SKELETON
========================================================= */

function LecturerDashboardSkeleton() {
  return (
    <div className="space-y-8 pb-10">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-[2rem] bg-brand-navy shadow-2xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="w-full max-w-3xl">
              <Skeleton className="h-7 w-36 bg-white/10" />

              <Skeleton className="mt-6 h-10 w-full max-w-xl bg-white/10 sm:h-12" />

              <Skeleton className="mt-4 h-5 w-full max-w-2xl bg-white/10" />

              <Skeleton className="mt-2 h-5 w-4/5 max-w-xl bg-white/10" />

              <div className="mt-6 flex flex-wrap gap-3">
                <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />

                <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />

                <Skeleton className="h-10 w-40 rounded-xl bg-white/10" />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <Skeleton className="h-11 w-36 rounded-xl bg-white/10" />

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4">
                <Skeleton className="h-3 w-24 bg-white/10" />

                <Skeleton className="mt-3 h-5 w-32 bg-white/10" />

                <Skeleton className="mt-3 h-3 w-40 bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-11 w-11 rounded-xl" />

              <Skeleton className="h-4 w-4 rounded-full" />
            </div>

            <Skeleton className="mt-5 h-4 w-28" />

            <Skeleton className="mt-2 h-9 w-16" />

            <Skeleton className="mt-2 h-3 w-40" />
          </div>
        ))}
      </section>

      {/* =====================================================
          MAIN GRID
      ====================================================== */}

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        {/* ===================================================
            COURSES
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <Skeleton className="h-5 w-28" />

              <Skeleton className="mt-2 h-3 w-52" />
            </div>

            <Skeleton className="h-8 w-16" />
          </div>

          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />

                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-40" />

                    <div className="mt-2 flex gap-2">
                      <Skeleton className="h-3 w-16" />

                      <Skeleton className="h-3 w-20" />

                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div>
                    <Skeleton className="ml-auto h-4 w-8" />

                    <Skeleton className="mt-2 ml-auto h-3 w-24" />
                  </div>

                  <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                  <div>
                    <Skeleton className="ml-auto h-4 w-8" />

                    <Skeleton className="mt-2 ml-auto h-3 w-16" />
                  </div>

                  <Skeleton className="h-7 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            QUICK ACTIONS
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5">
            <Skeleton className="h-5 w-28" />

            <Skeleton className="mt-2 h-3 w-52" />
          </div>

          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
              >
                <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />

                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-28" />

                  <Skeleton className="mt-2 h-3 w-44" />
                </div>

                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* =====================================================
          RESULTS + SUMMARY
      ====================================================== */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ===================================================
            RECENT RESULTS
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />

              <div>
                <Skeleton className="h-4 w-32" />

                <Skeleton className="mt-2 h-3 w-48" />
              </div>
            </div>

            <Skeleton className="h-8 w-16" />
          </div>

          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 px-5 py-4 sm:px-6"
              >
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-32" />

                  <div className="mt-2 flex gap-2">
                    <Skeleton className="h-3 w-24" />

                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>

                <div>
                  <Skeleton className="ml-auto h-4 w-8" />

                  <Skeleton className="mt-2 ml-auto h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            ACADEMIC SUMMARY
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />

              <div>
                <Skeleton className="h-4 w-36" />

                <Skeleton className="mt-2 h-3 w-48" />
              </div>
            </div>
          </div>

          <div className="space-y-7 p-5 sm:p-6">
            {[1, 2, 3].map((item) => (
              <div key={item}>
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-36" />

                    <Skeleton className="mt-2 h-3 w-48" />
                  </div>

                  <Skeleton className="h-6 w-10" />
                </div>

                <Skeleton className="mt-3 h-2 w-full rounded-full" />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <Skeleton className="h-3 w-20" />

                <Skeleton className="mt-2 h-7 w-10" />
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <Skeleton className="h-3 w-20" />

                <Skeleton className="mt-2 h-7 w-10" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

                <div className="flex-1">
                  <Skeleton className="h-4 w-48" />

                  <Skeleton className="mt-2 h-3 w-full" />

                  <Skeleton className="mt-2 h-3 w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

            <div>
              <Skeleton className="h-4 w-36" />

              <Skeleton className="mt-2 h-3 w-72 max-w-full" />
            </div>
          </div>

          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  loading = false,
  accent = "navy",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  href: string;
  loading?: boolean;
  accent?: "navy" | "gold" | "blue" | "green";
}) {
  const iconClass = {
    navy: "bg-brand-navy text-brand-gold",
    gold: "bg-brand-gold/10 text-brand-gold",
    blue: "bg-brand-blue/10 text-brand-blue",
    green: "bg-emerald-50 text-emerald-600",
  }[accent];

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-xl"
    >
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-brand-gold/[0.04] transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <ArrowRight className="h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand-gold" />
      </div>

      <div className="relative mt-5">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        {loading ? (
          <Skeleton className="mt-2 h-9 w-16" />
        ) : (
          <p className="mt-1 text-3xl font-bold tracking-tight text-brand-navy">
            {value}
          </p>
        )}

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </Link>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function LecturerDashboardPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  const lecturerName =
    session?.user?.name?.trim() || "Lecturer";

  /* =======================================================
     STATE
  ======================================================== */

  const [assignments, setAssignments] =
    useState<LecturerAssignment[]>([]);

  const [courseData, setCourseData] =
    useState<LecturerCourseData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =========================================================
     LOAD DASHBOARD
  ========================================================== */

  const loadDashboard = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        return;
      }

      try {
        setError(null);

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        /* ===================================================
           STEP 1
        ==================================================== */

        const assignmentsResponse =
          await apiGet<AssignmentsResponse>(
            "/lecturer-assignments/me",
            accessToken,
          );

        if (!assignmentsResponse.success) {
          throw new Error(
            assignmentsResponse.message ||
              "Unable to load your course assignments.",
          );
        }

        const lecturerAssignments =
          assignmentsResponse.assignments ?? [];

        setAssignments(lecturerAssignments);

        /* ===================================================
           STEP 2
        ==================================================== */

        const activeLecturerAssignments =
          lecturerAssignments.filter(
            (assignment) =>
              assignment.isActive !== false,
          );

        const loadedCourseData =
          await Promise.all(
            activeLecturerAssignments.map(
              async (assignment) => {
                const courseId = getId(
                  assignment.course,
                );

                const semesterId = getId(
                  assignment.semester,
                );

                if (!courseId || !semesterId) {
                  return {
                    assignment,
                    roster: [],
                    results: [],
                  };
                }

                const query =
                  `?course=${encodeURIComponent(
                    courseId,
                  )}` +
                  `&semester=${encodeURIComponent(
                    semesterId,
                  )}`;

                const [
                  rosterResponse,
                  resultsResponse,
                ] = await Promise.all([
                  apiGet<RosterResponse>(
                    `/registrations/roster${query}`,
                    accessToken,
                  ),

                  apiGet<ResultsResponse>(
                    `/results/course${query}`,
                    accessToken,
                  ),
                ]);

                if (!rosterResponse.success) {
                  throw new Error(
                    rosterResponse.message ||
                      `Unable to load students for ${
                        getCourse(
                          assignment.course,
                        )?.code || "course"
                      }.`,
                  );
                }

                if (!resultsResponse.success) {
                  throw new Error(
                    resultsResponse.message ||
                      `Unable to load results for ${
                        getCourse(
                          assignment.course,
                        )?.code || "course"
                      }.`,
                  );
                }

                return {
                  assignment,
                  roster:
                    rosterResponse.roster ?? [],
                  results:
                    resultsResponse.results ?? [],
                };
              },
            ),
          );

        setCourseData(loadedCourseData);
      } catch (error) {
        console.error(
          "Lecturer dashboard error:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load lecturer dashboard.";

        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      accessToken
    ) {
      void loadDashboard();
    }
  }, [
    sessionStatus,
    accessToken,
    loadDashboard,
  ]);

  /* =========================================================
     ACTIVE ASSIGNMENTS
  ========================================================== */

  const activeAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.isActive !== false,
      ),
    [assignments],
  );

  /* =========================================================
     TOTAL STUDENTS
  ========================================================== */

  const totalStudents = useMemo(() => {
    const ids = new Set<string>();

    courseData.forEach(({ roster }) => {
      roster.forEach((item) => {
        const id = getId(item.student);

        if (id) {
          ids.add(id);
        }
      });
    });

    return ids.size;
  }, [courseData]);

  /* =========================================================
     ALL RESULTS
  ========================================================== */

  const lecturerResults = useMemo(
    () =>
      courseData.flatMap(
        ({ results }) => results,
      ),
    [courseData],
  );

  /* =========================================================
     RESULT COUNTS
  ========================================================== */

  const pendingResults = useMemo(
    () =>
      lecturerResults.filter(
        (result) =>
          result.status === "draft",
      ).length,
    [lecturerResults],
  );

  const publishedResults = useMemo(
    () =>
      lecturerResults.filter(
        (result) =>
          result.status === "published",
      ).length,
    [lecturerResults],
  );

  /* =========================================================
     COURSE LIST
  ========================================================== */

  const courseList = useMemo(
    () =>
      activeAssignments
        .map((assignment) => {
          const course = getCourse(
            assignment.course,
          );

          const semester = getSemester(
            assignment.semester,
          );

          const data = courseData.find(
            (item) =>
              item.assignment._id ===
              assignment._id,
          );

          return {
            id: assignment._id,

            courseId: getId(
              assignment.course,
            ),

            code: course?.code || "—",

            title:
              course?.title ||
              "Assigned Course",

            creditUnits:
              course?.creditUnits ?? 0,

            level: course?.level ?? "—",

            semester:
              semester?.name || "—",

            students:
              data?.roster.length ?? 0,

            results:
              data?.results.length ?? 0,
          };
        })
        .slice(0, 6),
    [
      activeAssignments,
      courseData,
    ],
  );

  /* =========================================================
     RECENT RESULTS
  ========================================================== */

  const recentResults = useMemo(
    () =>
      [...lecturerResults]
        .sort((a, b) => {
          const aDate = a.updatedAt
            ? new Date(
                a.updatedAt,
              ).getTime()
            : 0;

          const bDate = b.updatedAt
            ? new Date(
                b.updatedAt,
              ).getTime()
            : 0;

          return bDate - aDate;
        })
        .slice(0, 6),
    [lecturerResults],
  );

  /* =========================================================
     ACTIVE SEMESTER
  ========================================================== */

  const activeSemester = useMemo(() => {
    const activeAssignment =
      activeAssignments.find(
        (assignment) =>
          assignment.semester,
      );

    return getSemester(
      activeAssignment?.semester,
    );
  }, [activeAssignments]);

  /* =========================================================
     PUBLISHED PERCENTAGE
  ========================================================== */

  const publishedPercentage =
    useMemo(() => {
      if (lecturerResults.length === 0) {
        return 0;
      }

      return Math.round(
        (publishedResults /
          lecturerResults.length) *
          100,
      );
    }, [
      lecturerResults.length,
      publishedResults,
    ]);

  /* =========================================================
     AUTH LOADING
  ========================================================== */

  if (sessionStatus === "loading") {
    return <LecturerDashboardSkeleton />;
  }

  /* =========================================================
     UNAUTHENTICATED
  ========================================================== */

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <GraduationCap className="h-6 w-6 text-red-600" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-brand-navy">
            Authentication Required
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your lecturer session could not
            be verified. Please sign in again
            to access the Lecturer Portal.
          </p>

          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
          >
            Go to Login

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================
     INITIAL API LOADING
  ========================================================== */

  if (loading && !refreshing) {
    return <LecturerDashboardSkeleton />;
  }

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-8 pb-10">
      {/* =====================================================
          PREMIUM HERO
      ====================================================== */}

      <section className="relative isolate overflow-hidden rounded-[2rem] bg-brand-navy shadow-2xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                <GraduationCap className="h-3.5 w-3.5" />

                Lecturer Portal
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Welcome back,{" "}
                <span className="text-brand-gold">
                  {lecturerName}
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Your academic workspace for managing
                assigned courses, registered students,
                assessments and results.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-xs font-medium text-slate-200 backdrop-blur-sm">
                  <BookOpen className="h-4 w-4 text-brand-gold" />

                  {activeAssignments.length} active{" "}
                  {activeAssignments.length === 1
                    ? "course"
                    : "courses"}
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-xs font-medium text-slate-200 backdrop-blur-sm">
                  <Users className="h-4 w-4 text-brand-gold" />

                  {totalStudents} students
                </div>

                {activeSemester && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-xs font-medium text-slate-200 backdrop-blur-sm">
                    <CalendarCheck2 className="h-4 w-4 text-brand-gold" />

                    {activeSemester.name}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col xl:items-stretch">
              <button
                type="button"
                onClick={() =>
                  void loadDashboard(true)
                }
                disabled={
                  refreshing ||
                  !accessToken
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-60"
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
                  : "Refresh Data"}
              </button>

              <div className="rounded-2xl border border-brand-gold/20 bg-white/[0.06] px-5 py-4 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Teaching Period
                </p>

                <p className="mt-1.5 font-semibold text-white">
                  {activeSemester?.name ||
                    "Current Semester"}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-xs text-emerald-300">
                    Academic workspace active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <Bell className="h-4 w-4 text-red-600" />
              </div>

              <div>
                <p className="text-sm font-bold text-red-700">
                  Dashboard data could not be fully loaded
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadDashboard(true)
              }
              disabled={
                refreshing ||
                !accessToken
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Retry
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Assigned Courses"
          value={activeAssignments.length}
          description="Active courses currently assigned"
          icon={BookOpen}
          href="/dashboards/lecturer/courses"
          loading={false}
          accent="navy"
        />

        <StatCard
          title="My Students"
          value={totalStudents}
          description="Students registered in your courses"
          icon={Users}
          href="/dashboards/lecturer/students"
          loading={false}
          accent="blue"
        />

        <StatCard
          title="Pending Results"
          value={pendingResults}
          description="Draft scores requiring attention"
          icon={ClipboardCheck}
          href="/dashboards/lecturer/results"
          loading={false}
          accent="gold"
        />

        <StatCard
          title="Published Results"
          value={publishedResults}
          description="Results already published"
          icon={CheckCircle2}
          href="/dashboards/lecturer/results/submitted"
          loading={false}
          accent="green"
        />
      </section>

      {/* =====================================================
          MAIN GRID
      ====================================================== */}

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        {/* ===================================================
            MY COURSES
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-brand-navy">
                  My Courses
                </h2>

                <span className="rounded-full bg-brand-navy/5 px-2 py-0.5 text-[10px] font-bold text-brand-navy">
                  {activeAssignments.length}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Your active teaching assignments
              </p>
            </div>

            <Link
              href="/dashboards/lecturer/courses"
              className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-gold/10 hover:text-brand-gold"
            >
              View all

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {courseList.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <BookOpen className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="mt-5 font-bold text-brand-navy">
                No courses assigned
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                You currently have no active course
                assignments. Assigned courses will appear
                here once they are added.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {courseList.map((course) => (
                <Link
                  key={course.id}
                  href={`/dashboards/lecturer/courses?course=${encodeURIComponent(
                    course.courseId,
                  )}`}
                  className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-navy text-[10px] font-bold text-brand-gold shadow-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

                      <span className="relative">
                        {course.code
                          .split(/\s+/)
                          .slice(0, 2)
                          .join(" ")
                          .slice(0, 8)}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-brand-navy transition group-hover:text-brand-gold">
                        {course.title}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="font-medium text-slate-500">
                          {course.code}
                        </span>

                        <span className="text-slate-300">
                          •
                        </span>

                        <span>
                          {course.semester}
                        </span>

                        {course.creditUnits > 0 && (
                          <>
                            <span className="text-slate-300">
                              •
                            </span>

                            <span>
                              {course.creditUnits}{" "}
                              Credit Unit
                              {course.creditUnits !==
                              1
                                ? "s"
                                : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-brand-navy">
                        {course.students}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        Registered students
                      </p>
                    </div>

                    <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-brand-navy">
                        {course.results}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        Results
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-600">
                      Active
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ===================================================
            QUICK ACTIONS
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5">
            <h2 className="font-bold text-brand-navy">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your most frequently used tools
            </p>
          </div>

          <div className="space-y-3 p-5">
            {[
              {
                href: "/dashboards/lecturer/results",
                icon: BookOpenCheck,
                title: "Enter Results",
                description:
                  "Enter and submit student scores",
              },
              {
                href: "/dashboards/lecturer/students",
                icon: Users,
                title: "View Students",
                description:
                  "View students registered for your courses",
              },
              {
                href: "/dashboards/lecturer/attendance",
                icon: CalendarCheck2,
                title: "Attendance",
                description:
                  "Manage attendance for your classes",
              },
              {
                href: "/dashboards/lecturer/reports",
                icon: BarChart3,
                title: "Academic Reports",
                description:
                  "Review academic performance",
              },
            ].map(
              ({
                href,
                icon: Icon,
                title,
                description,
              }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:border-brand-gold/40 hover:bg-brand-gold/[0.03] hover:shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-brand-navy">
                      {title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {description}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-gold" />
                </Link>
              ),
            )}
          </div>
        </section>
      </div>

      {/* =====================================================
          RESULTS + ACADEMIC SUMMARY
      ====================================================== */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ===================================================
            RECENT RESULTS
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-brand-navy">
                  Recent Results
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest activity across your courses
                </p>
              </div>
            </div>

            <Link
              href="/dashboards/lecturer/results"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-gold/10 hover:text-brand-gold"
            >
              Manage

              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentResults.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <BookOpenCheck className="h-5 w-5 text-slate-400" />
              </div>

              <p className="mt-4 text-sm font-semibold text-brand-navy">
                No result records yet
              </p>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                Results entered for your assigned courses
                will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentResults.map((result) => {
                const student = getStudent(
                  result.student,
                );

                const course = getCourse(
                  result.course,
                );

                return (
                  <div
                    key={result._id}
                    className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold">
                      {student?.name
                        ?.charAt(0)
                        .toUpperCase() || "S"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-navy">
                        {student?.name || "Student"}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <span>
                          {student?.matricNumber ||
                            "No matric number"}
                        </span>

                        <span>•</span>

                        <span>
                          {course?.code || "Course"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-navy">
                        {result.score ?? "—"}
                      </p>

                      <div className="mt-0.5 flex items-center justify-end gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            result.status ===
                            "published"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />

                        <span
                          className={`text-[11px] font-semibold ${
                            result.status ===
                            "published"
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {result.status ===
                          "published"
                            ? "Published"
                            : "Draft"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ===================================================
            ACADEMIC SUMMARY
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-brand-navy">
                  Academic Summary
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Overview of your current workload
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            {/* Courses */}

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Course assignments
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Active teaching assignments
                  </p>
                </div>

                <span className="text-lg font-bold text-brand-navy">
                  {activeAssignments.length}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-gold transition-all duration-500"
                  style={{
                    width:
                      activeAssignments.length >
                      0
                        ? "100%"
                        : "0%",
                  }}
                />
              </div>
            </div>

            {/* Students */}

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Registered students
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Unique students across your courses
                  </p>
                </div>

                <span className="text-lg font-bold text-brand-navy">
                  {totalStudents}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-blue transition-all duration-500"
                  style={{
                    width:
                      totalStudents > 0
                        ? "100%"
                        : "0%",
                  }}
                />
              </div>
            </div>

            {/* Results */}

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Results published
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Published versus total submitted
                  </p>
                </div>

                <span className="text-lg font-bold text-brand-navy">
                  {publishedPercentage}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${publishedPercentage}%`,
                  }}
                />
              </div>
            </div>

            {/* Result Breakdown */}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                <p className="text-xs font-medium text-amber-700">
                  Draft Results
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-800">
                  {pendingResults}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs font-medium text-emerald-700">
                  Published
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-800">
                  {publishedResults}
                </p>
              </div>
            </div>

            {/* Insight */}

            <div className="rounded-2xl border border-brand-gold/20 bg-gradient-to-br from-brand-gold/[0.08] to-transparent p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gold/15">
                  <CheckCircle2 className="h-4 w-4 text-brand-gold" />
                </div>

                <div>
                  <p className="text-sm font-bold text-brand-navy">
                    Keep your academic records current
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Review draft results and registered
                    students regularly to keep your
                    academic responsibilities up to date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          FOOTER STATUS
      ====================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-brand-gold/20 bg-brand-gold/[0.05] p-5 shadow-sm sm:p-6">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-gold/10 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold text-brand-navy">
                Lecturer Workspace
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Your dashboard is securely connected to
                your assigned academic courses and
                student records.
              </p>
            </div>
          </div>

          <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:self-auto">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

            Workspace Active
          </div>
        </div>
      </section>
    </div>
  );
}