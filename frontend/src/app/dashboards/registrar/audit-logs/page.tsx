
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileSearch,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  X,
  XCircle,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "PUBLISH"
  | "UNPUBLISH"
  | "ACTIVATE"
  | "DEACTIVATE"
  | "SUSPEND"
  | "UNSUSPEND"
  | "ASSIGN"
  | "UNASSIGN"
  | "PASSWORD_RESET"
  | "OTHER";

type AuditModule =
  | "AUTH"
  | "USERS"
  | "ADMISSIONS"
  | "DEPARTMENTS"
  | "PROGRAMMES"
  | "ACADEMIC_SESSIONS"
  | "SEMESTERS"
  | "COURSES"
  | "REGISTRATIONS"
  | "LECTURER_ASSIGNMENTS"
  | "RESULTS"
  | "FEE_STRUCTURES"
  | "PAYMENTS"
  | "STUDENTS"
  | "TRANSCRIPTS"
  | "NOTIFICATIONS"
  | "ANNOUNCEMENTS"
  | "ACADEMIC_REPORTS"
  | "SYSTEM";

type AuditStatus = "success" | "failed";

interface AuditActor {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface AuditLog {
  _id: string;

  actor?: AuditActor | string;

  actorName?: string;
  actorEmail?: string;
  actorRole?: string;

  action: AuditAction;
  module: AuditModule;

  description: string;

  targetType?: string;
  targetId?: string;

  metadata?: Record<string, unknown>;

  ipAddress?: string;
  userAgent?: string;

  status: AuditStatus;

