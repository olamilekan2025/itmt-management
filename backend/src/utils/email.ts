import { Resend } from "resend";

/* =========================================================
   TYPES
========================================================= */

interface EmailAttachment {
  filename: string;
  content: Buffer;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

/* =========================================================
   RESEND CONFIGURATION
========================================================= */

function getResendApiKey(): string {
  const key = process.env.RESEND_API_KEY?.trim();

  if (!key) {
    throw new Error(
      "RESEND_API_KEY is not configured. Add your Resend API key to backend/.env.",
    );
  }

  return key;
}

function getResendClient(): Resend {
  return new Resend(getResendApiKey());
}

/* =========================================================
   EMAIL CONFIGURATION
========================================================= */

function getFromAddress(): string {
  const from = process.env.EMAIL_FROM?.trim();

  if (!from) {
    throw new Error(
      "EMAIL_FROM is not configured. Add a verified Resend sender address to backend/.env.",
    );
  }

  return from;
}

function getContactNotificationEmail(): string {
  const email = process.env.CONTACT_NOTIFICATION_EMAIL?.trim();

  if (!email) {
    throw new Error(
      "CONTACT_NOTIFICATION_EMAIL is not configured.",
    );
  }

  return validateEmailAddress(email);
}

/* =========================================================
   VALIDATION HELPERS
========================================================= */

function validateEmailAddress(email: string): string {
  const normalized = email.trim();

  if (!normalized) {
    throw new Error("Email address is required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error(`Invalid email address: ${normalized}`);
  }

  return normalized;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   SHARED EMAIL SENDER
========================================================= */

async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  attachments,
}: SendEmailOptions): Promise<string> {
  const safeTo = validateEmailAddress(to);

  const safeReplyTo = replyTo
    ? validateEmailAddress(replyTo)
    : undefined;

  const resend = getResendClient();
  const from = getFromAddress();

  try {
    console.log("--------------------------------------------------");
    console.log("[email] Preparing email...");
    console.log(`[email] To: ${safeTo}`);
    console.log(`[email] From: ${from}`);
    console.log(`[email] Subject: ${subject}`);

    if (safeReplyTo) {
      console.log(`[email] Reply-To: ${safeReplyTo}`);
    }

    const response = await resend.emails.send({
      from,
      to: [safeTo],
      subject,
      html,

      ...(safeReplyTo
        ? {
            replyTo: safeReplyTo,
          }
        : {}),

      ...(attachments?.length
        ? {
            attachments: attachments.map((attachment) => ({
              filename: attachment.filename,
              content: attachment.content,
            })),
          }
        : {}),
    });

    if (response.error) {
      console.error(
        "[email] ❌ Resend API error:",
        response.error,
      );

      throw new Error(
        response.error.message ||
          "Resend failed to send the email.",
      );
    }

    const emailId = response.data?.id;

    if (!emailId) {
      console.error(
        "[email] ❌ Resend returned no email ID:",
        response,
      );

      throw new Error(
        "Resend did not return an email ID.",
      );
    }

    console.log(
      `[email] ✅ Successfully sent: ${emailId}`,
    );
    console.log("--------------------------------------------------");

    return emailId;
  } catch (error) {
    console.error(
      "[email] ❌ Email sending failed:",
      error,
    );

    if (error instanceof Error) {
      console.error(
        "[email] Error message:",
        error.message,
      );

      console.error(
        "[email] Error stack:",
        error.stack,
      );
    }

    throw error;
  }
}

/* =========================================================
   SHARED ITMT EMAIL LAYOUT
========================================================= */

function emailLayout({
  title,
  preheader,
  content,
}: {
  title: string;
  preheader?: string;
  content: string;
}): string {
  const safeTitle = escapeHtml(title);
  const safePreheader = escapeHtml(preheader || "");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${safeTitle}</title>

  <style>
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        border-radius: 0 !important;
      }

      .email-content {
        padding: 28px 20px !important;
      }

      .email-header {
        padding: 24px 20px !important;
      }

      .email-footer {
        padding: 22px 20px !important;
      }

      .button {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        text-align: center !important;
      }
    }
  </style>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f1f5f9;
    font-family:Arial,Helvetica,sans-serif;
    color:#0f172a;
  "
