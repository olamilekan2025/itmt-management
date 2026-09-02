import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

/**
 * =========================================================
 * AUDIT ACTIONS
 * =========================================================
 */

export const AUDIT_ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "PUBLISH",
  "UNPUBLISH",
  "ACTIVATE",
  "DEACTIVATE",
  "SUSPEND",
  "UNSUSPEND",
  "ASSIGN",
  "UNASSIGN",
  "PASSWORD_RESET",
  "OTHER",
] as const;

export type AuditAction =
  (typeof AUDIT_ACTIONS)[number];

/**
 * =========================================================
 * AUDIT MODULES
 * =========================================================
 */

export const AUDIT_MODULES = [
  "AUTH",
  "USERS",
  "ADMISSIONS",
  "DEPARTMENTS",
  "PROGRAMMES",
  "ACADEMIC_SESSIONS",
  "SEMESTERS",
  "COURSES",
  "REGISTRATIONS",
  "LECTURER_ASSIGNMENTS",
  "RESULTS",
  "FEE_STRUCTURES",
  "PAYMENTS",
  "STUDENTS",
  "TRANSCRIPTS",
  "NOTIFICATIONS",
  "ANNOUNCEMENTS",
  "ACADEMIC_REPORTS",
  "SYSTEM",
] as const;

export type AuditModule =
  (typeof AUDIT_MODULES)[number];

/**
 * =========================================================
 * AUDIT STATUS
 * =========================================================
 */

export const AUDIT_STATUSES = [
  "success",
  "failed",
] as const;

export type AuditStatus =
  (typeof AUDIT_STATUSES)[number];

/**
 * =========================================================
 * AUDIT LOG DOCUMENT
 * =========================================================
 */

export interface IAuditLog extends Document {
  actor?: Types.ObjectId;

  actorName?: string;
  actorEmail?: string;
  actorRole?: string;

  action: AuditAction;
  module: AuditModule;

  description: string;

  targetType?: string;
  targetId?: string;

  metadata?: Record<string, unknown>;

  ipAddress?: string;
  userAgent?: string;

  status: AuditStatus;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * =========================================================
 * AUDIT LOG SCHEMA
 * =========================================================
 */

const auditLogSchema =
  new Schema<IAuditLog>(
    {
      /**
       * =====================================================
       * ACTOR
       * =====================================================
       */

      actor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },

      /**
       * Snapshot of actor information.
       *
       * We keep these values even if the user later changes
       * their name, email, or role.
       */

      actorName: {
        type: String,
        trim: true,
      },

      actorEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },

      actorRole: {
        type: String,
        trim: true,
        index: true,
      },

      /**
       * =====================================================
       * ACTION
       * =====================================================
       */

      action: {
        type: String,
        enum: AUDIT_ACTIONS,
        required: true,
        index: true,
      },

      /**
       * =====================================================
       * MODULE
       * =====================================================
       */

      module: {
        type: String,
        enum: AUDIT_MODULES,
        required: true,
        index: true,
      },

      /**
       * =====================================================
       * DESCRIPTION
       * =====================================================
       */

      description: {
        type: String,
        required: true,
        trim: true,
      },

      /**
       * =====================================================
       * TARGET
       * =====================================================
       */

      targetType: {
        type: String,
        trim: true,
      },

      targetId: {
        type: String,
        trim: true,
        index: true,
      },

      /**
       * =====================================================
       * METADATA
       * =====================================================
       */

      metadata: {
        type: Schema.Types.Mixed,
      },

      /**
       * =====================================================
       * REQUEST INFORMATION
       * =====================================================
       */

      ipAddress: {
        type: String,
        trim: true,
      },

      userAgent: {
        type: String,
        trim: true,
      },

      /**
       * =====================================================
       * STATUS
       * =====================================================
       */

      status: {
        type: String,
        enum: AUDIT_STATUSES,
        default: "success",
        required: true,
        index: true,
      },
    },
    {
      timestamps: true,
    },
  );

/**
 * =========================================================
 * INDEXES
 * =========================================================
 */

/**
 * Newest logs first.
 */
auditLogSchema.index({
  createdAt: -1,
});

/**
 * Filter by module + newest first.
 */
auditLogSchema.index({
  module: 1,
  createdAt: -1,
});

/**
 * Filter by action + newest first.
 */
auditLogSchema.index({
  action: 1,
  createdAt: -1,
});

/**
 * Filter by actor role + newest first.
 */
auditLogSchema.index({
  actorRole: 1,
  createdAt: -1,
});

/**
 * Filter by status + newest first.
 */
auditLogSchema.index({
  status: 1,
  createdAt: -1,
});

/**
 * Find activity for a specific target.
 */
auditLogSchema.index({
  targetType: 1,
  targetId: 1,
  createdAt: -1,
});

/**
 * Find activity performed by a specific actor.
 */
auditLogSchema.index({
  actor: 1,
  createdAt: -1,
});

/**
 * =========================================================
 * MODEL
 * =========================================================
 */

const AuditLog =
  mongoose.models.AuditLog ??
  mongoose.model<IAuditLog>(
    "AuditLog",
    auditLogSchema,
  );

export default AuditLog;