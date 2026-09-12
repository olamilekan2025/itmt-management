"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Lecturer {
  _id: string;
  name: string;
  email?: string;
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
  session?: {
    _id: string;
    name: string;
    isActive?: boolean;
  };
}

interface Assignment {
  _id: string;
  lecturer:
    | Lecturer
    | string
    | null;
  course:
    | Course
    | string
    | null;
  semester:
    | Semester
    | string
    | null;
  isActive: boolean;
  createdAt?: string;
}

interface AssignmentsResponse {
  success: boolean;
  assignments?: Assignment[];
  message?: string;
}

interface UsersResponse {
  success: boolean;
  users?: Lecturer[];
  message?: string;
}

interface CoursesResponse {
  success: boolean;
  courses?: Course[];
  message?: string;
}

interface SemestersResponse {
  success: boolean;
  semesters?: Semester[];
  message?: string;
}

interface AssignmentForm {
  lecturer: string;
  course: string;
  semester: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getLecturerName(
  lecturer: Assignment["lecturer"],
) {
  if (!lecturer) return "Unknown lecturer";

  if (typeof lecturer === "string") {
    return lecturer;
  }

  return lecturer.name || "Unknown lecturer";
}

function getLecturerEmail(
  lecturer: Assignment["lecturer"],
) {
  if (!lecturer || typeof lecturer === "string") {
    return "";
  }

  return lecturer.email || "";
}

function getCourseCode(
  course: Assignment["course"],
) {
  if (!course) return "Unknown course";

  if (typeof course === "string") {
    return course;
  }

  return course.code || "Unknown course";
}

function getCourseTitle(
  course: Assignment["course"],
) {
  if (!course || typeof course === "string") {
    return "";
  }

  return course.title || "";
}

function getCreditUnits(
  course: Assignment["course"],
) {
  if (!course || typeof course === "string") {
    return 0;
  }

  return Number(course.creditUnits || 0);
}

function getSemesterName(
  semester: Assignment["semester"],
) {
  if (!semester) return "Unknown semester";

  if (typeof semester === "string") {
    return semester;
  }

  return semester.name || "Unknown semester";
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/* =========================================================
   PAGE
========================================================= */

export default function LecturerAssignmentsPage() {
  const { data: session, status: sessionStatus } =
    useSession();

  const accessToken = session?.accessToken;

  const [assignments, setAssignments] = useState<
    Assignment[]
  >([]);

  const [lecturers, setLecturers] = useState<Lecturer[]>(
    [],
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>(
    [],
  );

  const [selectedSemester, setSelectedSemester] =
    useState("");
  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingReferences, setLoadingReferences] =
    useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [removeModal, setRemoveModal] =
    useState<Assignment | null>(null);

  const [form, setForm] = useState<AssignmentForm>({
    lecturer: "",
    course: "",
    semester: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* =======================================================
     LOAD REFERENCES
  ======================================================== */

  const loadReferences = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoadingReferences(true);

      const [
        lecturersResponse,
        coursesResponse,
        semestersResponse,
      ] = await Promise.all([
        apiGet<UsersResponse>(
          "/users?role=lecturer",
          accessToken,
        ),
        apiGet<CoursesResponse>(
          "/courses?status=active",
          accessToken,
        ),
        apiGet<SemestersResponse>(
          "/semesters",
          accessToken,
        ),
      ]);

      setLecturers(lecturersResponse?.users || []);
      setCourses(coursesResponse?.courses || []);
      setSemesters(semestersResponse?.semesters || []);
    } catch (err) {
      console.error(
        "Failed to load assignment references:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load lecturers, courses, or semesters.",
      );
    } finally {
      setLoadingReferences(false);
    }
  }, [accessToken]);

  /* =======================================================
     LOAD ASSIGNMENTS
  ======================================================== */

  const loadAssignments = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (selectedSemester) {
        params.set("semester", selectedSemester);
      }

      if (selectedCourse) {
        params.set("course", selectedCourse);
      }

      const query = params.toString();

      const response =
        await apiGet<AssignmentsResponse>(
          `/lecturer-assignments${
            query ? `?${query}` : ""
          }`,
          accessToken,
        );

      setAssignments(response?.assignments || []);
    } catch (err) {
      console.error(
        "Failed to load lecturer assignments:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load lecturer assignments.",
      );

      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [
    accessToken,
    selectedSemester,
    selectedCourse,
  ]);

