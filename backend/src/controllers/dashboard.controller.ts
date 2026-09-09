import type { Response } from "express";

import User from "../models/User.js";
import Admission from "../models/Admission.js";
import Registration from "../models/Registration.js";
import Programme from "../models/Programme.js";

import type { AuthRequest } from "../middleware/auth.middleware.js";

export async function getRegistrarDashboard(
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
     * DASHBOARD STATISTICS
     * ---------------------------------------------------------
     *
     * Run all independent queries together for better performance.
     */

    const [
      totalStudents,
      pendingAdmissions,
      totalRegistrations,
      activeProgrammes,
    ] = await Promise.all([
      // Active, non-suspended students
      User.countDocuments({
        role: "student",
        isActive: true,
        isSuspended: false,
      }),

      // Admissions waiting for registrar/admin action
      Admission.countDocuments({
        status: "PENDING",
      }),

      // Currently registered course registrations
      Registration.countDocuments({
        status: "registered",
      }),

      // Active programmes
      Programme.countDocuments({
        isActive: true,
      }),
    ]);

    /**
     * ---------------------------------------------------------
     * RECENT ADMISSIONS
     * ---------------------------------------------------------
     */

    const recentAdmissions = await Admission.find({})
      .select(
        [
          "_id",
          "applicationNumber",
          "firstName",
          "lastName",
          "middleName",
          "email",
          "status",
          "submittedAt",
          "createdAt",
          "reviewedAt",
        ].join(" "),
      )
      .populate("programme", "name code")
      .populate("department", "name code")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    /**
     * ---------------------------------------------------------
     * RECENT REGISTRATIONS
     * ---------------------------------------------------------
     */

    const recentRegistrations = await Registration.find({
      status: "registered",
    })
      .select(
        [
          "_id",
          "student",
          "course",
          "semester",
          "programme",
          "status",
          "createdAt",
        ].join(" "),
      )
      .populate("student", "name email matricNumber")
      .populate("course", "title code courseCode")
      .populate("semester", "name number")
      .populate("programme", "name code")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    /**
     * ---------------------------------------------------------
     * RECENT ACTIVITY
     * ---------------------------------------------------------
     *
     * Combine admissions and registrations into one activity
     * feed and sort by date.
     */

    const admissionActivities = recentAdmissions.map((admission) => {
      const applicantName = [
        admission.firstName,
        admission.middleName,
        admission.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      return {
        id: admission._id.toString(),
        type: "admission" as const,
        title: applicantName || "New admission application",
        description: `Application ${admission.applicationNumber}`,
        status: admission.status,
        date: admission.createdAt || admission.submittedAt,
      };
    });

    const registrationActivities = recentRegistrations.map(
      (registration) => {
        const student =
          registration.student &&
          typeof registration.student === "object" &&
          "name" in registration.student
            ? registration.student
            : null;

        const course =
          registration.course &&
          typeof registration.course === "object" &&
          "title" in registration.course
            ? registration.course
            : null;

        const studentName =
          student && "name" in student
            ? String(student.name)
            : "Student";

        const courseName =
          course && "title" in course
            ? String(course.title)
            : "course";

        return {
          id: registration._id.toString(),
          type: "registration" as const,
          title: `${studentName} registered`,
          description: courseName,
          status: registration.status,
          date: registration.createdAt,
        };
      },
    );

    const recentActivity = [
      ...admissionActivities,
      ...registrationActivities,
    ]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime(),
      )
      .slice(0, 8);

    /**
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          pendingAdmissions,
          totalRegistrations,
          activeProgrammes,
        },

        recentActivity,

        recentAdmissions,
        recentRegistrations,
      },
    });
  } catch (error) {
    console.error(
      "Get registrar dashboard error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load registrar dashboard",
    });
  }
}

