"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { apiGet, apiPatch } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  role?: string;

  programme?: unknown;
  academicSession?: unknown;
  level?: unknown;
  matricNumber?: string;

  isActive?: boolean;
  isSuspended?: boolean;
  isEmailVerified?: boolean;
}

interface MeResponse {
  success?: boolean;
  user: UserProfile;
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name?: string, email?: string) {
  const value = name?.trim() || email?.trim() || "Admin";

  const parts = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

function formatRole(role?: string) {
  if (!role) return "Administrator";

  return role
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* =========================================================
   FORM INPUT
========================================================= */

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon: React.ReactNode;
  required?: boolean;
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  required = false,
}: FormInputProps) {
  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div className="group relative">
        <div
          className="
            pointer-events-none absolute left-4 top-1/2
            -translate-y-1/2 text-slate-400
            transition-colors
            group-focus-within:text-brand-navy
          "
        >
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className="
            h-12 w-full rounded-xl
            border border-slate-200
            bg-slate-50/50
            pl-11 pr-4
            text-sm font-medium text-slate-800
            outline-none
            transition-all duration-200
            placeholder:text-slate-400
            hover:border-slate-300
            focus:border-brand-navy
            focus:bg-white
            focus:ring-4 focus:ring-brand-navy/5
          "
        />
      </div>
    </div>
  );
}

