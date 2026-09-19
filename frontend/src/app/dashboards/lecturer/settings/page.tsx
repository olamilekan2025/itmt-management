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
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
  Bell,
  Megaphone,
  BookOpenCheck,
  ClipboardCheck,
  Settings2,
  Smartphone,
  CalendarDays,
  BadgeCheck,
  Info,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { apiGet, apiPatch } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type Programme = {
  _id?: string;
  name?: string;
  code?: string;
};

type AcademicSession = {
  _id?: string;
  name?: string;
};

type LecturerProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  programme?: Programme | string | null;
  academicSession?: AcademicSession | string | null;
  level?: string | number | null;
  matricNumber?: string | null;
  isActive: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type MeResponse = {
  success: boolean;
  user?: LecturerProfile;
  message?: string;
};

type ProfileResponse = {
  success: boolean;
  user?: LecturerProfile;
  message?: string;
};

type PasswordResponse = {
  success: boolean;
  message?: string;
};

type SettingsTab =
  | "profile"
  | "security"
  | "notifications"
  | "preferences";

/* =========================================================
   HELPERS
========================================================= */

function getProgrammeName(
  programme?: Programme | string | null,
) {
  if (!programme) return "Not assigned";

  if (typeof programme === "string") {
    return programme;
  }

  return programme.name || programme.code || "Not assigned";
}

