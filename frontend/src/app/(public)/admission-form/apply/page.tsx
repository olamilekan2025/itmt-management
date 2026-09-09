"use client";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { publicApiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Programme {
  _id: string;
  name: string;
  code: string;
}

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface AcademicSession {
  _id: string;
  name: string;
  isActive: boolean;
}

interface Referee {
  name: string;
  address: string;
  phone: string;
  relationship: string;
}

interface EducationRow {
  schoolAttended: string;
  certificate: string;
  dateObtained: string;
  grade: string;
}

/* =========================================================
   HELPERS
========================================================= */

const emptyReferee = (): Referee => ({
  name: "",
  address: "",
  phone: "",
  relationship: "",
});

const emptyEducationRow = (): EducationRow => ({
  schoolAttended: "",
  certificate: "",
  dateObtained: "",
  grade: "",
});

/* =========================================================
   SUPPORTING DOCUMENTS
========================================================= */

type DocumentKey =
  | "primarySchoolCertificate"
  | "secondarySchoolCertificate"
  | "birthCertificate"
  | "waecNecoResult"
  | "testimonial"
  | "stateOfOriginCertificate";

interface DocumentDefinition {
  key: DocumentKey;
  label: string;
  description: string;
}

const documentDefinitions: DocumentDefinition[] = [
  {
    key: "primarySchoolCertificate",
    label: "Primary School Certificate",
    description: "First School Leaving Certificate",
  },
  {
    key: "secondarySchoolCertificate",
    label: "Secondary School Certificate",
    description: "SSCE / WASSCE certificate",
  },
  {
    key: "birthCertificate",
    label: "Birth Certificate / Age Declaration",
    description: "Proof of date of birth",
  },
  {
    key: "waecNecoResult",
    label: "WAEC / NECO Result",
    description: "Result slip or statement of result",
  },
  {
    key: "testimonial",
    label: "Testimonial",
    description: "School testimonial or reference letter",
  },
  {
    key: "stateOfOriginCertificate",
    label: "State of Origin / Indigene Certificate",
    description:
      "Certificate of origin from your local government",
  },
];

const emptyDocuments = (): Record<
  DocumentKey,
  File | null
> => ({
  primarySchoolCertificate: null,
  secondarySchoolCertificate: null,
  birthCertificate: null,
  waecNecoResult: null,
  testimonial: null,
  stateOfOriginCertificate: null,
});

/* =========================================================
   STEPS
========================================================= */

const steps = [
  {
    number: 1,
    title: "Personal",
    description: "Basic information",
  },
  {
    number: 2,
    title: "Contact",
    description: "Contact details",
  },
  {
    number: 3,
    title: "Academic",
    description: "Programme details",
  },
  {
    number: 4,
    title: "Education",
    description: "Qualifications & documents",
  },
  {
    number: 5,
    title: "Referees",
    description: "Referee information",
  },
  {
    number: 6,
    title: "Declaration",
    description: "Review & submit",
  },
];

/* =========================================================
   API RESPONSE TYPES
========================================================= */

interface ProgrammesResponse {
  success: boolean;
  programmes?: Programme[];
}

interface DepartmentsResponse {
  success: boolean;
  departments?: Department[];
}

/*
 * IMPORTANT:
 *
 * The backend returns:
 *
 * {
 *   success: true,
 *   academicSessions: [...]
 * }
 *
 * NOT:
 *
 * {
 *   success: true,
 *   sessions: [...]
 * }
 */
interface SessionsResponse {
  success: boolean;
  academicSessions?: AcademicSession[];
}

/* =========================================================
   PAGE
========================================================= */

export default function ApplyForAdmissionPage() {
  /* -------------------------------------------------------
     STEP STATE
  ------------------------------------------------------- */

  const [currentStep, setCurrentStep] = useState(1);

  /* -------------------------------------------------------
     LOADING / SUBMISSION STATE
  ------------------------------------------------------- */

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* -------------------------------------------------------
     FEEDBACK STATE
  ------------------------------------------------------- */

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [applicationNumber, setApplicationNumber] =
    useState("");

  /* -------------------------------------------------------
     ACADEMIC OPTIONS
  ------------------------------------------------------- */

  const [programmes, setProgrammes] = useState<
    Programme[]
  >([]);

  const [departments, setDepartments] = useState<
    Department[]
  >([]);

  const [sessions, setSessions] = useState<
    AcademicSession[]
  >([]);

  /* -------------------------------------------------------
     FORM DATA
  ------------------------------------------------------- */

  const [formData, setFormData] = useState({
    surname: "",
    otherNames: "",
    email: "",
    telephone: "",
    dateOfBirth: "",
    nationality: "",
    postalAddress: "",
    residentialAddress: "",
    programmeId: "",
    departmentId: "",
    academicSessionId: "",
    medicalCondition: "",
    referredBy: "",
    applicantSignature: "",
  });

  /* -------------------------------------------------------
     REFEREES
  ------------------------------------------------------- */

  const [referees, setReferees] = useState<Referee[]>([
    emptyReferee(),
    emptyReferee(),
    emptyReferee(),
  ]);

  /* -------------------------------------------------------
     EDUCATION
  ------------------------------------------------------- */

  const [education, setEducation] = useState<
    EducationRow[]
  >([emptyEducationRow()]);

  /* -------------------------------------------------------
     DOCUMENTS
  ------------------------------------------------------- */

  const [documents, setDocuments] = useState<
    Record<DocumentKey, File | null>
  >(emptyDocuments());

  /* -------------------------------------------------------
     PASSPORT PHOTO
  ------------------------------------------------------- */

  const [passportPhoto, setPassportPhoto] =
    useState<File | null>(null);

  const [photoPreview, setPhotoPreview] =
    useState("");

  /* -------------------------------------------------------
     DECLARATION
  ------------------------------------------------------- */

  const [agreedToTerms, setAgreedToTerms] =
    useState(false);

  /* =========================================================
     LOAD PUBLIC APPLICATION DATA
  ========================================================= */

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError("");

      const [
        progResult,
        deptResult,
        sessResult,
      ] = await Promise.allSettled([
        publicApiGet<ProgrammesResponse>(
          "/api/programmes/public",
        ),

        publicApiGet<DepartmentsResponse>(
          "/api/departments/public",
        ),

        publicApiGet<SessionsResponse>(
          "/api/academic-sessions/public",
        ),
      ]);

      if (!isMounted) {
        return;
      }

      /* -----------------------------------------------------
         PROGRAMMES
      ----------------------------------------------------- */

      if (progResult.status === "fulfilled") {
        setProgrammes(
          Array.isArray(
            progResult.value.programmes,
          )
            ? progResult.value.programmes
            : [],
        );
      } else {
        console.error(
          "Failed to load programmes:",
          progResult.reason,
        );
      }

      /* -----------------------------------------------------
         DEPARTMENTS
      ----------------------------------------------------- */

      if (deptResult.status === "fulfilled") {
        setDepartments(
          Array.isArray(
            deptResult.value.departments,
          )
            ? deptResult.value.departments
            : [],
        );
      } else {
        console.error(
          "Failed to load departments:",
          deptResult.reason,
        );
      }

      /* -----------------------------------------------------
         ACTIVE ACADEMIC SESSIONS
      ----------------------------------------------------- */

      if (sessResult.status === "fulfilled") {
        /*
         * FIX:
         *
         * The backend response property is
         * "academicSessions".
         *
         * The old code incorrectly used:
         *
         * sessResult.value.sessions
         *
         * which always produced undefined.
         */

        const loadedSessions =
          Array.isArray(
            sessResult.value.academicSessions,
          )
            ? sessResult.value.academicSessions
            : [];

        /*
         * The public backend endpoint already returns
         * active academic sessions.
         *
         * We still filter by isActive here as an
         * additional frontend safety check.
         */

        const activeSessions =
          loadedSessions.filter(
            (session) => session.isActive,
          );

        setSessions(activeSessions);

        /*
         * Helpful debugging information while developing.
         * You will see the actual sessions in the browser
         * console.
         */
        console.log(
          "ITMT active academic sessions:",
          activeSessions,
        );
      } else {
        console.error(
          "Failed to load academic sessions:",
          sessResult.reason,
        );
      }

      /* -----------------------------------------------------
         CHECK IF ANY REQUEST FAILED
      ----------------------------------------------------- */

      const anyFailed = [
        progResult,
        deptResult,
        sessResult,
      ].some(
        (result) =>
          result.status === "rejected",
      );

      if (anyFailed) {
        setError(
          "Some application form data could not be loaded. Programme, department, or session options may be incomplete. Please refresh the page.",
        );
      }

      setIsLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     PASSPORT PREVIEW
  ========================================================= */

  /*
   * The preview URL is now generated whenever the selected
   * passport photo changes.
   *
   * This prevents stale object URLs and avoids manually
   * revoking the same URL from multiple places.
   */

  useEffect(() => {
    if (!passportPhoto) {
      setPhotoPreview("");
      return;
    }

    const previewUrl =
      URL.createObjectURL(passportPhoto);

    setPhotoPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [passportPhoto]);

  /* =========================================================
     GENERIC INPUT HANDLER
  ========================================================= */

  function handleInputChange(
    e: ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >,
  ) {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  /* =========================================================
     REFEREE HANDLER
  ========================================================= */

  function updateReferee(
    index: number,
    field: keyof Referee,
    value: string,
  ) {
    setReferees((previous) =>
      previous.map(
        (referee, refereeIndex) =>
          refereeIndex === index
            ? {
                ...referee,
                [field]: value,
              }
            : referee,
      ),
    );

    setError("");
  }

  /* =========================================================
     EDUCATION HANDLER
  ========================================================= */

  function updateEducationRow(
    index: number,
    field: keyof EducationRow,
    value: string,
  ) {
    setEducation((previous) =>
      previous.map(
        (row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                [field]: value,
              }
            : row,
      ),
    );

    setError("");
  }

  function addEducationRow() {
    setEducation((previous) => [
      ...previous,
      emptyEducationRow(),
    ]);
  }

  function removeEducationRow(index: number) {
    setEducation((previous) => {
      if (previous.length <= 1) {
        return previous;
      }

      return previous.filter(
        (_, rowIndex) =>
          rowIndex !== index,
      );
    });
  }

  /* =========================================================
     SUPPORTING DOCUMENT HANDLER
  ========================================================= */

  function handleDocumentChange(
    key: DocumentKey,
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload a PDF, JPG, PNG, or WEBP file.",
      );

      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Each document must not be larger than 5MB.",
      );

      e.target.value = "";
      return;
    }

    setDocuments((previous) => ({
      ...previous,
      [key]: file,
    }));

    setError("");
  }

  function removeDocument(
    key: DocumentKey,
  ) {
    setDocuments((previous) => ({
      ...previous,
      [key]: null,
    }));

    const input =
      document.getElementById(
        `doc-${key}`,
      ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }

    setError("");
  }

  /* =========================================================
     PASSPORT PHOTO HANDLER
  ========================================================= */

  function handlePhotoChange(
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload a JPG, PNG, or WEBP image.",
      );

      e.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Passport photograph must not be larger than 2MB.",
      );

      e.target.value = "";
      return;
    }

    /*
     * Only update the file here.
     *
     * The useEffect above creates and cleans up
     * the preview URL automatically.
     */

    setPassportPhoto(file);
    setError("");
  }

  function removePassportPhoto() {
    setPassportPhoto(null);
    setPhotoPreview("");

    const input =
      document.getElementById(
        "passportPhoto",
      ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }

    setError("");
  }

  /* =========================================================
     VALIDATE CURRENT STEP
  ========================================================= */

  function validateStep(
    step: number,
  ): boolean {
    setError("");

    /* -------------------------------------------------------
       STEP 1
    ------------------------------------------------------- */

    if (step === 1) {
      if (!passportPhoto) {
        setError(
          "Please upload your passport photograph.",
        );
        return false;
      }

      if (!formData.surname.trim()) {
        setError(
          "Please enter your surname.",
        );
        return false;
      }

      if (!formData.otherNames.trim()) {
        setError(
          "Please enter your other names.",
        );
        return false;
      }

      return true;
    }

    /* -------------------------------------------------------
       STEP 2
    ------------------------------------------------------- */

    if (step === 2) {
      if (!formData.email.trim()) {
        setError(
          "Please enter your email address.",
        );
        return false;
      }

      const emailIsValid =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          formData.email.trim(),
        );

      if (!emailIsValid) {
        setError(
          "Please enter a valid email address.",
        );
        return false;
      }

      return true;
    }

    /* -------------------------------------------------------
       STEP 3
    ------------------------------------------------------- */

    if (step === 3) {
      if (!formData.programmeId) {
        setError(
          "Please select your programme.",
        );
        return false;
      }

      if (!formData.academicSessionId) {
        setError(
          "Please select an academic session.",
        );
        return false;
      }

      return true;
    }

    /* -------------------------------------------------------
       STEP 4
    ------------------------------------------------------- */

    if (step === 4) {
      const hasEducation =
        education.some(
          (row) =>
            row.schoolAttended.trim() ||
            row.certificate.trim(),
        );

      if (!hasEducation) {
        setError(
          "Please provide at least one education or qualification record.",
        );
        return false;
      }

      return true;
    }

    /* -------------------------------------------------------
       STEP 5
    ------------------------------------------------------- */

    if (step === 5) {
      const filledReferees =
        referees.filter(
          (referee) =>
            referee.name.trim() ||
            referee.address.trim() ||
            referee.phone.trim() ||
            referee.relationship.trim(),
        );

      if (filledReferees.length === 0) {
        setError(
          "Please provide at least one referee.",
        );
        return false;
      }

      const hasGuardianOrSponsor =
        filledReferees.some(
          (referee) =>
            /guardian|sponsor/i.test(
              referee.relationship,
            ),
        );

      if (!hasGuardianOrSponsor) {
        setError(
          'At least one referee must have a relationship of "Guardian" or "Sponsor".',
        );
        return false;
      }

      return true;
    }

    /* -------------------------------------------------------
       STEP 6
    ------------------------------------------------------- */

    if (step === 6) {
      if (!agreedToTerms) {
        setError(
          "You must agree to the rules and regulations before submitting.",
        );
        return false;
      }

      if (
        !formData.applicantSignature.trim()
      ) {
        setError(
          "Please type your full name as your signature.",
        );
        return false;
      }

      return true;
    }

    return true;
  }

  /* =========================================================
     NEXT STEP
  ========================================================= */

  function handleNext() {
    if (!validateStep(currentStep)) {
      return;
    }

    setCurrentStep((previous) =>
      Math.min(
        previous + 1,
        steps.length,
      ),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     PREVIOUS STEP
  ========================================================= */

  function handleBack() {
    setError("");

    setCurrentStep((previous) =>
      Math.max(previous - 1, 1),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     SUBMIT APPLICATION
  ========================================================= */

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateStep(6)) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      /*
       * NEXT_PUBLIC_API_URL should be:
       *
       * http://localhost:5000
       *
       * OR:
       *
       * https://itmt-management-api.onrender.com
       *
       * Do NOT add /api here.
       */

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL?.trim();

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured.",
        );
      }

      const normalizedApiUrl =
        API_URL.replace(/\/+$/, "");

      const body = new FormData();

      /* -----------------------------------------------------
         BASIC FORM DATA
      ----------------------------------------------------- */

      Object.entries(formData).forEach(
        ([key, value]) => {
          const trimmedValue =
            typeof value === "string"
              ? value.trim()
              : value;

          if (trimmedValue) {
            body.append(
              key,
              trimmedValue,
            );
          }
        },
      );

      /* -----------------------------------------------------
         REFEREES
      ----------------------------------------------------- */

      const filledReferees =
        referees.filter(
          (referee) =>
            referee.name.trim() ||
            referee.address.trim() ||
            referee.phone.trim() ||
            referee.relationship.trim(),
        );

      body.append(
        "referees",
        JSON.stringify(
          filledReferees,
        ),
      );

      /* -----------------------------------------------------
         EDUCATION
      ----------------------------------------------------- */

      const filledEducation =
        education.filter(
          (row) =>
            row.schoolAttended.trim() ||
            row.certificate.trim() ||
            row.dateObtained.trim() ||
            row.grade.trim(),
        );

      body.append(
        "educationRecords",
        JSON.stringify(
          filledEducation,
        ),
      );

      /* -----------------------------------------------------
         PASSPORT PHOTO
      ----------------------------------------------------- */

      if (passportPhoto) {
        body.append(
          "passportPhoto",
          passportPhoto,
        );
      }

      /* -----------------------------------------------------
         SUPPORTING DOCUMENTS
      ----------------------------------------------------- */

      Object.entries(
        documents,
      ).forEach(
        ([key, file]) => {
          if (file) {
            body.append(
              key,
              file,
            );
          }
        },
      );

      /* -----------------------------------------------------
         SEND REQUEST
      ----------------------------------------------------- */

      const response =
        await fetch(
          `${normalizedApiUrl}/api/admissions/apply`,
          {
            method: "POST",
            body,
          },
        );

      /* -----------------------------------------------------
         SAFE RESPONSE PARSING
      ----------------------------------------------------- */

      let data: {
        success?: boolean;
        message?: string;
        data?: {
          applicationNumber?: string;
        };
      } = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      /* -----------------------------------------------------
         BACKEND ERROR
      ----------------------------------------------------- */

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to submit application. Please try again.",
        );

        return;
      }

      /* -----------------------------------------------------
         APPLICATION NUMBER
      ----------------------------------------------------- */

      const generatedApplicationNumber =
        data.data?.applicationNumber;

      if (!generatedApplicationNumber) {
        console.error(
          "Application submitted but no application number was returned:",
          data,
        );

        setError(
          "Your application may have been submitted, but the application number was not returned. Please contact the institute.",
        );

        return;
      }

      setApplicationNumber(
        generatedApplicationNumber,
      );

      setSuccess(true);
    } catch (submitError) {
      console.error(
        "Application submission error:",
        submitError,
      );

      if (
        submitError instanceof Error &&
        submitError.message ===
          "NEXT_PUBLIC_API_URL is not configured."
      ) {
        setError(
          "The application service is not configured correctly. Please contact the administrator.",
        );
      } else {
        setError(
          "Unable to submit application. Please check your internet connection and try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  /* =========================================================
     SUCCESS SCREEN
  ========================================================= */

  if (success) {
    return (
      <main className="min-h-screen bg-brand-light px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="h-1.5 bg-brand-gold" />

            <div className="p-8 text-center md:p-10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="text-2xl font-bold text-green-600">
                  ✓
                </span>
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                ITMT Admissions
              </p>

              <h1 className="font-serif text-3xl font-bold text-brand-navy md:text-4xl">
                Application Submitted
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-600 md:text-base">
                Your admission application has been
                submitted successfully and is now
                pending review by the institute.
              </p>

              <div className="mt-8 rounded-2xl border border-brand-gold/20 bg-brand-light p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Application Number
                </p>

                <p className="mt-3 break-all text-2xl font-bold tracking-wide text-brand-navy md:text-3xl">
                  {applicationNumber}
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left">
                <p className="text-sm font-medium text-brand-navy">
                  Important
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Please keep your application number
                  safe. You may need it when checking
                  your admission status or communicating
                  with the institute.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl bg-brand-navy px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-dark"
                >
                  Return to Home
                </Link>

                <Link
                  href="/admissions"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  Admission Information
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     STEP INDICATOR
  ========================================================= */

  function renderStepIndicator() {
    return (
      <div className="mb-8">
        {/* Desktop */}
        <div className="hidden items-center justify-between md:flex">
          {steps.map(
            (
              step,
              index,
            ) => {
              const isActive =
                currentStep ===
                step.number;

              const isCompleted =
                currentStep >
                step.number;

              return (
                <div
                  key={step.number}
                  className="flex flex-1 items-center"
                >
                  <div className="flex min-w-[72px] flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
                        isActive
                          ? "border-brand-navy bg-brand-navy text-white shadow-md"
                          : isCompleted
                            ? "border-brand-gold bg-brand-gold text-brand-navy"
                            : "border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {isCompleted
                        ? "✓"
                        : step.number}
                    </div>

                    <p
                      className={`mt-2 text-xs font-semibold ${
                        isActive ||
                        isCompleted
                          ? "text-brand-navy"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </p>

                    <p className="hidden text-center text-[11px] text-slate-400 lg:block">
                      {step.description}
                    </p>
                  </div>

                  {index <
                    steps.length -
                      1 && (
                    <div
                      className={`mx-3 mt-[-20px] h-0.5 flex-1 ${
                        currentStep >
                        step.number
                          ? "bg-brand-gold"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            },
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-navy">
              Step {currentStep} of{" "}
              {steps.length}
            </span>

            <span className="text-sm font-medium text-slate-500">
              {
                steps[
                  currentStep -
                    1
                ].title
              }
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand-navy transition-all duration-300"
              style={{
                width: `${
                  (currentStep /
                    steps.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     SECTION HEADING
  ========================================================= */

  function renderSectionHeading(
    title: string,
    description?: string,
  ) {
    return (
      <div className="mb-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-brand-navy">
          <span className="h-2 w-2 rounded-full bg-brand-gold" />

          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
    );
  }

  /* =========================================================
     STEP 1 — PERSONAL
  ========================================================= */

  function renderPersonalStep() {
    return (
      <section>
        {renderSectionHeading(
          "Personal Information",
          "Provide your basic personal information and passport photograph.",
        )}

        {/* Passport Photograph */}
        <section className="mb-8">
          <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-navy">
            Passport Photograph{" "}
            <span className="text-red-500">
              *
            </span>
          </h3>

          <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:flex-row sm:items-start">
            <div>
              <label
                htmlFor="passportPhoto"
                className="group relative flex h-40 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white transition-all hover:border-brand-navy hover:shadow-md"
              >
                {photoPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="Passport preview"
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-brand-navy">
                        Change Photo
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center px-3 text-center">
                    <svg
                      className="mb-2 h-8 w-8 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0A3.75 3.75 0 0115.75 6z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 20.25a8.25 8.25 0 0115 0"
                      />
                    </svg>

                    <span className="text-xs font-medium text-slate-500">
                      Click to upload
                    </span>

                    <span className="mt-1 text-[10px] text-slate-400">
                      Passport Photo
                    </span>
                  </div>
                )}
              </label>

              <input
                id="passportPhoto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handlePhotoChange
                }
                className="sr-only"
              />

              {photoPreview && (
                <button
                  type="button"
                  onClick={
                    removePassportPhoto
                  }
                  className="mt-2 w-32 text-xs font-medium text-red-500 transition-colors hover:text-red-700"
                >
                  Remove photo
                </button>
              )}
            </div>

            <div className="pt-1">
              <p className="text-sm font-semibold text-slate-700">
                Upload your passport photograph
              </p>

              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                Upload a clear, recent passport-style
                photograph. The selected image will
                appear in the preview immediately.
              </p>

              <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                <p>
                  • Accepted: JPG, JPEG, PNG,
                  WEBP
                </p>

                <p>
                  • Maximum file size: 2MB
                </p>

                <p>
                  • Use a clear passport-style
                  photograph
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Surname{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              name="surname"
              value={
                formData.surname
              }
              onChange={
                handleInputChange
              }
              placeholder="Enter surname"
              autoComplete="family-name"
              className="form-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Other Names{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              name="otherNames"
              value={
                formData.otherNames
              }
              onChange={
                handleInputChange
              }
              placeholder="First and middle names"
              autoComplete="given-name"
              className="form-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nationality
            </label>

            <input
              type="text"
              name="nationality"
              value={
                formData.nationality
              }
              onChange={
                handleInputChange
              }
              placeholder="e.g. Nigerian"
              autoComplete="country-name"
              className="form-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Date of Birth
            </label>

            <input
              type="date"
              name="dateOfBirth"
              value={
                formData.dateOfBirth
              }
              onChange={
                handleInputChange
              }
              className="form-input"
            />
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     STEP 2 — CONTACT
  ========================================================= */

  function renderContactStep() {
    return (
      <section>
        {renderSectionHeading(
          "Contact Information",
          "Tell us how the institute can contact you.",
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={
                handleInputChange
              }
              placeholder="you@example.com"
              autoComplete="email"
              className="form-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Telephone Number
            </label>

            <input
              type="tel"
              name="telephone"
              value={
                formData.telephone
              }
              onChange={
                handleInputChange
              }
              placeholder="08012345678"
              autoComplete="tel"
              className="form-input"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Postal Address
          </label>

          <textarea
            name="postalAddress"
            value={
              formData.postalAddress
            }
            onChange={
              handleInputChange
            }
            rows={3}
            placeholder="Enter your postal address"
            className="form-input resize-none"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Residential Address
          </label>

          <textarea
            name="residentialAddress"
            value={
              formData.residentialAddress
            }
            onChange={
              handleInputChange
            }
            rows={3}
            placeholder="Enter your residential address"
            className="form-input resize-none"
          />
        </div>
      </section>
    );
  }

  /* =========================================================
     STEP 3 — ACADEMIC
  ========================================================= */

  function renderAcademicStep() {
    return (
      <section>
        {renderSectionHeading(
          "Academic Information",
          "Select the programme and academic session you are applying for.",
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Programme{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              name="programmeId"
              value={
                formData.programmeId
              }
              onChange={
                handleInputChange
              }
              disabled={
                programmes.length ===
                0
              }
              className="form-input disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {programmes.length ===
                0
                  ? "No programmes available"
                  : "Select a programme"}
              </option>

              {programmes.map(
                (programme) => (
                  <option
                    key={
                      programme._id
                    }
                    value={
                      programme._id
                    }
                  >
                    {programme.name} (
                    {
                      programme.code
                    }
                    )
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Department
            </label>

            <select
              name="departmentId"
              value={
                formData.departmentId
              }
              onChange={
                handleInputChange
              }
              disabled={
                departments.length ===
                0
              }
              className="form-input disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {departments.length ===
                0
                  ? "No departments available"
                  : "Select a department"}
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={
                      department._id
                    }
                    value={
                      department._id
                    }
                  >
                    {department.name} (
                    {
                      department.code
                    }
                    )
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Academic Session{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              name="academicSessionId"
              value={
                formData.academicSessionId
              }
              onChange={
                handleInputChange
              }
              disabled={
                sessions.length === 0
              }
              className="form-input disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {sessions.length ===
                0
                  ? "No active sessions available"
                  : "Select academic session"}
              </option>

              {sessions.map(
                (session) => (
                  <option
                    key={
                      session._id
                    }
                    value={
                      session._id
                    }
                  >
                    {session.name}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-brand-gold/20 bg-brand-light p-5">
          <p className="text-sm font-semibold text-brand-navy">
            Application Information
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Select the programme you wish to study
            and the active academic session for your
            application.
          </p>
        </div>
      </section>
    );
  }

  /* =========================================================
     DOCUMENT UPLOAD ROW
  ========================================================= */

  function renderDocumentUploadRow(
    definition: DocumentDefinition,
  ) {
    const file =
      documents[
        definition.key
      ];

    const inputId =
      `doc-${definition.key}`;

    return (
      <div
        key={definition.key}
        className="rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm"
      >
        <p className="text-sm font-semibold text-brand-navy">
          {definition.label}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {definition.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-brand-navy hover:bg-slate-100"
          >
            {file
              ? "Change file"
              : "Choose file"}
          </label>

          <input
            id={inputId}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={(event) =>
              handleDocumentChange(
                definition.key,
                event,
              )
            }
            className="sr-only"
          />

          {file ? (
            <div className="flex min-w-0 items-center gap-2 text-xs text-slate-600">
              <span className="max-w-[160px] truncate">
                {file.name}
              </span>

              <button
                type="button"
                onClick={() =>
                  removeDocument(
                    definition.key,
                  )
                }
                className="font-semibold text-red-500 transition-colors hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              No file selected
            </span>
          )}
        </div>
      </div>
    );
  }

  /* =========================================================
     STEP 4 — EDUCATION
  ========================================================= */

  function renderEducationStep() {
    return (
      <section>
        {renderSectionHeading(
          "Education / Professional Attachments",
          "Enter your previous educational qualifications and upload your supporting documents.",
        )}

        <div className="space-y-4">
          {education.map(
            (
              row,
              index,
            ) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-brand-navy">
                    Qualification{" "}
                    {index + 1}
                  </p>

                  {education.length >
                    1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeEducationRow(
                          index,
                        )
                      }
                      className="text-sm font-semibold text-red-500 transition-colors hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    placeholder="School attended"
                    value={
                      row.schoolAttended
                    }
                    onChange={(event) =>
                      updateEducationRow(
                        index,
                        "schoolAttended",
                        event.target
                          .value,
                      )
                    }
                    className="form-input"
                  />

                  <input
                    placeholder="Certificate obtained"
                    value={
                      row.certificate
                    }
                    onChange={(event) =>
                      updateEducationRow(
                        index,
                        "certificate",
                        event.target
                          .value,
                      )
                    }
                    className="form-input"
                  />

                  <input
                    placeholder="Date obtained"
                    value={
                      row.dateObtained
                    }
                    onChange={(event) =>
                      updateEducationRow(
                        index,
                        "dateObtained",
                        event.target
                          .value,
                      )
                    }
                    className="form-input"
                  />

                  <input
                    placeholder="Grade"
                    value={
                      row.grade
                    }
                    onChange={(event) =>
                      updateEducationRow(
                        index,
                        "grade",
                        event.target
                          .value,
                      )
                    }
                    className="form-input"
                  />
                </div>
              </div>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={addEducationRow}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-navy transition-colors hover:text-brand-blue"
        >
          <span className="text-lg leading-none">
            +
          </span>

          Add another qualification
        </button>

        {/* Supporting Documents */}
        <div className="mt-10">
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-brand-navy">
            Supporting Documents
          </h3>

          <p className="mb-5 text-xs leading-5 text-slate-500">
            Upload clear scans or photos of the
            following documents. Accepted formats:
            PDF, JPG, PNG, WEBP. Maximum 5MB per
            document.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {documentDefinitions.map(
              renderDocumentUploadRow,
            )}
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     STEP 5 — REFEREES
  ========================================================= */

  function renderRefereesStep() {
    return (
      <section>
        {renderSectionHeading(
          "Referees",
          "Provide the names, addresses and contact details of your referees.",
        )}

        <div className="mb-6 rounded-2xl border border-brand-gold/20 bg-brand-light p-5">
          <p className="text-sm leading-6 text-slate-600">
            At least one referee must be a{" "}
            <strong className="text-brand-navy">
              Guardian
            </strong>{" "}
            or{" "}
            <strong className="text-brand-navy">
              Sponsor
            </strong>
            .
          </p>
        </div>

        <div className="space-y-5">
          {referees.map(
            (
              referee,
              index,
            ) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <p className="mb-4 text-sm font-semibold text-brand-navy">
                  Referee{" "}
                  {index + 1}
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    placeholder="Full name"
                    value={
                      referee.name
                    }
                    onChange={(event) =>
                      updateReferee(
                        index,
                        "name",
                        event.target
                          .value,
                      )
                    }
                    className="form-input"
                  />

                  <input
                    placeholder="Relationship e.g. Guardian"
                    value={
                      referee.relationship
                    }
                    onChange={(event) =>
                      updateReferee(
                        index,
                        "relationship",
                        event.target
                          .value,
                      )
                    }
                    className="form-input"
                  />

                  <input
                    placeholder="Address"
                    value={
                      referee.address
                    }
                    onChange={(event) =>
                      updateReferee(
                        index,
                        "address",
                        event.target
                          .value,
                      )
                    }
                    className="form-input"
                  />

                  <input
                    placeholder="Phone number"
                    value={
                      referee.phone
                    }
                    onChange={(event) =>
                      updateReferee(
                        index,
                        "phone",
                        event.target
                          .value,
                      )
                    }
                    className="form-input"
                  />
                </div>
              </div>
            ),
          )}
        </div>
      </section>
    );
  }

  /* =========================================================
     STEP 6 — DECLARATION
  ========================================================= */

  function renderDeclarationStep() {
    const uploadedDocumentCount =
      Object.values(
        documents,
      ).filter(Boolean).length;

    const educationCount =
      education.filter(
        (row) =>
          row.schoolAttended.trim() ||
          row.certificate.trim(),
      ).length;

    const refereeCount =
      referees.filter(
        (referee) =>
          referee.name.trim() ||
          referee.phone.trim(),
      ).length;

    const selectedProgramme =
      programmes.find(
        (programme) =>
          programme._id ===
          formData.programmeId,
      );

    const selectedSession =
      sessions.find(
        (session) =>
          session._id ===
          formData.academicSessionId,
      );

    return (
      <section>
        {renderSectionHeading(
          "Declaration & Submission",
          "Review the declaration carefully before submitting your application.",
        )}

        {/* Declaration */}
        <div className="rounded-2xl border border-slate-200 bg-brand-light p-5">
          <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
            <input
              type="checkbox"
              checked={
                agreedToTerms
              }
              onChange={(event) =>
                setAgreedToTerms(
                  event.target
                    .checked,
                )
              }
              className="mt-1 h-4 w-4 shrink-0 accent-brand-navy"
            />

            <span>
              I have decided to study with this institute
              and I am prepared to abide by the rules and
              regulations of the institute. I also am aware
              that full or part payment is not refundable
              even on voluntary withdrawal. I certify that
              the particulars contained in this application
              are true and that I am prepared to verify them
              if required.
            </span>
          </label>
        </div>

        {/* Signature */}
        <div className="mt-7">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Signature — type your full name{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            type="text"
            name="applicantSignature"
            value={
              formData.applicantSignature
            }
            onChange={
              handleInputChange
            }
            placeholder="Type your full name to sign"
            autoComplete="name"
            className="form-input italic"
          />

          <p className="mt-2 text-xs text-slate-500">
            Your typed full name will serve as your
            electronic signature.
          </p>
        </div>

        {/* Application Summary */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-brand-navy">
            Application Summary
          </h3>

          <div className="grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Applicant
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {formData.surname}{" "}
                {formData.otherNames}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-1 break-all font-medium text-slate-700">
                {formData.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Programme
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {selectedProgramme
                  ? `${selectedProgramme.name} (${selectedProgramme.code})`
                  : "Not selected"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Academic Session
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {selectedSession?.name ||
                  "Not selected"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Education Records
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {educationCount}{" "}
                record
                {educationCount ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Referees
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {refereeCount}{" "}
                referee
                {refereeCount ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Documents
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {uploadedDocumentCount}{" "}
                of{" "}
                {
                  documentDefinitions.length
                }{" "}
                uploaded
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     CURRENT STEP
  ========================================================= */

  function renderCurrentStep() {
    switch (currentStep) {
      case 1:
        return renderPersonalStep();

      case 2:
        return renderContactStep();

      case 3:
        return renderAcademicStep();

      case 4:
        return renderEducationStep();

      case 5:
        return renderRefereesStep();

      case 6:
        return renderDeclarationStep();

      default:
        return null;
    }
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-brand-light px-4 py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        {/* ---------------------------------------------------
            HEADER
        --------------------------------------------------- */}

        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            ITMT Management System
          </p>

          <h1 className="font-serif text-3xl font-bold text-brand-navy md:text-4xl">
            Apply for Admission
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Complete your admission application step by
            step. Your information will be submitted
            securely for review.
          </p>
        </div>

        {/* ---------------------------------------------------
            LOADING
        --------------------------------------------------- */}

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl bg-white shadow-xl">
            <div className="text-center">
              <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-brand-navy" />

              <p className="text-sm font-medium text-slate-600">
                Loading application form...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Preparing programmes, departments
                and academic sessions
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* -------------------------------------------------
                PROGRESS
            ------------------------------------------------- */}

            {renderStepIndicator()}

            {/* -------------------------------------------------
                FORM
            ------------------------------------------------- */}

            <form
              onSubmit={
                handleSubmit
              }
              className="overflow-hidden rounded-3xl bg-white shadow-xl"
            >
              {/* Top accent */}
              <div className="h-1 bg-brand-gold" />

              <div className="p-6 md:p-10">
                {/* ------------------------------------------------
                    ERROR
                ------------------------------------------------ */}

                {error && (
                  <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
                      !
                    </span>

                    <p className="leading-6">
                      {error}
                    </p>
                  </div>
                )}

                {/* ------------------------------------------------
                    STEP CONTENT
                ------------------------------------------------ */}

                <div className="min-h-[420px]">
                  {renderCurrentStep()}
                </div>

                {/* ------------------------------------------------
                    NAVIGATION
                ------------------------------------------------ */}

                <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {currentStep ===
                    1 ? (
                      <Link
                        href="/admissions"
                        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 sm:w-auto"
                      >
                        Cancel
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={
                          handleBack
                        }
                        disabled={
                          isSubmitting
                        }
                        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        ← Back
                      </button>
                    )}
                  </div>

                  <div>
                    {currentStep <
                    steps.length ? (
                      <button
                        type="button"
                        onClick={
                          handleNext
                        }
                        disabled={
                          isSubmitting
                        }
                        className="inline-flex w-full items-center justify-center rounded-xl bg-brand-navy px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        Continue →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={
                          isSubmitting
                        }
                        className="inline-flex w-full items-center justify-center rounded-xl bg-brand-navy px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                            Submitting
                            Application...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* ------------------------------------------------
                    PROGRESS TEXT
                ------------------------------------------------ */}

                <div className="mt-5 text-center">
                  <p className="text-xs text-slate-400">
                    Step{" "}
                    {currentStep}{" "}
                    of{" "}
                    {steps.length}
                  </p>
                </div>
              </div>
            </form>
          </>
        )}
      </div>

      {/* =======================================================
          FORM INPUT STYLING
      ======================================================= */}

      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          line-height: 1.5;
          color: rgb(15 23 42);
          outline: none;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease,
            background-color 150ms ease;
          background: white;
        }

        :global(.form-input:hover) {
          border-color: rgb(203 213 225);
        }

        :global(.form-input:focus) {
          border-color: var(
            --brand-navy,
            #0f172a
          );
          box-shadow:
            0 0 0 3px
            rgba(15, 23, 42, 0.08);
        }

        :global(.form-input::placeholder) {
          color: rgb(148 163 184);
        }

        :global(.form-input:disabled) {
          cursor: not-allowed;
          background: rgb(
            248 250 252
          );
        }

        :global(.form-input[type="date"]) {
          color-scheme: light;
        }
      `}</style>
    </main>
  );
}

