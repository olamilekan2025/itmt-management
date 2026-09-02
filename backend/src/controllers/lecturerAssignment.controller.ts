import type { Request, Response } from "express";
import { z } from "zod";

import type { AuthRequest } from "../middleware/auth.middleware.js";
import LecturerAssignment from "../models/LecturerAssignment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { notifyAdmins } from "../services/notification.service.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

const assignSchema = z.object({
  lecturer: objectId,
  course: objectId,
  semester: objectId,
});

// Admin/registrar assigns a lecturer to a course for a given semester
export async function assignLecturer(req: Request, res: Response) {
  try {
    const data = assignSchema.parse(req.body);

    const [lecturer, course] = await Promise.all([
      User.findOne({ _id: data.lecturer, role: "lecturer", isActive: true }),
      Course.findOne({ _id: data.course, isActive: true }),
    ]);

    if (!lecturer) {
      return res.status(400).json({
        success: false,
        message: "Lecturer not found or inactive",
      });
    }

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found or inactive",
      });
    }

    if (course.semester.toString() !== data.semester) {
      return res.status(400).json({
        success: false,
        message: "Course does not belong to the selected semester",
      });
    }

    const assignment = await LecturerAssignment.create(data);

    await notifyAdmins({
      title: "New Lecturer Assignment",
      message: `${lecturer.name} was assigned to ${course.code} — ${course.title}.`,
      type: "user",
      link: "/dashboards/admin/lecturers",
    });

    return res.status(201).json({
      success: true,
      message: "Lecturer assigned successfully",
      assignment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      });
    }

    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This lecturer is already assigned to this course for this semester",
      });
    }

    console.error("Assign lecturer error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to assign lecturer",
    });
  }
}

// Admin/registrar views all assignments, optionally filtered
export async function getAssignments(req: Request, res: Response) {
  try {
    const semester =
      typeof req.query.semester === "string" ? req.query.semester : undefined;
    const course =
      typeof req.query.course === "string" ? req.query.course : undefined;

    const assignments = await LecturerAssignment.find({
      isActive: true,
      ...(semester ? { semester } : {}),
      ...(course ? { course } : {}),
    })
      .populate("lecturer", "name email")
      .populate("course", "code title creditUnits")
      .populate("semester", "name order")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve assignments",
    });
  }
}

// Lecturer views their own assigned courses
export async function getMyAssignments(req: AuthRequest, res: Response) {
  try {
    const semester =
      typeof req.query.semester === "string" ? req.query.semester : undefined;

    const assignments = await LecturerAssignment.find({
      lecturer: req.user!.userId,
      isActive: true,
      ...(semester ? { semester } : {}),
    })
      .populate("course", "code title creditUnits level")
      .populate("semester", "name order")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve assignments",
    });
  }
}

// Admin/registrar removes a lecturer assignment
export async function removeAssignment(req: Request, res: Response) {
  const assignment = await LecturerAssignment.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: "Assignment not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Assignment removed successfully",
  });
}