import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICourse extends Document {
  code: string;
  title: string;
  programme: Types.ObjectId;
  semester: Types.ObjectId;
  level: string;
  creditUnits: number;
  category?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    programme: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    level: {
      type: String,
      required: true,
      trim: true,
    },
    creditUnits: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

courseSchema.index(
  { programme: 1, semester: 1, code: 1 },
  { unique: true },
);

const Course =
  mongoose.models.Course || mongoose.model<ICourse>("Course", courseSchema);

export default Course;