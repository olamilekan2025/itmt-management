import type { Request, Response } from "express";
import { z } from "zod";

import Department from "../models/Department.js";
import { createAuditLog } from "../services/auditLog.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

const departmentSchema = z.object({
  name: z.string().trim().min(2),
  code: z.string().trim().min(2).max(10),
  description: z.string().trim().max(500).optional(),
  headOfDepartment: z.string().optional(),
});

/**
 * =========================================================
 * CREATE DEPARTMENT
 * =========================================================
 */

export async function createDepartment(
  req: AuthRequest,
  res: Response,
) {
  try {
    const data = departmentSchema.parse(req.body);

    const department = await Department.create({
      ...data,
      code: data.code.toUpperCase(),
    });

    /**
     * Audit successful department creation.
     *
     * IMPORTANT:
     * Audit logging must never break the actual operation.
     */
    await createAuditLog({
      req,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      action: "CREATE",
      module: "DEPARTMENTS",
      description:
        `Department ${department.name} (${department.code}) was created.`,
      targetType: "Department",
      targetId: department._id.toString(),
      metadata: {
        name: department.name,
        code: department.code,
        headOfDepartment:
          department.headOfDepartment?.toString(),
      },
      status: "success",
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      });
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A department with this name or code already exists",
      });
    }

    console.error(
      "Create department error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create department",
    });
  }
}

/**
 * =========================================================
 * GET DEPARTMENTS
 * =========================================================
 *
 * This is a read-only operation.
 *
 * We intentionally DO NOT create audit logs for normal
 * GET requests because that would create unnecessary noise
 * in the audit history.
 */

export async function getDepartments(
  _req: Request,
  res: Response,
) {
  try {
    const departments = await Department.find({
      isActive: true,
    })
      .populate(
        "headOfDepartment",
        "name email",
      )
      .sort({
        name: 1,
      });

    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error(
      "Get departments error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve departments",
    });
  }
}

/**
 * =========================================================
 * UPDATE DEPARTMENT
 * =========================================================
 */

export async function updateDepartment(
  req: AuthRequest,
  res: Response,
) {
  try {
    const data =
      departmentSchema.partial().parse(
        req.body,
      );

    const department =
      await Department.findByIdAndUpdate(
        req.params.id,
        {
          ...data,
          ...(data.code
            ? {
                code:
                  data.code.toUpperCase(),
              }
            : {}),
        },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    /**
     * Audit successful department update.
     */
    await createAuditLog({
      req,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      action: "UPDATE",
      module: "DEPARTMENTS",
      description:
        `Department ${department.name} (${department.code}) was updated.`,
      targetType: "Department",
      targetId:
        department._id.toString(),
      metadata: {
        departmentId:
          department._id.toString(),

        name: department.name,

        code: department.code,

        changes: data,
      },
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message:
        "Department updated successfully",
      department,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      });
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A department with this name or code already exists",
      });
    }

    console.error(
      "Update department error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update department",
    });
  }
}

/**
 * =========================================================
 * ARCHIVE DEPARTMENT
 * =========================================================
 */

export async function archiveDepartment(
  req: AuthRequest,
  res: Response,
) {
  try {
    const department =
      await Department.findByIdAndUpdate(
        req.params.id,
        {
          isActive: false,
        },
        {
          new: true,
        },
      );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    /**
     * Audit department archive.
     */
    await createAuditLog({
      req,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      action: "DEACTIVATE",
      module: "DEPARTMENTS",
      description:
        `Department ${department.name} (${department.code}) was archived.`,
      targetType: "Department",
      targetId:
        department._id.toString(),
      metadata: {
        departmentId:
          department._id.toString(),

        name: department.name,

        code: department.code,

        isActive:
          department.isActive,
      },
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message:
        "Department archived successfully",
    });
  } catch (error) {
    console.error(
      "Archive department error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to archive department",
    });
  }
}