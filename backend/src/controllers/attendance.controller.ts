import type { Response } from "express";
import mongoose, { Types } from "mongoose";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import Attendance, {
  AttendanceStatus,
} from "../models/attendance.model";

import LecturerAssignment from "../models/LecturerAssignment";
import Registration, { IRegistration } from "../models/Registration";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

interface AttendanceRecordInput {
  student: string;
  status: AttendanceStatus;
  note?: string;
}

interface PopulatedStudent {
  _id: Types.ObjectId;
  name: string;
  email: string;
  matricNumber?: string;
  level?: string;
  programme?: Types.ObjectId;
}

/**
 * =========================================================
 * DATE HELPER
 * =========================================================
 */

const normalizeAttendanceDate = (
  value: string | Date,
): Date | null => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setUTCHours(0, 0, 0, 0);

  return date;
};

/**
 * =========================================================
 * LECTURER ID
 * =========================================================
 *
 * AuthRequest is used because authenticate() adds:
 *
 * req.user = {
 *   userId: string;
 *   role: UserRole;
 * }
 *
 * =========================================================
 */

const getLecturerId = (
  req: AuthRequest,
): string | null => {
  const lecturerId = req.user?.userId;

  if (!lecturerId) {
    return null;
  }

  return lecturerId;
};

/**
 * =========================================================
 * VERIFY LECTURER ASSIGNMENT
 * =========================================================
 */

const verifyLecturerAssignment = async (
  lecturerId: string,
  courseId: string,
  semesterId: string,
) => {
  return LecturerAssignment.findOne({
    lecturer: lecturerId,
    course: courseId,
    semester: semesterId,
    isActive: true,
  });
};

/**
 * =========================================================
 * GET ATTENDANCE ROSTER
 * =========================================================
 *
 * GET
 * /api/attendance/roster
 *
 * Query:
 *
 * ?course=COURSE_ID
 * &semester=SEMESTER_ID
 * &date=2026-09-15
 *
 * =========================================================
 */

export const getAttendanceRoster = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const lecturerId = getLecturerId(req);

    if (!lecturerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      course,
      semester,
      date,
    } = req.query;

    /**
     * -----------------------------------------------------
     * VALIDATE QUERY
     * -----------------------------------------------------
     */

    if (
      typeof course !== "string" ||
      typeof semester !== "string" ||
      typeof date !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course, semester and date are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(course) ||
      !mongoose.Types.ObjectId.isValid(semester)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid course or semester",
      });
    }

    /**
     * -----------------------------------------------------
     * NORMALIZE DATE
     * -----------------------------------------------------
     */

    const attendanceDate =
      normalizeAttendanceDate(date);

    if (!attendanceDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date",
      });
    }

    /**
     * -----------------------------------------------------
     * VERIFY ASSIGNMENT
     * -----------------------------------------------------
     */

    const assignment =
      await verifyLecturerAssignment(
        lecturerId,
        course,
        semester,
      );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this course",
      });
    }

    /**
     * -----------------------------------------------------
     * GET REGISTERED STUDENTS
     * -----------------------------------------------------
     */

    const registrations =
      await Registration.find({
        course,
        semester,
        status: "registered",
      })
        .populate(
          "student",
          "name email matricNumber level programme",
        )
        .sort({
          createdAt: 1,
        });

    /**
     * -----------------------------------------------------
     * GET EXISTING ATTENDANCE
     * -----------------------------------------------------
     */

    const studentIds =
      registrations.map(
        (registration: IRegistration) =>
          registration.student,
      );

    const existingAttendance =
      await Attendance.find({
        lecturer: lecturerId,
        course,
        semester,
        date: attendanceDate,
        student: {
          $in: studentIds,
        },
      });

    /**
     * -----------------------------------------------------
     * CREATE ATTENDANCE MAP
     * -----------------------------------------------------
     */

    const attendanceMap =
      new Map<
        string,
        (typeof existingAttendance)[number]
      >();

    for (const record of existingAttendance) {
      attendanceMap.set(
        record.student.toString(),
        record,
      );
    }

    /**
     * -----------------------------------------------------
     * BUILD ROSTER
     * -----------------------------------------------------
     */

    const roster = registrations.map(
      (registration: IRegistration) => {
        const student =
          registration.student as unknown as PopulatedStudent;

        const attendance =
          attendanceMap.get(
            student._id.toString(),
          );

        return {
          student: {
            _id: student._id,
            name: student.name,
            email: student.email,
            matricNumber:
              student.matricNumber,
            level: student.level,
          },

          attendance: attendance
            ? {
                _id: attendance._id,
                status: attendance.status,
                note:
                  attendance.note ?? "",
              }
            : null,
        };
      },
    );

    /**
     * -----------------------------------------------------
     * RESPONSE
     * -----------------------------------------------------
     */

    return res.status(200).json({
      success: true,
      date: attendanceDate,
      roster,
    });
  } catch (error) {
    console.error(
      "Get attendance roster error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load attendance roster",
    });
  }
};

