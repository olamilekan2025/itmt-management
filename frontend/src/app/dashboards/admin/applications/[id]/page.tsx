"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  X,
  XCircle,
} from "lucide-react";

import { apiGet, apiPatch } from "@/lib/api";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type AdmissionStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";

type ActionModal =
  | "approve"
  | "reject"
  | null;

type Programme = {
  _id: string;
  name?: string;
  title?: string;
};

type Department = {
  _id: string;
  name?: string;
};

type AcademicSession = {
  _id: string;
  name?: string;
};

type ReviewedBy = {
  _id: string;
  name?: string;
  email?: string;
};

type Student = {
  _id: string;
  name?: string;
  email?: string;
  matricNumber?: string;
};

type Referee = {
  name: string;
  address: string;
  phone: string;
  isGuardianOrSponsor: boolean;
};

type EducationHistory = {
  schoolAttended: string;
  certificateObtained: string;
  dateObtained?: string;
  grade?: string;
};

type AdmissionDocument = {
  type: string;
  filename?: string;
  url: string;
};

type Admission = {
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

  programme?: Programme | null;
  department?: Department | null;
  academicSession?: AcademicSession | null;

  referees: Referee[];
  educationHistory: EducationHistory[];

  documents?: AdmissionDocument[];

  medicalCondition?: string;
  referredBy?: string;

  agreedToTerms: boolean;

  status: AdmissionStatus;

  submittedAt?: string;
  reviewedAt?: string;

  reviewedBy?: ReviewedBy | null;
  student?: Student | null;

  matricNumber?: string;
  rejectionReason?: string;

  createdAt?: string;
  updatedAt?: string;
};

type AdmissionResponse = {
  success: boolean;
  message?: string;
  data: Admission;
};

type ActionResponse = {
  success: boolean;
  message?: string;
  data?: {
    applicationNumber?: string;
    matricNumber?: string;
    studentId?: string;
  };
};

/*
 * =========================================================
 * STATUS CONFIG
 * =========================================================
 */

const statusConfig: Record<
  AdmissionStatus,
  {
    label: string;
    className: string;
    icon: typeof Clock3;
  }
> = {
  PENDING: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
  },

  UNDER_REVIEW: {
    label: "Under Review",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    icon: ShieldCheck,
  },

  APPROVED: {
    label: "Approved",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },

  REJECTED: {
    label: "Rejected",
    className:
      "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },

  WITHDRAWN: {
    label: "Withdrawn",
    className:
      "border-slate-200 bg-slate-100 text-slate-600",
    icon: XCircle,
  },
};

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function formatDate(
  date?: string,
  withTime = false,
) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    withTime
      ? {
          dateStyle: "medium",
          timeStyle: "short",
        }
      : {
          dateStyle: "medium",
        },
  ).format(parsed);
}

