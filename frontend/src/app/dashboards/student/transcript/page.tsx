"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Loader2,
  Printer,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSession } from "next-auth/react";

import {
  apiGet,
  apiPost,
} from "@/lib/api";

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

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  matricNumber?: string | null;
  level?: string | null;
}

interface Programme {
  id: string;
  name: string;
  code: string;
  award?: string | null;
  durationYears?: number | null;
}

interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface TranscriptCourse {
  id: string;
  code: string;
  title: string;
  creditUnits: number;
  score: number;
  grade: Grade;
  gradePoint: number;
}

interface TranscriptSemester {
  id: string;
  name: string;
  order: number;
  session: string;
  courses: TranscriptCourse[];
  attemptedCredits: number;
  earnedCredits: number;
  qualityPoints: number;
  gpa: number;
}

interface TranscriptSummary {
  totalCourses: number;
  passedCourses: number;
  failedCourses: number;
  totalCredits: number;
  earnedCredits: number;
  totalQualityPoints: number;
  cgpa: number;
  totalSemesters: number;
}

interface TranscriptResponse {
  success: boolean;
  student: Student;
  programme: Programme | null;
  academicSession: AcademicSession | null;
  summary: TranscriptSummary;
  semesters: TranscriptSemester[];
  gradeDistribution: Record<Grade, number>;
}

type TranscriptRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "processing"
  | "ready"
  | "collected";

interface TranscriptRequest {
  _id: string;
  requestType: string;
  purpose: string;
  destination?: string;
  status: TranscriptRequestStatus;
  adminNote?: string;
  rejectionReason?: string;
  requestedAt?: string;
  processedAt?: string;
  collectedAt?: string;
}

interface TranscriptRequestsResponse {
  success: boolean;
  requests: TranscriptRequest[];
}

/* =========================================================
   HELPERS
========================================================= */

const gradePointMap: Record<Grade, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

