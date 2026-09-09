"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { apiGet, apiPatch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Users,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock3,
  Search,
  RefreshCw,
  Eye,
  GraduationCap,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  ChevronRight,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

interface Admission {
  _id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  postalAddress?: string;
  residentialAddress?: string;
  programme?: { _id: string; name: string; code: string };
  department?: { _id: string; name: string; code: string };
  academicSession?: { _id: string; name: string };
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: { _id: string; name: string };
  student?: { _id: string; name: string };
  matricNumber?: string;
  rejectionReason?: string;
  referees?: Array<{ name: string; address: string; phone: string; isGuardianOrSponsor: boolean }>;
  educationHistory?: Array<{ schoolAttended: string; certificateObtained: string; dateObtained?: string; grade?: string }>;
  passportPhotoUrl?: string;
  medicalCondition?: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface RegistrarAdmissionsClientProps {
  initialAdmissions: Admission[];
  initialTotal: number;
  accessToken: string;
  initialError: string;
}

interface AdmissionsResponse {
  success: boolean;
  data: {
    items: Admission[];
    total: number;
  };
}

const statCards = [
  {
    key: "total",
    label: "Total Applications",
    description: "All submitted applications",
    icon: Users,
    color: "bg-brand-navy",
    textColor: "text-brand-gold",
  },
  {
    key: "pending",
    label: "Pending Review",
    description: "Awaiting registrar review",
    icon: Clock3,
    color: "bg-amber-500",
    textColor: "text-white",
  },
  {
    key: "approved",
    label: "Approved",
    description: "Successfully admitted",
    icon: CheckCircle2,
    color: "bg-emerald-500",
    textColor: "text-white",
  },
  {
    key: "rejected",
    label: "Rejected",
    description: "Not admitted",
    icon: XCircle,
    color: "bg-red-500",
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

function getStatusBadge(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "pending") {
    return (
      <Badge className="rounded-full border-0 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 shadow-none">
        <Clock3 className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    );
  }

  if (normalized === "under_review") {
    return (
      <Badge className="rounded-full border-0 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 shadow-none">
        <Clock3 className="mr-1 h-3 w-3" />
        Under Review
      </Badge>
    );
  }

  if (normalized === "approved") {
    return (
      <Badge className="rounded-full border-0 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 shadow-none">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Approved
      </Badge>
    );
  }

  if (normalized === "rejected") {
    return (
      <Badge className="rounded-full border-0 bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700 shadow-none">
        <XCircle className="mr-1 h-3 w-3" />
        Rejected
      </Badge>
    );
  }

  if (normalized === "withdrawn") {
    return (
      <Badge className="rounded-full border-0 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-none">
        Withdrawn
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full border-0 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-none">
      {status}
    </Badge>
  );
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
}

export default function RegistrarAdmissionsClient({
  initialAdmissions,
  initialTotal,
  accessToken,
  initialError,
}: RegistrarAdmissionsClientProps) {
  const [admissions, setAdmissions] = useState<Admission[]>(initialAdmissions);
  const [filteredAdmissions, setFilteredAdmissions] = useState<Admission[]>(initialAdmissions);
  const [total, setTotal] = useState(initialTotal);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState("");

  const stats = {
    total: admissions.length,
    pending: admissions.filter((a) => a.status === "PENDING").length,
    approved: admissions.filter((a) => a.status === "APPROVED").length,
    rejected: admissions.filter((a) => a.status === "REJECTED").length,
  };

  const loadAdmissions = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      try {
        const data = await apiGet<AdmissionsResponse>("/admissions?page=1&limit=50", accessToken);
        setAdmissions(data.data.items);
        setTotal(data.data.total);
      } catch (err) {
        console.error("Failed to load admissions:", err);
        setError("Unable to load admissions. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    let filtered = admissions;

    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.applicationNumber.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query) ||
          a.firstName.toLowerCase().includes(query) ||
          a.lastName.toLowerCase().includes(query) ||
          (a.middleName && a.middleName.toLowerCase().includes(query))
      );
    }

    setFilteredAdmissions(filtered);
  }, [statusFilter, searchQuery, admissions]);

