"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createLecturerAssignment,
  getLecturerAssignments,
  removeLecturerAssignment,
  type Lecturer,
  type LecturerAssignment,
} from "@/lib/admin-lecturer-assignments";

import {
  getAdminCourses,
  getSemesters,
  type Course,
  type Semester,
} from "@/lib/admin-courses";

interface LecturerAssignmentsPageProps {
  initialAssignments: LecturerAssignment[];
  lecturers: Lecturer[];
  courses: Course[];
  semesters: Semester[];
  accessToken: string;
}

/**
 * Safely gets a semester ID whether the API returns
 * a populated semester object or just an ObjectId string.
 */
function getSemesterId(
  semester:
    | string
    | {
        _id: string;
        name: string;
        isActive?: boolean;
      }
    | Semester
    | null
    | undefined,
): string {
  if (!semester) return "";

  if (typeof semester === "string") {
    return semester;
  }

  return semester._id;
}

/**
 * Safely gets a semester name when the API returns
 * a populated semester object.
 */
function getSemesterName(
  semester:
    | string
    | {
        _id: string;
        name: string;
        isActive?: boolean;
      }
    | Semester
    | null
    | undefined,
): string {
  if (!semester || typeof semester === "string") {
    return "";
  }

  return semester.name ?? "";
}

/**
 * Safely gets a semester session name.
 */
function getSemesterSessionName(
  semester: Semester | null | undefined,
): string {
  if (!semester) return "";

  if (
    semester.session &&
    typeof semester.session !== "string"
  ) {
    return semester.session.name ?? "";
  }

  return "";
}

