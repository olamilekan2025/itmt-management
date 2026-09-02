import type {
  Request,
  Response,
} from "express";

import { z } from "zod";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import Result, {
  computeGrade,
} from "../models/Result.js";

import LecturerAssignment from "../models/LecturerAssignment.js";
import Registration from "../models/Registration.js";
import { notifyAdmins } from "../services/notification.service.js";

/* =========================================================
   VALIDATION
========================================================= */

const objectId = z
  .string()
  .regex(
    /^[a-f\d]{24}$/i,
    "Invalid ID",
  );

/* =========================================================
   SUBMIT RESULTS
========================================================= */

const submitResultsSchema =
  z.object({
    course: objectId,

    semester: objectId,

    scores: z
      .array(
        z.object({
          student: objectId,

          score: z
            .number()
            .min(
              0,
              "Score cannot be below 0",
            )
            .max(
              100,
              "Score cannot exceed 100",
            ),
        }),
      )
      .min(
        1,
        "Provide at least one student score",
      ),
  });

/* =========================================================
   RESULT QUERY
========================================================= */

const resultQuerySchema =
  z.object({
    course: objectId.optional(),

    semester: objectId.optional(),

    status: z
      .enum([
        "draft",
        "published",
      ])
      .optional(),
  });

/* =========================================================
   LECTURER
   SUBMIT / UPDATE RESULTS
========================================================= */

export async function submitResults(
  req: AuthRequest,
  res: Response,
) {
  try {
    const data =
      submitResultsSchema.parse(
        req.body,
      );

    const lecturerId =
      req.user!.userId;

    /* =====================================================
       VERIFY LECTURER ASSIGNMENT
    ====================================================== */

    const assignment =
      await LecturerAssignment.findOne({
        lecturer: lecturerId,
        course: data.course,
        semester: data.semester,
        isActive: true,
      });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this course for this semester",
      });
    }

    /* =====================================================
       PREVENT DUPLICATE STUDENTS
    ====================================================== */

    const studentIds =
      data.scores.map(
        (score) => score.student,
      );

    const uniqueStudentIds =
      new Set(studentIds);

    if (
      uniqueStudentIds.size !==
      studentIds.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate student IDs were provided.",
      });
    }

    /* =====================================================
       VERIFY REGISTRATIONS
    ====================================================== */

    const registrations =
      await Registration.find({
        student: {
          $in: studentIds,
        },

        course: data.course,

        semester: data.semester,

        status: "registered",
      });

    const registeredIds =
      registrations.map(
        (registration) =>
          registration.student.toString(),
      );

    const notRegistered =
      studentIds.filter(
        (studentId) =>
          !registeredIds.includes(
            studentId,
          ),
      );

    if (
      notRegistered.length > 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "One or more students are not registered for this course/semester",

        studentIds:
          notRegistered,
      });
    }

    /* =====================================================
       CREATE / UPDATE RESULTS
    ====================================================== */

    const results =
      await Promise.all(
        data.scores.map(
          async ({
            student,
            score,
          }) => {
            const existingResult =
              await Result.findOne({
                student,
                course: data.course,
                semester:
                  data.semester,
              });

            /*
             * Preserve published status.
             *
             * If the result already exists and has
             * been published, updating the score does
             * not automatically move it back to draft.
             */

            const status =
              existingResult?.status ??
              "draft";

            return Result.findOneAndUpdate(
              {
                student,
                course: data.course,
                semester:
                  data.semester,
              },

              {
                $set: {
                  student,
                  course: data.course,
                  semester:
                    data.semester,
                  lecturer:
                    lecturerId,
                  score,
                  grade:
                    computeGrade(
                      score,
                    ),
                  status,
                },
              },

              {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert:
                  true,
              },
            );
          },
        ),
      );

    await notifyAdmins({
      title: "New Results Submitted",
      message: `A lecturer submitted ${results.length} score${results.length === 1 ? "" : "s"} for review.`,
      type: "result",
      link: "/dashboards/admin/results",
    });

    return res.status(200).json({
      success: true,

      message:
        "Scores submitted successfully",

      results,
    });
  } catch (error) {
    if (
      error instanceof z.ZodError
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Validation failed",

        errors:
          error.flatten()
            .fieldErrors,
      });
    }

    console.error(
      "Submit results error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to submit results",
    });
  }
}

/* =========================================================
   LECTURER
   GET RESULTS FOR THEIR COURSE
========================================================= */

export async function getCourseResults(
  req: AuthRequest,
  res: Response,
) {
  try {
    const course =
      typeof req.query.course ===
        "string"
        ? req.query.course
        : undefined;

    const semester =
      typeof req.query.semester ===
        "string"
        ? req.query.semester
        : undefined;

    if (!course || !semester) {
      return res.status(400).json({
        success: false,

        message:
          "course and semester query parameters are required",
      });
    }

    if (
      !objectId.safeParse(
        course,
      ).success ||
      !objectId.safeParse(
        semester,
      ).success
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid course or semester ID",
      });
    }

    /* =====================================================
       VERIFY ASSIGNMENT
    ====================================================== */

    const assignment =
      await LecturerAssignment.findOne({
        lecturer:
          req.user!.userId,

        course,

        semester,

        isActive: true,
      });

    if (!assignment) {
      return res.status(403).json({
        success: false,

        message:
          "You are not assigned to this course for this semester",
      });
    }

    /* =====================================================
       GET RESULTS
    ====================================================== */

    const results =
      await Result.find({
        course,
        semester,
      })
        .populate(
          "student",
          "name email matricNumber",
        )
        .populate(
          "course",
          "code title creditUnits",
        )
        .populate(
          "semester",
          "name order",
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error(
      "Get course results error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve results",
    });
  }
}

