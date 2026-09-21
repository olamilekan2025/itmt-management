"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import type { ReactNode } from "react";

import { apiGet, apiPost } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Programme {
  _id?: string;
  name?: string;
  code?: string;
}

interface AcademicSession {
  _id?: string;
  name?: string;
}

interface StudentUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  matricNumber?: string | null;
  level?: string | number | null;
  programme?: Programme | string | null;
  academicSession?: AcademicSession | string | null;
  accessToken?: string;
}

interface StudentSession {
  user?: StudentUser;
}

interface CourseSemester {
  _id?: string;
  name?: string;
  order?: number;
}

interface CourseProgramme {
  _id?: string;
  name?: string;
  code?: string;
}

interface Course {
  _id: string;
  code: string;
  title: string;
  programme?: CourseProgramme | string;
  semester?: CourseSemester | string;
  level?: string | number;
  creditUnits: number;
  category?: string;
  description?: string;
  isActive?: boolean;
}

interface RegistrationCourse {
  _id?: string;
  code?: string;
  title?: string;
  creditUnits?: number;
}

interface RegistrationSemester {
  _id?: string;
  name?: string;
  order?: number;
}

interface Registration {
  _id: string;
  course: RegistrationCourse | string;
  semester: RegistrationSemester | string;
  status?: string;
  createdAt?: string;
}

interface SemesterOption {
  id: string;
  name: string;
  order: number;
}

interface CoursesResponse {
  success?: boolean;
  courses?: Course[];
  message?: string;
}

interface RegistrationsResponse {
  success?: boolean;
  registrations?: Registration[];
  message?: string;
}

interface RegisterResponse {
  success?: boolean;
  message?: string;
  registrations?: Registration[];
}

/* =========================================================
   HELPERS
========================================================= */

function getProgrammeId(
  programme: StudentUser["programme"],
): string | undefined {
  if (!programme) {
    return undefined;
  }

  if (typeof programme === "string") {
    return programme;
  }

  return programme._id;
}

function getProgrammeName(
  programme: StudentUser["programme"],
): string {
  if (!programme) {
    return "Programme not available";
  }

  if (typeof programme === "string") {
    return programme;
  }

  return programme.name || "Programme not available";
}

function getProgrammeCode(
  programme: StudentUser["programme"],
): string {
  if (!programme || typeof programme === "string") {
    return "";
  }

  return programme.code || "";
}

function getSessionName(
  academicSession: StudentUser["academicSession"],
): string {
  if (!academicSession) {
    return "Academic session";
  }

  if (typeof academicSession === "string") {
    return academicSession;
  }

  return academicSession.name || "Academic session";
}

function getSemesterId(
  semester:
    | Course["semester"]
    | Registration["semester"],
): string | undefined {
  if (!semester) {
    return undefined;
  }

  if (typeof semester === "string") {
    return semester;
  }

  return semester._id;
}

function getSemesterName(
  semester:
    | Course["semester"]
    | Registration["semester"],
): string {
  if (!semester) {
    return "Semester";
  }

  if (typeof semester === "string") {
    return semester;
  }

  return semester.name || "Semester";
}

function getSemesterOrder(
  semester:
    | Course["semester"]
    | Registration["semester"],
): number {
  if (!semester || typeof semester === "string") {
    return 0;
  }

  return semester.order ?? 0;
}

function getCourseSemesterId(
  course: Course,
): string | undefined {
  return getSemesterId(course.semester);
}

function getCourseSemesterName(
  course: Course,
): string {
  return getSemesterName(course.semester);
}

function getRegistrationCourseId(
  registration: Registration,
): string | undefined {
  if (!registration.course) {
    return undefined;
  }

  if (typeof registration.course === "string") {
    return registration.course;
  }

  return registration.course._id;
}

function getRegistrationCreditUnits(
  registration: Registration,
): number {
  if (
    !registration.course ||
    typeof registration.course === "string"
  ) {
    return 0;
  }

  return Number(
    registration.course.creditUnits ?? 0,
  );
}

