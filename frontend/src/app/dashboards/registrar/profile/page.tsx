"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Edit3,
  FileText,
  GraduationCap,
  KeyRound,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { apiGet, apiPatch } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Programme {
  _id?: string;
  name?: string;
  code?: string;
}

interface AcademicSession {
  _id?: string;
  name?: string;
}

interface RegistrarProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "registrar" | "finance" | "lecturer" | "student";

  programme?: Programme | null;
  academicSession?: AcademicSession | null;

  level?: string | null;
  matricNumber?: string | null;

  isActive: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;

  createdAt?: string;
  updatedAt?: string;
}

interface MeResponse {
  success: boolean;
  user: RegistrarProfile;
  message?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  user?: RegistrarProfile;
}

/* =========================================================
   HELPERS
========================================================= */

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "Something went wrong. Please try again.";
}

function formatDate(
  value?: string | null,
): string {
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
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function formatDateTime(
  value?: string | null,
): string {
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
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

function getInitials(
  name?: string,
): string {
  if (!name?.trim()) {
    return "R";
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function capitalizeRole(
  role?: string,
): string {
  if (!role) {
    return "Staff";
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
}

/* =========================================================
   RECORD LIST — replaces the repeated boxed InfoRow grid
   with a single divided list, like a record sheet
========================================================= */

function RecordList({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80">
      {children}
    </div>
  );
}

function FieldRow({
  icon: Icon,
  label,
  value,
  muted = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3.5 bg-white px-4 py-3.5 sm:px-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/[0.06] text-brand-navy">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p
          className={`mt-0.5 truncate text-sm font-semibold ${
            muted ? "text-slate-400" : "text-slate-800"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-rose-500"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

function VerificationBadge({
  verified,
}: {
  verified: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        verified
          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      }`}
    >
      {verified ? (
        <BadgeCheck className="h-3.5 w-3.5" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5" />
      )}

      {verified
        ? "Verified"
        : "Not verified"}
    </span>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function RegistrarProfilePage() {
  const { data: session, status: sessionStatus } =
    useSession();

  const accessToken =
    session?.accessToken;

  const [profile, setProfile] =
    useState<RegistrarProfile | null>(
      null,
    );

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [editing, setEditing] =
    useState(false);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  const loadProfile =
    useCallback(async () => {
      if (!accessToken) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await apiGet<MeResponse>(
            "/users/me",
            accessToken,
          );

        if (!response?.success || !response.user) {
          throw new Error(
            response?.message ||
              "Unable to load your profile.",
          );
        }

        setProfile(response.user);

        setName(
          response.user.name || "",
        );

        setEmail(
          response.user.email || "",
        );
      } catch (loadError) {
        console.error(
          "Load registrar profile error:",
          loadError,
        );

        setError(
          getErrorMessage(loadError),
        );
      } finally {
        setLoading(false);
      }
    }, [accessToken]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      void loadProfile();
    }

    if (sessionStatus === "unauthenticated") {
      setLoading(false);
    }
  }, [
    sessionStatus,
    loadProfile,
  ]);

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const initials = useMemo(
    () => getInitials(profile?.name),
    [profile?.name],
  );

  const hasChanges =
    profile !== null &&
    (
      name.trim() !==
        profile.name ||
      email.trim().toLowerCase() !==
        profile.email.toLowerCase()
    );

  /* =======================================================
     UPDATE PROFILE
  ======================================================= */

  const handleSave = async () => {
    if (!accessToken || !profile) {
      setError(
        "Your session is not ready. Please sign in again.",
      );

      return;
    }

    const trimmedName =
      name.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setError(
        "Name must be at least 2 characters.",
      );

      return;
    }

    if (!normalizedEmail) {
      setError(
        "Email address is required.",
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload: {
        name?: string;
        email?: string;
      } = {};

      if (
        trimmedName !==
        profile.name
      ) {
        payload.name =
          trimmedName;
      }

      if (
        normalizedEmail !==
        profile.email.toLowerCase()
      ) {
        payload.email =
          normalizedEmail;
      }

      if (
        Object.keys(payload).length ===
        0
      ) {
        setEditing(false);

        return;
      }

      const response =
        await apiPatch<UpdateProfileResponse>(
          "/users/me",
          payload,
          accessToken,
        );

      if (
        !response?.success
      ) {
        throw new Error(
          response?.message ||
            "Unable to update your profile.",
        );
      }

      if (response.user) {
        setProfile(
          response.user,
        );

        setName(
          response.user.name || "",
        );

        setEmail(
          response.user.email || "",
        );
      } else {
        await loadProfile();
      }

      setEditing(false);

      setSuccess(
        response.message ||
          "Your profile has been updated successfully.",
      );
    } catch (saveError) {
      console.error(
        "Update registrar profile error:",
        saveError,
      );

      setError(
        getErrorMessage(saveError),
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     CANCEL EDITING
  ======================================================= */

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    setName(
      profile.name || "",
    );

    setEmail(
      profile.email || "",
    );

    setEditing(false);
    setError("");
  };

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (
    loading ||
    sessionStatus === "loading"
  ) {
    return (
      <main className="min-h-screen bg-slate-50/70">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-40 rounded bg-slate-200" />

            <div className="h-64 rounded-3xl bg-white shadow-sm ring-1 ring-slate-200" />

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-80 rounded-3xl bg-white shadow-sm ring-1 ring-slate-200" />
              <div className="h-80 rounded-3xl bg-white shadow-sm ring-1 ring-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     AUTH ERROR
  ======================================================= */

  if (
    sessionStatus ===
      "unauthenticated" ||
    !accessToken
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/40">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-brand-navy">
            Authentication required
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your session has expired or you
            are not currently signed in.
          </p>

          <Link
            href="/auth/login"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-navy px-5 text-sm font-bold text-white transition hover:bg-brand-navy/90"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =================================================
            TOP NAVIGATION
        ================================================= */}

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboards/registrar"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-navy"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          <Link
            href="/dashboards/registrar/settings"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-gold/40 hover:text-brand-navy"
          >
            <KeyRound className="h-4 w-4" />
            <span className="hidden sm:inline">
              Security Settings
            </span>
            <span className="sm:hidden">
              Security
            </span>
          </Link>
        </div>

        {/* =================================================
            PAGE HEADING
        ================================================= */}

        <div className="mb-7">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-gold/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-navy">
            <CircleUserRound className="h-3.5 w-3.5" />
            Registrar Profile
          </div>

          <h1 className="font-serif text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage your personal information and
            review your Registrar account details.
          </p>
        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 leading-5">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1 transition hover:bg-rose-100"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">
                Profile updated
              </p>

              <p className="mt-1 leading-5">
                {success}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="rounded-lg p-1 transition hover:bg-emerald-100"
              aria-label="Dismiss success message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-brand-navy shadow-xl shadow-brand-navy/10">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/[0.04] blur-3xl" />
          <div
            className="
              pointer-events-none absolute inset-0 opacity-[0.035]
              [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
              [background-size:32px_32px]
            "
          />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

              {/* Identity */}
              <div className="flex min-w-0 items-center gap-5">
                <div className="relative shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white/10 bg-brand-gold text-2xl font-bold text-brand-navy shadow-xl shadow-black/20 sm:h-28 sm:w-28 sm:text-3xl">
                    {initials}
                  </div>

                  <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-brand-navy bg-emerald-500 text-white">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                    ITMT Management System
                  </p>

                  <h2 className="mt-1 truncate font-serif text-2xl font-semibold text-white sm:text-3xl">
                    {profile?.name ||
                      "Registrar"}
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/10">
                      {capitalizeRole(
                        profile?.role,
                      )}
                    </span>

                    {profile && (
                      <StatusBadge
                        active={
                          profile.isActive &&
                          !profile.isSuspended
                        }
                      />
                    )}

                    {profile && (
                      <VerificationBadge
                        verified={
                          profile.isEmailVerified
                        }
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Edit */}
              <div className="shrink-0">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setError("");
                      setSuccess("");
                    }}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 text-sm font-bold text-brand-navy shadow-lg shadow-black/10 transition hover:bg-brand-gold/90 sm:w-auto"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={
                        handleCancel
                      }
                      disabled={saving}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleSave
                      }
                      disabled={
                        saving ||
                        !hasChanges
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 text-sm font-bold text-brand-navy transition hover:bg-brand-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}

                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Hero metadata */}
            <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07] text-brand-gold">
                  <Mail className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-white/40">
                    Email
                  </p>

                  <p className="truncate text-sm font-semibold text-white/90">
                    {profile?.email ||
                      "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07] text-brand-gold">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[11px] font-medium text-white/40">
                    Member Since
                  </p>

                  <p className="text-sm font-semibold text-white/90">
                    {formatDate(
                      profile?.createdAt,
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07] text-brand-gold">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[11px] font-medium text-white/40">
                    Last Updated
                  </p>

                  <p className="text-sm font-semibold text-white/90">
                    {formatDateTime(
                      profile?.updatedAt,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">

          {/* ===============================================
              PERSONAL INFORMATION
          =============================================== */}

          <section className="rounded-3xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-7">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
                    <User className="h-4 w-4" />
                  </div>

                  <h2 className="text-base font-bold text-brand-navy">
                    Personal Information
                  </h2>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Your basic account information.
                </p>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="hidden items-center gap-1.5 text-xs font-semibold text-brand-navy transition hover:text-brand-gold sm:inline-flex"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>

            <div className="p-6 sm:p-7">
              {editing ? (
                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="registrar-name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Full Name
                    </label>

                    <div className="relative">
                      <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="registrar-name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                          setName(
                            event.target
                              .value,
                          )
                        }
                        autoComplete="name"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="registrar-email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="registrar-email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(
                            event.target
                              .value,
                          )
                        }
                        autoComplete="email"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                        placeholder="Enter your email address"
                      />
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Changing your email will
                      require email verification
                      again.
                    </p>
                  </div>

                  {/* Save buttons */}
                  <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={
                        handleCancel
                      }
                      disabled={saving}
                      className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleSave
                      }
                      disabled={
                        saving ||
                        !hasChanges
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}

                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <RecordList>
                  <FieldRow
                    icon={User}
                    label="Full Name"
                    value={
                      profile?.name ||
                      "Not available"
                    }
                  />

                  <FieldRow
                    icon={Mail}
                    label="Email Address"
                    value={
                      profile?.email ||
                      "Not available"
                    }
                  />

                  <FieldRow
                    icon={ShieldCheck}
                    label="Role"
                    value={capitalizeRole(
                      profile?.role,
                    )}
                  />
                </RecordList>
              )}
            </div>
          </section>

          {/* ===============================================
              ACCOUNT STATUS
          =============================================== */}

          <section className="rounded-3xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-navy">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <h2 className="text-base font-bold text-brand-navy">
                  Account Status
                </h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Current status and security information.
              </p>
            </div>

            <div className="p-6 sm:p-7">
              <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between gap-4 bg-white px-4 py-3.5 sm:px-5">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Account
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {profile?.isSuspended
                        ? "Suspended"
                        : profile?.isActive
                          ? "Active"
                          : "Inactive"}
                    </p>
                  </div>

                  {profile && (
                    <StatusBadge
                      active={
                        profile.isActive &&
                        !profile.isSuspended
                      }
                    />
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 bg-white px-4 py-3.5 sm:px-5">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Email
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {profile?.isEmailVerified
                        ? "Verified"
                        : "Verification required"}
                    </p>
                  </div>

                  {profile && (
                    <VerificationBadge
                      verified={
                        profile.isEmailVerified
                      }
                    />
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 bg-white px-4 py-3.5 sm:px-5">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Account Role
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {capitalizeRole(
                        profile?.role,
                      )}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =================================================
            ACADEMIC / SYSTEM INFORMATION
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
                <GraduationCap className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-base font-bold text-brand-navy">
                  Academic &amp; System Information
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Academic fields associated with this account.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:p-7 lg:grid-cols-2">
            <RecordList>
              <FieldRow
                icon={GraduationCap}
                label="Programme"
                value={
                  profile?.programme?.name ||
                  "Not applicable"
                }
                muted={
                  !profile?.programme?.name
                }
              />

              <FieldRow
                icon={FileText}
                label="Programme Code"
                value={
                  profile?.programme?.code ||
                  "Not applicable"
                }
                muted={
                  !profile?.programme?.code
                }
              />

              <FieldRow
                icon={CalendarDays}
                label="Academic Session"
                value={
                  profile?.academicSession
                    ?.name ||
                  "Not applicable"
                }
                muted={
                  !profile?.academicSession
                    ?.name
                }
              />

              <FieldRow
                icon={FileText}
                label="Level"
                value={
                  profile?.level ||
                  "Not applicable"
                }
                muted={
                  !profile?.level
                }
              />
            </RecordList>

            <RecordList>
              <FieldRow
                icon={FileText}
                label="Matric Number"
                value={
                  profile?.matricNumber ||
                  "Not applicable"
                }
                muted={
                  !profile?.matricNumber
                }
              />

              <FieldRow
                icon={CalendarDays}
                label="Created"
                value={formatDate(
                  profile?.createdAt,
                )}
              />

              <FieldRow
                icon={Clock3}
                label="Last Updated"
                value={formatDateTime(
                  profile?.updatedAt,
                )}
              />

              <FieldRow
                icon={ShieldCheck}
                label="System Role"
                value={capitalizeRole(
                  profile?.role,
                )}
              />
            </RecordList>
          </div>
        </section>

        {/* =================================================
            SECURITY CARD
        ================================================= */}

        <section className="relative mt-6 overflow-hidden rounded-3xl border border-brand-navy/10 bg-gradient-to-br from-brand-navy to-[#26365c] shadow-lg shadow-brand-navy/10">
          <div
            className="
              pointer-events-none absolute inset-0 opacity-[0.035]
              [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
              [background-size:32px_32px]
            "
          />

          <div className="relative flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gold text-brand-navy shadow-lg">
                <KeyRound className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-gold">
                  Account Security
                </p>

                <h2 className="mt-1 text-lg font-bold text-white">
                  Keep your account secure
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                  Change your password regularly and
                  keep your Registrar account protected
                  from unauthorized access.
                </p>
              </div>
            </div>

            <Link
              href="/dashboards/registrar/settings#change-password"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-brand-navy transition hover:bg-brand-gold"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* =================================================
            FOOTER INFO
        ================================================= */}

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
          <p>
            Registrar account profile
          </p>

          <p>
            ITMT Management System
          </p>
        </div>
      </div>
    </main>
  );
}