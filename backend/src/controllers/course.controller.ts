import type { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";

import Course from "../models/Course.js";
import Programme from "../models/Programme.js";
import Semester from "../models/Semester.js";

import { notifyAdmins } from "../services/notification.service.js";
import { createAuditLog } from "../services/auditLog.service.js";

import type { AuthRequest } from "../middleware/auth.middleware.js";

/**
 * =========================================================
 * VALIDATION
 * =========================================================
 */

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID");

const courseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Course code must be at least 2 characters")
    .max(20, "Course code is too long"),

  title: z
    .string()
    .trim()
    .min(2, "Course title must be at least 2 characters")
    .max(150, "Course title is too long"),

  programme: objectId,

  semester: objectId,

  level: z
    .string()
    .trim()
    .min(1, "Level is required")
    .max(50, "Level is too long"),

  creditUnits: z
    .number()
    .int("Credit units must be a whole number")
    .min(1, "Credit units must be at least 1")
    .max(12, "Credit units cannot exceed 12"),

  category: z
    .string()
    .trim()
    .max(50, "Category is too long")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional(),
});

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

/**
 * Escape user input before using it inside
 * a MongoDB regular expression.
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validate MongoDB ObjectId.
 */
function isValidObjectId(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    mongoose.Types.ObjectId.isValid(value)
  );
}

/**
 * Get a route parameter safely.
 */
function getRouteId(
  req: Request,
): string | null {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    return null;
  }

  return id.trim();
}

/**
 * Detect MongoDB duplicate-key errors.
 */
function isDuplicateKeyError(
  error: unknown,
): error is {
  code: 11000;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

/**
 * Notify administrators without allowing a
 * notification failure to break the main operation.
 */
async function safelyNotifyAdmins(
  options: Parameters<typeof notifyAdmins>[0],
): Promise<void> {
  try {
    await notifyAdmins(options);
  } catch (error) {
    console.error(
      "Admin notification error:",
      error,
    );
  }
}

/**
 * Validate programme and semester references.
 *
 * Programme must be active.
 * Semester only needs to exist.
 */
async function validateReferences(
  programmeId: string,
  semesterId: string,
) {
  const [
    programme,
    semester,
  ] = await Promise.all([
    Programme.findOne({
      _id: programmeId,
      isActive: true,
    }),

    Semester.findById(
      semesterId,
    ),
  ]);

  return {
    programme,
    semester,
  };
}

/**
 * =========================================================
 * CREATE COURSE
 * =========================================================
 *
 * POST /api/courses
 *
 * Admin only.
 */

export async function createCourse(
  req: AuthRequest,
  res: Response,
) {
  try {
    /**
     * -------------------------------------------------------
     * VALIDATE BODY
     * -------------------------------------------------------
     */

    const data =
      courseSchema.parse(
        req.body,
      );

    /**
     * -------------------------------------------------------
     * VALIDATE REFERENCES
     * -------------------------------------------------------
     */

    const {
      programme,
      semester,
    } =
      await validateReferences(
        data.programme,
        data.semester,
      );

    if (!programme) {
      return res.status(400).json({
        success: false,
        message:
          "Programme not found or inactive",
      });
    }

    if (!semester) {
      return res.status(400).json({
        success: false,
        message:
          "Semester not found",
      });
    }

    /**
     * -------------------------------------------------------
     * CREATE COURSE
     * -------------------------------------------------------
     */

    const course =
      await Course.create({
        ...data,

        code:
          data.code
            .trim()
            .toUpperCase(),
      });

    /**
     * -------------------------------------------------------
     * AUDIT
     * -------------------------------------------------------
     *
     * IMPORTANT:
     * createAuditLog() already protects the main
     * operation from audit failures.
     */

    await createAuditLog({
      req,

      actorId:
        req.user?.userId,

      actorRole:
        req.user?.role,

      action:
        "CREATE",

      module:
        "COURSES",

      description:
        `Course ${course.code} — ${course.title} was created.`,

      targetType:
        "Course",

      targetId:
        course._id.toString(),

      metadata: {
        courseId:
          course._id.toString(),

        code:
          course.code,

        title:
          course.title,

        programmeId:
          programme._id.toString(),

        programmeName:
          programme.name,

        programmeCode:
          programme.code,

        semesterId:
          semester._id.toString(),

        level:
          course.level,

        creditUnits:
          course.creditUnits,

        category:
          course.category,

        description:
          course.description,
      },

      status:
        "success",
    });

    /**
     * -------------------------------------------------------
     * NOTIFY ADMINS
     * -------------------------------------------------------
     */

    await safelyNotifyAdmins({
      title:
        "Course Created",

      message:
        `Course ${course.code} — ${course.title} was created.`,

      type:
        "course",

      link:
        "/dashboards/admin/courses",
    });

    /**
     * -------------------------------------------------------
     * RESPONSE
     * -------------------------------------------------------
     */

    return res.status(201).json({
      success: true,

      message:
        "Course created successfully",

      course,
    });
  } catch (error) {
    /**
     * -------------------------------------------------------
     * VALIDATION ERROR
     * -------------------------------------------------------
     */

    if (
      error instanceof z.ZodError
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Validation failed",

        errors:
          error.flatten().fieldErrors,
      });
    }

    /**
     * -------------------------------------------------------
     * DUPLICATE COURSE
     * -------------------------------------------------------
     */

    if (
      isDuplicateKeyError(error)
    ) {
      return res.status(409).json({
        success: false,

        message:
          "This course code already exists for the selected programme and semester",
      });
    }

    console.error(
      "Create course error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to create course",
    });
  }
}

