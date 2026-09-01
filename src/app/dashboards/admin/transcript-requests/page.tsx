"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { apiGet } from "@/lib/api";

type TranscriptStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "processing"
  | "ready"
  | "collected";

type Student = {
  _id: string;
  name: string;
  email: string;
  matricNumber?: string;
  programme?: string;
};

type TranscriptRequest = {
  _id: string;
  student: Student;
  requestType: "official" | "unofficial";
  purpose: string;
  destination?: string;
  status: TranscriptStatus;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
};

type TranscriptResponse = {
  success: boolean;
  requests: TranscriptRequest[];
  message?: string;
};

const statusConfig: Record<
  TranscriptStatus,
  {
    label: string;
    dot: string;
    className: string;
  }
> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Approved",
    dot: "bg-blue-500",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-red-500",
    className:
      "border-red-200 bg-red-50 text-red-700",
  },
  processing: {
    label: "Processing",
    dot: "bg-violet-500",
    className:
      "border-violet-200 bg-violet-50 text-violet-700",
  },
  ready: {
    label: "Ready",
    dot: "bg-emerald-500",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  collected: {
    label: "Collected",
    dot: "bg-slate-500",
    className:
      "border-slate-200 bg-slate-100 text-slate-700",
  },
};

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function getInitials(name?: string) {
  if (!name) return "ST";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");
}

function StatusBadge({
  status,
}: {
  status: TranscriptStatus;
}) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />

      {config.label}
    </span>
  );
}

