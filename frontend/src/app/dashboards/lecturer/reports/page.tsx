"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { apiGet } from "@/lib/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* =========================================================
   TYPES
========================================================= */

interface Course {
  _id: string;
  code?: string;
  title?: string;
  creditUnits?: number;
  level?: string | number;
  programme?: {
    _id?: string;
    name?: string;
  } | null;
  department?: {
    _id?: string;
    name?: string;
  } | null;
}

interface Semester {
  _id: string;
  name?: string;
  order?: number;
}

interface LecturerAssignment {
  _id: string;
  course: Course | string;
  semester: Semester | string;
  isActive?: boolean;
}

interface Student {
  _id: string;
  name?: string;
  matricNumber?: string;
  level?: string;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  totalRecords: number;
  percentage: number;
}

interface StudentPerformance {
  student: Student;
  attendance: AttendanceStats;
  result: {
    score: number;
    grade: string;
    status: string;
  } | null;
}

interface ReportSummary {
  totalStudents: number;
  attendanceSessions: number;
  attendanceRate: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  resultsSubmitted: number;
  resultsPending: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

interface ReportResponse {
  success: boolean;
  course: {
    _id: string;
    code?: string;
    title?: string;
    creditUnits?: number;
    level?: string | number;
  };
  semester: {
    _id: string;
    name?: string;
    order?: number;
  };
  summary: ReportSummary;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
    F: number;
  };
  students: StudentPerformance[];
  message?: string;
}

