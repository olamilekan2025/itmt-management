import type { Response } from "express";
import { Types } from "mongoose";

import { TranscriptRequest } from "../models/transcript-request.model.js";
import {
  createTranscriptRequestSchema,
  updateTranscriptRequestStatusSchema,
} from "../validators/transcript-request.validator.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

/* =========================================================
   CONSTANTS
========================================================= */

const TRANSCRIPT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "processing",
  "ready",
  "collected",
] as const;

/* =========================================================
   HELPERS
========================================================= */

function isValidObjectId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    Types.ObjectId.isValid(id)
  );
}

/* =========================================================
   STUDENT — CREATE REQUEST
========================================================= */

export const createTranscriptRequest = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    /*
     * Only students can create transcript requests.
     *
     * The route should also use authorize("student"),
     * but keeping this check here provides an additional
     * layer of protection.
     */
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message:
          "Only students can submit transcript requests.",
      });
    }

    const parsed =
      createTranscriptRequestSchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data.",
        errors: parsed.error.flatten(),
      });
    }

    const studentId = req.user.userId;

    /*
     * Prevent duplicate active requests.
     */
    const existing =
      await TranscriptRequest.findOne({
        student: studentId,
        status: {
          $in: [
            "pending",
            "approved",
            "processing",
            "ready",
          ],
        },
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "You already have an active transcript request.",
        request: existing,
      });
    }

    const request =
      await TranscriptRequest.create({
        student: studentId,
        requestType:
          parsed.data.requestType,
        purpose:
          parsed.data.purpose,
        destination:
          parsed.data.destination,
        status: "pending",
      });

    const populatedRequest =
      await TranscriptRequest.findById(
        request._id,
      ).populate(
        "student",
        "name email matricNumber programme",
      );

    return res.status(201).json({
      success: true,
      message:
        "Transcript request submitted successfully.",
      request: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Create transcript request error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create transcript request.",
    });
  }
};

/* =========================================================
   STUDENT — MY REQUESTS
========================================================= */

export const getMyTranscriptRequests = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message:
          "Only students can access their transcript requests.",
      });
    }

    const requests =
      await TranscriptRequest.find({
        student: req.user.userId,
      })
        .populate(
          "student",
          "name email matricNumber programme",
        )
        .populate(
          "processedBy",
          "name email",
        )
        .sort({
          requestedAt: -1,
        });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "Get my transcript requests error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load transcript requests.",
    });
  }
};

/* =========================================================
   ADMIN — GET ALL REQUESTS
========================================================= */

export const getTranscriptRequests = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { status, search } =
      req.query;

    const filter: Record<
      string,
      unknown
    > = {};

    /*
     * Filter by status.
     */
    if (
      typeof status === "string" &&
      TRANSCRIPT_STATUSES.includes(
        status as (typeof TRANSCRIPT_STATUSES)[number],
      )
    ) {
      filter.status = status;
    }

    let requests =
      await TranscriptRequest.find(
        filter,
      )
        .populate(
          "student",
          "name email matricNumber programme",
        )
        .populate(
          "processedBy",
          "name email",
        )
        .sort({
          requestedAt: -1,
        });

    /*
     * Search populated student information.
     *
     * This is acceptable for the current expected
     * transcript-request volume.
     */
    if (
      typeof search === "string" &&
      search.trim()
    ) {
      const query =
        search.trim().toLowerCase();

      requests =
        requests.filter(
          (request) => {
            const student =
              request.student as unknown as {
                name?: string;
                email?: string;
                matricNumber?: string;
              };

            return (
              student?.name
                ?.toLowerCase()
                .includes(query) ||
              student?.email
                ?.toLowerCase()
                .includes(query) ||
              student?.matricNumber
                ?.toLowerCase()
                .includes(query)
            );
          },
        );
    }

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "Get transcript requests error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load transcript requests.",
    });
  }
};

/* =========================================================
   ADMIN — GET SINGLE REQUEST
========================================================= */

