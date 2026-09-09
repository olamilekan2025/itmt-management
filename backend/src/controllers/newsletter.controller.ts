import type { Request, Response } from "express";
import { z } from "zod";

import NewsletterSubscriber from "../models/NewsletterSubscriber.js";

const subscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .transform((value) => value.toLowerCase()),
});

/**
 * Public newsletter subscription.
 *
 * POST /api/subscriptions
 */
export async function subscribeToNewsletter(
  req: Request,
  res: Response,
) {
  try {
    const { email } = subscribeSchema.parse(req.body);

    const existingSubscriber =
      await NewsletterSubscriber.findOne({ email });

    /*
     * Existing active subscriber:
     * Return success instead of exposing unnecessary information.
     */
    if (existingSubscriber?.isActive) {
      return res.status(200).json({
        success: true,
        message:
          "You are already subscribed to ITMT updates.",
      });
    }

    /*
     * Previously unsubscribed subscriber:
     * Reactivate the existing record rather than creating
     * another document with the same email.
     */
    if (existingSubscriber) {
      existingSubscriber.isActive = true;
      existingSubscriber.subscribedAt = new Date();
      existingSubscriber.unsubscribedAt = undefined;

      await existingSubscriber.save();

      return res.status(200).json({
        success: true,
        message:
          "Your ITMT subscription has been reactivated.",
      });
    }

    /*
     * New subscriber.
     */
    await NewsletterSubscriber.create({
      email,
      isActive: true,
      subscribedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message:
        "You have successfully subscribed to ITMT updates.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message:
          error.issues[0]?.message ||
          "Please enter a valid email address.",
      });
    }

    /*
     * MongoDB duplicate-key protection.
     */
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return res.status(200).json({
        success: true,
        message:
          "You are already subscribed to ITMT updates.",
      });
    }

    console.error(
      "Newsletter subscription error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to complete your subscription. Please try again.",
    });
  }
}

