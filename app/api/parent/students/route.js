import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "parent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const students = await Student.find({
    parents: session.user.id,
  });

  return NextResponse.json({ students });
}
