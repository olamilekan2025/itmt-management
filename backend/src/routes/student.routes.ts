import { Router } from "express";

import {
  createExistingStudent,
} from "../controllers/student.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/*
 * Admin creates accounts for students who already
 * have official matric numbers.
 */
router.post(
  "/existing",
  authenticate,
  authorize("admin"),
  createExistingStudent,
);

export default router;