function getFirstName(
  name?: string | null,
): string {
  if (!name) {
    return "Student";
  }

  return (
    name.trim().split(/\s+/)[0] ||
    "Student"
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function StudentCourseRegistrationPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  /*
   * The NextAuth session already contains the API access token.
   * We use it directly instead of calling getSession() again.
   */
  const student =
    session?.user as StudentUser | undefined;

  const accessToken = student?.accessToken;

  const [courses, setCourses] = useState<Course[]>(
    [],
  );

  const [registrations, setRegistrations] =
    useState<Registration[]>([]);

  const [selectedCourses, setSelectedCourses] =
    useState<Set<string>>(
      new Set<string>(),
    );

  const [selectedSemester, setSelectedSemester] =
    useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [registering, setRegistering] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const maximumCreditUnits = 24;

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadRegistrationData =
    useCallback(
      async (
        showRefresh = false,
      ) => {
        /*
         * Never make protected API requests before
         * NextAuth has finished loading the session.
         */
        if (
          sessionStatus !==
          "authenticated"
        ) {
          return;
        }

        if (!accessToken) {
          setLoading(false);

          setError(
            "Authentication token is missing. Please sign out and sign in again.",
          );

          return;
        }

        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          /* -----------------------------------------------
             STUDENT REGISTRATIONS
          ------------------------------------------------ */

          const registrationResponse =
            await apiGet<RegistrationsResponse>(
              "/registrations/me",
              accessToken,
            );

          const registrationData =
            Array.isArray(
              registrationResponse.registrations,
            )
              ? registrationResponse.registrations
              : [];

          setRegistrations(
            registrationData,
          );

          /* -----------------------------------------------
             COURSE CATALOG
          ------------------------------------------------ */

          const programmeId =
            getProgrammeId(
              student?.programme,
            );

          const params =
            new URLSearchParams();

          if (programmeId) {
            params.set(
              "programme",
              programmeId,
            );
          }

          params.set(
            "status",
            "active",
          );

          const courseResponse =
            await apiGet<CoursesResponse>(
              `/courses?${params.toString()}`,
              accessToken,
            );

          const courseData =
            Array.isArray(
              courseResponse.courses,
            )
              ? courseResponse.courses
              : [];

          setCourses(courseData);

          /*
           * Only choose a default semester when there
           * isn't already a selected semester.
           *
           * We intentionally do NOT put selectedSemester
           * inside this callback's dependency list.
           */
          if (!selectedSemester) {
            const semesterMap =
              new Map<
                string,
                SemesterOption
              >();

            for (const registration of registrationData) {
              const id =
                getSemesterId(
                  registration.semester,
                );

              if (!id) {
                continue;
              }

              semesterMap.set(
                id,
                {
                  id,
                  name:
                    getSemesterName(
                      registration.semester,
                    ),
                  order:
                    getSemesterOrder(
                      registration.semester,
                    ),
                },
              );
            }

            for (const course of courseData) {
              const id =
                getCourseSemesterId(
                  course,
                );

              if (!id) {
                continue;
              }

              semesterMap.set(
                id,
                {
                  id,
                  name:
                    getCourseSemesterName(
                      course,
                    ),
                  order:
                    getSemesterOrder(
                      course.semester,
                    ),
                },
              );
            }

            const semesterList =
              Array.from(
                semesterMap.values(),
              ).sort(
                (a, b) =>
                  b.order - a.order,
              );

            if (
              semesterList.length > 0
            ) {
              setSelectedSemester(
                semesterList[0].id,
              );
            }
          }
        } catch (err) {
          console.error(
            "Student course registration error:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load course registration data.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        accessToken,
        sessionStatus,
        student?.programme,
        selectedSemester,
      ],
    );

  /*
   * Load once when authentication is ready.
   */
  useEffect(() => {
    if (
      sessionStatus ===
      "authenticated"
    ) {
      void loadRegistrationData();
    }
  }, [
    sessionStatus,
    accessToken,
  ]);

  /* =======================================================
     SEMESTERS
  ======================================================= */

  const semesters =
    useMemo<SemesterOption[]>(
      () => {
        const semesterMap =
          new Map<
            string,
            SemesterOption
          >();

        for (const course of courses) {
          const id =
            getCourseSemesterId(
              course,
            );

          if (!id) {
            continue;
          }

          semesterMap.set(
            id,
            {
              id,
              name:
                getCourseSemesterName(
                  course,
                ),
              order:
                getSemesterOrder(
                  course.semester,
                ),
            },
          );
        }

        for (const registration of registrations) {
          const id =
            getSemesterId(
              registration.semester,
            );

          if (!id) {
            continue;
          }

          semesterMap.set(
            id,
            {
              id,
              name:
                getSemesterName(
                  registration.semester,
                ),
              order:
                getSemesterOrder(
                  registration.semester,
                ),
            },
          );
        }

        return Array.from(
          semesterMap.values(),
        ).sort(
          (a, b) =>
            b.order - a.order,
        );
      },
      [
        courses,
        registrations,
      ],
    );

  /* =======================================================
     MAKE SURE SELECTED SEMESTER STILL EXISTS
  ======================================================= */

  useEffect(() => {
    if (
      semesters.length === 0
    ) {
      return;
    }

    const exists =
      semesters.some(
        (semester) =>
          semester.id ===
          selectedSemester,
      );

    if (!selectedSemester || !exists) {
      setSelectedSemester(
        semesters[0].id,
      );
    }
  }, [
    semesters,
    selectedSemester,
  ]);

  /* =======================================================
     REGISTERED COURSE IDS
  ======================================================= */

  const registeredCourseIds =
    useMemo(
      () =>
        new Set(
          registrations
            .map(
              getRegistrationCourseId,
            )
            .filter(
              (
                value,
              ): value is string =>
                Boolean(value),
            ),
        ),
      [registrations],
    );

  /* =======================================================
     CURRENT SEMESTER COURSES
  ======================================================= */

  const semesterCourses =
    useMemo(() => {
      if (!selectedSemester) {
        return courses;
      }

      return courses.filter(
        (course) =>
          getCourseSemesterId(
            course,
          ) === selectedSemester,
      );
    }, [
      courses,
      selectedSemester,
    ]);

  /* =======================================================
     SEARCH FILTER
  ======================================================= */

  const filteredCourses =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return semesterCourses;
      }

      return semesterCourses.filter(
        (course) =>
          course.code
            .toLowerCase()
            .includes(query) ||
          course.title
            .toLowerCase()
            .includes(query) ||
          course.category
            ?.toLowerCase()
            .includes(query),
      );
    }, [
      search,
      semesterCourses,
    ]);

  /* =======================================================
     SELECTED COURSE OBJECTS
  ======================================================= */

  const selectedCourseObjects =
    useMemo(
      () =>
        courses.filter(
          (course) =>
            selectedCourses.has(
              course._id,
            ),
        ),
      [
        courses,
        selectedCourses,
      ],
    );

  /* =======================================================
     SELECTED CREDIT UNITS
  ======================================================= */

  const selectedCreditUnits =
    useMemo(
      () =>
        selectedCourseObjects.reduce(
          (total, course) =>
            total +
            Number(
              course.creditUnits ??
                0,
            ),
          0,
        ),
      [selectedCourseObjects],
    );

  /* =======================================================
     CURRENT SEMESTER REGISTRATIONS
  ======================================================= */

  const currentSemesterRegistrations =
    useMemo(() => {
      if (!selectedSemester) {
        return registrations;
      }

      return registrations.filter(
        (registration) =>
          getSemesterId(
            registration.semester,
          ) === selectedSemester,
      );
    }, [
      registrations,
      selectedSemester,
    ]);

  /* =======================================================
     CURRENT REGISTERED CREDITS
  ======================================================= */

  const currentSemesterRegisteredCredits =
    useMemo(
      () =>
        currentSemesterRegistrations.reduce(
          (
            total,
            registration,
          ) =>
            total +
            getRegistrationCreditUnits(
              registration,
            ),
          0,
        ),
      [
        currentSemesterRegistrations,
      ],
    );

  /* =======================================================
     AVAILABLE CREDIT SPACE
  ======================================================= */

  const availableCreditSpace =
    Math.max(
      0,
      maximumCreditUnits -
        currentSemesterRegisteredCredits,
    );

  /* =======================================================
     TOGGLE COURSE
  ======================================================= */

  function toggleCourse(
    course: Course,
  ) {
    /*
     * Already registered courses cannot be selected again.
     */
    if (
      registeredCourseIds.has(
        course._id,
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    setSelectedCourses(
      (previous) => {
        const next =
          new Set(previous);

        /*
         * Remove course if already selected.
         */
        if (
          next.has(course._id)
        ) {
          next.delete(
            course._id,
          );

          return next;
        }

        const courseUnits =
          Number(
            course.creditUnits ??
              0,
          );

        const nextCredits =
          selectedCreditUnits +
          courseUnits;

        /*
         * Do not allow the student to exceed
         * the remaining credit-unit capacity.
         */
        if (
          nextCredits >
          availableCreditSpace
        ) {
          setError(
            `You cannot select more than ${availableCreditSpace} additional credit unit${
              availableCreditSpace ===
              1
                ? ""
                : "s"
            } for this semester.`,
          );

          return next;
        }

        next.add(course._id);

        return next;
      },
    );
  }

  /* =======================================================
     CHANGE SEMESTER
  ======================================================= */

  function handleSemesterChange(
    semesterId: string,
  ) {
    setSelectedSemester(
      semesterId,
    );

    /*
     * Selected courses belong to the previous semester,
     * so clear them when the semester changes.
     */
    setSelectedCourses(
      new Set<string>(),
    );

    setError("");
    setSuccess("");
    setSearch("");
  }

  /* =======================================================
     REGISTER COURSES
  ======================================================= */

  async function handleRegister() {
    if (!selectedSemester) {
      setError(
        "Please select a semester.",
      );

      return;
    }

    if (
      selectedCourses.size === 0
    ) {
      setError(
        "Please select at least one course.",
      );

      return;
    }

    if (
      selectedCreditUnits >
      availableCreditSpace
    ) {
      setError(
        `You can only add ${availableCreditSpace} more credit unit${
          availableCreditSpace ===
          1
            ? ""
            : "s"
        } this semester.`,
      );

      return;
    }

    if (!accessToken) {
      setError(
        "Authentication token is missing. Please sign in again.",
      );

      return;
    }

    try {
      setRegistering(true);
      setError("");
      setSuccess("");

      const response =
        await apiPost<RegisterResponse>(
          "/registrations",
          {
            semester:
              selectedSemester,
            courses:
              Array.from(
                selectedCourses,
              ),
          },
          accessToken,
        );

      setSuccess(
        response.message ||
          "Courses registered successfully.",
      );

      setSelectedCourses(
        new Set<string>(),
      );

      /*
       * Reload registrations and course data
       * after successful registration.
       */
      await loadRegistrationData(
        true,
      );
    } catch (err) {
      console.error(
        "Course registration error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to register selected courses.",
      );
    } finally {
      setRegistering(false);
    }
  }

  /* =======================================================
     AUTHENTICATION LOADING
  ======================================================= */

  if (
    sessionStatus ===
    "loading"
  ) {
    return (
      <RegistrationSkeleton />
    );
  }

  /* =======================================================
     AUTHENTICATION FAILURE
  ======================================================= */

  if (
    sessionStatus !==
    "authenticated"
  ) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center px-4">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Authentication required
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your student session is not
              available. Please sign in again
              to access course registration.
            </p>

            <Link
              href="/auth/login"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy/95"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     INITIAL DATA LOADING
  ======================================================= */

  if (loading) {
    return (
      <RegistrationSkeleton />
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-0 py-6 sm:px-0 lg:px-0 lg:py-8">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 shadow-xl sm:p-8 lg:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
                Student Academic Portal
              </div>

              <div className="flex items-start gap-4">
                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gold text-brand-navy sm:flex">
                  <GraduationCap className="h-7 w-7" />
                </div>

                <div>
                  <p className="mb-1 text-sm font-medium text-white/60">
                    Welcome back,{" "}
                    {getFirstName(
                      student?.name,
                    )}
                  </p>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    Course Registration
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                    Select the courses you want
                    to register for this
                    semester.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <InfoPill
                  icon="programme"
                  label={
                    getProgrammeCode(
                      student?.programme,
                    )
                  }
                  value={getProgrammeName(
                    student?.programme,
                  )}
                />

                <InfoPill
                  icon="level"
                  label="Level"
                  value={
                    student?.level
                      ? String(
                          student.level,
                        )
                      : "Not available"
                  }
                />

                <InfoPill
                  icon="session"
                  label="Session"
                  value={getSessionName(
                    student?.academicSession,
                  )}
                />
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/dashboards/student/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <BookOpen className="h-4 w-4" />
                My Courses
              </Link>

              <button
                type="button"
                onClick={() =>
                  void loadRegistrationData(
                    true,
                  )
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-sm font-bold text-brand-navy transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            ALERTS
        ================================================= */}

        <div className="mt-6 space-y-3">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div className="flex-1">
                <p className="font-semibold">
                  Registration issue
                </p>

                <p className="mt-1">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="rounded-lg p-1 transition hover:bg-red-100"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

              <div className="flex-1">
                <p className="font-semibold">
                  Registration successful
                </p>

                <p className="mt-1">
                  {success}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
                className="rounded-lg p-1 transition hover:bg-emerald-100"
                aria-label="Dismiss success message"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<BookOpen />}
            label="Registered Courses"
            value={String(
              currentSemesterRegistrations.length,
            )}
            description="This semester"
          />

          <SummaryCard
            icon={<GraduationCap />}
            label="Registered Units"
            value={String(
              currentSemesterRegisteredCredits,
            )}
            description={`Maximum ${maximumCreditUnits} units`}
          />

          <SummaryCard
            icon={<Plus />}
            label="Selected Courses"
            value={String(
              selectedCourses.size,
            )}
            description={`${selectedCreditUnits} selected units`}
          />

          <SummaryCard
            icon={<ShieldCheck />}
            label="Available Units"
            value={String(
              Math.max(
                0,
                availableCreditSpace -
                  selectedCreditUnits,
              ),
            )}
            description="Remaining capacity"
          />
        </section>

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* =================================================
              COURSE LIST
          ================================================= */}

          <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Available Courses
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Select the courses you want
                    to add.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {/* SEMESTER */}
                  <div className="relative min-w-[210px]">
                    <select
                      value={
                        selectedSemester
                      }
                      onChange={(event) =>
                        handleSemesterChange(
                          event.target.value,
                        )
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                    >
                      {semesters.length ===
                        0 && (
                        <option value="">
                          No semesters available
                        </option>
                      )}

                      {semesters.map(
                        (semester) => (
                          <option
                            key={
                              semester.id
                            }
                            value={
                              semester.id
                            }
                          >
                            {
                              semester.name
                            }
                          </option>
                        ),
                      )}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* SEARCH */}
                  <div className="relative min-w-[230px]">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value,
                        )
                      }
                      placeholder="Search courses..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-14 px-5 py-4" />

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Course
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Level
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Semester
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                      Units
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.map(
                    (course) => (
                      <CourseTableRow
                        key={
                          course._id
                        }
                        course={
                          course
                        }
                        registered={registeredCourseIds.has(
                          course._id,
                        )}
                        selected={selectedCourses.has(
                          course._id,
                        )}
                        onToggle={() =>
                          toggleCourse(
                            course,
                          )
                        }
                      />
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredCourses.map(
                (course) => (
                  <CourseMobileCard
                    key={
                      course._id
                    }
                    course={course}
                    registered={registeredCourseIds.has(
                      course._id,
                    )}
                    selected={selectedCourses.has(
                      course._id,
                    )}
                    onToggle={() =>
                      toggleCourse(
                        course,
                      )
                    }
                  />
                ),
              )}
            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {filteredCourses.length ===
              0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <BookOpen className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  No courses found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  No available courses match
                  your current filters.
                </p>
              </div>
            )}
          </div>

          {/* =================================================
              REGISTRATION SUMMARY
          ================================================= */}

          <aside className="h-fit xl:sticky xl:top-24">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-brand-navy p-5 text-white sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Registration Summary
                </p>

                <h3 className="mt-1 text-lg font-bold">
                  {selectedSemester
                    ? semesters.find(
                        (
                          semester,
                        ) =>
                          semester.id ===
                          selectedSemester,
                      )?.name ||
                      "Selected Semester"
                    : "Select Semester"}
                </h3>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Credit units
                    </p>

                    <p className="mt-1 text-3xl font-black text-slate-900">
                      {currentSemesterRegisteredCredits +
                        selectedCreditUnits}

                      <span className="ml-1 text-base text-slate-400">
                        /{" "}
                        {
                          maximumCreditUnits
                        }
                      </span>
                    </p>
                  </div>
                </div>

                {/* PROGRESS */}
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-gold transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        ((currentSemesterRegisteredCredits +
                          selectedCreditUnits) /
                          maximumCreditUnits) *
                          100,
                      )}%`,
                    }}
                  />
                </div>

                {/* DETAILS */}
                <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100">
                  <SummaryLine
                    label="Already registered"
                    value={`${currentSemesterRegistrations.length}`}
                  />

                  <SummaryLine
                    label="Newly selected"
                    value={`${selectedCourses.size}`}
                  />

                  <SummaryLine
                    label="Selected units"
                    value={`${selectedCreditUnits}`}
                  />

                  <SummaryLine
                    label="Remaining"
                    value={`${Math.max(
                      0,
                      availableCreditSpace -
                        selectedCreditUnits,
                    )} units`}
                  />
                </div>

                {/* INFORMATION */}
                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                    <p className="text-xs leading-5 text-blue-700">
                      You can register up to{" "}
                      <strong>
                        {
                          maximumCreditUnits
                        }
                      </strong>{" "}
                      credit units for a
                      semester.
                    </p>
                  </div>
                </div>

                {/* REGISTER */}
                <button
                  type="button"
                  onClick={
                    handleRegister
                  }
                  disabled={
                    registering ||
                    selectedCourses.size ===
                      0 ||
                    !selectedSemester
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-navy/95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {registering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Register Selected
                    </>
                  )}
                </button>

                {/* CLEAR */}
                {selectedCourses.size >
                  0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCourses(
                        new Set<string>(),
                      )
                    }
                    disabled={
                      registering
                    }
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   INFO PILL
========================================================= */

function InfoPill({
  icon,
  label,
  value,
}: {
  icon:
    | "programme"
    | "level"
    | "session";
  label: string;
  value: string;
}) {
  const Icon =
    icon === "programme"
      ? GraduationCap
      : icon === "level"
        ? BookOpen
        : Clock3;

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-brand-gold" />

      <span className="text-xs font-semibold text-white/50">
        {label}:
      </span>

      <span className="max-w-[240px] truncate text-xs font-semibold text-white/90">
        {value || "—"}
      </span>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY LINE
========================================================= */

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-xs font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   TABLE ROW
========================================================= */

function CourseTableRow({
  course,
  registered,
  selected,
  onToggle,
}: {
  course: Course;
  registered: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <tr
      className={
        selected
          ? "bg-brand-gold/[0.06]"
          : "transition hover:bg-slate-50"
      }
    >
      <td className="px-5 py-4">
        <button
          type="button"
          disabled={registered}
          onClick={onToggle}
          aria-label={
            registered
              ? "Course already registered"
              : selected
                ? "Deselect course"
                : "Select course"
          }
          className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${
            registered
              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
              : selected
                ? "border-brand-navy bg-brand-navy text-white"
                : "border-slate-300 bg-white hover:border-brand-navy"
          }`}
        >
          {(registered || selected) && (
            <Check className="h-3.5 w-3.5" />
          )}
        </button>
      </td>

      <td className="px-5 py-4">
        <p className="font-bold text-brand-navy">
          {course.code}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {course.title}
        </p>

        {course.category && (
          <p className="mt-1 text-[11px] text-slate-400">
            {course.category}
          </p>
        )}
      </td>

      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
        {course.level || "—"}
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {getCourseSemesterName(
          course,
        )}
      </td>

      <td className="px-5 py-4 text-center">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
          {course.creditUnits}
        </span>
      </td>

      <td className="px-5 py-4 text-right">
        {registered ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Registered
          </span>
        ) : selected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy/10 px-3 py-1.5 text-xs font-bold text-brand-navy">
            <Check className="h-3.5 w-3.5" />
            Selected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
            Available
          </span>
        )}
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE COURSE CARD
========================================================= */

