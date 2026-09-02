import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_APP_PASSWORD;

    if (!user || !pass) {
      throw new Error(
        "EMAIL_USER or EMAIL_APP_PASSWORD is not set in .env — cannot send email.",
      );
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return transporter;
}

function getFromAddress(): string {
  return process.env.EMAIL_USER || "";
}

export async function sendVerificationEmail(to: string, name: string, link: string) {
  const transport = getTransporter();

  await transport.sendMail({
    from: `ITMT Management System <${getFromAddress()}>`,
    to,
    subject: "Verify your ITMT account email",
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for registering with the ITMT Management System. Please verify your email address by clicking the link below:</p>
      <p><a href="${link}">Verify my email</a></p>
      <p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
    `,
  });
}

export async function sendOtpEmail(to: string, name: string, otp: string) {
  const transport = getTransporter();

  await transport.sendMail({
    from: `ITMT Management System <${getFromAddress()}>`,
    to,
    subject: "Your ITMT login code",
    html: `
      <p>Hi ${name},</p>
      <p>Your one-time login code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, link: string) {
  const transport = getTransporter();

  await transport.sendMail({
    from: `ITMT Management System <${getFromAddress()}>`,
    to,
    subject: "Reset your ITMT password",
    html: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the link below to choose a new one:</p>
      <p><a href="${link}">Reset my password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}


export async function sendContactNotificationEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
) {
  const transport = getTransporter();
  const notifyTo = process.env.EMAIL_USER || "";

  await transport.sendMail({
    from: `ITMT Management System <${getFromAddress()}>`,
    to: notifyTo,
    replyTo: email,
    subject: `New contact form message: ${subject}`,
    html: `
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
    `,
  });
}