/**
 * =========================================================
 * GET COURSES
 * =========================================================
 *
 * GET /api/courses
 *
 * Supports:
 *
 * ?programme=
 * ?semester=
 * ?level=
 * ?status=active
 * ?status=archived
 * ?search=
 */

export async function getCourses(
  req: Request,
  res: Response,
) {
  try {
    const programme =
      typeof req.query.programme === "string"
        ? req.query.programme.trim()
        : undefined;

    const semester =
      typeof req.query.semester === "string"
        ? req.query.semester.trim()
        : undefined;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const level =
      typeof req.query.level === "string"
        ? req.query.level.trim()
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? req.query.status.trim().toLowerCase()
        : undefined;

    /**
     * -------------------------------------------------------
     * VALIDATE FILTER IDS
     * -------------------------------------------------------
     */

    if (
      programme &&
      !isValidObjectId(programme)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid programme ID",
      });
    }

    if (
      semester &&
      !isValidObjectId(semester)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid semester ID",
      });
    }

    /**
     * -------------------------------------------------------
     * BUILD QUERY
     * -------------------------------------------------------
     */

    const query: Record<
      string,
      unknown
    > = {};

    if (programme) {
      query.programme =
        programme;
    }

    if (semester) {
      query.semester =
        semester;
    }

    if (level) {
      query.level =
        level;
    }

    /**
     * -------------------------------------------------------
     * STATUS FILTER
     * -------------------------------------------------------
     */

    if (
      status === "active"
    ) {
      query.isActive = true;
    }

    if (
      status === "archived"
    ) {
      query.isActive = false;
    }

    /**
     * -------------------------------------------------------
     * SEARCH
     * -------------------------------------------------------
     */

    if (search) {
      const safeSearch =
        escapeRegex(search);

      query.$or = [
        {
          code: {
            $regex:
              safeSearch,
            $options:
              "i",
          },
        },

        {
          title: {
            $regex:
              safeSearch,
            $options:
              "i",
          },
        },

        {
          description: {
            $regex:
              safeSearch,
            $options:
              "i",
          },
        },
      ];
    }

    /**
     * -------------------------------------------------------
     * DATABASE QUERY
     * -------------------------------------------------------
     */

    const courses =
      await Course.find(
        query,
      )
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "semester",
          "name order",
        )
        .sort({
          code: 1,
        });

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error(
      "Get courses error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve courses",
    });
  }
}

/**
 * =========================================================
 * GET PUBLIC COURSES
 * =========================================================
 *
 * GET /api/courses/public
 *
 * Only active courses are returned.
 *
 * Supports:
 *
 * ?programme=
 * ?semester=
 * ?level=
 * ?search=
 */

