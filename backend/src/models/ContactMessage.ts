import mongoose, {
  Document,
  Schema,
} from "mongoose";

export type ContactMessageStatus =
  | "new"
  | "read"
  | "archived";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;

  isRead: boolean;
  status: ContactMessageStatus;

  archivedAt?: Date | null;
  repliedAt?: Date | null;
  repliedBy?: mongoose.Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema =
  new Schema<IContactMessage>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 160,
      },

      phone: {
        type: String,
        trim: true,
        maxlength: 40,
        default: "",
      },

      subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
      },

      isRead: {
        type: Boolean,
        default: false,
        index: true,
      },

      status: {
        type: String,
        enum: [
          "new",
          "read",
          "archived",
        ],
        default: "new",
        index: true,
      },

      archivedAt: {
        type: Date,
        default: null,
      },

      repliedAt: {
        type: Date,
        default: null,
      },

      repliedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    {
      timestamps: true,
    },
  );

const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>(
    "ContactMessage",
    contactMessageSchema,
  );

export default ContactMessage;