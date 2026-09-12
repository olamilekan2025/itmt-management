"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileBarChart,
  GraduationCap,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface AcademicSession {
  _id: string;
  name: string;
}

interface Semester {
  _id: string;
  name: string;
  order?: number;
  session?: string | AcademicSession | null;
}

interface Programme {
  _id: string;
  name: string;
  code?: string;
}

interface Overview {
  totalStudents: number;
  totalResults: number;
  passedResults: number;
  failedResults: number;
  averageScore: number;
  passRate: number;
}

interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
}

interface CoursePerformance {
  code: string;
  title: string;
  results: number;
  passed: number;
  failed: number;
  averageScore: number;
  passRate: number;
}

interface ProgrammePerformance {
  id: string;
  name: string;
  code?: string;
  results: number;
  passed: number;
  failed: number;
  averageScore: number;
  passRate: number;
}

interface StudentPerformance {
  id: string;
  name?: string;
  email?: string;
  matricNumber?: string;
  level?: string;
  programme?: string | Programme | null;
  results: number;
  passed: number;
  failed: number;
  averageScore: number;
  passRate: number;
}

interface ReportResponse {
  success?: boolean;
  message?: string;

  filters?: {
    session?: {
      _id: string;
      name: string;
    } | null;

    semester?: {
      _id: string;
      name: string;
      order?: number;
    } | null;

    programme?: {
      _id: string;
      name: string;
      code?: string;
    } | null;

    level?: string | null;
  };

  overview?: Overview;

  gradeDistribution?: GradeDistribution;

  coursePerformance?: CoursePerformance[];

  programmePerformance?: ProgrammePerformance[];

  studentPerformance?: StudentPerformance[];
}

interface SessionsResponse {
  success?: boolean;
  sessions?: AcademicSession[];
  data?: AcademicSession[];
}

interface SemestersResponse {
  success?: boolean;
  semesters?: Semester[];
  data?: Semester[];
}

interface ProgrammesResponse {
  success?: boolean;
  programmes?: Programme[];
  data?: Programme[];
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number | undefined | null) {
  return new Intl.NumberFormat("en-NG").format(value ?? 0);
}

