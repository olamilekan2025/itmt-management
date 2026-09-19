"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Save,
  Search,
  Send,
  UserRound,
  X,
} from "lucide-react";

import { apiGet, apiPost } from "@/lib/api";

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

  course:
    | Course
    | string;

  semester:
    | Semester
    | string;

  isActive?: boolean;
}

interface Student {
  _id: string;
  name?: string;
  email?: string;
  matricNumber?: string;
}

interface Registration {
  _id: string;

  student:
    | Student
    | string;

  course?: string;

  semester?: string;

  status?: string;
}

interface Result {
  _id: string;

  student:
    | Student
    | string;

  course?:
    | Course
    | string;

  semester?:
    | Semester
    | string;

  score?: number;

  grade?: string;

  status?: "draft" | "published";

  createdAt?: string;
}

interface AssignmentsResponse {
  success: boolean;
  assignments?: LecturerAssignment[];
  message?: string;
}

interface RosterResponse {
  success: boolean;

  /*
   * Different versions of the registrations
   * controller may return either registrations
   * or roster. We support both.
   */
  registrations?: Registration[];

  roster?: Registration[];

  students?: Registration[];

  message?: string;
}

interface ResultsResponse {
  success: boolean;
  results?: Result[];
  message?: string;
}

/* =========================================================
   LOCAL SCORE
========================================================= */

interface ScoreEntry {
  studentId: string;
  score: string;
}

/* =========================================================
   HELPERS
========================================================= */

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
  if (
    typeof assignment.semester ===
    "string"
  ) {
    return assignment.semester;
  }

  return assignment.semester?._id ?? "";
}

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

function getStudent(
  registration: Registration,
): Student | null {
  if (
    typeof registration.student ===
      "object" &&
    registration.student !== null
  ) {
    return registration.student;
  }

  return null;
}

function getStudentId(
  registration: Registration,
): string {
  if (typeof registration.student === "string") {
    return registration.student;
  }

  return registration.student?._id ?? "";
}

function getResultStudentId(
  result: Result,
): string {
  if (typeof result.student === "string") {
    return result.student;
  }

  return result.student?._id ?? "";
}

function getProgrammeName(
  course: Course | null,
): string {
  if (!course?.programme) {
    return "Programme not assigned";
  }

  if (typeof course.programme === "string") {
    return course.programme;
  }

  return (
    course.programme.name ??
    "Programme not assigned"
  );
}

/* =========================================================
   GRADE
========================================================= */

function calculateGrade(
  score: number,
): string {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";

  return "F";
}

