import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const exists = await User.findOne({ email: body.email });
  if (exists) {
    return NextResponse.json({ error: "User exists" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(body.password, 10);

  await User.create({
    name: body.name,
    email: body.email,
    password: hashed,
    rollNumber: body.rollNumber,
    class: body.class,
    role: "student",
  });

  return NextResponse.json({ success: true });
}
