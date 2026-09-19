"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type Course = {
  _id: string;
  code?: string;
  title?: string;
  creditUnits?: number;
  level?: string | number;
  isActive?: boolean;
};

type Semester = {
  _id: string;
  name?: string;
  order?: number;
};

type Lecturer = {
  _id: string;
  name?: string;
  email?: string;
};

type Student = {
  _id: string;
  name?: string;
  email?: string;
  matricNumber?: string;
  isActive?: boolean;
  phone?: string;
  gender?: string;
};

type LecturerAssignment = {
  _id: string;
  lecturer?: Lecturer | string;
  course?: Course | string;
  semester?: Semester | string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AssignmentsResponse = {
  success: boolean;
  assignments?: LecturerAssignment[];
  message?: string;
};

type RosterItem = {
  registrationId: string;
  student: Student | string;
};

type RosterResponse = {
  success: boolean;
  roster?: RosterItem[];
  message?: string;
};

/* =========================================================
   NORMALIZED STUDENT
========================================================= */

type LecturerStudent = {
  studentId: string;
  registrationId: string;

  name: string;
  email: string;
  matricNumber: string;

  courseId: string;
  courseCode: string;
  courseTitle: string;

  semesterId: string;
  semesterName: string;

  level: string;
  isActive: boolean;
};

/* =========================================================
   HELPERS
========================================================= */

function getId(
  value:
    | Course
    | Semester
    | Lecturer
    | Student
    | string
    | undefined
    | null,
): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id ?? "";
}

function getCourse(
  value: Course | string | undefined,
): Course | null {
  if (!value || typeof value === "string") {
    return null;
  }

  return value;
}

function getSemester(
  value: Semester | string | undefined,
): Semester | null {
  if (!value || typeof value === "string") {
    return null;
  }

  return value;
}

function getStudent(
  value: Student | string | undefined,
): Student | null {
  if (!value || typeof value === "string") {
    return null;
  }

  return value;
}

/* =========================================================
   SKELETON
========================================================= */

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
    />
  );
}

/* =========================================================
   PAGE SKELETON
========================================================= */

