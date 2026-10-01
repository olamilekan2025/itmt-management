"use client";

import {
  Archive,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  MailOpen,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSession } from "next-auth/react";
import { toast } from "sonner";

import {
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api";

type ContactStatus =
  | "new"
  | "read"
  | "archived";

type ContactFilter =
  | "all"
  | ContactStatus;

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  status: ContactStatus;
  archivedAt?: string | null;
  repliedAt?: string | null;
  repliedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContactPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ContactStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
}

interface ContactResponse {
  success: boolean;
  data: ContactMessage[];
  pagination: ContactPagination;
  stats: ContactStats;
}

const PAGE_SIZE = 12;

function formatDate(value?: string | null) {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diff =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    diff / 60000,
  );

  if (minutes < 1) return "Just now";

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function initials(name: string) {
  const result = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");

  return result || "IT";
}

function getStatusLabel(
  status: ContactStatus,
) {
  if (status === "new") return "Unread";
  if (status === "read") return "Read";
  return "Archived";
}

function getStatusClasses(
  status: ContactStatus,
) {
  if (status === "new") {
    return {
      badge:
        "border-amber-200 bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    };
  }

  if (status === "archived") {
    return {
      badge:
        "border-slate-200 bg-slate-100 text-slate-500",
      dot: "bg-slate-400",
    };
  }

  return {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  };
}

function StatusBadge({
  status,
}: {
  status: ContactStatus;
}) {
  const styles =
    getStatusClasses(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${styles.badge}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
      />

      {getStatusLabel(status)}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex animate-pulse gap-4">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-200" />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-36 rounded-full bg-slate-200" />
            <div className="h-3 w-20 rounded-full bg-slate-200" />
          </div>

          <div className="h-3 w-48 max-w-full rounded-full bg-slate-200" />

          <div className="h-4 w-3/4 rounded-full bg-slate-200" />

          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-slate-200" />
            <div className="h-3 w-2/3 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  active,
  iconClassName,
  onClick,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof Mail;
  active: boolean;
  iconClassName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-5 ${
        active
          ? "border-brand-gold/70 ring-4 ring-brand-gold/10"
          : "border-slate-200/80"
      }`}
    >
      {active && (
        <span className="absolute inset-x-0 top-0 h-0.5 bg-brand-gold" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-[11px]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
            {value.toLocaleString("en-NG")}
          </p>

          <p className="mt-1 text-[11px] font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${iconClassName}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </button>
  );
}

function EmptyState({
  search,
  status,
  onClear,
}: {
  search: string;
  status: ContactFilter;
  onClear: () => void;
}) {
  const hasFilters =
    Boolean(search.trim()) ||
    status !== "all";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-gold/5 blur-2xl" />

      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-gold/10 bg-brand-navy/[0.04]">
        {hasFilters ? (
          <Search className="h-7 w-7 text-brand-navy/50" />
        ) : (
          <Mail className="h-7 w-7 text-brand-navy/50" />
        )}
      </div>

      <h3 className="relative mt-5 text-base font-black text-brand-navy">
        {hasFilters
          ? "No matching messages"
          : "Your inbox is quiet"}
      </h3>

      <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try adjusting your search or status filter to find what you are looking for."
          : "Messages submitted through the public ITMT contact form will appear here."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="relative mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-bold text-white shadow-lg shadow-brand-navy/10 transition hover:-translate-y-0.5 hover:bg-brand-navy/95"
        >
          <X className="h-4 w-4" />
          Clear filters
        </button>
      )}
    </div>
  );
}

export default function AdminContactMessagesPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    session?.accessToken as
      | string
      | undefined;

  const [messages, setMessages] =
    useState<ContactMessage[]>([]);

  const [selected, setSelected] =
    useState<ContactMessage | null>(null);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<ContactFilter>("all");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState<ContactPagination | null>(
      null,
    );

  const [stats, setStats] =
    useState<ContactStats>({
      total: 0,
      unread: 0,
      read: 0,
      archived: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [reply, setReply] =
    useState("");

  const [sendingReply, setSendingReply] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const requestRef = useRef(0);

  /*
   * ---------------------------------------------------------
   * LOAD MESSAGES
   * ---------------------------------------------------------
   */

  const loadMessages = useCallback(
    async (
      silent = false,
      requestedPage = 1,
      requestedSearch = "",
      requestedStatus: ContactFilter = "all",
    ) => {
      if (!accessToken) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const requestId =
        ++requestRef.current;

      try {
        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(requestedPage),
        );

        params.set(
          "limit",
          String(PAGE_SIZE),
        );

        const trimmedSearch =
          requestedSearch.trim();

        if (trimmedSearch) {
          params.set(
            "search",
            trimmedSearch,
          );
        }

        if (requestedStatus !== "all") {
          params.set(
            "status",
            requestedStatus,
          );
        }

        const response =
          await apiGet<ContactResponse>(
            `/contact?${params.toString()}`,
            accessToken,
          );

        if (
          requestId !==
          requestRef.current
        ) {
          return;
        }

        const incomingMessages =
          Array.isArray(response.data)
            ? response.data
            : [];

        setMessages(incomingMessages);

        setPagination(
          response.pagination ?? null,
        );

        setStats(
          response.stats ?? {
            total: 0,
            unread: 0,
            read: 0,
            archived: 0,
          },
        );
      } catch (error) {
        console.error(
          "Load contact messages error:",
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load contact messages.",
        );
      } finally {
        if (
          requestId ===
          requestRef.current
        ) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [accessToken],
  );

  /*
   * ---------------------------------------------------------
   * INITIAL LOAD
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (
      sessionStatus ===
      "unauthenticated"
    ) {
      setLoading(false);
      return;
    }

    if (accessToken) {
      loadMessages(
        false,
        page,
        search,
        status,
      );
    }
  }, [
    sessionStatus,
    accessToken,
    page,
    status,
    loadMessages,
  ]);

  /*
   * ---------------------------------------------------------
   * SEARCH DEBOUNCE
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        if (page !== 1) {
          setPage(1);
          return;
        }

        if (
          sessionStatus ===
            "authenticated" &&
          accessToken
        ) {
          loadMessages(
            false,
            1,
            search,
            status,
          );
        }
      }, 450);

    return () =>
      window.clearTimeout(timeout);
  }, [
    search,
    accessToken,
    sessionStatus,
    status,
    page,
    loadMessages,
  ]);

  /*
   * ---------------------------------------------------------
   * CLOSE SELECTED MESSAGE IF IT LEAVES CURRENT RESULTS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!selected || loading) {
      return;
    }

    const exists = messages.some(
      (item) =>
        item._id === selected._id,
    );

    if (!exists) {
      setSelected(null);
      setShowDetails(false);
      setReply("");
    }
  }, [messages, selected, loading]);

  /*
   * ---------------------------------------------------------
   * SELECT MESSAGE
   * ---------------------------------------------------------
   */

  const handleSelect = async (
    message: ContactMessage,
  ) => {
    setSelected(message);
    setReply("");
    setShowDetails(true);

    if (
      message.status !== "new" ||
      !accessToken
    ) {
      return;
    }

    setMessages((current) =>
      current.map((item) =>
        item._id === message._id
          ? {
              ...item,
              isRead: true,
              status: "read",
            }
          : item,
      ),
    );

    setSelected((current) =>
      current
        ? {
            ...current,
            isRead: true,
            status: "read",
          }
        : current,
    );

    setStats((current) => ({
      ...current,
      unread: Math.max(
        current.unread - 1,
        0,
      ),
      read: current.read + 1,
    }));

    try {
      await apiPatch(
        `/contact/${message._id}/read`,
        {},
        accessToken,
      );
    } catch (error) {
      console.error(
        "Mark message as read error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to mark message as read.",
      );

      await loadMessages(
        true,
        page,
        search,
        status,
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * ARCHIVE
   * ---------------------------------------------------------
   */

  const handleArchive = async (
    message: ContactMessage,
  ) => {
    if (!accessToken) return;

    setProcessingId(message._id);

    try {
      await apiPatch(
        `/contact/${message._id}/archive`,
        {},
        accessToken,
      );

      toast.success(
        "Message archived successfully.",
      );

      setSelected(null);
      setShowDetails(false);
      setReply("");

      await loadMessages(
        true,
        page,
        search,
        status,
      );
    } catch (error) {
      console.error(
        "Archive contact message error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to archive message.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * RESTORE
   * ---------------------------------------------------------
   */

  const handleRestore = async (
    message: ContactMessage,
  ) => {
    if (!accessToken) return;

    setProcessingId(message._id);

    try {
      await apiPatch(
        `/contact/${message._id}/restore`,
        {},
        accessToken,
      );

      toast.success(
        "Message restored successfully.",
      );

      setSelected(null);
      setShowDetails(false);
      setReply("");

      await loadMessages(
        true,
        page,
        search,
        status,
      );
    } catch (error) {
      console.error(
        "Restore contact message error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to restore message.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * REPLY
   * ---------------------------------------------------------
   */

  const handleReply = async () => {
    if (
      !selected ||
      !accessToken
    ) {
      return;
    }

    if (
      selected.status === "archived"
    ) {
      toast.error(
        "Restore the message before sending a reply.",
      );
      return;
    }

    const trimmedReply =
      reply.trim();

    if (!trimmedReply) {
      toast.error(
        "Please enter a reply.",
      );
      return;
    }

    if (trimmedReply.length > 5000) {
      toast.error(
        "Your reply cannot exceed 5,000 characters.",
      );
      return;
    }

    setSendingReply(true);

    try {
      const response =
        await apiPost<{
          success: boolean;
          message: string;
          data?: ContactMessage;
        }>(
          `/contact/${selected._id}/reply`,
          {
            message: trimmedReply,
          },
          accessToken,
        );

      toast.success(
        response.message ||
          "Reply sent successfully.",
      );

      setReply("");

      const updated: ContactMessage = {
        ...selected,
        isRead: true,
        status: "read",
        repliedAt:
          response.data?.repliedAt ??
          new Date().toISOString(),
        repliedBy:
          response.data?.repliedBy ??
          selected.repliedBy ??
          null,
        updatedAt:
          response.data?.updatedAt ??
          new Date().toISOString(),
      };

      setSelected(updated);

      setMessages((current) =>
        current.map((item) =>
          item._id === selected._id
            ? updated
            : item,
        ),
      );

      if (
        selected.status === "new"
      ) {
        setStats((current) => ({
          ...current,
          unread: Math.max(
            current.unread - 1,
            0,
          ),
          read: current.read + 1,
        }));
      }
    } catch (error) {
      console.error(
        "Reply contact message error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send the reply.",
      );
    } finally {
      setSendingReply(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * CLEAR FILTERS
   * ---------------------------------------------------------
   */

  const clearFilters =
    useCallback(() => {
      setSearch("");
      setStatus("all");
      setPage(1);
    }, []);

  /*
   * ---------------------------------------------------------
   * PAGE LABEL
   * ---------------------------------------------------------
   */

  const pageLabel =
    useMemo(() => {
      if (!pagination) {
        return "0 messages";
      }

      return `${pagination.total.toLocaleString(
        "en-NG",
      )} ${
        pagination.total === 1
          ? "message"
          : "messages"
      }`;
    }, [pagination]);

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="min-h-full bg-[#f7f8fa]">
      <div className="mx-auto max-w-[1680px] space-y-6 p-0 sm:p-0 lg:p-0">
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,81,0.12),transparent_35%)]" />

          <div className="relative flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gold/10">
                  <MessageCircle className="h-4 w-4 text-brand-gold" />
                </span>

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold sm:text-xs">
                  Communication
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-brand-navy sm:text-3xl lg:text-4xl">
                  Contact Messages
                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Inbox active
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review enquiries, respond to visitors,
                and keep your public communication
                organized from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadMessages(
                  true,
                  page,
                  search,
                  status,
                )
              }
              disabled={
                refreshing ||
                sessionStatus === "loading"
              }
              className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-gold/50 hover:text-brand-navy hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh inbox"}
            </button>
          </div>
        </section>

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total"
            value={stats.total}
            description="All enquiries"
            icon={Mail}
            active={status === "all"}
            iconClassName="bg-brand-navy/5 text-brand-navy"
            onClick={() =>
              setStatus("all")
            }
          />

          <StatCard
            label="Unread"
            value={stats.unread}
            description="Awaiting attention"
            icon={MailOpen}
            active={status === "new"}
            iconClassName="bg-amber-50 text-amber-600"
            onClick={() =>
              setStatus("new")
            }
          />

          <StatCard
            label="Read"
            value={stats.read}
            description="Reviewed messages"
            icon={Check}
            active={status === "read"}
            iconClassName="bg-emerald-50 text-emerald-600"
            onClick={() =>
              setStatus("read")
            }
          />

          <StatCard
            label="Archived"
            value={stats.archived}
            description="Stored messages"
            icon={Archive}
            active={status === "archived"}
            iconClassName="bg-slate-100 text-slate-500"
            onClick={() =>
              setStatus("archived")
            }
          />
        </section>

        {/* =====================================================
            SEARCH TOOLBAR
        ====================================================== */}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search name, email, subject or message..."
                aria-label="Search contact messages"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex min-w-0 gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(
                [
                  ["all", "All"],
                  ["new", "Unread"],
                  ["read", "Read"],
                  ["archived", "Archived"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setStatus(value);
                    setPage(1);
                  }}
                  className={`flex h-9 shrink-0 items-center justify-center rounded-lg px-3 text-xs font-black transition sm:px-4 ${
                    status === value
                      ? "bg-white text-brand-navy shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {label}

                  {value === "new" &&
                    stats.unread > 0 && (
                      <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-700">
                        {stats.unread}
                      </span>
                    )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN WORKSPACE
        ====================================================== */}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_480px]">
          {/* ===================================================
              MESSAGE LIST
          ==================================================== */}

          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-4 px-1">
              <div>
                <p className="text-sm font-bold text-slate-600">
                  {pageLabel}
                </p>

                <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                  {search
                    ? `Results for "${search}"`
                    : status === "all"
                      ? "Latest contact enquiries"
                      : `${getStatusLabel(
                          status,
                        )} messages`}
                </p>
              </div>

              {pagination && (
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-black text-slate-400 shadow-sm">
                  <span>
                    Page {pagination.page}
                  </span>

                  <span className="text-slate-300">
                    /
                  </span>

                  <span>
                    {Math.max(
                      pagination.totalPages,
                      1,
                    )}
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid gap-3">
                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <SkeletonCard
                    key={index}
                  />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <EmptyState
                search={search}
                status={status}
                onClear={clearFilters}
              />
            ) : (
              <div className="grid gap-3">
                {messages.map(
                  (message) => {
                    const active =
                      selected?._id ===
                      message._id;

                    const isUnread =
                      message.status ===
                      "new";

                    return (
                      <button
                        key={
                          message._id
                        }
                        type="button"
                        onClick={() =>
                          handleSelect(
                            message,
                          )
                        }
                        aria-label={`Open message from ${message.name}`}
                        className={`group relative w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${
                          active
                            ? "border-brand-gold/60 ring-4 ring-brand-gold/10"
                            : "border-slate-200/80"
                        }`}
                      >
                        {isUnread && (
                          <span className="absolute bottom-0 left-0 top-0 w-1 bg-brand-gold" />
                        )}

                        <div className="p-4 sm:p-5">
                          <div className="flex gap-3.5 sm:gap-4">
                            {/* Avatar */}
                            <div
                              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-black text-white shadow-sm sm:h-12 sm:w-12 ${
                                isUnread
                                  ? "bg-brand-navy"
                                  : "bg-slate-400"
                              }`}
                            >
                              {initials(
                                message.name,
                              )}

                              {isUnread && (
                                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-brand-gold" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <h3
                                      className={`truncate text-sm ${
                                        isUnread
                                          ? "font-black text-brand-navy"
                                          : "font-bold text-slate-700"
                                      }`}
                                    >
                                      {
                                        message.name
                                      }
                                    </h3>

                                    {message.repliedAt && (
                                      <span className="hidden shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-blue-700 sm:inline-flex">
                                        <Check className="h-2.5 w-2.5" />
                                        Replied
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                                    {
                                      message.email
                                    }
                                  </p>
                                </div>

                                <div className="flex shrink-0 flex-col items-end gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-400">
                                    {formatRelativeDate(
                                      message.createdAt,
                                    )}
                                  </span>

                                  <ChevronRight
                                    className={`h-4 w-4 transition-transform ${
                                      active
                                        ? "translate-x-0.5 text-brand-gold"
                                        : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-500"
                                    }`}
                                  />
                                </div>
                              </div>

                              <p
                                className={`mt-3 truncate text-sm ${
                                  isUnread
                                    ? "font-black text-slate-800"
                                    : "font-bold text-slate-600"
                                }`}
                              >
                                {
                                  message.subject
                                }
                              </p>

                              <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-400">
                                {
                                  message.message
                                }
                              </p>

                              <div className="mt-3 flex items-center justify-between gap-3">
                                <StatusBadge
                                  status={
                                    message.status
                                  }
                                />

                                <span className="text-[10px] font-medium text-slate-400">
                                  {formatDate(
                                    message.createdAt,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading &&
              pagination &&
              pagination.totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
                  <button
                    type="button"
                    disabled={
                      !pagination.hasPreviousPage ||
                      refreshing
                    }
                    onClick={() =>
                      setPage(
                        (value) =>
                          Math.max(
                            value - 1,
                            1,
                          ),
                      )
                    }
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-black text-slate-600 transition hover:bg-slate-100 hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />

                    <span className="hidden sm:inline">
                      Previous
                    </span>
                  </button>

                  <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-500">
                    {pagination.page}{" "}
                    <span className="mx-1 text-slate-300">
                      /
                    </span>{" "}
                    {pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      !pagination.hasNextPage ||
                      refreshing
                    }
                    onClick={() =>
                      setPage(
                        (value) =>
                          value + 1,
                      )
                    }
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-black text-slate-600 transition hover:bg-slate-100 hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                  >
                    <span className="hidden sm:inline">
                      Next
                    </span>

                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
          </section>

          {/* ===================================================
              DESKTOP DETAILS / MOBILE DRAWER
          ==================================================== */}

          <aside
            className={
              showDetails
                ? "fixed inset-0 z-50 flex xl:static xl:z-auto"
                : "hidden xl:flex"
            }
            aria-label="Contact message details"
          >
            {showDetails && (
              <button
                type="button"
                aria-label="Close message details"
                onClick={() =>
                  setShowDetails(false)
                }
                className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm xl:hidden"
              />
            )}

            <div
              className={`relative ml-auto flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:max-h-[860px] xl:rounded-3xl xl:border xl:border-slate-200/80 xl:shadow-lg ${
                showDetails
                  ? "max-w-xl"
                  : ""
              }`}
            >
              {!selected ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-brand-gold/10 bg-brand-navy/[0.04]">
                      <MailOpen className="h-8 w-8 text-brand-navy/50" />
                    </div>

                    <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-brand-gold text-white shadow-sm">
                      <Sparkles className="h-3 w-3" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-lg font-black text-brand-navy">
                    Select an enquiry
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    Choose a message from your inbox
                    to read the full enquiry and send
                    a response.
                  </p>
                </div>
              ) : (
                <>
                  {/* =============================================
                      DETAILS HEADER
                  ============================================== */}

                  <div className="relative shrink-0 border-b border-slate-200 bg-white">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-navy via-brand-gold to-brand-navy" />

                    <div className="flex items-center justify-between px-4 pb-4 pt-5 sm:px-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/5">
                          <MessageCircle className="h-4 w-4 text-brand-navy" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-gold">
                            Message details
                          </p>

                          <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                            {formatDate(
                              selected.createdAt,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Close message"
                          onClick={() =>
                            setShowDetails(
                              false,
                            )
                          }
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 xl:hidden"
                        >
                          <X className="h-5 w-5" />
                        </button>

                        <button
                          type="button"
                          aria-label="More message actions"
                          className="hidden rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:block"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* =============================================
                      DETAILS BODY
                  ============================================== */}

                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-5">
                      {/* Sender */}
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-sm font-black text-white shadow-sm">
                            {initials(
                              selected.name,
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="truncate text-sm font-black text-brand-navy">
                                {
                                  selected.name
                                }
                              </h2>

                              <StatusBadge
                                status={
                                  selected.status
                                }
                              />
                            </div>

                            <a
                              href={`mailto:${selected.email}`}
                              className="mt-1.5 flex items-center gap-1.5 truncate text-xs font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                            >
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              {
                                selected.email
                              }
                            </a>

                            {selected.phone && (
                              <a
                                href={`tel:${selected.phone}`}
                                className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-brand-navy"
                              >
                                <span className="text-[10px]">
                                  TEL
                                </span>
                                {
                                  selected.phone
                                }
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="mt-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Subject
                        </p>

                        <h3 className="mt-2 break-words text-xl font-black leading-7 tracking-tight text-brand-navy">
                          {
                            selected.subject
                          }
                        </h3>
                      </div>

                      {/* Original message */}
                      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gold/10">
                              <Mail className="h-3.5 w-3.5 text-brand-gold" />
                            </div>

                            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                              Original message
                            </span>
                          </div>

                          <span className="text-[10px] font-medium text-slate-400">
                            {formatRelativeDate(
                              selected.createdAt,
                            )}
                          </span>
                        </div>

                        <div className="p-4 sm:p-5">
                          <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                            {
                              selected.message
                            }
                          </p>
                        </div>
                      </div>

                      {/* Reply history indicator */}
                      {selected.repliedAt && (
                        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                            <Check className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-xs font-black text-blue-900">
                              Response sent
                            </p>

                            <p className="mt-0.5 text-[11px] leading-5 text-blue-700/70">
                              This enquiry was replied to on{" "}
                              {formatDate(
                                selected.repliedAt,
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Reply */}
                      <div className="mt-7">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gold/10">
                                <Send className="h-3.5 w-3.5 text-brand-gold" />
                              </div>

                              <h3 className="text-sm font-black text-brand-navy">
                                Send response
                              </h3>
                            </div>

                            <p className="mt-1 text-[11px] text-slate-400">
                              Your response will be delivered by email.
                            </p>
                          </div>
                        </div>

                        {selected.status ===
                        "archived" ? (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
                                <Archive className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-sm font-black text-slate-700">
                                  Message archived
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  Restore this
                                  message before
                                  sending a response.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition focus-within:border-brand-gold focus-within:ring-4 focus-within:ring-brand-gold/10">
                              <textarea
                                value={
                                  reply
                                }
                                onChange={(
                                  event,
                                ) =>
                                  setReply(
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                rows={7}
                                maxLength={
                                  5000
                                }
                                placeholder="Write a clear and helpful response..."
                                aria-label="Reply message"
                                className="w-full resize-none border-0 bg-transparent p-4 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
                              />

                              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-3 py-2.5">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  Secure email response
                                </div>

                                <span
                                  className={`text-[10px] font-bold ${
                                    reply.length >
                                    4500
                                      ? "text-amber-600"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {reply.length.toLocaleString(
                                    "en-NG",
                                  )}{" "}
                                  / 5,000
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={
                                sendingReply ||
                                !reply.trim()
                              }
                              onClick={
                                handleReply
                              }
                              className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-black text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand-navy/95 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                              <Send
                                className={`h-4 w-4 ${
                                  sendingReply
                                    ? "animate-pulse"
                                    : ""
                                }`}
                              />

                              {sendingReply
                                ? "Sending response..."
                                : "Send response"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* =============================================
                      ACTION FOOTER
                  ============================================== */}

                  <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
                    {selected.status ===
                    "archived" ? (
                      <button
                        type="button"
                        disabled={
                          processingId ===
                          selected._id
                        }
                        onClick={() =>
                          handleRestore(
                            selected,
                          )
                        }
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-gold hover:text-brand-navy hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RotateCcw
                          className={`h-4 w-4 ${
                            processingId ===
                            selected._id
                              ? "animate-spin"
                              : ""
                          }`}
                        />

                        {processingId ===
                        selected._id
                          ? "Restoring..."
                          : "Restore message"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          processingId ===
                          selected._id
                        }
                        onClick={() =>
                          handleArchive(
                            selected,
                          )
                        }
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Archive
                          className={`h-4 w-4 ${
                            processingId ===
                            selected._id
                              ? "animate-pulse"
                              : ""
                          }`}
                        />

                        {processingId ===
                        selected._id
                          ? "Archiving..."
                          : "Archive message"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}