"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { useSession } from "next-auth/react";

import {
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type GraduationStatus =
  | "eligible"
  | "not_eligible"
  | "approved"
  | "graduated";

interface Programme {
  id: string;
  name: string;
  code?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  matricNumber: string;
  level: string;
}

interface GraduationRecord {
  id: string;

  student: Student;

  programme: Programme | null;

  academicSession: string;

  status: GraduationStatus;

  requiredCreditUnits: number;
  earnedCreditUnits: number;

  totalRegisteredCourses: number;
  completedCourses: number;
  failedCourses: number;
  missingResults: number;

  failedCourseIds: string[];
  missingResultCourseIds: string[];

  eligibilityReason: string;

  reviewedBy: unknown | null;
  reviewedAt: string | null;

  graduatedBy: unknown | null;
  graduatedAt: string | null;

  notes: string;
}

interface GraduationStatistics {
  total: number;
  eligible: number;
  notEligible: number;
  approved: number;
  graduated: number;
}

interface GraduationResponse {
  success: boolean;
  academicSession: string;
  statistics: GraduationStatistics;
  graduations: GraduationRecord[];
}

interface SessionRecord {
  _id: string;
  name: string;
  isActive?: boolean;
}

interface SessionResponse {
  success: boolean;
  sessions: SessionRecord[];
}

interface ProgrammeResponse {
  success: boolean;
  programmes: Array<{
    _id: string;
    name: string;
    code?: string;
  }>;
}

interface ApiError {
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(
    Number.isFinite(value) ? value : 0,
  );
}

function formatDate(
  value: string | null | undefined,
) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    const message = (error as ApiError).message;

    if (message) return message;
  }

  return fallback;
}

