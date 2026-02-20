import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import RiskProfile from "@/models/RiskProfile";

export async function POST(req) {
  await connectDB();

  const { classId, sectionId, academicYear } = await req.json();

  const profiles = await RiskProfile.find({
    classId,
    sectionId,
    academicYear,
  }).populate("student");

  return NextResponse.json({ profiles });
}
