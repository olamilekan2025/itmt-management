import mongoose, {
  Document as MongooseDocument,
  Schema,
  Types,
} from "mongoose";

/* =========================================================
   TYPES
========================================================= */

export type StudentDocumentType =
  | "admission_letter"
  | "registration_slip"
  | "fee_receipt"
  | "result"
  | "transcript"
  | "certificate"
  | "identity"
  | "other";

/* =========================================================
   INTERFACE
========================================================= */

export interface IStudentDocument extends MongooseDocument {
  student: Types.ObjectId;

  title: string;

  type: StudentDocumentType;

  description?: string;

  fileUrl: string;

  fileName: string;

  mimeType: string;

  fileSize?: number;

  cloudinaryPublicId: string;

  cloudinaryResourceType: string;

  academicSession?: Types.ObjectId;

  semester?: Types.ObjectId;

  issuedAt?: Date;

  uploadedBy: Types.ObjectId;

  isAvailable: boolean;

  createdAt: Date;

  updatedAt: Date;
}

/* =========================================================
   SCHEMA
========================================================= */

const studentDocumentSchema = new Schema<IStudentDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

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
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    fileSize: {
      type: Number,
      min: 0,
    },

    cloudinaryPublicId: {
      type: String,
      required: true,
      trim: true,
    },

    cloudinaryResourceType: {
      type: String,
      required: true,
      default: "raw",
      trim: true,
    },

    academicSession: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
    },

    semester: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
    },

    issuedAt: {
      type: Date,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

/* =========================================================
   INDEXES
========================================================= */

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
  createdAt: -1,
});

/* =========================================================
   MODEL
========================================================= */

const StudentDocument =
  mongoose.models.StudentDocument ||
  mongoose.model<IStudentDocument>(
    "StudentDocument",
    studentDocumentSchema,
  );

export default StudentDocument;