import { Router } from "express";

import {
  getFinanceDashboard,
  getMyBalance,
  getMyPayments,
  getPayments,
  getStudentBalance,
  getStudentsFees,
  recordPayment,
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
 * Get payment records
 *
 * Optional query parameters:
 * ?student=STUDENT_ID
 * ?semester=SEMESTER_ID
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
 *
 * Optional:
 * ?semester=SEMESTER_ID
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
 *
 * Required:
 * ?semester=SEMESTER_ID
 *
 * Optional:
 * ?programme=PROGRAMME_ID
 * ?level=LEVEL
 * ?search=NAME_OR_EMAIL_OR_MATRIC
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
 *
 * Required:
 * ?student=STUDENT_ID&semester=SEMESTER_ID
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
 *
 * Optional:
 * ?semester=SEMESTER_ID
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
 *
 * Required:
 * ?semester=SEMESTER_ID
 */
router.get(
  "/me/balance",
  authenticate,
  authorize("student"),
  getMyBalance,
);

export default router;