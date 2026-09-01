import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  ShieldAlert,
  Users,
  UserCog,
  FileText,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import type { ComponentType } from "react";

import { authOptions } from "@/auth";
import { apiGet } from "@/lib/api";
import { getAuditLogs, type AuditLog } from "@/lib/admin-audit-logs";

/* ============================================================
   TYPES
============================================================ */

interface UsersResponse {
  success: boolean;
  users?: Array<{
    _id: string;
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
  }>;
  message?: string;
}

interface CoursesResponse {
  success: boolean;
  courses?: Array<{
    _id: string;
    code?: string;
    title?: string;
    isActive?: boolean;
  }>;
  message?: string;
}

interface RegistrationsResponse {
  success: boolean;
  registrations?: Array<{
    _id: string;
    status?: string;
  }>;
  message?: string;
}

interface DepartmentsResponse {
  success: boolean;
  departments?: Array<{
    _id: string;
    name?: string;
  }>;
  message?: string;
}

interface ProgrammesResponse {
  success: boolean;
  programmes?: Array<{
    _id: string;
    name?: string;
  }>;
  message?: string;
}

interface AdmissionsResponse {
  success: boolean;
  data?: {
    items?: Array<{
      _id: string;
      status?: string;
      applicationNumber?: string;
      surname?: string;
      otherNames?: string;
      email?: string;
    }>;
    total?: number;
  };
  message?: string;
}

interface AcademicSessionsResponse {
  success: boolean;
  sessions?: Array<{
    _id: string;
    name?: string;
    isActive?: boolean;
  }>;
  message?: string;
}

