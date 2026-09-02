"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Loader2,
  Search,
  SlidersHorizontal,
  Users,
  XCircle,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { apiGet } from "@/lib/api";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type AdmissionStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";

type Programme = {
  _id: string;
  name?: string;
  title?: string;
};

type Department = {
  _id: string;
  name?: string;
};

type AcademicSession = {
  _id: string;
  name?: string;
};

type Student = {
  _id: string;
  name?: string;
  email?: string;
  matricNumber?: string;
};

type Admission = {
  _id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;

  programme?: Programme | null;
  department?: Department | null;
  academicSession?: AcademicSession | null;

  status: AdmissionStatus;

  matricNumber?: string;
  student?: Student | null;

  rejectionReason?: string;

  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AdmissionsResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: Admission[];
    total?: number;
  };
};

/*
 * =========================================================
 * STATUS CONFIG
 * =========================================================
 */

type StatusConfig = {
  label: string;
  className: string;
  dotClass: string;
  icon: LucideIcon;
};

const statusConfig: Record<
  AdmissionStatus,
  StatusConfig
> = {
  PENDING: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
    icon: Clock3,
  },

  UNDER_REVIEW: {
    label: "Under Review",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    dotClass: "bg-blue-500",
    icon: Eye,
  },

  APPROVED: {
    label: "Approved",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
    icon: CheckCircle2,
  },

  REJECTED: {
    label: "Rejected",
    className:
      "border-red-200 bg-red-50 text-red-700",
    dotClass: "bg-red-500",
    icon: XCircle,
  },

  WITHDRAWN: {
    label: "Withdrawn",
    className:
      "border-slate-200 bg-slate-100 text-slate-600",
    dotClass: "bg-slate-400",
    icon: XCircle,
  },
};

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(parsed);
}

