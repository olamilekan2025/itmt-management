"use client";

import {
  ArrowLeft,
  CalendarDays,
  Megaphone,
  RefreshCw,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  announcement: Announcement;
}

function getToken(session: unknown): string {
  return (
    (session as { accessToken?: string } | null)?.accessToken ?? ""
  );
}

function formatDate(date?: string) {
  if (!date) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function StudentAnnouncementDetailsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const params = useParams();

  const announcementId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const token = getToken(session);

  const [announcement, setAnnouncement] =
    useState<Announcement | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnnouncement = async () => {
    if (!token || !announcementId) return;

    try {
      setLoading(true);
      setError("");

      const response = await apiGet<AnnouncementResponse>(
        `/announcements/${announcementId}`,
        token,
      );

      setAnnouncement(response?.announcement ?? null);
    } catch (err) {
      console.error("Load announcement error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this announcement.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      token &&
      announcementId
    ) {
      loadAnnouncement();
    }
  }, [sessionStatus, token, announcementId]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: announcement?.title,
          text: announcement?.content,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // User cancelled share or browser does not permit it.
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1200px] px-0 py-5 sm:px-0 lg:px-0 lg:py-8">
        {/* Back */}
        <Link
          href="/dashboards/student/announcements"
          className="mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to announcements
        </Link>

        {loading ? (
          <section className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="h-12 w-12 rounded-2xl bg-slate-200" />
            <div className="mt-6 h-9 w-3/4 rounded bg-slate-200" />
            <div className="mt-4 h-4 w-1/3 rounded bg-slate-100" />

            <div className="mt-10 space-y-3">
              <div className="h-4 rounded bg-slate-100" />
              <div className="h-4 rounded bg-slate-100" />
              <div className="h-4 w-5/6 rounded bg-slate-100" />
            </div>
          </section>
        ) : error ? (
          <section className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Megaphone className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Unable to load announcement
            </h1>

            <p className="mt-2 text-sm text-slate-500">{error}</p>

            <button
              type="button"
              onClick={loadAnnouncement}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </section>
        ) : !announcement ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Megaphone className="mx-auto h-10 w-10 text-slate-300" />

            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Announcement not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              This announcement may have been removed or is no longer
              available.
            </p>
          </section>
        ) : (
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Hero */}
            <div className="relative overflow-hidden bg-brand-navy px-6 py-8 sm:px-10 sm:py-12">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
              <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-brand-gold">
                    <Megaphone className="h-7 w-7" />
                  </div>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>

                <div className="mt-7">
                  <span className="inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Published
                  </span>

                  <h1 className="mt-4 max-w-4xl text-2xl font-bold leading-tight text-white sm:text-4xl">
                    {announcement.title}
                  </h1>

                  <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/60">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-brand-gold" />
                      {formatDate(
                        announcement.publishedAt ??
                          announcement.createdAt,
                      )}
                    </span>

                    <span className="h-1 w-1 rounded-full bg-white/30" />

                    <span>Student Announcement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8 sm:px-10 sm:py-12">
              <div className="max-w-4xl">
                <div className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700 sm:text-base">
                  {announcement.content}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 sm:px-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Please check the student portal regularly for new
                  announcements.
                </p>

                <Link
                  href="/dashboards/student/announcements"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All announcements
                </Link>
              </div>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}