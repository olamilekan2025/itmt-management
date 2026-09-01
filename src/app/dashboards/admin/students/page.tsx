"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  GraduationCap,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  Users,
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

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type Programme = {
  _id: string;
  name: string;
  code?: string;
};

type Student = {
  _id: string;
  name: string;
  email: string;
  matricNumber?: string;
  role: "student";
  isActive: boolean;
  isEmailVerified: boolean;
  level?: string;
  programme?: Programme | string | null;
  createdAt: string;
};

type StudentsResponse = {
  success: boolean;
  users?: Student[];
  students?: Student[];
  message?: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function AdminStudentsPage() {
  const { data: session, status } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  /* =========================================================
     LOAD STUDENTS
  ========================================================= */

  const loadStudents = useCallback(
    async (showRefreshLoader = false) => {
      if (!accessToken) {
        return;
      }

      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await apiGet<StudentsResponse>(
            "/users?role=student",
            accessToken,
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to load students.",
          );
        }

        const data =
          response.users ??
          response.students ??
          [];

        setStudents(data);
      } catch (error) {
        console.error(
          "Load students error:",
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load students.",
        );
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
    if (
      status === "authenticated" &&
      accessToken
    ) {
      loadStudents();
    }
  }, [
    status,
    accessToken,
    loadStudents,
  ]);

  /* =========================================================
     FILTER STUDENTS
  ========================================================= */

  const filteredStudents = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return students.filter((student) => {
      const programmeName =
        typeof student.programme === "object" &&
        student.programme !== null
          ? student.programme.name
          : typeof student.programme === "string"
            ? student.programme
            : "";

      const programmeCode =
        typeof student.programme === "object" &&
        student.programme !== null
          ? student.programme.code ?? ""
          : "";

      const matchesSearch =
        !query ||
        student.name
          .toLowerCase()
          .includes(query) ||
        student.email
          .toLowerCase()
          .includes(query) ||
        Boolean(
          student.matricNumber
            ?.toLowerCase()
            .includes(query),
        ) ||
        programmeName
          .toLowerCase()
          .includes(query) ||
        programmeCode
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          student.isActive) ||
        (statusFilter === "inactive" &&
          !student.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    students,
    search,
    statusFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const activeStudents = useMemo(
    () =>
      students.filter(
        (student) => student.isActive,
      ).length,
    [students],
  );

  const inactiveStudents = useMemo(
    () =>
      students.filter(
        (student) => !student.isActive,
      ).length,
    [students],
  );

  /* =========================================================
     PROGRAMME
  ========================================================= */

  const getProgrammeName = (
    programme?: Programme | string | null,
  ): string => {
    if (!programme) {
      return "Not assigned";
    }

    if (typeof programme === "string") {
      return programme;
    }

    return programme.name;
  };

  const getProgrammeCode = (
    programme?: Programme | string | null,
  ): string | null => {
    if (
      typeof programme === "object" &&
      programme !== null &&
      programme.code
    ) {
      return programme.code;
    }

    return null;
  };

  /* =========================================================
     INITIALS
  ========================================================= */

  const getInitials = (
    name: string,
  ) => {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) =>
        part.charAt(0),
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    status === "loading" ||
    loading
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-brand-dark">
              Loading students
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Retrieving student directory...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-12">

      {/* =====================================================
          PREMIUM HEADER
      ====================================================== */}
<section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-lg">

  {/* Decorative background */}
  <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/15 blur-3xl" />

  <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/[0.06] blur-3xl" />

  <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-brand-gold/[0.05] blur-3xl" />

  <div className="relative flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

    {/* =====================================================
        HEADER CONTENT
    ====================================================== */}

    <div className="max-w-2xl">

      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1.5 backdrop-blur-sm">

        <GraduationCap className="h-3.5 w-3.5 text-brand-gold" />

        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">
          Student Management
        </span>

      </div>

      {/* Title */}
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Students
      </h1>

      {/* Description */}
      <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-[15px]">
        Manage student accounts, matriculation numbers,
        programmes, academic levels, and portal access
        from one place.
      </p>

      {/* Statistics */}
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">

        {/* Active */}
        <div className="flex items-center gap-2 text-white/80">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.12)]" />

          <span>
            <span className="font-semibold text-white">
              {activeStudents}
            </span>{" "}
            active
          </span>
        </div>

        <div className="h-4 w-px bg-white/15" />

        {/* Inactive */}
        <div className="flex items-center gap-2 text-white/60">
          <span className="h-2 w-2 rounded-full bg-white/40" />

          <span>
            <span className="font-semibold text-white/80">
              {inactiveStudents}
            </span>{" "}
            inactive
          </span>
        </div>

        <div className="h-4 w-px bg-white/15" />

        {/* Total */}
        <div className="text-white/60">
          <span className="font-semibold text-white/80">
            {students.length}
          </span>{" "}
          total students
        </div>

      </div>

    </div>

    {/* =====================================================
        ACTIONS
    ====================================================== */}

    <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">

      {/* Refresh */}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          loadStudents(true)
        }
        disabled={refreshing}
        className="h-11 rounded-xl border-white/20 bg-white/10 px-4 text-white shadow-sm backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/15 hover:text-white"
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

      {/* Add Existing Student */}
      <Link
        href="/dashboards/admin/existing"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 text-sm font-bold text-brand-navy shadow-md transition-all hover:-translate-y-0.5 hover:bg-brand-gold/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
      >
        <Plus className="h-4 w-4" />
        Add Existing Student
      </Link>

    </div>

  </div>
