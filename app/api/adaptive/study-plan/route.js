import { NextResponse } from "next/server";
import StudyPlan from "@/models/StudyPlan";
import connectDB from "@/lib/db";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student");
    console.log(studentId)

    const plan = await StudyPlan.findOne({
      student: studentId,
    }).sort({ createdAt: -1 });

    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch study plan" },
      { status: 500 },
    );
  }
}
