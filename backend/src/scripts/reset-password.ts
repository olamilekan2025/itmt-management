import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";

function getArg(flag: string): string | undefined {
  const prefix = `--${flag}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match?.slice(prefix.length);
}

async function resetPassword() {
  const email = getArg("email");
  const password = getArg("password");

  if (!email || !password) {
    console.error(
      'Usage: npm run reset:password -- --email="user@example.com" --password="NewPassword123"',
    );
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    console.log(`No account found with email "${email}"`);
    await mongoose.disconnect();
    process.exit(0);
  }

  user.password = await bcrypt.hash(password, 12);
  await user.save();

  console.log(`Password reset for ${user.email} (role: ${user.role})`);

  await mongoose.disconnect();
  process.exit(0);
}

resetPassword().catch((error) => {
  console.error("Reset password failed:", error);
  process.exit(1);
});