"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Loader2,
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

type AcademicSession = {
  _id: string;
  name: string;
};

type Semester = {
  _id: string;
  name: string;
  order?: number;
  session?: string;
};

type Programme = {
  _id: string;
  name: string;
  code: string;
};

type ReportFilters = {
  session: AcademicSession | null;
  semester: Semester | null;
  programme: Programme | null;
  level: string | null;
};

type Overview = {
  totalStudents: number;
  totalResults: number;
  passedResults: number;
  failedResults: number;
  averageScore: number;
  passRate: number;
};

type GradeDistribution = {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
};

type CoursePerformance = {
  code: string;
  title: string;
  results: number;
  passed: number;
  failed: number;
  averageScore: number;
  passRate: number;
};

type ProgrammePerformance = {
  id: string;
  name: string;
  code: string;
  results: number;
  passed: number;
  failed: number;
  averageScore: number;
  passRate: number;
};

type StudentPerformance = {
  id: string;
  name: string;
  email?: string;
  matricNumber?: string;
  level?: string;
  programme?: string;
  results: number;
  passed: number;
  failed: number;
  averageScore: number;
  passRate: number;
};

type AcademicReportResponse = {
  success: boolean;
  message?: string;
  filters?: ReportFilters;
  overview?: Overview;
  gradeDistribution?: GradeDistribution;
  coursePerformance?: CoursePerformance[];
  programmePerformance?: ProgrammePerformance[];
  studentPerformance?: StudentPerformance[];
};

type SessionsResponse = {
  success: boolean;
  sessions?: AcademicSession[];
  message?: string;
};

type SemestersResponse = {
  success: boolean;
  semesters?: Semester[];
  message?: string;
};

type ProgrammesResponse = {
  success: boolean;
  programmes?: Programme[];
  message?: string;
};

/* =========================================================
   LEVELS
========================================================= */

const LEVELS = ["ND 1", "ND 2", "HND 1", "HND 2"];

/* =========================================================
   HELPERS
========================================================= */

function getScoreClass(score: number) {
  const value = Number(score) || 0;

  if (value >= 70) return "text-emerald-600";
  if (value >= 50) return "text-brand-navy";
  if (value >= 40) return "text-amber-600";

  return "text-red-600";
}

function getPassRateClass(passRate: number) {
  const value = Number(passRate) || 0;

  if (value >= 70) return "text-emerald-600";
  if (value >= 40) return "text-amber-600";

  return "text-red-600";
}

function getGradeClass(grade: keyof GradeDistribution) {
  if (grade === "A") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (grade === "F") {
    return "bg-red-50 text-red-700";
  }

  if (grade === "D" || grade === "E") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-brand-navy/10 text-brand-navy";
}

function formatPercent(value: number) {
  return `${(Number(value) || 0).toFixed(1)}%`;
}

