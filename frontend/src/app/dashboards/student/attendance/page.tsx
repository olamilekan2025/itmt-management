"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  FileCheck2,
  Filter,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

interface AttendanceCourse {
  _id: string;
  code: string;
  title: string;
  creditUnits?: number;
  level?: string;
}

interface AttendanceSemester {
  _id: string;
  name: string;
  order?: number;
  session?:
    | string
    | {
        _id?: string;
        name?: string;
      };
}

interface AttendanceRecord {
  _id: string;
  student: string;
  lecturer?: string;
  course: AttendanceCourse | string;
  semester: AttendanceSemester | string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attended: number;
  attendancePercentage: number;
}

interface CourseSummary {
  courseId: string;
  code: string;
  title: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

interface AttendanceResponse {
  success: boolean;
  summary: AttendanceSummary;
  courseSummary: CourseSummary[];
  attendance: AttendanceRecord[];
}

/* =========================================================
   HELPERS
========================================================= */

const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    badgeClass: string;
    iconClass: string;
  }
> = {
  present: {
    label: "Present",
    icon: CheckCircle2,
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClass: "text-emerald-600",
  },
  absent: {
    label: "Absent",
    icon: XCircle,
    badgeClass:
      "border-red-200 bg-red-50 text-red-700",
    iconClass: "text-red-600",
  },
  late: {
    label: "Late",
    icon: Clock3,
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700",
    iconClass: "text-amber-600",
  },
  excused: {
    label: "Excused",
    icon: FileCheck2,
    badgeClass:
      "border-blue-200 bg-blue-50 text-blue-700",
    iconClass: "text-blue-600",
  },
};

function getCourse(
  course: AttendanceCourse | string,
): AttendanceCourse | null {
  if (
    typeof course === "object" &&
    course !== null
  ) {
    return course;
  }

  return null;
}

function getSemester(
  semester: AttendanceSemester | string,
): AttendanceSemester | null {
  if (
    typeof semester === "object" &&
    semester !== null
  ) {
    return semester;
  }

  return null;
}

function getId(
  value:
    | string
    | {
        _id?: string;
      },
): string {
  if (typeof value === "string") {
    return value;
  }

  return value?._id ?? "";
}

