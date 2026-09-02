import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProgramme extends Document {
  name: string;
  code: string;
  department: Types.ObjectId;
  award?: string;
  durationYears?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const programmeSchema = new Schema<IProgramme>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    award: {
      type: String,
      trim: true,
    },
    durationYears: {
      type: Number,
      min: 1,
      max: 10,
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

const Programme =
  mongoose.models.Programme ||
  mongoose.model<IProgramme>("Programme", programmeSchema);

export default Programme;