"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  GraduationCap,
  Megaphone,
  Receipt,
  Sparkles,
  WalletCards,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface StudentProgramme {
  _id?: string;
  name?: string;
  code?: string;
}

interface StudentAcademicSession {
  _id?: string;
  name?: string;
}

interface StudentUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  matricNumber?: string | null;
  level?: string | number | null;
  programme?: StudentProgramme | string | null;
  academicSession?: StudentAcademicSession | string | null;
}

interface StudentSession {
  user?: StudentUser;
}

/* =========================================================
   HELPERS
========================================================= */

function getProgrammeName(
  programme: StudentUser["programme"],
) {
  if (!programme) {
    return "Programme not assigned";
  }

  if (typeof programme === "string") {
    return programme;
  }

  return programme.name || "Programme not assigned";
}

function getProgrammeCode(
  programme: StudentUser["programme"],
) {
  if (
    !programme ||
    typeof programme === "string"
  ) {
    return "";
  }

  return programme.code || "";
}

function getSessionName(
  academicSession: StudentUser["academicSession"],
) {
  if (!academicSession) {
    return "Academic session not assigned";
  }

  if (typeof academicSession === "string") {
    return academicSession;
  }

  return (
    academicSession.name ||
    "Academic session not assigned"
  );
}

function getFirstName(name?: string | null) {
  if (!name?.trim()) {
    return "Student";
  }

  return name.trim().split(/\s+/)[0];
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

const quickActions = [
  {
    title: "Register Courses",
    description: "Manage your course registration.",
    href: "/dashboards/student/registration",
    icon: ClipboardList,
  },
  {
    title: "View Results",
    description:
      "Check your published academic results.",
    href: "/dashboards/student/results",
    icon: BarChart3,
  },
  {
    title: "My Attendance",
    description:
      "Review your attendance records.",
    href: "/dashboards/student/attendance",
    icon: CalendarCheck,
  },
  {
    title: "School Fees",
    description:
      "View your fees and payment information.",
    href: "/dashboards/student/finance",
    icon: WalletCards,
  },
];

/* =========================================================
   SKELETON COMPONENTS
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

function DarkSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded bg-white/10 ${className}`}
    />
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function StudentDashboardPage() {
  const { data: rawSession, status } =
    useSession();

  const session =
    rawSession as StudentSession | null;

  const student = session?.user;

  const firstName = getFirstName(student?.name);

  const programmeName = getProgrammeName(
    student?.programme,
  );

  const programmeCode = getProgrammeCode(
    student?.programme,
  );

  const academicSession = getSessionName(
    student?.academicSession,
  );

  const matricNumber =
    student?.matricNumber || "Not assigned";

  const level = student?.level
    ? String(student.level)
    : "Not assigned";

  /* =======================================================
     SKELETON LOADING
  ======================================================= */

  if (status === "loading") {
    return (
      <main className="min-h-full bg-slate-50">
        <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

          {/* =================================================
              WELCOME HERO SKELETON
          ================================================= */}

          <section className="overflow-hidden rounded-3xl bg-brand-navy shadow-xl shadow-slate-900/10">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

                <div className="w-full max-w-3xl space-y-5">
                  <DarkSkeleton className="h-7 w-32 rounded-full" />

                  <div className="space-y-3">
                    <DarkSkeleton className="h-10 w-3/4 rounded-xl sm:h-12 lg:h-14" />
                    <DarkSkeleton className="h-10 w-1/2 rounded-xl sm:h-12 lg:h-14" />
                  </div>

                  <div className="space-y-2 pt-1">
                    <DarkSkeleton className="h-3.5 w-full max-w-2xl" />
                    <DarkSkeleton className="h-3.5 w-5/6 max-w-xl" />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <DarkSkeleton className="h-9 w-44 rounded-xl" />
                    <DarkSkeleton className="h-9 w-24 rounded-xl" />
                  </div>
                </div>

                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex items-center gap-3">
                    <DarkSkeleton className="h-11 w-11 shrink-0 rounded-xl" />

                    <div className="min-w-0 flex-1 space-y-2">
                      <DarkSkeleton className="h-3.5 w-28" />
                      <DarkSkeleton className="h-3 w-36" />
                    </div>

                    <DarkSkeleton className="ml-auto h-2.5 w-2.5 rounded-full" />
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* =================================================
              STUDENT INFORMATION SKELETON
          ================================================= */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-3">
                      <Skeleton className="h-2.5 w-24" />
                      <Skeleton className="h-4 w-32" />

                      {index === 1 && (
                        <Skeleton className="h-2.5 w-16 bg-slate-100" />
                      )}
                    </div>

                    <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
                  </div>
                </div>
              ),
            )}
          </section>

          {/* =================================================
              ACADEMIC OVERVIEW SKELETON
          ================================================= */}

          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">

            {/* Academic Overview */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="space-y-3">
                    <Skeleton className="h-2.5 w-28" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-64 bg-slate-100" />
                  </div>

                  <Skeleton className="h-4 w-32 bg-slate-100" />
                </div>
              </div>

              <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
                {Array.from({ length: 4 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="bg-white p-5 sm:p-6"
                    >
                      <div className="flex items-start justify-between">
                        <Skeleton className="h-11 w-11 rounded-xl bg-slate-100" />
                        <Skeleton className="h-4 w-4 bg-slate-100" />
                      </div>

                      <div className="mt-5 space-y-3">
                        <Skeleton className="h-4 w-32" />

                        <div className="space-y-2">
                          <Skeleton className="h-2.5 w-full bg-slate-100" />
                          <Skeleton className="h-2.5 w-4/5 bg-slate-100" />
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Profile */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-5 w-36" />
                </div>

                <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
              </div>

              <div className="mt-6 space-y-4">
                {Array.from({ length: 3 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <Skeleton className="h-2.5 w-20" />

                      <Skeleton className="mt-2.5 h-3.5 w-3/4" />
                    </div>
                  ),
                )}
              </div>

              <Skeleton className="mt-5 h-11 w-full rounded-xl bg-slate-100" />
            </div>
          </section>

          {/* =================================================
              QUICK ACTIONS SKELETON
          ================================================= */}

          <section>
            <div className="mb-4 space-y-3">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-5 w-52" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
                      <Skeleton className="h-4 w-4 bg-slate-100" />
                    </div>

                    <Skeleton className="mt-5 h-4 w-32" />

                    <div className="mt-2 space-y-2">
                      <Skeleton className="h-2.5 w-full bg-slate-100" />
                      <Skeleton className="h-2.5 w-4/5 bg-slate-100" />
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* =================================================
              ATTENDANCE + FINANCE SKELETON
          ================================================= */}

          <section className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-9 rounded-lg bg-slate-100" />
                      <Skeleton className="h-4 w-24" />
                    </div>

                    <Skeleton className="h-3 w-8 bg-slate-100" />
                  </div>

                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-2.5 w-full bg-slate-100" />
                    <Skeleton className="h-2.5 w-4/5 bg-slate-100" />
                  </div>

                  {index === 0 ? (
                    <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-xl bg-white" />

                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3.5 w-32" />
                          <Skeleton className="h-2.5 w-44 bg-slate-100" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {Array.from({ length: 2 }).map(
                        (_, cardIndex) => (
                          <div
                            key={cardIndex}
                            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                          >
                            <Skeleton className="h-5 w-5 bg-slate-200" />

                            <Skeleton className="mt-3 h-3.5 w-24" />

                            <Skeleton className="mt-2 h-2.5 w-32 bg-slate-100" />
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ),
            )}
          </section>

          {/* =================================================
              COMMUNICATION SKELETON
          ================================================= */}

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

            {/* Announcements */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>

                <Skeleton className="h-4 w-20 bg-slate-100" />
              </div>

              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-6">
                <Skeleton className="mx-auto h-12 w-12 rounded-2xl bg-white" />

                <Skeleton className="mx-auto mt-4 h-4 w-40" />

                <Skeleton className="mx-auto mt-2 h-2.5 w-full max-w-sm bg-slate-100" />

                <Skeleton className="mx-auto mt-2 h-2.5 w-4/5 max-w-xs bg-slate-100" />
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>

                <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
              </div>

              <div className="mt-5 space-y-3">
                {Array.from({ length: 2 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <Skeleton className="h-9 w-9 shrink-0 rounded-lg bg-white" />

                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-2.5 w-44 bg-slate-100" />
                      </div>

                      <Skeleton className="h-4 w-4 bg-slate-100" />
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              FOOTER SKELETON
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2.5 w-64 bg-slate-100" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-10 w-24 rounded-xl bg-slate-100" />
                <Skeleton className="h-10 w-24 rounded-xl bg-slate-100" />
              </div>

            </div>
          </section>
        </div>
      </main>
    );
  }

  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <main className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1600px] space-y-6 px-0 py-5 sm:px-0 lg:px-0 lg:py-7">

        {/* =================================================
            WELCOME HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-brand-navy shadow-xl shadow-slate-900/10">

          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

              <div className="max-w-3xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-brand-gold" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                    Student Portal
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Welcome back,{" "}
                  <span className="text-brand-gold">
                    {firstName}
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
                  Stay on top of your academic
                  journey, course registration,
                  results, attendance and
                  student information from one
                  place.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">

                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2">
                    <GraduationCap className="h-4 w-4 text-brand-gold" />

                    <span className="text-xs font-medium text-white/75">
                      {programmeName}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                      Level
                    </span>

                    <span className="text-xs font-semibold text-white/75">
                      {level}
                    </span>
                  </div>

                </div>
              </div>

              <div className="w-full max-w-sm lg:w-auto">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white">
                        Student account
                      </p>

                      <p className="mt-0.5 text-[11px] text-white/40">
                        Your portal is ready
                      </p>
                    </div>

                    <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />

                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =================================================
            STUDENT INFORMATION
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Matric Number */}

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Matric Number
                </p>

                <p className="mt-3 break-all text-sm font-bold text-brand-navy">
                  {matricNumber}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                <GraduationCap className="h-5 w-5" />
              </div>

            </div>
          </div>

          {/* Programme */}

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Programme
                </p>

                <p className="mt-3 truncate text-sm font-bold text-brand-navy">
                  {programmeName}
                </p>

                {programmeCode && (
                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    {programmeCode}
                  </p>
                )}
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                <BookOpen className="h-5 w-5" />
              </div>

            </div>
          </div>

          {/* Academic Session */}

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Academic Session
                </p>

                <p className="mt-3 truncate text-sm font-bold text-brand-navy">
                  {academicSession}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock3 className="h-5 w-5" />
              </div>

            </div>
          </div>

          {/* Level */}

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Current Level
                </p>

                <p className="mt-3 text-sm font-bold text-brand-navy">
                  {level}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BarChart3 className="h-5 w-5" />
              </div>

            </div>
          </div>

        </section>

        {/* =================================================
            ACADEMIC OVERVIEW
        ================================================= */}

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">

          {/* Academic card */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Academic Overview
                </p>

                <h2 className="mt-1 text-lg font-bold tracking-tight text-brand-navy">
                  Your academic journey
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Access the areas that matter most
                  to your studies.
                </p>
              </div>

              <Link
                href="/dashboards/student/progress"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-navy transition hover:text-brand-gold"
              >
                Academic progress
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

            </div>

            <div className="grid gap-px bg-slate-100 sm:grid-cols-2">

              {/* Courses */}

              <Link
                href="/dashboards/student/courses"
                className="group bg-white p-5 transition hover:bg-slate-50 sm:p-6"
              >
                <div className="flex items-start justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy transition group-hover:bg-brand-navy group-hover:text-white">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-gold" />

                </div>

                <p className="mt-5 text-sm font-bold text-brand-navy">
                  My Courses
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  View the courses associated with
                  your academic programme.
                </p>
              </Link>

              {/* Registration */}

              <Link
                href="/dashboards/student/registration"
                className="group bg-white p-5 transition hover:bg-slate-50 sm:p-6"
              >
                <div className="flex items-start justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold transition group-hover:bg-brand-gold group-hover:text-brand-navy">
                    <ClipboardList className="h-5 w-5" />
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-gold" />

                </div>

                <p className="mt-5 text-sm font-bold text-brand-navy">
                  Course Registration
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Register and manage your academic
                  courses for the semester.
                </p>
              </Link>

              {/* Results */}

              <Link
                href="/dashboards/student/results"
                className="group bg-white p-5 transition hover:bg-slate-50 sm:p-6"
              >
                <div className="flex items-start justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <BarChart3 className="h-5 w-5" />
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-gold" />

                </div>

                <p className="mt-5 text-sm font-bold text-brand-navy">
                  Results
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Review your published academic
                  performance.
                </p>
              </Link>

              {/* Transcript */}

              <Link
                href="/dashboards/student/transcript"
                className="group bg-white p-5 transition hover:bg-slate-50 sm:p-6"
              >
                <div className="flex items-start justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                    <FileText className="h-5 w-5" />
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-gold" />

                </div>

                <p className="mt-5 text-sm font-bold text-brand-navy">
                  Transcript
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Access your academic transcript
                  information.
                </p>
              </Link>

            </div>
          </div>

          {/* Student Profile */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Student Profile
                </p>

                <h2 className="mt-1 text-lg font-bold text-brand-navy">
                  Account overview
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                <GraduationCap className="h-5 w-5" />
              </div>

            </div>

            <div className="mt-6 space-y-4">

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Full Name
                </p>

                <p className="mt-1.5 truncate text-sm font-semibold text-slate-800">
                  {student?.name || "Student"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </p>

                <p className="mt-1.5 truncate text-sm font-semibold text-slate-800">
                  {student?.email ||
                    "Email not available"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Academic Level
                </p>

                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                  {level}
                </p>
              </div>

            </div>

            <Link
              href="/dashboards/student/profile"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-brand-navy transition hover:border-brand-gold/40 hover:bg-brand-gold/5 hover:text-brand-gold"
            >
              View my profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

          </div>
        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section>

          <div className="mb-4 flex items-end justify-between gap-4">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                Quick Access
              </p>

              <h2 className="mt-1 text-lg font-bold tracking-tight text-brand-navy">
                Frequently used services
              </h2>
            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-brand-navy transition group-hover:bg-brand-gold/10 group-hover:text-brand-gold">
                      <Icon className="h-5 w-5" />
                    </div>

                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-gold" />

                  </div>

                  <h3 className="mt-5 text-sm font-bold text-brand-navy">
                    {action.title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-400">
                    {action.description}
                  </p>
                </Link>
              );
            })}

          </div>
        </section>

        {/* =================================================
            ATTENDANCE + FINANCE
        ================================================= */}

        <section className="grid gap-6 lg:grid-cols-2">

          {/* Attendance */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between gap-4">

              <div>
                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy/5 text-brand-navy">
                    <CalendarCheck className="h-4 w-4" />
                  </div>

                  <p className="text-sm font-bold text-brand-navy">
                    Attendance
                  </p>

                </div>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Your attendance records will appear
                  here once attendance data is available.
                </p>
              </div>

              <Link
                href="/dashboards/student/attendance"
                className="shrink-0 text-xs font-semibold text-brand-navy hover:text-brand-gold"
              >
                View
              </Link>

            </div>

            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                  <CalendarCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Attendance summary
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Waiting for current attendance
                    records
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* Finance */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between gap-4">

              <div>
                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold/10 text-brand-gold">
                    <WalletCards className="h-4 w-4" />
                  </div>

                  <p className="text-sm font-bold text-brand-navy">
                    Finance
                  </p>

                </div>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Your school fee and payment information
                  can be accessed from the finance section.
                </p>
              </div>

              <Link
                href="/dashboards/student/finance"
                className="shrink-0 text-xs font-semibold text-brand-navy hover:text-brand-gold"
              >
                View
              </Link>

            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <Link
                href="/dashboards/student/finance"
                className="group rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-brand-gold/20 hover:bg-brand-gold/5"
              >
                <WalletCards className="h-5 w-5 text-brand-gold" />

                <p className="mt-3 text-xs font-bold text-slate-700">
                  School Fees
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  View fee information
                </p>
              </Link>

              <Link
                href="/dashboards/student/payments"
                className="group rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-brand-gold/20 hover:bg-brand-gold/5"
              >
                <Receipt className="h-5 w-5 text-brand-navy" />

                <p className="mt-3 text-xs font-bold text-slate-700">
                  Payments
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  View payment history
                </p>
              </Link>

            </div>
          </div>
        </section>

        {/* =================================================
            COMMUNICATION
        ================================================= */}

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

          {/* Announcements */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between gap-4">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Communication
                </p>

                <h2 className="mt-1 text-lg font-bold text-brand-navy">
                  Announcements
                </h2>
              </div>

              <Link
                href="/dashboards/student/announcements"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:text-brand-gold"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

            </div>

            <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <Megaphone className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                No announcements loaded
              </p>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                New institutional announcements will
                appear here when the student
                communication API is connected.
              </p>

            </div>
          </div>

          {/* Notifications */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between gap-4">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Notifications
                </p>

                <h2 className="mt-1 text-lg font-bold text-brand-navy">
                  Stay informed
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                <Megaphone className="h-4 w-4" />
              </div>

            </div>

            <div className="mt-5 space-y-3">

              <Link
                href="/dashboards/student/notifications"
                className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-brand-gold/20 hover:bg-brand-gold/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-gold shadow-sm">
                  <Megaphone className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700">
                    View notifications
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Check important updates
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-gold" />
              </Link>

              <Link
                href="/dashboards/student/announcements"
                className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-brand-gold/20 hover:bg-brand-gold/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-navy shadow-sm">
                  <Megaphone className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700">
                    Read announcements
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    View institutional updates
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-gold" />
              </Link>

            </div>
          </div>
        </section>

        {/* =================================================
            FOOTER INFORMATION
        ================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-brand-navy">
                  ITMT Student Portal
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Your central access point for academic
                  and student services.
                </p>
              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              <Link
                href="/dashboards/student/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-brand-gold/30 hover:text-brand-gold"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Profile
              </Link>

              <Link
                href="/dashboards/student/settings"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-brand-gold/30 hover:text-brand-gold"
              >
                Settings
              </Link>

            </div>

          </div>
        </section>

      </div>
    </main>
  );
}