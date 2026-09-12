"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { apiGet, apiPatch } from "@/lib/api";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

/* =========================================================
   TYPES
========================================================= */

interface Programme {
  _id: string;
  name: string;
  code: string;
}

interface AcademicSession {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  role: "student";

  programme?: Programme | string | null;
  academicSession?: AcademicSession | string | null;

  matricNumber?: string;
  level?: string;

  isActive: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;

  createdAt: string;
  updatedAt: string;
}

interface RegistrarStudentsClientProps {
  initialStudents: Student[];
  accessToken: string;
  initialError: string;
}

interface StudentsResponse {
  success: boolean;
  users?: Student[];
  students?: Student[];
  message?: string;
}

interface ProgrammesResponse {
  success: boolean;
  programmes?: Programme[];
  message?: string;
}

interface AcademicSessionsResponse {
  success: boolean;
  academicSessions?: AcademicSession[];
  message?: string;
}

interface AssignmentResponse {
  success: boolean;
  message?: string;
  user?: Student;
}

/* =========================================================
   CONSTANTS
========================================================= */

const LEVELS = [
  "ND 1",
  "ND 2",
  "HND 1",
  "HND 2",
  "100",
  "200",
  "300",
  "400",
];

/* =========================================================
   HELPERS
========================================================= */

function getProgrammeId(
  programme?: Programme | string | null,
): string {
  if (!programme) return "";

  if (typeof programme === "string") {
    return programme;
  }

  return programme._id || "";
}

function getProgrammeName(
  programme?: Programme | string | null,
  programmes: Programme[] = [],
): string {
  if (!programme) return "Not assigned";

  if (typeof programme === "object") {
    return programme.name || "Not assigned";
  }

  const found = programmes.find(
    (item) => item._id === programme,
  );

  return found?.name || programme;
}

function getSessionId(
  session?: AcademicSession | string | null,
): string {
  if (!session) return "";

  if (typeof session === "string") {
    return session;
  }

  return session._id || "";
}

