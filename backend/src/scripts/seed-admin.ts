import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";

function getArg(flag: string): string | undefined {
  const prefix = `--${flag}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match?.slice(prefix.length);
}

async function seedAdmin() {
  const name = getArg("name");
  const email = getArg("email");
  const password = getArg("password");

  if (!name || !email || !password) {
    console.error(
      "Usage: npm run seed:admin -- --name=\"Full Name\" --email=\"admin@example.com\" --password=\"YourPassword123\"",
    );
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`An account with email "${email}" already exists (role: ${existing.role}). No changes made.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin account created successfully:");
  console.log(`  Name:  ${admin.name}`);
  console.log(`  Email: ${admin.email}`);
  console.log("Log in with the password you just provided.");

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error("Seed admin failed:", error);
  process.exit(1);
});