import type {
  Request,
  Response,
} from "express";

import { z } from "zod";

import ContactMessage from "../models/ContactMessage.js";

import {
  sendContactNotificationEmail,
  sendContactReplyEmail,
} from "../utils/email.js";

import type { AuthRequest } from "../middleware/auth.middleware.js";

/* -------------------------------------------------------------------------- */
/* Schemas                                                                    */
/* -------------------------------------------------------------------------- */

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Please enter your full name.",
    )
    .max(
      120,
      "Name is too long.",
    ),

  email: z
    .string()
    .trim()
    .email(
      "Please enter a valid email address.",
    )
    .max(
      160,
      "Email address is too long.",
    ),

  phone: z
    .string()
    .trim()
    .max(
      40,
      "Phone number is too long.",
    )
    .optional()
    .default(""),

  subject: z
    .string()
    .trim()
    .min(
      2,
      "Please enter a subject.",
    )
    .max(
      200,
      "Subject is too long.",
    ),

  message: z
    .string()
    .trim()
    .min(
      10,
      "Message must be at least 10 characters.",
    )
    .max(
      5000,
      "Message is too long.",
    ),
});

const replySchema = z.object({
  message: z
    .string()
    .trim()
    .min(
      2,
      "Reply cannot be empty.",
    )
    .max(
      5000,
      "Reply is too long.",
    ),
});

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function escapeRegex(value: string) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

/* -------------------------------------------------------------------------- */
/* Public: Submit contact message                                             */
/* -------------------------------------------------------------------------- */

