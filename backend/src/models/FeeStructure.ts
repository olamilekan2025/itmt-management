import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFeeStructure extends Document {
  programme: Types.ObjectId;
  level: string;
  semester: Types.ObjectId;
  amount: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const feeStructureSchema = new Schema<IFeeStructure>(
  {
    programme: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    level: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
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

feeStructureSchema.index(
  { programme: 1, level: 1, semester: 1 },
  { unique: true },
);

const FeeStructure =
  mongoose.models.FeeStructure ||
  mongoose.model<IFeeStructure>("FeeStructure", feeStructureSchema);

export default FeeStructure;