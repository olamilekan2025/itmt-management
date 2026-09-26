"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import {
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Laptop,
  LockKeyhole,
  Mail,
  Megaphone,
  Moon,
  Palette,
  Save,
  Settings,
  ShieldCheck,
  Smartphone,
  Sun,
  UserRound,
  WalletCards,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { apiGet, apiPatch } from "@/lib/api";

type Appearance = "system" | "light" | "dark";

interface StudentSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
    matricNumber?: string | null;
    studentId?: string | null;
    programme?: string | null;
    department?: string | null;
  };
}

interface SettingRowProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

interface AppearanceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function getInitials(name?: string | null) {
  if (!name) return "ST";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getFirstName(name?: string | null) {
  if (!name) return "Student";
  return name.trim().split(/\s+/)[0] || "Student";
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: SettingRowProps) {
  return (
    <div className="group flex flex-col gap-4 border-b border-slate-100 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-brand-navy transition-colors group-hover:border-brand-gold/30 group-hover:bg-brand-gold/10">
          <Icon className="h-[18px] w-[18px]" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">{title}</p>

          <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0 sm:pl-6">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={[
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:ring-offset-2",
        checked
          ? "bg-brand-navy shadow-[0_4px_12px_rgba(27,40,71,0.18)]"
          : "bg-slate-200",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "absolute h-5 w-5 rounded-full bg-white shadow-md",
          "transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white shadow-sm">
        <Icon className="h-[18px] w-[18px]" />
      </div>

      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">
            {eyebrow}
          </p>
        )}

        <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  onToggle,
  disabled = false,
}: PasswordInputProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="••••••••"
          disabled={disabled}
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-11 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-300 hover:border-slate-300 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/5 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-navy disabled:cursor-not-allowed"
        >
          {visible ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
    </div>
  );
}

function AppearanceCard({
  icon: Icon,
  title,
  description,
  active,
  onClick,
  disabled = false,
}: AppearanceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200",
        active
          ? "border-brand-navy bg-brand-navy/[0.035] shadow-sm ring-1 ring-brand-navy"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-gold/50 hover:shadow-md",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      {active && (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-white shadow-sm">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}

      <div
        className={[
          "mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-all",
          active
            ? "bg-brand-navy text-white shadow-sm"
            : "bg-slate-100 text-slate-600 group-hover:bg-brand-gold/10 group-hover:text-brand-navy",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-sm font-bold text-slate-900">{title}</p>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </button>
  );
}

