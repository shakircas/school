import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Result from "@/models/Result";

export async function POST(req) {
  await connectDB();

  const { academicYear } = await req.json();

  if (!academicYear) {
    return NextResponse.json(
      { error: "academicYear is required" },
      { status: 400 },
    );
  }

  const archiveCollection = `results_archive_${academicYear.replace("-", "_")}`;

  try {
    // 1️⃣ Copy results to archive collection
    await Result.aggregate([
      { $match: { academicYear } },
      { $out: archiveCollection },
    ]);

    // 2️⃣ Remove from live results
    await Result.deleteMany({ academicYear });

    return NextResponse.json({
      message: `Results archived successfully for ${academicYear}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to archive results" },
      { status: 500 },
    );
  }
}
