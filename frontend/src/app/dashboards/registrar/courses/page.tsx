"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Edit3,
  Filter,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import { apiGet, apiPatch, apiPost } from "@/lib/api";

interface Programme {
  _id: string;
  name: string;
  code?: string;
  isActive?: boolean;
}

interface Semester {
  _id: string;
  name: string;
  order: number;
  session?: {
    _id?: string;
    name?: string;
    isActive?: boolean;
  };
  isActive?: boolean;
}

interface Course {
  _id: string;
  code: string;
  title: string;
  programme:
    | Programme
    | string;
  semester:
    | Semester
    | string;
  level: string;
  creditUnits: number;
  category?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CoursesResponse {
  success: boolean;
  courses: Course[];
}

interface ProgrammesResponse {
  success: boolean;
  programmes: Programme[];
}

interface SemestersResponse {
  success: boolean;
  semesters: Semester[];
}

interface CourseForm {
  code: string;
  title: string;
  programme: string;
  semester: string;
  level: string;
  creditUnits: string;
  category: string;
  description: string;
}

function programmeName(programme: Course["programme"]) {
  if (typeof programme === "string") return programme;

  return programme?.name || "Unknown programme";
}

function programmeCode(programme: Course["programme"]) {
  if (typeof programme === "string") return "";

  return programme?.code || "";
}

function semesterName(semester: Course["semester"]) {
  if (typeof semester === "string") return semester;

  return semester?.name || "Unknown semester";
}

const emptyForm: CourseForm = {
  code: "",
  title: "",
  programme: "",
  semester: "",
  level: "",
  creditUnits: "3",
  category: "",
  description: "",
};

export default function CoursesPage() {
  const { data: session, status } = useSession();

  const [courses, setCourses] = useState<Course[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [search, setSearch] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(
    null,
  );

  const [form, setForm] = useState<CourseForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = session?.accessToken;

  const loadProgrammes = useCallback(async () => {
    if (!token) return;

    const response = await apiGet<ProgrammesResponse>(
      "/programmes",
      token,
    );

    if (!response?.success) {
      throw new Error("Unable to retrieve programmes.");
    }

    setProgrammes(response.programmes ?? []);
  }, [token]);

  const loadSemesters = useCallback(async () => {
    if (!token) return;

    const response = await apiGet<SemestersResponse>(
      "/semesters",
      token,
    );

    if (!response?.success) {
      throw new Error("Unable to retrieve semesters.");
    }

    setSemesters(response.semesters ?? []);
  }, [token]);

  const loadCourses = useCallback(
    async (refresh = false) => {
      if (!token) return;

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = new URLSearchParams();

        if (programmeFilter) {
          params.set("programme", programmeFilter);
        }

        if (semesterFilter) {
          params.set("semester", semesterFilter);
        }

        if (levelFilter) {
          params.set("level", levelFilter);
        }

        if (statusFilter) {
          params.set("status", statusFilter);
        }

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const query = params.toString();

        const response = await apiGet<CoursesResponse>(
          `/courses${query ? `?${query}` : ""}`,
          token,
        );

        if (!response?.success) {
          throw new Error("Unable to retrieve courses.");
        }

        setCourses(response.courses ?? []);
      } catch (err) {
        console.error("Courses error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load courses.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      token,
      programmeFilter,
      semesterFilter,
      levelFilter,
      statusFilter,
      search,
    ],
  );

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        loadProgrammes(),
        loadSemesters(),
      ]).catch((err) => {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load course dependencies.",
        );
      });
    }

    if (status === "unauthenticated") {
      setLoading(false);
      setError("You are not signed in.");
    }
  }, [
    status,
    loadProgrammes,
    loadSemesters,
  ]);

  useEffect(() => {
    if (status === "authenticated" && token) {
      loadCourses();
    }
  }, [
    status,
    token,
    programmeFilter,
    semesterFilter,
    levelFilter,
    statusFilter,
    search,
    loadCourses,
  ]);

  const activeCount = courses.filter(
    (course) => course.isActive,
  ).length;

  const totalCredits = courses.reduce(
    (sum, course) =>
      sum + Number(course.creditUnits || 0),
    0,
  );

  const levels = useMemo(() => {
    return Array.from(
      new Set(
        courses
          .map((course) => course.level)
          .filter(Boolean),
      ),
    ).sort();
  }, [courses]);

  const openCreate = () => {
    setEditingCourse(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEdit = (course: Course) => {
    const programme =
      typeof course.programme === "string"
        ? course.programme
        : course.programme?._id;

    const semester =
      typeof course.semester === "string"
        ? course.semester
        : course.semester?._id;

    setEditingCourse(course);

    setForm({
      code: course.code || "",
      title: course.title || "",
      programme: programme || "",
      semester: semester || "",
      level: course.level || "",
      creditUnits: String(course.creditUnits || 1),
      category: course.category || "",
      description: course.description || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!token) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.code.trim()) {
        throw new Error("Please enter a course code.");
      }

      if (!form.title.trim()) {
        throw new Error("Please enter a course title.");
      }

      if (!form.programme) {
        throw new Error("Please select a programme.");
      }

      if (!form.semester) {
        throw new Error("Please select a semester.");
      }

      if (!form.level.trim()) {
        throw new Error("Please enter the course level.");
      }

      const creditUnits = Number(form.creditUnits);

      if (
        !Number.isInteger(creditUnits) ||
        creditUnits < 1 ||
        creditUnits > 12
      ) {
        throw new Error(
          "Credit units must be an integer between 1 and 12.",
        );
      }

      const payload = {
        code: form.code.trim().toUpperCase(),
        title: form.title.trim(),
        programme: form.programme,
        semester: form.semester,
        level: form.level.trim(),
        creditUnits,
        ...(form.category.trim()
          ? { category: form.category.trim() }
          : {}),
        ...(form.description.trim()
          ? { description: form.description.trim() }
          : {}),
      };

      if (editingCourse) {
        const response = await apiPatch<{
          success: boolean;
          message: string;
          course: Course;
        }>(
          `/courses/${editingCourse._id}`,
          payload,
          token,
        );

        if (!response?.success) {
          throw new Error(
            response?.message || "Unable to update course.",
          );
        }

        setSuccess(
          response.message || "Course updated successfully.",
        );
      } else {
        const response = await apiPost<{
          success: boolean;
          message: string;
          course: Course;
        }>(
          "/courses",
          payload,
          token,
        );

        if (!response?.success) {
          throw new Error(
            response?.message || "Unable to create course.",
          );
        }

        setSuccess(
          response.message || "Course created successfully.",
        );
      }

      setShowForm(false);
      setEditingCourse(null);
      setForm(emptyForm);

      await loadCourses(true);
    } catch (err) {
      console.error("Save course error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save course.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-xl shadow-brand-navy/20">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-800">
            Loading courses
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Preparing course catalogue...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* HEADER */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-brand-navy px-5 py-6 shadow-lg shadow-brand-navy/10 sm:px-7"
        >
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-1/3 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-brand-gold">
                <BookOpen className="h-7 w-7" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                    Academic Structure
                  </p>
                </div>

                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  Courses
                </h1>

                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
                  Manage course codes, titles, programmes, semesters,
                  levels, credit units and academic classifications.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => loadCourses(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-bold text-brand-navy shadow-lg shadow-brand-gold/20 transition hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                New Course
              </button>
            </div>
          </div>
        </motion.section>

        {/* FEEDBACK */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
              <BookOpen className="h-5 w-5" />
            </div>

            <p className="mt-5 text-3xl font-extrabold text-slate-950">
              {courses.length}
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Courses
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Courses in current view
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <p className="mt-5 text-3xl font-extrabold text-slate-950">
              {activeCount}
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Active Courses
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Currently available courses
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <Layers3 className="h-5 w-5" />
            </div>

            <p className="mt-5 text-3xl font-extrabold text-slate-950">
              {programmes.length}
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Programmes
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Available academic programmes
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
              <BookOpen className="h-5 w-5" />
            </div>

            <p className="mt-5 text-3xl font-extrabold text-slate-950">
              {totalCredits}
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Credit Units
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Total credits in current view
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-brand-gold">
              <Filter className="h-3.5 w-3.5" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Course Filters
              </p>

              <p className="text-[11px] text-slate-400">
                Narrow down the course catalogue
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search code, title or description..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
              />
            </div>

            <select
              value={programmeFilter}
              onChange={(event) =>
                setProgrammeFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
            >
              <option value="">All programmes</option>

              {programmes.map((programme) => (
                <option
                  key={programme._id}
                  value={programme._id}
                >
                  {programme.code
                    ? `${programme.code} — ${programme.name}`
                    : programme.name}
                </option>
              ))}
            </select>

            <select
              value={semesterFilter}
              onChange={(event) =>
                setSemesterFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
            >
              <option value="">All semesters</option>

              {semesters.map((semester) => (
                <option
                  key={semester._id}
                  value={semester._id}
                >
                  {semester.name}
                </option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(event) =>
                setLevelFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
            >
              <option value="">All levels</option>

              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {(search ||
            programmeFilter ||
            semesterFilter ||
            levelFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setProgrammeFilter("");
                setSemesterFilter("");
                setLevelFilter("");
              }}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {/* COURSE TABLE */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="text-base font-bold text-slate-950">
              Course Catalogue
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage academic courses available across programmes and
              semesters.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                <BookOpen className="h-6 w-6" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-800">
                No courses found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Adjust your filters or create a new course.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Course
                    </th>

                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Programme
                    </th>

                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Semester
                    </th>

                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Level
                    </th>

                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Credits
                    </th>

                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {courses.map((course) => (
                    <tr
                      key={course._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-extrabold text-brand-navy">
                            {course.code}
                          </p>

                          <p className="mt-1 max-w-xs text-sm font-semibold text-slate-800">
                            {course.title}
                          </p>

                          {course.category && (
                            <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                              {course.category}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="max-w-[220px] text-xs font-bold text-slate-700">
                          {programmeName(course.programme)}
                        </p>

                        {programmeCode(course.programme) && (
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            {programmeCode(course.programme)}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-xl bg-brand-blue/10 px-3 py-2 text-xs font-bold text-brand-blue">
                          {semesterName(course.semester)}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                          {course.level}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-extrabold text-slate-900">
                          {course.creditUnits}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {course.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            Archived
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(course)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand-navy/20 hover:bg-brand-navy hover:text-white"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* COURSE FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => !saving && setShowForm(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <div className="relative z-10 my-8 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="h-1.5 bg-brand-gold" />

            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      {editingCourse
                        ? "Edit Course"
                        : "Create Course"}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {editingCourse
                        ? "Update the academic course information."
                        : "Add a new course to the academic catalogue."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowForm(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                {/* CODE */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Course Code
                  </label>

                  <input
                    value={form.code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        code: event.target.value,
                      }))
                    }
                    placeholder="e.g. TLM 101"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm uppercase outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>

                {/* TITLE */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Course Title
                  </label>

                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g. Introduction to Logistics"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>

                {/* PROGRAMME */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Programme
                  </label>

                  <select
                    value={form.programme}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        programme: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  >
                    <option value="">
                      Select programme
                    </option>

                    {programmes
                      .filter(
                        (programme) =>
                          programme.isActive !== false,
                      )
                      .map((programme) => (
                        <option
                          key={programme._id}
                          value={programme._id}
                        >
                          {programme.code
                            ? `${programme.code} — ${programme.name}`
                            : programme.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* SEMESTER */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Semester
                  </label>

                  <select
                    value={form.semester}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        semester: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  >
                    <option value="">
                      Select semester
                    </option>

                    {semesters.map((semester) => (
                      <option
                        key={semester._id}
                        value={semester._id}
                      >
                        {semester.name}
                        {semester.session?.name
                          ? ` — ${semester.session.name}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LEVEL */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Level
                  </label>

                  <input
                    value={form.level}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        level: event.target.value,
                      }))
                    }
                    placeholder="e.g. ND1, ND2, HND1"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>

                {/* CREDITS */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Credit Units
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={form.creditUnits}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        creditUnits: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>

                {/* CATEGORY */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Category
                    <span className="ml-1 font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    placeholder="e.g. Core, Elective, General Studies"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Description
                    <span className="ml-1 font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={4}
                    maxLength={500}
                    placeholder="Brief description of the course..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  />

                  <p className="mt-1 text-right text-[10px] text-slate-400">
                    {form.description.length}/500
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowForm(false)}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-bold text-white shadow-lg shadow-brand-navy/20 transition hover:bg-brand-navy/95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {saving
                    ? editingCourse
                      ? "Saving..."
                      : "Creating..."
                    : editingCourse
                      ? "Save Changes"
                      : "Create Course"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

