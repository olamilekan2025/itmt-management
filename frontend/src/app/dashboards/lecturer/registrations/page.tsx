"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Course {
  _id: string;
  code?: string;
  title?: string;
  creditUnits?: number;
  level?: number | string;
  isActive?: boolean;
}

interface Semester {
  _id: string;
  name?: string;
  order?: number;
}

interface LecturerAssignment {
  _id: string;
  lecturer?: string | {
    _id: string;
    name?: string;
    email?: string;
  };
  course?: Course | string;
  semester?: Semester | string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AssignmentsResponse {
  success: boolean;
  assignments?: LecturerAssignment[];
  message?: string;
}

interface Student {
  _id: string;
  name?: string;
  email?: string;
  matricNumber?: string;
  isActive?: boolean;
}

interface RosterItem {
  registrationId: string;
  student: Student;
}

interface RosterResponse {
  success: boolean;
  roster?: RosterItem[];
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getCourse(
  assignment: LecturerAssignment,
): Course | null {
  if (!assignment.course || typeof assignment.course === "string") {
    return null;
  }

  return assignment.course;
}

function getSemester(
  assignment: LecturerAssignment,
): Semester | null {
  if (
    !assignment.semester ||
    typeof assignment.semester === "string"
  ) {
    return null;
  }

  return assignment.semester;
}

function getInitials(name?: string) {
  if (!name?.trim()) return "ST";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getStudentName(student: Student) {
  return student.name?.trim() || "Unnamed Student";
}

function sortAssignments(
  assignments: LecturerAssignment[],
) {
  return [...assignments].sort((a, b) => {
    const courseA = getCourse(a);
    const courseB = getCourse(b);

    const codeA = courseA?.code || "";
    const codeB = courseB?.code || "";

    return codeA.localeCompare(codeB);
  });
}

/* =========================================================
   STAT CARD
========================================================= */

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
}

function StatCard({
  label,
  value,
  icon,
  description,
}: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-brand-navy">
            {value}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold shadow-sm transition-transform duration-200 group-hover:scale-105">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function LecturerRegistrationsPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [assignments, setAssignments] = useState<
    LecturerAssignment[]
  >([]);

  const [selectedAssignmentId, setSelectedAssignmentId] =
    useState("");

  const [roster, setRoster] = useState<RosterItem[]>([]);

  const [search, setSearch] = useState("");

  const [loadingAssignments, setLoadingAssignments] =
    useState(true);

  const [loadingRoster, setLoadingRoster] =
    useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showCourseSelector, setShowCourseSelector] =
    useState(false);

  /* =======================================================
     ACCESS TOKEN
  ======================================================= */

  const accessToken =
    (session as { accessToken?: string } | null)?.accessToken;

  /* =======================================================
     LOAD ASSIGNMENTS
  ======================================================= */

  const loadAssignments = useCallback(
    async (isRefresh = false) => {
      if (!accessToken) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoadingAssignments(true);
        }

        setError("");

        const response =
          await apiGet<AssignmentsResponse>(
            "/lecturer-assignments/me",
            accessToken,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to load your assigned courses.",
          );
        }

        const activeAssignments = sortAssignments(
          (response.assignments || []).filter(
            (assignment) => assignment.isActive !== false,
          ),
        );

        setAssignments(activeAssignments);

        setSelectedAssignmentId((current) => {
          if (
            current &&
            activeAssignments.some(
              (assignment) => assignment._id === current,
            )
          ) {
            return current;
          }

          return activeAssignments[0]?._id || "";
        });

        if (isRefresh) {
          setSuccess("Course assignments refreshed.");
          window.setTimeout(
            () => setSuccess(""),
            2500,
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your assigned courses.",
        );
      } finally {
        setLoadingAssignments(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      accessToken
    ) {
      void loadAssignments();
    }
  }, [
    accessToken,
    sessionStatus,
    loadAssignments,
  ]);

  /* =======================================================
     SELECTED ASSIGNMENT
  ======================================================= */

  const selectedAssignment = useMemo(
    () =>
      assignments.find(
        (assignment) =>
          assignment._id === selectedAssignmentId,
      ) || null,
    [assignments, selectedAssignmentId],
  );

  const selectedCourse = useMemo(
    () =>
      selectedAssignment
        ? getCourse(selectedAssignment)
        : null,
    [selectedAssignment],
  );

  const selectedSemester = useMemo(
    () =>
      selectedAssignment
        ? getSemester(selectedAssignment)
        : null,
    [selectedAssignment],
  );

