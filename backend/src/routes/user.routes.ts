import { Router } from "express";

import {
  assignProgramme,
  createExistingStudent,
  createStaffUser,
  getMe,
  getStaffUsers,
  getStaffUserById,
  getUsers,
  getUserById,

  activateUser,
  deactivateUser,

  activateStaffUser,
  deactivateStaffUser,
  suspendStaffUser,
  unsuspendStaffUser,

  updateMyProfile,
  changeMyPassword,
} from "../controllers/user.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * =========================================================
 * CURRENT AUTHENTICATED USER
 * =========================================================
 */

router.get(
  "/me",
  authenticate,
  getMe,
);

/**
 * =========================================================
 * CURRENT USER PROFILE
 * =========================================================
 */

router.patch(
  "/me",
  authenticate,
  updateMyProfile,
);

/**
 * =========================================================
 * CURRENT USER PASSWORD
 * =========================================================
 */

router.patch(
  "/me/password",
  authenticate,
  changeMyPassword,
);

/**
 * =========================================================
 * STAFF
 * =========================================================
 */

router.get(
  "/staff",
  authenticate,
  authorize("admin"),
  getStaffUsers,
);

router.get(
  "/staff/:id",
  authenticate,
  authorize("admin"),
  getStaffUserById,
);

router.post(
  "/staff",
  authenticate,
  authorize("admin"),
  createStaffUser,
);

/**
 * =========================================================
 * STAFF ACCOUNT STATUS
 * =========================================================
 */

router.patch(
  "/staff/:id/activate",
  authenticate,
  authorize("admin"),
  activateStaffUser,
);

router.patch(
  "/staff/:id/deactivate",
  authenticate,
  authorize("admin"),
  deactivateStaffUser,
);

router.patch(
  "/staff/:id/suspend",
  authenticate,
  authorize("admin"),
  suspendStaffUser,
);

router.patch(
  "/staff/:id/unsuspend",
  authenticate,
  authorize("admin"),
  unsuspendStaffUser,
);

/**
 * =========================================================
 * EXISTING STUDENTS
 * =========================================================
 */

router.post(
  "/students/existing",
  authenticate,
  authorize("admin"),
  createExistingStudent,
);

/**
 * =========================================================
 * ALL USERS
 * =========================================================
 */

router.get(
  "/",
  authenticate,
  authorize(
    "admin",
    "registrar",
    "finance",
  ),
  getUsers,
);

/**
 * =========================================================
 * USER PROGRAMME
 * =========================================================
 */

router.patch(
  "/:id/programme",
  authenticate,
  authorize(
    "admin",
    "registrar",
  ),
  assignProgramme,
);

/**
 * =========================================================
 * STUDENT ACCOUNT STATUS
 * =========================================================
 */

router.patch(
  "/:id/activate",
  authenticate,
  authorize("admin"),
  activateUser,
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("admin"),
  deactivateUser,
);

/**
 * =========================================================
 * USER BY ID
 * =========================================================
 *
 * Keep this LAST.
 */

router.get(
  "/:id",
  authenticate,
  authorize(
    "admin",
    "registrar",
  ),
  getUserById,
);

export default router;