function LecturerStudentsSkeleton() {
  return (
    <div className="space-y-8 pb-10">
      {/* Hero */}

      <section className="relative overflow-hidden rounded-[2rem] bg-brand-navy shadow-2xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10">
          <Skeleton className="h-5 w-24 bg-white/10" />

          <Skeleton className="mt-6 h-10 w-full max-w-xl bg-white/10 sm:h-12" />

          <Skeleton className="mt-4 h-5 w-full max-w-2xl bg-white/10" />

          <div className="mt-7 flex flex-wrap gap-3">
            <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />

            <Skeleton className="h-10 w-36 rounded-xl bg-white/10" />

            <Skeleton className="h-10 w-40 rounded-xl bg-white/10" />
          </div>
        </div>
      </section>

      {/* Stats */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-11 w-11 rounded-xl" />

              <Skeleton className="h-4 w-4 rounded-full" />
            </div>

            <Skeleton className="mt-5 h-4 w-28" />

            <Skeleton className="mt-2 h-9 w-16" />

            <Skeleton className="mt-2 h-3 w-40" />
          </div>
        ))}
      </section>

      {/* Filters */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <Skeleton className="h-12 w-full lg:flex-1" />

          <Skeleton className="h-12 w-full lg:w-64" />

          <Skeleton className="h-12 w-full lg:w-28" />
        </div>
      </section>

      {/* Student table */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <Skeleton className="h-5 w-36" />

          <Skeleton className="mt-2 h-3 w-56" />
        </div>

        <div className="hidden border-b border-slate-100 bg-slate-50/70 px-6 py-4 lg:grid lg:grid-cols-[2fr_1.3fr_1.5fr_1fr_0.8fr] lg:gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton
              key={item}
              className="h-3 w-20"
            />
          ))}
        </div>

        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="flex flex-col gap-4 px-5 py-5 lg:grid lg:grid-cols-[2fr_1.3fr_1.5fr_1fr_0.8fr] lg:items-center lg:gap-4 lg:px-6"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 shrink-0 rounded-full" />

                <div>
                  <Skeleton className="h-4 w-36" />

                  <Skeleton className="mt-2 h-3 w-28" />
                </div>
              </div>

              <Skeleton className="h-4 w-24" />

              <Skeleton className="h-4 w-36" />

              <Skeleton className="h-4 w-24" />

              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </section>
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
  icon: Icon,
  accent,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  accent: "navy" | "blue" | "gold" | "green";
}) {
  const iconClass = {
    navy: "bg-brand-navy text-brand-gold",
    blue: "bg-brand-blue/10 text-brand-blue",
    gold: "bg-brand-gold/10 text-brand-gold",
    green: "bg-emerald-50 text-emerald-600",
  }[accent];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-xl">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-brand-gold/[0.04] transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <Users className="h-4 w-4 text-slate-200" />
      </div>

      <div className="relative mt-5">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-3xl font-bold tracking-tight text-brand-navy">
          {value}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function LecturerStudentsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  const lecturerName =
    session?.user?.name?.trim() ||
    "Lecturer";

  /* =======================================================
     STATE
  ======================================================== */

  const [students, setStudents] =
    useState<LecturerStudent[]>([]);

  const [assignments, setAssignments] =
    useState<LecturerAssignment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [selectedCourse, setSelectedCourse] =
    useState("all");

  /* =========================================================
     LOAD STUDENTS
  ========================================================== */

  const loadStudents = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        return;
      }

      try {
        setError(null);

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        /* ===================================================
           STEP 1
           GET LECTURER ASSIGNMENTS
        ==================================================== */

        const assignmentsResponse =
          await apiGet<AssignmentsResponse>(
            "/lecturer-assignments/me",
            accessToken,
          );

        if (!assignmentsResponse.success) {
          throw new Error(
            assignmentsResponse.message ||
              "Unable to load your course assignments.",
          );
        }

        const lecturerAssignments =
          assignmentsResponse.assignments ?? [];

        setAssignments(
          lecturerAssignments,
        );

        const activeAssignments =
          lecturerAssignments.filter(
            (assignment) =>
              assignment.isActive !== false,
          );

        /* ===================================================
           STEP 2
           LOAD ROSTERS FOR ASSIGNED COURSES
        ==================================================== */

        const rosterResults =
          await Promise.all(
            activeAssignments.map(
              async (assignment) => {
                const courseId =
                  getId(
                    assignment.course,
                  );

                const semesterId =
                  getId(
                    assignment.semester,
                  );

                const course =
                  getCourse(
                    assignment.course,
                  );

                const semester =
                  getSemester(
                    assignment.semester,
                  );

                if (
                  !courseId ||
                  !semesterId
                ) {
                  return [];
                }

                const query =
                  `?course=${encodeURIComponent(
                    courseId,
                  )}` +
                  `&semester=${encodeURIComponent(
                    semesterId,
                  )}`;

                const response =
                  await apiGet<RosterResponse>(
                    `/registrations/roster${query}`,
                    accessToken,
                  );

                if (!response.success) {
                  throw new Error(
                    response.message ||
                      `Unable to load students for ${
                        course?.code ||
                        "this course"
                      }.`,
                  );
                }

                const roster =
                  response.roster ?? [];

                return roster
                  .map(
                    (item) => {
                      const student =
                        getStudent(
                          item.student,
                        );

                      const studentId =
                        getId(
                          item.student,
                        );

                      if (!studentId) {
                        return null;
                      }

                      return {
                        studentId,

                        registrationId:
                          item.registrationId,

                        name:
                          student?.name ||
                          "Unnamed Student",

                        email:
                          student?.email ||
                          "No email",

                        matricNumber:
                          student?.matricNumber ||
                          "No matric number",

                        courseId,

                        courseCode:
                          course?.code ||
                          "Course",

                        courseTitle:
                          course?.title ||
                          "Assigned Course",

                        semesterId,

                        semesterName:
                          semester?.name ||
                          "Semester",

                        level:
                          course?.level !==
                          undefined
                            ? String(
                                course.level,
                              )
                            : "—",

                        isActive:
                          student?.isActive !==
                          false,
                      } satisfies LecturerStudent;
                    },
                  )
                  .filter(
                    (
                      item,
                    ): item is LecturerStudent =>
                      item !== null,
                  );
              },
            ),
          );

        /* ===================================================
           STEP 3
           FLATTEN + REMOVE DUPLICATES
           
           A student can be registered for more than
           one course, so we intentionally keep the
           course registration as part of the record.
        ==================================================== */

        const flattened =
          rosterResults.flat();

        setStudents(
          flattened,
        );
      } catch (error) {
        console.error(
          "Lecturer students error:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load lecturer students.";

        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    if (
      sessionStatus ===
        "authenticated" &&
      accessToken
    ) {
      void loadStudents();
    }
  }, [
    sessionStatus,
    accessToken,
    loadStudents,
  ]);

  /* =========================================================
     COURSE OPTIONS
  ========================================================== */

  const courseOptions = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        code: string;
        title: string;
      }
    >();

    assignments
      .filter(
        (assignment) =>
          assignment.isActive !== false,
      )
      .forEach(
        (assignment) => {
          const course =
            getCourse(
              assignment.course,
            );

          const id =
            getId(
              assignment.course,
            );

          if (!id) {
            return;
          }

          map.set(id, {
            id,
            code:
              course?.code ||
              "Course",
            title:
              course?.title ||
              "Assigned Course",
          });
        },
      );

    return Array.from(
      map.values(),
    );
  }, [assignments]);

  /* =========================================================
     UNIQUE STUDENTS
     
     Same student may appear in multiple courses.
  ========================================================== */

  const uniqueStudents = useMemo(() => {
    const map = new Map<
      string,
      LecturerStudent
    >();

    students.forEach(
      (student) => {
        if (
          !map.has(
            student.studentId,
          )
        ) {
          map.set(
            student.studentId,
            student,
          );
        }
      },
    );

    return Array.from(
      map.values(),
    );
  }, [students]);

  /* =========================================================
     FILTERED STUDENTS
  ========================================================== */

  const filteredStudents =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return students.filter(
        (student) => {
          const matchesCourse =
            selectedCourse ===
              "all" ||
            student.courseId ===
              selectedCourse;

          if (!matchesCourse) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          return [
            student.name,
            student.email,
            student.matricNumber,
            student.courseCode,
            student.courseTitle,
            student.semesterName,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              normalizedSearch,
            );
        },
      );
    }, [
      students,
      search,
      selectedCourse,
    ]);

  /* =========================================================
     STATISTICS
  ========================================================== */

  const totalCourses =
    useMemo(
      () =>
        assignments.filter(
          (assignment) =>
            assignment.isActive !== false,
        ).length,
      [assignments],
    );

  const activeStudentRecords =
    useMemo(
      () =>
        students.filter(
          (student) =>
            student.isActive,
        ).length,
      [students],
    );

  const inactiveStudentRecords =
    useMemo(
      () =>
        students.filter(
          (student) =>
            !student.isActive,
        ).length,
      [students],
    );

  /* =========================================================
     AUTH LOADING
  ========================================================== */

  if (
    sessionStatus ===
    "loading"
  ) {
    return (
      <LecturerStudentsSkeleton />
    );
  }

  /* =========================================================
     UNAUTHENTICATED
  ========================================================== */

  if (
    sessionStatus ===
    "unauthenticated"
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <GraduationCap className="h-6 w-6 text-red-600" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-brand-navy">
            Authentication Required
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your lecturer session could not
            be verified. Please sign in again
            to access the Lecturer Portal.
          </p>

          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
          >
            Go to Login

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================
     API LOADING
  ========================================================== */

  if (
    loading &&
    !refreshing
  ) {
    return (
      <LecturerStudentsSkeleton />
    );
  }

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-8 pb-10">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative isolate overflow-hidden rounded-[2rem] bg-brand-navy shadow-2xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <Link
                href="/dashboards/lecturer"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-brand-gold/30 hover:text-brand-gold"
              >
                <ArrowLeft className="h-3.5 w-3.5" />

                Lecturer Dashboard
              </Link>

              <div className="mb-4 flex items-center gap-2 text-brand-gold">
                <Users className="h-5 w-5" />

                <span className="text-xs font-bold uppercase tracking-[0.18em]">
                  Student Management
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                My Students
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                View students registered for the
                courses assigned to you, including
                their matriculation details, course
                information and registration status.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-xs font-medium text-slate-200">
                  <Users className="h-4 w-4 text-brand-gold" />

                  {uniqueStudents.length} unique{" "}
                  {uniqueStudents.length === 1
                    ? "student"
                    : "students"}
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-xs font-medium text-slate-200">
                  <BookOpen className="h-4 w-4 text-brand-gold" />

                  {totalCourses} active{" "}
                  {totalCourses === 1
                    ? "course"
                    : "courses"}
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-xs font-medium text-slate-200">
                  <CalendarCheck2 className="h-4 w-4 text-brand-gold" />

                  {students.length} registrations
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <button
                type="button"
                onClick={() =>
                  void loadStudents(true)
                }
                disabled={
                  refreshing ||
                  !accessToken
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh Data"}
              </button>

              <div className="rounded-2xl border border-brand-gold/20 bg-white/[0.06] px-5 py-4 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Lecturer
                </p>

                <p className="mt-1.5 font-semibold text-white">
                  {lecturerName}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-xs text-emerald-300">
                    Academic workspace active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <Users className="h-4 w-4 text-red-600" />
              </div>

              <div>
                <p className="text-sm font-bold text-red-700">
                  Student data could not be fully loaded
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadStudents(true)
              }
              disabled={
                refreshing ||
                !accessToken
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Retry
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Unique Students"
          value={uniqueStudents.length}
          description="Students across your assigned courses"
          icon={Users}
          accent="navy"
        />

        <StatCard
          title="Course Registrations"
          value={students.length}
          description="Total course registration records"
          icon={BookOpen}
          accent="blue"
        />

        <StatCard
          title="Active Students"
          value={activeStudentRecords}
          description="Active student registration records"
          icon={CheckCircle2}
          accent="green"
        />

        <StatCard
          title="Assigned Courses"
          value={totalCourses}
          description="Active courses currently assigned"
          icon={GraduationCap}
          accent="gold"
        />
      </section>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
              <SlidersHorizontal className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-brand-navy">
                Find Students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search and filter students in your
                assigned courses
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Search */}

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search by name, matric number, email or course..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Course filter */}

            <div className="relative lg:w-72">
              <BookOpen className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={selectedCourse}
                onChange={(event) =>
                  setSelectedCourse(
                    event.target.value,
                  )
                }
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/10"
              >
                <option value="all">
                  All assigned courses
                </option>

                {courseOptions.map(
                  (course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.code} —{" "}
                      {course.title}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Reset */}

            {(search ||
              selectedCourse !==
                "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCourse(
                    "all",
                  );
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-brand-gold/40 hover:bg-brand-gold/5 hover:text-brand-navy"
              >
                <X className="h-4 w-4" />

                Reset
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-bold text-slate-600">
                {filteredStudents.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-600">
                {students.length}
              </span>{" "}
              course registrations
            </p>

            {inactiveStudentRecords >
              0 && (
              <p className="text-xs text-amber-600">
                {inactiveStudentRecords} inactive
                registration{" "}
                {inactiveStudentRecords ===
                1
                  ? "record"
                  : "records"}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          STUDENT LIST
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-brand-navy">
                Registered Students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Students registered for your courses
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-brand-navy/5 px-3 py-1.5 text-xs font-bold text-brand-navy">
            {filteredStudents.length}{" "}
            {filteredStudents.length ===
            1
              ? "record"
              : "records"}
          </span>
        </div>

        {/* Empty state */}

        {filteredStudents.length ===
        0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              {students.length ===
              0 ? (
                <Users className="h-7 w-7 text-slate-400" />
              ) : (
                <Search className="h-7 w-7 text-slate-400" />
              )}
            </div>

            <h3 className="mt-5 font-bold text-brand-navy">
              {students.length ===
              0
                ? "No students registered yet"
                : "No students found"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {students.length ===
              0
                ? "Students registered for your assigned courses will appear here."
                : "Try adjusting your search or course filter to find the student you are looking for."}
            </p>

            {students.length >
              0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCourse(
                    "all",
                  );
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
              >
                Clear Filters

                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop header */}

            <div className="hidden border-b border-slate-100 bg-slate-50/70 px-6 py-4 lg:grid lg:grid-cols-[2fr_1.25fr_1.5fr_1fr_0.8fr] lg:gap-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Student
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Matric Number
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Course
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Semester
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Status
              </p>
            </div>

            {/* Rows */}

            <div className="divide-y divide-slate-100">
              {filteredStudents.map(
                (student) => {
                  const initials =
                    student.name
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map(
                        (part) =>
                          part
                            .charAt(0)
                            .toUpperCase(),
                      )
                      .join("") ||
                    "S";

                  return (
                    <div
                      key={`${student.registrationId}-${student.studentId}-${student.courseId}`}
                      className="group px-5 py-5 transition hover:bg-slate-50/80 sm:px-6"
                    >
                      {/* Desktop */}

                      <div className="hidden lg:grid lg:grid-cols-[2fr_1.25fr_1.5fr_1fr_0.8fr] lg:items-center lg:gap-4">
                        {/* Student */}

                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-navy text-xs font-bold text-brand-gold">
                            {initials}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-brand-navy">
                              {student.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        {/* Matric */}

                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {student.matricNumber}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            Registration ID:{" "}
                            {student.registrationId.slice(
                              0,
                              10,
                            )}
                            ...
                          </p>
                        </div>

                        {/* Course */}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-brand-navy">
                            {student.courseCode}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {student.courseTitle}
                          </p>
                        </div>

                        {/* Semester */}

                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            {student.semesterName}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Level{" "}
                            {student.level}
                          </p>
                        </div>

                        {/* Status */}

                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${
                              student.isActive
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                student.isActive
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />

                            {student.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </div>

                      {/* Mobile / Tablet */}

                      <div className="lg:hidden">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold">
                            {initials}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-brand-navy">
                                  {student.name}
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {student.email}
                                </p>
                              </div>

                              <span
                                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${
                                  student.isActive
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    student.isActive
                                      ? "bg-emerald-500"
                                      : "bg-slate-400"
                                  }`}
                                />

                                {student.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                              Matric Number
                            </p>

                            <p className="mt-1.5 text-sm font-semibold text-brand-navy">
                              {student.matricNumber}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                              Course
                            </p>

                            <p className="mt-1.5 text-sm font-semibold text-brand-navy">
                              {student.courseCode}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {student.courseTitle}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                              Semester
                            </p>

                            <p className="mt-1.5 text-sm font-semibold text-brand-navy">
                              {student.semesterName}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                              Level
                            </p>

                            <p className="mt-1.5 text-sm font-semibold text-brand-navy">
                              {student.level}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </>
        )}
      </section>

      {/* =====================================================
          FOOTER INFORMATION
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold text-brand-navy">
                Lecturer student access
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                This page displays only students registered
                for courses assigned to your lecturer account.
              </p>
            </div>
          </div>

          <Link
            href="/dashboards/lecturer/courses"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-brand-navy transition hover:border-brand-gold/40 hover:bg-brand-gold/5 hover:text-brand-gold"
          >
            View My Courses

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

