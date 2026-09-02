import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISemester extends Document {
  session: Types.ObjectId;
  name: string;
  order: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const semesterSchema = new Schema<ISemester>(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

semesterSchema.index({ session: 1, name: 1 }, { unique: true });
semesterSchema.index({ session: 1, order: 1 }, { unique: true });

const Semester =
  mongoose.models.Semester ||
  mongoose.model<ISemester>("Semester", semesterSchema);

export default Semester;