import type { Response } from "express";
import mongoose from "mongoose";

import AuditLog, {
  AUDIT_ACTIONS,
  AUDIT_MODULES,
  AUDIT_STATUSES,
} from "../models/AuditLog.js";

import type { AuthRequest } from "../middleware/auth.middleware.js";

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

/**
 * Escape user input before putting it into a MongoDB regex.
 *
 * This prevents characters such as:
 * . * + ? ^ $ { } ( ) | [ ] \
 * from being interpreted as regex operators.
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Read a query-string value safely.
 *
 * Express query parameters may be string, string[],
 * ParsedQs, ParsedQs[], or undefined depending on
 * the Express/TypeScript version.
 */
function getQueryString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

/**
 * Read a route parameter safely.
 *
 * Express may type route params as string | string[].
 * MongoDB ObjectId validation requires a single string.
 */
function getRouteParam(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * =========================================================
 * GET AUDIT LOGS
 * GET /api/audit-logs
 * =========================================================
 */
export async function getAuditLogs(
  req: AuthRequest,
  res: Response,
) {
  try {
    /**
     * =====================================================
     * PAGINATION
     * =====================================================
     */

    const requestedPage = Number(req.query.page);
    const requestedLimit = Number(req.query.limit);

    const page =
      Number.isFinite(requestedPage) && requestedPage > 0
        ? Math.floor(requestedPage)
        : 1;

    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), 100)
        : 20;

    const skip = (page - 1) * limit;

    /**
     * =====================================================
     * QUERY PARAMETERS
     * =====================================================
     */

    const search = getQueryString(req.query.search);

    const action = getQueryString(req.query.action);

    const module = getQueryString(req.query.module);

    const role = getQueryString(req.query.role);

    const status = getQueryString(req.query.status);

    const from = getQueryString(req.query.from);

    const to = getQueryString(req.query.to);

    /**
     * =====================================================
     * FILTER
     * =====================================================
     */

    const filter: Record<string, unknown> = {};

    /**
     * =====================================================
     * SEARCH
     * =====================================================
     */

    if (search) {
      const safeSearch = escapeRegex(search);

      filter.$or = [
        {
          description: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          actorName: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          actorEmail: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          targetType: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          targetId: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    /**
     * =====================================================
     * ACTION FILTER
     * =====================================================
     */

    if (action) {
      if (
        !AUDIT_ACTIONS.includes(
          action as (typeof AUDIT_ACTIONS)[number],
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid audit action filter",
        });
      }

      filter.action = action;
    }

    /**
     * =====================================================
     * MODULE FILTER
     * =====================================================
     */

    if (module) {
      if (
        !AUDIT_MODULES.includes(
          module as (typeof AUDIT_MODULES)[number],
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid audit module filter",
        });
      }

      filter.module = module;
    }

    /**
     * =====================================================
     * ROLE FILTER
     * =====================================================
     *
     * Role is intentionally not hard-coded here.
     *
     * This allows future roles to be supported without
     * changing this controller.
     */

    if (role) {
      filter.actorRole = role;
    }

    /**
     * =====================================================
     * STATUS FILTER
     * =====================================================
     */

    if (status) {
      if (
        !AUDIT_STATUSES.includes(
          status as (typeof AUDIT_STATUSES)[number],
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid audit status filter",
        });
      }

      filter.status = status;
    }

    /**
     * =====================================================
     * DATE FILTER
     * =====================================================
     */

    if (from || to) {
      const createdAt: {
        $gte?: Date;
        $lte?: Date;
      } = {};

      /**
       * -----------------------------------------------------
       * FROM DATE
       * -----------------------------------------------------
       */

      if (from) {
        const fromDate = new Date(from);

        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid 'from' date",
          });
        }

        /**
         * If frontend sends YYYY-MM-DD,
         * start at beginning of that day.
         */
        if (/^\d{4}-\d{2}-\d{2}$/.test(from)) {
          fromDate.setHours(
            0,
            0,
            0,
            0,
          );
        }

        createdAt.$gte = fromDate;
      }

      /**
       * -----------------------------------------------------
       * TO DATE
       * -----------------------------------------------------
       */

      if (to) {
        const toDate = new Date(to);

        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid 'to' date",
          });
        }

        /**
         * If frontend sends YYYY-MM-DD,
         * include the entire day.
         */
        if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
          toDate.setHours(
            23,
            59,
            59,
            999,
          );
        }

        createdAt.$lte = toDate;
      }

      /**
       * -----------------------------------------------------
       * INVALID DATE RANGE
       * -----------------------------------------------------
       */

      if (
        createdAt.$gte &&
        createdAt.$lte &&
        createdAt.$gte.getTime() >
          createdAt.$lte.getTime()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "'from' date cannot be later than 'to' date",
        });
      }

      if (Object.keys(createdAt).length > 0) {
        filter.createdAt = createdAt;
      }
    }

    /**
     * =====================================================
     * DATABASE QUERY
     * =====================================================
     */

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate(
          "actor",
          "name email role",
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      AuditLog.countDocuments(filter),
    ]);

    /**
     * =====================================================
     * PAGINATION RESPONSE
     * =====================================================
     */

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(total / limit);

    return res.status(200).json({
      success: true,

      data: {
        items: logs,

        pagination: {
          page,
          limit,
          total,
          totalPages,

          hasNextPage:
            page < totalPages,

          hasPreviousPage:
            page > 1 && totalPages > 0,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get audit logs error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve audit logs",
    });
  }
}

/**
 * =========================================================
 * GET SINGLE AUDIT LOG
 * GET /api/audit-logs/:id
 * =========================================================
 */
export async function getAuditLogById(
  req: AuthRequest,
  res: Response,
) {
  try {
    /**
     * =====================================================
     * GET AND NORMALIZE ID
     * =====================================================
     *
     * IMPORTANT:
     *
     * req.params.id can be typed as:
     *
     * string | string[]
     *
     * Therefore we must narrow it to string before
     * passing it to mongoose.Types.ObjectId.isValid().
     */

    const id = getRouteParam(req.params.id);

    /**
     * =====================================================
     * VALIDATE ID
     * =====================================================
     */

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid audit log ID",
      });
    }

    /**
     * =====================================================
     * FIND LOG
     * =====================================================
     */

    const log = await AuditLog.findById(id)
      .populate(
        "actor",
        "name email role",
      )
      .lean();

    /**
     * =====================================================
     * NOT FOUND
     * =====================================================
     */

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error(
      "Get audit log error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve audit log",
    });
  }
}