/**
 * =========================================================
 * SAVE ATTENDANCE
 * =========================================================
 *
 * POST
 * /api/attendance
 *
 * Body:
 *
 * {
 *   course: "...",
 *   semester: "...",
 *   date: "2026-09-15",
 *   records: [
 *     {
 *       student: "...",
 *       status: "present"
 *     }
 *   ]
 * }
 *
 * =========================================================
 */

export const saveAttendance = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const lecturerId = getLecturerId(req);

    if (!lecturerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      course,
      semester,
      date,
      records,
    } = req.body;

    /**
     * -----------------------------------------------------
     * VALIDATE REQUEST
     * -----------------------------------------------------
     */

    if (
      typeof course !== "string" ||
      typeof semester !== "string" ||
      typeof date !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course, semester and date are required",
      });
    }

    if (!Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message:
          "Attendance records are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(course) ||
      !mongoose.Types.ObjectId.isValid(semester)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid course or semester",
      });
    }

    /**
     * -----------------------------------------------------
     * NORMALIZE DATE
     * -----------------------------------------------------
     */

    const attendanceDate =
      normalizeAttendanceDate(date);

    if (!attendanceDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date",
      });
    }

    /**
     * -----------------------------------------------------
     * VERIFY LECTURER ASSIGNMENT
     * -----------------------------------------------------
     */

    const assignment =
      await verifyLecturerAssignment(
        lecturerId,
        course,
        semester,
      );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this course",
      });
    }

    /**
     * -----------------------------------------------------
     * GET REGISTERED STUDENTS
     * -----------------------------------------------------
     */

    const registrations =
      await Registration.find({
        course,
        semester,
        status: "registered",
      }).select("student");

    const registeredStudentIds =
      new Set(
        registrations.map(
          (registration: IRegistration) =>
            registration.student.toString(),
        ),
      );

    /**
     * -----------------------------------------------------
     * VALID STATUSES
     * -----------------------------------------------------
     */

    const validStatuses: AttendanceStatus[] = [
      "present",
      "absent",
      "late",
      "excused",
    ];

    /**
     * -----------------------------------------------------
     * VALIDATE EACH RECORD
     * -----------------------------------------------------
     */

    const seenStudents =
      new Set<string>();

    for (
      const record of records as AttendanceRecordInput[]
    ) {
      if (
        !record ||
        typeof record.student !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Every attendance record must contain a valid student",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          record.student,
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid student ID",
        });
      }

      /**
       * Prevent duplicate student records.
       */

      if (
        seenStudents.has(record.student)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A student appears more than once in the attendance records",
        });
      }

      seenStudents.add(record.student);

      /**
       * Student must be registered.
       */

      if (
        !registeredStudentIds.has(
          record.student,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Attendance can only be recorded for registered students",
        });
      }

      /**
       * Validate status.
       */

      if (
        !validStatuses.includes(
          record.status,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid attendance status",
        });
      }

      /**
       * Validate note.
       */

      if (
        record.note !== undefined &&
        typeof record.note !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Attendance note must be text",
        });
      }

      if (
        record.note &&
        record.note.length > 500
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Attendance note cannot exceed 500 characters",
        });
      }
    }

    /**
     * -----------------------------------------------------
     * SAVE / UPDATE RECORDS
     * -----------------------------------------------------
     */

    const operations =
      (
        records as AttendanceRecordInput[]
      ).map((record) => ({
        updateOne: {
          filter: {
            student: new Types.ObjectId(record.student),
            lecturer: new Types.ObjectId(lecturerId),
            course: new Types.ObjectId(course),
            semester: new Types.ObjectId(semester),
            date: attendanceDate,
          },

          update: {
            $set: {
              student: new Types.ObjectId(record.student),
              lecturer: new Types.ObjectId(lecturerId),
              course: new Types.ObjectId(course),
              semester: new Types.ObjectId(semester),
              date: attendanceDate,
              status: record.status,
              note:
                record.note?.trim() ||
                undefined,
            },
          },

          upsert: true,
        },
      }));

    if (operations.length > 0) {
      await Attendance.bulkWrite(
        operations,
      );
    }

    /**
     * -----------------------------------------------------
     * GET SAVED ATTENDANCE
     * -----------------------------------------------------
     */

    const savedAttendance =
      await Attendance.find({
        lecturer: lecturerId,
        course,
        semester,
        date: attendanceDate,
      })
        .populate(
          "student",
          "name email matricNumber level",
        )
        .sort({
          createdAt: 1,
        });

    /**
     * -----------------------------------------------------
     * RESPONSE
     * -----------------------------------------------------
     */

    return res.status(200).json({
      success: true,
      message:
        "Attendance saved successfully",
      attendance: savedAttendance,
    });
  } catch (error) {
    console.error(
      "Save attendance error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to save attendance",
    });
  }
};

