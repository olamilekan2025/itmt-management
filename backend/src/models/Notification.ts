import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

/* =========================================================
   TYPES
========================================================= */

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "admission"
  | "result"
  | "course"
  | "registration"
  | "user"
  | "announcement"
  | "system";

/* =========================================================
   NOTIFICATION DOCUMENT
========================================================= */

export interface INotification
  extends Document {
  recipient: Types.ObjectId;

  title: string;
  message: string;

  type: NotificationType;

  isRead: boolean;

  link?: string;

  metadata?: Record<
    string,
    unknown
  >;

  createdAt: Date;
  updatedAt: Date;
}

/* =========================================================
   SCHEMA
========================================================= */

const notificationSchema =
  new Schema<INotification>(
    {
      /* =====================================================
         RECIPIENT
      ====================================================== */

      recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      /* =====================================================
         TITLE
      ====================================================== */

      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      /* =====================================================
         MESSAGE
      ====================================================== */

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
      },

      /* =====================================================
         TYPE
      ====================================================== */

      type: {
        type: String,

        enum: [
          "info",
          "success",
          "warning",
          "error",
          "admission",
          "result",
          "course",
          "registration",
          "user",
          "announcement",
          "system",
        ],

        default: "info",

        required: true,
      },

      /* =====================================================
         READ STATUS
      ====================================================== */

      isRead: {
        type: Boolean,
        default: false,
        required: true,
        index: true,
      },

      /* =====================================================
         OPTIONAL LINK
      ====================================================== */

      link: {
        type: String,
        trim: true,
        maxlength: 500,
      },

      /* =====================================================
         OPTIONAL METADATA
      ====================================================== */

      metadata: {
        type: Schema.Types.Mixed,
      },
    },
    {
      timestamps: true,
    },
  );

/* =========================================================
   INDEX
========================================================= */

notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

/* =========================================================
   MODEL
========================================================= */

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>(
    "Notification",
    notificationSchema,
  );

export default Notification;