interface AssignmentsResponse {
  success: boolean;
  assignments?: LecturerAssignment[];
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getCourse(
  assignment: LecturerAssignment,
): Course | null {
  if (
    typeof assignment.course === "object" &&
    assignment.course !== null
  ) {
    return assignment.course;
  }

  return null;
}

function getSemester(
  assignment: LecturerAssignment,
): Semester | null {
  if (
    typeof assignment.semester === "object" &&
    assignment.semester !== null
  ) {
    return assignment.semester;
  }

  return null;
}

function getCourseId(
  assignment: LecturerAssignment,
): string {
  if (typeof assignment.course === "string") {
    return assignment.course;
  }

  return assignment.course?._id ?? "";
}

function getSemesterId(
  assignment: LecturerAssignment,
): string {
  if (typeof assignment.semester === "string") {
    return assignment.semester;
  }

  return assignment.semester?._id ?? "";
}

function getInitials(
  name?: string,
): string {
  if (!name) {
    return "ST";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function getGradeClass(
  grade: string,
): string {
  switch (grade) {
    case "A":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "B":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "C":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "D":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "E":
      return "bg-orange-50 text-orange-700 border-orange-200";

    case "F":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

/* =========================================================
   SKELETON
========================================================= */

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-44 animate-pulse rounded-3xl bg-slate-200" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      <div className="h-16 animate-pulse rounded-2xl bg-slate-200" />

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="h-16 animate-pulse bg-slate-100" />

        {Array.from({
          length: 7,
        }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse border-t border-slate-100 bg-white"
          />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function LecturerReportsPage() {
  const { data: session, status: sessionStatus } =
    useSession();

  const [assignments, setAssignments] =
    useState<LecturerAssignment[]>([]);

  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [selectedSemester, setSelectedSemester] =
    useState("");

  const [report, setReport] =
    useState<ReportResponse | null>(null);

  const [loadingAssignments, setLoadingAssignments] =
    useState(true);

  const [loadingReport, setLoadingReport] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  /* =======================================================
     LOAD ASSIGNMENTS
  ======================================================= */

  const loadAssignments = useCallback(
    async () => {
      if (!session?.accessToken) {
        return;
      }

      try {
        setLoadingAssignments(true);
        setError("");

        const response =
          (await apiGet(
            "/lecturer-assignments/me",
            session.accessToken,
          )) as AssignmentsResponse;

        if (!response?.success) {
          throw new Error(
            response?.message ??
              "Unable to load your course assignments.",
          );
        }

        const activeAssignments =
          (response.assignments ?? []).filter(
            (assignment) =>
              assignment.isActive !== false,
          );

        setAssignments(
          activeAssignments,
        );

        if (
          activeAssignments.length > 0 &&
          !selectedCourse
        ) {
          setSelectedCourse(
            getCourseId(activeAssignments[0]),
          );

          setSelectedSemester(
            getSemesterId(activeAssignments[0]),
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your course assignments.",
        );
      } finally {
        setLoadingAssignments(false);
      }
    }, [
      session?.accessToken,
      selectedCourse,
    ]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      void loadAssignments();
    }
  }, [
    sessionStatus,
    loadAssignments,
  ]);

  /* =======================================================
     LOAD REPORT
  ======================================================= */

  const loadReport = useCallback(
    async () => {
      if (!session?.accessToken) {
        return;
      }

      if (!selectedCourse || !selectedSemester) {
        setError(
          "Please select a course and semester to generate a report.",
        );
        return;
      }

      try {
        setLoadingReport(true);
        setError("");
        setReport(null);

        const response =
          (await apiGet(
            `/academic-reports/lecturer?course=${encodeURIComponent(
              selectedCourse,
            )}&semester=${encodeURIComponent(
              selectedSemester,
            )}`,
            session.accessToken,
          )) as ReportResponse;

        if (!response?.success) {
          throw new Error(
            response?.message ??
              "Unable to generate academic report.",
          );
        }

        setReport(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to generate academic report.",
        );
        setReport(null);
      } finally {
        setLoadingReport(false);
      }
    }, [
      session?.accessToken,
      selectedCourse,
      selectedSemester,
    ]);

  /* =======================================================
     AUTO LOAD REPORT
  ======================================================= */

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      selectedCourse &&
      selectedSemester
    ) {
      void loadReport();
    }
  }, [
    sessionStatus,
    selectedCourse,
    selectedSemester,
    loadReport,
  ]);

  /* =======================================================
     AVAILABLE COURSES
  ======================================================= */

  const availableCourses = useMemo(() => {
    const map = new Map<string, Course>();

    for (const assignment of assignments) {
      const course = getCourse(assignment);
      if (course) {
        map.set(course._id, course);
      }
    }

    return Array.from(map.values());
  }, [assignments]);

  /* =======================================================
     SEMESTERS FOR SELECTED COURSE
  ======================================================= */

  const courseSemesters = useMemo(() => {
    const map = new Map<string, Semester>();

    for (const assignment of assignments) {
      if (
        getCourseId(assignment) === selectedCourse
      ) {
        const semester = getSemester(assignment);
        if (semester) {
          map.set(semester._id, semester);
        }
      }
    }

    return Array.from(map.values());
  }, [assignments, selectedCourse]);

  /* =======================================================
     FILTERED STUDENTS
  ======================================================= */

  const filteredStudents = useMemo(() => {
    if (!report) {
      return [];
    }

    const query = search.trim().toLowerCase();

    if (!query) {
      return report.students;
    }

    return report.students.filter(
      (item) => {
        const student = item.student;

        return (
          student.name?.toLowerCase().includes(query) ||
          student.matricNumber?.toLowerCase().includes(query)
        );
      },
    );
  }, [report, search]);

  /* =======================================================
     CHART DATA
  ======================================================= */

  const gradeChartData = useMemo(() => {
    if (!report) {
      return [];
    }

    return Object.entries(
      report.gradeDistribution,
    ).map(([grade, count]) => ({
      grade,
      count,
    }));
  }, [report]);

  const attendanceChartData = useMemo(() => {
    if (!report) {
      return [];
    }

    return [
      {
        name: "Present",
        value: report.summary.present,
        color: "#10b981",
      },
      {
        name: "Absent",
        value: report.summary.absent,
        color: "#ef4444",
      },
      {
        name: "Late",
        value: report.summary.late,
        color: "#f59e0b",
      },
      {
        name: "Excused",
        value: report.summary.excused,
        color: "#3b82f6",
      },
    ];
  }, [report]);

  /* =======================================================
     AUTH LOADING
  ======================================================= */

  if (
    sessionStatus === "loading" ||
    loadingAssignments
  ) {
    return (
      <ReportsSkeleton />
    );
  }

  /* =======================================================
     AUTH ERROR
  ======================================================= */

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />

        <h2 className="text-lg font-bold text-red-900">
          Authentication Required
        </h2>

        <p className="mt-2 text-sm text-red-700">
          Please sign in again to view your academic reports.
        </p>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="space-y-6 pb-10">
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 text-white shadow-xl md:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-gold/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200">
              <BarChart3 className="h-4 w-4 text-brand-gold" />
              Academic Reports
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Academic Performance Reports
            </h1>

            <p className="mt-2 text-sm text-slate-300 md:text-base">
              View detailed academic performance reports for your assigned courses, including attendance statistics, results analysis, and student performance metrics.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadReport()}
            disabled={loadingReport}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-5 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loadingReport
                  ? "animate-spin"
                  : ""
              }`}
            />
            {loadingReport
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </section>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">
              Unable to load report
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ===================================================
          FILTERS
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-white">
            <BookOpen className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-brand-navy">
              Select Course & Semester
            </h2>

            <p className="text-sm text-slate-500">
              Choose your assigned course and semester to generate academic reports
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* COURSE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Course
            </label>

            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(event) => {
                  const courseId = event.target.value;
                  setSelectedCourse(courseId);

                  const assignment = assignments.find(
                    (item) =>
                      getCourseId(item) === courseId,
                  );

                  if (assignment) {
                    setSelectedSemester(
                      getSemesterId(assignment),
                    );
                  }
                }}
                disabled={loadingAssignments}
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 disabled:bg-slate-50"
              >
                <option value="">
                  {loadingAssignments
                    ? "Loading courses..."
                    : "Select course"}
                </option>

                {availableCourses.map((course) => (
                  <option
                    key={course._id}
                    value={course._id}
                  >
                    {course.code} — {course.title}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* SEMESTER */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Semester
            </label>

            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(event) =>
                  setSelectedSemester(event.target.value)
                }
                disabled={!selectedCourse}
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 disabled:bg-slate-50"
              >
                <option value="">
                  Select semester
                </option>

                {courseSemesters.map((semester) => (
                  <option
                    key={semester._id}
                    value={semester._id}
                  >
                    {semester.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          REPORT CONTENT
      =================================================== */}

      {loadingReport ? (
        <ReportsSkeleton />
      ) : report ? (
        <>
          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Total Students"
              value={report.summary.totalStudents}
              icon={<Users className="h-5 w-5" />}
              color="navy"
            />

            <SummaryCard
              label="Attendance Rate"
              value={`${report.summary.attendanceRate.toFixed(1)}%`}
              icon={<CalendarCheck2 className="h-5 w-5" />}
              color="green"
            />

            <SummaryCard
              label="Results Submitted"
              value={report.summary.resultsSubmitted}
              icon={<FileText className="h-5 w-5" />}
              color="blue"
            />

            <SummaryCard
              label="Average Score"
              value={report.summary.averageScore.toFixed(1)}
              icon={<TrendingUp className="h-5 w-5" />}
              color="gold"
            />
          </div>

          {/* =================================================
              ATTENDANCE STATISTICS
          ================================================= */}

          <div className="grid gap-4 md:grid-cols-2">
            <AttendanceSummary
              summary={report.summary}
            />

            <ResultSummary
              summary={report.summary}
            />
          </div>

          {/* =================================================
              CHARTS
          ================================================= */}

          <div className="grid gap-4 md:grid-cols-2">
            <GradeDistributionChart
              data={gradeChartData}
            />

            <AttendanceDistributionChart
              data={attendanceChartData}
            />
          </div>

          {/* =================================================
              STUDENT PERFORMANCE TABLE
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-brand-navy">
                    Student Performance
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredStudents.length} of {report.students.length} students
                  </p>
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search student..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-brand-navy/30 focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">Student</th>

                    <th className="px-5 py-4">Matric Number</th>

                    <th className="px-5 py-4">Level</th>

                    <th className="px-5 py-4">Attendance %</th>

                    <th className="px-5 py-4">Score</th>

                    <th className="px-5 py-4">Grade</th>

                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((item) => (
                    <tr
                      key={item.student._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                            {getInitials(item.student.name)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {item.student.name ?? "Unknown Student"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-brand-navy">
                          {item.student.matricNumber ?? "N/A"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {item.student.level ?? "—"}
                      </td>

                      <td className="px-5 py-4">
                        {item.attendance.totalRecords > 0 ? (
                          <span className="font-bold text-brand-navy">
                            {item.attendance.percentage.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            No record
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {item.result ? (
                          <span className="font-bold text-brand-navy">
                            {item.result.score}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {item.result ? (
                          <span
                            className={`inline-flex rounded-lg border px-3 py-1 text-xs font-bold ${getGradeClass(
                              item.result.grade,
                            )}`}
                          >
                            {item.result.grade}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {item.result ? (
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              item.result.status === "published"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {item.result.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                <Search className="h-8 w-8 text-slate-300" />

                <p className="mt-3 font-semibold text-slate-700">
                  No students found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Try another name or matriculation number.
                </p>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Select a course and semester
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Choose your assigned course and semester to generate an academic performance report.
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "navy" | "green" | "blue" | "gold";
}) {
  const colorClasses = {
    navy: "bg-brand-navy text-brand-gold",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    gold: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorClasses[color]}`}
        >
          {icon}
        </div>

