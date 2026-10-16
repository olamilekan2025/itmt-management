
import mongoose, { Document, Schema } from "mongoose";

export type TeamGroup = "management" | "staff";

export interface ITeamMember extends Document {
  name: string;
  badge: string;
  title: string;
  group: TeamGroup;

  imageUrl: string;
  imagePublicId?: string;

  bio?: string;
  department?: string;
  email?: string;
  phone?: string;

  cvUrl?: string;
  cvFileName?: string;
  cvPublicId?: string;

  order: number;
  isPublished: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    badge: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    group: {
      type: String,
      enum: ["management", "staff"],
      required: true,
      index: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    imagePublicId: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    department: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 40,
    },

    cvUrl: {
      type: String,
      trim: true,
    },

    cvFileName: {
      type: String,
      trim: true,
      maxlength: 255,
    },

    cvPublicId: {
      type: String,
      trim: true,
    },

    order: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

teamMemberSchema.index({
  group: 1,
  order: 1,
  createdAt: -1,
});

const TeamMember =
  mongoose.models.TeamMember ||
  mongoose.model<ITeamMember>("TeamMember", teamMemberSchema);

export default TeamMember;