function getStatusLabel(
  status: GraduationStatus,
) {
  switch (status) {
    case "eligible":
      return "Eligible";

    case "approved":
      return "Approved";

    case "graduated":
      return "Graduated";

    default:
      return "Not Eligible";
  }
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: GraduationStatus;
}) {
  const styles: Record<
    GraduationStatus,
    string
  > = {
    eligible:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    not_eligible:
      "border-rose-200 bg-rose-50 text-rose-700",
    approved:
      "border-blue-200 bg-blue-50 text-blue-700",
    graduated:
      "border-violet-200 bg-violet-50 text-violet-700",
  };

  const icons: Record<
    GraduationStatus,
    React.ReactNode
  > = {
    eligible: (
      <CheckCircle2 className="h-3.5 w-3.5" />
    ),
    not_eligible: (
      <XCircle className="h-3.5 w-3.5" />
    ),
    approved: (
      <ShieldCheck className="h-3.5 w-3.5" />
    ),
    graduated: (
      <GraduationCap className="h-3.5 w-3.5" />
    ),
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {icons[status]}
      {getStatusLabel(status)}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon,
  className = "",
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-7 -translate-y-7 rounded-full bg-brand-gold/10" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-brand-navy">
            {formatNumber(value)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-brand-gold shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function RegistrarGraduationPage() {
  const { data: session } =
    useSession();

  const accessToken =
    session?.accessToken;

  const [records, setRecords] =
    useState<GraduationRecord[]>([]);

  const [statistics, setStatistics] =
    useState<GraduationStatistics>({
      total: 0,
      eligible: 0,
      notEligible: 0,
      approved: 0,
      graduated: 0,
    });

  const [sessions, setSessions] =
    useState<SessionRecord[]>([]);

  const [programmes, setProgrammes] =
    useState<Programme[]>([]);

  const [selectedSession, setSelectedSession] =
    useState("");

  const [selectedProgramme, setSelectedProgramme] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | GraduationStatus>(
      "all",
    );

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedRecord, setSelectedRecord] =
    useState<GraduationRecord | null>(
      null,
    );

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  const [notes, setNotes] =
    useState("");

  /* =======================================================
     LOAD FILTER DATA
  ======================================================= */

  const loadFilters = useCallback(
    async () => {
      if (!accessToken) return;

      try {
        const [
          sessionResponse,
          programmeResponse,
        ] = await Promise.all([
          apiGet(
            "/academic-sessions",
            accessToken,
          ) as Promise<SessionResponse>,

          apiGet(
            "/programmes",
            accessToken,
          ) as Promise<ProgrammeResponse>,
        ]);

        const sessionList =
          Array.isArray(
            sessionResponse.sessions,
          )
            ? sessionResponse.sessions
            : [];

        const programmeList =
          Array.isArray(
            programmeResponse.programmes,
          )
            ? programmeResponse.programmes
            : [];

        setSessions(sessionList);

        setProgrammes(
          programmeList.map(
            (programme) => ({
              id: programme._id,
              name: programme.name,
              code: programme.code,
            }),
          ),
        );

        /*
         * Prefer the active academic session.
         */
        const activeSession =
          sessionList.find(
            (item) => item.isActive,
          );

        if (
          activeSession &&
          !selectedSession
        ) {
          setSelectedSession(
            activeSession._id,
          );
        }
      } catch (err) {
        console.error(
          "Unable to load graduation filters:",
          err,
        );
      }
    },
    [
      accessToken,
      selectedSession,
    ],
  );

  /* =======================================================
     LOAD GRADUATIONS
  ======================================================= */

  const loadGraduations =
    useCallback(
      async (
        showRefreshLoader = false,
      ) => {
        if (!accessToken) return;

        try {
          setError("");

          if (showRefreshLoader) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          const params =
            new URLSearchParams();

          if (selectedSession) {
            params.set(
              "session",
              selectedSession,
            );
          }

          if (selectedProgramme) {
            params.set(
              "programme",
              selectedProgramme,
            );
          }

          if (statusFilter !== "all") {
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

          const query =
            params.toString();

          const response =
            (await apiGet(
              `/graduations${
                query ? `?${query}` : ""
              }`,
              accessToken,
            )) as GraduationResponse;

          setRecords(
            Array.isArray(
              response.graduations,
            )
              ? response.graduations
              : [],
          );

          setStatistics(
            response.statistics || {
              total: 0,
              eligible: 0,
              notEligible: 0,
              approved: 0,
              graduated: 0,
            },
          );
        } catch (err) {
          console.error(
            "Unable to load graduations:",
            err,
          );

          setError(
            getErrorMessage(
              err,
              "Unable to load graduation records.",
            ),
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        accessToken,
        selectedSession,
        selectedProgramme,
        statusFilter,
        search,
      ],
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (!accessToken) return;

    loadFilters();
  }, [
    accessToken,
    loadFilters,
  ]);

  useEffect(() => {
    if (!accessToken) return;

    loadGraduations();
  }, [
    accessToken,
    selectedSession,
    selectedProgramme,
    statusFilter,
  ]);

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================= */

  useEffect(() => {
    if (!accessToken) return;

    const timer =
      window.setTimeout(() => {
        loadGraduations();
      }, 350);

    return () =>
      window.clearTimeout(timer);
  }, [
    search,
    accessToken,
    loadGraduations,
  ]);

  /* =======================================================
     FILTERED RECORDS
  ======================================================= */

  const visibleRecords =
    useMemo(() => {
      return records;
    }, [records]);

  /* =======================================================
     ACTION
  ======================================================= */

  const performAction =
    async (
      action:
        | "approve"
        | "graduate"
        | "reject",
    ) => {
      if (
        !selectedRecord ||
        !accessToken
      ) {
        return;
      }

      try {
        setActionLoading(true);
        setActionError("");

        let response;

        if (action === "approve") {
          response = await apiPatch(
            `/graduations/${selectedRecord.id}/approve`,
            {
              notes:
                notes.trim() || undefined,
            },
            accessToken,
          );
        }

        if (action === "graduate") {
          response = await apiPatch(
            `/graduations/${selectedRecord.id}/graduate`,
            {},
            accessToken,
          );
        }

        if (action === "reject") {
          response = await apiPatch(
            `/graduations/${selectedRecord.id}/reject`,
            {
              notes:
                notes.trim() || undefined,
            },
            accessToken,
          );
        }

        void response;

        setSelectedRecord(null);
        setNotes("");

        await loadGraduations(true);
      } catch (err) {
        console.error(
          "Graduation action error:",
          err,
        );

        setActionError(
          getErrorMessage(
            err,
            "Unable to update graduation status.",
          ),
        );
      } finally {
        setActionLoading(false);
      }
    };

  /* =======================================================
     EVALUATE
  ======================================================= */

  const evaluateRecord =
    async () => {
      if (
        !selectedRecord ||
        !accessToken
      ) {
        return;
      }

      try {
        setActionLoading(true);
        setActionError("");

        await apiPost(
          "/graduations/evaluate",
          {
            student:
              selectedRecord.student.id,
            academicSession:
              selectedRecord.academicSession,
          },
          accessToken,
        );

        await loadGraduations(true);

        const refreshed =
          records.find(
            (item) =>
              item.id ===
              selectedRecord.id,
          );

        if (refreshed) {
          setSelectedRecord(
            refreshed,
          );
        }
      } catch (err) {
        console.error(
          "Evaluation error:",
          err,
        );

        setActionError(
          getErrorMessage(
            err,
            "Unable to reevaluate student.",
          ),
        );
      } finally {
        setActionLoading(false);
      }
    };

  /* =======================================================
     OPEN DETAILS
  ======================================================= */

  const openRecord = (
    record: GraduationRecord,
  ) => {
    setActionError("");
    setNotes(record.notes || "");
    setSelectedRecord(record);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="relative overflow-hidden rounded-2xl bg-brand-navy">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,81,0.18),transparent_35%)]" />

        <div className="relative mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
                <Link
                  href="/dashboards/registrar"
                  className="transition hover:text-white"
                >
                  Registrar Dashboard
                </Link>

                <ChevronRight className="h-4 w-4" />

                <span className="text-brand-gold">
                  Graduation
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-gold/30 bg-white/10 text-brand-gold backdrop-blur">
                  <GraduationCap className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Graduation Management
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm text-slate-300">
                    Review academic eligibility,
                    approve graduating students,
                    and finalize graduation records.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                loadGraduations(true)
              }
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh Records
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto max-w-[1600px] space-y-6 px-0 py-6 sm:px-0 lg:px-0">
        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Candidates"
            value={statistics.total}
            description="Students under review"
            icon={
              <Users className="h-5 w-5" />
            }
          />

          <StatCard
            title="Eligible"
            value={statistics.eligible}
            description="Ready for approval"
            icon={
              <CheckCircle2 className="h-5 w-5" />
            }
          />

          <StatCard
            title="Not Eligible"
            value={
              statistics.notEligible
            }
            description="Requirements outstanding"
            icon={
              <XCircle className="h-5 w-5" />
            }
          />

          <StatCard
            title="Approved"
            value={statistics.approved}
            description="Approved for graduation"
            icon={
              <ShieldCheck className="h-5 w-5" />
            }
          />

          <StatCard
            title="Graduated"
            value={statistics.graduated}
            description="Finalized records"
            icon={
              <Award className="h-5 w-5" />
            }
          />
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-brand-navy">
                Graduation Candidates
              </h2>

              <p className="text-xs text-slate-500">
                Eligibility is calculated from
                registered courses and published results.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock3 className="h-4 w-4" />
              Live academic evaluation
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {/* Search */}

            <div className="relative xl:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search student or matric number..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/15"
              />
            </div>

            {/* Session */}

            <select
              value={selectedSession}
              onChange={(event) =>
                setSelectedSession(
                  event.target.value,
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/15"
            >
              <option value="">
                All Academic Sessions
              </option>

              {sessions.map(
                (academicSession) => (
                  <option
                    key={
                      academicSession._id
                    }
                    value={
                      academicSession._id
                    }
                  >
                    {academicSession.name}
                    {academicSession.isActive
                      ? " — Active"
                      : ""}
                  </option>
                ),
              )}
            </select>

            {/* Programme */}

            <select
              value={selectedProgramme}
              onChange={(event) =>
                setSelectedProgramme(
                  event.target.value,
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/15"
            >
              <option value="">
                All Programmes
              </option>

              {programmes.map(
                (programme) => (
                  <option
                    key={programme.id}
                    value={programme.id}
                  >
                    {programme.code
                      ? `${programme.code} — `
                      : ""}
                    {programme.name}
                  </option>
                ),
              )}
            </select>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | GraduationStatus,
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/15"
            >
              <option value="all">
                All Statuses
              </option>
              <option value="eligible">
                Eligible
              </option>
              <option value="not_eligible">
                Not Eligible
              </option>
              <option value="approved">
                Approved
              </option>
              <option value="graduated">
                Graduated
              </option>
            </select>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to load graduation data
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-brand-navy">
                  Academic Graduation Review
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {visibleRecords.length} record
                  {visibleRecords.length === 1
                    ? ""
                    : "s"} displayed
                </p>
              </div>

              {loading && (
                <Loader2 className="h-5 w-5 animate-spin text-brand-gold" />
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-gold" />

                <p className="mt-3 text-sm text-slate-500">
                  Evaluating academic records...
                </p>
              </div>
            </div>
          ) : visibleRecords.length ===
            0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <GraduationCap className="h-7 w-7" />
              </div>

              <h3 className="mt-4 font-semibold text-brand-navy">
                No graduation records found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Try changing the academic session,
                programme, status, or search term.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Programme
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Credits
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Academic Record
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {visibleRecords.map(
                    (record) => (
                      <tr
                        key={record.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-brand-gold">
                              {record.student.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-800">
                                {
                                  record
                                    .student
                                    .name
                                }
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {
                                  record
                                    .student
                                    .matricNumber
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-[230px] truncate text-sm font-medium text-slate-700">
                            {record.programme
                              ?.name ||
                              "Programme not assigned"}
                          </p>

                          {record.programme
                            ?.code && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              {
                                record
                                  .programme
                                  .code
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="w-[150px]">
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700">
                                {formatNumber(
                                  record.earnedCreditUnits,
                                )}
                              </span>

                              <span className="text-slate-400">
                                /
                                {formatNumber(
                                  record.requiredCreditUnits,
                                )}
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-brand-gold transition-all"
                                style={{
                                  width: `${
                                    record.requiredCreditUnits >
                                    0
                                      ? Math.min(
                                          100,
                                          (record.earnedCreditUnits /
                                            record.requiredCreditUnits) *
                                            100,
                                        )
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1 text-xs">
                            <p className="text-slate-600">
                              <span className="font-semibold text-slate-800">
                                {
                                  record
                                    .completedCourses
                                }
                              </span>{" "}
                              completed
                            </p>

                            <div className="flex gap-3">
                              {record.failedCourses >
                                0 && (
                                <span className="text-rose-600">
                                  {
                                    record.failedCourses
                                  }{" "}
                                  failed
                                </span>
                              )}

                              {record.missingResults >
                                0 && (
                                <span className="text-amber-600">
                                  {
                                    record.missingResults
                                  }{" "}
                                  missing
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              record.status
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openRecord(
                                record,
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-brand-navy transition hover:border-brand-gold hover:bg-brand-gold/5"
                          >
                            Review
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =================================================
            MOBILE / TABLET CARDS
        ================================================= */}

        <section className="space-y-3 lg:hidden">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-gold" />

              <p className="mt-3 text-sm text-slate-500">
                Evaluating academic records...
              </p>
            </div>
          ) : visibleRecords.length ===
            0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 font-semibold text-brand-navy">
                No graduation records found
              </p>
            </div>
          ) : (
            visibleRecords.map(
              (record) => (
                <div
                  key={record.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-brand-gold">
                        {record.student.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {
                            record.student
                              .name
                          }
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {
                            record.student
                              .matricNumber
                          }
                        </p>
                      </div>
                    </div>

                    <StatusBadge
                      status={
                        record.status
                      }
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Programme
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-700">
                        {record.programme
                          ?.name ||
                          "Not assigned"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Credits
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {
                          record.earnedCreditUnits
                        }{" "}
                        /{" "}
                        {
                          record.requiredCreditUnits
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-medium text-emerald-700">
                      {
                        record.completedCourses
                      }{" "}
                      completed
                    </span>

                    {record.failedCourses >
                      0 && (
                      <span className="rounded-lg bg-rose-50 px-2.5 py-1.5 font-medium text-rose-700">
                        {
                          record.failedCourses
                        }{" "}
                        failed
                      </span>
                    )}

                    {record.missingResults >
                      0 && (
                      <span className="rounded-lg bg-amber-50 px-2.5 py-1.5 font-medium text-amber-700">
                        {
                          record.missingResults
                        }{" "}
                        missing results
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openRecord(record)
                    }
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-semibold text-white transition hover:bg-brand-navy/95"
                  >
                    Review Graduation
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ),
            )
          )}
        </section>
      </main>

      {/* ===================================================
          REVIEW MODAL
      =================================================== */}

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}

            <div className="relative overflow-hidden bg-brand-navy px-5 py-5 sm:px-6">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-brand-gold/10" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold text-brand-navy">
                    <GraduationCap className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="font-bold text-white">
                      Graduation Review
                    </h2>

                    <p className="mt-0.5 text-sm text-slate-300">
                      {
                        selectedRecord
                          .student
                          .name
                      }
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!actionLoading) {
                      setSelectedRecord(
                        null,
                      );
                      setActionError("");
                    }
                  }}
                  className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}

            <div className="max-h-[calc(92vh-145px)] overflow-y-auto p-5 sm:p-6">
              <div className="space-y-5">
                {/* Student */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-bold text-brand-navy">
                        {
                          selectedRecord
                            .student
                            .name
                        }
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          selectedRecord
                            .student
                            .matricNumber
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          selectedRecord
                            .student
                            .email
                        }
                      </p>
                    </div>

                    <StatusBadge
                      status={
                        selectedRecord.status
                      }
                    />
                  </div>

                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Programme
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedRecord
                        .programme
                        ?.name ||
                        "Programme not assigned"}
                    </p>

                    {selectedRecord
                      .programme
                      ?.code && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {
                          selectedRecord
                            .programme
                            .code
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Academic Summary */}

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-brand-navy">
                    Academic Summary
                  </h3>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Required Credits
                      </p>

                      <p className="mt-1 text-lg font-bold text-brand-navy">
                        {
                          selectedRecord.requiredCreditUnits
                        }
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Earned Credits
                      </p>

                      <p className="mt-1 text-lg font-bold text-emerald-600">
                        {
                          selectedRecord.earnedCreditUnits
                        }
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Completed
                      </p>

                      <p className="mt-1 text-lg font-bold text-brand-navy">
                        {
                          selectedRecord.completedCourses
                        }
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Registered
                      </p>

                      <p className="mt-1 text-lg font-bold text-brand-navy">
                        {
                          selectedRecord.totalRegisteredCourses
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Issues */}

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-brand-navy">
                    Academic Checks
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />

                        <span className="text-sm text-slate-600">
                          Completed courses
                        </span>
                      </div>

                      <span className="font-semibold text-slate-800">
                        {
                          selectedRecord.completedCourses
                        }
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-rose-500" />

                        <span className="text-sm text-slate-600">
                          Failed courses
                        </span>
                      </div>

                      <span className="font-semibold text-slate-800">
                        {
                          selectedRecord.failedCourses
                        }
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500" />

                        <span className="text-sm text-slate-600">
                          Missing / unpublished results
                        </span>
                      </div>

                      <span className="font-semibold text-slate-800">
                        {
                          selectedRecord.missingResults
                        }
                      </span>
                    </div>

                    <div
                      className={`rounded-xl border p-4 ${
                        selectedRecord.status ===
                        "eligible"
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-amber-200 bg-amber-50"
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Eligibility Assessment
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {
                          selectedRecord.eligibilityReason
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}

                {selectedRecord.status !==
                  "graduated" && (
                  <div>
                    <label
                      htmlFor="graduation-notes"
                      className="mb-2 block text-sm font-semibold text-brand-navy"
                    >
                      Registrar Notes
                    </label>

                    <textarea
                      id="graduation-notes"
                      value={notes}
                      onChange={(event) =>
                        setNotes(
                          event.target.value,
                        )
                      }
                      rows={4}
                      placeholder="Add an optional review note..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15"
                    />
                  </div>
                )}

                {/* Error */}

                {actionError && (
                  <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>
                      {actionError}
                    </span>
                  </div>
                )}

                {/* Actions */}

                <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={evaluateRecord}
                    disabled={
                      actionLoading
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}

                    Re-evaluate
                  </button>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {selectedRecord.status !==
                      "graduated" && (
                      <button
                        type="button"
                        onClick={() =>
                          performAction(
                            "reject",
                          )
                        }
                        disabled={
                          actionLoading ||
                          selectedRecord.status ===
                            "not_eligible"
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <XCircle className="h-4 w-4" />
                        Return
                      </button>
                    )}

                    {selectedRecord.status ===
                      "eligible" && (
                      <button
                        type="button"
                        onClick={() =>
                          performAction(
                            "approve",
                          )
                        }
                        disabled={
                          actionLoading
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}

                        Approve Graduation
                      </button>
                    )}

                    {selectedRecord.status ===
                      "approved" && (
                      <button
                        type="button"
                        onClick={() =>
                          performAction(
                            "graduate",
                          )
                        }
                        disabled={
                          actionLoading
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 text-sm font-semibold text-brand-navy shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <GraduationCap className="h-4 w-4" />
                        )}

                        Mark as Graduated
                      </button>
                    )}

                    {selectedRecord.status ===
                      "graduated" && (
                      <div className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-5 text-sm font-semibold text-emerald-700">
                        <UserCheck className="h-4 w-4" />

                        Graduated
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit information */}

                {(selectedRecord.reviewedAt ||
                  selectedRecord.graduatedAt) && (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    {selectedRecord.reviewedAt && (
                      <p>
                        Reviewed:{" "}
                        <span className="font-medium text-slate-700">
                          {formatDate(
                            selectedRecord.reviewedAt,
                          )}
                        </span>
                      </p>
                    )}

                    {selectedRecord.graduatedAt && (
                      <p className="mt-1">
                        Graduated:{" "}
                        <span className="font-medium text-slate-700">
                          {formatDate(
                            selectedRecord.graduatedAt,
                          )}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}