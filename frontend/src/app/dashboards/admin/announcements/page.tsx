"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Archive,
  CheckCircle2,
  Edit3,
  FileText,
  Loader2,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Users,
  X,
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
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api";

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
  createdBy: AnnouncementCreator | string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

type AnnouncementsResponse = {
  success: boolean;
  announcements?: Announcement[];
  message?: string;
};

type AnnouncementResponse = {
  success: boolean;
  announcement?: Announcement;
  message?: string;
};

type FormState = {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  status: "draft" | "published";
};

const initialForm: FormState = {
  title: "",
  content: "",
  audience: "everyone",
  status: "draft",
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string) {
  if (!value) return "—";

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
/* =========================================================
   PAGE
========================================================= */

export default function AdminAnnouncementsPage() {
  const { data: session, status: sessionStatus } =
    useSession();

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

  const [saving, setSaving] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | AnnouncementStatus>("all");

  const [audienceFilter, setAudienceFilter] =
    useState<
      "all" | AnnouncementAudience
    >("all");

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<Announcement | null>(null);

  const [form, setForm] =
    useState<FormState>(initialForm);

  /* =========================================================
     LOAD
  ========================================================== */

  const loadAnnouncements = useCallback(
    async (showRefreshLoader = false) => {
      if (!accessToken) return;

      try {
        if (showRefreshLoader) {
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
            "Unable to load announcements.",
          );
        }

        setAnnouncements(
          response.announcements ?? [],
        );
      } catch (error) {
        console.error(
          "Load announcements error:",
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

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadAnnouncements();
    }
  }, [
    sessionStatus,
    loadAnnouncements,
  ]);

  /* =========================================================
     FILTER
  ========================================================== */

  const filteredAnnouncements =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return announcements.filter(
        (announcement) => {
          const matchesSearch =
            !query ||
            announcement.title
              .toLowerCase()
              .includes(query) ||
            announcement.content
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "all" ||
            announcement.status ===
            statusFilter;

          const matchesAudience =
            audienceFilter === "all" ||
            announcement.audience ===
            audienceFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesAudience
          );
        },
      );
    }, [
      announcements,
      search,
      statusFilter,
      audienceFilter,
    ]);

  /* =========================================================
     STATISTICS
  ========================================================== */

  const statistics = useMemo(() => {
    return {
      total: announcements.length,

      published:
        announcements.filter(
          (item) =>
            item.status === "published",
        ).length,

      drafts:
        announcements.filter(
          (item) =>
            item.status === "draft",
        ).length,

      archived:
        announcements.filter(
          (item) =>
            item.status === "archived",
        ).length,
    };
  }, [announcements]);

  /* =========================================================
     CREATE
  ========================================================== */

  function openCreate() {
    setEditingAnnouncement(null);
    setForm(initialForm);
    setDialogOpen(true);
  }

  /* =========================================================
     EDIT
  ========================================================== */

  function openEdit(
    announcement: Announcement,
  ) {
    setEditingAnnouncement(announcement);

    setForm({
      title: announcement.title,
      content: announcement.content,
      audience: announcement.audience,
      status:
        announcement.status === "published"
          ? "published"
          : "draft",
    });

    setDialogOpen(true);
  }

  /* =========================================================
     CLOSE
  ========================================================== */

  function closeDialog() {
    if (saving) return;

    setDialogOpen(false);
    setEditingAnnouncement(null);
    setForm(initialForm);
  }

  /* =========================================================
     SAVE
  ========================================================== */

  async function handleSubmit() {
    if (!accessToken) {
      toast.error(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    if (!form.title.trim()) {
      toast.error(
        "Announcement title is required.",
      );
      return;
    }

    if (!form.content.trim()) {
      toast.error(
        "Announcement content is required.",
      );
      return;
    }

    try {
      setSaving(true);

      if (editingAnnouncement) {
        const response =
          await apiPatch<AnnouncementResponse>(
            `/announcements/${editingAnnouncement._id}`,
            form,
            accessToken,
          );

        if (!response.success) {
          throw new Error(
            response.message ||
            "Unable to update announcement.",
          );
        }

        if (response.announcement) {
          setAnnouncements((current) =>
            current.map((item) =>
              item._id ===
                response.announcement!._id
                ? response.announcement!
                : item,
            ),
          );
        }

        toast.success(
          "Announcement updated successfully.",
        );
      } else {
        const response =
          await apiPost<AnnouncementResponse>(
            "/announcements",
            form,
            accessToken,
          );

        if (!response.success) {
          throw new Error(
            response.message ||
            "Unable to create announcement.",
          );
        }

        if (response.announcement) {
          setAnnouncements((current) => [
            response.announcement!,
            ...current,
          ]);
        }

        toast.success(
          form.status === "published"
            ? "Announcement published successfully."
            : "Announcement saved as draft.",
        );
      }

      closeDialog();
    } catch (error) {
      console.error(
        "Save announcement error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save announcement.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     PUBLISH
  ========================================================== */

  async function handlePublish(
    announcement: Announcement,
  ) {
    if (!accessToken) return;

    try {
      setProcessingId(announcement._id);

      const response =
        await apiPatch<AnnouncementResponse>(
          `/announcements/${announcement._id}/publish`,
          {},
          accessToken,
        );

      if (!response.success) {
        throw new Error(
          response.message ||
          "Unable to publish announcement.",
        );
      }

      if (response.announcement) {
        setAnnouncements((current) =>
          current.map((item) =>
            item._id ===
              response.announcement!._id
              ? response.announcement!
              : item,
          ),
        );
      }

      toast.success(
        "Announcement published successfully.",
      );
    } catch (error) {
      console.error(
        "Publish announcement error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to publish announcement.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  /* =========================================================
     ARCHIVE
  ========================================================== */

  async function handleArchive(
    announcement: Announcement,
  ) {
    if (!accessToken) return;

    try {
      setProcessingId(announcement._id);

      const response =
        await apiPatch<AnnouncementResponse>(
          `/announcements/${announcement._id}/archive`,
          {},
          accessToken,
        );

      if (!response.success) {
        throw new Error(
          response.message ||
          "Unable to archive announcement.",
        );
      }

      if (response.announcement) {
        setAnnouncements((current) =>
          current.map((item) =>
            item._id ===
              response.announcement!._id
              ? response.announcement!
              : item,
          ),
        );
      }

      toast.success(
        "Announcement archived successfully.",
      );
    } catch (error) {
      console.error(
        "Archive announcement error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to archive announcement.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  /* =========================================================
     DELETE
  ========================================================== */

  async function handleDelete() {
    if (!accessToken || !deleteTarget) {
      return;
    }

    try {
      setProcessingId(deleteTarget._id);

      const response =
        await apiDelete<{
          success: boolean;
          message?: string;
        }>(
          `/announcements/${deleteTarget._id}`,
          accessToken,
        );

      if (!response.success) {
        throw new Error(
          response.message ||
          "Unable to delete announcement.",
        );
      }

      setAnnouncements((current) =>
        current.filter(
          (item) =>
            item._id !== deleteTarget._id,
        ),
      );

      toast.success(
        "Announcement deleted successfully.",
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error(
        "Delete announcement error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete announcement.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  /* =========================================================
     STATUS BADGE
  ========================================================== */

  function renderStatusBadge(
    status: AnnouncementStatus,
  ) {
    if (status === "published") {
      return (
        <Badge className="border-0 bg-emerald-50 px-2.5 py-1 text-emerald-700 shadow-none">
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Published
        </Badge>
      );
    }

    if (status === "archived") {
      return (
        <Badge className="border-0 bg-slate-100 px-2.5 py-1 text-slate-600 shadow-none">
          <Archive className="mr-1.5 h-3.5 w-3.5" />
          Archived
        </Badge>
      );
    }

    return (
      <Badge className="border-0 bg-amber-50 px-2.5 py-1 text-amber-700 shadow-none">
        <FileText className="mr-1.5 h-3.5 w-3.5" />
        Draft
      </Badge>
    );
  }

  /* =========================================================
     AUTH LOADING
  ========================================================== */

  if (
    sessionStatus === "loading" ||
    (sessionStatus === "authenticated" &&
      !accessToken &&
      loading)
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
          PREMIUM HEADER
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-brand-navy px-6 py-7 shadow-xl sm:px-8 sm:py-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-gold backdrop-blur-sm">
              <Megaphone className="h-3.5 w-3.5" />
              Communication Center
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Announcements
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Create and manage official announcements
              for students, lecturers, staff, and the
              wider ITMT community.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                loadAnnouncements(true)
              }
              disabled={refreshing}
              className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing
                  ? "animate-spin"
                  : ""
                  }`}
              />
              Refresh
            </Button>

            <Button
              type="button"
              onClick={openCreate}
              className="bg-brand-gold text-brand-navy shadow-lg shadow-black/10 hover:bg-brand-gold/90"
            >
              <Plus className="h-4 w-4" />
              New Announcement
            </Button>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-brand-navy">
                  {statistics.total}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  All announcements
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy">
                <Megaphone className="h-5 w-5 text-brand-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Published
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                  {statistics.published}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Currently visible
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                <Send className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Drafts
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-amber-600">
                  {statistics.drafts}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Awaiting publication
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Archived
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-600">
                  {statistics.archived}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  No longer active
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Archive className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-brand-navy" />

            <span className="text-sm font-semibold text-brand-navy">
              Find announcements
            </span>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="announcement-search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by title or content..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                  | "all"
                  | AnnouncementStatus,
                )
              }
              className="h-11 min-w-44 rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-sm text-slate-700 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
            >
              <option value="all">
                All statuses
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="published">
                Published
              </option>

              <option value="archived">
                Archived
              </option>
            </select>

            <select
              value={audienceFilter}
              onChange={(event) =>
                setAudienceFilter(
                  event.target.value as
                  | "all"
                  | AnnouncementAudience,
                )
              }
              className="h-11 min-w-44 rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-sm text-slate-700 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
            >
              <option value="all">
                All audiences
              </option>

              <option value="everyone">
                Everyone
              </option>

              <option value="students">
                Students
              </option>

              <option value="lecturers">
                Lecturers
              </option>

              <option value="staff">
                Staff
              </option>

              <option value="finance">
                Finance
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          ANNOUNCEMENT LIBRARY
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/40 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg text-brand-navy">
                Announcement Library
              </CardTitle>

              <p className="mt-1 text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredAnnouncements.length}
                </span>{" "}
                announcement
                {filteredAnnouncements.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <div className="rounded-full bg-brand-navy/5 px-3 py-1.5 text-xs font-medium text-brand-navy">
              {statistics.published} published
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
                {announcements.length === 0
                  ? "Create your first announcement to communicate important information across the institution."
                  : "Try changing your search or filters to find what you are looking for."}
              </p>

              {announcements.length === 0 && (
                <Button
                  type="button"
                  className="mt-5 bg-brand-navy hover:bg-brand-navy/90"
                  onClick={openCreate}
                >
                  <Plus className="h-4 w-4" />
                  Create Announcement
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map(
                (announcement) => {
                  const isProcessing =
                    processingId ===
                    announcement._id;

                  const creator =
                    typeof announcement.createdBy ===
                      "object"
                      ? announcement.createdBy
                      : null;

                  return (
                    <article
                      key={announcement._id}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy/20 hover:shadow-lg"
                    >
                      <div className="absolute inset-y-0 left-0 w-1 bg-brand-navy opacity-0 transition-opacity group-hover:opacity-100" />

                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {renderStatusBadge(
                                announcement.status,
                              )}

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

                            <h3 className="mt-4 text-lg font-bold tracking-tight text-brand-navy sm:text-xl">
                              {announcement.title}
                            </h3>

                            <p className="mt-2 max-w-4xl whitespace-pre-wrap text-sm leading-7 text-slate-600">
                              {announcement.content}
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                              <span>
                                Created{" "}
                                <span className="font-medium text-slate-500">
                                  {formatDate(
                                    announcement.createdAt,
                                  )}
                                </span>
                              </span>

                              {announcement.publishedAt && (
                                <span>
                                  Published{" "}
                                  <span className="font-medium text-slate-500">
                                    {formatDate(
                                      announcement.publishedAt,
                                    )}
                                  </span>
                                </span>
                              )}

                              {creator && (
                                <span className="flex items-center gap-1.5">
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-navy text-[9px] font-bold text-brand-gold">
                                    {creator.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>

                                  By{" "}
                                  <span className="font-medium text-slate-500">
                                    {creator.name}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-wrap items-center gap-2 xl:max-w-xs xl:justify-end">
                            {announcement.status ===
                              "draft" && (
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={isProcessing}
                                  onClick={() =>
                                    handlePublish(
                                      announcement,
                                    )
                                  }
                                  className="bg-brand-navy text-white hover:bg-brand-navy/90"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send className="h-4 w-4" />
                                  )}
                                  Publish
                                </Button>
                              )}

                            {announcement.status !==
                              "archived" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                  onClick={() =>
                                    openEdit(
                                      announcement,
                                    )
                                  }
                                  className="border-slate-200 hover:border-brand-navy/30 hover:bg-brand-navy/5"
                                >
                                  <Edit3 className="h-4 w-4" />
                                  Edit
                                </Button>
                              )}

                            {announcement.status !==
                              "archived" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                  onClick={() =>
                                    handleArchive(
                                      announcement,
                                    )
                                  }
                                  className="border-slate-200 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Archive className="h-4 w-4" />
                                  )}
                                  Archive
                                </Button>
                              )}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() =>
                                setDeleteTarget(
                                  announcement,
                                )
                              }
                              className="border-red-100 text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
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
          CREATE / EDIT MODAL
      ====================================================== */}

      {dialogOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-dialog-title"
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-brand-navy px-5 py-5 sm:px-7">
              <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-brand-gold/10 blur-2xl" />

              <div className="relative flex items-start justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-gold">
                    <Megaphone className="h-3.5 w-3.5" />
                    Communication
                  </div>

                  <h2
                    id="announcement-dialog-title"
                    className="text-xl font-bold text-white"
                  >
                    {editingAnnouncement
                      ? "Edit Announcement"
                      : "New Announcement"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-300">
                    {editingAnnouncement
                      ? "Update the announcement details below."
                      : "Create an official announcement for the ITMT community."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={saving}
                  aria-label="Close dialog"
                  className="rounded-xl border border-white/10 bg-white/10 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(92vh-190px)] overflow-y-auto">
              <div className="space-y-6 p-5 sm:p-7">
                <div>
                  <label
                    htmlFor="announcement-title"
                    className="mb-2 block text-sm font-semibold text-brand-navy"
                  >
                    Announcement Title
                  </label>

                  <input
                    id="announcement-title"
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title:
                          event.target.value,
                      }))
                    }
                    maxLength={200}
                    placeholder="e.g. Semester Registration Deadline"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
                  />

                  <p className="mt-1.5 text-right text-xs text-slate-400">
                    {form.title.length}/200
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="announcement-content"
                    className="mb-2 block text-sm font-semibold text-brand-navy"
                  >
                    Announcement Content
                  </label>

                  <textarea
                    id="announcement-content"
                    value={form.content}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        content:
                          event.target.value,
                      }))
                    }
                    maxLength={10000}
                    rows={8}
                    placeholder="Write the announcement..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm leading-7 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
                  />

                  <p className="mt-1.5 text-right text-xs text-slate-400">
                    {form.content.length}/10000
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="announcement-audience-form"
                      className="mb-2 block text-sm font-semibold text-brand-navy"
                    >
                      Audience
                    </label>

                    <select
                      id="announcement-audience-form"
                      value={form.audience}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          audience:
                            event.target
                              .value as AnnouncementAudience,
                        }))
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none transition focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
                    >
                      <option value="everyone">
                        Everyone
                      </option>

                      <option value="students">
                        Students
                      </option>

                      <option value="lecturers">
                        Lecturers
                      </option>

                      <option value="staff">
                        Staff
                      </option>
                      <option value="finance">
                        Finance
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="announcement-status-form"
                      className="mb-2 block text-sm font-semibold text-brand-navy"
                    >
                      Publication Status
                    </label>

                    <select
                      id="announcement-status-form"
                      value={form.status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status:
                            event.target
                              .value as
                            | "draft"
                            | "published",
                        }))
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none transition focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
                    >
                      <option value="draft">
                        Save as Draft
                      </option>

                      <option value="published">
                        Publish Immediately
                      </option>
                    </select>
                  </div>
                </div>

                {form.status ===
                  "published" && (
                    <div className="flex gap-3 rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gold/20">
                        <Send className="h-4 w-4 text-brand-navy" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-brand-navy">
                          Ready to publish
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          This announcement will be
                          published immediately and the
                          administration notification
                          system will record the
                          publication event.
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={saving}
                className="border-slate-200"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="bg-brand-navy text-white shadow-md hover:bg-brand-navy/90"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : form.status ===
                  "published" ? (
                  <Send className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}

                {editingAnnouncement
                  ? "Save Changes"
                  : form.status ===
                    "published"
                    ? "Publish Announcement"
                    : "Save Draft"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-navy/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="h-2 bg-red-500" />

            <div className="p-6 sm:p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              <h2
                id="delete-dialog-title"
                className="mt-5 text-xl font-bold text-brand-navy"
              >
                Delete announcement?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You are about to permanently delete{" "}
                <strong className="font-semibold text-slate-700">
                  "{deleteTarget.title}"
                </strong>
                . This action cannot be undone.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                  disabled={
                    processingId ===
                    deleteTarget._id
                  }
                  className="border-slate-200"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={
                    processingId ===
                    deleteTarget._id
                  }
                  className="shadow-sm"
                >
                  {processingId ===
                    deleteTarget._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  Delete Announcement
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}