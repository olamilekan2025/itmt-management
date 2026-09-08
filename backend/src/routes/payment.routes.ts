import { Router } from "express";

import {
  getFinanceDashboard,
  getMyBalance,
  getMyPayments,
  getPaymentById,
  getPayments,
  getStudentBalance,
  getStudentsFees,
  recordPayment,
  verifyPayment,
} from "../controllers/payment.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * Finance/Admin
 * Record a payment
 */
router.post(
  "/",
  authenticate,
  authorize("finance", "admin"),
  recordPayment,
);

/**
 * Finance/Admin
 * Get payment records with filtering and pagination
 */
router.get(
  "/",
  authenticate,
  authorize("finance", "admin"),
  getPayments,
);

/**
 * Finance/Admin
 * Finance dashboard summary
 */
router.get(
  "/dashboard",
  authenticate,
  authorize("finance", "admin"),
  getFinanceDashboard,
);

/**
 * Finance/Admin
 * Get all students with their fee/payment status
 */
router.get(
  "/students-fees",
  authenticate,
  authorize("finance", "admin"),
  getStudentsFees,
);

/**
 * Finance/Admin
 * Get a specific student's balance
 */
router.get(
  "/balance",
  authenticate,
  authorize("finance", "admin"),
  getStudentBalance,
);

/**
 * Student
 * Get own payment history
 */
router.get(
  "/me",
  authenticate,
  authorize("student"),
  getMyPayments,
);

/**
 * Student
 * Get own balance
 */
router.get(
  "/me/balance",
  authenticate,
  authorize("student"),
  getMyBalance,
);

/**
 * Finance/Admin
 * Get a specific payment by ID
 * ⚠️ MUST stay after all static routes above — this catches everything else
 */
router.get(
  "/:id",
  authenticate,
  authorize("finance", "admin"),
  getPaymentById,
);

/**
 * Finance/Admin
 * Verify a payment
 */
router.post(
  "/:id/verify",
  authenticate,
  authorize("finance", "admin"),
  verifyPayment,
);

export default router;