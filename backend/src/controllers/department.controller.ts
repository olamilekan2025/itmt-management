import type { Request, Response } from "express";
import { z } from "zod";

import Department from "../models/Department.js";
import { createAuditLog } from "../services/auditLog.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

/**
 * =========================================================
 * VALIDATION
 * =========================================================
 */

const departmentSchema = z.object({
  name: z.string().trim().min(2),

  code: z.string().trim().min(2).max(10),

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  headOfDepartment: z
    .string()
    .optional(),
});

/**
 * =========================================================
 * CREATE DEPARTMENT
 * =========================================================
 *
 * POST /api/departments
 */
export async function createDepartment(
  req: AuthRequest,
  res: Response,
) {
  try {
    const parsed = departmentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid department data.",
        errors: parsed.error.flatten(),
      });
    }

    const {
      name,
      code,
      description,
      headOfDepartment,
    } = parsed.data;

    const normalizedCode = code.toUpperCase();

    /**
     * Prevent duplicate department codes.
     */
    const existingDepartment =
      await Department.findOne({
        code: normalizedCode,
      });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message:
          "A department with this code already exists.",
      });
    }

    const department =
      await Department.create({
        name,
        code: normalizedCode,
        description,
        headOfDepartment:
          headOfDepartment || undefined,
        isActive: true,
      });

    /**
     * =====================================================
     * AUDIT LOG
     * =====================================================
     *
     * IMPORTANT:
     * AuthRequest.user contains:
     *
     * {
     *   userId: string;
     *   role: UserRole;
     * }
     *
     * Therefore we use:
     *
     * actorId: req.user?.userId
     */
    try {
      await createAuditLog({
        actorId: req.user?.userId,
        action: "CREATE",
        module: "DEPARTMENTS",
        targetType: "Department",
        targetId: department._id,
        description:
          `Created department ${department.name} (${department.code})`,
        metadata: {
          name: department.name,
          code: department.code,
        },
        status: "success",
      });
    } catch (auditError) {
      console.error(
        "CREATE DEPARTMENT AUDIT ERROR:",
        auditError,
      );
    }

    return res.status(201).json({
      success: true,
      message: "Department created successfully.",
      department,
    });
  } catch (error) {
    console.error(
      "CREATE DEPARTMENT ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create department.",
    });
  }
}

/**
 * =========================================================
 * GET DEPARTMENTS
 * =========================================================
 *
 * GET /api/departments
 *
 * Protected route.
 */
export async function getDepartments(
  _req: Request,
  res: Response,
) {
  try {
    const departments =
      await Department.find({
        isActive: true,
      })
        .populate(
          "headOfDepartment",
          "name email",
        )
        .sort({
          name: 1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error(
      "GET DEPARTMENTS ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch departments.",
    });
  }
}

/**
 * =========================================================
 * GET PUBLIC DEPARTMENTS
 * =========================================================
 *
 * GET /api/departments/public
 *
 * Public route used by:
 * - Admission application form
 * - Public admission pages
 * - Other public forms
 */
export async function getPublicDepartments(
  _req: Request,
  res: Response,
) {
  try {
    const departments =
      await Department.find({
        isActive: true,
      })
        .select("name code")
        .sort({
          name: 1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error(
      "GET PUBLIC DEPARTMENTS ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch public departments.",
    });
  }
}

/**
 * =========================================================
 * UPDATE DEPARTMENT
 * =========================================================
 *
 * PATCH /api/departments/:id
 */
export async function updateDepartment(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;

    const parsed =
      departmentSchema
        .partial()
        .safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid department data.",
        errors: parsed.error.flatten(),
      });
    }

    const updateData = {
      ...parsed.data,

      ...(parsed.data.code
        ? {
            code: parsed.data.code.toUpperCase(),
          }
        : {}),
    };

    const department =
      await Department.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    /**
     * Audit update.
     */
    try {
      await createAuditLog({
        actorId: req.user?.userId,
        action: "UPDATE",
        module: "DEPARTMENTS",
        targetType: "Department",
        targetId: department._id,
        description:
          `Updated department ${department.name} (${department.code})`,
        metadata: {
          updatedFields:
            Object.keys(updateData),
        },
        status: "success",
      });
    } catch (auditError) {
      console.error(
        "UPDATE DEPARTMENT AUDIT ERROR:",
        auditError,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Department updated successfully.",
      department,
    });
  } catch (error) {
    console.error(
      "UPDATE DEPARTMENT ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update department.",
    });
  }
}

/**
 * =========================================================
 * ARCHIVE DEPARTMENT
 * =========================================================
 *
 * PATCH /api/departments/:id/archive
 */
export async function archiveDepartment(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;

    const department =
      await Department.findByIdAndUpdate(
        id,
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
        message: "Department not found.",
      });
    }

    /**
     * Audit archive/deactivation.
     */
    try {
      await createAuditLog({
        actorId: req.user?.userId,
        action: "DEACTIVATE",
        module: "DEPARTMENTS",
        targetType: "Department",
        targetId: department._id,
        description:
          `Archived department ${department.name} (${department.code})`,
        metadata: {
          name: department.name,
          code: department.code,
        },
        status: "success",
      });
    } catch (auditError) {
      console.error(
        "ARCHIVE DEPARTMENT AUDIT ERROR:",
        auditError,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Department archived successfully.",
      department,
    });
  } catch (error) {
    console.error(
      "ARCHIVE DEPARTMENT ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to archive department.",
    });
  }
}
