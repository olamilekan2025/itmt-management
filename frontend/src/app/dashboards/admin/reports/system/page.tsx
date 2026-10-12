"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Loader2,
  RefreshCw,
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

type ProgrammeDistribution = {
  _id: string;
  name: string;
  code: string;
  studentCount: number;
  isActive: boolean;
};

type RecentAdmission = {
  _id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
};

type RecentRegistration = {
  _id: string;
  student: {
    name: string;
    matricNumber?: string;
  };
  course: {
    code: string;
    title: string;
  };
  status: string;
  createdAt: string;
};

type RecentPayment = {
  _id: string;
  student: {
    name: string;
    matricNumber?: string;
  };
  amount: number;
  status: string;
  createdAt: string;
};

type SystemReportResponse = {
  success: boolean;
  data?: {
    statistics: {
      totalUsers: number;
      totalStudents: number;
      totalStaff: number;
      totalLecturers: number;
      totalProgrammes: number;
      totalCourses: number;
      totalRegistrations: number;
      totalResults: number;
      totalAdmissions: number;
      totalPayments: number;
      activeStudents: number;
      suspendedStudents: number;
      pendingAdmissions: number;
      publishedResults: number;
    };
    programmeDistribution: ProgrammeDistribution[];
    recentActivity: {
      admissions: RecentAdmission[];
      registrations: RecentRegistration[];
      payments: RecentPayment[];
    };
  };
  message?: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function AdminSystemReportPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  const [report, setReport] =
    useState<SystemReportResponse | null>(null);

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
          await apiGet<SystemReportResponse>(
            "/reports/system",
            accessToken,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to load system report.",
          );
        }

        setReport(response);
      } catch (error) {
        console.error(
          "Load system report error:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load system report.";

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
    totalUsers: 0,
    totalStudents: 0,
    totalStaff: 0,
    totalLecturers: 0,
    totalProgrammes: 0,
    totalCourses: 0,
    totalRegistrations: 0,
    totalResults: 0,
    totalAdmissions: 0,
    totalPayments: 0,
    activeStudents: 0,
    suspendedStudents: 0,
    pendingAdmissions: 0,
    publishedResults: 0,
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
            Loading system report...
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
              Unable to load system report
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
              <Activity className="h-3.5 w-3.5 text-brand-gold" />

              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                System Analytics
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              System Report
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Comprehensive overview of the ITMT Management
              System including users, programmes, courses,
              and activity metrics.
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

      {/* USER STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard
          title="Total Users"
          value={statistics.totalUsers}
          description="All registered users"
          icon={
            <Users className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-brand-navy/10"
        />

        <ReportStatCard
          title="Students"
          value={statistics.totalStudents}
          description={`${statistics.activeStudents} active · ${statistics.suspendedStudents} suspended`}
          icon={
            <GraduationCap className="h-5 w-5 text-brand-gold" />
          }
          iconClass="bg-brand-gold/10"
        />

        <ReportStatCard
          title="Staff"
          value={statistics.totalStaff}
          description={`${statistics.totalLecturers} lecturers`}
          icon={
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          }
          iconClass="bg-emerald-50"
        />

        <ReportStatCard
          title="Pending Admissions"
          value={statistics.pendingAdmissions}
          description="Awaiting review"
          icon={
            <Activity className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-slate-100"
          valueClass="text-amber-600"
        />
      </div>

      {/* ACADEMIC STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard
          title="Programmes"
          value={statistics.totalProgrammes}
          description="Academic programmes"
          icon={
            <BookOpen className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-brand-navy/10"
        />

        <ReportStatCard
          title="Courses"
          value={statistics.totalCourses}
          description="Total courses offered"
          icon={
            <BarChart3 className="h-5 w-5 text-brand-gold" />
          }
          iconClass="bg-brand-gold/10"
        />

        <ReportStatCard
          title="Registrations"
          value={statistics.totalRegistrations}
          description="Course registrations"
          icon={
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          }
          iconClass="bg-emerald-50"
        />

        <ReportStatCard
          title="Results"
          value={statistics.totalResults}
          description={`${statistics.publishedResults} published`}
          icon={
            <GraduationCap className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-slate-100"
        />
      </div>

      {/* FINANCIAL STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2">
        <ReportStatCard
          title="Total Admissions"
          value={statistics.totalAdmissions}
          description="Applications received"
          icon={
            <Activity className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-brand-navy/10"
        />

        <ReportStatCard
          title="Total Payments"
          value={statistics.totalPayments}
          description="Payment transactions"
          icon={
            <CreditCard className="h-5 w-5 text-brand-gold" />
          }
          iconClass="bg-brand-gold/10"
        />
      </div>

      {/* PROGRAMME DISTRIBUTION */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <CardTitle className="text-base font-semibold text-brand-dark">
            Programme Distribution
          </CardTitle>

          <p className="mt-1 text-xs text-slate-500">
            Student distribution across programmes
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {report?.data?.programmeDistribution?.length ===
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
                  {report?.data?.programmeDistribution?.map(
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

      {/* RECENT ACTIVITY */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Admissions */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
            <CardTitle className="text-base font-semibold text-brand-dark">
              Recent Admissions
            </CardTitle>

            <p className="mt-1 text-xs text-slate-500">
              Latest admission applications
            </p>
          </CardHeader>

          <CardContent className="p-5">
            {report?.data?.recentActivity?.admissions
              ?.length === 0 ? (
              <EmptyReportState />
            ) : (
              <div className="space-y-3">
                {report?.data?.recentActivity?.admissions?.slice(
                  0,
                  5,
                ).map((admission) => (
                  <div
                    key={admission._id}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <p className="text-sm font-semibold text-brand-dark">
                      {admission.firstName || ""}{" "}
                      {admission.lastName || ""}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {admission.applicationNumber || "—"}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-[11px] font-semibold ${
                          admission.status === "PENDING"
                            ? "text-amber-600"
                            : admission.status === "APPROVED"
                              ? "text-emerald-600"
                              : "text-slate-500"
                        }`}
                      >
                        {admission.status || "Unknown"}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {admission.createdAt
                          ? new Date(
                              admission.createdAt,
                            ).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
            <CardTitle className="text-base font-semibold text-brand-dark">
              Recent Registrations
            </CardTitle>

            <p className="mt-1 text-xs text-slate-500">
              Latest course registrations
            </p>
          </CardHeader>

          <CardContent className="p-5">
            {report?.data?.recentActivity?.registrations
              ?.length === 0 ? (
              <EmptyReportState />
            ) : (
              <div className="space-y-3">
                {report?.data?.recentActivity?.registrations?.slice(
                  0,
                  5,
                ).map((registration) => (
                  <div
                    key={registration._id}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <p className="text-sm font-semibold text-brand-dark">
                      {registration.student?.name || "Unknown Student"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {registration.course?.code || "—"} -{" "}
                      {registration.course?.title || "Course"}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-600">
                        {registration.status || "Unknown"}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {registration.createdAt
                          ? new Date(
                              registration.createdAt,
                            ).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
            <CardTitle className="text-base font-semibold text-brand-dark">
              Recent Payments
            </CardTitle>

            <p className="mt-1 text-xs text-slate-500">
              Latest payment transactions
            </p>
          </CardHeader>

          <CardContent className="p-5">
            {report?.data?.recentActivity?.payments
              ?.length === 0 ? (
              <EmptyReportState />
            ) : (
              <div className="space-y-3">
                {report?.data?.recentActivity?.payments?.slice(
                  0,
                  5,
                ).map((payment) => (
                  <div
                    key={payment._id}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <p className="text-sm font-semibold text-brand-dark">
                      {payment.student?.name || "Unknown Student"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {payment.amount
                        ? payment.amount.toLocaleString()
                        : "—"}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-[11px] font-semibold ${
                          payment.status === "completed"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {payment.status || "Unknown"}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {payment.createdAt
                          ? new Date(
                              payment.createdAt,
                            ).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
