import type { Response } from "express";

import { z } from "zod";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import Announcement from "../models/Announcement.js";

import {
  notifyAdmins,
  notifyByRole,
} from "../services/notification.service.js";

/* =========================================================
   VALIDATION
========================================================= */

const objectId = z
  .string()
  .regex(
    /^[a-f\d]{24}$/i,
    "Invalid ID",
  );

const createAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      3,
      "Title must be at least 3 characters",
    )
    .max(
      200,
      "Title cannot exceed 200 characters",
    ),

  content: z
    .string()
    .trim()
    .min(
      1,
      "Announcement content is required",
    )
    .max(
      10000,
      "Content cannot exceed 10000 characters",
    ),

  audience: z
    .enum([
      "everyone",
      "students",
      "lecturers",
      "staff",
      "finance",
    ])
    .default("everyone"),

  status: z
    .enum([
      "draft",
      "published",
      "archived",
    ])
    .default("draft"),
});

const updateAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      3,
      "Title must be at least 3 characters",
    )
    .max(
      200,
      "Title cannot exceed 200 characters",
    )
    .optional(),

  content: z
    .string()
    .trim()
    .min(
      1,
      "Announcement content is required",
    )
    .max(
      10000,
      "Content cannot exceed 10000 characters",
    )
    .optional(),

  audience: z
    .enum([
      "everyone",
      "students",
      "lecturers",
      "staff",
      "finance",
    ])
    .optional(),

  status: z
    .enum([
      "draft",
      "published",
      "archived",
    ])
    .optional(),
});

const announcementQuerySchema = z.object({
  status: z
    .enum([
      "draft",
      "published",
      "archived",
    ])
    .optional(),

  audience: z
    .enum([
      "everyone",
      "students",
      "lecturers",
      "staff",
      "finance",
    ])
    .optional(),

  search: z
    .string()
    .trim()
    .max(
      200,
      "Search cannot exceed 200 characters",
    )
    .optional(),
});

/* =========================================================
   TYPES
========================================================= */

type AnnouncementAudience =
  | "everyone"
  | "students"
  | "lecturers"
  | "staff"
  | "finance";

type AnnouncementStatus =
  | "draft"
  | "published"
  | "archived";

/* =========================================================
   HELPERS
========================================================= */

/**
 * Escape user input before using it inside MongoDB regex.
 *
 * This prevents search terms such as:
 *   .* 
 *   $
 *   []
 *   ()
 *
 * from being interpreted as regex operators.
 */
