// import "dotenv/config";

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";

// import { connectDatabase } from "./config/database.js";
// import authRoutes from "./routes/auth.routes.js";
// import departmentRoutes from "./routes/department.routes.js";
// import programmeRoutes from "./routes/programme.routes.js";
// import academicSessionRoutes from "./routes/academic-session.routes.js";
// import semesterRoutes from "./routes/semester.routes.js";
// import courseRoutes from "./routes/course.routes.js";
// import registrationRoutes from "./routes/registration.routes.js";
// import userRoutes from "./routes/user.routes.js";
// import lecturerAssignmentRoutes from "./routes/lecturerAssignment.routes.js";
// import resultRoutes from "./routes/result.routes.js";
// import feeStructureRoutes from "./routes/feeStructure.routes.js";
// import paymentRoutes from "./routes/payment.routes.js";
// import admissionsRoutes from "./routes/admissions.routes.js";
// import path from "path";
// import contactRoutes from "./routes/contact.routes.js";
// import studentRoutes from "./routes/student.routes.js";
// import transcriptRequestRoutes from "./routes/transcript-request.routes.js";
// import notificationRoutes from "./routes/notification.routes.js";
// import announcementRoutes from "./routes/announcement.routes.js";
// import academicReportRoutes from "./routes/academic-report.routes.js";
// import auditLogRoutes from "./routes/auditLog.routes.js";
// import heroSlideRoutes from "./routes/heroSlide.routes.js";
// import feeCategoryRoutes from "./routes/feeCategory.routes.js";
// import dashboardRoutes from "./routes/dashboard.routes.js";



// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(helmet());

// const allowedOrigins = [
//   process.env.FRONTEND_URL,
//   "http://localhost:3000",
// ].filter(Boolean) as string[];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   }),
// );

// app.use(morgan("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use("/api/auth", authRoutes);
// app.use("/api/departments", departmentRoutes);
// app.use("/api/programmes", programmeRoutes);
// app.use("/api/academic-sessions", academicSessionRoutes);
// app.use("/api/semesters", semesterRoutes);
// app.use("/api/courses", courseRoutes);
// app.use("/api/registrations", registrationRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/lecturer-assignments", lecturerAssignmentRoutes);
// app.use("/api/results", resultRoutes);
// app.use("/api/fee-structures", feeStructureRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/admissions", admissionsRoutes);
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// app.use("/api/contact", contactRoutes);
// app.use("/api/students", studentRoutes);
// app.use("/api/transcript-requests", transcriptRequestRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/announcements", announcementRoutes);
// app.use("/api/academic-reports", academicReportRoutes);
// app.use("/api/audit-logs", auditLogRoutes);
// app.use("/api/hero-slides", heroSlideRoutes);
// app.use("/api/fee-categories", feeCategoryRoutes);

// app.get("/api/health", (_req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "ITMT API is running",
//   });
// });

// async function startServer() {
//   await connectDatabase();

//   app.listen(PORT, () => {
//     console.log(`ITMT API running on http://localhost:${PORT}`);
//   });
// }

// startServer();  



import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import { connectDatabase } from "./config/database.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import programmeRoutes from "./routes/programme.routes.js";
import academicSessionRoutes from "./routes/academic-session.routes.js";
import semesterRoutes from "./routes/semester.routes.js";
import courseRoutes from "./routes/course.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import userRoutes from "./routes/user.routes.js";
import lecturerAssignmentRoutes from "./routes/lecturerAssignment.routes.js";
import resultRoutes from "./routes/result.routes.js";
import feeStructureRoutes from "./routes/feeStructure.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import admissionsRoutes from "./routes/admissions.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import studentRoutes from "./routes/student.routes.js";
import transcriptRequestRoutes from "./routes/transcript-request.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import academicReportRoutes from "./routes/academic-report.routes.js";
import auditLogRoutes from "./routes/auditLog.routes.js";
import heroSlideRoutes from "./routes/heroSlide.routes.js";
import feeCategoryRoutes from "./routes/feeCategory.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import graduationRoutes from "./routes/graduation.routes.js";

const app = express();

const PORT = process.env.PORT || 5000;

/**
 * =========================================================
 * SECURITY
 * =========================================================
 */

app.use(helmet());

/**
 * =========================================================
 * CORS
 * =========================================================
 */

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (for example, server-to-server requests).
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

/**
 * =========================================================
 * HTTP LOGGING
 * =========================================================
 */

app.use(morgan("dev"));

/**
 * =========================================================
 * BODY PARSERS
 * =========================================================
 */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * =========================================================
 * API ROUTES
 * =========================================================
 */

app.use("/api/auth", authRoutes);

app.use("/api/departments", departmentRoutes);

app.use("/api/programmes", programmeRoutes);

app.use("/api/academic-sessions", academicSessionRoutes);

app.use("/api/semesters", semesterRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/registrations", registrationRoutes);

app.use("/api/users", userRoutes);

app.use("/api/lecturer-assignments", lecturerAssignmentRoutes);

app.use("/api/results", resultRoutes);

app.use("/api/fee-structures", feeStructureRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/admissions", admissionsRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/transcript-requests", transcriptRequestRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/announcements", announcementRoutes);

app.use("/api/academic-reports", academicReportRoutes);

app.use("/api/audit-logs", auditLogRoutes);

app.use("/api/hero-slides", heroSlideRoutes);

app.use("/api/fee-categories", feeCategoryRoutes);

/**
 * =========================================================
 * DASHBOARD ROUTES
 * =========================================================
 *
 * Registrar dashboard:
 *
 * GET /api/dashboard/registrar
 *
 * Protected by the dashboard router using:
 * - authenticate
 * - authorize("admin", "registrar")
 */

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/graduations", graduationRoutes);

/**
 * =========================================================
 * STATIC UPLOADS
 * =========================================================
 */

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads")),
);

/**
 * =========================================================
 * HEALTH CHECK
 * =========================================================
 */

app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "ITMT API is running",
  });
});

/**
 * =========================================================
 * START SERVER
 * =========================================================
 */

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(
        `ITMT API running on http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error("Failed to start ITMT API:", error);
    process.exit(1);
  }
}

startServer();

