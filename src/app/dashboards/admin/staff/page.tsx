"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Loader2,
  PauseCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  AlertTriangle,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { apiGet, apiPatch } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type StaffRole =
  | "admin"
  | "registrar"
  | "finance"
  | "lecturer";

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

type StaffListResponse = {
  success?: boolean;
  users?: Staff[];
  staff?: Staff[];
  data?: Staff[];
  message?: string;
};

type StaffAction =
  | "activate"
  | "deactivate"
  | "suspend"
  | "unsuspend";

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

function getStaffStatus(member: Staff) {
  if (member.isSuspended) {
    return "suspended";
  }

  if (!member.isActive) {
    return "inactive";
  }

  return "active";
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminStaffPage() {
  const { data: session, status } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  const currentUserId =
    typeof session?.user?.id === "string"
      ? session.user.id
      : undefined;

  const [staff, setStaff] = useState<Staff[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [actionLoadingId, setActionLoadingId] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState<"all" | StaffRole>("all");

  const [statusFilter, setStatusFilter] =
    useState<
      "all" | "active" | "inactive" | "suspended"
    >("all");

  /* =========================================================
     MODAL STATE
  ========================================================= */

  const [confirmDialogOpen, setConfirmDialogOpen] =
    useState(false);

  const [selectedStaff, setSelectedStaff] =
    useState<Staff | null>(null);

  const [selectedAction, setSelectedAction] =
    useState<StaffAction | null>(null);

  /* =========================================================
     LOAD STAFF
  ========================================================= */

  const loadStaff = useCallback(
    async (isRefresh = false) => {
      if (!accessToken) {
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await apiGet<StaffListResponse>(
            "/users/staff",
            accessToken,
          );

        if (response?.success === false) {
          throw new Error(
            response.message ||
              "Unable to load staff.",
          );
        }

        const users =
          response.users ??
          response.staff ??
          response.data ??
          [];

        setStaff(
          Array.isArray(users)
            ? users
            : [],
        );
      } catch (error) {
        console.error(
          "Load staff error:",
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load staff.",
        );

        setStaff([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    if (!accessToken) {
      setLoading(false);
      return;
    }

    void loadStaff();
  }, [
    status,
    accessToken,
    loadStaff,
  ]);

  /* =========================================================
     OPEN CONFIRMATION MODAL
  ========================================================= */

  const openConfirmDialog = useCallback(
    (
      member: Staff,
      action: StaffAction,
    ) => {
      if (!accessToken) {
        toast.error(
          "Authentication token is missing.",
        );
        return;
      }

      if (currentUserId === member._id) {
        toast.error(
          "You cannot change your own administrator account status.",
        );
        return;
      }

      setSelectedStaff(member);
      setSelectedAction(action);
      setConfirmDialogOpen(true);
    },
    [
      accessToken,
      currentUserId,
    ],
  );

  /* =========================================================
     CLOSE CONFIRMATION MODAL
  ========================================================= */

  const closeConfirmDialog = useCallback(() => {
    if (actionLoadingId) {
      return;
    }

    setConfirmDialogOpen(false);
    setSelectedStaff(null);
    setSelectedAction(null);
  }, [actionLoadingId]);

  /* =========================================================
     CONFIRM STAFF STATUS ACTION
  ========================================================= */

  const confirmStaffStatusChange =
    useCallback(async () => {
      if (
        !accessToken ||
        !selectedStaff ||
        !selectedAction
      ) {
        return;
      }

      const member = selectedStaff;
      const action = selectedAction;

      const actionMessages: Record<
        StaffAction,
        {
          success: string;
        }
      > = {
        activate: {
          success:
            "Staff account activated successfully.",
        },

        deactivate: {
          success:
            "Staff account deactivated successfully.",
        },

        suspend: {
          success:
            "Staff account suspended successfully.",
        },

        unsuspend: {
          success:
            "Staff account unsuspended and activated successfully.",
        },
      };

      try {
        setActionLoadingId(member._id);

        await apiPatch(
          `/users/staff/${member._id}/${action}`,
          {},
          accessToken,
        );

        toast.success(
          actionMessages[action].success,
        );

        setConfirmDialogOpen(false);
        setSelectedStaff(null);
        setSelectedAction(null);

        await loadStaff(true);
      } catch (error) {
        console.error(
          `Staff ${action} error:`,
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : `Unable to ${action} staff account.`,
        );
      } finally {
        setActionLoadingId(null);
      }
    }, [
      accessToken,
      selectedStaff,
      selectedAction,
      loadStaff,
    ]);

  /* =========================================================
     MODAL CONTENT
  ========================================================= */

  const confirmationContent = useMemo(() => {
    if (!selectedStaff || !selectedAction) {
      return null;
    }

    const content: Record<
      StaffAction,
      {
        title: string;
        description: string;
        confirmLabel: string;
        confirmClass: string;
        iconClass: string;
      }
    > = {
      activate: {
        title: "Activate Staff Account",
        description: `Are you sure you want to activate ${selectedStaff.name}'s account? This will restore their access to the staff portal.`,
        confirmLabel: "Activate Account",
        confirmClass:
          "bg-emerald-600 text-white hover:bg-emerald-700",
        iconClass:
          "bg-emerald-50 text-emerald-600",
      },

      deactivate: {
        title: "Deactivate Staff Account",
        description: `Are you sure you want to deactivate ${selectedStaff.name}'s account? They will no longer be able to access the staff portal.`,
        confirmLabel: "Deactivate Account",
        confirmClass:
          "bg-slate-700 text-white hover:bg-slate-800",
        iconClass:
          "bg-slate-100 text-slate-600",
      },

      suspend: {
        title: "Suspend Staff Account",
        description: `Are you sure you want to suspend ${selectedStaff.name}'s account? Their portal access will be blocked until the account is unsuspended.`,
        confirmLabel: "Suspend Account",
        confirmClass:
          "bg-red-600 text-white hover:bg-red-700",
        iconClass:
          "bg-red-50 text-red-600",
      },

      unsuspend: {
        title: "Unsuspend Staff Account",
        description: `Are you sure you want to unsuspend ${selectedStaff.name}'s account? Their account will be restored to active status.`,
        confirmLabel: "Unsuspend Account",
        confirmClass:
          "bg-emerald-600 text-white hover:bg-emerald-700",
        iconClass:
          "bg-emerald-50 text-emerald-600",
      },
    };

    return content[selectedAction];
  }, [
    selectedStaff,
    selectedAction,
  ]);

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredStaff = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return staff.filter((member) => {
      const roleLabel =
        roleLabels[member.role] ??
        member.role;

      const memberStatus =
        getStaffStatus(member);

      const matchesSearch =
        !query ||
        member.name
          .toLowerCase()
          .includes(query) ||
        member.email
          .toLowerCase()
          .includes(query) ||
        roleLabel
          .toLowerCase()
          .includes(query);

      const matchesRole =
        roleFilter === "all" ||
        member.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        memberStatus === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    staff,
    search,
    roleFilter,
    statusFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const activeStaff = staff.filter(
    (member) =>
      member.isActive &&
      !member.isSuspended,
  ).length;

  const inactiveStaff = staff.filter(
    (member) =>
      !member.isActive &&
      !member.isSuspended,
  ).length;

  const suspendedStaff = staff.filter(
    (member) =>
      member.isSuspended,
  ).length;

  const lecturerCount = staff.filter(
    (member) =>
      member.role === "lecturer",
  ).length;

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    status === "loading" ||
    (status === "authenticated" && loading)
  ) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <p className="text-sm text-slate-500">
            Loading staff directory...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     AUTHENTICATION ERROR
  ========================================================= */

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-10 text-center">
            <ShieldCheck className="h-10 w-10 text-red-500" />

            <h2 className="mt-4 text-lg font-semibold">
              Authentication required
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please sign in again to access
              staff management.
            </p>

            <Link
              href="/auth/login"
              className="mt-6"
            >
              <Button className="rounded-xl bg-brand-navy">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

          <div className="relative flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1.5">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-brand-gold" />

                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Staff Management
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Staff
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-[15px]">
                Manage administrators,
                registrars, finance officers,
                lecturers, and other
                institutional staff from one
                central directory.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/60">

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {activeStaff} active
                </div>

                <div className="h-3 w-px bg-white/20" />

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  {inactiveStaff} inactive
                </div>

                <div className="h-3 w-px bg-white/20" />

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  {suspendedStaff} suspended
                </div>

                <div className="h-3 w-px bg-white/20" />

                <span>
                  {staff.length} total staff
                </span>

              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void loadStaff(true)
                }
                disabled={refreshing}
                className="h-11 rounded-xl border-white/20 bg-white/10 px-4 text-white hover:bg-white/15 hover:text-white"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </Button>

              <Link
                href="/dashboards/admin/staff/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 text-sm font-semibold text-brand-dark shadow-sm transition hover:-translate-y-0.5 hover:brightness-105"
              >
                <Plus className="h-4 w-4" />
                Add Staff
              </Link>

            </div>
          </div>
        </section>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Total Staff
                  </p>

                  <p className="mt-2 text-2xl font-bold text-brand-dark">
                    {staff.length}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    All staff accounts
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/10">
                  <Users className="h-5 w-5 text-brand-navy" />
                </div>

              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Active
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {activeStaff}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    With portal access
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                </div>

              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Inactive
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-500">
                    {inactiveStaff}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Access disabled
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <UserX className="h-5 w-5 text-slate-500" />
                </div>

              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Suspended
                  </p>

                  <p className="mt-2 text-2xl font-bold text-red-600">
                    {suspendedStaff}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Temporarily restricted
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                  <PauseCircle className="h-5 w-5 text-red-600" />
                </div>

              </div>
            </CardContent>
          </Card>

        </div>

        {/* =====================================================
            DIRECTORY
        ===================================================== */}

        <Card className="overflow-hidden border-slate-200 shadow-sm">

          <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div>
                <CardTitle className="text-base font-semibold text-brand-dark">
                  Staff Directory
                </CardTitle>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredStaff.length} staff member
                  {filteredStaff.length === 1
                    ? ""
                    : "s"}{" "}
                  found
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search staff..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 sm:w-64"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(
                      event.target.value as
                        | "all"
                        | StaffRole,
                    )
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy"
                >
                  <option value="all">
                    All Roles
                  </option>

                  <option value="admin">
                    Administrator
                  </option>

                  <option value="registrar">
                    Registrar
                  </option>

                  <option value="finance">
                    Finance Officer
                  </option>

                  <option value="lecturer">
                    Lecturer
                  </option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "all"
                        | "active"
                        | "inactive"
                        | "suspended",
                    )
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy"
                >
                  <option value="all">
                    All Status
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                  <option value="suspended">
                    Suspended
                  </option>
                </select>

              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">

            {filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/10">
                  <BriefcaseBusiness className="h-7 w-7 text-brand-navy" />
                </div>

                <h3 className="mt-5 text-sm font-semibold text-brand-dark">
                  No staff found
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                  {search ||
                  roleFilter !== "all" ||
                  statusFilter !== "all"
                    ? "Try changing your search or filter settings."
                    : "No staff accounts have been created yet."}
                </p>

                {!search &&
                  roleFilter === "all" &&
                  statusFilter === "all" && (
                    <Link
                      href="/dashboards/admin/staff/new"
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-semibold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add Staff
                    </Link>
                  )}

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px]">

                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">

                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Staff Member
                      </th>

                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Role
                      </th>

                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Email
                      </th>

                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredStaff.map(
                      (member) => {
                        const memberStatus =
                          getStaffStatus(member);

                        const isActionLoading =
                          actionLoadingId ===
                          member._id;

                        const isCurrentAdmin =
                          currentUserId ===
                          member._id;

                        return (
                          <tr
                            key={member._id}
                            className="transition-colors hover:bg-slate-50/70"
                          >

                            {/* STAFF */}

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 text-xs font-bold text-brand-navy">
                                  {getInitials(
                                    member.name,
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-brand-dark">
                                    {member.name}
                                  </p>

                                  <p className="truncate text-xs text-slate-500">
                                    Staff account
                                  </p>
                                </div>

                              </div>
                            </td>

                            {/* ROLE */}

                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">

                                <ShieldCheck className="h-3.5 w-3.5 text-brand-navy" />

                                <span className="text-[11px] font-semibold text-slate-700">
                                  {roleLabels[
                                    member.role
                                  ] ??
                                    member.role}
                                </span>

                              </span>
                            </td>

                            {/* EMAIL */}

                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-600">
                                {member.email}
                              </span>
                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-4">

                              {memberStatus ===
                                "active" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Active
                                </span>
                              )}

                              {memberStatus ===
                                "inactive" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                  Inactive
                                </span>
                              )}

                              {memberStatus ===
                                "suspended" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                  Suspended
                                </span>
                              )}

                            </td>

                            {/* ACTIONS */}

                            <td className="px-6 py-4">

                              <div className="flex items-center justify-end gap-2">

                                <Link
                                  href={`/dashboards/admin/staff/${member._id}`}
                                  className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-navy transition hover:bg-brand-navy/5 hover:text-brand-gold"
                                >
                                  View
                                </Link>

                                {/* ACTIVE */}

                                {!isCurrentAdmin &&
                                  memberStatus ===
                                    "active" && (
                                    <>
                                      <button
                                        type="button"
                                        disabled={
                                          isActionLoading
                                        }
                                        onClick={() =>
                                          openConfirmDialog(
                                            member,
                                            "suspend",
                                          )
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {isActionLoading ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <PauseCircle className="h-3.5 w-3.5" />
                                        )}

                                        Suspend
                                      </button>

                                      <button
                                        type="button"
                                        disabled={
                                          isActionLoading
                                        }
                                        onClick={() =>
                                          openConfirmDialog(
                                            member,
                                            "deactivate",
                                          )
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {isActionLoading ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <UserX className="h-3.5 w-3.5" />
                                        )}

                                        Deactivate
                                      </button>
                                    </>
                                  )}

                                {/* INACTIVE */}

                                {!isCurrentAdmin &&
                                  memberStatus ===
                                    "inactive" && (
                                    <>
                                      <button
                                        type="button"
                                        disabled={
                                          isActionLoading
                                        }
                                        onClick={() =>
                                          openConfirmDialog(
                                            member,
                                            "activate",
                                          )
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {isActionLoading ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                        )}

                                        Activate
                                      </button>

                                      <button
                                        type="button"
                                        disabled={
                                          isActionLoading
                                        }
                                        onClick={() =>
                                          openConfirmDialog(
                                            member,
                                            "suspend",
                                          )
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {isActionLoading ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <PauseCircle className="h-3.5 w-3.5" />
                                        )}

                                        Suspend
                                      </button>
                                    </>
                                  )}

                                {/* SUSPENDED */}

                                {!isCurrentAdmin &&
                                  memberStatus ===
                                    "suspended" && (
                                    <button
                                      type="button"
                                      disabled={
                                        isActionLoading
                                      }
                                      onClick={() =>
                                        openConfirmDialog(
                                          member,
                                          "unsuspend",
                                        )
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {isActionLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <UserCheck className="h-3.5 w-3.5" />
                                      )}

                                      Unsuspend
                                    </button>
                                  )}

                                {isCurrentAdmin && (
                                  <span className="text-[11px] font-medium text-slate-400">
                                    Current account
                                  </span>
                                )}

                              </div>
                            </td>

                          </tr>
                        );
                      },
                    )}

                  </tbody>
                </table>
              </div>
            )}

          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          CONFIRMATION MODAL
      ===================================================== */}

      <Dialog
        open={confirmDialogOpen}
        onOpenChange={(open) => {
          if (!open && !actionLoadingId) {
            closeConfirmDialog();
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-2xl border-slate-200 p-0 sm:max-w-md">

          <DialogHeader className="border-b border-slate-100 px-6 py-5">

            <div className="flex items-start gap-4">

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  confirmationContent?.iconClass ??
                  "bg-slate-100 text-slate-600"
                }`}
              >
                {selectedAction ===
                  "suspend" ||
                selectedAction ===
                  "deactivate" ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold text-brand-dark">
                  {confirmationContent?.title}
                </DialogTitle>

                <DialogDescription className="mt-2 text-sm leading-6 text-slate-500">
                  {confirmationContent?.description}
                </DialogDescription>
              </div>

            </div>

          </DialogHeader>

          {selectedStaff && (
            <div className="mx-6 mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 text-xs font-bold text-brand-navy">
                  {getInitials(
                    selectedStaff.name,
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-dark">
                    {selectedStaff.name}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {selectedStaff.email}
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    {roleLabels[
                      selectedStaff.role
                    ] ?? selectedStaff.role}
                  </p>
                </div>

              </div>
            </div>
          )}

          <DialogFooter className="border-t border-slate-100 px-6 py-4 sm:justify-end">

            <Button
              type="button"
              variant="outline"
              onClick={closeConfirmDialog}
              disabled={
                Boolean(actionLoadingId)
              }
              className="rounded-xl"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={() =>
                void confirmStaffStatusChange()
              }
              disabled={
                Boolean(actionLoadingId) ||
                !selectedStaff ||
                !selectedAction
              }
              className={`rounded-xl ${
                confirmationContent?.confirmClass ??
                "bg-brand-navy text-white"
              }`}
            >
              {actionLoadingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmationContent?.confirmLabel ??
                "Confirm"
              )}
            </Button>

          </DialogFooter>

        </DialogContent>
      </Dialog>
    </>
  );
}