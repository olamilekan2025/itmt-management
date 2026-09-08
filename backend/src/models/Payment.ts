import mongoose, { Document, Schema, Types } from "mongoose";

export type PaymentMethod = "cash" | "bank_transfer" | "card" | "other";

export type PaymentStatus = "pending" | "successful" | "failed" | "refunded" | "cancelled";

export type PaymentPurpose = "tuition" | "registration" | "examination" | "acceptance" | "transcript" | "certificate" | "hostel" | "other";

export interface IPayment extends Document {
  student: Types.ObjectId;
  studentName?: string;
  matricNumber?: string;
  semester: Types.ObjectId;
  academicSession?: Types.ObjectId;
  programme?: Types.ObjectId;
  department?: Types.ObjectId;
  amount: number;
  currency: string;
  method: PaymentMethod;
  purpose: PaymentPurpose;
  paymentReference: string;
  invoiceNumber?: string;
  paymentProvider?: string;
  providerTransactionRef?: string;
  status: PaymentStatus;
  notes?: string;
  recordedBy: Types.ObjectId;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  paidAt?: Date;
  receiptUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      trim: true,
    },
    matricNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
      index: true,
    },
    academicSession: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
      index: true,
    },
    programme: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
      trim: true,
    },
    method: {
      type: String,
      enum: ["cash", "bank_transfer", "card", "other"],
      default: "cash",
    },
    purpose: {
      type: String,
      enum: ["tuition", "registration", "examination", "acceptance", "transcript", "certificate", "hostel", "other"],
      default: "tuition",
      required: true,
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    paymentProvider: {
      type: String,
      trim: true,
    },
    providerTransactionRef: {
      type: String,
      trim: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "refunded", "cancelled"],
      default: "successful",
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
      index: true,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================================================
   INDEXES
========================================================= */

paymentSchema.index({ providerTransactionRef: 1 }, { sparse: true });
paymentSchema.index({ student: 1, semester: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ purpose: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ paidAt: -1 });

const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;