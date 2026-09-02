import { Router } from "express";

import {
  registerCourses,
  getMyRegistrations,
  getRegistrations,
  dropRegistration,
  getCourseRoster,
} from "../controllers/registration.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, authorize("student"), registerCourses);
router.get("/me", authenticate, authorize("student"), getMyRegistrations);
router.get(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  getRegistrations,
);

router.get("/roster", authenticate, authorize("lecturer"), getCourseRoster);
router.patch(
  "/:id/drop",
  authenticate,
  authorize("student"),
  dropRegistration,
);

export default router;