"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  BookOpen,
  GraduationCap,
} from "lucide-react";

import type {
  Course,
  Programme,
  Semester,
} from "@/lib/admin-courses";

interface CourseViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
}

/*
 * A course reference can be either:
 *
 *   "67xxxxxxxxxxxx"
 *
 * or a populated object:
 *
 *   { _id, name, code, ... }
 *
 * These helpers safely narrow the union types.
 */
function isProgramme(
  value: string | Programme,
): value is Programme {
  return typeof value !== "string";
}

function isSemester(
  value: string | Semester,
): value is Semester {
  return typeof value !== "string";
}

/*
 * Safely format optional dates.
 */
function formatDate(date?: string) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

export default function CourseViewDialog({
  open,
  onOpenChange,
  course,
}: CourseViewDialogProps) {
  if (!course) {
    return null;
  }

  /*
   * Resolve programme name safely.
   *
   * If the backend populated the reference,
   * display the programme name.
   *
   * If it only returned the ID, display the ID
   * rather than causing a TypeScript/runtime error.
   */
  const programmeName = isProgramme(
    course.programme,
  )
    ? course.programme.name
    : course.programme;

  /*
   * Resolve semester name safely.
   */
  const semesterName = isSemester(
    course.semester,
  )
    ? course.semester.name
    : course.semester;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Course Details
          </DialogTitle>

          <DialogDescription>
            View the complete information for this
            course.
          </DialogDescription>
        </DialogHeader>

        <CardContent className="space-y-6 py-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="text-sm"
                >
                  {course.code}
                </Badge>

                {course.isActive ? (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-600"
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Archived
                  </Badge>
                )}
              </div>

              <h3 className="mt-3 text-xl font-semibold text-brand-navy">
                {course.title}
              </h3>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Programme */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
                    <GraduationCap className="h-5 w-5 text-brand-navy" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">
                      Programme
                    </p>

                    <p className="truncate font-medium text-brand-navy">
                      {programmeName || "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit Units */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
                    <BookOpen className="h-5 w-5 text-brand-navy" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Credit Units
                    </p>

                    <p className="font-medium text-brand-navy">
                      {course.creditUnits}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Semester */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
                    <Calendar className="h-5 w-5 text-brand-navy" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">
                      Semester
                    </p>

                    <p className="truncate font-medium text-brand-navy">
                      {semesterName || "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Level */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
                    <GraduationCap className="h-5 w-5 text-brand-navy" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Level
                    </p>

                    <p className="font-medium text-brand-navy">
                      {course.level}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="space-y-3">
            {/* Category */}
            {course.category && (
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Category
                </p>

                <p className="text-sm text-slate-600">
                  {course.category}
                </p>
              </div>
            )}

            {/* Description */}
            {course.description && (
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Description
                </p>

                <p className="text-sm text-slate-600">
                  {course.description}
                </p>
              </div>
            )}

            {/* Dates */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Created
                </p>

                <p className="text-sm text-slate-600">
                  {formatDate(course.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Last Updated
                </p>

                <p className="text-sm text-slate-600">
                  {formatDate(course.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}