/* ============================================================
   PAGE
============================================================ */

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  /* ==========================================================
     AUTHENTICATION
  ========================================================== */

  const token =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  /*
   * getServerSession() can return null.
   * Therefore session must always be accessed safely.
   */
  const adminName =
    session?.user?.name?.trim().split(" ")[0] ||
    "Administrator";

  /* ==========================================================
     AUTH ERROR
  ========================================================== */

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center px-6">
        <div className="w-full rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

            <div>
              <h1 className="font-semibold text-red-800 dark:text-red-300">
                Authentication Error
              </h1>

              <p className="mt-1 text-sm leading-6 text-red-700/80 dark:text-red-400">
                Your administrator session could not be verified.
                Please sign in again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     API REQUESTS
  ========================================================== */

  const [
    studentsRes,
    lecturersRes,
    coursesRes,
    registrationsRes,
    departmentsRes,
    programmesRes,
    admissionsRes,
    sessionsRes,
    auditLogsRes,
  ] = await Promise.all([
    apiGet<UsersResponse>(
      "/users?role=student",
      token,
    ),

    apiGet<UsersResponse>(
      "/users?role=lecturer",
      token,
    ),

    apiGet<CoursesResponse>(
      "/courses",
      token,
    ),

    apiGet<RegistrationsResponse>(
      "/registrations",
      token,
    ),

    apiGet<DepartmentsResponse>(
      "/departments",
      token,
    ),

    apiGet<ProgrammesResponse>(
      "/programmes",
      token,
    ),

    apiGet<AdmissionsResponse>(
      "/admissions",
      token,
    ),

    apiGet<AcademicSessionsResponse>(
      "/academic-sessions",
      token,
    ),

    getAuditLogs(token, { limit: 5 }),
  ]);

  /* ==========================================================
     SAFE DATA
  ========================================================== */

  const students =
    studentsRes?.users ?? [];

  const lecturers =
    lecturersRes?.users ?? [];

  const courses =
    coursesRes?.courses ?? [];

  const registrations =
    registrationsRes?.registrations ?? [];

  const departments =
    departmentsRes?.departments ?? [];

  const programmes =
    programmesRes?.programmes ?? [];

  const admissions =
    admissionsRes?.data?.items ?? [];

  const sessions =
    sessionsRes?.sessions ?? [];

  const recentAuditLogs =
    auditLogsRes?.data?.items ?? [];

  /* ==========================================================
     CALCULATED STATISTICS
  ========================================================== */

  const activeStudents =
    students.filter(
      (student) =>
        student.isActive !== false,
    ).length;

  const activeLecturers =
    lecturers.filter(
      (lecturer) =>
        lecturer.isActive !== false,
    ).length;

  const activeCourses =
    courses.filter(
      (course) =>
        course.isActive !== false,
    ).length;

  const pendingAdmissions =
    admissions.filter(
      (application) =>
        application.status?.toLowerCase() ===
        "pending",
    ).length;

  const activeSession =
    sessions.find(
      (academicSession) =>
        academicSession.isActive === true,
    );

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 pb-10">

      {/* ======================================================
          HERO
      ======================================================= */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-lg">

        {/* Decorative glow */}

        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="pointer-events-none absolute right-20 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-brand-gold/10" />

        <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">

          {/* Hero content */}

          <div className="max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">

              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

              ITMT Administration

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Good to see you, {adminName}.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
              Manage students, staff, academic programmes,
              courses, admissions, results and institutional
              operations from one place.
            </p>

          </div>

          {/* Current session */}

          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gold/15">
              <CalendarDays className="h-5 w-5 text-brand-gold" />
            </div>

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Current Session
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {activeSession?.name ??
                  "No active session"}
              </p>

              <div className="mt-1.5 flex items-center gap-1.5">

                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    activeSession
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                  }`}
                />

                <span className="text-[11px] text-white/45">
                  {activeSession
                    ? "Active"
                    : "Not configured"}
                </span>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ======================================================
          INSTITUTION OVERVIEW
      ======================================================= */}

      <section>

        <SectionHeading
          title="Institution Overview"
          description="A live snapshot of the institution's core activities."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <PremiumStatCard
            title="Students"
            value={activeStudents}
            description="Active student accounts"
            icon={GraduationCap}
            href="/dashboards/admin/students"
            tone="blue"
          />

          <PremiumStatCard
            title="Lecturers"
            value={activeLecturers}
            description="Active teaching staff"
            icon={UserCog}
            href="/dashboards/admin/lecturers"
            tone="violet"
          />

          <PremiumStatCard
            title="Courses"
            value={activeCourses}
            description="Active academic courses"
            icon={BookOpen}
            href="/dashboards/admin/courses"
            tone="emerald"
          />

          <PremiumStatCard
            title="Registrations"
            value={registrations.length}
            description="Course registrations"
            icon={ClipboardList}
            href="/dashboards/admin/registrations"
            tone="amber"
          />

        </div>
      </section>

      {/* ======================================================
          ADMINISTRATION SUMMARY
      ======================================================= */}

      <section>

        <SectionHeading
          title="Administration Summary"
          description="Key areas of the institution that may require attention."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Admissions"
            label="Pending applications"
            value={pendingAdmissions}
            icon={ClipboardList}
            href="/dashboards/admin/admissions"
            tone="rose"
          />

          <SummaryCard
            title="Departments"
            label="Academic departments"
            value={departments.length}
            icon={Building2}
            href="/dashboards/admin/departments"
            tone="indigo"
          />

          <SummaryCard
            title="Programmes"
            label="Academic programmes"
            value={programmes.length}
            icon={GraduationCap}
            href="/dashboards/admin/programmes"
            tone="teal"
          />

          <SummaryCard
            title="Sessions"
            label="Academic sessions"
            value={sessions.length}
            icon={CalendarDays}
            href="/dashboards/admin/academic-sessions"
            tone="cyan"
          />

        </div>
      </section>

      {/* ======================================================
          MANAGEMENT AREAS
      ======================================================= */}

      <section>

        <SectionHeading
          title="Management Areas"
          description="Quick access to the core administrative functions."
        />

        <div className="grid gap-6 lg:grid-cols-2">

          <ManagementCard
            title="Academic Management"
            description="Build and maintain the academic structure of ITMT."
            icon={GraduationCap}
            href="/dashboards/admin/departments"
            items={[
              {
                label: "Departments",
                value: departments.length,
              },
              {
                label: "Programmes",
                value: programmes.length,
              },
              {
                label: "Courses",
                value: courses.length,
              },
              {
                label: "Sessions",
                value: sessions.length,
              },
            ]}
          />

          <ManagementCard
            title="People & Operations"
            description="Monitor students, lecturers and academic activity."
            icon={Users}
            href="/dashboards/admin/students"
            items={[
              {
                label: "Students",
                value: students.length,
              },
              {
                label: "Lecturers",
                value: lecturers.length,
              },
              {
                label: "Registrations",
                value: registrations.length,
              },
              {
                label: "Admissions",
                value: admissions.length,
              },
            ]}
          />

        </div>
      </section>

      {/* ======================================================
          ATTENTION AREA
      ======================================================= */}

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">

        {/* ====================================================
            SYSTEM ACTIVITY
        ===================================================== */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-brand-dark">

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-white/10">

            <div>

              <h2 className="text-base font-semibold text-brand-navy dark:text-white">
                System Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                A summary of the latest administrative activity.
              </p>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy dark:bg-white/10 dark:text-brand-gold">
              <FileBarChart className="h-5 w-5" />
            </div>

          </div>

          <div className="p-6">
            {recentAuditLogs.length === 0 ? (
              <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center dark:border-white/10 dark:bg-white/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/5 dark:bg-white/10">
                  <CheckCircle2 className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  No recent activity
                </p>
                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                  Administrative actions will appear here as they occur.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAuditLogs.map((log: AuditLog) => (
                  <div
                    key={log._id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/5 text-brand-navy dark:bg-white/10 dark:text-brand-gold">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-white">
                        {log.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{log.actorName || log.actor?.name || "System"}</span>
                        <span>•</span>
                        <span className="capitalize">{log.action.toLowerCase()}</span>
                        <span>•</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Link
                  href="/dashboards/admin/audit-logs"
                  className="mt-4 block text-center text-sm font-medium text-brand-navy hover:text-brand-navy/80 dark:text-brand-gold dark:hover:text-brand-gold/80"
                >
                  View all activity →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================
            NEEDS ATTENTION
        ===================================================== */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-brand-dark">

          <div className="border-b border-slate-100 px-6 py-5 dark:border-white/10">

            <h2 className="text-base font-semibold text-brand-navy dark:text-white">
              Needs Attention
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Items that may require administrative action.
            </p>

          </div>

          <div className="space-y-3 p-6">

            <AttentionItem
              label="Pending Admissions"
              value={pendingAdmissions}
              href="/dashboards/admin/admissions"
              tone="rose"
            />

            <AttentionItem
              label="Active Session"
              value={
                activeSession?.name ??
                "Not configured"
              }
              href="/dashboards/admin/academic-sessions"
              tone="blue"
            />

            <AttentionItem
              label="Active Courses"
              value={activeCourses}
              href="/dashboards/admin/courses"
              tone="emerald"
            />

          </div>

        </div>

      </section>

    </div>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">

      <h2 className="text-lg font-semibold tracking-tight text-brand-navy dark:text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   PREMIUM STAT CARD
============================================================ */

function PremiumStatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  tone,
}: {
  title: string;
  value: number;
  description: string;
  icon: ComponentType<{
    className?: string;
  }>;
  href: string;
  tone:
    | "blue"
    | "violet"
    | "emerald"
    | "amber";
}) {
  const styles = {
    blue: {
      icon: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      glow: "group-hover:bg-blue-500/5",
      value: "text-blue-700 dark:text-blue-400",
    },

    violet: {
      icon: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
      glow: "group-hover:bg-violet-500/5",
      value: "text-violet-700 dark:text-violet-400",
    },

    emerald: {
      icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      glow: "group-hover:bg-emerald-500/5",
      value: "text-emerald-700 dark:text-emerald-400",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      glow: "group-hover:bg-amber-500/5",
      value: "text-amber-700 dark:text-amber-400",
    },
  }[tone];

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-brand-dark ${styles.glow}`}
    >

      <div className="relative flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <ArrowRight className="h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-navy dark:text-slate-600 dark:group-hover:text-brand-gold" />

      </div>

      <div className="relative mt-6">

        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </p>

        <p
          className={`mt-1 text-3xl font-bold tracking-tight ${styles.value}`}
        >
          {value.toLocaleString()}
        </p>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>

      </div>

    </Link>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  title,
  label,
  value,
  icon: Icon,
  href,
  tone,
}: {
  title: string;
  label: string;
  value: number;
  icon: ComponentType<{
    className?: string;
  }>;
  href: string;
  tone:
    | "rose"
    | "indigo"
    | "teal"
    | "cyan";
}) {
  const styles = {
    rose: {
      icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
      value: "text-rose-600 dark:text-rose-400",
    },

    indigo: {
      icon: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
      value: "text-indigo-600 dark:text-indigo-400",
    },

    teal: {
      icon: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
      value: "text-teal-600 dark:text-teal-400",
    },

    cyan: {
      icon: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
      value: "text-cyan-600 dark:text-cyan-400",
    },
  }[tone];

  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-brand-dark dark:hover:border-slate-700"
    >

      <div className="flex items-center gap-4">

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center justify-between gap-3">

            <p className="text-sm font-semibold text-brand-navy dark:text-white">
              {title}
            </p>

            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 dark:text-slate-600" />

          </div>

          <div className="mt-1 flex items-baseline gap-2">

            <span
              className={`text-xl font-bold ${styles.value}`}
            >
              {value.toLocaleString()}
            </span>

            <span className="truncate text-xs text-slate-400">
              {label}
            </span>

          </div>

        </div>

      </div>

    </Link>
  );
}

