import type { Response } from "express";

import { z } from "zod";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import FeeCategory from "../models/FeeCategory.js";

import FeeStructure from "../models/FeeStructure.js";

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID");

const createFeeCategorySchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name cannot exceed 100 characters"),

    code: z
      .string()
      .trim()
      .min(2, "Category code must be at least 2 characters")
      .max(30, "Category code cannot exceed 30 characters")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Category code can only contain letters, numbers, hyphens and underscores",
      ),

    description: z
      .string()
      .trim()
      .max(
        500,
        "Description cannot exceed 500 characters",
      )
      .optional(),

    isActive: z
      .boolean()
      .optional()
      .default(true),
  });

const updateFeeCategorySchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    code: z
      .string()
      .trim()
      .min(2)
      .max(30)
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Category code can only contain letters, numbers, hyphens and underscores",
      )
      .optional(),

    description: z
      .string()
      .trim()
      .max(500)
      .optional(),

    isActive: z
      .boolean()
      .optional(),
  });

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

/**
 * GET /api/fee-categories
 *
 * Finance/Admin
 *
 * Optional:
 * ?search=tuition
 * ?isActive=true
 */
export async function getFeeCategories(
  req: AuthRequest,
  res: Response,
) {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const isActive =
      typeof req.query.isActive === "string"
        ? req.query.isActive.trim()
        : undefined;

    const query: Record<string, unknown> =
      {};

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

      const regex = new RegExp(
        escapedSearch,
        "i",
      );

      query.$or = [
        {
          name: regex,
        },
        {
          code: regex,
        },
        {
          description: regex,
        },
      ];
    }

    if (isActive === "true") {
      query.isActive = true;
    }

    if (isActive === "false") {
      query.isActive = false;
    }

    const categories =
      await FeeCategory.find(query)
        .sort({
          isActive: -1,
          name: 1,
        })
        .lean();

    const categoryIds =
      categories.map(
        (category) => category._id,
      );

    const usage =
      await FeeStructure.aggregate([
        {
          $match: {
            feeCategory: {
              $in: categoryIds,
            },
          },
        },
        {
          $group: {
            _id: "$feeCategory",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const usageMap = new Map<
      string,
      number
    >();

    for (const item of usage) {
      usageMap.set(
        String(item._id),
        Number(item.count) || 0,
      );
    }

    const data = categories.map(
      (category) => ({
        ...category,
        usageCount:
          usageMap.get(
            String(category._id),
          ) ?? 0,
      }),
    );

    return res.status(200).json({
      success: true,
      feeCategories: data,
    });
  } catch (error) {
    console.error(
      "Get fee categories error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve fee categories",
    });
  }
}

/**
 * GET /api/fee-categories/:id
 *
 * Finance/Admin
 */
export async function getFeeCategory(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!objectId.safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee category ID",
      });
    }

    const category =
      await FeeCategory.findById(id).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Fee category not found",
      });
    }

    const usageCount =
      await FeeStructure.countDocuments({
        feeCategory: category._id,
      });

    return res.status(200).json({
      success: true,
      feeCategory: {
        ...category,
        usageCount,
      },
    });
  } catch (error) {
    console.error(
      "Get fee category error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve fee category",
    });
  }
}

/**
 * POST /api/fee-categories
 *
 * Finance/Admin
 */
export async function createFeeCategory(
  req: AuthRequest,
  res: Response,
) {
  try {
    const data =
      createFeeCategorySchema.parse(
        req.body,
      );

    const name =
      data.name.trim();

    const code =
      normalizeCode(data.code);

    const existing =
      await FeeCategory.findOne({
        $or: [
          {
            name: {
              $regex: `^${name.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&",
              )}$`,
              $options: "i",
            },
          },
          {
            code,
          },
        ],
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          existing.code === code
            ? "A fee category with this code already exists"
            : "A fee category with this name already exists",
      });
    }

    const category =
      await FeeCategory.create({
        name,
        code,
        description:
          data.description || undefined,
        isActive:
          data.isActive ?? true,
      });

    return res.status(201).json({
      success: true,
      message:
        "Fee category created successfully",
      feeCategory: category,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "A fee category with this name or code already exists",
      });
    }

    console.error(
      "Create fee category error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create fee category",
    });
  }
}

/**
 * PATCH /api/fee-categories/:id
 *
 * Finance/Admin
 */
export async function updateFeeCategory(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!objectId.safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee category ID",
      });
    }

    const data =
      updateFeeCategorySchema.parse(
        req.body,
      );

    const update: Record<
      string,
      unknown
    > = {};

    if (data.name !== undefined) {
      update.name =
        data.name.trim();
    }

    if (data.code !== undefined) {
      update.code =
        normalizeCode(data.code);
    }

    if (data.description !== undefined) {
      update.description =
        data.description.trim() ||
        undefined;
    }

    if (data.isActive !== undefined) {
      update.isActive =
        data.isActive;
    }

    const category =
      await FeeCategory.findByIdAndUpdate(
        id,
        update,
        {
          new: true,
          runValidators: true,
        },
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Fee category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Fee category updated successfully",
      feeCategory: category,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "A fee category with this name or code already exists",
      });
    }

    console.error(
      "Update fee category error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update fee category",
    });
  }
}

/**
 * PATCH /api/fee-categories/:id/status
 *
 * Finance/Admin
 */
export async function updateFeeCategoryStatus(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!objectId.safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee category ID",
      });
    }

    const schema = z.object({
      isActive: z.boolean(),
    });

    const data =
      schema.parse(req.body);

    const category =
      await FeeCategory.findByIdAndUpdate(
        id,
        {
          isActive: data.isActive,
        },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Fee category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: data.isActive
        ? "Fee category activated successfully"
        : "Fee category deactivated successfully",
      feeCategory: category,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    console.error(
      "Update fee category status error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update fee category status",
    });
  }
}

/**
 * DELETE /api/fee-categories/:id
 *
 * Finance/Admin
 *
 * A category cannot be deleted if it is
 * already being used by a FeeStructure.
 */
export async function deleteFeeCategory(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!objectId.safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee category ID",
      });
    }

    const category =
      await FeeCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Fee category not found",
      });
    }

    const usageCount =
      await FeeStructure.countDocuments({
        feeCategory: category._id,
      });

    if (usageCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This fee category cannot be deleted because it is being used by one or more fee structures. Deactivate it instead.",
        usageCount,
      });
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Fee category deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete fee category error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete fee category",
    });
  }
}