  async function handleApprove() {
    if (!selectedAdmission) return;

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiPatch<{
        success: boolean;
        message: string;
        data: { applicationNumber: string; matricNumber: string; studentId: string };
      }>(`/admissions/${selectedAdmission._id}/approve`, {}, accessToken);

      setAdmissions((prev) =>
        prev.map((a) =>
          a._id === selectedAdmission._id
            ? {
                ...a,
                status: "APPROVED",
                reviewedAt: new Date().toISOString(),
                matricNumber: response.data.matricNumber,
              }
            : a
        )
      );

      setSuccess(`Application approved. Matric number: ${response.data.matricNumber}`);
      setShowApproveDialog(false);
      setShowDetailsDialog(false);
      setSelectedAdmission(null);
    } catch (err) {
      setError("Failed to approve application. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!selectedAdmission || !rejectionReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      await apiPatch(`/admissions/${selectedAdmission._id}/reject`, { reason: rejectionReason }, accessToken);

      setAdmissions((prev) =>
        prev.map((a) =>
          a._id === selectedAdmission._id
            ? { ...a, status: "REJECTED", reviewedAt: new Date().toISOString(), rejectionReason }
            : a
        )
      );

      setSuccess("Application rejected successfully");
      setShowRejectDialog(false);
      setShowDetailsDialog(false);
      setRejectionReason("");
      setSelectedAdmission(null);
    } catch (err) {
      setError("Failed to reject application. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  function openDetails(admission: Admission) {
    setSelectedAdmission(admission);
    setShowDetailsDialog(true);
  }

  function openApproveDialog(admission: Admission) {
    setSelectedAdmission(admission);
    setShowApproveDialog(true);
  }

  function openRejectDialog(admission: Admission) {
    setSelectedAdmission(admission);
    setShowRejectDialog(true);
    setRejectionReason("");
  }

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-xl shadow-brand-navy/20">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-800">Loading admissions</p>
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
  {/* Subtle background details */}
  <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand-blue/15 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-28 right-1/3 h-48 w-48 rounded-full bg-brand-gold/10 blur-3xl" />

  {/* Subtle grid texture */}
  <div
    className="
      pointer-events-none absolute inset-0 opacity-[0.035]
      [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
      [background-size:32px_32px]
    "
  />

  <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
    {/* Left */}
    <div className="flex min-w-0 items-center gap-4">
      {/* Section icon */}
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
        <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7" />
      </div>

      <div className="min-w-0">
        {/* Eyebrow */}
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold sm:text-[11px]">
            Admissions Management
          </p>
        </div>

        {/* Title */}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Admissions
        </h1>

        {/* Description */}
        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
          Review applications, verify applicant information and manage
          admission decisions.
        </p>
      </div>
    </div>

    {/* Right */}
    <div className="flex shrink-0 items-center gap-3">
      {/* Live indicator */}
      <div
        className="
          hidden items-center gap-2
          rounded-lg
          border border-white/10
          bg-white/5
          px-3 py-2
          text-[11px] font-medium text-slate-300
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
        onClick={() => loadAdmissions(true)}
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
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => loadAdmissions()}
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
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
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
            ADMISSIONS WORKSPACE
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
                      placeholder="Search applicants, application number..."
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
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs font-medium text-slate-400">
                  Showing {filteredAdmissions.length} of {total} applications
                </div>
              </div>

              {/* Table */}
              {filteredAdmissions.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-700">No admission applications</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                    {searchQuery || statusFilter !== "all"
                      ? "No applications match your current filters."
                      : "Applications will appear here when submitted."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-4">Applicant</th>
                        <th className="px-6 py-4">Application No.</th>
                        <th className="px-6 py-4">Programme</th>
                        <th className="px-6 py-4">Session</th>
                        <th className="px-6 py-4">Submitted</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAdmissions.map((admission, index) => (
                        <motion.tr
                          key={admission._id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="group transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {admission.passportPhotoUrl ? (
                                <img
                                  src={admission.passportPhotoUrl}
                                  alt=""
                                  className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold ring-2 ring-slate-100">
                                  {getInitials(admission.firstName, admission.lastName)}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {admission.firstName} {admission.middleName && `${admission.middleName} `}{" "}
                                  {admission.lastName}
                                </p>
                                <p className="text-xs text-slate-500">{admission.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-mono text-xs font-semibold text-brand-navy">
                              {admission.applicationNumber}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-900">
                              {admission.programme?.name || "—"}
                            </p>
                            {admission.programme?.code && (
                              <p className="text-xs text-slate-500">{admission.programme.code}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-900">{admission.academicSession?.name || "—"}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-500">{formatDateShort(admission.submittedAt)}</p>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(admission.status)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openDetails(admission)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-navy"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {(admission.status === "PENDING" || admission.status === "UNDER_REVIEW") && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openApproveDialog(admission)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                    title="Approve"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openRejectDialog(admission)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                    title="Reject"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
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
          APPLICANT DETAILS DIALOG
      ============================================================ */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAdmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedAdmission.passportPhotoUrl ? (
                    <img
                      src={selectedAdmission.passportPhotoUrl}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold ring-2 ring-slate-100">
                      {getInitials(selectedAdmission.firstName, selectedAdmission.lastName)}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-bold text-slate-950">
                      {selectedAdmission.firstName} {selectedAdmission.middleName && `${selectedAdmission.middleName} `}{" "}
                      {selectedAdmission.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{selectedAdmission.applicationNumber}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status Actions */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedAdmission.status)}
                    {selectedAdmission.matricNumber && (
                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Matric: {selectedAdmission.matricNumber}
                      </div>
                    )}
                  </div>

                  {(selectedAdmission.status === "PENDING" || selectedAdmission.status === "UNDER_REVIEW") && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openApproveDialog(selectedAdmission)}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => openRejectDialog(selectedAdmission)}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Applicant Information */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-950">
                    <Users className="h-4 w-4 text-brand-navy" />
                    Applicant Information
                  </h3>
                  <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Full Name</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedAdmission.firstName} {selectedAdmission.middleName && `${selectedAdmission.middleName} `}{" "}
                    {selectedAdmission.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Email</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {selectedAdmission.email}
                  </p>
                </div>
                {selectedAdmission.phone && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Phone</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {selectedAdmission.phone}
                    </p>
                  </div>
                )}
                {selectedAdmission.dateOfBirth && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Date of Birth</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatDateShort(selectedAdmission.dateOfBirth)}
                    </p>
                  </div>
                )}
                {selectedAdmission.gender && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Gender</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedAdmission.gender}</p>
                  </div>
                )}
                {selectedAdmission.nationality && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Nationality</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedAdmission.nationality}</p>
                  </div>
                )}
                {(selectedAdmission.postalAddress || selectedAdmission.residentialAddress) && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Address</p>
                    <p className="mt-1 flex items-start gap-1.5 text-sm font-medium text-slate-900">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
                      {selectedAdmission.residentialAddress || selectedAdmission.postalAddress}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Admission Information */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-950">
                <FileText className="h-4 w-4 text-brand-navy" />
                Admission Information
              </h3>
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Application Number</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-brand-navy">
                    {selectedAdmission.applicationNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</p>
                  <p className="mt-1">{getStatusBadge(selectedAdmission.status)}</p>
                </div>
                {selectedAdmission.programme && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Programme</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      {selectedAdmission.programme.name}
                    </p>
                  </div>
                )}
                {selectedAdmission.department && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Department</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedAdmission.department.name}</p>
                  </div>
                )}
                {selectedAdmission.academicSession && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Academic Session</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedAdmission.academicSession.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Submitted</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(selectedAdmission.submittedAt)}</p>
                </div>
                {selectedAdmission.reviewedAt && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reviewed</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(selectedAdmission.reviewedAt)}</p>
                  </div>
                )}
                {selectedAdmission.rejectionReason && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Rejection Reason</p>
                    <p className="mt-1 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                      {selectedAdmission.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Education History */}
            {selectedAdmission.educationHistory && selectedAdmission.educationHistory.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-950">
                  <GraduationCap className="h-4 w-4 text-brand-navy" />
                  Education History
                </h3>
                <div className="space-y-3">
                  {selectedAdmission.educationHistory.map((edu, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">School Attended</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{edu.schoolAttended}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Certificate</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{edu.certificateObtained}</p>
                        </div>
                        {edu.dateObtained && (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Date Obtained</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{edu.dateObtained}</p>
                          </div>
                        )}
                        {edu.grade && (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Grade</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{edu.grade}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Referees */}
            {selectedAdmission.referees && selectedAdmission.referees.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-950">
                  <Users className="h-4 w-4 text-brand-navy" />
                  Referees
                </h3>
                <div className="space-y-3">
                  {selectedAdmission.referees.map((referee, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Name</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{referee.name}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Phone</p>
                          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {referee.phone}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Address</p>
                          <p className="mt-1 flex items-start gap-1.5 text-sm font-medium text-slate-900">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
                            {referee.address}
                          </p>
                        </div>
                        {referee.isGuardianOrSponsor && (
                          <div className="sm:col-span-2">
                            <Badge className="bg-brand-navy text-brand-gold">Guardian / Sponsor</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            {(selectedAdmission.medicalCondition || selectedAdmission.referredBy) && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-950">
                  <FileText className="h-4 w-4 text-brand-navy" />
                  Additional Information
                </h3>
                <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
                  {selectedAdmission.medicalCondition && (
                    <div className="sm:col-span-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Medical Condition</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{selectedAdmission.medicalCondition}</p>
                    </div>
                  )}
                  {selectedAdmission.referredBy && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Referred By</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{selectedAdmission.referredBy}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>

      {/* ============================================================
          APPROVE CONFIRMATION DIALOG
      ============================================================ */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Admission</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to approve the admission application for{" "}
              <strong>
                {selectedAdmission?.firstName} {selectedAdmission?.lastName}
              </strong>
              . This action will:
              <ul className="mt-2 ml-4 list-disc space-y-1 text-slate-600">
                <li>Update the admission status to APPROVED</li>
                <li>Generate a matric number for the student</li>
                <li>Create a student account</li>
                <li>Send an activation email to the applicant</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={processing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Admission"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============================================================
          REJECT CONFIRMATION DIALOG
      ============================================================ */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Admission</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to reject the admission application for{" "}
              <strong>
                {selectedAdmission?.firstName} {selectedAdmission?.lastName}
              </strong>
              . Please provide a reason for rejection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="rejectionReason" className="mb-2 block text-sm font-medium text-slate-700">
                Reason for Rejection
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
                placeholder="Provide a reason for rejection..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleReject();
              }}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Admission"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
