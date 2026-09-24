import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   INTERFACE
========================================================= */

export interface ITranscriptRequest
  extends Document {
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

/* =========================================================
   SCHEMA
========================================================= */

const transcriptRequestSchema =
  new Schema<ITranscriptRequest>(
    {
      /* =====================================================
         STUDENT
      ===================================================== */

      student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      /* =====================================================
         REQUEST TYPE
      ===================================================== */

      requestType: {
        type: String,

        enum: [
          "official",
          "unofficial",
        ],

        required: true,

        default: "official",
      },

      /* =====================================================
         PURPOSE
      ===================================================== */

      purpose: {
        type: String,

        required: true,

        trim: true,

        minlength: 3,

        maxlength: 500,
      },

      /* =====================================================
         DESTINATION
      ===================================================== */

      destination: {
        type: String,

        trim: true,

        maxlength: 300,
      },

      /* =====================================================
         STATUS
      ===================================================== */

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

      /* =====================================================
         ADMIN NOTE
      ===================================================== */

      adminNote: {
        type: String,

        trim: true,

        maxlength: 1000,
      },

      /* =====================================================
         REJECTION REASON
      ===================================================== */

      rejectionReason: {
        type: String,

        trim: true,

        maxlength: 1000,
      },

      /* =====================================================
         PROCESSED BY
      ===================================================== */

      processedBy: {
        type: Schema.Types.ObjectId,

        ref: "User",
      },

      /* =====================================================
         REQUESTED AT
      ===================================================== */

      requestedAt: {
        type: Date,

        default: Date.now,

        required: true,

        index: true,
      },

      /* =====================================================
         PROCESSED AT
      ===================================================== */

      processedAt: {
        type: Date,
      },

      /* =====================================================
         COLLECTED AT
      ===================================================== */

      collectedAt: {
        type: Date,
      },
    },

    {
      timestamps: true,
    },
  );

/* =========================================================
   INDEXES
========================================================= */

/*
 * Allows efficient lookup of a student's requests
 * by status.
 */
transcriptRequestSchema.index({
  student: 1,
  status: 1,
});

/*
 * Allows efficient admin listing by newest request.
 */
transcriptRequestSchema.index({
  requestedAt: -1,
});

/*
 * Allows efficient admin filtering by status
 * and newest request.
 */
transcriptRequestSchema.index({
  status: 1,
  requestedAt: -1,
});

/* =========================================================
   MODEL
========================================================= */

const TranscriptRequest =
  (mongoose.models
    .TranscriptRequest as Model<ITranscriptRequest>) ||
  mongoose.model<ITranscriptRequest>(
    "TranscriptRequest",
    transcriptRequestSchema,
  );

export { TranscriptRequest };

export default TranscriptRequest;