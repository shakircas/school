import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import Exam from "@/models/Exam";

export async function POST(req) {
  try {
    await connectDB();
    const { year, recordId } = await req.json();

    if (!year)
      return NextResponse.json({ error: "Year is required" }, { status: 400 });

    const archiveCollectionName = `exams_archive_${year.replace("-", "_")}`;
    const db = mongoose.connection.db;
    const archiveCol = db.collection(archiveCollectionName);

    // Filter: Specific exam or entire year
    const query = recordId
      ? { _id: new mongoose.Types.ObjectId(recordId) }
      : {};
    const archivedExams = await archiveCol.find(query).toArray();

    if (archivedExams.length === 0) {
      return NextResponse.json(
        { error: "No archived exams found" },
        { status: 404 },
      );
    }

    // 1. Move to Live collection
    try {
      await Exam.insertMany(archivedExams, { ordered: false });
    } catch (e) {
      console.warn("Skipping duplicates during exam restoration");
    }

    // 2. Remove from Archive
    await archiveCol.deleteMany(query);

    return NextResponse.json({
      success: true,
      message: `${archivedExams.length} exam(s) restored to the live schedule.`,
    });
  } catch (error) {
    console.error("Exam Restore Error:", error);
    return NextResponse.json({ error: "Restoration failed" }, { status: 500 });
  }
}
