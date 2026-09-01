"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    description: "Qualifications",
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

export default function ApplyForAdmissionPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState("");

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);

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

  const [referees, setReferees] = useState<Referee[]>([
    emptyReferee(),
    emptyReferee(),
    emptyReferee(),
  ]);

  const [education, setEducation] = useState<EducationRow[]>([
    emptyEducationRow(),
  ]);

  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  /*
   * Load programmes, departments and active sessions
   */
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      try {
        const [progRes, deptRes, sessRes] = await Promise.all([
          fetch(`${API_URL}/programmes`),
          fetch(`${API_URL}/departments`),
          fetch(`${API_URL}/academic-sessions`),
        ]);

        if (progRes.ok) {
          const data = await progRes.json();
          setProgrammes(data.programmes || []);
        }

        if (deptRes.ok) {
          const data = await deptRes.json();
          setDepartments(data.departments || []);
        }

        if (sessRes.ok) {
          const data = await sessRes.json();

          setSessions(
            (data.sessions || []).filter(
              (session: AcademicSession) => session.isActive
            )
          );
        }
      } catch (error) {
        console.error("Failed to load admission data:", error);
        setError("Unable to load admission form data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  /*
   * Generic input handler
   */
  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  }

  /*
   * Referee
   */
  function updateReferee(
    index: number,
    field: keyof Referee,
    value: string
  ) {
    setReferees((prev) =>
      prev.map((referee, i) =>
        i === index
          ? {
              ...referee,
              [field]: value,
            }
          : referee
      )
    );

    setError("");
  }

  /*
   * Education
   */
  function updateEducationRow(
    index: number,
    field: keyof EducationRow,
    value: string
  ) {
    setEducation((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );

    setError("");
  }

  function addEducationRow() {
    setEducation((prev) => [...prev, emptyEducationRow()]);
  }

  function removeEducationRow(index: number) {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  }

  /*
   * Passport photo
   */
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];

  if (!file) return;

  // Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    setError("Please upload a JPG, PNG, or WEBP image.");
    e.target.value = "";
    return;
  }

  // Validate file size - 2MB
  const maxSize = 2 * 1024 * 1024;

  if (file.size > maxSize) {
    setError("Passport photograph must not be larger than 2MB.");
    e.target.value = "";
    return;
  }

  setError("");
  setPassportPhoto(file);

  // Create preview
  const previewUrl = URL.createObjectURL(file);
  setPhotoPreview(previewUrl);
}

  /*
   * Validate current step
   */
  function validateStep(step: number): boolean {
    setError("");

    if (step === 1) {
      if (!passportPhoto) {
        setError("Please upload your passport photograph.");
        return false;
      }

      if (!formData.surname.trim()) {
        setError("Please enter your surname.");
        return false;
      }

      if (!formData.otherNames.trim()) {
        setError("Please enter your other names.");
        return false;
      }

      return true;
    }

    if (step === 2) {
      if (!formData.email.trim()) {
        setError("Please enter your email address.");
        return false;
      }

      const emailIsValid =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

      if (!emailIsValid) {
        setError("Please enter a valid email address.");
        return false;
      }

      return true;
    }

    if (step === 3) {
      if (!formData.programmeId) {
        setError("Please select your programme.");
        return false;
      }

      if (!formData.academicSessionId) {
        setError("Please select an academic session.");
        return false;
      }

      return true;
    }

    if (step === 4) {
      const hasEducation = education.some(
        (row) =>
          row.schoolAttended.trim() ||
          row.certificate.trim()
      );

      if (!hasEducation) {
        setError(
          "Please provide at least one education or qualification record."
        );
        return false;
      }

      return true;
    }

    if (step === 5) {
      const filledReferees = referees.filter(
        (referee) =>
          referee.name.trim() ||
          referee.address.trim() ||
          referee.phone.trim() ||
          referee.relationship.trim()
      );

      if (filledReferees.length === 0) {
        setError("Please provide at least one referee.");
        return false;
      }

      const hasGuardianOrSponsor = filledReferees.some((referee) =>
        /guardian|sponsor/i.test(referee.relationship)
      );

      if (!hasGuardianOrSponsor) {
        setError(
          'At least one referee must have a relationship of "Guardian" or "Sponsor".'
        );
        return false;
      }

      return true;
    }

    if (step === 6) {
      if (!agreedToTerms) {
        setError(
          "You must agree to the rules and regulations before submitting."
        );
        return false;
      }

      if (!formData.applicantSignature.trim()) {
        setError("Please type your full name as your signature.");
        return false;
      }

      return true;
    }

    return true;
  }

  /*
   * Continue to next step
   */
  function handleNext() {
    if (!validateStep(currentStep)) {
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * Go back
   */
  function handleBack() {
    setError("");

    setCurrentStep((prev) => Math.max(prev - 1, 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * Submit application
   */
  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!validateStep(6)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const body = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          body.append(key, value);
        }
      });

      const filledReferees = referees.filter(
        (referee) =>
          referee.name.trim() ||
          referee.address.trim() ||
          referee.phone.trim() ||
          referee.relationship.trim()
      );

      const filledEducation = education.filter(
        (row) =>
          row.schoolAttended.trim() ||
          row.certificate.trim() ||
          row.dateObtained.trim() ||
          row.grade.trim()
      );

      body.append(
        "referees",
        JSON.stringify(filledReferees)
      );

      body.append(
        "educationRecords",
        JSON.stringify(filledEducation)
      );

      if (passportPhoto) {
        body.append("passportPhoto", passportPhoto);
      }

      const response = await fetch(
        `${API_URL}/admissions/apply`,
        {
          method: "POST",
          body,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to submit application."
        );
        return;
      }

      setApplicationNumber(
        data.data.applicationNumber
      );

      setSuccess(true);
    } catch (error) {
      console.error("Application submission error:", error);

      setError(
        "Unable to submit application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * Success screen
   */
  if (success) {
    return (
      <main className="min-h-screen bg-brand-light px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl md:p-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl text-green-600">
                ✓
              </span>
            </div>

            <h1 className="mb-4 font-serif text-3xl font-bold text-brand-navy">
              Application Submitted Successfully
            </h1>

            <p className="mb-6 text-slate-600">
              Your admission application has been submitted
              and is now pending review.
            </p>

            <div className="mb-8 rounded-xl bg-brand-light p-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Application Number
              </p>

              <p className="mt-2 text-2xl font-bold text-brand-navy">
                {applicationNumber}
              </p>
            </div>

            <p className="mb-8 text-sm text-slate-500">
              Please keep your application number for future
              reference.
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-brand-navy px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Step indicator
   */
  function renderStepIndicator() {
    return (
      <div className="mb-8">
        <div className="hidden items-center justify-between md:flex">
          {steps.map((step, index) => {
            const isActive = currentStep === step.number;
            const isCompleted =
              currentStep > step.number;

            return (
              <div
                key={step.number}
                className="flex flex-1 items-center"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
                      isActive
                        ? "border-brand-navy bg-brand-navy text-white"
                        : isCompleted
                        ? "border-brand-gold bg-brand-gold text-brand-navy"
                        : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {isCompleted ? "✓" : step.number}
                  </div>

                  <p
                    className={`mt-2 text-xs font-semibold ${
                      isActive
                        ? "text-brand-navy"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </p>

                  <p className="hidden text-[11px] text-slate-400 lg:block">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`mx-3 mt-[-20px] h-0.5 flex-1 ${
                      currentStep > step.number
                        ? "bg-brand-gold"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile indicator */}
        <div className="md:hidden">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-navy">
              Step {currentStep} of {steps.length}
            </span>

            <span className="text-sm text-slate-500">
              {steps[currentStep - 1].title}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand-navy transition-all duration-300"
              style={{
                width: `${
                  (currentStep / steps.length) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  /*
   * Step heading
   */
  function renderSectionHeading(
    title: string,
    description?: string
  ) {
    return (
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-brand-navy">
          <span className="h-2 w-2 rounded-full bg-brand-gold" />
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>
    );
  }

  /*
   * STEP 1
   */
  function renderPersonalStep() {
    return (
      <section>
        {renderSectionHeading(
          "Personal Information",
          "Provide your basic personal information and passport photograph."
        )}

       {/* Passport Photograph */}
<section>
  <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-brand-navy">
    <span className="h-2 w-2 rounded-full bg-brand-gold" />
    Passport Photograph <span className="text-red-500">*</span>
  </h2>

  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
    {/* Clickable Passport Preview */}
    <div>
      <label
        htmlFor="passportPhoto"
        className="group relative flex h-40 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all hover:border-brand-navy hover:bg-slate-100"
      >
        {photoPreview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt="Passport preview"
              className="h-full w-full object-cover"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-brand-navy">
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

      {/* Hidden file input */}
      <input
        id="passportPhoto"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoChange}
        className="sr-only"
      />

      {photoPreview && (
        <button
          type="button"
          onClick={() => {
            setPassportPhoto(null);
            setPhotoPreview("");

            const input = document.getElementById(
              "passportPhoto"
            ) as HTMLInputElement | null;

            if (input) {
              input.value = "";
            }
          }}
          className="mt-2 w-32 text-xs font-medium text-red-500 hover:text-red-700"
        >
          Remove photo
        </button>
      )}
    </div>

    {/* Upload Instructions */}
    <div className="pt-1">
      <p className="text-sm font-medium text-slate-700">
        Upload your passport photograph
      </p>

      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
        Click the passport box to select a photo from your computer or device.
        Your selected photo will appear in the preview immediately.
      </p>

      <div className="mt-3 space-y-1 text-xs text-slate-400">
        <p>• Accepted formats: JPG, JPEG, PNG, WEBP</p>
        <p>• Maximum file size: 2MB</p>
        <p>• Use a clear passport-style photograph</p>
      </div>
    </div>
  </div>
</section>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Surname{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              placeholder="Enter surname"
              className="form-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Other Names{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="otherNames"
              value={formData.otherNames}
              onChange={handleInputChange}
              placeholder="First and middle names"
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
              value={formData.nationality}
              onChange={handleInputChange}
              placeholder="e.g. Nigerian"
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
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>
      </section>
    );
  }

  /*
   * STEP 2
   */
  function renderContactStep() {
    return (
      <section>
        {renderSectionHeading(
          "Contact Information",
          "Tell us how the institute can contact you."
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
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
              value={formData.telephone}
              onChange={handleInputChange}
              placeholder="08012345678"
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
            value={formData.postalAddress}
            onChange={handleInputChange}
            rows={3}
            placeholder="Enter your postal address"
            className="form-input"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Residential Address
          </label>

          <textarea
            name="residentialAddress"
            value={formData.residentialAddress}
            onChange={handleInputChange}
            rows={3}
            placeholder="Enter your residential address"
            className="form-input"
          />
        </div>
      </section>
    );
  }

  /*
   * STEP 3
   */
  function renderAcademicStep() {
    return (
      <section>
        {renderSectionHeading(
          "Academic Information",
          "Select the programme and academic session you are applying for."
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Programme{" "}
              <span className="text-red-500">*</span>
            </label>

            <select
              name="programmeId"
              value={formData.programmeId}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">
                Select a programme
              </option>

              {programmes.map((programme) => (
                <option
                  key={programme._id}
                  value={programme._id}
                >
                  {programme.name} ({programme.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Department
            </label>

            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">
                Select a department
              </option>

              {departments.map((department) => (
                <option
                  key={department._id}
                  value={department._id}
                >
                  {department.name} ({department.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Academic Session{" "}
              <span className="text-red-500">*</span>
            </label>

            <select
              name="academicSessionId"
              value={formData.academicSessionId}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">
                Select academic session
              </option>

              {sessions.map((session) => (
                <option
                  key={session._id}
                  value={session._id}
                >
                  {session.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-brand-light p-5">
          <p className="text-sm font-medium text-brand-navy">
            Application Information
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Select the programme you wish to study and the
            active academic session for your application.
          </p>
        </div>
      </section>
    );
  }

  /*
   * STEP 4
   */
  function renderEducationStep() {
    return (
      <section>
        {renderSectionHeading(
          "Education / Professional Attachments",
          "Enter your previous educational qualifications."
        )}

        <div className="space-y-4">
          {education.map((row, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-brand-navy">
                  Qualification {index + 1}
                </p>

                {education.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeEducationRow(index)
                    }
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  placeholder="School attended"
                  value={row.schoolAttended}
                  onChange={(e) =>
                    updateEducationRow(
                      index,
                      "schoolAttended",
                      e.target.value
                    )
                  }
                  className="form-input"
                />

                <input
                  placeholder="Certificate obtained"
                  value={row.certificate}
                  onChange={(e) =>
                    updateEducationRow(
                      index,
                      "certificate",
                      e.target.value
                    )
                  }
                  className="form-input"
                />

                <input
                  placeholder="Date obtained"
                  value={row.dateObtained}
                  onChange={(e) =>
                    updateEducationRow(
                      index,
                      "dateObtained",
                      e.target.value
                    )
                  }
                  className="form-input"
                />

                <input
                  placeholder="Grade"
                  value={row.grade}
                  onChange={(e) =>
                    updateEducationRow(
                      index,
                      "grade",
                      e.target.value
                    )
                  }
                  className="form-input"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addEducationRow}
          className="mt-4 text-sm font-semibold text-brand-navy hover:text-brand-blue"
        >
          + Add another qualification
        </button>

        <div className="mt-6 rounded-xl bg-brand-light p-4">
          <p className="text-xs leading-5 text-slate-600">
            Attach photocopies of your credentials when
            returning this form in person or by email, as
            instructed by the institute after submission.
          </p>
        </div>
      </section>
    );
  }

  /*
   * STEP 5
   */
  function renderRefereesStep() {
    return (
      <section>
        {renderSectionHeading(
          "Referees",
          "Provide the names, addresses and contact details of your referees."
        )}

        <div className="mb-6 rounded-xl bg-brand-light p-4">
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
          {referees.map((referee, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 p-5"
            >
              <p className="mb-4 text-sm font-semibold text-brand-navy">
                Referee {index + 1}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  placeholder="Full name"
                  value={referee.name}
                  onChange={(e) =>
                    updateReferee(
                      index,
                      "name",
                      e.target.value
                    )
                  }
                  className="form-input"
                />

                <input
                  placeholder="Relationship e.g. Guardian"
                  value={referee.relationship}
                  onChange={(e) =>
                    updateReferee(
                      index,
                      "relationship",
                      e.target.value
                    )
                  }
                  className="form-input"
                />

                <input
                  placeholder="Address"
                  value={referee.address}
                  onChange={(e) =>
                    updateReferee(
                      index,
                      "address",
                      e.target.value
                    )
                  }
                  className="form-input"
                />

                <input
                  placeholder="Phone number"
                  value={referee.phone}
                  onChange={(e) =>
                    updateReferee(
                      index,
                      "phone",
                      e.target.value
                    )
                  }
                  className="form-input"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /*
   * STEP 6
   */
  function renderDeclarationStep() {
    return (
      <section>
        {renderSectionHeading(
          "Declaration & Submission",
          "Review the declaration carefully before submitting your application."
        )}

        <div className="rounded-xl border border-slate-200 bg-brand-light p-5">
          <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) =>
                setAgreedToTerms(e.target.checked)
              }
              className="mt-1 h-4 w-4"
            />

            <span>
              I have decided to study with this institute and
              I am prepared to abide by the rules and
              regulations of the institute. I also am aware
              that full or part payment is not refundable even
              on voluntary withdrawal. I certify that the
              particulars contained in this application are
              true and that I am prepared to verify them if
              required.
            </span>
          </label>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Signature — type your full name{" "}
            <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="applicantSignature"
            value={formData.applicantSignature}
            onChange={handleInputChange}
            placeholder="Type your full name to sign"
            className="form-input italic"
          />

          <p className="mt-2 text-xs text-slate-500">
            Your typed full name will serve as your electronic
            signature.
          </p>
        </div>

        {/* Application summary */}
        <div className="mt-8 rounded-xl border border-slate-200 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-navy">
            Application Summary
          </h3>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-slate-400">Applicant</p>
              <p className="font-medium text-slate-700">
                {formData.surname}{" "}
                {formData.otherNames}
              </p>
            </div>

            <div>
              <p className="text-slate-400">Email</p>
              <p className="font-medium text-slate-700">
                {formData.email}
              </p>
            </div>

            <div>
              <p className="text-slate-400">
                Education Records
              </p>
              <p className="font-medium text-slate-700">
                {
                  education.filter(
                    (row) =>
                      row.schoolAttended.trim() ||
                      row.certificate.trim()
                  ).length
                }{" "}
                record(s)
              </p>
            </div>

            <div>
              <p className="text-slate-400">Referees</p>
              <p className="font-medium text-slate-700">
                {
                  referees.filter(
                    (referee) =>
                      referee.name.trim() ||
                      referee.phone.trim()
                  ).length
                }{" "}
                referee(s)
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /*
   * Render current step
   */
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

  return (
    <main className="min-h-screen bg-brand-light px-4 py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            ITMT Management System
          </p>

          <h1 className="font-serif text-3xl font-bold text-brand-navy md:text-4xl">
            Apply for Admission
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Complete your admission application step by step.
            Your information will be submitted securely for
            review.
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl bg-white shadow-xl">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-navy" />

              <p className="text-sm text-slate-600">
                Loading application form...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Progress */}
            {renderStepIndicator()}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-white p-6 shadow-xl md:p-10"
            >
              {/* Error */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="font-bold">!</span>

                  <p>{error}</p>
                </div>
              )}

              {/* Step content */}
              <div className="min-h-[420px]">
                {renderCurrentStep()}
              </div>

              {/* Navigation */}
              <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {currentStep === 1 ? (
                    <Link
                      href="/admissions"
                      className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
                    >
                      Cancel
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                    >
                      ← Back
                    </button>
                  )}
                </div>

                <div>
                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-brand-navy px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark sm:w-auto"
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-brand-navy px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {isSubmitting
                        ? "Submitting Application..."
                        : "Submit Application"}
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom progress text */}
              <div className="mt-5 text-center">
                <p className="text-xs text-slate-400">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Reusable form input styling */}
      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(226 232 240);
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          outline: none;
          transition: border-color 150ms, box-shadow 150ms;
          background: white;
        }

        :global(.form-input:focus) {
          border-color: var(--brand-navy, #0f172a);
          box-shadow: 0 0 0 1px var(--brand-navy, #0f172a);
        }

        :global(.form-input::placeholder) {
          color: rgb(148 163 184);
        }
      `}</style>
    </main>
  );
}