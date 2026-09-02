import mongoose, { Document, Schema, Types } from "mongoose";

export interface ILecturerAssignment extends Document {
  lecturer: Types.ObjectId;
  course: Types.ObjectId;
  semester: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lecturerAssignmentSchema = new Schema<ILecturerAssignment>(
  {
    lecturer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
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

lecturerAssignmentSchema.index(
  { lecturer: 1, course: 1, semester: 1 },
  { unique: true },
);

const LecturerAssignment =
  mongoose.models.LecturerAssignment ||
  mongoose.model<ILecturerAssignment>(
    "LecturerAssignment",
    lecturerAssignmentSchema,
  );

export default LecturerAssignment;