>
  <div
    style="
      display:none;
      max-height:0;
      overflow:hidden;
      opacity:0;
      color:transparent;
    "
  >
    ${safePreheader}
  </div>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      width:100%;
      margin:0;
      padding:0;
      background:#f1f5f9;
    "
  >
    <tr>
      <td
        align="center"
        style="padding:40px 16px;"
      >
        <table
          class="email-container"
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            max-width:600px;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            border:1px solid #e2e8f0;
            box-shadow:0 10px 30px rgba(15,23,42,0.08);
          "
        >

          <!-- HEADER -->
          <tr>
            <td
              class="email-header"
              style="
                padding:30px 32px;
                background:#1b2847;
              "
            >
              <div
                style="
                  display:inline-block;
                  margin-bottom:14px;
                  padding:7px 12px;
                  border:1px solid rgba(200,169,81,0.45);
                  border-radius:999px;
                  color:#c8a951;
                  font-size:10px;
                  font-weight:700;
                  letter-spacing:1.5px;
                  text-transform:uppercase;
                "
              >
                ITMT Academy
              </div>

              <div
                style="
                  color:#ffffff;
                  font-size:24px;
                  line-height:1.3;
                  font-weight:700;
                "
              >
                ${safeTitle}
              </div>
            </td>
          </tr>

          <!-- GOLD ACCENT -->
          <tr>
            <td
              style="
                height:4px;
                background:#c8a951;
                font-size:0;
                line-height:0;
              "
            >
              &nbsp;
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td
              class="email-content"
              style="
                padding:34px 32px;
                font-size:15px;
                line-height:1.7;
                color:#334155;
              "
            >
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              class="email-footer"
              style="
                padding:24px 32px;
                background:#f8fafc;
                border-top:1px solid #e2e8f0;
              "
            >
              <div
                style="
                  margin-bottom:8px;
                  color:#1b2847;
                  font-size:13px;
                  font-weight:700;
                "
              >
                ITMT Academy
              </div>

              <div
                style="
                  color:#64748b;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                This is an automated message from the
                ITMT Management System.
              </div>

              <div
                style="
                  margin-top:12px;
                  color:#94a3b8;
                  font-size:11px;
                "
              >
                © ${new Date().getFullYear()}
                ITMT Academy.
                All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/* =========================================================
   VERIFICATION EMAIL
========================================================= */

export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationLink: string,
): Promise<void> {
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(verificationLink);

  const html = emailLayout({
    title: "Verify your email address",

    preheader:
      "Complete your ITMT Academy account verification.",

    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 20px;">
        Welcome to ITMT Academy.
        Please verify your email address to activate
        your account and continue using the platform.
      </p>

      <div
        style="
          margin:28px 0;
          text-align:center;
        "
      >
        <a
          href="${safeLink}"
          class="button"
          style="
            display:inline-block;
            padding:13px 24px;
            background:#1b2847;
            color:#ffffff;
            text-decoration:none;
            border-radius:9px;
            font-size:14px;
            font-weight:700;
          "
        >
          Verify Email Address
        </a>
      </div>

      <p
        style="
          margin:22px 0 0;
          font-size:13px;
          color:#64748b;
        "
      >
        If you did not create this account,
        you can safely ignore this email.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject: "Verify your ITMT Academy email address",
    html,
  });
}

/* =========================================================
   OTP EMAIL
========================================================= */

