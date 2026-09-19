"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  Loader2,
  Megaphone,
  RefreshCw,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import {
  useSession,
} from "next-auth/react";

import {
  apiGet,
} from "@/lib/api";

import {
  toast,
} from "sonner";

/* =========================================================
   TYPES
========================================================= */

type AnnouncementAudience =
  | "everyone"
  | "students"
  | "lecturers"
  | "staff"
  | "finance";

type AnnouncementStatus =
  | "draft"
  | "published"
  | "archived";

interface AnnouncementCreator {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  createdBy:
    | AnnouncementCreator
    | string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementResponse {
  success: boolean;
  announcements: Announcement[];
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(
  value?: string,
) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function getCreatorName(
  creator:
    | AnnouncementCreator
    | string,
) {
  if (
    typeof creator ===
    "string"
  ) {
    return "ITMT Administration";
  }

  return (
    creator.name ||
    "ITMT Administration"
  );
}

function getAudienceLabel(
  audience: AnnouncementAudience,
) {
  switch (audience) {
    case "everyone":
      return "Everyone";

    case "lecturers":
      return "Lecturers";

    case "students":
      return "Students";

    case "staff":
      return "Staff";

    case "finance":
      return "Finance";

    default:
      return "Announcement";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function LecturerAnnouncementsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    session?.accessToken;

  const [
    announcements,
    setAnnouncements,
  ] = useState<
    Announcement[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedAnnouncement,
    setSelectedAnnouncement,
  ] = useState<
    Announcement | null
  >(null);

  /* =======================================================
     LOAD
  ======================================================== */

  const loadAnnouncements =
    useCallback(
      async (
        showRefresh = false,
      ) => {
        if (!accessToken) {
          return;
        }

        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          const response =
            await apiGet<AnnouncementResponse>(
              "/announcements",
              accessToken,
            );

          setAnnouncements(
            response.announcements ??
              [],
          );
        } catch (error) {
          console.error(
            "Load lecturer announcements error:",
            error,
          );

          toast.error(
            "Unable to load announcements",
            {
              description:
                "Please try again.",
            },
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [accessToken],
    );

  useEffect(() => {
    if (
      sessionStatus ===
      "authenticated"
    ) {
      void loadAnnouncements();
    }
  }, [
    sessionStatus,
    loadAnnouncements,
  ]);

  /* =======================================================
     SEARCH
  ======================================================== */

  const filteredAnnouncements =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return announcements;
      }

      return announcements.filter(
        (announcement) =>
          announcement.title
            .toLowerCase()
            .includes(query) ||
          announcement.content
            .toLowerCase()
            .includes(query) ||
          getAudienceLabel(
            announcement.audience,
          )
            .toLowerCase()
            .includes(query),
      );
    }, [
      announcements,
      search,
    ]);

  /* =======================================================
     STATS
  ======================================================== */

  const total =
    announcements.length;

  const lecturerSpecific =
    announcements.filter(
      (item) =>
        item.audience ===
        "lecturers",
    ).length;

  const general =
    announcements.filter(
      (item) =>
        item.audience ===
        "everyone",
    ).length;

  /* =======================================================
     LOADING
  ======================================================== */

  if (
    sessionStatus ===
      "loading" ||
    loading
  ) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-36 rounded-3xl bg-white" />

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                1, 2, 3,
              ].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-white"
                />
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {[
                1, 2, 3, 4,
              ].map((item) => (
                <div
                  key={item}
                  className="h-64 rounded-3xl bg-white"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     DETAIL VIEW
  ======================================================== */

  if (selectedAnnouncement) {
    return (
      <AnnouncementDetail
        announcement={
          selectedAnnouncement
        }
        onBack={() =>
          setSelectedAnnouncement(
            null,
          )
        }
      />
    );
  }

  /* =======================================================
     PAGE
  ======================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-0 py-5 sm:px-0 lg:px-0 lg:py-7">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-[28px] bg-brand-navy p-5 shadow-xl sm:p-7 lg:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-28 left-1/3 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-brand-gold">
                <Megaphone className="h-3.5 w-3.5" />
                Lecturer Portal
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Announcements
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Stay updated with official
                academic and institutional
                announcements from ITMT.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadAnnouncements(
                  true,
                )
              }
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
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
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          <AnnouncementStat
            icon={Megaphone}
            label="Total announcements"
            value={total}
          />

          <AnnouncementStat
            icon={Users}
            label="For lecturers"
            value={
              lecturerSpecific
            }
            accent
          />

          <AnnouncementStat
            icon={Bell}
            label="General updates"
            value={general}
          />
        </section>

        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search announcements..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
            />
          </div>
        </section>

        {/* =================================================
            LIST
        ================================================= */}

        <section className="mt-5">
          {filteredAnnouncements.length ===
          0 ? (
            <EmptyAnnouncements
              search={search}
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredAnnouncements.map(
                (
                  announcement,
                ) => (
                  <AnnouncementCard
                    key={
                      announcement._id
                    }
                    announcement={
                      announcement
                    }
                    onOpen={() =>
                      setSelectedAnnouncement(
                        announcement,
                      )
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function AnnouncementStat({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof Bell;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            accent
              ? "bg-brand-gold/15 text-brand-gold"
              : "bg-brand-navy/5 text-brand-navy"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   ANNOUNCEMENT CARD
========================================================= */

function AnnouncementCard({
  announcement,
  onOpen,
}: {
  announcement: Announcement;
  onOpen: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-gold/30 hover:shadow-lg">
      <div className="h-1 bg-gradient-to-r from-brand-navy via-brand-gold to-brand-navy" />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
            <Megaphone className="h-5 w-5" />
          </div>

          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Published
          </span>
        </div>

        <h2 className="mt-5 line-clamp-2 text-lg font-bold tracking-tight text-slate-950">
          {announcement.title}
        </h2>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {announcement.content}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
            <Users className="h-3.5 w-3.5" />

            {getAudienceLabel(
              announcement.audience,
            )}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
            <CalendarDays className="h-3.5 w-3.5" />

            {formatDate(
              announcement.publishedAt ||
                announcement.createdAt,
            )}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
            <UserRound className="h-4 w-4 shrink-0" />

            <span className="truncate">
              {getCreatorName(
                announcement.createdBy,
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-navy px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand-navy/90"
          >
            Read more
            <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   DETAIL
========================================================= */

function AnnouncementDetail({
  announcement,
  onBack,
}: {
  announcement: Announcement;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to announcements
        </button>

        <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
          <div className="relative overflow-hidden bg-brand-navy px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-brand-gold">
                <Megaphone className="h-3.5 w-3.5" />
                Official Announcement
              </div>

              <h1 className="mt-5 max-w-4xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {announcement.title}
              </h1>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200">
                  <Users className="h-3.5 w-3.5" />

                  {getAudienceLabel(
                    announcement.audience,
                  )}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200">
                  <Clock3 className="h-3.5 w-3.5" />

                  {formatDate(
                    announcement.publishedAt ||
                      announcement.createdAt,
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 lg:p-12">
            <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Published by
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-800">
                  {getCreatorName(
                    announcement.createdBy,
                  )}
                </p>
              </div>
            </div>

            <div className="whitespace-pre-wrap text-sm leading-8 text-slate-700 sm:text-base">
              {announcement.content}
            </div>

            <div className="mt-10 rounded-2xl border border-brand-gold/20 bg-brand-gold/[0.05] p-4 sm:p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">
                  <Bell className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Lecturer Portal
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    This announcement is available
                    to you based on its intended
                    audience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyAnnouncements({
  search,
}: {
  search: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy">
        {search ? (
          <Search className="h-7 w-7" />
        ) : (
          <Megaphone className="h-7 w-7" />
        )}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        {search
          ? "No matching announcements"
          : "No announcements yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {search
          ? "Try a different search term."
          : "Official announcements for lecturers will appear here when published."}
      </p>
    </div>
  );
}