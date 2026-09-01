"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  BookOpen,
  GraduationCap,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
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

type Lecturer = {
  _id: string;
  name: string;
  email: string;
  role: "lecturer";
  isActive: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
};

type LecturersResponse =
  | {
      success?: boolean;
      users?: Lecturer[];
      staff?: Lecturer[];
      lecturers?: Lecturer[];
      message?: string;
    }
  | Lecturer[];

type AssignmentLecturer = {
  _id: string;
  name: string;
  email: string;
};

type AssignmentCourse = {
  _id: string;
  code: string;
  title: string;
  creditUnits: number;
};

type AssignmentSemester = {
  _id: string;
  name: string;
  order?: number;
};

type LecturerAssignment = {
  _id: string;
  lecturer: AssignmentLecturer;
  course: AssignmentCourse;
  semester: AssignmentSemester;
  isActive: boolean;
  createdAt: string;
};

type AssignmentsResponse =
  | {
      success?: boolean;
      assignments?: LecturerAssignment[];
      data?: LecturerAssignment[];
      message?: string;
    }
  | LecturerAssignment[];

/* =========================================================
   HELPERS
========================================================= */

function getLecturersFromResponse(
  response: LecturersResponse,
): Lecturer[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.users)) {
    return response.users;
  }

  if (Array.isArray(response.staff)) {
    return response.staff;
  }

  if (Array.isArray(response.lecturers)) {
    return response.lecturers;
  }

  return [];
}