export async function getPublicCourses(
  req: Request,
  res: Response,
) {
  try {
    const programme =
      typeof req.query.programme === "string"
        ? req.query.programme.trim()
        : undefined;

    const semester =
      typeof req.query.semester === "string"
        ? req.query.semester.trim()
        : undefined;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const level =
      typeof req.query.level === "string"
        ? req.query.level.trim()
        : undefined;

    /**
     * -------------------------------------------------------
     * VALIDATE FILTER IDS
     * -------------------------------------------------------
     */

    if (
      programme &&
      !isValidObjectId(programme)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid programme ID",
      });
    }

    if (
      semester &&
      !isValidObjectId(semester)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid semester ID",
      });
    }

    /**
     * -------------------------------------------------------
     * QUERY
     * -------------------------------------------------------
     */

    const query: Record<
      string,
      unknown
    > = {
      isActive: true,
    };

    if (programme) {
      query.programme =
        programme;
    }

    if (semester) {
      query.semester =
        semester;
    }

    if (level) {
      query.level =
        level;
    }

    /**
     * -------------------------------------------------------
     * SEARCH
     * -------------------------------------------------------
     */

    if (search) {
      const safeSearch =
        escapeRegex(search);

      query.$or = [
        {
          code: {
            $regex:
              safeSearch,
            $options:
              "i",
          },
        },

        {
          title: {
            $regex:
              safeSearch,
            $options:
              "i",
          },
        },

        {
          description: {
            $regex:
              safeSearch,
            $options:
              "i",
          },
        },
      ];
    }

    /**
     * -------------------------------------------------------
     * DATABASE QUERY
     * -------------------------------------------------------
     */

    const courses =
      await Course.find(
        query,
      )
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "semester",
          "name order",
        )
        .sort({
          code: 1,
        });

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error(
      "Get public courses error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve courses",
    });
  }
}

/**
 * =========================================================
 * UPDATE COURSE
 * =========================================================
 *
 * PATCH /api/courses/:id
 */

export async function updateCourse(
  req: AuthRequest,
  res: Response,
) {
  try {
    /**
     * -------------------------------------------------------
     * GET COURSE ID
     * -------------------------------------------------------
     */

    const id =
      getRouteId(
        req,
      );

    if (!id) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid course ID",
      });
    }

    /**
     * -------------------------------------------------------
     * VALIDATE COURSE ID
     * -------------------------------------------------------
     */

    if (
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid course ID",
      });
    }

    /**
     * -------------------------------------------------------
     * VALIDATE BODY
     * -------------------------------------------------------
     */

    const data =
      courseSchema
        .partial()
        .parse(
          req.body,
        );

    /**
     * -------------------------------------------------------
     * PREVENT EMPTY UPDATE
     * -------------------------------------------------------
     */

    if (
      Object.keys(data).length === 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "No course changes were provided",
      });
    }

    /**
     * -------------------------------------------------------
     * FIND COURSE
     * -------------------------------------------------------
     */

    const course =
      await Course.findById(
        id,
      );

    if (!course) {
      return res.status(404).json({
        success: false,

        message:
          "Course not found",
      });
    }

    /**
     * -------------------------------------------------------
     * DETERMINE REFERENCES
     * -------------------------------------------------------
     */

    const programmeId =
      data.programme ??
      course.programme.toString();

    const semesterId =
      data.semester ??
      course.semester.toString();

    /**
     * -------------------------------------------------------
     * VALIDATE REFERENCES
     * -------------------------------------------------------
     */

    if (
      !isValidObjectId(
        programmeId,
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid programme ID",
      });
    }

    if (
      !isValidObjectId(
        semesterId,
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid semester ID",
      });
    }

    const {
      programme,
      semester,
    } =
      await validateReferences(
        programmeId,
        semesterId,
      );

    if (!programme) {
      return res.status(400).json({
        success: false,

        message:
          "Programme not found or inactive",
      });
    }

    if (!semester) {
      return res.status(400).json({
        success: false,

        message:
          "Semester not found",
      });
    }

    /**
     * -------------------------------------------------------
     * TRACK CHANGES
     * -------------------------------------------------------
     */

    const changedFields =
      Object.keys(data);

    /**
     * -------------------------------------------------------
     * UPDATE COURSE
     * -------------------------------------------------------
     */

    if (
      data.code !== undefined
    ) {
      course.code =
        data.code
          .trim()
          .toUpperCase();
    }

    if (
      data.title !== undefined
    ) {
      course.title =
        data.title;
    }

    if (
      data.programme !== undefined
    ) {
      course.programme =
        programme._id;
    }

    if (
      data.semester !== undefined
    ) {
      course.semester =
        semester._id;
    }

    if (
      data.level !== undefined
    ) {
      course.level =
        data.level;
    }

    if (
      data.creditUnits !== undefined
    ) {
      course.creditUnits =
        data.creditUnits;
    }

    if (
      data.category !== undefined
    ) {
      course.category =
        data.category;
    }

    if (
      data.description !== undefined
    ) {
      course.description =
        data.description;
    }

    await course.save();

    /**
     * -------------------------------------------------------
     * AUDIT
     * -------------------------------------------------------
     */

    await createAuditLog({
      req,

      actorId:
        req.user?.userId,

      actorRole:
        req.user?.role,

      action:
        "UPDATE",

      module:
        "COURSES",

      description:
        `Course ${course.code} — ${course.title} was updated.`,

      targetType:
        "Course",

      targetId:
        course._id.toString(),

      metadata: {
        courseId:
          course._id.toString(),

        code:
          course.code,

        title:
          course.title,

        programmeId:
          programme._id.toString(),

        programmeName:
          programme.name,

        programmeCode:
          programme.code,

        semesterId:
          semester._id.toString(),

        level:
          course.level,

        creditUnits:
          course.creditUnits,

        category:
          course.category,

        description:
          course.description,

        changedFields,
      },

      status:
        "success",
    });

    /**
     * -------------------------------------------------------
     * NOTIFY ADMINS
     * -------------------------------------------------------
     */

    await safelyNotifyAdmins({
      title:
        "Course Updated",

      message:
        `Course ${course.code} — ${course.title} was updated.`,

      type:
        "course",

      link:
        "/dashboards/admin/courses",
    });

    /**
     * -------------------------------------------------------
     * RESPONSE
     * -------------------------------------------------------
     */

    const updatedCourse =
      await Course.findById(
        course._id,
      )
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "semester",
          "name order",
        );

    return res.status(200).json({
      success: true,

      message:
        "Course updated successfully",

      course:
        updatedCourse,
    });
  } catch (error) {
    /**
     * -------------------------------------------------------
     * VALIDATION ERROR
     * -------------------------------------------------------
     */

    if (
      error instanceof z.ZodError
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Validation failed",

        errors:
          error.flatten().fieldErrors,
      });
    }

    /**
     * -------------------------------------------------------
     * DUPLICATE COURSE
     * -------------------------------------------------------
     */

    if (
      isDuplicateKeyError(error)
    ) {
      return res.status(409).json({
        success: false,

        message:
          "This course code already exists for the selected programme and semester",
      });
    }

    console.error(
      "Update course error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to update course",
    });
  }
}