export default function AdminTranscriptRequestsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const [requests, setRequests] = useState<
    TranscriptRequest[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | TranscriptStatus>("all");

  /*
   * =========================================================
   * LOAD TRANSCRIPT REQUESTS
   * =========================================================
   *
   * IMPORTANT:
   * apiGet requires the backend JWT as its second argument.
   *
   * session.accessToken comes from NextAuth's session()
   * callback in auth.ts.
   */
  const loadRequests = useCallback(
    async (isRefresh = false) => {
      /*
       * Do not attempt the API request without a token.
       */
      if (!session?.accessToken) {
        setError(
          "Authentication token is not available. Please sign in again.",
        );

        setLoading(false);
        setRefreshing(false);

        return;
      }

      try {
        setError("");

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        /*
         * PASS THE ACCESS TOKEN HERE.
         *
         * Before:
         * apiGet("/transcript-requests")
         *
         * Now:
         * apiGet("/transcript-requests", session.accessToken)
         */
        const response =
          await apiGet<TranscriptResponse>(
            "/transcript-requests",
            session.accessToken,
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to load transcript requests.",
          );
        }

        setRequests(
          response.requests || [],
        );
      } catch (err) {
        console.error(
          "Load transcript requests error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load transcript requests.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session?.accessToken],
  );

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */
  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      session?.accessToken
    ) {
      loadRequests();
    }
  }, [
    sessionStatus,
    session?.accessToken,
    loadRequests,
  ]);

  /*
   * =========================================================
   * FILTERED REQUESTS
   * =========================================================
   */
  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "all" ||
        request.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        request.student?.name
          ?.toLowerCase()
          .includes(query) ||
        request.student?.email
          ?.toLowerCase()
          .includes(query) ||
        request.student?.matricNumber
          ?.toLowerCase()
          .includes(query) ||
        request.destination
          ?.toLowerCase()
          .includes(query) ||
        request.purpose
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [
    requests,
    search,
    statusFilter,
  ]);

  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */
  const statistics = useMemo(
    () => ({
      total: requests.length,

      pending: requests.filter(
        (item) => item.status === "pending",
      ).length,

      approved: requests.filter(
        (item) => item.status === "approved",
      ).length,

      processing: requests.filter(
        (item) => item.status === "processing",
      ).length,

      ready: requests.filter(
        (item) => item.status === "ready",
      ).length,

      collected: requests.filter(
        (item) => item.status === "collected",
      ).length,

      rejected: requests.filter(
        (item) => item.status === "rejected",
      ).length,
    }),
    [requests],
  );

  /*
   * =========================================================
   * SESSION / LOADING STATE
   * =========================================================
   */
  if (
    sessionStatus === "loading" ||
    loading
  ) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/5">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-900">
            Loading transcript requests
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Please wait while we fetch the latest
            requests.
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * UNAUTHENTICATED STATE
   * =========================================================
   */
  if (
    sessionStatus === "unauthenticated"
  ) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <XCircle className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Authentication required
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please sign in to access transcript
            requests.
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */
  return (
    <div className="space-y-6 pb-8">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-navy" />

        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-navy/[0.035] blur-3xl" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-lg shadow-brand-navy/10 sm:flex">
              <FileText className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-navy">
                  Academic Services
                </p>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Transcript Requests
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review, process and manage transcript
                requests submitted by students.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              loadRequests(true)
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-navy/30 hover:bg-slate-50 hover:text-brand-navy hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
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
              : "Refresh requests"}
          </button>
        </div>
      </section>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard
          label="Total"
          value={statistics.total}
          icon={FileText}
        />

        <StatCard
          label="Pending"
          value={statistics.pending}
          icon={Clock3}
        />

        <StatCard
          label="Approved"
          value={statistics.approved}
          icon={CheckCircle2}
        />

        <StatCard
          label="Processing"
          value={statistics.processing}
          icon={Loader2}
        />

        <StatCard
          label="Ready"
          value={statistics.ready}
          icon={FileCheck2}
        />

        <StatCard
          label="Collected"
          value={statistics.collected}
          icon={CheckCircle2}
        />

        <StatCard
          label="Rejected"
          value={statistics.rejected}
          icon={XCircle}
        />
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>

          <div>
            <p className="text-sm font-bold text-red-800">
              Unable to load requests
            </p>

            <p className="mt-1 text-sm leading-5 text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          REQUEST MANAGEMENT
      ===================================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}

        <div className="border-b border-slate-100 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-brand-gold" />

                <h2 className="text-base font-bold text-slate-950">
                  All Requests
                </h2>
              </div>

              <p className="mt-1.5 text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {
                    filteredRequests.length
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {requests.length}
                </span>{" "}
                requests
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}

              <div className="relative sm:w-[350px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search students, matric numbers..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
                />
              </div>

              {/* Status */}

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "all"
                      | TranscriptStatus,
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
              >
                <option value="all">
                  All statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="processing">
                  Processing
                </option>

                <option value="ready">
                  Ready
                </option>

                <option value="collected">
                  Collected
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Student
                </th>

                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Request
                </th>

                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Destination
                </th>

                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Requested
                </th>

                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20"
                  >
                    <div className="mx-auto flex max-w-md flex-col items-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                        <FileText className="h-7 w-7 text-slate-400" />
                      </div>

                      <h3 className="mt-5 text-base font-bold text-slate-900">
                        No transcript requests
                        found
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {search ||
                        statusFilter !==
                          "all"
                          ? "Try adjusting your search or status filter."
                          : "There are currently no transcript requests."}
                      </p>

                      {(search ||
                        statusFilter !==
                          "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter(
                              "all",
                            );
                          }}
                          className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-brand-navy transition hover:bg-brand-navy/5"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(
                  (request) => (
                    <tr
                      key={request._id}
                      className="group transition-colors hover:bg-slate-50/60"
                    >
                      {/* Student */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 text-xs font-bold text-brand-navy ring-4 ring-white">
                            {getInitials(
                              request
                                .student
                                ?.name,
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {request.student
                                ?.name ||
                                "Unknown student"}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {request.student
                                ?.matricNumber ||
                                "No matric number"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Request */}

                      <td className="px-6 py-5">
                        <div>
                          <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            {
                              request.requestType
                            }
                          </span>

                          <p className="mt-2 max-w-[230px] truncate text-sm font-medium text-slate-700">
                            {request.purpose ||
                              "No purpose specified"}
                          </p>
                        </div>
                      </td>

                      {/* Destination */}

                      <td className="px-6 py-5">
                        <p className="max-w-[220px] truncate text-sm font-medium text-slate-700">
                          {request.destination ||
                            "Not specified"}
                        </p>
                      </td>

                      {/* Requested */}

                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-700">
                          {formatDate(
                            request.requestedAt,
                          )}
                        </p>
                      </td>

                      {/* Status */}

                      <td className="px-6 py-5">
                        <StatusBadge
                          status={
                            request.status
                          }
                        />
                      </td>

                      {/* Action */}

                      <td className="px-6 py-5 text-right">
                        <a
                          href={`/dashboards/admin/transcript-requests/${request._id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-navy hover:bg-brand-navy hover:text-white hover:shadow-md"
                        >
                          <Eye className="h-4 w-4" />

                          View
                        </a>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
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
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-brand-navy transition-transform duration-300 group-hover:scale-x-100" />

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-brand-navy">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 transition-all duration-200 group-hover:bg-brand-navy">
          <Icon className="h-5 w-5 text-brand-navy transition-colors group-hover:text-white" />
        </div>
      </div>
    </div>
  );
}