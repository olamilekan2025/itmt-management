import mongoose, { Document, Schema, Types } from "mongoose";

export type GraduationStatus =
  | "eligible"
  | "not_eligible"
  | "approved"
  | "graduated";

export interface IGraduation extends Document {
  student: Types.ObjectId;
  programme: Types.ObjectId;
  academicSession: Types.ObjectId;

  status: GraduationStatus;

  requiredCreditUnits: number;
  earnedCreditUnits: number;

  totalRegisteredCourses: number;
  completedCourses: number;
  failedCourses: number;
  missingResults: number;

  failedCourseIds: Types.ObjectId[];
  missingResultCourseIds: Types.ObjectId[];

  eligibilityReason: string;

  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;

  graduatedBy?: Types.ObjectId;
  graduatedAt?: Date;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const graduationSchema = new Schema<IGraduation>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    programme: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
      index: true,
    },

    academicSession: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "eligible",
        "not_eligible",
        "approved",
        "graduated",
      ],
      default: "not_eligible",
      index: true,
    },

    requiredCreditUnits: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    earnedCreditUnits: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalRegisteredCourses: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    completedCourses: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    failedCourses: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    missingResults: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    failedCourseIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    missingResultCourseIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    eligibilityReason: {
      type: String,
      required: true,
      trim: true,
      default: "Academic requirements have not been satisfied.",
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },

    graduatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    graduatedAt: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  },
);

graduationSchema.index(
  {
    student: 1,
    academicSession: 1,
  },
  {
    unique: true,
  },
);

graduationSchema.index({
  programme: 1,
  academicSession: 1,
  status: 1,
});

export default mongoose.model<IGraduation>(
  "Graduation",
  graduationSchema,
);