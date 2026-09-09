import { Resend } from "resend";

/* =========================================================
   RESEND CONFIGURATION
========================================================= */

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error(
    "RESEND_API_KEY is not configured",
  );
}

const resend = new Resend(resendApiKey);

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
   EMAIL CONFIGURATION
========================================================= */

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM ||
    "ITMT Management System <onboarding@resend.dev>"
  );
}

/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   EMAIL VALIDATION
========================================================= */

function validateEmailAddress(email: string): void {
  const normalized = email.trim();

  if (!normalized) {
    throw new Error(
      "Recipient email address is required",
    );
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalized)) {
    throw new Error(
      `Invalid recipient email address: ${email}`,
    );
  }
}

/* =========================================================
   SEND EMAIL
========================================================= */

async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  attachments,
}: SendEmailOptions): Promise<void> {
  const recipient = to.trim();
  const from = getFromAddress();

  validateEmailAddress(recipient);

  if (!subject.trim()) {
    throw new Error(
      "Email subject is required",
    );
  }

  if (!html.trim()) {
    throw new Error(
      "Email HTML content is required",
    );
  }

  console.log("[RESEND] Sending email", {
    to: recipient,
    subject,
    from,
    attachments:
      attachments?.length || 0,
  });

  try {
    const { data, error } =
      await resend.emails.send({
        from,
        to: recipient,
        subject,
        html,
        ...(replyTo?.trim()
          ? {
              replyTo: replyTo.trim(),
            }
          : {}),
        ...(attachments?.length
          ? {
              attachments: attachments.map(
                (attachment) => ({
                  filename:
                    attachment.filename,
                  content:
                    attachment.content,
                }),
              ),
            }
          : {}),
      });

    if (error) {
      console.error(
        "[RESEND] Email send failed",
        {
          to: recipient,
          subject,
          from,
          error,
        },
      );

      throw new Error(
        error.message ||
          "Resend failed to send the email",
      );
    }

    console.log(
      "[RESEND] Email accepted successfully",
      {
        id: data?.id,
        to: recipient,
        subject,
        from,
        attachments:
          attachments?.length || 0,
      },
    );
  } catch (error) {
    console.error(
      "[RESEND] Unexpected email error",
      {
        to: recipient,
        subject,
        from,
        error,
      },
    );

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "Failed to send email",
    );
  }
}

/* =========================================================
   EMAIL LAYOUT
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
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>${escapeHtml(title)}</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f4f7fb;
    font-family:Arial,Helvetica,sans-serif;
    color:#172033;
  "
>
  ${
    preheader
      ? `
        <div
          style="
            display:none;
            max-height:0;
            overflow:hidden;
            opacity:0;
            color:transparent;
          "
        >
          ${escapeHtml(preheader)}
        </div>
      `
      : ""
  }

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background:#f4f7fb;
      padding:32px 16px;
    "
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:620px;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            border:1px solid #e6eaf0;
          "
        >

          <!-- HEADER -->

          <tr>
            <td
              style="
                padding:30px 32px;
                background:#0f172a;
              "
            >
              <div
                style="
                  font-size:12px;
                  font-weight:700;
                  letter-spacing:1.8px;
                  color:#bfdbfe;
                  text-transform:uppercase;
                  margin-bottom:8px;
                "
              >
                ITMT Academy
              </div>

              <div
                style="
                  font-size:26px;
                  line-height:1.25;
                  font-weight:700;
                  color:#ffffff;
                "
              >
                ${escapeHtml(title)}
              </div>
            </td>
          </tr>

          <!-- CONTENT -->

          <tr>
            <td
              style="
                padding:34px 32px;
                font-size:15px;
                line-height:1.7;
                color:#374151;
              "
            >
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->

          <tr>
            <td
              style="
                padding:24px 32px;
                border-top:1px solid #edf0f4;
                background:#fafbfc;
              "
            >
              <div
                style="
                  font-size:13px;
                  line-height:1.6;
                  color:#6b7280;
                "
              >
                This is an automated message from the
                <strong style="color:#374151;">
                  ITMT Management System
                </strong>.
                Please do not reply to this email unless instructed.
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
   VERIFY EMAIL
========================================================= */

