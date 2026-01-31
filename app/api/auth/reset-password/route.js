import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req) {
  const { token, password } = await req.json();
  await connectDB();

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 },
    );
  }

  user.password = await hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();

  return NextResponse.json({ message: "Password updated" });
}
