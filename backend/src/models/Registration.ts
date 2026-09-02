import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRegistration extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  semester: Types.ObjectId;
  programme: Types.ObjectId;
  status: "registered" | "dropped";
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    student: {
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
    programme: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "dropped"],
      default: "registered",
    },
  },
  {
    timestamps: true,
  },
);

registrationSchema.index(
  { student: 1, course: 1, semester: 1 },
  { unique: true },
);

const Registration =
  mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", registrationSchema);

export default Registration;