        <span className="text-2xl font-bold text-brand-navy">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   ATTENDANCE SUMMARY
========================================================= */

function AttendanceSummary({
  summary,
}: {
  summary: ReportSummary;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
          <CalendarCheck2 className="h-5 w-5" />
        </div>

        <div>
          <h3 className="font-semibold text-brand-navy">
            Attendance Summary
          </h3>

          <p className="text-xs text-slate-500">
            {summary.attendanceSessions} sessions recorded
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Present</p>

          <p className="mt-1 font-bold text-emerald-600">
            {summary.present}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Absent</p>

          <p className="mt-1 font-bold text-red-600">
            {summary.absent}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Late</p>

          <p className="mt-1 font-bold text-amber-600">
            {summary.late}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Excused</p>

          <p className="mt-1 font-bold text-blue-600">
            {summary.excused}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   RESULT SUMMARY
========================================================= */

function ResultSummary({
  summary,
}: {
  summary: ReportSummary;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
          <FileText className="h-5 w-5" />
        </div>

        <div>
          <h3 className="font-semibold text-brand-navy">
            Results Summary
          </h3>

          <p className="text-xs text-slate-500">
            {summary.resultsSubmitted} of {summary.totalStudents} students
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Highest Score</p>

          <p className="mt-1 font-bold text-emerald-600">
            {summary.highestScore}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Lowest Score</p>

          <p className="mt-1 font-bold text-red-600">
            {summary.lowestScore}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Average Score</p>

          <p className="mt-1 font-bold text-brand-navy">
            {summary.averageScore.toFixed(1)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Pending</p>

          <p className="mt-1 font-bold text-amber-600">
            {summary.resultsPending}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   GRADE DISTRIBUTION CHART
========================================================= */

function GradeDistributionChart({
  data,
}: {
  data: { grade: string; count: number }[];
}) {
  const COLORS = {
    A: "#10b981",
    B: "#3b82f6",
    C: "#6366f1",
    D: "#f59e0b",
    E: "#f97316",
    F: "#ef4444",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-brand-navy">
        Grade Distribution
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="grade" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* =========================================================
   ATTENDANCE DISTRIBUTION CHART
========================================================= */

function AttendanceDistributionChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-brand-navy">
        Attendance Distribution
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                /**
                 * FIX (TS18048 — 'percent' is possibly 'undefined'):
                 * Recharts types the label render-prop's `percent`
                 * argument as `number | undefined`, since a custom
                 * label function can theoretically be called before
                 * a percentage is computed. At runtime for a Pie
                 * chart it's effectively always a number, but the
                 * compiler doesn't know that — so `?? 0` satisfies
                 * strict null checks without changing behavior.
                 */
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}