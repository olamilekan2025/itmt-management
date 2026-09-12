"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Programme {
  _id: string;
  name: string;
  code?: string;
}

interface Student {
  _id: string;
  name: string;
  email?: string;
  matricNumber?: string;
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
  };
}

interface Registration {
  _id: string;
  student:
    | Student
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
  programme:
    | Programme
    | string
    | null;
  status: "registered" | "dropped";
  createdAt?: string;
}

interface RegistrationsResponse {
  success: boolean;
  registrations?: Registration[];
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

/* =========================================================
   HELPERS
========================================================= */

function getStudentName(student: Registration["student"]) {
  if (!student) return "Unknown student";

  if (typeof student === "string") {
    return student;
  }

  return student.name || "Unknown student";
}

function getStudentEmail(student: Registration["student"]) {
  if (!student || typeof student === "string") return "";

  return student.email || "";
}

function getMatricNumber(student: Registration["student"]) {
  if (!student || typeof student === "string") return "No matric number";

  return student.matricNumber || "No matric number";
}

function getCourseCode(course: Registration["course"]) {
  if (!course) return "Unknown course";

  if (typeof course === "string") {
    return course;
  }

  return course.code || "Unknown course";
}

function getCourseTitle(course: Registration["course"]) {
  if (!course || typeof course === "string") return "";

  return course.title || "";
}

function getCreditUnits(course: Registration["course"]) {
  if (!course || typeof course === "string") return 0;

  return Number(course.creditUnits || 0);
}

function getSemesterName(semester: Registration["semester"]) {
  if (!semester) return "Unknown semester";

  if (typeof semester === "string") {
    return semester;
  }

  return semester.name || "Unknown semester";
}

function getProgrammeName(programme: Registration["programme"]) {
  if (!programme) return "Not assigned";

  if (typeof programme === "string") {
    return programme;
  }

  return programme.name || "Not assigned";
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

export default function RegistrarRegistrationsPage() {
  const { data: session, status: sessionStatus } = useSession();

  const accessToken = session?.accessToken;

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [error, setError] = useState("");

  const loadReferenceData = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoadingFilters(true);

      const [coursesResponse, semestersResponse] =
        await Promise.all([
          apiGet<CoursesResponse>("/courses?status=active", accessToken),
          apiGet<SemestersResponse>("/semesters", accessToken),
        ]);

      setCourses(coursesResponse?.courses || []);
      setSemesters(semestersResponse?.semesters || []);
    } catch (err) {
      console.error("Failed to load registration filters:", err);
    } finally {
      setLoadingFilters(false);
    }
  }, [accessToken]);

  const loadRegistrations = useCallback(async () => {
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

      const response = await apiGet<RegistrationsResponse>(
        `/registrations${query ? `?${query}` : ""}`,
        accessToken,
      );

      setRegistrations(response?.registrations || []);
    } catch (err) {
      console.error("Failed to load registrations:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load course registrations.",
      );

      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedSemester, selectedCourse]);

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !accessToken) return;

    void loadReferenceData();
  }, [sessionStatus, accessToken, loadReferenceData]);

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !accessToken) return;

    void loadRegistrations();
  }, [
    sessionStatus,
    accessToken,
    loadRegistrations,
  ]);

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return registrations;
    }

    return registrations.filter((registration) => {
      const studentName = getStudentName(
        registration.student,
      ).toLowerCase();

      const matric = getMatricNumber(
        registration.student,
      ).toLowerCase();

      const email = getStudentEmail(
        registration.student,
      ).toLowerCase();

      const courseCode = getCourseCode(
        registration.course,
      ).toLowerCase();

      const courseTitle = getCourseTitle(
        registration.course,
      ).toLowerCase();

      const programme = getProgrammeName(
        registration.programme,
      ).toLowerCase();

      return (
        studentName.includes(query) ||
        matric.includes(query) ||
        email.includes(query) ||
        courseCode.includes(query) ||
        courseTitle.includes(query) ||
        programme.includes(query)
      );
    });
  }, [registrations, search]);

  const totalCreditUnits = useMemo(
    () =>
      filteredRegistrations.reduce(
        (total, registration) =>
          total + getCreditUnits(registration.course),
        0,
      ),
    [filteredRegistrations],
  );

  const uniqueStudents = useMemo(() => {
    const ids = new Set<string>();

    registrations.forEach((registration) => {
      if (
        registration.student &&
        typeof registration.student !== "string"
      ) {
        ids.add(registration.student._id);
      }
    });

    return ids.size;
  }, [registrations]);

  const uniqueCourses = useMemo(() => {
    const ids = new Set<string>();

    registrations.forEach((registration) => {
      if (
        registration.course &&
        typeof registration.course !== "string"
      ) {
        ids.add(registration.course._id);
      }
    });

    return ids.size;
  }, [registrations]);

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
    <div className="space-y-8 pb-10">
      {/* =====================================================
          HERO
      ====================================================== */}

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
              <BookOpen className="h-4 w-4" />
              Academic Operations
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Course Registrations
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Monitor student course registrations, credit loads,
              programmes, and semester activity from one central
              academic workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadRegistrations()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Registrations"
          value={registrations.length}
          description="Active registrations"
        />

        <StatCard
          icon={GraduationCap}
          label="Students"
          value={uniqueStudents}
          description="Students represented"
        />

        <StatCard
          icon={BookOpen}
          label="Courses"
          value={uniqueCourses}
          description="Courses registered"
        />

        <StatCard
          icon={CalendarDays}
          label="Credit Units"
          value={totalCreditUnits}
          description="Visible credit load"
        />
      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">
              Registration Directory
            </h2>
            <p className="text-sm text-slate-500">
              Search and filter registered courses.
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
              placeholder="Search student, matric number, course..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/10"
            />
          </div>

          <SelectField
            value={selectedSemester}
            onChange={setSelectedSemester}
            disabled={loadingFilters}
            placeholder="All semesters"
            options={semesters.map((semester) => ({
              value: semester._id,
              label: semester.name,
            }))}
          />

          <SelectField
            value={selectedCourse}
            onChange={setSelectedCourse}
            disabled={loadingFilters}
            placeholder="All courses"
            options={courses.map((course) => ({
              value: course._id,
              label: `${course.code} — ${course.title}`,
            }))}
          />
        </div>
      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          TABLE
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-bold text-brand-navy">
              Registered Courses
            </h2>
            <p className="text-sm text-slate-500">
              Showing {filteredRegistrations.length} of{" "}
              {registrations.length} registrations
            </p>
          </div>

          {selectedSemester && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-gold/10 px-3 py-1.5 text-xs font-semibold text-brand-navy">
              <CalendarDays className="h-3.5 w-3.5" />
              {
                semesters.find(
                  (semester) =>
                    semester._id === selectedSemester,
                )?.name
              }
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <RefreshCw className="h-7 w-7 animate-spin text-brand-gold" />
              <span className="text-sm">
                Loading registrations...
              </span>
            </div>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">
                      Student
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      Course
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      Programme
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      Semester
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      Units
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      Registered
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map(
                    (registration) => (
                      <tr
                        key={registration._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white">
                              {getStudentName(
                                registration.student,
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {getStudentName(
                                  registration.student,
                                )}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {getMatricNumber(
                                  registration.student,
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-brand-navy">
                            {getCourseCode(
                              registration.course,
                            )}
                          </p>

                          <p className="max-w-[240px] truncate text-xs text-slate-500">
                            {getCourseTitle(
                              registration.course,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="max-w-[190px] truncate text-sm text-slate-700">
                            {getProgrammeName(
                              registration.programme,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {getSemesterName(
                              registration.semester,
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-brand-navy">
                            {getCreditUnits(
                              registration.course,
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(
                            registration.createdAt,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredRegistrations.map(
                (registration) => (
                  <div
                    key={registration._id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white">
                          {getStudentName(
                            registration.student,
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {getStudentName(
                              registration.student,
                            )}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {getMatricNumber(
                              registration.student,
                            )}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Registered
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <InfoItem
                        label="Course"
                        value={`${getCourseCode(
                          registration.course,
                        )} — ${getCourseTitle(
                          registration.course,
                        )}`}
                      />

                      <InfoItem
                        label="Semester"
                        value={getSemesterName(
                          registration.semester,
                        )}
                      />

                      <InfoItem
                        label="Programme"
                        value={getProgrammeName(
                          registration.programme,
                        )}
                      />

                      <InfoItem
                        label="Credit Units"
                        value={String(
                          getCreditUnits(
                            registration.course,
                          ),
                        )}
                      />
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                      Registered{" "}
                      {formatDate(
                        registration.createdAt,
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </section>
    </div>
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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
        <option value="">{placeholder}</option>

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
}: {
  hasFilters: boolean;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/5">
        <BookOpen className="h-6 w-6 text-brand-navy" />
      </div>

      <h3 className="mt-4 text-base font-bold text-brand-navy">
        No registrations found
      </h3>

      <p className="mt-1 max-w-md text-sm text-slate-500">
        {hasFilters
          ? "No course registrations match the current search or filters."
          : "There are currently no active course registrations."}
      </p>
    </div>
  );
}