"use client";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  PauseCircle,
  ShieldCheck,
  User,
  UserRoundX,
} from "lucide-react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type StaffRole =
  | "admin"
  | "registrar"
  | "finance"
  | "lecturer";

type StaffStatus =
  | "active"
  | "inactive"
  | "suspended";

type Staff = {
  _id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type StaffDetailsResponse = {
  success?: boolean;
  user?: Staff;
  staff?: Staff;
  data?: Staff;
  message?: string;
};

/* =========================================================
   ROLE LABELS
========================================================= */

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  registrar: "Registrar",
  finance: "Finance Officer",
  lecturer: "Lecturer",
};

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST"
  );
}

function getStaffStatus(staff: Staff): StaffStatus {
  if (staff.isSuspended) {
    return "suspended";
  }

  if (!staff.isActive) {
    return "inactive";
  }

  return "active";
}

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminStaffDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const {
    data: session,
    status,
  } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  /* =========================================================
     STAFF ID
  ========================================================= */

  const staffId = useMemo(() => {
    const value = params?.id;

    if (Array.isArray(value)) {
      return value[0] ?? "";
    }

    return typeof value === "string"
      ? value
      : "";
  }, [params]);

  /* =========================================================
     STATE
  ========================================================= */

  const [staff, setStaff] =
    useState<Staff | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* =========================================================
     LOAD STAFF
  ========================================================= */

  const loadStaff = useCallback(async () => {
    if (!staffId) {
      setLoading(false);
      setErrorMessage("Invalid staff ID.");
      return;
    }

    if (!accessToken) {
      setLoading(false);
      setErrorMessage(
        "Authentication token is missing.",
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const response =
        await apiGet<StaffDetailsResponse>(
          `/users/staff/${encodeURIComponent(
            staffId,
          )}`,
          accessToken,
        );

      const user =
        response?.user ??
        response?.staff ??
        response?.data;

      if (!user) {
        throw new Error(
          response?.message ||
            "Staff member was not found.",
        );
      }

      const staffRoles: StaffRole[] = [
        "admin",
        "registrar",
        "finance",
        "lecturer",
      ];

      if (!staffRoles.includes(user.role)) {
        throw new Error(
          "The requested account is not a staff account.",
        );
      }

      setStaff(user);
    } catch (error) {
      console.error(
        "Load staff details error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to load staff member.";

      setStaff(null);
      setErrorMessage(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, staffId]);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      setLoading(false);
      setErrorMessage(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    if (
      status === "authenticated" &&
      !accessToken
    ) {
      setLoading(false);
      setErrorMessage(
        "Authentication token is missing.",
      );
      return;
    }

    if (
      status === "authenticated" &&
      accessToken &&
      staffId
    ) {
      void loadStaff();
      return;
    }

    if (
      status === "authenticated" &&
      !staffId
    ) {
      setLoading(false);
      setErrorMessage("Invalid staff ID.");
    }
  }, [
    status,
    accessToken,
    staffId,
    loadStaff,
  ]);

  /* =========================================================
     SESSION LOADING
  ========================================================= */

  if (status === "loading") {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <p className="text-sm text-slate-500">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     AUTH ERROR
  ========================================================= */

  if (
    status === "unauthenticated" ||
    !accessToken
  ) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center px-6">
        <Card className="w-full border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <ShieldCheck className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="mt-5 text-lg font-semibold text-brand-dark">
              Authentication required
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {errorMessage ||
                "Your session is no longer available."}
            </p>

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                onClick={() =>
                  router.push("/auth/login")
                }
                className="rounded-xl bg-brand-navy"
              >
                Sign In
              </Button>

              <Link href="/dashboards/admin/staff">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Staff
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <p className="text-sm text-slate-500">
            Loading staff details...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!staff) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center px-6">
        <Card className="w-full border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <UserRoundX className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="mt-5 text-lg font-semibold text-brand-dark">
              Staff member not found
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {errorMessage ||
                "The staff account could not be found."}
            </p>

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                onClick={() =>
                  void loadStaff()
                }
                className="rounded-xl bg-brand-navy"
              >
                Try Again
              </Button>

              <Link href="/dashboards/admin/staff">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Staff
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =========================================================
     DERIVED STATUS
  ========================================================= */

  const roleLabel =
    roleLabels[staff.role] ??
    staff.role;

  const staffStatus =
    getStaffStatus(staff);

  const statusConfig = {
    active: {
      label: "Active",
      description:
        "Account is active and has portal access.",
      badgeClass:
        "bg-emerald-400/15 text-emerald-300",
      dotClass: "bg-emerald-400",
      icon: (
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      ),
      iconClass: "bg-emerald-50",
      textClass: "text-emerald-600",
    },

    inactive: {
      label: "Inactive",
      description:
        "Account access is currently disabled.",
      badgeClass:
        "bg-white/10 text-white/60",
      dotClass: "bg-white/40",
      icon: (
        <UserRoundX className="h-5 w-5 text-slate-500" />
      ),
      iconClass: "bg-slate-100",
      textClass: "text-slate-500",
    },

    suspended: {
      label: "Suspended",
      description:
        "Account has been temporarily restricted.",
      badgeClass:
        "bg-red-400/15 text-red-300",
      dotClass: "bg-red-400",
      icon: (
        <PauseCircle className="h-5 w-5 text-red-600" />
      ),
      iconClass: "bg-red-50",
      textClass: "text-red-600",
    },
  } as const;

  const currentStatus =
    statusConfig[staffStatus];

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      {/* BACK */}

      <Link
        href="/dashboards/admin/staff"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Staff
      </Link>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* AVATAR */}

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-gold text-lg font-bold text-brand-dark shadow-lg sm:h-20 sm:w-20 sm:text-xl">
              {getInitials(staff.name)}
            </div>

            {/* INFORMATION */}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {staff.name}
                </h1>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${currentStatus.badgeClass}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${currentStatus.dotClass}`}
                  />

                  {currentStatus.label}
                </span>
              </div>

              <p className="mt-2 text-sm text-white/60">
                {roleLabel}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {staff.email}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  Staff Account
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* ROLE */}

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/10">
                <ShieldCheck className="h-5 w-5 text-brand-navy" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Role
                </p>

                <p className="mt-1 text-sm font-semibold text-brand-dark">
                  {roleLabel}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ACCOUNT STATUS */}

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${currentStatus.iconClass}`}
              >
                {currentStatus.icon}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Account Status
                </p>

                <p
                  className={`mt-1 text-sm font-semibold ${currentStatus.textClass}`}
                >
                  {currentStatus.label}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EMAIL */}

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  staff.isEmailVerified
                    ? "bg-emerald-50"
                    : "bg-amber-50"
                }`}
              >
                <Mail
                  className={`h-5 w-5 ${
                    staff.isEmailVerified
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Email
                </p>

                <p className="mt-1 text-sm font-semibold text-brand-dark">
                  {staff.isEmailVerified
                    ? "Verified"
                    : "Unverified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CREATED */}

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/10">
                <CalendarDays className="h-5 w-5 text-brand-gold" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Created
                </p>

                <p className="mt-1 text-sm font-semibold text-brand-dark">
                  {formatDate(
                    staff.createdAt,
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          DETAILS
      ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ACCOUNT INFORMATION */}

        <Card className="overflow-hidden border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
            <CardTitle className="text-base font-semibold text-brand-dark">
              Account Information
            </CardTitle>

            <p className="mt-1 text-xs text-slate-500">
              Basic information associated with
              this staff account.
            </p>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem
                icon={
                  <User className="h-4 w-4" />
                }
                label="Full Name"
                value={staff.name}
              />

              <InfoItem
                icon={
                  <Mail className="h-4 w-4" />
                }
                label="Email Address"
                value={staff.email}
              />

              <InfoItem
                icon={
                  <ShieldCheck className="h-4 w-4" />
                }
                label="System Role"
                value={roleLabel}
              />

              <InfoItem
                icon={currentStatus.icon}
                label="Account Status"
                value={currentStatus.label}
              />

              <InfoItem
                icon={
                  <Mail className="h-4 w-4" />
                }
                label="Email Verification"
                value={
                  staff.isEmailVerified
                    ? "Verified"
                    : "Unverified"
                }
              />

              <InfoItem
                icon={
                  <CalendarDays className="h-4 w-4" />
                }
                label="Account Created"
                value={formatDate(
                  staff.createdAt,
                )}
              />
            </div>

            {/* STATUS NOTICE */}

            <div
              className={`mt-6 rounded-2xl border p-4 ${
                staffStatus === "active"
                  ? "border-emerald-100 bg-emerald-50/60"
                  : staffStatus === "suspended"
                    ? "border-red-100 bg-red-50/60"
                    : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    currentStatus.iconClass
                  }`}
                >
                  {currentStatus.icon}
                </div>

                <div>
                  <p className="text-sm font-semibold text-brand-dark">
                    {currentStatus.label} account
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {currentStatus.description}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===================================================
            TIMELINE
        =================================================== */}

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5">
            <CardTitle className="text-base font-semibold text-brand-dark">
              Account Timeline
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <div className="space-y-5">
              <TimelineItem
                icon={
                  <CalendarDays className="h-4 w-4 text-brand-navy" />
                }
                iconClass="bg-brand-navy/10"
                title="Account Created"
                value={formatDateTime(
                  staff.createdAt,
                )}
              />

              <TimelineItem
                icon={
                  <Clock3 className="h-4 w-4 text-brand-gold" />
                }
                iconClass="bg-brand-gold/10"
                title="Last Updated"
                value={formatDateTime(
                  staff.updatedAt,
                )}
              />

              <TimelineItem
                icon={currentStatus.icon}
                iconClass={
                  currentStatus.iconClass
                }
                title="Current Status"
                value={currentStatus.description}
              />

              <TimelineItem
                icon={
                  staff.isEmailVerified ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Mail className="h-4 w-4 text-amber-600" />
                  )
                }
                iconClass={
                  staff.isEmailVerified
                    ? "bg-emerald-50"
                    : "bg-amber-50"
                }
                title="Email Verification"
                value={
                  staff.isEmailVerified
                    ? "Email address has been verified."
                    : "Email address has not been verified."
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </div>

      <p className="mt-2 break-all text-sm font-semibold text-brand-dark">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   TIMELINE ITEM
========================================================= */

function TimelineItem({
  icon,
  iconClass,
  title,
  value,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-brand-dark">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {value}
        </p>
      </div>
    </div>
  );
}

