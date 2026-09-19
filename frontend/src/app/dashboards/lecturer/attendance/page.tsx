"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck2,
  Loader2,
  RefreshCw,
  Save,
  Search,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { getSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

import { apiGet, apiPost } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

interface Course {
  _id: string;
  code: string;
  title: string;
  level?: string;
  creditUnits?: number;
  programme?: {
    _id: string;
    name: string;
  };
  semester?: {
    _id: string;
    name: string;
  };
}

interface Semester {
  _id: string;
  name: string;
  order: number;
  isActive: boolean;
  session?: {
    _id: string;
    name: string;
  };
}

interface AssignedCourse {
  _id: string;
  lecturer: string;
  course: Course;
  semester: Semester;
  isActive: boolean;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  matricNumber?: string;
  level?: string;
}

interface Attendance {
  _id: string;
  status: AttendanceStatus;
  note?: string;
}

interface RosterStudent {
  student: Student;
  attendance: Attendance | null;
}

interface AttendanceRecord {
  student: string;
  status: AttendanceStatus;
  note?: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const STATUS_OPTIONS: {
  value: AttendanceStatus;
  label: string;
}[] = [
  {
    value: "present",
    label: "Present",
  },
  {
    value: "absent",
    label: "Absent",
  },
  {
    value: "late",
    label: "Late",
  },
  {
    value: "excused",
    label: "Excused",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getStatusLabel = (status: AttendanceStatus) => {
  return (
    STATUS_OPTIONS.find(
      (item) => item.value === status,
    )?.label || status
  );
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]?.charAt(0).toUpperCase() || "S";
  }

  return `${parts[0]?.charAt(0) || ""}${parts[
    parts.length - 1
  ]?.charAt(0) || ""}`.toUpperCase();
};

const getStatusClasses = (
  status: AttendanceStatus,
  active: boolean,
) => {
  if (!active) {
    return "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50";
  }

  switch (status) {
    case "present":
      return "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/20";

    case "absent":
      return "border-red-600 bg-red-600 text-white shadow-sm shadow-red-600/20";

    case "late":
      return "border-amber-500 bg-amber-500 text-white shadow-sm shadow-amber-500/20";

    case "excused":
      return "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20";

    default:
      return "border-slate-200 bg-white text-slate-500";
  }
};

const getStatusBadgeClasses = (
  status: AttendanceStatus,
) => {
  switch (status) {
    case "present":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";

    case "absent":
      return "bg-red-50 text-red-700 ring-red-600/10";

    case "late":
      return "bg-amber-50 text-amber-700 ring-amber-600/10";

    case "excused":
      return "bg-blue-50 text-blue-700 ring-blue-600/10";

    default:
      return "bg-slate-100 text-slate-600 ring-slate-500/10";
  }
};

/* =========================================================
   PAGE
========================================================= */

export default function LecturerAttendancePage() {
  const [sessionToken, setSessionToken] =
    useState<string | null>(null);

  const [assignments, setAssignments] =
    useState<AssignedCourse[]>([]);

  const [semesters, setSemesters] =
    useState<Semester[]>([]);

  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [selectedSemester, setSelectedSemester] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState(getToday());

  const [roster, setRoster] =
    useState<RosterStudent[]>([]);

  const [search, setSearch] =
    useState("");

  const [loadingAssignments, setLoadingAssignments] =
    useState(true);

  const [loadingSemesters, setLoadingSemesters] =
    useState(true);

  const [loadingRoster, setLoadingRoster] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [hasLoadedRoster, setHasLoadedRoster] =
    useState(false);

  /* =======================================================
     AUTHENTICATION
  ======================================================= */

  useEffect(() => {
    const loadSession = async () => {
      const session = await getSession();

      const token =
        (
          session as {
            accessToken?: string;
          } | null
        )?.accessToken || null;

      setSessionToken(token);
    };

    void loadSession();
  }, []);

  /* =======================================================
     LOAD ASSIGNMENTS
  ======================================================= */

  const loadAssignments = useCallback(
    async () => {
      try {
        setLoadingAssignments(true);
        setError("");

        const data =
          await apiGet<{
            success: boolean;
            assignments: AssignedCourse[];
          }>(
            "/lecturer-assignments/me",
            sessionToken || undefined,
          );

        const activeAssignments =
          (data.assignments || []).filter(
            (assignment) =>
              assignment.isActive,
          );

        setAssignments(activeAssignments);

        if (
          activeAssignments.length > 0 &&
          !selectedCourse
        ) {
          setSelectedCourse(
            activeAssignments[0].course?._id || "",
          );

          setSelectedSemester(
            activeAssignments[0].semester?._id || "",
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load assigned courses.",
        );
      } finally {
        setLoadingAssignments(false);
      }
    },
    [sessionToken, selectedCourse],
  );

  /* =======================================================
     LOAD SEMESTERS
  ======================================================= */

  const loadSemesters = useCallback(
    async () => {
      try {
        setLoadingSemesters(true);

        const data =
          await apiGet<{
            success: boolean;
            semesters: Semester[];
          }>(
            "/semesters",
            sessionToken || undefined,
          );

        setSemesters(data.semesters || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load semesters.",
        );
      } finally {
        setLoadingSemesters(false);
      }
    },
    [sessionToken],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (!sessionToken) return;

    void Promise.all([
      loadAssignments(),
      loadSemesters(),
    ]);
  }, [
    sessionToken,
    loadAssignments,
    loadSemesters,
  ]);

  /* =======================================================
     SELECTED ASSIGNMENT
  ======================================================= */

  const selectedAssignment = useMemo(() => {
    return assignments.find(
      (assignment) =>
        assignment.course?._id === selectedCourse &&
        assignment.semester?._id === selectedSemester,
    );
  }, [
    assignments,
    selectedCourse,
    selectedSemester,
  ]);

  /* =======================================================
     AVAILABLE COURSES
  ======================================================= */

  const availableCourses = useMemo(() => {
    const map = new Map<string, Course>();

    for (const assignment of assignments) {
      if (assignment.course) {
        map.set(
          assignment.course._id,
          assignment.course,
        );
      }
    }

    return Array.from(map.values());
  }, [assignments]);

  /* =======================================================
     COURSE SEMESTERS
  ======================================================= */

  const courseSemesters = useMemo(() => {
    const map = new Map<string, Semester>();

    for (const assignment of assignments) {
      if (
        assignment.course?._id === selectedCourse &&
        assignment.semester
      ) {
        map.set(
          assignment.semester._id,
          assignment.semester,
        );
      }
    }

    return Array.from(map.values());
  }, [
    assignments,
    selectedCourse,
  ]);

  /* =======================================================
     LOAD ROSTER
  ======================================================= */

  const loadRoster = useCallback(async () => {
    if (
      !selectedCourse ||
      !selectedSemester ||
      !selectedDate
    ) {
      setError(
        "Please select a course, semester and date.",
      );
      return;
    }

    try {
      setLoadingRoster(true);
      setError("");
      setSuccess("");

      const params = new URLSearchParams({
        course: selectedCourse,
        semester: selectedSemester,
        date: selectedDate,
      });

      const data =
        await apiGet<{
          success: boolean;
          roster: RosterStudent[];
        }>(
          `/attendance/roster?${params.toString()}`,
          sessionToken || undefined,
        );

      setRoster(data.roster || []);
      setHasLoadedRoster(true);
    } catch (err) {
      setRoster([]);
      setHasLoadedRoster(false);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load attendance roster.",
      );
    } finally {
      setLoadingRoster(false);
    }
  }, [
    sessionToken,
    selectedCourse,
    selectedSemester,
    selectedDate,
  ]);

  /* =======================================================
     AUTO LOAD
  ======================================================= */

  useEffect(() => {
    if (
      sessionToken &&
      selectedCourse &&
      selectedSemester &&
      selectedDate
    ) {
      void loadRoster();
    }
  }, [
    sessionToken,
    selectedCourse,
    selectedSemester,
    selectedDate,
  ]);

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateStatus = (
    studentId: string,
    status: AttendanceStatus,
  ) => {
    setRoster((current) =>
      current.map((item) => {
        if (item.student._id !== studentId) {
          return item;
        }

        return {
          ...item,
          attendance: {
            _id:
              item.attendance?._id || "",
            status,
            note:
              item.attendance?.note || "",
          },
        };
      }),
    );

    setSuccess("");
    setError("");
  };

  /* =======================================================
     UPDATE NOTE
  ======================================================= */

  const updateNote = (
    studentId: string,
    note: string,
  ) => {
    setRoster((current) =>
      current.map((item) => {
        if (item.student._id !== studentId) {
          return item;
        }

        return {
          ...item,
          attendance: {
            _id:
              item.attendance?._id || "",
            status:
              item.attendance?.status ||
              "present",
            note,
          },
        };
      }),
    );
  };

  /* =======================================================
     MARK ALL PRESENT
  ======================================================= */

  const markAllPresent = () => {
    setRoster((current) =>
      current.map((item) => ({
        ...item,
        attendance: {
          _id:
            item.attendance?._id || "",
          status: "present",
          note:
            item.attendance?.note || "",
        },
      })),
    );

    setSuccess("");
    setError("");
  };

  /* =======================================================
     CLEAR ATTENDANCE
  ======================================================= */

  const clearAttendance = () => {
    setRoster((current) =>
      current.map((item) => ({
        ...item,
        attendance: null,
      })),
    );

    setSuccess("");
  };

  /* =======================================================
     SAVE ATTENDANCE
  ======================================================= */

  const saveAttendance = async () => {
    if (!selectedCourse) {
      setError("Please select a course.");
      return;
    }

    if (!selectedSemester) {
      setError("Please select a semester.");
      return;
    }

    if (!selectedDate) {
      setError(
        "Please select an attendance date.",
      );
      return;
    }

    if (roster.length === 0) {
      setError(
        "There are no registered students for this course.",
      );
      return;
    }

    const incomplete = roster.some(
      (item) =>
        !item.attendance?.status,
    );

    if (incomplete) {
      setError(
        "Please mark attendance for every student before saving.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const records: AttendanceRecord[] =
        roster.map((item) => ({
          student: item.student._id,
          status:
            item.attendance!.status,
          note:
            item.attendance?.note?.trim() ||
            undefined,
        }));

      await apiPost(
        "/attendance",
        {
          course: selectedCourse,
          semester: selectedSemester,
          date: selectedDate,
          records,
        },
        sessionToken || undefined,
      );

      setSuccess(
        "Attendance saved successfully.",
      );

      await loadRoster();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save attendance.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     FILTER ROSTER
  ======================================================= */

  const filteredRoster = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return roster;

    return roster.filter((item) => {
      const student = item.student;

      return (
        student.name
          .toLowerCase()
          .includes(query) ||
        student.email
          .toLowerCase()
          .includes(query) ||
        student.matricNumber
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [roster, search]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const stats = {
      total: roster.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      unmarked: 0,
    };

    for (const item of roster) {
      const status =
        item.attendance?.status;

      if (!status) {
        stats.unmarked++;
        continue;
      }

      stats[status]++;
    }

    return stats;
  }, [roster]);

  const completionPercentage =
    statistics.total > 0
      ? Math.round(
          ((statistics.total -
            statistics.unmarked) /
            statistics.total) *
            100,
        )
      : 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 px-0 py-4 sm:px-0 sm:py-6 lg:px-0 lg:py-8">

        {/* ===================================================
            PREMIUM HERO — brand navy
        =================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl bg-brand-navy px-5 py-5 shadow-lg shadow-brand-navy/10 sm:px-6 sm:py-6"
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand-blue/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 h-48 w-48 rounded-full bg-brand-gold/10 blur-3xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:32px_32px]"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-brand-gold shadow-inner backdrop-blur-sm sm:h-14 sm:w-14">
                <FileCheck2 className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold sm:text-[11px]">
                      Lecturer Portal
                    </p>
                  </div>

                  {selectedAssignment && (
                    <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
                      Active Course
                    </span>
                  )}
                </div>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Attendance Management
                </h1>

                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
                  Record, review and manage student
                  attendance for your assigned
                  courses with ease.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadRoster()}
              disabled={
                loadingRoster ||
                !selectedCourse ||
                !selectedSemester
              }
              className="group inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white px-5 text-sm font-bold text-brand-navy shadow-md shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
            >
              <RefreshCw
                className={`h-4 w-4 transition-transform duration-300 ${
                  loadingRoster
                    ? "animate-spin"
                    : "group-hover:rotate-45"
                }`}
              />
              Refresh Roster
            </button>
          </div>
        </motion.section>

        {/* =================================================
            ALERTS
        ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-red-800">
                    Attendance error
                  </p>
                  <p className="text-sm leading-5 text-red-700">
                    {error}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 text-sm font-bold text-red-800 underline underline-offset-4"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-emerald-800">
                    Attendance saved
                  </p>
                  <p className="text-sm text-emerald-700">
                    {success}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="shrink-0 text-sm font-bold text-emerald-800 underline underline-offset-4"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            SESSION CARD
        ================================================= */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200/80"
        >
          <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/80 px-4 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold shadow-sm">
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-bold text-brand-navy sm:text-lg">
                  Attendance Session
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                  Configure the course, semester and
                  date for this attendance session.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* COURSE */}

              <div>
                <label
                  htmlFor="attendance-course"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Course
                </label>

                <div className="relative">
                  <select
                    id="attendance-course"
                    value={selectedCourse}
                    onChange={(event) => {
                      const courseId =
                        event.target.value;

                      setSelectedCourse(
                        courseId,
                      );

                      const assignment =
                        assignments.find(
                          (item) =>
                            item.course?._id ===
                            courseId,
                        );

                      if (
                        assignment?.semester?._id
                      ) {
                        setSelectedSemester(
                          assignment.semester
                            ._id,
                        );
                      }
                    }}
                    disabled={
                      loadingAssignments
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-brand-navy/30 focus:ring-4 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {loadingAssignments
                        ? "Loading courses..."
                        : "Select course"}
                    </option>

                    {availableCourses.map(
                      (course) => (
                        <option
                          key={course._id}
                          value={course._id}
                        >
                          {course.code} —{" "}
                          {course.title}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* SEMESTER */}

              <div>
                <label
                  htmlFor="attendance-semester"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Semester
                </label>

                <div className="relative">
                  <select
                    id="attendance-semester"
                    value={selectedSemester}
                    onChange={(event) =>
                      setSelectedSemester(
                        event.target.value,
                      )
                    }
                    disabled={
                      loadingSemesters ||
                      !selectedCourse
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-brand-navy/30 focus:ring-4 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {!selectedCourse
                        ? "Select a course first"
                        : "Select semester"}
                    </option>

                    {courseSemesters.map(
                      (semester) => (
                        <option
                          key={semester._id}
                          value={semester._id}
                        >
                          {semester.name}
                          {semester.session?.name
                            ? ` — ${semester.session.name}`
                            : ""}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* DATE */}

              <div>
                <label
                  htmlFor="attendance-date"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Attendance Date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="attendance-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) =>
                      setSelectedDate(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-brand-navy/30 focus:ring-4 focus:ring-brand-navy/10"
                  />
                </div>
              </div>
            </div>

            {/* SELECTED COURSE */}

            {selectedAssignment && (
              <div className="mt-5 rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.025] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-brand-navy px-2.5 py-1 text-xs font-black tracking-wide text-white">
                        {
                          selectedAssignment
                            .course.code
                        }
                      </span>

                      {selectedAssignment.course
                        .creditUnits && (
                        <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                          {
                            selectedAssignment
                              .course
                              .creditUnits
                          }{" "}
                          Credit Unit
                          {selectedAssignment
                            .course
                            .creditUnits !==
                          1
                            ? "s"
                            : ""}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 truncate text-base font-bold text-brand-navy sm:text-lg">
                      {
                        selectedAssignment
                          .course.title
                      }
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedAssignment.course
                      .level && (
                      <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                        <span className="text-slate-400">
                          Level
                        </span>
                        <span className="ml-2 font-bold text-slate-700">
                          {
                            selectedAssignment
                              .course
                              .level
                          }
                        </span>
                      </div>
                    )}

                    <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                      <span className="text-slate-400">
                        Semester
                      </span>
                      <span className="ml-2 font-bold text-slate-700">
                        {
                          selectedAssignment
                            .semester.name
                        }
                      </span>
                    </div>

                    {selectedAssignment
                      .semester.session
                      ?.name && (
                      <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                        <span className="text-slate-400">
                          Session
                        </span>
                        <span className="ml-2 font-bold text-slate-700">
                          {
                            selectedAssignment
                              .semester
                              .session
                              .name
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {[
            {
              key: "total",
              label: "Total Students",
              value: statistics.total,
              icon: Users,
              iconClass: "bg-brand-navy/10 text-brand-navy",
            },
            {
              key: "present",
              label: "Present",
              value: statistics.present,
              icon: UserCheck,
              iconClass: "bg-emerald-50 text-emerald-600",
            },
            {
              key: "absent",
              label: "Absent",
              value: statistics.absent,
              icon: XCircle,
              iconClass: "bg-red-50 text-red-600",
            },
            {
              key: "late",
              label: "Late",
              value: statistics.late,
              icon: Clock3,
              iconClass: "bg-amber-50 text-amber-600",
            },
            {
              key: "unmarked",
              label: "Unmarked",
              value: statistics.unmarked,
              icon: AlertCircle,
              iconClass: "bg-slate-100 text-slate-500",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <StatCard
                label={stat.label}
                value={stat.value}
                icon={<stat.icon className="h-5 w-5" />}
                iconClass={stat.iconClass}
              />
            </motion.div>
          ))}
        </div>

        {/* =================================================
            ROSTER
        ================================================= */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200/80"
        >
          {/* ROSTER HEADER */}

          <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-brand-navy sm:text-xl">
                    Student Attendance
                  </h2>

                  {roster.length > 0 && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                      {roster.length}{" "}
                      registered
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Mark each student&apos;s
                  attendance status and add notes
                  where necessary.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {/* SEARCH */}

                <div className="relative min-w-0 sm:w-64">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search student..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-navy/30 focus:ring-4 focus:ring-brand-navy/10"
                  />
                </div>

                <button
                  type="button"
                  onClick={markAllPresent}
                  disabled={
                    roster.length === 0
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Mark All Present
                  </span>
                  <span className="sm:hidden">
                    All Present
                  </span>
                </button>

                <button
                  type="button"
                  onClick={clearAttendance}
                  disabled={
                    roster.length === 0
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>

            {/* PROGRESS */}

            {roster.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">
                    Attendance completion
                  </span>

                  <span className="font-bold text-brand-navy">
                    {completionPercentage}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-gold transition-all duration-500"
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* LOADING */}

          {loadingRoster && (
            <div className="flex min-h-[340px] flex-col items-center justify-center px-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-xl shadow-brand-navy/20">
                <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
              </div>

              <p className="mt-5 text-sm font-bold text-slate-700">
                Loading registered students
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Preparing the attendance roster...
              </p>
            </div>
          )}

          {/* EMPTY */}

          {!loadingRoster &&
            roster.length === 0 && (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                  <Users className="h-8 w-8" />
                </div>

                <h3 className="mt-6 text-lg font-bold text-brand-navy">
                  {hasLoadedRoster
                    ? "No registered students"
                    : "Select an attendance session"}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {hasLoadedRoster
                    ? "There are currently no active student registrations for this course and semester."
                    : "Choose your assigned course, semester and attendance date to load the student roster."}
                </p>
              </div>
            )}

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          {!loadingRoster &&
            filteredRoster.length > 0 && (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1050px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-4">
                          Student
                        </th>

                        <th className="px-5 py-4">
                          Matric Number
                        </th>

                        <th className="px-5 py-4">
                          Level
                        </th>

                        <th className="px-5 py-4">
                          Attendance Status
                        </th>

                        <th className="px-5 py-4">
                          Note
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredRoster.map(
                        (item) => {
                          const status =
                            item.attendance
                              ?.status;

                          return (
                            <tr
                              key={
                                item.student
                                  ._id
                              }
                              className="group transition-colors hover:bg-slate-50/70"
                            >
                              {/* STUDENT */}

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold ring-2 ring-slate-100">
                                    {getInitials(
                                      item
                                        .student
                                        .name,
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                      {
                                        item
                                          .student
                                          .name
                                      }
                                    </p>

                                    <p className="mt-0.5 max-w-[240px] truncate text-xs text-slate-500">
                                      {
                                        item
                                          .student
                                          .email
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* MATRIC */}

                              <td className="px-5 py-4">
                                {item.student
                                  .matricNumber ? (
                                  <span className="font-mono text-xs font-semibold text-brand-navy">
                                    {
                                      item
                                        .student
                                        .matricNumber
                                    }
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    —
                                  </span>
                                )}
                              </td>

                              {/* LEVEL */}

                              <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                                {item.student
                                  .level || "—"}
                              </td>

                              {/* STATUS */}

                              <td className="px-5 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {STATUS_OPTIONS.map(
                                    (
                                      option,
                                    ) => {
                                      const active =
                                        status ===
                                        option.value;

                                      return (
                                        <button
                                          key={
                                            option.value
                                          }
                                          type="button"
                                          onClick={() =>
                                            updateStatus(
                                              item
                                                .student
                                                ._id,
                                              option.value,
                                            )
                                          }
                                          aria-pressed={
                                            active
                                          }
                                          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all ${getStatusClasses(
                                            option.value,
                                            active,
                                          )}`}
                                        >
                                          {option.label}
                                        </button>
                                      );
                                    },
                                  )}
                                </div>
                              </td>

                              {/* NOTE */}

                              <td className="px-5 py-4">
                                <input
                                  type="text"
                                  value={
                                    item
                                      .attendance
                                      ?.note ||
                                    ""
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateNote(
                                      item
                                        .student
                                        ._id,
                                      event.target
                                        .value,
                                    )
                                  }
                                  maxLength={500}
                                  placeholder="Optional note..."
                                  className="h-10 w-56 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-navy/30 focus:ring-4 focus:ring-brand-navy/10"
                                />
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    MOBILE / TABLET CARDS
                ================================================= */}

                <div className="divide-y divide-slate-100 lg:hidden">
                  {filteredRoster.map(
                    (item, index) => {
                      const status =
                        item.attendance
                          ?.status;

                      return (
                        <div
                          key={
                            item.student
                              ._id
                          }
                          className="p-4 sm:p-5"
                        >
                          {/* STUDENT HEADER */}

                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold ring-2 ring-slate-100">
                              {getInitials(
                                item.student
                                  .name,
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {
                                      item
                                        .student
                                        .name
                                    }
                                  </p>

                                  <p className="mt-0.5 truncate text-xs text-slate-500">
                                    {
                                      item
                                        .student
                                        .email
                                    }
                                  </p>
                                </div>

                                <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600">
                                  #{index +
                                    1}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-lg bg-brand-navy/5 px-2.5 py-1.5 text-[11px] font-bold text-brand-navy">
                                  {item.student
                                    .matricNumber ||
                                    "No matric"}
                                </span>

                                {item.student
                                  .level && (
                                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-600">
                                    {
                                      item
                                        .student
                                        .level
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* STATUS */}

                          <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">
                                Attendance
                              </span>

                              {status && (
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ring-inset ${getStatusBadgeClasses(
                                    status,
                                  )}`}
                                >
                                  {getStatusLabel(
                                    status,
                                  )}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                              {STATUS_OPTIONS.map(
                                (
                                  option,
                                ) => {
                                  const active =
                                    status ===
                                    option.value;

                                  return (
                                    <button
                                      key={
                                        option.value
                                      }
                                      type="button"
                                      onClick={() =>
                                        updateStatus(
                                          item
                                            .student
                                            ._id,
                                          option.value,
                                        )
                                      }
                                      aria-pressed={
                                        active
                                      }
                                      className={`min-h-10 rounded-xl border px-2 py-2 text-xs font-bold transition-all ${getStatusClasses(
                                        option.value,
                                        active,
                                      )}`}
                                    >
                                      {option.label}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          </div>

                          {/* NOTE */}

                          <div className="mt-4">
                            <label
                              htmlFor={`note-${item.student._id}`}
                              className="mb-2 block text-[11px] font-black uppercase tracking-[0.1em] text-slate-400"
                            >
                              Note
                            </label>

                            <input
                              id={`note-${item.student._id}`}
                              type="text"
                              value={
                                item
                                  .attendance
                                  ?.note ||
                                ""
                              }
                              onChange={(
                                event,
                              ) =>
                                updateNote(
                                  item.student
                                    ._id,
                                  event.target
                                    .value,
                                )
                              }
                              maxLength={500}
                              placeholder="Add an optional note..."
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy/30 focus:ring-4 focus:ring-brand-navy/10"
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                {/* =================================================
                    SAVE BAR
                ================================================= */}

                <div className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-800">
                          {statistics.total}{" "}
                          {statistics.total ===
                          1
                            ? "student"
                            : "students"}
                        </p>

                        <span className="h-1 w-1 rounded-full bg-slate-300" />

                        <p className="text-xs font-semibold text-slate-500">
                          {statistics.unmarked}{" "}
                          unmarked
                        </p>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {statistics.unmarked >
                        0
                          ? "Complete all attendance records before saving."
                          : "All attendance records are ready to be saved."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void saveAttendance()
                      }
                      disabled={
                        saving ||
                        statistics.unmarked >
                          0
                      }
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 text-sm font-black text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-navy/95 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto lg:min-w-[210px]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Saving Attendance...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          Save Attendance
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

          {/* =================================================
              SEARCH EMPTY
          ================================================= */}

          {!loadingRoster &&
            roster.length > 0 &&
            filteredRoster.length === 0 && (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <Search className="h-7 w-7 text-slate-300" />
                </div>

                <p className="mt-4 font-bold text-slate-700">
                  No students found
                </p>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Try searching with another
                  student name, email or
                  matriculation number.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Clear Search
                </button>
              </div>
            )}
        </motion.section>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border-0 bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 sm:p-5">
      <div className="absolute inset-x-0 top-0 h-1 bg-brand-navy transition-all duration-300 group-hover:h-1.5" />

      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
          {value}
        </span>
      </div>

      <p className="mt-4 text-xs font-bold text-slate-500 sm:text-sm">
        {label}
      </p>
    </div>
  );
}