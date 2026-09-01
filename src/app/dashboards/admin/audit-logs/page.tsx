"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Filter,
  RefreshCw,
  Search,
  Shield,
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
  getAuditLogs,
  type AuditLog,
} from "@/lib/admin-audit-logs";

export default function AuditLogsPage() {
  const { data: session } = useSession();

  const accessToken =
    session?.accessToken as string | undefined;

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  async function loadAuditLogs() {
    if (!accessToken) return;

    setLoading(true);

    try {
      const response = await getAuditLogs(accessToken, {
        page: currentPage,
        limit: 50,
        search: search || undefined,
        action: actionFilter || undefined,
        module: moduleFilter || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });

      setAuditLogs(response.data?.items ?? []);
      setTotal(response.data?.pagination?.total ?? 0);
      setTotalPages(response.data?.pagination?.totalPages ?? 0);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load audit logs.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAuditLogs();
  }, [accessToken, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, actionFilter, moduleFilter, roleFilter, statusFilter]);

  const actionOptions = [
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
    "OTHER",
  ];

  const moduleOptions = [
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

  const roleOptions = ["admin", "registrar", "finance", "lecturer", "student"];

  const statusOptions = ["success", "failed"];

  function clearFilters() {
    setSearch("");
    setActionFilter("");
    setModuleFilter("");
    setRoleFilter("");
    setStatusFilter("");
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getActionColor(action: string) {
    const colors: Record<string, string> = {
      CREATE: "bg-emerald-100 text-emerald-700 border-emerald-200",
      UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
      DELETE: "bg-red-100 text-red-700 border-red-200",
      LOGIN: "bg-violet-100 text-violet-700 border-violet-200",
      LOGOUT: "bg-slate-100 text-slate-700 border-slate-200",
      APPROVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
      REJECT: "bg-rose-100 text-rose-700 border-rose-200",
      ACTIVATE: "bg-emerald-100 text-emerald-700 border-emerald-200",
      DEACTIVATE: "bg-amber-100 text-amber-700 border-amber-200",
      SUSPEND: "bg-orange-100 text-orange-700 border-orange-200",
      UNSUSPEND: "bg-teal-100 text-teal-700 border-teal-200",
      ASSIGN: "bg-indigo-100 text-indigo-700 border-indigo-200",
      UNASSIGN: "bg-pink-100 text-pink-700 border-pink-200",
      PUBLISH: "bg-cyan-100 text-cyan-700 border-cyan-200",
      UNPUBLISH: "bg-gray-100 text-gray-700 border-gray-200",
      OTHER: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return colors[action] || colors.OTHER;
  }

  function getStatusColor(status: string) {
    return status === "success"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-red-100 text-red-700 border-red-200";
  }

  return (
    <div className="min-h-full space-y-8 pb-8">
      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}

      <section className="relative overflow-hidden rounded-2xl border border-brand-navy/20 bg-brand-navy shadow-lg">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-gold/15 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div>
            {/* Section Label */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                <Shield className="h-5 w-5 text-brand-gold" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
                System Security
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Audit Logs
            </h1>

            {/* Description */}
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              Track and monitor all administrative actions across the system.
              View detailed activity logs for security and compliance purposes.
            </p>
          </div>

          {/* Action */}
          <Button
            onClick={loadAuditLogs}
            disabled={loading}
            className="h-11 w-full rounded-xl bg-white px-5 font-semibold text-brand-navy shadow-md transition-all duration-200 hover:bg-white/90 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy lg:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* STATISTICS */}
      {/* ========================================================= */}

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
          <CardContent className="relative z-10 p-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Total Logs
                </p>
                <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900">
                  {total}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  All recorded activities
                </p>
              </div>
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-navy/10 to-brand-navy/20 shadow-inner">
                <FileText className="h-7 w-7 text-brand-navy" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-lg">
          <CardContent className="relative z-10 p-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Successful
                </p>
                <p className="mt-2 text-4xl font-extrabold tracking-tight text-emerald-600">
                  {auditLogs.filter((log) => log.status === "success").length}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Completed actions
                </p>
              </div>
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-inner">
                <Shield className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-br from-white to-red-50 p-6 shadow-lg">
          <CardContent className="relative z-10 p-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Failed
                </p>
                <p className="mt-2 text-4xl font-extrabold tracking-tight text-red-600">
                  {auditLogs.filter((log) => log.status === "failed").length}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Failed attempts
                </p>
              </div>
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-red-200 shadow-inner">
                <Shield className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 p-6 shadow-lg">
          <CardContent className="relative z-10 p-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Current Page
                </p>
                <p className="mt-2 text-4xl font-extrabold tracking-tight text-blue-600">
                  {currentPage}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  of {totalPages} pages
                </p>
              </div>
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-inner">
                <FileText className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ========================================================= */}
      {/* AUDIT LOGS TABLE */}
      {/* ========================================================= */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-brand-navy/10 bg-brand-navy/[0.03] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-brand-dark">
                Activity Logs
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                {auditLogs.length}{" "}
                {auditLogs.length === 1 ? "log" : "logs"} displayed
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
                  placeholder="Search logs..."
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

              {/* Filter Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="h-10 w-10 rounded-xl bg-white shadow-sm"
                aria-label="Toggle filters"
              >
                <Filter className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={loadAuditLogs}
                disabled={loading}
                aria-label="Refresh logs"
                className="h-10 w-10 rounded-xl bg-white shadow-sm"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
              >
                <option value="">All Actions</option>
                {actionOptions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>

              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
              >
                <option value="">All Modules</option>
                {moduleOptions.map((module) => (
                  <option key={module} value={module}>
                    {module.replace(/_/g, " ")}
                  </option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
              >
                <option value="">All Roles</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
              >
                <option value="">All Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              {(actionFilter || moduleFilter || roleFilter || statusFilter) && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="col-span-full sm:col-span-2 lg:col-span-4 rounded-xl"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-100 p-4"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-slate-100" />
                    <div className="h-3 w-72 rounded bg-slate-100" />
                  </div>
                  <div className="h-8 w-20 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
                <FileText className="h-7 w-7 text-brand-navy/50" />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-800">
                No audit logs found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {search || actionFilter || moduleFilter || roleFilter || statusFilter
                  ? "Try adjusting your filters to find the logs you're looking for."
                  : "No activity has been recorded yet."}
              </p>

              {(search || actionFilter || moduleFilter || roleFilter || statusFilter) && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">
                      Timestamp
                    </th>
                    <th className="px-6 py-4">
                      Actor
                    </th>
                    <th className="px-6 py-4">
                      Action
                    </th>
                    <th className="px-6 py-4">
                      Module
                    </th>
                    <th className="px-6 py-4">
                      Description
                    </th>
                    <th className="px-6 py-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {auditLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {formatDate(log.createdAt)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-800">
                            {log.actorName || log.actor?.name || "System"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {log.actorRole || log.actor?.role || "N/A"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {log.module.replace(/_/g, " ")}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="max-w-md truncate text-sm text-slate-600">
                          {log.description}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <div className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