function getApplicantName(
  admission: Admission,
) {
  return [
    admission.firstName,
    admission.middleName,
    admission.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getApplicantInitials(
  admission: Admission,
) {
  const name = getApplicantName(admission);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "AP";
}

function getProgrammeName(
  programme?: Programme | null,
) {
  return (
    programme?.name ||
    programme?.title ||
    "Programme not specified"
  );
}

/*
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function AdminApplicationsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const [applications, setApplications] =
    useState<Admission[]>([]);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<AdmissionStatus | "">("");

  const [page, setPage] = useState(1);

  const limit = 20;

  /*
   * =======================================================
   * LOAD APPLICATIONS
   * =======================================================
   */

  const loadApplications =
    useCallback(async () => {
      if (sessionStatus === "loading") {
        return;
      }

      if (!session?.accessToken) {
        setApplications([]);
        setTotal(0);
        setError(
          "Authentication token is required. Please sign in again.",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(limit));

        if (statusFilter) {
          params.set(
            "status",
            statusFilter,
          );
        }

        if (search.trim()) {
          params.set(
            "search",
            search.trim(),
          );
        }

        const response =
          await apiGet<AdmissionsResponse>(
            `/admissions?${params.toString()}`,
            session.accessToken,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to load applications.",
          );
        }

        setApplications(
          response.data?.items ?? [],
        );

        setTotal(
          response.data?.total ?? 0,
        );
      } catch (err) {
        console.error(
          "Load admissions error:",
          err,
        );

        setApplications([]);
        setTotal(0);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load applications.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      search,
      session?.accessToken,
      sessionStatus,
      statusFilter,
    ]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  /*
   * =======================================================
   * FILTER HANDLERS
   * =======================================================
   */

  const handleStatusChange = (
    value: AdmissionStatus | "",
  ) => {
    setPage(1);
    setStatusFilter(value);
  };

  const handleSearchChange = (
    value: string,
  ) => {
    setPage(1);
    setSearch(value);
  };

  /*
   * =======================================================
   * CURRENT PAGE STATS
   * =======================================================
   */

  const pendingCount =
    applications.filter(
      (item) =>
        item.status === "PENDING",
    ).length;

  const reviewCount =
    applications.filter(
      (item) =>
        item.status === "UNDER_REVIEW",
    ).length;

  const approvedCount =
    applications.filter(
      (item) =>
        item.status === "APPROVED",
    ).length;

  /*
   * =======================================================
   * SESSION LOADING
   * =======================================================
   */

  if (sessionStatus === "loading") {
    return <PageLoader />;
  }

  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <div className="space-y-7 pb-12">

      {/* ===================================================
          PREMIUM HEADER
      =================================================== */}

      <section className="relative overflow-hidden rounded-[28px] bg-brand-navy shadow-xl">

        {/* Decorative background */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-white/[0.035] blur-2xl" />

          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand-gold/[0.08] blur-3xl" />

          <div className="absolute right-[22%] top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-white/[0.04]" />

          <div className="absolute right-[25%] top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-white/[0.025]" />
        </div>

        <div className="relative px-6 py-8 sm:px-8 sm:py-9 lg:px-10 lg:py-10">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            {/* Left */}

            <div className="max-w-3xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-1.5 text-xs font-semibold text-white/75 backdrop-blur-sm">
                <FileText className="h-3.5 w-3.5 text-brand-gold" />

                Admissions Management
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Admission Applications
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-[15px]">
                Review incoming applications,
                monitor applicant progress, and
                manage admission decisions from
                one centralized workspace.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">

                <div className="flex items-center gap-2 text-xs font-medium text-white/55">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Admissions workspace active
                </div>

                <div className="hidden h-4 w-px bg-white/10 sm:block" />

                <div className="text-xs text-white/45">
                  {total.toLocaleString()} total
                  application
                  {total === 1 ? "" : "s"}
                </div>

              </div>
            </div>

            {/* Right summary */}

            <div className="shrink-0">

              <div className="min-w-[210px] rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-lg backdrop-blur-md">

                <div className="flex items-center justify-between">

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                    Total Applications
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Users className="h-4 w-4" />
                  </div>

                </div>

                <p className="mt-4 text-4xl font-bold tracking-tight text-white">
                  {total.toLocaleString()}
                </p>

                <div className="mt-3 h-px bg-white/10" />

                <p className="mt-3 text-xs text-white/45">
                  Across all admission statuses
                </p>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ===================================================
          STAT CARDS
      =================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total"
          value={applications.length}
          icon={Users}
          description="Applications on this page"
          accent="navy"
        />

        <StatCard
          title="Pending"
          value={pendingCount}
          icon={Clock3}
          description="Awaiting administrative action"
          accent="amber"
        />

        <StatCard
          title="Under Review"
          value={reviewCount}
          icon={Eye}
          description="Currently being reviewed"
          accent="blue"
        />

        <StatCard
          title="Approved"
          value={approvedCount}
          icon={CheckCircle2}
          description="Successfully approved"
          accent="green"
        />

      </section>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 shadow-sm">

          <div className="flex items-start gap-3 p-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>

            <div className="flex-1">

              <p className="text-sm font-bold text-red-800">
                Unable to load applications
              </p>

              <p className="mt-1 text-sm leading-5 text-red-700/80">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={loadApplications}
              className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-700 shadow-sm transition hover:bg-red-100"
            >
              Retry
            </button>

          </div>
        </div>
      )}

      {/* ===================================================
          FILTER / SEARCH PANEL
      =================================================== */}

      <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

          <div className="flex flex-col gap-1">

            <div className="flex items-center gap-2">

              <SlidersHorizontal className="h-4 w-4 text-brand-navy" />

              <h2 className="text-sm font-bold text-slate-900">
                Search & Filter
              </h2>

            </div>

            <p className="text-xs text-slate-400">
              Find and organize admission
              applications quickly.
            </p>

          </div>

        </div>

        <div className="p-4 sm:p-5">

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* Search */}

            <div className="relative flex-1">

              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  handleSearchChange(
                    event.target.value,
                  )
                }
                placeholder="Search applicant, email or application number..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
              />

            </div>

            {/* Status */}

            <div className="relative lg:w-56">

              <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={statusFilter}
                onChange={(event) =>
                  handleStatusChange(
                    event.target
                      .value as
                      | AdmissionStatus
                      | "",
                  )
                }
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 hover:bg-white focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
              >
                <option value="">
                  All statuses
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="UNDER_REVIEW">
                  Under Review
                </option>

                <option value="APPROVED">
                  Approved
                </option>

                <option value="REJECTED">
                  Rejected
                </option>

                <option value="WITHDRAWN">
                  Withdrawn
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            </div>

          </div>

        </div>

        {(search || statusFilter) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">

            <span className="text-xs text-slate-400">
              Active filters:
            </span>

            {search && (
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                Search: "{search}"
              </span>
            )}

            {statusFilter && (
              <span className="rounded-full border border-brand-navy/10 bg-brand-navy/5 px-2.5 py-1 text-xs font-semibold text-brand-navy">
                Status:{" "}
                {statusConfig[
                  statusFilter
                ].label}
              </span>
            )}

          </div>
        )}

      </section>

      {/* ===================================================
          APPLICATION TABLE
      =================================================== */}

      <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-sm">

        {/* Table heading */}

        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2.5">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                  <FileText className="h-4 w-4" />
                </div>

                <div>

                  <h2 className="text-sm font-bold text-slate-900">
                    Admission Applications
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {total.toLocaleString()}{" "}
                    application
                    {total === 1
                      ? ""
                      : "s"}{" "}
                    found
                  </p>

                </div>

              </div>

            </div>

            {loading && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">

                <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-navy" />

                Updating applications

              </div>
            )}

          </div>

        </div>

        {/* Content */}

        {loading ? (
          <TableLoader />
        ) : applications.length === 0 ? (
          <EmptyState
            search={Boolean(
              search.trim(),
            )}
            filtered={Boolean(
              statusFilter,
            )}
          />
        ) : (
          <>

            {/* Desktop */}

            <div className="hidden overflow-x-auto lg:block">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Applicant
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Application
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Programme
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Session
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {applications.map(
                    (application) => (
                      <ApplicationRow
                        key={
                          application._id
                        }
                        application={
                          application
                        }
                      />
                    ),
                  )}

                </tbody>

              </table>

            </div>

            {/* Mobile / Tablet */}

            <div className="divide-y divide-slate-100 lg:hidden">

              {applications.map(
                (application) => (
                  <MobileApplicationCard
                    key={
                      application._id
                    }
                    application={
                      application
                    }
                  />
                ),
              )}

            </div>

          </>
        )}

        {/* Pagination */}

        {!loading &&
          applications.length > 0 && (
            <Pagination
              page={page}
              limit={limit}
              total={total}
              onPrevious={() =>
                setPage((current) =>
                  Math.max(
                    1,
                    current - 1,
                  ),
                )
              }
              onNext={() =>
                setPage((current) =>
                  Math.min(
                    Math.ceil(
                      total / limit,
                    ),
                    current + 1,
                  ),
                )
              }
            />
          )}

      </section>
    </div>
  );
}

