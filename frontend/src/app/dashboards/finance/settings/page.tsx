"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type FormEvent,
} from "react";

import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Palette,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

/* =========================================================
   TYPES
========================================================= */

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;

  matricNumber?: string;

  level?: string;

  programme?: {
    _id?: string;
    name?: string;
    code?: string;
  } | null;

  academicSession?: {
    _id?: string;
    name?: string;
  } | null;
};

/* =========================================================
   API URL
========================================================= */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

/* =========================================================
   PAGE
========================================================= */

export default function FinanceSettingsPage() {
  const { data: session, status } = useSession();

  const accessToken =
    typeof (session as { accessToken?: unknown } | null)
      ?.accessToken === "string"
      ? (session as { accessToken: string }).accessToken
      : undefined;

  /* =======================================================
     STATE
  ======================================================= */

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

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

  /* =======================================================
     PROFILE CHANGES
  ======================================================= */

  const hasProfileChanges = useMemo(() => {
    if (!user) return false;

    return (
      name.trim() !== user.name.trim() ||
      email.trim().toLowerCase() !==
        user.email.trim().toLowerCase()
    );
  }, [user, name, email]);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  const loadProfile = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    if (!API_URL) {
      toast.error("API configuration is missing", {
        description:
          "Please check NEXT_PUBLIC_API_URL.",
      });

      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/users/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getResponseMessage(
            data,
            "Unable to load your profile.",
          ),
        );
      }

      const profile =
        data.user as UserProfile | undefined;

      if (!profile) {
        throw new Error(
          "Profile information was not returned by the server.",
        );
      }

      setUser(profile);
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
    } catch (error) {
      console.error(
        "Load finance profile error:",
        error,
      );

      toast.error("Unable to load profile", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      void loadProfile();
    }

    if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, loadProfile]);

  /* =======================================================
     UPDATE PROFILE
  ======================================================= */

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail =
      email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      toast.error("Invalid name", {
        description:
          "Your name must be at least 2 characters.",
      });

      return;
    }

    if (!trimmedEmail) {
      toast.error("Email required", {
        description:
          "Please enter your email address.",
      });

      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast.error("Invalid email address", {
        description:
          "Please enter a valid email address.",
      });

      return;
    }

    if (!accessToken) {
      toast.error("Session expired", {
        description:
          "Please sign in again to continue.",
      });

      return;
    }

    if (!API_URL) {
      toast.error("API configuration is missing", {
        description:
          "Please check NEXT_PUBLIC_API_URL.",
      });

      return;
    }

    setProfileSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/users/me`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
          }),
        },
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getResponseMessage(
            data,
            "Unable to update your profile.",
          ),
        );
      }

      if (data.user) {
        const updatedUser =
          data.user as UserProfile;

        setUser(updatedUser);
        setName(updatedUser.name ?? "");
        setEmail(updatedUser.email ?? "");
      } else {
        setName(trimmedName);
        setEmail(trimmedEmail);
      }

      toast.success("Profile updated", {
        description:
          getResponseMessage(
            data,
            "Your account information has been updated successfully.",
          ),
      });
    } catch (error) {
      console.error(
        "Update finance profile error:",
        error,
      );

      toast.error("Profile update failed", {
        description:
          error instanceof Error
            ? error.message
            : "Unable to update your profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  }

  /* =======================================================
     CHANGE PASSWORD
  ======================================================= */

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!currentPassword) {
      toast.error("Current password required", {
        description:
          "Enter your current password.",
      });

      return;
    }

    if (!newPassword) {
      toast.error("New password required", {
        description:
          "Enter a new password.",
      });

      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password too short", {
        description:
          "Your new password must be at least 8 characters.",
      });

      return;
    }

    if (newPassword.length > 100) {
      toast.error("Password too long", {
        description:
          "Your new password cannot exceed 100 characters.",
      });

      return;
    }

    if (newPassword === currentPassword) {
      toast.error("Choose a different password", {
        description:
          "Your new password must be different from your current password.",
      });

      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        description:
          "Make sure both new password fields are identical.",
      });

      return;
    }

    if (!accessToken) {
      toast.error("Session expired", {
        description:
          "Please sign in again to continue.",
      });

      return;
    }

    if (!API_URL) {
      toast.error("API configuration is missing", {
        description:
          "Please check NEXT_PUBLIC_API_URL.",
      });

      return;
    }

    setPasswordSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/users/me/password`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        },
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getResponseMessage(
            data,
            "Unable to change your password.",
          ),
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      toast.success("Password updated", {
        description:
          getResponseMessage(
            data,
            "Your password has been changed successfully.",
          ),
      });
    } catch (error) {
      console.error(
        "Change finance password error:",
        error,
      );

      toast.error("Password update failed", {
        description:
          error instanceof Error
            ? error.message
            : "Unable to change your password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  }

  /* =======================================================
     AUTHENTICATION LOADING
  ======================================================= */

  if (status === "loading") {
    return <LoadingState />;
  }

  /* =======================================================
     UNAUTHENTICATED
  ======================================================= */

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <Card className="w-full max-w-xl overflow-hidden rounded-3xl border-slate-200 shadow-xl">
          <div className="h-1.5 bg-brand-gold" />

          <CardContent className="p-8 text-center sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-xl font-bold tracking-tight text-brand-navy">
              Session required
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your session is no longer available. Please sign in again to
              access finance settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =======================================================
     PAGE LOADING
  ======================================================= */

  if (loading) {
    return <LoadingState />;
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="min-h-full">
      {/* =================================================
          PAGE HERO
      ================================================= */}

      <section className="relative mb-6 overflow-hidden rounded-3xl bg-brand-navy shadow-lg">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative px-6 py-7 sm:px-8 sm:py-8 lg:px-10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-white/5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold sm:text-[11px]">
                  Account settings
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Finance Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Manage your personal information, account security and
                dashboard preferences from one place.
              </p>
            </div>

            {user && (
              <div className="flex w-full max-w-sm items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm xl:w-auto">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gold text-sm font-extrabold text-brand-navy shadow-lg">
                  {getInitials(user.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {user.name}
                  </p>

                  <p className="mt-0.5 text-xs capitalize text-slate-400">
                    {formatRole(user.role)}
                  </p>
                </div>

                <div className="hidden h-8 w-px bg-white/10 sm:block" />

                <div className="hidden sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        user.isActive && !user.isSuspended
                          ? "bg-emerald-400"
                          : "bg-red-400"
                      }`}
                    />

                    <span className="text-xs font-medium text-slate-300">
                      {user.isSuspended
                        ? "Suspended"
                        : user.isActive
                          ? "Active"
                          : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-1 bg-brand-gold" />
      </section>

      {/* =================================================
          PROFILE + ACCOUNT
      ================================================= */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        {/* PERSONAL INFORMATION */}

        <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <PremiumCardHeader
            icon={User}
            title="Personal information"
            description="Update the personal details associated with your account."
          />

          <CardContent className="p-5 sm:p-7">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* NAME */}

              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Full name
                </Label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 transition focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
                    placeholder="Enter your full name"
                    disabled={profileSaving}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Email address
                </Label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 transition focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
                    placeholder="Enter your email"
                    disabled={profileSaving}
                    autoComplete="email"
                  />
                </div>

                {user && !user.isEmailVerified && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                    <p className="text-xs font-medium leading-5 text-amber-700">
                      Your email address is currently unverified.
                    </p>
                  </div>
                )}
              </div>

              {/* ACCOUNT INFO */}

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoBox label="Account role" value={formatRole(user?.role)} />

                <InfoBox
                  label="Account status"
                  value={
                    user?.isSuspended
                      ? "Suspended"
                      : user?.isActive
                        ? "Active"
                        : "Inactive"
                  }
                  badge
                  badgeVariant={
                    user?.isSuspended
                      ? "destructive"
                      : user?.isActive
                        ? "default"
                        : "secondary"
                  }
                />
              </div>

              {/* SAVE */}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  {hasProfileChanges
                    ? "You have unsaved changes."
                    : "Your profile is up to date."}
                </p>

                <Button
                  type="submit"
                  disabled={profileSaving || !hasProfileChanges}
                  className="h-11 w-full rounded-xl bg-brand-navy px-5 font-semibold text-white shadow-sm transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {profileSaving ? (
                    <>
                      <Spinner />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ACCOUNT OVERVIEW */}

        <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <PremiumCardHeader
            icon={ShieldCheck}
            title="Account overview"
            description="Current status and verification information."
          />

          <CardContent className="p-5 sm:p-7">
            <div className="space-y-3">
              <AccountRow
                label="Account status"
                value={
                  user?.isSuspended
                    ? "Suspended"
                    : user?.isActive
                      ? "Active"
                      : "Inactive"
                }
                icon={
                  user?.isActive && !user?.isSuspended
                    ? CheckCircle2
                    : AlertCircle
                }
                positive={Boolean(
                  user?.isActive && !user?.isSuspended,
                )}
              />

              <AccountRow
                label="Email verification"
                value={user?.isEmailVerified ? "Verified" : "Not verified"}
                icon={
                  user?.isEmailVerified ? CheckCircle2 : AlertCircle
                }
                positive={Boolean(user?.isEmailVerified)}
              />

              <AccountRow
                label="Account role"
                value={formatRole(user?.role)}
                icon={ShieldCheck}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.03] p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-bold text-brand-navy">
                    Finance access
                  </p>

                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    Your finance role determines the areas of the dashboard
                    and financial records available to your account.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =================================================
          SECURITY
      ================================================= */}

      <Card className="mt-6 overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <PremiumCardHeader
          icon={LockKeyhole}
          title="Password & security"
          description="Keep your finance account secure by using a strong and unique password."
        />

        <CardContent className="p-5 sm:p-7">
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-3">
              <PasswordField
                id="currentPassword"
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword((value) => !value)
                }
                disabled={passwordSaving}
              />

              <PasswordField
                id="newPassword"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNewPassword}
                onToggle={() => setShowNewPassword((value) => !value)}
                disabled={passwordSaving}
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword((value) => !value)
                }
                disabled={passwordSaving}
              />
            </div>

            {/* REQUIREMENTS */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                  <KeyRound className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand-navy">
                    Password requirements
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Requirement text="At least 8 characters" />
                    <Requirement text="Maximum 100 characters" />
                    <Requirement text="Different from your current password" />
                    <Requirement text="Passwords must match" />
                  </div>
                </div>
              </div>
            </div>

            {/* BUTTON */}

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <Button
                type="submit"
                disabled={passwordSaving}
                className="h-11 w-full rounded-xl bg-brand-navy px-5 font-semibold text-white shadow-sm transition hover:bg-brand-navy/90 sm:w-auto"
              >
                {passwordSaving ? (
                  <>
                    <Spinner />
                    Updating...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* =================================================
          NOTIFICATIONS
      ================================================= */}

      <Card className="mt-6 overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <PremiumCardHeader
          icon={Bell}
          title="Notifications"
          description="Stay informed about important finance and account activity."
        />

        <CardContent className="p-5 sm:p-7">
          <div className="grid gap-4 md:grid-cols-3">
            <PreferenceCard
              icon={Bell}
              title="Announcements"
              description="Important announcements from ITMT."
            />

            <PreferenceCard
              icon={Mail}
              title="Email alerts"
              description="Receive important account updates."
            />

            <PreferenceCard
              icon={ShieldCheck}
              title="Security alerts"
              description="Stay informed about account security."
            />
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

            <p className="text-xs leading-5 text-amber-800">
              Notification preferences are currently informational.
              Persistent preference controls can be connected to the user
              account later.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* =================================================
          APPEARANCE
      ================================================= */}

      <Card className="mt-6 overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <PremiumCardHeader
          icon={Palette}
          title="Appearance"
          description="Configure the visual experience of your finance dashboard."
        />

        <CardContent className="p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-navy shadow-sm">
                <Palette className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-brand-navy">
                  Dashboard theme
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Finance dashboard currently uses the ITMT light theme.
                </p>
              </div>
            </div>

            <Badge variant="secondary" className="w-fit rounded-lg px-3 py-1.5">
              Light
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="h-8" />
    </div>
  );
}

/* =========================================================
   PREMIUM CARD HEADER
========================================================= */

function PremiumCardHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <CardHeader className="relative overflow-hidden border-b border-white/10 bg-brand-navy px-5 py-5 sm:px-7">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-brand-gold/10 blur-2xl" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-gold ring-1 ring-white/10">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <CardTitle className="text-base font-bold text-white sm:text-lg">
            {title}
          </CardTitle>

          <CardDescription className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
            {description}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="flex flex-col items-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-lg">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-brand-gold" />
        </div>

        <p className="mt-4 text-sm font-semibold text-brand-navy">
          Loading settings...
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Preparing your finance account
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SPINNER
========================================================= */

function Spinner() {
  return (
    <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

/* =========================================================
   PASSWORD FIELD
========================================================= */

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </Label>

      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 pr-11 transition focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
          autoComplete={
            id === "currentPassword" ? "current-password" : "new-password"
          }
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
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
   REQUIREMENT
========================================================= */

function Requirement({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />

      <span>{text}</span>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
  badge = false,
  badgeVariant = "secondary",
}: {
  label: string;
  value: string;
  badge?: boolean;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <div className="mt-2">
        {badge ? (
          <Badge variant={badgeVariant} className="rounded-lg">
            {value}
          </Badge>
        ) : (
          <p className="text-sm font-bold text-brand-navy">{value}</p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ACCOUNT ROW
========================================================= */

function AccountRow({
  label,
  value,
  icon: Icon,
  positive = false,
}: {
  label: string;
  value: string;
  icon: ElementType;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200 hover:bg-white">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <span className="text-sm text-slate-600">{label}</span>
      </div>

      <span
        className={`text-right text-sm font-bold ${
          positive ? "text-emerald-600" : "text-brand-navy"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   PREFERENCE CARD
========================================================= */

function PreferenceCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy/20 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-brand-gold transition-transform duration-200 group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-bold text-brand-navy">{title}</h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>

      <Badge variant="secondary" className="mt-4 rounded-lg">
        Default
      </Badge>
    </div>
  );
}

/* =========================================================
   API RESPONSE
========================================================= */

async function parseResponse(
  response: Response,
): Promise<Record<string, unknown>> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as Record<string, unknown>;
  }

  const text = await response.text();

  return {
    message: text || undefined,
  };
}

/* =========================================================
   RESPONSE MESSAGE
========================================================= */

function getResponseMessage(
  data: Record<string, unknown>,
  fallback: string,
) {
  if (typeof data.message === "string") {
    return data.message;
  }

  if (typeof data.error === "string") {
    return data.error;
  }

  return fallback;
}

/* =========================================================
   EMAIL VALIDATION
========================================================= */

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(name?: string) {
  if (!name?.trim()) {
    return "F";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/* =========================================================
   FORMAT ROLE
========================================================= */

function formatRole(role?: string) {
  if (!role) {
    return "Finance";
  }

  return role
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}