  createdAt: string;
  updatedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface AuditLogsResponse {
  success: boolean;
  data?: {
    items?: AuditLog[];
    pagination?: Pagination;
  };
  message?: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const ACTIONS: AuditAction[] = [
  "LOGIN",
  "LOGOUT",
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "PUBLISH",
  "UNPUBLISH",
  "ACTIVATE",
  "DEACTIVATE",
  "SUSPEND",
  "UNSUSPEND",
  "ASSIGN",
  "UNASSIGN",
  "PASSWORD_RESET",
  "OTHER",
];

const MODULES: AuditModule[] = [
  "AUTH",
  "USERS",
  "ADMISSIONS",
  "DEPARTMENTS",
  "PROGRAMMES",
  "ACADEMIC_SESSIONS",
  "SEMESTERS",
  "COURSES",
  "REGISTRATIONS",
  "LECTURER_ASSIGNMENTS",
  "RESULTS",
  "FEE_STRUCTURES",
  "PAYMENTS",
  "STUDENTS",
  "TRANSCRIPTS",
  "NOTIFICATIONS",
  "ANNOUNCEMENTS",
  "ACADEMIC_REPORTS",
  "SYSTEM",
];

const ROLES = [
  "admin",
  "registrar",
  "finance",
  "lecturer",
  "student",
];

/* =========================================================
   HELPERS
========================================================= */

function formatAction(action?: string) {
  if (!action) return "Unknown";

  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatModule(module?: string) {
  if (!module) return "Unknown";

  return module
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatRole(role?: string) {
  if (!role) return "Unknown";

  return role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date?: string) {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getActor(log: AuditLog): AuditActor | null {
  if (
    log.actor &&
    typeof log.actor === "object"
  ) {
    return log.actor;
  }

  return null;
}

function getActorName(log: AuditLog) {
  const actor = getActor(log);

  return (
    actor?.name ||
    log.actorName ||
    "System"
  );
}

function getActorEmail(log: AuditLog) {
  const actor = getActor(log);

  return (
    actor?.email ||
    log.actorEmail ||
    ""
  );
}

function getActorRole(log: AuditLog) {
  const actor = getActor(log);

  return (
    actor?.role ||
    log.actorRole ||
    ""
  );
}

function getModuleIcon(module: AuditModule) {
  switch (module) {
    case "AUTH":
      return ShieldCheck;

    case "USERS":
    case "STUDENTS":
      return User;

    case "SYSTEM":
      return Archive;

    default:
      return FileSearch;
  }
}

const EMPTY_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

/* =========================================================
   PAGE
========================================================= */

export default function RegistrarAuditLogsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken = session?.accessToken;

  const [logs, setLogs] = useState<AuditLog[]>([]);

  const [pagination, setPagination] =
    useState<Pagination>(EMPTY_PAGINATION);

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [module, setModule] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [showFilters, setShowFilters] =
    useState(false);

  const [selectedLog, setSelectedLog] =
    useState<AuditLog | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     ACTIVE FILTER COUNT
  ======================================================= */

  const activeFilterCount = useMemo(() => {
    return [
      action,
      module,
      role,
      status,
      from,
      to,
    ].filter(Boolean).length;
  }, [
    action,
    module,
    role,
    status,
    from,
    to,
  ]);

  /* =======================================================
     LOAD LOGS
  ======================================================= */

  const loadLogs = useCallback(
    async (
      requestedPage = 1,
      showRefreshing = false,
    ) => {
      if (!accessToken) return;

      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = new URLSearchParams();

        params.set(
          "page",
          String(requestedPage),
        );

        params.set("limit", "20");

        if (search.trim()) {
          params.set(
            "search",
            search.trim(),
          );
        }

        if (action) {
          params.set("action", action);
        }

        if (module) {
          params.set("module", module);
        }

        if (role) {
          params.set("role", role);
        }

        if (status) {
          params.set("status", status);
        }

        if (from) {
          params.set("from", from);
        }

        if (to) {
          params.set("to", to);
        }

        const response =
          await apiGet<AuditLogsResponse>(
            `/audit-logs?${params.toString()}`,
            accessToken,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load audit logs.",
          );
        }

        setLogs(
          response.data?.items ?? [],
        );

        setPagination(
          response.data?.pagination ??
            {
              ...EMPTY_PAGINATION,
              page: requestedPage,
            },
        );
      } catch (err) {
        console.error(
          "Load audit logs error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load audit logs.",
        );

        setLogs([]);
        setPagination({
          ...EMPTY_PAGINATION,
          page: requestedPage,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      accessToken,
      search,
      action,
      module,
      role,
      status,
      from,
      to,
    ],
  );

  /* =======================================================
     INITIAL LOAD ONLY
  ======================================================= */

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      accessToken
    ) {
      loadLogs(1);
    }
  }, [
    sessionStatus,
    accessToken,
  ]);

  /* =======================================================
     FILTER ACTIONS
  ======================================================= */

  const applyFilters = () => {
    loadLogs(1);
  };

  const clearFilters = () => {
    setSearch("");
    setAction("");
    setModule("");
    setRole("");
    setStatus("");
    setFrom("");
    setTo("");

    /*
     * Do not immediately call loadLogs here.
     * loadLogs uses the current state values.
     *
     * Instead perform a clean request with no filters.
     */
    if (accessToken) {
      const params = new URLSearchParams();

      params.set("page", "1");
      params.set("limit", "20");

      setLoading(true);
      setError("");

      apiGet<AuditLogsResponse>(
        `/audit-logs?${params.toString()}`,
        accessToken,
      )
        .then((response) => {
          if (!response?.success) {
            throw new Error(
              response?.message ||
                "Failed to load audit logs.",
            );
          }

          setLogs(
            response.data?.items ?? [],
          );

          setPagination(
            response.data?.pagination ??
              EMPTY_PAGINATION,
          );
        })
        .catch((err) => {
          console.error(
            "Clear filters error:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to reload audit logs.",
          );

          setLogs([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  /* =======================================================
     LOADING SESSION
  ======================================================= */

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-brand-gold" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Loading audit logs...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-full space-y-6 pb-10">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-5 shadow-xl sm:p-7 lg:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                  Security & Compliance
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Audit Logs
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Review administrative activity,
                system events, account actions,
                and changes across the ITMT
                Management System.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadLogs(
                  pagination.page,
                  true,
                )
              }
              disabled={
                refreshing || loading
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={
                  refreshing
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />

              <span>
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </span>
            </button>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <FileSearch className="h-3.5 w-3.5 text-brand-gold" />

              <span className="text-xs font-semibold text-slate-300">
                {pagination.total.toLocaleString()}{" "}
                total records
              </span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <Clock3 className="h-3.5 w-3.5 text-slate-400" />

              <span className="text-xs font-semibold text-slate-300">
                Latest activity first
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SEARCH + FILTER BAR
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  applyFilters();
                }
              }}
              placeholder="Search descriptions, users, emails, targets..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-navy/30 focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                (value) => !value,
              )
            }
            className={`
              inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition
              ${
                showFilters ||
                activeFilterCount > 0
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }
            `}
          >
            <Filter className="h-4 w-4" />

            Filters

            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1.5 text-[10px] font-bold text-brand-navy">
                {activeFilterCount}
              </span>
            )}

            <ChevronDown
              className={
                showFilters
                  ? "h-4 w-4 rotate-180 transition-transform"
                  : "h-4 w-4 transition-transform"
              }
            />
          </button>

          <button
            type="button"
            onClick={applyFilters}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}

            Search
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

              <FilterSelect
                label="Action"
                value={action}
                onChange={setAction}
                options={ACTIONS.map(
                  (item) => ({
                    value: item,
                    label:
                      formatAction(item),
                  }),
                )}
              />

              <FilterSelect
                label="Module"
                value={module}
                onChange={setModule}
                options={MODULES.map(
                  (item) => ({
                    value: item,
                    label:
                      formatModule(item),
                  }),
                )}
              />

              <FilterSelect
                label="Actor role"
                value={role}
                onChange={setRole}
                options={ROLES.map(
                  (item) => ({
                    value: item,
                    label:
                      formatRole(item),
                  }),
                )}
              />

              <FilterSelect
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  {
                    value: "success",
                    label: "Success",
                  },
                  {
                    value: "failed",
                    label: "Failed",
                  },
                ]}
              />