function escapeRegex(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

/* =========================================================
   AUDIENCE HELPERS
========================================================= */

function isVisibleToFinance(
  audience: string,
): boolean {
  return [
    "everyone",
    "staff",
    "finance",
  ].includes(audience);
}

function isVisibleToLecturers(
  audience: string,
): boolean {
  return [
    "everyone",
    "lecturers",
  ].includes(audience);
}

function isVisibleToStudents(
  audience: string,
): boolean {
  return [
    "everyone",
    "students",
  ].includes(audience);
}

/* =========================================================
   NOTIFY FINANCE
========================================================= */

async function notifyFinanceIfNeeded(
  audience: AnnouncementAudience,
  title: string,
  announcementId: string,
) {
  if (
    !isVisibleToFinance(
      audience,
    )
  ) {
    return;
  }

  await notifyByRole(
    "finance",
    {
      title:
        "New Announcement",

      message:
        `"${title}" has been published.`,

      type:
        "announcement",

      link:
        "/dashboards/finance/announcements",

      metadata: {
        announcementId,
      },
    },
  );
}

/* =========================================================
   NOTIFY LECTURERS
========================================================= */

async function notifyLecturersIfNeeded(
  audience: AnnouncementAudience,
  title: string,
  announcementId: string,
) {
  if (
    !isVisibleToLecturers(
      audience,
    )
  ) {
    return;
  }

  await notifyByRole(
    "lecturer",
    {
      title:
        "New Announcement",

      message:
        `"${title}" has been published.`,

      type:
        "announcement",

      link:
        "/dashboards/lecturer/announcements",

      metadata: {
        announcementId,
      },
    },
  );
}

/* =========================================================
   NOTIFY STUDENTS
========================================================= */

async function notifyStudentsIfNeeded(
  audience: AnnouncementAudience,
  title: string,
  announcementId: string,
) {
  if (
    !isVisibleToStudents(
      audience,
    )
  ) {
    return;
  }

  await notifyByRole(
    "student",
    {
      title:
        "New Announcement",

      message:
        `"${title}" has been published.`,

      type:
        "announcement",

      link:
        `/dashboards/student/announcements?announcement=${encodeURIComponent(
          announcementId,
        )}`,

      metadata: {
        announcementId,
      },
    },
  );
}

/* =========================================================
   NOTIFY ALL RELEVANT USERS
========================================================= */

/**
 * Sends notifications to all relevant roles.
 *
 * Promise.allSettled is intentionally used here.
 *
 * If notification creation fails, the announcement itself
 * must still be successfully created/published.
 */
async function notifyAnnouncementPublished(
  announcement: {
    _id: unknown;
    title: string;
    audience: AnnouncementAudience;
  },
) {
  const announcementId =
    String(announcement._id);

  const results =
    await Promise.allSettled([
      /* ---------------------------------------------------
         ADMIN
      --------------------------------------------------- */

      notifyAdmins({
        title:
          "Announcement Published",

        message:
          `"${announcement.title}" has been published.`,

        type:
          "announcement",

        link:
          "/dashboards/admin/announcements",

        metadata: {
          announcementId,
        },
      }),

      /* ---------------------------------------------------
         FINANCE
      --------------------------------------------------- */

      notifyFinanceIfNeeded(
        announcement.audience,
        announcement.title,
        announcementId,
      ),

      /* ---------------------------------------------------
         LECTURERS
      --------------------------------------------------- */

      notifyLecturersIfNeeded(
        announcement.audience,
        announcement.title,
        announcementId,
      ),

      /* ---------------------------------------------------
         STUDENTS
      --------------------------------------------------- */

      notifyStudentsIfNeeded(
        announcement.audience,
        announcement.title,
        announcementId,
      ),
    ]);

  for (
    const result of results
  ) {
    if (
      result.status ===
      "rejected"
    ) {
      console.error(
        "Announcement notification error:",
        result.reason,
      );
    }
  }
}

/* =========================================================
   GET ALL ANNOUNCEMENTS
========================================================= */

export async function getAllAnnouncements(
  req: AuthRequest,
  res: Response,
) {
  try {
    const parsed =
      announcementQuerySchema.safeParse({
        status:
          typeof req.query.status ===
          "string"
            ? req.query.status
            : undefined,

        audience:
          typeof req.query.audience ===
          "string"
            ? req.query.audience
            : undefined,

        search:
          typeof req.query.search ===
          "string"
            ? req.query.search
            : undefined,
      });

    if (!parsed.success) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid announcement filters",

        errors:
          parsed.error.flatten()
            .fieldErrors,
      });
    }

    const {
      status,
      audience,
      search,
    } = parsed.data;

    const role =
      req.user?.role;

    const filter: Record<
      string,
      unknown
    > = {};

    /* =====================================================
       FINANCE
    ===================================================== */

    if (
      role === "finance"
    ) {
      filter.status =
        "published";

      filter.audience = {
        $in: [
          "everyone",
          "staff",
          "finance",
        ],
      };
    }

    /* =====================================================
       LECTURER
    ===================================================== */

    else if (
      role === "lecturer"
    ) {
      filter.status =
        "published";

      filter.audience = {
        $in: [
          "everyone",
          "lecturers",
        ],
      };
    }

    /* =====================================================
       STUDENT
    ===================================================== */

    else if (
      role === "student"
    ) {
      /*
       * Students can ONLY receive:
       *
       * - published announcements
       * - everyone
       * - students
       *
       * Query parameters cannot override this restriction.
       */

      filter.status =
        "published";

      filter.audience = {
        $in: [
          "everyone",
          "students",
        ],
      };
    }

    /* =====================================================
       ADMIN / REGISTRAR
    ===================================================== */

    else {
      if (status) {
        filter.status =
          status;
      }

      if (audience) {
        filter.audience =
          audience;
      }
    }

    /* =====================================================
       SEARCH
    ===================================================== */

    if (search) {
      const safeSearch =
        escapeRegex(search);

      filter.$or = [
        {
          title: {
            $regex:
              safeSearch,
            $options: "i",
          },
        },

        {
          content: {
            $regex:
              safeSearch,
            $options: "i",
          },
        },
      ];
    }

    const announcements =
      await Announcement.find(
        filter,
      )
        .populate(
          "createdBy",
          "name email role",
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error(
      "Get announcements error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve announcements",
    });
  }
}

