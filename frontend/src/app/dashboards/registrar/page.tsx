
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  RefreshCw,
  Settings,
  UserPlus,
  Users,
  XCircle,
  LayoutDashboard,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api";

interface DashboardStats {
  totalStudents: number;
  pendingAdmissions: number;
  totalRegistrations: number;
  activeProgrammes: number;
}

interface RecentActivity {
  id: string;
  type: "admission" | "registration";
  title: string;
  description: string;
  createdAt: string;
  status?: string;
}

interface DashboardResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    recentActivity: RecentActivity[];
  };
}

const statCards = [
  {
    key: "totalStudents",
    label: "Total Students",
    description: "Active student records",
    icon: Users,
    href: "/dashboards/registrar/students",
  },
  {
    key: "pendingAdmissions",
    label: "Pending Admissions",
    description: "Applications awaiting review",
    icon: UserPlus,
    href: "/dashboards/registrar/admissions",
  },
  {
    key: "totalRegistrations",
    label: "Course Registrations",
    description: "Current course registrations",
    icon: BookOpen,
    href: "/dashboards/registrar/registrations",
  },
  {
    key: "activeProgrammes",
    label: "Active Programmes",
    description: "Currently running programmes",
    icon: GraduationCap,
    href: "/dashboards/registrar/programmes",
  },
] as const;

const quickActions = [
  {
    label: "Review Admissions",
    description: "Process admission applications",
    icon: UserPlus,
    href: "/dashboards/registrar/admissions",
  },
  {
    label: "Manage Students",
    description: "View and manage student records",
    icon: Users,
    href: "/dashboards/registrar/students",
  },
  {
    label: "Course Registrations",
    description: "Monitor student registrations",
    icon: BookOpen,
    href: "/dashboards/registrar/registrations",
  },
  {
    label: "Academic Reports",
    description: "View academic reports and statistics",
    icon: Activity,
    href: "/dashboards/registrar/reports",
  },
];

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function getActivityIcon(type: RecentActivity["type"]) {
  return type === "admission" ? UserPlus : BookOpen;
}

function getActivityColor(type: RecentActivity["type"]) {
  return type === "admission"
    ? "bg-brand-navy text-brand-gold"
    : "bg-brand-blue/10 text-brand-blue";
}

function getStatusBadge(status?: string) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  if (
    normalized === "approved" ||
    normalized === "registered" ||
    normalized === "completed"
  ) {
    return (
      <Badge className="rounded-full border-0 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 shadow-none">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    );
  }

  if (
    normalized === "rejected" ||
    normalized === "dropped" ||
    normalized === "failed"
  ) {
    return (
      <Badge className="rounded-full border-0 bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700 shadow-none">
        <XCircle className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full border-0 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 shadow-none">
      <Clock3 className="mr-1 h-3 w-3" />
      {status}
    </Badge>
  );
}

export default function RegistrarDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (sessionStatus === "loading") return;

      if (!session?.accessToken) {
        setLoading(false);
        setRefreshing(false);
        setError(
          "Your session does not contain an authentication token. Please sign in again.",
        );
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await apiGet<DashboardResponse>(
          "/dashboard/registrar",
          session.accessToken,
        );

        if (!response?.success || !response?.data) {
          throw new Error("Invalid dashboard response from the server.");
        }

        setStats(response.data.stats);
        setRecentActivity(response.data.recentActivity ?? []);
      } catch (err) {
        console.error("Registrar dashboard error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session, sessionStatus],
  );

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadDashboard();
    }

    if (sessionStatus === "unauthenticated") {
      setLoading(false);
      setError("You are not signed in.");
    }
  }, [sessionStatus, loadDashboard]);

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-xl shadow-brand-navy/20">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-800">
            Loading registrar workspace
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Card className="w-full max-w-md overflow-hidden border-0 bg-white shadow-2xl shadow-slate-200/70 ring-1 ring-slate-200">
          <CardContent className="px-7 py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mt-6 text-xl font-bold text-slate-950">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadDashboard()}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-navy/20 transition hover:-translate-y-0.5 hover:bg-brand-navy/95"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* ============================================================
            PAGE INTRO
        ============================================================ */}
<motion.section
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.45,
    ease: [0.22, 1, 0.36, 1],
  }}
  className="
    relative overflow-hidden
    rounded-2xl
    bg-brand-navy
    px-5 py-6
    shadow-lg shadow-brand-navy/10
    sm:px-7 sm:py-7
  "
