import { NextResponse } from "next/server";
import Exam from "@/models/Exam";
import connectDB from "@/lib/db";

export async function POST(req) {
  await connectDB();

  const { academicYear } = await req.json();

  if (!academicYear) {
    return NextResponse.json(
      { error: "academicYear is required" },
      { status: 400 },
    );
  }

  const archiveCollection = `exams_archive_${academicYear.replace("-", "_")}`;

  try {
    // 1️⃣ Copy exams to archive collection
    await Exam.aggregate([
      { $match: { academicYear } },
      { $out: archiveCollection },
    ]);

    // 2️⃣ Remove from live collection
    await Exam.deleteMany({ academicYear });

    return NextResponse.json({
      message: `Exams archived successfully for ${academicYear}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to archive exams" },
      { status: 500 },
    );
  }
}
