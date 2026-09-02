import { Router } from "express";

import {
  forgotPassword,
  getCurrentUser,
  login,
  loginRequest,
  oauthLogin,
  register,
  resendVerification,
  resetPassword,
  studentLogin,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Public registration disabled — use the admissions application workflow instead
// router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/oauth-login", oauthLogin);
router.post("/login-request", loginRequest);
router.post("/login", login);
router.post("/student/login", studentLogin);

router.get("/me", authenticate, getCurrentUser);

export default router;