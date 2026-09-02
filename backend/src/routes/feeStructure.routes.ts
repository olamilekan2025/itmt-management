import { Router } from "express";

import {
  archiveFeeStructure,
  createFeeStructure,
  getFeeStructures,
} from "../controllers/feeStructure.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getFeeStructures);
router.post("/", authenticate, authorize("finance", "admin"), createFeeStructure);
router.patch(
  "/:id/archive",
  authenticate,
  authorize("finance", "admin"),
  archiveFeeStructure,
);

export default router;