function LoadingPreferenceRows() {
  return (
    <div className="space-y-1">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex items-center justify-between border-b border-slate-100 py-5 last:border-b-0"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

            <div className="space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
            </div>
          </div>

          <div className="h-7 w-12 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function StudentSettingsPage() {
  const { data: session, status: sessionStatus } = useSession();

  const studentSession = session as StudentSession | null;
  const student = studentSession?.user;

  const studentName = student?.name || "Student";
  const firstName = getFirstName(student?.name);
  const studentEmail = student?.email || "student@itmt.edu.ng";
  const matricNumber =
    student?.matricNumber || student?.studentId || "Not available";

  const programme = student?.programme || "Student Programme";
  const department = student?.department || "Academic Department";

  const accessToken = session?.accessToken as string | undefined;

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [academicUpdates, setAcademicUpdates] = useState(true);
  const [announcements, setAnnouncements] = useState(true);
  const [paymentNotifications, setPaymentNotifications] = useState(true);

  const [appearance, setAppearance] =
    useState<Appearance>("system");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(false);

  const initials = useMemo(
    () => getInitials(studentName),
    [studentName],
  );

  const passwordMismatch =
    Boolean(newPassword) &&
    Boolean(confirmPassword) &&
    newPassword !== confirmPassword;

  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;

    let strength = 0;

    if (newPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;

    return strength;
  }, [newPassword]);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!accessToken) return;

      setLoadingPreferences(true);

      try {
        const response = (await apiGet(
          "/api/users/me",
          accessToken,
        )) as {
          success: boolean;
          user?: {
            notificationPreferences?: {
              emailNotifications?: boolean;
              academicUpdates?: boolean;
              announcements?: boolean;
              paymentNotifications?: boolean;
            };
            appearancePreferences?: {
              theme?: Appearance;
            };
          };
        };

        if (response.success && response.user) {
          const user = response.user;

          if (user.notificationPreferences) {
            setEmailNotifications(
              user.notificationPreferences.emailNotifications ?? true,
            );

            setAcademicUpdates(
              user.notificationPreferences.academicUpdates ?? true,
            );

            setAnnouncements(
              user.notificationPreferences.announcements ?? true,
            );

            setPaymentNotifications(
              user.notificationPreferences.paymentNotifications ?? true,
            );
          }

          if (user.appearancePreferences?.theme) {
            setAppearance(user.appearancePreferences.theme);
          }
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      } finally {
        setLoadingPreferences(false);
      }
    };

    loadPreferences();
  }, [accessToken]);

  const handleSavePreferences = async () => {
    if (!accessToken) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    setSaving(true);

    try {
      const response = (await apiPatch(
        "/api/users/me/preferences",
        {
          notificationPreferences: {
            emailNotifications,
            academicUpdates,
            announcements,
            paymentNotifications,
          },
          appearancePreferences: {
            theme: appearance,
          },
        },
        accessToken,
      )) as {
        success: boolean;
        message?: string;
      };

      if (response.success) {
        toast.success("Preferences saved successfully");
      } else {
        toast.error(
          response.message || "Failed to save preferences",
        );
      }
    } catch (error) {
      console.error("Save preferences error:", error);
      toast.error(
        "Failed to save preferences. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!accessToken) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSaving(true);

    try {
      const response = (await apiPatch(
        "/api/users/me/password",
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        accessToken,
      )) as {
        success: boolean;
        message?: string;
      };

      if (response.success) {
        toast.success("Password updated successfully");

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(
          response.message || "Failed to update password",
        );
      }
    } catch (error) {
      console.error("Password change error:", error);

      toast.error(
        "Failed to update password. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="min-h-full bg-[#f7f8fb]">
      {/* =========================================================
          TOP HEADER
      ========================================================== */}
     <header className="border-b border-white/10 bg-brand-navy  rounded-2xl text-white">
  <div className="mx-auto max-w-[1540px] px-4 py-5 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2.5 flex items-center gap-2 text-xs font-medium">
          <Link
            href="/dashboards/student"
            className="text-white/55 transition-colors hover:text-brand-gold"
          >
            Student Portal
          </Link>

          <ChevronRight className="h-3.5 w-3.5 text-white/25" />

          <span className="font-semibold text-brand-gold">
            Settings
          </span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Account Settings
        </h1>

        <p className="mt-1.5 max-w-2xl text-sm leading-5 text-white/60">
          Personalize your student portal, manage notifications,
          and keep your account secure.
        </p>
      </div>

      <Link
        href="/dashboards/student"
        className="group inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-white shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-brand-gold/40 hover:bg-white/15 hover:text-brand-gold hover:shadow-lg"
      >
        <ChevronRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
        Back to Dashboard
      </Link>
    </div>
  </div>
</header>

      {/* =========================================================
          PAGE CONTENT
      ========================================================== */}
      <div className="mx-auto max-w-[1540px] px-0 py-5 sm:px-0 sm:py-7 lg:px-0 lg:py-8">
        <div className="grid gap-6 xl:grid-cols-[245px_minmax(0,1fr)]">
          {/* =====================================================
              SETTINGS NAVIGATION
          ====================================================== */}
          <aside className="h-fit xl:sticky xl:top-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              {/* Mini profile */}
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  {student?.image ? (
                    <img
                      src={student.image}
                      alt={studentName}
                      className="h-11 w-11 rounded-xl object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-sm font-black text-brand-gold shadow-sm">
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {studentName}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {matricNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-2">
                <p className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Manage
                </p>

                <nav className="flex gap-1 overflow-x-auto xl:block xl:overflow-visible">
                  <button
                    type="button"
                    onClick={() => scrollToSection("account")}
                    className="group flex shrink-0 items-center gap-3 rounded-xl bg-brand-navy px-3 py-2.5 text-left text-sm font-bold text-white shadow-sm transition-all"
                  >
                    <UserRound className="h-4 w-4" />
                    <span>Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("notifications")}
                    className="group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-brand-navy"
                  >
                    <Bell className="h-4 w-4 text-slate-400 group-hover:text-brand-navy" />
                    <span>Notifications</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("security")}
                    className="group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-brand-navy"
                  >
                    <ShieldCheck className="h-4 w-4 text-slate-400 group-hover:text-brand-navy" />
                    <span>Security</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("appearance")}
                    className="group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-brand-navy"
                  >
                    <Palette className="h-4 w-4 text-slate-400 group-hover:text-brand-navy" />
                    <span>Appearance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("help")}
                    className="group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-brand-navy"
                  >
                    <CircleHelp className="h-4 w-4 text-slate-400 group-hover:text-brand-navy" />
                    <span>Help & Support</span>
                  </button>
                </nav>
              </div>

              {/* Account status */}
              <div className="border-t border-slate-100 p-4">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>

                    <span className="text-xs font-bold text-emerald-700">
                      Account Active
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] leading-4 text-emerald-700/70">
                    Your student portal account is currently active.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* =====================================================
              MAIN SETTINGS CONTENT
          ====================================================== */}
          <div className="min-w-0 space-y-6">
            {/* ===================================================
                PROFILE HERO
            ==================================================== */}
            <section
              id="account"
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]"
            >
              {/* Banner */}
              <div className="relative h-32 overflow-hidden bg-brand-navy sm:h-36 lg:h-40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(200,169,81,0.22),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.10),transparent_25%)]" />

                <div className="absolute -right-12 -top-28 h-72 w-72 rounded-full border-[42px] border-brand-gold/10" />

                <div className="absolute -bottom-44 left-1/3 h-72 w-72 rounded-full border-[50px] border-white/[0.04]" />

                <div className="absolute bottom-0 left-0 h-px w-full bg-white/10" />

                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 backdrop-blur-md sm:left-7">
                  <GraduationCap className="h-3.5 w-3.5 text-brand-gold" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/75">
                    Student Account
                  </span>
                </div>
              </div>

              {/* Profile */}
              <div className="relative px-5 pb-6 sm:px-7 lg:px-8">
                <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="shrink-0">
                      {student?.image ? (
                        <img
                          src={student.image}
                          alt={studentName}
                          className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-[0_8px_25px_rgba(15,23,42,0.18)] sm:h-28 sm:w-28"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-brand-gold to-[#e0c878] text-2xl font-black text-brand-navy shadow-[0_8px_25px_rgba(15,23,42,0.18)] sm:h-28 sm:w-28 sm:text-3xl">
                          {initials}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                          {studentName}
                        </h2>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {matricNumber}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>{programme}</span>

                        {department !== "Academic Department" && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span>{department}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/dashboards/student/profile"
                    className="group inline-flex w-fit items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#243456] hover:shadow-lg"
                  >
                    <UserRound className="h-4 w-4" />
                    Edit Profile
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </section>

            {/* ===================================================
                ACCOUNT INFORMATION
            ==================================================== */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-7 lg:p-8">
              <SectionHeader
                icon={UserRound}
                eyebrow="Account"
                title="Account Information"
                description="A quick overview of the information connected to your student account."
              />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard
                  icon={UserRound}
                  label="Full Name"
                  value={studentName}
                />

                <InfoCard
                  icon={Mail}
                  label="Email Address"
                  value={studentEmail}
                  breakValue
                />

                <InfoCard
                  icon={GraduationCap}
                  label="Matriculation"
                  value={matricNumber}
                />

                <InfoCard
                  icon={WalletCards}
                  label="Account Role"
                  value={student?.role || "Student"}
                  capitalize
                />
              </div>
            </section>

            {/* ===================================================
                NOTIFICATIONS
            ==================================================== */}
            <section
              id="notifications"
              className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-7 lg:p-8"
            >
              <SectionHeader
                icon={Bell}
                eyebrow="Notifications"
                title="Notification Preferences"
                description="Choose which updates you would like to receive from the ITMT student portal."
              />

              {loadingPreferences ? (
                <LoadingPreferenceRows />
              ) : (
                <div>
                  <SettingRow
                    icon={Mail}
                    title="Email notifications"
                    description="Receive important student portal notifications directly through your email."
                  >
                    <Toggle
                      checked={emailNotifications}
                      onChange={() =>
                        setEmailNotifications((current) => !current)
                      }
                      label="Email notifications"
                      disabled={loadingPreferences}
                    />
                  </SettingRow>

                  <SettingRow
                    icon={GraduationCap}
                    title="Academic updates"
                    description="Get notified about results, course registration, academic progress and related activities."
                  >
                    <Toggle
                      checked={academicUpdates}
                      onChange={() =>
                        setAcademicUpdates((current) => !current)
                      }
                      label="Academic updates"
                      disabled={loadingPreferences}
                    />
                  </SettingRow>

                  <SettingRow
                    icon={Megaphone}
                    title="Announcements"
                    description="Receive school announcements and important institutional updates."
                  >
                    <Toggle
                      checked={announcements}
                      onChange={() =>
                        setAnnouncements((current) => !current)
                      }
                      label="Announcements"
                      disabled={loadingPreferences}
                    />
                  </SettingRow>

                  <SettingRow
                    icon={WalletCards}
                    title="Payment notifications"
                    description="Stay informed about payments, receipts, outstanding balances and finance updates."
                  >
                    <Toggle
                      checked={paymentNotifications}
                      onChange={() =>
                        setPaymentNotifications((current) => !current)
                      }
                      label="Payment notifications"
                      disabled={loadingPreferences}
                    />
                  </SettingRow>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-brand-gold/20 bg-brand-gold/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-navy shadow-sm">
                    <Save className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Save your notification preferences
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Your choices are saved to your student account.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={saving || loadingPreferences}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#243456] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* ===================================================
                SECURITY
            ==================================================== */}
            <section
              id="security"
              className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-7 lg:p-8"
            >
              <SectionHeader
                icon={ShieldCheck}
                eyebrow="Security"
                title="Account Security"
                description="Protect your student account by keeping your password strong and private."
              />

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
                <div className="border-b border-slate-200 bg-white p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white shadow-sm">
                      <KeyRound className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900">
                        Change your password
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        Choose a password that is unique to your ITMT student
                        account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <PasswordInput
                      label="Current password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      visible={showCurrentPassword}
                      onToggle={() =>
                        setShowCurrentPassword((current) => !current)
                      }
                      disabled={saving}
                    />

                    <PasswordInput
                      label="New password"
                      value={newPassword}
                      onChange={setNewPassword}
                      visible={showNewPassword}
                      onToggle={() =>
                        setShowNewPassword((current) => !current)
                      }
                      disabled={saving}
                    />

                    <PasswordInput
                      label="Confirm password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      visible={showConfirmPassword}
                      onToggle={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      disabled={saving}
                    />
                  </div>

                  {/* Password strength */}
                  {newPassword && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-slate-600">
                          Password strength
                        </span>

                        <span
                          className={[
                            "text-xs font-bold",
                            passwordStrength <= 1
                              ? "text-red-500"
                              : passwordStrength === 2
                                ? "text-amber-600"
                                : passwordStrength === 3
                                  ? "text-blue-600"
                                  : "text-emerald-600",
                          ].join(" ")}
                        >
                          {passwordStrength <= 1
                            ? "Weak"
                            : passwordStrength === 2
                              ? "Fair"
                              : passwordStrength === 3
                                ? "Good"
                                : "Strong"}
                        </span>
                      </div>

                      <div className="mt-2 flex gap-1.5">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={[
                              "h-1.5 flex-1 rounded-full transition-colors",
                              passwordStrength >= level
                                ? "bg-brand-navy"
                                : "bg-slate-200",
                            ].join(" ")}
                          />
                        ))}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
                        <span
                          className={
                            newPassword.length >= 8
                              ? "font-semibold text-emerald-600"
                              : ""
                          }
                        >
                          8+ characters
                        </span>

                        <span
                          className={
                            /[A-Z]/.test(newPassword)
                              ? "font-semibold text-emerald-600"
                              : ""
                          }
                        >
                          Uppercase
                        </span>

                        <span
                          className={
                            /[0-9]/.test(newPassword)
                              ? "font-semibold text-emerald-600"
                              : ""
                          }
                        >
                          Number
                        </span>

                        <span
                          className={
                            /[^A-Za-z0-9]/.test(newPassword)
                              ? "font-semibold text-emerald-600"
                              : ""
                          }
                        >
                          Special character
                        </span>
                      </div>
                    </div>
                  )}

                  {passwordMismatch && (
                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                      Your new password and confirmation password do not
                      match.
                    </div>
                  )}

                  <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                      <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy" />

                      <span>
                        For security, your new password should contain at least
                        8 characters.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      disabled={
                        saving ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword ||
                        passwordMismatch
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#243456] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
            </section>

            {/* ===================================================
                APPEARANCE
            ==================================================== */}
            <section
              id="appearance"
              className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-7 lg:p-8"
            >
              <SectionHeader
                icon={Palette}
                eyebrow="Personalization"
                title="Appearance"
                description="Choose the interface preference you want to use across your student portal."
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <AppearanceCard
                  icon={Laptop}
                  title="System"
                  description="Automatically follow your device's appearance preference."
                  active={appearance === "system"}
                  onClick={() => setAppearance("system")}
                  disabled={loadingPreferences}
                />

                <AppearanceCard
                  icon={Sun}
                  title="Light"
                  description="Use the clean light student portal interface."
                  active={appearance === "light"}
                  onClick={() => setAppearance("light")}
                  disabled={loadingPreferences}
                />

                <AppearanceCard
                  icon={Moon}
                  title="Dark"
                  description="Use a darker interface when supported."
                  active={appearance === "dark"}
                  onClick={() => setAppearance("dark")}
                  disabled={loadingPreferences}
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-navy shadow-sm">
                    <Palette className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Current preference
                    </p>

                    <p className="text-xs capitalize text-slate-500">
                      {appearance} theme
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={saving || loadingPreferences}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-brand-gold/40 hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Appearance"}
                </button>
              </div>
            </section>

            {/* ===================================================
                PORTAL PREFERENCES
            ==================================================== */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-7 lg:p-8">
              <SectionHeader
                icon={Settings}
                eyebrow="Portal"
                title="Portal Preferences"
                description="Information about how the student portal adapts to your device."
              />

              <SettingRow
                icon={Smartphone}
                title="Responsive student portal"
                description="The portal automatically adapts its layout for phones, tablets and desktop screens."
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  Automatic
                </span>
              </SettingRow>

              <SettingRow
                icon={Save}
                title="Preference synchronization"
                description="Your notification and appearance choices are synchronized with your student account."
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-brand-navy/[0.04] px-3 py-1.5 text-xs font-bold text-brand-navy">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Account synced
                </span>
              </SettingRow>
            </section>

            {/* ===================================================
                HELP
            ==================================================== */}
            <section
              id="help"
              className="scroll-mt-6 relative overflow-hidden rounded-3xl bg-brand-navy shadow-[0_12px_40px_rgba(27,40,71,0.16)]"
            >
              <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full border-[45px] border-brand-gold/10" />

              <div className="absolute -bottom-36 left-1/3 h-72 w-72 rounded-full border-[50px] border-white/[0.035]" />

              <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gold text-brand-navy shadow-lg">
                    <CircleHelp className="h-5.5 w-5.5" />
                  </div>

                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-brand-gold">
                      Student Support
                    </p>

                    <h2 className="text-xl font-black tracking-tight text-white">
                      Need help with your account?
                    </h2>

                    <p className="mt-1.5 max-w-xl text-sm leading-6 text-white/65">
                      If you have questions about your account, academic
                      information or student portal access, contact your
                      appropriate school administrator.
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboards/student"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-navy shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-gold hover:shadow-lg sm:w-fit"
                >
                  Return to Portal
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </section>

            {/* Footer spacing */}
            <div className="pb-4 text-center">
              <p className="text-[11px] font-medium text-slate-400">
                ITMT Student Portal · Account Settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  breakValue = false,
  capitalize = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  breakValue?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:border-brand-gold/30 hover:bg-white hover:shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-navy shadow-sm">
          <Icon className="h-4 w-4" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
      </div>

      <p
        className={[
          "text-sm font-bold text-slate-800",
          breakValue ? "break-all" : "",
          capitalize ? "capitalize" : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}