  /* =======================================================
     LOAD ROSTER
  ======================================================= */

  const loadRoster = useCallback(async () => {
    if (
      !accessToken ||
      !selectedCourse?._id ||
      !selectedSemester?._id
    ) {
      setRoster([]);
      return;
    }

    try {
      setLoadingRoster(true);
      setError("");
      setSuccess("");

      const query = new URLSearchParams({
        course: selectedCourse._id,
        semester: selectedSemester._id,
      });

      const response =
        await apiGet<RosterResponse>(
          `/registrations/roster?${query.toString()}`,
          accessToken,
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to load registered students.",
        );
      }

      setRoster(response.roster || []);
    } catch (err) {
      setRoster([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load registered students.",
      );
    } finally {
      setLoadingRoster(false);
    }
  }, [
    accessToken,
    selectedCourse?._id,
    selectedSemester?._id,
  ]);

  /* =======================================================
     LOAD ROSTER WHEN COURSE CHANGES
  ======================================================= */

  useEffect(() => {
    if (
      selectedCourse?._id &&
      selectedSemester?._id
    ) {
      void loadRoster();
    } else {
      setRoster([]);
    }
  }, [
    selectedCourse?._id,
    selectedSemester?._id,
    loadRoster,
  ]);

  /* =======================================================
     FILTERED STUDENTS
  ======================================================= */

