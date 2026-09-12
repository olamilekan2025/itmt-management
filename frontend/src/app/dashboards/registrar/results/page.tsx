"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";

import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";

import {
  apiGet,
  apiPatch,
} from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface PopulatedStudent {
  _id?: string;
  name?: string;
  email?: string;
  matricNumber?: string;
}

interface PopulatedCourse {
  _id?: string;
  code?: string;
  title?: string;
  creditUnits?: number;
}

interface PopulatedSemester {
  _id?: string;
  name?: string;
  order?: number;
}

interface PopulatedLecturer {
  _id?: string;
  name?: string;
  email?: string;
}

interface Result {
  _id: string;

  student:
    | PopulatedStudent
    | string
    | null
    | undefined;

  course:
    | PopulatedCourse
    | string
    | null
    | undefined;

  semester:
    | PopulatedSemester
    | string
    | null
    | undefined;

  lecturer:
    | PopulatedLecturer
    | string
    | null
    | undefined;

  score: number;

  grade:
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | "F";

  status:
    | "draft"
    | "published";

  createdAt?: string;
  updatedAt?: string;
}

interface ResultStatistics {
  total: number;
  draft: number;
  published: number;
  passed: number;
  failed: number;
}

interface Course {
  _id: string;
  code: string;
  title: string;
  creditUnits?: number;
}

interface Semester {
  _id: string;
  name: string;
  order?: number;
}

interface ResultsResponse {
  success: boolean;
  results: Result[];
  statistics?: ResultStatistics;
}

interface CoursesResponse {
  success?: boolean;
  courses?: Course[];
  data?: Course[];
}

