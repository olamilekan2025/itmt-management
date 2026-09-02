import { Router } from "express";

import {
  getMyBalance,
  getMyPayments,
  getPayments,
  getStudentBalance,
  recordPayment,
} from "../controllers/payment.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, authorize("finance", "admin"), recordPayment);
router.get("/", authenticate, authorize("finance", "admin"), getPayments);
router.get(
  "/balance",
  authenticate,
  authorize("finance", "admin"),
  getStudentBalance,
);
router.get("/me", authenticate, authorize("student"), getMyPayments);
router.get("/me/balance", authenticate, authorize("student"), getMyBalance);

export default router;