"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  User,
  UserX,
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
  updatedAt?: string;
};

type UsersResponse = {
  success: boolean;
  users?: Lecturer[];
  message?: string;
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

type AssignmentLecturer =
  | {
      _id: string;
      name: string;
      email: string;
    }
  | string;

type LecturerAssignment = {
  _id: string;
  lecturer: AssignmentLecturer;
  course: AssignmentCourse;
  semester: AssignmentSemester;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

type AssignmentsResponse = {
  success: boolean;
  assignments?: LecturerAssignment[];
  message?: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function AdminLecturerDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const { data: session, status } = useSession();

  /*
   * The project stores the backend JWT on the NextAuth session.
   */
  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  /*
   * Safely read the dynamic route parameter.
   */
  const lecturerId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : undefined;

  const [lecturer, setLecturer] =
    useState<Lecturer | null>(null);

  const [assignments, setAssignments] =
    useState<LecturerAssignment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* =========================================================
     INITIALS
  ========================================================== */

  const getInitials = (name: string) => {
    return (
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase() || "LC"
    );
  };

  /* =========================================================
     LOAD DATA
  ========================================================== */

  const loadLecturerDetails = useCallback(
    async (showRefreshLoader = false) => {
      /*
       * Never allow the page to remain in loading state
       * when required information is missing.
       */
      if (!lecturerId) {
        setLoading(false);
        setErrorMessage(
          "The lecturer ID could not be determined.",
        );
        return;
      }

      if (!accessToken) {
        setLoading(false);
        setErrorMessage(
          "Your session token is missing. Please sign in again.",
        );
        return;
      }

      try {
        setErrorMessage(null);

        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        /*
         * IMPORTANT:
         *
         * Instead of depending on:
         *
         * GET /users/staff/:id
         *
         * we use the lecturer endpoint that already exists
         * in the ITMT backend:
         *
         * GET /users?role=lecturer
         *
         * Then we find the lecturer by ID.
         */
        const [
          lecturersResponse,
          assignmentsResponse,
        ] = await Promise.all([
          apiGet<UsersResponse>(
            "/users?role=lecturer",
            accessToken,
          ),

          apiGet<AssignmentsResponse>(
            "/lecturer-assignments",
            accessToken,
          ),
        ]);

        /* =====================================================
           VALIDATE LECTURER RESPONSE
        ====================================================== */

        if (!lecturersResponse.success) {
          throw new Error(
            lecturersResponse.message ||
              "Unable to load lecturers.",
          );
        }

        const lecturers =
          lecturersResponse.users ?? [];

        const currentLecturer =
          lecturers.find(
            (item) =>
              String(item._id) ===
              String(lecturerId),
          );

        if (!currentLecturer) {
          throw new Error(
            "Lecturer not found.",
          );
        }

        if (
          currentLecturer.role !==
          "lecturer"
        ) {
          throw new Error(
            "The selected account is not a lecturer.",
          );
        }

        /* =====================================================
           VALIDATE ASSIGNMENTS RESPONSE
        ====================================================== */

        if (!assignmentsResponse.success) {
          throw new Error(
            assignmentsResponse.message ||
              "Unable to load lecturer assignments.",
          );
        }

        const allAssignments =
          assignmentsResponse.assignments ?? [];

        /*
         * Filter assignments belonging to this lecturer.
         *
         * Backend may return:
         *
         * lecturer: "64..."
         *
         * OR:
         *
         * lecturer: {
         *   _id: "64...",
         *   name: "...",
         *   email: "..."
         * }
         */
        const lecturerAssignments =
          allAssignments.filter(
            (assignment) => {
              const assignmentLecturerId =
                typeof assignment.lecturer ===
                "string"
                  ? assignment.lecturer
                  : assignment.lecturer?._id;

              return (
                String(
                  assignmentLecturerId ?? "",
                ) ===
                String(lecturerId)
              );
            },
          );

        /*
         * Everything loaded successfully.
         */
        setLecturer(currentLecturer);
        setAssignments(
          lecturerAssignments,
        );
      } catch (error) {
        console.error(
          "Load lecturer details error:",
          error,
        );

        setLecturer(null);
        setAssignments([]);

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load lecturer details.";

        setErrorMessage(message);

        toast.error(message);
      } finally {
        /*
         * VERY IMPORTANT:
         *
         * Always stop both loaders.
         */
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, lecturerId],
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    /*
     * While NextAuth is determining the session,
     * keep loading.
     */
    if (status === "loading") {
      setLoading(true);
      return;
    }

    /*
     * If authentication has finished but the user
     * isn't authenticated, don't keep the loader forever.
     */
    if (status === "unauthenticated") {
      setLoading(false);
      setErrorMessage(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    /*
     * Authenticated — now load the page.
     */
    if (
      status === "authenticated" &&
      accessToken &&
      lecturerId
    ) {
      void loadLecturerDetails();
    }
  }, [
    status,
    accessToken,
    lecturerId,
    loadLecturerDetails,
  ]);

  /* =========================================================
     ACTIVE ASSIGNMENTS
  ========================================================== */

  const activeAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.isActive,
      ),
    [assignments],
  );

  /* =========================================================
     CREATED DATE
  ========================================================== */

  const formattedCreatedDate =
    lecturer?.createdAt
      ? new Date(
          lecturer.createdAt,
        ).toLocaleDateString(
          "en-NG",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        )
      : "—";

  /* =========================================================
     LOADING
  ========================================================== */

  if (
    status === "loading" ||
    loading
  ) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <p className="text-sm text-slate-500">
            Loading lecturer details...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================== */

  if (errorMessage && !lecturer) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center px-4">
        <Card className="w-full border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <UserX className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-brand-dark">
              Unable to load lecturer
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {errorMessage}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(
                    "/dashboards/admin/lecturers",
                  )
                }
                className="rounded-xl"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Lecturers
              </Button>

              <Button
                type="button"
                onClick={() =>
                  void loadLecturerDetails()
                }
                className="rounded-xl bg-brand-navy text-white hover:bg-brand-navy/95"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================== */

  if (!lecturer) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center px-4">
        <Card className="w-full border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <UserX className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-brand-dark">
              Lecturer not found
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              The lecturer account you are
              trying to view could not be
              found or may no longer be
              available.
            </p>

            <Button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboards/admin/lecturers",
                )
              }
              className="mt-6 rounded-xl bg-brand-navy text-white hover:bg-brand-navy/95"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lecturers
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
      {/* TOP NAVIGATION */}

      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboards/admin/lecturers"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lecturers
        </Link>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            void loadLecturerDetails(true)
          }
          disabled={refreshing}
          className="h-10 rounded-xl border-slate-200"
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
      </div>

      {/* PROFILE HERO */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold text-white ring-1 ring-white/10 sm:h-20 sm:w-20 sm:text-xl">
                {getInitials(
                  lecturer.name,
                )}
              </div>

              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1">
                  <GraduationCap className="h-3.5 w-3.5 text-brand-gold" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                    Lecturer
                  </span>
                </div>

                <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {lecturer.name}
                </h1>

                <p className="mt-1 text-sm text-white/60">
                  {lecturer.email}
                </p>
              </div>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                lecturer.isActive
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-white/10 text-white/60"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  lecturer.isActive
                    ? "bg-emerald-400"
                    : "bg-white/40"
                }`}
              />

              {lecturer.isActive
                ? "Active"
                : "Inactive"}
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Assigned Courses
                </p>

                <p className="mt-2 text-2xl font-bold text-brand-dark">
                  {activeAssignments.length}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Active assignments
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/10">
                <BookOpen className="h-5 w-5 text-brand-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Account Status
                </p>

                <p className="mt-2 text-2xl font-bold text-brand-dark">
                  {lecturer.isActive
                    ? "Active"
                    : "Inactive"}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Portal access
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <UserCheckIcon
                  active={
                    lecturer.isActive
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Email
                </p>

                <p className="mt-2 truncate text-sm font-semibold text-brand-dark">
                  {lecturer.isEmailVerified
                    ? "Verified"
                    : "Unverified"}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Email verification
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/10">
                <Mail className="h-5 w-5 text-brand-navy" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Joined
                </p>

                <p className="mt-2 text-sm font-semibold text-brand-dark">
                  {formattedCreatedDate}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Account created
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <User className="h-5 w-5 text-brand-navy" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PROFILE INFORMATION */}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <CardTitle className="text-base font-semibold text-brand-dark">
            Lecturer Information
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={
                <User className="h-4 w-4" />
              }
              label="Full Name"
              value={lecturer.name}
            />

            <InfoItem
              icon={
                <Mail className="h-4 w-4" />
              }
              label="Email Address"
              value={lecturer.email}
            />

            <InfoItem
              icon={
                <ShieldCheck className="h-4 w-4" />
              }
              label="Role"
              value="Lecturer"
            />

            <InfoItem
              icon={
                lecturer.isActive ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <UserX className="h-4 w-4" />
                )
              }
              label="Account Status"
              value={
                lecturer.isActive
                  ? "Active"
                  : "Inactive"
              }
            />

            <InfoItem
              icon={
                <Mail className="h-4 w-4" />
              }
              label="Email Verification"
              value={
                lecturer.isEmailVerified
                  ? "Verified"
                  : "Not verified"
              }
            />

            <InfoItem
              icon={
                <User className="h-4 w-4" />
              }
              label="User ID"
              value={lecturer._id}
              mono
            />
          </div>
        </CardContent>
      </Card>

      {/* COURSE ASSIGNMENTS */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-brand-dark">
              <BookOpen className="h-4 w-4 text-brand-navy" />
              Course Assignments
            </CardTitle>

            <p className="text-xs text-slate-500">
              Courses currently assigned to{" "}
              {lecturer.name}.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {activeAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/10">
                <BookOpen className="h-6 w-6 text-brand-navy" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-brand-dark">
                No course assignments
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                This lecturer does not
                currently have any active
                course assignments.
              </p>

              <Link
                href="/dashboards/admin/lecturer-assignments"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-brand-navy px-4 text-sm font-semibold text-white transition hover:bg-brand-navy/95"
              >
                Assign a Course
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Course
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Credit Units
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Semester
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {activeAssignments.map(
                    (assignment) => (
                      <tr
                        key={
                          assignment._id
                        }
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-brand-dark">
                              {assignment.course?.code ??
                                "—"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {assignment.course?.title ??
                                "Course"}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-brand-gold/10 px-2.5 py-1 text-[11px] font-semibold text-brand-dark">
                            {assignment.course
                              ?.creditUnits ??
                              "—"}{" "}
                            units
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {assignment.semester?.name ??
                              "—"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </td>
                      </tr>
                    ),
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
   INFO ITEM
========================================================= */

function InfoItem({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p
        className={`mt-2 break-all text-sm font-semibold text-brand-dark ${
          mono
            ? "font-mono text-xs"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   STATUS ICON
========================================================= */

function UserCheckIcon({
  active,
}: {
  active: boolean;
}) {
  return active ? (
    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
  ) : (
    <UserX className="h-5 w-5 text-slate-500" />
  );
}