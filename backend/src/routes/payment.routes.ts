import { Router } from "express";

import {
  getFinanceDashboard,
  getMyBalance,
  getMyPaymentReceipt,
  getMyPayments,
  getPaymentById,
  getPayments,
  getStudentBalance,
  getStudentsFees,
  initializePaystackPayment,
  paystackWebhook,
  recordPayment,
  verifyPaystackPayment,
  verifyPayment,
} from "../controllers/payment.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =========================================================
   PAYSTACK WEBHOOK

   IMPORTANT:
   - Public route
   - DO NOT add authenticate()
   - Paystack authenticates using x-paystack-signature
========================================================= */

router.post(
  "/paystack/webhook",
  paystackWebhook,
);

/* =========================================================
   PAYSTACK STUDENT PAYMENT

   These MUST appear before /:id routes.
========================================================= */

router.post(
  "/paystack/initialize",
  authenticate,
  authorize("student"),
  initializePaystackPayment,
);

router.post(
  "/paystack/verify",
  authenticate,
  authorize("student"),
  verifyPaystackPayment,
);

router.get(
  "/paystack/receipt/:reference",
  authenticate,
  authorize("student"),
  getMyPaymentReceipt,
);

/* =========================================================
   FINANCE / ADMIN
========================================================= */

router.post(
  "/",
  authenticate,
  authorize(
    "finance",
    "admin",
  ),
  recordPayment,
);

router.get(
  "/",
  authenticate,
  authorize(
    "finance",
    "admin",
  ),
  getPayments,
);

router.get(
  "/dashboard",
  authenticate,
  authorize(
    "finance",
    "admin",
  ),
  getFinanceDashboard,
);

router.get(
  "/students-fees",
  authenticate,
  authorize(
    "finance",
    "admin",
  ),
  getStudentsFees,
);

router.get(
  "/balance",
  authenticate,
  authorize(
    "finance",
    "admin",
  ),
  getStudentBalance,
);

/* =========================================================
   STUDENT
========================================================= */

router.get(
  "/me",
  authenticate,
  authorize("student"),
  getMyPayments,
);

router.get(
  "/me/balance",
  authenticate,
  authorize("student"),
  getMyBalance,
);

/* =========================================================
   PAYMENT DETAILS / MANUAL VERIFICATION

   IMPORTANT:
   Keep /:id LAST.
========================================================= */

router.get(
  "/:id",
  authenticate,
  authorize(
    "finance",
    "admin",
  ),
  getPaymentById,
);

router.post(
  "/:id/verify",
  authenticate,
  authorize(
    "finance",
    "admin",
  ),
  verifyPayment,
);

export default router;