
import type { Request, Response } from "express";
import { z } from "zod";

import AcademicSession from "../models/AcademicSession.js";

/**
 * =========================================================
 * VALIDATION
 * =========================================================
 */

const sessionSchema = z
  .object({
    name: z.string().trim().min(4).max(30),

    startDate: z.coerce.date(),

    endDate: z.coerce.date(),

    isActive: z.boolean().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

/**
 * =========================================================
 * CREATE ACADEMIC SESSION
 * =========================================================
 *
 * POST /api/academic-sessions
 */
export async function createAcademicSession(
  req: Request,
  res: Response,
) {
  try {
    const parsed = sessionSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid academic session data.",
        errors: parsed.error.flatten(),
      });
    }

    const {
      name,
      startDate,
      endDate,
      isActive = false,
    } = parsed.data;

    /**
     * Prevent duplicate session names.
     */
    const existingSession = await AcademicSession.findOne({
      name: {
        $regex: `^${name}$`,
        $options: "i",
      },
    });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        message: "An academic session with this name already exists.",
      });
    }

    /**
     * If this session should be active,
     * deactivate all existing sessions first.
     */
    if (isActive) {
      await AcademicSession.updateMany(
        {},
        {
          $set: {
            isActive: false,
          },
        },
      );
    }

    const academicSession = await AcademicSession.create({
      name,
      startDate,
      endDate,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: "Academic session created successfully.",
      academicSession,
    });
  } catch (error) {
    console.error(
      "CREATE ACADEMIC SESSION ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create academic session.",
    });
  }
}

/**
 * =========================================================
 * GET ALL ACADEMIC SESSIONS
 * =========================================================
 *
 * GET /api/academic-sessions
 *
 * Protected route.
 */
export async function getAcademicSessions(
  _req: Request,
  res: Response,
) {
  try {
    const academicSessions =
      await AcademicSession.find()
        .sort({
          startDate: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      academicSessions,
    });
  } catch (error) {
    console.error(
      "GET ACADEMIC SESSIONS ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch academic sessions.",
    });
  }
}

/**
 * =========================================================
 * GET PUBLIC ACADEMIC SESSIONS
 * =========================================================
 *
 * GET /api/academic-sessions/public
 *
 * Public route used by:
 * - Admission application form
 * - Public admission pages
 * - Other public academic forms
 *
 * Only active sessions are returned.
 */
export async function getPublicAcademicSessions(
  _req: Request,
  res: Response,
) {
  try {
    const academicSessions =
      await AcademicSession.find({
        isActive: true,
      })
        .select("name isActive startDate endDate")
        .sort({
          startDate: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      academicSessions,
    });
  } catch (error) {
    console.error(
      "GET PUBLIC ACADEMIC SESSIONS ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch public academic sessions.",
    });
  }
}

/**
 * =========================================================
 * ACTIVATE ACADEMIC SESSION
 * =========================================================
 *
 * PATCH /api/academic-sessions/:id/activate
 */
export async function activateAcademicSession(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    const academicSession =
      await AcademicSession.findById(id);

    if (!academicSession) {
      return res.status(404).json({
        success: false,
        message: "Academic session not found.",
      });
    }

    /**
     * Only one academic session should be active
     * at a time.
     */
    await AcademicSession.updateMany(
      {
        _id: {
          $ne: academicSession._id,
        },
      },
      {
        $set: {
          isActive: false,
        },
      },
    );

    academicSession.isActive = true;

    await academicSession.save();

    return res.status(200).json({
      success: true,
      message: "Academic session activated successfully.",
      academicSession,
    });
  } catch (error) {
    console.error(
      "ACTIVATE ACADEMIC SESSION ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to activate academic session.",
    });
  }
}

