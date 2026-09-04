import mongoose, { Document, Schema } from "mongoose";

export interface IHeroSlide extends Document {
  eyebrow: string;
  headline: string;
  subtext: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const heroSlideSchema = new Schema<IHeroSlide>(
  {
    eyebrow: { type: String, required: true, trim: true },
    headline: { type: String, required: true, trim: true },
    subtext: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const HeroSlide =
  mongoose.models.HeroSlide || mongoose.model<IHeroSlide>("HeroSlide", heroSlideSchema);

export default HeroSlide;