import type { Request, Response } from "express";
import { z } from "zod";

import AcademicSession from "../models/AcademicSession.js";
import Semester from "../models/Semester.js";

const semesterSchema = z
  .object({
    session: z.string().regex(/^[a-f\d]{24}$/i, "Invalid academic session ID"),
    name: z.string().trim().min(2).max(50),
    order: z.number().int().min(1).max(10),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate > data.startDate,
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export async function createSemester(req: Request, res: Response) {
  try {
    const data = semesterSchema.parse(req.body);

    const academicSession = await AcademicSession.findById(data.session);

    if (!academicSession) {
      return res.status(400).json({
        success: false,
        message: "Academic session not found",
      });
    }

    if (data.isActive) {
      await Semester.updateMany(
        { session: data.session },
        { isActive: false },
      );
    }

    const semester = await Semester.create(data);

    return res.status(201).json({
      success: true,
      message: "Semester created successfully",
      semester,
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
        message: "A semester with this name or order already exists in this academic session",
      });
    }

    console.error("Create semester error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create semester",
    });
  }
}

export async function getSemesters(req: Request, res: Response) {
  try {
    const sessionId =
      typeof req.query.session === "string" ? req.query.session : undefined;

    if (sessionId && !/^[a-f\d]{24}$/i.test(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid academic session ID",
      });
    }

    const semesters = await Semester.find({
      ...(sessionId ? { session: sessionId } : {}),
    })
      .populate("session", "name isActive")
      .sort({ order: 1 });

    return res.status(200).json({
      success: true,
      semesters,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve semesters",
    });
  }
}

export async function activateSemester(req: Request, res: Response) {
  try {
    const semester = await Semester.findById(req.params.id);

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    await Semester.updateMany(
      { session: semester.session, _id: { $ne: semester._id } },
      { isActive: false },
    );

    semester.isActive = true;
    await semester.save();

    return res.status(200).json({
      success: true,
      message: "Semester activated successfully",
      semester,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to activate semester",
    });
  }
}