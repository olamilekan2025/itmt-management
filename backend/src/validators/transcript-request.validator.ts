import { z } from "zod";

/* =========================================================
   CREATE TRANSCRIPT REQUEST
========================================================= */

export const createTranscriptRequestSchema =
  z.object({
    requestType: z.enum([
      "official",
      "unofficial",
    ]),

    purpose: z
      .string()
      .trim()
      .min(
        3,
        "Purpose must be at least 3 characters.",
      )
      .max(
        500,
        "Purpose cannot exceed 500 characters.",
      ),

    destination: z
      .string()
      .trim()
      .max(
        300,
        "Destination cannot exceed 300 characters.",
      )
      .optional(),
  });

/* =========================================================
   UPDATE TRANSCRIPT REQUEST STATUS
========================================================= */

export const updateTranscriptRequestStatusSchema =
  z
    .object({
      status: z.enum([
        "approved",
        "rejected",
        "processing",
        "ready",
        "collected",
      ]),

      adminNote: z
        .string()
        .trim()
        .max(
          1000,
          "Admin note cannot exceed 1000 characters.",
        )
        .optional(),

      rejectionReason: z
        .string()
        .trim()
        .max(
          1000,
          "Rejection reason cannot exceed 1000 characters.",
        )
        .optional(),
    })
    .superRefine(
      (data, ctx) => {
        /* ===================================================
           REJECTION REASON
        =================================================== */

        if (
          data.status === "rejected" &&
          !data.rejectionReason
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,

            path: [
              "rejectionReason",
            ],

            message:
              "Rejection reason is required when rejecting a request.",
          });
        }

        /* ===================================================
           REJECTION REASON SHOULD NOT BE USED
           FOR NON-REJECTED STATUS
        =================================================== */

        if (
          data.status !== "rejected" &&
          data.rejectionReason
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,

            path: [
              "rejectionReason",
            ],

            message:
              "Rejection reason can only be provided when rejecting a request.",
          });
        }
      },
    );

/* =========================================================
   TYPES
========================================================= */

export type CreateTranscriptRequestInput =
  z.infer<
    typeof createTranscriptRequestSchema
  >;

export type UpdateTranscriptRequestStatusInput =
  z.infer<
    typeof updateTranscriptRequestStatusSchema
  >;