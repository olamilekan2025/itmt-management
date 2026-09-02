"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Mail,
  GraduationCap,
  Loader2,
  UserRound,
  XCircle,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

import { Badge } from "@/components/ui/badge";

import {
  getStudent,
  activateStudent,
  deactivateStudent,
  type Student,
} from "@/lib/api-client";

/**
 * =========================================================
 * ADMIN STUDENT DETAILS PAGE
 * =========================================================
 */

export default function AdminStudentDetailsPage() {
  const params = useParams();

  const {
    status: sessionStatus,
  } = useSession();

  const studentId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [student, setStudent] =
    useState<Student | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [dialogAction, setDialogAction] =
    useState<"activate" | "deactivate" | null>(
      null,
    );

  /* =========================================================
     LOAD STUDENT
  ========================================================= */

  const loadStudent = useCallback(async () => {
    if (!studentId) {
      setError("Invalid student ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await getStudent(studentId);

      setStudent(response);
    } catch (err) {
      console.error(
        "Load student error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve student",
      );
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (
      sessionStatus ===
      "authenticated"
    ) {
      loadStudent();
    }
  }, [
    sessionStatus,
    loadStudent,
  ]);

  /* =========================================================
     ACCOUNT ACTION
  ========================================================= */

  async function handleAccountAction() {
    if (
      !student ||
      !dialogAction
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response =
        dialogAction === "activate"
          ? await activateStudent(
              student._id,
            )
          : await deactivateStudent(
              student._id,
            );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to update student account",
        );
      }

      setStudent(response.user);

      setDialogOpen(false);
      setDialogAction(null);
    } catch (err) {
      console.error(
        "Student account action error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update student account",
      );
    } finally {
      setActionLoading(false);
    }
  }

  /* =========================================================
     OPEN ACCOUNT DIALOG
  ========================================================= */

  function openAccountDialog(
    action: "activate" | "deactivate",
  ) {
    setDialogAction(action);
    setDialogOpen(true);
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    sessionStatus === "loading" ||
    loading
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />

          <p className="text-sm text-muted-foreground">
            Loading student profile...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !student) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => {
            window.location.href =
              "/dashboards/admin/students";
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Button>

        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <XCircle className="mb-4 h-12 w-12 text-destructive" />

            <h2 className="text-lg font-semibold">
              Unable to load student
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error ||
                "The requested student could not be found."}
            </p>

            <Button
              className="mt-6"
              onClick={loadStudent}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =========================================================
     DISPLAY HELPERS
  ========================================================= */

  const programme =
    typeof student.programme ===
      "object" &&
    student.programme !== null
      ? student.programme
      : null;

  const createdDate =
    student.createdAt
      ? new Date(
          student.createdAt,
        ).toLocaleDateString(
          "en-NG",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        )
      : "—";

  const initials =
    student.name
      .split(/\s+/)
      .filter(Boolean)
      .map(
        (part: string) =>
          part.charAt(0),
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const isActive =
    student.isActive;

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              window.location.href =
                "/dashboards/admin/students";
            }}
            aria-label="Back to students"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <p className="text-sm text-muted-foreground">
              Student Management
            </p>

            <h1 className="text-2xl font-bold tracking-tight">
              Student Profile
            </h1>
          </div>

        </div>

        {/* ACCOUNT ACTION */}

        {isActive ? (
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() =>
              openAccountDialog(
                "deactivate",
              )
            }
          >
            <ShieldOff className="h-4 w-4" />
            Deactivate Account
          </Button>
        ) : (
          <Button
            className="gap-2"
            onClick={() =>
              openAccountDialog(
                "activate",
              )
            }
          >
            <ShieldCheck className="h-4 w-4" />
            Activate Account
          </Button>
        )}

      </div>

      {/* =====================================================
          PROFILE HEADER CARD
      ====================================================== */}

      <Card className="overflow-hidden">

        <div className="h-2 bg-brand-gold" />

        <CardContent className="p-6">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-navy text-lg font-bold text-white">
                {initials}
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  {student.name}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {student.matricNumber ||
                    "No matric number"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  <Badge
                    variant={
                      isActive
                        ? "default"
                        : "destructive"
                    }
                  >
                    {isActive
                      ? "Active"
                      : "Inactive"}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="gap-1"
                  >
                    <GraduationCap className="h-3 w-3" />
                    Student
                  </Badge>

                </div>

              </div>

            </div>

          </div>

        </CardContent>

      </Card>

      {/* =====================================================
          INFORMATION GRID
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* PERSONAL INFORMATION */}

        <Card>

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-brand-gold" />
              Personal Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            <InfoRow
              label="Full Name"
              value={student.name}
            />

            <InfoRow
              label="Email Address"
              value={student.email}
              icon={
                <Mail className="h-4 w-4" />
              }
            />

            <InfoRow
              label="Matric Number"
              value={
                student.matricNumber ||
                "Not assigned"
              }
            />

            <InfoRow
              label="Role"
              value="Student"
            />

          </CardContent>

        </Card>

        {/* ACADEMIC INFORMATION */}

        <Card>

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-brand-gold" />
              Academic Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            <InfoRow
              label="Programme"
              value={
                programme
                  ? `${programme.name} (${programme.code})`
                  : "Not assigned"
              }
            />

            <InfoRow
              label="Level"
              value={
                student.level ||
                "Not assigned"
              }
            />

            <InfoRow
              label="Matric Number"
              value={
                student.matricNumber ||
                "Not assigned"
              }
            />

            <InfoRow
              label="Academic Session"
              value={
                student.academicSession &&
                typeof student.academicSession ===
                  "object"
                  ? student.academicSession.name
                  : "Not assigned"
              }
            />

          </CardContent>

        </Card>

        {/* ACCOUNT INFORMATION */}

        <Card>

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-gold" />
              Account Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            <InfoRow
              label="Account Status"
              value={
                isActive
                  ? "Active"
                  : "Inactive"
              }
              icon={
                isActive ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )
              }
            />

            <InfoRow
              label="Email Verification"
              value={
                student.isEmailVerified
                  ? "Verified"
                  : "Not verified"
              }
              icon={
                student.isEmailVerified ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500" />
                )
              }
            />

            <InfoRow
              label="Account Created"
              value={createdDate}
            />

          </CardContent>

        </Card>

      </div>

      {/* =====================================================
          ACCOUNT STATUS NOTICE
      ====================================================== */}

      <Card>

        <CardContent className="p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="font-semibold">
                Account Access
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {isActive
                  ? "This student can currently access the student portal using their matric number and password."
                  : "This student cannot access the student portal while the account is inactive."}
              </p>

            </div>

            {isActive ? (
              <Badge className="w-fit gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Portal Access Enabled
              </Badge>
            ) : (
              <Badge
                variant="destructive"
                className="w-fit gap-1"
              >
                <XCircle className="h-3 w-3" />
                Portal Access Disabled
              </Badge>
            )}

          </div>

        </CardContent>

      </Card>

      {/* =====================================================
          CONFIRMATION DIALOG
      ====================================================== */}

      <AlertDialog
        open={dialogOpen}
        onOpenChange={(
          open: boolean,
        ) => {
          if (!actionLoading) {
            setDialogOpen(open);

            if (!open) {
              setDialogAction(null);
            }
          }
        }}
      >

        <AlertDialogContent>

          <AlertDialogHeader>

            <AlertDialogTitle>
              {dialogAction ===
              "deactivate"
                ? "Deactivate Student Account?"
                : "Activate Student Account?"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {dialogAction ===
              "deactivate"
                ? `Are you sure you want to deactivate ${student.name}'s account? The student will no longer be able to access the student portal.`
                : `Are you sure you want to activate ${student.name}'s account? The student will regain access to the student portal.`}
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel
              disabled={actionLoading}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(
                event: React.MouseEvent<HTMLButtonElement>,
              ) => {
                event.preventDefault();
                handleAccountAction();
              }}
              disabled={actionLoading}
              className={
                dialogAction ===
                "deactivate"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >

              {actionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {dialogAction ===
              "deactivate"
                ? "Deactivate Account"
                : "Activate Account"}

            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

    </div>
  );
}


/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4 last:border-0 last:pb-0">

      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="flex max-w-[65%] items-center gap-2 text-right text-sm font-medium">

        {icon}

        <span className="break-words">
          {value}
        </span>

      </span>

    </div>
  );
}