/**
 * =========================================================
 * ARCHIVE COURSE
 * =========================================================
 *
 * PATCH /api/courses/:id/archive
 *
 * This is NOT a DELETE operation.
 *
 * isActive -> false
 */

export async function archiveCourse(
  req: AuthRequest,
  res: Response,
) {
  try {
    /**
     * -------------------------------------------------------
     * GET COURSE ID
     * -------------------------------------------------------
     */

    const id =
      getRouteId(
        req,
      );

    if (!id) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid course ID",
      });
    }

    /**
     * -------------------------------------------------------
     * VALIDATE COURSE ID
     * -------------------------------------------------------
     */

    if (
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid course ID",
      });
    }

    /**
     * -------------------------------------------------------
     * FIND COURSE
     * -------------------------------------------------------
     */

    const course =
      await Course.findById(
        id,
      );

    if (!course) {
      return res.status(404).json({
        success: false,

        message:
          "Course not found",
      });
    }

    /**
     * -------------------------------------------------------
     * ALREADY ARCHIVED
     * -------------------------------------------------------
     */

    if (
      course.isActive === false
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Course is already archived",
      });
    }

    /**
     * -------------------------------------------------------
     * ARCHIVE
     * -------------------------------------------------------
     */

    course.isActive = false;

    await course.save();

    /**
     * -------------------------------------------------------
     * AUDIT
     * -------------------------------------------------------
     */

    await createAuditLog({
      req,

      actorId:
        req.user?.userId,

      actorRole:
        req.user?.role,

      action:
        "DEACTIVATE",

      module:
        "COURSES",

      description:
        `Course ${course.code} — ${course.title} was archived.`,

      targetType:
        "Course",

      targetId:
        course._id.toString(),

      metadata: {
        courseId:
          course._id.toString(),

        code:
          course.code,

        title:
          course.title,

        isActive:
          course.isActive,
      },

      status:
        "success",
    });

    /**
     * -------------------------------------------------------
     * NOTIFY ADMINS
     * -------------------------------------------------------
     */

    await safelyNotifyAdmins({
      title:
        "Course Archived",

      message:
        `Course ${course.code} — ${course.title} was archived.`,

      type:
        "course",

      link:
        "/dashboards/admin/courses",
    });

    /**
     * -------------------------------------------------------
     * RESPONSE
     * -------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      message:
        "Course archived successfully",
    });
  } catch (error) {
    console.error(
      "Archive course error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to archive course",
    });
  }
}