import mongoose, {
  Document as MongooseDocument,
  Schema,
  Types,
} from "mongoose";

/**
 * =========================================================
 * DOCUMENT TYPES
 * =========================================================
 */

export type StudentDocumentType =
  | "admission_letter"
  | "registration_slip"
  | "fee_receipt"
  | "result"
  | "transcript"
  | "certificate"
  | "identity"
  | "other";

/**
 * =========================================================
 * DOCUMENT INTERFACE
 * =========================================================
 */

export interface IStudentDocument extends MongooseDocument {
  student: Types.ObjectId;

  title: string;

  type: StudentDocumentType;

  description?: string;

  fileUrl: string;

  fileName: string;

  mimeType: string;

  fileSize?: number;

  academicSession?: Types.ObjectId;

  semester?: Types.ObjectId;

  issuedAt?: Date;

  uploadedBy: Types.ObjectId;

  isAvailable: boolean;

  createdAt: Date;

  updatedAt: Date;
}

/**
 * =========================================================
 * SCHEMA
 * =========================================================
 */

const studentDocumentSchema = new Schema<IStudentDocument>(
  {
    /**
     * Student who owns the document
     */
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Document title
     */
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    /**
     * Document category
     */
    type: {
      type: String,
      enum: [
        "admission_letter",
        "registration_slip",
        "fee_receipt",
        "result",
        "transcript",
        "certificate",
        "identity",
        "other",
      ],
      required: true,
      index: true,
    },

    /**
     * Optional description
     */
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    /**
     * Cloudinary or other storage URL
     */
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Original filename
     */
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    /**
     * MIME type
     * Example:
     * application/pdf
     * image/jpeg
     */
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * File size in bytes
     */
    fileSize: {
      type: Number,
      min: 0,
    },

    /**
     * Academic session related to document
     */
    academicSession: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
    },

    /**
     * Semester related to document
     */
    semester: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
    },

    /**
     * Date the document was issued
     */
    issuedAt: {
      type: Date,
    },

    /**
     * Staff/admin who uploaded the document
     */
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * Allows staff to temporarily hide a document
     */
    isAvailable: {
      type: Boolean,
      default: true,
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

studentDocumentSchema.index({
  student: 1,
  createdAt: -1,
});

studentDocumentSchema.index({
  student: 1,
  type: 1,
});

studentDocumentSchema.index({
  student: 1,
  isAvailable: 1,
});

/**
 * =========================================================
 * MODEL
 * =========================================================
 */

const StudentDocument =
  mongoose.models.StudentDocument ||
  mongoose.model<IStudentDocument>(
    "StudentDocument",
    studentDocumentSchema,
  );

export default StudentDocument;