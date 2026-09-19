"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  AtSign,
  BadgeCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import { useSession } from "next-auth/react";

import {
  apiGet,
  apiPatch,
} from "@/lib/api";

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

interface LecturerProfile {
  id?: string;
  _id?: string;

  name?: string;
  email?: string;
  role?: string;

  programme?: Programme | null;
  academicSession?: AcademicSession | null;

  level?: string;
  matricNumber?: string;

  isActive?: boolean;
  isSuspended?: boolean;
  isEmailVerified?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  user?: LecturerProfile;
}

interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  user?: LecturerProfile;
}

interface PasswordResponse {
  success: boolean;
  message?: string;
}

interface ApiError {
  message?: string;
}

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(
  name?: string | null,
) {
  if (!name?.trim()) {
    return "L";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function formatRole(
  role?: string | null,
) {
  if (!role) {
    return "Lecturer";
  }

  return role.charAt(0).toUpperCase() +
    role.slice(1);
}

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
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function formatMemberSince(
  value?: string,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon: Icon,
  label,
  value,
  verified,
}: {
  icon: typeof User;
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="break-words text-sm font-semibold text-slate-800">
            {value}
          </p>

          {verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 truncate text-lg font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function LecturerProfilePage() {
  const { data: session } = useSession();

  const sessionUser =
    session?.user as
      | SessionUser
      | undefined;

  const [profile, setProfile] =
    useState<LecturerProfile | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =======================================================
     EDIT PROFILE
  ======================================================= */

  const [editOpen, setEditOpen] =
    useState(false);

  const [editName, setEditName] =
    useState("");

  const [editEmail, setEditEmail] =
    useState("");

  const [savingProfile, setSavingProfile] =
    useState(false);

  /* =======================================================
     CHANGE PASSWORD
  ======================================================= */

  const [passwordOpen, setPasswordOpen] =
    useState(false);

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

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const accessToken =
    session?.accessToken as
      | string
      | undefined;

  /* =======================================================
     FETCH PROFILE
  ======================================================= */

  const loadProfile = useCallback(
    async (
      showRefreshState = false,
    ) => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setError("");

        if (showRefreshState) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await apiGet<ProfileResponse>(
            "/users/me",
            accessToken,
          );

        if (
          !response.success ||
          !response.user
        ) {
          throw new Error(
            response.message ||
              "Unable to retrieve your profile.",
          );
        }

        setProfile(response.user);
      } catch (err) {
        const apiError =
          err as ApiError;

        setError(
          apiError.message ||
            "Unable to load your profile. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  /* =======================================================
     SYNC EDIT FORM
  ======================================================= */

  useEffect(() => {
    if (!profile) {
      return;
    }

    setEditName(
      profile.name || "",
    );

    setEditEmail(
      profile.email || "",
    );
  }, [profile]);

  /* =======================================================
     DISPLAY VALUES
  ======================================================= */

  const displayName =
    profile?.name ||
    sessionUser?.name ||
    "Lecturer";

  const displayEmail =
    profile?.email ||
    sessionUser?.email ||
    "lecturer@itmt.edu.ng";

  const displayRole =
    profile?.role ||
    sessionUser?.role ||
    "lecturer";

  const initials =
    getInitials(displayName);

  const accountStatus =
    profile?.isSuspended
      ? "Suspended"
      : profile?.isActive === false
        ? "Inactive"
        : "Active";

  const emailStatus =
    profile?.isEmailVerified
      ? "Verified"
      : "Unverified";

  const joinedDate =
    formatDate(
      profile?.createdAt,
    );

  const memberSince =
    formatMemberSince(
      profile?.createdAt,
    );

  const programmeName =
    profile?.programme?.name || "";

  const programmeCode =
    profile?.programme?.code || "";

  const academicSession =
    profile?.academicSession?.name ||
    "";

  const hasAcademicData =
    Boolean(
      programmeName ||
        programmeCode ||
        academicSession ||
        profile?.level ||
        profile?.matricNumber,
    );

  /* =======================================================
     PASSWORD STRENGTH
  ======================================================= */

  const passwordStrength =
    useMemo(() => {
      if (!newPassword) {
        return {
          label: "Not set",
          width: "w-0",
        };
      }

      let score = 0;

      if (newPassword.length >= 8) {
        score++;
      }

      if (/[A-Z]/.test(newPassword)) {
        score++;
      }

      if (/[a-z]/.test(newPassword)) {
        score++;
      }

      if (/[0-9]/.test(newPassword)) {
        score++;
      }

      if (
        /[^A-Za-z0-9]/.test(
          newPassword,
        )
      ) {
        score++;
      }

      if (score <= 2) {
        return {
          label: "Weak",
          width: "w-1/3",
        };
      }

      if (score <= 4) {
        return {
          label: "Good",
          width: "w-2/3",
        };
      }

      return {
        label: "Strong",
        width: "w-full",
      };
    }, [newPassword]);

  /* =======================================================
     OPEN EDIT PROFILE
  ======================================================= */

  function openEditProfile() {
    setError("");
    setSuccess("");

    setEditName(
      profile?.name || "",
    );

    setEditEmail(
      profile?.email || "",
    );

    setEditOpen(true);
  }

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  async function handleUpdateProfile() {
    if (!accessToken) {
      setError(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    const name =
      editName.trim();

    const email =
      editEmail.trim().toLowerCase();

    if (name.length < 2) {
      setError(
        "Name must be at least 2 characters.",
      );
      return;
    }

    if (!email) {
      setError(
        "Email address is required.",
      );
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const payload: {
        name?: string;
        email?: string;
      } = {};

      if (
        name !==
        (profile?.name || "")
      ) {
        payload.name = name;
      }

      if (
        email !==
        (profile?.email || "")
          .toLowerCase()
      ) {
        payload.email = email;
      }

      if (
        payload.name === undefined &&
        payload.email === undefined
      ) {
        setEditOpen(false);

        setSuccess(
          "No profile changes were made.",
        );

        return;
      }

      const response =
        await apiPatch<UpdateProfileResponse>(
          "/users/me",
          payload,
          accessToken,
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

      setProfile(
        response.user,
      );

      setEditOpen(false);

      setSuccess(
        response.message ||
          "Profile updated successfully.",
      );
    } catch (err) {
      const apiError =
        err as ApiError;

      setError(
        apiError.message ||
          "Unable to update your profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  /* =======================================================
     OPEN PASSWORD MODAL
  ======================================================= */

  function openPasswordModal() {
    setError("");
    setSuccess("");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setPasswordOpen(true);
  }

  /* =======================================================
     CHANGE PASSWORD
  ======================================================= */

  async function handleChangePassword() {
    if (!accessToken) {
      setError(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    if (!currentPassword) {
      setError(
        "Enter your current password.",
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters.",
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "New password and confirmation do not match.",
      );
      return;
    }

    try {
      setChangingPassword(true);
      setError("");
      setSuccess("");

      const response =
        await apiPatch<PasswordResponse>(
          "/users/me/password",
          {
            currentPassword,
            newPassword,
            confirmPassword,
          },
          accessToken,
        );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to change password.",
        );
      }

      setPasswordOpen(false);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess(
        response.message ||
          "Password changed successfully.",
      );
    } catch (err) {
      const apiError =
        err as ApiError;

      setError(
        apiError.message ||
          "Unable to change your password.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold shadow-lg">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>

          <div className="text-center">
            <p className="font-semibold text-slate-800">
              Loading your profile
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Preparing your lecturer workspace...
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
    <>
      <div className="space-y-6 pb-10">
        {/* PAGE HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>
                Lecturer Portal
              </span>

              <ChevronRight className="h-4 w-4" />

              <span className="font-medium text-brand-navy">
                Profile
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-base">
              Manage your personal information,
              account security, and lecturer identity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                void loadProfile(true)
              }
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

            <button
              type="button"
              onClick={openEditProfile}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1 transition hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                Success
              </p>

              <p className="mt-1">
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

        {/* HERO */}

        <section className="relative overflow-hidden rounded-3xl bg-brand-navy shadow-xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  {sessionUser?.image ? (
                    <img
                      src={
                        sessionUser.image
                      }
                      alt={displayName}
                      className="h-24 w-24 rounded-3xl border-4 border-white/15 object-cover shadow-xl sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white/10 bg-white/10 text-2xl font-bold text-brand-gold shadow-xl backdrop-blur sm:h-28 sm:w-28">
                      {initials}
                    </div>
                  )}

                  <span
                    className={`absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-brand-navy ${
                      accountStatus ===
                      "Active"
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-bold text-brand-gold">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Lecturer
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        accountStatus ===
                        "Active"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-red-400/10 text-red-300"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          accountStatus ===
                          "Active"
                            ? "bg-emerald-400"
                            : "bg-red-400"
                        }`}
                      />

                      {accountStatus}
                    </span>
                  </div>

                  <h2 className="break-words text-2xl font-bold text-white sm:text-3xl">
                    {displayName}
                  </h2>

                  <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-300">
                    <Mail className="h-4 w-4 shrink-0" />
                    {displayEmail}
                  </p>

                  <p className="mt-3 text-sm font-medium text-slate-400">
                    {formatRole(
                      displayRole,
                    )}{" "}
                    · ITMT Academic Portal
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[360px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Account
                  </p>

                  <p className="mt-2 text-sm font-bold text-white">
                    {accountStatus}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email
                  </p>

                  <p className="mt-2 text-sm font-bold text-white">
                    {emailStatus}
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:col-span-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Member Since
                  </p>

                  <p className="mt-2 text-sm font-bold text-white">
                    {memberSince}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK STATS */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={ShieldCheck}
            label="Account Status"
            value={accountStatus}
          />

          <StatCard
            icon={Mail}
            label="Email Status"
            value={emailStatus}
          />

          <StatCard
            icon={Clock3}
            label="Member Since"
            value={joinedDate}
          />

          <StatCard
            icon={GraduationCap}
            label="Portal Role"
            value={formatRole(
              displayRole,
            )}
          />
        </div>

        {/* CONTENT */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.8fr)]">
          {/* PERSONAL INFORMATION */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                  <CircleUserRound className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Personal Information
                  </h3>

                  <p className="text-xs text-slate-500">
                    Your core account information
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openEditProfile}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-navy hover:text-brand-navy"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
            </div>

            <div className="mt-5">
              <InfoRow
                icon={User}
                label="Full Name"
                value={displayName}
              />

              <InfoRow
                icon={AtSign}
                label="Email Address"
                value={displayEmail}
                verified={
                  profile?.isEmailVerified
                }
              />

              <InfoRow
                icon={GraduationCap}
                label="Role"
                value={formatRole(
                  displayRole,
                )}
              />

              <InfoRow
                icon={ShieldCheck}
                label="Account Status"
                value={accountStatus}
              />
            </div>
          </section>

          {/* SECURITY */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Account Security
                </h3>

                <p className="text-xs text-slate-500">
                  Protect your lecturer account
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-navy shadow-sm">
                  <KeyRound className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">
                    Password
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Change your password regularly
                    to keep your account secure.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  openPasswordModal
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <KeyRound className="h-4 w-4" />
                Change Password
              </button>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Secure account access
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  Your account is protected by the
                  ITMT authentication system.
                </p>
              </div>
            </div>
          </section>

          {/* OPTIONAL ACADEMIC INFORMATION */}

          {hasAcademicData && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Academic Information
                  </h3>

                  <p className="text-xs text-slate-500">
                    Academic information linked to this account
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {programmeName && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Programme
                    </p>

                    <p className="mt-2 font-bold text-slate-800">
                      {programmeName}
                    </p>

                    {programmeCode && (
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {programmeCode}
                      </p>
                    )}
                  </div>
                )}

                {academicSession && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Academic Session
                    </p>

                    <p className="mt-2 font-bold text-slate-800">
                      {academicSession}
                    </p>
                  </div>
                )}

                {profile?.level && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Level
                    </p>

                    <p className="mt-2 font-bold text-slate-800">
                      {profile.level}
                    </p>
                  </div>
                )}

                {profile?.matricNumber && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Matric Number
                    </p>

                    <p className="mt-2 font-bold text-slate-800">
                      {profile.matricNumber}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ACCOUNT DETAILS */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Account Details
                </h3>

                <p className="text-xs text-slate-500">
                  Current account verification state
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Email verification
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Your account email status
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    profile?.isEmailVerified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {emailStatus}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Account access
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Current account availability
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    accountStatus ===
                    "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {accountStatus}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Portal access
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Lecturer workspace
                  </p>
                </div>

                <span className="rounded-full bg-brand-navy px-3 py-1 text-xs font-bold text-white">
                  Lecturer
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* WORKSPACE NOTICE */}

        <section className="overflow-hidden rounded-3xl border border-brand-gold/20 bg-gradient-to-r from-brand-navy to-slate-900 shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm font-bold text-brand-gold">
                  Lecturer Workspace
                </p>

                <h3 className="mt-1 text-lg font-bold text-white">
                  Your profile powers your academic portal.
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Your authenticated lecturer identity is used
                  across courses, attendance, registrations,
                  results, reports, notifications, and other
                  academic services.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Check className="h-4 w-4 text-emerald-400" />
                Profile synchronized
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===================================================
          EDIT PROFILE MODAL
      =================================================== */}

      {editOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              if (!savingProfile) {
                setEditOpen(false);
              }
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <h2
                  id="edit-profile-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Edit Profile
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Update your personal account information.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditOpen(false)
                }
                disabled={savingProfile}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                aria-label="Close edit profile"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="profile-name"
                    value={editName}
                    onChange={(event) =>
                      setEditName(
                        event.target.value,
                      )
                    }
                    disabled={savingProfile}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 disabled:bg-slate-50"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="profile-email"
                    type="email"
                    value={editEmail}
                    onChange={(event) =>
                      setEditEmail(
                        event.target.value,
                      )
                    }
                    disabled={savingProfile}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 disabled:bg-slate-50"
                    placeholder="Enter your email address"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Changing your email will reset its
                  verification status.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-navy" />

                  <p className="text-xs leading-5 text-slate-600">
                    Your role, account status, programme,
                    academic session, level, and matric number
                    are controlled by the institution and cannot
                    be changed from this page.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setEditOpen(false)
                  }
                  disabled={savingProfile}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleUpdateProfile()
                  }
                  disabled={savingProfile}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          CHANGE PASSWORD MODAL
      =================================================== */}

      {passwordOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              if (!changingPassword) {
                setPasswordOpen(false);
              }
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <h2
                  id="change-password-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Change Password
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Update the password used to access your account.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPasswordOpen(false)
                }
                disabled={changingPassword}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                aria-label="Close change password"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {/* CURRENT PASSWORD */}

              <div>
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Current Password
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="current-password"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      currentPassword
                    }
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value,
                      )
                    }
                    disabled={
                      changingPassword
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-800 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 disabled:bg-slate-50"
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) =>
                          !value,
                      )
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* NEW PASSWORD */}

              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  New Password
                </label>

                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="new-password"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value,
                      )
                    }
                    disabled={
                      changingPassword
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-800 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 disabled:bg-slate-50"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (value) =>
                          !value,
                      )
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-3">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-400">
                        Password strength
                      </span>

                      <span className="text-slate-600">
                        {
                          passwordStrength.label
                        }
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full bg-brand-gold transition-all duration-300 ${passwordStrength.width}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm New Password
                </label>

                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    disabled={
                      changingPassword
                    }
                    className={`h-11 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-slate-800 outline-none transition focus:ring-4 disabled:bg-slate-50 ${
                      confirmPassword &&
                      confirmPassword !==
                        newPassword
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-brand-navy focus:ring-brand-navy/10"
                    }`}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) =>
                          !value,
                      )
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password confirmation"
                        : "Show password confirmation"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {confirmPassword &&
                  confirmPassword !==
                    newPassword && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      Passwords do not match.
                    </p>
                  )}
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                  <p className="text-xs leading-5 text-amber-800">
                    Your new password must contain at least
                    8 characters and must be different from
                    your current password.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setPasswordOpen(false)
                  }
                  disabled={
                    changingPassword
                  }
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleChangePassword()
                  }
                  disabled={
                    changingPassword
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}