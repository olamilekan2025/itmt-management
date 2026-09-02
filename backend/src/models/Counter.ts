import mongoose, { Document, Schema } from "mongoose";

export interface ICounter extends Document {
  key: string;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
}

const counterSchema = new Schema<ICounter>(
  {
    key: { type: String, required: true, unique: true, index: true },
    sequence: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const Counter = mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema);

export default Counter;
