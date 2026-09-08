"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

import {
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Loader2,
  Plus,
  Receipt,
  Save,
  User,
} from "lucide-react";

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* =========================================================
   TYPES
========================================================= */

type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "card"
  | "other";

type PaymentPurpose =
  | "tuition"
  | "registration"
  | "examination"
  | "acceptance"
  | "transcript"
  | "certificate"
  | "hostel"
  | "other";

type PaymentStatus =
  | "pending"
  | "successful"
  | "failed"
  | "refunded"
  | "cancelled";

interface Student {
  _id: string;
  name: string;
  email: string;
  matricNumber?: string;
  programme?: {
    _id: string;
    name: string;
    code: string;
  };
  level?: string;
}

interface Semester {
  _id: string;
  name: string;
  order: number;
  session?: {
    _id: string;
    name: string;
  };
}

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
}

/* =========================================================
   CONSTANTS
========================================================= */

const PURPOSE_LABELS: Record<PaymentPurpose, string> = {
  tuition: "Tuition",
  registration: "Registration",
  examination: "Examination",
  acceptance: "Acceptance",
  transcript: "Transcript",
  certificate: "Certificate",
  hostel: "Hostel",
  other: "Other",
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  card: "Card",
  other: "Other",
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  successful: "Successful",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(amount: number, currency: string = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/* =========================================================
   PAGE
========================================================= */

export default function RecordPaymentPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [recordedPayment, setRecordedPayment] = useState<{
    _id: string;
    paymentReference: string;
    amount: number;
  } | null>(null);
  const [studentBalance, setStudentBalance] = useState<{
    totalFees: number;
    totalPaid: number;
    outstanding: number;
  } | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);

  const [formData, setFormData] = useState({
    student: "",
    semester: "",
    academicSession: "",
    programme: "",
    department: "",

    amount: "",
    currency: "NGN",

    method: "cash" as PaymentMethod,
    purpose: "tuition" as PaymentPurpose,

    paymentReference: "",
    invoiceNumber: "",
    paymentProvider: "",
    providerTransactionRef: "",

    status: "successful" as PaymentStatus,

    notes: "",
  });

  /* =======================================================
     LOAD REFERENCE DATA
  ======================================================= */

  const loadReferenceData = useCallback(async () => {
    try {
      setLoading(true);

      const session = await getSession();
      const token = session?.accessToken;

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const [
        studentsRes,
        semestersRes,
        programmesRes,
        departmentsRes,
        sessionsRes,
      ] = await Promise.all([
        apiGet<{
          success: boolean;
          users?: Student[];
        }>("/users?role=student", token),

        apiGet<{
          success: boolean;
          semesters?: Semester[];
        }>("/semesters", token),

        apiGet<{
          success: boolean;
          programmes?: Programme[];
        }>("/programmes", token),

        apiGet<{
          success: boolean;
          departments?: Department[];
        }>("/departments", token),

        apiGet<{
          success: boolean;
          sessions?: AcademicSession[];
        }>("/academic-sessions", token),
      ]);

      setStudents(studentsRes?.users || []);
      setSemesters(semestersRes?.semesters || []);
      setProgrammes(programmesRes?.programmes || []);
      setDepartments(departmentsRes?.departments || []);
      setAcademicSessions(sessionsRes?.sessions || []);
    } catch (error) {
      console.error("Load reference data error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load reference data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    void loadReferenceData();
  }, [loadReferenceData]);

  /* =======================================================
     FORM HANDLER
  ======================================================= */

  const handleInputChange = (
    field: keyof typeof formData,
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     STUDENT CHANGE
  ======================================================= */

  const handleStudentChange = (studentId: string | null) => {
    if (!studentId) return;
    const student = students.find(
      (item) => item._id === studentId,
    );

    setFormData((previous) => ({
      ...previous,
      student: studentId,
      programme: student?.programme?._id || "",
    }));
  };

  /* =======================================================
     SEMESTER CHANGE
  ======================================================= */

  const handleSemesterChange = (semesterId: string | null) => {
    if (!semesterId) return;
    const semester = semesters.find(
      (item) => item._id === semesterId,
    );

    setFormData((previous) => ({
      ...previous,
      semester: semesterId,
      academicSession: semester?.session?._id || previous.academicSession,
    }));
  };

  /* =======================================================
     GENERATE PAYMENT REFERENCE
  ======================================================= */

  const generatePaymentReference = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const random = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    const reference = `ITMT-PAY-${year}${month}${day}-${random}`;

    setFormData((previous) => ({
      ...previous,
      paymentReference: reference,
    }));
  };

  /* =======================================================
     FORMAT AMOUNT
  ======================================================= */

  const formattedAmount = useMemo(() => {
    const numericAmount = Number(formData.amount);

    if (!formData.amount || !Number.isFinite(numericAmount)) {
      return "₦0.00";
    }

    return formatCurrency(numericAmount, "NGN");
  }, [formData.amount]);

  /* =======================================================
     SELECTED STUDENT
  ======================================================= */

  const selectedStudent = useMemo(() => {
    return students.find(
      (student) => student._id === formData.student,
    );
  }, [students, formData.student]);

  /* =======================================================
     LOAD STUDENT BALANCE
  ======================================================= */

  const loadStudentBalance = useCallback(async () => {
    if (!formData.student || !formData.semester) {
      setStudentBalance(null);
      return;
    }

    try {
      const session = await getSession();
      const token = session?.accessToken;

      if (!token) {
        return;
      }

      const response = await apiGet<{
        success: boolean;
        totalFees?: number;
        totalPaid?: number;
        outstanding?: number;
      }>(
        `/payments/balance?student=${formData.student}&semester=${formData.semester}`,
        token,
      );

      if (response?.success) {
        setStudentBalance({
          totalFees: response.totalFees || 0,
          totalPaid: response.totalPaid || 0,
          outstanding: response.outstanding || 0,
        });
      }
    } catch (error) {
      console.error("Load student balance error:", error);
      setStudentBalance(null);
    }
  }, [formData.student, formData.semester]);

  useEffect(() => {
    void loadStudentBalance();
  }, [loadStudentBalance]);

  /* =======================================================
     VALIDATE FORM
  ======================================================= */

  const validateForm = (): boolean => {
    if (!formData.student) {
      toast.error("Please select a student.");
      return false;
    }

    if (!formData.semester) {
      toast.error("Please select a semester.");
      return false;
    }

    const amount = Number(formData.amount);

    if (
      !formData.amount ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      toast.error("Please enter a valid amount.");
      return false;
    }

    if (!formData.paymentReference.trim()) {
      toast.error("Please enter a payment reference.");
      return false;
    }

    return true;
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmDialog(false);

    try {
      setSubmitting(true);

      const session = await getSession();
      const token = session?.accessToken;

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const response = await apiPost<{
        success: boolean;
        message: string;
        payment: {
          _id: string;
          paymentReference: string;
          amount: number;
        };
      }>(
        "/payments",
        {
          student: formData.student,

          semester: formData.semester,

          academicSession:
            formData.academicSession || undefined,

          programme:
            formData.programme || undefined,

          department:
            formData.department || undefined,

          amount: Number(formData.amount),

          currency: formData.currency,

          method: formData.method,

          purpose: formData.purpose,

          paymentReference:
            formData.paymentReference.trim(),

          invoiceNumber:
            formData.invoiceNumber.trim() || undefined,

          paymentProvider:
            formData.paymentProvider.trim() || undefined,

          providerTransactionRef:
            formData.providerTransactionRef.trim() || undefined,

          status: formData.status,

          notes:
            formData.notes.trim() || undefined,
        },
        token,
      );

      if (!response?.success || !response.payment?._id) {
        throw new Error(
          response?.message ||
            "Unable to record payment.",
        );
      }

      toast.success(
        "Payment recorded successfully.",
      );

      setRecordedPayment(response.payment);
      setShowSuccessState(true);
    } catch (error) {
      console.error(
        "Record payment error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to record payment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordAnother = () => {
    setRecordedPayment(null);
    setShowSuccessState(false);
    setFormData({
      student: "",
      semester: "",
      academicSession: "",
      programme: "",
      department: "",
      amount: "",
      currency: "NGN",
      method: "cash",
      purpose: "tuition",
      paymentReference: "",
      invoiceNumber: "",
      paymentProvider: "",
      providerTransactionRef: "",
      status: "successful",
      notes: "",
    });
    setStudentBalance(null);
  };

  /* =======================================================
     SUCCESS STATE
  ======================================================= */

  if (showSuccessState && recordedPayment) {
    return (
      <div className="min-h-full bg-slate-50 pb-10">
        <div className="relative overflow-hidden rounded-2xl bg-brand-navy">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="relative mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center gap-2 text-xs text-white/60">
              <Link
                href="/dashboards/finance"
                className="transition-colors hover:text-white"
              >
                Finance
              </Link>

              <ChevronRight className="h-3.5 w-3.5" />

              <Link
                href="/dashboards/finance/payments"
                className="transition-colors hover:text-white"
              >
                Payments
              </Link>

              <ChevronRight className="h-3.5 w-3.5" />

              <span className="text-white/90">
                Payment Recorded
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Payment Recorded Successfully
            </h1>

            <p className="mt-2 text-sm text-white/65">
              The payment has been successfully added to the student&apos;s financial record.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center justify-center gap-6 py-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-900">
                    Payment Recorded Successfully
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    The payment has been saved to the ITMT financial records.
                  </p>
                </div>

                <div className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-sm text-slate-600">
                      Payment Reference
                    </span>

                    <span className="font-mono text-sm font-semibold text-slate-900">
                      {recordedPayment.paymentReference}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-sm text-slate-600">
                      Amount
                    </span>

                    <span className="text-sm font-bold text-brand-navy">
                      {formatCurrency(recordedPayment.amount, "NGN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Student
                    </span>

                    <span className="text-sm font-semibold text-slate-900">
                      {selectedStudent?.name || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href={`/dashboards/finance/payments/${recordedPayment._id}`}
                  >
                    <Button className="gap-2 bg-brand-navy">
                      <FileText className="h-4 w-4" />
                      View Payment
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    onClick={handleRecordAnother}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Record Another Payment
                  </Button>

                  <Link
                    href="/dashboards/finance/payments"
                    className="w-full"
                  >
                    <Button variant="ghost" className="w-full">
                      Back to Payments
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <p className="text-sm font-medium text-slate-600">
            Loading payment information...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50 pb-10">
      {/* =====================================================
          PREMIUM HEADER
      ===================================================== */}

      <div className="relative overflow-hidden rounded-2xl bg-brand-navy">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-xs text-white/60">
            <Link
              href="/dashboards/finance"
              className="transition-colors hover:text-white"
            >
              Finance
            </Link>

            <ChevronRight className="h-3.5 w-3.5" />

            <Link
              href="/dashboards/finance/payments"
              className="transition-colors hover:text-white"
            >
              Payments
            </Link>

            <ChevronRight className="h-3.5 w-3.5" />

            <span className="text-white/90">
              Record Payment
            </span>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Link href="/dashboards/finance/payments">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 border-white/15 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">
                    Back to payments
                  </span>
                </Button>
              </Link>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">
                    Finance
                  </span>

                  <span className="text-xs text-white/40">
                    /
                  </span>

                  <span className="text-xs text-white/60">
                    Payment Records
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Record Payment
                </h1>

                <p className="mt-1 max-w-xl text-sm text-white/65">
                  Manually record and securely save a
                  student payment to the ITMT financial
                  records.
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold/10">
                <Receipt className="h-4 w-4 text-brand-gold" />
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/45">
                  New Record
                </p>

                <p className="text-sm font-semibold text-white">
                  Manual Payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="mx-auto w-full max-w-7xl px-0 pt-6 sm:px-0 lg:px-0">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* =================================================
                LEFT — FORM
            ================================================= */}

            <div className="space-y-6">
              {/* Student Information */}
              <Card className="overflow-hidden border-slate-200/80 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-white px-2 py-5 sm:px-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5">
                      <User className="h-5 w-5 text-brand-navy" />
                    </div>

                    <div>
                      <CardTitle className="text-base text-slate-900">
                        Student & Academic Information
                      </CardTitle>

                      <CardDescription className="mt-1">
                        Select the student and academic
                        period associated with this payment.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 p-2 sm:p-6">
                  {/* Student */}
                  <div className="space-y-2">
                    <label
                      htmlFor="student"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Student{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <Select
                      value={formData.student}
                      onValueChange={handleStudentChange}
                    >
                      <SelectTrigger
                        id="student"
                        className="h-11 border-slate-200 bg-white"
                      >
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>

                      <SelectContent>
                        {students.length === 0 ? (
                          <div className="px-3 py-6 text-center text-sm text-slate-500">
                            No students found.
                          </div>
                        ) : (
                          students.map((student) => (
                            <SelectItem
                              key={student._id}
                              value={student._id}
                            >
                              <div className="flex items-center gap-2">
                                <span>
                                  {student.name}
                                </span>

                                {student.matricNumber && (
                                  <span className="text-xs text-slate-400">
                                    ({student.matricNumber})
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>

                    {selectedStudent && (
                      <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">
                          {selectedStudent.email}
                        </span>

                        {selectedStudent.level && (
                          <>
                            <span className="mx-2 text-slate-300">
                              •
                            </span>

                            Level {selectedStudent.level}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Semester */}
                    <div className="space-y-2">
                      <label
                        htmlFor="semester"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Semester{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <Select
                        value={formData.semester}
                        onValueChange={handleSemesterChange}
                      >
                        <SelectTrigger
                          id="semester"
                          className="h-11 border-slate-200 bg-white"
                        >
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>

                        <SelectContent>
                          {semesters.map((semester) => (
                            <SelectItem
                              key={semester._id}
                              value={semester._id}
                            >
                              {semester.name}
                              {semester.session && (
                                <span className="ml-1 text-xs text-slate-400">
                                  —{" "}
                                  {
                                    semester.session
                                      .name
                                  }
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Academic Session */}
                    <div className="space-y-2">
                      <label
                        htmlFor="academicSession"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Academic Session
                      </label>

                      <Select
                        value={
                          formData.academicSession ||
                          undefined
                        }
                        onValueChange={(value) =>
                          value !== null && handleInputChange(
                            "academicSession",
                            value,
                          )
                        }
                      >
                        <SelectTrigger
                          id="academicSession"
                          className="h-11 border-slate-200 bg-white"
                        >
                          <SelectValue placeholder="Select academic session" />
                        </SelectTrigger>

                        <SelectContent>
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
                    </div>

                    {/* Programme */}
                    <div className="space-y-2">
                      <label
                        htmlFor="programme"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Programme
                      </label>

                      <Select
                        value={
                          formData.programme ||
                          undefined
                        }
                        onValueChange={(value) =>
                          value !== null && handleInputChange(
                            "programme",
                            value,
                          )
                        }
                      >
                        <SelectTrigger
                          id="programme"
                          className="h-11 border-slate-200 bg-white"
                        >
                          <SelectValue placeholder="Select programme" />
                        </SelectTrigger>

                        <SelectContent>
                          {programmes.map(
                            (programme) => (
                              <SelectItem
                                key={programme._id}
                                value={programme._id}
                              >
                                {programme.name} (
                                {programme.code})
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                      <label
                        htmlFor="department"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Department
                      </label>

                      <Select
                        value={
                          formData.department ||
                          undefined
                        }
                        onValueChange={(value) =>
                          value !== null && handleInputChange(
                            "department",
                            value,
                          )
                        }
                      >
                        <SelectTrigger
                          id="department"
                          className="h-11 border-slate-200 bg-white"
                        >
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>

                        <SelectContent>
                          {departments.map(
                            (department) => (
                              <SelectItem
                                key={department._id}
                                value={department._id}
                              >
                                {department.name} (
                                {department.code})
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* =================================================
                  PAYMENT DETAILS
              ================================================= */}

              <Card className="overflow-hidden border-slate-200/80 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5">
                      <CreditCard className="h-5 w-5 text-brand-navy" />
                    </div>

                    <div>
                      <CardTitle className="text-base text-slate-900">
                        Payment Details
                      </CardTitle>

                      <CardDescription className="mt-1">
                        Enter the amount and transaction
                        information.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Payment Purpose */}
                    <div className="space-y-2">
                      <label
                        htmlFor="purpose"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Payment Purpose{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <Select
                        value={formData.purpose}
                        onValueChange={(value) =>
                          value !== null && handleInputChange(
                            "purpose",
                            value,
                          )
                        }
                      >
                        <SelectTrigger
                          id="purpose"
                          className="h-11 border-slate-200 bg-white"
                        >
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {(
                            Object.keys(
                              PURPOSE_LABELS,
                            ) as PaymentPurpose[]
                          ).map((purpose) => (
                            <SelectItem
                              key={purpose}
                              value={purpose}
                            >
                              {
                                PURPOSE_LABELS[
                                  purpose
                                ]
                              }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <label
                        htmlFor="method"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Payment Method{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <Select
                        value={formData.method}
                        onValueChange={(value) =>
                          value !== null && handleInputChange(
                            "method",
                            value,
                          )
                        }
                      >
                        <SelectTrigger
                          id="method"
                          className="h-11 border-slate-200 bg-white"
                        >
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {(
                            Object.keys(
                              METHOD_LABELS,
                            ) as PaymentMethod[]
                          ).map((method) => (
                            <SelectItem
                              key={method}
                              value={method}
                            >
                              {
                                METHOD_LABELS[
                                  method
                                ]
                              }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* =================================================
                      AMOUNT — FIXED
                  ================================================= */}

                  <div className="rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.025] p-4 sm:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <label
                        htmlFor="amount"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                      >
                        <Banknote className="h-4 w-4 text-brand-navy" />

                        Payment Amount{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <span className="rounded-full bg-brand-navy/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-navy">
                        NGN
                      </span>
                    </div>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
                        ₦
                      </span>

                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        step="0.01"
                        placeholder="150000"
                        value={formData.amount}
                        onChange={(event) =>
                          handleInputChange(
                            "amount",
                            event.target.value,
                          )
                        }
                        className="h-14 border-slate-200 bg-white pl-10 text-lg font-semibold shadow-sm"
                        required
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Enter the amount in Nigerian Naira.
                      </p>

                      <p className="text-sm font-semibold text-brand-navy">
                        {formattedAmount}
                      </p>
                    </div>
                  </div>

                  {/* Payment References */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Payment Reference */}
                    <div className="space-y-2 sm:col-span-2">
                      <div className="flex items-center justify-between gap-3">
                        <label
                          htmlFor="paymentReference"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Payment Reference{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </label>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={
                            generatePaymentReference
                          }
                          className="h-7 px-2 text-xs font-semibold text-brand-navy hover:bg-brand-navy/5 hover:text-brand-navy"
                        >
                          Generate Reference
                        </Button>
                      </div>

                      <Input
                        id="paymentReference"
                        placeholder="ITMT-PAY-20260907-XXXXXX"
                        value={
                          formData.paymentReference
                        }
                        onChange={(event) =>
                          handleInputChange(
                            "paymentReference",
                            event.target.value,
                          )
                        }
                        className="h-11 border-slate-200 bg-white font-mono text-sm"
                        required
                      />
                    </div>

                    {/* Invoice Number */}
                    <div className="space-y-2">
                      <label
                        htmlFor="invoiceNumber"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Invoice Number
                      </label>

                      <Input
                        id="invoiceNumber"
                        placeholder="ITMT-INV-2026-0001"
                        value={formData.invoiceNumber}
                        onChange={(event) =>
                          handleInputChange(
                            "invoiceNumber",
                            event.target.value,
                          )
                        }
                        className="h-11 border-slate-200 bg-white font-mono text-sm"
                      />
                    </div>

                    {/* Payment Provider */}
                    <div className="space-y-2">
                      <label
                        htmlFor="paymentProvider"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Payment Provider
                      </label>

                      <Input
                        id="paymentProvider"
                        placeholder="e.g. Paystack, Bank, Manual"
                        value={
                          formData.paymentProvider
                        }
                        onChange={(event) =>
                          handleInputChange(
                            "paymentProvider",
                            event.target.value,
                          )
                        }
                        className="h-11 border-slate-200 bg-white"
                      />
                    </div>

                    {/* Provider Transaction Reference */}
                    <div className="space-y-2 sm:col-span-2">
                      <label
                        htmlFor="providerTransactionRef"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Provider Transaction Reference
                      </label>

                      <Input
                        id="providerTransactionRef"
                        placeholder="Transaction ID from provider"
                        value={
                          formData.providerTransactionRef
                        }
                        onChange={(event) =>
                          handleInputChange(
                            "providerTransactionRef",
                            event.target.value,
                          )
                        }
                        className="h-11 border-slate-200 bg-white font-mono text-sm"
                      />

                      <p className="text-xs text-slate-400">
                        For bank or online payments, enter
                        the transaction reference supplied
                        by the provider.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* =================================================
                  STATUS & NOTES
              ================================================= */}

              <Card className="overflow-hidden border-slate-200/80 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5">
                      <FileText className="h-5 w-5 text-brand-navy" />
                    </div>

                    <div>
                      <CardTitle className="text-base text-slate-900">
                        Record Status
                      </CardTitle>

                      <CardDescription className="mt-1">
                        Confirm the current status of this
                        payment.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 p-5 sm:p-6">
                  {/* Status */}
                  <div className="space-y-2">
                    <label
                      htmlFor="status"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Payment Status
                    </label>

                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        value !== null && handleInputChange(
                          "status",
                          value,
                        )
                      }
                    >
                      <SelectTrigger
                        id="status"
                        className="h-11 border-slate-200 bg-white"
                      >
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {(
                          Object.keys(
                            STATUS_LABELS,
                          ) as PaymentStatus[]
                        ).map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                          >
                            {STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label
                      htmlFor="notes"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Notes
                    </label>

                    <textarea
                      id="notes"
                      rows={4}
                      placeholder="Add any additional notes about this payment..."
                      value={formData.notes}
                      onChange={(event) =>
                        handleInputChange(
                          "notes",
                          event.target.value,
                        )
                      }
                      className="flex min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* =================================================
                RIGHT — PAYMENT SUMMARY
            ================================================= */}

            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <Card className="overflow-hidden border-slate-200/80 shadow-sm">
                {/* Navy Summary Header */}
                <div className="bg-brand-navy px-5 py-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                      <Receipt className="h-5 w-5 text-brand-gold" />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">
                        Payment Summary
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        Review before recording
                      </p>
                    </div>
                  </div>

                  <div className="mt-7">
                    <p className="text-xs text-white/50">
                      Total Amount
                    </p>

                    <p className="mt-1 text-3xl font-bold tracking-tight text-white">
                      {formattedAmount}
                    </p>
                  </div>
                </div>

                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <span className="text-xs text-slate-500">
                      Student
                    </span>

                    <span className="max-w-[180px] text-right text-sm font-semibold text-slate-800">
                      {selectedStudent?.name ||
                        "Not selected"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <span className="text-xs text-slate-500">
                      Matric Number
                    </span>

                    <span className="text-right text-sm font-medium text-slate-700">
                      {selectedStudent?.matricNumber ||
                        "—"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <span className="text-xs text-slate-500">
                      Purpose
                    </span>

                    <span className="text-right text-sm font-medium text-slate-700">
                      {PURPOSE_LABELS[
                        formData.purpose
                      ]}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <span className="text-xs text-slate-500">
                      Method
                    </span>

                    <span className="text-right text-sm font-medium text-slate-700">
                      {METHOD_LABELS[
                        formData.method
                      ]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500">
                      Status
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />

                      {
                        STATUS_LABELS[
                          formData.status
                        ]
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-navy/5">
                    <CreditCard className="h-4 w-4 text-brand-navy" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Financial Record
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      This payment will be saved to the
                      ITMT financial records and associated
                      with the selected student.
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Balance Card */}
              {studentBalance && (
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-brand-navy" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Student Balance
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Total Fees
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {formatCurrency(studentBalance.totalFees, "NGN")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Total Paid
                        </span>
                        <span className="text-sm font-semibold text-emerald-600">
                          {formatCurrency(studentBalance.totalPaid, "NGN")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs font-semibold text-slate-700">
                          Outstanding
                        </span>
                        <span className="text-sm font-bold text-red-600">
                          {formatCurrency(studentBalance.outstanding, "NGN")}
                        </span>
                      </div>

                      {Number(formData.amount) > 0 && (
                        <div className="rounded-lg bg-slate-50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              After Payment
                            </span>
                            <span className="text-sm font-bold text-brand-navy">
                              {formatCurrency(
                                Math.max(0, studentBalance.outstanding - Number(formData.amount)),
                                "NGN",
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 w-full gap-2 bg-brand-navy font-semibold text-white shadow-lg shadow-brand-navy/15 transition-all hover:bg-brand-navy/90 hover:shadow-xl disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Recording Payment...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Record Payment
                    </>
                  )}
                </Button>

                <Link
                  href="/dashboards/finance/payments"
                  className="w-full"
                >
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    className="h-11 w-full border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to record a payment of {formattedAmount} for{" "}
              {selectedStudent?.name || "the selected student"}.
              Once recorded, this transaction will become part of the student&apos;s
              financial record.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4 space-y-2 rounded-lg bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Student</span>
              <span className="text-sm font-semibold text-slate-900">
                {selectedStudent?.name || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Purpose</span>
              <span className="text-sm font-medium text-slate-700">
                {PURPOSE_LABELS[formData.purpose]}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Amount</span>
              <span className="text-sm font-bold text-brand-navy">
                {formattedAmount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Method</span>
              <span className="text-sm font-medium text-slate-700">
                {METHOD_LABELS[formData.method]}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Status</span>
              <span className="text-sm font-medium text-slate-700">
                {STATUS_LABELS[formData.status]}
              </span>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              disabled={submitting}
              className="bg-brand-navy hover:bg-brand-navy/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                "Confirm & Record Payment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}