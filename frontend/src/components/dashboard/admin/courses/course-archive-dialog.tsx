"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import type { Course } from "@/lib/admin-courses";
import { archiveCourse } from "@/lib/admin-courses";

interface CourseArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  accessToken: string;
  onSuccess: () => void;
}

export default function CourseArchiveDialog({
  open,
  onOpenChange,
  course,
  accessToken,
  onSuccess,
}: CourseArchiveDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleArchive() {
    if (!course) return;

    setLoading(true);
    setError(null);

    try {
      await archiveCourse(course._id, accessToken);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to archive course. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {course.isActive ? "Archive course?" : "Restore course?"}
          </DialogTitle>
          <DialogDescription>
            {course.isActive
              ? "This course will no longer appear as an active course in the catalogue. You can restore it later if needed."
              : "This course will be restored and will appear as an active course in the catalogue."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-medium text-brand-navy">{course.code}</p>
          <p className="text-sm text-slate-600">{course.title}</p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleArchive}
            disabled={loading}
            variant={course.isActive ? "destructive" : "default"}
          >
            {loading
              ? "Processing..."
              : course.isActive
              ? "Archive Course"
              : "Restore Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
