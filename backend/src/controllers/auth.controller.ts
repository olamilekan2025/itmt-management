import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import type { AuthRequest } from "../middleware/auth.middleware.js";
import User from "../models/User.js";

import {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/email.js";

import {
  generateOtp,
  generateVerificationToken,
  hashToken,
} from "../utils/token.js";

/**
 * =========================================================
 * SCHEMAS
 * =========================================================
 */

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

const studentLoginSchema = z.object({
  matricNumber: z
    .string()
    .trim()
    .min(1, "Matric number is required")
    .max(30, "Matric number is too long"),

  password: z
    .string()
    .min(1, "Password is required"),
});

const loginWithOtpSchema = loginSchema.extend({
  otp: z
    .string()
    .trim()
    .length(6, "OTP must be 6 digits")
    .optional(),
});

const verifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(),

  token: z
    .string()
    .min(10),
});

const resendVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(),
});

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(),
});

const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(),

  token: z
    .string()
    .min(10),

  password: z
    .string()
    .min(
      8,
      "Password must be at least 8 characters",
    )
    .max(100, "Password is too long"),
});

const oauthLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(),

  name: z
    .string()
    .trim()
    .min(1),

  provider: z.enum([
    "google",
    "facebook",
  ]),
});

/**
 * =========================================================
 * JWT
 * =========================================================
 */

function createToken(
  userId: string,
  role: string,
) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not defined",
    );
  }

  return jwt.sign(
    {
      userId,
      role,
    },
    secret,
    {
      expiresIn: "7d",
    },
  );
}

/**
 * =========================================================
 * REGISTER
 * =========================================================
 *
 * NOTE:
 * Public registration creates a student account.
 *
 * Students who already have a matric number should NOT
 * use this endpoint. They should use the existing-student
 * account flow handled by the admin.
 */

export async function register(
  req: Request,
  res: Response,
) {
  try {
    const data =
      registerSchema.parse(req.body);

    const normalizedEmail =
      data.email.trim().toLowerCase();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        data.password,
        12,
      );

    const {
      token: verificationToken,
      hash: verificationHash,
    } =
      generateVerificationToken();

    const user = await User.create({
      name: data.name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      isEmailVerified: false,
      emailVerificationTokenHash:
        verificationHash,
      emailVerificationExpires:
        new Date(
          Date.now() +
            24 * 60 * 60 * 1000,
        ),
      isActive: true,
    });

    const frontendUrl =
      process.env.FRONTEND_URL;

    if (!frontendUrl) {
      console.error(
        "FRONTEND_URL is not defined",
      );
    } else {
      const verifyLink =
        `${frontendUrl}/auth/verify-email` +
        `?token=${verificationToken}` +
        `&email=${encodeURIComponent(
          user.email,
        )}`;

      try {
        await sendVerificationEmail(
          user.email,
          user.name,
          verifyLink,
        );
      } catch (emailError) {
        console.error(
          "Failed to send verification email:",
          emailError,
        );
      }
    }

    return res.status(201).json({
      success: true,
      message:
        "Account created. Please check your email to verify your address before logging in.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code ===
        11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    console.error(
      "Registration error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create account",
    });
  }
}

/**
 * =========================================================
 * VERIFY EMAIL
 * =========================================================
 */

export async function verifyEmail(
  req: Request,
  res: Response,
) {
  try {
    const data =
      verifyEmailSchema.parse(req.body);

    const user =
      await User.findOne({
        email: data.email
          .toLowerCase()
          .trim(),
      }).select(
        "+emailVerificationTokenHash +emailVerificationExpires",
      );

    if (
      !user ||
      !user.emailVerificationTokenHash ||
      !user.emailVerificationExpires
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired verification link",
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message:
          "Email already verified",
      });
    }

    if (
      user.emailVerificationExpires <
      new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Verification link has expired. Please request a new one.",
      });
    }

    if (
      hashToken(data.token) !==
      user.emailVerificationTokenHash
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid verification link",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash =
      undefined;
    user.emailVerificationExpires =
      undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    console.error(
      "Verify email error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify email",
    });
  }
}

/**
 * =========================================================
 * RESEND VERIFICATION
 * =========================================================
 */

