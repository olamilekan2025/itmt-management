import { Document, Model, Schema, Types, model } from "mongoose";

export type TranscriptRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "processing"
  | "ready"
  | "collected";

export type TranscriptRequestType =
  | "official"
  | "unofficial";

export interface ITranscriptRequest extends Document {
  student: Types.ObjectId;
  requestType: TranscriptRequestType;
  purpose: string;
  destination?: string;
  status: TranscriptRequestStatus;

  adminNote?: string;
  rejectionReason?: string;

  processedBy?: Types.ObjectId;
  requestedAt: Date;
  processedAt?: Date;
  collectedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const transcriptRequestSchema =
  new Schema<ITranscriptRequest>(
    {
      student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      requestType: {
        type: String,
        enum: ["official", "unofficial"],
        required: true,
        default: "official",
      },

      purpose: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 500,
      },

      destination: {
        type: String,
        trim: true,
        maxlength: 300,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
          "processing",
          "ready",
          "collected",
        ],
        default: "pending",
        required: true,
        index: true,
      },

      adminNote: {
        type: String,
        trim: true,
        maxlength: 1000,
      },

      rejectionReason: {
        type: String,
        trim: true,
        maxlength: 1000,
      },

      processedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      requestedAt: {
        type: Date,
        default: Date.now,
        required: true,
        index: true,
      },

      processedAt: {
        type: Date,
      },

      collectedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    },
  );

/*
 * Prevent multiple active transcript requests
 * for the same student.
 *
 * A student may create another request after the
 * previous request has been rejected or collected.
 */
transcriptRequestSchema.index(
  {
    student: 1,
    status: 1,
  },
);

export const TranscriptRequest: Model<ITranscriptRequest> =
  model<ITranscriptRequest>(
    "TranscriptRequest",
    transcriptRequestSchema,
  );