import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Student from "@/models/Student";

export async function POST(req) {
  const session = await auth();
  if (!["admin", "teacher"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const { name, email, studentIds } = await req.json();

  const password = "parent@123";
  const hashed = await bcrypt.hash(password, 10);

  const parent = await User.create({
    name,
    email,
    password: hashed,
    role: "parent",
    parentOf: studentIds,
  });

  await Student.updateMany(
    { _id: { $in: studentIds } },
    { $push: { parents: parent._id } }
  );

  return NextResponse.json({
    success: true,
    parent,
    password,
  });
}
