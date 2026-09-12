"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  XCircle,
  Power,
  Loader2,
} from "lucide-react";

import { apiGet, apiPatch, apiPost } from "@/lib/api";

interface AcademicSession {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SessionsResponse {
  success: boolean;
  academicSessions: AcademicSession[];
}

interface CreateSessionResponse {
  success: boolean;
  message: string;
  academicSession: AcademicSession;
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AcademicSessionsPage() {
  const { data: session, status } = useSession();

  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isActive: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = session?.accessToken;

  const loadSessions = useCallback(
    async (refresh = false) => {
      if (!token) return;

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await apiGet<SessionsResponse>(
          "/academic-sessions",
          token,
        );

        if (!response?.success) {
          throw new Error("Unable to retrieve academic sessions.");
        }

        setSessions(response.academicSessions ?? []);
      } catch (err) {
        console.error("Academic sessions error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load academic sessions.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (status === "authenticated") {
      loadSessions();
    }

    if (status === "unauthenticated") {
      setLoading(false);
      setError("You are not signed in.");
    }
  }, [status, loadSessions]);

  const filteredSessions = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return sessions;

    return sessions.filter((item) =>
      item.name.toLowerCase().includes(value),
    );
  }, [sessions, search]);

  const activeSession = sessions.find((item) => item.isActive);

  const latestSession = [...sessions].sort(
    (a, b) =>
      new Date(b.startDate).getTime() -
      new Date(a.startDate).getTime(),
  )[0];

  const handleCreate = async () => {
    if (!token) return;

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      if (!form.name.trim()) {
        throw new Error("Please enter an academic session name.");
      }

      if (!form.startDate || !form.endDate) {
        throw new Error("Please provide both start and end dates.");
      }

      if (
        new Date(form.endDate).getTime() <=
        new Date(form.startDate).getTime()
      ) {
        throw new Error("End date must be after start date.");
      }

      const response = await apiPost<CreateSessionResponse>(
        "/academic-sessions",
        {
          name: form.name.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          isActive: form.isActive,
        },
        token,
      );

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to create academic session.",
        );
      }

      setSuccess(response.message || "Academic session created successfully.");

      setForm({
        name: "",
        startDate: "",
        endDate: "",
        isActive: false,
      });

      setShowCreate(false);

      await loadSessions(true);
    } catch (err) {
      console.error("Create academic session error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create academic session.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleActivate = async (id: string) => {
    if (!token || activatingId) return;

    try {
      setActivatingId(id);
      setError("");
      setSuccess("");

      const response = await apiPatch<{
        success: boolean;
        message: string;
        academicSession: AcademicSession;
      }>(
        `/academic-sessions/${id}/activate`,
        {},
        token,
      );

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to activate academic session.",
        );
      }

      setSuccess(
        response.message || "Academic session activated successfully.",
      );

      await loadSessions(true);
    } catch (err) {
      console.error("Activate academic session error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to activate academic session.",
      );
    } finally {
      setActivatingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-xl shadow-brand-navy/20">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-800">
            Loading academic sessions
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Preparing academic structure...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* HEADER */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-brand-navy px-5 py-6 shadow-lg shadow-brand-navy/10 sm:px-7"
        >
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-1/3 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-brand-gold">
                <CalendarDays className="h-7 w-7" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                    Academic Structure
                  </p>
                </div>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Academic Sessions
                </h1>

                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
                  Create and manage institutional academic sessions and
                  control the currently active academic period.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => loadSessions(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowCreate(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-bold text-brand-navy shadow-lg shadow-brand-gold/20 transition hover:-translate-y-0.5 hover:brightness-105"
              >
                <Plus className="h-4 w-4" />
                New Session
              </button>
            </div>
          </div>
        </motion.section>

        {/* FEEDBACK */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Sessions",
              value: sessions.length,
              icon: CalendarDays,
              description: "Academic periods created",
            },
            {
              label: "Active Session",
              value: activeSession?.name || "None",
              icon: CheckCircle2,
              description: "Currently active period",
              text: true,
            },
            {
              label: "Latest Session",
              value: latestSession?.name || "None",
              icon: Sparkles,
              description: "Most recently started",
              text: true,
            },
            {
              label: "Inactive Sessions",
              value: sessions.filter((item) => !item.isActive).length,
              icon: Clock3,
              description: "Available for reference",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <div className="h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <p
                    className={`mt-5 font-extrabold tracking-tight text-slate-950 ${
                      item.text
                        ? "truncate text-lg"
                        : "text-3xl"
                    }`}
                    title={String(item.value)}
                  >
                    {item.value}
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Session Directory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Manage the academic periods available to the institution.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sessions..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
              />
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                <CalendarDays className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                No academic sessions found
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Create your first academic session to begin.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Session
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Academic Period
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSessions.map((item) => (
                    <tr
                      key={item._id}
                      className="group transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                            <CalendarDays className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {item.name}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Academic session
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-700">
                          {formatDate(item.startDate)}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          to {formatDate(item.endDate)}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        {item.isActive ? (
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

                      <td className="px-6 py-5 text-xs font-medium text-slate-500">
                        {formatDateTime(item.createdAt)}
                      </td>

                      <td className="px-6 py-5 text-right">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Current
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={activatingId === item._id}
                            onClick={() => handleActivate(item._id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand-navy/20 hover:bg-brand-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {activatingId === item._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Power className="h-3.5 w-3.5" />
                            )}
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => !creating && setShowCreate(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="h-1.5 bg-brand-gold" />

            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Create Academic Session
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add a new academic period to the institution.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Session Name
                  </label>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. 2026/2027 Academic Session"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      Start Date
                    </label>

                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          startDate: event.target.value,
                        }))
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
                      value={form.endDate}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          endDate: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Set as active session
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Activating this session will deactivate other sessions.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-slate-300 text-brand-navy accent-brand-navy"
                  />
                </label>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => setShowCreate(false)}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={creating}
                  onClick={handleCreate}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-bold text-white shadow-lg shadow-brand-navy/20 transition hover:bg-brand-navy/95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {creating ? "Creating..." : "Create Session"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

