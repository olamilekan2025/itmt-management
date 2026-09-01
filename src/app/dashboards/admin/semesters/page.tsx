"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createSemester,
  getSemesters,
  activateSemester,
  type Semester,
} from "@/lib/admin-courses";

import {
  getAcademicSessions,
  type AcademicSession,
} from "@/lib/admin-academic-sessions";

export default function SemestersPage() {
  const { data: session } = useSession();

  const accessToken =
    session?.accessToken as string | undefined;

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);

  const [search, setSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [activateDialogOpen, setActivateDialogOpen] =
    useState(false);

  const [semesterToActivate, setSemesterToActivate] =
    useState<Semester | null>(null);

  const [form, setForm] = useState({
    name: "",
    order: "1",
    session: "",
    startDate: "",
    endDate: "",
  });

  /* =========================================================
     SESSION HELPERS
  ========================================================= */

  /**
   * Semester.session can be:
   *
   * 1. A populated SemesterSession object
   * 2. A string containing the session ObjectId
   *
   * These helpers safely handle both cases.
   */

 function getSessionId(semester: Semester): string {
  const session = semester.session;

  if (!session) {
    return "";
  }

  if (typeof session === "string") {
    return session;
  }

  return session._id;
}


function getSessionName(semester: Semester): string {
  const session = semester.session;

  if (!session) {
    return "—";
  }

  if (typeof session === "string") {
    const matchingSession = sessions.find(
      (item) => item._id === session,
    );

    return matchingSession?.name ?? "—";
  }

  return session.name;
}

  function isSessionActive(semester: Semester): boolean {
  const session = semester.session;

  if (!session) {
    return false;
  }

  if (typeof session === "string") {
    const matchingSession = sessions.find(
      (item) => item._id === session,
    );

    return matchingSession?.isActive ?? false;
  }

  return session.isActive ?? false;
}

  /* =========================================================
     LOAD DATA
  ========================================================= */

  async function loadData() {
    if (!accessToken) {
      return;
    }

    setLoading(true);

    try {
      const [
        semestersResponse,
        sessionsResponse,
      ] = await Promise.all([
        getSemesters(accessToken),
        getAcademicSessions(accessToken),
      ]);

      setSemesters(
        semestersResponse.semesters ?? [],
      );

      setSessions(
        sessionsResponse.sessions ?? [],
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load semesters.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [accessToken]);

  /* =========================================================
     FILTERED SEMESTERS
  ========================================================= */

  const filteredSemesters = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return [...semesters]
      .filter((semester) => {
        const sessionName =
          getSessionName(semester);

        const matchesSearch =
          !value ||
          semester.name
            .toLowerCase()
            .includes(value) ||
          sessionName
            .toLowerCase()
            .includes(value);

        const matchesSession =
          !sessionFilter ||
          getSessionId(semester) ===
            sessionFilter;

        return (
          matchesSearch &&
          matchesSession
        );
      })
      .sort((a, b) => {
        const sessionA =
          getSessionName(a);

        const sessionB =
          getSessionName(b);

        if (sessionA !== sessionB) {
          return sessionB.localeCompare(
            sessionA,
          );
        }

        return a.order - b.order;
      });
  }, [
    semesters,
    sessions,
    search,
    sessionFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const activeSemesters =
    semesters.filter(
      (semester) => semester.isActive,
    ).length;

  const inactiveSemesters =
    semesters.filter(
      (semester) => !semester.isActive,
    ).length;

  /* =========================================================
     CREATE SEMESTER
  ========================================================= */

  function openCreate() {
    const activeSession =
      sessions.find(
        (item) => item.isActive,
      );

    setForm({
      name: "",
      order: "1",
      session:
        activeSession?._id ?? "",
      startDate: "",
      endDate: "",
    });

    setDialogOpen(true);
  }

  function closeCreateDialog() {
    if (saving) {
      return;
    }

    setDialogOpen(false);

    setForm({
      name: "",
      order: "1",
      session: "",
      startDate: "",
      endDate: "",
    });
  }

  /* =========================================================
     ACTIVATE SEMESTER
  ========================================================= */

  function openActivateDialog(
    semester: Semester,
  ) {
    if (semester.isActive) {
      return;
    }

    setSemesterToActivate(semester);
    setActivateDialogOpen(true);
  }

  function closeActivateDialog() {
    if (activating) {
      return;
    }

    setActivateDialogOpen(false);
    setSemesterToActivate(null);
  }

  async function confirmActivate() {
    if (
      !accessToken ||
      !semesterToActivate
    ) {
      return;
    }

    setActivating(true);

    try {
      await activateSemester(
        semesterToActivate._id,
        accessToken,
      );

      toast.success(
        `${semesterToActivate.name} is now active.`,
      );

      closeActivateDialog();

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to activate semester.",
      );
    } finally {
      setActivating(false);
    }
  }

  /* =========================================================
     CREATE SUBMIT
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!accessToken) {
      return;
    }

    const name = form.name.trim();

    if (name.length < 2) {
      toast.error(
        "Semester name must be at least 2 characters.",
      );
      return;
    }

    if (!form.session) {
      toast.error(
        "Please select an academic session.",
      );
      return;
    }

    const order = Number(form.order);

    if (
      !Number.isInteger(order) ||
      order < 1 ||
      order > 10
    ) {
      toast.error(
        "Semester order must be between 1 and 10.",
      );
      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) <
        new Date(form.startDate)
    ) {
      toast.error(
        "End date cannot be earlier than the start date.",
      );
      return;
    }

    setSaving(true);

    try {
      await createSemester(
        {
          name,
          order,
          session: form.session,
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
        },
        accessToken,
      );

      toast.success(
        "Semester created successfully.",
      );

      closeCreateDialog();

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create semester.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     DATE FORMATTER
  ========================================================= */

  function formatDate(date?: string) {
    if (!date) {
      return "—";
    }

    return new Date(
      date,
    ).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-full space-y-8 pb-8">
      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}

      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-brand-navy shadow-lg">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="absolute right-1/3 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                <CalendarDays className="h-5 w-5 text-brand-gold" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Academic Structure
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Semesters
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Organize semesters within
              academic sessions, manage their
              timelines, and control the
              currently active semester.
            </p>
          </div>

          <Button
            onClick={openCreate}
            className="h-11 rounded-xl bg-brand-gold px-5 font-semibold text-brand-dark shadow-md transition hover:bg-brand-gold/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Semester
          </Button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* STATISTICS */}
      {/* ========================================================= */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Semesters
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">
                  {semesters.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Across all sessions
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/10">
                <CalendarDays className="h-5 w-5 text-brand-navy" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                  {activeSemesters}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Currently active semesters
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Inactive
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-500">
                  {inactiveSemesters}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Available for activation
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Clock3 className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ========================================================= */}
      {/* DIRECTORY */}
      {/* ========================================================= */}

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-brand-dark">
                Semester Directory
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                {filteredSemesters.length}{" "}
                {filteredSemesters.length ===
                1
                  ? "semester"
                  : "semesters"}{" "}
                displayed
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Search */}

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search semesters..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 sm:w-60"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Session Filter */}

              <select
                value={sessionFilter}
                onChange={(event) =>
                  setSessionFilter(
                    event.target.value,
                  )
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
              >
                <option value="">
                  All Sessions
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
                      {
                        academicSession.name
                      }
                    </option>
                  ),
                )}
              </select>

              <Button
                variant="outline"
                size="icon"
                onClick={loadData}
                disabled={loading}
                aria-label="Refresh semesters"
                className="h-10 w-10 rounded-xl bg-white shadow-sm"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* ===================================================== */}
          {/* LOADING */}
          {/* ===================================================== */}

          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-100 p-4"
                  >
                    <div className="h-11 w-11 rounded-xl bg-slate-100" />

                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 rounded bg-slate-100" />

                      <div className="h-3 w-64 rounded bg-slate-100" />
                    </div>

                    <div className="h-8 w-20 rounded-full bg-slate-100" />
                  </div>
                ),
              )}
            </div>
          ) : filteredSemesters.length ===
            0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
                <CalendarDays className="h-7 w-7 text-brand-navy/50" />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-800">
                {search ||
                sessionFilter
                  ? "No semesters found"
                  : "No semesters yet"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {search ||
                sessionFilter
                  ? "Try adjusting your search or session filter."
                  : "Create your first semester to begin organizing the academic structure."}
              </p>

              {search ||
              sessionFilter ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setSessionFilter(
                      "",
                    );
                  }}
                  className="mt-5 rounded-xl"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={openCreate}
                  className="mt-5 rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Semester
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* ================================================= */}
              {/* DESKTOP TABLE */}
              {/* ================================================= */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">
                        Semester
                      </th>

                      <th className="px-6 py-4">
                        Order
                      </th>

                      <th className="px-6 py-4">
                        Academic Session
                      </th>

                      <th className="px-6 py-4">
                        Timeline
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSemesters.map(
                      (semester) => (
                        <tr
                          key={
                            semester._id
                          }
                          className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                  semester.isActive
                                    ? "bg-emerald-50"
                                    : "bg-brand-navy/5"
                                }`}
                              >
                                <CalendarDays
                                  className={`h-4 w-4 ${
                                    semester.isActive
                                      ? "text-emerald-600"
                                      : "text-brand-navy"
                                  }`}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800">
                                  {
                                    semester.name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Semester{" "}
                                  {
                                    semester.order
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-bold text-slate-600">
                              {
                                semester.order
                              }
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div>
                              <p className="text-sm font-semibold text-slate-700">
                                {getSessionName(
                                  semester,
                                )}
                              </p>

                              {isSessionActive(
                                semester,
                              ) && (
                                <span className="mt-1 inline-flex text-[10px] font-medium text-emerald-600">
                                  Current session
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <p className="text-xs text-slate-500">
                                <span className="font-medium text-slate-700">
                                  Start:
                                </span>{" "}
                                {formatDate(
                                  semester.startDate,
                                )}
                              </p>

                              <p className="text-xs text-slate-500">
                                <span className="font-medium text-slate-700">
                                  End:
                                </span>{" "}
                                {formatDate(
                                  semester.endDate,
                                )}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            {semester.isActive ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                Inactive
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end">
                              {!semester.isActive ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openActivateDialog(
                                      semester,
                                    )
                                  }
                                  className="rounded-lg bg-white font-medium shadow-sm transition hover:border-brand-navy hover:bg-brand-navy/5 hover:text-brand-navy"
                                >
                                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                  Activate
                                </Button>
                              ) : (
                                <span className="px-2 text-xs font-medium text-slate-400">
                                  Current semester
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* ================================================= */}
              {/* MOBILE CARDS */}
              {/* ================================================= */}

              <div className="space-y-3 p-4 md:hidden">
                {filteredSemesters.map(
                  (semester) => (
                    <div
                      key={
                        semester._id
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              semester.isActive
                                ? "bg-emerald-50"
                                : "bg-brand-navy/5"
                            }`}
                          >
                            <CalendarDays
                              className={`h-4 w-4 ${
                                semester.isActive
                                  ? "text-emerald-600"
                                  : "text-brand-navy"
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {
                                semester.name
                              }
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              Order{" "}
                              {
                                semester.order
                              }
                            </p>
                          </div>
                        </div>

                        {semester.isActive ? (
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Academic Session
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {getSessionName(
                            semester,
                          )}
                        </p>

                        {isSessionActive(
                          semester,
                        ) && (
                          <p className="mt-1 text-[10px] font-medium text-emerald-600">
                            Current session
                          </p>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Start Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {formatDate(
                              semester.startDate,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            End Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {formatDate(
                              semester.endDate,
                            )}
                          </p>
                        </div>
                      </div>

                      {!semester.isActive && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openActivateDialog(
                                semester,
                              )
                            }
                            className="w-full rounded-lg font-medium"
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Activate Semester
                          </Button>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* CREATE SEMESTER DIALOG */}
      {/* ========================================================= */}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (saving) {
            return;
          }

          if (open) {
            setDialogOpen(true);
          } else {
            closeCreateDialog();
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl sm:max-w-lg">
          <DialogHeader className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10">
                <CalendarDays className="h-5 w-5 text-brand-navy" />
              </div>

              <div>
                <DialogTitle className="text-lg font-semibold text-brand-dark">
                  Create Semester
                </DialogTitle>

                <DialogDescription className="mt-1 text-xs leading-5 text-slate-500">
                  Add a semester to an
                  academic session and
                  define its timeline.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-6">
              {/* Name */}

              <div className="space-y-2">
                <label
                  htmlFor="semester-name"
                  className="text-sm font-medium text-slate-700"
                >
                  Semester Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="semester-name"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        name: event
                          .target.value,
                      }),
                    )
                  }
                  placeholder="e.g. First Semester"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                />
              </div>

              {/* Order + Session */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="semester-order"
                    className="text-sm font-medium text-slate-700"
                  >
                    Order
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="semester-order"
                    required
                    type="number"
                    min={1}
                    max={10}
                    value={form.order}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          order: event
                            .target.value,
                        }),
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  />

                  <p className="text-[11px] text-slate-400">
                    Controls the semester
                    sequence.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="semester-session"
                    className="text-sm font-medium text-slate-700"
                  >
                    Academic Session
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="semester-session"
                    required
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
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  >
                    <option value="">
                      Select session
                    </option>

                    {sessions.map(
                      (
                        academicSession,
                      ) => (
                        <option
                          key={
                            academicSession._id
                          }
                          value={
                            academicSession._id
                          }
                        >
                          {
                            academicSession.name
                          }
                          {academicSession.isActive
                            ? " — Active"
                            : ""}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              {/* Dates */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="semester-start-date"
                    className="text-sm font-medium text-slate-700"
                  >
                    Start Date
                  </label>

                  <input
                    id="semester-start-date"
                    type="date"
                    value={form.startDate}
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
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="semester-end-date"
                    className="text-sm font-medium text-slate-700"
                  >
                    End Date
                  </label>

                  <input
                    id="semester-end-date"
                    type="date"
                    min={
                      form.startDate ||
                      undefined
                    }
                    value={form.endDate}
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
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  />
                </div>
              </div>

              {/* Info */}

              <div className="rounded-xl border border-brand-navy/10 bg-brand-navy/[0.03] p-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-navy/10">
                    <CalendarDays className="h-4 w-4 text-brand-navy" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-brand-dark">
                      Semester activation
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      New semesters are
                      created as
                      inactive. You can
                      activate the
                      appropriate semester
                      from the directory.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={
                  closeCreateDialog
                }
                disabled={saving}
                className="rounded-xl"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="min-w-[140px] rounded-xl"
              >
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Semester
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* ACTIVATE CONFIRMATION DIALOG */}
      {/* ========================================================= */}

      <Dialog
        open={activateDialogOpen}
        onOpenChange={(open) => {
          if (activating) {
            return;
          }

          if (open) {
            setActivateDialogOpen(
              true,
            );
          } else {
            closeActivateDialog();
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl sm:max-w-md">
          <DialogHeader className="px-6 pb-4 pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>

              <div>
                <DialogTitle className="text-lg font-semibold text-brand-dark">
                  Activate Semester?
                </DialogTitle>

                <DialogDescription className="mt-2 text-sm leading-6 text-slate-500">
                  You are about to activate{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      semesterToActivate?.name
                    }
                  </span>
                  .
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 pb-5">
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
              <p className="text-xs leading-5 text-amber-800">
                This will make this semester
                the current active semester.
                The system may deactivate the
                previously active semester
                according to your backend
                rules.
              </p>
            </div>

            {semesterToActivate &&
              getSessionName(
                semesterToActivate,
              ) !== "—" && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="text-xs font-medium text-slate-500">
                    Academic Session
                  </span>

                  <span className="text-sm font-semibold text-slate-700">
                    {getSessionName(
                      semesterToActivate,
                    )}
                  </span>
                </div>
              )}
          </div>

          <DialogFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={
                closeActivateDialog
              }
              disabled={activating}
              className="rounded-xl"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={confirmActivate}
              disabled={activating}
              className="min-w-[140px] rounded-xl"
            >
              {activating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Activate Semester
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

