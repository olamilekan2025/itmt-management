import type { Request, Response } from "express";
import { z } from "zod";

import AcademicSession from "../models/AcademicSession.js";

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

export async function createAcademicSession(req: Request, res: Response) {
  try {
    const data = sessionSchema.parse(req.body);

    if (data.isActive) {
      await AcademicSession.updateMany({}, { isActive: false });
    }

    const session = await AcademicSession.create(data);

    return res.status(201).json({
      success: true,
      message: "Academic session created successfully",
      session,
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
        message: "An academic session with this name already exists",
      });
    }

    console.error("Create academic session error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create academic session",
    });
  }
}

export async function getAcademicSessions(_req: Request, res: Response) {
  try {
    const sessions = await AcademicSession.find().sort({
      startDate: -1,
    });

    return res.status(200).json({
      success: true,
      sessions,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve academic sessions",
    });
  }
}

export async function activateAcademicSession(req: Request, res: Response) {
  try {
    const session = await AcademicSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Academic session not found",
      });
    }

    await AcademicSession.updateMany(
      { _id: { $ne: session._id } },
      { isActive: false },
    );

    session.isActive = true;
    await session.save();

    return res.status(200).json({
      success: true,
      message: "Academic session activated successfully",
      session,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to activate academic session",
    });
  }
}