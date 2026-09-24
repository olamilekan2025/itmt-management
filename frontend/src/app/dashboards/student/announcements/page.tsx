"use client";

import {
  Bell,
  CalendarDays,
  ChevronRight,
  Megaphone,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { apiGet } from "@/lib/api";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  audience:
    | "everyone"
    | "students"
    | "lecturers"
    | "staff"
    | "finance";
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementResponse {
  success: boolean;
  announcements: Announcement[];
}

function getToken(session: unknown): string {
  return (
    (session as { accessToken?: string } | null)?.accessToken ?? ""
  );
}

function formatDate(date?: string) {
  if (!date) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getExcerpt(content: string, length = 180) {
  const clean = content.replace(/\s+/g, " ").trim();

  if (clean.length <= length) return clean;

  return `${clean.slice(0, length).trim()}...`;
}

export default function StudentAnnouncementsPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const token = getToken(session);

  const loadAnnouncements = async (showRefresh = false) => {
    if (!token) return;

    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiGet<AnnouncementResponse>(
        "/announcements",
        token,
      );

      setAnnouncements(response?.announcements ?? []);
    } catch (err) {
      console.error("Load student announcements error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load announcements.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === "authenticated" && token) {
      loadAnnouncements();
    }
  }, [sessionStatus, token]);

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return announcements;

    return announcements.filter((announcement) => {
      return (
        announcement.title.toLowerCase().includes(query) ||
        announcement.content.toLowerCase().includes(query)
      );
    });
  }, [announcements, search]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-0 py-5 sm:px-0 lg:px-0 lg:py-7">
        {/* Header */}
        <section className="mb-6 overflow-hidden rounded-3xl bg-brand-navy shadow-xl">
          <div className="relative overflow-hidden px-5 py-7 sm:px-8 sm:py-9">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                  <Megaphone className="h-3.5 w-3.5 text-brand-gold" />
                  Student Portal
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Announcements
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                  Stay informed about important academic updates, school
                  activities, notices and other information.
                </p>
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <Megaphone className="h-8 w-8 text-brand-gold" />
              </div>
            </div>
          </div>
        </section>

        {/* Search / controls */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search announcements..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
              />
            </div>

            <button
              type="button"
              onClick={() => loadAnnouncements(true)}
              disabled={refreshing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-brand-gold hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-100 p-2 text-red-600">
                <Bell className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-red-800">
                  Unable to load announcements
                </h2>

                <p className="mt-1 text-sm text-red-700">{error}</p>

                <button
                  type="button"
                  onClick={() => loadAnnouncements()}
                  className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-4"
                >
                  Try again
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 h-10 w-10 rounded-xl bg-slate-200" />
                <div className="h-5 w-3/4 rounded bg-slate-200" />
                <div className="mt-4 h-4 w-full rounded bg-slate-100" />
                <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
                <div className="mt-6 h-4 w-1/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          /* Empty */
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
              <Megaphone className="h-8 w-8 text-brand-navy/60" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              {search
                ? "No matching announcements"
                : "No announcements yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? "Try searching with a different keyword."
                : "Important school announcements will appear here when they are published."}
            </p>
          </section>
        ) : (
          /* Announcements */
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAnnouncements.map((announcement) => (
              <Link
                key={announcement._id}
                href={`/dashboards/student/announcements/${announcement._id}`}
                className="group"
              >
                <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy transition group-hover:bg-brand-navy group-hover:text-brand-gold">
                      <Megaphone className="h-5 w-5" />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      Published
                    </span>
                  </div>

                  <h2 className="mt-5 line-clamp-2 text-lg font-bold leading-7 text-slate-900 transition group-hover:text-brand-navy">
                    {announcement.title}
                  </h2>

                  <p className="mt-3 line-clamp-4 flex-1 text-sm leading-6 text-slate-500">
                    {getExcerpt(announcement.content)}
                  </p>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {formatDate(
                            announcement.publishedAt ??
                              announcement.createdAt,
                          )}
                        </span>
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-navy">
                        Read
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Footer information */}
        {!loading && announcements.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5" />
            {filteredAnnouncements.length} announcement
            {filteredAnnouncements.length === 1 ? "" : "s"} available
          </div>
        )}
      </div>
    </main>
  );
}