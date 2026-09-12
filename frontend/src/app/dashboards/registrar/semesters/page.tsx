"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

import {
  CalendarRange,
  CheckCircle2,
  Clock3,
  Loader2,
  Plus,
  Power,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import {
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface AcademicSession {
  _id: string;
  name: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

interface Semester {
  _id: string;
  session: AcademicSession | string;
  name: string;
  order: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SessionsResponse {
  success: boolean;
  academicSessions: AcademicSession[];
  message?: string;
}

interface SemestersResponse {
  success: boolean;
  semesters: Semester[];
  message?: string;
}

interface CreateSemesterResponse {
  success: boolean;
  message: string;
  semester: Semester;
}

interface ActivateSemesterResponse {
  success: boolean;
  message: string;
  semester: Semester;
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(date);
}

function getSessionName(
  semester: Semester,
): string {
  if (
    typeof semester.session === "object" &&
    semester.session
  ) {
    return semester.session.name || "Unknown session";
  }

  return "Unknown session";
}

/* =========================================================
   PAGE
========================================================= */

const SemestersPage = () => {
  const {
    data: session,
    status,
  } = useSession();

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const [sessions, setSessions] = useState<
    AcademicSession[]
  >([]);

  const [semesters, setSemesters] = useState<
    Semester[]
  >([]);

  const [selectedSession, setSelectedSession] =
    useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [activatingId, setActivatingId] =
    useState<string | null>(null);

  const [showCreate, setShowCreate] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    session: "",
    name: "",
    order: "1",
    startDate: "",
    endDate: "",
    isActive: false,
  });

  const token = session?.accessToken;

  /* -------------------------------------------------------
     LOAD ACADEMIC SESSIONS
  ------------------------------------------------------- */

  const loadSessions = useCallback(
    async (): Promise<AcademicSession[]> => {
      if (!token) {
        return [];
      }

      const response =
        await apiGet<SessionsResponse>(
          "/academic-sessions",
          token,
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to retrieve academic sessions.",
        );
      }

      const items =
        response.academicSessions ?? [];

      setSessions(items);

      return items;
    },
    [token],
  );

  /* -------------------------------------------------------
     LOAD SEMESTERS
  ------------------------------------------------------- */

  const loadSemesters = useCallback(
    async (sessionId?: string) => {
      if (!token) {
        return;
      }

      const query = sessionId
        ? `/semesters?session=${encodeURIComponent(
            sessionId,
          )}`
        : "/semesters";

      const response =
        await apiGet<SemestersResponse>(
          query,
          token,
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to retrieve semesters.",
        );
      }

      setSemesters(response.semesters ?? []);
    },
    [token],
  );

  /* -------------------------------------------------------
     INITIAL LOAD
  ------------------------------------------------------- */

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const academicSessions =
          await loadSessions();

        /*
         * If there is no selected session yet,
         * automatically use the active academic session.
         */
        let sessionId = selectedSession;

        if (!sessionId) {
          const activeSession =
            academicSessions.find(
              (item) => item.isActive,
            );

          sessionId =
            activeSession?._id || "";
        }

        /*
         * Keep the UI/form synchronized.
         */
        if (sessionId) {
          setSelectedSession(sessionId);

          setForm((current) => ({
            ...current,
            session:
              current.session || sessionId,
          }));
        }

        /*
         * Load semesters using the actual session ID
         * instead of relying on asynchronous state updates.
         */
        await loadSemesters(
          sessionId || undefined,
        );
      } catch (err) {
        console.error(
          "Semesters page error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load semester data.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      token,
      selectedSession,
      loadSessions,
      loadSemesters,
    ],
  );

  /* -------------------------------------------------------
     AUTHENTICATION / INITIAL REQUEST
  ------------------------------------------------------- */

  useEffect(() => {
    if (status === "authenticated") {
      void loadData();
      return;
    }

    if (status === "unauthenticated") {
      setLoading(false);
      setError("You are not signed in.");
    }
  }, [status, loadData]);

  /* -------------------------------------------------------
     SESSION FILTER
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !token
    ) {
      return;
    }

    /*
     * Do not make a second request during the
     * initial loading cycle.
     *
     * Once the user changes the session filter,
     * selectedSession changes and this request runs.
     */
    if (!selectedSession) {
      return;
    }

    void loadSemesters(selectedSession).catch(
      (err) => {
        console.error(
          "Session filter error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load semesters.",
        );
      },
    );
  }, [
    selectedSession,
    status,
    token,
    loadSemesters,
  ]);

  /* -------------------------------------------------------
     SEARCH
  ------------------------------------------------------- */

  const filteredSemesters = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return semesters;
    }

    return semesters.filter(
      (semester) => {
        const sessionName =
          getSessionName(semester);

        return (
          semester.name
            .toLowerCase()
            .includes(value) ||
          sessionName
            .toLowerCase()
            .includes(value) ||
          String(semester.order).includes(
            value,
          )
        );
      },
    );
  }, [semesters, search]);

  /* -------------------------------------------------------
     STATISTICS
  ------------------------------------------------------- */

  const activeSemester = semesters.find(
    (semester) => semester.isActive,
  );

  const inactiveCount =
    semesters.filter(
      (semester) => !semester.isActive,
    ).length;

  /* -------------------------------------------------------
     CREATE SEMESTER
  ------------------------------------------------------- */

  const handleCreate = async () => {
    if (!token) {
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      if (!form.session) {
        throw new Error(
          "Please select an academic session.",
        );
      }

      const semesterName =
        form.name.trim();

      if (!semesterName) {
        throw new Error(
          "Please enter a semester name.",
        );
      }

      if (
        semesterName.length < 2 ||
        semesterName.length > 50
      ) {
        throw new Error(
          "Semester name must be between 2 and 50 characters.",
        );
      }

      const order = Number(form.order);

      if (
        !Number.isInteger(order) ||
        order < 1 ||
        order > 10
      ) {
        throw new Error(
          "Semester order must be between 1 and 10.",
        );
      }

      if (
        form.startDate &&
        form.endDate
      ) {
        const start =
          new Date(
            form.startDate,
          ).getTime();

        const end =
          new Date(
            form.endDate,
          ).getTime();

        if (end <= start) {
          throw new Error(
            "End date must be after start date.",
          );
        }
      }

      const response =
        await apiPost<CreateSemesterResponse>(
          "/semesters",
          {
            session: form.session,
            name: semesterName,
            order,
            ...(form.startDate
              ? {
                  startDate:
                    form.startDate,
                }
              : {}),
            ...(form.endDate
              ? {
                  endDate:
                    form.endDate,
                }
              : {}),
            isActive:
              form.isActive,
          },
          token,
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to create semester.",
        );
      }

      setSuccess(
        response.message ||
          "Semester created successfully.",
      );

      setForm({
        session:
          selectedSession ||
          form.session,
        name: "",
        order: "1",
        startDate: "",
        endDate: "",
        isActive: false,
      });

      setShowCreate(false);

      await loadSemesters(
        selectedSession ||
          form.session ||
          undefined,
      );
    } catch (err) {
      console.error(
        "Create semester error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create semester.",
      );
    } finally {
      setCreating(false);
    }
  };

  /* -------------------------------------------------------
     ACTIVATE SEMESTER
  ------------------------------------------------------- */

  const handleActivate = async (
    id: string,
  ) => {
    if (
      !token ||
      activatingId
    ) {
      return;
    }

    try {
      setActivatingId(id);
      setError("");
      setSuccess("");

      const response =
        await apiPatch<ActivateSemesterResponse>(
          `/semesters/${id}/activate`,
          {},
          token,
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to activate semester.",
        );
      }

      setSuccess(
        response.message ||
          "Semester activated successfully.",
      );

      await loadSemesters(
        selectedSession ||
          undefined,
      );
    } catch (err) {
      console.error(
        "Activate semester error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to activate semester.",
      );
    } finally {
      setActivatingId(null);
    }
  };

  /* -------------------------------------------------------
     OPEN CREATE MODAL
  ------------------------------------------------------- */

  const openCreate = () => {
    setError("");
    setSuccess("");

    setForm((current) => ({
      ...current,
      session:
        selectedSession ||
        current.session,
    }));

    setShowCreate(true);
  };

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (
    status === "loading" ||
    loading
  ) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-xl shadow-brand-navy/20">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-800">
            Loading semesters
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Preparing semester structure...
          </p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     PAGE
  ------------------------------------------------------- */

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* =================================================
            HEADER
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative overflow-hidden rounded-2xl bg-brand-navy px-5 py-6 shadow-lg shadow-brand-navy/10 sm:px-7"
        >
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-brand-gold">
                <CalendarRange className="h-7 w-7" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                    Academic Structure
                  </p>
                </div>

                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  Semesters
                </h1>

                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
                  Organize semesters within academic
                  sessions and control the active
                  semester for each session.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  void loadData(true)
                }
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-bold text-brand-navy shadow-lg shadow-brand-gold/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />

                New Semester
              </button>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            FEEDBACK
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="ml-auto text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{success}</span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="ml-auto text-emerald-500 hover:text-emerald-700"
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid gap-4 md:grid-cols-3">

          {/* TOTAL */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
              <CalendarRange className="h-5 w-5" />
            </div>

            <p className="mt-5 text-3xl font-extrabold text-slate-950">
              {semesters.length}
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Total Semesters
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Semesters in selected session
            </p>
          </div>

          {/* ACTIVE */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <p className="mt-5 truncate text-xl font-extrabold text-slate-950">
              {activeSemester?.name ||
                "None"}
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Active Semester
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Current semester for this session
            </p>
          </div>

          {/* INACTIVE */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <Clock3 className="h-5 w-5" />
            </div>

            <p className="mt-5 text-3xl font-extrabold text-slate-950">
              {inactiveCount}
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Inactive Semesters
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Other semesters in this session
            </p>
          </div>
        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search semesters..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
              />
            </div>

            <select
              value={selectedSession}
              onChange={(event) => {
                const value =
                  event.target.value;

                setSelectedSession(value);

                setForm((current) => ({
                  ...current,
                  session: value,
                }));
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
            >
              <option value="">
                All academic sessions
              </option>

              {sessions.map(
                (item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                    {item.isActive
                      ? " — Active"
                      : ""}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">

          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="text-base font-bold text-slate-950">
              Semester Directory
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              View and manage semesters associated
              with academic sessions.
            </p>
          </div>

          {filteredSemesters.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                <CalendarRange className="h-6 w-6" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-800">
                No semesters found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Create a semester for the selected
                academic session.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Semester
                    </th>

                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Session
                    </th>

                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Order
                    </th>

                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Period
                    </th>

                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSemesters.map(
                    (semester) => (
                      <tr
                        key={semester._id}
                        className="transition hover:bg-slate-50/70"
                      >

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                              <CalendarRange className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {semester.name}
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-400">
                                Semester{" "}
                                {semester.order}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                          {getSessionName(
                            semester,
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-bold text-slate-600">
                            {semester.order}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-xs font-semibold text-slate-700">
                            {formatDate(
                              semester.startDate,
                            )}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            to{" "}
                            {formatDate(
                              semester.endDate,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          {semester.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                              <Clock3 className="h-3.5 w-3.5" />
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5 text-right">
                          {semester.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Current
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                activatingId ===
                                semester._id
                              }
                              onClick={() =>
                                void handleActivate(
                                  semester._id,
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand-navy/20 hover:bg-brand-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {activatingId ===
                              semester._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Power className="h-3.5 w-3.5" />
                              )}

                              Activate
                            </button>
                          )}
                        </td>

                      </tr>
                    ),
                  )}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          CREATE MODAL
      =================================================== */}

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          <button
            type="button"
            aria-label="Close dialog"
            onClick={() =>
              !creating &&
              setShowCreate(false)
            }
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
              y: 12,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <div className="h-1.5 bg-brand-gold" />

            <div className="p-6 sm:p-7">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold">
                  <CalendarRange className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Create Semester
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add a semester to an academic
                    session.
                  </p>
                </div>

              </div>

              <div className="mt-7 space-y-5">

                {/* SESSION */}

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Academic Session
                  </label>

                  <select
                    value={form.session}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          session:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  >
                    <option value="">
                      Select academic session
                    </option>

                    {sessions.map(
                      (item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name}
                          {item.isActive
                            ? " — Active"
                            : ""}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {/* NAME + ORDER */}

                <div className="grid gap-4 sm:grid-cols-[1fr_130px]">

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      Semester Name
                    </label>

                    <input
                      value={form.name}
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            name:
                              event.target
                                .value,
                          }),
                        )
                      }
                      placeholder="e.g. First Semester"
                      maxLength={50}
                      className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      Order
                    </label>

                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={form.order}
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            order:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                    />
                  </div>

                </div>

                {/* DATES */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      Start Date
                    </label>

                    <input
                      type="date"
                      value={
                        form.startDate
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            startDate:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      End Date
                    </label>

                    <input
                      type="date"
                      value={
                        form.endDate
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            endDate:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                    />
                  </div>

                </div>

                {/* ACTIVE */}

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Set as active semester
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Other semesters in this
                      session will be
                      deactivated.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      form.isActive
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          isActive:
                            event.target
                              .checked,
                        }),
                      )
                    }
                    className="h-5 w-5 accent-brand-navy"
                  />

                </label>

              </div>

              {/* BUTTONS */}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  disabled={creating}
                  onClick={() =>
                    setShowCreate(false)
                  }
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    creating ||
                    !form.session
                  }
                  onClick={() =>
                    void handleCreate()
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-bold text-white shadow-lg shadow-brand-navy/20 transition hover:bg-brand-navy/95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {creating
                    ? "Creating..."
                    : "Create Semester"}
                </button>

              </div>

            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   IMPORTANT: EXPLICIT DEFAULT EXPORT
========================================================= */

export default SemestersPage;