"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Search,
  RefreshCw,
  Eye,
  BookOpen,
  Calendar,
  Mail,
  MapPin,
  ArrowUpRight,
  Loader2,
  Edit,
  ShieldCheck,
  ShieldAlert,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";

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

const statCards = [
  {
    key: "total",
    label: "Total Students",
    description: "All registered students",
    icon: Users,
    color: "bg-brand-navy",
    textColor: "text-brand-gold",
  },
  {
    key: "active",
    label: "Active Students",
    description: "Portal access enabled",
    icon: UserCheck,
    color: "bg-emerald-500",
    textColor: "text-white",
  },
  {
    key: "suspended",
    label: "Suspended",
    description: "Account suspended",
    icon: ShieldAlert,
    color: "bg-amber-500",
    textColor: "text-white",
  },
  {
    key: "programmes",
    label: "Programmes",
    description: "Programmes represented",
    icon: GraduationCap,
    color: "bg-brand-blue",
    textColor: "text-white",
  },
];

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatDateShort(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "short",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getStatusBadge(isActive: boolean, isSuspended: boolean) {
  if (isSuspended) {
    return (
      <Badge className="rounded-full border-0 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 shadow-none">
        <ShieldAlert className="mr-1 h-3 w-3" />
        Suspended
      </Badge>
    );
  }

  if (isActive) {
    return (
      <Badge className="rounded-full border-0 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 shadow-none">
        <ShieldCheck className="mr-1 h-3 w-3" />
        Active
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full border-0 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-none">
      <UserX className="mr-1 h-3 w-3" />
      Inactive
    </Badge>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getProgrammeName(programme?: Programme | string | null): string {
  if (!programme) {
    return "Not assigned";
  }

  if (typeof programme === "string") {
    return programme;
  }

  return programme.name;
}

function getProgrammeCode(programme?: Programme | string | null): string | null {
  if (typeof programme === "object" && programme !== null && programme.code) {
    return programme.code;
  }

  return null;
}

function getSessionName(session?: AcademicSession | string | null): string {
  if (!session) {
    return "Not assigned";
  }

  if (typeof session === "string") {
    return session;
  }

  return session.name;
}

export default function RegistrarStudentsClient({
  initialStudents,
  accessToken,
  initialError,
}: RegistrarStudentsClientProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(initialStudents);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAssignProgrammeDialog, setShowAssignProgrammeDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState("");

  // Programme assignment state
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
  const [selectedProgramme, setSelectedProgramme] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedMatric, setSelectedMatric] = useState<string>("");

  const stats = {
    total: students.length,
    active: students.filter((s) => s.isActive && !s.isSuspended).length,
    suspended: students.filter((s) => s.isSuspended).length,
    programmes: new Set(
      students
        .map((s) => (typeof s.programme === "object" && s.programme ? s.programme._id : null))
        .filter(Boolean)
    ).size,
  };

  const loadStudents = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      try {
        const data = await apiGet<StudentsResponse>("/users?role=student", accessToken);
        setStudents(data.users ?? data.students ?? []);
      } catch (err) {
        console.error("Failed to load students:", err);
        setError("Unable to load students. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  const loadProgrammes = useCallback(async () => {
    try {
      const data = await apiGet<ProgrammesResponse>("/programmes", accessToken);
      setProgrammes(data.programmes || []);
    } catch (err) {
      console.error("Failed to load programmes:", err);
    }
  }, [accessToken]);

  const loadAcademicSessions = useCallback(async () => {
    try {
      const data = await apiGet<AcademicSessionsResponse>("/academic-sessions", accessToken);
      setAcademicSessions(data.academicSessions || []);
    } catch (err) {
      console.error("Failed to load academic sessions:", err);
    }
  }, [accessToken]);

  useEffect(() => {
    loadProgrammes();
    loadAcademicSessions();
  }, [loadProgrammes, loadAcademicSessions]);

  useEffect(() => {
    let filtered = students;

    if (statusFilter === "active") {
      filtered = filtered.filter((s) => s.isActive && !s.isSuspended);
    } else if (statusFilter === "suspended") {
      filtered = filtered.filter((s) => s.isSuspended);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((s) => !s.isActive && !s.isSuspended);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          (s.matricNumber && s.matricNumber.toLowerCase().includes(query)) ||
          getProgrammeName(s.programme).toLowerCase().includes(query)
      );
    }

    setFilteredStudents(filtered);
  }, [statusFilter, searchQuery, students]);

  async function handleAssignProgramme() {
    if (!selectedStudent || !selectedProgramme) {
      setError("Please select a programme");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const body: any = { programme: selectedProgramme };

      if (selectedLevel) body.level = selectedLevel;
      if (selectedMatric) body.matricNumber = selectedMatric;
      if (selectedSession) body.academicSession = selectedSession;

      const response = await apiPatch<{
        success: boolean;
        message: string;
        user?: Student;
      }>(`/users/${selectedStudent._id}/programme`, body, accessToken);

      if (response.success && response.user) {
        setStudents((prev) =>
          prev.map((s) => (s._id === selectedStudent._id ? response.user! : s))
        );

        setSuccess("Programme assigned successfully");
        setShowAssignProgrammeDialog(false);
        setSelectedStudent(null);
        setSelectedProgramme("");
        setSelectedSession("");
        setSelectedLevel("");
        setSelectedMatric("");
      }
    } catch (err) {
      setError("Failed to assign programme. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  function openDetails(student: Student) {
    setSelectedStudent(student);
    setShowDetailsDialog(true);
  }

  function openAssignProgramme(student: Student) {
    setSelectedStudent(student);
    setSelectedProgramme(typeof student.programme === "object" && student.programme ? student.programme._id : "");
    setSelectedSession(typeof student.academicSession === "object" && student.academicSession ? student.academicSession._id : "");
    setSelectedLevel(student.level || "");
    setSelectedMatric(student.matricNumber || "");
    setShowAssignProgrammeDialog(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-xl shadow-brand-navy/20">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-800">Loading students</p>
          <p className="mt-1 text-xs text-slate-500">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1600px] space-y-7">
        {/* ============================================================
            PAGE HEADER
        ============================================================ */}
<motion.section
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.45,
    ease: [0.22, 1, 0.36, 1],
  }}
  className="
    relative overflow-hidden
    rounded-2xl
    bg-brand-navy
    px-5 py-5
    shadow-lg shadow-brand-navy/10
    sm:px-6 sm:py-6
  "
>
  {/* Subtle background effects */}
  <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand-blue/15 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-28 right-1/3 h-48 w-48 rounded-full bg-brand-gold/10 blur-3xl" />

  {/* Subtle grid texture */}
  <div
    className="
      pointer-events-none absolute inset-0
      opacity-[0.035]
      [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
      [background-size:32px_32px]
    "
  />

  <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
    {/* Heading */}
    <div className="flex min-w-0 items-center gap-4">
      {/* Icon */}
      <div
        className="
          flex h-12 w-12 shrink-0 items-center justify-center
          rounded-xl
          border border-white/10
          bg-white/10
          text-brand-gold
          shadow-inner
          backdrop-blur-sm
          sm:h-14 sm:w-14
        "
      >
        <Users className="h-6 w-6 sm:h-7 sm:w-7" />
      </div>

      <div className="min-w-0">
        {/* Eyebrow */}
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

          <p
            className="
              text-[10px] font-bold uppercase
              tracking-[0.2em]
              text-brand-gold
              sm:text-[11px]
            "
          >
            Student Records
          </p>
        </div>

        {/* Title */}
        <h1
          className="
            mt-1
            text-2xl font-bold
            tracking-tight
            text-white
            sm:text-3xl
          "
        >
          Students
        </h1>

        {/* Description */}
        <p
          className="
            mt-1.5
            max-w-2xl
            text-xs leading-5
            text-slate-300
            sm:text-sm
          "
        >
          Manage student records, academic information and enrolment details.
        </p>
      </div>
    </div>

    {/* Actions */}
    <div className="flex shrink-0 items-center gap-3">
      {/* Live status */}
      <div
        className="
          hidden items-center gap-2
          rounded-lg
          border border-white/10
          bg-white/5
          px-3 py-2
          text-[11px] font-medium
          text-slate-300
          backdrop-blur-sm
          md:flex
        "
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>

        Live data
      </div>

      {/* Refresh */}
      <button
        type="button"
        onClick={() => loadStudents(true)}
        disabled={refreshing}
        className="
          group
          inline-flex items-center justify-center gap-2
          rounded-xl
          border border-white/15
          bg-white
          px-4 py-2.5
          text-sm font-bold
          text-brand-navy
          shadow-md shadow-black/10
          transition-all duration-200
          hover:-translate-y-0.5
          hover:bg-slate-100
          hover:shadow-lg
          disabled:cursor-not-allowed
          disabled:opacity-60
          disabled:hover:translate-y-0
        "
      >
        <RefreshCw
          className={`
            h-4 w-4
            transition-transform duration-300
            ${
              refreshing
                ? "animate-spin"
                : "group-hover:rotate-45"
            }
          `}
        />

        <span>
          {refreshing ? "Refreshing..." : "Refresh"}
        </span>
      </button>
    </div>
  </div>
</motion.section>



        {/* ============================================================
            ERROR / SUCCESS BANNERS
        ============================================================ */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                <UserX className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => loadStudents()}
              className="text-sm font-bold text-red-800 underline underline-offset-4"
            >
              Retry
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                <UserCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-emerald-800">{success}</p>
            </div>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="text-sm font-bold text-emerald-800 underline underline-offset-4"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* ============================================================
            STATISTICS CARDS
        ============================================================ */}
        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              const value = stats[card.key as keyof typeof stats] || 0;

              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                >
                  <Card className="relative overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
                    <div className="absolute inset-x-0 top-0 h-1 bg-brand-navy transition-all duration-300 hover:h-1.5" />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold shadow-md shadow-brand-navy/15 transition-transform duration-300 hover:scale-105">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:border-brand-navy/10 hover:bg-brand-navy hover:text-white">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-6">
                        <p className="text-[34px] font-extrabold leading-none tracking-tight text-slate-950">
                          {value.toLocaleString()}
                        </p>
                        <p className="mt-3 text-sm font-bold text-slate-900">{card.label}</p>
                        <p className="mt-1.5 text-xs leading-5 text-slate-500">{card.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ============================================================
            STUDENT MANAGEMENT WORKSPACE
        ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
            <CardContent className="p-0">
              {/* Toolbar */}
              <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs font-medium text-slate-400">
                  Showing {filteredStudents.length} of {students.length} students
                </div>
              </div>

              {/* Table */}
              {filteredStudents.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-700">No students found</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                    {searchQuery || statusFilter !== "all"
                      ? "No students match your current filters."
                      : "Student records will appear here when registered."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Matric Number</th>
                        <th className="px-6 py-4">Programme</th>
                        <th className="px-6 py-4">Level</th>
                        <th className="px-6 py-4">Session</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((student, index) => (
                        <motion.tr
                          key={student._id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="group transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold ring-2 ring-slate-100">
                                {getInitials(student.name)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{student.name}</p>
                                <p className="text-xs text-slate-500">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {student.matricNumber ? (
                              <span className="font-mono text-xs font-semibold text-brand-navy">
                                {student.matricNumber}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Not assigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-900">{getProgrammeName(student.programme)}</p>
                            {getProgrammeCode(student.programme) && (
                              <p className="text-xs text-slate-500">{getProgrammeCode(student.programme)}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {student.level ? (
                              <span className="inline-flex rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {student.level}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Not assigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-900">{getSessionName(student.academicSession)}</p>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(student.isActive, student.isSuspended)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openDetails(student)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-navy"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openAssignProgramme(student)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-navy"
                                title="Assign programme"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* ============================================================
          STUDENT DETAILS DIALOG
      ============================================================ */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold ring-2 ring-slate-100">
                    {getInitials(selectedStudent.name)}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-950">{selectedStudent.name}</p>
                    <p className="text-sm text-slate-500">{selectedStudent.email}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">{getStatusBadge(selectedStudent.isActive, selectedStudent.isSuspended)}</div>
                  <div className="text-xs text-slate-500">
                    {selectedStudent.isEmailVerified ? "Email verified" : "Email not verified"}
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-950">
                    <GraduationCap className="h-4 w-4 text-brand-navy" />
                    Academic Information
                  </h3>
                  <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Matric Number</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-brand-navy">
                        {selectedStudent.matricNumber || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Level</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{selectedStudent.level || "Not assigned"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Programme</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                        <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                        {getProgrammeName(selectedStudent.programme)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Academic Session</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {getSessionName(selectedStudent.academicSession)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-950">
                    <ShieldCheck className="h-4 w-4 text-brand-navy" />
                    Account Information
                  </h3>
                  <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Account Status</p>
                      <p className="mt-1">{getStatusBadge(selectedStudent.isActive, selectedStudent.isSuspended)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Email Verification</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {selectedStudent.isEmailVerified ? "Verified" : "Not verified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Account Created</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(selectedStudent.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Last Updated</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(selectedStudent.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================
          ASSIGN PROGRAMME DIALOG
      ============================================================ */}
      <Dialog open={showAssignProgrammeDialog} onOpenChange={setShowAssignProgrammeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Programme</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedStudent && (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold">
                  {getInitials(selectedStudent.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selectedStudent.name}</p>
                  <p className="text-xs text-slate-500">{selectedStudent.email}</p>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Programme</label>
              <Select value={selectedProgramme} onValueChange={(value) => setSelectedProgramme(value || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a programme" />
                </SelectTrigger>
                <SelectContent>
                  {programmes.map((prog) => (
                    <SelectItem key={prog._id} value={prog._id}>
                      {prog.name} ({prog.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Academic Session</label>
              <Select value={selectedSession} onValueChange={(value) => setSelectedSession(value || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {academicSessions.map((session) => (
                    <SelectItem key={session._id} value={session._id}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Level</label>
              <Input
                type="text"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                placeholder="e.g., 100, 200, 300"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Matric Number</label>
              <Input
                type="text"
                value={selectedMatric}
                onChange={(e) => setSelectedMatric(e.target.value.toUpperCase())}
                placeholder="e.g., ITMT/2026/00123"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAssignProgrammeDialog(false);
                setSelectedStudent(null);
                setSelectedProgramme("");
                setSelectedSession("");
                setSelectedLevel("");
                setSelectedMatric("");
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAssignProgramme} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Programme"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
