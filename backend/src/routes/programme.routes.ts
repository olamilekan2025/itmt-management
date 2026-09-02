  import { Router } from "express";

import {
  archiveProgramme,
  createProgramme,
  getProgrammes,
  updateProgramme,
} from "../controllers/programme.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

// Public endpoint for admissions page
router.get("/public", getProgrammes);

// Protected endpoint for admin use
router.get("/", authenticate, getProgrammes);

router.post(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  createProgramme,
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin", "registrar"),
  updateProgramme,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  archiveProgramme,
);

export default router;