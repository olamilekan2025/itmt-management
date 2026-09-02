import { z } from "zod";

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
    .refine(
      (data) =>
        data.status !== "rejected" ||
        Boolean(data.rejectionReason),
      {
        message:
          "Rejection reason is required when rejecting a request.",
        path: ["rejectionReason"],
      },
    );

export type CreateTranscriptRequestInput =
  z.infer<
    typeof createTranscriptRequestSchema
  >;

export type UpdateTranscriptRequestStatusInput =
  z.infer<
    typeof updateTranscriptRequestStatusSchema
  >;