import type { Request, Response } from "express";
import { z } from "zod";

import ContactMessage from "../models/ContactMessage.js";
import { sendContactNotificationEmail } from "../utils/email.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

const contactSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(1),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

export async function submitContactMessage(req: Request, res: Response) {
  try {
    const data = contactSchema.parse(req.body);

    const contactMessage = await ContactMessage.create(data);

    try {
      await sendContactNotificationEmail(data.name, data.email, data.subject, data.message);
    } catch (emailError) {
      console.error("Failed to send contact notification email:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "Your message has been sent. We'll get back to you soon.",
      data: { id: contactMessage._id },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: error.flatten().fieldErrors });
    }

    console.error("Contact form error:", error);
    return res.status(500).json({ success: false, message: "Unable to send your message" });
  }
}

export async function listContactMessages(req: AuthRequest, res: Response) {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("List contact messages error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve messages" });
  }
}