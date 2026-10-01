"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import {
  Activity,
  Ban,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  Filter,
  GraduationCap,
  Hash,
  Layers3,
  Mail,
  MoreHorizontal,
  PauseCircle,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api";

type UserRole =
  | "admin"
  | "registrar"
  | "finance"
  | "lecturer"
  | "student";

type RoleFilter = "all" | UserRole;

type StatusFilter =
  | "all"
  | "active"
  | "inactive"
  | "suspended"
  | "unverified";

interface Programme {
  _id: string;
  name: string;
  code?: string;
}

interface AcademicSession {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;

  phone?: string | null;
  profileImage?: string | null;

  role: UserRole;

  staffNumber?: string | null;
  qualification?: string | null;

  programme?: Programme | string | null;
  academicSession?: AcademicSession | string | null;
  level?: string | null;
  matricNumber?: string | null;

  isActive: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;

  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  users?: T;
  user?: T;
}

interface StaffForm {
  name: string;
  email: string;
  password: string;
  role:
    | "admin"
    | "registrar"
    | "finance"
    | "lecturer";
}

const PAGE_SIZE = 10;

const roleConfig: Record<
  UserRole,
  {
    label: string;
    description: string;
    icon: typeof Users;
    className: string;
  }
> = {
  admin: {
    label: "Administrator",
    description: "System administrator",
    icon: ShieldCheck,
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  },
  registrar: {
    label: "Registrar",
    description: "Academic administration",
    icon: Layers3,
    className:
      "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
  },
  finance: {
    label: "Finance",
    description: "Finance management",
    icon: BriefcaseBusiness,
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  },
  lecturer: {
    label: "Lecturer",
    description: "Teaching staff",
    icon: GraduationCap,
    className:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
  },
  student: {
    label: "Student",
    description: "Student account",
    icon: GraduationCap,
    className:
      "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/20",
  },
};

