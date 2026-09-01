"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Loader2,
  UserCheck,
  Users,
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

import { apiGet, apiPost } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type Lecturer = {
  _id: string;
  name: string;
  email: string;
  role: "lecturer";
  isActive: boolean;
};

type LecturersResponse = {
  success: boolean;
  users?: Lecturer[];
  staff?: Lecturer[];
  message?: string;
};

type Course = {
  _id: string;
  code: string;
  title: string;
  creditUnits: number;
  level?: string;
  programme?:
    | {
        _id: string;
        name: string;
      }
    | string;
  semester?:
    | {
        _id: string;
        name: string;
      }
    | string;
  isActive?: boolean;
};

type CoursesResponse = {
  success: boolean;
  courses?: Course[];
  message?: string;
};

type Semester = {
  _id: string;
  name: string;
  order?: number;
  isActive?: boolean;
};

type SemestersResponse = {
  success: boolean;
  semesters?: Semester[];
  data?: Semester[];
  message?: string;
};

type AssignmentResponse = {
  success: boolean;
  message?: string;
  assignment?: unknown;
};

/* =========================================================
   PAGE
========================================================= */

export default function AdminAssignLecturerPage() {
  const router = useRouter();

  const { data: session, status } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  /* =======================================================
     DATA
  ======================================================== */

  const [lecturers, setLecturers] =
    useState<Lecturer[]>([]);

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [semesters, setSemesters] =
    useState<Semester[]>([]);

  /* =======================================================
     FORM
  ======================================================== */

  const [lecturerId, setLecturerId] =
    useState("");

  const [courseId, setCourseId] =
    useState("");

  const [semesterId, setSemesterId] =
    useState("");

  /* =======================================================
     STATE
  ======================================================== */

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* =========================================================
     LOAD FORM DATA
  ========================================================== */

  const loadFormData = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const [
        lecturersResponse,
        coursesResponse,
        semestersResponse,
      ] = await Promise.all([
        apiGet<LecturersResponse>(
          "/users?role=lecturer",
          accessToken,
        ),

        apiGet<CoursesResponse>(
          "/courses",
          accessToken,
        ),

        apiGet<SemestersResponse>(
          "/semesters",
          accessToken,
        ),
      ]);

      /* =====================================================
         LECTURERS
      ====================================================== */

      if (!lecturersResponse.success) {
        throw new Error(
          lecturersResponse.message ||
            "Unable to load lecturers.",
        );
      }

      const lecturerUsers =
        lecturersResponse.users ??
        lecturersResponse.staff ??
        [];

      setLecturers(
        lecturerUsers.filter(
          (lecturer) =>
            lecturer.role === "lecturer" &&
            lecturer.isActive,
        ),
      );

      /* =====================================================
         COURSES
      ====================================================== */

      if (!coursesResponse.success) {
        throw new Error(
          coursesResponse.message ||
            "Unable to load courses.",
        );
      }

      setCourses(
        (coursesResponse.courses ?? []).filter(
          (course) =>
            course.isActive !== false,
        ),
      );

      /* =====================================================
         SEMESTERS
      ====================================================== */

      if (!semestersResponse.success) {
        throw new Error(
          semestersResponse.message ||
            "Unable to load semesters.",
        );
      }

      const semesterList =
        semestersResponse.semesters ??
        semestersResponse.data ??
        [];

      setSemesters(
        semesterList.filter(
          (semester) =>
            semester.isActive !== false,
        ),
      );
    } catch (error) {
      console.error(
        "Load assignment form data error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to load assignment data.";

      setErrorMessage(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  /* =========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (status === "unauthenticated") {
      setLoading(false);
      setErrorMessage(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    if (
      status === "authenticated" &&
      accessToken
    ) {
      void loadFormData();
    }
  }, [
    status,
    accessToken,
    loadFormData,
  ]);

  /* =========================================================
     SELECTED COURSE
  ========================================================== */

  const selectedCourse = useMemo(
    () =>
      courses.find(
        (course) =>
          course._id === courseId,
      ),
    [courses, courseId],
  );

  /* =========================================================
     COURSE FILTER
  ========================================================== */

  /*
   * The backend already guarantees that a course
   * belongs to its semester.
   *
   * Therefore, once a semester is selected,
   * only show courses belonging to that semester.
   */

  const availableCourses = useMemo(() => {
    if (!semesterId) {
      return courses;
    }

    return courses.filter((course) => {
      if (!course.semester) {
        return false;
      }

      const courseSemesterId =
        typeof course.semester === "string"
          ? course.semester
          : course.semester._id;

      return (
        String(courseSemesterId) ===
        String(semesterId)
      );
    });
  }, [courses, semesterId]);

  /* =========================================================
     SEMESTER CHANGE
  ========================================================== */

  const handleSemesterChange = (
    value: string,
  ) => {
    setSemesterId(value);

    /*
     * The currently selected course may belong
     * to another semester.
     */
    setCourseId("");
  };

  /* =========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!accessToken) {
      toast.error(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    if (!lecturerId) {
      toast.error(
        "Please select a lecturer.",
      );
      return;
    }

    if (!courseId) {
      toast.error(
        "Please select a course.",
      );
      return;
    }

    if (!semesterId) {
      toast.error(
        "Please select a semester.",
      );
      return;
    }

    /*
     * Extra frontend validation.
     *
     * The backend performs the authoritative
     * validation again.
     */
    if (
      selectedCourse?.semester
    ) {
      const courseSemesterId =
        typeof selectedCourse.semester ===
        "string"
          ? selectedCourse.semester
          : selectedCourse.semester._id;

      if (
        String(courseSemesterId) !==
        String(semesterId)
      ) {
        toast.error(
          "The selected course does not belong to the selected semester.",
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      const response =
        await apiPost<AssignmentResponse>(
          "/lecturer-assignments",
          {
            lecturer: lecturerId,
            course: courseId,
            semester: semesterId,
          },
          accessToken,
        );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to assign lecturer.",
        );
      }

      toast.success(
        response.message ||
          "Lecturer assigned successfully.",
      );

      /*
       * Return to lecturer directory after
       * successful assignment.
       */
      router.push(
        "/dashboards/admin/lecturers",
      );
      router.refresh();
    } catch (error) {
      console.error(
        "Assign lecturer error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to assign lecturer.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================== */

  if (
    status === "loading" ||
    loading
  ) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <p className="text-sm text-slate-500">
            Loading assignment form...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================== */

  if (errorMessage) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center px-4">
        <Card className="w-full border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-brand-dark">
              Unable to load assignment form
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {errorMessage}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(
                    "/dashboards/admin/lecturers",
                  )
                }
                className="rounded-xl"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Lecturers
              </Button>

              <Button
                type="button"
                onClick={() =>
                  void loadFormData()
                }
                className="rounded-xl bg-brand-navy text-white hover:bg-brand-navy/95"
              >
                Try Again
              </Button>
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
    <div className="mx-auto w-full space-y-6 pb-10">
      {/* =====================================================
          BACK
      ====================================================== */}

      <Link
        href="/dashboards/admin/lecturers"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Lecturers
      </Link>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gold/10 ring-1 ring-brand-gold/20">
              <UserCheck className="h-7 w-7 text-brand-gold" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1">
                <GraduationCap className="h-3.5 w-3.5 text-brand-gold" />

                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Academic Management
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Assign Lecturer
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                Assign an active lecturer to a
                course for a specific academic
                semester.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={
            <Users className="h-5 w-5 text-brand-navy" />
          }
          label="Available Lecturers"
          value={lecturers.length}
        />

        <SummaryCard
          icon={
            <BookOpen className="h-5 w-5 text-brand-gold" />
          }
          label="Available Courses"
          value={availableCourses.length}
        />

        <SummaryCard
          icon={
            <GraduationCap className="h-5 w-5 text-emerald-600" />
          }
          label="Semesters"
          value={semesters.length}
        />
      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <CardTitle className="text-base font-semibold text-brand-dark">
            Assignment Details
          </CardTitle>

          <p className="text-xs leading-5 text-slate-500">
            Select the lecturer, semester and
            course to create the teaching
            assignment.
          </p>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* =================================================
                LECTURER
            ================================================== */}

            <FormField
              label="Lecturer"
              description="Only active lecturer accounts are shown."
              icon={
                <UserCheck className="h-4 w-4" />
              }
            >
              <SelectField
                value={lecturerId}
                onChange={setLecturerId}
                placeholder="Select a lecturer"
                disabled={
                  submitting ||
                  lecturers.length === 0
                }
                options={lecturers.map(
                  (lecturer) => ({
                    value: lecturer._id,
                    label: lecturer.name,
                    description:
                      lecturer.email,
                  }),
                )}
              />
            </FormField>

            {/* =================================================
                SEMESTER
            ================================================== */}

            <FormField
              label="Semester"
              description="Select the academic semester for this assignment."
              icon={
                <GraduationCap className="h-4 w-4" />
              }
            >
              <SelectField
                value={semesterId}
                onChange={handleSemesterChange}
                placeholder="Select a semester"
                disabled={
                  submitting ||
                  semesters.length === 0
                }
                options={semesters
                  .slice()
                  .sort(
                    (a, b) =>
                      (a.order ?? 0) -
                      (b.order ?? 0),
                  )
                  .map((semester) => ({
                    value: semester._id,
                    label: semester.name,
                  }))}
              />
            </FormField>

            {/* =================================================
                COURSE
            ================================================== */}

            <FormField
              label="Course"
              description={
                semesterId
                  ? "Only courses belonging to the selected semester are shown."
                  : "Select a semester first."
              }
              icon={
                <BookOpen className="h-4 w-4" />
              }
            >
              <SelectField
                value={courseId}
                onChange={setCourseId}
                placeholder={
                  semesterId
                    ? "Select a course"
                    : "Select semester first"
                }
                disabled={
                  submitting ||
                  !semesterId ||
                  availableCourses.length === 0
                }
                options={availableCourses.map(
                  (course) => ({
                    value: course._id,
                    label: `${course.code} — ${course.title}`,
                    description: `${course.creditUnits} credit ${
                      course.creditUnits === 1
                        ? "unit"
                        : "units"
                    }${
                      course.level
                        ? ` • ${course.level}`
                        : ""
                    }`,
                  }),
                )}
              />
            </FormField>

            {/* =================================================
                SELECTED COURSE PREVIEW
            ================================================== */}

            {selectedCourse && (
              <div className="rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10">
                    <BookOpen className="h-5 w-5 text-brand-navy" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Selected Course
                    </p>

                    <p className="mt-1 text-sm font-bold text-brand-dark">
                      {selectedCourse.code}
                    </p>

                    <p className="mt-0.5 text-sm text-slate-600">
                      {selectedCourse.title}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-brand-gold/10 px-2.5 py-1 text-[11px] font-semibold text-brand-dark">
                        {selectedCourse.creditUnits}{" "}
                        credit{" "}
                        {selectedCourse.creditUnits ===
                        1
                          ? "unit"
                          : "units"}
                      </span>

                      {selectedCourse.level && (
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                          {selectedCourse.level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                DUPLICATE WARNING
            ================================================== */}

            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Assignment rule
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-800">
                  A lecturer cannot be assigned
                  to the same course more than
                  once for the same semester.
                  The server will enforce this
                  rule as well.
                </p>
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() =>
                  router.push(
                    "/dashboards/admin/lecturers",
                  )
                }
                className="h-11 rounded-xl"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  submitting ||
                  !lecturerId ||
                  !semesterId ||
                  !courseId
                }
                className="h-11 rounded-xl bg-brand-navy px-6 text-white hover:bg-brand-navy/95"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Assign Lecturer
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  description,
  icon,
  children,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-brand-navy">
            {icon}
          </span>

          <label className="text-sm font-semibold text-brand-dark">
            {label}
          </label>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  value,
  onChange,
  placeholder,
  disabled,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-800 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
            {option.description
              ? ` — ${option.description}`
              : ""}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {label}
            </p>

            <p className="mt-2 text-2xl font-bold text-brand-dark">
              {value}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}