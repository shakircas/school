import "dotenv/config"; // Add this line at the top
import { hash } from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const MONGODB_URI = process.env.MONGODB_URI;
  
async function seedAdmin() {
  await mongoose.connect(MONGODB_URI);

  const email = "admin@gmail.com".toLowerCase();
  const password = "Aamirkhan12@";

  const existing = await User.findOne({ email });

  const hashedPassword = await hash(password, 10);

  if (existing) {
    await User.updateOne(
      { email },
      { password: hashedPassword, role: "admin" },
    );
    console.log("✅ Admin password reset");
  } else {
    await User.create({
      name: "Admin",
      email,
      password: hashedPassword,
      role: "admin",
    });
    console.log("✅ Admin created");
  }

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin();