</section>



      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="grid gap-4 md:grid-cols-3">

        {/* TOTAL */}

        <Card className="group overflow-hidden border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">

          <CardContent className="relative p-5">

            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-brand-navy/[0.04]" />

            <div className="relative flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Total Students
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">
                  {students.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Registered student accounts
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/10 transition-transform duration-300 group-hover:scale-105">
                <Users className="h-5 w-5 text-brand-navy" />
              </div>

            </div>

          </CardContent>
        </Card>

        {/* ACTIVE */}

        <Card className="group overflow-hidden border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">

          <CardContent className="relative p-5">

            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-emerald-500/[0.05]" />

            <div className="relative flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Active Accounts
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                  {activeStudents}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Portal access enabled
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 transition-transform duration-300 group-hover:scale-105">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>

            </div>

          </CardContent>
        </Card>

        {/* INACTIVE */}

        <Card className="group overflow-hidden border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">

          <CardContent className="relative p-5">

            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-slate-500/[0.05]" />

            <div className="relative flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Inactive Accounts
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-600">
                  {inactiveStudents}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Portal access disabled
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 transition-transform duration-300 group-hover:scale-105">
                <UserX className="h-5 w-5 text-slate-500" />
              </div>

            </div>

          </CardContent>
        </Card>

      </div>

      {/* =====================================================
          DIRECTORY
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">

        <CardHeader className="border-b border-slate-100 bg-white p-5 sm:p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy/10">
                  <GraduationCap className="h-4 w-4 text-brand-navy" />
                </div>

                <CardTitle className="text-base font-bold text-brand-dark">
                  Student Directory
                </CardTitle>

              </div>

              <p className="mt-2 text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredStudents.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {students.length}
                </span>{" "}
                students
              </p>
            </div>

            {/* FILTERS */}

            <div className="flex flex-col gap-2 sm:flex-row">

              {/* SEARCH */}

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
                  placeholder="Search by name, matric..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm text-brand-dark outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/10 sm:w-72"
                />

              </div>

              {/* STATUS */}

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "all"
                      | "active"
                      | "inactive",
                  )
                }
                className="h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-brand-dark outline-none transition-all focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/10"
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
              </select>

            </div>

          </div>

        </CardHeader>

        <CardContent className="p-0">

          {/* =================================================
              EMPTY STATE
          ================================================== */}

          {filteredStudents.length === 0 ? (

            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/10">
                <GraduationCap className="h-8 w-8 text-brand-navy" />
              </div>

              <h3 className="mt-5 text-base font-bold text-brand-dark">
                No students found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search ||
                statusFilter !== "all"
                  ? "No students match your current search or status filter. Try adjusting your filters."
                  : "There are currently no student accounts in the system."}
              </p>

              {search ||
              statusFilter !== "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter(
                      "all",
                    );
                  }}
                  className="mt-5 text-sm font-semibold text-brand-navy transition-colors hover:text-brand-gold"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  href="/dashboards/admin/students/existing"
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-navy/95 hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Add Existing Student
                </Link>
              )}

            </div>

          ) : (

            /* =================================================
               TABLE
            ================================================== */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[980px]">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Student
                    </th>

                    <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Matric Number
                    </th>

                    <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Programme
                    </th>

                    <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Level
                    </th>

                    <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Account
                    </th>

                    <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredStudents.map(
                    (student) => {
                      const initials =
                        getInitials(
                          student.name,
                        );

                      const programmeCode =
                        getProgrammeCode(
                          student.programme,
                        );

                      return (
                        <tr
                          key={student._id}
                          className="group transition-colors hover:bg-slate-50/70"
                        >

                          {/* STUDENT */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 text-xs font-bold text-brand-navy ring-1 ring-brand-navy/5">
                                {initials}

                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                                    student.isActive
                                      ? "bg-emerald-500"
                                      : "bg-slate-400"
                                  }`}
                                />
                              </div>

                              <div className="min-w-0">

                                <p className="max-w-[230px] truncate text-sm font-semibold text-brand-dark">
                                  {student.name}
                                </p>

                                <p className="mt-0.5 max-w-[230px] truncate text-xs text-slate-500">
                                  {student.email}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* MATRIC */}

                          <td className="px-6 py-4">

                            {student.matricNumber ? (
                              <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-slate-700">
                                {student.matricNumber}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Not assigned
                              </span>
                            )}

                          </td>

                          {/* PROGRAMME */}

                          <td className="px-6 py-4">

                            <div className="max-w-[240px]">

                              <p className="truncate text-sm font-medium text-slate-700">
                                {getProgrammeName(
                                  student.programme,
                                )}
                              </p>

                              {programmeCode && (
                                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  {programmeCode}
                                </p>
                              )}

                            </div>

                          </td>

                          {/* LEVEL */}

                          <td className="px-6 py-4">

                            {student.level ? (
                              <span className="inline-flex rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                                {student.level}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Not assigned
                              </span>
                            )}

                          </td>

                          {/* ACCOUNT */}

                          <td className="px-6 py-4">

                            <div className="flex flex-col items-start gap-1.5">

                              {student.isActive ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                                  <ShieldCheck className="h-3 w-3" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                  <ShieldOff className="h-3 w-3" />
                                  Inactive
                                </span>
                              )}

                              <span className="text-[10px] text-slate-400">
                                {student.isEmailVerified
                                  ? "Email verified"
                                  : "Email not verified"}
                              </span>

                            </div>

                          </td>

                          {/* ACTION */}

                          <td className="px-6 py-4 text-right">

                            <Link
                              href={`/dashboards/admin/students/${student._id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-brand-navy opacity-90 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-navy/20 hover:bg-brand-navy hover:text-white hover:shadow-md group-hover:opacity-100"
                            >
                              View Details
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>

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

      {/* =====================================================
          FOOTER INFORMATION
      ====================================================== */}

      {students.length > 0 && (
        <div className="flex flex-col gap-2 px-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <p>
            Student accounts are managed by authorised
            administrative staff.
          </p>

          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure student management
          </div>

        </div>
      )}

    </div>
  );
}