function clampPercent(value: number) {
  return Math.min(Math.max(Number(value) || 0, 0), 100);
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminAcademicReportsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  /*
   * The project normally has accessToken on the NextAuth
   * session. The fallback typing here prevents this page
   * from breaking if the Session interface has not yet
   * been augmented in this file.
   */
  const accessToken =
    typeof (
      session as
        | {
            accessToken?: unknown;
          }
        | null
    )?.accessToken === "string"
      ? String(
          (
            session as
              | {
                  accessToken?: unknown;
                }
              | null
          )?.accessToken,
        ).trim() || null
      : null;

  /* =======================================================
     STATE
  ======================================================= */

  const [sessions, setSessions] = useState<AcademicSession[]>(
    [],
  );

  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [programmes, setProgrammes] = useState<Programme[]>(
    [],
  );

  const [selectedSession, setSelectedSession] =
    useState("");

  const [selectedSemester, setSelectedSemester] =
    useState("");

  const [selectedProgramme, setSelectedProgramme] =
    useState("");

  const [selectedLevel, setSelectedLevel] =
    useState("");

  const [report, setReport] =
    useState<AcademicReportResponse | null>(null);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [loadingFilters, setLoadingFilters] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /*
   * Used to prevent an older request from replacing
   * a newer request.
   */
  const requestIdRef = useRef(0);

  /*
   * Ensures the initial report is requested only once
   * for the current authenticated page session.
   */
  const initialReportLoadedRef = useRef(false);

  /* =======================================================
     LOAD FILTER DATA
  ======================================================= */

  const loadFilterData = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      setLoadingFilters(true);

      const [
        sessionsResponse,
        programmesResponse,
      ] = await Promise.all([
        apiGet<SessionsResponse>(
          "/academic-sessions",
          accessToken,
        ),

        apiGet<ProgrammesResponse>(
          "/programmes",
          accessToken,
        ),
      ]);

      if (
        sessionsResponse?.success &&
        Array.isArray(sessionsResponse.sessions)
      ) {
        setSessions(sessionsResponse.sessions);
      } else {
        setSessions([]);
      }

      if (
        programmesResponse?.success &&
        Array.isArray(programmesResponse.programmes)
      ) {
        setProgrammes(
          programmesResponse.programmes,
        );
      } else {
        setProgrammes([]);
      }
    } catch (error) {
      console.error(
        "Load academic report filters error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load report filters.",
      );
    } finally {
      setLoadingFilters(false);
    }
  }, [accessToken]);

  /* =======================================================
     LOAD SEMESTERS
  ======================================================= */

  const loadSemesters = useCallback(
    async (sessionId: string) => {
      if (!accessToken || !sessionId) {
        setSemesters([]);
        return;
      }

      try {
        const query = `?session=${encodeURIComponent(
          sessionId,
        )}`;

        const response =
          await apiGet<SemestersResponse>(
            `/semesters${query}`,
            accessToken,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to load semesters.",
          );
        }

        setSemesters(
          Array.isArray(response.semesters)
            ? response.semesters
            : [],
        );
      } catch (error) {
        console.error(
          "Load semesters error:",
          error,
        );

        setSemesters([]);

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load semesters.",
        );
      }
    },
    [accessToken],
  );

  /* =======================================================
     BUILD REPORT QUERY
  ======================================================= */

  const buildReportQuery = useCallback(() => {
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

    return query ? `?${query}` : "";
  }, [
    selectedSession,
    selectedSemester,
    selectedProgramme,
    selectedLevel,
  ]);

  /* =======================================================
     LOAD REPORT
  ======================================================= */

  const loadReport = useCallback(
    async ({
      refresh = false,
      initial = false,
    }: {
      refresh?: boolean;
      initial?: boolean;
    } = {}) => {
      if (!accessToken) {
        setInitialLoading(false);
        setGenerating(false);
        setRefreshing(false);

        return;
      }

      const currentRequestId =
        ++requestIdRef.current;

      try {
        setErrorMessage(null);

        if (initial) {
          setInitialLoading(true);
        } else if (refresh) {
          setRefreshing(true);
        } else {
          setGenerating(true);
        }

        const response =
          await apiGet<AcademicReportResponse>(
            `/academic-reports${buildReportQuery()}`,
            accessToken,
          );

        /*
         * Ignore the response if another request has
         * already started.
         */
        if (
          currentRequestId !==
          requestIdRef.current
        ) {
          return;
        }

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to generate academic report.",
          );
        }

        setReport(response);
        setErrorMessage(null);
      } catch (error) {
        if (
          currentRequestId !==
          requestIdRef.current
        ) {
          return;
        }

        console.error(
          "Load academic report error:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Unable to generate academic report.";

        setErrorMessage(message);

        toast.error(message);
      } finally {
        if (
          currentRequestId ===
          requestIdRef.current
        ) {
          setInitialLoading(false);
          setGenerating(false);
          setRefreshing(false);
        }
      }
    },
    [accessToken, buildReportQuery],
  );

  /* =======================================================
     AUTH TERMINAL STATE
  ======================================================= */

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (
      sessionStatus !== "authenticated" ||
      !accessToken
    ) {
      setInitialLoading(false);
      setLoadingFilters(false);
      setGenerating(false);
      setRefreshing(false);
    }
  }, [sessionStatus, accessToken]);

  /* =======================================================
     LOAD FILTER DATA
  ======================================================= */

  useEffect(() => {
    if (
      sessionStatus !== "authenticated" ||
      !accessToken
    ) {
      return;
    }

    void loadFilterData();
  }, [
    sessionStatus,
    accessToken,
    loadFilterData,
  ]);

  /* =======================================================
     INITIAL REPORT
  ======================================================= */

  useEffect(() => {
    if (
      sessionStatus !== "authenticated" ||
      !accessToken ||
      initialReportLoadedRef.current
    ) {
      return;
    }

    initialReportLoadedRef.current = true;

    void loadReport({
      initial: true,
    });
  }, [
    sessionStatus,
    accessToken,
    loadReport,
  ]);

  /* =======================================================
     SESSION CHANGE
  ======================================================= */

  useEffect(() => {
    if (!selectedSession) {
      setSemesters([]);
      setSelectedSemester("");
      return;
    }

    setSelectedSemester("");

    void loadSemesters(selectedSession);
  }, [
    selectedSession,
    loadSemesters,
  ]);

  /* =======================================================
     REPORT DATA
  ======================================================= */

  const overview: Overview =
    report?.overview ?? {
      totalStudents: 0,
      totalResults: 0,
      passedResults: 0,
      failedResults: 0,
      averageScore: 0,
      passRate: 0,
    };

  const gradeDistribution =
    report?.gradeDistribution ?? {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
    };

  const coursePerformance =
    Array.isArray(report?.coursePerformance)
      ? report.coursePerformance
      : [];

  const programmePerformance =
    Array.isArray(
      report?.programmePerformance,
    )
      ? report.programmePerformance
      : [];

  const studentPerformance =
    Array.isArray(report?.studentPerformance)
      ? report.studentPerformance
      : [];

  /* =======================================================
     TOTAL GRADES
  ======================================================= */

  const totalGrades = useMemo(() => {
    return Object.values(
      gradeDistribution,
    ).reduce(
      (sum, value) =>
        sum + (Number(value) || 0),
      0,
    );
  }, [gradeDistribution]);

  /* =======================================================
     TOP STUDENTS
  ======================================================= */

  const topStudents = useMemo(() => {
    return [...studentPerformance]
      .sort(
        (a, b) =>
          (Number(b.averageScore) || 0) -
          (Number(a.averageScore) || 0),
      )
      .slice(0, 10);
  }, [studentPerformance]);

  /* =======================================================
     AUTH LOADING
  ======================================================= */

  if (sessionStatus === "loading") {
    return (
      <LoadingState message="Checking your session..." />
    );
  }

  /* =======================================================
     AUTH ERROR
  ======================================================= */

  if (
    sessionStatus !== "authenticated" ||
    !accessToken
  ) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center px-4">
        <Card className="w-full border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-brand-dark">
              Authentication required
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your session could not be authenticated.
              Please sign in again to access academic
              reports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =======================================================
     INITIAL REPORT LOADING
  ======================================================= */

  if (initialLoading && !report) {
    return (
      <LoadingState message="Generating academic report..." />
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (errorMessage && !report) {
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
                void loadReport({
                  refresh: true,
                })
              }
              disabled={refreshing}
              className="mt-6 rounded-xl bg-brand-navy text-white hover:bg-brand-navy/95"
            >
              {refreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      {/* HERO */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-brand-gold" />

                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Academic Intelligence
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Academic Reports
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-[15px]">
                Analyze student performance, grade
                distribution, course outcomes, and
                programme performance from published
                academic results.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void loadReport({
                  refresh: true,
                })
              }
              disabled={refreshing || generating}
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
                : "Refresh Report"}
            </Button>
          </div>
        </div>
      </section>

      {/* FILTERS */}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/10">
              <Search className="h-4 w-4 text-brand-navy" />
            </div>

            <div>
              <CardTitle className="text-base font-semibold text-brand-dark">
                Report Filters
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                Select an academic period or programme
                to narrow the report.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {/* SESSION */}

            <FilterField label="Academic Session">
              <select
                value={selectedSession}
                onChange={(event) =>
                  setSelectedSession(
                    event.target.value,
                  )
                }
                disabled={loadingFilters}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  All Sessions
                </option>

                {sessions.map(
                  (academicSession) => (
                    <option
                      key={academicSession._id}
                      value={academicSession._id}
                    >
                      {academicSession.name}
                    </option>
                  ),
                )}
              </select>
            </FilterField>

            {/* SEMESTER */}

            <FilterField label="Semester">
              <select
                value={selectedSemester}
                onChange={(event) =>
                  setSelectedSemester(
                    event.target.value,
                  )
                }
                disabled={
                  loadingFilters ||
                  (!!selectedSession &&
                    semesters.length === 0)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  All Semesters
                </option>

                {semesters.map((semester) => (
                  <option
                    key={semester._id}
                    value={semester._id}
                  >
                    {semester.name}
                  </option>
                ))}
              </select>
            </FilterField>

            {/* PROGRAMME */}

            <FilterField label="Programme">
              <select
                value={selectedProgramme}
                onChange={(event) =>
                  setSelectedProgramme(
                    event.target.value,
                  )
                }
                disabled={loadingFilters}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  All Programmes
                </option>

                {programmes.map((programme) => (
                  <option
                    key={programme._id}
                    value={programme._id}
                  >
                    {programme.code} —{" "}
                    {programme.name}
                  </option>
                ))}
              </select>
            </FilterField>

            {/* LEVEL */}

            <FilterField label="Level">
              <select
                value={selectedLevel}
                onChange={(event) =>
                  setSelectedLevel(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
              >
                <option value="">
                  All Levels
                </option>

                {LEVELS.map((level) => (
                  <option
                    key={level}
                    value={level}
                  >
                    {level}
                  </option>
                ))}
              </select>
            </FilterField>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {selectedSession && (
              <FilterBadge>
                Session selected
              </FilterBadge>
            )}

            {selectedSemester && (
              <FilterBadge>
                Semester selected
              </FilterBadge>
            )}

            {selectedProgramme && (
              <FilterBadge>
                Programme selected
              </FilterBadge>
            )}

            {selectedLevel && (
              <FilterBadge>
                {selectedLevel}
              </FilterBadge>
            )}

            {!selectedSession &&
              !selectedSemester &&
              !selectedProgramme &&
              !selectedLevel && (
                <span>
                  Showing overall published academic
                  performance.
                </span>
              )}
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              onClick={() =>
                void loadReport()
              }
              disabled={
                generating ||
                refreshing
              }
              className="rounded-xl bg-brand-navy text-white hover:bg-brand-navy/95"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ACTIVE REPORT */}

      <Card className="border-slate-200 bg-slate-50/50 shadow-none">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Current Report
              </p>

              <h2 className="mt-1 text-lg font-bold text-brand-dark">
                {[
                  report?.filters?.session?.name,
                  report?.filters?.semester?.name,
                  report?.filters?.programme?.name,
                  report?.filters?.level,
                ]
                  .filter(Boolean)
                  .join(" • ") ||
                  "Overall Academic Performance"}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Published results only
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OVERVIEW */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard
          title="Students"
          value={overview.totalStudents}
          description="Students in selected scope"
          icon={
            <Users className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-brand-navy/10"
        />

        <ReportStatCard
          title="Results"
          value={overview.totalResults}
          description="Published result records"
          icon={
            <ClipboardList className="h-5 w-5 text-brand-gold" />
          }
          iconClass="bg-brand-gold/10"
        />

        <ReportStatCard
          title="Average Score"
          value={(
            Number(overview.averageScore) || 0
          ).toFixed(1)}
          description="Overall average performance"
          icon={
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          }
          iconClass="bg-emerald-50"
          valueClass={getScoreClass(
            overview.averageScore,
          )}
        />

        <ReportStatCard
          title="Pass Rate"
          value={formatPercent(
            overview.passRate,
          )}
          description={`${overview.passedResults} passed • ${overview.failedResults} failed`}
          icon={
            <GraduationCap className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-slate-100"
          valueClass={getPassRateClass(
            overview.passRate,
          )}
        />
      </div>

      {/* PERFORMANCE + GRADE DISTRIBUTION */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PASS / FAIL */}

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-base text-brand-dark">
              <TrendingUp className="h-4 w-4 text-brand-navy" />
              Overall Performance
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[18px] border-slate-100">
                <div className="text-center">
                  <p className="text-3xl font-bold text-brand-dark">
                    {formatPercent(
                      overview.passRate,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Pass Rate
                  </p>
                </div>

                <div
                  className="absolute inset-[-18px] rounded-full border-[18px] border-transparent"
                  style={{
                    borderTopColor:
                      "currentColor",
                    color:
                      overview.passRate >= 70
                        ? "#059669"
                        : overview.passRate >= 40
                          ? "#d97706"
                          : "#dc2626",
                    transform: `rotate(${
                      -45 +
                      clampPercent(
                        overview.passRate,
                      ) *
                        3.6
                    }deg)`,
                  }}
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-700">
                    Passed
                  </span>

                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>

                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {overview.passedResults}
                </p>

                <p className="mt-1 text-[11px] text-emerald-600/70">
                  Results
                </p>
              </div>

              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-red-700">
                    Failed
                  </span>

                  <XCircle className="h-4 w-4 text-red-600" />
                </div>

                <p className="mt-2 text-2xl font-bold text-red-700">
                  {overview.failedResults}
                </p>

                <p className="mt-1 text-[11px] text-red-600/70">
                  Results
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GRADE DISTRIBUTION */}

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-base text-brand-dark">
              <BarChart3 className="h-4 w-4 text-brand-gold" />
              Grade Distribution
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-4">
              {(
                Object.keys(
                  gradeDistribution,
                ) as Array<
                  keyof GradeDistribution
                >
              ).map((grade) => {
                const count =
                  Number(
                    gradeDistribution[grade],
                  ) || 0;

                const percentage =
                  totalGrades > 0
                    ? (count / totalGrades) * 100
                    : 0;

                return (
                  <div
                    key={grade}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${getGradeClass(
                        grade,
                      )}`}
                    >
                      {grade}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-slate-600">
                          {count} result
                          {count === 1
                            ? ""
                            : "s"}
                        </span>

                        <span className="text-xs font-semibold text-brand-dark">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-navy transition-all"
                          style={{
                            width: `${Math.min(
                              percentage,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* COURSE PERFORMANCE */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-brand-dark">
                <BookOpen className="h-4 w-4 text-brand-navy" />
                Course Performance
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                Performance summary for each course
                represented in the report.
              </p>
            </div>

            <span className="rounded-full bg-brand-navy/10 px-2.5 py-1 text-[11px] font-semibold text-brand-navy">
              {coursePerformance.length} courses
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {coursePerformance.length === 0 ? (
            <EmptyReport
              icon={
                <BookOpen className="h-6 w-6 text-brand-navy" />
              }
              title="No course performance data"
              description="There are no published results for the selected filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <TableHeading>
                      Course
                    </TableHeading>

                    <TableHeading>
                      Results
                    </TableHeading>

                    <TableHeading>
                      Average
                    </TableHeading>

                    <TableHeading>
                      Passed
                    </TableHeading>

                    <TableHeading>
                      Failed
                    </TableHeading>

                    <TableHeading>
                      Pass Rate
                    </TableHeading>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {coursePerformance.map(
                    (course) => (
                      <tr
                        key={course.code}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-brand-dark">
                            {course.code}
                          </p>

                          <p className="mt-0.5 max-w-[300px] truncate text-xs text-slate-500">
                            {course.title}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {course.results}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-bold ${getScoreClass(
                              course.averageScore,
                            )}`}
                          >
                            {(
                              Number(
                                course.averageScore,
                              ) || 0
                            ).toFixed(1)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-emerald-600">
                            {course.passed}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-red-600">
                            {course.failed}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-brand-navy"
                                style={{
                                  width: `${clampPercent(
                                    course.passRate,
                                  )}%`,
                                }}
                              />
                            </div>

                            <span
                              className={`text-xs font-semibold ${getPassRateClass(
                                course.passRate,
                              )}`}
                            >
                              {formatPercent(
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
          )}
        </CardContent>
      </Card>

      {/* PROGRAMME PERFORMANCE */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div>
            <CardTitle className="flex items-center gap-2 text-base text-brand-dark">
              <GraduationCap className="h-4 w-4 text-brand-gold" />
              Programme Performance
            </CardTitle>

            <p className="mt-1 text-xs text-slate-500">
              Compare academic performance across
              programmes.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {programmePerformance.length === 0 ? (
            <EmptyReport
              icon={
                <GraduationCap className="h-6 w-6 text-brand-navy" />
              }
              title="No programme performance data"
              description="There are no programme-level results for the selected filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <TableHeading>
                      Programme
                    </TableHeading>

                    <TableHeading>
                      Results
                    </TableHeading>

                    <TableHeading>
                      Average
                    </TableHeading>

                    <TableHeading>
                      Passed
                    </TableHeading>

                    <TableHeading>
                      Failed
                    </TableHeading>

                    <TableHeading>
                      Pass Rate
                    </TableHeading>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {programmePerformance.map(
                    (programme) => (
                      <tr
                        key={programme.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-brand-dark">
                            {programme.code}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {programme.name}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {programme.results}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-bold ${getScoreClass(
                              programme.averageScore,
                            )}`}
                          >
                            {(
                              Number(
                                programme.averageScore,
                              ) || 0
                            ).toFixed(1)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                          {programme.passed}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-red-600">
                          {programme.failed}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-bold ${getPassRateClass(
                              programme.passRate,
                            )}`}
                          >
                            {formatPercent(
                              programme.passRate,
                            )}
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

      {/* TOP STUDENTS */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div>
            <CardTitle className="flex items-center gap-2 text-base text-brand-dark">
              <Users className="h-4 w-4 text-brand-navy" />
              Student Performance
            </CardTitle>

            <p className="mt-1 text-xs text-slate-500">
              Students ranked by average score within
              the selected report scope.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {topStudents.length === 0 ? (
            <EmptyReport
              icon={
                <Users className="h-6 w-6 text-brand-navy" />
              }
              title="No student performance data"
              description="There are no published student results for the selected filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <TableHeading>
                      Student
                    </TableHeading>

                    <TableHeading>
                      Level
                    </TableHeading>

                    <TableHeading>
                      Results
                    </TableHeading>

                    <TableHeading>
                      Average
                    </TableHeading>

                    <TableHeading>
                      Passed
                    </TableHeading>

                    <TableHeading>
                      Failed
                    </TableHeading>

                    <TableHeading>
                      Pass Rate
                    </TableHeading>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {topStudents.map(
                    (student, index) => (
                      <tr
                        key={student.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/10 text-xs font-bold text-brand-navy">
                              {index + 1}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-brand-dark">
                                {student.name}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {student.matricNumber ||
                                  student.email ||
                                  "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {student.level || "—"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {student.results}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-bold ${getScoreClass(
                              student.averageScore,
                            )}`}
                          >
                            {(
                              Number(
                                student.averageScore,
                              ) || 0
                            ).toFixed(1)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                          {student.passed}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-red-600">
                          {student.failed}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-bold ${getPassRateClass(
                              student.passRate,
                            )}`}
                          >
                            {formatPercent(
                              student.passRate,
                            )}
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
   LOADING STATE
========================================================= */

function LoadingState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-[500px] items-center justify-center px-4">
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
   FILTER FIELD
========================================================= */

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   FILTER BADGE
========================================================= */

function FilterBadge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="rounded-full bg-brand-navy/5 px-2.5 py-1 font-medium text-brand-navy">
      {children}
    </span>
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
    <Card className="group overflow-hidden border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
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
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   EMPTY REPORT
========================================================= */

function EmptyReport({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/10">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-brand-dark">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   TABLE HEADING
========================================================= */

function TableHeading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