  useEffect(() => {
    if (
      sessionStatus !== "authenticated" ||
      !accessToken
    ) {
      return;
    }

    void loadReferences();
  }, [
    sessionStatus,
    accessToken,
    loadReferences,
  ]);

  useEffect(() => {
    if (
      sessionStatus !== "authenticated" ||
      !accessToken
    ) {
      return;
    }

    void loadAssignments();
  }, [
    sessionStatus,
    accessToken,
    loadAssignments,
  ]);

  /* =======================================================
     FILTER
  ======================================================== */

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return assignments;
    }

    return assignments.filter((assignment) => {
      const lecturerName = getLecturerName(
        assignment.lecturer,
      ).toLowerCase();

      const lecturerEmail = getLecturerEmail(
        assignment.lecturer,
      ).toLowerCase();

      const courseCode = getCourseCode(
        assignment.course,
      ).toLowerCase();

      const courseTitle = getCourseTitle(
        assignment.course,
      ).toLowerCase();

      const semesterName = getSemesterName(
        assignment.semester,
      ).toLowerCase();

      return (
        lecturerName.includes(query) ||
        lecturerEmail.includes(query) ||
        courseCode.includes(query) ||
        courseTitle.includes(query) ||
        semesterName.includes(query)
      );
    });
  }, [assignments, search]);

  const uniqueLecturers = useMemo(() => {
    const ids = new Set<string>();

    assignments.forEach((assignment) => {
      if (
        assignment.lecturer &&
        typeof assignment.lecturer !== "string"
      ) {
        ids.add(assignment.lecturer._id);
      }
    });

    return ids.size;
  }, [assignments]);

  const uniqueCourses = useMemo(() => {
    const ids = new Set<string>();

    assignments.forEach((assignment) => {
      if (
        assignment.course &&
        typeof assignment.course !== "string"
      ) {
        ids.add(assignment.course._id);
      }
    });

    return ids.size;
  }, [assignments]);

  const totalUnits = useMemo(
    () =>
      assignments.reduce(
        (total, assignment) =>
          total +
          getCreditUnits(assignment.course),
        0,
      ),
    [assignments],
  );

  /* =======================================================
     FORM
  ======================================================== */

  const openCreateModal = () => {
    setSuccess("");
    setError("");

    setForm({
      lecturer: "",
      course: "",
      semester: "",
    });

    setModalOpen(true);
  };

  const closeCreateModal = () => {
    if (submitting) return;

    setModalOpen(false);
  };

  const updateForm = (
    field: keyof AssignmentForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const selectedFormSemester = semesters.find(
    (semester) =>
      semester._id === form.semester,
  );

  const availableCourses = useMemo(() => {
    if (!form.semester) {
      return courses;
    }

    return courses.filter((course) => {
      const semester = course as Course & {
        semester?: string | { _id?: string };
      };

      if (!semester.semester) {
        return true;
      }

      if (
        typeof semester.semester === "string"
      ) {
        return semester.semester === form.semester;
      }

      return (
        semester.semester?._id ===
        form.semester
      );
    });
  }, [courses, form.semester]);

  const handleCreateAssignment = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !form.lecturer ||
      !form.course ||
      !form.semester
    ) {
      setError(
        "Please select a lecturer, course, and semester.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response =
        await apiPost<{
          success: boolean;
          message?: string;
        }>(
          "/lecturer-assignments",
          {
            lecturer: form.lecturer,
            course: form.course,
            semester: form.semester,
          },
          accessToken,
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to assign lecturer.",
        );
      }

      setModalOpen(false);

      setSuccess(
        response.message ||
          "Lecturer assigned successfully.",
      );

      await loadAssignments();
    } catch (err) {
      console.error(
        "Create lecturer assignment error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to assign lecturer.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     REMOVE
  ======================================================== */

  const handleRemoveAssignment = async () => {
    if (!removeModal || !accessToken) return;

    try {
      setRemoving(true);
      setError("");
      setSuccess("");

      const response =
        await apiPatch<{
          success: boolean;
          message?: string;
        }>(
          `/lecturer-assignments/${removeModal._id}/remove`,
          {},
          accessToken,
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to remove assignment.",
        );
      }

      setRemoveModal(null);

      setSuccess(
        response.message ||
          "Lecturer assignment removed successfully.",
      );

      await loadAssignments();
    } catch (err) {
      console.error(
        "Remove lecturer assignment error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove assignment.",
      );
    } finally {
      setRemoving(false);
    }
  };

  const clearFilters = () => {
    setSelectedSemester("");
    setSelectedCourse("");
    setSearch("");
  };

  const hasFilters =
    Boolean(selectedSemester) ||
    Boolean(selectedCourse) ||
    Boolean(search.trim());

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="h-7 w-7 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-10">
        {/* =================================================
            HERO
        ================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 text-white shadow-xl sm:p-8"
        >
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-brand-gold">
                <GraduationCap className="h-4 w-4" />
                Academic Operations
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Lecturer Assignments
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                Assign qualified lecturers to active
                courses for specific semesters and
                manage existing teaching assignments.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  void loadAssignments()
                }
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 text-sm font-bold text-brand-navy shadow-lg shadow-black/10 transition hover:brightness-105"
              >
                <Plus className="h-4 w-4" />
                Assign Lecturer
              </button>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            STATS
        ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Assignments"
            value={assignments.length}
            description="Active teaching assignments"
          />

          <StatCard
            icon={UserRound}
            label="Lecturers"
            value={uniqueLecturers}
            description="Lecturers currently assigned"
          />

          <StatCard
            icon={BookOpen}
            label="Courses"
            value={uniqueCourses}
            description="Courses with assignments"
          />

          <StatCard
            icon={CalendarDays}
            label="Credit Units"
            value={totalUnits}
            description="Assigned course units"
          />
        </div>

        {/* =================================================
            FEEDBACK
        ================================================== */}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {error && !modalOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* =================================================
            FILTERS
        ================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">
                Assignment Directory
              </h2>

              <p className="text-sm text-slate-500">
                Search and filter active lecturer
                assignments.
              </p>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-gold"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search lecturer or course..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/10"
              />
            </div>

            <SelectField
              value={selectedSemester}
              onChange={setSelectedSemester}
              disabled={loadingReferences}
              placeholder="All semesters"
              options={semesters.map(
                (semester) => ({
                  value: semester._id,
                  label: semester.name,
                }),
              )}
            />

            <SelectField
              value={selectedCourse}
              onChange={setSelectedCourse}
              disabled={loadingReferences}
              placeholder="All courses"
              options={courses.map(
                (course) => ({
                  value: course._id,
                  label: `${course.code} — ${course.title}`,
                }),
              )}
            />
          </div>
        </section>

        {/* =================================================
            TABLE
        ================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="font-bold text-brand-navy">
              Active Assignments
            </h2>

            <p className="text-sm text-slate-500">
              Showing{" "}
              {filteredAssignments.length} of{" "}
              {assignments.length} assignments
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <RefreshCw className="h-7 w-7 animate-spin text-brand-gold" />
                <span className="text-sm">
                  Loading assignments...
                </span>
              </div>
            </div>
          ) : filteredAssignments.length ===
            0 ? (
            <EmptyState
              hasFilters={hasFilters}
              onAssign={openCreateModal}
            />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4 font-semibold">
                        Lecturer
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        Course
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        Semester
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        Units
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        Assigned
                      </th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredAssignments.map(
                      (assignment) => (
                        <tr
                          key={assignment._id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white">
                                {getLecturerName(
                                  assignment.lecturer,
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {getLecturerName(
                                    assignment.lecturer,
                                  )}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {getLecturerEmail(
                                    assignment.lecturer,
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-brand-navy">
                              {getCourseCode(
                                assignment.course,
                              )}
                            </p>

                            <p className="max-w-[260px] truncate text-xs text-slate-500">
                              {getCourseTitle(
                                assignment.course,
                              )}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {getSemesterName(
                                assignment.semester,
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm font-bold text-brand-navy">
                            {getCreditUnits(
                              assignment.course,
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatDate(
                              assignment.createdAt,
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setRemoveModal(
                                  assignment,
                                )
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-slate-100 lg:hidden">
                {filteredAssignments.map(
                  (assignment) => (
                    <div
                      key={assignment._id}
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white">
                            {getLecturerName(
                              assignment.lecturer,
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {getLecturerName(
                                assignment.lecturer,
                              )}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {getLecturerEmail(
                                assignment.lecturer,
                              )}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <InfoItem
                          label="Course"
                          value={`${getCourseCode(
                            assignment.course,
                          )} — ${getCourseTitle(
                            assignment.course,
                          )}`}
                        />

                        <InfoItem
                          label="Semester"
                          value={getSemesterName(
                            assignment.semester,
                          )}
                        />

                        <InfoItem
                          label="Credit Units"
                          value={String(
                            getCreditUnits(
                              assignment.course,
                            ),
                          )}
                        />

                        <InfoItem
                          label="Assigned"
                          value={formatDate(
                            assignment.createdAt,
                          )}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setRemoveModal(
                            assignment,
                          )
                        }
                        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Assignment
                      </button>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* =====================================================
          CREATE MODAL
      ====================================================== */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-navy/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="w-full max-w-xl rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/5">
                  <GraduationCap className="h-5 w-5 text-brand-navy" />
                </div>

                <h2 className="text-xl font-bold text-brand-navy">
                  Assign Lecturer
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Assign a lecturer to a course for a
                  specific semester.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={submitting}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateAssignment}
              className="space-y-5 p-6"
            >
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <FormSelect
                label="Lecturer"
                value={form.lecturer}
                onChange={(value) =>
                  updateForm(
                    "lecturer",
                    value,
                  )
                }
                placeholder={
                  loadingReferences
                    ? "Loading lecturers..."
                    : "Select lecturer"
                }
                disabled={
                  loadingReferences ||
                  submitting
                }
                options={lecturers.map(
                  (lecturer) => ({
                    value: lecturer._id,
                    label: lecturer.email
                      ? `${lecturer.name} — ${lecturer.email}`
                      : lecturer.name,
                  }),
                )}
              />

              <FormSelect
                label="Semester"
                value={form.semester}
                onChange={(value) =>
                  updateForm(
                    "semester",
                    value,
                  )
                }
                placeholder={
                  loadingReferences
                    ? "Loading semesters..."
                    : "Select semester"
                }
                disabled={
                  loadingReferences ||
                  submitting
                }
                options={semesters.map(
                  (semester) => ({
                    value: semester._id,
                    label: semester.session?.name
                      ? `${semester.session.name} — ${semester.name}`
                      : semester.name,
                  }),
                )}
              />

              <FormSelect
                label="Course"
                value={form.course}
                onChange={(value) =>
                  updateForm(
                    "course",
                    value,
                  )
                }
                placeholder={
                  loadingReferences
                    ? "Loading courses..."
                    : form.semester
                      ? "Select course for this semester"
                      : "Select semester first"
                }
                disabled={
                  loadingReferences ||
                  submitting ||
                  !form.semester
                }
                options={availableCourses.map(
                  (course) => ({
                    value: course._id,
                    label: `${course.code} — ${course.title}`,
                  }),
                )}
              />

              {selectedFormSemester && (
                <div className="rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy">
                        Selected semester
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {selectedFormSemester.session?.name
                          ? `${selectedFormSemester.session.name} — `
                          : ""}
                        {selectedFormSemester.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={submitting}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    loadingReferences
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-bold text-white shadow-lg transition hover:bg-brand-navy/95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Assign Lecturer
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* =====================================================
          REMOVE CONFIRMATION
      ====================================================== */}

      {removeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-brand-navy">
              Remove assignment?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are about to remove{" "}
              <strong className="text-slate-700">
                {getLecturerName(
                  removeModal.lecturer,
                )}
              </strong>{" "}
              from{" "}
              <strong className="text-slate-700">
                {getCourseCode(
                  removeModal.course,
                )}
              </strong>{" "}
              for{" "}
              <strong className="text-slate-700">
                {getSemesterName(
                  removeModal.semester,
                )}
              </strong>
              .
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setRemoveModal(null)
                }
                disabled={removing}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleRemoveAssignment()
                }
                disabled={removing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {removing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Remove Assignment
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-brand-navy">
            {value.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/10 disabled:cursor-not-allowed disabled:opacity-60"
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
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          disabled={disabled}
          className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-700 outline-none transition focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/10 disabled:cursor-not-allowed disabled:opacity-60"
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
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="line-clamp-2 text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onAssign,
}: {
  hasFilters: boolean;
  onAssign: () => void;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/5">
        <GraduationCap className="h-6 w-6 text-brand-navy" />
      </div>

      <h3 className="mt-4 text-base font-bold text-brand-navy">
        No lecturer assignments found
      </h3>

      <p className="mt-1 max-w-md text-sm text-slate-500">
        {hasFilters
          ? "No active assignments match the current search or filters."
          : "No lecturers have been assigned to courses yet."}
      </p>

      {!hasFilters && (
        <button
          type="button"
          onClick={onAssign}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-semibold text-white transition hover:bg-brand-navy/95"
        >
          <Plus className="h-4 w-4" />
          Assign Lecturer
        </button>
      )}
    </div>
  );
}