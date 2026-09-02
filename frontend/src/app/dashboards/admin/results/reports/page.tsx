"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Download,
  GraduationCap,
  Loader2,
  Printer,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  XCircle,
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

type Student = {
  _id: string;
  name: string;
  email?: string;
  matricNumber?: string;
};

type Course = {
  _id: string;
  code: string;
  title: string;
  creditUnits?: number;
};

type Semester = {
  _id: string;
  name: string;
  order?: number;
};

type Lecturer = {
  _id: string;
  name: string;
  email?: string;
};

type Result = {
  _id: string;

  student: Student | string;

  course: Course | string;

  semester: Semester | string;

  lecturer: Lecturer | string;

  score: number;

  grade: "A" | "B" | "C" | "D" | "E" | "F";

  status: "draft" | "published";

  createdAt: string;
  updatedAt?: string;
};

type ResultsResponse = {
  success: boolean;
  results?: Result[];
  message?: string;
};

/* =========================================================
   HELPERS
========================================================= */

function getId(
  value: Student | Course | Semester | Lecturer | string,
): string {
  if (typeof value === "string") {
    return value;
  }

  return value?._id ?? "";
}

function getStudentName(student: Result["student"]): string {
  if (typeof student === "object" && student !== null) {
    return student.name || "Unknown Student";
  }

  return "Unknown Student";
}

function getMatricNumber(student: Result["student"]): string {
  if (typeof student === "object" && student !== null) {
    return student.matricNumber || "—";
  }

  return "—";
}

function getCourseCode(course: Result["course"]): string {
  if (typeof course === "object" && course !== null) {
    return course.code || "—";
  }

  return "—";
}

function getCourseTitle(course: Result["course"]): string {
  if (typeof course === "object" && course !== null) {
    return course.title || "Course";
  }

  return "Course";
}

function getSemesterName(semester: Result["semester"]): string {
  if (typeof semester === "object" && semester !== null) {
    return semester.name || "—";
  }

  return "—";
}

function getLecturerName(lecturer: Result["lecturer"]): string {
  if (typeof lecturer === "object" && lecturer !== null) {
    return lecturer.name || "—";
  }

  return "—";
}