export async function sendOtpEmail(
  to: string,
  name: string,
  otp: string,
): Promise<void> {
  const safeName = escapeHtml(name);
  const safeOtp = escapeHtml(otp);

  const testRecipient =
    process.env.OTP_TEST_RECIPIENT?.trim();

  const actualRecipient =
    testRecipient || to;

  const html = emailLayout({
    title: "Your login verification code",

    preheader:
      "Your ITMT Academy one-time verification code.",

    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 22px;">
        Use the verification code below to complete
        your ITMT Academy login.
      </p>

      <div
        style="
          margin:28px 0;
          padding:24px;
          text-align:center;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:14px;
        "
      >
        <div
          style="
            margin-bottom:10px;
            color:#64748b;
            font-size:11px;
            font-weight:700;
            letter-spacing:1.5px;
            text-transform:uppercase;
          "
        >
          Verification Code
        </div>

        <div
          style="
            color:#1b2847;
            font-size:34px;
            line-height:1.2;
            font-weight:800;
            letter-spacing:8px;
          "
        >
          ${safeOtp}
        </div>

        <div
          style="
            margin-top:14px;
            color:#94a3b8;
            font-size:12px;
          "
        >
          Enter this code on the ITMT login page.
        </div>
      </div>

      <p
        style="
          margin:20px 0 0;
          font-size:13px;
          color:#64748b;
        "
      >
        This code is temporary.
        Do not share it with anyone.
      </p>
    `,
  });

  await sendEmail({
    to: actualRecipient,

    subject:
      "Your ITMT Academy login verification code",

    html,
  });

  if (
    testRecipient &&
    testRecipient.toLowerCase() !==
      to.trim().toLowerCase()
  ) {
    console.log(
      `[email] OTP redirected from ${to} to ${actualRecipient} because OTP_TEST_RECIPIENT is configured.`,
    );
  }
}

/* =========================================================
   PASSWORD RESET EMAIL
========================================================= */

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetLink: string,
): Promise<void> {
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(resetLink);

  const html = emailLayout({
    title: "Reset your password",

    preheader:
      "Use this secure link to reset your ITMT Academy password.",

    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 20px;">
        We received a request to reset your
        ITMT Academy account password.
      </p>

      <div
        style="
          margin:28px 0;
          text-align:center;
        "
      >
        <a
          href="${safeLink}"
          class="button"
          style="
            display:inline-block;
            padding:13px 24px;
            background:#1b2847;
            color:#ffffff;
            text-decoration:none;
            border-radius:9px;
            font-size:14px;
            font-weight:700;
          "
        >
          Reset Password
        </a>
      </div>

      <p
        style="
          margin:22px 0 0;
          font-size:13px;
          color:#64748b;
        "
      >
        If you did not request a password reset,
        you can safely ignore this email.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject: "Reset your ITMT Academy password",
    html,
  });
}

/* =========================================================
   ADMISSION SUBMITTED EMAIL
========================================================= */

export async function sendAdmissionSubmittedEmail(
  to: string,
  name: string,
  applicationNumber: string,
): Promise<void> {
  const safeName = escapeHtml(name);
  const safeApplicationNumber =
    escapeHtml(applicationNumber);

  const html = emailLayout({
    title: "Application submitted",

    preheader:
      "Your ITMT Academy admission application has been received.",

    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 20px;">
        Your admission application has been successfully
        submitted to ITMT Academy.
      </p>

      <div
        style="
          margin:24px 0;
          padding:18px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:10px;
        "
      >
        <div
          style="
            margin-bottom:6px;
            color:#64748b;
            font-size:11px;
            font-weight:700;
            letter-spacing:1px;
            text-transform:uppercase;
          "
        >
          Application Number
        </div>

        <div
          style="
            color:#1b2847;
            font-size:18px;
            font-weight:800;
          "
        >
          ${safeApplicationNumber}
        </div>
      </div>

      <p style="margin:20px 0 0;">
        Please keep your application number safe.
        You can use it when making enquiries
        about your application.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject:
      "ITMT Academy admission application submitted",
    html,
  });
}

/* =========================================================
   ADMISSION UNDER REVIEW EMAIL
========================================================= */

export async function sendAdmissionUnderReviewEmail(
  to: string,
  name: string,
  applicationNumber: string,
): Promise<void> {
  const safeName = escapeHtml(name);
  const safeApplicationNumber =
    escapeHtml(applicationNumber);

  const html = emailLayout({
    title: "Application under review",

    preheader:
      "Your ITMT Academy admission application is now under review.",

    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 20px;">
        Your admission application has been received
        and is currently under review by the
        admissions team.
      </p>

      <div
        style="
          margin:24px 0;
          padding:18px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-left:4px solid #c8a951;
          border-radius:10px;
        "
      >
        <div
          style="
            margin-bottom:6px;
            color:#64748b;
            font-size:11px;
            font-weight:700;
            letter-spacing:1px;
            text-transform:uppercase;
          "
        >
          Application Number
        </div>

        <div
          style="
            color:#1b2847;
            font-size:18px;
            font-weight:800;
          "
        >
          ${safeApplicationNumber}
        </div>
      </div>

      <p style="margin:20px 0 0;">
        We will notify you once there is an update
        regarding your application.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject:
      "Your ITMT Academy application is under review",
    html,
  });
}

/* =========================================================
   ADMISSION APPROVED EMAIL
========================================================= */

export async function sendAdmissionApprovedEmail(
  to: string,
  name: string,
  applicationNumber: string,
  matricNumber: string,
): Promise<void> {
  const safeName = escapeHtml(name);
  const safeApplicationNumber =
    escapeHtml(applicationNumber);
  const safeMatricNumber =
    escapeHtml(matricNumber);

  const html = emailLayout({
    title: "Admission approved",

    preheader:
      "Your ITMT Academy admission application has been approved.",

    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 20px;">
        We are pleased to inform you that your admission
        application to ITMT Academy has been approved.
      </p>

      <div
        style="
          margin:24px 0;
          padding:20px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:10px;
        "
      >
        <div
          style="
            margin-bottom:14px;
            color:#64748b;
            font-size:11px;
            font-weight:700;
            letter-spacing:1px;
            text-transform:uppercase;
          "
        >
          Admission Details
        </div>

        <div style="margin-bottom:12px;">
          <div
            style="
              color:#64748b;
              font-size:12px;
            "
          >
            Application Number
          </div>

          <div
            style="
              color:#1b2847;
              font-size:16px;
              font-weight:800;
            "
          >
            ${safeApplicationNumber}
          </div>
        </div>

        <div>
          <div
            style="
              color:#64748b;
              font-size:12px;
            "
          >
            Matriculation Number
          </div>

          <div
            style="
              color:#1b2847;
              font-size:18px;
              font-weight:800;
            "
          >
            ${safeMatricNumber}
          </div>
        </div>
      </div>

      <p style="margin:20px 0 0;">
        Please log in to the ITMT Management System
        to continue with your admission and
        registration process.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject:
      "Congratulations — Your ITMT Academy admission is approved",
    html,
  });
}

/* =========================================================
   ADMISSION REJECTED EMAIL
========================================================= */

export async function sendAdmissionRejectedEmail(
  to: string,
  name: string,
  applicationNumber: string,
  rejectionReason: string,
): Promise<void> {
  const safeName = escapeHtml(name);
  const safeApplicationNumber =
    escapeHtml(applicationNumber);
  const safeReason =
    escapeHtml(rejectionReason);

  const html = emailLayout({
    title: "Admission application update",

    preheader:
      "There has been an update to your ITMT Academy admission application.",

    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 20px;">
        We are writing to inform you that there has been
        an update to your admission application.
      </p>

      <div
        style="
          margin:24px 0;
          padding:18px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:10px;
        "
      >
        <div
          style="
            margin-bottom:6px;
            color:#64748b;
            font-size:11px;
            font-weight:700;
            letter-spacing:1px;
            text-transform:uppercase;
          "
        >
          Application Number
        </div>

        <div
          style="
            color:#1b2847;
            font-size:18px;
            font-weight:800;
          "
        >
          ${safeApplicationNumber}
        </div>
      </div>

      <div
        style="
          margin:24px 0;
          padding:18px;
          background:#fff7ed;
          border:1px solid #fed7aa;
          border-left:4px solid #c8a951;
          border-radius:10px;
        "
      >
        <div
          style="
            margin-bottom:7px;
            color:#9a3412;
            font-size:11px;
            font-weight:700;
            letter-spacing:1px;
            text-transform:uppercase;
          "
        >
          Review Note
        </div>

        <div
          style="
            color:#431407;
            font-size:14px;
            line-height:1.7;
            white-space:pre-wrap;
          "
        >
          ${safeReason}
        </div>
      </div>

      <p style="margin:20px 0 0;">
        If you believe you need clarification regarding
        this decision, please contact the admissions team.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject:
      "ITMT Academy admission application update",
    html,
  });
}

/* =========================================================
   CONTACT FORM NOTIFICATION EMAIL
========================================================= */

export async function sendContactNotificationEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
  phone?: string,
): Promise<void> {
  const notificationEmail =
    getContactNotificationEmail();

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);

  const safeMessage =
    escapeHtml(message).replace(
      /\n/g,
      "<br />",
    );

  const safePhone = escapeHtml(
    phone || "Not provided",
  );

  const html = emailLayout({
    title: "New contact enquiry",

    preheader:
      "A new message has been submitted through the ITMT Academy contact form.",

    content: `
      <p style="margin:0 0 20px;">
        A new contact enquiry has been submitted
        through the ITMT Academy website.
      </p>

      <div
        style="
          margin:22px 0;
          padding:18px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:10px;
        "
      >
        <div
          style="
            margin-bottom:14px;
            color:#64748b;
            font-size:11px;
            font-weight:700;
            letter-spacing:1px;
            text-transform:uppercase;
          "
        >
          Sender Information
        </div>

        <div style="margin-bottom:12px;">
          <div style="color:#64748b;font-size:12px;">
            Name
          </div>

          <div
            style="
              color:#0f172a;
              font-size:14px;
              font-weight:700;
            "
          >
            ${safeName}
          </div>
        </div>

        <div style="margin-bottom:12px;">
          <div style="color:#64748b;font-size:12px;">
            Email
          </div>

          <div
            style="
              color:#0f172a;
              font-size:14px;
              font-weight:700;
            "
          >
            ${safeEmail}
          </div>
        </div>

        <div>
          <div style="color:#64748b;font-size:12px;">
            Phone
          </div>

          <div
            style="
              color:#0f172a;
              font-size:14px;
              font-weight:700;
            "
          >
            ${safePhone}
          </div>
        </div>
      </div>

      <div
        style="
          margin:22px 0;
          padding:16px 18px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:10px;
        "
      >
        <div
          style="
            margin-bottom:6px;
            color:#64748b;
            font-size:11px;
            font-weight:700;
            letter-spacing:1px;
            text-transform:uppercase;
          "
        >
          Subject
        </div>

        <div
          style="
            color:#0f172a;
            font-size:15px;
            font-weight:700;
          "
        >
          ${safeSubject}
        </div>
      </div>

      <div
        style="
          margin:24px 0;
          padding:20px;
          background:#ffffff;
          border:1px solid #e2e8f0;
          border-left:4px solid #c8a951;
          border-radius:10px;
          white-space:pre-wrap;
        "
      >
        ${safeMessage}
      </div>

      <div
        style="
          margin:26px 0;
          text-align:center;
        "
      >
        <a
          href="mailto:${safeEmail}"
          class="button"
          style="
            display:inline-block;
            padding:13px 24px;
            background:#1b2847;
            color:#ffffff;
            text-decoration:none;
            border-radius:9px;
            font-size:14px;
            font-weight:700;
          "
        >
          Reply to ${safeName}
        </a>
      </div>
    `,
  });

  await sendEmail({
    to: notificationEmail,

    subject:
      `New Contact Enquiry: ${subject}`,

    html,

    replyTo: validateEmailAddress(email),
  });
}

/* =========================================================
   CONTACT REPLY EMAIL
========================================================= */

export async function sendContactReplyEmail(
  to: string,
  name: string,
  originalSubject: string,
  replyMessage: string,
): Promise<void> {
  const safeRecipient =
    validateEmailAddress(to);

  /*
   * This is important.
   *
   * When the visitor receives the response and clicks
   * "Reply" in Gmail/Outlook, the response should go
   * back to the ITMT contact/admin email.
   */
  const notificationEmail =
    getContactNotificationEmail();

  const safeName = escapeHtml(name);

  const safeSubject =
    escapeHtml(originalSubject);

  const safeReply =
    escapeHtml(replyMessage).replace(
      /\n/g,
      "<br />",
    );

  const html = emailLayout({
    title: "Response from ITMT Academy",

    preheader:
      "You have received a response from ITMT Academy.",

    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 20px;">
        Thank you for contacting ITMT Academy.
        Our team has responded to your enquiry.
      </p>

      <div
        style="
          margin:22px 0;
          padding:16px 18px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:10px;
        "
      >
        <div
          style="
            margin-bottom:6px;
            font-size:11px;
            font-weight:700;
            color:#64748b;
            text-transform:uppercase;
            letter-spacing:1px;
          "
        >
          Original Subject
        </div>

        <div
          style="
            font-size:15px;
            font-weight:700;
            color:#0f172a;
          "
        >
          ${safeSubject}
        </div>
      </div>

      <div
        style="
          margin:24px 0;
          padding:20px;
          background:#ffffff;
          border:1px solid #e2e8f0;
          border-left:4px solid #c8a951;
          border-radius:10px;
          font-size:15px;
          line-height:1.7;
          color:#334155;
        "
      >
        ${safeReply}
      </div>

      <p
        style="
          margin:22px 0 0;
          font-size:13px;
          line-height:1.6;
          color:#64748b;
        "
      >
        If you need further assistance,
        simply reply to this email and our
        team will continue the conversation.
      </p>

      <p
        style="
          margin:24px 0 0;
          color:#1b2847;
          font-size:14px;
          font-weight:700;
        "
      >
        Kind regards,<br />
        ITMT Management System
      </p>
    `,
  });

  await sendEmail({
    to: safeRecipient,

    subject:
      originalSubject.trim().toLowerCase().startsWith("re:")
        ? originalSubject.trim()
        : `Re: ${originalSubject.trim()}`,

    html,

    /*
     * Visitor replies go back to the ITMT team.
     */
    replyTo: notificationEmail,
  });
}