export async function resendVerification(
  req: Request,
  res: Response,
) {
  try {
    const data =
      resendVerificationSchema.parse(
        req.body,
      );

    const genericResponse = {
      success: true,
      message:
        "If an unverified account exists with that email, a new verification link has been sent.",
    };

    const user =
      await User.findOne({
        email: data.email
          .toLowerCase()
          .trim(),
      });

    if (
      !user ||
      user.isEmailVerified
    ) {
      return res
        .status(200)
        .json(genericResponse);
    }

    const {
      token: verificationToken,
      hash: verificationHash,
    } =
      generateVerificationToken();

    user.emailVerificationTokenHash =
      verificationHash;

    user.emailVerificationExpires =
      new Date(
        Date.now() +
          24 * 60 * 60 * 1000,
      );

    await user.save();

    const frontendUrl =
      process.env.FRONTEND_URL;

    if (frontendUrl) {
      const verifyLink =
        `${frontendUrl}/auth/verify-email` +
        `?token=${verificationToken}` +
        `&email=${encodeURIComponent(
          user.email,
        )}`;

      try {
        await sendVerificationEmail(
          user.email,
          user.name,
          verifyLink,
        );
      } catch (emailError) {
        console.error(
          "Failed to resend verification email:",
          emailError,
        );
      }
    }

    return res
      .status(200)
      .json(genericResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    console.error(
      "Resend verification error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to resend verification email",
    });
  }
}

/**
 * =========================================================
 * FORGOT PASSWORD
 * =========================================================
 */

export async function forgotPassword(
  req: Request,
  res: Response,
) {
  try {
    const data =
      forgotPasswordSchema.parse(
        req.body,
      );

    const genericResponse = {
      success: true,
      message:
        "If an account exists with that email, a password reset link has been sent.",
    };

    const user =
      await User.findOne({
        email: data.email
          .toLowerCase()
          .trim(),
      });

    if (!user) {
      return res
        .status(200)
        .json(genericResponse);
    }

    const {
      token: resetToken,
      hash: resetHash,
    } =
      generateVerificationToken();

    user.passwordResetTokenHash =
      resetHash;

    user.passwordResetExpires =
      new Date(
        Date.now() +
          60 * 60 * 1000,
      );

    await user.save();

    const frontendUrl =
      process.env.FRONTEND_URL;

    if (frontendUrl) {
      const resetLink =
        `${frontendUrl}/auth/reset-password` +
        `?token=${resetToken}` +
        `&email=${encodeURIComponent(
          user.email,
        )}`;

      try {
        await sendPasswordResetEmail(
          user.email,
          user.name,
          resetLink,
        );
      } catch (emailError) {
        console.error(
          "Failed to send password reset email:",
          emailError,
        );
      }
    }

    return res
      .status(200)
      .json(genericResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    console.error(
      "Forgot password error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process request",
    });
  }
}

/**
 * =========================================================
 * RESET PASSWORD
 * =========================================================
 */

export async function resetPassword(
  req: Request,
  res: Response,
) {
  try {
    const data =
      resetPasswordSchema.parse(
        req.body,
      );

    const user =
      await User.findOne({
        email: data.email
          .toLowerCase()
          .trim(),
      }).select(
        "+passwordResetTokenHash +passwordResetExpires",
      );

    if (
      !user ||
      !user.passwordResetTokenHash ||
      !user.passwordResetExpires
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired reset link",
      });
    }

    if (
      user.passwordResetExpires <
      new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reset link has expired. Please request a new one.",
      });
    }

    if (
      hashToken(data.token) !==
      user.passwordResetTokenHash
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid reset link",
      });
    }

    user.password =
      await bcrypt.hash(
        data.password,
        12,
      );

    user.passwordResetTokenHash =
      undefined;

    user.passwordResetExpires =
      undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    console.error(
      "Reset password error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset password",
    });
  }
}

/**
 * =========================================================
 * OAUTH LOGIN
 * =========================================================
 */

export async function oauthLogin(
  req: Request,
  res: Response,
) {
  try {
    const data =
      oauthLoginSchema.parse(
        req.body,
      );

    const normalizedEmail =
      data.email
        .trim()
        .toLowerCase();

    let user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      user = await User.create({
        name: data.name,
        email: normalizedEmail,
        role: "student",
        isEmailVerified: true,
        isActive: true,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "This account has been deactivated",
      });
    }

    const token = createToken(
      user._id.toString(),
      user.role,
    );

    return res.status(200).json({
      success: true,
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        matricNumber:
          user.matricNumber,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    console.error(
      "OAuth login error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to complete social sign-in",
    });
  }
}