/* =========================================================
   GET SINGLE ANNOUNCEMENT
========================================================= */

export async function getAnnouncementById(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } =
      req.params;

    if (
      !objectId.safeParse(id)
        .success
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement ID",
      });
    }

    const announcement =
      await Announcement.findById(
        id,
      ).populate(
        "createdBy",
        "name email role",
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found",
      });
    }

    /* =====================================================
       FINANCE SECURITY
    ===================================================== */

    if (
      req.user?.role ===
      "finance"
    ) {
      const canView =
        announcement.status ===
          "published" &&
        isVisibleToFinance(
          announcement.audience,
        );

      if (!canView) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this announcement",
        });
      }
    }

    /* =====================================================
       LECTURER SECURITY
    ===================================================== */

    if (
      req.user?.role ===
      "lecturer"
    ) {
      const canView =
        announcement.status ===
          "published" &&
        isVisibleToLecturers(
          announcement.audience,
        );

      if (!canView) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this announcement",
        });
      }
    }

    /* =====================================================
       STUDENT SECURITY
    ===================================================== */

    if (
      req.user?.role ===
      "student"
    ) {
      const canView =
        announcement.status ===
          "published" &&
        isVisibleToStudents(
          announcement.audience,
        );

      if (!canView) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this announcement",
        });
      }
    }

    /*
     * Admin and registrar are intentionally not restricted
     * here because they manage announcements.
     */

    return res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error(
      "Get announcement error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve announcement",
    });
  }
}

/* =========================================================
   CREATE ANNOUNCEMENT
========================================================= */

export async function createAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  try {
    const data =
      createAnnouncementSchema.parse(
        req.body,
      );

    const announcement =
      await Announcement.create({
        title:
          data.title,

        content:
          data.content,

        audience:
          data.audience,

        status:
          data.status,

        createdBy:
          req.user!.userId,

        publishedAt:
          data.status ===
          "published"
            ? new Date()
            : undefined,
      });

    await announcement.populate(
      "createdBy",
      "name email role",
    );

    /* =====================================================
       NOTIFY IF CREATED DIRECTLY AS PUBLISHED
    ===================================================== */

    if (
      data.status ===
      "published"
    ) {
      await notifyAnnouncementPublished(
        {
          _id:
            announcement._id,

          title:
            announcement.title,

          audience:
            announcement.audience as AnnouncementAudience,
        },
      );
    }

    return res.status(201).json({
      success: true,

      message:
        "Announcement created successfully",

      announcement,
    });
  } catch (error) {
    if (
      error instanceof
      z.ZodError
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Validation failed",

        errors:
          error.flatten()
            .fieldErrors,
      });
    }

    console.error(
      "Create announcement error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to create announcement",
    });
  }
}