/* ============================================================
   MANAGEMENT CARD
============================================================ */

function ManagementCard({
  title,
  description,
  icon: Icon,
  href,
  items,
}: {
  title: string;
  description: string;
  icon: ComponentType<{
    className?: string;
  }>;
  href: string;
  items: Array<{
    label: string;
    value: number;
  }>;
}) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-brand-dark">

      <div className="p-6">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy dark:bg-brand-gold/10 dark:text-brand-gold">
              <Icon className="h-5 w-5" />
            </div>

            <div>

              <h3 className="font-semibold text-brand-navy dark:text-white">
                {title}
              </h3>

              <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                {description}
              </p>

            </div>

          </div>

          <Link
            href={href}
            aria-label={`Open ${title}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-brand-navy hover:bg-brand-navy hover:text-white dark:border-white/10 dark:hover:border-brand-gold dark:hover:bg-brand-gold dark:hover:text-brand-navy"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">

          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5"
            >

              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {item.label}
              </p>

              <p className="mt-1 text-lg font-bold text-brand-navy dark:text-white">
                {item.value.toLocaleString()}
              </p>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

/* ============================================================
   ATTENTION ITEM
============================================================ */

function AttentionItem({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number | string;
  href: string;
  tone:
    | "rose"
    | "blue"
    | "emerald";
}) {
  const styles = {
    rose: {
      dot: "bg-rose-500",
      icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    },

    blue: {
      dot: "bg-blue-500",
      icon: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    },

    emerald: {
      dot: "bg-emerald-500",
      icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
  }[tone];

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-slate-200 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
    >

      <div
        className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`}
      />

      <div className="min-w-0 flex-1">

        <p className="truncate text-sm font-medium text-brand-navy dark:text-white">
          {label}
        </p>

      </div>

      <span
        className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${styles.icon}`}
      >
        {value}
      </span>

      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 dark:text-slate-600" />

    </Link>
  );
}