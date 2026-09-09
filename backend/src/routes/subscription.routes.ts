import { Router } from "express";

import {
  subscribeToNewsletter,
} from "../controllers/newsletter.controller.js";

const router = Router();

/**
 * Public newsletter subscription.
 *
 * POST /api/subscriptions
 */
router.post(
  "/",
  subscribeToNewsletter,
);

export default router;

