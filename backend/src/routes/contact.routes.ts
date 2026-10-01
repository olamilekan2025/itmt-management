import { Router } from "express";

import {
  archiveContactMessage,
  listContactMessages,
  markContactMessageRead,
  replyToContactMessage,
  restoreContactMessage,
  submitContactMessage,
} from "../controllers/contact.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/* -------------------------------------------------------------------------- */
/* Public                                                                     */
/* -------------------------------------------------------------------------- */

router.post(
  "/",
  submitContactMessage,
);

/* -------------------------------------------------------------------------- */
/* Admin / Registrar                                                          */
/* -------------------------------------------------------------------------- */

router.get(
  "/",
  authenticate,
  authorize(
    "admin",
    "registrar",
  ),
  listContactMessages,
);

router.patch(
  "/:id/read",
  authenticate,
  authorize(
    "admin",
    "registrar",
  ),
  markContactMessageRead,
);

router.patch(
  "/:id/archive",
  authenticate,
  authorize(
    "admin",
    "registrar",
  ),
  archiveContactMessage,
);

router.patch(
  "/:id/restore",
  authenticate,
  authorize(
    "admin",
    "registrar",
  ),
  restoreContactMessage,
);

router.post(
  "/:id/reply",
  authenticate,
  authorize(
    "admin",
    "registrar",
  ),
  replyToContactMessage,
);

export default router;