function getSessionName(
  session?: AcademicSession | string | null,
  sessions: AcademicSession[] = [],
): string {
  if (!session) return "Not assigned";

  if (typeof session === "object") {
    return session.name || "Not assigned";
  }

  const found = sessions.find(
    (item) => item._id === session,
  );

  return found?.name || session;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name?: string): string {
  if (!name?.trim()) return "ST";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function RegistrarStudentsClient({
  initialStudents,
  accessToken,
  initialError,
}: RegistrarStudentsClientProps) {
  /* -------------------------------------------------------
     GENERAL STATE
  ------------------------------------------------------- */

  const [students, setStudents] =
    useState<Student[]>(initialStudents);

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [showDetailsDialog, setShowDetailsDialog] =
    useState(false);

  const [showAssignProgrammeDialog, setShowAssignProgrammeDialog] =
    useState(false);

  const [loading, setLoading] = useState(
    initialStudents.length === 0 && !initialError,
  );

  const [refreshing, setRefreshing] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState(initialError);

  const [success, setSuccess] =
    useState("");

  /* -------------------------------------------------------
     PROGRAMMES / SESSIONS
  ------------------------------------------------------- */

  const [programmes, setProgrammes] =
    useState<Programme[]>([]);

  const [academicSessions, setAcademicSessions] =
    useState<AcademicSession[]>([]);

  const [programmesLoading, setProgrammesLoading] =
    useState(false);

  const [programmesError, setProgrammesError] =
    useState("");

  const [sessionsLoading, setSessionsLoading] =
    useState(false);

  const [sessionsError, setSessionsError] =
    useState("");

  /* -------------------------------------------------------
     ASSIGNMENT FORM
  ------------------------------------------------------- */

  const [selectedProgramme, setSelectedProgramme] =
    useState("");

  const [selectedSession, setSelectedSession] =
    useState("");

  const [selectedLevel, setSelectedLevel] =
    useState("");

  const [selectedMatric, setSelectedMatric] =
    useState("");

  const [assignFieldError, setAssignFieldError] =
    useState("");

  /* =========================================================
     LOAD STUDENTS
  ========================================================= */

  const loadStudents = useCallback(
    async (showRefreshLoader = false) => {
      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await apiGet<StudentsResponse>(
            "/users?role=student",
            accessToken,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load students.",
          );
        }

        const loadedStudents =
          response.users ||
          response.students ||
          [];

        setStudents(loadedStudents);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load students.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  /* =========================================================
     LOAD PROGRAMMES
  ========================================================= */

  const loadProgrammes = useCallback(async () => {
    try {
      setProgrammesLoading(true);
      setProgrammesError("");

      const response =
        await apiGet<ProgrammesResponse>(
          "/programmes",
          accessToken,
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to load programmes.",
        );
      }

      setProgrammes(response.programmes || []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load programmes.";

      setProgrammesError(message);
      setProgrammes([]);
    } finally {
      setProgrammesLoading(false);
    }
  }, [accessToken]);

  /* =========================================================
     LOAD ACADEMIC SESSIONS
  ========================================================= */

  const loadAcademicSessions =
    useCallback(async () => {
      try {
        setSessionsLoading(true);
        setSessionsError("");

        const response =
          await apiGet<AcademicSessionsResponse>(
            "/academic-sessions",
            accessToken,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load academic sessions.",
          );
        }

        setAcademicSessions(
          response.academicSessions || [],
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load academic sessions.";

        setSessionsError(message);
        setAcademicSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    }, [accessToken]);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (initialStudents.length === 0 && !initialError) {
      loadStudents();
    }
  }, [
    initialStudents.length,
    initialError,
    loadStudents,
  ]);

  /* =========================================================
     LOAD FORM DATA WHEN PAGE OPENS
  ========================================================= */

  useEffect(() => {
    loadProgrammes();
    loadAcademicSessions();
  }, [
    loadProgrammes,
    loadAcademicSessions,
  ]);

  /* =========================================================
     FILTER STUDENTS
  ========================================================= */

  const filteredStudents = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        student.name
          ?.toLowerCase()
          .includes(query) ||
        student.email
          ?.toLowerCase()
          .includes(query) ||
        student.matricNumber
          ?.toLowerCase()
          .includes(query) ||
        getProgrammeName(
          student.programme,
          programmes,
        )
          .toLowerCase()
          .includes(query);

      let matchesStatus = true;

      if (statusFilter === "active") {
        matchesStatus =
          student.isActive &&
          !student.isSuspended;
      }

      if (statusFilter === "suspended") {
        matchesStatus =
          student.isSuspended;
      }

      if (statusFilter === "inactive") {
        matchesStatus =
          !student.isActive;
      }

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    students,
    searchQuery,
    statusFilter,
    programmes,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const activeStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.isActive &&
          !student.isSuspended,
      ).length,
    [students],
  );

  const suspendedStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.isSuspended,
      ).length,
    [students],
  );

  const programmeCount = useMemo(() => {
    const ids = new Set<string>();

    students.forEach((student) => {
      const id = getProgrammeId(
        student.programme,
      );

      if (id) {
        ids.add(id);
      }
    });

    return ids.size;
  }, [students]);

  /* =========================================================
     OPEN DETAILS
  ========================================================= */

  const openDetails = (
    student: Student,
  ) => {
    setSelectedStudent(student);
    setShowDetailsDialog(true);
    setError("");
    setSuccess("");
  };

  /* =========================================================
     OPEN ASSIGN PROGRAMME
  ========================================================= */

  const openAssignProgramme = (
    student: Student,
  ) => {
    setSelectedStudent(student);

    setSelectedProgramme(
      getProgrammeId(student.programme),
    );

    setSelectedSession(
      getSessionId(
        student.academicSession,
      ),
    );

    setSelectedLevel(
      student.level || "",
    );

    setSelectedMatric(
      student.matricNumber || "",
    );

    setAssignFieldError("");
    setError("");
    setSuccess("");

    setShowAssignProgrammeDialog(true);

    /*
     * Refresh the catalogues when the assignment
     * dialog is opened. This prevents stale/empty
     * dropdown data after adding a new programme
     * or academic session.
     */
    if (programmes.length === 0) {
      loadProgrammes();
    }

    if (academicSessions.length === 0) {
      loadAcademicSessions();
    }
  };

  /* =========================================================
     CLOSE ASSIGN DIALOG
  ========================================================= */

  const closeAssignDialog = () => {
    setShowAssignProgrammeDialog(false);

    setSelectedProgramme("");
    setSelectedSession("");
    setSelectedLevel("");
    setSelectedMatric("");

    setAssignFieldError("");
  };

  /* =========================================================
     ASSIGN PROGRAMME
  ========================================================= */

  const handleAssignProgramme =
    async () => {
      if (!selectedStudent) {
        return;
      }

      if (!selectedProgramme) {
        setAssignFieldError(
          "Please select a programme.",
        );
        return;
      }

      try {
        setProcessing(true);
        setAssignFieldError("");
        setError("");
        setSuccess("");

        const body: Record<
          string,
          string
        > = {
          programme:
            selectedProgramme,
        };

        if (selectedLevel.trim()) {
          body.level =
            selectedLevel.trim();
        }

        if (selectedMatric.trim()) {
          body.matricNumber =
            selectedMatric
              .trim()
              .toUpperCase();
        }

        if (selectedSession) {
          body.academicSession =
            selectedSession;
        }

        const response =
          await apiPatch<AssignmentResponse>(
            `/users/${selectedStudent._id}/programme`,
            body,
            accessToken,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to update student programme.",
          );
        }

        /*
         * Build a reliable local student object.
         *
         * Some backend responses return programme/session
         * as IDs while the UI expects objects. We therefore
         * merge the selected catalogue objects into the
         * returned student when necessary.
         */
        const returnedUser =
          response.user;

        const updatedStudent: Student = {
          ...(returnedUser ||
            selectedStudent),

          programme:
            returnedUser?.programme ||
            programmes.find(
              (programme) =>
                programme._id ===
                selectedProgramme,
            ) ||
            selectedProgramme,

          academicSession:
            returnedUser?.academicSession ||
            academicSessions.find(
              (session) =>
                session._id ===
                selectedSession,
            ) ||
            (selectedSession ||
              selectedStudent.academicSession),

          level:
            returnedUser?.level ||
            selectedLevel ||
            selectedStudent.level,

          matricNumber:
            returnedUser?.matricNumber ||
            selectedMatric ||
            selectedStudent.matricNumber,
        };

        setStudents(
          (currentStudents) =>
            currentStudents.map(
              (student) =>
                student._id ===
                selectedStudent._id
                  ? updatedStudent
                  : student,
            ),
        );

        setSelectedStudent(
          updatedStudent,
        );

        setSuccess(
          "Student academic information updated successfully.",
        );

        setShowAssignProgrammeDialog(
          false,
        );

        /*
         * Reset the form after closing.
         */
        setSelectedProgramme("");
        setSelectedSession("");
        setSelectedLevel("");
        setSelectedMatric("");
        setAssignFieldError("");
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update student programme.";

        setAssignFieldError(message);
      } finally {
        setProcessing(false);
      }
    };

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    await loadStudents(true);
    await loadProgrammes();
    await loadAcademicSessions();

    setSuccess(
      "Student data refreshed successfully.",
    );

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy shadow-sm">
              <Users className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-brand-navy">
                Students
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage student records, programmes,
                academic sessions and status.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-10 gap-2 border-slate-200 bg-white shadow-sm hover:border-brand-gold hover:text-brand-navy"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Data"}
        </Button>
      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-bold">
                Unable to load data
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="font-semibold">
              {success}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Students
                </p>

                <p className="mt-2 text-3xl font-black text-brand-navy">
                  {students.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/10">
                <Users className="h-5 w-5 text-brand-navy" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Students
                </p>

                <p className="mt-2 text-3xl font-black text-emerald-600">
                  {activeStudents}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Suspended
                </p>

                <p className="mt-2 text-3xl font-black text-amber-600">
                  {suspendedStudents}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Programmes
                </p>

                <p className="mt-2 text-3xl font-black text-brand-navy">
                  {programmeCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/15">
                <GraduationCap className="h-5 w-5 text-brand-gold" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder="Search by name, email, matric number or programme..."
                className="h-10 border-slate-200 pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(
                  value ?? "all",
                )
              }
            >
              <SelectTrigger className="h-10 w-full border-slate-200 bg-slate-50/60 md:w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>

              <SelectContent className="z-[100]">
                <SelectItem value="all">
                  All Status
                </SelectItem>

                <SelectItem value="active">
                  Active
                </SelectItem>

                <SelectItem value="suspended">
                  Suspended
                </SelectItem>

                <SelectItem value="inactive">
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          STUDENTS TABLE
      ===================================================== */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />

                <p className="text-sm font-medium text-slate-500">
                  Loading students...
                </p>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Users className="h-7 w-7 text-slate-400" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No students found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Try changing your search or
                status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Student
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Matric Number
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Programme
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Session
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Level
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(
                    (student) => (
                      <tr
                        key={student._id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-xs font-black text-white">
                              {getInitials(
                                student.name,
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-800">
                                {student.name}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-700">
                            {student.matricNumber ||
                              "Not assigned"}
                          </span>
                        </td>

                        <td className="max-w-[260px] px-6 py-4">
                          <p className="truncate text-sm font-medium text-slate-700">
                            {getProgrammeName(
                              student.programme,
                              programmes,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {getSessionName(
                              student.academicSession,
                              academicSessions,
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-600">
                            {student.level ||
                              "—"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {student.isSuspended ? (
                            <Badge className="border-0 bg-amber-100 text-amber-700">
                              Suspended
                            </Badge>
                          ) : student.isActive ? (
                            <Badge className="border-0 bg-emerald-100 text-emerald-700">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="border-0 bg-slate-100 text-slate-600">
                              Inactive
                            </Badge>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openDetails(
                                  student,
                                )
                              }
                              className="gap-1.5 border-slate-200"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                openAssignProgramme(
                                  student,
                                )
                              }
                              className="gap-1.5 bg-brand-navy text-white hover:bg-brand-navy/90"
                            >
                              <GraduationCap className="h-4 w-4" />
                              Assign
                            </Button>
                          </div>
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
          DETAILS DIALOG
      ===================================================== */}

      <Dialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      >
        <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto p-0">
          {selectedStudent && (
            <>
              <DialogHeader className="bg-brand-navy p-6 text-white">
                <DialogTitle className="flex items-center gap-3 text-xl font-black">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <UserCheck className="h-5 w-5" />
                  </div>

                  Student Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy text-lg font-black text-white">
                    {getInitials(
                      selectedStudent.name,
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      {selectedStudent.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {selectedStudent.email}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Matric Number
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {selectedStudent.matricNumber ||
                        "Not assigned"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Level
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {selectedStudent.level ||
                        "Not assigned"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Programme
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {getProgrammeName(
                        selectedStudent.programme,
                        programmes,
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Academic Session
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {getSessionName(
                        selectedStudent.academicSession,
                        academicSessions,
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-sm text-slate-500">
                      Account status
                    </span>

                    <span className="font-semibold text-slate-800">
                      {selectedStudent.isSuspended
                        ? "Suspended"
                        : selectedStudent.isActive
                          ? "Active"
                          : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-sm text-slate-500">
                      Email verified
                    </span>

                    <span className="font-semibold text-slate-800">
                      {selectedStudent.isEmailVerified
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Registered
                    </span>

                    <span className="font-semibold text-slate-800">
                      {formatDate(
                        selectedStudent.createdAt,
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowDetailsDialog(false);

                      openAssignProgramme(
                        selectedStudent,
                      );
                    }}
                    className="gap-2 bg-brand-navy text-white hover:bg-brand-navy/90"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Assign Programme
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* =====================================================
          ASSIGN PROGRAMME DIALOG
      ===================================================== */}

      <Dialog
        open={showAssignProgrammeDialog}
        /*
         * Important:
         * The Select component in this project uses Base UI.
         * Keeping the dialog non-modal prevents the dialog's
         * focus layer from interfering with the Select popup.
         */
        modal={false}
        onOpenChange={(open) => {
          if (!open) {
            closeAssignDialog();
          }
        }}
      >
        <DialogContent
          className="
            max-h-[92vh]
            max-w-lg
            overflow-y-auto
            p-0
            [&>button]:text-slate-500
            [&>button]:hover:bg-slate-100
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <DialogHeader className="bg-brand-navy p-6 text-white">
            <DialogTitle className="flex items-center gap-3 text-xl font-black">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <GraduationCap className="h-5 w-5" />
              </div>

              Assign Programme
            </DialogTitle>

            {selectedStudent && (
              <div className="mt-2">
                <p className="text-sm font-semibold text-white/90">
                  {selectedStudent.name}
                </p>

                <p className="text-xs text-white/60">
                  {selectedStudent.matricNumber ||
                    "No matric number assigned"}
                </p>
              </div>
            )}
          </DialogHeader>

          {/* =================================================
              FORM
          ================================================= */}

          <div className="space-y-5 p-6">
            {/* -----------------------------------------------
                PROGRAMME
            ------------------------------------------------ */}

            <div>
              <label
                htmlFor="student-programme"
                className="mb-2 flex items-center gap-1 text-sm font-bold text-slate-700"
              >
                Programme

                <span className="text-red-500">
                  *
                </span>
              </label>

              <Select
                value={
                  selectedProgramme || null
                }
                onValueChange={(value) => {
                  setSelectedProgramme(
                    value ?? "",
                  );

                  setAssignFieldError("");
                }}
                disabled={
                  programmesLoading
                }
              >
                <SelectTrigger
                  id="student-programme"
                  className={`h-11 w-full bg-white ${
                    assignFieldError
                      ? "border-red-300 ring-1 ring-red-200"
                      : "border-slate-200"
                  }`}
                >
                  <SelectValue placeholder="Select a programme" />
                </SelectTrigger>

                <SelectContent
                  className="z-[100] max-h-72"
                >
                  {programmes.map(
                    (programme) => (
                      <SelectItem
                        key={programme._id}
                        value={programme._id}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="font-medium">
                            {programme.name}
                          </span>

                          {programme.code && (
                            <span className="text-xs text-slate-400">
                              ({programme.code})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              {/* Loading / error / empty messages
                  are intentionally OUTSIDE SelectContent. */}

              {programmesLoading && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading programmes...
                </div>
              )}

              {!programmesLoading &&
                programmesError && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {programmesError}
                  </div>
                )}

              {!programmesLoading &&
                !programmesError &&
                programmes.length === 0 && (
                  <div className="mt-2 text-xs text-amber-600">
                    No programmes are available.
                  </div>
                )}

              {assignFieldError && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {assignFieldError}
                </p>
              )}
            </div>

            {/* -----------------------------------------------
                ACADEMIC SESSION
            ------------------------------------------------ */}

            <div>
              <label
                htmlFor="student-session"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Academic Session
              </label>

              <Select
                value={
                  selectedSession || null
                }
                onValueChange={(value) => {
                  setSelectedSession(
                    value ?? "",
                  );
                }}
                disabled={
                  sessionsLoading
                }
              >
                <SelectTrigger
                  id="student-session"
                  className="h-11 w-full border-slate-200 bg-white"
                >
                  <SelectValue placeholder="Select academic session" />
                </SelectTrigger>

                <SelectContent
                  className="z-[100] max-h-72"
                >
                  {academicSessions.map(
                    (session) => (
                      <SelectItem
                        key={session._id}
                        value={session._id}
                      >
                        {session.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              {sessionsLoading && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading academic sessions...
                </div>
              )}

              {!sessionsLoading &&
                sessionsError && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {sessionsError}
                  </div>
                )}

              {!sessionsLoading &&
                !sessionsError &&
                academicSessions.length ===
                  0 && (
                  <div className="mt-2 text-xs text-amber-600">
                    No academic sessions are available.
                  </div>
                )}
            </div>

            {/* -----------------------------------------------
                LEVEL
            ------------------------------------------------ */}

            <div>
              <label
                htmlFor="student-level"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Level
              </label>

              <Select
                value={
                  selectedLevel || null
                }
                onValueChange={(value) =>
                  setSelectedLevel(
                    value ?? "",
                  )
                }
              >
                <SelectTrigger
                  id="student-level"
                  className="h-11 w-full border-slate-200 bg-white"
                >
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>

                <SelectContent className="z-[100]">
                  {LEVELS.map((level) => (
                    <SelectItem
                      key={level}
                      value={level}
                    >
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* -----------------------------------------------
                MATRIC NUMBER
            ------------------------------------------------ */}

            <div>
              <label
                htmlFor="student-matric"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Matric Number
              </label>

              <Input
                id="student-matric"
                value={selectedMatric}
                onChange={(event) =>
                  setSelectedMatric(
                    event.target.value,
                  )
                }
                placeholder="e.g. ITMT/2026/001"
                className="h-11 border-slate-200 uppercase"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Leave blank to keep the existing
                matric number.
              </p>
            </div>

            {/* -----------------------------------------------
                CURRENT ASSIGNMENT SUMMARY
            ------------------------------------------------ */}

            {selectedStudent && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-navy" />

                  <p className="text-sm font-black text-slate-800">
                    Current Academic Information
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Programme
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {getProgrammeName(
                        selectedStudent.programme,
                        programmes,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Session
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {getSessionName(
                        selectedStudent.academicSession,
                        academicSessions,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Level
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedStudent.level ||
                        "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Matric Number
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedStudent.matricNumber ||
                        "Not assigned"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* -----------------------------------------------
                ACTIONS
            ------------------------------------------------ */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeAssignDialog}
                disabled={processing}
                className="h-11 border-slate-200"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleAssignProgramme}
                disabled={
                  processing ||
                  programmesLoading ||
                  programmes.length === 0 ||
                  !selectedProgramme
                }
                className="h-11 gap-2 bg-brand-navy px-6 text-white hover:bg-brand-navy/90"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Save Assignment
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}