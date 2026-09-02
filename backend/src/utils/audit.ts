import type { Request } from "express";

import {
  createAuditLog,
} from "../services/auditLog.service.js";

import type {
  AuditAction,
  AuditModule,
  AuditStatus,
} from "../models/AuditLog.js";

/**
 * =========================================================
 * AUDIT LOGGER OPTIONS
 * =========================================================
 */

export interface AuditLogOptions {
  req?: Request;

  action: AuditAction;
  module: AuditModule;

  description: string;

  targetType?: string;
  targetId?: string;

  metadata?: Record<string, unknown>;

  status?: AuditStatus;
}

/**
 * =========================================================
 * LOG AUDIT
 * =========================================================
 *
 * Convenience wrapper used by controllers/services.
 */

export async function logAudit(
  options: AuditLogOptions,
): Promise<void> {
  await createAuditLog({
    req: options.req,

    action: options.action,
    module: options.module,

    description:
      options.description,

    targetType:
      options.targetType,

    targetId:
      options.targetId,

    metadata:
      options.metadata,

    status:
      options.status,
  });
}