function formatScore(value: number | undefined | null) {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

function getProgrammeName(
  programme: StudentPerformance["programme"],
) {
  if (!programme) return "—";

  if (typeof programme === "string") {
    return programme;
  }

  return programme.name || programme.code || "—";
}

function getScoreTone(score: number) {
  if (score >= 70) {
    return "text-emerald-700 bg-emerald-50";
  }

  if (score >= 50) {
    return "text-blue-700 bg-blue-50";
  }

  if (score >= 40) {
    return "text-amber-700 bg-amber-50";
  }

  return "text-red-700 bg-red-50";
}

function getPassRateWidth(rate: number) {
  return `${Math.min(Math.max(rate, 0), 100)}%`;
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof Users;
  iconClass: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-50 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-brand-navy">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BarChart3;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold shadow-sm">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h2 className="text-base font-bold text-brand-navy">
          {title}
        </h2>

        <p className="mt-0.5 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function RegistrarAcademicReportsPage() {
  const { data: session, status } = useSession();

  const accessToken = session?.accessToken as
    | string
    | undefined;

  /* =======================================================
     FILTER STATE
  ======================================================= */

  const [selectedSession, setSelectedSession] =
    useState("");

  const [selectedSemester, setSelectedSemester] =
    useState("");

  const [selectedProgramme, setSelectedProgramme] =
    useState("");

  const [selectedLevel, setSelectedLevel] =
    useState("");

  /* =======================================================
     FILTER DATA
  ======================================================= */

  const [sessions, setSessions] = useState<
    AcademicSession[]
  >([]);

  const [semesters, setSemesters] = useState<
    Semester[]
  >([]);

  const [programmes, setProgrammes] = useState<
    Programme[]
  >([]);

  /* =======================================================
     REPORT STATE
  ======================================================= */

  const [report, setReport] =
    useState<ReportResponse | null>(null);

  const [loadingFilters, setLoadingFilters] =
    useState(true);

  const [loadingReport, setLoadingReport] =
    useState(false);

  const [error, setError] = useState("");

  const [studentSearch, setStudentSearch] =
    useState("");

  const [courseSearch, setCourseSearch] =
    useState("");

  const [programmeSearch, setProgrammeSearch] =
    useState("");

  /* =======================================================
     LOAD FILTER DATA
  ======================================================= */

  const loadFilterData = useCallback(async () => {
    if (!accessToken) return;

    setLoadingFilters(true);

    try {
      const [
        sessionsResponse,
        semestersResponse,
        programmesResponse,
      ] = await Promise.all([
        apiGet("/academic-sessions", accessToken) as Promise<SessionsResponse>,
        apiGet("/semesters", accessToken) as Promise<SemestersResponse>,
        apiGet("/programmes", accessToken) as Promise<ProgrammesResponse>,
      ]);

      setSessions(
        sessionsResponse.sessions ??
          sessionsResponse.data ??
          [],
      );

      setSemesters(
        semestersResponse.semesters ??
          semestersResponse.data ??
          [],
      );

      setProgrammes(
        programmesResponse.programmes ??
          programmesResponse.data ??
          [],
      );
    } catch (err) {
      console.error(
        "Failed to load academic report filters:",
        err,
      );

      setError(
        "Unable to load academic report filters.",
      );
    } finally {
      setLoadingFilters(false);
    }
  }, [accessToken]);

  /* =======================================================
     LOAD REPORT
  ======================================================= */

  const loadReport = useCallback(async () => {
    if (!accessToken) return;

    setLoadingReport(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (selectedSession) {
        params.set("session", selectedSession);
      }

      if (selectedSemester) {
        params.set("semester", selectedSemester);
      }

      if (selectedProgramme) {
        params.set("programme", selectedProgramme);
      }

      if (selectedLevel) {
        params.set("level", selectedLevel);
      }

      const query = params.toString();

      const response = (await apiGet(
        `/academic-reports${query ? `?${query}` : ""}`,
        accessToken,
      )) as ReportResponse;

      if (response.success === false) {
        throw new Error(
          response.message ||
            "Unable to generate academic report.",
        );
      }

      setReport(response);
    } catch (err) {
      console.error(
        "Failed to load academic report:",
        err,
      );

      setReport(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate academic report.",
      );
    } finally {
      setLoadingReport(false);
    }
  }, [
    accessToken,
    selectedSession,
    selectedSemester,
    selectedProgramme,
    selectedLevel,
  ]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) {
      return;
    }

    void loadFilterData();
  }, [
    status,
    accessToken,
    loadFilterData,
  ]);

  /* =======================================================
     REPORT LOAD
  ======================================================= */

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !accessToken ||
      loadingFilters
    ) {
      return;
    }

    void loadReport();
  }, [
    status,
    accessToken,
    loadingFilters,
    loadReport,
  ]);

  /* =======================================================
     SEMESTER FILTER
  ======================================================= */

  const filteredSemesters = useMemo(() => {
    if (!selectedSession) {
      return semesters;
    }

    return semesters.filter((semester) => {
      if (!semester.session) return false;

      const sessionId =
        typeof semester.session === "string"
          ? semester.session
          : semester.session._id;

      return sessionId === selectedSession;
    });
  }, [
    semesters,
    selectedSession,
  ]);

  /* =======================================================
     LEVELS
  ======================================================= */

  const levels = useMemo(() => {
    const values = new Set<string>();

    for (const student of report?.studentPerformance ??
      []) {
      if (student.level) {
        values.add(student.level);
      }
    }

    const standardLevels = [
      "ND 1",
      "ND 2",
      "HND 1",
      "HND 2",
      "100",
      "200",
      "300",
      "400",
    ];

    return Array.from(
      new Set([
        ...standardLevels.filter((level) =>
          values.has(level),
        ),
        ...Array.from(values).filter(
          (level) =>
            !standardLevels.includes(level),
        ),
      ]),
    );
  }, [report?.studentPerformance]);

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const resetFilters = () => {
    setSelectedSession("");
    setSelectedSemester("");
    setSelectedProgramme("");
    setSelectedLevel("");
    setStudentSearch("");
    setCourseSearch("");
    setProgrammeSearch("");
  };

  /* =======================================================
     SEARCHED DATA
  ======================================================= */

  const filteredStudents = useMemo(() => {
    const search =
      studentSearch.trim().toLowerCase();

    const students =
      report?.studentPerformance ?? [];

    if (!search) return students;

    return students.filter((student) => {
      return [
        student.name,
        student.email,
        student.matricNumber,
        student.level,
        getProgrammeName(student.programme),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(search),
        );
    });
  }, [
    report?.studentPerformance,
    studentSearch,
  ]);

  const filteredCourses = useMemo(() => {
    const search =
      courseSearch.trim().toLowerCase();

    const courses =
      report?.coursePerformance ?? [];

    if (!search) return courses;

    return courses.filter((course) =>
      `${course.code} ${course.title}`
        .toLowerCase()
        .includes(search),
    );
  }, [
    report?.coursePerformance,
    courseSearch,
  ]);

  const filteredProgrammes = useMemo(() => {
    const search =
      programmeSearch.trim().toLowerCase();

    const programmeData =
      report?.programmePerformance ?? [];

    if (!search) return programmeData;

    return programmeData.filter((programme) =>
      `${programme.code ?? ""} ${
        programme.name
      }`
        .toLowerCase()
        .includes(search),
    );
  }, [
    report?.programmePerformance,
    programmeSearch,
  ]);

  /* =======================================================
     GRADE DATA
  ======================================================= */

  const gradeData = useMemo(() => {
    const distribution =
      report?.gradeDistribution ?? {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 0,
      };

    const total = Object.values(
      distribution,
    ).reduce(
      (sum, value) => sum + value,
      0,
    );

    return Object.entries(distribution).map(
      ([grade, count]) => ({
        grade,
        count,
        percentage:
          total > 0
            ? (count / total) * 100
            : 0,
      }),
    );
  }, [report?.gradeDistribution]);

  /* =======================================================
     RENDER
  ======================================================= */

  if (status === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-navy" />
          <p className="mt-3 text-sm text-slate-500">
            Loading academic reports...
          </p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

          <h2 className="mt-4 text-lg font-bold text-brand-navy">
            Authentication required
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please sign in to access academic reports.
          </p>
        </div>
      </div>
    );
  }

  const overview: Overview = report?.overview ?? {
    totalStudents: 0,
    totalResults: 0,
    passedResults: 0,
    failedResults: 0,
    averageScore: 0,
    passRate: 0,
  };

  const hasData =
    overview.totalResults > 0 ||
    (report?.studentPerformance?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          PREMIUM NAVY HEADER
      ====================================================== */}

      <section className="relative overflow-hidden rounded-2xl bg-brand-navy">
        <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold">
                  <FileBarChart className="h-3.5 w-3.5" />
                  Registrar • Academic Intelligence
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Academic Reports
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Monitor academic performance, grade
                  distribution, course outcomes, programme
                  performance, and student achievement.
                </p>

                {report?.filters && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {report.filters.session && (
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
                        {report.filters.session.name}
                      </span>
                    )}

                    {report.filters.semester && (
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
                        {report.filters.semester.name}
                      </span>
                    )}

                    {report.filters.programme && (
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
                        {report.filters.programme.code ||
                          report.filters.programme.name}
                      </span>
                    )}

                    {report.filters.level && (
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
                        {report.filters.level}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={loadReport}
                disabled={loadingReport}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loadingReport
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh Report
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] space-y-6 px-0 py-6 sm:px-0 lg:px-0">
        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                Unable to load report
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 transition hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ===================================================
            FILTERS
        ==================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand-gold" />

                <h2 className="text-base font-bold text-brand-navy">
                  Report Filters
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Narrow the academic report by session,
                semester, programme, or level.
              </p>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-navy/20 hover:bg-slate-50 hover:text-brand-navy"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </button>
          </div>

          {loadingFilters ? (
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading filter options...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {/* SESSION */}

              <div>
                <label
                  htmlFor="academic-session"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Academic Session
                </label>

                <div className="relative">
                  <select
                    id="academic-session"
                    value={selectedSession}
                    onChange={(event) => {
                      setSelectedSession(
                        event.target.value,
                      );
                      setSelectedSemester("");
                    }}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  >
                    <option value="">
                      All Academic Sessions
                    </option>

                    {sessions.map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* SEMESTER */}

              <div>
                <label
                  htmlFor="semester"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Semester
                </label>

                <div className="relative">
                  <select
                    id="semester"
                    value={selectedSemester}
                    onChange={(event) =>
                      setSelectedSemester(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  >
                    <option value="">
                      All Semesters
                    </option>

                    {filteredSemesters.map(
                      (item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* PROGRAMME */}

              <div>
                <label
                  htmlFor="programme"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Programme
                </label>

                <div className="relative">
                  <select
                    id="programme"
                    value={selectedProgramme}
                    onChange={(event) =>
                      setSelectedProgramme(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  >
                    <option value="">
                      All Programmes
                    </option>

                    {programmes.map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {item.code
                          ? `${item.code} — ${item.name}`
                          : item.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* LEVEL */}

              <div>
                <label
                  htmlFor="level"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Level
                </label>

                <div className="relative">
                  <select
                    id="level"
                    value={selectedLevel}
                    onChange={(event) =>
                      setSelectedLevel(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  >
                    <option value="">
                      All Levels
                    </option>

                    {levels.map((level) => (
                      <option
                        key={level}
                        value={level}
                      >
                        {level}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ===================================================
            REPORT LOADING
        ==================================================== */}

        {loadingReport && (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 shadow-sm">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-navy" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                Generating academic report...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Analysing published academic results
              </p>
            </div>
          </div>
        )}

        {!loadingReport && (
          <>
            {/* =================================================
                OVERVIEW
            ================================================== */}

            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-brand-navy">
                  Performance Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Summary of published academic results
                  matching the selected filters.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard
                  title="Students"
                  value={formatNumber(
                    overview.totalStudents,
                  )}
                  subtitle="Students in scope"
                  icon={Users}
                  iconClass="bg-blue-50 text-blue-700"
                />

                <StatCard
                  title="Results"
                  value={formatNumber(
                    overview.totalResults,
                  )}
                  subtitle="Published results"
                  icon={FileBarChart}
                  iconClass="bg-brand-gold/10 text-brand-gold"
                />

                <StatCard
                  title="Passed"
                  value={formatNumber(
                    overview.passedResults,
                  )}
                  subtitle="Scores ≥ 40%"
                  icon={CheckCircle2}
                  iconClass="bg-emerald-50 text-emerald-700"
                />

                <StatCard
                  title="Failed"
                  value={formatNumber(
                    overview.failedResults,
                  )}
                  subtitle="Scores below 40%"
                  icon={XCircle}
                  iconClass="bg-red-50 text-red-700"
                />

                <StatCard
                  title="Average"
                  value={formatScore(
                    overview.averageScore,
                  )}
                  subtitle="Overall average score"
                  icon={TrendingUp}
                  iconClass="bg-violet-50 text-violet-700"
                />

                <StatCard
                  title="Pass Rate"
                  value={formatScore(
                    overview.passRate,
                  )}
                  subtitle="Overall success rate"
                  icon={Award}
                  iconClass="bg-amber-50 text-amber-700"
                />
              </div>
            </section>

            {/* =================================================
                GRADE + SUMMARY
            ================================================== */}

            <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
              {/* GRADE DISTRIBUTION */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader
                  icon={BarChart3}
                  title="Grade Distribution"
                  description="Distribution of grades across all published results."
                />

                <div className="space-y-4">
                  {gradeData.map((item) => (
                    <div key={item.grade}>
                      <div className="mb-1.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-sm font-bold text-white">
                            {item.grade}
                          </span>

                          <span className="text-sm font-medium text-slate-700">
                            Grade {item.grade}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-brand-navy">
                            {formatNumber(
                              item.count,
                            )}
                          </span>

                          <span className="ml-2 text-xs text-slate-400">
                            (
                            {item.percentage.toFixed(
                              1,
                            )}
                            %)
                          </span>
                        </div>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-navy transition-all duration-700"
                          style={{
                            width: getPassRateWidth(
                              item.percentage,
                            ),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REPORT SNAPSHOT */}

              <div className="relative overflow-hidden rounded-2xl bg-brand-navy p-6 shadow-sm">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-gold/10" />

                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold text-brand-navy">
                    <GraduationCap className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-white">
                    Academic Snapshot
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    This report is calculated from
                    published results only. Draft results
                    are intentionally excluded.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-sm text-slate-400">
                        Average Score
                      </span>

                      <span className="font-bold text-brand-gold">
                        {formatScore(
                          overview.averageScore,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-sm text-slate-400">
                        Pass Rate
                      </span>

                      <span className="font-bold text-brand-gold">
                        {formatScore(
                          overview.passRate,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Published Results
                      </span>

                      <span className="font-bold text-white">
                        {formatNumber(
                          overview.totalResults,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                COURSE PERFORMANCE
            ================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <SectionHeader
                  icon={BookOpen}
                  title="Course Performance"
                  description="Performance analysis by individual course."
                />

                <div className="relative max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(event) =>
                      setCourseSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search course code or title..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="p-10 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    No course performance data
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    No published results match the
                    selected filters.
                  </p>
                </div>
              ) : (
                <>
                  {/* DESKTOP */}

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                          <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Course
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                            Results
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                            Passed
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                            Failed
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                            Average
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            Pass Rate
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredCourses.map(
                          (course) => (
                            <tr
                              key={`${course.code}-${course.title}`}
                              className="transition hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy text-xs font-bold text-brand-gold">
                                    {course.code
                                      ?.slice(0, 3)
                                      .toUpperCase()}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="font-semibold text-brand-navy">
                                      {course.code}
                                    </p>

                                    <p className="max-w-md truncate text-xs text-slate-500">
                                      {course.title}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4 text-center text-sm font-semibold text-slate-700">
                                {formatNumber(
                                  course.results,
                                )}
                              </td>

                              <td className="px-4 py-4 text-center text-sm font-semibold text-emerald-700">
                                {formatNumber(
                                  course.passed,
                                )}
                              </td>

                              <td className="px-4 py-4 text-center text-sm font-semibold text-red-600">
                                {formatNumber(
                                  course.failed,
                                )}
                              </td>

                              <td className="px-4 py-4 text-center">
                                <span
                                  className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${getScoreTone(
                                    course.averageScore,
                                  )}`}
                                >
                                  {formatScore(
                                    course.averageScore,
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-3">
                                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full rounded-full bg-brand-gold"
                                      style={{
                                        width:
                                          getPassRateWidth(
                                            course.passRate,
                                          ),
                                      }}
                                    />
                                  </div>

                                  <span className="w-12 text-right text-xs font-bold text-brand-navy">
                                    {formatScore(
                                      course.passRate,
                                    )}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE */}

                  <div className="divide-y divide-slate-100 md:hidden">
                    {filteredCourses.map(
                      (course) => (
                        <div
                          key={`${course.code}-${course.title}`}
                          className="p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-xs font-bold text-brand-gold">
                                {course.code
                                  ?.slice(0, 3)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold text-brand-navy">
                                  {course.code}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {course.title}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold ${getScoreTone(
                                course.averageScore,
                              )}`}
                            >
                              {formatScore(
                                course.averageScore,
                              )}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2">
                            <div className="rounded-xl bg-slate-50 p-3 text-center">
                              <p className="text-[10px] font-semibold uppercase text-slate-400">
                                Results
                              </p>

                              <p className="mt-1 font-bold text-brand-navy">
                                {formatNumber(
                                  course.results,
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-3 text-center">
                              <p className="text-[10px] font-semibold uppercase text-emerald-600">
                                Passed
                              </p>

                              <p className="mt-1 font-bold text-emerald-700">
                                {formatNumber(
                                  course.passed,
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl bg-red-50 p-3 text-center">
                              <p className="text-[10px] font-semibold uppercase text-red-500">
                                Failed
                              </p>

                              <p className="mt-1 font-bold text-red-700">
                                {formatNumber(
                                  course.failed,
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="text-slate-500">
                                Pass Rate
                              </span>

                              <span className="font-bold text-brand-navy">
                                {formatScore(
                                  course.passRate,
                                )}
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-brand-gold"
                                style={{
                                  width:
                                    getPassRateWidth(
                                      course.passRate,
                                    ),
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </>
              )}
            </section>

            {/* =================================================
                PROGRAMME PERFORMANCE
            ================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <SectionHeader
                  icon={GraduationCap}
                  title="Programme Performance"
                  description="Compare academic performance across programmes."
                />

                <div className="relative max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={programmeSearch}
                    onChange={(event) =>
                      setProgrammeSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search programme..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>
              </div>

              {filteredProgrammes.length === 0 ? (
                <div className="p-10 text-center">
                  <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    No programme data
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProgrammes.map(
                    (programme) => (
                      <div
                        key={programme.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-brand-gold/40 hover:bg-white hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wide text-brand-gold">
                              {programme.code ||
                                "PROGRAMME"}
                            </p>

                            <h3 className="mt-1 line-clamp-2 text-sm font-bold text-brand-navy">
                              {programme.name}
                            </h3>
                          </div>

                          <span
                            className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold ${getScoreTone(
                              programme.averageScore,
                            )}`}
                          >
                            {formatScore(
                              programme.averageScore,
                            )}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-[10px] uppercase text-slate-400">
                              Results
                            </p>
                            <p className="mt-1 font-bold text-brand-navy">
                              {formatNumber(
                                programme.results,
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase text-slate-400">
                              Passed
                            </p>
                            <p className="mt-1 font-bold text-emerald-700">
                              {formatNumber(
                                programme.passed,
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase text-slate-400">
                              Failed
                            </p>
                            <p className="mt-1 font-bold text-red-600">
                              {formatNumber(
                                programme.failed,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              Pass Rate
                            </span>

                            <span className="text-xs font-bold text-brand-navy">
                              {formatScore(
                                programme.passRate,
                              )}
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white">
                            <div
                              className="h-full rounded-full bg-brand-gold"
                              style={{
                                width:
                                  getPassRateWidth(
                                    programme.passRate,
                                  ),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>

            {/* =================================================
                STUDENT PERFORMANCE
            ================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <SectionHeader
                  icon={Users}
                  title="Student Performance"
                  description="Detailed academic performance for individual students."
                />

                <div className="relative max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(event) =>
                      setStudentSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search name, matric number, email..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="p-10 text-center">
                  <Users className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    No student performance data
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    No students match the current report
                    filters.
                  </p>
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE */}

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[1050px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                          <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Student
                          </th>

                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Programme
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                            Level
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                            Results
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                            Passed
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                            Failed
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                            Average
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            Pass Rate
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map(
                          (student) => (
                            <tr
                              key={student.id}
                              className="transition hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold">
                                    {(
                                      student.name ||
                                      "S"
                                    )
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="font-semibold text-brand-navy">
                                      {student.name ||
                                        "Unknown Student"}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      {student.matricNumber ||
                                        student.email ||
                                        "—"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="max-w-[220px] truncate px-4 py-4 text-sm text-slate-600">
                                {getProgrammeName(
                                  student.programme,
                                )}
                              </td>

                              <td className="px-4 py-4 text-center">
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                  {student.level ||
                                    "—"}
                                </span>
                              </td>

                              <td className="px-4 py-4 text-center text-sm font-semibold text-slate-700">
                                {formatNumber(
                                  student.results,
                                )}
                              </td>

                              <td className="px-4 py-4 text-center text-sm font-semibold text-emerald-700">
                                {formatNumber(
                                  student.passed,
                                )}
                              </td>

                              <td className="px-4 py-4 text-center text-sm font-semibold text-red-600">
                                {formatNumber(
                                  student.failed,
                                )}
                              </td>

                              <td className="px-4 py-4 text-center">
                                <span
                                  className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${getScoreTone(
                                    student.averageScore,
                                  )}`}
                                >
                                  {formatScore(
                                    student.averageScore,
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-3">
                                  <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full rounded-full bg-brand-gold"
                                      style={{
                                        width:
                                          getPassRateWidth(
                                            student.passRate,
                                          ),
                                      }}
                                    />
                                  </div>

                                  <span className="w-12 text-right text-xs font-bold text-brand-navy">
                                    {formatScore(
                                      student.passRate,
                                    )}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE CARDS */}

                  <div className="divide-y divide-slate-100 md:hidden">
                    {filteredStudents.map(
                      (student) => (
                        <div
                          key={student.id}
                          className="p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold">
                              {(
                                student.name ||
                                "S"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate font-bold text-brand-navy">
                                    {student.name ||
                                      "Unknown Student"}
                                  </p>

                                  <p className="mt-0.5 truncate text-xs text-slate-500">
                                    {student.matricNumber ||
                                      student.email ||
                                      "—"}
                                  </p>
                                </div>

                                <span
                                  className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold ${getScoreTone(
                                    student.averageScore,
                                  )}`}
                                >
                                  {formatScore(
                                    student.averageScore,
                                  )}
                                </span>
                              </div>

                              <p className="mt-2 text-xs text-slate-500">
                                {getProgrammeName(
                                  student.programme,
                                )}
                                {" • "}
                                {student.level ||
                                  "Level not specified"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2">
                            <div className="rounded-xl bg-slate-50 p-3 text-center">
                              <p className="text-[10px] uppercase text-slate-400">
                                Results
                              </p>

                              <p className="mt-1 font-bold text-brand-navy">
                                {formatNumber(
                                  student.results,
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-3 text-center">
                              <p className="text-[10px] uppercase text-emerald-600">
                                Passed
                              </p>

                              <p className="mt-1 font-bold text-emerald-700">
                                {formatNumber(
                                  student.passed,
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl bg-red-50 p-3 text-center">
                              <p className="text-[10px] uppercase text-red-500">
                                Failed
                              </p>

                              <p className="mt-1 font-bold text-red-700">
                                {formatNumber(
                                  student.failed,
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="text-slate-500">
                                Pass Rate
                              </span>

                              <span className="font-bold text-brand-navy">
                                {formatScore(
                                  student.passRate,
                                )}
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-brand-gold"
                                style={{
                                  width:
                                    getPassRateWidth(
                                      student.passRate,
                                    ),
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </>
              )}
            </section>

            {/* =================================================
                EMPTY REPORT STATE
            ================================================== */}

            {!hasData && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <FileBarChart className="h-7 w-7 text-slate-400" />
                </div>

                <h3 className="mt-4 text-base font-bold text-brand-navy">
                  No published results found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  There are no published academic results
                  matching the selected filters. Try
                  removing some filters or publish results
                  first.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}