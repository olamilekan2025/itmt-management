import type { Response } from "express";
import { Types } from "mongoose";

import { TranscriptRequest } from "../models/transcript-request.model.js";

import {
  createTranscriptRequestSchema,
  updateTranscriptRequestStatusSchema,
} from "../validators/transcript-request.validator.js";

import type { AuthRequest } from "../middleware/auth.middleware.js";

/* =========================================================
   TYPES
========================================================= */

const TRANSCRIPT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "processing",
  "ready",
  "collected",
] as const;

type TranscriptStatus =
  (typeof TRANSCRIPT_STATUSES)[number];

/* =========================================================
   HELPERS
========================================================= */

function isValidObjectId(
  id: unknown,
): id is string {
  return (
    typeof id === "string" &&
    Types.ObjectId.isValid(id)
  );
}

/* =========================================================
   STUDENT
   CREATE TRANSCRIPT REQUEST
========================================================= */

export const createTranscriptRequest =
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

      if (
        req.user.role !== "student"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only students can submit transcript requests.",
        });
      }

      /* =====================================================
         VALIDATE REQUEST BODY
      ===================================================== */

      const parsed =
        createTranscriptRequestSchema.safeParse(
          req.body,
        );

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid transcript request data.",
          errors:
            parsed.error.flatten(),
        });
      }

      const studentId =
        req.user.userId;

      /* =====================================================
         CHECK ACTIVE REQUEST
      ===================================================== */

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

      /* =====================================================
         CREATE REQUEST
      ===================================================== */

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

      /* =====================================================
         POPULATE REQUEST
      ===================================================== */

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

        request:
          populatedRequest,
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
   STUDENT
   GET MY TRANSCRIPT REQUESTS
========================================================= */

export const getMyTranscriptRequests =
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

      if (
        req.user.role !== "student"
      ) {
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
   ADMIN
   GET ALL TRANSCRIPT REQUESTS
========================================================= */

export const getTranscriptRequests =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      if (
        !req.user?.userId
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      if (
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only administrators can access transcript requests.",
        });
      }

      const {
        status,
        search,
      } = req.query;

      const filter: Record<
        string,
        unknown
      > = {};

      /* =====================================================
         STATUS FILTER
      ===================================================== */

      if (
        typeof status === "string" &&
        TRANSCRIPT_STATUSES.includes(
          status as TranscriptStatus,
        )
      ) {
        filter.status = status;
      }

      /* =====================================================
         GET REQUESTS
      ===================================================== */

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

      /* =====================================================
         SEARCH
      ===================================================== */

      if (
        typeof search === "string" &&
        search.trim()
      ) {
        const query =
          search
            .trim()
            .toLowerCase();

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
   ADMIN
   GET SINGLE REQUEST
========================================================= */

export const getTranscriptRequestById =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      if (
        !req.user?.userId
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      if (
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only administrators can access transcript requests.",
        });
      }

      const id =
        req.params.id;

      if (
        !isValidObjectId(id)
      ) {
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
   ADMIN
   UPDATE REQUEST STATUS
========================================================= */

export const updateTranscriptRequestStatus =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      if (
        !req.user?.userId
      ) {
        return res.status(401).json({
          success: false,

          message:
            "Authentication required.",
        });
      }

      if (
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,

          message:
            "Only administrators can update transcript requests.",
        });
      }

      const id =
        req.params.id;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid transcript request ID.",
        });
      }

      /* =====================================================
         VALIDATE BODY
      ===================================================== */

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

      /* =====================================================
         FIND REQUEST
      ===================================================== */

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

      /* =====================================================
         STATUS TRANSITIONS
      ===================================================== */

      /* Collected is final. */

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

      /* Rejected can be reopened only through approval. */

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

      /* Pending → Approved / Rejected */

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

      /* Approved → Processing / Rejected */

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

      /* Processing → Ready */

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

      /* Ready → Collected */

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

      /* =====================================================
         REJECTION
      ===================================================== */

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

      /* =====================================================
         APPLY UPDATE
      ===================================================== */

      request.status =
        status;

      if (
        adminNote !== undefined
      ) {
        request.adminNote =
          adminNote;
      }

      if (
        status === "rejected"
      ) {
        request.rejectionReason =
          rejectionReason?.trim();
      } else {
        request.rejectionReason =
          undefined;
      }

      /* =====================================================
         PROCESSING INFORMATION
      ===================================================== */

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

      /* =====================================================
         COLLECTION INFORMATION
      ===================================================== */

      if (
        status === "collected"
      ) {
        request.collectedAt =
          new Date();
      }

      /* =====================================================
         SAVE
      ===================================================== */

      await request.save();

      /* =====================================================
         RETURN POPULATED REQUEST
      ===================================================== */

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