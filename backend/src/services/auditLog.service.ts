import type { Request } from "express";

import AuditLog, {
  type AuditAction,
  type AuditModule,
  type AuditStatus,
} from "../models/AuditLog.js";

import type { AuthRequest } from "../middleware/auth.middleware.js";

/**
 * =========================================================
 * CREATE AUDIT LOG OPTIONS
 * =========================================================
 */

export interface CreateAuditLogOptions {
  req?: Request;

  /**
   * Optional explicit actor information.
   *
   * If actorId / actorRole are not provided, the values
   * will be resolved from req.user when available.
   */
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;

  /**
   * Audit action and module.
   */
  action: AuditAction;
  module: AuditModule;

  /**
   * Human-readable audit description.
   */
  description: string;

  /**
   * Resource being affected by the action.
   *
   * IMPORTANT:
   * This must be targetId because the AuditLog model,
   * audit wrapper, and controllers all use targetId.
   */
  targetType?: string;
  targetId?: string;
   resourceId?: string;

  /**
   * Additional structured information about the action.
   */
  metadata?: Record<string, unknown>;

  /**
   * Audit operation status.
   */
  status?: AuditStatus;
}

/**
 * =========================================================
 * CREATE AUDIT LOG
 * =========================================================
 *
 * Audit logging must NEVER break the main business
 * operation.
 *
 * Any audit error is caught and logged internally.
 */

export async function createAuditLog(
  options: CreateAuditLogOptions,
): Promise<void> {
  try {
    const {
      req,
      actorId,
      actorName,
      actorEmail,
      actorRole,
      action,
      module,
      description,
      targetType,
      targetId,
      metadata,
      status = "success",
    } = options;

    /**
     * =====================================================
     * AUTHENTICATED USER
     * =====================================================
     */

    const authRequest =
      req as AuthRequest | undefined;

    const authenticatedUser =
      authRequest?.user;

    /**
     * =====================================================
     * RESOLVE ACTOR
     * =====================================================
     */

    const resolvedActorId =
      actorId ??
      authenticatedUser?.userId;

    const resolvedActorRole =
      actorRole ??
      authenticatedUser?.role;

    /**
     * =====================================================
     * ACTOR SNAPSHOT
     * =====================================================
     *
     * Explicit values take priority.
     *
     * Name/email may be supplied directly by callers.
     */

    const resolvedActorName =
      actorName;

    const resolvedActorEmail =
      actorEmail;

    /**
     * =====================================================
     * IP ADDRESS
     * =====================================================
     *
     * x-forwarded-for can contain:
     *
     * client, proxy1, proxy2
     *
     * We use the first address.
     */

    const forwardedFor =
      req?.headers["x-forwarded-for"];

    let ipAddress:
      | string
      | undefined;

    if (
      typeof forwardedFor ===
      "string"
    ) {
      ipAddress =
        forwardedFor
          .split(",")[0]
          ?.trim() || undefined;
    } else if (
      Array.isArray(forwardedFor)
    ) {
      ipAddress =
        forwardedFor[0]?.trim() ||
        undefined;
    } else {
      ipAddress =
        req?.ip || undefined;
    }

    /**
     * =====================================================
     * USER AGENT
     * =====================================================
     */

    const userAgent =
      typeof req?.headers["user-agent"] ===
      "string"
        ? req.headers["user-agent"]
        : undefined;

    /**
     * =====================================================
     * CREATE AUDIT LOG
     * =====================================================
     */

    await AuditLog.create({
      actor:
        resolvedActorId || undefined,

      actorName:
        resolvedActorName || undefined,

      actorEmail:
        resolvedActorEmail || undefined,

      actorRole:
        resolvedActorRole || undefined,

      action,

      module,

      description,

      targetType:
        targetType || undefined,

      targetId:
        targetId || undefined,

      metadata,

      ipAddress,

      userAgent,

      status,
    });
  } catch (error) {
    /**
     * IMPORTANT:
     *
     * Never throw audit errors back into the
     * controller/business operation.
     */

    console.error(
      "Audit log creation failed:",
      error,
    );
  }
}