function getInitials(name?: string) {
  if (!name?.trim()) return "U";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getProgrammeName(
  programme?: Programme | string | null,
) {
  if (!programme) return "Not assigned";

  if (typeof programme === "string") {
    return programme;
  }

  return programme.name || "Not assigned";
}

function getProgrammeCode(
  programme?: Programme | string | null,
) {
  if (!programme || typeof programme === "string") {
    return "";
  }

  return programme.code || "";
}

function getSessionName(
  session?: AcademicSession | string | null,
) {
  if (!session) return "Not assigned";

  if (typeof session === "string") {
    return session;
  }

  return session.name || "Not assigned";
}

function getUserStatus(user: User) {
  if (user.isSuspended) {
    return "suspended";
  }

  if (!user.isActive) {
    return "inactive";
  }

  return "active";
}

function getStatusLabel(user: User) {
  const status = getUserStatus(user);

  if (status === "suspended") return "Suspended";
  if (status === "inactive") return "Inactive";

  return "Active";
}

function getStatusClass(user: User) {
  const status = getUserStatus(user);

  if (status === "suspended") {
    return "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20";
  }

  if (status === "inactive") {
    return "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/20";
  }

  return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20";
}

function isStaff(user: User) {
  return user.role !== "student";
}

function getActionKey(
  userId: string,
  action: string,
) {
  return `${userId}:${action}`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
  iconClassName,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  description: string;
  iconClassName: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900 sm:p-5">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100/70 blur-2xl transition-transform duration-500 group-hover:scale-125 dark:bg-white/5" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {value.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ user }: { user: User }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${getStatusClass(
        user,
      )}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {getStatusLabel(user)}
    </span>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function UserAvatar({
  user,
  large = false,
}: {
  user: User;
  large?: boolean;
}) {
  const sizeClass = large
    ? "h-16 w-16 text-base rounded-2xl"
    : "h-11 w-11 text-xs rounded-xl";

  if (user.profileImage) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden bg-slate-100 shadow-sm ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/10 ${sizeClass}`}
      >
        <img
          src={user.profileImage}
          alt={`${user.name} profile`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div className="absolute inset-0 -z-10 flex items-center justify-center bg-gradient-to-br from-[#1B2847] via-[#25385f] to-[#C8A951] font-bold text-white">
          {getInitials(user.name)}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-[#1B2847] via-[#25385f] to-[#C8A951] font-bold text-white shadow-sm ring-1 ring-white/20 ${sizeClass}`}
    >
      {getInitials(user.name)}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-slate-800" />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3.5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-44 rounded bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/70" />
        <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/70" />
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
      <div className="hidden overflow-x-auto lg:block">
        <div className="min-w-[1250px]">
          <div className="grid grid-cols-[2fr_1.25fr_1fr_1.2fr_1.4fr_1fr_1fr_48px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-3 animate-pulse rounded bg-slate-200 dark:bg-slate-800"
                />
              ),
            )}
          </div>

          {Array.from({ length: 7 }).map(
            (_, row) => (
              <div
                key={row}
                className="grid grid-cols-[2fr_1.25fr_1fr_1.2fr_1.4fr_1fr_1fr_48px] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 dark:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

                  <div className="space-y-2">
                    <div className="h-3.5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-44 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                  </div>
                </div>

                {Array.from({ length: 7 }).map(
                  (_, cell) => (
                    <div
                      key={cell}
                      className="h-7 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800/70"
                    />
                  ),
                )}
              </div>
            ),
          )}
        </div>
      </div>

      <div className="space-y-3 p-3 lg:hidden">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <SkeletonCard key={index} />
          ),
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    session?.accessToken as string | undefined;

  const currentUserEmail =
    typeof session?.user?.email === "string"
      ? session.user.email.toLowerCase()
      : "";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<User | null>(null);

  const [deletingUser, setDeletingUser] =
    useState(false);

  const [createStaffOpen, setCreateStaffOpen] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [staffForm, setStaffForm] =
    useState<StaffForm>({
      name: "",
      email: "",
      password: "",
      role: "lecturer",
    });

  const [creatingStaff, setCreatingStaff] =
    useState(false);

  const loadUsers = useCallback(
    async (silent = false) => {
      if (!accessToken) return;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = (await apiGet(
          "/users",
          accessToken,
        )) as ApiResponse<User[]>;

        const nextUsers = Array.isArray(
          response?.users,
        )
          ? response.users
          : [];

        setUsers(nextUsers);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load users.";

        setError(message);

        if (silent) {
          toast.error(message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      accessToken
    ) {
      void loadUsers();
    }
  }, [
    sessionStatus,
    accessToken,
    loadUsers,
  ]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    document.body.style.overflow =
      detailsOpen ||
      createStaffOpen ||
      !!deleteTarget
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    detailsOpen,
    createStaffOpen,
    deleteTarget,
  ]);

  const stats = useMemo(() => {
    const students = users.filter(
      (user) => user.role === "student",
    ).length;

    const staff = users.length - students;

    const active = users.filter(
      (user) =>
        user.isActive && !user.isSuspended,
    ).length;

    const suspended = users.filter(
      (user) => user.isSuspended,
    ).length;

    const unverified = users.filter(
      (user) => !user.isEmailVerified,
    ).length;

    return {
      total: users.length,
      students,
      staff,
      active,
      suspended,
      unverified,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users
      .filter((user) => {
        if (
          roleFilter !== "all" &&
          user.role !== roleFilter
        ) {
          return false;
        }

        if (statusFilter !== "all") {
          if (
            statusFilter === "unverified" &&
            user.isEmailVerified
          ) {
            return false;
          }

          if (
            statusFilter !== "unverified" &&
            getUserStatus(user) !== statusFilter
          ) {
            return false;
          }
        }

        if (!query) return true;

        const programmeName =
          getProgrammeName(user.programme);

        const programmeCode =
          getProgrammeCode(user.programme);

        const academicSession =
          getSessionName(
            user.academicSession,
          );

        const searchable = [
          user.name,
          user.email,
          user.phone,
          user.role,
          user.staffNumber,
          user.matricNumber,
          user.level,
          user.qualification,
          programmeName,
          programmeCode,
          academicSession,
          roleConfig[user.role].label,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .sort((a, b) =>
        a.name.localeCompare(b.name),
      );
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length / PAGE_SIZE,
    ),
  );

  const paginatedUsers = useMemo(() => {
    const start =
      (page - 1) * PAGE_SIZE;

    return filteredUsers.slice(
      start,
      start + PAGE_SIZE,
    );
  }, [filteredUsers, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const showingFrom =
    filteredUsers.length === 0
      ? 0
      : (page - 1) * PAGE_SIZE + 1;

  const showingTo = Math.min(
    page * PAGE_SIZE,
    filteredUsers.length,
  );

  const openDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    if (actionLoading || deletingUser) {
      return;
    }

    setDetailsOpen(false);
    setSelectedUser(null);
  };

  const openDeleteConfirmation = (
    user: User,
  ) => {
    if (
      currentUserEmail &&
      user.email.toLowerCase() ===
        currentUserEmail
    ) {
      toast.error(
        "You cannot delete your own administrator account.",
      );
      return;
    }

    setDeleteTarget(user);
  };

  const closeDeleteConfirmation = () => {
    if (deletingUser) return;

    setDeleteTarget(null);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    if (!accessToken) {
      toast.error(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    if (
      currentUserEmail &&
      deleteTarget.email.toLowerCase() ===
        currentUserEmail
    ) {
      toast.error(
        "You cannot delete your own administrator account.",
      );
      return;
    }

    setDeletingUser(true);

    try {
      const response =
        (await apiDelete(
          `/users/${deleteTarget._id}`,
          accessToken,
        )) as ApiResponse<{
          id: string;
          name: string;
          email: string;
          role: UserRole;
        }>;

      const deletedId = deleteTarget._id;
      const deletedName =
        response?.user &&
        typeof response.user === "object" &&
        "name" in response.user
          ? String(
              (
                response.user as {
                  name?: string;
                }
              ).name ?? deleteTarget.name,
            )
          : deleteTarget.name;

      setUsers((current) =>
        current.filter(
          (user) => user._id !== deletedId,
        ),
      );

      if (
        selectedUser?._id === deletedId
      ) {
        setSelectedUser(null);
        setDetailsOpen(false);
      }

      setDeleteTarget(null);

      toast.success(
        response?.message ||
          `${deletedName} has been deleted successfully.`,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to delete this user.";

      toast.error(message);
    } finally {
      setDeletingUser(false);
    }
  };

  const handleStatusAction = async (
    user: User,
    action:
      | "activate"
      | "deactivate"
      | "suspend"
      | "unsuspend",
  ) => {
    if (!accessToken) {
      toast.error(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    const key = getActionKey(
      user._id,
      action,
    );

    setActionLoading(key);

    try {
      const prefix =
        user.role === "student"
          ? `/users/${user._id}`
          : `/users/staff/${user._id}`;

      await apiPatch(
        `${prefix}/${action}`,
        {},
        accessToken,
      );

      const messages = {
        activate: `${user.name} has been activated.`,
        deactivate: `${user.name} has been deactivated.`,
        suspend: `${user.name} has been suspended.`,
        unsuspend: `${user.name} has been unsuspended.`,
      };

      toast.success(messages[action]);

      await loadUsers(true);

      setSelectedUser((current) => {
        if (!current) return current;

        if (current._id !== user._id) {
          return current;
        }

        if (action === "activate") {
          return {
            ...current,
            isActive: true,
            isSuspended: false,
          };
        }

        if (action === "deactivate") {
          return {
            ...current,
            isActive: false,
          };
        }

        if (action === "suspend") {
          return {
            ...current,
            isActive: false,
            isSuspended: true,
          };
        }

        return {
          ...current,
          isActive: true,
          isSuspended: false,
        };
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to update user status.";

      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateStaff = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!accessToken) {
      toast.error(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    const name = staffForm.name.trim();
    const email =
      staffForm.email.trim().toLowerCase();
    const password = staffForm.password;

    if (name.length < 2) {
      toast.error(
        "Please enter the staff member's full name.",
      );
      return;
    }

    if (!email || !email.includes("@")) {
      toast.error(
        "Please enter a valid email address.",
      );
      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must be at least 6 characters.",
      );
      return;
    }

    setCreatingStaff(true);

    try {
      await apiPost(
        "/users/staff",
        {
          name,
          email,
          password,
          role: staffForm.role,
        },
        accessToken,
      );

      toast.success(
        "Staff account created successfully.",
      );

      setStaffForm({
        name: "",
        email: "",
        password: "",
        role: "lecturer",
      });

      setShowPassword(false);
      setCreateStaffOpen(false);

      await loadUsers(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to create staff account.";

      toast.error(message);
    } finally {
      setCreatingStaff(false);
    }
  };

  if (
    sessionStatus === "loading" ||
    (loading && users.length === 0)
  ) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-[1680px] space-y-5 px-3 py-4 sm:px-5 lg:px-7 lg:py-6">
          <div className="h-56 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-900" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-2xl bg-white shadow-sm dark:bg-slate-900"
                />
              ),
            )}
          </div>

          <SkeletonTable />
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-full bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-[1680px] space-y-5 px-0 py-4 sm:px-0 lg:px-0 lg:py-6">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-[28px] bg-[#1B2847] shadow-xl shadow-slate-900/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(200,169,81,0.20),transparent_28%),radial-gradient(circle_at_15%_100%,rgba(59,130,246,0.14),transparent_30%)]" />

            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/5 bg-white/[0.02] blur-sm" />

            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full border border-[#C8A951]/10 bg-[#C8A951]/5 blur-3xl" />

            <div className="relative p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
                    <span>Administration</span>
                    <span className="text-slate-500">
                      /
                    </span>
                    <span>People</span>
                    <span className="text-slate-500">
                      /
                    </span>
                    <span className="text-[#E2CA7D]">
                      Users
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner sm:flex">
                      <Users className="h-7 w-7 text-[#E5CB78]" />
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#E2CA7D]">
                        People & Access
                      </p>

                      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                        User Management
                      </h1>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-[15px]">
                        Manage student and staff
                        accounts, monitor account
                        status, and control access
                        across the ITMT Management
                        System.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/dashboards/admin/existing"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Add Existing Student
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      setCreateStaffOpen(true)
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#C8A951] px-4 text-sm font-bold text-[#1B2847] shadow-lg shadow-black/10 transition hover:bg-[#d6b965] active:scale-[0.98]"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create Staff
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Total Users"
              value={stats.total}
              icon={Users}
              description="All registered accounts"
              iconClassName="bg-[#1B2847] text-white"
            />

            <StatCard
              label="Students"
              value={stats.students}
              icon={GraduationCap}
              description="Student accounts"
              iconClassName="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
            />

            <StatCard
              label="Staff"
              value={stats.staff}
              icon={BriefcaseBusiness}
              description="Administrative & academic staff"
              iconClassName="bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
            />

            <StatCard
              label="Active"
              value={stats.active}
              icon={UserCheck}
              description="Currently active accounts"
              iconClassName="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
            />

            <StatCard
              label="Suspended"
              value={stats.suspended}
              icon={ShieldAlert}
              description="Staff accounts suspended"
              iconClassName="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
            />
          </section>

          {/* Search & filters */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search name, email, phone, staff number, matric number..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C8A951] focus:bg-white focus:ring-4 focus:ring-[#C8A951]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/[0.06]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={roleFilter}
                    onChange={(event) =>
                      setRoleFilter(
                        event.target
                          .value as RoleFilter,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 sm:w-44"
                  >
                    <option value="all">
                      All roles
                    </option>
                    <option value="student">
                      Students
                    </option>
                    <option value="admin">
                      Administrators
                    </option>
                    <option value="registrar">
                      Registrars
                    </option>
                    <option value="finance">
                      Finance
                    </option>
                    <option value="lecturer">
                      Lecturers
                    </option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="relative">
                  <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target
                          .value as StatusFilter,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 sm:w-44"
                  >
                    <option value="all">
                      All statuses
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
                    <option value="unverified">
                      Unverified
                    </option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void loadUsers(true)
                  }
                  disabled={refreshing}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.07]"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      refreshing
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-white/5 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" />

                <span>
                  Showing{" "}
                  <strong className="font-semibold text-slate-700 dark:text-slate-200">
                    {showingFrom}
                  </strong>{" "}
                  –{" "}
                  <strong className="font-semibold text-slate-700 dark:text-slate-200">
                    {showingTo}
                  </strong>{" "}
                  of{" "}
                  <strong className="font-semibold text-slate-700 dark:text-slate-200">
                    {filteredUsers.length}
                  </strong>{" "}
                  users
                </span>
              </div>

              {stats.unverified > 0 && (
                <div className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Clock3 className="h-3.5 w-3.5" />

                  {stats.unverified} unverified
                  account
                  {stats.unverified === 1
                    ? ""
                    : "s"}
                </div>
              )}
            </div>
          </section>

          {/* Error */}
          {error && !loading && (
            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                    <CircleAlert className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                      Unable to load users
                    </p>

                    <p className="mt-1 text-xs leading-5 text-rose-700 dark:text-rose-300">
                      {error}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void loadUsers()
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            </section>
          )}

          {/* Users */}
          {!error && loading ? (
            <SkeletonTable />
          ) : filteredUsers.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center dark:border-white/10 dark:bg-slate-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                <Users className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                No users found
              </h2>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                {search ||
                roleFilter !== "all" ||
                statusFilter !== "all"
                  ? "Try changing your search or filters to find the account you are looking for."
                  : "There are no users available yet."}
              </p>

              {(search ||
                roleFilter !== "all" ||
                statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                  }}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1B2847] px-4 text-sm font-semibold text-white transition hover:bg-[#25385f]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear filters
                </button>
              )}
            </section>
          ) : (
            <>
              {/* Desktop table */}
              <section className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900 lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1250px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.025]">
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                          User
                        </th>

                        <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                          Contact
                        </th>

                        <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                          Role
                        </th>

                        <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                          Staff / Matric
                        </th>

                        <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                          Academic
                        </th>

                        <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                          Status
                        </th>

                        <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                          Verification
                        </th>

                        <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                          Joined
                        </th>

                        <th className="w-16 px-4 py-3.5" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {paginatedUsers.map(
                        (user) => (
                          <tr
                            key={user._id}
                            className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.025]"
                          >
                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  openDetails(user)
                                }
                                className="flex w-full min-w-0 items-center gap-3 text-left"
                              >
                                <UserAvatar
                                  user={user}
                                />

                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                                    {user.name}
                                  </span>

                                  <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <Mail className="h-3 w-3 shrink-0" />

                                    <span className="truncate">
                                      {user.email}
                                    </span>
                                  </span>
                                </span>
                              </button>
                            </td>

                            <td className="px-4 py-4">
                              <div className="max-w-[170px]">
                                {user.phone ? (
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                                    <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                                    <span className="truncate">
                                      {user.phone}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    No phone
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <RoleBadge
                                role={user.role}
                              />
                            </td>

                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {user.role ===
                                  "student"
                                    ? user.matricNumber ||
                                      "No matric number"
                                    : user.staffNumber ||
                                      "No staff number"}
                                </p>

                                {user.role !==
                                  "student" &&
                                  user.qualification && (
                                    <p className="max-w-[150px] truncate text-[11px] text-slate-500 dark:text-slate-400">
                                      {
                                        user.qualification
                                      }
                                    </p>
                                  )}
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              {user.role ===
                              "student" ? (
                                <div className="space-y-1">
                                  <p className="max-w-[190px] truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                                    {getProgrammeName(
                                      user.programme,
                                    )}
                                  </p>

                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {user.level ||
                                      "Level not assigned"}
                                  </p>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                  <BriefcaseBusiness className="h-3.5 w-3.5" />

                                  {roleConfig[
                                    user.role
                                  ].description}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <StatusBadge
                                user={user}
                              />
                            </td>

                            <td className="px-4 py-4">
                              {user.isEmailVerified ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                  <Clock3 className="h-4 w-4" />
                                  Pending
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                              {formatDate(
                                user.createdAt,
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  openDetails(user)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                                aria-label={`View ${user.name}`}
                              >
                                <MoreHorizontal className="h-4.5 w-4.5" />
                              </button>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Mobile cards */}
              <section className="space-y-3 lg:hidden">
                {paginatedUsers.map(
                  (user) => (
                    <article
                      key={user._id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-900"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            openDetails(user)
                          }
                          className="shrink-0"
                          aria-label={`View ${user.name}`}
                        >
                          <UserAvatar
                            user={user}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openDetails(user)
                          }
                          className="min-w-0 flex-1 text-left"
                        >
                          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {user.name}
                          </h3>

                          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                          </p>

                          {user.phone && (
                            <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
                              <Phone className="h-3 w-3 shrink-0" />
                              {user.phone}
                            </p>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openDetails(user)
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/10"
                          aria-label="View user"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <RoleBadge
                          role={user.role}
                        />

                        <StatusBadge
                          user={user}
                        />

                        {user.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                            <Check className="h-3 w-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                            <Clock3 className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.035]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {user.role ===
                            "student"
                              ? "Matric No."
                              : "Staff No."}
                          </p>

                          <p className="mt-1 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {user.role ===
                            "student"
                              ? user.matricNumber ||
                                "Not assigned"
                              : user.staffNumber ||
                                "Not assigned"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.035]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Joined
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {formatDate(
                              user.createdAt,
                            )}
                          </p>
                        </div>

                        <div className="col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.035]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {user.role ===
                            "student"
                              ? "Programme"
                              : "Qualification"}
                          </p>

                          <p className="mt-1 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {user.role ===
                            "student"
                              ? getProgrammeName(
                                  user.programme,
                                )
                              : user.qualification ||
                                "Not provided"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openDetails(user)
                        }
                        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
                      >
                        <Eye className="h-4 w-4" />
                        View account
                      </button>
                    </article>
                  ),
                )}
              </section>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Page{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {page}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {totalPages}
                    </span>
                  </p>

                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) =>
                          Math.max(
                            1,
                            current - 1,
                          ),
                        )
                      }
                      disabled={page === 1}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <div className="hidden items-center gap-1 sm:flex">
                      {Array.from(
                        {
                          length: Math.min(
                            totalPages,
                            5,
                          ),
                        },
                        (_, index) => {
                          let pageNumber =
                            index + 1;

                          if (
                            totalPages > 5 &&
                            page > 3
                          ) {
                            pageNumber =
                              Math.min(
                                totalPages -
                                  4 +
                                  index,
                                page -
                                  2 +
                                  index,
                              );
                          }

                          return (
                            <button
                              key={pageNumber}
                              type="button"
                              onClick={() =>
                                setPage(
                                  pageNumber,
                                )
                              }
                              className={[
                                "h-9 min-w-9 rounded-xl px-2 text-xs font-semibold transition",
                                page ===
                                pageNumber
                                  ? "bg-[#1B2847] text-white shadow-sm"
                                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
                              ].join(
                                " ",
                              )}
                            >
                              {pageNumber}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) =>
                          Math.min(
                            totalPages,
                            current + 1,
                          ),
                        )
                      }
                      disabled={
                        page === totalPages
                      }
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Details drawer */}
      {detailsOpen && selectedUser && (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Close user details"
            onClick={closeDetails}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl dark:bg-slate-950">
            <div className="relative overflow-hidden bg-[#1B2847] px-5 pb-6 pt-5 sm:px-7">
              <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#C8A951]/10 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#E2CA7D]">
                    User account
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-white">
                    Account details
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  disabled={
                    !!actionLoading ||
                    deletingUser
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="relative mt-7 flex items-center gap-4">
                <UserAvatar
                  user={selectedUser}
                  large
                />

                <div className="min-w-0">
                  <h3 className="truncate text-xl font-bold text-white">
                    {selectedUser.name}
                  </h3>

                  <p className="mt-1 truncate text-sm text-slate-300">
                    {selectedUser.email}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <RoleBadge
                      role={selectedUser.role}
                    />

                    <StatusBadge
                      user={selectedUser}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-5 sm:p-7">
                {/* Account information */}
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                      <UserCheck className="h-4 w-4" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Account information
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Identity and access details
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 dark:divide-white/5 dark:border-white/10">
                    <div className="flex items-start justify-between gap-4 p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>

                      <span className="max-w-[60%] break-all text-right text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {selectedUser.email}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Phone className="h-4 w-4" />
                        Phone
                      </div>

                      <span className="max-w-[60%] break-all text-right text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {selectedUser.phone ||
                          "Not provided"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <ShieldCheck className="h-4 w-4" />
                        Email verification
                      </div>

                      {selectedUser.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <Clock3 className="h-4 w-4" />
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <CalendarDays className="h-4 w-4" />
                        Created
                      </div>

                      <span className="text-right text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatDateTime(
                          selectedUser.createdAt,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <RefreshCw className="h-4 w-4" />
                        Last updated
                      </div>

                      <span className="text-right text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatDateTime(
                          selectedUser.updatedAt,
                        )}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Academic information */}
                {selectedUser.role ===
                  "student" && (
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                        <GraduationCap className="h-4 w-4" />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Academic information
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Current student records
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <Hash className="h-3.5 w-3.5" />
                          Matric Number
                        </div>

                        <p className="mt-2 break-all text-sm font-bold text-slate-800 dark:text-slate-200">
                          {selectedUser.matricNumber ||
                            "Not assigned"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <Layers3 className="h-3.5 w-3.5" />
                          Level
                        </div>

                        <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {selectedUser.level ||
                            "Not assigned"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035] sm:col-span-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <GraduationCap className="h-3.5 w-3.5" />
                          Programme
                        </div>

                        <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {getProgrammeName(
                            selectedUser.programme,
                          )}
                        </p>

                        {getProgrammeCode(
                          selectedUser.programme,
                        ) && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {getProgrammeCode(
                              selectedUser.programme,
                            )}
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035] sm:col-span-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Academic Session
                        </div>

                        <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {getSessionName(
                            selectedUser.academicSession,
                          )}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Staff information */}
                {selectedUser.role !==
                  "student" && (
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                        <BriefcaseBusiness className="h-4 w-4" />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Staff information
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Staff access profile
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Staff number
                        </p>

                        <p className="mt-2 break-all text-sm font-bold text-slate-800 dark:text-slate-200">
                          {selectedUser.staffNumber ||
                            "Not assigned"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Qualification
                        </p>

                        <p className="mt-2 break-words text-sm font-bold text-slate-800 dark:text-slate-200">
                          {selectedUser.qualification ||
                            "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035] sm:col-span-2">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Account role
                            </p>

                            <div className="mt-2">
                              <RoleBadge
                                role={
                                  selectedUser.role
                                }
                              />
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Status
                            </p>

                            <div className="mt-2">
                              <StatusBadge
                                user={
                                  selectedUser
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Actions */}
                <section className="pb-2">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Account actions
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Manage this account's access
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {selectedUser.isSuspended ? (
                      <button
                        type="button"
                        onClick={() =>
                          void handleStatusAction(
                            selectedUser,
                            "unsuspend",
                          )
                        }
                        disabled={
                          !!actionLoading ||
                          deletingUser
                        }
                        className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RotateCcw className="h-4 w-4" />

                        {actionLoading ===
                        getActionKey(
                          selectedUser._id,
                          "unsuspend",
                        )
                          ? "Unsuspending..."
                          : "Unsuspend Account"}
                      </button>
                    ) : (
                      <>
                        {selectedUser.isActive ? (
                          <button
                            type="button"
                            onClick={() =>
                              void handleStatusAction(
                                selectedUser,
                                "deactivate",
                              )
                            }
                            disabled={
                              !!actionLoading ||
                              deletingUser
                            }
                            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
                          >
                            <Ban className="h-4 w-4" />

                            {actionLoading ===
                            getActionKey(
                              selectedUser._id,
                              "deactivate",
                            )
                              ? "Deactivating..."
                              : "Deactivate Account"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              void handleStatusAction(
                                selectedUser,
                                "activate",
                              )
                            }
                            disabled={
                              !!actionLoading ||
                              deletingUser
                            }
                            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />

                            {actionLoading ===
                            getActionKey(
                              selectedUser._id,
                              "activate",
                            )
                              ? "Activating..."
                              : "Activate Account"}
                          </button>
                        )}

                        {isStaff(
                          selectedUser,
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleStatusAction(
                                selectedUser,
                                "suspend",
                              )
                            }
                            disabled={
                              !!actionLoading ||
                              deletingUser
                            }
                            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/5 dark:text-rose-300 dark:hover:bg-rose-500/10"
                          >
                            <PauseCircle className="h-4 w-4" />

                            {actionLoading ===
                            getActionKey(
                              selectedUser._id,
                              "suspend",
                            )
                              ? "Suspending..."
                              : "Suspend Staff Account"}
                          </button>
                        )}
                      </>
                    )}

                    {currentUserEmail &&
                    selectedUser.email.toLowerCase() ===
                      currentUserEmail ? (
                      <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/5">
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />

                        <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
                          This is your current
                          administrator account.
                          You cannot delete your own
                          account.
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          openDeleteConfirmation(
                            selectedUser,
                          )
                        }
                        disabled={
                          !!actionLoading ||
                          deletingUser
                        }
                        className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/5 dark:text-rose-300 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete User
                      </button>
                    )}
                  </div>
                </section>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950 sm:p-5">
              <button
                type="button"
                onClick={closeDetails}
                disabled={
                  !!actionLoading ||
                  deletingUser
                }
                className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
              >
                Close
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5">
          <button
            type="button"
            aria-label="Close delete confirmation"
            onClick={closeDeleteConfirmation}
            disabled={deletingUser}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-slate-950">
            <div className="relative overflow-hidden bg-[#1B2847] px-5 py-6 sm:px-7">
              <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-rose-500/10 blur-3xl" />

              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20">
                  <Trash2 className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#E2CA7D]">
                    Permanent action
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    Delete user account?
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-slate-300">
                    This action permanently removes
                    the account from the system.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDeleteConfirmation}
                  disabled={deletingUser}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                <UserAvatar
                  user={deleteTarget}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {deleteTarget.name}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {deleteTarget.email}
                  </p>

                  <div className="mt-2">
                    <RoleBadge
                      role={deleteTarget.role}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                    <ShieldAlert className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      This cannot be undone
                    </p>

                    <p className="mt-1 text-xs leading-5 text-rose-700 dark:text-rose-300">
                      Deleting this user permanently
                      removes their account. Make sure
                      you are deleting the correct
                      account before continuing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02] sm:flex-row sm:justify-end sm:p-5">
              <button
                type="button"
                onClick={closeDeleteConfirmation}
                disabled={deletingUser}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleDeleteUser()
                }
                disabled={deletingUser}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-600/15 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingUser ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create staff modal */}
      {createStaffOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5">
          <button
            type="button"
            aria-label="Close create staff dialog"
            onClick={() => {
              if (!creatingStaff) {
                setCreateStaffOpen(false);
              }
            }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-950">
            <div className="relative overflow-hidden bg-[#1B2847] px-5 py-5 sm:px-7">
              <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#C8A951]/10 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#C8A951]/15 text-[#E2CA7D]">
                    <UserPlus className="h-5 w-5" />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#E2CA7D]">
                    New staff account
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    Create staff user
                  </h2>

                  <p className="mt-1 max-w-md text-sm leading-5 text-slate-300">
                    Create an administrator,
                    registrar, finance, or lecturer
                    account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!creatingStaff) {
                      setCreateStaffOpen(false);
                    }
                  }}
                  disabled={creatingStaff}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15 disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleCreateStaff}
              className="overflow-y-auto"
            >
              <div className="space-y-5 p-5 sm:p-7">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-500/10 dark:bg-blue-500/5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                        Staff access
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300">
                        The account will be created
                        according to your current
                        backend staff-account rules.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="staff-name"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    Full name
                  </label>

                  <input
                    id="staff-name"
                    value={staffForm.name}
                    onChange={(event) =>
                      setStaffForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Enter full name"
                    autoComplete="name"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C8A951] focus:bg-white focus:ring-4 focus:ring-[#C8A951]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="staff-email"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="staff-email"
                      type="email"
                      value={staffForm.email}
                      onChange={(event) =>
                        setStaffForm(
                          (current) => ({
                            ...current,
                            email:
                              event.target.value,
                          }),
                        )
                      }
                      placeholder="staff@itmt.edu.ng"
                      autoComplete="email"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C8A951] focus:bg-white focus:ring-4 focus:ring-[#C8A951]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="staff-role"
                      className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      Role
                    </label>

                    <div className="relative">
                      <select
                        id="staff-role"
                        value={staffForm.role}
                        onChange={(event) =>
                          setStaffForm(
                            (current) => ({
                              ...current,
                              role: event.target
                                .value as StaffForm["role"],
                            }),
                          )
                        }
                        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#C8A951] focus:bg-white focus:ring-4 focus:ring-[#C8A951]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                      >
                        <option value="lecturer">
                          Lecturer
                        </option>

                        <option value="registrar">
                          Registrar
                        </option>

                        <option value="finance">
                          Finance
                        </option>

                        <option value="admin">
                          Administrator
                        </option>
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="staff-password"
                      className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      Temporary password
                    </label>

                    <div className="relative">
                      <input
                        id="staff-password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={staffForm.password}
                        onChange={(event) =>
                          setStaffForm(
                            (current) => ({
                              ...current,
                              password:
                                event.target.value,
                            }),
                          )
                        }
                        placeholder="Minimum 6 characters"
                        autoComplete="new-password"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C8A951] focus:bg-white focus:ring-4 focus:ring-[#C8A951]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (current) =>
                              !current,
                          )
                        }
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02] sm:flex-row sm:justify-end sm:p-5">
                <button
                  type="button"
                  onClick={() =>
                    setCreateStaffOpen(false)
                  }
                  disabled={creatingStaff}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingStaff}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1B2847] px-5 text-sm font-bold text-white shadow-lg shadow-[#1B2847]/15 transition hover:bg-[#25385f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingStaff ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Staff Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}