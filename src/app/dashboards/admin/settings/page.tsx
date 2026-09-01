"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
  UserRound,
  Loader2,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

import { apiGet, apiPatch } from "@/lib/api";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type UserRole =
  | "admin"
  | "registrar"
  | "finance"
  | "lecturer"
  | "student";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;

  programme?: {
    _id?: string;
    name?: string;
    code?: string;
  } | null;

  academicSession?: {
    _id?: string;
    name?: string;
  } | null;

  level?: string;
  matricNumber?: string;
};

type MeResponse = {
  success: boolean;
  user?: UserProfile;
  message?: string;
};

type ApiError = {
  message?: string;

  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
};

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  const apiError = error as ApiError;

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    fallback
  );
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD"
  );
}

function getRoleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    admin: "Administrator",
    registrar: "Registrar",
    finance: "Finance Officer",
    lecturer: "Lecturer",
    student: "Student",
  };

  return labels[role] ?? role;
}

/**
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function AdminSettingsPage() {
  /**
   * =======================================================
   * SESSION
   * =======================================================
   */

  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const backendToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  /**
   * =======================================================
   * STATE
   * =======================================================
   */

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  /**
   * =======================================================
   * LOAD PROFILE
   * =======================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (sessionStatus === "loading") {
        return;
      }

      if (sessionStatus === "unauthenticated") {
        if (mounted) {
          setProfileError(
            "Your session has expired. Please sign in again.",
          );

          setProfileLoading(false);
        }

        return;
      }

      if (!backendToken) {
        if (mounted) {
          setProfileError(
            "Authentication token is missing. Please sign in again.",
          );

          setProfileLoading(false);
        }

        return;
      }

      try {
        setProfileLoading(true);
        setProfileError("");

        const response =
          await apiGet<MeResponse>(
            "/users/me",
            backendToken,
          );

        if (!mounted) {
          return;
        }

        if (
          !response.success ||
          !response.user
        ) {
          throw new Error(
            response.message ||
              "Unable to load your profile.",
          );
        }

        setUser(response.user);
        setName(response.user.name || "");
        setEmail(response.user.email || "");
      } catch (error) {
        if (!mounted) {
          return;
        }

        setProfileError(
          getErrorMessage(
            error,
            "Unable to load your profile.",
          ),
        );
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [
    backendToken,
    sessionStatus,
  ]);

  /**
   * =======================================================
   * PROFILE UPDATE
   * =======================================================
   */

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!backendToken) {
      setProfileError(
        "Authentication token is missing. Please sign in again.",
      );

      return;
    }

    const trimmedName = name.trim();
    const normalizedEmail =
      email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setProfileError(
        "Name must be at least 2 characters.",
      );

      return;
    }

    if (!normalizedEmail) {
      setProfileError(
        "Email address is required.",
      );

      return;
    }

    try {
      setProfileSaving(true);

      const response =
        await apiPatch<MeResponse>(
          "/users/me",
          {
            name: trimmedName,
            email: normalizedEmail,
          },
          backendToken,
        );

      if (
        !response.success ||
        !response.user
      ) {
        throw new Error(
          response.message ||
            "Unable to update your profile.",
        );
      }

      setUser(response.user);
      setName(response.user.name || "");
      setEmail(response.user.email || "");

      setProfileMessage(
        "Your profile has been updated successfully.",
      );
    } catch (error) {
      setProfileError(
        getErrorMessage(
          error,
          "Unable to update your profile.",
        ),
      );
    } finally {
      setProfileSaving(false);
    }
  }

  /**
   * =======================================================
   * PASSWORD UPDATE
   * =======================================================
   */

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!backendToken) {
      setPasswordError(
        "Authentication token is missing. Please sign in again.",
      );

      return;
    }

    if (!currentPassword) {
      setPasswordError(
        "Enter your current password.",
      );

      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters.",
      );

      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(
        "New password must be different from your current password.",
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match.",
      );

      return;
    }

    try {
      setPasswordSaving(true);

      const response =
        await apiPatch<{
          success: boolean;
          message?: string;
        }>(
          "/users/me/password",
          {
            currentPassword,
            newPassword,
            confirmPassword,
          },
          backendToken,
        );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to change your password.",
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage(
        "Your password has been changed successfully.",
      );
    } catch (error) {
      setPasswordError(
        getErrorMessage(
          error,
          "Unable to change your password.",
        ),
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  /**
   * =======================================================
   * DERIVED VALUES
   * =======================================================
   */

  const initials = useMemo(
    () => getInitials(user?.name || ""),
    [user?.name],
  );

  const roleLabel = user
    ? getRoleLabel(user.role)
    : "Administrator";

  /**
   * =======================================================
   * SESSION LOADING
   * =======================================================
   */

  if (sessionStatus === "loading") {
    return (
      <SettingsLoader text="Loading session..." />
    );
  }

  /**
   * =======================================================
   * PROFILE LOADING
   * =======================================================
   */

  if (profileLoading) {
    return (
      <SettingsLoader text="Loading your settings..." />
    );
  }

  /**
   * =======================================================
   * PAGE
   * =======================================================
   */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">

      {/* ===================================================
          PREMIUM HERO
      =================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm">

        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative p-6 sm:p-8 lg:p-10">

          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex min-w-0 items-center gap-5">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-gold text-lg font-bold text-brand-dark shadow-lg sm:h-20 sm:w-20 sm:text-xl">
                {user ? initials : "AD"}
              </div>

              <div className="min-w-0">

                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                    Account Settings
                  </span>
                </div>

                <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {user?.name || "Administrator"}
                </h1>

                <p className="mt-1 text-sm text-white/55">
                  Manage your profile, account
                  preferences, and security.
                </p>

                {user && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70">
                      <ShieldCheck className="h-3 w-3" />
                      {roleLabel}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {user.isActive
                        ? "Active account"
                        : "Inactive account"}
                    </span>

                  </div>
                )}

              </div>
            </div>

            <div className="hidden shrink-0 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 sm:block">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10">
                  <LockKeyhole className="h-4 w-4 text-brand-gold" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    Security
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    Keep your account secure
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ===================================================
          ERROR
      =================================================== */}

      {profileError && !user && (
        <StatusMessage
          type="error"
          message={profileError}
        />
      )}

      {user && (
        <>
          {/* ===============================================
              ACCOUNT OVERVIEW
          =============================================== */}

          <section className="space-y-4">

            <SectionHeading
              icon={
                <UserRound className="h-4 w-4" />
              }
              title="Account Overview"
              description="A quick overview of your administrator account."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <OverviewCard
                icon={
                  <User className="h-5 w-5" />
                }
                label="Full Name"
                value={user.name}
                iconClass="bg-brand-navy/10 text-brand-navy"
              />

              <OverviewCard
                icon={
                  <Mail className="h-5 w-5" />
                }
                label="Email Address"
                value={user.email}
                iconClass="bg-brand-gold/10 text-brand-gold"
              />

              <OverviewCard
                icon={
                  <ShieldCheck className="h-5 w-5" />
                }
                label="System Role"
                value={roleLabel}
                iconClass="bg-violet-50 text-violet-600"
              />

              <OverviewCard
                icon={
                  <CheckCircle2 className="h-5 w-5" />
                }
                label="Account Status"
                value={
                  user.isActive
                    ? "Active"
                    : "Inactive"
                }
                iconClass={
                  user.isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-500"
                }
                valueClass={
                  user.isActive
                    ? "text-emerald-600"
                    : "text-slate-500"
                }
              />

            </div>
          </section>

          {/* ===============================================
              PROFILE + SIDE INFO
          =============================================== */}

          <section className="grid gap-6 lg:grid-cols-3">

            {/* PROFILE */}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-sm lg:col-span-2">

              <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
                    <User className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-brand-dark">
                      Profile Information
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Update the personal information associated with your account.
                    </p>
                  </div>

                </div>

              </div>

              <div className="p-5 sm:p-6">

                <form
                  onSubmit={handleProfileSubmit}
                  className="space-y-5"
                >

                  <div className="grid gap-5 md:grid-cols-2">

                    <FormField
                      id="name"
                      label="Full Name"
                      icon={
                        <User className="h-4 w-4" />
                      }
                      value={name}
                      onChange={setName}
                      placeholder="Enter your full name"
                      disabled={profileSaving}
                    />

                    <FormField
                      id="email"
                      label="Email Address"
                      icon={
                        <Mail className="h-4 w-4" />
                      }
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="Enter your email"
                      disabled={profileSaving}
                    />

                  </div>

                  {profileError && (
                    <StatusMessage
                      type="error"
                      message={profileError}
                    />
                  )}

                  {profileMessage && (
                    <StatusMessage
                      type="success"
                      message={profileMessage}
                    />
                  )}

                  <div className="flex justify-end border-t border-slate-100 pt-5">

                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {profileSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>

                  </div>

                </form>

              </div>
            </div>

            {/* PROFILE SUMMARY */}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-sm">

              <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-5">

                <h2 className="text-base font-semibold text-brand-dark">
                  Account Summary
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Important information about your account.
                </p>

              </div>

              <div className="space-y-4 p-5">

                <SummaryRow
                  icon={
                    <ShieldCheck className="h-4 w-4" />
                  }
                  label="Role"
                  value={roleLabel}
                />

                <SummaryRow
                  icon={
                    <Mail className="h-4 w-4" />
                  }
                  label="Email Verification"
                  value={
                    user.isEmailVerified
                      ? "Verified"
                      : "Not Verified"
                  }
                  valueClass={
                    user.isEmailVerified
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }
                />

                <SummaryRow
                  icon={
                    <CheckCircle2 className="h-4 w-4" />
                  }
                  label="Account Status"
                  value={
                    user.isActive
                      ? "Active"
                      : "Inactive"
                  }
                  valueClass={
                    user.isActive
                      ? "text-emerald-600"
                      : "text-slate-500"
                  }
                />

                <div className="rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.03] p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-brand-dark">
                        Administrator account
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Your system role is managed by the institution and cannot be changed from this page.
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            </div>

          </section>

          {/* ===============================================
              SECURITY
          =============================================== */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-sm">

            <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                    <KeyRound className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-brand-dark">
                      Security
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Protect your administrator account by keeping your password secure.
                    </p>
                  </div>

                </div>

                <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 sm:flex">
                  <LockKeyhole className="h-3 w-3" />
                  Password Protected
                </div>

              </div>

            </div>

            <div className="p-5 sm:p-6">

              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-6"
              >

                <PasswordField
                  id="currentPassword"
                  label="Current Password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  visible={showCurrentPassword}
                  onToggle={() =>
                    setShowCurrentPassword(
                      (value) => !value,
                    )
                  }
                  disabled={passwordSaving}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />

                <div className="grid gap-5 md:grid-cols-2">

                  <PasswordField
                    id="newPassword"
                    label="New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    visible={showNewPassword}
                    onToggle={() =>
                      setShowNewPassword(
                        (value) => !value,
                      )
                    }
                    disabled={passwordSaving}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />

                  <PasswordField
                    id="confirmPassword"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    visible={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword(
                        (value) => !value,
                      )
                    }
                    disabled={passwordSaving}
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                  />

                </div>

                {/* PASSWORD REQUIREMENTS */}

                <div className="rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.025] p-4 sm:p-5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
                      <KeyRound className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">

                      <p className="text-sm font-semibold text-brand-dark">
                        Password requirements
                      </p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-3">

                        <Requirement
                          active={
                            newPassword.length >= 8
                          }
                          text="At least 8 characters"
                        />

                        <Requirement
                          active={
                            Boolean(
                              newPassword &&
                                currentPassword &&
                                newPassword !==
                                  currentPassword,
                            )
                          }
                          text="Different from current password"
                        />

                        <Requirement
                          active={
                            Boolean(
                              newPassword &&
                                confirmPassword &&
                                newPassword ===
                                  confirmPassword,
                            )
                          }
                          text="Passwords match"
                        />

                      </div>

                    </div>

                  </div>

                </div>

                {passwordError && (
                  <StatusMessage
                    type="error"
                    message={passwordError}
                  />
                )}

                {passwordMessage && (
                  <StatusMessage
                    type="success"
                    message={passwordMessage}
                  />
                )}

                <div className="flex justify-end border-t border-slate-100 pt-5">

                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {passwordSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </button>

                </div>

              </form>

            </div>
          </section>

          {/* ===============================================
              SYSTEM ACCOUNT
          =============================================== */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-sm">

            <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-brand-dark">
                    System Account
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    System-managed information for your account.
                  </p>
                </div>

              </div>

            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">

              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
                    <ShieldCheck className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Account Role
                    </p>

                    <p className="mt-1 text-sm font-semibold text-brand-dark">
                      {roleLabel}
                    </p>

                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      Your system role is controlled by the institution and cannot be changed from Settings.
                    </p>
                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">

                <div className="flex items-start gap-3">

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      user.isEmailVerified
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {user.isEmailVerified ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Email Verification
                    </p>

                    <p
                      className={`mt-1 text-sm font-semibold ${
                        user.isEmailVerified
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {user.isEmailVerified
                        ? "Verified"
                        : "Not Verified"}
                    </p>

                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      Your email verification status is managed by the authentication system.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </section>
        </>
      )}
    </div>
  );
}

/**
 * =========================================================
 * SETTINGS LOADER
 * =========================================================
 */

function SettingsLoader({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex min-h-[500px] items-center justify-center">

      <div className="flex flex-col items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/10">
          <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
        </div>

        <p className="text-sm text-slate-500">
          {text}
        </p>

      </div>

    </div>
  );
}

/**
 * =========================================================
 * SECTION HEADING
 * =========================================================
 */

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
        {icon}
      </div>

      <div>
        <h2 className="text-base font-semibold text-brand-dark">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>

    </div>
  );
}

/**
 * =========================================================
 * OVERVIEW CARD
 * =========================================================
 */

function OverviewCard({
  icon,
  label,
  value,
  iconClass,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-sm font-semibold ${
          valueClass || "text-brand-dark"
        }`}
        title={value}
      >
        {value}
      </p>

    </div>
  );
}

/**
 * =========================================================
 * FORM FIELD
 * =========================================================
 */

function FormField({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">

      <label
        htmlFor={id}
        className="text-xs font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">

        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          disabled={disabled}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-brand-dark outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:opacity-60"
        />

      </div>
    </div>
  );
}

/**
 * =========================================================
 * PASSWORD FIELD
 * =========================================================
 */

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  disabled,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <div className="space-y-2">

      <label
        htmlFor={id}
        className="text-xs font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">

        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-brand-dark outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
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

/**
 * =========================================================
 * SUMMARY ROW
 * =========================================================
 */

function SummaryRow({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
          {icon}
        </div>

        <span className="text-xs font-medium text-slate-500">
          {label}
        </span>

      </div>

      <span
        className={`text-right text-xs font-semibold ${
          valueClass || "text-brand-dark"
        }`}
      >
        {value}
      </span>

    </div>
  );
}

/**
 * =========================================================
 * REQUIREMENT
 * =========================================================
 */

function Requirement({
  active,
  text,
}: {
  active: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${
        active
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-100 bg-white"
      }`}
    >
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          active
            ? "bg-emerald-500 text-white"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {active ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </div>

      <span
        className={`text-[11px] font-medium ${
          active
            ? "text-emerald-700"
            : "text-slate-500"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

/**
 * =========================================================
 * STATUS MESSAGE
 * =========================================================
 */

function StatusMessage({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  const isSuccess = type === "success";

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}

      <span>{message}</span>
    </div>
  );
}