export async function submitContactMessage(
  req: Request,
  res: Response,
) {
  try {
    const result =
      contactSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message:
          "Please check the form and correct the highlighted fields.",
        errors:
          result.error.flatten()
            .fieldErrors,
      });
    }

    const data = result.data;

    const contactMessage =
      await ContactMessage.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        isRead: false,
        status: "new",
      });

    /*
     * The contact message is already safely stored in MongoDB.
     * Email notification failure should therefore NOT make the
     * public contact submission fail.
     */
    try {
      await sendContactNotificationEmail(
        data.name,
        data.email,
        data.subject,
        data.message,
        data.phone,
      );
    } catch (emailError) {
      console.error(
        "Failed to send contact notification email:",
        emailError,
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Your message has been sent successfully. Our team will get back to you soon.",
      data: {
        id: contactMessage._id,
      },
    });
  } catch (error) {
    console.error(
      "Contact form error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to send your message right now. Please try again later.",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Admin / Registrar: List contact messages                                   */
/* -------------------------------------------------------------------------- */

export async function listContactMessages(
  req: AuthRequest,
  res: Response,
) {
  try {
    const page = Math.max(
      Number.parseInt(
        String(req.query.page ?? "1"),
        10,
      ) || 1,
      1,
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(
          String(req.query.limit ?? "20"),
          10,
        ) || 20,
        1,
      ),
      100,
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const requestedStatus =
      typeof req.query.status === "string"
        ? req.query.status
        : "all";

    const filter: Record<
      string,
      unknown
    > = {};

    /*
     * Status filtering.
     *
     * The extra $exists:false conditions make this compatible
     * with older contact messages created before the status
     * field was introduced.
     */
    if (requestedStatus === "new") {
      filter.$or = [
        {
          status: "new",
        },
        {
          status: {
            $exists: false,
          },
          isRead: false,
        },
      ];
    }

    if (requestedStatus === "read") {
      filter.$or = [
        {
          status: "read",
        },
        {
          status: {
            $exists: false,
          },
          isRead: true,
        },
      ];
    }

    if (search) {
      filter.$and = [
        ...(filter.$and ? [filter.$and] : []),
        {
          $or: [
            { name: { $regex: escapeRegex(search), $options: "i" } },
            { email: { $regex: escapeRegex(search), $options: "i" } },
            { subject: { $regex: escapeRegex(search), $options: "i" } },
            { message: { $regex: escapeRegex(search), $options: "i" } },
          ],
        },
      ];
    }

    if (requestedStatus === "archived") {
      filter.status = "archived";
    }

    const skip =
      (page - 1) * limit;

    const [
      messages,
      total,
      unread,
      read,
      archived,
      allTotal,
    ] = await Promise.all([
      ContactMessage.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      ContactMessage.countDocuments(
        filter,
      ),

      ContactMessage.countDocuments({
        $or: [
          {
            status: "new",
          },
          {
            status: {
              $exists: false,
            },
            isRead: false,
          },
        ],
      }),

      ContactMessage.countDocuments({
        $or: [
          {
            status: "read",
          },
          {
            status: {
              $exists: false,
            },
            isRead: true,
          },
        ],
      }),

      ContactMessage.countDocuments({
        status: "archived",
      }),

      ContactMessage.countDocuments(),
    ]);

    const totalPages =
      total > 0
        ? Math.ceil(total / limit)
        : 1;

    return res.status(200).json({
      success: true,

      data: messages,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1,
      },

      stats: {
        total: allTotal,
        unread,
        read,
        archived,
      },
    });
  } catch (error) {
    console.error(
      "List contact messages error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve contact messages.",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Admin / Registrar: Mark as read                                            */
/* -------------------------------------------------------------------------- */

export async function markContactMessageRead(
  req: AuthRequest,
  res: Response,
) {
  try {
    const message =
      await ContactMessage.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            isRead: true,
            status: "read",
          },
        },
        {
          new: true,
          runValidators: true,
        },
      ).lean();

    if (!message) {
      return res.status(404).json({
        success: false,
        message:
          "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Contact message marked as read.",
      data: message,
    });
  } catch (error) {
    console.error(
      "Mark contact message read error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update contact message.",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Admin / Registrar: Archive                                                 */
/* -------------------------------------------------------------------------- */

export async function archiveContactMessage(
  req: AuthRequest,
  res: Response,
) {
  try {
    const message =
      await ContactMessage.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            isRead: true,
            status: "archived",
            archivedAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        },
      ).lean();

    if (!message) {
      return res.status(404).json({
        success: false,
        message:
          "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Contact message archived.",
      data: message,
    });
  } catch (error) {
    console.error(
      "Archive contact message error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to archive contact message.",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Admin / Registrar: Restore                                                 */
/* -------------------------------------------------------------------------- */

export async function restoreContactMessage(
  req: AuthRequest,
  res: Response,
) {
  try {
    const message =
      await ContactMessage.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            isRead: true,
            status: "read",
            archivedAt: null,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      ).lean();

    if (!message) {
      return res.status(404).json({
        success: false,
        message:
          "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Contact message restored.",
      data: message,
    });
  } catch (error) {
    console.error(
      "Restore contact message error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to restore contact message.",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Admin / Registrar: Reply                                                   */
/* -------------------------------------------------------------------------- */

export async function replyToContactMessage(
  req: AuthRequest,
  res: Response,
) {
  try {
    // --------------------------------------------------
    // 1. Validate the reply
    // --------------------------------------------------
    const result = replySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid reply.",
        errors: result.error.flatten().fieldErrors,
      });
    }

    // --------------------------------------------------
    // 2. Find the contact message
    // --------------------------------------------------
    const contactMessage = await ContactMessage.findById(
      req.params.id,
    );

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    // --------------------------------------------------
    // 3. Do not allow replies to archived messages
    // --------------------------------------------------
    if (contactMessage.status === "archived") {
      return res.status(400).json({
        success: false,
        message:
          "Restore the message before sending a reply.",
      });
    }

    // --------------------------------------------------
    // 4. Send the email FIRST
    //
    // We intentionally do not modify the database yet.
    // If Resend fails, the message remains unchanged.
    // --------------------------------------------------
    try {
      await sendContactReplyEmail(
        contactMessage.email,
        contactMessage.name,
        contactMessage.subject,
        result.data.message,
      );
    } catch (emailError) {
      console.error(
        "❌ Contact reply email failed:",
        emailError,
      );

      if (emailError instanceof Error) {
        console.error(
          "❌ Contact reply email error:",
          emailError.message,
        );

        console.error(
          "❌ Contact reply email stack:",
          emailError.stack,
        );
      }

      return res.status(502).json({
        success: false,
        message:
          "The reply could not be delivered. Please check your email configuration and try again.",
      });
    }

    // --------------------------------------------------
    // 5. Email was successfully accepted.
    // Now update the contact message.
    // --------------------------------------------------
    contactMessage.isRead = true;
    contactMessage.status = "read";
    contactMessage.repliedAt = new Date();
    contactMessage.repliedBy =
      req.user?.userId ?? null;

    // --------------------------------------------------
    // 6. Save the updated contact message
    // --------------------------------------------------
    try {
      await contactMessage.save();
    } catch (databaseError) {
      console.error(
        "❌ Contact message database update failed:",
        databaseError,
      );

      if (databaseError instanceof Error) {
        console.error(
          "❌ Database error message:",
          databaseError.message,
        );

        console.error(
          "❌ Database error stack:",
          databaseError.stack,
        );
      }

      /*
       * IMPORTANT:
       *
       * The email has already been sent successfully at this
       * point. Therefore, do not tell the frontend that the
       * email failed.
       */
      return res.status(500).json({
        success: false,
        message:
          "The reply was sent, but the contact message could not be updated.",
      });
    }

    // --------------------------------------------------
    // 7. Success
    // --------------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Reply sent successfully.",
      data: contactMessage,
    });
  } catch (error) {
    // --------------------------------------------------
    // Unexpected controller error
    // --------------------------------------------------
    console.error(
      "❌ Reply to contact message error:",
      error,
    );

    if (error instanceof Error) {
      console.error(
        "❌ Reply error message:",
        error.message,
      );

      console.error(
        "❌ Reply error stack:",
        error.stack,
      );
    }

    return res.status(500).json({
      success: false,
      message: "Unable to send the reply.",
    });
  }
}