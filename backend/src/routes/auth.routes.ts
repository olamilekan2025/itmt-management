
import { Router } from "express";

import {
  forgotPassword,
  getCurrentUser,
  login,
  loginRequest,
  logout,
  oauthLogin,
  resendVerification,
  resetPassword,
  studentLogin,
  verifyEmail,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Email verification
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

// Password recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Login
router.post("/oauth-login", oauthLogin);
router.post("/login-request", loginRequest);
router.post("/login", login);
router.post("/student/login", studentLogin);

// Protected authentication routes
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);

export default router;