/**
 * =========================================================
 * STAFF LOGIN REQUEST
 * =========================================================
 *
 * Staff:
 * email + password
 *       ↓
 * OTP
 *       ↓
 * login
 *
 * Students should use studentLogin().
 */

export async function loginRequest(
  req: Request,
  res: Response,
) {
  try {
    const data =
      loginSchema.parse(req.body);

    const user =
      await User.findOne({
        email: data.email
          .toLowerCase()
          .trim(),
      }).select("+password");

    if (
      !user ||
      !user.password
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "This account has been deactivated",
      });
    }

    /**
     * Students should not use the staff login.
     */
    if (user.role === "student") {
      return res.status(403).json({
        success: false,
        message:
          "Students must log in using their matric number",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        data.password,
        user.password,
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const {
      otp,
      hash: otpHash,
    } = generateOtp();

    user.otpHash = otpHash;

    user.otpExpires =
      new Date(
        Date.now() +
          10 * 60 * 1000,
      );

    await user.save();

    try {
      await sendOtpEmail(
        user.email,
        user.name,
        otp,
      );
    } catch (emailError) {
      console.error(
        "Failed to send OTP email:",
        emailError,
      );

      /**
       * Remove generated OTP if delivery failed.
       */
      user.otpHash = undefined;
      user.otpExpires = undefined;

      await user.save();

      return res.status(502).json({
        success: false,
        message:
          "Unable to send OTP email. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      requiresOtp: true,
      message:
        "A one-time code has been sent to your email",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    console.error(
      "Login request error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process login request",
    });
  }
}

/**
 * =========================================================
 * STAFF LOGIN / OTP VERIFICATION
 * =========================================================
 */

export async function login(
  req: Request,
  res: Response,
) {
  try {
    const data =
      loginWithOtpSchema.parse(
        req.body,
      );

    const user =
      await User.findOne({
        email: data.email
          .toLowerCase()
          .trim(),
      }).select(
        "+password +otpHash +otpExpires",
      );

    if (
      !user ||
      !user.password
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "This account has been deactivated",
      });
    }

    /**
     * Students must use matric-number login.
     */
    if (user.role === "student") {
      return res.status(403).json({
        success: false,
        message:
          "Students must log in using their matric number",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        data.password,
        user.password,
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    if (!data.otp) {
      return res.status(400).json({
        success: false,
        message:
          "OTP is required",
      });
    }

    if (
      !user.otpHash ||
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      return res.status(401).json({
        success: false,
        message:
          "OTP has expired. Please request a new one.",
      });
    }

    if (
      hashToken(data.otp) !==
      user.otpHash
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid OTP",
      });
    }

    /**
     * OTP is one-time-use.
     */
    user.otpHash = undefined;
    user.otpExpires = undefined;

    await user.save();

    const token = createToken(
      user._id.toString(),
      user.role,
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    console.error(
      "Login error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
}

/**
 * =========================================================
 * STUDENT LOGIN
 * =========================================================
 *
 * Students:
 *
 * matric number + password
 *          ↓
 * direct login
 *
 * No email OTP is required here because the student's
 * identity/account is established by the institution.
 */

export async function studentLogin(
  req: Request,
  res: Response,
) {
  try {
    const data =
      studentLoginSchema.parse(
        req.body,
      );

    const normalizedMatricNumber =
      data.matricNumber
        .trim()
        .toUpperCase();

    const user =
      await User.findOne({
        matricNumber:
          normalizedMatricNumber,
      }).select("+password");

    if (
      !user ||
      !user.password
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid matric number or password",
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message:
          "This account is not a student account",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "This account has been deactivated",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        data.password,
        user.password,
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid matric number or password",
      });
    }

    const token = createToken(
      user._id.toString(),
      user.role,
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        matricNumber:
          user.matricNumber,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    console.error(
      "Student login error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to log in",
    });
  }
}

/**
 * =========================================================
 * GET CURRENT USER
 * =========================================================
 */

export async function getCurrentUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const user =
      await User.findById(
        req.user.userId,
      )
        .select(
          "name email role isActive createdAt matricNumber programme academicSession level isEmailVerified",
        )
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "academicSession",
          "name",
        );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve user",
    });
  }
}