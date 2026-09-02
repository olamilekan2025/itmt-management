import type { Request, Response } from "express";
import { z } from "zod";

import type { AuthRequest } from "../middleware/auth.middleware.js";
import Registration from "../models/Registration.js";
import Course from "../models/Course.js";
import Semester from "../models/Semester.js";
import User from "../models/User.js";
import LecturerAssignment from "../models/LecturerAssignment.js";
import { notifyAdmins } from "../services/notification.service.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

const MAX_CREDIT_UNITS = 24;

const registerSchema = z.object({
  semester: objectId,
  courses: z.array(objectId).min(1, "Select at least one course"),
});

// Student registers for one or more courses in a semester
export async function registerCourses(req: AuthRequest, res: Response) {
  try {
    const data = registerSchema.parse(req.body);
    const studentId = req.user!.userId;

    const student = await User.findById(studentId);

    if (!student || !student.programme) {
      return res.status(400).json({
        success: false,
        message: "Student profile has no programme assigned",
      });
    }

    const studentProgramme = student.programme;

    const semester = await Semester.findById(data.semester);
    if (!semester) {
      return res.status(400).json({
        success: false,
        message: "Semester not found",
      });
    }

    // ...rest of the function is unchanged, just replace
    // every remaining `studentId` and `studentProgramme` reference
    // as they already exist below this point

    const courses = await Course.find({
      _id: { $in: data.courses },
      isActive: true,
    });

    if (courses.length !== data.courses.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected courses are invalid or inactive",
      });
    }

    const mismatched = courses.find(
      (c) =>
        c.semester.toString() !== data.semester ||
        c.programme.toString() !== studentProgramme.toString(),
    );

    if (mismatched) {
      return res.status(400).json({
        success: false,
        message: `Course ${mismatched.code} does not belong to your programme/semester`,
      });
    }

    const existing = await Registration.find({
      student: studentId,
      semester: data.semester,
      status: "registered",
    }).populate("course", "creditUnits code");

    const existingCourseIds = existing.map((r) => r.course._id.toString());
    const duplicate = data.courses.find((id) =>
      existingCourseIds.includes(id),
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for one of these courses",
      });
    }

    const existingUnits = existing.reduce(
      (sum, r: any) => sum + (r.course?.creditUnits || 0),
      0,
    );
    const newUnits = courses.reduce((sum, c) => sum + c.creditUnits, 0);

    if (existingUnits + newUnits > MAX_CREDIT_UNITS) {
      return res.status(400).json({
        success: false,
        message: `Registration exceeds maximum of ${MAX_CREDIT_UNITS} credit units for the semester`,
      });
    }

    const registrations = await Registration.insertMany(
      data.courses.map((courseId) => ({
        student: studentId,
        course: courseId,
        semester: data.semester,
        programme: studentProgramme,
      })),
    );

    await notifyAdmins({
      title: "New Course Registration",
      message: `${student.name} registered for ${registrations.length} course${registrations.length === 1 ? "" : "s"}.`,
      type: "registration",
      link: "/dashboards/admin/registrations",
    });

    return res.status(201).json({
      success: true,
      message: "Courses registered successfully",
      registrations,
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
        message: "Duplicate registration detected",
      });
    }

    console.error("Register courses error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register courses",
    });
  }
}


// Admin/registrar views all registrations for a course or semester
export async function getRegistrations(req: Request, res: Response) {
  try {
    const course =
      typeof req.query.course === "string" ? req.query.course : undefined;
    const semester =
      typeof req.query.semester === "string" ? req.query.semester : undefined;

 const registrations = await Registration.find({
  status: "registered",
  ...(course ? { course } : {}),
  ...(semester ? { semester } : {}),
})
  .populate("student", "name email matricNumber")
  .populate("course", "code title creditUnits")
  .populate("semester", "name order")
  .populate("programme", "name code")
  .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      registrations,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve registrations",
    });
  }
}

// Student views their own registrations, optionally filtered by semester
// Student views their own registrations, optionally filtered by semester
export async function getMyRegistrations(req: AuthRequest, res: Response) {
  try {
    const semester =
      typeof req.query.semester === "string" ? req.query.semester : undefined;

    const registrations = await Registration.find({
      student: req.user!.userId,
      status: "registered",
      ...(semester ? { semester } : {}),
    })
      .populate("course", "code title creditUnits")
      .populate("semester", "name order")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      registrations,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve registrations",
    });
  }
}

// Student drops a course
// Student drops a course
export async function dropRegistration(req: AuthRequest, res: Response) {
  try {
    const registration = await Registration.findOne({
      _id: req.params.id,
      student: req.user!.userId,
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    registration.status = "dropped";
    await registration.save();

    return res.status(200).json({
      success: true,
      message: "Course dropped successfully",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to drop course",
    });
  }
}


// Lecturer views registered students for a course they teach, to enter scores
export async function getCourseRoster(req: AuthRequest, res: Response) {
  try {
    const course =
      typeof req.query.course === "string" ? req.query.course : undefined;
    const semester =
      typeof req.query.semester === "string" ? req.query.semester : undefined;

    if (!course || !semester) {
      return res.status(400).json({
        success: false,
        message: "course and semester query parameters are required",
      });
    }

    const assignment = await LecturerAssignment.findOne({
      lecturer: req.user!.userId,
      course,
      semester,
      isActive: true,
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this course for this semester",
      });
    }

    const registrations = await Registration.find({
      course,
      semester,
      status: "registered",
    }).populate("student", "name email matricNumber");

    return res.status(200).json({
      success: true,
      roster: registrations.map((r) => ({
        registrationId: r._id,
        student: r.student,
      })),
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve course roster",
    });
  }
}