function getApplicantName(
  admission: Admission,
) {
  return [
    admission.surname,
    admission.otherNames,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getApplicantInitials(
  admission: Admission,
) {
  const surnameInitial =
    admission.surname?.trim()?.[0] || "";

  const otherNamesInitial =
    admission.otherNames?.trim()?.[0] || "";

  return `${surnameInitial}${otherNamesInitial}`.toUpperCase();
}

function getProgrammeName(
  programme?: Programme | null,
) {
  return (
    programme?.name ||
    programme?.title ||
    "Not specified"
  );
}

function getPassportDocument(
  documents?: AdmissionDocument[],
) {
  if (!documents?.length) {
    return undefined;
  }

  return documents.find((document) => {
    const type = document.type
      ?.trim()
      .toLowerCase();

    return (
      type === "passport" ||
      type === "passportphoto" ||
      type === "passport_photo" ||
      type === "passport-photo" ||
      type === "passport photograph" ||
      type === "passport_photograph"
    );
  });
}

function getSupportingDocuments(
  documents?: AdmissionDocument[],
) {
  if (!documents?.length) {
    return [];
  }

  const passport =
    getPassportDocument(documents);

  return documents.filter(
    (document) => document !== passport,
  );
}

/*
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function AdminApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const [application, setApplication] =
    useState<Admission | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [actionModal, setActionModal] =
    useState<ActionModal>(null);

  /*
   * =======================================================
   * DERIVED DOCUMENTS
   * =======================================================
   */

  const passportDocument = useMemo(
    () =>
      getPassportDocument(
        application?.documents,
      ),
    [application?.documents],
  );

  const supportingDocuments = useMemo(
    () =>
      getSupportingDocuments(
        application?.documents,
      ),
    [application?.documents],
  );

  /*
   * =======================================================
   * LOAD APPLICATION
   * =======================================================
   */

  const loadApplication =
    useCallback(async () => {
      if (sessionStatus === "loading") {
        return;
      }

      if (!session?.accessToken) {
        setError(
          "Authentication token is required. Please sign in again.",
        );

        setLoading(false);
        return;
      }

      if (!id) {
        setError(
          "Application ID is missing.",
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await apiGet<AdmissionResponse>(
            `/admissions/${id}`,
            session.accessToken,
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to load application.",
          );
        }

        setApplication(response.data);

        setRejectionReason(
          response.data.rejectionReason ||
            "",
        );
      } catch (err) {
        console.error(
          "Load application error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load application.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      id,
      session?.accessToken,
      sessionStatus,
    ]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  /*
   * =======================================================
   * MARK UNDER REVIEW
   * =======================================================
   */

  const markUnderReview =
    async () => {
      if (!application) return;

      if (!session?.accessToken) {
        setError(
          "Authentication token is required.",
        );
        return;
      }

      try {
        setProcessing(true);
        setError("");

        const response =
          await apiPatch<ActionResponse>(
            `/admissions/${application._id}/review`,
            {},
            session.accessToken,
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to mark application under review.",
          );
        }

        await loadApplication();
      } catch (err) {
        console.error(
          "Review application error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to review application.",
        );
      } finally {
        setProcessing(false);
      }
    };

  /*
   * =======================================================
   * APPROVE
   * =======================================================
   */

  const approveApplication =
    async () => {
      if (!application) return;

      if (!session?.accessToken) {
        setError(
          "Authentication token is required.",
        );
        return;
      }

      try {
        setProcessing(true);
        setError("");

        const response =
          await apiPatch<ActionResponse>(
            `/admissions/${application._id}/approve`,
            {},
            session.accessToken,
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to approve application.",
          );
        }

        setActionModal(null);

        await loadApplication();
      } catch (err) {
        console.error(
          "Approve application error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to approve application.",
        );
      } finally {
        setProcessing(false);
      }
    };

  /*
   * =======================================================
   * REJECT
   * =======================================================
   */

  const rejectApplication =
    async () => {
      if (!application) return;

      if (!session?.accessToken) {
        setError(
          "Authentication token is required.",
        );
        return;
      }

      const reason =
        rejectionReason.trim();

      if (reason.length < 5) {
        setError(
          "Please provide a rejection reason of at least 5 characters.",
        );

        setActionModal(null);
        return;
      }

      try {
        setProcessing(true);
        setError("");

        const response =
          await apiPatch<ActionResponse>(
            `/admissions/${application._id}/reject`,
            {
              reason,
            },
            session.accessToken,
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to reject application.",
          );
        }

        setActionModal(null);

        await loadApplication();
      } catch (err) {
        console.error(
          "Reject application error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to reject application.",
        );
      } finally {
        setProcessing(false);
      }
    };

  /*
   * =======================================================
   * CLOSE MODAL
   * =======================================================
   */

  const closeActionModal = () => {
    if (processing) return;

    setActionModal(null);
  };

  /*
   * =======================================================
   * LOADING
   * =======================================================
   */

  if (
    sessionStatus === "loading" ||
    loading
  ) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/5">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-900">
            Loading application
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  /*
   * =======================================================
   * ERROR
   * =======================================================
   */

  if (error && !application) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to applications
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load application
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadApplication}
            className="mt-5 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const config =
    statusConfig[
      application.status
    ];

  const StatusIcon =
    config.icon;

  const isPending =
    application.status === "PENDING";

  const isUnderReview =
    application.status ===
    "UNDER_REVIEW";

  const isApproved =
    application.status ===
    "APPROVED";

  const isRejected =
    application.status ===
    "REJECTED";

  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <div className="space-y-6 pb-12">
      {/* =================================================
          TOP NAVIGATION
      ================================================= */}

      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to applications
      </button>

      {/* =================================================
          HERO
      ================================================= */}

      <div className="relative overflow-hidden rounded-3xl bg-brand-navy px-6 py-7 text-white shadow-xl sm:px-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold backdrop-blur-sm">
              {getApplicantInitials(
                application,
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-white/50">
                Admission Application
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                {getApplicantName(
                  application,
                )}
              </h1>

              <p className="mt-1 text-sm text-white/60">
                {application.applicationNumber}
              </p>
            </div>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${config.className}`}
          >
            <StatusIcon className="h-4 w-4" />

            {config.label}
          </div>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <p>{error}</p>
        </div>
      )}

      {/* =================================================
          APPROVAL SUCCESS PANEL
      ================================================= */}

      {isApproved && (
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800">
                Application approved successfully
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                The applicant has been registered as a
                student.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white px-5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Matric Number
              </p>

              <p className="mt-1 font-mono text-sm font-bold text-brand-navy">
                {application.matricNumber ||
                  application.student
                    ?.matricNumber ||
                  "Generated"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* =============================================
              PERSONAL INFORMATION
          ============================================= */}

          <SectionCard
            icon={User}
            title="Personal Information"
            description="Applicant identity and contact details"
          >
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Detail
                label="Surname"
                value={
                  application.surname
                }
              />

              <Detail
                label="Other Names"
                value={
                  application.otherNames
                }
              />

              <Detail
                label="Date of Birth"
                value={formatDate(
                  application.dateOfBirth,
                )}
              />

              <Detail
                label="Nationality"
                value={
                  application.nationality
                }
              />

              <Detail
                label="Email"
                value={
                  application.email
                }
                icon={Mail}
              />

              <Detail
                label="Telephone"
                value={
                  application.telephone
                }
                icon={Phone}
              />
            </div>
          </SectionCard>

          {/* =============================================
              ADDRESS
          ============================================= */}

          <SectionCard
            icon={MapPin}
            title="Address Information"
            description="Applicant residential and postal address"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Detail
                label="Residential Address"
                value={
                  application.residentialAddress
                }
              />

              <Detail
                label="Postal Address"
                value={
                  application.postalAddress
                }
              />
            </div>
          </SectionCard>

          {/* =============================================
              ACADEMIC INFORMATION
          ============================================= */}

          <SectionCard
            icon={FileText}
            title="Academic Information"
            description="Programme and academic background"
          >
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Detail
                label="Programme"
                value={getProgrammeName(
                  application.programme,
                )}
              />

              <Detail
                label="Department"
                value={
                  application.department
                    ?.name
                }
              />

              <Detail
                label="Academic Session"
                value={
                  application
                    .academicSession
                    ?.name
                }
              />

              <Detail
                label="Referred By"
                value={
                  application.referredBy
                }
              />
            </div>
          </SectionCard>

          {/* =============================================
              EDUCATION HISTORY
          ============================================= */}

          {application.educationHistory
            ?.length > 0 && (
            <SectionCard
              icon={FileText}
              title="Education History"
              description="Previous schools and qualifications"
            >
              <div className="space-y-3">
                {application.educationHistory.map(
                  (
                    education,
                    index,
                  ) => (
                    <div
                      key={`${education.schoolAttended}-${index}`}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {
                              education.schoolAttended
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            {
                              education.certificateObtained
                            }
                          </p>
                        </div>

                        {education.grade && (
                          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                            {education.grade}
                          </span>
                        )}
                      </div>

                      {education.dateObtained && (
                        <p className="mt-3 text-xs text-slate-400">
                          Obtained:{" "}
                          {
                            education.dateObtained
                          }
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </SectionCard>
          )}

          {/* =============================================
              REFEREES
          ============================================= */}

          {application.referees
            ?.length > 0 && (
            <SectionCard
              icon={ShieldCheck}
              title="Referees"
              description="Applicant referee and sponsor information"
            >
              <div className="grid gap-4 md:grid-cols-2">
                {application.referees.map(
                  (
                    referee,
                    index,
                  ) => (
                    <div
                      key={`${referee.name}-${index}`}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {referee.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {referee.phone}
                          </p>
                        </div>

                        {referee.isGuardianOrSponsor && (
                          <span className="rounded-full bg-brand-navy/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-navy">
                            Guardian / Sponsor
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        {referee.address}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </SectionCard>
          )}

          {/* =============================================
              SUPPORTING DOCUMENTS
          ============================================= */}

          {supportingDocuments.length > 0 && (
            <SectionCard
              icon={FileText}
              title="Supporting Documents"
              description="Documents submitted with the admission application"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {supportingDocuments.map(
                  (
                    document,
                    index,
                  ) => (
                    <a
                      key={`${document.type}-${document.filename}-${index}`}
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-brand-navy/20 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {document.filename ||
                            document.type ||
                            "Document"}
                        </p>

                        <p className="mt-0.5 text-xs capitalize text-slate-400">
                          {document.type?.replace(
                            /[_-]/g,
                            " ",
                          )}
                        </p>
                      </div>

                      <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-brand-navy" />
                    </a>
                  ),
                )}
              </div>
            </SectionCard>
          )}

          {/* =============================================
              MEDICAL
          ============================================= */}

          {application.medicalCondition && (
            <SectionCard
              icon={FileText}
              title="Additional Information"
              description="Other information supplied by the applicant"
            >
              <Detail
                label="Medical Condition"
                value={
                  application.medicalCondition
                }
              />
            </SectionCard>
          )}

          {/* =============================================
              REJECTION
          ============================================= */}

          {isRejected &&
            application.rejectionReason && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 shrink-0 text-red-500" />

                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Rejection Reason
                    </p>

                    <p className="mt-2 text-sm leading-6 text-red-700">
                      {
                        application.rejectionReason
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <div className="space-y-6">
          {/* =============================================
              PASSPORT
          ============================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Passport Photograph
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Applicant identification photo
                  </p>
                </div>

                {passportDocument && (
                  <ImageIcon className="h-5 w-5 text-brand-navy" />
                )}
              </div>
            </div>

            <div className="flex justify-center bg-slate-50 p-6">
              {passportDocument?.url ? (
                <div className="space-y-3">
                  <img
                    src={
                      passportDocument.url
                    }
                    alt={`${getApplicantName(application)} passport photograph`}
                    className="h-64 w-48 rounded-xl border border-slate-200 bg-white object-cover shadow-md"
                  />

                  <a
                    href={
                      passportDocument.url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-brand-navy/20 hover:text-brand-navy"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Full Photo
                  </a>
                </div>
              ) : (
                <div className="flex h-64 w-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-center">
                  <div>
                    <User className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-2 text-xs font-medium text-slate-400">
                      No passport photo
                    </p>

                    <p className="mt-1 max-w-[150px] text-[10px] leading-4 text-slate-300">
                      No passport document was found in the submitted documents.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =============================================
              TIMELINE
          ============================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Application Timeline
            </h2>

            <div className="mt-6 space-y-6">
              <TimelineItem
                title="Application submitted"
                date={
                  application.submittedAt
                }
                active
              />

              <TimelineItem
                title="Application reviewed"
                date={
                  application.reviewedAt
                }
                active={Boolean(
                  application.reviewedAt,
                )}
              />

              {application.status ===
                "APPROVED" && (
                <TimelineItem
                  title="Application approved"
                  date={
                    application.reviewedAt
                  }
                  active
                />
              )}

              {application.status ===
                "REJECTED" && (
                <TimelineItem
                  title="Application rejected"
                  date={
                    application.reviewedAt
                  }
                  active
                  danger
                />
              )}
            </div>
          </div>

          {/* =============================================
              REVIEWER
          ============================================= */}

          {application.reviewedBy && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reviewed By
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {
                  application
                    .reviewedBy.name
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {
                  application
                    .reviewedBy.email
                }
              </p>
            </div>
          )}

          {/* =============================================
              ACTION PANEL
          ============================================= */}

          {(isPending ||
            isUnderReview) && (
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Application Decision
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Review Application
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Confirm the applicant's
                  admission decision.
                </p>
              </div>

              {isUnderReview && (
                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-700">
                  This application is currently
                  under review.
                </div>
              )}

              <div className="mt-5 space-y-3">
                {isPending && (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={
                      markUnderReview
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}

                    Mark Under Review
                  </button>
                )}

                <button
                  type="button"
                  disabled={processing}
                  onClick={() =>
                    setActionModal("approve")
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}

                  Approve Application
                </button>

                <div className="pt-2">
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Rejection Reason
                  </label>

                  <textarea
                    value={
                      rejectionReason
                    }
                    onChange={(event) =>
                      setRejectionReason(
                        event.target.value,
                      )
                    }
                    rows={4}
                    placeholder="Enter the reason for rejecting this application..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-500/5"
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Minimum 5 characters
                    </span>

                    <span
                      className={`text-[11px] font-medium ${
                        rejectionReason.trim()
                          .length >= 5
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {
                        rejectionReason.trim()
                          .length
                      }/5
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    processing ||
                    rejectionReason.trim()
                      .length < 5
                  }
                  onClick={() =>
                    setActionModal("reject")
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}

                  Reject Application
                </button>
              </div>
            </div>
          )}

          {/* =============================================
              APPROVED STUDENT
          ============================================= */}

          {isApproved && (
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>

              <h2 className="mt-4 font-semibold text-slate-900">
                Student Account
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                This applicant has been converted
                into a student.
              </p>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Matric Number
                </p>

                <p className="mt-1 font-mono text-base font-bold text-brand-navy">
                  {application.matricNumber ||
                    application.student
                      ?.matricNumber ||
                    "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          PREMIUM CONFIRMATION MODAL
      ================================================= */}

      <AnimatePresence>
        {actionModal && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (
                event.target ===
                  event.currentTarget &&
                !processing
              ) {
                closeActionModal();
              }
            }}
          >
            {/* Backdrop */}

            <motion.div
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="admission-action-title"
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 24,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 16,
              }}
              transition={{
                duration: 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-2xl"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              {/* Top accent */}

              <div
                className={`h-1.5 w-full ${
                  actionModal === "approve"
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />

              <div className="p-6 sm:p-7">
                {/* Header */}

                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                      actionModal ===
                      "approve"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {actionModal ===
                    "approve" ? (
                      <CheckCircle2 className="h-7 w-7" />
                    ) : (
                      <XCircle className="h-7 w-7" />
                    )}
                  </div>

                  <button
                    type="button"
                    aria-label="Close confirmation dialog"
                    disabled={processing}
                    onClick={
                      closeActionModal
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Heading */}

                <div className="mt-6">
                  <p
                    className={`text-[11px] font-bold uppercase tracking-[0.18em] ${
                      actionModal ===
                      "approve"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {actionModal ===
                    "approve"
                      ? "Admission Approval"
                      : "Admission Rejection"}
                  </p>

                  <h2
                    id="admission-action-title"
                    className="mt-2 text-2xl font-bold tracking-tight text-slate-950"
                  >
                    {actionModal ===
                    "approve"
                      ? "Approve this application?"
                      : "Reject this application?"}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {actionModal ===
                    "approve"
                      ? "Please review the applicant information below before confirming the admission decision."
                      : "Please confirm that you want to reject this application. The applicant will be notified of the decision."}
                  </p>
                </div>

                {/* Applicant Card */}

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white shadow-sm">
                      {getApplicantInitials(
                        application,
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {getApplicantName(
                          application,
                        )}
                      </p>

                      <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
                        {
                          application.applicationNumber
                        }
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 border-t border-slate-200 bg-white">
                    <div className="min-w-0 border-r border-slate-100 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Programme
                      </p>

                      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                        {getProgrammeName(
                          application.programme,
                        )}
                      </p>
                    </div>

                    <div className="min-w-0 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Status
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {
                          statusConfig[
                            application.status
                          ].label
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Approval Information */}

                {actionModal ===
                  "approve" && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mt-4 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-emerald-800">
                        What will happen?
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        A student account will be
                        created, a matric number will
                        be generated, and the applicant
                        will receive an approval
                        notification.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Rejection Reason */}

                {actionModal ===
                  "reject" && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />

                      <p className="text-[10px] font-bold uppercase tracking-wide text-red-600">
                        Rejection Reason
                      </p>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-red-800">
                      {rejectionReason.trim()}
                    </p>
                  </motion.div>
                )}

                {/* Warning */}

                <div className="mt-5 flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                  <p className="text-[11px] leading-5 text-slate-400">
                    This action changes the
                    application's status and will
                    become part of the admission
                    workflow.
                  </p>
                </div>

                {/* Buttons */}

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={
                      closeActionModal
                    }
                    className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={
                      actionModal ===
                      "approve"
                        ? approveApplication
                        : rejectApplication
                    }
                    className={`flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      actionModal ===
                      "approve"
                        ? "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700"
                        : "bg-red-600 shadow-red-600/20 hover:bg-red-700"
                    }`}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : actionModal ===
                      "approve" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm Approval
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Confirm Rejection
                      </>
                    )}
                  </button>
                </div>

                {/* Footer */}

                <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-medium text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" />

                  <span>
                    ITMT secure admission workflow
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/*
 * =========================================================
 * SECTION CARD
 * =========================================================
 */

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof User;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/*
 * =========================================================
 * DETAIL
 * =========================================================
 */

function Detail({
  label,
  value,
  capitalize = false,
  icon: Icon,
}: {
  label: string;
  value?: string;
  capitalize?: boolean;
  icon?: typeof Mail;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1.5 flex items-start gap-2">
        {Icon && (
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        )}

        <p
          className={`text-sm font-medium leading-6 text-slate-800 ${
            capitalize
              ? "capitalize"
              : ""
          }`}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * TIMELINE
 * =========================================================
 */

function TimelineItem({
  title,
  date,
  active,
  danger = false,
}: {
  title: string;
  date?: string;
  active: boolean;
  danger?: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      <div
        className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          active
            ? danger
              ? "bg-red-50 text-red-600"
              : "bg-brand-navy/5 text-brand-navy"
            : "bg-slate-100 text-slate-300"
        }`}
      >
        {active ? (
          danger ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )
        ) : (
          <Clock3 className="h-4 w-4" />
        )}
      </div>

      <div>
        <p
          className={`text-sm font-semibold ${
            active
              ? danger
                ? "text-red-700"
                : "text-slate-900"
              : "text-slate-400"
          }`}
        >
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {date
            ? formatDate(
                date,
                true,
              )
            : "Not yet"}
        </p>
      </div>
    </div>
  );
}