function CourseMobileCard({
  course,
  registered,
  selected,
  onToggle,
}: {
  course: Course;
  registered: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={registered}
      onClick={onToggle}
      className={`block w-full p-4 text-left transition ${
        selected
          ? "bg-brand-gold/[0.05]"
          : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
            registered
              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
              : selected
                ? "border-brand-navy bg-brand-navy text-white"
                : "border-slate-300 bg-white"
          }`}
        >
          {(registered || selected) && (
            <Check className="h-3.5 w-3.5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-black text-brand-navy">
                {course.code}
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {course.title}
              </p>
            </div>

            <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
              {course.creditUnits} unit
              {course.creditUnits === 1
                ? ""
                : "s"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              Level{" "}
              {course.level || "—"}
            </span>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {getCourseSemesterName(
                course,
              )}
            </span>
          </div>

          <div className="mt-4">
            {registered ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Already Registered
              </span>
            ) : selected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy/10 px-3 py-1.5 text-xs font-bold text-brand-navy">
                <Check className="h-3.5 w-3.5" />
                Selected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                <Plus className="h-3.5 w-3.5" />
                Tap to Select
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   LOADING SKELETON
========================================================= */

function RegistrationSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HERO */}
        <div className="rounded-3xl bg-brand-navy p-8">
          <div className="h-6 w-40 animate-pulse rounded bg-white/10" />

          <div className="mt-5 h-10 w-72 animate-pulse rounded bg-white/10" />

          <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded bg-white/10" />
        </div>

        {/* SUMMARY */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />

              <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-200" />

              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />

            <div className="mt-6 space-y-5">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4"
                >
                  <div className="h-6 w-6 animate-pulse rounded bg-slate-200" />

                  <div className="flex-1">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

                    <div className="mt-2 h-3 w-52 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />

            <div className="mt-6 h-10 w-32 animate-pulse rounded bg-slate-200" />

            <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </main>
  );
}