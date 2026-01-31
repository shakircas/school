import crypto from "crypto";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req) {
  const { email } = await req.json();
  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return NextResponse.json({ message: "If email exists, reset link sent" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save();

  const resetLink = `${process.env.AUTH_URL}/reset-password/${token}`;

  console.log("RESET LINK:", resetLink); // email later

  return NextResponse.json({ message: "Reset link sent" });
}