/* =========================================================
   PASSWORD INPUT
========================================================= */

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder?: string;
}

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
}: PasswordInputProps) {
  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}

        <span className="ml-1 text-red-500">*</span>
      </label>

      <div className="group relative">
        <div
          className="
            pointer-events-none absolute left-4 top-1/2
            -translate-y-1/2 text-slate-400
            transition-colors
            group-focus-within:text-brand-navy
          "
        >
          <LockKeyhole className="h-4 w-4" />
        </div>

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          className="
            h-12 w-full rounded-xl
            border border-slate-200
            bg-slate-50/50
            pl-11 pr-12
            text-sm font-medium text-slate-800
            outline-none
            transition-all duration-200
            placeholder:text-slate-400
            hover:border-slate-300
            focus:border-brand-navy
            focus:bg-white
            focus:ring-4 focus:ring-brand-navy/5
          "
        />

        <button
          type="button"
          onClick={onToggle}
          className="
            absolute right-2.5 top-1/2
            -translate-y-1/2
            rounded-lg p-2
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-brand-navy
          "
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-2
        rounded-full px-3 py-1.5
        text-xs font-bold
        ${
          active
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            : "bg-red-50 text-red-700 ring-1 ring-red-200"
        }
      `}
    >
      <span
        className={`
          h-1.5 w-1.5 rounded-full
          ${active ? "bg-emerald-500" : "bg-red-500"}
        `}
      />

      {children}
    </span>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminProfilePage() {
  const router = useRouter();

  const { data: session, status } = useSession();

  const accessToken = session?.accessToken as string | undefined;

  /* =======================================================
     PROFILE
  ======================================================= */

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  /* =======================================================
     PASSWORD
  ======================================================= */

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /* =======================================================
     UI
  ======================================================= */

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  const loadProfile = useCallback(
    async (showRefreshState = false) => {
      if (!accessToken) return;

      try {
        if (showRefreshState) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = (await apiGet(
          "/users/me",
          accessToken
        )) as MeResponse;

        if (!response?.user) {
          throw new Error(
            "Unable to load your profile."
          );
        }

        setProfile(response.user);

        setName(response.user.name || "");
        setEmail(response.user.email || "");
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load your profile.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken]
  );

  /* =======================================================
     AUTH
  ======================================================= */

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  /* =======================================================
     FETCH
  ======================================================= */

  useEffect(() => {
    if (
      status === "authenticated" &&
      accessToken
    ) {
      void loadProfile();
    }
  }, [
    status,
    accessToken,
    loadProfile,
  ]);

  /* =======================================================
     INITIALS
  ======================================================= */

  const initials = useMemo(
    () =>
      getInitials(
        profile?.name ||
          session?.user?.name ||
          undefined,
        profile?.email ||
          session?.user?.email ||
          undefined
      ),
    [profile, session]
  );

  /* =======================================================
     PROFILE UPDATE
  ======================================================= */

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!accessToken) {
      setError(
        "Your session has expired. Please sign in again."
      );
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Full name is required.");
      return;
    }

    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const response = (await apiPatch(
        "/users/me",
        {
          name: trimmedName,
          email: trimmedEmail,
        },
        accessToken
      )) as MeResponse;

      const updatedUser =
        response?.user || {
          ...profile,
          name: trimmedName,
          email: trimmedEmail,
        };

      setProfile(updatedUser);

      setName(
        updatedUser.name || trimmedName
      );

      setEmail(
        updatedUser.email || trimmedEmail
      );

      setSuccess(
        "Your profile information has been updated successfully."
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update your profile.";

      setError(message);
    } finally {
      setSavingProfile(false);
    }
  }

  /* =======================================================
     PASSWORD UPDATE
  ======================================================= */

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!accessToken) {
      setError(
        "Your session has expired. Please sign in again."
      );
      return;
    }

    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError(
        "Enter your current password."
      );
      return;
    }

    if (!newPassword) {
      setError(
        "Enter a new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Your new password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "The new password and confirmation password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "Your new password must be different from your current password."
      );
      return;
    }

    try {
      setSavingPassword(true);

      await apiPatch(
        "/users/me/password",
        {
          currentPassword,
          newPassword,
        },
        accessToken
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess(
        "Your password has been changed successfully."
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to change your password.";

      setError(message);
    } finally {
      setSavingPassword(false);
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    status === "loading" ||
    loading
  ) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-0">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy shadow-xl">
              <Loader2 className="h-7 w-7 animate-spin text-brand-gold" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              Loading administrator profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while your account information is retrieved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ===================================================
          PREMIUM NAVY HEADER
      =================================================== */}

      <header className="relative overflow-hidden rounded-3xl bg-brand-navy text-white shadow-xl">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {/* Top navigation */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/dashboards/admin"
              className="
                group inline-flex items-center gap-2
                rounded-xl border border-white/10
                bg-white/5 px-3.5 py-2.5
                text-sm font-semibold text-white/90
                backdrop-blur-sm
                transition
                hover:border-brand-gold/40
                hover:bg-white/10
                hover:text-white
              "
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />

              <span className="hidden sm:inline">
                Back to Dashboard
              </span>

              <span className="sm:hidden">
                Dashboard
              </span>
            </Link>

            <button
              type="button"
              onClick={() =>
                void loadProfile(true)
              }
              disabled={refreshing}
              className="
                inline-flex items-center gap-2
                rounded-xl border border-white/10
                bg-white/5 px-3.5 py-2.5
                text-sm font-semibold text-white/90
                backdrop-blur-sm
                transition
                hover:border-brand-gold/40
                hover:bg-white/10
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>
          </div>

          {/* Hero */}
          <div className="mt-8 flex flex-col gap-6 pb-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
                <span className="h-px w-7 bg-brand-gold" />
                Administration Portal
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Administrator Profile
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                Manage your administrator account,
                personal information, and security
                settings from one place.
              </p>
            </div>

            {/* Header identity */}
            <div
              className="
                flex items-center gap-4
                rounded-2xl border border-white/10
                bg-white/5 p-3
                backdrop-blur-md
              "
            >
              {session?.user?.image ? (
                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/20">
                  <Image
                    src={session.user.image}
                    alt={
                      profile?.name ||
                      "Administrator"
                    }
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="
                    flex h-12 w-12 items-center
                    justify-center rounded-xl
                    bg-brand-gold
                    text-sm font-bold
                    text-brand-navy
                  "
                >
                  {initials}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {profile?.name ||
                    "Administrator"}
                </p>

                <p className="mt-0.5 max-w-[190px] truncate text-xs text-white/55">
                  {profile?.email ||
                    "admin@itmt.edu.ng"}
                </p>
              </div>

              <div className="hidden h-8 w-px bg-white/10 sm:block" />

              <div className="hidden sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  Role
                </p>

                <p className="mt-0.5 text-xs font-semibold text-brand-gold">
                  {formatRole(profile?.role)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="mx-auto max-w-[1600px] px-0 py-6 sm:px-0 lg:px-0 lg:py-8">
        {/* Global notification */}

        {(error || success) && (
          <div
            className={`
              mb-6 flex items-start gap-3
              rounded-2xl border px-4 py-4
              shadow-sm
              ${
                error
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }
            `}
          >
            {error ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <p className="flex-1 text-sm font-medium">
              {error || success}
            </p>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
              }}
              className="text-xs font-bold opacity-60 transition hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
          {/* =================================================
              LEFT PROFILE PANEL
          ================================================= */}

          <aside className="space-y-6">
            {/* Identity card */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* Navy cover */}
              <div className="relative h-28 overflow-hidden bg-brand-navy">
                <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-brand-gold/10 blur-2xl" />

                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />

                  <span className="text-xs font-semibold text-white/70">
                    Administrator account
                  </span>
                </div>
              </div>

              <div className="-mt-12 px-6 pb-6">
                <div className="flex items-end justify-between">
                  {session?.user?.image ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-xl">
                      <Image
                        src={session.user.image}
                        alt={
                          profile?.name ||
                          "Administrator"
                        }
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="
                        flex h-24 w-24
                        items-center justify-center
                        rounded-2xl
                        border-4 border-white
                        bg-brand-gold
                        text-2xl font-extrabold
                        text-brand-navy
                        shadow-xl
                      "
                    >
                      {initials}
                    </div>
                  )}

                  <span
                    className="
                      mb-1 inline-flex items-center
                      gap-1.5 rounded-full
                      bg-brand-navy px-3 py-1.5
                      text-[10px] font-bold
                      uppercase tracking-wider
                      text-white
                    "
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />
                    Admin
                  </span>
                </div>

                <div className="mt-5">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    {profile?.name ||
                      "Administrator"}
                  </h2>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {profile?.email ||
                      "admin@itmt.edu.ng"}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <StatusBadge
                    active={
                      Boolean(
                        profile?.isActive
                      ) &&
                      !Boolean(
                        profile?.isSuspended
                      )
                    }
                  >
                    {profile?.isSuspended
                      ? "Suspended"
                      : profile?.isActive
                        ? "Active"
                        : "Inactive"}
                  </StatusBadge>

                  {profile?.isEmailVerified !==
                    undefined && (
                    <span
                      className={`
                        inline-flex items-center
                        gap-1.5 rounded-full
                        px-3 py-1.5
                        text-xs font-bold
                        ring-1
                        ${
                          profile.isEmailVerified
                            ? "bg-blue-50 text-blue-700 ring-blue-200"
                            : "bg-amber-50 text-amber-700 ring-amber-200"
                        }
                      `}
                    >
                      {profile.isEmailVerified ? (
                        <BadgeCheck className="h-3.5 w-3.5" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5" />
                      )}

                      {profile.isEmailVerified
                        ? "Verified"
                        : "Unverified"}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Account information */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-11 w-11 items-center
                    justify-center rounded-xl
                    bg-brand-navy/5
                    text-brand-navy
                  "
                >
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Account Role
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {formatRole(profile?.role)}
                  </p>
                </div>
              </div>

              <div className="my-5 h-px bg-slate-100" />

              <div className="space-y-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Account ID
                  </p>

                  <p className="mt-1.5 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-[11px] text-slate-600">
                    {profile?.id || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Portal Access
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-slate-700">
                    Administration Portal
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Security Level
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-gold" />

                    <span className="text-sm font-semibold text-slate-700">
                      Administrator
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </aside>

          {/* =================================================
              RIGHT CONTENT
          ================================================= */}

          <div className="space-y-6">
            {/* =================================================
                ACCOUNT INFORMATION
            ================================================= */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/70 px-5 py-5 sm:px-7">
                <div className="flex items-start gap-4">
                  <div
                    className="
                      flex h-11 w-11 shrink-0
                      items-center justify-center
                      rounded-xl bg-brand-navy
                      text-white shadow-sm
                    "
                  >
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Account Information
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Update the personal information
                      associated with your administrator
                      account.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleProfileSubmit}
                className="space-y-6 p-5 sm:p-7"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <FormInput
                    label="Full Name"
                    value={name}
                    onChange={setName}
                    placeholder="Enter your full name"
                    icon={
                      <UserRound className="h-4 w-4" />
                    }
                    required
                  />

                  <FormInput
                    label="Email Address"
                    value={email}
                    onChange={setEmail}
                    placeholder="Enter your email address"
                    type="email"
                    icon={
                      <Mail className="h-4 w-4" />
                    }
                    required
                  />
                </div>

                <div
                  className="
                    rounded-2xl border
                    border-brand-navy/10
                    bg-brand-navy/[0.025]
                    p-4
                  "
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Administrator role
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Your administrator role is
                        managed by the system and
                        cannot be changed from your
                        profile.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="
                      inline-flex h-11
                      items-center justify-center
                      gap-2 rounded-xl
                      bg-brand-navy px-5
                      text-sm font-bold text-white
                      shadow-sm transition
                      hover:-translate-y-0.5
                      hover:shadow-lg
                      disabled:translate-y-0
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 text-brand-gold" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* =================================================
                SECURITY
            ================================================= */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/70 px-5 py-5 sm:px-7">
                <div className="flex items-start gap-4">
                  <div
                    className="
                      flex h-11 w-11 shrink-0
                      items-center justify-center
                      rounded-xl bg-brand-gold
                      text-brand-navy shadow-sm
                    "
                  >
                    <KeyRound className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Security & Password
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Change your administrator
                      password and keep your account
                      secure.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-6 p-5 sm:p-7"
              >
                <PasswordInput
                  label="Current Password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  visible={showCurrentPassword}
                  onToggle={() =>
                    setShowCurrentPassword(
                      (value) => !value
                    )
                  }
                  placeholder="Enter your current password"
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <PasswordInput
                    label="New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    visible={showNewPassword}
                    onToggle={() =>
                      setShowNewPassword(
                        (value) => !value
                      )
                    }
                    placeholder="Minimum 8 characters"
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    visible={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    placeholder="Repeat your new password"
                  />
                </div>

                <div
                  className="
                    rounded-2xl
                    border border-amber-200
                    bg-amber-50/70 p-4
                  "
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <LockKeyhole className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-amber-900">
                        Password requirements
                      </p>

                      <ul className="mt-2 space-y-1.5 text-xs leading-5 text-amber-800">
                        <li>
                          • Minimum of 8 characters.
                        </li>

                        <li>
                          • Use a password different
                          from your current password.
                        </li>

                        <li>
                          • Never share your
                          administrator credentials.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="
                      inline-flex h-11
                      items-center justify-center
                      gap-2 rounded-xl
                      bg-brand-navy px-5
                      text-sm font-bold text-white
                      shadow-sm transition
                      hover:-translate-y-0.5
                      hover:shadow-lg
                      disabled:translate-y-0
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4 text-brand-gold" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* =================================================
                SECURITY NOTICE
            ================================================= */}

            <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-5 text-white shadow-lg sm:p-7">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                <div
                  className="
                    flex h-12 w-12 shrink-0
                    items-center justify-center
                    rounded-xl
                    border border-white/10
                    bg-white/10
                  "
                >
                  <ShieldCheck className="h-6 w-6 text-brand-gold" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">
                      Protect your administrator account
                    </h3>

                    <span className="rounded-full bg-brand-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                      Security
                    </span>
                  </div>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
                    Administrator accounts have access
                    to sensitive academic, student,
                    financial, and system information.
                    Always sign out when using a shared
                    computer and never share your
                    password.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}