  const filteredRoster = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return roster;
    }

    return roster.filter(({ student }) => {
      const name =
        student.name?.toLowerCase() || "";

      const email =
        student.email?.toLowerCase() || "";

      const matric =
        student.matricNumber?.toLowerCase() || "";

      return (
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        matric.includes(normalizedSearch)
      );
    });
  }, [roster, search]);

  /* =======================================================
     STATS
  ======================================================= */

  const totalRegistered = roster.length;

  const activeStudents = roster.filter(
    ({ student }) => student.isActive !== false,
  ).length;

  const inactiveStudents =
    totalRegistered - activeStudents;

  /* =======================================================
     COURSE SELECT
  ======================================================= */

  function handleAssignmentChange(
    assignmentId: string,
  ) {
    setSelectedAssignmentId(assignmentId);
    setSearch("");
    setShowCourseSelector(false);
    setError("");
    setSuccess("");
  }

  /* =======================================================
     REFRESH
  ======================================================= */

  async function handleRefresh() {
    if (!accessToken) return;

    setError("");

    if (assignments.length === 0) {
      await loadAssignments(true);
      return;
    }

    try {
      setRefreshing(true);

      await Promise.all([
        loadAssignments(false),
        loadRoster(),
      ]);

      setSuccess("Registration data refreshed.");

      window.setTimeout(
        () => setSuccess(""),
        2500,
      );
    } catch {
      setError(
        "Unable to refresh registration data.",
      );
    } finally {
      setRefreshing(false);
    }
  }

  /* =======================================================
     LOADING SESSION
  ======================================================= */

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold shadow-lg">
            <Loader2
              className="animate-spin"
              size={22}
            />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Loading lecturer workspace...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 text-white shadow-xl sm:p-8">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-brand-gold">
                <ClipboardList size={17} />

                <span>Lecturer Portal</span>

                <span className="text-white/30">
                  /
                </span>

                <span className="text-white/70">
                  Course Registrations
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Course Registrations
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                View the students officially registered
                for the courses assigned to you.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={
                refreshing ||
                loadingAssignments ||
                loadingRoster
              }
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              <span>
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================
          ALERTS
      =================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              Something went wrong
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 transition hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <CheckCircle2
            size={19}
            className="shrink-0"
          />

          <p className="text-sm font-medium">
            {success}
          </p>
        </div>
      )}

      {/* ===================================================
          ASSIGNMENT SELECTOR
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Assigned Course
            </p>

            <h2 className="mt-1 text-lg font-bold text-brand-navy">
              Select a course to view its roster
            </h2>
          </div>

          {assignments.length > 0 && (
            <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:flex">
              <BookOpen size={14} />

              {assignments.length}{" "}
              {assignments.length === 1
                ? "course"
                : "courses"}{" "}
              assigned
            </div>
          )}
        </div>

        {loadingAssignments ? (
          <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2
                size={18}
                className="animate-spin"
              />

              Loading your assigned courses...
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <BookOpen size={25} />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-800">
              No assigned courses
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              You currently have no active course
              assignments. Once an administrator assigns
              a course to you, it will appear here.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Mobile selector */}
            <button
              type="button"
              onClick={() =>
                setShowCourseSelector(
                  (current) => !current,
                )
              }
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition hover:border-brand-gold/60 hover:bg-white sm:hidden"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                  <BookOpen size={18} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {selectedCourse?.code ||
                      "Select course"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {selectedCourse?.title ||
                      "Choose an assigned course"}
                  </p>
                </div>
              </div>

              <ChevronDown
                size={18}
                className={`shrink-0 text-slate-400 transition-transform ${
                  showCourseSelector
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {showCourseSelector && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl sm:hidden">
                {assignments.map((assignment) => {
                  const course =
                    getCourse(assignment);
                  const semester =
                    getSemester(assignment);

                  const active =
                    assignment._id ===
                    selectedAssignmentId;

                  return (
                    <button
                      key={assignment._id}
                      type="button"
                      onClick={() =>
                        handleAssignmentChange(
                          assignment._id,
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                        active
                          ? "bg-brand-navy text-white"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          active
                            ? "bg-brand-gold text-brand-navy"
                            : "bg-slate-100 text-brand-navy"
                        }`}
                      >
                        <BookOpen size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-bold ${
                            active
                              ? "text-white"
                              : "text-slate-900"
                          }`}
                        >
                          {course?.code ||
                            "Unknown Course"}
                        </p>

                        <p
                          className={`truncate text-xs ${
                            active
                              ? "text-white/65"
                              : "text-slate-500"
                          }`}
                        >
                          {course?.title ||
                            "Course title unavailable"}

                          {semester?.name
                            ? ` • ${semester.name}`
                            : ""}
                        </p>
                      </div>

                      {active && (
                        <CheckCircle2
                          size={17}
                          className="shrink-0 text-brand-gold"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Desktop selector */}
            <div className="hidden gap-3 overflow-x-auto pb-1 sm:flex">
              {assignments.map((assignment) => {
                const course =
                  getCourse(assignment);
                const semester =
                  getSemester(assignment);

                const active =
                  assignment._id ===
                  selectedAssignmentId;

                return (
                  <button
                    key={assignment._id}
                    type="button"
                    onClick={() =>
                      handleAssignmentChange(
                        assignment._id,
                      )
                    }
                    className={`group flex min-w-[260px] flex-1 items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                      active
                        ? "border-brand-navy bg-brand-navy text-white shadow-md"
                        : "border-slate-200 bg-slate-50 hover:border-brand-gold/60 hover:bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        active
                          ? "bg-brand-gold text-brand-navy"
                          : "bg-white text-brand-navy shadow-sm"
                      }`}
                    >
                      <BookOpen size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-bold ${
                          active
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        {course?.code ||
                          "Unknown Course"}
                      </p>

                      <p
                        className={`mt-0.5 truncate text-xs ${
                          active
                            ? "text-white/65"
                            : "text-slate-500"
                        }`}
                      >
                        {course?.title ||
                          "Course title unavailable"}
                      </p>

                      {semester?.name && (
                        <p
                          className={`mt-1 text-[11px] font-medium ${
                            active
                              ? "text-brand-gold"
                              : "text-slate-400"
                          }`}
                        >
                          {semester.name}
                        </p>
                      )}
                    </div>

                    {active && (
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-brand-gold"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ===================================================
          SELECTED COURSE SUMMARY
      =================================================== */}

      {selectedAssignment && selectedCourse && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold shadow-md">
                  <GraduationCap size={26} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-brand-navy">
                      {selectedCourse.code ||
                        "Course"}
                    </h2>

                    {selectedSemester?.name && (
                      <span className="rounded-full bg-brand-gold/15 px-2.5 py-1 text-[11px] font-bold text-brand-navy">
                        {selectedSemester.name}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {selectedCourse.title ||
                      "Course title unavailable"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    {selectedCourse.creditUnits !==
                      undefined && (
                      <span>
                        {selectedCourse.creditUnits}{" "}
                        credit unit
                        {selectedCourse.creditUnits ===
                        1
                          ? ""
                          : "s"}
                      </span>
                    )}

                    {selectedCourse.level !==
                      undefined && (
                      <span>
                        Level{" "}
                        {selectedCourse.level}
                      </span>
                    )}

                    <span>
                      {totalRegistered} registered
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                Active Assignment
              </div>
            </div>
          </section>

          {/* =================================================
              STATS
          ================================================= */}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Registered Students"
              value={totalRegistered}
              description="Students on this course roster"
              icon={<Users size={21} />}
            />

            <StatCard
              label="Active Students"
              value={activeStudents}
              description="Currently active student accounts"
              icon={<CheckCircle2 size={21} />}
            />

            <StatCard
              label="Inactive Students"
              value={inactiveStudents}
              description="Inactive student accounts"
              icon={<AlertCircle size={21} />}
            />
          </section>

          {/* =================================================
              ROSTER
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
                      <Users size={17} />
                    </div>

                    <h2 className="text-lg font-bold text-brand-navy">
                      Registered Students
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Students officially registered for{" "}
                    <span className="font-semibold text-slate-700">
                      {selectedCourse.code}
                    </span>
                    .
                  </p>
                </div>

                <div className="relative w-full lg:w-80">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search students..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/15"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ROSTER LOADING */}
            {loadingRoster ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold">
                    <Loader2
                      size={22}
                      className="animate-spin"
                    />
                  </div>

                  <p className="text-sm font-medium text-slate-500">
                    Loading registered students...
                  </p>
                </div>
              </div>
            ) : roster.length === 0 ? (
              <div className="px-5 py-16 text-center sm:px-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Users size={28} />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-800">
                  No registered students
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                  There are currently no students with
                  an active registration for this course
                  and semester.
                </p>
              </div>
            ) : filteredRoster.length === 0 ? (
              <div className="px-5 py-16 text-center sm:px-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search size={24} />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-800">
                  No students found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  No registered student matches{" "}
                  <span className="font-semibold text-slate-700">
                    “{search}”
                  </span>
                  .
                </p>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 text-sm font-semibold text-brand-navy underline underline-offset-4"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                {/* =========================================
                    MOBILE CARDS
                ========================================= */}

                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredRoster.map(
                    ({ registrationId, student }, index) => {
                      const active =
                        student.isActive !== false;

                      return (
                        <div
                          key={registrationId}
                          className="p-4 transition hover:bg-slate-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-xs font-bold text-brand-gold">
                              {getInitials(
                                student.name,
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-slate-900">
                                    {getStudentName(
                                      student,
                                    )}
                                  </p>

                                  <p className="mt-1 text-xs font-medium text-brand-navy">
                                    {student.matricNumber ||
                                      "No matric number"}
                                  </p>
                                </div>

                                <span
                                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                    active
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {active
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </div>

                              {student.email && (
                                <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-slate-500">
                                  <Mail
                                    size={14}
                                    className="shrink-0"
                                  />

                                  <span className="truncate">
                                    {student.email}
                                  </span>
                                </div>
                              )}

                              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                                <span>
                                  Student #
                                  {String(
                                    index + 1,
                                  ).padStart(
                                    2,
                                    "0",
                                  )}
                                </span>

                                <span>
                                  Registered
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                {/* =========================================
                    TABLE
                ========================================= */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        <th className="w-16 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          #
                        </th>

                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Student
                        </th>

                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Matric Number
                        </th>

                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Email
                        </th>

                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredRoster.map(
                        (
                          {
                            registrationId,
                            student,
                          },
                          index,
                        ) => {
                          const active =
                            student.isActive !==
                            false;

                          return (
                            <tr
                              key={
                                registrationId
                              }
                              className="group transition-colors hover:bg-slate-50/80"
                            >
                              <td className="px-5 py-4 text-xs font-semibold text-slate-400">
                                {String(
                                  index + 1,
                                ).padStart(
                                  2,
                                  "0",
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex min-w-[220px] items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-xs font-bold text-brand-gold">
                                    {getInitials(
                                      student.name,
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-800">
                                      {getStudentName(
                                        student,
                                      )}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                      Registered
                                      student
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-brand-navy">
                                  {student.matricNumber ||
                                    "—"}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                {student.email ? (
                                  <div className="flex max-w-[260px] items-center gap-2 text-sm text-slate-500">
                                    <Mail
                                      size={14}
                                      className="shrink-0 text-slate-400"
                                    />

                                    <span className="truncate">
                                      {
                                        student.email
                                      }
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-400">
                                    —
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${
                                    active
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      active
                                        ? "bg-emerald-500"
                                        : "bg-slate-400"
                                    }`}
                                  />

                                  {active
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =========================================
                    FOOTER
                ========================================= */}

                <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing{" "}
                    <strong className="text-slate-700">
                      {filteredRoster.length}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-slate-700">
                      {roster.length}
                    </strong>{" "}
                    registered students
                  </span>

                  {search && (
                    <span>
                      Filtered by{" "}
                      <strong className="text-slate-700">
                        “{search}”
                      </strong>
                    </span>
                  )}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}