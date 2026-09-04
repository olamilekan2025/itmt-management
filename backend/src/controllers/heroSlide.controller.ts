import type { Request, Response } from "express";
import { z } from "zod";

import HeroSlide from "../models/HeroSlide.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";

const slideSchema = z.object({
  eyebrow: z.string().trim().min(1),
  headline: z.string().trim().min(1),
  subtext: z.string().trim().min(1),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .transform((val) => (typeof val === "string" ? val === "true" : val))
    .optional(),
});

// Public — active slides only, sorted for display
export async function getPublicHeroSlides(_req: Request, res: Response) {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 });
    return res.status(200).json({ success: true, slides });
  } catch (error) {
    console.error("Get public hero slides error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve slides" });
  }
}

// Admin — every slide, including inactive ones, for the management page
export async function getAllHeroSlides(_req: Request, res: Response) {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });
    return res.status(200).json({ success: true, slides });
  } catch (error) {
    console.error("Get all hero slides error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve slides" });
  }
}

export async function createHeroSlide(req: Request, res: Response) {
  try {
    const data = slideSchema.parse(req.body);

    if (!req.file) {
      return res.status(400).json({ success: false, message: "A slide image is required" });
    }

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "itmt/hero");

    const slide = await HeroSlide.create({
      eyebrow: data.eyebrow,
      headline: data.headline,
      subtext: data.subtext,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
      imageUrl: uploadResult.secure_url,
    });

    return res.status(201).json({
      success: true,
      message: "Hero slide created successfully",
      slide,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: error.flatten().fieldErrors });
    }

    console.error("Create hero slide error:", error);
    return res.status(500).json({ success: false, message: "Unable to create slide" });
  }
}

export async function updateHeroSlide(req: Request, res: Response) {
  try {
    const data = slideSchema.partial().parse(req.body);

    const slide = await HeroSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }

    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "itmt/hero");
      slide.imageUrl = uploadResult.secure_url;
    }

    if (data.eyebrow !== undefined) slide.eyebrow = data.eyebrow;
    if (data.headline !== undefined) slide.headline = data.headline;
    if (data.subtext !== undefined) slide.subtext = data.subtext;
    if (data.order !== undefined) slide.order = data.order;
    if (data.isActive !== undefined) slide.isActive = data.isActive;

    await slide.save();

    return res.status(200).json({
      success: true,
      message: "Hero slide updated successfully",
      slide,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: error.flatten().fieldErrors });
    }

    console.error("Update hero slide error:", error);
    return res.status(500).json({ success: false, message: "Unable to update slide" });
  }
}

export async function deleteHeroSlide(req: Request, res: Response) {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);

    if (!slide) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }

    return res.status(200).json({ success: true, message: "Hero slide deleted successfully" });
  } catch (error) {
    console.error("Delete hero slide error:", error);
    return res.status(500).json({ success: false, message: "Unable to delete slide" });
  }
}