/*
 * =========================================================
 * STAT CARD
 * =========================================================
 */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  accent:
    | "navy"
    | "amber"
    | "blue"
    | "green";
}) {
  const accentStyles = {
    navy: {
      icon: "bg-brand-navy/5 text-brand-navy group-hover:bg-brand-navy group-hover:text-white",
      line: "bg-brand-navy",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
      line: "bg-amber-500",
    },
    blue: {
      icon: "bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white",
      line: "bg-blue-500",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
      line: "bg-emerald-500",
    },
  };

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div
        className={`absolute left-0 top-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full ${accentStyles[accent].line}`}
      />

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
            {title}
          </p>

          <p className="mt-2.5 text-3xl font-bold tracking-tight text-slate-900">
            {value.toLocaleString()}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition duration-300 ${accentStyles[accent].icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>

      </div>

      <div className="mt-5 flex items-center gap-2">

        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />

        <p className="text-xs text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}

/*
 * =========================================================
 * DESKTOP ROW
 * =========================================================
 */

function ApplicationRow({
  application,
}: {
  application: Admission;
}) {
  const config =
    statusConfig[
      application.status
    ];

  const StatusIcon =
    config.icon;

  return (
    <tr className="group transition-colors duration-200 hover:bg-slate-50/80">

      {/* Applicant */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-3.5">

          <ApplicantAvatar
            application={application}
          />

          <div className="min-w-0">

            <p className="truncate text-sm font-bold text-slate-900">
              {getApplicantName(
                application,
              )}
            </p>

            <p className="mt-1 truncate text-xs text-slate-400">
              {application.email}
            </p>

          </div>

        </div>

      </td>

      {/* Application */}

      <td className="px-6 py-5">

        <div className="inline-flex flex-col">

          <span className="w-fit rounded-lg bg-brand-navy/5 px-2.5 py-1 text-xs font-bold tracking-wide text-brand-navy">
            {application.applicationNumber}
          </span>

          <span className="mt-1.5 text-[11px] text-slate-400">
            {formatDate(
              application.submittedAt ||
                application.createdAt,
            )}
          </span>

        </div>

      </td>

      {/* Programme */}

      <td className="max-w-[240px] px-6 py-5">

        <p className="truncate text-sm font-semibold text-slate-700">
          {getProgrammeName(
            application.programme,
          )}
        </p>

        {application.department?.name && (
          <p className="mt-1 truncate text-xs text-slate-400">
            {application.department.name}
          </p>
        )}

      </td>

      {/* Session */}

      <td className="px-6 py-5">

        <span className="text-sm font-medium text-slate-600">
          {application.academicSession
            ?.name || "—"}
        </span>

      </td>

      {/* Status */}

      <td className="px-6 py-5">

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${config.className}`}
        >

          <span
            className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`}
          />

          <StatusIcon className="h-3.5 w-3.5" />

          {config.label}

        </span>

      </td>

      {/* Action */}

      <td className="px-6 py-5 text-right">

        <Link
          href={`/dashboards/admin/applications/${application._id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition duration-200 hover:border-brand-navy hover:bg-brand-navy hover:text-white hover:shadow-md"
        >
          View

          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>

      </td>

    </tr>
  );
}

/*
 * =========================================================
 * MOBILE CARD
 * =========================================================
 */

function MobileApplicationCard({
  application,
}: {
  application: Admission;
}) {
  const config =
    statusConfig[
      application.status
    ];

  const StatusIcon =
    config.icon;

  return (
    <Link
      href={`/dashboards/admin/applications/${application._id}`}
      className="block p-5 transition duration-200 hover:bg-slate-50 active:bg-slate-100"
    >

      <div className="flex items-start gap-3.5">

        <ApplicantAvatar
          application={application}
        />

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <p className="truncate text-sm font-bold text-slate-900">
                {getApplicantName(
                  application,
                )}
              </p>

              <p className="mt-1 truncate text-xs text-slate-400">
                {application.email}
              </p>

            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${config.className}`}
            >

              <span
                className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`}
              />

              <StatusIcon className="h-3 w-3" />

              {config.label}

            </span>

          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">

              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Application
              </p>

              <p className="mt-1.5 text-xs font-bold text-brand-navy">
                {application.applicationNumber}
              </p>

            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">

              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Submitted
              </p>

              <p className="mt-1.5 text-xs font-semibold text-slate-600">
                {formatDate(
                  application.submittedAt ||
                    application.createdAt,
                )}
              </p>

            </div>

          </div>

          <div className="mt-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">

            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Programme
            </p>

            <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5 text-slate-700">
              {getProgrammeName(
                application.programme,
              )}
            </p>

            {application.department?.name && (
              <p className="mt-1 text-xs text-slate-400">
                {application.department.name}
              </p>
            )}

          </div>

          <div className="mt-4 flex items-center justify-between">

            <span className="text-[11px] text-slate-400">
              {application.academicSession
                ?.name || "Session not specified"}
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy">
              View application

              <ArrowRight className="h-3.5 w-3.5" />

            </span>

          </div>

        </div>

      </div>

    </Link>
  );
}

/*
 * =========================================================
 * AVATAR
 * =========================================================
 */

function ApplicantAvatar({
  application,
}: {
  application: Admission;
}) {
  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-xs font-bold text-white shadow-sm">

      {getApplicantInitials(
        application,
      )}

      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />

    </div>
  );
}

/*
 * =========================================================
 * PAGINATION
 * =========================================================
 */

function Pagination({
  page,
  limit,
  total,
  onPrevious,
  onNext,
}: {
  page: number;
  limit: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const totalPages = Math.max(
    1,
    Math.ceil(total / limit),
  );

  const start =
    total === 0
      ? 0
      : (page - 1) * limit + 1;

  const end = Math.min(
    page * limit,
    total,
  );

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

      <p className="text-xs text-slate-400">

        Showing{" "}

        <span className="font-bold text-slate-700">
          {start}
        </span>{" "}

        to{" "}

        <span className="font-bold text-slate-700">
          {end}
        </span>{" "}

        of{" "}

        <span className="font-bold text-slate-700">
          {total.toLocaleString()}
        </span>

      </p>

      <div className="flex items-center gap-2">

        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrevious}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <div className="rounded-xl bg-brand-navy px-3.5 py-2.5 text-xs font-bold text-white shadow-sm">
          {page} / {totalPages}
        </div>

        <button
          type="button"
          disabled={
            page >= totalPages
          }
          onClick={onNext}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>

      </div>

    </div>
  );
}

/*
 * =========================================================
 * PAGE LOADER
 * =========================================================
 */

function PageLoader() {
  return (
    <div className="flex min-h-[520px] items-center justify-center">

      <div className="text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/5">

          <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />

        </div>

        <p className="mt-5 text-sm font-bold text-slate-900">
          Loading applications
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Preparing your admissions workspace...
        </p>

      </div>

    </div>
  );
}

/*
 * =========================================================
 * TABLE LOADER
 * =========================================================
 */

function TableLoader() {
  return (
    <div className="divide-y divide-slate-100">

      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-5 px-6 py-5"
        >

          <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />

          <div className="flex-1 space-y-2">

            <div className="h-3 w-40 rounded bg-slate-100" />

            <div className="h-2.5 w-28 rounded bg-slate-100" />

          </div>

          <div className="hidden h-3 w-32 rounded bg-slate-100 lg:block" />

          <div className="hidden h-3 w-24 rounded bg-slate-100 xl:block" />

          <div className="h-7 w-20 rounded-full bg-slate-100" />

          <div className="hidden h-9 w-16 rounded-xl bg-slate-100 lg:block" />

        </div>
      ))}

    </div>
  );
}

/*
 * =========================================================
 * EMPTY STATE
 * =========================================================
 */

function EmptyState({
  search,
  filtered,
}: {
  search: boolean;
  filtered: boolean;
}) {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy">

        <FileText className="h-7 w-7" />

      </div>

      <h3 className="mt-5 text-base font-bold text-slate-900">
        No applications found
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">

        {search || filtered
          ? "No applications match your current search or status filter."
          : "There are currently no admission applications to display."}

      </p>

      {(search || filtered) && (
        <p className="mt-4 rounded-full bg-brand-navy/5 px-3 py-1.5 text-xs font-bold text-brand-navy">
          Clear the filters to view all applications.
        </p>
      )}

    </div>
  );
}

