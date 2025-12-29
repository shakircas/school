import { NextResponse } from "next/server";
import { auth } from "@/auth";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function GET() {
  const session = await auth();
//   if (session.user.role !== "admin") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

  await connectDB();
  const users = await User.find().select("-password");

  return NextResponse.json({ users });
}