/* =========================================================
   ADMIN / REGISTRAR
   GET ALL RESULTS
========================================================= */

export async function getAllResults(
  req: Request,
  res: Response,
) {
  try {
    const parsed =
      resultQuerySchema.safeParse({
        course:
          typeof req.query.course ===
            "string"
            ? req.query.course
            : undefined,

        semester:
          typeof req.query.semester ===
            "string"
            ? req.query.semester
            : undefined,

        status:
          typeof req.query.status ===
            "string"
            ? req.query.status
            : undefined,
      });

    if (!parsed.success) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid result filters",

        errors:
          parsed.error.flatten()
            .fieldErrors,
      });
    }

    const {
      course,
      semester,
      status,
    } = parsed.data;
/* =====================================================
   BUILD FILTER
===================================================== */

const filter: Record<string, unknown> = {};

if (course) {
  filter.course = course;
}

if (semester) {
  filter.semester = semester;
}

if (status) {
  filter.status = status;
}

    /* =====================================================
       GET RESULTS
    ====================================================== */

    const results =
      await Result.find(filter)
        .populate(
          "student",
          "name email matricNumber",
        )
        .populate(
          "course",
          "code title creditUnits",
        )
        .populate(
          "semester",
          "name order",
        )
        .populate(
          "lecturer",
          "name email",
        )
        .sort({
          createdAt: -1,
        });

    /* =====================================================
       STATISTICS
    ====================================================== */

    const total =
      results.length;

    const draft =
      results.filter(
        (result) =>
          result.status ===
          "draft",
      ).length;

    const published =
      results.filter(
        (result) =>
          result.status ===
          "published",
      ).length;

    const passed =
      results.filter(
        (result) =>
          result.score >= 40,
      ).length;

    const failed =
      results.filter(
        (result) =>
          result.score < 40,
      ).length;

    return res.status(200).json({
      success: true,

      results,

      statistics: {
        total,
        draft,
        published,
        passed,
        failed,
      },
    });
  } catch (error) {
    console.error(
      "Get all results error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve results",
    });
  }
}

/* =========================================================
   ADMIN / REGISTRAR
   PUBLISH RESULTS
========================================================= */

export async function publishResults(
  req: Request,
  res: Response,
) {
  try {
    const schema =
      z.object({
        course: objectId,

        semester: objectId,
      });

    const data =
      schema.parse(req.body);

    /* =====================================================
       CHECK DRAFT RESULTS
    ====================================================== */

    const draftCount =
      await Result.countDocuments({
        course: data.course,

        semester:
          data.semester,

        status: "draft",
      });

    if (draftCount === 0) {
      return res.status(404).json({
        success: false,

        message:
          "No draft results were found for this course and semester.",
      });
    }

    /* =====================================================
       PUBLISH
    ====================================================== */

    const updateResult =
      await Result.updateMany(
        {
          course: data.course,

          semester:
            data.semester,

          status: "draft",
        },

        {
          $set: {
            status: "published",
          },
        },
      );

    await notifyAdmins({
      title: "Results Published",
      message: `${updateResult.modifiedCount} result${updateResult.modifiedCount === 1 ? "" : "s"} were published and are now visible to students.`,
      type: "result",
      link: "/dashboards/admin/results",
    });

    return res.status(200).json({
      success: true,

      message:
        "Results published successfully",

      matched:
        updateResult.matchedCount,

      modified:
        updateResult.modifiedCount,
    });
  } catch (error) {
    if (
      error instanceof z.ZodError
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Validation failed",

        errors:
          error.flatten()
            .fieldErrors,
      });
    }

    console.error(
      "Publish results error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to publish results",
    });
  }
}

/* =========================================================
   ADMIN / REGISTRAR
   UNPUBLISH RESULTS
========================================================= */

export async function unpublishResults(
  req: Request,
  res: Response,
) {
  try {
    const schema =
      z.object({
        course: objectId,

        semester: objectId,
      });

    const data =
      schema.parse(req.body);

    const updateResult =
      await Result.updateMany(
        {
          course: data.course,

          semester:
            data.semester,

          status: "published",
        },

        {
          $set: {
            status: "draft",
          },
        },
      );

    if (
      updateResult.matchedCount ===
      0
    ) {
      return res.status(404).json({
        success: false,

        message:
          "No published results were found for this course and semester.",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Results moved back to draft successfully",

      matched:
        updateResult.matchedCount,

      modified:
        updateResult.modifiedCount,
    });
  } catch (error) {
    if (
      error instanceof z.ZodError
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Validation failed",

        errors:
          error.flatten()
            .fieldErrors,
      });
    }

    console.error(
      "Unpublish results error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to unpublish results",
    });
  }
}

/* =========================================================
   STUDENT
   GET MY PUBLISHED RESULTS
========================================================= */

export async function getMyResults(
  req: AuthRequest,
  res: Response,
) {
  try {
    const semester =
      typeof req.query.semester ===
        "string"
        ? req.query.semester
        : undefined;

    if (
      semester &&
      !objectId.safeParse(
        semester,
      ).success
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid semester ID",
      });
    }

    const results =
      await Result.find({
        student:
          req.user!.userId,

        status: "published",

        ...(semester
          ? {
            semester,
          }
          : {}),
      })
        .populate(
          "course",
          "code title creditUnits",
        )
        .populate(
          "semester",
          "name order",
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error(
      "Get my results error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve results",
    });
  }
}