export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationLink: string,
): Promise<void> {
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(
    verificationLink,
  );

  const html = emailLayout({
    title: "Verify Your Email",
    preheader:
      "Verify your ITMT Management System account.",
    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 22px;">
        Thank you for registering with ITMT Management System.
        Please verify your email address to continue.
      </p>

      <div style="text-align:center;margin:30px 0;">
        <a
          href="${safeLink}"
          style="
            display:inline-block;
            padding:13px 24px;
            background:#1d4ed8;
            color:#ffffff;
            text-decoration:none;
            border-radius:9px;
            font-weight:700;
          "
        >
          Verify Email
        </a>
      </div>

      <p
        style="
          margin:0;
          font-size:13px;
          color:#6b7280;
        "
      >
        If you did not create this account, you can safely
        ignore this email.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject:
      "Verify your ITMT Management System email",
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
  const otpRecipient =
    process.env.OTP_TEST_RECIPIENT?.trim() ||
    to.trim();

  const safeName = escapeHtml(name);
  const safeOtp = escapeHtml(otp);

  console.log("[EMAIL] Sending OTP", {
    originalRecipient: to,
    actualRecipient: otpRecipient,
    redirected:
      otpRecipient.toLowerCase() !==
      to.trim().toLowerCase(),
  });

  const html = emailLayout({
    title:
      "Your Login Verification Code",
    preheader:
      "Your ITMT login verification code.",
    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 22px;">
        Use the verification code below to complete your login:
      </p>

      <div
        style="
          margin:25px 0;
          padding:20px;
          text-align:center;
          background:#f1f5f9;
          border:1px solid #e2e8f0;
          border-radius:12px;
        "
      >
        <div
          style="
            font-size:32px;
            font-weight:800;
            letter-spacing:8px;
            color:#0f172a;
          "
        >
          ${safeOtp}
        </div>
      </div>

      <p
        style="
          margin:0;
          font-size:13px;
          color:#6b7280;
        "
      >
        This code expires shortly. Never share your
        verification code with anyone.
      </p>
    `,
  });

  await sendEmail({
    to: otpRecipient,
    subject:
      "Your ITMT login verification code",
    html,
  });
}

/* =========================================================
   PASSWORD RESET / STUDENT ACTIVATION
========================================================= */

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetLink: string,
): Promise<void> {
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(resetLink);

  const html = emailLayout({
    title:
      "Activate Your Student Account",
    preheader:
      "Set your password and activate your ITMT student account.",
    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 18px;">
        Your ITMT student account has been created.
        Please use the button below to set your password
        and activate your account.
      </p>

      <div style="text-align:center;margin:30px 0;">
        <a
          href="${safeLink}"
          style="
            display:inline-block;
            padding:13px 24px;
            background:#1d4ed8;
            color:#ffffff;
            text-decoration:none;
            border-radius:9px;
            font-weight:700;
          "
        >
          Activate Account
        </a>
      </div>

      <p
        style="
          margin:0;
          font-size:13px;
          color:#6b7280;
        "
      >
        For security reasons, this activation link will expire.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject:
      "Activate your ITMT student account",
    html,
  });
}

/* =========================================================
   ADMISSION SUBMITTED
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
    title:
      "Application Submitted",
    preheader:
      `Your ITMT admission application ${applicationNumber} has been received.`,
    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 20px;">
        Thank you for applying to ITMT Academy.
        Your admission application has been successfully
        submitted and is now awaiting review.
      </p>

      <div
        style="
          margin:26px 0;
          padding:20px;
          background:#eff6ff;
          border:1px solid #bfdbfe;
          border-radius:12px;
        "
      >
        <div
          style="
            font-size:12px;
            font-weight:700;
            color:#64748b;
            text-transform:uppercase;
            letter-spacing:1px;
            margin-bottom:7px;
          "
        >
          Application Number
        </div>

        <div
          style="
            font-size:22px;
            font-weight:800;
            color:#1d4ed8;
          "
        >
          ${safeApplicationNumber}
        </div>
      </div>

      <p style="margin:0 0 12px;">
        <strong>Application Status:</strong>

        <span
          style="
            display:inline-block;
            margin-left:6px;
            padding:4px 10px;
            background:#fef3c7;
            color:#92400e;
            border-radius:999px;
            font-size:12px;
            font-weight:700;
          "
        >
          PENDING
        </span>
      </p>

      <p style="margin:20px 0 0;">
        Please keep your application number for future reference.
        You will receive another email when your application
        status changes.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject:
      `ITMT admission application received — ${applicationNumber}`,
    html,
  });
}

/* =========================================================
   ADMISSION UNDER REVIEW
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
    title:
      "Application Under Review",
    preheader:
      `Your ITMT admission application ${applicationNumber} is now under review.`,
    content: `
      <p style="margin:0 0 18px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 20px;">
        We are writing to let you know that your ITMT Academy
        admission application is now being reviewed by the
        admissions team.
      </p>

      <div
        style="
          margin:26px 0;
          padding:20px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:12px;
        "
      >
        <div
          style="
            font-size:12px;
            font-weight:700;
            color:#64748b;
            text-transform:uppercase;
            letter-spacing:1px;
            margin-bottom:7px;
          "
        >
          Application Number
        </div>

        <div
          style="
            font-size:22px;
            font-weight:800;
            color:#0f172a;
          "
        >
          ${safeApplicationNumber}
        </div>
      </div>

      <p style="margin:0 0 12px;">
        <strong>Application Status:</strong>

        <span
          style="
            display:inline-block;
            margin-left:6px;
            padding:4px 10px;
            background:#dbeafe;
            color:#1e40af;
            border-radius:999px;
            font-size:12px;
            font-weight:700;
          "
        >
          UNDER REVIEW
        </span>
      </p>

      <p style="margin:20px 0 0;">
        No action is required from you at this time.
        We will notify you when a final decision has been made.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject:
      `ITMT admission application under review — ${applicationNumber}`,
    html,
  });
}

/* =========================================================
   ADMISSION APPROVED
========================================================= */

export async function sendAdmissionApprovedEmail(
  to: string,
  name: string,
  applicationNumber: string,
  matricNumber: string,
  admissionLetterPdf?: Buffer,
  admissionLetterReference?: string,
): Promise<void> {
  const safeName = escapeHtml(name);

  const safeApplicationNumber =
    escapeHtml(applicationNumber);

  const safeMatricNumber =
    escapeHtml(matricNumber);

  const safeReference =
    escapeHtml(
      admissionLetterReference || "",
    );

  const letterSection = admissionLetterPdf
    ? `
      <div
        style="
          margin:28px 0;
          padding:20px;
          background:#eff6ff;
          border:1px solid #bfdbfe;
          border-radius:12px;
        "
      >
        <div
          style="
            font-size:12px;
            font-weight:700;
            color:#64748b;
            text-transform:uppercase;
            letter-spacing:1px;
            margin-bottom:7px;
          "
        >
          Official Admission Letter
        </div>

        <div
          style="
            font-size:14px;
            color:#374151;
            line-height:1.6;
          "
        >
          Your official ITMT admission letter has been
          generated and is attached to this email as a
          PDF document.
        </div>

        ${
          safeReference
            ? `
              <div
                style="
                  margin-top:12px;
                  font-size:13px;
                  color:#1d4ed8;
                  font-weight:700;
                "
              >
                Letter Reference:
                ${safeReference}
              </div>
            `
            : ""
        }
      </div>
    `
    : `
      <div
        style="
          margin:28px 0;
          padding:18px;
          background:#fff7ed;
          border:1px solid #fed7aa;
          border-radius:12px;
          color:#9a3412;
        "
      >
        Your admission has been approved. Your official
        admission letter will be made available through
        the student portal.
      </div>
    `;

  const html = emailLayout({
    title:
      "Admission Approved",
    preheader:
      "Congratulations! Your ITMT admission application has been approved.",
    content: `
      <p style="margin:0 0 18px;">
        Dear <strong>${safeName}</strong>,
      </p>

      <p
        style="
          margin:0 0 20px;
          font-size:17px;
          color:#166534;
          font-weight:700;
        "
      >
        Congratulations on your admission to ITMT Academy!
      </p>

      <p style="margin:0 0 22px;">
        We are pleased to inform you that your admission
        application has been approved.
      </p>

      <div
        style="
          margin:26px 0;
          padding:20px;
          background:#f0fdf4;
          border:1px solid #bbf7d0;
          border-radius:12px;
        "
      >
        <div
          style="
            font-size:12px;
            font-weight:700;
            color:#64748b;
            text-transform:uppercase;
            letter-spacing:1px;
            margin-bottom:7px;
          "
        >
          Application Number
        </div>

        <div
          style="
            font-size:20px;
            font-weight:800;
            color:#166534;
            margin-bottom:18px;
          "
        >
          ${safeApplicationNumber}
        </div>

        <div
          style="
            font-size:12px;
            font-weight:700;
            color:#64748b;
            text-transform:uppercase;
            letter-spacing:1px;
            margin-bottom:7px;
          "
        >
          Matriculation Number
        </div>

        <div
          style="
            font-size:24px;
            font-weight:800;
            color:#0f172a;
          "
        >
          ${safeMatricNumber}
        </div>
      </div>

      <p style="margin:0 0 16px;">
        <strong>Admission Status:</strong>

        <span
          style="
            display:inline-block;
            margin-left:6px;
            padding:4px 10px;
            background:#dcfce7;
            color:#166534;
            border-radius:999px;
            font-size:12px;
            font-weight:700;
          "
        >
          APPROVED
        </span>
      </p>

      ${letterSection}

      <p style="margin:22px 0 0;">
        Your student account activation instructions are also
        being sent separately. Please keep your matriculation
        number safe as it will be used to identify your student
        account.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject:
      "Congratulations! Your ITMT admission has been approved",
    html,
    ...(admissionLetterPdf
      ? {
          attachments: [
            {
              filename:
                `ITMT-Admission-Letter-${matricNumber.replace(
                  /[^a-zA-Z0-9-_]/g,
                  "-",
                )}.pdf`,
              content:
                admissionLetterPdf,
            },
          ],
        }
      : {}),
  });
}

/* =========================================================
   ADMISSION REJECTED
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

  const safeRejectionReason =
    escapeHtml(rejectionReason);

  const html = emailLayout({
    title:
      "Admission Application Update",
    preheader:
      "There has been an update to your ITMT admission application.",
    content: `
      <p style="margin:0 0 18px;">
        Dear <strong>${safeName}</strong>,
      </p>

      <p style="margin:0 0 20px;">
        Thank you for your interest in ITMT Academy.
        After reviewing your admission application, we regret
        to inform you that your application was not approved
        at this time.
      </p>

      <div
        style="
          margin:26px 0;
          padding:20px;
          background:#fef2f2;
          border:1px solid #fecaca;
          border-radius:12px;
        "
      >
        <div
          style="
            font-size:12px;
            font-weight:700;
            color:#64748b;
            text-transform:uppercase;
            letter-spacing:1px;
            margin-bottom:7px;
          "
        >
          Application Number
        </div>

        <div
          style="
            font-size:20px;
            font-weight:800;
            color:#991b1b;
            margin-bottom:18px;
          "
        >
          ${safeApplicationNumber}
        </div>

        <div
          style="
            font-size:12px;
            font-weight:700;
            color:#64748b;
            text-transform:uppercase;
            letter-spacing:1px;
            margin-bottom:7px;
          "
        >
          Status
        </div>

        <div
          style="
            font-size:18px;
            font-weight:800;
            color:#991b1b;
          "
        >
          REJECTED
        </div>
      </div>

      <div
        style="
          margin:24px 0;
          padding:18px 20px;
          background:#f8fafc;
          border-left:4px solid #94a3b8;
          border-radius:8px;
        "
      >
        <div
          style="
            font-size:12px;
            font-weight:700;
            color:#64748b;
            text-transform:uppercase;
            letter-spacing:1px;
            margin-bottom:8px;
          "
        >
          Reason
        </div>

        <div
          style="
            font-size:15px;
            line-height:1.7;
            color:#374151;
          "
        >
          ${safeRejectionReason}
        </div>
      </div>

      <p style="margin:0;">
        If you have questions regarding this decision,
        please contact the ITMT Academy admissions office.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject:
      `ITMT admission application update — ${applicationNumber}`,
    html,
  });
}

/* =========================================================
   CONTACT NOTIFICATION
========================================================= */

export async function sendContactNotificationEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
): Promise<void> {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  const html = emailLayout({
    title:
      "New Contact Message",
    preheader:
      `New contact message from ${name}.`,
    content: `
      <p style="margin:0 0 16px;">
        <strong>Name:</strong>
        ${safeName}
      </p>

      <p style="margin:0 0 16px;">
        <strong>Email:</strong>
        ${safeEmail}
      </p>

      <p style="margin:0 0 16px;">
        <strong>Subject:</strong>
        ${safeSubject}
      </p>

      <div
        style="
          margin-top:22px;
          padding:20px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:10px;
          white-space:pre-wrap;
        "
      >
        ${safeMessage}
      </div>
    `,
  });

  await sendEmail({
    to:
      process.env.CONTACT_NOTIFICATION_EMAIL ||
      getFromAddress(),
    subject:
      `New contact message: ${subject}`,
    html,
    replyTo: email,
  });
}

