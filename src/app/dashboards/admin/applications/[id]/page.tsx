"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
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

type Admission = {
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

  programme?: Programme | null;
  department?: Department | null;
  academicSession?: AcademicSession | null;

  previousInstitution?: string;
  previousQualification?: string;

  referees: Referee[];
  educationHistory: EducationHistory[];

  passportPhotoUrl?: string;

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
 * STATUS
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
    admission.firstName,
    admission.middleName,
    admission.lastName,
  ]
    .filter(Boolean)
    .join(" ");
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

        setApplication(
          response.data,
        );

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

      const confirmed =
        window.confirm(
          `Approve ${getApplicantName(application)}'s application?\n\nA student account will be created and a matric number will be generated.`,
        );

      if (!confirmed) return;

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
        return;
      }

      const confirmed =
        window.confirm(
          `Reject ${getApplicantName(application)}'s application?`,
        );

      if (!confirmed) return;

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
            className="mt-5 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white"
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
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold backdrop-blur-sm">
              {application.firstName?.[0]}
              {application.lastName?.[0]}
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
                label="First Name"
                value={
                  application.firstName
                }
              />

              <Detail
                label="Last Name"
                value={
                  application.lastName
                }
              />

              <Detail
                label="Middle Name"
                value={
                  application.middleName
                }
              />

              <Detail
                label="Gender"
                value={
                  application.gender
                }
                capitalize
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
                label="Phone"
                value={
                  application.phone
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
            description="Programme and previous academic background"
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
                label="Previous Institution"
                value={
                  application.previousInstitution
                }
              />

              <Detail
                label="Previous Qualification"
                value={
                  application.previousQualification
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
                      key={index}
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
                      key={index}
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
              <h2 className="font-semibold text-slate-900">
                Passport Photograph
              </h2>
            </div>

            <div className="flex justify-center bg-slate-50 p-6">
              {application.passportPhotoUrl ? (
                <img
                  src={
                    application.passportPhotoUrl
                  }
                  alt={getApplicantName(
                    application,
                  )}
                  className="h-64 w-48 rounded-xl object-cover shadow-md"
                />
              ) : (
                <div className="flex h-64 w-48 items-center justify-center rounded-xl bg-slate-100 text-center">
                  <div>
                    <User className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-2 text-xs text-slate-400">
                      No passport photo
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
                  onClick={
                    approveApplication
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
                </div>

                <button
                  type="button"
                  disabled={
                    processing ||
                    rejectionReason.trim()
                      .length < 5
                  }
                  onClick={
                    rejectApplication
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

