"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  CheckCircle2,
  Clock3,
  Loader2,
  Megaphone,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { apiGet } from "@/lib/api";

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

type AnnouncementCreator = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type Announcement = {
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
};

type AnnouncementsResponse = {
  success: boolean;
  announcements?: Announcement[];
  message?: string;
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getAudienceLabel(
  audience: AnnouncementAudience,
) {
  switch (audience) {
    case "everyone":
      return "Everyone";

    case "staff":
      return "Staff";

    case "finance":
      return "Finance";

    case "students":
      return "Students";

    case "lecturers":
      return "Lecturers";

    default:
      return audience;
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function FinanceAnnouncementsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  /* =========================================================
     LOAD ANNOUNCEMENTS
  ========================================================== */

  const loadAnnouncements =
    useCallback(
      async (
        showRefreshLoader = false,
      ) => {
        if (!accessToken) {
          return;
        }

        try {
          if (showRefreshLoader) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          /*
           * IMPORTANT:
           *
           * We do not send audience=finance here.
           *
           * The backend determines what Finance is allowed
           * to see:
           *
           * - everyone
           * - staff
           * - finance
           *
           * and only published announcements.
           */

          const response =
            await apiGet<AnnouncementsResponse>(
              "/announcements",
              accessToken,
            );

          if (!response.success) {
            throw new Error(
              response.message ||
                "Unable to load announcements.",
            );
          }

          setAnnouncements(
            response.announcements ?? [],
          );
        } catch (error) {
          console.error(
            "Load finance announcements error:",
            error,
          );

          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load announcements.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [accessToken],
    );

  /* =========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    if (
      sessionStatus ===
      "authenticated"
    ) {
      loadAnnouncements();
    }
  }, [
    sessionStatus,
    loadAnnouncements,
  ]);

  /* =========================================================
     SEARCH
  ========================================================== */

  const filteredAnnouncements =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

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
            .includes(query),
      );
    }, [
      announcements,
      search,
    ]);

  /* =========================================================
     STATISTICS
  ========================================================== */

  const statistics = useMemo(() => {
    const financeSpecific =
      announcements.filter(
        (announcement) =>
          announcement.audience ===
          "finance",
      ).length;

    const institutionWide =
      announcements.filter(
        (announcement) =>
          announcement.audience ===
          "everyone",
      ).length;

    const staffAnnouncements =
      announcements.filter(
        (announcement) =>
          announcement.audience ===
          "staff",
      ).length;

    return {
      total: announcements.length,
      financeSpecific,
      institutionWide,
      staffAnnouncements,
    };
  }, [announcements]);

  /* =========================================================
     AUTH LOADING
  ========================================================== */

  if (
    sessionStatus === "loading"
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-brand-navy" />

          Loading announcements...
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-6 pb-8">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-brand-navy px-6 py-7 shadow-xl sm:px-8 sm:py-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-gold backdrop-blur-sm">
              <Megaphone className="h-3.5 w-3.5" />

              Finance Communication
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Announcements
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Stay informed about important
              financial, administrative, and
              institutional updates from ITMT.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              loadAnnouncements(true)
            }
            disabled={refreshing}
            className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white sm:w-auto"
          >
            <RefreshCw
              className={
                refreshing
                  ? "h-4 w-4 animate-spin"
                  : "h-4 w-4"
              }
            />

            Refresh
          </Button>
        </div>
      </section>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-slate-200/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Available
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-brand-navy">
                  {statistics.total}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Published announcements
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy">
                <Megaphone className="h-5 w-5 text-brand-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Finance
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                  {statistics.financeSpecific}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Finance-specific updates
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                <Bell className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Institution
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-brand-navy">
                  {statistics.institutionWide +
                    statistics.staffAnnouncements}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  General and staff updates
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/5">
                <Users className="h-5 w-5 text-brand-navy" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search announcements..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
            />
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          ANNOUNCEMENTS
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/40 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg text-brand-navy">
                Latest Announcements
              </CardTitle>

              <p className="mt-1 text-sm text-slate-500">
                Important information available
                to the Finance Department.
              </p>
            </div>

            <div className="rounded-full bg-brand-navy/5 px-3 py-1.5 text-xs font-medium text-brand-navy">
              {filteredAnnouncements.length}{" "}
              {filteredAnnouncements.length ===
              1
                ? "announcement"
                : "announcements"}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/5">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-navy" />
                </div>

                Loading announcements...
              </div>
            </div>
          ) : filteredAnnouncements.length ===
            0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy">
                <Megaphone className="h-7 w-7 text-brand-gold" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-brand-navy">
                No announcements found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {announcements.length ===
                0
                  ? "There are currently no published announcements available for the Finance Department."
                  : "Try changing your search to find the announcement you are looking for."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map(
                (announcement) => {
                  const creator =
                    typeof announcement.createdBy ===
                    "object"
                      ? announcement.createdBy
                      : null;

                  return (
                    <article
                      key={
                        announcement._id
                      }
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy/20 hover:shadow-lg"
                    >
                      <div className="absolute inset-y-0 left-0 w-1 bg-brand-gold opacity-0 transition-opacity group-hover:opacity-100" />

                      <div className="p-5 sm:p-6">
                        {/* TOP */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="border-0 bg-emerald-50 px-2.5 py-1 text-emerald-700 shadow-none">
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />

                                Published
                              </Badge>

                              <Badge
                                variant="outline"
                                className="gap-1.5 border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600"
                              >
                                <Users className="h-3.5 w-3.5" />

                                {getAudienceLabel(
                                  announcement.audience,
                                )}
                              </Badge>
                            </div>

                            <h3 className="mt-4 break-words text-lg font-bold tracking-tight text-brand-navy sm:text-xl">
                              {announcement.title}
                            </h3>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
                            <Clock3 className="h-3.5 w-3.5" />

                            {formatDate(
                              announcement.publishedAt ??
                                announcement.createdAt,
                            )}
                          </div>
                        </div>

                        {/* CONTENT */}
                        <div className="mt-4 rounded-2xl bg-slate-50/70 p-4 sm:p-5">
                          <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                            {
                              announcement.content
                            }
                          </p>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                          <span>
                            Published{" "}
                            <span className="font-medium text-slate-500">
                              {formatDate(
                                announcement.publishedAt ??
                                  announcement.createdAt,
                              )}
                            </span>
                          </span>

                          {creator && (
                            <span className="flex items-center gap-1.5">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-navy text-[9px] font-bold text-brand-gold">
                                {creator.name
                                  .charAt(
                                    0,
                                  )
                                  .toUpperCase()}
                              </span>

                              By{" "}
                              <span className="font-medium text-slate-500">
                                {
                                  creator.name
                                }
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          INFORMATION PANEL
      ====================================================== */}

      <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 p-4 sm:p-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/20">
            <Megaphone className="h-5 w-5 text-brand-navy" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-navy">
              Finance communication
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              This page displays published
              announcements relevant to Finance,
              including institution-wide, staff,
              and Finance-specific announcements.
              New announcements are managed centrally
              by authorized administrators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}