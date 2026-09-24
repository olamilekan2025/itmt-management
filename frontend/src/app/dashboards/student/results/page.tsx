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
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  TrendingUp,
  Trophy,
  XCircle,
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
  creditUnits: number;
}

interface Semester {
  _id: string;
  name: string;
  order?: number;
}

type Grade = "A" | "B" | "C" | "D" | "E" | "F";

interface Result {
  _id: string;
  score: number;
  grade: Grade;
  status: "draft" | "published";
  course: Course;
  semester: Semester;
  createdAt?: string;
  updatedAt?: string;
}

interface ResultsResponse {
  success: boolean;
  results: Result[];
  message?: string;
}

interface StudentUser {
  id?: string;
  role?: string;
  accessToken?: string;
  matricNumber?: string;
  name?: string | null;
  email?: string | null;
}

/* =========================================================
   CONSTANTS
========================================================= */

const GRADE_POINTS: Record<Grade, number> = {
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

function getGradePoint(grade: Grade) {
  return GRADE_POINTS[grade] ?? 0;
}

function getGradeLabel(grade: Grade) {
  switch (grade) {
    case "A":
      return "Excellent";

    case "B":
      return "Very Good";

    case "C":
      return "Good";

    case "D":
      return "Pass";

    case "E":
      return "Weak Pass";

    case "F":
      return "Fail";

    default:
      return "";
  }
}

function getGradeClasses(grade: Grade) {
  switch (grade) {
    case "A":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "B":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "C":
      return "border-sky-200 bg-sky-50 text-sky-700";

    case "D":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "E":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "F":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getPerformanceTone(gpa: number) {
  if (gpa >= 4.5) {
    return {
      label: "Outstanding Performance",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      bar: "bg-emerald-500",
    };
  }

  if (gpa >= 3.5) {
    return {
      label: "Strong Performance",
      text: "text-blue-700",
      bg: "bg-blue-50",
      bar: "bg-blue-500",
    };
  }

  if (gpa >= 2.5) {
    return {
      label: "Good Academic Progress",
      text: "text-sky-700",
      bg: "bg-sky-50",
      bar: "bg-sky-500",
    };
  }

  if (gpa >= 1.5) {
    return {
      label: "Keep Improving",
      text: "text-amber-700",
      bg: "bg-amber-50",
      bar: "bg-amber-500",
    };
  }

  return {
    label: "Academic Attention",
    text: "text-red-700",
    bg: "bg-red-50",
    bar: "bg-red-500",
  };
}

function calculateGPA(results: Result[]) {
  if (results.length === 0) {
    return 0;
  }

  let totalQualityPoints = 0;
  let totalCreditUnits = 0;

  for (const result of results) {
    const creditUnits = Number(
      result.course?.creditUnits ?? 0,
    );

    const gradePoint = getGradePoint(result.grade);

    totalQualityPoints +=
      gradePoint * creditUnits;

    totalCreditUnits += creditUnits;
  }

  if (totalCreditUnits === 0) {
    return 0;
  }

  return totalQualityPoints / totalCreditUnits;
}

function calculateTotalCredits(results: Result[]) {
  return results.reduce(
    (total, result) =>
      total +
      Number(result.course?.creditUnits ?? 0),
    0,
  );
}

function calculateQualityPoints(results: Result[]) {
  return results.reduce(
    (total, result) =>
      total +
      getGradePoint(result.grade) *
        Number(result.course?.creditUnits ?? 0),
    0,
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function StudentResultsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const studentUser =
    session?.user as StudentUser | undefined;

  const accessToken =
    studentUser?.accessToken;

  const studentName =
    studentUser?.name?.trim() ||
    "Student";

  const matricNumber =
    studentUser?.matricNumber;

  /* =======================================================
     STATE
  ====================================================== */

  const [results, setResults] =
    useState<Result[]>([]);

  const [selectedSemester, setSelectedSemester] =
    useState<string>("all");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =======================================================
     LOAD RESULTS
  ====================================================== */

  const loadResults = useCallback(
    async (showRefreshLoader = false) => {
      if (!accessToken) {
        return;
      }

      try {
        if (showRefreshLoader) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const response =
          await apiGet<ResultsResponse>(
            "/results/me",
            accessToken,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to retrieve your results.",
          );
        }

        setResults(
          Array.isArray(response.results)
            ? response.results
            : [],
        );
      } catch (err) {
        console.error(
          "Student results error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your results.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      accessToken
    ) {
      loadResults();
    }

    if (
      sessionStatus === "unauthenticated"
    ) {
      setIsLoading(false);
    }
  }, [
    accessToken,
    sessionStatus,
    loadResults,
  ]);

  /* =======================================================
     SEMESTERS
  ====================================================== */

  const semesters = useMemo(() => {
    const semesterMap =
      new Map<string, Semester>();

    results.forEach((result) => {
      if (!result.semester?._id) {
        return;
      }

      semesterMap.set(
        result.semester._id,
        result.semester,
      );
    });

    return Array.from(
      semesterMap.values(),
    ).sort(
      (a, b) =>
        Number(a.order ?? 999) -
        Number(b.order ?? 999),
    );
  }, [results]);

  /* =======================================================
     SELECTED RESULTS
  ====================================================== */

  const visibleResults = useMemo(() => {
    if (selectedSemester === "all") {
      return results;
    }

    return results.filter(
      (result) =>
        result.semester?._id ===
        selectedSemester,
    );
  }, [
    results,
    selectedSemester,
  ]);

  /* =======================================================
     STATISTICS
  ====================================================== */

  const totalCourses =
    visibleResults.length;

  const totalCredits =
    calculateTotalCredits(
      visibleResults,
    );

  const qualityPoints =
    calculateQualityPoints(
      visibleResults,
    );

  const currentGPA =
    calculateGPA(visibleResults);

  const overallGPA =
    calculateGPA(results);

  const passedCourses =
    visibleResults.filter(
      (result) => result.grade !== "F",
    ).length;

  const failedCourses =
    visibleResults.filter(
      (result) => result.grade === "F",
    ).length;

  const averageScore =
    visibleResults.length > 0
      ? visibleResults.reduce(
          (total, result) =>
            total +
            Number(result.score ?? 0),
          0,
        ) / visibleResults.length
      : 0;

  const performance =
    getPerformanceTone(
      selectedSemester === "all"
        ? overallGPA
        : currentGPA,
    );

  const displayGPA =
    selectedSemester === "all"
      ? overallGPA
      : currentGPA;

  /* =======================================================
     SESSION LOADING
  ====================================================== */

  if (
    sessionStatus === "loading"
  ) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-lg shadow-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-brand-navy">
              Loading your results
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Preparing your academic record...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     UNAUTHENTICATED
  ====================================================== */

  if (
    sessionStatus === "unauthenticated"
  ) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <XCircle className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-brand-navy">
            Session expired
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your student session is no longer
            available. Please sign in again to
            view your academic results.
          </p>

          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            Sign in again
          </Link>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN PAGE
  ====================================================== */

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-0 py-5 sm:px-0 sm:py-6 lg:px-0 lg:py-8">

        {/* =================================================
            PREMIUM PAGE HEADER
        ================================================== */}

        <section className="relative mb-6 overflow-hidden rounded-3xl bg-brand-navy shadow-xl shadow-brand-navy/10 lg:mb-8">
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative px-5 py-6 sm:px-7 sm:py-7 lg:px-9 lg:py-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                    <GraduationCap className="h-4.5 w-4.5 text-brand-gold" />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-gold">
                    Academic Records
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  My Results
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                  Welcome back,{" "}
                  <span className="font-semibold text-white">
                    {studentName}
                  </span>
                  . Review your published
                  academic performance, grades,
                  credit units and GPA.
                </p>

                {matricNumber && (
                  <div className="mt-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                      Matric No.
                    </span>

                    <span className="ml-2 text-xs font-bold text-white/90">
                      {matricNumber}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Current GPA
                  </p>

                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-white">
                      {displayGPA.toFixed(2)}
                    </span>

                    <span className="mb-1 text-xs font-medium text-white/45">
                      / 5.00
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadResults(true)
                  }
                  disabled={
                    isRefreshing ||
                    !accessToken
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white px-4 py-2.5 text-sm font-bold text-brand-navy shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isRefreshing
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  {isRefreshing
                    ? "Refreshing..."
                    : "Refresh Results"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>

              <div>
                <p className="text-sm font-bold text-red-800">
                  Unable to load results
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                loadResults()
              }
              className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-red-700 shadow-sm transition hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================== */}

        {isLoading ? (
          <ResultsSkeleton />
        ) : (
          <>
            {/* =============================================
                PERFORMANCE HERO
            ============================================== */}

            <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-light">
                      <Trophy className="h-7 w-7 text-brand-navy" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        {selectedSemester ===
                        "all"
                          ? "Overall academic performance"
                          : "Selected semester performance"}
                      </p>

                      <h2 className="mt-1 truncate text-lg font-extrabold text-brand-navy sm:text-xl">
                        {performance.label}
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        Based on a 5.00 grading
                        scale.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight text-brand-navy">
                      {displayGPA.toFixed(2)}
                    </span>

                    <span className="mb-1.5 text-xs font-bold text-slate-400">
                      GPA
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">
                      GPA Progress
                    </span>

                    <span className={performance.text}>
                      {Math.min(
                        (displayGPA / 5) *
                          100,
                        100,
                      ).toFixed(0)}
                      %
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${performance.bar}`}
                      style={{
                        width: `${Math.min(
                          (displayGPA / 5) *
                            100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-brand-navy p-5 text-white shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <TrendingUp className="h-5 w-5 text-brand-gold" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                      Average score
                    </p>

                    <p className="mt-1 text-2xl font-extrabold">
                      {averageScore.toFixed(1)}
                      <span className="ml-1 text-sm text-white/40">
                        %
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <MiniDarkStat
                    label="Passed"
                    value={String(
                      passedCourses,
                    )}
                  />

                  <MiniDarkStat
                    label="Failed"
                    value={String(
                      failedCourses,
                    )}
                  />
                </div>
              </div>
            </section>

            {/* =============================================
                OVERVIEW CARDS
            ============================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Trophy}
                label={
                  selectedSemester ===
                  "all"
                    ? "Overall CGPA"
                    : "Semester GPA"
                }
                value={displayGPA.toFixed(2)}
                description="5.00 grading scale"
                iconClass="bg-brand-light text-brand-navy"
              />

              <StatCard
                icon={BookOpen}
                label="Credit Units"
                value={String(
                  totalCredits,
                )}
                description="Total credit units"
                iconClass="bg-blue-50 text-blue-600"
              />

              <StatCard
                icon={CheckCircle2}
                label="Passed Courses"
                value={String(
                  passedCourses,
                )}
                description={
                  totalCourses > 0
                    ? `${Math.round(
                        (passedCourses /
                          totalCourses) *
                          100,
                      )}% pass rate`
                    : "No results yet"
                }
                iconClass="bg-emerald-50 text-emerald-600"
              />

              <StatCard
                icon={Calculator}
                label="Quality Points"
                value={qualityPoints.toFixed(
                  1,
                )}
                description="Weighted grade points"
                iconClass="bg-violet-50 text-violet-600"
              />
            </div>

            {/* =============================================
                FILTER BAR
            ============================================== */}

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light">
                    <GraduationCap className="h-5 w-5 text-brand-navy" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-brand-navy">
                      Academic Results
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Filter your published
                      results by semester.
                    </p>
                  </div>
                </div>

                <div className="relative w-full lg:w-80">
                  <select
                    value={
                      selectedSemester
                    }
                    onChange={(event) =>
                      setSelectedSemester(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm font-bold text-brand-navy outline-none transition focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
                  >
                    <option value="all">
                      All Published Results
                    </option>

                    {semesters.map(
                      (semester) => (
                        <option
                          key={
                            semester._id
                          }
                          value={
                            semester._id
                          }
                        >
                          {semester.name}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </section>

            {/* =============================================
                NO RESULTS
            ============================================== */}

            {results.length === 0 ? (
              <EmptyResults />
            ) : visibleResults.length ===
              0 ? (
              <EmptySemester />
            ) : (
              <>
                {/* =========================================
                    RESULT TABLE
                ========================================== */}

                <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-brand-gold" />

                          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                            Published Record
                          </span>
                        </div>

                        <h2 className="mt-2 text-lg font-extrabold text-brand-navy">
                          Result Details
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          {visibleResults.length}{" "}
                          course
                          {visibleResults.length !==
                          1
                            ? "s"
                            : ""}{" "}
                          displayed
                        </p>
                      </div>

                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          Officially Published
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[850px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80">
                          <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Course
                          </th>

                          <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Unit
                          </th>

                          <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Score
                          </th>

                          <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Grade
                          </th>

                          <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Point
                          </th>

                          <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Quality Points
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {visibleResults.map(
                          (result) => {
                            const creditUnits =
                              Number(
                                result
                                  .course
                                  ?.creditUnits ??
                                  0,
                              );

                            const gradePoint =
                              getGradePoint(
                                result.grade,
                              );

                            const qualityPoint =
                              creditUnits *
                              gradePoint;

                            return (
                              <tr
                                key={
                                  result._id
                                }
                                className="group transition-colors hover:bg-slate-50/80"
                              >
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-navy">
                                      <BookOpen className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="text-sm font-extrabold text-brand-navy">
                                        {
                                          result
                                            .course
                                            ?.code
                                        }
                                      </p>

                                      <p className="mt-1 max-w-md truncate text-xs text-slate-500">
                                        {
                                          result
                                            .course
                                            ?.title
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-5 text-center">
                                  <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                                    {
                                      creditUnits
                                    }
                                  </span>
                                </td>

                                <td className="px-4 py-5 text-center">
                                  <span className="text-sm font-extrabold text-brand-navy">
                                    {Number(
                                      result.score,
                                    ).toFixed(
                                      0,
                                    )}
                                  </span>

                                  <span className="text-xs text-slate-400">
                                    /100
                                  </span>
                                </td>

                                <td className="px-4 py-5 text-center">
                                  <div
                                    className={`mx-auto inline-flex min-w-10 items-center justify-center rounded-xl border px-2.5 py-1.5 text-sm font-black ${getGradeClasses(
                                      result.grade,
                                    )}`}
                                  >
                                    {
                                      result.grade
                                    }
                                  </div>
                                </td>

                                <td className="px-4 py-5 text-center">
                                  <span className="text-sm font-extrabold text-brand-navy">
                                    {gradePoint.toFixed(
                                      1,
                                    )}
                                  </span>
                                </td>

                                <td className="px-6 py-5 text-right">
                                  <span className="text-sm font-extrabold text-slate-700">
                                    {qualityPoint.toFixed(
                                      1,
                                    )}
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
                    {visibleResults.map(
                      (result) => {
                        const creditUnits =
                          Number(
                            result.course
                              ?.creditUnits ??
                              0,
                          );

                        const gradePoint =
                          getGradePoint(
                            result.grade,
                          );

                        const qualityPoint =
                          creditUnits *
                          gradePoint;

                        return (
                          <article
                            key={
                              result._id
                            }
                            className="p-4 transition-colors active:bg-slate-50"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-navy">
                                  <BookOpen className="h-4 w-4" />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-extrabold text-brand-navy">
                                    {
                                      result
                                        .course
                                        ?.code
                                    }
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {
                                      result
                                        .course
                                        ?.title
                                    }
                                  </p>
                                </div>
                              </div>

                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${getGradeClasses(
                                  result.grade,
                                )}`}
                              >
                                {
                                  result.grade
                                }
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <MobileResultMetric
                                label="Score"
                                value={`${Number(
                                  result.score,
                                ).toFixed(
                                  0,
                                )}%`}
                              />

                              <MobileResultMetric
                                label="Credit Unit"
                                value={String(
                                  creditUnits,
                                )}
                              />

                              <MobileResultMetric
                                label="Grade Point"
                                value={gradePoint.toFixed(
                                  1,
                                )}
                              />

                              <MobileResultMetric
                                label="Quality Point"
                                value={qualityPoint.toFixed(
                                  1,
                                )}
                              />
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                              <Award className="h-3.5 w-3.5" />

                              <span>
                                {getGradeLabel(
                                  result.grade,
                                )}
                              </span>
                            </div>
                          </article>
                        );
                      },
                    )}
                  </div>
                </section>

                {/* =========================================
                    PERFORMANCE SUMMARY
                ========================================== */}

                <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <SummaryCard
                    icon={Calculator}
                    iconClass="bg-brand-light text-brand-navy"
                    title={
                      selectedSemester ===
                      "all"
                        ? "Overall GPA"
                        : "Semester GPA"
                    }
                    value={currentGPA.toFixed(
                      2,
                    )}
                    description="Calculated using course credit units and grade points."
                  />

                  <SummaryCard
                    icon={CheckCircle2}
                    iconClass="bg-emerald-50 text-emerald-600"
                    title="Passed Courses"
                    value={`${passedCourses}/${totalCourses}`}
                    description="Courses with grades from A through E are counted as passed."
                  />

                  <SummaryCard
                    icon={FileText}
                    iconClass="bg-violet-50 text-violet-600"
                    title="Quality Points"
                    value={qualityPoints.toFixed(
                      1,
                    )}
                    description="Grade points weighted against the credit units of each course."
                  />
                </section>

                {/* =========================================
                    GRADING GUIDE
                ========================================== */}

                <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light">
                        <Award className="h-5 w-5 text-brand-navy" />
                      </div>

                      <div>
                        <h2 className="text-sm font-extrabold text-brand-navy">
                          Grading Scale
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Your academic results are
                          calculated using a 5-point
                          grading scale.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
                    {(
                      Object.keys(
                        GRADE_POINTS,
                      ) as Grade[]
                    ).map((grade) => (
                      <div
                        key={grade}
                        className={`rounded-2xl border p-3 text-center ${getGradeClasses(
                          grade,
                        )}`}
                      >
                        <div className="text-lg font-black">
                          {grade}
                        </div>

                        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider opacity-70">
                          {getGradePoint(
                            grade,
                          )}{" "}
                          point
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* =========================================
                    RESULT NOTE
                ========================================== */}

                <div className="mt-6 rounded-3xl border border-brand-gold/20 bg-brand-light/40 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Clock3 className="h-4 w-4 text-brand-gold" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-brand-navy">
                        Official result publication
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Only results officially
                        published by the appropriate
                        academic administrator are
                        displayed on this page. Draft
                        results remain hidden until they
                        are published.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60">
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-slate-50" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-brand-navy">
            {value}
          </p>

          <p className="mt-1 text-[10px] leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MINI DARK STAT
========================================================= */

function MiniDarkStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-white/35">
        {label}
      </p>

      <p className="mt-1 text-lg font-extrabold text-white">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon: Icon,
  iconClass,
  title,
  value,
  description,
}: {
  icon: typeof Calculator;
  iconClass: string;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">
            {title}
          </p>

          <p className="mt-0.5 truncate text-xl font-black text-brand-navy">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   MOBILE RESULT METRIC
========================================================= */

function MobileResultMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-extrabold text-brand-navy">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY RESULTS
========================================================= */

function EmptyResults() {
  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light">
        <FileText className="h-7 w-7 text-brand-navy" />
      </div>

      <h2 className="mt-5 text-lg font-extrabold text-brand-navy">
        No published results yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Your academic results will appear here
        once they have been submitted, reviewed
        and officially published.
      </p>

      <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5">
        <Clock3 className="h-3.5 w-3.5 text-slate-400" />

        <span className="text-[10px] font-semibold text-slate-500">
          Results are updated after publication
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY SEMESTER
========================================================= */

function EmptySemester() {
  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <BookOpen className="h-6 w-6 text-slate-400" />
      </div>

      <h2 className="mt-4 text-base font-extrabold text-brand-navy">
        No results for this semester
      </h2>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
        There are currently no published
        results available for the selected
        semester.
      </p>
    </div>
  );
}

/* =========================================================
   LOADING SKELETON
========================================================= */

function ResultsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 rounded-3xl bg-brand-navy p-6">
        <div className="h-4 w-32 rounded bg-white/10" />

        <div className="mt-5 h-9 w-56 rounded bg-white/10" />

        <div className="mt-3 h-4 w-full max-w-xl rounded bg-white/10" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="h-48 rounded-3xl bg-slate-200" />

        <div className="h-48 rounded-3xl bg-slate-200" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      <div className="mt-6 h-20 rounded-3xl bg-slate-200" />

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="h-20 bg-slate-100" />

        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="h-20 border-t border-slate-100 bg-white"
          />
        ))}
      </div>
    </div>
  );
}