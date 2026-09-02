import mongoose, { Document, Schema, Types } from "mongoose";

export type PaymentMethod = "cash" | "bank_transfer" | "card" | "other";

export interface IPayment extends Document {
  student: Types.ObjectId;
  semester: Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    method: {
      type: String,
      enum: ["cash", "bank_transfer", "card", "other"],
      default: "cash",
    },
    reference: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;