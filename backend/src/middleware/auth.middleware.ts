
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import User, { type UserRole } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

interface TokenPayload {
  userId: string;
  role: UserRole;
  tokenVersion?: number;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not defined");

    return res.status(500).json({
      success: false,
      message: "Authentication service is unavailable",
    });
  }

  try {
    const token = authorization.slice("Bearer ".length);
    const decoded = jwt.verify(token, secret) as TokenPayload;

    if (
      typeof decoded.userId !== "string" ||
      typeof decoded.role !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const user = await User.findById(decoded.userId).select(
      "_id role isActive isSuspended tokenVersion",
    );

    if (!user || !user.isActive || user.isSuspended) {
      return res.status(401).json({
        success: false,
        message: "Your account is unavailable",
      });
    }

    const currentVersion = user.tokenVersion ?? 0;
    const tokenVersion = decoded.tokenVersion ?? 0;

    if (
      tokenVersion !== currentVersion ||
      decoded.role !== user.role
    ) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please sign in again.",
      });
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    return next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token",
      });
    }

    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to authenticate request",
    });
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    return next();
  };
}
