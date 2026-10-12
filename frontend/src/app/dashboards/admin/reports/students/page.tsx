"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type StudentsByLevel = {
  _id: string;
  count: number;
};

type StudentsByProgramme = {
  _id: string;
  name: string;
  code: string;
  studentCount: number;
  isActive: boolean;
};

type StudentPerformance = {
  _id: string;
  studentName: string;
  matricNumber?: string;
  totalResults: number;
  averageScore: number;
  passed: number;
  failed: number;
  passRate: number;
};

type RecentStudent = {
  _id: string;
  name: string;
  email: string;
  matricNumber?: string;
  level?: string;
  isActive: boolean;
  programme?: {
    name: string;
    code: string;
  };
  createdAt: string;
};

type StudentReportResponse = {
  success: boolean;
  data?: {
    statistics: {
      totalStudents: number;
      activeStudents: number;
      suspendedStudents: number;
      studentsWithMatric: number;
      studentsByLevel: StudentsByLevel[];
    };
    studentsByProgramme: StudentsByProgramme[];
    studentPerformance: StudentPerformance[];
    recentStudents: RecentStudent[];
  };
  message?: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function AdminStudentReportPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  const [report, setReport] =
    useState<StudentReportResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* =========================================================
     LOAD REPORT
  ========================================================= */

  const loadReport = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setLoading(false);
        setRefreshing(false);

        if (sessionStatus === "unauthenticated") {
          setErrorMessage(
            "Your session has expired. Please sign in again.",
          );
        }

        return;
      }

      try {
        setErrorMessage(null);

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await apiGet<StudentReportResponse>(
            "/reports/students",
            accessToken,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to load student report.",
          );
        }

        setReport(response);
      } catch (error) {
        console.error(
          "Load student report error:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load student report.";

        setErrorMessage(message);

        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, sessionStatus],
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (sessionStatus === "unauthenticated") {
      setLoading(false);

      setErrorMessage(
        "Your session has expired. Please sign in again.",
      );

      return;
    }

    if (
      sessionStatus === "authenticated" &&
      accessToken
    ) {
      void loadReport();
    }
  }, [sessionStatus, accessToken, loadReport]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics = report?.data?.statistics ?? {
    totalStudents: 0,
    activeStudents: 0,
    suspendedStudents: 0,
    studentsWithMatric: 0,
    studentsByLevel: [],
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    sessionStatus === "loading" ||
    loading
  ) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <p className="text-sm text-slate-500">
            Loading student report...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    errorMessage &&
    !report
  ) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center px-4">
        <Card className="w-full border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-brand-dark">
              Unable to load student report
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {errorMessage}
            </p>

            <Button
              type="button"
              onClick={() =>
                void loadReport(true)
              }
              className="mt-6 rounded-xl bg-brand-navy text-white hover:bg-brand-navy/95"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      {/* HERO */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-brand-gold" />

              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                Student Analytics
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Student Report
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Comprehensive student performance data including
              enrollment statistics, programme distribution,
              and academic performance metrics.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void loadReport(true)
            }
            disabled={refreshing}
            className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>
        </div>
      </section>

      {/* STUDENT STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard
          title="Total Students"
          value={statistics.totalStudents}
          description="All registered students"
          icon={
            <Users className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-brand-navy/10"
        />

        <ReportStatCard
          title="Active Students"
          value={statistics.activeStudents}
          description="Currently enrolled"
          icon={
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          }
          iconClass="bg-emerald-50"
          valueClass="text-emerald-600"
        />

        <ReportStatCard
          title="Suspended"
          value={statistics.suspendedStudents}
          description="Currently suspended"
          icon={
            <XCircle className="h-5 w-5 text-red-500" />
          }
          iconClass="bg-red-50"
          valueClass="text-red-500"
        />

        <ReportStatCard
          title="With Matric"
          value={statistics.studentsWithMatric}
          description="Assigned matric numbers"
          icon={
            <GraduationCap className="h-5 w-5 text-brand-gold" />
          }
          iconClass="bg-brand-gold/10"
        />
      </div>

      {/* STUDENTS BY LEVEL */}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <CardTitle className="text-base font-semibold text-brand-dark">
            Students by Level
          </CardTitle>

          <p className="mt-1 text-xs text-slate-500">
            Distribution of students across academic levels
          </p>
        </CardHeader>

        <CardContent className="p-5">
          {statistics.studentsByLevel.length ===
          0 ? (
            <EmptyReportState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statistics.studentsByLevel.map(
                (level) => (
                  <div
                    key={level._id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {level._id || "Unassigned"}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-brand-dark">
                      {level.count}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      students
                    </p>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* STUDENTS BY PROGRAMME */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <CardTitle className="text-base font-semibold text-brand-dark">
            Students by Programme
          </CardTitle>

          <p className="mt-1 text-xs text-slate-500">
            Student distribution across programmes
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {report?.data?.studentsByProgramme?.length ===
          0 ? (
            <EmptyReportState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Programme
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Code
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Students
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {report?.data?.studentsByProgramme?.map(
                    (programme) => (
                      <tr
                        key={programme._id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-brand-dark">
                            {programme.name}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {programme.code}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-brand-dark">
                            {programme.studentCount}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {programme.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* STUDENT PERFORMANCE */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <CardTitle className="text-base font-semibold text-brand-dark">
            Top Student Performance
          </CardTitle>

          <p className="mt-1 text-xs text-slate-500">
            Students ranked by average score
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {report?.data?.studentPerformance?.length ===
          0 ? (
            <EmptyReportState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Matric Number
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Results
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Average
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Passed
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Failed
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Pass Rate
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {report?.data?.studentPerformance?.map(
                    (student, index) => (
                      <tr
                        key={student._id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/10 text-xs font-bold text-brand-navy">
                              {index + 1}
                            </div>

                            <p className="text-sm font-semibold text-brand-dark">
                              {student.studentName || "Unknown Student"}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {student.matricNumber || "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {student.totalResults || 0}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-brand-dark">
                            {student.averageScore?.toFixed(1) || "0"}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-semibold text-emerald-600">
                          {student.passed || 0}
                        </td>

                        <td className="px-6 py-4 font-semibold text-red-500">
                          {student.failed || 0}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              (student.passRate || 0) >= 70
                                ? "bg-emerald-50 text-emerald-700"
                                : (student.passRate || 0) >= 50
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {(student.passRate || 0).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RECENT STUDENTS */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <CardTitle className="text-base font-semibold text-brand-dark">
            Recent Students
          </CardTitle>

          <p className="mt-1 text-xs text-slate-500">
            Latest student registrations
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {report?.data?.recentStudents?.length === 0 ? (
            <EmptyReportState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Email
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Programme
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Level
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {report?.data?.recentStudents?.map(
                    (student) => (
                      <tr
                        key={student._id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-brand-dark">
                            {student.name}
                          </p>

                          {student.matricNumber && (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {student.matricNumber}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {student.email}
                        </td>

                        <td className="px-6 py-4">
                          {student.programme ? (
                            <div>
                              <p className="text-sm font-semibold text-brand-dark">
                                {student.programme.name || "—"}
                              </p>

                              <p className="text-xs text-slate-500">
                                {student.programme.code || "—"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {student.level || "—"}
                        </td>

                        <td className="px-6 py-4">
                          {student.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                              <XCircle className="h-3.5 w-3.5" />
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-500">
                          {student.createdAt
                            ? new Date(
                                student.createdAt,
                              ).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function ReportStatCard({
  title,
  value,
  description,
  icon,
  iconClass,
  valueClass = "text-brand-dark",
}: {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {title}
            </p>

            <p
              className={`mt-2 text-2xl font-bold tracking-tight ${valueClass}`}
            >
              {value}
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              {description}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyReportState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/10">
        <BarChart3 className="h-6 w-6 text-brand-navy" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-brand-dark">
        No data available
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        There is no data to display for this section.
      </p>
    </div>
  );
}
