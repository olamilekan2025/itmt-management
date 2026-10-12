import type { Response } from "express";

import User from "../models/User.js";
import Programme from "../models/Programme.js";
import Course from "../models/Course.js";
import Registration from "../models/Registration.js";
import Result from "../models/Result.js";
import Admission from "../models/Admission.js";
import Payment from "../models/Payment.js";

import type { AuthRequest } from "../middleware/auth.middleware.js";

/**
 * =========================================================
 * GET SYSTEM REPORT
 * =========================================================
 *
 * GET /api/reports/system
 *
 * Provides comprehensive system-wide statistics and metrics.
 */
export async function getSystemReport(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /**
     * ---------------------------------------------------------
     * SYSTEM STATISTICS
     * ---------------------------------------------------------
     *
     * Run all independent queries together for better performance.
     */

    const [
      totalUsers,
      totalStudents,
      totalStaff,
      totalLecturers,
      totalProgrammes,
      totalCourses,
      totalRegistrations,
      totalResults,
      totalAdmissions,
      totalPayments,
      activeStudents,
      suspendedStudents,
      pendingAdmissions,
      publishedResults,
    ] = await Promise.all([
      // Total users
      User.countDocuments(),

      // Total students
      User.countDocuments({ role: "student" }),

      // Total staff (admin, registrar, finance, lecturer)
      User.countDocuments({
        role: { $in: ["admin", "registrar", "finance", "lecturer"] },
      }),

      // Total lecturers
      User.countDocuments({ role: "lecturer" }),

      // Total programmes
      Programme.countDocuments(),

      // Total courses
      Course.countDocuments(),

      // Total registrations
      Registration.countDocuments(),

      // Total results
      Result.countDocuments(),

      // Total admissions
      Admission.countDocuments(),

      // Total payments
      Payment.countDocuments(),

      // Active students
      User.countDocuments({
        role: "student",
        isActive: true,
        isSuspended: false,
      }),

      // Suspended students
      User.countDocuments({
        role: "student",
        isSuspended: true,
      }),

      // Pending admissions
      Admission.countDocuments({ status: "PENDING" }),

      // Published results
      Result.countDocuments({ status: "published" }),
    ]);

    /**
     * ---------------------------------------------------------
     * PROGRAMME DISTRIBUTION
     * ---------------------------------------------------------
     */

    const programmeDistribution = await Programme.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "programme",
          as: "students",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          studentCount: { $size: "$students" },
          isActive: 1,
        },
      },
      {
        $sort: { studentCount: -1 },
      },
    ]);

    /**
     * ---------------------------------------------------------
     * RECENT ACTIVITY
     * ---------------------------------------------------------
     */

    const recentAdmissions = await Admission.find()
      .select(
        ["_id", "applicationNumber", "firstName", "lastName", "status", "createdAt"].join(" "),
      )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentRegistrations = await Registration.find()
      .select(["_id", "student", "course", "status", "createdAt"].join(" "))
      .populate("student", "name matricNumber")
      .populate("course", "code title")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentPayments = await Payment.find()
      .select(["_id", "student", "amount", "status", "createdAt"].join(" "))
      .populate("student", "name matricNumber")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    /**
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalStudents,
          totalStaff,
          totalLecturers,
          totalProgrammes,
          totalCourses,
          totalRegistrations,
          totalResults,
          totalAdmissions,
          totalPayments,
          activeStudents,
          suspendedStudents,
          pendingAdmissions,
          publishedResults,
        },

        programmeDistribution,

        recentActivity: {
          admissions: recentAdmissions,
          registrations: recentRegistrations,
          payments: recentPayments,
        },
      },
    });
  } catch (error) {
    console.error("Get system report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load system report",
    });
  }
}

/**
 * =========================================================
 * GET STUDENT REPORT
 * =========================================================
 *
 * GET /api/reports/students
 *
 * Provides comprehensive student statistics and performance data.
 */
export async function getStudentReport(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /**
     * ---------------------------------------------------------
     * STUDENT STATISTICS
     * ---------------------------------------------------------
     */

    const [
      totalStudents,
      activeStudents,
      suspendedStudents,
      studentsWithMatric,
      studentsByLevel,
    ] = await Promise.all([
      // Total students
      User.countDocuments({ role: "student" }),

      // Active students
      User.countDocuments({
        role: "student",
        isActive: true,
        isSuspended: false,
      }),

      // Suspended students
      User.countDocuments({
        role: "student",
        isSuspended: true,
      }),

      // Students with matric numbers
      User.countDocuments({
        role: "student",
        matricNumber: { $exists: true, $ne: "" },
      }),

      // Students by level
      User.aggregate([
        { $match: { role: "student" } },
        {
          $group: {
            _id: "$level",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),
    ]);

    /**
     * ---------------------------------------------------------
     * STUDENT PROGRAMME DISTRIBUTION
     * ---------------------------------------------------------
     */

    const studentsByProgramme = await Programme.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "programme",
          as: "students",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          studentCount: { $size: "$students" },
          isActive: 1,
        },
      },
      {
        $sort: { studentCount: -1 },
      },
    ]);

    /**
     * ---------------------------------------------------------
     * STUDENT PERFORMANCE
     * ---------------------------------------------------------
     */

    const studentPerformance = await Result.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      {
        $unwind: "$studentInfo",
      },
      {
        $match: {
          "studentInfo.role": "student",
          status: "published",
        },
      },
      {
        $group: {
          _id: "$student",
          studentName: { $first: "$studentInfo.name" },
          matricNumber: { $first: "$studentInfo.matricNumber" },
          totalResults: { $sum: 1 },
          totalScore: { $sum: "$score" },
          passed: {
            $sum: {
              $cond: [{ $ne: ["$grade", "F"] }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ["$grade", "F"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          studentName: 1,
          matricNumber: 1,
          totalResults: 1,
          averageScore: { $divide: ["$totalScore", "$totalResults"] },
          passed: 1,
          failed: 1,
          passRate: {
            $multiply: [
              { $divide: ["$passed", "$totalResults"] },
              100,
            ],
          },
        },
      },
      {
        $sort: { averageScore: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    /**
     * ---------------------------------------------------------
     * RECENT STUDENT ACTIVITY
     * ---------------------------------------------------------
     */

    const recentStudents = await User.find({ role: "student" })
      .select(["_id", "name", "email", "matricNumber", "level", "isActive", "createdAt"].join(" "))
      .populate("programme", "name code")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    /**
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalStudents,
          activeStudents,
          suspendedStudents,
          studentsWithMatric,
          studentsByLevel,
        },

        studentsByProgramme,

        studentPerformance,

        recentStudents,
      },
    });
  } catch (error) {
    console.error("Get student report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load student report",
    });
  }
}
