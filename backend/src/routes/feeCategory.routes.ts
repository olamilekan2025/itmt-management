import { Router } from "express";

import {
  createFeeCategory,
  deleteFeeCategory,
  getFeeCategories,
  getFeeCategory,
  updateFeeCategory,
  updateFeeCategoryStatus,
} from "../controllers/feeCategory.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * Finance/Admin
 * Get all fee categories.
 *
 * Optional:
 * ?search=tuition
 * ?isActive=true
 */
router.get(
  "/",
  authenticate,
  authorize("finance", "admin"),
  getFeeCategories,
);

/**
 * Finance/Admin
 * Get one fee category.
 */
router.get(
  "/:id",
  authenticate,
  authorize("finance", "admin"),
  getFeeCategory,
);

/**
 * Finance/Admin
 * Create fee category.
 */
router.post(
  "/",
  authenticate,
  authorize("finance", "admin"),
  createFeeCategory,
);

/**
 * Finance/Admin
 * Update fee category.
 */
router.patch(
  "/:id",
  authenticate,
  authorize("finance", "admin"),
  updateFeeCategory,
);

/**
 * Finance/Admin
 * Activate/deactivate fee category.
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("finance", "admin"),
  updateFeeCategoryStatus,
);

/**
 * Finance/Admin
 * Delete fee category.
 *
 * Deletion is blocked when the category
 * is already used by a FeeStructure.
 */
router.delete(
  "/:id",
  authenticate,
  authorize("finance", "admin"),
  deleteFeeCategory,
);

export default router;