import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

/* =========================================================
   TYPES
========================================================= */

export type AnnouncementAudience =
  | "everyone"
  | "students"
  | "lecturers"
  | "staff";

export type AnnouncementStatus =
  | "draft"
  | "published"
  | "archived";

/* =========================================================
   DOCUMENT
========================================================= */

export interface IAnnouncement extends Document {
  title: string;
  content: string;

  audience: AnnouncementAudience;
  status: AnnouncementStatus;

  createdBy: Types.ObjectId;

  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/* =========================================================
   SCHEMA
========================================================= */

const announcementSchema =
  new Schema<IAnnouncement>(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10000,
      },

      audience: {
        type: String,
        enum: [
          "everyone",
          "students",
          "lecturers",
          "staff",
        ],
        default: "everyone",
        required: true,
      },

      status: {
        type: String,
        enum: [
          "draft",
          "published",
          "archived",
        ],
        default: "draft",
        required: true,
      },

      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      publishedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    },
  );

/* =========================================================
   MODEL
========================================================= */

const Announcement =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>(
    "Announcement",
    announcementSchema,
  );

export default Announcement;