import { Router } from "express";

import {
  archiveDepartment,
  createDepartment,
  getDepartments,
  updateDepartment,
} from "../controllers/department.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getDepartments);

router.post(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  createDepartment,
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin", "registrar"),
  updateDepartment,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  archiveDepartment,
);

export default router;