>
  {/* Subtle background effects */}
  <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-32 right-1/3 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />

  {/* Subtle grid texture */}
  <div
    className="
      pointer-events-none absolute inset-0
      opacity-[0.035]
      [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
      [background-size:32px_32px]
    "
  />

  {/* Content */}
  <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    {/* Left content */}
    <div className="flex min-w-0 items-center gap-4">
      {/* Dashboard icon */}
      <div
        className="
          flex h-12 w-12 shrink-0 items-center justify-center
          rounded-xl
          border border-white/10
          bg-white/10
          text-brand-gold
          shadow-inner
          backdrop-blur-sm
          sm:h-14 sm:w-14
        "
      >
        <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7" />
      </div>

      <div className="min-w-0">
        {/* Eyebrow */}
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

          <p
            className="
              text-[10px] font-bold uppercase
              tracking-[0.2em]
              text-brand-gold
              sm:text-[11px]
            "
          >
            Registrar Portal
          </p>
        </div>

        {/* Title */}
        <h1
          className="
            mt-1
            text-2xl font-bold
            tracking-tight
            text-white
            sm:text-3xl
          "
        >
          Registrar Dashboard
        </h1>

        {/* Description */}
        <p
          className="
            mt-1.5
            max-w-2xl
            text-xs leading-5
            text-slate-300
            sm:text-sm
          "
        >
          Manage admissions, student records, registrations and academic
          operations from one central administrative workspace.
        </p>
      </div>
    </div>

    {/* Right actions */}
    <div className="flex shrink-0 items-center gap-3">
      {/* Live status */}
      <div
        className="
          hidden items-center gap-2
          rounded-lg
          border border-white/10
          bg-white/5
          px-3 py-2
          text-[11px] font-medium
          text-slate-300
          backdrop-blur-sm
          md:flex
        "
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>

        System active
      </div>

      {/* Refresh button */}
      <button
        type="button"
        onClick={() => loadDashboard(true)}
        disabled={refreshing}
        className="
          group
          inline-flex items-center justify-center gap-2
          rounded-xl
          border border-white/15
          bg-white
          px-4 py-2.5
          text-sm font-bold
          text-brand-navy
          shadow-md shadow-black/10
          transition-all duration-200
          hover:-translate-y-0.5
          hover:bg-slate-100
          hover:shadow-lg
          disabled:cursor-not-allowed
          disabled:opacity-60
          disabled:hover:translate-y-0
        "
      >
        <RefreshCw
          className={`
            h-4 w-4
            transition-transform duration-300
            ${
              refreshing
                ? "animate-spin"
                : "group-hover:rotate-45"
            }
          `}
        />

        <span>
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </span>
      </button>
    </div>
  </div>
</motion.section>



        {/* ============================================================
            ERROR
        ============================================================ */}
        {error && stats && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                <Clock3 className="h-4 w-4 text-amber-600" />
              </div>

              <p className="text-sm font-medium text-amber-800">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              className="text-sm font-bold text-amber-800 underline underline-offset-4"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* ============================================================
            STATISTICS
        ============================================================ */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-blue">
                Overview
              </p>

              <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950">
                Academic Statistics
              </h2>
            </div>

            <span className="hidden text-xs font-medium text-slate-400 sm:block">
              Live dashboard data
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card, index) => {
              const Icon = card.icon;

              const value = stats
                ? stats[card.key]
                : 0;

              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.07,
                  }}
                >
                  <Link href={card.href} className="group block">
                    <Card className="relative overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
                      {/* top brand accent */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-brand-navy transition-all duration-300 group-hover:h-1.5" />

                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold shadow-md shadow-brand-navy/15 transition-transform duration-300 group-hover:scale-105">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-400 transition-all duration-300 group-hover:border-brand-navy/10 group-hover:bg-brand-navy group-hover:text-white">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        </div>

                        <div className="mt-6">
                          <p className="text-[34px] font-extrabold leading-none tracking-tight text-slate-950">
                            {value.toLocaleString()}
                          </p>

                          <p className="mt-3 text-sm font-bold text-slate-900">
                            {card.label}
                          </p>

                          <p className="mt-1.5 text-xs leading-5 text-slate-500">
                            {card.description}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-slate-400 transition-colors group-hover:text-brand-blue">
                          View details
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ============================================================
            MAIN GRID
        ============================================================ */}
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">

          {/* ==========================================================
              RECENT ACTIVITY
          ========================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
          >
            <Card className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base font-bold text-slate-950">
                        Recent Activity
                      </h2>

                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Live
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Latest activity across the registrar workspace
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                    <Activity className="h-4.5 w-4.5" />
                  </div>
                </div>

                {recentActivity.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                      <Activity className="h-6 w-6" />
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-700">
                      No recent activity
                    </p>

                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                      New admissions and course registrations will appear
                      here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentActivity.map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);

                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                          }}
                          className="group flex gap-4 px-6 py-5 transition-colors hover:bg-slate-50/70"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getActivityColor(
                              activity.type,
                            )}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-800">
                                  {activity.title}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {activity.description}
                                </p>
                              </div>

                              {getStatusBadge(activity.status)}
                            </div>

                            <p className="mt-2 text-[11px] font-medium text-slate-400">
                              {formatDate(activity.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ==========================================================
              QUICK ACTIONS
          ========================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
          >
            <Card className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
              <CardContent className="p-0">
                <div className="border-b border-slate-100 px-6 py-5">
                  <h2 className="text-base font-bold text-slate-950">
                    Quick Actions
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Frequently used registrar functions
                  </p>
                </div>

                <div className="space-y-1.5 p-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;

                    return (
                      <motion.div
                        key={action.href}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.35 + index * 0.05,
                        }}
                      >
                        <Link
                          href={action.href}
                          className="group flex items-center gap-3 rounded-2xl p-3.5 transition-all duration-200 hover:bg-slate-50"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold shadow-sm transition-transform duration-200 group-hover:scale-105">
                            <Icon className="h-4.5 w-4.5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-800">
                              {action.label}
                            </p>

                            <p className="mt-0.5 truncate text-xs leading-5 text-slate-500">
                              {action.description}
                            </p>
                          </div>

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-300 transition-all group-hover:bg-white group-hover:text-brand-navy group-hover:shadow-sm">
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ============================================================
            ADMINISTRATION BANNER
        ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
        >
          <Card className="relative overflow-hidden border-0 bg-brand-navy shadow-xl shadow-brand-navy/15">
            <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-blue/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

            <CardContent className="relative p-6 sm:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-gold ring-1 ring-white/10">
                    <Settings className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-white sm:text-lg">
                        Registrar Administration
                      </h2>

                      <span className="rounded-full border border-brand-gold/20 bg-brand-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-gold">
                        ITMT
                      </span>
                    </div>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                      Maintain student records, academic information,
                      admissions, registrations and institutional reports
                      from one secure administrative workspace.
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboards/registrar/settings"
                  className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-navy shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

