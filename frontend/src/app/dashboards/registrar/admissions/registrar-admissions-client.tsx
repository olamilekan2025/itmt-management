"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

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
  ArrowUpRight,
  Loader2,
  Paperclip,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

/* =========================================================
   TYPES — matches server Admission model
========================================================= */

interface AdmissionDocument {
  type: string;
  filename: string;
  url: string;
}

interface Referee {
  name: string;
  address?: string;
  phone?: string;
  relationship?: string;
}

interface EducationRecord {
  schoolAttended: string;
  certificate: string;
  dateObtained?: string;
  grade?: string;
}

interface Admission {
  _id: string;
  applicationNumber: string;
  surname: string;
  otherNames: string;
  email: string;
  telephone?: string;
  dateOfBirth?: string;
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
  referees?: Referee[];
  educationRecords?: EducationRecord[];
  documents?: AdmissionDocument[];
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

/* =========================================================
   DOCUMENT TYPE LABELS
========================================================= */

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  passportPhoto: "Passport photograph",
  primarySchoolCertificate: "Primary school certificate",
  secondarySchoolCertificate: "Secondary school certificate",
  birthCertificate: "Birth certificate",
  waecNecoResult: "WAEC/NECO result",
  testimonial: "Testimonial",
  stateOfOriginCertificate: "State of origin certificate",
};

function getDocumentLabel(type: string) {
  return DOCUMENT_TYPE_LABELS[type] || type;
}

/* =========================================================
   HELPERS
========================================================= */

function getPassportPhoto(admission: Admission): string | undefined {
  return admission.documents?.find((doc) => doc.type === "passportPhoto")?.url;
}

function getInitials(otherNames?: string, surname?: string) {
  return `${otherNames?.charAt(0) || ""}${surname?.charAt(0) || ""}`.toUpperCase();
}

function getFullName(admission: { otherNames?: string; surname?: string } | null | undefined) {
  if (!admission) return "";
  return `${admission.otherNames ?? ""} ${admission.surname ?? ""}`.trim();
}

function isGuardianOrSponsor(referee: Referee) {
  return /guardian|sponsor/i.test(referee.relationship || "");
}

/* =========================================================
   SAFE IMAGE — falls back gracefully instead of a broken
   image glyph when a Cloudinary URL 404s / 401s
========================================================= */

