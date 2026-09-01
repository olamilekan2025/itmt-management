"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Mail,
  MapPin,
  RefreshCw,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { apiGet, apiPatch } from "@/lib/api";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type TranscriptStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "processing"
  | "ready"
  | "collected";

type Student = {
  _id: string;
  name: string;
  email: string;
  matricNumber?: string;
  programme?: string;
};

type TranscriptRequest = {
  _id: string;
  student: Student;
  requestType: "official" | "unofficial";
  purpose: string;
  destination?: string;
  status: TranscriptStatus;
  adminNote?: string;
  rejectionReason?: string;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  collectedAt?: string;
};

type TranscriptResponse = {
  success: boolean;
  request: TranscriptRequest;
  message?: string;
};

type UpdateResponse = {
  success: boolean;
  message?: string;
  request?: TranscriptRequest;
};

/*
 * =========================================================
 * STATUS CONFIG
 * =========================================================
 */

const statusConfig: Record<
  TranscriptStatus,
  {
    label: string;
    description: string;
    icon: typeof Clock3;
    badge: string;
    soft: string;
    iconBg: string;
  }
> = {
  pending: {
    label: "Pending Review",
    description: "Awaiting administrative review",
    icon: Clock3,
    badge:
      "border-amber-200 bg-amber-50 text-amber-700",
    soft: "bg-amber-50/70",
    iconBg: "bg-amber-100 text-amber-700",
  },

  approved: {
    label: "Approved",
    description: "Request has been approved",
    icon: CheckCircle2,
    badge:
      "border-blue-200 bg-blue-50 text-blue-700",
    soft: "bg-blue-50/70",
    iconBg: "bg-blue-100 text-blue-700",
  },

  rejected: {
    label: "Rejected",
    description: "Request was rejected",
    icon: XCircle,
    badge:
      "border-red-200 bg-red-50 text-red-700",
    soft: "bg-red-50/70",
    iconBg: "bg-red-100 text-red-700",
  },

  processing: {
    label: "Processing",
    description: "Transcript is being prepared",
    icon: Loader2,
    badge:
      "border-purple-200 bg-purple-50 text-purple-700",
    soft: "bg-purple-50/70",
    iconBg: "bg-purple-100 text-purple-700",
  },

  ready: {
    label: "Ready",
    description: "Transcript is ready for collection",
    icon: CheckCircle2,
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    soft: "bg-emerald-50/70",
    iconBg: "bg-emerald-100 text-emerald-700",
  },

  collected: {
    label: "Collected",
    description: "Transcript has been collected",
    icon: Check,
    badge:
      "border-slate-200 bg-slate-100 text-slate-700",
    soft: "bg-slate-50",
    iconBg: "bg-slate-100 text-slate-700",
  },
};

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function formatDate(date?: string) {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function formatShortId(id: string) {
  if (!id) return "—";

  return `${id.slice(0, 8)}...${id.slice(-6)}`;
}

/*
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function TranscriptRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const [request, setRequest] =
    useState<TranscriptRequest | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [adminNote, setAdminNote] =
    useState("");

  const [rejectionReason, setRejectionReason] =
    useState("");

  /*
   * =========================================================
   * LOAD REQUEST
   * =========================================================
   */

  const loadRequest = useCallback(
    async () => {
      if (sessionStatus === "loading") {
        return;
      }

      if (sessionStatus === "unauthenticated") {
        setError(
          "Authentication is required. Please sign in again.",
        );
        setLoading(false);
        return;
      }

      if (!session?.accessToken) {
        setError(
          "Authentication token is required. Please sign in again.",
        );
        setLoading(false);
        return;
      }

      if (!id) {
        setError(
          "Transcript request ID is missing.",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await apiGet<TranscriptResponse>(
            `/transcript-requests/${id}`,
            session.accessToken,
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to load transcript request.",
          );
        }

        if (!response.request) {
          throw new Error(
            "Transcript request was not returned by the server.",
          );
        }

        setRequest(response.request);

        setAdminNote(
          response.request.adminNote || "",
        );

        setRejectionReason(
          response.request.rejectionReason ||
            "",
        );
      } catch (err) {
        console.error(
          "Load transcript request error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load transcript request.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      id,
      session?.accessToken,
      sessionStatus,
    ],
  );

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    loadRequest();
  }, [sessionStatus, loadRequest]);

  /*
   * =========================================================
   * UPDATE STATUS
   * =========================================================
   */

  const updateStatus = async (
    status: TranscriptStatus,
  ) => {
    if (!request) return;

    if (!session?.accessToken) {
      setError(
        "Authentication token is required. Please sign in again.",
      );
      return;
    }

    if (
      status === "rejected" &&
      !rejectionReason.trim()
    ) {
      setError(
        "Please provide a rejection reason before rejecting this request.",
      );
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const response =
        await apiPatch<UpdateResponse>(
          `/transcript-requests/${request._id}/status`,
          {
            status,

            adminNote:
              adminNote.trim() || undefined,

            rejectionReason:
              status === "rejected"
                ? rejectionReason.trim()
                : undefined,
          },
          session.accessToken,
        );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to update transcript request.",
        );
      }

      if (response.request) {
        setRequest(response.request);

        setAdminNote(
          response.request.adminNote || "",
        );

        setRejectionReason(
          response.request.rejectionReason ||
            "",
        );
      } else {
        await loadRequest();
      }

      if (status !== "rejected") {
        setRejectionReason("");
      }
    } catch (err) {
      console.error(
        "Update transcript request error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update transcript request.",
      );
    } finally {
      setUpdating(false);
    }
  };

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */

  const currentStatus = useMemo(() => {
    if (!request) return null;

    return statusConfig[request.status];
  }, [request]);

  /*
   * =========================================================
   * AUTH LOADING
   * =========================================================
   */

  if (sessionStatus === "loading") {
    return <PageLoader label="Checking authentication..." />;
  }

  /*
   * =========================================================
   * UNAUTHENTICATED
   * =========================================================
   */

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex min-h-[650px] items-center justify-center px-4">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
          <div className="h-1.5 bg-brand-navy" />

          <div className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>

            <h2 className="mt-6 text-xl font-bold text-slate-900">
              Authentication required
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your administrator session is no
              longer available. Please sign in again
              to continue.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/auth/login")
              }
              className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-brand-navy px-6 text-sm font-semibold text-white shadow-lg shadow-brand-navy/15 transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * REQUEST LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <PageLoader label="Loading transcript request..." />
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error && !request) {
    return (
      <div className="mx-auto max-w-3xl px-1 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
          Back to requests
        </button>

        <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-xl shadow-red-100/30">
          <div className="h-1 bg-red-500" />

          <div className="p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Unable to load request
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadRequest()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!request || !currentStatus) {
    return null;
  }

  const StatusIcon = currentStatus.icon;

  const isFinal =
    request.status === "collected";

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-navy"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition group-hover:border-brand-navy/20 group-hover:bg-brand-navy/5">
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
          </span>

          Back to transcript requests
        </button>

        <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-navy/[0.06] sm:flex">
              <FileText className="h-6 w-6 text-brand-navy" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Transcript Request
                </p>

                <span className="text-slate-300">
                  •
                </span>

                <span className="font-mono text-xs text-slate-400">
                  {formatShortId(request._id)}
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
                Review Transcript Request
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review the student's information,
                request details and move the transcript
                through its processing workflow.
              </p>
            </div>
          </div>

          <div
            className={`flex w-fit items-center gap-3 rounded-2xl border px-4 py-3 ${currentStatus.badge}`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70">
              <StatusIcon
                className={`h-5 w-5 ${
                  request.status ===
                  "processing"
                    ? "animate-spin"
                    : ""
                }`}
              />
            </div>

            <div>
              <p className="text-sm font-bold">
                {currentStatus.label}
              </p>

              <p className="mt-0.5 text-xs opacity-75">
                {currentStatus.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR BANNER
      ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">
              Action could not be completed
            </p>

            <p className="mt-0.5 text-red-600/90">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 transition hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* =====================================================
          WORKFLOW
      ===================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 sm:p-7">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Workflow
          </p>

          <h2 className="text-lg font-bold text-slate-900">
            Request progress
          </h2>
        </div>

        <div className="mt-7 overflow-x-auto pb-2">
          <div className="flex min-w-[680px] items-start">
            <WorkflowStep
              label="Submitted"
              date={request.requestedAt}
              active
              complete
            />

            <WorkflowLine
              active={Boolean(
                request.processedAt,
              )}
            />

            <WorkflowStep
              label="Processed"
              date={request.processedAt}
              active={Boolean(
                request.processedAt,
              )}
              complete={Boolean(
                request.processedAt,
              )}
            />

            <WorkflowLine
              active={Boolean(
                request.collectedAt,
              )}
            />

            <WorkflowStep
              label="Collected"
              date={request.collectedAt}
              active={Boolean(
                request.collectedAt,
              )}
              complete={Boolean(
                request.collectedAt,
              )}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          INFORMATION GRID
      ===================================================== */}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
        {/* ===================================================
            STUDENT
        =================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
            <SectionHeading
              icon={UserRound}
              title="Student information"
              description="Applicant details"
            />
          </div>

          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white">
                {getInitials(
                  request.student?.name,
                )}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-slate-900">
                  {request.student?.name ||
                    "Unknown student"}
                </h3>

                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {request.student?.email ||
                    "No email available"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoItem
                label="Matric Number"
                value={
                  request.student
                    ?.matricNumber || "—"
                }
              />

              <InfoItem
                label="Programme"
                value={
                  request.student
                    ?.programme || "—"
                }
              />

              <InfoItem
                label="Email Address"
                value={
                  request.student?.email ||
                  "—"
                }
                icon={Mail}
              />

              <InfoItem
                label="Request Submitted"
                value={formatDate(
                  request.requestedAt,
                )}
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            REQUEST DETAILS
        =================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
            <SectionHeading
              icon={FileText}
              title="Request details"
              description="Transcript requirements"
            />
          </div>

          <div className="p-6 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Request Type"
                value={
                  request.requestType
                }
                capitalize
              />

              <InfoItem
                label="Current Status"
                value={currentStatus.label}
              />

              <div className="sm:col-span-2">
                <InfoItem
                  label="Purpose"
                  value={
                    request.purpose || "—"
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <InfoItem
                  label="Destination"
                  value={
                    request.destination ||
                    "Not specified"
                  }
                  icon={MapPin}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          ADMINISTRATION
      ===================================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-6 sm:px-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Administration
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Manage request
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add internal notes and update the
                transcript processing status.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brand-navy" />
              Admin controls
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Admin Note */}

            <div>
              <label
                htmlFor="admin-note"
                className="mb-2.5 block text-sm font-semibold text-slate-800"
              >
                Internal admin note
              </label>

              <textarea
                id="admin-note"
                value={adminNote}
                onChange={(event) =>
                  setAdminNote(
                    event.target.value,
                  )
                }
                rows={6}
                disabled={updating}
                placeholder="Add a private note for administrators..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-slate-400">
                This note is for administrative
                purposes.
              </p>
            </div>

            {/* Rejection Reason */}

            <div>
              <label
                htmlFor="rejection-reason"
                className="mb-2.5 block text-sm font-semibold text-slate-800"
              >
                Rejection reason
              </label>

              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(event) =>
                  setRejectionReason(
                    event.target.value,
                  )
                }
                rows={6}
                disabled={
                  updating ||
                  request.status ===
                    "collected"
                }
                placeholder="Required when rejecting a transcript request..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-slate-400">
                A reason is required before a
                request can be rejected.
              </p>
            </div>
          </div>

          {/* ACTION AREA */}

          {!isFinal && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Available action
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Move this request to its next
                    appropriate stage.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {/* PENDING */}

                  {request.status ===
                    "pending" && (
                    <>
                      <ActionButton
                        label="Approve Request"
                        icon={CheckCircle2}
                        onClick={() =>
                          updateStatus(
                            "approved",
                          )
                        }
                        disabled={updating}
                      />

                      <ActionButton
                        label="Reject Request"
                        icon={XCircle}
                        onClick={() =>
                          updateStatus(
                            "rejected",
                          )
                        }
                        disabled={updating}
                        danger
                      />
                    </>
                  )}

                  {/* APPROVED */}

                  {request.status ===
                    "approved" && (
                    <ActionButton
                      label="Start Processing"
                      icon={Loader2}
                      onClick={() =>
                        updateStatus(
                          "processing",
                        )
                      }
                      disabled={updating}
                    />
                  )}

                  {/* PROCESSING */}

                  {request.status ===
                    "processing" && (
                    <ActionButton
                      label="Mark as Ready"
                      icon={CheckCircle2}
                      onClick={() =>
                        updateStatus(
                          "ready",
                        )
                      }
                      disabled={updating}
                    />
                  )}

                  {/* READY */}

                  {request.status ===
                    "ready" && (
                    <ActionButton
                      label="Mark as Collected"
                      icon={Check}
                      onClick={() =>
                        updateStatus(
                          "collected",
                        )
                      }
                      disabled={updating}
                    />
                  )}
                </div>
              </div>

              {updating && (
                <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4 text-xs font-medium text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-navy" />
                  Updating transcript request...
                </div>
              )}
            </div>
          )}

          {/* FINAL */}

          {isFinal && (
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-emerald-800">
                  Transcript request completed
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-700/80">
                  This request has been collected
                  and can no longer be modified.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          EXISTING NOTES
      ===================================================== */}

      {(request.adminNote ||
        request.rejectionReason) && (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Record
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Existing notes
            </h2>
          </div>

          <div className="grid gap-4 p-6 sm:p-7 lg:grid-cols-2">
            {request.adminNote && (
              <NoteCard
                title="Admin note"
                value={request.adminNote}
              />
            )}

            {request.rejectionReason && (
              <NoteCard
                title="Rejection reason"
                value={
                  request.rejectionReason
                }
                danger
              />
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          METADATA
      ===================================================== */}

      <div className="grid gap-3 sm:grid-cols-3">
        <MetaCard
          label="Request ID"
          value={request._id}
          mono
        />

        <MetaCard
          label="Created"
          value={formatDate(
            request.createdAt,
          )}
        />

        <MetaCard
          label="Last updated"
          value={formatDate(
            request.updatedAt,
          )}
        />
      </div>
    </div>
  );
}

/*
 * =========================================================
 * PAGE LOADER
 * =========================================================
 */

function PageLoader({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex min-h-[650px] items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/[0.06]">
          <Loader2 className="h-7 w-7 animate-spin text-brand-navy" />
        </div>

        <p className="mt-5 text-sm font-bold text-slate-900">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Please wait a moment
        </p>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * SECTION HEADING
 * =========================================================
 */

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/[0.06]">
        <Icon className="h-5 w-5 text-brand-navy" />
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * INFO ITEM
 * =========================================================
 */

function InfoItem({
  label,
  value,
  icon: Icon,
  capitalize = false,
}: {
  label: string;
  value: string;
  icon?: typeof Mail;
  capitalize?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <div className="mt-1.5 flex items-start gap-2">
        {Icon && (
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        )}

        <p
          className={`text-sm font-semibold leading-6 text-slate-800 ${
            capitalize ? "capitalize" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * WORKFLOW STEP
 * =========================================================
 */

function WorkflowStep({
  label,
  date,
  active,
  complete,
}: {
  label: string;
  date?: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className="flex min-w-[150px] flex-col items-center text-center">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full border-4 border-white shadow-sm ${
          complete
            ? "bg-brand-navy text-white"
            : active
              ? "bg-brand-navy/10 text-brand-navy"
              : "bg-slate-100 text-slate-400"
        }`}
      >
        {complete ? (
          <Check className="h-5 w-5" />
        ) : (
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
        )}
      </div>

      <p
        className={`mt-3 text-xs font-bold ${
          active || complete
            ? "text-slate-900"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p className="mt-1 max-w-[150px] text-[10px] leading-4 text-slate-400">
        {formatDate(date)}
      </p>
    </div>
  );
}

/*
 * =========================================================
 * WORKFLOW LINE
 * =========================================================
 */

function WorkflowLine({
  active,
}: {
  active: boolean;
}) {
  return (
    <div className="mt-5 h-0.5 flex-1 bg-slate-200">
      <div
        className={`h-full transition-all duration-500 ${
          active
            ? "w-full bg-brand-navy"
            : "w-0"
        }`}
      />
    </div>
  );
}

/*
 * =========================================================
 * ACTION BUTTON
 * =========================================================
 */

function ActionButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  danger = false,
}: {
  label: string;
  icon: typeof CheckCircle2;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "border border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50 hover:shadow-red-100"
          : "bg-brand-navy text-white shadow-brand-navy/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-navy/15"
      }`}
    >
      {disabled ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon
          className={`h-4 w-4 transition ${
            !danger
              ? "group-hover:scale-110"
              : ""
          }`}
        />
      )}

      {disabled
        ? "Updating..."
        : label}
    </button>
  );
}

/*
 * =========================================================
 * NOTE CARD
 * =========================================================
 */

function NoteCard({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        danger
          ? "border-red-200 bg-red-50/60"
          : "border-slate-200 bg-slate-50/60"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            danger
              ? "bg-red-500"
              : "bg-brand-navy"
          }`}
        />

        <p
          className={`text-xs font-bold uppercase tracking-[0.12em] ${
            danger
              ? "text-red-600"
              : "text-slate-500"
          }`}
        >
          {title}
        </p>
      </div>

      <p
        className={`mt-3 text-sm leading-6 ${
          danger
            ? "text-red-700"
            : "text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/*
 * =========================================================
 * META CARD
 * =========================================================
 */

function MetaCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1.5 truncate text-xs font-semibold text-slate-600 ${
          mono ? "font-mono" : ""
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

/*
 * =========================================================
 * INITIALS
 * =========================================================
 */

function getInitials(name?: string) {
  if (!name) return "?";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

