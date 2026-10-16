
import { Router } from "express";

import {
  getPublicTeamMembers,
  getAllTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/team.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

import {
  uploadTeamMemberFiles,
} from "../middleware/upload.middleware.js";

const router = Router();

// Public: published team members only.
router.get("/", getPublicTeamMembers);

// Admin: all team members, including unpublished entries.
router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  getAllTeamMembers,
);

// Admin: create a team member with an image and optional CV.
router.post(
  "/",
  authenticate,
  authorize("admin"),
  uploadTeamMemberFiles,
  createTeamMember,
);

// Admin: update details, replace the image/CV, or remove the CV.
router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  uploadTeamMemberFiles,
  updateTeamMember,
);

// Admin: delete the team member and associated Cloudinary assets.
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteTeamMember,
);

export default router;