function SafeImage({
  src,
  alt,
  className,
  fallback,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <>{fallback}</>;
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

/* =========================================================
   MODAL BUILDING BLOCKS
========================================================= */

function SectionHeading({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/[0.06] text-brand-navy">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

function InfoField({
  label,
  value,
  icon: Icon,
  span,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  span?: boolean;
}) {
  if (!value) return null;

  return (
    <div className={span ? "sm:col-span-2" : undefined}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 flex items-start gap-1.5 text-sm font-medium text-slate-900">
        {Icon && <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />}
        <span>{value}</span>
      </p>
    </div>
  );
}

const statCards = [
  {
    key: "total",
    label: "Total Applications",
    description: "All submitted applications",
    icon: Users,
  },
  {
    key: "pending",
    label: "Pending Review",
    description: "Awaiting registrar review",
    icon: Clock3,
  },
  {
    key: "approved",
    label: "Approved",
    description: "Successfully admitted",
    icon: CheckCircle2,
  },
  {
    key: "rejected",
    label: "Rejected",
    description: "Not admitted",
    icon: XCircle,
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
          (a.otherNames && a.otherNames.toLowerCase().includes(query)) ||
          (a.surname && a.surname.toLowerCase().includes(query)),
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
            : a,
        ),
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
            : a,
        ),
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
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand-blue/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 h-48 w-48 rounded-full bg-brand-gold/10 blur-3xl" />

          <div
            className="
              pointer-events-none absolute inset-0 opacity-[0.035]
              [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
              [background-size:32px_32px]
            "
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
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
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold sm:text-[11px]">
                    Admissions Management
                  </p>
                </div>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Admissions</h1>

                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
                  Review applications, verify applicant information and manage admission decisions.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
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
                    ${refreshing ? "animate-spin" : "group-hover:rotate-45"}
                  `}
                />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
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
                      {filteredAdmissions.map((admission, index) => {
                        const passportPhoto = getPassportPhoto(admission);

                        return (
                          <motion.tr
                            key={admission._id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.03 }}
                            className="group transition-colors hover:bg-slate-50/70"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <SafeImage
                                  src={passportPhoto}
                                  alt=""
                                  className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                                  fallback={
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold ring-2 ring-slate-100">
                                      {getInitials(admission.otherNames, admission.surname)}
                                    </div>
                                  }
                                />
                                <div>
                                  <p className="font-semibold text-slate-900">{getFullName(admission)}</p>
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
                              <p className="text-sm font-medium text-slate-900">{admission.programme?.name || "—"}</p>
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* ============================================================
          APPLICANT DETAILS DIALOG — premium redesign
      ============================================================ */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden gap-0 p-0">
          {selectedAdmission && (
            <div className="flex max-h-[92vh] flex-col">
              {/* -------------------------------------------------
                  RECORD BANNER
              ------------------------------------------------- */}
              <div className="relative shrink-0 overflow-hidden bg-brand-navy px-6 pb-6 pt-7 sm:px-8">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-gold/10 blur-3xl" />
                <div
                  className="
                    pointer-events-none absolute inset-0 opacity-[0.04]
                    [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
                    [background-size:28px_28px]
                  "
                />

                <DialogHeader className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <SafeImage
                        src={getPassportPhoto(selectedAdmission)}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-brand-gold/40 sm:h-20 sm:w-20"
                        fallback={
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-brand-gold ring-2 ring-brand-gold/40 sm:h-20 sm:w-20 sm:text-xl">
                            {getInitials(selectedAdmission.otherNames, selectedAdmission.surname)}
                          </div>
                        }
                      />
                      <div className="min-w-0 text-left">
                        <DialogTitle className="truncate font-serif text-xl font-semibold text-white sm:text-2xl">
                          {getFullName(selectedAdmission)}
                        </DialogTitle>
                        <p className="mt-1 font-mono text-xs text-slate-300">
                          {selectedAdmission.applicationNumber}
                        </p>
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-300">
                          <Mail className="h-3 w-3" />
                          {selectedAdmission.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {getStatusBadge(selectedAdmission.status)}
                      {selectedAdmission.matricNumber && (
                        <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-brand-gold ring-1 ring-white/10">
                          <GraduationCap className="h-3 w-3" />
                          {selectedAdmission.matricNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </DialogHeader>
              </div>

              {/* -------------------------------------------------
                  ACTION BAR
              ------------------------------------------------- */}
              {(selectedAdmission.status === "PENDING" || selectedAdmission.status === "UNDER_REVIEW") && (
                <div className="flex shrink-0 items-center justify-end gap-2 border-b border-slate-100 bg-slate-50/80 px-6 py-3 backdrop-blur-sm sm:px-8">
                  <button
                    type="button"
                    onClick={() => openRejectDialog(selectedAdmission)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => openApproveDialog(selectedAdmission)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve application
                  </button>
                </div>
              )}

              {/* -------------------------------------------------
                  SCROLLABLE RECORD BODY
              ------------------------------------------------- */}
              <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                <div className="divide-y divide-slate-100">
                  {/* Applicant Information */}
                  <section className="pb-6">
                    <SectionHeading icon={Users} title="Applicant information" />
                    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                      <InfoField label="Full name" value={getFullName(selectedAdmission)} />
                      <InfoField label="Email" value={selectedAdmission.email} icon={Mail} />
                      <InfoField label="Phone" value={selectedAdmission.telephone} icon={Phone} />
                      <InfoField
                        label="Date of birth"
                        value={selectedAdmission.dateOfBirth ? formatDateShort(selectedAdmission.dateOfBirth) : undefined}
                        icon={Calendar}
                      />
                      <InfoField label="Nationality" value={selectedAdmission.nationality} />
                      <InfoField
                        label="Address"
                        value={selectedAdmission.residentialAddress || selectedAdmission.postalAddress}
                        icon={MapPin}
                        span
                      />
                    </div>
                  </section>

                  {/* Admission Information */}
                  <section className="py-6">
                    <SectionHeading icon={FileText} title="Admission information" />
                    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                      <InfoField
                        label="Programme"
                        value={selectedAdmission.programme?.name}
                        icon={BookOpen}
                      />
                      <InfoField label="Department" value={selectedAdmission.department?.name} />
                      <InfoField label="Academic session" value={selectedAdmission.academicSession?.name} />
                      <InfoField label="Submitted" value={formatDate(selectedAdmission.submittedAt)} />
                      {selectedAdmission.reviewedAt && (
                        <InfoField label="Reviewed" value={formatDate(selectedAdmission.reviewedAt)} />
                      )}
                    </div>
                    {selectedAdmission.rejectionReason && (
                      <div className="mt-4 rounded-r-lg border-l-4 border-red-300 bg-red-50/70 py-2.5 pl-4 pr-3">
                        <p className="text-xs font-medium text-red-600">Rejection reason</p>
                        <p className="mt-0.5 text-sm text-red-800">{selectedAdmission.rejectionReason}</p>
                      </div>
                    )}
                  </section>

                  {/* Uploaded Documents */}
                  {selectedAdmission.documents && selectedAdmission.documents.length > 0 && (
                    <section className="py-6">
                      <SectionHeading icon={Paperclip} title="Uploaded documents" />
                      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                        {selectedAdmission.documents.map((doc, index) => (
                          <a
                            key={`${doc.type}-${index}`}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-slate-50"
                          >
                            <SafeImage
                              src={doc.url}
                              alt={getDocumentLabel(doc.type)}
                              className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                              fallback={
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                                  <FileText className="h-4.5 w-4.5" />
                                </div>
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {getDocumentLabel(doc.type)}
                              </p>
                              <p className="truncate text-xs text-slate-500">{doc.filename}</p>
                            </div>
                            <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-brand-navy sm:flex">
                              View document
                              <ExternalLink className="h-3.5 w-3.5" />
                            </span>
                            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 sm:hidden" />
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Education Records */}
                  {selectedAdmission.educationRecords && selectedAdmission.educationRecords.length > 0 && (
                    <section className="py-6">
                      <SectionHeading icon={GraduationCap} title="Education history" />
                      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                        {selectedAdmission.educationRecords.map((edu, index) => (
                          <div key={index} className="bg-white px-4 py-3">
                            <div className="flex items-baseline justify-between gap-4">
                              <p className="text-sm font-semibold text-slate-900">{edu.schoolAttended}</p>
                              {edu.dateObtained && (
                                <p className="shrink-0 text-xs text-slate-400">{edu.dateObtained}</p>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {edu.certificate}
                              {edu.grade ? ` · ${edu.grade}` : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Referees */}
                  {selectedAdmission.referees && selectedAdmission.referees.length > 0 && (
                    <section className="py-6">
                      <SectionHeading icon={Users} title="Referees" />
                      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                        {selectedAdmission.referees.map((referee, index) => (
                          <div key={index} className="bg-white px-4 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900">{referee.name}</p>
                              <div className="flex items-center gap-1.5">
                                {referee.relationship && (
                                  <span className="text-xs text-slate-500">{referee.relationship}</span>
                                )}
                                {isGuardianOrSponsor(referee) && (
                                  <Badge className="rounded-full border-0 bg-brand-navy px-2 py-0.5 text-[10px] font-semibold text-brand-gold">
                                    Guardian / Sponsor
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                              {referee.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {referee.phone}
                                </span>
                              )}
                              {referee.address && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {referee.address}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Additional Information */}
                  {(selectedAdmission.medicalCondition || selectedAdmission.referredBy) && (
                    <section className="pt-6">
                      <SectionHeading icon={FileText} title="Additional information" />
                      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                        <InfoField label="Medical condition" value={selectedAdmission.medicalCondition} span />
                        <InfoField label="Referred by" value={selectedAdmission.referredBy} />
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
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
              <strong>{getFullName(selectedAdmission)}</strong>. This action will:
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
              <strong>{getFullName(selectedAdmission)}</strong>. Please provide a reason for rejection.
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