function getGradePercentage(
  results: Result[],
  grade: Result["grade"],
): number {
  if (results.length === 0) {
    return 0;
  }

  const count = results.filter(
    (result) => result.grade === grade,
  ).length;

  return (count / results.length) * 100;
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminResultReportPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  const [results, setResults] = useState<Result[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published"
  >("all");

  const [semesterFilter, setSemesterFilter] =
    useState("all");

  const [courseFilter, setCourseFilter] =
    useState("all");

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* =========================================================
     LOAD RESULTS
  ========================================================= */

  const loadResults = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setLoading(false);
        setRefreshing(false);

        if (sessionStatus === "unauthenticated") {
          setErrorMessage(
            "Your session has expired. Please sign in again.",
          );
        }

        return;
      }

      try {
        setErrorMessage(null);

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const query =
          statusFilter === "all"
            ? ""
            : `?status=${encodeURIComponent(
                statusFilter,
              )}`;

        const response =
          await apiGet<ResultsResponse>(
            `/results${query}`,
            accessToken,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to load result report.",
          );
        }

        setResults(
          Array.isArray(response.results)
            ? response.results
            : [],
        );
      } catch (error) {
        console.error(
          "Load result report error:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load result report.";

        setErrorMessage(message);

        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      accessToken,
      sessionStatus,
      statusFilter,
    ],
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (sessionStatus === "unauthenticated") {
      setLoading(false);

      setErrorMessage(
        "Your session has expired. Please sign in again.",
      );

      return;
    }

    if (
      sessionStatus === "authenticated" &&
      accessToken
    ) {
      void loadResults();
    }
  }, [
    sessionStatus,
    accessToken,
    loadResults,
  ]);

  /* =========================================================
     COURSE OPTIONS
  ========================================================= */

  const courseOptions = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        code: string;
        title: string;
      }
    >();

    results.forEach((result) => {
      const id = getId(result.course);

      if (!id) {
        return;
      }

      if (!map.has(id)) {
        map.set(id, {
          id,
          code: getCourseCode(result.course),
          title: getCourseTitle(result.course),
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => a.code.localeCompare(b.code),
    );
  }, [results]);

  /* =========================================================
     SEMESTER OPTIONS
  ========================================================= */

  const semesterOptions = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
      }
    >();

    results.forEach((result) => {
      const id = getId(result.semester);

      if (!id) {
        return;
      }

      if (!map.has(id)) {
        map.set(id, {
          id,
          name: getSemesterName(
            result.semester,
          ),
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => {
        return a.name.localeCompare(b.name);
      },
    );
  }, [results]);

  /* =========================================================
     FILTERED RESULTS
  ========================================================= */

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    return results.filter((result) => {
      const matchesSearch =
        !query ||
        getStudentName(result.student)
          .toLowerCase()
          .includes(query) ||
        getMatricNumber(result.student)
          .toLowerCase()
          .includes(query) ||
        getCourseCode(result.course)
          .toLowerCase()
          .includes(query) ||
        getCourseTitle(result.course)
          .toLowerCase()
          .includes(query) ||
        getLecturerName(result.lecturer)
          .toLowerCase()
          .includes(query);

      const matchesCourse =
        courseFilter === "all" ||
        getId(result.course) === courseFilter;

      const matchesSemester =
        semesterFilter === "all" ||
        getId(result.semester) ===
          semesterFilter;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesSemester
      );
    });
  }, [
    results,
    search,
    courseFilter,
    semesterFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    const total = filteredResults.length;

    const scores = filteredResults.map(
      (result) => Number(result.score) || 0,
    );

    const totalScore = scores.reduce(
      (sum, score) => sum + score,
      0,
    );

    const average =
      total > 0 ? totalScore / total : 0;

    const passed = filteredResults.filter(
      (result) => result.grade !== "F",
    ).length;

    const failed = filteredResults.filter(
      (result) => result.grade === "F",
    ).length;

    const passRate =
      total > 0 ? (passed / total) * 100 : 0;

    const failRate =
      total > 0 ? (failed / total) * 100 : 0;

    const students = new Set(
      filteredResults
        .map((result) => getId(result.student))
        .filter(Boolean),
    );

    const courses = new Set(
      filteredResults
        .map((result) => getId(result.course))
        .filter(Boolean),
    );

    const highest =
      scores.length > 0
        ? Math.max(...scores)
        : 0;

    const lowest =
      scores.length > 0
        ? Math.min(...scores)
        : 0;

    return {
      total,
      average,
      passed,
      failed,
      passRate,
      failRate,
      students: students.size,
      courses: courses.size,
      highest,
      lowest,
    };
  }, [filteredResults]);

  /* =========================================================
     GRADE DISTRIBUTION
  ========================================================= */

  const gradeDistribution = useMemo(() => {
    const grades: Result["grade"][] = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
    ];

    return grades.map((grade) => ({
      grade,
      count: filteredResults.filter(
        (result) => result.grade === grade,
      ).length,
      percentage: getGradePercentage(
        filteredResults,
        grade,
      ),
    }));
  }, [filteredResults]);

  /* =========================================================
     COURSE REPORT
  ========================================================= */

  const courseReport = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        code: string;
        title: string;
        results: number;
        students: Set<string>;
        totalScore: number;
        passed: number;
        failed: number;
      }
    >();

    filteredResults.forEach((result) => {
      const id = getId(result.course);

      if (!id) {
        return;
      }

      const existing = map.get(id);

      if (existing) {
        existing.results += 1;

        const studentId = getId(
          result.student,
        );

        if (studentId) {
          existing.students.add(studentId);
        }

        existing.totalScore +=
          Number(result.score) || 0;

        if (result.grade === "F") {
          existing.failed += 1;
        } else {
          existing.passed += 1;
        }

        return;
      }

      const studentId = getId(
        result.student,
      );

      map.set(id, {
        id,
        code: getCourseCode(result.course),
        title: getCourseTitle(
          result.course,
        ),
        results: 1,
        students: new Set(
          studentId ? [studentId] : [],
        ),
        totalScore:
          Number(result.score) || 0,
        passed:
          result.grade === "F" ? 0 : 1,
        failed:
          result.grade === "F" ? 1 : 0,
      });
    });

    return Array.from(map.values())
      .map((course) => ({
        ...course,
        studentCount: course.students.size,
        average:
          course.results > 0
            ? course.totalScore /
              course.results
            : 0,
        passRate:
          course.results > 0
            ? (course.passed /
                course.results) *
              100
            : 0,
      }))
      .sort((a, b) =>
        a.code.localeCompare(b.code),
      );
  }, [filteredResults]);

  /* =========================================================
     SEMESTER REPORT
  ========================================================= */

  const semesterReport = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        results: number;
        totalScore: number;
        passed: number;
        failed: number;
      }
    >();

    filteredResults.forEach((result) => {
      const id = getId(result.semester);

      if (!id) {
        return;
      }

      const existing = map.get(id);

      if (existing) {
        existing.results += 1;

        existing.totalScore +=
          Number(result.score) || 0;

        if (result.grade === "F") {
          existing.failed += 1;
        } else {
          existing.passed += 1;
        }

        return;
      }

      map.set(id, {
        id,
        name: getSemesterName(
          result.semester,
        ),
        results: 1,
        totalScore:
          Number(result.score) || 0,
        passed:
          result.grade === "F" ? 0 : 1,
        failed:
          result.grade === "F" ? 1 : 0,
      });
    });

    return Array.from(map.values())
      .map((semester) => ({
        ...semester,
        average:
          semester.results > 0
            ? semester.totalScore /
              semester.results
            : 0,
        passRate:
          semester.results > 0
            ? (semester.passed /
                semester.results) *
              100
            : 0,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name),
      );
  }, [filteredResults]);

  /* =========================================================
     PRINT REPORT
  ========================================================= */

  const handlePrint = () => {
    window.print();
  };

  /* =========================================================
     CSV EXPORT
  ========================================================= */

  const handleExportCsv = () => {
    if (filteredResults.length === 0) {
      toast.error(
        "There are no results to export.",
      );

      return;
    }

    const headers = [
      "Student",
      "Matric Number",
      "Course Code",
      "Course Title",
      "Semester",
      "Lecturer",
      "Score",
      "Grade",
      "Status",
    ];

    const rows = filteredResults.map(
      (result) => [
        getStudentName(result.student),
        getMatricNumber(result.student),
        getCourseCode(result.course),
        getCourseTitle(result.course),
        getSemesterName(result.semester),
        getLecturerName(result.lecturer),
        result.score,
        result.grade,
        result.status,
      ],
    );

    const escapeCsv = (value: unknown) => {
      const text = String(value ?? "");

      return `"${text.replace(
        /"/g,
        '""',
      )}"`;
    };

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) =>
        row.map(escapeCsv).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      `itmt-result-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);

    toast.success(
      "Result report exported successfully.",
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    sessionStatus === "loading" ||
    loading
  ) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <p className="text-sm text-slate-500">
            Generating result report...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    errorMessage &&
    results.length === 0
  ) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center px-4">
        <Card className="w-full border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-brand-dark">
              Unable to generate report
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {errorMessage}
            </p>

            <Button
              type="button"
              onClick={() =>
                void loadResults(true)
              }
              className="mt-6 rounded-xl bg-brand-navy text-white hover:bg-brand-navy/95"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10 print:max-w-none print:space-y-4">
      {/* HERO */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm print:rounded-none print:border-0 print:shadow-none">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl print:hidden" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl print:hidden" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1.5 print:hidden">
              <BarChart3 className="h-3.5 w-3.5 text-brand-gold" />

              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                Academic Analytics
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl print:mt-0 print:text-black">
              Result Report
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 print:text-slate-600">
              Comprehensive academic performance
              report covering student results,
              grade distribution, course
              performance, and pass rates.
            </p>

            <p className="mt-3 hidden text-xs text-slate-500 print:block">
              Generated on{" "}
              {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void loadResults(true)
              }
              disabled={refreshing}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>

            <Button
              type="button"
              onClick={handleExportCsv}
              className="rounded-xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </section>

      {/* FILTERS */}

      <Card className="border-slate-200 shadow-sm print:hidden">
        <CardContent className="p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search student, matric number, course..."
                aria-label="Search result records"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
              />
            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | "draft"
                    | "published",
                )
              }
              aria-label="Filter by result status"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
            >
              <option value="all">
                All Statuses
              </option>

              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
            </select>

            {/* COURSE */}

            <select
              value={courseFilter}
              onChange={(event) =>
                setCourseFilter(
                  event.target.value,
                )
              }
              aria-label="Filter by course"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
            >
              <option value="all">
                All Courses
              </option>

              {courseOptions.map(
                (course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.code}
                  </option>
                ),
              )}
            </select>

            {/* SEMESTER */}

            <select
              value={semesterFilter}
              onChange={(event) =>
                setSemesterFilter(
                  event.target.value,
                )
              }
              aria-label="Filter by semester"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
            >
              <option value="all">
                All Semesters
              </option>

              {semesterOptions.map(
                (semester) => (
                  <option
                    key={semester.id}
                    value={semester.id}
                  >
                    {semester.name}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-brand-dark">
              {filteredResults.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-brand-dark">
              {results.length}
            </span>{" "}
            result records
          </div>
        </CardContent>
      </Card>

      {/* SUMMARY STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard
          title="Total Results"
          value={statistics.total}
          description="Records in current report"
          icon={
            <ClipboardCheck className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-brand-navy/10"
        />

        <ReportStatCard
          title="Average Score"
          value={`${statistics.average.toFixed(
            1,
          )}%`}
          description={`Range ${statistics.lowest} – ${statistics.highest}`}
          icon={
            <TrendingUp className="h-5 w-5 text-brand-gold" />
          }
          iconClass="bg-brand-gold/10"
        />

        <ReportStatCard
          title="Pass Rate"
          value={`${statistics.passRate.toFixed(
            1,
          )}%`}
          description={`${statistics.passed} passed · ${statistics.failed} failed`}
          icon={
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          }
          iconClass="bg-emerald-50"
          valueClass="text-emerald-600"
        />

        <ReportStatCard
          title="Students"
          value={statistics.students}
          description={`${statistics.courses} courses represented`}
          icon={
            <Users className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-slate-100"
        />
      </div>

      {/* GRADE DISTRIBUTION */}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <CardTitle className="text-base font-semibold text-brand-dark">
            Grade Distribution
          </CardTitle>

          <p className="mt-1 text-xs text-slate-500">
            Distribution of grades across the
            selected result records
          </p>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {gradeDistribution.map(
              (item) => (
                <div
                  key={item.grade}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
                        item.grade === "A"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.grade === "F"
                            ? "bg-red-50 text-red-600"
                            : "bg-brand-navy/10 text-brand-navy"
                      }`}
                    >
                      {item.grade}
                    </span>

                    <span className="text-lg font-bold text-brand-dark">
                      {item.count}
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        item.grade === "A"
                          ? "bg-emerald-500"
                          : item.grade === "F"
                            ? "bg-red-500"
                            : "bg-brand-navy"
                      }`}
                      style={{
                        width: `${Math.min(
                          item.percentage,
                          100,
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-[11px] text-slate-500">
                    {item.percentage.toFixed(1)}
                    %
                  </p>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* COURSE PERFORMANCE */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <CardTitle className="text-base font-semibold text-brand-dark">
            Course Performance
          </CardTitle>

          <p className="mt-1 text-xs text-slate-500">
            Performance summary by course
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {courseReport.length === 0 ? (
            <EmptyReportState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Course
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Students
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Results
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Average
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Passed
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Failed
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Pass Rate
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {courseReport.map(
                    (course) => (
                      <tr
                        key={course.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy/10">
                              <BookOpen className="h-4 w-4 text-brand-navy" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-brand-dark">
                                {course.code}
                              </p>

                              <p className="max-w-[240px] truncate text-xs text-slate-500">
                                {course.title}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {course.studentCount}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {course.results}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-brand-dark">
                            {course.average.toFixed(
                              1,
                            )}
                            %
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-emerald-600">
                            {course.passed}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-red-500">
                            {course.failed}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${Math.min(
                                    course.passRate,
                                    100,
                                  )}%`,
                                }}
                              />
                            </div>

                            <span className="text-xs font-semibold text-slate-600">
                              {course.passRate.toFixed(
                                1,
                              )}
                              %
                            </span>
                          </div>
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

      {/* SEMESTER PERFORMANCE */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <CardTitle className="text-base font-semibold text-brand-dark">
            Semester Performance
          </CardTitle>

          <p className="mt-1 text-xs text-slate-500">
            Overall performance by semester
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {semesterReport.length === 0 ? (
            <EmptyReportState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Semester
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Results
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Average
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Passed
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Failed
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Pass Rate
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {semesterReport.map(
                    (semester) => (
                      <tr
                        key={semester.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold/10">
                              <GraduationCap className="h-4 w-4 text-brand-gold" />
                            </div>

                            <span className="text-sm font-semibold text-brand-dark">
                              {semester.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {semester.results}
                        </td>

                        <td className="px-6 py-4 font-semibold text-brand-dark">
                          {semester.average.toFixed(
                            1,
                          )}
                          %
                        </td>

                        <td className="px-6 py-4 font-semibold text-emerald-600">
                          {semester.passed}
                        </td>

                        <td className="px-6 py-4 font-semibold text-red-500">
                          {semester.failed}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            {semester.passRate.toFixed(
                              1,
                            )}
                            %
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

      {/* RESULT RECORDS */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <CardTitle className="text-base font-semibold text-brand-dark">
            Detailed Result Records
          </CardTitle>

          <p className="mt-1 text-xs text-slate-500">
            Individual records included in this
            report
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {filteredResults.length === 0 ? (
            <EmptyReportState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Course
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Semester
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Lecturer
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Score
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Grade
                    </th>

                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredResults.map(
                    (result) => (
                      <tr
                        key={result._id}
                        className="hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-brand-dark">
                            {getStudentName(
                              result.student,
                            )}
                          </p>

                          <p className="text-xs text-slate-500">
                            {getMatricNumber(
                              result.student,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-brand-dark">
                            {getCourseCode(
                              result.course,
                            )}
                          </p>

                          <p className="max-w-[190px] truncate text-xs text-slate-500">
                            {getCourseTitle(
                              result.course,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {getSemesterName(
                            result.semester,
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {getLecturerName(
                            result.lecturer,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-brand-dark">
                            {result.score}
                          </span>

                          <span className="ml-1 text-xs text-slate-400">
                            / 100
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                              result.grade === "A"
                                ? "bg-emerald-50 text-emerald-700"
                                : result.grade === "F"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-brand-navy/10 text-brand-navy"
                            }`}
                          >
                            {result.grade}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {result.status ===
                          "published" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                              Draft
                            </span>
                          )}
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

      {/* PRINT FOOTER */}

      <div className="hidden border-t border-slate-200 pt-5 text-xs text-slate-500 print:block">
        <div className="flex items-center justify-between">
          <span>
            ITMT Management System
          </span>

          <span>
            Academic Result Report
          </span>

          <span>
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function ReportStatCard({
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
  icon: ReactNode;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
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

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyReportState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/10">
        <BarChart3 className="h-6 w-6 text-brand-navy" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-brand-dark">
        No report data
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        There are no result records matching
        the selected filters.
      </p>
    </div>
  );
}