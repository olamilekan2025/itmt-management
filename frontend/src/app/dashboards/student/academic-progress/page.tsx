"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  TrendingUp,
  Trophy,
  UserRound,
  XCircle,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type Grade =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F";

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  matricNumber: string | null;
  level: string | null;
}

interface ProgrammeInfo {
  id: string;
  name: string;
  code: string;
  award: string | null;
  durationYears: number | null;
}

interface AcademicSessionInfo {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface CourseResult {
  id: string;
  code: string;
  title: string;
  creditUnits: number;
  score: number;
  grade: Grade;
  gradePoint: number;
}

interface SemesterProgress {
  id: string;
  sequence: number;
  semester: string;
  semesterOrder: number;
  academicSession: string | null;
  sessionId: string | null;
  sessionStartDate: string | null;
  sessionEndDate: string | null;
  gpa: number;
  creditUnits: number;
  courses: number;
  passed: number;
  failed: number;
  averageScore: number;
  grades: Record<Grade, number>;
  courseResults: CourseResult[];
}

interface ProgressSummary {
  cgpa: number;
  totalCredits: number;
  coursesCompleted: number;
  coursesPassed: number;
  coursesFailed: number;
  averageScore: number;
  totalSemesters: number;
}

interface AcademicProgress {
  student: StudentInfo;
  programme: ProgrammeInfo | null;
  currentAcademicSession:
    | AcademicSessionInfo
    | null;
  summary: ProgressSummary;
  gradeDistribution: Record<Grade, number>;
  semesters: SemesterProgress[];
}

interface AcademicProgressResponse {
  success: boolean;
  progress: AcademicProgress;
  message?: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const GRADE_ORDER: Grade[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

const GRADE_POINTS: Record<
  Grade,
  number
> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

/* =========================================================
   HELPERS
========================================================= */

function getInitials(
  name: string,
): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase(),
      )
      .join("") || "ST"
  );
}

function formatScore(
  score: number,
): string {
  return `${Number(score).toFixed(1)}%`;
}

