
import mongoose, { Document, Model, Schema } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSubscriberSchema =
  new Schema<INewsletterSubscriber>(
    {
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      isActive: {
        type: Boolean,
        default: true,
        index: true,
      },

      subscribedAt: {
        type: Date,
        default: Date.now,
      },

      unsubscribedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    },
  );

newsletterSubscriberSchema.index({
  isActive: 1,
  createdAt: -1,
});

const NewsletterSubscriber: Model<INewsletterSubscriber> =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model<INewsletterSubscriber>(
    "NewsletterSubscriber",
    newsletterSubscriberSchema,
  );

export default NewsletterSubscriber;