/**
 * =========================================================
 * GET ATTENDANCE HISTORY
 * =========================================================
 *
 * GET
 * /api/attendance/history
 *
 * Query:
 *
 * ?course=COURSE_ID&semester=SEMESTER_ID
 *
 * =========================================================
 */

export const getAttendanceHistory =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const lecturerId =
        getLecturerId(req);

      if (!lecturerId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const {
        course,
        semester,
      } = req.query;

      /**
       * -----------------------------------------------------
       * VALIDATE QUERY
       * -----------------------------------------------------
       */

      if (
        typeof course !== "string" ||
        typeof semester !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Course and semester are required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          course,
        ) ||
        !mongoose.Types.ObjectId.isValid(
          semester,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid course or semester",
        });
      }

      /**
       * -----------------------------------------------------
       * VERIFY ASSIGNMENT
       * -----------------------------------------------------
       */

      const assignment =
        await verifyLecturerAssignment(
          lecturerId,
          course,
          semester,
        );

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to this course",
        });
      }

      /**
       * -----------------------------------------------------
       * GET ATTENDANCE
       * -----------------------------------------------------
       */

      const attendance =
        await Attendance.find({
          lecturer: lecturerId,
          course,
          semester,
        })
          .populate(
            "student",
            "name email matricNumber level",
          )
          .sort({
            date: -1,
            createdAt: 1,
          });

      /**
       * -----------------------------------------------------
       * GROUP BY DATE
       * -----------------------------------------------------
       */

      const grouped =
        new Map<
          string,
          {
            date: Date;
            total: number;
            present: number;
            absent: number;
            late: number;
            excused: number;
          }
        >();

      for (const record of attendance) {
        const key =
          record.date
            .toISOString()
            .slice(0, 10);

        if (!grouped.has(key)) {
          grouped.set(key, {
            date: record.date,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
          });
        }

        const session =
          grouped.get(key)!;

        session.total += 1;

        if (record.status === "present") {
          session.present += 1;
        }

        if (record.status === "absent") {
          session.absent += 1;
        }

        if (record.status === "late") {
          session.late += 1;
        }

        if (record.status === "excused") {
          session.excused += 1;
        }
      }

      const history =
        Array.from(
          grouped.values(),
        ).sort(
          (a, b) =>
            b.date.getTime() -
            a.date.getTime(),
        );

      /**
       * -----------------------------------------------------
       * RESPONSE
       * -----------------------------------------------------
       */

      return res.status(200).json({
        success: true,
        history,
        records: attendance,
      });
    } catch (error) {
      console.error(
        "Get attendance history error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load attendance history",
      });
    }
  };