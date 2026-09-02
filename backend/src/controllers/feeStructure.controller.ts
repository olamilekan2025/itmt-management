import type { Request, Response } from "express";
import { z } from "zod";

import FeeStructure from "../models/FeeStructure.js";
import Programme from "../models/Programme.js";
import Semester from "../models/Semester.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

const feeStructureSchema = z.object({
  programme: objectId,
  level: z.string().trim().min(1).max(50),
  semester: objectId,
  amount: z.number().positive(),
  description: z.string().trim().max(300).optional(),
});

export async function createFeeStructure(req: Request, res: Response) {
  try {
    const data = feeStructureSchema.parse(req.body);

    const [programme, semester] = await Promise.all([
      Programme.findOne({ _id: data.programme, isActive: true }),
      Semester.findById(data.semester),
    ]);

    if (!programme) {
      return res.status(400).json({
        success: false,
        message: "Programme not found or inactive",
      });
    }

    if (!semester) {
      return res.status(400).json({
        success: false,
        message: "Semester not found",
      });
    }

    const feeStructure = await FeeStructure.create(data);

    return res.status(201).json({
      success: true,
      message: "Fee structure created successfully",
      feeStructure,
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
        message: "A fee structure already exists for this programme, level, and semester",
      });
    }

    console.error("Create fee structure error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create fee structure",
    });
  }
}

export async function getFeeStructures(req: Request, res: Response) {
  try {
    const programme =
      typeof req.query.programme === "string" ? req.query.programme : undefined;
    const semester =
      typeof req.query.semester === "string" ? req.query.semester : undefined;

    const feeStructures = await FeeStructure.find({
      isActive: true,
      ...(programme ? { programme } : {}),
      ...(semester ? { semester } : {}),
    })
      .populate("programme", "name code")
      .populate("semester", "name order")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      feeStructures,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve fee structures",
    });
  }
}

export async function archiveFeeStructure(req: Request, res: Response) {
  const feeStructure = await FeeStructure.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );

  if (!feeStructure) {
    return res.status(404).json({
      success: false,
      message: "Fee structure not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Fee structure archived successfully",
  });
}