function formatDate(
  value?: string | null,
) {
  if (!value) return "—";

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function statusLabel(
  status: TranscriptRequestStatus,
) {
  return status
    .replace("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function statusClasses(
  status: TranscriptRequestStatus,
) {
  switch (status) {
    case "approved":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "processing":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "collected":
      return "border-slate-200 bg-slate-100 text-slate-700";

    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }
}

function gradeClasses(
  grade: Grade,
) {
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

    case "F":
      return "bg-red-50 text-red-700 border-red-200";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function StudentTranscriptPage() {
  const { data: session, status: authStatus } =
    useSession();

  const accessToken =
    session?.user?.accessToken;

  const [transcript, setTranscript] =
    useState<TranscriptResponse | null>(
      null,
    );

  const [requests, setRequests] =
    useState<TranscriptRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [requestLoading, setRequestLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showRequestModal, setShowRequestModal] =
    useState(false);

  const [submittingRequest, setSubmittingRequest] =
    useState(false);

  const [requestError, setRequestError] =
    useState("");

  const [requestType, setRequestType] =
    useState("official");

  const [purpose, setPurpose] =
    useState("");

  const [destination, setDestination] =
    useState("");

  /* =======================================================
     LOAD TRANSCRIPT
  ======================================================= */

  const loadTranscript =
    useCallback(
      async (
        showRefresh = false,
      ) => {
        if (!accessToken) return;

        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const response =
            await apiGet<TranscriptResponse>(
              "/results/transcript",
              accessToken,
            );

          setTranscript(response);
        } catch (err) {
          console.error(
            "Load transcript error:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load transcript.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [accessToken],
    );

  /* =======================================================
     LOAD REQUESTS
  ======================================================= */

  const loadRequests =
    useCallback(async () => {
      if (!accessToken) return;

      try {
        setRequestLoading(true);

        const response =
          await apiGet<TranscriptRequestsResponse>(
            "/transcript-requests/my",
            accessToken,
          );

        setRequests(
          response.requests ?? [],
        );
      } catch (err) {
        console.error(
          "Load transcript requests error:",
          err,
        );
      } finally {
        setRequestLoading(false);
      }
    }, [accessToken]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (
      authStatus === "authenticated" &&
      accessToken
    ) {
      void loadTranscript();
      void loadRequests();
    }
  }, [
    authStatus,
    accessToken,
    loadTranscript,
    loadRequests,
  ]);

  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const latestRequest =
    requests[0] ?? null;

  const passedPercentage =
    transcript?.summary.totalCourses
      ? Math.round(
          (transcript.summary.passedCourses /
            transcript.summary.totalCourses) *
            100,
        )
      : 0;

  const creditPercentage =
    transcript?.summary.totalCredits
      ? Math.round(
          (transcript.summary.earnedCredits /
            transcript.summary.totalCredits) *
            100,
        )
      : 0;

  const gradeEntries = useMemo(
    () => {
      if (!transcript) return [];

      return (
        Object.entries(
          transcript.gradeDistribution,
        ) as [Grade, number][]
      ).map(
        ([grade, count]) => ({
          grade,
          count,
        }),
      );
    },
    [transcript],
  );

  /* =======================================================
     PRINT
  ======================================================= */

  const handlePrint = () => {
    window.print();
  };

  /* =======================================================
     REQUEST TRANSCRIPT
  ======================================================= */

  const submitTranscriptRequest =
    async () => {
      if (!accessToken) return;

      if (!purpose.trim()) {
        setRequestError(
          "Please enter the purpose of the transcript request.",
        );
        return;
      }

      try {
        setSubmittingRequest(true);
        setRequestError("");

        await apiPost(
          "/transcript-requests",
          {
            requestType,
            purpose:
              purpose.trim(),
            destination:
              destination.trim(),
          },
          accessToken,
        );

        setPurpose("");
        setDestination("");

        setShowRequestModal(false);

        await loadRequests();
      } catch (err) {
        console.error(
          "Submit transcript request error:",
          err,
        );

        setRequestError(
          err instanceof Error
            ? err.message
            : "Unable to submit transcript request.",
        );
      } finally {
        setSubmittingRequest(false);
      }
    };

  /* =======================================================
     AUTH LOADING
  ======================================================= */

  if (
    authStatus === "loading" ||
    loading
  ) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
        <div className="no-print pointer-events-none fixed inset-x-0 top-0 -z-0 h-[34rem] overflow-hidden">
          <div className="absolute -left-32 -top-36 h-96 w-96 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="absolute -right-32 top-8 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
        </div>
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold shadow-lg">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>

            <div className="text-center">
              <p className="font-semibold text-slate-900">
                Loading transcript
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Preparing your academic record...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4">
          <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <XCircle className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Unable to load transcript
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadTranscript(true)
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!transcript) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-area {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-card {
            box-shadow: none !important;
            border: 1px solid #d1d5db !important;
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="no-print relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#101d3b] via-brand-navy to-[#263d6d] text-white shadow-lg shadow-brand-navy/15">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] [background-size:20px_20px]" />
          <div className="relative mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboards/student"
                  aria-label="Return to dashboard"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-sm transition hover:-translate-x-0.5 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>

                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-gold" />

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                      Student Portal
                    </p>
                  </div>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    Academic Transcript
                  </h1>

                  <p className="mt-1 text-sm text-white/60">
                    Your official academic performance record
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    void loadTranscript(true)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
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

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-sm font-bold text-brand-navy shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Printer className="h-4 w-4" />
                  Print Transcript
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="print-area relative z-10 mx-auto max-w-[1600px] px-0 py-6 sm:px-0 lg:px-0 lg:py-10">
          {/* =================================================
              TRANSCRIPT DOCUMENT
          ================================================= */}

          <section className="print-card overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40">
            {/* ===============================================
                OFFICIAL HEADER
            =============================================== */}

            <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-[#132448] via-brand-navy to-[#0d172d] px-5 py-8 text-white sm:px-8 lg:px-10">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[28px] border-brand-gold/10" />
              <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
              <div className="relative flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-xl shadow-black/25 ring-1 ring-white/20">
                    <img
                      src="/newLogo.jpg"
                      alt="ITMT"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">
                      ITMT Management System
                    </p>

                    <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                      Academic Transcript
                    </h2>

                    <p className="mt-1 text-sm text-white/60">
                      Student Academic Record
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-center shadow-lg shadow-black/10 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                    Matriculation Number
                  </p>

                  <p className="mt-1 font-mono text-lg font-bold text-brand-gold">
                    {transcript.student.matricNumber ??
                      "Not assigned"}
                  </p>
                </div>
              </div>
            </div>

            {/* ===============================================
                STUDENT INFORMATION
            =============================================== */}

            <div className="border-b border-slate-200 p-5 sm:p-8 lg:p-10">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-8 w-1 rounded-full bg-brand-gold" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gold">Student profile</p>
                  <h3 className="text-lg font-bold text-brand-navy">Academic identity</h3>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <InfoItem
                  icon={UserRound}
                  label="Student Name"
                  value={
                    transcript.student.name
                  }
                />

                <InfoItem
                  icon={GraduationCap}
                  label="Programme"
                  value={
                    transcript.programme
                      ?.name ?? "Not assigned"
                  }
                />

                <InfoItem
                  icon={Award}
                  label="Award"
                  value={
                    transcript.programme
                      ?.award ?? "—"
                  }
                />

                <InfoItem
                  icon={BookOpen}
                  label="Level"
                  value={
                    transcript.student
                      .level ?? "—"
                  }
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Academic Session"
                  value={
                    transcript
                      .academicSession
                      ?.name ?? "—"
                  }
                />

                <InfoItem
                  icon={FileText}
                  label="Programme Code"
                  value={
                    transcript.programme
                      ?.code ?? "—"
                  }
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Programme Duration"
                  value={
                    transcript.programme
                      ?.durationYears
                      ? `${transcript.programme.durationYears} year${
                          transcript.programme.durationYears ===
                          1
                            ? ""
                            : "s"
                        }`
                      : "—"
                  }
                />

                <InfoItem
                  icon={ShieldCheck}
                  label="Record Status"
                  value="Published Results"
                />
              </div>
            </div>

            {/* ===============================================
                SUMMARY
            =============================================== */}

            <div className="bg-gradient-to-br from-slate-50 via-white to-[#f8f6ee] p-5 sm:p-8 lg:p-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                    Academic Summary
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Overall Performance
                  </h3>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-xs text-slate-400">
                    Cumulative GPA
                  </p>

                  <p className="text-3xl font-black text-brand-navy">
                    {transcript.summary.cgpa.toFixed(
                      2,
                    )}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <SummaryCard
                  icon={TrendingUp}
                  label="CGPA"
                  value={transcript.summary.cgpa.toFixed(
                    2,
                  )}
                  description="5.00 scale"
                  featured
                />

                <SummaryCard
                  icon={BookOpen}
                  label="Courses"
                  value={
                    transcript.summary.totalCourses
                  }
                  description={`${transcript.summary.passedCourses} passed`}
                />

                <SummaryCard
                  icon={CheckCircle2}
                  label="Credits Earned"
                  value={
                    transcript.summary.earnedCredits
                  }
                  description={`of ${transcript.summary.totalCredits} attempted`}
                />

                <SummaryCard
                  icon={CalendarDays}
                  label="Semesters"
                  value={
                    transcript.summary.totalSemesters
                  }
                  description="Published records"
                />

                <SummaryCard
                  icon={Award}
                  label="Pass Rate"
                  value={`${passedPercentage}%`}
                  description={`${transcript.summary.failedCourses} failed`}
                />
              </div>

              {/* CREDIT PROGRESS */}

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Credit Progress
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Earned credits compared with published attempted credits
                    </p>
                  </div>

                  <p className="text-sm font-black text-brand-navy">
                    {creditPercentage}%
                  </p>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-gold to-[#e4c878] transition-all"
                    style={{
                      width: `${Math.min(
                        creditPercentage,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ===============================================
                GRADE DISTRIBUTION
            =============================================== */}

            <div className="border-t border-slate-200 p-5 sm:p-8 lg:p-10">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                  Grade Distribution
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  Published Grade Record
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {gradeEntries.map(
                  ({
                    grade,
                    count,
                  }) => (
                    <div
                      key={grade}
                        className={`rounded-2xl border p-4 shadow-sm transition-transform hover:-translate-y-0.5 ${gradeClasses(
                        grade,
                      )}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black">
                          {grade}
                        </span>

                        <span className="text-sm font-bold">
                          {count}
                        </span>
                      </div>

                      <p className="mt-2 text-xs opacity-70">
                        Grade {grade}
                      </p>

                      <p className="mt-1 text-xs font-semibold">
                        {gradePointMap[grade]} point
                        {gradePointMap[
                          grade
                        ] === 1
                          ? ""
                          : "s"}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* ===============================================
                SEMESTERS
            =============================================== */}

            <div className="border-t border-slate-200 p-5 sm:p-8 lg:p-10">
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                  Academic Record
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  Semester Results
                </h3>
              </div>

              {transcript.semesters.length ===
              0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <FileText className="mx-auto h-10 w-10 text-slate-300" />

                  <p className="mt-4 font-semibold text-slate-700">
                    No published results yet
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Your transcript will appear here once results have been published.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {transcript.semesters.map(
                    (semester) => (
                      <section
                        key={
                          semester.id
                        }
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50"
                      >
                        {/* SEMESTER HEADER */}

                        <div className="relative flex flex-col gap-4 overflow-hidden bg-gradient-to-r from-brand-navy to-[#233967] px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
                          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full border-[18px] border-white/5" />
                          <div className="relative">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-brand-gold" />

                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                                {semester.session}
                              </p>
                            </div>

                            <h4 className="mt-1 text-lg font-bold">
                              {semester.name}
                            </h4>
                          </div>

                          <div className="relative flex flex-wrap gap-2">
                            <SemesterStat
                              label="GPA"
                              value={semester.gpa.toFixed(
                                2,
                              )}
                            />

                            <SemesterStat
                              label="Credits"
                              value={`${semester.earnedCredits}/${semester.attemptedCredits}`}
                            />
                          </div>
                        </div>

                        {/* DESKTOP TABLE */}

                        <div className="hidden overflow-x-auto md:block">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Code
                                </th>

                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Course Title
                                </th>

                                <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Units
                                </th>

                                <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Score
                                </th>

                                <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Grade
                                </th>

                                <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Point
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {semester.courses.map(
                                (
                                  course,
                                ) => (
                                  <tr
                                    key={
                                      course.id
                                    }
                                    className="border-b border-slate-100 last:border-0 transition-colors odd:bg-slate-50/40 hover:bg-brand-gold/10"
                                  >
                                    <td className="px-5 py-4 font-mono text-sm font-bold text-brand-navy">
                                      {
                                        course.code
                                      }
                                    </td>

                                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                      {
                                        course.title
                                      }
                                    </td>

                                    <td className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                                      {
                                        course.creditUnits
                                      }
                                    </td>

                                    <td className="px-5 py-4 text-center text-sm font-semibold text-slate-700">
                                      {
                                        course.score
                                      }
                                    </td>

                                    <td className="px-5 py-4 text-center">
                                      <span
                                        className={`inline-flex min-w-9 items-center justify-center rounded-lg border px-2 py-1 text-xs font-black ${gradeClasses(
                                          course.grade,
                                        )}`}
                                      >
                                        {
                                          course.grade
                                        }
                                      </span>
                                    </td>

                                    <td className="px-5 py-4 text-center text-sm font-bold text-brand-navy">
                                      {
                                        course.gradePoint
                                      }
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* MOBILE CARDS */}

                        <div className="divide-y divide-slate-100 md:hidden">
                          {semester.courses.map(
                            (
                              course,
                            ) => (
                              <div
                                key={
                                  course.id
                                }
                                className="p-4"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <p className="font-mono text-xs font-black text-brand-navy">
                                      {
                                        course.code
                                      }
                                    </p>

                                    <p className="mt-1 text-sm font-semibold leading-5 text-slate-800">
                                      {
                                        course.title
                                      }
                                    </p>
                                  </div>

                                  <span
                                    className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-black ${gradeClasses(
                                      course.grade,
                                    )}`}
                                  >
                                    {
                                      course.grade
                                    }
                                  </span>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                  <MobileValue
                                    label="Units"
                                    value={
                                      course.creditUnits
                                    }
                                  />

                                  <MobileValue
                                    label="Score"
                                    value={
                                      course.score
                                    }
                                  />

                                  <MobileValue
                                    label="Point"
                                    value={
                                      course.gradePoint
                                    }
                                  />
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </section>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* ===============================================
                TRANSCRIPT REQUEST
            =============================================== */}

            <div className="no-print border-t border-slate-200 bg-[#fbfcff] p-5 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                    Official Transcript
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Request an official copy
                  </h3>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Submit a transcript request for official processing by the administration.
                  </p>
                </div>

                {latestRequest ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div
                      className={`rounded-xl border px-4 py-3 ${statusClasses(
                        latestRequest.status,
                      )}`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                        Current Request
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        {statusLabel(
                          latestRequest.status,
                        )}
                      </p>
                    </div>

                    {latestRequest.status ===
                      "rejected" && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowRequestModal(
                            true,
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy/90"
                      >
                        Request Again
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setShowRequestModal(
                        true,
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-brand-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
                  >
                    <FileText className="h-4 w-4" />
                    Request Transcript
                  </button>
                )}
              </div>

              {latestRequest && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <RequestDetail
                      label="Request Type"
                      value={
                        latestRequest.requestType
                      }
                    />

                    <RequestDetail
                      label="Purpose"
                      value={
                        latestRequest.purpose
                      }
                    />

                    <RequestDetail
                      label="Destination"
                      value={
                        latestRequest.destination ||
                        "Not specified"
                      }
                    />

                    <RequestDetail
                      label="Requested"
                      value={formatDate(
                        latestRequest.requestedAt,
                      )}
                    />
                  </div>

                  {latestRequest.adminNote && (
                    <div className="mt-5 rounded-xl bg-blue-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        Administration Note
                      </p>

                      <p className="mt-1 text-sm leading-6 text-blue-900">
                        {
                          latestRequest.adminNote
                        }
                      </p>
                    </div>
                  )}

                  {latestRequest.rejectionReason && (
                    <div className="mt-5 rounded-xl bg-red-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                        Rejection Reason
                      </p>

                      <p className="mt-1 text-sm leading-6 text-red-900">
                        {
                          latestRequest.rejectionReason
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {requestLoading && (
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading request history...
                </div>
              )}
            </div>

            {/* ===============================================
                FOOTER
            =============================================== */}

            <div className="border-t border-slate-200 px-5 py-5 text-center sm:px-8">
              <p className="text-xs leading-5 text-slate-400">
                This transcript displays published academic
                results available in the ITMT Management System.
              </p>
            </div>
          </section>
        </main>

        {/* =================================================
            REQUEST MODAL
        ================================================= */}

        {showRequestModal && (
          <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="transcript-request-title">
              <div className="bg-brand-navy px-6 py-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                      Transcript Services
                    </p>

                    <h2 id="transcript-request-title" className="mt-1 text-xl font-bold">
                      Request Official Transcript
                    </h2>

                    <p className="mt-1 text-sm text-white/60">
                      Provide the details required for processing.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowRequestModal(
                        false,
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-5 p-6">
                {requestError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {requestError}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Request Type
                  </label>

                  <select
                    value={
                      requestType
                    }
                    onChange={(event) =>
                      setRequestType(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                  >
                    <option value="official">
                      Official Transcript
                    </option>

                    <option value="electronic">
                      Electronic Transcript
                    </option>

                    <option value="student-copy">
                      Student Copy
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Purpose
                  </label>

                  <textarea
                    value={purpose}
                    onChange={(event) =>
                      setPurpose(
                        event.target.value,
                      )
                    }
                    rows={4}
                    placeholder="e.g. Further studies, employment, professional registration..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Destination
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    value={
                      destination
                    }
                    onChange={(event) =>
                      setDestination(
                        event.target.value,
                      )
                    }
                    placeholder="Institution, company or recipient"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setShowRequestModal(
                        false,
                      )
                    }
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      submittingRequest
                    }
                    onClick={
                      submitTranscriptRequest
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingRequest ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-gold/40 hover:bg-white hover:shadow-md hover:shadow-slate-200/60">
      <div className="flex items-center gap-2 text-slate-400">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-brand-navy shadow-sm ring-1 ring-slate-200/70 transition-colors group-hover:bg-brand-navy group-hover:text-brand-gold">
          <Icon className="h-3.5 w-3.5" />
        </span>

        <p className="text-[10px] font-bold uppercase tracking-[0.15em]">
          {label}
        </p>
      </div>

      <p className="mt-2 truncate text-sm font-bold text-slate-800" title={value}>
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
  label,
  value,
  description,
  featured = false,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  description: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        featured
          ? "border-brand-gold/40 bg-gradient-to-br from-brand-navy to-[#263d6d] text-white shadow-brand-navy/20"
          : "border-slate-200 bg-white hover:border-brand-gold/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            featured
              ? "bg-white/10 text-brand-gold"
              : "bg-slate-100 text-brand-navy"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        {featured && (
          <ShieldCheck className="h-4 w-4 text-brand-gold" />
        )}
      </div>

      <p
        className={`mt-5 text-xs font-bold uppercase tracking-wider ${
          featured
            ? "text-white/50"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 text-3xl font-black ${
          featured
            ? "text-white"
            : "text-brand-navy"
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-1 text-xs ${
          featured
            ? "text-white/50"
            : "text-slate-400"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   SEMESTER STAT
========================================================= */

function SemesterStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
      <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-black text-brand-gold">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   MOBILE VALUE
========================================================= */

function MobileValue({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center ring-1 ring-inset ring-slate-100">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-brand-navy">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   REQUEST DETAIL
========================================================= */

function RequestDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}