function getAssignmentsFromResponse(
  response: AssignmentsResponse,
): LecturerAssignment[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.assignments)) {
    return response.assignments;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminLecturersPage() {
  const { data: session, status } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : null;

  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [assignments, setAssignments] = useState<
    LecturerAssignment[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* =========================================================
     LOAD LECTURERS
  ========================================================== */

  const loadLecturers = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      const response =
        await apiGet<LecturersResponse>(
          "/users?role=lecturer",
          accessToken,
        );

      const users = getLecturersFromResponse(response);

      const lecturerUsers = users.filter(
        (user) => user.role === "lecturer",
      );

      setLecturers(lecturerUsers);

      return null;
    } catch (error) {
      console.error(
        "Failed to load lecturers:",
        error,
      );

      return error instanceof Error
        ? error.message
        : "Unable to load lecturers.";
    }
  }, [accessToken]);

  /* =========================================================
     LOAD ASSIGNMENTS
  ========================================================== */

  const loadAssignments = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      const response =
        await apiGet<AssignmentsResponse>(
          "/lecturer-assignments",
          accessToken,
        );

      const assignmentData =
        getAssignmentsFromResponse(response);

      setAssignments(assignmentData);

      return null;
    } catch (error) {
      console.error(
        "Failed to load lecturer assignments:",
        error,
      );

      /*
       * Assignment failure should NOT prevent
       * the lecturer directory from displaying.
       */
      setAssignments([]);

      return error instanceof Error
        ? error.message
        : "Unable to load lecturer assignments.";
    }
  }, [accessToken]);

  /* =========================================================
     LOAD ALL DATA
  ========================================================== */

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!accessToken) {
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage(null);

      try {
        /*
         * Load lecturers independently.
         *
         * This is the main data required by this page.
         */
        const lecturerError =
          await loadLecturers();

        /*
         * Load assignments separately.
         *
         * An assignment API problem should not
         * make the entire page unusable.
         */
        const assignmentError =
          await loadAssignments();

        if (lecturerError) {
          setErrorMessage(lecturerError);
          toast.error(lecturerError);
        } else if (assignmentError) {
          /*
           * Only show a small notification.
           * The lecturers can still be displayed.
           */
          toast.error(
            "Lecturers loaded, but assignments could not be loaded.",
          );
        }
      } catch (error) {
        console.error(
          "Unexpected lecturer page error:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load lecturer data.";

        setErrorMessage(message);
        toast.error(message);
      } finally {
        /*
         * ALWAYS stop loading.
         */
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      accessToken,
      loadLecturers,
      loadAssignments,
    ],
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    /*
     * NextAuth is still checking the session.
     */
    if (status === "loading") {
      setLoading(true);
      return;
    }

    /*
     * No authenticated user.
     */
    if (status === "unauthenticated") {
      setLoading(false);

      setErrorMessage(
        "Your session has expired. Please sign in again.",
      );

      return;
    }

    /*
     * Authenticated but token is not available yet.
     *
     * Do not start an API request with undefined.
     */
    if (
      status === "authenticated" &&
      !accessToken
    ) {
      setLoading(false);

      setErrorMessage(
        "Authentication token is unavailable. Please sign in again.",
      );

      return;
    }

    /*
     * Authenticated + token available.
     */
    if (
      status === "authenticated" &&
      accessToken
    ) {
      void loadData();
    }
  }, [
    status,
    accessToken,
    loadData,
  ]);

  /* =========================================================
     REFRESH
  ========================================================== */

  const handleRefresh = () => {
    if (!accessToken) {
      toast.error(
        "Your session has expired. Please sign in again.",
      );

      return;
    }

    void loadData(true);
  };

  /* =========================================================
     ASSIGNMENT COUNTS
  ========================================================== */

  const assignmentCountByLecturer =
    useMemo(() => {
      const counts: Record<string, number> = {};

      for (const assignment of assignments) {
        const lecturerId =
          assignment.lecturer?._id;

        if (!lecturerId) continue;

        counts[lecturerId] =
          (counts[lecturerId] ?? 0) + 1;
      }

      return counts;
    }, [assignments]);

  /* =========================================================
     FILTER
  ========================================================== */

  const filteredLecturers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return lecturers;
    }

    return lecturers.filter(
      (lecturer) =>
        lecturer.name
          ?.toLowerCase()
          .includes(query) ||
        lecturer.email
          ?.toLowerCase()
          .includes(query),
    );
  }, [lecturers, search]);

  /* =========================================================
     STATISTICS
  ========================================================== */

  const activeLecturers =
    lecturers.filter(
      (lecturer) => lecturer.isActive,
    ).length;

  const lecturersWithAssignments =
    lecturers.filter(
      (lecturer) =>
        (assignmentCountByLecturer[
          lecturer._id
        ] ?? 0) > 0,
    ).length;

  /* =========================================================
     INITIALS
  ========================================================== */

  const getInitials = (name: string) => {
    return (
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) =>
          part.charAt(0),
        )
        .join("")
        .slice(0, 2)
        .toUpperCase() || "LC"
    );
  };

  /* =========================================================
     AUTH LOADING
  ========================================================== */

  if (status === "loading") {
    return (
      <LoadingState message="Checking your session..." />
    );
  }

  /* =========================================================
     DATA LOADING
  ========================================================== */

  if (
    status === "authenticated" &&
    loading &&
    lecturers.length === 0
  ) {
    return (
      <LoadingState message="Loading lecturers..." />
    );
  }

  /* =========================================================
     ERROR
  ========================================================== */

  if (
    errorMessage &&
    lecturers.length === 0
  ) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center px-4">
        <Card className="w-full border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <Users className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-brand-dark">
              Unable to load lecturers
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {errorMessage}
            </p>

            <Button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-6 rounded-xl bg-brand-navy text-white hover:bg-brand-navy/95"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {refreshing
                ? "Trying Again..."
                : "Try Again"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================== */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      {/* HEADER */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-brand-gold" />

              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                Academic Staff
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Lecturers
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-[15px]">
              Manage teaching staff and monitor
              the courses assigned to each
              lecturer.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/60">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span>
                  {activeLecturers} active
                </span>
              </div>

              <div className="h-3 w-px bg-white/20" />

              <span>
                {lecturers.length} total
              </span>

              <div className="h-3 w-px bg-white/20" />

              <span>
                {assignments.length} course{" "}
                {assignments.length === 1
                  ? "assignment"
                  : "assignments"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-11 rounded-xl border-white/20 bg-white/10 px-4 text-white shadow-sm backdrop-blur-sm hover:bg-white/15 hover:text-white"
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
              href="/dashboards/admin/lecturers/assign"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 text-sm font-semibold text-brand-dark shadow-sm transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Assign Lecturer
            </Link>
          </div>
        </div>
      </section>

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Lecturers"
          value={lecturers.length}
          description="Teaching staff"
          icon={
            <Users className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-brand-navy/10"
        />

        <StatCard
          title="Active"
          value={activeLecturers}
          description="Available to teach"
          icon={
            <UserCheck className="h-5 w-5 text-emerald-600" />
          }
          iconClass="bg-emerald-50"
          valueClass="text-emerald-600"
        />

        <StatCard
          title="Assigned"
          value={lecturersWithAssignments}
          description="Have course assignments"
          icon={
            <BookOpen className="h-5 w-5 text-brand-gold" />
          }
          iconClass="bg-brand-gold/10"
        />

        <StatCard
          title="Assignments"
          value={assignments.length}
          description="Course assignments"
          icon={
            <BookOpen className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-slate-100"
        />
      </div>

      {/* DIRECTORY */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-brand-dark">
                Lecturer Directory
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                {filteredLecturers.length} lecturer
                {filteredLecturers.length === 1
                  ? ""
                  : "s"} found
              </p>
            </div>

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
                placeholder="Search lecturers..."
                aria-label="Search lecturers"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 md:w-72"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredLecturers.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/10 ring-8 ring-brand-navy/[0.03]">
                <GraduationCap className="h-7 w-7 text-brand-navy" />
              </div>

              <h3 className="mt-5 text-sm font-semibold text-brand-dark">
                No lecturers found
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                {search
                  ? "Try changing your search."
                  : "No lecturer accounts have been created yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Lecturer
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Email
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Assignments
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
                  {filteredLecturers.map(
                    (lecturer) => {
                      const count =
                        assignmentCountByLecturer[
                          lecturer._id
                        ] ?? 0;

                      return (
                        <tr
                          key={lecturer._id}
                          className="group transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 text-xs font-bold text-brand-navy ring-1 ring-brand-navy/5">
                                {getInitials(
                                  lecturer.name,
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-brand-dark">
                                  {lecturer.name}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  Lecturer
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">
                              {lecturer.email}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy/5 px-2.5 py-1 text-[11px] font-semibold text-brand-navy">
                              <BookOpen className="h-3.5 w-3.5" />

                              {count}{" "}
                              {count === 1
                                ? "course"
                                : "courses"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                lecturer.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  lecturer.isActive
                                    ? "bg-emerald-500"
                                    : "bg-slate-400"
                                }`}
                              />

                              {lecturer.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/dashboards/admin/lecturers/${lecturer._id}`}
                              className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-navy transition-all hover:bg-brand-navy/5 hover:text-brand-gold"
                            >
                              View Details
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
    </div>
  );
}

/* =========================================================
   LOADING STATE
========================================================= */

function LoadingState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10">
          <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
        </div>

        <p className="text-sm text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass,
  valueClass = "text-brand-dark",
}: {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <Card className="group overflow-hidden border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {title}
            </p>

            <p
              className={`mt-2 text-2xl font-bold tracking-tight ${valueClass}`}
            >
              {value}
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              {description}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