function getGradeClass(
  grade: string,
): string {
  switch (grade) {
    case "A":
      return "bg-emerald-50 text-emerald-700";

    case "B":
      return "bg-blue-50 text-blue-700";

    case "C":
      return "bg-indigo-50 text-indigo-700";

    case "D":
      return "bg-amber-50 text-amber-700";

    case "E":
      return "bg-orange-50 text-orange-700";

    case "F":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-500";
  }
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

/* =========================================================
   SKELETON
========================================================= */

function EnterResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-3xl bg-slate-200" />

      <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />

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

export default function EnterResultsPage() {
  const { data: session, status: sessionStatus } =
    useSession();

  const router = useRouter();

  const searchParams =
    useSearchParams();

  const courseId =
    searchParams.get("course") ?? "";

  const semesterId =
    searchParams.get("semester") ?? "";

  const [assignment, setAssignment] =
    useState<LecturerAssignment | null>(
      null,
    );

  const [course, setCourse] =
    useState<Course | null>(null);

  const [semester, setSemester] =
    useState<Semester | null>(null);

  const [registrations, setRegistrations] =
    useState<Registration[]>([]);

  const [results, setResults] =
    useState<Result[]>([]);

  const [scores, setScores] =
    useState<Record<string, string>>({});

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [showSubmitModal, setShowSubmitModal] =
    useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = useCallback(
    async () => {
      if (!session?.accessToken) {
        return;
      }

      if (!courseId || !semesterId) {
        setError(
          "A course and semester are required to enter results.",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        /* =================================================
           1. GET LECTURER ASSIGNMENTS
        ================================================= */

        const assignmentResponse =
          (await apiGet(
            "/lecturer-assignments/me",
            session.accessToken,
          )) as AssignmentsResponse;

        if (
          !assignmentResponse?.success
        ) {
          throw new Error(
            assignmentResponse?.message ??
              "Unable to load lecturer assignments.",
          );
        }

        const foundAssignment =
          (
            assignmentResponse.assignments ??
            []
          ).find(
            (item) =>
              item.isActive !== false &&
              getCourseId(item) ===
                courseId &&
              getSemesterId(item) ===
                semesterId,
          );

        if (!foundAssignment) {
          throw new Error(
            "You are not assigned to this course for this semester.",
          );
        }

        setAssignment(
          foundAssignment,
        );

        const assignedCourse =
          getCourse(foundAssignment);

        const assignedSemester =
          getSemester(foundAssignment);

        setCourse(assignedCourse);
        setSemester(
          assignedSemester,
        );

        /* =================================================
           2. GET REGISTERED STUDENTS
        ================================================= */

        const rosterResponse =
          (await apiGet(
            `/registrations/roster?course=${encodeURIComponent(
              courseId,
            )}&semester=${encodeURIComponent(
              semesterId,
            )}`,
            session.accessToken,
          )) as RosterResponse;

        if (!rosterResponse?.success) {
          throw new Error(
            rosterResponse?.message ??
              "Unable to load registered students.",
          );
        }

        const roster =
          rosterResponse.registrations ??
          rosterResponse.roster ??
          rosterResponse.students ??
          [];

        /*
         * Only registered students should be
         * displayed to the lecturer.
         */
        const registeredStudents =
          roster.filter(
            (registration) =>
              !registration.status ||
              registration.status ===
                "registered",
          );

        setRegistrations(
          registeredStudents,
        );

        /* =================================================
           3. GET EXISTING RESULTS
        ================================================= */

        const resultsResponse =
          (await apiGet(
            `/results/course?course=${encodeURIComponent(
              courseId,
            )}&semester=${encodeURIComponent(
              semesterId,
            )}`,
            session.accessToken,
          )) as ResultsResponse;

        if (
          !resultsResponse?.success
        ) {
          throw new Error(
            resultsResponse?.message ??
              "Unable to load existing results.",
          );
        }

        const existingResults =
          resultsResponse.results ?? [];

        setResults(
          existingResults,
        );

        /* =================================================
           4. BUILD SCORE STATE
        ================================================= */

        const scoreMap: Record<
          string,
          string
        > = {};

        for (const registration of registeredStudents) {
          const studentId =
            getStudentId(
              registration,
            );

          if (!studentId) {
            continue;
          }

          const existing =
            existingResults.find(
              (result) =>
                getResultStudentId(
                  result,
                ) === studentId,
            );

          scoreMap[studentId] =
            typeof existing?.score ===
              "number"
              ? String(existing.score)
              : "";
        }

        setScores(scoreMap);
      } catch (err) {
        console.error(
          "Load enter results error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load result entry page.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      session?.accessToken,
      courseId,
      semesterId,
    ],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      void loadData();
    }
  }, [
    sessionStatus,
    loadData,
  ]);

  /* =======================================================
     FILTERED STUDENTS
  ======================================================= */

  const filteredRegistrations =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return registrations;
      }

      return registrations.filter(
        (registration) => {
          const student =
            getStudent(
              registration,
            );

          const searchable = [
            student?.name,
            student?.email,
            student?.matricNumber,
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
      registrations,
      search,
    ]);

  /* =======================================================
     SCORE UPDATE
  ======================================================= */

  const updateScore = (
    studentId: string,
    value: string,
  ) => {
    /*
     * Allow the input to be temporarily
     * empty while typing.
     */
    if (value === "") {
      setScores((previous) => ({
        ...previous,
        [studentId]: "",
      }));

      return;
    }

    /*
     * Only numbers and one decimal point.
     */
    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    const numericValue =
      Number(value);

    /*
     * Don't allow values above 100.
     */
    if (numericValue > 100) {
      return;
    }

    setScores((previous) => ({
      ...previous,
      [studentId]: value,
    }));
  };

  /* =======================================================
     SCORE STATISTICS
  ======================================================= */

  const scoreStats = useMemo(() => {
    let entered = 0;
    let passed = 0;
    let failed = 0;

    for (const registration of registrations) {
      const studentId =
        getStudentId(
          registration,
        );

      const raw =
        scores[studentId] ?? "";

      if (raw === "") {
        continue;
      }

      const score =
        Number(raw);

      if (
        Number.isNaN(score) ||
        score < 0 ||
        score > 100
      ) {
        continue;
      }

      entered += 1;

      if (score >= 40) {
        passed += 1;
      } else {
        failed += 1;
      }
    }

    return {
      total: registrations.length,
      entered,
      remaining:
        registrations.length -
        entered,
      passed,
      failed,
    };
  }, [
    registrations,
    scores,
  ]);

  /* =======================================================
     VALIDATE SCORES
  ======================================================= */

  const validateScores = (): string | null => {
    if (!assignment) {
      return "The lecturer assignment could not be verified.";
    }

    if (registrations.length === 0) {
      return "There are no registered students for this course and semester.";
    }

    for (const registration of registrations) {
      const studentId =
        getStudentId(
          registration,
        );

      if (!studentId) {
        return "One or more registered students have an invalid student ID.";
      }

      const raw =
        scores[studentId] ?? "";

      if (raw === "") {
        const student =
          getStudent(
            registration,
          );

        return `Please enter a score for ${
          student?.name ??
          "every registered student"
        }.`;
      }

      const score =
        Number(raw);

      if (
        Number.isNaN(score) ||
        score < 0 ||
        score > 100
      ) {
        const student =
          getStudent(
            registration,
          );

        return `The score for ${
          student?.name ??
          "a student"
        } must be between 0 and 100.`;
      }
    }

    return null;
  };

  /* =======================================================
     SUBMIT RESULTS
  ======================================================= */

  const handleSubmitResults =
    async () => {
      if (!session?.accessToken) {
        setError(
          "Your session has expired. Please sign in again.",
        );

        return;
      }

      const validationError =
        validateScores();

      if (validationError) {
        setError(
          validationError,
        );

        setShowSubmitModal(false);

        return;
      }

      try {
        setSubmitting(true);
        setError("");
        setSuccessMessage("");

        const payload = {
          course: courseId,

          semester: semesterId,

          scores: registrations.map(
            (registration) => {
              const studentId =
                getStudentId(
                  registration,
                );

              return {
                student: studentId,
                score: Number(
                  scores[studentId],
                ),
              };
            },
          ),
        };

        const response =
          (await apiPost(
            "/results",
            payload,
            session.accessToken,
          )) as ResultsResponse & {
            message?: string;
          };

        if (!response?.success) {
          throw new Error(
            response?.message ??
              "Unable to submit results.",
          );
        }

        setSuccessMessage(
          response.message ??
            "Scores submitted successfully.",
        );

        setShowSubmitModal(false);

        /*
         * Refresh results from backend so
         * draft statuses and stored scores
         * are always current.
         */
        await loadData();
      } catch (err) {
        console.error(
          "Submit results error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to submit results.",
        );
      } finally {
        setSubmitting(false);
      }
    };

  /* =======================================================
     AUTH LOADING
  ======================================================= */

  if (
    sessionStatus === "loading" ||
    loading
  ) {
    return (
      <EnterResultsSkeleton />
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
          Please sign in again to enter
          results.
        </p>
      </div>
    );
  }

  /* =======================================================
     MISSING QUERY PARAMETERS
  ======================================================= */

  if (!courseId || !semesterId) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-600" />

        <h2 className="text-lg font-bold text-amber-900">
          Course and Semester Required
        </h2>

        <p className="mx-auto mt-2 max-w-lg text-sm text-amber-700">
          Open this page from a lecturer
          course so the course and semester
          can be identified.
        </p>

        <Link
          href="/dashboards/lecturer/results"
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Link>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <>
      <div className="space-y-6 pb-28">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 text-white shadow-xl md:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-gold/10 blur-2xl" />

          <div className="relative">
            <Link
              href={`/dashboards/lecturer/results?course=${encodeURIComponent(
                courseId,
              )}&semester=${encodeURIComponent(
                semesterId,
              )}`}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Results
            </Link>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200">
                  <ClipboardCheck className="h-4 w-4 text-brand-gold" />
                  Result Entry
                </div>

                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {course?.code ??
                    "Course"}{" "}
                  —{" "}
                  {course?.title ??
                    "Enter Results"}
                </h1>

                <p className="mt-2 text-sm text-slate-300">
                  {semester?.name ??
                    "Semester"}{" "}
                  •{" "}
                  {course?.creditUnits ??
                    "—"}{" "}
                  Credit Unit
                  {course?.creditUnits ===
                  1
                    ? ""
                    : "s"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/10">
                  <p className="text-xs text-slate-300">
                    Students
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {
                      scoreStats.total
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/10">
                  <p className="text-xs text-slate-300">
                    Entered
                  </p>

                  <p className="mt-1 text-xl font-bold text-brand-gold">
                    {
                      scoreStats.entered
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/10">
                  <p className="text-xs text-slate-300">
                    Remaining
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {
                      scoreStats.remaining
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">
                Unable to save results
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">
                Results submitted
              </p>

              <p className="mt-1 text-sm">
                {successMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage("")
              }
              className="rounded-lg p-1 hover:bg-emerald-100"
              aria-label="Dismiss success message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =================================================
            INFO
        ================================================= */}

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <p className="text-sm font-semibold text-blue-900">
                Enter the final score out of
                100
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                The system automatically
                calculates the grade from the
                submitted score. Results are
                initially stored as drafts and
                can later be published by an
                Admin or Registrar.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search students by name, matric number or email..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/10"
            />
          </div>
        </div>

        {/* =================================================
            EMPTY ROSTER
        ================================================= */}

        {registrations.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <UserRound className="mx-auto h-12 w-12 text-slate-300" />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No registered students
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are currently no
              registered students for this
              course and semester.
            </p>
          </div>
        )}

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        {filteredRegistrations.length >
          0 && (
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Matric Number
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                      Score / 100
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                      Grade
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRegistrations.map(
                    (
                      registration,
                      index,
                    ) => {
                      const student =
                        getStudent(
                          registration,
                        );

                      const studentId =
                        getStudentId(
                          registration,
                        );

                      const rawScore =
                        scores[
                          studentId
                        ] ?? "";

                      const numericScore =
                        rawScore === ""
                          ? null
                          : Number(
                              rawScore,
                            );

                      const grade =
                        numericScore !==
                          null &&
                        !Number.isNaN(
                          numericScore,
                        )
                          ? calculateGrade(
                              numericScore,
                            )
                          : "";

                      const existing =
                        results.find(
                          (result) =>
                            getResultStudentId(
                              result,
                            ) ===
                            studentId,
                        );

                      return (
                        <tr
                          key={
                            registration._id ??
                            studentId
                          }
                          className={`border-t border-slate-100 transition hover:bg-slate-50 ${
                            index % 2 === 1
                              ? "bg-slate-50/30"
                              : ""
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-xs font-bold text-white">
                                {getInitials(
                                  student?.name,
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {student?.name ??
                                    "Unknown Student"}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {student?.email ??
                                    "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-mono text-sm font-semibold text-slate-700">
                              {student?.matricNumber ??
                                "N/A"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-center">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={
                                  rawScore
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateScore(
                                    studentId,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                placeholder="0–100"
                                className="h-11 w-28 rounded-xl border border-slate-200 bg-white px-3 text-center text-sm font-bold text-brand-navy outline-none transition placeholder:text-slate-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/10"
                                aria-label={`Score for ${
                                  student?.name ??
                                  "student"
                                }`}
                              />
                            </div>
                          </td>

                          <td className="px-5 py-4 text-center">
                            {grade ? (
                              <span
                                className={`inline-flex min-w-10 items-center justify-center rounded-lg px-3 py-1.5 text-xs font-bold ${getGradeClass(
                                  grade,
                                )}`}
                              >
                                {grade}
                              </span>
                            ) : (
                              <span className="text-slate-300">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-center">
                            {existing ? (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                  existing.status ===
                                  "published"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                {existing.status ===
                                "published"
                                  ? "Published"
                                  : "Draft"}
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-400">
                                New
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================================================
            MOBILE CARDS
        ================================================= */}

        {filteredRegistrations.length >
          0 && (
          <div className="space-y-3 md:hidden">
            {filteredRegistrations.map(
              (registration) => {
                const student =
                  getStudent(
                    registration,
                  );

                const studentId =
                  getStudentId(
                    registration,
                  );

                const rawScore =
                  scores[
                    studentId
                  ] ?? "";

                const numericScore =
                  rawScore === ""
                    ? null
                    : Number(
                        rawScore,
                      );

                const grade =
                  numericScore !== null &&
                  !Number.isNaN(
                    numericScore,
                  )
                    ? calculateGrade(
                        numericScore,
                      )
                    : "";

                const existing =
                  results.find(
                    (result) =>
                      getResultStudentId(
                        result,
                      ) === studentId,
                  );

                return (
                  <div
                    key={
                      registration._id ??
                      studentId
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-xs font-bold text-white">
                        {getInitials(
                          student?.name,
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {student?.name ??
                            "Unknown Student"}
                        </p>

                        <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
                          {student?.matricNumber ??
                            "No matric number"}
                        </p>
                      </div>

                      {existing && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            existing.status ===
                            "published"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {existing.status ===
                          "published"
                            ? "Published"
                            : "Draft"}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                          Score / 100
                        </label>

                        <input
                          type="text"
                          inputMode="decimal"
                          value={
                            rawScore
                          }
                          onChange={(
                            event,
                          ) =>
                            updateScore(
                              studentId,
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="0–100"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-brand-navy outline-none focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/10"
                        />
                      </div>

                      <div>
                        <p className="mb-1.5 text-xs font-semibold text-slate-500">
                          Grade
                        </p>

                        <div className="flex h-11 items-center">
                          {grade ? (
                            <span
                              className={`inline-flex min-w-11 items-center justify-center rounded-xl px-3 py-2 text-sm font-bold ${getGradeClass(
                                grade,
                              )}`}
                            >
                              {grade}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-300">
                              No score
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>

      {/* ===================================================
          STICKY ACTION BAR
      ================================================== */}

      {registrations.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-md md:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <p className="font-semibold text-slate-900">
                {scoreStats.entered} of{" "}
                {scoreStats.total} scores
                entered
              </p>

              <p className="text-xs text-slate-500">
                All registered students
                must have a valid score before
                submission.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowSubmitModal(
                  true,
                )
              }
              disabled={
                submitting ||
                registrations.length ===
                  0
              }
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 text-sm font-bold text-white shadow-lg transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Send className="h-4 w-4" />
              Submit Results
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          SUBMIT MODAL
      ================================================== */}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gold/10">
                  <Send className="h-6 w-6 text-brand-gold" />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowSubmitModal(
                      false,
                    )
                  }
                  disabled={submitting}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 className="mt-5 text-xl font-bold text-brand-navy">
                Submit Course Results?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You are about to submit{" "}
                <strong className="text-slate-700">
                  {scoreStats.total}
                </strong>{" "}
                student result
                {scoreStats.total === 1
                  ? ""
                  : "s"}{" "}
                for{" "}
                <strong className="text-slate-700">
                  {course?.code}
                </strong>
                .
              </p>
            </div>

            <div className="space-y-3 p-6">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">
                  Scores entered
                </span>

                <span className="font-bold text-brand-navy">
                  {
                    scoreStats.entered
                  }
                  /
                  {
                    scoreStats.total
                  }
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">
                  Passing scores
                </span>

                <span className="font-bold text-emerald-600">
                  {
                    scoreStats.passed
                  }
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">
                  Failing scores
                </span>

                <span className="font-bold text-red-600">
                  {
                    scoreStats.failed
                  }
                </span>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                Results will be stored through
                the lecturer result endpoint.
                Admin or Registrar can later
                publish the results.
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowSubmitModal(
                    false,
                  )
                }
                disabled={submitting}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleSubmitResults()
                }
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-bold text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Confirm Submission
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}