function getAcademicSessionName(
  session?: AcademicSession | string | null,
) {
  if (!session) return "Not assigned";

  if (typeof session === "string") {
    return session;
  }

  return session.name || "Not assigned";
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/* =========================================================
   SETTINGS CARD
========================================================= */

function SettingsCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

/* =========================================================
   SETTINGS PAGE
========================================================= */

export default function LecturerSettingsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  /* =======================================================
     STATE
  ======================================================== */

  const [activeTab, setActiveTab] =
    useState<SettingsTab>("profile");

  const [profile, setProfile] =
    useState<LecturerProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =======================================================
     PROFILE FORM
  ======================================================== */

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  /* =======================================================
     PASSWORD FORM
  ======================================================== */

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /* =======================================================
     NOTIFICATION PREFERENCES
  ======================================================== */

  const [notificationPreferences, setNotificationPreferences] =
    useState({
      announcements: true,
      results: true,
      courseAssignments: true,
      registrations: true,
    });

  /* =======================================================
     UI PREFERENCES
  ======================================================== */

  const [compactMode, setCompactMode] =
    useState(false);

  /* =======================================================
     LOAD PROFILE
  ======================================================== */

  const loadProfile = useCallback(
    async (refresh = false) => {
      if (!accessToken) return;

      try {
        setError(null);

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await apiGet<MeResponse>(
            "/users/me",
            accessToken,
          );

        if (!response.success || !response.user) {
          throw new Error(
            response.message ||
              "Unable to load your profile.",
          );
        }

        setProfile(response.user);
        setName(response.user.name || "");
        setEmail(response.user.email || "");
      } catch (error) {
        console.error(
          "Lecturer settings profile error:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load your profile.";

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================== */

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      accessToken
    ) {
      void loadProfile();
    }
  }, [
    sessionStatus,
    accessToken,
    loadProfile,
  ]);

  /* =======================================================
     PASSWORD STRENGTH
  ======================================================== */

  const passwordStrength = useMemo(() => {
    if (!newPassword) {
      return {
        score: 0,
        label: "Enter a new password",
      };
    }

    let score = 0;

    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[a-z]/.test(newPassword)) score += 1;
    if (/\d/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 2) {
      return {
        score,
        label: "Weak",
      };
    }

    if (score <= 4) {
      return {
        score,
        label: "Good",
      };
    }

    return {
      score,
      label: "Strong",
    };
  }, [newPassword]);

  /* =======================================================
     SAVE PROFILE
  ======================================================== */

  const handleSaveProfile = async () => {
    if (!accessToken) {
      toast.error(
        "Your session has expired. Please sign in again.",
      );

      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      toast.error(
        "Name must be at least 2 characters.",
      );

      return;
    }

    if (!trimmedEmail) {
      toast.error(
        "Email address is required.",
      );

      return;
    }

    const nameChanged =
      trimmedName !== profile?.name;

    const emailChanged =
      trimmedEmail !==
      profile?.email?.toLowerCase();

    if (!nameChanged && !emailChanged) {
      toast.info(
        "There are no profile changes to save.",
      );

      return;
    }

    try {
      setSavingProfile(true);

      const payload: {
        name?: string;
        email?: string;
      } = {};

      if (nameChanged) {
        payload.name = trimmedName;
      }

      if (emailChanged) {
        payload.email = trimmedEmail;
      }

      const response =
        await apiPatch<ProfileResponse>(
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

      setProfile(response.user);
      setName(response.user.name || "");
      setEmail(response.user.email || "");

      toast.success(
        response.message ||
          "Profile updated successfully.",
      );

      if (emailChanged) {
        toast.info(
          "Your email verification status has been reset because your email address changed.",
        );
      }
    } catch (error) {
      console.error(
        "Update lecturer profile error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update your profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  /* =======================================================
     CHANGE PASSWORD
  ======================================================== */

  const handleChangePassword = async () => {
    if (!accessToken) {
      toast.error(
        "Your session has expired. Please sign in again.",
      );

      return;
    }

    if (!currentPassword) {
      toast.error(
        "Enter your current password.",
      );

      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        "Your new password must contain at least 8 characters.",
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        "Your new passwords do not match.",
      );

      return;
    }

    if (newPassword === currentPassword) {
      toast.error(
        "Your new password must be different from your current password.",
      );

      return;
    }

    try {
      setChangingPassword(true);

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
            "Unable to change your password.",
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success(
        response.message ||
          "Password changed successfully.",
      );
    } catch (error) {
      console.error(
        "Change lecturer password error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to change your password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  /* =======================================================
     CLEAR PASSWORD FORM
  ======================================================== */

  const clearPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  /* =======================================================
     TABS
  ======================================================== */

  const tabs: {
    id: SettingsTab;
    label: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      id: "profile",
      label: "Profile",
      description: "Personal account information",
      icon: CircleUserRound,
    },
    {
      id: "security",
      label: "Security",
      description: "Password and account security",
      icon: ShieldCheck,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Choose what you want to receive",
      icon: Bell,
    },
    {
      id: "preferences",
      label: "Preferences",
      description: "Customize your workspace",
      icon: Settings2,
    },
  ];

  /* =======================================================
     AUTH LOADING
  ======================================================== */

  if (sessionStatus === "loading") {
    return (
      <div className="space-y-4 pb-8 sm:space-y-6 sm:pb-10">
        <div className="h-44 animate-pulse rounded-2xl bg-brand-navy/10 sm:rounded-[2rem]" />

        <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
          <div className="h-24 animate-pulse rounded-2xl bg-white shadow-sm lg:h-80" />

          <div className="h-[500px] animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  /* =======================================================
     UNAUTHENTICATED
  ======================================================== */

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-2">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-5 text-center shadow-xl sm:rounded-3xl sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <LockKeyhole className="h-6 w-6 text-red-600" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-brand-navy">
            Authentication Required
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your lecturer session could not be
            verified. Please sign in again.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================== */

  return (
    <div className="space-y-4 pb-8 sm:space-y-6 sm:pb-10">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative isolate overflow-hidden rounded-2xl bg-brand-navy shadow-xl sm:rounded-[2rem] sm:shadow-2xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-32 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl sm:h-80 sm:w-80" />

          <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl sm:h-96 sm:w-96" />

          <div className="absolute right-1/4 top-1/2 h-24 w-24 rounded-full bg-white/5 blur-2xl sm:h-32 sm:w-32" />
        </div>

        <div className="relative p-4 sm:p-6 lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
            <div className="min-w-0">
              <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gold sm:mb-4 sm:text-xs sm:tracking-[0.18em]">
                <Settings2 className="h-3.5 w-3.5 shrink-0" />
                <span>Account Settings</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                Lecturer Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:mt-3 sm:text-base sm:leading-7">
                Manage your lecturer profile, account
                security and workspace preferences from
                one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadProfile(true)
              }
              disabled={refreshing}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5"
            >
              <RefreshCw
                className={`h-4 w-4 shrink-0 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh Profile"}
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-red-700">
                Unable to load settings
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SETTINGS LAYOUT
      ====================================================== */}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
        {/* ===================================================
            SETTINGS NAVIGATION
        ==================================================== */}

        <aside className="h-fit min-w-0 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm lg:sticky lg:top-[92px] lg:p-2">
          <div className="hidden px-4 pb-3 pt-4 lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Settings
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Manage your account
            </p>
          </div>

          {/* Mobile navigation */}
          <div className="scrollbar-none flex min-w-0 gap-1 overflow-x-auto pb-0.5 lg:block lg:overflow-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={[
                    "group relative flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition",
                    "sm:gap-3 sm:px-3 sm:py-3",
                    "lg:w-full",
                    active
                      ? "bg-brand-navy text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-50 hover:text-brand-navy",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition sm:h-9 sm:w-9",
                      active
                        ? "bg-brand-gold text-brand-navy"
                        : "bg-slate-100 text-slate-500 group-hover:bg-brand-gold/10 group-hover:text-brand-gold",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="whitespace-nowrap text-xs font-bold sm:text-sm">
                      {tab.label}
                    </p>

                    <p
                      className={[
                        "mt-0.5 hidden text-[11px] leading-4 lg:block",
                        active
                          ? "text-slate-300"
                          : "text-slate-400",
                      ].join(" ")}
                    >
                      {tab.description}
                    </p>
                  </div>

                  <ChevronRight
                    className={[
                      "ml-auto hidden h-4 w-4 shrink-0 lg:block",
                      active
                        ? "text-brand-gold"
                        : "text-slate-300",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </div>
        </aside>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <div className="min-w-0">
          {/* =================================================
              PROFILE
          ================================================== */}

          {activeTab === "profile" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Profile header */}

              <SettingsCard>
                <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-lg font-bold text-brand-gold shadow-lg sm:h-16 sm:w-16 sm:text-xl">
                      {profile?.name
                        ?.split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) =>
                          part
                            .charAt(0)
                            .toUpperCase(),
                        )
                        .join("") || "L"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="min-w-0 break-words text-base font-bold text-brand-navy sm:text-lg">
                          {profile?.name ||
                            "Lecturer"}
                        </h2>

                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-gold/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-brand-gold sm:px-2.5 sm:py-1 sm:text-[10px]">
                          <GraduationCap className="h-3 w-3" />
                          Lecturer
                        </span>
                      </div>

                      <p className="mt-1 break-all text-xs text-slate-500 sm:text-sm">
                        {profile?.email || "—"}
                      </p>
                    </div>

                    <div
                      className={[
                        "inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold",
                        profile?.isActive &&
                        !profile?.isSuspended
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "h-2 w-2 rounded-full",
                          profile?.isActive &&
                          !profile?.isSuspended
                            ? "bg-emerald-500"
                            : "bg-red-500",
                        ].join(" ")}
                      />

                      {profile?.isSuspended
                        ? "Suspended"
                        : profile?.isActive
                          ? "Active"
                          : "Inactive"}
                    </div>
                  </div>
                </div>

                {/* Profile form */}

                <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                  <div>
                    <h3 className="text-base font-bold text-brand-navy">
                      Personal Information
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                      Update the personal information
                      associated with your account.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 md:gap-5">
                    {/* Name */}

                    <div className="min-w-0">
                      <label
                        htmlFor="lecturer-name"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Full Name
                      </label>

                      <div className="relative">
                        <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          id="lecturer-name"
                          value={name}
                          onChange={(event) =>
                            setName(
                              event.target.value,
                            )
                          }
                          disabled={
                            loading ||
                            savingProfile
                          }
                          className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    {/* Email */}

                    <div className="min-w-0">
                      <label
                        htmlFor="lecturer-email"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          id="lecturer-email"
                          type="email"
                          value={email}
                          onChange={(event) =>
                            setEmail(
                              event.target.value,
                            )
                          }
                          disabled={
                            loading ||
                            savingProfile
                          }
                          className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email verification warning */}

                  {profile &&
                    !profile.isEmailVerified && (
                      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 sm:p-4">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-amber-800">
                            Email verification required
                          </p>

                          <p className="mt-1 text-xs leading-5 text-amber-700">
                            Your current email address is
                            not verified. If you recently
                            changed your email, you may
                            need to complete email
                            verification again.
                          </p>
                        </div>
                      </div>
                    )}

                  <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-slate-400">
                      Only your name and email address can
                      be changed from this section.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        void handleSaveProfile()
                      }
                      disabled={
                        savingProfile ||
                        loading
                      }
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/10 transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {savingProfile ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </SettingsCard>

              {/* Academic information */}

              <SettingsCard>
                <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                      <GraduationCap className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold text-brand-navy">
                        Academic Information
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                        Information managed by the institution.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6">
                  <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <GraduationCap className="h-4 w-4 shrink-0" />

                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Programme
                      </span>
                    </div>

                    <p className="mt-2 break-words text-sm font-bold text-brand-navy">
                      {getProgrammeName(
                        profile?.programme,
                      )}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CalendarDays className="h-4 w-4 shrink-0" />

                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Academic Session
                      </span>
                    </div>

                    <p className="mt-2 break-words text-sm font-bold text-brand-navy">
                      {getAcademicSessionName(
                        profile?.academicSession,
                      )}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <BadgeCheck className="h-4 w-4 shrink-0" />

                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Account Role
                      </span>
                    </div>

                    <p className="mt-2 break-words text-sm font-bold capitalize text-brand-navy">
                      {profile?.role ||
                        "Lecturer"}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CalendarDays className="h-4 w-4 shrink-0" />

                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Account Created
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-bold text-brand-navy">
                      {formatDate(
                        profile?.createdAt,
                      )}
                    </p>
                  </div>
                </div>
              </SettingsCard>
            </div>
          )}

          {/* =================================================
              SECURITY
          ================================================== */}

          {activeTab === "security" && (
            <div className="space-y-4 sm:space-y-6">
              <SettingsCard>
                <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold text-brand-navy">
                        Account Security
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                        Keep your lecturer account protected.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                  {/* Security status */}

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                      <p className="mt-3 text-xs font-medium text-emerald-700">
                        Account Status
                      </p>

                      <p className="mt-1 text-sm font-bold text-emerald-800">
                        {profile?.isActive &&
                        !profile?.isSuspended
                          ? "Active"
                          : "Restricted"}
                      </p>
                    </div>

                    <div
                      className={[
                        "rounded-xl border p-4",
                        profile?.isEmailVerified
                          ? "border-emerald-100 bg-emerald-50/70"
                          : "border-amber-100 bg-amber-50/70",
                      ].join(" ")}
                    >
                      <AtSign
                        className={
                          profile?.isEmailVerified
                            ? "h-5 w-5 text-emerald-600"
                            : "h-5 w-5 text-amber-600"
                        }
                      />

                      <p
                        className={[
                          "mt-3 text-xs font-medium",
                          profile?.isEmailVerified
                            ? "text-emerald-700"
                            : "text-amber-700",
                        ].join(" ")}
                      >
                        Email Status
                      </p>

                      <p
                        className={[
                          "mt-1 text-sm font-bold",
                          profile?.isEmailVerified
                            ? "text-emerald-800"
                            : "text-amber-800",
                        ].join(" ")}
                      >
                        {profile?.isEmailVerified
                          ? "Verified"
                          : "Unverified"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                      <KeyRound className="h-5 w-5 text-brand-navy" />

                      <p className="mt-3 text-xs font-medium text-slate-500">
                        Password
                      </p>

                      <p className="mt-1 text-sm font-bold text-brand-navy">
                        Protected
                      </p>
                    </div>
                  </div>

                  {/* Password form */}

                  <div className="rounded-2xl border border-slate-200 p-4 sm:p-6">
                    <div className="mb-5 sm:mb-6">
                      <h3 className="font-bold text-brand-navy">
                        Change Password
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        Use a strong password that you do not
                        use on another service.
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* Current */}

                      <div>
                        <label
                          htmlFor="current-password"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Current Password
                        </label>

                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                            className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-700 outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                            placeholder="Enter your current password"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(
                                (value) =>
                                  !value,
                              )
                            }
                            className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-brand-navy"
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

                      {/* New + Confirm */}

                      <div className="grid gap-5 md:grid-cols-2">
                        {/* New */}

                        <div className="min-w-0">
                          <label
                            htmlFor="new-password"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            New Password
                          </label>

                          <div className="relative">
                            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                              id="new-password"
                              type={
                                showNewPassword
                                  ? "text"
                                  : "password"
                              }
                              value={
                                newPassword
                              }
                              onChange={(
                                event,
                              ) =>
                                setNewPassword(
                                  event.target
                                    .value,
                                )
                              }
                              disabled={
                                changingPassword
                              }
                              className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-700 outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                              placeholder="At least 8 characters"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(
                                  (value) =>
                                    !value,
                                )
                              }
                              className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-brand-navy"
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
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-medium text-slate-400">
                                  Password strength
                                </span>

                                <span
                                  className={[
                                    "text-[11px] font-bold",
                                    passwordStrength.score >=
                                    5
                                      ? "text-emerald-600"
                                      : passwordStrength.score >=
                                          3
                                        ? "text-amber-600"
                                        : "text-red-600",
                                  ].join(" ")}
                                >
                                  {
                                    passwordStrength.label
                                  }
                                </span>
                              </div>

                              <div className="mt-2 flex gap-1">
                                {[1, 2, 3, 4, 5].map(
                                  (level) => (
                                    <div
                                      key={
                                        level
                                      }
                                      className={[
                                        "h-1.5 min-w-0 flex-1 rounded-full",
                                        level <=
                                        passwordStrength.score
                                          ? passwordStrength.score >=
                                            5
                                            ? "bg-emerald-500"
                                            : passwordStrength.score >=
                                                3
                                              ? "bg-amber-500"
                                              : "bg-red-500"
                                          : "bg-slate-200",
                                      ].join(
                                        " ",
                                      )}
                                    />
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Confirm */}

                        <div className="min-w-0">
                          <label
                            htmlFor="confirm-password"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Confirm New Password
                          </label>

                          <div className="relative">
                            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                              onChange={(
                                event,
                              ) =>
                                setConfirmPassword(
                                  event.target
                                    .value,
                                )
                              }
                              disabled={
                                changingPassword
                              }
                              className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-700 outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                              placeholder="Repeat your new password"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(
                                  (value) =>
                                    !value,
                                )
                              }
                              className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-brand-navy"
                              aria-label={
                                showConfirmPassword
                                  ? "Hide confirmation password"
                                  : "Show confirmation password"
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
                            newPassword ===
                              confirmPassword && (
                              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                <Check className="h-3.5 w-3.5" />
                                Passwords match
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Actions */}

                      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={
                            clearPasswordForm
                          }
                          disabled={
                            changingPassword
                          }
                          className="min-h-10 w-full text-sm font-semibold text-slate-500 transition hover:text-brand-navy disabled:opacity-50 sm:w-auto sm:px-2"
                        >
                          Clear fields
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleChangePassword()
                          }
                          disabled={
                            changingPassword
                          }
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/10 transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          {changingPassword ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
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
                    </div>
                  </div>
                </div>
              </SettingsCard>

              {/* Security tips */}

              <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/[0.05] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">
                    <Info className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-navy">
                      Security reminder
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Never share your lecturer portal
                      password with another person. ITMT
                      administrators should never need your
                      password.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================== */}

          {activeTab === "notifications" && (
            <SettingsCard>
              <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                    <Bell className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-bold text-brand-navy">
                      Notification Preferences
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                      Choose which academic updates you want
                      to see.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {[
                  {
                    key: "announcements" as const,
                    icon: Megaphone,
                    title: "Announcements",
                    description:
                      "Receive important announcements from ITMT administrators.",
                  },
                  {
                    key: "results" as const,
                    icon: BookOpenCheck,
                    title: "Result Updates",
                    description:
                      "Receive notifications related to submitted and published results.",
                  },
                  {
                    key: "courseAssignments" as const,
                    icon: GraduationCap,
                    title: "Course Assignments",
                    description:
                      "Receive updates when courses are assigned or changed.",
                  },
                  {
                    key: "registrations" as const,
                    icon: ClipboardCheck,
                    title: "Course Registrations",
                    description:
                      "Receive updates relating to student course registrations.",
                  },
                ].map(
                  ({
                    key,
                    icon: Icon,
                    title,
                    description,
                  }) => {
                    const enabled =
                      notificationPreferences[
                        key
                      ];

                    return (
                      <div
                        key={key}
                        className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-6 sm:py-5"
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold sm:h-11 sm:w-11">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-brand-navy">
                              {title}
                            </p>

                            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                              {description}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={enabled}
                          onClick={() =>
                            setNotificationPreferences(
                              (current) => ({
                                ...current,
                                [key]:
                                  !current[
                                    key
                                  ],
                              }),
                            )
                          }
                          className={[
                            "relative h-7 w-12 shrink-0 self-end rounded-full transition sm:self-center",
                            enabled
                              ? "bg-brand-navy"
                              : "bg-slate-200",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition",
                              enabled
                                ? "left-6"
                                : "left-1",
                            ].join(" ")}
                          />
                        </button>
                      </div>
                    );
                  },
                )}
              </div>

              <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                  <p className="text-xs leading-5 text-slate-500">
                    These controls currently customize
                    notification preferences in this
                    workspace. Your ITMT notification delivery
                    remains managed by the notification system.
                  </p>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* =================================================
              PREFERENCES
          ================================================== */}

          {activeTab === "preferences" && (
            <div className="space-y-4 sm:space-y-6">
              <SettingsCard>
                <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                      <Settings2 className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold text-brand-navy">
                        Workspace Preferences
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                        Customize how the lecturer portal
                        feels and behaves.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-6 sm:py-5">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-brand-navy sm:h-11 sm:w-11">
                        <Smartphone className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-brand-navy">
                          Compact Workspace
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Use a more compact layout for dense
                          academic information.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={compactMode}
                      onClick={() =>
                        setCompactMode(
                          (value) => !value,
                        )
                      }
                      className={[
                        "relative h-7 w-12 shrink-0 self-end rounded-full transition sm:self-center",
                        compactMode
                          ? "bg-brand-navy"
                          : "bg-slate-200",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition",
                          compactMode
                            ? "left-6"
                            : "left-1",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                </div>
              </SettingsCard>

              {/* Account overview */}

              <SettingsCard>
                <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                  <h2 className="font-bold text-brand-navy">
                    Account Overview
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                    Read-only information about your ITMT
                    account.
                  </p>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6">
                  <div className="min-w-0 rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Account ID
                    </p>

                    <p className="mt-2 break-all font-mono text-[11px] leading-5 text-slate-600 sm:text-xs">
                      {profile?.id || "—"}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Last Updated
                    </p>

                    <p className="mt-2 text-sm font-semibold text-brand-navy">
                      {formatDate(
                        profile?.updatedAt,
                      )}
                    </p>
                  </div>
                </div>
              </SettingsCard>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-emerald-800">
                      Lecturer workspace is active
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      Your account is connected to the ITMT
                      academic management system and can
                      access the lecturer workspace according
                      to your assigned permissions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}