interface SemestersResponse {
  success?: boolean;
  semesters?: Semester[];
  data?: Semester[];
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getStudent(
  result: Result,
): PopulatedStudent {
  const student = result.student;

  if (
    !student ||
    typeof student === "string"
  ) {
    return {};
  }

  return student;
}

function getCourse(
  result: Result,
): PopulatedCourse {
  const course = result.course;

  if (
    !course ||
    typeof course === "string"
  ) {
    return {};
  }

  return course;
}

function getSemester(
  result: Result,
): PopulatedSemester {
  const semester = result.semester;

  if (
    !semester ||
    typeof semester === "string"
  ) {
    return {};
  }

  return semester;
}

function getLecturer(
  result: Result,
): PopulatedLecturer {
  const lecturer = result.lecturer;

  if (
    !lecturer ||
    typeof lecturer === "string"
  ) {
    return {};
  }

  return lecturer;
}

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

/* =========================================================
   PAGE
========================================================= */

export default function RegistrarResultsPage() {
  const {
    data: session,
    status,
  } = useSession();

  const accessToken =
    session?.accessToken as
      | string
      | undefined;

  const [results, setResults] =
    useState<Result[]>([]);

  const [statistics, setStatistics] =
    useState<ResultStatistics>({
      total: 0,
      draft: 0,
      published: 0,
      passed: 0,
      failed: 0,
    });

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [semesters, setSemesters] =
    useState<Semester[]>([]);

  const [search, setSearch] =
    useState("");

  const [semesterFilter, setSemesterFilter] =
    useState("");

  const [courseFilter, setCourseFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "" | "draft" | "published"
    >("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [actionModal, setActionModal] =
    useState<
      | "publish"
      | "unpublish"
      | null
    >(null);

  /* =======================================================
     STATISTICS FALLBACK
  ====================================================== */

  const calculateStatistics = useCallback(
    (items: Result[]) => {
      setStatistics({
        total: items.length,

        draft: items.filter(
          (item) =>
            item.status === "draft",
        ).length,

        published: items.filter(
          (item) =>
            item.status === "published",
        ).length,

        passed: items.filter(
          (item) =>
            Number(item.score) >= 40,
        ).length,

        failed: items.filter(
          (item) =>
            Number(item.score) < 40,
        ).length,
      });
    },
    [],
  );

  /* =======================================================
     LOAD COURSES
  ====================================================== */

  const loadCourses =
    useCallback(async () => {
      if (!accessToken) {
        return;
      }

      try {
        const response =
          (await apiGet(
            "/courses?status=active",
            accessToken,
          )) as CoursesResponse | Course[];

        let data: Course[] = [];

        if (Array.isArray(response)) {
          data = response;
        } else if (
          Array.isArray(
            response?.courses,
          )
        ) {
          data = response.courses;
        } else if (
          Array.isArray(
            response?.data,
          )
        ) {
          data = response.data;
        }

        setCourses(data);
      } catch (err) {
        console.error(
          "Load courses error:",
          err,
        );
      }
    }, [accessToken]);

  /* =======================================================
     LOAD SEMESTERS
  ====================================================== */

  const loadSemesters =
    useCallback(async () => {
      if (!accessToken) {
        return;
      }

      try {
        const response =
          (await apiGet(
            "/semesters",
            accessToken,
          )) as
            | SemestersResponse
            | Semester[];

        let data: Semester[] = [];

        if (Array.isArray(response)) {
          data = response;
        } else if (
          Array.isArray(
            response?.semesters,
          )
        ) {
          data = response.semesters;
        } else if (
          Array.isArray(
            response?.data,
          )
        ) {
          data = response.data;
        }

        setSemesters(data);
      } catch (err) {
        console.error(
          "Load semesters error:",
          err,
        );
      }
    }, [accessToken]);

  /* =======================================================
     LOAD RESULTS
  ====================================================== */

  const loadResults =
    useCallback(
      async (
        showRefresh = false,
      ) => {
        if (!accessToken) {
          return;
        }

        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const params =
            new URLSearchParams();

          if (courseFilter) {
            params.set(
              "course",
              courseFilter,
            );
          }

          if (semesterFilter) {
            params.set(
              "semester",
              semesterFilter,
            );
          }

          if (statusFilter) {
            params.set(
              "status",
              statusFilter,
            );
          }

          const query =
            params.toString();

          const response =
            (await apiGet(
              `/results${
                query
                  ? `?${query}`
                  : ""
              }`,
              accessToken,
            )) as ResultsResponse;

          if (
            !response ||
            !response.success
          ) {
            throw new Error(
              "Unable to load results.",
            );
          }

          const loadedResults =
            Array.isArray(
              response.results,
            )
              ? response.results
              : [];

          setResults(
            loadedResults,
          );

          if (
            response.statistics
          ) {
            setStatistics(
              response.statistics,
            );
          } else {
            calculateStatistics(
              loadedResults,
            );
          }
        } catch (err) {
          console.error(
            "Load results error:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load results.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        accessToken,
        courseFilter,
        semesterFilter,
        statusFilter,
        calculateStatistics,
      ],
    );

  /* =======================================================
     INITIAL LOAD
  ====================================================== */

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !accessToken
    ) {
      return;
    }

    void loadCourses();
    void loadSemesters();
  }, [
    status,
    accessToken,
    loadCourses,
    loadSemesters,
  ]);

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !accessToken
    ) {
      return;
    }