/* =========================================================
   UPDATE ANNOUNCEMENT
========================================================= */

export async function updateAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } =
      req.params;

    if (
      !objectId.safeParse(id)
        .success
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid announcement ID",
      });
    }

    const data =
      updateAnnouncementSchema.parse(
        req.body,
      );

    const existing =
      await Announcement.findById(
        id,
      );

    if (!existing) {
      return res.status(404).json({
        success: false,

        message:
          "Announcement not found",
      });
    }

    const wasPublished =
      existing.status ===
      "published";

    const nextStatus =
      data.status ??
      existing.status;

    const willBePublished =
      nextStatus ===
      "published";

    const updateData: Record<
      string,
      unknown
    > = {
      ...data,
    };

    /* =====================================================
       SET PUBLISHED DATE
    ===================================================== */

    if (
      nextStatus ===
        "published" &&
      !existing.publishedAt
    ) {
      updateData.publishedAt =
        new Date();
    }

    /* =====================================================
       MOVING BACK TO DRAFT
    ===================================================== */

    if (
      data.status ===
      "draft"
    ) {
      updateData.publishedAt =
        undefined;
    }

    const announcement =
      await Announcement.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      ).populate(
        "createdBy",
        "name email role",
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,

        message:
          "Announcement not found",
      });
    }

    /* =====================================================
       NEWLY PUBLISHED
    ===================================================== */

    if (
      !wasPublished &&
      willBePublished
    ) {
      await notifyAnnouncementPublished(
        {
          _id:
            announcement._id,

          title:
            announcement.title,

          audience:
            announcement.audience as AnnouncementAudience,
        },
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Announcement updated successfully",

      announcement,
    });
  } catch (error) {
    if (
      error instanceof
      z.ZodError
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Validation failed",

        errors:
          error.flatten()
            .fieldErrors,
      });
    }

    console.error(
      "Update announcement error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to update announcement",
    });
  }
}

/* =========================================================
   PUBLISH ANNOUNCEMENT
========================================================= */

export async function publishAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } =
      req.params;

    if (
      !objectId.safeParse(id)
        .success
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid announcement ID",
      });
    }

    const announcement =
      await Announcement.findById(
        id,
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,

        message:
          "Announcement not found",
      });
    }

    if (
      announcement.status ===
      "published"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Announcement is already published",
      });
    }

    announcement.status =
      "published";

    announcement.publishedAt =
      new Date();

    await announcement.save();

    await announcement.populate(
      "createdBy",
      "name email role",
    );

    await notifyAnnouncementPublished(
      {
        _id:
          announcement._id,

        title:
          announcement.title,

        audience:
          announcement.audience as AnnouncementAudience,
      },
    );

    return res.status(200).json({
      success: true,

      message:
        "Announcement published successfully",

      announcement,
    });
  } catch (error) {
    console.error(
      "Publish announcement error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to publish announcement",
    });
  }
}

/* =========================================================
   ARCHIVE ANNOUNCEMENT
========================================================= */

export async function archiveAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } =
      req.params;

    if (
      !objectId.safeParse(id)
        .success
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid announcement ID",
      });
    }

    const announcement =
      await Announcement.findByIdAndUpdate(
        id,
        {
          status:
            "archived",
        },
        {
          new: true,
          runValidators: true,
        },
      ).populate(
        "createdBy",
        "name email role",
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,

        message:
          "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Announcement archived successfully",

      announcement,
    });
  } catch (error) {
    console.error(
      "Archive announcement error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to archive announcement",
    });
  }
}

/* =========================================================
   DELETE ANNOUNCEMENT
========================================================= */

export async function deleteAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } =
      req.params;

    if (
      !objectId.safeParse(id)
        .success
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid announcement ID",
      });
    }

    const announcement =
      await Announcement.findByIdAndDelete(
        id,
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,

        message:
          "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Announcement deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete announcement error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to delete announcement",
    });
  }
}