import crypto from "crypto";

export function hashToken(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, hash: hashToken(token) };
}

export function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return { otp, hash: hashToken(otp) };
}