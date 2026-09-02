import type { Request, Response } from "express";
import { z } from "zod";

import Department from "../models/Department.js";
import Programme from "../models/Programme.js";

const programmeSchema = z.object({
  name: z.string().trim().min(2),
  code: z.string().trim().min(2).max(15),
  department: z.string().regex(/^[a-f\d]{24}$/i, "Invalid department ID"),
  award: z.string().trim().max(100).optional(),
  durationYears: z.number().int().min(1).max(10).optional(),
  description: z.string().trim().max(500).optional(),
});

async function validateDepartment(departmentId: string) {
  return Department.findOne({
    _id: departmentId,
    isActive: true,
  });
}

export async function createProgramme(req: Request, res: Response) {
  try {
    const data = programmeSchema.parse(req.body);

    const department = await validateDepartment(data.department);

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "The selected department does not exist or is inactive",
      });
    }

    const programme = await Programme.create({
      ...data,
      code: data.code.toUpperCase(),
    });

    return res.status(201).json({
      success: true,
      message: "Programme created successfully",
      programme,
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
        message: "A programme with this code already exists",
      });
    }

    console.error("Create programme error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create programme",
    });
  }
}

export async function getProgrammes(req: Request, res: Response) {
  try {
    const departmentId =
      typeof req.query.department === "string"
        ? req.query.department
        : undefined;

    if (departmentId && !/^[a-f\d]{24}$/i.test(departmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const programmes = await Programme.find({
      isActive: true,
      ...(departmentId ? { department: departmentId } : {}),
    })
      .populate("department", "name code")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      programmes,
    });
  } catch (error) {
    console.error("Get programmes error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve programmes",
    });
  }
}

export async function updateProgramme(req: Request, res: Response) {
  try {
    const data = programmeSchema.partial().parse(req.body);

    if (data.department) {
      const department = await validateDepartment(data.department);

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "The selected department does not exist or is inactive",
        });
      }
    }

    const programme = await Programme.findByIdAndUpdate(
      req.params.id,
      {
        ...data,
        ...(data.code ? { code: data.code.toUpperCase() } : {}),
      },
      { new: true, runValidators: true },
    );

    if (!programme) {
      return res.status(404).json({
        success: false,
        message: "Programme not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Programme updated successfully",
      programme,
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
        message: "A programme with this code already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update programme",
    });
  }
}

export async function archiveProgramme(req: Request, res: Response) {
  try {
    const programme = await Programme.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!programme) {
      return res.status(404).json({
        success: false,
        message: "Programme not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Programme archived successfully",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to archive programme",
    });
  }
}