              <FilterDate
                label="From"
                value={from}
                onChange={setFrom}
              />

              <FilterDate
                label="To"
                value={to}
                onChange={setTo}
              />
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-medium text-slate-400">
                  {activeFilterCount} active{" "}
                  {activeFilterCount === 1
                    ? "filter"
                    : "filters"}
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 transition hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertCircle className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-bold text-red-700">
                Unable to load audit logs
              </p>

              <p className="mt-0.5 text-xs text-red-500">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              loadLogs(
                pagination.page,
                true,
              )
            }
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-red-600 shadow-sm ring-1 ring-red-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      )}

      {/* =====================================================
          LOGS
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h3 className="text-sm font-bold text-brand-navy">
              Activity History
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              System activity and administrative
              actions.
            </p>
          </div>

          {pagination.total > 0 && (
            <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy">
                <Loader2 className="h-5 w-5 animate-spin text-brand-gold" />
              </div>

              <p className="text-sm font-medium text-slate-500">
                Loading activity...
              </p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileSearch className="h-6 w-6" />
            </div>

            <h4 className="mt-4 text-sm font-bold text-slate-700">
              No audit logs found
            </h4>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
              There are no records matching your
              current search or filter criteria.
            </p>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-semibold text-white"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP
            ================================================= */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Activity
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Actor
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Module
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Target
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Time
                    </th>

                    <th className="px-5 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const ModuleIcon =
                      getModuleIcon(
                        log.module,
                      );

                    return (
                      <tr
                        key={log._id}
                        className="group transition hover:bg-slate-50/70"
                      >
                        <td className="max-w-[380px] px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
                              <ModuleIcon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                                {formatAction(
                                  log.action,
                                )}
                              </span>

                              <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-5 text-slate-700">
                                {log.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                              <User className="h-3.5 w-3.5" />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[160px] truncate text-xs font-bold text-slate-700">
                                {getActorName(
                                  log,
                                )}
                              </p>

                              <p className="max-w-[160px] truncate text-[10px] text-slate-400">
                                {getActorEmail(
                                  log,
                                ) ||
                                  formatRole(
                                    getActorRole(
                                      log,
                                    ),
                                  )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600">
                            {formatModule(
                              log.module,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {log.targetType ? (
                            <div>
                              <p className="text-xs font-semibold text-slate-600">
                                {log.targetType}
                              </p>

                              {log.targetId && (
                                <p className="mt-0.5 max-w-[130px] truncate font-mono text-[9px] text-slate-400">
                                  {log.targetId}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {log.status ===
                          "success" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[9px] font-bold text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1.5 text-[9px] font-bold text-red-600">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <p className="text-[10px] font-semibold text-slate-600">
                            {formatDate(
                              log.createdAt,
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedLog(
                                log,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 opacity-0 shadow-sm transition group-hover:opacity-100 hover:border-brand-navy/20 hover:text-brand-navy"
                            aria-label="View audit log"
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE / TABLET
            ================================================= */}

            <div className="divide-y divide-slate-100 lg:hidden">
              {logs.map((log) => {
                const ModuleIcon =
                  getModuleIcon(
                    log.module,
                  );

                return (
                  <button
                    key={log._id}
                    type="button"
                    onClick={() =>
                      setSelectedLog(log)
                    }
                    className="block w-full p-4 text-left transition hover:bg-slate-50 active:bg-slate-100 sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
                        <ModuleIcon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                            {formatAction(
                              log.action,
                            )}
                          </span>

                          {log.status ===
                          "success" ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Failed
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs font-bold leading-5 text-slate-700">
                          {log.description}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-slate-400">
                          <span className="font-semibold">
                            {getActorName(
                              log,
                            )}
                          </span>

                          <span>•</span>

                          <span>
                            {formatModule(
                              log.module,
                            )}
                          </span>

                          <span>•</span>

                          <span>
                            {formatDate(
                              log.createdAt,
                            )}
                          </span>
                        </div>
                      </div>

                      <Eye className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {!loading &&
          logs.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-bold text-slate-600">
                  {(pagination.page - 1) *
                    pagination.limit +
                    1}
                </span>{" "}
                –{" "}
                <span className="font-bold text-slate-600">
                  {Math.min(
                    pagination.page *
                      pagination.limit,
                    pagination.total,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-600">
                  {pagination.total}
                </span>{" "}
                records
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    !pagination.hasPreviousPage ||
                    loading
                  }
                  onClick={() =>
                    loadLogs(
                      pagination.page - 1,
                    )
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />

                  <span className="hidden sm:inline">
                    Previous
                  </span>
                </button>

                <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-brand-navy px-3 text-xs font-bold text-white">
                  {pagination.page}
                </div>

                <button
                  type="button"
                  disabled={
                    !pagination.hasNextPage ||
                    loading
                  }
                  onClick={() =>
                    loadLogs(
                      pagination.page + 1,
                    )
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="hidden sm:inline">
                    Next
                  </span>

                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
      </section>

      {/* =====================================================
          AUDIT DETAIL MODAL
      ===================================================== */}

      {selectedLog && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5">
          <button
            type="button"
            aria-label="Close audit details"
            className="absolute inset-0 cursor-default"
            onClick={() =>
              setSelectedLog(null)
            }
          />

          <div className="relative z-10 max-h-[90vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-3xl">
            <div className="bg-brand-navy px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-brand-gold">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Audit Record
                    </p>

                    <h3 className="mt-1 text-sm font-bold text-white">
                      Activity Details
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedLog(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-300 transition hover:bg-white/15 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(90vh-85px)] overflow-y-auto p-5 sm:p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-lg bg-brand-navy px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    {formatAction(
                      selectedLog.action,
                    )}
                  </span>

                  <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-bold text-slate-600">
                    {formatModule(
                      selectedLog.module,
                    )}
                  </span>

                  {selectedLog.status ===
                  "success" ? (
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[9px] font-bold text-emerald-600">
                      Success
                    </span>
                  ) : (
                    <span className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[9px] font-bold text-red-600">
                      Failed
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">
                  {selectedLog.description}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailItem
                  label="Actor"
                  value={getActorName(
                    selectedLog,
                  )}
                />

                <DetailItem
                  label="Role"
                  value={formatRole(
                    getActorRole(
                      selectedLog,
                    ),
                  )}
                />

                <DetailItem
                  label="Email"
                  value={
                    getActorEmail(
                      selectedLog,
                    ) || "—"
                  }
                />

                <DetailItem
                  label="Module"
                  value={formatModule(
                    selectedLog.module,
                  )}
                />

                <DetailItem
                  label="Target type"
                  value={
                    selectedLog.targetType ||
                    "—"
                  }
                />

                <DetailItem
                  label="Target ID"
                  value={
                    selectedLog.targetId ||
                    "—"
                  }
                  mono
                />

                <DetailItem
                  label="IP address"
                  value={
                    selectedLog.ipAddress ||
                    "—"
                  }
                  mono
                />

                <DetailItem
                  label="Created"
                  value={formatDate(
                    selectedLog.createdAt,
                  )}
                />
              </div>

              {selectedLog.userAgent && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    User Agent
                  </p>

                  <p className="mt-1 break-all text-[10px] leading-5 text-slate-500">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}

              {selectedLog.metadata &&
                Object.keys(
                  selectedLog.metadata,
                ).length > 0 && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Metadata
                    </p>

                    <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-slate-950 p-3 text-[10px] leading-5 text-slate-300">
                      {JSON.stringify(
                        selectedLog.metadata,
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   FILTER SELECT
========================================================= */

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: FilterSelectProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-xs font-medium text-slate-600 outline-none transition focus:border-brand-navy/30 focus:ring-4 focus:ring-brand-navy/5"
        >
          <option value="">
            All {label}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

/* =========================================================
   FILTER DATE
========================================================= */

interface FilterDateProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function FilterDate({
  label,
  value,
  onChange,
}: FilterDateProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none transition focus:border-brand-navy/30 focus:ring-4 focus:ring-brand-navy/5"
      />
    </label>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

interface DetailItemProps {
  label: string;
  value: string;
  mono?: boolean;
}

function DetailItem({
  label,
  value,
  mono = false,
}: DetailItemProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1.5 break-words text-xs font-semibold text-slate-700 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