function formatDate(date: string) {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function calculatePercentage(
  attended: number,
  total: number,
) {
  if (total === 0) {
    return 0;
  }

  return Math.round(
    (attended / total) * 100,
  );
}

function getPercentageClass(
  percentage: number,
) {
  if (percentage >= 75) {
    return "text-emerald-600";
  }

  if (percentage >= 60) {
    return "text-amber-600";
  }

  return "text-red-600";
}

function getProgressClass(
  percentage: number,
) {
  if (percentage >= 75) {
    return "bg-emerald-500";
  }

  if (percentage >= 60) {
    return "bg-amber-500";
  }

  return "bg-red-500";
}

/* =========================================================
   PAGE
========================================================= */

export default function StudentAttendancePage() {
  const { data: session, status: sessionStatus } =
    useSession();

  const accessToken =
    session?.accessToken as string | undefined;

  const [attendance, setAttendance] =
    useState<AttendanceRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedCourse, setSelectedCourse] =
    useState("all");

  const [selectedSemester, setSelectedSemester] =
    useState("all");

  /* =======================================================
     LOAD ATTENDANCE
  ======================================================= */

  const loadAttendance = useCallback(
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

        setError("");

        const response =
          await apiGet<AttendanceResponse>(
            "/attendance/my",
            accessToken,
          );

        if (!response?.success) {
          throw new Error(
            "Unable to load attendance records.",
          );
        }

        setAttendance(
          Array.isArray(response.attendance)
            ? response.attendance
            : [],
        );
      } catch (err) {
        console.error(
          "Student attendance error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your attendance records.",
        );
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
      void loadAttendance();
    }
  }, [
    sessionStatus,
    accessToken,
    loadAttendance,
  ]);

  /* =======================================================
     COURSE OPTIONS
  ======================================================= */

  const courseOptions = useMemo(() => {
    const map = new Map<
      string,
      AttendanceCourse
    >();

    attendance.forEach((record) => {
      const course = getCourse(record.course);

      if (!course?._id) {
        return;
      }

      if (!map.has(course._id)) {
        map.set(course._id, course);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        a.code.localeCompare(b.code),
    );
  }, [attendance]);

  /* =======================================================
     SEMESTER OPTIONS
  ======================================================= */

  const semesterOptions = useMemo(() => {
    const map = new Map<
      string,
      AttendanceSemester
    >();

    attendance.forEach((record) => {
      const semester =
        getSemester(record.semester);

      if (!semester?._id) {
        return;
      }

      if (!map.has(semester._id)) {
        map.set(
          semester._id,
          semester,
        );
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        (a.order ?? 0) -
        (b.order ?? 0),
    );
  }, [attendance]);

  /* =======================================================
     FILTERED ATTENDANCE
  ======================================================= */

  const filteredAttendance = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return attendance.filter((record) => {
      const course =
        getCourse(record.course);

      const semester =
        getSemester(record.semester);

      const matchesCourse =
        selectedCourse === "all" ||
        getId(record.course) ===
          selectedCourse;

      const matchesSemester =
        selectedSemester === "all" ||
        getId(record.semester) ===
          selectedSemester;

      const searchableText = [
        course?.code ?? "",
        course?.title ?? "",
        semester?.name ?? "",
        record.status,
        record.note ?? "",
        formatDate(record.date),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(
          normalizedSearch,
        );

      return (
        matchesCourse &&
        matchesSemester &&
        matchesSearch
      );
    });
  }, [
    attendance,
    search,
    selectedCourse,
    selectedSemester,
  ]);

  /* =======================================================
     FILTERED SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const total =
      filteredAttendance.length;

    const present =
      filteredAttendance.filter(
        (record) =>
          record.status === "present",
      ).length;

    const absent =
      filteredAttendance.filter(
        (record) =>
          record.status === "absent",
      ).length;

    const late =
      filteredAttendance.filter(
        (record) =>
          record.status === "late",
      ).length;

    const excused =
      filteredAttendance.filter(
        (record) =>
          record.status === "excused",
      ).length;

    const attended =
      present + late + excused;

    const attendancePercentage =
      calculatePercentage(
        attended,
        total,
      );

    return {
      total,
      present,
      absent,
      late,
      excused,
      attended,
      attendancePercentage,
    };
  }, [filteredAttendance]);

  /* =======================================================
     COURSE SUMMARY
  ======================================================= */

  const courseSummary = useMemo(() => {
    const map = new Map<
      string,
      CourseSummary
    >();

    filteredAttendance.forEach(
      (record) => {
        const course =
          getCourse(record.course);

        if (!course?._id) {
          return;
        }

        const existing =
          map.get(course._id);

        if (!existing) {
          map.set(course._id, {
            courseId: course._id,
            code:
              course.code || "Course",
            title:
              course.title ||
              "Untitled Course",
            total: 1,
            present:
              record.status ===
              "present"
                ? 1
                : 0,
            absent:
              record.status ===
              "absent"
                ? 1
                : 0,
            late:
              record.status ===
              "late"
                ? 1
                : 0,
            excused:
              record.status ===
              "excused"
                ? 1
                : 0,
            percentage:
              record.status ===
                "present" ||
              record.status ===
                "late" ||
              record.status ===
                "excused"
                ? 100
                : 0,
          });

          return;
        }

        existing.total += 1;

        if (
          record.status === "present"
        ) {
          existing.present += 1;
        }

        if (
          record.status === "absent"
        ) {
          existing.absent += 1;
        }

        if (
          record.status === "late"
        ) {
          existing.late += 1;
        }

        if (
          record.status === "excused"
        ) {
          existing.excused += 1;
        }

        const attended =
          existing.present +
          existing.late +
          existing.excused;

        existing.percentage =
          calculatePercentage(
            attended,
            existing.total,
          );
      },
    );

    return Array.from(
      map.values(),
    ).sort((a, b) =>
      a.code.localeCompare(b.code),
    );
  }, [filteredAttendance]);

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCourse !== "all" ||
    selectedSemester !== "all";

  const resetFilters = () => {
    setSearch("");
    setSelectedCourse("all");
    setSelectedSemester("all");
  };

  /* =======================================================
     SESSION LOADING
  ======================================================= */

  if (
    sessionStatus === "loading"
  ) {
    return (
      <PageLoader message="Loading your attendance..." />
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-0 py-5 sm:px-0 lg:px-0 lg:py-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-brand-navy px-5 py-6 sm:px-7 sm:py-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-gold/10 blur-2xl" />

            <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gold text-brand-navy shadow-lg shadow-black/10">
                  <CalendarCheck2
                    className="h-6 w-6"
                    strokeWidth={2.2}
                  />
                </div>

                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
                      Student Portal
                    </span>

                    <span className="h-1 w-1 rounded-full bg-white/40" />

                    <span className="text-xs font-medium text-white/60">
                      Academic Records
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    My Attendance
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                    Monitor your attendance records,
                    course participation, and overall
                    attendance performance.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadAttendance(true)
                }
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                  : "Refresh"}
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-red-800">
                  Unable to load attendance
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadAttendance()
                }
                className="rounded-lg px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <AttendanceSkeleton />
        ) : (
          <>
            {/* =============================================
                OVERALL ATTENDANCE
            ============================================= */}

            <section className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                        <TrendingUp className="h-5 w-5" />
                      </div>

                      <h2 className="text-base font-bold text-slate-900">
                        Overall Attendance
                      </h2>
                    </div>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      Your attendance percentage is
                      calculated from the attendance
                      records currently available for
                      your account.
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <AttendanceRing
                      percentage={
                        summary.attendancePercentage
                      }
                    />

                    <div>
                      <p
                        className={`text-3xl font-black tracking-tight ${getPercentageClass(
                          summary.attendancePercentage,
                        )}`}
                      >
                        {
                          summary.attendancePercentage
                        }
                        %
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Attendance rate
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressClass(
                      summary.attendancePercentage,
                    )}`}
                    style={{
                      width: `${Math.min(
                        summary.attendancePercentage,
                        100,
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">
                    {summary.attended} attended
                  </span>

                  <span className="font-medium text-slate-500">
                    {summary.total} total records
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Attendance Status
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Current filtered records
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MiniStat
                    label="Present"
                    value={summary.present}
                    icon={CheckCircle2}
                    iconClass="text-emerald-600"
                    bgClass="bg-emerald-50"
                  />

                  <MiniStat
                    label="Absent"
                    value={summary.absent}
                    icon={XCircle}
                    iconClass="text-red-600"
                    bgClass="bg-red-50"
                  />

                  <MiniStat
                    label="Late"
                    value={summary.late}
                    icon={Clock3}
                    iconClass="text-amber-600"
                    bgClass="bg-amber-50"
                  />

                  <MiniStat
                    label="Excused"
                    value={summary.excused}
                    icon={FileCheck2}
                    iconClass="text-blue-600"
                    bgClass="bg-blue-50"
                  />
                </div>
              </div>
            </section>

            {/* =============================================
                FILTERS
            ============================================= */}

            <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                    <Filter className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Attendance Filters
                    </h2>

                    <p className="text-xs text-slate-500">
                      Narrow down your attendance records
                    </p>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear filters
                  </button>
                )}
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.75fr)_minmax(180px,0.75fr)]">
                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search course, semester, status..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/15"
                  />
                </div>

                {/* Course */}
                <SelectField
                  value={selectedCourse}
                  onChange={setSelectedCourse}
                  options={[
                    {
                      value: "all",
                      label: "All courses",
                    },
                    ...courseOptions.map(
                      (course) => ({
                        value: course._id,
                        label: course.code,
                      }),
                    ),
                  ]}
                />

                {/* Semester */}
                <SelectField
                  value={selectedSemester}
                  onChange={
                    setSelectedSemester
                  }
                  options={[
                    {
                      value: "all",
                      label: "All semesters",
                    },
                    ...semesterOptions.map(
                      (semester) => ({
                        value: semester._id,
                        label: semester.name,
                      }),
                    ),
                  ]}
                />
              </div>
            </section>

            {/* =============================================
                COURSE ATTENDANCE
            ============================================= */}

            <section className="mb-6">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Course Attendance
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Attendance performance by course.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  {courseSummary.length}{" "}
                  {courseSummary.length === 1
                    ? "course"
                    : "courses"}
                </span>
              </div>

              {courseSummary.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No course attendance found"
                  description={
                    hasActiveFilters
                      ? "Try changing or clearing your filters."
                      : "Attendance records for your courses will appear here."
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {courseSummary.map(
                    (course) => (
                      <CourseAttendanceCard
                        key={course.courseId}
                        course={course}
                      />
                    ),
                  )}
                </div>
              )}
            </section>

            {/* =============================================
                ATTENDANCE HISTORY
            ============================================= */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Attendance History
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Detailed record of your attendance
                      activity.
                    </p>
                  </div>

                  <div className="rounded-full bg-brand-navy/5 px-3 py-1.5 text-xs font-bold text-brand-navy">
                    {filteredAttendance.length}{" "}
                    {filteredAttendance.length ===
                    1
                      ? "record"
                      : "records"}
                  </div>
                </div>
              </div>

              {filteredAttendance.length ===
              0 ? (
                <EmptyState
                  icon={CalendarCheck2}
                  title="No attendance records"
                  description={
                    hasActiveFilters
                      ? "No records match your current filters."
                      : "Your attendance history will appear here once records are available."
                  }
                  className="rounded-none border-0 shadow-none"
                />
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[850px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80">
                          <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                            Date
                          </th>

                          <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                            Course
                          </th>

                          <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                            Semester
                          </th>

                          <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                            Status
                          </th>

                          <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                            Note
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredAttendance.map(
                          (record) => (
                            <AttendanceTableRow
                              key={record._id}
                              record={record}
                            />
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile/tablet cards */}
                  <div className="divide-y divide-slate-100 lg:hidden">
                    {filteredAttendance.map(
                      (record) => (
                        <AttendanceMobileCard
                          key={record._id}
                          record={record}
                        />
                      ),
                    )}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   ATTENDANCE RING
========================================================= */

function AttendanceRing({
  percentage,
}: {
  percentage: number;
}) {
  const safePercentage = Math.min(
    Math.max(percentage, 0),
    100,
  );

  const radius = 27;
  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (safePercentage / 100) *
      circumference;

  return (
    <div className="relative h-[76px] w-[76px]">
      <svg
        viewBox="0 0 64 64"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-slate-100"
        />

        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={getProgressClass(
            safePercentage,
          ).replace(
            "bg-",
            "text-",
          )}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <CalendarCheck2 className="h-5 w-5 text-slate-700" />
      </div>
    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
}: {
  label: string;
  value: number;
  icon: typeof CheckCircle2;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${bgClass}`}
        >
          <Icon
            className={`h-4 w-4 ${iconClass}`}
          />
        </div>

        <span className="text-xl font-black text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-2 text-xs font-semibold text-slate-500">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/15"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

/* =========================================================
   COURSE ATTENDANCE CARD
========================================================= */

function CourseAttendanceCard({
  course,
}: {
  course: CourseSummary;
}) {
  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center rounded-lg bg-brand-navy/5 px-2.5 py-1 text-[11px] font-black tracking-wide text-brand-navy">
            {course.code}
          </div>

          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900">
            {course.title}
          </h3>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={`text-xl font-black ${getPercentageClass(
              course.percentage,
            )}`}
          >
            {course.percentage}%
          </p>

          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            attendance
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${getProgressClass(
            course.percentage,
          )}`}
          style={{
            width: `${Math.min(
              course.percentage,
              100,
            )}%`,
          }}
        />
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        <CourseMiniCount
          label="Present"
          value={course.present}
          className="text-emerald-600"
        />

        <CourseMiniCount
          label="Absent"
          value={course.absent}
          className="text-red-600"
        />

        <CourseMiniCount
          label="Late"
          value={course.late}
          className="text-amber-600"
        />

        <CourseMiniCount
          label="Excused"
          value={course.excused}
          className="text-blue-600"
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs font-medium text-slate-500">
          Total records
        </span>

        <span className="text-xs font-bold text-slate-800">
          {course.total}
        </span>
      </div>
    </article>
  );
}

/* =========================================================
   COURSE MINI COUNT
========================================================= */

function CourseMiniCount({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="text-center">
      <p
        className={`text-sm font-black ${className}`}
      >
        {value}
      </p>

      <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   TABLE ROW
========================================================= */

function AttendanceTableRow({
  record,
}: {
  record: AttendanceRecord;
}) {
  const course =
    getCourse(record.course);

  const semester =
    getSemester(record.semester);

  const status =
    STATUS_CONFIG[record.status];

  const StatusIcon = status.icon;

  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50/70">
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <CalendarCheck2 className="h-4 w-4" />
          </div>

          <span className="text-sm font-semibold text-slate-700">
            {formatDate(record.date)}
          </span>
        </div>
      </td>

      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-bold text-slate-900">
            {course?.code ?? "Unknown course"}
          </p>

          <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-500">
            {course?.title ??
              "Course information unavailable"}
          </p>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="text-sm font-medium text-slate-600">
          {semester?.name ??
            "Unknown semester"}
        </span>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-bold ${status.badgeClass}`}
        >
          <StatusIcon
            className={`h-3.5 w-3.5 ${status.iconClass}`}
          />

          {status.label}
        </span>
      </td>

      <td className="max-w-[260px] px-6 py-4">
        {record.note ? (
          <p
            className="truncate text-sm text-slate-500"
            title={record.note}
          >
            {record.note}
          </p>
        ) : (
          <span className="text-xs text-slate-400">
            No note
          </span>
        )}
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE ATTENDANCE CARD
========================================================= */

function AttendanceMobileCard({
  record,
}: {
  record: AttendanceRecord;
}) {
  const course =
    getCourse(record.course);

  const semester =
    getSemester(record.semester);

  const status =
    STATUS_CONFIG[record.status];

  const StatusIcon = status.icon;

  return (
    <article className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.1em] text-brand-navy">
            {course?.code ??
              "Unknown course"}
          </p>

          <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-900">
            {course?.title ??
              "Course information unavailable"}
          </h3>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-bold ${status.badgeClass}`}
        >
          <StatusIcon
            className={`h-3.5 w-3.5 ${status.iconClass}`}
          />

          {status.label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Date
          </p>

          <p className="mt-1 text-xs font-bold text-slate-700">
            {formatDate(record.date)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Semester
          </p>

          <p className="mt-1 truncate text-xs font-bold text-slate-700">
            {semester?.name ??
              "Unknown semester"}
          </p>
        </div>
      </div>

      {record.note && (
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Note
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            {record.note}
          </p>
        </div>
      )}
    </article>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  description,
  className = "",
}: {
  icon: typeof CalendarCheck2;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm ${className}`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   PAGE LOADER
========================================================= */

function PageLoader({
  message,
}: {
  message: string;
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-[70vh] max-w-[1600px] items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-lg">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-600">
            {message}
          </p>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   ATTENDANCE SKELETON
========================================================= */

function AttendanceSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div className="h-48 rounded-3xl bg-white" />
        <div className="h-48 rounded-3xl bg-white" />
      </div>

      <div className="h-32 rounded-3xl bg-white" />

      <div>
        <div className="mb-4 h-6 w-48 rounded-lg bg-slate-200" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-56 rounded-3xl bg-white"
            />
          ))}
        </div>
      </div>

      <div className="h-[500px] rounded-3xl bg-white" />
    </div>
  );
}