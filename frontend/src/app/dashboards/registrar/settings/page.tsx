"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  EyeOff,
  Globe2,
  GraduationCap,
  KeyRound,
  LayoutGrid,
  Loader2,
  LockKeyhole,
  Save,
  Settings2,
  ShieldCheck,
  Smartphone,
  User,
  XCircle,
} from "lucide-react";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { apiPatch } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Preferences {
  compactMode: boolean;
  emailNotifications: boolean;
  securityAlerts: boolean;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type PasswordVisibility = {
  current: boolean;
  new: boolean;
  confirm: boolean;
};

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_PREFERENCES: Preferences = {
  compactMode: false,
  emailNotifications: true,
  securityAlerts: true,
};

const INITIAL_PASSWORD_FORM: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

/* =========================================================
   PAGE
========================================================= */

export default function RegistrarSettingsPage() {
  const { data: session, status } = useSession();

  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);

  const [saved, setSaved] = useState(false);

  /* =======================================================
     PASSWORD STATE
  ======================================================= */

  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(INITIAL_PASSWORD_FORM);

  const [passwordVisibility, setPasswordVisibility] =
    useState<PasswordVisibility>({
      current: false,
      new: false,
      confirm: false,
    });

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  /* =======================================================
     LOAD LOCAL PREFERENCES
  ======================================================= */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        "itmt-registrar-preferences",
      );

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);

      setPreferences({
        ...DEFAULT_PREFERENCES,
        compactMode: Boolean(parsed?.compactMode),
        emailNotifications:
          parsed?.emailNotifications ?? DEFAULT_PREFERENCES.emailNotifications,
        securityAlerts:
          parsed?.securityAlerts ?? DEFAULT_PREFERENCES.securityAlerts,
      });
    } catch (error) {
      console.error(
        "Unable to load registrar preferences:",
        error,
      );
    }
  }, []);

  /* =======================================================
     UPDATE PREFERENCE
  ======================================================= */

  function updatePreference<
    K extends keyof Preferences,
  >(
    key: K,
    value: Preferences[K],
  ) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  }

  /* =======================================================
     SAVE PREFERENCES
  ======================================================= */

  function savePreferences() {
    try {
      localStorage.setItem(
        "itmt-registrar-preferences",
        JSON.stringify(preferences),
      );

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Unable to save registrar preferences:",
        error,
      );
    }
  }

  /* =======================================================
     PASSWORD INPUT
  ======================================================= */

  function updatePasswordField(
    field: keyof PasswordForm,
    value: string,
  ) {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  }

  /* =======================================================
     PASSWORD VISIBILITY
  ======================================================= */

  function togglePasswordVisibility(
    field: keyof PasswordVisibility,
  ) {
    setPasswordVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  /* =======================================================
     PASSWORD STRENGTH
  ======================================================= */

  const passwordStrength = useMemo(() => {
    const password = passwordForm.newPassword;

    if (!password) {
      return {
        score: 0,
        label: "Enter a new password",
      };
    }

    let score = 0;

    if (password.length >= 8) {
      score += 1;
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    }

    if (/\d/.test(password)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }

    if (score <= 2) {
      return {
        score,
        label: "Weak password",
      };
    }

    if (score === 3 || score === 4) {
      return {
        score,
        label: "Good password",
      };
    }

    return {
      score,
      label: "Strong password",
    };
  }, [passwordForm.newPassword]);

  /* =======================================================
     PASSWORD VALIDATION
  ======================================================= */

  function validatePassword(): string | null {
    if (status !== "authenticated") {
      return "Your session has expired. Please sign in again.";
    }

    if (!session?.accessToken) {
      return "Authentication token is unavailable. Please sign in again.";
    }

    if (!passwordForm.currentPassword) {
      return "Please enter your current password.";
    }

    if (!passwordForm.newPassword) {
      return "Please enter a new password.";
    }

    if (passwordForm.newPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      return "Your new password must be different from your current password.";
    }

    if (!passwordForm.confirmPassword) {
      return "Please confirm your new password.";
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      return "New password and confirmation do not match.";
    }

    return null;
  }

  /* =======================================================
     CHANGE PASSWORD
  ======================================================= */

  async function handleChangePassword(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    const validationError =
      validatePassword();

    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    if (!session?.accessToken) {
      setPasswordError(
        "Authentication token is unavailable. Please sign in again.",
      );
      return;
    }

    setChangingPassword(true);

    try {
      /*
       * Backend route:
       * PATCH /api/users/me/password
       *
       * The authenticated user's identity comes from
       * the backend JWT. We do not send a user ID.
       */
      await apiPatch(
        "/users/me/password",
        {
          currentPassword:
            passwordForm.currentPassword,
          newPassword:
            passwordForm.newPassword,
        },
        session.accessToken,
      );

      setPasswordSuccess(
        "Your password has been changed successfully.",
      );

      setPasswordForm(
        INITIAL_PASSWORD_FORM,
      );
    } catch (error) {
      console.error(
        "Change registrar password error:",
        error,
      );

      let message =
        "Unable to change your password. Please try again.";

      if (error instanceof Error) {
        if (error.message.trim()) {
          message = error.message;
        }
      }

      setPasswordError(message);
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="min-h-full bg-[#F6F8FB]">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 py-4 sm:py-6 lg:py-8">

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="
            relative overflow-hidden
            rounded-2xl
            bg-brand-navy
            px-5 py-5
            shadow-lg shadow-brand-navy/10
            sm:px-6 sm:py-6
          "
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand-blue/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 h-48 w-48 rounded-full bg-brand-gold/10 blur-3xl" />

          <div
            className="
              pointer-events-none absolute inset-0 opacity-[0.035]
              [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
              [background-size:32px_32px]
            "
          />

          <div className="relative flex items-center gap-4">
            <div
              className="
                flex h-12 w-12 shrink-0 items-center justify-center
                rounded-xl
                border border-white/10
                bg-white/10
                text-brand-gold
                shadow-inner
                backdrop-blur-sm
                sm:h-14 sm:w-14
              "
            >
              <Settings2 className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold sm:text-[11px]">
                  Registrar Portal
                </p>
              </div>

              <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Settings
              </h1>

              <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
                Manage your registrar preferences, notifications and account security.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

          {/* =================================================
              MAIN SETTINGS
          ================================================= */}

          <div className="space-y-6">

            {/* =================================================
                PREFERENCES
            ================================================= */}

            <SettingsCard
              icon={<LayoutGrid className="h-5 w-5" />}
              title="Preferences"
              description="Control dashboard density and the registrar notifications you receive."
            >
              <div className="divide-y divide-slate-100">

                <ToggleRow
                  icon={<LayoutGrid className="h-4 w-4" />}
                  title="Compact dashboard"
                  description="Use tighter spacing for registrar tables, records and dashboard cards."
                  checked={preferences.compactMode}
                  onChange={(value) => updatePreference("compactMode", value)}
                />

                <ToggleRow
                  icon={<Bell className="h-4 w-4" />}
                  title="Email notifications"
                  description="Receive important registrar notifications and system updates by email."
                  checked={preferences.emailNotifications}
                  onChange={(value) => updatePreference("emailNotifications", value)}
                />

                <ToggleRow
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Security alerts"
                  description="Receive alerts about account activity and important security events."
                  checked={preferences.securityAlerts}
                  onChange={(value) => updatePreference("securityAlerts", value)}
                />

              </div>
            </SettingsCard>

            {/* =================================================
                ACCOUNT
            ================================================= */}

            <SettingsCard
              icon={
                <User className="h-5 w-5" />
              }
              title="Account"
              description="Manage your registrar profile, records and account security."
            >
              <div className="space-y-2">

                <SettingsLink
                  href="/dashboards/registrar/profile"
                  icon={
                    <User className="h-4 w-4" />
                  }
                  title="My Profile"
                  description="View and manage your registrar profile information."
                />

                <SettingsLink
                  href="/dashboards/registrar/students"
                  icon={
                    <GraduationCap className="h-4 w-4" />
                  }
                  title="Student Records"
                  description="Access and manage student academic and registration records."
                />

                <SettingsLink
                  href="/dashboards/registrar/audit-logs"
                  icon={
                    <ClipboardList className="h-4 w-4" />
                  }
                  title="Activity Logs"
                  description="Review registrar activities and important account events."
                />

              </div>
            </SettingsCard>

            {/* =================================================
                CHANGE PASSWORD
            ================================================= */}

            <SettingsCard
              icon={
                <KeyRound className="h-5 w-5" />
              }
              title="Change Password"
              description="Update your registrar account password securely."
            >
              <form
                onSubmit={handleChangePassword}
                className="space-y-5"
              >

                {/* Current Password */}

                <PasswordField
                  label="Current password"
                  placeholder="Enter your current password"
                  value={
                    passwordForm.currentPassword
                  }
                  visible={
                    passwordVisibility.current
                  }
                  disabled={changingPassword}
                  autoComplete="current-password"
                  onChange={(value) =>
                    updatePasswordField(
                      "currentPassword",
                      value,
                    )
                  }
                  onToggle={() =>
                    togglePasswordVisibility(
                      "current",
                    )
                  }
                />

                {/* New Password */}

                <div>
                  <PasswordField
                    label="New password"
                    placeholder="Enter your new password"
                    value={
                      passwordForm.newPassword
                    }
                    visible={
                      passwordVisibility.new
                    }
                    disabled={changingPassword}
                    autoComplete="new-password"
                    onChange={(value) =>
                      updatePasswordField(
                        "newPassword",
                        value,
                      )
                    }
                    onToggle={() =>
                      togglePasswordVisibility(
                        "new",
                      )
                    }
                  />

                  {/* Password Strength */}

                  {passwordForm.newPassword && (
                    <div className="mt-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400">
                          Password strength
                        </span>

                        <span
                          className={`text-[11px] font-semibold ${
                            passwordStrength.score <=
                            2
                              ? "text-red-500"
                              : passwordStrength.score <=
                                  4
                                ? "text-amber-500"
                                : "text-emerald-600"
                          }`}
                        >
                          {
                            passwordStrength.label
                          }
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(
                          (level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition ${
                                level <=
                                passwordStrength.score
                                  ? passwordStrength.score <=
                                    2
                                    ? "bg-red-400"
                                    : passwordStrength.score <=
                                        4
                                      ? "bg-amber-400"
                                      : "bg-emerald-500"
                                  : "bg-slate-100"
                              }`}
                            />
                          ),
                        )}
                      </div>

                      <p className="mt-2 text-[11px] leading-5 text-slate-400">
                        Use at least 8 characters
                        with uppercase, lowercase,
                        numbers and symbols for a
                        stronger password.
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}

                <div>
                  <PasswordField
                    label="Confirm new password"
                    placeholder="Re-enter your new password"
                    value={
                      passwordForm.confirmPassword
                    }
                    visible={
                      passwordVisibility.confirm
                    }
                    disabled={changingPassword}
                    autoComplete="new-password"
                    onChange={(value) =>
                      updatePasswordField(
                        "confirmPassword",
                        value,
                      )
                    }
                    onToggle={() =>
                      togglePasswordVisibility(
                        "confirm",
                      )
                    }
                  />

                  {passwordForm.confirmPassword &&
                    passwordForm.newPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        {passwordForm.newPassword ===
                        passwordForm.confirmPassword ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-[11px] font-medium text-emerald-600">
                              Passwords match
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-[11px] font-medium text-red-500">
                              Passwords do not match
                            </span>
                          </>
                        )}
                      </div>
                    )}
                </div>

                {/* Error */}

                {passwordError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3.5">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                    <p className="text-xs leading-5 text-red-600">
                      {passwordError}
                    </p>
                  </div>
                )}

                {/* Success */}

                {passwordSuccess && (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                    <p className="text-xs leading-5 text-emerald-700">
                      {passwordSuccess}
                    </p>
                  </div>
                )}

                {/* Submit */}

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-2.5">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                    <p className="max-w-md text-[11px] leading-5 text-slate-400">
                      Your password is securely
                      processed through the
                      authenticated ITMT account
                      system.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Changing password...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        Change password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </SettingsCard>

            {/* =================================================
                SAVE PREFERENCES
            ================================================= */}

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    saved
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {saved ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {saved
                      ? "Preferences saved"
                      : "Registrar preferences"}
                  </p>

                  <p className="text-xs text-slate-400">
                    These interface preferences are
                    stored on this device.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={savePreferences}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/90"
              >
                <Save className="h-4 w-4" />
                Save preferences
              </button>

            </div>
          </div>

          {/* =================================================
              SIDE PANEL
          ================================================= */}

          <aside className="space-y-6">

            {/* =================================================
                ACCOUNT SECURITY (merged Security + Password Security)
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-brand-navy">
                      Account Security
                    </h2>

                    <p className="text-xs text-slate-400">
                      Access, authentication &amp; sessions
                    </p>
                  </div>

                </div>
              </div>

              <div className="space-y-4 p-5">

                <InfoRow
                  label="Access level"
                  value="Registrar"
                />

                <InfoRow
                  label="Authentication"
                  value="Protected"
                />

                <InfoRow
                  label="Activity logging"
                  value="Enabled"
                />

                <InfoRow
                  label="Session"
                  value={
                    status === "authenticated"
                      ? "Authenticated"
                      : status === "loading"
                        ? "Checking..."
                        : "Expired"
                  }
                />

                <div className="rounded-xl bg-slate-50 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold" />
                    <p className="text-[11px] leading-5 text-slate-500">
                      Your password is protected by the ITMT authentication
                      system and never stored in plain text.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* =================================================
                SYSTEM & ACCESS (merged Registrar Access + System)
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
                    <Globe2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-brand-navy">
                      System &amp; Access
                    </h2>

                    <p className="text-xs text-slate-400">
                      Portal permissions &amp; environment
                    </p>
                  </div>

                </div>
              </div>

              <div className="space-y-4 p-5">

                <InfoRow
                  label="Portal"
                  value="Registrar"
                />

                <InfoRow
                  label="Student records"
                  value="Authorized"
                />

                <InfoRow
                  label="Academic records"
                  value="Authorized"
                />

                <InfoRow
                  label="System settings"
                  value="Restricted"
                />

                <div className="border-t border-slate-100 pt-4">
                  <div className="space-y-4">
                    <InfoRow
                      label="Environment"
                      value={
                        process.env.NODE_ENV === "production"
                          ? "Production"
                          : "Development"
                      }
                    />

                    <InfoRow
                      label="Platform"
                      value="Web"
                    />

                    <InfoRow
                      label="Currency"
                      value="NGN"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* =================================================
                RESPONSIVE
            ================================================= */}

            <div className="rounded-2xl border border-brand-navy/10 bg-brand-navy p-5 text-white shadow-lg shadow-brand-navy/10">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Smartphone className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Responsive by design
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/60">
                    Registrar settings are optimized
                    for desktop, tablet and mobile
                    screens.
                  </p>
                </div>

              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SETTINGS CARD
========================================================= */

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-navy to-brand-navy/30" />

      <div className="border-b border-slate-100 p-5 sm:p-6">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
            {icon}
          </div>

          <div>
            <h2 className="font-semibold text-brand-navy">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {description}
            </p>
          </div>

        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   PASSWORD FIELD
========================================================= */

function PasswordField({
  label,
  placeholder,
  value,
  visible,
  disabled,
  autoComplete,
  onChange,
  onToggle,
}: {
  label: string;
  placeholder: string;
  value: string;
  visible: boolean;
  disabled: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          type={visible ? "text" : "password"}
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-brand-navy/30 focus:ring-2 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
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
   TOGGLE ROW
========================================================= */

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">

      <div className="flex min-w-0 items-start gap-3">

        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-sm font-semibold text-slate-700">
            {title}
          </p>

          <p className="mt-0.5 max-w-xl text-xs leading-5 text-slate-400">
            {description}
          </p>

        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() =>
          onChange(!checked)
        }
        className={`
          relative h-6 w-11 shrink-0 rounded-full transition
          ${
            checked
              ? "bg-brand-navy"
              : "bg-slate-200"
          }
        `}
      >
        <span
          className={`
            absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition
            ${
              checked
                ? "left-6"
                : "left-1"
            }
          `}
        />
      </button>
    </div>
  );
}

/* =========================================================
   SETTINGS LINK
========================================================= */

function SettingsLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-slate-200 hover:bg-slate-50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-brand-navy/[0.06] group-hover:text-brand-navy">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-slate-400">
          {description}
        </p>

      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-navy" />
    </Link>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="text-right text-xs font-semibold text-slate-600">
        {value}
      </span>

    </div>
  );
}