function getGradeClasses(
  grade: Grade,
): string {
  switch (grade) {
    case "A":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "B":
      return "border-sky-200 bg-sky-50 text-sky-700";

    case "C":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "D":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "E":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "F":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getGpaLabel(
  gpa: number,
): string {
  if (gpa >= 4.5) {
    return "Excellent";
  }

  if (gpa >= 3.5) {
    return "Very Good";
  }

  if (gpa >= 2.5) {
    return "Good";
  }

  if (gpa >= 1.5) {
    return "Satisfactory";
  }

  if (gpa > 0) {
    return "Needs Improvement";
  }

  return "No GPA";
}

function getGpaProgress(
  gpa: number,
): number {
  return Math.min(
    100,
    Math.max(
      0,
      (gpa / 5) * 100,
    ),
  );
}

function formatDate(
  date: string | null | undefined,
): string {
  if (!date) {
    return "—";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return "—";
  }

  return parsed.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function StudentAcademicProgressPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const [progress, setProgress] =
    useState<AcademicProgress | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    expandedSemester,
    setExpandedSemester,
  ] = useState<string | null>(
    null,
  );

  /* =======================================================
     AUTH TOKEN
  ====================================================== */

  const accessToken =
    session?.user?.accessToken;

  /* =======================================================
     LOAD PROGRESS
  ====================================================== */

  const loadProgress =
    useCallback(
      async (
        showRefresh = false,
      ) => {
        if (!accessToken) {
          setIsLoading(false);

          setError(
            "Authentication token is missing. Please sign out and sign in again.",
          );

          return;
        }

        try {
          if (showRefresh) {
            setIsRefreshing(true);
          } else {
            setIsLoading(true);
          }

          setError(null);

          const response =
            await apiGet<AcademicProgressResponse>(
              "/academic-progress/me",
              accessToken,
            );

          if (
            !response?.success ||
            !response.progress
          ) {
            throw new Error(
              response?.message ??
                "Unable to retrieve academic progress.",
            );
          }

          setProgress(
            response.progress,
          );

          /*
           * Automatically open the latest
           * semester when data first loads.
           */
          if (
            response.progress
              .semesters.length > 0 &&
            !expandedSemester
          ) {
            const latestSemester =
              response.progress.semesters[
                response.progress.semesters.length -
                  1
              ];

            setExpandedSemester(
              latestSemester.id,
            );
          }
        } catch (err) {
          console.error(
            "Academic progress error:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load academic progress.",
          );
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      [
        accessToken,
        expandedSemester,
      ],
    );

  /* =======================================================
     EFFECT
  ====================================================== */

  useEffect(() => {
    if (
      sessionStatus ===
      "loading"
    ) {
      return;
    }

    if (
      sessionStatus ===
      "unauthenticated"
    ) {
      setIsLoading(false);
      return;
    }

    if (
      sessionStatus ===
        "authenticated" &&
      !accessToken
    ) {
      setIsLoading(false);

      setError(
        "Authentication token is missing. Please sign out and sign in again.",
      );

      return;
    }

    if (
      sessionStatus ===
      "authenticated"
    ) {
      void loadProgress();
    }
  }, [
    sessionStatus,
    accessToken,
    loadProgress,
  ]);

  /* =======================================================
     DERIVED DATA
  ====================================================== */

  const latestSemester =
    useMemo(() => {
      if (
        !progress?.semesters.length
      ) {
        return null;
      }

      return progress.semesters[
        progress.semesters.length - 1
      ];
    }, [progress]);

  const bestSemester =
    useMemo(() => {
      if (
        !progress?.semesters.length
      ) {
        return null;
      }

      return progress.semesters.reduce(
        (best, current) =>
          current.gpa > best.gpa
            ? current
            : best,
      );
    }, [progress]);

  const gradeTotal =
    useMemo(() => {
      if (!progress) {
        return 0;
      }

      return GRADE_ORDER.reduce(
        (total, grade) =>
          total +
          progress.gradeDistribution[
            grade
          ],
        0,
      );
    }, [progress]);

  /* =======================================================
     LOADING
  ====================================================== */

  if (
    sessionStatus === "loading" ||
    isLoading
  ) {
    return <AcademicProgressSkeleton />;
  }

  /* =======================================================
     UNAUTHENTICATED
  ====================================================== */

  if (
    sessionStatus ===
    "unauthenticated"
  ) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold shadow-lg">
              <GraduationCap
                size={30}
              />
            </div>

            <h1 className="text-xl font-bold text-slate-900">
              Student sign-in required
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Please sign in to view your
              academic progress.
            </p>

            <Link
              href="/auth/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-navy/20 transition hover:-translate-y-0.5 hover:bg-brand-navy/95"
            >
              Sign in
              <ChevronRight
                size={17}
              />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ====================================================== */

  if (error && !progress) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-sm">
            <div className="bg-brand-navy px-6 py-8 text-white sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                Student Portal
              </p>

              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                Academic Progress
              </h1>
            </div>

            <div className="p-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <CircleAlert
                  size={30}
                />
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                Unable to load your progress
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadProgress(true)
                }
                disabled={isRefreshing}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={
                    isRefreshing
                      ? "animate-spin"
                      : ""
                  }
                />
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  const {
    student,
    programme,
    currentAcademicSession,
    summary,
    gradeDistribution,
    semesters,
  } = progress;

  /* =======================================================
     MAIN UI
  ====================================================== */

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] p-0 sm:p-0 lg:p-0">
        {/* =================================================
            PREMIUM HEADER
        ================================================= */}

        <section className="relative overflow-hidden rounded-[30px] bg-brand-navy text-white shadow-2xl shadow-brand-navy/15">
          {/* Decorative shapes */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="pointer-events-none absolute right-8 top-8 h-24 w-24 rounded-full border border-white/10" />

          <div className="pointer-events-none absolute bottom-8 right-32 h-12 w-12 rounded-full border border-brand-gold/20" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              {/* Header information */}

              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-gold/20 bg-white/10 text-brand-gold backdrop-blur">
                    <BarChart3
                      size={22}
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-gold">
                      Student Portal
                    </p>

                    <p className="mt-0.5 text-xs text-white/60">
                      Academic Records
                    </p>
                  </div>
                </div>

                <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Academic Progress
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                  Track your academic journey,
                  semester performance, GPA
                  progression, credit units and
                  overall academic standing.
                </p>

                {/* Student identity */}

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold text-xs font-black text-brand-navy">
                      {getInitials(
                        student.name,
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {student.name}
                      </p>

                      <p className="truncate text-xs text-white/55">
                        {student.matricNumber ??
                          student.email}
                      </p>
                    </div>
                  </div>

                  {programme && (
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 backdrop-blur">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                        Programme
                      </p>

                      <p className="mt-0.5 max-w-[240px] truncate text-sm font-semibold text-white">
                        {programme.name}
                      </p>
                    </div>
                  )}

                  {student.level && (
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 backdrop-blur">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                        Level
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-white">
                        {student.level}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* CGPA panel */}

              <div className="w-full shrink-0 xl:max-w-[330px]">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.08] p-5 backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                        Overall CGPA
                      </p>

                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-5xl font-black tracking-tight text-white">
                          {summary.cgpa.toFixed(
                            2,
                          )}
                        </span>

                        <span className="pb-1 text-sm font-semibold text-white/45">
                          / 5.00
                        </span>
                      </div>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
                      <Trophy
                        size={21}
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-brand-gold transition-all duration-700"
                        style={{
                          width: `${getGpaProgress(
                            summary.cgpa,
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-white/45">
                        0.00
                      </span>

                      <span className="font-semibold text-brand-gold">
                        {getGpaLabel(
                          summary.cgpa,
                        )}
                      </span>

                      <span className="text-white/45">
                        5.00
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs text-white/45">
                      Based on published results
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        void loadProgress(
                          true,
                        )
                      }
                      disabled={
                        isRefreshing
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                      aria-label="Refresh academic progress"
                    >
                      <RefreshCw
                        size={14}
                        className={
                          isRefreshing
                            ? "animate-spin"
                            : ""
                        }
                      />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR NOTICE
        ================================================= */}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-700">
            <CircleAlert
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Academic progress could not be
                refreshed.
              </p>

              <p className="mt-0.5 text-xs text-red-600/80">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadProgress(true)
              }
              disabled={isRefreshing}
              className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-700 shadow-sm ring-1 ring-red-100 hover:bg-red-50 disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            QUICK STATISTICS
        ================================================= */}

        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ProgressStatCard
            icon={
              <Trophy
                size={21}
              />
            }
            label="Overall CGPA"
            value={summary.cgpa.toFixed(
              2,
            )}
            suffix="/ 5.00"
            description={getGpaLabel(
              summary.cgpa,
            )}
            iconClass="bg-brand-navy/10 text-brand-navy"
          />

          <ProgressStatCard
            icon={
              <BookOpen
                size={21}
              />
            }
            label="Credit Units"
            value={summary.totalCredits}
            suffix="units"
            description="Published credits earned"
            iconClass="bg-blue-50 text-blue-600"
          />

          <ProgressStatCard
            icon={
              <CheckCircle2
                size={21}
              />
            }
            label="Courses Passed"
            value={
              summary.coursesPassed
            }
            suffix={`/ ${summary.coursesCompleted}`}
            description={`${summary.coursesFailed} failed`}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <ProgressStatCard
            icon={
              <TrendingUp
                size={21}
              />
            }
            label="Average Score"
            value={summary.averageScore.toFixed(
              1,
            )}
            suffix="%"
            description={`${summary.totalSemesters} semester${summary.totalSemesters === 1 ? "" : "s"} recorded`}
            iconClass="bg-amber-50 text-amber-600"
          />
        </section>

        {/* =================================================
            CURRENT ACADEMIC INFORMATION
        ================================================= */}

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                  Academic Profile
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Current academic information
                </h2>
              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy sm:flex">
                <UserRound
                  size={20}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                icon={
                  <UserRound
                    size={17}
                  />
                }
                label="Student"
                value={student.name}
              />

              <InfoItem
                icon={
                  <FileText
                    size={17}
                  />
                }
                label="Matric Number"
                value={
                  student.matricNumber ??
                  "Not assigned"
                }
              />

              <InfoItem
                icon={
                  <GraduationCap
                    size={17}
                  />
                }
                label="Programme"
                value={
                  programme?.name ??
                  "Not assigned"
                }
              />

              <InfoItem
                icon={
                  <Award
                    size={17}
                  />
                }
                label="Current Level"
                value={
                  student.level ??
                  "Not assigned"
                }
              />
            </div>
          </div>

          <div className="rounded-[26px] bg-brand-navy p-5 text-white shadow-lg shadow-brand-navy/10 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-brand-gold">
                <CalendarDays
                  size={20}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">
                  Academic Session
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  {currentAcademicSession?.name ??
                    "Not assigned"}
                </h2>
              </div>
            </div>

            {currentAcademicSession ? (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs text-white/45">
                    Starts
                  </span>

                  <span className="text-sm font-semibold">
                    {formatDate(
                      currentAcademicSession.startDate,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs text-white/45">
                    Ends
                  </span>

                  <span className="text-sm font-semibold">
                    {formatDate(
                      currentAcademicSession.endDate,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/45">
                    Status
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    {currentAcademicSession.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm leading-6 text-white/55">
                No academic session is currently
                assigned to your student profile.
              </p>
            )}
          </div>
        </section>

        {/* =================================================
            PERFORMANCE OVERVIEW
        ================================================= */}

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          {/* GPA progression */}

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                  Performance
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  GPA progression
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Semester-by-semester academic
                  performance.
                </p>
              </div>

              {bestSemester && (
                <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  <TrendingUp
                    size={15}
                  />
                  Best:{" "}
                  {bestSemester.gpa.toFixed(
                    2,
                  )}
                </div>
              )}
            </div>

            {semesters.length > 0 ? (
              <div className="mt-7">
                <div className="relative px-1">
                  {/* Chart grid */}

                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[220px]">
                    {[5, 4, 3, 2, 1, 0].map(
                      (value) => (
                        <div
                          key={value}
                          className="absolute inset-x-0 border-t border-dashed border-slate-100"
                          style={{
                            top: `${
                              ((5 -
                                value) /
                                5) *
                              100
                            }%`,
                          }}
                        >
                          <span className="absolute -left-1 -top-2 -translate-x-full text-[10px] font-medium text-slate-400">
                            {value}
                          </span>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="relative flex h-[220px] items-end gap-3 overflow-x-auto px-2 pb-1 pt-2 sm:gap-5">
                    {semesters.map(
                      (semester) => {
                        const height =
                          getGpaProgress(
                            semester.gpa,
                          );

                        return (
                          <div
                            key={
                              semester.id
                            }
                            className="flex min-w-[64px] flex-1 flex-col items-center justify-end gap-2"
                          >
                            <div className="flex h-[180px] w-full max-w-[58px] items-end justify-center">
                              <div
                                className="group relative w-full overflow-hidden rounded-t-xl bg-brand-navy/10 transition hover:bg-brand-navy/15"
                                style={{
                                  height: `${Math.max(
                                    height,
                                    semester.gpa >
                                      0
                                      ? 8
                                      : 2,
                                  )}%`,
                                }}
                              >
                                <div className="absolute inset-x-0 bottom-0 h-full rounded-t-xl bg-brand-navy transition group-hover:bg-brand-navy/90" />

                                <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-lg group-hover:block">
                                  {semester.gpa.toFixed(
                                    2,
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-center">
                              <p className="text-[11px] font-bold text-slate-700">
                                {semester.semester
                                  .replace(
                                    /semester/gi,
                                    "",
                                  )
                                  .trim()}
                              </p>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                {semester.gpa.toFixed(
                                  2,
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyProgressState />
            )}
          </div>

          {/* Grade distribution */}

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                Grade Profile
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Grade distribution
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Distribution across published
                results.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {GRADE_ORDER.map(
                (grade) => {
                  const count =
                    gradeDistribution[
                      grade
                    ];

                  const percentage =
                    gradeTotal > 0
                      ? (count /
                          gradeTotal) *
                        100
                      : 0;

                  return (
                    <div
                      key={grade}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-black ${getGradeClasses(
                              grade,
                            )}`}
                          >
                            {grade}
                          </span>

                          <span className="text-xs font-medium text-slate-600">
                            {GRADE_POINTS[
                              grade
                            ]} point
                            {GRADE_POINTS[
                              grade
                            ] === 1
                              ? ""
                              : "s"}
                          </span>
                        </div>

                        <span className="text-xs font-bold text-slate-700">
                          {count}{" "}
                          {count === 1
                            ? "course"
                            : "courses"}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-navy transition-all duration-700"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            SEMESTER HISTORY
        ================================================= */}

        <section className="mt-5 rounded-[26px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                  Academic History
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Semester performance
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Review your GPA, credits and
                  course performance for every
                  published semester.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                <Clock3
                  size={15}
                  className="text-brand-navy"
                />
                {summary.totalSemesters}{" "}
                semester
                {summary.totalSemesters ===
                1
                  ? ""
                  : "s"}
              </div>
            </div>
          </div>

          {semesters.length === 0 ? (
            <div className="p-8">
              <EmptyProgressState />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {semesters
                .slice()
                .reverse()
                .map(
                  (
                    semester,
                    index,
                  ) => {
                    const isExpanded =
                      expandedSemester ===
                      semester.id;

                    const isLatest =
                      index === 0;

                    return (
                      <div
                        key={
                          semester.id
                        }
                      >
                        {/* Semester row */}

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSemester(
                              isExpanded
                                ? null
                                : semester.id,
                            )
                          }
                          className="w-full px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative hidden sm:block">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold shadow-md shadow-brand-navy/10">
                                <GraduationCap
                                  size={19}
                                />
                              </div>

                              {index <
                                semesters.length -
                                  1 && (
                                <div className="absolute left-1/2 top-full h-5 w-px -translate-x-1/2 bg-slate-200" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                                  {
                                    semester.semester
                                  }
                                </h3>

                                {isLatest && (
                                  <span className="rounded-full bg-brand-gold/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-gold">
                                    Latest
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {semester.academicSession ??
                                  "Academic session unavailable"}
                              </p>
                            </div>

                            <div className="hidden items-center gap-8 md:flex">
                              <HistoryMetric
                                label="GPA"
                                value={semester.gpa.toFixed(
                                  2,
                                )}
                              />

                              <HistoryMetric
                                label="Credits"
                                value={
                                  semester.creditUnits
                                }
                              />

                              <HistoryMetric
                                label="Passed"
                                value={
                                  semester.passed
                                }
                              />

                              <HistoryMetric
                                label="Average"
                                value={`${semester.averageScore.toFixed(
                                  1,
                                )}%`}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy md:hidden">
                                <span className="text-xs font-black">
                                  {semester.gpa.toFixed(
                                    1,
                                  )}
                                </span>
                              </div>

                              <ChevronDown
                                size={18}
                                className={`text-slate-400 transition-transform ${
                                  isExpanded
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </div>
                          </div>

                          {/* Mobile metrics */}

                          <div className="mt-4 grid grid-cols-2 gap-2 md:hidden">
                            <MobileHistoryMetric
                              label="GPA"
                              value={semester.gpa.toFixed(
                                2,
                              )}
                            />

                            <MobileHistoryMetric
                              label="Credits"
                              value={
                                semester.creditUnits
                              }
                            />

                            <MobileHistoryMetric
                              label="Passed"
                              value={
                                semester.passed
                              }
                            />

                            <MobileHistoryMetric
                              label="Average"
                              value={`${semester.averageScore.toFixed(
                                1,
                              )}%`}
                            />
                          </div>
                        </button>

                        {/* Expanded courses */}

                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">
                                  Course performance
                                </h4>

                                <p className="mt-1 text-xs text-slate-500">
                                  {semester.courses}{" "}
                                  courses ·{" "}
                                  {
                                    semester.creditUnits
                                  }{" "}
                                  credit units
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700">
                                  {
                                    semester.passed
                                  }{" "}
                                  Passed
                                </span>

                                {semester.failed >
                                  0 && (
                                  <span className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-700">
                                    {
                                      semester.failed
                                    }{" "}
                                    Failed
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                              <div className="hidden grid-cols-[1.1fr_2fr_0.7fr_0.7fr_0.8fr_0.8fr] gap-4 bg-brand-navy px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/65 md:grid">
                                <span>Course</span>
                                <span>Title</span>
                                <span>Credit</span>
                                <span>Score</span>
                                <span>Grade</span>
                                <span>Point</span>
                              </div>

                              <div className="divide-y divide-slate-100">
                                {semester.courseResults.map(
                                  (
                                    course,
                                  ) => (
                                    <div
                                      key={
                                        course.id
                                      }
                                      className="grid gap-3 px-4 py-4 md:grid-cols-[1.1fr_2fr_0.7fr_0.7fr_0.8fr_0.8fr] md:items-center md:gap-4"
                                    >
                                      <div>
                                        <p className="text-xs font-black text-brand-navy">
                                          {
                                            course.code
                                          }
                                        </p>

                                        <p className="mt-0.5 text-[10px] text-slate-400 md:hidden">
                                          Course
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                          {
                                            course.title
                                          }
                                        </p>
                                      </div>

                                      <div className="flex items-center justify-between md:block">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 md:hidden">
                                          Credit
                                        </span>

                                        <span className="text-sm font-semibold text-slate-700">
                                          {
                                            course.creditUnits
                                          }
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between md:block">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 md:hidden">
                                          Score
                                        </span>

                                        <span className="text-sm font-bold text-slate-800">
                                          {formatScore(
                                            course.score,
                                          )}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between md:block">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 md:hidden">
                                          Grade
                                        </span>

                                        <span
                                          className={`inline-flex min-w-9 items-center justify-center rounded-lg border px-2 py-1 text-xs font-black ${getGradeClasses(
                                            course.grade,
                                          )}`}
                                        >
                                          {
                                            course.grade
                                          }
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between md:block">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 md:hidden">
                                          Point
                                        </span>

                                        <span className="text-sm font-bold text-brand-navy">
                                          {
                                            course.gradePoint
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
            </div>
          )}
        </section>

        {/* =================================================
            CREDIT & PERFORMANCE SUMMARY
        ================================================= */}

        <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <SummaryPanel
            icon={
              <BookOpen
                size={20}
              />
            }
            title="Credit units"
            value={`${summary.totalCredits}`}
            subtitle="Published credit units completed"
          >
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">
                  Completed courses
                </span>

                <span className="font-bold text-slate-800">
                  {
                    summary.coursesCompleted
                  }
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-navy"
                  style={{
                    width: `${
                      summary.coursesCompleted >
                      0
                        ? Math.min(
                            100,
                            (summary.coursesPassed /
                              summary.coursesCompleted) *
                              100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                {summary.coursesPassed} of{" "}
                {
                  summary.coursesCompleted
                } courses passed
              </p>
            </div>
          </SummaryPanel>

          <SummaryPanel
            icon={
              <TrendingUp
                size={20}
              />
            }
            title="Best semester"
            value={
              bestSemester
                ? bestSemester.gpa.toFixed(
                    2,
                  )
                : "—"
            }
            subtitle={
              bestSemester
                ? `${bestSemester.semester} · ${bestSemester.academicSession ?? "Session unavailable"}`
                : "No semester data available"
            }
          >
            {bestSemester && (
              <div className="mt-5 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">
                {getGpaLabel(
                  bestSemester.gpa,
                )}{" "}
                semester performance
              </div>
            )}
          </SummaryPanel>

          <SummaryPanel
            icon={
              summary.coursesFailed >
              0 ? (
                <XCircle
                  size={20}
                />
              ) : (
                <CheckCircle2
                  size={20}
                />
              )
            }
            title="Academic standing"
            value={
              summary.coursesFailed >
              0
                ? "Attention"
                : "Good Standing"
            }
            subtitle={
              summary.coursesFailed >
              0
                ? `${summary.coursesFailed} failed course${summary.coursesFailed === 1 ? "" : "s"} recorded`
                : "No failed published courses"
            }
          >
            <div
              className={`mt-5 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                summary.coursesFailed >
                0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {summary.coursesFailed >
              0
                ? "Review your failed courses and academic requirements."
                : "Keep maintaining your academic performance."}
            </div>
          </SummaryPanel>
        </section>

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <div className="mt-5 rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.03] px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
              <Clock3
                size={15}
              />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700">
                Academic progress information
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Your academic progress is calculated
                from published results available in
                the student portal. Draft results are
                excluded until they are officially
                published.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function ProgressStatCard({
  icon,
  label,
  value,
  suffix,
  description,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>

        <div className="h-1.5 w-1.5 rounded-full bg-brand-gold opacity-60 transition group-hover:scale-150" />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-black tracking-tight text-slate-900">
          {value}
        </span>

        {suffix && (
          <span className="text-xs font-semibold text-slate-400">
            {suffix}
          </span>
        )}
      </div>

      <p className="mt-1 text-[11px] text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   HISTORY METRIC
========================================================= */

function HistoryMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="text-right">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   MOBILE HISTORY METRIC
========================================================= */

function MobileHistoryMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY PANEL
========================================================= */

function SummaryPanel({
  icon,
  title,
  value,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy">
          {icon}
        </div>
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyProgressState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy">
        <BookOpen
          size={21}
        />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        No published academic records yet
      </h3>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
        Your academic progress will appear here
        once your results have been officially
        published.
      </p>
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function AcademicProgressSkeleton() {
  return (
    <div className="min-h-full animate-pulse bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}

        <div className="overflow-hidden rounded-[30px] bg-brand-navy p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex-1">
              <div className="h-11 w-11 rounded-2xl bg-white/10" />

              <div className="mt-6 h-10 w-72 rounded-xl bg-white/10 sm:w-96" />

              <div className="mt-4 h-4 w-full max-w-2xl rounded-lg bg-white/10" />

              <div className="mt-2 h-4 w-3/4 max-w-xl rounded-lg bg-white/10" />

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="h-16 w-52 rounded-2xl bg-white/10" />
                <div className="h-16 w-44 rounded-2xl bg-white/10" />
                <div className="h-16 w-28 rounded-2xl bg-white/10" />
              </div>
            </div>

            <div className="h-48 w-full rounded-[26px] bg-white/10 xl:max-w-[330px]" />
          </div>
        </div>

        {/* Stats */}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-36 rounded-[24px] bg-white"
              />
            ),
          )}
        </div>

        {/* Main */}

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="h-[390px] rounded-[26px] bg-white" />

          <div className="h-[390px] rounded-[26px] bg-white" />
        </div>

        {/* History */}

        <div className="mt-5 h-[500px] rounded-[26px] bg-white" />
      </div>
    </div>
  );
}