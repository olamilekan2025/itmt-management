// import nodemailer from "nodemailer";

// let transporter: nodemailer.Transporter | null = null;

// function getTransporter(): nodemailer.Transporter {
//   if (!transporter) {
//     const user = process.env.EMAIL_USER;
//     const pass = process.env.EMAIL_APP_PASSWORD;

//     if (!user || !pass) {
//       throw new Error(
//         "EMAIL_USER or EMAIL_APP_PASSWORD is not set in .env — cannot send email.",
//       );
//     }

//     transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: { user, pass },
//     });
//   }

//   return transporter;
// }

// function getFromAddress(): string {
//   return process.env.EMAIL_USER || "";
// }

// export async function sendVerificationEmail(to: string, name: string, link: string) {
//   const transport = getTransporter();

//   await transport.sendMail({
//     from: `ITMT Management System <${getFromAddress()}>`,
//     to,
//     subject: "Verify your ITMT account email",
//     html: `
//       <p>Hi ${name},</p>
//       <p>Thanks for registering with the ITMT Management System. Please verify your email address by clicking the link below:</p>
//       <p><a href="${link}">Verify my email</a></p>
//       <p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
//     `,
//   });
// }

// export async function sendOtpEmail(to: string, name: string, otp: string) {
//   const transport = getTransporter();

//   await transport.sendMail({
//     from: `ITMT Management System <${getFromAddress()}>`,
//     to,
//     subject: "Your ITMT login code",
//     html: `
//       <p>Hi ${name},</p>
//       <p>Your one-time login code is:</p>
//       <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
//       <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
//     `,
//   });
// }

// export async function sendPasswordResetEmail(to: string, name: string, link: string) {
//   const transport = getTransporter();

//   await transport.sendMail({
//     from: `ITMT Management System <${getFromAddress()}>`,
//     to,
//     subject: "Reset your ITMT password",
//     html: `
//       <p>Hi ${name},</p>
//       <p>We received a request to reset your password. Click the link below to choose a new one:</p>
//       <p><a href="${link}">Reset my password</a></p>
//       <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
//     `,
//   });
// }


// export async function sendContactNotificationEmail(
//   name: string,
//   email: string,
//   subject: string,
//   message: string,
// ) {
//   const transport = getTransporter();
//   const notifyTo = process.env.EMAIL_USER || "";

//   await transport.sendMail({
//     from: `ITMT Management System <${getFromAddress()}>`,
//     to: notifyTo,
//     replyTo: email,
//     subject: `New contact form message: ${subject}`,
//     html: `
//       <p><strong>From:</strong> ${name} (${email})</p>
//       <p><strong>Subject:</strong> ${subject}</p>
//       <p><strong>Message:</strong></p>
//       <p>${message.replace(/\n/g, "<br />")}</p>
//     `,
//   });
// }



import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is not configured.");
}

const resend = new Resend(resendApiKey);

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM ||
    "ITMT Management System <onboarding@resend.dev>"
  );
}

async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: [to],
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error(error.message || "Failed to send email.");
  }

  console.log("Email sent successfully:", data?.id);

  return data;
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  link: string,
) {
  return sendEmail({
    to,
    subject: "Verify your ITMT account email",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 32px;
        color: #1f2937;
      ">
        <h2 style="color: #0f172a;">
          Welcome to ITMT, ${name}
        </h2>

        <p>
          Thank you for creating your ITMT Management System account.
        </p>

        <p>
          Please verify your email address by clicking the button below.
        </p>

        <p style="margin: 30px 0;">
          <a
            href="${link}"
            style="
              display: inline-block;
              background: #0f172a;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Verify Email
          </a>
        </p>

        <p style="font-size: 14px; color: #64748b;">
          If you did not create this account, you can safely ignore this email.
        </p>

        <p style="font-size: 13px; color: #94a3b8;">
          ITMT Management System
        </p>
      </div>
    `,
  });
}

export async function sendOtpEmail(
  to: string,
  name: string,
  otp: string,
) {
  return sendEmail({
    to,
    subject: "Your ITMT login verification code",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 32px;
        color: #1f2937;
      ">
        <div style="
          background: #0f172a;
          color: white;
          padding: 24px;
          border-radius: 12px 12px 0 0;
          text-align: center;
        ">
          <h1 style="margin: 0; font-size: 24px;">
            ITMT Management System
          </h1>
        </div>

        <div style="
          border: 1px solid #e5e7eb;
          border-top: none;
          padding: 32px;
          border-radius: 0 0 12px 12px;
        ">
          <h2 style="margin-top: 0;">
            Hello ${name},
          </h2>

          <p>
            Use the verification code below to complete your login:
          </p>

          <div style="
            margin: 28px 0;
            padding: 20px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            text-align: center;
          ">
            <span style="
              font-size: 32px;
              font-weight: 700;
              letter-spacing: 8px;
              color: #0f172a;
            ">
              ${otp}
            </span>
          </div>

          <p style="font-size: 14px; color: #64748b;">
            This verification code is for your ITMT account login.
            Do not share it with anyone.
          </p>

          <p style="font-size: 14px; color: #64748b;">
            If you did not attempt to log in, you can safely ignore this email.
          </p>
        </div>

        <p style="
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          margin-top: 24px;
        ">
          © ITMT Management System
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  link: string,
) {
  return sendEmail({
    to,
    subject: "Reset your ITMT password",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 32px;
        color: #1f2937;
      ">
        <h2 style="color: #0f172a;">
          Password Reset
        </h2>

        <p>
          Hello ${name},
        </p>

        <p>
          We received a request to reset your ITMT Management System password.
        </p>

        <p style="margin: 30px 0;">
          <a
            href="${link}"
            style="
              display: inline-block;
              background: #0f172a;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Reset Password
          </a>
        </p>

        <p style="font-size: 14px; color: #64748b;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendContactNotificationEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
) {
  const notifyTo = process.env.EMAIL_FROM_EMAIL || process.env.EMAIL_USER;

  if (!notifyTo) {
    throw new Error(
      "EMAIL_FROM_EMAIL or EMAIL_USER must be configured for contact notifications.",
    );
  }

  return sendEmail({
    to: notifyTo,
    replyTo: email,
    subject: `New contact form message: ${subject}`,
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 700px;
        margin: 0 auto;
        padding: 32px;
        color: #1f2937;
      ">
        <h2 style="color: #0f172a;">
          New Contact Form Message
        </h2>

        <p>
          <strong>Name:</strong> ${name}
        </p>

        <p>
          <strong>Email:</strong> ${email}
        </p>

        <p>
          <strong>Subject:</strong> ${subject}
        </p>

        <div style="
          margin-top: 24px;
          padding: 20px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        ">
          <p style="white-space: pre-wrap;">
            ${message}
          </p>
        </div>
      </div>
    `,
  });
}

