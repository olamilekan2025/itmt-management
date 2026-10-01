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
  updateMyPreferences,

  deleteUser,
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
 *
 * GET /api/users/me
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
 *
 * PATCH /api/users/me
 *
 * Allows the authenticated user to update:
 * - name
 * - email
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
 *
 * PATCH /api/users/me/password
 */

router.patch(
  "/me/password",
  authenticate,
  changeMyPassword,
);

/**
 * =========================================================
 * CURRENT USER PREFERENCES
 * =========================================================
 *
 * PATCH /api/users/me/preferences
 */

router.patch(
  "/me/preferences",
  authenticate,
  updateMyPreferences,
);

/**
 * =========================================================
 * STAFF
 * =========================================================
 *
 * Admin only.
 */

/**
 * GET /api/users/staff
 */
router.get(
  "/staff",
  authenticate,
  authorize("admin"),
  getStaffUsers,
);

/**
 * GET /api/users/staff/:id
 */
router.get(
  "/staff/:id",
  authenticate,
  authorize("admin"),
  getStaffUserById,
);

/**
 * POST /api/users/staff
 */
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

/**
 * PATCH /api/users/staff/:id/activate
 */
router.patch(
  "/staff/:id/activate",
  authenticate,
  authorize("admin"),
  activateStaffUser,
);

/**
 * PATCH /api/users/staff/:id/deactivate
 */
router.patch(
  "/staff/:id/deactivate",
  authenticate,
  authorize("admin"),
  deactivateStaffUser,
);

/**
 * PATCH /api/users/staff/:id/suspend
 */
router.patch(
  "/staff/:id/suspend",
  authenticate,
  authorize("admin"),
  suspendStaffUser,
);

/**
 * PATCH /api/users/staff/:id/unsuspend
 */
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
 *
 * POST /api/users/students/existing
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
 *
 * GET /api/users
 *
 * Accessible by:
 * - admin
 * - registrar
 * - finance
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
 *
 * PATCH /api/users/:id/programme
 *
 * Admin and registrar only.
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
 *
 * Admin only.
 */

/**
 * PATCH /api/users/:id/activate
 */
router.patch(
  "/:id/activate",
  authenticate,
  authorize("admin"),
  activateUser,
);

/**
 * PATCH /api/users/:id/deactivate
 */
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("admin"),
  deactivateUser,
);

/**
 * =========================================================
 * DELETE USER
 * =========================================================
 *
 * DELETE /api/users/:id
 *
 * Admin only.
 *
 * The controller is responsible for:
 * - validating the user ID
 * - checking that the user exists
 * - preventing an administrator from deleting their own account
 * - permanently deleting the account
 * - creating an audit log
 */

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteUser,
);

/**
 * =========================================================
 * USER BY ID
 * =========================================================
 *
 * GET /api/users/:id
 *
 * IMPORTANT:
 * Keep this route LAST so:
 *
 * /me
 * /staff
 * /staff/:id
 *
 * are not accidentally interpreted as a generic :id route.
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