export default function LecturerAssignmentsPage({
  initialAssignments,
  lecturers: initialLecturers,
  courses: initialCourses,
  semesters: initialSemesters,
  accessToken,
}: LecturerAssignmentsPageProps) {
  const [assignments, setAssignments] =
    useState<LecturerAssignment[]>(initialAssignments);

  const [lecturers, setLecturers] =
    useState<Lecturer[]>(initialLecturers);

  const [courses, setCourses] =
    useState<Course[]>(initialCourses);

  const [semesters, setSemesters] =
    useState<Semester[]>(initialSemesters);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] =
    useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const [selectedAssignment, setSelectedAssignment] =
    useState<LecturerAssignment | null>(null);

  const [form, setForm] = useState({
    lecturer: "",
    course: "",
    semester: "",
  });

  async function loadAssignments() {
    setLoading(true);

    try {
      const response =
        await getLecturerAssignments(accessToken);

      setAssignments(response.assignments ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load lecturer assignments.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshSupportingData() {
    try {
      const [coursesResponse, semestersResponse] =
        await Promise.all([
          getAdminCourses(accessToken),
          getSemesters(accessToken),
        ]);

      setCourses(coursesResponse.courses ?? []);
      setSemesters(semestersResponse.semesters ?? []);
    } catch {
      // Main assignment data can still be used.
    }
  }

  useEffect(() => {
    setAssignments(initialAssignments);
    setLecturers(initialLecturers);
    setCourses(initialCourses);
    setSemesters(initialSemesters);
  }, [
    initialAssignments,
    initialLecturers,
    initialCourses,
    initialSemesters,
  ]);

  const filteredAssignments = useMemo(() => {
    const value = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const lecturerName =
        assignment.lecturer?.name ?? "";

      const lecturerEmail =
        assignment.lecturer?.email ?? "";

      const courseCode =
        assignment.course?.code ?? "";

      const courseTitle =
        assignment.course?.title ?? "";

      const semesterName =
        getSemesterName(assignment.semester);

      const matchesSearch =
        !value ||
        lecturerName.toLowerCase().includes(value) ||
        lecturerEmail.toLowerCase().includes(value) ||
        courseCode.toLowerCase().includes(value) ||
        courseTitle.toLowerCase().includes(value) ||
        semesterName.toLowerCase().includes(value);

      const matchesSemester =
        !semesterFilter ||
        getSemesterId(assignment.semester) ===
          semesterFilter;

      return matchesSearch && matchesSemester;
    });
  }, [assignments, search, semesterFilter]);

  const activeCount = assignments.filter(
    (assignment) => assignment.isActive,
  ).length;

  const uniqueLecturers = new Set(
    assignments.map(
      (assignment) => assignment.lecturer?._id,
    ),
  ).size;

  const uniqueCourses = new Set(
    assignments.map(
      (assignment) => assignment.course?._id,
    ),
  ).size;

  function openCreate() {
    const activeSemester = semesters.find(
      (semester) => semester.isActive,
    );

    setForm({
      lecturer: "",
      course: "",
      semester: activeSemester?._id ?? "",
    });

    setCreateOpen(true);
  }

  function closeCreate() {
    if (saving) return;

    setCreateOpen(false);

    setForm({
      lecturer: "",
      course: "",
      semester: "",
    });
  }

  function openRemove(
    assignment: LecturerAssignment,
  ) {
    setSelectedAssignment(assignment);
    setRemoveOpen(true);
  }

  function closeRemove() {
    if (saving) return;

    setRemoveOpen(false);
    setSelectedAssignment(null);
  }

  async function handleCreate(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !form.lecturer ||
      !form.course ||
      !form.semester
    ) {
      toast.error(
        "Please select a lecturer, course, and semester.",
      );
      return;
    }

    setSaving(true);

    try {
      await createLecturerAssignment(
        {
          lecturer: form.lecturer,
          course: form.course,
          semester: form.semester,
        },
        accessToken,
      );

      toast.success(
        "Lecturer assigned successfully.",
      );

      closeCreate();
      await loadAssignments();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to assign lecturer.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!selectedAssignment) return;

    setSaving(true);

    try {
      await removeLecturerAssignment(
        selectedAssignment._id,
        accessToken,
      );

      toast.success(
        "Lecturer assignment removed successfully.",
      );

      closeRemove();
      await loadAssignments();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to remove lecturer assignment.",
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedSemesterCourses = form.semester
    ? courses.filter(
        (course) =>
          getSemesterId(course.semester) ===
          form.semester,
      )
    : [];

  return (
    <div className="min-h-full space-y-8 pb-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-brand-navy shadow-lg">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Users className="h-5 w-5 text-brand-gold" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Academic Management
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Lecturer Assignments
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Assign lecturers to courses for specific
              academic semesters and manage teaching
              responsibilities.
            </p>
          </div>

          <Button
            onClick={openCreate}
            className="h-11 rounded-xl bg-brand-gold px-5 font-semibold text-brand-dark shadow-md hover:bg-brand-gold/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Assign Lecturer
          </Button>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Assignments"
          value={String(assignments.length)}
          description="Current teaching assignments"
          icon={ClipboardList}
        />

        <StatCard
          title="Active Assignments"
          value={String(activeCount)}
          description="Currently active"
          icon={CheckCircle2}
        />

        <StatCard
          title="Lecturers"
          value={String(uniqueLecturers)}
          description="Assigned lecturers"
          icon={Users}
        />

        <StatCard
          title="Courses"
          value={String(uniqueCourses)}
          description="Courses with assignments"
          icon={BookOpen}
        />
      </section>

      {/* Directory */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-brand-dark">
                Assignment Directory
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                {filteredAssignments.length}{" "}
                {filteredAssignments.length === 1
                  ? "assignment"
                  : "assignments"}{" "}
                displayed
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search assignments..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 sm:w-64"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <select
                value={semesterFilter}
                onChange={(event) =>
                  setSemesterFilter(event.target.value)
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
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

              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  await Promise.all([
                    loadAssignments(),
                    refreshSupportingData(),
                  ]);
                }}
                disabled={loading}
                className="h-10 w-10 rounded-xl bg-white"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-100 p-4"
                >
                  <div className="h-11 w-11 rounded-xl bg-slate-100" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-slate-100" />
                    <div className="h-3 w-64 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
                <ClipboardList className="h-7 w-7 text-brand-navy/50" />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-800">
                {search || semesterFilter
                  ? "No assignments found"
                  : "No lecturer assignments yet"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {search || semesterFilter
                  ? "Try adjusting your search or semester filter."
                  : "Assign your first lecturer to a course to get started."}
              </p>

              {!search && !semesterFilter && (
                <Button
                  onClick={openCreate}
                  className="mt-5 rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Lecturer
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">
                        Lecturer
                      </th>
                      <th className="px-6 py-4">
                        Course
                      </th>
                      <th className="px-6 py-4">
                        Semester
                      </th>
                      <th className="px-6 py-4">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAssignments.map(
                      (assignment) => (
                        <tr
                          key={assignment._id}
                          className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 last:border-0"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/5">
                                <User className="h-4 w-4 text-brand-navy" />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {assignment.lecturer?.name ??
                                    "Unknown Lecturer"}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {assignment.lecturer?.email ??
                                    "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <p className="font-semibold text-slate-800">
                              {assignment.course?.code ??
                                "—"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {assignment.course?.title ??
                                "—"}
                            </p>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {getSemesterName(
                              assignment.semester,
                            ) || "—"}
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  openRemove(
                                    assignment,
                                  )
                                }
                                className="rounded-lg font-medium text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Remove
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredAssignments.map(
                  (assignment) => (
                    <div
                      key={assignment._id}
                      className="rounded-2xl border border-slate-200 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5">
                          <User className="h-4 w-4 text-brand-navy" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800">
                            {assignment.lecturer?.name ??
                              "Unknown Lecturer"}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {assignment.lecturer?.email ??
                              "—"}
                          </p>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                          Active
                        </span>
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Course
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {assignment.course?.code ??
                            "—"}
                        </p>

                        <p className="text-sm text-slate-500">
                          {assignment.course?.title ??
                            "—"}
                        </p>

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Semester
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {getSemesterName(
                            assignment.semester,
                          ) || "—"}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          openRemove(assignment)
                        }
                        className="mt-4 w-full rounded-lg text-red-600 hover:border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Remove Assignment
                      </Button>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!saving) {
            open ? setCreateOpen(true) : closeCreate();
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl sm:max-w-lg">
          <DialogHeader className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
            <DialogTitle className="text-lg font-semibold text-brand-dark">
              Assign Lecturer
            </DialogTitle>

            <DialogDescription className="mt-1 text-xs leading-5 text-slate-500">
              Assign an active lecturer to a course for
              a specific semester.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate}>
            <div className="space-y-5 px-6 py-6">
              {/* Lecturer */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Lecturer *
                </label>

                <select
                  required
                  value={form.lecturer}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      lecturer: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                >
                  <option value="">
                    Select lecturer
                  </option>

                  {lecturers.map((lecturer) => (
                    <option
                      key={lecturer._id}
                      value={lecturer._id}
                    >
                      {lecturer.name} —{" "}
                      {lecturer.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Semester *
                </label>

                <select
                  required
                  value={form.semester}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      semester: event.target.value,
                      course: "",
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                >
                  <option value="">
                    Select semester
                  </option>

                  {semesters.map((semester) => {
                    const sessionName =
                      getSemesterSessionName(semester);

                    return (
                      <option
                        key={semester._id}
                        value={semester._id}
                      >
                        {semester.name}
                        {sessionName
                          ? ` — ${sessionName}`
                          : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Course */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Course *
                </label>

                <select
                  required
                  value={form.course}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      course: event.target.value,
                    }))
                  }
                  disabled={!form.semester}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-50 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                >
                  <option value="">
                    {form.semester
                      ? "Select course"
                      : "Select semester first"}
                  </option>

                  {selectedSemesterCourses.map(
                    (course) => (
                      <option
                        key={course._id}
                        value={course._id}
                      >
                        {course.code} — {course.title}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {form.semester &&
                selectedSemesterCourses.length === 0 && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-700">
                    No courses are available for the
                    selected semester.
                  </div>
                )}
            </div>

            <DialogFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeCreate}
                disabled={saving}
                className="rounded-xl"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  saving ||
                  !form.lecturer ||
                  !form.course ||
                  !form.semester
                }
                className="min-w-[150px] rounded-xl"
              >
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Lecturer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog
        open={removeOpen}
        onOpenChange={(open) => {
          if (!saving) {
            open
              ? setRemoveOpen(true)
              : closeRemove();
          }
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <DialogTitle className="text-lg text-brand-dark">
                  Remove Lecturer Assignment?
                </DialogTitle>

                <DialogDescription className="mt-1 text-xs leading-5">
                  This will remove the lecturer from
                  this course for the selected semester.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedAssignment && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">
                {selectedAssignment.lecturer?.name ??
                  "Unknown Lecturer"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {selectedAssignment.course?.code ??
                  "—"}{" "}
                —{" "}
                {selectedAssignment.course?.title ??
                  "—"}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {getSemesterName(
                  selectedAssignment.semester,
                ) || "—"}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeRemove}
              disabled={saving}
              className="rounded-xl"
            >
              Cancel
            </Button>

            <Button
              onClick={handleRemove}
              disabled={saving}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Assignment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">
              {value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/10">
            <Icon className="h-5 w-5 text-brand-navy" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