    void loadResults();
  }, [
    status,
    accessToken,
    loadResults,
  ]);

  /* =======================================================
     FILTERED RESULTS
  ====================================================== */

  const filteredResults =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return results;
      }

      return results.filter(
        (result) => {
          const student =
            getStudent(result);

          const course =
            getCourse(result);

          const semester =
            getSemester(result);

          const lecturer =
            getLecturer(result);

          const searchable = [
            student.name,
            student.email,
            student.matricNumber,
            course.code,
            course.title,
            semester.name,
            lecturer.name,
            lecturer.email,
            result.grade,
            result.status,
            String(result.score),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query,
          );
        },
      );
    }, [
      results,
      search,
    ]);

  /* =======================================================
     SELECTED COURSE / SEMESTER
  ====================================================== */

  const selectedCourse =
    courses.find(
      (course) =>
        course._id ===
        courseFilter,
    );

  const selectedSemester =
    semesters.find(
      (semester) =>
        semester._id ===
        semesterFilter,
    );

  const selectedGroupHasDrafts =
    results.some(
      (result) =>
        result.status ===
        "draft",
    );

  const selectedGroupHasPublished =
    results.some(
      (result) =>
        result.status ===
        "published",
    );

  /* =======================================================
     STATUS ACTION
  ====================================================== */

  const handleStatusAction =
    async () => {
      if (
        !accessToken ||
        !actionModal
      ) {
        return;
      }

      if (
        !courseFilter ||
        !semesterFilter
      ) {
        setError(
          "Please select both a course and semester before continuing.",
        );

        setActionModal(null);

        return;
      }

      try {
        setActionLoading(true);
        setError("");
        setSuccess("");

        const endpoint =
          actionModal ===
          "publish"
            ? "/results/publish"
            : "/results/unpublish";

        const response =
          (await apiPatch(
            endpoint,
            {
              course:
                courseFilter,
              semester:
                semesterFilter,
            },
            accessToken,
          )) as ActionResponse;

        if (
          !response ||
          !response.success
        ) {
          throw new Error(
            response?.message ??
              "Unable to update result status.",
          );
        }

        setSuccess(
          response.message ??
            (actionModal ===
            "publish"
              ? "Results published successfully."
              : "Results moved back to draft successfully."),
        );

        setActionModal(null);

        await loadResults(true);
      } catch (err) {
        console.error(
          "Result status action error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to update result status.",
        );
      } finally {
        setActionLoading(false);
      }
    };

  /* =======================================================
     AUTH LOADING
  ====================================================== */

  if (
    status === "loading"
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-lg shadow-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Loading result management...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ====================================================== */

  return (
    <div className="min-h-full bg-[#f6f8fb]">
      {/* ===================================================
          PREMIUM NAVY PAGE HEADER
      ================================================== */}

      <section className="relative overflow-hidden rounded-2xl bg-brand-navy">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-brand-blue/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10">
                  <ShieldCheck className="h-4 w-4 text-brand-gold" />
                </div>

                <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Academic Administration
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[34px]">
                Result Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Review, monitor, publish and
                manage student academic
                results from one central
                workspace.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 sm:flex">
                <BarChart3 className="h-4 w-4 text-brand-gold" />

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Records
                  </p>

                  <p className="text-sm font-bold text-white">
                    {statistics.total.toLocaleString(
                      "en-NG",
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadResults(true)
                }
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:border-brand-gold/40 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                <span className="hidden sm:inline">
                  Refresh Results
                </span>

                <span className="sm:hidden">
                  Refresh
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-0 py-6 sm:px-0 lg:px-0">
        {/* =================================================
            FEEDBACK
        ================================================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <AlertCircle className="h-4 w-4" />
              </div>

              <p className="flex-1 pt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="rounded-lg p-1.5 transition hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700 shadow-sm"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
              </div>

              <p className="flex-1 pt-1">
                {success}
              </p>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
                className="rounded-lg p-1.5 transition hover:bg-emerald-100"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            STATISTICS
        ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Results"
            value={statistics.total}
            icon={BarChart3}
            description="All result records"
          />

          <StatCard
            title="Draft"
            value={statistics.draft}
            icon={Clock3}
            description="Awaiting publication"
          />

          <StatCard
            title="Published"
            value={
              statistics.published
            }
            icon={CheckCircle2}
            description="Visible to students"
          />

          <StatCard
            title="Passed"
            value={statistics.passed}
            icon={GraduationCap}
            description="Score of 40 and above"
          />

          <StatCard
            title="Failed"
            value={statistics.failed}
            icon={XCircle}
            description="Score below 40"
          />
        </div>

        {/* =================================================
            FILTER PANEL
        ================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy">
                  <BookOpen className="h-4.5 w-4.5 text-brand-gold" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-brand-navy">
                    Result Filters
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Refine results by academic
                    structure and publication
                    status.
                  </p>
                </div>
              </div>

              {(search ||
                courseFilter ||
                semesterFilter ||
                statusFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCourseFilter("");
                    setSemesterFilter("");
                    setStatusFilter("");
                  }}
                  className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-brand-navy sm:inline-flex"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {/* SEARCH */}

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search student, matric, course..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
                />
              </div>

              {/* SEMESTER */}

              <SelectField
                value={
                  semesterFilter
                }
                onChange={
                  setSemesterFilter
                }
                placeholder="All semesters"
                options={semesters.map(
                  (semester) => ({
                    value:
                      semester._id,
                    label:
                      semester.name,
                  }),
                )}
              />

              {/* COURSE */}

              <SelectField
                value={
                  courseFilter
                }
                onChange={
                  setCourseFilter
                }
                placeholder="All courses"
                options={courses.map(
                  (course) => ({
                    value:
                      course._id,
                    label: `${course.code} — ${course.title}`,
                  }),
                )}
              />

              {/* STATUS */}

              <SelectField
                value={
                  statusFilter
                }
                onChange={(value) =>
                  setStatusFilter(
                    value as
                      | ""
                      | "draft"
                      | "published",
                  )
                }
                placeholder="All statuses"
                options={[
                  {
                    value: "draft",
                    label: "Draft",
                  },
                  {
                    value:
                      "published",
                    label: "Published",
                  },
                ]}
              />
            </div>

            <div className="mt-3 sm:hidden">
              {(search ||
                courseFilter ||
                semesterFilter ||
                statusFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCourseFilter("");
                    setSemesterFilter("");
                    setStatusFilter("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            PUBLISHING CONTROL
        ================================================== */}

        <section className="relative mt-5 overflow-hidden rounded-2xl border border-brand-navy bg-brand-navy shadow-[0_10px_35px_rgba(27,40,71,0.14)]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="relative p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                  <Send className="h-5 w-5 text-brand-gold" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">
                      Course Result Publishing
                    </h3>

                    <span className="rounded-full border border-brand-gold/20 bg-brand-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                      Registrar Control
                    </span>
                  </div>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-300">
                    Publish or return all results
                    for the selected course and
                    semester. Published results
                    become visible to students.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={
                    !courseFilter ||
                    !semesterFilter ||
                    !selectedGroupHasDrafts ||
                    actionLoading
                  }
                  onClick={() =>
                    setActionModal(
                      "publish",
                    )
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 text-sm font-bold text-brand-navy shadow-lg shadow-brand-gold/10 transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Send className="h-4 w-4" />
                  Publish Results
                </button>

                <button
                  type="button"
                  disabled={
                    !courseFilter ||
                    !semesterFilter ||
                    !selectedGroupHasPublished ||
                    actionLoading
                  }
                  onClick={() =>
                    setActionModal(
                      "unpublish",
                    )
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Clock3 className="h-4 w-4" />
                  Move to Draft
                </button>
              </div>
            </div>

            {(selectedCourse ||
              selectedSemester) && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                {selectedCourse && (
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <BookOpen className="h-3.5 w-3.5 text-brand-gold" />

                    <span className="text-xs font-semibold text-white">
                      {selectedCourse.code}
                    </span>

                    <span className="max-w-[260px] truncate text-xs text-slate-400">
                      {selectedCourse.title}
                    </span>
                  </div>
                )}

                {selectedSemester && (
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <GraduationCap className="h-3.5 w-3.5 text-brand-gold" />

                    <span className="text-xs font-semibold text-white">
                      {
                        selectedSemester.name
                      }
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            RESULTS
        ================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-brand-navy">
                    Student Results
                  </h2>

                  <span className="rounded-full bg-brand-navy/5 px-2 py-0.5 text-[10px] font-bold text-brand-navy">
                    {filteredResults.length.toLocaleString(
                      "en-NG",
                    )}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Academic performance records
                  available for Registrar review.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                <Users className="h-3.5 w-3.5 text-brand-navy" />
                Registrar review access
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[380px] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-brand-navy">
                    Loading academic results
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Please wait while the records
                    are retrieved.
                  </p>
                </div>
              </div>
            </div>
          ) : filteredResults.length ===
            0 ? (
            <EmptyState
              hasFilters={Boolean(
                search ||
                  courseFilter ||
                  semesterFilter ||
                  statusFilter,
              )}
            />
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1180px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Student
                      </th>

                      <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Course
                      </th>

                      <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Semester
                      </th>

                      <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Lecturer
                      </th>

                      <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Score
                      </th>

                      <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Grade
                      </th>

                      <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Status
                      </th>

                      <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Updated
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredResults.map(
                      (result) => (
                        <ResultRow
                          key={
                            result._id
                          }
                          result={
                            result
                          }
                        />
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET */}

              <div className="divide-y divide-slate-100 lg:hidden">
                {filteredResults.map(
                  (result) => (
                    <ResultCard
                      key={
                        result._id
                      }
                      result={
                        result
                      }
                    />
                  ),
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* =================================================
          CONFIRMATION MODAL
      ================================================== */}

      <AnimatePresence>
        {actionModal && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/70 p-4 backdrop-blur-md"
            onMouseDown={() => {
              if (!actionLoading) {
                setActionModal(null);
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              transition={{
                duration: 0.2,
              }}
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {/* Modal header */}

              <div className="relative overflow-hidden bg-brand-navy px-5 py-5 sm:px-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-gold/10 blur-2xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                      {actionModal ===
                      "publish" ? (
                        <Send className="h-5 w-5 text-brand-gold" />
                      ) : (
                        <Clock3 className="h-5 w-5 text-brand-gold" />
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gold">
                        Registrar Action
                      </p>

                      <h3 className="mt-0.5 font-bold text-white">
                        {actionModal ===
                        "publish"
                          ? "Publish Results"
                          : "Move Results to Draft"}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      setActionModal(
                        null,
                      )
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal body */}

              <div className="px-5 py-5 sm:px-6">
                <p className="text-sm leading-6 text-slate-600">
                  {actionModal ===
                  "publish"
                    ? "This will publish all draft results for the selected course and semester. Published results become visible to students."
                    : "This will move all published results for the selected course and semester back to draft status."}
                </p>

                <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Selected academic group
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <div className="flex items-start justify-between gap-5 px-4 py-3.5">
                      <span className="shrink-0 text-xs font-medium text-slate-500">
                        Course
                      </span>

                      <span className="text-right text-sm font-bold text-brand-navy">
                        {selectedCourse
                          ? `${selectedCourse.code} — ${selectedCourse.title}`
                          : "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-5 px-4 py-3.5">
                      <span className="text-xs font-medium text-slate-500">
                        Semester
                      </span>

                      <span className="text-sm font-bold text-brand-navy">
                        {selectedSemester?.name ??
                          "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                  <p className="text-xs leading-5 text-amber-800">
                    This is a course-level action.
                    Make sure the selected
                    course and semester are
                    correct before continuing.
                  </p>
                </div>
              </div>

              {/* Modal footer */}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    setActionModal(
                      null,
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={
                    handleStatusAction
                  }
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold shadow-sm transition active:scale-[0.98] disabled:opacity-60 ${
                    actionModal ===
                    "publish"
                      ? "bg-brand-gold text-brand-navy hover:brightness-105"
                      : "bg-brand-navy text-white hover:bg-brand-navy/90"
                  }`}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : actionModal ===
                    "publish" ? (
                    <Send className="h-4 w-4" />
                  ) : (
                    <Clock3 className="h-4 w-4" />
                  )}

                  {actionLoading
                    ? "Processing..."
                    : actionModal ===
                      "publish"
                    ? "Publish Results"
                    : "Move to Draft"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      transition={{
        duration: 0.18,
      }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
    >
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-brand-navy/[0.025] transition-transform duration-300 group-hover:scale-150" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-brand-navy">
            {value.toLocaleString(
              "en-NG",
            )}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy">
          <Icon className="h-5 w-5 text-brand-gold" />
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
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
          onChange(
            event.target.value,
          )
        }
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          ),
        )}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

/* =========================================================
   RESULT ROW
========================================================= */

function ResultRow({
  result,
}: {
  result: Result;
}) {
  const student =
    getStudent(result);

  const course =
    getCourse(result);

  const semester =
    getSemester(result);

  const lecturer =
    getLecturer(result);

  return (
    <tr className="group transition-colors hover:bg-slate-50/80">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-navy/10 bg-brand-navy/5">
            <User className="h-4 w-4 text-brand-navy" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-navy">
              {student.name ??
                "Unknown Student"}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-400">
              {student.matricNumber ??
                student.email ??
                "No matric number"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-bold text-slate-800">
          {course.code ??
            "—"}
        </p>

        <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
          {course.title ??
            "Course unavailable"}
        </p>
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
          {semester.name ??
            "—"}
        </span>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-700">
          {lecturer.name ??
            "—"}
        </p>

        {lecturer.email && (
          <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400">
            {lecturer.email}
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        <div className="flex items-baseline">
          <span className="text-base font-bold text-brand-navy">
            {Number(
              result.score,
            )}
          </span>

          <span className="ml-1 text-[10px] font-medium text-slate-400">
            /100
          </span>
        </div>
      </td>

      <td className="px-5 py-4">
        <GradeBadge
          grade={
            result.grade
          }
        />
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          status={
            result.status
          }
        />
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-400">
        {formatDate(
          result.updatedAt ??
            result.createdAt,
        )}
      </td>
    </tr>
  );
}

/* =========================================================
   RESULT CARD
========================================================= */

function ResultCard({
  result,
}: {
  result: Result;
}) {
  const student =
    getStudent(result);

  const course =
    getCourse(result);

  const semester =
    getSemester(result);

  const lecturer =
    getLecturer(result);

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-navy/10 bg-brand-navy/5">
            <User className="h-4 w-4 text-brand-navy" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-brand-navy">
              {student.name ??
                "Unknown Student"}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-400">
              {student.matricNumber ??
                student.email ??
                "No matric number"}
            </p>
          </div>
        </div>

        <StatusBadge
          status={
            result.status
          }
        />
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-brand-navy">
              {course.code ??
                "—"}
            </p>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
              {course.title ??
                "Course unavailable"}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xl font-bold text-brand-navy">
              {Number(
                result.score,
              )}

              <span className="ml-0.5 text-[10px] font-medium text-slate-400">
                /100
              </span>
            </p>

            <GradeBadge
              grade={
                result.grade
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
        <InfoItem
          label="Semester"
          value={
            semester.name ??
            "—"
          }
        />

        <InfoItem
          label="Lecturer"
          value={
            lecturer.name ??
            "—"
          }
        />

        <InfoItem
          label="Updated"
          value={formatDate(
            result.updatedAt ??
              result.createdAt,
          )}
        />

        <InfoItem
          label="Credit Units"
          value={
            course.creditUnits !==
            undefined
              ? String(
                  course.creditUnits,
                )
              : "—"
          }
        />
      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   GRADE BADGE
========================================================= */

function GradeBadge({
  grade,
}: {
  grade:
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | "F";
}) {
  const className =
    grade === "A"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : grade === "B"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : grade === "C"
          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
          : grade === "D"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : grade === "E"
              ? "bg-orange-50 text-orange-700 border-orange-200"
              : "bg-red-50 text-red-700 border-red-200";

  return (
    <span
      className={`inline-flex min-w-[30px] items-center justify-center rounded-lg border px-2 py-1 text-xs font-bold ${className}`}
    >
      {grade}
    </span>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status:
    | "draft"
    | "published";
}) {
  if (
    status ===
    "published"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Published
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700">
      <Clock3 className="h-3.5 w-3.5" />
      Draft
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        {hasFilters ? (
          <Search className="h-7 w-7 text-brand-navy" />
        ) : (
          <FileText className="h-7 w-7 text-brand-navy" />
        )}
      </div>

      <h3 className="mt-5 text-sm font-bold text-brand-navy">
        {hasFilters
          ? "No matching results"
          : "No academic results yet"}
      </h3>

      <p className="mt-1 max-w-md text-xs leading-6 text-slate-500">
        {hasFilters
          ? "Try changing your search or filters to find other result records."
          : "Results submitted by lecturers will appear here for Registrar review and publication."}
      </p>
    </div>
  );
}

