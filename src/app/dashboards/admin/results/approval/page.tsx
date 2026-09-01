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
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
  BookOpen,
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

type Result = {
  _id: string;

  student: Student | string;

  course: Course | string;

  semester: Semester | string;

  lecturer: Lecturer | string;

  score: number;

  grade:
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | "F";

  status: "draft" | "published";

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

function getStudentName(
  student: Result["student"],
): string {
  if (
    typeof student === "object" &&
    student !== null
  ) {
    return student.name || "Unknown Student";
  }

  return "Unknown Student";
}

function getMatricNumber(
  student: Result["student"],
): string {
  if (
    typeof student === "object" &&
    student !== null
  ) {
    return student.matricNumber || "—";
  }

  return "—";
}

function getCourseId(
  course: Result["course"],
): string | null {
  if (
    typeof course === "object" &&
    course !== null
  ) {
    return course._id || null;
  }

  return course || null;
}

function getCourseCode(
  course: Result["course"],
): string {
  if (
    typeof course === "object" &&
    course !== null
  ) {
    return course.code || "—";
  }

  return "—";
}

function getCourseTitle(
  course: Result["course"],
): string {
  if (
    typeof course === "object" &&
    course !== null
  ) {
    return course.title || "Course";
  }

  return "Course";
}

function getSemesterId(
  semester: Result["semester"],
): string | null {
  if (
    typeof semester === "object" &&
    semester !== null
  ) {
    return semester._id || null;
  }

  return semester || null;
}

function getSemesterName(
  semester: Result["semester"],
): string {
  if (
    typeof semester === "object" &&
    semester !== null
  ) {
    return semester.name || "—";
  }

  return "—";
}

function getLecturerName(
  lecturer: Result["lecturer"],
): string {
  if (
    typeof lecturer === "object" &&
    lecturer !== null
  ) {
    return lecturer.name || "—";
  }

  return "—";
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminResultApprovalPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    typeof session?.accessToken === "string" &&
    session.accessToken.trim().length > 0
      ? session.accessToken
      : null;

  const [results, setResults] = useState<Result[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [publishing, setPublishing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* =========================================================
     LOAD DRAFT RESULTS
  ========================================================== */

  const loadDraftResults =
    useCallback(
      async (refresh = false) => {
        if (!accessToken) {
          setLoading(false);
          setRefreshing(false);

          if (
            sessionStatus ===
            "unauthenticated"
          ) {
            setErrorMessage(
              "Your session has expired. Please sign in again.",
            );
          } else if (
            sessionStatus ===
            "authenticated"
          ) {
            setErrorMessage(
              "Your session is available, but no access token was found. Please sign in again.",
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

          /*
           * Approval page only requests draft results.
           */
          const response =
            await apiGet<ResultsResponse>(
              "/results?status=draft",
              accessToken,
            );

          if (!response?.success) {
            throw new Error(
              response?.message ||
                "Unable to load pending results.",
            );
          }

          setResults(
            Array.isArray(
              response.results,
            )
              ? response.results
              : [],
          );
        } catch (error) {
          console.error(
            "Load result approval error:",
            error,
          );

          const message =
            error instanceof Error
              ? error.message
              : "Unable to load pending results.";

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
      ],
    );

  /* =========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    if (
      sessionStatus === "loading"
    ) {
      setLoading(true);
      return;
    }

    if (
      sessionStatus ===
      "unauthenticated"
    ) {
      setLoading(false);
      setErrorMessage(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    if (
      sessionStatus ===
        "authenticated" &&
      accessToken
    ) {
      void loadDraftResults();
    }

    if (
      sessionStatus ===
        "authenticated" &&
      !accessToken
    ) {
      setLoading(false);
      setErrorMessage(
        "Your session is available, but no access token was found. Please sign in again.",
      );
    }
  }, [
    sessionStatus,
    accessToken,
    loadDraftResults,
  ]);

  /* =========================================================
     SEARCH
  ========================================================== */

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
          const studentName =
            getStudentName(
              result.student,
            ).toLowerCase();

          const matric =
            getMatricNumber(
              result.student,
            ).toLowerCase();

          const courseCode =
            getCourseCode(
              result.course,
            ).toLowerCase();

          const courseTitle =
            getCourseTitle(
              result.course,
            ).toLowerCase();

          const lecturerName =
            getLecturerName(
              result.lecturer,
            ).toLowerCase();

          const semesterName =
            getSemesterName(
              result.semester,
            ).toLowerCase();

          return (
            studentName.includes(
              query,
            ) ||
            matric.includes(query) ||
            courseCode.includes(
              query,
            ) ||
            courseTitle.includes(
              query,
            ) ||
            lecturerName.includes(
              query,
            ) ||
            semesterName.includes(
              query,
            )
          );
        },
      );
    }, [results, search]);

  /* =========================================================
     STATISTICS
  ========================================================== */

  const studentCount =
    new Set(
      results
        .map((result) =>
          typeof result.student ===
          "string"
            ? result.student
            : result.student?._id,
        )
        .filter(Boolean),
    ).size;

  const courseCount =
    new Set(
      results
        .map((result) =>
          typeof result.course ===
          "string"
            ? result.course
            : result.course?._id,
        )
        .filter(Boolean),
    ).size;

  /* =========================================================
     PUBLISH
  ========================================================== */

  const handleApprove = async (
    result: Result,
  ) => {
    if (!accessToken) {
      toast.error(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    const courseId =
      getCourseId(result.course);

    const semesterId =
      getSemesterId(
        result.semester,
      );

    if (
      !courseId ||
      !semesterId
    ) {
      toast.error(
        "Unable to determine the course or semester.",
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Approve and publish all results for ${getCourseCode(
          result.course,
        )} — ${getSemesterName(
          result.semester,
        )}?`,
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
            "Unable to approve results.",
        );
      }

      toast.success(
        response.message ||
          "Results approved and published successfully.",
      );

      await loadDraftResults(true);
    } catch (error) {
      console.error(
        "Approve results error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to approve results.",
      );
    } finally {
      setPublishing(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================== */

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
            Loading pending results...
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
              Unable to load approval queue
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {errorMessage}
            </p>

            <Button
              type="button"
              onClick={() =>
                void loadDraftResults(
                  true,
                )
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
  ========================================================== */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href="/admin/results"
                className="inline-flex items-center gap-2 text-xs font-medium text-white/60 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Results
              </Link>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />

                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Result Approval
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Approval Queue
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-[15px]">
                Review draft results submitted by
                lecturers and approve them for
                publication to students.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void loadDraftResults(
                  true,
                )
              }
              disabled={refreshing}
              className="h-11 w-fit rounded-xl border-white/20 bg-white/10 px-4 text-white hover:bg-white/15 hover:text-white"
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

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Pending Results"
          value={results.length}
          description="Awaiting approval"
          icon={
            <ClipboardCheck className="h-5 w-5 text-brand-gold" />
          }
          iconClass="bg-brand-gold/10"
        />

        <StatCard
          title="Students"
          value={studentCount}
          description="Students represented"
          icon={
            <Users className="h-5 w-5 text-brand-navy" />
          }
          iconClass="bg-brand-navy/10"
        />

        <StatCard
          title="Courses"
          value={courseCount}
          description="Courses awaiting approval"
          icon={
            <BookOpen className="h-5 w-5 text-emerald-600" />
          }
          iconClass="bg-emerald-50"
        />
      </div>

      {/* =====================================================
          APPROVAL QUEUE
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-brand-dark">
                Pending Approval
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                {filteredResults.length} pending
                result
                {filteredResults.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>

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
                placeholder="Search pending results..."
                aria-label="Search pending results"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 sm:w-72"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredResults.length ===
          0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-8 ring-emerald-500/[0.03]">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>

              <h3 className="mt-5 text-sm font-semibold text-brand-dark">
                Approval queue is clear
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                There are currently no draft
                results waiting for approval.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
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

                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Approval
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredResults.map(
                    (result) => (
                      <tr
                        key={result._id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        {/* STUDENT */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/10 text-xs font-bold text-brand-navy">
                              {getStudentName(
                                result.student,
                              )
                                .slice(
                                  0,
                                  1,
                                )
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

                          <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500">
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

                        {/* APPROVAL */}

                        <td className="px-6 py-4 text-right">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              void handleApprove(
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

                            Approve & Publish
                          </Button>
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

      {/* =====================================================
          INFORMATION
      ====================================================== */}

      <Card className="border-brand-navy/10 bg-brand-navy/[0.02] shadow-none">
        <CardContent className="flex gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10">
            <UserCheck className="h-5 w-5 text-brand-navy" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-dark">
              Approval workflow
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Lecturers submit student results as
              drafts. An authorized administrator or
              registrar reviews the submitted results
              and approves them. Approval changes the
              results to published status, making them
              available to students.
            </p>
          </div>
        </CardContent>
      </Card>
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
  icon,
  iconClass,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {title}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-brand-dark">
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