export const getTranscriptRequestById =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const id = req.params.id;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid transcript request ID.",
        });
      }

      const request =
        await TranscriptRequest.findById(
          id,
        )
          .populate(
            "student",
            "name email matricNumber programme",
          )
          .populate(
            "processedBy",
            "name email",
          );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Transcript request not found.",
        });
      }

      return res.status(200).json({
        success: true,
        request,
      });
    } catch (error) {
      console.error(
        "Get transcript request error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load transcript request.",
      });
    }
  };

/* =========================================================
   ADMIN — UPDATE STATUS
========================================================= */

export const updateTranscriptRequestStatus =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const id = req.params.id;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid transcript request ID.",
        });
      }

      const parsed =
        updateTranscriptRequestStatusSchema.safeParse(
          req.body,
        );

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status update.",
          errors:
            parsed.error.flatten(),
        });
      }

      const request =
        await TranscriptRequest.findById(
          id,
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Transcript request not found.",
        });
      }

      const {
        status,
        adminNote,
        rejectionReason,
      } = parsed.data;

      /*
       * =====================================================
       * STATUS TRANSITION PROTECTION
       * =====================================================
       */

      /*
       * Collected is final.
       */
      if (
        request.status ===
          "collected" &&
        status !== "collected"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A collected transcript request cannot be changed.",
        });
      }

      /*
       * Rejected requests must first be approved.
       */
      if (
        request.status ===
          "rejected" &&
        status !== "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A rejected request must first be approved before further processing.",
        });
      }

      /*
       * Pending requests can only be:
       *
       * approved
       * rejected
       */
      if (
        request.status ===
          "pending" &&
        ![
          "approved",
          "rejected",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A pending request can only be approved or rejected.",
        });
      }

      /*
       * Approved requests can move to:
       *
       * processing
       * rejected
       */
      if (
        request.status ===
          "approved" &&
        ![
          "processing",
          "rejected",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "An approved request can only move to processing or rejected.",
        });
      }

      /*
       * Processing requests can move to:
       *
       * ready
       */
      if (
        request.status ===
          "processing" &&
        status !== "ready"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A processing request can only move to ready.",
        });
      }

      /*
       * Ready requests can move to:
       *
       * collected
       */
      if (
        request.status ===
          "ready" &&
        status !== "collected"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A ready request can only be marked as collected.",
        });
      }

      /*
       * =====================================================
       * REJECTION VALIDATION
       * =====================================================
       */

      if (
        status === "rejected" &&
        !rejectionReason?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A rejection reason is required when rejecting a transcript request.",
        });
      }

      /*
       * =====================================================
       * UPDATE REQUEST
       * =====================================================
       */

      request.status =
        status;

      if (
        adminNote !== undefined
      ) {
        request.adminNote =
          adminNote;
      }

      if (status === "rejected") {
        request.rejectionReason =
          rejectionReason?.trim();
      } else {
        request.rejectionReason =
          undefined;
      }

      /*
       * Record the admin/staff member who
       * processed the request.
       */
      if (
        [
          "approved",
          "rejected",
          "processing",
          "ready",
        ].includes(status)
      ) {
        request.processedBy =
          new Types.ObjectId(
            req.user.userId,
          );

        request.processedAt =
          new Date();
      }

      /*
       * Record collection time.
       */
      if (
        status === "collected"
      ) {
        request.collectedAt =
          new Date();
      }

      await request.save();

      /*
       * Return populated request.
       */
      const populatedRequest =
        await TranscriptRequest.findById(
          request._id,
        )
          .populate(
            "student",
            "name email matricNumber programme",
          )
          .populate(
            "processedBy",
            "name email",
          );

      return res.status(200).json({
        success: true,
        message:
          "Transcript request status updated successfully.",
        request:
          populatedRequest,
      });
    } catch (error) {
      console.error(
        "Update transcript request status error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update transcript request.",
      });
    }
  };

