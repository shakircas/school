import { NextResponse } from "next/server";
import { auth } from "@/auth";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function PATCH(req, { params }) {
  const session = await auth();
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const body = await req.json();

  const {id} = await params

  await User.findByIdAndUpdate(id, body);
  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const { id } = await params;
  await User.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
