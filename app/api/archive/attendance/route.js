import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { academicYear } = await req.json();
    if (!academicYear) {
      return NextResponse.json(
        { error: "academicYear is required" },
        { status: 400 },
      );
    }

    console.log(academicYear);

    await connectDB();

    const [startYear, endYear] = academicYear.split("-");
    const startDate = new Date(`${startYear}-04-01`); // No "20" prefix needed
    const endDate = new Date(`${endYear}-04-01`);
    console.log(startDate, endDate);

    const archiveCollection = `attendances_${academicYear.replace("-", "_")}`;
    const db = mongoose.connection.db;

    // ✅ Safety check
    const exists = await db
      .listCollections({ name: archiveCollection })
      .toArray();

    if (exists.length > 0) {
      return NextResponse.json(
        { error: "Attendance already archived for this year" },
        { status: 409 },
      );
    }

    // 1️⃣ Copy data
    await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
        },
      },
      { $out: archiveCollection },
    ]);

    // 2️⃣ Drop indexes
    await db.collection(archiveCollection).dropIndexes();

    // 3️⃣ Delete from live
    await Attendance.deleteMany({
      date: { $gte: startDate, $lt: endDate },
    });

    return NextResponse.json({
      success: true,
      message: `Attendance archived for ${academicYear}`,
      archiveCollection,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Archiving failed" }, { status: 500 });
  }
}
