"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Archive,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Megaphone,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

import { apiGet } from "@/lib/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

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
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  createdBy: AnnouncementCreator | string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementsResponse {
  success: boolean;
  announcements: Announcement[];
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(
  value?: string,
) {
  if (!value) {
    return "Not published";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatAudience(
  audience: AnnouncementAudience,
) {
  switch (audience) {
    case "everyone":
      return "Everyone";

    case "students":
      return "Students";

    case "lecturers":
      return "Lecturers";

    case "staff":
      return "Staff";

    case "finance":
      return "Finance";

    default:
      return audience;
  }
}

function getAudienceIcon(
  audience: AnnouncementAudience,
) {
  switch (audience) {
    case "students":
      return Users;

    case "lecturers":
      return Users;

    case "staff":
      return Users;

    case "finance":
      return Users;

    case "everyone":
    default:
      return BellRing;
  }
}

function getStatusStyle(
  status: AnnouncementStatus,
) {
  switch (status) {
    case "published":
      return {
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CheckCircle2,
      };

    case "archived":
      return {
        className:
          "border-slate-200 bg-slate-100 text-slate-600",
        icon: Archive,
      };

    case "draft":
    default:
      return {
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock3,
      };
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function RegistrarAnnouncementsPage() {
  const { data: session, status } = useSession();

  const accessToken = session?.accessToken;

  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | AnnouncementStatus>(
      "all",
    );

  /* =======================================================
     FETCH ANNOUNCEMENTS
  ======================================================= */

  const fetchAnnouncements = useCallback(
    async (
      showRefresh = false,
    ) => {
      if (!accessToken) {
        return;
      }

      try {
        setError(null);

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await apiGet<AnnouncementsResponse>(
            "/announcements",
            accessToken,
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to retrieve announcements.",
          );
        }

        setAnnouncements(
          Array.isArray(
            response.announcements,
          )
            ? response.announcements
            : [],
        );
      } catch (err) {
        console.error(
          "Fetch registrar announcements error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to retrieve announcements.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (
      status === "authenticated" &&
      accessToken
    ) {
      void fetchAnnouncements();
    }
  }, [
    status,
    accessToken,
    fetchAnnouncements,
  ]);

  /* =======================================================
     FILTERED ANNOUNCEMENTS
  ======================================================= */

  const filteredAnnouncements =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return announcements.filter(
        (announcement) => {
          const matchesStatus =
            statusFilter === "all" ||
            announcement.status ===
              statusFilter;

          if (!matchesStatus) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          return (
            announcement.title
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            announcement.content
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            formatAudience(
              announcement.audience,
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              )
          );
        },
      );
    }, [
      announcements,
      search,
      statusFilter,
    ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const published =
      announcements.filter(
        (item) =>
          item.status === "published",
      ).length;

    const drafts =
      announcements.filter(
        (item) =>
          item.status === "draft",
      ).length;

    const archived =
      announcements.filter(
        (item) =>
          item.status === "archived",
      ).length;

    return {
      total: announcements.length,
      published,
      drafts,
      archived,
    };
  }, [announcements]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    status === "loading" ||
    loading
  ) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Loading announcements...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 shadow-xl sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg">
              <Megaphone className="h-7 w-7 text-brand-gold" />
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/10">
                  Registrar
                </Badge>

                <Badge className="border-white/10 bg-white/10 text-white hover:bg-white/10">
                  {statistics.published} published
                </Badge>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Announcements
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Stay updated with official academic,
                administrative, and institutional
                announcements.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void fetchAnnouncements(true)
            }
            disabled={refreshing}
            className="w-fit border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
          >
            <RefreshCw
              className={cn(
                "mr-2 h-4 w-4",
                refreshing &&
                  "animate-spin",
              )}
            />

            Refresh
          </Button>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <motion.div
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-semibold">
            Unable to load announcements
          </p>

          <p className="mt-1">
            {error}
          </p>
        </motion.div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total
                </p>

                <p className="mt-2 text-2xl font-bold text-brand-navy">
                  {statistics.total}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  All announcements
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <FileText className="h-5 w-5 text-brand-navy" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Published
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {statistics.published}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Currently published
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Drafts
                </p>

                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {statistics.drafts}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Unpublished drafts
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Archived
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-700">
                  {statistics.archived}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Archived records
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Archive className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search announcements..."
                className="h-10 border-slate-200 pl-10 focus-visible:ring-brand-gold"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  "all",
                  "published",
                  "draft",
                  "archived",
                ] as const
              ).map((filter) => (
                <Button
                  key={filter}
                  type="button"
                  size="sm"
                  variant={
                    statusFilter === filter
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setStatusFilter(
                      filter,
                    )
                  }
                  className={cn(
                    "capitalize",
                    statusFilter ===
                      filter &&
                      "bg-brand-navy hover:bg-brand-navy/90",
                  )}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          ANNOUNCEMENT LIST
      ===================================================== */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-brand-navy">
                Official announcements
              </CardTitle>

              <CardDescription>
                {filteredAnnouncements.length}{" "}
                announcement
                {filteredAnnouncements.length ===
                1
                  ? ""
                  : "s"}{" "}
                displayed
              </CardDescription>
            </div>

            <Badge
              variant="outline"
              className="w-fit border-slate-200 text-slate-600"
            >
              Registrar view
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredAnnouncements.length ===
          0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Megaphone className="h-7 w-7 text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-brand-navy">
                No announcements found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are no announcements matching
                your current search or filter.
              </p>

              {(search ||
                statusFilter !==
                  "all") && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter(
                      "all",
                    );
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAnnouncements.map(
                (
                  announcement,
                  index,
                ) => {
                  const statusStyle =
                    getStatusStyle(
                      announcement.status,
                    );

                  const StatusIcon =
                    statusStyle.icon;

                  const AudienceIcon =
                    getAudienceIcon(
                      announcement.audience,
                    );

                  return (
                    <motion.article
                      key={
                        announcement._id
                      }
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: Math.min(
                          index * 0.03,
                          0.2,
                        ),
                      }}
                      className="group relative p-5 transition-colors hover:bg-slate-50/80 sm:p-6"
                    >
                      {announcement.status ===
                        "published" && (
                        <span className="absolute left-0 top-0 h-full w-1 bg-brand-gold" />
                      )}

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy">
                            <Megaphone className="h-5 w-5 text-brand-gold" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-base font-bold text-brand-navy sm:text-lg">
                                {
                                  announcement.title
                                }
                              </h2>

                              <Badge
                                variant="outline"
                                className={cn(
                                  "gap-1 text-xs",
                                  statusStyle.className,
                                )}
                              >
                                <StatusIcon className="h-3 w-3" />

                                {announcement.status}
                              </Badge>
                            </div>

                            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                              {
                                announcement.content
                              }
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <AudienceIcon className="h-3.5 w-3.5" />

                                <span>
                                  Audience:
                                </span>

                                <span className="font-semibold text-slate-700">
                                  {formatAudience(
                                    announcement.audience,
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />

                                <span>
                                  Published:
                                </span>

                                <span className="font-semibold text-slate-700">
                                  {formatDate(
                                    announcement.publishedAt,
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Clock3 className="h-3.5 w-3.5" />

                                <span>
                                  Updated:
                                </span>

                                <span className="font-semibold text-slate-700">
                                  {formatDate(
                                    announcement.updatedAt,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          FOOTER NOTE
      ===================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <BellRing className="h-4 w-4 text-brand-gold" />
          </div>

          <div>
            <p className="text-sm font-semibold text-brand-navy">
              Official communication
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Announcements are published by authorized
              administrators and serve as official
              institutional communication within the
              ITMT Management System.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

