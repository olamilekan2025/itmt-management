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
  activateAcademicSession,
  createAcademicSession,
  getAcademicSessions,
  type AcademicSession,
} from "@/lib/admin-academic-sessions";

export default function AcademicSessionsPage() {
  const { data: session } = useSession();

  const accessToken =
    session?.accessToken as string | undefined;

  const [sessions, setSessions] = useState<
    AcademicSession[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);

  const [search, setSearch] = useState("");

  // Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);

  // Activation confirmation dialog
  const [activateDialogOpen, setActivateDialogOpen] =
    useState(false);

  const [sessionToActivate, setSessionToActivate] =
    useState<AcademicSession | null>(null);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  async function loadSessions() {
    if (!accessToken) return;

    setLoading(true);

    try {
      const response =
        await getAcademicSessions(accessToken);

      setSessions(response.sessions ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load academic sessions.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, [accessToken]);

  const filteredSessions = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return sessions;

    return sessions.filter((academicSession) =>
      academicSession.name
        .toLowerCase()
        .includes(value),
    );
  }, [sessions, search]);

  const activeSession = sessions.find(
    (academicSession) => academicSession.isActive,
  );

  const inactiveCount = sessions.filter(
    (academicSession) => !academicSession.isActive,
  ).length;

  function openCreate() {
    setForm({
      name: "",
      startDate: "",
      endDate: "",
    });

    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;

    setDialogOpen(false);

    setForm({
      name: "",
      startDate: "",
      endDate: "",
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!accessToken) return;

    const name = form.name.trim();

    if (name.length < 4) {
      toast.error(
        "Session name must be at least 4 characters.",
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
      await createAcademicSession(
        {
          name,
          ...(form.startDate
            ? { startDate: form.startDate }
            : {}),
          ...(form.endDate
            ? { endDate: form.endDate }
            : {}),
        },
        accessToken,
      );

      toast.success(
        "Academic session created successfully.",
      );

      setDialogOpen(false);

      setForm({
        name: "",
        startDate: "",
        endDate: "",
      });

      await loadSessions();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create academic session.",
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Opens the activation confirmation modal.
   */
  function openActivateDialog(
    academicSession: AcademicSession,
  ) {
    if (academicSession.isActive || activating) {
      return;
    }

    setSessionToActivate(academicSession);
    setActivateDialogOpen(true);
  }

  /**
   * Closes the activation confirmation modal.
   */
  function closeActivateDialog() {
    if (activating) return;

    setActivateDialogOpen(false);
    setSessionToActivate(null);
  }

  /**
   * Confirms and activates the selected academic session.
   */
  async function confirmActivate() {
    if (
      !accessToken ||
      !sessionToActivate ||
      sessionToActivate.isActive
    ) {
      return;
    }

    setActivating(true);

    try {
      await activateAcademicSession(
        sessionToActivate._id,
        accessToken,
      );

      toast.success(
        `${sessionToActivate.name} is now the active academic session.`,
      );

      setActivateDialogOpen(false);
      setSessionToActivate(null);

      await loadSessions();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to activate academic session.",
      );
    } finally {
      setActivating(false);
    }
  }

  function formatDate(date?: string) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );
  }

  return (
    <div className="min-h-full space-y-8 pb-8">
      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}

      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-brand-navy shadow-lg">
        {/* Decorative elements */}
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
              Academic Sessions
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Manage academic years, session timelines,
              and the current academic session for your
              institution.
            </p>
          </div>

          <Button
            onClick={openCreate}
            className="h-11 rounded-xl bg-brand-gold px-5 font-semibold text-brand-dark shadow-md transition hover:bg-brand-gold/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Academic Session
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
                  Total Sessions
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">
                  {sessions.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Academic sessions
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
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active Session
                </p>

                <p className="mt-2 truncate text-xl font-bold tracking-tight text-emerald-600">
                  {activeSession?.name ?? "None"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Current academic session
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
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
                  {inactiveCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Previous or upcoming sessions
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
      {/* SESSION DIRECTORY */}
      {/* ========================================================= */}

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-brand-dark">
                Academic Session Directory
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                {filteredSessions.length}{" "}
                {filteredSessions.length === 1
                  ? "session"
                  : "sessions"}{" "}
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
                    setSearch(event.target.value)
                  }
                  placeholder="Search sessions..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 sm:w-64"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={loadSessions}
                disabled={loading}
                aria-label="Refresh academic sessions"
                className="h-10 w-10 rounded-xl bg-white shadow-sm"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* LOADING */}

          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4].map((item) => (
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
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            /* EMPTY */

            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
                <CalendarDays className="h-7 w-7 text-brand-navy/50" />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-800">
                {search
                  ? "No sessions found"
                  : "No academic sessions yet"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {search
                  ? "Try adjusting your search to find the academic session you're looking for."
                  : "Create your first academic session to begin managing your institution's academic calendar."}
              </p>

              {search ? (
                <Button
                  variant="outline"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-xl"
                >
                  Clear Search
                </Button>
              ) : (
                <Button
                  onClick={openCreate}
                  className="mt-5 rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Session
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">
                        Academic Session
                      </th>

                      <th className="px-6 py-4">
                        Start Date
                      </th>

                      <th className="px-6 py-4">
                        End Date
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
                    {filteredSessions.map(
                      (academicSession) => (
                        <tr
                          key={academicSession._id}
                          className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                  academicSession.isActive
                                    ? "bg-emerald-50 group-hover:bg-emerald-100"
                                    : "bg-brand-navy/5 group-hover:bg-brand-navy/10"
                                }`}
                              >
                                <CalendarDays
                                  className={`h-4 w-4 ${
                                    academicSession.isActive
                                      ? "text-emerald-600"
                                      : "text-brand-navy"
                                  }`}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800">
                                  {academicSession.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Academic year
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {formatDate(
                              academicSession.startDate,
                            )}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {formatDate(
                              academicSession.endDate,
                            )}
                          </td>

                          <td className="px-6 py-5">
                            {academicSession.isActive ? (
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
                              {!academicSession.isActive ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openActivateDialog(
                                      academicSession,
                                    )
                                  }
                                  disabled={activating}
                                  className="rounded-lg bg-white font-medium shadow-sm hover:border-brand-navy hover:bg-brand-navy/5 hover:text-brand-navy"
                                >
                                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                  Activate
                                </Button>
                              ) : (
                                <span className="px-2 text-xs font-medium text-slate-400">
                                  Current session
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

              {/* MOBILE CARDS */}

              <div className="space-y-3 p-4 md:hidden">
                {filteredSessions.map(
                  (academicSession) => (
                    <div
                      key={academicSession._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              academicSession.isActive
                                ? "bg-emerald-50"
                                : "bg-brand-navy/5"
                            }`}
                          >
                            <CalendarDays
                              className={`h-4 w-4 ${
                                academicSession.isActive
                                  ? "text-emerald-600"
                                  : "text-brand-navy"
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {academicSession.name}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              Academic year
                            </p>
                          </div>
                        </div>

                        {academicSession.isActive ? (
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Start Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {formatDate(
                              academicSession.startDate,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            End Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {formatDate(
                              academicSession.endDate,
                            )}
                          </p>
                        </div>
                      </div>

                      {!academicSession.isActive && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openActivateDialog(
                                academicSession,
                              )
                            }
                            disabled={activating}
                            className="w-full rounded-lg font-medium"
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Activate Session
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
      {/* CREATE SESSION DIALOG */}
      {/* ========================================================= */}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!saving) {
            if (open) {
              setDialogOpen(true);
            } else {
              closeDialog();
            }
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
                  Create Academic Session
                </DialogTitle>

                <DialogDescription className="mt-1 text-xs leading-5 text-slate-500">
                  Add a new academic year and define
                  its timeline.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-6">
              {/* Session Name */}

              <div className="space-y-2">
                <label
                  htmlFor="session-name"
                  className="text-sm font-medium text-slate-700"
                >
                  Session Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="session-name"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. 2026/2027"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                />

                <p className="text-[11px] text-slate-400">
                  Use a clear academic year such as
                  2026/2027.
                </p>
              </div>

              {/* Dates */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="session-start-date"
                    className="text-sm font-medium text-slate-700"
                  >
                    Start Date
                  </label>

                  <input
                    id="session-start-date"
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        startDate:
                          event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="session-end-date"
                    className="text-sm font-medium text-slate-700"
                  >
                    End Date
                  </label>

                  <input
                    id="session-end-date"
                    type="date"
                    value={form.endDate}
                    min={form.startDate || undefined}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        endDate:
                          event.target.value,
                      }))
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
                      Session activation
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      New sessions are created as
                      inactive. You can activate the
                      appropriate session from the
                      directory when needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
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
                    Create Session
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* ACTIVATE SESSION CONFIRMATION DIALOG */}
      {/* ========================================================= */}

      <Dialog
        open={activateDialogOpen}
        onOpenChange={(open) => {
          if (!activating) {
            if (!open) {
              closeActivateDialog();
            } else {
              setActivateDialogOpen(true);
            }
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl sm:max-w-md">
          <DialogHeader className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <DialogTitle className="text-lg font-semibold text-brand-dark">
                  Activate Academic Session?
                </DialogTitle>

                <DialogDescription className="mt-1 text-sm leading-5 text-slate-500">
                  You are about to make this the
                  institution&apos;s current academic
                  session.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-6">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Selected Session
              </p>

              <p className="mt-1 text-lg font-bold text-emerald-800">
                {sessionToActivate?.name ?? "—"}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-600">
                Activating this session will make it the
                current academic session used by the
                institution. The previously active session
                will no longer be active.
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeActivateDialog}
              disabled={activating}
              className="rounded-xl"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={confirmActivate}
              disabled={activating}
              className="min-w-[140px] rounded-xl bg-brand-navy font-semibold text-white hover:bg-brand-navy/90"
            >
              {activating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Activate Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}