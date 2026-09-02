"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
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

import { apiGet, apiPatch } from "@/lib/api";

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
  creditUnits: number;
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

type ResultStatus = "draft" | "published";

type Result = {
  _id: string;

  student: Student | string;

  course: Course | string;

  semester: Semester | string;

  lecturer: Lecturer | string;

  score: number;

  grade: "A" | "B" | "C" | "D" | "E" | "F";

  status: ResultStatus;

  createdAt: string;

  updatedAt?: string;
};

type ResultsResponse = {
  success: boolean;
  results?: Result[];
  message?: string;
};

type PublishResponse = {
  success: boolean;
  message?: string;
  matched?: number;
  modified?: number;
};

/* =========================================================
   HELPERS
========================================================= */

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

function getCourseId(course: Result["course"]): string | null {
  if (typeof course === "object" && course !== null) {
    return course._id || null;
  }

  return course || null;
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

function getSemesterId(
  semester: Result["semester"],
): string | null {
  if (typeof semester === "object" && semester !== null) {
    return semester._id || null;
  }

  return semester || null;
}

function getSemesterName(
  semester: Result["semester"],
): string {
  if (typeof semester === "object" && semester !== null) {
    return semester.name || "—";
  }

  return "—";
}

function getLecturerName(
  lecturer: Result["lecturer"],
): string {
  if (typeof lecturer === "object" && lecturer !== null) {
    return lecturer.name || "—";
  }

  return "—";
}

function getResultStudentId(
  student: Result["student"],
): string | null {
  if (typeof student === "object" && student !== null) {
    return student._id || null;
  }

  return student || null;
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminResultsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    typeof session?.accessToken === "string" &&
    session.accessToken.trim().length > 0
      ? session.accessToken
      : null;

  const [results, setResults] = useState<Result[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [publishing, setPublishing] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published"
  >("all");

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /*
   * Used to prevent an old request from updating state after
   * a newer request has already started.
   */
  const requestIdRef = useRef(0);

  /* =========================================================
     LOAD RESULTS
  ========================================================== */

  const loadResults = useCallback(
    async (refresh = false) => {
      /*
       * Never leave the UI in loading state when there is
       * no usable access token.
       */
      if (!accessToken) {
        setLoading(false);
        setRefreshing(false);

        if (sessionStatus === "unauthenticated") {
          setErrorMessage(
            "Your session has expired. Please sign in again.",
          );
        } else if (sessionStatus === "authenticated") {
          setErrorMessage(
            "Your session is available, but no access token was found. Please sign in again.",
          );
        }

        return;
      }

      const requestId = ++requestIdRef.current;

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
            : `?status=${encodeURIComponent(statusFilter)}`;

        const response =
          await apiGet<ResultsResponse>(
            `/results${query}`,
            accessToken,
          );

        /*
         * Ignore this response if another request started after it.
         */
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to load results.",
          );
        }

        setResults(
          Array.isArray(response.results)
            ? response.results
            : [],
        );
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error(
          "Load admin results error:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load results.";

        setErrorMessage(message);

        toast.error(message);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [
      accessToken,
      sessionStatus,
      statusFilter,
    ],
  );

  /* =========================================================
     SESSION + INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    /*
     * NextAuth is still resolving the session.
     */
    if (sessionStatus === "loading") {
      setLoading(true);
      setErrorMessage(null);
      return;
    }

    /*
     * User is not authenticated.
     */
    if (sessionStatus === "unauthenticated") {
      setLoading(false);
      setRefreshing(false);

      setErrorMessage(
        "Your session has expired. Please sign in again.",
      );

      return;
    }

    /*
     * Authenticated but token has not been attached.
     *
     * Do not keep showing the spinner forever.
     */
    if (
      sessionStatus === "authenticated" &&
      !accessToken
    ) {
      setLoading(false);
      setRefreshing(false);

      setErrorMessage(
        "Your session is available, but no access token was found. Please sign in again.",
      );

      return;
    }

    /*
     * Authenticated and token exists.
     */
    if (
      sessionStatus === "authenticated" &&
      accessToken
    ) {
      void loadResults(false);
    }
  }, [
    sessionStatus,
    accessToken,
    loadResults,
  ]);

  /* =========================================================
     SEARCH FILTER
  ========================================================== */

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return results;
    }

    return results.filter((result) => {
      const studentName = getStudentName(
        result.student,
      ).toLowerCase();

      const matric = getMatricNumber(
        result.student,
      ).toLowerCase();

      const courseCode = getCourseCode(
        result.course,
      ).toLowerCase();

      const courseTitle = getCourseTitle(
        result.course,
      ).toLowerCase();

      const lecturerName = getLecturerName(
        result.lecturer,
      ).toLowerCase();

      const semesterName = getSemesterName(
        result.semester,
      ).toLowerCase();

      return (
        studentName.includes(query) ||
        matric.includes(query) ||
        courseCode.includes(query) ||
        courseTitle.includes(query) ||
        lecturerName.includes(query) ||
        semesterName.includes(query)
      );
    });
  }, [results, search]);

  /* =========================================================
     STATISTICS
  ========================================================== */

  const draftCount = useMemo(
    () =>
      results.filter(
        (result) => result.status === "draft",
      ).length,
    [results],
  );

  const publishedCount = useMemo(
    () =>
      results.filter(
        (result) =>
          result.status === "published",
      ).length,
    [results],
  );

  const studentCount = useMemo(() => {
    const ids = results
      .map((result) =>
        getResultStudentId(
          result.student,
        ),
      )
      .filter(Boolean);

    return new Set(ids).size;
  }, [results]);

  const courseCount = useMemo(() => {
    const ids = results
      .map((result) =>
        getCourseId(result.course),
      )
      .filter(Boolean);

    return new Set(ids).size;
  }, [results]);

  /* =========================================================
     PUBLISH COURSE RESULTS
  ========================================================== */

  const handlePublishResult = async (
    result: Result,
  ) => {
    if (!accessToken) {
      toast.error(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    const courseId = getCourseId(
      result.course,
    );

    const semesterId = getSemesterId(
      result.semester,
    );

    if (!courseId || !semesterId) {
      toast.error(
        "Unable to determine the course or semester.",
      );
      return;
    }

    const courseCode = getCourseCode(
      result.course,
    );

    const semesterName = getSemesterName(
      result.semester,
    );

    const confirmed = window.confirm(
      `Publish all results for ${courseCode} — ${semesterName}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setPublishing(true);

      const response =
        await apiPatch<PublishResponse>(
          "/results/publish",
          {
            course: courseId,
            semester: semesterId,
          },
          accessToken,
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to publish results.",
        );
      }

      toast.success(
        response.message ||
          "Results published successfully.",
      );

      /*
       * Reload using the current filter.
       */
      await loadResults(true);
    } catch (error) {
      console.error(
        "Publish results error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to publish results.",
      );
    } finally {
      setPublishing(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================== */

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <p className="text-sm text-slate-500">
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================== */

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
              Unable to load results
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {errorMessage}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                onClick={() =>
                  void loadResults(true)
                }
                className="rounded-xl bg-brand-navy text-white hover:bg-brand-navy/95"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              <Link href="/login">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                >
                  Sign In Again
                </Button>
              </Link>
            </div>
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
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-brand-gold" />

              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                Academic Performance
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Results
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-[15px]">
              Review submitted student results,
              monitor grading activity, and
              publish approved course results.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/60">
              <span>
                {results.length} result
                {results.length === 1
                  ? ""
                  : "s"}
              </span>

              <div className="h-3 w-px bg-white/20" />

              <span>
                {draftCount} draft
              </span>

              <div className="h-3 w-px bg-white/20" />

              <span>
                {publishedCount} published
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/admin/results/approval">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-brand-gold/30 bg-brand-gold/10 px-4 text-brand-gold shadow-sm hover:bg-brand-gold/20 hover:text-brand-gold"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Approval
              </Button>
            </Link>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void loadResults(true)
              }
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
          </div>
        </div>
      </section>

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Results"
          value={results.length}
          description="Submitted result records"
          icon={
            <ClipboardCheck className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-brand-navy/10"
        />

        <StatCard
          title="Draft Results"
          value={draftCount}
          description="Awaiting approval"
          icon={
            <BookOpen className="h-5 w-5 text-brand-gold" />
          }
          iconClass="bg-brand-gold/10"
        />

        <StatCard
          title="Published"
          value={publishedCount}
          description="Visible to students"
          icon={
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          }
          iconClass="bg-emerald-50"
          valueClass="text-emerald-600"
        />

        <StatCard
          title="Students"
          value={studentCount}
          description={`${courseCount} course${
            courseCount === 1 ? "" : "s"
          } represented`}
          icon={
            <Users className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-slate-100"
        />
      </div>

      {/* =====================================================
          RESULTS DIRECTORY
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-brand-dark">
                Result Records
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                {filteredResults.length} result
                {filteredResults.length === 1
                  ? ""
                  : "s"} found
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* SEARCH */}

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
                  placeholder="Search results..."
                  aria-label="Search results"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 sm:w-64"
                />
              </div>

              {/* STATUS */}

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as
                      | "all"
                      | "draft"
                      | "published",
                  )
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
              >
                <option value="all">
                  All Results
                </option>

                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/10 ring-8 ring-brand-navy/[0.03]">
                <ClipboardCheck className="h-7 w-7 text-brand-navy" />
              </div>

              <h3 className="mt-5 text-sm font-semibold text-brand-dark">
                No results found
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                {search
                  ? "Try changing your search."
                  : "No result records are available for the selected filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <TableHeading>
                      Student
                    </TableHeading>

                    <TableHeading>
                      Course
                    </TableHeading>

                    <TableHeading>
                      Semester
                    </TableHeading>

                    <TableHeading>
                      Lecturer
                    </TableHeading>

                    <TableHeading>
                      Score
                    </TableHeading>

                    <TableHeading>
                      Grade
                    </TableHeading>

                    <TableHeading>
                      Status
                    </TableHeading>

                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredResults.map(
                    (result) => (
                      <tr
                        key={result._id}
                        className="group transition-colors hover:bg-slate-50/70"
                      >
                        {/* STUDENT */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/10 text-xs font-bold text-brand-navy">
                              {getStudentName(
                                result.student,
                              )
                                .slice(0, 1)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-brand-dark">
                                {getStudentName(
                                  result.student,
                                )}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {getMatricNumber(
                                  result.student,
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* COURSE */}

                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-brand-dark">
                            {getCourseCode(
                              result.course,
                            )}
                          </p>

                          <p className="mt-0.5 max-w-[190px] truncate text-xs text-slate-500">
                            {getCourseTitle(
                              result.course,
                            )}
                          </p>
                        </td>

                        {/* SEMESTER */}

                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {getSemesterName(
                              result.semester,
                            )}
                          </span>
                        </td>

                        {/* LECTURER */}

                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {getLecturerName(
                              result.lecturer,
                            )}
                          </span>
                        </td>

                        {/* SCORE */}

                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-brand-dark">
                            {result.score}
                          </span>

                          <span className="ml-1 text-xs text-slate-400">
                            / 100
                          </span>
                        </td>

                        {/* GRADE */}

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                              result.grade ===
                              "A"
                                ? "bg-emerald-50 text-emerald-700"
                                : result.grade ===
                                    "F"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-brand-navy/10 text-brand-navy"
                            }`}
                          >
                            {result.grade}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          {result.status ===
                          "published" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Draft
                            </span>
                          )}
                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-4 text-right">
                          {result.status ===
                          "draft" ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                void handlePublishResult(
                                  result,
                                )
                              }
                              disabled={
                                publishing
                              }
                              className="rounded-lg bg-brand-navy text-xs text-white hover:bg-brand-navy/95"
                            >
                              {publishing ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                              )}

                              Publish
                            </Button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                              <Eye className="h-3.5 w-3.5" />
                              Published
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
    </div>
  );
}

/* =========================================================
   TABLE HEADING
========================================================= */

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
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